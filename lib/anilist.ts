/**
 * AniList GraphQL API client for structured character data enrichment.
 * No authentication required. Rate limit: 90 requests/minute.
 */

interface AniListCharacter {
  gender: string | null;
  age: string | null;
  description: string | null;
  bloodType: string | null;
  dateOfBirth: { year: number | null; month: number | null; day: number | null } | null;
  nameAlternatives: string[];
}

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const CHARACTER_QUERY = `
query ($search: String) {
  Character(search: $search) {
    name {
      full
      native
      alternative
    }
    gender
    age
    description
    bloodType
    dateOfBirth {
      year
      month
      day
    }
  }
}
`;

// In-memory cache to avoid redundant lookups within the same deployment cycle
const anilistCache = new Map<string, AniListCharacter | null>();

/**
 * Fetch structured character data from AniList GraphQL API.
 * Returns null if the character is not found or the API call fails.
 */
export async function fetchAniListCharacter(name: string): Promise<AniListCharacter | null> {
  const cacheKey = name.toLowerCase().trim();
  
  if (anilistCache.has(cacheKey)) {
    return anilistCache.get(cacheKey) || null;
  }

  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: CHARACTER_QUERY,
        variables: { search: name },
      }),
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!res.ok) {
      console.warn(`[anilist] API returned ${res.status} for "${name}"`);
      anilistCache.set(cacheKey, null);
      return null;
    }

    const json = await res.json();
    const data = json?.data?.Character;

    if (!data) {
      anilistCache.set(cacheKey, null);
      return null;
    }

    const result: AniListCharacter = {
      gender: data.gender || null,
      age: data.age || null,
      description: stripAniListMarkdown(data.description || ""),
      bloodType: data.bloodType || null,
      dateOfBirth: data.dateOfBirth || null,
      nameAlternatives: data.name?.alternative || [],
    };

    anilistCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`[anilist] Fetch failed for "${name}":`, err);
    anilistCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Strip AniList-specific markdown formatting from description text.
 * AniList uses ~!spoiler!~, __bold__, [links](url), etc.
 */
function stripAniListMarkdown(text: string): string {
  return text
    .replace(/~![\s\S]*?!~/g, "") // Remove spoiler blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/__([^_]+)__/g, "$1") // __bold__ → bold
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** → bold
    .replace(/\n{3,}/g, "\n\n") // Collapse excessive newlines
    .trim();
}
