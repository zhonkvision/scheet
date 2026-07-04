// ─── Local Keyword & Regex Extractor ───────────────────────────
// Enhanced rules-based text parser to extract visual tokens from
// character biographies. Works completely offline.

import type { ParsedTokens } from "./gemini";

// ── Role Keywords (expanded) ──────────────────────────────────
const ROLE_KEYWORDS = [
  { match: /\b(?:ninja|shinobi|kunoichi|konoha|genin|chunin|jonin|hokage|anbu)\b/i, label: "Ninja / Shinobi" },
  { match: /\b(?:pirate|buccaneer|corsair|straw hat|grand line|yonko|captain of.*crew)\b/i, label: "Pirate" },
  { match: /\b(?:swordsman|swordsmen|blade master|ronin|samurai|kenjutsu|fencer)\b/i, label: "Swordsman / Samurai" },
  { match: /\b(?:demon slayer|demon hunter|slayer corps|hashira)\b/i, label: "Demon Slayer" },
  { match: /\b(?:bounty hunter|bounty-hunter)\b/i, label: "Bounty Hunter" },
  { match: /\b(?:assassin|hitman|killer|executioner)\b/i, label: "Assassin" },
  { match: /\b(?:alchemist|alchemy|transmutation)\b/i, label: "Alchemist" },
  { match: /\b(?:exorcist|jujutsu|curse|sorcerer|shaman)\b/i, label: "Jujutsu Sorcerer" },
  { match: /\b(?:hero|pro hero|quirk|villain|superhero|number one hero)\b/i, label: "Pro Hero" },
  { match: /\b(?:titan|survey corps|scout regiment|military|garrison)\b/i, label: "Survey Corps Soldier" },
  { match: /\b(?:shinigami|soul reaper|soul society|zanpakuto|bankai|gotei)\b/i, label: "Shinigami / Soul Reaper" },
  { match: /\b(?:hunter|nen|greed island|chimera ant)\b/i, label: "Hunter" },
  { match: /\b(?:hacker|netrunner|cybernetic|programmer|cyber)\b/i, label: "Cybernetic Hacker" },
  { match: /\b(?:detective|investigator|inspector|sleuth|police officer)\b/i, label: "Detective" },
  { match: /\b(?:mage|wizard|sorcerer(?:ess)?|witch|warlock|spellcaster|magic user)\b/i, label: "Mage / Sorcerer" },
  { match: /\b(?:mechanic|engineer|inventor|smith|tinkerer|automail)\b/i, label: "Mechanic / Engineer" },
  { match: /\b(?:soldier|warrior|knight|fighter|guard|mercenary|vanguard|combat)\b/i, label: "Vanguard Warrior" },
  { match: /\b(?:student|high school|schoolboy|schoolgirl|academy|classmate|class rep)\b/i, label: "Student" },
  { match: /\b(?:doctor|nurse|physician|medic|healer|medical)\b/i, label: "Medic / Healer" },
  { match: /\b(?:pilot|eva|mecha|robot|gundam|cockpit)\b/i, label: "Mecha Pilot" },
  { match: /\b(?:spy|espionage|intelligence|secret agent|undercover)\b/i, label: "Spy / Agent" },
  { match: /\b(?:thief|rogue|phantom|burglar|steal)\b/i, label: "Phantom Thief" },
  { match: /\b(?:priest|monk|cleric|shrine|maiden|priestess|nun)\b/i, label: "Shrine Maiden / Cleric" },
  { match: /\b(?:vampire|ghoul|undead|immortal being)\b/i, label: "Supernatural Entity" },
  { match: /\b(?:king|queen|emperor|empress|princess|prince|royalty|ruler)\b/i, label: "Royalty" },
  { match: /\b(?:captain|commander|general|colonel|lieutenant|admiral)\b/i, label: "Military Commander" },
  { match: /\b(?:teacher|sensei|professor|instructor|mentor)\b/i, label: "Teacher / Mentor" },
  { match: /\b(?:scientist|researcher|professor|lab|experiment)\b/i, label: "Scientist / Researcher" },
];

// ── Theme Keywords (expanded) ─────────────────────────────────
const THEME_KEYWORDS = [
  { match: /\b(?:cyberpunk|neon|dystopian|implants|megacorporation|augment|android)\b/i, label: "Gritty Cyberpunk Dystopia" },
  { match: /\b(?:steampunk|gears|steam-powered|victorian|airship|brass)\b/i, label: "Steampunk Adventure" },
  { match: /\b(?:fantasy|kingdom|dragons?|elven|medieval|castle|paladin|guild|dungeon)\b/i, label: "High Fantasy" },
  { match: /\b(?:space|galaxy|alien|starship|futuristic|orbit|mecha|gundam|colony)\b/i, label: "Futuristic Space Opera" },
  { match: /\b(?:apocalypse|apocalyptic|wasteland|survival|ruins|radiation|zombie)\b/i, label: "Post-Apocalyptic Survivalist" },
  { match: /\b(?:slice of life|club|everyday|romance|comedy|dating)\b/i, label: "Slice-of-Life / Retro 90s" },
  { match: /\b(?:supernatural|ghost|spirit|demon|vampire|shinigami|ghoul|curse|jujutsu|exorcist)\b/i, label: "Urban Supernatural / Magic Realism" },
  { match: /\b(?:shounen|shonen|battle|tournament|training|power[-\s]?up|rival)\b/i, label: "Classic Shounen Fantasy" },
  { match: /\b(?:school|academy|highschool|high school|campus|class|student council)\b/i, label: "Academy / School Life" },
  { match: /\b(?:martial art|fighting|dojo|tournament|spar|combat sport)\b/i, label: "Martial Arts / Combat Sports" },
  { match: /\b(?:pirate|sea|ocean|island|grand line|navy|marine|ship)\b/i, label: "Pirate / Nautical Adventure" },
  { match: /\b(?:ninja|shinobi|village|hidden leaf|hidden sand|jutsu|chakra)\b/i, label: "Ninja / Shinobi World" },
  { match: /\b(?:isekai|another world|summoned|reincarnated|transported)\b/i, label: "Isekai / Fantasy World" },
  { match: /\b(?:horror|terror|psychological|thriller|suspense|mystery|murder)\b/i, label: "Psychological Thriller" },
  { match: /\b(?:military|war|battle|army|regiment|corps|front line)\b/i, label: "Military / War Drama" },
];

// ── Personality Traits (expanded) ─────────────────────────────
const PERSONALITY_TRAITS = [
  "determined", "energetic", "kind", "cold", "analytical", "reserved", "cynical",
  "witty", "loyal", "stoic", "brave", "disciplined", "cheerful", "optimistic",
  "naive", "rebellious", "fierce", "sharp", "quiet", "mysterious", "wise", "bold",
  "calm", "courageous", "gentle", "clumsy", "hot-headed", "arrogant", "ambitious",
  "calculating", "ruthless", "compassionate", "stubborn", "lazy", "perverted",
  "intelligent", "cunning", "sarcastic", "caring", "reckless", "sadistic",
  "protective", "shy", "timid", "serious", "carefree", "prideful", "honorable",
  "charismatic", "manipulative", "pragmatic", "competitive", "selfish", "selfless",
  "brooding", "impulsive", "violent", "cruel", "merciless", "vengeful", "devoted",
  "confident", "insecure", "eccentric", "flamboyant", "apathetic", "nihilistic",
  "idealistic", "pessimistic", "playful", "mischievous", "aloof", "blunt",
  "hot-blooded", "cool-headed", "temperamental", "relentless", "patient",
];

// ── Age Extraction Patterns ──────────────────────────────────
const AGE_REGEXES = [
  /\b(?:age|aged)[:\s-]*(\d+)\b/i,
  /\b(\d+)[\s-]*years?[\s-]*old\b/i,
  /\b(\d+)-years?-old\b/i,
  /\b(?:around|approx|circa)[\s-]*(\d+)\b/i,
];

// ── Contextual Hair Description Extraction ───────────────────
// These patterns capture actual descriptive phrases from bios
const HAIR_PATTERNS = [
  // "has [adjective] [color] hair" or "with [adj] [color] hair"
  /(?:has|have|with|wears?|sporting)\s+(?:a\s+)?([a-z,\s]+?)\s+hair/i,
  // "[color] hair styled in [style]"
  /([a-z]+)\s+hair(?:\s+(?:styled|tied|done|worn|cut|pulled|kept)\s+(?:in|into|back|up)\s+(?:a\s+)?([a-z\s]+))?/i,
  // "her/his hair is [description]"
  /(?:her|his|their)\s+hair\s+is\s+([a-z,\s]+)/i,
];

const HAIR_COLORS: Record<string, string> = {
  "black": "jet black", "dark": "dark", "ebony": "jet black",
  "blonde": "golden blonde", "blond": "golden blonde", "gold": "golden",
  "brown": "chestnut brown", "brunette": "chestnut brown",
  "red": "crimson red", "crimson": "crimson red", "scarlet": "scarlet red", "auburn": "auburn red",
  "pink": "sakura pink", "rose": "rose pink", "magenta": "deep magenta",
  "blue": "royal blue", "azure": "azure blue", "navy": "deep navy",
  "green": "emerald green", "teal": "deep teal", "mint": "mint green",
  "purple": "violet purple", "violet": "deep violet", "lavender": "soft lavender",
  "white": "pure white", "silver": "platinum silver", "grey": "ash grey", "gray": "ash grey",
  "orange": "fiery orange", "ginger": "warm ginger",
  "cyan": "neon cyan", "turquoise": "vivid turquoise",
  "platinum": "platinum blonde",
};

const HAIR_STYLES: Record<string, string> = {
  "spiky": "spiky", "spiked": "spiky", "spike": "spiky",
  "long": "long flowing", "short": "short cropped",
  "braid": "braided", "braided": "braided", "pigtail": "twin braids",
  "ponytail": "high ponytail", "bun": "neat bun", "topknot": "top knot",
  "curly": "curly", "wavy": "wavy", "straight": "long straight",
  "messy": "messy unkempt", "fluffy": "fluffy tousled",
  "twintail": "twin tails", "twin tail": "twin tails", "twintails": "twin tails",
  "dreadlock": "dreadlocks", "dreadlocks": "dreadlocks",
  "bob": "bob cut", "pixie": "pixie cut",
  "shaved": "shaved", "buzz": "buzz cut", "bald": "bald",
  "undercut": "undercut", "mohawk": "mohawk",
  "afro": "afro", "cornrow": "cornrows", "cornrows": "cornrows",
};

// ── Wardrobe Extraction Patterns ─────────────────────────────
const WARDROBE_PATTERNS = [
  // "wearing a [description]" / "dressed in [description]"
  /(?:wearing|wears?|dressed in|clothed in|clad in)\s+(?:a\s+)?([^.,;]{8,80})/gi,
  // "his/her outfit consists of"
  /(?:outfit|attire|clothing|clothes|garb|costume)\s+(?:consists?\s+of|includes?|features?)\s+([^.,;]{8,80})/gi,
];

// ── Prop/Weapon Extraction Patterns ──────────────────────────
const PROP_PATTERNS = [
  // "wields/carries/armed with [weapon]"
  /(?:wields?|carries?|carry|armed with|uses?|fights?\s+with|equipped with)\s+(?:a\s+|an\s+|the\s+|his\s+|her\s+|their\s+)?([^.,;]{5,80})/gi,
  // "his/her weapon is" / "signature weapon"
  /(?:weapon|signature\s+(?:weapon|item|prop|tool))\s+(?:is|:)\s+(?:a\s+|an\s+|the\s+)?([^.,;]{5,60})/gi,
  // "known for [weapon-related thing]"
  /known\s+for\s+(?:his|her|their)\s+([^.,;]*?(?:sword|blade|gun|pistol|rifle|bow|spear|lance|staff|wand|hammer|axe|shield|scythe|whip|gauntlet|fist|claw|knife|dagger)[^.,;]*)/gi,
];

// ── CHARACTER_DESCRIPTIONS for visual name generation ─────────
const CHARACTER_DESCRIPTIONS: Record<string, string> = {
  "naruto uzumaki": "a boisterous young ninja with spiky blonde hair, wearing a vibrant orange jumpsuit and a metal-plated forehead protector",
  "sasuke uchiha": "a brooding rogue ninja with dark spiky hair, wearing a high-collared dark blue tunic and hand bandages",
  "monkey d. luffy": "a lean, energetic young pirate wearing a red vest, denim shorts, sandals, and a signature wide-brimmed straw hat",
  "roronoa zoro": "a muscular swordsman with short green hair, wearing a green sash, dark coat, and three gold earrings",
  "son goku": "a powerful martial arts warrior with spiky black hair, wearing a classic orange and blue gi with matching wristbands",
  "vegeta": "a proud warrior with upward-spiky black hair, wearing white and blue tactical chest armor, white gloves, and boots",
  "l lawliet": "a pale, thin detective with messy black hair, wearing a loose white long-sleeve shirt and denim pants, sitting in a crouched stance",
  "light yagami": "a clean-cut high school student with light brown hair, wearing a formal tan school blazer, white shirt, and red tie",
};

/**
 * Enhanced keyword & regex extractor for character biography text.
 * 
 * Extraction priority:
 * 1. Structured lines (Role:, Personality:, etc.) — from database characters
 * 2. Contextual sentence patterns — from freeform Jikan/AniList bios
 * 3. Keyword fallback — for generic matching
 */
export function extractKeywordsFromBio(name: string, bio: string): ParsedTokens {
  const cleanBio = bio.toLowerCase();
  const nameKey = name.toLowerCase().trim();

  // ── Structured line matchers (from database characters) ────
  const structRoleMatch = bio.match(/^Role:\s*([^\r\n]+)/im);
  const structPersonalityMatch = bio.match(/^Personality:\s*([^\r\n]+)/im);
  const structThemeMatch = bio.match(/^Aesthetic Colors:\s*([^\r\n]+)/im);
  const structSpeciesMatch = bio.match(/^Species:\s*([^\r\n]+)/im);
  const structAccentMatch = bio.match(/^Speech Accent:\s*([^\r\n]+)/im);

  // ── 1. ROLE ────────────────────────────────────────────────
  let role = "Vanguard Warrior";
  if (structRoleMatch) {
    role = structRoleMatch[1].trim();
  } else {
    for (const item of ROLE_KEYWORDS) {
      if (item.match.test(cleanBio)) {
        role = item.label;
        break;
      }
    }
  }

  // ── 2. AGE ─────────────────────────────────────────────────
  let age = "Unknown / Ageless";
  for (const regex of AGE_REGEXES) {
    const match = bio.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num < 13) age = `Child (${num})`;
      else if (num < 18) age = `Teenager (${num})`;
      else if (num < 30) age = `Young Adult (${num})`;
      else if (num < 50) age = `Prime Adult (${num})`;
      else age = `Veteran (${num})`;
      break;
    }
  }
  if (age === "Unknown / Ageless") {
    if (/\b(?:child|kid|little)\b/i.test(cleanBio)) age = "Child (8 - 12)";
    else if (/\b(?:student|teen|teenager|adolescent|school)\b/i.test(cleanBio)) age = "Teenager (14 - 17)";
    else if (/\b(?:young adult|young man|young woman|college|university)\b/i.test(cleanBio)) age = "Young Adult (18 - 25)";
    else if (/\b(?:immortal|ancient|eternal|ageless|undead|god)\b/i.test(cleanBio)) age = "Ancient Immortal (100+)";
  }

  // ── 3. PERSONALITY ─────────────────────────────────────────
  let personality = "";
  if (structPersonalityMatch) {
    personality = structPersonalityMatch[1]
      .split(",")
      .map(s => {
        const t = s.replace(/\band\b/g, "").trim();
        return t.charAt(0).toUpperCase() + t.slice(1);
      })
      .filter(s => s.length > 0)
      .join(", ");
  } else {
    const foundTraits: string[] = [];
    for (const trait of PERSONALITY_TRAITS) {
      // Use word boundary matching to avoid partial matches
      const traitRegex = new RegExp(`\\b${trait}\\b`, "i");
      if (traitRegex.test(cleanBio)) {
        foundTraits.push(trait.charAt(0).toUpperCase() + trait.slice(1));
      }
      if (foundTraits.length === 3) break;
    }
    if (foundTraits.length < 3) {
      const defaults = ["Brave", "Determined", "Loyal", "Mysterious"];
      for (const d of defaults) {
        if (!foundTraits.includes(d)) foundTraits.push(d);
        if (foundTraits.length === 3) break;
      }
    }
    personality = foundTraits.join(", ");
  }

  // ── 4. CORE THEME ──────────────────────────────────────────
  let coreTheme = "Classic Shounen Fantasy";
  if (structThemeMatch) {
    coreTheme = structThemeMatch[1].trim();
  } else {
    for (const item of THEME_KEYWORDS) {
      if (item.match.test(cleanBio)) {
        coreTheme = item.label;
        break;
      }
    }
  }

  // ── 5. SPEECH ACCENT ───────────────────────────────────────
  let accent = "Formal, polite, articulate";
  if (structAccentMatch) {
    accent = structAccentMatch[1].trim();
  } else if (/\b(?:loud|yell|shout|energetic|boisterous|exclaim)\b/i.test(cleanBio)) {
    accent = "Informal, energetic, loud";
  } else if (/\b(?:monotone|robotic?|cold|deadpan|expressionless)\b/i.test(cleanBio)) {
    accent = "Deadpan, monotone, measured";
  } else if (/\b(?:silent|quiet|reserved|rarely speaks|few words)\b/i.test(cleanBio)) {
    accent = "Gruff, low-pitched, brief";
  } else if (/\b(?:polite|formal|elegant|refined|well-spoken|articulate)\b/i.test(cleanBio)) {
    accent = "Formal, polite, highly articulate";
  } else if (/\b(?:crude|vulgar|foul|profanity|swear|cursing|rough)\b/i.test(cleanBio)) {
    accent = "Crude, aggressive, foul-mouthed";
  } else if (/\b(?:sarcastic|witty|dry humor|ironic|sardonic)\b/i.test(cleanBio)) {
    accent = "Sarcastic, witty, dry";
  } else if (/\b(?:cocky|arrogant|condescend|superior|smug)\b/i.test(cleanBio)) {
    accent = "Cocky, arrogant, condescending";
  } else if (/\b(?:gentle|soft-spoken|warm|soothing|maternal|paternal)\b/i.test(cleanBio)) {
    accent = "Gentle, soft-spoken, warm";
  }

  // ── 6. WARDROBE DETAILS ────────────────────────────────────
  let wardrobeDetails = "";
  // Try structured bio extraction first (database characters)
  const wearMatch = cleanBio.match(/they wear\s+([^.]+?)(?:\.|\s+in\s+a\s+color)/i);
  if (wearMatch) {
    wardrobeDetails = wearMatch[1].trim();
  } else {
    // Try freeform patterns from Jikan/AniList bios
    const wardrobeMatches: string[] = [];
    for (const pattern of WARDROBE_PATTERNS) {
      pattern.lastIndex = 0; // reset global regex
      let m;
      while ((m = pattern.exec(bio)) !== null) {
        const desc = m[1].trim();
        if (desc.length > 5 && desc.length < 100) {
          wardrobeMatches.push(desc);
        }
        if (wardrobeMatches.length >= 2) break;
      }
      if (wardrobeMatches.length >= 2) break;
    }
    if (wardrobeMatches.length > 0) {
      wardrobeDetails = wardrobeMatches.join(", ");
    } else {
      // Fallback to keyword-based extraction
      const items: string[] = [];
      if (/\b(?:cloak|cape|mantle)\b/i.test(cleanBio)) items.push("flowing cloak");
      if (/\b(?:robe|kimono|yukata|haori)\b/i.test(cleanBio)) items.push("traditional robes");
      if (/\b(?:armor|plate|cuirass)\b/i.test(cleanBio)) items.push("tactical armor");
      if (/\b(?:uniform|blazer|school)\b/i.test(cleanBio)) items.push("school uniform");
      if (/\b(?:jacket|coat|trenchcoat)\b/i.test(cleanBio)) items.push("weathered jacket");
      if (/\b(?:suit|tuxedo|formal)\b/i.test(cleanBio)) items.push("formal suit");
      if (/\b(?:dress|gown|skirt)\b/i.test(cleanBio)) items.push("flowing dress");
      if (/\b(?:vest|waistcoat)\b/i.test(cleanBio)) items.push("fitted vest");
      if (/\b(?:bandage|wrapping|wrap)\b/i.test(cleanBio)) items.push("combat bandages");
      if (/\b(?:boots|sandals|footwear)\b/i.test(cleanBio)) items.push("combat boots");
      if (/\b(?:gloves|gauntlet)\b/i.test(cleanBio)) items.push("combat gloves");
      if (/\b(?:mask|visor|goggles|eyepatch)\b/i.test(cleanBio)) items.push("face covering");
      if (/\b(?:scarf|sash|belt)\b/i.test(cleanBio)) items.push("worn sash");
      if (/\b(?:jumpsuit|bodysuit)\b/i.test(cleanBio)) items.push("tactical bodysuit");
      if (/\b(?:hat|cap|helmet|headband|forehead protector)\b/i.test(cleanBio)) items.push("distinctive headwear");
      wardrobeDetails = items.length > 0 ? items.slice(0, 3).join(", ") : "customized tactical attire";
    }
  }

  // ── 7. KEY PROP / SIGNATURE WEAPON ─────────────────────────
  let keyProp = "";
  // Structured bio extraction first (database characters)
  const carryMatch = cleanBio.match(/carry\s+(?:a\s+)?([^.]+?)(?:\s+as\s+their\s+signature\s+prop|\.\s)/i) ||
                     cleanBio.match(/equipped\s+with\s+(?:a\s+)?([^.]+?)(?:\s+and\s+carry|\.\s)/i);
  if (carryMatch) {
    keyProp = carryMatch[1].trim();
  } else {
    // Try freeform patterns
    for (const pattern of PROP_PATTERNS) {
      pattern.lastIndex = 0;
      const m = pattern.exec(bio);
      if (m) {
        const prop = m[1].trim();
        if (prop.length > 3 && prop.length < 80) {
          keyProp = prop;
          break;
        }
      }
    }
    if (!keyProp) {
      // Keyword fallback
      if (/\b(?:katana|sword|blade|claymore|saber|zanpakuto)\b/i.test(cleanBio)) keyProp = "Signature Sword";
      else if (/\b(?:gun|pistol|rifle|revolver|sniper)\b/i.test(cleanBio)) keyProp = "Custom Firearm";
      else if (/\b(?:bow|arrow|crossbow)\b/i.test(cleanBio)) keyProp = "Precision Bow";
      else if (/\b(?:staff|wand|scepter)\b/i.test(cleanBio)) keyProp = "Ornate Staff";
      else if (/\b(?:spear|lance|javelin|trident|halberd)\b/i.test(cleanBio)) keyProp = "War Spear";
      else if (/\b(?:shield|buckler)\b/i.test(cleanBio)) keyProp = "Guardian Shield";
      else if (/\b(?:scythe|sickle)\b/i.test(cleanBio)) keyProp = "Death Scythe";
      else if (/\b(?:gauntlet|fist|gloves|knuckle)\b/i.test(cleanBio)) keyProp = "Reinforced Gauntlets";
      else if (/\b(?:whip|chain|flail)\b/i.test(cleanBio)) keyProp = "Spiked Whip";
      else if (/\b(?:hammer|mace|club)\b/i.test(cleanBio)) keyProp = "War Hammer";
      else if (/\b(?:book|tome|grimoire|notebook|diary|note)\b/i.test(cleanBio)) keyProp = "Ancient Tome";
      else if (/\b(?:ring|pendant|amulet|necklace|talisman)\b/i.test(cleanBio)) keyProp = "Mystic Talisman";
      else keyProp = "Signature artifact — unique to character";
    }
  }

  // ── 8. ALIAS ───────────────────────────────────────────────
  let alias = "";
  // Check for nicknames/titles in text
  const aliasMatch = bio.match(/(?:known as|nicknamed?|called|alias|title[sd]?|moniker)\s+["']?([^"'.,\n]{3,40})["']?/i);
  if (aliasMatch) {
    alias = aliasMatch[1].trim();
  } else if (/\bhero\b/i.test(cleanBio)) alias = "Hero of the People";
  else if (/\bcaptain\b/i.test(cleanBio)) alias = "Captain";
  else if (/\b(?:ghost|shadow|phantom)\b/i.test(cleanBio)) alias = "Ghost Operative";
  else if (/\b(?:legend|legendary)\b/i.test(cleanBio)) alias = "The Legend";
  else if (/\b(?:prodigy|genius|gifted)\b/i.test(cleanBio)) alias = "The Prodigy";
  else alias = "Wanderer of the Realm";

  // ── 9. DESCRIPTIVE NAME ────────────────────────────────────
  let descriptiveName = "";
  if (CHARACTER_DESCRIPTIONS[nameKey]) {
    descriptiveName = CHARACTER_DESCRIPTIONS[nameKey];
  } else if (nameKey.startsWith("fusion of")) {
    const parts = nameKey.replace("fusion of", "").split("and");
    if (parts.length === 2) {
      const partA = parts[0].trim();
      const partB = parts[1].trim();
      const descA = CHARACTER_DESCRIPTIONS[partA] || `a ${role.toLowerCase()} wearing ${wardrobeDetails}`;
      const descB = CHARACTER_DESCRIPTIONS[partB] || `a subject wearing ${wardrobeDetails}`;
      descriptiveName = `a hybrid fusion combining elements of [${descA}] and [${descB}]`;
    } else {
      const trait = personality.split(",")[0].trim().toLowerCase();
      descriptiveName = `a hybrid ${trait} ${role.toLowerCase()} combining spliced visual features`;
    }
  } else {
    const trait = personality.split(",")[0].trim().toLowerCase();
    descriptiveName = `a ${trait} ${role.toLowerCase()} wearing ${wardrobeDetails}`;
  }
  descriptiveName = descriptiveName.charAt(0).toUpperCase() + descriptiveName.slice(1);

  // ── 10. GENDER ─────────────────────────────────────────────
  let gender = "Non-binary / Androgynous";
  if (/\b(?:she|her|hers|female|woman|girl|queen|goddess|princess|mother|sister|heroine|wife|daughter|lady)\b/i.test(cleanBio)) {
    gender = "Female";
  } else if (/\b(?:he|him|his|male|man|boy|king|god|emperor|prince|father|brother|son|husband)\b/i.test(cleanBio)) {
    gender = "Male";
  }

  // ── 11. HAIRSTYLE ──────────────────────────────────────────
  let hairColor = "";
  let hairStyle = "";

  // Try to extract hair description from contextual sentences
  for (const pattern of HAIR_PATTERNS) {
    const m = bio.match(pattern);
    if (m && m[1]) {
      const hairDesc = m[1].toLowerCase().trim();
      // Extract color from the description
      for (const [keyword, mapped] of Object.entries(HAIR_COLORS)) {
        if (hairDesc.includes(keyword)) {
          hairColor = mapped;
          break;
        }
      }
      // Extract style from the description
      for (const [keyword, mapped] of Object.entries(HAIR_STYLES)) {
        if (hairDesc.includes(keyword)) {
          hairStyle = mapped;
          break;
        }
      }
      if (m[2]) {
        const styleDesc = m[2].toLowerCase().trim();
        for (const [keyword, mapped] of Object.entries(HAIR_STYLES)) {
          if (styleDesc.includes(keyword)) {
            hairStyle = mapped;
            break;
          }
        }
      }
      if (hairColor || hairStyle) break;
    }
  }

  // Fallback: scan entire bio for hair color keywords
  if (!hairColor) {
    // Look specifically near the word "hair"
    const nearHairMatch = cleanBio.match(/(\w+)\s+hair/);
    if (nearHairMatch) {
      const colorWord = nearHairMatch[1];
      if (HAIR_COLORS[colorWord]) {
        hairColor = HAIR_COLORS[colorWord];
      }
    }
    // Broader scan
    if (!hairColor) {
      for (const [keyword, mapped] of Object.entries(HAIR_COLORS)) {
        if (cleanBio.includes(keyword + " hair")) {
          hairColor = mapped;
          break;
        }
      }
    }
    if (!hairColor) hairColor = "dark";
  }

  // Fallback: scan for style keywords
  if (!hairStyle) {
    for (const [keyword, mapped] of Object.entries(HAIR_STYLES)) {
      if (cleanBio.includes(keyword)) {
        hairStyle = mapped;
        break;
      }
    }
    if (!hairStyle) hairStyle = "natural";
  }

  const hairstyle = `${hairColor} ${hairStyle} hair`;

  return {
    name: descriptiveName,
    alias,
    role,
    age,
    gender,
    hairstyle,
    personality,
    coreTheme,
    accent,
    wardrobeDetails,
    keyProp,
  };
}
