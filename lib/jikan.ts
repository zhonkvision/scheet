// ─── Jikan API Client ──────────────────────────────────────────
// Queries MyAnimeList data via the public Jikan v4 API.
// No authentication required. Rate limit: 3 req/sec, 60 req/min.

export interface JikanCharacter {
  mal_id: number;
  name: string;
  name_kanji: string | null;
  nicknames: string[];
  favorites: number;
  about: string | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
    };
  };
}

interface JikanSearchResponse {
  data: JikanCharacter[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

const JIKAN_BASE = "https://api.jikan.moe/v4";

/**
 * Search for anime characters by name via Jikan API.
 * @param query - Character name to search for (min 3 chars)
 * @param limit - Max results to return (default 10)
 */
export async function searchCharacters(
  query: string,
  limit: number = 10
): Promise<JikanCharacter[]> {
  if (query.length < 3) return [];

  const url = `${JIKAN_BASE}/characters?q=${encodeURIComponent(query)}&limit=${limit}&order_by=favorites&sort=desc`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Rate limited by Jikan API. Please wait a moment and try again.");
    }
    throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
  }

  const data: JikanSearchResponse = await res.json();
  return data.data || [];
}

/**
 * Get a single character by MAL ID.
 */
export async function getCharacterById(
  malId: number
): Promise<JikanCharacter | null> {
  const url = `${JIKAN_BASE}/characters/${malId}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.data || null;
}
