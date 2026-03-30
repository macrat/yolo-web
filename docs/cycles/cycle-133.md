---
id: 133
description: "play系コンテンツ内の回遊導線再設計（クイズ結果後の推薦配置改善・静的結果ページCTA改善・ゲームResultModalへのCrossCategoryBanner追加）"
started_at: "2026-03-30T14:34:32+0900"
completed_at: "2026-03-30T17:10:04+0900"
---

# サイクル-133

B-231の分析とB-233の導線追加を踏まえ、play系コンテンツ内部の回遊導線を再設計する。設計書 `docs/2026-03-29-play-navigation-redesign.md` の施策2・3・6に基づき、(1) クイズ結果表示後にResultNextContentコンポーネントを新規作成してResultCard直下に配置、(2) ゲームResultModal内にCrossCategoryBannerを追加して他カテゴリへの導線を新設、(3) 静的結果ページのCTAにコスト感訴求を追加し文言を改善する。

## 実施する作業

- [x] 1. 施策2: ResultNextContentコンポーネント新規作成・推薦ロジック実装・QuizContainer統合
- [x] 2. 施策3: CrossCategoryBannerコンポーネント新規作成・4ゲームのResultModalに配置
- [x] 3. 施策6: 静的結果ページのCTA改善（コスト感訴求・文言改善）
- [x] 4. ビジュアル確認（Playwright）
- [x] 5. レビュー・修正

## 作業計画

### 目的

play系コンテンツを楽しんだ来訪者が、プレイ完了直後の好奇心が最も高い瞬間に「次も面白そう」と思えるコンテンツを即座に発見できるようにする。具体的には以下の3つの課題を解決する:

1. **クイズ結果後の回遊導線不在**: 現在、RelatedQuizzes/RecommendedContentはFAQ・ShareButtonsの下に埋もれており到達可能性が極めて低い。ResultCard直下に回遊導線を挿入し、結果確認直後に次のコンテンツを提示する。
2. **ゲーム完了時の他カテゴリ導線ゼロ**: ResultModal内にはNextGameBanner（同カテゴリのゲームのみ）しかなく、診断・占いへの経路が存在しない。CrossCategoryBannerを追加して他カテゴリのコンテンツを発見できるようにする。
3. **静的結果ページの訴求不足**: SNSシェアリンク経由の来訪者が見るCTAにコスト感情報がなく、クイズタイプに応じた文言の最適化もされていない。問数・登録不要の訴求とタイプ別文言を追加する。

### 作業内容

#### タスク1: 施策2 -- ResultNextContentコンポーネント新規作成とQuizContainer統合

##### 1-1. 推薦ロジックの実装（`src/play/recommendation.ts` に追加）

新規関数を追加する。

**関数シグネチャ:**

```
export function getResultNextContents(slug: string): PlayContentMeta[]
```

**ロジック:**

1. `playContentBySlug.get(slug)` で現在のコンテンツを取得する。取得できない場合は空配列を返す。
2. 同カテゴリから1件を選出: `getPlayContentsByCategory(currentContent.category)` から `currentSlug` を除外し、keywords重複が最大の1件を選出する。既存の `selectBestFromCategory()` は現在 `currentContent` 自身を除外していないが、`selectBestFromCategory` は他カテゴリ用のため、同カテゴリ用の選出には `getPlayContentsByCategory` + フィルタリング + keywords重複スコアリングで独自に実装する。
3. 異カテゴリから2件を選出: 既存の `getRecommendedContents(slug)` を呼び出して最大3件取得し、先頭2件を採用する。「先頭」の定義は `getRecommendedContents` の返却配列順であり、これは `ALL_CATEGORIES` 定義順（fortune -> personality -> knowledge -> game）のうち自カテゴリを除いた順序で各カテゴリからベスト1件ずつ選出された結果である。
4. 合計件数:
   - 同カテゴリから1件選出できた場合: 異カテゴリの先頭2件と合わせて **合計3件** とする。
   - 同カテゴリから選出できなかった場合（同カテゴリに他コンテンツが存在しない等）: 異カテゴリの先頭2件のみで **合計2件** とする。
5. 決定的な関数（ランダム要素なし）。

**注意点:**

- `selectBestFromCategory()` は `recommendation.ts` のモジュール内部関数（非export）だが、同ファイル内に新関数を追加するため直接呼び出せる。ただし同カテゴリ用には current を除外する必要があるため、`selectBestFromCategory` をそのまま使うのではなく、カテゴリ内フィルタリング + スコアリングの独自ロジックを組む。
- `countKeywordOverlap()` も同ファイル内の内部関数なのでそのまま再利用する。

**テスト（`src/play/__tests__/recommendation.test.ts` に追記）:**

- 存在するslugで2-3件のコンテンツが返ること
- 返却に自分自身（currentSlug）が含まれないこと
- 同カテゴリから最大1件、異カテゴリから1-2件が含まれること
- 存在しないslugで空配列が返ること
- 返却に重複がないこと

##### 1-2. ResultNextContentコンポーネント新規作成

**新規ファイル:** `src/play/quiz/_components/ResultNextContent.tsx`

- Client Component（`"use client"`）。QuizContainer（Client Component）の子として描画されるため。
- ただしロジックは持たず、propsで受け取ったデータを表示するだけの純粋な表示コンポーネント。

**Props:**

```
interface ResultNextContentProps {
  contents: PlayContentMeta[];
}
```

**HTML構造:**

```
section[aria-label="次のおすすめ"]
  h3「次はこれを試してみよう」
  ul（カード2-3件、縦並び）
    li
      Link -> getContentPath(content)
        span.icon[aria-hidden="true"]（content.icon）
        div.info
          span.title（content.shortTitle ?? content.title）
          span.meta（コスト感情報 -- 後述）
          span.badge[data-category={content.category}]（resolveDisplayCategory(content)）
```

**コスト感情報の表示ロジック:**

`ResultNextContent` はClient Componentのため、`quizQuestionCountBySlug` と `DAILY_UPDATE_SLUGS` を `src/play/registry.ts` から直接importして使用する。これは `NextGameBanner` が `allGameMetas` をClient Componentから直接importしているパターンと同一であり、registry.tsは既にクライアントバンドルに含まれている。

- `quizQuestionCountBySlug.get(content.slug)` が数値を返す場合: 「全{count}問」
- `DAILY_UPDATE_SLUGS.has(content.slug)` が true の場合: 「毎日更新」
- 上記いずれにも該当しない場合: `resolveDisplayCategory(content)` の結果（「パズル」「診断」等）

**見出しレベルがh3の理由:** page.tsxにはh1（Breadcrumb上部やクイズタイトル相当）があり、ResultCard内にもh2レベルの見出しがある。ResultNextContentはResultCardの補助的な導線であり、h3が適切。

**スタイル方針（`src/play/quiz/_components/ResultNextContent.module.css` 新規作成）:**

- 既存の `RecommendedContent.module.css` と `RelatedContentCard.module.css` のスタイルパターンを参考にする
- カードは縦並び（1カラム）、各カードにアイコン + テキスト情報を水平配置
- content.accentColor は使用しない（QuizContainer内のResultCardと統一感を持たせるため、ニュートラルなスタイルにする）
- カテゴリバッジは `data-category` 属性でスタイルを分ける（RecommendedContentと同パターン）
- コンパクトに表示し、ResultCard直下で邪魔にならないサイズ感にする

**アクセシビリティ:**

- `section` 要素に `aria-label="次のおすすめ"` を設定
- アイコン絵文字に `aria-hidden="true"` を設定（装飾的要素）
- リンクテキストは title + badge で十分にdescriptive
- contentsが空配列の場合は `null` を返す（セクション自体を非表示）

**テスト（`src/play/quiz/_components/__tests__/ResultNextContent.test.tsx` 新規作成）:**

- 2-3件のコンテンツで正しくレンダリングされること（section, h3, リンク）
- 各カードにアイコン、タイトル、コスト感情報、カテゴリバッジが表示されること
- 空配列の場合にnullが返ること
- リンク先が getContentPath() の結果と一致すること
- aria-label が設定されていること

##### 1-3. QuizContainerのprops拡張と配置

**変更ファイル:** `src/play/quiz/_components/QuizContainer.tsx`

**変更内容:**

1. `QuizContainerProps` 型に `recommendedContents?: PlayContentMeta[]` を追加する。オプショナルにすることで、推薦データがないケース（将来の安全策）にも対応する。
2. resultフェーズのJSXで、`ResultCard` と `ResultExtraLoader` の間に `ResultNextContent` を挿入する:

```
変更前:
  <ResultCard ... />
  <ResultExtraLoader ... />

変更後:
  <ResultCard ... />
  {recommendedContents && recommendedContents.length > 0 && (
    <ResultNextContent contents={recommendedContents} />
  )}
  <ResultExtraLoader ... />
```

3. `ResultNextContent` のimportを追加する。

**PlayContentMetaのシリアライズ:** PlayContentMetaの全フィールドは文字列・数値のプレーンオブジェクトであり、Server Component -> Client Component間のReact Server Components Payloadとして問題なくシリアライズされる。

##### 1-4. page.tsxでの推薦データ算出

**変更ファイル:** `src/app/play/[slug]/page.tsx`

**変更内容:**

1. `getResultNextContents` を `@/play/recommendation` からimportする。
2. Server Component内で推薦データを算出: `const resultNextContents = getResultNextContents(slug);`
3. `QuizContainer` に `recommendedContents={resultNextContents}` を追加する。

**ページ下部のRelatedQuizzes/RecommendedContentはそのまま残す。** 理由: SEOのためのリンク構造として有用。ユーザー導線としてはResultNextContentが担う。ResultNextContentとRelatedQuizzes/RecommendedContentの重複リンクは意図的に許容する（設計書の指摘12対応に基づく）。

##### 1-5. ShareButtonsファーストビュー確認

Playwrightでモバイル360px幅・デスクトップ1280px幅の両方でスクリーンショットを取得し、ResultCard内のShareButtonsがファーストビュー内に収まっていることを検証する（設計書の指摘1対応）。はみ出している場合はResultCard内のレイアウト調整を本タスクに含める。

---

#### タスク2: 施策3 -- CrossCategoryBannerコンポーネント新規作成と4ゲームのResultModalに配置

##### 2-1. CrossCategoryBannerコンポーネント新規作成

**新規ファイル:** `src/play/games/shared/_components/CrossCategoryBanner.tsx`

- Client Component（`"use client"`）。ResultModalはClient Componentのため。
- NextGameBannerと同じパターンで、レジストリを直接importしてコンポーネント内で推薦データを算出する。

**Props:**

```
interface CrossCategoryBannerProps {
  currentGameSlug: string;
}
```

**推薦ロジック（コンポーネント内で算出）:**

1. `playContentBySlug` と `getPlayContentsByCategory` を `@/play/registry` からimportする。
2. fortune（/play/daily）を固定枠として1件確保: `playContentBySlug.get("daily")` で取得。
3. 残り1件を personality または knowledge カテゴリから選出:
   - `playContentBySlug.get(currentGameSlug)` で現在のゲームのメタデータを取得する。
   - `getPlayContentsByCategory("personality")` と `getPlayContentsByCategory("knowledge")` を結合する。
   - 現在のゲームの keywords との重複が最大のコンテンツを1件選出する。重複が同数の場合は配列順の先頭を優先。
   - **keywords重複計算はコンポーネント内にインラインで実装する。** `countKeywordOverlap` は `recommendation.ts` のモジュール内部関数（非export）であり、recommendation.tsをClient Componentからimportするとバンドルサイズが不要に増加するため。`countKeywordOverlap` は4行程度の簡素な関数（2つのkeywords配列のSet交差を数えるだけ）なので、同等のロジックをCrossCategoryBanner内に直接記述する。
4. 合計2件を返す。fortuneが取得できない場合（将来的な削除への耐性）は personality/knowledge から2件。

**HTML構造:**

```
div.crossCategory
  p.label「他のコンテンツも試してみよう」
  div.linkList
    Link -> getContentPath(content)
      span.icon[aria-hidden="true"]
      span.title（content.shortTitle ?? content.title）
      span.badge[data-category={content.category}]（resolveDisplayCategory(content)）
```

**スタイル（`src/play/games/shared/_components/CrossCategoryBanner.module.css` 新規作成）:**

- NextGameBanner.module.css のスタイルトーンに合わせる（GameDialog内で統一感を持たせるため）
- コンパクトなリスト表示。NextGameBannerと同程度のサイズ感
- 上部にボーダーで視覚的区切りを入れ、NextGameBannerとの境界を明確にする

**アクセシビリティ:**

- リンクテキストは title + badge で十分にdescriptive
- アイコン絵文字に `aria-hidden="true"` を設定
- contentsが0件の場合は `null` を返す

**テスト（`src/play/games/shared/_components/__tests__/CrossCategoryBanner.test.tsx` 新規作成）:**

- 指定したゲームslugで2件のコンテンツが表示されること
- fortune（daily）が必ず含まれること
- 自分自身（currentGameSlug）が含まれないこと
- game カテゴリのコンテンツが含まれないこと
- リンク先が正しいパスであること

##### 2-2. 4ゲームのResultModalにCrossCategoryBannerを追加

以下の4ファイルに同一の変更を適用する:

1. `src/play/games/kanji-kanaru/_components/ResultModal.tsx` -- L104の `<NextGameBanner>` の直後、`</GameDialog>` の直前に追加
2. `src/play/games/irodori/_components/ResultModal.tsx` -- L73の `<NextGameBanner>` の直後、`</GameDialog>` の直前に追加
3. `src/play/games/yoji-kimeru/_components/ResultModal.tsx` -- L93の `<NextGameBanner>` の直後、`</GameDialog>` の直前に追加
4. `src/play/games/nakamawake/_components/ResultModal.tsx` -- L88の `<NextGameBanner>` の直後、`</GameDialog>` の直前に追加

**各ファイルの変更内容:**

- `CrossCategoryBanner` のimportを追加
- `<NextGameBanner currentGameSlug="..." />` の直後に `<CrossCategoryBanner currentGameSlug="..." />` を追加（slugはNextGameBannerと同じ値を使用）

---

#### タスク3: 施策6 -- 静的結果ページのCTA改善

##### 3-1. CTA文言の改善とコスト感訴求の追加

**変更ファイル:** `src/app/play/[slug]/result/[resultId]/page.tsx`

**変更内容:**

1. CTAテキストをクイズタイプに応じて出し分ける。既存コードと同じく `quiz.meta.type` を使用してタイプを判定する:
   - `quiz.meta.type === "personality"` の場合: 「あなたはどのタイプ? 診断してみよう」
   - `quiz.meta.type === "knowledge"` の場合: 「あなたも挑戦してみよう」

2. CTAボタンの直下にコスト感情報を追加:
   - `quiz.meta.questionCount` でクイズの問数を取得する（QuizMetaの型フィールド）
   - テキスト: 「全{questionCount}問 / 登録不要」

3. JSXの変更:

```
変更前:
  <Link href={...} className={styles.tryButton} style={...}>
    あなたも挑戦してみる?
  </Link>

変更後:
  <div className={styles.trySection}>
    <Link href={...} className={styles.tryButton} style={...}>
      {quiz.meta.type === "personality"
        ? "あなたはどのタイプ? 診断してみよう"
        : "あなたも挑戦してみよう"}
    </Link>
    <p className={styles.tryCost}>
      全{quiz.meta.questionCount}問 / 登録不要
    </p>
  </div>
```

##### 3-2. スタイルの追加

**変更ファイル:** `src/app/play/[slug]/result/[resultId]/page.module.css`

**追加するクラス:**

- `.trySection`: マージン設定（既存の`.tryButton`の外側ラッパー）
- `.tryCost`: コスト感テキストのスタイル（小さめフォント、mutedカラー、上部に少マージン）

**既存クラスへの影響:**

- `.tryButton` のスタイルは変更しない（display: inline-block, padding, border-radius等はそのまま維持）

**テスト方針:**

- 静的結果ページはServer Componentのため、コンポーネントテストではなくPlaywrightによるビジュアル確認で検証する。
- personalityタイプとknowledgeタイプの両方のURLでCTAテキストが正しく表示されることを確認する。

---

#### タスク4: ビジュアル確認（Playwright）

以下の画面をモバイル（360px幅）とデスクトップ（1280px幅）の両方でスクリーンショットを取得し確認する:

1. **施策2の確認**: クイズ結果画面（例: `/play/animal-personality`）でResultCard直下にResultNextContentが表示されること。ShareButtonsがファーストビュー内に収まっていること。
2. **施策3の確認**: ゲーム完了モーダル（例: `/play/kanji-kanaru`）でNextGameBannerの後にCrossCategoryBannerが表示されること。モーダル内でスクロール可能であること。
3. **施策6の確認**: 静的結果ページ（personalityタイプとknowledgeタイプ各1件）でCTA文言が正しく表示され、コスト感情報が見やすいこと。

### 検討した他の選択肢と判断理由

#### 施策2: 推薦データの算出箇所

**選択肢A（採用）: page.tsx（Server Component）で算出してpropsでQuizContainerに渡す**

- 利点: Server Componentで完結するためクライアントバンドルに推薦ロジックが含まれない。QuizContainerのprops変更は最小限。
- 欠点: QuizContainerPropsの型拡張が必要。

**選択肢B: ResultNextContent内で直接レジストリをimportして算出する（NextGameBannerパターン）**

- 利点: page.tsxとQuizContainerの変更が不要。
- 欠点: recommendation.tsの推薦ロジック（getRecommendedContents等）がクライアントバンドルに含まれる。registry.tsは既にバンドルに含まれているが、recommendation.tsまで含めるのは不要な増加。

選択肢Aを採用した理由: 設計書が明示的にServer Component -> props方式を指定しており、クライアントバンドルサイズの増加を避けられるため。

#### 施策2: RelatedQuizzes/RecommendedContentの移動 vs ResultNextContent新設

**選択肢A: 既存のRelatedQuizzes/RecommendedContentをFAQ前に移動する**

- 利点: 新規コンポーネント不要。
- 欠点: Server Component（RelatedQuizzes/RecommendedContent）をClient Component（QuizContainer）の子にすることはできない。CSS表示制御でresultフェーズのみ表示する方式は複雑になる。

**選択肢B（採用）: ResultNextContent新規作成でResultCard直下に配置**

- 利点: Client Component内に自然に配置できる。既存コンポーネントに影響しない。表示件数（2-3件）や見出し文言を回遊導線に最適化できる。
- 欠点: 新規コンポーネントの作成が必要。

選択肢Bを採用した理由: 設計書が明示的にResultNextContent新設を指定しており、Server/Client Component境界の問題を回避できるため。

#### 施策3: 推薦データの算出方式

**選択肢A（採用）: コンポーネント内でレジストリを直接importして算出**

- 利点: NextGameBannerと同じパターン。各ResultModalにpropsを追加する必要がない。4ファイルへの変更が最小限（import + 1行追加のみ）。
- 欠点: クライアントバンドルにregistry.tsが含まれるが、NextGameBanner経由で既に含まれているため追加増加は軽微。

**選択肢B: 各ゲームのpage.tsxで算出してResultModalにpropsで渡す**

- 利点: クライアントバンドルの推薦ロジック含まれない。
- 欠点: 4つのpage.tsx + 4つのResultModal + 中間コンポーネントのpropsバケツリレーが必要。変更ファイル数が大幅に増加。

選択肢Aを採用した理由: 設計書が明示的にNextGameBannerパターン（Client Componentからレジストリ直接import）を指定しており、変更の影響範囲を最小限に抑えられるため。

#### 施策6: 所要時間の表示

**選択肢A: 「全{questionCount}問 / 約{estimatedMinutes}分 / 登録不要」と表示**

- 欠点: 所要時間の推定根拠が不十分（読解速度、悩む時間等で大きく変動）。不正確な時間表示はユーザーの信頼を損なう。

**選択肢B（採用）: 「全{questionCount}問 / 登録不要」のみ表示**

- 利点: 問数があればユーザーはおおよその時間感を推測できる。「登録不要」は心理的ハードルを下げる効果がある。
- 設計書の指摘11対応に基づく判断。

### 計画にあたって参考にした情報

- **設計書**: `docs/2026-03-29-play-navigation-redesign.md` の施策2（L177-278）、施策3（L282-354）、施策6（L469-530）
- **既存推薦ロジック**: `src/play/recommendation.ts` -- `getRecommendedContents()`, `countKeywordOverlap()`, `selectBestFromCategory()` の実装パターン
- **既存推薦表示コンポーネント**: `src/play/_components/RecommendedContent.tsx` -- HTML構造・スタイルパターンの参考
- **既存ゲーム導線コンポーネント**: `src/play/games/shared/_components/NextGameBanner.tsx` -- Client Componentからレジストリ直接importするパターンの参考
- **クイズコンテナ**: `src/play/quiz/_components/QuizContainer.tsx` -- resultフェーズのJSX構造（L164-184）、QuizContainerPropsの型定義（L16-19）
- **静的結果ページ**: `src/app/play/[slug]/result/[resultId]/page.tsx` -- CTA部分のJSX（L173-190）、quiz.meta.type/questionCountの利用方法
- **4ゲームのResultModal**: kanji-kanaru(L104), irodori(L73), yoji-kimeru(L93), nakamawake(L88) -- NextGameBannerの配置位置
- **play系型定義**: `src/play/types.ts` -- PlayContentMetaの全フィールド定義
- **レジストリ**: `src/play/registry.ts` -- `quizQuestionCountBySlug`, `DAILY_UPDATE_SLUGS`, `playContentBySlug`, `getPlayContentsByCategory` のexport
- **パス生成**: `src/play/paths.ts` -- `getContentPath()`, `getPlayPath()` の使い分け
- **表示カテゴリ解決**: `src/play/seo.ts` -- `resolveDisplayCategory()` の実装
- **cycle-132の計画**: 前サイクルの計画フォーマット・詳細度を参考

## レビュー結果

### 計画のレビュー（R1〜R2）

- R1: 3件の指摘事項（CrossCategoryBannerのkeywords重複計算ロジック実装場所、getResultNextContentsの件数ロジック曖昧、quiz.meta.type使用の明記）→ plannerが修正
- R2: 指摘事項なし → 計画承認

### 成果物のレビュー（R1〜R2）

- R1: 1件指摘（computeCrossCategoryItemsのユニットテスト欠落）→ テスト新規作成（10件）で対応
- R2: 指摘事項なし → 承認

### バンドルサイズ対策（実装中の追加対応）

当初計画ではClient Componentから`@/play/registry`を直接importする方式（NextGameBannerパターン）を採用していたが、実装時にバンドルバジェットテストが失敗（140KB→297KB）。原因は全play系データがクライアントバンドルに含まれること。Server Componentで事前計算しprops経由で渡す方式に変更して解決。

## キャリーオーバー

なし

## 補足事項

なし

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
