// src/hooks/useSound.js
// Lightweight sound effects using Web Audio API — no assets needed.
// Respects a global "sound enabled" preference stored in localStorage.

const STORAGE_KEY = "ui-sound-enabled";

export const isSoundEnabled = () => {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === null ? true : v === "true";
};

export const setSoundEnabled = (enabled) => {
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event("ui-sound-changed"));
};

// Lazy-initialized AudioContext (must be after a user gesture on some browsers)
let ctx = null;
const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

/**
 * Play a short tone.
 * @param {number} freq - Hz
 * @param {number} duration - seconds
 * @param {number} [delay] - seconds
 * @param {number} [gain] - 0..1 volume
 * @param {OscillatorType} [type] - "sine" | "triangle" | "square" | ...
 */
const playTone = (freq, duration, delay = 0, gain = 0.15, type = "sine") => {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // soft attack + exponential decay so it doesn't click
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
};

export const sounds = {
  // two-note rising chime (C5 -> E5)
  success: () => {
    if (!isSoundEnabled()) return;
    playTone(523.25, 0.18, 0, 0.13, "sine"); // C5
    playTone(659.25, 0.28, 0.1, 0.13, "sine"); // E5
  },
  // gentle error blip (low -> lower)
  error: () => {
    if (!isSoundEnabled()) return;
    playTone(320, 0.12, 0, 0.12, "triangle");
    playTone(220, 0.18, 0.08, 0.12, "triangle");
  },
  // soft tick for typing (optional)
  tick: () => {
    if (!isSoundEnabled()) return;
    playTone(1200, 0.035, 0, 0.05, "square");
  },
  // subtle notification pop
  pop: () => {
    if (!isSoundEnabled()) return;
    playTone(880, 0.09, 0, 0.08, "sine");
  },
};