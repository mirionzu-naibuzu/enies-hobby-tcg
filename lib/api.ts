import { Card, CardSet } from "@/types/card";

export interface HomeCardsResponse {
  stackCards: Card[];
  previewCards: Card[];
  cardCount: number;
}

let cardsPromise: Promise<Card[]> | null = null;
let donCardsPromise: Promise<unknown[]> | null = null;
let setsPromise: Promise<CardSet[]> | null = null;

export async function getAllCards(): Promise<Card[]> {
  if (cardsPromise) return cardsPromise;

  cardsPromise = fetch("/api/cards")
    .then((res) => {
      if (!res.ok) {
        cardsPromise = null;
        return [];
      }
      return res.json();
    })
    .catch((err) => {
      console.error("Error fetching cards:", err);
      cardsPromise = null;
      return [];
    });

  return cardsPromise;
}

export async function getAllDonCards<T = any>(): Promise<T[]> {
  if (donCardsPromise) return donCardsPromise as Promise<T[]>;

  donCardsPromise = fetch("/api/don-cards")
    .then((res) => {
      if (!res.ok) {
        donCardsPromise = null;
        throw new Error("Failed to fetch DON cards");
      }
      return res.json();
    })
    .catch((err) => {
      console.error("Error fetching DON cards:", err);
      donCardsPromise = null;
      return [];
    });

  return donCardsPromise as Promise<T[]>;
}

export async function getAllSets(): Promise<CardSet[]> {
  if (setsPromise) return setsPromise;

  setsPromise = fetch("/api/sets")
    .then((res) => {
      if (!res.ok) {
        setsPromise = null;
        throw new Error("Failed to fetch sets");
      }
      return res.json();
    })
    .catch((err) => {
      console.error("Error fetching sets:", err);
      setsPromise = null;
      return [];
    });

  return setsPromise;
}

export async function getHomeCards(): Promise<HomeCardsResponse> {
  const res = await fetch("/api/home-cards");
  if (!res.ok) {
    throw new Error("Failed to fetch home cards");
  }
  return res.json();
}