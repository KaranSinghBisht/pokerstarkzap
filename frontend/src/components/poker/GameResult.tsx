"use client";

import { motion } from "framer-motion";
import type { GameState } from "@/lib/engine/types";

interface GameResultProps {
  state: GameState;
  onPlayAgain: () => void;
}

export default function GameResult({ state, onPlayAgain }: GameResultProps) {
  const playerWon = state.winner === 0;
  const isTie = state.winner === -1;
  const botWon = state.winner === 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div className="border-4 border-black bg-[#0a0a18] p-8 pixel-border text-center max-w-sm">
        <div className="mb-2 font-retro-display text-[8px] text-white/40 uppercase tracking-widest">
          Hand #{state.handNumber}
        </div>

        {playerWon && (
          <>
            <div className="font-retro-display text-2xl text-[var(--accent)] glow-text-primary mb-2">
              YOU WIN!
            </div>
            <div className="font-retro-display text-sm text-[var(--secondary)]">
              +{state.pot} CHIPS
            </div>
          </>
        )}

        {botWon && (
          <>
            <div className="font-retro-display text-2xl text-[var(--danger)] mb-2">
              YOU LOSE
            </div>
            <div className="font-retro-display text-sm text-white/60">
              -{state.players[0].totalBet} CHIPS
            </div>
          </>
        )}

        {isTie && (
          <>
            <div className="font-retro-display text-2xl text-white mb-2">
              SPLIT POT
            </div>
            <div className="font-retro-display text-sm text-white/60">
              Chips returned
            </div>
          </>
        )}

        {state.winningHandName && (
          <div className="mt-3 font-retro-body text-lg text-white/80">
            {state.winningHandName}
          </div>
        )}

        <div className="mt-4 flex justify-center gap-4">
          <div className="text-center">
            <div className="font-retro-display text-[7px] text-white/40">YOUR STACK</div>
            <div className="font-retro-display text-sm text-[var(--secondary)]">
              {state.players[0].chips.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="font-retro-display text-[7px] text-white/40">BOT STACK</div>
            <div className="font-retro-display text-sm text-white/60">
              {state.players[1].chips.toLocaleString()}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="mt-6 brand-btn-primary px-8 py-3 font-retro-display text-[10px] uppercase tracking-wider"
        >
          DEAL NEXT HAND
        </motion.button>

        {(state.players[0].chips === 0 || state.players[1].chips === 0) && (
          <div className="mt-4 font-retro-display text-[9px] text-[var(--accent)]">
            {state.players[0].chips === 0 ? "GAME OVER - Bot wins the match!" : "GAME OVER - You win the match!"}
          </div>
        )}
      </div>
    </motion.div>
  );
}
