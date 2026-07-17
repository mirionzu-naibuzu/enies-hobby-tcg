import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours ISR

let cache: { data: unknown[]; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 24;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data, { headers: CACHE_HEADERS });
  }

  try {
    const res = await fetch("https://www.optcgapi.com/api/allDonCards/", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`optcgapi responded ${res.status}`);
    const data = await res.json();

    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error("Failed to fetch DON cards:", err);
    if (cache) return NextResponse.json(cache.data, { headers: CACHE_HEADERS });
    return NextResponse.json({ error: "Failed to fetch DON cards" }, { status: 502 });
  }
}