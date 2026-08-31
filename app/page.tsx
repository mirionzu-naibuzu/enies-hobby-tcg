"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Palette,
  Sun,
  Moon,
  Menu,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  RefreshCw,
  Compass,
  Zap,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "next-themes";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getHomeCards } from "@/lib/api";
import { Card } from "@/types/card";
import { getColors, ALL_THEMES } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { SET_ORDER } from "@/lib/sets";
import ModalCardImage from "@/components/ModalCardImage";

const FLAGSHIP_SETS = [
  { id: "OP-09", name: "Emperors in the New World", category: "Booster Pack", badgeColor: "#ef4444" },
  { id: "OP-08", name: "Two Legends",              category: "Booster Pack", badgeColor: "#3b82f6" },
  { id: "OP-07", name: "500 Years in the Future",    category: "Booster Pack", badgeColor: "#10b981" },
  { id: "OP-06", name: "Wings of the Captain",       category: "Booster Pack", badgeColor: "#a855f7" },
  { id: "OP-05", name: "Awakening of the New Era",   category: "Booster Pack", badgeColor: "#f59e0b" },
  { id: "EB-01", name: "Memorial Collection",        category: "Extra Booster", badgeColor: "#ec4899" },
  { id: "PRB-01", name: "Premium Booster",           category: "Premium Booster", badgeColor: "#6366f1" },
  { id: "OP-01", name: "Romance Dawn",               category: "Booster Pack", badgeColor: "#64748b" },
];

const FEATURED_SETS = [
  ...SET_ORDER.filter((s) => s.startsWith("OP-")).slice(-10),
  ...SET_ORDER.filter((s) => s.startsWith("ST-")).slice(-5),
];

const QUICK_TAGS = [
  { label: "OP-09", query: "set=OP-09" },
  { label: "Monkey D. Luffy", query: "q=Luffy" },
  { label: "Secret Rares", query: "rarity=SEC" },
];

const STACK_META = [
  { rot: -8, top: 10, left: 0,   z: 2, cls: "hero-fan-card-0" },
  { rot: 0,  top: 30, left: 118, z: 5, cls: "hero-fan-card-1" },
  { rot: 8,  top: 10, left: 235, z: 2, cls: "hero-fan-card-2" },
];

const RARITIES = [
  { label: "SEC", name: "Secret Rare", bg: "#fee2e2", description: "The rarest cards in any booster set. Secret Rares feature stunning alternate art, unique foiling, and are extremely hard to pull. Every set has only a handful of SECs — owning one is a real flex.", pullRate: "~1 in 144 packs" },
  { label: "SR",  name: "Super Rare",  bg: "#ede9fe", description: "Super Rares are powerful, visually impressive cards with foil treatment. They feature key characters and strong abilities that often see competitive play. Highly sought after by collectors and players alike.", pullRate: "~1 in 12 packs" },
  { label: "R",   name: "Rare",        bg: "#dbeafe", description: "Rares strike the balance between accessibility and value. They often include strong support cards and fan-favorite characters. A staple of most competitive decks.", pullRate: "~1 in 4 packs" },
  { label: "UC",  name: "Uncommon",    bg: "#d1fae5", description: "Uncommons are reliable, consistent cards that form the backbone of many strategies. Don't sleep on them — some of the most competitive cards in the game are Uncommons.", pullRate: "~3-4 per pack" },
  { label: "C",   name: "Common",      bg: "#f3f4f6", description: "The foundation of every deck. Commons are widely available and easy to collect, but many are competitively viable. Perfect for building consistent, budget-friendly decks.", pullRate: "~5-6 per pack" },
  { label: "SP",  name: "SP Card",     bg: "#fce7f3", description: "SP Cards are special alternate art versions of existing cards, featuring unique illustrations not found anywhere else. They're chase cards for collectors and don't affect gameplay — pure eye candy.", pullRate: "Very rare, set-dependent" },
  { label: "TR",  name: "Trophy Rare", bg: "#e0f2fe", description: "Trophy Rares are awarded exclusively through official tournaments and events. They cannot be pulled from booster packs, making them among the rarest cards in the entire game. A true badge of honor.", pullRate: "Tournament exclusive" },
  { label: "P",   name: "Promo",       bg: "#fef3c7", description: "Promo cards are distributed through special events, pre-release kits, and promotional campaigns. Each promo has its own unique art or stamp, making them highly collectible outside of normal set releases.", pullRate: "Event / promo exclusive" },
];

const CARD_PREVIEWS = [
  { bg: "#fff1f2", border: "rgba(239,68,68,0.25)",  darkBg: "#7f1d1d", label: "Monkey D. Luffy", type: "LEADER" },
  { bg: "#eff6ff", border: "rgba(59,130,246,0.25)", darkBg: "#0c2340", label: "Roronoa Zoro",    type: "CHARACTER" },
  { bg: "#faf5ff", border: "rgba(168,85,247,0.25)", darkBg: "#3f0f5c", label: "Nami",            type: "EVENT" },
  { bg: "#f0fdf4", border: "rgba(34,197,94,0.25)",  darkBg: "#14532d", label: "Wano",            type: "STAGE" },
  { bg: "#fefce8", border: "rgba(234,179,8,0.25)",  darkBg: "#54381e", label: "Sanji",           type: "CHARACTER" },
  { bg: "#f9fafb", border: "rgba(55,65,81,0.2)",    darkBg: "#1f2937", label: "Barrier",         type: "EVENT" },
];

export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stackCards, setStackCards] = useState<Card[]>([]);
  const [previewCards, setPreviewCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<typeof RARITIES[number] | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [stackRevealed, setStackRevealed] = useState(false);
  const [previewRevealed, setPreviewRevealed] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [homeCardsError, setHomeCardsError] = useState(false);
  const [cardLoaded, setCardLoaded] = useState<Record<number, boolean>>({});

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && selectedIndex < previewCards.length - 1) {
      const next = selectedIndex + 1;
      setSelectedIndex(next);
      setSelectedCard(previewCards[next] ?? null);
    } else if (dx > 0 && selectedIndex > 0) {
      const next = selectedIndex - 1;
      setSelectedIndex(next);
      setSelectedCard(previewCards[next] ?? null);
    }
  };

  const loadHomeData = () => {
    setHomeCardsError(false);
    setStackRevealed(false);
    setPreviewRevealed(false);
    setStackCards([]);
    setPreviewCards([]);
    getHomeCards()
      .then((data) => {
        setCardCount(data.cardCount);
        setStackCards(data.stackCards);
        setPreviewCards(data.previewCards);
      })
      .catch((err) => {
        console.error("Failed to load home cards:", err);
        setHomeCardsError(true);
      });
  };

  useBodyScrollLock(!!selectedCard || !!selectedRarity);

  useEffect(() => {
    setMounted(true);

    const mqMobile = window.matchMedia("(max-width: 768px)");
    setIsMobile(mqMobile.matches);
    const handlerMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqMobile.addEventListener("change", handlerMobile);

    const mqLand = window.matchMedia("(orientation: landscape)");
    setIsLandscape(mqLand.matches);
    const handlerLand = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mqLand.addEventListener("change", handlerLand);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    loadHomeData();

    return () => {
      mqMobile.removeEventListener("change", handlerMobile);
      mqLand.removeEventListener("change", handlerLand);
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setCardLoaded({});
  }, [stackCards]);

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
  };

  const openAuth = () => {
    setShowAuth(true);
  };

  const handleBrowse = (set?: string) =>
    router.push(set ? `/browse?set=${encodeURIComponent(set)}` : "/browse");

  const previewCardsRef = useRef<Card[]>([]);
  const selectedIndexRef = useRef<number>(-1);

  useEffect(() => {
    previewCardsRef.current = previewCards;
  }, [previewCards]);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

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
      style={{
        minHeight: "100vh",
        background: c.bg,
        color: c.text,
        transition: "background-color 0.3s ease",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }

        /* Gentle ambient floating on the top property so transform is 100% smooth on hover */
        @keyframes heroFanFloat0 {
          0%, 100% { top: 10px; }
          50% { top: 2px; }
        }
        @keyframes heroFanFloat1 {
          0%, 100% { top: 30px; }
          50% { top: 20px; }
        }
        @keyframes heroFanFloat2 {
          0%, 100% { top: 10px; }
          50% { top: 2px; }
        }

        .hero-fan-card {
          position: absolute;
          width: 205px;
          height: 287px;
          border-radius: 13px;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
          will-change: transform, box-shadow;
          background: transparent;
          border: none;
        }

        /* Base positions, float animations, and shadows on the single card element */
        .hero-fan-card-0 {
          left: 0;
          z-index: 2;
          transform: rotate(-8deg);
          animation: heroFanFloat0 4.6s ease-in-out infinite;
          box-shadow: ${isDark ? "0 20px 45px rgba(0,0,0,0.68)" : "0 16px 38px rgba(0,0,0,0.17)"};
        }
        .hero-fan-card-1 {
          left: 118px;
          z-index: 5;
          transform: rotate(0deg);
          animation: heroFanFloat1 5.0s ease-in-out infinite 0.5s;
          box-shadow: ${isDark ? "0 20px 45px rgba(0,0,0,0.68)" : "0 16px 38px rgba(0,0,0,0.17)"};
        }
        .hero-fan-card-2 {
          left: 235px;
          z-index: 2;
          transform: rotate(8deg);
          animation: heroFanFloat2 5.4s ease-in-out infinite 1.0s;
          box-shadow: ${isDark ? "0 20px 45px rgba(0,0,0,0.68)" : "0 16px 38px rgba(0,0,0,0.17)"};
        }

        /* Hover: pauses float and elevates smoothly on the same element */
        .hero-fan-card-0:hover {
          animation-play-state: paused;
          z-index: 20 !important;
          transform: translateY(-24px) rotate(-8deg) scale(1.05);
          box-shadow: ${isDark ? "0 30px 70px rgba(0,0,0,0.88), 0 0 22px rgba(255,255,255,0.09)" : "0 28px 62px rgba(0,0,0,0.28)"};
        }
        .hero-fan-card-1:hover {
          animation-play-state: paused;
          z-index: 20 !important;
          transform: translateY(-24px) rotate(0deg) scale(1.05);
          box-shadow: ${isDark ? "0 30px 70px rgba(0,0,0,0.88), 0 0 22px rgba(255,255,255,0.09)" : "0 28px 62px rgba(0,0,0,0.28)"};
        }
        .hero-fan-card-2:hover {
          animation-play-state: paused;
          z-index: 20 !important;
          transform: translateY(-24px) rotate(8deg) scale(1.05);
          box-shadow: ${isDark ? "0 30px 70px rgba(0,0,0,0.88), 0 0 22px rgba(255,255,255,0.09)" : "0 28px 62px rgba(0,0,0,0.28)"};
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fu1 { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.08s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.16s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.24s forwards; opacity:0; }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-in { animation: modalIn 0.2s ease forwards; }
        @keyframes popIn { from{opacity:0;transform:scale(0.95) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .pop-in { animation: popIn 0.15s ease forwards; }
        .set-pill:hover  { border-color: ${c.text} !important; color: ${c.text} !important; }
        .rar-cell:hover  { border-color: ${tc.accent} !important; transform: translateY(-2px); background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} !important; }
        .rar-cell { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .strip-card:hover { transform: translateY(-5px); box-shadow: 0 12px 28px rgba(0,0,0,0.18); }
        .strip-card { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease; }
        .btn-primary:hover  { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary { transition: all 0.15s ease; }
        .btn-secondary:hover { background: ${c.bgTer} !important; transform: translateY(-1px); }
        .btn-secondary { transition: all 0.15s ease; }
        .theme-swatch:hover { border-color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"} !important; }
        .flagship-set-card:hover { transform: translateY(-3px); border-color: ${tc.accent} !important; box-shadow: 0 10px 24px rgba(0,0,0,0.12); }
        .flagship-set-card { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* ── 1. HEADER ── */}
      <header
        className="home-nav-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          background: c.bg,
          boxShadow: isDark
            ? `0 0 24px -4px ${tc.accent}35`
            : "0 8px 20px -6px rgba(0,0,0,0.12)",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        {/* LEFT: LOGO */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            className="home-nav-logo"
            src="/logo-light.png"
            alt="Enies Hobby logo"
            style={{ height: 48, width: "auto", objectFit: "contain", cursor: "pointer" }}
            onClick={() => router.push("/")}
          />
        </div>

        {/* RIGHT: NAV + THEME + AUTH */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* NAV LINKS */}
          <div className="home-nav-links" style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {["Dashboard", "Browse", "Binder", "Don!!", "About"].map((l) => (
              <button
                key={l}
                onClick={() => {
                  if (l === "Dashboard") router.push("/dashboard");
                  if (l === "Browse") handleBrowse();
                  if (l === "Binder") router.push("/binder");
                  if (l === "Don!!") router.push("/don");
                  if (l === "About") router.push("/about");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: c.textSec,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "10px 4px",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = c.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = c.textSec)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* LOGGED OUT: AUTH BUTTONS (Log in & Join) */}
          {mounted && !user && (
            <div className="home-nav-auth" style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <button
                onClick={() => openAuth()}
                style={{
                  background: "transparent",
                  border: "none",
                  color: c.textSec,
                  fontSize: 13,
                  cursor: "pointer",
                  padding: "6px 8px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = c.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = c.textSec)}
              >
                Log in
              </button>
              <button
                onClick={() => openAuth()}
                style={{
                  background: tc.accent,
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Join
              </button>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <div style={{ position: "relative" }}>
            <button
              className="home-mobile-menu-btn"
              onClick={() => setShowMobileNav((p) => !p)}
              aria-label="Toggle navigation menu"
              aria-expanded={showMobileNav}
              style={{
                display: "none",
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: c.text,
              }}
            >
              <Menu style={{ width: 18, height: 18 }} />
            </button>

            {showMobileNav && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 49 }}
                  onClick={() => setShowMobileNav(false)}
                />
                <div
                  className="pop-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: 190,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 16,
                    padding: 8,
                    zIndex: 50,
                    boxShadow: isDark
                      ? "0 16px 36px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)"
                      : "0 16px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {["Dashboard", "Browse", "Binder", "Don!!", "About"].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setShowMobileNav(false);
                        if (l === "Dashboard") router.push("/dashboard");
                        if (l === "Browse") handleBrowse();
                        if (l === "Binder") router.push("/binder");
                        if (l === "Don!!") router.push("/don");
                        if (l === "About") router.push("/about");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        color: c.text,
                        fontSize: 14,
                        padding: "10px 14px",
                        borderRadius: 10,
                        cursor: "pointer",
                        minHeight: 40,
                      }}
                    >
                      {l}
                    </button>
                  ))}

                </div>
              </>
            )}
          </div>

          {/* LOGGED IN: PROFILE AVATAR (VERY LAST) */}
          {mounted && user && (
            <button
              className="home-nav-profile-btn"
              onClick={() => router.push("/dashboard")}
              title="Open Collection Dashboard"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 2,
                borderRadius: "50%",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: tc.accent,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: `0 0 12px ${tc.accent}40`,
                }}
              >
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
            </button>
          )}
        </div>
      </header>

      {/* ERROR RECOVERY BANNER */}
      {homeCardsError && (
        <div
          style={{
            padding: "10px 24px",
            background: "rgba(239,68,68,0.12)",
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>
            Could not load featured card preview.
          </span>
          <button
            onClick={loadHomeData}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 8,
              background: "#ef4444",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── 2. HERO: ADVENTURE & COLLECTOR SHOWCASE ── */}
      <section
        className="home-hero"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          borderBottom: `1px solid ${c.border}`,
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          className="fu home-hero-text"
          style={{
            padding: "24px 36px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <div>
            {/* RELEASE BADGE */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                flexWrap: "wrap",
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  background: tc.accent,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                ONE PIECE TCG
              </span>
              <span style={{ fontSize: 11, color: c.textTer, fontWeight: 500, lineHeight: 1.4 }}>
                50+ Sets & Decks
              </span>
            </div>

            {/* ADVENTURE HEADLINE */}
            <h1
              className="home-hero-title"
              style={{
                fontFamily: "var(--font-display), 'Anton', 'Impact', sans-serif",
                lineHeight: 0.96,
                letterSpacing: "0.01em",
                color: c.text,
                marginBottom: 16,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              SET SAIL <br />
              FOR <br />
              YOUR <br />
              <span style={{ color: tc.accent }}
            >
              ULTIMATE<br />
              COLLECTION</span>.
            </h1>

            <p
              className="home-hero-desc"
              style={{
                fontSize: 13.5,
                color: c.textSec,
                lineHeight: 1.6,
                maxWidth: 400,
                marginBottom: 20,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              Search cards, track your personal binder, and inspect high-res art across every English set.
            </p>

            {/* INSTANT HERO SEARCH BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
                } else {
                  handleBrowse();
                }
              }}
              className="home-hero-search-form"
              style={{
                display: "flex",
                alignItems: "center",
                maxWidth: 450,
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                background: c.bgSec,
                border: `1.5px solid ${c.border}`,
                borderRadius: 12,
                padding: "3px 4px 3px 12px",
                marginBottom: 12,
                transition: "all 0.2s ease",
                overflow: "hidden",
              }}
            >
              <Search size={15} style={{ color: c.textTer, marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search card, set, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: "1 1 0px",
                  minWidth: 0,
                  width: 0,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: c.text,
                  fontSize: 13,
                  padding: "7px 0",
                }}
              />
              <button
                type="submit"
                style={{
                  background: tc.accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 9,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  transition: "opacity 0.15s",
                }}
              >
                <span>Find</span>
                <ArrowRight size={13} />
              </button>
            </form>

            {/* TRENDING QUICK TAGS (HORIZONTAL SCROLL ON MOBILE) */}
            <div
              className="home-quick-tags-container"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                overflowX: "auto",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                marginBottom: 22,
                paddingBottom: 4,
              }}
            >
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => router.push(`/browse?${tag.query}`)}
                  className="home-quick-tag"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${c.border}`,
                    borderRadius: 999,
                    padding: "3px 9px",
                    fontSize: 11,
                    color: c.textSec,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* PRIMARY CTAS */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%" }}>
              <button
                className="btn-primary home-hero-cta"
                onClick={() => handleBrowse()}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  background: c.text,
                  color: c.bg,
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Compass size={15} />
                <span>Explore all cards</span>
                <ArrowRight size={14} />
              </button>
              {mounted && user ? (
                <button
                  className="btn-secondary home-hero-cta"
                  onClick={() => router.push("/dashboard")}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: `1px solid ${c.border}`,
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    color: c.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <LayoutDashboard size={14} />
                  <span>My Dashboard</span>
                </button>
              ) : mounted && !user ? (
                <button
                  className="btn-secondary home-hero-cta"
                  onClick={() => openAuth()}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: `1px solid ${c.border}`,
                    background: "transparent",
                    color: c.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create free binder
                </button>
              ) : null}
            </div>
          </div>

          {/* LIVE METRICS */}
          <div
            className="home-hero-stats"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 14px",
              marginTop: 20,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {[
              cardCount ? `${cardCount.toLocaleString()} cards` : "3,400+ cards",
              "50+ Sets & Decks",
              "100% Free & Cloud Synced",
            ].map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  color: c.textTer,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                <CheckCircle2 size={12} style={{ color: "#16a34a", flexShrink: 0 }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* HOLOGRAPHIC CARD FAN STAGE */}
        <div
          className="home-hero-cards"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            className="home-hero-card-stack"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 440,
              height: 320,
              margin: "0 auto",
            }}
          >
            {STACK_META.map((meta, i) => {
              const card = stackCards[i];
              const hasCard = !!card;
              const shouldFlip = hasCard && !stackRevealed;
              const backSrc =
                card?.type?.toUpperCase() === "LEADER"
                  ? "/card-back-leader.png"
                  : "/card-back.png";

              return (
                <div
                  key={`${card?.id ?? "empty"}-${i}`}
                  className={`hero-fan-card ${meta.cls}`}
                  onClick={() => {
                    if (card) {
                      setSelectedCard(card);
                      setSelectedIndex(i);
                      setPreviewCards((prev) => (prev.length > 0 ? prev : stackCards));
                    }
                  }}
                  title={card ? `Inspect ${card.name}` : undefined}
                >
                  {/* CARD IMAGE CONTAINER */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "transparent",
                      transformStyle: shouldFlip ? "preserve-3d" : "flat",
                      animationName: shouldFlip ? "cardFlipIn" : "none",
                      animationDuration: "0.5s",
                      animationTimingFunction: "ease",
                      animationFillMode: "forwards",
                      animationDelay: shouldFlip ? `${i * 0.12}s` : "0s",
                    }}
                    onAnimationEnd={
                      hasCard && i === STACK_META.length - 1
                        ? () => setStackRevealed(true)
                        : undefined
                    }
                  >
                    {(!hasCard || !cardLoaded[i] || shouldFlip) && (
                      <img
                        src={backSrc}
                        alt=""
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: 12,
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: shouldFlip ? "rotateY(180deg)" : "none",
                        }}
                      />
                    )}
                    {hasCard && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "transparent",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <img
                          src={card.images?.large}
                          alt={card.name}
                          loading="eager"
                          fetchPriority="high"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            borderRadius: 12,
                            background: "transparent",
                          }}
                          onLoad={() => setCardLoaded((prev) => ({ ...prev, [i]: true }))}
                          onError={() => {
                            setStackCards((prev) => prev.filter((sc) => sc !== card));
                            setCardLoaded((prev) => {
                              const next = { ...prev };
                              delete next[i];
                              return next;
                            });
                          }}
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

      {/* ── 3. AUTHENTIC 6-COLOR ONE PIECE STRIPE ── */}
      <div style={{ display: "flex", height: 4 }}>
        {["#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#374151", "#eab308"].map((col) => (
          <div key={col} style={{ flex: 1, background: col }} />
        ))}
      </div>

      {/* ── 4. THE GRAND LINE: FLAGSHIP BOOSTER EXPLORER ── */}
      <section className="fu1" style={{ padding: "28px 24px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tc.accent }}>
              The Grand Line
            </span>
            <h2 style={{ fontFamily: "var(--font-display), 'Anton', 'Impact', sans-serif", fontSize: 22, color: c.text, margin: "2px 0 0" }}>
              Explore Booster Sets
            </h2>
          </div>
          <button
            onClick={() => handleBrowse()}
            style={{
              fontSize: 12,
              color: tc.accent,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>View all 50+ sets</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* SET CARDS GRID (HORIZONTAL CAROUSEL ON MOBILE) */}
        <div
          className="home-flagship-sets-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {FLAGSHIP_SETS.map((set) => (
            <button
              key={set.id}
              onClick={() => handleBrowse(set.id)}
              className="flagship-set-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "14px 16px",
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.bgSec,
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display), 'Anton', 'Impact', sans-serif",
                    fontSize: 15,
                    color: c.text,
                    letterSpacing: "0.04em",
                  }}
                >
                  {set.id}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    color: set.badgeColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {set.category}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.3, marginBottom: 4 }}>
                {set.name}
              </span>
              <span style={{ fontSize: 11, color: c.textTer, marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 3 }}>
                <span>Browse checklist</span>
                <ArrowRight size={11} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 5. THE COLLECTOR'S TOOLKIT ── */}
      <section className="fu2" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="home-features" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {[
            {
              n: "01",
              icon: SlidersHorizontal,
              title: "Instant Multi-Filter Engine",
              desc: "Stack filters across card color, card type, power, counter value, cost, and rarity. Search by card ID or character name with zero delay.",
              action: () => handleBrowse(),
            },
            {
              n: "02",
              icon: BookOpen,
              title: "Cloud Binder & Wishlist Sync",
              desc: "Track your owned physical collection in visual binders. Bookmark chase pulls, monitor set milestones, and sync seamlessly across devices.",
              action: () => router.push("/binder"),
            },
            {
              n: "03",
              icon: Zap,
              title: "DON!! & Leader Abilities",
              desc: "Inspect DON!! cards and leader abilities. Review card effects, tournament rulings, and high-res alternate artwork in full 3D detail.",
              action: () => router.push("/don"),
            },
          ].map((f, i) => {
            const FeatureIcon = f.icon;
            return (
              <div
                key={f.n}
                onClick={f.action}
                className="home-feature-item"
                style={{
                  padding: "26px 28px",
                  borderRight: i < 2 ? `1px solid ${c.border}` : "none",
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display), 'Anton', 'Impact', sans-serif",
                      fontSize: 15,
                      color: tc.accent,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {f.n}
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: c.textSec,
                    }}
                  >
                    <FeatureIcon size={16} />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: c.text,
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{f.title}</span>
                  <ArrowRight
                    size={13}
                    className="feature-arrow"
                    style={{ opacity: 0, transform: "translateX(-4px)", transition: "all 0.2s" }}
                  />
                </div>
                <div style={{ fontSize: 12, color: c.textSec, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. RARITY & PULL-RATE CODEX ── */}
      <section
        className="fu2 home-sets-rarities"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        {/* SET PILL SELECTOR */}
        <div style={{ padding: "24px 28px", borderRight: `1px solid ${c.border}` }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tc.accent,
              marginBottom: 14,
            }}
          >
            Browse by set checklist
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => {
                setActiveSet(null);
                handleBrowse();
              }}
              className="set-pill home-set-pill"
              style={{
                fontSize: 11,
                padding: "6px 12px",
                borderRadius: 99,
                border: `0.5px solid ${activeSet === null ? c.text : c.border}`,
                background: activeSet === null ? c.text : "transparent",
                color: activeSet === null ? c.bg : c.textSec,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              All Sets
            </button>
            {FEATURED_SETS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setActiveSet(s);
                  handleBrowse(s);
                }}
                className="set-pill home-set-pill"
                style={{
                  fontSize: 11,
                  padding: "6px 12px",
                  borderRadius: 99,
                  border: `0.5px solid ${activeSet === s ? c.text : c.border}`,
                  background: activeSet === s ? c.text : "transparent",
                  color: activeSet === s ? c.bg : c.textSec,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => handleBrowse()}
              style={{
                fontSize: 11,
                padding: "6px 2px",
                background: "transparent",
                border: "none",
                color: tc.accent,
                cursor: "pointer",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span>More sets</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* RARITY MATRIX */}
        <div style={{ padding: "24px 28px" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tc.accent,
              marginBottom: 14,
            }}
          >
            Rarity Codex & Lore
          </div>
          <div className="home-rarity-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {RARITIES.map((r) => (
              <div
                key={r.label}
                className="rar-cell"
                onClick={() => setSelectedRarity(r)}
                style={{
                  padding: "12px 8px",
                  borderRadius: 10,
                  border: `0.5px solid ${c.border}`,
                  textAlign: "center",
                  cursor: "pointer",
                  background: c.bgSec,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    display: "block",
                    color: tc.accent,
                    marginBottom: 2,
                  }}
                >
                  {r.label}
                </span>
                <span style={{ fontSize: 9, color: c.textTer, fontWeight: 500 }}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. LIVE CARD GALLERY STRIP ── */}
      <div className="fu3 home-card-strip-section" style={{ padding: "22px 28px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tc.accent }}>
            Featured Card Previews
          </span>
          <span
            onClick={() => handleBrowse()}
            style={{
              fontSize: 12,
              color: tc.accent,
              cursor: "pointer",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span>View all cards</span>
            <ArrowRight size={13} />
          </span>
        </div>
        <div className="home-card-strip" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }}>
          {CARD_PREVIEWS.map((meta, i) => {
            const real = previewCards[i];
            const hasReal = !!real;
            const shouldFlip = hasReal && !previewRevealed;
            const backSrc =
              real?.type?.toUpperCase() === "LEADER"
                ? "/card-back-leader.png"
                : "/card-back.png";

            return (
              <div
                key={`${real?.id ?? "empty"}-${i}`}
                className="strip-card"
                onClick={() => {
                  setSelectedCard(real ?? null);
                  setSelectedIndex(i);
                }}
                style={{
                  aspectRatio: "0.72",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  boxShadow: isDark
                    ? "0 10px 24px rgba(0,0,0,0.5)"
                    : "0 8px 20px rgba(0,0,0,0.12)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  perspective: shouldFlip ? "700px" : "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformStyle: shouldFlip ? "preserve-3d" : "flat",
                    animationName: shouldFlip ? "cardFlipIn" : "none",
                    animationDuration: "0.5s",
                    animationTimingFunction: "ease",
                    animationFillMode: "forwards",
                    animationDelay: shouldFlip ? `${i * 0.05}s` : "0s",
                  }}
                  onAnimationEnd={
                    hasReal && i === CARD_PREVIEWS.length - 1
                      ? () => setPreviewRevealed(true)
                      : undefined
                  }
                >
                  {(!hasReal || shouldFlip) && (
                    <img
                      src={backSrc}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 10,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: shouldFlip ? "rotateY(180deg)" : "none",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/card-back.png";
                      }}
                    />
                  )}
                  {hasReal && (
                    <img
                      src={real.images?.small}
                      alt={real.name}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        backfaceVisibility: shouldFlip ? "hidden" : "visible",
                        WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible",
                      }}
                      onError={() => setPreviewCards((prev) => prev.filter((pc) => pc !== real))}
                    />
                  )}
                </div>
              </div>
            );
          })}
          <div
            onClick={() => handleBrowse()}
            style={{
              aspectRatio: "0.72",
              borderRadius: 10,
              border: `1.5px dashed ${c.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              gap: 4,
            }}
          >
            <Compass size={18} style={{ color: tc.accent }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: c.textSec }}>View all</span>
          </div>
        </div>
      </div>

      {/* ── 8. FOOTER ── */}
      <footer
        className="home-footer"
        style={{
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${c.border}`,
          position: "relative",
        }}
      >
        <div className="home-footer-inner" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            onClick={() => router.push("/")}
            src="/logo-light.png"
            alt="Enies Hobby footer logo"
            style={{ height: 32, width: "auto", objectFit: "contain", cursor: "pointer" }}
          />
          <span style={{ fontSize: 11, color: c.textTer }}>
            English cards only · May not reflect the latest releases · Not affiliated with Bandai ·{" "}
            <span
              onClick={() => router.push("/disclaimer")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Disclaimer
            </span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* THEME PICKER BUTTON IN FOOTER */}
          {mounted && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setShowThemePicker((p) => {
                    const next = !p;
                    if (next) setThemeMode(isDark ? "dark" : "light");
                    return next;
                  });
                }}
                aria-label="Change color theme"
                title="Change theme"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: showThemePicker
                    ? isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)"
                    : isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  border: `1px solid ${c.border}`,
                  color: c.textSec,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Palette style={{ width: 14, height: 14, color: tc.accent }} />
                <span>Theme</span>
              </button>

              {showThemePicker && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 90,
                      background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)",
                      backdropFilter: "blur(2px)",
                      WebkitBackdropFilter: "blur(2px)",
                    }}
                    onClick={() => setShowThemePicker(false)}
                  />
                  <div
                    className="pop-in home-theme-popover"
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      right: 0,
                      width: 280,
                      maxHeight: "calc(100vh - 100px)",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 16,
                      padding: 16,
                      zIndex: 100,
                      boxShadow: isDark
                        ? "0 16px 36px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)"
                        : "0 16px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 2, color: c.text, fontSize: 14 }}>
                      Themes
                    </div>
                    <div style={{ fontSize: 11, color: c.textSec, marginBottom: 14 }}>
                      Choose your visual experience
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        background: c.bgTer,
                        padding: 4,
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    >
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
                                ? isDark
                                  ? "rgba(255,255,255,0.04)"
                                  : "rgba(0,0,0,0.02)"
                                : "transparent",
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 34,
                                borderRadius: 6,
                                background: t.preview.bg,
                                position: "relative",
                                overflow: "hidden",
                                flexShrink: 0,
                                border: `1px solid ${c.border}`,
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: 5,
                                  left: 5,
                                  width: 24,
                                  height: 4,
                                  borderRadius: 2,
                                  background: t.preview.dark
                                    ? "rgba(255,255,255,0.15)"
                                    : "rgba(0,0,0,0.12)",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 5,
                                  right: 5,
                                  width: 14,
                                  height: 4,
                                  borderRadius: 2,
                                  background: t.preview.bar,
                                }}
                              />
                            </div>

                            <span
                              style={{
                                flex: 1,
                                fontSize: 13,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? tc.accent : c.text,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {t.name}
                            </span>

                            {isActive && (
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                                <path
                                  d="M3 7.5L6.5 11L12 4"
                                  stroke={tc.accent}
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
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
          <span style={{ fontSize: 11, color: c.textTer }}>© 2026 Enies Hobby TCG</span>
        </div>
      </footer>

      {/* ── RARITY INFO MODAL ── */}
      {selectedRarity && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setSelectedRarity(null)}
        >
          <div
            className="modal-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: c.bg,
              borderRadius: 16,
              border: `1px solid ${c.border}`,
              width: "100%",
              maxWidth: 420,
              overflow: "hidden",
              boxShadow: isDark
                ? "0 32px 64px rgba(0,0,0,0.6)"
                : "0 32px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>
                    {selectedRarity.name}
                  </span>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    width: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display), 'Anton', 'Impact', sans-serif",
                    fontWeight: 400,
                    fontSize: 18,
                    color: "#000",
                    background: selectedRarity.label === "SEC" ? "#f59e0b" : "#ffffff",
                    border: `1px solid ${selectedRarity.label === "SEC" ? "#92400e" : "#000"}`,
                    borderRadius: 8,
                    padding: "2px 10px",
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {selectedRarity.label}
                </span>
              </div>
              <div style={{ height: "0.5px", background: c.border, marginBottom: 14 }} />
              <p style={{ fontSize: 13, color: c.textSec, lineHeight: 1.7, margin: "0 0 14px" }}>
                {selectedRarity.description}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                <span style={{ fontSize: 12, color: c.textTer }}>Pull rate benchmark:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>
                  {selectedRarity.pullRate}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setSelectedRarity(null)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    border: `0.5px solid ${c.border}`,
                    background: "transparent",
                    color: c.text,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = c.bgSec;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setSelectedRarity(null);
                    router.push(`/browse?rarity=${selectedRarity.label}`);
                  }}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    background: tc.accent,
                    color: "#fff",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.88";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <span>View {selectedRarity.label} cards</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD DETAIL MODAL ── */}
      {selectedCard && (
        <div
          className="card-modal-outer home-card-modal-outer"
          style={{
            position: "fixed",
            inset: 0,
            background: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => {
            setSelectedCard(null);
            setSelectedIndex(-1);
          }}
        >
          <div
            className="card-modal-nav-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              width: "100%",
              maxWidth: 960,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-prev"
                onClick={() => {
                  const next = Math.max(selectedIndex - 1, 0);
                  setSelectedIndex(next);
                  setSelectedCard(previewCards[next] ?? null);
                }}
                disabled={selectedIndex <= 0}
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.text,
                  cursor: selectedIndex > 0 ? "pointer" : "not-allowed",
                  opacity: selectedIndex <= 0 ? 0.3 : 1,
                  transition: "all 0.2s",
                  boxShadow: isDark
                    ? "0 20px 25px rgba(0,0,0,0.4)"
                    : "0 10px 15px rgba(0,0,0,0.1)",
                }}
              >
                <ChevronLeft style={{ width: 20, height: 20 }} />
              </button>
            )}
            <div
              className="card-modal-container"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
              style={{
                flex: 1,
                background: c.bg,
                borderRadius: 20,
                border: `1px solid ${c.border}`,
                overflow: "hidden",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: isDark
                  ? "0 32px 64px rgba(0,0,0,0.5)"
                  : "0 32px 64px rgba(0,0,0,0.15)",
              }}
            >
              <div
                className="card-modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 24px",
                  borderBottom: `1px solid ${c.border}`,
                  flexShrink: 0,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      color: c.text,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {selectedCard.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: c.textTer,
                      fontFamily: "monospace",
                      marginTop: 2,
                    }}
                  >
                    {selectedCard.id}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setSelectedIndex(-1);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X style={{ width: 20, height: 20, color: c.textTer }} />
                </button>
              </div>
              <div
                className="card-modal-body"
                style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}
              >
                <div
                  className="card-modal-image-pane"
                  style={{
                    width: "48%",
                    flexShrink: 0,
                    background: tc.bg.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 20px 24px 28px",
                  }}
                >
                  <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
                    <ModalCardImage
                      key={
                        selectedCard.images?.large ??
                        selectedCard.images?.small ??
                        selectedCard.id
                      }
                      src={
                        selectedCard.images?.large ||
                        selectedCard.images?.small ||
                        "/card-placeholder.png"
                      }
                      alt={selectedCard.name}
                      isLeader={selectedCard.type?.toUpperCase() === "LEADER"}
                      isDark={isDark}
                    />
                  </div>
                </div>
                <div
                  className="card-modal-details-pane"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflowY: "auto",
                    padding: "24px 28px 24px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div
                    className="card-modal-detail-grid"
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
                  >
                    {(
                      [
                        ["Type", selectedCard.type],
                        ["Rarity", selectedCard.rarity],
                        ["Color", selectedCard.color],
                        ["Cost", selectedCard.cost],
                        ["Power", selectedCard.power],
                        ["Counter", selectedCard.counter],
                        ["Attribute", selectedCard.attribute?.name],
                        ["Family", selectedCard.family],
                        ["Set", selectedCard.set?.name],
                      ] as [string, unknown][]
                    )
                      .filter(([, v]) => v != null && v !== "" && v !== "-")
                      .map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            background: c.bgSec,
                            borderRadius: 10,
                            padding: "10px 14px",
                            border: `1px solid ${c.border}`,
                            minWidth: 0,
                            gridColumn: label === "Set" ? "1 / -1" : undefined,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: c.textTer,
                              marginBottom: 3,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              fontWeight: 700,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: c.text,
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            {label === "Family" &&
                            typeof value === "string" &&
                            value.includes("/") ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {value.split("/").map((part, idx) => (
                                  <div key={idx} style={{ lineHeight: 1.35 }}>
                                    {part.trim()}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              String(value)
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  {selectedCard.ability && (
                    <div
                      style={{
                        background: c.bgSec,
                        borderRadius: 10,
                        padding: "12px 14px",
                        border: `1px solid ${c.border}`,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: c.textTer,
                          marginBottom: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 700,
                        }}
                      >
                        Effect
                      </div>
                      <div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>
                        {selectedCard.ability}
                      </div>
                    </div>
                  )}
                  {selectedCard.trigger && selectedCard.trigger !== "" && (
                    <div
                      style={{
                        background: isDark
                          ? "rgba(217,119,6,0.1)"
                          : "rgba(251,191,36,0.08)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        border: `1px solid ${
                          isDark ? "rgba(251,191,36,0.2)" : "rgba(217,119,6,0.2)"
                        }`,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: isDark ? "#fbbf24" : "#d97706",
                          marginBottom: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 700,
                        }}
                      >
                        Trigger
                      </div>
                      <div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>
                        {selectedCard.trigger}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="card-modal-footer"
                style={{
                  borderTop: `1px solid ${c.border}`,
                  padding: "10px 24px",
                  textAlign: "center",
                  fontSize: 12,
                  color: c.textTer,
                  flexShrink: 0,
                }}
              >
                {selectedIndex + 1} / {previewCards.length}
              </div>
            </div>
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-next"
                onClick={() => {
                  const next = Math.min(selectedIndex + 1, previewCards.length - 1);
                  setSelectedIndex(next);
                  setSelectedCard(previewCards[next] ?? null);
                }}
                disabled={selectedIndex >= previewCards.length - 1}
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.text,
                  cursor:
                    selectedIndex < previewCards.length - 1 ? "pointer" : "not-allowed",
                  opacity: selectedIndex >= previewCards.length - 1 ? 0.3 : 1,
                  transition: "all 0.2s",
                  boxShadow: isDark
                    ? "0 20px 25px rgba(0,0,0,0.4)"
                    : "0 10px 15px rgba(0,0,0,0.1)",
                }}
              >
                <ChevronRight style={{ width: 20, height: 20 }} />
              </button>
            )}
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
