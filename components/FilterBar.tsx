"use client";

import { useState, useEffect, useRef } from "react";
import { FilterParams } from "@/types/card";
import { useTheme } from "next-themes";
import { getColors } from "@/lib/themes";
import { SET_NAMES } from "@/lib/sets";
import { ChevronDown, Check } from "lucide-react";

const COLORS   = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
const CARD_TYPES = ["LEADER", "CHARACTER", "EVENT", "STAGE"];
const RARITIES = ["SEC", "SR", "R", "UC", "C", "P", "TR"];

const COLOR_DOT: Record<string, string> = {
  Red: "#ef4444", Green: "#22c55e", Blue: "#3b82f6",
  Purple: "#a855f7", Black: "#374151", Yellow: "#eab308",
};

type SetCategory = "booster" | "starter" | "extra_booster" | "premium_booster" | "limited_product";

const SET_TYPE_META: Record<SetCategory, { label: string; bg: string; border: string; text: string }> = {
  booster:         { label: "Booster Pack",    bg: "#1d4ed8", border: "#1d4ed8", text: "#ffffff" },
  starter:         { label: "Starter Deck",    bg: "#15803d", border: "#15803d", text: "#ffffff" },
  extra_booster:   { label: "Extra Booster",   bg: "#7c3aed", border: "#7c3aed", text: "#ffffff" },
  premium_booster: { label: "Premium Booster", bg: "#b45309", border: "#b45309", text: "#ffffff" },
  limited_product: { label: "Limited Product Card", bg: "#be185d", border: "#be185d", text: "#ffffff" },
};

function getSetCategory(setId: string): SetCategory | null {
  const id = setId.toUpperCase().replace(/-/g, "");

  if (id.startsWith("ST")) return "starter";
  if (id.startsWith("EB")) return "extra_booster";
  if (id.startsWith("PRB")) return "premium_booster";
  if (id.startsWith("P")) return null;

  return "booster";
}

function splitSetId(setId: string): string[] {
  const parts = setId.split("-");
  const isCombined = parts.length >= 2 && parts.every(p => /^[A-Za-z]{1,3}\d+$/.test(p));
  return isCombined ? parts : [setId];
}

function buildProcessedSets(
  sets: { set_id: string }[]
): { set_id: string; category: SetCategory }[] {
  const seen = new Set<string>();
  const result: { set_id: string; category: SetCategory }[] = [];

  for (const s of sets) {
    for (const part of splitSetId(s.set_id)) {
      const normalized = part.replace(/-/g, "").toUpperCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      const displayId = normalized.replace(/^([A-Z]+)(\d+)$/, "$1-$2");
      const category = getSetCategory(normalized);
      if (!category) continue;
      result.push({ set_id: displayId, category });
    }
  }

  return result.sort((a, b) =>
    a.set_id.localeCompare(b.set_id, undefined, { numeric: true, sensitivity: "base" })
  );
}

interface Props {
  sets: { set_id: string; set_name: string }[];
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
  isMobileDrawer?: boolean;
}

function Chip({
  label,
  active,
  onClick,
  isDark,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
  accent?: { bg: string; border: string; text: string };
}) {
  const activeBg     = accent?.bg     ?? (isDark ? "#f3f4f6" : "#111827");
  const activeBorder = accent?.border ?? (isDark ? "#f3f4f6" : "#111827");
  const activeText   = accent?.text   ?? (isDark ? "#111827" : "#ffffff");

  return (
    <button
      onClick={onClick}
      style={{
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 6,
        paddingBottom: 6,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${active ? activeBorder : (isDark ? "#374151" : "#e5e7eb")}`,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        background: active ? activeBg : "transparent",
        color: active ? activeText : (isDark ? "#9ca3af" : "#6b7280"),
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function SetDropdown({
  label,
  sets,
  activeSetId,
  isCategoryActive,
  isOpen,
  onToggle,
  onSelectSet,
  onSelectAllCategory,
  isDark,
  accent,
  colors,
  alignRight,
}: {
  category: SetCategory;
  label: string;
  sets: { set_id: string; category: SetCategory }[];
  activeSetId?: string;
  isCategoryActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSet: (setId: string) => void;
  onSelectAllCategory: () => void;
  isDark: boolean;
  accent: { bg: string; border: string; text: string };
  colors: { bg: string; border: string; label: string; text: string };
  alignRight?: boolean;
}) {
  const isSelected = !!activeSetId || isCategoryActive;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onToggle}
        title={activeSetId ? `${label}: ${activeSetId}` : isCategoryActive ? `All ${label}s` : label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingLeft: 14,
          paddingRight: 14,
          paddingTop: 6,
          paddingBottom: 6,
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
          border: `1px solid ${isSelected ? accent.border : (isDark ? "#374151" : "#e5e7eb")}`,
          background: isSelected ? accent.bg : "transparent",
          color: isSelected ? accent.text : (isDark ? "#9ca3af" : "#6b7280"),
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            opacity: isSelected ? 0.9 : 0.6,
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: alignRight ? "auto" : 0,
            right: alignRight ? 0 : "auto",
            zIndex: 60,
            minWidth: 230,
            maxWidth: "min(290px, calc(100vw - 32px))",
            maxHeight: 280,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            boxShadow: isDark
              ? "0 12px 32px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)"
              : "0 12px 32px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.06)",
            padding: 4,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Option 1: All sets in this category */}
          <div
            onClick={onSelectAllCategory}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: isCategoryActive ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
              color: isCategoryActive ? accent.bg : colors.text,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isCategoryActive) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
            }}
            onMouseLeave={(e) => {
              if (!isCategoryActive) e.currentTarget.style.background = "transparent";
            }}
          >
            <span>All {label}s</span>
            {isCategoryActive && <Check size={14} />}
          </div>

          <div style={{ height: 1, background: colors.border, margin: "4px 0" }} />

          {/* List of sets */}
          {sets.length === 0 ? (
            <div style={{ padding: "8px 10px", fontSize: 11, color: colors.label, fontStyle: "italic" }}>
              No sets found
            </div>
          ) : (
            sets.map((s) => {
              const active = activeSetId?.replace(/-/g, "").toUpperCase() === s.set_id.replace(/-/g, "").toUpperCase();
              const setName = SET_NAMES[s.set_id] || "";
              return (
                <div
                  key={s.set_id}
                  onClick={() => onSelectSet(s.set_id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: active ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
                    color: active ? (isDark ? "#fff" : "#000") : colors.text,
                    fontWeight: active ? 700 : 500,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                    <span style={{ fontWeight: 700, minWidth: 44, flexShrink: 0 }}>{s.set_id}</span>
                    {setName && (
                      <span style={{ fontSize: 11, color: colors.label, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {setName}
                      </span>
                    )}
                  </div>
                  {active && <Check size={14} color={accent.bg} style={{ flexShrink: 0 }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ sets, filters, onChange, isMobileDrawer }: Props) {
  const [selectedSetType, setSelectedSetType] = useState<SetCategory | null>(null);
  const [openDropdown, setOpenDropdown] = useState<SetCategory | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const colors = {
    bg: tc.bg.primary,
    border: tc.border,
    label: tc.text.tertiary,
    text: tc.text.primary,
  };

  const processedSets = buildProcessedSets(sets);

  const setIdCategory = filters.setId
    ? getSetCategory(filters.setId.replace(/-/g, "").toUpperCase())
    : null;
  const activeSetType = filters.setType === "limited_product"
    ? "limited_product"
    : setIdCategory ?? (selectedSetType === "limited_product" ? null : selectedSetType);

  const visibleSets =
    activeSetType && activeSetType !== "limited_product"
      ? processedSets.filter((s) => s.category === activeSetType)
      : [];

  const handleSetTypeClick = (type: SetCategory) => {
    if (activeSetType === type) {
      setSelectedSetType(null);
      if (type === "limited_product") {
        onChange({ ...filters, setId: undefined, setType: undefined });
      }
      return;
    }

    setSelectedSetType(type);

    if (type === "limited_product") {
      onChange({ ...filters, setId: undefined, setType: "limited_product" });
      return;
    }

    const nextFilters = {
      ...filters,
      setType: undefined,
      setId: filters.setId && getSetCategory(filters.setId) !== type ? undefined : filters.setId,
    };

    if (nextFilters.setType !== filters.setType || nextFilters.setId !== filters.setId) {
      onChange(nextFilters);
    }
  };

  const toggleFilter = (key: keyof FilterParams, value: string) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  const toggleSpOnly = () =>
    onChange({ ...filters, spOnly: !filters.spOnly });

  const toggleSetFilter = (value: string) =>
    onChange({
      ...filters,
      setId: filters.setId === value ? undefined : value,
      setType: undefined,
    });

  const selectedColors   = filters.colors ?? [];
  const multicolorActive = selectedColors.includes("Multicolor");

  const handleColorClick = (color: string) => {
    if (color === "Multicolor") {
      onChange({ ...filters, colors: multicolorActive ? [] : ["Multicolor"] });
      return;
    }
    if (multicolorActive) {
      onChange({ ...filters, colors: [color] });
      return;
    }
    const current = selectedColors;
    if (current.includes(color)) {
      onChange({ ...filters, colors: current.filter((c) => c !== color) });
    } else {
      const next = current.length >= 2 ? [current[1], color] : [...current, color];
      onChange({ ...filters, colors: next });
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="filter-bar"
      style={{
        background: colors.bg,
        borderBottom: `1px solid ${colors.border}`,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 12,
        paddingBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "all 0.3s",
      }}
    >
      {/* If inside mobile drawer: render compact dropdowns. If on desktop webview: render full Type and Set chip rows */}
      {isMobileDrawer ? (
        <div
          ref={dropdownRef}
          className="filter-bar-row"
          style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}
        >
          <span
            className="filter-bar-label"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: colors.label,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              width: 32,
              flexShrink: 0,
            }}
          >
            Sets
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Booster Pack Dropdown */}
            <SetDropdown
              category="booster"
              label="Booster Pack"
              sets={processedSets.filter((s) => s.category === "booster")}
              activeSetId={getSetCategory(filters.setId || "") === "booster" ? filters.setId : undefined}
              isCategoryActive={filters.setType === "booster"}
              isOpen={openDropdown === "booster"}
              onToggle={() => setOpenDropdown((prev) => (prev === "booster" ? null : "booster"))}
              onSelectSet={(setId) => {
                toggleSetFilter(setId);
                setOpenDropdown(null);
              }}
              onSelectAllCategory={() => {
                onChange({ ...filters, setType: filters.setType === "booster" ? undefined : "booster", setId: undefined });
                setOpenDropdown(null);
              }}
              isDark={isDark}
              accent={SET_TYPE_META.booster}
              colors={colors}
            />

            {/* Starter Deck Dropdown */}
            <SetDropdown
              category="starter"
              label="Starter Deck"
              sets={processedSets.filter((s) => s.category === "starter")}
              activeSetId={getSetCategory(filters.setId || "") === "starter" ? filters.setId : undefined}
              isCategoryActive={filters.setType === "starter"}
              isOpen={openDropdown === "starter"}
              onToggle={() => setOpenDropdown((prev) => (prev === "starter" ? null : "starter"))}
              onSelectSet={(setId) => {
                toggleSetFilter(setId);
                setOpenDropdown(null);
              }}
              onSelectAllCategory={() => {
                onChange({ ...filters, setType: filters.setType === "starter" ? undefined : "starter", setId: undefined });
                setOpenDropdown(null);
              }}
              isDark={isDark}
              accent={SET_TYPE_META.starter}
              colors={colors}
            />

            {/* Extra Booster Dropdown */}
            <SetDropdown
              category="extra_booster"
              label="Extra Booster"
              sets={processedSets.filter((s) => s.category === "extra_booster")}
              activeSetId={getSetCategory(filters.setId || "") === "extra_booster" ? filters.setId : undefined}
              isCategoryActive={filters.setType === "extra_booster"}
              isOpen={openDropdown === "extra_booster"}
              onToggle={() => setOpenDropdown((prev) => (prev === "extra_booster" ? null : "extra_booster"))}
              onSelectSet={(setId) => {
                toggleSetFilter(setId);
                setOpenDropdown(null);
              }}
              onSelectAllCategory={() => {
                onChange({ ...filters, setType: filters.setType === "extra_booster" ? undefined : "extra_booster", setId: undefined });
                setOpenDropdown(null);
              }}
              isDark={isDark}
              accent={SET_TYPE_META.extra_booster}
              colors={colors}
              alignRight={true}
            />

            {/* Premium Booster Dropdown */}
            <SetDropdown
              category="premium_booster"
              label="Premium Booster"
              sets={processedSets.filter((s) => s.category === "premium_booster")}
              activeSetId={getSetCategory(filters.setId || "") === "premium_booster" ? filters.setId : undefined}
              isCategoryActive={filters.setType === "premium_booster"}
              isOpen={openDropdown === "premium_booster"}
              onToggle={() => setOpenDropdown((prev) => (prev === "premium_booster" ? null : "premium_booster"))}
              onSelectSet={(setId) => {
                toggleSetFilter(setId);
                setOpenDropdown(null);
              }}
              onSelectAllCategory={() => {
                onChange({ ...filters, setType: filters.setType === "premium_booster" ? undefined : "premium_booster", setId: undefined });
                setOpenDropdown(null);
              }}
              isDark={isDark}
              accent={SET_TYPE_META.premium_booster}
              colors={colors}
            />

            {/* Limited Product Card (Exception: standalone toggle chip) */}
            <Chip
              label={SET_TYPE_META.limited_product.label}
              active={filters.setType === "limited_product"}
              onClick={() => {
                onChange({
                  ...filters,
                  setType: filters.setType === "limited_product" ? undefined : "limited_product",
                  setId: undefined,
                });
                setOpenDropdown(null);
              }}
              isDark={isDark}
              accent={SET_TYPE_META.limited_product}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Set Type row (Desktop Webview) */}
          <div className="filter-bar-row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="filter-bar-label" style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em", width: 32, flexShrink: 0 }}>
              Type
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.keys(SET_TYPE_META) as SetCategory[]).map((type) => (
                <Chip
                  key={type}
                  label={SET_TYPE_META[type].label}
                  active={activeSetType === type}
                  onClick={() => handleSetTypeClick(type)}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>

          {/* Set row (Desktop Webview) */}
          <div className="filter-bar-row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="filter-bar-label" style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em", width: 32, flexShrink: 0 }}>
              Set
            </span>
            <div style={{ display: "flex", overflowX: "auto", paddingBottom: 4, minHeight: 40, alignItems: "center", gap: 6 }}>
              {activeSetType === "limited_product" ? (
                <span style={{ fontSize: 12, color: colors.label, fontStyle: "italic" }}>
                  Showing all Limited Product Cards
                </span>
              ) : visibleSets.length === 0 ? (
                <span style={{ fontSize: 12, color: colors.label, fontStyle: "italic" }}>
                  {activeSetType ? "No sets found" : "Select a set type"}
                </span>
              ) : (
                visibleSets.map((s) => (
                  <Chip
                    key={s.set_id}
                    label={s.set_id}
                    active={filters.setId?.replace(/-/g, "").toUpperCase() === s.set_id.replace(/-/g, "").toUpperCase()}
                    onClick={() => toggleSetFilter(s.set_id)}
                    isDark={isDark}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Color + Card Type + Rarity */}
      <div className="filter-bar-groups" style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>

        {/* Color */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em" }}>Color</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[...COLORS, "Multicolor"].map((c) => {
              const isMulticolor = c === "Multicolor";
              const active = isMulticolor ? multicolorActive : selectedColors.includes(c);
              const dimmed = !active && selectedColors.length > 0;
              return (
                <button
                  key={c}
                  title={c}
                  onClick={() => handleColorClick(c)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "none",
                    cursor: "pointer",
                    background: isMulticolor
                      ? "radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 60%), conic-gradient(from 180deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #000000, #ef4444)"
                      : COLOR_DOT[c],
                    outline: active ? `3px solid ${isMulticolor ? "#808080" : COLOR_DOT[c]}` : "none",
                    outlineOffset: 2,
                    opacity: dimmed ? 0.35 : 1,
                    transform: active ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.2s",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Card Type */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
          <div style={{ display: "flex", gap: 6 }}>
            {CARD_TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                active={filters.type === t}
                onClick={() => toggleFilter("type", t)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Rarity */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rarity</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {RARITIES.map((r) => (
              <Chip
                key={r}
                label={r}
                active={filters.rarity === r}
                onClick={() => toggleFilter("rarity", r)}
                isDark={isDark}
              />
            ))}
            <Chip
              label="SP"
              active={!!filters.spOnly}
              onClick={toggleSpOnly}
              isDark={isDark}
            />
          </div>
        </div>

      </div>
    </div>
  );
}