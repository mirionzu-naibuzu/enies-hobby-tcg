"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Card, FilterParams } from "@/types/card";
import { getAllCards, getAllSets } from "@/lib/api";
import CardItem from "@/components/CardItem";
const FilterBar = dynamic(() => import("@/components/FilterBar"));
const Sidebar = dynamic(() => import("@/components/Sidebar"));
import { Search, X, ChevronLeft, ChevronRight, BookmarkPlus, Check, BookOpen, ArrowDownWideNarrow, ArrowUpNarrowWide, CheckSquare, Plus, CopyCheck, SlidersHorizontal, MoreVertical, PanelLeft, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getUserCards, getBinders, addUserCard, removeUserCard,
  addCardToBinder, removeCardFromBinder, getBinderCards, createBinder,
  getCardKey,
  type UserCard, type Binder,
} from "@/lib/binder";
import {
  getGuestUserCards, saveGuestUserCard, removeGuestUserCard,
  getGuestBinders, createGuestBinder, getGuestBinderCards,
  addGuestBinderCard, removeGuestBinderCard,
} from "@/lib/guestStorage";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getColors } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import ModalCardImage from "@/components/ModalCardImage";
import Toast, { ToastData, ToastType } from "@/components/Toast";

function isLimitedProductCard(card: Card) {
  return card.setType === "limited_product";
}

export default function Home() {
  const [cards, setCards]         = useState<Card[]>([]);
  const [sets, setSets]           = useState<{ set_id: string; set_name: string }[]>([]);
  const [filters, setFilters]     = useState<FilterParams>({});
  const [search, setSearch]       = useState("");

  const [loading, setLoading]     = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sortDesc, setSortDesc] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [animatedKey, setAnimatedKey] = useState(-1);
  const [visibleCards, setVisibleCards] = useState(40);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // ── AUTH + BINDER STATE ──
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [binderCardMap, setBinderCardMap] = useState<Record<string, string[]>>({});

  const [showBinderPicker, setShowBinderPicker] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showSelectMenu, setShowSelectMenu] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [showMultiBinderPicker, setShowMultiBinderPicker] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── INLINE BINDER CREATION STATE ──
  const [creatingBinderInline, setCreatingBinderInline] = useState(false);
  const [newBinderNameInline, setNewBinderNameInline] = useState("");
  const [creatingBinderLoading, setCreatingBinderLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
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

  const handleModalTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  
  const handleModalTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || showBinderPicker || isSelectMode) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // not a clean horizontal swipe
    if (dx < 0 && selectedIndex < filtered.length - 1) setSelectedIndex(selectedIndex + 1);
    else if (dx > 0 && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  //scroll lock
  useBodyScrollLock(selectedIndex >= 0 || mobileFiltersOpen);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 540px)");
    setIsNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    setIsLandscape(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserCards(getGuestUserCards());
      setBinders(getGuestBinders());
      return;
    }
    Promise.all([getUserCards(user.id), getBinders(user.id)]).then(([uc, b]) => {
      setUserCards(uc);
      setBinders(b);
    });
  }, [user]);

  useEffect(() => {
    const handleSynced = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const [uc, b] = await Promise.all([getUserCards(data.user.id), getBinders(data.user.id)]);
        setUserCards(uc);
        setBinders(b);
      }
    };
    window.addEventListener("enies_guest_synced", handleSynced);
    return () => window.removeEventListener("enies_guest_synced", handleSynced);
  }, []);

  useEffect(() => {
    if (!binders.length) {
      setBinderCardMap({});
      return;
    }
    if (user) {
      Promise.all(binders.map(b => getBinderCards(b.id).then(cards => ({ id: b.id, cards }))))
        .then(results => {
          const map: Record<string, string[]> = {};
          for (const r of results) map[r.id] = r.cards;
          setBinderCardMap(map);
        });
    } else {
      const map: Record<string, string[]> = {};
      for (const b of binders) {
        map[b.id] = getGuestBinderCards(b.id);
      }
      setBinderCardMap(map);
    }
  }, [binders, user]);

  const initialParamsLoaded = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rarity      = params.get("rarity");
    const set         = params.get("set") || params.get("setId");
    const colorParam  = params.get("color") || params.get("colors");
    const type        = params.get("type");
    const searchParam = params.get("search") || params.get("q");

    if (searchParam) {
      setSearch(searchParam);
    }

    if (rarity || set || colorParam || type) {
      const parsedColors = colorParam
        ? colorParam.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined;

      setFilters((prev) => ({
        ...prev,
        ...(rarity ? { rarity } : {}),
        ...(set ? { setId: set } : {}),
        ...(parsedColors && parsedColors.length > 0 ? { colors: parsedColors } : {}),
        ...(type ? { type } : {}),
      }));
    }
    initialParamsLoaded.current = true;
  }, []);

  // ── SYNC FILTERS & SEARCH TO URL QUERY PARAMETERS ──
  useEffect(() => {
    if (!initialParamsLoaded.current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      // Fixed Canonical Hierarchy:
      // 1. Search Query ('q')
      if (search && search.trim()) {
        params.set("q", search.trim());
      }

      // 2. Expansion / Set ID ('set')
      if (filters.setId && filters.setId.trim()) {
        params.set("set", filters.setId.trim());
      }

      // 3. Card Colors ('colors')
      if (filters.colors && filters.colors.length > 0) {
        params.set("colors", filters.colors.join(","));
      }

      // 4. Card Rarity ('rarity')
      if (filters.rarity && filters.rarity.trim()) {
        params.set("rarity", filters.rarity.trim());
      }

      // 5. Card Type ('type')
      if (filters.type && filters.type.trim()) {
        params.set("type", filters.type.trim());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `/browse?${queryString}` : "/browse";

      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== newUrl) {
        window.history.replaceState(null, "", newUrl);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filters]);

  // Handle Browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const rarity      = params.get("rarity") || undefined;
      const set         = params.get("set") || params.get("setId") || undefined;
      const colorParam  = params.get("color") || params.get("colors");
      const type        = params.get("type") || undefined;
      const searchParam = params.get("search") || params.get("q") || "";

      setSearch(searchParam);
      const parsedColors = colorParam
        ? colorParam.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined;

      setFilters({
        rarity,
        setId: set,
        colors: parsedColors && parsedColors.length > 0 ? parsedColors : undefined,
        type,
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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
    
      // ── SP is independent — checked on its own, never inside the rarity block ──
      if (filters.spOnly && !c.name?.includes("(SP)")) return false;
    
      if (filters.rarity) {
        if (filters.rarity === "P") {
          if (!/^P-\d+/i.test(c.id ?? "")) return false;
        } else {
          const normalizedRarity = c.rarity?.replace(/\s+CARD\s*$/i, "").trim() || c.rarity;
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
        
        // Initial match check (does the card belong to this set according to API or its ID?)
        const isMatch = normalizedSet.includes(normalizedFilter) || cardIdNorm.startsWith(normalizedFilter);
        if (!isMatch) return false;

        // Targeted exclusions for grouped sets (OP14-EB04, OP15-EB04)
        // This ensures reprints from older sets (OP10, PRB, etc.) are kept,
        // while properly separating the overlapping new sets.
        if (normalizedFilter === "EB04") {
          if (cardIdNorm.startsWith("OP14") || cardIdNorm.startsWith("OP15")) return false;
        }
        if (normalizedFilter === "OP14" || normalizedFilter === "OP15") {
          if (cardIdNorm.startsWith("EB04")) return false;
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

  // Global search shortcut (/)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        selectedIndex < 0 &&
        !showBinderPicker &&
        !showMultiBinderPicker
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedIndex, showBinderPicker, showMultiBinderPicker]);

  // ── BINDER ACTIONS ──
  const ownedSet = useMemo(() =>
    new Set(userCards.filter(u => !u.in_wishlist).map(u => u.card_id)), [userCards]);
  const wishlistSet = useMemo(() =>
    new Set(userCards.filter(u => u.in_wishlist).map(u => u.card_id)), [userCards]);

  const handleToggleOwned = async (cardId: string) => {
    if (ownedSet.has(cardId)) {
      setUserCards(prev => prev.filter(u => u.card_id !== cardId));
      showToast("Removed from collection", "info");
      if (user) {
        await removeUserCard(user.id, cardId);
      } else {
        removeGuestUserCard(cardId);
      }
    } else {
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
      showToast("Added to collection", "success");
      if (user) {
        await addUserCard(user.id, cardId, false);
      } else {
        saveGuestUserCard(cardId, false);
      }
    }
  };

  const handleToggleWishlist = async (cardId: string) => {
    if (wishlistSet.has(cardId)) {
      setUserCards(prev => prev.filter(u => u.card_id !== cardId));
      showToast("Removed from wishlist", "info");
      if (user) {
        await removeUserCard(user.id, cardId);
      } else {
        removeGuestUserCard(cardId);
      }
    } else {
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: true }]);
      showToast("Added to wishlist", "wishlist");
      if (user) {
        await addUserCard(user.id, cardId, true);
      } else {
        saveGuestUserCard(cardId, true);
      }
    }
  };

  const handleToggleBinderCard = async (binderId: string, cardId: string) => {
    const current = binderCardMap[binderId] ?? [];
    const bName = binders.find(b => b.id === binderId)?.name;
    if (current.includes(cardId)) {
      if (user) {
        await removeCardFromBinder(binderId, cardId);
      } else {
        removeGuestBinderCard(binderId, cardId);
      }
      setBinderCardMap(prev => ({ ...prev, [binderId]: prev[binderId].filter(id => id !== cardId) }));
      showToast(bName ? `Removed from "${bName}"` : "Removed from binder", "info");
    } else {
      if (user) {
        await addCardToBinder(binderId, cardId);
      } else {
        addGuestBinderCard(binderId, cardId);
      }
      setBinderCardMap(prev => ({ ...prev, [binderId]: [...(prev[binderId] ?? []), cardId] }));
      showToast(bName ? `Added to "${bName}"` : "Added to binder", "success");
      if (!ownedSet.has(cardId)) {
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
        if (user) {
          await addUserCard(user.id, cardId, false);
        } else {
          saveGuestUserCard(cardId, false);
        }
      }
    }
  };

  // ── INLINE BINDER CREATION — single card modal ──
  const handleCreateBinderInline = async (cardId: string) => {
    if (!newBinderNameInline.trim() || creatingBinderLoading) return;
    setCreatingBinderLoading(true);
    let b: Binder | null = null;
    if (user) {
      b = await createBinder(user.id, newBinderNameInline.trim());
    } else {
      b = createGuestBinder(newBinderNameInline.trim());
    }
    if (b) {
      setBinders(prev => [...prev, b!]);
      if (user) {
        await addCardToBinder(b.id, cardId);
      } else {
        addGuestBinderCard(b.id, cardId);
      }
      setBinderCardMap(prev => ({ ...prev, [b!.id]: [cardId] }));
      showToast(`Binder "${b.name}" created!`, "celebrate");
      if (!ownedSet.has(cardId)) {
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
        if (user) {
          await addUserCard(user.id, cardId, false);
        } else {
          saveGuestUserCard(cardId, false);
        }
      }
    }
    resetInlineCreation();
    setCreatingBinderLoading(false);
  };

  // ── INLINE BINDER CREATION — multi-select ──
  const handleMultiCreateBinder = async () => {
    if (!newBinderNameInline.trim() || creatingBinderLoading) return;
    setCreatingBinderLoading(true);
    let b: Binder | null = null;
    if (user) {
      b = await createBinder(user.id, newBinderNameInline.trim());
    } else {
      b = createGuestBinder(newBinderNameInline.trim());
    }
    if (b) {
      setBinders(prev => [...prev, b!]);
      const keys = [...multiSelected].map(toCardKey);
      setBulkProgress({ done: 0, total: keys.length });
      let done = 0;
      const addedKeys: string[] = [];
      await Promise.all(keys.map(async (cardKey) => {
        if (user) {
          await addCardToBinder(b!.id, cardKey);
        } else {
          addGuestBinderCard(b!.id, cardKey);
        }
        addedKeys.push(cardKey);
        if (!ownedSet.has(cardKey)) {
          if (user) {
            await addUserCard(user.id, cardKey, false);
          } else {
            saveGuestUserCard(cardKey, false);
          }
          setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: false }]);
        }
        done++;
        setBulkProgress({ done, total: keys.length });
      }));
      setBinderCardMap(prev => ({ ...prev, [b!.id]: addedKeys }));
      showToast(`Binder "${b.name}" created with ${keys.length} cards!`, "celebrate");
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
    const keys = [...multiSelected].map(toCardKey).filter(k => !ownedSet.has(k));
    if (keys.length === 0) { exitSelectMode(); return; }
    setBulkProgress({ done: 0, total: keys.length });
    let done = 0;
    await Promise.all(keys.map(async (cardKey) => {
      if (user) {
        await addUserCard(user.id, cardKey, false);
      } else {
        saveGuestUserCard(cardKey, false);
      }
      done++;
      setBulkProgress({ done, total: keys.length });
      setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: false }]);
    }));
    setBulkProgress(null);
    showToast(`${keys.length} cards marked as owned`, "success");
    exitSelectMode();
  };

  const handleMultiAddToBinder = async (binderId: string) => {
    const current = binderCardMap[binderId] ?? [];
    const bName = binders.find(b => b.id === binderId)?.name;
    const keys = [...multiSelected].map(toCardKey).filter(k => !current.includes(k));
    if (keys.length === 0) { exitSelectMode(); return; }
    setBulkProgress({ done: 0, total: keys.length });
    let done = 0;
    await Promise.all(keys.map(async (cardKey) => {
      if (user) {
        await addCardToBinder(binderId, cardKey);
      } else {
        addGuestBinderCard(binderId, cardKey);
      }
      if (!ownedSet.has(cardKey)) {
        if (user) {
          await addUserCard(user.id, cardKey, false);
        } else {
          saveGuestUserCard(cardKey, false);
        }
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardKey), { card_id: cardKey, in_wishlist: false }]);
      }
      done++;
      setBulkProgress({ done, total: keys.length });
      setBinderCardMap(prev => ({ ...prev, [binderId]: [...(prev[binderId] ?? []), cardKey] }));
    }));
    setBulkProgress(null);
    showToast(bName ? `${keys.length} cards added to "${bName}"` : `${keys.length} cards added to binder`, "success");
    exitSelectMode();
  };

  const allSelectKeys = filtered.map((c, i) => `${getCardKey(c)}||${i}`);
  const allSelected = allSelectKeys.length > 0 && allSelectKeys.every(k => multiSelected.has(k));

  const activeFilterCount = (filters.colors?.length ? 1 : 0) +
    (filters.setId ? 1 : 0) +
    (filters.setType ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.rarity ? 1 : 0) +
    (filters.spOnly ? 1 : 0);

  const hasFilters = search || activeFilterCount > 0;

  const isAnimating = animatedKey < filterKey;

  // Shared "New binder" inline UI — renders inside whichever picker calls it
  const renderNewBinderRow = (onConfirm: () => void) => (
    creatingBinderInline ? (
      <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-border-theme my-1">
        <Plus size={13} className="shrink-0 text-text-tertiary" />
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
          className="flex-1 bg-transparent border-0 outline-none text-[13px] text-text-primary font-inherit min-w-0"
        />
        <button
          onClick={onConfirm}
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
    )
  );

  return (
    <div
      suppressHydrationWarning
      className="browse-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5 pt-16 transition-colors duration-300"
    >
      <Sidebar />

      {/* ── FIXED HEADER ── */}
      <header className="browse-header bg-bg-secondary border-b border-border-theme px-6 py-3 flex items-center justify-center fixed top-0 left-17.5 right-0 h-16 z-30 transition-colors duration-300">
        <div className="browse-search-container flex items-center gap-2 flex-1 justify-center max-w-200">
          <div className="browse-search-input-wrap relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            <input
              ref={searchInputRef}
              className="browse-search-input w-full pl-9 pr-4 py-2 text-sm border border-border-theme rounded-lg bg-bg-primary text-text-primary outline-none transition-all focus:border-text-primary focus:ring-2 focus:ring-accent-theme/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search card (/)"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSortDesc(!sortDesc)}
            className={`p-2 rounded-md border border-border-theme cursor-pointer text-sm font-semibold transition-all ${
              sortDesc ? "bg-bg-tertiary text-text-primary" : "bg-transparent text-text-tertiary hover:text-text-primary"
            }`}
            title={sortDesc ? "Descending" : "Ascending"}
          >
            {sortDesc ? (
              <ArrowDownWideNarrow className="w-4 h-4" />
            ) : (
              <ArrowUpNarrowWide className="w-4 h-4" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => {
                if (isSelectMode) {
                  exitSelectMode();
                } else {
                  setShowSelectMenu(!showSelectMenu);
                }
              }}
              title={isSelectMode ? "Exit selection" : "Options"}
              className={`p-2 rounded-lg border cursor-pointer flex items-center justify-center shrink-0 transition-all ${
                isSelectMode || showSelectMenu
                  ? "border-text-primary bg-bg-tertiary text-text-primary"
                  : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
              }`}
            >
              {isSelectMode ? <X size={16} /> : <MoreVertical size={16} />}
            </button>

            {showSelectMenu && !isSelectMode && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSelectMenu(false)}
                />
                <div className="absolute top-full right-0 mt-2 bg-bg-primary border border-border-theme rounded-xl shadow-2xl overflow-hidden z-50 min-w-40 flex flex-col">
                  <button
                    onClick={() => {
                      enterSelectMode();
                      setShowSelectMenu(false);
                    }}
                    className="p-3.5 bg-transparent border-0 text-text-primary text-sm font-medium text-left cursor-pointer flex items-center gap-3 hover:bg-bg-tertiary transition-colors"
                  >
                    <CheckSquare size={16} className="text-text-tertiary" />
                    <span>Select Cards</span>
                  </button>
                  <div className="h-px bg-border-theme" />
                  <button
                    onClick={() => {
                      setMultiSelected(new Set(allSelectKeys));
                      setIsSelectMode(true);
                      setShowSelectMenu(false);
                    }}
                    className="p-3.5 bg-transparent border-0 text-text-primary text-sm font-medium text-left cursor-pointer flex items-center gap-3 hover:bg-bg-tertiary transition-colors"
                  >
                    <CopyCheck size={16} className="text-text-tertiary" />
                    <span>Select All</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Mobile Filter Toggle Button */}
          <button
            className="browse-filter-toggle relative p-2 rounded-lg border cursor-pointer flex items-center justify-center shrink-0 transition-all"
            onClick={() => setMobileFiltersOpen(prev => !prev)}
            title={mobileFiltersOpen ? "Hide filters" : "Show filters"}
            style={{
              borderColor: mobileFiltersOpen || activeFilterCount > 0 ? tc.text.primary : tc.border,
              background: mobileFiltersOpen || activeFilterCount > 0 ? tc.bg.tertiary : "transparent",
              color: mobileFiltersOpen || activeFilterCount > 0 ? tc.text.primary : tc.text.tertiary,
            }}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-theme text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Desktop FilterBar — only rendered on desktop screens */}
      {!isMobile && (
        <div className="desktop-filterbar">
          <FilterBar sets={sets} filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* Mobile Floating Slide-Down Filter Drawer attached directly below the search header */}
      {isMobile && mobileFiltersOpen && (
        <>
          <div
            className="filter-drawer-backdrop fixed top-14.5 inset-x-0 bottom-0 bg-black/45 backdrop-blur-[2px] z-25"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="browse-mobile-drawer fixed top-14.5 inset-x-0 z-30 bg-bg-primary border-b border-border-theme shadow-2xl max-h-[calc(100vh-58px)] overflow-y-auto">
            <FilterBar sets={sets} filters={filters} onChange={setFilters} isMobileDrawer={true} />
            <div className="px-4 pt-2 pb-3.5 bg-bg-primary flex items-center justify-between">
              {activeFilterCount > 0 ? (
                <button
                  onClick={() => setFilters({})}
                  className="text-xs font-semibold text-text-tertiary bg-transparent border-0 cursor-pointer py-1 px-2 hover:text-text-primary"
                >
                  Reset all
                </button>
              ) : <div />}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="py-1.5 px-4.5 rounded-lg bg-text-primary text-bg-primary text-xs font-bold border-0 cursor-pointer hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      <div className="px-6 py-3 flex items-center justify-between border-b border-border-theme">
        <span className="text-sm text-text-tertiary">
          {loading ? (
            "Loading cards..."
          ) : (
            <>
              Showing{" "}
              <strong className="text-text-primary">
                {filtered.length}
              </strong>{" "}
              {filtered.length === 1 ? "card" : "cards"}
            </>
          )}
        </span>
        {hasFilters && (
          <button
            onClick={() => {
              setFilters({});
              setSearch("");
            }}
            className="text-xs text-accent-theme font-semibold bg-transparent border-0 cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-75"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      <main className="browse-main px-6 pb-16">
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .skeleton-loader { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        `}</style>

        {loading ? (
          <div className="browse-skeleton-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-loader rounded-xl bg-bg-tertiary border border-border-theme h-64"
              />
            ))}
          </div>
        ) : (
          <div className="browse-card-grid grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 mt-4">
            {filtered.slice(0, visibleCards).map((card, i) => {
              const shouldFlip = isAnimating && i < 10;
              const isLastFlip = i === Math.min(9, filtered.length - 1);
              const cardKey = getCardKey(card);
              const isOwned = ownedSet.has(cardKey);
              const isWishlisted = wishlistSet.has(cardKey);
              const selectKey = `${cardKey}||${i}`;
              const isMultiChecked = multiSelected.has(selectKey);
              return (
                <div
                  key={`${filterKey}-${card.id}-${i}`}
                  className="relative"
                  style={{ perspective: shouldFlip ? "1000px" : "none" }}
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
                    onAnimationEnd={
                      isLastFlip ? () => setAnimatedKey(filterKey) : undefined
                    }
                  >
                    {shouldFlip && (
                      <div className="absolute inset-0 rounded-[14px] overflow-hidden backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(180deg)]">
                        <Image
                          src={
                            card.type?.toUpperCase() === "LEADER"
                              ? "/card-back-leader.png"
                              : "/card-back.png"
                          }
                          alt=""
                          fill
                          loading="lazy"
                          className="object-cover rounded-[14px]"
                        />
                      </div>
                    )}
                    <div
                      className={`rounded-[14px] transition-all duration-150 ${
                        isMultiChecked ? "ring-3 ring-indigo-500" : ""
                      }`}
                      style={{
                        backfaceVisibility: shouldFlip ? "hidden" : "visible",
                        WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible",
                      }}
                      onClick={() => {
                        if (isSelectMode) toggleMultiSelect(selectKey);
                        else setSelectedIndex(i);
                      }}
                    >
                      <CardItem card={card} onClick={() => {}} />
                    </div>
                  </div>
                  {isOwned && !isSelectMode && (
                    <div className="absolute top-2.5 left-2.5 w-5.5 h-5.5 rounded-full bg-green-600 flex items-center justify-center z-10 shadow-md pointer-events-none">
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  {isWishlisted && !isSelectMode && (
                    <div className={`absolute top-2.5 ${isOwned ? "left-9" : "left-2.5"} w-5.5 h-5.5 rounded-full bg-amber-500 flex items-center justify-center z-10 shadow-md pointer-events-none`}>
                      <Star size={12} fill="#fff" color="#fff" />
                    </div>
                  )}
                  {isSelectMode && (
                    <div
                      className={`absolute top-2.5 right-2.5 w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center z-10 transition-all pointer-events-none ${
                        isMultiChecked
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-white/70 bg-black/30"
                      }`}
                    >
                      {isMultiChecked && (
                        <Check size={13} color="#fff" strokeWidth={3} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 text-text-tertiary flex flex-col items-center">
            <Image
              src="/nocard.png"
              alt="No cards found"
              width={120}
              height={120}
              priority
              className="mb-5 object-contain opacity-90"
            />
            <div className="font-bold text-xl text-text-primary">
              No cards found
            </div>
            <div className="text-sm mt-1.5 text-text-tertiary">
              Try adjusting your filters
            </div>
          </div>
        )}
      </main>

      {/* ── CARD DETAIL MODAL ── */}
      {selected && (
        <div
          className="card-modal-outer fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setSelectedIndex(-1);
            setShowBinderPicker(false);
            resetInlineCreation();
          }}
        >
          <div
            className="card-modal-nav-row flex items-center justify-center gap-4 w-full max-w-240"
            onClick={(e) => e.stopPropagation()}
          >
            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-prev shrink-0 w-11 h-11 rounded-full bg-bg-primary shadow-xl border border-border-theme flex items-center justify-center text-text-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() => {
                  setSelectedIndex(selectedIndex - 1);
                  setShowBinderPicker(false);
                  resetInlineCreation();
                }}
                disabled={selectedIndex <= 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div
              className="card-modal-container flex-1 bg-bg-primary rounded-[20px] shadow-2xl border border-border-theme overflow-hidden max-h-[90vh] flex flex-col"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
            >
              <div className="card-modal-header flex justify-between items-center py-4.5 px-6 border-b border-border-theme shrink-0 gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[22px] text-text-primary tracking-tight leading-tight">
                    {selected.name}
                  </div>
                  <div className="text-xs text-text-tertiary font-mono mt-0.5">
                    {selected.id}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative flex items-center gap-2">
                    {ownedSet.has(getCardKey(selected)) && (
                      <div className="w-4.5 h-4.5 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                        <Check size={11} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                    {wishlistSet.has(getCardKey(selected)) && (
                      <div className="w-4.5 h-4.5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <Star size={11} fill="#fff" color="#fff" />
                      </div>
                    )}
                    <button
                      className="card-modal-btn flex items-center justify-center gap-1.5 py-1.75 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all border border-border-theme bg-transparent text-text-tertiary hover:border-text-secondary hover:text-text-primary"
                      onClick={() => {
                        const next = !showBinderPicker;
                        setShowBinderPicker(next);
                        if (!next) resetInlineCreation();
                      }}
                      title="Add to binder"
                      aria-label="Add to binder"
                    >
                      <BookmarkPlus size={15} />
                      {!isMobile && <span className="card-modal-btn-label">Add to binder</span>}
                    </button>
                    {showBinderPicker && (
                      <div
                        className="absolute top-[calc(100%+8px)] right-0 w-60 bg-bg-primary border border-border-theme rounded-xl overflow-hidden shadow-2xl z-10 p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Collection section */}
                        <div className="pb-1">
                          <div className="text-[10px] text-text-tertiary font-semibold tracking-wider uppercase py-1 px-2">
                            Collection
                          </div>
                          <button
                            onClick={() => handleToggleOwned(getCardKey(selected))}
                            className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                              ownedSet.has(getCardKey(selected))
                                ? "bg-green-600/15 text-green-600 dark:text-green-400"
                                : "bg-transparent text-text-primary hover:bg-bg-secondary"
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                              ownedSet.has(getCardKey(selected))
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-border-theme bg-transparent"
                            }`}>
                              {ownedSet.has(getCardKey(selected)) && (
                                <Check size={10} color="#fff" strokeWidth={3} />
                              )}
                            </div>
                            <span>I own this card</span>
                          </button>
                          <button
                            onClick={() => handleToggleWishlist(getCardKey(selected))}
                            className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                              wishlistSet.has(getCardKey(selected))
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-transparent text-text-primary hover:bg-bg-secondary"
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                              wishlistSet.has(getCardKey(selected))
                                ? "border-amber-500 bg-amber-500 text-white"
                                : "border-border-theme bg-transparent"
                            }`}>
                              {wishlistSet.has(getCardKey(selected)) && (
                                <Star size={10} fill="#fff" color="#fff" />
                              )}
                            </div>
                            <span>Add to wishlist</span>
                          </button>
                        </div>
                        {/* My binders section */}
                        <div className="h-px bg-border-theme my-1" />
                        <div className="pt-1">
                          <div className="text-[10px] text-text-tertiary font-semibold tracking-wider uppercase py-1 px-2">
                            My binders
                          </div>
                          <div className="max-h-45 overflow-y-auto">
                            {binders.map((binder) => {
                              const inBinder = (binderCardMap[binder.id] ?? []).includes(getCardKey(selected));
                              return (
                                <button
                                  key={binder.id}
                                  onClick={() => handleToggleBinderCard(binder.id, getCardKey(selected))}
                                  className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                                    inBinder
                                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                      : "bg-transparent text-text-primary hover:bg-bg-secondary"
                                  }`}
                                >
                                  <BookOpen size={14} className="shrink-0" />
                                  <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {binder.name}
                                  </span>
                                  {inBinder && <Check size={12} strokeWidth={3} />}
                                </button>
                              );
                            })}
                          </div>
                          <div className="pb-1">
                            {renderNewBinderRow(() => handleCreateBinderInline(getCardKey(selected)))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIndex(-1);
                      setShowBinderPicker(false);
                      resetInlineCreation();
                    }}
                    className="bg-transparent border-0 cursor-pointer p-1 flex items-center justify-center text-text-tertiary hover:text-text-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="card-modal-body flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
                <div className="card-modal-image-pane w-full md:w-[48%] shrink-0 bg-bg-primary flex items-center justify-center p-6 md:pl-7 md:pr-5">
                  <div className="w-full max-w-90 mx-auto">
                    <ModalCardImage
                      key={selected.images?.large ?? selected.images?.small ?? selected.id}
                      src={selected.images?.large || selected.images?.small || "/card-placeholder.png"}
                      alt={selected.name}
                      isLeader={selected.type?.toUpperCase() === "LEADER"}
                      isDark={isDark}
                    />
                  </div>
                </div>
                <div className="card-modal-details-pane flex-1 min-w-0 overflow-y-auto p-6 md:pl-4 md:pr-7 flex flex-col gap-3.5">
                  <div className="card-modal-detail-grid grid grid-cols-2 gap-2.5">
                    {[
                      ["Type", selected.type],
                      ["Rarity", selected.rarity?.replace(/^PR$/i, "P")],
                      ["Color", selected.color],
                      ["Cost", selected.cost],
                      ["Power", selected.power],
                      ["Counter", selected.counter],
                      ["Attribute", selected.attribute?.name],
                      ["Family", selected.family],
                      ["Set", selected.set?.name],
                    ]
                      .filter(([, v]) => v != null && v !== "" && v !== "-")
                      .map(([label, value]) => (
                        <div
                          key={String(label)}
                          className={`bg-bg-secondary rounded-[10px] p-2.5 md:px-3.5 border border-border-theme min-w-0 ${
                            label === "Set" ? "col-span-2" : ""
                          }`}
                        >
                          <div className="text-[11px] text-text-tertiary mb-0.75 uppercase tracking-wider font-bold">
                            {label}
                          </div>
                          <div className="font-semibold text-sm text-text-primary leading-snug wrap-break-word whitespace-normal">
                            {label === "Family" && typeof value === "string" && value.includes("/") ? (
                              <div className="flex flex-col gap-0.5">
                                {value.split("/").map((part, idx) => (
                                  <div key={idx} className="leading-tight">
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
                  {selected.ability && (
                    <div className="bg-bg-secondary rounded-[10px] p-3 md:px-3.5 border border-border-theme">
                      <div className="text-[11px] text-text-tertiary mb-1.5 uppercase tracking-wider font-bold">
                        Effect
                      </div>
                      <div className="text-sm text-text-primary leading-relaxed">
                        {selected.ability}
                      </div>
                    </div>
                  )}
                  {selected.trigger && selected.trigger !== "" && (
                    <div className="bg-amber-500/10 rounded-[10px] p-3 md:px-3.5 border border-amber-500/25">
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 mb-1.5 uppercase tracking-wider font-bold">
                        Trigger
                      </div>
                      <div className="text-sm text-text-primary leading-relaxed">
                        {selected.trigger}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-modal-footer border-t border-border-theme py-2.5 px-6 text-center text-xs text-text-tertiary shrink-0">
                {selectedIndex + 1} / {filtered.length}
              </div>
            </div>

            {(!isMobile || isLandscape) && (
              <button
                className="card-modal-next shrink-0 w-11 h-11 rounded-full bg-bg-primary shadow-xl border border-border-theme flex items-center justify-center text-text-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() => {
                  setSelectedIndex(selectedIndex + 1);
                  setShowBinderPicker(false);
                  resetInlineCreation();
                }}
                disabled={selectedIndex >= filtered.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── BULK PROGRESS BAR ── */}
      {bulkProgress && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 bg-bg-primary border border-border-theme rounded-xl py-2.5 px-4 shadow-2xl min-w-55">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-text-primary">
              Processing...
            </span>
            <span className="text-xs text-text-tertiary">
              {bulkProgress.done} / {bulkProgress.total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-150 ease-out"
              style={{
                width: `${Math.round(
                  (bulkProgress.done / bulkProgress.total) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && !isSelectMode && (
        <button
          className="browse-scroll-top fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-bg-tertiary text-text-primary border border-border-theme cursor-pointer text-[22px] font-bold shadow-xl z-20 flex items-center justify-center transition-all hover:scale-105"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}

      {/* ── MULTI-SELECT BOTTOM BAR ── */}
      {isSelectMode && (
        <div className={`browse-multi-select-bar fixed ${isNarrow ? "bottom-4" : "bottom-6"} left-1/2 -translate-x-1/2 z-25 flex items-center ${isNarrow ? "gap-1 p-1.5 rounded-xl" : "gap-2 py-2.5 px-3.5 rounded-2xl"} bg-bg-primary border border-border-theme shadow-2xl max-w-[calc(100vw-16px)] w-max`}>
          <span className={`font-bold text-text-primary whitespace-nowrap shrink-0 ${isNarrow ? "text-[11px] px-1" : "text-[13px] px-1"}`}>
            {multiSelected.size} {isNarrow ? "sel." : "selected"}
          </span>
          <div className={`w-px ${isNarrow ? "h-3.5" : "h-4.5"} bg-border-theme shrink-0`} />
          <button
            onClick={handleMultiMarkOwned}
            disabled={multiSelected.size === 0}
            className={`flex items-center gap-1.5 ${isNarrow ? "py-1.5 px-2 text-[11px]" : "py-2 px-3.5 text-[13px]"} rounded-lg font-semibold whitespace-nowrap transition-all shrink-0 min-h-11 min-w-11 justify-center border border-green-600 ${
              multiSelected.size > 0
                ? "bg-green-600/15 text-green-600 dark:text-green-400 cursor-pointer"
                : "opacity-50 cursor-not-allowed text-green-600"
            }`}
          >
            <Check size={isNarrow ? 12 : 14} className="shrink-0" />
            <span>{isNarrow ? "Owned" : "Mark Owned"}</span>
          </button>
          <div className="relative shrink-0">
            <button
              onClick={() => {
                const next = !showMultiBinderPicker;
                setShowMultiBinderPicker(next);
                if (!next) resetInlineCreation();
              }}
              disabled={multiSelected.size === 0}
              className={`flex items-center gap-1.5 ${isNarrow ? "py-1.5 px-2 text-[11px]" : "py-2 px-3.5 text-[13px]"} rounded-lg font-semibold whitespace-nowrap transition-all border border-border-theme bg-transparent text-text-primary min-h-11 min-w-11 justify-center ${
                multiSelected.size > 0 ? "cursor-pointer hover:bg-bg-secondary" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <BookOpen size={isNarrow ? 12 : 14} className="shrink-0" />
              <span>{isNarrow ? "Binder" : "Add to Binder"}</span>
            </button>
            {showMultiBinderPicker && (
              <div
                className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-60 bg-bg-primary border border-border-theme rounded-xl overflow-hidden shadow-2xl z-10 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pb-1">
                  <div className="text-[10px] text-text-tertiary font-semibold tracking-wider uppercase py-1 px-2">
                    Add {multiSelected.size} to Binder
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {binders.length === 0 && (
                      <div className="text-xs text-text-tertiary py-2 px-2.5 text-center">
                        No binders yet
                      </div>
                    )}
                    {binders.map((binder) => (
                      <button
                        key={binder.id}
                        onClick={() => handleMultiAddToBinder(binder.id)}
                        className="w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors bg-transparent text-text-primary hover:bg-bg-secondary"
                      >
                        <BookOpen size={14} className="text-text-tertiary shrink-0" />
                        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                          {binder.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="pb-1">
                    {renderNewBinderRow(handleMultiCreateBinder)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (allSelected) {
                setMultiSelected(new Set());
              } else {
                setMultiSelected(new Set(allSelectKeys));
              }
            }}
            className={`flex items-center gap-1.5 ${isNarrow ? "py-1.5 px-2 text-[11px]" : "py-2 px-3.5 text-[13px]"} rounded-lg font-semibold whitespace-nowrap cursor-pointer border border-border-theme transition-all shrink-0 min-h-11 min-w-11 justify-center ${
              allSelected ? "bg-bg-tertiary text-text-primary" : "bg-transparent text-text-primary hover:bg-bg-secondary"
            }`}
          >
            <CheckSquare size={isNarrow ? 12 : 14} className="shrink-0" />
            <span>
              {allSelected
                ? isNarrow
                  ? "None"
                  : "Deselect All"
                : isNarrow
                ? "All"
                : "Select All"}
            </span>
          </button>
          <button
            onClick={exitSelectMode}
            title="Cancel selection"
            className={`flex items-center justify-center ${isNarrow ? "w-7 h-7" : "w-8 h-8"} rounded-lg cursor-pointer border border-border-theme bg-transparent text-text-tertiary hover:text-text-primary transition-all shrink-0 p-0 min-h-11 min-w-11`}
          >
            <X size={isNarrow ? 13 : 15} />
          </button>
        </div>
      )}
      <Toast toast={toast} isDark={isDark} />
    </div>
  );
}