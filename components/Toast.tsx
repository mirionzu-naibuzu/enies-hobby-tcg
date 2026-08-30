"use client";

import React, { useEffect, useRef } from "react";
import { Check, Star, Trash2, Sparkles, Info } from "lucide-react";

export type ToastType = "success" | "celebrate" | "wishlist" | "delete" | "info";

export interface ToastData {
  message: string;
  type?: ToastType;
}

interface ToastProps {
  toast: ToastData | null;
  isDark?: boolean;
}

// ── Micro Confetti Particle Engine (Lightweight Canvas, 0 external dependencies) ──
function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = 320);

    const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#a855f7", "#f43f5e", "#fbbf24"];
    const particleCount = 38;
    const startX = width / 2;
    const startY = 38;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      scaleY: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 1.6) - (Math.PI * 0.8) + (Math.PI / 2);
      const speed = 2.5 + Math.random() * 5.5;
      particles.push({
        x: startX + (Math.random() * 40 - 20),
        y: startY,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.85,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.8,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 12 - 6,
        opacity: 1,
        scaleY: 1,
      });
    }

    let startTime: number | null = null;
    const duration = 950; // ms

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gentle gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.rotationSpeed;
        p.scaleY = Math.cos(p.rotation * 0.08);

        if (progress > 0.6) {
          p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(1, p.scaleY);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      if (elapsed < duration) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 320,
        pointerEvents: "none",
        zIndex: 9998,
      }}
    />
  );
}

// ── Quieter, Refined Floating Toast Pill ──
export default function Toast({ toast, isDark = true }: ToastProps) {
  if (!toast) return null;

  const type = toast.type ?? "success";
  const isCelebrate = type === "celebrate";

  const getIconConfig = () => {
    switch (type) {
      case "celebrate":
        return {
          icon: <Sparkles size={13} strokeWidth={2.5} />,
          badgeBg: isDark ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.12)",
          badgeColor: "#f59e0b",
        };
      case "wishlist":
        return {
          icon: <Star size={12} fill="#f59e0b" color="#f59e0b" strokeWidth={2} />,
          badgeBg: isDark ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.12)",
          badgeColor: "#f59e0b",
        };
      case "delete":
        return {
          icon: <Trash2 size={12} strokeWidth={2.2} />,
          badgeBg: isDark ? "rgba(244, 63, 94, 0.18)" : "rgba(244, 63, 94, 0.12)",
          badgeColor: "#f43f5e",
        };
      case "info":
        return {
          icon: <Info size={13} strokeWidth={2.5} />,
          badgeBg: isDark ? "rgba(59, 130, 246, 0.18)" : "rgba(59, 130, 246, 0.12)",
          badgeColor: "#3b82f6",
        };
      case "success":
      default:
        return {
          icon: <Check size={12} strokeWidth={3} />,
          badgeBg: isDark ? "rgba(34, 197, 94, 0.18)" : "rgba(34, 197, 94, 0.12)",
          badgeColor: "#22c55e",
        };
    }
  };

  const { icon, badgeBg, badgeColor } = getIconConfig();

  return (
    <>
      {isCelebrate && <ConfettiBurst />}
      <div
        role="status"
        aria-live="polite"
        className="impeccable-toast"
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          height: 38,
          padding: "0 16px 0 10px",
          borderRadius: 9999,
          background: isDark
            ? "rgba(18, 18, 20, 0.88)"
            : "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.11)" : "rgba(0, 0, 0, 0.08)"
          }`,
          boxShadow: isDark
            ? "0 10px 30px -4px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
            : "0 10px 25px -4px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          color: isDark ? "#f3f4f6" : "#111827",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "-0.015em",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
          animation: "impeccableToastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: badgeBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: badgeColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span style={{ lineHeight: 1 }}>{toast.message}</span>
      </div>
    </>
  );
}
