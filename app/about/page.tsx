"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getColors } from "@/lib/themes";
import Sidebar from "@/components/Sidebar";
import { Heart, ExternalLink, Coffee } from "lucide-react";

const TECH_STACK = [
  { label: "Next.js",      desc: "App Router, SSR, dynamic routes",  color: "#111827", darkColor: "#f3f4f6" },
  { label: "TypeScript",   desc: "Full type safety across the app",   color: "#1d4ed8", darkColor: "#93c5fd" },
  { label: "Supabase",     desc: "Auth, database, realtime",          color: "#059669", darkColor: "#6ee7b7" },
  { label: "next-themes",  desc: "Multi-theme support with SSR",      color: "#7c3aed", darkColor: "#c4b5fd" },
  { label: "optcgapi.com", desc: "Card data source",                  color: "#b45309", darkColor: "#fcd34d" },
  { label: "Lucide React", desc: "Icon library",                      color: "#0369a1", darkColor: "#7dd3fc" },
];

const FEATURES = [
  { n: "01", title: "Card browser",      desc: "Browse every English One Piece TCG card with high-res images. Filter by set, color, type, and rarity — stack multiple filters at once." },
  { n: "02", title: "Personal binder",   desc: "Sign in to track your collection. Mark cards as owned or add them to a wishlist. Organize everything into custom named binders." },
  { n: "03", title: "Grid & list views", desc: "Switch between an image-first card grid and a compact list. Open any card for a full detail view and navigate with arrow keys." },
  { n: "04", title: "DON!! cards",       desc: "A dedicated page for all DON!! energy cards, including Gold variants, with the same binder integration as regular cards." },
  { n: "05", title: "Themes",           desc: "10 themes across 5 worlds — Light, Dark, Marineford, Thriller Bark, Alabasta, and Fishman Island. Each one is carefully tuned for readability." },
  { n: "06", title: "Always free",       desc: "No ads. No paywalls. No tracking. This project is a fan labor of love, built for the One Piece TCG community." },
];

const LINKS = [
  { label: "Browse cards",    href: "/browse" },
  { label: "Card binder",     href: "/binder" },
  { label: "DON!! cards",     href: "/don"    },
  { label: "Disclaimer",      href: "/disclaimer" },
];

export default function AboutPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const c = {
    bg:      tc.bg.primary,
    bgSec:   tc.bg.secondary,
    bgTer:   tc.bg.tertiary,
    text:    tc.text.primary,
    textSec: tc.text.secondary,
    textTer: tc.text.tertiary,
    border:  tc.border,
    accent:  tc.accent,
  };

  return (
    <div
      suppressHydrationWarning
      style={{ minHeight: "100vh", background: c.bg, color: c.text, transition: "background-color 0.3s", marginLeft: 70 }}
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp 0.5s ease forwards; }
        .fu1 { animation: fadeUp 0.5s ease 0.1s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.5s ease 0.2s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.5s ease 0.3s forwards; opacity:0; }
        .fu4 { animation: fadeUp 0.5s ease 0.4s forwards; opacity:0; }
        .nav-link:hover { color: ${c.text} !important; }
        .tech-card:hover { border-color: ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"} !important; background: ${c.bgSec} !important; }
        .footer-link:hover { color: ${c.text} !important; }
      `}</style>

      <Sidebar />

      {/* ── HERO ── */}
      <section className="fu" style={{ padding: "64px 48px 48px", borderBottom: `1px solid ${c.border}`, maxWidth: 900 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ background: c.accent, color: "#fff", fontSize: 9, fontWeight: 500, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.07em", textTransform: "uppercase" as const }}>About</span>
          <span style={{ fontSize: 11, color: c.textTer }}>Open source · Fan-made · Free forever</span>
        </div>
        <h1 style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 68, lineHeight: 0.95, letterSpacing: "0.01em", color: c.text, marginBottom: 20 }}>
          BUILT FOR<br />
          <span style={{ color: c.accent }}>COLLECTORS</span><span style={{ opacity: 0.25 }}>.</span>
        </h1>
        <p style={{ fontSize: 15, color: c.textSec, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
          Enies Hobby is a fan-made collection tracker and card browser for the One Piece Trading Card Game.
          It started as a personal project to solve a simple problem — having a fast, clean way to browse every English card —
          and grew into something with authentication, binders, themes, and a full DON!! card section.
        </p>
      </section>

      {/* ── COLOR BAND ── */}
      <div style={{ display: "flex", height: 3 }}>
        {["#ef4444","#22c55e","#3b82f6","#a855f7","#374151","#eab308"].map((col) => (
          <div key={col} style={{ flex: 1, background: col }} />
        ))}
      </div>

      {/* ── FEATURES GRID ── */}
      <section className="fu1" style={{ padding: "0", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ padding: "20px 24px 12px", borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer }}>What's inside</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.n}
              style={{
                padding: "24px",
                borderRight: (i % 3 !== 2) ? `1px solid ${c.border}` : "none",
                borderBottom: i < 3 ? `1px solid ${c.border}` : "none",
              }}
            >
              <div style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 12, color: c.textTer, marginBottom: 10, letterSpacing: "0.06em" }}>{f.n}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: c.textSec, lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE STORY + TECH ── */}
      <section className="fu2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${c.border}` }}>

        {/* Story */}
        <div style={{ padding: "28px 24px", borderRight: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer, marginBottom: 16 }}>The story</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: c.textSec, lineHeight: 1.7, margin: 0 }}>
              This started as a side project — a quick weekend thing to build a card browser without the bloat of
              existing sites. One Piece TCG was growing fast and the tooling wasn't keeping up.
            </p>
            <p style={{ fontSize: 13, color: c.textSec, lineHeight: 1.7, margin: 0 }}>
              What began as a simple grid of cards with filters slowly grew: auth came in, then binders,
              then the DON!! page, then themes inspired by the arcs of the series itself.
              Each feature was added because it was something genuinely wanted.
            </p>
            <p style={{ fontSize: 13, color: c.textSec, lineHeight: 1.7, margin: 0 }}>
              It's still growing. Deck builder, price tracking, and set completion tracking are all on the horizon.
              If you have ideas, the feedback button in the sidebar is always open.
            </p>
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ padding: "28px 24px" }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer, marginBottom: 16 }}>Built with</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TECH_STACK.map((t) => (
              <div
                key={t.label}
                className="tech-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${c.border}`,
                  background: "transparent",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? t.darkColor : t.color }}>{t.label}</span>
                <span style={{ fontSize: 12, color: c.textTer }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA SOURCE ── */}
      <section className="fu3" style={{ padding: "28px 24px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer, marginBottom: 16 }}>Card data</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 700 }}>
          <div style={{ background: c.bgSec, borderRadius: 12, padding: "16px 18px", border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 6 }}>optcgapi.com</div>
            <p style={{ fontSize: 12, color: c.textSec, lineHeight: 1.65, margin: "0 0 10px" }}>
              All card data — names, abilities, images, costs, rarities — is sourced from the community-run OPTCG API.
              Card images are hosted by their CDN.
            </p>
            <a
              href="https://optcgapi.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: c.accent, textDecoration: "none", fontWeight: 500 }}
            >
              optcgapi.com <ExternalLink size={11} />
            </a>
          </div>
          <div style={{ background: c.bgSec, borderRadius: 12, padding: "16px 18px", border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 6 }}>English only</div>
            <p style={{ fontSize: 12, color: c.textSec, lineHeight: 1.65, margin: 0 }}>
              This site only covers the English card set. Not all sets may be immediately available after release —
              the API is community-maintained and may lag behind new releases by a few days.
            </p>
          </div>
        </div>
      </section>

      {/* ── SUPPORT STRIP ── */}
      <section className="fu4" style={{ padding: "32px 24px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Heart size={14} style={{ color: "#ef4444", fill: "#ef4444" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Support this project</span>
          </div>
          <p style={{ fontSize: 13, color: c.textSec, margin: 0, maxWidth: 440, lineHeight: 1.6 }}>
            Enies Hobby is free and will always stay free. If it's saved you time hunting down card info,
            a small contribution keeps the servers running and the dev caffeinated.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="https://ko-fi.com/millionsknives47476"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "#FF5E5B", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <Coffee size={15}  />Ko-fi
          </a>
          <button
            onClick={() => router.push("/browse")}
            style={{ padding: "10px 18px", borderRadius: 10, background: "transparent", border: `1px solid ${c.border}`, color: c.text, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = c.bgSec; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Browse cards →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
                src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                alt="Enies Hobby logo"
                style={{ height: 30, width: "auto", objectFit: "contain" }}
            />
          <span style={{ fontSize: 10, color: c.textTer }}>
            Fan project · Not affiliated with Bandai ·{" "}
            <span
              onClick={() => router.push("/disclaimer")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Disclaimer
            </span>
          </span>
        </div>
        <span style={{ fontSize: 10, color: c.textTer }}>© 2026</span>
      </div>
    </div>
  );
}