import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "../../lib/puter.action";
import RoomifyIntro from "../../components/RoomifyIntro";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomify | AI-first Design Environment" },
    { name: "description", content: "Welcome to Roomify, your AI-first design environment!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { openUpload } = useOutletContext<AuthContext>();

  const [projects, setProjects]       = useState<DesignItem[]>([]);
  const [introComplete, setIntroComplete] = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const isCreatingProjectRef          = useRef(false);

  const handleUploadComplete = async (base64Image: string) => {
    try {
      if (isCreatingProjectRef.current) return false;
      isCreatingProjectRef.current = true;

      const newId = Date.now().toString();
      const name  = `Residence ${newId}`;

      const newItem: DesignItem = {
        id:            newId,
        name,
        sourceImage:   base64Image,
        renderedImage: undefined,
        timestamp:     Date.now(),
      };

      const saved = await createProject({ item: newItem, visibility: "private" });

      if (!saved) {
        console.error("Failed to create project");
        return false;
      }

      setProjects(prev => [saved, ...prev]);

      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage:  saved.sourceImage,
          initialRender: saved.renderedImage || null,
          name,
        },
      });

      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const items = await getProjects();
        setProjects(items);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // ── Only show projects with a completed AI render ──────────────────────────
  const renderedProjects = projects.filter(p => !!p.renderedImage);

  return (
    <>
      <RoomifyIntro onComplete={() => setIntroComplete(true)} />

      <div
        className="home"
        style={{ opacity: introComplete ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <Navbar />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="hero">
          <div className="announce">
            <div className="dot">
              <div className="pulse" />
            </div>
            <p>Introducing Roomify 2.0</p>
          </div>

          <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

          <p className="subtitle">
            Roomify is an AI-first design environment that helps you visualize,
            render, and ship architectural projects faster than ever.
          </p>

          <div className="actions">
            <button className="cta" onClick={openUpload}>
              Start Building <ArrowRight className="icon" />
            </button>
            <Button variant="outline" size="lg" className="demo">
              Watch Demo
            </Button>
          </div>

          <div id="upload" className="upload-shell">
            <div className="grid-overlay" />
            <div className="upload-card">
              <div className="upload-head">
                <div className="upload-icon">
                  <Layers className="icon" />
                </div>
                <h3>Upload your floor plan</h3>
                <p>Supports JPG, PNG, formats up to 10MB</p>
              </div>
              <Upload onComplete={handleUploadComplete} />
            </div>
          </div>
        </section>

        {/* ── Projects ─────────────────────────────────────────────────────── */}
        <section className="projects">
          <div className="section-inner">
            <div className="section-head">
              <div className="copy">
                <h2>Your Renders</h2>
                <p>AI-generated visualizations from your uploaded floor plans.</p>
              </div>

              {renderedProjects.length > 0 && (
                <button
                  className="view-feed-btn cursor-pointer"
                  onClick={() => navigate("/feed")}
                >
                  View Community Feed <ArrowUpRight size={14} />
                </button>
              )}
            </div>

            <div className="projects-grid">

              {/* Loading skeletons */}
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="project-card project-card--skeleton">
                  <div className="preview preview--skeleton" />
                  <div className="card-body">
                    <div>
                      <div className="skeleton-line skeleton-line--wide" />
                      <div className="skeleton-line skeleton-line--narrow" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Rendered projects — renderedImage is guaranteed here */}
              {!isLoading && renderedProjects.map(({ id, name, renderedImage, timestamp }) => (
                <div
                  key={id}
                  className="project-card group"
                  onClick={() => navigate(`/visualizer/${id}`)}
                >
                  <div className="preview">
                    <img src={renderedImage!} alt={name || "AI Render"} />
                    <div className="badge">
                      <span>AI Render</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div>
                      <h3>{name || `Residence ${id}`}</h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                        <span>By You</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {!isLoading && renderedProjects.length === 0 && (
                <div className="empty">
                  <p>No renders yet — upload a floor plan to get started.</p>
                  <button className="empty-cta" onClick={openUpload}>
                    Upload floor plan
                  </button>
                </div>
              )}

            </div>
          </div>
        </section>
      </div>
    </>
  );
}