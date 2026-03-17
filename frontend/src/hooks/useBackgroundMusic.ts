"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Generates a looping retro synth background track using Web Audio API.
 * Produces a chill lo-fi chip-tune vibe with bass, arpeggios, and pads.
 */

// Musical notes (frequencies in Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

// Chord progression: Am - F - C - G (classic chill loop)
const CHORDS = [
  [NOTE.A3, NOTE.C4, NOTE.E4],     // Am
  [NOTE.A3, NOTE.C4, NOTE.E4],     // Am
  [NOTE.G3, NOTE.C4, NOTE.E4],     // C/G
  [NOTE.G3, NOTE.B3, NOTE.D4],     // G
];

const BASS_LINE = [NOTE.A3, NOTE.A3, NOTE.C3, NOTE.G3];
const ARP_NOTES = [
  [NOTE.A4, NOTE.C5, NOTE.E5, NOTE.C5],
  [NOTE.A4, NOTE.C5, NOTE.E5, NOTE.C5],
  [NOTE.G4, NOTE.C5, NOTE.E5, NOTE.C5],
  [NOTE.G4, NOTE.B4, NOTE.D5, NOTE.B4],
];

const BPM = 75;
const BEAT_SEC = 60 / BPM;
const BAR_SEC = BEAT_SEC * 4;
const LOOP_SEC = BAR_SEC * CHORDS.length;

function createSynthLoop(ctx: AudioContext): { start: () => void; stop: () => void } {
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  const sources: OscillatorNode[] = [];
  let running = false;

  function scheduleBar(barIndex: number, startTime: number) {
    const chord = CHORDS[barIndex % CHORDS.length];
    const bass = BASS_LINE[barIndex % BASS_LINE.length];
    const arps = ARP_NOTES[barIndex % ARP_NOTES.length];

    // Bass (triangle wave, sub)
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "triangle";
    bassOsc.frequency.value = bass / 2;
    bassGain.gain.setValueAtTime(0.35, startTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, startTime + BAR_SEC - 0.05);
    bassOsc.connect(bassGain).connect(master);
    bassOsc.start(startTime);
    bassOsc.stop(startTime + BAR_SEC);
    sources.push(bassOsc);

    // Pad (soft saw chords)
    for (const freq of chord) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      filter.type = "lowpass";
      filter.frequency.value = 800;
      filter.Q.value = 1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.3);
      gain.gain.linearRampToValueAtTime(0.04, startTime + BAR_SEC - 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + BAR_SEC);
      osc.connect(filter).connect(gain).connect(master);
      osc.start(startTime);
      osc.stop(startTime + BAR_SEC + 0.1);
      sources.push(osc);
    }

    // Arpeggio (square wave, 16th notes)
    for (let i = 0; i < 4; i++) {
      const arpFreq = arps[i];
      for (let sub = 0; sub < 4; sub++) {
        const t = startTime + (i * BEAT_SEC) + (sub * BEAT_SEC / 4);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = arpFreq;
        gain.gain.setValueAtTime(sub === 0 ? 0.06 : 0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + BEAT_SEC / 4 - 0.02);
        osc.connect(gain).connect(master);
        osc.start(t);
        osc.stop(t + BEAT_SEC / 4);
        sources.push(osc);
      }
    }
  }

  function scheduleLoop(offset: number) {
    for (let bar = 0; bar < CHORDS.length; bar++) {
      scheduleBar(bar, offset + bar * BAR_SEC);
    }
  }

  let nextLoopTime = 0;
  let timerId: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      if (running) return;
      running = true;
      nextLoopTime = ctx.currentTime + 0.1;
      scheduleLoop(nextLoopTime);
      nextLoopTime += LOOP_SEC;

      // Schedule next loop before current one ends
      timerId = setInterval(() => {
        if (!running) return;
        if (ctx.currentTime > nextLoopTime - 2) {
          scheduleLoop(nextLoopTime);
          nextLoopTime += LOOP_SEC;
        }
      }, 1000);
    },
    stop() {
      running = false;
      if (timerId) clearInterval(timerId);
      for (const s of sources) {
        try { s.stop(); } catch { /* already stopped */ }
      }
      sources.length = 0;
    },
  };
}

export function useBackgroundMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = useCallback(() => {
    if (isPlaying) {
      synthRef.current?.stop();
      ctxRef.current?.close();
      ctxRef.current = null;
      synthRef.current = null;
      setIsPlaying(false);
    } else {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const synth = createSynthLoop(ctx);
      synthRef.current = synth;
      synth.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  return { isPlaying, toggle };
}
