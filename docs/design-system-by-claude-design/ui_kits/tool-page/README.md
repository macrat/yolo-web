# UI Kit — 個別ツールページ

The canonical layout for a single tool page on yolos.net.

## Page structure

1. **Eyebrow label** (kind/category) + "道具箱に入れる" action
2. **Title** (Noto Sans JP, weight 500)
3. **Short description** (one line)
4. **Big panel** — the tool itself, in the same panel form as the dashboard but at full size
5. **使い方** — numbered how-to steps
6. **ほかの道具** — related panels (same panel form)

## Files

- `index.html` — interactive prototype with a working timer
- `ToolPage.jsx` — `ToolHero`, `HowTo`, `RelatedTools`, `TimerPanel`
- Shared: `../_shared.css`, `../_shared.jsx`

## Notes

- The hero panel uses `--border-strong` to differentiate "the tool itself" from regular dashboard panels (which use `--border`).
- Step numbers are zero-padded mono (01, 02…) — a typographic accent, not decoration for its own sake.
