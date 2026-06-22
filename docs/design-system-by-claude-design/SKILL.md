---
name: yolos-design
description: Use this skill to generate well-branded interfaces and assets for yolos.net — "自分を知り、楽しむ。そのための場所" (a diagnosis-centric site of personality/character quizzes, supported by cultural content (dictionaries) and everyday online tools). Use for production code or throwaway prototypes/mocks. Contains design tokens (colors, type, spacing, motion), brand assets, and UI kits.
user-invocable: true
---

> **【コンセプトと再適合（cycle-261 / B-539）】** サイトコンセプトは cycle-257（B-535）の実測に基づき **「自分を知り、楽しむ。そのための場所」（診断中心）** に再センタリングされ（`docs/site-concept.md`）、cycle-261 で本スキル・README.md・`/DESIGN.md`・`.claude/skills/frontend-design/SKILL.md` を一体で診断中心へ再適合した。デザイントークンと UI コンポーネントの抑制された規約は概念中立の基盤として引き続き有効。そのうえで**診断のタッチポイント（診断入口・結果面）に限り**、結果固有色・象徴アイコンを主役にした表現を許す（単一情報源は `/DESIGN.md` §7「診断の視覚言語」）。下記 Quick rules はこの診断例外を織り込み済み（rule 6・10）。確定方向と根拠は `docs/cycles/cycle-261.md`。

Read `README.md` in this skill folder for the full design system. Explore `colors_and_type.css` for tokens and `ui_kits/` for components.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens**: `colors_and_type.css` — neutral surface palette (5-step `--bg`_ / 5-step `--fg`_) + 4-hue × 3-level CUD ver.4.2 accent/status (`--accent` 264°, `--success` 162°, `--warning` 80°, `--danger` 35°, all OKLCH L=0.62 base). `--border` and `--border-strong` are aliases of surface tokens. Two fonts only: **Noto Sans JP** (sans) and **Noto Sans Mono** (mono).
- **UI kits**: `ui_kits/toolbox/` (dashboard with sortable resizable panels) and `ui_kits/tool-page/` (single tool layout: hero panel + how-to + related). Both share `ui_kits/_shared.css` (`.panel`, `.btn`, `.tag`, `.chip`) and `ui_kits/_shared.jsx` (`Header`, `Footer`, `Logo`, `Icon`, `Button`, `Tag`, `Chip`, `SectionHead`).
- **Core motif**: 矩形パネル — near-sharp corners (2px), hairline border, no shadows by default. The panel form is the shared base for all content. 道具・辞典本文・道具箱 keep the austere base uniformly; 診断 (`/play`) layers a result-identity visual language (color + symbol) on top of that base at its entry/result touchpoints only (see `/DESIGN.md` §7).
- **Voice**: short, 体言止め多め, 「あなた」「私たち」を使わない. 絵文字は UI 装飾・機能ラベルには使わない（例外＝診断結果の象徴アイコン）. Verbs: はじめる / 保存 / 削除 / さがす / 道具箱に入れる.
- **Iconography**: Lucide-style 1.5px square-cap line icons. Sized 16/20/24 only. Aria-label required on icon-only buttons.

## Quick rules

1. **Corner radii — 2 values only**: `--r-normal` (2px) for everything, `--r-interactive` (8px) for buttons / inputs / selects / textareas. No other values.
2. **Elevation — 3 levels only**: `--elev-0` (default, no shadow), `--elev-button` (resting buttons), `--elev-dragging` (item being dragged). Dialogs / popovers / cards stay flat.
3. **Borders are aliases**: `--border` = `--bg-softer`, `--border-strong` = `--bg-invert`. Use hairlines (`1px solid var(--border)`) as the primary divider, not color blocks.
4. **Hover steps are uniform**: ΔL ≈ 0.035 between surface levels. Default `bg → bg-soft`, ghost `bg-soft → bg-softer`, primary `bg-invert → bg-invert-soft`. Never change opacity or scale.
5. **Focus**: `outline: 2px solid var(--accent); outline-offset: 2px;`
6. **No bouncy animations.** Motion uses `cubic-bezier(0.2, 0.6, 0.2, 1)` at 120/200/320ms; fade and short slide only. **No emoji / no gradients in the austere base (tools・dictionary・dashboard・common UI).** 診断 exception (`/DESIGN.md` §7): a diagnosis result may use its symbol icon (emoji) as the hero "勲章", and entry/result faces may use the result's identity color (incl. a restrained tint/wash); keep it tasteful, concentrated to a few points, not garish.
7. **8px spacing grid** (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96). Body line-height 1.7 (Japanese-friendly).
8. **Layout**: left-aligned. Body max 720px, dashboard 1200–1440px. Header is not fixed.
9. **One accent color per screen** for functional accents (`--accent` / `--success` / `--warning` / `--danger`). The diagnosis result-identity color (§7) is a separate, content-driven hero color and is not bound by this functional-accent rule — but on a diagnosis screen, still let one color lead (the result's own), not many.
10. **道具・辞典・道具箱 share one austere look** — no genre badges, no color coding in the base. 診断 (`/play`) is the deliberate exception: its entry/result faces carry a result-specific identity (color + symbol) per `/DESIGN.md` §7. Contrast: result/traditional colors go on surfaces/symbols; text uses a WCAG-AA dark variant (many traditional colors fail AA as text/white-on-color).

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
