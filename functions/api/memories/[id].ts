import { ALLOWED_TYPES, MAX_BYTES, UNLOCKS, type Ctx, type Meta, isOwner, json, kvKey } from "./_shared";

// GET /api/memories/:id → the photo itself
export const onRequestGet = async ({ env, params }: Ctx) => {
  const id = params.id;
  if (!(id in UNLOCKS)) return new Response("Not found", { status: 404 });
  const { value, metadata } = await env.MEMORIES.getWithMetadata<Meta>(kvKey(id), "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, {
    headers: {
      "content-type": metadata?.type ?? "image/jpeg",
      // URLs carry ?v=<updated>, so a new upload always gets a fresh URL
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

// PUT /api/memories/:id → upload (owner any time; anyone else once the date has arrived)
export const onRequestPut = async ({ request, env, params }: Ctx) => {
  const id = params.id;
  if (!(id in UNLOCKS)) return json({ error: "Unknown polaroid" }, 404);

  const owner = isOwner(request, env);
  if (!owner && Date.now() < Date.parse(UNLOCKS[id])) {
    return json({ error: "This polaroid opens on its date" }, 403);
  }

  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!ALLOWED_TYPES.includes(type)) return json({ error: "Please upload a photo" }, 415);

  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) return json({ error: "Photo is too big" }, 413);

  const updated = Date.now();
  await env.MEMORIES.put(kvKey(id), body, { metadata: { type, updated } satisfies Meta });
  return json({ updated });
};

// DELETE /api/memories/:id → remove (owner only)
export const onRequestDelete = async ({ request, env, params }: Ctx) => {
  const id = params.id;
  if (!(id in UNLOCKS)) return json({ error: "Unknown polaroid" }, 404);
  if (!isOwner(request, env)) return json({ error: "Not allowed" }, 403);
  await env.MEMORIES.delete(kvKey(id));
  return json({ ok: true });
};
