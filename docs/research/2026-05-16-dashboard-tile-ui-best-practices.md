---
title: ダッシュボード型タイル UI ベストプラクティス調査（cycle-193 計画立案用）
date: 2026-05-16
purpose: cycle-193 Phase 7 第 1 弾の基盤再構築に向けた CSS Grid タイル設計・DnD 実装・編集モード UX・A11y・「詳細ページ = タイル設置場所」設計パターンの調査
method: |
  - WebSearch（CSS Grid dashboard tile layout / dnd-kit 2026 / WCAG 2.5.5 / bento grid / iOS jiggle / react-grid-layout mobile / container queries）
  - WebFetch（dndkit.com 公式ドキュメント / pkgpulse.com 比較記事 / iamsteve.me bento CSS / orbix.studio bento design）
  - Google Analytics GA4 レポート（デバイス別セッション）
  - yolo-web コードベース確認（tile-loader.ts / types.ts / design-migration-plan.md）
sources:
  - https://dndkit.com/
  - https://dndkit.com/api-documentation/sensors/touch
  - https://dndkit.com/react/guides/sensors/
  - https://www.pkgpulse.com/blog/dnd-kit-vs-react-beautiful-dnd-vs-pragmatic-drag-drop-2026
  - https://iamsteve.me/blog/bento-layout-css-grid
  - https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics
  - https://css-tricks.com/preventing-a-grid-blowout/
  - https://evanminto.com/blog/intrinsically-responsive-css-grid-minmax-min/
  - https://mastery.games/post/tile-layouts/
  - https://github.com/atlassian/react-beautiful-dnd/issues/2672
  - https://github.com/clauderic/dnd-kit/discussions/1842
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
  - https://developer.android.com/design/ui/wear/guides/m2-5/surfaces/tiles-principles
  - https://developer.apple.com/documentation/widgetkit/widgetfamily
  - https://github.com/react-grid-layout/react-grid-layout/issues/314
  - https://www.ilert.com/blog/building-interactive-dashboards-why-react-grid-layout-was-our-best-choice
  - https://react-spectrum.adobe.com/blog/drag-and-drop.html
  - https://developer.chrome.com/blog/reading-order
  - https://medium.com/@vyakymenko/css-2025-container-queries-and-style-queries-in-real-projects-c38af5a13aa2
---

# ダッシュボード型タイル UI ベストプラクティス調査

## 調査の前提情報

### GA4 デバイス別セッション（2026-04-16〜2026-05-15、直近 30 日）

| デバイス | セッション | アクティブユーザー | 割合（セッション） |
| -------- | ---------- | ------------------ | ------------------ |
| desktop  | 196        | 127                | 64.5%              |
| mobile   | 106        | 69                 | 34.9%              |
| tablet   | 2          | 2                  | 0.7%               |
| smart tv | 1          | 1                  | 0.3%               |

**重要な補足**: 現状はデスクトップが過半数を占める。ただしこれは yolos.net が現在「占い・診断パーク」からの移行期であり、現行コンテンツが検索経由のロングテール流入（漢字辞典・四字熟語等）中心であるためと推測される。「日常の傍にある道具」としてのツール群が Phase 7 で整備されれば、スマートフォンユーザー比率が上昇する可能性が高い。**モバイルを二等市民扱いにしない設計が不可欠**。

---

## A. CSS Grid を使ったタイルサイズ規格設計

### A-1. 一般的なベストプラクティス

#### 基本グリッド構造

2026 年現在、ダッシュボード型タイル UI（bento grid とも呼ばれる）のデファクトは **CSS Grid + `grid-column: span N` / `grid-row: span N` 方式**。Flexbox との主な違いは「縦横 2 次元の制御が 1 つの親要素で完結する」点であり、タイルが縦横にまたがる配置（2×2 等）は CSS Grid なしには実現が難しい。

```css
/* 基本構造 */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* PC: 4列 */
  grid-auto-rows: var(--cell-size); /* 1セルの高さ */
  gap: 16px;
}

/* タイルサイズ指定 */
.tile-small {
  grid-column: span 1;
  grid-row: span 1;
} /* 1×1 */
.tile-medium {
  grid-column: span 2;
  grid-row: span 1;
} /* 2×1 */
.tile-large {
  grid-column: span 2;
  grid-row: span 2;
} /* 2×2 */
.tile-full {
  grid-column: 1 / -1;
} /* 全幅 */
```

「大きいタイル = 重要なコンテンツ」の原則（Orbix Studio, 2026 確認）。タイルのサイズはコンテンツ量ではなく**重要度・頻度使用度**で決める。

#### 行高の設定戦略

**方式 1: `grid-auto-rows` で固定セルサイズ（+ aspect-ratio）**

```css
--cell-size: 160px;
grid-auto-rows: var(--cell-size);
```

- メリット: 1×1 が常に正方形、レイアウトの予測可能性が高い
- デメリット: コンテンツが多いタイルで溢れるリスク、モバイルで無駄な空白が生まれやすい

**方式 2: `grid-auto-rows: 1fr` で等高行（大画面限定）**

```css
@media (min-width: 1024px) {
  grid-auto-rows: 1fr;
}
/* モバイルは行高を content-based に（高さ指定なし） */
```

iamsteve.me (2026 確認) が採用するパターン。大画面では等高行で整列し、モバイルでは行高を content に委ねる。

**方式 3: `aspect-ratio` をタイルに付与**

```css
.tile-small {
  aspect-ratio: 1 / 1;
}
.tile-medium {
  aspect-ratio: 2 / 1;
}
.tile-large {
  aspect-ratio: 1 / 1;
} /* 2×2の場合は列幅×2が高さの基準 */
```

コンテナクエリ時代の推奨。container に `aspect-ratio` を設定することで画像サイズ調整の精度が上がる。

#### コンテナクエリの活用（2026 年現在 全主要ブラウザ対応）

```css
.tile {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .tile-content {
    flex-direction: row;
  }
}
```

Viewport media query ではなく container query を使うことで、同じタイルコンポーネントが「サイドバー内の 1×1」でも「メイン領域の 2×2」でも適切にレンダリングできる。**詳細ページ = large-full タイル設置場所**の設計に直結するため、yolos.net では積極採用を推奨。

### A-2. レスポンシブ対応と縮退ルール

#### 標準的なブレークポイント戦略

| 画面幅      | 列数       | 想定デバイス         |
| ----------- | ---------- | -------------------- |
| 1200px+     | 4列        | PC                   |
| 768〜1199px | 3列        | タブレット           |
| 480〜767px  | 2列        | スマートフォン（横） |
| 〜479px     | 2列 or 1列 | スマートフォン（縦） |

```css
.grid {
  grid-template-columns: repeat(4, 1fr);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr; /* または repeat(2, 1fr) */
  }
}
```

#### 大タイルの縮退ルール（3案比較）

cycle-191/192 で発生した「モバイル 360px 幅で 201px 横はみ出し」は large タイル（span 2）がグリッド列数（1 列）を超えたことが原因。

**案 1: メディアクエリで span を上書き（推奨）**

```css
@media (max-width: 480px) {
  .tile-large {
    grid-column: span 1; /* 2→1 に縮退 */
    grid-row: span 1; /* または span 2 で縦長維持 */
  }
}
```

- メリット: シンプル、コンポーネント内で完結
- デメリット: レイアウト情報がコンポーネントとグリッド両方に分散

**案 2: `min()` を使った自動縮退（メディアクエリ不要）**

```css
.tile-large {
  grid-column: span min(2, var(--grid-cols, 4));
}
```

CSS Spec level では実現可能だが、`var()` を `span` 内の `min()` で使う組み合わせのブラウザサポートが 2026 年現在不安定。実務では案 1 + メディアクエリが安全。

**案 3: グリッド側でスパン超過を無視させる（`grid-auto-flow: dense` との組み合わせ）**

グリッド列数が足りない場合、CSS Grid は暗黙的にタイルを次行に送る仕様があるが、span が列数を超えると **タイル全体が暗黙的列を新規生成して横に伸びオーバーフローを引き起こす**（cycle-191/192 の失敗原因）。これは案 3 では解決しない。

**結論**: 案 1（メディアクエリで span 上書き）が現時点で最も確実。`@container` クエリが普及すればコンテナ幅ベースの縮退が可能になり、案 1 と同等の安全性を持つ。

#### `auto-fit` / `auto-fill` + `minmax()` による宣言的レスポンシブ

```css
.grid {
  /* メディアクエリなしで 360px〜PC まで自動調整 */
  grid-template-columns: repeat(auto-fill, minmax(min(160px, 100%), 1fr));
}
```

`min(160px, 100%)` の効果: 1 列グリッドでは `100%` が採用され overflow しない（CSS-Tricks / Evan Minto 2026 確認）。ただし**タイルの span 数が変わらない**ため、2×2 タイルの span 縮退には別途対処が必要。

### A-3. `aspect-ratio` vs `flex-grow` の選択基準

| 観点                                     | aspect-ratio           | flex-grow (可変高さ)                     |
| ---------------------------------------- | ---------------------- | ---------------------------------------- |
| 正方形タイル維持                         | 得意                   | 不得意（コンテンツ量次第で高さが変わる） |
| コンテンツ量が一定でないタイル           | 溢れリスクあり         | 自然に伸縮                               |
| レイアウトの CLS（累積レイアウトシフト） | 低い（高さが事前確定） | 高い（非同期データロード時）             |
| ツール・ウィジェット型タイル             | 推奨                   | 不適                                     |

**yolos.net 推奨**: `grid-auto-rows` + `aspect-ratio` の組み合わせを基本とし、コンテンツが可変長になるタイル（例: テキスト結果表示系）のみ `min-height` で最低高さを保証した上で可変にする。

---

## B. DnD 実装ベストプラクティス

### B-1. 2026 年現在のライブラリ状況

#### react-beautiful-dnd

**2026 年現在: 非推奨・廃止済み**（GitHub Issue #2672 で Atlassian が公式に廃止を宣言）。npm インストール時にコンソール警告が表示される。React 19 との互換性は不確かで、新規プロジェクトで採用すべきではない。フォーク版 `@hello-pangea/dnd` が React 18 以降のサポートを引き継いでいるが、あくまでコミュニティフォーク。

#### @dnd-kit/core + @dnd-kit/sortable

**2026 年現在: デファクトスタンダード**（pkgpulse.com 2026 確認）。

- 週間 DL: 約 280 万（2026 年時点）
- TypeScript ファースト、モジュラーアーキテクチャ
- アクセシビリティ: スクリーンリーダー対応・ARIA 属性・キーボードナビゲーションが標準装備
- 新世代 API: `@dnd-kit/react` パッケージ（`DragDropProvider` + `PointerSensor` + `KeyboardSensor`）が開発中・公開済み（GitHub Discussion #1842 で確認）
- グリッドソート: `@dnd-kit/sortable` の `rectSortingStrategy` でグリッド並び替えが実装可能
- モディファイア: `@dnd-kit/modifiers` で snap-to-grid・軸ロック・親要素制限が実装可能

**注意点**: dnd-kit はグリッドレイアウトロジック（座標→列行変換）を自分で実装する必要がある。公式 Discussion #1560 で「react-grid-layout のようなグリッドは dnd-kit で作れるか」が議論されており、「作れるが追加実装が必要」という回答が多い。

#### react-grid-layout

- 週間 DL: 約 160 万（2026 年時点）
- DnD + リサイズ + レスポンシブブレークポイントが一体になった専用ライブラリ
- **iOS でのドラッグ問題**: `react-draggable`（内部依存）の iOS ドラッグでページスクロールとの競合（Issue #314, #406 等）が報告されており、2025 年時点でも未解決の既知バグが複数存在
- **リサイズ機能が必要な場合の第一候補**
- ilert 社（2025 年事例）が採用。ダッシュボードツール（Datadog 等）が採用する実績あり

#### Pragmatic Drag and Drop（Atlassian）

- Jira / Confluence / Trello が依存する内製ライブラリとして OSS 公開
- コミュニティフットプリントが dnd-kit より小さい
- アクセシビリティ: 自分で構成する必要あり（dnd-kit より工数が増える）
- yolos.net では不採用を推奨

### B-2. yolos.net 初期推奨

**Phase 7 第 1 弾（タイル表示の基盤再構築）: dnd-kit を採用**

理由:

1. Phase 9.2 の道具箱公開時点ではリサイズ機能が不要（タイルのリサイズは Phase 9 以降の判断事項）
2. react-grid-layout の iOS touch バグは yolos.net のモバイルユーザーに直撃するリスク
3. dnd-kit のアクセシビリティ装備が constitution Rule 2（来訪者に有益・無害）に合致
4. TypeScript ネイティブで yolos.net の型安全方針と整合

### B-3. モバイルタッチ対応

```javascript
// @dnd-kit/react の新 API による推奨設定
PointerSensor.configure({
  activationConstraints(event) {
    if (event.pointerType === "touch") {
      // タッチ: 250ms 長押し後にドラッグ開始（スクロールとの競合回避）
      // tolerance 5px: わずかな指の揺れでキャンセルしない
      return [
        new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 }),
      ];
    }
    // マウス・ペン: 5px 移動で即座にドラッグ開始
    return [new PointerActivationConstraints.Distance({ value: 5 })];
  },
});
```

CSS 側の必須設定:

```css
.draggable-tile {
  touch-action: manipulation; /* ズーム等の OS デフォルト動作を抑制 */
}

.drag-handle {
  touch-action: none; /* ドラッグハンドルはスクロールも無効化 */
}
```

**ハンドルを設けることを強く推奨**。タイル全体を `touch-action: none` にするとスクロールが妨害されるため、ドラッグ専用のハンドル要素に絞って `touch-action: none` を適用する。

### B-4. グリッド吸着 / プレビュー / 順序入れ替えパターン

| パターン                      | 説明                                           | 向いているシナリオ                       |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------- |
| 隙間挿入（list-style insert） | ドラッグ中に他タイルがスライドしてスペース確保 | 1 次元リスト・カード列                   |
| 位置交換（swap）              | ドラッグ先のタイルと入れ替え                   | 2 次元グリッド（タイルサイズが均一）     |
| 自由配置 + snap-to-grid       | 座標ベースで配置し Grid にスナップ             | タイルサイズが異なる複雑なダッシュボード |

yolos.net の Phase 9 ダッシュボードでは「タイルサイズが異なる」要件があるため、**自由配置 + snap-to-grid（`@dnd-kit/modifiers` の `createSnapModifier`）**が最終的な目標となるが、Phase 7 基盤再構築では「隙間挿入（`rectSortingStrategy`）」から始めて Phase 9 で昇格させる段階的アプローチが現実的。

---

## C. 編集モード UX

### C-1. 「編集モード中」の視覚伝達方法比較

| プラットフォーム              | 視覚手法                                                               | 技術手法                                                        |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| iOS ホーム画面（jiggle mode） | アイコンが小刻みに揺れる（連続）＋ 削除バッジ（×）が現れる             | CSS animation: rotate -1.5deg〜1.5deg, 0.15s infinite alternate |
| iPadOS ウィジェット           | 同上 + リサイズハンドルが表示                                          | 同上                                                            |
| Android ホーム画面            | ドラッグで浮き上がる（elevation shadow）+ 削除ゾーン表示               | CSS transform: scale(1.05) + box-shadow                         |
| Windows スタートメニュー      | タイルにコンテキストメニューが出るが「全体が編集モード」の視覚演出なし | —                                                               |
| Notion データベース           | 列・行が選択ハイライト。ページ全体の編集モードはない                   | —                                                               |
| Datadog / Grafana             | 明示的な「Edit」ボタン → ヘッダー色変化 + タイル周囲に破線ボーダー     | CSS border-style: dashed                                        |

#### iOS jiggle の CSS 実装

```css
@keyframes jiggle-a {
  0%,
  100% {
    transform: rotate(-1deg);
  }
  50% {
    transform: rotate(1.5deg);
  }
}

@keyframes jiggle-b {
  0%,
  100% {
    transform: rotate(1deg);
  }
  50% {
    transform: rotate(-1.5deg);
  }
}

.edit-mode .tile:nth-child(odd) {
  animation: jiggle-a 0.15s ease-in-out infinite;
  transform-origin: 50% 10%;
}
.edit-mode .tile:nth-child(even) {
  animation: jiggle-b 0.15s ease-in-out infinite;
  transform-origin: 30% 5%;
  animation-delay: 0.05s;
}
```

`animation-delay` に微小な差を付けて「すべてが同期して揺れる機械的な見た目」を避けることが重要（kirupa.com 確認）。CSS では完全なランダム性は出せないため、nth-child で複数のアニメーションパターンを使うのがデファクト。

**yolos.net 推奨**: iOS jiggle + タイル周囲の破線ボーダー（Grafana スタイル）の組み合わせ。jiggle はスマートフォンユーザーに直感的に「動かせる」を伝え、破線ボーダーはデスクトップユーザーにも「選択可能・操作可能」を伝える。ただし `prefers-reduced-motion: reduce` を尊重し、モーションを無効にした場合は破線ボーダーのみにフォールバックする。

```css
@media (prefers-reduced-motion: reduce) {
  .edit-mode .tile {
    animation: none;
    border: 2px dashed currentColor;
  }
}
```

### C-2. 編集モード切替トリガー

| トリガー                                            | 長所                                               | 短所                                                               |
| --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| 長押し（iOS スタイル）                              | タッチユーザーに自然、他コンテンツと切り分けやすい | ユーザーが「長押しで編集できる」を知らない場合にディスカバリー問題 |
| 「編集」ボタン（Grafana/Datadog スタイル）          | 発見しやすい、不意の編集モード入りを防ぐ           | ボタン UI の実装コスト                                             |
| コンテキストメニュー（右クリック/長押し後メニュー） | 操作の文脈が明確                                   | モバイルでの右クリック操作は学習コストが高い                       |

**yolos.net 推奨**: Phase 9 でのダッシュボード実装では「編集ボタン」を基本とし、長押しはセカンダリトリガーとして追加する。理由: yolos.net は検索経由の初回訪問者が多く、長押し操作のディスカバリー問題が致命的になりうる。

### C-3. 編集モード中の操作優先順位

1. **並び替え（DnD）**: 最優先機能。直感的で視覚フィードバックが明確。
2. **削除（× ボタン）**: iOS スタイルで各タイルに表示。
3. **追加（タイルカタログ）**: 「+ 追加」ゾーン or サイドパネル。
4. **リサイズ**: Phase 9 以降の検討事項（タイルサイズ定義が確立後）。

---

## D. アクセシビリティ（A11y）

### D-1. タップターゲットサイズ

| 規格                              | 要件                                | 適用レベル     |
| --------------------------------- | ----------------------------------- | -------------- |
| WCAG 2.5.5 Target Size (Enhanced) | 44×44 CSS px                        | AAA            |
| WCAG 2.5.8 Target Size (Minimum)  | 24×24 CSS px（または spacing 確保） | AA（WCAG 2.2） |
| Apple HIG                         | 44×44 pt                            | iOS 推奨       |
| Material Design                   | 48×48 dp                            | Android 推奨   |

タイル自体（1×1 = 100px+ 程度）はタップターゲット問題が生じない。問題が起きやすいのは**タイル内のコントロール**（コピーボタン・展開ボタン・削除ボタン等）。

```css
/* タイル内ボタンは最低 44×44px を確保 */
.tile-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

編集モードの「削除ボタン（× バッジ）」は特に要注意。iOS の実装は 44×44px に満たないケースが多いが、yolos.net では WCAG 2.5.5 を目標とする（constitution Rule 2 の「有害にしない」に直結する）。

### D-2. キーボード操作・スクリーンリーダー対応

dnd-kit はキーボード DnD を標準サポートしている（`KeyboardSensor` が Space/Enter でドラッグ開始・確定、Arrow Keys で移動）。

スクリーンリーダー向けアナウンスの実装パターン（React Spectrum Blog、GitHub Engineering Blog 参照）:

```javascript
// dnd-kit の announcements 設定
const announcements = {
  onDragStart: ({ active }) =>
    `タイル「${active.data.current?.title}」をドラッグ中です。`,
  onDragOver: ({ active, over }) =>
    over
      ? `${over.data.current?.title} の上にあります。`
      : "配置場所がありません。",
  onDragEnd: ({ active, over }) =>
    over
      ? `タイル「${active.data.current?.title}」を「${over.data.current?.title}」の場所に移動しました。`
      : "キャンセルされました。",
  onDragCancel: ({ active }) =>
    `タイル「${active.data.current?.title}」のドラッグをキャンセルしました。`,
};
```

**重要な注意**: `aria-live` アナウンスの連続発火（高速ドラッグ時）で読み上げがラグするバグが知られており、100ms のデバウンスを入れることが推奨される（GitHub Engineering Blog 確認）。

### D-3. `grid-auto-flow: dense` の A11y 問題

`dense` を使うとグリッドアイテムの**視覚的順序と DOM 順序が乖離**し、Tab キー移動が視覚的に飛び回る問題が発生する（MDN 確認）。

ユーザー主導の DnD で並び替えた場合も同様の問題が起きる。対策:

1. **DnD 後に DOM 順序自体を更新する**（`items` 配列を reorder して再レンダリング）。dnd-kit の標準的なユースケースでこの方式が採用される。
2. `dense` は「ランダム画像ギャラリー」等 DOM 順序が意味を持たない場合のみ使用する。

yolos.net のダッシュボードでは DnD 後に配列を更新して DOM 順序と視覚順序を一致させる必要がある。

### D-4. フォーカスインジケーター

WCAG 2.2 で追加された新基準（2026 年現在 AA レベル):

- **2.4.11 Focus Not Obscured (Minimum)**: フォーカスリングがスティッキーヘッダー等で完全に隠れないこと
- **2.4.13 Focus Appearance (AAA)**: フォーカスリングが 2px 以上の幅、3:1 以上のコントラスト

```css
/* ダブルアウトライン技法（あらゆる背景色でコントラスト確保） */
.tile:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px #000;
}
```

`focus-visible` を使い、マウスクリックでは表示せず、キーボード操作時のみ表示する（WCAG 2.4.7 / 2.4.11 を満たしつつ視覚的干渉を最小化）。

---

## E. 「詳細ページ = タイル設置場所」の設計パターン

### E-1. 実世界の前例

#### Apple WidgetKit（iOS/iPadOS）

WidgetKit は **同一の Widget definition（SwiftUI View）が複数のサイズで動作**する設計。開発者は `@Environment(\.widgetFamily)` を参照して、同じコンポーネント内でサイズ別の表示を切り替える:

```swift
@Environment(\.widgetFamily) var widgetFamily

var body: some View {
  switch widgetFamily {
  case .systemSmall:  SmallView()      // 1×1
  case .systemMedium: MediumView()     // 2×1
  case .systemLarge:  LargeView()      // 2×2
  case .systemExtraLarge: FullView()   // iPadOS のみ
  default: SmallView()
  }
}
```

「ホーム画面ウィジェット」と「アプリ本体（詳細ページ）」は**別のもの**。WidgetKit のウィジェットはホーム画面専用で、タップするとアプリの詳細ページに遷移する。同一コンポーネントが「詳細ページとして動く」設計ではない。

#### Android Wear OS タイル

「素早いアクセス・グランス表示」を持ち、「詳細はアプリで」の分離設計が基本。タイル = 軽量プレビューであり、詳細ページをタイルとして「そのまま使う」設計ではない。

#### Notion iOS ウィジェット

Notion のページはアプリ内での詳細閲覧ページと、iOS ホーム画面ウィジェットとして表示される小さな「アイコン＋タイトル」の両方に同一ページが使われる。ただし表示内容は大きく異なり、「同一コンポーネントが両方で動く」というより「同一データソースから異なるビューを出力する」形。

#### Carbon Design System（IBM）

Tile コンポーネントに `base` / `clickable` / `selectable` / `expandable` の 4 バリアント。expandable tile が「詳細を展開する」に近い概念だが、「詳細ページを丸ごとタイル内に置く」設計ではない。

### E-2. yolos.net の「large-full タイル = 詳細ページ設置場所」設計の評価

yolos.net の設計意図: `/tools/json-formatter` の詳細ページ上で表示される大きなツール UI が、そのまま `large-full` サイズのタイルとして道具箱にも設置できる。

**メリット**:

- 「ホーム画面ウィジェットのような軽量版とアプリ本体の 2 つを作る」工数が不要
- コンポーネントの一元管理（バグ修正・UI 改善が両方に同時に反映される）
- 「詳細ページで動くならタイルでも動く」の論理的一貫性

**落とし穴と対策**:

| 落とし穴                         | 具体的な問題                                                                                            | 対策                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| コンテキスト依存のレイアウト     | 詳細ページでは `grid-column: 1 / -1` で全幅を使えるが、タイルとしては親グリッドのセルに収まる必要がある | Container Query で親の幅に応じてレイアウト切り替え                                  |
| ページタイトル・メタデータの混在 | `<h1>` や `<title>` が詳細ページ用に最適化されており、タイル内に不要                                    | タイルモードでは`isEmbedded` prop を渡して `<h1>` 等を非表示                        |
| ナビゲーション要素の混在         | 詳細ページにある「戻るボタン」「パンくず」がタイル内に混入                                              | 同上の `isEmbedded` または レイアウトコンポーネントとコンテンツコンポーネントの分離 |
| ロードサイズ肥大化               | 各ツールの詳細 JS が道具箱に全展開されると FCP が悪化                                                   | `tile-loader.ts` の `next/dynamic` + `ssr: false` で既に対策済み                    |
| スクロール競合                   | タイル内でスクロールが発生するコンテンツが道具箱全体のスクロールと競合                                  | `overscroll-behavior: contain` をタイルに付与                                       |

**Apple WidgetKit との本質的な違い**: WidgetKit は「ウィジェット（軽量）→ アプリ（詳細）」のナビゲーション前提。yolos.net は「ツール詳細ページ = 道具箱タイル」として同一コンポーネントが両文脈で機能することを目指す、より**野心的な設計**。

WidgetKit が採る「サイズ別にビューを切り替える（switch widgetFamily）」アプローチと、yolos.net が `tile-loader.ts` で既に準備している「slug ベースの動的 import でタイルコンポーネントを遅延ロード」は方向性が一致している（Phase 7 で各 slug の個別タイルコンポーネントを実装）。

**現実的な推奨**: 全 54 種のツール・遊びすべてを `large-full` タイルとして「詳細ページそのまま」で道具箱化するのは保守コストが高い。以下の分類を推奨する:

| タイルタイプ                 | 対象コンテンツ例          | 実装方針                                                       |
| ---------------------------- | ------------------------- | -------------------------------------------------------------- |
| `small` (1×1) 情報・診断系   | 今日の占い, BMI 結果表示  | 結果表示専用の軽量コンポーネント（詳細ページとは別）           |
| `medium` (2×1) ツール系      | char-count, byte-counter  | 詳細ページのコア機能を再利用（`isEmbedded` prop で外枠を削除） |
| `large` (2×2) + `large-full` | json-formatter, text-diff | 詳細ページとほぼ同一（`isEmbedded` のみ差異）                  |

Phase 7 の各サイクルで「このツールはどのタイルサイズで道具箱化するか」を個別に判断する（design-migration-plan.md Phase 7 の「1 対多」判断と整合）。

---

## 総合: yolos.net 向けアーキテクチャ初期推奨

### Phase 7 第 1 弾（cycle-193）で確立すべき基盤

1. **グリッド仕様の確定**
   - `--tile-cell: 160px` を基準セルサイズとして CSS 変数化
   - PC: 4 列 / タブレット(768px): 3 列 / SP: 2 列 / 狭い SP(480px): 2 列（タイルが 1×1 に縮退）
   - `grid-auto-rows: var(--tile-cell)` を PC のみ適用、モバイルはコンテンツ高さに従う
   - `grid-column: span 2` がグリッド列数（2 列）を超えないよう、メディアクエリで縮退

2. **DnD 基盤の確定**
   - `@dnd-kit/sortable` + `rectSortingStrategy` で Phase 7 の並び替え実装
   - PointerSensor: タッチ 250ms + 5px tolerance / マウス 5px distance
   - KeyboardSensor: デフォルト設定で A11y を確保

3. **タイルコンポーネントの境界設計**
   - `isEmbedded: boolean` prop でページ全体 vs タイル内を切り替え
   - `container-type: inline-size` を各タイルに付与して Container Query 対応
   - `touch-action: manipulation` を全タイルに、ドラッグハンドルは `touch-action: none`

4. **A11y の最低保証**
   - タイル内コントロール: `min-width: 44px; min-height: 44px`
   - フォーカスリング: `:focus-visible` + ダブルアウトライン技法
   - スクリーンリーダー: dnd-kit announcements の日本語化

5. **編集モード（Phase 9 のための設計予約）**
   - CSS クラス `.editing` をグリッドコンテナに付与するだけで全タイルが jiggle するスタイル定義を Phase 7 で用意しておく（実際のモード切替実装は Phase 9）
   - `@media (prefers-reduced-motion: reduce)` での破線フォールバックも Phase 7 で設定

### トレードオフ整理

| 判断項目            | 推奨                             | 代替案               | 採用しない理由                           |
| ------------------- | -------------------------------- | -------------------- | ---------------------------------------- |
| DnD ライブラリ      | @dnd-kit                         | react-grid-layout    | iOS タッチバグ多数、リサイズ不要         |
| グリッド行高        | fixed cell + responsive fallback | auto-fit/minmax      | span 縮退問題の扱いが複雑                |
| 大タイル縮退        | メディアクエリで span 上書き     | min() + var()        | ブラウザ互換性が不安定                   |
| タイル = 詳細ページ | isEmbedded prop で共有           | 完全別コンポーネント | 保守コスト最小化、WidgetKit の思想と整合 |
| 編集モード視覚      | jiggle + 破線ボーダー            | ヘッダー色変化のみ   | スマートフォンユーザーへの視覚的直感性   |
| dense フロー        | 使用しない                       | 使用する（隙間埋め） | DOM 順序と視覚順序の乖離で A11y 問題     |
