"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Search, ChevronLeft, ChevronRight, X, BookmarkPlus, Check, BookOpen, Plus } from "lucide-react";
import { getColors } from "@/lib/themes";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getBinders, addCardToBinder, removeCardFromBinder, getBinderCards, createBinder,
  type Binder,
} from "@/lib/binder";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

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

// Stable key for a DON card (used for binder storage)
const getDonCardKey = (card: DonCard) => `don||${card.card_name}`;

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

// ── Modal card image with flip-in animation (matches browse page) ──
// DON!! cards always use /don-back.png as the card back
function ModalCardImage({ src, alt, isDark }: {
  src: string; alt: string; isDark: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

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
    <div style={{ width: "100%", aspectRatio: "2.5 / 3.5", perspective: "1000px" }}>
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
        borderRadius: 14,
        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 14, overflow: "hidden" }}>
          {loaded && (
            <img
              src={imgSrc}
              alt={alt}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
            />
          )}
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 14, overflow: "hidden" }}>
          <img src="/don-back.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-back.png"; }} />
        </div>
      </div>
    </div>
  );
}

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

  // Modal state
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showBinderPicker, setShowBinderPicker] = useState(false);

  // Auth + binder state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [binderCardMap, setBinderCardMap] = useState<Record<string, string[]>>({});

  // Inline binder creation
  const [creatingBinderInline, setCreatingBinderInline] = useState(false);
  const [newBinderNameInline, setNewBinderNameInline] = useState("");
  const [creatingBinderLoading, setCreatingBinderLoading] = useState(false);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const colors = {
    bg: { primary: tc.bg.primary, secondary: tc.bg.secondary, tertiary: tc.bg.tertiary },
    text: { primary: tc.text.primary, secondary: tc.text.secondary, tertiary: tc.text.tertiary },
    border: tc.border,
    accent: tc.accent,
  };

  //scroll lock
  useBodyScrollLock(selectedIndex >= 0);

  useEffect(() => { setMounted(true); }, []);

  // Auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load binders
  useEffect(() => {
    if (!user) { setBinders([]); setBinderCardMap({}); return; }
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
        const res = await fetch("https://www.optcgapi.com/api/allDonCards/");
        const data = await res.json();
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

  // Binder actions
  const handleToggleBinderCard = async (binderId: string, cardKey: string) => {
    const current = binderCardMap[binderId] ?? [];
    if (current.includes(cardKey)) {
      await removeCardFromBinder(binderId, cardKey);
      setBinderCardMap(prev => ({ ...prev, [binderId]: prev[binderId].filter(id => id !== cardKey) }));
    } else {
      await addCardToBinder(binderId, cardKey);
      setBinderCardMap(prev => ({ ...prev, [binderId]: [...(prev[binderId] ?? []), cardKey] }));
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
      suppressHydrationWarning
      style={{ minHeight: "100vh", background: colors.bg.primary, transition: "background 0.3s", color: colors.text.primary, marginLeft: 70 }}
    >
      <style>{`
        @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .don-skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      <Sidebar />

      {/* TOP TITLE */}
      <div style={{ padding: "11px 24px 10px", borderBottom: `1px solid ${colors.border}`, marginBottom: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: colors.text.primary, letterSpacing: "-0.03em" }}>
          DON<span style={{ color: colors.accent }}>!!</span> Cards
        </h1>
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{ padding: "18px 24px", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", width: 260 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.text.tertiary }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search DON!!"
              style={{ width: "100%", padding: "10px 32px 10px 36px", borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg.secondary, color: colors.text.primary, outline: "none", fontSize: 13 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={14} color={colors.text.tertiary} />
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 4,
              background: colors.bg.tertiary,
              padding: 4,
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            {["All", "Gold"].map((filter) => {
              const active = activeFilter === filter;
              const isGold = filter === "Gold";

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    transition: "all 0.2s",

                    // 🎯 Background logic
                    background: active
                      ? isGold
                        ? "linear-gradient(135deg,#facc15,#eab308)" // gold active
                        : colors.bg.primary // normal active
                      : "transparent",

                    // 🎯 Text color logic
                    color: active
                      ? isGold
                        ? "#1f2937" // dark text on gold
                        : colors.text.primary
                      : isGold
                        ? "#eab308" // gold text when inactive
                        : colors.text.tertiary,
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 24px", display: "flex", justifyContent: "flex-start", borderBottom: `1px solid ${colors.border}` }}>
        <span style={{ fontSize: 14, color: colors.text.tertiary }}>
          {loading ? (
            "Loading cards..."
          ) : (
            <>
              Showing{" "}
              <strong style={{ color: colors.text.primary }}>
                {filteredCards.length}
              </strong>{" "}
              cards
            </>
          )}
        </span>
      </div>

      {/* GRID */}
      <main style={{ padding: "12px 24px 64px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="don-skeleton" style={{ borderRadius: 18, background: colors.bg.tertiary, border: `1px solid ${colors.border}`, aspectRatio: "2.5 / 3.5" }} />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 96, paddingBottom: 96, color: colors.text.tertiary, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="/nocard.png" alt="No cards found" style={{ width: 120, height: 120, objectFit: "contain", marginBottom: 20, opacity: isDark ? 0.9 : 1 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div style={{ fontWeight: 700, fontSize: 20, color: colors.text.primary }}>No cards found</div>
            <div style={{ fontSize: 14, marginTop: 6, color: colors.text.tertiary }}>Try a different search</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 10 }}>
            {filteredCards.map((card, i) => {
              const isGold = card.card_name.toLowerCase().includes("(gold)");
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
                      <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden" }}>
                        <img src="/don-back.png" alt="" style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-back.png"; }} />
                      </div>
                    )}
                    <div style={{ backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible" }}>
                      <div
                        style={{ borderRadius: 15, overflow: "hidden", background: colors.bg.secondary, border: isGold ? "1px solid #facc15" : `1px solid ${colors.border}`, transition: "all 0.25s ease", boxShadow: isGold ? "0 0 25px rgba(250,204,21,0.2)" : isDark ? "0 10px 30px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.08)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px) scale(1.02)"; e.currentTarget.style.boxShadow = isGold ? "0 0 40px rgba(250,204,21,0.35)" : "0 20px 40px rgba(0,0,0,0.25)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = isGold ? "0 0 25px rgba(250,204,21,0.2)" : isDark ? "0 10px 30px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.08)"; }}
                      >
                        <div style={{ width: "100%", aspectRatio: "2.5 / 3.5", background: colors.bg.tertiary }}>
                          <img src={card.card_image || "/card-placeholder.png"} alt={card.card_name} style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 8, paddingLeft: 2, fontSize: 12, fontWeight: 600, color: colors.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {getDonCardName(card.card_name)}
                      </div>
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
          style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={closeModal}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>

            {/* Prev */}
            <button
              onClick={() => { setSelectedIndex(selectedIndex - 1); setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
              disabled={selectedIndex <= 0}
              style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: colors.bg.primary, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary, cursor: selectedIndex > 0 ? "pointer" : "not-allowed", opacity: selectedIndex <= 0 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Modal card */}
            <div style={{ flex: 1, background: colors.bg.primary, borderRadius: 20, border: `1px solid ${colors.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: colors.text.primary, letterSpacing: "-0.02em" }}>
                    {getDonCardName(selected.card_name)}
                  </div>
                  <div style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
                    {getDonSetName(selected.optcg_don_name)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                  {/* Add to binder button */}
                  {user && (
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => { setShowBinderPicker(p => !p); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: `1px solid ${isInAnyBinder(getDonCardKey(selected)) ? "#16a34a" : colors.border}`, background: isInAnyBinder(getDonCardKey(selected)) ? (isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)") : "transparent", color: isInAnyBinder(getDonCardKey(selected)) ? "#16a34a" : colors.text.tertiary }}
                      >
                        {isInAnyBinder(getDonCardKey(selected)) ? <Check size={14} /> : <BookmarkPlus size={14} />}
                        {isInAnyBinder(getDonCardKey(selected)) ? "In binder" : "Add to binder"}
                      </button>

                      {/* Picker dropdown */}
                      {showBinderPicker && (
                        <div
                          style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240, background: colors.bg.primary, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)", zIndex: 10 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ padding: "8px 8px 8px" }}>
                          <div style={{ fontSize: 10, color: colors.text.tertiary, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "4px 8px 6px" }}>
                            My binders
                          </div>

                          <div style={{ maxHeight: 180, overflowY: "auto" }}>
                            {binders.length === 0 && !creatingBinderInline && (
                              <div style={{ fontSize: 12, color: colors.text.tertiary, padding: "6px 10px" }}>No binders yet.</div>
                            )}

                            {binders.map(binder => {
                              const cardKey = getDonCardKey(selected);
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
                                    if (e.key === "Enter") handleCreateBinderInline(getDonCardKey(selected));
                                    if (e.key === "Escape") { setCreatingBinderInline(false); setNewBinderNameInline(""); }
                                  }}
                                  placeholder="Binder name..."
                                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: colors.text.primary, fontFamily: "inherit", minWidth: 0 }}
                                />
                                <button
                                  onClick={() => handleCreateBinderInline(getDonCardKey(selected))}
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
                  )}

                  <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={20} color={colors.text.tertiary} />
                  </button>
                </div>
              </div>

              {/* Body — ModalCardImage replaces plain <img> */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ width: "100%", maxWidth: 320 }}>
                  <ModalCardImage
                    key={selected.card_image}
                    src={selected.card_image || "/card-placeholder.png"}
                    alt={selected.card_name}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Footer counter */}
              <div style={{ borderTop: `1px solid ${colors.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: colors.text.tertiary, flexShrink: 0 }}>
                {selectedIndex + 1} / {filteredCards.length}
              </div>
            </div>

            {/* Next */}
            <button
              onClick={() => { setSelectedIndex(selectedIndex + 1); setShowBinderPicker(false); setCreatingBinderInline(false); setNewBinderNameInline(""); }}
              disabled={selectedIndex >= filteredCards.length - 1}
              style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: colors.bg.primary, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary, cursor: selectedIndex < filteredCards.length - 1 ? "pointer" : "not-allowed", opacity: selectedIndex >= filteredCards.length - 1 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* SCROLL TOP */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position: "fixed", bottom: 32, left: "calc(50% + 40px)", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: tc.bg.tertiary, color: colors.text.primary, border: `1px solid ${colors.border}`, cursor: "pointer", fontSize: 22, fontWeight: 700, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
        >
          ↑
        </button>
      )}
    </div>
  );
}