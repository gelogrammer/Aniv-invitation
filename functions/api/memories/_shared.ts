// Shared bits for the polaroid photo API (Cloudflare Pages Functions).

export type Meta = { type: string; updated: number };

interface KV {
  getWithMetadata<M>(key: string, type: "arrayBuffer"): Promise<{ value: ArrayBuffer | null; metadata: M | null }>;
  put(key: string, value: ArrayBuffer, opts?: { metadata?: unknown }): Promise<void>;
  delete(key: string): Promise<void>;
  list<M>(opts: { prefix: string }): Promise<{ keys: { name: string; metadata?: M }[] }>;
}

export interface Env {
  MEMORIES: KV;
  UPLOAD_KEY?: string;
}

export type Ctx = { request: Request; env: Env; params: Record<string, string> };

// Each polaroid unlocks for her at the start of its day (Manila time).
// The owner (with the upload key) can upload any time.
export const UNLOCKS: Record<string, string> = {
  cake: "2026-12-05T00:00:00+08:00",
  church: "2026-12-06T00:00:00+08:00",
  dinner: "2026-12-07T00:00:00+08:00",
};

export const MAX_BYTES = 3_000_000;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const kvKey = (id: string) => `memory:${id}`;

export const isOwner = (request: Request, env: Env) =>
  !!env.UPLOAD_KEY && request.headers.get("x-upload-key") === env.UPLOAD_KEY;

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
