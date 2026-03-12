const PROJECT_PREFIX = 'roomify_project_';
const PUBLIC_PREFIX  = 'roomify_public_';
const VOTE_PREFIX    = 'roomify_vote_';

const userProjectPrefix = (userId) => `${PROJECT_PREFIX}${userId}_`;
const userPublicPrefix  = (userId) => `${PUBLIC_PREFIX}${userId}_`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });

const jsonError = (status, message, extra = {}) =>
    jsonResponse({ error: message, ...extra }, status);

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch {
        return null;
    }
};

const getUserName = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.username || 'anonymous';
    } catch {
        return 'anonymous';
    }
};

// Inverted timestamp so newest keys sort first lexicographically
const feedKey = (projectId, timestamp) => {
    const MAX      = 9_999_999_999_999;
    const inverted = String(MAX - timestamp).padStart(13, '0');
    return `${inverted}_${projectId}`;
};

// Check if a string is a hosted URL (not base64)
const isHostedUrl = (str) =>
    typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'));

// ── POST /api/projects/save ───────────────────────────────────────────────────

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const body       = await request.json();
        const project    = body?.project;
        const visibility = body?.visibility || 'private';

        if (!project?.id || !project?.sourceImage)
            return jsonError(400, 'Project ID and source image are required');

        const userId   = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const userName  = await getUserName(userPuter);
        const timestamp = project.timestamp || Date.now();

        const payload = {
            ...project,
            userId,
            userName,
            isPublic:  visibility === 'public',
            timestamp,
            updatedAt: new Date().toISOString(),
        };

        // 1. Always save to user's private project KV
        const privateKey = `${userProjectPrefix(userId)}${project.id}`;
        await userPuter.kv.set(privateKey, payload);

        // 2. Write to public feed index ONLY when:
        //    - visibility is "public"
        //    - BOTH sourceImage and renderedImage are real hosted URLs (not base64)
        //    - This prevents half-finished uploads from appearing in the feed
        //    - The visualizer calls save again after rendering with hosted URLs
        const shouldPublish =
            visibility === 'public' &&
            isHostedUrl(project.sourceImage) &&
            isHostedUrl(project.renderedImage);

        if (shouldPublish) {
            const fKey      = feedKey(project.id, timestamp);
            const publicKey = `${userPublicPrefix(userId)}${fKey}`;
            await userPuter.kv.set(publicKey, payload);
        }

        return jsonResponse({ saved: true, id: project.id, project: payload });
    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message || 'Unknown error' });
    }
});

// ── GET /api/projects/list — current user's own projects ─────────────────────

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const entries  = await userPuter.kv.list(userProjectPrefix(userId), true);
        const projects = entries
            .map(({ value }) => value)
            .filter(Boolean)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        return jsonResponse({ projects });
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
});

// ── GET /api/projects/feed ────────────────────────────────────────────────────

router.get('/api/projects/feed', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url    = new URL(request.url);
        const sort   = url.searchParams.get('sort')   || 'new';
        const limit  = Math.min(parseInt(url.searchParams.get('limit') || '24'), 48);
        const cursor = url.searchParams.get('cursor') || null;

        const entries = await userPuter.kv.list(userPublicPrefix(userId), true);

        let projects = entries
            .map(({ value }) => value)
            .filter(p =>
                // Double-check on the server side — only serve completed renders
                p &&
                isHostedUrl(p.sourceImage) &&
                isHostedUrl(p.renderedImage)
            );

        // Sort
        if (sort === 'hot') {
            const now = Date.now();
            projects = projects.sort((a, b) => {
                const ageA   = ((now - (a.timestamp || now)) / 3_600_000) + 2;
                const ageB   = ((now - (b.timestamp || now)) / 3_600_000) + 2;
                const scoreA = (a.upvotes || 0) / Math.pow(ageA, 1.5);
                const scoreB = (b.upvotes || 0) / Math.pow(ageB, 1.5);
                return scoreB - scoreA;
            });
        } else if (sort === 'top') {
            projects = projects.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        } else {
            projects = projects.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }

        // Cursor pagination
        let startIndex = 0;
        if (cursor) {
            const idx = projects.findIndex(p => p.id === cursor);
            if (idx !== -1) startIndex = idx + 1;
        }

        const page       = projects.slice(startIndex, startIndex + limit);
        const nextCursor = page.length === limit ? page[page.length - 1]?.id : null;

        return jsonResponse({ projects: page, nextCursor, total: projects.length });
    } catch (e) {
        return jsonError(500, 'Failed to fetch feed', { message: e.message || 'Unknown error' });
    }
});

// ── POST /api/projects/upvote ─────────────────────────────────────────────────

router.post('/api/projects/upvote', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const body      = await request.json();
        const projectId = body?.projectId;
        if (!projectId) return jsonError(400, 'Project ID is required');

        const voteKey  = `${VOTE_PREFIX}${projectId}`;
        const hasVoted = await userPuter.kv.get(voteKey);

        const entries = await userPuter.kv.list(userPublicPrefix(userId), true);
        const entry   = entries.find(({ value }) => value?.id === projectId);
        if (!entry) return jsonError(404, 'Project not found in feed');

        const project   = entry.value;
        const timestamp = project.timestamp || Date.now();
        const fKey      = feedKey(projectId, timestamp);
        const publicKey = `${userPublicPrefix(userId)}${fKey}`;

        let upvotes = project.upvotes || 0;
        let voted   = false;

        if (hasVoted) {
            upvotes = Math.max(0, upvotes - 1);
            await userPuter.kv.del(voteKey);
            voted = false;
        } else {
            upvotes += 1;
            await userPuter.kv.set(voteKey, { votedAt: new Date().toISOString() });
            voted = true;
        }

        await userPuter.kv.set(publicKey, { ...project, upvotes });

        // Sync private copy too
        const privateKey     = `${userProjectPrefix(userId)}${projectId}`;
        const privateProject = await userPuter.kv.get(privateKey);
        if (privateProject) {
            await userPuter.kv.set(privateKey, { ...privateProject, upvotes });
        }

        return jsonResponse({ upvotes, voted, projectId });
    } catch (e) {
        return jsonError(500, 'Failed to upvote', { message: e.message || 'Unknown error' });
    }
});

// ── GET /api/projects/get ─────────────────────────────────────────────────────

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id  = url.searchParams.get('id');
        if (!id) return jsonError(400, 'Project ID is required');

        const key     = `${userProjectPrefix(userId)}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return jsonResponse({ project });
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
});