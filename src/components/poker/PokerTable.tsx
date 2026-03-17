"use client";

import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import CommunityCards from "./CommunityCards";
import BettingControls from "./BettingControls";
import GameResult from "./GameResult";
import PixelIcon from "@/components/ui/PixelIcon";
import type { GameState } from "@/lib/engine/types";
import { Action, Phase } from "@/lib/engine/types";

interface PokerTableProps {
  state: GameState;
  onAction: (action: Action, amount: number) => void;
  onPlayAgain: () => void;
}

export default function PokerTable({ state, onAction, onPlayAgain }: PokerTableProps) {
  const isPlayerTurn = state.currentTurn === 0 && !state.isHandOver;
  const isBettingPhase = [Phase.Preflop, Phase.Flop, Phase.Turn, Phase.River].includes(state.phase);
  const sbIndex = state.dealerIndex;
  const bbIndex = (state.dealerIndex + 1) % 2;
  const showBotCards = state.isHandOver && !state.players[1].hasFolded;
  const bot = state.players[1];
  const player = state.players[0];
  const botCard1 = showBotCards && bot.holeCards ? bot.holeCards[0] : 255;
  const botCard2 = showBotCards && bot.holeCards ? bot.holeCards[1] : 255;
  const botHasCards = bot.holeCards !== null && !bot.hasFolded;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-0 h-full max-h-[calc(100vh-60px)]">

      {/* ═══ TABLE ═══ */}
      <div className="relative flex-1 min-h-0 border-4 border-black bg-[#1a1a2e] pixel-border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]">
        {/* Rim */}
        <div className="absolute inset-0 border-[10px] border-[#2c2c44] shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] pointer-events-none z-10" />
        {/* Neon Underglow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--secondary)]/20 to-[var(--primary)]/20 blur-2xl opacity-30 pointer-events-none" />

        {/* Green felt */}
        <div
          className="dither-bg-dense absolute inset-[10px] rounded-sm shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] flex flex-col"
          style={{ background: "linear-gradient(135deg, #1a3a1a 0%, #2d5a27 50%, #1a3a1a 100%)" }}
        >
          <div className="scanline opacity-5" />
          <div className="pointer-events-none absolute inset-2 border border-white/5" />

          {/* ── Bot strip (top of felt) ── */}
          <div className="relative z-20 flex items-center justify-center gap-3 pt-3 pb-1">
            {/* Bot cards */}
            {botHasCards && (
              <div className="flex -space-x-5">
                <motion.div initial={{ rotate: -8, opacity: 0 }} animate={{ rotate: -6, opacity: 1 }} className="pixel-card-shadow">
                  <Card cardId={botCard1} small />
                </motion.div>
                <motion.div initial={{ rotate: 8, opacity: 0 }} animate={{ rotate: 6, opacity: 1 }} className="pixel-card-shadow">
                  <Card cardId={botCard2} small />
                </motion.div>
              </div>
            )}

            {/* Bot info */}
            <div className={`flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 pixel-border-sm ${bot.hasFolded ? "opacity-40" : ""}`}>
              <PixelIcon name="robot" size={16} />
              <div>
                <div className="font-retro-display text-[7px] text-white/50 uppercase">{bot.name}</div>
                <div className="font-retro-display text-[9px] text-white">{bot.chips.toLocaleString()} <span className="text-[7px] text-white/30">CHIPS</span></div>
              </div>
              {/* Badges */}
              <div className="flex gap-1 ml-1">
                {bot.isDealer && <div className="bg-white text-black px-1 py-0.5 font-retro-display text-[6px] border border-black">D</div>}
                {sbIndex === 1 && <div className="bg-[var(--secondary)] text-black px-1 py-0.5 font-retro-display text-[6px] border border-black">SB</div>}
                {bbIndex === 1 && <div className="bg-[var(--primary)] text-white px-1 py-0.5 font-retro-display text-[6px] border border-black">BB</div>}
              </div>
            </div>

            {/* Bot bet & status */}
            <AnimatePresence>
              {bot.betThisRound > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-[var(--secondary)] text-black px-2 py-0.5 font-retro-display text-[8px] pixel-border-sm font-bold">
                  {bot.betThisRound}
                </motion.div>
              )}
            </AnimatePresence>
            {bot.isAllIn && <div className="bg-red-600 text-white px-2 py-0.5 font-retro-display text-[6px] animate-pulse">ALL-IN</div>}
            {bot.hasFolded && <div className="text-slate-400 font-retro-display text-[7px] italic">Folded</div>}
            {state.currentTurn === 1 && isBettingPhase && !state.isHandOver && (
              <div className="bg-[var(--accent)] text-black px-2 py-0.5 font-retro-display text-[6px] pixel-border-sm animate-pulse">THINKING...</div>
            )}
          </div>

          {/* ── Phase badge ── */}
          <div className="relative z-20 flex justify-center py-1">
            <span className="bg-black/60 px-3 py-0.5 font-retro-display text-[8px] uppercase text-slate-400 pixel-border-sm">
              {state.phase}{state.isHandOver ? " - COMPLETE" : ""}
            </span>
          </div>

          {/* ── Community cards (center) ── */}
          <div className="relative z-20 flex-1 flex items-center justify-center">
            <CommunityCards cards={state.communityCards} />
          </div>

          {/* ── Pot ── */}
          <AnimatePresence>
            {state.pot > 0 && (
              <motion.div
                key="pot"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-20 flex items-center justify-center gap-2 py-1"
              >
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-3 w-3 rounded-full border border-black bg-[var(--accent)]" />
                  ))}
                </div>
                <motion.div key={state.pot} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                  className="border border-[var(--accent)] bg-black/70 px-3 py-1 font-retro-display text-[10px] text-[var(--accent)] pixel-border-sm">
                  POT: {state.pot.toLocaleString()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Player strip (bottom of felt) ── */}
          <div className="relative z-20 flex items-center justify-center gap-3 pb-3 pt-1">
            {/* Player bet & status */}
            <AnimatePresence>
              {player.betThisRound > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-[var(--secondary)] text-black px-2 py-0.5 font-retro-display text-[8px] pixel-border-sm font-bold">
                  {player.betThisRound}
                </motion.div>
              )}
            </AnimatePresence>
            {player.isAllIn && <div className="bg-red-600 text-white px-2 py-0.5 font-retro-display text-[6px] animate-pulse">ALL-IN</div>}

            {/* Player info */}
            <div className={`flex items-center gap-2 bg-black/60 border ${isPlayerTurn ? "border-[var(--accent)] shadow-[0_0_15px_rgba(255,215,0,0.3)]" : "border-[var(--secondary)]/30"} px-3 py-1.5 pixel-border-sm ${player.hasFolded ? "opacity-40" : ""}`}>
              <div>
                <div className="font-retro-display text-[7px] text-[var(--secondary)] uppercase">YOU</div>
                <div className="font-retro-display text-[9px] text-white">{player.chips.toLocaleString()} <span className="text-[7px] text-white/30">CHIPS</span></div>
              </div>
              <div className="flex gap-1 ml-1">
                {player.isDealer && <div className="bg-white text-black px-1 py-0.5 font-retro-display text-[6px] border border-black">D</div>}
                {sbIndex === 0 && <div className="bg-[var(--secondary)] text-black px-1 py-0.5 font-retro-display text-[6px] border border-black">SB</div>}
                {bbIndex === 0 && <div className="bg-[var(--primary)] text-white px-1 py-0.5 font-retro-display text-[6px] border border-black">BB</div>}
              </div>
            </div>

            {/* Player cards */}
            {player.holeCards && !player.hasFolded && (
              <div className="flex -space-x-3">
                <motion.div initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: -6, opacity: 1 }} className="pixel-card-shadow">
                  <Card cardId={player.holeCards[0]} />
                </motion.div>
                <motion.div initial={{ rotate: 10, opacity: 0 }} animate={{ rotate: 6, opacity: 1 }} className="pixel-card-shadow">
                  <Card cardId={player.holeCards[1]} />
                </motion.div>
              </div>
            )}
            {player.hasFolded && <div className="text-slate-400 font-retro-display text-[7px] italic">Folded</div>}
          </div>
        </div>
      </div>

      {/* ═══ BETTING CONTROLS (below table, fixed height) ═══ */}
      <div className="shrink-0">
        {isBettingPhase && !state.isHandOver && (
          <BettingControls
            currentBet={state.currentBet}
            playerBet={player.betThisRound}
            playerChips={player.chips}
            bigBlind={state.bigBlind}
            isPlayerTurn={isPlayerTurn}
            onAction={onAction}
          />
        )}
      </div>

      {/* Game Result Overlay */}
      {state.isHandOver && (
        <GameResult state={state} onPlayAgain={onPlayAgain} />
      )}
    </div>
  );
}
