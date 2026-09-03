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
      className="don-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5 transition-colors duration-300"
      suppressHydrationWarning
    >
      <style>{`
        @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .don-skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      <Sidebar />

      {/* ── UNIFIED HEADER & TOOLBAR ── */}
      <header className="don-header-bar flex items-center justify-between py-3.5 px-6 border-b border-border-theme bg-bg-primary gap-4 sticky top-0 z-20">
        {/* Left: Title & Count Badge */}
        <div className="don-header-left flex items-center gap-3 shrink-0">
          <h1 className="text-[22px] font-black m-0 text-text-primary tracking-tight whitespace-nowrap">
            DON<span className="text-accent-theme">!!</span> Cards
          </h1>
          <div className="inline-flex items-center text-xs font-semibold text-text-tertiary bg-bg-tertiary py-0.75 px-2.25 rounded-full border border-border-theme whitespace-nowrap">
            {loading ? "Loading..." : `${filteredCards.length} ${filteredCards.length === 1 ? "card" : "cards"}`}
          </div>
        </div>

        {/* Right: Search & Filter Chips */}
        <div className="don-header-right flex items-center gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="don-search-input-wrap relative w-55">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              ref={searchInputRef}
              className="don-search-input w-full py-1.75 pl-8 pr-7 rounded-lg border border-border-theme bg-bg-secondary text-text-primary outline-none text-[13px] transition-all focus:border-accent-theme"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search DON!! (/)"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer w-6 h-6 flex items-center justify-center text-text-tertiary hover:text-text-primary"
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
            className={`don-capsule-toggle relative w-19.5 h-8.5 rounded-lg cursor-pointer p-0 outline-none select-none shrink-0 transition-all duration-200 ${
              activeFilter === "Gold"
                ? "bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-600 shadow-md"
                : "bg-bg-tertiary border border-border-theme shadow-inner"
            }`}
          >
            {/* Embossed Text: GOLD on Left */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-[11px] font-extrabold tracking-wider text-white drop-shadow-sm pointer-events-none transition-all duration-200 ${
                activeFilter === "Gold" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
              }`}
            >
              GOLD
            </span>

            {/* Embossed Text: ALL on Right */}
            <span
              className={`absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-[11px] font-extrabold tracking-wider text-text-secondary pointer-events-none transition-all duration-200 ${
                activeFilter === "Gold" ? "opacity-0 translate-x-1" : "opacity-100 translate-x-0"
              }`}
            >
              ALL
            </span>

            {/* Floating Rectangular Slider Knob */}
            <div
              className={`absolute top-0.75 left-0.75 w-6.5 h-6.5 rounded-[5px] bg-white shadow-md transition-transform duration-200 ease-out will-change-transform ${
                activeFilter === "Gold" ? "translate-x-[44px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </header>

      {/* GRID */}
      <main className="don-main py-3 px-6 pb-16">
        {loading ? (
          <div className="don-card-grid grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4.5 mt-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="don-skeleton rounded-[14px] bg-bg-tertiary border border-border-theme aspect-[5/7]" />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-24 text-text-tertiary flex flex-col items-center">
            <img src="/nocard.png" alt="No cards found" className="w-30 h-30 object-contain mb-5 opacity-90" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="font-bold text-xl text-text-primary">No cards found</div>
            <div className="text-sm mt-1.5 text-text-tertiary">Try a different search</div>
          </div>
        ) : (
          <div className="don-card-grid grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4.5 mt-2.5">
            {filteredCards.map((card, i) => {
              const cardKey = getDonCardKey(card);
              const isGold = card.card_name.toLowerCase().includes("(gold)");
              const isWished = wishlistSet.has(cardKey);
              const shouldFlip = isAnimating && i < 10;
              const isLastFlip = i === Math.min(9, filteredCards.length - 1);

              return (
                <div
                  key={`${filterKey}-${i}`}
                  className="cursor-pointer"
                  style={{ perspective: shouldFlip ? "1000px" : "none" }}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div
                    className="relative"
                    style={{
                      transformStyle: shouldFlip ? "preserve-3d" : "flat",
                      animationName: shouldFlip ? "cardFlipIn" : "none",
                      animationDuration: shouldFlip ? "0.5s" : "0s",
                      animationTimingFunction: "ease",
                      animationFillMode: "forwards",
                      animationDelay: shouldFlip ? `${i * 0.03}s` : "0s",
                      willChange: shouldFlip ? "transform" : "auto",
                    }}
                    onAnimationEnd={isLastFlip ? () => setAnimatedKey(filterKey) : undefined}
                  >
                    {shouldFlip && (
                      <div className="absolute inset-0 rounded-[14px] overflow-hidden backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(180deg)]">
                        <img src="/don-back.png" alt="" className="w-full h-full block" onError={(e) => { e.currentTarget.src = "/card-back.png"; }} />
                      </div>
                    )}
                    <div
                      className="relative"
                      style={{
                        backfaceVisibility: shouldFlip ? "hidden" : "visible",
                        WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible",
                      }}
                    >
                      <div
                        className={`rounded-[14px] overflow-hidden bg-bg-secondary transition-all duration-250 ease-out hover:-translate-y-1.5 hover:scale-[1.02] ${
                          isGold
                            ? "border border-amber-400 shadow-[0_0_25px_rgba(250,204,21,0.2)] hover:shadow-[0_0_40px_rgba(250,204,21,0.35)]"
                            : "border border-border-theme shadow-md hover:shadow-xl"
                        }`}
                      >
                        <div className="w-full aspect-[5/7] bg-bg-tertiary overflow-hidden">
                          <img
                            src={card.card_image || "/card-placeholder.png"}
                            alt={card.card_name}
                            className="w-full h-full object-cover block"
                            onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
                          />
                        </div>
                      </div>
                      {isWished && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-md z-[2]">
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
          className="card-modal-outer fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="card-modal-nav-row flex items-center justify-center gap-4 w-full max-w-215" onClick={(e) => e.stopPropagation()}>
            {/* Prev */}
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-prev shrink-0 w-11 h-11 rounded-full bg-bg-primary border border-border-theme flex items-center justify-center text-text-primary shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() => { setSelectedIndex(selectedIndex - 1); setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                disabled={selectedIndex <= 0}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Modal card */}
            <div
              className="card-modal-container flex-1 bg-bg-primary rounded-[20px] border border-border-theme overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={getDonCardName(selected.card_name)}
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
            >
              {/* Header */}
              <div className="card-modal-header flex justify-between items-center py-4.5 px-6 border-b border-border-theme shrink-0">
                <div>
                  <div className="font-black text-xl text-text-primary tracking-tight">
                    {getDonCardName(selected.card_name)}
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">
                    {getDonSetName(selected.optcg_don_name)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Binder / Wishlist Picker */}
                  {user && (() => {
                    const cardKey = getDonCardKey(selected);
                    const isWished = wishlistSet.has(cardKey);
                    const inAnyBinder = isInAnyBinder(cardKey);

                    return (
                      <div className="relative">
                        <button
                          className={`card-modal-btn flex items-center justify-center gap-1.5 py-1.75 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                            isWished
                              ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : inAnyBinder
                              ? "border-green-600 bg-green-600/15 text-green-600 dark:text-green-400"
                              : "border-border-theme bg-transparent text-text-tertiary hover:border-text-tertiary"
                          }`}
                          onClick={() => { setShowBinderPicker(p => !p); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                          title={isWished ? "Wishlist" : inAnyBinder ? "In binder" : "Add to binder"}
                          aria-label={isWished ? "Wishlist" : inAnyBinder ? "In binder" : "Add to binder"}
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
                            className="absolute top-[calc(100%+8px)] right-0 w-60 bg-bg-primary border border-border-theme rounded-xl overflow-hidden shadow-2xl z-10 p-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleToggleWishlist(cardKey)}
                              className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                                isWished
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : "bg-transparent text-text-primary hover:bg-bg-secondary"
                              }`}
                            >
                              <div className={`w-4.5 h-4.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                                isWished ? "border-amber-600 bg-amber-500 text-white" : "border-border-theme bg-transparent"
                              }`}>
                                {isWished && <Star size={10} fill="#fff" color="#fff" />}
                              </div>
                              <span>Add to wishlist</span>
                            </button>

                            <div className="h-px bg-border-theme my-1.5" />

                            <div className="text-[10px] text-text-tertiary font-semibold tracking-wider uppercase py-1 px-2">
                              My binders
                            </div>

                            <div className="max-h-45 overflow-y-auto">
                              {binders.length === 0 && !creatingBinderInline && (
                                <div className="text-xs text-text-tertiary py-1.5 px-2.5">No binders yet.</div>
                              )}

                              {binders.map(binder => {
                                const inBinder = (binderCardMap[binder.id] ?? []).includes(cardKey);
                                return (
                                  <button
                                    key={binder.id}
                                    onClick={() => handleToggleBinderCard(binder.id, cardKey)}
                                    className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                                      inBinder
                                        ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                        : "bg-transparent text-text-primary hover:bg-bg-secondary"
                                    }`}
                                  >
                                    <BookOpen size={14} className="shrink-0" />
                                    <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{binder.name}</span>
                                    {inBinder && <Check size={12} strokeWidth={3} />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Inline new binder */}
                            {creatingBinderInline ? (
                              <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-border-theme my-1">
                                <Plus size={13} className="shrink-0 text-text-tertiary" />
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
                                  className="flex-1 bg-transparent border-0 outline-none text-[13px] text-text-primary font-inherit min-w-0"
                                />
                                <button
                                  onClick={() => handleCreateBinderInline(cardKey)}
                                  disabled={!newBinderNameInline.trim() || creatingBinderLoading}
                                  className={`shrink-0 w-5.5 h-5.5 rounded-md border-0 flex items-center justify-center transition-colors ${
                                    newBinderNameInline.trim()
                                      ? "bg-green-600 text-white cursor-pointer"
                                      : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                                  }`}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCreatingBinderInline(true)}
                                className="w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border border-dashed border-border-theme cursor-pointer text-[13px] text-left transition-colors bg-transparent text-text-tertiary hover:bg-bg-secondary hover:text-text-primary mt-1"
                              >
                                <Plus size={14} className="shrink-0" />
                                <span>New binder</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <button
                    onClick={closeModal}
                    className="bg-transparent border-0 cursor-pointer w-11 h-11 flex items-center justify-center text-text-tertiary hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="card-modal-body flex-1 flex items-center justify-center p-6">
                <div className="card-modal-image-pane w-full max-w-80">
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
              <div className="card-modal-footer border-t border-border-theme py-2.5 px-6 text-center text-xs text-text-tertiary shrink-0">
                {selectedIndex + 1} / {filteredCards.length}
              </div>
            </div>

            {/* Next */}
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-next shrink-0 w-11 h-11 rounded-full bg-bg-primary border border-border-theme flex items-center justify-center text-text-primary shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() => { setSelectedIndex(selectedIndex + 1); setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                disabled={selectedIndex >= filteredCards.length - 1}
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
          className="don-scroll-top fixed bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-bg-tertiary text-text-primary border border-border-theme cursor-pointer shadow-xl z-40 flex items-center justify-center hover:scale-105 transition-all"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      )}
      <Toast toast={toast} isDark={isDark} />
    </div>
  );
}