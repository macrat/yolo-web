---
id: 132
description: "非play系ページ（ブログ・辞典）からplay系コンテンツへの文脈的導線を追加し、93PVの非play系来訪者をplay系に誘導する"
started_at: "2026-03-30T10:56:10+0900"
completed_at: null
---

# サイクル-132

B-231の分析で判明した最優先課題に対応する。サイト全体PVの大半を占める非play系ページ（ブログ・辞典）にplay系コンテンツへの導線がゼロであるため、文脈的関連性に基づくPlayRecommendBlockコンポーネントを新規作成し、ブログ記事ページと辞典詳細ページに配置する。設計書 `docs/2026-03-29-play-navigation-redesign.md` の施策1に基づく。

## 実施する作業

- [x] 1. 既存コードの調査（ブログ記事ページ、辞典詳細ページ、play系データ構造、推薦ロジック）
- [ ] 2. PlayRecommendBlockコンポーネントの設計・実装（推薦ロジック含む）
- [ ] 3. ブログ記事ページへのPlayRecommendBlock配置
- [ ] 4. 辞典詳細ページへのPlayRecommendBlock配置
- [ ] 5. ビジュアル確認（Playwright）
- [ ] 6. レビュー・修正

## 作業計画

### 目的

93PVの非play系来訪者（ブログ・辞典ページ）にplay系コンテンツの存在を自然に知ってもらい、play系ページへの流入を生み出す。記事テーマとの文脈的関連性に基づく推薦により、「押しつけがましい広告」ではなく「記事の延長として楽しめるコンテンツ」として体験される導線を構築する。

### 作業内容

#### タスク1: 推薦ロジックの拡張（`src/play/recommendation.ts`）

既存の `getRecommendedContents()` はplay系内部用（slugを受け取り、他カテゴリから3件選出）。今回は非play系ページ向けに2つの新関数を追加する。

**1-1. ブログ記事からの推薦関数**

- 関数名: `getPlayRecommendationsForBlog(tags: string[], category: string): PlayContentMeta[]`
- 入力: ブログ記事の `tags: string[]` と `category: string`
- ロジック:
  1. `allPlayContents` の各コンテンツについて、記事の `tags` と コンテンツの `keywords` のオーバーラップ数をスコアとして算出する（既存の `countKeywordOverlap()` を再利用）
  2. スコアが高い順にソートし、上位2件を選出する
  3. 同スコアの場合は `allPlayContents` の定義順（配列インデックスが小さい方）を優先する
  4. スコアが0件のコンテンツしかない場合（技術系記事など）: フォールバックとして `PLAY_FEATURED_ITEMS` の先頭2件の slug から `playContentBySlug` で取得して返す
  5. スコアが0より大きいコンテンツが1件のみの場合: その1件 + フォールバックから1件（重複を除く）で計2件にする
  6. 結果が0件の場合（将来的にplay系コンテンツが全削除された場合の安全策）: 空配列を返す（コンポーネント側で非表示にする）
- 戻り値: `PlayContentMeta[]`（0〜2件）
- 注意点: `category` はブログ記事のカテゴリ（"tech", "ai", "language" 等）であり、play系の `category`（"fortune", "personality" 等）とは異なる語彙空間。ブログカテゴリは直接マッチングには使わず、将来の拡張余地として引数に含める。現時点では `tags` のみでマッチングする

**1-2. 辞典テーマからの推薦関数**

- 関数名: `getPlayRecommendationsForDictionary(dictionarySlug: string): PlayContentMeta[]`
- 入力: 辞典の slug（"kanji" | "yoji" | "colors"）
- ロジック:
  1. 辞典slug → テーマキーワードのマッピングを定義する:
     - "kanji" → ["漢字"]
     - "yoji" → ["四字熟語"]
     - "colors" → ["伝統色", "色"]
  2. テーマキーワードを `tags` として扱い、`allPlayContents` の各コンテンツの `keywords` とのオーバーラップ数を算出する
  3. スコアが高い順にソートし、上位2件を選出する
  4. フォールバックロジックはブログと同一（`PLAY_FEATURED_ITEMS` の先頭2件）
- 戻り値: `PlayContentMeta[]`（0〜2件）
- 注意点: 辞典テーマはplay系keywordsと語彙が共通している（"漢字", "四字熟語", "伝統色" はplay系にも存在する）ため、フォールバックに頼る頻度はブログより低い

**1-3. 共通のフォールバックロジック**

- 内部関数: `getFallbackRecommendations(excludeSlugs: string[], count: number): PlayContentMeta[]`
- `PLAY_FEATURED_ITEMS` の slug 順に `playContentBySlug` からコンテンツを取得し、`excludeSlugs` に含まれないものを `count` 件返す
- `PLAY_FEATURED_ITEMS` は3件（contrarian-fortune, unexpected-compatibility, traditional-color）あるため、1件除外しても2件確保できる

**1-4. `PLAY_FEATURED_ITEMS` のエクスポート**

- 現在 `PLAY_FEATURED_ITEMS` は `src/play/registry.ts` で定義されている。recommendation.ts から参照するために、registry.ts から既にエクスポートされていることを確認する（現状 `export const` なのでエクスポート済み）

#### タスク2: PlayRecommendBlockコンポーネントの実装

**2-1. コンポーネント本体**

- ファイル: `src/play/_components/PlayRecommendBlock.tsx`（新規作成）
- Server Component（"use client" 不要）
- Props:
  ```
  interface PlayRecommendBlockProps {
    recommendations: PlayContentMeta[];
  }
  ```
- 推薦データの算出はコンポーネントの外（各page.tsx）で行い、コンポーネントには結果のみを渡す。これにより、コンポーネントがブログ/辞典どちらからも同一のインターフェースで使える
- recommendations が空配列の場合は `null` を返す（ブロック自体を非表示）
- HTML構造（設計書準拠）:
  ```
  nav[aria-label="関連する占い・診断"]
    h2「この記事を読んだあなたに」
    p（サブテキスト）「ブラウザで今すぐ遊べる診断・占い」
    ul（カード2件、縦並び）
      li
        Link -> /play/[slug]（getContentPath()を使用）
          span.icon（content.icon、aria-hidden="true"）
          div
            span.title（content.shortTitle ?? content.title）
            span.meta（コスト感情報 — 後述）
            span.description（content.shortDescription）
            span.cta（カテゴリ別CTAテキスト — 後述）
  ```

**2-2. カテゴリ別CTAテキスト**

- カテゴリとcontentTypeの組み合わせでCTAテキストを決定する:
  - fortune（contentType: "fortune"） → 「占ってみる」
  - personality（contentType: "quiz", category: "personality"） → 「診断してみる」
  - knowledge（contentType: "quiz", category: "knowledge"） → 「挑戦してみる」
  - game（contentType: "game"） → 「遊んでみる」
- 関数名の案: `getCtaText(meta: PlayContentMeta): string`（コンポーネント内のヘルパー関数）

**2-3. コスト感情報の表示**

- 来訪者が「これに何分かかるか」を判断できるようにする:
  - クイズ系（contentType: "quiz"）: `quizQuestionCountBySlug` から問数を取得し、「全X問」と表示する
  - デイリー系（`DAILY_UPDATE_SLUGS` に含まれるslug）: 「毎日更新」と表示する
  - 上記いずれにも該当しない場合: `resolveDisplayCategory()` の結果（「パズル」「診断」等）を表示する
- `quizQuestionCountBySlug` と `DAILY_UPDATE_SLUGS` は `src/play/registry.ts` からインポートする

**2-4. スタイル**

- ファイル: `src/play/_components/PlayRecommendBlock.module.css`（新規作成）
- 設計方針:
  - 既存の `RecommendedContent.module.css` のスタイルパターンを参考にしつつ、ブログ/辞典ページのデザイントーンに合うようにする
  - カードは縦並び（1カラム）で、各カードにアイコン・テキスト・CTAを水平配置
  - content.accentColor をカードの左ボーダーやアイコン背景に使用して視覚的アクセントを付ける
  - ブログ記事本文やRelatedArticlesとの視覚的な区切りを明確にする（上部にボーダーまたはパディング）
  - モバイル/デスクトップのレスポンシブ対応

**2-5. アクセシビリティ**

- `nav` 要素に `aria-label="関連する占い・診断"` を設定
- アイコン絵文字に `aria-hidden="true"` を設定（装飾的要素）
- リンクテキストは title + CTA で十分にdescriptive

#### タスク3: ブログ記事ページへの配置

- ファイル: `src/app/blog/[slug]/page.tsx`
- 変更内容:
  1. インポートを追加:
     - `PlayRecommendBlock` from `@/play/_components/PlayRecommendBlock`
     - `getPlayRecommendationsForBlog` from `@/play/recommendation`
  2. `BlogPostPage` コンポーネント内で推薦データを算出:
     - `const playRecommendations = getPlayRecommendationsForBlog(post.tags, post.category);`
  3. JSX内で `<RelatedArticles>` の直後、`</article>` の直前に配置:
     ```
     <RelatedArticles posts={relatedPosts} />
     <PlayRecommendBlock recommendations={playRecommendations} />
     ```
- 注意点: Server Componentのまま変更なし。推薦ロジックはビルド時に静的に評価される

#### タスク4: 辞典詳細ページへの配置

- **方法Aを採用する**: `DictionaryDetailLayout` に props を追加し、article内に配置する
- 理由: 方法B（articleの外側配置）は辞典の各page.tsxが `DictionaryDetailLayout` のみを返す構成のため、articleの外に配置するには各page.tsxの戻り値をフラグメントで囲む必要があり、レイアウトの一貫性が崩れる。方法Aならレイアウトコンポーネント内で一箇所変更するだけで全辞典に反映される

**4-1. DictionaryDetailLayout の変更**

- ファイル: `src/dictionary/_components/DictionaryDetailLayout.tsx`
- Props に追加:

  ```
  playRecommendations?: PlayContentMeta[];
  ```

  - オプショナルにすることで、PlayRecommendBlockを表示しない辞典ページ（一覧ページ等）でも互換性を維持する

- JSX内の配置位置: ShareButtons セクションの後、`</article>` の直前:
  ```
  <section className={styles.shareSection}>
    <ShareButtons ... />
  </section>
  {playRecommendations && playRecommendations.length > 0 && (
    <PlayRecommendBlock recommendations={playRecommendations} />
  )}
  ```

**4-2. 各辞典page.tsxの変更**

3つの辞典詳細ページそれぞれで推薦データを算出し、DictionaryDetailLayout に渡す:

- `src/app/dictionary/kanji/[char]/page.tsx`:
  - `getPlayRecommendationsForDictionary("kanji")` を呼び出し、`playRecommendations` props に渡す
- `src/app/dictionary/yoji/[yoji]/page.tsx`:
  - `getPlayRecommendationsForDictionary("yoji")` を呼び出し、`playRecommendations` props に渡す
- `src/app/dictionary/colors/[slug]/page.tsx`:
  - `getPlayRecommendationsForDictionary("colors")` を呼び出し、`playRecommendations` props に渡す

注意: 辞典の場合、同一辞典の全詳細ページで推薦結果が同一になる（例: 漢字辞典の全ページで同じ2件が推薦される）。これはテーマキーワードが辞典slug単位で固定のため意図通りの動作。

#### タスク5: テスト

**5-1. 推薦ロジックのユニットテスト**

- ファイル: `src/play/__tests__/recommendation.test.ts`（既存ファイルに追記）
- テストケース:
  - `getPlayRecommendationsForBlog`:
    - テーマ系タグ（"漢字", "四字熟語"等）を持つ記事で関連コンテンツが2件返ること
    - 技術系タグのみの記事でフォールバック（PLAY_FEATURED_ITEMS先頭2件）が返ること
    - タグが空配列の場合でもフォールバックが返ること
    - 返却件数が常に2件以下であること
    - 同一コンテンツが重複して返らないこと
  - `getPlayRecommendationsForDictionary`:
    - "kanji" で漢字関連のplay系コンテンツが推薦されること
    - "yoji" で四字熟語関連のplay系コンテンツが推薦されること
    - "colors" で伝統色関連のplay系コンテンツが推薦されること
    - 未知の辞典slugでフォールバックが返ること
    - 返却件数が常に2件以下であること

**5-2. PlayRecommendBlockのレンダリングテスト**

- ファイル: `src/play/_components/__tests__/PlayRecommendBlock.test.tsx`（新規作成）
- テストケース:
  - 2件の推薦データで正しくレンダリングされること（nav, h2, 2つのLink）
  - 各カードにアイコン、タイトル、説明、CTAが表示されること
  - 空配列を渡した場合にnullが返ること（何もレンダリングされない）
  - リンク先が正しいパスであること（getContentPathの結果と一致）
  - カテゴリ別のCTAテキストが正しいこと
  - aria-labelが設定されていること

### 検討した他の選択肢と判断理由

**辞典への配置方法（方法A vs 方法B）**

- 方法A（採用）: DictionaryDetailLayout に props を追加し、article 内に配置
  - 利点: レイアウトの一貫性維持、1ファイルの変更で全辞典に反映、articleタグ内に含まれるためセマンティクスが適切
  - 欠点: DictionaryDetailLayout の props が増える
- 方法B: 各辞典 page.tsx で DictionaryDetailLayout の外側に配置
  - 利点: DictionaryDetailLayout を変更しない
  - 欠点: 各page.tsxの戻り値をフラグメントで囲む必要があり構造が複雑化、articleタグの外に出るためセマンティクスが不適切

**推薦データの算出箇所（page.tsx vs コンポーネント内）**

- page.tsx で算出してpropsで渡す方式を採用
  - 理由: コンポーネントがブログ/辞典の両方から同一インターフェースで使えるようになり、テストもしやすい。コンポーネント内で算出すると、ブログ用/辞典用の分岐がコンポーネントに入り込み、関心の分離が崩れる

**ブログカテゴリのマッチング利用**

- 現時点では tags のみでマッチングし、ブログカテゴリは使わない
  - 理由: ブログカテゴリ（"tech", "ai" 等）とplay系keywords は語彙空間が完全に異なり、マッチングに使えない。将来、ブログカテゴリとplay系カテゴリのマッピングテーブルを作成する拡張の余地として引数には含めておく

### 計画にあたって参考にした情報

- 設計書: `docs/2026-03-29-play-navigation-redesign.md` の施策1（1-A, 1-B）
- 既存推薦ロジック: `src/play/recommendation.ts`（countKeywordOverlap, selectBestFromCategory）
- 既存推薦コンポーネント: `src/play/_components/RecommendedContent.tsx`（パターン参考）
- Play系データ構造: `src/play/types.ts`（PlayContentMeta）、`src/play/registry.ts`（allPlayContents, PLAY_FEATURED_ITEMS, quizQuestionCountBySlug, DAILY_UPDATE_SLUGS）
- ブログ記事ページ: `src/app/blog/[slug]/page.tsx`（配置位置の確認）
- 辞典共通レイアウト: `src/dictionary/_components/DictionaryDetailLayout.tsx`（props構造の確認）
- 辞典メタデータ: `src/dictionary/_lib/dictionary-meta.ts`（KANJI/YOJI/COLOR_DICTIONARY_META の slug フィールド）
- 各辞典page.tsx: kanji/yoji/colors それぞれの page.tsx 構造確認
- 既存テスト: `src/play/__tests__/recommendation.test.ts`（テストパターン参考）

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

なし

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
