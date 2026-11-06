"use client";

import { useEffect, useState } from "react";

type Heart = { id: number; left: number; size: number; dur: number; color?: string };

const BURST_EVENT = "hearts:burst";
const BURST_COLORS = ["#7a1f3d", "#e7a3b5", "#c9a35c"];

/** Shoots a quick shower of hearts up the screen. */
export const burstHearts = () => window.dispatchEvent(new Event(BURST_EVENT));

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let nextId = 0;
    const timers: number[] = [];
    const spawn = (burst: boolean) => {
      const heart: Heart = {
        id: nextId++,
        left: Math.random() * 100,
        size: 12 + Math.random() * 22,
        dur: burst ? 3 + Math.random() * 2 : 9 + Math.random() * 8,
        color: burst ? BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)] : undefined,
      };
      setHearts((prev) => [...prev, heart]);
    };

    const interval = window.setInterval(() => spawn(false), 900);
    const onBurst = () => {
      for (let i = 0; i < 40; i++) timers.push(window.setTimeout(() => spawn(true), i * 40));
    };
    window.addEventListener(BURST_EVENT, onBurst);

    return () => {
      window.clearInterval(interval);
      timers.forEach(window.clearTimeout);
      window.removeEventListener(BURST_EVENT, onBurst);
    };
  }, []);

  const remove = (id: number) => setHearts((prev) => prev.filter((h) => h.id !== id));

  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="heart"
          onAnimationEnd={() => remove(h.id)}
          style={{
            left: `${h.left}vw`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.dur}s`,
            ...(h.color ? { color: h.color, opacity: 0.9 } : {}),
          }}
        >
          ♥
        </div>
      ))}
    </div>
  );
}
