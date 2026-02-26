# アーキテクチャ決定記録（ADR）: ディレクトリ構造リファクタリング

B-119 で実施したディレクトリ構造リファクタリングにおけるアーキテクチャ決定を記録する。

## 背景

プロジェクトのコードベースが成長するにつれ、フィーチャー（games, quiz, dictionary, blog, memos等）のコードが `src/lib/`, `src/components/`, `src/data/` に分散し、コードの凝集度が低下していた。特に games は154ファイルが4箇所に散在しており、新機能追加や修正が困難な状態であった。

深層調査（B-119）で6パターンを7観点（コロケーション、AI可読性、スケーラビリティ、移行コスト、Next.js親和性、テスト可能性、一貫性）で評価し、パターンC「ハイブリッド型」を採用した。

---

## 1. 採用パターン: ハイブリッド型（パターンC）

フィーチャー単位のディレクトリを `src/` 直下に配置し、共有コードは `src/lib/`, `src/components/` に残す方式。

### 選定根拠

1. **現在の成功パターンの自然な拡張**: `src/tools/` は32ツールが コンポーネント・ロジック・メタ・CSS・テスト のコロケーションに成功しており、`src/cheatsheets/` も同様。この成功パターンを他のフィーチャーに展開するのが最も一貫性が高い。

2. **段階的移行が可能（リスク分散）**: フィーチャー単位で段階的に移行でき、1回あたり15-80ファイルの作業量に収まる。各ステップで検証できる。

3. **最大のペインポイントを解決**: games（154ファイル/4箇所散在）の問題を完全に解決できる。

4. **Next.js親和性が高い**: Next.js公式戦略（appの外にプロジェクトファイルを配置）の自然な発展形。`app/` はルーティング専用のまま。

5. **将来のスケーラビリティ**: フィーチャー数が15-20に増えた場合、パターンB（`features/` 配下に集約）への移行が比較的容易。

---

## 2. 不採用パターンとその理由

### パターンB: features/ 集約型

- 移行コスト最大（500+ファイル一括移行）で、理論上の優位性（コロケーション 5/5）がパターンC（4/5）と実質的に僅差
- `features/` という追加のネスト層が Next.js のルーティング構造（`app/`）との間に不要な乖離を生む
- 既に `src/tools/` が `src/` 直下で成功しており、`features/tools/` への移動は既存の成功を不必要に壊す

### パターンA: 現状維持型

- games の4箇所散在（154ファイル）問題が解決されず、長期的にメンテナンス効率が低下し続ける

---

## 3. 最終ディレクトリ構造

```
src/
  app/                        # ルーティング層（page.tsx, layout.tsx のみ）

  tools/                      # 32ツール + _components/ + registry.ts + types.ts
  cheatsheets/                # 各チートシート + _components/ + registry.ts + types.ts
  games/                      # 4ゲーム + shared/ + registry.ts + types.ts
    kanji-kanaru/             # _components/, _lib/, data/
    yoji-kimeru/              # _components/, _lib/, data/
    nakamawake/               # _components/, _lib/, data/
    irodori/                  # _components/, _lib/, data/
    shared/                   # _components/, _lib/
  dictionary/                 # _components/, _lib/
  quiz/                       # _components/, data/ + registry.ts + scoring.ts + types.ts
  blog/                       # _components/, _lib/, content/（Markdownファイル）
  memos/                      # _components/, _lib/

  data/                       # 共有データ（複数フィーチャーが参照するJSON）
  components/                 # 共有コンポーネント
    common/                   # Header, Footer, Breadcrumb, Pagination等
    search/                   # SearchTrigger, SearchModal等
  lib/                        # 共有ユーティリティ
    search/                   # build-index.ts等
    __tests__/                # 共有ユーティリティのテスト
  types/                      # サードパーティ型定義
  test/                       # テストセットアップ
```

---

## 4. ディレクトリの責任と配置ルール

| 分類               | ディレクトリ             | 責任                                              | 配置すべきもの                                                             |
| ------------------ | ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------- |
| フィーチャー       | `src/{feature-name}/`    | 1つのフィーチャーの全コード                       | そのフィーチャー固有のコンポーネント、ロジック、型、テスト、データ         |
| ルーティング       | `src/app/{route}/`       | Next.jsルーティングとページエントリ               | page.tsx, layout.tsx, opengraph-image.tsx のみ。ビジネスロジックは置かない |
| 共有コンポーネント | `src/components/common/` | 2つ以上のフィーチャーから使われるUIコンポーネント | Breadcrumb, Pagination, ShareButtons等                                     |
| 基盤コンポーネント | `src/components/search/` | アプリ全体の基盤UI機能                            | 検索モーダル、検索入力等                                                   |
| 共有ユーティリティ | `src/lib/`               | フィーチャー横断の汎用ロジック                    | constants, date, seo, pagination, markdown等                               |
| 共有データ         | `src/data/`              | 複数フィーチャーから参照されるデータファイル      | 辞典+ゲーム共用JSON                                                        |
| コンテンツ         | `src/{feature}/content/` | フィーチャー固有のMarkdownコンテンツ              | ブログ記事MD（`src/blog/content/`）                                        |

---

## 5. フィーチャー間依存のルール

### 基本原則

- フィーチャー同士が直接 import しない
- 共有が必要なコードは `src/lib/` または `src/components/common/` に昇格させる

### 「共有層に置くべきか？」の判断基準

- 現在1フィーチャーのみ利用 -> フィーチャーディレクトリ内に配置
- 2つ以上のフィーチャーから利用 -> `src/lib/` または `src/components/common/` に昇格
- アプリ全体の基盤機能（検索、SEO、フィード等） -> `src/lib/` に配置

### 許容される例外

#### AP-5: seo.ts の型依存

`src/lib/seo.ts` は `ToolMeta`, `CheatsheetMeta`, `QuizMeta` の3つのフィーチャー型を `import type` で参照している。これは型のみの依存でランタイムへの影響はなく、サイト全体のSEO一貫性を維持するために意図的に共有層に集約している。

#### layout.tsx のフィーチャー参照

`src/app/layout.tsx` は games/registry からゲーム一覧を取得し、Footer にナビゲーションデータを props で渡している。layout.tsx はアプリのルーティングルート定義であり、全フィーチャーの存在を把握している場所として、この依存は構造上自然で許容される。

---

## 6. search を共有層に残した理由

search（`src/components/search/` + `src/lib/search/`）はフィーチャーディレクトリに移動せず、共有層に残した。理由は以下の通り:

1. **アプリ全体の基盤機能**: search は特定のフィーチャーではなく、サイト全体の検索機能を提供する基盤コンポーネントである。ヘッダーから起動され、全ページで利用可能。

2. **全フィーチャーを横断的に参照**: `build-index.ts` は tools, cheatsheets, games, quiz, dictionary, blog, memos の全7フィーチャーの registry を横断的に参照して検索インデックスを構築する。この性質上、特定のフィーチャー単位でコロケーションすることが適さない。

---

## 7. src/content/ ディレクトリを使用しない理由

`src/content/` ディレクトリはプロジェクト内に存在しない。これは意図的な決定である。

- `src/content/` は Astro フレームワークの Content Collections の標準ディレクトリと同一名称であり、AIエージェントがプロジェクトのフレームワークを誤認するリスクがある
- 本プロジェクトは Next.js ベースであり、Astro は使用していない
- Markdownコンテンツは各フィーチャーディレクトリ内の `content/` サブディレクトリに配置する（例: `src/blog/content/`）

---

## 8. 将来のスケーラビリティ

### フィーチャー数の増加

現時点で `src/` 直下のフィーチャーディレクトリは7個（tools, cheatsheets, games, dictionary, quiz, blog, memos）。将来15-20に増えた場合:

- `src/features/` ディレクトリを新設し、全フィーチャーを配下に移動（パターンB相当）
- 内部構造の変更は不要で、ディレクトリの「移動」のみで対応可能

### 共有データの増加

現在 `src/data/` の共有データは3ファイル（kanji-data.json, yoji-data.json, traditional-colors.json）のみ。10ファイルを超える場合はサブディレクトリでの分類を検討する。

---

## 参照

- B-119 計画v2.1: 19c97779e81
- B-119 計画v2.2差分: 19c977e9ac8
- 深層調査結果: 19c976845ac
