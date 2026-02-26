# 新しいフィーチャー追加ガイド

新しいフィーチャーをプロジェクトに追加する際の手順と判断基準をまとめたガイド。

---

## 1. 「このコードはどこに置くべきか」判断フロー

```
そのコードは特定のフィーチャー専用か？
  |
  +-- はい --> src/{feature-name}/ 内に配置
  |             |
  |             +-- コンポーネント --> _components/
  |             +-- ロジック/型    --> _lib/
  |             +-- データファイル  --> data/
  |             +-- テスト         --> __tests__/ または各サブディレクトリ内の __tests__/
  |             +-- Markdownコンテンツ --> content/
  |
  +-- いいえ --> 2つ以上のフィーチャーから使われるか？
                |
                +-- UIコンポーネント --> src/components/common/
                +-- ロジック/ユーティリティ --> src/lib/
                +-- データファイル --> src/data/
```

### 重要なルール

- **フィーチャー間の直接 import は禁止**: フィーチャーAがフィーチャーBのコードを直接 import しない。共有が必要なら `src/lib/` に昇格させる
- **app/ にはビジネスロジックを置かない**: `src/app/{route}/` には `page.tsx`, `layout.tsx`, `opengraph-image.tsx` のみ
- **`src/content/` ディレクトリは使用しない**: Astro Content Collections との誤認防止のため。Markdownコンテンツは `src/{feature}/content/` に配置する

---

## 2. 新しいフィーチャー追加の基本手順

### 2-1. ディレクトリ作成

```
src/{feature-name}/
  _components/         # UIコンポーネント + CSS Modules
  _lib/                # ロジック、ユーティリティ、型定義
  __tests__/           # フィーチャーレベルのテスト
  registry.ts          # フィーチャーの一覧・メタデータ（必要な場合）
  types.ts             # フィーチャー固有の型定義（必要な場合）
```

`_components/` と `_lib/` の先頭アンダースコアは Next.js のルーティングから除外されることを示す規約。

### 2-2. ルーティング作成

```
src/app/{route}/
  page.tsx             # ページエントリ
  layout.tsx           # レイアウト（必要な場合）
  opengraph-image.tsx  # OGP画像生成（必要な場合）
  __tests__/           # ページレベルのテスト
```

### 2-3. 検索インデックスへの登録

`src/lib/search/build-index.ts` にフィーチャーの検索エントリを追加する。

### 2-4. クロスリンクの登録

`src/lib/cross-links.ts` にフィーチャーの相互リンク情報を追加する（必要な場合）。

### 2-5. SEO対応

`src/lib/seo.ts` にフィーチャーのメタデータ生成関数を追加する（必要な場合）。

---

## 3. 新しいゲーム追加の手順

### 3-1. ディレクトリ作成

```
src/games/{game-slug}/
  _components/
    GameContainer.tsx          # ゲームのメインコンテナ
    GameContainer.module.css
    ...（ゲーム固有のコンポーネント）
  _lib/
    engine.ts                  # ゲームロジック
    daily.ts                   # デイリーパズル選出ロジック
    storage.ts                 # localStorage管理
    share.ts                   # 結果共有テキスト生成
    types.ts                   # ゲーム固有の型
    __tests__/                 # ロジックのユニットテスト
  data/
    {game-slug}-schedule.json  # デイリーパズルスケジュール
```

### 3-2. registry.ts にゲームを登録

`src/games/registry.ts` の `gameEntries` 配列に新しいゲームのメタデータを追加する。

```typescript
// src/games/registry.ts
const gameEntries: GameMeta[] = [
  // ...既存のゲーム
  {
    slug: "new-game-slug",
    title: "新しいゲーム",
    shortDescription: "短い説明（~30文字）",
    description: "ゲーム一覧ページ用の説明（~60文字）",
    icon: "...", // 絵文字アイコン
    accentColor: "#......", // テーマカラー
    difficulty: "初級",
    keywords: ["キーワード1", "キーワード2"],
    statsKey: "new-game-slug-stats",
    ogpSubtitle: "OGP画像用のサブタイトル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
  },
];
```

### 3-3. ルーティング作成

```
src/app/games/{game-slug}/
  page.tsx
  layout.tsx
  opengraph-image.tsx
  __tests__/
    page.test.tsx
```

### 3-4. 共有コンポーネントの利用

ゲーム共通のUIコンポーネントは `src/games/shared/_components/` にある:

- `CountdownTimer` - 次のパズルまでのカウントダウン
- `GameDialog` - ゲーム結果ダイアログ
- `GameShareButtons` - 結果共有ボタン
- その他

ゲーム共通のロジックは `src/games/shared/_lib/` にある:

- `crossGameProgress` - 全ゲーム横断の進捗管理
- `share` - 共有テキスト生成ユーティリティ

### 3-5. スケジュール生成スクリプト

デイリーパズルのスケジュール生成が必要な場合は `scripts/` にスクリプトを作成または既存スクリプトを拡張する。出力先はゲームの `data/` ディレクトリ。

```bash
# 例: scripts/generate-puzzle-schedule.ts
# 出力先: src/games/{game-slug}/data/{game-slug}-schedule.json
npx tsx scripts/generate-puzzle-schedule.ts
```

### 3-6. 検証

```bash
npm run typecheck
npm run test
npm run build
npm run lint
npm run format:check
```

---

## 4. 新しいツール追加の手順

### 4-1. ディレクトリ作成

```
src/tools/{tool-slug}/
  Component.tsx            # メインのUIコンポーネント
  Component.module.css     # スタイル
  logic.ts                 # ツールのビジネスロジック
  meta.ts                  # ツールのメタデータ
  __tests__/
    Component.test.tsx     # コンポーネントテスト
    logic.test.ts          # ロジックテスト
```

### 4-2. meta.ts にメタデータを定義

```typescript
// src/tools/{tool-slug}/meta.ts
import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "tool-slug",
  name: "ツール名（日本語）",
  nameEn: "Tool Name",
  description: "120-160文字程度のメタディスクリプション（日本語）",
  shortDescription: "~50文字のカード用短い説明",
  keywords: ["キーワード1", "キーワード2"],
  category: "text", // "text" | "encoding" | "developer" | "security" | "generator"
  relatedSlugs: ["related-tool-1", "related-tool-2"],
  publishedAt: "2026-01-01",
  structuredDataType: "WebApplication",
};
```

### 4-3. registry.ts にツールを登録

`src/tools/registry.ts` の定義配列に新しいツールのエントリを追加する。

```typescript
{
  meta: require("./{tool-slug}/meta").meta,
  componentImport: () => import("./{tool-slug}/Component"),
}
```

### 4-4. ルーティング

ツールのルーティングは動的ルート（`src/app/tools/[slug]/`）で自動的に処理されるため、個別のルーティングファイル作成は不要。

### 4-5. 検証

```bash
npm run typecheck
npm run test
npm run build
npm run lint
npm run format:check
```

---

## 5. Markdownコンテンツの配置ルール

### 基本ルール

Markdownコンテンツ（記事、ドキュメント等）を持つフィーチャーは `src/{feature-name}/content/` に配置する。

```
src/blog/content/         # ブログ記事のMarkdownファイル
```

### 禁止事項

`src/content/` ディレクトリは使用しない。理由:

- `src/content/` は Astro フレームワークの Content Collections の標準ディレクトリと同一名称
- AIエージェントがプロジェクトのフレームワーク（Next.js）を Astro と誤認するリスクがある
- フィーチャー単位のコロケーション原則に反する

### 将来の拡張

新しいフィーチャーでMarkdownコンテンツが必要になった場合も、同じパターンに従う:

```
src/{new-feature}/content/   # 新フィーチャーのMarkdownファイル
```

---

## 6. 共有コンポーネントの追加

2つ以上のフィーチャーから使われるUIコンポーネントは `src/components/common/` に配置する。

```
src/components/common/
  NewComponent.tsx
  NewComponent.module.css
  __tests__/
    NewComponent.test.tsx
```

ただし、最初は1フィーチャーのみで使うコンポーネントをフィーチャーディレクトリ内に作成し、後で2つ目のフィーチャーから必要になった時点で `components/common/` に昇格させることを推奨する。

---

## 参照

- [アーキテクチャ決定記録](./architecture-decision.md)
- [コーディング原則](../.claude/rules/coding-rules.md)
