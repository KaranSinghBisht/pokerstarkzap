"use client";

import { useCallback } from "react";

type SoundName = "click" | "fold" | "check" | "call" | "allIn" | "raise" | "deal";

let audioCtx: AudioContext | null = null;
let ctxReady = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    ctxReady = audioCtx.state === "running";
    if (!ctxReady) {
      audioCtx.resume().then(() => { ctxReady = true; });
    }
  } else if (!ctxReady || audioCtx.state === "suspended") {
    audioCtx.resume().then(() => { ctxReady = true; });
  }
  return audioCtx;
}

function playClick() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.35, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

function playFold() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.linearRampToValueAtTime(180, t + 0.2);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);
}

function playCheck() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 660;
  gain.gain.setValueAtTime(0.35, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

function playCall() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.linearRampToValueAtTime(780, t + 0.15);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

function playAllIn() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(1320, t + 0.35);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.setValueAtTime(0.3, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.35);

  // Extra punch: a second oscillator an octave up
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(440, t + 0.1);
  osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.35);
  gain2.gain.setValueAtTime(0.15, t + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t + 0.1);
  osc2.stop(t + 0.35);
}

function playRaise() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "square";
  osc1.frequency.value = 660;
  gain1.gain.setValueAtTime(0.3, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.08);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "square";
  osc2.frequency.value = 880;
  gain2.gain.setValueAtTime(0.3, t + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t + 0.12);
  osc2.stop(t + 0.2);
}

function playDeal() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Swoosh: descending filtered noise-like sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(1800, t);
  osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);

  // Snap at the end
  const snap = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snap.type = "square";
  snap.frequency.value = 1200;
  snapGain.gain.setValueAtTime(0.2, t + 0.05);
  snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  snap.connect(snapGain).connect(ctx.destination);
  snap.start(t + 0.05);
  snap.stop(t + 0.1);
}

const SOUNDS: Record<SoundName, () => void> = {
  click: playClick,
  fold: playFold,
  check: playCheck,
  call: playCall,
  allIn: playAllIn,
  raise: playRaise,
  deal: playDeal,
};

export function useSoundEffects() {
  const play = useCallback((sound: SoundName) => {
    try {
      SOUNDS[sound]();
    } catch {
      // Silently ignore audio errors (e.g. context not allowed yet)
    }
  }, []);

  return { play };
}
