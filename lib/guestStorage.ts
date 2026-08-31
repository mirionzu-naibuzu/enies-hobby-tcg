import { createClient } from "@/lib/supabase";
import type { UserCard, Binder } from "@/lib/binder";

const KEY_USER_CARDS = "enies_guest_user_cards";
const KEY_BINDERS = "enies_guest_binders";
const KEY_BINDER_CARDS = "enies_guest_binder_cards";

const isClient = () => typeof window !== "undefined";

// ── GUEST USER CARDS (Owned / Wishlist) ──

export function getGuestUserCards(): UserCard[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(KEY_USER_CARDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading guest user cards:", e);
    return [];
  }
}

export function saveGuestUserCard(cardId: string, inWishlist = false): void {
  if (!isClient()) return;
  try {
    const cards = getGuestUserCards().filter((c) => c.card_id !== cardId);
    cards.push({
      card_id: cardId,
      in_wishlist: inWishlist,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(KEY_USER_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error("Error saving guest user card:", e);
  }
}

export function removeGuestUserCard(cardId: string): void {
  if (!isClient()) return;
  try {
    const cards = getGuestUserCards().filter((c) => c.card_id !== cardId);
    localStorage.setItem(KEY_USER_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error("Error removing guest user card:", e);
  }
}

export function toggleGuestWishlist(cardId: string, inWishlist: boolean): void {
  saveGuestUserCard(cardId, inWishlist);
}

// ── GUEST CUSTOM BINDERS ──

export function getGuestBinders(): Binder[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(KEY_BINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading guest binders:", e);
    return [];
  }
}

export function createGuestBinder(name: string): Binder {
  const newBinder: Binder = {
    id: `guest_binder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    created_at: new Date().toISOString(),
  };

  if (!isClient()) return newBinder;
  try {
    const binders = getGuestBinders();
    binders.push(newBinder);
    localStorage.setItem(KEY_BINDERS, JSON.stringify(binders));
  } catch (e) {
    console.error("Error creating guest binder:", e);
  }
  return newBinder;
}

export function deleteGuestBinder(binderId: string): void {
  if (!isClient()) return;
  try {
    const binders = getGuestBinders().filter((b) => b.id !== binderId);
    localStorage.setItem(KEY_BINDERS, JSON.stringify(binders));

    // Also clean up binder cards
    const allMap = getGuestAllBinderCards();
    delete allMap[binderId];
    localStorage.setItem(KEY_BINDER_CARDS, JSON.stringify(allMap));
  } catch (e) {
    console.error("Error deleting guest binder:", e);
  }
}

export function renameGuestBinder(binderId: string, name: string): void {
  if (!isClient()) return;
  try {
    const binders = getGuestBinders().map((b) =>
      b.id === binderId ? { ...b, name } : b
    );
    localStorage.setItem(KEY_BINDERS, JSON.stringify(binders));
  } catch (e) {
    console.error("Error renaming guest binder:", e);
  }
}

// ── GUEST BINDER CARDS ──

function getGuestAllBinderCards(): Record<string, string[]> {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(KEY_BINDER_CARDS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Error reading guest binder cards map:", e);
    return {};
  }
}

export function getGuestBinderCards(binderId: string): string[] {
  const map = getGuestAllBinderCards();
  return map[binderId] ?? [];
}

export function getGuestBinderCardCounts(): Record<string, number> {
  const map = getGuestAllBinderCards();
  const counts: Record<string, number> = {};
  for (const [binderId, cards] of Object.entries(map)) {
    counts[binderId] = cards.length;
  }
  return counts;
}

export function addGuestBinderCard(binderId: string, cardId: string): void {
  if (!isClient()) return;
  try {
    const map = getGuestAllBinderCards();
    const current = map[binderId] ?? [];
    if (!current.includes(cardId)) {
      map[binderId] = [...current, cardId];
      localStorage.setItem(KEY_BINDER_CARDS, JSON.stringify(map));
    }
  } catch (e) {
    console.error("Error adding card to guest binder:", e);
  }
}

export function removeGuestBinderCard(binderId: string, cardId: string): void {
  if (!isClient()) return;
  try {
    const map = getGuestAllBinderCards();
    const current = map[binderId] ?? [];
    map[binderId] = current.filter((id) => id !== cardId);
    localStorage.setItem(KEY_BINDER_CARDS, JSON.stringify(map));
  } catch (e) {
    console.error("Error removing card from guest binder:", e);
  }
}

// ── UTILITIES & CLOUD SYNC ──

export function hasGuestData(): boolean {
  if (!isClient()) return false;
  const userCards = getGuestUserCards();
  const binders = getGuestBinders();
  return userCards.length > 0 || binders.length > 0;
}

export function clearGuestData(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(KEY_USER_CARDS);
    localStorage.removeItem(KEY_BINDERS);
    localStorage.removeItem(KEY_BINDER_CARDS);
  } catch (e) {
    console.error("Error clearing guest data:", e);
  }
}

let isSyncing = false;

/**
 * Automatically & non-destructively migrates all guest localStorage data
 * into the signed-in user's Supabase account.
 */
export async function syncGuestToCloud(userId: string): Promise<{
  syncedCards: number;
  syncedBinders: number;
}> {
  if (!userId || !hasGuestData() || isSyncing) {
    return { syncedCards: 0, syncedBinders: 0 };
  }

  isSyncing = true;

  try {
    const guestCards = getGuestUserCards();
    const guestBinders = getGuestBinders();
    const guestBinderCardsMap = getGuestAllBinderCards();

    let syncedCards = 0;
    let syncedBinders = 0;

    const supabase = createClient();

    // 1. Sync User Cards (Owned & Wishlist) via UPSERT
    if (guestCards.length > 0) {
      await Promise.all(
        guestCards.map(async (card) => {
          await supabase.from("user_cards").upsert(
            {
              user_id: userId,
              card_id: card.card_id,
              in_wishlist: card.in_wishlist,
            },
            { onConflict: "user_id,card_id" }
          );
          syncedCards++;
        })
      );
    }

    // 2. Sync Custom Binders with deduplication
    if (guestBinders.length > 0) {
      // Fetch existing cloud binders for this user to avoid duplicating names
      const { data: existingBinders } = await supabase
        .from("binders")
        .select("id, name")
        .eq("user_id", userId);

      const knownBinders = [...(existingBinders ?? [])];

      for (const guestB of guestBinders) {
        const trimmedName = guestB.name.trim();
        let targetBinder = knownBinders.find(
          (eb) => eb.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (!targetBinder) {
          const { data: newBinder, error } = await supabase
            .from("binders")
            .insert({ user_id: userId, name: trimmedName })
            .select("id, name, created_at")
            .single();

          if (newBinder && !error) {
            targetBinder = newBinder;
            knownBinders.push(newBinder);
            syncedBinders++;
          }
        }

        if (targetBinder) {
          const cardsForThisBinder = guestBinderCardsMap[guestB.id] ?? [];
          if (cardsForThisBinder.length > 0) {
            await Promise.all(
              cardsForThisBinder.map((cardId) =>
                supabase
                  .from("binder_cards")
                  .upsert(
                    { binder_id: targetBinder!.id, card_id: cardId },
                    { onConflict: "binder_id,card_id" }
                  )
              )
            );
          }
        }
      }
    }

    // 3. Clear guest storage after successful sync
    clearGuestData();

    if (isClient()) {
      window.dispatchEvent(
        new CustomEvent("enies_guest_synced", {
          detail: { syncedCards, syncedBinders },
        })
      );
    }

    return { syncedCards, syncedBinders };
  } catch (err) {
    console.error("Error during guest-to-cloud sync:", err);
    return { syncedCards: 0, syncedBinders: 0 };
  } finally {
    isSyncing = false;
  }
}
