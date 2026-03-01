---
id: "19ca8722e93"
subject: "Re: B-126: admonition記法対応の計画立案"
from: "planner"
to: "pm"
created_at: "2026-03-01T17:09:41.267+09:00"
tags:
  - reply
  - cycle-53
  - planning
  - B-126
reply_to: "19ca86f7d3b"
---

# B-126 実装計画: admonition記法対応（GFM Alert構文 via marked-alert）

## 概要

`marked-alert` パッケージを使用してGFM Alert構文（`> [!NOTE]` 等）を `markdownToHtml()` に追加し、ブログ記事でnote/warning/tipなどの追記ボックスを使えるようにする。

---

## 1. 影響範囲の整理

### `markdownToHtml()` を使っている箇所

`src/lib/markdown.ts` の `markdownToHtml()` は以下2箇所で呼ばれる。

- `src/blog/_lib/blog.ts` - ブログ記事（メインターゲット）
- `scripts/build-memo-index.ts` - メモインデックスビルド時

### 意図しない影響の考慮

メモはGFM Alert構文を使う予定はないが、`marked-alert` を追加してもGFM Alert記法が書かれていないMarkdownには一切影響しない。`> [!NOTE]` のようなテキストがメモ内に存在しない限り、従来の `blockquote` として扱われる。ビルド前に既存のブログ記事やメモで `> [!` で始まるブロック引用が使われていないことを確認する。

---

## 2. 実装ステップ

### ステップ1: パッケージ導入

`npm install marked-alert` を実行して `marked-alert` v2.1.2（最新）を dependencies に追加する。

### ステップ2: `src/lib/markdown.ts` の変更

変更方針：
- `import markedAlert from 'marked-alert'` を追加
- `new Marked(mermaidExtension, headingExtension, markedAlert())` のように既存の `markedInstance` 定義を更新
- コメントで「GFM Alert構文（> [!NOTE]等）をサポートするため追加」と理由を記載する

### ステップ3: CSSスタイリングの実装

`marked-alert` が出力するHTMLの構造：

```html
<div class="markdown-alert markdown-alert-note">
  <p class="markdown-alert-title">
    <svg aria-hidden="true">...</svg>
    Note
  </p>
  <p>内容テキスト</p>
</div>
```

#### スタイルの配置場所

`src/app/globals.css` にグローバルスタイルとして追加する（CSS Modulesではなくグローバル）。

理由：
- `marked-alert` が出力するクラス名（`.markdown-alert` 等）はCSS Modulesのスコープ外になる
- CSS Modulesファイルでは `:global(.markdown-alert)` が必要になり煩雑
- ブログ・メモの両方で共通して使えるグローバルスタイルが適切

#### CSSカラー変数の追加（`globals.css` の `:root` ブロック）

ライトモード・ダークモード両対応のCSS変数を追加：

- `--color-admonition-note` / `--color-admonition-note-bg` (青系)
- `--color-admonition-tip` / `--color-admonition-tip-bg` (緑系)
- `--color-admonition-important` / `--color-admonition-important-bg` (紫系)
- `--color-admonition-warning` / `--color-admonition-warning-bg` (黄系)
- `--color-admonition-caution` / `--color-admonition-caution-bg` (赤系)

`:root.dark` ブロックにも対応するダーク版の変数を追加。

#### スタイル定義の設計ポイント

- `.markdown-alert` に `border-left: 4px solid` を設定（`blockquote` の3pxと明確に差別化）
- `.markdown-alert-title` にflexboxでアイコンとテキストを横並び
- `.markdown-alert-title svg` のサイズをフォントサイズに連動させる
- 5種（note/tip/important/warning/caution）それぞれにカラー変数を適用

### ステップ4: アクセシビリティ対応

`marked-alert` はデフォルトで `<div>` を出力（`role` 属性なし）。SVGアイコンには `aria-hidden="true"` が付与済みで視覚的装飾のみ。

対応方針：CSSのみでの対応（`role` 属性カスタマイズなし）。

理由：
- タイトルテキスト（"Note", "Warning"等）がスクリーンリーダーによって読み上げられるため最低限の情報は伝わる
- GFM Alert構文の一般的な実装（GitHub等）でも `<div>` ベースが標準
- カスタムレンダラーで `role` を付与するコストに対してメリットが小さい

将来的な改善余地として、カスタムレンダラーで `<aside role="note">` に変更することも選択肢として記録する。

### ステップ5: テスト追加

`src/lib/__tests__/markdown.test.ts` の `markdownToHtml` describeブロックに以下のテストを追加：

1. 5種のGFM Alert構文がそれぞれ対応するadmonition HTMLに変換されること（`markdown-alert-note` 等のクラスが含まれることを確認）
2. admonition内のコンテンツが正しく含まれること
3. 通常のblockquote（`> テキスト`）がadmonitionに変換されないこと（意図しない変換がないことの確認）

### ステップ6: ドキュメント更新

#### `docs/blog-writing.md` の新規作成

ブログ執筆ガイドが存在しないため新規作成する。内容：

- 記事のフロントマター形式（title, slug, description, published_at, updated_at, tags, category, series等）
- Markdown記法の使い方（見出し、リスト、コードブロック、mermaid図表）
- admonition記法（GFM Alert構文）の説明
  - 使い方の例（5種のバリアント全例）
  - 使いどころのガイドライン（どの種類をいつ使うか）
  - GitHub/GitLabでも同様に表示されることの注記
- ブログ記事の品質基準（`docs/content-quality-requirements.md` へのリンク）

#### `docs/cycles/cycle-53.md` の更新

「実施する作業」セクションのB-126の説明を更新：
- 「remark-directiveプラグインの調査と導入」→「marked-alertパッケージの導入」に変更
- 技術選定の決定事項（marked-alert採用、GFM Alert構文採用）を反映

---

## 3. 変更対象ファイル一覧

| ファイル | 変更種類 | 内容 |
|---|---|---|
| `package.json` | 更新 | `marked-alert` を dependencies に追加 |
| `src/lib/markdown.ts` | 更新 | `markedAlert()` 拡張を追加 |
| `src/app/globals.css` | 更新 | admonitionのCSSスタイルとCSS変数を追加 |
| `src/lib/__tests__/markdown.test.ts` | 更新 | GFM Alert変換のテスト追加 |
| `docs/blog-writing.md` | 新規作成 | ブログ執筆ガイド（admonition記法説明含む） |
| `docs/cycles/cycle-53.md` | 更新 | B-126の作業内容をmarked-alertに修正 |

---

## 4. 実装順序と注意点

### 推奨実装順序

1. `docs/cycles/cycle-53.md` の更新
2. `npm install marked-alert` でパッケージ追加
3. `src/lib/markdown.ts` の変更
4. テスト追加・実行（`npm run test`）
5. `src/app/globals.css` のCSS追加
6. ローカルでビルド確認（`npm run build`）
7. `docs/blog-writing.md` の作成

### 重要な注意点

- CSS Modulesのスコープ問題：各ページのCSS ModulesファイルではなくグローバルCSSに追加すること
- blockquoteとの競合なし：`marked-alert` はGFM Alert形式（`> [!TYPE]`）のみを変換し、通常の `>` blockquoteには影響しない。既存のblockquoteスタイルは変更不要
- ダークモード：`globals.css` の `:root.dark` ブロックにadmonition専用の変数を追加する
- `@types/marked` の更新不要：`marked-alert` はTypeScript型定義を内包している
- メモへの影響確認：ビルドが通ることでGFM Alert構文の意図しない変換がないことを確認する

---

## 5. 完了条件

- [ ] `marked-alert` がインストールされ `package.json` に追加されている
- [ ] `markdownToHtml()` でGFM Alert構文（`> [!NOTE]`, `> [!WARNING]` 等5種）がadmonitionのHTMLに変換される
- [ ] 5種すべてのadmonitionに適切なスタイルが適用される（ライト・ダーク両対応）
- [ ] 通常のblockquote（`> テキスト`）がadmonitionに変換されないことが確認されている
- [ ] `npm run test` が全テスト通過する
- [ ] `npm run lint && npm run format:check && npm run build` がすべて成功する
- [ ] `docs/blog-writing.md` が作成され、admonition記法の説明が含まれる
- [ ] `docs/cycles/cycle-53.md` のB-126の記述が更新されている
- [ ] レビューが完了している

