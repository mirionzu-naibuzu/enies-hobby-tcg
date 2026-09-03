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
    <div className="w-full aspect-[63/88] [perspective:1000px]">
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] rounded-[17px] ${
          flipped ? "[transform:rotateY(0deg)]" : "[transform:rotateY(180deg)]"
        } ${
          isDark ? "shadow-[0_12px_40px_rgba(0,0,0,0.6)]" : "shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
        }`}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[17px] overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <img
            src={displaySrc}
            alt={alt}
            decoding="async"
            className="w-full h-full object-cover block"
            onError={() => {
              onUnavailable?.();
              if (displaySrc !== fallbackSrc) {
                setDisplaySrc(fallbackSrc);
              }
            }}
          />
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[17px] overflow-hidden">
          <img
            src={backSrc}
            alt=""
            className="w-full h-full object-cover block"
          />
        </div>
      </div>
    </div>
  );
}