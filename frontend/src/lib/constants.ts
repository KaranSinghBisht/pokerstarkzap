// Card encoding: rank * 4 + suit
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const SUITS = ["\u2663", "\u2666", "\u2665", "\u2660"];

export function cardIdToRank(id: number): string {
  return RANKS[Math.floor(id / 4)];
}

export function cardIdToSuit(id: number): string {
  return SUITS[id % 4];
}

export function cardIdToString(id: number): string {
  if (id === 255) return "??";
  return `${cardIdToRank(id)}${cardIdToSuit(id)}`;
}
