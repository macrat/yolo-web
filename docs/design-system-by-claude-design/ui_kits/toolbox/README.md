# UI Kit — 道具箱 (Toolbox / Dashboard)

A dashboard where the user arranges their chosen tools as panels. Multiple toolboxes can exist; tabs switch between them.

## Files

- `index.html` — interactive prototype
- `Toolbox.jsx` — `ToolPanel`, `ToolPreview`, `AddPanel`, `ToolboxTabs`, `AddToolModal`, `TOOL_LIBRARY`
- Shared: `../_shared.css`, `../_shared.jsx`

## Interactions demonstrated

- Switch between multiple toolboxes (tabs)
- Add a new toolbox
- Add a tool from the library (modal)
- Each panel previews live content (timer count, weather, color swatches, habit grid, etc.)
- Panels are clickable (would route to the tool's individual page in production)

## Notes

- Real drag-to-reorder is omitted — UI kit cuts corners on functionality.
- Tools and 息抜き (e.g. 日替わり占い, 九字格子) use the **same panel form**. No visual distinction.
