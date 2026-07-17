import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours ISR

let cachedSets: unknown[] = [];
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24;

export async function GET() {
  try {
    if (cachedSets.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedSets, {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }

    const res = await fetch("https://optcgapi.com/api/allSets/", {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch sets, status: ${res.status}`);
    }

    const data = await res.json();
    cachedSets = data;
    cacheTime = Date.now();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("Error fetching sets:", err);
    if (cachedSets.length > 0) {
      return NextResponse.json(cachedSets, {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
  }
}
