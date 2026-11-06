"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/lib/photos";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PHOTO_URLS = PHOTOS.map((p) => `${BASE}/${p}`);

let ready: Promise<void> | null = null;

/**
 * Download and decode every photo ahead of time, so none get skipped during the flash.
 * Called as soon as the envelope appears.
 */
export function preloadPhotos() {
  ready ??= Promise.all(
    PHOTO_URLS.map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => {}); // a broken photo shouldn't block the rest
    })
  ).then(() => {});
}

// Slow → fast → slow. Each photo stays between ~60ms and ~280ms.
const frameMs = (i: number, n: number) =>
  60 + 220 * Math.pow(1 - Math.sin((Math.PI * i) / Math.max(1, n - 1)), 3);

const MAX_WAIT_MS = 8000; // don't keep her waiting forever on a slow connection

export default function PhotoFlash({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(-1);
  const [final, setFinal] = useState(false);
  const [calm, setCalm] = useState(false);
  const done = useRef(false);
  const tilts = useRef(PHOTO_URLS.map(() => Math.random() * 8 - 4));

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCalm(reduce);
    preloadPhotos();

    let timer = 0;
    let cancelled = false;
    const n = PHOTO_URLS.length;

    const step = (i: number) => {
      if (cancelled || done.current) return;
      if (i >= n) {
        setFinal(true);
        timer = window.setTimeout(finish, 1600);
        return;
      }
      setCurrent(i);
      timer = window.setTimeout(() => step(i + 1), frameMs(i, n));
    };

    const timeout = new Promise((r) => window.setTimeout(r, MAX_WAIT_MS));
    Promise.race([ready, timeout]).then(() => {
      if (cancelled) return;
      setLoading(false);
      step(0);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [finish]);

  return (
    <div
      className={`flash-show ${calm ? "calm" : ""}`}
      role="img"
      aria-label="A quick slideshow of our photos together"
    >
      {/* Every photo is already in the page; only the current one is visible */}
      {PHOTO_URLS.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          decoding="sync"
          className={`flash-photo ${i === current ? "on" : ""}`}
          style={{ "--rot": `${calm ? 0 : tilts.current[i]}deg` } as React.CSSProperties}
        />
      ))}
      {!calm && current >= 0 && (
        <div
          key={`flash-${current}`}
          className="flash-white"
          style={{ opacity: Math.min(0.55, frameMs(current, PHOTO_URLS.length) / 500) }}
        />
      )}
      {loading && <div className="flash-loading">Getting our memories ready…</div>}
      {final && (
        <div className="flash-caption">
          <span>One year of us</span>
        </div>
      )}
      <button className="flash-skip" onClick={finish}>Skip ›</button>
    </div>
  );
}
