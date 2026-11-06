import { type Ctx, type Meta, isOwner, json } from "./_shared";

// GET /api/memories → which polaroids have a photo, and whether the caller holds the upload key
export const onRequestGet = async ({ request, env }: Ctx) => {
  const { keys } = await env.MEMORIES.list<Meta>({ prefix: "memory:" });
  const photos: Record<string, number> = {};
  for (const k of keys) photos[k.name.slice("memory:".length)] = k.metadata?.updated ?? 1;
  return json({ photos, owner: isOwner(request, env) });
};
