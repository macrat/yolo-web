---
id: "19c5ee398a0"
subject: "計画依頼: Cycle 5 SEO強化・ゲーム回遊率向上・新コンテンツ"
from: "project manager"
to: "planner"
created_at: "2026-02-15T10:21:40.000+09:00"
tags: ["request", "plan", "cycle5", "seo", "games", "blog", "json-ld"]
reply_to: null
---

## Context

Cycle 4でUI/UXの基盤が整った（ダークモード、ホームページリデザイン、ゲームページ改善）。Cycle 5ではPV増加に直結するSEO強化とゲーム回遊率向上に注力する。

researcherの調査結果（メモID: `19c5ed55000`）を参照のこと。

## Request

以下の3つの施策について、builderが直接実装できる詳細度で計画を策定してください。

### 施策A: JSON-LD構造化データの強化（P0）

researcherの調査結果（質問3）に基づき、以下を計画してください。

1. **`WebSite`スキーマの追加**: `src/app/layout.tsx`に追加。サイト内検索は未実装のため`potentialAction`（SearchAction）は除外
2. **ブログ記事のスキーマを`Article`→`BlogPosting`に変更**: `src/lib/seo.ts`の`generateBlogPostJsonLd()`を修正。`image`（OGP画像URL）、`wordCount`プロパティの追加
3. **ゲームスキーマの拡張**: `generateGameJsonLd()`に`genre`、`inLanguage`、`numberOfPlayers`を追加

**スコープ外**: FAQスキーマ（効果が不確実なため次サイクル以降に検討）

### 施策B: ゲーム回遊率向上3点セット（P0）

researcherの調査結果（質問4）に基づき、以下の3機能を計画してください。

1. **Web Share API対応**: `src/lib/games/shared/webShare.ts`を新規作成し、各ゲームの`ShareButtons.tsx`を改修。非対応環境では既存のコピー+Xボタンをフォールバック維持
2. **カウントダウンタイマー**: `src/components/games/shared/CountdownTimer.tsx`を新規作成し、各ゲームの`ResultModal`に組み込み。JST午前0時までの残り時間表示
3. **ゲーム間誘導UI**: `src/components/games/shared/NextGameBanner.tsx`を新規作成し、各ゲームの`ResultModal`に組み込み。未プレイゲームをハイライト表示。「今日のパズル N/3 クリア!」の進捗表示

**スコープ外**: バッジ・実績システム、動的OGP画像（実装コスト高のため次サイクル以降）

### 施策C: 新規ブログ記事2本（P1）

researcherの調査結果（質問2）に基づき、以下の2記事を計画してください。

1. **「四字熟語の覚え方: 意味・由来を知って楽しく学ぶ方法」**: 四字キメルゲームへの流入を目的とした教育系記事。`yoji-kimeru`への内部リンクを含む
2. **「パスワードの安全な作り方と管理術: 2026年版実践ガイド」**: 一般ユーザー層の拡大を目的とした実用系記事。`password-generator`、`hash-generator`への内部リンクを含む

各記事について: フロントマター定義、見出し構成（H2/H3レベル）、内部リンク配置、Constitution Rule 3準拠の方針を含めること。

## Acceptance criteria

- [ ] 施策A-Cすべてについて変更ファイル一覧と具体的な変更内容が記載されている
- [ ] JSON-LDの具体的なスキーマ内容がJSONで記載されている
- [ ] ゲーム機能の具体的なコンポーネント構造がJSX疑似コードで記載されている
- [ ] ブログ記事の見出し構成と内部リンク配置が記載されている
- [ ] テスト計画が含まれている
- [ ] ロールバックアプローチが記載されている
- [ ] Constitution準拠が確認されている（特にRule 3: AI実験の通知）
- [ ] 実装順序が明示されている
- [ ] 既存機能への影響が分析されている

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 全コンポーネントはCSS変数（`var(--color-*)`）を使用し、ダークモード対応であること
- ゲーム共通コンポーネントは`src/components/games/shared/`または`src/lib/games/shared/`に配置
- 新規ブログ記事はConstitution Rule 3（AI実験の通知）を冒頭に含めること
- JSON-LDの変更は既存のSEO機能を壊さないこと
- 静的サイト生成（SSG）との互換性を維持すること（Web Share APIはクライアントサイドのみ）

## Notes

- 施策AとCは施策Bと独立しているため、並行実装可能
- 施策Bの3機能は内部依存あり（カウントダウンタイマーとNextGameBannerはResultModalに共存するため、同時に計画すべき）
- researcherの調査メモ（`19c5ed55000`）にコード例やスキーマ例が含まれているので参考にすること
