"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import WalletButton from "@/components/ui/WalletButton";
import PixelIcon from "@/components/ui/PixelIcon";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function LandingPage() {
  const { play } = useSoundEffects();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="brand-topbar px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="PokerZap" width={32} height={32} className="pixel-border-sm" />
          <span className="font-retro-display text-[10px] text-[var(--primary)] glow-text-primary tracking-wider">
            POKERZAP
          </span>
        </div>
        <WalletButton />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="retro-grid-container absolute inset-0 pointer-events-none overflow-hidden">
          <div className="retro-grid" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <Image
              src="/logo.png"
              alt="PokerZap Logo"
              width={120}
              height={120}
              className="mx-auto drop-shadow-[0_0_30px_rgba(255,0,255,0.4)]"
              priority
            />
          </motion.div>

          <h1 className="font-retro-display text-4xl md:text-5xl text-[var(--primary)] glow-text-primary mb-4 leading-relaxed">
            POKER<span className="text-[var(--secondary)]">ZAP</span>
          </h1>

          <p className="font-retro-body text-2xl text-white/70 mb-2 max-w-md mx-auto">
            Texas Hold&apos;em on Starknet
          </p>
          <p className="font-retro-body text-lg text-white/50 mb-10 max-w-md mx-auto">
            Gasless play. Instant connect. Powered by StarkZap.
          </p>

          <Link href="/play">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => play("click")}
              className="brand-btn-primary px-12 py-4 font-retro-display text-sm uppercase tracking-wider"
            >
              PLAY NOW
            </motion.button>
          </Link>

          {/* Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="brand-panel p-5 text-center">
              <div className="flex justify-center mb-3"><PixelIcon name="lightning" size={32} /></div>
              <div className="font-retro-display text-[9px] text-[var(--secondary)] mb-2">GASLESS</div>
              <div className="font-retro-body text-base text-white/50">No gas fees via AVNU Paymaster</div>
            </div>
            <div className="brand-panel p-5 text-center">
              <div className="flex justify-center mb-3"><PixelIcon name="gamepad" size={32} /></div>
              <div className="font-retro-display text-[9px] text-[var(--accent)] mb-2">INSTANT CONNECT</div>
              <div className="font-retro-body text-base text-white/50">One-click via Cartridge Controller</div>
            </div>
            <div className="brand-panel p-5 text-center">
              <div className="flex justify-center mb-3"><PixelIcon name="card" size={32} /></div>
              <div className="font-retro-display text-[9px] text-[var(--primary)] mb-2">HEADS-UP POKER</div>
              <div className="font-retro-body text-base text-white/50">Play vs bot with retro pixel UI</div>
            </div>
          </div>

          {/* Powered By */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <span className="font-retro-display text-[8px] text-white/30 uppercase">Powered by</span>
            <span className="font-retro-display text-[9px] text-[var(--secondary)]">StarkZap</span>
            <span className="font-retro-display text-[8px] text-white/30">+</span>
            <span className="font-retro-display text-[9px] text-[var(--accent)]">Starknet</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
