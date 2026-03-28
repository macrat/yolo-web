# play系コンテンツ改善設計書

**作成日**: 2026-03-29
**目的**: play系コンテンツの来訪者に最高の価値を提供するための改善設計
**依拠する上流成果物**:

- `docs/research/2026-03-29-play-page-visibility-audit.md` (技術検証)
- `docs/research/2026-03-29-play-customer-journey-map.md` (カスタマージャーニーマップ)
- `docs/research/quiz-result-page-ux-best-practices.md` (UXベストプラクティス)

---

## 現状認識

### データが示す事実

- 直近7日間: サイト全体PV 96、play系は3PVのみ（music-personalityのみ）
- 非play系ページ（ブログ・辞典・ツール等）に93PVが流入している
- Organic Search 60%, Direct 35%
- Desktop 64%, Mobile 34%

### 構造的な問題（技術検証・ジャーニーマップより）

1. **流入の壁**: 93PVの非play系来訪者からplay系への導線がゼロ。ブログ記事ページ(`src/app/blog/[slug]/page.tsx`)にも辞典詳細ページにも、play系へのリンクが一切存在しない
2. **回遊の壁**: プレイ完了後、RelatedQuizzes/RecommendedContentがFAQ・ShareButtonsの下に埋もれており到達可能性が「極めて低い」（技術検証で確認済み）
3. **ゲーム完了時の壁**: ResultModalが画面全体を覆い、モーダル内にはNextGameBanner（同カテゴリのgameのみ対象）しかない。他カテゴリ（診断・占い）への経路がゼロ。モーダルを閉じた後もRecommendedContentへの到達可能性は「極めて低い」
4. **リピート来訪の壁**: /play/dailyは毎日コンテンツが変わる唯一のplay系コンテンツだが、リピート来訪を促す施策が「明日も来てね! 毎日運勢が変わります」のテキスト表示のみ。ブックマーク登録を促すCTA等の習慣化強化施策が未実装（横断的問題点0-C）
5. **静的結果ページの情報不足**: SNS経由来訪者が見る静的結果ページに、クイズの概要情報（問数・タイプ・所要時間の目安）がなく、「自分もやってみるか」の判断材料が不足

---

## 設計方針

来訪者への価値が最も高い順に6つの施策を設計する。

| 順序 | 施策                                               | 来訪者への価値                                         | 期待効果                                     | 対応するジャーニーマップ                  |
| ---- | -------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------- | ----------------------------------------- |
| 1    | 非play系ページからの文脈的導線                     | 「こんな面白いコンテンツもあったのか」という発見       | 93PVの来訪者をplay系に誘導（最大の母数活用） | シナリオ2、横断的問題点0-A                |
| 2    | プレイ完了後の回遊導線再設計（シェア体験確認含む） | 「次も面白そう」の好奇心に即座に応える                 | 完了者の離脱を防ぎ連鎖プレイを実現           | シナリオ3、横断的問題点0-B、横断的問題点1 |
| 3    | ゲームResultModal内の他カテゴリ導線                | ゲームユーザーに診断・占いの存在を伝える               | ゲーム完了者の回遊経路を新設                 | シナリオ3（ゲーム）                       |
| 4    | /play/dailyのリピート来訪促進 + SERP最適化         | 「毎朝チェックする楽しみ」を提供する                   | 単発PVから継続的PV基盤への転換、SERP流入増加 | サブシナリオ1-B、横断的問題点0-C          |
| 5    | シェアテキスト最適化                               | シェアされたとき受け手が「面白そう」と思いクリックする | SNSバイラル経路の基盤整備                    | 横断的問題点0-B                           |
| 6    | 静的結果ページの訴求強化                           | SNS来訪者に「自分もやりたい」と思わせる                | シェアリンク経由のコンバージョン率向上       | シナリオ5                                 |

---

## 施策1: 非play系ページからの文脈的導線

### 来訪者にとっての価値

ブログや辞典を読みに来た人が、記事テーマと関連する診断・クイズ・ゲームの存在を自然に知ることができる。「押しつけがましい広告」ではなく「記事の延長として楽しめるコンテンツ」として体験される設計にする。

### 1-A: ブログ記事ページへの導線追加

**配置位置**: `article`タグ内、`RelatedArticles`の後、`article`閉じタグの直前。`nav.postNav`は`article`タグの外側にある。

現在のブログ記事ページ構造（`src/app/blog/[slug]/page.tsx`）:

```
div.container
  Breadcrumb
  article                         ← article開始
    header（カテゴリ、日付、タイトル、タグ）
    SeriesNav（任意）
    layout
      sidebar（目次）
      content（本文）
    MermaidRenderer
    section.shareSection
      h2「この記事をシェア」
      ShareButtons
    RelatedArticles               ← articleの中
  /article                        ← article終了
  nav.postNav（前の記事 / 次の記事） ← articleの外
```

**変更後の構造**:

```
  article
    ...
    section.shareSection
      h2「この記事をシェア」
      ShareButtons
    RelatedArticles
    PlayRecommendBlock ← 新規追加（article内、RelatedArticlesの後）
  /article
  nav.postNav
```

**PlayRecommendBlock コンポーネント設計**:

```
nav[aria-label="関連する占い・診断"]
  h2「この記事を読んだあなたに」
  p 「ブラウザで今すぐ遊べる診断・占い」（サブテキスト）
  ul（カード2件、縦並び）
    li
      Link -> /play/[slug]
        span.icon（絵文字アイコン）
        div
          span.title（shortTitle優先）
          span.meta（「全X問 / 診断」or「毎日更新」等のコスト感情報）
          span.description（shortDescription）
          span.cta（カテゴリ別CTAテキスト: 「診断する」「占う」「遊ぶ」等）
```

**推薦ロジック**: ブログ記事のタグ・カテゴリとplay系コンテンツのkeywordsのオーバーラップを計算し、最も関連性の高い2件を選出する。関連性が低い場合（オーバーラップ0件）は、イチオシコンテンツからフォールバック選出する。play系コンテンツが存在しないケースはないが、将来の安全性のため0件の場合はブロック自体を非表示にする。

**語彙空間の検証結果（指摘10対応）**: ブログ記事のタグとplay系コンテンツのkeywordsは**異なる語彙空間**にある。

- ブログタグの例: 「ゲーム」「四字熟語」「漢字」「伝統色」「日本語」「設計パターン」「Next.js」「Web開発」「UI改善」「SEO」等
- play系keywords（クイズ）の例: 「四字熟語」「性格診断」「漢字」「伝統色」「ことわざ」「音楽」等
- play系keywords（ゲーム）の例: 「漢字」「パズル」「デイリー」「四字熟語」「色」「仲間分け」等

**共通する語彙**: 「四字熟語」「漢字」「伝統色」「日本語」など、テーマ系のワードは共通している。一方、ブログタグの大半は技術系（「Next.js」「TypeScript」「設計パターン」等）であり、play系keywordsとオーバーラップしない。技術系ブログ記事ではオーバーラップ0件となるケースが頻繁に発生するため、フォールバックロジック（イチオシコンテンツからの選出）が重要な役割を果たす。推薦関数はブログタグとkeywordsの直接マッチングを基本とし、マッチしない場合はフォールバックに頼る設計で問題ない。

**件数を2件にする理由**: UXベストプラクティスの知見「選択肢が多すぎると決定回避が起きる」に基づく。ブログ記事の文脈では、読者は記事を読み終えた状態であり、play系は「おまけの発見」として提示される。3件では情報量が多すぎ、1件では選択肢がなく興味がマッチしない場合に離脱する。2件が最適。

**影響ファイル**:

- `src/app/blog/[slug]/page.tsx` -- PlayRecommendBlockの配置
- 新規: `src/play/_components/PlayRecommendBlock.tsx` -- コンポーネント本体
- 新規: `src/play/_components/PlayRecommendBlock.module.css` -- スタイル
- `src/play/recommendation.ts` -- 推薦ロジックの拡張（ブログタグからの推薦関数を追加）

### 1-B: 辞典ページへの導線追加

**1-Aのコンポーネント完成後に別途詳細設計する。** 以下は方針レベルの記載であり、1-A完了後にソースコードの最新状態を確認した上で具体化する。

ブログと同じ`PlayRecommendBlock`コンポーネントを使用する。辞典ページの場合はページテーマ（漢字・四字熟語・伝統色等）とplay系コンテンツのkeywordsでマッチングする。

**配置位置の方針**: 辞典詳細ページは`DictionaryDetailLayout`（`src/dictionary/_components/DictionaryDetailLayout.tsx`）を共通レイアウトとして使用しており、構造は以下の通り:

```
article
  JSON-LD
  Breadcrumb
  TrustLevelBadge
  valueProposition
  children                        ← 各辞典のDetailコンポーネント（KanjiDetail/YojiDetail/ColorDetail）
    h1、コンテンツ詳細
    関連エントリー（relatedKanji/relatedYoji/relatedColors等）← childrenの中
  FaqSection
  section.shareSection
    ShareButtons
/article
```

**重要な構造上の注意**: 関連エントリー（同じ部首の漢字、同カテゴリの四字熟語等）は各Detailコンポーネント（`children`）内部に存在する。PlayRecommendBlockを配置するには以下の2つの方法がある:

- **方法A**: `DictionaryDetailLayout`にPlayRecommendBlock用のpropsを追加し、ShareButtonsの後に固定配置する
- **方法B**: 各辞典の`page.tsx`でDictionaryDetailLayoutの外側（articleタグの後）に配置する

いずれの方法を採るかは1-A完了後の詳細設計で決定する。方法Aの場合は以下のファイルすべてに影響する:

**影響ファイル（方法Aの場合）**:

- `src/dictionary/_components/DictionaryDetailLayout.tsx` -- props追加、PlayRecommendBlockの配置
- `src/app/dictionary/kanji/[char]/page.tsx` -- 推薦データの算出とprops追加
- `src/app/dictionary/yoji/[yoji]/page.tsx` -- 同上
- `src/app/dictionary/colors/[slug]/page.tsx` -- 同上
- `src/play/recommendation.ts` -- 辞典テーマからの推薦関数を追加

### 1-C: トップページの導線確認

トップページ（`src/app/page.tsx`）は既に以下の導線が実装済みであり、追加改修は不要:

- ヒーローCTA「占い・診断を試す」-> /play
- 「まずはここから」セクション（featuredContents 3件）
- FortunePreview（今日の運勢プレビュー）
- 「もっと診断してみよう」セクション（diagnosisContents）
- 「デイリーパズル」セクション（gameContents）

---

## 施策2: プレイ完了後の回遊導線再設計

### 来訪者にとっての価値

クイズ・診断の結果に満足（または興奮）した瞬間に、「次も面白そう」と思えるコンテンツが即座に目に入る。スクロールして探す必要がなく、好奇心が冷める前に次の体験に進める。

### 現状の問題（技術検証より）

クイズ結果フェーズで`RelatedQuizzes`/`RecommendedContent`に到達するには、以下をすべてスクロールする必要がある:

```
ResultCard（アイコン・タイトル・説明200-300字・ShareButtons・「もう一度挑戦する」）
ResultExtraLoader（6種のクイズのみ: CompatibilitySection、RadarChart等）
FaqSection（展開可能アコーディオン）
ページレベルShareButtons
<- ここでようやく RelatedQuizzes に到達
<- RecommendedContent
```

到達可能性: **極めて低い**

### 改善設計: ResultCard直下に回遊導線を挿入

**変更方針**: `QuizContainer`のresultフェーズで、`ResultCard`と`ResultExtraLoader`の間に回遊導線コンポーネントを挿入する。

**変更前の構造**（`src/play/quiz/_components/QuizContainer.tsx` resultフェーズ）:

```
div.container
  ResultCard
  ResultExtraLoader
```

**変更後の構造**:

```
div.container
  ResultCard
  ResultNextContent <- 新規追加
  ResultExtraLoader
```

ページレベルの構造（`src/app/play/[slug]/page.tsx`）は変更しない。`RelatedQuizzes`と`RecommendedContent`はページ下部にそのまま残す（SEOのためのリンク構造として有用。ユーザー導線としてはResultNextContentが担う）。

**ResultNextContentとRelatedQuizzes/RecommendedContentの重複リンク考慮（指摘12対応）**: ResultNextContentに表示される2-3件のコンテンツが、ページ下部のRelatedQuizzes/RecommendedContentにも表示される可能性がある。この重複は意図的に許容する。理由: (1) ResultNextContentはResultCard直下でユーザーの注意が最も高い位置にあり、到達可能性が高い。RelatedQuizzes/RecommendedContentは到達可能性が極めて低く、実質的にSEO用途。同じユーザーが両方を目にする確率は非常に低い。(2) 重複排除のためにRelatedQuizzes/RecommendedContentを動的に変更するとServer/Client Component境界の複雑化を招き、コストに見合わない。

**ResultNextContent コンポーネント設計**:

```
section[aria-label="次のおすすめ"]
  h3「次はこれを試してみよう」（見出しテキスト）
  ul（カード2-3件、縦並び）
    li
      Link -> /play/[slug]
        span.icon
        div
          span.title（shortTitle優先）
          span.meta（「全X問 / 診断」等）
          span.badge（カテゴリバッジ: 「占い」「診断」等）
```

**推薦ロジック**:

- 同カテゴリから1件 + 異カテゴリから1-2件 = 合計2-3件
- 同カテゴリは`RelatedQuizzes`と同じロジック（同カテゴリの別コンテンツ）
- 異カテゴリは`RecommendedContent`と同じロジック（keywords重複ベース）
- 既存の`getRecommendedContents()`関数を活用可能

**文言の工夫**: ベストプラクティスに基づき、汎用的な「関連コンテンツ」ではなく、結果に関連づけた文脈を持たせる。ただし現実装でresult情報をServer Componentに渡す仕組みが必要になるため、初期実装では汎用的な「次はこれを試してみよう」を使い、将来的に結果連動型の文言（「あなたのタイプと相性がいい診断」等）への拡張を検討する。

**Client/Server Component の設計判断**: `ResultNextContent`は`QuizContainer`（Client Component）の子として描画される。推薦データをpropsとして親のServer Component（`page.tsx`）から渡す方式を採用し、Client Component内での追加データフェッチを避ける。

具体的には:

1. `src/app/play/[slug]/page.tsx`（Server Component）で推薦コンテンツを計算
2. propsとして`QuizContainer`に渡す
3. `QuizContainer`がresultフェーズで`ResultNextContent`に転送

**QuizContainer propsへの推薦データ追加に関する制約（指摘5対応）**:

`QuizContainer`はClient Component（`"use client"`）であり、Server Componentからpropsとして渡されるデータはReact Server Components Payloadとしてシリアライズされる。推薦データは`PlayContentMeta`の配列（文字列・数値のみで構成されるプレーンオブジェクト）であり、すべてのフィールドがJSON serializable であるため、シリアライズの問題は発生しない。

型定義への影響:

- `src/play/quiz/_components/QuizContainer.tsx` -- `QuizContainerProps`に`recommendedContents?: PlayContentMeta[]`を追加
- `src/play/types.ts` -- 変更不要（既存の`PlayContentMeta`をそのまま使用）
- `src/play/quiz/types.ts` -- 変更不要

### ShareButtonsのファーストビュー配置確認（指摘1対応）

上流ジャーニーマップの横断的問題点0-Bで、ShareButtonsをプレイ完了後のファーストビュー内に確実に配置することが「最高優先度（並行インフラ整備）」として指摘されている。

**現状の確認**: クイズ・診断の`ResultCard`コンポーネント内にはShareButtonsが既に含まれている（ResultCard内部: アイコン -> タイトル -> 説明文 -> ShareButtons -> 「もう一度挑戦する」ボタン）。ResultCardは結果フェーズの最上部に表示されるため、ShareButtonsはファーストビュー内に位置している。

**本施策で行うこと**: ResultNextContentをResultCard直下に配置する際、ShareButtonsがResultCard内で結果表示の直後にあることを視覚的に再確認する（Playwrightでモバイル360px幅・デスクトップ1280px幅の両方でスクリーンショットを取得し、ShareButtonsがファーストビュー内に収まっていることを検証する）。もしShareButtonsがファーストビューからはみ出している場合は、ResultCard内のレイアウト調整を本施策に含める。

**影響ファイル**:

- `src/app/play/[slug]/page.tsx` -- 推薦データの計算とpropsの追加
- `src/play/quiz/_components/QuizContainer.tsx` -- `ResultNextContent`の配置、props受け渡し、`QuizContainerProps`型の拡張
- 新規: `src/play/quiz/_components/ResultNextContent.tsx` -- コンポーネント本体
- 新規: `src/play/quiz/_components/ResultNextContent.module.css` -- スタイル

---

## 施策3: ゲームResultModal内の他カテゴリ導線

### 来訪者にとっての価値

ゲームを楽しんだユーザーが、ゲーム完了後のモーダル画面で「診断や占いもあるのか」と気づき、新しいカテゴリのコンテンツを発見できる。

### 現状の問題（技術検証より）

ゲーム完了時のResultModal内の導線:

```
GameDialog
  結果表示（正解/不正解 + 漢字情報等）
  GameShareButtons
  CountdownTimer
  NextGameBanner（同カテゴリのgameのみ対象）
  「統計を見る」フッターボタン
```

- `NextGameBanner`は`allGameMetas`（gameカテゴリのみ）からフィルタリングしており、**他カテゴリ（personality/knowledge/fortune）への導線はモーダル内に一切ない**
- モーダルを閉じた後も、`RelatedGames`/`RecommendedContent`まで膨大なスクロールが必要
- 到達可能性: **極めて低い**

### 改善設計: NextGameBannerの後に他カテゴリ導線を追加

**変更後のモーダル構造**（例: kanji-kanaruのResultModal）:

```
GameDialog
  結果表示（正解/不正解 + 漢字情報等）
  GameShareButtons
  CountdownTimer
  NextGameBanner
  CrossCategoryBanner <- 新規追加
  「統計を見る」フッターボタン
```

**CrossCategoryBanner コンポーネント設計**:

```
div.crossCategory
  p.label「他のコンテンツも試してみよう」
  div.linkList
    Link -> /play/[slug]（診断系から1件）
      span.icon
      span.title
      span.badge（「診断」等）
    Link -> /play/daily（占い）
      span.icon
      span.title（「今日の運勢」）
      span.badge（「占い」）
```

**推薦ロジック**:

- gameカテゴリ以外から2件を選出
- fortune（/play/daily）は固定枠として常に1件含める（毎日更新コンテンツのリピート促進にも寄与）
- 残り1件はpersonalityまたはknowledgeからkeywords重複ベースで選出
- 既存の`getRecommendedContents()`関数のロジックを流用可能

**配置の根拠**: `NextGameBanner`の後に配置する理由は、ゲーム完了者の第一関心は「他のゲーム」（NextGameBanner）であり、それを確認した後に「ゲーム以外もある」という発見を提供する流れが自然であるため。`CountdownTimer`の後・`NextGameBanner`の前に配置するとゲームの文脈が途切れてしまう。

**Client Component としての実装とデータ取得（指摘9対応）**: ResultModalはClient Component（`"use client"`）のため、CrossCategoryBannerもClient Componentとして実装する。推薦データはビルド時に決定可能（ランダム要素なし）なので、コンポーネント内でレジストリ（`playContentBySlug`、`getPlayContentsByCategory`等）を直接importして推薦コンテンツを算出する。**これは`NextGameBanner`の既存パターンと同一であり**、NextGameBannerも`allGameMetas`をClient Componentから直接importしている（`src/play/games/shared/_components/NextGameBanner.tsx`参照）。レジストリモジュール（`src/play/registry.ts`、`src/play/games/registry.ts`）はClient Componentからimportされた場合、そのモジュール全体がクライアントバンドルに含まれる。`src/play/registry.ts`は既に`NextGameBanner`経由で間接的にクライアントバンドルに含まれているため、CrossCategoryBannerによるバンドルサイズの追加増加は軽微である。

**影響ファイル**:

- 新規: `src/play/games/shared/_components/CrossCategoryBanner.tsx` -- コンポーネント本体
- 新規: `src/play/games/shared/_components/CrossCategoryBanner.module.css` -- スタイル
- `src/play/games/kanji-kanaru/_components/ResultModal.tsx` -- CrossCategoryBanner追加
- `src/play/games/irodori/_components/ResultModal.tsx` -- CrossCategoryBanner追加
- `src/play/games/yoji-kimeru/_components/ResultModal.tsx` -- CrossCategoryBanner追加
- `src/play/games/nakamawake/_components/ResultModal.tsx` -- CrossCategoryBanner追加

---

## 施策4: /play/dailyのリピート来訪促進 + SERP最適化

### 来訪者にとっての価値

「今日の運勢」を見た来訪者が、明日も来るための具体的な手段（ブックマーク登録）を案内されることで、「毎朝チェックする楽しみ」を継続しやすくなる。

### 現状の問題（ジャーニーマップ サブシナリオ1-B、横断的問題点0-Cより）

- リピート来訪を促す施策が`<p className={styles.comeback}>明日も来てね! 毎日運勢が変わります</p>`のテキスト表示のみ
- ブックマーク登録を促す明示的なCTA・習慣化強化施策が未実装
- 1回限りの来訪に留まらず「毎朝チェックする習慣」として定着させられれば、単発PVではなく継続的PV基盤になる
- /play/dailyはplay系コンテンツの中で最もRecommendedContentへの到達可能性が「高い」構造（技術検証より）であり、ここからの回遊が最も機能しやすい

### 改善設計: comebackテキストの強化 + ブックマーク促進CTA

**変更前のDailyFortuneCard末尾**:

```
ShareButtons
p.comeback「明日も来てね! 毎日運勢が変わります」
```

**変更後**:

```
ShareButtons
div.repeatSection
  p.comeback「明日も来てね! 毎日運勢が変わります」
  BookmarkPrompt <- 新規追加
```

**BookmarkPrompt コンポーネント設計（指摘6対応）**:

モバイルでの「ホーム画面に追加」手順はブラウザごとに大きく異なる（iOSのSafariは共有メニューから、AndroidのChromeは三点メニューから、等）。ブラウザ別の詳細手順を記載するとメンテナンスが困難になり、ブラウザ更新で内容が不正確になるリスクもある。

このため、モバイルでは**具体的な手順ではなく、動機付けと簡潔な案内テキスト**に留める:

```
div.bookmarkPrompt
  p.promptText「毎朝の運勢チェックを習慣にしよう」
  p.promptInstruction（デバイスに応じた案内テキスト）
    モバイル: 「ブラウザのメニューからブックマーク登録すると、すぐに開けます」
    デスクトップ: 「Ctrl+D（Mac: Cmd+D）でブックマークに追加できます」
```

**PWA `beforeinstallprompt` について**: 現在のプロジェクトにはWeb App Manifest（`manifest.json`）もService Workerも存在しない。PWA対応を行えば`beforeinstallprompt`イベントを通じてネイティブのインストールプロンプトを表示でき、ブラウザ差異の問題を根本的に解決できるが、PWA対応は本設計書のスコープ外である（Manifest作成、Service Worker実装、アイコン準備等が必要）。将来的にPWA対応を行う際には、BookmarkPromptをPWAインストールプロンプトに差し替えることを推奨する。

**デバイス判定**: CSS media queryで出し分ける方式が最もシンプル。`(hover: none) and (pointer: coarse)`でモバイル向け、`(hover: hover)`でデスクトップ向けの案内テキストを表示する。

**プッシュ通知やSNSフォロー誘導について**: Service WorkerベースのWebプッシュ通知は、ユーザーに明確な許可を求める必要があり、初回来訪者には心理的ハードルが高い。SNSアカウント運営も継続的なリソースが必要。現時点ではブックマーク促進のみに絞り、来訪者に不必要な負荷をかけない設計とする。

**影響ファイル**:

- `src/play/fortune/_components/DailyFortuneCard.tsx` -- comebackセクションの構造変更
- 新規: `src/play/fortune/_components/BookmarkPrompt.tsx` -- ブックマーク促進コンポーネント
- 新規: `src/play/fortune/_components/BookmarkPrompt.module.css` -- スタイル
- `src/play/fortune/_components/DailyFortuneCard.module.css` -- repeatSectionのスタイル追加

### /play/dailyのSERP最適化

ジャーニーマップのサブシナリオ1-Bでは、習慣型ユーザーが「今日の運勢」で再検索して戻るパターンが想定されている。現在のメタデータ:

```
title: "今日のユーモア運勢 | yolos.net"
description: "毎日変わるユーモア運勢占い。斜め上のラッキーアイテムと達成困難なアクション付き。"
```

改善案:

```
title: "今日の運勢 - 毎日変わるユーモア占い | yolos.net"
description: "毎日更新のユーモア運勢占い。今日の運勢をチェックして、斜め上のラッキーアイテムと達成困難なアクションを楽しもう。登録不要・無料。"
```

変更理由:

- 「今日の運勢」をtitle冒頭に移動し、検索クエリとの一致度を高める
- descriptionに「毎日更新」「登録不要・無料」を追加し、ターゲットユーザーの検索意図（手軽に無料で楽しめる）に合致させる

**影響ファイル**:

- `src/app/play/daily/page.tsx` -- metadata定数の更新

---

## 施策5: シェアテキスト最適化

### 来訪者にとっての価値

SNSでシェアされたコンテンツを見た人が「面白そう」「自分もやってみたい」と感じてクリックする確率を高める。シェアしたユーザー自身にとっても、「面白いものを見つけた」というイメージを友人に伝えやすくなる。

### 上流からの要求（ジャーニーマップ 横断的問題点0-B）

> シェアテキストをターゲットユーザーが拡散したくなる内容に最適化

SNSバイラルはplay系コンテンツの最も自然な成長ドライバーであり、シェアテキストの質はバイラル効果を左右する重要な要素である。

### 現状の確認と設計方針

現在のシェアテキストは各コンテンツのShareButtonsコンポーネントに渡される`title`プロパティによって決定される。具体的な最適化内容（各コンテンツのシェアテキスト案）は、本設計書のスコープでは方針のみを定め、実装時に各コンテンツの結果データを確認した上で個別に最適化する。

**方針**:

- personality系: 結果タイプ名を含める（例: 「私は"情熱のハーモニスト"タイプでした」）
- knowledge系: スコアを含める（例: 「漢字レベル診断で"達人レベル"でした!」）
- game系: 結果を含める（例: 「漢字カナール 3/6で正解!」） -- 既にGameShareButtonsで実装済みの可能性あり
- fortune系: 今日の運勢タイトルを含める

**影響ファイル**: 実装時に特定する。ShareButtonsに渡すtitleプロパティの変更、またはシェアテキスト生成ロジックの追加が必要。

---

## 施策6: 静的結果ページの訴求強化

### 来訪者にとっての価値

SNSでシェアリンクを見てクリックした人が、「これは何のクイズか」「自分もやるとどのくらいかかるか」を瞬時に理解でき、「自分もやってみよう」と判断するための情報が揃っている。

### 現状の問題（技術検証より）

静的結果ページ（`/play/[slug]/result/[resultId]`）の構造:

```
div.card
  アイコン
  h1（結果タイトル）
  p.quizName（「{クイズ名}の結果」）
  p.description（結果説明文）
  Link.tryButton「あなたも挑戦してみる?」<- コスト感情報なし
  ShareButtons
  CompatibilityDisplay（条件付き）
RelatedQuizzes
RecommendedContent
```

問題点:

- CTAボタン「あなたも挑戦してみる?」にコスト感の訴求（問数・所要時間・登録不要）が含まれていない
- クイズの概要説明（introフェーズの説明文）がなく、SNS来訪者はクイズの内容を理解できない
- CTAテキストがニュートラルであり、SNS来訪者特有の「友達と比較したい」心理を活用していない

### 改善設計: CTA周辺の情報補完

**変更後の構造**:

```
div.card
  アイコン
  h1（結果タイトル）
  p.quizName（「{クイズ名}の結果」）
  p.description（結果説明文）
  div.trySection <- 新規ラッパー
    Link.tryButton「あなたはどのタイプ? 診断してみよう」<- 文言改善
    p.tryCost「全{questionCount}問 / 登録不要」<- 新規追加
  ShareButtons
  CompatibilityDisplay（条件付き）
RelatedQuizzes
RecommendedContent
```

**文言の改善**:

- 変更前: 「あなたも挑戦してみる?」
- 変更後（personalityタイプ）: 「あなたはどのタイプ? 診断してみよう」
- 変更後（knowledgeタイプ）: 「あなたも挑戦してみよう」
- ベストプラクティスの知見: 「自分もやってみる」より「私の結果を見る」の方が個人化されて効果的。personalityタイプでは「あなたはどのタイプ?」という問いかけで社会的比較欲求を刺激する

**コスト感情報の表示（指摘11対応）**: `quizBySlug.get(slug)`から`quiz.meta.questionCount`と`quiz.meta.type`を取得し、問数を表示する。所要時間の推定（「約X分」）については、personalityは問数x15秒、knowledgeは問数x20秒という推定ロジックの根拠が不十分であり（実際の所要時間は読解速度、悩む時間、knowledge型では解説を読む時間等によって大きく変動する）、不正確な時間表示はユーザーの信頼を損なう可能性がある。このため、所要時間の推定は表示せず、**「全{questionCount}問 / 登録不要」のみ**を表示する。問数があれば来訪者はおおよその時間感を推測でき、「登録不要」は心理的ハードルを下げる効果がある。

**影響ファイル**:

- `src/app/play/[slug]/result/[resultId]/page.tsx` -- CTA周辺の構造変更
- `src/app/play/[slug]/result/[resultId]/page.module.css` -- trySectionのスタイル追加

---

## 実装順序と依存関係

```
施策1（非play系からの導線）
  |-- 1-A: ブログ記事ページ -- 独立して実装可能
  `-- 1-B: 辞典ページ -- 1-Aのコンポーネント完了後に詳細設計・実装

施策2（回遊導線再設計 + ShareButtons確認）-- 独立して実装可能

施策3（ゲームモーダル導線）-- 独立して実装可能

施策4（リピート来訪促進 + SERP最適化）-- 独立して実装可能

施策5（シェアテキスト最適化）-- 独立して実装可能

施策6（静的結果ページ）-- 独立して実装可能
```

施策1-A、施策2、施策3、施策4、施策5、施策6はすべて独立して並行実装可能。施策1-Bは施策1-Aで作成した`PlayRecommendBlock`コンポーネントを流用するため、1-A完了後に実施する。

### 推奨実装順序

1. **施策1-A + 施策4を並行着手**:
   - 施策1-A（ブログからの導線）: 最大の来訪者母数（93PV中のブログ分）を活用でき、即効性が最も高い
   - 施策4（リピート促進 + SERP最適化）: 実装コストが極めて低く（BookmarkPromptは小さなClient Component、SERP最適化はmetadata定数の変更のみ）、施策1-Aと並行して着手可能。SERP最適化は検索流入増加に直結するため、インデックスへの反映を早めるメリットがある
2. **施策2**（回遊導線 + ShareButtons確認）: 施策1で流入が増えた際に回遊改善の効果が最大化される
3. **施策5**（シェアテキスト最適化）: 施策2のShareButtons確認と合わせて実施すると効率的
4. **施策3**（ゲームモーダル）: ゲーム完了者の回遊。流入増加後に効果が顕在化
5. **施策6**（静的結果ページ）: SNSシェア経由の来訪は現状ゼロだが、シェアが発生した際のコンバージョン基盤
6. **施策1-B**（辞典からの導線）: 1-Aのコンポーネント流用。詳細設計は1-A完了後

---

## 新規作成コンポーネント一覧

| コンポーネント名    | パス                                                        | 種別   | 用途                                         |
| ------------------- | ----------------------------------------------------------- | ------ | -------------------------------------------- |
| PlayRecommendBlock  | `src/play/_components/PlayRecommendBlock.tsx`               | Server | ブログ・辞典ページからplay系への推薦ブロック |
| ResultNextContent   | `src/play/quiz/_components/ResultNextContent.tsx`           | Client | クイズ結果画面直下の回遊導線                 |
| CrossCategoryBanner | `src/play/games/shared/_components/CrossCategoryBanner.tsx` | Client | ゲーム完了モーダル内の他カテゴリ導線         |
| BookmarkPrompt      | `src/play/fortune/_components/BookmarkPrompt.tsx`           | Client | /play/dailyのブックマーク促進CTA             |

## 既存ファイルの変更一覧

| ファイル                                                  | 変更内容                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/app/blog/[slug]/page.tsx`                            | PlayRecommendBlockの配置追加                                               |
| `src/play/quiz/_components/QuizContainer.tsx`             | ResultNextContent配置、推薦データのprops追加（`QuizContainerProps`型拡張） |
| `src/app/play/[slug]/page.tsx`                            | QuizContainerへの推薦データprops追加                                       |
| `src/play/games/kanji-kanaru/_components/ResultModal.tsx` | CrossCategoryBanner追加                                                    |
| `src/play/games/irodori/_components/ResultModal.tsx`      | CrossCategoryBanner追加                                                    |
| `src/play/games/yoji-kimeru/_components/ResultModal.tsx`  | CrossCategoryBanner追加                                                    |
| `src/play/games/nakamawake/_components/ResultModal.tsx`   | CrossCategoryBanner追加                                                    |
| `src/play/fortune/_components/DailyFortuneCard.tsx`       | comeback部分の構造変更、BookmarkPrompt追加                                 |
| `src/app/play/daily/page.tsx`                             | metadata定数の更新                                                         |
| `src/app/play/[slug]/result/[resultId]/page.tsx`          | CTA文言改善、コスト感情報追加                                              |
| `src/play/recommendation.ts`                              | ブログタグベースの推薦関数追加                                             |

---

## 品質基準

各施策の実装完了時に以下を確認する:

1. **視覚的確認**: Playwright等でモバイル（360px幅）とデスクトップ（1280px幅）の両方で、新規追加コンポーネントが意図した位置に表示され、既存レイアウトを破壊していないことを目視確認
2. **ナビゲーション確認**: 新規追加したリンクが正しい遷移先に到達すること
3. **レスポンシブ確認**: モバイルでカードが横幅をはみ出さず、タップターゲットが十分な大きさ（44x44px以上）であること
4. **アクセシビリティ**: aria-label、見出しレベルの適切性、キーボードナビゲーション対応
5. **テスト**: 推薦ロジック（recommendation.ts の新規関数）にユニットテストを追加
