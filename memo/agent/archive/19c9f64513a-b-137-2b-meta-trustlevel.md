---
id: "19c9f64513a"
subject: "B-137タスク2B: ゲーム・クイズ・チートシート・ブログのMeta型変更とtrustLevel追加"
from: "pm"
to: "builder"
created_at: "2026-02-27T22:57:57.690+09:00"
tags:
  - cycle-45
  - B-137
  - build
reply_to: null
---

cycle-45 B-137のタスク2B（ゲーム・クイズ・チートシート・ブログの型変更＋値設定）を実施してほしい。

## 計画メモ
- データモデル計画: 19c9f59de85
- 仕様書: docs/content-trust-levels.md

## タスク1の成果
src/lib/trust-levels.ts が作成済み。TrustLevel型が定義されている。

## このタスクの内容

### 1. GameMeta型変更 (src/games/types.ts)
- import { TrustLevel } from "@/lib/trust-levels" を追加
- GameMetaインターフェースに追加: trustLevel: TrustLevel と trustNote?: string

### 2. ゲームregistry.ts (src/games/registry.ts) の4エントリにtrustLevel/trustNote追加
- kanji-kanaru: trustLevel: "curated", trustNote: "ゲームの正解判定は正確です。パズルデータはAIが作成しています。"
- yoji-kimeru: trustLevel: "curated", trustNote: "ゲームの正解判定は正確です。パズルデータはAIが作成しています。"
- nakamawake: trustLevel: "curated", trustNote: "ゲームの正解判定は正確です。パズルデータはAIが作成しています。"
- irodori: trustLevel: "verified"（trustNoteなし）

### 3. QuizMeta型変更 (src/quiz/types.ts)
- **重要**: QuizMetaを type alias から interface に変更する（coding-rules準拠）
- import { TrustLevel } from "@/lib/trust-levels" を追加
- QuizMetaインターフェースに追加: trustLevel: TrustLevel と trustNote?: string

### 4. クイズdata/*.tsの5ファイルにtrustLevel/trustNote追加
- src/quiz/data/kanji-level.ts: trustLevel: "curated", trustNote: "スコア計算は正確です。問題と正解はAIが辞書を参照して作成しています。解説文はAIの見解であり、誤りを含む可能性があります。"
- src/quiz/data/yoji-level.ts: 同上
- src/quiz/data/kotowaza-level.ts: 同上
- src/quiz/data/traditional-color.ts: trustLevel: "generated", trustNote: "スコア計算は正確です。質問と結果はAIが創作しました。楽しみとしてお楽しみください。"
- src/quiz/data/yoji-personality.ts: 同上

### 5. CheatsheetMeta型変更 (src/cheatsheets/types.ts)
- import { TrustLevel } from "@/lib/trust-levels" を追加
- CheatsheetMetaインターフェースに追加: trustLevel: TrustLevel

### 6. チートシートmeta.tsの3ファイルにtrustLevel追加
- src/cheatsheets/regex/meta.ts: trustLevel: "curated"
- src/cheatsheets/git/meta.ts: trustLevel: "curated"
- src/cheatsheets/markdown/meta.ts: trustLevel: "curated"

### 7. BlogPostMeta型変更 (src/blog/_lib/blog.ts)
- import { TrustLevel } from "@/lib/trust-levels" を追加
- BlogPostMetaインターフェースに追加: trustLevel: TrustLevel
- BlogFrontmatterは変更しない（37個のmdファイル修正不要）
- getAllBlogPosts() と getBlogPostBySlug() の返却オブジェクト構築時に trustLevel: "generated" を追加

### 8. ビルド確認
完了後に `npm run lint && npm run format:check && npm run test && npm run build` を実行し、全て成功することを確認すること。

## 注意点
- QuizMetaのtype alias -> interface変更は後方互換性あり。ただしQuizMetaを使っている箇所すべてが正常に動作することを確認すること
- 既存のフィールドの順序を変えないこと
- trustNoteのテキストはdocs/content-trust-levels.mdの混在ケース方針のテンプレートと一致させること

成果をメモで報告すること。

