# B-055/B-057: ディレクトリ構成整理 + i18n 設計ドキュメント（改訂版）

## 前回設計からの変更点サマリ

本改訂は、ownerフィードバック（メモ 19c7b2aeeda）の全6論点と、3件の追加調査（調査A: i18n翻訳アーキテクチャ、調査B: ディレクトリ命名と分類、調査C: URL挙動設計）の結果を統合したものである。

### 主な変更点

1. **翻訳アーキテクチャの全面刷新**: 単一巨大JSONファイル方式を廃止し、ハイブリッド3層方式を採用。レジストリパターンのページ間独立性を維持する
2. **言語未指定URLの挙動変更**: proxy.tsによるrewrite方式を廃止。旧URLは308リダイレクトのみ、新コンテンツの言語未指定URLは404、トップページは言語選択画面を表示
3. **ディレクトリ統合の方針転換**: `/learn` への全統合を撤回。`/colors` を `/dictionary/colors` に統合する最小変更のみ実施
4. **games/quiz統合の撤回**: games と quiz は独立維持。性質の異なるコンテンツを無理に統合しない
5. **cheatsheets配置の変更**: `/learn/cheatsheets` への統合を撤回。独立した `/cheatsheets` を維持
6. **about/memos統合の撤回**: `/yolos` への統合を撤回。`/about` と `/memos` を独立維持
7. **proxy.tsの廃止**: YAGNI原則に基づき不要と判断。next.config.tsのredirectsとファイルシステムルートで全挙動を実現

### ownerフィードバック対応表

| #   | ownerの指摘                                    | 前回設計の問題                       | 今回の対応                                                                                               |
| --- | ---------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | 言語別JSONが巨大になりレジストリパターンを潰す | 単一JSONに全テキストを集約           | ハイブリッド3層方式: 共通UIのみ小JSONファイル、ページ固有データはmeta.tsに内包、長文は言語別ディレクトリ |
| 2   | 言語・地域ごとの個別最適化ができない           | 全ページが同一JSON参照               | `availableLocales` フィールドとファイル有無による個別制御                                                |
| 3   | 言語未指定URLの挙動がちぐはぐ                  | 旧URLはリダイレクト、新URLは直接表示 | 旧URLは308リダイレクト、新URLの言語未指定は404、トップは言語選択画面                                     |
| 4   | 統合先名称を他の案と比較していない             | `/learn` を無検討で採用              | 10候補を比較検討し最小変更案を選定                                                                       |
| 5   | games/quiz統合でサブディレクトリ分けは矛盾     | `/games/quiz/[slug]`                 | games と quiz を独立維持（統合自体を撤回）                                                               |
| 6   | cheatsheets配置も同様の問題                    | `/learn/cheatsheets/[slug]`          | cheatsheets を独立維持                                                                                   |

---

## 1. 概要

### 1.1 目的

この設計は以下の2つの課題を解決する:

1. **ディレクトリ構成の整理**: 論理的に同じカテゴリに属するコンテンツ（伝統色辞典）を適切な場所に配置する
2. **多言語対応(i18n)**: サブディレクトリ方式（`/ja/`, `/en/`）で国際化基盤を構築する

URL変更を伴うため、一度にまとめて実施することでリダイレクト設定の複雑さを最小限に抑える。

### 1.2 背景

- 現在13種類のトップレベルディレクトリが存在
- `/colors`（伝統色辞典）は `/dictionary` ページから既にリンクされており、辞典の一部として認識されているが、URLは独立している
- 現在のサイトは日本語のみで、`<html lang="ja">` がハードコードされている
- サイトは「レジストリパターン」を採用しており、各コンテンツが自己完結的なディレクトリ内に全ファイルを持つ。この設計が複数エージェントの同時開発を可能にしている

### 1.3 技術スタック

- Next.js 16.1.6（App Router）
- 静的生成（`generateStaticParams`）を多用
- 現在middleware/proxyファイルは未使用

### 1.4 設計原則

- **レジストリパターンの維持**: ページ間独立性を最優先し、単一ファイルへの依存を避ける
- **最小変更・最大効果**: 変更量を最小限に抑えつつ、最大の構造改善を得る
- **YAGNI原則**: 現時点で不要な機能は実装しない
- **一貫性**: 同じ状況には同じ挙動を適用する

---

## 2. 設計判断

### 2.1 ディレクトリ統合の範囲

**判断: `/colors` を `/dictionary/colors` に統合する最小変更のみ実施。それ以外の統合は行わない。**

#### 検討した代替案

| 案                            | 内容                                                            | 評価                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A. `/reference` 全統合        | dictionary, colors, cheatsheets を全て `/reference` 配下に統合  | 拡張性は高いが変更量が大きい。辞典（日本文化）とチートシート（開発者向け）はターゲットユーザーが全く異なり、同一入口に誘導するのは不自然 |
| B. `/dictionary` 全統合       | dictionary, colors, cheatsheets を全て `/dictionary` 配下に統合 | 既存URLを活かせるが、チートシートを「辞典」に含めるのは意味的に無理がある                                                                |
| C. `/colors` のみ統合（採用） | `/colors` を `/dictionary/colors` に移動。他は独立維持          | 変更最小。伝統色辞典は既に辞典ページからリンクされており論理的に一貫。チートシートは独立維持                                             |
| D. 全て独立維持               | 変更なし                                                        | i18n対応のみ実施。`/colors` が辞典と分離したままという不整合が残る                                                                       |

**選定理由**:

- 伝統色辞典は漢字辞典・四字熟語辞典と同質のコンテンツ（日本文化に関する辞典）であり、`/dictionary` 配下への統合は論理的に一貫する。既に `/dictionary` ページから「伝統色辞典」としてリンクされている実態にも合致する
- チートシート（開発者向けクイックリファレンス）は辞典（日本文化の知識）とターゲットユーザーが完全に異なる。無理な統合はユーザーの混乱を招く
- 変更箇所が最小（`/colors` の移動のみ）であり、リスクが低い
- SEOへの影響が最小限に抑えられる

### 2.2 games/quiz の統合

**判断: games と quiz を独立維持する。統合は行わない。**

#### 検討した代替案

| 案                                | 内容                                                       | 評価                                                                                                         |
| --------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A. フラット統合                   | quiz を games 配下にフラットに配置（`/games/kanji-level`） | 「診断クイズ」を「ゲーム」と呼ぶことへの違和感。真剣に漢字力を測りたいユーザーにとって「ゲーム」は軽く見える |
| B. サブディレクトリ統合（前回案） | `/games/quiz/[slug]`                                       | ownerが明確に矛盾を指摘。統合したのに内部で分けるのは論理的に不整合                                          |
| C. 独立維持（採用）               | `/games` と `/quiz` を別々に維持                           | コンテンツの性質の違い（デイリーパズル vs 常設診断テスト）を正確に反映                                       |

**選定理由**:

- デイリーパズル（日替わり、1日1回、推理型）と診断クイズ（常設、何度でも、結果共有型）はユーザー体験が根本的に異なる
- ナビゲーション項目数の問題は、ヘッダーのグルーピング（ドロップダウンメニューなど）で解決すべきUI設計の問題であり、URL統合で解決すべき問題ではない
- 外部サイトの事例でも、Merriam-Websterは `/dictionary` と `/games` を完全分離、MDNは `/Reference` と `/Learn` を明確分離しており、性質の異なるコンテンツの分離は一般的な手法

### 2.3 cheatsheets の配置

**判断: `/cheatsheets` を独立維持する。統合は行わない。**

#### 検討した代替案

| 案                          | 内容                     | 評価                                                                              |
| --------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| A. `/learn/cheatsheets`     | 学習コンテンツとして統合 | ownerが指摘した games/quiz と同様の問題。辞典の中にチートシートがある動線は不自然 |
| B. `/reference/cheatsheets` | リファレンスとして統合   | `/reference` を統合先とすれば意味は通るが、統合先の名称変更自体が大きな変更       |
| C. `/tools` 配下に移動      | 開発者ツールの一種として | ツール（インタラクティブ）とチートシート（静的参照）は操作体験が異なる            |
| D. 独立維持（採用）         | `/cheatsheets` のまま    | 開発者が「git cheatsheet」で検索して直接到達する動線を維持。SEO上最も有利         |

**選定理由**:

- チートシートのターゲットユーザー（開発者）と辞典のターゲットユーザー（日本文化に興味のある人）は全く異なる
- `/cheatsheets/git` のようなURLは検索クエリ「git cheatsheet」に直結し、SEO上有利
- 独立したセクションとして将来の拡張（Docker, SQL, Vim等のチートシート追加）も自由

### 2.4 about/memos の統合

**判断: `/about` と `/memos` を独立維持する。`/yolos` への統合は行わない。**

#### 検討した代替案

| 案                           | 内容                                    | 評価                                                                                                  |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A. `/yolos` に統合（前回案） | about と memos を `/yolos` 配下に統合   | 「yolos」はサイト名であってカテゴリ名ではない。ユーザーにとって `/yolos/memos` が何を意味するか不明瞭 |
| B. `/project` に統合         | about と memos を `/project` 配下に統合 | about はサイト全体の説明、memos はエージェント間通信の記録であり、性質が異なる                        |
| C. 独立維持（採用）          | `/about` と `/memos` を別々に維持       | それぞれの役割が明確。about はサイト説明、memos はエージェント活動の透明性確保                        |

**選定理由**:

- `/about` は一般的なWebサイトの慣習に従うセクションであり、訪問者が直感的にサイト情報を見つけられる
- `/memos` はエージェント間通信の公開記録という独自の性質を持ち、about とは独立した価値を提供する
- 統合によるナビゲーション項目数の削減効果は小さく、ユーザーの理解を損なうリスクのほうが大きい

---

## 3. URL設計

### 3.1 新カテゴリ体系

| カテゴリ     | パス                  | 説明                           | 変更                                |
| ------------ | --------------------- | ------------------------------ | ----------------------------------- |
| トップ       | `/`                   | 言語選択画面                   | 新規                                |
| トップ       | `/{lang}`             | 言語別トップページ             | 新規                                |
| ツール       | `/{lang}/tools`       | 便利ツール全般                 | 言語プレフィックス追加              |
| ゲーム       | `/{lang}/games`       | デイリーパズル                 | 言語プレフィックス追加              |
| クイズ       | `/{lang}/quiz`        | クイズ・診断                   | 言語プレフィックス追加              |
| 辞典         | `/{lang}/dictionary`  | 漢字・四字熟語・伝統色の辞典   | 言語プレフィックス追加 + colors統合 |
| チートシート | `/{lang}/cheatsheets` | 開発者向けクイックリファレンス | 言語プレフィックス追加              |
| ブログ       | `/{lang}/blog`        | ブログ記事                     | 言語プレフィックス追加              |
| About        | `/{lang}/about`       | サイト概要                     | 言語プレフィックス追加              |
| メモ         | `/{lang}/memos`       | メモアーカイブ                 | 言語プレフィックス追加              |

### 3.2 完全なURLマッピング（旧URL -> 新URL）

#### ツール（言語プレフィックス追加のみ）

| 旧URL           | 新URL              |
| --------------- | ------------------ |
| `/tools`        | `/ja/tools`        |
| `/tools/[slug]` | `/ja/tools/[slug]` |

#### ゲーム（言語プレフィックス追加のみ）

| 旧URL                 | 新URL                    |
| --------------------- | ------------------------ |
| `/games`              | `/ja/games`              |
| `/games/kanji-kanaru` | `/ja/games/kanji-kanaru` |
| `/games/yoji-kimeru`  | `/ja/games/yoji-kimeru`  |
| `/games/nakamawake`   | `/ja/games/nakamawake`   |
| `/games/irodori`      | `/ja/games/irodori`      |

#### クイズ（言語プレフィックス追加のみ）

| 旧URL                            | 新URL                               |
| -------------------------------- | ----------------------------------- |
| `/quiz`                          | `/ja/quiz`                          |
| `/quiz/[slug]`                   | `/ja/quiz/[slug]`                   |
| `/quiz/[slug]/result/[resultId]` | `/ja/quiz/[slug]/result/[resultId]` |

#### 辞典（colors を dictionary に統合 + 言語プレフィックス追加）

| 旧URL                                   | 新URL                                       |
| --------------------------------------- | ------------------------------------------- |
| `/dictionary`                           | `/ja/dictionary`                            |
| `/dictionary/kanji`                     | `/ja/dictionary/kanji`                      |
| `/dictionary/kanji/[char]`              | `/ja/dictionary/kanji/[char]`               |
| `/dictionary/kanji/category/[category]` | `/ja/dictionary/kanji/category/[category]`  |
| `/dictionary/yoji`                      | `/ja/dictionary/yoji`                       |
| `/dictionary/yoji/[yoji]`               | `/ja/dictionary/yoji/[yoji]`                |
| `/dictionary/yoji/category/[category]`  | `/ja/dictionary/yoji/category/[category]`   |
| `/colors`                               | `/ja/dictionary/colors`                     |
| `/colors/[slug]`                        | `/ja/dictionary/colors/[slug]`              |
| `/colors/category/[category]`           | `/ja/dictionary/colors/category/[category]` |

#### チートシート（言語プレフィックス追加のみ）

| 旧URL                 | 新URL                    |
| --------------------- | ------------------------ |
| `/cheatsheets`        | `/ja/cheatsheets`        |
| `/cheatsheets/[slug]` | `/ja/cheatsheets/[slug]` |

#### ブログ（言語プレフィックス追加のみ）

| 旧URL                       | 新URL                          |
| --------------------------- | ------------------------------ |
| `/blog`                     | `/ja/blog`                     |
| `/blog/[slug]`              | `/ja/blog/[slug]`              |
| `/blog/category/[category]` | `/ja/blog/category/[category]` |

#### About（言語プレフィックス追加のみ）

| 旧URL    | 新URL       |
| -------- | ----------- |
| `/about` | `/ja/about` |

#### メモ（言語プレフィックス追加のみ）

| 旧URL                | 新URL                   |
| -------------------- | ----------------------- |
| `/memos`             | `/ja/memos`             |
| `/memos/[id]`        | `/ja/memos/[id]`        |
| `/memos/thread/[id]` | `/ja/memos/thread/[id]` |

#### トップページ

| 旧URL | 新URL               |
| ----- | ------------------- |
| `/`   | `/`（言語選択画面） |

#### その他（言語に依存しないパス — 変更なし）

| パス           | 扱い                                 |
| -------------- | ------------------------------------ |
| `/feed`        | 変更なし（言語別フィードは将来検討） |
| `/feed/atom`   | 変更なし                             |
| `/sitemap.xml` | 多言語URLに更新                      |
| `/robots.txt`  | 変更なし                             |
| `/ads.txt`     | 変更なし                             |

### 3.3 言語未指定URLの挙動

ownerの方針に基づき、以下の一貫したルールを適用する:

| アクセス先                                    | 挙動                        | 理由                                               |
| --------------------------------------------- | --------------------------- | -------------------------------------------------- |
| `/`                                           | 言語選択画面を表示          | ユーザーが自分で言語を選択できるランディングページ |
| 旧URL（例: `/tools`, `/dictionary/kanji/山`） | `/ja/...` に308リダイレクト | 既存のSEO資産とブックマークの保護                  |
| 言語なし新URL（例: `/tools/new-future-tool`） | 404                         | 一貫性のため。リダイレクトと直接表示の混在を避ける |
| `/{lang}/...`（例: `/ja/tools`, `/en/tools`） | 正常表示                    | 言語プレフィックス付きが正規のURL形式              |
| 未サポート言語（例: `/xx/tools`）             | 404                         | `hasLocale()` チェックで検出                       |

**一貫性の確保**: 前回設計では「旧URLはリダイレクト、新URLは直接表示」という不整合があった。今回は「言語プレフィックスなしのURLは全て旧URLの308リダイレクトか404」という明確なルールを適用する。これにより、ユーザーがどのページにアクセスしても同じ挙動を期待できる。

---

## 4. 技術設計

### 4.1 ディレクトリ構造

```
src/
  app/
    layout.tsx               # 最小限のルートレイアウト
    page.tsx                 # ルート（/）→ 言語選択画面
    not-found.tsx            # バイリンガル404ページ
    sitemap.ts               # 多言語対応サイトマップ
    robots.ts                # 変更なし
    feed/                    # 変更なし
    [lang]/
      layout.tsx             # 言語別ルートレイアウト（<html lang={lang}>）
      page.tsx               # 言語別トップページ
      not-found.tsx          # 言語別404ページ
      tools/
        page.tsx             # ツール一覧
        [slug]/
          page.tsx           # 個別ツール
      games/
        page.tsx             # ゲーム一覧
        kanji-kanaru/
          page.tsx
        yoji-kimeru/
          page.tsx
        nakamawake/
          page.tsx
        irodori/
          page.tsx
      quiz/
        page.tsx             # クイズ・診断一覧
        [slug]/
          page.tsx           # 個別クイズ
          result/
            [resultId]/
              page.tsx       # クイズ結果
      dictionary/
        page.tsx             # 辞典トップ
        kanji/
          page.tsx           # 漢字辞典一覧
          [char]/
            page.tsx
          category/
            [category]/
              page.tsx
        yoji/
          page.tsx           # 四字熟語辞典一覧
          [yoji]/
            page.tsx
          category/
            [category]/
              page.tsx
        colors/              # /colors から移動
          page.tsx           # 伝統色辞典一覧
          [slug]/
            page.tsx
          category/
            [category]/
              page.tsx
      cheatsheets/
        page.tsx             # チートシート一覧
        [slug]/
          page.tsx
      blog/
        page.tsx             # ブログ一覧
        [slug]/
          page.tsx
        category/
          [category]/
            page.tsx
      about/
        page.tsx             # サイト概要
      memos/
        page.tsx             # メモ一覧
        layout.tsx
        [id]/
          page.tsx
        thread/
          [id]/
            page.tsx
  lib/
    i18n/
      config.ts              # Locale型、SUPPORTED_LOCALES、DEFAULT_LOCALE
      common.ja.json         # 共通UIラベル（日本語、100行以下）
      common.en.json         # 共通UIラベル（英語、100行以下）
      dictionary.ts          # getDictionary関数
      resolve.ts             # resolveLocalized ヘルパー
  content/
    blog/
      ja/                    # 日本語ブログ記事
      en/                    # 英語ブログ記事（将来）
```

### 4.2 翻訳アーキテクチャ: ハイブリッド3層方式

ownerが指摘した「単一巨大JSONファイル」の問題を解決するため、データの特性に応じて3つの管理方式を使い分ける。

#### 層A: 共通UIラベル — 小さなJSONファイル

ヘッダー、フッター、パンくずリスト、ボタン等の固定テキスト。全ページ共通で少量（推定100行以下）。

```
src/lib/i18n/
  common.ja.json
  common.en.json
  dictionary.ts          # getDictionary関数（server-only）
```

```json
// common.ja.json の例（推定50-100行）
{
  "nav": {
    "home": "ホーム",
    "tools": "ツール",
    "games": "ゲーム",
    "quiz": "クイズ",
    "dictionary": "辞典",
    "cheatsheets": "チートシート",
    "blog": "ブログ",
    "memos": "メモ",
    "about": "About"
  },
  "footer": {
    "disclaimer": "このサイトはAIによる実験的プロジェクトです。コンテンツが不正確な場合があります。",
    "copyright": "yolos.net"
  },
  "common": {
    "backToTop": "トップに戻る",
    "notFound": "ページが見つかりません",
    "loading": "読み込み中...",
    "search": "検索"
  }
}
```

**レジストリパターンとの整合性**: このファイルは十分に小さく（100行以下）、変更頻度も低い。全ページが参照する共通UIラベルであるため、単一ファイルでの管理が合理的。LLMコンテキストへの圧迫もない。

#### 層B: ページ固有メタデータ — meta.ts の多言語拡張

各ページのtitle, description, keywords等。SEOに直結するデータ。

```typescript
// src/tools/types.ts の変更
type LocalizedString = { ja: string; en?: string };
type LocalizedStringArray = { ja: string[]; en?: string[] };

export interface ToolMeta {
  slug: string;
  name: LocalizedString; // 旧: name + nameEn を統合
  description: LocalizedString;
  shortDescription: LocalizedString;
  keywords: LocalizedStringArray;
  category: ToolCategory;
  relatedSlugs: string[];
  publishedAt: string;
  structuredDataType?: string;
  availableLocales?: string[]; // 新規: 未指定なら全言語対応
}
```

```typescript
// src/tools/json-formatter/meta.ts の変更例
export const meta: ToolMeta = {
  slug: "json-formatter",
  name: { ja: "JSON整形・検証", en: "JSON Formatter & Validator" },
  description: {
    ja: "JSONデータの整形・圧縮・検証ができるオンラインツール...",
    en: "Online JSON formatting, minifying and validation tool...",
  },
  shortDescription: {
    ja: "JSONの整形・圧縮・バリデーション",
    en: "Format, minify & validate JSON",
  },
  keywords: {
    ja: ["JSON整形", "JSONフォーマット"],
    en: ["JSON formatter", "JSON validator"],
  },
  category: "developer",
  relatedSlugs: ["base64", "url-encode"],
  publishedAt: "2026-02-13",
};
```

**ロケール解決ヘルパー**:

```typescript
// src/lib/i18n/resolve.ts
export function resolveLocalized(
  value: LocalizedString,
  locale: Locale,
): string {
  return value[locale] ?? value.ja; // フォールバック: 日本語
}
```

**レジストリパターンとの整合性**: 各ツールの meta.ts は独立したファイルであり、並行開発でも衝突しない。既存の `nameEn` フィールドから自然に移行できる。registry.ts の変更は型の変更のみで最小限。

**他の型への同様の適用**: `ToolMeta` だけでなく、以下の型にも同じ `LocalizedString` 型を適用する:

- **CheatsheetMeta**（`src/cheatsheets/types.ts`）: 既に `name` と `nameEn` フィールドが存在しており、`LocalizedString` 型の `{ ja: string; en?: string }` へ自然に統合できる。`description`, `shortDescription`, `keywords` も同様に多言語対応とする。
- **QuizMeta**（`src/lib/quiz/types.ts`）: 現在は `title`, `description`, `shortDescription` が単一言語の文字列型である（`nameEn` フィールドは存在しない）。これらを `LocalizedString` 型に変更し、`keywords` を `LocalizedStringArray` 型に変更する。

全レジストリの型を一貫して `LocalizedString` / `LocalizedStringArray` に統一することで、`resolveLocalized()` ヘルパーを全コンテンツ種別に対して共通で利用できる。

#### 層C: 長文コンテンツ — 言語別ディレクトリ

ブログ記事、辞典データなどの分量が大きいコンテンツ。

```
src/content/blog/
  ja/
    2026-02-14-nextjs-static-tool-pages-design-pattern.md
  en/
    2026-02-14-nextjs-static-tool-pages-design-pattern.md  # 英語版がある記事のみ
```

**レジストリパターンとの整合性**: ファイルの有無で言語対応を自動判定できる。英語版は新規作成する記事のみ対応すればよく、過去記事の翻訳は任意。

#### 言語・地域ごとの個別制御

`availableLocales` フィールドにより、ページ単位で言語対応を制御する:

- 漢字辞典、四字熟語辞典、漢字カナール、四字キメル等: `availableLocales: ["ja"]` — 日本語固有コンテンツ
- ツール（JSON整形等）: `availableLocales` 未指定 — 全言語対応
- ブログ記事: ファイルの有無で制御 — 記事ごとに個別判断

#### 外部ライブラリ不要の根拠

next-intl、Paraglide JS、Lingui等の外部ライブラリを検討したが、以下の理由で自前実装が最適:

- 本プロジェクトの翻訳要件（UIラベル + ページメタデータ + 長文コンテンツ）は、外部ライブラリの主要ユースケース（大量UIメッセージの管理）とは異なる
- ページメタデータと長文コンテンツの管理はどのライブラリでもカバーされない
- レジストリパターンとの統合にカスタマイズが必要であり、外部依存のメリットが薄い
- サイト規模（UIラベル100行以下）では自前実装で十分

### 4.3 proxy.ts は設置しない

**判断: proxy.tsは不要（YAGNI原則）**

ownerの方針（旧URLの308リダイレクトのみ、新コンテンツの言語未指定URLは404、トップページは言語選択画面）の全ての挙動は、`next.config.ts` の redirects とファイルシステムルートだけで実現できる。

処理フロー:

```
リクエスト
  -> next.config.ts redirects (旧URL -> /ja/... の308リダイレクト)
  -> ファイルシステムルート (app/[lang]/..., app/page.tsx 等)
  -> マッチしない場合 -> 404
```

| リクエスト  | 処理                                       | 結果                          |
| ----------- | ------------------------------------------ | ----------------------------- |
| `/`         | app/page.tsx にマッチ                      | 言語選択画面                  |
| `/tools`    | next.config.ts redirects                   | `/ja/tools` に308リダイレクト |
| `/ja/tools` | app/[lang]/tools/page.tsx にマッチ         | ツール一覧表示                |
| `/en/tools` | app/[lang]/tools/page.tsx にマッチ         | ツール一覧表示（英語）        |
| `/xx/tools` | app/[lang] にマッチ → hasLocale() チェック | 404                           |
| `/new-path` | ファイルシステムにマッチしない             | 404                           |
| `/feed`     | app/feed/ にマッチ                         | フィード表示                  |

将来的にproxy.tsが必要になった場合（Cookie保存、Accept-Language検出等）は、その時点で追加する。

### 4.4 トップページ言語選択画面

`/` にアクセスした場合に表示する言語選択画面。`src/app/page.tsx` として実装。

設計のポイント:

- サイト名とタグラインを日英両方で併記
- 言語選択ボタンを2列グリッドで配置（日本語ボタン -> `/ja`、英語ボタン -> `/en`）
- AI免責事項を日英両方で表示（Constitution Rule 3 遵守）
- Cookieへの言語保存はしない（YAGNI原則）
- 静的ページとして完全に静的生成可能

```
+----------------------------------------------+
|          yolos.net                            |
|                                               |
|   AIエージェントが企画・開発・運営する          |
|   Webサイト                                   |
|   A website planned, developed, and operated  |
|   by AI agents                                |
|                                               |
|   +------------------+  +------------------+  |
|   |   日本語         |  |   English        |
|   +------------------+  +------------------+  |
|                                               |
|   このサイトはAIによる実験的プロジェクトです。  |
|   This site is an experimental AI project.    |
+----------------------------------------------+
```

### 4.5 404ページの設計

言語が不明なコンテキスト（ルートレベルの404）では、バイリンガル表示で言語別トップページへ誘導する。

- `src/app/not-found.tsx`: バイリンガル404（日英両方で表示、言語別トップへのリンク）
- `src/app/[lang]/not-found.tsx`: 言語別404（該当言語でのみ表示）

### 4.6 リダイレクト設計

`next.config.ts` の `redirects()` で全旧URLを `/ja/...` に308リダイレクトする。Next.jsでは `permanent: true` は308ステータスコードを返す。Google公式によると301/302/307/308いずれもPageRankの損失はない。

```typescript
async redirects() {
  return [
    // Tools
    { source: "/tools", destination: "/ja/tools", permanent: true },
    { source: "/tools/:slug", destination: "/ja/tools/:slug", permanent: true },

    // Games
    { source: "/games", destination: "/ja/games", permanent: true },
    { source: "/games/:slug", destination: "/ja/games/:slug", permanent: true },

    // Quiz
    { source: "/quiz", destination: "/ja/quiz", permanent: true },
    { source: "/quiz/:slug/result/:resultId", destination: "/ja/quiz/:slug/result/:resultId", permanent: true },
    { source: "/quiz/:slug", destination: "/ja/quiz/:slug", permanent: true },

    // Dictionary
    { source: "/dictionary", destination: "/ja/dictionary", permanent: true },
    { source: "/dictionary/kanji/category/:cat", destination: "/ja/dictionary/kanji/category/:cat", permanent: true },
    { source: "/dictionary/kanji/:char", destination: "/ja/dictionary/kanji/:char", permanent: true },
    { source: "/dictionary/kanji", destination: "/ja/dictionary/kanji", permanent: true },
    { source: "/dictionary/yoji/category/:cat", destination: "/ja/dictionary/yoji/category/:cat", permanent: true },
    { source: "/dictionary/yoji/:yoji", destination: "/ja/dictionary/yoji/:yoji", permanent: true },
    { source: "/dictionary/yoji", destination: "/ja/dictionary/yoji", permanent: true },

    // Colors -> Dictionary/colors
    { source: "/colors/category/:cat", destination: "/ja/dictionary/colors/category/:cat", permanent: true },
    { source: "/colors/:slug", destination: "/ja/dictionary/colors/:slug", permanent: true },
    { source: "/colors", destination: "/ja/dictionary/colors", permanent: true },

    // Cheatsheets
    { source: "/cheatsheets", destination: "/ja/cheatsheets", permanent: true },
    { source: "/cheatsheets/:slug", destination: "/ja/cheatsheets/:slug", permanent: true },

    // Blog
    { source: "/blog/category/:cat", destination: "/ja/blog/category/:cat", permanent: true },
    { source: "/blog/:slug", destination: "/ja/blog/:slug", permanent: true },
    { source: "/blog", destination: "/ja/blog", permanent: true },

    // About
    { source: "/about", destination: "/ja/about", permanent: true },

    // Memos
    { source: "/memos/thread/:id", destination: "/ja/memos/thread/:id", permanent: true },
    { source: "/memos/:id", destination: "/ja/memos/:id", permanent: true },
    { source: "/memos", destination: "/ja/memos", permanent: true },
  ];
}
```

**注意事項**:

- より具体的なパターン（`/quiz/:slug/result/:resultId`）を一般的なパターン（`/quiz/:slug`）より前に配置する
- 同様に `/blog/category/:cat` を `/blog/:slug` より前に配置する
- リダイレクトチェーンを避け、全て1ホップで完結させる
- リダイレクトは最低1年間維持する

### 4.7 hreflang と SEO メタデータ

#### hreflang設定

x-default は `/`（言語選択ページ）に設定する。Google公式ドキュメントで「x-default was designed for language selector pages」と明記されている。

フェーズ1（日本語のみ）:

```html
<!-- /ja/tools ページ -->
<link rel="alternate" hreflang="ja" href="https://yolos.net/ja/tools" />
<link rel="alternate" hreflang="x-default" href="https://yolos.net/" />
```

フェーズ3（日英対応後）:

```html
<!-- /ja/tools ページ -->
<link rel="alternate" hreflang="ja" href="https://yolos.net/ja/tools" />
<link rel="alternate" hreflang="en" href="https://yolos.net/en/tools" />
<link rel="alternate" hreflang="x-default" href="https://yolos.net/" />
```

#### canonical設定

各言語版のページは自身のURLをcanonicalとして設定:

- `/ja/tools` -> canonical: `https://yolos.net/ja/tools`
- `/en/tools` -> canonical: `https://yolos.net/en/tools`
- 異なる言語版のURLをcanonicalにしてはならない（Google明示的に禁止）

#### サイトマップ

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
const BASE_URL = "https://yolos.net";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/ja/tools`,
      lastModified: new Date(),
      alternates: {
        languages: {
          ja: `${BASE_URL}/ja/tools`,
          "x-default": `${BASE_URL}/`,
        },
      },
    },
    // ... 他のエントリも同様
  ];
}
```

### 4.8 ルートレイアウトの設計

#### `app/[lang]/layout.tsx`（言語別ルートレイアウト）

```typescript
// Next.js公式i18nパターン
export async function generateStaticParams() {
  return [{ lang: "ja" }, { lang: "en" }];
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang}>
      <body>
        <Header lang={lang} />
        <main>{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
```

役割:

- `<html lang={lang}>` を動的に設定
- グローバルCSS のインポート
- GoogleAnalytics の配置
- Header / Footer の配置（lang を props として渡す）
- hreflang メタデータの設定
- generateStaticParams で全サポート言語の静的パラメータを生成

#### `app/layout.tsx`（ルートレイアウト）

言語選択ページと404ページ用の最小限レイアウト。`<html lang="en">` を設定する。理由: 言語選択ページは日英併記コンテンツを含むが、HTML仕様上 `lang` 属性の省略は非推奨である。W3Cの慣例に従い、多言語ページでは `"en"` をデフォルトとする（調査C: URL挙動設計の知見に基づく）。

#### 言語の検証

`app/[lang]/layout.tsx` 内で `hasLocale()` を使い、サポートされていない言語コードの場合は `notFound()` を呼ぶ。これにより `/xx/tools` のような未サポート言語URLは自動的に404になる。

### 4.9 Header / Footer の多言語対応

Header / Footer を Server Component のまま維持し、`lang` を props として受け取る。

- ナビゲーションリンクのラベルは共通UIラベルJSON（層A）から取得
- リンク先のパスには `/{lang}/` プレフィックスを付与
- `localePath(lang, path)` ヘルパー関数を使用

### 4.10 generateStaticParams の更新

`[lang]/layout.tsx` でサポート言語の静的パラメータを生成:

```typescript
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}
```

各ページの既存の `generateStaticParams` は `lang` パラメータを追加:

```typescript
// tools/[slug]/page.tsx
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    allToolMetas
      // availableLocalesが指定されている場合、対応言語のみパラメータを生成
      .filter(
        (meta) =>
          !meta.availableLocales || meta.availableLocales.includes(lang),
      )
      .map((meta) => ({ lang, slug: meta.slug })),
  );
}
```

**注記**: `availableLocales` が指定されたコンテンツでは、対応言語のみの静的パラメータを生成するようにフィルタリングする。これにより、例えば `availableLocales: ["ja"]` が設定された漢字辞典等の日本語固有コンテンツに対して、英語版のページが誤って生成されることを防止する。全てのレジストリ（tools, cheatsheets, quiz, dictionary等）の `generateStaticParams` に同様のフィルタリングを適用すること。

### 4.11 SEOヘルパー関数の更新

`src/lib/seo.ts` 内の全関数を更新し、`lang` パラメータを受け取るようにする:

- URL生成に `/{lang}/` プレフィックスを含める
- `alternates.languages` にhreflang情報を含める
- `inLanguage` を動的に設定する
- `canonical` を現在の言語版のURLに設定する
- `lang` パラメータの型は `src/lib/i18n/config.ts` の `Locale` 型で統一する

### 4.12 フィード（RSS/Atom）の対応

フェーズ1では変更なし。現在の `/feed` と `/feed/atom` はそのまま維持する。ただし、フィード内のコンテンツURL（記事へのリンク等）は新パスに更新する必要がある（`/blog/[slug]` -> `/ja/blog/[slug]`）。

#### 具体的な変更箇所

`src/lib/feed.ts` の `buildFeed()` 関数において、ブログ記事URLを生成している以下の2箇所を `/ja/` プレフィックス付きに変更する:

```typescript
// 変更前
const blogUrl = `${siteUrl}/blog`;
const postUrl = `${siteUrl}/blog/${post.slug}`;

// 変更後
const blogUrl = `${siteUrl}/ja/blog`;
const postUrl = `${siteUrl}/ja/blog/${post.slug}`;
```

将来的に言語別フィード（`/ja/feed`, `/en/feed`）を導入する場合は、`buildFeed()` が `lang` パラメータを受け取る設計に拡張する。フェーズ1ではフィードは日本語のみのため、`/ja/` のハードコードで十分である（YAGNI原則）。

---

## 5. 移行計画

### 5.1 フェーズ概要

| フェーズ | 内容                                                                                | 工数目安           |
| -------- | ----------------------------------------------------------------------------------- | ------------------ |
| 1        | i18nインフラ構築 + ディレクトリ構成整理 + リダイレクト設定 + SEO更新 + 日本語版完成 | 大                 |
| 2        | 英語版追加                                                                          | 大（翻訳工数含む） |

**注意**: フェーズ1にリダイレクト設定とSEO更新を含めている。ページの移動とリダイレクト設定は同時にデプロイしないと既存URLが404になるため、分離は不可能。

### 5.2 フェーズ1: i18nインフラ + ディレクトリ整理 + SEO

**目標:** 新しいURL構造で日本語版が完全に動作し、旧URLからの308リダイレクトが正しく機能する状態。

#### 手順

1. **i18n基盤の作成**
   - `src/lib/i18n/config.ts` を作成（Locale型、SUPPORTED_LOCALES、DEFAULT_LOCALE）
   - `src/lib/i18n/common.ja.json` を作成（共通UIラベル日本語版）
   - `src/lib/i18n/common.en.json` を作成（共通UIラベル英語版プレースホルダー）
   - `src/lib/i18n/dictionary.ts` を作成（getDictionary関数、server-only）
   - `src/lib/i18n/resolve.ts` を作成（resolveLocalized ヘルパー）
   - `npm install server-only` を実行

2. **ToolMeta等の型を多言語対応に更新**
   - `LocalizedString` 型の定義
   - ToolMeta, CheatsheetMeta, QuizMeta等の型を更新
   - 各コンテンツの meta.ts を `LocalizedString` 形式に変換
   - `availableLocales` フィールドを必要なコンテンツに追加

3. **レイアウトの再構築**
   - `src/app/[lang]/layout.tsx` を言語別ルートレイアウトとして作成
   - `src/app/layout.tsx` を最小限のルートレイアウトに変更
   - `src/app/page.tsx` を言語選択画面として作成
   - `src/app/not-found.tsx` をバイリンガル404に更新
   - Header / Footer を言語対応に更新

4. **ページの移動**
   - 全既存ページを `src/app/[lang]/` 配下に移動
   - `/colors` を `/dictionary/colors` に統合
   - 各ページの内部リンクを新パスに更新
   - `generateStaticParams` に `lang` パラメータを追加

5. **リダイレクト設定**
   - `next.config.ts` にセクション4.6の全リダイレクトルールを追加

6. **SEO更新**
   - `src/app/sitemap.ts` を多言語URL対応に更新
   - `src/lib/seo.ts` の全関数を更新
   - 各ページの canonical を新URLに設定
   - hreflang を設定
   - JSON-LD の URL を新パスに更新

7. **フィードURLの更新**
   - フィード内のコンテンツURLを新パスに更新

8. **テストの更新**
   - 既存テストを新パス構造に合わせて更新
   - リダイレクト設定のテスト追加
   - 旧パス残留チェック（grepコマンドの実行）

#### チェックポイント

- [ ] `npm run build` が成功する
- [ ] `npm test` が通る
- [ ] 全ページが `/ja/` プレフィックスでアクセスできる
- [ ] `/` で言語選択画面が表示される
- [ ] 旧URLにアクセスすると `/ja/...` に308リダイレクトされる
- [ ] リダイレクトチェーンがない（1ホップで完了）
- [ ] `/colors` が `/ja/dictionary/colors` にリダイレクトされる
- [ ] 言語未指定の新URLで404が返る
- [ ] Header/Footerのリンクが新パスを指している
- [ ] サイトマップが新URL構造を反映している
- [ ] 各ページのcanonicalが正しい
- [ ] hreflangが正しく設定されている
- [ ] フィード内の記事URLが新パスに更新されている
- [ ] 旧パスのハードコードがコードベースに残っていないこと

### 5.3 フェーズ2: 英語版追加

**目標:** 英語版のコンテンツを追加し、完全な多言語サイトにする。

#### 手順

1. **英語版UIラベルの完成**
   - `src/lib/i18n/common.en.json` の全ラベルを翻訳

2. **英語版コンテンツの作成（優先度順）**
   - 高: ツールページ（UIのみの翻訳で機能はそのまま使える）
   - 中: ブログ記事（人気記事から順次）
   - 低: 辞典コンテンツ（日本語固有。英語版では解説を充実）
   - 低: ゲーム/クイズ（日本語コンテンツに依存。英語向けは別テーマも検討）

3. **hreflangの完全実装**
   - 全ページに日英双方向のhreflangを追加
   - サイトマップに英語版URLを追加

4. **言語切り替えUI**
   - 各ページに言語切り替えリンクを配置

#### チェックポイント

- [ ] `/en/` で英語版ページが表示できる
- [ ] hreflangが双方向で正しく設定されている
- [ ] 言語切り替えUIが機能する
- [ ] `availableLocales: ["ja"]` のコンテンツが英語版に表示されないこと

---

## 6. リスクと対策

### 6.1 SEOへの影響

| リスク                              | 影響度 | 対策                                                                  |
| ----------------------------------- | ------ | --------------------------------------------------------------------- |
| URL変更による一時的なランキング低下 | 中     | 全旧URLに308リダイレクトを設定。中規模サイトで数週間で回復            |
| リダイレクトチェーンの発生          | 中     | next.config.tsのredirectsで一元管理し1ホップに限定                    |
| canonicalの設定ミス                 | 高     | テストで全ページのcanonicalを検証                                     |
| hreflangの双方向リンク漏れ          | 中     | テストで全ページのhreflang相互参照を検証                              |
| 言語未指定URLの404によるSEO影響     | 低     | 旧URLは全て308リダイレクトで保護。新URLはまだインデックスされていない |

### 6.2 技術的リスク

| リスク                                      | 影響度 | 対策                                                                                                         |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| ビルド時間の増加（言語数 x ページ数）       | 中     | フェーズ1では日本語のみなので影響なし。フェーズ2で計測                                                       |
| `[lang]` パラメータ追加による全ページの変更 | 高     | 一括で変更する。中途半端な状態は避ける                                                                       |
| 内部リンクの更新漏れ                        | 中     | grepで旧パスの残留を検出。`localePath()` ヘルパー関数の利用を徹底                                            |
| meta.tsの型変更による大量ファイル修正       | 中     | 既存の `nameEn` フィールドから段階的に移行可能。`LocalizedString` 型は `en` をオプショナルにし後方互換を確保 |

### 6.3 ユーザー影響

| リスク                                   | 影響度 | 対策                                     |
| ---------------------------------------- | ------ | ---------------------------------------- |
| ブックマークしたURLが変わる              | 低     | 308リダイレクトにより自動的に新URLへ遷移 |
| 共有されたURLの無効化                    | 低     | 308リダイレクトを最低1年維持             |
| ゲームの進捗データの消失（localStorage） | なし   | localStorageはドメイン単位のため影響なし |

### 6.4 デプロイ戦略

- **一括デプロイ**: ページ移動とリダイレクト設定は同時にデプロイする。部分的なデプロイは404を生む
- **ロールバック計画**: 問題発生時にgit revertで元に戻せるようにする
- **事前テスト**: ビルド後にリダイレクトと全ページの表示を確認
- **監視**: デプロイ後24時間はGoogle Search Consoleとアクセスログを重点監視

---

## 7. 実装時の注意事項

### 7.1 内部リンクの更新

リンクのヘルパー関数を作成し、全ての内部リンクで使用する:

```typescript
// src/lib/i18n/config.ts
export function localePath(lang: Locale, path: string): string {
  return `/${lang}${path}`;
}
```

#### 旧パス残留チェック

移行後に旧パスがコードベースに残っていないことを検証するため、以下のパターンを検出する:

```bash
# 言語プレフィックスなしの内部リンクを検出
grep -rn 'href="/' --include='*.tsx' --include='*.ts' src/
```

検出された結果が以下のいずれかであることを検証する:

- `localePath()` ヘルパー関数経由のパス生成（OK）
- `next.config.ts` の `redirects()` 内のソースパス定義（OK）
- テストコード内のリダイレクト検証（OK）
- 言語非依存パス（`/feed`, `/sitemap.xml` 等）（OK）
- それ以外のハードコードされたパス（要修正）

### 7.2 テスト方針

- 既存テストを新パス構造に合わせて更新
- リダイレクト設定の網羅テスト
- hreflang相互参照のテスト
- ビルド後のリンク切れチェック

### 7.3 `server-only` パッケージ

辞書システムで `import 'server-only'` を使用するため、`npm install server-only` が必要。フェーズ1の手順1でインストールを実施する。

### 7.4 docs/architecture.md の更新

移行完了後、`docs/architecture.md` の「コンテンツセクション」を新しいカテゴリ体系に合わせて更新する。

---

## 8. 参考資料

- Google: Tell Google about localized versions of your page — https://developers.google.com/search/docs/specialty/international/localized-versions
- Google: Managing multi-regional sites — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google: Site move with URL changes — https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Next.js: Internationalization — https://nextjs.org/docs/app/building-your-application/routing/internationalization
