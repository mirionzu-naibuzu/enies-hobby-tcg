"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { getColors } from "@/lib/themes";
import Sidebar from "@/components/Sidebar";
import { Heart, ExternalLink, Coffee, ArrowRight } from "lucide-react";

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
      className="about-wrapper min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 ml-17.5"
      suppressHydrationWarning
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp 0.5s ease forwards; }
        .fu1 { animation: fadeUp 0.5s ease 0.1s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.5s ease 0.2s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.5s ease 0.3s forwards; opacity:0; }
        .fu4 { animation: fadeUp 0.5s ease 0.4s forwards; opacity:0; }
      `}</style>

      <Sidebar />

      {/* ── HERO ── */}
      <section className="fu about-hero px-6 py-12 md:px-12 md:py-16 border-b border-border-theme max-w-225 leading-relaxed">
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="bg-accent-theme text-white text-[9px] font-medium px-2 py-0.5 rounded-[3px] tracking-wider uppercase">About</span>
          <span className="text-[11px] text-text-tertiary">Open source · Fan-made · Free forever</span>
        </div>
        <h1 className="about-hero-title font-display text-5xl md:text-[68px] leading-[0.95] tracking-[0.01em] text-text-primary mb-5">
          BUILT FOR<br />
          <span className="text-accent-theme">COLLECTORS</span><span className="opacity-25">.</span>
        </h1>
        <p className="text-[15px] text-text-secondary leading-relaxed max-w-140 m-0">
          Enies Hobby is a fan-made collection tracker and card browser for the One Piece Trading Card Game.
          It started as a personal project to solve a simple problem — having a fast, clean way to browse every English card —
          and grew into something with authentication, binders, themes, and a full DON!! card section.
        </p>
      </section>

      {/* ── COLOR BAND ── */}
      <div className="flex h-0.75">
        {["#ef4444","#22c55e","#3b82f6","#a855f7","#374151","#eab308"].map((col) => (
          <div key={col} className="flex-1" style={{ background: col }} />
        ))}
      </div>

      {/* ── FEATURES GRID ── */}
      <section className="fu1 border-b border-border-theme">
        <div className="px-6 py-4 border-b border-border-theme">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary">What&apos;s inside</span>
        </div>
        <div className="about-features-grid grid grid-cols-1 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.n}
              className={`p-6 ${i % 3 !== 2 ? "md:border-r border-border-theme" : ""} ${i < 3 ? "border-b border-border-theme" : ""}`}
            >
              <div className="font-display text-xs text-text-tertiary mb-2.5 tracking-wider">{f.n}</div>
              <div className="text-[13px] font-semibold text-text-primary mb-1.5">{f.title}</div>
              <div className="text-xs text-text-secondary leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE STORY + TECH ── */}
      <section className="fu2 about-story-tech grid grid-cols-1 md:grid-cols-2 border-b border-border-theme">
        {/* Story */}
        <div className="p-7 md:border-r border-border-theme">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary mb-4">The story</div>
          <div className="flex flex-col gap-3.5 text-[13px] text-text-secondary leading-relaxed">
            <p className="m-0">
              This started as a side project — a quick weekend thing to build a card browser without the bloat of
              existing sites. One Piece TCG was growing fast and the tooling wasn&apos;t keeping up.
            </p>
            <p className="m-0">
              What began as a simple grid of cards with filters slowly grew: auth came in, then binders,
              then the DON!! page, then themes inspired by the arcs of the series itself.
              Each feature was added because it was something genuinely wanted.
            </p>
            <p className="m-0">
              It&apos;s still growing. Deck builder, price tracking, and set completion tracking are all on the horizon.
              If you have ideas, the feedback button in the sidebar is always open.
            </p>
          </div>
        </div>

        {/* Tech stack */}
        <div className="p-7">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary mb-4">Built with</div>
          <div className="flex flex-col gap-1.5">
            {TECH_STACK.map((t) => (
              <div
                key={t.label}
                className="tech-card flex items-center justify-between py-2.5 px-3.5 rounded-[10px] border border-border-theme bg-transparent hover:bg-bg-secondary hover:border-text-tertiary/40 transition-colors"
              >
                <span className="text-[13px] font-semibold" style={{ color: isDark ? t.darkColor : t.color }}>{t.label}</span>
                <span className="text-xs text-text-tertiary">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA SOURCE ── */}
      <section className="fu3 p-7 border-b border-border-theme">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary mb-4">Card data</div>
        <div className="about-data-grid grid grid-cols-1 md:grid-cols-2 gap-3 max-w-175">
          <div className="bg-bg-secondary rounded-xl p-4.5 border border-border-theme">
            <div className="text-xs font-semibold text-text-primary mb-1.5">optcgapi.com</div>
            <p className="text-xs text-text-secondary leading-relaxed m-0 mb-2.5">
              All card data — names, abilities, images, costs, rarities — is sourced from the community-run OPTCG API.
              Card images are hosted by their CDN.
            </p>
            <a
              href="https://optcgapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent-theme no-underline font-medium hover:underline"
            >
              optcgapi.com <ExternalLink size={11} />
            </a>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4.5 border border-border-theme">
            <div className="text-xs font-semibold text-text-primary mb-1.5">English only</div>
            <p className="text-xs text-text-secondary leading-relaxed m-0">
              This site only covers the English card set. Not all sets may be immediately available after release —
              the API is community-maintained and may lag behind new releases by a few days.
            </p>
          </div>
        </div>
      </section>

      {/* ── SUPPORT STRIP ── */}
      <section className="fu4 about-support-strip p-7 border-b border-border-theme flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span className="text-sm font-semibold text-text-primary">Support this project</span>
          </div>
          <p className="text-[13px] text-text-secondary m-0 max-w-110 leading-relaxed">
            Enies Hobby is free and will always stay free. If it&apos;s saved you time hunting down card info,
            a small contribution keeps the servers running and the dev caffeinated.
          </p>
        </div>
        <div className="flex gap-2.5">
          <a
            href="https://ko-fi.com/millionsknives47476"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-2.5 px-4.5 rounded-[10px] bg-[#FF5E5B] text-white text-[13px] font-semibold no-underline hover:opacity-90 transition-opacity"
          >
            <Coffee size={15} />
            <span>Ko-fi</span>
          </a>
          <button
            onClick={() => router.push("/browse")}
            className="py-2.5 px-4.5 rounded-[10px] bg-transparent border border-border-theme text-text-primary text-[13px] cursor-pointer hover:bg-bg-secondary transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <span>Browse cards</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="about-footer py-4 px-6 flex items-center justify-between text-[10px] text-text-tertiary">
        <div className="flex items-center gap-4">
          <div className="relative h-7.5 w-30">
            <Image
              src="/logo-light.png"
              alt="Enies Hobby logo"
              fill
              className="object-contain"
            />
          </div>
          <span>
            Fan project · Not affiliated with Bandai ·{" "}
            <span
              onClick={() => router.push("/disclaimer")}
              className="cursor-pointer underline"
            >
              Disclaimer
            </span>
          </span>
        </div>
        <span>© 2026</span>
      </div>
    </div>
  );
}