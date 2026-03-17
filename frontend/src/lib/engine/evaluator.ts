/**
 * 7-card poker hand evaluator.
 * Card ID encoding: rank = floor(id / 4), suit = id % 4
 * Ranks: 0=2, 1=3, ..., 8=10, 9=J, 10=Q, 11=K, 12=A
 */

export interface HandResult {
  rank: number;      // 1=high card .. 9=straight flush
  tiebreaker: number; // comparable numeric score
  name: string;      // human-readable hand name
}

function getRank(cardId: number): number {
  return Math.floor(cardId / 4);
}

function getSuit(cardId: number): number {
  return cardId % 4;
}

/** Generate all C(n,5) combinations from indices */
function combinations5(cards: number[]): number[][] {
  const result: number[][] = [];
  const n = cards.length;
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++)
            result.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
  return result;
}

/** Evaluate a single 5-card hand */
function evaluate5(hand: number[]): HandResult {
  const ranks = hand.map(getRank).sort((a, b) => b - a);
  const suits = hand.map(getSuit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHigh = 0;

  // Normal straight check
  if (
    ranks[0] - ranks[1] === 1 &&
    ranks[1] - ranks[2] === 1 &&
    ranks[2] - ranks[3] === 1 &&
    ranks[3] - ranks[4] === 1
  ) {
    isStraight = true;
    straightHigh = ranks[0];
  }

  // Wheel: A-2-3-4-5 (ranks: [12, 3, 2, 1, 0])
  if (!isStraight && ranks[0] === 12 && ranks[1] === 3 && ranks[2] === 2 && ranks[3] === 1 && ranks[4] === 0) {
    isStraight = true;
    straightHigh = 3; // 5-high straight
  }

  // Count rank frequencies
  const freq = new Map<number, number>();
  for (const r of ranks) freq.set(r, (freq.get(r) || 0) + 1);
  const counts = [...freq.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  // Straight flush
  if (isFlush && isStraight) {
    return { rank: 9, tiebreaker: straightHigh, name: straightHigh === 12 ? "Royal Flush" : "Straight Flush" };
  }

  // Four of a kind
  if (counts[0][1] === 4) {
    const tb = counts[0][0] * 13 + counts[1][0];
    return { rank: 8, tiebreaker: tb, name: "Four of a Kind" };
  }

  // Full house
  if (counts[0][1] === 3 && counts[1][1] === 2) {
    const tb = counts[0][0] * 13 + counts[1][0];
    return { rank: 7, tiebreaker: tb, name: "Full House" };
  }

  // Flush
  if (isFlush) {
    const tb = ranks[0] * 28561 + ranks[1] * 2197 + ranks[2] * 169 + ranks[3] * 13 + ranks[4];
    return { rank: 6, tiebreaker: tb, name: "Flush" };
  }

  // Straight
  if (isStraight) {
    return { rank: 5, tiebreaker: straightHigh, name: "Straight" };
  }

  // Three of a kind
  if (counts[0][1] === 3) {
    const kickers = counts.filter((c) => c[1] === 1).map((c) => c[0]);
    const tb = counts[0][0] * 169 + kickers[0] * 13 + (kickers[1] || 0);
    return { rank: 4, tiebreaker: tb, name: "Three of a Kind" };
  }

  // Two pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const pairs = [counts[0][0], counts[1][0]].sort((a, b) => b - a);
    const kicker = counts.find((c) => c[1] === 1)?.[0] || 0;
    const tb = pairs[0] * 169 + pairs[1] * 13 + kicker;
    return { rank: 3, tiebreaker: tb, name: "Two Pair" };
  }

  // One pair
  if (counts[0][1] === 2) {
    const kickers = counts.filter((c) => c[1] === 1).map((c) => c[0]).sort((a, b) => b - a);
    const tb = counts[0][0] * 2197 + kickers[0] * 169 + kickers[1] * 13 + (kickers[2] || 0);
    return { rank: 2, tiebreaker: tb, name: "Pair" };
  }

  // High card
  const tb = ranks[0] * 28561 + ranks[1] * 2197 + ranks[2] * 169 + ranks[3] * 13 + ranks[4];
  return { rank: 1, tiebreaker: tb, name: "High Card" };
}

/** Evaluate best 5-card hand from 7 cards (hole + community) */
export function evaluateBestHand(holeCards: number[], communityCards: number[]): HandResult {
  const allCards = [...holeCards, ...communityCards];
  const combos = combinations5(allCards);

  let best: HandResult = { rank: 0, tiebreaker: 0, name: "" };

  for (const combo of combos) {
    const result = evaluate5(combo);
    if (result.rank > best.rank || (result.rank === best.rank && result.tiebreaker > best.tiebreaker)) {
      best = result;
    }
  }

  return best;
}

/** Compare two hand results: >0 if a wins, <0 if b wins, 0 if tie */
export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  return a.tiebreaker - b.tiebreaker;
}
