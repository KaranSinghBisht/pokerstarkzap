/**
 * Poker game state machine.
 * Manages a heads-up (2-player) Texas Hold'em game.
 */

import { type GameState, type Player, Phase, Action } from "./types";
import { createDeck, shuffleDeck, dealCards } from "./deck";
import { evaluateBestHand, compareHands } from "./evaluator";

const STARTING_CHIPS = 1000;
const SMALL_BLIND = 10;
const BIG_BLIND = 20;

function createPlayer(id: number, name: string, chips: number): Player {
  return {
    id,
    name,
    chips,
    holeCards: null,
    betThisRound: 0,
    totalBet: 0,
    hasFolded: false,
    hasActed: false,
    isAllIn: false,
    isDealer: false,
  };
}

export function createInitialState(): GameState {
  return {
    phase: Phase.Preflop,
    players: [
      createPlayer(0, "YOU", STARTING_CHIPS),
      createPlayer(1, "DEALER BOT", STARTING_CHIPS),
    ],
    communityCards: [],
    deck: [],
    pot: 0,
    currentBet: 0,
    currentTurn: 0,
    dealerIndex: 1,
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    handNumber: 0,
    winner: null,
    winningHandName: null,
    isHandOver: false,
  };
}

export function startNewHand(prev: GameState): GameState {
  // Guard: don't start if either player is bust
  if (prev.players[0].chips <= 0 || prev.players[1].chips <= 0) {
    return prev;
  }

  const dealerIndex = prev.handNumber === 0 ? 1 : (prev.dealerIndex + 1) % 2;
  const sbIndex = dealerIndex; // In heads-up, dealer is SB
  const bbIndex = (dealerIndex + 1) % 2;

  const deck = shuffleDeck(createDeck());
  const { dealt: hole1, remaining: r1 } = dealCards(deck, 2);
  const { dealt: hole2, remaining: r2 } = dealCards(r1, 2);

  const players: [Player, Player] = [
    {
      ...createPlayer(0, prev.players[0].name, prev.players[0].chips),
      holeCards: [hole1[0], hole1[1]],
      isDealer: dealerIndex === 0,
    },
    {
      ...createPlayer(1, prev.players[1].name, prev.players[1].chips),
      holeCards: [hole2[0], hole2[1]],
      isDealer: dealerIndex === 1,
    },
  ];

  // Post blinds
  const sbAmount = Math.min(SMALL_BLIND, players[sbIndex].chips);
  const bbAmount = Math.min(BIG_BLIND, players[bbIndex].chips);

  players[sbIndex].chips -= sbAmount;
  players[sbIndex].betThisRound = sbAmount;
  players[sbIndex].totalBet = sbAmount;
  if (players[sbIndex].chips === 0) players[sbIndex].isAllIn = true;

  players[bbIndex].chips -= bbAmount;
  players[bbIndex].betThisRound = bbAmount;
  players[bbIndex].totalBet = bbAmount;
  if (players[bbIndex].chips === 0) players[bbIndex].isAllIn = true;

  // Pre-flop: SB (dealer) acts first in heads-up
  const firstToAct = sbIndex;

  return {
    phase: Phase.Preflop,
    players,
    communityCards: [],
    deck: r2,
    pot: sbAmount + bbAmount,
    currentBet: bbAmount,
    currentTurn: firstToAct,
    dealerIndex,
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    handNumber: prev.handNumber + 1,
    winner: null,
    winningHandName: null,
    isHandOver: false,
  };
}

function advancePhase(state: GameState): GameState {
  const next = { ...state, players: [...state.players] as [Player, Player] };

  // Reset round betting
  next.players[0] = { ...next.players[0], betThisRound: 0, hasActed: false };
  next.players[1] = { ...next.players[1], betThisRound: 0, hasActed: false };
  next.currentBet = 0;

  // Post-flop: non-dealer acts first in heads-up
  const firstToAct = (next.dealerIndex + 1) % 2;
  next.currentTurn = firstToAct;

  // If both players are all-in, run out remaining community cards
  const bothAllIn = next.players[0].isAllIn && next.players[1].isAllIn;
  const neitherFolded = !next.players[0].hasFolded && !next.players[1].hasFolded;

  if (bothAllIn && neitherFolded) {
    let deck = [...next.deck];
    const cc = [...next.communityCards];

    while (cc.length < 5) {
      deck = deck.slice(1); // burn
      cc.push(deck[0]);     // deal
      deck = deck.slice(1);
    }

    next.communityCards = cc;
    next.deck = deck;
    next.phase = Phase.Showdown;
    return resolveShowdown(next);
  }

  switch (next.phase) {
    case Phase.Preflop: {
      const d1 = next.deck.slice(1); // burn 1
      next.communityCards = [d1[0], d1[1], d1[2]];
      next.deck = d1.slice(3);
      next.phase = Phase.Flop;
      break;
    }
    case Phase.Flop: {
      const d2 = next.deck.slice(1);
      next.communityCards = [...next.communityCards, d2[0]];
      next.deck = d2.slice(1);
      next.phase = Phase.Turn;
      break;
    }
    case Phase.Turn: {
      const d3 = next.deck.slice(1);
      next.communityCards = [...next.communityCards, d3[0]];
      next.deck = d3.slice(1);
      next.phase = Phase.River;
      break;
    }
    case Phase.River: {
      next.phase = Phase.Showdown;
      return resolveShowdown(next);
    }
    default:
      break;
  }

  // If one player is all-in, skip betting — advance again
  if (next.players[0].isAllIn || next.players[1].isAllIn) {
    return advancePhase(next);
  }

  return next;
}

function resolveShowdown(state: GameState): GameState {
  const next = { ...state, players: [...state.players] as [Player, Player] };
  next.isHandOver = true;

  const p0 = next.players[0];
  const p1 = next.players[1];

  if (p0.hasFolded) {
    next.winner = 1;
    next.winningHandName = "Opponent folded";
    next.players[1] = { ...p1, chips: p1.chips + next.pot };
    return next;
  }
  if (p1.hasFolded) {
    next.winner = 0;
    next.winningHandName = "Opponent folded";
    next.players[0] = { ...p0, chips: p0.chips + next.pot };
    return next;
  }

  const hand0 = evaluateBestHand(p0.holeCards!, next.communityCards);
  const hand1 = evaluateBestHand(p1.holeCards!, next.communityCards);
  const cmp = compareHands(hand0, hand1);

  if (cmp > 0) {
    next.winner = 0;
    next.winningHandName = hand0.name;
    next.players[0] = { ...p0, chips: p0.chips + next.pot };
  } else if (cmp < 0) {
    next.winner = 1;
    next.winningHandName = hand1.name;
    next.players[1] = { ...p1, chips: p1.chips + next.pot };
  } else {
    next.winner = -1;
    next.winningHandName = `Split pot (${hand0.name})`;
    const half = Math.floor(next.pot / 2);
    next.players[0] = { ...p0, chips: p0.chips + half };
    next.players[1] = { ...p1, chips: p1.chips + (next.pot - half) };
  }

  return next;
}

function isRoundOver(state: GameState): boolean {
  const p0 = state.players[0];
  const p1 = state.players[1];

  if (p0.hasFolded || p1.hasFolded) return true;

  // If either is all-in and the other has acted, round is done
  if ((p0.isAllIn || p1.isAllIn) && p0.hasActed && p1.hasActed) return true;

  const bothActed = p0.hasActed && p1.hasActed;
  const betsEqual = p0.betThisRound === p1.betThisRound;

  return bothActed && betsEqual;
}

export function applyAction(
  state: GameState,
  playerIndex: number,
  action: Action,
  amount: number = 0,
): GameState {
  if (state.isHandOver) return state;
  if (state.currentTurn !== playerIndex) return state;

  const next = {
    ...state,
    players: [{ ...state.players[0] }, { ...state.players[1] }] as [Player, Player],
  };
  const player = next.players[playerIndex];
  const opponent = next.players[(playerIndex + 1) % 2];

  switch (action) {
    case Action.Fold:
      player.hasFolded = true;
      player.hasActed = true;
      return resolveShowdown(next);

    case Action.Check:
      if (next.currentBet > player.betThisRound) return state;
      player.hasActed = true;
      break;

    case Action.Call: {
      const callAmt = Math.max(0, Math.min(next.currentBet - player.betThisRound, player.chips));
      if (callAmt <= 0) {
        // Nothing to call — treat as check
        player.hasActed = true;
        break;
      }
      player.chips -= callAmt;
      player.betThisRound += callAmt;
      player.totalBet += callAmt;
      next.pot += callAmt;
      player.hasActed = true;
      if (player.chips === 0) player.isAllIn = true;
      break;
    }

    case Action.Bet: {
      // Bet is only valid when no outstanding bet
      if (next.currentBet > player.betThisRound) return state;
      const betAmt = Math.min(amount, player.chips);
      if (betAmt < next.bigBlind && betAmt < player.chips) return state;
      player.chips -= betAmt;
      player.betThisRound += betAmt;
      player.totalBet += betAmt;
      next.pot += betAmt;
      next.currentBet = player.betThisRound;
      player.hasActed = true;
      if (!opponent.isAllIn) opponent.hasActed = false;
      if (player.chips === 0) player.isAllIn = true;
      break;
    }

    case Action.Raise: {
      const totalNeeded = amount;
      // Validate minimum raise: must be at least 2x current bet (or all-in)
      const minRaise = next.currentBet * 2;
      if (totalNeeded < minRaise && totalNeeded < player.chips + player.betThisRound) {
        return state; // undersized raise, not an all-in
      }
      const raiseAmt = Math.min(totalNeeded, player.chips + player.betThisRound);
      const toAdd = raiseAmt - player.betThisRound;
      if (toAdd <= 0) return state;
      player.chips -= toAdd;
      player.betThisRound = raiseAmt;
      player.totalBet += toAdd;
      next.pot += toAdd;
      next.currentBet = raiseAmt;
      player.hasActed = true;
      if (!opponent.isAllIn) opponent.hasActed = false;
      if (player.chips === 0) player.isAllIn = true;
      break;
    }

    case Action.AllIn: {
      const allInAmt = player.chips;
      player.betThisRound += allInAmt;
      player.totalBet += allInAmt;
      next.pot += allInAmt;
      player.chips = 0;
      player.isAllIn = true;
      player.hasActed = true;
      if (player.betThisRound > next.currentBet) {
        next.currentBet = player.betThisRound;
        if (!opponent.isAllIn) opponent.hasActed = false;
      }
      break;
    }
  }

  if (isRoundOver(next)) {
    return advancePhase(next);
  }

  // If opponent is all-in, they can't act — round is effectively over
  if (opponent.isAllIn && player.hasActed) {
    return advancePhase(next);
  }

  next.currentTurn = (playerIndex + 1) % 2;
  return next;
}
