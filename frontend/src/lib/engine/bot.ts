/**
 * Simple tight-aggressive bot AI.
 * Makes decisions based on hand strength relative to community cards.
 */

import { type GameState, Phase, Action } from "./types";
import { evaluateBestHand } from "./evaluator";

/** Pre-flop hand strength: returns 0-1 score based on hole cards */
function preflopStrength(card1: number, card2: number): number {
  const r1 = Math.floor(card1 / 4);
  const r2 = Math.floor(card2 / 4);
  const s1 = card1 % 4;
  const s2 = card2 % 4;
  const suited = s1 === s2;
  const high = Math.max(r1, r2);
  const low = Math.min(r1, r2);
  const gap = high - low;
  const pair = r1 === r2;

  // Pocket pairs
  if (pair) {
    return 0.5 + (high / 12) * 0.5; // AA=1.0, 22=0.5
  }

  let score = (high + low) / 24; // base from card ranks

  if (suited) score += 0.1;
  if (gap <= 1) score += 0.08;
  if (gap <= 2) score += 0.04;

  // Premium hands bonus
  if (high === 12) score += 0.15; // Ace
  if (high >= 9 && low >= 9) score += 0.1; // Both face cards

  return Math.min(1, Math.max(0, score));
}

export function decideBotAction(state: GameState): { action: Action; amount: number } {
  const bot = state.players[1];
  if (!bot.holeCards) return { action: Action.Fold, amount: 0 };

  const callAmount = state.currentBet - bot.betThisRound;
  const canCheck = callAmount === 0;

  // Pre-flop decisions based on hole card strength
  if (state.phase === Phase.Preflop) {
    const strength = preflopStrength(bot.holeCards[0], bot.holeCards[1]);

    if (strength >= 0.8) {
      // Premium: raise to 3x BB (but at least min raise = 2x current bet)
      const minRaise = state.currentBet * 2;
      const targetRaise = Math.max(minRaise, state.bigBlind * 3);
      const raiseAmt = Math.min(targetRaise, bot.chips + bot.betThisRound);
      if (raiseAmt >= minRaise && raiseAmt > state.currentBet) {
        return { action: Action.Raise, amount: raiseAmt };
      }
      return callAmount > 0
        ? { action: Action.Call, amount: callAmount }
        : { action: Action.Check, amount: 0 };
    }
    if (strength >= 0.45) {
      // Playable: call or check
      if (canCheck) return { action: Action.Check, amount: 0 };
      if (callAmount <= state.bigBlind * 4) return { action: Action.Call, amount: callAmount };
      return { action: Action.Fold, amount: 0 };
    }
    // Weak: fold to bets, check if free
    if (canCheck) return { action: Action.Check, amount: 0 };
    return { action: Action.Fold, amount: 0 };
  }

  // Post-flop: evaluate actual hand strength
  const result = evaluateBestHand(
    [bot.holeCards[0], bot.holeCards[1]],
    state.communityCards,
  );

  // Strong hand (two pair+): bet or raise
  if (result.rank >= 3) {
    if (canCheck) {
      const betAmt = Math.min(Math.floor(state.pot * 0.6), bot.chips);
      if (betAmt >= state.bigBlind) {
        return { action: Action.Bet, amount: betAmt };
      }
      return { action: Action.Check, amount: 0 };
    }
    if (callAmount <= bot.chips) {
      return { action: Action.Call, amount: callAmount };
    }
    return { action: Action.AllIn, amount: bot.chips };
  }

  // Medium hand (pair): call small bets, check
  if (result.rank >= 2) {
    if (canCheck) return { action: Action.Check, amount: 0 };
    if (callAmount <= state.bigBlind * 3) return { action: Action.Call, amount: callAmount };
    return { action: Action.Fold, amount: 0 };
  }

  // Weak hand: check or fold
  if (canCheck) return { action: Action.Check, amount: 0 };

  // Bluff ~15% of the time
  if (Math.random() < 0.15 && callAmount <= state.bigBlind * 2) {
    return { action: Action.Call, amount: callAmount };
  }

  return { action: Action.Fold, amount: 0 };
}
