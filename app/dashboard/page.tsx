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
                        className="dashboard-showcase-card"
                        onClick={() => setSelectedCard(card)}
                        title={`Inspect ${card.name}`}
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          padding: 8,
                          borderRadius: 12,
                          border: `1px solid ${tc.border}`,
                          background: tc.bg.primary,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          className="dashboard-showcase-image"
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "5 / 7",
                            overflow: "hidden",
                            borderRadius: 8,
                            background: tc.bg.tertiary,
                          }}
                        >
                          <Image
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            fill
                            sizes="(max-width: 768px) 130px, 110px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="dashboard-showcase-meta" style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
                          <span className="dashboard-showcase-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: 700, color: tc.text.primary }}>
                            {card.name}
                          </span>
                          <span className="dashboard-showcase-sub" style={{ fontSize: 11, color: tc.text.tertiary }}>
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
                    <Heart size={16} strokeWidth={2} style={{ color: tc.accent }} />
                    <span>No cards on your wishlist yet. Add cards from the Browse page.</span>
                  </div>
                ) : (
                  <div className="dashboard-wishlist-strip">
                    {wishlistCards.map((card) => (
                      <button
                        key={getCardKey(card)}
                        type="button"
                        className="dashboard-wishlist-card"
                        onClick={() => setSelectedCard(card)}
                        title={`Inspect ${card.name}`}
                        style={{
                          minWidth: 0,
                          padding: 0,
                          border: 0,
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          className="dashboard-card-image"
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "5 / 7",
                            overflow: "hidden",
                            borderRadius: 10,
                            border: `1px solid ${tc.border}`,
                            background: tc.bg.tertiary,
                          }}
                        >
                          <Image
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            fill
                            sizes="(max-width: 768px) 110px, 90px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <span className="dashboard-card-name" style={{ display: "block", marginTop: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, fontWeight: 600, color: tc.text.secondary }}>
                          {card.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 4. Color & Archetype Breakdown (New Widget) */}
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

                <div
                  className="dashboard-color-list"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "0 24px 24px",
                  }}
                >
                  {colorBreakdown.map((col) => (
                    <button
                      key={col.label}
                      type="button"
                      className="dashboard-color-row"
                      onClick={() => navigateToColor(col.label)}
                      title={`Browse all ${col.label} cards`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "78px minmax(0, 1fr) 36px",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        className="dashboard-color-badge"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 12,
                          fontWeight: 700,
                          color: tc.text.primary,
                        }}
                      >
                        <span
                          className="dashboard-color-dot"
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: col.dot,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${col.dot}55`,
                          }}
                        />
                        {col.label}
                      </span>
                      <span
                        className="dashboard-color-meter"
                        aria-hidden="true"
                        style={{
                          display: "block",
                          height: 6,
                          borderRadius: 999,
                          background: tc.bg.tertiary,
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            width: `${col.pct}%`,
                            background: col.meter,
                            borderRadius: 999,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </span>
                      <span
                        className="dashboard-color-count"
                        style={{
                          fontSize: 12,
                          fontWeight: 650,
                          color: tc.text.tertiary,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
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
                  <div className="dashboard-recent-list" style={{ padding: "0 14px 14px" }}>
                    {recentlyAdded.map(({ card, createdAt }) => (
                      <button
                        key={getCardKey(card)}
                        type="button"
                        className="dashboard-recent-row"
                        onClick={() => setSelectedCard(card)}
                        title={`Inspect ${card.name}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px minmax(0, 1fr) auto",
                          alignItems: "center",
                          gap: 12,
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          className="dashboard-recent-image"
                          style={{
                            position: "relative",
                            width: 40,
                            aspectRatio: "5 / 7",
                            overflow: "hidden",
                            borderRadius: 6,
                            border: `1px solid ${tc.border}`,
                            background: tc.bg.tertiary,
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            fill
                            sizes="40px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <span className="dashboard-recent-copy" style={{ display: "grid", minWidth: 0, gap: 2 }}>
                          <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, fontWeight: 700, color: tc.text.primary }}>
                            {card.name}
                          </strong>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, color: tc.text.tertiary }}>
                            {card.id} · {card.rarity || "Card"}
                          </span>
                        </span>
                        <span className="dashboard-recent-time" style={{ fontSize: 11, color: tc.text.tertiary, fontVariantNumeric: "tabular-nums" }}>
                          {timeAgo(createdAt)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 6. Rarity Distribution */}
              <section className="dashboard-panel dashboard-rarities" aria-labelledby="heading-rarities">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="dashboard-eyebrow">Tiers</span>
                    <h2 id="heading-rarities">Rarity distribution</h2>
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

                <div
                  className="dashboard-rarity-list"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "0 24px 24px",
                  }}
                >
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
                        className="dashboard-rarity-row"
                        onClick={() => navigateToRarity(r.label)}
                        title={`Filter cards by ${r.label}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "36px minmax(0, 1fr) 28px",
                          alignItems: "center",
                          gap: 12,
                          width: "100%",
                          padding: "4px 8px",
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: rarityStyle.badgeBg,
                            color: rarityStyle.badgeText,
                            fontSize: 11,
                            fontWeight: 800,
                            textAlign: "center",
                          }}
                        >
                          {r.label}
                        </span>
                        <span
                          className="dashboard-rarity-meter"
                          aria-hidden="true"
                          style={{
                            display: "block",
                            height: 6,
                            borderRadius: 999,
                            background: tc.bg.tertiary,
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              height: "100%",
                              width: `${pctOfMax}%`,
                              background: rarityStyle.meter,
                              borderRadius: 999,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </span>
                        <strong
                          style={{
                            fontSize: 12,
                            fontWeight: 650,
                            color: tc.text.tertiary,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
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
          className="dashboard-card-modal-outer"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100dvh",
            background: isDark ? "rgba(0, 0, 0, 0.78)" : "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? 12 : 20,
            boxSizing: "border-box",
          }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="dashboard-card-modal-container"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 680,
              maxHeight: isMobile && !isLandscape ? "92vh" : "88vh",
              background: tc.bg.primary,
              borderRadius: 20,
              border: `1px solid ${tc.border}`,
              boxShadow: isDark
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="dashboard-card-modal-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: `1px solid ${tc.border}`,
                flexShrink: 0,
                gap: 12,
                boxSizing: "border-box",
              }}
            >
              <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 750,
                    color: tc.text.primary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedCard.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tc.text.tertiary,
                    marginTop: 2,
                    fontFamily: "monospace",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedCard.id} · {selectedCard.set?.name || "One Piece Card Game"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                aria-label="Close modal"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1px solid ${tc.border}`,
                  background: tc.bg.secondary,
                  color: tc.text.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div
              className="dashboard-card-modal-body"
              style={{
                display: "flex",
                flexDirection: isMobile && !isLandscape ? "column" : "row",
                flex: 1,
                minHeight: 0,
                width: "100%",
                overflowY: isMobile && !isLandscape ? "auto" : "hidden",
                overflowX: "hidden",
                padding: isMobile && !isLandscape ? "14px 16px 16px" : "16px 20px 20px",
                gap: 20,
                boxSizing: "border-box",
              }}
            >
              {/* Card Image */}
              <div
                className="dashboard-card-modal-image-pane"
                style={{
                  width: isMobile && !isLandscape ? "100%" : "42%",
                  maxWidth: isMobile && !isLandscape ? 220 : 260,
                  margin: isMobile && !isLandscape ? "0 auto" : undefined,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ width: "100%", maxWidth: 260 }}>
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
              <div
                className="dashboard-card-modal-details-pane"
                style={{
                  flex: isMobile && !isLandscape ? "none" : "1 1 0%",
                  minWidth: 0,
                  width: isMobile && !isLandscape ? "100%" : 0,
                  overflowY: isMobile && !isLandscape ? "visible" : "auto",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxSizing: "border-box",
                  scrollbarWidth: "thin",
                }}
              >
                {/* Badges */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selectedCard.rarity && (
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: RARITY_COLORS[selectedCard.rarity]?.badgeBg || tc.bg.secondary,
                        border: `1px solid ${tc.border}`,
                        color: RARITY_COLORS[selectedCard.rarity]?.badgeText || tc.text.secondary,
                        fontSize: 12,
                        fontWeight: 750,
                      }}
                    >
                      {selectedCard.rarity}
                    </span>
                  )}
                  {selectedCard.type && (
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: tc.bg.secondary,
                        border: `1px solid ${tc.border}`,
                        color: tc.text.secondary,
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      {selectedCard.type}
                    </span>
                  )}
                  {selectedCard.color && (
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: tc.bg.secondary,
                        border: `1px solid ${tc.border}`,
                        color: tc.text.secondary,
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      {selectedCard.color}
                    </span>
                  )}
                </div>

                {/* Attributes Panel (Single Unified Card Box) */}
                <div
                  className="dashboard-card-modal-attrs"
                  style={{
                    background: tc.bg.secondary,
                    borderRadius: 12,
                    border: `1px solid ${tc.border}`,
                    padding: "12px 16px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 16px",
                    boxSizing: "border-box",
                  }}
                >
                  {selectedCard.cost != null && (
                    <div className="dashboard-card-modal-attr-row" style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 13, minWidth: 0 }}>
                      <span className="dashboard-card-modal-attr-label" style={{ color: tc.text.secondary, fontSize: 12, fontWeight: 500, opacity: 0.75, flexShrink: 0 }}>Cost:</span>
                      <span className="dashboard-card-modal-attr-value" style={{ color: tc.text.primary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedCard.cost}</span>
                    </div>
                  )}
                  {selectedCard.power != null && (
                    <div className="dashboard-card-modal-attr-row" style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 13, minWidth: 0 }}>
                      <span className="dashboard-card-modal-attr-label" style={{ color: tc.text.secondary, fontSize: 12, fontWeight: 500, opacity: 0.75, flexShrink: 0 }}>Power:</span>
                      <span className="dashboard-card-modal-attr-value" style={{ color: tc.text.primary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {typeof selectedCard.power === "number" ? selectedCard.power.toLocaleString() : String(selectedCard.power)}
                      </span>
                    </div>
                  )}
                  {selectedCard.counter != null && (
                    <div className="dashboard-card-modal-attr-row" style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 13, minWidth: 0 }}>
                      <span className="dashboard-card-modal-attr-label" style={{ color: tc.text.secondary, fontSize: 12, fontWeight: 500, opacity: 0.75, flexShrink: 0 }}>Counter:</span>
                      <span className="dashboard-card-modal-attr-value" style={{ color: tc.text.primary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedCard.counter}</span>
                    </div>
                  )}
                  {selectedCard.attribute && (
                    <div className="dashboard-card-modal-attr-row" style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 13, minWidth: 0 }}>
                      <span className="dashboard-card-modal-attr-label" style={{ color: tc.text.secondary, fontSize: 12, fontWeight: 500, opacity: 0.75, flexShrink: 0 }}>Attribute:</span>
                      <span className="dashboard-card-modal-attr-value" style={{ color: tc.text.primary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {typeof selectedCard.attribute === "object" ? selectedCard.attribute?.name : String(selectedCard.attribute)}
                      </span>
                    </div>
                  )}
                  {selectedCard.family && (
                    <div className="dashboard-card-modal-attr-row" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "baseline", gap: 6, fontSize: 13, minWidth: 0 }}>
                      <span className="dashboard-card-modal-attr-label" style={{ color: tc.text.secondary, fontSize: 12, fontWeight: 500, opacity: 0.75, flexShrink: 0 }}>Family:</span>
                      <span className="dashboard-card-modal-attr-value" style={{ color: tc.text.primary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedCard.family}</span>
                    </div>
                  )}
                </div>

                {/* Effect Box */}
                {selectedCard.ability && (
                  <div
                    className="dashboard-card-modal-effect"
                    style={{
                      background: tc.bg.secondary,
                      borderRadius: 12,
                      border: `1px solid ${tc.border}`,
                      padding: "12px 16px",
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: tc.text.primary,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      boxSizing: "border-box",
                    }}
                  >
                    {selectedCard.ability}
                  </div>
                )}

                {/* Trigger Box (if any) */}
                {selectedCard.trigger && selectedCard.trigger !== "" && (
                  <div
                    className="dashboard-card-modal-effect"
                    style={{
                      background: isDark ? "rgba(217, 119, 6, 0.12)" : "rgba(251, 191, 36, 0.1)",
                      borderRadius: 12,
                      border: `1px solid ${isDark ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.25)"}`,
                      padding: "12px 16px",
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: isDark ? "#fbbf24" : "#d97706",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 3 }}>
                      Trigger
                    </div>
                    {selectedCard.trigger}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="dashboard-card-modal-footer" style={{ marginTop: "auto", display: "flex", gap: 10, paddingTop: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      height: 42,
                      borderRadius: 10,
                      border: "none",
                      background: tc.accent,
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
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
                    style={{
                      height: 42,
                      padding: "0 22px",
                      borderRadius: 10,
                      border: `1px solid ${tc.border}`,
                      background: isDark ? "rgba(255,255,255,0.06)" : tc.bg.secondary,
                      color: tc.text.primary,
                      fontSize: 13,
                      fontWeight: 650,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : tc.border; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : tc.bg.secondary; }}
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