"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getAllCards } from "@/lib/api";
import { Card } from "@/types/card";
import Sidebar from "@/components/Sidebar";
import {
  getUserCards, getBinders, getBinderCards, getBinderCardCounts,
  addUserCard, removeUserCard, createBinder, deleteBinder, renameBinder,
  addCardToBinder, removeCardFromBinder,
  getCardKey, getDonCardKey,
  type UserCard, type Binder,
} from "@/lib/binder";
import {
  getGuestUserCards, saveGuestUserCard, removeGuestUserCard,
  getGuestBinders, createGuestBinder, deleteGuestBinder, renameGuestBinder,
  getGuestBinderCards, getGuestBinderCardCounts,
  addGuestBinderCard, removeGuestBinderCard,
} from "@/lib/guestStorage";
import AuthModal from "@/components/AuthModal";
import { useTheme } from "next-themes";
import Image from "next/image";
import { getColors } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { SET_ORDER, SET_NAMES } from "@/lib/sets";
import { getAllDonCards } from "@/lib/api";
import ModalCardImage from "@/components/ModalCardImage";
import Toast, { ToastData, ToastType } from "@/components/Toast";
import { Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, CheckSquare, SlidersHorizontal, Plus, ArrowRight, BookOpen, Star, Search, ArrowUp, Tag, MoreVertical, Crown, ChevronDown, Sparkles } from "lucide-react";

const sortByCardId = (cards: Card[], setId?: string) => {
  const filterId = (setId ?? "").replace(/-/g, "").toUpperCase();
  return [...cards].sort((a, b) => {
    const aPrefix = (a.id ?? "").split("-")[0].toUpperCase();
    const bPrefix = (b.id ?? "").split("-")[0].toUpperCase();
    const aMatches = filterId ? (aPrefix.includes(filterId) || filterId.includes(aPrefix)) : true;
    const bMatches = filterId ? (bPrefix.includes(filterId) || filterId.includes(bPrefix)) : true;
    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    const numA = parseInt((a.id ?? "").split("-")[1] ?? "0");
    const numB = parseInt((b.id ?? "").split("-")[1] ?? "0");
    return numA - numB;
  });
};

const COLOR_DOT: Record<string, string> = {
  Red: "#ef4444", Green: "#22c55e", Blue: "#3b82f6",
  Purple: "#a855f7", Black: "#374151", Yellow: "#eab308",
};

const BINDER_PLACEHOLDERS = [
  "Straw Hat Grand Fleet...",
  "Manga Chase Grails...",
  "Wano Arc Masterpieces...",
  "Yonko Heavy Hitters...",
  "OP-05 Tournament Core...",
  "DON!! Foil Collection...",
  "Secret Rares & Alts...",
];
const FILTER_COLORS   = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
const FILTER_TYPES    = ["LEADER", "CHARACTER", "EVENT", "STAGE"];
const FILTER_RARITIES = ["SEC", "SR", "R", "UC", "C", "P", "TR"];

const FLIP_STYLE = `
  @keyframes cardFlipIn {
    0% { transform: rotateY(180deg); }
    100% { transform: rotateY(0deg); }
  }
`;

function parseBinderUrl(path: string) {
  const cleanPath = path.replace(/^\/binder\/?/, "");
  const parts = cleanPath.split("/").filter(Boolean);
  const root = parts[0]?.toLowerCase();
  const sub = parts[1];

  if (root === "custom") {
    return {
      tab: "custom" as const,
      openSetId: null,
      openBinderId: sub ? decodeURIComponent(sub) : null,
    };
  }
  if (root === "wishlist") {
    return {
      tab: "wishlist" as const,
      openSetId: null,
      openBinderId: null,
    };
  }
  if (root === "sets" && sub) {
    const decoded = decodeURIComponent(sub);
    const lower = decoded.toLowerCase();
    const clean = lower.replace(/[^a-z0-9]/g, "");
    const match = SET_ORDER.find(
      (s) => s.toLowerCase() === lower || s.toLowerCase().replace(/[^a-z0-9]/g, "") === clean
    );
    return {
      tab: "sets" as const,
      openSetId: match || decoded.toUpperCase(),
      openBinderId: null,
    };
  }
  if (root && (root.startsWith("op-") || root.startsWith("op") || root.startsWith("eb-") || root.startsWith("eb") || root.startsWith("st-") || root.startsWith("st") || root.startsWith("prb-") || root.startsWith("prb"))) {
    const decoded = decodeURIComponent(root);
    const lower = decoded.toLowerCase();
    const clean = lower.replace(/[^a-z0-9]/g, "");
    const match = SET_ORDER.find(
      (s) => s.toLowerCase() === lower || s.toLowerCase().replace(/[^a-z0-9]/g, "") === clean
    );
    return {
      tab: "sets" as const,
      openSetId: match || decoded.toUpperCase(),
      openBinderId: null,
    };
  }
  return {
    tab: "sets" as const,
    openSetId: null,
    openBinderId: null,
  };
}

function AuthGate({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  return (
    <div
      suppressHydrationWarning
      className="dashboard-page dashboard-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5 transition-colors duration-300"
    >
      <Sidebar />
      <main className="dashboard-main flex items-center justify-center min-h-screen p-6">
        <section className="dashboard-arrival dashboard-auth-gate bg-bg-secondary border border-border-theme rounded-2xl p-8 max-w-160 flex items-center justify-between gap-8 shadow-xl">
          <div className="dashboard-arrival-copy flex-1">
            <span className="dashboard-eyebrow text-xs font-bold uppercase tracking-wider text-accent-theme block mb-2">
              Collection Binder
            </span>
            <h1 className="text-2xl font-black tracking-tight text-text-primary mb-3">
              Track your collection, mark cards as owned, and build custom binders.
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Sign in to track your collection progress in real-time, mark cards as owned, build custom binders, and manage your chase wishlist.
            </p>
            <div className="dashboard-arrival-actions flex items-center gap-3">
              <button
                type="button"
                className="dashboard-button dashboard-button-primary bg-text-primary text-bg-primary font-bold text-sm py-2.5 px-5 rounded-lg border-0 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={onSignIn}
              >
                Sign in
              </button>
              <button
                type="button"
                className="dashboard-button dashboard-button-secondary bg-transparent border border-border-theme text-text-primary font-bold text-sm py-2.5 px-5 rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors"
                onClick={onSignUp}
              >
                Create free account
              </button>
            </div>
          </div>
          <div className="dashboard-arrival-mark text-accent-theme shrink-0" aria-hidden="true">
            <BookOpen size={42} strokeWidth={1.75} />
          </div>
        </section>
      </main>
    </div>
  );
}

function ProgressBar({ value, total, color = "currentColor" }: { value: number; total: number; color?: string }) {
  const pct = total === 0 ? 0 : Math.floor((value / total) * 100);
  return (
    <div className="h-1.25 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2.5">
      <div
        className="h-full rounded-full transition-all duration-400 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function CardModal({ modalCard, modalIndex, modalCards, setModalCard, setModalIndex, c, tc, isDark, ownedSet, wishlistSet, onToggleOwned, onToggleWishlist }: {
  modalCard: Card; modalIndex: number; modalCards: Card[];
  setModalCard: (c: Card | null) => void; setModalIndex: (i: number) => void;
  c: any; tc: any; isDark: boolean;
  ownedSet: Set<string>; wishlistSet: Set<string>;
  onToggleOwned: (cardId: string) => void; onToggleWishlist: (cardId: string) => void;
}) {
  const [showOwnershipPicker, setShowOwnershipPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const isDon = modalCard.set?.name === "DON!!" || !(modalCard.id?.includes("-"));
  const cardKey = isDon ? getDonCardKey({ card_name: (modalCard as any).card_name || modalCard.name }) : getCardKey(modalCard);
  const owned = ownedSet.has(cardKey);
  const wished = wishlistSet.has(cardKey);

  useEffect(() => {
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showOwnershipPicker) {
        if (e.key === "Escape") setShowOwnershipPicker(false);
        return;
      }
      if (e.key === "Escape") { setModalCard(null); return; }
      if (e.key === "ArrowRight" && modalIndex < modalCards.length - 1) {
        e.preventDefault();
        const i = modalIndex + 1;
        setModalIndex(i);
        setModalCard(modalCards[i]);
      }
      if (e.key === "ArrowLeft" && modalIndex > 0) {
        e.preventDefault();
        const i = modalIndex - 1;
        setModalIndex(i);
        setModalCard(modalCards[i]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalIndex, modalCards, showOwnershipPicker]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || showOwnershipPicker) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && modalIndex < modalCards.length - 1) {
      const i = modalIndex + 1;
      setModalIndex(i);
      setModalCard(modalCards[i]);
      setShowOwnershipPicker(false);
    } else if (dx > 0 && modalIndex > 0) {
      const i = modalIndex - 1;
      setModalIndex(i);
      setModalCard(modalCards[i]);
      setShowOwnershipPicker(false);
    }
  };

  return (
    <div
      className="card-modal-outer fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      onClick={() => { setModalCard(null); setShowOwnershipPicker(false); }}
    >
      <div
        className="card-modal-nav-row flex items-center justify-center gap-4 w-full max-w-240"
        onClick={(e) => e.stopPropagation()}
      >
        {(!isMobile || isLandscape) && (
          <button
            className="card-modal-prev shrink-0 w-11 h-11 rounded-full bg-bg-primary shadow-xl border border-border-theme flex items-center justify-center text-text-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => { const i = Math.max(modalIndex - 1, 0); setModalIndex(i); setModalCard(modalCards[i]); setShowOwnershipPicker(false); }}
            disabled={modalIndex <= 0}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div
          className="card-modal-container flex-1 bg-bg-primary rounded-[20px] shadow-2xl border border-border-theme overflow-hidden max-h-[90vh] flex flex-col"
          onTouchStart={handleModalTouchStart}
          onTouchEnd={handleModalTouchEnd}
        >
          <div className="card-modal-header flex justify-between items-center py-4.5 px-6 border-b border-border-theme shrink-0 gap-4">
            <div>
              <div className="font-black text-[22px] text-text-primary tracking-tight">{modalCard.name}</div>
              <div className="text-xs text-text-tertiary font-mono mt-0.5">{isDon ? "DON!!" : modalCard.id}</div>
            </div>
            <div className="flex items-center gap-2">
              {isDon ? (
                <button
                  className="card-modal-btn flex items-center justify-center gap-1.5 py-1.75 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:opacity-90"
                  onClick={() => onToggleWishlist(cardKey)}
                  title={wished ? "Wishlist" : "Add to wishlist"}
                  aria-label={wished ? "Wishlist" : "Add to wishlist"}
                >
                  <Star size={13} fill={wished ? "currentColor" : "none"} />
                  {!isMobile && (
                    <span className="card-modal-btn-label">
                      {wished ? "Wishlist" : "Add to wishlist"}
                    </span>
                  )}
                </button>
              ) : (
                <div className="relative">
                  <button
                    className={`card-modal-btn flex items-center justify-center gap-1.5 py-1.75 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                      owned
                        ? "border-green-600 bg-green-600/15 text-green-600 dark:text-green-400"
                        : wished
                        ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
                    }`}
                    onClick={() => setShowOwnershipPicker(p => !p)}
                    title={owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
                    aria-label={owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
                  >
                    {owned ? <Check size={13} /> : wished ? <Star size={13} fill="currentColor" /> : null}
                    {!isMobile && (
                      <span className="card-modal-btn-label">
                        {owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
                      </span>
                    )}
                  </button>
                  {showOwnershipPicker && (
                    <div
                      className="absolute top-[calc(100%+8px)] right-0 w-48 bg-bg-primary border border-border-theme rounded-xl overflow-hidden shadow-2xl z-10 p-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { onToggleOwned(cardKey); setShowOwnershipPicker(false); }}
                        className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                          owned ? "bg-green-600/15 text-green-600 dark:text-green-400" : "bg-transparent text-text-primary hover:bg-bg-secondary"
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                          owned ? "border-green-600 bg-green-600 text-white" : "border-border-theme bg-transparent"
                        }`}>
                          {owned && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <span>I own this card</span>
                      </button>
                      <button
                        onClick={() => { onToggleWishlist(cardKey); setShowOwnershipPicker(false); }}
                        className={`w-full flex items-center gap-2.5 py-2.25 px-2.5 rounded-lg border-0 cursor-pointer text-[13px] text-left transition-colors ${
                          wished ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-transparent text-text-primary hover:bg-bg-secondary"
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                          wished ? "border-amber-500 bg-amber-500 text-white" : "border-border-theme bg-transparent"
                        }`}>
                          {wished && <Star size={10} fill="#fff" color="#fff" />}
                        </div>
                        <span>Add to wishlist</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => { setModalCard(null); setShowOwnershipPicker(false); }}
                className="bg-transparent border-0 cursor-pointer p-1 text-text-tertiary hover:text-text-primary flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="card-modal-body flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
            <div className="card-modal-image-pane w-full md:w-[48%] shrink-0 bg-bg-primary flex items-center justify-center p-6 md:pl-7 md:pr-5">
              <div className="w-full max-w-90 mx-auto">
                <ModalCardImage
                  key={modalCard.images?.large ?? modalCard.images?.small ?? modalCard.id}
                  src={modalCard.images?.large || modalCard.images?.small || "/card-placeholder.png"}
                  alt={modalCard.name}
                  isLeader={modalCard.type?.toUpperCase() === "LEADER"}
                  isDark={isDark}
                  backSrc={isDon ? "/don-back.png" : undefined}
                />
              </div>
            </div>
            <div className="card-modal-details-pane flex-1 min-w-0 overflow-y-auto p-6 md:pl-4 md:pr-7 flex flex-col gap-3.5">
              <div className="card-modal-detail-grid grid grid-cols-2 gap-2.5">
                {([["Type", modalCard.type], ["Rarity", modalCard.rarity?.replace(/^PR$/i, "P")], ["Color", modalCard.color], ["Cost", modalCard.cost], ["Power", modalCard.power], ["Counter", modalCard.counter], ["Attribute", modalCard.attribute?.name], ["Family", modalCard.family], ["Set", modalCard.set?.name]] as [string, unknown][]).filter(([, v]) => v != null && v !== "" && v !== "-").map(([label, value]) => (
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
                            <div key={idx} className="leading-tight">{part.trim()}</div>
                          ))}
                        </div>
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {modalCard.ability && (
                <div className="bg-bg-secondary rounded-[10px] p-3 md:px-3.5 border border-border-theme">
                  <div className="text-[11px] text-text-tertiary mb-1.5 uppercase tracking-wider font-bold">
                    Effect
                  </div>
                  <div className="text-sm text-text-primary leading-relaxed">
                    {modalCard.ability}
                  </div>
                </div>
              )}
              {modalCard.trigger && modalCard.trigger !== "" && (
                <div className="bg-amber-500/10 rounded-[10px] p-3 md:px-3.5 border border-amber-500/25">
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mb-1.5 uppercase tracking-wider font-bold">
                    Trigger
                  </div>
                  <div className="text-sm text-text-primary leading-relaxed">
                    {modalCard.trigger}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="card-modal-footer border-t border-border-theme py-2.5 px-6 text-center text-xs text-text-tertiary shrink-0">
            {modalIndex + 1} / {modalCards.length}
          </div>
        </div>
        {(!isMobile || isLandscape) && (
          <button
            className="card-modal-next shrink-0 w-11 h-11 rounded-full bg-bg-primary shadow-xl border border-border-theme flex items-center justify-center text-text-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => { const i = Math.min(modalIndex + 1, modalCards.length - 1); setModalIndex(i); setModalCard(modalCards[i]); setShowOwnershipPicker(false); }}
            disabled={modalIndex >= modalCards.length - 1}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

function DonCardModal({
  card,
  index,
  cards,
  onClose,
  onNav,
  isDark,
}: {
  card: any;
  index: number;
  cards: any[];
  onClose: () => void;
  onNav: (i: number) => void;
  isDark: boolean;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" && index < cards.length - 1) { e.preventDefault(); onNav(index + 1); }
      if (e.key === "ArrowLeft" && index > 0) { e.preventDefault(); onNav(index - 1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, cards]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-center gap-4 w-full max-w-215"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onNav(index - 1)}
          disabled={index <= 0}
          className="shrink-0 w-11 h-11 rounded-full bg-bg-primary shadow-xl border border-border-theme flex items-center justify-center text-text-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 bg-bg-primary rounded-[20px] shadow-2xl border border-border-theme overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center py-4.5 px-6 border-b border-border-theme shrink-0">
            <div>
              <div className="font-black text-xl text-text-primary tracking-tight">{card.card_name}</div>
              <div className="text-xs text-text-tertiary mt-0.5">DON!! Card</div>
            </div>
            <button onClick={onClose} className="bg-transparent border-0 cursor-pointer p-1 text-text-tertiary hover:text-text-primary">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-80">
              <ModalCardImage
                key={card.card_image || card.card_name || index}
                src={card.card_image || "/card-placeholder.png"}
                alt={card.card_name}
                isDark={isDark}
                backSrc="/don-back.png"
              />
            </div>
          </div>
          <div className="border-t border-border-theme py-2.5 px-6 text-center text-xs text-text-tertiary shrink-0">
            {index + 1} / {cards.length}
          </div>
        </div>
        <button
          onClick={() => onNav(index + 1)}
          disabled={index >= cards.length - 1}
          className="shrink-0 w-11 h-11 rounded-full bg-bg-primary shadow-xl border border-border-theme flex items-center justify-center text-text-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function BinderPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const savedScrollY = useRef(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [allCards, setAllCards] = useState<Card[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [binderCounts, setBinderCounts] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  // ── SHALLOW URL STATE & INSTANT REACT STATE ────────────
  const [tab, setTab] = useState<"sets" | "custom" | "wishlist">("sets");
  const [openSetId, setOpenSetId] = useState<string | null>(null);
  const [openBinderId, setOpenBinderId] = useState<string | null>(null);

  // Sync state on initial mount & on browser Back/Forward (popstate)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parsed = parseBinderUrl(window.location.pathname);
      setTab(parsed.tab);
      setOpenSetId(parsed.openSetId);
      setOpenBinderId(parsed.openBinderId);
    }

    const handlePopState = () => {
      const parsed = parseBinderUrl(window.location.pathname);
      setTab(parsed.tab);
      setOpenSetId(parsed.openSetId);
      setOpenBinderId(parsed.openBinderId);
      if (!parsed.openSetId && !parsed.openBinderId) {
        setTimeout(() => window.scrollTo(0, savedScrollY.current), 10);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [openBinderCards, setOpenBinderCards] = useState<string[]>([]);
  const [binderPreviewCards, setBinderPreviewCards] = useState<Record<string, Card[]>>({});

  const [creatingBinder, setCreatingBinder] = useState(false);
  const [creatingBinderLoading, setCreatingBinderLoading] = useState(false);
  const [newBinderName, setNewBinderName] = useState("");
  const [binderPlaceholder, setBinderPlaceholder] = useState("My legendary collection...");

  const openCreateBinder = () => {
    const random = BINDER_PLACEHOLDERS[Math.floor(Math.random() * BINDER_PLACEHOLDERS.length)];
    setBinderPlaceholder(random);
    setCreatingBinder(true);
  };
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingLoading, setRenamingLoading] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCardKeys, setSelectedCardKeys] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [modalIndex, setModalIndex] = useState(-1);
  const [modalCards, setModalCards] = useState<Card[]>([]);

  const [flipKey, setFlipKey] = useState(0);
  const [animatedFlipKey, setAnimatedFlipKey] = useState(-1);

  const [loadingBinderCards, setLoadingBinderCards] = useState(false);
  const [allDonCards, setAllDonCards] = useState<any[]>([]);
  const [donModalIndex, setDonModalIndex] = useState(-1);
  const [donModalCards, setDonModalCards] = useState<any[]>([]);

  const [setViewFilters, setSetViewFilters] = useState<{
    colors?: string[]; type?: string; rarity?: string; spOnly?: boolean; owned?: "owned" | "not_owned";
  }>({});
  const [binderFiltersOpen, setBinderFiltersOpen] = useState(false);
  const [wishlistSearch, setWishlistSearch] = useState("");
  const [wishlistColors, setWishlistColors] = useState<string[]>([]);
  const [wishlistSetId, setWishlistSetId] = useState<string | null>(null);
  const [wishlistSetDropdownOpen, setWishlistSetDropdownOpen] = useState(false);
  const wishlistSearchInputRef = useRef<HTMLInputElement>(null);
  const [activeMenuBinderId, setActiveMenuBinderId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
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

  //scroll lock
  useBodyScrollLock(!!modalCard || donModalIndex >= 0 || binderFiltersOpen);

  useEffect(() => { setMounted(true); }, []);

  // Global search shortcut (/) when on wishlist tab
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        tab === "wishlist" &&
        !openSetId &&
        !openBinderId &&
        !modalCard &&
        !creatingBinder &&
        !renamingId &&
        !deleteConfirmId &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        wishlistSearchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [tab, openSetId, openBinderId, modalCard, creatingBinder, renamingId, deleteConfirmId]);

  useEffect(() => {
    if (!activeMenuBinderId && !wishlistSetDropdownOpen) return;
    const handleOutsideClick = () => {
      setActiveMenuBinderId(null);
      setWishlistSetDropdownOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenuBinderId(null);
        setWishlistSetDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeMenuBinderId, wishlistSetDropdownOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoadingUser(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleSynced = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const [uc, b, bc] = await Promise.all([
          getUserCards(data.user.id),
          getBinders(data.user.id),
          getBinderCardCounts(data.user.id),
        ]);
        setUserCards(uc);
        setBinders(b);
        setBinderCounts(bc);
      }
    };
    window.addEventListener("enies_guest_synced", handleSynced);
    return () => window.removeEventListener("enies_guest_synced", handleSynced);
  }, []);

  useEffect(() => {
    if (loadingUser) return;
    setLoadingData(true);
    if (user) {
      Promise.all([
        getAllCards(),
        getUserCards(user.id),
        getBinders(user.id),
        getBinderCardCounts(user.id),
        getAllDonCards().catch(() => [])
      ]).then(([cards, uc, b, bc, don]) => {
        setAllCards(cards);
        setAllDonCards(don);
        setUserCards(uc);
        setBinders(b);
        setBinderCounts(bc);
        setLoadingData(false);
      });
    } else {
      Promise.all([
        getAllCards(),
        getAllDonCards().catch(() => [])
      ]).then(([cards, don]) => {
        setAllCards(cards);
        setAllDonCards(don);
        setUserCards(getGuestUserCards());
        setBinders(getGuestBinders());
        setBinderCounts(getGuestBinderCardCounts());
        setLoadingData(false);
      });
    }
  }, [user, loadingUser]);

  useEffect(() => {
    if (!openBinderId) return;
    if (user && openBinderId.startsWith("guest_binder_")) {
      setOpenBinderId(null);
      if (typeof window !== "undefined") {
        window.history.replaceState({ tab: "custom" }, "", "/binder/custom");
      }
      return;
    }
    setOpenBinderCards([]);
    setLoadingBinderCards(true);
    if (user) {
      getBinderCards(openBinderId).then(cards => {
        setOpenBinderCards(cards);
        setLoadingBinderCards(false);
      });
    } else {
      const cards = getGuestBinderCards(openBinderId);
      setOpenBinderCards(cards);
      setLoadingBinderCards(false);
    }
  }, [openBinderId, user]);

  useEffect(() => {
    if (!binders.length || !allCards.length) {
      setBinderPreviewCards({});
      return;
    }
    const fetchKeys = user
      ? binders.map(b => getBinderCards(b.id).then(keys => ({ id: b.id, keys })))
      : binders.map(b => Promise.resolve({ id: b.id, keys: getGuestBinderCards(b.id) }));

    Promise.all(fetchKeys).then(results => {
      const previewMap: Record<string, Card[]> = {};
      const countMap: Record<string, number> = {};
      for (const { id, keys } of results) {
        const regularMatches = allCards.filter(card => keys.includes(getCardKey(card)));
        const donMatches = allDonCards
          .filter(card => keys.includes(getDonCardKey(card)))
          .map(card => ({ ...card, images: { small: card.card_image || "/card-placeholder.png", large: card.card_image || "/card-placeholder.png" } }));
        previewMap[id] = [...regularMatches, ...donMatches].slice(0, 4) as Card[];
        countMap[id] = keys.length;
      }
      setBinderPreviewCards(previewMap);
      setBinderCounts(prev => ({ ...prev, ...countMap }));
    });
  }, [binders, allCards, allDonCards, user]);

  useEffect(() => { if (openSetId) setFlipKey(k => k + 1); }, [openSetId]);
  useEffect(() => { if (openBinderId) setFlipKey(k => k + 1); }, [openBinderId]);
  useEffect(() => { setFlipKey(k => k + 1); }, [setViewFilters]);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const c = {
    bg: tc.bg.primary, bgSec: tc.bg.secondary, bgTer: tc.bg.tertiary,
    text: tc.text.primary, textSec: tc.text.secondary, textTer: tc.text.tertiary,
    border: tc.border,
  };

  const ownedSet = useMemo(() => new Set(userCards.filter(u => !u.in_wishlist).map(u => u.card_id)), [userCards]);
  const wishlistSet = useMemo(() => new Set(userCards.filter(u => u.in_wishlist).map(u => u.card_id)), [userCards]);

  const cardsBySet = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const setId of SET_ORDER) {
      const normalizedFilter = setId.replace(/-/g, "").toUpperCase();
      map[setId] = allCards.filter(card => {
        if (card.setType === "limited_product") return false;
        const setName = card.set?.name ?? "";
        const bracketMatch = setName.match(/\[([^\]]+)\]/);
        const normalizedSet = bracketMatch ? bracketMatch[1].replace(/-/g, "").toUpperCase() : setName.replace(/-/g, "").toUpperCase();
        const cardIdNorm = (card.id ?? "").replace(/-/g, "").toUpperCase();
        return normalizedSet.includes(normalizedFilter) || cardIdNorm.startsWith(normalizedFilter);
      });
    }
    return map;
  }, [allCards]);

  const availableSets = useMemo(() => SET_ORDER.filter(s => (cardsBySet[s]?.length ?? 0) > 0), [cardsBySet]);

  const handleTabChange = (t: "sets" | "custom" | "wishlist") => {
    setTab(t);
    setOpenSetId(null);
    setOpenBinderId(null);
    const targetUrl = t === "sets" ? "/binder" : `/binder/${t}`;
    if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
      window.history.pushState({ tab: t }, "", targetUrl);
    }
  };

  const handleOpenSet = (setId: string) => {
    savedScrollY.current = window.scrollY;
    setOpenSetId(setId);
    setOpenBinderId(null);
    setSetViewFilters({});
    window.scrollTo(0, 0);
    const targetUrl = `/binder/sets/${encodeURIComponent(setId)}`;
    if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
      window.history.pushState({ tab: "sets", setId }, "", targetUrl);
    }
  };

  const handleCloseSet = () => {
    setBinderFiltersOpen(false);
    if (typeof window !== "undefined") {
      if (window.history.state?.setId || window.history.state?.tab === "sets") {
        window.history.back();
      } else {
        setOpenSetId(null);
        window.history.replaceState({ tab: "sets" }, "", "/binder");
        window.scrollTo(0, savedScrollY.current);
      }
    } else {
      setOpenSetId(null);
    }
  };

  const handleOpenBinder = (binderId: string) => {
    savedScrollY.current = window.scrollY;
    setOpenBinderId(binderId);
    setOpenSetId(null);
    window.scrollTo(0, 0);
    const targetUrl = `/binder/custom/${encodeURIComponent(binderId)}`;
    if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
      window.history.pushState({ tab: "custom", binderId }, "", targetUrl);
    }
  };

  const handleCloseBinder = () => {
    if (typeof window !== "undefined") {
      if (window.history.state?.binderId || window.history.state?.tab === "custom") {
        window.history.back();
      } else {
        setOpenBinderId(null);
        window.history.replaceState({ tab: "custom" }, "", "/binder/custom");
        window.scrollTo(0, savedScrollY.current);
      }
    } else {
      setOpenBinderId(null);
    }
  };

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

  const handleToggleBinderCard = async (cardId: string) => {
    if (!openBinderId) return;
    if (openBinderCards.includes(cardId)) {
      setOpenBinderCards(prev => prev.filter(id => id !== cardId));
      setBinderCounts(prev => ({ ...prev, [openBinderId]: Math.max((prev[openBinderId] ?? 1) - 1, 0) }));
      setBinderPreviewCards(prev => ({ ...prev, [openBinderId]: (prev[openBinderId] ?? []).filter(c => getCardKey(c) !== cardId) }));
      showToast("Card removed from binder", "info");
      if (user) {
        await removeCardFromBinder(openBinderId, cardId);
      } else {
        removeGuestBinderCard(openBinderId, cardId);
      }
    } else {
      setOpenBinderCards(prev => [...prev, cardId]);
      setBinderCounts(prev => ({ ...prev, [openBinderId]: (prev[openBinderId] ?? 0) + 1 }));
      const card = allCards.find(c => getCardKey(c) === cardId);
      if (card) setBinderPreviewCards(prev => ({ ...prev, [openBinderId]: [...(prev[openBinderId] ?? []), card].slice(0, 4) }));
      showToast("Card added to binder", "success");
      if (user) {
        await addCardToBinder(openBinderId, cardId);
        if (!ownedSet.has(cardId)) {
          setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
          await addUserCard(user.id, cardId, false);
        }
      } else {
        addGuestBinderCard(openBinderId, cardId);
        if (!ownedSet.has(cardId)) {
          setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
          saveGuestUserCard(cardId, false);
        }
      }
    }
  };

  const handleCreateBinder = async () => {
    if (!newBinderName.trim() || creatingBinderLoading) return;
    setCreatingBinderLoading(true);
    try {
      if (user) {
        const b = await createBinder(user.id, newBinderName.trim());
        if (b) {
          setBinders(prev => [...prev, b]);
          setBinderCounts(prev => ({ ...prev, [b.id]: 0 }));
          showToast(`Binder "${b.name}" created!`, "celebrate");
        }
      } else {
        const b = createGuestBinder(newBinderName.trim());
        setBinders(prev => [...prev, b]);
        setBinderCounts(prev => ({ ...prev, [b.id]: 0 }));
        showToast(`Guest binder "${b.name}" created!`, "celebrate");
      }
      setNewBinderName("");
      setCreatingBinder(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to create binder", "delete");
    } finally {
      setCreatingBinderLoading(false);
    }
  };

  const handleDeleteBinder = async (id: string) => {
    if (deletingLoading) return;
    setDeletingLoading(true);
    try {
      const bName = binders.find(b => b.id === id)?.name;
      if (user) {
        await deleteBinder(id, user.id);
      } else {
        deleteGuestBinder(id);
      }
      setBinders(prev => prev.filter(b => b.id !== id));
      if (openBinderId === id) {
        setOpenBinderId(null);
        if (typeof window !== "undefined") {
          window.history.replaceState({ tab: "custom" }, "", "/binder/custom");
        }
      }
      showToast(bName ? `Binder "${bName}" deleted` : "Binder deleted", "delete");
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete binder", "delete");
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleRenameBinder = async (id: string) => {
    if (!renameValue.trim() || renamingLoading) return;
    setRenamingLoading(true);
    try {
      if (user) {
        await renameBinder(id, renameValue.trim(), user.id);
      } else {
        renameGuestBinder(id, renameValue.trim());
      }
      setBinders(prev => prev.map(b => b.id === id ? { ...b, name: renameValue.trim() } : b));
      showToast(`Binder renamed to "${renameValue.trim()}"`, "success");
      setRenamingId(null);
      setRenameValue("");
    } catch (err) {
      console.error(err);
      showToast("Failed to rename binder", "delete");
    } finally {
      setRenamingLoading(false);
    }
  };

  if (loadingUser) return (
    <div className="binder-wrapper min-h-screen bg-bg-primary ml-17.5 flex items-center justify-center">
      <div className="text-[13px] text-text-tertiary">Loading...</div>
    </div>
  );

  // ── OPEN SET VIEW ───────────────────────────────────
  if (openSetId) {
    const allSetCards = sortByCardId(cardsBySet[openSetId] ?? [], openSetId);
    const totalSetOwned = allSetCards.filter(c => ownedSet.has(getCardKey(c))).length;
    const totalSetPct = allSetCards.length === 0 ? 0 : Math.floor((totalSetOwned / allSetCards.length) * 100);
    const selectedColors = setViewFilters.colors ?? [];
    const multicolorActive = selectedColors.includes("Multicolor");

    const setCards = allSetCards.filter(card => {
      if (selectedColors.length > 0) {
        if (multicolorActive) { if (!card.color?.includes(" ")) return false; }
        else { for (const col of selectedColors) { if (!card.color?.includes(col)) return false; } }
      }
      if (setViewFilters.type && card.type?.toUpperCase() !== setViewFilters.type.toUpperCase()) return false;
      if (setViewFilters.spOnly && !card.name?.includes("(SP)")) return false;
      if (setViewFilters.rarity) {
        const nr = card.rarity?.replace(/\s+CARD\s*$/i, "").trim() || card.rarity;
        if (nr !== setViewFilters.rarity) return false;
      }
      if (setViewFilters.owned === "owned" && !ownedSet.has(getCardKey(card))) return false;
      if (setViewFilters.owned === "not_owned" && ownedSet.has(getCardKey(card))) return false;
      return true;
    });

    const activeSetFilterCount = (selectedColors.length > 0 ? 1 : 0) +
      (setViewFilters.type ? 1 : 0) +
      (setViewFilters.rarity ? 1 : 0) +
      (setViewFilters.spOnly ? 1 : 0) +
      (setViewFilters.owned ? 1 : 0);

    const hasActiveFilters = activeSetFilterCount > 0;
    const allSetOwned = allSetCards.length > 0 && allSetCards.every(c => ownedSet.has(getCardKey(c)));

    const chipClass = (active: boolean) =>
      `px-3 py-1 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
        active
          ? "border-text-primary bg-text-primary text-bg-primary"
          : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
      }`;

    return (
      <div suppressHydrationWarning className="binder-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5">
        <style>{FLIP_STYLE}</style>
        <Sidebar />

        <div className="binder-set-header px-8 py-5 border-b border-border-theme flex items-center gap-4 sticky top-0 bg-bg-primary z-20">
          <button
            onClick={handleCloseSet}
            title="Back"
            className="bg-transparent border-0 cursor-pointer text-text-secondary hover:text-text-primary flex items-center justify-center w-11 h-11 shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="w-px h-4 bg-border-theme shrink-0" />
          <div className="min-w-0 overflow-hidden">
            <span className="text-[15px] font-semibold text-text-primary">{openSetId} · {SET_NAMES[openSetId] ?? openSetId}</span>
            <span className="text-[13px] text-text-tertiary ml-2.5">{totalSetOwned} / {allSetCards.length} · {totalSetPct}%</span>
          </div>
          <div className="binder-set-progress-wrap flex-1 max-w-50 ml-auto">
            <ProgressBar value={totalSetOwned} total={allSetCards.length} color="var(--text-primary)" />
          </div>
        </div>

        {/* Desktop FilterBar in Set view */}
        {!isMobile && (
          <div className="desktop-filterbar">
            <div className="bg-bg-primary border-b border-border-theme px-6 py-3 flex flex-wrap items-center gap-4">
              {/* Color */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Color</span>
                <div className="flex gap-1.5 items-center flex-wrap">
                  {[...FILTER_COLORS, "Multicolor"].map((color) => {
                    const isMulti = color === "Multicolor";
                    const active = isMulti ? multicolorActive : selectedColors.includes(color);
                    const dimmed = !active && selectedColors.length > 0;
                    return (
                      <button
                        key={color}
                        title={color}
                        onClick={() => {
                          if (isMulti) { setSetViewFilters(f => ({ ...f, colors: multicolorActive ? [] : ["Multicolor"] })); return; }
                          if (multicolorActive) { setSetViewFilters(f => ({ ...f, colors: [color] })); return; }
                          const cur = selectedColors;
                          if (cur.includes(color)) setSetViewFilters(f => ({ ...f, colors: cur.filter(c => c !== color) }));
                          else { const next = cur.length >= 2 ? [cur[1], color] : [...cur, color]; setSetViewFilters(f => ({ ...f, colors: next })); }
                        }}
                        className={`w-6 h-6 rounded-full shrink-0 border-0 cursor-pointer transition-all ${
                          dimmed ? "opacity-35" : "opacity-100"
                        } ${active ? "scale-115 ring-2 ring-offset-2 ring-neutral-400" : ""}`}
                        style={{
                          background: isMulti
                            ? "conic-gradient(from 180deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #000000, #ef4444)"
                            : COLOR_DOT[color],
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              {/* Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Type</span>
                <div className="flex gap-1.5">
                  {FILTER_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setSetViewFilters(f => ({ ...f, type: f.type === t ? undefined : t }))}
                      className={chipClass(setViewFilters.type === t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Rarity */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Rarity</span>
                <div className="flex gap-1.5 items-center">
                  {FILTER_RARITIES.map(r => (
                    <button
                      key={r}
                      onClick={() => setSetViewFilters(f => ({ ...f, rarity: f.rarity === r ? undefined : r }))}
                      className={chipClass(setViewFilters.rarity === r)}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    onClick={() => setSetViewFilters(f => ({ ...f, spOnly: !f.spOnly }))}
                    className={chipClass(!!setViewFilters.spOnly)}
                  >
                    SP
                  </button>
                </div>
              </div>
              {/* Show */}
              {!allSetOwned && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Show</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "owned" ? undefined : "owned" }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                        setViewFilters.owned === "owned"
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      Owned
                    </button>
                    <button
                      onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "not_owned" ? undefined : "not_owned" }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                        setViewFilters.owned === "not_owned"
                          ? "border-text-primary bg-text-primary text-bg-primary"
                          : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      Not owned
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Floating Slide-Down Filter Drawer in Set view */}
        {isMobile && binderFiltersOpen && (
          <>
            <div
              className="filter-drawer-backdrop fixed top-28 inset-x-0 bottom-0 bg-black/45 backdrop-blur-[2px] z-35"
              onClick={() => setBinderFiltersOpen(false)}
            />
            <div className="filter-drawer-panel fixed top-28 inset-x-0 max-h-[calc(100vh-120px)] overflow-y-auto bg-bg-primary border-b border-border-theme shadow-2xl z-36 p-5 md:p-7 flex flex-col gap-5">
              {/* Color Filter */}
              <div>
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2.5">
                  Color
                </div>
                <div className="flex gap-2.5 items-center flex-wrap">
                  {[...FILTER_COLORS, "Multicolor"].map((color) => {
                    const isMulti = color === "Multicolor";
                    const active = isMulti ? multicolorActive : selectedColors.includes(color);
                    const dimmed = !active && selectedColors.length > 0;
                    return (
                      <button
                        key={color}
                        title={color}
                        onClick={() => {
                          if (isMulti) { setSetViewFilters(f => ({ ...f, colors: multicolorActive ? [] : ["Multicolor"] })); return; }
                          if (multicolorActive) { setSetViewFilters(f => ({ ...f, colors: [color] })); return; }
                          const cur = selectedColors;
                          if (cur.includes(color)) setSetViewFilters(f => ({ ...f, colors: cur.filter(c => c !== color) }));
                          else { const next = cur.length >= 2 ? [cur[1], color] : [...cur, color]; setSetViewFilters(f => ({ ...f, colors: next })); }
                        }}
                        className={`w-8 h-8 rounded-full shrink-0 border-0 cursor-pointer transition-all ${
                          dimmed ? "opacity-35" : "opacity-100"
                        } ${active ? "scale-115 ring-2 ring-offset-2 ring-neutral-400" : ""}`}
                        style={{
                          background: isMulti
                            ? "conic-gradient(from 180deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #000000, #ef4444)"
                            : COLOR_DOT[color],
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2.5">
                  Card Type
                </div>
                <div className="flex gap-2 flex-wrap">
                  {FILTER_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setSetViewFilters(f => ({ ...f, type: f.type === t ? undefined : t }))}
                      className={chipClass(setViewFilters.type === t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity Filter */}
              <div>
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2.5">
                  Rarity
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {FILTER_RARITIES.map(r => (
                    <button
                      key={r}
                      onClick={() => setSetViewFilters(f => ({ ...f, rarity: f.rarity === r ? undefined : r }))}
                      className={chipClass(setViewFilters.rarity === r)}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    onClick={() => setSetViewFilters(f => ({ ...f, spOnly: !f.spOnly }))}
                    className={chipClass(!!setViewFilters.spOnly)}
                  >
                    SP
                  </button>
                </div>
              </div>

              {/* Ownership Filter */}
              {!allSetOwned && (
                <div>
                  <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2.5">
                    Ownership Status
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "owned" ? undefined : "owned" }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                        setViewFilters.owned === "owned"
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      Owned
                    </button>
                    <button
                      onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "not_owned" ? undefined : "not_owned" }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                        setViewFilters.owned === "not_owned"
                          ? "border-text-primary bg-text-primary text-bg-primary"
                          : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      Not owned
                    </button>
                  </div>
                </div>
              )}

              {/* Reset All Filters Button */}
              {hasActiveFilters && (
                <div className="pt-2 border-t border-border-theme">
                  <button
                    onClick={() => setSetViewFilters({})}
                    className="w-full py-3 rounded-lg border border-border-theme bg-bg-secondary text-text-primary text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-bg-tertiary"
                  >
                    <X size={14} />
                    <span>Clear all filters ({activeSetFilterCount})</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="binder-card-grid p-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5.5">
          {setCards.map((card, i) => {
            const cardKey = getCardKey(card);
            const owned = ownedSet.has(cardKey);
            const wished = wishlistSet.has(cardKey);
            const shouldFlip = animatedFlipKey < flipKey && i < 18;
            const isLastFlip = i === Math.min(17, setCards.length - 1);
            return (
              <div
                key={`${flipKey}-${cardKey}||${i}`}
                className="relative"
                style={{ perspective: shouldFlip ? "1000px" : "none" }}
              >
                <div
                  className="relative"
                  style={{
                    transformStyle: shouldFlip ? "preserve-3d" : "flat",
                    animationName: shouldFlip ? "cardFlipIn" : "none",
                    animationDuration: "0.5s",
                    animationTimingFunction: "ease",
                    animationFillMode: "forwards",
                    animationDelay: shouldFlip ? `${i * 0.03}s` : "0s",
                    willChange: shouldFlip ? "transform" : "auto",
                  }}
                  onAnimationEnd={isLastFlip ? () => setAnimatedFlipKey(flipKey) : undefined}
                >
                  {shouldFlip && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(180deg)]">
                      <img src={card.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png"} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    style={{
                      backfaceVisibility: shouldFlip ? "hidden" : "visible",
                      WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible",
                    }}
                  >
                    <div
                      onClick={() => { setModalCards(setCards); setModalIndex(i); setModalCard(setCards[i]); }}
                      className={`rounded-[14px] overflow-hidden bg-bg-secondary transition-all duration-250 cursor-pointer ${
                        owned
                          ? "border border-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.15)] opacity-100"
                          : "border border-border-theme shadow-[0_10px_25px_rgba(0,0,0,0.25)] opacity-55"
                      }`}
                    >
                      <div className="aspect-5/7 overflow-hidden relative">
                        <Image
                          src={card.images?.small || "/card-placeholder.png"}
                          alt={card.name}
                          fill
                          sizes="(max-width: 540px) 45vw, (max-width: 1024px) 22vw, 175px"
                          className="object-cover"
                          onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
                        />
                      </div>
                    </div>
                    {wished && (i >= 18 || animatedFlipKey >= flipKey) && (
                      <div className="absolute top-2 left-2 w-5.5 h-5.5 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-md pointer-events-none z-5">
                        <Star size={12} fill="#fff" color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {setCards.length === 0 && (
            <div className="col-span-full text-center py-16 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-bg-secondary border border-border-theme flex items-center justify-center mb-3.5 text-text-tertiary">
                <Search size={26} strokeWidth={1.75} />
              </div>
              <div className="text-[15px] font-semibold text-text-primary mb-1">No cards match these filters</div>
              <div className="text-[13px] text-text-tertiary">Try adjusting or resetting your filter criteria.</div>
              <button onClick={() => setSetViewFilters({})} className="mt-3.5 text-[13px] text-accent-theme bg-transparent border-0 cursor-pointer font-semibold py-1 px-2 hover:opacity-75">Clear filters</button>
            </div>
          )}
        </div>

        {modalCard && <CardModal modalCard={modalCard} modalIndex={modalIndex} modalCards={modalCards} setModalCard={setModalCard} setModalIndex={setModalIndex} c={c} tc={tc} isDark={isDark} ownedSet={ownedSet} wishlistSet={wishlistSet} onToggleOwned={handleToggleOwned} onToggleWishlist={handleToggleWishlist} />}
        {showScrollTop && !modalCard && (
          <button
            className="binder-scroll-top fixed bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-bg-tertiary text-text-primary border border-border-theme cursor-pointer shadow-xl z-40 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        )}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <Toast toast={toast} isDark={isDark} />
      </div>
    );
  }

  // ── OPEN CUSTOM BINDER VIEW ─────────────────────────
  if (openBinderId) {
    const binder = binders.find(b => b.id === openBinderId);
    const binderCardSet = new Set(openBinderCards);
    const regularBinderCards = allCards.filter(card => binderCardSet.has(getCardKey(card)));
    const donBinderCards = allDonCards
      .filter(card => binderCardSet.has(getDonCardKey(card)))
      .map(card => ({ ...card, images: { small: card.card_image || "/card-placeholder.png", large: card.card_image || "/card-placeholder.png" }, id: card.card_name, name: card.card_name, set: { name: "DON!!" } }));
    const binderCardList = [...sortByCardId(regularBinderCards), ...donBinderCards] as Card[];

    return (
      <div suppressHydrationWarning className="binder-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5">
        <style>{FLIP_STYLE}</style>
        <Sidebar />

        <div className="binder-custom-header py-4 px-7 border-b border-border-theme flex items-center gap-3 sticky top-0 bg-bg-primary z-20">
          <button
            onClick={handleCloseBinder}
            title="Back"
            className="bg-transparent border-0 cursor-pointer text-text-secondary hover:text-text-primary flex items-center justify-center w-11 h-11 shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="w-px h-4 bg-border-theme shrink-0" />
          <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-initial">
            <span className="text-base md:text-xl font-bold tracking-tight text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{binder?.name}</span>
            <span className="text-[13px] text-text-tertiary whitespace-nowrap shrink-0">· {openBinderCards.length} {openBinderCards.length === 1 ? "card" : "cards"}</span>
          </div>
          <div className="flex gap-2 items-center shrink-0 ml-auto">
            {selectionMode && selectedCardKeys.size > 0 && (
              <button
                title={`Remove ${selectedCardKeys.size} cards`}
                onClick={() => setBulkDeleteConfirm(true)}
                className="w-8.5 h-8.5 rounded-lg border-0 cursor-pointer bg-red-500 text-white flex items-center justify-center hover:opacity-85 transition-opacity"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              title={selectionMode ? "Cancel selection" : "Select cards"}
              onClick={() => { setSelectionMode(p => !p); setSelectedCardKeys(new Set()); }}
              className={`w-8.5 h-8.5 rounded-lg border cursor-pointer flex items-center justify-center transition-all ${
                selectionMode ? "border-accent-theme bg-accent-theme/15 text-accent-theme" : "border-border-theme bg-transparent text-text-tertiary hover:text-text-primary"
              }`}
            >
              <CheckSquare size={15} />
            </button>
            <button
              title="Browse cards"
              onClick={() => router.push("/browse")}
              className="py-1.75 md:py-2 px-3 md:px-4 rounded-lg border-0 cursor-pointer bg-accent-theme text-white text-[13px] font-semibold flex items-center gap-1.5 whitespace-nowrap hover:opacity-85 transition-opacity"
            >
              <span>{isMobile ? "Browse" : "Browse cards"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {loadingBinderCards ? (
          <div className="p-8" />
        ) : (
          <div className="binder-card-grid p-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5.5">
            {binderCardList.map((card, i) => {
              const isDonCard = card.set?.name === "DON!!";
              const cardKey = isDonCard ? getDonCardKey(card as any) : getCardKey(card);
              const isSelected = selectedCardKeys.has(cardKey);
              const shouldFlip = animatedFlipKey < flipKey && i < 18;
              const isLastFlip = i === Math.min(17, binderCardList.length - 1);
              const backSrc = isDonCard ? "/don-back.png" : card.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png";
              return (
                <div key={`${flipKey}-${cardKey}||${i}`} className="relative" style={{ perspective: shouldFlip ? "1000px" : "none" }}>
                  <div
                    className="relative"
                    style={{
                      transformStyle: shouldFlip ? "preserve-3d" : "flat",
                      animationName: shouldFlip ? "cardFlipIn" : "none",
                      animationDuration: "0.5s",
                      animationTimingFunction: "ease",
                      animationFillMode: "forwards",
                      animationDelay: shouldFlip ? `${i * 0.03}s` : "0s",
                      willChange: shouldFlip ? "transform" : "auto",
                    }}
                    onAnimationEnd={isLastFlip ? () => setAnimatedFlipKey(flipKey) : undefined}
                  >
                    {shouldFlip && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(180deg)]">
                        <img src={backSrc} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      style={{
                        backfaceVisibility: shouldFlip ? "hidden" : "visible",
                        WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible",
                      }}
                      onClick={() => {
                        if (selectionMode) { setSelectedCardKeys(prev => { const next = new Set(prev); next.has(cardKey) ? next.delete(cardKey) : next.add(cardKey); return next; }); }
                        else if (isDonCard) {
                          setDonModalCards(donBinderCards);
                          setDonModalIndex(donBinderCards.findIndex(d => d.card_name === (card as any).card_name));
                        } else {
                          setModalCards(binderCardList);
                          setModalIndex(i);
                          setModalCard(card);
                        }
                      }}
                    >
                      <div
                        className={`rounded-[14px] overflow-hidden bg-bg-secondary transition-all duration-200 ${
                          selectionMode ? "cursor-pointer" : "cursor-default"
                        } ${
                          isSelected
                            ? "border border-accent-theme ring-2 ring-accent-theme shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
                            : "border border-border-theme shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
                        } ${
                          selectionMode && !isSelected ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        <div className="aspect-5/7 overflow-hidden">
                          <img
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            className="w-full h-full object-cover block"
                            onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
                          />
                        </div>
                      </div>
                      {selectionMode ? (
                        <div className={`absolute top-2 right-2 w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-accent-theme border-accent-theme" : "bg-black/40 border-white/50"
                        }`}>
                          {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleBinderCard(cardKey); }}
                          className="absolute top-2 right-2 w-5.5 h-5.5 rounded-full bg-black/50 border-0 cursor-pointer flex items-center justify-center hover:bg-black/75 transition-colors"
                        >
                          <X size={11} color="#fff" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {openBinderCards.length === 0 && (
              <div className="col-span-full text-center py-16 text-text-tertiary flex flex-col items-center">
                <img src="/nocard.png" alt="No cards" className="w-37.5 h-37.5 object-contain mb-3 opacity-85" />
                <div className="text-sm text-text-secondary">No cards in this binder yet.</div>
                <div className="text-[13px] text-text-tertiary mt-1">Add cards from the browse page.</div>
              </div>
            )}
          </div>
        )}

        {bulkDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/75 z-100 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setBulkDeleteConfirm(false)}
          >
            <div
              className="bg-bg-primary rounded-2xl p-8 w-full max-w-80 shadow-2xl border border-border-theme"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <div className="font-black text-xl text-text-primary mb-2">Remove {selectedCardKeys.size} cards?</div>
                <div className="text-sm text-text-secondary leading-relaxed">These {selectedCardKeys.size} card{selectedCardKeys.size > 1 ? "s" : ""} will be removed from this binder. This can&apos;t be undone.</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  className="flex-1 py-3 text-sm font-semibold border border-border-theme bg-transparent text-text-primary rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const count = selectedCardKeys.size;
                    for (const cardKey of selectedCardKeys) {
                      if (user) {
                        await removeCardFromBinder(openBinderId!, cardKey);
                      } else {
                        removeGuestBinderCard(openBinderId!, cardKey);
                      }
                    }
                    setOpenBinderCards(prev => prev.filter(id => !selectedCardKeys.has(id)));
                    setBinderCounts(prev => ({ ...prev, [openBinderId!]: Math.max((prev[openBinderId!] ?? selectedCardKeys.size) - selectedCardKeys.size, 0) }));
                    setBinderPreviewCards(prev => ({ ...prev, [openBinderId!]: (prev[openBinderId!] ?? []).filter(c => !selectedCardKeys.has(getCardKey(c))) }));
                    setSelectedCardKeys(new Set()); setSelectionMode(false); setBulkDeleteConfirm(false);
                    showToast(`${count} card${count > 1 ? "s" : ""} removed from binder`);
                  }}
                  className="flex-1 py-3 text-sm font-semibold border-0 bg-red-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {modalCard && <CardModal modalCard={modalCard} modalIndex={modalIndex} modalCards={modalCards} setModalCard={setModalCard} setModalIndex={setModalIndex} c={c} tc={tc} isDark={isDark} ownedSet={ownedSet} wishlistSet={wishlistSet} onToggleOwned={handleToggleOwned} onToggleWishlist={handleToggleWishlist} />}
        {donModalIndex >= 0 && donModalCards[donModalIndex] && (
          <DonCardModal
            card={donModalCards[donModalIndex]}
            index={donModalIndex}
            cards={donModalCards}
            onClose={() => setDonModalIndex(-1)}
            onNav={(i) => setDonModalIndex(i)}
            isDark={isDark}
          />
        )}
        {showScrollTop && !modalCard && donModalIndex < 0 && (
          <button
            className="binder-scroll-top fixed bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-bg-tertiary text-text-primary border border-border-theme cursor-pointer shadow-xl z-40 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        )}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <Toast toast={toast} isDark={isDark} />
      </div>
    );
  }

  // ── MAIN BINDER PAGE ─────────────────────────────────
  const totalOwned = ownedSet.size;
  const totalCards = allCards.length;

  return (
    <div suppressHydrationWarning className="binder-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5">
      <Sidebar />

      <div className="px-8 pt-8 pb-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-[34px] font-extrabold tracking-[-0.06em] leading-[0.95] text-text-primary mb-1">Binder</h1>
            <p className="text-[13px] text-text-secondary">{totalOwned} of {totalCards} cards owned</p>
          </div>
          <div className="text-right">
            <div className="text-[22px] font-normal tracking-tight text-text-primary">{totalCards === 0 ? 0 : Math.floor((totalOwned / totalCards) * 100)}%</div>
            <div className="text-[11px] text-text-tertiary">collection complete</div>
          </div>
        </div>
        <ProgressBar value={totalOwned} total={totalCards} color="var(--text-primary)" />
        <div className="binder-tabs flex gap-0 mt-7 border-b border-border-theme">
          {(["sets", "custom", "wishlist"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`py-3 mr-6 text-[13px] font-medium bg-transparent border-0 cursor-pointer border-b-[1.5px] transition-all ${
                tab === t ? "text-text-primary border-b-text-primary" : "text-text-tertiary border-b-transparent hover:text-text-primary"
              }`}
            >
              {t === "sets" ? "Set binders" : t === "custom" ? "My binders" : "My wishlist"}
            </button>
          ))}
        </div>
      </div>

      <div className="binder-content-wrap px-8 py-6">
        {!user && !loadingUser && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-[14px] p-3.5 md:px-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 text-[13px] text-text-primary">
              <Sparkles size={16} className="text-accent-theme shrink-0" />
              <span>
                <strong>Guest Collection:</strong> Your binders and progress are stored locally on this device. Sign in to save permanently across all your devices!
              </span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-accent-theme text-white border-0 rounded-lg py-2 px-4.5 text-[13px] font-bold cursor-pointer whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity"
            >
              Sign In to Sync &rarr;
            </button>
          </div>
        )}

        {tab === "sets" && (
          <div className="binder-sets-grid grid gap-6">
            {availableSets.map((setId) => {
              const setCards = cardsBySet[setId] ?? [];
              const ownedCount = setCards.filter(card => ownedSet.has(getCardKey(card))).length;
              const pct = setCards.length === 0 ? 0 : Math.floor((ownedCount / setCards.length) * 100);
              return (
                <div
                  key={setId}
                  className="binder-deck-card relative overflow-hidden rounded-3xl p-6.5 cursor-pointer bg-bg-secondary border border-border-theme shadow-md hover:-translate-y-1.5 hover:scale-[1.015] transition-all duration-250"
                  onClick={() => handleOpenSet(setId)}
                >
                  <div className="absolute w-55 h-55 rounded-full bg-accent-theme/15 blur-[80px] -top-30 -right-20 pointer-events-none" />
                  <div className="binder-set-code text-[11px] uppercase tracking-[0.18em] text-text-tertiary mb-2 font-semibold">{setId}</div>
                  <div className="binder-set-title text-[26px] leading-[1.15] font-extrabold tracking-tight text-text-primary mb-5 max-w-full">{SET_NAMES[setId] ?? setId}</div>
                  <div className="binder-mini-cards-wrap relative h-35 mb-6">
                    {setCards.slice(0, 4).map((card, i) => (
                      <div
                        key={i}
                        className="binder-mini-card absolute w-21.5 h-30.5 rounded-xl overflow-hidden bg-bg-tertiary border border-border-theme shadow-2xl"
                        style={{
                          left: `${i * 48}px`,
                          top: i % 2 === 0 ? 0 : 8,
                          transform: `rotate(${i % 2 === 0 ? "-5deg" : "5deg"})`,
                        }}
                      >
                        {card.images?.small && (
                          <img
                            src={card.images.small}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="binder-stats-row flex justify-between items-end mb-2.5">
                      <div>
                        <div className={`binder-pct-text text-2xl font-bold tracking-tight flex items-center gap-1.5 ${pct === 100 ? "text-green-500" : "text-text-primary"}`}>
                          <span>{pct}%</span>
                          {pct === 100 && <Crown size={16} className="text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className={`binder-stat-subtext text-xs mt-0.5 ${pct === 100 ? "text-green-500 font-semibold" : "text-text-tertiary font-normal"}`}>
                          {pct === 100 ? "Master Set Complete!" : "collection complete"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="binder-count-text text-sm font-semibold text-text-primary">{ownedCount} / {setCards.length}</div>
                        <div className="binder-stat-subtext text-xs text-text-tertiary mt-0.5">cards collected</div>
                      </div>
                    </div>
                    <div className="binder-progress-bar relative h-1.5 rounded-full overflow-hidden bg-bg-tertiary">
                      <div
                        className="h-full rounded-full relative overflow-hidden transition-all duration-400"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100 ? "linear-gradient(90deg,#22c55e,#4ade80)" : `linear-gradient(90deg,var(--accent-theme),var(--accent-theme))`,
                          boxShadow: pct === 100 ? "0 0 20px rgba(34,197,94,0.5)" : "0 0 24px rgba(239,68,68,0.4)",
                        }}
                      >
                        {pct === 100 && <div className="binder-completion-shimmer" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "custom" && (
          <div>
            {!isMobile && binders.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={openCreateBinder}
                  className="inline-flex items-center gap-2 py-2.5 px-4.5 rounded-xl border-0 cursor-pointer bg-accent-theme text-white text-[13px] font-semibold shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all"
                >
                  <Plus size={15} />
                  <span>Create Binder</span>
                </button>
              </div>
            )}

            <div className="binder-sets-grid grid gap-6">
              {binders.map((binder) => {
                const binderCards = binderPreviewCards[binder.id] ?? [];
                return (
                  <div
                    key={binder.id}
                    className="binder-deck-card relative overflow-hidden rounded-3xl p-6.5 cursor-pointer bg-bg-secondary border border-border-theme shadow-lg hover:-translate-y-1.5 hover:scale-[1.015] transition-all duration-250"
                    onClick={() => {
                      if (renamingId !== binder.id) {
                        handleOpenBinder(binder.id);
                      }
                    }}
                  >
                    <div className="absolute w-60 h-60 rounded-full bg-accent-theme/15 blur-[90px] -top-30 -right-20 pointer-events-none" />
                    <div className="flex justify-between items-center mb-5 min-h-8.5 gap-2.5">
                      <div className="binder-set-title text-2xl leading-tight font-extrabold tracking-tight text-text-primary min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-initial">
                        {binder.name}
                      </div>
                      {/* Kebab Action Menu */}
                      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuBinderId(prev => prev === binder.id ? null : binder.id);
                          }}
                          aria-label={`Options for ${binder.name}`}
                          aria-haspopup="true"
                          aria-expanded={activeMenuBinderId === binder.id}
                          className={`w-8.5 h-8.5 rounded-lg border cursor-pointer flex items-center justify-center transition-all ${
                            activeMenuBinderId === binder.id
                              ? "border-accent-theme bg-bg-tertiary text-text-primary"
                              : "border-transparent bg-bg-tertiary text-text-tertiary hover:text-text-primary"
                          }`}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuBinderId === binder.id && (
                          <div
                            className="absolute top-10 right-0 min-w-37.5 bg-bg-primary border border-border-theme rounded-xl shadow-2xl p-1.5 z-60 flex flex-col gap-0.5"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuBinderId(null);
                                setRenamingId(binder.id);
                                setRenameValue(binder.name);
                              }}
                              className="flex items-center gap-2.5 p-2 w-full rounded-lg border-0 bg-transparent text-text-primary text-[13px] font-medium cursor-pointer text-left hover:bg-bg-secondary transition-colors"
                            >
                              <Pencil size={14} className="text-text-tertiary" />
                              <span>Rename</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuBinderId(null);
                                setDeleteConfirmId(binder.id);
                              }}
                              className="flex items-center gap-2.5 p-2 w-full rounded-lg border-0 bg-transparent text-red-500 text-[13px] font-medium cursor-pointer text-left hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} className="text-red-500" />
                              <span>Delete binder</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="binder-mini-cards-wrap relative h-35 mb-6">
                      {binderCards.length > 0 ? binderCards.map((card, i) => (
                        <div
                          key={i}
                          className="binder-mini-card absolute w-21.5 h-30.5 rounded-xl overflow-hidden bg-bg-tertiary border border-border-theme shadow-2xl"
                          style={{
                            left: `${i * 48}px`,
                            top: i % 2 === 0 ? 0 : 8,
                            transform: `rotate(${i % 2 === 0 ? "-5deg" : "5deg"})`,
                          }}
                        >
                          {card.images?.small && <img src={card.images.small} alt="" className="w-full h-full object-cover" />}
                        </div>
                      )) : (
                        <div className="h-full rounded-2xl border border-dashed border-border-theme flex items-center justify-center text-text-tertiary text-sm">No cards yet</div>
                      )}
                    </div>
                    <div className="binder-stats-row flex justify-between items-end">
                      <div>
                        <div className="binder-pct-text text-2xl font-bold tracking-tight text-text-primary">{binderCounts[binder.id] ?? 0}</div>
                        <div className="binder-stat-subtext text-xs text-text-tertiary mt-0.5">cards collected</div>
                      </div>
                      <div className="binder-stat-subtext text-xs text-text-tertiary inline-flex items-center gap-1">
                        <span>Open Binder</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {binders.length === 0 && !creatingBinder && (
              <div className="text-center py-12 flex flex-col items-center">
                <img src="/no-binder.png" alt="No custom binders" className="w-45 h-45 object-contain opacity-90 mb-3" />
                <div className="text-[22px] font-extrabold tracking-tight text-text-primary mb-1.5">No custom collections yet</div>
                <div className="text-sm text-text-tertiary max-w-90 leading-relaxed mb-5">
                  Build themed binders for your favorite crews, manga chase grails, or tournament deck cores.
                </div>
                <button
                  onClick={openCreateBinder}
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl border-0 bg-accent-theme text-white text-sm font-semibold cursor-pointer shadow-md hover:opacity-90 hover:-translate-y-0.5 transition-all"
                >
                  <Plus size={16} />
                  <span>Create your first binder</span>
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "wishlist" && (() => {
          const regularWishlistCards = allCards.filter(card => wishlistSet.has(getCardKey(card)));
          const donWishlistCards = allDonCards
            .filter(card => wishlistSet.has(getDonCardKey(card)))
            .map(card => ({
              ...card,
              images: { small: card.card_image || "/card-placeholder.png", large: card.card_image || "/card-placeholder.png" },
              id: card.card_name,
              name: card.card_name,
              set: { name: "DON!!" },
              color: "Yellow",
            }));
          const rawWishlistCards = [...sortByCardId(regularWishlistCards), ...donWishlistCards] as Card[];

          // Extract available sets from wishlist cards
          const wishlistAvailableSets = Array.from(new Set(
            rawWishlistCards.map(c => {
              if (c.set?.name === "DON!!" || !(c.id?.includes("-"))) return "DON!!";
              const bracket = c.set?.name?.match(/\[([^\]]+)\]/);
              return bracket ? bracket[1] : (c.id?.split("-")[0] || c.set?.name || "Other");
            })
          )).sort();

          // Color filter handler supporting 2 colors selection
          const handleWishlistColorClick = (color: string) => {
            const multicolorActive = wishlistColors.includes("Multicolor");
            if (color === "Multicolor") {
              setWishlistColors(multicolorActive ? [] : ["Multicolor"]);
              return;
            }
            if (multicolorActive) {
              setWishlistColors([color]);
              return;
            }
            if (wishlistColors.includes(color)) {
              setWishlistColors(wishlistColors.filter((c) => c !== color));
            } else {
              const next = wishlistColors.length >= 2 ? [wishlistColors[1], color] : [...wishlistColors, color];
              setWishlistColors(next);
            }
          };

          // Apply filters
          const filteredWishlistCards = rawWishlistCards.filter(card => {
            if (wishlistSearch.trim()) {
              const q = wishlistSearch.toLowerCase();
              const matchesName = (card.name ?? "").toLowerCase().includes(q);
              const matchesId = (card.id ?? "").toLowerCase().includes(q);
              const matchesSet = (card.set?.name ?? "").toLowerCase().includes(q);
              if (!matchesName && !matchesId && !matchesSet) return false;
            }
            if (wishlistColors.length > 0) {
              if (wishlistColors.includes("Multicolor")) {
                if (!card.color?.includes(" ")) return false;
              } else {
                for (const col of wishlistColors) {
                  if (!card.color?.includes(col)) return false;
                }
              }
            }
            if (wishlistSetId) {
              if (wishlistSetId === "DON!!") {
                if (card.set?.name !== "DON!!" && card.id?.includes("-")) return false;
              } else {
                const prefix = (card.id ?? "").split("-")[0].toUpperCase();
                const setMatch = (card.set?.name ?? "").toUpperCase().includes(wishlistSetId.toUpperCase());
                if (prefix !== wishlistSetId.toUpperCase() && !setMatch) return false;
              }
            }
            return true;
          });

          const hasWishlistFilters = !!wishlistSearch.trim() || wishlistColors.length > 0 || !!wishlistSetId;

          return rawWishlistCards.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
                <Star size={32} fill="#f59e0b" />
              </div>
              <div className="text-[22px] font-extrabold tracking-tight text-text-primary mb-1.5">Your treasure hunt hasn&apos;t started yet</div>
              <div className="text-sm text-text-tertiary max-w-95 leading-relaxed">
                Star your favorite cards while exploring the database to curate your personal wishlist.
              </div>
            </div>
          ) : (
            <div className="binder-wishlist-wrap flex flex-col gap-5">
              {/* Wishlist Header Toolbar & Metrics */}
              <div className="binder-wishlist-toolbar flex flex-wrap items-center justify-between gap-3 p-3.5 md:px-4.5 rounded-2xl bg-bg-secondary border border-border-theme">
                {/* Left: Summary Metrics */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text-primary bg-bg-tertiary py-1.25 px-3 rounded-lg border border-border-theme">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span>{rawWishlistCards.length} {rawWishlistCards.length === 1 ? "card" : "cards"}</span>
                  </div>
                </div>

                {/* Right: Search & Quick Filters */}
                <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                  {/* Search Box */}
                  <div className="relative min-w-full md:min-w-50 flex-initial">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                    />
                    <input
                      ref={wishlistSearchInputRef}
                      value={wishlistSearch}
                      onChange={(e) => setWishlistSearch(e.target.value)}
                      placeholder="Search wishlist (/)"
                      className="w-full py-1.75 pl-7.5 pr-7 rounded-lg border border-border-theme bg-bg-primary text-text-primary text-[13px] outline-none placeholder:text-text-tertiary focus:border-accent-theme"
                    />
                    {wishlistSearch && (
                      <button
                        onClick={() => {
                          setWishlistSearch("");
                          wishlistSearchInputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-text-tertiary p-0.5 flex hover:text-text-primary"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Custom Set Selector Dropdown */}
                  {wishlistAvailableSets.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWishlistSetDropdownOpen((prev) => !prev);
                        }}
                        className={`inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                          wishlistSetId
                            ? "border-accent-theme bg-accent-theme/10 text-accent-theme"
                            : "border-border-theme bg-bg-primary text-text-primary hover:bg-bg-secondary"
                        }`}
                      >
                        <span>
                          {wishlistSetId
                            ? (SET_NAMES[wishlistSetId]
                              ? `${wishlistSetId} · ${SET_NAMES[wishlistSetId]}`
                              : wishlistSetId)
                            : "All Sets"}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`opacity-70 transition-transform duration-200 ${wishlistSetDropdownOpen ? "rotate-180" : "rotate-0"}`}
                        />
                      </button>

                      {wishlistSetDropdownOpen && (
                        <div
                          className="absolute top-[calc(100%+6px)] left-0 z-70 min-w-50 max-w-[min(280px,calc(100vw-32px))] max-h-65 overflow-y-auto bg-bg-primary border border-border-theme rounded-xl shadow-2xl p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Option: All Sets */}
                          <div
                            onClick={() => {
                              setWishlistSetId(null);
                              setWishlistSetDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              !wishlistSetId ? "bg-bg-tertiary text-accent-theme" : "text-text-primary hover:bg-bg-secondary"
                            }`}
                          >
                            <span>All Sets</span>
                            {!wishlistSetId && <Check size={13} strokeWidth={2.5} />}
                          </div>

                          <div className="h-px bg-border-theme my-1" />

                          {/* Available sets */}
                          {wishlistAvailableSets.map((s) => {
                            const isSelected = wishlistSetId === s;
                            const fullName = SET_NAMES[s];
                            return (
                              <div
                                key={s}
                                onClick={() => {
                                  setWishlistSetId(s);
                                  setWishlistSetDropdownOpen(false);
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isSelected ? "bg-bg-tertiary text-accent-theme font-bold" : "text-text-primary font-medium hover:bg-bg-secondary"
                                }`}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-semibold">{s}</span>
                                  {fullName && <span className="text-[10px] text-text-tertiary">{fullName}</span>}
                                </div>
                                {isSelected && <Check size={13} strokeWidth={2.5} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Color Dot Filters */}
                  <div className="flex items-center gap-1.5">
                    {[...FILTER_COLORS, "Multicolor"].map(color => {
                      const isMulti = color === "Multicolor";
                      const active = wishlistColors.includes(color);
                      return (
                        <button
                          key={color}
                          title={color}
                          onClick={() => handleWishlistColorClick(color)}
                          className={`w-5.5 h-5.5 rounded-full shrink-0 border-0 cursor-pointer transition-all ${
                            active || wishlistColors.length === 0 ? "opacity-100" : "opacity-35"
                          } ${active ? "scale-115 ring-2 ring-offset-1 ring-neutral-400" : ""}`}
                          style={{
                            background: isMulti
                              ? "conic-gradient(from 180deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #000000, #ef4444)"
                              : COLOR_DOT[color],
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Clear Filters CTA */}
                  {hasWishlistFilters && (
                    <button
                      onClick={() => {
                        setWishlistSearch("");
                        setWishlistColors([]);
                        setWishlistSetId(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent-theme bg-transparent border-0 cursor-pointer py-1 px-2 hover:opacity-80"
                    >
                      <X size={12} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Wishlist Card Grid */}
              <div className="binder-card-grid grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-5">
                {filteredWishlistCards.map((card, i) => {
                  const isDonCard = card.set?.name === "DON!!";
                  const cardKey = isDonCard ? getDonCardKey(card as any) : getCardKey(card);
                  return (
                    <div key={`${cardKey}||${i}`} className="relative">
                      <div
                        onClick={() => {
                          setModalCards(filteredWishlistCards);
                          setModalIndex(i);
                          setModalCard(card);
                        }}
                        className="rounded-[14px] overflow-hidden border border-amber-500 bg-bg-secondary shadow-[0_10px_25px_rgba(245,158,11,0.15)] cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(245,158,11,0.25)] transition-all duration-200"
                      >
                        <div className="aspect-5/7 overflow-hidden relative">
                          <img
                            src={card.images?.small || "/card-placeholder.png"}
                            alt={card.name}
                            className="w-full h-full object-cover block"
                            onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No cards matching filters */}
              {filteredWishlistCards.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-13 h-13 rounded-full bg-bg-secondary border border-border-theme flex items-center justify-center mb-3 text-text-tertiary">
                    <Search size={24} strokeWidth={1.75} />
                  </div>
                  <div className="text-[17px] font-extrabold tracking-tight text-text-primary mb-1">
                    No treasure found in these waters
                  </div>
                  <div className="text-[13px] text-text-tertiary">
                    Try adjusting your search query or clearing color filters.
                  </div>
                  <button
                    onClick={() => {
                      setWishlistSearch("");
                      setWishlistColors([]);
                      setWishlistSetId(null);
                    }}
                    className="mt-3.5 text-[13px] text-accent-theme bg-transparent border-0 cursor-pointer font-semibold py-1 px-2 hover:opacity-80"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {modalCard && <CardModal modalCard={modalCard} modalIndex={modalIndex} modalCards={modalCards} setModalCard={setModalCard} setModalIndex={setModalIndex} c={c} tc={tc} isDark={isDark} ownedSet={ownedSet} wishlistSet={wishlistSet} onToggleOwned={handleToggleOwned} onToggleWishlist={handleToggleWishlist} />}
      
      {deleteConfirmId && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/75 z-100 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => { if (!deletingLoading) setDeleteConfirmId(null); }}
        >
          <div className="bg-bg-primary rounded-2xl p-8 w-full max-w-80 shadow-2xl border border-border-theme" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              <div className="font-black text-xl text-text-primary mb-2">Delete binder?</div>
              <div className="text-sm text-text-secondary leading-relaxed">&ldquo;{binders.find(b => b.id === deleteConfirmId)?.name}&rdquo; will be permanently deleted.</div>
            </div>
            <div className="flex gap-3">
              <button
                disabled={deletingLoading}
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 text-sm font-semibold border border-border-theme bg-transparent text-text-primary rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                disabled={deletingLoading}
                onClick={() => handleDeleteBinder(deleteConfirmId)}
                className="flex-1 py-3 text-sm font-semibold border-0 bg-red-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile FAB for Create Binder */}
      {isMobile && tab === "custom" && binders.length > 0 && (
        <button
          onClick={openCreateBinder}
          aria-label="Create Binder"
          className="fixed bottom-6 right-6 w-13 h-13 rounded-2xl bg-accent-theme text-white border-0 flex items-center justify-center shadow-lg cursor-pointer z-90 hover:opacity-90 transition-all"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}

      {/* Create Binder Modal */}
      {creatingBinder && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/75 z-100 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => { if (!creatingBinderLoading) { setCreatingBinder(false); setNewBinderName(""); } }}
        >
          <div className="bg-bg-primary rounded-3xl p-6 w-full max-w-90 shadow-2xl border border-border-theme" onClick={(e) => e.stopPropagation()}>
            <div className="font-extrabold text-xl text-text-primary mb-4">Create Binder</div>
            <input 
              autoFocus 
              disabled={creatingBinderLoading}
              value={newBinderName} 
              onChange={(e) => setNewBinderName(e.target.value)} 
              onKeyDown={(e) => { 
                if (e.key === "Enter") handleCreateBinder(); 
                if (e.key === "Escape" && !creatingBinderLoading) { setCreatingBinder(false); setNewBinderName(""); } 
              }} 
              placeholder={binderPlaceholder} 
              className="w-full bg-black/5 dark:bg-white/5 border border-border-theme rounded-xl px-4 py-3.5 outline-none text-base text-text-primary font-inherit mb-5 focus:border-accent-theme disabled:opacity-60" 
            />
            <div className="flex gap-3 justify-end">
              <button
                disabled={creatingBinderLoading}
                onClick={() => { setCreatingBinder(false); setNewBinderName(""); }}
                className="py-2.5 px-4 text-sm font-semibold border-0 bg-transparent text-text-secondary cursor-pointer rounded-lg hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                disabled={!newBinderName.trim() || creatingBinderLoading}
                onClick={handleCreateBinder}
                className="py-2.5 px-5 text-sm font-semibold border-0 bg-accent-theme text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creatingBinderLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Binder Modal */}
      {renamingId && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/75 z-100 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => { if (!renamingLoading) { setRenamingId(null); setRenameValue(""); } }}
        >
          <div
            className="bg-bg-primary rounded-3xl p-6 w-full max-w-90 shadow-2xl border border-border-theme"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-extrabold text-xl text-text-primary mb-4">Rename Binder</div>
            <input
              autoFocus
              disabled={renamingLoading}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameBinder(renamingId);
                if (e.key === "Escape" && !renamingLoading) { setRenamingId(null); setRenameValue(""); }
              }}
              placeholder="Binder name..."
              className="w-full bg-black/5 dark:bg-white/5 border border-border-theme rounded-xl px-4 py-3.5 outline-none text-base text-text-primary font-inherit mb-5 focus:border-accent-theme disabled:opacity-60"
            />
            <div className="flex gap-3 justify-end">
              <button
                disabled={renamingLoading}
                onClick={() => { setRenamingId(null); setRenameValue(""); }}
                className="py-2.5 px-4 text-sm font-semibold border-0 bg-transparent text-text-secondary cursor-pointer rounded-lg hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                disabled={!renameValue.trim() || renamingLoading}
                onClick={() => handleRenameBinder(renamingId)}
                className="py-2.5 px-5 text-sm font-semibold border-0 bg-accent-theme text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {renamingLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top on Main Binder Page */}
      {showScrollTop && !modalCard && (
        <button
          className="binder-scroll-top fixed bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-bg-tertiary text-text-primary border border-border-theme cursor-pointer shadow-xl z-40 flex items-center justify-center transition-all hover:scale-105"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <Toast toast={toast} isDark={isDark} />
    </div>
  );
}
