"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getAllCards } from "@/lib/api";
import { Card } from "@/types/card";

const SETS = [
  "OP01","OP02","OP03","OP04","OP05","OP06","OP07","OP08","OP09",
  "ST-01","ST-02","ST-03","EB01","PRB01",
];

const STACK_META = [
  { color: "#ef4444", darkBg: "#7f1d1d", bg: "#fff1f2", rarityColor: "#991b1b", rarityBg: "#fee2e2", rot: -8, top: 0,  left: 0,   z: 1, cls: "card-a" },
  { color: "#3b82f6", darkBg: "#0c2340", bg: "#eff6ff", rarityColor: "#6d28d9", rarityBg: "#ede9fe", rot:  2, top: 32, left: 130, z: 3, cls: "card-b" },
  { color: "#a855f7", darkBg: "#3f0f5c", bg: "#faf5ff", rarityColor: "#1d4ed8", rarityBg: "#dbeafe", rot: 11, top: 12, left: 256, z: 1, cls: "card-c" },
];

const RARITIES = [
  { label: "SEC", name: "Secret",     color: "#991b1b", bg: "#fee2e2" },
  { label: "SR",  name: "Super Rare", color: "#6d28d9", bg: "#ede9fe" },
  { label: "R",   name: "Rare",       color: "#1d4ed8", bg: "#dbeafe" },
  { label: "UC",  name: "Uncommon",   color: "#065f46", bg: "#d1fae5" },
  { label: "C",   name: "Common",     color: "#6b7280", bg: "#f3f4f6" },
  { label: "SP",  name: "SP Card",    color: "#9d174d", bg: "#fce7f3" },
  { label: "TR",  name: "Trophy",     color: "#0369a1", bg: "#e0f2fe" },
  { label: "P",   name: "Promo",      color: "#b45309", bg: "#fef3c7" },
];

const CARD_PREVIEWS = [
  { color: "#ef4444", bg: "#fff1f2", border: "rgba(239,68,68,0.25)",  darkBg: "#7f1d1d", label: "Monkey D. Luffy", type: "LEADER",    rarity: "SEC", rarityColor: "#991b1b", rarityBg: "#fee2e2", icon: "⚓" },
  { color: "#3b82f6", bg: "#eff6ff", border: "rgba(59,130,246,0.25)", darkBg: "#0c2340", label: "Roronoa Zoro",    type: "CHARACTER", rarity: "SR",  rarityColor: "#6d28d9", rarityBg: "#ede9fe", icon: "🃏" },
  { color: "#a855f7", bg: "#faf5ff", border: "rgba(168,85,247,0.25)", darkBg: "#3f0f5c", label: "Nami",            type: "EVENT",     rarity: "R",   rarityColor: "#1d4ed8", rarityBg: "#dbeafe", icon: "⚡" },
  { color: "#22c55e", bg: "#f0fdf4", border: "rgba(34,197,94,0.25)",  darkBg: "#14532d", label: "Wano",            type: "STAGE",     rarity: "UC",  rarityColor: "#065f46", rarityBg: "#d1fae5", icon: "🏝️" },
  { color: "#eab308", bg: "#fefce8", border: "rgba(234,179,8,0.25)",  darkBg: "#54381e", label: "Sanji",           type: "CHARACTER", rarity: "C",   rarityColor: "#6b7280", rarityBg: "#f3f4f6", icon: "🃏" },
  { color: "#374151", bg: "#f9fafb", border: "rgba(55,65,81,0.2)",    darkBg: "#1f2937", label: "Barrier",         type: "EVENT",     rarity: "SR",  rarityColor: "#6d28d9", rarityBg: "#ede9fe", icon: "⚡" },
];

export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stackCards, setStackCards] = useState<Card[]>([]);
  const [previewCards, setPreviewCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    getAllCards().then((cards) => {
      const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

      // Stack: random 3 high-rarity (SR/SP/SEC) LEADER or CHARACTER cards with images
      const highRarity = cards.filter((c) => {
        const r = c.rarity?.replace(/\s+CARD\s*$/i, "").trim() ?? "";
        const normalized = c.name?.includes("(SP)") ? "SP" : r;
        return (
          ["SR", "SP", "SEC"].includes(normalized) &&
          ["LEADER", "CHARACTER"].includes(c.type?.toUpperCase() ?? "") &&
          !!c.images?.large
        );
      });
      setStackCards(shuffle(highRarity).slice(0, 3) as Card[]);

      // Preview: random 6 cards with images
      const withImages = cards.filter((c) => !!c.images?.small);
      setPreviewCards(shuffle(withImages).slice(0, 6));
    });

    // Keyboard navigation for modal
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelectedCard(null); setSelectedIndex(-1); }
      if (e.key === "ArrowRight") setSelectedIndex((prev) => { const next = Math.min(prev + 1, previewCards.length - 1); setSelectedCard(previewCards[next] ?? null); return next; });
      if (e.key === "ArrowLeft")  setSelectedIndex((prev) => { const next = Math.max(prev - 1, 0); setSelectedCard(previewCards[next] ?? null); return next; });
    };
    window.addEventListener("keydown", handleKey);

    return () => { listener.subscription.unsubscribe(); window.removeEventListener("keydown", handleKey); };
  }, []);

  const isDark = mounted && theme === "dark";

  const c = {
    bg:      isDark ? "#111827" : "#ffffff",
    bgSec:   isDark ? "#1f2937" : "#f9fafb",
    bgTer:   isDark ? "#374151" : "#f3f4f6",
    text:    isDark ? "#f3f4f6" : "#111827",
    textSec: isDark ? "#9ca3af" : "#6b7280",
    textTer: isDark ? "#6b7280" : "#9ca3af",
    border:  isDark ? "#374151" : "#e5e7eb",
  };

  const openAuth = (mode: "login" | "signup") => { setAuthMode(mode); setShowAuth(true); };
  const handleBrowse = (set?: string) => router.push(set ? `/browse?set=${set}` : "/browse");

  return (
    <div
      suppressHydrationWarning
      style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70, transition: "background-color 0.3s" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes floatA { 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(-8deg) translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:rotate(2deg)  translateY(0)} 50%{transform:rotate(2deg)  translateY(-7px)}  }
        @keyframes floatC { 0%,100%{transform:rotate(11deg) translateY(0)} 50%{transform:rotate(11deg) translateY(-12px)} }
        .card-a { animation: floatA 4s   ease-in-out infinite; }
        .card-b { animation: floatB 4.6s ease-in-out infinite 0.4s; }
        .card-c { animation: floatC 5.2s ease-in-out infinite 0.8s; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp 0.55s ease forwards; }
        .fu1 { animation: fadeUp 0.55s ease 0.1s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.55s ease 0.2s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.55s ease 0.3s forwards; opacity:0; }
        .set-pill:hover  { border-color: ${c.text}  !important; color: ${c.text}  !important; }
        .rar-cell:hover  { border-color: ${c.textSec} !important; }
        .strip-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,0.14); }
        .strip-card { transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary:hover  { opacity: 0.85; }
        .btn-secondary:hover { background: ${c.bgTer} !important; }
        .nav-link:hover { color: ${c.text} !important; }
      `}</style>

      <Sidebar />

      {/* NAV */}
      <header style={{ background: c.bgSec, borderBottom: `1px solid ${c.border}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20, transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <span style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 22, letterSpacing: "0.05em", color: c.text }}>
            OP<span style={{ color: "#ef4444" }}>TCG</span>
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Browse","Sets","Binder"].map((l) => (
              <span key={l} className="nav-link" onClick={() => l === "Browse" && handleBrowse()} style={{ fontSize: 12, color: c.textTer, cursor: "pointer", transition: "color 0.15s" }}>
                {l}
              </span>
            ))}
          </div>
        </div>
        {/* Only show auth buttons when not logged in */}
        {mounted && !user && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openAuth("login")} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `0.5px solid ${c.border}`, background: "transparent", color: c.textSec, cursor: "pointer" }}>
              Log in
            </button>
            <button onClick={() => openAuth("signup")} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
              Sign up free
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderBottom: `1px solid ${c.border}`, minHeight: 440 }}>
        {/* Left */}
        <div className="fu" style={{ padding: "48px 32px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              <span style={{ background: "#dc2626", color: "#fff", fontSize: 9, fontWeight: 500, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.07em", textTransform: "uppercase" as const }}>New</span>
              <span style={{ fontSize: 11, color: c.textTer }}>OP-15 · Adventure on KAMI’s Island just added</span>
            </div>
            <h1 style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 72, lineHeight: 0.95, letterSpacing: "0.01em", color: c.text, marginBottom: 18 }}>
              YOUR<br />COLLECTING<br />STARTS<br />
              <span style={{ color: "#dc2626" }}>HERE</span><span style={{ opacity: 0.25 }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: c.textSec, lineHeight: 1.65, maxWidth: 340, marginBottom: 28 }}>
              Browse, filter, and collect every English One Piece TCG card across all sets — from Romance Dawn to the latest boosters.
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn-primary" onClick={() => handleBrowse()} style={{ padding: "10px 22px", borderRadius: 8, background: c.text, color: c.bg, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", transition: "opacity 0.2s" }}>
                Browse cards →
              </button>
              {mounted && !user && (
                <button className="btn-secondary" onClick={() => openAuth("signup")} style={{ padding: "10px 22px", borderRadius: 8, border: `0.5px solid ${c.border}`, background: "transparent", color: c.text, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
                  Sign up free
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            {["2,400+ cards","28 sets","English only","Always free"].map((s) => (
              <span key={s} style={{ fontSize: 11, color: c.textTer }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Right — floating card stack with real images */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 28px", overflow: "hidden" }}>
          <div style={{ position: "relative", width: 460, height: 340 }}>
            {STACK_META.map((meta, i) => {
              const card = stackCards[i];
              const rarityRaw = card?.rarity?.replace(/\s+CARD\s*$/i, "").trim() ?? "";
              const rarityLabel = card?.name?.includes("(SP)") ? "SP" : (rarityRaw || "");
              // Derive rarity badge colors from the actual card rarity
              const RARITY_COLORS: Record<string, { color: string; bg: string }> = {
                SEC: { color: "#991b1b", bg: "#fee2e2" },
                SR:  { color: "#6d28d9", bg: "#ede9fe" },
                SP:  { color: "#9d174d", bg: "#fce7f3" },
              };
              const rarityStyle = RARITY_COLORS[rarityLabel] ?? { color: meta.rarityColor, bg: meta.rarityBg };
              // Color pip from card color
              const COLOR_MAP: Record<string, string> = {
                Red: "#ef4444", Green: "#22c55e", Blue: "#3b82f6",
                Purple: "#a855f7", Black: "#374151", Yellow: "#eab308",
              };
              const cardColor = card?.color?.split("/")?.[0]?.trim() ?? "";
              const pipColor = COLOR_MAP[cardColor] ?? meta.color;

              return (
                <div
                  key={i}
                  className={meta.cls}
                  style={{
                    position: "absolute",
                    top: meta.top,
                    left: meta.left,
                    zIndex: meta.z,
                    width: 190,
                    height: 266,
                    borderRadius: 14,
                    border: `1px solid ${c.border}`,
                    overflow: "hidden",
                    boxShadow: isDark ? "0 20px 56px rgba(0,0,0,0.7)" : "0 20px 56px rgba(0,0,0,0.18)",
                  }}
                >
                  {/* pip */}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: pipColor, border: "1.5px solid rgba(255,255,255,0.8)", position: "absolute", top: 10, left: 10, zIndex: 5 }} />
                  {/* rarity */}
                  {rarityLabel && (
                    <div style={{ position: "absolute", top: 9, right: 9, zIndex: 5, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: rarityStyle.bg, color: rarityStyle.color }}>
                      {rarityLabel}
                    </div>
                  )}
                  {/* full-bleed image — no footer */}
                  {card?.images?.large ? (
                    <img src={card.images.large} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: isDark ? `linear-gradient(135deg, ${meta.darkBg}, #1f2937)` : `linear-gradient(135deg, ${meta.bg}, #f9fafb)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 42, opacity: 0.35 }}>🃏</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COLOR BAND */}
      <div style={{ display: "flex", height: 4 }}>
        {["#ef4444","#22c55e","#3b82f6","#a855f7","#374151","#eab308"].map((col) => (
          <div key={col} style={{ flex: 1, background: col }} />
        ))}
      </div>

      {/* FEATURES */}
      <div className="fu1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: `1px solid ${c.border}` }}>
        {[
          { n: "01", title: "Search & filter",  desc: "Stack filters across set, color, type, and rarity. Search by name or ID instantly." },
          { n: "02", title: "Card binder",       desc: "Save your collection to a personal binder. Sign in to sync it across devices." },
          { n: "03", title: "Grid + list views", desc: "Image-first grid or compact list. Navigate cards with arrow keys in the detail view." },
        ].map((f, i) => (
          <div key={f.n} style={{ padding: "22px 24px", borderRight: i < 2 ? `1px solid ${c.border}` : "none" }}>
            <div style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 13, color: c.textTer, marginBottom: 10, letterSpacing: "0.06em" }}>{f.n}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 5 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: c.textSec, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* SETS + RARITIES */}
      <div className="fu2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ padding: "20px 24px", borderRight: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer, marginBottom: 12 }}>Browse by set</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            <button onClick={() => { setActiveSet(null); handleBrowse(); }} className="set-pill" style={{ fontSize: 11, padding: "4px 11px", borderRadius: 99, border: `0.5px solid ${activeSet === null ? c.text : c.border}`, background: activeSet === null ? c.text : "transparent", color: activeSet === null ? c.bg : c.textSec, cursor: "pointer", transition: "all 0.15s" }}>All</button>
            {SETS.map((s) => (
              <button key={s} onClick={() => { setActiveSet(s); handleBrowse(s); }} className="set-pill" style={{ fontSize: 11, padding: "4px 11px", borderRadius: 99, border: `0.5px solid ${activeSet === s ? c.text : c.border}`, background: activeSet === s ? c.text : "transparent", color: activeSet === s ? c.bg : c.textSec, cursor: "pointer", transition: "all 0.15s" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer, marginBottom: 12 }}>Filter by rarity</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {RARITIES.map((r) => (
              <div key={r.label} className="rar-cell" onClick={() => router.push(`/browse?rarity=${r.label}`)} style={{ padding: "7px 6px", borderRadius: 8, border: `0.5px solid ${c.border}`, textAlign: "center", cursor: "pointer", transition: "border-color 0.15s" }}>
                <span style={{ fontSize: 10, fontWeight: 600, display: "block", color: r.color, marginBottom: 2 }}>{r.label}</span>
                <span style={{ fontSize: 9, color: c.textTer }}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD STRIP */}
      <div className="fu3" style={{ padding: "18px 24px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textTer }}>Card preview</span>
          <span onClick={() => handleBrowse()} style={{ fontSize: 11, color: "#dc2626", cursor: "pointer", fontWeight: 500 }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {CARD_PREVIEWS.map((meta, i) => {
            const real = previewCards[i];
            return (
              <div key={i} className="strip-card" onClick={() => { setSelectedCard(real ?? null); setSelectedIndex(i); }} style={{ aspectRatio: "0.72", borderRadius: 8, border: `1px solid ${meta.border}`, background: isDark ? `linear-gradient(135deg, ${meta.darkBg}, #1f2937)` : `linear-gradient(135deg, ${meta.bg}, #f9fafb)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, border: "1px solid rgba(255,255,255,0.5)", position: "absolute", top: 6, left: 6, zIndex: 2 }} />
                <div style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: meta.rarityBg, color: meta.rarityColor, position: "absolute", top: 5, right: 5, zIndex: 2 }}>{meta.rarity}</div>
                {real?.images?.small ? (
                  <img src={real.images.small} alt={real.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                ) : (
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                )}
              </div>
            );
          })}
          <div onClick={() => handleBrowse()} style={{ aspectRatio: "0.72", borderRadius: 8, border: `1px dashed ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "opacity 0.2s" }}>
            <span style={{ fontSize: 10, color: c.textTer }}>+2,406</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 16, color: c.text }}>OP<span style={{ color: "#ef4444" }}>TCG</span></span>
          <span style={{ fontSize: 10, color: c.textTer }}>Data via optcgapi.com · English cards only · Not affiliated with Bandai</span>
        </div>
        <span style={{ fontSize: 10, color: c.textTer }}>© 2026</span>
      </div>


      {/* Card Detail Modal */}
      {selectedCard && (
        <div
          style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => { setSelectedCard(null); setSelectedIndex(-1); }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", maxWidth: 960 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev */}
            <button
              onClick={() => { const next = Math.max(selectedIndex - 1, 0); setSelectedIndex(next); setSelectedCard(previewCards[next] ?? null); }}
              disabled={selectedIndex <= 0}
              style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: selectedIndex > 0 ? "pointer" : "not-allowed", opacity: selectedIndex <= 0 ? 0.3 : 1, transition: "all 0.2s", boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}
            >
              <ChevronLeft style={{ width: 20, height: 20 }} />
            </button>

            {/* Modal */}
            <div style={{ flex: 1, background: c.bg, borderRadius: 20, border: `1px solid ${c.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: c.text, letterSpacing: "-0.02em" }}>{selectedCard.name}</div>
                  <div style={{ fontSize: 12, color: c.textTer, fontFamily: "monospace", marginTop: 2 }}>{selectedCard.id}</div>
                </div>
                <button onClick={() => { setSelectedCard(null); setSelectedIndex(-1); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <X style={{ width: 20, height: 20, color: c.textTer }} />
                </button>
              </div>

              {/* Body */}
              <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
                {/* Image */}
                <div style={{ width: "45%", flexShrink: 0, background: isDark ? "#111827" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  {selectedCard.images?.large ? (
                    <img src={selectedCard.images.large} alt={selectedCard.name} style={{ width: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12, boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)" }} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, border: `2px dashed ${c.border}`, background: c.bgSec }}>🃏</div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {([
                      ["Type",      selectedCard.type],
                      ["Rarity",    selectedCard.rarity],
                      ["Color",     selectedCard.color],
                      ["Cost",      selectedCard.cost],
                      ["Power",     selectedCard.power],
                      ["Counter",   selectedCard.counter],
                      ["Attribute", selectedCard.attribute?.name],
                      ["Family",    selectedCard.family],
                      ["Set",       selectedCard.set?.name],
                    ] as [string, unknown][]).filter(([, v]) => v != null && v !== "" && v !== "-").map(([label, value]) => (
                      <div key={label} style={{ background: c.bgSec, borderRadius: 10, padding: "10px 14px", border: `1px solid ${c.border}` }}>
                        <div style={{ fontSize: 11, color: c.textTer, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 700 }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: c.text }}>{String(value)}</div>
                      </div>
                    ))}
                  </div>

                  {selectedCard.ability && (
                    <div style={{ background: c.bgSec, borderRadius: 10, padding: "12px 14px", border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 11, color: c.textTer, marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 700 }}>Effect</div>
                      <div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>{selectedCard.ability}</div>
                    </div>
                  )}

                  {selectedCard.trigger && selectedCard.trigger !== "" && (
                    <div style={{ background: isDark ? "rgba(217,119,6,0.1)" : "rgba(251,191,36,0.08)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${isDark ? "rgba(251,191,36,0.2)" : "rgba(217,119,6,0.2)"}` }}>
                      <div style={{ fontSize: 11, color: isDark ? "#fbbf24" : "#d97706", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 700 }}>Trigger</div>
                      <div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>{selectedCard.trigger}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer counter */}
              <div style={{ borderTop: `1px solid ${c.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: c.textTer, flexShrink: 0 }}>
                {selectedIndex + 1} / {previewCards.length}
              </div>
            </div>

            {/* Next */}
            <button
              onClick={() => { const next = Math.min(selectedIndex + 1, previewCards.length - 1); setSelectedIndex(next); setSelectedCard(previewCards[next] ?? null); }}
              disabled={selectedIndex >= previewCards.length - 1}
              style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: selectedIndex < previewCards.length - 1 ? "pointer" : "not-allowed", opacity: selectedIndex >= previewCards.length - 1 ? 0.3 : 1, transition: "all 0.2s", boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}
            >
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      )}

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />}
    </div>
  );
}