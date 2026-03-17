export enum Phase {
  Preflop = "Preflop",
  Flop = "Flop",
  Turn = "Turn",
  River = "River",
  Showdown = "Showdown",
}

export enum Action {
  Fold = "Fold",
  Check = "Check",
  Call = "Call",
  Bet = "Bet",
  Raise = "Raise",
  AllIn = "AllIn",
}

export interface Card {
  id: number; // 0-51
}

export interface Player {
  id: number; // 0 = human, 1 = bot
  name: string;
  chips: number;
  holeCards: [number, number] | null;
  betThisRound: number;
  totalBet: number;
  hasFolded: boolean;
  hasActed: boolean;
  isAllIn: boolean;
  isDealer: boolean;
}

export interface GameState {
  phase: Phase;
  players: [Player, Player]; // always 2: human (0), bot (1)
  communityCards: number[];
  deck: number[];
  pot: number;
  currentBet: number;
  currentTurn: number; // index into players
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  handNumber: number;
  winner: number | null; // player index or null
  winningHandName: string | null;
  isHandOver: boolean;
}

export interface ActionResult {
  nextState: GameState;
  phaseAdvanced: boolean;
}
