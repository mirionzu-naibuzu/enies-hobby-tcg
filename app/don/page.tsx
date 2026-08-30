"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Search, ChevronLeft, ChevronRight, X, BookmarkPlus, Check, BookOpen, Plus, Star, ArrowUp, Sparkles } from "lucide-react";
import { getColors } from "@/lib/themes";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getBinders, addCardToBinder, removeCardFromBinder, getBinderCards, createBinder,
  getDonCardKey, getUserCards, addUserCard, removeUserCard,
  type Binder, type UserCard,
} from "@/lib/binder";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { getAllDonCards } from "@/lib/api";
import ModalCardImage from "@/components/ModalCardImage";
import Toast, { ToastData, ToastType } from "@/components/Toast";

interface DonCard {
  card_name: string;
  card_text: string;
  rarity: string;
  card_type?: string;
  don_id?: string | null;
  card_image: string;
  card_image_id?: string;
  optcg_don_name: string;
  inventory_price: number;
  market_price: number;
}

// Extract a clean display name from the full card_name
const getDonCardName = (name: string) => {
  // "DON!! Card (Donquixote Doflamingo) (Gold)" → "Donquixote Doflamingo (Gold)"
  const match = name.match(/DON!! Card \(([^)]+)\)(.*)/);
  if (match) return (match[1] + match[2]).trim();
  return name;
};

// Parse set info from optcg_don_name
const getDonSetName = (optcgName: string) => {
  const match = optcgName.match(/ - (.+)$/);
  return match ? match[1].trim() : "";
};

export default function DonCardsPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [donCards, setDonCards] = useState<DonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [animatedKey, setAnimatedKey] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Modal state
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showBinderPicker, setShowBinderPicker] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auth + binder + userCards state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [binderCardMap, setBinderCardMap] = useState<Record<string, string[]>>({});

  const wishlistSet = useMemo(
    () => new Set(userCards.filter((u) => u.in_wishlist).map((u) => u.card_id)),
    [userCards]
  );

  // Inline binder creation
  const [creatingBinderInline, setCreatingBinderInline] = useState(false);
  const [newBinderNameInline, setNewBinderNameInline] = useState("");
  const [creatingBinderLoading, setCreatingBinderLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, toast.type === "celebrate" ? 3200 : 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const colors = {
    bg: { primary: tc.bg.primary, secondary: tc.bg.secondary, tertiary: tc.bg.tertiary },
    text: { primary: tc.text.primary, secondary: tc.text.secondary, tertiary: tc.text.tertiary },
    border: tc.border,
    accent: tc.accent,
  };

  const handleModalTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || showBinderPicker) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && selectedIndex < filteredCards.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setShowBinderPicker(false);
      setCreatingBinderInline(false);
      setNewBinderNameInline("");
    } else if (dx > 0 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setShowBinderPicker(false);
      setCreatingBinderInline(false);
      setNewBinderNameInline("");
    }
  };

  //scroll lock
  useBodyScrollLock(selectedIndex >= 0);

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

    return () => {
      mqMobile.removeEventListener("change", handlerMobile);
      mqLand.removeEventListener("change", handlerLand);
    };
  }, []);

  // Auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load binders and userCards
  useEffect(() => {
    if (!user) { setUserCards([]); setBinders([]); setBinderCardMap({}); return; }
    getUserCards(user.id).then(cards => setUserCards(cards));
    getBinders(user.id).then(b => setBinders(b));
  }, [user]);

  // Load binder membership
  useEffect(() => {
    if (!binders.length) return;
    Promise.all(binders.map(b => getBinderCards(b.id).then(cards => ({ id: b.id, cards }))))
      .then(results => {
        const map: Record<string, string[]> = {};
        for (const r of results) map[r.id] = r.cards;
        setBinderCardMap(map);
      });
  }, [binders]);

  useEffect(() => {
    async function fetchDonCards() {
      try {
        const data = await getAllDonCards();
        setDonCards(data);
      } catch (err) {
        console.error("Error fetching DON!! cards:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonCards();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setFilterKey(k => k + 1); }, [activeFilter]);
  useEffect(() => {
    const t = setTimeout(() => setFilterKey(k => k + 1), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Global search shortcut (/)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        selectedIndex < 0
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedIndex]);

  // Keyboard nav for modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showBinderPicker) { if (e.key === "Escape") { setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); } return; }
      if (selectedIndex < 0) return;
      e.preventDefault();
      if (e.key === "ArrowRight" && selectedIndex < filteredCards.length - 1) setSelectedIndex(prev => prev + 1);
      if (e.key === "ArrowLeft" && selectedIndex > 0) setSelectedIndex(prev => prev - 1);
      if (e.key === "Escape") { setSelectedIndex(-1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, showBinderPicker]);

  const filteredCards = useMemo(() => {
    return donCards.filter((card) => {
      const matchesSearch =
        card.card_name.toLowerCase().includes(search.toLowerCase()) ||
        card.optcg_don_name?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ? true
        : activeFilter === "Gold" ? card.card_name.toLowerCase().includes("(gold)")
        : true;
      return matchesSearch && matchesFilter;
    });
  }, [donCards, search, activeFilter]);

  const isAnimating = animatedKey < filterKey;
  const selected = selectedIndex >= 0 ? filteredCards[selectedIndex] : null;

  // Wishlist & Binder actions
  const handleToggleWishlist = async (cardKey: string) => {
    if (!user) return;
    if (wishlistSet.has(cardKey)) {
      setUserCards(prev => prev.filter(u => u.card_id !== cardKey));
      showToast("Removed from wishlist", "info");
      await removeUserCard(user.id, cardKey);
    } else {
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: true }]);
      showToast("Added to wishlist", "wishlist");
      await addUserCard(user.id, cardKey, true);
    }
  };

  const handleToggleBinderCard = async (binderId: string, cardKey: string) => {
    const current = binderCardMap[binderId] ?? [];
    const bName = binders.find(b => b.id === binderId)?.name;
    if (current.includes(cardKey)) {
      await removeCardFromBinder(binderId, cardKey);
      setBinderCardMap(prev => ({ ...prev, [binderId]: prev[binderId].filter(id => id !== cardKey) }));
      showToast(bName ? `Removed from "${bName}"` : "Removed from binder", "info");
    } else {
      await addCardToBinder(binderId, cardKey);
      setBinderCardMap(prev => ({ ...prev, [binderId]: [...(prev[binderId] ?? []), cardKey] }));
      showToast(bName ? `Added to "${bName}"` : "Added to binder", "success");
    }
  };

  const handleCreateBinderInline = async (cardKey: string) => {
    if (!user || !newBinderNameInline.trim() || creatingBinderLoading) return;
    setCreatingBinderLoading(true);
    const b = await createBinder(user.id, newBinderNameInline.trim());
    if (b) {
      setBinders(prev => [...prev, b]);
      await addCardToBinder(b.id, cardKey);
      setBinderCardMap(prev => ({ ...prev, [b.id]: [cardKey] }));
      showToast(`Binder "${b.name}" created!`, "celebrate");
    }
    setNewBinderNameInline("");
    setCreatingBinderInline(false);
    setCreatingBinderLoading(false);
  };

  const isInAnyBinder = (cardKey: string) =>
    Object.values(binderCardMap).some(cards => cards.includes(cardKey));

  const closeModal = () => {
    setSelectedIndex(-1);
    setShowBinderPicker(false);
    setCreatingBinderInline(false);
    setNewBinderNameInline("");
  };

  return (
    <div
      className="don-wrapper"
      suppressHydrationWarning
      style={{ minHeight: "100vh", background: colors.bg.primary, transition: "background 0.3s", color: colors.text.primary, marginLeft: 70 }}
    >
      <style>{`
        @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .don-skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      <Sidebar />

      {/* ── UNIFIED HEADER & TOOLBAR ── */}
      <header
        className="don-header-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.bg.primary,
          gap: 16,
        }}
      >
        {/* Left: Title & Count Badge */}
        <div
          className="don-header-left"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              margin: 0,
              color: colors.text.primary,
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
            }}
          >
            DON<span style={{ color: colors.accent }}>!!</span> Cards
          </h1>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 600,
              color: colors.text.tertiary,
              background: colors.bg.tertiary,
              padding: "3px 9px",
              borderRadius: 20,
              border: `1px solid ${colors.border}`,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Loading..." : `${filteredCards.length} ${filteredCards.length === 1 ? "card" : "cards"}`}
          </div>
        </div>

        {/* Right: Search & Filter Chips */}
        <div
          className="don-header-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Search Box */}
          <div
            className="don-search-input-wrap"
            style={{ position: "relative", width: 220 }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.text.tertiary,
                pointerEvents: "none",
              }}
            />
            <input
              ref={searchInputRef}
              className="don-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search DON!! (/)"
              style={{
                width: "100%",
                padding: "7px 28px 7px 32px",
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.bg.secondary,
                color: colors.text.primary,
                outline: "none",
                fontSize: 13,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.text.tertiary,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Rectangular Toggle Switch (All <-> Gold) */}
          <button
            type="button"
            role="switch"
            aria-checked={activeFilter === "Gold"}
            aria-label={`Toggle Gold DON!! cards (currently ${activeFilter})`}
            onClick={() => setActiveFilter(prev => prev === "Gold" ? "All" : "Gold")}
            className="don-capsule-toggle"
            style={{
              position: "relative",
              width: 78,
              height: 34,
              borderRadius: 8,
              background: activeFilter === "Gold"
                ? isDark
                  ? "linear-gradient(135deg, #d97706, #b45309)"
                  : "linear-gradient(135deg, #eab308, #ca8a04)"
                : colors.bg.tertiary,
              border: `1px solid ${activeFilter === "Gold" ? (isDark ? "#b45309" : "#ca8a04") : colors.border}`,
              cursor: "pointer",
              padding: 0,
              outline: "none",
              userSelect: "none",
              flexShrink: 0,
              boxShadow: activeFilter === "Gold"
                ? isDark
                  ? "0 2px 10px rgba(217, 119, 6, 0.25), inset 0 1px 1px rgba(255,255,255,0.15)"
                  : "0 2px 8px rgba(202, 138, 4, 0.2), inset 0 1px 1px rgba(255,255,255,0.3)"
                : isDark
                ? "inset 0 1px 2px rgba(0,0,0,0.3)"
                : "inset 0 1px 2px rgba(0,0,0,0.06)",
              transition: "background 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Embossed Text: GOLD on Left (Uncovered when ON) */}
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "#ffffff",
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                opacity: activeFilter === "Gold" ? 1 : 0,
                transform: activeFilter === "Gold" ? "translate3d(0, 0, 0)" : "translate3d(-3px, 0, 0)",
                transition: "opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1), transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
                pointerEvents: "none",
              }}
            >
              GOLD
            </span>

            {/* Embossed Text: ALL on Right (Uncovered when OFF) */}
            <span
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: colors.text.secondary,
                opacity: activeFilter === "Gold" ? 0 : 1,
                transform: activeFilter === "Gold" ? "translate3d(3px, 0, 0)" : "translate3d(0, 0, 0)",
                transition: "opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1), transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
                pointerEvents: "none",
              }}
            >
              ALL
            </span>

            {/* Floating Rectangular Slider Knob */}
            <div
              style={{
                position: "absolute",
                top: 3,
                left: 3,
                width: 26,
                height: 26,
                borderRadius: 5,
                background: "#ffffff",
                boxShadow: isDark
                  ? "0 2px 5px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.3)"
                  : "0 2px 5px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.1)",
                transform: activeFilter === "Gold" ? "translate3d(44px, 0, 0)" : "translate3d(0px, 0, 0)",
                transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
            />
          </button>
        </div>
      </header>

      {/* GRID */}
      <main className="don-main" style={{ padding: "12px 24px 64px" }}>
        {loading ? (
          <div className="don-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="don-skeleton" style={{ borderRadius: 14, background: colors.bg.tertiary, border: `1px solid ${colors.border}`, aspectRatio: "5 / 7" }} />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 96, paddingBottom: 96, color: colors.text.tertiary, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="/nocard.png" alt="No cards found" style={{ width: 120, height: 120, objectFit: "contain", marginBottom: 20, opacity: isDark ? 0.9 : 1 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div style={{ fontWeight: 700, fontSize: 20, color: colors.text.primary }}>No cards found</div>
            <div style={{ fontSize: 14, marginTop: 6, color: colors.text.tertiary }}>Try a different search</div>
          </div>
        ) : (
          <div className="don-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 10 }}>
            {filteredCards.map((card, i) => {
              const cardKey = getDonCardKey(card);
              const isGold = card.card_name.toLowerCase().includes("(gold)");
              const isWished = wishlistSet.has(cardKey);
              const shouldFlip = isAnimating && i < 10;
              const isLastFlip = i === Math.min(9, filteredCards.length - 1);

              return (
                <div
                  key={`${filterKey}-${i}`}
                  style={{ cursor: "pointer", perspective: shouldFlip ? "1000px" : "none" }}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div
                    style={{ position: "relative", transformStyle: shouldFlip ? "preserve-3d" : "flat", animationName: shouldFlip ? "cardFlipIn" : "none", animationDuration: shouldFlip ? "0.5s" : "0s", animationTimingFunction: "ease", animationFillMode: "forwards", animationDelay: shouldFlip ? `${i * 0.03}s` : "0s", willChange: shouldFlip ? "transform" : "auto" }}
                    onAnimationEnd={isLastFlip ? () => setAnimatedKey(filterKey) : undefined}
                  >
                    {shouldFlip && (
                      <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden" }}>
                        <img src="/don-back.png" alt="" style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-back.png"; }} />
                      </div>
                    )}
                    <div style={{ backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible", position: "relative" }}>
                      <div
                        style={{
                          borderRadius: 14,
                          overflow: "hidden",
                          background: colors.bg.secondary,
                          border: isGold
                            ? "1px solid #facc15"
                            : `1px solid ${colors.border}`,
                          transition: "all 0.25s ease",
                          boxShadow: isGold
                            ? "0 0 25px rgba(250,204,21,0.2)"
                            : isDark
                            ? "0 10px 30px rgba(0,0,0,0.4)"
                            : "0 10px 25px rgba(0,0,0,0.08)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px) scale(1.02)"; e.currentTarget.style.boxShadow = isGold ? "0 0 40px rgba(250,204,21,0.35)" : "0 20px 40px rgba(0,0,0,0.25)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = isGold ? "0 0 25px rgba(250,204,21,0.2)" : isDark ? "0 10px 30px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.08)"; }}
                      >
                        <div style={{ width: "100%", aspectRatio: "5 / 7", background: colors.bg.tertiary, overflow: "hidden" }}>
                          <img src={card.card_image || "/card-placeholder.png"} alt={card.card_name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                        </div>
                      </div>
                      {isWished && (
                        <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)", zIndex: 2 }}>
                          <Star size={11} fill="#fff" color="#fff" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── CARD DETAIL MODAL ── */}
      {selected && (
        <div
          className="card-modal-outer"
          style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={closeModal}
        >
          <div className="card-modal-nav-row" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
            {/* Prev */}
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-prev"
                onClick={() => { setSelectedIndex(selectedIndex - 1); setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                disabled={selectedIndex <= 0}
                style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: colors.bg.primary, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary, cursor: selectedIndex > 0 ? "pointer" : "not-allowed", opacity: selectedIndex <= 0 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Modal card */}
            <div
              className="card-modal-container"
              role="dialog"
              aria-modal="true"
              aria-label={getDonCardName(selected.card_name)}
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
              style={{ flex: 1, background: colors.bg.primary, borderRadius: 20, border: `1px solid ${colors.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}
            >

              {/* Header */}
              <div className="card-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: colors.text.primary, letterSpacing: "-0.02em" }}>
                    {getDonCardName(selected.card_name)}
                  </div>
                  <div style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
                    {getDonSetName(selected.optcg_don_name)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                  {/* Binder / Wishlist Picker */}
                  {user && (() => {
                    const cardKey = getDonCardKey(selected);
                    const isWished = wishlistSet.has(cardKey);
                    const inAnyBinder = isInAnyBinder(cardKey);

                    return (
                      <div style={{ position: "relative" }}>
                        <button
                          className="card-modal-btn"
                          onClick={() => { setShowBinderPicker(p => !p); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                          title={isWished ? "Wishlist" : inAnyBinder ? "In binder" : "Add to binder"}
                          aria-label={isWished ? "Wishlist" : inAnyBinder ? "In binder" : "Add to binder"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: isMobile ? "7px 9px" : "7px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            border: `1px solid ${isWished ? "#f59e0b" : inAnyBinder ? "#16a34a" : colors.border}`,
                            background: isWished
                              ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)")
                              : inAnyBinder
                              ? (isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)")
                              : "transparent",
                            color: isWished ? "#d97706" : inAnyBinder ? "#16a34a" : colors.text.tertiary,
                          }}
                        >
                          {isWished ? <Star size={13} fill="currentColor" /> : inAnyBinder ? <Check size={14} /> : <BookmarkPlus size={14} />}
                          {!isMobile && (
                            <span className="card-modal-btn-label">
                              {isWished ? "Wishlist" : inAnyBinder ? "In binder" : "Add to binder"}
                            </span>
                          )}
                        </button>

                        {/* Picker dropdown */}
                        {showBinderPicker && (
                          <div
                            style={{
                              position: "absolute",
                              top: "calc(100% + 8px)",
                              right: 0,
                              width: 240,
                              background: colors.bg.primary,
                              border: `1px solid ${colors.border}`,
                              borderRadius: 12,
                              overflow: "hidden",
                              boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)",
                              zIndex: 10,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ padding: "8px" }}>
                              <button
                                onClick={() => handleToggleWishlist(cardKey)}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "9px 10px",
                                  borderRadius: 8,
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 13,
                                  textAlign: "left" as const,
                                  transition: "all 0.15s",
                                  background: isWished ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)") : "transparent",
                                  color: isWished ? "#d97706" : colors.text.primary,
                                }}
                                onMouseEnter={(e) => { if (!isWished) e.currentTarget.style.background = colors.bg.secondary; }}
                                onMouseLeave={(e) => { if (!isWished) e.currentTarget.style.background = "transparent"; }}
                              >
                                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${isWished ? "#d97706" : colors.border}`, background: isWished ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  {isWished && <Star size={10} fill="#fff" color="#fff" />}
                                </div>
                                Add to wishlist
                              </button>

                              <div style={{ height: "0.5px", background: colors.border, margin: "6px 0" }} />

                              <div style={{ fontSize: 10, color: colors.text.tertiary, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "4px 8px 6px" }}>
                                My binders
                              </div>

                              <div style={{ maxHeight: 180, overflowY: "auto" }}>
                                {binders.length === 0 && !creatingBinderInline && (
                                  <div style={{ fontSize: 12, color: colors.text.tertiary, padding: "6px 10px" }}>No binders yet.</div>
                                )}

                                {binders.map(binder => {
                                  const inBinder = (binderCardMap[binder.id] ?? []).includes(cardKey);
                                  return (
                                    <button
                                      key={binder.id}
                                      onClick={() => handleToggleBinderCard(binder.id, cardKey)}
                                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: inBinder ? (isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)") : "transparent", color: inBinder ? "#6366f1" : colors.text.primary }}
                                      onMouseEnter={(e) => { if (!inBinder) e.currentTarget.style.background = colors.bg.secondary; }}
                                      onMouseLeave={(e) => { if (!inBinder) e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <BookOpen size={14} style={{ flexShrink: 0 }} />
                                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{binder.name}</span>
                                      {inBinder && <Check size={12} strokeWidth={3} />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Inline new binder */}
                              {creatingBinderInline ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, margin: "4px 0" }}>
                                  <Plus size={13} style={{ flexShrink: 0, color: colors.text.tertiary }} />
                                  <input
                                    autoFocus
                                    value={newBinderNameInline}
                                    onChange={(e) => setNewBinderNameInline(e.target.value)}
                                    onKeyDown={(e) => {
                                      e.stopPropagation();
                                      if (e.key === "Enter") handleCreateBinderInline(cardKey);
                                      if (e.key === "Escape") { setCreatingBinderInline(false); setNewBinderNameInline(""); }
                                    }}
                                    placeholder="Binder name..."
                                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: colors.text.primary, fontFamily: "inherit", minWidth: 0 }}
                                  />
                                  <button
                                    onClick={() => handleCreateBinderInline(cardKey)}
                                    disabled={!newBinderNameInline.trim() || creatingBinderLoading}
                                    style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: "none", cursor: newBinderNameInline.trim() ? "pointer" : "not-allowed", background: newBinderNameInline.trim() ? "#16a34a" : colors.bg.tertiary, color: newBinderNameInline.trim() ? "#fff" : colors.text.tertiary, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setCreatingBinderInline(true)}
                                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: `1px dashed ${colors.border}`, cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: "transparent", color: colors.text.tertiary, marginTop: 4 }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.secondary; e.currentTarget.style.borderColor = colors.text.tertiary; e.currentTarget.style.color = colors.text.primary; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text.tertiary; }}
                                >
                                  <Plus size={14} style={{ flexShrink: 0 }} />
                                  New binder
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={20} color={colors.text.tertiary} />
                  </button>
                </div>
              </div>

              {/* Body — ModalCardImage replaces plain <img> */}
              <div className="card-modal-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div className="card-modal-image-pane" style={{ width: "100%", maxWidth: 320 }}>
                <ModalCardImage
                  key={selected.card_image || selected.card_name || selectedIndex}
                  src={selected.card_image || "/card-placeholder.png"}
                  alt={selected.card_name}
                  isDark={isDark}
                  backSrc="/don-back.png"
                />
                </div>
              </div>

              {/* Footer counter */}
              <div className="card-modal-footer" style={{ borderTop: `1px solid ${colors.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: colors.text.tertiary, flexShrink: 0 }}>
                {selectedIndex + 1} / {filteredCards.length}
              </div>
            </div>

            {/* Next */}
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-next"
                onClick={() => { setSelectedIndex(selectedIndex + 1); setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                disabled={selectedIndex >= filteredCards.length - 1}
                style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: colors.bg.primary, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary, cursor: selectedIndex < filteredCards.length - 1 ? "pointer" : "not-allowed", opacity: selectedIndex >= filteredCards.length - 1 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SCROLL TOP */}
      {showScrollTop && (
        <button
          className="don-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: tc.bg.tertiary,
            color: colors.text.primary,
            border: `1px solid ${colors.border}`,
            cursor: "pointer",
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.2)",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      )}
      <Toast toast={toast} isDark={isDark} />
    </div>
  );
}