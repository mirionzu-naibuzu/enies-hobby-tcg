"use client";

import { useState, useEffect } from "react";
import { FilterParams } from "@/types/card";
import { useTheme } from "next-themes";

const COLORS   = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
const CARD_TYPES = ["LEADER", "CHARACTER", "EVENT", "STAGE"];
const RARITIES = ["SEC", "SR", "R", "UC", "C", "SP", "TR", "PR"];

const COLOR_DOT: Record<string, string> = {
  Red: "#ef4444", Green: "#22c55e", Blue: "#3b82f6",
  Purple: "#a855f7", Black: "#374151", Yellow: "#eab308",
};

type SetCategory = "booster" | "starter" | "extra_booster" | "premium_booster";

const SET_TYPE_META: Record<SetCategory, { label: string; bg: string; border: string; text: string }> = {
  booster:      { label: "Booster Pack",   bg: "#1d4ed8", border: "#1d4ed8", text: "#ffffff" },
  starter:      { label: "Starter Deck",   bg: "#15803d", border: "#15803d", text: "#ffffff" },
  extra_booster:{ label: "Extra Booster",  bg: "#7c3aed", border: "#7c3aed", text: "#ffffff" },
  premium_booster:      { label: "Premium Booster",        bg: "#b45309", border: "#b45309", text: "#ffffff" },
};

// Classify a single (non-combined) set ID by its prefix
function getSetCategory(setId: string): SetCategory | null {
  const id = setId.toUpperCase().replace(/-/g, "");

  if (id.startsWith("ST")) return "starter";
  if (id.startsWith("EB")) return "extra_booster";
  if (id.startsWith("PRB")) return "premium_booster";

  // Ignore promo sets
  if (id.startsWith("P")) return null;

  return "booster";
}

// Detect combined IDs like "OP14-EB04" vs structural hyphens like "ST-01".
// A combined ID has every hyphen-separated part matching letters+digits (e.g. "OP14", "EB04").
// "ST-01" fails because "01" has no letters.
function splitSetId(setId: string): string[] {
  const parts = setId.split("-");
  const isCombined = parts.length >= 2 && parts.every(p => /^[A-Za-z]{1,3}\d+$/.test(p));
  return isCombined ? parts : [setId];
}

// Explode the raw sets array: split combined IDs, deduplicate, assign categories.
// "OP14-EB04" → { set_id: "OP14", category: "booster" } + { set_id: "EB04", category: "extra_booster" }
// Second occurrence of "EB04" (from OP15-EB04) is dropped.
function buildProcessedSets(
  sets: { set_id: string }[]
): { set_id: string; category: SetCategory }[] {

  const seen = new Set<string>();

  const result: { set_id: string; category: SetCategory }[] = [];

  for (const s of sets) {
    for (const part of splitSetId(s.set_id)) {

      // normalize for dedupe
      const normalized = part.replace(/-/g, "").toUpperCase();

      if (seen.has(normalized)) continue;

      seen.add(normalized);

      // display format
      let displayId = normalized;

      // ST01 -> ST-01
      if (/^ST\d+$/.test(normalized)) {
        displayId = normalized.replace(/^ST(\d+)$/, "ST-$1");
      }

      // PRB01 -> PRB-01
      else if (/^PRB\d+$/.test(normalized)) {
        displayId = normalized.replace(/^PRB(\d+)$/, "PRB-$1");
      }

      // EB04 -> EB-04
      else if (/^EB\d+$/.test(normalized)) {
        displayId = normalized.replace(/^EB(\d+)$/, "EB-$1");
      }

      // OP01 -> OP-01
      else if (/^OP\d+$/.test(normalized)) {
        displayId = normalized.replace(/^OP(\d+)$/, "OP-$1");
      }

      const category = getSetCategory(normalized);

      if (!category) continue;

      result.push({
        set_id: displayId,
        category,
      });
    }
  }

  return result.sort((a, b) =>
    a.set_id.localeCompare(b.set_id, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}

interface Props {
  sets: { set_id: string; set_name: string }[];
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
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
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 4,
        paddingBottom: 4,
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

export default function FilterBar({ sets, filters, onChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeSetType, setActiveSetType] = useState<SetCategory | null>(null);
  const { theme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && theme === "dark";

  const colors = {
    bg: isDark ? "#111827" : "#ffffff",
    border: isDark ? "#374151" : "#e5e7eb",
    label: "#9ca3af",
    text: isDark ? "#f3f4f6" : "#111827",
  };

  // Explode combined set IDs once
  const processedSets = buildProcessedSets(sets);

  const visibleSets = activeSetType
  ? processedSets.filter((s) => s.category === activeSetType)
  : [];

  const handleSetTypeClick = (type: SetCategory) => {
    if (activeSetType === type) {
      setActiveSetType(null);
    } else {
      setActiveSetType(type);
      // If the currently selected set belongs to a different category, clear it
      if (filters.setId && getSetCategory(filters.setId) !== type) {
        onChange({ ...filters, setId: undefined });
      }
    }
  };

  const toggleFilter = (key: keyof FilterParams, value: string) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

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

      {/* Set Type row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em", width: 32, flexShrink: 0 }}>
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
              accent={SET_TYPE_META[type]}
            />
          ))}
        </div>
      </div>

      {/* Set row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.05em", width: 32, flexShrink: 0 }}>
          Set
        </span>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            paddingBottom: 4,
            minHeight: 40,
            alignItems: "center",
          }}
        >
        {visibleSets.length === 0 ? (
            <span
              style={{
                fontSize: 12,
                color: colors.label,
                fontStyle: "italic",
              }}
            >
              {activeSetType ? "No sets found" : "Select a set type"}
            </span>
          ) : (
            visibleSets.map((s) => (
              <div
                key={s.set_id}
                style={{
                  width: 72,
                  height: 32,
                  flexShrink: 0,
                }}
              >
                <Chip
                  label={s.set_id}
                  active={filters.setId === s.set_id}
                  onClick={() => toggleFilter("setId", s.set_id)}
                  isDark={isDark}
                  accent={
                    activeSetType
                      ? SET_TYPE_META[activeSetType]
                      : SET_TYPE_META[s.category]
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Color + Card Type + Rarity */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>

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
          <div style={{ display: "flex", gap: 6 }}>
            {RARITIES.map((r) => (
              <Chip
                key={r}
                label={r}
                active={filters.rarity === r}
                onClick={() => toggleFilter("rarity", r)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}