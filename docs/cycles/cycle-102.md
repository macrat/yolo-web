---
id: 102
description: B-206 フェーズ4-3b クイズ・診断・Fortune移行
started_at: "2026-03-17T23:35:30+0900"
completed_at: null
---

# サイクル-102

B-206（フェーズ4-3b: クイズ・診断・Fortune移行）を実施する。docs/play-migration-plan.md フェーズ2に基づき、クイズ14種と日替わり占い1種を /play に統合し、旧ディレクトリ（/quiz, /fortune）を完全に削除して移行を完了する。ナビゲーションの最終化も含む。

## 実施する作業

- [x] QuizMeta への category フィールド追加と全14種への設定
- [x] QuizMeta → PlayContentMeta 統合（変換関数の実装、統合レジストリへの登録）
- [x] クイズモジュール移動（src/quiz/ → src/play/quiz/）
- [x] クイズルーティング移行（src/app/quiz/ → src/app/play/ への統合）
- [x] Fortune モジュール移動（src/fortune/ → src/play/fortune/）
- [x] Fortune ルーティング移行（src/app/fortune/daily/ → src/app/play/daily/）
- [x] OGP統一（createOgpImageResponse統一）
- [x] SEO関数の統合（generateQuizMetadata → generatePlayMetadata）
- [x] 内部リンク更新（クイズ・Fortune関連）
- [x] リダイレクト設定（/quiz/_, /fortune/daily → /play/_）
- [x] ナビゲーション最終化（ヘッダーから「クイズ」除去、/play一覧ページの最終形）
- [x] テスト更新と最終検証（lint, format, test, build すべて成功）
- [x] ブログ記事内リンク更新（クイズ関連6件）
- [x] ドキュメント更新（site-value-improvement-plan.md等）
- [x] レビュー指摘修正（bundle-budget、CTAコントラスト、aria-label日本語化、フッター改善）
- [x] /play一覧ページUX改善（ヒーロー強化、おすすめセクション、カードビジュアル強化、モバイル最適化）
- [x] テスト修正と最終検証（全テストパス、lint/format/build成功、残存URL確認）

## 作業計画

### 目的

「遊ぶ」という1つの入口から全インタラクティブコンテンツにアクセスできるようにする第2歩として、クイズ14種と日替わり占い1種を `/play` に移行する。同時に旧ディレクトリ（`/quiz`, `/fortune`）を完全に削除し、ナビゲーションを最終形にする。

ターゲットユーザーは手軽で面白い占い・診断・ゲームを楽しみたい人。現状はゲーム・クイズ・占いがバラバラの入口に分かれており、回遊性が低い。`/play` に統合することで全19種のコンテンツを発見しやすくする。

### 作業内容

全10タスクに分割する。タスク1が型・レジストリ拡張、タスク2-3がモジュール移動、タスク4-5がルーティング移行、タスク6が内部リンク更新、タスク7がナビゲーション・一覧ページ最終化、タスク8がリダイレクト・サイトマップ、タスク9がブログ記事リンク更新、タスク10がテスト更新と最終検証。

依存関係: タスク1 → タスク2,3（並行可） → タスク4,5（並行可） → タスク6,7,8,9（並行可） → タスク10

---

#### タスク1: QuizMeta拡張と統合レジストリへのクイズ・Fortune登録

**何をするか**: QuizMetaにcategoryフィールドを追加し、QuizMeta→PlayContentMeta変換関数を実装して統合レジストリにクイズ14種+Fortune 1種を登録する。

**作業内容**:

1. `src/quiz/types.ts` の QuizMeta インターフェースに category フィールドを追加
   - `category: "knowledge" | "personality"` を追加（QuizTypeと同じ値域だが、PlayContentMetaのcategoryに変換するための明示的フィールド）
   - 注意: QuizMetaのcategoryは "knowledge" | "personality" であり、PlayContentMetaのcategory（"fortune" | "personality" | "knowledge" | "game"）とは値域が異なる。変換関数で対応する
   - play-migration-plan.md では QuizMeta の category を `"fortune" | "personality" | "knowledge"` としているが、クイズに "fortune" カテゴリは存在しないため、実装では `"knowledge" | "personality"` に限定する。Fortune は PlayContentMeta として直接登録するため QuizMeta の category には含めない。この差異は意図的な設計判断であり、play-migration-plan.md のフェーズ2セクション1の記述を本計画の実装に合わせて更新する

2. 全14種のクイズデータファイルにcategoryを設定
   - knowledge型（3種）: `kanji-level`, `kotowaza-level`, `yoji-level` → `category: "knowledge"`
   - personality型（11種）: 残り全て → `category: "personality"`
   - 対象ファイル（14件）:
     - `src/quiz/data/kanji-level.ts`
     - `src/quiz/data/kotowaza-level.ts`
     - `src/quiz/data/yoji-level.ts`
     - `src/quiz/data/traditional-color.ts`
     - `src/quiz/data/yoji-personality.ts`
     - `src/quiz/data/impossible-advice.ts`
     - `src/quiz/data/contrarian-fortune.ts`
     - `src/quiz/data/unexpected-compatibility.ts`
     - `src/quiz/data/music-personality.ts`
     - `src/quiz/data/character-fortune.ts`
     - `src/quiz/data/animal-personality.ts`
     - `src/quiz/data/science-thinking.ts`
     - `src/quiz/data/japanese-culture.ts`
     - `src/quiz/data/character-personality.ts`

3. `src/play/registry.ts` に QuizMeta → PlayContentMeta 変換関数を追加
   - `quizMetaToPlayContentMeta(quizMeta: QuizMeta): PlayContentMeta` を実装
   - contentType: "quiz"、category: quizMeta.category をそのままマッピング（"knowledge" → "knowledge", "personality" → "personality"）
   - QuizMetaにはquestionCountフィールドがあるがPlayContentMetaにはないため、変換時に落とす

4. `src/play/registry.ts` に Fortune 用の PlayContentMeta を定数として追加
   - Fortuneは1種のみでレジストリ管理するほどではないが、一覧ページ表示のためPlayContentMetaとして登録する
   - slug: "daily"、title: "今日のユーモア運勢"、contentType: "fortune"、category: "fortune"
   - icon: "🔮"、accentColor: "#7c3aed"（現在のOGPで使用されている色）
   - trustLevel: "generated"（現在のDailyFortunePageで設定されている値）

5. `src/play/registry.ts` の `allPlayContents` を拡張
   - ゲーム4種 + クイズ14種 + Fortune 1種 = 19種を結合
   - import: `allQuizMetas` from `@/quiz/registry`
   - Fortune用PlayContentMetaは同ファイル内で定数定義
   - `playContentBySlug`, `getPlayContentsByCategory`, `getAllPlaySlugs` は allPlayContents に依存しているので自動的に19種に拡張される

6. `src/play/__tests__/registry.test.ts` を更新
   - allPlayContentsが19種であることを確認するテストを追加
   - quizMetaToPlayContentMeta変換テストを追加
   - Fortune PlayContentMetaの存在確認テストを追加
   - getPlayContentsByCategoryで各カテゴリが正しくフィルタされることを確認

**完了条件**:

- QuizMetaに category フィールドが追加され、全14種に設定されていること
- `allPlayContents.length === 19` であること
- TypeScriptのコンパイルが通ること
- レジストリテストがパスすること

---

#### タスク2: クイズモジュールのディレクトリ移動

**何をするか**: `src/quiz/` を `src/play/quiz/` に移動し、全importパスを更新する。

**作業内容**:

1. `src/quiz/` ディレクトリ全体を `src/play/quiz/` に移動
   - 移動対象: types.ts, registry.ts, scoring.ts, \_components/, data/（data/**tests**/ を含む）, **tests**/
   - data/**tests**/ 配下の5ファイルも移動対象に含む:
     - character-personality-compat-different.test.ts
     - character-personality-compat-shared.test.ts
     - character-personality-compatibility-integrated.test.ts
     - character-personality-compatibility-self-pairs.test.ts
     - character-personality-results-batch3.test.ts

2. 移動したファイル内のimportパスを更新
   - `@/quiz/` → `@/play/quiz/` に一括置換
   - 対象はquizモジュール内の全ファイル

3. 外部から `@/quiz/` を参照しているファイルのimportパスを更新
   - `src/lib/seo.ts`: `import type { QuizMeta } from "@/quiz/types"` → `"@/play/quiz/types"`
   - `src/app/sitemap.ts`: `import { allQuizMetas } from "@/quiz/registry"` → `"@/play/quiz/registry"`
   - `src/lib/search/build-index.ts`: `import { allQuizMetas } from "@/quiz/registry"` → `"@/play/quiz/registry"`
   - `src/app/page.tsx`: `import { allQuizMetas } from "@/quiz/registry"` → `"@/play/quiz/registry"`
   - `src/play/registry.ts`: クイズimportパスを更新（タスク1で追加したもの）
   - `src/fortune/_components/DailyFortuneCard.tsx`: `import ShareButtons from "@/quiz/_components/ShareButtons"` → `"@/play/quiz/_components/ShareButtons"`（このファイルはタスク3で移動されるが、一旦パスを更新しておく）

4. quiz関連テストファイルのimportパス更新
   - `src/play/quiz/__tests__/registry.test.ts`
   - `src/play/quiz/__tests__/scoring.test.ts`
   - `src/play/quiz/__tests__/music-personality.test.ts`
   - `src/play/quiz/__tests__/science-thinking.test.ts`
   - `src/play/quiz/__tests__/character-personality-results-batch1.test.ts`
   - `src/play/quiz/__tests__/character-personality-results-batch2.test.ts`
   - `src/play/quiz/data/__tests__/character-personality-compat-different.test.ts`
   - `src/play/quiz/data/__tests__/character-personality-compat-shared.test.ts`
   - `src/play/quiz/data/__tests__/character-personality-compatibility-integrated.test.ts`
   - `src/play/quiz/data/__tests__/character-personality-compatibility-self-pairs.test.ts`
   - `src/play/quiz/data/__tests__/character-personality-results-batch3.test.ts`

**注意点**:

- QuizMeta, QuizDefinition, QuizType等の型は `src/play/quiz/types.ts` にそのまま残す
- `src/lib/seo.ts` の generateQuizMetadata / generateQuizJsonLd はタスク6で処理するため、この時点ではimportパスのみ更新

**完了条件**:

- `src/quiz/` が存在せず、`src/play/quiz/` に全ファイルが移動していること
- プロジェクト内に `@/quiz/` へのimport参照が残っていないこと（`@/play/quiz/` に統一）
- 注意: ルーティング（`src/app/quiz/`）はタスク4で移動するため、タスク2単体ではビルドが通らない可能性がある

---

#### タスク3: Fortuneモジュールのディレクトリ移動

**何をするか**: `src/fortune/` を `src/play/fortune/` に移動し、全importパスを更新する。

**作業内容**:

1. `src/fortune/` ディレクトリ全体を `src/play/fortune/` に移動
   - 移動対象: types.ts, logic.ts, data/, \_components/

2. 移動したファイル内のimportパスを更新
   - `@/fortune/` → `@/play/fortune/` に一括置換
   - `src/play/fortune/_components/DailyFortuneCard.tsx`:
     - `import ShareButtons from "@/quiz/_components/ShareButtons"` → `"@/play/quiz/_components/ShareButtons"`（タスク2完了を前提）
     - `import { getUserSeed, selectFortune } from "@/fortune/logic"` → `"@/play/fortune/logic"`
     - `import type { DailyFortuneEntry } from "@/fortune/types"` → `"@/play/fortune/types"`

3. 外部から `@/fortune/` を参照しているファイルのimportパスを更新
   - `src/app/fortune/daily/page.tsx`: `import DailyFortuneCard from "@/fortune/_components/DailyFortuneCard"` → `"@/play/fortune/_components/DailyFortuneCard"`（このファイルはタスク5で移動されるが、一旦パスを更新しておく）

**完了条件**:

- `src/fortune/` が存在せず、`src/play/fortune/` に全ファイルが移動していること
- プロジェクト内に `@/fortune/` へのimport参照が残っていないこと（`@/play/fortune/` に統一）

---

#### タスク4: クイズルーティングの移行

**何をするか**: `src/app/quiz/[slug]/` を `src/app/play/[slug]/` に統合し、result サブルートも移行する。旧クイズ一覧ページを削除する。

**作業内容**:

1. `src/app/play/[slug]/page.tsx` を新規作成（クイズ個別ページ）
   - 既存の `src/app/quiz/[slug]/page.tsx` をベースに移行
   - importパスを更新:
     - `@/quiz/_components/QuizContainer` → `@/play/quiz/_components/QuizContainer`
     - `@/quiz/registry` → `@/play/quiz/registry`
     - `generateQuizMetadata`, `generateQuizJsonLd` → `generatePlayMetadata`, `generatePlayJsonLd` from `@/play/seo`
   - generateStaticParams: `getAllQuizSlugs()` を使用（ゲームは固定ルートなのでここでは不要）
   - generateMetadata: `generatePlayMetadata(playContentBySlug.get(slug))` を使用。ただし、既存のgenerateQuizMetadataと異なりPlayContentMetaはquestionCountを持たないため、JsonLdのnumberOfQuestionsは失われる。これは許容する（generatePlayJsonLdは既にQuiz型のJsonLdを生成可能）
   - Breadcrumb: `{ label: "遊ぶ", href: "/play" }` に変更
   - 注意: Next.jsでは固定ルート（`/play/irodori/` 等）が動的ルート（`/play/[slug]/`）より優先される仕様のため、ゲームの固定ルートとクイズの動的ルートは衝突しない
   - generateStaticParams ではクイズ14種のslugのみを返す（ゲームは固定ルートで処理されるため動的ルートの対象外）

2. `src/app/play/[slug]/page.module.css` を移動
   - `src/app/quiz/[slug]/page.module.css` → `src/app/play/[slug]/page.module.css`

3. `src/app/play/[slug]/result/[resultId]/` ディレクトリを新規作成
   - `src/app/quiz/[slug]/result/[resultId]/page.tsx` → `src/app/play/[slug]/result/[resultId]/page.tsx`
     - importパス更新: `@/quiz/` → `@/play/quiz/`
     - URL文字列更新: `/quiz/${slug}` → `/play/${slug}` （shareUrl, metadata URL, Breadcrumb href, Link href）
     - Breadcrumb: `{ label: "クイズ", href: "/quiz" }` → `{ label: "遊ぶ", href: "/play" }`
   - `src/app/quiz/[slug]/result/[resultId]/page.module.css` → そのまま移動
   - `src/app/quiz/[slug]/result/[resultId]/CompatibilityDisplay.tsx` → そのまま移動（importパス更新: `@/quiz/` → `@/play/quiz/`）
   - `src/app/quiz/[slug]/result/[resultId]/opengraph-image.tsx` → そのまま移動（importパス更新: `@/quiz/registry` → `@/play/quiz/registry`）

4. `src/app/play/[slug]/opengraph-image.tsx` の更新
   - 現在はplayContentBySlugからのみ取得しているが、クイズがregistryに登録されているので自動的に機能する
   - ただし、既存のクイズOGP（`src/app/quiz/[slug]/opengraph-image.tsx`）はcreateOgpImageResponseではなく独自のImageResponseを使っている
   - 統一方針: 既存の `/play/[slug]/opengraph-image.tsx` は `createOgpImageResponse` を使用しており、クイズもこれで統一する。クイズ独自OGPのdescription表示は省略されるが、title/icon/accentColorは同等に表示される
   - したがって、`src/app/quiz/[slug]/opengraph-image.tsx` の移動は不要（`src/app/play/[slug]/opengraph-image.tsx` が全slugに対応する）

5. `src/app/quiz/layout.tsx` は不要（パススルーのみ）
   - `src/app/play/` にlayout.tsxは作成しない（不要）

6. 旧クイズルーティングの削除
   - `src/app/quiz/` ディレクトリ全体を削除
   - 削除対象: layout.tsx, page.tsx, page.module.css, **tests**/page.test.tsx, [slug]/（page.tsx, page.module.css, opengraph-image.tsx, result/）

**完了条件**:

- `src/app/quiz/` が存在しないこと
- `src/app/play/[slug]/page.tsx` が存在し、クイズの動的ルートとして機能すること
- `src/app/play/[slug]/result/[resultId]/` が存在し、結果ページが機能すること
- Breadcrumbが「ホーム > 遊ぶ > [クイズ名]」の形式になっていること

---

#### タスク5: Fortuneルーティングの移行

**何をするか**: `src/app/fortune/daily/` を `src/app/play/daily/` に移動し、旧fortuneディレクトリを削除する。

**作業内容**:

1. `src/app/play/daily/` ディレクトリを新規作成

2. `src/app/fortune/daily/page.tsx` → `src/app/play/daily/page.tsx`
   - importパス更新: `@/fortune/_components/DailyFortuneCard` → `@/play/fortune/_components/DailyFortuneCard`
   - メタデータURL更新: `/fortune/daily` → `/play/daily` （openGraph.url, alternates.canonical）
   - twitter.images を追加: `[${BASE_URL}/play/daily/opengraph-image]`
   - Breadcrumb: `{ label: "ホーム", href: "/" }, { label: "遊ぶ", href: "/play" }, { label: PAGE_TITLE }` に変更（3階層）
   - 注意: クイズのresultページは4階層（ホーム > 遊ぶ > クイズ名 > 結果）だが、Fortuneにはresultページがないため3階層で正しい。この階層数の違いは意図通りである

3. `src/app/fortune/daily/page.module.css` → `src/app/play/daily/page.module.css`（そのまま移動）

4. `src/app/play/daily/opengraph-image.tsx` を新規作成
   - `createOgpImageResponse` を使用して統一する
   - title: "今日のユーモア運勢"、icon: "🔮"、accentColor: "#7c3aed"
   - 既存の `src/app/fortune/daily/opengraph-image.tsx` の独自ImageResponseを `createOgpImageResponse` に置き換える

5. 旧Fortuneルーティングの削除
   - `src/app/fortune/` ディレクトリ全体を削除

**完了条件**:

- `src/app/fortune/` が存在しないこと
- `src/app/play/daily/page.tsx` が存在し、日替わり占いページが機能すること
- OGPが `createOgpImageResponse` で統一されていること

---

#### タスク6: 内部リンクとSEO関数の更新

**何をするか**: プロジェクト全体の `/quiz/` および `/fortune/` URLリンクを `/play/` ベースに更新する。不要になったSEO関数を整理する。

**作業内容**:

A. クイズコンポーネント内のリンク更新（5ファイル）:

1. `src/play/quiz/_components/ResultCard.tsx`
   - `/quiz/${quizSlug}/result/${result.id}` → `/play/${quizSlug}/result/${result.id}`（2箇所: origin付きとフォールバック）

2. `src/play/quiz/_components/InviteFriendButton.tsx`
   - `/quiz/${quizSlug}?ref=${resultTypeId}` → `/play/${quizSlug}?ref=${resultTypeId}`（2箇所）

3. `src/play/quiz/_components/CompatibilitySection.tsx`
   - `/quiz/${quizSlug}/result/${myType.id}?with=${friendType.id}` → `/play/${quizSlug}/result/${myType.id}?with=${friendType.id}`（2箇所）

4. `src/play/fortune/_components/DailyFortuneCard.tsx`
   - `/fortune/daily` → `/play/daily`（shareUrl内の2箇所: origin付きとフォールバック）

5. `src/app/play/[slug]/result/[resultId]/page.tsx`（タスク4で移行済みだが漏れがないか確認）
   - shareUrl内の `/quiz/` → `/play/`
   - Breadcrumb hrefの `/quiz/` → `/play/`
   - Link hrefの `/quiz/${slug}` → `/play/${slug}`

B. クイズデータファイルのrelatedLinks更新（14ファイル内で `/quiz/` を含むもの）:

6. 以下のファイルで `href: "/quiz/[slug]"` → `href: "/play/[slug]"` に更新:
   - `src/play/quiz/data/kotowaza-level.ts` — 2箇所（kanji-level, yoji-level）
   - `src/play/quiz/data/japanese-culture.ts` — 1箇所（animal-personality）
   - `src/play/quiz/data/impossible-advice.ts` — 2箇所（contrarian-fortune, unexpected-compatibility）
   - `src/play/quiz/data/unexpected-compatibility.ts` — 2箇所（contrarian-fortune, impossible-advice）
   - `src/play/quiz/data/science-thinking.ts` — 3箇所（music-personality, animal-personality, character-fortune）
   - `src/play/quiz/data/contrarian-fortune.ts` — 2箇所（impossible-advice, unexpected-compatibility）
   - `src/play/quiz/data/music-personality.ts` — 2箇所（contrarian-fortune, unexpected-compatibility）
   - `src/play/quiz/data/character-personality.ts` — 2箇所（character-fortune, music-personality）
   - `src/play/quiz/data/animal-personality.ts` — 2箇所（music-personality, character-fortune）
   - `src/play/quiz/data/character-fortune.ts` — 2箇所（music-personality, contrarian-fortune）
   - `src/play/quiz/data/kotowaza-level.ts` — 5箇所（results[].recommendationLink: kanji-level 3箇所, yoji-level 2箇所）
   - 注意: kanji-level.ts, yoji-level.ts, yoji-personality.ts, traditional-color.tsのrelatedLinksは `/dictionary/` や `/play/` を指しているので更新不要
   - 注意: kotowaza-level.ts は relatedLinks に加え、results[].recommendationLink にも `/quiz/kanji-level` および `/quiz/yoji-level` への参照が合計5箇所ある。これらも `/play/` に更新する

C. 外部ファイルのリンク更新:

7. `src/app/page.tsx`（トップページ）
   - `href="/quiz"` の statBadge → 削除（「デイリーパズル」バッジが既に `href="/play"` を指しており、クイズ・診断もそこに統合されるため）。統合後は「デイリーパズル」のラベルを `${allPlayContents.length} 遊ぶ` 等の全コンテンツ数を反映した表現に更新し、1つのバッジで /play 全体を代表させる
   - `href={"/quiz/${quiz.slug}"}` → `href={"/play/${quiz.slug}"}` （クイズカード14個分のリンク）
   - `href="/quiz"` の "全クイズを見る" リンク → `href="/play"`
   - `allQuizMetas` のimport元は タスク2で更新済み

8. `src/app/about/page.tsx`
   - `href="/quiz"` → `href="/play"`（1箇所。「クイズ・診断」リンクを /play 一覧ページに向ける）

9. `src/lib/search/build-index.ts`
   - クイズのURL: `/quiz/${quiz.slug}` → `/play/${quiz.slug}`（`getPlayPath` を使用推奨）
   - `allQuizMetas` のimport元は タスク2で更新済み

D. SEO関数の整理:

10. `src/lib/seo.ts`
    - `generateQuizMetadata` と `generateQuizJsonLd` を削除
    - `import type { QuizMeta } from "@/play/quiz/types"` のimportも削除
    - これらの関数はタスク4で `generatePlayMetadata` / `generatePlayJsonLd` に置き換え済み
    - `safeJsonLdStringify` はクイズ以外でも使われているため残す

**完了条件**:

- プロジェクト内に `/quiz/` URLパターンのリンクが残っていないこと（リダイレクト設定とテスト内の期待値を除く）
- プロジェクト内に `/fortune/` URLパターンのリンクが残っていないこと（リダイレクト設定とテスト内の期待値を除く）
- `src/lib/seo.ts` から generateQuizMetadata, generateQuizJsonLd が削除されていること

---

#### タスク7: ナビゲーションと/play一覧ページの最終化

**何をするか**: ヘッダーから「クイズ」を除去し、/play一覧ページを全19種をサブカテゴリ別に表示する最終形にする。フッターの「その他」セクションから「クイズ・診断」リンクを除去する。

**作業内容**:

1. `src/components/common/Header.tsx`
   - NAV_LINKS から `{ href: "/quiz", label: "クイズ" }` を除去
   - 結果: ホーム / ツール / 遊ぶ / 辞典 / ブログ / About

2. `src/components/common/Footer.tsx`
   - 「その他」セクションから `{ href: "/quiz", label: "クイズ・診断" }` を除去
   - 「遊ぶ」セクションにクイズ・占いの代表リンクを追加する判断は不要（gameLinksで動的に生成されるため、コンテンツ数が多くなりすぎる。「遊ぶ一覧」リンクのみで十分）

3. `src/app/play/page.tsx` の最終形への改修
   - 現在: ゲーム4種のフラットなカード表示 + quizPromoセクション
   - 最終形: 4つのサブカテゴリ（占い / 性格診断 / 知識テスト / ゲーム）別のセクション表示
   - quizPromoセクションを削除（不要になるため）
   - `allPlayContents` をカテゴリでグループ化して表示
   - `getPlayContentsByCategory` を使用して各カテゴリのコンテンツを取得
   - Fortune（daily）は `getDailyFortunePath()` で `/play/daily` へのリンクを生成
   - 各カードにカテゴリバッジ（「占い」「性格診断」「知識テスト」「ゲーム」）を表示
   - クイズカードには問数を表示するため、QuizMetaのquestionCountが必要。方法: allQuizMetas をインポートしてslugでルックアップするか、PlayContentMetaにquestionCountを追加するか。前者は統合型の意味を損なうため、一覧ページ表示に限定して `allQuizMetas` を `@/play/quiz/registry` からimportして直接参照する
   - メタデータを更新: `/play` 一覧ページのlastModifiedにクイズ・Fortune日付も含める

4. `src/app/play/page.module.css` の更新
   - サブカテゴリセクション用のスタイルを追加
   - quizPromo関連スタイルを削除

**完了条件**:

- ヘッダーに「クイズ」が表示されず、「遊ぶ」に統合されていること
- フッターの「その他」セクションに「クイズ・診断」が表示されないこと
- /play一覧ページに占い/性格診断/知識テスト/ゲームの4セクションが表示されること
- 全19種のコンテンツがカテゴリ別に表示されること

---

#### タスク8: リダイレクト設定とサイトマップ更新

**何をするか**: 旧URL（/quiz/\*, /fortune/daily）から新URLへの301リダイレクトを設定し、サイトマップを更新する。

**作業内容**:

1. `next.config.ts` にリダイレクトを追加
   - `/quiz` → `/play`（301 permanent）
   - `/quiz/:slug` → `/play/:slug`（301 permanent）
   - `/quiz/:slug/result/:path*` → `/play/:slug/result/:path*`（301 permanent）
   - `/fortune/daily` → `/play/daily`（301 permanent）

2. `src/app/sitemap.ts` の更新
   - `/quiz` 一覧エントリを削除（`/play` に統合済み）
   - `allQuizMetas.map` で生成していた `/quiz/${meta.slug}` エントリを `/play/${meta.slug}` に変更
   - `import { allQuizMetas } from "@/play/quiz/registry"` に更新（タスク2で対応済みのはず）
   - `/play/daily` エントリを新規追加（現状 `/fortune/daily` のサイトマップエントリは存在しないため、更新ではなく新規追加となる）
   - `/play` 一覧ページの lastModified を全コンテンツの最新日時に更新（latestGameDate, latestQuizDate, fortuneDate の最大値）
   - latestQuizDate の算出は既存のまま

**完了条件**:

- `/quiz` へのアクセスが `/play` にリダイレクトされること
- `/quiz/kanji-level` 等が `/play/kanji-level` にリダイレクトされること
- `/quiz/kanji-level/result/master` 等が `/play/kanji-level/result/master` にリダイレクトされること
- `/fortune/daily` が `/play/daily` にリダイレクトされること
- サイトマップに `/play/kanji-level` 等のエントリが含まれること
- サイトマップに `/quiz/` のエントリが含まれないこと
- サイトマップに `/play/daily` のエントリが含まれること

---

#### タスク9: ブログ記事内リンク更新

**何をするか**: ブログ記事内の `/quiz/` リンクを `/play/` に更新する。

**作業内容**:

1. 以下6件のブログ記事内の `/quiz/` リンクを `/play/` に更新:
   - `src/blog/content/2026-02-15-yojijukugo-learning-guide.md`
   - `src/blog/content/2026-02-19-irodori-and-kanji-expansion.md`
   - `src/blog/content/2026-02-19-quiz-diagnosis-feature.md`
   - `src/blog/content/2026-02-23-yoji-quiz-themes.md`
   - `src/blog/content/2026-02-26-kotowaza-quiz.md`
   - `src/blog/content/2026-02-28-url-structure-reorganization.md`

2. 判断基準: ブログ記事内のリンクには2種類がある。(a) ユーザー向けURL（`/quiz/kanji-level` 等、読者がクリックして遷移するリンク）は `/play/` に更新する。(b) ディレクトリパス（`src/app/quiz/` 等の技術解説）やURL構造の説明（例: `url-structure-reorganization.md` 内の設計経緯としてのURL例）は、執筆時点の事実を記録したものであり変更しない

**完了条件**:

- 上記6件のブログ記事内でユーザー向けの `/quiz/` URLリンクが `/play/` に更新されていること
- 技術解説中のファイルパス参照は変更されていないこと

---

#### タスク10: テスト更新と最終検証

**何をするか**: 全テストファイルのパス更新、新規テスト追加、全体ビルドの成功を確認する。

**作業内容**:

1. 既存テストの更新（`@/quiz/`, `/quiz/`, `@/fortune/`, `/fortune/` を含む全テストファイル）

   A. SEO関連テスト:
   - `src/lib/__tests__/seo.test.ts` — generateQuizMetadata / generateQuizJsonLd のテストを削除（関数自体が削除されるため）。`/quiz/` のURL期待値が含まれていれば更新
   - `src/app/__tests__/seo-coverage.test.ts` — `/quiz/` パス、`@/quiz/registry` import、`@/app/quiz/` importを全て `/play/` ベースに更新。クイズのSEOテストは `generatePlayMetadata` を使うように更新。なお、`import("@/app/quiz/page")` のエントリ（/quiz 一覧ページのメタデータテスト）はタスク4で /quiz/page.tsx が削除されるため、エントリ自体を削除する（/play 一覧ページのメタデータテストは既に別エントリとして存在するか、存在しなければ追加する）
   - `src/app/__tests__/sitemap.test.ts` — `/quiz/` エントリの期待値を `/play/` に更新。`@/quiz/registry` importを更新。`/play/daily` エントリの期待値を追加

   B. トップページテスト:
   - `src/app/__tests__/page.test.tsx` — `@/quiz/registry` mockを `@/play/quiz/registry` に更新。`/quiz` リンク期待値を `/play` に更新

   C. クイズ一覧ページテスト:
   - `src/app/quiz/__tests__/page.test.tsx` — タスク4で旧ディレクトリごと削除済み。/play一覧ページのテストはタスク7で必要に応じて新規作成

   D. バンドルバジェットテスト:
   - `src/__tests__/bundle-budget.test.ts` — categories内の `"/quiz": 40 * 1024` と `"/fortune": 30 * 1024` を削除。`"/play"` のバジェットをクイズ・Fortune統合に伴い調整（現在140KB。クイズの最大ページが加わるため適宜増加が必要か確認）

   E. ヘッダー・フッターテスト:
   - `src/components/common/__tests__/Header.test.tsx` — 「クイズ」リンクの期待値を削除
   - `src/components/common/__tests__/Footer.test.tsx` — 「クイズ・診断」リンクの期待値を削除

   F. 検索カテゴリ型:
   - `src/lib/search/types.ts` — `"quiz"` カテゴリ型は内部識別子であり、URLパスとは独立しているため変更不要

   G. 検索インデックステスト:
   - `src/lib/search/__tests__/build-index.test.ts` — クイズのURL期待値を `/quiz/` → `/play/` に更新
   - `src/components/search/__tests__/useSearch.test.ts` — クイズのURL期待値があれば更新
   - `src/components/search/__tests__/SearchModal.test.tsx` — 同上

2. /play一覧ページの新規テスト
   - `src/app/play/__tests__/page.test.tsx` — 全19種のコンテンツが表示されること、4つのカテゴリセクションが存在すること

3. 最終検証
   - `npm run lint` 成功
   - `npm run format:check` 成功
   - `npm run test` 成功
   - `npm run build` 成功
   - grepで `/quiz/` URLパターンの残存確認（リダイレクト設定とテスト期待値以外に残っていないこと）
   - grepで `/fortune/` URLパターンの残存確認（リダイレクト設定以外に残っていないこと）
   - grepで `@/quiz/` importパターンの残存確認（ゼロであること）
   - grepで `@/fortune/` importパターンの残存確認（ゼロであること）

**完了条件**:

- 全既存テストが更新され、パスしていること
- /play一覧ページのテストが追加されていること
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること
- `@/quiz/`, `@/fortune/` へのimport参照がプロジェクト内にゼロであること
- `/quiz/`, `/fortune/` URLパターンがリダイレクト設定以外に残っていないこと

---

### 検討した他の選択肢と判断理由

**選択肢1: ShareButtonsを共通コンポーネント化する**

DailyFortuneCardが `@/quiz/_components/ShareButtons` に依存している問題の解決策として、ShareButtonsを `src/components/common/ShareButtons.tsx` に移動して共通化する案。

不採用の理由: ShareButtonsはクイズ・Fortune専用のprops（quizTitle, contentType, contentId）を持っており、汎用コンポーネントとは言えない。移行後は `@/play/quiz/_components/ShareButtons` となり、同じ `/play` 配下のFortune からの参照は自然である。共通化は将来的にゲームのShareButtons（GameShareButtons）との統合時に検討する。

**選択肢2: クイズOGPを個別ファイルとして維持する**

既存のクイズOGP（`src/app/quiz/[slug]/opengraph-image.tsx`）はdescription表示があるが、`/play/[slug]/opengraph-image.tsx` の `createOgpImageResponse` にはない。個別OGPを維持する案。

不採用の理由: OGPのdescription表示は視覚的なインパクトが小さく、title/icon/accentColorで十分に識別可能。`createOgpImageResponse` での統一により保守性が向上する。result/[resultId]/opengraph-image.tsx は結果ページ固有の表示（quizTitle + resultTitle + resultIcon）が必要なため個別ファイルを維持する。

**選択肢3: PlayContentMetaにquestionCountを追加する**

/play一覧ページでクイズの問数を表示するために、PlayContentMetaにoptionalなquestionCountフィールドを追加する案。

不採用の理由: PlayContentMetaは共通ビュー型として設計されており、クイズ固有のフィールドを追加するとゲーム固有フィールド（difficulty等）も追加する圧力が生まれ、型が肥大化する。一覧ページ内で限定的にallQuizMetasを参照する方が型の純粋性を維持できる。

### 計画にあたって参考にした情報

- `docs/play-migration-plan.md` — /play統合移行計画書（フェーズ2の詳細仕様）
- `docs/cycles/cycle-101.md` — フェーズ1の実施記録（計画フォーマットの参考）
- `.claude/rules/coding-rules.md` — コーディング原則
- `src/quiz/types.ts` — QuizMeta インターフェース定義
- `src/quiz/registry.ts` — クイズレジストリ（14種の登録）
- `src/quiz/_components/` — クイズコンポーネント群（内部リンクパターンの確認）
- `src/quiz/data/*.ts` — クイズデータファイル（relatedLinksの確認）
- `src/fortune/` — Fortuneモジュール構成
- `src/app/quiz/` — クイズルーティング構成
- `src/app/fortune/daily/` — Fortuneルーティング構成
- `src/play/types.ts` — PlayContentMeta定義
- `src/play/registry.ts` — 統合レジストリの現在の実装
- `src/play/seo.ts` — 統合SEO関数の現在の実装
- `src/play/paths.ts` — パス生成関数
- `src/app/play/[slug]/opengraph-image.tsx` — デフォルトOGP画像の実装
- `src/app/play/page.tsx` — /play一覧ページの現在の実装
- `src/lib/seo.ts` — 既存のgenerateQuizMetadata / generateQuizJsonLd
- `src/components/common/Header.tsx` — NAV_LINKS定義
- `src/components/common/Footer.tsx` — フッターのセクション構成
- `next.config.ts` — リダイレクト設定パターン
- `src/app/sitemap.ts` — サイトマップ生成の現在の実装
- `src/app/page.tsx` — トップページのクイズリンク
- `src/lib/search/build-index.ts` — 検索インデックスのクイズURL
- `src/__tests__/bundle-budget.test.ts` — バンドルバジェット設定

---

#### タスク11: レビュー指摘修正

**何をするか**: タスク6-7のレビューで指摘された4件の問題を修正する。

**作業内容**:

1. **タスク6 M1: bundle-budget テストの残存カテゴリ定義確認**
   - `src/__tests__/bundle-budget.test.ts` を確認し、`"/quiz"` や `"/fortune"` のカテゴリ定義が残存していないか確認する
   - 現状の調査結果: コメントとして「/quiz and /fortune have been migrated to /play (cycle-102 B-206)」が記載されており、categories オブジェクトからは削除済み。ただし、ビルド後にテストを実行して `/quiz` や `/fortune` ルートが存在しないことによるテスト失敗が発生しないか確認する必要がある
   - 必要に応じて修正する

2. **タスク7 M1: CTAボタンのWCAGコントラスト比修正**
   - 現状: `getContrastTextColor()` が背景色に対してWCAG AA（4.5:1）を満たすテキスト色（白 or #1a1a1a）を返す仕組みが既に実装されている
   - 確認対象: CTA ボタンのフォントサイズが 0.8rem（デスクトップ）/ 0.7rem（モバイル）であり、WCAG AA の通常テキスト基準（4.5:1）が適用される。`getContrastTextColor` の判定が正しく機能しているか、各 accentColor について検証する
   - 特に注意すべき色: `#f59e0b`（contrarian-fortune）、`#d97706`（kotowaza-level）など黄色系。これらは白文字だとコントラスト不足になるが、`getContrastTextColor` が正しく `#1a1a1a` を返すはず
   - 実際にコントラスト計算を確認し、問題がある色があれば accentColor 自体を調整するか、CTA テキスト色の選択ロジックを改善する
   - 確認方法: テストケースを追加して全19種の accentColor に対する CTA テキスト色が WCAG AA を満たすことを検証する

3. **タスク7 S1: aria-label の日本語化**
   - `src/components/common/Footer.tsx`: `aria-label="Footer navigation"` → `aria-label="フッターナビゲーション"`
   - `src/components/common/Header.tsx`: `aria-label="Main navigation"` → `aria-label="メインナビゲーション"`
   - サイトの主要言語が日本語であるため、スクリーンリーダーが日本語で読み上げられるように統一する
   - 注意: `/play/page.tsx` の aria-label は既に日本語（「カテゴリナビゲーション」「〇〇カテゴリのコンテンツ一覧」）なので変更不要

4. **タスク7 S2: フッター「遊ぶ」セクションの改善**
   - 現状: フッターの「遊ぶ」セクションには `{ href: "/play", label: "遊ぶ一覧" }` + `gameLinks`（ゲーム4種のみ）が表示されている
   - `gameLinks` は `src/app/layout.tsx`（51-53行目）で `allGameMetas` から生成されており、ゲーム4種のタイトルのみが表示される。カテゴリアンカーリンク方式への変更に伴い、以下のように修正する:
     - `layout.tsx` の変数名を `gameLinks` → `playLinks` に改名
     - 生成コードを `allGameMetas.map(...)` からカテゴリアンカーリンクの静的配列に変更: `[{ href: "/play#fortune", label: "占い" }, { href: "/play#personality", label: "性格診断" }, { href: "/play#knowledge", label: "知識テスト" }, { href: "/play#game", label: "ゲーム" }]`
     - `<Footer gameLinks={gameLinks} />` → `<Footer playLinks={playLinks} />` に変更
     - `Footer.tsx` の props インターフェースも `gameLinks` → `playLinks` に改名し、「遊ぶ」セクションの links で `playLinks` を使用する

**完了条件**:

- bundle-budget テストが `/quiz`・`/fortune` 関連で失敗しないこと
- 全19種の accentColor に対して CTA テキスト色が WCAG AA（4.5:1）を満たすことがテストで検証されていること
- Header / Footer の aria-label が日本語であること
- フッターの「遊ぶ」セクションに占い・性格診断・知識テスト・ゲームのカテゴリアンカーリンクが含まれること

---

#### タスク12: /play一覧ページUX改善

**何をするか**: 競合調査とベストプラクティス調査に基づき、/play 一覧ページを来訪者にとって魅力的で分かりやすいページに改善する。現在の実装をベースに段階的に改善する。サムネイル画像生成は対象外（B-113で別途検討予定）。

**改善の方針**: 現状評価4.3/10の主な原因は (1) ヒーローの視覚的インパクト不足、(2) フィルタ/カテゴリジャンプの欠如（タスク7で対応済み）、(3) カードの色使いが単調、(4) 回遊性の仕掛け不足、(5) モバイルでのスクロール量。(2) はカテゴリナビタブで対応済みのため、残り4点を改善する。

**作業内容**:

A. ヒーローセクションの強化（優先度高）

1. **「今日のピックアップ」の導入**
   - ヒーローバナー内またはヒーローバナー直下に「今日のピックアップ」として1コンテンツを大きくフィーチャーする
   - 対象コンテンツの選出ロジック: DAILY_UPDATE_SLUGS を配列化し、`dayOfYear % DAILY_UPDATE_SLUGS.size` でデイリー系コンテンツから1つを決定論的に選出する。dayOfYear は `Math.floor((Date.now() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)` で算出する。これによりサーバーサイドで日付ごとに異なるコンテンツが選ばれ、毎日ページの印象が変わる
   - 表示要素: 大きなアイコン + タイトル + 感情訴求型コピー + 「今すぐ遊ぶ」CTAボタン
   - Vonvon の「ヒーローで1コンテンツを強くプッシュして没入させる戦略」を参考にする
   - 注意: ヒーロー内に直接配置することで追加のHTTPリクエストを発生させない。静的コンテンツとして実装する

2. **ヒーローのビジュアル改善**
   - 現状のグラデーション背景は維持しつつ、装飾絵文字の opacity を 0.15 から 0.25 程度に引き上げて存在感を増す
   - ヒーローのサブテキストを感情訴求型に変更: 「占い・診断・クイズ・ゲームなど、楽しいコンテンツで遊ぼう」→ 具体的な数字を含む表現（例: 「全19種のコンテンツがブラウザで無料で楽しめる」）

B. 「おすすめ」セクションの追加（優先度高）

3. **カテゴリセクション前に「はじめての方へ」セクションを追加**
   - NN/Group の推奨に従い、カテゴリセクションの前に配置
   - 初回訪問者が迷わず体験できる3-4コンテンツを選出して表示
   - 選出基準: 各カテゴリから代表的な1コンテンツ（占い: 今日のユーモア運勢、性格診断: アニマル性格診断、知識テスト: 漢字レベル診断、ゲーム: いろどり）
   - カード表示はメインのカードと同じだが、横並び（デスクトップ4列、モバイル2列）でコンパクトに表示
   - セクション見出し: 「まずはここから」または「ピックアップ」

C. カードのビジュアル強化（優先度中）

4. **カード背景にアクセントカラーのグラデーション追加**
   - 現状: 白背景 + 上部5pxのアクセントカラーボーダーのみ
   - 改善: カード上部エリア（アイコン周辺）にアクセントカラーの薄いグラデーション背景を適用
   - 実装: CSS で `background: linear-gradient(to bottom, color-mix(in srgb, var(--play-accent) 8%, transparent) 0%, transparent 40%)` のような薄いグラデーション
   - これによりカードごとに異なる色合いが生まれ、視覚的な差別化が図られる
   - 競合調査の「カラーブロックによる識別」パターンを採用

5. **カードホバー時のアクセントカラー強調**
   - 現状: ホバー時に shadow + translateY のみ
   - 改善: ホバー時にアクセントカラーのボーダーをより目立たせる（border-top の太さを 5px → 6px に、または border-color の彩度を上げる）
   - ホバー時にカード背景のアクセントカラーグラデーションも若干濃くする

D. モバイルUX最適化（優先度中）

6. **モバイル2カラムグリッドの最適化**
   - 現状: 640px以下で2カラム（gap: 0.75rem）+ 説明文非表示。これは既に改善済み
   - 追加改善: カードの最小幅を確認し、375px幅の端末でもカードが潰れないことを確認
   - タイトルが長い場合の折り返し表示を最適化（line-clamp: 2 を検討）

7. **カテゴリナビタブの sticky 化（スクロール追従）**
   - 現状: カテゴリナビタブはヒーロー直下に固定配置
   - 改善: `position: sticky; top: 0; z-index: 10;` を追加し、スクロール時にもカテゴリタブが画面上部に固定される。`top: 0` で良い理由: `src/components/common/Header.tsx` および `Header.module.css` を確認した結果、ヘッダーは `position: sticky/fixed` ではなく通常フローで配置されているため、ヘッダー高さ分のオフセットは不要
   - スティッキー時の背景色を設定（`background-color: var(--color-bg-primary)` + 下線ボーダー）
   - NN/Group の「スクロール量が多いページではスティッキーカテゴリバーが有効」という知見を適用
   - ただしモバイルの表示領域を狭めすぎないよう、高さはコンパクトに保つ（padding を縮小）

E. 回遊性の強化（優先度低）

8. **カテゴリセクション間の視覚的区切り強化**
   - 現状: `margin-bottom: 2.5rem` と `border-bottom` のみ
   - 改善: カテゴリごとに異なる背景色（非常に薄い色）を交互に適用して、セクション間の区切りを明確にする。ダークモードでも適切な背景色を適用する。具体的な色指定: ライトモードでは偶数セクションに `rgba(0, 0, 0, 0.02)`、奇数セクションに `transparent` を適用。ダークモードでは偶数セクションに `rgba(255, 255, 255, 0.03)`、奇数セクションに `transparent` を適用。CSS 変数 `--section-bg-alt` を定義し、`:nth-child(even)` セレクタで交互適用する

**制約と注意事項**:

- サムネイル画像生成は B-113 で別途検討のため、本タスクでは実施しない
- coding-rules.md に従い、静的コンテンツとビルド時生成を優先する。「今日のピックアップ」のローテーションロジックは Date ベースで決定論的に実装し、API コールは使わない
- ダークモードでの表示も必ず確認し、コントラストや視認性が維持されることを保証する
- 既存のテスト（`src/app/play/__tests__/page.test.tsx`）を更新し、新規追加した要素（おすすめセクション、ピックアップ等）のテストを追加する

**完了条件**:

- ヒーローバナーに「今日のピックアップ」コンテンツが表示されること
- カテゴリセクション前に「まずはここから」セクションが表示されること
- カードにアクセントカラーのグラデーション背景が適用されていること
- カテゴリナビタブがスクロール時に sticky で画面上部に固定されること
- ダークモードで全要素が適切に表示されること
- 既存テストが更新され、新要素のテストが追加されていること

---

#### タスク13: テスト修正と最終検証（タスク10を置き換え）

**何をするか**: タスク11-12の変更を含む全テストのパスを確認し、lint/format/build の成功、および残存URLの確認を行う。

**作業内容**:

1. **全テスト実行と修正**
   - `npm run test` で全テストを実行
   - タスク11-12で変更したファイルに関連するテストが全てパスすることを確認
   - 失敗するテストがあれば修正する
   - 特に確認すべきテスト:
     - `src/app/play/__tests__/page.test.tsx` — おすすめセクション、ピックアップ、カテゴリナビの sticky 等の新要素
     - `src/__tests__/bundle-budget.test.ts` — `/quiz`・`/fortune` カテゴリ削除後のテスト
     - `src/components/common/__tests__/Footer.test.tsx` — カテゴリアンカーリンクの追加
     - `src/components/common/__tests__/Header.test.tsx` — aria-label 日本語化
     - `src/play/__tests__/color-utils.test.ts` — CTA コントラスト比の検証

2. **lint/format/build の成功確認**
   - `npm run lint` 成功
   - `npm run format:check` 成功
   - `npm run build` 成功

3. **残存URL確認（grep）**
   - `@/quiz/` import パターンがプロジェクト内にゼロであること
   - `@/fortune/` import パターンがプロジェクト内にゼロであること
   - `/quiz/` URL パターンがリダイレクト設定・テスト期待値・ブログ記事の技術解説以外に残っていないこと
   - `/fortune/` URL パターンがリダイレクト設定以外に残っていないこと

**完了条件**:

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること
- 残存 URL/import パターンが想定通りであること（不正な残存がないこと）

---

### タスク11-13の依存関係

タスク11（レビュー指摘修正） → タスク12（/play UX改善） → タスク13（最終検証）

タスク11とタスク12は並行実施も可能だが、タスク11でフッター構造を変更するため、タスク12はその後に実施する方が安全。タスク13は全変更完了後に実施する。

### タスク12で参考にした情報

- `docs/research/2026-03-18-play-page-ux-competitor-analysis.md` — 競合サイト5社の調査結果
- `docs/research/2026-03-18-play-page-ux-best-practices.md` — カードUI・カテゴリ分け・モバイル表示のベストプラクティス
- `src/app/play/page.tsx` — 現在の/play一覧ページ実装
- `src/app/play/page.module.css` — 現在のスタイル
- `src/play/registry.ts` — 統合レジストリ（全19種のコンテンツ）
- `src/play/color-utils.ts` — WCAGコントラスト計算ユーティリティ
- `.claude/rules/coding-rules.md` — コーディング原則

## レビュー結果

### 作業計画のレビュー

- **タスク1-10計画 第1回**: 必須7件、推奨7件の指摘。修正後再レビューで承認。
- **タスク11-13計画 第1回**: 推奨4件の指摘（ローテーションアルゴリズム、layout.tsx変更明記、sticky top値、背景色指定）。修正後再レビューで承認。

### 各タスクのレビュー

- **タスク1**（1回）: 指摘なし。承認。
- **タスク2**（1回）: 指摘なし。承認。
- **タスク3**（1回）: 指摘なし。承認。
- **タスク4**（1回）: 指摘なし。承認。
- **タスク5**（1回）: 指摘なし。承認。
- **タスク6**（1回）: 必須1件（bundle-budgetテスト残存）。タスク11で修正。
- **タスク7**（1回）: 必須1件（CTAコントラスト比）、推奨2件（aria-label英語、フッターリンク不足）。タスク11で修正。
- **タスク8**（1回）: 指摘なし。承認。
- **タスク9**（1回）: 指摘なし。承認。
- **タスク11**（1回）: 推奨1件（JSDocコメント色コード古い）。即修正。承認。
- **タスク12**（2回）: 第1回必須1件（ISR未設定で日替わり不動作）、推奨3件（aria-label不足、コンテンツ数ハードコード、アクティブ状態なし）。修正後第2回で承認。
- **タスク13**（1回）: 独立検証で全項目一致。承認。

### UX調査・評価

- 競合サイト5社のスクリーンショット調査を実施（docs/research/2026-03-18-play-page-ux-competitor-analysis.md）
- ベストプラクティス調査を実施（docs/research/2026-03-18-play-page-ux-best-practices.md）
- 改善前評価: 4.3/10 → 改善後評価: 7.0〜7.5/10

## キャリーオーバー

- カテゴリナビのアクティブ状態表示（IntersectionObserverが必要なためクライアント処理となり、今回のスコープ外として見送り）
- サムネイル画像生成によるカードの更なるビジュアル強化（B-113で検討予定）
- カテゴリ名の感情的表現への変更（「占い」→「今日の運勢」等、ベストプラクティス調査の優先度C項目）

## 補足事項

- bundle-budget.test.tsは10件スキップ（ビルド成果物が必要なテストであり、今回の変更とは無関係の既存仕様）
- ブログ記事内のディレクトリパス（`src/app/quiz/` 等の技術解説）は過去の記述として正確なため変更していない
- 5色のaccentColorをWCAG AA準拠のためにより暗い色に調整した（kanji-kanaru, irodori, music-personality, character-fortune, science-thinking）
- /playページにISR（revalidate=86400）を導入し、日替わりピックアップの更新を実現

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
