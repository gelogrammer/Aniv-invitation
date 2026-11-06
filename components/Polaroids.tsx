"use client";

import { useEffect, useRef, useState } from "react";
import { MEMORIES } from "@/lib/config";
import { burstHearts } from "./FloatingHearts";

const key = (id: string) => `aniv-memory-${id}`;
const load = (id: string) => { try { return localStorage.getItem(key(id)); } catch { return null; } };
const save = (id: string, v: string) => { localStorage.setItem(key(id), v); }; // throws if full
const remove = (id: string) => { try { localStorage.removeItem(key(id)); } catch {} };

/** Shrink a phone photo so it fits comfortably in the browser's storage. */
async function compress(file: File, max = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
);

function Polaroid({ memory, index }: { memory: (typeof MEMORIES)[number]; index: number }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhoto(load(memory.id));
    // ?preview in the URL unlocks everything, so you can test before December
    const preview = new URLSearchParams(window.location.search).has("preview");
    setUnlocked(preview || Date.now() >= new Date(memory.unlocks).getTime());
  }, [memory]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = await compress(file);
      save(memory.id, data);
      setPhoto(data);
      burstHearts();
    } catch {
      setError("Couldn't save that photo. Try a different one?");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    remove(memory.id);
    setPhoto(null);
  };

  const tilt = [-3, 2, -1.5][index % 3];

  return (
    <figure className={`polaroid ${photo ? "filled" : ""}`} style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}>
      <input ref={input} type="file" accept="image/*" hidden onChange={onPick} />

      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="polaroid-photo" src={photo} alt={`Our photo from ${memory.date}`} />
      ) : unlocked ? (
        <button className="polaroid-photo empty" onClick={() => input.current?.click()} disabled={busy}>
          <CameraIcon />
          <span>{busy ? "Saving…" : "Tap to add our photo"}</span>
        </button>
      ) : (
        <div className="polaroid-photo empty locked">
          <LockIcon />
          <span>Opens on {memory.date}</span>
          <small>Add our photo once this date is done</small>
        </div>
      )}

      <figcaption>
        <span className="polaroid-date">{memory.date}</span>
        <span className="polaroid-caption">{memory.caption}</span>
      </figcaption>

      {photo && (
        <div className="polaroid-actions">
          <button onClick={() => input.current?.click()}>Change</button>
          <a href={photo} download={`our-${memory.id}-${memory.date.replace(" ", "-")}.jpg`}>Save</a>
          <button onClick={clear}>Remove</button>
        </div>
      )}
      {error && <p className="polaroid-error" role="alert">{error}</p>}
    </figure>
  );
}

export default function Polaroids() {
  return (
    <div className="memories">
      <div className="label">Our memory wall</div>
      <div className="title">Three empty polaroids</div>
      <p className="lead">
        After each date, come back here and add your favorite photo of us.
        Each polaroid opens on its day.
      </p>
      <div className="polaroid-row">
        {MEMORIES.map((m, i) => (
          <Polaroid key={m.id} memory={m} index={i} />
        ))}
      </div>
    </div>
  );
}
