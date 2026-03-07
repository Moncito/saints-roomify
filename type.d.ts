interface AuthState {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
}

interface Material {
    id: string;
    name: string;
    thumbnail: string;
    type: "color" | "texture";
    category: "floor" | "wall" | "furniture";
}

interface DesignItem {
    id: string;
    name?: string | null;
    sourceImage: string;
    sourcePath?: string | null;
    renderedImage?: string | null;
    renderedPath?: string | null;
    publicPath?: string | null;
    timestamp: number;
    ownerId?: string | null;
    sharedBy?: string | null;
    sharedAt?: string | null;
    isPublic?: boolean;
}

interface DesignConfig {
    floor: string;
    walls: string;
    style: string;
}

enum AppStatus {
    IDLE = "IDLE",
    UPLOADING = "UPLOADING",
    PROCESSING = "PROCESSING",
    READY = "READY",
}

type RenderCompletePayload = {
    renderedImage: string;
    renderedPath?: string;
};

type VisualizerLocationState = {
    initialImage?: string;
    initialRender?: string | null;
    ownerId?: string | null;
    name?: string | null;
    sharedBy?: string | null;
};

interface VisualizerProps {
    onBack: () => void;
    initialImage: string | null;
    onRenderComplete?: (payload: RenderCompletePayload) => void;
    onShare?: (image: string) => Promise<void> | void;
    onUnshare?: (image: string) => Promise<void> | void;
    projectName?: string;
    projectId?: string;
    initialRender?: string | null;
    isPublic?: boolean;
    sharedBy?: string | null;
    canUnshare?: boolean;
}

interface UploadProps {
    onComplete: (base64File: string) => Promise<boolean | void> | boolean | void;
    className?: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
}

type AuthContext = {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
    refreshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
};

type AuthRequiredModalProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
};

type ShareAction = "share" | "unshare";
type ShareStatus = "idle" | "saving" | "done";

type HostingConfig = { subdomain: string };
type HostedAsset = { url: string };

interface StoreHostedImageParams {
    hosting: HostingConfig | null;
    url: string;
    projectId: string;
    label: "source" | "rendered";
}

interface CreateProjectParams {
    item: DesignItem;
    visibility?: "private" | "public";
}

interface Generate3DViewParams {
    sourceImage: string;
    projectId?: string | null;
}

// ─── SaaS — Subscription & Usage ─────────────────────────────────────────────

/** Mirrors the plan IDs defined in lib/plans.ts. */
type PlanId = "free" | "pro" | "enterprise";

/** Billing interval for a paid subscription. */
type BillingInterval = "monthly" | "yearly";

/** Subscription status values aligned with Stripe's subscription statuses. */
type SubscriptionStatus =
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";

/**
 * Persisted subscription record for a user.
 * Populated from the database once billing is integrated.
 */
interface UserSubscription {
    userId: string;
    planId: PlanId;
    status: SubscriptionStatus;
    interval: BillingInterval;
    /** ISO-8601 timestamp of the current period start. */
    currentPeriodStart: string;
    /** ISO-8601 timestamp of the current period end. */
    currentPeriodEnd: string;
    /** Stripe subscription ID for webhook reconciliation. */
    stripeSubscriptionId?: string | null;
    /** Stripe customer ID. */
    stripeCustomerId?: string | null;
}

/**
 * Tracks how much of a metered resource a user has consumed in the
 * current billing period.
 */
interface UsageRecord {
    userId: string;
    /** Number of AI renders generated this billing period. */
    rendersThisPeriod: number;
    /** Total cloud storage used in bytes. */
    storageBytesUsed: number;
    /** Total number of saved projects. */
    projectCount: number;
    /** ISO-8601 timestamp of the last update. */
    updatedAt: string;
}

/** Convenience bundle passed to UI components that need plan + usage context. */
interface UserPlanContext {
    subscription: UserSubscription | null;
    usage: UsageRecord | null;
    /** True when the user has an active (or trialing) paid subscription. */
    isPaid: boolean;
}