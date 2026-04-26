---
name: yolos-design
description: Use this skill to generate well-branded interfaces and assets for yolos.net — a site of well-considered everyday online tools and a 道具箱 (dashboard) for arranging them. Use for production code or throwaway prototypes/mocks. Contains design tokens (colors, type, spacing, motion), brand assets, and UI kits for the dashboard and tool pages.
user-invocable: true
---

Read `README.md` in this skill folder for the full design system. Explore `colors_and_type.css` for tokens and `ui_kits/` for components.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens**: `colors_and_type.css` — neutral surface palette (5-step `--bg`_ / 5-step `--fg`_) + 4-hue × 3-level CUD ver.4.2 accent/status (`--accent` 264°, `--success` 162°, `--warning` 80°, `--danger` 35°, all OKLCH L=0.62 base). `--border` and `--border-strong` are aliases of surface tokens. Two fonts only: **Noto Sans JP** (sans) and **Noto Sans Mono** (mono).
- **UI kits**: `ui_kits/toolbox/` (dashboard with sortable resizable panels) and `ui_kits/tool-page/` (single tool layout: hero panel + how-to + related). Both share `ui_kits/_shared.css` (`.panel`, `.btn`, `.tag`, `.chip`) and `ui_kits/_shared.jsx` (`Header`, `Footer`, `Logo`, `Icon`, `Button`, `Tag`, `Chip`, `SectionHead`).
- **Core motif**: 矩形パネル — near-sharp corners (2px), hairline border, no shadows by default. ALL content (tools AND 息抜き) uses the same panel form — never style them differently.
- **Voice**: short, 体言止め多め, 「あなた」「私たち」「絵文字」を使わない. Verbs: はじめる / 保存 / 削除 / さがす / 道具箱に入れる.
- **Iconography**: Lucide-style 1.5px square-cap line icons. Sized 16/20/24 only. Aria-label required on icon-only buttons.

## Quick rules

1. **Corner radii — 2 values only**: `--r-normal` (2px) for everything, `--r-interactive` (8px) for buttons / inputs / selects / textareas. No other values.
2. **Elevation — 3 levels only**: `--elev-0` (default, no shadow), `--elev-button` (resting buttons), `--elev-dragging` (item being dragged). Dialogs / popovers / cards stay flat.
3. **Borders are aliases**: `--border` = `--bg-softer`, `--border-strong` = `--bg-invert`. Use hairlines (`1px solid var(--border)`) as the primary divider, not color blocks.
4. **Hover steps are uniform**: ΔL ≈ 0.035 between surface levels. Default `bg → bg-soft`, ghost `bg-soft → bg-softer`, primary `bg-invert → bg-invert-soft`. Never change opacity or scale.
5. **Focus**: `outline: 2px solid var(--accent); outline-offset: 2px;`
6. **No emoji. No bouncy animations. No gradients.** Motion uses `cubic-bezier(0.2, 0.6, 0.2, 1)` at 120/200/320ms; fade and short slide only.
7. **8px spacing grid** (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96). Body line-height 1.7 (Japanese-friendly).
8. **Layout**: left-aligned. Body max 720px, dashboard 1200–1440px. Header is not fixed.
9. **One accent color per screen.** Only one of `--accent` / `--success` / `--warning` / `--danger` should be visible at a time as a focus point.
10. **Tools and 息抜き look identical.** No genre badges, no color coding.

## Files in this skill

```
README.md                  ← full design system documentation
colors_and_type.css        ← all design tokens (CSS custom properties)
preview/                   ← swatch/component preview cards (Design System tab)
assets/yolos-logo.svg      ← wordmark "yolos.net" with accent dot
assets/yolos-mark.svg      ← square mark version
ui_kits/_shared.css        ← .panel / .btn / .tag / .chip / .icon-btn
ui_kits/_shared.jsx        ← Header, Footer, Logo, Icon, Button, Tag, Chip, SectionHead
ui_kits/toolbox/           ← dashboard UI kit (index.html + Toolbox.jsx)
ui_kits/tool-page/         ← single tool page UI kit (index.html + ToolPage.jsx)
```
