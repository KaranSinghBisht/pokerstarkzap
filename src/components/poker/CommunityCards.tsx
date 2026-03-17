"use client";

import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";

interface CommunityCardsProps {
  cards: number[]; // array of card IDs (0-51), length 0-5
}

const dealIn = {
  initial: { opacity: 0, y: 20, scale: 0.85 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 320, damping: 24 },
};

export default function CommunityCards({ cards }: CommunityCardsProps) {
  const flop = cards.slice(0, 3);
  const turn = cards[3];
  const river = cards[4];

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Flop */}
      <AnimatePresence>
        {flop.length > 0 ? (
          flop.map((id, i) => (
            <motion.div
              key={`flop-${i}`}
              {...dealIn}
              transition={{ ...dealIn.transition, delay: i * 0.1 }}
            >
              <Card cardId={id} />
            </motion.div>
          ))
        ) : (
          <>
            <div className="h-20 w-14 border-2 border-dashed border-white/20 bg-black/20" />
            <div className="h-20 w-14 border-2 border-dashed border-white/20 bg-black/20" />
            <div className="h-20 w-14 border-2 border-dashed border-white/20 bg-black/20" />
          </>
        )}
      </AnimatePresence>

      {/* Turn */}
      <div className="ml-1">
        <AnimatePresence>
          {turn !== undefined ? (
            <motion.div key="turn" {...dealIn}>
              <Card cardId={turn} />
            </motion.div>
          ) : (
            <div className="flex h-20 w-14 items-center justify-center border-2 border-dashed border-white/20 bg-black/20 font-retro-display text-[8px] text-white/30">
              TURN
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* River */}
      <div className="ml-1">
        <AnimatePresence>
          {river !== undefined ? (
            <motion.div key="river" {...dealIn}>
              <Card cardId={river} />
            </motion.div>
          ) : (
            <div className="flex h-20 w-14 items-center justify-center border-2 border-dashed border-white/20 bg-black/20 font-retro-display text-[8px] text-white/30">
              RIVER
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
