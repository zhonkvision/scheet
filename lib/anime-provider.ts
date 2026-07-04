export interface AnimeCharacterData {
  mal_id: number;
  full_name: string;
  name_kanji: string | null;
  nicknames: string[];
  favorites: number;
  raw_about_text: string | null;
  image_url: string | null;
}

export interface AnimeDataProvider {
  name: string;
  search(query: string): Promise<AnimeCharacterData[]>;
}

import { JikanProvider } from "./jikan-provider";
import { KaggleProvider } from "./kaggle-provider";

export class AnimeDataManager {
  private providers: AnimeDataProvider[] = [];

  constructor() {
    this.providers.push(new JikanProvider());
    this.providers.push(new KaggleProvider());
  }

  // Register additional providers modularly
  registerProvider(provider: AnimeDataProvider) {
    this.providers.push(provider);
  }

  async fetchAndMerge(query: string): Promise<AnimeCharacterData[]> {
    const results: AnimeCharacterData[] = [];
    const seenIds = new Set<number>();

    // Fetch from all providers concurrently
    const promises = this.providers.map(async (provider) => {
      try {
        const providerData = await provider.search(query);
        return providerData;
      } catch (err) {
        console.error(`Provider ${provider.name} failed:`, err);
        return [];
      }
    });

    const resolved = await Promise.all(promises);
    for (const providerData of resolved) {
      for (const char of providerData) {
        if (!seenIds.has(char.mal_id)) {
          seenIds.add(char.mal_id);
          results.push(char);
        }
      }
    }

    return results;
  }
}
