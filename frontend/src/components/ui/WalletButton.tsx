"use client";

import { motion } from "framer-motion";
import { useStarknet } from "@/providers/StarknetProvider";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function WalletButton() {
  const { address, username, isConnected, connecting, error, connectController, disconnect } = useStarknet();
  const { play } = useSoundEffects();

  if (isConnected) {
    const display = username || `${address!.slice(0, 6)}...${address!.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <div className="bg-black/60 px-3 py-1.5 border border-[var(--secondary)]/30 font-retro-display text-[8px] text-[var(--secondary)]">
          {display}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { play("click"); disconnect(); }}
          className="px-3 py-1.5 border border-white/20 bg-black/40 font-retro-display text-[8px] text-white/60 hover:text-white hover:border-white/40 transition-colors uppercase"
        >
          Disconnect
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { play("click"); connectController(); }}
        disabled={connecting}
        className="brand-btn-cyan px-4 py-2 font-retro-display text-[9px] uppercase disabled:opacity-50"
      >
        {connecting ? "CONNECTING..." : "CONNECT WALLET"}
      </motion.button>
      {error && (
        <span className="font-retro-display text-[7px] text-red-400 max-w-[200px] truncate">{error}</span>
      )}
    </div>
  );
}
