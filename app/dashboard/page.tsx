"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Sparkles,
  Trophy,
  Heart,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  BookOpen,
  X,
  Compass,
  WifiOff,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import ModalCardImage from "@/components/ModalCardImage";
import { createClient } from "@/lib/supabase";
import { getColors } from "@/lib/themes";
import { getAllCards, getAllDonCards } from "@/lib/api";
import { getUserCards, getCardKey, getDonCardKey, type UserCard } from "@/lib/binder";
import { Card } from "@/types/card";
import { SET_ORDER, SET_NAMES } from "@/lib/sets";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const RARITY_COLORS: Record<string, { badgeBg: string; badgeText: string; meter: string }> = {
  SEC: { badgeBg: "#fee2e2", badgeText: "#991b1b", meter: "#ef4444" },
  SR:  { badgeBg: "#ede9fe", badgeText: "#6d28d9", meter: "#8b5cf6" },
  R:   { badgeBg: "#dbeafe", badgeText: "#1e40af", meter: "#3b82f6" },
  UC:  { badgeBg: "#d1fae5", badgeText: "#065f46", meter: "#10b981" },
  C:   { badgeBg: "#f3f4f6", badgeText: "#374151", meter: "#9ca3af" },
  SP:  { badgeBg: "#fce7f3", badgeText: "#9d174d", meter: "#ec4899" },
  TR:  { badgeBg: "#e0f2fe", badgeText: "#0369a1", meter: "#0284c7" },
  P:   { badgeBg: "#fef3c7", badgeText: "#92400e", meter: "#f59e0b" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [allCards, setAllCards] = useState<Card[]>([]);
  const [allDonCards, setAllDonCards] = useState<any[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const hasLoadedRef = useRef(false);

  useBodyScrollLock(!!selectedCard);

  useEffect(() => {
    setMounted(true);
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight <= 540);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Keyboard navigation for card modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCard) {
        setSelectedCard(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingUser(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      const nextUser = session?.user ?? null;
      setUser((prev) => {
        // Prevent state churn if user id and email have not changed
        if (prev?.id === nextUser?.id && prev?.email === nextUser?.email) {
          return prev;
        }
        return nextUser;
      });
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadDashboardData = useCallback(async (userId: string, isSilent = false) => {
    if (!isSilent) {
      setLoadingData(true);
    }
    setError(null);
    try {
      const [cards, uc, don] = await Promise.all([
        getAllCards(),
        getUserCards(userId),
        getAllDonCards().catch(() => []),
      ]);
      setAllCards(cards);
      setUserCards(uc);
      setAllDonCards(don);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.message ||
          "Unable to load collection data from the network. Please verify your connection."
      );
    } finally {
      setLoadingData(false);
      setIsRetrying(false);
    }
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setLoadingData(false);
      return;
    }
    const isInitial = !hasLoadedRef.current;
    hasLoadedRef.current = true;
    loadDashboardData(userId, !isInitial);
  }, [userId, loadDashboardData]);

  useEffect(() => {
    const handleSynced = () => {
      if (userId) {
        loadDashboardData(userId, true);
      }
    };
    window.addEventListener("enies_guest_synced", handleSynced);
    return () => window.removeEventListener("enies_guest_synced", handleSynced);
  }, [userId, loadDashboardData]);

  // Online / offline event listeners for automatic recovery
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (userId && error) {
        loadDashboardData(userId, false);
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId, error, loadDashboardData]);

  const handleRetry = () => {
    if (!userId) return;
    setIsRetrying(true);
    loadDashboardData(userId, false);
  };

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const dashboardThemeVars = useMemo(
    () =>
      ({
        "--dashboard-bg": tc.bg.primary,
        "--dashboard-surface": tc.bg.secondary,
        "--dashboard-muted": tc.bg.tertiary,
        "--dashboard-text": tc.text.primary,
        "--dashboard-secondary-text": tc.text.secondary,
        "--dashboard-tertiary-text": tc.text.tertiary,
        "--dashboard-border": tc.border,
        "--dashboard-accent": tc.accent,
      } as React.CSSProperties),
    [tc]
  );

  const ownedSet = useMemo(
    () => new Set(userCards.filter((u) => !u.in_wishlist).map((u) => u.card_id)),
    [userCards]
  );

  const wishlistSet = useMemo(
    () => new Set(userCards.filter((u) => u.in_wishlist).map((u) => u.card_id)),
    [userCards]
  );

  const cardKeyMap = useMemo(() => {
    const map = new Map<string, Card>();
    for (const card of allCards) {
      map.set(getCardKey(card), card);
    }
    for (const don of allDonCards) {
      const donCard: Card = {
        ...don,
        id: don.card_name,
        name: don.card_name,
        set: { name: "DON!!" },
        images: {
          small: don.card_image || "/card-placeholder.png",
          large: don.card_image || "/card-placeholder.png",
        },
      };
      map.set(getDonCardKey(don), donCard);
    }
    return map;
  }, [allCards, allDonCards]);

  const totalOwned = useMemo(
    () => allCards.filter((c) => ownedSet.has(getCardKey(c))).length,
    [allCards, ownedSet]
  );

  const totalCards = allCards.length;
  const overallPct = totalCards === 0 ? 0 : Math.round((totalOwned / totalCards) * 100);

  const setProgress = useMemo(() => {
    return SET_ORDER.map((setId) => {
      const normalizedFilter = setId.replace(/-/g, "").toUpperCase();
      const setCards = allCards.filter((card) => {
        if (card.setType === "limited_product") return false;
        const setName = card.set?.name ?? "";
        const bracketMatch = setName.match(/\[([^\]]+)\]/);
        const normalizedSet = bracketMatch
          ? bracketMatch[1].replace(/-/g, "").toUpperCase()
          : setName.replace(/-/g, "").toUpperCase();
        const cardIdNorm = (card.id ?? "").replace(/-/g, "").toUpperCase();
        return normalizedSet.includes(normalizedFilter) || cardIdNorm.startsWith(normalizedFilter);
      });
      const owned = setCards.filter((c) => ownedSet.has(getCardKey(c))).length;
      const total = setCards.length;
      return {
        setId,
        owned,
        total,
        pct: total === 0 ? 0 : Math.round((owned / total) * 100),
      };
    }).filter((s) => s.total > 0);
  }, [allCards, ownedSet]);

  const activeSetsCount = useMemo(
    () => setProgress.filter((s) => s.owned > 0).length,
    [setProgress]
  );

  const closestToFinish = useMemo(() => {
    return [...setProgress]
      .filter((s) => s.pct < 100)
      .sort((a, b) => b.pct - a.pct || b.owned - a.owned)
      .slice(0, 5);
  }, [setProgress]);

  const topNextSet = useMemo(() => {
    const activeInProgress = closestToFinish.filter((s) => s.owned > 0);
    return activeInProgress[0] ?? closestToFinish[0] ?? null;
  }, [closestToFinish]);

  const rarityBreakdown = useMemo(() => {
    const order = ["SEC", "SR", "R", "UC", "C", "SP", "TR", "P"];
    const counts: Record<string, number> = {};
    for (const r of order) counts[r] = 0;

    for (const card of allCards) {
      if (!ownedSet.has(getCardKey(card))) continue;
      const id = card.id ?? "";
      const rawRarity = card.rarity?.replace(/\s+CARD\s*$/i, "").trim() ?? "";
      const name = card.name ?? "";

      let normalized = rawRarity;
      if (/^P-\d+/i.test(id) || rawRarity.toUpperCase() === "PROMO" || rawRarity.toUpperCase() === "P") {
        normalized = "P";
      } else if (name.includes("(SP)") || rawRarity.toUpperCase() === "SP") {
        normalized = "SP";
      }

      if (counts[normalized] !== undefined) {
        counts[normalized]++;
      }
    }

    return order.map((label) => ({ label, count: counts[label] ?? 0 }));
  }, [allCards, ownedSet]);

  const maxRarityCount = Math.max(...rarityBreakdown.map((r) => r.count), 1);

  // ── 1. CHASE SHOWCASE / CROWN JEWELS ──
  const chaseCards = useMemo(() => {
    const ownedCards = allCards.filter((c) => ownedSet.has(getCardKey(c)));
    const topTier = ownedCards.filter(
      (c) =>
        c.name?.includes("(SP)") ||
        c.rarity === "SP" ||
        c.rarity === "SEC" ||
        c.rarity === "TR"
    );
    if (topTier.length > 0) {
      return topTier.slice(0, 6);
    }
    // Fallback to highest-rarity owned cards (e.g. SRs) if no SEC/SP yet
    return ownedCards.filter((c) => c.rarity === "SR").slice(0, 6);
  }, [allCards, ownedSet]);

  // ── 2. COLOR & ARCHETYPE BREAKDOWN ──
  const COLOR_CONFIG = useMemo(
    () => [
      { label: "Red",    dot: "#ef4444", meter: "#ef4444" },
      { label: "Green",  dot: "#22c55e", meter: "#22c55e" },
      { label: "Blue",   dot: "#3b82f6", meter: "#3b82f6" },
      { label: "Purple", dot: "#a855f7", meter: "#a855f7" },
      { label: "Black",  dot: "#4b5563", meter: "#4b5563" },
      { label: "Yellow", dot: "#eab308", meter: "#eab308" },
    ],
    []
  );

  const colorBreakdown = useMemo(() => {
    return COLOR_CONFIG.map(({ label, dot, meter }) => {
      const total = allCards.filter((c) => c.color?.includes(label)).length;
      const owned = allCards.filter(
        (c) => c.color?.includes(label) && ownedSet.has(getCardKey(c))
      ).length;
      const pct = total === 0 ? 0 : Math.round((owned / total) * 100);
      return { label, dot, meter, owned, total, pct };
    });
  }, [allCards, ownedSet, COLOR_CONFIG]);

  const wishlistCards = useMemo(() => {
    const list: Card[] = [];
    for (const u of userCards) {
      if (!u.in_wishlist) continue;
      const card = cardKeyMap.get(u.card_id);
      if (card) {
        list.push(card);
        if (list.length >= 6) break;
      }
    }
    return list;
  }, [userCards, cardKeyMap]);

  const recentlyAdded = useMemo(() => {
    const recentEntries = [...userCards]
      .filter((u) => !u.in_wishlist)
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 6);

    return recentEntries
      .map((u) => {
        const card = cardKeyMap.get(u.card_id);
        return card && u.created_at ? { card, createdAt: u.created_at } : null;
      })
      .filter((entry): entry is { card: Card; createdAt: string } => !!entry);
  }, [userCards, cardKeyMap]);

  const navigateToSet = useCallback(
    (setId: string) => {
      router.push(`/browse?set=${encodeURIComponent(setId)}`);
    },
    [router]
  );

  const navigateToRarity = useCallback(
    (rarity: string) => {
      router.push(`/browse?rarity=${encodeURIComponent(rarity)}`);
    },
    [router]
  );

  const navigateToColor = useCallback(
    (color: string) => {
      router.push(`/browse?color=${encodeURIComponent(color)}`);
    },
    [router]
  );

  // ── LOADING USER STATE ──
  if (loadingUser) {
    return (
      <div
        className="dashboard-page dashboard-wrapper"
        style={dashboardThemeVars}
      >
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-skeleton">
            <span className="dashboard-skeleton-line dashboard-skeleton-eyebrow" />
            <span className="dashboard-skeleton-line dashboard-skeleton-title" />
            <span className="dashboard-skeleton-line dashboard-skeleton-subtitle" />
            <div className="dashboard-skeleton-progress" />
            <div className="dashboard-skeleton-grid">
              <div />
              <div />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── UNAUTHENTICATED ARRIVAL STATE ──
  if (!user) {
    return (
      <div
        className="dashboard-page dashboard-wrapper"
        style={dashboardThemeVars}
      >
        <Sidebar />
        <main className="dashboard-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <section className="dashboard-arrival dashboard-auth-gate">
            <div className="dashboard-arrival-copy">
              <span className="dashboard-eyebrow">Collection Intelligence</span>
              <h1>Track every set, rarity, and pull in one dashboard.</h1>
              <p>
                Sign in to view real-time completion analytics, identify sets closest to 100%, monitor rare card distribution, and manage your chase wishlist.
              </p>
              <div className="dashboard-arrival-actions">
                <button
                  type="button"
                  className="dashboard-button dashboard-button-primary"
                  onClick={() => {
                    setShowAuthModal(true);
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className="dashboard-button dashboard-button-secondary"
                  onClick={() => {
                    setShowAuthModal(true);
                  }}
                >
                  Create free account
                </button>
              </div>
            </div>
            <div className="dashboard-arrival-mark" aria-hidden="true">
              <Trophy size={42} strokeWidth={1.75} />
            </div>
          </section>
        </main>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    );
  }

  // ── DATA LOADING STATE ──
  if (loadingData) {
    return (
      <div
        className="dashboard-page dashboard-wrapper"
        style={dashboardThemeVars}
      >
        <Sidebar />
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <span className="dashboard-eyebrow">Collection Overview</span>
              <h1>Dashboard</h1>
              <p>Aggregating your collection sets, card rarities, and pull activity...</p>
            </div>
          </header>
          <div className="dashboard-skeleton">
            <div className="dashboard-skeleton-progress" style={{ marginTop: 0 }} />
            <div className="dashboard-skeleton-grid">
              <div />
              <div />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── NETWORK ERROR RECOVERY STATE ──
  if (error && !loadingData) {
    return (
      <div
        className="dashboard-page dashboard-wrapper"
        style={dashboardThemeVars}
      >
        <Sidebar />
        <main
          className="dashboard-main"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <section
            className="dashboard-state dashboard-error"
            style={{
              maxWidth: 580,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "44px 28px",
              borderRadius: 20,
              border: `1px solid ${tc.border}`,
              background: tc.bg.secondary,
              boxShadow: isDark
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.4)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              {isOffline ? (
                <WifiOff size={26} strokeWidth={2} />
              ) : (
                <AlertTriangle size={26} strokeWidth={2} />
              )}
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#ef4444",
                marginBottom: 6,
              }}
            >
              {isOffline ? "You are Offline" : "Connection Error"}
            </span>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 750,
                letterSpacing: "-0.03em",
                color: tc.text.primary,
                margin: 0,
              }}
            >
              Unable to load collection data
            </h2>

            <p
              style={{
                fontSize: 14,
                color: tc.text.secondary,
                lineHeight: 1.6,
                maxWidth: 420,
                margin: "12px 0 28px",
              }}
            >
              {isOffline
                ? "Your device is currently offline. Reconnect to the internet and we'll automatically resume your collection."
                : error}
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="dashboard-button dashboard-button-primary"
                style={{
                  padding: "11px 22px",
                  minWidth: 140,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <RefreshCw
                  size={15}
                  style={{
                    animation: isRetrying
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
                {isRetrying ? "Reconnecting..." : "Try again"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/browse")}
                className="dashboard-button dashboard-button-secondary"
                style={{ padding: "11px 20px" }}
              >
                <Compass size={15} />
                Browse catalog
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── EMPTY COLLECTION STATE ──
  const isBrandNew = totalOwned === 0 && wishlistCards.length === 0;

  return (
    <div
      className="dashboard-page dashboard-wrapper"
      style={dashboardThemeVars}
    >
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">Collection Overview</span>
            <h1>Dashboard</h1>
            <p>
              Set progress, rarity breakdown, and recent pulls across all official releases.
            </p>
          </div>
          <div className="dashboard-header-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="dashboard-button dashboard-button-secondary"
              onClick={() => router.push("/browse")}
            >
              <Compass size={15} />
              Browse cards
            </button>
            <button
              type="button"
              className="dashboard-button dashboard-button-primary"
              onClick={() => router.push("/binder")}
            >
              <BookOpen size={15} />
              Open binder
            </button>
          </div>
        </header>

        {isBrandNew ? (
          <div className="dashboard-content">
            <section className="dashboard-state dashboard-empty">
              <div className="dashboard-state-icon">
                <Sparkles size={36} />
              </div>
              <div>
                <h2>Your collection is ready to begin</h2>
                <p>
                  Start cataloging cards by marking them as owned or adding them to your wishlist on the Browse page. Your set completion metrics and activity timeline will populate here instantly.
                </p>
              </div>
              <button
                type="button"
                className="dashboard-button dashboard-button-primary"
                onClick={() => router.push("/browse")}
              >
                Start browsing
                <ArrowRight size={15} />
              </button>
            </section>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* ── HERO COMPLETION BANNER ── */}
            <section className="dashboard-progress" aria-label="Overall collection progress">
              <div className="dashboard-progress-copy">
                <span className="dashboard-eyebrow">Overall Completion</span>
                <p className="dashboard-progress-sentence">
                  You own <strong>{overallPct}%</strong> of eligible cards in the catalog.
                </p>
                <div
                  className="dashboard-progress-track"
                  role="progressbar"
                  aria-valuenow={overallPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className="dashboard-progress-value"
                    style={{ width: `${overallPct}%`, transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                </div>
                <div className="dashboard-progress-meta">
                  <span>
                    <strong>{totalOwned.toLocaleString()}</strong> / {totalCards.toLocaleString()} cards owned
                  </span>
                  <span>
                    <strong>{activeSetsCount}</strong> sets in progress
                  </span>
                </div>
              </div>

              {topNextSet && (
                <div className="dashboard-next-set">
                  <button
                    type="button"
                    className="dashboard-next-set-button"
                    onClick={() => navigateToSet(topNextSet.setId)}
                    aria-label={`Open set ${topNextSet.setId}, currently ${topNextSet.pct}% complete`}
                  >
                    <span className="dashboard-next-set-code">{topNextSet.setId}</span>
                    <span className="dashboard-next-set-name">
                      {SET_NAMES[topNextSet.setId] || "Expansion Set"}
                    </span>
                    <span className="dashboard-next-set-detail">
                      {topNextSet.owned} of {topNextSet.total} cards ({topNextSet.pct}%)
                      <ArrowRight size={14} />
                    </span>
                  </button>
                </div>
              )}
            </section>

            {/* ── ASYMMETRIC CONTENT GRID (WITH NEW WIDGETS) ── */}
            <div className="dashboard-grid">
              {/* 1. Chase Showcase / Crown Jewels */}
              <section className="dashboard-panel dashboard-showcase" aria-labelledby="heading-showcase">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Crown Jewels</span>
                    <h2 id="heading-showcase" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Sparkles size={17} style={{ color: tc.accent }} />
                      Chase showcase
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="dashboard-text-action"
                    onClick={() => router.push("/browse?rarity=SEC")}
                  >
                    View chase cards
                    <ArrowRight size={14} />
                  </button>
                </div>

                {chaseCards.length === 0 ? (
                  <div className="dashboard-inline-empty">
                    No Secret Rares or SP cards cataloged yet. Mark your highest-value pulls on the Browse page!
                  </div>
                ) : (
                  <div className="dashboard-showcase-strip">
                    {chaseCards.map((card) => (
                      <button
                        key={getCardKey(card)}
                        type="button"
                        className="dashboard-showcase-card relative flex flex-col p-2 rounded-xl border border-border-theme bg-bg-primary cursor-pointer text-left hover:border-accent-theme transition-colors"
                        onClick={() => setSelectedCard(card)}
                        title={`Inspect ${card.name}`}
                      >
                        <div className="dashboard-showcase-image relative w-full aspect-5/7 overflow-hidden rounded-lg bg-bg-tertiary">
                          <Image
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            fill
                            sizes="(max-width: 768px) 130px, 110px"
                            className="object-cover"
                          />
                        </div>
                        <div className="dashboard-showcase-meta flex flex-col gap-0.5 mt-2">
                          <span className="dashboard-showcase-name overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold text-text-primary">
                            {card.name}
                          </span>
                          <span className="dashboard-showcase-sub text-[11px] text-text-tertiary">
                            {card.id} · {card.rarity || "Card"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 2. Sets Nearing Completion */}
              <section className="dashboard-panel dashboard-sets" aria-labelledby="heading-sets">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Milestones</span>
                    <h2 id="heading-sets">Closest to finishing</h2>
                  </div>
                  <button
                    type="button"
                    className="dashboard-text-action"
                    onClick={() => router.push("/browse")}
                  >
                    View all sets
                    <ArrowRight size={14} />
                  </button>
                </div>

                {closestToFinish.length === 0 ? (
                  <div className="dashboard-inline-empty">
                    No active sets in progress yet. Browse sets to start cataloging cards.
                  </div>
                ) : (
                  <div className="dashboard-set-list">
                    {closestToFinish.map((set) => (
                      <button
                        key={set.setId}
                        type="button"
                        className="dashboard-set-row"
                        onClick={() => navigateToSet(set.setId)}
                        title={`View ${set.setId} in card browser`}
                      >
                        <span className="dashboard-set-label">
                          <strong>{set.setId}</strong> · {SET_NAMES[set.setId] || "Expansion"}
                        </span>
                        <span className="dashboard-set-count">
                          {set.owned}/{set.total}
                        </span>
                        <span className="dashboard-set-meter" aria-hidden="true">
                          <span style={{ width: `${set.pct}%` }} />
                        </span>
                        <span className="dashboard-set-percent">{set.pct}%</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 3. Wishlist Targets */}
              <section className="dashboard-panel dashboard-wishlist" aria-labelledby="heading-wishlist">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Priority Targets</span>
                    <h2 id="heading-wishlist">Wishlist highlights</h2>
                  </div>
                  <button
                    type="button"
                    className="dashboard-text-action"
                    onClick={() => router.push("/binder")}
                  >
                    Manage
                    <ArrowRight size={14} />
                  </button>
                </div>

                {wishlistCards.length === 0 ? (
                  <div className="dashboard-inline-empty dashboard-wishlist-empty">
                    <Heart size={16} strokeWidth={2} className="text-accent-theme" />
                    <span>No cards on your wishlist yet. Add cards from the Browse page.</span>
                  </div>
                ) : (
                  <div className="dashboard-wishlist-strip">
                    {wishlistCards.map((card) => (
                      <button
                        key={getCardKey(card)}
                        type="button"
                        className="dashboard-wishlist-card min-w-0 p-0 border-0 bg-transparent cursor-pointer text-left"
                        onClick={() => setSelectedCard(card)}
                        title={`Inspect ${card.name}`}
                      >
                        <div className="dashboard-card-image relative w-full aspect-5/7 overflow-hidden rounded-[10px] border border-border-theme bg-bg-tertiary">
                          <Image
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            fill
                            sizes="(max-width: 768px) 110px, 90px"
                            className="object-cover"
                          />
                        </div>
                        <span className="dashboard-card-name block mt-1.75 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-text-secondary">
                          {card.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 4. Color & Archetype Breakdown */}
              <section className="dashboard-panel dashboard-colors" aria-labelledby="heading-colors">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Deckbuilding</span>
                    <h2 id="heading-colors">Color affinity</h2>
                  </div>
                  <button
                    type="button"
                    className="dashboard-text-action"
                    onClick={() => router.push("/browse")}
                  >
                    Explore
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="dashboard-color-list flex flex-col gap-2.5 px-6 pb-6">
                  {colorBreakdown.map((col) => (
                    <button
                      key={col.label}
                      type="button"
                      className="dashboard-color-row grid grid-cols-[78px_minmax(0,1fr)_36px] items-center gap-3 w-full py-1.5 px-2 rounded-lg border-0 bg-transparent cursor-pointer text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => navigateToColor(col.label)}
                      title={`Browse all ${col.label} cards`}
                    >
                      <span className="dashboard-color-badge inline-flex items-center gap-1.75 text-xs font-bold text-text-primary">
                        <span
                          className="dashboard-color-dot w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background: col.dot,
                            boxShadow: `0 0 6px ${col.dot}55`,
                          }}
                        />
                        {col.label}
                      </span>
                      <span className="dashboard-color-meter block h-1.5 rounded-full bg-bg-tertiary overflow-hidden" aria-hidden="true">
                        <span
                          className="block h-full rounded-full transition-all duration-400 ease-out"
                          style={{
                            width: `${col.pct}%`,
                            background: col.meter,
                          }}
                        />
                      </span>
                      <span className="dashboard-color-count text-xs font-semibold text-text-tertiary text-right tabular-nums">
                        {col.pct}%
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. Recent Activity */}
              <section className="dashboard-panel dashboard-recent" aria-labelledby="heading-recent">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Activity</span>
                    <h2 id="heading-recent">Recently added</h2>
                  </div>
                  <button
                    type="button"
                    className="dashboard-text-action"
                    onClick={() => router.push("/binder")}
                  >
                    View binder
                    <ArrowRight size={14} />
                  </button>
                </div>

                {recentlyAdded.length === 0 ? (
                  <div className="dashboard-inline-empty">
                    Nothing marked owned recently. Mark owned cards on the Browse page.
                  </div>
                ) : (
                  <div className="dashboard-recent-list px-3.5 pb-3.5 flex flex-col gap-1">
                    {recentlyAdded.map(({ card, createdAt }) => (
                      <button
                        key={getCardKey(card)}
                        type="button"
                        className="dashboard-recent-row grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 w-full py-1.5 px-2.5 rounded-[10px] border-0 bg-transparent cursor-pointer text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setSelectedCard(card)}
                        title={`Inspect ${card.name}`}
                      >
                        <div className="dashboard-recent-image relative w-10 aspect-5/7 overflow-hidden rounded-md border border-border-theme bg-bg-tertiary shrink-0">
                          <Image
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="dashboard-recent-copy grid min-w-0 gap-0.5">
                          <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-text-primary">
                            {card.name}
                          </strong>
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-text-tertiary">
                            {card.id} · {card.rarity || "Card"}
                          </span>
                        </span>
                        <time className="dashboard-recent-time text-[11px] font-medium text-text-tertiary tabular-nums text-right">
                          {timeAgo(createdAt)}
                        </time>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 6. Rarity Distribution */}
              <section className="dashboard-panel dashboard-rarity" aria-labelledby="heading-rarity">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Distribution</span>
                    <h2 id="heading-rarity">Rarity spread</h2>
                  </div>
                  <button
                    type="button"
                    className="dashboard-text-action"
                    onClick={() => router.push("/browse")}
                  >
                    Filter
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="dashboard-rarity-list flex flex-col gap-2 px-6 pb-6">
                  {rarityBreakdown.map((r) => {
                    const rarityStyle = RARITY_COLORS[r.label] ?? {
                      badgeBg: tc.bg.tertiary,
                      badgeText: tc.accent,
                      meter: tc.accent,
                    };
                    const pctOfMax = (r.count / maxRarityCount) * 100;

                    return (
                      <button
                        key={r.label}
                        type="button"
                        className="dashboard-rarity-row grid grid-cols-[36px_minmax(0,1fr)_28px] items-center gap-3 w-full py-1 px-2 rounded-lg border-0 bg-transparent cursor-pointer text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => navigateToRarity(r.label)}
                        title={`Filter cards by ${r.label}`}
                      >
                        <span
                          className="inline-block py-0.5 px-1.5 rounded text-[11px] font-extrabold text-center"
                          style={{
                            background: rarityStyle.badgeBg,
                            color: rarityStyle.badgeText,
                          }}
                        >
                          {r.label}
                        </span>
                        <span className="dashboard-rarity-meter block h-1.5 rounded-full bg-bg-tertiary overflow-hidden" aria-hidden="true">
                          <span
                            className="block h-full rounded-full transition-all duration-400 ease-out"
                            style={{
                              width: `${pctOfMax}%`,
                              background: rarityStyle.meter,
                            }}
                          />
                        </span>
                        <strong className="text-xs font-semibold text-text-tertiary text-right tabular-nums">
                          {r.count}
                        </strong>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* ── CARD PREVIEW MODAL (MINIMALIST DASHBOARD VERSION) ── */}
      {selectedCard && (
        <div
          className="dashboard-card-modal-outer fixed inset-0 z-9999 flex items-center justify-center p-3 md:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="dashboard-card-modal-container relative w-full max-w-170 max-h-[92vh] md:max-h-[88vh] bg-bg-primary rounded-[20px] border border-border-theme shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="dashboard-card-modal-header flex items-center justify-between p-4 md:px-5 border-b border-border-theme shrink-0 gap-3">
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-lg font-bold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {selectedCard.name}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                  {selectedCard.id} · {selectedCard.set?.name || "One Piece Card Game"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-lg border border-border-theme bg-bg-secondary text-text-primary flex items-center justify-center cursor-pointer shrink-0 hover:bg-bg-tertiary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="dashboard-card-modal-body flex flex-col md:flex-row flex-1 min-h-0 w-full overflow-y-auto md:overflow-y-hidden overflow-x-hidden p-4 md:p-5 gap-5">
              {/* Card Image */}
              <div className="dashboard-card-modal-image-pane w-full md:w-[42%] max-w-55 md:max-w-65 mx-auto md:mx-0 shrink-0 flex items-center justify-center">
                <div className="w-full max-w-65">
                  <ModalCardImage
                    key={selectedCard.images?.large || selectedCard.images?.small || selectedCard.id}
                    src={selectedCard.images?.large || selectedCard.images?.small}
                    alt={selectedCard.name}
                    isDark={isDark}
                    isLeader={selectedCard.type === "LEADER"}
                  />
                </div>
              </div>

              {/* Details Pane */}
              <div className="dashboard-card-modal-details-pane flex-none md:flex-1 min-w-0 w-full md:w-0 overflow-y-visible md:overflow-y-auto overflow-x-hidden flex flex-col gap-3 [scrollbar-width:thin]">
                {/* Badges */}
                <div className="flex gap-1.5 flex-wrap">
                  {selectedCard.rarity && (
                    <span
                      className="py-0.75 px-2 rounded-md border border-border-theme text-xs font-bold"
                      style={{
                        background: RARITY_COLORS[selectedCard.rarity]?.badgeBg || tc.bg.secondary,
                        color: RARITY_COLORS[selectedCard.rarity]?.badgeText || tc.text.secondary,
                      }}
                    >
                      {selectedCard.rarity}
                    </span>
                  )}
                  {selectedCard.type && (
                    <span className="py-0.75 px-2 rounded-md bg-bg-secondary border border-border-theme text-text-secondary text-xs font-semibold">
                      {selectedCard.type}
                    </span>
                  )}
                  {selectedCard.color && (
                    <span className="py-0.75 px-2 rounded-md bg-bg-secondary border border-border-theme text-text-secondary text-xs font-semibold">
                      {selectedCard.color}
                    </span>
                  )}
                </div>

                {/* Attributes Panel (Single Unified Card Box) */}
                <div className="dashboard-card-modal-attrs bg-bg-secondary rounded-xl border border-border-theme p-3 md:px-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  {selectedCard.cost != null && (
                    <div className="dashboard-card-modal-attr-row flex items-baseline gap-1.5 text-[13px] min-w-0">
                      <span className="dashboard-card-modal-attr-label text-text-secondary text-xs font-medium opacity-75 shrink-0">Cost:</span>
                      <span className="dashboard-card-modal-attr-value text-text-primary text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">{selectedCard.cost}</span>
                    </div>
                  )}
                  {selectedCard.power != null && (
                    <div className="dashboard-card-modal-attr-row flex items-baseline gap-1.5 text-[13px] min-w-0">
                      <span className="dashboard-card-modal-attr-label text-text-secondary text-xs font-medium opacity-75 shrink-0">Power:</span>
                      <span className="dashboard-card-modal-attr-value text-text-primary text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                        {typeof selectedCard.power === "number" ? selectedCard.power.toLocaleString() : String(selectedCard.power)}
                      </span>
                    </div>
                  )}
                  {selectedCard.counter != null && (
                    <div className="dashboard-card-modal-attr-row flex items-baseline gap-1.5 text-[13px] min-w-0">
                      <span className="dashboard-card-modal-attr-label text-text-secondary text-xs font-medium opacity-75 shrink-0">Counter:</span>
                      <span className="dashboard-card-modal-attr-value text-text-primary text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">{selectedCard.counter}</span>
                    </div>
                  )}
                  {selectedCard.attribute && (
                    <div className="dashboard-card-modal-attr-row flex items-baseline gap-1.5 text-[13px] min-w-0">
                      <span className="dashboard-card-modal-attr-label text-text-secondary text-xs font-medium opacity-75 shrink-0">Attribute:</span>
                      <span className="dashboard-card-modal-attr-value text-text-primary text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                        {typeof selectedCard.attribute === "object" ? selectedCard.attribute?.name : String(selectedCard.attribute)}
                      </span>
                    </div>
                  )}
                  {selectedCard.family && (
                    <div className="dashboard-card-modal-attr-row col-span-2 flex items-baseline gap-1.5 text-[13px] min-w-0">
                      <span className="dashboard-card-modal-attr-label text-text-secondary text-xs font-medium opacity-75 shrink-0">Family:</span>
                      <span className="dashboard-card-modal-attr-value text-text-primary text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">{selectedCard.family}</span>
                    </div>
                  )}
                </div>

                {/* Effect Box */}
                {selectedCard.ability && (
                  <div className="dashboard-card-modal-effect bg-bg-secondary rounded-xl border border-border-theme p-3 md:px-4 text-[13px] leading-relaxed text-text-primary wrap-break-word">
                    {selectedCard.ability}
                  </div>
                )}

                {/* Trigger Box (if any) */}
                {selectedCard.trigger && selectedCard.trigger !== "" && (
                  <div className="dashboard-card-modal-effect bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 md:px-4 text-[13px] leading-relaxed text-amber-600 dark:text-amber-400 wrap-break-word">
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-0.75">
                      Trigger
                    </div>
                    {selectedCard.trigger}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="dashboard-card-modal-footer mt-auto flex gap-2.5 pt-2 shrink-0">
                  <button
                    type="button"
                    className="flex-1 h-10.5 rounded-lg border-0 bg-accent-theme text-white text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-90 transition-opacity"
                    onClick={() => {
                      const id = selectedCard.id;
                      setSelectedCard(null);
                      router.push(`/browse?search=${encodeURIComponent(id)}`);
                    }}
                  >
                    <Search size={15} strokeWidth={2.5} />
                    Find in browse
                  </button>
                  <button
                    type="button"
                    className="h-10.5 px-5 rounded-lg border border-border-theme bg-bg-secondary text-text-primary text-[13px] font-semibold cursor-pointer hover:bg-bg-tertiary transition-colors"
                    onClick={() => setSelectedCard(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}