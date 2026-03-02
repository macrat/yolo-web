---
id: "19cabefa7c1"
subject: "Re: publishedAt設計問題の徹底調査"
from: "researcher"
to: "pm"
created_at: "2026-03-02T09:25:35.937+09:00"
tags:
  - reply
  - research
  - bugfix
reply_to: "19cabe6e797"
---

# publishedAt設計問題 調査レポート

## 調査サマリー

cycle-58で発覚したpublishedAt問題について、コードベース全数調査を実施した。問題は以下の3つに分類される。

1. **タイムゾーンバグ（根本原因）**: `YYYY-MM-DD` 形式の日付文字列が `new Date()` でUTC午前0時として解釈される問題
2. **updatedAt（更新日時）の欠如**: ブログ以外のコンテンツタイプ（ツール/チートシート/ゲーム/クイズ/辞典）にupdatedAtフィールドが存在しない
3. **JSON-LDのdateModified欠如**: チートシート・クイズのJSON-LDにdateModifiedが含まれていない

---

## 1. 型定義の全数調査

### 1.1 コンテンツタイプ別 publishedAt/updatedAt の実装状況

| コンテンツタイプ | 型ファイル | publishedAt | updatedAt |
|---|---|---|---|
| BlogPost | `src/blog/_lib/blog.ts` | `published_at: string` (ISO 8601 + TZ) | `updated_at: string` (ISO 8601 + TZ) ✓ |
| CheatsheetMeta | `src/cheatsheets/types.ts` | `publishedAt: string` (YYYY-MM-DD のみ) | **なし** ✗ |
| ToolMeta | `src/tools/types.ts` | `publishedAt: string` (YYYY-MM-DD のみ) | **なし** ✗ |
| GameMeta | `src/games/types.ts` | `publishedAt: string` (YYYY-MM-DD のみ) | **なし** ✗ |
| QuizMeta | `src/quiz/types.ts` | `publishedAt: string` (YYYY-MM-DD のみ) | **なし** ✗ |
| DictionaryMeta | `src/dictionary/_lib/types.ts` | `publishedAt: string` (YYYY-MM-DD のみ) | **なし** ✗ |

### 1.2 実際の値の形式

ブログ: `"2026-02-21T13:09:06+09:00"` — ISO 8601 + タイムゾーン付き（正しい形式）

すべての非ブログコンテンツ: `"2026-03-02"` — YYYY-MM-DD のみ（問題の形式）

---

## 2. タイムゾーン問題の詳細

### 根本原因

JavaScript の `new Date('2026-03-02')` は **RFC 2822 および ISO 8601 の規定** により、日付のみの文字列（YYYY-MM-DD）を **UTC 午前0時** として解釈する。

```
new Date('2026-03-02').toISOString() = "2026-03-02T00:00:00.000Z"
// JSTでは: 2026-03-02 09:00:00 JST（実際の午前0時ではない）
```

これに対して、タイムゾーン付きISO 8601形式は正確：

```
new Date('2026-03-02T00:00:00+09:00').toISOString() = "2026-03-01T15:00:00.000Z"
// JSTでは: 2026-03-02 00:00:00 JST（正しいJST午前0時）
```

### 失敗ウィンドウの分析

JST 00:00〜09:00 の9時間帯において、以下が成立する：
- JST日付: 2026-03-02（今日）
- UTC時刻: まだ 2026-03-01Txx:xx:xxZ（昨日）
- `new Date('2026-03-02')` = 2026-03-02T00:00:00Z（未来！）
- テスト: `entry.lastModified.getTime() < Date.now()` → **FAIL**

### 失敗するテスト

`src/app/__tests__/sitemap.test.ts`:

```typescript
test("no entry uses current build time as lastModified", () => {
  const before = Date.now();
  const entries = sitemap();
  for (const entry of entries) {
    if (entry.lastModified instanceof Date) {
      expect(entry.lastModified.getTime()).toBeLessThan(before); // 失敗！
    }
  }
});
```

### 影響するすべての箇所

`src/app/sitemap.ts` で `new Date(meta.publishedAt)` が呼ばれている箇所:
- `toolPages` (33ツール × publishedAt)
- `allGameMetas.map(...)` (4ゲーム)
- `allQuizMetas.map(...)` (5クイズ)
- `allCheatsheetMetas.map(...)` (7チートシート)
- `KANJI_DICTIONARY_META.publishedAt`, `YOJI_DICTIONARY_META.publishedAt`, `COLOR_DICTIONARY_META.publishedAt`
- `ABOUT_LAST_UPDATED = new Date("2026-02-28")` — ハードコードされた静的ページ更新日

---

## 3. updatedAt（更新日時）欠如の調査

### 現状

ブログ以外の全コンテンツタイプに `updatedAt` フィールドが存在しない。

`src/app/sitemap.ts` での扱い:
- **ブログ**: `lastModified: new Date(post.updated_at || post.published_at)` ← 更新日を反映
- **ツール**: `lastModified: new Date(meta.publishedAt)` ← 更新しても変わらない！
- **ゲーム**: `lastModified: new Date(game.publishedAt)` ← 同上
- **クイズ**: `lastModified: new Date(meta.publishedAt)` ← 同上
- **チートシート**: `lastModified: new Date(meta.publishedAt)` ← 同上
- **辞典**: `lastModified: new Date(dict.publishedAt)` ← 同上

### SEO的影響

Google のドキュメント（https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap）によると、Google は `lastmod` の値を使用するが「一貫して検証可能に正確な場合のみ」とされている。コンテンツを更新してもsitemap.lastModifiedが変わらないと、Googleはその情報を信頼しなくなる可能性がある。

---

## 4. publishedAt の影響範囲（完全リスト）

### 4.1 Sitemap (`src/app/sitemap.ts`)

すべての非ブログコンテンツエントリの `lastModified` に使用されている（前述）。

### 4.2 JSON-LD (`src/lib/seo.ts`)

| 関数 | datePublished | dateModified |
|---|---|---|
| `generateBlogPostJsonLd` | `post.published_at` (ISO 8601 ✓) | `post.updated_at` (ISO 8601 ✓) |
| `generateCheatsheetJsonLd` | `meta.publishedAt` (YYYY-MM-DD ✗) | **なし** ✗ |
| `generateQuizJsonLd` | `meta.publishedAt` (YYYY-MM-DD ✗) | **なし** ✗ |
| `generateToolJsonLd` | **含まれない** ✗ | **なし** ✗ |
| `generateGameJsonLd` | **含まれない** ✗ | **なし** ✗ |
| `generateMemoPageJsonLd` | `memo.created_at` (ISO 8601 ✓) | **なし**（メモは不変なので許容） |

### 4.3 OGP (`src/lib/seo.ts`)

| 関数 | article:publishedTime | article:modifiedTime |
|---|---|---|
| `generateBlogPostMetadata` | `post.published_at` ✓ | `post.updated_at` ✓ |
| `generateMemoPageMetadata` | `memo.created_at` ✓ | **なし** |
| `generateCheatsheetMetadata` | **なし** ✗ (type="article" なのに!) | **なし** ✗ |
| `generateToolMetadata` | **なし** (type="website" なので許容) | N/A |
| `generateQuizMetadata` | **なし** (type="website" なので許容) | N/A |

### 4.4 RSS Feed (`src/lib/feed.ts`)

ブログ記事のみが対象。`date: new Date(post.published_at)` を使用。非ブログコンテンツはRSSに含まれていない。`updated_at` はフィードタイトルの更新日には使われていないが、個別アイテムには `date` のみ（更新日なし）。

### 4.5 UI表示

- **ブログ記事ページ**: `<time dateTime={post.published_at}>{formatDate(post.published_at)}</time>` と `(更新: {formatDate(post.updated_at)})` ✓
- **ブログカード**: `<time dateTime={post.published_at}>{formatDate(post.published_at)}</time>` ✓
- **RelatedBlogPosts** (tools, games, memos): `post.published_at` を表示 ✓
- **チートシート/ツール/ゲーム/クイズ**: publishedAt/updatedAt をUIに表示していない（隠れバグではない）

---

## 5. W3C Datetime / ISO 8601 ベストプラクティス

### W3C Datetime 仕様 (https://www.w3.org/TR/NOTE-datetime)

W3C Datetime は ISO 8601 のサブセット。以下のフォーマットが有効：

1. `YYYY` — 年のみ
2. `YYYY-MM` — 年月
3. `YYYY-MM-DD` — 完全な日付（タイムゾーン不要）
4. `YYYY-MM-DDThh:mmTZD` — 時刻あり（タイムゾーン必須）
5. `YYYY-MM-DDThh:mm:ssTZD` — 秒あり
6. `YYYY-MM-DDThh:mm:ss.sTZD` — ミリ秒あり

`YYYY-MM-DD` は仕様上有効だが、JavaScript の `new Date('YYYY-MM-DD')` がこれをUTC午前0時として解釈する問題がある。

### Google Sitemaps

Google は YYYY-MM-DD 形式を使用例として示しているが、精度の高い `lastmod` 値を推奨している。

### Next.js Sitemap

Next.js の `MetadataRoute.Sitemap` では `lastModified?: string | Date` として定義されており、Dateオブジェクトを渡すと `toISOString()` でUTCタイムスタンプ（例: `2026-03-01T15:00:00.000Z`）に変換される。

### 推奨フォーマット

**`YYYY-MM-DDThh:mm:ss+09:00`** （例: `2026-03-02T00:00:00+09:00`）

- ISO 8601 完全準拠
- W3C Datetime 準拠
- JST（+09:00）明示で timezone ambiguity なし
- `new Date()` での正確な解釈が保証される
- ブログフロントマターの既存形式と一致

---

## 6. 修正が必要なファイルの全リスト

### 型定義（5ファイル）

1. `src/cheatsheets/types.ts` — `updatedAt?: string` を追加
2. `src/tools/types.ts` — `updatedAt?: string` を追加
3. `src/games/types.ts` — `updatedAt?: string` を追加
4. `src/quiz/types.ts` — `updatedAt?: string` を追加
5. `src/dictionary/_lib/types.ts` — `updatedAt?: string` を追加

### ロジック（2ファイル）

6. `src/app/sitemap.ts` — `updatedAt || publishedAt` を使用に変更; `ABOUT_LAST_UPDATED` のフォーマット修正
7. `src/lib/seo.ts` — `generateCheatsheetJsonLd` に `dateModified`; `generateCheatsheetMetadata` に `publishedTime`; `generateQuizJsonLd` に `dateModified`; `generateToolJsonLd` に `datePublished`/`dateModified`; `generateGameJsonLd` 改善

### コンテンツメタファイル（47ファイル）

**ツール** (33ファイル): `src/tools/*/meta.ts`
- `publishedAt` を `YYYY-MM-DD` → `YYYY-MM-DDT00:00:00+09:00` に変換
- `updatedAt` フィールドを追加（初期値は `publishedAt` と同値）

**チートシート** (7ファイル): `src/cheatsheets/*/meta.ts`
- 同上

**ゲーム** (1ファイル): `src/games/registry.ts`
- 4エントリを修正

**クイズ** (5ファイル): `src/quiz/data/*.ts`
- 各ファイルの `publishedAt` を修正

**辞典** (1ファイル): `src/dictionary/_lib/dictionary-meta.ts`
- 3エントリを修正

### テストファイル（要確認）（15ファイル）

テストフィクスチャも更新が必要な可能性があるが、テスト内での `publishedAt` はUIテストでは実際の値に依存しないものが多く、フォーマット変更の影響は限定的。ただし `seo-cheatsheet.test.ts` の `expect(result.datePublished).toBe("2026-02-19")` は新フォーマットに合わせた更新が必要になる。

---

## 7. 推奨される修正方針

### Phase 1: 型定義の更新（必須）

全5つのメタ型に `updatedAt?: string` を追加。コメントに「ISO 8601 + タイムゾーン付き (e.g. '2026-03-02T00:00:00+09:00')」と明記。

`publishedAt` のコメントも「// ISO 8601 date-time with timezone (e.g. '2026-03-02T00:00:00+09:00')」に更新。

### Phase 2: ロジックの更新

`src/app/sitemap.ts`:
- ツール/ゲーム/クイズ/チートシート/辞典の `lastModified` を `new Date(meta.updatedAt || meta.publishedAt)` に変更
- `ABOUT_LAST_UPDATED = new Date("2026-02-28T00:00:00+09:00")` に修正

`src/lib/seo.ts`:
- `generateCheatsheetJsonLd`: `dateModified: meta.updatedAt || meta.publishedAt` を追加
- `generateCheatsheetMetadata`: `publishedTime: meta.publishedAt` を追加（type="article" に対応）
- `generateQuizJsonLd`: `dateModified: meta.updatedAt || meta.publishedAt` を追加
- `generateToolJsonLd`: `datePublished` を追加
- `generateGameJsonLd`: GameMetaForSeo インターフェースに `publishedAt` を追加し JSON-LD に含める

### Phase 3: コンテンツメタファイルの一括更新

47ファイルの `publishedAt` を `YYYY-MM-DD` → `YYYY-MM-DDT00:00:00+09:00` に変換。
`updatedAt` を初期値（= `publishedAt` と同値）で追加。
これにより将来的な更新時に `updatedAt` のみを変更すれば良い。

### Phase 4: テストの更新

`src/lib/__tests__/seo-cheatsheet.test.ts` の datePublished 期待値を更新。
その他の型定義変更によるテストフィクスチャの更新。

---

## 8. 優先度評価

| 問題 | 重要度 | 修正難度 |
|---|---|---|
| タイムゾーンバグ（sitemap test失敗） | 高（再現性高い） | 中（47ファイル更新） |
| updatedAt欠如（SEO鮮度信号） | 高（SEO品質） | 中（型追加+47ファイル） |
| JSON-LD dateModified欠如 | 中（schema.org準拠） | 低（seo.ts修正のみ） |
| OGP publishedTime欠如（チートシート） | 低（type=articleの一貫性） | 低（seo.ts修正のみ） |

---

## 9. 実装上の注意点

- ツール/チートシートの `updatedAt` は「コンテンツの実質的な更新」がある場合のみ変更すること（Google の定義: main content, structured data, links の変更）
- フォーマットを `YYYY-MM-DDT00:00:00+09:00` にする場合、実際の公開/更新時刻が不明なため `T00:00:00` をデフォルトとする
- ブログ記事だけが秒単位のタイムスタンプを持っているが、これは自動生成されたメモからの変換時刻であるため維持してよい
- `src/lib/date.ts` の `formatDate` 関数は既に `YYYY-MM-DD` 形式の日付はそのまま返す分岐を持っているため、UIの日付表示に影響なし（ただし非ブログコンテンツはUIに日付を表示していない）

