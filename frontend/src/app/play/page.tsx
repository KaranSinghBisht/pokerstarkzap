"use client";

import Image from "next/image";
import PokerTable from "@/components/poker/PokerTable";
import WalletButton from "@/components/ui/WalletButton";
import PixelIcon from "@/components/ui/PixelIcon";
import { usePokerGame } from "@/hooks/usePokerGame";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function PlayPage() {
  const { state, handleAction, handlePlayAgain } = usePokerGame();
  const { isPlaying, toggle } = useBackgroundMusic();
  const { play } = useSoundEffects();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="brand-topbar px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="PokerZap" width={24} height={24} />
            <span className="font-retro-display text-[9px] text-[var(--primary)] glow-text-primary tracking-wider">
              POKERZAP
            </span>
          </a>
          <span className="font-retro-display text-[7px] text-white/20">|</span>
          <span className="font-retro-display text-[7px] text-white/40">
            HAND #{state.handNumber}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { play("click"); toggle(); }}
            className={`px-2 py-1 border font-retro-display text-[8px] transition-colors flex items-center gap-1 ${
              isPlaying
                ? "border-[var(--primary)]/50 text-[var(--primary)] bg-[var(--primary)]/10"
                : "border-white/15 text-white/40 hover:text-white/60"
            }`}
            title={isPlaying ? "Mute music" : "Play music"}
          >
            <PixelIcon name="note" size={12} /> {isPlaying ? "ON" : "OFF"}
          </button>
          <WalletButton />
        </div>
      </header>

      {/* Game Area — fills remaining height */}
      <main className="flex-1 min-h-0 flex items-center justify-center p-3">
        <PokerTable
          state={state}
          onAction={handleAction}
          onPlayAgain={handlePlayAgain}
        />
      </main>
    </div>
  );
}
