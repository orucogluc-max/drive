# Design System

DRIVE's design philosophy is rooted in minimalism, elegance, and premium aesthetics. We treat our app not as a tool, but as a digital magazine.

## Core Rules
1. **Photo First:** The user's media is the hero. UI elements (maps, text, stats) must overlay gracefully without overpowering the imagery.
2. **Minimal Text:** Omit unnecessary labels. A number and a beautiful icon are often enough.
3. **No Generic Colors:** Avoid harsh primary colors. Use curated, harmonious color palettes (HSL tailored).
4. **Micro-interactions:** Add subtle haptic feedback and smooth animations for every user action.

## Theme Engine (JSON)
The core of our visual variety is the `THEME_REGISTRY`. 
A theme is a JSON object containing:
- `id` and `name`
- `background`: Overlay colors, gradients, blurs.
- `typography`: Font families, alignments, text cases.
- `map`: Map visibility, line colors, routing styles.
- `layout`: Padding, positioning of stats vs. title.

To add a new visual style, we **do not write new React components**. We simply add a new JSON object to the registry.

## Typography
- Main Headers: Deep, highly-kerned, bold.
- Captions: Uppercase, heavily spaced (tracking), muted colors.
- Standard sizes are drawn from `src/theme/typography.ts`. Never hardcode `fontSize`.

## Borders & Radii
Always use the `spacing` and `borderRadius` constants from `src/theme/index.ts`. No raw numeric pixels for margins or paddings.
