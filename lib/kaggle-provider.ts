import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { AnimeCharacterData, AnimeDataProvider } from "./anime-provider";

export class KaggleProvider implements AnimeDataProvider {
  name = "Kaggle CSV Dataset";

  private parsedData: AnimeCharacterData[] | null = null;

  async search(query: string): Promise<AnimeCharacterData[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 3) return [];

    const dataDir = "./data";
    let csvPath = "";

    // Find any CSV containing "kaggle" or "anime" in the data directory
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      const match = files.find(
        (f) =>
          f.endsWith(".csv") &&
          (f.toLowerCase().includes("kaggle") || f.toLowerCase().includes("anime"))
      );
      if (match) {
        csvPath = path.join(dataDir, match);
      }
    }

    if (!csvPath || !fs.existsSync(csvPath)) {
      return []; // No local Kaggle/Anime CSV found, return empty gracefully
    }

    if (!this.parsedData) {
      try {
        console.log(`[KaggleProvider] Parsing local CSV dataset from ${csvPath}...`);
        const fileContent = fs.readFileSync(csvPath, "utf-8");
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
        });

        // Detect dynamic headers
        const firstRow = records[0] as any;
        if (!firstRow) return [];

        const nameKey =
          Object.keys(firstRow).find((k) =>
            ["name", "full_name", "eng_name", "character_name"].includes(k.toLowerCase())
          ) || "name";
        const bioKey =
          Object.keys(firstRow).find((k) =>
            ["about", "bio", "description", "raw_about_text"].includes(k.toLowerCase())
          ) || "about";
        const malKey =
          Object.keys(firstRow).find((k) =>
            ["mal_id", "character_id", "id"].includes(k.toLowerCase())
          ) || "mal_id";
        const kanjiKey =
          Object.keys(firstRow).find((k) =>
            ["name_kanji", "japanese_name"].includes(k.toLowerCase())
          ) || "name_kanji";
        const nickKey =
          Object.keys(firstRow).find((k) =>
            ["nicknames", "nickname"].includes(k.toLowerCase())
          ) || "nicknames";
        const favKey =
          Object.keys(firstRow).find((k) =>
            ["favorites", "member_favorites"].includes(k.toLowerCase())
          ) || "favorites";
        const imgKey =
          Object.keys(firstRow).find((k) =>
            ["image_url", "image", "img"].includes(k.toLowerCase())
          ) || "image_url";

        this.parsedData = records.map((record: any) => {
          let nicknames: string[] = [];
          if (record[nickKey]) {
            nicknames = Array.isArray(record[nickKey])
              ? record[nickKey]
              : record[nickKey].split(",").map((s: string) => s.trim());
          }

          return {
            mal_id: parseInt(record[malKey], 10) || Math.floor(Math.random() * 1000000),
            full_name: record[nameKey] || "",
            name_kanji: record[kanjiKey] || null,
            nicknames,
            favorites: parseInt(record[favKey], 10) || 0,
            raw_about_text: record[bioKey] || null,
            image_url: record[imgKey] || null,
          };
        });
      } catch (err) {
        console.error("Failed to parse Kaggle CSV:", err);
        return [];
      }
    }

    return this.parsedData!
      .filter((char) => char.full_name.toLowerCase().includes(cleanQuery))
      .slice(0, 5);
  }
}
