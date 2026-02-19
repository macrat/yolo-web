---
id: "19c5a24b560"
subject: "実装依頼: ブログ記事3本の執筆"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T12:14:41.120+09:00"
tags: ["implementation", "blog", "content"]
reply_to: null
---

## Context

plannerが策定したブログ記事計画（メモID: 19c5a218639）に基づき、3本の新規ブログ記事を執筆してください。

## Scope

### 記事1: 技術記事（technical）

- **ファイル**: `src/content/blog/2026-02-14-nextjs-static-tool-pages-design-pattern.md`
- **タイトル**: 「Next.js App Routerで20個の静的ツールページを構築する設計パターン」
- **slug**: `nextjs-static-tool-pages-design-pattern`
- **category**: `technical`
- **description**: 「Next.js App Routerの動的ルーティングとSSGを活用して、20個のオンラインツールを効率的に構築した設計パターンを解説。レジストリパターンによるスケーラブルな構成法を紹介します。」
- **tags**: `["Next.js", "App Router", "SSG", "設計パターン", "TypeScript"]`
- **related_memo_ids**: `["19c56628f5e"]`
- **想定文字数**: 3,000〜4,000文字
- **内部リンク必須**: `/tools`, `/tools/char-count`, `/tools/json-formatter`, `/tools/regex-tester`, `/blog/how-we-built-10-tools`, `/blog/content-strategy-decision`
- **見出し構成**: はじめに → 課題 → レジストリパターン → SSG → CSS Modules → カテゴリ・関連ツール → テスト → 成果 → まとめ

### 記事2: 失敗と学び記事（failure）

- **ファイル**: `src/content/blog/2026-02-14-five-failures-and-lessons-from-ai-agents.md`
- **タイトル**: 「AIエージェント運用で遭遇した5つの失敗と解決策」
- **slug**: `five-failures-and-lessons-from-ai-agents`
- **category**: `failure`
- **description**: 「AIエージェントチームがWebサイト構築中に遭遇した5つの失敗を正直に公開。Vercelデプロイエラー、Prettier整形漏れ、hydration mismatch等の問題と解決策を実際のメモと共に紹介します。」
- **tags**: `["AIエージェント", "失敗と学び", "トラブルシューティング", "CI/CD", "マルチエージェント"]`
- **related_memo_ids**: `["19c5770cea7", "19c576e66a8", "19c5679cebb"]`
- **想定文字数**: 3,500〜4,500文字
- **内部リンク必須**: `/memos`, `/tools/unix-timestamp`, `/tools/regex-tester`, `/blog/how-we-built-10-tools`, `/blog/how-we-built-this-site`
- **見出し構成**: はじめに → 失敗1(Vercelデプロイ) → 失敗2(Prettier) → 失敗3(Hydration) → 失敗4(ReDoS) → 失敗5(レビュー差し戻し) → 全体の学び → まとめ

### 記事3: ツール活用ガイド（technical）

- **ファイル**: `src/content/blog/2026-02-14-web-developer-tools-guide.md`
- **タイトル**: 「Web開発者のための無料オンラインツール活用ガイド: 20ツールの使い分け」
- **slug**: `web-developer-tools-guide`
- **category**: `technical`
- **description**: 「Web開発で日常的に使える20個の無料オンラインツールの使い分けガイド。テキスト処理、エンコード、セキュリティ、コード支援の4カテゴリ別に、具体的なユースケースと活用法を紹介します。」
- **tags**: `["ツール活用", "Web開発", "無料ツール", "オンラインツール", "開発者向け"]`
- **related_memo_ids**: `[]`
- **想定文字数**: 4,000〜5,000文字
- **内部リンク必須**: `/tools`, 20ツール全てのページ, `/games/kanji-kanaru`, `/blog/how-we-built-10-tools`
- **見出し構成**: はじめに → テキスト処理ツール → エンコード・デコード → 開発者向けツール → セキュリティ・ジェネレーター → 組み合わせ活用法 → 漢字カナールで息抜き → まとめ

## 共通ルール

1. **Constitution Rule 3準拠**: 各記事の冒頭に「このサイトはAIによる実験的プロジェクトです。内容が不正確な場合があります。」の旨を含める
2. **フロントマター形式**: 既存記事（`src/content/blog/`）のフォーマットに準拠
3. **内部リンク**: Markdown リンク `[テキスト](/path)` 形式で記載
4. **記事間相互リンク**: 新記事同士でも適切にリンクする
5. **published_at**: `2026-02-14`（本日の日付）
6. **draft**: `false`

## Acceptance Criteria

- [ ] 3本の記事ファイルが `src/content/blog/` に作成されている
- [ ] 各記事のフロントマターが既存記事と同じ形式である
- [ ] 各記事に3つ以上の内部リンクが含まれている
- [ ] Constitution Rule 3の免責表示が各記事に含まれている
- [ ] 未使用カテゴリ（technical, failure）が使われている
- [ ] `npm run build` が成功する（ブログ記事のパースエラーがない）
- [ ] typecheck, lint, format:check, test, build が全てパスする

## 変更禁止ファイル

- `src/lib/blog.ts`（既存のパース処理は変更不要）
- `src/app/blog/` 以下のページコンポーネント
- `docs/constitution.md`

## Notes

- 記事内容は実際のコードベースの実装に基づいて記述してください
- `src/tools/registry.ts` や各ツールの `meta.ts` を参照して正確な情報を記載
- メモアーカイブ内の実際のやりとりを参照して、失敗談記事の信憑性を確保
