import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
    ArrowUp, Clock, Shuffle, TrendingUp, Zap,
    Heart, Upload, User, LayoutGrid,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { getFeed, upvoteProject } from "../../lib/puter.action";
import type { FeedSort } from "../../lib/puter.action";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

export function meta() {
    return [
        { title: "Feed | Roomify" },
        { name: "description", content: "Discover AI-rendered floor plans from the Roomify community" },
    ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
    const diff  = Date.now() - timestamp;
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="feed-skeleton">
            <div className="feed-skeleton-img" />
            <div className="feed-skeleton-body">
                <div className="feed-skeleton-avatar" />
                <div className="feed-skeleton-lines">
                    <div className="feed-skeleton-line feed-skeleton-line--wide" />
                    <div className="feed-skeleton-line feed-skeleton-line--narrow" />
                </div>
            </div>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onUpload, total }: { onUpload: () => void; total: number }) {
    return (
        <div className="feed-empty">
            <svg viewBox="0 0 220 150" className="feed-empty-svg" fill="none" stroke="currentColor">
                <rect x="18" y="18" width="75" height="58" strokeWidth="1.2" strokeDasharray="5 3" rx="1" />
                <rect x="93" y="18" width="48" height="29" strokeWidth="1.2" strokeDasharray="5 3" rx="1" />
                <rect x="93" y="47" width="48" height="29" strokeWidth="1.2" strokeDasharray="5 3" rx="1" />
                <rect x="141" y="18" width="61" height="58" strokeWidth="1.2" strokeDasharray="5 3" rx="1" />
                <rect x="18" y="76" width="184" height="20" strokeWidth="1.2" strokeDasharray="5 3" rx="1" />
                <text x="55"  y="50" textAnchor="middle" fontSize="7" fontFamily="monospace" strokeWidth="0" fill="currentColor" opacity="0.5">BEDROOM</text>
                <text x="117" y="35" textAnchor="middle" fontSize="6" fontFamily="monospace" strokeWidth="0" fill="currentColor" opacity="0.5">KITCHEN</text>
                <text x="117" y="64" textAnchor="middle" fontSize="6" fontFamily="monospace" strokeWidth="0" fill="currentColor" opacity="0.5">BATH</text>
                <text x="171" y="50" textAnchor="middle" fontSize="7" fontFamily="monospace" strokeWidth="0" fill="currentColor" opacity="0.5">LIVING</text>
                <text x="110" y="89" textAnchor="middle" fontSize="6" fontFamily="monospace" strokeWidth="0" fill="currentColor" opacity="0.5">HALLWAY</text>
                <line x1="18" y1="108" x2="202" y2="108" strokeWidth="0.6" opacity="0.3" />
                <line x1="18" y1="104" x2="18"  y2="112" strokeWidth="0.6" opacity="0.3" />
                <line x1="202" y1="104" x2="202" y2="112" strokeWidth="0.6" opacity="0.3" />
                <text x="110" y="120" textAnchor="middle" fontSize="5.5" fontFamily="monospace" strokeWidth="0" fill="currentColor" opacity="0.3">12 400 mm</text>
            </svg>

            <h2 className="feed-empty-title">No renders yet</h2>
            <p className="feed-empty-sub">
                Be the first to share your AI‑rendered floor plan<br />
                with the Roomify community.
            </p>

            <button className="feed-empty-cta" onClick={onUpload}>
                <Upload size={14} strokeWidth={2.2} />
                Upload your floor plan
            </button>

            <p className="feed-empty-stat">
                {total === 0
                    ? "0 renders shared so far · yours could be first"
                    : `${total} render${total !== 1 ? "s" : ""} shared`}
            </p>
        </div>
    );
}

// ── Feed card ─────────────────────────────────────────────────────────────────

function FeedCard({
    project,
    voted,
    onUpvote,
    onRemix,
}: {
    project: DesignItem;
    voted: boolean;
    onUpvote: (id: string) => void;
    onRemix: (project: DesignItem) => void;
}) {
    const [hovered, setHovered] = useState(false);

    // Both images guaranteed here because feed filters for renderedImage
    return (
        <article
            className="feed-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image / compare area */}
            <div className="feed-card-img">
                {hovered ? (
                    <ReactCompareSlider
                        defaultValue={50}
                        style={{ width: "100%", height: "100%", display: "block" }}
                        itemOne={
                            <ReactCompareSliderImage
                                src={project.sourceImage}
                                alt="Before"
                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            />
                        }
                        itemTwo={
                            <ReactCompareSliderImage
                                src={project.renderedImage!}
                                alt="After"
                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            />
                        }
                    />
                ) : (
                    <img
                        src={project.renderedImage!}
                        alt={project.name || "AI render"}
                        className="feed-card-photo"
                    />
                )}

                {/* Drag hint — only when not hovered */}
                {!hovered && (
                    <div className="feed-card-compare-hint">
                        <span>Hover to compare</span>
                    </div>
                )}

                {/* Remix badge */}
                {project.remixedFrom && (
                    <div className="feed-card-remix-badge">
                        <Shuffle size={9} strokeWidth={2.2} />
                        Remix
                    </div>
                )}
            </div>

            {/* Card body */}
            <div className="feed-card-body">
                <div className="feed-card-author">
                    <div className="feed-card-avatar">
                        {project.userName
                            ? project.userName.slice(0, 2).toUpperCase()
                            : <User size={10} />}
                    </div>
                    <span className="feed-card-username">
                        @{project.userName || "anonymous"}
                    </span>
                    <span className="feed-card-dot">·</span>
                    <span className="feed-card-time">
                        <Clock size={10} strokeWidth={1.8} />
                        {timeAgo(project.timestamp)}
                    </span>
                </div>

                <h3 className="feed-card-title">
                    {project.name || `Residence ${project.id.slice(0, 8)}`}
                </h3>

                {project.tags && project.tags.length > 0 && (
                    <div className="feed-card-tags">
                        {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="feed-card-tag">#{tag}</span>
                        ))}
                    </div>
                )}

                <div className="feed-card-actions">
                    <button
                        className={`feed-card-upvote ${voted ? "voted" : ""}`}
                        onClick={e => { e.stopPropagation(); onUpvote(project.id); }}
                        aria-label={`${voted ? "Remove upvote" : "Upvote"} — ${project.upvotes || 0} votes`}
                    >
                        <ArrowUp size={13} strokeWidth={2.5} />
                        <span>{project.upvotes || 0}</span>
                    </button>

                    <button
                        className="feed-card-remix-btn"
                        onClick={e => { e.stopPropagation(); onRemix(project); }}
                        aria-label="Remix this floor plan"
                    >
                        <Shuffle size={12} strokeWidth={2} />
                        <span>Remix</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FeedPage() {
    const navigate = useNavigate();
    const { openUpload, isSignedIn } = useOutletContext<AuthContext>();

    const [sort, setSort]               = useState<FeedSort>("new");
    const [projects, setProjects]       = useState<DesignItem[]>([]);
    const [total, setTotal]             = useState(0);
    const [cursor, setCursor]           = useState<string | null>(null);
    const [hasMore, setHasMore]         = useState(false);
    const [loading, setLoading]         = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [votedIds, setVotedIds]       = useState<Set<string>>(new Set());

    const loaderRef = useRef<HTMLDivElement>(null);
    const latestFetchRef = useRef(0);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchFeed = useCallback(async (
        sortBy: FeedSort,
        cursorVal?: string,
        append = false,
    ) => {
        const token = ++latestFetchRef.current;

        if (append) setLoadingMore(true);
        else        setLoading(true);

        try {
            const result = await getFeed({ sort: sortBy, limit: 24, cursor: cursorVal });

            // Discard stale responses
            if (token !== latestFetchRef.current) return;

            // ── KEY FIX: only keep projects with both images ──────────────────
            const completed = result.projects.filter(
                p => !!p.renderedImage && !!p.sourceImage
            );

            setProjects(prev => append ? [...prev, ...completed] : completed);
            setTotal(result.total);
            setCursor(result.nextCursor);
            setHasMore(!!result.nextCursor);
        } finally {
            if (token === latestFetchRef.current) {
                if (append) setLoadingMore(false);
                else        setLoading(false);
            }
        }
    }, []);

    // Sort change → reset + refetch
    useEffect(() => {
        setProjects([]);
        setCursor(null);
        fetchFeed(sort);
    }, [sort, fetchFeed]);

    // Infinite scroll
    useEffect(() => {
        if (!loaderRef.current || !hasMore || loadingMore) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !loadingMore && cursor) {
                    fetchFeed(sort, cursor, true);
                }
            },
            { threshold: 0.1 },
        );
        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, cursor, sort, fetchFeed]);

    // ── Upvote (optimistic) ───────────────────────────────────────────────────
    const handleUpvote = async (projectId: string) => {
        if (!isSignedIn) { openUpload(); return; }

        const wasVoted = votedIds.has(projectId);

        // Capture previous state for rollback
        const prevVotedIds = new Set(votedIds);
        const prevProject = projects.find(p => p.id === projectId);
        const prevUpvotes = prevProject?.upvotes ?? 0;

        setVotedIds(prev => {
            const next = new Set(prev);
            wasVoted ? next.delete(projectId) : next.add(projectId);
            return next;
        });
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? { ...p, upvotes: Math.max(0, (p.upvotes || 0) + (wasVoted ? -1 : 1)) }
                    : p,
            ),
        );

        const result = await upvoteProject(projectId);
        if (result) {
            setProjects(prev =>
                prev.map(p => p.id === projectId ? { ...p, upvotes: result.upvotes } : p),
            );
            setVotedIds(prev => {
                const next = new Set(prev);
                result.voted ? next.add(projectId) : next.delete(projectId);
                return next;
            });
        } else {
            // Rollback on failure
            setVotedIds(prevVotedIds);
            setProjects(prev =>
                prev.map(p =>
                    p.id === projectId ? { ...p, upvotes: prevUpvotes } : p,
                ),
            );
        }
    };

    // ── Remix ─────────────────────────────────────────────────────────────────
    const handleRemix = (project: DesignItem) => {
        if (!isSignedIn) { openUpload(); return; }
        navigate(`/visualizer/${project.id}`, {
            state: {
                initialImage:  project.sourceImage,
                initialRender: null,
                name:          `Remix of ${project.name || project.id}`,
                remixedFrom:   project.id,
            },
        });
    };

    // ── Sort tabs ─────────────────────────────────────────────────────────────
    const sortTabs: { key: FeedSort; label: string; icon: React.ReactNode }[] = [
        { key: "new", label: "New", icon: <Zap        size={12} strokeWidth={2.2} /> },
        { key: "hot", label: "Hot", icon: <TrendingUp size={12} strokeWidth={2.2} /> },
        { key: "top", label: "Top", icon: <Heart      size={12} strokeWidth={2.2} /> },
    ];

    return (
        <div className="feed-page">
            <Navbar />

            <div className="feed-inner">

                {/* Header */}
                <div className="feed-header">
                    <div className="feed-header-left">
                        <div className="feed-header-icon">
                            <LayoutGrid size={15} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h1 className="feed-title">Community Feed</h1>
                            <p className="feed-subtitle">
                                {loading
                                    ? "Loading renders…"
                                    : `${projects.length.toLocaleString()} render${projects.length !== 1 ? "s" : ""} shared`}
                            </p>
                        </div>
                    </div>

                    <div className="feed-sort">
                        {sortTabs.map(({ key, label, icon }) => (
                            <button
                                key={key}
                                className={`feed-sort-tab ${sort === key ? "active" : ""}`}
                                onClick={() => setSort(key)}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skeletons */}
                {loading && (
                    <div className="feed-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && projects.length === 0 && (
                    <EmptyState onUpload={openUpload} total={total} />
                )}

                {/* Grid — every card here has both renderedImage + sourceImage */}
                {!loading && projects.length > 0 && (
                    <>
                        <div className="feed-grid">
                            {projects.map(project => (
                                <FeedCard
                                    key={project.id}
                                    project={project}
                                    voted={votedIds.has(project.id)}
                                    onUpvote={handleUpvote}
                                    onRemix={handleRemix}
                                />
                            ))}
                        </div>

                        <div ref={loaderRef} className="feed-loader">
                            {loadingMore && (
                                <div className="feed-loader-dots">
                                    <span /><span /><span />
                                </div>
                            )}
                            {!hasMore && projects.length > 0 && (
                                <p className="feed-loader-end">
                                    You've seen all {projects.length.toLocaleString()} renders ·{" "}
                                    <button onClick={openUpload} className="feed-loader-cta">
                                        add yours
                                    </button>
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}