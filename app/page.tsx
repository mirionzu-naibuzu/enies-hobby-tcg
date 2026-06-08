"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getAllCards } from "@/lib/api";
import { Card } from "@/types/card";
import { getColors, ALL_THEMES } from "@/lib/themes";

const SETS = [
  "OP-01","OP-02","OP-03","OP-04","OP-05","OP-06","OP-07","OP-08","OP-09","OP-10",
  "ST-01","ST-02","ST-03","ST-04","ST-05","ST-06","ST-07","ST-08","ST-09","ST-10",
  "EB-01","EB-02","EB-03","EB-04",
  "PRB-01","PRB-02"
];

const STACK_META = [
  { color: "#ef4444", darkBg: "#7f1d1d", bg: "#fff1f2", rarityColor: "#991b1b", rarityBg: "#fee2e2", rot: -8, top: 0,  left: 0,   z: 1, cls: "card-a" },
  { color: "#3b82f6", darkBg: "#0c2340", bg: "#eff6ff", rarityColor: "#6d28d9", rarityBg: "#ede9fe", rot:  2, top: 32, left: 130, z: 3, cls: "card-b" },
  { color: "#a855f7", darkBg: "#3f0f5c", bg: "#faf5ff", rarityColor: "#1d4ed8", rarityBg: "#dbeafe", rot: 11, top: 12, left: 256, z: 1, cls: "card-c" },
];

const RARITIES = [
  { label: "SEC", name: "Secret Rare", color: "#991b1b", bg: "#fee2e2", description: "The rarest cards in any booster set. Secret Rares feature stunning alternate art, unique foiling, and are extremely hard to pull. Every set has only a handful of SECs — owning one is a real flex.", pullRate: "~1 in 144 packs", icon: "💎" },
  { label: "SR",  name: "Super Rare",  color: "#6d28d9", bg: "#ede9fe", description: "Super Rares are powerful, visually impressive cards with foil treatment. They feature key characters and strong abilities that often see competitive play. Highly sought after by collectors and players alike.", pullRate: "~1 in 12 packs", icon: "⭐" },
  { label: "R",   name: "Rare",        color: "#1d4ed8", bg: "#dbeafe", description: "Rares strike the balance between accessibility and value. They often include strong support cards and fan-favorite characters. A staple of most competitive decks.", pullRate: "~1 in 4 packs", icon: "🔷" },
  { label: "UC",  name: "Uncommon",    color: "#065f46", bg: "#d1fae5", description: "Uncommons are reliable, consistent cards that form the backbone of many strategies. Don't sleep on them — some of the most competitive cards in the game are Uncommons.", pullRate: "~3-4 per pack", icon: "🟢" },
  { label: "C",   name: "Common",      color: "#6b7280", bg: "#f3f4f6", description: "The foundation of every deck. Commons are widely available and easy to collect, but many are competitively viable. Perfect for building consistent, budget-friendly decks.", pullRate: "~5-6 per pack", icon: "⬜" },
  { label: "SP",  name: "SP Card",     color: "#9d174d", bg: "#fce7f3", description: "SP Cards are special alternate art versions of existing cards, featuring unique illustrations not found anywhere else. They're chase cards for collectors and don't affect gameplay — pure eye candy.", pullRate: "Very rare, set-dependent", icon: "✨" },
  { label: "TR",  name: "Trophy Rare", color: "#0369a1", bg: "#e0f2fe", description: "Trophy Rares are awarded exclusively through official tournaments and events. They cannot be pulled from booster packs, making them among the rarest cards in the entire game. A true badge of honor.", pullRate: "Tournament exclusive", icon: "🏆" },
  { label: "P",  name: "Promo",       color: "#b45309", bg: "#fef3c7", description: "Promo cards are distributed through special events, pre-release kits, and promotional campaigns. Each promo has its own unique art or stamp, making them highly collectible outside of normal set releases.", pullRate: "Event / promo exclusive", icon: "🎁" },
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stackCards, setStackCards] = useState<Card[]>([]);
  const [previewCards, setPreviewCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<typeof RARITIES[number] | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });

    getAllCards().then((cards) => {
      setCardCount(cards.length);
      const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
      const highRarity = cards.filter((c) => {
        const r = c.rarity?.replace(/\s+CARD\s*$/i, "").trim() ?? "";
        const normalized = c.name?.includes("(SP)") ? "SP" : r;
        return ["SR","SP","SEC"].includes(normalized) && ["LEADER","CHARACTER"].includes(c.type?.toUpperCase() ?? "") && !!c.images?.large;
      });
      setStackCards(shuffle(highRarity).slice(0, 3) as Card[]);
      setPreviewCards(shuffle(cards.filter((c) => !!c.images?.small)).slice(0, 6));
    });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelectedCard(null); setSelectedIndex(-1); setSelectedRarity(null); setShowThemePicker(false); }
      if (e.key === "ArrowRight") setSelectedIndex((prev) => { const next = Math.min(prev + 1, previewCards.length - 1); setSelectedCard(previewCards[next] ?? null); return next; });
      if (e.key === "ArrowLeft")  setSelectedIndex((prev) => { const next = Math.max(prev - 1, 0); setSelectedCard(previewCards[next] ?? null); return next; });
    };
    window.addEventListener("keydown", handleKey);
    return () => { listener.subscription.unsubscribe(); window.removeEventListener("keydown", handleKey); };
  }, []);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const c = {
    bg:      tc.bg.primary,
    bgSec:   tc.bg.secondary,
    bgTer:   tc.bg.tertiary,
    text:    tc.text.primary,
    textSec: tc.text.tertiary,
    textTer: tc.text.tertiary,
    border:  tc.border,
  };

  const openAuth = (mode: "login" | "signup") => { setAuthMode(mode); setShowAuth(true); };
  const handleBrowse = (set?: string) => router.push(set ? `/browse?set=${set}` : "/browse");

  return (
    <div
      suppressHydrationWarning
      style={{ minHeight: "100vh", background: c.bg, color: c.text, transition: "background-color 0.3s" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600&display=swap');
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
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-in { animation: modalIn 0.2s ease forwards; }
        @keyframes popIn { from{opacity:0;transform:scale(0.95) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .pop-in { animation: popIn 0.15s ease forwards; }
        .set-pill:hover  { border-color: ${c.text}  !important; color: ${c.text}  !important; }
        .rar-cell:hover  { border-color: ${c.textSec} !important; background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"} !important; }
        .strip-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,0.14); }
        .strip-card { transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary:hover  { opacity: 0.85; }
        .btn-secondary:hover { background: ${c.bgTer} !important; }
        .theme-swatch:hover { border-color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"} !important; }
      `}</style>

      {/* NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px",
          background: c.bg,
          boxShadow: isDark
            ? `0 0 24px -4px ${tc.accent}35`
            : "0 8px 20px -6px rgba(0,0,0,0.15)"
        }}
      >
        {/* LEFT: LOGO */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
            alt="Enies Hobby logo"
            style={{ height: 50, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* RIGHT: NAV + THEME + AUTH */}
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {/* NAV LINKS */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {["Cards", "Binder", "Don!!", "About"].map((l) => (
            <button
              key={l}
              onClick={() => {
                if (l === "Cards") handleBrowse();
                if (l === "Binder") router.push("/binder");
                if (l === "Don!!") router.push("/don");
                if (l === "About") router.push("/about");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: c.textSec,
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = c.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = c.textSec)}
            >
              {l}
            </button>
          ))}
          </div>

          {/* THEME BUTTON + POPOVER */}
          {mounted && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowThemePicker(p => !p)}
                title="Change theme"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: showThemePicker
                    ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")
                    : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <Palette style={{ width: 16, height: 16 }} />
              </button>

              {showThemePicker && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 49 }}
                    onClick={() => setShowThemePicker(false)}
                  />
                  <div
                    className="pop-in"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: 0,
                      width: 284,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 14,
                      padding: 14,
                      zIndex: 50,
                      boxShadow: isDark
                        ? "0 20px 40px rgba(0,0,0,0.6)"
                        : "0 20px 40px rgba(0,0,0,0.12)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 2 }}>Themes</div>
                    <div style={{ fontSize: 11, color: c.textSec, marginBottom: 12 }}>Choose your experience</div>

                    {/* Column labels */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textSec, textAlign: "center" as const }}>Light</div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.textSec, textAlign: "center" as const }}>Dark</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                      {ALL_THEMES.map((t) => {
                        const isActive = theme === t.value;
                        return (
                          <div
                            key={t.value}
                            className="theme-swatch"
                            onClick={() => setTheme(t.value)}
                            style={{
                              borderRadius: 9,
                              padding: 6,
                              cursor: "pointer",
                              border: isActive ? `2px solid ${tc.accent}` : `1px solid ${c.border}`,
                              transition: "all 0.15s",
                              background: isActive
                                ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"
                                : "transparent",
                            }}
                          >
                            <div style={{ height: 40, borderRadius: 6, background: t.preview.bg, position: "relative", overflow: "hidden", padding: 6 }}>
                              <div style={{ height: 5, width: "65%", borderRadius: 3, background: t.preview.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)", marginBottom: 5 }} />
                              <div style={{ height: 11, width: 11, borderRadius: 3, background: t.preview.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />
                              <div style={{ position: "absolute", bottom: 5, right: 5, height: 4, width: 22, borderRadius: 4, background: t.preview.bar }} />
                              {isActive && (
                                <div style={{ position: "absolute", top: 4, right: 4, width: 12, height: 12, borderRadius: "50%", background: tc.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700 }}>✓</div>
                              )}
                            </div>
                            <div style={{ fontSize: 9, textAlign: "center" as const, marginTop: 4, color: isActive ? tc.accent : c.textSec, fontWeight: isActive ? 700 : 400, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {t.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AUTH / PROFILE */}
          {mounted && user ? (
            <button
              // onClick={() => router.push("/profile")}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.text, color: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
            </button>
          ) : mounted ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => openAuth("login")}
                style={{ background: "transparent", border: "none", color: c.textSec, fontSize: 13, cursor: "pointer", padding: 0, transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = c.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = c.textSec)}
              >
                Log in
              </button>
              <button
                onClick={() => openAuth("signup")}
                style={{ background: tc.accent, border: "none", color: "#fff", fontSize: 13, padding: "7px 14px", borderRadius: 10, cursor: "pointer" }}
              >
                Join
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* HERO */}
      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderBottom: `1px solid ${c.border}`, minHeight: 440 }}>
        <div className="fu" style={{ padding: "20px 32px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              <span style={{ background: tc.accent, color: "#fff", fontSize: 9, fontWeight: 500, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.07em", textTransform: "uppercase" as const }}>New</span>
              <span style={{ fontSize: 11, color: c.textTer }}>OP-15 · Adventure on KAMI's Island just added</span>
            </div>
            <h1 style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 72, lineHeight: 0.95, letterSpacing: "0.01em", color: c.text, marginBottom: 18 }}>
              YOUR<br />COLLECTING<br />STARTS<br />
              <span style={{ color: tc.accent }}>HERE</span><span style={{ opacity: 0.25 }}>.</span>
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
            {[cardCount ? `${cardCount.toLocaleString()} cards` : "Loading...", "English only", "Always free"].map((s) => (
              <span key={s} style={{ fontSize: 11, color: c.textTer }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Floating card stack */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 28px", overflow: "hidden" }}>
          <div style={{ position: "relative", width: 460, height: 340 }}>
            {STACK_META.map((meta, i) => {
              const card = stackCards[i];
              const rarityRaw = card?.rarity?.replace(/\s+CARD\s*$/i, "").trim() ?? "";
              const rarityLabel = card?.name?.includes("(SP)") ? "SP" : (rarityRaw || "");
              const RARITY_COLORS: Record<string, { color: string; bg: string }> = {
                SEC: { color: "#991b1b", bg: "#fee2e2" }, SR: { color: "#6d28d9", bg: "#ede9fe" }, SP: { color: "#9d174d", bg: "#fce7f3" },
              };
              const rarityStyle = RARITY_COLORS[rarityLabel] ?? { color: meta.rarityColor, bg: meta.rarityBg };
              const COLOR_MAP: Record<string, string> = { Red: "#ef4444", Green: "#22c55e", Blue: "#3b82f6", Purple: "#a855f7", Black: "#374151", Yellow: "#eab308" };
              const cardColor = card?.color?.split("/")?.[0]?.trim() ?? "";
              const pipColor = COLOR_MAP[cardColor] ?? meta.color;
              return (
                <div key={i} className={meta.cls} style={{ position: "absolute", top: meta.top, left: meta.left, zIndex: meta.z, width: 190, height: 266, borderRadius: 14, border: `1px solid ${c.border}`, overflow: "hidden", boxShadow: isDark ? "0 20px 56px rgba(0,0,0,0.7)" : "0 20px 56px rgba(0,0,0,0.18)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: pipColor, border: "1.5px solid rgba(255,255,255,0.8)", position: "absolute", top: 10, left: 10, zIndex: 5 }} />
                  {rarityLabel && (
                    <div style={{ position: "absolute", top: 9, right: 9, zIndex: 5, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: rarityStyle.bg, color: rarityStyle.color }}>{rarityLabel}</div>
                  )}
                  {card?.images?.large ? (
                    <img src={card.images.large} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: isDark ? `linear-gradient(135deg, ${meta.darkBg}, ${tc.bg.secondary})` : `linear-gradient(135deg, ${meta.bg}, ${tc.bg.secondary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <div key={r.label} className="rar-cell" onClick={() => setSelectedRarity(r)} style={{ padding: "7px 6px", borderRadius: 8, border: `0.5px solid ${c.border}`, textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
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
          <span onClick={() => handleBrowse()} style={{ fontSize: 11, color: tc.accent, cursor: "pointer", fontWeight: 500 }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {CARD_PREVIEWS.map((meta, i) => {
            const real = previewCards[i];
            return (
              <div key={i} className="strip-card" onClick={() => { setSelectedCard(real ?? null); setSelectedIndex(i); }} style={{ aspectRatio: "0.72", borderRadius: 8, border: `1px solid ${meta.border}`, background: isDark ? `linear-gradient(135deg, ${meta.darkBg}, ${tc.bg.secondary})` : `linear-gradient(135deg, ${meta.bg}, ${tc.bg.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}>
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
            <span style={{ fontSize: 10, color: c.textTer }}>View all</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
            alt="Enies Hobby footer logo"
            style={{ height: 30, width: "auto", objectFit: "contain" }}
          />
          <span style={{ fontSize: 10, color: c.textTer }}>
            English cards only · May not reflect the latest releases · Not affiliated with Bandai ·{" "}
            <span onClick={() => router.push("/disclaimer")} style={{ cursor: "pointer", textDecoration: "underline" }}>Disclaimer</span>
          </span>
        </div>
        <span style={{ fontSize: 10, color: c.textTer }}>© 2026</span>
      </div>

      {/* RARITY INFO MODAL */}
      {selectedRarity && (
        <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelectedRarity(null)}>
          <div className="modal-in" onClick={(e) => e.stopPropagation()} style={{ background: c.bg, borderRadius: 16, border: `1px solid ${c.border}`, width: "100%", maxWidth: 400, overflow: "hidden", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.6)" : "0 32px 64px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: "20px 20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedRarity.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{selectedRarity.name}</span>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Anton','Impact',sans-serif", fontWeight: 400, fontSize: 18, color: "#000", background: selectedRarity.label === "SEC" ? "#f59e0b" : "#ffffff", border: `1px solid ${selectedRarity.label === "SEC" ? "#92400e" : "#000"}`, borderRadius: 8, padding: "2px 10px", letterSpacing: "0.02em", lineHeight: 1.2 }}>
                  {selectedRarity.label}
                </span>
              </div>
              <div style={{ height: "0.5px", background: c.border, marginBottom: 14 }} />
              <p style={{ fontSize: 13, color: c.textSec, lineHeight: 1.7, margin: "0 0 14px" }}>{selectedRarity.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                <span style={{ fontSize: 12, color: c.textTer }}>Pull rate</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{selectedRarity.pullRate}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSelectedRarity(null)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 500, border: `0.5px solid ${c.border}`, background: "transparent", color: c.text, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = c.bgSec; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>Dismiss</button>
                <button onClick={() => { setSelectedRarity(null); router.push(`/browse?rarity=${selectedRarity.label}`); }} style={{ flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", background: selectedRarity.color, color: "#fff", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
                  View {selectedRarity.label} cards →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD DETAIL MODAL */}
      {selectedCard && (
        <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => { setSelectedCard(null); setSelectedIndex(-1); }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { const next = Math.max(selectedIndex - 1, 0); setSelectedIndex(next); setSelectedCard(previewCards[next] ?? null); }} disabled={selectedIndex <= 0} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: selectedIndex > 0 ? "pointer" : "not-allowed", opacity: selectedIndex <= 0 ? 0.3 : 1, transition: "all 0.2s", boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
              <ChevronLeft style={{ width: 20, height: 20 }} />
            </button>
            <div style={{ flex: 1, background: c.bg, borderRadius: 20, border: `1px solid ${c.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: c.text, letterSpacing: "-0.02em" }}>{selectedCard.name}</div>
                  <div style={{ fontSize: 12, color: c.textTer, fontFamily: "monospace", marginTop: 2 }}>{selectedCard.id}</div>
                </div>
                <button onClick={() => { setSelectedCard(null); setSelectedIndex(-1); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <X style={{ width: 20, height: 20, color: c.textTer }} />
                </button>
              </div>
              <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
                <div style={{ width: "45%", flexShrink: 0, background: tc.bg.primary, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  {selectedCard.images?.large ? (
                    <img src={selectedCard.images.large} alt={selectedCard.name} style={{ width: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12, boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)" }} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, border: `2px dashed ${c.border}`, background: c.bgSec }}>🃏</div>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {([["Type", selectedCard.type],["Rarity", selectedCard.rarity],["Color", selectedCard.color],["Cost", selectedCard.cost],["Power", selectedCard.power],["Counter", selectedCard.counter],["Attribute", selectedCard.attribute?.name],["Family", selectedCard.family],["Set", selectedCard.set?.name]] as [string, unknown][]).filter(([, v]) => v != null && v !== "" && v !== "-").map(([label, value]) => (
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
              <div style={{ borderTop: `1px solid ${c.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: c.textTer, flexShrink: 0 }}>
                {selectedIndex + 1} / {previewCards.length}
              </div>
            </div>
            <button onClick={() => { const next = Math.min(selectedIndex + 1, previewCards.length - 1); setSelectedIndex(next); setSelectedCard(previewCards[next] ?? null); }} disabled={selectedIndex >= previewCards.length - 1} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: selectedIndex < previewCards.length - 1 ? "pointer" : "not-allowed", opacity: selectedIndex >= previewCards.length - 1 ? 0.3 : 1, transition: "all 0.2s", boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      )}

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />}
    </div>
  );
}