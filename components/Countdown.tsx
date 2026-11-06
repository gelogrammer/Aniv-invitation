"use client";

import { useEffect, useState } from "react";

const split = (ms: number) => {
  const d = Math.floor(ms / 864e5);
  const h = Math.floor((ms % 864e5) / 36e5);
  const m = Math.floor((ms % 36e5) / 6e4);
  const s = Math.floor((ms % 6e4) / 1e3);
  return { Days: d, Hours: h, Mins: m, Secs: s };
};

export default function Countdown({ to }: { to: string }) {
  // null until mounted, so the server-rendered HTML matches the first client render
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(to).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [to]);

  const parts = split(left ?? 0);

  return (
    <div className="countdown">
      {Object.entries(parts).map(([label, value]) => (
        <div key={label}>
          <b>{left === null ? "–" : value}</b>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
