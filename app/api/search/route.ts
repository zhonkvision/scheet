import { NextRequest, NextResponse } from "next/server";
import { searchCharacters, insertCharacter } from "@/lib/db";
import { AnimeDataManager } from "@/lib/anime-provider";

const animeManager = new AnimeDataManager();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 25);
  const animeDataset = searchParams.get("animeDataset") === "true";

  try {
    // If anime dataset toggle is ON and query is at least 3 characters, trigger asynchronous background sync
    if (animeDataset && q.trim().length >= 3) {
      try {
        const onlineCharacters = await animeManager.fetchAndMerge(q);
        for (const char of onlineCharacters) {
          insertCharacter({
            mal_id: char.mal_id,
            full_name: char.full_name,
            name_kanji: char.name_kanji,
            nicknames: char.nicknames.join(", "),
            favorites: char.favorites,
            raw_about_text: char.raw_about_text,
            image_url: char.image_url,
            is_anime: 1,
          });
        }
      } catch (providerError) {
        console.error("Provider fetching failed:", providerError);
        // Continue and return whatever we have locally
      }
    }

    const results = searchCharacters(q, limit, animeDataset).map((c) => ({
      mal_id: c.mal_id,
      name: c.full_name,
      name_kanji: c.name_kanji,
      nicknames: c.nicknames ? c.nicknames.split(",").map((s) => s.trim()) : [],
      favorites: c.favorites,
      about: c.raw_about_text,
      images: {
        jpg: {
          image_url: c.image_url || "",
          small_image_url: c.image_url || "",
        },
      },
    }));
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
