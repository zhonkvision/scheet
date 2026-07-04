import { NextRequest, NextResponse } from "next/server";
import { extractKeywordsFromBio } from "@/lib/keyword-extractor";
import { fetchAniListCharacter } from "@/lib/anilist";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { canonical_name, raw_biography, use_anilist } = body;

    if (!canonical_name) {
      return NextResponse.json(
        { error: "canonical_name is required" },
        { status: 400 }
      );
    }

    // Step 1: Check anime-traits lookup for known popular characters
    let traitsOverride: Record<string, string> | null = null;
    try {
      const { lookupAnimeTraits } = await import("@/lib/anime-traits");
      const traits = lookupAnimeTraits(canonical_name);
      if (traits) {
        traitsOverride = {
          alias: traits.alias,
          role: traits.role,
          age: traits.age,
          gender: traits.gender,
          hairstyle: `${traits.hairColor} ${traits.hairStyle} hair`,
          personality: traits.personality,
          coreTheme: traits.coreTheme,
          accent: traits.accent,
          wardrobeDetails: traits.wardrobeDetails,
          keyProp: traits.keyProp,
        };
      }
    } catch {
      // anime-traits module not available, continue without it
    }

    // Step 2: Run local keyword extraction from biography text
    const parsed = extractKeywordsFromBio(
      canonical_name,
      raw_biography || ""
    );

    // Step 3: If SCHEETLINK!˚ is enabled, enrich with AniList structured data
    let anilistData: Record<string, string> | null = null;
    if (use_anilist) {
      try {
        const aniChar = await fetchAniListCharacter(canonical_name);
        if (aniChar) {
          anilistData = {};
          // Override gender if AniList provides it (structured field, very reliable)
          if (aniChar.gender) {
            anilistData.gender = aniChar.gender;
          }
          // Override age if AniList provides it (structured field)
          if (aniChar.age) {
            const ageNum = parseInt(aniChar.age, 10);
            if (!isNaN(ageNum)) {
              if (ageNum < 13) anilistData.age = `Child (${ageNum})`;
              else if (ageNum < 18) anilistData.age = `Teenager (${ageNum})`;
              else if (ageNum < 30) anilistData.age = `Young Adult (${ageNum})`;
              else if (ageNum < 50) anilistData.age = `Prime Adult (${ageNum})`;
              else anilistData.age = `Veteran (${ageNum})`;
            } else {
              anilistData.age = aniChar.age; // Use raw value if not a number
            }
          }

          // If we don't have traits override AND AniList provides a richer description,
          // re-parse using the AniList description for better extraction
          if (!traitsOverride && aniChar.description && aniChar.description.length > (raw_biography || "").length) {
            const aniParsed = extractKeywordsFromBio(canonical_name, aniChar.description);
            // Only use AniList-parsed values if they are more specific than defaults
            if (aniParsed.wardrobeDetails && aniParsed.wardrobeDetails !== "customized tactical attire") {
              anilistData.wardrobeDetails = aniParsed.wardrobeDetails;
            }
            if (aniParsed.keyProp && aniParsed.keyProp !== "Signature artifact — unique to character") {
              anilistData.keyProp = aniParsed.keyProp;
            }
            if (aniParsed.hairstyle && !aniParsed.hairstyle.startsWith("dark natural")) {
              anilistData.hairstyle = aniParsed.hairstyle;
            }
            if (aniParsed.role && aniParsed.role !== "Vanguard Warrior") {
              anilistData.role = aniParsed.role;
            }
            if (aniParsed.personality && !aniParsed.personality.startsWith("Brave, Determined")) {
              anilistData.personality = aniParsed.personality;
            }
            if (aniParsed.accent && aniParsed.accent !== "Formal, polite, articulate") {
              anilistData.accent = aniParsed.accent;
            }
            if (aniParsed.coreTheme && aniParsed.coreTheme !== "Classic Shounen Fantasy") {
              anilistData.coreTheme = aniParsed.coreTheme;
            }
            if (aniParsed.alias && aniParsed.alias !== "Wanderer of the Realm") {
              anilistData.alias = aniParsed.alias;
            }
          }
        }
      } catch (err) {
        console.warn("[parse] AniList enrichment failed:", err);
        // Continue without AniList data
      }
    }

    // Step 4: Merge results with priority: traitsOverride > anilistData > parsed
    const merged = { ...parsed };

    // Apply AniList enrichment (overrides generic parser defaults)
    if (anilistData) {
      for (const [key, value] of Object.entries(anilistData)) {
        if (value) {
          (merged as Record<string, string>)[key] = value;
        }
      }
    }

    // Apply traits override (highest priority — curated data)
    if (traitsOverride) {
      for (const [key, value] of Object.entries(traitsOverride)) {
        if (value) {
          (merged as Record<string, string>)[key] = value;
        }
      }
    }

    return NextResponse.json({
      parsed: merged,
      source: traitsOverride ? "anime-traits" : anilistData ? "anilist-enriched" : "local-parser",
    });
  } catch (err) {
    console.error("Parse route error:", err);
    return NextResponse.json(
      { error: "Failed to extract character data" },
      { status: 500 }
    );
  }
}
