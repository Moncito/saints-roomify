# 🏠 Roomify

> **AI-Powered Interior Design Visualization** — Transform 2D floor plans into photorealistic 3D renderings in seconds.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Puter](https://img.shields.io/badge/Puter.js-2.2-6366F1)](https://puter.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## ✨ What is Roomify?

**Roomify** is a full-stack web application that uses **Google Gemini AI** to convert uploaded 2D floor plan images into stunning, photorealistic top-down 3D architectural renderings. Powered by the **Puter cloud platform**, it offers seamless authentication, cloud file storage, and one-click hosting for every generated design.

Whether you're an architect, interior designer, or homeowner, Roomify bridges the gap between flat blueprints and immersive visual experiences — instantly.

---

## 🚀 Features

| Feature                      | Description                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| 📸 **Floor Plan Upload**     | Drag-and-drop or click to upload JPG, PNG, or WebP images up to 50 MB                  |
| 🤖 **AI Rendering**          | One-click conversion to photorealistic 3D top-down renders via Google Gemini 2.5 Flash |
| 👁️ **Before / After Slider** | Interactive comparison view to inspect original and rendered images side by side       |
| 💾 **Project Management**    | Create, save, list, and reload design projects at any time                             |
| 👤 **Authentication**        | Secure sign-in / sign-out powered by Puter.js                                          |
| 🌐 **Auto-Hosting**          | Generated renders are automatically hosted on a public Puter subdomain                 |
| ⬇️ **Export**                | Download any rendered image as a PNG file with one click                               |
| ⚡ **SSR + HMR**             | Server-side rendering with instant hot module replacement in development               |
| 🔒 **Type-Safe**             | Fully written in TypeScript with strict mode enabled                                   |
| 📱 **Responsive UI**         | Clean, modern interface built with TailwindCSS                                         |

---

## 🧰 Tech Stack

### Frontend

- **[React 19](https://react.dev/)** — UI component framework
- **[React Router 7](https://reactrouter.com/)** — Full-stack routing with SSR
- **[TypeScript 5](https://www.typescriptlang.org/)** — Static type safety
- **[TailwindCSS 4](https://tailwindcss.com/)** — Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[React Compare Slider](https://react-compare-slider.vercel.app/)** — Before/after image comparison component

### Backend & Cloud

- **[Node.js 20](https://nodejs.org/)** — Server runtime
- **[Puter.js](https://puter.com/)** — Cloud OS SDK (auth, file system, KV store, hosting, workers)
- **[Puter Workers](https://docs.puter.com/)** — Serverless worker for project API endpoints

### AI / Machine Learning

- **[Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/)** — Image-to-image generation model
- **Puter AI API** — `txt2img` wrapper exposing Gemini capabilities

### Build & Infrastructure

- **[Vite 7](https://vitejs.dev/)** — Lightning-fast build tool and dev server
- **[Docker](https://www.docker.com/)** — Multi-stage container build for production

---

## 🗂️ Project Structure

```
saints-roomify/
├── app/
│   ├── routes/
│   │   ├── home.tsx              # Landing page & projects list
│   │   └── visualizer.$id.tsx    # 3D visualization editor
│   ├── root.tsx                  # Root layout & auth context
│   ├── app.css                   # Global styles
│   └── routes.ts                 # Route definitions
├── components/
│   ├── Navbar.tsx                # Navigation header with auth controls
│   ├── Upload.tsx                # File upload component (drag-and-drop)
│   └── ui/Button.tsx             # Reusable button component
├── lib/
│   ├── ai.action.ts              # AI rendering logic (Gemini)
│   ├── puter.action.ts           # Puter auth & project management
│   ├── puter.hosting.ts          # File hosting integration
│   ├── constants.ts              # App configuration & AI prompt
│   ├── utils.ts                  # Shared helper functions
│   └── puter.worker.js           # Puter serverless worker
├── public/                       # Static assets
├── Dockerfile                    # Multi-stage Docker build
├── vite.config.ts                # Vite configuration
├── react-router.config.ts        # React Router configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js 20+**
- **npm 9+**
- A [Puter](https://puter.com/) account (free)
- A deployed Puter Worker (for the project management API)

### 1. Clone the Repository

```bash
git clone https://github.com/Moncito/saints-roomify.git
cd saints-roomify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# URL of your deployed Puter Worker
VITE_PUTER_WORKER_URL=https://your-worker-name.puter.work
```

> **How to get this value:** Deploy the `lib/puter.worker.js` file as a Puter Worker from your Puter dashboard and copy the generated URL.

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at **`http://localhost:5173`** with hot module replacement enabled.

---

## 🏗️ Building for Production

```bash
npm run build
```

The output is placed in:

```
build/
├── client/    # Static assets served by the browser
└── server/    # Server-side rendering code
```

Start the production server:

```bash
npm run start
```

---

## 🐳 Docker Deployment

Build and run the application in a container:

```bash
# Build the image
docker build -t roomify .

# Run the container
docker run -p 3000:3000 \
  -e VITE_PUTER_WORKER_URL=https://your-worker-name.puter.work \
  roomify
```

The app will be available at **`http://localhost:3000`**.

The Docker image uses a **multi-stage build** (Alpine-based Node 20) to keep the final image lean and production-ready.

### Supported Deployment Platforms

| Platform                      | Notes                           |
| ----------------------------- | ------------------------------- |
| **AWS ECS**                   | Deploy the Docker image via ECR |
| **Google Cloud Run**          | Fully managed, scales to zero   |
| **Azure Container Apps**      | Serverless container hosting    |
| **DigitalOcean App Platform** | Simple Git-based deploys        |
| **Fly.io**                    | Global edge deployment          |
| **Railway**                   | One-click Docker deploy         |

---

## 🔌 API Reference

Project data is managed through a **Puter Worker** that exposes three endpoints:

| Method | Endpoint                    | Description                                  |
| ------ | --------------------------- | -------------------------------------------- |
| `POST` | `/api/projects/save`        | Create or update a design project            |
| `GET`  | `/api/projects/list`        | List all projects for the authenticated user |
| `GET`  | `/api/projects/get?id=<id>` | Fetch a specific project by ID               |

### Puter Services Used

```typescript
puter.auth.signIn(); // Authenticate the user
puter.auth.signOut(); // Sign out the user
puter.auth.getUser(); // Get current user info
puter.ai.txt2img(); // Run AI image generation (Gemini)
puter.fs.write(); // Write files to cloud storage
puter.fs.mkdir(); // Create directories
puter.kv.get() / kv.set(); // Key-value storage
puter.hosting.create(); // Publish a hosted subdomain
puter.workers.exec(); // Execute serverless worker functions
```

---

## 🧠 How It Works

```
User uploads a floor plan (JPG/PNG/WebP)
        │
        ▼
Image is base64-encoded and sent to the Puter AI API
        │
        ▼
Google Gemini 2.5 Flash processes the image with a
detailed architectural rendering prompt
        │
        ▼
A 1024×1024 photorealistic top-down 3D render is returned
        │
        ▼
The render and source image are saved to Puter Cloud Storage
        │
        ▼
The render is auto-hosted on a public *.puter.site subdomain
        │
        ▼
User can compare, share, or download the rendered image
```

---

## 🔑 Key Configuration

| Constant                      | Value          | Description                         |
| ----------------------------- | -------------- | ----------------------------------- |
| `IMAGE_RENDER_DIMENSION`      | `1024`         | Output render resolution (px)       |
| `HOSTING_DOMAIN_SUFFIX`       | `*.puter.site` | Auto-hosting domain suffix          |
| `REDIRECT_DELAY_MS`           | `600`          | Redirect timing after save (ms)     |
| `SHARE_STATUS_RESET_DELAY_MS` | `1500`         | Share button feedback duration (ms) |

---

## 🧪 Type Checking

Run TypeScript type validation:

```bash
npm run typecheck
```

This runs `react-router typegen` followed by `tsc` to validate all types across the project.

---

## 📦 Scripts Reference

| Script      | Command                                      | Description                  |
| ----------- | -------------------------------------------- | ---------------------------- |
| `dev`       | `react-router dev`                           | Start dev server with HMR    |
| `build`     | `react-router build`                         | Create production build      |
| `start`     | `react-router-serve ./build/server/index.js` | Start production server      |
| `typecheck` | `react-router typegen && tsc`                | Type generation + validation |

---

## 🚀 SaaS Upgrade Roadmap

The sections below describe exactly what needs to be built — and in what order — to evolve Roomify from an experimental single-user app into a commercially viable SaaS product. The core rendering and Puter integration code is **unchanged**; each phase layers new capability on top.

### Current State (v0 — Experimental)

| Area | Status | Notes |
|------|--------|-------|
| AI rendering (Gemini) | ✅ Working | Via Puter AI API |
| Cloud storage (Puter FS) | ✅ Working | Puter filesystem & KV store |
| Authentication (Puter) | ✅ Working | Puter OAuth modal |
| Project management | ✅ Working | KV-backed CRUD via Puter Worker |
| Subscription / billing | ❌ Missing | No payment gateway |
| Usage limits / quotas | ❌ Missing | No per-user enforcement |
| Database | ❌ Missing | Data lives entirely in Puter KV |
| Admin panel | ❌ Missing | No visibility into users or revenue |
| Team collaboration | ❌ Missing | Projects are single-user only |
| Custom domains / white-label | ❌ Missing | — |

---

### Phase 1 — Billing Foundation (Stripe)

> **Goal:** Charge users for Pro and Enterprise tiers. No feature gating yet — just the payment plumbing.

**What to build:**

1. **Stripe account & products** — Create three products (Free / Pro / Enterprise) in the Stripe dashboard. Add the generated Price IDs to `lib/plans.ts` (`stripeMonthlyPriceId` / `stripeYearlyPriceId`).
2. **Checkout session endpoint** — A server route (`POST /api/billing/checkout`) that calls `stripe.checkout.sessions.create()` and returns the checkout URL. Redirect the user to Stripe's hosted checkout page.
3. **Customer portal endpoint** — A server route (`POST /api/billing/portal`) to let subscribers manage their plan and payment method via Stripe's hosted portal.
4. **Webhook handler** — A server route (`POST /api/billing/webhook`) that verifies the Stripe signature and handles `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events. Write the subscription state to the database.
5. **Pricing page** — A new route (`/pricing`) that renders the three plans from `lib/plans.ts` with a "Get started" / "Upgrade" CTA button for each paid tier.

**New environment variables (see `.env.example`):**
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY
```

**Recommended libraries:** `stripe` (server), `@stripe/stripe-js` (client)

---

### Phase 2 — Database & Persistent User Records

> **Goal:** Move from Puter KV (ephemeral, per-user cloud) to a real database so you can query across users, enforce limits, and build an admin panel.

**What to build:**

1. **Choose a database** — Supabase (PostgreSQL + auth) or Neon (serverless Postgres) are the simplest choices for a React Router / SSR app. Add `DATABASE_URL` to your environment.
2. **Schema** — At minimum, create three tables:
   - `users` — `id`, `puter_user_id`, `email`, `created_at`
   - `subscriptions` — mirrors the `UserSubscription` type in `type.d.ts`
   - `usage_records` — mirrors the `UsageRecord` type in `type.d.ts`
3. **ORM setup** — Add [Drizzle ORM](https://orm.drizzle.team/) or [Prisma](https://www.prisma.io/) and generate the client.
4. **Sync on sign-in** — After a successful Puter sign-in, upsert the user row and seed a `usage_record` for the current period.

---

### Phase 3 — Usage Limits & Feature Gating

> **Goal:** Enforce the per-plan limits defined in `lib/plans.ts` so that Free users cannot generate unlimited renders.

**What to build:**

1. **Usage increment** — After every successful AI render, increment `usage_records.renders_this_period` for the user.
2. **Gate the render button** — Before calling `generate3DView()`, check whether `isWithinLimit(usage.rendersThisPeriod, plan.limits.rendersPerMonth)` (helper already in `lib/plans.ts`). If the limit is exceeded, show an "Upgrade to Pro" modal instead of triggering the AI call.
3. **Gate project creation** — Check `projectCount` against `plan.limits.projectCount` before calling `createProject()`.
4. **Storage quota** — Track `storageBytesUsed` when uploading to Puter hosting and block uploads that would exceed `plan.limits.storageGB`.
5. **Usage dashboard widget** — Add a small "X of Y renders used" progress bar to the navbar or home page so users can see their current consumption.

---

### Phase 4 — Auth Upgrade (optional)

> **Goal:** Replace Puter's OAuth modal with a standard email/password + social login flow so you own the user identity layer.

**Options (choose one):**

| Option | Pros | Cons |
|--------|------|------|
| **[Clerk](https://clerk.com/)** | Drop-in React components, no DB needed | Monthly active user pricing |
| **[Auth.js (NextAuth v5)](https://authjs.dev/)** | Open-source, works with React Router | More setup |
| **[Supabase Auth](https://supabase.com/auth)** | Free tier, integrates with Supabase DB | Vendor lock-in |
| **[Lucia](https://lucia-auth.com/)** | Lightweight, database-agnostic | Manual UI work |

**Migration path:** Keep Puter auth working in parallel while you build the new flow. Flip a feature flag (`VITE_ENABLE_NEW_AUTH`) when ready.

---

### Phase 5 — Team Collaboration

> **Goal:** Let Pro/Enterprise users share projects with team members.

**What to build:**

1. **Workspace model** — Add `workspaces` and `workspace_members` tables.
2. **Invite flow** — Email invitation via the transactional mail service (see `.env.example`).
3. **Shared project view** — Projects owned by a workspace are visible to all members.
4. **Role-based access** — `owner`, `editor`, `viewer` roles per workspace.

---

### Phase 6 — Admin Panel

> **Goal:** Give you (the operator) visibility into users, revenue, and support requests.

**What to build:**

1. **Protected `/admin` route** — Server-side role check (`role === "admin"`).
2. **User table** — List all users, their plan, usage, and subscription status.
3. **Revenue metrics** — MRR, churn, new subscribers (can use Stripe's dashboard or embed charts).
4. **Impersonation / support tools** — Temporarily view the app as a specific user.

**Recommended library:** [Tremor](https://tremor.so/) or [shadcn/ui](https://ui.shadcn.com/) for admin UI components.

---

### Recommended SaaS Tech Additions

```
Current stack          Recommended addition          Purpose
─────────────────────  ────────────────────────────  ──────────────────────────────
Puter KV               PostgreSQL (Neon / Supabase)  Persistent, queryable data
Puter Auth             Clerk or Auth.js              Owned identity layer
—                      Stripe                        Subscriptions & payments
—                      Resend / Postmark             Transactional email
—                      Drizzle ORM / Prisma          Type-safe DB queries
—                      shadcn/ui or Tremor           Admin & dashboard UI
—                      Sentry                        Error monitoring
—                      PostHog                       Product analytics & feature flags
```

> **Files already added as part of this upgrade:**
> - `.env.example` — all current + future SaaS environment variables
> - `lib/plans.ts` — subscription tier definitions with limits and Stripe price ID slots
> - `type.d.ts` — added `UserSubscription`, `UsageRecord`, `UserPlanContext`, and related types

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please make sure your code passes type checking (`npm run typecheck`) before submitting.

---

## 📄 License

This project is open source. See the repository for license details.

---

<p align="center">
  Built with ❤️ using <a href="https://reactrouter.com/">React Router</a>, <a href="https://puter.com/">Puter</a>, and <a href="https://deepmind.google/technologies/gemini/">Google Gemini</a>
</p>
