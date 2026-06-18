"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getAllCards } from "@/lib/api";
import { Card } from "@/types/card";
import { getColors, ALL_THEMES } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

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
  { bg: "#fff1f2", border: "rgba(239,68,68,0.25)",  darkBg: "#7f1d1d", label: "Monkey D. Luffy", type: "LEADER" },
  { bg: "#eff6ff", border: "rgba(59,130,246,0.25)", darkBg: "#0c2340", label: "Roronoa Zoro",    type: "CHARACTER" },
  { bg: "#faf5ff", border: "rgba(168,85,247,0.25)", darkBg: "#3f0f5c", label: "Nami",            type: "EVENT" },
  { bg: "#f0fdf4", border: "rgba(34,197,94,0.25)",  darkBg: "#14532d", label: "Wano",            type: "STAGE" },
  { bg: "#fefce8", border: "rgba(234,179,8,0.25)",  darkBg: "#54381e", label: "Sanji",           type: "CHARACTER" },
  { bg: "#f9fafb", border: "rgba(55,65,81,0.2)",    darkBg: "#1f2937", label: "Barrier",         type: "EVENT" },
];

const HERO_SEGMENTS: { text: string; break?: boolean; cls?: "highlight" | "dim" }[] = [
  { text: "YOUR", break: true },
  { text: "NEXT PULL", break: true },
  { text: "STARTS", break: true },
  { text: "HERE", cls: "highlight" },
  { text: ".", cls: "dim" },
];

const HERO_TOTAL_LENGTH = HERO_SEGMENTS.reduce((sum, seg) => sum + seg.text.length, 0);

function renderHeroTyping(typedCount: number, accentColor: string) {
  let remaining = typedCount;
  return HERO_SEGMENTS.map((seg, idx) => {
    const take = Math.max(0, Math.min(seg.text.length, remaining));
    remaining -= take;
    const visible = seg.text.slice(0, take);
    const style =
      seg.cls === "highlight" ? { color: accentColor } :
      seg.cls === "dim" ? { opacity: 0.25 } :
      undefined;
    return (
      <span key={idx}>
        <span style={style}>{visible}</span>
        {seg.break && <br />}
      </span>
    );
  });
}

// ── Modal card image with flip-in animation (matches browse page) ──
function ModalCardImage({ src, alt, isLeader, isDark }: {
  src: string; alt: string; isLeader: boolean; isDark: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const backSrc = isLeader ? "/card-back-leader.png" : "/card-back.png";

  useEffect(() => {
    setLoaded(false);
    setFlipped(false);
    setImgSrc(src);

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
      setTimeout(() => setFlipped(true), 60);
    };
    img.onerror = () => {
      setImgSrc("/card-placeholder.png");
      setLoaded(true);
      setTimeout(() => setFlipped(true), 60);
    };
  }, [src]);

  return (
    <div style={{ width: "100%", aspectRatio: "63/88", perspective: "1000px" }}>
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
        borderRadius: 17,
        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 17, overflow: "hidden" }}>
          {loaded && (
            <img
              src={imgSrc}
              alt={alt}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
            />
          )}
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 17, overflow: "hidden" }}>
          <img src={backSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </div>
    </div>
  );
}

function probeImage(url: string, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => resolve(false), timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

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
  const [stackRevealed, setStackRevealed] = useState(false);
  const [previewRevealed, setPreviewRevealed] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  //scroll lock
  useBodyScrollLock(!!selectedCard || !!selectedRarity);

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
    
      // Probe a buffer of high-rarity cards, keep the first 3 whose large image actually loads
      const stackCandidates = shuffle(highRarity).slice(0, 10);
      const stackAccepted: Card[] = [];
      let stackSettled = 0;
      let stackFinished = false;
    
      stackCandidates.forEach((card) => {
        probeImage(card.images!.large!, 4000).then((ok) => {
          if (stackFinished) return;
          stackSettled++;
          if (ok) stackAccepted.push(card);
          if (stackAccepted.length >= 3 || stackSettled === stackCandidates.length) {
            stackFinished = true;
            setStackCards(stackAccepted.slice(0, 3));
          }
        });
      });
    
      // Probe a buffer of small-image candidates, keep the first 6 that succeed
      const candidates = shuffle(cards.filter((c) => !!c.images?.small)).slice(0, 16);
      const accepted: Card[] = [];
      let settled = 0;
      let finished = false;
    
      candidates.forEach((card) => {
        probeImage(card.images!.small!, 2500).then((ok) => {
          if (finished) return;
          settled++;
          if (ok) accepted.push(card);
          if (accepted.length >= 6 || settled === candidates.length) {
            finished = true;
            setPreviewCards(accepted.slice(0, 6));
          }
        });
      });
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedCount(i);
      if (i >= HERO_TOTAL_LENGTH) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
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

  const previewCardsRef = useRef<Card[]>([]);
  const selectedIndexRef = useRef<number>(-1);

  useEffect(() => { previewCardsRef.current = previewCards; }, [previewCards]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);

  const [cardLoaded, setCardLoaded] = useState<Record<number, boolean>>({});

useEffect(() => {
  setCardLoaded({});
}, [stackCards]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCard(null);
        setSelectedIndex(-1);
        setSelectedRarity(null);
        setShowThemePicker(false);
        return;
      }
      const idx = selectedIndexRef.current;
      const cards = previewCardsRef.current;
      if (idx < 0 || cards.length === 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = Math.min(idx + 1, cards.length - 1);
        setSelectedIndex(next);
        setSelectedCard(cards[next] ?? null);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = Math.max(idx - 1, 0);
        setSelectedIndex(next);
        setSelectedCard(cards[next] ?? null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
        @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        @keyframes blinkCursor { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        .typing-cursor { display: inline-block; animation: blinkCursor 0.9s steps(1) infinite; margin-left: 2px; }
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
                onClick={() => {
                  setShowThemePicker(p => {
                    const next = !p;
                    if (next) setThemeMode(isDark ? "dark" : "light");
                    return next;
                  });
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
                    width: 280,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 16,
                    padding: 16,
                    zIndex: 50,
                    boxShadow: isDark
                      ? "0 16px 36px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)"
                      : "0 16px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div style={{ fontWeight: 700, marginBottom: 2, color: c.text, fontSize: 14 }}>Themes</div>
                  <div style={{ fontSize: 11, color: c.textSec, marginBottom: 14 }}>Choose a theme for your experience</div>

                  {/* Light / Dark mode switcher pill */}
                  <div style={{ display: "flex", gap: 4, background: c.bgTer, padding: 4, borderRadius: 8, marginBottom: 12 }}>
                    <button
                      onClick={() => setThemeMode("light")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "7px 0",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        background: themeMode === "light" ? c.bg : "transparent",
                        color: themeMode === "light" ? c.text : c.textSec,
                        transition: "all 0.2s",
                      }}
                    >
                      <Sun size={13} /> Light
                    </button>
                    <button
                      onClick={() => setThemeMode("dark")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "7px 0",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        background: themeMode === "dark" ? c.bg : "transparent",
                        color: themeMode === "dark" ? c.text : c.textSec,
                        transition: "all 0.2s",
                      }}
                    >
                      <Moon size={13} /> Dark
                    </button>
                  </div>

                  {/* Single-column theme list filtered by mode */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ALL_THEMES.filter((t) => t.preview.dark === (themeMode === "dark")).map((t) => {
                      const isActive = theme === t.value;
                      return (
                        <div
                          key={t.value}
                          className="theme-swatch"
                          onClick={() => setTheme(t.value)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: 8,
                            borderRadius: 10,
                            cursor: "pointer",
                            border: isActive ? `1.5px solid ${tc.accent}` : `1px solid ${c.border}`,
                            background: isActive
                              ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"
                              : "transparent",
                            transition: "all 0.2s",
                          }}
                        >
                          {/* Mini preview thumbnail */}
                          <div style={{
                            width: 48,
                            height: 34,
                            borderRadius: 6,
                            background: t.preview.bg,
                            position: "relative",
                            overflow: "hidden",
                            flexShrink: 0,
                            border: `1px solid ${c.border}`,
                          }}>
                            <div style={{ position: "absolute", top: 5, left: 5, width: 24, height: 4, borderRadius: 2, background: t.preview.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
                            <div style={{ position: "absolute", bottom: 5, right: 5, width: 14, height: 4, borderRadius: 2, background: t.preview.bar }} />
                          </div>

                          {/* Name */}
                          <span style={{
                            flex: 1,
                            fontSize: 13,
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? tc.accent : c.text,
                            whiteSpace: "nowrap" as const,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {t.name}
                          </span>

                          {/* Active checkmark */}
                          {isActive && (
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M3 7.5L6.5 11L12 4" stroke={tc.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
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
              <span style={{ fontSize: 11, color: c.textTer }}>OP-16 · The Time of Battle just added</span>
            </div>
            <h1 style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: 72, lineHeight: 0.95, letterSpacing: "0.01em", color: c.text, marginBottom: 18 }}>
              {renderHeroTyping(typedCount, tc.accent)}
              {typedCount < HERO_TOTAL_LENGTH && (
                <span className="typing-cursor" style={{ color: tc.accent }}>|</span>
              )}
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
  const hasCard = !!card;
  const shouldFlip = hasCard && !stackRevealed;
  const fullyShown = hasCard && stackRevealed && !!cardLoaded[i];
  const backSrc = card?.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png";

  return (
    <div key={i} className={meta.cls} style={{ position: "absolute", top: meta.top, left: meta.left, zIndex: meta.z, width: 190, height: 266, borderRadius: 14, border: fullyShown ? `1px solid ${c.border}` : "none", overflow: "hidden", boxShadow: isDark ? "0 20px 56px rgba(0,0,0,0.7)" : "0 20px 56px rgba(0,0,0,0.18)", perspective: shouldFlip ? "1000px" : "none" }}>
      <div
        style={{ position: "absolute", inset: 0, transformStyle: shouldFlip ? "preserve-3d" : "flat", animationName: shouldFlip ? "cardFlipIn" : "none", animationDuration: "0.5s", animationTimingFunction: "ease", animationFillMode: "forwards", animationDelay: shouldFlip ? `${i * 0.12}s` : "0s" }}
        onAnimationEnd={hasCard && i === STACK_META.length - 1 ? () => setStackRevealed(true) : undefined}
      >
        {(!hasCard || shouldFlip) && (
          <img
            src={backSrc}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible", transform: shouldFlip ? "rotateY(180deg)" : "none" }}
          />
        )}
        {hasCard && (
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible" }}>
            <img
              src={card.images?.large || "/card-placeholder.png"}
              alt={card.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onLoad={() => setCardLoaded((prev) => ({ ...prev, [i]: true }))}
              onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; setCardLoaded((prev) => ({ ...prev, [i]: true })); }}
            />
          </div>
        )}
      </div>
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
                <span style={{ fontSize: 10, fontWeight: 600, display: "block", color: tc.accent, marginBottom: 2 }}>{r.label}</span>
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
            const hasReal = !!real;
            const shouldFlip = hasReal && !previewRevealed;
            const backSrc = real?.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png";
            return (
              <div key={i} className="strip-card" onClick={() => { setSelectedCard(real ?? null); setSelectedIndex(i); }} style={{ aspectRatio: "0.72", borderRadius: 8, border: `1px solid ${meta.border}`, background: isDark ? `linear-gradient(135deg, ${meta.darkBg}, ${tc.bg.secondary})` : `linear-gradient(135deg, ${meta.bg}, ${tc.bg.secondary})`, cursor: "pointer", position: "relative", overflow: "hidden", perspective: shouldFlip ? "700px" : "none" }}>
                <div
                  style={{ position: "absolute", inset: 0, transformStyle: shouldFlip ? "preserve-3d" : "flat", animationName: shouldFlip ? "cardFlipIn" : "none", animationDuration: "0.5s", animationTimingFunction: "ease", animationFillMode: "forwards", animationDelay: shouldFlip ? `${i * 0.05}s` : "0s" }}
                  onAnimationEnd={hasReal && i === CARD_PREVIEWS.length - 1 ? () => setPreviewRevealed(true) : undefined}
                >
                  {(!hasReal || shouldFlip) && (
                    <img
                      src={backSrc}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible", transform: shouldFlip ? "rotateY(180deg)" : "none" }}
                      onError={(e) => { e.currentTarget.src = "/card-back.png"; }}
                    />
                  )}
                  {hasReal && (
                    <img
                      src={real.images?.small || "/card-placeholder.png"}
                      alt={real.name}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible" }}
                      onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
                    />
                  )}
                </div>
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
            onClick={() => router.push("/")}
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
                <button onClick={() => { setSelectedRarity(null); router.push(`/browse?rarity=${selectedRarity.label}`); }} style={{ flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", background: tc.accent, color: "#fff", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
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
                    <ModalCardImage
                      key={selectedCard.images.large}
                      src={selectedCard.images.large}
                      alt={selectedCard.name}
                      isLeader={selectedCard.type?.toUpperCase() === "LEADER"}
                      isDark={isDark}
                    />
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