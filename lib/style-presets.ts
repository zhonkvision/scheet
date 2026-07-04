export interface StyleDetails {
  id: string;
  name: string;
  description: string;
}

export const PRODUCTION_STYLES: StyleDetails[] = [
  {
    id: "nostalgic-cel",
    name: "01. Nostalgic Hand-Painted Cel",
    description: `- Rendering: Hand-painted gouache look, simulated acetate cel layering, vintage film grain, chromatic aberration.
- Anatomy: Classic expressive anime eyes, organic limb flow, soft natural silhouettes.
- Color & Light: Warm retro pastel palette, soft ambient shadows, warm tungsten key illumination.
- Lines & Shading: Clean organic ink lines, simple double-layer flat cel shading.
- Materials: Visible paper texture, matte surfaces, hand-painted background layers.
- Motion & FX: Fluid action poses, hand-drawn speed lines, atmospheric light dust.`
  },
  {
    id: "cinematic-ethereal",
    name: "02. Cinematic Ethereal Realism",
    description: `- Rendering: High-contrast atmospheric rendering, realistic depth of field, anamorphic lens flares.
- Anatomy: Realistic proportions, soft detailed facial features, elegant dynamic silhouettes.
- Color & Light: High-saturation sky gradients, dramatic volumetric key lights, glowing rim lighting.
- Lines & Shading: Invisible clean outlines, soft multi-layer ambient occlusion shading.
- Materials: Fine fabric weave, glass refractions, realistic skin sub-surface scattering.
- Motion & FX: Cinematic camera angles, volumetric fog, magical light particle fields.`
  },
  {
    id: "gothic-ink",
    name: "03. Bold Gothic Ink Wash",
    description: `- Rendering: High-contrast monochrome ink wash, dynamic cross-hatching, splatter textures.
- Anatomy: Elongated skeletal limbs, hollow eyes, sharp jagged silhouettes.
- Color & Light: Stark black-and-white palette, single-source hard shadows, high contrast.
- Lines & Shading: Sketchy brush strokes, rough ink contours, no soft gradients.
- Materials: Heavy paper fiber texture, charcoal finishes, weathered parchment backdrops.
- Motion & FX: Stark freeze-frames, high-impact silhouette poses, stylized ink sprays.`
  },
  {
    id: "pastel-gouache",
    name: "04. Whimsical Pastel Gouache",
    description: `- Rendering: Watercolor brush outlines, soft canvas paper simulation, flat organic textures.
- Anatomy: Soft rounded facial features, chubby expressive shapes, gentle non-threatening silhouettes.
- Color & Light: Low-contrast warm pastel palette, soft diffuse daylight, minimal shadows.
- Lines & Shading: Sketchy pencil outlines, gentle watercolor color bleeding.
- Materials: Matte watercolor paper, organic grain, visible dry-brush strokes.
- Motion & FX: Gentle whimsical movement, floaty leaves, soft dust particles.`
  },
  {
    id: "neon-cyberglow",
    name: "05. Neon Cyber-Glow Cel",
    description: `- Rendering: Holographic lighting vectors, CRT scanline overlay, heavy shadow dropouts.
- Anatomy: Cybernetically enhanced silhouettes, angular features, sharp futuristic lines.
- Color & Light: Electric magenta, cyan, and deep violet; emissive neon highlights; dramatic dark contrast.
- Lines & Shading: Clean vector outlines, dual-tone hard cel shading.
- Materials: Glossy carbon fiber, metallic chrome reflections, emissive neon tubing.
- Motion & FX: Rapid glitch transitions, neon trails, digital grid overlay.`
  },
  {
    id: "pop-vector",
    name: "06. Pop-Art Graphic Vector",
    description: `- Rendering: Clean vector art, flat graphic styling, screen-tone dot printing textures.
- Anatomy: Exaggerated geometric proportions, bold graphic features, blocky silhouettes.
- Color & Light: Primary solid colors, highly saturated hues, zero light gradients.
- Lines & Shading: Extremely thick clean black outlines, flat dot-pattern shading.
- Materials: Smooth plastic-like surfaces, solid vinyl finishes, abstract shapes.
- Motion & FX: Dynamic cartoon squash-and-stretch, stylized impact symbols.`
  },
  {
    id: "steampunk-brass",
    name: "07. Steampunk Industrial Brass",
    description: `- Rendering: Drafted schematic illustration look, heavy sepia tone wash, soot weathering.
- Anatomy: Rigid posture, heavy clockwork prosthetic silhouettes, sharp metallic limbs.
- Color & Light: Copper, brass, and dark leather hues; warm copper lamp light; heavy shadows.
- Lines & Shading: Precise technical ink drafting lines, soft cross-hatching shadows.
- Materials: Polished brass refractions, aged leather grains, grease stains.
- Motion & FX: Steampunk gears rotating, volumetric steam clouds, embers rising.`
  },
  {
    id: "art-nouveau",
    name: "08. Ethereal Art Nouveau",
    description: `- Rendering: Decorative mosaic framing, gold leaf texturing, flat poster-art styling.
- Anatomy: Elongated fluid figures, swirling hair strands, elegant organic poses.
- Color & Light: Muted jewel tones, soft golden hour lighting, flat color fields.
- Lines & Shading: Highly decorative whipping clean outlines, minimal gradient shading.
- Materials: Metallic gold leaf highlights, satin fabrics, organic flower overlays.
- Motion & FX: Flowing wind patterns, swirling cosmic dust, flat graphic framing.`
  },
  {
    id: "clay-stopmotion",
    name: "09. Clay-Shaped Stop-Motion",
    description: `- Rendering: Physical clay model render, stop-motion frame jitter, shallow depth of field.
- Anatomy: Hand-sculpted proportions, thumbprint surface detail, chunky silhouettes.
- Color & Light: Earthy clay colors, soft studio key lighting, warm soft shadows.
- Lines & Shading: No outlines, soft real-world shadowing, ambient occlusion.
- Materials: Clay texture, fingerprint details, rough fabric weaves, matte finishes.
- Motion & FX: Stop-motion animation feel (12fps), physical clay morphing.`
  },
  {
    id: "chiaroscuro-noir",
    name: "10. Chiaroscuro Comic Noir",
    description: `- Rendering: High-contrast comic book illustration, ink dropouts, heavy shadow casting.
- Anatomy: Tall hard-edged silhouettes, sharp detective jawlines, low-angle presentation.
- Color & Light: Monochrome greyscale, single-source spotlights, deep casting shadows.
- Lines & Shading: Sharp clean ink lines, absolute solid black shading blocks.
- Materials: Distressed wool fabrics, wet asphalt refractions, high-contrast paper grain.
- Motion & FX: Dramatic shadows stretching, stylized smoke curls, heavy rain sheets.`
  },
  {
    id: "cosmic-stardust",
    name: "11. Ethereal Cosmic Stardust",
    description: `- Rendering: Translucent gradient maps, glowing astral silhouettes, nebula overlays.
- Anatomy: Faceless starry outlines, flowing energy hair, glowing star points.
- Color & Light: Iridescent color spectrum, cosmic volumetric glows, deep violet cosmic skies.
- Lines & Shading: Glowing energy outlines, soft radiant aura shading.
- Materials: Liquid stardust shimmer, crystalline refractions, translucent panels.
- Motion & FX: Floating low-gravity poses, solar flares, orbiting comet dust.`
  },
  {
    id: "lowpoly-iso",
    name: "12. Low-Poly Isometric Concept",
    description: `- Rendering: Stylized low-polygon modeling, sharp facet angles, flat geometric shading.
- Anatomy: Sharp blocky features, faceted polygonal limbs, angular faces.
- Color & Light: Flat ambient colors, directional sun light casting sharp flat shadows.
- Lines & Shading: Clean un-outlined polygon edges, flat single-color polygons.
- Materials: Matte papercraft finishes, clean geometric cardboards, low-res textures.
- Motion & FX: Rigid mechanical rotation, blocky impact frames, geometric particles.`
  },
  {
    id: "action-hatching",
    name: "13. Action Ink Hatching Comic",
    description: `- Rendering: Hand-inked dynamic comic panel style, action layout framing, screen-tone wash.
- Anatomy: Exaggerated athletic build, high-tension muscle definitions, aggressive silhouettes.
- Color & Light: High-saturation dramatic accents, high-contrast backlight source.
- Lines & Shading: Tapered dynamic brush strokes, heavy cross-hatching shadows.
- Materials: Rough newsprint paper texture, high-absorption inks, raw graphite markings.
- Motion & FX: Exaggerated speed lines, combat impact frames, stylized action sweeps.`
  }
];
