"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Card, FilterParams } from "@/types/card";
import { getAllCards, getAllSets } from "@/lib/api";
import CardItem from "@/components/CardItem";
const FilterBar = dynamic(() => import("@/components/FilterBar"));
const Sidebar = dynamic(() => import("@/components/Sidebar"));
import { Search, X, LayoutGrid, List, ChevronLeft, ChevronRight, BookmarkPlus, Check, BookOpen, ArrowDownWideNarrow, ArrowUpNarrowWide, CheckSquare, Plus, CopyCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getUserCards, getBinders, addUserCard, removeUserCard,
  addCardToBinder, removeCardFromBinder, getBinderCards, createBinder,
  type UserCard, type Binder,
} from "@/lib/binder";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getColors } from "@/lib/themes";

function isLimitedProductCard(card: Card) {
  return card.setType === "limited_product";
}

export default function Home() {
  const [cards, setCards]         = useState<Card[]>([]);
  const [sets, setSets]           = useState<{ set_id: string; set_name: string }[]>([]);
  const [filters, setFilters]     = useState<FilterParams>({});
  const [search, setSearch]       = useState("");
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [loading, setLoading]     = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sortDesc, setSortDesc] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [animatedKey, setAnimatedKey] = useState(-1);
  const [visibleCards, setVisibleCards] = useState(40);

  // ── AUTH + BINDER STATE ──
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [binderCardMap, setBinderCardMap] = useState<Record<string, string[]>>({});

  const [showBinderPicker, setShowBinderPicker] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [showMultiBinderPicker, setShowMultiBinderPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── INLINE BINDER CREATION STATE ──
  const [creatingBinderInline, setCreatingBinderInline] = useState(false);
  const [newBinderNameInline, setNewBinderNameInline] = useState("");
  const [creatingBinderLoading, setCreatingBinderLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;
  const getCardKey = (card: Card) => `${card.id ?? ""}||${card.name ?? ""}||${card.set?.name ?? ""}`;

  const colors = {
    bg: {
      primary:   tc.bg.primary,
      secondary: tc.bg.secondary,
      tertiary:  tc.bg.tertiary,
    },
    text: {
      primary:   tc.text.primary,
      secondary: tc.text.secondary,
      tertiary:  tc.text.tertiary,
    },
    border: tc.border,
    accent: tc.accent,
  };

  const resetInlineCreation = () => {
    setCreatingBinderInline(false);
    setNewBinderNameInline("");
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setUserCards([]); setBinders([]); setBinderCardMap({}); return; }
    Promise.all([getUserCards(user.id), getBinders(user.id)]).then(([uc, b]) => {
      setUserCards(uc);
      setBinders(b);
    });
  }, [user]);

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
    const params = new URLSearchParams(window.location.search);
    const rarity = params.get("rarity");
    const set    = params.get("set");
    if (rarity || set) {
      setFilters(prev => ({
        ...prev,
        ...(rarity ? { rarity } : {}),
        ...(set    ? { setId: set } : {}),
      }));
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedCards, allSets] = await Promise.all([getAllCards(), getAllSets()]);
        setCards(fetchedCards);
        const setMap = new Map<string, string>(allSets.map(s => [s.set_id, s.set_name]));
        for (const card of fetchedCards) {
          if (card.setType === "limited_product") continue;
          const prefix = (card.id ?? "").split("-")[0].toUpperCase();
          if (!prefix) continue;
          const stMatch = prefix.match(/^ST(\d+)$/);
          const setId = stMatch ? `ST-${stMatch[1].padStart(2, "0")}` : prefix;
          if (!setMap.has(setId)) setMap.set(setId, card.set?.name ?? setId);
        }
        setSets([...setMap.entries()].map(([set_id, set_name]) => ({ set_id, set_name })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setFilterKey(k => k + 1); }, [filters]);
  useEffect(() => { setFilterKey(k => k + 1); }, [sortDesc]);
  useEffect(() => {
    const t = setTimeout(() => setFilterKey(k => k + 1), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setVisibleCards(40); }, [search, filters, sortDesc]);

  useEffect(() => {
    const handleLazyScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1200) {
        setVisibleCards((prev) => prev + 40);
      }
    };
    window.addEventListener("scroll", handleLazyScroll);
    return () => window.removeEventListener("scroll", handleLazyScroll);
  }, []);

  const filtered = useMemo(() => {
    let result = cards.filter((c) => {
      if (isLimitedProductCard(c) && filters.setType !== "limited_product" && filters.rarity !== "P") return false;
      if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) &&
          !c.id?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.setType === "limited_product" && !isLimitedProductCard(c)) return false;
      if (filters.colors && filters.colors.length > 0) {
        if (filters.colors.includes("Multicolor")) {
          if (!c.color?.includes(" ")) return false;
        } else {
          for (const col of filters.colors) {
            if (!c.color?.includes(col)) return false;
          }
        }
      }
      if (filters.type && c.type?.toUpperCase() !== filters.type.toUpperCase()) return false;
      if (filters.rarity) {
        if (filters.rarity === "P") {
          if (!/^P-\d+/i.test(c.id ?? "")) return false;
        } else {
          let normalizedRarity = c.rarity?.replace(/\s+CARD\s*$/i, "").trim() || c.rarity;
          if (c.name?.includes("(SP)")) normalizedRarity = "SP";
          if (normalizedRarity !== filters.rarity) return false;
        }
      }
      if (filters.setId) {
        const normalizedFilter = filters.setId.replace(/-/g, "").toUpperCase();
        const setName = c.set?.name ?? "";
        const bracketMatch = setName.match(/\[([^\]]+)\]/);
        const normalizedSet = bracketMatch
          ? bracketMatch[1].replace(/-/g, "").toUpperCase()
          : setName.replace(/-/g, "").toUpperCase();
        const cardIdNorm = (c.id ?? "").replace(/-/g, "").toUpperCase();
        if (!normalizedSet.includes(normalizedFilter) && !cardIdNorm.startsWith(normalizedFilter)) return false;
        // EB04 only: exclude cards whose card ID starts with OP14 or OP15
        if (normalizedFilter === "EB04") {
          if (cardIdNorm.startsWith("OP14") || cardIdNorm.startsWith("OP15")) return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      const filterId = filters.setId?.replace(/-/g, "").toUpperCase() ?? "";
      const aPrefix = a.id?.split("-")[0].toUpperCase() ?? "";
      const bPrefix = b.id?.split("-")[0].toUpperCase() ?? "";
      const aMatches = aPrefix.includes(filterId) || filterId.includes(aPrefix);
      const bMatches = bPrefix.includes(filterId) || filterId.includes(bPrefix);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      const numA = parseInt(a.id?.split("-")[1] ?? "0");
      const numB = parseInt(b.id?.split("-")[1] ?? "0");
      return numA - numB;
    });
    if (sortDesc) result = result.reverse();
    return result;
  }, [cards, filters, search, sortDesc]);

  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : null;
  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSelectMode) { exitSelectMode(); return; }
        if (showBinderPicker) { setShowBinderPicker(false); resetInlineCreation(); return; }
        if (selectedIndex >= 0) { setSelectedIndex(-1); return; }
      }
      if (showBinderPicker || isSelectMode) return;
      if (selectedIndex < 0) return;
      e.preventDefault();
      if (e.key === "ArrowRight" && selectedIndex < filteredRef.current.length - 1)
        setSelectedIndex(prev => prev + 1);
      if (e.key === "ArrowLeft" && selectedIndex > 0)
        setSelectedIndex(prev => prev - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, showBinderPicker, isSelectMode]);

  // ── BINDER ACTIONS ──
  const ownedSet = useMemo(() =>
    new Set(userCards.filter(u => !u.in_wishlist).map(u => u.card_id)), [userCards]);
  const wishlistSet = useMemo(() =>
    new Set(userCards.filter(u => u.in_wishlist).map(u => u.card_id)), [userCards]);

  const handleToggleOwned = async (cardId: string) => {
    if (!user) return;
    if (ownedSet.has(cardId)) {
      setUserCards(prev => prev.filter(u => u.card_id !== cardId));
      await removeUserCard(user.id, cardId);
    } else {
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
      await addUserCard(user.id, cardId, false);
    }
  };

  const handleToggleWishlist = async (cardId: string) => {
    if (!user) return;
    if (wishlistSet.has(cardId)) {
      setUserCards(prev => prev.filter(u => u.card_id !== cardId));
      await removeUserCard(user.id, cardId);
    } else {
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: true }]);
      await addUserCard(user.id, cardId, true);
    }
  };

  const handleToggleBinderCard = async (binderId: string, cardId: string) => {
    const current = binderCardMap[binderId] ?? [];
    if (current.includes(cardId)) {
      await removeCardFromBinder(binderId, cardId);
      setBinderCardMap(prev => ({ ...prev, [binderId]: prev[binderId].filter(id => id !== cardId) }));
    } else {
      await addCardToBinder(binderId, cardId);
      setBinderCardMap(prev => ({ ...prev, [binderId]: [...(prev[binderId] ?? []), cardId] }));
      if (!ownedSet.has(cardId) && user) {
        await addUserCard(user.id, cardId, false);
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
      }
    }
  };

  // ── INLINE BINDER CREATION — single card modal ──
  const handleCreateBinderInline = async (cardId: string) => {
    if (!user || !newBinderNameInline.trim() || creatingBinderLoading) return;
    setCreatingBinderLoading(true);
    const b = await createBinder(user.id, newBinderNameInline.trim());
    if (b) {
      setBinders(prev => [...prev, b]);
      await addCardToBinder(b.id, cardId);
      setBinderCardMap(prev => ({ ...prev, [b.id]: [cardId] }));
      if (!ownedSet.has(cardId) && user) {
        await addUserCard(user.id, cardId, false);
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
      }
    }
    resetInlineCreation();
    setCreatingBinderLoading(false);
  };

  // ── INLINE BINDER CREATION — multi-select ──
  const handleMultiCreateBinder = async () => {
    if (!user || !newBinderNameInline.trim() || creatingBinderLoading) return;
    setCreatingBinderLoading(true);
    const b = await createBinder(user.id, newBinderNameInline.trim());
    if (b) {
      setBinders(prev => [...prev, b]);
      const keys = [...multiSelected].map(toCardKey);
      setBulkProgress({ done: 0, total: keys.length });
      let done = 0;
      const addedKeys: string[] = [];
      await Promise.all(keys.map(async (cardKey) => {
        await addCardToBinder(b.id, cardKey);
        addedKeys.push(cardKey);
        if (!ownedSet.has(cardKey) && user) {
          await addUserCard(user.id, cardKey, false);
          setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: false }]);
        }
        done++;
        setBulkProgress({ done, total: keys.length });
      }));
      setBinderCardMap(prev => ({ ...prev, [b.id]: addedKeys }));
    }
    setBulkProgress(null);
    resetInlineCreation();
    setCreatingBinderLoading(false);
    exitSelectMode();
  };

  // ── MULTI-SELECT ACTIONS ──
  const toCardKey = (selectKey: string) => selectKey.split("||").slice(0, 3).join("||");

  const enterSelectMode = (selectKey?: string) => {
    setIsSelectMode(true);
    if (selectKey) setMultiSelected(new Set([selectKey]));
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setMultiSelected(new Set());
    setShowMultiBinderPicker(false);
    resetInlineCreation();
  };

  const toggleMultiSelect = (selectKey: string) => {
    setMultiSelected(prev => {
      const next = new Set(prev);
      if (next.has(selectKey)) next.delete(selectKey);
      else next.add(selectKey);
      return next;
    });
  };

  const handleMultiMarkOwned = async () => {
    if (!user) return;
    const keys = [...multiSelected].map(toCardKey).filter(k => !ownedSet.has(k));
    if (keys.length === 0) { exitSelectMode(); return; }
    setBulkProgress({ done: 0, total: keys.length });
    let done = 0;
    await Promise.all(keys.map(async (cardKey) => {
      await addUserCard(user.id, cardKey, false);
      done++;
      setBulkProgress({ done, total: keys.length });
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: false }]);
    }));
    setBulkProgress(null);
    exitSelectMode();
  };

  const handleMultiAddToBinder = async (binderId: string) => {
    const current = binderCardMap[binderId] ?? [];
    const keys = [...multiSelected].map(toCardKey).filter(k => !current.includes(k));
    if (keys.length === 0) { exitSelectMode(); return; }
    setBulkProgress({ done: 0, total: keys.length });
    let done = 0;
    await Promise.all(keys.map(async (cardKey) => {
      await addCardToBinder(binderId, cardKey);
      if (!ownedSet.has(cardKey) && user) {
        await addUserCard(user.id, cardKey, false);
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: false }]);
      }
      done++;
      setBulkProgress({ done, total: keys.length });
      setBinderCardMap(prev => ({ ...prev, [binderId]: [...(prev[binderId] ?? []), cardKey] }));
    }));
    setBulkProgress(null);
    exitSelectMode();
  };

  const handleLongPressStart = (selectKey: string) => {
    longPressTimer.current = setTimeout(() => enterSelectMode(selectKey), 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  const allSelectKeys = filtered.map((c, i) => `${getCardKey(c)}||${i}`);
  const allSelected = allSelectKeys.length > 0 && allSelectKeys.every(k => multiSelected.has(k));

  const hasFilters = search || filters.colors?.length || Object.entries(filters)
    .filter(([k]) => k !== "colors")
    .some(([, v]) => Boolean(v));

  const isAnimating = animatedKey < filterKey;

  // Shared "New binder" inline UI — renders inside whichever picker calls it
  const renderNewBinderRow = (onConfirm: () => void) => (
    creatingBinderInline ? (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, margin: "4px 0" }}>
        <Plus size={13} style={{ flexShrink: 0, color: colors.text.tertiary }} />
        <input
          autoFocus
          value={newBinderNameInline}
          onChange={(e) => setNewBinderNameInline(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") onConfirm();
            if (e.key === "Escape") resetInlineCreation();
          }}
          placeholder="Binder name..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: colors.text.primary, fontFamily: "inherit", minWidth: 0 }}
        />
        <button
          onClick={onConfirm}
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
    )
  );

  return (
    <div
      suppressHydrationWarning
      style={{ minHeight: "100vh", background: colors.bg.primary, transition: "background-color 0.3s", color: colors.text.primary, marginLeft: 70, paddingTop: 57 }}
    >
      <Sidebar />

      {/* ── FIXED HEADER ── */}
      <header style={{ background: colors.bg.secondary, borderBottom: `1px solid ${colors.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 70, right: 0, zIndex: 20, transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", maxWidth: 800 }}>
          <div style={{ position: "relative", width: 320 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: colors.text.tertiary }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search card"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: `1px solid ${colors.border}`, borderRadius: 8, background: colors.bg.primary, color: colors.text.primary, outline: "none", transition: "all 0.2s" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.text.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${isDark ? "rgba(243,244,246,0.1)" : "rgba(17,24,39,0.1)"}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = "none"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X style={{ width: 14, height: 14, color: colors.text.tertiary }} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 4, background: colors.bg.tertiary, padding: 4, borderRadius: 8, flexShrink: 0 }}>
            <button onClick={() => setView("grid")} style={{ padding: 6, borderRadius: 6, background: view === "grid" ? colors.bg.primary : "transparent", border: "none", cursor: "pointer", color: view === "grid" ? colors.text.primary : colors.text.tertiary, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <LayoutGrid style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={() => setView("list")} style={{ padding: 6, borderRadius: 6, background: view === "list" ? colors.bg.primary : "transparent", border: "none", cursor: "pointer", color: view === "list" ? colors.text.primary : colors.text.tertiary, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <List style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <button
            onClick={() => setSortDesc(!sortDesc)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid", background: sortDesc ? colors.bg.primary : "transparent", color: sortDesc ? colors.text.primary : colors.text.tertiary, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
            title={sortDesc ? "Descending" : "Ascending"}
          >
            {sortDesc ? 
            <ArrowDownWideNarrow style={{ width: 16, height: 16 }} />
             :
            <ArrowUpNarrowWide style={{ width: 16, height: 16 }} />}
          </button>
          <button
            onClick={() => enterSelectMode()}
            title="Select cards"
            style={{ padding: 6, borderRadius: 8, border: `1px solid ${isSelectMode ? colors.text.primary : colors.border}`, background: isSelectMode ? colors.bg.tertiary : "transparent", color: isSelectMode ? colors.text.primary : colors.text.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
          >
            <CopyCheck size={16} />
          </button>
        </div>
      </header>

      <FilterBar sets={sets} filters={filters} onChange={setFilters} />

      <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${colors.border}` }}>
        <span style={{ fontSize: 14, color: colors.text.tertiary }}>
          {loading ? "Loading cards..." : (<>Showing <strong style={{ color: colors.text.primary }}>{filtered.length}</strong> cards</>)}
        </span>
        {hasFilters && (
          <button
            onClick={() => { setFilters({}); setSearch(""); }}
            style={{ fontSize: 12, color: colors.accent, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <X style={{ width: 12, height: 12 }} /> Clear filters
          </button>
        )}
      </div>

      <main style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 64 }}>
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .skeleton-loader { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        `}</style>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 16 }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="skeleton-loader" style={{ borderRadius: 12, background: colors.bg.tertiary, border: `1px solid ${colors.border}`, height: 256 }} />
            ))}
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
            {filtered.slice(0, visibleCards).map((card, i) => {
              const shouldFlip = isAnimating && i < 10;
              const isLastFlip = i === Math.min(9, filtered.length - 1);
              const isOwned = ownedSet.has(getCardKey(card));
              const selectKey = `${getCardKey(card)}||${i}`;
              const isMultiChecked = multiSelected.has(selectKey);
              return (
                <div
                  key={`${filterKey}-${card.id}-${i}`}
                  style={{ perspective: shouldFlip ? "1000px" : "none", position: "relative" }}
                  onMouseDown={() => { if (!isSelectMode) handleLongPressStart(selectKey); }}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => { if (!isSelectMode) handleLongPressStart(selectKey); }}
                  onTouchEnd={handleLongPressEnd}
                >
                  <div
                    style={{ position: "relative", transformStyle: shouldFlip ? "preserve-3d" : "flat", animationName: shouldFlip ? "cardFlipIn" : "none", animationDuration: shouldFlip ? "0.5s" : "0s", animationTimingFunction: "ease", animationFillMode: "forwards", animationDelay: shouldFlip ? `${i * 0.03}s` : "0s", willChange: shouldFlip ? "transform" : "auto" }}
                    onAnimationEnd={isLastFlip ? () => setAnimatedKey(filterKey) : undefined}
                  >
                    {shouldFlip && (
                      <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden" }}>
                        <Image src={card.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png"} alt="" fill loading="lazy" style={{ objectFit: "cover", borderRadius: 14 }} />
                      </div>
                    )}
                    <div
                      style={{ backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible", outline: isMultiChecked ? "3px solid #6366f1" : "none", borderRadius: 14, transition: "outline 0.15s" }}
                      onClick={() => { if (isSelectMode) toggleMultiSelect(selectKey); else setSelectedIndex(i); }}
                    >
                      <CardItem card={card} onClick={() => {}} />
                    </div>
                  </div>
                  {isOwned && !isSelectMode && (
                    <div style={{ position: "absolute", bottom: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  {isSelectMode && (
                    <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 6, border: `2px solid ${isMultiChecked ? "#6366f1" : "rgba(255,255,255,0.7)"}`, background: isMultiChecked ? "#6366f1" : "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.15s", pointerEvents: "none" }}>
                      {isMultiChecked && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 896, marginTop: 16 }}>
            {filtered.slice(0, visibleCards).map((card, i) => {
              const isOwned = ownedSet.has(getCardKey(card));
              const selectKey = `${getCardKey(card)}||${i}`;
              const isMultiChecked = multiSelected.has(selectKey);
              return (
                <div
                  key={`${card.id}-${i}`}
                  onClick={() => { if (isSelectMode) toggleMultiSelect(selectKey); else setSelectedIndex(i); }}
                  onMouseDown={() => { if (!isSelectMode) handleLongPressStart(selectKey); }}
                  onMouseUp={handleLongPressEnd}
                  onMouseEnter={(e) => { if (!isMultiChecked) { e.currentTarget.style.borderColor = colors.text.primary; e.currentTarget.style.boxShadow = `0 1px 3px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"}`; } }}
                  onMouseLeave={(e) => { handleLongPressEnd(); if (!isMultiChecked) { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = "none"; } }}
                  onTouchStart={() => { if (!isSelectMode) handleLongPressStart(selectKey); }}
                  onTouchEnd={handleLongPressEnd}
                  style={{ background: isMultiChecked ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)") : colors.bg.secondary, border: `1px solid ${isMultiChecked ? "#6366f1" : colors.border}`, borderRadius: 12, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {isSelectMode && (
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${isMultiChecked ? "#6366f1" : colors.border}`, background: isMultiChecked ? "#6366f1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                      {isMultiChecked && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                  )}
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: colors.text.tertiary, width: 96, flexShrink: 0 }}>{card.id}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: colors.text.primary, flex: 1 }}>{card.name}</span>
                  <span style={{ fontSize: 12, color: colors.text.tertiary }}>{card.type}</span>
                  {card.power != null && <span style={{ fontSize: 12, color: colors.text.secondary }}>⚔️ {card.power}</span>}
                  {card.cost  != null && <span style={{ fontSize: 12, color: colors.text.secondary }}>💎 {card.cost}</span>}
                  {isOwned && !isSelectMode && (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 96, paddingBottom: 96, color: colors.text.tertiary, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Image src="/nocard.png" alt="No cards found" width={180} height={180} priority style={{ marginBottom: 20, objectFit: "contain", opacity: isDark ? 0.9 : 1 }} />
            <div style={{ fontWeight: 700, fontSize: 20, color: colors.text.primary }}>No cards found</div>
            <div style={{ fontSize: 14, marginTop: 6, color: colors.text.tertiary }}>Try adjusting your filters</div>
          </div>
        )}
      </main>

      {/* ── CARD DETAIL MODAL ── */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => { setSelectedIndex(-1); setShowBinderPicker(false); resetInlineCreation(); }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedIndex(selectedIndex - 1); setShowBinderPicker(false); resetInlineCreation(); }} disabled={selectedIndex <= 0} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: colors.bg.primary, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)", border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary, cursor: selectedIndex > 0 ? "pointer" : "not-allowed", opacity: selectedIndex <= 0 ? 0.3 : 1, transition: "all 0.2s" }}>
              <ChevronLeft style={{ width: 20, height: 20 }} />
            </button>

            <div style={{ flex: 1, background: colors.bg.primary, borderRadius: 20, boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)", border: `1px solid ${colors.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0, gap: 16 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 22, color: colors.text.primary, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: colors.text.tertiary, fontFamily: "monospace", marginTop: 2 }}>{selected.id}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {user && (
                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                      {ownedSet.has(getCardKey(selected)) && (
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={11} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const next = !showBinderPicker;
                          setShowBinderPicker(next);
                          if (!next) resetInlineCreation();
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: `1px solid ${colors.border}`, background: "transparent", color: colors.text.tertiary }}
                      >
                        <BookmarkPlus size={14} />
                        Add to binder
                      </button>
                      {showBinderPicker && (
                        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240, background: colors.bg.primary, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)", zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
                          {/* Collection section */}
                          <div style={{ padding: "8px 8px 4px" }}>
                            <div style={{ fontSize: 10, color: colors.text.tertiary, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "4px 8px 6px" }}>Collection</div>
                            <button onClick={() => handleToggleOwned(getCardKey(selected))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: ownedSet.has(getCardKey(selected)) ? (isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)") : "transparent", color: ownedSet.has(getCardKey(selected)) ? "#16a34a" : colors.text.primary }} onMouseEnter={(e) => { if (!ownedSet.has(getCardKey(selected))) e.currentTarget.style.background = colors.bg.secondary; }} onMouseLeave={(e) => { if (!ownedSet.has(getCardKey(selected))) e.currentTarget.style.background = "transparent"; }}>
                              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${ownedSet.has(getCardKey(selected)) ? "#16a34a" : colors.border}`, background: ownedSet.has(getCardKey(selected)) ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {ownedSet.has(getCardKey(selected)) && <Check size={10} color="#fff" strokeWidth={3} />}
                              </div>
                              I own this card
                            </button>
                            <button onClick={() => handleToggleWishlist(getCardKey(selected))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: wishlistSet.has(getCardKey(selected)) ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)") : "transparent", color: wishlistSet.has(getCardKey(selected)) ? "#d97706" : colors.text.primary }} onMouseEnter={(e) => { if (!wishlistSet.has(getCardKey(selected))) e.currentTarget.style.background = colors.bg.secondary; }} onMouseLeave={(e) => { if (!wishlistSet.has(getCardKey(selected))) e.currentTarget.style.background = "transparent"; }}>
                              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${wishlistSet.has(getCardKey(selected)) ? "#d97706" : colors.border}`, background: wishlistSet.has(getCardKey(selected)) ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>
                                {wishlistSet.has(getCardKey(selected)) && <span style={{ color: "#fff" }}>★</span>}
                              </div>
                              Add to wishlist
                            </button>
                          </div>
                          {/* My binders section — always shown when logged in */}
                          <div style={{ height: "0.5px", background: colors.border, margin: "4px 0" }} />
                          <div style={{ padding: "4px 8px 0" }}>
                            <div style={{ fontSize: 10, color: colors.text.tertiary, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "4px 8px 6px" }}>My binders</div>
                            <div style={{ maxHeight: 180, overflowY: "auto" }}>
                              {binders.map(binder => {
                                const inBinder = (binderCardMap[binder.id] ?? []).includes(getCardKey(selected));
                                return (
                                  <button key={binder.id} onClick={() => handleToggleBinderCard(binder.id, getCardKey(selected))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: inBinder ? (isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)") : "transparent", color: inBinder ? "#6366f1" : colors.text.primary }} onMouseEnter={(e) => { if (!inBinder) e.currentTarget.style.background = colors.bg.secondary; }} onMouseLeave={(e) => { if (!inBinder) e.currentTarget.style.background = "transparent"; }}>
                                    <BookOpen size={14} style={{ flexShrink: 0 }} />
                                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{binder.name}</span>
                                    {inBinder && <Check size={12} strokeWidth={3} />}
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ padding: "0 0 8px" }}>
                              {renderNewBinderRow(() => handleCreateBinderInline(getCardKey(selected)))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { setSelectedIndex(-1); setShowBinderPicker(false); resetInlineCreation(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X style={{ width: 20, height: 20, color: colors.text.tertiary }} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
                <div style={{ width: "45%", flexShrink: 0, background: tc.bg.primary, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  {selected.images?.large ? (
                    <Image src={selected.images.large} alt={selected.name} width={500} height={700} loading="lazy" style={{ width: "100%", height: "auto", objectFit: "contain", borderRadius: 12, boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)" }} />
                  ) : (
                    <img src="/card-placeholder.png" alt="No image available" style={{ height: 460, width: "100%", maxHeight: "100%", objectFit: "contain", border: `1px solid ${colors.border}`, borderRadius: 12, background: "#ffffff" }} onError={(e) => { e.currentTarget.src = "/card-back.png"; }} />
                  )}
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      ["Type", selected.type], ["Rarity", selected.rarity?.replace(/^PR$/i, "P")], ["Color", selected.color],
                      ["Cost", selected.cost], ["Power", selected.power], ["Counter", selected.counter],
                      ["Attribute", selected.attribute?.name], ["Family", selected.family], ["Set", selected.set?.name],
                    ].filter(([, v]) => v != null && v !== "" && v !== "-").map(([label, value]) => (
                      <div key={String(label)} style={{ background: colors.bg.secondary, borderRadius: 10, padding: "10px 14px", border: `1px solid ${colors.border}` }}>
                        <div style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: colors.text.primary }}>{String(value)}</div>
                      </div>
                    ))}
                  </div>
                  {selected.ability && (
                    <div style={{ background: colors.bg.secondary, borderRadius: 10, padding: "12px 14px", border: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Effect</div>
                      <div style={{ fontSize: 14, color: colors.text.primary, lineHeight: 1.7 }}>{selected.ability}</div>
                    </div>
                  )}
                  {selected.trigger && selected.trigger !== "" && (
                    <div style={{ background: isDark ? "rgba(217,119,6,0.1)" : "rgba(251,191,36,0.08)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${isDark ? "rgba(251,191,36,0.2)" : "rgba(217,119,6,0.2)"}` }}>
                      <div style={{ fontSize: 11, color: isDark ? "#fbbf24" : "#d97706", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Trigger</div>
                      <div style={{ fontSize: 14, color: colors.text.primary, lineHeight: 1.7 }}>{selected.trigger}</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${colors.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: colors.text.tertiary, flexShrink: 0 }}>
                {selectedIndex + 1} / {filtered.length}
              </div>
            </div>

            <button onClick={() => { setSelectedIndex(selectedIndex + 1); setShowBinderPicker(false); resetInlineCreation(); }} disabled={selectedIndex >= filtered.length - 1} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: colors.bg.primary, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)", border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary, cursor: selectedIndex < filtered.length - 1 ? "pointer" : "not-allowed", opacity: selectedIndex >= filtered.length - 1 ? 0.3 : 1, transition: "all 0.2s" }}>
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      )}

      {/* ── BULK PROGRESS BAR ── */}
      {bulkProgress && (
        <div style={{ position: "fixed", bottom: 100, left: "calc(50% + 35px)", transform: "translateX(-50%)", zIndex: 60, background: colors.bg.primary, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "10px 16px", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.15)", minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.text.primary }}>Processing...</span>
            <span style={{ fontSize: 12, color: colors.text.tertiary }}>{bulkProgress.done} / {bulkProgress.total}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: colors.bg.tertiary, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, background: "#16a34a", width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%`, transition: "width 0.15s ease" }} />
          </div>
        </div>
      )}

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && !isSelectMode && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: 32, left: "calc(50% + 40px)", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: tc.bg.tertiary, color: colors.text.primary, border: `1px solid ${colors.border}`, cursor: "pointer", fontSize: 22, fontWeight: 700, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          ↑
        </button>
      )}

      {/* ── MULTI-SELECT BOTTOM BAR ── */}
      {isSelectMode && (
        <div style={{ position: "fixed", bottom: 32, left: "calc(50% + 35px)", transform: "translateX(-50%)", zIndex: 50, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 16, background: colors.bg.primary, border: `1px solid ${colors.border}`, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.15)" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.text.primary, whiteSpace: "nowrap" }}>
            {multiSelected.size} selected
          </span>
          <div style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />
          {user && (
            <>
              <button
                onClick={handleMultiMarkOwned}
                disabled={multiSelected.size === 0}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: multiSelected.size > 0 ? "pointer" : "not-allowed", border: "1px solid #16a34a", background: isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)", color: "#16a34a", opacity: multiSelected.size === 0 ? 0.5 : 1, transition: "all 0.2s" }}
              >
                <Check size={14} /> Mark Owned
              </button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    const next = !showMultiBinderPicker;
                    setShowMultiBinderPicker(next);
                    if (!next) resetInlineCreation();
                  }}
                  disabled={multiSelected.size === 0}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: multiSelected.size > 0 ? "pointer" : "not-allowed", border: `1px solid ${colors.border}`, background: "transparent", color: colors.text.primary, opacity: multiSelected.size === 0 ? 0.5 : 1, transition: "all 0.2s" }}
                >
                  <BookOpen size={14} /> Add to Binder
                </button>
                {showMultiBinderPicker && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", width: 220, background: colors.bg.primary, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)", zIndex: 60 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ padding: "8px 8px 0" }}>
                      <div style={{ fontSize: 10, color: colors.text.tertiary, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "4px 8px 6px" }}>My binders</div>
                      <div style={{ maxHeight: 180, overflowY: "auto" }}>
                        {binders.map(binder => (
                          <button key={binder.id} onClick={() => handleMultiAddToBinder(binder.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, background: "transparent", color: colors.text.primary, transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.secondary; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                            <BookOpen size={14} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{binder.name}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ padding: "0 0 8px" }}>
                        {renderNewBinderRow(handleMultiCreateBinder)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            onClick={() => { if (allSelected) { setMultiSelected(new Set()); } else { setMultiSelected(new Set(allSelectKeys)); } }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${colors.border}`, background: allSelected ? colors.bg.tertiary : "transparent", color: colors.text.primary, transition: "all 0.2s" }}
          >
            <CheckSquare size={14} />
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={exitSelectMode}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${colors.border}`, background: "transparent", color: colors.text.tertiary, transition: "all 0.2s" }}
          >
            <X size={14} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}