# DESIGN.md 準拠調査レポート: cycle-200〜219 移行済みツール

調査日: 2026-06-01

## 調査概要

cycle-200〜219 で (legacy) から (new) に移行された全 20 ツールについて、
DESIGN.md のデザイントークン・レイアウト・コンポーネント規約への準拠状況を調査した。

## 対象ツール一覧

| cycle | ツール                    | 移行種別                  |
| ----- | ------------------------- | ------------------------- |
| 200   | char-count                | 詳細ページ移行 + タイル化 |
| 201   | byte-counter              | 詳細ページ移行 + タイル化 |
| 202   | url-encode                | 詳細ページ移行 + タイル化 |
| 203   | base64                    | 詳細ページ移行 + タイル化 |
| 204   | html-entity               | 詳細ページ移行 + タイル化 |
| 205   | hash-generator            | 詳細ページ移行 + タイル化 |
| 206   | fullwidth-converter       | 詳細ページ移行 + タイル化 |
| 207   | qr-code                   | 詳細ページ移行 + タイル化 |
| 208   | kana-converter            | 詳細ページ移行 + タイル化 |
| 209   | line-break-remover        | 詳細ページ移行 + タイル化 |
| 210   | text-replace              | 詳細ページ移行 + タイル化 |
| 211   | image-base64              | 詳細ページ移行 + タイル化 |
| 212   | image-resizer             | 詳細ページ移行 + タイル化 |
| 213   | password-generator        | 詳細ページ移行 + タイル化 |
| 214   | text-diff                 | 詳細ページ移行 + タイル化 |
| 215   | regex-tester              | 詳細ページ移行 + タイル化 |
| 216   | keigo-reference           | 詳細ページ移行 + タイル化 |
| 217   | traditional-color-palette | 詳細ページ移行 + タイル化 |
| 218   | cron-parser               | 詳細ページ移行 + タイル化 |
| 219   | email-validator           | 詳細ページ移行 + タイル化 |

---

## 準拠確認済み項目（全ツール PASS）

### 1. --color-\* 旧トークンの置換完了

全 20 ツールの `Component.module.css` で `--color-*` 系旧トークン残存はゼロ。
cycle-200〜219 の各サイクルで `--color-bg → --bg` / `--color-text → --fg` / `--color-primary → --accent` 等に置換済み。

```
grep -rn "\-\-color-" src/tools/{char-count,byte-counter,url-encode,...}/Component.module.css
→ 0件
```

### 2. max-width 1200px レイアウト

全 20 ツールの `src/app/(new)/tools/<slug>/page.module.css` で `max-width: 1200px` を適用済み。
DESIGN.md §4「画面幅は最大1200px」に準拠。

例: `src/app/(new)/tools/char-count/page.module.css:5: max-width: 1200px;`

### 3. フォーカス outline

全 20 ツールで `outline: 2px solid var(--accent); outline-offset: -1px;` を textarea/input に適用済み。
DESIGN.md §2「フォーカスされている要素には outline: 2px solid var(--accent); outline-offset: 2px; を使う」に準拠。

### 4. デザイントークン (--bg / --fg / --accent / --border / --danger / --success 等) の使用

全 20 ツールで新デザイントークンが適切に使用されている。

### 5. グラデーション・カラフル背景なし

全 20 ツールで `linear-gradient` / `radial-gradient` の使用なし。DESIGN.md §6 Do/Don't に準拠。

### 6. 絵文字・アイコンなし

全 20 ツールの Component.tsx / page.tsx に絵文字なし。
email-validator の ✓ / ✗ は Unicode 記号（U+2713 / U+2717）であり絵文字には該当しない。

### 7. --font-mono トークン使用

`--font-mono` は `src/app/globals.css:189` に定義済みのトークン。
byte-counter 以外の全ツールで使用されており DESIGN.md 準拠。

### 8. (new)/layout.tsx での globals.css グローバルインポート

`src/app/(new)/layout.tsx:2: import "@/app/globals.css";`
全デザイントークンが自動的に適用される。

---

## 違反・懸念項目

### A. #fff ハードコード（accent 背景上テキスト色）【重要・意図的後回し】

**対象ファイルと行番号:**

| ツール              | ファイル                                             | 行            | 内容                                                    |
| ------------------- | ---------------------------------------------------- | ------------- | ------------------------------------------------------- |
| url-encode          | `src/tools/url-encode/Component.module.css`          | 39, 99        | `.modeButton.active`, `.convertButton` に `color: #fff` |
| base64              | `src/tools/base64/Component.module.css`              | 34, 79        | 同上                                                    |
| html-entity         | `src/tools/html-entity/Component.module.css`         | 34, 79        | 同上                                                    |
| hash-generator      | `src/tools/hash-generator/Component.module.css`      | 71            | `.generateButton` に `color: #fff`                      |
| fullwidth-converter | `src/tools/fullwidth-converter/Component.module.css` | 34            | `.modeButton.active` に `color: #fff`                   |
| kana-converter      | `src/tools/kana-converter/Component.module.css`      | 35            | `.modeButton.active` に `color: #fff`                   |
| line-break-remover  | `src/tools/line-break-remover/Component.module.css`  | 36            | `.activeTab` に `color: #fff`                           |
| image-base64        | `src/tools/image-base64/Component.module.css`        | 34, 169       | `.activeTab`, `.encodeButton` に `color: #fff`          |
| image-resizer       | `src/tools/image-resizer/Component.module.css`       | 115, 200, 218 | 各ボタンに `color: #fff`                                |

**正しいトークン:** `var(--fg-invert)` (DESIGN.md §2 定義)

**現状:** cycle-207 で B-440 として起票 (P3 / Target: -) 。cycle-213 (password-generator) 以降は `var(--fg-invert)` に変換済みだが、cycle-200〜212 移行ツール 9 件は未修正のまま。

**不一貫:** cycle-213〜219 の 7 ツールは `var(--fg-invert)` を使用しているが、cycle-200〜212 の 9 ツールは `#fff` のまま。同一 accent 背景上テキスト色のパターンで実装方法が分裂している。

**ダークモード影響:** cycle-207 T-2 の WCAG 計測で `.generateButton color: #fff` がライト 3.63:1 / ダーク 2.59:1 で両モード WCAG AA (4.5:1) 未達と判明済み。

---

### B. border-radius ハードコード（DESIGN.md トークン未使用）【全 18 ツール】

DESIGN.md §5 は角丸トークンを以下のように定義している:

- `--r-normal` (2px): パネル・カード・タグ・モーダル等すべて
- `--r-interactive` (8px): ボタン・入力欄・セレクト等

**実態:** char-count と byte-counter のみ `var(--r-normal)` / `var(--r-interactive)` を使用。
cycle-202 (url-encode) 以降の 18 ツールは以下のようなハードコード値を使用:

- `border-radius: 0.5rem` (8px) — `--r-interactive` と同値だが `var()` 未使用
- `border-radius: 0.375rem` (6px) — DESIGN.md 未定義の値
- `border-radius: 0.25rem` (4px) — DESIGN.md 未定義の値

例: `src/tools/url-encode/Component.module.css:17: border-radius: 0.5rem;`
例: `src/tools/url-encode/Component.module.css:63: border-radius: 0.375rem;`

また `password-generator/Component.module.css:73,79: border-radius: 3px;` は `--r-normal` (2px) でも `--r-interactive` (8px) でもない値を使用。

**サイクルドキュメントでの言及なし:** cycle-202〜219 のドキュメントに border-radius トークン化の検討・後回しに関する記録が存在しない。未認識の違反状態。

---

### C. ToolLayout / 共通コンポーネントの --color-\* 旧トークン残存【P1 未スケジュール】

ToolLayout は全 20 ツールの詳細ページで使用されるが、その CSS は旧トークンを使用中。

| ファイル                                            | 残存数 |
| --------------------------------------------------- | ------ |
| `src/tools/_components/ToolLayout.module.css`       | 9 箇所 |
| `src/tools/_components/RelatedTools.module.css`     | 6 箇所 |
| `src/tools/_components/RelatedBlogPosts.module.css` | 6 箇所 |
| `src/components/common/Breadcrumb.module.css`       | 4 箇所 |
| `src/components/common/FaqSection.module.css`       | 8 箇所 |
| `src/components/common/ShareButtons.module.css`     | 1 箇所 |

例: `src/tools/_components/ToolLayout.module.css:17: color: var(--color-text);`

`(new)/layout.tsx` は `globals.css` のみインポートし `old-globals.css` はインポートしていないため、これらの `--color-*` は (new) 配下では未定義（CSS 初期値にフォールバック）となる。

**B-431 (P1 / Target: -)** として cycle-200 T-1 で起票済み。ただし「Phase 8.1 全 34 ツール完了の前提条件」とされているが、現在 20 ツール移行完了後も Target cycle が "-" のままで着手時期が未定。

---

### D. Tile.tsx のフォールバック付き var() にハードコード色値

インラインスタイルでデザイントークンを使用しているが、フォールバック値に DESIGN.md 未定義の旧来 HEX / RGBA 値を使用しているケース。

| ファイル                                                              | 行                 | 内容                                                                |
| --------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `src/tools/text-diff/TextDiffTile.tsx`                                | 250                | `color: "var(--success, #16a34a)"`                                  |
| `src/tools/keigo-reference/KeigoReferenceTile.tsx`                    | 75                 | `backgroundColor: "var(--accent-soft, rgba(59,130,246,0.15))"`      |
| `src/tools/keigo-reference/KeigoReferenceTile.tsx`                    | 515                | `borderBottom: "1px solid var(--border, rgba(0,0,0,0.08))"`         |
| `src/tools/traditional-color-palette/TraditionalColorPaletteTile.tsx` | 347, 380, 621, 634 | `var(--border, rgba(0,0,0,0.15))` 等                                |
| `src/tools/cron-parser/CronParserTile.tsx`                            | 213, 337-339       | `var(--danger, #e53e3e)`, `var(--danger-soft, rgba(229,62,62,0.1))` |
| `src/tools/email-validator/EmailValidatorTile.tsx`                    | 238                | `var(--danger, #e53e3e)`                                            |

実害はない（globals.css にすべてのトークンが定義済みのため実際にフォールバックは発動しない）が、フォールバック値が OKLCH 定義と乖離しているためダークモードでの設計意図との矛盾が潜在する。

---

### E. regex-tester の patternInput: outline:none 【フォーカス表示欠落の懸念】

`src/tools/regex-tester/Component.module.css:26: outline: none;`

`.patternInput` は `.patternRow` コンテナ内のインライン input 要素。`.patternRow` 自体に `:focus-within` ルールが設定されていない。

**現状:** patternInput にフォーカスが当たっても outline の視覚的フィードバックがない（ユーザーエクスペリエンスとアクセシビリティの懸念）。

**DESIGN.md 要件:** §2「フォーカスされている要素には `outline: 2px solid var(--accent); outline-offset: 2px;` を使う」

---

### F. traditional-color-palette の非トークン box-shadow

`src/tools/traditional-color-palette/Component.module.css:92: box-shadow: 0 0 0 2px var(--accent);`

`.swatch.selected` の選択状態視覚表現として使用。DESIGN.md §5 では `--shadow-button` と `--shadow-dragging` 以外の box-shadow 使用は「通常の要素にはエレベーションを使わない」に該当する可能性がある。

ただしこれはエレベーション（奥行き）ではなく outline 代替（選択リング）として使われており、機能としての正当性はある。アウトライン代替の box-shadow は一般的な実装パターン。

---

### G. traditional-color-palette のツール固有ハードコード色（要件上やむを得ない）

`src/tools/traditional-color-palette/TraditionalColorPaletteTile.tsx:106`

```javascript
return luma > 0.5 ? "#1a1a1a" : "#f0f0f0";
```

これはテキストコントラスト計算のためのロジックで、表示するカラーの輝度に応じた白/黒テキストの選択に使用。デザイントークンでは代替できない機能的ハードコード値。

`src/tools/traditional-color-palette/Component.tsx:31,36`

```javascript
return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
```

カラーコードのフォーマット変換ロジック。機能的に必要な値生成コード。

---

### H. qr-code の #fff 背景（機能要件上やむを得ない）

`src/tools/qr-code/Component.module.css:87: background-color: #fff;`
`src/tools/qr-code/QrCodeTile.tsx:168: backgroundColor: "#fff",`

QR コードの読み取り精度要件により白背景を固定。コメントに理由が記録されており意図的な設定。デザイントークンでは代替できない機能的ハードコード。

---

### I. 共通 Button コンポーネント未使用

DESIGN.md §5「ボタンやフォームなどのUIコンポーネントは、src/components/ にあるものを使う」

全 20 ツールの変換ボタン・モードボタンは `src/components/Button` を使わず独自 CSS で実装。理由として `src/components/Button` の variant が `primary` (--bg-invert 背景) と `default` (--bg-soft 背景) のみで、各ツールが使う `--accent` 背景ボタンに対応する variant が存在しない。

DESIGN.md §2 にもアクセントカラーをボタン背景に使う定義はなく（リンク・フォーカス用途として定義）、設計上のギャップが存在する。

---

### J. line-break-remover のチェックボックス（単独 ON/OFF）

`src/tools/line-break-remover/Component.tsx:85-92` の `mergeConsecutive` オプションが `<input type="checkbox">` で実装されている。これは単独 ON/OFF のトグルであり、DESIGN.md §5「ON/OFF を切り替えるフォーム要素は、原則としてチェックボックスではなくトグルスイッチを使う」の適用対象。

ただし cycle-209 のドキュメントで「タイル版での省略」が議論され、詳細ページの mergeConsecutive チェックボックスは「複数条件選択」のグループとしての文脈はなく、機能的に単独 ON/OFF に近い。

---

## デザインの一貫性の観点

### --fg-invert vs #fff の分裂

cycle-200〜212 移行ツール（9 件）: `color: #fff`（ハードコード）
cycle-213〜219 移行ツール（7 件）: `color: var(--fg-invert)` または `color: var(--fg-invert, var(--bg))`

同一パターン（accent 色ボタンの文字色）が異なる実装になっており、一貫性が欠如している。

### border-radius の分裂

cycle-200〜201（char-count / byte-counter）: `var(--r-normal)` / `var(--r-interactive)` を使用
cycle-202〜219（18 ツール）: `0.5rem`, `0.375rem`, `0.25rem` などのハードコード

最初の 2 ツールのみがトークンを使用し、残りの 18 ツールがハードコードを使うという逆転現象が発生している。

---

## 放置されたキャリーオーバーの確認

| バックログ | 内容                                              | 優先度 | Target | 状態   |
| ---------- | ------------------------------------------------- | ------ | ------ | ------ |
| B-431      | ToolLayout 等共通コンポーネントの --color-\* 置換 | P1     | -      | 未着手 |
| B-440      | --accent + #fff の WCAG AA 全ツール一括点検       | P3     | -      | 未着手 |

B-431 は「Phase 8.1 全 34 ツール完了の前提条件」とされているが、20 ツール完了後も Target cycle が未設定のまま。

---

## 総括

全 20 ツールは:

- 旧トークン (`--color-*`) の除去: 完了
- max-width 1200px / globals.css グローバルインポート: 完了
- フォーカス outline (`var(--accent)`) の適用: 完了

一方で以下の未解消課題がある:

1. **#fff ハードコード**（cycle-202〜212 の 9 ツール）: B-440(P3) で後回し中。cycle-213 以降の 7 ツールと不一貫。
2. **border-radius ハードコード**（cycle-202〜219 の 18 ツール）: backlog にも記録なく未認識の違反。
3. **ToolLayout 共通コンポーネントの --color-\*** : B-431(P1) で後回し中、Target 未設定。
4. **Tile.tsx のフォールバック HEX/RGBA 値**（5 ツール）: 機能的影響なしだが設計上の不整合。
5. **regex-tester patternInput の outline:none**（フォーカス表示欠落）。
