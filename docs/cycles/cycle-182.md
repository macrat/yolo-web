---
id: 182
description: B-334 Phase 4.2（遊び一覧の新デザイン移行）を実施する。/play 一覧を (new)/ 配下に移行し、DESIGN.md に準拠した新デザインを適用したうえで、カテゴリ絞り込みとキーワード検索を追加する。Phase 4 の 2 サイクル目。
started_at: "2026-05-07T13:08:09+0900"
completed_at: null
---

# サイクル-182

このサイクルでは、デザイン移行計画 Phase 4 のうち **Phase 4.2（遊び一覧）** を実施する。`/play` 一覧ページを `src/app/(new)/` 配下に移行し、新デザイン体系（DESIGN.md）に沿った再設計と、遊びコンテンツのリスト内絞り込み機能を追加する。

Phase 4 全体（4.1 ツール / 4.2 遊び / 4.3 ブログ / 4.4 トップ）は Owner 指示によりサブフェーズごとに独立サイクルとして実施する。本サイクルは Phase 4 の 2 番目のサイクルとなる（4.1 は cycle-181 で完了）。

来訪者から見える主な変化は、遊び一覧ページの新デザイン適用と絞り込み機能の追加。「目的の診断・ゲームをすばやく見つけたい」M1a と、「気に入った遊びの全体像を俯瞰し、見落としを拾いたい」M1b の双方が、20 件の遊びコンテンツから目当ての 1 つに少ない手順で辿り着けるようになる。

なお、cycle-181 当時の description には `/play/page/[page]` の文言があったが、`src/app/(legacy)/play/` 配下にページネーションルート（`/play/page/[page]`）は存在しない（researcher レポート 1 §3 で実体確認済み）。一覧は全 20 件を 1 ページ表示する構造のため、リダイレクトルートの新設は不要。description は本ファイル冒頭で修正済み。

## 実施する作業

> **タスク間の独立性と並行可否の方針**: 全体順序は **B-334-2-1 → B-334-2-2 → B-334-2-3 → B-334-2-4 → B-334-2-5 → B-334-2-6** の直列。B-334-2-2 / B-334-2-3 / B-334-2-4 はいずれも同一の 2 ファイル（`PlayCard.tsx` / `PlayFilterableList.tsx`）への変更を重複して含むため、別 builder で並行編集すると同一ファイル競合が発生し、**並行不能**。同一 builder に対し 2 → 3 → 4 の順で**直列**に依頼する（または 1 builder にまとめて 2/3/4 を一括依頼する）。これは違反 9（独立タスクの一括委任）と AP-WF07 の趣旨に反する判断ではなく、AP-WF07 が想定する「独立タスクの一括委任」とは逆の構造（同一ファイルを複数 builder で並行編集しようとする）の回避。詳細は §違反予防チェックの「AP-WF07 の例外条件」を参照。B-334-2-5 のうち **(a) `newSlugs` 純関数テスト**は B-334-2-2 で `newSlugsHelper.ts` を外出しした直後から並行可能（別 builder 可）。B-334-2-5 (b) コンポーネント振る舞いテストは B-334-2-4 完了後に同一 builder へ直列。
> 旧 CategoryNav.tsx の削除は B-334-2-1 のサブステップとして同一 builder が同 commit で行う（CategoryNav 削除を先に独立 commit で走らせると `(legacy)/play/page.tsx` のビルドが落ちるため、移行と削除をアトミックに行う）。dead code 整理は B-334-2-1 と同一 builder が同 commit 内（page.tsx 削除 + dead 関数削除）で実施する（`(legacy)/play/page.tsx` 削除と `getPlayFeaturedContents` 削除の commit を分けると、削除順序によって型エラー or 参照エラーが起きる）。

- [ ] B-334-2-1: ルート移行（`(legacy)/play/page.tsx` および `page.module.css` を `(new)/play/` 配下に移動。**同 commit 内で**旧 `_components/CategoryNav.tsx` および対応テストを削除。既存 `__tests__/page.test.tsx` の処遇（廃止 or 縮減）も本タスクで決定する。詳細は §B-334-2-1 を参照）
- [ ] B-334-2-2: PlayListView / PlayCard / PlayGrid / PlayFilterableList の新規コンポーネント設計と DESIGN.md 準拠の新デザイン適用（絵文字・accentColor・装飾色を廃した識別性の再設計、Suspense ラップ、既存 `_components/` との責務分離を含む）
- [ ] B-334-2-3: カテゴリ絞り込み UI（タブ的ナビ）とキーワード検索 UI の実装、URL パラメータ反映、空状態表示（**B-334-2-2 完了後に同一 builder へ直列依頼**）
- [ ] B-334-2-4: NEW バッジ判定ロジック（積集合方式）と publishedAt 降順の単一グリッド適用（**B-334-2-3 完了後に同一 builder へ直列依頼**）
- [ ] B-334-2-5: テスト整備（フィルター・検索・NEW・不正パラメータ等の振る舞いテスト、ルート存在テストの追従）。**(a) `newSlugs` 純関数テスト**（`newSlugsHelper.ts` 相当を B-334-2-2 で先に外出しすれば B-334-2-2 と並行可能）と、**(b) PlayFilterableList / PlayCard / PlayListView の振る舞い・表示テスト**（実装コンポーネントの命名・props を実体に合わせる必要があるため、B-334-2-4 完了後に **同一 builder に直列依頼**）に分割する。
- [ ] B-334-2-6: PM 自身による視覚検証（5 シナリオ × 4 パターン = 20 枚。シナリオの内訳と観測対象は §B-334-2-6 を参照）と完了基準チェック
- [ ] dead code 整理: 本サイクルでは **`getPlayFeaturedContents` 関数 + `PlayFeaturedContent` interface のみを削除対象**とする（いずれも `(legacy)/play/page.tsx` だけが参照源で、page.tsx 削除で参照ゼロ化することを `grep -rn` で確認済み。fact-check.md §4 参照）。**`PLAY_FEATURED_ITEMS` 定数は `src/play/recommendation.ts` で使用中のため本サイクルでは残置**。**`getHeroPickupContents` / `getDefaultTabContents` / `getNonFortuneContents` の 3 関数はトップページ `src/app/(legacy)/page.tsx` から使用中のため対象外**（Phase 4.4 = トップ移行サイクルで扱う）。`PlayFeaturedItem` interface は `PLAY_FEATURED_ITEMS` の型定義であり残置する `PLAY_FEATURED_ITEMS` の依存型のため残置。`(legacy)/play/page.tsx` 内のローカル定数 `DAILY_PICKUP_SLUGS` / 関数 `getCtaText`（page.tsx 内定義のもののみ。`PlayContentTabs.tsx` および `PlayRecommendBlock.tsx` の同名関数は別定義のため対象外）/ 定数 `PLAY_CONTENT_COUNT` は page.tsx 削除で同時に消える。`src/lib/date.ts` の汎用関数 `getDayOfYearJst` は page.tsx 削除後に参照ゼロ化するが、汎用ライブラリ内の関数のため**本サイクルでは保留**（後続サイクルで判断）。テストファイルの整理: `src/play/__tests__/registry.test.ts` の `getPlayFeaturedContents` 関連 describe（line 359-405 付近）は対象関数の削除と同時に削除する。`PLAY_FEATURED_ITEMS` 関連 describe（line 319-353 付近）は残置する `PLAY_FEATURED_ITEMS` のため残置する。

## 作業計画

### 目的

`/play` 一覧ページを `(new)/` 配下に移行し、DESIGN.md に準拠した新デザインを適用する。同時に、20 件の遊びコンテンツから来訪者が目的の 1 つを見つけるための「カテゴリ絞り込み」と「キーワード検索」を導入する。現状の「今日のピックアップ＋イチオシ＋カテゴリ別セクション 4 つ」という多段構造を、cycle-181 で確立した「単一グリッド + フィルター」の標準パターンに統合し、遊び一覧でもサイト内一貫性を確保する。

cycle-181 で記録された 21 件の事故報告書のうち、計画段階で構造的に回避できる違反（来訪者価値の出発点、UI セマンティクス整合、独立タスクの分担、literal 指示禁止、事実情報の実体確認、4 パターン視覚確認の自己実施）を、本サイクルではタスク粒度・選択肢検討・完了基準の各観点から計画段階で予防する。

### 来訪者価値

論理導出: 「ターゲット yaml のフィールド → ニーズ → 設計要件 → 実装方式」を明示する。

#### 主要 / 副次ターゲット選定の再分析（reviewer A C1 への応答）

「主要 / 副次」は二択ではなく**動線の起点別に独立要件を導出**する。yaml フィールドから「/play 一覧ページに到達する経路」を機械的に書き出すと:

| ターゲット | /play 一覧への主動線（yaml から導出）                                                 | 一覧経由の頻度                                       |
| ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| M1a        | 検索流入（「占い」「診断」「ゲーム」）→ `/play` 着地 → 個別コンテンツへ               | **流入の主経路として一覧を経由する**（一覧が玄関口） |
| M1b        | (i) ブックマーク → 個別コンテンツに直接 / (ii) ヘッダーナビ「遊ぶ」→ /play で全体俯瞰 | (i) は一覧を**経由しない**。(ii) は時々俯瞰する用途  |

- M1b の `interests`「毎日繰り返し遊べるゲーム」「前に使って気に入った道具に、また迷わず戻ってこられること」は **(i) の経路（ブックマーク → 直接到達）**で最も強く満たされ、/play 一覧の設計要件として直接導出されない（reviewer A C1 の指摘どおり）。
- 一方 M1b の `doesnt_know`「このサイトにある他のツールの全体像」と `dislikes`「同じ操作を別の場所で覚え直すこと」は **(ii) の経路**でのみ発火する。一覧は「俯瞰用 UI」として M1b にも価値があるが、これはリピート行動ではなく**たまに全体把握する補助動線**。
- M1a の動線は一覧が玄関口（来訪頻度ベースで一覧経由が主）。`knows`「自分がやりたい作業の内容」と `dislikes`「似たようなツールが並んでいて、どれを使えばよいか迷わせること」が一覧設計の中核要件を導出する。

**結論**: /play 一覧の**主要ターゲットは M1a**、副次として M1b の「俯瞰用途」を支える。cycle-181 の前計画では M1b を主要と置いたが、yaml フィールドからの再導出ではこの結論にならない（PM の推測で主要を決めていた）。本サイクルの設計判断（ソート順・検索採用・並び順・空状態文言）はこの結論に基づき再構築する。

サイト内一貫性（cycle-181 と同型構造の踏襲）は **M1a / M1b 両者の `likes` から共通的に導出される独立要件**として保持する。M1a については `likes`「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」が、サイト全体で同位置・同方式に検索/フィルター UI が置かれていることで「再訪時の学習コスト低減 = 開いた瞬間にすぐ使える」状態として満たされる。M1b については `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」として yaml に明示されている。結論として「M1a 主要（一覧の玄関口・検索可能性）+ M1a/M1b 共通の一貫性要件で /tools と同型 UI を採用」の組み合わせとなる。

#### M1a（特定の作業に使えるツールをさっと探している人）— 主要ターゲット

- `knows`「自分がやりたい作業の内容（占い、診断、漢字、四字熟語、性格など）」: 検索流入経由で /play へ着地した来訪者は、ページ内で再度キーワードで絞り込めることで目的の遊びへ最短で到達する。
  - → 設計要件: ページ内キーワード検索（部分一致）。
  - → 実装方式: `?q=...` パラメータ + 300ms debounce + `router.replace`。検索対象は `title` + `shortTitle` + `shortDescription` + `keywords`。
- `dislikes`「似たようなツールが並んでいて、どれを使えばよいか迷わせること」「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」:
  - → 設計要件: 1 ページで 20 件を俯瞰でき、1 カード = 1 コンテンツが視覚的に明確に区別できる。ヒーロー領域は最小限。
  - → 実装方式: 単一グリッド + カテゴリラベル + 短い説明の組み合わせでカード単位の識別性を担保。ヒーローは h1 + 簡潔リード文のみ。
- `likes`「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」:
  - → 設計要件: フィルター UI と検索入力をファーストビュー（w360 でスクロールなし）に配置。
  - → 実装方式: グリッドの直前にナビ + 検索入力を横一段で配置（B-334-2-3 の最終状態で詳細）。

#### M1b（気に入った道具を繰り返し使っている人）— 副次ターゲット（俯瞰用途）

- `doesnt_know`「このサイトにある他のツールの全体像」 + `interests`「自分の興味に合わせて最適な道具を選ぶこと」:
  - → 設計要件: 全 20 件を 1 ページで見渡せること。「フィルター解除 = すべて表示」が 1 クリックで戻れること。
  - → 実装方式: 単一グリッド + 「すべて」リンク常時表示。
- `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」「ブックマークしたURLを開けばすぐ目的のツールが表示されること」:
  - → 設計要件: cycle-181 で /tools が確立したフィルター UI 規約（`<Link>` + `aria-current="page"` + `data-active`、`?category=` + `?q=`、debounce 検索）と同じセマンティクス。フィルター状態は URL に反映され、ブックマーク可能。
  - → 実装方式: 上記の規約を踏襲。
- `dislikes`「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」:
  - → 設計要件: `/play` の URL は移行前後で不変（Route Group は URL に影響しない）。
  - → 実装方式: `git mv` のみ。リダイレクト不要。

#### M1b の「リピート再到達」ニーズの扱い（M1 への応答補足）

M1b の `interests`「毎日繰り返し遊べるゲーム」「前に使って気に入った道具に、また迷わず戻ってこられること」は yaml のフィールドとしてはブックマーク経路で満たされる**主動線**であり、/play 一覧の設計要件ではない。ただし、ブックマークしていない/忘れた来訪者が一覧経由でリピートする補助経路は存在するため、補助的に「毎日更新」バッジで「いつもの 5 件」を視覚的に識別可能にする（DAILY_UPDATE_SLUGS に基づく）。これは Decision 負荷低減の代替手段であり、reviewer A M1 が指摘した「今日のピックアップ廃止による Decision 負荷増」のリスクは「毎日更新バッジで 5 件に絞られた候補から M1b が選ぶ」状態に縮減することで部分的に緩和される。完全な Decision 負荷低減（1 件提示）は別レイヤーの機能であり、本サイクルでは廃止する判断（理由は §「イチオシ・今日のピックアップの存続/廃止」を参照）。

### 作業内容

各タスクは「何を達成するか」「なぜそうするか」「どんな最終状態を目指すか」で記述する。JSX/CSS の literal は指定しない（builder の判断余地を残す）。

#### B-334-2-1: ルート移行

- **何を**: `src/app/(legacy)/play/page.tsx` と `src/app/(legacy)/play/page.module.css` を `src/app/(new)/play/` に `git mv` で移動する。`__tests__/page.test.tsx` の import パスを追従更新する。`_components/CategoryNav.tsx` および `_components/__tests__/CategoryNav.test.tsx` は本サイクルで責務消滅のため**削除**する（理由は次節「カテゴリ絞り込み UI 方式」を参照）。
- **なぜ**: ルート移行が新デザイン適用と新コンポーネント導入の前提。CategoryNav は「セクション内アンカー（`#fortune` 等）への sticky ナビ」として実装されており、本サイクルでセクション分割を廃止して単一グリッド + フィルターに統合するため、責務そのものが消滅する。
- **最終状態**: `/play` URL が変わらず、(new) Route Group のレイアウト（ヘッダー・フッター・テーマトグル）配下で動作する。詳細ページ群（`(legacy)/play/[slug]/`、`(legacy)/play/daily/` 等）は Phase 7 まで `(legacy)/` に残す。`(new)/play/layout.tsx` は置かない（cycle-181 と同方針：`(new)/layout.tsx` が共通レイアウトを担う）。`not-found.tsx` も置かない（`global-not-found.js` が catch）。
- **既存テストの処遇（PM 決定）**: 現行 `src/app/(legacy)/play/__tests__/page.test.tsx` は旧構造（4 カテゴリ見出し / 20 件カード / イチオシ / ピックアップ）を直接 assertion しているため、import パス更新だけでは全テストが落ちる。**本サイクルでは page.test.tsx を廃止する**。理由: (i) 旧 assertion は全て新構造に対して意味を失うため、リネーム + 縮減版を残しても重複・形骸化する、(ii) 新構造の振る舞いテストは B-334-2-5 で `PlayFilterableList.test.tsx` / `PlayCard.test.tsx` / `PlayListView.test.tsx` 単位で書くため、ページレンダリング確認はそれらに包含可能、(iii) ルート存在の確認は B-334-2-5 で既存の `page-coverage.test.ts` 相当のカバレッジテストに `(new)/play/page.tsx` を追加することで担保する（builder が既存 `page-coverage.test.ts` の有無を確認し、無ければ新 page.tsx 単独のレンダリングテスト 1 本を新設）。テストの **assertion 文言・テストコードの literal は builder が判断**（PM は「何を確認すべきか」止まり）。
- **触らない範囲（事実、`ls -d` で実体確認済み）**: `src/app/(legacy)/play/` 配下の詳細ルートディレクトリは `_components/` `__tests__/` を除き **15 件**（`[slug]`、`animal-personality`、`character-fortune`、`character-personality`、`contrarian-fortune`、`daily`、`impossible-advice`、`irodori`、`kanji-kanaru`、`music-personality`、`nakamawake`、`traditional-color`、`unexpected-compatibility`、`yoji-kimeru`、`yoji-personality`）。本サイクルでは `(legacy)/play/page.tsx` および `page.module.css` のみを `(new)/play/` に移動し、上記 15 件の詳細ルートは Phase 7 まで `(legacy)/` に残す。`src/app/sitemap.ts` の `/play` URL はハードコードだが URL 不変のため変更不要。

#### B-334-2-2: 新デザイン適用とコンポーネント設計

- **何を**: PlayListView（Server Component）→ `<Suspense>` ラップ → PlayFilterableList（Client Component）→ PlayGrid → PlayCard の 4 層に分割する（cycle-181 ToolsListView 同型）。配置場所は `src/play/_components/`。
- **なぜ**: `useSearchParams` を使うフィルター部分のみ Client Component に閉じ、ページ本体は Server Component に保つことで、metadata 生成・ISR 戦略・初期描画コストの最適化を維持する（cycle-181 で確立済みの方針）。Suspense ラップは Next.js が要求する仕様要件（欠落するとビルド失敗）。
- **最終状態**:
  - **Suspense ラップ**: PlayListView 内で `<Suspense>` を使って PlayFilterableList をラップする（`useSearchParams` を含む Client Component を Server Component から呼ぶ際の Next.js 仕様要件）。cycle-181 の `src/tools/_components/ToolsListView.tsx` line 35-37 と同型構造を踏襲する。
  - **既存 `_components/` との責務分離**: `src/play/_components/` には既に `PlayRecommendBlock.tsx` / `RecommendedContent.tsx`（および詳細ページ用 `RelatedContentCard.module.css`）が存在し、これらは詳細ページの関連表示用である。本サイクルで追加する `PlayCard` / `PlayFilterableList` / `PlayGrid` / `PlayListView` は **`/play` 一覧ページ専用**として併存させる。既存の `RelatedContentCard` 等を流用しない（責務の境界を曖昧にしない）。既存の関連表示コンポーネントは本サイクルで一切触らない。
  - **絵文字を完全廃止**: 現行のヒーローバナー（4 個のデコ絵文字）、各カードの `content.icon`（絵文字）、`accentColor` を使ったカード彩色、ピックアップカードのアイコン表示はすべて廃止する。理由は DESIGN.md §3「絵文字は使わない」、§2「色は機能を伝えるためだけに使う。装飾のために色を使わない」。
  - **絵文字廃止後の視覚的識別**: アイコンを使わず、Panel + タイポグラフィのみでカードを成立させる。カード内の情報優先順位は「カテゴリラベル（`--accent` か `--fg-soft` の小さな見出し）→ コンテンツ名（h2/h3）→ 短い説明（`--fg-soft`）→ メタ情報行（質問数等）」とし、視覚的識別はカテゴリラベル + タイトル文字列で担保する。Lucide アイコンは原則使わない（DESIGN.md §3「アイコンは原則として使わない」）。
  - **同一カテゴリ連続時の識別性検証**: `personality` カテゴリは 12 件（fact-check.md §7 で grep 確認済み）。**うち命名類似度が高い 5 件**（`animal-personality` 動物性格診断、`music-personality` 音楽性格診断、`character-personality` キャラ性格診断、`word-sense-personality` 単語感覚性格診断、`yoji-personality` 四字熟語性格診断）が特に「○○性格診断」型で並んだ際にタイトル単独での識別性が弱い。残り 7 件（character-fortune, contrarian-fortune, impossible-advice, japanese-culture, science-thinking, traditional-color, unexpected-compatibility）は別命名のため命名類似度はやや低いが、`personality` カテゴリで括られると視覚的には連続する。新カードに `shortDescription` を表示し、可能であれば**メタ情報 1 行**（クイズの場合は `quizQuestionCountBySlug` から「全 N 問」、その他は `category` 表示名）を入れて補強する。視覚検証では特に上記 5 件が連続する範囲を含めて確認する。識別性が builder の実装後に不足と判明した場合、以下の補強案 (i)(ii) を builder が選択可能とする: (i) `shortDescription` を 1 行から 2 行に増やす、(ii) 「全 N 問」「所要 N 分」のメタ情報を必ず 1 行表示。**(iii) Lucide アイコン採用は本サイクルでは選択不可**（DESIGN.md §3 改訂を伴う重大な方針変更のため、builder が個別判断する事項ではない）。仮に (i)(ii) でも識別性が不足する場合は、builder は実装を停止して PM へ escalation し、PM は本サイクルで対応せず別サイクルで DESIGN.md 改訂を検討する判断を取る。識別性の検証は B-334-2-6 の視覚検証で `personality` カテゴリのみを表示した状態を 1 シナリオとして必ず確認する。
  - **CTA 文言の扱い（PM 決定）**: カード全体をリンク化（`<Link>` でカード全体をクリッカブルに）する設計を採用するため、カード内の動詞 CTA（「占う」「診断する」等の getCtaText 由来文言）は**廃止**し、視覚的なホバー反応（背景・ボーダー強調）のみで誘導する。理由: カード全体がリンクであれば動詞 CTA は冗長で、M1a の `likes`「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」と整合する。「→」記号も装飾としては不要（DESIGN.md §3「アイコンは原則として使わない」、絵文字「→」も避ける）。
  - **トークン使用**: `--bg`/`--fg`/`--fg-soft`/`--border`/`--accent`/`--accent-soft`/`--accent-strong`/`--r-normal`（カード）/`--r-interactive`（ボタン・入力）。
  - **「今日のピックアップ」「イチオシ」セクションの撤去**: ヒーローバナーは h1「遊ぶ」と簡潔なリード文（コンテンツ数を `allPlayContents.length` から動的に算出）のみに簡素化。決定論的日替わりピックアップやキュレーションされた 3 件の固定推薦は廃止する（理由は §「イチオシ」セクションの存続/廃止」を参照）。
  - **リード文の方向性（PM 決定）**: 1 行 30 文字以内で、**「全 N 種のコンテンツを 4 つのカテゴリから選べる」旨を機能的に提示**する。**カテゴリ名（「今日の運勢」等）はリード文には書かず**、直下のフィルタリンク（B-334-2-3 で配置する `CATEGORY_DISPLAY_ORDER` 由来の表示名 = 「今日の運勢 / あなたはどのタイプ？ / どこまで知ってる？ / 毎日のパズル」）に委ねる。理由（PM 決定）: リード文に「占い・診断・クイズ・ゲーム」と書き、直下のフィルタが「今日の運勢 / あなたはどのタイプ？ / どこまで知ってる？ / 毎日のパズル」と表示されると、来訪者が「占い」と「今日の運勢」を結びつけられず、認知整合が崩れる（M1a の `dislikes`「似たようなツールが並んでいて、どれを使えばよいか迷わせること」と直接対立する）。フィルタ表示名は現行 `CATEGORY_DISPLAY_ORDER` を踏襲する方針（B-334-2-3 参照）と整合させ、リード文は「4 つのカテゴリ」と総称し具体名を出さない方式を採用することで摩擦を最小化する。装飾的な比喩・挨拶・絵文字は含めない。M1a の `dislikes`「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」とも整合させる。具体的な文言（語尾・助詞）は builder が判断。
  - **metadata の見直し（PM 方向性指示 + 具体文言は builder 判断）**: 現行 `metadata.description`（「全 X 種のインタラクティブコンテンツが揃う入口…」）は、**「入口」というニュアンスから「一画面で全部見渡せる一覧 + 絞り込み・検索可能」というニュアンスへ寄せる方向**で更新する（多段構成 → 単一一覧 + フィルターという構造変化を反映）。具体文言は builder 判断。`title` は不変が望ましい（検索流入経路を保つため）。`keywords` は変更しない（検索流入クエリへの影響を避ける）。
  - **「毎日更新」バッジ**: `DAILY_UPDATE_SLUGS`（`daily`, `kanji-kanaru`, `yoji-kimeru`, `nakamawake`, `irodori` の 5 件）に該当するカードへ表示する仕組みは新カードに引き継ぐ。バッジの視覚は `--accent-soft` 背景 + `--accent-strong` 縁取りなど、cycle-181 で確立した NEW バッジと同様のトークンセットで構成する。NEW バッジと色が混同されないよう、視覚的に区別する（同じ色を使わない、または文言で判別可能な配置にする）。
  - **カード等高**: グリッドアイテムが等高になるよう `height: 100%; box-sizing: border-box;` を採用（cycle-181 R3-1 で確立）。
  - **badges min-height**: NEW バッジ・毎日更新バッジの有無で見出し位置がズレないよう、バッジ行に固定 min-height を設ける（cycle-181 R3-4）。バッジ有無の混在状態を必ず実機検証する。
  - **newSlugs 計算ロジックの分離（B-334-2-5 (a) 並行化の前提条件）**: NEW バッジ判定（上位 5 件 × 30 日の積集合）の純関数は `src/play/_components/newSlugsHelper.ts`（cycle-181 `src/tools/_components/newSlugsHelper.ts` 同型）として外出しする。`PlayListView`（Server Component）から `calculateNewSlugs(contents, now)` 形式で呼び出し、結果の `Set<string>` を `PlayFilterableList` へ prop で渡す。**この分離は B-334-2-5 (a) の純関数テストを別 builder へ並行依頼可能にするための前提でもあり、本最終状態の必須要素**（B-334-2-2 builder は B-334-2-4 の本格実装前であってもヘルパーモジュールの空実装 or 仮実装をこの段階で配置し、関数シグネチャ `calculateNewSlugs(contents, now): Set<string>` を確定させる。中身のロジック実装は B-334-2-4 で完成させる）。

#### B-334-2-3: カテゴリ絞り込み UI とキーワード検索 UI

- **何を**: 単一グリッドの上に、カテゴリ絞り込みナビとキーワード検索入力を配置する。
- **なぜ**: 単一グリッドにすることで、20 件全体の俯瞰と、目的別の絞り込みを両立できる。M1a の `knows`「自分がやりたい作業の内容」と、M1a / M1b 共通の一貫性要件（M1a `likes`「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」+ M1b `likes`「サイト内の操作性の一貫性」「ブックマークしたURLを開けばすぐ目的のツールが表示されること」）を同時に満たす（URL に状態が反映され、絞り込み状態がブックマーク可能）。
- **最終状態（カテゴリ絞り込み）**:
  - 「すべて / 今日の運勢 / あなたはどのタイプ？ / どこまで知ってる？ / 毎日のパズル」の 5 リンク構成（カテゴリ表示名は現行 `CATEGORY_DISPLAY_ORDER` を踏襲。`fortune` → 「今日の運勢」、`personality` → 「あなたはどのタイプ？」、`knowledge` → 「どこまで知ってる？」、`game` → 「毎日のパズル」）。
  - 実装は `<Link href="/play?category=...">` + `aria-current="page"` + `data-active` 属性。`<Button>` + `aria-pressed` は使わない（cycle-181 違反 18 / R5 で確立した方針）。
  - URL パラメータ: `?category=fortune | personality | knowledge | game`、不正値は `null` フォールバック（`VALID_CATEGORY_VALUES.has(rawCategory)` 方式）。
  - 「すべて」リンクで全件表示（`?category=` を付けない）。
  - **アクティブ判定ロジック**: 「すべて」リンクは `activeCategory === null` のときアクティブ（不正値の場合も `null` にフォールバックされるため、結果として「すべて」がアクティブになる）。それ以外は対応するカテゴリリンクがアクティブ。アクティブ時に `aria-current="page"` と `data-active="true"` を両方付与する。
  - カテゴリ切替は `Link` 経由のため自動的にブラウザ履歴に積まれる（戻る対応）。キーワード状態の引き継ぎロジックは `buildCategoryHref(category, currentKeyword)` 相当で実装する。
- **最終状態（キーワード検索）**:
  - 入力欄を絞り込みナビの近傍（同一エリアまたは隣接行）に配置する。`@/components/Input` を使用（DESIGN.md §5）。
  - URL パラメータ: `?q=...`。空文字は `?q=` を付けない。
  - 入力反映: ローカル state は即時反映、URL は 300ms debounce で `router.replace`（cycle-181 R4 で確立。`push` は履歴汚染、debounce なしはキーストローク取りこぼし & Playwright デッドロックを引き起こすため、両方を採用しない）。
  - URL → state 追従の `useEffect` も実装（ブラウザ戻る対応、cycle-181 R3-2 で確立）。
  - **検索対象フィールド（PM 決定）**: `title` + `shortTitle` + `shortDescription` + `keywords` の 4 フィールド。`shortTitle` を含める理由は、`shortTitle` は全角 15 文字超のタイトル時にカード表示で実際に来訪者が目にする文字列であり、来訪者は **shortTitle ベースでサイトを認識する**可能性が高いため、検索対象から外すと M1a の `knows`「自分がやりたい作業の内容」と乖離する。`shortTitle` がない場合は対象から外す（undefined 安全に処理）。`seoTitle` は **対象に含めない**（PM 決定）。理由: fact-check.md §8 で `seoTitle` 設定済みは 9/20 件のみで網羅性が低く、また `seoTitle` は SEO 用の語句構成（「無料」「心理テスト」「8タイプ」等の検索ニーズワード）が含まれるが、来訪者が **/play 内検索で打鍵する語**としては overshooting（外部検索エンジンに最適化された文言で、内部検索の打鍵語と乖離）になるリスクが高い。`title` + `shortTitle` で来訪者が記憶するタイトル系語句、`shortDescription` + `keywords` で内容語をカバーすれば M1a の打鍵語は十分捕捉できる。大文字小文字は区別しない。
- **空状態**: 「該当するコンテンツが見つかりませんでした。キーワードを変えるか、カテゴリを切り替えてみてください。」（次の行動を示す文言を含める。`role="status"` を付与）。
- **a11y**:
  - `<nav aria-label="カテゴリで絞り込む">` でナビをラップ。
  - 全インタラクティブ要素に `min-height: 44px`（B-386 が未着手のため、cycle-181 と同様に カテゴリ絞り込みリンクおよび検索入力の各 CSS クラスで個別上書きする。クラス名は builder の判断。AP-I02 抵触の継承は次節「B-386 の扱い」で明記）。
  - focus-visible は DESIGN.md §2 末尾のフォーカススタイル規約に準拠する。

#### B-334-2-4: NEW バッジと並び順

- **NEW バッジ判定方式**: cycle-181 と同じ「上位 5 件 × 直近 30 日の積集合」を採用する。
  - 上位 5 件: `publishedAt` 降順で先頭 5 件。
  - 30 日条件: `now - publishedAt < 30 日`。
  - 両方を満たすスラッグ集合を Server Component で `Date.now()` を渡して計算し、Client Component に prop で渡す（cycle-181 で `react-hooks/purity` lint 回避策として確立）。
- **理由（同方式採用の論拠、追加頻度の実測込み）**: 全 20 件の publishedAt を Bash で抽出（コマンドと出力は `./tmp/cycle-182/fact-check.md` §1-3 に記録）した結果、最新は 2026-03-30（`word-sense-personality`）、その次は 2026-03-17（`character-personality`）、過去 90 日窓（2026-02-07〜2026-05-07）の追加は **19 件**（うち 2 月 02-07 以降が 9 件、3 月が 10 件、4-5 月は 0 件。`fortune` (daily) のみ 2026-02-01 で 90 日窓外）。**現時点（2026-05-07 基準）で「直近 30 日以内」（2026-04-07 以降）に該当する遊びコンテンツは 0 件**であり、初期表示で NEW バッジが付くカードは 0 件となる見込み。これは「30 日条件のみ」でも「上位 5 件 × 30 日」でも結果は同じだが、将来的に短期間に複数件が一気に追加された場合（過去実績では 2026-03-08 に 5 件同時公開などあり）に「30 日条件のみ」だと多数 NEW が並ぶ。同方式採用は将来の追加スパイクへの保険として機能する。サイト全体での NEW バッジ意味の一貫性（M1a / M1b 共通の「サイト内一貫性」要件、§§後述）も担保される。
- **並び順（M1a 主要 / 動線整合への再構築）**: 全件を `publishedAt` 降順で表示する。
  - 理由（M1a 起点の積極的便益）: 主要ターゲット M1a が検索流入で /play へ着地した直後、まだページ内検索/フィルタを使う前の**ファーストビューでまず最新コンテンツが目に入る**ことで、検索クエリと完全には一致しない興味（「占い」と検索したが新しい診断にも興味があり得る等）を持つ M1a が「新着の中から拾い直す」選択肢を常時提示される。これにより検索キーワードと一覧内容のズレに起因する迷子化を回避でき、M1a の `dislikes`「似たようなツールが並んでいて、どれを使えばよいか迷わせること」の影響を、まず最新の差別化ある情報を上位に置くことで弱められる。加えて、M1a が具体的なキーワードを持っているケースでは検索 UI を使うため、ソート順自体は探索を妨げない（中立性も担保）。
  - 補足: `publishedAt` 降順は新規流入と既存コンテンツの両方に対して中立的な並びとしても機能する。
  - 副次ターゲット M1b の俯瞰用途では、`publishedAt` 降順は「最新の発見」を支援するが、`interests`「前に使って気に入った道具に、また迷わず戻ってこられること」とは部分的に競合する（古い気に入りが下に押される）。この競合は「毎日更新」バッジで 5 件の常用候補を視覚的に上位識別すること、および「カテゴリ絞り込みで自分の関心領域を即座に絞れること」で軽減する。
  - サイト内一貫性: cycle-181 のツール一覧と並び順を揃えることで M1a / M1b 共通の一貫性要件（M1a の「再訪時にすぐ使える = 同じ並び方」、M1b の `likes`「操作性の一貫性」）を担保。
  - **検討した代替（棄却）**: (a) 「カテゴリ順 → カテゴリ内 publishedAt 降順」: M1b 俯瞰には親切だが、フィルター適用時に並びが変わらず単一カテゴリ内では結局 publishedAt 降順になるため二重指標になる。(b) 「人気順（PV 降順）」: GA データの恒常的取得・更新フローが本サイクル外であり実装複雑。(c) 「`(daily-update バッジ付き → その他) × publishedAt 降順`」: M1b 常用に親切だが、サイト内一覧で /tools と並び方が異なり一貫性が崩れる。M1b の常用支援は「毎日更新」バッジの視覚的目立たせで代替可能。

#### B-334-2-5: テスト整備

- **何を**: cycle-181 で確立したテスト構成を踏襲し、新コンポーネント単位で振る舞いテストを書く。
- **対象テスト項目（builder が詳細を設計）**:
  - PlayFilterableList の振る舞い: フィルターナビ表示、カテゴリリンク href、初期状態（「すべて」がアクティブ = `aria-current="page"`）、`?category=...` 状態でのフィルタリング、`?q=...` 状態での検索フィルタリング、**カテゴリ + キーワード併用時の絞り込み（積集合動作）**、不正カテゴリ値のフォールバック（「すべて」がアクティブになることの確認）、検索の大文字小文字不区別、空結果時の `role="status"` メッセージ、debounce 後の `router.replace` 呼び出し、publishedAt 降順表示、**カテゴリリンク href にキーワードが引き継がれること（buildCategoryHref 動作）**、**初期状態で `getAllByText("毎日更新").length === 5` を確認**。
  - PlayCard の表示: カテゴリラベル / タイトル / 説明 / 「毎日更新」バッジ有無 / NEW バッジ有無。`DAILY_UPDATE_SLUGS` の各 slug に対してバッジが表示されることを個別 assertion。
  - newSlugs 計算（cycle-181 の `newSlugs.test.ts` 相当を踏襲し、最低以下 4 ケース）: (i) 30 日以内 × 上位 5 件の積集合が正しく計算される、(ii) 30 日超過のものは除外される（境界 = 30 日ジャストでの境界条件）、(iii) 公開コンテンツが 5 件以下のとき全件返る、(iv) 上位 5 件の選定が `publishedAt` 降順で行われる（6 件目以降が除外される）。
  - PlayListView 統合: Server Component から PlayFilterableList へ props（`newSlugs` 等）が渡る。
  - ルート存在テスト: `(new)/play/page.tsx` の存在を確認するテストを既存テスト体系に追加。**`(legacy)/play/__tests__/page.test.tsx` は B-334-2-1 で「廃止」が PM 決定済みのため、更新の選択肢は対象外**。新規ルート存在テストは cycle-181 の `page-coverage.test.ts` 相当パターンに準拠して新規ファイルとして追加する（既存ファイルの流用ではなく新規作成）。
- **モック方針**: `vi.mock("next/navigation", ...)` で `useSearchParams` / `useRouter` をモック（cycle-181 と同型）。
- **AP-WF03 防止**: PM は「assertion 文言の literal」「テストコードの literal」を指示しない。テストの「何を確認すべきか」だけを伝え、書き方は builder が判断する。

#### B-334-2-6: 視覚検証と完了基準チェック

- **何を**: 完了直前に PM 自身で Playwright 経由の視覚検証を実施し、結果を本ファイルに記録する。
- **検証シナリオ（5 シナリオ × 4 パターン = 20 枚）**:
  1. **初期状態**（フィルタ未適用、`/play`）: 4 枚。観測対象に「毎日更新」バッジ 5 件が見える状態を含めるため、ファーストビューに 5 件以上のカードを含むサイズで撮影。NEW バッジは現時点で表示なし（B-334-2-4 の追加頻度実測により）の予定だが、もし表示されているカードがあれば併せて観測する。
  2. **カテゴリフィルタ適用中**（`?category=personality`、12 件あり、同一カテゴリ連続による識別性検証も兼ねる）: 4 枚。観測対象は (i) `personality` カードの識別性（タイトル + shortDescription + メタ情報の組み合わせで個別判別可能か）、(ii) アクティブリンクの `aria-current="page"`、(iii) 「すべて」リンクが非アクティブになる視覚。
  3. **キーワード検索結果あり**（例: `?q=色` または `?q=性格`）: 4 枚。観測対象は (i) ヒット件数の妥当性、(ii) 検索結果のソート順（publishedAt 降順）、(iii) 入力欄の現在値表示。
  4. **カテゴリ + キーワード併用**（例: `?category=personality&q=色`）: 4 枚。観測対象は (i) 両方の条件が AND で適用されること、(ii) アクティブリンクが正しく `personality` を示すこと、(iii) カテゴリリンクの href にキーワードが引き継がれること（href を hover で確認）。
  5. **空状態（カテゴリ + キーワード併用で 0 件）**（例: `?category=game&q=色`）: 4 枚。観測対象は `role="status"` 付きメッセージの文言と表示、およびカテゴリリンクのアクティブ状態が維持されていること（複合条件下でも空状態表示が正しく出ることを確認、最も状態が複雑なケースで境界を抑える）。
  - 合計: **20 枚**（5 シナリオ × {w360, w1280} × {light, dark}）。
- **観測必須要素**（cycle-181 R3-4 / R4-2 同型事故再発防止のため、明示的にリストアップ）:
  - **NEW バッジ視覚（Date 巻き戻し手段の PM 決定）**: 現時点では追加頻度実測により表示 0 件の見込みのため、視覚化の手段を以下のとおり指定する。**手段 (c) を採用**: `src/play/quiz/data/word-sense-personality.ts` の `publishedAt` を一時的に当日（例: 2026-05-06T00:00:00+09:00）に書き換えて dev サーバーを起動 → 1 枚撮影 → `git checkout src/play/quiz/data/word-sense-personality.ts` で確実に元に戻す、という手順を `./tmp/cycle-182/visual-check.md` に手順テキストで残す（戻し忘れ防止のため、撮影直後に `git diff` で差分ゼロを確認する手順も含める）。Server Component 内の `Date.now()` をブラウザ側 mock で差し替える手段 (a) は Next.js Server Component に効かないため不採用。一時 API 追加 (b) はスコープ外のため不採用。観測項目は (i) バッジ位置 / 色 / box-sizing が崩れていないこと、(ii) badges 行の min-height によりバッジ有無で h2 位置が揃うこと、(iii) 「毎日更新」バッジと色が混同されないこと。これは「初期状態」シナリオの追加観測項目として実施し、別 4 パターンを撮らない（独立シナリオには加えない代わりに、初期状態 4 枚と並べて観測対象を明示する）。
  - **「毎日更新」バッジ視覚**: 5 件全てが 1 画面または近接配置で見える状態を初期状態スクショで観測。色が NEW バッジと混同されないかを目視確認。
  - **同一カテゴリ連続時の識別性**: シナリオ 2（`?category=personality` 12 件）で必ず確認。識別性不足が判明した場合は B-334-2-2 の補強案（shortDescription 2 行化等）を発動。
- **チェック観点**: DESIGN.md §3 絵文字なし、§4 Panel ベース、§2 トークン使用、a11y（focus-visible、コントラスト、44px タップターゲット）、カード等高、badges 行の高さ揃い、空状態の文言。
- **AP-WF11 対策**: 並べ読みの成果物として「計画書のリスト」「実装に存在する要素」「差分」を `./tmp/cycle-182/visual-check.md` に 4 列テーブルで残す。
- **AP-WF05 対策**: スクリーンショットは `./tmp/cycle-182/screenshots/` に保存し、サイクル終了時に不要なものを削除する。

### 検討した他の選択肢と判断理由

#### 1. 「イチオシ」「今日のピックアップ」セクションの存続/廃止 → 廃止

- **採用**: ヒーローバナーの「今日のピックアップ」と「イチオシ 3 件」セクションを廃止し、単一グリッド + フィルターに統合する。
- **理由**:
  - **主要 M1a の積極的廃止根拠**: 主要ターゲット M1a の `dislikes`「似たようなツールが並んでいて、どれを使えばよいか迷わせること」「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」と、旧 UI のヒーロー領域（4 個のデコ絵文字バナー + 「今日のピックアップ」1 件）+ 「イチオシ 3 件」の多段ヘッダーは直接対立する。**「似たような遊び」を「ピックアップ」「イチオシ」「カテゴリ別」と異なる文脈で何度も提示する構造そのものが M1a の dislikes に該当**しており、「どれを使えばよいか迷わせる」状態を増幅していた。これらを廃止することで、M1a がファーストビューでフィルター UI と検索入力にすぐ到達でき、目的の遊びへの最短経路が短縮される。これが廃止の主たる積極的根拠。
  - **「セクション分割」と「フィルタリング」の構造的競合（来訪者価値起点・補強）**: フィルタを `?category=game` に絞っても「イチオシ」セクションが残ると、来訪者は「フィルタが効いていないのか？」と混乱する。逆にフィルタ時に「イチオシ」を非表示にすると、フィルタの On/Off で UI 構造が大きく変わり、操作モデルの一貫性が崩れる。これは主要 M1a の上記 dislikes との対立を実装上不可避にする。
  - サイト内一貫性（M1a / M1b 共通要件）: M1a の `likes`「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」は、サイト全体で同位置に検索・フィルター UI が置かれていることで再訪時に最短時間で発火する。M1b の `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」は yaml に明示。両者とも cycle-181 の単一グリッドパターンと同型構造を採用することで満たされる。「遊び一覧だけ多段構造を残す」のはサイト内不整合を生む。
  - **「今日のピックアップ」廃止の Decision 負荷増への対処（reviewer A M1 への応答）**: 廃止により M1b の Decision 負荷が増える可能性は確かに存在する（5 件の毎日更新コンテンツから「今日はどれをやろうか」を毎回判断する必要）。ただし: (i) 主要ターゲットは M1a であり M1b の Decision 負荷は副次要件、(ii) 「毎日更新」バッジで 5 件に絞られた候補を視覚的に識別可能、(iii) 1 件提示の Decision 肩代わりは決定論的アルゴリズム（dayOfYear ベース）でも可能だが、フィルタリングと併存する UI を作るコスト（フィルタ適用時の表示/非表示判断、視覚的階層の二重化）に対して得られる価値が限定的（5 件の中から 1 件選ぶ程度の Decision 負荷）。一覧の主役を「単一グリッドの探索しやすさ」に振る判断を採用する。
  - **棄却した代替（来訪者価値ベースで再比較）**:
    - 「セクション構造を維持しつつ、セクション間の絞り込みナビを sticky で残す」: M1a の `dislikes`「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」と対立。多段構造は俯瞰の遅延を招く。
    - 「イチオシのみ残し、ピックアップとカテゴリ別セクションは廃止」: イチオシ 3 件は手動キュレーション（おすすめ理由バッジ付き）であり、AI 運営という constitution と整合しにくく、来訪者価値の観点でも「キュレーション理由が AI には書けない」結果として説得力の薄い文言になる懸念。
    - 「ヘッダー直下に常時 1 件のキュレーションを置き、本体は単一グリッド」（reviewer A M1 提案）: M1b の Decision 肩代わりとして機能するが、(i) その 1 件をどう選ぶか（決定論的か手動か）の選定基準を再設計する負担、(ii) フィルタ未適用時のみ表示する条件分岐で UI 構造の一貫性が崩れる、(iii) 主要ターゲット M1a にはノイズになる、ため本サイクルでは採用しない。将来的に M1b の俯瞰行動の実測（GA で `/play` リピート率が高いと判明等）があれば再検討候補。

#### 2. カテゴリ絞り込み UI の方式 → タブ的ナビゲーションリンク

- **採用**: `<Link>` + `aria-current="page"` + `data-active` 属性（cycle-181 R5 で確立した最終形）。
- **理由（来訪者の認知モデル起点）**:
  - 来訪者の認知モデル: 「カテゴリ絞り込み」は単一選択であり、「いま見ている範囲を切り替える」操作 = タブの認知モデルに対応する。
  - サイト全体の一貫性: ブログ一覧（`/blog/category/[category]`）と /tools 一覧の絞り込みもタブ的ナビ。M1a / M1b 共通の一貫性要件（M1a の「再訪時にすぐ使える」、M1b の `likes`「操作性の一貫性」）を優先。
  - 単一選択 vs 複数選択: 遊びコンテンツ 20 件 × 4 カテゴリで、複数カテゴリ同時選択の意義は薄い（最多の personality でも 12 件、合算しても全件に近づくだけ）。単一選択で十分。
- **棄却した代替**:
  - `<Button>` + `aria-pressed` トグル: cycle-181 違反 16/18 で実証された通り、視覚（タブ風ピル）/ 挙動（トグル）/ 機能（単一選択）の 3 者不整合を生む。
  - `<select>` ドロップダウン: モバイルで操作回数が増え（タップ → 選択肢確認 → 決定 → 閉じる）、現状の横並びナビより手数が多い。
  - チェックボックス（複数選択）: 上記の通り意義が薄く、URL パラメータ設計も複雑化する。

#### 3. キーワード検索の要否 → 採用

- **採用**: キーワード検索（`?q=...`、debounce 300ms、`router.replace`）を実装する。
- **理由（来訪者ニーズからの導出）**:
  - M1a の `knows`「自分がやりたい作業の内容（占い、診断、漢字、四字熟語、性格など）」が直接キーワード入力に対応する。検索流入の来訪者がページ内で再度「自分の探している遊び」を絞り込めることで、20 件の中での迷子を防ぐ。
  - M1b の `doesnt_know`「このサイトにある他のツールの全体像」を能動的に解消する手段として、興味語（例: 「色」「動物」「四字熟語」）でグリッドを絞り込めることが、新コンテンツの発見にも繋がる。
  - サイト内一貫性（M1a / M1b 共通要件）: cycle-181 で /tools にキーワード検索を追加済みのため、/play にも同型 UI があることで M1a の再訪時即時性と M1b の操作性一貫性が同時に満たされる。
- **検索対象フィールド**: `title` + `shortTitle` + `shortDescription` + `keywords` の 4 フィールド（B-334-2-3 の最終形と同一。詳細な PM 決定根拠と `seoTitle` 不採用の理由は B-334-2-3 を参照）。
- **棄却した代替**:
  - キーワード検索なし（カテゴリ絞り込みのみ）: 4 カテゴリ × 平均 5 件では「同カテゴリ内の似た複数」を区別する手段がなく、M1a の dislikes「似たようなツールが並んでいて、どれを使えばよいか迷わせること」を解決できない。
  - クライアントサイドの全文索引（fuse.js 等）: 20 件規模では過剰。シンプルな部分一致 filter で十分。

#### 4. NEW バッジの要否と閾値 → 上位 5 件 × 直近 30 日（cycle-181 と同方式）

- **理由**: 同方式採用の論拠は前節 B-334-2-4 を参照。コンテンツ件数 20 件は cycle-181 の 34 件と同オーダーであり、閾値再考の根拠は乏しい。サイト全体の NEW 表示意味の一貫性を優先。
- **棄却した代替**:
  - NEW バッジなし: 新コンテンツへの来訪導線を弱める。M1b の回遊にも逆効果。
  - 上位 5 件のみ（30 日条件なし）: 古いコンテンツに NEW が永続的に付き、信頼性が薄れる。
  - 30 日条件のみ（上位件数なし）: コンテンツ追加が連続した場合に多数の NEW が並ぶリスク（cycle-181 と同じ判断）。

#### 5. ソート順 → publishedAt 降順

- **理由**: 前節 B-334-2-4 の通り、サイト全体の一覧ソートと整合させる。「毎日繰り返し遊べる」needs は「毎日更新」バッジで別途識別される。

#### 6. `/play/page/[page]` の扱い → リダイレクトルート作成不要

- **理由**: `(legacy)/play/page/[page]/` ディレクトリは**存在しない**（researcher レポート 1 §3 で実体確認済み）。一覧は全 20 件を 1 ページ表示しており、`generateStaticParams` も `/play` 一覧側にはない。description にあった「/play/page/[page]」の文言は事実誤認だったため、本ファイル冒頭で description を修正済み。
- **AP-WF12 / 違反 19 の予防**: 計画書に「リダイレクトルート作成」「permanentRedirect 使用」等を書く前にディレクトリ実体を確認した結果、そもそもタスク自体が存在しないことが判明。事実情報の実体確認が結論を変えた具体例として記録。
- **参考**: cycle-181 では `permanentRedirect()` を 301 と誤記したが、実体は HTTP 308（researcher レポート 2 §1）。本サイクルではリダイレクト実装自体が不要のため、この種の誤記リスクは初手から発生しない。

#### 7. /play 一覧用 OGP 画像の新規作成 → 別 backlog として切り出す（本サイクルでは作らない）

- **理由**: 現状 `(legacy)/play/` 直下に `opengraph-image.tsx` / `twitter-image.tsx` は存在しない（researcher レポート 1 §追記）。新規作成は SNS シェア時の見栄えを向上させ来訪者価値に繋がるが、デザイン方針の検討（DESIGN.md §3 絵文字禁止下での視覚表現、ブランド統一）が独立スコープとして必要。これを Phase 4.2 のスコープに含めるとサイクルが肥大化する。
- **対応**: 本サイクル完了時に backlog へ「/play 一覧 OGP 画像作成」を別チケットとして起票する（キャリーオーバー欄に明記）。/blog や /tools の一覧 OGP 整備状況も併せて棚卸しする提案を含める。

#### 8. 絵文字除去後の視覚的識別 → Panel + タイポグラフィのみ（Lucide も原則使わない）

- **採用**: アイコン・絵文字を完全に廃し、Panel（枠線 + 背景色）とタイポグラフィ（カテゴリラベル、見出し、説明文、メタ情報）のみで識別性を確保する。
- **理由**: DESIGN.md §3「絵文字は使わない」「アイコンは原則として使わない」、§2「色は機能を伝えるためだけに使う。装飾のために色を使わない」。/tools のカードも Lucide を使わず Panel + タイポで成立しているため、サイト内一貫性が保てる。カテゴリラベルの文言（「占い」「診断」「クイズ」「ゲーム」相当）が識別の主担当。
- **棄却した代替**:
  - Lucide アイコン採用（カテゴリごとの線画アイコン）: DESIGN.md §3 が「原則として使わない」と規定しており、カテゴリ識別という目的のためだけに採用する強い根拠がない。タイポでカテゴリ名を明示すれば識別は十分達成可能。
  - 絵文字を残す: DESIGN.md §3 違反のため不可。

#### 9. CategoryNav.tsx の扱い → 削除

- **理由**: 現行 CategoryNav は「セクション内アンカー（`#fortune` 等）への sticky ナビ + IntersectionObserver でアクティブ追跡」という責務。本サイクルでセクション構造を廃止して単一グリッド + URL パラメータベースのフィルターに統合するため、責務そのものが消滅する。残置は dead code を生む。
- **代替**: 新 PlayFilterableList が「カテゴリ切替ナビ」の責務を引き継ぐ（`<Link>` + `aria-current="page"`）。スクロール追従 sticky 化の必要性は単一グリッドでは原則ないが、グリッドが長くなる場合（20 件 × カードサイズ次第）にフィルターナビを sticky 化する判断は builder が DESIGN.md と整合する範囲で検討する。

#### 10. コンポーネント配置先 → `src/play/_components/`（cycle-181 と同方針、責務分離は B-334-2-2 で明記）

- **採用**: 新規 PlayCard / PlayFilterableList / PlayGrid / PlayListView を `src/play/_components/` に配置（既存の PlayRecommendBlock / RecommendedContent / RelatedContentCard と並置）。
- **理由**: cycle-181 で確立した `src/tools/_components/` と同方針。ドメインロジック（`src/play/registry.ts` など）と近接配置することで import パスが浅く、責務の所在が明確になる（一覧 UI は play ドメインの責務）。
- **棄却した代替**:
  - `src/play/_components/list/` のサブディレクトリ化: 現時点で 4 ファイル程度であり、サブディレクトリ化のコストに見合うほど分量が増えていない。将来的にファイル数が増えた際に再検討可能。
  - `src/app/(new)/play/_components/`（ルート側に配置）: cycle-181 のツール側でドメイン側 `src/tools/_components/` を採用しているため、サイト内一貫性に反する。Route Group 移行時の二重配置も避ける必要がある。
- **責務境界の明文化**: B-334-2-2 で「既存の PlayRecommendBlock / RecommendedContent / RelatedContentCard は詳細ページ用、新規 PlayCard 等は /play 一覧ページ用」と責務を分離する旨を明記済み。本サイクルでは既存の関連表示コンポーネントを一切触らない。

#### 11. B-386（Button/Input min-height 44px）の扱い → 本サイクル内では個別上書きで継承（B-386 は前倒ししない）

- **採用**: cycle-181 と同様に `.filterButton` および検索入力 `.searchInput` 相当で `min-height: 44px` を個別上書きする。AP-I02 抵触は継承する。
- **理由**:
  - B-386 はサイト全コンポーネントへの影響が広い変更（researcher レポート 3 §6-B）であり、Phase 4.2 と同サイクルで扱うとサイクルが肥大化し、独立タスクの混在による品質劣化リスクが高まる（AP-WF07 警戒）。
  - 一方で、B-386 を待って Phase 4.2 を遅らせる選択は、Phase 4 全体（4.1〜4.4）の進行を遅らせ、Phase 5（横断検索）以降の連鎖遅延を生む。
  - 個別上書きで「同じ場所に既に同じ抵触がある」状態を 1 サイクル分だけ追加する影響は、B-386 解消時に一括除去できることを踏まえれば許容範囲。
- **棄却した代替**:
  - 本サイクル中に B-386 を前倒し対応: スコープ肥大、独立タスクの混在による品質リスク。
  - B-386 完了まで Phase 4.2 を保留: Phase 4 全体の連鎖遅延、来訪者価値の機会損失。
- **キャリーオーバー記録**: cycle-181 のキャリーオーバー欄と同じく、本サイクルでも個別上書きの再発生を明記し、B-386 解決時の整理対象に追加する。

### 完了基準

以下がすべて満たされた時点で Phase 4.2 完了とする（**観測可能な形のみで列挙**）。

#### ルート・基本動作

- `/play` が `(new)/` 配下のソースから配信されている（`src/app/(new)/play/page.tsx` が存在し、`src/app/(legacy)/play/page.tsx` および `page.module.css` は git 上で削除済み）。`(legacy)/play/page.module.css` 内の `:global(:root.dark)` セレクタは fact-check.md §9 で「同ファイル内のローカルクラスのダーク版定義のみ、外部から参照される `:global` クラスは無い」ことを確認済みのため、削除で他コンポーネントが壊れる懸念はない。
- `/play` URL に対して HTTP 200 が返り、ヘッダー・フッターが (new) 共通レイアウト由来になっている（テーマトグルが表示される）。
- `(legacy)/play/` 配下の詳細ルート（`ls -d` で実体確認した 15 件: `[slug]/`、`animal-personality/`、`character-fortune/`、`character-personality/`、`contrarian-fortune/`、`daily/`、`impossible-advice/`、`irodori/`、`kanji-kanaru/`、`music-personality/`、`nakamawake/`、`traditional-color/`、`unexpected-compatibility/`、`yoji-kimeru/`、`yoji-personality/`、および固定 `[*]/result/[resultId]/` ルート（`find ... -type d -name result` で 10 件、うち `[slug]/result` は動的ルートのため除外して固定ルートとしては 9 件））が引き続き正常応答する。
- `(legacy)/play/_components/CategoryNav.tsx` および対応テストが git 上で削除されている。
- 既存 `(legacy)/play/__tests__/page.test.tsx` および `(legacy)/play/__tests__/` ディレクトリが git 上で削除されている（PM 決定: page.test.tsx は廃止し、新構造の振る舞いテストは B-334-2-5 のコンポーネント単位テストでカバーする）。
- dead code 整理（観測可能な完了条件として列挙）:
  - `getPlayFeaturedContents` 関数および `PlayFeaturedContent` interface が `src/play/registry.ts` から削除されている（`grep -rn "getPlayFeaturedContents\|PlayFeaturedContent" src/` の結果がゼロ。registry.ts の定義削除と registry.test.ts の describe 削除でクリーンになる。fact-check.md §4 で確認済みの通り、`recommendation.test.ts` には `getPlayFeaturedContents` も `PlayFeaturedContent` もヒットしないため除外条件は不要）。
  - `src/play/__tests__/registry.test.ts` から `getPlayFeaturedContents` を describe するブロックが削除されている。
  - `PLAY_FEATURED_ITEMS` および `PlayFeaturedItem` interface は **残置**されている（`src/play/recommendation.ts` で使用中のため。`grep "PLAY_FEATURED_ITEMS" src/play/recommendation.ts` が 3 箇所以上ヒットすることで残存が確認できる）。
  - `getHeroPickupContents` / `getDefaultTabContents` / `getNonFortuneContents` は **残置**されている（トップページから使用中のため。本サイクルで触れていないことを `git diff` で確認）。
  - `getDayOfYearJst` 関数は **残置**されている（汎用ライブラリ内の関数のため、関数単独削除の判断は後続サイクルへ送る）。
  - `(legacy)/play/page.tsx` 内のローカル定数・ローカル関数（`DAILY_PICKUP_SLUGS`、`getCtaText`、`PLAY_CONTENT_COUNT`）は page.tsx 削除と同時に消失している（`grep -rn "DAILY_PICKUP_SLUGS\|PLAY_CONTENT_COUNT" src/` の結果がゼロ。`getCtaText` は `PlayContentTabs.tsx` および `PlayRecommendBlock.tsx` の独立 2 定義は残置のため `grep` で 2 箇所残ることが正常）。
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（特に Next.js の Suspense ラップ要件を満たさない場合のビルド失敗が起きていないことを確認）。

#### デザイン適用

- カード・ヒーロー・フィルター UI に絵文字が一切含まれない（grep で `🔮|🧩|📚|🎨` 等が新ソースに存在しないこと）。
- カードに `accentColor` ベースの装飾色（`--play-accent` CSS 変数注入）が含まれない。
- カード CSS が `--bg`/`--fg`/`--fg-soft`/`--border`/`--accent`/`--r-normal` を使用している（Panel 規約に整合）。検証手段: `grep -E "var\(--(bg|fg|fg-soft|border|accent|r-normal)\)" src/play/_components/PlayCard.module.css` 相当のコマンドで 6 種の使用箇所が確認できる（具体的なクラス名は builder の判断、grep の対象トークンが網羅されていればよい）。
- フィルター絞り込みリンク CSS が `--r-interactive` を使用し、アクティブ状態が `data-active="true"` セレクターで表現されている。
- カード等高（`height: 100%; box-sizing: border-box;`）が PlayCard CSS に存在する。
- **PlayListView コード上で `Suspense` が import され、PlayFilterableList が `<Suspense>` でラップされている**（Next.js 仕様要件、cycle-181 ToolsListView と同型）。

#### フィルター・検索の振る舞い

- `/play` 初期状態（`?category=` なし、`activeCategory === null`）で「すべて」リンクに `aria-current="page"` が付与されている。
- `/play?category=game` で category=game のコンテンツのみ表示され、「毎日のパズル」リンクに `aria-current="page"` が付与される。
- 不正な `?category=invalid` で全件表示にフォールバックする（`activeCategory === null` への正規化により、結果として「すべて」がアクティブになる）。
- 検索入力に文字を入力後 300ms 以内に URL に `?q=...` が反映される（debounce 動作）。
- `?q=` に該当ヒットなしの場合、`role="status"` 付きのメッセージ「該当するコンテンツが見つかりませんでした。キーワードを変えるか、カテゴリを切り替えてみてください。」が表示される。
- カテゴリリンクの href にキーワード（`?q=...`）が引き継がれる。

#### NEW バッジ・ソート

- カードの並び順が `publishedAt` 降順になっている。
- NEW バッジが「上位 5 件 × 直近 30 日」の積集合に対してのみ表示される（テストで証明）。
- 「毎日更新」バッジが `DAILY_UPDATE_SLUGS` の 5 件に表示されている。

#### a11y / WCAG

- **フィルターリンク・検索入力**の `min-height` が 44px 以上（DevTools / 計算スタイルで確認。これは B-386 未完了下での個別上書き継承）。**カード（`<Link>` 全体）**は自然な高さがバッジ + カテゴリラベル + タイトル + 説明 + メタ情報の積み重ねで数百 px に達するため、CSS literal の `min-height: 44px` 指定は要件としない。代わりに **DevTools で `getBoundingClientRect()` の `height` および `width` が 44px 以上**であることを視覚検証時に 1 枚で確認する（WCAG 2.5.8 Target Size Minimum の実質要件）。
- focus-visible 時に DESIGN.md §2 末尾のフォーカススタイル規約に準拠したアウトラインが描画される。
- `<nav aria-label="カテゴリで絞り込む">` がフィルターナビを内包している。
- WCAG 2.4.5: `/play` への到達経路が複数存在する（Header ナビ、Footer リンク、トップページからの動線、sitemap.xml）。

#### 視覚検証（PM 自身による）

- 5 シナリオ × 4 パターン = **20 枚**のスクリーンショット（{初期 / カテゴリ絞り込み中（personality）/ 検索結果あり / カテゴリ + キーワード併用ヒットあり / カテゴリ + キーワード併用で空} × {w360, w1280} × {light, dark}）を `./tmp/cycle-182/screenshots/` に保存し、本ファイル「実装後の視覚確認」欄に確認結果を記録する。
- 観測必須要素（B-334-2-6 で列挙）: NEW バッジの視覚（PM 決定手段 (c): `src/play/quiz/data/word-sense-personality.ts` の `publishedAt` 一時書き換え + 撮影 + `git checkout` で復元 + `git diff` 差分ゼロ確認、を `./tmp/cycle-182/visual-check.md` に手順記録）、「毎日更新」バッジ 5 件、同一カテゴリ連続時の識別性、カテゴリ + キーワード併用時の href 引き継ぎ。
- 並べ読み成果物（4 列: 計画リスト / 実装存在 / 差分 / 判定）を `./tmp/cycle-182/visual-check.md` に残す。

### 計画にあたって参考にした情報

- **`./tmp/cycle-182/fact-check.md`** — **本計画書の事実情報の一次根拠**（Bash 実行コマンドと出力をすべて転記。publishedAt 全件・日付別件数・dead code 候補の使用箇所 grep・詳細ルート件数・result ルート件数・personality カテゴリ件数と命名類似 5 件の特定・seoTitle 設定状況・page.module.css の `:global` 定義・cycle-181 違反 6 の存在確認・DAILY_UPDATE_SLUGS 5 件・CATEGORY_DISPLAY_ORDER 表示名）。**計画書本文の数値・列挙はこのファイルからのみ転記**しており、記憶や他者の記述からの引き写しは行っていない（AP-WF12 / AP-WF09 構造的予防）
- `tmp/research/2026-05-07-play-listing-page-structure-investigation.md` — /play 配下の現状構造の網羅調査（ルート構造、コンテンツ件数、ページネーション不在、PlayContentMeta フィールド、テスト所在等の事実確認。ただし詳細ルートディレクトリ数は本サイクルで `ls -d` で実体再確認した結果 **15 件**であり、研究レポート 1 §1.2 の「12 ディレクトリ」記述は誤り。reviewer B M-1 で指摘）
- `tmp/research/2026-05-07-phase41-final-patterns-for-phase42.md` — cycle-181 で確立した Phase 4.1 実装パターン（コンポーネント分割、Link + aria-current、debounce 検索、NEW 積集合、不正カテゴリ防御、空状態 role=status、カード等高、`permanentRedirect()` の HTTP 308 等）
- `tmp/research/2026-05-07-phase-4-2-play-list-design-migration-research.md` — ターゲット yaml 引用、design-migration-plan.md Phase 4 要件、DESIGN.md §2/3/4/5、AP チェックリスト、knowledge ベース、B-386 状況
- `docs/cycles/cycle-181.md` 全文（実施記録、追加実装 R1-R3、completion 後修正 R1-R5、事故報告書 21 件）
- `docs/targets/気に入った道具を繰り返し使っている人.yaml`（M1b、副次ターゲット = 俯瞰用途）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（M1a、主要ターゲット = 一覧の玄関口）
- `docs/anti-patterns/planning.md`（AP-P01 / 04 / 07 / 08 / 14 / 16）
- `docs/anti-patterns/implementation.md`（AP-I02 — B-386 個別上書き継承の根拠）
- `docs/anti-patterns/workflow.md`（AP-WF01 / 02 / 03 / 05 / 07 / 09 / 11 / 12）
- `docs/knowledge/css-modules.md`（`:global(:root.dark)` パターン）
- `docs/knowledge/nextjs.md`（Route Group 移行、useSearchParams + Suspense、localStorage 注意点、`permanentRedirect()` の HTTP 308）
- `DESIGN.md` 全文（§2 カラートークン、§3 タイポ・絵文字禁止、§4 Panel 規約、§5 コンポーネント使用義務）
- `docs/design-migration-plan.md` Phase 4 セクション（4.2 範囲、a11y 責務、ヘッダー設計の前提）
- `docs/backlog.md` B-334（Phase 4.2 スコープ）と B-386（Button/Input min-height 44px、Queued 状態のキャリーオーバー）

### 実装後の視覚確認

PM 自身（メインエージェント）が Playwright MCP 経由で 5 シナリオ × {w360, w1280} × {light, dark} = **20 枚を撮影**し、計画書 §B-334-2-6 の観測対象を 1 つずつ確認した。並べ読み成果物は `tmp/cycle-182/visual-check.md` に 22 行 4 列の照合表として残した。スクリーンショットは `tmp/cycle-182/screenshots/s{1-5}-{scenario}-w{360|1280}-{light|dark}.png` に保存。

**確認結果**:

- 22 観測項目すべて OK 判定（不一致ゼロ）
- s2 personality カテゴリ 12 件で命名類似 5 件が連続表示されても shortDescription で個別判別可能 → 補強案 (i)(ii) 発動なし、Lucide 採用 escalation も不要
- s5 空状態（game + 性格 = 0 件）で `role="status"` 付きメッセージと「キーワードを変えるか、カテゴリを切り替えてみてください」誘導文言が正しく表示
- 毎日更新バッジ（`--warning-soft/strong`、オレンジ系）が NEW バッジ用 `--accent-soft/strong`（青系）と色味で明確に区別可能（NEW バッジは現時点で 30 日以内 0 件のため未表示、論理は実装テストで保証）
- コンソール警告・エラー 0 件（dev サーバー側の HMR connected と React DevTools 推奨ログのみ）
- ブラウザは PM 自身が `mcp__playwright__browser_close` で閉じた

cycle-181 違反 13 / 15 同型再発の予防として、PM 自身が撮影 → 観測対象を 1 つずつ照合 → 並べ読み成果物作成、の順序で実施。スクリーンショットを reviewer に丸投げせず、PM 自身が「来訪者として最高の体験が得られるか」を確認した。

### 違反予防チェック（計画着手時の自己確認）

| 予防対象（出典）                                                                        | 本計画での予防策                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cycle-181 違反 1-6 / AP-P07（来訪者価値の出発点）                                       | 「来訪者価値」節を yaml フィールド引用 → ニーズ → 設計要件 → 実装方式の 3 段推論で記述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| cycle-181 違反 2 同型（ターゲット主要/副次の表面的読み込み）/ 本サイクル R1 で発覚      | ターゲット主要/副次選定を yaml の動線記述から再導出（M1a 主要、M1b 副次へ修正）。サイト内一貫性は M1a / M1b 共通要件として再構築                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| cycle-181 違反 6（URL 反映方式の不整合）                                                | カテゴリ・キーワード両方を URL クエリパラメータ（`?category=` / `?q=`）で表現し、`buildCategoryHref` で相互引き継ぎ。ブックマーク可能性とブラウザ戻る対応を統一方式で担保                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| cycle-181 違反 16/18 / AP-P07（UI セマンティクス不整合）                                | カテゴリ絞り込み UI を「来訪者の認知モデル = タブ」から先に決定し、`<Link>` + `aria-current` を採用                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| cycle-181 違反 9 / AP-WF07（独立タスクの一括委任 / 並行不能タスクの並行アサイン両方向） | タスクリストを B-334-2-1 〜 B-334-2-6 + dead code 整理に分割。**ただし B-334-2-2/3/4 は同一ファイル（PlayCard / PlayFilterableList）への変更を含むため並行不能。同一 builder へ直列依頼する旨を「実施する作業」冒頭で明記**。AP-WF07 の例外条件: 「同一ファイルへの逐次変更を別 builder で並行アサインしない」も同等に重要であり、本サイクルではこの方向で予防                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| cycle-181 違反 7-8 / AP-WF03（builder への literal 指示）                               | 各タスクは「何を / なぜ / 最終状態」止まり、JSX 構造・CSS クラス名・assertion 文言の literal は書いていない。focus-visible 値も DESIGN.md §2 規約準拠と表現。Lucide アイコン採用（DESIGN.md 改訂相当）は builder 判断不可・PM escalation 必須                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| cycle-181 違反 19 / AP-WF12（事実情報の未確認）                                         | **すべての事実情報は Bash 実行結果からのみ転記**（記憶・他者の記述・過去サイクル記述・研究レポート記述は一切信用しない）。実行コマンドと出力を `./tmp/cycle-182/fact-check.md` に保存し、計画書の数値・列挙はそこから一字一句転記する。計画書を 1 文字書く前に Bash で再確認するワークフローを採用。dead code 候補は **全関数について `grep -rn` で他用途参照を確認**し、未使用のもののみを列挙対象とする                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **本サイクル R1/R2 で発覚した同型再発（AP-WF09 / AP-WF12 の運用形骸化）**               | R1 修正で「違反 19 を予防した」と謳いながら R2 で publishedAt 集計と dead code 列挙の両方で AP-WF12 同型再発。R3 では (a) `fact-check.md` に Bash 実行コマンドと出力を残してから計画書本文を書く順序を厳守、(b) 計画書執筆後に PM 自身が事実情報部分を 1 つずつ読み直し「これは Bash で確認したか / どの fact-check.md 項目に対応するか」を自問するチェックを追加。**(b) の対象には「ターゲット主要/副次のラベル整合性」（本文・違反予防表・参考情報リストの 3 箇所すべてで M1a / M1b の主要・副次ラベルが一致するか、grep で「M1b」「主要ターゲット」「副次ターゲット」を検索して全箇所を点検）を必ず含める**（本サイクル R3 で参考情報リストのラベルが旧構造のまま残った AP-WF09 同型再発を踏まえ、構造変更の波及範囲チェックを明文化）。(c) dead code 候補は使用箇所 grep を全関数について実行する手順を明文化。AP-WF09（チェックリスト形式通過）の構造的予防として、**「違反予防表に書いた内容そのものを、計画書本文の事実記述ごとに点検する」二段確認**を採用 |
| cycle-181 違反 11/12/15/20（reviewer 依存の完了判定）                                   | 完了基準を観測可能な記述（grep / DevTools / テストで証明可能）のみで列挙。NEW バッジ実装の境界条件（4 ケース）と `getAllByText("毎日更新").length === 5` を明記                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| cycle-181 違反 13 / AP-WF05（4 パターン視覚確認漏れ / シナリオ独立化漏れ）              | B-334-2-6 で **20 枚（5 シナリオ × 4 パターン）**の視覚検証を PM 自身に課し、NEW バッジ / 毎日更新バッジ / カテゴリ + キーワード併用（ヒットあり / 空の両方）/ 同一カテゴリ連続時の識別性を独立観測対象として明示。NEW バッジの Date 巻き戻し手段も PM 決定済み                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| AP-P16（複合条件の片側未確認）                                                          | `/play/page/[page]` の存在 + ページネーションロジックの両方を独立に確認。詳細ルート件数も `ls` 結果と研究レポートの突き合わせで複合確認                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| AP-WF11（並べ読み欠落）                                                                 | cycle-181 の Phase 4.2 踏襲パターン 11+ 項目（Suspense ラップ含む）を 1 項目ずつ B-334-2-2 / 完了基準にマッピング。並べ読み成果物を `./tmp/cycle-182/visual-check.md` に残す                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## レビュー結果

### 計画レビュー

- **R1（A1 + B1 並行）**: 計 18 件（Critical 3 / Major 8 / Minor 14 / 観察 3、重複あり）。主要 = M1b 選定の論理破綻 / イチオシ廃止根拠の Decision 負荷混同 / NEW 閾値「同オーダー」根拠の薄さ / publishedAt ソートと M1b の自己矛盾 / 識別性の実機検証不足 / Suspense ラップ完全欠落 / B-334-2-2/3/4 並行不能性未明示 / 詳細ルート 12 件の事実誤認 / 既存 \_components 責務分離未明示 / page.test.tsx 処遇 / 視覚検証 16 枚不足 等。すべて修正済み。
- **R2（A2 + B2 並行、全体見直し含む）**: 計 16 件（Critical 3 / Major 7 / Minor 13、重複あり）。R1 修正で**新たに混入**した事実誤認 2 件（publishedAt 集計値の乖離、dead code 列挙にトップページ使用関数を含む）が cycle-181 違反 19（AP-WF12）と完全同型で再発。これは AP-WF09（形式通過）の典型例として最重視。`./tmp/cycle-182/fact-check.md` を新設し、計画書本文を 1 文字も書く前にすべての事実情報を Bash 実行結果から転記する手順に変更。すべて修正済み。
- **R3（A3 + B3 並行、全体見直し含む）**: B3 は承認（指摘なし）。A3 は Major 2 / Minor 4 / 観察 3。M1（参考情報リストの「主要ターゲット」ラベル未修正、AP-WF09 同型）と M2（newSlugsHelper 外出し前提が B-334-2-2 に未記載）。すべて修正済み。修正後に `grep -nE "M1b|主要ターゲット|副次ターゲット"` を実行し全 11 箇所のラベル整合性を確認。
- **R4（A4、全体見直し）**: Critical / Major ゼロ、Minor 1 / 観察 2（許容範囲）。Mn1（L165 の文言曖昧、`page.test.tsx` の処遇が一義的でない）のみ。PM が直接編集で修正。
- **R5（A5、Mn1 修正の再レビュー）**: 指摘なし、承認。計画書は builder 着手に進めて問題なしと判定。

### 計画段階での違反予防の自己評価

cycle-181 の事故報告書 21 件のうち、計画段階で構造的に予防できた違反:

- 違反 1-6（来訪者価値の出発点不足）: §来訪者価値 で yaml 引用 → ニーズ → 設計要件 → 実装方式の 3 段推論を明示
- 違反 16/18（UI セマンティクス不整合）: §検討した他の選択肢 §2 で来訪者の認知モデル起点で UI 方式を選定
- 違反 9（独立タスクの一括委任）: §実施する作業 冒頭 callout で並行可否を明示
- 違反 7-8（builder への literal 指示）: 各タスクは「何を / なぜ / 最終状態」止まりに限定
- 違反 19（事実情報の未確認）: fact-check.md 経由で全事実情報を Bash 実行結果から転記。R2 で同型再発を起こしたが R3 で構造的予防策を確立

レビュー観点が R1 → R2 → R3 → R4 → R5 と段階的に深化し、特に R2 で発覚した同型再発は計画書の「違反予防チェック表」に明記済み（実装フェーズでも同じ予防策を適用すること）。

### 実装レビュー

<!-- /cycle-execution フェーズで builder 完了後にここへ追記する。 -->

## キャリーオーバー

<!-- このサイクルで完了できなかった作業があれば記録する。 -->

## 補足事項

- Phase 4 全体（B-334）は 4 サイクルに分割して実施する。本サイクルは Phase 4.2（遊び一覧）のみ。Phase 4.3（ブログ一覧）、4.4（トップ）は後続サイクルで実施する。
- cycle-181（Phase 4.1）の実施記録と事故報告書（21 件）を計画段階で必ず参照すること。同型の違反を繰り返さないために、計画立案時にチェックポイントを組み込む。
- Phase 4.4（トップ）移行時のコンテンツ扱い: コンテンツは「占い・診断パーク」のままデザインだけ新版に移行する。コンセプト切替は Phase 9.2（B-336）まで待つ（cycle-180 申し送り）。
- **AP-WF07 への追記提案（サイクル完了時に対応）**: 現行 AP-WF07 は「独立タスクの一括委任」のみを記述しているが、本サイクルで扱った「同一ファイルへの逐次変更を別 builder で並行アサインしない（逆方向）」は AP-WF07 の同義反復だが現行記述には明示されていない。サイクル完了時に AP-WF07 へ「**同一ファイルを変更する複数タスクは、独立性が保てないため別 builder で並行アサインしない（逐次的依存がある場合は同一 builder へ直列依頼）**」を追記する（Reviewer B m-8 への対応）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
- [ ] **AP-WF07 への追記が完了している**（補足事項に記載の「同一ファイルを変更する複数タスクは別 builder で並行アサインしない」を `docs/anti-patterns/workflow.md` の AP-WF07 本体に追記）。サイクル完了処理の中で確実に実施すること。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
