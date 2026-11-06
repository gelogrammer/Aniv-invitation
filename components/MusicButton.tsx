"use client";

import { useEffect, useState } from "react";
import { music } from "@/lib/music";

/** Floating mute / unmute button, shown once the music has started. */
export default function MusicButton() {
  const [state, setState] = useState({ started: false, muted: false });

  useEffect(() => music.subscribe(setState), []);

  if (!state.started) return null;

  return (
    <button
      className={`music-btn ${state.muted ? "muted" : ""}`}
      onClick={() => music.toggle()}
      aria-label={state.muted ? "Play music" : "Mute music"}
      aria-pressed={!state.muted}
    >
      {state.muted ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5z" />
          <path d="m16 9 5 6m0-6-5 6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </svg>
      )}
    </button>
  );
}
