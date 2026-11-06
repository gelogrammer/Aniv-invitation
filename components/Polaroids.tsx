"use client";

import { useEffect, useRef, useState } from "react";
import { MEMORIES } from "@/lib/config";
import { photoUrl, removePhoto, uploadPhoto, useMemories } from "@/lib/memories";
import { burstHearts } from "./FloatingHearts";

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
  const { versions, owner } = useMemories();
  const [dateReached, setDateReached] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDateReached(Date.now() >= new Date(memory.unlocks).getTime());
  }, [memory]);

  const photo = photoUrl(memory.id, versions);
  const canUpload = owner || dateReached;

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await uploadPhoto(memory.id, file);
      burstHearts();
    } catch (err) {
      setError(err instanceof Error && err.message !== "Upload failed"
        ? err.message
        : "Couldn't upload that photo. Check your internet and try again?");
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!window.confirm("Remove this photo from the polaroid?")) return;
    try {
      await removePhoto(memory.id);
    } catch {
      setError("Couldn't remove it. Try again?");
    }
  };

  const tilt = [-3, 2, -1.5][index % 3];

  return (
    <figure className={`polaroid ${photo ? "filled" : ""}`} style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}>
      <input ref={input} type="file" accept="image/*" hidden onChange={onPick} />

      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="polaroid-photo" src={photo} alt={`Our photo from ${memory.date}`} />
      ) : canUpload ? (
        <button className="polaroid-photo empty" onClick={() => input.current?.click()} disabled={busy}>
          <CameraIcon />
          <span>{busy ? "Uploading…" : "Tap to add our photo"}</span>
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
          {canUpload && (
            <button onClick={() => input.current?.click()} disabled={busy}>
              {busy ? "Uploading…" : "Change"}
            </button>
          )}
          <a href={photo} download={`our-${memory.id}-${memory.date.replace(" ", "-")}.jpg`}>Save</a>
          {owner && <button onClick={clear}>Remove</button>}
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
        Each polaroid opens on its day, and it shows up on our love route too.
      </p>
      <div className="polaroid-row">
        {MEMORIES.map((m, i) => (
          <Polaroid key={m.id} memory={m} index={i} />
        ))}
      </div>
    </div>
  );
}
