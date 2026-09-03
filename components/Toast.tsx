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
      className="fixed top-0 left-0 w-full h-[320px] pointer-events-none z-[9998]"
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
        className={`impeccable-toast fixed top-5 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center gap-2.25 h-9.5 pl-2.5 pr-4 rounded-full backdrop-blur-[18px] pointer-events-none select-none whitespace-nowrap text-[13px] font-medium tracking-[-0.015em] border transition-all ${
          isDark
            ? "bg-[#121214]/90 text-[#f3f4f6] border-white/10 shadow-[0_10px_30px_-4px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "bg-white/95 text-[#111827] border-black/10 shadow-[0_10px_25px_-4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]"
        }`}
        style={{ animation: "impeccableToastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        <div
          className="w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: badgeBg, color: badgeColor }}
        >
          {icon}
        </div>
        <span className="leading-none">{toast.message}</span>
      </div>
    </>
  );
}
