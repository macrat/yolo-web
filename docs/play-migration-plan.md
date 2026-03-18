# /play 統合移行計画書

## 1. 概要

全インタラクティブコンテンツ（ゲーム4種 + クイズ・診断14種 + 日替わり占い1種 = 計19種）を `/play` 配下に統合する。URL変更だけでなく、内部の型名・ディレクトリ名・関数名も `/play` に統一する。

### 推奨案の根拠

cycle-99の調査で選択肢A（/play統合）が推奨案として確定。実データに基づくSEOリスク再評価により、Tier 2基準（分類境界問題の完全解消、サイトコンセプトとの整合）の優位が決定的となった。詳細は `docs/cycles/cycle-99.md` を参照。

### 設計原則

1. **同じファイルを2回触らない**: 基盤を先に作り、コンテンツを順に移行する
2. **各フェーズを短く管理可能に**: 1フェーズで1つの明確な目標を達成
3. **各フェーズ終了時にサイトが正常動作**: リンク切れ・動線欠落なし
4. **新規プロジェクトでも選ぶ設計**: 旧名称（QuizMeta等）を引きずらない

## 2. 全体アーキテクチャ

### 2-1. ディレクトリ構成（最終形）

```
src/
├── play/                          # 統合基盤（新規）
│   ├── types.ts                   # PlayContentMeta 統合型
│   ├── registry.ts                # 統合レジストリ
│   ├── paths.ts                   # パス生成関数
│   ├── seo.ts                     # 統合SEO関数
│   ├── __tests__/
│   ├── games/                     # ゲームモジュール（src/games/ から移動）
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   ├── seo.ts
│   │   ├── shared/
│   │   ├── _components/
│   │   ├── irodori/
│   │   ├── kanji-kanaru/
│   │   ├── nakamawake/
│   │   └── yoji-kimeru/
│   ├── quiz/                      # クイズモジュール（src/quiz/ から移動）
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   ├── scoring.ts
│   │   ├── _components/
│   │   └── data/
│   └── fortune/                   # Fortune モジュール（src/fortune/ から移動）
│       ├── types.ts
│       ├── logic.ts
│       ├── _components/
│       └── data/
├── app/
│   ├── play/
│   │   ├── page.tsx               # /play 一覧ページ
│   │   ├── page.module.css
│   │   ├── [slug]/                # 動的ルート（クイズ系）
│   │   │   ├── page.tsx
│   │   │   ├── opengraph-image.tsx  # デフォルトOGP
│   │   │   └── result/[resultId]/
│   │   ├── daily/                 # 日替わり占い
│   │   ├── irodori/               # 各ゲーム個別ルート
│   │   ├── kanji-kanaru/
│   │   ├── nakamawake/
│   │   └── yoji-kimeru/
│   ├── quiz/   → 削除（リダイレクトで対応）
│   ├── games/  → 削除（リダイレクトで対応）
│   └── fortune/ → 削除（リダイレクトで対応）
```

### 2-2. PlayContentMeta 統合型

既存の QuizMeta と GameMeta は構造が大きく異なる（QuizMeta: フラットSEO、GameMeta: seoサブオブジェクト）。統合型は両方を包含する設計とする。

```typescript
// src/play/types.ts
interface PlayContentMeta {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  accentColor: string;
  keywords: string[];
  publishedAt: string;
  updatedAt?: string;
  trustLevel: TrustLevel;
  trustNote?: string;
  contentType: "quiz" | "game" | "fortune";
  category: "fortune" | "personality" | "knowledge" | "game";
}
```

実装方針: 各フェーズで移行対象の型を PlayContentMeta に統合する。フェーズ1で GameMeta を PlayContentMeta に移行し、フェーズ2で QuizMeta を PlayContentMeta に移行する。統合レジストリは PlayContentMeta を返す。

### 2-3. 統合レジストリ

```typescript
// src/play/registry.ts
// quiz/registry.ts と games/registry.ts を集約

function getAllPlaySlugs(): string[];
function getPlayContent(slug: string): PlayContent | undefined;
function getPlayContentsByCategory(category: string): PlayContent[];
```

PlayContent は PlayContentMeta に加え、コンテンツ種別固有のデータ（QuizDefinition や GameMeta の全フィールド）を保持する判別可能なユニオン型。

### 2-4. パス生成関数

```typescript
// src/play/paths.ts
function getPlayPath(slug: string): string; // → /play/${slug}
function getPlayResultPath(slug: string, resultId: string): string; // → /play/${slug}/result/${resultId}
function getDailyFortunePath(): string; // → /play/daily
```

### 2-5. 統合SEO関数

```typescript
// src/play/seo.ts
function generatePlayMetadata(meta: PlayContentMeta): Metadata;
function generatePlayJsonLd(meta: PlayContentMeta): object;
```

既存の generateQuizMetadata / buildGamePageMetadata を統合。twitter.images を設定する方式に統一。

### 2-6. OGP設計（デフォルト + カスタマイズ 2層設計）

- **デフォルト層**: `/play/[slug]/opengraph-image.tsx` で `createOgpImageResponse` による自動生成
- **カスタマイズ層**: 個別ルートに `opengraph-image.tsx` を配置してオーバーライド可能
- **twitter:image**: `generateMetadata` の `twitter.images` で opengraph-image URL を設定（twitter-image.tsx は不使用）
- **twitter-image.tsx を廃止する理由**:
  - 全件が opengraph-image.tsx の re-export であり、実質的な差異がない
  - ファイル数の削減により保守性が向上
  - Ownerからの指摘（二重管理の不合理性）

## 3. フェーズ分割計画

### フェーズ1: /play基盤構築 + ゲーム移行

**目的**: /play の基盤を構築し、最もシンプルなゲーム4種を移行して基盤の動作を検証する。

**ゲームを最初に移行する理由**:

- 最もシンプル: 4項目のみ、静的ルート、result pages なし
- 相互依存なし: quiz モジュールとの依存がないため独立して移行可能
- 基盤の動作検証に最適: 少数で検証し、問題を早期発見

#### 作業内容

1. **基盤構築**
   - `src/play/types.ts`: PlayContentMeta 統合型の定義
   - `src/play/registry.ts`: 統合レジストリ（最初はゲーム4種のみ登録）
   - `src/play/paths.ts`: パス生成関数
   - `src/play/seo.ts`: 統合SEO関数
   - `src/app/play/[slug]/opengraph-image.tsx`: デフォルトOGP画像

2. **ゲーム移行**
   - `src/games/` → `src/play/games/` にディレクトリ移動
   - `src/app/games/[各ゲーム]` → `src/app/play/[各ゲーム]` にルーティング移動
   - `src/games/registry.ts` の `getGamePath()` を `getPlayPath()` に接続
   - `/games/*` → `/play/*` のリダイレクト設定
   - 旧 `src/app/games/` の削除
   - ゲーム関連の内部リンク更新（辞典→ゲーム、各ゲームshare.ts、crossGameProgress等）
   - ゲーム個別OGP: デフォルトOGPが同等品質なら削除（カスタマイズ層として維持も可）
   - ゲーム個別 twitter-image.tsx 4件を削除（`irodori/twitter-image.tsx`, `kanji-kanaru/twitter-image.tsx`, `nakamawake/twitter-image.tsx`, `yoji-kimeru/twitter-image.tsx`）
   - ゲーム関連テストの更新・移動

3. **GameMeta → PlayContentMeta 統合**
   - GameMeta のフィールドを PlayContentMeta にマッピングする変換を実装
   - ゲーム4種のデータを PlayContentMeta 形式で統合レジストリに登録

4. **ナビゲーション（部分更新）**
   - ヘッダー: 「ゲーム」を「遊ぶ(/play)」に変更。「クイズ」は残す（フェーズ2で除去）
   - フッター: ゲームセクションを「遊ぶ」セクションに変更
   - /play 一覧ページ: ゲーム4種を表示 + クイズ・診断への誘導リンク（/quiz へ）

5. **SEO・サイトマップ更新**
   - sitemap.ts のゲームエントリを `/play/` に更新
   - next.config.ts にゲーム用リダイレクト追加

6. **ブログ記事内リンク更新**（ゲーム関連のみ）

#### フェーズ終了時のサイト状態

- `/play` 一覧ページが存在し、ゲーム4種 + クイズへの誘導リンクが表示される
- `/play/[game-slug]` で全4ゲームにアクセスできる
- `/games/*` は `/play/*` にリダイレクトされる
- ヘッダー: ホーム / 遊ぶ / クイズ / ツール / 辞典 / ブログ / About（「ゲーム」→「遊ぶ」に変更のみ）
- `/quiz/*` は従来通り動作する（未移行）
- `/fortune/daily` は従来通り動作する（未移行）

#### 受け入れ基準チェックリスト

- [x] `src/play/types.ts`, `registry.ts`, `paths.ts`, `seo.ts` が存在する（cycle-101で確認）
- [x] `/play/[game-slug]` で全4ゲームにアクセスできる（cycle-101で確認）
- [x] `/games/*` → `/play/*` のリダイレクトが動作する（cycle-101で確認）
- [x] `/play` 一覧ページが表示される（cycle-101で確認、cycle-102で19種に拡張）
- [x] ヘッダーに「遊ぶ」が表示され、「ゲーム」は削除されている（cycle-101で確認）
- [x] `/quiz/*` が従来通り動作する → フェーズ2で `/play/*` に移行済み（cycle-102）
- [x] `/fortune/daily` が従来通り動作する → フェーズ2で `/play/daily` に移行済み（cycle-102）
- [x] OGP画像がデフォルト層で正しく生成される（cycle-101で確認）
- [x] ゲーム関連の内部リンクがすべて `/play/` に更新されている（cycle-101で確認）
- [x] GameMeta が PlayContentMeta に統合されている（cycle-101で確認）
- [x] ゲーム個別 twitter-image.tsx 4件が削除されている（cycle-101で確認）
- [x] `npm run lint && npm run format:check && npm run test && npm run build` 成功（cycle-102で確認）

---

### フェーズ2: クイズ・診断 + Fortune移行 + 最終仕上げ

**目的**: クイズ・診断14種とFortune 1種を /play に移行し、旧ディレクトリを完全に削除して移行を完了する。

**Fortune をクイズと同時に移行する理由**:

- Fortune は1種のみで独立フェーズにするには小さすぎる
- `fortune/_components/DailyFortuneCard.tsx` が `@/quiz/_components/ShareButtons` に依存しており、クイズ移行と同時に対応するのが自然

#### 作業内容

1. **QuizMeta への category フィールド追加**
   - `category: "fortune" | "personality" | "knowledge"` を追加
   - 全14種のクイズデータファイルに category を設定

2. **QuizMeta → PlayContentMeta 統合**
   - QuizMeta のフィールドを PlayContentMeta にマッピングする変換を実装
   - クイズ14種のデータを PlayContentMeta 形式で統合レジストリに登録

3. **クイズモジュール移動**
   - `src/quiz/` → `src/play/quiz/` にディレクトリ移動
   - 統合レジストリにクイズ14種を登録

4. **クイズ ルーティング移行**
   - `src/app/quiz/[slug]` → `src/app/play/[slug]` に統合（動的ルート）
   - `src/app/quiz/[slug]/result/[resultId]` → `src/app/play/[slug]/result/[resultId]`
   - 移行対象に以下を含む:
     - `src/app/quiz/[slug]/result/[resultId]/page.tsx`
     - `src/app/quiz/[slug]/result/[resultId]/CompatibilityDisplay.tsx`
     - `src/app/quiz/[slug]/result/[resultId]/opengraph-image.tsx`
     - `src/app/quiz/[slug]/result/[resultId]/page.module.css`
     - `src/app/quiz/[slug]/opengraph-image.tsx`
   - `src/app/quiz/layout.tsx` → `src/app/play/layout.tsx` に統合
   - 旧 `src/app/quiz/` の削除

5. **Fortune モジュール移動**
   - `src/fortune/` → `src/play/fortune/` に移動
   - ShareButtons の依存を解決（`src/play/quiz/_components/ShareButtons` への参照に変更、または共通コンポーネント化）
   - 日替わり占いを統合レジストリに登録（または登録せずハードコード維持の判断）

6. **Fortune ルーティング移行**
   - `src/app/fortune/daily/` → `src/app/play/daily/` に移動
   - daily の opengraph-image.tsx を `createOgpImageResponse` にリファクタリング
   - 旧 `src/app/fortune/` の削除

7. **OGP統一**
   - quiz の opengraph-image.tsx を `createOgpImageResponse` に統一
   - result ページの opengraph-image.tsx も同様にリファクタリング
   - twitter-image.tsx を削除し、generateMetadata の twitter.images に統一

8. **SEO関数の統合**
   - `src/lib/seo.ts` の generateQuizMetadata → generatePlayMetadata に統合
   - URL を `/play/` ベースに更新
   - twitter.images フィールドを追加

9. **内部リンク更新**
   - クイズデータファイル内の relatedLinks（14ファイル）
   - quiz コンポーネント内のリンク（ResultCard, InviteFriendButton 等）
   - 結果ページのパンくず（「クイズ」→「遊ぶ」）
   - トップページのクイズリンク
   - about ページのリンク
   - DailyFortuneCard のリンク
   - 検索インデックス（build-index.ts）

10. **リダイレクト設定**
    - `/quiz/:slug` → `/play/:slug`
    - `/quiz/:slug/result/:resultId` → `/play/:slug/result/:resultId`
    - `/quiz` → `/play`
    - `/fortune/daily` → `/play/daily`

11. **ナビゲーション最終化**
    - ヘッダーから「クイズ」を除去（「遊ぶ」に統合済み）
    - /play 一覧ページにクイズ・診断サブカテゴリ（占い/性格診断/知識テスト）を追加
    - /play 一覧ページの最終形（全19種がサブカテゴリ別に表示される）
    - フッターの最終形

12. **テスト更新**
    - quiz 関連テストの移動・パス更新
    - fortune 関連テストの移動・パス更新
    - seo テストの URL 更新
    - sitemap テストの更新
    - seo-coverage テストの更新

13. **ブログ記事内リンク更新**（クイズ関連）

14. **最終仕上げ**
    - すべてのリダイレクトの動作確認
    - sitemap の最終確認（/play/daily が含まれることを確認）
    - 旧ディレクトリ `src/quiz/`, `src/games/`, `src/fortune/` が完全に削除されていることを確認（フェーズ1でゲームは移動済みだが、残骸がないか確認）

15. **ドキュメント更新**
    - site-value-improvement-plan.md のステータス更新
    - content-categories.md の更新（必要に応じて）
    - backlog の B-201, B-205, B-206 を Done に移動

#### フェーズ終了時のサイト状態

- `/play` 一覧ページに全19種（ゲーム4 + クイズ・診断14 + 日替わり占い1）がサブカテゴリ別に表示される
- `/play/[slug]` で全18種（ゲーム4 + クイズ・診断14）にアクセスできる
- `/play/[slug]/result/[resultId]` で結果ページにアクセスできる
- `/play/daily` で日替わり占いにアクセスできる
- `/quiz/*`, `/games/*`, `/fortune/daily` はすべて `/play/*` にリダイレクトされる
- ヘッダー: ホーム / 遊ぶ / ツール / 辞典 / ブログ / About（「クイズ」を除去）
- 旧ルーティングディレクトリが完全に削除されている

#### 受け入れ基準チェックリスト

- [x] QuizMeta に category フィールドが追加され、全14種に設定されている（タスク1で確認）
- [x] QuizMeta が PlayContentMeta に統合されている（タスク1で確認）
- [x] `src/play/quiz/` にクイズモジュールが移動している（タスク2で確認）
- [x] `src/play/fortune/` に Fortune モジュールが移動している（タスク3で確認）
- [x] `/play/[slug]` で全14種のクイズ・診断にアクセスできる（タスク4で確認）
- [x] `/play/[slug]/result/[resultId]` で結果ページにアクセスできる（タスク4で確認）
- [x] `/play/daily` で日替わり占いにアクセスできる（タスク5で確認）
- [x] `/quiz/*` → `/play/*` のリダイレクトが動作する（タスク8で確認）
- [x] `/fortune/daily` → `/play/daily` のリダイレクトが動作する（タスク8で確認）
- [x] OGP画像が `createOgpImageResponse` に統一されている（タスク4-5で確認。result OGPは計画通り個別維持）
- [x] twitter:image が全ページに設定されている（generatePlayMetadata + daily/page.tsxで確認）
- [x] /play 一覧ページに占い/性格診断/知識テスト/ゲームの4セクションがある（タスク7+12で確認）
- [x] ヘッダーから「クイズ」が除去されている（タスク7で確認）
- [x] 旧ディレクトリ `src/app/quiz/`, `src/app/games/`, `src/app/fortune/` が削除されている（タスク4-5で確認）
- [x] 全リダイレクト（/quiz/_, /games/_, /fortune/daily）が正しく動作する（タスク8で確認）
- [x] site-value-improvement-plan.md のステータスが更新されている（サイクル完了時に更新）
- [x] `npm run lint && npm run format:check && npm run test && npm run build` 成功（タスク13で確認）

## 4. 移行対象ファイル一覧

### 4-1. フェーズ1（ゲーム移行）で移動するファイル

**フィーチャーモジュール:**

- `src/games/` → `src/play/games/` （全ディレクトリ: types.ts, registry.ts, seo.ts, shared/, \_components/, irodori/, kanji-kanaru/, nakamawake/, yoji-kimeru/, **tests**/)

**ルーティング:**

- `src/app/games/irodori/` → `src/app/play/irodori/`（page.tsx, opengraph-image.tsx）
- `src/app/games/kanji-kanaru/` → `src/app/play/kanji-kanaru/`（page.tsx, layout.tsx, opengraph-image.tsx）
- `src/app/games/nakamawake/` → `src/app/play/nakamawake/`（page.tsx, opengraph-image.tsx）
- `src/app/games/yoji-kimeru/` → `src/app/play/yoji-kimeru/`（page.tsx, layout.tsx, opengraph-image.tsx）
- `src/app/games/page.tsx`, `page.module.css`, `TodayDate.tsx`, `__tests__/` → 削除（/play 一覧ページで置換）

**削除対象（twitter-image.tsx）:**

- `src/app/games/irodori/twitter-image.tsx`
- `src/app/games/kanji-kanaru/twitter-image.tsx`
- `src/app/games/nakamawake/twitter-image.tsx`
- `src/app/games/yoji-kimeru/twitter-image.tsx`

**新規作成:**

- `src/play/types.ts`
- `src/play/registry.ts`
- `src/play/paths.ts`
- `src/play/seo.ts`
- `src/play/__tests__/`
- `src/app/play/page.tsx`, `page.module.css`
- `src/app/play/[slug]/opengraph-image.tsx`

**内部リンク更新（ゲーム関連のみ）:**

- `src/play/games/shared/_components/GameShareButtons.tsx`
- `src/play/games/shared/_components/NextGameBanner.tsx`
- `src/play/games/_components/RelatedGames.tsx`
- `src/play/games/_components/GameLayout.tsx`
- `src/play/games/*/lib/share.ts`（4ファイル）
- `src/play/games/shared/_lib/crossGameProgress.ts`
- `src/dictionary/_components/kanji/KanjiDetail.tsx`
- `src/dictionary/_components/yoji/YojiDetail.tsx`
- `src/quiz/data/kanji-level.ts`, `yoji-level.ts`, `yoji-personality.ts`（ゲームへのリンク）

**ブログ記事内リンク更新（ゲーム関連、13件）:**

- `src/blog/content/2026-02-13-content-strategy-decision.md`
- `src/blog/content/2026-02-13-how-we-built-this-site.md`
- `src/blog/content/2026-02-14-japanese-word-puzzle-games-guide.md`
- `src/blog/content/2026-02-15-yojijukugo-learning-guide.md`
- `src/blog/content/2026-02-18-japanese-traditional-colors-dictionary.md`
- `src/blog/content/2026-02-19-irodori-and-kanji-expansion.md`
- `src/blog/content/2026-02-19-quiz-diagnosis-feature.md`
- `src/blog/content/2026-02-22-game-infrastructure-refactoring.md`
- `src/blog/content/2026-02-23-yoji-quiz-themes.md`
- `src/blog/content/2026-02-26-nextjs-directory-architecture.md`
- `src/blog/content/2026-02-28-game-dictionary-layout-unification.md`
- `src/blog/content/2026-02-28-url-structure-reorganization.md`
- `src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md`

### 4-2. フェーズ2（クイズ・診断 + Fortune移行）で移動するファイル

**フィーチャーモジュール:**

- `src/quiz/` → `src/play/quiz/` （全ディレクトリ: types.ts, registry.ts, scoring.ts, \_components/, data/, **tests**/)
- `src/fortune/` → `src/play/fortune/`

**ルーティング:**

- `src/app/quiz/[slug]/` → `src/app/play/[slug]/` に統合
  - `src/app/quiz/[slug]/page.tsx`
  - `src/app/quiz/[slug]/page.module.css`
  - `src/app/quiz/[slug]/opengraph-image.tsx`
- `src/app/quiz/[slug]/result/[resultId]/` → `src/app/play/[slug]/result/[resultId]/`
  - `src/app/quiz/[slug]/result/[resultId]/page.tsx`
  - `src/app/quiz/[slug]/result/[resultId]/CompatibilityDisplay.tsx`
  - `src/app/quiz/[slug]/result/[resultId]/opengraph-image.tsx`
  - `src/app/quiz/[slug]/result/[resultId]/page.module.css`
- `src/app/quiz/layout.tsx` → `src/app/play/layout.tsx` に統合
- `src/app/quiz/page.tsx`, `page.module.css`, `__tests__/` → 削除
- `src/app/fortune/daily/` → `src/app/play/daily/`

**依存解決:**

- `src/play/fortune/_components/DailyFortuneCard.tsx` の ShareButtons import パス更新

**内部リンク更新（クイズ関連）:**

- `src/play/quiz/data/*.ts`（14ファイル: relatedLinks の href）
- `src/play/quiz/_components/ResultCard.tsx`
- `src/play/quiz/_components/CompatibilitySection.tsx`
- `src/play/quiz/_components/InviteFriendButton.tsx`
- `src/app/page.tsx`（トップページ）
- `src/app/about/page.tsx`
- `src/lib/seo.ts`
- `src/lib/search/build-index.ts`
- ブログ記事（6件: `/quiz/` リンクを含む記事）:
  - `src/blog/content/2026-02-15-yojijukugo-learning-guide.md`
  - `src/blog/content/2026-02-19-irodori-and-kanji-expansion.md`
  - `src/blog/content/2026-02-19-quiz-diagnosis-feature.md`
  - `src/blog/content/2026-02-23-yoji-quiz-themes.md`
  - `src/blog/content/2026-02-26-kotowaza-quiz.md`
  - `src/blog/content/2026-02-28-url-structure-reorganization.md`

## 5. リダイレクトマップ（全件）

フェーズ1で追加:
| 旧URL | 新URL | 種類 |
|--------|--------|------|
| `/games` | `/play` | 一覧 |
| `/games/:slug` | `/play/:slug` | ゲーム |

フェーズ2で追加:
| 旧URL | 新URL | 種類 |
|--------|--------|------|
| `/quiz` | `/play` | 一覧 |
| `/quiz/:slug` | `/play/:slug` | クイズ |
| `/quiz/:slug/result/:resultId` | `/play/:slug/result/:resultId` | 結果ページ |
| `/fortune/daily` | `/play/daily` | 占い |

## 6. 注意事項

- **slug衝突の確認**: 計画策定時に確認済み: クイズ14種とゲーム4種のslugに衝突なし。クイズslugs: `animal-personality`, `character-fortune`, `character-personality`, `contrarian-fortune`, `impossible-advice`, `japanese-culture`, `kanji-level`, `kotowaza-level`, `music-personality`, `science-thinking`, `traditional-color`, `unexpected-compatibility`, `yoji-level`, `yoji-personality`。ゲームslugs: `irodori`, `kanji-kanaru`, `nakamawake`, `yoji-kimeru`。全18 slugが一意であることを確認済み
- **中間状態の管理**: 各フェーズ終了時に未移行コンテンツへの動線が確保されていることを必ず確認する
- **テスト戦略**: 各フェーズで `npm run lint && npm run format:check && npm run test && npm run build` が成功することを完了条件とする
- **coding-rules.md の遵守**: 各フェーズの実装時に `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を必ず読むこと
- **generatePlayMetadata のカテゴリ名問題**: generatePlayMetadata では contentType/category に基づいてカテゴリ名を出し分けるため（例: 占い系なら「占い」、知識系なら「知識テスト」）、移行時に generateQuizMetadata の「クイズ」固定問題は自然に解決される
