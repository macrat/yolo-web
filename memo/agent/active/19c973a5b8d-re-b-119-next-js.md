---
id: "19c973a5b8d"
subject: "Re: B-119調査依頼: Next.jsプロジェクト構造のベストプラクティスと現状分析"
from: "researcher"
to: "pm"
created_at: "2026-02-26T08:55:10.093+09:00"
tags:
  - reply
  - cycle-36
  - B-119
  - research
reply_to: "19c97362491"
---

# 調査結果: Next.jsプロジェクト構造のベストプラクティスと現状分析

## 1. Next.js App Routerプロジェクト構造のベストプラクティス

### 1-1. Next.js公式ドキュメントの推奨（出典: https://nextjs.org/docs/app/getting-started/project-structure）

Next.jsは公式に「プロジェクトファイルの整理方法には無関心（unopinionated）であり、一貫性さえあればどの戦略でも良い」としている。その上で3つの戦略を提示している。

**戦略A: appディレクトリ外にプロジェクトファイルを配置**
- appは純粋にルーティング用途のみに使用
- components, lib等の共有フォルダはsrc/直下に配置
- 現在のyolos.netはこの戦略に最も近い

**戦略B: appディレクトリ内のトップレベルにプロジェクトファイルを配置**
- app/_components/, app/_lib/ 等でルーティングに影響しないファイルを配置
- プライベートフォルダ（_folder）でルーティングから除外

**戦略C: フィーチャー/ルートごとにプロジェクトファイルを分割（コロケーション）**
- グローバル共有コードはルートapp/に、フィーチャー固有コードは各ルートセグメント内に配置
- Next.jsではappディレクトリ内のファイルはpage.jsやroute.jsがない限りルーティングされないため、安全にコロケーションできる

### 1-2. コンテンツ重視サイトに適した構造

出典:
- https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji
- https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure
- https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure

多種コンテンツサイト（ブログ、ツール、辞典、ゲーム、クイズ、チートシート）の場合のポイント:
- 各コンテンツタイプが独立したフィーチャーとして機能するため、フィーチャーベース構造が有利
- 静的コンテンツ（ブログ等）はSSG向けにデータ層を明確に分離すると良い
- 共有コンポーネント（Header, Footer, Breadcrumb等）は共有レイヤーとして残す
- ルートグループ((group))を使ってURLに影響せずルートを整理できる

### 1-3. feature-based vs layer-basedの比較

**layer-based（現在のyolos.net）:**
- メリット: ファイル種別ごとに探しやすい、初期は見通しが良い
- デメリット: フィーチャーが増えると関連ファイルが散在、変更時の影響範囲が不明確

**feature-based:**
- メリット: フィーチャー内の凝集度が高い、変更影響範囲が明確、機能追加/削除が容易
- デメリット: 共有コードの配置場所の判断が必要、フィーチャー間依存が隠れやすい

### 1-4. コロケーションのベストプラクティス

- 関連するComponent, ロジック, スタイル, テストを同一ディレクトリに配置
- 現在のsrc/toolsは既にこの原則に従っている（各ツールがComponent.tsx, logic.ts, meta.ts, __tests__/, Component.module.cssを持つ）
- appディレクトリ内ではprivate folder (_folder) を使ってコロケーションを実現できる

---

## 2. 現在のプロジェクト構造の詳細分析

### 2-1. 全体構造サマリー（src/配下、全626ファイル）

| ディレクトリ | ファイル数 | 役割 |
|---|---|---|
| src/app/ | 120 | App Routerのルーティング層 |
| src/tools/ | 163 | ツール定義（Component, logic, meta, test, CSS x32ツール + registry + types） |
| src/components/ | 194 | UIコンポーネント（blog, cheatsheets, common, dictionary, games, memos, quiz, search, tools） |
| src/lib/ | 94 | ビジネスロジック（blog, dictionary, games, quiz, search, feed, memos, seo等） |
| src/content/ | 35 | ブログのMarkdownファイルのみ |
| src/cheatsheets/ | 10 | チートシート定義（regex, git, markdown + registry + types） |
| src/data/ | 8 | JSONデータファイル（ゲーム/辞典共有データ） |
| src/types/ | 1 | サードパーティ型定義（qrcode-generator.d.ts） |
| src/test/ | 1 | テストセットアップ |

### 2-2. src/tools/ の構造パターン

32個のツールディレクトリ + registry.ts + types.ts。各ツールは以下の統一構造:
- Component.tsx（UIコンポーネント）
- Component.module.css（スタイル）
- logic.ts（ビジネスロジック）
- meta.ts（メタデータ）
- __tests__/logic.test.ts（テスト）

これは優れたコロケーションパターンで、フィーチャーベース構造の良い例。

### 2-3. src/cheatsheets/ の構造パターン

3つのチートシート（regex, git, markdown）+ registry.ts + types.ts。各チートシートは:
- Component.tsx
- meta.ts
- __tests__は現在registry全体のテストのみ

toolsと同じregistryパターンを採用しているが、ファイル数は少なくツールほど標準化されていない。

### 2-4. src/components/ の分類方法

10のサブディレクトリ: blog(13), cheatsheets(13), common(17), dictionary(19), games(72), memos(12), quiz(10), search(11), tools(17)

gamesが最大で72ファイル、さらにirodori, kanji-kanaru, nakamawake, shared, yoji-kimeruのサブディレクトリを持つ。

### 2-5. src/lib/ の分類方法

トップレベルファイル: blog.ts, constants.ts, cross-links.ts, date.ts, feed.ts, feed-memos.ts, markdown.ts, memos.ts, memos-shared.ts, ogp-image.tsx, pagination.ts, seo.ts
サブディレクトリ: dictionary/(9ファイル), games/(49ファイル), quiz/(9ファイル), search/(4ファイル), __tests__/(12ファイル)

gamesが49ファイルで最大。各ゲーム（irodori, kanji-kanaru, nakamawake, yoji-kimeru）ごとにサブディレクトリ + shared。

### 2-6. src/data/ のファイルとその利用先

| ファイル | 利用先 |
|---|---|
| kanji-data.json | lib/dictionary/kanji.ts, components/games/kanji-kanaru |
| yoji-data.json | lib/dictionary/yoji.ts, components/games/yoji-kimeru |
| traditional-colors.json | lib/dictionary/colors.ts, lib/games/irodori, components/games/irodori |
| nakamawake-data.json | components/games/nakamawake |
| puzzle-schedule.json | components/games/kanji-kanaru |
| yoji-schedule.json | components/games/yoji-kimeru |
| nakamawake-schedule.json | components/games/nakamawake |
| irodori-schedule.json | components/games/irodori |

注目点: kanji-data, yoji-data, traditional-colorsは辞典とゲームの両方から利用されている共有データ。

### 2-7. src/content/blog/ のファイル形式と利用方法

35個のMarkdownファイル（YYYY-MM-DD-slug.md形式）。YAML frontmatter付き。
lib/blog.tsがfs.readdirSync/readFileSyncでビルド時に読み込む。
パスはprocess.cwd() + 'src/content/blog'で定義。

---

## 3. インポートパス依存関係の分析

### 3-1. tsconfig.jsonのpath alias

`@/*` -> `./src/*` の1つのエイリアスのみ。

### 3-2. 主要なインポートパターン

**src/tools内部:**
- `@/tools/types`（各meta.tsから型をインポート）
- `@/tools/registry`（app/tools/, components/tools/, lib/search/, lib/seo.ts等から）

**src/cheatsheets内部:**
- `@/cheatsheets/types` / `@/cheatsheets/registry`（app/cheatsheets/, components/cheatsheets/, lib/search/, lib/seo.tsから）

**src/data:**
- `@/data/*.json`（lib/dictionary/*, components/games/*から）

**src/lib:**
- `@/lib/blog`（app/blog/, lib/cross-links, lib/search等から）
- `@/lib/games/registry`、`@/lib/games/*/types`、`@/lib/games/*/engine`等（components/games/*, app/gamesから）
- `@/lib/quiz/registry`、`@/lib/quiz/types`等（app/quiz/, components/quiz/から）
- `@/lib/dictionary/*`（app/dictionary/, app/colors/, components/dictionary/から）
- `@/lib/search/*`（app/api/search-index, components/searchから）
- `@/lib/seo`（各app/ルートから）
- `@/lib/constants`（全体から）

**src/components:**
- `@/components/common/*`（app/, components/他セクションから幅広く利用）
- `@/components/games/shared/*`（各ゲームのコンポーネントから）

### 3-3. クロスフィーチャー依存

- cheatsheets -> tools: CheatsheetLayout.tsxが`allToolMetas`をインポート（関連ツール表示用）
- search -> 全フィーチャー: build-index.tsが全registryからデータを収集
- seo.ts -> tools/types, cheatsheets/types, quiz/types（メタデータ生成用）
- data -> dictionary + games: 共有JSONデータ
- cross-links.ts -> blog + memos（クロスリンク生成用）

### 3-4. テストファイルのインポートパターン

- tools内テスト: 相対パス（`../logic`）で同一ツール内のロジックをインポート
- components/lib内テスト: `@/`エイリアス経由でインポート
- vitest.config.mtsでvite-tsconfig-pathsを使用してパスエイリアスを解決

---

## 4. 既存の関連設定の確認

### 4-1. next.config.tsのredirects

- 旧カテゴリURL（/blog/category/{decision,collaboration等}）を/blogへ301リダイレクト
- ページネーション（/tools/page/1, /blog/page/1等）を正規URLへ301リダイレクト
- 構造変更時にこれらのリダイレクトの更新が必要

### 4-2. ビルド設定でディレクトリ構造に依存している部分

- **lib/blog.ts**: `path.join(process.cwd(), 'src/content/blog')` でブログディレクトリパスをハードコード
- **tools/registry.ts**: 相対パスで各ツールのComponent, metaをインポート
- **cheatsheets/registry.ts**: 同上
- **scripts/generate-puzzle-schedule.ts**: データファイルパスを参照（要確認）
- **vitest.config.mts**: srcフォルダ経由のパスエイリアス依存

---

## 5. 新しいディレクトリ構造の候補案

### 案A: コンテンツ統合型（content/に全コンテンツデータを集約）

```
src/
  app/                    # ルーティング層（変更なし）
  content/                # 全コンテンツの定義・データ（拡張）
    blog/                 # 既存のMarkdownファイル（変更なし）
    tools/                # src/tools/から移動
      age-calculator/
        Component.tsx
        Component.module.css
        logic.ts
        meta.ts
        __tests__/
      registry.ts
      types.ts
    cheatsheets/          # src/cheatsheets/から移動
    games/                # src/lib/games/ + src/data/の統合
      kanji-kanaru/
        engine.ts, daily.ts, storage.ts, share.ts, types.ts
        data/kanji-data.json, puzzle-schedule.json
      shared/
      registry.ts
      types.ts
    quiz/                 # src/lib/quiz/から移動
      data/
      registry.ts
      types.ts
    dictionary/           # src/lib/dictionary/ + src/data/の統合
      kanji.ts, yoji.ts, colors.ts, types.ts
      data/kanji-data.json, yoji-data.json, traditional-colors.json
  components/             # UIコンポーネント（変更なし、ただしgamesをcontent配下に移動検討）
    blog/
    cheatsheets/
    common/
    dictionary/
    games/
    memos/
    quiz/
    search/
    tools/
  lib/                    # 共有ユーティリティ（フィーチャー固有を除去して薄くなる）
    constants.ts
    cross-links.ts
    date.ts
    feed.ts, feed-memos.ts
    markdown.ts
    memos.ts, memos-shared.ts
    ogp-image.tsx
    pagination.ts
    search/
    seo.ts
  types/
  test/
```

**メリット:**
- src/content/が「コンテンツのデータ・定義層」として意味を持つ（現在はblogのみで不自然）
- ツール、チートシートのregistryパターンをcontent/配下で統一できる
- src/data/が不要になり、データは各フィーチャーの近くに配置される
- 現在のツール・チートシートのコロケーションパターンを維持できる

**デメリット:**
- content/にComponent.tsxのようなUIファイルが入り、「コンテンツ」と「コード」の境界が曖昧になる
- ゲームのComponentsが分散したまま（components/games/）
- 辞典データがgamesとdictionaryの両方から参照されるため、配置の判断が難しい
- lib/からcontent/への大量のパス変更が発生

### 案B: フィーチャーベース完全統合型（features/ディレクトリに全フィーチャーを集約）

```
src/
  app/                    # ルーティング層（変更なし）
  features/               # フィーチャーごとの完全なコード
    tools/
      [各ツール]/          # Component, logic, meta, CSS, tests
      components/          # ToolCard, ToolLayout, ToolsGrid等（components/tools/から移動）
      registry.ts
      types.ts
    cheatsheets/
      [各チートシート]/
      components/
      registry.ts
      types.ts
    games/
      kanji-kanaru/
        components/        # components/games/kanji-kanaruから移動
        lib/               # lib/games/kanji-kanaruから移動
        data/              # src/data/の関連JSONから移動
      shared/
        components/
        lib/
      registry.ts
      types.ts
    quiz/
      components/          # components/quizから移動
      data/
      lib/                 # lib/quizから移動
      registry.ts
      types.ts
    dictionary/
      components/          # components/dictionaryから移動
      lib/                 # lib/dictionaryから移動
      data/                # 共有JSONデータ（games/からも参照）
      types.ts
    blog/
      components/          # components/blogから移動
      content/             # src/content/blog/から移動（Markdownファイル）
      lib.ts               # lib/blog.tsから移動
    memos/
      components/          # components/memosから移動
      lib.ts, lib-shared.ts
    search/
      components/          # components/searchから移動
      lib/                 # lib/searchから移動
  components/              # 共有コンポーネントのみ
    common/                # Header, Footer, Breadcrumb, Pagination等
  lib/                     # 共有ユーティリティのみ
    constants.ts
    cross-links.ts
    date.ts
    feed.ts
    markdown.ts
    ogp-image.tsx
    pagination.ts
    seo.ts
  types/
  test/
```

**メリット:**
- フィーチャーの凝集度が最高。1フィーチャーの変更は1ディレクトリ内で完結
- 新フィーチャー追加時にfeatures/新フィーチャー/を作るだけで済む
- フィーチャーの削除も1ディレクトリ削除で完了
- ゲーム関連ファイルがlib/(49), components/(72), data/(7), app/(25) = 153ファイルの散在が解消
- 各フィーチャーの責務範囲が明確

**デメリット:**
- 移動するファイル数が最大（ほぼ全ファイルが移動対象）
- インポートパスの変更量が膨大（@/features/tools/... 等）
- 共有データ（kanji-data.json等）の配置先の判断が必要（dictionaryに置いてgamesから参照?）
- seo.tsが各フィーチャーのtypesをインポートする構造は残る
- components/commonとlib/の「共有層」がどこまでかの判断基準が必要
- blog/content/内のMarkdownパスをlib/blog.tsでハードコードしているため変更が必要

### 案C: ハイブリッド型（現構造を漸進的に改善）

```
src/
  app/                    # ルーティング層（変更なし）
  content/                # コンテンツデータ層（拡張）
    blog/                 # 既存Markdown（変更なし）
    data/                 # src/data/から移動（共有データの明示的な配置場所）
      kanji-data.json
      yoji-data.json
      traditional-colors.json
      ...schedule.json
  tools/                  # 変更なし（既にコロケーション済み）
  cheatsheets/            # 変更なし（既にコロケーション済み）
  components/             # 変更なし
  lib/                    # 変更なし
  types/
  test/
```

**メリット:**
- 最小限の変更で最大の問題（src/data/の分散、src/content/のblogのみ問題）を解決
- 既存のインポートパスへの影響が最小（src/data/ -> src/content/data/のみ）
- 動作確認が容易
- リスクが低い

**デメリット:**
- フィーチャーの散在問題（games 153ファイルの分散）は解決しない
- 本質的な構造問題は先送り
- 改善幅が小さい

---

## 6. 推奨と考察

### フィーチャー別のファイル分散状況（現状の問題の深刻さ）

| フィーチャー | 分散先 | 総ファイル数 |
|---|---|---|
| games | app/, components/games/, lib/games/, data/ | 153 |
| tools | app/tools/, components/tools/, tools/ | 197 |
| blog | app/blog/, components/blog/, content/blog/, lib/blog.ts | 59 |
| dictionary | app/dictionary/, app/colors/, components/dictionary/, lib/dictionary/, data/ | 53 |
| quiz | app/quiz/, components/quiz/, lib/quiz/ | 29 |
| cheatsheets | app/cheatsheets/, components/cheatsheets/, cheatsheets/ | 37 |
| memos | app/memos/, components/memos/, lib/memos*.ts | 18 |
| search | components/search/, lib/search/ | 15 |

toolsは既にsrc/tools/で高い凝集度を持つが、components/tools/が別に存在する。gamesは4箇所に散在しており最も問題が大きい。

### 推奨

**案Bのフィーチャーベース完全統合型を推奨する。** 理由:

1. **現在のプロジェクトの最大の問題は、1つのフィーチャーに関するファイルが3-4箇所に散在していること。** とくにgames（153ファイルが4箇所）とtools（components/tools/とsrc/tools/の分離）が顕著。

2. **src/tools/が既にフィーチャーベース構造の成功例を示している。** Component, logic, meta, CSS, testsが同一ディレクトリに配置されており、ツール追加時の作業が明快。これを他フィーチャーにも拡大するのが自然。

3. **Next.js公式が戦略Cとして推奨している方向性と合致する。**

4. **6種類のコンテンツタイプ（tools, games, blog, dictionary/colors, quiz, cheatsheets）があり、今後も増える可能性がある。** フィーチャーベースならスケーラブル。

ただし、移行コストが大きいため、段階的に実施することを推奨する。優先順位:
1. games（散在が最も深刻、153ファイル）
2. tools + components/tools/ の統合
3. quiz, dictionary, cheatsheets
4. blog, memos, search

### 共有データの配置について

kanji-data.json, yoji-data.json, traditional-colors.jsonはdictionaryとgamesの両方から参照される。案Bではfeatures/dictionary/data/に配置し、gamesから`@/features/dictionary/data/`として参照するのが最もシンプル。dictionaryがデータの「権威ある出典」であり、gamesはそのデータの「利用者」という関係が明確になる。
