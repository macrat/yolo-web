---
title: /blog/[slug] バグ修正判断材料：視覚・a11y・テスト品質のベストプラクティス調査
date: 2026-05-13
purpose: cycle-189 で /blog/[slug] の視覚バグ・a11y バグ・テスト品質バグ計10件を修正する際の方針判断に使う技術情報を収集する
method: WebSearch（NNGroup・MDN・CSS-Tricks・GitHub Discussion・Vitest公式等）+ WebFetch（各一次ソース本文の確認）
sources:
  - https://www.nngroup.com/articles/table-of-contents/
  - https://www.nngroup.com/videos/mobile-table-of-contents/
  - https://www.joshwcomeau.com/css/full-bleed/
  - https://web.dev/articles/css-subgrid
  - https://github.com/vitest-dev/vitest/discussions/2213
  - https://runthatline.com/how-to-mock-window-with-vitest/
  - https://gist.github.com/tkrotoff/52f4a29e919445d6e97f9a9e44ada449
  - https://www.w3.org/TR/WCAG-TECHS/C18.html
  - https://www.w3.org/WAI/standards-guidelines/act/rules/6cfa84/
  - https://www.browserstack.com/guide/test-cases-for-pagination-functionality
  - https://tech-champion.com/design/centering-flex-container-items-with-scrolling-a-css-solution/
---

# /blog/[slug] バグ修正判断材料：視覚・a11y・テスト品質のベストプラクティス調査

cycle-189 での10件修正に向けた設計判断材料。各項目は結論と根拠を簡潔にまとめる。

---

## 1. SP モバイルでの目次（TOC）レイアウトの推奨パターン

**結論: `<details>` 折りたたみを記事本文直前に置く。本文の前に視覚的に分離して配置する。**

- NN/Group の調査（2024）では、モバイルでは左レールが使えないため、TOC は本文中（ヘッダー直下・本文直前）に置くのが最も普及したパターン。ただし短いイントロでも fold 下に追いやられることを防ぐため、`<details>` で折りたたむのが 2025 年現在の主流。
- `<details>` + `<summary>` は 2020 年以降全主要ブラウザで対応済み。JS 不要でアクセシブルなアコーディオンとして機能し、スクリーンリーダーは `summary` を button として扱う。
- 「TOC が記事本文の一部に見える」誤読を防ぐ設計原則: NN/Group は「TOC を囲む視覚的ボーダーはバナー盲を引き起こすリスクがある」と指摘しており、枠線よりも背景色の差・余白・ラベル（"この記事の目次"等）で分離する方が適切。TOC を `<nav aria-label="目次">` で意味的に分離することで構造上も区別できる。
- sticky + 折りたたみパターンは「多くのユーザーが気づかない」という調査結果があるため、没入型読者には避けたほうが無難。

---

## 2. CSS Grid + ヘッダーの中央寄せ・左端整列

**結論: 3カラム Grid（`1fr min(N, 100%) 1fr`）で本文列を固定し、ヘッダーも同列に割り当てるのが最もシンプルで確実。**

- Josh W. Comeau の full-bleed テクニック（CSS-Tricks でも紹介）: `grid-template-columns: 1fr min(42rem, 100%) 1fr` で中央列を作り、全要素に `grid-column: 2` を付与するだけでヘッダー左端と本文左端が自動的に一致する。full-bleed 要素は `grid-column: 1 / -1` で全幅に拡張できる。
- Subgrid は 2024 年に全主要ブラウザが対応し（Chrome 117+, Firefox 71+, Safari 16+）、caniuse 2025 時点で約 97%。ネストされたグリッドが親の列トラックを継承できるため、サイドバー + 本文の内部 Grid でも親の列線を参照できる。
- ヘッダーとコンテンツグリッドが別のコンテナにある場合は、CSS custom property（`--content-width`等）で幅を共有するか、共通の親に Grid を定義して両方を同じ列に入れる設計が現代的推奨。
- `max-width: 1200px; margin: 0 auto` + 内部 Grid という旧来構成では、ヘッダーを同じコンテナに含めないと左端が一致しない問題が起きやすい。Subgrid または共通 Grid への統合が根本解。

---

## 3. mermaid 図表の `display: flex` と `overflow-x` の併用

**結論: ラッパーに `overflow-x: auto` + `max-width: 100%` を付与し、`display: flex; justify-content: center` でセンタリング。ただし flex のみでは overflow が効かない場合があるため SVG 直接に `min-width` を設定しない。**

- flex コンテナで `justify-content: center` と `overflow-x: auto` を同時に使う場合、flex item が縮まない（`flex-shrink: 0` や固定幅 SVG）と overflow が正常に発動しないことがある。実績のあるパターンは以下:

```css
.mermaid-wrapper {
  overflow-x: auto;
  max-width: 100%;
}
.mermaid-wrapper svg {
  display: block;
  margin: 0 auto; /* flex 不使用でセンタリング */
}
```

- `display: flex; justify-content: space-around; overflow-x: auto` も有効だが、flex item に `min-width: max-content` 等が必要な場合がある。
- Next.js + Mermaid の実践例では「`overflow-x: auto` + `max-width: 100%` の3行 CSS」が複雑な JS ソリューション（700行超）を置き換えた事例あり。シンプルな CSS が優先される。
- `display: flex` を使う場合は flex item が `flex-shrink: 0` になっていることを確認しないと、幅広の図が縮んでつぶれる。

---

## 4. placeholder span への aria-hidden の妥当性

**結論: `aria-hidden="true"` を付けた空 span はレイアウト目的なら許容されるが、CSS Grid の空セルで代替する設計の方が望ましい。**

- WCAG C18 テクニック（2024 現在も有効）: スペーサー画像・スペーサー要素は CSS の margin/padding/gap に置き換えることが推奨。HTML にレイアウト専用の空要素を残すこと自体が非推奨。
- W3C ACT Rules: `aria-hidden="true"` を付けた要素がフォーカス順序に含まれないことが前提条件。空 span でフォーカスを受けない場合は WCAG 4.1.2 違反にならないが、スクリーンリーダーの verbosity（冗長な読み上げ）を増やす可能性がある。
- 推奨: Grid の `justify-content: space-between` や `grid-template-columns` で前・次ボタンを両端に配置し、span を不要にするのが最もクリーンな解。「前の記事がない」状態では `visibility: hidden` または CSS の `grid-area` で空セルを作る方が HTML を汚さない。
- `aria-hidden` を付けた空 span は「許容できる応急処置」であって、現代の推奨 first-choice ではない。

---

## 5. ハードコード件数検証 vs リダイレクト動作検証の責務分離

**結論: ページネーションの E2E・結合テストに「総ページ数」をハードコードしない。件数依存ロジックは単体テストに分離する。**

- BrowserStack のページネーションテストガイド: 「総ページ数はデータセットサイズ ÷ ページあたり件数で計算される値と一致すること」を確認するべきで、数値そのものをハードコードすると、記事が追加・削除されるたびにテストが壊れる（brittle test）。
- 責務分離の原則:
  - **単体テスト**: 計算ロジック単体（例: `getTotalPages(totalItems, perPage)` が正しい値を返すか）を固定値で検証する。
  - **結合・統合テスト**: ページ遷移・リダイレクト・UI の挙動（「最終ページの next ボタンが disabled になるか」等）を検証する。この層に「現在の記事総数」を埋め込まない。
  - **E2E テスト**: モックデータを使い、件数は fixture 側で管理する。
- Vitest 文脈では `test.each` に fixture 配列を渡して件数依存を外部化するか、計算関数を独立した unit test ファイルに切り出すのが現代的パターン。

---

## 6. `Object.defineProperty(window, 'location')` の代替

**結論: Vitest + jsdom では `vi.spyOn(window.location, 'reload')` が最優先。`href` や `assign` を差し替える場合は `Object.defineProperty` with `{ writable: true, configurable: true }` が現時点でも標準的。`vi.stubGlobal` は window 全体の差し替えには使えるが location プロパティ単体には不向き。**

- **`vi.spyOn(window.location, 'reload')`**: jsdom が `reload` を書き換え可能にしているため、最もシンプルかつ副作用が少ない。`restoreMocks: true` 設定で自動リセットされる。
- **`Object.defineProperty(window, 'location', { value: mockObj, writable: true, configurable: true })`**: jsdom 最新版は location オブジェクトを厳格に制御しており、`configurable: true` が必須。ブラウザモード（Playwright）では "Cannot redefine property" エラーになるため注意。
- **`vi.stubGlobal`**: `vi.stubGlobal('location', { href: '...' })` は window.location をオブジェクトごと差し替えるため location の他プロパティが失われる可能性あり。単純なケースに限定して使用。
- **`vitest-location-mock`** (npm package by labd): jsdom での window.location モックを安全に扱う専用パッケージ。チームで統一ルールとして採用する場合に有効。
- **推奨フロー**: `reload` 等の個別メソッドは `vi.spyOn`、`href` の書き換え検証が必要なら `Object.defineProperty` with configurable、テスト後は必ず `vi.restoreAllMocks()` または `beforeEach` でリセット。
