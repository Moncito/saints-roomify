import { useEffect, useRef, useState } from "react";
import { X, Layers, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { createProject } from "../lib/puter.action";

interface UploadModalProps {
  onClose: () => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadModal({ onClose }: UploadModalProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCreatingRef = useRef(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "uploading") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, onClose]);

  const processFile = async (file: File) => {
    if (isCreatingRef.current) return;

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Only JPG, PNG, or WebP files are supported.");
      setStatus("error");
      return;
    }

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 50MB.");
      setStatus("error");
      return;
    }

    isCreatingRef.current = true;
    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);

    // Simulate progress — slower to account for hosting upload time
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + 8, 80));
    }, 150);

    try {
      // Convert to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setProgress(30);

      const timestamp = Date.now();
      const newId     = timestamp.toString();
      const name      = `Residence ${newId}`;

      const newItem: DesignItem = {
        id:           newId,
        name,
        sourceImage:  base64Image,  // base64 here — createProject converts to hosted URL
        renderedImage: undefined,
        timestamp,
      };

      // createProject:
      //   1. Uploads base64 → Puter Hosting → gets real https:// URL
      //   2. Saves to user's private KV with the hosted URL
      //   3. Worker writes to global feed index with hosted URL (not base64)
      // We MUST wait for this to finish before navigating so feed gets hosted URLs
      const saved = await createProject({ item: newItem, visibility: "public" });

      clearInterval(progressIntervalRef.current!);
      progressIntervalRef.current = null;

      if (!saved) throw new Error("Failed to save project.");

      setProgress(100);
      setStatus("success");

      // Use saved.id + saved.sourceImage (real hosted URLs, not base64)
      successTimeoutRef.current = setTimeout(() => {
        onClose();
        navigate(`/visualizer/${saved.id}`, {
          state: {
            initialImage:  saved.sourceImage,          // ← hosted URL
            initialRender: saved.renderedImage || null,
            name:          saved.name || name,
          },
        });
      }, 800);

    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      isCreatingRef.current = false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleReset = () => {
    setStatus("idle");
    setFileName("");
    setProgress(0);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="upload-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "uploading") onClose();
      }}
    >
      <div className="upload-modal-panel">

        {/* Header */}
        <div className="upload-modal-header">
          <div className="upload-modal-header-left">
            <div className="upload-modal-icon">
              <Layers size={18} />
            </div>
            <div>
              <h2>Upload Floor Plan</h2>
              <p>JPG, PNG or WebP · Max 50MB</p>
            </div>
          </div>

          <button
            className="upload-modal-close"
            onClick={onClose}
            disabled={status === "uploading"}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="upload-modal-body">

          {/* IDLE — dropzone */}
          {status === "idle" && (
            <div
              className={`upload-modal-dropzone ${isDragging ? "is-dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload floor plan — drag and drop or press to browse files"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="upload-modal-input"
                onChange={handleFileChange}
              />

              <div className="upload-modal-drop-icon">
                <Upload size={24} strokeWidth={1.5} />
              </div>

              <p className="upload-modal-drop-title">
                {isDragging ? "Drop it here" : "Drag & drop your floor plan"}
              </p>
              <p className="upload-modal-drop-sub">
                or <span>browse files</span>
              </p>

              <div className="upload-modal-dots" aria-hidden="true" />
            </div>
          )}

          {/* UPLOADING */}
          {status === "uploading" && (
            <div className="upload-modal-status">
              <div className="upload-modal-status-icon uploading">
                <Upload size={22} strokeWidth={1.5} />
              </div>
              <p className="upload-modal-status-title">{fileName}</p>
              <p className="upload-modal-status-sub">
                {progress < 40
                  ? "Reading file..."
                  : progress < 85
                    ? "Uploading to hosting..."
                    : "Saving project..."}
              </p>
              <div className="upload-modal-progress">
                <div
                  className="upload-modal-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="upload-modal-progress-label">{progress}%</span>
            </div>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <div className="upload-modal-status">
              <div className="upload-modal-status-icon success">
                <CheckCircle size={22} strokeWidth={1.5} />
              </div>
              <p className="upload-modal-status-title">Upload complete!</p>
              <p className="upload-modal-status-sub">Redirecting to visualizer...</p>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="upload-modal-status">
              <div className="upload-modal-status-icon error">
                <AlertCircle size={22} strokeWidth={1.5} />
              </div>
              <p className="upload-modal-status-title">Upload failed</p>
              <p className="upload-modal-status-sub">{errorMsg}</p>
              <button className="upload-modal-retry" onClick={handleReset}>
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === "idle" && (
          <div className="upload-modal-footer">
            <span>Supported formats: JPG · PNG · WebP</span>
            <span>Your render will be shared with the community</span>
          </div>
        )}
      </div>
    </div>
  );
}