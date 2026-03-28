# play系コンテンツ改善設計書

**作成日**: 2026-03-29
**目的**: play系コンテンツの来訪者に最高の価値を提供するための改善設計

---

## 現状認識

### データが示す事実

- 直近7日間: サイト全体PV 96、play系は3PVのみ（music-personalityのみ）
- 非play系ページ（ブログ・辞典・ツール等）に93PVが流入している
- Organic Search 60%, Direct 35%
- Desktop 64%, Mobile 34%

### 構造的な問題

1. **流入の壁**: 93PVの非play系来訪者からplay系への導線がゼロ。ブログ記事ページ（`src/app/blog/[slug]/page.tsx`）にも辞典詳細ページ（`DictionaryDetailLayout.tsx`）にも、play系へのリンクが一切存在しない
2. **回遊の壁**: プレイ完了後、次のコンテンツへの導線がFAQ・ShareButtonsの下に埋もれており事実上到達不可能（技術検証で確認済み）
3. **ゲーム完了時の壁**: ResultModalが画面全体を覆い、モーダル内にはNextGameBanner（全ゲームの未プレイ/クリア済状況を表示）しかない。他カテゴリ（診断・占い）への経路がゼロ

---

## 設計方針

**3つの改善を、来訪者への価値が最も高い順に実施する。**

| 順序 | 施策                                | 来訪者への価値                                   | 期待効果                                     |
| ---- | ----------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| 1    | 非play系ページからの文脈的導線      | 「こんな面白いコンテンツもあったのか」という発見 | 93PVの来訪者をplay系に誘導（最大の母数活用） |
| 2    | プレイ完了後の回遊導線再設計        | 「次も面白そう」の好奇心に即座に応える           | 完了者の離脱を防ぎ連鎖プレイを実現           |
| 3    | ゲームResultModal内の他カテゴリ導線 | ゲームユーザーに診断・占いの存在を伝える         | ゲーム完了者の回遊経路を新設                 |

---

## 施策1: 非play系ページからの文脈的導線

### 来訪者にとっての価値

ブログや辞典を読みに来た人が、記事テーマと関連する診断・クイズ・ゲームの存在を自然に知ることができる。「押しつけがましい広告」ではなく「記事の延長として楽しめるコンテンツ」として体験される設計にする。

### 1-A: ブログ記事ページへの導線追加

**配置位置**: 記事本文の`section.shareSection`（h2「この記事をシェア」+ ShareButtons）とRelatedArticlesの間

現在のブログ記事ページ構造（`src/app/blog/[slug]/page.tsx`）:

```
div.container
  JSON-LD script
  Breadcrumb
  article
    header（カテゴリ、TrustLevelBadge、日付、タイトル、TagList）
    SeriesNav（任意）
    details.mobileToc（モバイル向けインラインTOC、デスクトップではCSS非表示）
    div.layout
      aside.sidebar（デスクトップ向けTOC）
      div.content（記事本文HTML）
    MermaidRenderer
    section.shareSection                <-- h2「この記事をシェア」+ ShareButtons
    RelatedArticles
  nav.postNav（前後記事リンク）
```

改善後:

```
div.container
  JSON-LD script
  Breadcrumb
  article
    header
    SeriesNav（任意）
    details.mobileToc
    div.layout
      aside.sidebar（デスクトップ向けTOC）
      div.content
    MermaidRenderer
    section.shareSection
    [NEW] PlayRecommendationBanner     <-- 追加
    RelatedArticles
  nav.postNav
```

**PlayRecommendationBannerの配置がブログと辞典で異なる理由**: ブログ記事ページではShareButtonsの後・RelatedArticlesの前に配置する。来訪者が記事を読み終え、シェアを検討した後の自然な流れとして「関連する遊べるコンテンツ」を提示する位置である。一方、辞典詳細ページ（1-B参照）ではFaqSectionの後・ShareButtonsの前に配置する。辞典ではFAQが本文の延長として機能しており、FAQまで読んだ来訪者が次に「関連する遊べるコンテンツ」に誘導される方が自然であるためである。辞典のShareButtonsはページ最下部に配置されており、導線としての優先度はplay系推薦より低い。

**コンポーネント設計: `PlayRecommendationBanner`**

新規Server Componentとして作成する。

```
+--------------------------------------------------+
|  関連コンテンツで遊ぶ                                |
|                                                    |
|  +----------------------------------------------+ |
|  | [icon] タイトル                                | |
|  | 短い説明文                                      | |
|  |                        [カテゴリバッジ] [CTA] | |
|  +----------------------------------------------+ |
|  +----------------------------------------------+ |
|  | [icon] タイトル                                | |
|  | 短い説明文                                      | |
|  |                        [カテゴリバッジ] [CTA] | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
```

- 見出し: 「関連コンテンツで遊ぶ」（ブログ記事の文脈では「遊んでみよう」よりも、記事との関連性を明示する見出しの方が自然。記事を読み終えた来訪者に「この記事と関連する遊べるコンテンツがある」ことを伝える）
- コンテンツ数: 2件（まず2件で開始し、クリック率のデータを見て調整する。選択肢過多による決定回避を防ぎつつ、十分な選択肢を提供するバランスとして2件を初期値とする）
- 各カードにアイコン、タイトル（shortTitle優先）、shortDescription、カテゴリバッジ、CTAテキスト（カテゴリに応じて「診断する」「占う」「挑戦する」「遊ぶ」）
- 問数表示: クイズ系のみ「全N問」を表示。`PlayContentMeta`には`questionCount`フィールドが存在しないため、`src/play/registry.ts`で定義されている`quizQuestionCountBySlug`マップを使用してslugから問数を取得する
- 背景色を本文と区別し、セクションの存在を視覚的に明示する

**選出アルゴリズム**

ブログ記事のタグ・カテゴリとplay系コンテンツのkeywordsの関連性に基づく文脈的推薦を行う。

1. 記事のタグ一覧を取得する
2. play系全19コンテンツのkeywordsとの重複数を計算する
3. 重複数が多い上位2件を選出する
4. **重複が0件の場合のフォールバック**: タグ重複0件の場合はセクション自体を表示しない

**フォールバック方針の根拠と影響範囲**:

実データで検証した結果、全52件のブログ記事のうち40件（77%）がplay系コンテンツのkeywordsとのタグ重複0件である。つまり、タグ重複ベースの選出のみでは、大半の技術系ブログ記事（Next.js、TypeScript、設計パターン、Web開発等がタグの記事）でバナーが表示されない。これは93PVの母数のうち相当数がバナー非表示となることを意味する。

ただし、重複12件の記事はplay系コンテンツと実質的に関連のある記事（「日本語×ゲーム」「四字熟語学習ガイド」「漢字・色彩関連」等）であり、これらの記事からの導線は文脈的に自然で高いクリック率が期待できる。一方、技術記事（「Next.jsのハイドレーションミスマッチ」等）に対して無関係なplay系コンテンツを推薦しても、来訪者にとってノイズとなり信頼性を損なうリスクがある。

**「play系コンテンツの存在自体を知らせる」軽い導線の検討**:

タグ重複0件の記事に対して、特定のコンテンツを推薦するのではなく「遊べるコンテンツもあります」という軽いリンク（例: 「遊ぶ」セクションへの単独リンク）を表示する案を検討した。しかし、以下の理由から今回は見送る:

- 文脈的関連性のない誘導は、来訪者にとって「広告」と同様のノイズに感じられるリスクが高い。設計方針である「記事の延長として楽しめるコンテンツ」という体験を担保できない
- /play一覧ページへの単独リンクはクリック率が極めて低いことが一般的であり、投資対効果が不明確
- まずタグ重複ありの12件の記事で導線の効果（クリック率・play系PV増加）を検証し、効果が確認できた段階で、重複0件の記事向けの軽い導線を再検討する方が、データに基づいた意思決定ができる

**まとめ**: 施策1-Aの初期フェーズでは93PVの全体からではなく、play系と文脈的関連性のあるブログ記事（52件中12件）からの導線に絞る。効果検証後に対象範囲の拡大を検討する。

実装のために必要なもの:

- ブログ記事のタグとplay系コンテンツのkeywordsを比較する関数（`src/play/recommendation.ts`に追加）。`countKeywordOverlap`関数は現在`recommendation.ts`内のモジュールプライベート（非export）であるため、新規関数から利用するにはexportに変更するか、新規関数内で同等のロジックを実装する。推薦関数が`countKeywordOverlap`の内部実装詳細に依存しないよう、exportに変更して再利用する方針とする（指摘14の解決方針も参照）
- `PlayRecommendationBanner`コンポーネント（新規作成）

**影響するファイル**:

- `src/app/blog/[slug]/page.tsx` — PlayRecommendationBannerの追加
- `src/play/recommendation.ts` — ブログ記事タグからの推薦関数追加、`countKeywordOverlap`のexport化
- 新規: `src/play/_components/PlayRecommendationBanner.tsx`
- 新規: `src/play/_components/PlayRecommendationBanner.module.css`

### 1-B: 辞典詳細ページへの導線追加

**配置位置**: FaqSectionとShareButtonsの間

現在の辞典詳細ページ構造（`DictionaryDetailLayout.tsx`）:

```
article
  JSON-LD（単一または配列で複数script）
  Breadcrumb
  TrustLevelBadge
  valueProposition（任意）
  children（辞典コンテンツ本体）
  FaqSection
  ShareButtons                    <-- ここの直前
```

改善後:

```
article
  JSON-LD（単一または配列で複数script）
  Breadcrumb
  TrustLevelBadge
  valueProposition（任意）
  children
  FaqSection
  [NEW] PlayRecommendationBanner  <-- 追加
  ShareButtons
```

**注意: ユーモア辞典は対象外**

ユーモア辞典（`src/app/dictionary/humor/[slug]/page.tsx`）は `DictionaryDetailLayout` を使用していない。独自のページコンポーネントで構成されており、レイアウト構造が異なる（Breadcrumb, TrustLevelBadge, article, ShareButtons等を直接配置）。施策1-Bの `DictionaryDetailLayout` への変更はユーモア辞典には影響しない。

ユーモア辞典への導線追加は、以下の理由から今回の設計範囲には含めない:

- `DictionaryDetailLayout`と構造が異なるため個別対応が必要
- 他の3辞典（漢字・四字熟語・色彩）への導線追加で効果を検証してから判断する

**辞典タイプと推薦コンテンツの対応**

`DictionaryDetailLayout`を使用する辞典は漢字・四字熟語・色彩の3種類がある。それぞれに最も関連するplay系コンテンツを定義する。

| 辞典タイプ   | slug接頭辞            | 最も関連するplay系コンテンツ                                                                      | 表示する2件の選出            |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------- |
| 漢字辞典     | `/dictionary/kanji/`  | kanji-kanaru（漢字カナール）、kanji-level（漢字レベル診断）                                       | 2件のため全件表示            |
| 四字熟語辞典 | `/dictionary/yoji/`   | yoji-kimeru（四字キメル）、yoji-level（四字熟語レベル診断）、yoji-personality（四字熟語性格診断） | 3件から2件を選出（下記参照） |
| 色彩辞典     | `/dictionary/colors/` | irodori（イロドリ）、traditional-color（和色診断）                                                | 2件のため全件表示            |

**四字熟語辞典の3件から2件への選出基準**: 四字熟語辞典には関連コンテンツが3件あるが、バナーの表示枠は2件である。以下の基準で固定の2件を選出する:

- **yoji-kimeru（四字キメル）**: 毎日更新のゲームであり、辞典で四字熟語を学んだ来訪者が即座に知識を試せる。辞典コンテンツとの親和性が最も高い
- **yoji-personality（四字熟語性格診断）**: 診断系コンテンツでありカテゴリの多様性を提供する。四字熟語への興味を別の切り口（性格診断）で深められる
- **除外: yoji-level（四字熟語レベル診断）**: yoji-kimeruと同じ「知識テスト」カテゴリであり、カテゴリの多様性の観点からyoji-personalityを優先する。yoji-levelは「あなたの四字熟語力を測る」という訴求でyoji-kimeruと類似しているため

辞典タイプごとに文脈的に最適な2件を返すマッピングをハードコーディングする。keyword比較よりも精度が高く、辞典の種類は有限（3種）であるため保守コストも低い。

**将来の辞典追加時のフォールバック方針**: 新しい辞典タイプが追加された場合、マッピングに該当がなければセクション自体を表示しない（施策1-Aのフォールバック方針と同様）。新辞典追加時にはマッピングの追加を実装タスクに含めること。

**辞典タイプの判定方法**: 現在の`DictionaryDetailLayoutProps`には辞典タイプを示すフィールドが存在しない。辞典タイプを識別するために、新しいprop `dictionaryType` を追加する。

```typescript
/** 辞典タイプ。PlayRecommendationBannerの推薦コンテンツ選出に使用 */
type DictionaryType = "kanji" | "yoji" | "colors";

interface DictionaryDetailLayoutProps {
  // ...既存のprops...
  /** 辞典タイプ（play系推薦コンテンツの選出に使用） */
  dictionaryType: DictionaryType;
}
```

呼び出し元の3ファイル（`src/app/dictionary/kanji/[char]/page.tsx`、`src/app/dictionary/yoji/[yoji]/page.tsx`、`src/app/dictionary/colors/[slug]/page.tsx`）でそれぞれ `dictionaryType="kanji"` / `"yoji"` / `"colors"` を渡す。

**影響するファイル**:

- `src/dictionary/_components/DictionaryDetailLayout.tsx` — PlayRecommendationBannerの追加、`dictionaryType` propの追加
- `src/app/dictionary/kanji/[char]/page.tsx` — `dictionaryType="kanji"` propの追加
- `src/app/dictionary/yoji/[yoji]/page.tsx` — `dictionaryType="yoji"` propの追加
- `src/app/dictionary/colors/[slug]/page.tsx` — `dictionaryType="colors"` propの追加
- 新規: 辞典タイプ別の推薦マッピング定義（`src/play/recommendation.ts`に追加）

### 1-C: ツール・チートシートページへの導線追加

ツール・チートシートはplay系コンテンツとの文脈的関連性が低い。来訪者は「作業中に特定のツールを使う」という明確な目的を持っており、「診断してみよう」という訴求は文脈にそぐわない。

**判断: ツール・チートシートページへの導線追加は行わない。** 無関係な推薦は来訪者にとってノイズであり、サイトの信頼性を損なう。

---

## 施策2: プレイ完了後の回遊導線再設計

### 来訪者にとっての価値

プレイを終えて「面白かった」「次も何かやりたい」と感じた瞬間に、すぐ次のコンテンツが目に入る。スクロールの壁に阻まれて「もういいや」と離脱する体験をなくす。

### 対象範囲

施策2の対象はクイズ・診断（`/play/[slug]/page.tsx`で表示されるQuizContainer系コンテンツ）と静的結果ページ（`/play/[slug]/result/[resultId]/page.tsx`）である。

**占いページ（`/play/daily/page.tsx`）は施策2の対象外**とする。理由は以下の通り:

- 占いページは `DailyFortuneCard`（Client Component）+ `RecommendedContent` という構造であり、QuizContainerのようなフェーズ遷移（intro/playing/result）が存在しない。DailyFortuneCardは初回アクセス時に即座に今日の運勢を表示し、来訪者は結果を見た直後にRecommendedContentが目に入る位置にある
- 占いページにはFaqSectionが存在せず、RelatedQuizzesも配置されていない。つまり「FaqSectionの下に導線が埋もれる」という施策2が解決する問題が占いページには発生していない
- RecommendedContentはDailyFortuneCardの直後に配置されており、回遊導線は既に確保されている

### 2-A: クイズ・診断の結果フェーズ -- RelatedQuizzesをResultCard直下に移動

**現在の構造**（`src/app/play/[slug]/page.tsx`のDOM順序）:

```
div.wrapper                              <-- page.tsx のルート要素
  JSON-LD script
  Breadcrumb
  TrustLevelBadge
  QuizContainer                          <-- Client Component
    div.container                        <-- QuizContainer内部のルート要素
      [introフェーズ] div.intro（アイコン、h1タイトル、説明、メタ情報、スタートボタン、relatedLinks）
      [playingフェーズ] ProgressBar + QuestionCard
      [resultフェーズ] ResultCard + ResultExtraLoader
  FaqSection                             <-- Server Component、QuizContainerの兄弟要素
  section.shareSection                   <-- ページレベルShareButtons
    h2「この診断が楽しかったらシェア」
    ShareButtons（@/components/common/ShareButtons）
  RelatedQuizzes                         <-- Server Component
  RecommendedContent                     <-- Server Component
```

**問題点**: resultフェーズ表示時、RelatedQuizzesとRecommendedContentはFaqSectionとページレベルShareButtonsの下に配置されており、来訪者が到達困難。

**改善後の構造**:

```
div.wrapper
  JSON-LD script
  Breadcrumb
  TrustLevelBadge
  QuizContainer
    div.container[data-quiz-phase="intro|playing|result"]
      [各フェーズのUI]
  div[data-show-on-result]               <-- 新しいラッパーdiv
    RelatedQuizzes                       <-- ResultCard直後（FAQの前）
    RecommendedContent                   <-- RelatedQuizzesの直後
  FaqSection                             <-- 興味がある人だけがスクロールして読む
  section.shareSection                   <-- ページレベルShareButtons（結果表示後も残す）
```

**設計上の判断**:

この変更はServer Component部分（`src/app/play/[slug]/page.tsx`）のDOM順序変更のみで実現できる。QuizContainerの内部ロジックへの影響はない。

ただし1つ問題がある。QuizContainerはClient Componentであり、introフェーズ・playingフェーズ・resultフェーズでUIが切り替わる。RelatedQuizzesとRecommendedContentはServer Component部分に配置されているため、全フェーズで常にDOMに存在する。introフェーズやplayingフェーズでは関連コンテンツが見えていても問題はないが、プレイ中に視界に入ると集中を妨げる可能性がある。

**対策**: CSSで、resultフェーズ以外では関連コンテンツセクションを非表示にする。Server ComponentがClient Componentのstateを参照することはNext.jsの設計上できないため、CSSベースの制御で対応する。

具体的には:

- QuizContainerの `div.container`（`styles.container`）に `data-quiz-phase="intro|playing|result"` 属性を付与する
- RelatedQuizzes/RecommendedContentを包む新しいdivに `data-show-on-result` 属性を付与する
- page.tsx内で、この新しいラッパーdivはQuizContainerの直後の兄弟要素として配置する

**CSS兄弟セレクタの前提: QuizContainerのルート要素とpage.tsxのwrapperの関係**:

QuizContainerはReactコンポーネントであり、3つのreturn文（intro/playing/result各フェーズ）のそれぞれで `<div className={styles.container}>` をルート要素として返す。ReactはコンポーネントのJSXをそのまま親コンポーネントのレンダーツリーに展開するため、page.tsxの `<QuizContainer ... />` の位置にQuizContainerのルート要素（`div.container`）が直接配置される。結果として、レンダリング後のDOM構造では:

```html
<div class="wrapper">
  <!-- page.tsx -->
  ...
  <div class="container" data-quiz-phase="...">
    <!-- QuizContainer のルート要素 -->
    ...
  </div>
  <div data-show-on-result>
    <!-- page.tsx の新しいラッパー -->
    ...
  </div>
  ...
</div>
```

`div.container`（QuizContainer由来）と `div[data-show-on-result]` はDOM上で `div.wrapper` の直接の子要素として兄弟関係にある。これは React が `<QuizContainer>` を中間のラッパー要素なしに展開するためであり、CSS一般兄弟結合子（`~`）が正しく機能する前提条件を満たす。

**React reconciliation に関する注意**: QuizContainerは3つのreturn文（`if (phase === "intro")`、`if (phase === "playing")`、結果フェーズのreturn）を持ち、各フェーズで異なるJSXツリーを返す。CSS兄弟セレクタが全フェーズで正しく動作するためには、**3つのreturn文すべてのルート要素に `data-quiz-phase` 属性を付与する**必要がある。具体的には:

- introフェーズ: `<div className={styles.container} data-quiz-phase="intro">`
- playingフェーズ: `<div className={styles.container} data-quiz-phase="playing">`
- resultフェーズ: `<div className={styles.container} data-quiz-phase="result">`

Reactのreconciliationは同じ位置の同じ要素タイプ（`div`）に対して属性を更新する形で処理するため、フェーズ遷移時にdata-quiz-phase属性が正しく更新される。ただし、各return文が独立した条件分岐で構成されているため、各フェーズのテストにおいて `data-quiz-phase` 属性が期待通りの値を持つことを検証するテストケースを含めること。

**CSS Modulesとの相性に関するトレードオフ**:

CSS Modulesはクラス名をスコープ化するが、`data-quiz-phase`や`data-show-on-result`はデータ属性であり、CSS Modulesのスコープ化の対象外である。そのため属性セレクタ `[data-quiz-phase] ~ [data-show-on-result]` はCSS Modulesの文脈でも正常に機能する。

ただし、この設計には以下のトレードオフがある:

- グローバルなデータ属性を使用するため、属性名の衝突リスクがある。`data-quiz-phase` のようにプレフィックス付きの属性名を使用して衝突を回避する
- CSS Modulesファイル内でデータ属性セレクタを使用する場合、`:global()` で囲む必要がある

CSS（`src/app/play/[slug]/page.module.css`に追加）:

```css
:global([data-quiz-phase="intro"]) ~ .showOnResult,
:global([data-quiz-phase="playing"]) ~ .showOnResult {
  display: none;
}
```

ここで `.showOnResult` はCSS Modulesでスコープ化されたクラス名であり、`data-quiz-phase` はグローバルなデータ属性である。この組み合わせにより、CSS Modulesの局所性を可能な限り維持しつつ、フェーズ連動の表示制御を実現する。

**テスト方針**: QuizContainerのテストにおいて、以下を検証する:

- introフェーズで `data-quiz-phase="intro"` が設定されること
- playingフェーズで `data-quiz-phase="playing"` が設定されること
- resultフェーズで `data-quiz-phase="result"` が設定されること

**ページレベルShareButtonsの配置について**: 施策2-AではDOM順序変更に伴い、ページレベルShareButtons（`section.shareSection`）をFaqSectionの後に残す。ジャーニーマップでは「並行インフラ整備」としてShareButtonsのファーストビュー移動が提案されているが、ResultCard内部に既にShareButtonsが配置されているため、resultフェーズにおけるシェア導線は確保されている。ページレベルShareButtonsは「結果画面以外のフェーズ」や「FAQ閲覧後」のシェア導線として機能するため、現在の位置を維持する。

**影響するファイル**:

- `src/app/play/[slug]/page.tsx` — RelatedQuizzes/RecommendedContentの配置順序変更、ラッパーdiv追加
- `src/play/quiz/_components/QuizContainer.tsx` — 3つのreturn文すべてのルート要素（`div.container`）に `data-quiz-phase` 属性追加
- `src/app/play/[slug]/page.module.css` — phase連動の表示制御CSS追加

### 2-B: 静的結果ページ -- 「このクイズとは」情報の補完

SNSシェアリンク経由で `/play/[slug]/result/[resultId]` に来た人は、「友達の結果」を見ているが「このクイズが何か」を知らない。CTAボタン「あなたも挑戦してみる?」はあるが、プレイに踏み切るための判断材料（問数・所要時間・登録不要であること）が不足している。

**優先度の根拠**: SNSシェア経由の来訪は現時点で月0件であり、施策3（ゲームResultModal内の他カテゴリ導線）よりも即効性は低い。ただし、施策1による流入増加とResultCard内ShareButtonsによるシェア促進の効果が出た後に、この施策の価値が顕在化する。施策3と並行して実装可能であり、実装コストも小さいため、施策3と同順位として扱う。

**現在の構造**（`src/app/play/[slug]/result/[resultId]/page.tsx`）:

```
div.wrapper
  Breadcrumb
  div.card
    アイコン（result.icon）
    h1 結果タイトル（result.title）
    クイズ名（「〇〇の結果」）
    説明テキスト（result.description）
    Link「あなたも挑戦してみる?」CTAボタン
    div.shareSection
      ShareButtons（@/play/quiz/_components/ShareButtons — クイズ専用版）
    CompatibilityDisplay（条件付き）
  RelatedQuizzes
  RecommendedContent
```

**注記: 静的結果ページのShareButtonsについて**: このページでは `@/play/quiz/_components/ShareButtons`（クイズ専用のShareButtons）を使用している。これは `@/components/common/ShareButtons` とは別のコンポーネントであり、`shareText`/`shareUrl`/`quizTitle` 等のクイズ固有のpropsを受け取る。play/[slug]/page.tsxのページレベルShareButtons（`@/components/common/ShareButtons`）とは異なるため、変更時に混同しないこと。

**改善後の構造**:

```
div.wrapper
  Breadcrumb
  div.card
    アイコン（result.icon）
    h1 結果タイトル（result.title）
    クイズ名（「〇〇の結果」）
    説明テキスト（result.description）
    [NEW] クイズ情報ブロック         <-- 追加
    Link「あなたも診断してみる? (全N問・登録不要)」CTAボタン（文言改善）
    div.shareSection
      ShareButtons（クイズ専用版）
    CompatibilityDisplay（条件付き）
  RelatedQuizzes
  RecommendedContent
```

**クイズ情報ブロックの構成**:

```
+--------------------------------------------------+
|  この診断について                                    |
|  [icon] クイズ名                                    |
|  全N問 / 診断（or 知識クイズ） / 登録不要・無料       |
+--------------------------------------------------+
```

- `quiz.meta.questionCount`（問数） -- `QuizMeta` 型で `questionCount: number` として定義済み（`src/play/quiz/types.ts`）。静的結果ページでは `quizBySlug.get(slug)` で `QuizDefinition` を取得しており、`quiz.meta.questionCount` で直接アクセス可能
- `quiz.meta.type`（`"knowledge"` なら「知識クイズ」、`"personality"` なら「診断」と表示）
- 「登録不要・無料」の固定テキスト

**CTAボタンの文言改善**:

現在: 「あなたも挑戦してみる?」
改善後: 「あなたも診断してみる? (全N問・登録不要)」

CTAテキストにコスト感を含めることで、来訪者が「どのくらいの手間がかかるか」を瞬時に判断でき、プレイ参入障壁を下げる。カテゴリに応じてCTAの動詞を変える（診断する / 挑戦する / 遊ぶ / 占う）。

**影響するファイル**:

- `src/app/play/[slug]/result/[resultId]/page.tsx` — クイズ情報ブロック追加、CTA文言改善
- `src/app/play/[slug]/result/[resultId]/page.module.css` — スタイル追加

### ジャーニーマップの「文脈付き推薦」提案への対応

ジャーニーマップでは回遊ポイントにおいて「文脈付き推薦: 『あなたのタイプと相性がいい診断』『同じくXXな人はこちらも』」という提案がなされている。これは、クイズの結果タイプに基づいてパーソナライズされた推薦文言を表示するアイデアである。

**判断: 今回は見送る。** 理由は以下の通り:

- 結果タイプに基づく推薦を実装するには、各クイズの結果タイプとplay系コンテンツの間のマッピングを定義する必要がある。19コンテンツ x 結果タイプ数の組み合わせは膨大であり、品質の高いマッピングを維持するコストが高い
- 現在のRelatedQuizzesとRecommendedContentはkeywordsベースの選出であり、結果タイプとは無関係に動作する。パーソナライズ推薦を実現するには選出ロジック自体の再設計が必要
- 施策2-Aで「ResultCard直下への移動」を実現すれば、来訪者が関連コンテンツに到達できないという最大の問題は解消される。推薦の文言改善は、移動後のクリック率データを見てから検討する方がデータに基づいた判断ができる
- play系PVが週3件の現状では、パーソナライズ推薦の効果を統計的に検証することが困難である

施策1による流入増加と施策2-Aによる導線改善の効果が確認された後、回遊率のデータに基づいて文脈付き推薦の導入を再検討する。

---

## 施策3: ゲームResultModal内の他カテゴリ導線

### 来訪者にとっての価値

ゲームを楽しんだ後、「他にも面白いものがあるかも」という好奇心に応える。現在はモーダル内にNextGameBanner（全ゲームの今日のプレイ状況を一覧表示 -- 同カテゴリ限定ではなく全4ゲームが対象）しかなく、診断や占いという全く別の楽しみ方の存在を来訪者に伝えられていない。

### 設計

**NextGameBannerの正確な動作**: NextGameBanner（`src/play/games/shared/_components/NextGameBanner.tsx`）は、`allGameMetas`（全ゲーム一覧）から現在のゲームを除外した全ゲームを表示する。カテゴリによるフィルタリングは行っていない。今日のプレイ状況（クリア済/未プレイ）とともに表示し、全ゲーム制覇の進捗を示す。つまり、NextGameBannerは「ゲームカテゴリ内の回遊」は既に担っているが、「診断・占い等の他カテゴリへの回遊」は担っていない。

**現在のResultModal内の構造**（kanji-kanaruの例）:

```
GameDialog
  結果（正解/不正解）
  漢字情報（読み、意味、例）
  GameShareButtons
  CountdownTimer
  NextGameBanner（全ゲームの今日のプレイ状況）
  footer: 「統計を見る」ボタン
```

**改善後の構造**:

```
GameDialog
  結果（正解/不正解）
  漢字情報（読み、意味、例）
  GameShareButtons
  CountdownTimer
  NextGameBanner（全ゲームの今日のプレイ状況）
  [NEW] CrossCategoryBanner        <-- 追加
  footer: 「統計を見る」ボタン
```

**CrossCategoryBannerのワイヤーフレーム**:

```
+--------------------------------------------------+
|  他のジャンルも試してみよう                          |
|                                                    |
|  +----------------------------------------------+ |
|  | [icon]  タイトル          [カテゴリバッジ]     | |
|  |         短い説明文                 [CTA] ->   | |
|  +----------------------------------------------+ |
|  +----------------------------------------------+ |
|  | [icon]  タイトル          [カテゴリバッジ]     | |
|  |         短い説明文                 [CTA] ->   | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
```

- 表示するコンテンツ: 2件（他カテゴリから各1件）
- 選出ロジック: 既存の`getRecommendedContents`を活用する。ただし現在の`getRecommendedContents`はスコア（keywords重複数）を返り値に含めず、`PlayContentMeta[]`のみを返す。3件から2件に絞り込む際にスコアベースの選出ができないため、以下のいずれかの方針で対応する:

  **方針: 新規関数 `getRecommendedContentsWithScore` を追加する。** 既存の`getRecommendedContents`は変更せず（後方互換性を維持）、内部の`selectBestFromCategory`が算出したスコアも返す新しい関数を`src/play/recommendation.ts`に追加する。この関数は `{ content: PlayContentMeta; overlapScore: number }[]` 形式で3件を返し、CrossCategoryBannerはスコア上位2件を使用する。スコアが同数の場合は`getRecommendedContents`と同じくカテゴリ定義順（fortune, personality, knowledge の順）の先頭2件を採用する。

  この方針により、既存のRecommendedContentコンポーネント（`getRecommendedContents`を使用）への影響をゼロに保ちつつ、CrossCategoryBannerの要件を満たすことができる。

  **影響するファイル（追加）**: `src/play/recommendation.ts` — `getRecommendedContentsWithScore`関数の追加、`countKeywordOverlap`のexport化

- 各カードにアイコン、タイトル（shortTitle優先）、shortDescription、カテゴリバッジ
- モーダル内のスペースを考慮し、カードはコンパクトなデザインにする
- CTAテキストはカテゴリに応じて変更（「診断する」「占う」「挑戦する」）

**CrossCategoryBannerは共有コンポーネントとして設計する**。全ゲーム（kanji-kanaru, yoji-kimeru, nakamawake, irodori）のResultModalで使用できるようにするため、`src/play/games/shared/_components/` に配置する。

**影響するファイル**:

- 新規: `src/play/games/shared/_components/CrossCategoryBanner.tsx`
- 新規: `src/play/games/shared/_components/CrossCategoryBanner.module.css`
- `src/play/games/kanji-kanaru/_components/ResultModal.tsx` — CrossCategoryBanner追加
- `src/play/games/yoji-kimeru/_components/ResultModal.tsx` — CrossCategoryBanner追加
- `src/play/games/nakamawake/_components/ResultModal.tsx` — CrossCategoryBanner追加
- `src/play/games/irodori/_components/ResultModal.tsx` — CrossCategoryBanner追加
- `src/play/recommendation.ts` — `getRecommendedContentsWithScore`関数追加

**注意**: CrossCategoryBannerはClient Component（"use client"）として実装する必要がある。ResultModalがClient Componentであり、その中で使用されるため。play系コンテンツのメタデータ（タイトル、説明、アイコン等）はビルド時に確定する静的データであるため、Client Componentからでも直接import可能（APIコール不要）。

---

## 施策間の依存関係

```
施策1（非play系からの導線）  ---独立---  施策2（完了後の回遊導線）
                                         |
                                     施策3（ゲームモーダル内導線）は施策2と独立
```

3施策は相互に独立しており、並行実装が可能。ただし、来訪者への価値と期待効果の観点から、施策1を最優先で実施する。施策2-Aは次に優先し、施策2-Bと3は同順位で並行して進めてよい。

---

## 影響するファイルの全一覧

| ファイル                                                           | 変更種別                                     | 施策 |
| ------------------------------------------------------------------ | -------------------------------------------- | ---- |
| `src/play/_components/PlayRecommendationBanner.tsx`                | 新規作成                                     | 1    |
| `src/play/_components/PlayRecommendationBanner.module.css`         | 新規作成                                     | 1    |
| `src/play/recommendation.ts`                                       | 関数追加・`countKeywordOverlap`のexport化    | 1, 3 |
| `src/app/blog/[slug]/page.tsx`                                     | 変更                                         | 1-A  |
| `src/dictionary/_components/DictionaryDetailLayout.tsx`            | 変更（`dictionaryType` prop追加）            | 1-B  |
| `src/app/dictionary/kanji/[char]/page.tsx`                         | 変更（`dictionaryType` prop追加）            | 1-B  |
| `src/app/dictionary/yoji/[yoji]/page.tsx`                          | 変更（`dictionaryType` prop追加）            | 1-B  |
| `src/app/dictionary/colors/[slug]/page.tsx`                        | 変更（`dictionaryType` prop追加）            | 1-B  |
| `src/app/play/[slug]/page.tsx`                                     | 変更                                         | 2-A  |
| `src/app/play/[slug]/page.module.css`                              | 変更                                         | 2-A  |
| `src/play/quiz/_components/QuizContainer.tsx`                      | 変更（3つのreturn文に`data-quiz-phase`追加） | 2-A  |
| `src/app/play/[slug]/result/[resultId]/page.tsx`                   | 変更                                         | 2-B  |
| `src/app/play/[slug]/result/[resultId]/page.module.css`            | 変更                                         | 2-B  |
| `src/play/games/shared/_components/CrossCategoryBanner.tsx`        | 新規作成                                     | 3    |
| `src/play/games/shared/_components/CrossCategoryBanner.module.css` | 新規作成                                     | 3    |
| `src/play/games/kanji-kanaru/_components/ResultModal.tsx`          | 変更                                         | 3    |
| `src/play/games/yoji-kimeru/_components/ResultModal.tsx`           | 変更                                         | 3    |
| `src/play/games/nakamawake/_components/ResultModal.tsx`            | 変更                                         | 3    |
| `src/play/games/irodori/_components/ResultModal.tsx`               | 変更                                         | 3    |

---

## 実装しないもの（とその理由）

### ページレベルShareButtonsのファーストビュー移動

ジャーニーマップでは「並行インフラ整備」としてShareButtonsの位置改善が提案されている。施策2-AでDOM順序を変更する際にShareButtonsの配置も見直すことを検討したが、以下の理由から現時点では見送る:

- **ResultCard内に既にShareButtonsが配置されている**: resultフェーズでは、ResultCard内のShareButtonsが来訪者のファーストビューに表示される。シェア導線は既に確保されている
- **ページレベルShareButtonsの役割**: FAQの後に配置されるページレベルShareButtonsは、「結果画面以外のフェーズ」や「FAQ閲覧後」のシェア導線として別の役割を持つ
- **母数の問題**: 現在の週3PVではシェアが発生する母数自体が不足している。施策1による流入増加の効果が出た後に、シェア体験の改善に取り組む方が投資対効果が高い

施策1の効果でplay系流入が増加した後、シェア率のデータを確認し、ページレベルShareButtonsの位置改善を再検討する。

### 段階的開示アニメーション（Progressive Disclosure）

結果をドラマチックに演出する手法だが、ターゲットユーザーは「手軽さ」を重視しており（ターゲット定義: 「1回2-5分で手軽に遊べるコンテンツ」「操作が重い、説明が足りず迷うUIを嫌う」）、演出が「待たされる」体験に感じられるリスクがある。来訪者にとっての明確な価値が不透明なため、今回は見送る。

### ソーシャルプルーフ（「N人がプレイ済み」表示）

プレイ数のカウントにはサーバーサイドのデータストアが必要であり、現在のアーキテクチャ（静的生成 + クライアントサイド完結）とは相容れない。来訪者にとって価値はあるが、実装の前提が整っていない。

### /play一覧ページのゲームカード情報追加（プレイ時間・難易度）

来訪者にとって有用な情報ではあるが、一覧ページは既にイチオシセクション・問数表示・毎日更新バッジが整備されており、改善の緊急度は低い。流入増加施策を優先する。

### ツール・チートシートページへの導線

ツール利用者は作業目的で来訪しており、「診断してみよう」は文脈的に不適切。来訪者への価値よりノイズになるリスクが高い。

### ユーモア辞典への導線追加

ユーモア辞典は `DictionaryDetailLayout` を使用しておらず、独自のページ構造を持っている。他の3辞典（漢字・四字熟語・色彩）への導線追加で効果を検証した後、個別に設計・実装を検討する。

### 文脈付き推薦（結果タイプベースのパーソナライズ推薦）

ジャーニーマップの提案。理由は「ジャーニーマップの『文脈付き推薦』提案への対応」セクションに記載。
