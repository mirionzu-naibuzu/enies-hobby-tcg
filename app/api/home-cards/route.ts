import { NextResponse } from "next/server";
import { GET as getCardsHandler } from "@/app/api/cards/route";
import { Card } from "@/types/card";

export const revalidate = 3600; // 1 hour ISR

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    const response = await getCardsHandler();
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
    }

    const cards: Card[] = await response.json();
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const highRarity = cards.filter((c) => {
      const r = c.rarity?.replace(/\s+CARD\s*$/i, "").trim() ?? "";
      const normalized = c.name?.includes("(SP)") ? "SP" : r;
      return (
        ["SR", "SP", "SEC"].includes(normalized) &&
        ["LEADER", "CHARACTER"].includes(c.type?.toUpperCase() ?? "") &&
        c.images?.large?.trim()
      );
    });

    const validPreview = cards.filter((c) => c.images?.small?.trim());

    return NextResponse.json(
      {
        stackCards: shuffle(highRarity).slice(0, 3),
        previewCards: shuffle(validPreview).slice(0, 6),
        cardCount: cards.length,
      },
      { headers: CACHE_HEADERS }
    );
  } catch (err) {
    console.error("Error in home-cards route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
