---
title: デザインシステム是正タスク群のベストプラクティス調査（cycle-170 B/C/D/E 群向け）
date: 2026-04-27
purpose: cycle-170 で発生した design-system の事故（モバイル無視・ダーク未定義・SRP 違反・漸進切替仕組み欠如）に対する是正タスク群の手順と受け入れ基準を立案するための調査。B-3（ダーク）・C-2（SRP）・E-1（モバイル）・D-1（移行戦略）の 4 テーマを網羅。
method: |
  - 主要クエリ: "OKLCH dark mode palette derivation WCAG AA", "next-themes :root.dark best practices", "axe-core pa11y CI contrast automated", "React SRP compound component shadcn radix", "mobile-first CSS design system breakpoints 375px 44px", "CSS @layer design system migration feature flag coexistence"
  - 参照した一次資料: MDN, WCAG 2.2 W3C, web.dev, Playwright 公式, Radix UI 公式, CSS-Tricks, Smashing Magazine, Evil Martians, Material Design, Martin Fowler
  - 参照した既存リサーチ: docs/research/2026-04-26-cycle-169-research-synthesis-for-design-system.md ほか 5 本
sources:
  - https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
  - https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes
  - https://github.com/pacocoursey/next-themes
  - https://web.dev/articles/color-scheme
  - https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
  - https://github.com/dequelabs/axe-core
  - https://github.com/pa11y/pa11y
  - https://www.npmjs.com/package/wcag-contrast
  - https://github.com/johno/get-contrast
  - https://martinfowler.com/articles/headless-component.html
  - https://www.radix-ui.com/primitives/docs/guides/composition
  - https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition
  - https://polypane.app/blog/responsive-design-ground-rules/
  - https://css-tricks.com/looking-at-wcag-2-5-5-for-better-target-sizes/
  - https://playwright.dev/docs/emulation
  - https://css-tricks.com/css-cascade-layers/
  - https://css-tricks.com/organizing-design-system-component-patterns-with-css-cascade-layers/
  - https://www.smashingmagazine.com/2025/09/integrating-css-cascade-layers-existing-project/
  - https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/
  - https://atmos.style/blog/dark-mode-ui-best-practices
---

# デザインシステム是正タスク群のベストプラクティス調査

## 1. ダーク用パレット導出と WCAG AA 検証（B-3 用）

### 1-1. ライト用 OKLCH パレットからダーク用パレットを導出する標準的な手法

yolos.net の現行 globals.css（cycle-170 T-03 追記）は、ライトモードのアクセント・ステータス色を OKLCH で定義しているが、`:root.dark` ブロックにダーク値が存在しない（コメント「次サイクルで WCAG AA 検証後に追加」）。導出手法には主に 2 つのアプローチがある。

**手法 A: 明度のみを反転し色相・彩度を保持する（最小変更）**

OKLCH の L（知覚明度）は線形に人間の知覚と対応するため、ライトモードで `L=0.62` だったアクセント色をダークモードでは `L=0.72〜0.78` に引き上げることで、同じ色相のまま暗い背景に対するコントラストを確保できる。

```css
/* ライト */
--accent: oklch(0.62 0.22 264); /* 背景 #fff に対し AA 通過 */

/* ダーク（L を +15 程度引き上げ、C は微減） */
--accent: oklch(0.76 0.18 264); /* 背景 #1a1a1a に対し AA 検証が必要 */
```

LogRocket の調査（出典: blog.logrocket.com/oklch-css-consistent-accessible-color-palettes）では「L 値を固定したままスケール全体を構築すれば、コントラスト比が保たれる」と説明している。ただしこれはスケール内のステップ間の相対コントラストについての話であり、背景に対するコントラストは背景 L 値との差で決まるため別途検証が必要。

**手法 B: 色相をわずかにシフトしてダーク特有の沈静感を出す**

純粋な明度調整に加え、色相を 5〜10° シフトすることでダークモード固有の落ち着いた印象を演出する方法がある。ただし yolos.net の「functional-quiet」フィロソフィーでは沈静感を求めているため、色相シフトによる印象差よりもコントラスト確保と一貫性を優先すべきである。

**現行値に対する具体的な導出例（yolos.net globals.css 準拠）**

現行のサーフェス系（`--bg`, `--fg`）はライトモード用の sRGB 値で定義されている。ダーク定義においてはこれらを OKLCH に変換してから明度を反転させるのが最も一貫性が高い。

| トークン          | ライト値               | ダーク推奨方針                                     |
| ----------------- | ---------------------- | -------------------------------------------------- |
| `--bg`            | `#ffffff` (L≈1.0)      | L≈0.12 程度（純黒を避け `#1a1a1a` 相当）           |
| `--bg-soft`       | `#f4f4f1` (L≈0.97)     | L≈0.17 程度                                        |
| `--bg-invert`     | `#1a1a1a` (L≈0.12)     | L≈0.94 程度（反転してライトモードの bg に近い値）  |
| `--fg`            | `#1a1a1a` (L≈0.12)     | L≈0.93 程度                                        |
| `--accent` (base) | `oklch(0.62 0.22 264)` | L を 0.72〜0.76 に引き上げ、C を 0.18〜0.20 に微減 |
| `--accent-soft`   | `oklch(0.93 0.04 264)` | L を 0.20 程度に下げ、背景として使用               |

Evil Martians の OKLCH 解説（出典: evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl）では、ダークモード変数の再定義をメディアクエリ内で行う方法を示しており、「色を感情で選ばず、L/C/H を独立したパラメータとして機械的に調整できる」ことが OKLCH の主要な利点と述べている。

**Material Design が示す「ダークモードでは高彩度色を避ける」原則**

Dark Mode Design Systems の調査（出典: muz.li/blog/dark-mode-design-systems-a-complete-guide）によると、ダーク背景に彩度の高いアクセント色を置くと光学的なバイブレーションが生じ、目の疲れを引き起こす。アクセント色は「ライトモードより 20 ポイント程度彩度を落とす」ことが推奨される。OKLCH では C（chroma）を 0.02〜0.04 程度下げることで対応可能。

### 1-2. next-themes の `attribute="class"` 方式での CSS 変数定義パターン

next-themes は `ThemeProvider` に `attribute="class"` を渡すと、`<html>` 要素に `class="dark"` を付与する（デフォルトは `data-theme` 属性）。

```css
/* next-themes attribute="class" を使う場合 */
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --accent: oklch(0.62 0.22 264);
}

:root.dark {
  --bg: #1a1a1a;
  --fg: #f4f4f1;
  --accent: oklch(0.76 0.18 264); /* L を引き上げ C を微減 */
}
```

yolos.net の既存 globals.css は `:root.dark` の記述を旧 `--color-*` 系に対して既に持っており、新しい design-system トークン（`--bg`, `--fg`, `--accent` 等）のダーク値を同じブロックに追記する構造で統一できる。

next-themes の README（出典: github.com/pacocoursey/next-themes）では `suppressHydrationWarning` を `<html>` 要素に付与することでハイドレーション不一致を防ぐことを必須としている。また `color-scheme` CSS プロパティを `:root` と `:root.dark` の両方に設定することで、スクロールバー・フォームコントロール等のブラウザデフォルト要素も自動的に配色が切り替わる（出典: web.dev/articles/color-scheme）。

```css
:root {
  color-scheme: light;
}
:root.dark {
  color-scheme: dark;
}
```

### 1-3. WCAG AA コントラスト比の自動検証手段

**CI で実行できるツール（推奨順）**

1. **axe-core** (github.com/dequelabs/axe-core): WCAG 2.2 Level AA の color-contrast ルールを含む。axe CLI では `axe https://example.com --rules color-contrast` で実行可能。GitHub Actions との統合実績が最も広い。WCAG 問題の平均 57% を自動検出できる（出典: deque.com/axe）。

2. **pa11y** (github.com/pa11y/pa11y): axe-core を内包するコマンドラインツール。`pa11y http://localhost:3000 --standard WCAG2AA` で AA 準拠を検証できる。GitLab CI テンプレートへの組み込み実績あり。

3. **wcag-contrast / get-contrast npm パッケージ**: JavaScript ユニットテスト内でコントラスト比を計算してアサーションを書く場合に使用。CSS 変数を解決した具体的な色値（hex）を引数に渡す。`get-contrast` はコントラスト比と WCAG スコア（A/AA/AAA）を返す（出典: github.com/johno/get-contrast）。

```javascript
// vitest でトークン色をアサートする例
import { ratio, score } from "wcag-contrast";
const contrast = ratio("#1a1a1a", "#ffffff"); // --fg on --bg
expect(score(contrast)).toMatch(/^(AA|AAA)/);
```

**手動検証ツール**

- WebAIM Contrast Checker（webaim.org/resources/contrastchecker）: hex/RGB を貼り付けてライト・ダーク両方を手動検証する標準ツール。
- Chrome DevTools の「Rendering」パネル: `prefers-color-scheme: dark` をエミュレートしてコントラスト検査が可能。
- Stark（Figma プラグイン）: デザインファイルの段階でコントラスト比を確認できる。

**実装上の落とし穴**

1. **`--bg` のみ反転でアクセント色が浮く問題**: `:root.dark` で `--bg` を暗くした場合、`--accent`（ライト値 `oklch(0.62 0.22 264)`）はダーク背景に対して「目が痛い」ほど明るく見える。背景変更と必ずアクセント色の L 調整をセットで行う必要がある。atmos.style の調査（出典: atmos.style/blog/dark-mode-ui-best-practices）では「高彩度色はダーク背景で光学的バイブレーションを起こす」と警告している。

2. **フォーカスリングの色がダークモードで不合格になる問題**: yolos.net の現行コードでは `--accent` を focus ring に使用している。ライトモードで `--accent: oklch(0.62 0.22 264)` は白背景に対しほぼ AA 通過するが、ダークモードで `--accent` が引き上げられた場合、focus ring が `--bg-soft`（暗い値）の上に乗るため 3:1 の比率を別途検証する必要がある。WCAG 2.4.13（Focus Appearance）では focus indicator の変化コントラスト 3:1 以上が要求される（出典: w3.org/WAI/WCAG22/Understanding/focus-appearance.html）。

3. **`color-scheme` を設定しないとフォームコントロールが白い**: `:root.dark` に `color-scheme: dark` を設定しないと、`<input>`, `<select>`, `<scrollbar>` 等がライト配色のままになる。

### 1-4. 色相保持 vs 色相シフトの方針比較

| 方針                   | メリット                               | デメリット                                             | yolos.net への推奨                  |
| ---------------------- | -------------------------------------- | ------------------------------------------------------ | ----------------------------------- |
| 色相保持・明度のみ変更 | ブランド一貫性が高い。実装コストが低い | 色相によっては暗い背景で色が「死んで」見える場合がある | **推奨**（functional-quiet に合致） |
| 色相シフト（5〜10°）   | ダーク固有の雰囲気を演出できる         | トークン数が倍増し管理コスト増。意図が伝わりにくい     | 非推奨（管理コスト > 効果）         |
| 彩度のみ低減           | 光学バイブレーションを抑制できる       | 明度との組み合わせが必要                               | セットで行う（C を 0.02〜0.04 減）  |

---

## 2. design-system の SRP 適用とコンポーネント分解（C-2 用）

### 2-1. 汎用コンテナと機能固有部品を分離する設計パターン

yolos.net の `ArticleArea.tsx` はタイトル・本体・ステップ・関連リンクを一つの component に持つ「複合部品」として設計されている。SRP の観点では、これが「ページ構造のコンテナ」と「各セクションのレンダリング」の両方の責任を持っていることが問題の根幹となっている。

分離パターンの比較：

**パターン A: Compound Component（React Context を使う方法）**

shadcn/ui や Radix UI が採用する手法。Root コンテナが Context を提供し、子コンポーネントが各機能を担当する（出典: vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition）。

```tsx
// 分離後の利用イメージ
<ArticleArea>
  <ArticleArea.Header title="ツール名" meta="ツール" />
  <ArticleArea.Main>
    <TextCounterTool /> {/* ツール固有の機能 */}
  </ArticleArea.Main>
  <ArticleArea.HowTo steps={steps} />
  <ArticleArea.Related items={related} />
</ArticleArea>
```

Root は `max-width` と `article` 要素のみを責任とし、各 sub-component が自身のセクションのみを責任とする。

**パターン B: Headless Component（Custom Hook + 描画分離）**

Martin Fowler の解説（出典: martinfowler.com/articles/headless-component.html）では、ロジックを Custom Hook に切り出し、描画は呼び出し側に委ねる。ツール固有のロジック（文字数カウント等）を custom hook として分離し、描画コンポーネントは純粋な UI のみにする。Next.js App Router との親和性が高い。

**パターン C: asChild / Slot パターン（Radix UI 方式）**

Radix UI の Slot（出典: radix-ui.com/primitives/docs/guides/composition）は、Radix が提供するアクセシビリティ・インタラクション機能を任意の要素に合成できる。`asChild` prop を渡すと、Radix のラッパー要素を使わず子要素にすべての props を移譲する。

```tsx
// Radix の asChild パターン
<ArticleContainer asChild>
  <main>
    {" "}
    {/* Radix のロジックを main 要素に合成 */}
    {children}
  </main>
</ArticleContainer>
```

**yolos.net における推奨: Compound Component パターン（パターン A）**

`ArticleArea` の問題は「ページ最上位の構造として使う」という使い方が正しい方向性だが、steps・related を props で受け取ることで外部からコンテンツ構造を制御できず、ツール固有の追加セクション（例: 設定パネル）を差し込む拡張点がない点にある。Compound Component パターンに分解することで、各ツールページが必要なセクションのみを組み合わせられるようになる。

### 2-2. shadcn/ui と Radix UI の「コンテナ + 機能」分離の具体例

shadcn/ui の Card コンポーネント（Radix UI ベース）は以下のように分解されている：

- `Card` — コンテナ（`max-width`, `border`, `border-radius` のみ責任）
- `CardHeader` — ヘッダー部分の描画のみ責任
- `CardContent` — 本文エリアの描画のみ責任
- `CardFooter` — フッター部分の描画のみ責任

各コンポーネントは独立してテスト可能であり、一つを変更しても他に影響しない。また `CardContent` にはツール固有の機能（フォーム・プレビュー等）を自由に差し込める。

shadcn/ui のドキュメント（出典: vercel.com/academy/shadcn-ui）は「複合コンポーネントは、子の構造が重要でかつ柔軟に保ちたい場合に使う」と明言している。

### 2-3. SRP 適用時の実装上の注意

- **`useId()` は Root に一か所**: 現行の `ArticleArea.tsx` が行っている `useId()` の利用は SRP 分解後も Root でのみ行い、Context 経由で子に渡す。
- **Early abstraction を避ける**: Rule of Three（同じ問題が 3 か所で起きるまで抽象化しない）に従い、分解が本当に必要かを問う。現時点で `ArticleArea` に SRP 問題があるのは実際に「ツール固有の追加セクションを差し込めない」という実害が生じているためであり、分解は適切（出典: docs/research/2026-04-26-cycle-169-research-synthesis-for-design-system.md §C-2）。
- **TypeScript の型で表現力を制限する**: Compound Component の各部品の props を厳密に型付けすることで、AI エージェントが任意の props を追加することを防ぐ。

---

## 3. モバイル対応の design-system 設計（E-1 用）

### 3-1. モバイルファーストの CSS Modules でのレスポンシブ設計

yolos.net は CSS Modules を使用しており、Tailwind は使用しない。モバイルファーストでは `min-width` メディアクエリでスタイルを追加していく（デスクトップファーストの `max-width` は不採用）。

```css
/* CSS Modules でのモバイルファースト例 */
.stepList {
  /* モバイルデフォルト: 縦積み */
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

@media (min-width: 640px) {
  .stepList {
    /* タブレット以上: グリッド */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4);
  }
}
```

Polypane の 2024 更新版レスポンシブガイド（出典: polypane.app/blog/responsive-design-ground-rules）では「コンテンツが崩れる場所でブレイクポイントを設ける（特定デバイス幅に合わせない）」を推奨している。また「メディアクエリは px でなく em で書く」ことで、ユーザーのフォントサイズ設定を尊重できる。

現行の `ArticleArea.module.css` に `@media` クエリが一切ないことが E-1 の問題の根幹であり、すべてのコンポーネントにモバイル基準のスタイルを先に定義し直す必要がある。

### 3-2. 推奨ブレイクポイントの選び方

デバイス固定ではなくコンテンツベースで選ぶのが原則だが、yolos.net のツールページの実態に合わせると以下が妥当：

| ブレイクポイント            | 対象デバイス幅の目安 | 用途                                        |
| --------------------------- | -------------------- | ------------------------------------------- |
| 基準（メディアクエリなし）  | 〜639px              | スマートフォン縦持ち（375px, 390px, 414px） |
| `min-width: 640px` (=40em)  | 640px〜              | スマートフォン横持ち・小型タブレット        |
| `min-width: 768px` (=48em)  | 768px〜              | タブレット縦持ち                            |
| `min-width: 1024px` (=64em) | 1024px〜             | デスクトップ                                |

em 換算: 640px = 40em, 768px = 48em, 1024px = 64em（browser default 16px 前提）。

**yolos.net での最低要件**: 375px（iPhone SE 等の最小スマートフォン）で文字が読めて操作できること。1,940 件参照されている既存 `--color-*` 体系を壊さずに、design-system コンポーネントが 375px で正常動作することが受け入れ基準となる。

### 3-3. design-system レベルで持つべきレスポンシブ抽象

**スペーシングの viewport スケール変動**

現行の `--sp-*` トークン（8px グリッド）はモバイルでもデスクトップでも同じ値を使うが、セクション間の余白（`--sp-7: 48px`, `--sp-8: 64px`）はモバイルでは大きすぎる場合がある。`clamp()` による流動的スケーリングを検討する：

```css
/* clamp() による流体スペーシング */
--sp-section: clamp(24px, 5vw, 48px); /* モバイル 24px〜デスクトップ 48px */
```

ただし管理コストとのバランスで、現行 `--sp-*` の固定値ベースを維持しつつコンポーネント単位で `@media` で上書きする方が AI エージェントにとって理解しやすい（clamp の引数が複雑で AI に誤用されやすい）。

**Container Query の活用**

2025 年の State of CSS では Container Query が 41% の開発者に採用されており、コンポーネントが「自分のコンテナのサイズ」に応じてスタイルを変えられる（出典: caisy.io/blog/css-container-queries）。

```css
/* コンテナ定義 */
.relatedList {
  container-type: inline-size;
}

/* コンテナサイズに応じてカラム数を変える */
@container (min-width: 400px) {
  .relatedItem {
    grid-column: span 1;
  }
}
```

現行の `ArticleArea.module.css` の `.relatedList` は `repeat(auto-fill, minmax(200px, 1fr))` を使っており、200px 以上のコンテナなら自然に折り返す設計になっている。これは 375px 幅では 1 列になる可能性があり、モバイルでの視認性として適切である。

### 3-4. モバイル特有の必須要素

**タップターゲットサイズ（最低 44×44px）**

WCAG 2.5.5（Target Size）および Material Design の推奨（出典: css-tricks.com/looking-at-wcag-2-5-5-for-better-target-sizes）では、インタラクティブ要素の最小タップターゲットを 44×44px 以上（CSS ピクセル）とする。アイコンが 24px でも `padding` で 10px 以上確保することで要件を満たせる。

yolos.net 現行の `Button.module.css` に `min-height: 44px` または相当の `padding` が設定されているかを E-1 受け入れ基準の一つとして確認が必要。

**フォーカス状態（タッチデバイス特有の課題）**

タッチデバイスではホバー状態は存在しないが `:focus-visible` は機能する。`@media (hover: none)` メディアクエリで「タッチのみ環境」向けの追加スタイルを定義できる：

```css
@media (hover: none) {
  .relatedLink {
    /* タッチデバイスではホバーの代わりにアクティブ時に背景を変える */
    background: var(--bg-soft);
  }
}
```

**フォントサイズ最低ライン**

モバイルでは 16px 未満のフォントサイズが iOS Safari で自動ズームを引き起こす。yolos.net の現行 design-system は `--fs-12`（12px）を caption/disabled に使用しており、インタラクティブ要素には適用しないことを明示する必要がある。

### 3-5. モバイル幅でのテスト手段

**Playwright によるモバイルビューポートテスト**

Playwright 公式ドキュメント（出典: playwright.dev/docs/emulation）では、デバイスプリセット（`devices['iPhone 13']` = 390×844px）またはカスタムビューポートでモバイルテストが可能：

```typescript
// playwright.config.ts
import { devices } from "@playwright/test";

export default {
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 720 } } },
    {
      name: "mobile-sm",
      use: { viewport: { width: 375, height: 812 }, isMobile: true },
    },
    { name: "mobile-md", use: { ...devices["iPhone 13"] } }, // 390px
  ],
};
```

yolos.net の Playwright テストに `375px` と `390px` の 2 ビューポートを追加し、design-system コンポーネントのスナップショットテストとコンテンツの視認性確認を行うことが E-1 の受け入れ基準として機能する。

**DevTools による確認**

Chrome DevTools の「Device Toolbar」で 375px（iPhone SE）、390px（iPhone 14 Pro）、412px（Pixel 7）をシミュレートし、デザインシステムコンポーネントページ（T-09 相当）でレイアウト崩れがないかを目視確認する。

---

## 4. 並行 design-system 移行戦略（D-1 用）

### 4-1. 既存 `--color-*` 系（1,940 件参照）と新 design-system の共存期間設計

yolos.net には 1,940 件の既存 `--color-*` 変数参照があり、これを一括置換するとデプロイリスクが極めて高い。安全な並行共存戦略が必要。

**最も安全なアプローチ: 変数名前空間の分離を維持しながら段階移行**

既存の `--color-*` 系と新しいセマンティックトークン（`--bg`, `--fg`, `--accent` 等）は名前が異なるため、CSS 上は競合しない。問題は「新コンポーネントが新トークンを参照し、既存ページが旧トークンを参照する」混在期間にデザインの統一感が失われることである。

移行フェーズの設計：

| フェーズ             | 対象                           | アクション                                                                    |
| -------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| フェーズ 1（現在〜） | design-system コンポーネント   | 新トークン（`--bg`, `--fg`, `--accent`）のみ使用。旧 `--color-*` は参照しない |
| フェーズ 2           | 新規ページ・新規コンポーネント | design-system コンポーネントのみを使って構成。旧スタイルは触らない            |
| フェーズ 3（将来）   | 既存ページの既存コンポーネント | ページ単位で旧スタイルを新トークンに段階置換                                  |
| フェーズ 4           | 旧 `--color-*` 変数の削除      | 全参照が新トークンに移行した後に実施                                          |

### 4-2. CSS @layer による旧新スタイルの優先順位管理

CSS Cascade Layers（`@layer`）を使うと旧スタイルを明示的に「下位レイヤー」に封じ込め、新 design-system スタイルが常に優先されるようにできる（出典: css-tricks.com/css-cascade-layers）。

```css
/* globals.css に追記 */
@layer legacy, design-system;

@layer legacy {
  /* 既存の --color-* 参照スタイルはここで動く */
  .old-component {
    color: var(--color-text);
  }
}

@layer design-system {
  /* 新コンポーネントはここ。同じセレクタでも必ず優先される */
  .article {
    color: var(--fg);
  }
}
```

Smashing Magazine の移行ガイド（出典: smashingmagazine.com/2025/09/integrating-css-cascade-layers-existing-project）では「既存スタイルを `legacy` レイヤーに包んでから、新しいスタイルを非レイヤード（レイヤーなし）か高優先レイヤーで書く」戦略を推奨している。なお `!important` が混在している場合はレイヤー優先順位が逆転するため、移行前に `!important` の使用状況を調査する必要がある。

### 4-3. ページ単位で旧/新を切り替える仕組み

**CSS スコープ（`@scope`）による封じ込め**

最新ブラウザでは `@scope` を使いページ固有の CSS スコープを作れる（MDN: developer.mozilla.org/en-US/docs/Web/CSS/@scope）。旧スタイルを特定のページコンテナに封じ込め、新コンポーネントを外側に置くことでキメラ状態を回避できる。

**CSS Modules による自然な分離**

Next.js の CSS Modules は既にスコープ分離されており、design-system コンポーネントが CSS Modules を使う限り、旧 `--color-*` 変数を直接参照するスタイルが新コンポーネントに汚染されることはない。この性質を積極的に利用する。

**URL / ルートベースの移行**

Next.js App Router の構造を利用して、新しいルート（`/tools/new-tool`）は design-system コンポーネントのみで構成し、既存ルートは旧スタイルのまま維持する。これがページ単位の事実上の「フィーチャーフラグ」として機能する。

### 4-4. 失敗パターンと回避策

| 失敗パターン                             | 説明                                                 | 回避策                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 部分置換によるキメラ状態                 | `--color-text` と `--fg` が同一コンポーネントに混在  | コンポーネント単位で「旧トークン参照ゼロ」を達成してからマージ                                                |
| 半年放置で混在が技術的負債化             | フェーズ 2 以降に進まず両体系が永久共存              | cycle 単位で「フェーズ X を完了させる」目標を明示する                                                         |
| @layer 導入で !important が逆転          | 既存 !important が最高優先になりレイアウト崩壊       | 移行前に `grep -r '!important'` で件数を把握し、件数が多い場合は @layer 戦略を見直す                          |
| 新コンポーネントが旧変数を無意識に参照   | AI エージェントが globals.css を参照して旧変数を使う | Stylelint の `declaration-strict-value` でコンポーネント CSS に旧変数参照が入ったら CI が fail するようにする |
| ダーク未定義のままデプロイ（今回の事故） | 新トークンのダーク値がなく flash が発生              | B-3 完了を D-1 移行の前提条件（ゲート）とする                                                                 |

### 4-5. Stylelint による機械的強制（旧変数の新コンポーネント参照を防ぐ）

既存リサーチ（docs/research/2026-04-26-cycle-169-research-synthesis-for-design-system.md §B-4）で言及した Stylelint 設定を design-system コンポーネント専用に適用する：

```json
// .stylelintrc.json（design-system コンポーネント向け）
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "background-color", "border-color", "outline-color"],
      {
        "ignoreVariables": true,
        "ignoreValues": ["transparent", "inherit", "currentColor", "none"]
      }
    ]
  }
}
```

`--color-text` のような旧トークンも変数名なので `ignoreVariables: true` では許可されてしまう点に注意。`disallowedVariables` オプションまたはカスタムルールで旧変数名パターンを明示的に禁止する必要がある。

---

## 5. 是正タスク群の受け入れ基準まとめ

### B-3（ダークモード）受け入れ基準

- [ ] `:root.dark` に design-system トークン全て（Surface 5 階調・Text 5 階調・Border 2 種・Accent/Status 各 3 段）が定義されていること
- [ ] ライト・ダーク両方で以下のコントラスト比を WebAIM Contrast Checker で確認済みであること
  - `--fg` on `--bg`: 4.5:1 以上
  - `--fg-soft` on `--bg`: 4.5:1 以上
  - `--fg-softer` on `--bg`: 4.5:1 以上（caption 用。大きいテキストなら 3:1 でも可）
  - `--accent` が focus ring に使われる場合、`--bg` との変化コントラスト 3:1 以上
  - `--accent` on `--bg`: テキストに使う場合 4.5:1 以上
- [ ] `:root` と `:root.dark` 両方に `color-scheme: light` / `color-scheme: dark` が設定されていること
- [ ] ダークモード時に `--accent` が光学バイブレーションを起こしていないこと（目視確認）
- [ ] axe-core の color-contrast ルールが CI（GitHub Actions）でライト・ダーク両方に対して pass すること

### C-2（SRP 分解）受け入れ基準

- [ ] `ArticleArea` が「ページ最上位コンテナ」のみを責任とし、各セクション（Header/Main/HowTo/Related）が独立コンポーネントになっていること
- [ ] 各コンポーネントが `__tests__/` で単体テスト可能であること（他コンポーネントに依存しない）
- [ ] ツール固有のコンテンツを `ArticleArea.Main` 相当のスロットに差し込めること
- [ ] TypeScript 型でコンポーネント間の不正な組み合わせが防止されていること

### E-1（モバイル対応）受け入れ基準

- [ ] 全 design-system コンポーネントが 375px ビューポートで水平スクロールを起こさないこと
- [ ] インタラクティブ要素（Button, Link, Input）のタップターゲットが 44×44px 以上であること
- [ ] フォントサイズがインタラクティブ要素で 16px 以上であること（iOS Safari 自動ズーム防止）
- [ ] Playwright テストに `mobile-sm: 375px` プロジェクトが追加され、スナップショットテストが pass すること
- [ ] `@media (min-width: 640px)` 以上でレイアウトが適切に拡張されること（縦積み → 横並び等）

### D-1（移行戦略）受け入れ基準

- [ ] design-system コンポーネントのスタイルに `--color-*` 旧変数参照が 0 件であること（Stylelint で確認）
- [ ] 既存ページで使用中の旧スタイルが design-system コンポーネントの追加により崩れていないこと
- [ ] 移行フェーズ（1〜4）の定義と「フェーズ 3 に進む条件」が文書化されていること
- [ ] B-3（ダーク値定義）が完了してから D-1 移行ゲートを開くことが明示されていること

---

## 参考資料

- OKLCH 色空間の解説: [Evil Martians - OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- OKLCH アクセシブルパレット: [LogRocket - OKLCH Consistent Accessible Color Palettes](https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes)
- next-themes 公式: [github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)
- color-scheme と prefers-color-scheme の使い分け: [web.dev - color-scheme](https://web.dev/articles/color-scheme)
- WCAG 2.4.13 Focus Appearance: [W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- axe-core: [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core)
- pa11y: [github.com/pa11y/pa11y](https://github.com/pa11y/pa11y)
- get-contrast npm: [github.com/johno/get-contrast](https://github.com/johno/get-contrast)
- Headless Component パターン: [Martin Fowler](https://martinfowler.com/articles/headless-component.html)
- Radix UI Composition: [radix-ui.com/primitives/docs/guides/composition](https://www.radix-ui.com/primitives/docs/guides/composition)
- Compound Component（shadcn/ui）: [Vercel Academy](https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition)
- レスポンシブデザインの基本ルール: [Polypane 2024](https://polypane.app/blog/responsive-design-ground-rules/)
- WCAG 2.5.5 タップターゲット: [CSS-Tricks](https://css-tricks.com/looking-at-wcag-2-5-5-for-better-target-sizes/)
- Playwright モバイルエミュレーション: [playwright.dev/docs/emulation](https://playwright.dev/docs/emulation)
- CSS Cascade Layers ガイド: [CSS-Tricks](https://css-tricks.com/css-cascade-layers/)
- Cascade Layers をデザインシステムに適用: [CSS-Tricks](https://css-tricks.com/organizing-design-system-component-patterns-with-css-cascade-layers/)
- 既存プロジェクトへの Cascade Layers 導入: [Smashing Magazine](https://www.smashingmagazine.com/2025/09/integrating-css-cascade-layers-existing-project/)
- ダークモードの彩度問題: [atmos.style](https://atmos.style/blog/dark-mode-ui-best-practices)
- ダークモード Design Systems: [Muzli](https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/)
