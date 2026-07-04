import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface DatabaseCharacter {
  id?: number;
  mal_id: number;
  full_name: string;
  name_kanji: string | null;
  nicknames: string | null; // stored as comma-separated or JSON string
  favorites: number;
  raw_about_text: string | null;
  image_url: string | null;
}

let dbInstance: Database.Database | null = null;

/**
 * Resolve the SQLite DB path.
 * On Vercel (read-only FS), use /tmp so we can write.
 * Locally or when DATABASE_PATH is set, use that path.
 */
function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }
  // Vercel serverless: VERCEL env is set, write to /tmp
  if (process.env.VERCEL) {
    return "/tmp/characters.db";
  }
  return path.join(process.cwd(), "data/characters.db");
}

/**
 * Auto-seed the database from the bundled CSV file when the DB is empty.
 * This ensures the app works on Vercel (serverless) where the DB isn't persisted.
 */
function autoSeedIfEmpty(db: Database.Database): void {
  const countRow = db.prepare("SELECT COUNT(*) as total FROM characters").get() as { total: number };
  if (countRow.total > 0) return;

  console.log("[db] Database is empty — auto-seeding from CSV...");

  // Try the 5000-character CSV first, fall back to 1000
  const csvCandidates = [
    path.join(process.cwd(), "data/original_characters_5000.csv"),
    path.join(process.cwd(), "data/original_characters_1000.csv"),
  ];

  let csvPath: string | null = null;
  for (const candidate of csvCandidates) {
    if (fs.existsSync(candidate)) {
      csvPath = candidate;
      break;
    }
  }

  if (!csvPath) {
    console.warn("[db] No CSV found for auto-seeding. Shuffle will return no results until data is loaded.");
    return;
  }

  try {
    // Lazy-load csv-parse to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parse } = require("csv-parse/sync") as typeof import("csv-parse/sync");
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(fileContent, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    if (!records.length) return;

    const firstRow = records[0];
    const nameKey = Object.keys(firstRow).find((k) =>
      ["name", "full_name", "eng_name", "character_name"].includes(k.toLowerCase())
    ) ?? "name";
    const bioKey = Object.keys(firstRow).find((k) =>
      ["about", "bio", "description", "raw_about_text"].includes(k.toLowerCase())
    ) ?? "about";
    const malKey = Object.keys(firstRow).find((k) =>
      ["mal_id", "character_id", "id"].includes(k.toLowerCase())
    ) ?? "mal_id";
    const kanjiKey = Object.keys(firstRow).find((k) =>
      ["name_kanji", "alternate_name", "japanese_name"].includes(k.toLowerCase())
    ) ?? "name_kanji";
    const nickKey = Object.keys(firstRow).find((k) =>
      ["nicknames", "nickname"].includes(k.toLowerCase())
    ) ?? "nicknames";
    const favKey = Object.keys(firstRow).find((k) =>
      ["favorites", "member_favorites"].includes(k.toLowerCase())
    ) ?? "favorites";
    const imgKey = Object.keys(firstRow).find((k) =>
      ["image_url", "image", "img"].includes(k.toLowerCase())
    ) ?? "image_url";

    const insert = db.prepare(`
      INSERT OR REPLACE INTO characters (mal_id, full_name, name_kanji, nicknames, favorites, raw_about_text, image_url, is_anime)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const runBatch = db.transaction((rows: Record<string, string>[]) => {
      for (const row of rows) {
        if (!row[nameKey]) continue;
        insert.run(
          parseInt(row[malKey], 10) || Math.floor(Math.random() * 1_000_000),
          row[nameKey],
          row[kanjiKey] || null,
          row[nickKey] || null,
          parseInt(row[favKey], 10) || 0,
          row[bioKey] || null,
          row[imgKey] || null
        );
      }
    });

    runBatch(records);

    const newCount = (db.prepare("SELECT COUNT(*) as total FROM characters").get() as { total: number }).total;
    console.log(`[db] Auto-seeded ${newCount} characters from ${path.basename(csvPath)}`);
  } catch (err) {
    console.error("[db] Auto-seed failed:", err);
  }
}

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  const absolutePath = resolveDbPath();

  // Ensure directories exist
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(absolutePath);

  // Set journal mode to WAL for better performance
  db.pragma("journal_mode = WAL");

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mal_id INTEGER UNIQUE,
      full_name TEXT NOT NULL,
      name_kanji TEXT,
      nicknames TEXT,
      favorites INTEGER DEFAULT 0,
      raw_about_text TEXT,
      image_url TEXT,
      is_anime INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(full_name COLLATE NOCASE);
  `);

  // Migration: ensure is_anime exists in existing DB tables
  try {
    db.prepare("SELECT is_anime FROM characters LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE characters ADD COLUMN is_anime INTEGER DEFAULT 0");
  }

  // Auto-seed from CSV if empty (critical for Vercel deployments)
  autoSeedIfEmpty(db);

  dbInstance = db;
  return db;
}

/**
 * Searches local SQLite characters table using LIKE.
 */
export function searchCharacters(
  query: string,
  limit: number = 10,
  includeAnime: boolean = false
): DatabaseCharacter[] {
  const db = getDatabase();
  const sql = includeAnime
    ? `SELECT * FROM characters WHERE full_name LIKE ? ORDER BY favorites DESC LIMIT ?`
    : `SELECT * FROM characters WHERE is_anime = 0 AND full_name LIKE ? ORDER BY favorites DESC LIMIT ?`;

  const stmt = db.prepare(sql);
  return stmt.all(`%${query}%`, limit) as DatabaseCharacter[];
}

/**
 * Insert or replace character detail.
 */
export function insertCharacter(char: DatabaseCharacter & { is_anime?: number }) {
  const db = getDatabase();
  const isAnime = char.is_anime ?? 0;
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO characters (mal_id, full_name, name_kanji, nicknames, favorites, raw_about_text, image_url, is_anime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  return stmt.run(
    char.mal_id,
    char.full_name,
    char.name_kanji,
    char.nicknames,
    char.favorites,
    char.raw_about_text,
    char.image_url,
    isAnime
  );
}

/**
 * Bulk insert characters in transaction.
 */
export function insertCharactersBatch(chars: (DatabaseCharacter & { is_anime?: number })[]) {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO characters (mal_id, full_name, name_kanji, nicknames, favorites, raw_about_text, image_url, is_anime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const runBatch = db.transaction((batch: (DatabaseCharacter & { is_anime?: number })[]) => {
    for (const char of batch) {
      const isAnime = char.is_anime ?? 0;
      insert.run(
        char.mal_id,
        char.full_name,
        char.name_kanji,
        char.nicknames,
        char.favorites,
        char.raw_about_text,
        char.image_url,
        isAnime
      );
    }
  });

  runBatch(chars);
}
