"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getAllCards } from "@/lib/api";
import { Card } from "@/types/card";
import Sidebar from "@/components/Sidebar";
import {
  getUserCards, getBinders, getBinderCards, getBinderCardCounts,
  addUserCard, removeUserCard, createBinder, deleteBinder, renameBinder,
  addCardToBinder, removeCardFromBinder,
  type UserCard, type Binder,
} from "@/lib/binder";
import AuthModal from "@/components/AuthModal";
import { useTheme } from "next-themes";
import { getColors } from "@/lib/themes";
import { Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";

const getCardKey = (card: Card) => `${card.id ?? ""}||${card.name ?? ""}||${card.set?.name ?? ""}`;

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

const SET_ORDER = [
  "OP-01","OP-02","OP-03","OP-04","OP-05","OP-06","OP-07","OP-08",
  "OP-09","OP-10","OP-11","OP-12","OP-13","OP-14","OP-15",
  "ST-01","ST-02","ST-03","ST-04","ST-05","ST-06","ST-07","ST-08",
  "ST-09","ST-10","ST-11","ST-12","ST-13","ST-14","ST-15","ST-16",
  "ST-17","ST-18","ST-19","ST-20","ST-21","ST-22","ST-23","ST-24",
  "ST-25","ST-26","ST-27","ST-28","ST-29","ST-30",
  "EB-01","EB-02","EB-03","EB-04",
  "PRB-01","PRB-02",
];

const SET_NAMES: Record<string, string> = {
  "OP-01": "Romance Dawn", "OP-02": "Paramount War", "OP-03": "Pillars of Strength",
  "OP-04": "Kingdoms of Intrigue", "OP-05": "Awakening of the New Era",
  "OP-06": "Wings of the Captain", "OP-07": "500 Years in the Future",
  "OP-08": "Two Legends", "OP-09": "Emperors in the New World",
  "OP-10": "Royal Blood", "OP-11": "A Fist of Divine Speed",
  "OP-12": "Legacy of the Master", "OP-13": "Alliance Rising",
  "OP-14": "The Four Emperors", "OP-15": "Adventure on KAMI's Island",
  "ST-01": "Straw Hat Crew", "ST-02": "Worst Generation",
  "ST-03": "The Seven Warlords of the Sea", "ST-04": "Animal Kingdom Pirates",
  "ST-05": "One Piece Film Edition", "ST-06": "Absolute Justice",
  "ST-07": "Big Mom Pirates", "ST-08": "Monkey D. Luffy",
  "ST-09": "Yamato", "ST-10": "The Three Captains",
  "ST-11": "Side Uta", "ST-12": "Zoro & Sanji",
  "ST-13": "The Three Brothers' Bond", "ST-14": "3D2Y",
  "ST-15": "Red Edward Newgate", "ST-16": "Green Uta",
  "ST-17": "Blue Donquixote Doflamingo", "ST-18": "Purple Monkey D. Luffy",
  "ST-19": "Black Smoker", "ST-20": "Yellow Charlotte Katakuri",
  "ST-21": "EX · GEAR5", "ST-22": "Ace & Newgate",
  "ST-23": "Red Shanks", "ST-24": "Green Jewelry Bonney",
  "ST-25": "Blue Buggy", "ST-26": "Purple/Black Monkey D. Luffy",
  "ST-27": "Black Marshall D. Teach", "ST-28": "Green/Yellow Yamato",
  "ST-29": "EGGHEAD", "ST-30": "EX · Luffy & Ace",
  "EB-01": "Memorial Collection", "EB-02": "Anime 25th Collection",
  "EB-03": "Pillars of Strength", "EB-04": "Egghead Crisis",
  "PRB-01": "Premium Booster", "PRB-02": "Premium Booster",
};

const COLOR_DOT: Record<string, string> = {
  Red: "#ef4444", Green: "#22c55e", Blue: "#3b82f6",
  Purple: "#a855f7", Black: "#374151", Yellow: "#eab308",
};
const FILTER_COLORS   = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
const FILTER_TYPES    = ["LEADER", "CHARACTER", "EVENT", "STAGE"];
const FILTER_RARITIES = ["SEC", "SR", "R", "UC", "C", "SP", "TR", "PR"];

const FLIP_STYLE = `
  @keyframes cardFlipIn {
    0% { transform: rotateY(180deg); }
    100% { transform: rotateY(0deg); }
  }
`;

function AuthGate({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tc = getColors(theme, mounted);
  return (
    <div suppressHydrationWarning style={{ minHeight: "100vh", background: tc.bg.primary, marginLeft: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: "0 24px", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, border: `0.5px solid ${tc.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 22 }}>📁</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: tc.text.primary, letterSpacing: "-0.02em", marginBottom: 8 }}>Your binder</h1>
        <p style={{ fontSize: 14, color: tc.text.tertiary, lineHeight: 1.6, marginBottom: 32 }}>Sign in to track your collection, mark cards as owned, and build custom binders.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onSignIn} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: tc.text.primary, color: tc.bg.primary, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>Sign in</button>
          <button onClick={onSignUp} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: "transparent", color: tc.text.primary, fontSize: 13, fontWeight: 500, border: `0.5px solid ${tc.border}`, cursor: "pointer" }}>Sign up free</button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, total, color = "#111827" }: { value: number; total: number; color?: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div style={{ height: 2, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
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
  const cardKey = `${modalCard.id ?? ""}||${modalCard.name ?? ""}||${modalCard.set?.name ?? ""}`;
  const owned = ownedSet.has(cardKey);
  const wished = wishlistSet.has(cardKey);

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

  return (
    <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => { setModalCard(null); setShowOwnershipPicker(false); }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => { const i = modalIndex - 1; setModalIndex(i); setModalCard(modalCards[i]); setShowOwnershipPicker(false); }} disabled={modalIndex <= 0} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: modalIndex > 0 ? "pointer" : "not-allowed", opacity: modalIndex <= 0 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, background: c.bg, borderRadius: 20, border: `1px solid ${c.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, color: c.text, letterSpacing: "-0.02em" }}>{modalCard.name}</div>
              <div style={{ fontSize: 12, color: c.textTer, fontFamily: "monospace", marginTop: 2 }}>{modalCard.id}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowOwnershipPicker(p => !p)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                    border: `1px solid ${owned ? "#16a34a" : wished ? "#f59e0b" : c.border}`,
                    background: owned ? (isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)") : wished ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)") : "transparent",
                    color: owned ? "#16a34a" : wished ? "#d97706" : c.textTer }}
                >
                  {owned ? <Check size={13} /> : wished ? <span style={{ fontSize: 13, lineHeight: 1 }}>★</span> : null}
                  {owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
                </button>
                {showOwnershipPicker && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 200, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, overflow: "hidden", boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)", zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ padding: "6px 8px" }}>
                      <button onClick={() => { onToggleOwned(cardKey); setShowOwnershipPicker(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: owned ? (isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)") : "transparent", color: owned ? "#16a34a" : c.text }} onMouseEnter={(e) => { if (!owned) e.currentTarget.style.background = c.bgSec; }} onMouseLeave={(e) => { if (!owned) e.currentTarget.style.background = "transparent"; }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${owned ? "#16a34a" : c.border}`, background: owned ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {owned && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        I own this card
                      </button>
                      <button onClick={() => { onToggleWishlist(cardKey); setShowOwnershipPicker(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left" as const, transition: "all 0.15s", background: wished ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)") : "transparent", color: wished ? "#d97706" : c.text }} onMouseEnter={(e) => { if (!wished) e.currentTarget.style.background = c.bgSec; }} onMouseLeave={(e) => { if (!wished) e.currentTarget.style.background = "transparent"; }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${wished ? "#d97706" : c.border}`, background: wished ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>
                          {wished && <span style={{ color: "#fff" }}>★</span>}
                        </div>
                        Add to wishlist
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { setModalCard(null); setShowOwnershipPicker(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={c.textTer} /></button>
            </div>
          </div>
          <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
            <div style={{ width: "45%", flexShrink: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ aspectRatio: "63/88", overflow: "hidden", borderRadius: 17, boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)" }}>
                <img src={modalCard.images?.large || "/card-placeholder.png"} alt={modalCard.name} style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([["Type", modalCard.type], ["Rarity", modalCard.rarity], ["Color", modalCard.color], ["Cost", modalCard.cost], ["Power", modalCard.power], ["Counter", modalCard.counter], ["Attribute", modalCard.attribute?.name], ["Family", modalCard.family], ["Set", modalCard.set?.name]] as [string, unknown][]).filter(([, v]) => v != null && v !== "" && v !== "-").map(([label, value]) => (
                  <div key={String(label)} style={{ background: c.bgSec, borderRadius: 10, padding: "10px 14px", border: `1px solid ${c.border}` }}>
                    <div style={{ fontSize: 11, color: c.textTer, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: c.text }}>{String(value)}</div>
                  </div>
                ))}
              </div>
              {modalCard.ability && (<div style={{ background: c.bgSec, borderRadius: 10, padding: "12px 14px", border: `1px solid ${c.border}` }}><div style={{ fontSize: 11, color: c.textTer, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Effect</div><div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>{modalCard.ability}</div></div>)}
              {modalCard.trigger && modalCard.trigger !== "" && (<div style={{ background: isDark ? "rgba(217,119,6,0.1)" : "rgba(251,191,36,0.08)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${isDark ? "rgba(251,191,36,0.2)" : "rgba(217,119,6,0.2)"}` }}><div style={{ fontSize: 11, color: isDark ? "#fbbf24" : "#d97706", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Trigger</div><div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>{modalCard.trigger}</div></div>)}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${c.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: c.textTer, flexShrink: 0 }}>{modalIndex + 1} / {modalCards.length}</div>
        </div>
        <button onClick={() => { const i = modalIndex + 1; setModalIndex(i); setModalCard(modalCards[i]); }} disabled={modalIndex >= modalCards.length - 1} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: modalIndex < modalCards.length - 1 ? "pointer" : "not-allowed", opacity: modalIndex >= modalCards.length - 1 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}


function DonCardModal({ card, index, cards, onClose, onNav, c, tc, isDark }: {
  card: any; index: number; cards: any[];
  onClose: () => void; onNav: (i: number) => void;
  c: any; tc: any; isDark: boolean;
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
    <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onNav(index - 1)} disabled={index <= 0} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: index > 0 ? "pointer" : "not-allowed", opacity: index <= 0 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, background: c.bg, borderRadius: 20, border: `1px solid ${c.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: c.text, letterSpacing: "-0.02em" }}>{card.card_name}</div>
              <div style={{ fontSize: 12, color: c.textTer, marginTop: 2 }}>DON!! Card</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={c.textTer} /></button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 320 }}>
              <div style={{ aspectRatio: "2.5 / 3.5", width: "100%", borderRadius: 14, overflow: "hidden", boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)" }}>
                <img src={card.card_image || "/card-placeholder.png"} alt={card.card_name} style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${c.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: c.textTer, flexShrink: 0 }}>{index + 1} / {cards.length}</div>
        </div>
        <button onClick={() => onNav(index + 1)} disabled={index >= cards.length - 1} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: index < cards.length - 1 ? "pointer" : "not-allowed", opacity: index >= cards.length - 1 ? 0.3 : 1, boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function BinderPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const savedScrollY = useRef(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [allCards, setAllCards] = useState<Card[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [binderCounts, setBinderCounts] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  const [tab, setTab] = useState<"sets" | "custom" | "wishlist">("sets");
  const [openSetId, setOpenSetId] = useState<string | null>(null);
  const [openBinderId, setOpenBinderId] = useState<string | null>(null);
  const [openBinderCards, setOpenBinderCards] = useState<string[]>([]);
  const [binderPreviewCards, setBinderPreviewCards] = useState<Record<string, Card[]>>({});

  const [creatingBinder, setCreatingBinder] = useState(false);
  const [newBinderName, setNewBinderName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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
    colors?: string[]; type?: string; rarity?: string; owned?: "owned" | "not_owned";
  }>({});

  useEffect(() => { setMounted(true); }, []);

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
    if (!user) return;
    setLoadingData(true);
    Promise.all([
      getAllCards(),
      getUserCards(user.id),
      getBinders(user.id),
      getBinderCardCounts(user.id),
      fetch("https://www.optcgapi.com/api/allDonCards/").then(r => r.json()).catch(() => [])
    ]).then(([cards, uc, b, bc, don]) => {
      setAllCards(cards);
      setAllDonCards(don);
      setUserCards(uc);
      setBinders(b);
      setBinderCounts(bc);
      setLoadingData(false);
    });
  }, [user]);

  useEffect(() => {
    if (!openBinderId) return;
    setOpenBinderCards([]);
    setLoadingBinderCards(true);
    getBinderCards(openBinderId).then(cards => {
      setOpenBinderCards(cards);
      setLoadingBinderCards(false);
    });
  }, [openBinderId]);

  useEffect(() => {
    if (!binders.length || !allCards.length) return;
    Promise.all(binders.map(b => getBinderCards(b.id).then(keys => ({ id: b.id, keys }))))
      .then(results => {
        const previewMap: Record<string, Card[]> = {};
        const countMap: Record<string, number> = {};
        for (const { id, keys } of results) {
          const regularMatches = allCards.filter(card => keys.includes(getCardKey(card)));
          const donMatches = allDonCards
            .filter(card => keys.includes(`don||${card.card_name}`))
            .map(card => ({ ...card, images: { small: card.card_image, large: card.card_image } }));
          previewMap[id] = [...regularMatches, ...donMatches].slice(0, 4) as Card[];
          countMap[id] = keys.length;
        }
        setBinderPreviewCards(previewMap);
        setBinderCounts(prev => ({ ...prev, ...countMap }));
      });
  }, [binders, allCards, allDonCards]);

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

  const handleToggleBinderCard = async (cardId: string) => {
    if (!openBinderId) return;
    if (openBinderCards.includes(cardId)) {
      setOpenBinderCards(prev => prev.filter(id => id !== cardId));
      setBinderCounts(prev => ({ ...prev, [openBinderId]: Math.max((prev[openBinderId] ?? 1) - 1, 0) }));
      setBinderPreviewCards(prev => ({ ...prev, [openBinderId]: (prev[openBinderId] ?? []).filter(c => getCardKey(c) !== cardId) }));
      await removeCardFromBinder(openBinderId, cardId);
    } else {
      setOpenBinderCards(prev => [...prev, cardId]);
      setBinderCounts(prev => ({ ...prev, [openBinderId]: (prev[openBinderId] ?? 0) + 1 }));
      const card = allCards.find(c => getCardKey(c) === cardId);
      if (card) setBinderPreviewCards(prev => ({ ...prev, [openBinderId]: [...(prev[openBinderId] ?? []), card].slice(0, 4) }));
      await addCardToBinder(openBinderId, cardId);
      if (!ownedSet.has(cardId) && user) {
        setUserCards(prev => [...prev.filter(u => u.card_id !== cardId), { card_id: cardId, in_wishlist: false }]);
        await addUserCard(user.id, cardId, false);
      }
    }
  };

  const handleCreateBinder = async () => {
    if (!user || !newBinderName.trim()) return;
    const b = await createBinder(user.id, newBinderName.trim());
    if (b) { setBinders(prev => [...prev, b]); setBinderCounts(prev => ({ ...prev, [b.id]: 0 })); }
    setNewBinderName(""); setCreatingBinder(false);
  };

  const handleDeleteBinder = async (id: string) => {
    await deleteBinder(id);
    setBinders(prev => prev.filter(b => b.id !== id));
    if (openBinderId === id) setOpenBinderId(null);
  };

  const handleRenameBinder = async (id: string) => {
    if (!renameValue.trim()) return;
    await renameBinder(id, renameValue.trim());
    setBinders(prev => prev.map(b => b.id === id ? { ...b, name: renameValue.trim() } : b));
    setRenamingId(null);
  };

  if (loadingUser) return (
    <div style={{ minHeight: "100vh", background: tc.bg.primary, marginLeft: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 13, color: tc.text.tertiary }}>Loading...</div>
    </div>
  );

  if (!user) return (
    <>
      <Sidebar />
      <AuthGate onSignIn={() => { setAuthMode("login"); setShowAuthModal(true); }} onSignUp={() => { setAuthMode("signup"); setShowAuthModal(true); }} />
      {showAuthModal && <AuthModal initialMode={authMode} onClose={() => setShowAuthModal(false)} />}
    </>
  );

  // ── OPEN SET VIEW ───────────────────────────────────
  if (openSetId) {
    const allSetCards = sortByCardId(cardsBySet[openSetId] ?? [], openSetId);
    const totalSetOwned = allSetCards.filter(c => ownedSet.has(getCardKey(c))).length;
    const totalSetPct = allSetCards.length === 0 ? 0 : Math.round((totalSetOwned / allSetCards.length) * 100);
    const selectedColors = setViewFilters.colors ?? [];
    const multicolorActive = selectedColors.includes("Multicolor");

    const setCards = allSetCards.filter(card => {
      if (selectedColors.length > 0) {
        if (multicolorActive) { if (!card.color?.includes(" ")) return false; }
        else { for (const col of selectedColors) { if (!card.color?.includes(col)) return false; } }
      }
      if (setViewFilters.type && card.type?.toUpperCase() !== setViewFilters.type.toUpperCase()) return false;
      if (setViewFilters.rarity) {
        let nr = card.rarity?.replace(/\s+CARD\s*$/i, "").trim() || card.rarity;
        if (card.name?.includes("(SP)")) nr = "SP";
        if (nr !== setViewFilters.rarity) return false;
      }
      if (setViewFilters.owned === "owned" && !ownedSet.has(getCardKey(card))) return false;
      if (setViewFilters.owned === "not_owned" && ownedSet.has(getCardKey(card))) return false;
      return true;
    });

    const hasActiveFilters = selectedColors.length > 0 || !!setViewFilters.type || !!setViewFilters.rarity || !!setViewFilters.owned;
    const allSetOwned = allSetCards.length > 0 && allSetCards.every(c => ownedSet.has(getCardKey(c)));

    const chipStyle = (active: boolean) => ({
      paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4,
      borderRadius: 9999 as const, fontSize: 12, fontWeight: 600, cursor: "pointer" as const,
      whiteSpace: "nowrap" as const, transition: "all 0.2s",
      border: `1px solid ${active ? (isDark ? "#f3f4f6" : "#111827") : c.border}`,
      background: active ? (isDark ? "#f3f4f6" : "#111827") : "transparent",
      color: active ? (isDark ? "#111827" : "#ffffff") : c.textTer,
    });

    return (
      <div suppressHydrationWarning style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70 }}>
        <style>{FLIP_STYLE}</style>
        <Sidebar />

        <div style={{ padding: "20px 32px", borderBottom: `0.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: c.bg, zIndex: 20 }}>
          <button onClick={() => { setOpenSetId(null); window.scrollTo(0, savedScrollY.current); }} style={{ background: "none", border: "none", cursor: "pointer", color: c.textSec, display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: 0 }}>
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ width: "0.5px", height: 16, background: c.border }} />
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{openSetId} · {SET_NAMES[openSetId] ?? openSetId}</span>
            <span style={{ fontSize: 13, color: c.textTer, marginLeft: 10 }}>{totalSetOwned} / {allSetCards.length} · {totalSetPct}%</span>
          </div>
          <div style={{ flex: 1, maxWidth: 200, marginLeft: "auto" }}>
            <ProgressBar value={totalSetOwned} total={allSetCards.length} color={tc.text.primary} />
          </div>
        </div>

        <div style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Color</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[...FILTER_COLORS, "Multicolor"].map((color) => {
                const isMulti = color === "Multicolor";
                const active = isMulti ? multicolorActive : selectedColors.includes(color);
                const dimmed = !active && selectedColors.length > 0;
                return (
                  <button key={color} title={color}
                    onClick={() => {
                      if (isMulti) { setSetViewFilters(f => ({ ...f, colors: multicolorActive ? [] : ["Multicolor"] })); return; }
                      if (multicolorActive) { setSetViewFilters(f => ({ ...f, colors: [color] })); return; }
                      const cur = selectedColors;
                      if (cur.includes(color)) setSetViewFilters(f => ({ ...f, colors: cur.filter(c => c !== color) }));
                      else { const next = cur.length >= 2 ? [cur[1], color] : [...cur, color]; setSetViewFilters(f => ({ ...f, colors: next })); }
                    }}
                    style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer", background: isMulti ? "conic-gradient(from 180deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #000000, #ef4444)" : COLOR_DOT[color], outline: active ? `3px solid ${isMulti ? "#808080" : COLOR_DOT[color]}` : "none", outlineOffset: 2, opacity: dimmed ? 0.35 : 1, transform: active ? "scale(1.15)" : "scale(1)", transition: "all 0.2s" }}
                  />
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTER_TYPES.map(t => <button key={t} onClick={() => setSetViewFilters(f => ({ ...f, type: f.type === t ? undefined : t }))} style={chipStyle(setViewFilters.type === t)}>{t}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rarity</span>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTER_RARITIES.map(r => <button key={r} onClick={() => setSetViewFilters(f => ({ ...f, rarity: f.rarity === r ? undefined : r }))} style={chipStyle(setViewFilters.rarity === r)}>{r}</button>)}
            </div>
          </div>
          {!allSetOwned && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Show</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "owned" ? undefined : "owned" }))} style={{ ...chipStyle(setViewFilters.owned === "owned"), border: `1px solid ${setViewFilters.owned === "owned" ? "#16a34a" : c.border}`, background: setViewFilters.owned === "owned" ? "#16a34a" : "transparent", color: setViewFilters.owned === "owned" ? "#fff" : c.textTer }}>Owned</button>
                <button onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "not_owned" ? undefined : "not_owned" }))} style={{ ...chipStyle(setViewFilters.owned === "not_owned"), border: `1px solid ${setViewFilters.owned === "not_owned" ? (isDark ? "#f3f4f6" : "#111827") : c.border}`, background: setViewFilters.owned === "not_owned" ? (isDark ? "#f3f4f6" : "#111827") : "transparent", color: setViewFilters.owned === "not_owned" ? (isDark ? "#111827" : "#fff") : c.textTer }}>Not owned</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 14, color: c.textTer }}>Showing <strong style={{ color: c.text }}>{setCards.length}</strong> cards</span>
          {hasActiveFilters && (
            <button onClick={() => setSetViewFilters({})} style={{ fontSize: 12, color: tc.accent, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
              <X style={{ width: 12, height: 12 }} /> Clear filters
            </button>
          )}
        </div>

        <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 22 }}>
          {setCards.map((card, i) => {
            const reactKey = `${getCardKey(card)}||${i}`;
            const cardKey = getCardKey(card);
            const owned = ownedSet.has(cardKey);
            const wished = wishlistSet.has(cardKey);
            const shouldFlip = animatedFlipKey < flipKey && i < 18;
            const isLastFlip = i === Math.min(17, setCards.length - 1);
            const backSrc = card.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png";
            const flipDone = animatedFlipKey >= flipKey;
            return (
              <div key={`${flipKey}-${reactKey}`} style={{ position: "relative", perspective: shouldFlip ? "1000px" : "none" }}>
                <div
                  style={{ position: "relative", transformStyle: shouldFlip ? "preserve-3d" : "flat", animationName: shouldFlip ? "cardFlipIn" : "none", animationDuration: "0.5s", animationTimingFunction: "ease", animationFillMode: "forwards", animationDelay: shouldFlip ? `${i * 0.03}s` : "0s", willChange: shouldFlip ? "transform" : "auto" }}
                  onAnimationEnd={isLastFlip ? () => setAnimatedFlipKey(flipKey) : undefined}
                >
                  {shouldFlip && (
                    <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden" }}>
                      <img src={backSrc} alt="" style={{ width: "100%", height: "100%" }} />
                    </div>
                  )}
                  <div style={{ backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible" }}>
                    <div onClick={() => { setModalCards(setCards); setModalIndex(i); setModalCard(setCards[i]); }} style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${owned ? (isDark ? "#4ade80" : "#16a34a") : c.border}`, background: c.bgSec, boxShadow: owned ? "0 10px 30px rgba(34,197,94,0.15)" : "0 10px 25px rgba(0,0,0,0.25)", transition: "all 0.25s ease", opacity: owned ? 1 : 0.55, cursor: "pointer" }}>
                      <div style={{ aspectRatio: "63/88", overflow: "hidden" }}>
                        <img src={card.images?.small || "/card-placeholder.png"} alt={card.name} style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                      </div>
                    </div>
                    {wished && !owned && (i >= 18 || flipDone) && (
                      <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>★</div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 500, color: c.textSec, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {setCards.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 0", color: c.textTer }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, color: c.textSec }}>No cards match these filters.</div>
              <button onClick={() => setSetViewFilters({})} style={{ marginTop: 12, fontSize: 13, color: tc.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Clear filters</button>
            </div>
          )}
        </div>

        {modalCard && <CardModal modalCard={modalCard} modalIndex={modalIndex} modalCards={modalCards} setModalCard={setModalCard} setModalIndex={setModalIndex} c={c} tc={tc} isDark={isDark} ownedSet={ownedSet} wishlistSet={wishlistSet} onToggleOwned={handleToggleOwned} onToggleWishlist={handleToggleWishlist} />}
        {showScrollTop && !modalCard && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: 32, left: "calc(50% + 35px)", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: c.bgTer, color: c.text, border: `1px solid ${c.border}`, cursor: "pointer", fontSize: 22, fontWeight: 700, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>↑</button>
        )}
      </div>
    );
  }

  // ── OPEN CUSTOM BINDER VIEW ──────────────────────────
  if (openBinderId) {
    const binder = binders.find(b => b.id === openBinderId);
    const binderCardSet = new Set(openBinderCards);
    const regularBinderCards = allCards.filter(card => binderCardSet.has(getCardKey(card)));
    const donBinderCards = allDonCards
      .filter(card => binderCardSet.has(`don||${card.card_name}`))
      .map(card => ({ ...card, images: { small: card.card_image, large: card.card_image }, id: card.card_name, name: card.card_name, set: { name: "DON!!" } }));
    const binderCardList = [...sortByCardId(regularBinderCards), ...donBinderCards] as Card[];

    return (
      <div suppressHydrationWarning style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70 }}>
        <style>{FLIP_STYLE}</style>
        <Sidebar />

        <div style={{ padding: "20px 32px", borderBottom: `0.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: c.bg, zIndex: 20 }}>
          <button onClick={() => { setOpenBinderId(null); window.scrollTo(0, savedScrollY.current); }} style={{ background: "none", border: "none", cursor: "pointer", color: c.textSec, display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: 0 }}>
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ width: "0.5px", height: 16, background: c.border }} />
          <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.06em", color: c.text }}>{binder?.name}</span>
            <span style={{ fontSize: 13, color: c.textTer }}>{openBinderCards.length} cards</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {selectionMode && selectedCardKeys.size > 0 && (
              <button title={`Remove ${selectedCardKeys.size} cards`} onClick={() => setBulkDeleteConfirm(true)} style={{ width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
                <Trash2 size={15} />
              </button>
            )}
            <button title={selectionMode ? "Cancel selection" : "Select cards"} onClick={() => { setSelectionMode(p => !p); setSelectedCardKeys(new Set()); }} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${selectionMode ? tc.accent : c.border}`, cursor: "pointer", background: selectionMode ? `${tc.accent}18` : "transparent", color: selectionMode ? tc.accent : c.textTer, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <CheckSquare size={15} />
            </button>
            <button title="Browse cards" onClick={() => router.push("/browse")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tc.accent, color: "#fff", fontSize: 13, fontWeight: 600, transition: "opacity 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
              Browse cards →
            </button>
          </div>
        </div>

        {loadingBinderCards ? (
          <div style={{ padding: "32px" }} />
        ) : (
          <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 22 }}>
            {binderCardList.map((card, i) => {
              const isDonCard = card.set?.name === "DON!!";
              const cardKey = isDonCard ? `don||${(card as any).card_name}` : getCardKey(card);
              const isSelected = selectedCardKeys.has(cardKey);
              const shouldFlip = animatedFlipKey < flipKey && i < 18;
              const isLastFlip = i === Math.min(17, binderCardList.length - 1);
              const backSrc = isDonCard ? "/don-back.png" : card.type?.toUpperCase() === "LEADER" ? "/card-back-leader.png" : "/card-back.png";
              return (
                <div key={`${flipKey}-${cardKey}||${i}`} style={{ position: "relative", perspective: shouldFlip ? "1000px" : "none" }}>
                  <div
                    style={{ position: "relative", transformStyle: shouldFlip ? "preserve-3d" : "flat", animationName: shouldFlip ? "cardFlipIn" : "none", animationDuration: "0.5s", animationTimingFunction: "ease", animationFillMode: "forwards", animationDelay: shouldFlip ? `${i * 0.03}s` : "0s", willChange: shouldFlip ? "transform" : "auto" }}
                    onAnimationEnd={isLastFlip ? () => setAnimatedFlipKey(flipKey) : undefined}
                  >
                    {shouldFlip && (
                      <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden" }}>
                        <img src={backSrc} alt="" style={{ width: "100%", height: "100%"}} />
                      </div>
                    )}
                    <div
                      style={{ backfaceVisibility: shouldFlip ? "hidden" : "visible", WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible" }}
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
                      <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${isSelected ? tc.accent : c.border}`, background: c.bgSec, boxShadow: isSelected ? `0 0 0 2px ${tc.accent}` : "0 10px 25px rgba(0,0,0,0.25)", transition: "all 0.2s ease", opacity: selectionMode && !isSelected ? 0.5 : 1, cursor: selectionMode ? "pointer" : "default" }}>
                        <div style={{ aspectRatio: "63/88", overflow: "hidden" }}>
                          <img src={card.images?.small || "/card-placeholder.png"} alt={card.name} style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                        </div>
                      </div>
                      {selectionMode ? (
                        <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: isSelected ? tc.accent : "rgba(0,0,0,0.4)", border: `2px solid ${isSelected ? tc.accent : "rgba(255,255,255,0.5)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleToggleBinderCard(cardKey); }} style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={11} color="#fff" />
                        </button>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 500, color: c.textSec, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {openBinderCards.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 0", color: c.textTer, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src="/nocard.png" alt="No cards" style={{ width: 150, height: 150, objectFit: "contain", marginBottom: 12, opacity: isDark ? 0.85 : 1 }} />
                <div style={{ fontSize: 14, color: c.textSec }}>No cards in this binder yet.</div>
                <div style={{ fontSize: 13, color: c.textTer, marginTop: 4 }}>Add cards from the browse page.</div>
              </div>
            )}
          </div>
        )}

        {bulkDeleteConfirm && (
          <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setBulkDeleteConfirm(false)}>
            <div style={{ background: c.bg, borderRadius: 16, padding: 32, width: "100%", maxWidth: 320, boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.2)", border: `1px solid ${c.border}` }} onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: c.text, marginBottom: 8 }}>Remove {selectedCardKeys.size} cards?</div>
                <div style={{ fontSize: 14, color: c.textSec }}>These {selectedCardKeys.size} card{selectedCardKeys.size > 1 ? "s" : ""} will be removed from this binder. This can't be undone.</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setBulkDeleteConfirm(false)} style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, border: `1.5px solid ${c.border}`, background: "transparent", color: c.text, borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = c.bgSec; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
                <button onClick={async () => {
                  for (const cardKey of selectedCardKeys) { await removeCardFromBinder(openBinderId!, cardKey); }
                  setOpenBinderCards(prev => prev.filter(id => !selectedCardKeys.has(id)));
                  setBinderCounts(prev => ({ ...prev, [openBinderId!]: Math.max((prev[openBinderId!] ?? selectedCardKeys.size) - selectedCardKeys.size, 0) }));
                  setBinderPreviewCards(prev => ({ ...prev, [openBinderId!]: (prev[openBinderId!] ?? []).filter(c => !selectedCardKeys.has(getCardKey(c))) }));
                  setSelectedCardKeys(new Set()); setSelectionMode(false); setBulkDeleteConfirm(false);
                }} style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, border: "none", background: "#ef4444", color: "white", borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>Remove</button>
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
            c={c}
            tc={tc}
            isDark={isDark}
          />
        )}
        {showScrollTop && !modalCard && donModalIndex < 0 && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: 32, left: "calc(50% + 35px)", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: c.bgTer, color: c.text, border: `1px solid ${c.border}`, cursor: "pointer", fontSize: 22, fontWeight: 700, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>↑</button>
        )}
      </div>
    );
  }

  // ── MAIN BINDER PAGE ─────────────────────────────────
  const totalOwned = ownedSet.size;
  const totalCards = allCards.length;

  return (
    <div suppressHydrationWarning style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70 }}>
      <Sidebar />

      <div style={{ padding: "32px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 0.95, color: c.text, marginBottom: 4 }}>Binder</h1>
            <p style={{ fontSize: 13, color: c.textSec }}>{totalOwned} of {totalCards} cards owned</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em", color: c.text }}>{totalCards === 0 ? 0 : Math.round((totalOwned / totalCards) * 100)}%</div>
            <div style={{ fontSize: 11, color: c.textTer }}>collection complete</div>
          </div>
        </div>
        <ProgressBar value={totalOwned} total={totalCards} color={tc.text.primary} />
        <div style={{ display: "flex", gap: 0, marginTop: 28, borderBottom: `0.5px solid ${c.border}` }}>
          {(["sets", "custom", "wishlist"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 0", marginRight: 24, fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: tab === t ? c.text : c.textTer, borderBottom: tab === t ? `1.5px solid ${c.text}` : "1.5px solid transparent", transition: "all 0.15s" }}>
              {t === "sets" ? "Set binders" : t === "custom" ? "My binders" : "My wishlist"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {tab === "sets" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
            {availableSets.map((setId) => {
              const setCards = cardsBySet[setId] ?? [];
              const ownedCount = setCards.filter(card => ownedSet.has(getCardKey(card))).length;
              const pct = setCards.length === 0 ? 0 : Math.round((ownedCount / setCards.length) * 100);
              return (
                <div key={setId} onClick={() => { savedScrollY.current = window.scrollY; setOpenSetId(setId); setOpenBinderId(null); setSetViewFilters({}); window.scrollTo(0, 0); }} style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: 28, cursor: "pointer", background: isDark ? `radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 35%), linear-gradient(180deg, ${tc.bg.secondary}, ${tc.bg.primary})` : tc.bg.secondary, border: `1px solid ${tc.border}`, boxShadow: isDark ? "0 10px 40px rgba(0,0,0,0.45)" : "0 10px 30px rgba(0,0,0,0.06)", transition: "all 0.25s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px) scale(1.015)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}>
                  <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: `${tc.accent}22`, filter: "blur(80px)", top: -120, right: -80, pointerEvents: "none" }} />
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: c.textTer, marginBottom: 16, fontWeight: 600 }}>{setId}</div>
                  <div style={{ fontSize: 34, lineHeight: 0.95, fontWeight: 800, letterSpacing: "-0.06em", color: c.text, marginBottom: 28, maxWidth: 220 }}>{SET_NAMES[setId] ?? setId}</div>
                  <div style={{ position: "relative", height: 150, marginBottom: 30 }}>
                    {setCards.slice(0, 4).map((card, i) => (
                      <div key={i} style={{ position: "absolute", left: `${i * 52}px`, top: i % 2 === 0 ? 0 : 10, width: 92, height: 132, borderRadius: 14, overflow: "hidden", background: tc.bg.tertiary, border: `1px solid ${tc.border}`, transform: `rotate(${i % 2 === 0 ? "-5deg" : "5deg"})`, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
                        {card.images?.small && <img src={card.images.small} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: c.text }}>{pct}%</div>
                        <div style={{ fontSize: 13, color: c.textTer, marginTop: 2 }}>collection complete</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>{ownedCount} / {setCards.length}</div>
                        <div style={{ fontSize: 12, color: c.textTer, marginTop: 2 }}>cards collected</div>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: 10, borderRadius: 999, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.06)" : tc.bg.tertiary }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: pct === 100 ? "linear-gradient(90deg,#22c55e,#4ade80)" : `linear-gradient(90deg,${tc.accent},${tc.accent}aa)`, boxShadow: pct === 100 ? "0 0 20px rgba(34,197,94,0.5)" : `0 0 24px ${tc.accent}66`, transition: "all 0.4s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "custom" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              {creatingBinder ? (
                <div style={{ display: "flex", gap: 10, padding: 18, borderRadius: 24, maxWidth: 420, background: tc.bg.secondary, border: `1px solid ${tc.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }}>
                  <input autoFocus value={newBinderName} onChange={(e) => setNewBinderName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleCreateBinder(); if (e.key === "Escape") { setCreatingBinder(false); setNewBinderName(""); } }} placeholder="My legendary collection..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: c.text, fontFamily: "inherit" }} />
                  <button onClick={() => { setCreatingBinder(false); setNewBinderName(""); }} style={{ width: 38, height: 38, borderRadius: 999, border: "none", cursor: "pointer", background: isDark ? "rgba(255,255,255,0.06)" : tc.bg.tertiary, color: c.textTer, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={16} /></button>
                  <button onClick={handleCreateBinder} style={{ width: 38, height: 38, borderRadius: 999, border: "none", cursor: "pointer", background: `linear-gradient(90deg,${tc.accent},${tc.accent}cc)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={16} /></button>
                </div>
              ) : (
                <button onClick={() => setCreatingBinder(true)} style={{ padding: "16px 22px", borderRadius: 999, border: "none", cursor: "pointer", background: `linear-gradient(90deg,${tc.accent},${tc.accent}bb)`, color: "#fff", fontSize: 14, fontWeight: 600, boxShadow: `0 10px 30px ${tc.accent}55`, transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px)"; }}>
                  + Create Binder
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
              {binders.map((binder) => {
                const binderCards = binderPreviewCards[binder.id] ?? [];
                return (
                  <div key={binder.id} onClick={() => { if (renamingId !== binder.id) { savedScrollY.current = window.scrollY; setOpenBinderId(binder.id); window.scrollTo(0, 0); } }} style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: 28, cursor: "pointer", background: isDark ? `radial-gradient(circle at top right, ${tc.accent}22, transparent 35%), linear-gradient(180deg, ${tc.bg.secondary}, ${tc.bg.primary})` : tc.bg.secondary, border: `1px solid ${tc.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.35)", transition: "all 0.25s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px) scale(1.015)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}>
                    <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: `${tc.accent}22`, filter: "blur(90px)", top: -120, right: -80, pointerEvents: "none" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                      <div>
                        {renamingId === binder.id ? (
                          <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleRenameBinder(binder.id); if (e.key === "Escape") setRenamingId(null); }} onClick={(e) => e.stopPropagation()} style={{ background: "transparent", border: "none", outline: "none", fontSize: 28, fontWeight: 800, letterSpacing: "-0.05em", color: c.text, fontFamily: "inherit" }} />
                        ) : (
                          <>
                            <div style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: c.textTer, marginBottom: 10 }}>Custom Binder</div>
                            <div style={{ fontSize: 32, lineHeight: 0.95, fontWeight: 800, letterSpacing: "-0.06em", color: c.text, maxWidth: 220 }}>{binder.name}</div>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); setRenamingId(binder.id); setRenameValue(binder.name); }} style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : tc.bg.tertiary, color: c.textTer, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(binder.id); }} style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: 150, marginBottom: 30 }}>
                      {binderCards.length > 0 ? binderCards.map((card, i) => (
                        <div key={i} style={{ position: "absolute", left: `${i * 54}px`, top: i % 2 === 0 ? 0 : 10, width: 92, height: 132, borderRadius: 14, overflow: "hidden", background: tc.bg.tertiary, border: `1px solid ${tc.border}`, transform: `rotate(${i % 2 === 0 ? "-5deg" : "5deg"})`, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
                          {card.images?.small && <img src={card.images.small} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                      )) : (
                        <div style={{ height: "100%", borderRadius: 22, border: `1px dashed ${tc.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textTer, fontSize: 14 }}>No cards yet</div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: c.text }}>{binderCounts[binder.id] ?? 0}</div>
                        <div style={{ fontSize: 13, color: c.textTer, marginTop: 2 }}>cards collected</div>
                      </div>
                      <div style={{ fontSize: 13, color: c.textTer }}>Open Binder →</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {binders.length === 0 && !creatingBinder && (
              <div style={{ textAlign: "center", padding: "50px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src="/no-binder.png" alt="No custom binders" style={{ width: 200, height: 200, borderBottom: "solid 1px", opacity: isDark ? 0.92 : 1 }} />
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: c.text, marginBottom: 8 }}>No custom binders yet</div>
                <div style={{ fontSize: 14, color: c.textTer }}>Build your own themed collections.</div>
              </div>
            )}
          </div>
        )}
      </div>

        {tab === "wishlist" && (() => {
          const wishlistCards = sortByCardId(allCards.filter(card => wishlistSet.has(getCardKey(card))));
          return wishlistCards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>★</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em", color: c.text, marginBottom: 8 }}>No wishlist cards yet</div>
              <div style={{ fontSize: 14, color: c.textTer }}>Add cards to your wishlist from the browse page.</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: c.textTer }}><strong style={{ color: c.text }}>{wishlistCards.length}</strong> card{wishlistCards.length !== 1 ? "s" : ""} on your wishlist</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 22 }}>
                {wishlistCards.map((card, i) => {
                  const cardKey = getCardKey(card);
                  return (
                    <div key={`${cardKey}||${i}`} style={{ position: "relative" }}>
                      <div
                        onClick={() => { setModalCards(wishlistCards); setModalIndex(i); setModalCard(card); }}
                        style={{ borderRadius: 16, overflow: "hidden", border: `1px solid #f59e0b`, background: c.bgSec, boxShadow: "0 10px 25px rgba(245,158,11,0.15)", cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 32px rgba(245,158,11,0.25)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(245,158,11,0.15)"; }}
                      >
                        <div style={{ aspectRatio: "63/88", overflow: "hidden" }}>
                          <img src={card.images?.small || "/card-placeholder.png"} alt={card.name} style={{ width: "100%", height: "100%", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                        </div>
                      </div>
                      <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>★</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: c.textSec, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                      <div style={{ fontSize: 11, color: c.textTer, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.set?.name?.match(/\[([^\]]+)\]/)?.[1] ?? card.set?.name ?? ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      {deleteConfirmId && (
        <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDeleteConfirmId(null)}>
          <div style={{ background: c.bg, borderRadius: 16, padding: 32, width: "100%", maxWidth: 320, boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.2)", border: `1px solid ${c.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: c.text, marginBottom: 8 }}>Delete binder?</div>
              <div style={{ fontSize: 14, color: c.textSec }}>"{binders.find(b => b.id === deleteConfirmId)?.name}" will be permanently deleted.</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, border: `1.5px solid ${c.border}`, background: "transparent", color: c.text, borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = c.bgSec; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
              <button onClick={() => { handleDeleteBinder(deleteConfirmId); setDeleteConfirmId(null); }} style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, border: "none", background: "#ef4444", color: "white", borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}