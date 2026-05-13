---
title: details/summary アフォーダンスと CSS 中央寄せ水平不整合 ベストプラクティス調査
date: 2026-05-13
purpose: cycle-189 完了処理で発見した2件のバグ（details/summary の折りたたみ非認知 / 中間幅での左寄れ）の修正方向を判断するための技術情報収集
method: Web検索（details summary WCAG affordance、CSS max-width centering alignment、full-bleed grid layout）、scottohara.me・web.dev・joshwcomeau.com の一次資料参照
sources:
  - https://www.scottohara.me/blog/2022/09/12/details-summary.html
  - https://web.dev/learn/html/details
  - https://www.joshwcomeau.com/css/full-bleed/
  - https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Grid_wrapper
  - https://css-tricks.com/snippets/css/complete-guide-grid/
---

# details/summary アフォーダンスと CSS 中央寄せ水平不整合 ベストプラクティス調査

## 1. `<details>` / `<summary>` の折りたたみアフォーダンス

### ブラウザ標準マーカーの挙動と差異

ブラウザ標準の `<details>` は `<summary>` を `display: list-item` で描画し、`::marker` 疑似要素として ▶（閉）/ ▼（開）の三角形を表示する。ただし各ブラウザ間に以下の差がある。

- **Chromium (Chrome/Edge)**: `::marker` での CSS スタイリングが有効。`find-in-page` 検索がヒットすると `details` を自動展開する。Chrome 129+ では `interpolate-size: allow-keywords` を使えばネイティブ高さアニメーションが可能。
- **Safari**: `::marker` は無効。スタイルを上書きするには非標準の `summary::-webkit-details-marker` が必要。`find-in-page` で自動展開しない。キーボードフォーカス順から `details` を除外する挙動がある。
- **Firefox**: `::marker` は Firefox 68+ で有効。`find-in-page` で自動展開しない。スクリーンリーダーとの組み合わせで「black pointing small triangle」等の文字列がアクセシブルネームに混入する既知問題がある。

### 2026 年現在の主流デザインパターン

目次・折りたたみ用途では以下の選択肢が並立している。いずれも「見えている要素がクリック可能であることを示す」ことが共通の原則。

**A. 標準マーカーをそのまま使う**
追加実装ゼロ。Chromium では `::marker` でサイズ・色を調整可能。Safari のみ `-webkit-details-marker` を併記する必要がある。装飾を抑えたいサイト（「道具」コンセプト等）に適合しやすい。

**B. 標準マーカーを消して `::before` / `::after` でカスタムアイコンを置く**
Chevron（›/‹ や ∨/∧）を使う実装が多い。`details[open] > summary::before` セレクタで方向を切り替える。視覚的統一性は高いが、マーカーを除去するとスクリーンリーダーへの状態通知が不安定になるリスクがある（後述）。

**C. 「目次を開く」のような明示的テキストラベル**
アイコンに頼らず「目次を開く / 閉じる」とテキストを変える方法。JavaScriptが必要。アフォーダンスとして最も明示的だが、実装コストが増す。

### WCAG / aria-\* 観点での注意点

web.dev および Scott O'Hara の調査によると、ネイティブ `<details>` はそのまま使う場合（マーカーを削除しない限り）、`aria-expanded` を追加しなくても `open` 属性が DOM に反映されるため**技術的には冗長**とされる。ただし以下の場合は追加が必要になる。

- カスタムアイコンを置くためにデフォルトマーカーを `display: none` で消した場合: VoiceOver・JAWS・NVDA が「展開/折りたたみ」状態を一貫してアナウンスできなくなる。この場合 `<summary>` に `aria-expanded` を明示する。
- `role="button"` を `<summary>` に付与すると macOS Safari でアクセシブルな展開状態が消えるため、**`role="button"` の付与は避ける**。

WCAG 2.2 の観点では SC 4.1.2（Name, Role, Value）に関連し、折りたたみ可能であることとその状態が判定できることが求められる。ネイティブ `<details>` は仕様上これを満たすが、スタイル変更時にアクセシビリティが壊れやすい点を認識しておく。

### 目次・ナビゲーション用途での視覚的ベストプラクティス

「閉じている」ことを即座に伝えるためには次のいずれかまたは組み合わせが有効。

1. **方向の変化するマーカー**: ▶（閉）→ ▼（開）の方向変化はユーザーが最も直感的に理解しやすい慣習的なパターン。
2. **「目次」「この記事の内容」等のラベル文字**: アイコン単独より理解しやすい。
3. **ホバー時の色変化 / カーソル変化**: `cursor: pointer` + フォーカスリングは操作可能性を伝える最低ラインとして必須。
4. **開いた状態と閉じた状態の視覚的コントラスト**: 境界線・背景色の有無で状態を示す手法も有効。

過剰装飾を避けるコンセプトのサイトでは A（標準マーカーを活かしつつ `::marker` でサイズ・色のみ調整）が最も低コストで原則に沿う。

---

## 2. CSS Grid + max-width コンテンツの中間幅左寄せ問題

### 現象の原因

`max-width + margin: 0 auto` による中央寄せは、コンテナが max-width を下回ると `margin: auto` が機能して中央に配置されるが、**ヘッダーと本文が異なる `padding` や異なる `max-width` を個別に持っている場合**、中間幅（例: 768〜1023px）で水平方向の基準線がズレて片側が寄って見える。

具体的に多い原因は次の2パターン。

**パターン A: padding の値が要素ごとに異なる**
ヘッダーが `padding: 0 1.25rem` で本文が `padding: 0 2rem` など異なると、同じ `max-width` でも内容の開始位置がズレる。`max-width` 未満の幅では `margin: auto` の対称性でコンテナ自体は中央にあるが、内部コンテンツの左端がヘッダーと本文で一致しない。

**パターン B: max-width の値が要素ごとに異なる**
ヘッダーが `max-width: 1200px`、本文が `max-width: 960px` 等の不一致があると、ブレークポイント未満では本文がより左に寄ったように見える。

### 回避策・根本解パターン

以下の方法が現代の根本解として認識されている。どれを選ぶかはプロジェクトの既存構造による。

**A. 共通ラッパーで一括管理（最もシンプル）**
ヘッダー・本文・フッターを同一の `.wrapper` クラスで包み、`max-width` と `padding-inline` を一箇所で定義する。サイト全体で1つの数値を変えるだけで統一できる。

```css
.wrapper {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 1.25rem;
}
```

各セクションが `.wrapper` を子要素として持つか、`.wrapper` を適用するかを統一することで水平基準線が揃う。

**B. CSS Grid フルブリード レイアウト（Josh W. Comeau パターン）**
ページ全体を単一の Grid 親で管理し、3カラム構造 `1fr min(コンテンツ幅, 100%) 1fr` でコンテンツを中央カラムに配置する。ヘッダーも同じ Grid 親の子要素とすることで、すべての要素が同一の中央カラムに収まり、不整合が原理的に発生しない。全幅要素は `grid-column: 1 / -1` で実現。

```css
.page {
  display: grid;
  grid-template-columns: 1fr min(1200px, 100%) 1fr;
}
.page > * {
  grid-column: 2;
}
.full-bleed {
  grid-column: 1 / -1;
}
```

**C. CSS カスタムプロパティで一元化**
`--content-width` と `--content-padding` をルートに定義し、ヘッダー・本文すべてで参照する。値の変更が1箇所で完結し、ズレが起きにくい。

```css
:root {
  --content-width: 1200px;
  --content-padding: 1.25rem;
}
.header-inner,
.content-inner {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
}
```

### ヘッダーと本文の padding 不整合が起きやすいパターン

`padding: 0 1.25rem` を持つヘッダーと、別の `padding` を持つ本文コンテナが**それぞれ独立した max-width コンテナ**として存在している場合に起きる。修正方針は「どちらかに合わせる」か「共通変数を導入して両方を同じ値に統一する」の2択になる。Grid 親に束ねるアプローチ（B）を取れば padding の管理も1箇所で済む。

### 関連する補足

- `box-sizing: border-box` がグローバルに設定されていない場合、`padding` が幅に加算されて見かけ上の幅がズレる原因になる。モダンリセット CSS（`*, *::before, *::after { box-sizing: border-box; }`）が前提となっている確認が必要。
- Container Queries（2025年時点で利用率 41%）を使えばコンテナサイズ基準で Grid カラム数を切り替えられるため、ビューポート幅の `@media` に依存するパターンよりズレが減る。ただし既存コードの変更規模が大きくなる。
