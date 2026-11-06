"use client";

import { useEffect, useRef, useState } from "react";

/** A section that fades in once it scrolls into view (only after `active` is true). */
export default function Reveal({
  active,
  className = "",
  children,
}: {
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [active]);

  return (
    <section ref={ref} className={`reveal ${shown ? "show" : ""} ${className}`}>
      {children}
    </section>
  );
}
