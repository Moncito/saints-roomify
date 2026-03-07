/**
 * lib/plans.ts
 *
 * Subscription plans and usage-limit configuration for the Roomify SaaS tier.
 *
 * These constants are the single source of truth for what each plan includes.
 * Wire them to your Stripe price IDs once billing is ready, and reference the
 * `limits` values wherever you enforce usage quotas in the app.
 *
 * NOTE: This file intentionally does NOT import Stripe or any payment SDK so
 * that it is safe to use on both the server and the client (via Vite).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanLimits {
    /** Maximum AI renders a user may generate per calendar month. */
    rendersPerMonth: number;
    /** Maximum total cloud storage in gigabytes. */
    storageGB: number;
    /** Maximum number of saved design projects. */
    projectCount: number;
}

export interface Plan {
    /** Unique identifier — matches the Stripe product metadata key. */
    id: "free" | "pro" | "enterprise";
    name: string;
    description: string;
    /** Prices in USD cents (0 = free). */
    price: {
        monthly: number;
        yearly: number;
    };
    /** Human-readable feature list shown on the pricing page. */
    features: string[];
    /** Machine-readable limits used to gate features at runtime. */
    limits: PlanLimits;
    /**
     * Stripe Price IDs.
     * Set these once you create the products in the Stripe dashboard.
     * Leave as empty strings until billing is wired up.
     */
    stripeMonthlyPriceId: string;
    stripeYearlyPriceId: string;
}

// ─── Plan Definitions ─────────────────────────────────────────────────────────

export const PLANS: readonly Plan[] = [
    {
        id: "free",
        name: "Free",
        description: "Explore Roomify with no commitment.",
        price: { monthly: 0, yearly: 0 },
        features: [
            "5 AI renders / month",
            "1 GB cloud storage",
            "Up to 10 saved projects",
            "PNG export",
            "Before / After comparison slider",
        ],
        limits: {
            rendersPerMonth: 5,
            storageGB: 1,
            projectCount: 10,
        },
        stripeMonthlyPriceId: "",
        stripeYearlyPriceId: "",
    },
    {
        id: "pro",
        name: "Pro",
        description: "For professional designers and architects.",
        // $29/mo · $29 × 12 = $348/yr → 20 % off = $278.40/yr (27840 cents)
        price: { monthly: 2900, yearly: 27840 },
        features: [
            "100 AI renders / month",
            "50 GB cloud storage",
            "Unlimited saved projects",
            "Priority AI queue",
            "High-resolution 2048 × 2048 exports",
            "Before / After comparison slider",
            "Public shareable links",
        ],
        limits: {
            rendersPerMonth: 100,
            storageGB: 50,
            projectCount: Infinity,
        },
        stripeMonthlyPriceId: "", // e.g. "price_1Xxx..."
        stripeYearlyPriceId: "",  // e.g. "price_1Yyy..."
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Unlimited power for teams and agencies.",
        // $99/mo · $99 × 12 = $1,188/yr → 20 % off = $950.40/yr (95040 cents)
        price: { monthly: 9900, yearly: 95040 },
        features: [
            "Unlimited AI renders",
            "500 GB cloud storage",
            "Unlimited saved projects",
            "Dedicated AI queue (fastest rendering)",
            "High-resolution 2048 × 2048 exports",
            "Team collaboration & shared workspaces",
            "Custom AI rendering prompts",
            "White-label / custom domain support",
            "Priority email & chat support",
            "SLA guarantee",
        ],
        limits: {
            rendersPerMonth: Infinity,
            storageGB: 500,
            projectCount: Infinity,
        },
        stripeMonthlyPriceId: "", // e.g. "price_1Zzz..."
        stripeYearlyPriceId: "",  // e.g. "price_1Aaa..."
    },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** The default plan assigned to every new user. */
export const FREE_PLAN = PLANS[0];

/** Look up a plan by its ID.  Returns the Free plan as a fallback. */
export function getPlanById(id: string): Plan {
    return PLANS.find((p) => p.id === id) ?? FREE_PLAN;
}

/**
 * Format a price in USD cents as a human-readable string.
 *
 * @example formatPrice(2900)  // → "$29"
 * @example formatPrice(0)     // → "Free"
 */
export function formatPrice(cents: number): string {
    if (cents === 0) return "Free";
    return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

/**
 * Returns true when the given usage value is within the plan limit.
 * Handles Infinity limits correctly.
 */
export function isWithinLimit(current: number, limit: number): boolean {
    return limit === Infinity || current < limit;
}
