"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Action } from "@/lib/engine/types";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface BettingControlsProps {
  currentBet: number;
  playerBet: number;
  playerChips: number;
  bigBlind: number;
  isPlayerTurn: boolean;
  onAction: (action: Action, amount: number) => void;
}

function ActionBtn({ onClick, color, label, sub, disabled }: {
  onClick: () => void; color: string; label: string; sub?: string; disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92, y: 2 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative h-12 px-5 flex flex-col items-center justify-center border-b-4 rounded-sm font-retro-display transition-all ${disabled ? "bg-slate-800 border-slate-900 opacity-40 grayscale" : color} pixel-border-sm`}
    >
      <div className="text-[9px] text-black font-bold uppercase tracking-tight">{label}</div>
      {sub && <div className="text-[7px] text-black/50 uppercase">{sub}</div>}
      <div className="absolute top-0.5 left-0.5 right-0.5 h-1/2 bg-white/20 rounded-t-sm pointer-events-none" />
    </motion.button>
  );
}

export default function BettingControls({
  currentBet, playerBet, playerChips, bigBlind, isPlayerTurn, onAction,
}: BettingControlsProps) {
  const [betAmount, setBetAmount] = useState<string>("");
  const { play } = useSoundEffects();

  const callAmount = currentBet - playerBet;
  const canCheck = callAmount === 0;
  const canCall = callAmount > 0 && playerChips >= callAmount;
  const minRaise = currentBet > 0 ? currentBet * 2 : bigBlind;
  const canBet = playerChips > callAmount;

  const commitBet = () => {
    const amt = Number(betAmount.replace(/[^0-9]/g, "") || "0");
    if (amt >= minRaise) {
      play("raise");
      onAction(currentBet > 0 ? Action.Raise : Action.Bet, amt);
      setBetAmount("");
    }
  };

  if (!isPlayerTurn) {
    return (
      <div className="bg-black/80 px-4 py-3 flex items-center justify-center gap-3 border-t-2 border-black">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="font-retro-display text-[9px] text-[var(--primary)] uppercase tracking-widest glow-text-primary">
          WAITING FOR OPPONENT...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#08080f] border-t-4 border-black px-3 py-2 relative overflow-hidden">
      <div className="absolute inset-0 dither-bg opacity-3" />
      <div className="relative z-10 flex items-center gap-3 justify-center flex-wrap">
        {/* Action buttons */}
        <div className="flex gap-2">
          <ActionBtn label="FOLD" color="bg-[#ff003c] border-[#80001e] shadow-[0_0_12px_rgba(255,0,60,0.2)]" onClick={() => { play("fold"); onAction(Action.Fold, 0); }} />
          {canCheck ? (
            <ActionBtn label="CHECK" color="bg-[#00f3ff] border-[#007a80] shadow-[0_0_12px_rgba(0,243,255,0.2)]" onClick={() => { play("check"); onAction(Action.Check, 0); }} />
          ) : (
            <ActionBtn label="CALL" sub={callAmount.toString()} color="bg-[#00f3ff] border-[#007a80] shadow-[0_0_12px_rgba(0,243,255,0.2)]" disabled={!canCall} onClick={() => { play("call"); onAction(Action.Call, callAmount); }} />
          )}
          <ActionBtn label="ALL IN" color="bg-[#00ff66] border-[#008033] shadow-[0_0_12px_rgba(0,255,102,0.2)]" onClick={() => { play("allIn"); onAction(Action.AllIn, playerChips); }} />
        </div>

        {/* Raise slider — compact inline */}
        {canBet && (
          <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1.5 pixel-border-sm">
            <div className="flex gap-1">
              {[
                { label: "\u00BD", val: Math.max(minRaise, Math.floor(playerChips / 2)) },
                { label: "POT", val: Math.max(minRaise, currentBet || bigBlind) },
              ].map((p) => (
                <button key={p.label} onClick={() => setBetAmount(String(p.val))}
                  className="px-2 py-1 bg-white/5 border border-white/10 font-retro-display text-[7px] hover:bg-white/15 transition-colors uppercase">
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={minRaise}
              max={playerChips}
              value={Math.max(minRaise, Number(betAmount || minRaise))}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-24 h-6 cursor-pointer appearance-none bg-transparent accent-[var(--primary)]"
            />
            <span className="font-retro-display text-[10px] text-[var(--accent)] min-w-[40px] text-right">{betAmount || minRaise}</span>
            <button onClick={commitBet} disabled={!canBet}
              className="px-3 py-1 bg-[var(--secondary)] text-black font-retro-display text-[8px] hover:brightness-110 active:scale-95 disabled:opacity-30 uppercase pixel-border-sm">
              RAISE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
