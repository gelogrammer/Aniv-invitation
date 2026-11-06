"use client";

import { config } from "./config";

/**
 * Background music.
 * - If config.musicFile is set (e.g. "music/our-song.mp3" in /public), that song loops.
 * - Otherwise a soft music-box melody is played, generated live in the browser.
 * Browsers only allow sound after a tap, so start() is called when she taps the seal.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const VOLUME = 0.32;
const BPM = 70;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// A Pachelbel-style progression in C: C – G – Am – Em – F – C – F – G
const BARS: { bass: number; chord: number[]; melody: [number, number] }[] = [
  { bass: 48, chord: [60, 64, 67], melody: [76, 79] },
  { bass: 43, chord: [59, 62, 67], melody: [74, 71] },
  { bass: 45, chord: [60, 64, 69], melody: [72, 76] },
  { bass: 40, chord: [59, 64, 67], melody: [71, 67] },
  { bass: 41, chord: [60, 65, 69], melody: [69, 72] },
  { bass: 48, chord: [60, 64, 67], melody: [67, 64] },
  { bass: 41, chord: [60, 65, 69], melody: [69, 72] },
  { bass: 43, chord: [59, 62, 67], melody: [71, 74] },
];

type Listener = (state: { started: boolean; muted: boolean }) => void;

class Music {
  started = false;
  muted = false;
  private listeners = new Set<Listener>();
  private ctx?: AudioContext;
  private master?: GainNode;
  private bus?: GainNode;
  private audio?: HTMLAudioElement;
  private nextBar = 0;
  private barIndex = 0;
  private timer = 0;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn({ started: this.started, muted: this.muted });
    return () => { this.listeners.delete(fn); };
  }

  private emit() {
    this.listeners.forEach((fn) => fn({ started: this.started, muted: this.muted }));
  }

  /** Must be called from a tap/click. */
  start() {
    if (this.started) return;
    this.started = true;
    try {
      if (config.musicFile) this.startFile();
      else this.startSynth();
      document.addEventListener("visibilitychange", this.onVisibility);
    } catch {
      // No audio support — the invitation still works silently
    }
    this.emit();
  }

  toggle() {
    this.muted = !this.muted;
    if (this.audio) {
      if (this.muted) this.audio.pause();
      else this.audio.play().catch(() => {});
    }
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(this.muted ? 0 : VOLUME, t + 0.4);
    }
    this.emit();
  }

  // Pause when she switches tabs or locks her phone
  private onVisibility = () => {
    const hidden = document.hidden;
    if (this.audio && !this.muted) {
      if (hidden) this.audio.pause();
      else this.audio.play().catch(() => {});
    }
    if (this.ctx) {
      if (hidden) this.ctx.suspend();
      else this.ctx.resume();
    }
  };

  // ---- her song, from a file ----
  private startFile() {
    const audio = new Audio(`${BASE}/${config.musicFile}`);
    audio.loop = true;
    audio.volume = 0;
    this.audio = audio;
    audio.play().catch(() => {});
    // gentle fade in
    let v = 0;
    const fade = window.setInterval(() => {
      v = Math.min(0.8, v + 0.04);
      if (!this.muted) audio.volume = v;
      if (v >= 0.8) window.clearInterval(fade);
    }, 120);
  }

  // ---- generated music box ----
  private startSynth() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 3);
    master.connect(ctx.destination);
    this.master = master;

    // soft room reverb
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 2.8);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    reverb.connect(wet).connect(master);

    const bus = ctx.createGain();
    bus.connect(master);
    bus.connect(reverb);
    this.bus = bus;

    this.nextBar = ctx.currentTime + 0.1;
    const schedule = () => {
      while (this.nextBar < ctx.currentTime + 1.5) {
        this.playBar(BARS[this.barIndex % BARS.length], this.nextBar);
        this.nextBar += BAR;
        this.barIndex++;
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, 250);
  }

  private playBar(bar: (typeof BARS)[number], t: number) {
    const [a, b, c] = bar.chord;
    // warm pad under everything
    bar.chord.forEach((m) => this.pad(m - 12, t, BAR));
    this.pad(bar.bass - 12, t, BAR, 0.05);
    // music-box arpeggio in eighth notes
    const arp = [bar.bass + 12, a + 12, b + 12, c + 12, a + 24, c + 12, b + 12, a + 12];
    arp.forEach((m, i) => this.bell(m, t + i * (BEAT / 2), 1.6, i === 0 ? 0.1 : 0.06));
    // melody on beats 1 and 3
    this.bell(bar.melody[0] + 12, t, 2.6, 0.13);
    this.bell(bar.melody[1] + 12, t + BEAT * 2, 2.6, 0.11);
  }

  private bell(midi: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.bus!);
    // fundamental + a faint high partial gives the music-box "ting"
    [[1, 1], [4, 0.12]].forEach(([mult, level]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq(midi) * mult;
      const og = ctx.createGain();
      og.gain.value = level;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  private pad(midi: number, t: number, dur: number, vol = 0.025) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq(midi);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.9);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.6);
    o.connect(f).connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + dur + 0.7);
  }

  private impulse(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }
}

export const music = new Music();
