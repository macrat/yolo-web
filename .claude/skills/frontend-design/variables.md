# CSS 変数リファレンス

**値の単一情報源: `src/app/globals.css`**
このファイルには値を書かない。用途・命名規約・ライト/ダーク方針・既存体系との対応表のみを記す。
具体的な値が必要な場合は `globals.css` を直接参照すること。

---

## 1. 命名スキーム

デザインシステム変数はプレフィックスなし、素地命名そのままを採用する。

```
--bg-*           Surface（背景面）
--fg-*           Text（テキスト）
--border-*       Border（罫線）
--accent-*       Accent（アクセント色）
--success-*      Status（成功）
--warning-*      Status（警告）
--danger-*       Status（危険）
--font-sans      フォントスタック（Noto Sans JP 起点）
--fs-*           font-size
--lh-*           line-height
--tracking-*     letter-spacing
--sp-*           spacing（余白）
--r-*            border-radius（角丸）
--elev-*         elevation（影）
--ease / --ease-out   easing（イーズ）
--t-*            transition-duration（時間）
```

### なぜプレフィックスなしか

Owner 指示「シンプルで分かりやすい」（cycle-170）と「無意味な複雑さを持ち込まない」に従い、
素地（`docs/design-system-by-claude-design/colors_and_type.css`）の命名をそのまま採用した。

本リポジトリは現在 Tailwind / shadcn を使っておらず、サードパーティ衝突は仮定の問題にすぎない（YAGNI）。
また Owner の論理「リポジトリはすべて yolos.net のものなので yolos という言葉は意味を持たない」を延長すると、
フロントエンド全体がデザインシステムの内側にあるため、「デザインシステム変数である」というプレフィックスも不要になる。

### サードパーティ衝突リスク（次サイクル候補）

現時点では Tailwind も shadcn も導入していないため実害はない。
将来 Tailwind v4 / shadcn 等の導入議論が起きた時点で衝突の有無を確認し、必要ならリネームを検討する。
この確認をキャリーオーバー候補（T-10）として記録する。

---

## 2. カテゴリ別の用途と選択基準

具体的な値は `src/app/globals.css` を参照すること。

### 2-1. Surface（背景面）

`--bg*` 系は「どの面の上にコンテンツを置くか」を決める。

| 変数               | 用途                                    |
| ------------------ | --------------------------------------- |
| `--bg`             | パネル・モーダルのデフォルト面（白）    |
| `--bg-soft`        | ページ背景・hover on bg（オフホワイト） |
| `--bg-softer`      | ghost ボタン hover・ヘアライン罫線      |
| `--bg-invert`      | primary ボタン・フッター（墨）          |
| `--bg-invert-soft` | primary ボタン hover                    |

**選択の原則**: hover は隣の階調に一段移動するだけ。透明度・scale は使わない。

### 2-2. Text（テキスト）

`--fg*` 系は「どの面の上にテキストを置くか」に応じて選ぶ。

| 変数               | 用途                             |
| ------------------ | -------------------------------- |
| `--fg`             | 本文（主要テキスト）             |
| `--fg-soft`        | 補助テキスト・ラベル             |
| `--fg-softer`      | caption / disabled / placeholder |
| `--fg-invert`      | `--bg-invert` 上のテキスト       |
| `--fg-invert-soft` | `--bg-invert` 上の補助テキスト   |

### 2-3. Border（罫線）

`--border` 系は Surface パレットのエイリアス。独立した値を持たない。

| 変数              | 用途                   |
| ----------------- | ---------------------- |
| `--border`        | デフォルトのヘアライン |
| `--border-strong` | 強調・区切りの罫線     |

**注**: border 色は hover で変えない（明度差で十分。さらなる変化は装飾になる）。

### 2-4. Accent & Status

1 画面内に同時に出すアクセント色は **1 つを基本** とする。

| 変数群                            | 用途                                             |
| --------------------------------- | ------------------------------------------------ |
| `--accent` / `-strong` / `-soft`  | リンク・フォーカス・操作可能要素（青、CUD 準拠） |
| `--success` / `-strong` / `-soft` | 完了・成功（緑、CUD 準拠）                       |
| `--warning` / `-strong` / `-soft` | 準備中・注意（琥珀、CUD 準拠）                   |
| `--danger` / `-strong` / `-soft`  | エラー・停止（朱、CUD 準拠）                     |

各色の意味:

- `base` — 通常時
- `-strong` — pressed / hover-emphasis（より暗い）
- `-soft` — tinted background（アイコン背景・バッジ等）

フォーカスリング: `outline: 2px solid var(--accent); outline-offset: 2px;`

### 2-5. フォント

```css
font-family: var(--font-sans); /* Noto Sans JP + 日本語フォールバック */
```

**フォントスタック適用方針**（重要）:

`--font-sans` は変数として `globals.css` に定義済みだが、
Noto Sans JP の Web フォント実読み込み（`@import` または `<link>`）は新コンポーネント側で局所的に行う。

理由: `globals.css` に `@import url("fonts.googleapis.com/...")` を書くと、
`layout.tsx` 経由で既存サイト全ページに Google Fonts CDN へのリクエストが発生し、
「既存サイトに手を加えない」（cycle-170 Owner 指示）に違反するため。

具体的な読み込み方法（新コンポーネントの module.css で行う例）:

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap");
```

または T-09 動作確認ページ専用の layout.tsx で next/font を使う方法でもよい。
`body` への一括適用は次サイクル以降に委ねる。

なお既存の `--font-mono`（`"Menlo"` 起点）は既存サイト用。
新コンポーネントで等幅フォントが必要な場合は `--font-sans` フォールバック内の欧文モノを使うか、
次サイクルで `--font-mono` を Noto Sans Mono 起点に更新することを検討する。

### 2-6. タイプスケール

```css
font-size: var(--fs-15); /* 本文デフォルト */
```

使える変数: `--fs-12` / `--fs-13` / `--fs-14` / `--fs-15` / `--fs-16` / `--fs-18` / `--fs-20` / `--fs-24` / `--fs-32` / `--fs-44` / `--fs-60`（合計 11 段）

これ以外のサイズは使わない。`px` をハードコードしない。

### 2-7. 行送り・字間

行送りは `--lh-tight` / `--lh-snug` / `--lh-base` / `--lh-loose` の 4 段。
字間は `--tracking-tight` / `--tracking-base` / `--tracking-wide` の 3 段。

各変数の用途:

- `lh-tight` — 大見出し
- `lh-snug` — 小見出し・UI ラベル
- `lh-base` — 本文デフォルト（日本語向けに広め）
- `lh-loose` — 読み物コンテンツ
- `tracking-tight` — 大きな見出し
- `tracking-base` — 標準
- `tracking-wide` — ラベル・eyebrow

### 2-8. スペーシング

8px グリッド準拠。`--sp-1` 〜 `--sp-9` の 9 段。余白は惜しまず取る。

`sp-1` が最小（4px）、`sp-9` が最大（96px）。値は `globals.css` を参照。`px` をハードコードしない。

### 2-9. 角丸

**2 変数のみ**。それ以外は使わない。

| 変数              | 適用対象                                 |
| ----------------- | ---------------------------------------- |
| `--r-normal`      | パネル・カード・タグ・モーダル等すべて   |
| `--r-interactive` | ボタン・入力欄・セレクト等の操作可能要素 |

### 2-10. Elevation

**3 レベルのみ**。

| 変数              | 用途                                               |
| ----------------- | -------------------------------------------------- |
| `--elev-0`        | デフォルト（影なし）。すべての要素はここから始まる |
| `--elev-button`   | ボタン通常時のみ                                   |
| `--elev-dragging` | ドラッグ中の要素のみ                               |

ダイアログ・ポップオーバー・カードに影を使わない。階層は枠線とスペースで表現する。

### 2-11. モーション

`--ease` / `--ease-out` の 2 種のイーズと、`--t-fast` / `--t-base` / `--t-slow` の 3 段の時間。

各変数の用途:

- `ease` — 標準イーズ
- `ease-out` — 要素の出現
- `t-fast` — hover 等の即時反応
- `t-base` — 標準アニメーション
- `t-slow` — ページ遷移等

fade と short slide のみ使う。bounce / spring / 大きな移動は使わない。

---

## 3. Bad / Good コード例

### 色・スペーシングのハードコード禁止

```css
/* Bad */
background: #ffffff;
padding: 16px;
border-radius: 8px;

/* Good */
background: var(--bg);
padding: var(--sp-4);
border-radius: var(--r-interactive);
```

### フォントのハードコード禁止

```css
/* Bad */
font-family: "Noto Sans JP", sans-serif;

/* Good */
font-family: var(--font-sans);
```

### ハードコードを見つけたら

コンポーネントの `.module.css` にハードコードされた色・余白・角丸を見つけたら、
対応するデザインシステム変数に置き換えて PR を作る。

---

## 4. ダークモードの方針

**本サイクルではダーク値を定義しない。**

理由: WCAG AA（テキスト 4.5:1 / UI 3:1）のコントラスト検証を別工数で行う必要があるため。
検証なしに暗い背景の値を決めると「見た目は整っているが読めない」状態になるリスクがある。

次サイクルでの追加余地（構造は既に確保済み）:

```css
/* 次サイクルで追加する場所（globals.css 内の既存 :root.dark ブロックの近く） */
:root.dark {
  --bg: /* ダーク値（WCAG AA 検証後）*/;
  --fg: /* ダーク値 */;
  /* ... */
}
```

既存 `--color-*` 系のダーク値（`:root.dark`）は既に `globals.css` に定義済み。
新変数のダーク値はその隣ブロックに追記する形になる。

---

## 5. 既存 `--color-*` との対応表（次サイクルの段階置換ガイド）

既存体系と新体系の意味的な対応を変数名で示す。
次サイクル以降で「新コンポーネントの利用範囲を広げ → 既存ファイルを新変数に置換」する際のガイド。

| 既存 `--color-*`         | 新変数            | 意味                         |
| ------------------------ | ----------------- | ---------------------------- |
| `--color-bg`             | `--bg`            | デフォルト背景面             |
| `--color-bg-secondary`   | `--bg-soft`       | 沈んだ背景                   |
| `--color-text`           | `--fg`            | 本文テキスト                 |
| `--color-text-muted`     | `--fg-soft`       | 補助テキスト                 |
| `--color-border`         | `--border`        | ヘアライン罫線               |
| `--color-primary`        | `--accent`        | アクセント（リンク・ボタン） |
| `--color-primary-hover`  | `--accent-strong` | アクセント hover             |
| `--color-success`        | `--success`       | 成功・完了                   |
| `--color-error`          | `--danger`        | エラー・危険                 |
| `--color-warning-border` | `--warning`       | 警告                         |

**段階置換時の注意**: 変数名は対応するが値は一致しないものがある。

具体例:

- `--color-bg: #ffffff` と `--bg: #ffffff` は同値のため置換しても見た目は変わらない
- `--color-primary: #2563eb` と `--accent: oklch(0.62 0.22 264)` は色相は近いが明度・彩度の表現が異なり、DevTools で並べると視覚差が生じる場合がある
- `--color-success: #16a34a` と `--success: oklch(0.62 0.16 162)` も sRGB 変換後に近似値だが厳密には異なる

段階置換ごとにブラウザで実際の表示を確認してから置換すること。

---

## 6. 変数カテゴリ一覧と総件数

| カテゴリ                        | 変数プレフィックス | 件数   |
| ------------------------------- | ------------------ | ------ |
| Surface                         | `--bg*`            | 5      |
| Text                            | `--fg*`            | 5      |
| Border                          | `--border*`        | 2      |
| Accent                          | `--accent*`        | 3      |
| Status (success/warning/danger) | `--success*` 他    | 9      |
| Font                            | `--font-sans`      | 1      |
| Type scale (font-size)          | `--fs-*`           | 11     |
| Line height                     | `--lh-*`           | 4      |
| Letter spacing                  | `--tracking-*`     | 3      |
| Spacing                         | `--sp-*`           | 9      |
| Radius                          | `--r-*`            | 2      |
| Elevation (raw + semantic)      | `--elev-*`         | 5      |
| Motion (easing)                 | `--ease*`          | 2      |
| Motion (duration)               | `--t-*`            | 3      |
| **合計**                        |                    | **64** |
