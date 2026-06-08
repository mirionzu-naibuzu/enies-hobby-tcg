import { NextResponse } from "next/server";

const OPTCG_URL = "https://optcgapi.com/api";

let cachedCards: unknown[] = [];
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60;

type OptcgApiCard = {
  card_set_id?: string;
  card_name?: string;
  rarity?: string;
  card_type?: string;
  card_color?: string;
  card_cost?: number | string | null;
  card_power?: number | string | null;
  counter_amount?: string | null;
  card_text?: string;
  trigger?: string;
  sub_types?: string;
  attribute?: string;
  set_name?: string;
  set_id?: string;
  card_image?: string;
};

const toOptcgCards = (payload: unknown): OptcgApiCard[] =>
  Array.isArray(payload)
    ? payload.filter((card): card is OptcgApiCard => typeof card === "object" && card !== null)
    : [];

function normalizeOptcgCard(
  card: OptcgApiCard,
  options: { rarity?: string; setType?: "limited_product" } = {}
) {
  return {
    id: card.card_set_id ?? "",
    code: card.card_set_id ?? "",
    name: card.card_name ?? "",
    rarity: options.rarity ?? card.rarity,
    type: card.card_type?.toUpperCase(),
    color: card.card_color,
    cost: card.card_cost ? Number(card.card_cost) : null,
    power: card.card_power ? Number(card.card_power) : null,
    counter: card.counter_amount,
    ability: card.card_text,
    trigger: card.trigger,
    family: card.sub_types,
    attribute: card.attribute ? { name: card.attribute, image: "" } : null,
    set: { name: `${card.set_name} [${card.set_id}]` },
    images: {
      small: card.card_image ?? "",
      large: card.card_image ?? "",
    },
    setType: options.setType,
  };
}
export async function GET() {
  try {
    if (cachedCards.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
      console.log(`✅ Returning ${cachedCards.length} cached cards`);
      return NextResponse.json(cachedCards);
    }

    const [setCardsPayload, stCardsPayload, promoCardsPayload] = await Promise.all([
      fetch(`${OPTCG_URL}/allSetCards/`).then(r => r.json()),
      fetch(`${OPTCG_URL}/allSTCards/`).then(r => r.json()),
      fetch(`${OPTCG_URL}/allPromos/`).then(r => r.json()).catch(() => []),
    ]);

    const setCards = toOptcgCards(setCardsPayload);
    const stCards = toOptcgCards(stCardsPayload);
    const promoCards = toOptcgCards(promoCardsPayload);
    const mainSourceCards = [...setCards, ...stCards];

    const mainCards = mainSourceCards.map(c =>
      normalizeOptcgCard(c)
    );

    const limitedProductCards = promoCards.map((c) =>
      normalizeOptcgCard(c, { setType: "limited_product" })
    );

    const allCards = [...mainCards, ...limitedProductCards];

    console.log(
      `✅ Total cards: ${allCards.length} (${mainCards.length} main + ${limitedProductCards.length} limited product)`
    );

    cachedCards = allCards;
    cacheTime = Date.now();

    return NextResponse.json(allCards);
  } catch (err) {
    if (cachedCards.length > 0) {
      console.log("⚠️ Returning stale cache");
      return NextResponse.json(cachedCards);
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
