"use client";

import { useEffect, useState } from "react";

interface Props {
  src?: string | null;
  alt: string;
  isLeader?: boolean;
  isDark: boolean;
  backSrc?: string;
  fallbackSrc?: string;
  onUnavailable?: () => void;
}

export default function ModalCardImage({
  src,
  alt,
  isLeader = false,
  isDark,
  backSrc: backSrcOverride,
  fallbackSrc = "/card-placeholder.png",
  onUnavailable,
}: Props) {
  const defaultBack = isLeader ? "/card-back-leader.png" : "/card-back.png";
  const backSrc = backSrcOverride ?? defaultBack;

  const targetSrc = src && src.trim() ? src : fallbackSrc;
  const [displaySrc, setDisplaySrc] = useState<string>(targetSrc);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const nextSrc = src && src.trim() ? src : fallbackSrc;
    setDisplaySrc(nextSrc);
    setFlipped(false);

    const timer = setTimeout(() => {
      setFlipped(true);
    }, 60);

    return () => clearTimeout(timer);
  }, [src, fallbackSrc]);

  return (
    <div style={{ width: "100%", aspectRatio: "63/88", perspective: "1000px" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
          borderRadius: 17,
          boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 17,
            overflow: "hidden",
            background: isDark ? "#1f2937" : "#f3f4f6",
          }}
        >
          <img
            src={displaySrc}
            alt={alt}
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => {
              onUnavailable?.();
              if (displaySrc !== fallbackSrc) {
                setDisplaySrc(fallbackSrc);
              }
            }}
          />
        </div>

        {/* Back */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 17,
            overflow: "hidden",
          }}
        >
          <img
            src={backSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}