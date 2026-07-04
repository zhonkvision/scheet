import { AnimeCharacterData, AnimeDataProvider } from "./anime-provider";

export class JikanProvider implements AnimeDataProvider {
  name = "Jikan API (MyAnimeList)";

  private cache = new Map<string, AnimeCharacterData[]>();

  async search(query: string): Promise<AnimeCharacterData[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 3) return [];

    if (this.cache.has(cleanQuery)) {
      return this.cache.get(cleanQuery)!;
    }

    try {
      const results = await this.fetchWithRetry(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=5`
      );
      this.cache.set(cleanQuery, results);
      return results;
    } catch (err) {
      console.error("Jikan Provider search error:", err);
      // Return cached results or throw to let manager know
      throw err;
    }
  }

  private async fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<AnimeCharacterData[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);

        if (res.status === 429) {
          // Rate limited by Jikan (Jikan has 3 requests/sec max limit)
          console.warn(`Jikan API 429 Rate Limit (Attempt ${attempt}/${retries}). Retrying in ${delay * 2}ms...`);
          await new Promise((r) => setTimeout(r, delay * 2));
          continue;
        }

        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
        }

        const body = await res.json();
        if (!body.data || !Array.isArray(body.data)) {
          return [];
        }

        return body.data.map((item: any) => ({
          mal_id: item.mal_id,
          full_name: item.name,
          name_kanji: item.name_kanji || null,
          nicknames: item.nicknames || [],
          favorites: item.favorites || 0,
          raw_about_text: item.about || null,
          image_url: item.images?.jpg?.image_url || null,
        }));
      } catch (err) {
        if (attempt === retries) {
          console.error(`Jikan API failed after ${retries} attempts:`, err);
          throw err;
        }
        console.warn(`Jikan API attempt ${attempt} failed: ${err}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return [];
  }
}
