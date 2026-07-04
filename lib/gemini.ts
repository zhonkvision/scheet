// ─── Gemini API Client ─────────────────────────────────────────
// Calls Gemini 2.5 Flash to parse raw character bios into structured tokens.
// Returns null if no API key is configured (demo mode).

export interface ParsedTokens {
  name: string;
  alias: string;
  role: string;
  age: string;
  gender: string;
  hairstyle: string;
  personality: string;
  coreTheme: string;
  accent: string;
  wardrobeDetails: string;
  keyProp: string;
}

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function buildParsingPrompt(name: string, bio: string): string {
  return `You are a technical data extraction agent. Convert this raw character data profile into structured prompt tokens. If values are missing from the profile background, logically infer clean, hyper-fitting visual attributes based on lore. If the source profile contains multiple characters or a fusion request, merge their traits, outfits, weapons, and lore into a single unified hybrid profile. Return the output as raw text mapping strictly to the key structure.

SOURCE PROFILE:
Name: ${name}
Bio: ${bio}

OUTPUT KEYS:
[PARSED_NAME]: (Full string)
[PARSED_ALIAS]: (Short descriptor)
[PARSED_ROLE]: (Class/occupation)
[PARSED_AGE]: (Approximate age range)
[PARSED_GENDER]: (Male, Female, Non-binary, or Androgynous)
[PARSED_HAIRSTYLE]: (Hair style, color, cut, or ornaments)
[PARSED_PERSONALITY]: (Three comma-separated traits)
[PARSED_CORE_THEME]: (Visual sub-genre genre aesthetic)
[PARSED_ACCENT]: (Inferred dialect)
[PARSED_WARDROBE_DETAILS]: (Condensed apparel listing)
[PARSED_KEY_PROP]: (Primary signature item - attribute1, attribute2)`;
}

function extractToken(text: string, key: string): string {
  const pattern = new RegExp(`\\[${key}\\]:\\s*(.+?)(?:\\n|$)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

/**
 * Parse a character bio into structured tokens via Gemini.
 * Returns null if no API key is set or on error.
 */
export async function parseCharacterBio(
  name: string,
  bio: string
): Promise<ParsedTokens | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildParsingPrompt(name, bio) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      console.error(`Gemini API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) return null;

    return {
      name: extractToken(text, "PARSED_NAME") || name,
      alias: extractToken(text, "PARSED_ALIAS"),
      role: extractToken(text, "PARSED_ROLE"),
      age: extractToken(text, "PARSED_AGE"),
      gender: extractToken(text, "PARSED_GENDER"),
      hairstyle: extractToken(text, "PARSED_HAIRSTYLE"),
      personality: extractToken(text, "PARSED_PERSONALITY"),
      coreTheme: extractToken(text, "PARSED_CORE_THEME"),
      accent: extractToken(text, "PARSED_ACCENT"),
      wardrobeDetails: extractToken(text, "PARSED_WARDROBE_DETAILS"),
      keyProp: extractToken(text, "PARSED_KEY_PROP"),
    };
  } catch (err) {
    console.error("Gemini parsing failed:", err);
    return null;
  }
}
