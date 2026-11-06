"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Polaroid photos stored online (Cloudflare), so everyone who opens the link sees them.
 * Shared by the memory wall and the love route map so both update together.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const API = `${BASE}/api/memories`;
const KEY_STORE = "aniv-upload-key";

type State = { loaded: boolean; versions: Record<string, number>; owner: boolean };

let state: State = { loaded: false, versions: {}, owner: false };
const listeners = new Set<() => void>();
const update = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};

/** Your upload key: open the site once with ?key=… and it's remembered on that device. */
function uploadKey(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("key");
    if (fromUrl) {
      localStorage.setItem(KEY_STORE, fromUrl);
      return fromUrl;
    }
    return localStorage.getItem(KEY_STORE);
  } catch {
    return null;
  }
}

const keyHeader = (): Record<string, string> => {
  const key = uploadKey();
  return key ? { "x-upload-key": key } : {};
};

let started = false;
async function refresh() {
  try {
    const res = await fetch(API, { headers: keyHeader(), cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { photos: Record<string, number>; owner: boolean };
    update({ loaded: true, versions: data.photos, owner: data.owner });
  } catch {
    update({ loaded: true }); // e.g. local `npm run dev`, where the photo API doesn't run
  }
}

export function photoUrl(id: string, versions = state.versions) {
  const v = versions[id];
  return v ? `${API}/${id}?v=${v}` : null;
}

/** Shrink a phone photo before uploading (keeps it fast on mobile data). */
async function compress(file: File, max = 1400): Promise<Blob> {
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
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85)
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadPhoto(id: string, file: File) {
  const blob = await compress(file);
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    body: blob,
    headers: { "content-type": "image/jpeg", ...keyHeader() },
  });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(error || "Upload failed");
  }
  const { updated } = (await res.json()) as { updated: number };
  update({ versions: { ...state.versions, [id]: updated } });
}

export async function removePhoto(id: string) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: keyHeader() });
  if (!res.ok) throw new Error("Remove failed");
  const versions = { ...state.versions };
  delete versions[id];
  update({ versions });
}

export function useMemories() {
  useEffect(() => {
    if (started) return;
    started = true;
    refresh();
  }, []);
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
    () => state
  );
}
