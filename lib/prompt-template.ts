// ─── Prompt Template Engine ────────────────────────────────────
// Assembles the full character reference sheet prompt from parsed tokens
// and a selected style. The output is the complete prompt string ready
// for copy-paste into any image generation tool.

import type { ParsedTokens } from "./gemini";
import { PRODUCTION_STYLES } from "./style-presets";

/**
 * Compile the full character reference sheet prompt.
 */
export function compilePrompt(style: string, tokens: ParsedTokens, productionMode?: boolean, aspectRatio: string = "4:3"): string {
  const activePreset = PRODUCTION_STYLES.find((s) => s.name === style);
  const styleSpecs = activePreset ? activePreset.description : `- Style: ${style}`;

  // Check if layout is vertical or square
  const layoutType = aspectRatio === "2:3" ? "vertical poster" : aspectRatio === "1:1" ? "square" : "horizontal";

  if (productionMode) {
    return `[STYLE]: Photorealistic Cinematic 3D Character Render, AAA game asset, Unreal Engine 5.4, Ray-Traced, PBR Materials, Visual Bible
[SUBJECT_DESCRIPTION]: [NAME: ${tokens.name}, GENDER: ${tokens.gender}, ROLE: ${tokens.role}, AGE: ${tokens.age}, HAIRSTYLE: ${tokens.hairstyle}, PERSONALITY: ${tokens.personality}, WARDROBE: ${tokens.wardrobeDetails}]

Visual Fidelity Specs:
- Rendering: High-end cinematic character render, physical-based rendering (PBR) materials, realistic fabric weave, distressed leather grain, matte and brushed metals, sub-surface scattering (SSS) for skin, natural hair grooms.
- Lighting: High-detail HDR lighting, global illumination, ray-traced shadows and reflections, subtle ambient occlusion, dramatic volumetric key lights, rim lighting to accentuate silhouette.
- Camera: Shot on 85mm anamorphic lens, f/1.8 aperture for shallow depth of field, sharp focus on eyes, subtle cinematic color grading, realistic micro-particles and dust motes in light beams.
- Composition: Hero shot, dynamic posture displaying signature prop [${tokens.keyProp}], volumetric fog in background, realistic environment interaction with subtle wetness or dust layers.
- Style Override: Apply [STYLE] only to the character and visual elements. Ensure AAA production fidelity suitable for high-end cinematic trailers and character concept sheets.`;
  }

  return `[STYLE]: ${style}
Visual Style Specs:
${styleSpecs}

[SUBJECT_DESCRIPTION]: [NAME: ${tokens.name}, GENDER: ${tokens.gender}, ROLE: ${tokens.role}, AGE: ${tokens.age}, HAIRSTYLE: ${tokens.hairstyle}, PERSONALITY: ${tokens.personality}, WARDROBE: ${tokens.wardrobeDetails}]

Create the board in a ${aspectRatio} ${layoutType} layout. The board layout, background, typography and spacing must be clean, neutral, minimal and technical, on a pure white or clean off-white background. Use clear section titles, readable English labels, balanced spacing, no clutter, no watermark, no logo. Apply [STYLE] only to the character and visual elements, not to the board layout or UI. All text must be clearly readable at normal viewing size. Avoid tiny or dense text.

Infer all missing details from the subject description, including name, alias if suitable, gender, role, age, personality, core theme, accent, wardrobe details, accessories, key prop if clearly relevant, visual notes and a fitting color palette.

Use this layout:
top row = left: title + horizontal info block, right: COLOR PALETTE
center = large MAIN IDENTITY + SCALE SHEET as the biggest section
right = EXPRESSION PROGRESSION + HEAD DETAIL SHEET + NEUTRAL BASELINE + POSTURE VARIATION + CLOSE-UP POSE
bottom = WARDROBE / ACCESSORIES DETAILS + PROP + HAND GESTURES

Include:

Title: CHARACTER REFERENCE SCHEET˚

1. TOP INFO BLOCK
Name, Alias, Gender, Role, Age, Personality, Core Theme, Speech Accent

2. COLOR PALETTE
Place this in the top-right header area.
Show 6 to 8 minimal clean color swatches that match the subject's style, wardrobe, world and mood. Don't add labels.

3. MAIN IDENTITY + SCALE SHEET
This must be the largest and most prominent section.
Show the subject only, with no prop, no bag, no handheld object, no extra item interaction.
Show:
Front, 3/4 View, Side, Back

Place the character views over subtle measurement guide lines, like a clean model sheet scale background with height marks.

Also include a small SILHOUETTE GUIDE inside this same section:
2 small clean silhouette thumbnails, Neutral Stance and Profile Silhouette.
Keep the silhouettes small and secondary, placed in a corner of the MAIN IDENTITY + SCALE SHEET.

The subject should appear in a clean neutral presentation focused only on identity, body shape, outfit, silhouette and proportions.
Add a few small notes for silhouette, posture, special traits, visual identity.

4. EXPRESSION PROGRESSION
Show exactly 8 panels of the same subject:
Neutral, Curious, Worried, Surprised, Afraid, Sad, Determined, Relieved

MICRO EXPRESSIONS
Show exactly 5 panels of the same subject:
subtle eye tension, slight smirk, lip tension, micro fear, controlled breath

These panels should function as both an expression sheet and a light emotional progression.

5. HEAD DETAIL SHEET
Show several close-up head references of the same subject from different angles:
3/4 Headshot, Side Headshot, Top Angle, Low Angle, Diagonal Angle

Keep facial structure, hairstyle, eyes, proportions and identity fully consistent.

6. NEUTRAL BASELINE
1 panel: fully relaxed, no emotion

7. POSTURE VARIATION
2–3 panels: relaxed, tense, confident

8. CLOSE-UP POSE
Show exactly 1 cinematic close-up pose of the same subject from chest-up or shoulder-up.
Use a natural expressive pose that best fits the subject's personality and story tone.
This close-up should clearly show facial identity, hairstyle, expression, upper wardrobe detail and emotional presence.

9. WARDROBE / ACCESSORIES DETAILS
Show exactly 4 close-up callouts for important styling details such as hairstyle, outerwear, footwear, accessories, fabric or material detail.

10. PROP
Only include this section if a prop is clearly important to the subject.
Show exactly 1 single clean isolated image of the prop only.
Add a small info block:
Object Name, Type, Traits

11. HAND GESTURES
relaxed hand, tense fingers, pointing, gripping, subtle gesture near face

Keep the subject fully consistent across all panels. The MAIN IDENTITY + SCALE SHEET must visually dominate the board. The final image should look like a premium production visual bible / character continuity sheet matching the selected [STYLE].`;
}
