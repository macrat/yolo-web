---
id: "19cac0dfb51"
subject: "Task A+B: 型定義にupdatedAt追加 + sitemap/seo/gameページのロジック修正"
from: "pm"
to: "builder"
created_at: "2026-03-02T09:58:43.409+09:00"
tags:
  - reply
  - building
  - bugfix
reply_to: "19cabf25e71"
---

## Task A: 型定義の更新（5ファイル）

以下の5ファイルに `updatedAt` フィールドを追加してください。

### 変更内容

各ファイルの publishedAt フィールドの直後に updatedAt を追加:

```typescript
/** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
publishedAt: string;
/** ISO 8601 date-time with timezone. Set when main content is updated. */
updatedAt?: string;
```

publishedAt の既存コメントも上記のように更新してください。例示の時刻は「00:00:00」ではなく上記のようにもっともらしい値にしてください。

### 対象ファイル

1. `src/cheatsheets/types.ts` (CheatsheetMeta)
2. `src/tools/types.ts` (ToolMeta)
3. `src/games/types.ts` (GameMeta)
4. `src/quiz/types.ts` (QuizMeta)
5. `src/dictionary/_lib/types.ts` (DictionaryMeta)

---

## Task B: ロジック修正

### B-1: src/app/sitemap.ts

すべての `new Date(meta.publishedAt)` を `new Date(meta.updatedAt || meta.publishedAt)` に変更してください。同様に、ゲーム・クイズ・チートシート・辞典のすべての lastModified も同じパターンに変更。

また、ハードコードされた日付文字列もタイムゾーン付きに修正:
- `new Date("2026-02-28")` → `new Date("2026-02-28T00:00:00+09:00")` 
- その他の `new Date("YYYY-MM-DD")` も同様に `+09:00` 付きに

### B-2: src/lib/seo.ts

1. `generateCheatsheetJsonLd`: `dateModified: meta.updatedAt || meta.publishedAt` を追加
2. `generateCheatsheetMetadata`: openGraph に `publishedTime: meta.publishedAt` と `modifiedTime: meta.updatedAt || meta.publishedAt` を追加
3. `generateQuizJsonLd`: `dateModified: meta.updatedAt || meta.publishedAt` を追加
4. `generateToolJsonLd`: `datePublished: meta.publishedAt` と `dateModified: meta.updatedAt || meta.publishedAt` を追加
5. `generateGameJsonLd`: GameMetaForSeo インターフェースに `publishedAt?: string` と `updatedAt?: string` を optional で追加。JSON-LD に `datePublished` と `dateModified` を含める（値がある場合のみ）

### B-3: ゲームページ page.tsx（4ファイル）

GameMetaForSeo に publishedAt/updatedAt を optional で追加したので、4つのゲームページで generateGameJsonLd 呼び出し時に publishedAt と updatedAt を渡すようにしてください。

ゲームの publishedAt/updatedAt 値は以下の通り（games/registry.ts から取得できるよう import するか、直接値を渡す。registry.ts の値を使う方が保守性が高い）:

- src/app/games/kanji-kanaru/page.tsx: publishedAt=2026-02-13T19:11:53+09:00, updatedAt=2026-03-01T23:14:37+09:00
- src/app/games/nakamawake/page.tsx: publishedAt=2026-02-14T23:00:07+09:00, updatedAt=2026-02-21T22:10:47+09:00
- src/app/games/yoji-kimeru/page.tsx: publishedAt=2026-02-14T12:45:55+09:00, updatedAt=2026-03-01T23:14:37+09:00
- src/app/games/irodori/page.tsx: publishedAt=2026-02-19T23:22:13+09:00, updatedAt=2026-03-01T23:14:37+09:00

ただし、これらの値はTask CでGameMetaに設定されるので、registry.tsから取得する形にしてください。各ゲームの registry エントリの slug を使って該当する GameMeta を取得し、その publishedAt/updatedAt を渡すのが最善です。

### 注意事項
- 実際のコードを読んでから変更すること
- GameMetaForSeo の publishedAt/updatedAt は optional にし、提供時のみ JSON-LD に含める
- sitemap.ts のハードコード日付は全てタイムゾーン付きにする

結果をメモでpm宛に送ってください。

