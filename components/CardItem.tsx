"use client";

import { useState, useEffect } from "react";
import { Card } from "@/types/card";
import { useTheme } from "next-themes";
import { memo } from "react";
import { getColors } from "@/lib/themes";

const COLOR_STYLES: Record<string, { bg: string; border: string; dot: string; darkBg: string }> = {
  Red:        { bg: "#fff1f1", border: "#fca5a5", dot: "#ef4444", darkBg: "#7f1d1d" },
  Green:      { bg: "#f0fdf4", border: "#86efac", dot: "#22c55e", darkBg: "#14532d" },
  Blue:       { bg: "#eff6ff", border: "#93c5fd", dot: "#3b82f6", darkBg: "#0c2340" },
  Purple:     { bg: "#faf5ff", border: "#d8b4fe", dot: "#a855f7", darkBg: "#3f0f5c" },
  Black:      { bg: "#f9fafb", border: "#d1d5db", dot: "#374151", darkBg: "#1f2937" },
  Yellow:     { bg: "#fefce8", border: "#fde047", dot: "#eab308", darkBg: "#54381e" },
  Multicolor: { bg: "#fff7ed", border: "#fdba74", dot: "#f97316", darkBg: "#5a2d0c" },
};



interface Props {
  card: Card;
  onClick: (card: Card) => void;
}

function CardItem({ card, onClick }: Props) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const cardColors = card.color?.split("/") ?? ["Black"];
  const primaryColor = cardColors[0].trim();
  const colorStyle = COLOR_STYLES[primaryColor] ?? COLOR_STYLES.Black;
  const normalizedRarity = card.name?.includes("(SP)") ? "SP" : card.rarity === "SP" ? "SP" : card.rarity;

  const bgGradient = isDark
    ? `linear-gradient(135deg, ${colorStyle.darkBg}, ${tc.bg.secondary})`
    : `linear-gradient(135deg, ${colorStyle.bg}, ${tc.bg.secondary})`;

  return (
    <div
      onClick={() => onClick(card)}
      style={{
        cursor: "pointer",
        borderRadius: 14,
        overflow: "hidden",
        background: tc.bg.secondary,
        border: `1px solid ${colorStyle.border}`,
        transition: "all 0.2s",
        transform: "translateY(0)",
      }}
      onMouseEnter={(e) => {
        const element = e.currentTarget as HTMLDivElement;
        element.style.transform = "translateY(-4px)";
        element.style.boxShadow = isDark
          ? "0 20px 25px rgba(0,0,0,0.4)"
          : "0 20px 25px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        const element = e.currentTarget as HTMLDivElement;
        element.style.transform = "translateY(0)";
        element.style.boxShadow = "none";
      }}
    >
      {/* Image area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "5 / 7", // 🔥 FIX
          overflow: "hidden",
          background: bgGradient,
        }}
      >
        {/* Rarity badge */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 12,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 9999,
            zIndex: 10,
          }}
        >
        </div>

        {/* Image */}
        <img
          src={card.images?.small || "/card-placeholder.png"}
          alt={card.name}
          style={{
            width: "100%",
            height: "100%", 
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.src = "/card-placeholder.png";
          }}
        />
      </div>
    </div>
  );
}

export default memo(CardItem);