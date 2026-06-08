import { createClient } from "@/lib/supabase";

// ── TYPES ──────────────────────────────────────────────

export interface UserCard {
  card_id: string;
  in_wishlist: boolean;
}

export interface Binder {
  id: string;
  name: string;
  created_at: string;
}

export interface BinderCard {
  card_id: string;
}

// ── USER CARDS (set binder / owned) ───────────────────

export async function getUserCards(userId: string): Promise<UserCard[]> {
  const supabase = createClient();
  const allCards: UserCard[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("user_cards")
      .select("card_id, in_wishlist")
      .eq("user_id", userId)
      .range(from, from + pageSize - 1);

    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;

    allCards.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allCards;
}

export async function addUserCard(userId: string, cardId: string, inWishlist = false): Promise<void> {
  const supabase = createClient();
  await supabase.from("user_cards").upsert(
    { user_id: userId, card_id: cardId, in_wishlist: inWishlist },
    { onConflict: "user_id,card_id" }
  );
}

export async function removeUserCard(userId: string, cardId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("user_cards")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", cardId);
}

export async function toggleWishlist(userId: string, cardId: string, inWishlist: boolean): Promise<void> {
  const supabase = createClient();
  await supabase.from("user_cards")
    .update({ in_wishlist: inWishlist })
    .eq("user_id", userId)
    .eq("card_id", cardId);
}

// ── CUSTOM BINDERS ────────────────────────────────────

export async function getBinders(userId: string): Promise<Binder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("binders")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function createBinder(userId: string, name: string): Promise<Binder | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("binders")
    .insert({ user_id: userId, name })
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function deleteBinder(binderId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("binders").delete().eq("id", binderId);
}

export async function renameBinder(binderId: string, name: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("binders").update({ name }).eq("id", binderId);
}

// ── BINDER CARDS ──────────────────────────────────────

export async function getBinderCards(binderId: string): Promise<string[]> {
  const supabase = createClient();
  const allCards: string[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("binder_cards")
      .select("card_id")
      .eq("binder_id", binderId)
      .range(from, from + pageSize - 1);

    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;

    allCards.push(...data.map((r) => r.card_id));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allCards;
}

export async function addCardToBinder(binderId: string, cardId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("binder_cards").upsert(
    { binder_id: binderId, card_id: cardId },
    { onConflict: "binder_id,card_id" }
  );
}

export async function removeCardFromBinder(binderId: string, cardId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("binder_cards")
    .delete()
    .eq("binder_id", binderId)
    .eq("card_id", cardId);
}

// ── COUNTS (for UI badges) ────────────────────────────

export async function getBinderCardCounts(
  userId: string
): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data: binders } = await supabase
    .from("binders")
    .select("id")
    .eq("user_id", userId);
  if (!binders?.length) return {};

  const { data: counts } = await supabase
    .from("binder_cards")
    .select("binder_id")
    .in("binder_id", binders.map((b) => b.id));

  const result: Record<string, number> = {};
  for (const row of counts ?? []) {
    result[row.binder_id] = (result[row.binder_id] ?? 0) + 1;
  }
  return result;
}