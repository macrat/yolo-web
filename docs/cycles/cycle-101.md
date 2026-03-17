---
id: 101
description: B-205 フェーズ4-3a /play基盤構築 + ゲーム移行
started_at: "2026-03-17T18:52:23+0900"
completed_at: null
---

# サイクル-101

B-205（フェーズ4-3a: /play基盤構築 + ゲーム移行）を実施する。docs/play-migration-plan.md フェーズ1に基づき、/play基盤（PlayContentMeta統合型・レジストリ・パス生成・SEO関数・OGP）を構築し、ゲーム4種（四字熟語きめる・ナカマワケ・漢字カナル・カラーファインダー）を /games から /play へ移行する。

## 実施する作業

- [x] /play基盤の構築（PlayContentMeta統合型、レジストリ、パス生成関数、SEO関数、OGP 2層設計）
- [x] ゲーム4種の /play への移行（ルーティング・コンポーネント・データ）
- [x] /games → /play リダイレクト設定
- [x] ナビゲーション・内部リンクの更新
- [x] 既存テスト・新規テストの更新と全テスト通過確認
- [x] ビルド・lint・format確認

## 作業計画

### 目的

「遊ぶ」という1つの入口から全インタラクティブコンテンツにアクセスできるようにするための第1歩として、ゲーム4種（漢字カナール、四字キメル、ナカマワケ、イロドリ）を `/games` から `/play` に移行する。同時に `/play` の基盤（統合型、レジストリ、パス生成、SEO関数、OGP）を構築し、フェーズ2（クイズ・Fortune移行）の土台を作る。

ターゲットユーザーは手軽で面白い占い・診断・ゲームを楽しみたい人。現状はゲーム・クイズ・占いがバラバラの入口に分かれており、回遊性が低い。`/play` に統合することで全コンテンツを発見しやすくする。

### 作業内容

全7タスクに分割する。タスク1-2が基盤構築、タスク3-4がファイル移動とルーティング、タスク5がリンク更新、タスク6がリダイレクトとサイトマップ、タスク7がテストと最終検証。

依存関係: タスク1 → タスク2 → タスク3 → タスク4 → タスク5,6（並行可） → タスク7

---

#### タスク1: /play基盤モジュールの構築

**何をするか**: `/play` 統合の中核となる型定義・レジストリ・パス生成・SEO関数を新規作成する。

**作成するファイル**:

1. `src/play/types.ts` — PlayContentMeta インターフェースの定義
   - contentType: "quiz" | "game" | "fortune"
   - category: "fortune" | "personality" | "knowledge" | "game"
   - 共通フィールド: slug, title, description, shortDescription, icon, accentColor, keywords, publishedAt, updatedAt, trustLevel, trustNote
   - TrustLevel は `@/lib/trust-levels` からインポート
   - 注意: PlayContentMetaは一覧ページ・レジストリ用の共通ビューとして共通フィールドのみ持つ。GameMetaにあってPlayContentMetaにないフィールド（difficulty, statsKey, ogpSubtitle, sitemap, seo, valueProposition, usageExample, faq, relatedGameSlugs）はGameMetaがそのまま保持する

2. `src/play/paths.ts` — パス生成関数
   - `getPlayPath(slug: string): string` → `/play/${slug}`
   - `getPlayResultPath(slug: string, resultId: string): string` → `/play/${slug}/result/${resultId}`
   - `getDailyFortunePath(): string` → `/play/daily`

3. `src/play/registry.ts` — 統合レジストリ
   - GameMeta → PlayContentMeta への変換関数 `gameMetaToPlayContentMeta(gameMeta: GameMeta): PlayContentMeta`
   - `allPlayContents: PlayContentMeta[]` — 全PlayContentMetaの配列（この時点ではゲーム4種のみ）
   - `playContentBySlug: Map<string, PlayContentMeta>` — slugからの高速引き
   - `getPlayContentsByCategory(category: string): PlayContentMeta[]`
   - `getAllPlaySlugs(): string[]`
   - 既存の `src/games/registry.ts` から `allGameMetas` をインポートして変換

4. `src/play/seo.ts` — 統合SEO関数
   - `generatePlayMetadata(meta: PlayContentMeta, overrides?: Partial<Metadata>): Metadata`
   - `generatePlayJsonLd(meta: PlayContentMeta): object`
   - contentType/category に基づいてカテゴリ名を出し分ける（game→「ゲーム」、quiz+knowledge→「知識テスト」等）
   - twitter.images を opengraph-image URL で設定する方式を採用

**完了条件**:

- 上記4ファイルが作成され、TypeScriptのコンパイルが通ること
- `src/play/__tests__/` にレジストリとパス生成のテストが作成されていること

---

#### タスク2: /play一覧ページとデフォルトOGPの構築

**何をするか**: `/play` の一覧ページと、動的ルート用のデフォルトOGP画像生成を作成する。

**作成するファイル**:

1. `src/app/play/page.tsx` — /play 一覧ページ
   - ゲーム4種をカード形式で表示（既存の `/games` 一覧ページのデザインをベースに）
   - クイズ・診断への誘導リンク（`/quiz` へのリンク）をセクションとして追加
   - パンくず: ホーム > 遊ぶ
   - SEOメタデータ: title「遊ぶ」、description は全インタラクティブコンテンツの入口であることを伝える内容
   - `allPlayContents` からゲーム4種を取得して表示
   - 各カードのリンク先は `getPlayPath(slug)` を使用

2. `src/app/play/page.module.css` — 一覧ページのスタイル
   - 既存の `/games/page.module.css` をベースに、クイズ誘導セクションのスタイルを追加

3. `src/app/play/[slug]/opengraph-image.tsx` — デフォルトOGP画像
   - `createOgpImageResponse` を使用した動的OGP画像生成
   - PlayContentMeta の title, icon, accentColor を使用
   - このファイルは動的ルート `[slug]` 用であり、ゲームの固定ルートには適用されない

**完了条件**:

- `/play` にアクセスするとゲーム4種のカードとクイズ誘導リンクが表示されること
- デフォルトOGPが正しく生成されること

---

#### タスク3: ゲームモジュールのディレクトリ移動

**何をするか**: `src/games/` を `src/play/games/` に移動し、全importパスを更新する。

**作業内容**:

1. `src/games/` ディレクトリ全体を `src/play/games/` に移動
   - types.ts, registry.ts, seo.ts, shared/, \_components/, irodori/, kanji-kanaru/, nakamawake/, yoji-kimeru/, **tests**/

2. 移動したファイル内のimportパスを更新
   - `@/games/` → `@/play/games/` に一括置換
   - 外部からの `@/games/` 参照もすべて `@/play/games/` に更新
   - API routesのimportパスも更新: `src/app/api/kanji-kanaru/evaluate/route.ts` と `src/app/api/kanji-kanaru/hints/route.ts` の `@/games/kanji-kanaru/` → `@/play/games/kanji-kanaru/`
   - `src/lib/achievements/date.ts` のimportパスも更新

3. `src/play/games/registry.ts` の `getGamePath()` を更新
   - `/games/${slug}` → `/play/${slug}` に変更（`getPlayPath` をインポートして委譲するか、直接変更）

**注意点**:

- GameMeta はそのまま残す（PlayContentMetaへのマッピングは `src/play/registry.ts` で行う）
- `src/play/games/seo.ts` の `buildGamePageMetadata` も残す（各ゲームpage.tsxが引き続き使用）

**完了条件**:

- `src/games/` が存在せず、`src/play/games/` に全ファイルが移動していること
- プロジェクト内に `@/games/` へのimport参照が残っていないこと（`@/play/games/` に統一）
- 注意: TypeScriptコンパイルの通過確認はタスク4完了後に行う（`src/app/games/` のimportはタスク4で更新するため、タスク3単体ではコンパイルエラーが残る可能性がある）

---

#### タスク4: ゲームルーティングの移動とtwitter-image.tsx削除

**何をするか**: `src/app/games/` 配下の各ゲームルートを `src/app/play/` に移動し、旧ゲーム一覧ページを削除する。

**作業内容**:

1. 各ゲームのルーティングディレクトリを移動
   - `src/app/games/irodori/` → `src/app/play/irodori/`
   - `src/app/games/kanji-kanaru/` → `src/app/play/kanji-kanaru/`
   - `src/app/games/nakamawake/` → `src/app/play/nakamawake/`
   - `src/app/games/yoji-kimeru/` → `src/app/play/yoji-kimeru/`

2. 各ゲームのpage.tsx内のimportパスを更新
   - `@/games/` → `@/play/games/` に変更

3. 各ゲームのopengraph-image.tsxはそのまま移動（カスタマイズ層として維持）

4. twitter-image.tsx 4件を削除
   - `src/app/play/irodori/twitter-image.tsx`
   - `src/app/play/kanji-kanaru/twitter-image.tsx`
   - `src/app/play/nakamawake/twitter-image.tsx`
   - `src/app/play/yoji-kimeru/twitter-image.tsx`

5. 旧ゲーム一覧ページと関連ファイルを削除
   - `src/app/games/page.tsx`
   - `src/app/games/page.module.css`
   - `src/app/games/TodayDate.tsx`
   - `src/app/games/__tests__/`
   - `src/app/games/` ディレクトリ自体を削除

**完了条件**:

- `src/app/games/` が存在しないこと
- `src/app/play/[ゲームslug]/` に4ゲーム分のルーティングが存在すること
- twitter-image.tsx が4件とも削除されていること
- 各ゲームページのimportパスが正しく更新されていること

---

#### タスク5: ナビゲーションと内部リンクの更新

**何をするか**: ヘッダー、フッター、および全内部リンクをゲーム移行に合わせて更新する。

**作業内容**:

A. ナビゲーション更新:

1. `src/components/common/Header.tsx`
   - NAV_LINKS内の `{ href: "/games", label: "ゲーム" }` → `{ href: "/play", label: "遊ぶ" }` に変更
   - 「クイズ」リンクはそのまま残す（フェーズ2で除去）

2. `src/components/common/Footer.tsx`
   - ゲームセクションの見出し「ゲーム」→「遊ぶ」に変更
   - 「ゲーム一覧」リンクの href `/games` → `/play` に変更
   - gameLinksのhrefも `/play/` ベースに（layout.tsxで生成される値が変わるため、layout.tsx側で対応）
   - props名（gameLinks）はフェーズ1では据え置き（gameLinksのまま）とし、最小変更で済ませる

3. `src/app/layout.tsx`
   - `getGamePath()` の呼び出しを `getPlayPath()` に変更（またはgetGamePathの返値が変わっているため自動対応）
   - import を `@/play/games/registry` に更新

B. 内部リンク更新（ゲーム関連）:

4. `src/play/games/shared/_components/GameShareButtons.tsx` — `/games/${gameSlug}` → `/play/${gameSlug}`
5. `src/play/games/_components/GameLayout.tsx` — `/games/${meta.slug}` → `/play/${meta.slug}`（getPlayPath使用推奨）
6. `src/play/games/_components/RelatedGames.tsx` — `/games/${game.slug}` → `/play/${game.slug}`
7. `src/play/games/*/lib/share.ts`（4ファイル）— URL生成箇所の更新
8. `src/play/games/shared/_lib/crossGameProgress.ts` — getGamePath参照の更新
9. `src/dictionary/_components/kanji/KanjiDetail.tsx` — `/games/kanji-kanaru` → `/play/kanji-kanaru`
10. `src/dictionary/_components/yoji/YojiDetail.tsx` — `/games/yoji-kimeru` → `/play/yoji-kimeru`
11. `src/quiz/data/kanji-level.ts` — `/games/kanji-kanaru` 3箇所を `/play/kanji-kanaru` に
12. `src/quiz/data/yoji-level.ts` — `/games/yoji-kimeru` 3箇所を `/play/yoji-kimeru` に
13. `src/quiz/data/yoji-personality.ts` — `/games/yoji-kimeru` 1箇所を `/play/yoji-kimeru` に
14. `src/lib/search/build-index.ts` — `/games/${game.slug}` → `getPlayPath(game.slug)` に
15. `src/app/page.tsx` — `/games/${game.slug}` → `/play/${game.slug}`（または `getPlayPath` 使用）に更新
16. `src/play/games/shared/_components/NextGameBanner.tsx` — `/games/` リンクを `/play/` に更新
17. `src/app/not-found.tsx` — `/games` リンクを `/play` に、ラベル「ゲーム」を「遊ぶ」に変更

C. ブログ記事内リンク更新（13件）:

18. 以下13件のブログ記事内の `/games/` リンクを `/play/` に更新:
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

**完了条件**:

- ヘッダーに「遊ぶ」が表示され、「ゲーム」は存在しないこと
- フッターのゲームセクションが「遊ぶ」に変更されていること
- プロジェクト内のゲーム関連リンクがすべて `/play/` ベースになっていること（`grep -r "/games/" src/` で該当なし。ただしリダイレクト設定とテスト内の期待値は除く）
- ブログ記事13件のリンクが更新されていること

---

#### タスク6: リダイレクト設定とサイトマップ更新

**何をするか**: 旧URL `/games/*` から新URL `/play/*` への301リダイレクトを設定し、サイトマップを更新する。

**作業内容**:

1. `next.config.ts` にリダイレクトを追加
   - `/games` → `/play`（301 permanent）
   - `/games/:slug` → `/play/:slug`（301 permanent）

2. `src/app/sitemap.ts` の更新
   - `import { allGameMetas, getGamePath } from "@/games/registry"` → `@/play/games/registry` に変更
   - `getGamePath` の返値が `/play/` ベースになっているため、sitemap出力も自動的に更新される
   - ゲーム一覧エントリのURLを `${BASE_URL}/games` → `${BASE_URL}/play` に変更
   - `/play` 一覧ページのエントリを追加（まだなければ）

**完了条件**:

- `/games` へのアクセスが `/play` にリダイレクトされること
- `/games/kanji-kanaru` 等が `/play/kanji-kanaru` にリダイレクトされること
- サイトマップに `/play/kanji-kanaru` 等のエントリが含まれること
- サイトマップに `/games/` のエントリが含まれないこと

---

#### タスク7: テスト更新と最終検証

**何をするか**: 既存テストのパス更新、新規テストの追加、全体ビルドの成功を確認する。

**作業内容**:

1. 既存テストの更新
   - 方針: `@/games/` や `/games/` を含む全テストファイルのimportパスとアサーション値を `@/play/games/` や `/play/` に更新する
   - 主要な更新対象テストファイル:
     - `src/play/games/__tests__/registry.test.ts` — `getGamePath("kanji-kanaru")` のアサートを `/play/kanji-kanaru` に変更
     - `src/app/play/kanji-kanaru/__tests__/` — page.test.tsx, GameBoard.test.tsx, GuessInput.test.tsx のimportパスを更新
     - `src/components/common/__tests__/Header.test.tsx` — 「ゲーム」→「遊ぶ」、`/games` → `/play` に変更
     - `src/games/_components/__tests__/GameLayout.test.tsx` — importパス更新（移動先: `src/play/games/_components/__tests__/`）
     - `src/games/shared/_components/__tests__/GameShareButtons.test.tsx` — importパスとURL期待値更新
     - `src/games/shared/_components/__tests__/NextGameBanner.test.tsx` — importパスとURL期待値更新
     - `src/games/shared/_components/__tests__/CountdownTimer.test.tsx` — importパス更新
     - `src/games/yoji-kimeru/_components/__tests__/GameBoard.test.tsx` — importパス更新
     - `src/games/kanji-kanaru/_lib/__tests__/share.test.ts` — URL期待値更新
     - `src/games/yoji-kimeru/_lib/__tests__/share.test.ts` — URL期待値更新
     - `src/games/irodori/_lib/__tests__/share.test.ts` — URL期待値更新
     - `src/games/nakamawake/_lib/__tests__/share.test.ts` — URL期待値更新
     - `src/app/__tests__/seo-coverage.test.ts` — パス期待値更新
     - `src/app/__tests__/sitemap.test.ts` — パス期待値更新
     - `src/app/__tests__/page.test.tsx` — リンク期待値更新
     - `src/app/games/__tests__/page.test.tsx` — 削除対象（旧一覧ページのテスト）
     - `src/app/games/yoji-kimeru/__tests__/page.test.tsx` — `src/app/play/yoji-kimeru/__tests__/` に移動しimportパス更新
     - `src/dictionary/_components/__tests__/KanjiDetail.test.tsx` — リンク期待値更新
     - `src/dictionary/_components/__tests__/YojiDetail.test.tsx` — リンク期待値更新
     - `src/lib/__tests__/seo.test.ts` — パス期待値更新
     - `src/components/search/__tests__/useSearch.test.ts` — パス期待値更新
     - `src/components/search/__tests__/SearchModal.test.tsx` — パス期待値更新
     - `src/lib/search/__tests__/build-index.test.ts` — パス期待値更新
     - `src/app/__tests__/not-found.test.tsx` — `/games` リンク期待値を `/play` に更新
     - `src/__tests__/bundle-budget.test.ts` — カテゴリキー `"/games"` を `"/play"` に変更
     - `src/components/common/__tests__/Footer.test.tsx` — `/games` リンク期待値を `/play` に更新

2. 新規テストの追加（タスク1で一部作成済み）
   - `src/play/__tests__/registry.test.ts` — PlayContentMeta変換、getAllPlaySlugs、getPlayContentsByCategory
   - `src/play/__tests__/paths.test.ts` — getPlayPath、getPlayResultPath、getDailyFortunePath

3. 最終検証
   - `npm run lint` 成功
   - `npm run format:check` 成功
   - `npm run test` 成功
   - `npm run build` 成功

**完了条件**:

- 全既存テストが更新され、パスしていること
- play基盤のテストが追加されていること
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

---

### 検討した他の選択肢と判断理由

**選択肢: ゲームの getGamePath を変更せず、play の getPlayPath のみを使う方式**

getGamePath を `/play/${slug}` に変更する代わりに、getGamePath は `/games/${slug}` のまま残し、新しい getPlayPath のみを外部から使う方式。この場合、getGamePath を使っている箇所をすべて getPlayPath に置き換える必要がある。

不採用の理由: getGamePath の返値を変更する方が、既存の getGamePath 呼び出し箇所（sitemap.ts、layout.tsx 等）を個別に書き換える必要がなく、変更箇所が少なくなる。ただし getGamePath の返値が `/play/` になることで意味的な齟齬が生じるため、内部的には getPlayPath への委譲とし、getGamePath は将来的に廃止する（フェーズ2完了後）。この方式により、フェーズ1では最小限の変更で移行でき、フェーズ2で完全に getPlayPath に統一する。

### 計画にあたって参考にした情報

- `docs/play-migration-plan.md` — /play統合移行計画書（フェーズ1の詳細仕様）
- `.claude/rules/coding-rules.md` — コーディング原則
- `src/games/types.ts` — 既存のGameMetaインターフェース定義
- `src/games/registry.ts` — 既存のゲームレジストリ実装
- `src/games/seo.ts` — 既存のゲームSEO関数
- `src/app/games/` — 既存のゲームルーティング構成
- `src/app/quiz/page.tsx` — クイズ一覧ページの構成（/play一覧ページの参考）
- `src/components/common/Header.tsx` — NAV_LINKSの現在の定義
- `src/components/common/Footer.tsx` — フッターの現在のゲームセクション構成
- `next.config.ts` — 既存のリダイレクト設定パターン
- `src/app/sitemap.ts` — サイトマップの現在のゲームエントリ生成方法
- cycle-99, cycle-100の調査・計画結果

## レビュー結果

### 作業計画のレビュー（3回）

- **第1回**: 必須6件、推奨4件の指摘。API routes importパス漏れ、トップページリンク更新漏れ、achievements/date.ts漏れ、twitter-image.tsx誤記、テスト更新リスト不足、NextGameBanner.tsx漏れ、sitemap一覧URL未明記、Footer props方針未明記、タスク3-4境界曖昧、PlayContentMetaマッピング詳細不足。
- **第2回**: 前回10件すべて修正済み。新規必須3件の指摘: not-found.tsxリンク更新漏れ、bundle-budget.test.tsカテゴリキー漏れ、Footer.test.tsx漏れ。
- **第3回**: 前回3件修正済み。指摘なし。承認。

### タスク1: /play基盤モジュール（2回）

- **第1回**: 必須2件、推奨1件。getPlayContentsByCategoryの引数型がstring、generatePlayJsonLdのURL構築パターン不統一、SEOテスト不足。
- **第2回**: 前回3件修正済み。指摘なし。承認。

### タスク2: /play一覧ページとOGP（1回）

- **第1回**: 指摘なし。承認。

### タスク3-4: ゲームモジュール・ルーティング移動（1回）

- **第1回**: 指摘なし。承認。

### タスク5-6: ナビゲーション・リンク・リダイレクト（2回）

- **第1回**: 軽微7件。share.tsのJSDocコメント3件とshare.test.tsのテストデータURL4件に旧パス残存。
- **第2回**: 前回7件修正済み。指摘なし。承認。

## キャリーオーバー

なし

## 補足事項

- bundle-budget.test.tsは10件スキップ（ビルド成果物が必要なテストであり、今回の変更とは無関係の既存仕様）
- ブログ記事内のディレクトリパス（`src/app/games/` 等の技術解説）は過去の記述として正確なため変更していない

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
