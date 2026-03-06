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

| Feature | Description |
|---|---|
| 📸 **Floor Plan Upload** | Drag-and-drop or click to upload JPG, PNG, or WebP images up to 50 MB |
| 🤖 **AI Rendering** | One-click conversion to photorealistic 3D top-down renders via Google Gemini 2.5 Flash |
| 👁️ **Before / After Slider** | Interactive comparison view to inspect original and rendered images side by side |
| 💾 **Project Management** | Create, save, list, and reload design projects at any time |
| 👤 **Authentication** | Secure sign-in / sign-out powered by Puter.js |
| 🌐 **Auto-Hosting** | Generated renders are automatically hosted on a public Puter subdomain |
| ⬇️ **Export** | Download any rendered image as a PNG file with one click |
| ⚡ **SSR + HMR** | Server-side rendering with instant hot module replacement in development |
| 🔒 **Type-Safe** | Fully written in TypeScript with strict mode enabled |
| 📱 **Responsive UI** | Clean, modern interface built with TailwindCSS |

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

| Platform | Notes |
|---|---|
| **AWS ECS** | Deploy the Docker image via ECR |
| **Google Cloud Run** | Fully managed, scales to zero |
| **Azure Container Apps** | Serverless container hosting |
| **DigitalOcean App Platform** | Simple Git-based deploys |
| **Fly.io** | Global edge deployment |
| **Railway** | One-click Docker deploy |

---

## 🔌 API Reference

Project data is managed through a **Puter Worker** that exposes three endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects/save` | Create or update a design project |
| `GET` | `/api/projects/list` | List all projects for the authenticated user |
| `GET` | `/api/projects/get?id=<id>` | Fetch a specific project by ID |

### Puter Services Used

```typescript
puter.auth.signIn()         // Authenticate the user
puter.auth.signOut()        // Sign out the user
puter.auth.getUser()        // Get current user info
puter.ai.txt2img()          // Run AI image generation (Gemini)
puter.fs.write()            // Write files to cloud storage
puter.fs.mkdir()            // Create directories
puter.kv.get() / kv.set()   // Key-value storage
puter.hosting.create()      // Publish a hosted subdomain
puter.workers.exec()        // Execute serverless worker functions
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

| Constant | Value | Description |
|---|---|---|
| `IMAGE_RENDER_DIMENSION` | `1024` | Output render resolution (px) |
| `HOSTING_DOMAIN_SUFFIX` | `*.puter.site` | Auto-hosting domain suffix |
| `REDIRECT_DELAY_MS` | `600` | Redirect timing after save (ms) |
| `SHARE_STATUS_RESET_DELAY_MS` | `1500` | Share button feedback duration (ms) |

---

## 🧪 Type Checking

Run TypeScript type validation:

```bash
npm run typecheck
```

This runs `react-router typegen` followed by `tsc` to validate all types across the project.

---

## 📦 Scripts Reference

| Script | Command | Description |
|---|---|---|
| `dev` | `react-router dev` | Start dev server with HMR |
| `build` | `react-router build` | Create production build |
| `start` | `react-router-serve ./build/server/index.js` | Start production server |
| `typecheck` | `react-router typegen && tsc` | Type generation + validation |

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
