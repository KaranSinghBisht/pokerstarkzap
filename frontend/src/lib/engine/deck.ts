/** Fisher-Yates shuffle and deal functions */

export function createDeck(): number[] {
  const deck: number[] = [];
  for (let i = 0; i < 52; i++) deck.push(i);
  return deck;
}

export function shuffleDeck(deck: number[]): number[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function dealCards(deck: number[], count: number): { dealt: number[]; remaining: number[] } {
  return {
    dealt: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
