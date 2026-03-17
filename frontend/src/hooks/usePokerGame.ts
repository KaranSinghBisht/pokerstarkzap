"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { type GameState, Action } from "@/lib/engine/types";
import { createInitialState, startNewHand, applyAction } from "@/lib/engine/game";
import { decideBotAction } from "@/lib/engine/bot";

export function usePokerGame() {
  const [state, setState] = useState<GameState>(() => {
    const initial = createInitialState();
    return startNewHand(initial);
  });

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up bot timer on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  // Bot auto-play when it's bot's turn
  useEffect(() => {
    if (state.isHandOver || state.currentTurn !== 1) return;

    // Add thinking delay for UX
    const delay = 800 + Math.random() * 1200;
    botTimerRef.current = setTimeout(() => {
      setState((prev) => {
        if (prev.isHandOver || prev.currentTurn !== 1) return prev;
        const decision = decideBotAction(prev);
        return applyAction(prev, 1, decision.action, decision.amount);
      });
    }, delay);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [state.currentTurn, state.isHandOver, state.phase, state.handNumber]);

  const handleAction = useCallback((action: Action, amount: number) => {
    setState((prev) => {
      if (prev.isHandOver || prev.currentTurn !== 0) return prev;
      return applyAction(prev, 0, action, amount);
    });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setState((prev) => {
      // If a player is busted, reset chips
      if (prev.players[0].chips === 0 || prev.players[1].chips === 0) {
        const fresh = createInitialState();
        return startNewHand(fresh);
      }
      return startNewHand(prev);
    });
  }, []);

  return { state, handleAction, handlePlayAgain };
}
