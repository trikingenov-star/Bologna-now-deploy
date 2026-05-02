import type { VercelRequest, VercelResponse } from "@vercel/node";

const PHOTO_CACHE_TTL = 24 * 60 * 60 * 1000;
const photoCache = new Map<string, { url: string | null; cachedAt: number }>();

const TYPE_FALLBACK: Record<string, string> = {
  RESTAURANT: "italian trattoria restaurant food Bologna",
  BAR: "aperitivo cocktail bar Italy",
  EVENT: "live music concert stage Italy",
  LOCATION: "Bologna Italy architecture historic",
  ACTIVITY: "Bologna Italy travel",
  SPORT: "outdoor sport activity Italy",
  OUTDOOR: "park nature Bologna Italy",
  FAMILY: "children playground family fun Italy",
  CULTURE: "museum art gallery Bologna Italy",
  MUSIC: "live music concert stage Italy",
  THEATER: "theater performance stage Italy",
  CINEMA: "cinema film Italy",
  DANCE: "dance performance ballet Italy",
  EXHIBITION: "art exhibition gallery museum Italy",
};

async function searchUnsplash(query: string, accessKey: string): Promise<string | null> {
  const params = new URLSearchParams({
    query,
    per_page: "1",
    orientation: "landscape",
    content_filter: "high",
  });
  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}`, "Accept-Version": "v1" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as any;
  return (data.results?.[0]?.urls?.regular as string) ?? null;
}

async function fetchUnsplashPhoto(rawQuery: string, type: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  const normalizedType = type.toUpperCase();
  const query1 = rawQuery.includes("Italy") || rawQuery.includes("Bologna")
    ? rawQuery : `${rawQuery} Bologna Italy`;
  const result1 = await searchUnsplash(query1, accessKey);
  if (result1) return result1;
  const fallback = TYPE_FALLBACK[normalizedType] ?? "Bologna Italy travel";
  const result2 = await searchUnsplash(fallback, accessKey);
  if (result2) return result2;
  return searchUnsplash("Bologna Italy", accessKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") { res.status(405).end(); return; }

  const q = (req.query.q as string | undefined)?.trim();
  const type = ((req.query.type as string | undefined) ?? "ACTIVITY").trim();

  if (!q) { res.status(400).json({ error: "Missing query param: q" }); return; }

  const cacheKey = `${type}::${q.toLowerCase()}`;
  const cached = photoCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < PHOTO_CACHE_TTL) {
    res.json({ photoUrl: cached.url });
    return;
  }

  try {
    const photoUrl = await fetchUnsplashPhoto(q, type);
    photoCache.set(cacheKey, { url: photoUrl, cachedAt: Date.now() });
    res.json({ photoUrl });
  } catch {
    photoCache.set(cacheKey, { url: null, cachedAt: Date.now() });
    res.json({ photoUrl: null });
  }
}
