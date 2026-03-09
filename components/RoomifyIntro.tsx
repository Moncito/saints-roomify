import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface RoomifyIntroProps {
  onComplete?: () => void;
}

export default function RoomifyIntro({ onComplete }: RoomifyIntroProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const versionRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("roomify_intro_seen")) {
      setDone(true);
      onComplete?.();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("roomify_intro_seen", "1");
          setDone(true);
          onComplete?.();
        },
      });

      // — Initial states —
      gsap.set([topPanelRef.current, bottomPanelRef.current], { yPercent: 0 });
      gsap.set(logoRef.current, { opacity: 0, y: 12 });
      gsap.set(versionRef.current, { opacity: 0 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(taglineRef.current, { opacity: 0 });

      // 1. Logo rises in
      tl.to(logoRef.current, {
        opacity: 1, y: 0,
        duration: 0.7, ease: "power3.out",
      });

      // 2. Orange line draws left → right
      tl.to(lineRef.current, {
        scaleX: 1,
        duration: 0.55, ease: "power2.inOut",
      }, "-=0.1");

      // 3. Version tag fades in
      tl.to(versionRef.current, {
        opacity: 1,
        duration: 0.4, ease: "power2.out",
      }, "-=0.2");

      // 4. Tagline fades in
      tl.to(taglineRef.current, {
        opacity: 1,
        duration: 0.5, ease: "power2.out",
      }, "-=0.1");

      // 5. Hold
      tl.to({}, { duration: 0.95 });

      // 6. Content fades out
      tl.to([logoRef.current, versionRef.current, lineRef.current, taglineRef.current], {
        opacity: 0,
        duration: 0.35, ease: "power2.in",
      });

      // 7. Curtain splits — top goes up, bottom goes down
      tl.to(topPanelRef.current, {
        yPercent: -100,
        duration: 0.75, ease: "power4.inOut",
      }, "-=0.05")
        .to(bottomPanelRef.current, {
          yPercent: 100,
          duration: 0.75, ease: "power4.inOut",
        }, "<");

    }, wrapRef);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* Top curtain panel */}
      <div
        ref={topPanelRef}
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "50%",
          background: "#f5f0e8",
          pointerEvents: "all",
        }}
      />

      {/* Bottom curtain panel */}
      <div
        ref={bottomPanelRef}
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "50%",
          background: "#f5f0e8",
          pointerEvents: "all",
        }}
      />

      {/* Centered content — sits between the two panels */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Wordmark */}
        <div
          ref={logoRef}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            opacity: 0,
          }}
        >
          {/* Cube icon — mirrors your navbar logo */}
          <svg
            width="32" height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: 2 }}
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>

          <span style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>
            Roomify
          </span>

          <span
            ref={versionRef}
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(11px, 1.4vw, 14px)",
              color: "#e87722",
              letterSpacing: "0.08em",
              opacity: 0,
              paddingBottom: 6,
            }}
          >
            — 2.0
          </span>
        </div>

        {/* Orange rule */}
        <div
          ref={lineRef}
          style={{
            width: "clamp(180px, 28vw, 360px)",
            height: "1.5px",
            background: "#e87722",
            marginTop: 20,
            marginBottom: 18,
          }}
        />

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{
            fontFamily: "monospace",
            fontSize: "clamp(9px, 1.1vw, 11px)",
            color: "#999",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            margin: 0,
            opacity: 0,
          }}
        >
          AI · First · Design · Environment
        </p>
      </div>
    </div>
  );
}