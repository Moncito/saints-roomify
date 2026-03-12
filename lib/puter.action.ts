import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

export const signIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export type FeedSort = 'new' | 'hot' | 'top';

export interface FeedResult {
    projects: DesignItem[];
    nextCursor: string | null;
    total: number;
}

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
};

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams):
    Promise<DesignItem | null | undefined> => {

    if (!PUTER_WORKER_URL) {
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
        return null;
    }

    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting({
            hosting, url: item.sourceImage, projectId, label: 'source',
        }) : null;

    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({
            hosting, url: item.renderedImage, projectId, label: 'rendered',
        }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
        ? item.sourceImage
        : ''
    );

    if (!resolvedSource) {
        console.warn('Failed to host source image, skipping save.');
        return null;
    }

    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        isPublic: visibility === "public",
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
    };

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',
            body: JSON.stringify({
                project: payload,
                visibility
            })
        });

        if (!response.ok) {
            console.error('failed to save the project', await response.text());
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null };

        return data?.project ?? null;
    } catch (e) {
        console.log('Failed to create project', e);
        return null;
    }
};

export const getProjects = async () => {
    if (!PUTER_WORKER_URL) {
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
        return [];
    }

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/list`,
            { method: 'GET' }
        );

        if (!response.ok) {
            console.error('Failed to fetch history', await response.text());
            return [];
        }

        const data = (await response.json()) as { projects?: DesignItem[] | null };

        return Array.isArray(data?.projects) ? data?.projects : [];
    } catch (e) {
        console.error('Failed to get projects', e);
        return [];
    }
};

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};

export const getFeed = async ({
    sort = 'new',
    limit = 24,
    cursor,
}: {
    sort?: FeedSort;
    limit?: number;
    cursor?: string;
}): Promise<FeedResult> => {
    if (!PUTER_WORKER_URL) {
        console.warn('Missing VITE_PUTER_WORKER_URL; skipping feed fetch.');
        return { projects: [], nextCursor: null, total: 0 };
    }

    try {
        const params = new URLSearchParams({ sort, limit: String(limit) });
        if (cursor) params.set('cursor', cursor);

        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/feed?${params.toString()}`,
            { method: 'GET' },
        );

        if (!response.ok) {
            console.error('Failed to fetch feed:', await response.text());
            return { projects: [], nextCursor: null, total: 0 };
        }

        const data = (await response.json()) as FeedResult;
        return data;
    } catch (e) {
        console.error('Failed to fetch feed:', e);
        return { projects: [], nextCursor: null, total: 0 };
    }
};

export const upvoteProject = async (projectId: string): Promise<{
    upvotes: number;
    voted: boolean;
} | null> => {
    if (!PUTER_WORKER_URL) return null;

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/upvote`,
            {
                method: 'POST',
                body: JSON.stringify({ projectId }),
            },
        );

        if (!response.ok) {
            console.error('Failed to upvote:', await response.text());
            return null;
        }

        return await response.json();
    } catch (e) {
        console.error('Failed to upvote:', e);
        return null;
    }
};