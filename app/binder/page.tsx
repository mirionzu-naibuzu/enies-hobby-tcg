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
  getCardKey, getDonCardKey,
  type UserCard, type Binder,
} from "@/lib/binder";
import AuthModal from "@/components/AuthModal";
import { useTheme } from "next-themes";
import Image from "next/image";
import { getColors } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { SET_ORDER, SET_NAMES } from "@/lib/sets";
import { getAllDonCards } from "@/lib/api";
import ModalCardImage from "@/components/ModalCardImage";
import { Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, CheckSquare, SlidersHorizontal, Plus, ArrowRight, BookOpen, Star, Search } from "lucide-react";

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
const FILTER_COLORS   = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
const FILTER_TYPES    = ["LEADER", "CHARACTER", "EVENT", "STAGE"];
const FILTER_RARITIES = ["SEC", "SR", "R", "UC", "C", "P", "TR"];

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

  const themeVars = useMemo(
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

  return (
    <div
      suppressHydrationWarning
      className="dashboard-page dashboard-wrapper"
      style={themeVars}
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
        <section className="dashboard-arrival dashboard-auth-gate">
          <div className="dashboard-arrival-copy">
            <span className="dashboard-eyebrow">Collection Binder</span>
            <h1>Track your collection, mark cards as owned, and build custom binders.</h1>
            <p>
              Sign in to track your collection progress in real-time, mark cards as owned, build custom binders, and manage your chase wishlist.
            </p>
            <div className="dashboard-arrival-actions">
              <button
                type="button"
                className="dashboard-button dashboard-button-primary"
                onClick={onSignIn}
              >
                Sign in
              </button>
              <button
                type="button"
                className="dashboard-button dashboard-button-secondary"
                onClick={onSignUp}
              >
                Create free account
              </button>
            </div>
          </div>
          <div className="dashboard-arrival-mark" aria-hidden="true">
            <BookOpen size={42} strokeWidth={1.75} />
          </div>
        </section>
      </main>
    </div>
  );
}

function ProgressBar({ value, total, color = "#111827" }: { value: number; total: number; color?: string }) {
  const pct = total === 0 ? 0 : Math.floor((value / total) * 100);
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
    <div className="card-modal-outer" style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => { setModalCard(null); setShowOwnershipPicker(false); }}>
      <div className="card-modal-nav-row" style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
        {(!isMobile || isLandscape) && (
          <button className="card-modal-prev" onClick={() => { const i = Math.max(modalIndex - 1, 0); setModalIndex(i); setModalCard(modalCards[i]); setShowOwnershipPicker(false); }} disabled={modalIndex <= 0} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: modalIndex > 0 ? "pointer" : "not-allowed", opacity: modalIndex <= 0 ? 0.3 : 1, transition: "all 0.2s", boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div
          className="card-modal-container"
          onTouchStart={handleModalTouchStart}
          onTouchEnd={handleModalTouchEnd}
          style={{ flex: 1, background: c.bg, borderRadius: 20, border: `1px solid ${c.border}`, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)" }}
        >
          <div className="card-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, color: c.text, letterSpacing: "-0.02em" }}>{modalCard.name}</div>
              <div style={{ fontSize: 12, color: c.textTer, fontFamily: "monospace", marginTop: 2 }}>{isDon ? "DON!!" : modalCard.id}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isDon ? (
                <button
                  className="card-modal-btn"
                  onClick={() => onToggleWishlist(cardKey)}
                  title={wished ? "Wishlist" : "Add to wishlist"}
                  aria-label={wished ? "Wishlist" : "Add to wishlist"}
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
                    border: `1px solid ${wished ? "#f59e0b" : c.border}`,
                    background: wished
                      ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)")
                      : "transparent",
                    color: wished ? "#d97706" : c.textTer,
                  }}
                >
                  <Star size={13} fill={wished ? "currentColor" : "none"} />
                  {!isMobile && (
                    <span className="card-modal-btn-label">
                      {wished ? "Wishlist" : "Add to wishlist"}
                    </span>
                  )}
                </button>
              ) : (
                <div style={{ position: "relative" }}>
                  <button
                    className="card-modal-btn"
                    onClick={() => setShowOwnershipPicker(p => !p)}
                    title={owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
                    aria-label={owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
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
                      border: `1px solid ${owned ? "#16a34a" : wished ? "#f59e0b" : c.border}`,
                      background: owned ? (isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)") : wished ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)") : "transparent",
                      color: owned ? "#16a34a" : wished ? "#d97706" : c.textTer }}
                  >
                    {owned ? <Check size={13} /> : wished ? <Star size={13} fill="currentColor" /> : null}
                    {!isMobile && (
                      <span className="card-modal-btn-label">
                        {owned ? "Owned" : wished ? "Wishlist" : "Not owned"}
                      </span>
                    )}
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
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${wished ? "#d97706" : c.border}`, background: wished ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {wished && <Star size={10} fill="#fff" color="#fff" />}
                          </div>
                          Add to wishlist
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => { setModalCard(null); setShowOwnershipPicker(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={c.textTer} /></button>
            </div>
          </div>
          <div className="card-modal-body" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
            <div className="card-modal-image-pane" style={{ width: "48%", flexShrink: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px 24px 28px" }}>
              <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
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
            <div className="card-modal-details-pane" style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "24px 28px 24px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card-modal-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([["Type", modalCard.type], ["Rarity", modalCard.rarity?.replace(/^PR$/i, "P")], ["Color", modalCard.color], ["Cost", modalCard.cost], ["Power", modalCard.power], ["Counter", modalCard.counter], ["Attribute", modalCard.attribute?.name], ["Family", modalCard.family], ["Set", modalCard.set?.name]] as [string, unknown][]).filter(([, v]) => v != null && v !== "" && v !== "-").map(([label, value]) => (
                  <div key={String(label)} style={{ background: c.bgSec, borderRadius: 10, padding: "10px 14px", border: `1px solid ${c.border}`, minWidth: 0, gridColumn: label === "Set" ? "1 / -1" : undefined }}>
                    <div style={{ fontSize: 11, color: c.textTer, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: c.text, lineHeight: 1.4, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                      {label === "Family" && typeof value === "string" && value.includes("/") ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {value.split("/").map((part, idx) => (
                            <div key={idx} style={{ lineHeight: 1.35 }}>{part.trim()}</div>
                          ))}
                        </div>
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {modalCard.ability && (<div style={{ background: c.bgSec, borderRadius: 10, padding: "12px 14px", border: `1px solid ${c.border}`, wordBreak: "break-word", overflowWrap: "break-word" }}><div style={{ fontSize: 11, color: c.textTer, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Effect</div><div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>{modalCard.ability}</div></div>)}
              {modalCard.trigger && modalCard.trigger !== "" && (<div style={{ background: isDark ? "rgba(217,119,6,0.1)" : "rgba(251,191,36,0.08)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${isDark ? "rgba(217,119,6,0.2)" : "rgba(251,191,36,0.2)"}`, wordBreak: "break-word", overflowWrap: "break-word" }}><div style={{ fontSize: 11, color: isDark ? "#fbbf24" : "#d97706", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Trigger</div><div style={{ fontSize: 14, color: c.text, lineHeight: 1.7 }}>{modalCard.trigger}</div></div>)}
            </div>
          </div>
          <div className="card-modal-footer" style={{ borderTop: `1px solid ${c.border}`, padding: "10px 24px", textAlign: "center", fontSize: 12, color: c.textTer, flexShrink: 0 }}>{modalIndex + 1} / {modalCards.length}</div>
        </div>
        {(!isMobile || isLandscape) && (
          <button className="card-modal-next" onClick={() => { const i = Math.min(modalIndex + 1, modalCards.length - 1); setModalIndex(i); setModalCard(modalCards[i]); setShowOwnershipPicker(false); }} disabled={modalIndex >= modalCards.length - 1} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, cursor: modalIndex < modalCards.length - 1 ? "pointer" : "not-allowed", opacity: modalIndex >= modalCards.length - 1 ? 0.3 : 1, transition: "all 0.2s", boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
            <ChevronRight size={20} />
          </button>
        )}
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
    <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
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
          {/* Body — ModalCardImage with don-back.png */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 320 }}>
            <ModalCardImage
              key={card.card_image || card.card_name || index}
              src={card.card_image || "/card-placeholder.png"}
              alt={card.card_name}
              isDark={isDark}
              backSrc="/don-back.png"
            />
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
    colors?: string[]; type?: string; rarity?: string; spOnly?: boolean; owned?: "owned" | "not_owned";
  }>({});
  const [binderFiltersOpen, setBinderFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  //scroll lock
  useBodyScrollLock(!!modalCard || donModalIndex >= 0 || binderFiltersOpen);

  useEffect(() => { setMounted(true); }, []);

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
    if (!user) return;
    setLoadingData(true);
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
            .filter(card => keys.includes(getDonCardKey(card)))
            .map(card => ({ ...card, images: { small: card.card_image || "/card-placeholder.png", large: card.card_image || "/card-placeholder.png" } }));
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
    <div className="binder-wrapper" style={{ minHeight: "100vh", background: tc.bg.primary, marginLeft: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 13, color: tc.text.tertiary }}>Loading...</div>
    </div>
  );

  if (!user) return (
    <>
      <AuthGate onSignIn={() => { setAuthMode("login"); setShowAuthModal(true); }} onSignUp={() => { setAuthMode("signup"); setShowAuthModal(true); }} />
      {showAuthModal && <AuthModal initialMode={authMode} onClose={() => setShowAuthModal(false)} />}
    </>
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

    const chipStyle = (active: boolean) => ({
      paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4,
      borderRadius: 9999 as const, fontSize: 12, fontWeight: 600, cursor: "pointer" as const,
      whiteSpace: "nowrap" as const, transition: "all 0.2s",
      border: `1px solid ${active ? (isDark ? "#f3f4f6" : "#111827") : c.border}`,
      background: active ? (isDark ? "#f3f4f6" : "#111827") : "transparent",
      color: active ? (isDark ? "#111827" : "#ffffff") : c.textTer,
    });

    return (
      <div suppressHydrationWarning className="binder-wrapper" style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70 }}>
        <style>{FLIP_STYLE}</style>
        <Sidebar />

        <div className="binder-set-header" style={{ padding: "20px 32px", borderBottom: `0.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: c.bg, zIndex: 20 }}>
        <button onClick={() => { setOpenSetId(null); setBinderFiltersOpen(false); window.scrollTo(0, savedScrollY.current); }} title="Back" style={{ background: "none", border: "none", cursor: "pointer", color: c.textSec, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0 }}>
          <ChevronLeft size={20} />
          </button>
          <div style={{ width: "0.5px", height: 16, background: c.border, flexShrink: 0 }} />
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{openSetId} · {SET_NAMES[openSetId] ?? openSetId}</span>
            <span style={{ fontSize: 13, color: c.textTer, marginLeft: 10 }}>{totalSetOwned} / {allSetCards.length} · {totalSetPct}%</span>
          </div>
          <div className="binder-set-progress-wrap" style={{ flex: 1, maxWidth: 200, marginLeft: "auto" }}>
            <ProgressBar value={totalSetOwned} total={allSetCards.length} color={tc.text.primary} />
          </div>
        </div>

        {/* Desktop FilterBar in Set view — only rendered on desktop screens */}
        {!isMobile && (
          <div className="desktop-filterbar">
            <div style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              {/* Color */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Color</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
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
              {/* Type */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {FILTER_TYPES.map(t => <button key={t} onClick={() => setSetViewFilters(f => ({ ...f, type: f.type === t ? undefined : t }))} style={chipStyle(setViewFilters.type === t)}>{t}</button>)}
                </div>
              </div>
              {/* Rarity */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rarity</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {FILTER_RARITIES.map(r => <button key={r} onClick={() => setSetViewFilters(f => ({ ...f, rarity: f.rarity === r ? undefined : r }))} style={chipStyle(setViewFilters.rarity === r)}>{r}</button>)}
                  <button onClick={() => setSetViewFilters(f => ({ ...f, spOnly: !f.spOnly }))} style={chipStyle(!!setViewFilters.spOnly)}>SP</button>
                </div>
              </div>
              {/* Show */}
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
          </div>
        )}

        {/* Mobile Floating Slide-Down Filter Drawer in Set view */}
        {isMobile && binderFiltersOpen && (
          <>
            <div
              className="filter-drawer-backdrop"
              onClick={() => setBinderFiltersOpen(false)}
              style={{
                position: "fixed",
                top: 112,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                zIndex: 25,
              }}
            />
            <div
              className="binder-mobile-drawer"
              style={{
                position: "fixed",
                top: 112,
                left: 0,
                right: 0,
                zIndex: 30,
                background: c.bg,
                borderBottom: `1px solid ${c.border}`,
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
                maxHeight: "calc(80vh - 112px)",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                {/* Color */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Color</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
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
                          style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer", background: isMulti ? "conic-gradient(from 180deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #000000, #ef4444)" : COLOR_DOT[color], outline: active ? `3px solid ${isMulti ? "#808080" : COLOR_DOT[color]}` : "none", outlineOffset: 2, opacity: dimmed ? 0.35 : 1, transform: active ? "scale(1.15)" : "scale(1)", transition: "all 0.2s" }}
                        />
                      );
                    })}
                  </div>
                </div>
                {/* Type */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {FILTER_TYPES.map(t => <button key={t} onClick={() => setSetViewFilters(f => ({ ...f, type: f.type === t ? undefined : t }))} style={chipStyle(setViewFilters.type === t)}>{t}</button>)}
                  </div>
                </div>
                {/* Rarity */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rarity</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    {FILTER_RARITIES.map(r => <button key={r} onClick={() => setSetViewFilters(f => ({ ...f, rarity: f.rarity === r ? undefined : r }))} style={chipStyle(setViewFilters.rarity === r)}>{r}</button>)}
                    <button onClick={() => setSetViewFilters(f => ({ ...f, spOnly: !f.spOnly }))} style={chipStyle(!!setViewFilters.spOnly)}>SP</button>
                  </div>
                </div>
                {/* Show */}
                {!allSetOwned && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>Show</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "owned" ? undefined : "owned" }))} style={{ ...chipStyle(setViewFilters.owned === "owned"), border: `1px solid ${setViewFilters.owned === "owned" ? "#16a34a" : c.border}`, background: setViewFilters.owned === "owned" ? "#16a34a" : "transparent", color: setViewFilters.owned === "owned" ? "#fff" : c.textTer }}>Owned</button>
                      <button onClick={() => setSetViewFilters(f => ({ ...f, owned: f.owned === "not_owned" ? undefined : "not_owned" }))} style={{ ...chipStyle(setViewFilters.owned === "not_owned"), border: `1px solid ${setViewFilters.owned === "not_owned" ? (isDark ? "#f3f4f6" : "#111827") : c.border}`, background: setViewFilters.owned === "not_owned" ? (isDark ? "#f3f4f6" : "#111827") : "transparent", color: setViewFilters.owned === "not_owned" ? (isDark ? "#111827" : "#fff") : c.textTer }}>Not owned</button>
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: "8px 16px 14px",
                  background: c.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {hasActiveFilters ? (
                  <button
                    onClick={() => setSetViewFilters({})}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: c.textTer,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    Reset all
                  </button>
                ) : <div />}
                <button
                  onClick={() => setBinderFiltersOpen(false)}
                  style={{
                    padding: "6px 18px",
                    borderRadius: 8,
                    background: c.text,
                    color: c.bg,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 14, color: c.textTer }}>Showing <strong style={{ color: c.text }}>{setCards.length}</strong> {setCards.length === 1 ? "card" : "cards"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {hasActiveFilters && (
              <button onClick={() => setSetViewFilters({})} style={{ fontSize: 12, color: tc.accent, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
                <X style={{ width: 12, height: 12 }} /> Clear filters
              </button>
            )}
            {isMobile && (
              <button
                className="binder-filter-toggle"
                onClick={() => setBinderFiltersOpen(prev => !prev)}
                title={binderFiltersOpen ? "Hide filters" : "Show filters"}
                style={{
                  position: "relative",
                  padding: 6,
                  borderRadius: 8,
                  border: `1px solid ${
                    binderFiltersOpen || activeSetFilterCount > 0
                      ? c.text
                      : c.border
                  }`,
                  background: binderFiltersOpen || activeSetFilterCount > 0
                    ? c.bgSec
                    : "transparent",
                  color: binderFiltersOpen || activeSetFilterCount > 0
                    ? c.text
                    : c.textTer,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                <SlidersHorizontal size={16} />
                {activeSetFilterCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: tc.accent,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                    }}
                  >
                    {activeSetFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="binder-card-grid" style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 22 }}>
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
                    <div onClick={() => { setModalCards(setCards); setModalIndex(i); setModalCard(setCards[i]); }} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${owned ? (isDark ? "#4ade80" : "#16a34a") : c.border}`, background: c.bgSec, boxShadow: owned ? "0 10px 30px rgba(34,197,94,0.15)" : "0 10px 25px rgba(0,0,0,0.25)", transition: "all 0.25s ease", opacity: owned ? 1 : 0.55, cursor: "pointer" }}>
                      <div style={{ aspectRatio: "5 / 7", overflow: "hidden", position: "relative" }}>
                        <Image src={card.images?.small || "/card-placeholder.png"} alt={card.name} fill sizes="(max-width: 540px) 45vw, (max-width: 1024px) 22vw, 175px" style={{ objectFit: "cover" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                      </div>
                    </div>
                    {wished && !owned && (i >= 18 || flipDone) && (
                      <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                        <Star size={11} fill="#fff" color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {setCards.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: c.bgSec, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: c.textTer }}>
                <Search size={26} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No cards match these filters</div>
              <div style={{ fontSize: 13, color: c.textTer }}>Try adjusting or resetting your filter criteria.</div>
              <button onClick={() => setSetViewFilters({})} style={{ marginTop: 14, fontSize: 13, color: tc.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: "4px 8px" }}>Clear filters</button>
            </div>
          )}
        </div>

        {modalCard && <CardModal modalCard={modalCard} modalIndex={modalIndex} modalCards={modalCards} setModalCard={setModalCard} setModalIndex={setModalIndex} c={c} tc={tc} isDark={isDark} ownedSet={ownedSet} wishlistSet={wishlistSet} onToggleOwned={handleToggleOwned} onToggleWishlist={handleToggleWishlist} />}
        {showScrollTop && !modalCard && (
          <button className="binder-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: c.bgTer, color: c.text, border: `1px solid ${c.border}`, cursor: "pointer", fontSize: 22, fontWeight: 700, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>↑</button>
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
      .filter(card => binderCardSet.has(getDonCardKey(card)))
      .map(card => ({ ...card, images: { small: card.card_image || "/card-placeholder.png", large: card.card_image || "/card-placeholder.png" }, id: card.card_name, name: card.card_name, set: { name: "DON!!" } }));
    const binderCardList = [...sortByCardId(regularBinderCards), ...donBinderCards] as Card[];

    return (
      <div suppressHydrationWarning className="binder-wrapper" style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70 }}>
        <style>{FLIP_STYLE}</style>
        <Sidebar />

        <div className="binder-custom-header" style={{ padding: "16px 28px", borderBottom: `0.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: c.bg, zIndex: 20 }}>
          <button onClick={() => { setOpenBinderId(null); window.scrollTo(0, savedScrollY.current); }} title="Back" style={{ background: "none", border: "none", cursor: "pointer", color: c.textSec, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0 }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ width: "0.5px", height: 16, background: c.border, flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden", flex: "1 1 auto" }}>
            <span style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, letterSpacing: "-0.02em", color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{binder?.name}</span>
            <span style={{ fontSize: 13, color: c.textTer, whiteSpace: "nowrap", flexShrink: 0 }}>· {openBinderCards.length} {openBinderCards.length === 1 ? "card" : "cards"}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {selectionMode && selectedCardKeys.size > 0 && (
              <button title={`Remove ${selectedCardKeys.size} cards`} onClick={() => setBulkDeleteConfirm(true)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
                <Trash2 size={15} />
              </button>
            )}
            <button title={selectionMode ? "Cancel selection" : "Select cards"} onClick={() => { setSelectionMode(p => !p); setSelectedCardKeys(new Set()); }} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${selectionMode ? tc.accent : c.border}`, cursor: "pointer", background: selectionMode ? `${tc.accent}18` : "transparent", color: selectionMode ? tc.accent : c.textTer, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <CheckSquare size={15} />
            </button>
            <button title="Browse cards" onClick={() => router.push("/browse")} style={{ padding: isMobile ? "7px 12px" : "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tc.accent, color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "opacity 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
              <span>{isMobile ? "Browse" : "Browse cards"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {loadingBinderCards ? (
          <div style={{ padding: "32px" }} />
        ) : (
          <div className="binder-card-grid" style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 22 }}>
            {binderCardList.map((card, i) => {
              const isDonCard = card.set?.name === "DON!!";
              const cardKey = isDonCard ? getDonCardKey(card as any) : getCardKey(card);
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
                      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${isSelected ? tc.accent : c.border}`, background: c.bgSec, boxShadow: isSelected ? `0 0 0 2px ${tc.accent}` : "0 10px 25px rgba(0,0,0,0.25)", transition: "all 0.2s ease", opacity: selectionMode && !isSelected ? 0.5 : 1, cursor: selectionMode ? "pointer" : "default" }}>
                        <div style={{ aspectRatio: "5 / 7", overflow: "hidden" }}>
                          <img src={card.images?.small || "/card-placeholder.png"} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
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
          <button className="binder-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: c.bgTer, color: c.text, border: `1px solid ${c.border}`, cursor: "pointer", fontSize: 22, fontWeight: 700, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>↑</button>
        )}
      </div>
    );
  }

  // ── MAIN BINDER PAGE ─────────────────────────────────
  const totalOwned = ownedSet.size;
  const totalCards = allCards.length;

  return (
    <div suppressHydrationWarning className="binder-wrapper" style={{ minHeight: "100vh", background: c.bg, color: c.text, marginLeft: 70 }}>
      <Sidebar />

      <div style={{ padding: "32px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 0.95, color: c.text, marginBottom: 4 }}>Binder</h1>
            <p style={{ fontSize: 13, color: c.textSec }}>{totalOwned} of {totalCards} cards owned</p>
          </div>
          <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em", color: c.text }}>{totalCards === 0 ? 0 : Math.floor((totalOwned / totalCards) * 100)}%</div>
            <div style={{ fontSize: 11, color: c.textTer }}>collection complete</div>
          </div>
        </div>
        <ProgressBar value={totalOwned} total={totalCards} color={tc.text.primary} />
        <div className="binder-tabs" style={{ display: "flex", gap: 0, marginTop: 28, borderBottom: `0.5px solid ${c.border}` }}>
          {(["sets", "custom", "wishlist"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "12px 0", marginRight: 24, fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: tab === t ? c.text : c.textTer, borderBottom: tab === t ? `1.5px solid ${c.text}` : "1.5px solid transparent", transition: "all 0.15s" }}>
              {t === "sets" ? "Set binders" : t === "custom" ? "My binders" : "My wishlist"}
            </button>
          ))}
        </div>
      </div>

      <div className="binder-content-wrap" style={{ padding: "24px 32px" }}>
        {tab === "sets" && (
          <div className="binder-sets-grid" style={{ display: "grid", gap: 24 }}>
            {availableSets.map((setId) => {
              const setCards = cardsBySet[setId] ?? [];
              const ownedCount = setCards.filter(card => ownedSet.has(getCardKey(card))).length;
              const pct = setCards.length === 0 ? 0 : Math.floor((ownedCount / setCards.length) * 100);
              return (
                <div key={setId} className="binder-deck-card" onClick={() => { savedScrollY.current = window.scrollY; setOpenSetId(setId); setOpenBinderId(null); setSetViewFilters({}); window.scrollTo(0, 0); }} style={{ position: "relative", overflow: "hidden", borderRadius: 24, padding: "26px 26px", cursor: "pointer", background: isDark ? `radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 35%), linear-gradient(180deg, ${tc.bg.secondary}, ${tc.bg.primary})` : tc.bg.secondary, border: `1px solid ${tc.border}`, boxShadow: isDark ? "0 10px 40px rgba(0,0,0,0.45)" : "0 10px 30px rgba(0,0,0,0.06)", transition: "all 0.25s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px) scale(1.015)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}>
                  <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: `${tc.accent}22`, filter: "blur(80px)", top: -120, right: -80, pointerEvents: "none" }} />
                  <div className="binder-set-code" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: c.textTer, marginBottom: 8, fontWeight: 600 }}>{setId}</div>
                  <div className="binder-set-title" style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em", color: c.text, marginBottom: 20, maxWidth: "100%" }}>{SET_NAMES[setId] ?? setId}</div>
                  <div className="binder-mini-cards-wrap" style={{ position: "relative", height: 140, marginBottom: 24 }}>
                    {setCards.slice(0, 4).map((card, i) => (
                      <div key={i} className="binder-mini-card" style={{ position: "absolute", left: `${i * 48}px`, top: i % 2 === 0 ? 0 : 8, width: 86, height: 122, borderRadius: 12, overflow: "hidden", background: tc.bg.tertiary, border: `1px solid ${tc.border}`, transform: `rotate(${i % 2 === 0 ? "-5deg" : "5deg"})`, boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}>
                        {card.images?.small && <img src={card.images.small} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="binder-stats-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                      <div>
                        <div className="binder-pct-text" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: c.text }}>{pct}%</div>
                        <div className="binder-stat-subtext" style={{ fontSize: 12, color: c.textTer, marginTop: 2 }}>collection complete</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="binder-count-text" style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{ownedCount} / {setCards.length}</div>
                        <div className="binder-stat-subtext" style={{ fontSize: 12, color: c.textTer, marginTop: 2 }}>cards collected</div>
                      </div>
                    </div>
                    <div className="binder-progress-bar" style={{ position: "relative", height: 6, borderRadius: 999, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.06)" : tc.bg.tertiary }}>
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
              {!isMobile && (
                <div style={{ marginBottom: 28 }}>
                  <button 
                    onClick={() => setCreatingBinder(true)} 
                  style={{ 
                    padding: "16px 22px", 
                    borderRadius: 999, 
                    border: "none", 
                    cursor: "pointer", 
                    background: `linear-gradient(90deg,${tc.accent},${tc.accent}bb)`, 
                    color: "#fff", 
                    fontSize: 14, 
                    fontWeight: 600, 
                    boxShadow: `0 10px 30px ${tc.accent}55`, 
                    transition: "all 0.2s ease" 
                  }} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }} 
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px)"; }}
                >
                  <Plus size={16} style={{ display: "inline-block", marginRight: 8, verticalAlign: "-3px" }} />
                  Create Binder
                </button>
                </div>
              )}

            <div className="binder-sets-grid" style={{ display: "grid", gap: 24 }}>
              {binders.map((binder) => {
                const binderCards = binderPreviewCards[binder.id] ?? [];
                return (
                  <div key={binder.id} className="binder-deck-card" onClick={() => { if (renamingId !== binder.id) { savedScrollY.current = window.scrollY; setOpenBinderId(binder.id); window.scrollTo(0, 0); } }} style={{ position: "relative", overflow: "hidden", borderRadius: 24, padding: "26px 26px", cursor: "pointer", background: isDark ? `radial-gradient(circle at top right, ${tc.accent}22, transparent 35%), linear-gradient(180deg, ${tc.bg.secondary}, ${tc.bg.primary})` : tc.bg.secondary, border: `1px solid ${tc.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.35)", transition: "all 0.25s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px) scale(1.015)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px) scale(1)"; }}>
                    <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: `${tc.accent}22`, filter: "blur(90px)", top: -120, right: -80, pointerEvents: "none" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div>
                        {renamingId === binder.id ? (
                          <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleRenameBinder(binder.id); if (e.key === "Escape") setRenamingId(null); }} onClick={(e) => e.stopPropagation()} style={{ background: "transparent", border: "none", outline: "none", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: c.text, fontFamily: "inherit" }} />
                        ) : (
                          <>
                            <div className="binder-set-code" style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: c.textTer, marginBottom: 8, fontWeight: 600 }}>Custom Binder</div>
                            <div className="binder-set-title" style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em", color: c.text, maxWidth: "100%" }}>{binder.name}</div>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); setRenamingId(binder.id); setRenameValue(binder.name); }} style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : tc.bg.tertiary, color: c.textTer, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(binder.id); }} style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="binder-mini-cards-wrap" style={{ position: "relative", height: 140, marginBottom: 24 }}>
                      {binderCards.length > 0 ? binderCards.map((card, i) => (
                        <div key={i} className="binder-mini-card" style={{ position: "absolute", left: `${i * 48}px`, top: i % 2 === 0 ? 0 : 8, width: 86, height: 122, borderRadius: 12, overflow: "hidden", background: tc.bg.tertiary, border: `1px solid ${tc.border}`, transform: `rotate(${i % 2 === 0 ? "-5deg" : "5deg"})`, boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}>
                          {card.images?.small && <img src={card.images.small} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                      )) : (
                        <div style={{ height: "100%", borderRadius: 16, border: `1px dashed ${tc.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textTer, fontSize: 14 }}>No cards yet</div>
                      )}
                    </div>
                    <div className="binder-stats-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div className="binder-pct-text" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: c.text }}>{binderCounts[binder.id] ?? 0}</div>
                        <div className="binder-stat-subtext" style={{ fontSize: 12, color: c.textTer, marginTop: 2 }}>cards collected</div>
                      </div>
                      <div className="binder-stat-subtext" style={{ fontSize: 12, color: c.textTer, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span>Open Binder</span>
                        <ArrowRight size={13} />
                      </div>
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
            }));
          const wishlistCards = [...sortByCardId(regularWishlistCards), ...donWishlistCards] as Card[];
          return wishlistCards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#f59e0b" }}>
                <Star size={30} fill="#f59e0b" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em", color: c.text, marginBottom: 8 }}>No wishlist cards yet</div>
              <div style={{ fontSize: 14, color: c.textTer }}>Add cards to your wishlist from the browse page.</div>
            </div>
          ) : (
            <div className="binder-wishlist-wrap">
              <div className="binder-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 22 }}>
                {wishlistCards.map((card, i) => {
                  const cardKey = getCardKey(card);
                  return (
                    <div key={`${cardKey}||${i}`} style={{ position: "relative" }}>
                      <div
                        onClick={() => { setModalCards(wishlistCards); setModalIndex(i); setModalCard(card); }}
                        style={{ borderRadius: 14, overflow: "hidden", border: `1px solid #f59e0b`, background: c.bgSec, boxShadow: "0 10px 25px rgba(245,158,11,0.15)", cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 32px rgba(245,158,11,0.25)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(245,158,11,0.15)"; }}
                      >
                        <div style={{ aspectRatio: "5 / 7", overflow: "hidden" }}>
                          <img src={card.images?.small || "/card-placeholder.png"} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.currentTarget.src = "/card-placeholder.png"; }} />
                        </div>
                      </div>
                      <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                        <Star size={11} fill="#fff" color="#fff" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
      {modalCard && <CardModal modalCard={modalCard} modalIndex={modalIndex} modalCards={modalCards} setModalCard={setModalCard} setModalIndex={setModalIndex} c={c} tc={tc} isDark={isDark} ownedSet={ownedSet} wishlistSet={wishlistSet} onToggleOwned={handleToggleOwned} onToggleWishlist={handleToggleWishlist} />}
      
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

      {/* Mobile FAB for Create Binder */}
      {isMobile && tab === "custom" && (
        <button
          onClick={() => setCreatingBinder(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(90deg,${tc.accent},${tc.accent}bb)`,
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 10px 25px ${tc.accent}66`,
            cursor: "pointer",
            zIndex: 90,
          }}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Create Binder Modal */}
      {creatingBinder && (
        <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setCreatingBinder(false)}>
          <div style={{ background: c.bg, borderRadius: 24, padding: 24, width: "100%", maxWidth: 360, boxShadow: "0 25px 50px rgba(0,0,0,0.25)", border: `1px solid ${c.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 20, color: c.text, marginBottom: 16 }}>Create Binder</div>
            <input 
              autoFocus 
              value={newBinderName} 
              onChange={(e) => setNewBinderName(e.target.value)} 
              onKeyDown={(e) => { 
                if (e.key === "Enter") handleCreateBinder(); 
                if (e.key === "Escape") { setCreatingBinder(false); setNewBinderName(""); } 
              }} 
              placeholder="My legendary collection..." 
              style={{ width: "100%", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 16px", outline: "none", fontSize: 16, color: c.text, fontFamily: "inherit", marginBottom: 20 }} 
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => { setCreatingBinder(false); setNewBinderName(""); }} style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, border: "none", background: "transparent", color: c.textSec, cursor: "pointer", borderRadius: 8 }}>Cancel</button>
              <button onClick={handleCreateBinder} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, border: "none", background: tc.accent, color: "white", borderRadius: 8, cursor: "pointer" }}>Create</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}