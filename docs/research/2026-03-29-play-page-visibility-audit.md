# playページ 技術的可視性監査レポート

**作成日**: 2026-03-29
**目的**: 各ページ種別でユーザーが実際にどの要素を見るかを技術的に検証し、来訪者への価値を最大化するための改善設計の基礎資料とする。
**対象**: `/play` 配下の全ページ種別（クイズ・診断、占い、ゲーム、静的結果、一覧）

---

## 1. クイズ・診断ページ (`/play/[slug]`)

### ページ構造（DOM順序）

```
Breadcrumb
TrustLevelBadge
QuizContainer（Client Component — phase遷移でUIが切り替わる）
  ├ introフェーズ: アイコン、タイトル、説明、問数・クイズタイプ表示（「全{questionCount}問 / 知識クイズ」または「全{questionCount}問 / 診断」の形式）、「スタート」ボタン、relatedLinks（任意）
  ├ playingフェーズ: ProgressBar + QuestionCard
  └ resultフェーズ: ResultCard（アイコン、タイトル、スコア表示（knowledgeタイプのみ: {totalQuestions}問中{score}問正解）、説明、recommendation リンク（条件付き: result.recommendation および result.recommendationLink が両方設定されている場合のみ）、ShareButtons（Web Share API利用可能時は「結果をシェア」ボタン1つ、利用不可時はX・LINE・コピーの3ボタン）、「もう一度挑戦する」）
                    + ResultExtraLoader（以下6種のクイズのみ表示。各クイズで表示内容が異なる）
                      - music-personality: referrerTypeId がある場合は CompatibilitySection + InviteFriendButton、ない場合は InviteFriendButton のみ
                      - character-fortune: referrerTypeId がある場合は CompatibilitySection + InviteFriendButton、ない場合は InviteFriendButton のみ
                      - animal-personality: referrerTypeId がある場合は CompatibilitySection + InviteFriendButton、ない場合は InviteFriendButton のみ
                      - science-thinking: answers がある場合は RadarChart（5軸思考プロフィール） + スコアバー + InviteFriendButton、ない場合は InviteFriendButton のみ
                      - japanese-culture: referrerTypeId がある場合は CompatibilitySection + InviteFriendButton、ない場合は InviteFriendButton のみ
                      - character-personality: referrerTypeId がある場合は API フェッチで相性データを取得し CompatibilitySection + InviteFriendButton、ない場合は InviteFriendButton のみ
FaqSection（クイズごとに件数が異なる任意のFAQ配列 — faqフィールドはArray<{question, answer}>のオプショナルフィールド）
ShareButtons（ページレベル: X, LINE, はてなブックマーク, コピー）
RelatedQuizzes（同カテゴリ3件）
RecommendedContent（異カテゴリ3件）
```

**実装ファイル**: `src/app/play/[slug]/page.tsx`、`src/play/quiz/_components/QuizContainer.tsx`

### 技術的検証結果

#### QuizContainerとRelatedQuizzesの関係

`QuizContainer` はClient Componentだが、`RelatedQuizzes` と `RecommendedContent` は `QuizContainer` の**外側**（Server Component部分）に配置されている。

```tsx
// src/app/play/[slug]/page.tsx
<QuizContainer quiz={quiz} referrerTypeId={refParam} />
<FaqSection faq={quiz.meta.faq} />
<section className={styles.shareSection}>
  <ShareButtons ... />
</section>
{meta && <RelatedQuizzes currentSlug={slug} category={meta.category} />}
<RecommendedContent currentSlug={slug} />
```

この構造により、全フェーズ（intro / playing / result）で **DOMには常に存在**している。ただし、resultフェーズでユーザーが `RelatedQuizzes` / `RecommendedContent` に到達するには、以下の要素をすべてスクロールする必要がある。

#### resultフェーズでのスクロール障壁（上から順）

| 要素                                                                                                                  | 内容量の概算                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| ResultCard — アイコン・タイトル                                                                                       | 小                                                                                     |
| ResultCard — 説明テキスト                                                                                             | 200〜300字（1〜3画面分）                                                               |
| ResultCard — ShareButtons（Web Share API利用可能時は「結果をシェア」ボタン1つ、利用不可時はX・LINE・コピーの3ボタン） | 中                                                                                     |
| ResultCard — 「もう一度挑戦する」ボタン                                                                               | 小                                                                                     |
| ResultExtraLoader（6種のみ）                                                                                          | クイズにより異なる（InviteFriendButtonのみ〜RadarChart+スコアバー+InviteFriendButton） |
| FaqSection                                                                                                            | クイズごとに件数が異なる展開可能なアコーディオン                                       |
| ページレベルShareButtons                                                                                              | 中                                                                                     |
| **← RelatedQuizzes**                                                                                                  | ここに到達                                                                             |
| **← RecommendedContent**                                                                                              | ここに到達                                                                             |

モバイル（360px幅）のビューポートでは、結果テキストだけで1画面を超えるケースが多い。

**結論**: 技術的にはDOMに存在するが、プレイ完了者が `RelatedQuizzes` / `RecommendedContent` まで実際にスクロールする可能性は**極めて低い**。

---

## 2. 占いページ (`/play/daily`)

### ページ構造（DOM順序）

```
Breadcrumb
TrustLevelBadge
DailyFortuneCard（Client Component — useSyncExternalStore でクライアント側描画）
  ├ 日付表示
  ├ 運勢タイトル（例: エレベーター運）
  ├ StarRating（星評価）
  ├ 運勢テキスト（説明）
  ├ ラッキーアイテム + 今日のアクション（グリッド表示）
  ├ ShareButtons（クイズ用 src/play/quiz/_components/ShareButtons.tsx を使用。contentType="fortune" として呼び出し: Web Share API利用可能時は「結果をシェア」ボタン1つ、利用不可時はX・LINE・コピーの3ボタン）
  └ 「明日も来てね! 毎日運勢が変わります」リピーター促進テキスト
RecommendedContent（異カテゴリ3件）
```

**実装ファイル**: `src/app/play/daily/page.tsx`、`src/play/fortune/_components/DailyFortuneCard.tsx`

### 技術的検証結果

- `FaqSection` がない
- `RelatedQuizzes` がない（fortuneカテゴリに他コンテンツがないため）
- 運勢テキスト + ShareButtons の後に直接 `RecommendedContent` が配置される

#### RecommendedContentまでのスクロール障壁

| 要素                     | 内容量の概算                                                   |
| ------------------------ | -------------------------------------------------------------- |
| DailyFortuneCard全体     | 運勢テキスト（50〜100字程度）+ ラッキーアイテム + ShareButtons |
| **← RecommendedContent** | ここに到達                                                     |

**結論**: 全ページ種別の中で最も回遊導線が機能しやすい構造。スクロール障壁が最小限であり、RecommendedContentへの到達可能性が**高い**。

---

## 3. ゲームページ (`/play/kanji-kanaru` 等)

### ページ構造（DOM順序）

```
Breadcrumb
header:
  TrustLevelBadge
  valueProposition（任意）
usageExample セクション（任意）
section[aria-label="Game"]:
  GameContainer（Client Component — ゲーム本体）
    └ 完了時: ResultModal（モーダルダイアログ、GameDialogベース）
              ├ 正解/不正解表示 + 漢字情報（kanji-kanaruの場合）
              ├ GameShareButtons
              ├ CountdownTimer（翌日のリセットまでのカウントダウン）
              ├ NextGameBanner（他ゲームへのリンク: 同カテゴリのgameのみ）
              └ 「統計を見る」フッターボタン
attribution フッター（任意）
FaqSection
ShareButtons（ページレベル: X, LINE, はてなブックマーク, コピー）
RelatedGames（関連ゲーム2〜3件）
RecommendedContent（異カテゴリ3件）
RelatedBlogPosts（関連ブログ記事）
```

**実装ファイル**: `src/play/games/_components/GameLayout.tsx`、各ゲームの `ResultModal.tsx`

### 技術的検証結果

#### モーダルによる完全遮蔽

ゲーム完了時に `ResultModal`（`GameDialog` ベースのモーダルダイアログ）がページ全体を覆う。この状態では、ページ本体の `RelatedGames`・`RecommendedContent` は **視覚的に完全に遮蔽**される。

モーダル内に存在する導線は `NextGameBanner`（同カテゴリの **gameカテゴリ**のみを対象）。**他カテゴリ（personality / knowledge / fortune）への導線はモーダル内に一切ない**。

#### モーダルを閉じた後のスクロール障壁

| 要素                          | 内容量の概算                                   |
| ----------------------------- | ---------------------------------------------- |
| GameContainer本体（ゲームUI） | ゲームボード全体（高さはゲームによって異なる） |
| attribution フッター（任意）  | 小〜中                                         |
| FaqSection                    | 複数問のアコーディオン                         |
| ページレベルShareButtons      | 中                                             |
| **← RelatedGames**            | ここに到達                                     |
| **← RecommendedContent**      | ここに到達                                     |
| RelatedBlogPosts              | ここに到達                                     |

**結論**: ゲーム完了者にとって、他カテゴリへの回遊導線（`RecommendedContent`）は事実上**到達する可能性が極めて低い**。モーダルは閉じることができるが、閉じた後も膨大なスクロールが必要であり、そこまで到達するユーザーは極めて稀と考えられる。

---

## 4. 静的結果ページ (`/play/[slug]/result/[resultId]`)

### ページ構造（DOM順序）

```
Breadcrumb（ホーム > 遊ぶ > [クイズ名] > 結果）
div.card:
  アイコン
  タイトル（h1）
  クイズ名（「〇〇の結果」）
  説明テキスト
  「あなたも挑戦してみる?」CTAボタン（/play/[slug]へのリンク）
  ShareButtons（クイズ用 src/play/quiz/_components/ShareButtons.tsx を使用。Web Share API利用可能時は「結果をシェア」ボタン1つ、利用不可時はX・LINE・コピーの3ボタン）
  CompatibilityDisplay（条件付き: スラグが music-personality または character-personality であり、かつ ?with= パラメータが存在し、with値と自身の resultId が両方とも当該クイズの有効なタイプIDである場合のみ）
RelatedQuizzes（同カテゴリ3件）
RecommendedContent（異カテゴリ3件）
```

**実装ファイル**: `src/app/play/[slug]/result/[resultId]/page.tsx`

### 技術的検証結果

- `FaqSection` がないため、ページ全体がコンパクト
- CTAボタン「あなたも挑戦してみる?」が結果の直後に配置されており、SNS経由来訪者への主要導線として機能
- `CompatibilityDisplay` はスラグが `music-personality` または `character-personality` に限定され、`?with=` パラメータが存在し、かつ with値と自身の resultId が両方とも有効なタイプIDである場合のみ表示（`extractWithParam` 関数にてバリデーション済み）。CompatibilityDisplay は `div.card` 内部に配置されており、ShareButtons の直後に表示される
- ShareButtonsはクイズ用（`src/play/quiz/_components/ShareButtons.tsx`）を使用。ページレベルのShareButtons（`src/components/common/ShareButtons.tsx`）は配置なし

#### RelatedQuizzesまでのスクロール障壁

| 要素                                                           | 内容量の概算         |
| -------------------------------------------------------------- | -------------------- |
| 結果カード（アイコン+タイトル+クイズ名+説明+CTA+ShareButtons） | 中                   |
| CompatibilityDisplay（条件付き: card div内に含まれる）         | 中（表示される場合） |
| **← RelatedQuizzes**                                           | ここに到達           |
| **← RecommendedContent**                                       | ここに到達           |

**結論**: SNS来訪者にとっては比較的良い構造。`RelatedQuizzes` への到達可能性は**中程度**。ただし、「このクイズが何なのか」のコンテキスト（intro画面の説明）が欠如しており、初訪問者にとって内容理解が弱い。

---

## 5. `/play` 一覧ページ

### ページ構造（DOM順序）

```
Breadcrumb
heroBanner セクション:
  装飾絵文字（aria-hidden）
  h1「遊ぶ」
  全コンテンツ数表示
  pickupArea（今日のピックアップ: JSTベース日替わり1件）
CategoryNav（スティッキー: ページスクロール追従でアクティブタブを IntersectionObserver で制御）
featuredSection（「イチオシ」: おすすめ理由バッジ付き3件）
カテゴリ別セクション（id属性付き、CategoryNavのアンカーリンク先）:
  fortune（今日の運勢）
  personality（あなたはどのタイプ？）
  knowledge（どこまで知ってる？）
  game（毎日のパズル）
```

**実装ファイル**: `src/app/play/page.tsx`、`src/app/play/_components/CategoryNav.tsx`

### 技術的検証結果

- 各コンテンツカードには: アイコン、タイトル（shortTitle優先）、shortDescription、問数（`quizQuestionCountBySlug` に値があるコンテンツのみ — クイズ・診断が対象、ゲームは表示なし）、CTAテキストが表示される
- 問数表示はイチオシセクション（featuredSection）とカテゴリ別セクションの両方で同じ条件（`quizQuestionCountBySlug.get(slug) !== undefined`）により制御される
- カテゴリ別セクションに交互背景色を適用し視覚的メリハリを確保
- `DAILY_UPDATE_SLUGS` に含まれるコンテンツには「毎日更新」バッジが表示される
- イチオシセクションにはカテゴリを超えた `recommendReason` バッジが表示される

**結論**: カテゴリ整理と導線設計は機能しているが、**ゲームコンテンツのカードに所要時間情報が一切ない**ため、初訪問者がプレイコストを判断できない。探索的閲覧に適したページ構造だが、カードの情報量に改善余地がある。

---

## 総合評価: 回遊導線の到達可能性マトリクス

| ページ種別                 | RelatedQuizzes到達性       | RecommendedContent到達性   | 主な障壁                                                               |
| -------------------------- | -------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| クイズ・診断結果（inline） | 極めて低                   | 極めて低                   | ResultCard + ResultExtraLoader + FaqSection + ShareButtonsの積み重ね   |
| 占いページ                 | N/A（fortuneカテゴリのみ） | 高                         | DailyFortuneCard + ShareButtonsのみ                                    |
| ゲーム結果（modal）        | 到達する可能性が極めて低い | 到達する可能性が極めて低い | モーダルが完全遮蔽、閉じた後もゲームUI + FaqSection + ShareButtonsの壁 |
| 静的結果ページ             | 中                         | 中〜低                     | 結果カード + ShareButtons後に到達可能                                  |
| /play一覧                  | N/A                        | N/A                        | 探索導線として別の仕組み（CategoryNav, pickupArea）                    |

---

## 来訪者価値の観点からの改善提案

> **現状認識**: GAデータによればplay系コンテンツへの流入は直近7日間で3PV（全体96PVの約3%）。この規模では回遊導線をいかに改善しても絶対的な効果は限定的（回遊率2倍でも+3PV程度）。**来訪者価値を最大化する上での最優先課題は「play系への流入増加」であり、回遊導線の改善はその後に顕在化する施策として位置づける**。ジャーニーマップ分析（`2026-03-29-play-customer-journey-map.md`）と同じ結論である。

### 最優先: 非play系ページ（ブログ・辞典）からの導線強化

現状93PVが非play系ページに流入しているが、そこからplay系への導線がほぼ存在しない。記事テーマと関連したplay系コンテンツへの文脈的推薦ブロックをブログ・辞典ページに追加することが、来訪者価値（「こんなコンテンツもある」という発見）と即効性の両面で最も投資対効果が高い。

ジャーニーマップとの整合: 「最高優先度（即効性最高）」として分類済み。

### 最優先（並行インフラ整備）: シェア体験のUI最適化

ターゲットユーザーの特性（「友達に見せたくなる」「SNSでシェアしやすい」）から、SNSバイラルはplay系コンテンツの最も自然な成長ドライバーである。ただし、**現状（週3PV）ではシェアする母数自体がほぼ存在しないため、シェア体験の改善は流入増加後に効果が顕在化するインフラ整備として位置づける**。

具体的には ShareButtons をプレイ完了者のファーストビューに確実に配置し、シェアテキストをターゲットユーザーが「拡散したくなる」内容に最適化する。なお、SEOメタデータ（OGP title / description / Twitter Card / JSON-LD / canonical URL）は `src/play/seo.ts` の `generatePlayMetadata` および `generatePlayJsonLd` により既に実装済みであるため、新規実装は不要。改善が必要であれば各コンテンツの `description` / `keywords` フィールドの内容品質を見直す。

ジャーニーマップとの整合: 「最高優先度（並行インフラ整備）」として分類済み。

### 優先度中（流入増加後に効果が顕在化）: ゲーム完了時モーダル内への他カテゴリ導線追加

現状、ゲーム完了者が他カテゴリコンテンツを発見する唯一のタイミングはResultModal表示中。しかしモーダル内には同カテゴリゲーム（`NextGameBanner`）しか存在しない。**モーダル内に異カテゴリへの導線を追加することが回遊導線改善の中で最も効果が高い**。

来訪者への価値: ゲームを楽しんだユーザーが次のコンテンツ（診断・占い等）を自然に発見できる体験の提供。

ジャーニーマップとの整合: 「中（流入増加後）」として分類済み。

### 優先度中（流入増加後に効果が顕在化）: クイズ結果フェーズでのRelatedQuizzes直出し

クイズ結果表示後、ユーザーはFaqSectionを超えてRelatedQuizzesに到達する必要がある。RelatedQuizzesをResultCard直下（FAQより前）に移動することで、resultフェーズ切り替え後に即座に関連コンテンツが目に入る設計にする。

来訪者への価値: 結果に満足したユーザーが次のクイズへ自然に誘導される体験の提供。スクロール障壁の解消により「もっと遊ぶ」という意欲が冷める前にコンテンツを提示できる。

ジャーニーマップとの整合: 「中（流入増加後）」として分類済み。

### 優先度中: 静的結果ページの「このクイズとは」情報補完

SNS経由で静的結果ページに来たユーザーは、クイズの概要（問数・タイプ・説明）を確認できずCTAボタンだけが案内される。CTAボタン周辺にクイズのintro情報を少量追加することで、「これは何分で終わる？」「どんな内容？」という疑問を解消し、プレイ参入障壁を下げられる。

来訪者への価値: SNS経由来訪者が「自分もやってみたい」と判断するために必要な情報を的確に提供する。

### 優先度低: /play一覧ページのゲームカード情報追加

ゲームカードに「毎日更新」バッジはあるが、「プレイ時間の目安」や「難易度」情報がない。これにより消極的ユーザーの参入障壁が生まれている。ただし、一覧ページは既に十分な探索性があるため優先度は低い。

ジャーニーマップとの整合: 「低」として分類済み。
