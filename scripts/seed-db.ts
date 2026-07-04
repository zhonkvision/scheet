import { getDatabase, insertCharactersBatch, DatabaseCharacter } from "../lib/db";
import fs from "fs";
import { parse } from "csv-parse/sync";

const SAMPLE_CHARACTERS: DatabaseCharacter[] = [
  {
    mal_id: 17,
    full_name: "Naruto Uzumaki",
    name_kanji: "うずまき ナルト",
    nicknames: "Nine-Tails Jinchuuriki",
    favorites: 87737,
    image_url: "https://cdn.myanimelist.net/images/characters/2/284121.jpg",
    raw_about_text: `Age: 17 (part II), 19 (The Last)
Birthday: October 10
Blood type: B
Height: 166 cm (II)
Favorite food: Ichiraku ramen

Born in Konohagakure, Naruto Uzumaki was destined for greatness. The Fourth Hokage sealed the demon nine-tailed fox inside Naruto's newborn body. Outcast by the villagers, Naruto played pranks and vowed to become Hokage one day to earn their respect. Boisterous, energetic, determined, and kind, Naruto utilizes his shadow clone technique and wind-style rasengan. He wears his signature orange ninja jumpsuit and forehead protector. He often shouts his informal catchphrase 'Dattebayo!'. He wields his signature scroll of seals.`
  },
  {
    mal_id: 13,
    full_name: "Sasuke Uchiha",
    name_kanji: "うちは サスケ",
    nicknames: "Child of Prophecy",
    favorites: 84310,
    image_url: "https://cdn.myanimelist.net/images/characters/9/131920.jpg",
    raw_about_text: `Age: 17 (part II)
Birthday: July 23
Blood type: AB
Height: 168 cm (II)
Weapon: Kusanagi Sword

Sasuke Uchiha is a rogue swordsman from Konoha, determined to avenge his clan's downfall. Cold, analytical, reserved, and quiet. He wears dark high-collar robes and fingerless gloves. He possesses the Sharingan and uses lightning-style chidori. He wields the legendary Kusanagi Katana as his key prop. His speech accent is gruff, low-pitched, and brief.`
  },
  {
    mal_id: 40,
    full_name: "Monkey D. Luffy",
    name_kanji: "モンキー・D・ルフィ",
    nicknames: "Straw Hat Luffy",
    favorites: 124310,
    image_url: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
    raw_about_text: `Age: 19
Birthday: May 5
Blood type: F
Height: 174 cm
Favorite prop: Straw Hat

Luffy is a cheerful, optimistic, naive, and fiercely loyal pirate captain sailing the Grand Line. He ate the Gum-Gum Fruit, turning his body into rubber. He wears a red vest, denim shorts, and combat sandals. His signature prop is his straw hat. His speech is energetic and informal.`
  },
  {
    mal_id: 62,
    full_name: "Roronoa Zoro",
    name_kanji: "ロロノア・ゾロ",
    nicknames: "Pirate Hunter Zoro",
    favorites: 98110,
    image_url: "https://cdn.myanimelist.net/images/characters/3/131820.jpg",
    raw_about_text: `Age: 21
Birthday: November 11
Blood type: XF
Height: 181 cm

Zoro is a stoic, brave, and disciplined swordsman and first mate of the Straw Hat crew. He uses a unique three-sword style (Santoryu) and wears a green haramaki sash, dark green haori robes, and three gold earrings. He carries three legendary swords, including the Wado Ichimonji.`
  },
  {
    mal_id: 1,
    full_name: "Son Goku",
    name_kanji: "孫悟空",
    nicknames: "Kakarot",
    favorites: 65110,
    image_url: "https://cdn.myanimelist.net/images/characters/9/131801.jpg",
    raw_about_text: `Age: Adult
Birthday: April 16
Race: Saiyan
Height: 175 cm

Goku is an energetic, cheerful, and pure-hearted Saiyan warrior defending Earth. He wears a classic orange turtle-school martial arts uniform, wristbands, and boots. He trains constantly and fights to surpass his limits. His prop is the mystical power pole or flying nimbus.`
  },
  {
    mal_id: 2,
    full_name: "Vegeta",
    name_kanji: "ベジータ",
    nicknames: "Prince of Saiyans",
    favorites: 48990,
    image_url: "https://cdn.myanimelist.net/images/characters/3/131802.jpg",
    raw_about_text: `Age: Adult
Race: Saiyan
Height: 164 cm

Vegeta is the proud, arrogant, and determined Saiyan prince. Initially a villain, he becomes a protector of Earth but maintains a rivalry with Goku. He wears blue tactical body armor, white gloves, and combat boots. His speech is cocky and sarcastic.`
  },
  {
    mal_id: 71,
    full_name: "L Lawliet",
    name_kanji: "エル・ローライト",
    nicknames: "L, Ryuzaki",
    favorites: 119800,
    image_url: "https://cdn.myanimelist.net/images/characters/2/131811.jpg",
    raw_about_text: `Age: 25
Birthday: October 31
Height: 179 cm

L is a cold, analytical, and highly reserved private detective. He eats only sweets and crouches instead of sitting. He wears an oversized white long-sleeve shirt, denim pants, and no shoes. His speech is monotone and deadpan.`
  },
  {
    mal_id: 4093,
    full_name: "Light Yagami",
    name_kanji: "夜神 月",
    nicknames: "Kira",
    favorites: 89400,
    image_url: "https://cdn.myanimelist.net/images/characters/6/131821.jpg",
    raw_about_text: `Age: 17 (start)
Birthday: February 28
Height: 179 cm

Light is an arrogant, brilliant, and charismatic high school student who finds the Death Note. Under the alias Kira, he attempts to cleanse the world of criminals. He wears a formal school uniform blazer and necktie. He carries the Death Note notebook.`
  }
];

function runSeeder() {
  console.log("Initializing SQLite Database...");
  const db = getDatabase();
  db.exec("DELETE FROM characters");

  const args = process.argv.slice(2);
  const csvFlagIndex = args.indexOf("--csv");
  
  if (csvFlagIndex !== -1 && args[csvFlagIndex + 1]) {
    const csvPath = args[csvFlagIndex + 1];
    console.log(`Reading CSV file from ${csvPath}...`);
    try {
      const fileContent = fs.readFileSync(csvPath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const parsedCharacters: DatabaseCharacter[] = [];
      console.log(`Processing ${records.length} CSV rows...`);

      // Detect headers
      const firstRow = records[0] as any;
      const nameKey = Object.keys(firstRow).find(k => ["name", "full_name", "eng_name", "character_name"].includes(k.toLowerCase())) || "name";
      const bioKey = Object.keys(firstRow).find(k => ["about", "bio", "description", "raw_about_text"].includes(k.toLowerCase())) || "about";
      const malKey = Object.keys(firstRow).find(k => ["mal_id", "character_id", "id"].includes(k.toLowerCase())) || "mal_id";
      const kanjiKey = Object.keys(firstRow).find(k => ["name_kanji", "alternate_name", "japanese_name"].includes(k.toLowerCase())) || "name_kanji";
      const nickKey = Object.keys(firstRow).find(k => ["nicknames", "nickname"].includes(k.toLowerCase())) || "nicknames";
      const favKey = Object.keys(firstRow).find(k => ["favorites", "member_favorites"].includes(k.toLowerCase())) || "favorites";
      const imgKey = Object.keys(firstRow).find(k => ["image_url", "image", "img"].includes(k.toLowerCase())) || "image_url";

      console.log(`Mapped columns:
- Name: ${nameKey}
- Bio: ${bioKey}
- MAL ID: ${malKey}
- Kanji: ${kanjiKey}
- Nicknames: ${nickKey}
- Favorites: ${favKey}
- Image: ${imgKey}`);

      for (const record of records as any[]) {
        if (!record[nameKey]) continue;

        parsedCharacters.push({
          mal_id: parseInt(record[malKey], 10) || Math.floor(Math.random() * 1000000),
          full_name: record[nameKey],
          name_kanji: record[kanjiKey] || null,
          nicknames: record[nickKey] || null,
          favorites: parseInt(record[favKey], 10) || 0,
          raw_about_text: record[bioKey] || null,
          image_url: record[imgKey] || null
        });
      }

      console.log(`Inserting ${parsedCharacters.length} records into SQLite database...`);
      insertCharactersBatch(parsedCharacters);
      console.log("✓ CSV data successfully seeded.");
    } catch (err) {
      console.error("❌ Failed to parse CSV file:", err);
      process.exit(1);
    }
  } else {
    console.log("No CSV path provided. Seeding database with default anime characters...");
    insertCharactersBatch(SAMPLE_CHARACTERS);
    console.log("✓ Default sample characters successfully seeded.");
  }
  
  // Verify seeding
  const count = db.prepare("SELECT COUNT(*) as total FROM characters").get() as { total: number };
  console.log(`Total database entries: ${count.total}`);
  db.close();
}

runSeeder();
