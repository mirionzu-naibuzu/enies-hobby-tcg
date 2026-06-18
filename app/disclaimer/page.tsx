"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ChevronLeft } from "lucide-react";

/* ─────────────────────────────────────────────
   THEMES
───────────────────────────────────────────── */

export type ThemeColors = {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  accent: string;
  isDark: boolean;
};

const THEMES: Record<string, ThemeColors> = {
  light: {
    bg: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
    text: {
      primary: "#111827",
      secondary: "#4b5563",
      tertiary: "#6b7280",
    },
    border: "#e5e7eb",
    accent: "#ef4444",
    isDark: false,
  },

  dark: {
    bg: {
      primary: "#111827",
      secondary: "#1f2937",
      tertiary: "#374151",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
    },
    border: "#374151",
    accent: "#ef4444",
    isDark: true,
  },

  "marineford-light": {
    bg: {
      primary: "#f0f4f8",
      secondary: "#e2eaf2",
      tertiary: "#ccdbe8",
    },
    text: {
      primary: "#1a3a5c",
      secondary: "#2d5a8a",
      tertiary: "#5a85aa",
    },
    border: "#b8d0e8",
    accent: "#1e6091",
    isDark: false,
  },

  "marineford-dark": {
    bg: {
      primary: "#0d1b2a",
      secondary: "#132336",
      tertiary: "#1a2f45",
    },
    text: {
      primary: "#e8f2fa",
      secondary: "#a8c8e8",
      tertiary: "#5a85aa",
    },
    border: "#1e3a55",
    accent: "#2980b9",
    isDark: true,
  },

  "thrillerbark-light": {
    bg: {
      primary: "#f5f0ff",
      secondary: "#ede8fa",
      tertiary: "#e0d8f5",
    },
    text: {
      primary: "#2d1b69",
      secondary: "#4c3a8a",
      tertiary: "#7c6aaa",
    },
    border: "#c8b8f0",
    accent: "#7c3aed",
    isDark: false,
  },

  "thrillerbark-dark": {
    bg: {
      primary: "#0f0a1a",
      secondary: "#18102e",
      tertiary: "#221840",
    },
    text: {
      primary: "#f0ebff",
      secondary: "#c4b5fd",
      tertiary: "#7c6aaa",
    },
    border: "#2d1b55",
    accent: "#7c3aed",
    isDark: true,
  },

  "alabasta-light": {
    bg: {
      primary: "#fffbf0",
      secondary: "#fdf4d8",
      tertiary: "#f9e8a8",
    },
    text: {
      primary: "#3d2800",
      secondary: "#7a5c00",
      tertiary: "#a07830",
    },
    border: "#e8c858",
    accent: "#d97706",
    isDark: false,
  },

  "alabasta-dark": {
    bg: {
      primary: "#17130c",
      secondary: "#211a10",
      tertiary: "#2c2318",
    },
    text: {
      primary: "#ede0c4",
      secondary: "#c4a06a",
      tertiary: "#8a6e48",
    },
    border: "#3a2e1a",
    accent: "#c8850a",
    isDark: true,
  },

  "fishman-light": {
    bg: {
      primary: "#f0f9ff",
      secondary: "#ddf0fa",
      tertiary: "#b8e4f5",
    },
    text: {
      primary: "#0a2c42",
      secondary: "#1a5a80",
      tertiary: "#3a8aaa",
    },
    border: "#88c8e8",
    accent: "#0891b2",
    isDark: false,
  },

  "fishman-dark": {
    bg: {
      primary: "#030e18",
      secondary: "#071826",
      tertiary: "#0c2435",
    },
    text: {
      primary: "#e0f5ff",
      secondary: "#7ac8ea",
      tertiary: "#3a8aaa",
    },
    border: "#0c2435",
    accent: "#0ea5e9",
    isDark: true,
  },
};

export function getColors(
  theme: string | undefined,
  mounted: boolean
): ThemeColors {
  if (!mounted) return THEMES.light;
  return THEMES[theme ?? "light"] ?? THEMES.light;
}

/* ─────────────────────────────────────────────
   CONTENT
───────────────────────────────────────────── */

const SECTIONS = [
  {
    title: "Fan Project",
    body: "Enies Hobby TCG is an unofficial, non-commercial fan project created for personal and community use. It is not affiliated with, endorsed by, sponsored by, or connected to Bandai Co., Ltd., Toei Animation, or Eiichiro Oda in any way.",
  },
  {
    title: "Intellectual Property",
    body: "One Piece and all related characters, card names, artwork, and game mechanics are trademarks and copyrights of Bandai Co., Ltd. and Eiichiro Oda / Shueisha. All card images displayed on this site are the property of their respective owners and are used here purely for fan reference purposes with no commercial intent.",
  },
  {
    title: "No Commercial Use",
    body: "This website does not charge fees, sell cards, generate revenue, or monetize card images or game content in any way. No official assets are redistributed or downloaded through this platform.",
  },
  {
    title: "Account & Data",
    body: "Authentication and user data (collection tracking, binder contents) are stored securely via Supabase. We do not sell, share, or use your personal data for any purpose other than providing the service.",
  },
  {
    title: "Accuracy",
    body: "Card data is sourced from community APIs and may be incomplete, outdated, or inaccurate. We make no guarantees about the correctness of card text, rulings, or set information.",
  },
  {
    title: "Use at Your Own Risk",
    body: "This service is provided as-is with no warranties of any kind. We are not responsible for any loss of data, service interruptions, or inaccuracies.",
  },
  {
    title: "Takedown / DMCA",
    body: "If you are a rights holder and believe any content on this site infringes your intellectual property, please contact us and we will address it promptly.",
  },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function DisclaimerPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const c = getColors(theme, mounted);

  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        background: c.bg.primary,
        color: c.text.primary,
        marginLeft: 70,
        transition: "all 0.3s ease",
      }}
    >
      <Sidebar />

      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(12px)",
          background: `${c.bg.primary}cc`,
          borderBottom: `1px solid ${c.border}`,
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: c.text.secondary,
            fontSize: 13,
            padding: 0,
            transition: "opacity 0.2s",
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div
          style={{
            width: 1,
            height: 16,
            background: c.border,
          }}
        />

        <span
          style={{
            fontSize: 13,
            color: c.text.tertiary,
          }}
        >
          Legal
        </span>
      </div>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "64px 32px 96px",
        }}
      >
        {/* HERO */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: c.accent,
              marginBottom: 16,
            }}
          >
            Disclaimer
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              marginBottom: 18,
              color: c.text.primary,
            }}
          >
            Terms & Conditions
          </h1>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: c.text.secondary,
              maxWidth: 560,
            }}
          >
            Please read the following before using Enies Hobby TCG.
            By using this site you acknowledge and agree to the
            terms below.
          </p>

          <div
            style={{
              marginTop: 24,
              fontSize: 12,
              color: c.text.tertiary,
            }}
          >
            Last updated · May 2026
          </div>
        </div>

        {/* DIVIDER */}
        <div
          style={{
            height: 1,
            background: c.border,
            marginBottom: 52,
          }}
        />

        {/* SECTIONS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 44,
          }}
        >
          {SECTIONS.map((s, i) => (
            <div
              key={s.title}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: c.text.tertiary,
                  paddingTop: 3,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: c.text.primary,
                    marginBottom: 10,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.title}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.85,
                    color: c.text.secondary,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER CARD */}
        <div
          style={{
            marginTop: 72,
            padding: "24px 26px",
            borderRadius: 18,
            background: c.bg.secondary,
            border: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.8,
              color: c.text.secondary,
            }}
          >
            <strong style={{ color: c.text.primary }}>
              One Piece TCG
            </strong>{" "}
            © Bandai Co., Ltd. · One Piece © Eiichiro Oda /
            Shueisha · Enies Hobby TCG is an independent fan
            project with no commercial affiliation.
          </div>
        </div>
      </div>
    </div>
  );
}