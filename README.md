# Emoji Picker — Figma Plugin

Dark-mode emoji picker that lets you search and insert emojis into the current selection.

How to run
- Install deps (optional): `npm install`
- Build TypeScript: `npm run build`
- In Figma: Plugins → Development → Import plugin from manifest… → select `manifest.json`.

Features
- Responsive dark UI with grid (6–8+ columns depending on width)
- Realtime search filter over 1,000+ emojis
- Hover scale with subtle border
- Smooth scrolling with chunked rendering
- Click to insert; press Enter in search to insert first match

Notes
- Emoji rendering depends on OS fonts. The plugin attempts to load `Inter` for text nodes, and uses system emoji glyphs if available.
- API docs: [Figma Plugin API](https://www.figma.com/plugin-docs/)
