import fs from "fs";
import path from "path";

// ─── Highly Expanded Vocabulary for 5,000+ Combinations ──────
const ELEMENTS = [
  "Abyssal", "Aetheric", "Ashen", "Bio-Engineered", "Caelum", "Cerulean", "Chrono", 
  "Cryo", "Dusk", "Ember", "Elder", "Feral", "Iron", "Magnetic", "Nebula", "Obsidian", 
  "Runic", "Rust", "Solar", "Spectral", "Steampunk", "Tectonic", "Vapor", "Void", 
  "Whispering", "Zenith", "Zephyr", "Cybernetic", "Gothic", "Vanguard", "Rogue", 
  "Outlaw", "Hermit", "Wandering", "Astral", "Crystalline", "Prismatic", "Subterranean",
  "Clockwork", "Galactic", "Volcanic", "Phantom", "Glacial", "Toxic", "Gilded",
  "Tainted", "Radiant", "Infernal", "Celestial", "Echoing", "Vortex", "Horizon",
  "Pinnacle", "Aero", "Bio", "Cyborg", "Deep-Sea", "Desolate", "Divine", "Doomsday",
  "Dread", "Ethereal", "Holographic", "Luminescent", "Mechanized", "Metalloid",
  "Nether", "Omega", "Overloaded", "Plague", "Quantum", "Radioactive", "Relic",
  "Shattered", "Singularity", "Sonic", "Stellar", "Synthetic", "Thermal", "Vector",
  "Abyssal", "Aeon", "Anomalous", "Apocalypse", "Cataclysmic", "Centurion", "Cyber",
  "Daemon", "Dynasty", "Entropy", "Ether", "Fracture", "Fusion", "Genesis", "Helix",
  "Hyper", "Infinite", "Kinetic", "Matrix", "Mutant", "Nano", "Nebulous", "Nexus"
];

const BASE_CLASSES = [
  "Hunter", "Guardian", "Engineer", "Collector", "Strategist", "Captain", "Priest", 
  "Mechanic", "Vanguard", "Scholar", "Sovereign", "Infiltrator", "Stalker", "Sentinel", 
  "Mage", "Warlock", "Knight", "Mercenary", "Outcast", "Blade", "Alchemist", "Astrologer",
  "Scavenger", "Pathfinder", "Cartographer", "Necromancer", "Inquisitor", "Acrobat",
  "Pilot", "Nomad", "Monk", "Slayer", "Warden", "Reaper", "Diviner", "Templar",
  "Acolyte", "Shaman", "Druid", "Ranger", "Sapper", "Vindicator", "Chronicler",
  "Arkanist", "Artisan", "Barbarian", "Bard", "Beastmaster", "Brawler", "Challenger",
  "Champion", "Cleric", "Commander", "Conjurer", "Crusader", "Defiler", "Duelist",
  "Enchanter", "Executioner", "Exorcist", "Gladiator", "Harbinger", "Huntsman",
  "Infiltrator", "Juggernaut", "Lancer", "Legionnaire", "Marksman", "Marshal",
  "Mystic", "Paladin", "Oracle", "Runesmith", "Sage", "Scourge", "Seeker"
];

const ADJECTIVES = [
  "Crimson", "Silent", "Iron", "Void", "Spectral", "Phantom", "Golden", "Ashen", 
  "Eternal", "Feral", "Shattered", "Rust", "Whispering", "Solar", "Lunar", "Obsidian", 
  "Steampunk", "Ancient", "Savage", "Bleak", "Vibrant", "Cursed", "Blessed", "Hollow",
  "Gleaming", "Hidden", "Forgotten", "Boundless", "Sovereign", "Exiled", "Dying",
  "Cobalt", "Neon", "Tainted", "Radiant", "Prismatic", "Subtle", "Fallen", "Ascended",
  "Midnight", "Twilight", "Stormy", "Frosty", "Onyx", "Emerald", "Sapphire",
  "Amber", "Bone", "Bronze", "Copper", "Dark", "Deep", "Divine", "Dread",
  "Dusty", "Eerie", "Faded", "Fiery", "Frozen", "Grave", "Grim", "Ironclad",
  "Lost", "Mist", "Pale", "Plague", "Quiet", "Raging", "Relic", "Rotten",
  "Shadow", "Silver", "Star", "Steel", "Stone", "Storm", "Sun", "Wild"
];

const NOUNS = [
  "Oracle", "Wanderer", "Saint", "Shepherd", "Blade", "Monarch", "Specter", "Scholar", 
  "Stalker", "Vanguard", "Shaman", "Reaper", "Sentinel", "Avenger", "Outcast", "Zealot", 
  "Templar", "Exile", "Trapper", "Gale", "Beacon", "Pinnacle", "Spire", "Catalyst",
  "Nomad", "Pilgrim", "Ghost", "Shadow", "Warden", "Keeper", "Lord", "Bane",
  "Anchor", "Architect", "Baron", "Beast", "Captain", "Champion", "Claw", "colossus",
  "Demon", "Dragon", "Emperor", "Fang", "Fiend", "Giant", "Golem", "Gorgon",
  "Guardian", "Herald", "Hunter", "Judge", "King", "Knight", "Mage", "Master"
];

const LOCATIONS = [
  "Wasteland", "Rift", "Eclipse", "Deep", "Zenith", "Abyss", "Shattered Star", 
  "Rust Valley", "Silent Forest", "Hollow Sea", "Dying Sun", "Neon City", "Astral Plain",
  "Obsidian Spire", "Frozen Tundra", "Iron Citadel", "Lost Oasis", "Whispering Vault",
  "Aether Sky", "Vortex Zone", "Crystalline Dome", "Crimson Peak", "Sub-City Grid",
  "Ashen Heap", "Black Dunes", "Dread Marshes", "Ember Crater", "Forgotten Oasis",
  "Gilded Palace", "Hollow Mountain", "Ice Shelf", "Jungle Grid", "Lost Valley",
  "Misty Shore", "Nebulous Void", "Outpost-9", "Plague Swamp", "Quantum Core"
];

const BASE_TRAITS = [
  "fearless", "compassionate", "manipulative", "curious", "disciplined", "eccentric", 
  "optimistic", "calculating", "stoic", "brave", "rebellious", "fierce", "quiet", 
  "wise", "bold", "calm", "courageous", "gentle", "clumsy", "hot-headed", "arrogant", 
  "ambitious", "reserved", "analytical", "loyal", "cynical", "witty", "devout", 
  "idealistic", "ruthless", "melancholy", "pragmatic", "mercurial", "playful",
  "stubborn", "observant", "proud", "patient", "skeptical", "sincere", "devious",
  "vigilant", "cautious", "flamboyant", "modest", "unpredictable", "driven",
  "creative", "gullible", "impatient", "protective", "eccentric", "quiet", "talkative"
];

const BASE_THEMES = [
  "Redemption", "Destiny", "Chaos", "Nature", "Technology", "Revenge", "Hope", 
  "Isolation", "Cosmic Mystery", "Betrayal", "Legacy", "Power", "Duty", "Sacrifice", 
  "Freedom", "Madness", "Rebirth", "Survival", "Loss", "Truth", "Creation", "Decay",
  "Ambition", "Tranquility", "Honor", "Justice", "Discovery", "Anarchy", "Order",
  "Greed", "Humility", "Innocence", "Despair", "Guilt", "Pride", "Time"
];

const ACCENT_STYLES = [
  "Formal, polite, highly articulate", "Sarcastic, deadpan, teasing", 
  "Military, brief, barking commands", "Noble, grand, theatrical", 
  "Soft-spoken, whispery, hesitant", "Gruff, low-pitched, brief", 
  "Street slang, fast-paced, colorful", "Mysterious, riddling, poetic", 
  "Robotic, monotone, synthesized", "Whispering, raspy, echoing",
  "Lyrical, singing, melodic", "Mumbled, fast, anxious",
  "Pretentious, verbose, condescending", "Stuttering, nervous, rapid",
  "Guttural, growling, aggressive", "Warm, welcoming, maternal"
];

const ACCENT_MODIFIERS = [
  "with frequent tactical callouts", "speaking in short fragments",
  "quoting ancient laws", "pausing frequently for dramatic effect",
  "with an echoing delay", "delivering brief commands",
  "speaking in rhyming couplets", "highly dynamic and fluid",
  "slightly singing vowel sounds", "speaking in anxious bursts",
  "using dense tech-jargon", "interjecting quiet giggles",
  "incorporating mechanical clicks", "whispering alternate words",
  "frequently raising tone at the end"
];

const WARDROBE_OUTER = [
  "weathered cloak", "oversized hoodie", "ceremonial robes", "layered heavy armor", 
  "tactical harness", "flight jacket", "leather duster", "stealth bodysuit",
  "patchwork poncho", "tailored high-collar coat", "rusted iron pauldrons", "monastic cowl",
  "insulated hazard suit", "embroidered doublet", "split-panel haori", "plated longcoat",
  "techwear asymmetrical windbreaker", "reflective neon bomber jacket", 
  "double-breasted velvet tailcoat", "ornate royal silk kimono", 
  "layered chainmail hauberk", "victorian lace corset gown", 
  "high-collared mandarin cheongsam", "heavy utility chest rig", 
  "magnetic-latch astronaut spacesuit", "distressed denim streetwear jacket", 
  "cybernetic skeletal exo-suit frame", "gas-mask equipped leather vest", 
  "hooded shadows monastic cowl", "star-embroidered wizard robe", 
  "oversized knitted streetwear cardigan", "reinforced armor plate chest piece",
  "classic orange martial arts gi with royal blue undershirt",
  "two-tone orange and blue combat training gi",
  "torn orange martial arts training gi showing blue under-clothing",
  "ribbed blue spandex undersuit with white and gold plated chest armor",
  "white-and-yellow ribbed combat armor plate with high-collared blue spandex",
  "cropped dark blue denim jacket worn over a black tank top",
  "heavy weighted purple training gi with a massive white weighted shoulder cape",
  "sleek white combat chest plate with black shoulder flaps and thigh-guards",
  "egyptian-inspired dark blue sash decorated with golden emblems and neck-collar",
  "loose-fitting orange Hawaiian shirt with white martial arts trousers",
  "purple training gi with red wristbands and white waist sash"
];

const WARDROBE_DETAILS = [
  "glowing embroidery", "cybernetic prosthetics", "utility belts", "futuristic fabrics", 
  "brass rivets", "spiked plates", "fur linings", "scrolled scriptures", "holographic badges",
  "wrapped bandages", "dangling talismans", "carbon-fiber meshes", "metallic skeletal rig",
  "integrated wiring", "gold filigree borders", "liquid-cooled channels",
  "tactical modular strap rigging", "reflective fiber-optic strips", 
  "copper clockwork gears", "leather lace-up bindings", 
  "embroidered dragon patches", "hanging mechanical keychains", 
  "heavy iron chain accents", "liquid-nitrogen cooling pipes", 
  "glowing light-emitting thread", "asymmetrical metallic shoulder armor", 
  "magnetic quick-release buckles", "reinforced knee protectors", 
  "gold-trimmed scroll cases"
];

const WARDROBE_SPECS = [
  "trimmed with matte charcoal linings", "highlighted by electric neon cyan veins",
  "displaying worn brass filigree", "accented in safety orange trims",
  "covered in fine volcanic ash", "shimmering with star-like glitter",
  "detailed with white runic inscriptions", "stained with grease and copper dust",
  "glowing with faint crimson thermal radiation", "patterned with digital camouflage",
  "finished in deep royal indigo dye", "coated with reflective iridescent dust", 
  "weathered by rusted desert sand", "accented in vibrant neon lime details", 
  "polished to a mirror-like silver gloss", "etched with runic gold leaf filigree", 
  "patterned with abstract geometric tech-lines", "stained with motor oil and chrome dust"
];

const PROP_BASE = [
  "ancient tome", "holographic mask", "mechanical gauntlet", "floating drones", 
  "enchanted lantern", "energy spear", "oversized headphones", "relic pendant", 
  "folding fan", "magical staff", "heavy wrench", "pocket watch", "runic compass",
  "plasma saber", "seismic hammer", "holo-projector scroll", "gravity cube",
  "telescopic spyglass", "incense burner", "tuning fork", "orbital beacon",
  "fluid canister", "crystalline matrix", "magnetic boomerang", "keyblade shard",
  "giant mechanical buster-sword (longer than human height)",
  "colossal steam-powered anchor (thrice human weight)",
  "towering runic broadsword (massive 8-foot blade)",
  "massive energy-shield spire (standing 10 feet tall)",
  "monolithic stone pillar (ancient, carved with runes)",
  "towering clockwork planetary mechanism",
  "colossal biomechanical gatling cannon",
  "oversized energy war-hammer (heavy double-head)",
  "massive gravity-manipulation obelisk",
  "giant multi-barrel plasma cannon (shoulder-mounted)",
  "towering enchanted relic gate",
  "colossal mobile siege shield",
  "massive dual-blade war-scythe",
  "giant mechanical claw arm (external crane rigging)",
  "colossal lightning-rod staff",
  "massive dragon-bone spear (12 feet long)",
  "oversized technical blueprint scroll (unrolled layout)",
  "giant hovering cybernetic focal lens",
  "colossal sound-wave acoustic cannon",
  "massive chrono-stasis portal ring",
  "giant biological dragon-slaying sword"
];

const PROP_SPECS = [
  "glowing with raw celestial power", "etched with copper gear tracks", 
  "projecting green grid structures", "emitting soft electromagnetic hums", 
  "cracked and held by gold seams", "adorned with feathers and beads",
  "spinning silently in mid-air", "overflowing with vapor gas",
  "fused with growing crystalline shards", "bound in heavy iron chains",
  "radiating intense heat waves", "pulsing in sync with heartbeats",
  "projecting miniature solar systems", "floating on small repulsion pads",
  "covered in runic inscriptions"
];

const HAIR_CUTS = [
  "dreadlocks", "spiky hair", "flowing waves", "shaved undercut", "high ponytail", 
  "braided cornrows", "neat bob", "pixie cut", "voluminous afro", "asymmetrical bangs", 
  "braided twin-tails", "slicked-back undercut", "curly shoulder-length bob", "buzz cut", 
  "curtain bangs", "dreadlock high-top bun", "braided crown", "windswept curls",
  "messy bedhead", "long straight locks", "side-braid weave", "mohawk spike",
  "dreadlock side-sweep", "dreadlock ponytail", "short crop"
];

const HAIR_COLORS = [
  "neon cyan", "crimson red", "electric violet", "platinum blonde", "obsidian black", 
  "ash grey", "pastel pink", "emerald green", "golden amber", "royal blue", 
  "copper bronze", "snow white", "sunset orange", "mint green", "lavender purple"
];

const HAIR_ACCENTS = [
  "with frosted silver tips", "featuring dark shadow roots", "with glowing luminescent roots", 
  "shimmering with rainbow under-lights", "with neon streaks", "tied with a red silk ribbon", 
  "decorated with brass hair clips", "beaded with wooden rings", "accented with metallic gold beads",
  "with gradient fade tips", "with subtle highlights"
];

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateLibrary() {
  const targetDir = path.resolve("./data");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log("Generating modular asset libraries (5,000 entries each)...");

  // 1. Roles (5,000)
  const roles = new Set<string>();
  while (roles.size < 5000) {
    const elem = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    const cls = BASE_CLASSES[Math.floor(Math.random() * BASE_CLASSES.length)];
    roles.add(`${elem} ${cls}`);
  }

  // 2. Aliases / Titles (5,000)
  const aliases = new Set<string>();
  while (aliases.size < 5000) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    const roll = Math.random();
    if (roll < 0.4) {
      aliases.add(`The ${adj} ${noun}`);
    } else if (roll < 0.8) {
      aliases.add(`${noun} of the ${loc}`);
    } else {
      aliases.add(`${adj} ${noun} of the ${loc}`);
    }
  }

  // 3. Personality Traits (5,000 combos)
  const personalities = new Set<string>();
  while (personalities.size < 5000) {
    const pool = shuffleArray(BASE_TRAITS);
    personalities.add(`${pool[0]}, ${pool[1]}, and ${pool[2]}`);
  }

  // 4. Core Themes (5,000)
  const themes = new Set<string>();
  while (themes.size < 5000) {
    const themeA = BASE_THEMES[Math.floor(Math.random() * BASE_THEMES.length)];
    const themeB = BASE_THEMES[Math.floor(Math.random() * BASE_THEMES.length)];
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    if (themeA === themeB) continue;
    
    const roll = Math.random();
    if (roll < 0.25) {
      themes.add(`${themeA} and ${themeB}`);
    } else if (roll < 0.5) {
      themes.add(`The Search for ${themeA} in the ${loc}`);
    } else if (roll < 0.75) {
      themes.add(`How ${themeA} yields to ${themeB}`);
    } else {
      themes.add(`The Eternal Struggle Between ${themeA} and ${themeB}`);
    }
  }

  // 5. Speech Accents (5,000)
  const accents = new Set<string>();
  while (accents.size < 5000) {
    const base = ACCENT_STYLES[Math.floor(Math.random() * ACCENT_STYLES.length)];
    const modifier = ACCENT_MODIFIERS[Math.floor(Math.random() * ACCENT_MODIFIERS.length)];
    // Add index to guarantee uniqueness
    accents.add(`${base}, speaking ${modifier} (Dialect Dialect #${accents.size + 1})`);
  }

  // 6. Wardrobe Details (5,000)
  const wardrobes = new Set<string>();
  while (wardrobes.size < 5000) {
    const outer = WARDROBE_OUTER[Math.floor(Math.random() * WARDROBE_OUTER.length)];
    const detail = WARDROBE_DETAILS[Math.floor(Math.random() * WARDROBE_DETAILS.length)];
    const spec = WARDROBE_SPECS[Math.floor(Math.random() * WARDROBE_SPECS.length)];
    wardrobes.add(`${outer} equipped with ${detail}, ${spec} (Suit Asset: #${wardrobes.size + 1000})`);
  }

  // 7. Key Signature Props (5,000)
  const props = new Set<string>();
  while (props.size < 5000) {
    const base = PROP_BASE[Math.floor(Math.random() * PROP_BASE.length)];
    const spec = PROP_SPECS[Math.floor(Math.random() * PROP_SPECS.length)];
    props.add(`${base} ${spec} (Device Signature: #${props.size + 1000})`);
  }

  // 8. Hairstyles (1,000)
  const hairstyles = new Set<string>();
  while (hairstyles.size < 1000) {
    const cut = HAIR_CUTS[Math.floor(Math.random() * HAIR_CUTS.length)];
    const color = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const accent = HAIR_ACCENTS[Math.floor(Math.random() * HAIR_ACCENTS.length)];
    hairstyles.add(`${color} ${cut} ${accent}`);
  }

  const library = {
    roles: Array.from(roles),
    aliases: Array.from(aliases),
    personalities: Array.from(personalities),
    themes: Array.from(themes),
    accents: Array.from(accents),
    wardrobes: Array.from(wardrobes),
    props: Array.from(props),
    hairstyles: Array.from(hairstyles)
  };

  const libraryPath = path.join(targetDir, "assets-library.json");
  fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2), "utf-8");
  console.log(`✓ Modular asset library containing 36,000 total assets compiled successfully at: ${libraryPath}`);
}

generateLibrary();
