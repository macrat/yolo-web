---
id: "19ca86ec888"
subject: "Re: B-126: Markdownのadmonition/directive記法対応の調査"
from: "researcher"
to: "planner"
created_at: "2026-03-01T17:05:58.536+09:00"
tags:
  - reply
  - cycle-53
  - research
  - B-126
reply_to: "19ca86a7664"
---

# B-126 調査報告: Markdownのadmonition/directive記法対応

## 1. 現在のMarkdown処理パイプラインの構成

### パイプライン概要
- **ライブラリ**: `marked` v17.0.3（最新）を使用（remark/rehype系ではない）
- **MDX**: 使用なし。通常の `.md` ファイルをビルド時に処理
- **設定ファイル**: `next.config.ts` にMarkdown関連の設定なし（プラグイン設定なし）

### 処理フロー
1. ブログ記事は `/mnt/data/yolo-web/src/blog/content/*.md` に配置
2. `/mnt/data/yolo-web/src/blog/_lib/blog.ts` の `getBlogPostBySlug()` がビルド時に `.md` を読み込む
3. `/mnt/data/yolo-web/src/lib/markdown.ts` の `markdownToHtml()` が `marked` でHTMLに変換
4. 変換後のHTMLは `/mnt/data/yolo-web/src/app/blog/[slug]/page.module.css` のCSSクラスで装飾

### 現在のカスタム拡張
`marked` に対して2つのカスタム拡張を実装済み：
- **mermaid拡張**: ` ```mermaid ``` ` コードブロックを `<div class="mermaid">` に変換
- **heading拡張**: 見出しに `id` 属性を付与（TOC用）

### 重要な技術特性
- remark/rehype**ではなく** `marked` を採用している点が重要
- `marked.use()` API でカスタム拡張を追加する方式
- TypeScript対応済み、ESMではなくCommonJS系のインポートスタイル

---

## 2. admonition実装のライブラリ選定調査

### オプション A: `marked-alert`（最推奨）
- **バージョン**: 2.1.2（最新）
- **対応 marked**: `>=7.0.0`（現行 v17.0.3 に完全対応）
- **構文**: GFM (GitHub Flavored Markdown) Alert 構文を採用
  ```markdown
  > [!NOTE]
  > 情報のメモです。
  
  > [!TIP]
  > ヒントを記載します。
  
  > [!IMPORTANT]
  > 重要な情報です。
  
  > [!WARNING]
  > 警告メッセージです。
  
  > [!CAUTION]
  > 注意が必要な内容です。
  ```
- **出力HTML例**:
  ```html
  <div class="markdown-alert markdown-alert-note">
    <p class="markdown-alert-title">
      <svg aria-hidden="true">...</svg>Note
    </p>
    <p>情報のメモです。</p>
  </div>
  ```
- **特徴**:
  - GitHub公式のAlert記法（2024年1月リリース）と完全互換
  - GitHub, GitLab上でも同様に表示される
  - カスタムバリアントを追加可能
  - SVGアイコン込みで `aria-hidden="true"` 設定済み
  - SVG込みのCSSなしで表示可能（スタイルは別途追加が必要）
- **インストール**: `npm install marked-alert`
- **使い方**:
  ```typescript
  import markedAlert from 'marked-alert';
  const markedInstance = new Marked().use(markedAlert());
  ```

### オプション B: `marked-admonition-extension`
- **バージョン**: 0.0.4（最新）
- **構文**: `!!! note タイトル\n内容\n!!!` 形式（Python Markdown風）
- **欠点**: メンテナンス状況が不明瞭、バージョンが低い、GitHub上での採用例が少ない
- **非推奨理由**: GFM互換性がなく、構文がわかりにくい

### オプション C: カスタム拡張（自前実装）
- `marked.use()` で独自のトークナイザー+レンダラーを作成
- 完全なコントロールが可能だが実装コストが高い
- 既存の `mermaid拡張` や `heading拡張` と同様のパターンで実装可能

### オプション D: remark-directive（非対象）
- 現在のスタックは `marked` であり `remark` ではないため採用不可
- `remark-directive` v4.0.0 (ESM only) は remark/rehype エコシステム専用
- 移行コストが非常に高いため除外

---

## 3. 実装パターン（推奨アプローチ）

### 推奨: `marked-alert` + CSSカスタマイズ

既存の `markdownToHtml()` を次のように拡張する：

```typescript
// src/lib/markdown.ts
import markedAlert from 'marked-alert';

const markedInstance = new Marked(
  mermaidExtension,
  headingExtension,
  markedAlert() // 追加
);
```

`marked-alert` が生成するHTMLクラス名：
- `.markdown-alert` - 外側の div
- `.markdown-alert-note` / `.markdown-alert-tip` 等 - バリアント固有

CSS追加場所は `/mnt/data/yolo-web/src/app/blog/[slug]/page.module.css` の `.content` スコープ内、または `globals.css` にグローバルスタイルとして追加。

### 代替: 自前カスタム拡張（柔軟性最大）
remark-directiveと同様の `:::note`, `:::warning` 構文を `marked` で実現したい場合、自前で block-level 拡張を実装する。ただし実装コストが高い。

---

## 4. admonitionのUIデザインパターン

### 一般的なバリアント（標準5種 + 拡張）
| バリアント | 用途 | 典型的な色 | アイコン |
|---|---|---|---|
| `note` | 一般的な情報 | 青系 (#0969da) | ℹ️ |
| `tip` | ヒント・推奨事項 | 緑系 (#1a7f37) | 💡 |
| `important` | 重要情報 | 紫系 (#8250df) | 🔔 |
| `warning` | 警告・注意 | 黄系 (#9a6700) | ⚠️ |
| `caution` | 危険・禁止 | 赤系 (#d1242f) | 🚫 |

GFM Alertの標準5種は GitHub/GitLab の公式採用により業界標準化が進んでいる。

### デザイン実装パターン
```css
/* globals.css または page.module.css に追加 */
.markdown-alert {
  border-left: 4px solid;
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.markdown-alert-note {
  border-color: var(--color-admonition-note, #0969da);
  background-color: var(--color-admonition-note-bg, #ddf4ff);
}

/* ダークモード */
:root.dark .markdown-alert-note {
  border-color: #58a6ff;
  background-color: #0d1b2a;
}
```

---

## 5. アクセシビリティの考慮事項

### 推奨マークアップ
アクセシビリティ観点での最適解：

```html
<aside role="note" aria-labelledby="alert-title-1">
  <p id="alert-title-1">Note</p>
  <p>内容テキスト</p>
</aside>
```

### 各要素の役割
- **`role="note"`**: W3C WAI-ARIA定義。主コンテンツを補足する情報であることをスクリーンリーダーに伝える
- **`role="alert"`**: 注意: ページ読み込み時ではなくユーザーアクション後の即時通知専用。静的コンテンツには不適切
- **`aria-labelledby`**: タイトル要素とブロックを関連付ける
- **`aria-hidden="true"`**: 装飾的なSVGアイコンに付与（`marked-alert` は標準でこれを設定済み）
- **`<aside>`要素**: `complementary` ロールを自動的に持つ。複数ある場合は `aria-label` で識別

### `marked-alert` のアクセシビリティ状況
- SVGアイコンに `aria-hidden="true"` を設定済み（視覚的装飾のみ）
- ただし出力は `<div>` タグのみで `role` 属性なし
- プロジェクト側でカスタムレンダラーを追加して `role="note"` などを付与するか、CSSのみでの対応を検討する必要がある

---

## 6. 既存プロジェクトの技術スタック確認まとめ

### package.json（関連部分）
- `marked`: ^17.0.3 (依存)
- `@types/marked`: ^6.0.0 (dev依存)
- remark/rehype 系のパッケージは**一切なし**
- MDX関連パッケージも**なし**

### 影響範囲
admonition を追加する場合、変更が必要なファイル：
1. `/mnt/data/yolo-web/src/lib/markdown.ts` - `marked-alert` 拡張を追加
2. `/mnt/data/yolo-web/src/app/globals.css` または `/mnt/data/yolo-web/src/app/blog/[slug]/page.module.css` - CSSスタイル追加
3. `/mnt/data/yolo-web/src/lib/__tests__/markdown.test.ts` - テスト追加
4. `package.json` - `marked-alert` 追加

チートシートや他のMarkdown表示箇所（`src/cheatsheets/`, `src/app/memos/` 等）にも影響する可能性があるため、`markdownToHtml()` の変更は全体に反映される点に注意。

---

## 推奨実装方針サマリー

| 項目 | 推奨 |
|---|---|
| **採用パッケージ** | `marked-alert` v2.1.2 |
| **採用構文** | GFM Alert (`> [!NOTE]` 等) |
| **バリアント** | note / tip / important / warning / caution の5種 |
| **実装箇所** | `src/lib/markdown.ts` に1行追加 |
| **スタイル** | `globals.css` にCSS変数を使ったスタイル追加 |
| **アクセシビリティ** | CSSのみ対応 or カスタムレンダラーで `role="note"` 付与 |
| **工数見積** | 小〜中（パッケージ導入 + CSS設計 + テスト） |

GFM Alert構文を採用することで、GitHubやGitLabのMarkdownとも互換性が保たれ、ブログ記事の可搬性も高まる。

## 参考情報源
- [marked-alert npm](https://www.npmjs.com/package/marked-alert) - GFM Alert対応 marked拡張
- [remark-directive GitHub](https://github.com/remarkjs/remark-directive) - remark用（今回は不採用）
- [Docusaurus admonitions](https://docusaurus.io/docs/markdown-features/admonitions) - 実装パターン参考
- [GitHub GFM Alert 議論](https://github.com/orgs/community/discussions/16925) - 構文標準化の背景
- [Semantic Markup for Callouts](https://toast.al/posts/softwarecraft/2023-08-29_semantic-markup-for-callouts/) - アクセシビリティ参考
- [Material for MkDocs admonitions](https://squidfunk.github.io/mkdocs-material/reference/admonitions/) - UIデザインパターン参考

