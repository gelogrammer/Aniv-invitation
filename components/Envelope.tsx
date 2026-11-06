"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import PhotoFlash, { preloadPhotos } from "./PhotoFlash";
import { music } from "@/lib/music";

export default function Envelope({ gone, onOpen }: { gone: boolean; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const [flashing, setFlashing] = useState(false);

  const [removed, setRemoved] = useState(false);

  useEffect(preloadPhotos, []);

  // Once the intro has faded out, take it off the page so nothing in it can block taps
  useEffect(() => {
    if (!gone) return;
    const t = window.setTimeout(() => setRemoved(true), 1200);
    return () => window.clearTimeout(t);
  }, [gone]);

  const handleClick = () => {
    if (open) return;
    setOpen(true);
    music.start(); // her tap is what lets the browser play sound
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Let the seal break and the flap lift, then flash through our photos
    window.setTimeout(() => setFlashing(true), reduce ? 0 : 1000);
  };

  if (removed) return null;

  return (
    <div className={`intro ${open ? "opening" : ""} ${gone ? "gone" : ""}`} aria-hidden={gone}>
      

      <div className="env-stage">
        <button
          className={`envelope ${open ? "open" : ""}`}
          onClick={handleClick}
          aria-label={`Open the invitation for ${config.herName}`}
        >
          <div className="env-back" />
          <div className="env-letter" aria-hidden="true">
            <small>You&apos;re invited</small>
            <strong>Happy 1st</strong>
            <em>Anniversary · Dec 5–7</em>
          </div>
          <div className="env-side left" />
          <div className="env-side right" />
          <div className="env-bottom" />
          <div className="env-to" aria-hidden="true">
            <small>For</small>
            <span>{config.herName}</span>
          </div>
          <div className="env-flap">
            <div className="env-flap-shape" />
          </div>
          <div className="seal" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 4.4 2.5h1.6c.8-1.3 2.2-2.5 4.4-2.5 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          </div>
        </button>
      </div>

      <p className="intro-hint">Tap the seal to open</p>

      {flashing && <PhotoFlash onDone={onOpen} />}
    </div>
  );
}
