import fs from "fs";
import path from "path";

// ─── Vocabulary for Combinatorial Generation ────────────────
const NAME_PREFIX = [
  "Aero", "Aether", "Astra", "Blitz", "Brio", "Cinder", "Cobalt", "Crimson", "Cyn", 
  "Dex", "Drake", "Echo", "Edge", "Ember", "Flint", "Flux", "Frost", "Glimmer", "Haze", 
  "Ion", "Iris", "Jade", "Jax", "Jinx", "Jolt", "Kael", "Klay", "Luna", "Lux", "Lyra", 
  "Mist", "Nebula", "Nix", "Nova", "Obsidian", "Onyx", "Orion", "Pulse", "Pyre", "Quirk", 
  "Rune", "Sol", "Spark", "Sterling", "Talon", "Thorne", "Vael", "Vector", "Warp", "Zenith",
  "Zephyr", "Alpha", "Omega", "Giga", "Tera", "Chron", "Pyro", "Cryo", "Bio", "Cyborg",
  "Giga", "Vecto", "Niko", "Ryu", "Ken", "Jin", "Sora", "Riku", "Kairi", "Yuki"
];

const NAME_SUFFIX = [
  "weaver", "forge", "shard", "glade", "shield", "wing", "strike", "stride", "rider", 
  "watcher", "caller", "shaper", "smith", "keeper", "breaker", "seeker", "runner",
  "bringer", "tread", "gaze", "singer", "dancer", "binder", "wielder", "slayer",
  "walker", "drifter", "hunter", "stalker", "crawler", "flyer", "glider", "sailor"
];

const NAME_TITLE = [
  "the Ironclad", "the Stardweller", "the Voidwalker", "the Sunbringer", "the Chrono-Keeper",
  "the Stormweaver", "the Frost-Bite", "the Gear-Shaper", "the Rune-Carver", "the Bone-Reader",
  "the Rust-Eater", "the Spark-Igniter", "the Shadow-Weaver", "the Crystalline", "the Rust-Walker"
];

const ARCHETYPES = [
  "Cosmic Warrior", "Cybernetic Infiltrator", "Bio-engineered Beast", "Steampunk Aviator",
  "Gothic Necromancer", "High Fantasy Paladin", "Elemental Mage", "Retro-cartoon Mascot",
  "Sentient Hologram", "Cursed Swordsman", "Underworld Bounty Hunter", "Mecha Pilot",
  "Abyssal Diver", "Drift Racer", "Dream Weaver"
];

const SPECIES = [
  "Human-Cyborg hybrid", "Reptilian humanoid", "Stardust elemental", "Horned demon-kin",
  "Avian shifter", "Slime entity", "Crystalline golem", "Bio-engineered beast",
  "Deep-sea siren", "Ghostly apparition", "Android prototype", "Plant-based dryad"
];

const CLOTHING = [
  "a weathered trenchcoat over leather harness", "traditional flowing robes with silver trims",
  "heavy armor plate decorated with neon lines", "a fitted school uniform blazer with custom badges",
  "a bulky space suit fitted with thrusters", "fluid silk robes showing ancient patterns",
  "distressed cargo pants, combat boots, and flight jacket", "a sleek stealth bodysuit made of matte fiber",
  "an oversized patchwork hoodie and high-top sneakers", "a classic double-breasted formal suit"
];

const COLORS = [
  "cobalt blue and neon cyan", "crimson red and charcoal black", "emerald green and brass gold",
  "neon violet and deep black", "pearl white and amber gold", "matte grey and safety orange",
  "plum purple and toxic green", "sand yellow and copper bronze", "silver and electric blue"
];

const ACCESSORIES = [
  "a glowing holographic visor covering one eye", "heavy brass goggles resting on their forehead",
  "a massive mechanical gauntlet covered in vents", "a spiked collar and fingerless gloves",
  "floating runic glyphs orbiting their wrists", "a ticking brass pocket watch hanging from a chain",
  "a cracked white porcelain mask with red accents", "a glowing reactor core embedded in their chest",
  "a holographic projector badge on their lapel", "feathered wings made of pure blue light"
];

const WEAPONS = [
  "an energy glaive that crackles with electricity", "a massive industrial hammer with booster rockets",
  "dual customized blaster pistols", "a legendary runic saber that glows softly",
  "a steam-powered long rifle with copper dials", "a floating metallic grimoire bound in iron",
  "a pair of retractable bio-organic claws", "a whip made of plasma energy",
  "a heavy shield with an embedded forcefield emitter", "a set of throwing daggers that hover in mid-air"
];

const PERSONALITY = [
  "stoic, analytical, and highly reserved", "hyper-energetic, cheerful, and loud",
  "cynical, witty, but fiercely loyal", "silent, disciplined, and brave",
  "cheerful, clumsy, yet extremely optimistic", "rebellious, fierce, and sharp",
  "quiet, mysterious, and wise", "charismatic, bold, and scheming"
];

const ABILITIES = [
  "manipulate local gravity fields to float and throw objects",
  "teleport short distances through shadows",
  "conjure barriers made of solid light",
  "control electricity, channelled through their mechanical parts",
  "heal biological tissue using glowing green energy",
  "interface directly with any computer terminal or network",
  "summon spectral avian creatures to scout and attack",
  "manipulate steam and pressure, overloading mechanical devices",
  "phase through solid walls for stealth operations",
  "channel cosmic solar flares into concentrated beams"
];

// Generate a single unique character
function generateCharacter(index: number): {
  id: number;
  name: string;
  about: string;
} {
  const selectRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  // Create Name
  const prefix = selectRandom(NAME_PREFIX);
  const suffix = selectRandom(NAME_SUFFIX);
  const useTitle = Math.random() > 0.6;
  const name = useTitle 
    ? `${prefix}${suffix} ${selectRandom(NAME_TITLE)}`
    : `${prefix}${suffix}`;

  const archetype = selectRandom(ARCHETYPES);
  const species = selectRandom(SPECIES);
  const clothes = selectRandom(CLOTHING);
  const color = selectRandom(COLORS);
  const accessory = selectRandom(ACCESSORIES);
  const weapon = selectRandom(WEAPONS);
  const personality = selectRandom(PERSONALITY);
  const ability = selectRandom(ABILITIES);

  const about = `Role: ${archetype}
Species: ${species}
Personality: ${personality}
Aesthetic Colors: ${color}

Appearance & Gear:
This subject is a ${species.toLowerCase()} presenting as a ${archetype.toLowerCase()}. They wear ${clothes} in a color palette of ${color}. They are equipped with ${accessory} and carry ${weapon} as their signature prop. 

Abilities & Aesthetic:
They possess the ability to ${ability}. Physically, they project a highly stylized visual presence that captures a clean, silhouette-driven design. This design stands out due to its balanced spacing and unique accessories, highlighting their overall silhouette and abilities.`;

  return {
    id: index + 100, // offset past default mal_ids
    name,
    about
  };
}

function generateDataset() {
  const targetDir = path.resolve("./data");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const csvPath = path.join(targetDir, "original_characters_5000.csv");
  
  // CSV Header
  let csvContent = "mal_id,name,name_kanji,nicknames,favorites,about,image_url\n";

  console.log("Generating 5,000 fictional characters...");
  
  const uniqueNames = new Set<string>();

  for (let i = 0; i < 5000; i++) {
    let char = generateCharacter(i);
    // Ensure unique names
    while (uniqueNames.has(char.name)) {
      char = generateCharacter(i);
    }
    uniqueNames.add(char.name);

    // Escape fields for CSV formatting
    const escapedName = `"${char.name.replace(/"/g, '""')}"`;
    const escapedAbout = `"${char.about.replace(/"/g, '""')}"`;
    const imagePlaceholder = `https://picsum.photos/seed/${char.name.replace(/\s+/g, '')}/225/320`;
    
    // mal_id, name, name_kanji, nicknames, favorites, about, image_url
    csvContent += `${char.id},${escapedName},"",nil,${Math.floor(Math.random() * 5000)},${escapedAbout},${imagePlaceholder}\n`;
  }

  fs.writeFileSync(csvPath, csvContent, "utf-8");
  console.log(`✓ CSV dataset containing 5,000 characters generated successfully at: ${csvPath}`);
}

generateDataset();
