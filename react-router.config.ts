import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // SPA mode — no server-side rendering.
  // All puter.js / canvas / AI calls are browser-only, so SSR would crash.
  ssr: false,
} satisfies Config;
