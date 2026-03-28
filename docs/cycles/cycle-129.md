---
id: 129
description: "B-091 テーマ間の横断的なおすすめ機能の追加"
started_at: "2026-03-28T16:47:34+0900"
completed_at: "2026-03-28T18:37:16+0900"
---

# サイクル-129

このサイクルでは、/play配下の各コンテンツ（占い・診断・クイズ・ゲーム）のページに「こちらもおすすめ」の導線を追加する（B-091）。現在、個別コンテンツのPVが低く（fortune/daily 10PV、games/kanji-kanaru 9PV等）、コンテンツ間の回遊がほとんど発生していない。カテゴリを横断したおすすめを表示することで、1セッションあたりのPVを増加させ、メインターゲット（占い・診断を楽しみたい人）の体験を向上させる。

## 実施する作業

- [x] B-091-1: レコメンドロジック関数の実装（`src/play/recommendation.ts`）とテスト（`src/play/__tests__/recommendation.test.ts`）
- [x] B-091-2: RecommendedContentコンポーネントの実装（`src/play/_components/RecommendedContent.tsx` + CSS Module）とテスト
- [x] B-091-3: クイズ・診断ページへの統合（`src/app/play/[slug]/page.tsx`）
- [x] B-091-4: 占いページへの統合（`src/app/play/daily/page.tsx`）
- [x] B-091-5: ゲームページへの統合（`src/play/games/_components/GameLayout.tsx`）
- [x] B-091-6: 静的結果ページへの統合（`src/app/play/[slug]/result/[resultId]/page.tsx`）
- [x] B-091-7: lint/format/test/buildの成功確認
- [x] B-091-8: Playwrightによるビジュアル確認（全4種の結果画面 + 静的結果ページ）
- [x] B-091-9: レビューと修正

## 作業計画

### 目的

現在の/play配下19種のコンテンツは、カテゴリ内の回遊導線（RelatedQuizzes、RelatedGames、NextGameBanner）は存在するが、カテゴリを横断した導線がほぼない。特に占いページには出口導線が一切なく、静的結果ページ（SNSシェアからの流入先）にも関連コンテンツへの導線がない。

カテゴリ横断のおすすめ機能を追加することで、以下の効果を狙う:

- 占いページの離脱率低減（現在、出口導線ゼロ）
- SNS経由で静的結果ページに着地したユーザーの回遊促進
- ゲーム完了後のユーザーをクイズ・診断へ誘導
- PV/セッションの向上（ベストプラクティスでは平均20%向上の事例あり）

### 作業内容

#### タスク1: レコメンドロジック関数の実装

**新規ファイル: `src/play/recommendation.ts`**

レコメンドロジックをコンポーネントから分離し、純粋関数として実装する。テスタビリティと再利用性を確保するため。

ロジック仕様:

- 入力: 現在のコンテンツのslug
- 出力: PlayContentMeta の配列（3件）
- アルゴリズム:
  1. 現在のコンテンツのカテゴリを特定する（playContentBySlugから取得）
  2. 自分のカテゴリ以外の全カテゴリ（fortune, personality, knowledge, game の4つから自分を除いた3つ）から各1件ずつ選出
  3. 各カテゴリからの選出ルール: 現在のコンテンツのkeywordsとの重複が最も多いコンテンツを優先。keywordsの重複がない場合や同数の場合はレジストリの定義順で先頭のものを選出
  4. 占いカテゴリ（fortune）は1種（daily）しかないので、fortuneカテゴリからは常にdailyが選出される
- この関数はビルド時に評価されるため、ランダム要素は入れない。同じslugに対して常に同じ結果を返す決定的な関数とする
- 存在しないslugが渡された場合は空配列を返す

**新規ファイル: `src/play/__tests__/recommendation.test.ts`**

テストケース:

- personalityカテゴリのコンテンツに対して、fortune/knowledge/gameから各1件返ること
- knowledgeカテゴリのコンテンツに対して、fortune/personality/gameから各1件返ること
- gameカテゴリのコンテンツに対して、fortune/personality/knowledgeから各1件返ること
- fortuneカテゴリのコンテンツ（daily）に対して、personality/knowledge/gameから各1件返ること
- 自カテゴリのコンテンツが結果に含まれないこと
- 自分自身が結果に含まれないこと
- 返却件数が常に3件であること
- keywords重複による優先選出が機能すること（keywordsが共通するコンテンツが優先されること）
- keywordsの重複がゼロの場合にレジストリ定義順で選出されること
- 存在しないslugに対して空配列を返すこと

#### タスク2: RecommendedContentコンポーネントの実装

**新規ファイル: `src/play/_components/RecommendedContent.tsx`**

Server Componentとして実装。おすすめはビルド時に決定可能なため、クライアントサイドのJavaScriptは不要。

コンポーネント仕様:

- Props: `{ currentSlug: string }`
- レコメンドロジック関数を呼び出し、3件のカードを縦積みで表示
- 各カードにはアイコン、タイトル（shortTitle優先）、shortDescription、カテゴリバッジを表示
- カテゴリバッジの表示名は「運勢」「診断」「クイズ」「パズル」（seo.tsのresolveDisplayCategoryを使用する。resolveDisplayCategoryは現在exportされていないため、seo.tsからexportする変更を行う）
- セクション見出し: 「こちらもおすすめ」
- `<nav>` 要素で `aria-label="おすすめコンテンツ"` を指定しアクセシビリティ確保
- Linkコンポーネントでpaths.tsのgetContentPath経由のURLを生成（fortuneカテゴリは/play/daily、それ以外は/play/{slug}に正しくルーティングされる）
- レコメンドが0件の場合（通常ありえないが防御的に）はnullを返す

**新規ファイル: `src/play/_components/RecommendedContent.module.css`**

UIデザイン方針:

- RelatedQuizzes.module.cssと同じflex-wrap方式を踏襲し、レイアウトを統一する（display: flex、flex-wrap: wrap、gap: 0.75rem）
- カード幅: flex: 1 1 0、min-width: 200px、max-width: calc(50% - 0.375rem)。モバイルではmin-widthによりカードが1列に折り返され、デスクトップでは2列表示（3件目は次の行に単独配置）
- 既存のRelatedQuizzes.module.cssと同様のカードスタイルを踏襲（一貫性）
- セパレータ（border-top）で上部コンテンツと視覚的に区切る（margin-top: 2rem、padding-top: 1.5rem、border-top: 1px solid var(--color-border)）
- カテゴリバッジは小さいタグスタイル（font-size: 0.7rem、背景色つき、border-radius: 0.25rem）

**新規ファイル: `src/play/_components/__tests__/RecommendedContent.test.tsx`**

テストケース:

- 3件のカードがレンダリングされること
- 各カードにタイトル、説明、カテゴリバッジが含まれること
- リンク先URLがgetContentPathの結果と一致すること
- nav要素にaria-label="おすすめコンテンツ"が設定されていること
- セクション見出し「こちらもおすすめ」が表示されていること

#### タスク3: クイズ・診断ページへの統合

**変更ファイル: `src/app/play/[slug]/page.tsx`**

- RelatedQuizzesの下にRecommendedContentを追加
- RelatedQuizzesは同カテゴリ内の回遊、RecommendedContentはカテゴリ横断の回遊と、役割を明確に分離
- import文の追加とJSXの末尾（RelatedQuizzes直下）にRecommendedContentコンポーネントを配置
- propsとして `currentSlug={slug}` を渡す

#### タスク4: 占いページへの統合

**変更ファイル: `src/app/play/daily/page.tsx`**

- DailyFortuneCardの後（兄弟要素として）にRecommendedContentを追加
- 占いは現在出口導線がゼロのため、この追加の効果が最も大きい
- import文の追加とJSXのDailyFortuneCardの後にRecommendedContentコンポーネントを兄弟要素として配置
- propsとして `currentSlug="daily"` を渡す

#### タスク5: ゲームページへの統合

**変更ファイル: `src/play/games/_components/GameLayout.tsx`**

- RelatedGames（同カテゴリ内の関連ゲーム）の下、RelatedBlogPostsの前にRecommendedContentを追加
- ゲームのResultModal内のNextGameBannerには手を加えない（モーダル内の情報量を増やすとUXが悪化するため）
- import文の追加とJSXのRelatedGames直下にRecommendedContentコンポーネントを配置
- propsとして `currentSlug={meta.slug}` を渡す（GameLayoutのpropsにはmeta: GameMetaがある）
- GameLayoutはServer Componentであるため、RecommendedContent（Server Component）を問題なく配置できる
- 注記: GameMeta.slugはallPlayContents経由でplayContentBySlugに登録済みのため、RecommendedContent内部のplayContentBySlug.get(slug)は正しく動作する

#### タスク6: 静的結果ページへの統合

**変更ファイル: `src/app/play/[slug]/result/[resultId]/page.tsx`**

- 現在の結果カード（card div）の下にRecommendedContentを追加
- SNS経由で着地したユーザーへの回遊導線として機能する
- import文の追加とJSX内のcard divの直後にRecommendedContentコンポーネントを配置
- propsとして `currentSlug={slug}` を渡す（slugはparamsから取得済み）

#### タスク7: lint/format/test/build確認

`npm run lint && npm run format:check && npm run test && npm run build` を実行し、全てのチェックが通ることを確認する。

#### タスク8: Playwrightビジュアル確認

以下のページでおすすめセクションの表示を確認する（モバイル360pxとデスクトップ1280px）:

- クイズページ（例: /play/animal-personality）の結果表示後
- 占いページ（/play/daily）
- ゲームページ（例: /play/kanji-kanaru）
- 静的結果ページ（例: /play/animal-personality/result/ の任意のresultId）

確認観点:

- おすすめカードが3件表示されていること
- 既存のRelatedQuizzes/RelatedGames/NextGameBannerが維持されていること
- カードのレイアウトが崩れていないこと（モバイル360pxで1列、デスクトップ1280pxで2列表示）
- カテゴリバッジが正しく表示されていること
- セパレータで上部コンテンツと視覚的に区切られていること

### 変更ファイル一覧

| ファイル                                                     | 種別 | 内容                                           |
| ------------------------------------------------------------ | ---- | ---------------------------------------------- |
| `src/play/recommendation.ts`                                 | 新規 | レコメンドロジック関数                         |
| `src/play/__tests__/recommendation.test.ts`                  | 新規 | レコメンドロジックのテスト                     |
| `src/play/seo.ts`                                            | 変更 | resolveDisplayCategoryをexportする             |
| `src/play/_components/RecommendedContent.tsx`                | 新規 | おすすめ表示コンポーネント（Server Component） |
| `src/play/_components/RecommendedContent.module.css`         | 新規 | おすすめ表示のスタイル                         |
| `src/play/_components/__tests__/RecommendedContent.test.tsx` | 新規 | おすすめ表示コンポーネントのテスト             |
| `src/app/play/[slug]/page.tsx`                               | 変更 | クイズ・診断ページにRecommendedContent追加     |
| `src/app/play/daily/page.tsx`                                | 変更 | 占いページにRecommendedContent追加             |
| `src/play/games/_components/GameLayout.tsx`                  | 変更 | ゲームページにRecommendedContent追加           |
| `src/app/play/[slug]/result/[resultId]/page.tsx`             | 変更 | 静的結果ページにRecommendedContent追加         |

### 検討した他の選択肢と判断理由

#### 選択肢A: ゲームResultModal内にもおすすめを追加する

- 案: NextGameBannerの下にカテゴリ横断のおすすめリンクも表示
- 却下理由: ResultModalはGameDialogコンポーネント内に配置されており、モーダル内のコンテンツ量が既に多い（結果表示、シェアボタン、カウントダウン、NextGameBanner）。さらにおすすめを追加するとスクロールが深くなり、モバイルでのUXが悪化する。GameLayoutの末尾（モーダル外）に配置することで、モーダルを閉じた後にも回遊導線が見える設計にする。

#### 選択肢B: ランダム要素を入れたレコメンドロジック

- 案: 毎回異なるおすすめを表示することで新鮮さを保つ
- 却下理由: Server Componentでビルド時に決定する設計のため、ランダム要素を入れるとビルドごとに結果が変わり、キャッシュの効率が下がる。また、小規模サイト（19種）ではランダムの恩恵が小さい。決定的な関数の方がテスタビリティも高い。

#### 選択肢C: タグベースのレコメンド（新フィールド追加）

- 案: PlayContentMetaにtagsフィールドを新設し、タグの一致度でおすすめを算出
- 却下理由: 既存のkeywordsフィールドで十分な精度が得られる。19種という規模ではタグとキーワードの区別に実質的な意味がなく、データモデルの変更は不要な複雑さを招く。

#### 選択肢D: カルーセルUIでおすすめを表示

- 案: 横スクロールのカルーセルで5件以上のおすすめを表示
- 却下理由: ベストプラクティス調査でカルーセルはクリック率が低下するとの知見あり。モバイルファーストで縦積みカード3件の方が認知負荷が低く、クリック率が高い。

#### 選択肢E: 既存のRelatedQuizzesをカテゴリ横断に拡張する

- 案: RelatedQuizzesコンポーネントを改修して、同カテゴリ+他カテゴリの混合表示にする
- 却下理由: RelatedQuizzesは「同カテゴリ内の関連コンテンツ」という明確な役割を持っており、これを壊すと責務が曖昧になる。新コンポーネントとして分離することで、それぞれの役割が明確に保たれる。

### 計画にあたって参考にした情報

- `src/play/registry.ts` -- allPlayContents、playContentBySlug、getPlayContentsByCategory等のレジストリ関数。レコメンドロジックの基盤
- `src/play/types.ts` -- PlayContentMetaの型定義。keywordsフィールドの存在確認
- `src/play/seo.ts` -- resolveDisplayCategory関数。カテゴリバッジの表示名解決に使用（exportする変更が必要）
- `src/play/paths.ts` -- getContentPath関数。コンテンツ種別に応じたリンク先パスの生成に使用
- `src/play/quiz/_components/RelatedQuizzes.tsx` / `RelatedQuizzes.module.css` -- 既存の同カテゴリ回遊コンポーネント。UIスタイルの踏襲元
- `src/play/games/_components/RelatedGames.tsx` -- 既存のゲーム間回遊コンポーネント
- `src/play/games/shared/_components/NextGameBanner.tsx` -- ゲーム結果モーダル内の次ゲーム導線（モーダル内への追加を却下する判断材料）
- `src/play/games/_components/GameLayout.tsx` -- ゲームページ共通レイアウト。おすすめ配置箇所の決定
- `src/app/play/[slug]/page.tsx` -- クイズ・診断ページ。RelatedQuizzesの下への配置決定
- `src/app/play/daily/page.tsx` -- 占いページ。現在出口導線ゼロであることの確認
- `src/app/play/[slug]/result/[resultId]/page.tsx` -- 静的結果ページ。SNS流入先への回遊導線追加
- `src/play/fortune/_components/DailyFortuneCard.tsx` -- 占いカードのClient Component構造確認（RecommendedContentはその外側に配置）
- `src/play/games/kanji-kanaru/_components/ResultModal.tsx` -- ゲーム結果モーダルの構造確認
- ベストプラクティス調査結果 -- シェアボタン直下3-4件カード縦積み、カルーセル忌避、PV/セッション20%向上事例

## レビュー結果

### 計画レビュー

- R1: 6件の指摘（getContentPath使用、resolveDisplayCategoryのexport方針、GameMeta.slug依存関係注記、keywordsゼロ重複テスト追加、占いページ配置表現明確化、CSSレイアウト方針統一）→ 全件修正
- R2: 指摘事項なし → 承認

### 実装レビュー

- タスク1（レコメンドロジック）: R1で承認。計画の10種テストケースを全カバー、18テスト全通過
- タスク2（RecommendedContentコンポーネント）: R1で1件指摘（.badge に width: fit-content 不足）→ 修正
- タスク3-6（全ページ統合）+ タスク2修正: 全体レビューR1で承認。全4種ページへの配置、getContentPath使用、アクセシビリティ、スタイル一貫性すべて問題なし
- lint修正: recommendation.test.tsの未使用変数（fortuneContents）削除、page.test.tsxの`module`変数名を`imported`に修正（Next.js lint rule）

### 来訪者価値レビュー

- R1: 5件の指摘（カード視覚訴求力不足、モバイルレイアウト、結果ページ配置、関連クイズとの重複感、バッジデザイン）→ 見出しテキスト変更、カテゴリバッジ色分け追加、ホバーエフェクト追加で対応
- R2（owner指示によるカスタマージャーニー分析）: 情報ヒエラルキーの逆転を発見。RecommendedContent（補助的導線）がRelatedQuizzes/RelatedGames（主要導線）より視覚的に目立つ問題 → カテゴリバッジ色分け廃止、ホバーエフェクトRelated系と統一、アイコンサイズRelated系と統一で対応

### Playwrightビジュアル確認

- 占いページ（/play/daily）モバイル360px: おすすめ3件が縦1列で正しく表示、セパレータで区切り、カテゴリバッジ（ニュートラルカラー）表示OK
- 占いページ（/play/daily）デスクトップ1280px: 2列レイアウト、3件目が次の行に配置、RelatedQuizzesと一貫したスタイル
- ゲームページ（/play/kanji-kanaru）モバイル: RelatedGames → おすすめ → RelatedBlogPosts の正しい順序で表示
- クイズページ（/play/animal-personality）モバイル: RelatedQuizzes → おすすめ の正しい順序で表示。Related系との視覚的ヒエラルキーが正しく保たれている
- 静的結果ページ（/play/animal-personality/result/nihon-zaru）モバイル: 結果カード直下におすすめ3件表示

## キャリーオーバー

- なし

## 補足事項

### サイクル選定根拠

GA データ（直近28日間）:

- 合計: ~765 PV、235セッション
- Direct: 129セッション / 344 PV / エンゲージメント率46%
- Organic Search: 74セッション / 259 PV / エンゲージメント率59%
- Organic Social: 20セッション / 121 PV / エンゲージメント率100%
- Referral: 9セッション / 40 PV / エンゲージメント率89%

Play系個別コンテンツのPV: /play 16、/fortune/daily 10、/games/kanji-kanaru 9。コンテンツ間の回遊導線がなく、1つのコンテンツを遊んだユーザーが離脱している可能性が高い。おすすめ機能でカテゴリ横断の発見を促し、PV/セッションの向上を目指す。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
