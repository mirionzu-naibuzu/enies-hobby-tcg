export type CardColor = "Red" | "Green" | "Blue" | "Purple" | "Black" | "Yellow" | "Multicolor";
export type CardType = "LEADER" | "CHARACTER" | "EVENT" | "STAGE";
export type CardRarity = "SEC" | "SR" | "R" | "UC" | "C" | "SP" | "TR" | "P" | "PR" | "L";
export type CardSetType = "booster" | "starter" | "extra_booster" | "premium_booster" | "limited_product";

export interface Card {
  id: string;
  code: string;
  name: string;
  rarity: CardRarity;
  type: CardType;
  color: string;
  cost?: number | null;
  power?: number | null;
  counter?: string | null;
  attribute?: { name: string; image: string } | null;
  ability?: string;
  trigger?: string;
  family?: string;
  images: { small: string; large: string };
  set: { name: string };
  setType?: CardSetType;
}

export interface CardSet {
  set_id: string;
  set_name: string;
}

export interface FilterParams {
  search?: string;
  colors?: string[];
  type?: string;
  rarity?: string;
  setId?: string;
  setType?: CardSetType;
  spOnly?: boolean;
}
