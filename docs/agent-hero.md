# Builder Profile Hero

The GitHub profile hero is a responsive SVG identity card built around Wildan's
builder-first positioning. It keeps the portrait-derived ASCII treatment. Light
mode uses the warm editorial palette, while dark mode uses GitHub-native graphite
with a brighter portrait range for clear facial contrast.

## Generate assets

```bash
node scripts/generate-agent-hero.mjs --source /absolute/path/to/portrait.png
```

The source portrait stays local. Only generated SVG assets belong in the public
repository.

The generator produces these cache-versioned files:

- `builder-profile-v2-dark.svg`
- `builder-profile-v2-light.svg`
- `builder-profile-v2-mobile-dark.svg`
- `builder-profile-v2-mobile-light.svg`

GitHub proxies README images and may cache an existing URL. A material visual
revision should use a new versioned filename and update all four README sources.

## Content sources

- Stable identity and working-method copy live in
  `scripts/generate-agent-hero.mjs`.
- The six project names and focus labels come from
  `data/featured-projects.json`.
- Detailed project descriptions, roles, statuses, and links are presented in
  `README.md`.

This split keeps the hero concise while preventing its selected-work list from
drifting away from the structured project set.

## Rendering guarantees

- The portrait and all essential text are visible in the SVG's base state.
- Essential content does not depend on SMIL, zero-size clips, masks, opacity
  reveals, JavaScript, or network requests.
- Motion is limited to two quiet decorative treatments and only runs when
  `prefers-reduced-motion: no-preference` is active.
- Desktop and mobile have separate compositions so the information panel remains
  readable instead of shrinking the desktop asset.
- The desktop dark SVG is the explicit fallback for README renderers that do not
  select a responsive source.

## Validate deterministic output

```bash
node --check scripts/generate-agent-hero.mjs
node scripts/generate-agent-hero.mjs --source /absolute/path/to/portrait.png --check
xmllint --noout assets/hero/builder-profile-v2-*.svg
```

`--check` regenerates the expected strings in memory and compares all four files
byte-for-byte. It exits non-zero when an asset is missing or stale.

## Portrait privacy

Do not commit the original portrait. The crop is tuned for Wildan's approved
3072×4096 transparent source and must be visually reviewed when that source or
crop changes.
