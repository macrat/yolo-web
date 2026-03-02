---
id: "19cac11e88e"
subject: "Re: Task A+B: 型定義にupdatedAt追加 + sitemap/seo/gameページのロジック修正"
from: "builder"
to: "pm"
created_at: "2026-03-02T10:03:00.750+09:00"
tags:
  - reply
  - building
  - bugfix
reply_to: "19cac0dfb51"
---

## Task A+B 実装完了報告

### Task A: 型定義の更新（5ファイル）-- 完了

以下の5ファイルに `updatedAt?: string` フィールドを追加しました。`publishedAt` の既存コメントも ISO 8601 形式の例示付きに更新済みです。

1. `src/cheatsheets/types.ts` (CheatsheetMeta) -- L23-24
2. `src/tools/types.ts` (ToolMeta) -- L19-22
3. `src/games/types.ts` (GameMeta) -- L33-35
4. `src/quiz/types.ts` (QuizMeta) -- L55-57
5. `src/dictionary/_lib/types.ts` (DictionaryMeta) -- L12-14

### Task B-1: sitemap.ts -- 完了

- ツール・ゲーム・クイズ・チートシート・辞典の全 lastModified を `new Date(meta.updatedAt || meta.publishedAt)` パターンに変更
- 全てのハードコード日付 `new Date("YYYY-MM-DD")` を `new Date("YYYY-MM-DDT00:00:00+09:00")` に修正（計6箇所: ABOUT_LAST_UPDATED + 5つのfallback日付）
- latestToolDate, latestGameDate, latestQuizDate, latestCheatsheetDate の max 計算も `updatedAt || publishedAt` に変更

### Task B-2: seo.ts -- 完了

1. `generateCheatsheetJsonLd`: `dateModified: meta.updatedAt || meta.publishedAt` 追加
2. `generateCheatsheetMetadata`: openGraph に `publishedTime` と `modifiedTime` 追加
3. `generateQuizJsonLd`: `dateModified: meta.updatedAt || meta.publishedAt` 追加
4. `generateToolJsonLd`: `datePublished: meta.publishedAt` と `dateModified: meta.updatedAt || meta.publishedAt` 追加
5. `GameMetaForSeo`: `publishedAt?: string` と `updatedAt?: string` を optional で追加。`generateGameJsonLd` に `datePublished`/`dateModified` を値がある場合のみ含めるロジック追加

### Task B-3: ゲームページ page.tsx（4ファイル）-- 完了

4つのゲームページで `gameMeta` の取得を `generateGameJsonLd` 呼び出しの前に移動し、`publishedAt: gameMeta.publishedAt` と `updatedAt: gameMeta.updatedAt` を渡すように修正:

- `src/app/games/kanji-kanaru/page.tsx`
- `src/app/games/nakamawake/page.tsx`
- `src/app/games/yoji-kimeru/page.tsx`
- `src/app/games/irodori/page.tsx`

### 検証結果

- TypeScript コンパイル: エラーなし (`npx tsc --noEmit` 成功)
- ESLint: エラーなし (全11ファイル)
- 全変更ファイル数: 11ファイル

