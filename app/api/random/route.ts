import { NextRequest, NextResponse } from "next/server";
import { getDatabase, DatabaseCharacter, insertCharacter } from "@/lib/db";

// Fetch a random character from the Jikan API
async function fetchRandomJikanCharacter(): Promise<any> {
  const res = await fetch("https://api.jikan.moe/v4/random/characters", {
    next: { revalidate: 0 }, // prevent Next.js caching
  });
  if (!res.ok) {
    throw new Error(`Jikan random API failed with status ${res.status}`);
  }
  const body = await res.json();
  const item = body.data;
  if (!item) {
    throw new Error("No data returned from Jikan random character API");
  }
  return {
    mal_id: item.mal_id,
    name: item.name,
    name_kanji: item.name_kanji || null,
    nicknames: item.nicknames || [],
    favorites: item.favorites || 0,
    about: item.about || null,
    images: {
      jpg: {
        image_url: item.images?.jpg?.image_url || "",
        small_image_url: item.images?.jpg?.image_url || "",
      },
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get("count") || "1", 10), 10);
  const animeDataset = searchParams.get("animeDataset") === "true";

  if (animeDataset) {
    try {
      // Call Jikan random API concurrently for the requested count
      const promises = Array.from({ length: count }).map(() => fetchRandomJikanCharacter());
      const results = await Promise.all(promises);

      // Cache these online characters in our SQLite database
      try {
        for (const char of results) {
          insertCharacter({
            mal_id: char.mal_id,
            full_name: char.name,
            name_kanji: char.name_kanji,
            nicknames: char.nicknames.join(", "),
            favorites: char.favorites,
            raw_about_text: char.about,
            image_url: char.images.jpg.image_url,
            is_anime: 1,
          });
        }
      } catch (dbErr) {
        console.error("[api/random] Failed to cache Jikan characters in SQLite:", dbErr);
      }

      return NextResponse.json({ results });
    } catch (err) {
      console.warn("[api/random] Jikan random fetch failed, falling back to database:", err);
      // Fall through to database fallback below
    }
  }

  try {
    const db = getDatabase();
    // Fallback: If Jikan failed, or if animeDataset is false, get random characters from local database
    const sql = animeDataset
      ? `SELECT * FROM characters ORDER BY RANDOM() LIMIT ?`
      : `SELECT * FROM characters WHERE is_anime = 0 ORDER BY RANDOM() LIMIT ?`;
    const stmt = db.prepare(sql);
    const rows = stmt.all(count) as DatabaseCharacter[];

    const results = rows.map((c) => ({
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
    const message = err instanceof Error ? err.message : "Random retrieval failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
