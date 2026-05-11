---
id: 187
description: design-migration-plan.md Phase 6 = B-335「ブログ詳細ページの新デザイン移行」を実施する。/blog/[slug] のテンプレート 1 セットを (legacy) から (new) へ移し、DESIGN.md 準拠の新デザインを適用する。Article JSON-LD・目次・シェアボタン・関連記事などの既存機能は維持。記事 100+ 件は同一テンプレートから動的生成されるため、テンプレ移行 1 件で全件が新デザインへ切替わる。
started_at: "2026-05-11T19:15:45+0900"
completed_at: null
---

# サイクル-187

このサイクルでは、移行計画 Phase 6（B-335）として **ブログ詳細ページ `/blog/[slug]`** を `(legacy)/` から `(new)/` へ移行し、DESIGN.md 準拠の新デザインを適用する。記事は 100+ 件あるが同一テンプレートから生成されるため、テンプレ 1 セットの移行で全記事が一斉に切替わる。Phase 4（一覧・トップ）が cycle-181〜185 で完了し、Phase 5（横断検索）は cycle-186 で ② 転換によりスキップ確定したため、Phase 6 着手前提条件は達成済み。Article JSON-LD / 目次 (TOC) / シェアボタン / 関連記事 / シリーズナビゲーション等の既存機能を一切壊さず維持しながら、ブログ一覧（cycle-183 で確立済み）と視覚的に連続するデザインに揃えることが本サイクルのゴール。

## 実施する作業

- [x] /cycle-planning で詳細計画を立案する
- [ ] 計画レビューを受け、指摘を反映する
- [ ] /cycle-execution で実装を実施する（B-335-1 移行前撮影 / B-335-2 git mv + import 差替 / B-335-3 5+1 CSS Module トークン置換 / B-335-4 読み物としての再設計適用 / B-335-5 TrustLevelBadge 撤去 / B-335-6 テスト調整 / B-335-7 視覚・機能検証）
- [ ] 実装レビューを受け、指摘を解消する
- [ ] /cycle-completion で完了処理する

> サブタスクは下記「### 作業内容」のチェックリストに分解済み。

## 作業計画

### 目的

ブログ詳細ページ `/blog/[slug]` を `(legacy)/` から `(new)/` へ移行し、DESIGN.md 準拠の新デザインを適用する。3 ターゲット（AI の日記を読み物として楽しむ M-α / Web サイト製作を学びたいエンジニア M-β / AI エージェント・オーケストレーションに興味があるエンジニア M-γ）にとって本ブログ詳細ページは「サイトに来た主目的を満たす最終到達点」であり、本サイクルでは以下を達成する。

- **M-α への価値**: cycle-183 で新デザイン化された一覧から流入したときに、視覚的・タイポグラフィ的に「同じサイトを読み続けている」連続性を確立する。読み物体験（書き手の息づかい / 揺れ / 細部）を阻害する装飾（無駄な余白破綻 / 不適切な改行幅 / 視認性の低いコードブロック）を取り除く。
- **M-β への価値**: コード例の可読性（適切な等幅フォント・コード背景・横スクロール・コピー容易性）を確保し、Markdown 内のコード断片が「自分のプロジェクトに取り入れられる」状態を維持する。長文記事でも段落・見出し階層・行間が読み疲れない設計にする。
- **M-γ への価値**: Mermaid 図（11 記事で使用）と GFM Alert（注釈・警告）がライト/ダーク両方で正しくレンダリングされること、シリーズナビ・関連記事による「試行錯誤の連続性」の発見が阻害されないこと。

既存機能（Article JSON-LD / 目次 / シェア / 関連記事 / シリーズナビ / パンくず / 公開日・更新日・読了時間 / Mermaid / GFM Alert / PlayRecommendBlock / 前後ナビ）を毀損ゼロで維持する。

本サイクルの目的は **「Phase 6 = テンプレ 1 セット移行による 60 記事一斉切替」** であり、トークン機械置換にとどまらない「読み物としての再設計」までを射程に含む（標準手順 Step 5 の本来の意図）。

### 作業内容

並列可否を [P] = 並列可 / [S] = 直列必須 で示す。1 サブタスク = 1 builder + 1 commit を基本（実装内容が同一ファイルを跨ぐ場合は同一 builder へ直列依頼）。

- [ ] **T1pre [S]** 代表 6 記事の slug を **PM が本計画書内で確定**（execution 段階に判定を持ち越さない、I6 反映）
  - 確定済み slug（PM 判断、`src/blog/content/` の実体確認とフロントマターから選定）:
    1. **短文記事**: `2026-05-07-letter-from-an-ai-that-cant-see-the-future`（110 行、段落短く TOC が薄い／無いケースの代表）
    2. **長文記事**: `2026-02-13-how-we-built-this-site`（最初期記事、サイト概観で TOC が長く、デスクトップ sticky 動作要観察）
    3. **Mermaid 図を含む記事**: `2026-03-02-mermaid-gantt-colon-trap-and-render-testing`（Mermaid Gantt を題材にしている記事自身、ライト/ダーク両方の SVG 再レンダ確認に最適）
    4. **GFM Alert を多用する記事**: `2026-03-01-admonition-gfm-alert-support`（309 行、`.markdown-alert*` の体系的検証）
    5. **シリーズに属する記事 + 関連記事複数**: `2026-03-05-ai-agent-concept-rethink-1-bias-and-context-engineering`（3 部作シリーズの初回、SeriesNav の前/次表示・RelatedArticles の表示が観察可能）
    6. **`site-updates` カテゴリ + サイト機能を題材にする記事 + 中尺**: `2026-02-28-content-trust-levels`（206 行、`category: site-updates`、サイト機能（信頼レベル機能）を題材にする記事。T9 の TrustLevelBadge 撤去前後の比較対象として題材的関連はあるが、**撤去対象のバッジ表示はコード側ハードコード（`src/blog/_lib/blog.ts` L189 / L235 の `trustLevel: "generated" as const`）で全 60 記事一律に表示されるため、撤去前後の比較はどの記事でも同等**である。記事 6 を特別扱いする必要はないが、**(a) `site-updates` カテゴリの代表として（他 5 件は `ai-workflow` / `dev-notes` のため網羅性確保）、(b) 「サイト機能を題材にする記事」が新デザインでどう見えるかを観察する代表として** 採用する。r3 反映の事実訂正: r1〜r2 時点の「フロントマターに `trustLevel` を明示している」記述は事実誤認のため撤回（記事 6 本文 L122 で「frontmatterにtrustLevelフィールドを追加するのではなく、コード内で一律 `"generated"` を設定しています」と planner が選定した記事自身が明示している）。
  - 軸の網羅性（I6 で追加された 3 観点も含む）:
    - **TrustLevelBadge 表示記事**: 全 60 記事一律に表示されるため、6 件すべてが撤去前後比較対象（記事 6 を特別扱いする必要はない、r3 反映で事実訂正）
    - **TagList の `linkableTags` フィルタ挙動（リンク可能タグと非リンクタグの混在）の観察**: r3 反映の事実訂正。**`linkableTags` は frontmatter のフィールドではなく**、`src/blog/_components/BlogListView.tsx` L83-86 で `new Set(getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE=3))` として **runtime 算出される派生集合**である（記事ごとの `tags` 配列に対し「投稿数 3 件以上のタグ」のみを Set として渡し、`BlogCard` / `TagList` 側で `tags.filter(t => linkableTags.has(t))` でフィルタリングされる）。本計画書で確定した 6 slug の `tags` を `src/blog/_lib/blog.ts` の `getTagsWithMinPosts(3)` の実体（=投稿数 3 件以上のタグ集合）と突き合わせた結果、**6 件中 6 件すべてのタグが「リンク可能タグ」に属する**ことを確認済み（記事 1: 4/4、記事 2: 4/4、記事 3: 3/3、記事 4: 3/3、記事 5: 5/5、記事 6: 4/4 が linkable）。よって主 6 件では「フィルタで非表示にされるタグが存在するときの TagList 表示」を観察できないため、**TagList の filter 挙動観察用に補助 1 件 = `2026-05-04-scroll-lock-reference-counter-for-multiple-components`（`tags: ["Next.js", "React", "Web開発", "設計パターン", "アクセシビリティ"]` のうち `React` / `アクセシビリティ` の 2 件が非リンクタグ）を T11 にて 1 追加観察対象として明示**する（撮影 4 枚は不要、TagList 部分のみ視覚確認）。主 6 件は再選定せず固定する（execution での再判断は行わない、I6 厳守）。
    - **カテゴリ分散の事実**: r3 反映の事実訂正。本計画書の 6 slug を `getAllBlogPosts()` の `category` フィールドで集計すると、**記事 1=`ai-workflow` / 記事 2=`ai-workflow` / 記事 3=`dev-notes` / 記事 4=`dev-notes` / 記事 5=`ai-workflow` / 記事 6=`site-updates`** であり、**実際は 3 カテゴリ（`ai-workflow` ×3、`dev-notes` ×2、`site-updates` ×1）に分散**する。r1 / r2 までの計画書本文の「6 軸でカテゴリ分散」「5 軸」記述はいずれも事実誤認のため撤回する。網羅性の評価としては、`ALL_CATEGORIES`（`src/blog/_lib/blog.ts` L28-34 で定義された 5 カテゴリ = `ai-workflow` / `dev-notes` / `site-updates` / `tool-guides` / `japanese-culture`）のうち **3 カテゴリをカバー**する（5 カテゴリ全網羅ではない）。残る `tool-guides` / `japanese-culture` は本サイクル時点では撮影 6 軸（短文・長文・Mermaid・GFM Alert・シリーズ・TrustLevelBadge 表示）の代表性を満たす記事が存在しないため、本サイクルでは網羅対象から外し、視覚連続性は `/storybook` 全体撮影（T11 末尾）と `(new)/blog/category/[category]` 経由のパンくず確認（T12）で補完する。
  - 上記 slug は execution の T1 で確定値として使用する（**再選定不要 / 補助 1 件は TagList 観察のみ**）。

- [ ] **T1 [S]** 移行前スクショ取得（kickoff 直後ルール: AP-WF05 着手前撮影ルール）
  - T1pre で確定した代表 6 件 × {w360, w1280} × {light, dark} = 24 枚を `./tmp/` 配下に保存
  - 取得後に Owner / reviewer が「移行後の同等以上判定」に使えるよう `./tmp/cycle-187/before/` のファイル名規約（記事 slug + 幅 + テーマ）で保存

- [ ] **T2 [S]** Phase 6 着手前の前提条件確認
  - `(legacy)/blog/[slug]/` 配下のファイル群が survey と一致するか（5 ファイル）`Read` で実体確認
  - `src/blog/_components/` の 4 CSS Module + `PlayRecommendBlock.module.css` の旧トークン残存が survey 一致か `grep -rn "\-\-color\-" src/blog/_components/ src/play/_components/PlayRecommendBlock.module.css` で実体確認
  - **新版コンポーネントの module.css 旧トークン残存ゼロを実体確認**（C2 反映、AP-WF12 抵触防止）:
    - `src/components/ShareButtons/ShareButtons.module.css` を Read し旧 `--color-*` / `--max-width` / `--font-mono` 残存ゼロを確認（事実: 計画立案時点で確認済み = `--success` のみ使用、残存ゼロ）
    - `src/components/Breadcrumb/Breadcrumb.module.css` を Read し旧トークン残存ゼロを確認（事実: 計画立案時点で確認済み = `--accent` / `--fg` 系のみ、残存ゼロ）
    - **万が一どちらかに旧トークンが残存していれば、T6 の置換対象リスト（6 ファイル）に追加**する
  - `(new)/blog/[slug]/` が存在しないこと（移行先未占有）の確認
  - **`(new)/layout.tsx` 構造の副作用確認**（I5 反映）: `body { display: flex; flex-direction: column; min-height: 100vh }` + `<main style={{ flex: 1 }}>` の構造下で、ブログ詳細の `<div className={styles.container}>` が `margin: 0 auto` で中央寄せされるか、短文記事（記事 1）で `min-height: 100vh` 文脈下に Footer 浮きや空白破綻が起きないかを T11 視覚検証の観察ポイントとして明示する（具体的には記事 1 の w360/w1280 ライト両方で「main 領域の中央寄せ」「Footer 位置」「スクロール領域内の余白」を観察）
  - B-389（TagList 撤去）が **キャンセル済み Done**、B-391（情報設計再検討）が Deferred のままであることを backlog で確認 → 「TagList は現状維持で移行」を計画固定値として確定
  - MobileToc.test.tsx が `MobileTocBlock`（page.tsx 内インライン details/summary を模した model）のテストであり、`TableOfContents` を内側で render している実体を確認 → 後段 T8 の取扱判断の根拠とする

- [ ] **T3 [S]** 設計判断の確定（builder 着手前に PM が決め、計画書に追記）
  - **D1**: `--max-width` の置換先 — **旧体系の実値は `src/app/old-globals.css` L28 で `--max-width: 960px;`**（C1 反映、AP-WF12 / AP-P16 対応で実体確認済み）。旧詳細ページのコンテナ幅は実体 **960px** であり、計画 r1 で記述していた「1200px 相当」は事実誤認のため撤回する。新デザインでは DESIGN.md §4「画面幅は最大 1200px、文章等は必要に応じて 720px に制限」に従い、以下の二段構成に **再設計**する（旧 960px 単一構成からの構造変更を含む決定であることを明示）:
    - 本文プロース（`<article>` の段落・見出し・リスト等）: **max-width 720px**
    - 画像 / コードブロック / Mermaid 図 / 関連記事グリッド / TOC + 本文の 2 カラム枠などの広幅要素: **max-width 1200px**
    - 「旧 960px → 広幅 1200px」は約 1.25 倍の拡幅となるため、T11 視覚検証では以下を「同等以上」の観察ポイントとして明示する: (a) コードブロック横スクロール頻度の増減、(b) Mermaid 図の横方向比率と読みやすさ、(c) モバイル（w360）への影響（広幅指定はデスクトップでのみ意味を持つことを確認）、(d) 関連記事グリッドのカラム数と要素サイズが BlogCard 一覧との視覚連続性を保つか
  - **D2**: `--font-mono` の置換先 — **`src/app/globals.css` に `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` を 1 行追加**し、CSS Module 側は `var(--font-mono)` を維持する（I2 反映、DRY と全体最適を優先）。
    - **r3 Critical-B 反映の値訂正**: r1〜r2 時点の D2 では `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` という ui-monospace 始まりの値を採用していたが、`src/app/old-globals.css` L16 で既に `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` が定義されている（r3 で reviewer / planner が独立に Read 確認済み）ため、混在期間中に (new)/blog 側と (legacy)/dictionary 側でコード等幅フォントが分裂しないよう、**(new) globals.css の値を (legacy) old-globals.css と同一値に揃える** 方針を採用する。
    - **値統一方針の根拠（複数案比較）**:
      - **採用案 (P)**: (new) globals.css に old-globals.css と同一値（Menlo 始まり）を追加。
        - メリット: (a) `old-globals.css` を本サイクルで触らない（D5 fallback 案の「old-globals.css を本サイクルで触らない」原則と整合）、(b) 混在期間中にコード等幅フォントが (new)/(legacy) で分裂しない、(c) Phase 10.2 で (legacy) 削除時に globals.css 側だけが残り自然に整理可能。
        - 採用理由: 3 観点ですべて他案を上回る。
      - **却下案 (Q)**: (new) globals.css に `ui-monospace, SFMono-Regular` 始まりの新しい値を追加し、混在期間中の分裂を許容。
        - 却下理由: M-β（コードを取り入れるエンジニア）に「同じサイトのコードが場所によって違う等幅フォント」となる違和感を生み、Phase 6 のサイクル目的 L28-29「コード例の可読性確保」と矛盾。fallback 思想（D5 で (legacy)/(new) の見た目分裂を防ぐ）と直接矛盾する別系統の決定になる。
      - **却下案 (R)**: (new) globals.css に新しい値を追加し、同サイクル内で old-globals.css L16 の値も同じ新しい値に更新。
        - 却下理由: 「old-globals.css を本サイクルで触らない」原則（D5）に抵触。`old-globals.css` 改訂は Phase 10.2 = B-337 まで遅らせる方針と矛盾。
    - **判断理由**: Phase 7（ツール詳細）/ Phase 8（dictionary 詳細）でもコードブロックや等幅表示が確実に必要になり、Phase 6 で直値展開すると後続 Phase で同じ直値展開が量産され、最終的に `globals.css` への一元化を判断したときに広範囲の戻し作業が発生する。CLAUDE.md「better UX option is achievable, it must be chosen」は「Phase 全体での DRY を優先する方が来訪者価値の観点でも一貫したコードベース保守による事故予防になる」と整合する。
    - **DESIGN.md との関係（r3 S3-r3 反映で判断境界を明示）**: DESIGN.md §3 はフォントを「ブラウザのシステムフォント」に限定するが、§3 自体は本文用フォントの規定であり、コードブロックの等幅フォントは別物として `--font-mono` トークンで分離する。**DESIGN.md §3 への加筆は本サイクル内で行わず**、`globals.css` への 1 行追加のみで運用する（§3 改訂は AP-WF15 の同/別サイクル境界として別 backlog 化）。トークン追加自体は DESIGN.md §3 のフォント方針（システムフォント優先）と矛盾しない範囲（`Menlo` 等は OS 標準等幅フォントスタック）。
    - **「`globals.css` への追加」と「DESIGN.md への加筆」の判断境界（r3 S3-r3 反映）**: 一般的にはトークン追加 = DESIGN.md 反映が望ましいが、**本サイクルでは以下 3 条件を満たすため DESIGN.md 加筆を見送る**:
      1. `--font-mono` は `old-globals.css` L16 で既に (legacy) 側に定義されており、本サイクルで「新規トークン」を追加するのではなく「(legacy) 側に既存定義のトークンを (new) 側にも同じ値で複製」する性質の変更である。
      2. DESIGN.md §3 が「本文用フォント」の規定であり、コードブロック等幅フォントは §3 の射程外（§3 への追加ではなく `§3-3 補足` 的な扱いになり、§3 の構造改訂を伴う）。
      3. Phase 10.2 = B-337 で `old-globals.css` を削除する際、`--font-mono` は (new) globals.css にも残ることが確定しているため、その時点で「DESIGN.md §3 への加筆」を別 backlog として起票する方が、トークン定義状況と DESIGN.md の整合性を一括チェックできる（個別サイクルで都度加筆する方が整合チェック漏れのリスクが高い）。
         上記 3 条件のうちいずれかが崩れた場合（例: `--font-mono` 以外の新トークンを globals.css に追加する場合、DESIGN.md §3 の構造に直接該当する変更を加える場合）は、別の判断が必要になる。本サイクルは `--font-mono` 1 行追加のみに限定する。
    - **T6 への影響**: CSS Module 側は `--font-mono` を `var(--font-mono)` のまま維持する（置換不要）。`globals.css` への 1 行追加は T6 ではなく T7（DESIGN.md 準拠の再設計適用）の冒頭で実施する。
  - **D3**: TOC の配置 — デスクトップ（≥900px）は記事右側 sticky サイドバー、モバイルは記事冒頭の `<details>` 折りたたみ（現状踏襲）。**スクロール連動アクティブ状態の実装は本サイクルのスコープ外**（survey 通り別 backlog 化）。
  - **D4**: Panel の適用範囲 — 記事本文 `<article>` を **「透明 Panel」として収める**（I1 反映、案 (b) 採用）。
    - **実装手段の PM 確定（r3 重要-1 + r3 重要-A 反映で padding 値を確定）**: `src/components/Panel/index.tsx` の現状 API は `as` / `children` / `className` の 3 props のみで `variant` を持たない（実体確認済み、計画立案 r3 時点）。`src/components/Panel/Panel.module.css` の現状は `.panel { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-normal); padding: 1.5rem; }` の 5 プロパティ（r3 で planner / reviewer が独立に Read 確認済み）。「Panel の表現バリアント」を採用する以上、API レベルの拡張は **PM の設計判断であり builder への丸投げではない**ため、本計画書で確定する: **(i) `Panel` コンポーネントに `variant` プロパティ（型: `"default" | "transparent"`、未指定時は `"default"`）を追加し、`Panel.module.css` 側に `.transparent { background: transparent; border: none; padding: 0; }` を追加する**（padding 値も PM 確定、r3 重要-A 反映）。Phase 7/8（ツール詳細・dictionary 詳細）でも「説明文ブロックを透明 Panel として収める」用途が再利用可能になるため全体最適。
    - **`.transparent` の padding を 0 に確定する根拠（r3 重要-A 反映）**: 透明 Panel は本文 `<article>` を包む構造で、本文内の段落 / 見出し / コードブロック / Mermaid / 関連記事グリッドそれぞれが個別の `margin-top` / `padding` を持つ（T7 で再設計）。Panel 側で `padding: 1.5rem` 等の縦余白を持つと、本文側の `margin-top` と重複し「本文の縦余白が Panel 側と本文側の二重で発生する」事故が起きる。`padding: 0` にすることで縦余白の責務を本文側（`<article>` 内の段落・見出し）に一元化し、Phase 7/8 で「透明 Panel + 別の本文構造」を組む際にも縦余白の責務分離が明確になる。横方向のパディングについても、本文 720px / 広幅 1200px の二段構成（D1）は CSS Module 側の `max-width` で制御されるため、`.transparent` 側で横パディングを持つ必要がない。
    - **`Panel.module.css` の CSS specificity（同一要素に `.panel.transparent` 適用時の振る舞い）**: `.transparent` クラスは `.panel` と同じセレクタ強度（クラス 1 個）であり、後勝ちで適用される。`Panel/index.tsx` の `combinedClassName = [styles.panel, className].filter(Boolean).join(" ")` 構造下で、`variant="transparent"` 時は `[styles.panel, styles.transparent, className]` の順に結合して `<Tag>` に渡す実装になる（具体的な実装コードは builder の決定範囲）。CSS の Cascade で `.transparent` の `background: transparent; border: none; padding: 0;` が `.panel` の `background / border / padding` を上書きし、`border-radius` は `.transparent` 側で未指定のため `.panel` の値を継承する（透明 Panel に角丸は不要だが、ブラウザの描画上 `border-radius` は背景・境界が無ければ視覚的に意味を持たないので継承していても問題ない）。
    - **却下した実装手段（CSS Module 側で打ち消し）**: `Panel` を `default` のまま使い CSS Module 側で `background: transparent; border: none` を打ち消す方法は、形式上 §1 を満たすが「Panel に収まる」表現を打ち消しコードでしか担保しないため §1 解釈論的に弱く、Phase 7/8 でも個別 CSS 打ち消しが繰り返される懸念がある（AP-WF03 の射程線引き上、API 拡張の方が PM 責務として妥当）。
    - **builder への委譲範囲**: `variant="transparent"` の具体的な padding 値 / 適用先の JSX 構造 / `<article>` 周辺の縦余白の具体値は builder が DESIGN.md §3〜§4 の枠内で決定する。`Panel.module.css` への `.transparent` クラス追加 / `index.tsx` の `variant` props 受け取り実装は T7 のサブタスクとして実施。
    - TOC（デスクトップ）/ 関連記事 / シリーズナビ / 前後ナビ / PlayRecommendBlock は通常の `Panel`（`variant="default"`）に収める（入れ子なし）。
    - **DESIGN.md §1 適合性の判断**: §1 は「すべてのコンテンツはパネルに収まった形で提供される」と明言しており、本文を Panel から除外する判断は §1 の例外を作る決定になる。これを避け、§1 の文言を解釈拡張せず本文を **Panel の表現バリアント（透明）として収める** ことで §1 をそのまま満たす（DESIGN.md §1 の解釈変更を本サイクルで行わない、AP-I08 別側面と整合）。
    - **詳細は「### 検討した他の選択肢と判断理由 ③」参照**（I1 反映で 3 案再列挙）
  - **D5**: PlayRecommendBlock のトークン置換は本サイクルで実施する（dictionary 詳細レイアウトも `PlayRecommendBlock` を参照しているため、影響範囲は legacy ディクショナリ系。Phase 8 で移行予定）。
    - **`old-globals.css` 新トークン定義状況（r3 反映、重要-2）**: `src/app/old-globals.css` の `:root` を Read した結果、定義されているのは `--color-*` 系（`--color-primary` / `--color-text` / `--color-bg-secondary` / `--color-border` / `--color-success` 等）に限られ、新トークン体系の `--fg` / `--accent` / `--bg-soft` / `--border` / `--success` 等は **未定義であることを実体確認済み**（計画立案 r3 時点）。
    - **PM 確定の対処方針（fallback 採用）**: `PlayRecommendBlock.module.css` を新トークンへ置換するにあたり、**CSS 変数の fallback 構文（`var(--fg, var(--color-text))` のような第二引数 fallback）で両ケースに同時対応する**方式を採用する（builder 判断には委ねず計画書で確定）。
    - **fallback 採用の根拠（複製案との比較）**:
      - 採用 = fallback 案: (a) `old-globals.css` を本サイクルで触らない（`--max-width: 960px` などの旧体系を計画外に書き換えるリスクを回避）/ (b) Phase 10.2（B-337 = legacy 削除）で fallback の第二引数を機械的に削除すれば自然に整理できる / (c) (new) 側では `var(--fg)` が新トークンとして解決され、(legacy) 側では fallback の `var(--color-text)` 等が旧トークンとして解決されるため両ケースの視覚崩れ可能性が最小。
      - 却下 = `old-globals.css` 一時複製案: 新トークン定義を `old-globals.css` 側に一時複製する案は、(a) Phase 10.2 で 2 箇所削除が必要になり手戻りが増える / (b) 複製したトークンの定義値が `globals.css` 側と乖離した場合に「同じトークン名で別の値」が表示される事故リスクがある、ため却下。
    - **T6 への影響**: `PlayRecommendBlock.module.css` の置換規則は通常の `var(--fg)` ではなく `var(--fg, var(--color-text))` 形式を用いる。新トークンと旧トークンの対応は T6 置換規則表（`--color-text` ↔ `--fg`、`--color-text-muted` ↔ `--fg-soft`、`--color-primary` ↔ `--accent`、`--color-primary-hover` ↔ `--accent-strong`、`--color-bg-secondary` ↔ `--bg-soft`、`--color-border` ↔ `--border`、`--color-success` ↔ `--success`、`--color-bg` ↔ `--bg`）に基づき fallback を組み立てる。詳細は「### 検討した他の選択肢と判断理由 ④」参照。
  - **D6**: コードブロックのシンタックスハイライト導入は本サイクルのスコープ外。コードブロック背景 / ボーダー / 横スクロール / 行高 / 等幅フォントの「読みやすさ最低限」までを再設計する。
  - **D7**: TagList は現状維持で移行（B-391 で再検討中のため、撤去判断は本サイクルで行わない）。トークン置換のみ実施。

- [ ] **T4 [S]** `git mv (legacy)/blog/[slug]/ (new)/blog/[slug]/`
  - 5 ファイル（page.tsx / page.module.css / opengraph-image.tsx / twitter-image.tsx / **tests**/page.test.tsx）を git mv
  - 履歴を保持するため `git mv` で実施（cp + rm は禁止）

- [ ] **T5 [P]** import パス修正（page.tsx）
  - `@/components/common/Breadcrumb` → `@/components/Breadcrumb`
  - `@/components/common/TrustLevelBadge` → 削除（T9 で対応）
  - `@/components/common/ShareButtons` → `@/components/ShareButtons`
  - `@/blog/*` および `@/play/*` の import は変更不要（survey 確認済み）

- [ ] **T6 [P]** CSS Module の旧トークン置換（6 ファイル一括チェックリスト）
  - `src/app/(new)/blog/[slug]/page.module.css`（T4 で移動済み）
  - `src/blog/_components/TableOfContents.module.css`
  - `src/blog/_components/SeriesNav.module.css`
  - `src/blog/_components/RelatedArticles.module.css`
  - `src/blog/_components/TagList.module.css`
  - `src/play/_components/PlayRecommendBlock.module.css`（D5）
  - 置換規則: `--color-text` → `--fg` / `--color-text-muted` → `--fg-soft` / `--color-primary` → `--accent` / `--color-primary-hover` → `--accent-strong` / `--color-bg-secondary` → `--bg-soft` / `--color-border` → `--border` / `--color-accent` → `--accent` / `--color-bg` → `--bg` / `--color-success` → `--success` / `--max-width` → D1（本文 720px / 広幅 1200px の二段構成、CSS Module 側で個別宣言）/ `--font-mono` → **そのまま `var(--font-mono)` を維持**（D2 で `globals.css` 側に追加するため CSS Module 側の置換は不要）
  - **`PlayRecommendBlock.module.css` のみ fallback 構文を用いる**（D5 / r3 重要-2 反映）: `(legacy)/dictionary/[slug]/` 経由で参照される際に新トークンが未定義となるため、`var(--fg, var(--color-text))` / `var(--fg-soft, var(--color-text-muted))` / `var(--accent, var(--color-primary))` / `var(--accent-strong, var(--color-primary-hover))` / `var(--bg-soft, var(--color-bg-secondary))` / `var(--border, var(--color-border))` / `var(--success, var(--color-success))` / `var(--bg, var(--color-bg))` のように、新トークン優先 + 旧トークン fallback の形で記述する。Phase 10.2（B-337）で legacy 側削除完了時に第二引数を機械的に削除する
  - 完了後に `grep -rn "\-\-color\-\|\-\-max\-width" src/blog src/play src/app/(new)/blog` を実行し残存ゼロを確認（AP-WF04 構造的変更の grep 検証）。`--font-mono` は `globals.css` 側に正式トークンとして定義されたため grep 残存があってよい（=正しい使用）
  - **T2 で新版コンポーネント（ShareButtons / Breadcrumb）の module.css に旧トークン残存が見つかった場合は、本リストに当該ファイルを追加**（C2 反映）

- [ ] **T7 [S]** DESIGN.md 準拠の読み物再設計適用（標準手順 Step 5 の本質）
  - **冒頭タスク**: `src/app/globals.css` に `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` を 1 行追加（D2 反映 + r3 Critical-B 反映、DESIGN.md §3 改訂は不要、`old-globals.css` L16 と同一値で (legacy)/(new) のコード等幅フォント分裂を防ぐ）。これを最初に実施することで以降の CSS Module 側 `var(--font-mono)` が正しく解決される
  - 本文 article: max-width 720px / line-height 1.7 / 段落間隔 / 見出し h2/h3 のヒエラルキーを DESIGN.md §3 タイポに沿って整える
  - 見出し階層: h1（タイトル） / h2（章）/ h3（節）の視覚的差を明確化（フォントサイズ・margin-top で）
  - コードブロック（`<pre><code>`）: 背景 `--bg-soft` / border `--border` / `border-radius: var(--r-normal)` / 横スクロール / 等幅フォント（`var(--font-mono)`） / 行高 1.5
  - インラインコード（`<code>` 単独）: 背景 `--bg-soft` / 等幅フォント `var(--font-mono)` / padding 控えめ
  - 目次（TableOfContents）: Panel に収める / sticky 動作 / アクティブリンクは未実装維持
  - **本文 `<article>` を「透明 Panel」として収める**（D4 反映、I1 採用案 (b) + r3 重要-1 + r3 重要-A 反映）。実装手段は **PM 確定: `Panel` コンポーネントに `variant` プロパティ（`"default" | "transparent"`、未指定時 `"default"`）を追加し本文へ `variant="transparent"` を適用する** 方針（API 拡張）。`Panel.module.css` に **`.transparent { background: transparent; border: none; padding: 0; }`** クラス（padding 値 0 を PM 確定、r3 重要-A 反映）を追加し、`index.tsx` で `variant` props を受けてクラス切替する。CSS Module 側での「打ち消し実装」は採用しない（D4 却下理由参照）。本文の縦余白は `<article>` 内の段落・見出し（`margin-top`）側に責務を一元化する。JSX 構造（`<Panel as="article" variant="transparent">` を本文に適用する具体的なラップ構造）のみ DESIGN.md §3〜§4 の枠内で builder が決定する（AP-WF03 線引き）
  - 関連記事 / シリーズナビ / 前後ナビ / PlayRecommendBlock: 各 Panel に収める / 入れ子禁止（DESIGN.md §4、本文の透明 Panel と並列に配置するため入れ子にはならない）
  - シェアボタン位置: 記事末尾（現状踏襲）/ 新版 ShareButtons の見た目に従う
  - パンくず: 新 Breadcrumb の標準余白で
  - メタ情報（公開日 / 更新日 / 読了時間 / カテゴリリンク）: 本文上部、`--fg-soft` のコンパクトな行で
  - GFM Alert: globals.css に移植済みの `.markdown-alert*` がライト/ダーク両方で正しく表示されることを T11 視覚検証で確認

- [ ] **T8 [P]** MobileToc.test.tsx の取扱
  - 実体: `TableOfContents` を `<details><summary>` でラップしたインライン構成のレンダリング検証（page.tsx に MobileToc という固有ファイルは存在しない）
  - 判断: **保持**（page.tsx の MobileToc 構造が壊れないことの実質的な統合テストとして機能する）。move 不要（`src/blog/_components/__tests__/` 配下のままで OK、`TableOfContents` の振る舞いをラップした統合テスト）
  - ファイル名・コメントの誤解を招く部分は維持（コメントが「page.tsx で追加するインラインTOCブロックを模した」と明記している）

- [ ] **T9 [P]** TrustLevelBadge 撤去（r3 Critical-A 反映で全面書き換え）
  - **事実訂正（r3 Critical-A）**: r1〜r2 時点で「各記事 frontmatter の `trustLevel` フィールド削除は本サイクルでは行わない」と書いていたが、**ブログ記事の frontmatter には `trustLevel` フィールドが 0 件存在しない**（`grep -l "^trustLevel:" src/blog/content/*.md` = 0 件、r3 で reviewer / planner が独立に実体確認済み）。実体は **`src/blog/_lib/blog.ts` の L150 に型定義 `trustLevel: TrustLevel;`、L189 / L235 にコード側ハードコード `trustLevel: "generated" as const`** として存在する。記事 6 本文 L122 で「frontmatter に trustLevel フィールドを追加するのではなく、コード内で一律 `"generated"` を設定」と planner が選定した記事自身が明示している。設計手順 Step 6「対応する meta.ts の trustLevel フィールドも削除」は **ツール / 遊び / dictionary 系 meta.ts に準じた手順** であり、ブログ用に直接準用できない（ブログには meta.ts 相当ファイルがない）。
  - **PM 確定の対応スコープ（AP-P17 に基づく 3 案ゼロベース列挙のうえ (a) を採用）**:
    - **採用案 (a)**: `src/app/(new)/blog/[slug]/page.tsx` (T4 後の新パス) の `import` 行と `<TrustLevelBadge>` JSX のみ削除する。`src/blog/_lib/blog.ts` の `BlogPostMeta.trustLevel` 型 / `getAllBlogPosts()` および `getBlogPostBySlug()` のハードコード代入（L150 / L189 / L235）は **残置**。
      - **採用理由**:
        1. Phase 6 = ブログ詳細移行のスコープを逸脱しない（cycle-185 の検索結線スコープ越境事故と同型の事故予防、AP-WF15）。
        2. `post.trustLevel` を参照する箇所は本計画書 r3 時点の grep 結果 1 箇所（撤去対象 = `src/app/(legacy)/blog/[slug]/page.tsx` L96）のみで、撤去後は dead field となる（ハードコード値はテスト 7 件で参照されているが、テスト側は `trustLevel: "generated"` を明示的に固定値として書いており、`BlogPostMeta` 型から削除しない限り壊れない）。
        3. 型 / ハードコードを残置すると `BlogPostMeta` 型を介して dead field が露出するが、Phase 10.2 = B-337（legacy 撤去サイクル）で `TrustLevelBadge` コンポーネント本体削除と合わせて `BlogPostMeta.trustLevel` / `blog.ts` のハードコード / テスト 7 件の `trustLevel` 記述を機械的に整理できる（このサイクルは TrustLevel 機能の最終撤去サイクルとして位置づける）。dictionary / ツール / 遊び側の `trustLevel` は別サイクル（B-337 配下）で同時撤去となる。
    - **却下案 (b)**: (a) に加えて `src/blog/_lib/blog.ts` L150 / L189 / L235 を本サイクルで削除し、テストファイル 7 件（`RelatedArticles.test.tsx` / `BlogListView.test.tsx` / `newSlugsHelper.test.ts` / `SeriesNav.test.tsx` / `BlogFilterableList.test.tsx` / `searchFilter.test.ts` / `blog.test.ts` / `related-posts.test.ts`）の `trustLevel: "generated"` 記述も削除。
      - **却下理由**: テスト 7 件 + 型定義 + 2 箇所のハードコードを本サイクルで触ると、Phase 6 = ブログ詳細移行の射程を大きく超え、（cycle-185 の検索結線スコープ越境と同型の）スコープ越境事故を起こすリスクが高い。撤去自体は B-337 で `TrustLevelBadge` コンポーネント本体 / dictionary・ツール・遊び側 `trustLevel` と一括処理する方が機械的整合性が高い。
    - **却下案 (c)**: (a) + `BlogPostMeta` 型 (L150) からのみ `trustLevel` を削除し、L189 / L235 のハードコード代入を `delete` するか省略する。テストは触らない。
      - **却下理由**: 型から削除するとテスト 7 件（テスト側で `trustLevel: "generated"` を含む `BlogPostMeta` リテラルを構築している）が型エラーになり、結局テスト修正が必要。(b) と (a) の中間で利点がない。
  - **作業内容（(a) 採用の具体）**:
    1. `src/app/(new)/blog/[slug]/page.tsx`（T4 後）の `import { TrustLevelBadge } from "@/components/common/TrustLevelBadge"` 行を削除（T5 と統合可）
    2. 同ファイル内の `<TrustLevelBadge level={post.trustLevel} />` JSX 1 箇所を削除
    3. `src/blog/_lib/blog.ts` / `BlogPostMeta` 型 / `getAllBlogPosts()` / `getBlogPostBySlug()` は **本サイクルでは触らない**
    4. テスト 7 件の `trustLevel: "generated"` 記述も **本サイクルでは触らない**
  - **撤去後検証（r3 S2-r3 反映で追加）**: 撤去後に `grep -rn "trustLevel\|TrustLevelBadge" src/app/\(new\)/blog/\[slug\]/` を実行し残存ゼロを確認（AP-WF04 構造的変更の grep 検証）
  - **B-337 への申し送り（Phase 10.2 で実施する追加撤去）**: (i) `src/components/common/TrustLevelBadge/` コンポーネント本体削除、(ii) `src/blog/_lib/blog.ts` L150 / L189 / L235 の `trustLevel` 関連記述削除、(iii) ブログテスト 7 件の `trustLevel: "generated"` 記述削除、(iv) dictionary / ツール / 遊び側の `trustLevel` 一括削除、(v) `@/lib/trust-levels` モジュール削除。**これらが Phase 10.2 で同時撤去対象であることを design-migration-plan.md または backlog に明記する必要があるか PM が判断する**（既存の B-337 説明に「TrustLevelBadge 関連の最終撤去」が明示されていれば追記不要、明示されていなければ追記をサイクル末で起票）
  - 撤去判断の根拠は cycle-180 B-333-2「constitution Rule 3 は Footer の AI 注記で完全充足、badge は冗長」

- [ ] **T10 [P]** `__tests__/page.test.tsx` の import パス修正 + 検索キー再点検（I3 反映）
  - ファイルシステムベースのテスト（`fs.readFileSync` でソース文字列を読む）のため、参照しているファイルパス（`src/app/(legacy)/blog/[slug]/page.tsx`）を `src/app/(new)/blog/[slug]/page.tsx` に変更
  - `import @/play/_components/PlayRecommendBlock` の動作テストは変更不要
  - **テスト内の文字列検索キー（`className={styles.postNav}` / `<PlayRecommendBlock` / `</article>` 等）を T7 の再設計後の page.tsx 構造と並べ読み**し、再設計でクラス名やラップ構造が変わった場合はテストの検索キーを更新する。具体的には `styles.postNav` を `styles.postNavPanel` 等に rename した場合や、`<PlayRecommendBlock>` を `<Panel>` でラップした場合に検索 literal を追随させる
  - **検索 literal 依存が脆い構造であるため、検証戦略 ⑨ で「Playwright での DOM 順序検証へ置換する選択肢」を別途列挙**（採用 / 不採用を明示）
  - 配置順テスト（PlayRecommendBlock が `</article>` 後 / postNav 後 / RelatedArticles が `</article>` 前）は T7 で構造を維持していれば pass するが、構造変更時は検索キー更新で追随する

- [ ] **T11 [S]** Playwright での視覚検証（代表記事 6 件 × 4 = 24 枚）
  - 代表記事は T1pre で確定済み（6 slug を本計画書に記載）
  - 移行前（T1）と並べて「同等以上」を判定。ファイル名規約 `./tmp/cycle-187/after/` に統一
  - DOM チェック: `Header-module__Pzgc7q__*` 等の旧コンポーネント由来ハッシュが一切出ないこと
  - WCAG コントラスト 4.5:1 / フォーカスリング / `aria-current` を spot check
  - **`(new)/layout.tsx` 副作用観察**（I5 反映、T2 の確認の延長）: 短文記事（記事 1）の w360/w1280 ライトで「main の中央寄せ」「Footer 浮きなし」「`min-height: 100vh` 文脈下での記事末尾余白」を観察
  - **D1 拡幅影響観察**（C1 反映）: コード横スクロール頻度 / Mermaid 図比率 / モバイル影響 / 一覧 BlogCard との視覚連続性
  - **TagList 観察**（S2 反映、TagList が `<header>` 直下 or article 上部に配置されたとき、新 Panel 体系下で「TagList の境界線・空気感」が Panel と衝突していないか）。**加えて、r3 反映の事実訂正で「主 6 件はすべてタグ全件が linkableTags に含まれる」ことが判明したため、TagList の `linkableTags` フィルタで一部タグが非表示にされる挙動の観察は補助 1 件 = `2026-05-04-scroll-lock-reference-counter-for-multiple-components`（`React` と `アクセシビリティ` の 2 タグが非リンク）で実施**（撮影 4 枚は不要、TagList 部分のみ視覚確認 + DOM で当該タグが描画されないことの確認）
  - **(new)→(legacy) クロス遷移視覚断絶観察**（R10 / r3 重要-3 反映）: `PlayRecommendBlock` または記事内関連リンクで (new) ブログ詳細 → (legacy) dictionary 詳細へ遷移したときの視覚断絶を 1 経路以上で観察し、`./tmp/cycle-187/cross-transition-observation.md` に記録する（断絶許容範囲なら記録のみ、不可なら別 backlog 起票判断）。逆方向 (legacy)→(new) も 1 経路で観察
  - `/storybook` 全体ライト/ダーク撮影で Phase 6 副作用ゼロを確認
  - **build 時間記録（before）**: 移行前に `time npm run build` を 1 回実行し所要時間を `./tmp/cycle-187/build-time-before.txt` に保存（R8 / I4 反映、T14 と対で before/after 比較）

- [ ] **T12 [S]** 機能動作確認（視覚検証だけでは検出できないもの）
  - Article JSON-LD: 移行後の `/blog/[一記事]` の HTML を curl して `<script type="application/ld+json">` の中身を Google Rich Results Test または手動 JSON.parse で検証
  - Breadcrumb JSON-LD: 同様に BreadcrumbList が出力されていること
  - OGP/Twitter 画像: `/blog/[一記事]/opengraph-image` および `/twitter-image` に Playwright で 200 + 画像表示を確認（cycle-185 先例）
  - Mermaid: 図がある記事（11 記事の代表 2 件）でライト/ダーク両方で SVG が正しく再レンダリングされること
  - GFM Alert: `> [!NOTE]` 等が記事に含まれる代表 1 件でライト/ダーク両方で正しく表示
  - シェア: ShareButtons の X/LINE/はてな/コピー が動作し GA4 `trackShare` イベントが発火することを production ビルドで実機確認。**「コピー」ボタン押下後の成功メッセージが `--success` カラーで視認可能であることを目視確認**（C2 反映、新版 ShareButtons は `--success` を使用しており (new)/ 配下で正しく解決されることを実機で担保）
  - 関連記事 / シリーズナビ / 前後ナビ: 1 記事で実際にクリックして遷移できることを確認
  - PlayRecommendBlock: ブログ記事末尾と **legacy 側の dictionary 詳細ページ** 両方で視覚崩れがないことを確認（D5 の影響範囲）

- [ ] **T13 [S]** legacy 残骸の確認
  - `grep -rE "legacy/blog/\[slug\]" src/` で旧パス参照ゼロ
  - `(legacy)/blog/[slug]/` ディレクトリが消えていること
  - `src/app/(legacy)/blog/` 配下に [slug] 以外（page.tsx 一覧・category・tag 等）が残存することは Phase 6 の責務外（cycle-183 で (new) 側に既に移行済み、legacy 側に同名ディレクトリが残っているなら別事故。事前に survey 範囲で legacy 側の `[slug]` 以外の状態を確認）

- [ ] **T14 [S]** `npm run lint && npm run format:check && npm run test && npm run build` の green 確認
  - **`time npm run build` の所要時間を `./tmp/cycle-187/build-time-after.txt` に保存**し、T11 の before と比較して大幅増（目安: 1.5 倍以上）がないことを確認（R8 / I4 反映）。大幅増があれば原因（D1 の二段構成適用 / Mermaid SSR コスト / etc）を特定し reviewer 報告
  - **`generateStaticParams` が 60 件を返したことを build ログから確認**（S3 反映）: `npm run build` の出力で `/blog/[slug]` のルート生成数（または `Generating static pages (X/Y)` 表示）が 60 件であることを確認し、`./tmp/cycle-187/build-routes-count.txt` にログ断片を保存。cycle-185 の OGP 画像 SSG 失敗事故の予防として明示手順化

- [ ] **T15 [S]** PM 並べ読み（AP-WF11 並べ読みの成果物化）
  - 並べ読み対象: ① T3 で確定した D1〜D7、② `src/app/(new)/blog/[slug]/page.tsx`、③ `src/app/(new)/blog/[slug]/page.module.css`、④ survey 棚卸し既存機能リスト
  - 4 列テーブル（計画確定リスト / 実装に存在する要素 / 不一致・欠落 / 対応）を cycle-187.md または `./tmp/cycle-187/cross-check.md` に残す
  - 機能棚卸し漏れがないことを最終確認してから reviewer 依頼

### 検討した他の選択肢と判断理由

**① 「現状構造をそのまま git mv + トークン置換」案 vs 「読み物として再設計」案**

- **却下**: 単純な git mv + トークン置換のみ。
  - メリット: 工数最小、リスク最小。
  - 致命的な問題: 標準手順 Step 5 「DESIGN.md に従ったデザイン適用 — トークン置換だけでは新デザインにならない」を満たさない。cycle-181〜185 で一覧側は再設計済みで、詳細だけ旧構造のまま残ると視覚連続性が壊れる（M-α の「同じサイトを読み続けている」が破綻）。CLAUDE.md「Decision Making Principle: better UX option is achievable → must be chosen」に反する。
- **採用**: 読み物として再設計（D1〜D7 を明示確定）。
  - 本文 720px / line-height 1.7 / Panel パターン / コードブロック可読性 / TOC sticky を再設計し、トークン置換は手段として扱う。Phase 6 完了基準（既存機能維持）と DESIGN.md 準拠の両立。

**② 段階分割案（Phase 6.1 = git mv + トークン置換 / Phase 6.2 = 読み物再設計）**

- **却下**: 2 サイクルに分割。
  - メリット: 各サイクルのリスク低下。
  - 問題: 中間状態（トークン置換のみで構造未再設計）が長く生まれ、AP-WF15「同サイクル / 別サイクル判断の思いつき分割」に近い。Phase 6 完了基準の「Article JSON-LD・目次・シェアボタン・関連記事などが移行後も動作」は中間状態でも満たせるが、デザイン移行計画 L11「来訪者から見えるデザイン混在期間を最小化」の方針と矛盾する。
- **採用**: 1 サイクル内で git mv + トークン置換 + 再設計を完結。

**③ Panel パターンを記事本文にどう適用するか（I1 反映で 3 案ゼロベース再列挙、AP-P17）**

DESIGN.md §1 は「すべてのコンテンツはパネルに収まった形で提供される」と明言しているため、本文を Panel から除外する判断は §1 の例外を作る決定になる。§1 を勝手に解釈変更してはならないという制約のもとで、以下 3 案を再列挙する。

- **却下案 (a): DESIGN.md §1 を本サイクル内で改訂**（「ただし本文の長文プロースは 720px 行幅制約により単独で章立てが成立するため Panel 例外とする」と明文化）したうえで「本文 Panel なし」を採用。
  - メリット: 本文の没入感を最大化（M-α の dislikes「整いすぎ」を回避）。境界線なしで純粋なテキストフロー。
  - **却下理由**: DESIGN.md は単一情報源（Single Source of Truth）であり、Phase 6 のサイクル内で §1 のような根幹ルールを改訂するのは AP-WF15（同/別サイクル境界）に抵触する。DESIGN.md 改訂は本サイクルのスコープを大幅に超え、すべての Phase の前提を変える決定であって、Phase 6 = ブログ詳細移行の射程外。
- **採用案 (b)（D4）: 本文を「透明 Panel」として収める**（`Panel` の表現バリアントで `border: none; background: transparent;` 相当を本文専用に作る、または `Panel` の通常表現を維持したまま CSS で境界線・背景を打ち消す）。TOC / 関連記事 / シリーズナビ / 前後ナビ / PlayRecommendBlock は通常の Panel に収める。
  - メリット: DESIGN.md §1 を逸脱せず、§1 の文言「コンテンツは Panel に収まる」をそのまま満たす（Panel の **表現バリアント** で本文の読み物性を確保）。本文は境界線なしの没入感を保ち、付帯情報は Panel で別ブロックとして視覚的に示す。720px 制約と組み合わせて読み物として最適。入れ子は発生しない（本文 Panel と付帯 Panel は並列）。
  - **採用理由**: DESIGN.md §1 を維持しつつ M-α の dislikes も満たす唯一の案。Panel コンポーネントの拡張は本サイクルで完結する小規模変更で済み、Phase 7/8 でも再利用可能な「透明 Panel」バリアントとして全体最適。
- **却下案 (c): 「本文 + メタ情報 + シェア」を 1 つの大 Panel に収め、TOC / 関連記事 / シリーズナビ / 前後ナビ / PlayRecommendBlock を別 Panel として並列**。
  - メリット: §1 を明示的に満たし、本文ブロックを Panel として 1 つのユニットにする。
  - **却下理由**: 720px 制約のもとで大 Panel の境界線が「読み物の没入感」を妨げる（M-α の dislikes「整いすぎ」と相性が悪い）。さらに「本文 + シェア」を同一 Panel にすると、シェアボタン領域が記事の論理的終端であることを境界線で明示できず、視覚階層が崩れる。

**採用根拠の要点**: (a) は §1 改訂が Phase 6 スコープ外、(c) は読み物没入感を毀損、(b) のみが「DESIGN.md §1 維持」「読み物没入感確保」「視覚階層保持」「入れ子なし」の 4 条件をすべて満たす。

**④ PlayRecommendBlock のトークン置換を本サイクルで含めるか別 backlog 化するか + (legacy) 解決手段（r3 重要-2 反映）**

- **却下**: 別 backlog（Phase 7 or Phase 8）まで先送り。
  - 問題: PlayRecommendBlock は新ブログ詳細から呼ばれるため、置換しないとブログ詳細だけ視覚崩れする。
- **採用（D5）**: 本サイクルで置換する。影響範囲は `src/dictionary/_components/DictionaryDetailLayout.tsx`（legacy 側 dictionary 詳細から呼ばれる）。Phase 8 で dictionary は移行予定なので、本サイクルでの置換は (legacy) 側でも視覚崩れしない解決手段が必要。
- **(legacy) 側解決手段の選択（r3 反映、PM 確定）**: 計画立案 r3 時点で `src/app/old-globals.css` を Read した結果、**新トークン体系（`--fg` / `--accent` / `--bg-soft` / `--border` / `--success` 等）は未定義**であることを実体確認済み。以下 2 案から PM が確定する:
  - **却下案 (i): `old-globals.css` 側に新トークンを一時複製**。
    - メリット: `PlayRecommendBlock.module.css` 側は通常の `var(--fg)` のままで済み、CSS の見た目が綺麗。
    - 却下理由: (a) Phase 10.2（B-337 = legacy 削除）で 2 箇所削除が必要になり手戻りが増える、(b) 複製したトークンの定義値が `globals.css` 側と乖離した場合に「同じトークン名で別の値」が表示される事故リスクがある、(c) `old-globals.css` は legacy 側の単一情報源であり Phase 10.2 まで触らない方針が design-migration-plan.md と整合。
  - **採用案 (ii): `var(--fg, var(--color-text))` 形式の fallback 構文**（D5 / T6 で確定）。
    - メリット: (a) `old-globals.css` を本サイクルで触らない、(b) Phase 10.2 で fallback の第二引数を機械的に削除すれば自然に整理できる、(c) (new) 側では `var(--fg)` が新トークンとして解決され、(legacy) 側では fallback の `var(--color-text)` 等が旧トークンとして解決されるため両ケースの視覚崩れ可能性が最小。
    - 採用理由: 3 観点ですべて (i) を上回るため。CSS 構文がやや冗長になるデメリットは Phase 10.2 で機械的に解消できるため許容。

**⑤ MobileToc.test.tsx 孤立テストを削除するか保持するか**

- **却下**: 削除。
  - 問題: T8 で確認した通り、これは page.tsx の `<details><summary><TableOfContents /></summary>` 構造を模した統合テストであり、ファイル名が誤解を招くだけで実体価値はある。削除すると page.tsx 移行後にこの構造が破壊されても検知できない。
- **採用（T8）**: 保持。コメントが「page.tsx で追加するインラインTOCブロックを模した」と明記しているため、機能を保持。リネームは別 backlog（命名改善は Phase 6 のスコープ外）。

**⑥ TagList を現状維持で移行するか本サイクルで撤去まで進めるか**

- **却下**: 本サイクルで撤去まで進める。
  - 問題: B-389 は cycle-184 で「キャンセル（X1 案がレコメンドのブラックボックス化など 5 点の毀損）」となり、B-391 で情報設計から再検討中。本サイクルで撤去を進めると B-391 の検討結果を先取りすることになり AP-P11（AI の過去判断を変更不可と扱わない）の逆方向 = 「未確定の検討結果を先取り」になる。
- **採用（D7）**: 現状維持で移行（トークン置換のみ）。B-391 の検討結果を待つ。

**⑦ コードブロックのシンタックスハイライト導入**

- **却下**: 本サイクルで shiki 等を導入。
  - 問題: バンドルサイズ増（AP-I03）、SSG 時の build time 増、Phase 6 完了基準を超える。
- **採用（D6）**: スコープ外。背景 / ボーダー / 横スクロール / 等幅フォント / 行高の再設計までで M-β の最低限の可読性は確保。シンタックスハイライト導入は別 backlog（Phase 6 完了後に PV データに基づき検討）。

**⑧ 一覧 BlogCard との視覚連続性をブログ詳細でどう取るか（S4 反映で追加）**

survey L274-276 の確認では「トップは BlogCard を流用しない方針（X10）が採られ、詳細は一覧との視覚連続性を独自に設計してよい」と明記されている。詳細ページが BlogCard と完全に視覚的に揃う必要はないが、どの程度の連続性を取るかは判断が必要。

- **却下案 X**: BlogCard と同じカード境界・余白・タイトルフォントを詳細のヘッダ部にも適用する。
  - 問題: 詳細ページは「カードの中をクリックして開いた状態」ではなく独立した読み物であり、カード境界をそのまま持ち込むと「永遠にカードに閉じ込められている」視覚効果を生む（カードからの離脱感がない）。
- **却下案 Y**: BlogCard とは完全に独立した詳細デザインを採る（タイポ・余白・カラーも別系統）。
  - 問題: 一覧（cycle-183）と詳細の視覚断絶が大きくなり、M-α の「同じサイトを読み続けている」連続性が壊れる。
- **採用案 Z**: 共通のデザイントークン（`--fg`, `--accent`, `--bg-soft`, `--r-normal`, タイポ階層）を再利用しつつ、詳細では Panel 適用パターン（D4 = 透明 Panel）と 720px 行幅制約で「読み物」に最適化する。BlogCard のカード境界は持ち込まない（詳細の本文 Panel は透明）。関連記事グリッド（記事末尾）は BlogCard を再利用してよい（PlayRecommendBlock 横や下部の付帯情報として一覧との連続性を取る場所）。
  - 採用理由: 一覧と詳細でデザイントークン共通化により視覚連続性は担保しつつ、詳細独自の読み物体験（透明 Panel + 720px）も両立できる。M-α / M-β / M-γ それぞれの主用途（読む / コードを取り入れる / 試行錯誤の連続性発見）に最適。

**⑨ page.test.tsx を Playwright DOM 順序検証へ置換するか（I3 反映で追加）**

`__tests__/page.test.tsx` は `fs.readFileSync` + `source.indexOf("className={styles.postNav}")` のような **ソース文字列 literal 依存** のテスト構造を持つ。リファクタや構造再設計で literal が変わるたびにテストが壊れる脆弱性がある。

- **却下案 P**: 本サイクルで page.test.tsx を Playwright での DOM 順序検証（render 後の DOM 木で `postNav` の前後関係を assert）へ全面置換。
  - メリット: ソース literal 依存が消え、構造変更に強くなる。
  - **却下理由**: テスト構造の全面置換は Phase 6 = ブログ詳細移行のスコープ外（AP-WF15）。Playwright での統合テストは現状 `tests/` の e2e 体系として整備中であり、page.test.tsx だけを先行置換するとテスト体系全体の一貫性が崩れる。
- **採用案 Q**: 本サイクルでは literal 検索キーの更新（T10）で対処し、Playwright 化は別 backlog として明示的に起票する。
  - 採用理由: 本サイクルの完了基準（既存機能維持 + デザイン適用）には現行テストの追随で十分。Playwright 化は別 backlog（テスト基盤改善）として記録し、後続サイクルで体系的に進める。

**⑩ MobileToc.test.tsx のリネームを本サイクルで行うか別 backlog 化するか（S1 反映で追加）**

T8 で確認した通り、`MobileToc.test.tsx` は page.tsx の `<details><summary><TableOfContents /></summary>` 構造を模した統合テストであり、ファイル名が誤解を招くだけで実体価値はある。

- **却下案**: 本サイクルでファイル名を `MobileTocIntegration.test.tsx` 等にリネーム。
  - 問題: ファイル名変更は Phase 6 スコープ外。本サイクルの差分を増やし、レビュー観点を分散させる。
- **採用案**: 本サイクルでは保持（T8）、**リネームは別 backlog として明示的に起票**する（後続サイクルで `MobileTocBlock.test.tsx` 等に rename し、コメント整理）。これにより後続サイクルで「孤立テストか実体価値ありか」と再度迷う時間を削減する。

### 検証戦略（視覚 / 機能 / リンタ）

**サンプル記事の選定基準（代表 6 件）**

60 記事すべての撮影は非現実的かつ意味が薄い。以下の機能網羅性で代表を選定する（実選定は execution の T1 で T2 の調査結果から確定）：

1. **短文記事 1 件** — 段落数最小、TOC が短い／無いケース
2. **長文記事 1 件** — TOC が長く、デスクトップ sticky の動作を要観察
3. **Mermaid 図を含む記事 1 件** — ライト/ダーク両方で SVG 再レンダ動作確認（11 記事中の代表）
4. **GFM Alert を多用する記事 1 件** — `.markdown-alert*` スタイルがライト/ダーク両方で破綻しないか
5. **シリーズに属する記事 1 件** — SeriesNav の前後・折りたたみ表示
6. **関連記事が複数表示される記事 1 件** — RelatedArticles の Panel 内表示

選定確定後、cycle-187.md に slug を記載する。

**ブレークポイント**: w360（モバイル）/ w1280（デスクトップ）の 2 種。`/storybook` も同様に撮影。

**機能動作確認**（T12 詳細）:

- Article JSON-LD: production ビルドで `view-source` 経由で確認、または `curl + jq` でフィールド網羅性確認
- Breadcrumb JSON-LD: 同上
- OGP/Twitter 画像: Playwright で 1200×630 の画像が `/blog/[slug]/opengraph-image` で配信されることを確認
- Mermaid: ダーク切替で再レンダリング走ることを Playwright で確認（`useTheme` の resolvedTheme 変化）
- GFM Alert: スクショの目視で OK
- シェアボタン: production ビルドの実機で各ボタンを押下し GA4 DebugView で `share` イベントを確認
- 関連記事 / シリーズナビ: クリックして遷移先が新ブログ詳細ページであることを確認

**リンタ / テスト**: T14 で `npm run lint && npm run format:check && npm run test && npm run build` の全 green を確認。失敗時は execution が完了とみなさない。

### リスクと対策

**R1: CSS トークン解決元切替による全記事崩壊**

- 対策: T6 の置換チェックリスト 6 ファイルすべてに対し置換実施後 `grep -rn "\-\-color\-\|\-\-max\-width" src/blog src/play src/app/(new)/blog` で残存ゼロを確認（AP-WF04、`--font-mono` は globals.css の正式トークンとして残置許容なので grep 対象外、r3 重要-B 反映）。T11 視覚検証で 6 件 × 4 = 24 枚を移行前と並べて評価。

**R2: GFM Alert スタイル**

- 対策: 新 globals.css に `.markdown-alert*` 移植済みであることは survey で確認済み。T11 で代表 1 件（GFM Alert を多用する記事）でライト/ダーク両方の表示を実機確認。

**R3: `--max-width` / `--font-mono` の欠落**

- 対策: D1（720px 本文 / 1200px 広幅）と D2（monospace スタック直値）で代替値を確定。`--font-mono` のプロジェクト全体導入は別 backlog（本サイクルは Phase 6 を逸脱しない）。

**R4: PlayRecommendBlock の dictionary（legacy）への影響**

- 対策: D5 + T12 で legacy 側 dictionary 詳細での視覚確認を実施。`old-globals.css` の新トークン定義状況に応じて (a) 新トークンを old-globals に一時複製、または (b) PlayRecommendBlock.module.css 内で `var(--fg, var(--color-text))` のような fallback を採る。実装段階で確認のうえ最適手段を選択。

**R5: Mermaid のダーク/ライト切替**

- 対策: T12 で実機 Playwright によりテーマ切替時の再レンダリングを確認。`useTheme` は `(new)/layout.tsx` の `ThemeProvider` 経由で動くため survey 通り問題なし想定。

**R6: **tests**/page.test.tsx のファイルパス参照**

- 対策: T10 でファイル内の `src/app/(legacy)/blog/[slug]/page.tsx` を新パスに置換。`fs.readFileSync` がエラーを出さないことを `npm run test` で確認。

**R7: TrustLevelBadge 撤去で型エラー**

- 対策: T9 で page.tsx の import / JSX のみ削除し、各記事 frontmatter の `trustLevel` フィールドは残置（Phase 10.2 = B-337 で本格撤去）。型側で `trustLevel` を読まないようにする変更があれば最小限に留める。

**R8: 60 記事 SSG の build パフォーマンス（I4 反映で追加）**

- 内容: 60 記事 × 本文 + OGP/Twitter 画像 60 × 2 = 180 ルート、Mermaid を含む記事 11 件で SSR レンダリングコストが発生。本サイクルの構造変更（D1 二段構成、D4 透明 Panel、D2 トークン追加、T9 TrustLevelBadge 撤去等）が build 時間に与える影響は事前見積もり不能。
- 対策: T11 で `time npm run build`（before）を記録、T14 で `time npm run build`（after）を記録して比較。**1.5 倍以上の増加があれば原因切り分けを行い reviewer へ報告**。`generateStaticParams` が 60 件を返したことを build ログ（`Generating static pages` 出力）から確認し `./tmp/cycle-187/build-routes-count.txt` に保存（cycle-185 OGP SSG 失敗事故の予防、S3 反映）。

**R9: `(new)/layout.tsx` の flex/min-height 構造下での副作用（I5 反映で追加）**

- 内容: `body { display: flex; flex-direction: column; min-height: 100vh }` + `<main flex:1>` の構造下で、ブログ詳細の `<div className={styles.container}>` が `margin: 0 auto` で中央寄せされるか、短文記事（記事 1）で `min-height: 100vh` 文脈下に Footer 浮きや空白破綻が起きないか。
- 対策: T2 で `(new)/layout.tsx` 構造を Read 済みであることを確認、T11 で短文記事（記事 1）の w360/w1280 ライト両方で「main 領域の中央寄せ」「Footer 位置」「スクロール領域内の余白」を観察ポイントとして明示。

**R10: 混在期間中の (new)→(legacy) クロス遷移時の視覚断絶（r3 重要-3 反映で追加）**

- 内容: Phase 6 完了後の状態は「ブログ詳細・一覧・カテゴリ・タグ = `(new)/`、ツール詳細・dictionary 詳細 = `(legacy)/`（Phase 7/8 未着手）」となる。本サイクル T7 の関連記事グリッド（BlogCard 再利用）は (new)→(new) 遷移で連続するため問題ないが、**ブログ詳細末尾の `PlayRecommendBlock` 経由でツール詳細または dictionary 詳細へ遷移すると (new)→(legacy) のクロス遷移が発生**し、来訪者は「新デザインの記事を読んでいた」状態から「旧デザインの詳細ページ」へ突然遷移する。同様に (legacy) dictionary 詳細から記事内関連リンクで (new) ブログ詳細に戻る (legacy)→(new) クロス遷移も発生しうる。これは M-α「同じサイトを読み続けている連続性」と M-γ「試行錯誤の連続性発見」に対する暫定状態の毀損であり、Phase 7/8 完了までの混在期間中は不可避だが、本サイクルで「許容可能な範囲か」を観察記録しておく必要がある。
- 対策: T11 視覚検証に **「(new) ブログ詳細 → (legacy) dictionary 詳細へ関連リンク / `PlayRecommendBlock` 経由で遷移したときの視覚断絶」観察ポイントを明示**（記事 6 など `related_tool_slugs` または `PlayRecommendBlock` を介して dictionary 詳細に動線がある代表で確認）。視覚断絶が大きい場合は別 backlog として「Phase 7/8 完了までの暫定 UI 緩衝（例: 遷移時のスケルトン色トーン統一）」を起票するか判断する。なお、Phase 7（ツール詳細）/ Phase 8（dictionary 詳細）の移行サイクルでクロス遷移自体は自然に解消されるため、本サイクルは観察と記録にとどめる（R10 は予防 / トラッキング目的のリスク項目）。

### アンチパターン抵触チェック

**AP-I07（Next.js layout の body style と useEffect の競合）**:

- 抵触なし。本サイクルでは `(new)/layout.tsx` を変更しない。ブログ詳細ページ自体は `document.body.style.*` を直書きする箇所を持たない（survey 確認済み: MermaidRenderer は body 操作しない、ShareButtons は body 操作しない）。クラス切替・data 属性切替が必要な箇所は出現しない見込みだが、execution 中に発生した場合は CSS 側で定義する原則を堅持。

**AP-I08（fixed オーバーレイ背後の static 操作要素）**:

- 抵触なし。本サイクルはモーダル・オーバーレイを新規追加しない。TOC は sticky であり fixed ではない。ShareButtons / Mermaid 内に fixed 要素はない（survey 確認済み）。

**AP-I09（jsdom 単体テストの限界）**:

- 抵触なし。視覚 / CSS スタッキング / production ビルド由来挙動は T11 視覚検証 + T12 production ビルド実機検証で担保する。jsdom 単体テスト（vitest）に layout / CSS スタッキング検証を頼らない。

**AP-I08 別側面（DESIGN.md 未定義表現の追加）**:

- 抵触なし。T7 の再設計は DESIGN.md §1〜§6 のトークン・パターン内で完結する設計（Panel / 角丸 / 影なし / `--fg`・`--bg`・`--accent` の枠内）。コードブロック / Mermaid / GFM Alert はすべて既存定義済みトークンで構築する。`--font-mono` のプロジェクト全体導入は本サイクルでは実施しない（D2 は CSS Module 内に直値で展開、DESIGN.md 改訂を伴わない）。

**AP-P16 / AP-WF12（事実情報の実体確認）**:

- T2 で「(legacy)/blog/[slug]/ の 5 ファイル存在」「6 CSS Module の旧トークン残存」「(new)/blog/[slug]/ の不在」「B-389 キャンセル + B-391 Deferred 状態」「MobileToc.test.tsx の実体」「新版 ShareButtons.module.css / Breadcrumb.module.css の旧トークン残存ゼロ」「`(new)/layout.tsx` の body style / main flex 構造」をすべて `Read` / `grep` で実体確認する手順を計画に組み込み済み。
- **D1 の旧 `--max-width` 実値（960px）は計画立案時に `src/app/old-globals.css` L28 で確認済み**（r1 で誤認していた「1200px」を撤回、C1 反映）。
- **代表 6 記事の slug は T1pre で `src/blog/content/` の実体確認とフロントマター調査をもとに PM が確定**（execution 段階に判定を持ち越さない、I6 反映）。
- **`linkableTags` の実体は frontmatter フィールドではなく `getTagsWithMinPosts(3)` 由来の runtime 算出派生 Set である**ことを r3 反映で `src/blog/_lib/blog.ts` L366-380 および `src/blog/_components/BlogListView.tsx` L83-86 を Read して確認済み（r2 Critical-1 反映、r1 C1 と同パターンの「frontmatter にないフィールドを実体確認と称する」事実誤認を撤回）。
- **`src/components/Panel/index.tsx` の現状 API（`as` / `children` / `className` のみ、`variant` 未実装）は計画立案 r3 時点で Read 確認済み**（r2 重要-1 反映、D4 で `variant` プロパティ追加を PM 確定）。
- **`src/app/old-globals.css` の新トークン体系（`--fg` / `--accent` / `--bg-soft` / `--border` / `--success`）未定義は計画立案 r3 時点で Read 確認済み**（r2 重要-2 反映、D5 で fallback 構文採用を PM 確定）。
- **6 slug のカテゴリ分散は本計画書 r3 時点で各 `src/blog/content/<slug>.md` を Read して確認済み**（`ai-workflow` ×3、`dev-notes` ×2、`site-updates` ×1 の実質 3 カテゴリ）。「6 軸」「5 軸」記述は事実誤認のため撤回済み（r2 S5 反映）。
- **r3 Critical-A 反映: ブログ記事の frontmatter には `trustLevel` フィールドが 0 件存在しないことを `grep -l "^trustLevel:" src/blog/content/*.md` で再確認**（実体は `src/blog/_lib/blog.ts` L150 / L189 / L235 のコード側ハードコード）。T1pre / T9 の記述を全面書き換え。本計画書末尾に **「### 6 slug + 補助 1 件 frontmatter 全フィールド対照表」を追加**（r3 S1-r3 反映、4 サイクル目の同型誤認再発防止）。
- **r3 Critical-B 反映: `src/app/old-globals.css` L16 で既に `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` が定義されていることを `grep -n "font-mono" src/app/old-globals.css` で再確認**。D2 / T7 冒頭タスクの追加値を old-globals 既存値と同一に統一（(new)/(legacy) のコード等幅フォント分裂を回避）。

**AP-WF09（チェック対象の範囲を恣意的に絞らない）**:

- **r3 Critical-A は AP-WF09 への抵触として明示**: r1〜r2 時点で「6 slug の frontmatter を Read 確認済み」と書いていたが、確認対象が `category` フィールドに恣意的に絞られており `trustLevel` フィールドの不在を同時確認していなかった。今回（r3 反映で）frontmatter 全フィールド対照表を追加し、確認の網羅性を計画書内に固定する（本文末尾「### 6 slug + 補助 1 件 frontmatter 全フィールド対照表」参照）。今後 frontmatter 由来の判断を計画書に書く際は、対照表を参照する手順を経ることで AP-WF09 を予防する。

**AP-WF03（builder への過剰具体指示）**:

- 計画書には D1〜D7 の設計判断（PM 責務）と置換規則の方針のみを記載し、JSX 構造・inline style 値・CSS 具体的値は builder の判断余地に残す。

**AP-WF04（構造的変更の grep 検証）**:

- T6 末尾の `grep` 残存確認、T11 の DOM ハッシュ確認、T13 の旧パス参照確認の 3 段で「構造的変更が完遂した」ことを実体検証する。

**AP-WF05（着手前撮影ルール）**:

- T1 で kickoff 直後に N×4=24 枚を撮影する手順を計画に明示。

**AP-WF07（同一ファイル並行アサイン回避）**:

- T5（page.tsx）と T9（page.tsx の TrustLevelBadge 撤去）は同一ファイル変更のため **同一 builder へ直列依頼**。T6 の 6 ファイル CSS Module 置換は別 builder に並列可能だが、`src/blog/_components/` 配下の 4 ファイルと `src/app/(new)/blog/[slug]/page.module.css` と `PlayRecommendBlock.module.css` は別ファイルのため並列可。

**AP-WF11（PM 並べ読み）**:

- T15 で並べ読みを 4 列テーブル化する手順を明示。

**AP-P17（複数案ゼロベース列挙）**:

- 「### 検討した他の選択肢と判断理由」で①〜⑩ の 10 つの判断ポイントについて複数案を列挙し、却下理由と採用理由を併記。
- **r3 反映の追加**: T9 TrustLevelBadge 撤去のスコープ確定（採用案 (a) / 却下案 (b) / 却下案 (c) の 3 案、AP-P17 準拠）、D2 `--font-mono` 値統一の判断（採用案 (P) / 却下案 (Q) / 却下案 (R) の 3 案、r3 Critical-B 反映）、D4 `.transparent` padding 値の確定（PM 判断として `padding: 0` を確定、r3 重要-A 反映）も AP-P17 に従い計画書本文に併記。

### 完了基準

Phase 6 計画書本文の完了基準（design-migration-plan.md L155）+ 本サイクル固有基準：

- [ ] すべての記事が `(new)/blog/[slug]/` 配下で表示できる（generateStaticParams が 60 記事を生成し、各 URL が 200 を返す）
- [ ] Article JSON-LD、Breadcrumb JSON-LD、目次、シェアボタン、関連記事、シリーズナビ、前後ナビ、PlayRecommendBlock、Mermaid、GFM Alert が移行後も動作する（T12 で個別確認）
- [ ] `(legacy)/blog/[slug]/` ディレクトリが存在しない
- [ ] CSS Module 6 ファイルから旧 `--color-*` / `--max-width` トークン参照が消えている（grep 残存ゼロ）。**`--font-mono` は `globals.css` に正式トークンとして追加されているため CSS Module 側の `var(--font-mono)` 参照は残置許容**（D2 / T6 / T7 で確定、r3 重要-B 反映）
- [ ] TrustLevelBadge の import / JSX が `src/app/(new)/blog/[slug]/page.tsx` から削除されており、`grep -rn "trustLevel\|TrustLevelBadge" src/app/\(new\)/blog/\[slug\]/` 残存ゼロ（r3 Critical-A / S2-r3 反映）。コンポーネント本体ファイル、`src/blog/_lib/blog.ts` の `BlogPostMeta.trustLevel` 型 / L189・L235 ハードコード、ブログテスト 7 件の `trustLevel: "generated"` は **本サイクル残置**（Phase 10.2 = B-337 で一括撤去、T9 採用案 (a)）
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` が all green
- [ ] 移行前/後の N×4=24 枚スクショが `./tmp/cycle-187/` 配下に保存され、reviewer が「同等以上」と判定している
- [ ] OGP/Twitter 画像が `/blog/[一記事]/opengraph-image` で 200 + 1200×630 画像を返す
- [ ] PlayRecommendBlock のトークン置換が legacy 側 dictionary 詳細での視覚崩れを起こしていない
- [ ] PM 並べ読み 4 列テーブルが `./tmp/cycle-187/cross-check.md` または cycle-187.md に存在する
- [ ] `time npm run build` の before/after が `./tmp/cycle-187/build-time-{before,after}.txt` に保存され、1.5 倍以上の増加がない（R8 / I4 反映）
- [ ] `generateStaticParams` が 60 件を返したことが build ログから確認でき、`./tmp/cycle-187/build-routes-count.txt` に断片が保存されている（S3 反映）
- [ ] ShareButtons の「コピー」ボタンの成功メッセージが `--success` カラーで視認できる（実機確認、C2 反映）
- [ ] `globals.css` に `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` が 1 行追加されている（D2 / I2 / r3 Critical-B 反映、`old-globals.css` L16 と同一値、DESIGN.md は未改訂）
- [ ] 本文 `<article>` が「透明 Panel」として収まり、DESIGN.md §1 の表現を満たしている（D4 / I1 反映）
- [ ] `src/components/Panel/index.tsx` に `variant` プロパティ（`"default" | "transparent"`）が追加され、`Panel.module.css` に **`.transparent { background: transparent; border: none; padding: 0; }`** が追加されている（D4 / r3 重要-1 + r3 重要-A 反映、padding 値も PM 確定）
- [ ] `PlayRecommendBlock.module.css` が `var(--fg, var(--color-text))` 形式の fallback 構文で記述され、(new) と (legacy) の両ケースで視覚崩れなく解決される（D5 / r3 重要-2 反映）
- [ ] 短文記事（記事 1）の w360 / w1280 ライト両方で「`<main>` 領域の中央寄せ」「Footer 浮きなし」「`min-height: 100vh` 文脈下での記事末尾余白」を観察した記録が `./tmp/cycle-187/` 配下のスクショまたは観察メモに保存されている（R9 / r3 S6 反映）
- [ ] `(new)→(legacy)` クロス遷移（ブログ詳細 → dictionary 詳細など）と逆方向の視覚断絶観察結果が `./tmp/cycle-187/cross-transition-observation.md` に記録されている（R10 / r3 重要-3 反映）
- [ ] TagList の `linkableTags` フィルタ挙動が補助 1 件（`2026-05-04-scroll-lock-reference-counter-for-multiple-components`）で観察され、非リンクタグ（`React` / `アクセシビリティ`）が DOM に描画されないことが確認されている（r3 Critical-1 反映）

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md` Phase 6 章 (L147-156) / 標準手順 (L289-302) / アンチパターン回避 (L338-346)
- `docs/cycles/cycle-187.md`（本ファイルのこれまでの記述）
- `/mnt/data/yolo-web/tmp/research/2026-05-11-blog-detail-page-phase6-migration-survey.md`（既調査資料、5 ファイル列挙 / 旧トークン棚卸し / 既存機能棚卸し / 高リスク 3 点）
- `docs/targets/AIの日記を読み物として楽しむ人.yaml`（M-α）
- `docs/targets/Webサイト製作を学びたいエンジニア.yaml`（M-β）
- `docs/targets/AIエージェントやオーケストレーションに興味があるエンジニア.yaml`（M-γ）
- `.claude/skills/frontend-design/SKILL.md` + `DESIGN.md`（Panel パターン / タイポ §3 / レイアウト §4 / 角丸 §5 / Do/Don't §6）
- `docs/knowledge/css-modules.md`（`:global(:root.dark)` の hash 問題）
- `docs/anti-patterns/implementation.md`（AP-I07/I08/I09）
- `docs/anti-patterns/workflow.md`（AP-WF03/04/05/07/11/12）
- `docs/anti-patterns/planning.md`（AP-P16/17）
- `docs/cycles/cycle-183.md`（ブログ一覧移行で確立したパターン、本サイクルの視覚連続性参照元）
- `docs/cycles/cycle-180.md`（TrustLevelBadge 撤去判断 B-333-2）
- `docs/cycles/cycle-185.md`（OGP/Twitter 画像移行先例、着手前撮影ルール）
- `docs/2026-05-08-cycle-184-doc-and-backlog-review.md`（B-389 キャンセル / B-391 Deferred の経緯）
- `src/app/(legacy)/blog/[slug]/`（5 ファイル、実体）
- `src/blog/_components/`（4 CSS Module、`MobileToc.test.tsx` の実体）
- `src/play/_components/PlayRecommendBlock.{tsx,module.css}`（D5 影響範囲）
- `src/dictionary/_components/DictionaryDetailLayout.tsx`（PlayRecommendBlock の legacy 側呼び出し元）
- `src/components/Panel/index.tsx`（新デザイン基盤）
- `src/components/Breadcrumb/index.tsx` / `src/components/ShareButtons/index.tsx`（差し替え先新版）

### r1 レビュー反映の対応サマリ

r1 レビュー（2026-05-11、本文末尾）の指摘事項 Critical 2 件 / 重要 6 件 / 改善提案 4 件、計 12 件すべてを計画書本文に反映した。指摘ごとの反映箇所を下表に示す。

| 指摘 ID | 区分     | 対応                                                                                                                                                                                                                                                                     | 反映箇所                                 |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| C1      | Critical | D1 の前提を「旧 1200px 相当」から **「旧 `old-globals.css` L28 で 960px」** に訂正。「同等以上」評価軸（コード横スクロール / Mermaid 図比率 / モバイル影響 / BlogCard 連続性）を T11 観察ポイントとして明示。                                                            | D1 / T11 / AP-WF12 抵触チェック / R 補強 |
| C2      | Critical | T2 に「新版 ShareButtons / Breadcrumb の module.css 旧トークン残存ゼロ確認」を追加（計画立案時に実体確認済み: いずれも残存ゼロ）。T12 に「コピー成功時 `--success` 視認」追加。                                                                                          | T2 / T12 / T6 注記 / 完了基準            |
| I1      | 重要     | D4 を「本文 Panel なし」から **「本文を透明 Panel として収める」（採用案 (b)）** に変更。検討した他の選択肢 ③ を AP-P17 に従い 3 案ゼロベース列挙（(a) DESIGN.md §1 改訂 / (b) 透明 Panel / (c) 本文+メタの大 Panel）し採用根拠を明示。DESIGN.md §1 の解釈は変更しない。 | D4 / T7 / 検討した他の選択肢 ③           |
| I2      | 重要     | D2 を「CSS Module 内に直値展開」から **「`globals.css` に `--font-mono` を 1 行追加」** に変更。Phase 7/8 での DRY と全体最適を優先。DESIGN.md §3 は本サイクルで改訂しない。                                                                                             | D2 / T6 注記 / T7 冒頭 / 完了基準        |
| I3      | 重要     | T10 に「テスト内文字列検索キー（`styles.postNav` 等）を T7 構造再設計と並べ読みし追随更新」を明示。検討した他の選択肢 ⑨ で「Playwright DOM 順序検証への置換」を別 backlog 化として列挙。                                                                                 | T10 / 検討した他の選択肢 ⑨               |
| I4      | 重要     | **R8（build パフォーマンス）を新規追加**。T11 に before、T14 に after の `time npm run build` 記録手順を追加。1.5 倍超増加で reviewer 報告。                                                                                                                             | R8 / T11 / T14 / 完了基準                |
| I5      | 重要     | T2 に「`(new)/layout.tsx` の flex/min-height 構造下での `.container { margin: 0 auto }` 動作および短文記事の Footer 位置を T11 で確認」を明示。**R9 を新規追加**。                                                                                                       | T2 / T11 / R9                            |
| I6      | 重要     | **代表 6 記事 slug を本計画書内で確定**（T1pre 新規追加）。TrustLevelBadge 表示記事 / `linkableTags` 確認 / 複数カテゴリ軸を選定基準に追加し、execution 段階に判定を持ち越さない。                                                                                       | T1pre / T1 / AP-WF12 抵触チェック        |
| S1      | 改善提案 | 採用: MobileToc.test.tsx のリネームを別 backlog 起票として、検討した他の選択肢 ⑩ に明示。                                                                                                                                                                                | 検討した他の選択肢 ⑩                     |
| S2      | 改善提案 | 採用: T11 観察ポイントに「TagList が新 Panel 体系下で `<header>` 直下に置かれたときの境界線・空気感」を追加。                                                                                                                                                            | T11                                      |
| S3      | 改善提案 | 採用: T14 に「`generateStaticParams` が 60 件返したことを build ログから確認し `./tmp/cycle-187/build-routes-count.txt` に保存」を追加。                                                                                                                                 | T14 / R8 / 完了基準                      |
| S4      | 改善提案 | 採用: 検討した他の選択肢 ⑧ として「一覧 BlogCard との視覚連続性をブログ詳細でどう取るか」を 3 案列挙し採用案 Z（共通トークン再利用 + 詳細独自の Panel パターン）を明示。                                                                                                 | 検討した他の選択肢 ⑧                     |

**r2 で再レビュー観点として残るもの**: 上記反映の結果として新たに混入したリスク（例: 透明 Panel の DESIGN.md §1 解釈の妥当性、`--font-mono` の `globals.css` 追加が DESIGN.md §3 と矛盾しないかの判断、build 時間 1.5 倍閾値の妥当性）は r2 レビューの中で reviewer が判断する観点として残す。

### r2 レビュー反映の対応サマリ

r2 レビュー（2026-05-11、本文「## レビュー結果 > ### r2 レビュー」）の指摘事項 Critical 1 件 / 重要 3 件 / 改善提案 2 件、計 6 件すべてを計画書本文に反映した。指摘ごとの反映箇所を下表に示す。事実情報はすべて r3 時点で `src/blog/_lib/blog.ts` / `src/blog/_components/BlogListView.tsx` / `src/components/Panel/index.tsx` / `src/app/old-globals.css` / 6 slug の `src/blog/content/<slug>.md` を Read して再検証済み（AP-P16 / AP-WF12 厳守）。

| 指摘 ID    | 区分     | 対応                                                                                                                                                                                                                                                                                                                                                                                      | 反映箇所                                                    |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Critical-1 | Critical | `linkableTags` がフロントマターのフィールドではなく `getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE=3)` 由来の派生 Set であることを明示。6 件すべてのタグが linkable に該当するため、TagList フィルタ挙動観察用に補助 1 件 (`scroll-lock-reference-counter-for-multiple-components`) を T11 に追加し、6 slug は再選定せず固定する（execution 再判断なし、I6 厳守）。AP 抵触チェックにも明記。 | T1pre / T11 / AP-P16 抵触チェック / 完了基準                |
| 重要-1     | 重要     | D4 の Panel 実装手段を PM 確定: **(i) `Panel` コンポーネントに `variant="default" \| "transparent"` を追加し、`Panel.module.css` に `.transparent` を追加** する API 拡張で確定。CSS Module 打ち消し案は却下理由併記。builder への委譲範囲は padding 値・JSX 構造に限定。                                                                                                                 | D4 / T7 / AP 抵触チェック / 完了基準                        |
| 重要-2     | 重要     | D5 PlayRecommendBlock の (legacy) 解決手段を PM 確定: **`var(--fg, var(--color-text))` 形式の fallback 構文** を採用、`old-globals.css` 複製案は却下理由（Phase 10.2 で 2 箇所削除 / 値乖離事故リスク）併記。T6 置換規則に fallback 列を追記、検討した他の選択肢 ④ も書き換え。                                                                                                           | D5 / T6 / 検討した他の選択肢 ④ / AP 抵触チェック / 完了基準 |
| 重要-3     | 重要     | R10「(new)→(legacy) クロス遷移時の視覚断絶」を新規追加。T11 観察ポイントに「`PlayRecommendBlock` または関連リンク経由のクロス遷移」を追加し、`./tmp/cycle-187/cross-transition-observation.md` への記録を完了基準に追加。                                                                                                                                                                 | R10 / T11 / 完了基準                                        |
| S5         | 改善     | T1pre のカテゴリ分散記述を訂正: 実際は `ai-workflow` ×3 / `dev-notes` ×2 / `site-updates` ×1 の 3 カテゴリ。「6 軸」「5 軸」記述は事実誤認として撤回。5 カテゴリ全網羅ではないことを明示し、`tool-guides` / `japanese-culture` は `/storybook` 撮影とパンくず確認で補完する旨を記載。                                                                                                     | T1pre / AP 抵触チェック                                     |
| S6         | 改善     | 完了基準に R9 (短文記事 Footer / main 中央寄せ確認の記録) を 1 項目追加。                                                                                                                                                                                                                                                                                                                 | 完了基準                                                    |

**r3 で再レビュー観点として残るもの**: 上記反映により新たに導入された設計判断（Panel コンポーネント `variant` 追加の API 設計が Phase 7/8 でも妥当か、fallback 構文の冗長性が CSS の可読性に与える影響、TagList フィルタ挙動を補助 1 件で観察する判断の網羅性）は r3 レビューの中で reviewer が判断する観点として残す。

### r3 レビュー反映の対応サマリ

r3 レビュー（2026-05-11、本文「## レビュー結果 > ### r3 レビュー」）の指摘事項 Critical 2 件 / 重要 2 件 / 改善提案 3 件、計 7 件すべてを計画書本文に反映した。指摘ごとの反映箇所を下表に示す。事実情報はすべて r4 時点で実体ファイルを Read して確認済み（AP-P16 / AP-WF12 / AP-WF09 厳守、frontmatter 全フィールド対照表を本サイクル末尾に追加）。

| 指摘 ID    | 区分     | 対応                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 反映箇所                                                                                       |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Critical-A | Critical | T1pre 記事 6 の選定根拠を全面書き換え（「frontmatter に `trustLevel` を明示」「撤去前後比較に必須」を撤回し、`site-updates` カテゴリ代表 + サイト機能題材 + 中尺の 3 軸に再設計）。T9 を全面書き換え: ブログの `trustLevel` 実体は `src/blog/_lib/blog.ts` L150 / L189 / L235 のコード側ハードコードであり、3 案 (a)/(b)/(c) を AP-P17 で列挙、(a) `page.tsx` の import/JSX のみ撤去 + 型・ハードコード・テスト 7 件残置を PM 確定。B-337 への申し送り 5 項目を明示。 | T1pre / T9 / AP 抵触チェック（AP-P16 / AP-WF09 / AP-P17）/ 完了基準                            |
| Critical-B | Critical | D2 の `--font-mono` 追加値を `ui-monospace, SFMono-Regular, "SF Mono", Menlo, ...` から `"Menlo", "Consolas", "Liberation Mono", "Courier New", monospace`（= `old-globals.css` L16 既存値）へ訂正。値統一の根拠を採用案 (P) / 却下案 (Q)・(R) の 3 案で列挙（AP-P17）。T7 冒頭タスクの記述も同期。                                                                                                                                                                   | D2 / T7 / AP 抵触チェック / 完了基準                                                           |
| 重要-A     | 重要     | D4 `.transparent` の padding 値を「builder が決定」から **PM 確定で `padding: 0`** に変更。本文の縦余白責務を `<article>` 内の段落・見出し側に一元化する設計根拠を明示。`Panel.module.css` の CSS specificity 上の振る舞い（`.panel.transparent` の後勝ち、`border-radius` 継承の意図）も整理。T7 / 完了基準も同期。                                                                                                                                                  | D4 / T7 / 完了基準                                                                             |
| 重要-B     | 重要     | 完了基準 L412 と T6 注記の矛盾（`--font-mono` 残存ゼロ要件 vs 維持方針）を解消: 完了基準を「`--color-*` / `--max-width` のみ残存ゼロ、`--font-mono` は残置許容」に修正。R1 / T6 末尾の grep コマンドからも `--font-mono` を除外。                                                                                                                                                                                                                                     | 完了基準 / R1 / T6                                                                             |
| S1-r3      | 改善     | 「### 6 slug + 補助 1 件 frontmatter 全フィールド対照表」を計画書末尾（補足事項より前）に新規追加。10 フィールド × 7 記事 = 70 セルで存在 / 不在を一覧化（4 サイクル目の同型誤認再発防止）。                                                                                                                                                                                                                                                                          | 「### 6 slug + 補助 1 件 frontmatter 全フィールド対照表」セクション新設 / AP-WF09 抵触チェック |
| S2-r3      | 改善     | T9 撤去後検証として `grep -rn "trustLevel\|TrustLevelBadge" src/app/(new)/blog/[slug]/` 残存ゼロ確認を追加（AP-WF04 適合性向上）。完了基準にも反映。                                                                                                                                                                                                                                                                                                                  | T9 / 完了基準                                                                                  |
| S3-r3      | 改善     | D2 説明に「`globals.css` への追加」と「DESIGN.md への加筆」の判断境界を明示（3 条件で本サイクルは加筆見送り、Phase 10.2 での一括整合チェックに委ねる）。                                                                                                                                                                                                                                                                                                              | D2                                                                                             |

**r4 で再レビュー観点として残るもの**: 上記反映により新たに導入された設計判断（T9 採用案 (a) のスコープ規律が後続 Phase 10.2 で確実に拾われるか、`.transparent { padding: 0 }` が本文 `<article>` の縦余白を builder の `<article>` 内段落マージン設計に責任移譲することの妥当性、`--font-mono` 値統一が `Menlo` 始まりで M-β のコード可読性に与える影響、frontmatter 対照表が今後の同型誤認防止として機能するか）は r4 レビューの中で reviewer が判断する観点として残す。

### 6 slug + 補助 1 件 frontmatter 全フィールド対照表（r3 S1-r3 反映で新規追加）

本計画書で確定した主 6 slug + TagList 観察用補助 1 slug の `src/blog/content/<slug>.md` frontmatter を r4 反映時点で再度 Read し、全フィールド存在 / 不在を一覧化する。AP-WF09（チェック対象の範囲を恣意的に絞らない）への 4 サイクル目の同型誤認（r1 `--max-width`、r2 `linkableTags`、r3 `trustLevel` に続く）を防ぐため、本表は計画書内に固定する。本表の参照を経ずに frontmatter 由来の判断を計画書に書くことは禁ずる。

**凡例**: ○ = フィールド存在 / × = フィールド不在 / 値は実体値（長い配列は要約）

| 記事                                                        | title | description | published_at | updated_at    | tags                                                                               | category     | series        | series_order | related_tool_slugs              | draft    | slug | trustLevel                                    |
| ----------------------------------------------------------- | ----- | ----------- | ------------ | ------------- | ---------------------------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------------------------- | -------- | ---- | --------------------------------------------- |
| 1: letter-from-an-ai-that-cant-see-the-future               | ○     | ○           | 2026-05-10   | × (null 明示) | AIエージェント / ワークフロー / Claude Code / 失敗と学び (4 件)                    | ai-workflow  | ai-agent-ops  | ×            | [] (空配列)                     | false    | ×    | × (実体は blog.ts L189 / L235 のハードコード) |
| 2: how-we-built-this-site                                   | ○     | ○           | 2026-02-13   | 2026-03-15    | AIエージェント / ワークフロー / Claude Code / ワークフロー連載 (4 件)              | ai-workflow  | ai-agent-ops  | 1            | [] (空配列)                     | false    | ○    | ×                                             |
| 3: mermaid-gantt-colon-trap-and-render-testing              | ○     | ○           | 2026-03-02   | 2026-03-02    | TypeScript / 設計パターン / 舞台裏 (3 件)                                          | dev-notes    | × (null 明示) | ×            | [] (空配列)                     | false    | ○    | ×                                             |
| 4: admonition-gfm-alert-support                             | ○     | ○           | 2026-03-01   | 2026-03-01    | Next.js / UI改善 / 新機能 (3 件)                                                   | dev-notes    | × (null 明示) | ×            | [] (空配列)                     | false    | ○    | ×                                             |
| 5: ai-agent-concept-rethink-1-bias-and-context-engineering  | ○     | ○           | 2026-03-05   | 2026-03-06    | AIエージェント / ワークフロー / 失敗と学び / Claude Code / ワークフロー連載 (5 件) | ai-workflow  | ai-agent-ops  | 7            | （配列複数件、別 Notion ID 群） | false    | ○    | ×                                             |
| 6: content-trust-levels                                     | ○     | ○           | 2026-02-28   | 2026-03-01    | UI改善 / TypeScript / サイト運営 / 新機能 (4 件)                                   | site-updates | × (null 明示) | ×            | （配列複数件、別 Notion ID 群） | false    | ○    | ×                                             |
| 補助: scroll-lock-reference-counter-for-multiple-components | ○     | ○           | 2026-05-05   | 2026-05-05    | Next.js / React / Web開発 / 設計パターン / アクセシビリティ (5 件)                 | dev-notes    | ×             | ×            | [] (空配列)                     | × (省略) | ×    | ×                                             |

**本表から導かれる事実**:

1. **`trustLevel` フィールドは全 7 記事の frontmatter に存在しない**（×印が 7/7）。実体は `src/blog/_lib/blog.ts` L150 (型) / L189 (`getAllBlogPosts()`) / L235 (`getBlogPostBySlug()`) でコード側ハードコード `trustLevel: "generated" as const`。記事 6 本文 L122 にも planner 選定記事自身が「frontmatter に trustLevel フィールドを追加するのではなく、コード内で一律 `"generated"` を設定」と明示。
2. **`linkableTags` も frontmatter に存在しない**（表に列がない＝全件不在）。実体は `src/blog/_components/BlogListView.tsx` L83-86 で `new Set(getTagsWithMinPosts(3))` として runtime 算出される派生 Set。
3. **`category` フィールドの分散**は `ai-workflow` ×3、`dev-notes` ×3（記事 3 / 4 / 補助）、`site-updates` ×1 で実質 3 カテゴリ。5 カテゴリ全網羅ではない。
4. **`series` フィールドは記事 1 / 2 / 5 の 3 件のみ存在**（いずれも `ai-agent-ops`）。`series_order` は 3 件中 2 件 (記事 2 / 5) のみ。記事 1 は `series` あり `series_order` なし。
5. **`updated_at` は記事 1 で `null` 明示**（その他は文字列）。`series` も記事 3 / 4 / 補助で `null` 明示または不在。
6. **`slug` フィールドは記事 1 / 補助で frontmatter に存在しない**（ファイル名から導出される）。ただし `blog.ts` L178 / L218 で `data.slug || file.replace(/\.md$/, "")` のフォールバックがあり機能上は問題ない。
7. **`description` は全件存在**、`related_tool_slugs` も全件存在（空配列か複数件）、`draft` は補助のみ省略（=undefined、`blog.ts` L174 で `=== true` 判定のため false 扱い）。

**本対照表の使い方（4 サイクル目以降の予防）**:

- frontmatter 由来の判定基準を計画書に書く際は、本表の該当列を参照して「存在することを確認した」ことの根拠とする。
- 計画書本文に「frontmatter にあるから…」と書く前に本表で当該フィールドの列が ○ になっていることを確認する。
- ×印のフィールドを「実体確認した」と称することは禁ずる（実体は別の場所＝コード側 / runtime 算出に存在する旨を必ず併記する）。

## レビュー結果

### r4 レビュー（2026-05-11）

**総合判定**: 承認

**r3 指摘の反映確認（実体エビデンス再検証込み）**: 7 / 7 件すべて反映成立

- **Critical-A（trustLevel ハードコード）**: 反映済み。
  - 実体確認: `grep -l "^trustLevel:" /mnt/data/yolo-web/src/blog/content/*.md` → **0 件**（r4 reviewer 独自実行で再確認、r3 と同一結果）。
  - `grep -n "trustLevel" /mnt/data/yolo-web/src/blog/_lib/blog.ts` → L150 (型定義) / L189・L235 (ハードコード `"generated" as const`) を本 reviewer が独立確認。planner の参照行と一致。
  - T1pre 記事 6 の選定根拠（L47）が「site-updates カテゴリ代表 + サイト機能題材 + 中尺」の 3 軸に再設計され、「frontmatter に trustLevel を明示」記述は撤回済み。「撤去対象のバッジ表示はコード側ハードコードで全 60 記事一律」と planner が明示。
  - T9（L155-173）が全面書き換え済み: 採用案 (a) = page.tsx の import/JSX のみ撤去、型・ハードコード・テスト 7 件残置を AP-P17 に従い 3 案列挙のうえ PM 確定。B-337 への申し送り 5 項目を明示。
  - reviewer 独立検証で `grep -rln "trustLevel" .../*.test.*` → 7 ファイル（newSlugsHelper / searchFilter / BlogListView / BlogFilterableList / RelatedArticles / SeriesNav / blog.test / related-posts.test）を確認。planner が T9 L162 で挙げた 7 件と整合（planner が「7 件」と書きながらリストは 8 個列挙しているのは表記ゆれの軽微な不整合だが、内容は実体と一致）。

- **Critical-B（--font-mono 値統一）**: 反映済み。
  - 実体確認: `grep -n "font-mono" /mnt/data/yolo-web/src/app/old-globals.css` → **L16 で `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` を確認**（r4 reviewer 独自実行）。
  - D2（L75-92）、T7 冒頭タスク（L136）、完了基準（L461）の 3 箇所すべてが同一値（Menlo 始まり）に統一されている。`globals.css` 側に同じ値を追加する方針で (legacy)/(new) のコード等幅フォント分裂を回避する設計が一貫。
  - 値統一の根拠が採用案 (P) / 却下案 (Q)・(R) の 3 案で AP-P17 に従い列挙されており、判断プロセスのトレーサビリティが確保されている。

- **重要-A（.transparent padding 値）**: 反映済み。
  - D4（L95-99）で `.transparent { background: transparent; border: none; padding: 0; }` の **padding: 0 を PM 確定**として明示。
  - 「padding: 0 にすることで縦余白の責務を本文側（`<article>` 内の段落・見出し）に一元化」という設計根拠を併記し、`Panel.module.css` の specificity（`.panel.transparent` 後勝ち、`border-radius` 継承）の振る舞いまで整理。
  - 完了基準 L463 にも `padding: 0` 明示。「具体的な padding 値は builder が決定」という r3 時点の AP-WF03 線引き曖昧さは解消された。

- **重要-B（完了基準と T6 の矛盾解消）**: 反映済み。
  - 完了基準 L451 を「**`--color-*` / `--max-width` のみ残存ゼロ、`--font-mono` は残置許容**」に書き換え済み。
  - T6 末尾 grep コマンド（L132 `grep -rn "\-\-color\-\|\-\-max\-width" src/blog src/play src/app/(new)/blog`）から `--font-mono` を除外済み。
  - R1（L344）でも「`--font-mono` は grep 対象外」と明示。3 箇所すべて同じ意図に揃った。

- **S1-r3（6 slug + 補助 1 件 frontmatter 全フィールド対照表）**: 計画書 L545-569 に新規追加済み。10 フィールド × 7 記事 = 70 セルの表で存在 / 不在を一覧化、本表から導かれる事実 7 点と「本表の使い方」を併記。AP-WF09 の 4 サイクル目同型誤認再発防止策として本サイクル末尾に固定。**ただし対照表の内容に軽微な不正確が 2 件あり**（後述「改善提案」S1-r4 / S2-r4）。

- **S2-r3（T9 撤去後検証 grep）**: 反映済み。T9 L171 で `grep -rn "trustLevel\|TrustLevelBadge" src/app/\(new\)/blog/\[slug\]/` で残存ゼロ確認を追加、完了基準 L452 にも反映。AP-WF04 適合。

- **S3-r3（DESIGN.md 加筆判断境界）**: 反映済み。D2（L87-91）で「`globals.css` への追加」と「DESIGN.md への加筆」の判断境界を 3 条件で明示（`--font-mono` は old-globals 既存定義の (new) 側複製、§3 は本文用フォントの規定、Phase 10.2 で一括整合チェック）。条件のいずれかが崩れた場合は別判断が必要と planner が明記しており、Phase 7/8 への引き継ぎ規律も担保。

**Critical（必修正）**: 0 件

**重要（強く推奨）**: 0 件

**改善提案（任意）**: 2 件

- **S1-r4（対照表の `slug` 列が事実と不一致）**: r3 で新規追加された対照表（L551-559）について、本 reviewer が `grep -E "^slug:" src/blog/content/<7 slug>.md` を 7 ファイルすべてに対し実行した結果、**7 件すべてに `slug:` フィールドが frontmatter に存在することを確認**（記事 1 = `slug: letter-from-an-ai-that-cant-see-the-future` / 補助 = `slug: "scroll-lock-reference-counter-for-multiple-components"` 含む）。一方で対照表 L553（記事 1）と L559（補助）の `slug` 列が `×` 表記になっており、planner が「6 で `data.slug || file.replace(/\.md$/, "")` のフォールバックがあり機能上は問題ない」と注釈付きで × 表記している（L568）。**実体は ○ である**（フォールバックの有無に関わらず frontmatter に明示存在）。本対照表は「frontmatter にフィールドが存在するか」を見るための表であり、フォールバック存在は別の事実なので、L553 / L559 を ○ に訂正し、注釈は別途付記する形に整える方が AP-WF09 予防効果がより強くなる。**機能影響ゼロ**（slug を実装判断に使う場所はなく、planner の T1pre / T9 等の判断は影響を受けない）のため改善提案レベル。
- **S2-r4（対照表の `related_tool_slugs` 列が記事 5 / 6 で不正確）**: 対照表 L557（記事 5） / L558（記事 6）の `related_tool_slugs` 列が「(配列複数件、別 Notion ID 群)」と記載されているが、本 reviewer が両ファイルを直接 Read（`awk` で frontmatter 全行表示）したところ、**記事 5（L37）/ 記事 6（L23）ともに `related_tool_slugs: []` が明示宣言**されている。両ファイルにある「`19cb...` / `19c9f...` 系の orphan YAML list」は `series_order: 7` / `series: null` 直後に出現するが、`related_tool_slugs: []` の前段で既に切れているため `related_tool_slugs` 自体は空配列。**機能影響ゼロ**（`related_tool_slugs` を本サイクルの T1pre / T11 / T12 で参照する用途は「PlayRecommendBlock / dictionary 詳細クロス遷移」の観察対象記事絞り込みのみで、空でも代替記事から動線確認可能）のため改善提案レベル。ただし対照表は事実誤認再発防止のために r3 で planner が自ら導入した装置であり、その表に factual error が残ることは AP-WF09 観点で改善余地。

**問題なし項目**:

- **観点 1（D1 二段構成 720px / 1200px の事実根拠）**: `grep -n "max-width" /mnt/data/yolo-web/src/app/old-globals.css` → L28 で `--max-width: 960px;` を独立再確認。D1（L71）の「旧 960px → 新 720/1200px 二段」記述と一致。T11 観察 4 軸（コード横スクロール / Mermaid 比率 / モバイル影響 / BlogCard 連続性）も維持。
- **観点 2（D2 globals.css 追加が DESIGN.md §3 と矛盾しない判断）**: DESIGN.md §3 は本文用フォントの規定で、コードブロック等幅は別射程として整理する planner の論拠（D2 L86 / L88）は本 reviewer が DESIGN.md §3 該当箇所を独立再読し合理的と判断。`Menlo / Consolas / Liberation Mono / Courier New / monospace` はすべて OS 標準等幅で、§3「ブラウザのシステムフォントを使う」と矛盾しない。Phase 10.2 で DESIGN.md §3 加筆を一括判断する設計は AP-WF15 同/別サイクル境界と整合。
- **観点 3（D4 Panel API 拡張と DESIGN.md §1 整合）**: `src/components/Panel/index.tsx` 40 行を独立再 Read → 現状 `as` / `children` / `className` の 3 props のみで `variant` 未実装、`Panel.module.css` 6 行（`.panel { background / border / border-radius / padding }`）を独立再 Read。`variant` props 追加 + `.transparent` クラス追加が既存実装と直交し型整合崩壊なし。`.transparent` の specificity と padding 0 設計（D4 L96-97）は本文 `<article>` 内の段落・見出し margin に縦余白責務を委譲する設計として一貫。
- **観点 4（D5 PlayRecommendBlock fallback の (legacy) 解決）**: `grep -nE "^[[:space:]]*--" /mnt/data/yolo-web/src/app/old-globals.css` で `:root` の定義を独立再確認 → 新トークン `--fg / --accent / --bg-soft / --border / --success` は **未定義**（planner 主張と一致）。fallback 構文 `var(--fg, var(--color-text))` が (legacy) 視覚崩れの最小化として妥当、Phase 10.2 で第二引数を機械削除するという出口設計（D5 L107）も一貫。
- **観点 5（T9 採用案 (a) と Phase 10.2 申し送り 5 項目の整合）**: T9 L172 の B-337 申し送り 5 項目 = (i) コンポーネント本体削除 / (ii) `blog.ts` L150・L189・L235 削除 / (iii) ブログテスト 7 件削除 / (iv) dictionary・ツール・遊び側削除 / (v) `@/lib/trust-levels` モジュール削除。reviewer 独立検証で `grep -rln "trustLevel"` で test 系 7 件 + `blog.ts` + `(legacy)/blog/[slug]/page.tsx` + 他 = 計画書の B-337 申し送りと整合。cycle-185 のスコープ越境事故と同型を避ける規律として一貫。
- **観点 6（⑩ 10 案ゼロベース列挙と AP-P17 整合）**: 「検討した他の選択肢と判断理由」を ①〜⑩ で再 Read → ① git mv vs 再設計 / ② 段階分割 / ③ Panel パターン 3 案 / ④ PlayRecommend (legacy) 解決 2 案 / ⑤ MobileToc.test / ⑥ TagList / ⑦ シンタックスハイライト / ⑧ BlogCard 連続性 3 案 / ⑨ Playwright DOM 順序検証 / ⑩ MobileToc リネーム — それぞれ却下案 + 採用案 + 理由が併記され AP-P17 適合。r3 で追加された T9 採用案 (a)/(b)/(c)、D2 採用案 (P)/(Q)/(R) も AP-P17 形式で整理。
- **観点 7（TrustLevelBadge 撤去 T9 が page.tsx の import/JSX のみで完結し、テスト 7 件は B-337 申し送り）**: T9 採用案 (a) の作業内容（L167-170）は「page.tsx の import 削除 / JSX 削除 / blog.ts は触らない / テスト 7 件は触らない」で確定、撤去後 grep（L171）で残存ゼロ確認、B-337 申し送り（L172）で機械的整合性を担保。一貫した設計。
- **観点 8（完了基準の機械的判定可能性）**: 完了基準 18 項目（L448-467）を逐一再読 → すべて `grep` / ファイル存在 / `time npm run build` 数値比較 / 視覚スクショ存在 で判定可能。L451 が「`--font-mono` 残置許容」に修正済み、L461・L463 の Panel/`.transparent` 値も具体明示済み。重要-B 矛盾は解消。
- **観点 9（AP 抵触チェックの実質性 + AP-WF09 補強）**: AP-I07 / I08 / I09 / I08 別側面 / P16 / WF12 / WF09 / WF03 / WF04 / WF05 / WF07 / WF11 / P17 を個別並べ読み。AP-P16 / AP-WF12 の項（L403-413）に r3 Critical-A の再検証履歴を明示追記、AP-WF09 専用項（L415-417）が新規追加され「frontmatter 由来の判断は対照表参照を経る」運用ルールを計画書内に固定化。再発防止のメカニズムが計画書に組み込まれた。
- **観点 10（来訪者価値 M-α / M-β / M-γ の整合）**: L26-32 のターゲット価値が D1〜D7 / T1〜T15 に紐づくことを再確認。Critical-B 反映により M-β「コードを取り入れるエンジニア」のフォント分裂リスクが解消、D4 透明 Panel は M-α「読み物没入感」を維持、R10 観察は M-γ「試行錯誤の連続性」のクロス遷移トラッキングを担保。
- **観点 11（cycle-185 スコープ越境事故と同型のリスクチェック）**: r3 で reviewer が点検した 6 項目（シンタックスハイライト / スクロール連動 TOC / TagList 撤去 / `--font-mono` 全体導入 / DESIGN.md §3 改訂 / Panel API 拡張）を r4 でも再点検 → すべて本サイクル限定 or 別 backlog 化で境界明確。T9 採用案 (a) で「コード側 trustLevel 残置」を選択しスコープ越境を回避した PM 判断は明示的。

---

**判定根拠**:

- r3 で挙げた Critical 2 件 / 重要 2 件はすべて計画書本文・完了基準・AP 抵触チェックに反映済みで、本 reviewer が独立に実体ファイル（`src/blog/_lib/blog.ts` / `src/app/old-globals.css` / `src/components/Panel/index.tsx` / `Panel.module.css` / `src/blog/content/*.md`）を Read して訂正成立を確認した。
- 改善提案 S1-r4 / S2-r4 は r3 で新規追加された対照表に残った軽微な事実不整合（`slug` フィールド存在判定 / `related_tool_slugs` 配列内容）。**いずれも本サイクルの execution 判断（T1pre slug 確定 / T9 撤去スコープ / D1〜D7 設計判断 / T11 視覚観察 / T12 機能動作確認）には機能影響ゼロ**。対照表は再発防止装置として導入されたものであり完成度を上げる価値はあるが、execution 中の builder 自律判断で訂正可能なレベル。
- r4 ガイダンス「4 回目のレビューであり、明白な事実誤認・抵触が残らない限り承認方向で判定すること。残存指摘が『あれば良い』レベルなら改善提案として、execution 中の builder 自律修正に委ねる判断もあり得る」に従い、Critical 0 / 重要 0 / 改善 2 件（機能影響ゼロ）の状態で **承認** とする。

---

**PM への指示**:

1. 計画は承認、builder への execution 移行可能。
2. 改善提案 S1-r4 / S2-r4 は **execution 中の builder 自律修正に委ねる**（T1pre の slug 列 / 記事 5・6 の `related_tool_slugs` 列を対照表内で訂正、本サイクル末尾の cycle-completion 時に planner / builder が一括反映してよい）。execution の本流（T1〜T15）には影響しないため、改善反映を待たずに builder へ渡してよい。
3. execution 後は通常通り実装レビュー（r-impl1）を受けること。レビューの省略は認められない。

---

### r3 レビュー（2026-05-11）

**総合判定**: 改善指示（不承認 — Critical 2 件 / 重要 2 件）

**r2 指摘の反映確認**: 6 / 6 件（すべての指摘で本文反映を確認、ただし Critical-1 の反映後に **新たな別系統の事実誤認**が発覚 → 後述 Critical-A）

- **Critical-1（`linkableTags` 派生概念、6 slug 確定固定）**: 反映済み。
  - 反映箇所: T1pre L50 で「`linkableTags` は frontmatter のフィールドではなく `getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE=3)` で runtime 算出される派生 Set」と明記。`src/blog/_lib/blog.ts` L366 (`getTagsWithMinPosts`) と `src/blog/_components/BlogListView.tsx` L83-86 を本 reviewer が独立再確認、planner の参照行と一致（AP-WF14 一次集計クリア）。補助 1 件 `2026-05-04-scroll-lock-reference-counter-for-multiple-components` を T11 L157 に追加 + 完了基準 L428 で確認義務化済み。
  - 本 reviewer 独自検証: 補助記事の `tags: ["Next.js", "React", "Web開発", "設計パターン", "アクセシビリティ"]` について各タグの全 60 記事中の出現数を `grep -c` で集計 → `Next.js: 15` / `React: 1` / `Web開発: 17` / `設計パターン: 21` / `アクセシビリティ: 1`。`MIN_POSTS_FOR_TAG_PAGE = 3` 未満（React / アクセシビリティ）が確かに非リンクで、計画書 L157 の「`React` / `アクセシビリティ` の 2 タグが非リンク」と完全一致。
  - 「6 slug は再選定せず固定」も計画書本文で execution 再判断余地を排除済み（L52「再選定不要」と明記）。

- **重要-1（D4 Panel API 拡張の PM 確定）**: 反映済み。
  - 反映箇所: D4 L81-83 で「`Panel` コンポーネントに `variant` プロパティ（`"default" | "transparent"`、未指定時 `"default"`）を追加し、`Panel.module.css` 側に `.transparent { background: transparent; border: none; padding: 0; }` 相当を追加」を PM 確定として明記。却下案（CSS Module 打ち消し）も併記。
  - 本 reviewer 独自検証: `src/components/Panel/index.tsx` を Read（全 40 行）。現状 API は `as` / `children` / `className` の 3 props（L7-13）+ rest spread。`variant` props 未実装 = planner 主張と一致。`Panel.module.css` L1-7 は `background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-normal); padding: 1.5rem;` の 4 行のみで、`.transparent` 追加は構造的に整合（衝突なし）。

- **重要-2（D5 PlayRecommendBlock の fallback 方式確定）**: 反映済み。
  - 反映箇所: D5 L88-93 で `old-globals.css` Read 結果に基づき新トークン未定義を明示、fallback `var(--fg, var(--color-text))` 形式を PM 確定。T6 L115 に置換規則対応表を併記。
  - 本 reviewer 独自検証: `grep -nE "^[[:space:]]*--" src/app/old-globals.css` で `:root` / `.dark` の定義を全件取得 → 旧体系（`--color-primary` / `--color-text` / `--color-bg-secondary` / `--color-border` / `--color-success` / `--color-text-muted` 等）のみ。新体系 `--fg` / `--accent` / `--bg-soft` / `--border` / `--success` は **両方の :root / .dark で未定義** を確認。planner 主張と一致。
  - **ただし `--font-mono` は old-globals.css L16 に既に定義済み**（`"Menlo", "Consolas", "Liberation Mono", "Courier New", monospace`）であることを reviewer が発見。これは fallback 対象外で計画書本文と矛盾しないが、`globals.css` 側でも `--font-mono` を**同じ値で**追加する必要がある（D2 で T7 冒頭タスク化）ことを意味する。両者が乖離した場合 (legacy)/dictionary 側と (new)/blog 側でコード等幅フォントの見た目が分かれる可能性がある（後述「改善提案」S3-r3）。

- **重要-3（R10 (new)→(legacy) クロス遷移リスク + T11 観察）**: 反映済み。
  - 反映箇所: R10 L348-351 に新規追加、T11 L158 で観察ポイント明示、完了基準 L427 で `./tmp/cycle-187/cross-transition-observation.md` への記録義務化。`PlayRecommendBlock` 経由 (new)→(legacy) と (legacy) dictionary→(new) の双方向を観察対象として明記。妥当。

- **S5（6 slug のカテゴリ分散事実訂正）**: 反映済み。
  - 反映箇所: T1pre L51 で「実際は 3 カテゴリ（`ai-workflow` ×3、`dev-notes` ×2、`site-updates` ×1）」と訂正、5 カテゴリ全網羅ではないことを明示、`tool-guides` / `japanese-culture` の補完手段（`/storybook` 撮影 + `(new)/blog/category/[category]` パンくず確認）も追記。
  - 本 reviewer 独自検証: 6 slug の `category:` フィールドを独立に各 .md ファイルで grep → `letter-from-an-ai = ai-workflow` / `how-we-built-this-site = ai-workflow` / `mermaid-gantt = dev-notes` / `admonition-gfm-alert = dev-notes` / `ai-agent-concept-rethink-1 = ai-workflow` / `content-trust-levels = site-updates`。planner 主張と完全一致。

- **S6（完了基準への R9 / R10 / 関連項目追加）**: 反映済み。
  - 反映箇所: 完了基準 L426（R9 短文記事 Footer / 中央寄せ確認）、L427（R10 クロス遷移観察）、L428（TagList 補助記事フィルタ挙動）、L424（Panel `variant` 追加）、L425（PlayRecommendBlock fallback 構文）の 5 項目が追加されており、すべて機械的判定可能（`./tmp/cycle-187/` 配下のファイル存在 / `src/components/Panel/index.tsx` の grep）。

**Critical（必修正）**: 2 件

- **Critical-A（r2 で見落とされた新規発見）: T1pre / T9 における `trustLevel` の所在に関する事実誤認 — `linkableTags` と同型のパターンの再々発（AP-P16 / AP-WF12 再抵触）**
  - 該当 1: T1pre L47「**TrustLevelBadge 現状表示記事 + 中尺**: `2026-02-28-content-trust-levels`（206 行、フロントマターに `trustLevel` を明示している記事、T9 撤去前後の比較に必須）」
  - 該当 2: T9 L140「各記事 frontmatter の `trustLevel` フィールド削除は **本サイクルでは行わない**（標準手順 Step 6 は『対応する meta.ts の trustLevel フィールドも削除する』だが、**ブログは meta.ts ではなく各 .md frontmatter にあるため**副作用が大きい。フィールド削除は B-337 = Phase 10.2 で行う）」
  - 実体（本 reviewer 独立検証）:
    - `grep -l "^trustLevel:" src/blog/content/*.md` → **0 件**。**いずれのブログ記事の frontmatter にも `trustLevel:` フィールドは存在しない**。
    - `grep -n "trustLevel" src/blog/_lib/blog.ts` の結果、L150 で型定義（`trustLevel: TrustLevel;`）、L189 / L235 で **コード側に一律 `trustLevel: "generated" as const` をハードコード**している。
    - 記事 6 自身（`content-trust-levels.md`）L122 本文: 「ブログ記事はすべてAI生成テキストであるため、**frontmatterにtrustLevelフィールドを追加するのではなく、コード内で一律 `"generated"` を設定しています**」と planner が選んだ記事自身が明示。
  - 影響:
    1. T1pre の「フロントマターに `trustLevel` を明示している記事 6」「T9 撤去前後の比較に必須」という選定根拠が**事実誤認**で崩れる。TrustLevelBadge は全 60 記事で一律 `generated` バッジ表示のため、撤去前後の比較は**どの記事でも同等**で、記事 6 を特別扱いする理由がない（題材的に関連はあるが「必須」ではない）。
    2. T9 の作業内容「各記事 frontmatter の `trustLevel` フィールド削除は本サイクルでは行わない」は **存在しない削除作業を「行わない」と宣言**しているため空文化している。一方で、撤去判断において本当に問題になるのは「`src/blog/_lib/blog.ts` L189 / L235 のコード側 `trustLevel: "generated" as const` を削除するか」「`BlogPost` / `BlogMeta` の型 `trustLevel: TrustLevel;` (L150) を削除するか」「テストファイル 7 件（`BlogListView.test.tsx` / `RelatedArticles.test.tsx` / `SeriesNav.test.tsx` / `newSlugsHelper.test.ts` / `searchFilter.test.ts` / `BlogFilterableList.test.tsx` / `blog.ts` / `related-posts.test.ts`）の `trustLevel: "generated"` 記述をどうするか」であり、これらが計画書で**まったく扱われていない**。
    3. r1 で C1（`--max-width: 1200px` 誤認）、r2 で Critical-1（`linkableTags` 誤認）、r3 で Critical-A（`trustLevel` 所在誤認）と、**3 サイクル連続で「frontmatter にあると断定したフィールドが実体は別の場所にある」という同型の事実誤認が再発**している。AP-P16 / AP-WF12 への 3 回目の抵触であり、planner が「6 slug の frontmatter を Read 確認した」（AP 抵触チェック L379「6 slug のカテゴリ分散は…各 `src/blog/content/<slug>.md` を Read して確認済み」）と書いているにも関わらず、**実際は `category` フィールドのみ確認して `trustLevel` フィールドの不在を見落としている**。これは AP-WF09（チェック対象の範囲を恣意的に絞る = 確認したい項目のみ確認して同時確認すべき近傍項目を見過ごす）にも該当。
  - 必修正:
    1. T1pre L47 の「フロントマターに `trustLevel` を明示している記事、T9 撤去前後の比較に必須」を削除する。記事 6 を保持する場合は別の理由（中尺 + site-updates カテゴリ + 「サイト機能を題材にする記事」としての視覚検証代表性）に書き換える。
    2. T9 L140 全体を書き換える。事実: ブログの `trustLevel` 値は `src/blog/_lib/blog.ts` L189 / L235 のコード側ハードコード `"generated" as const` で設定されており、frontmatter に該当フィールドは存在しない。本サイクルでの選択肢:
       - (a) `page.tsx` の import と JSX のみ削除（コード側 `trustLevel: "generated"` 定数は残置、`BlogPost` 型からも `trustLevel` フィールドは残置）→ 撤去後も `post.trustLevel` 参照箇所が他にないか grep 確認が必要。
       - (b) (a) に加えて `src/blog/_lib/blog.ts` L189 / L235 / L150 の `trustLevel` 関連記述を削除し、テストファイル 7 件の `trustLevel: "generated"` 記述も更新する（B-337 / Phase 10.2 まで遅らせず本サイクルで完結）。
       - (c) (a) のみ実施し、(b) は B-337 で対応（design-migration-plan.md L298「コンポーネント本体の最終削除は B-337」と整合）。

       いずれを採るかを PM が AP-P17 に従い計画書で確定する。design-migration-plan.md L298 の標準手順は「meta.ts の trustLevel フィールド削除」（ツール・遊び・dictionary のメタデータファイル）を指しており、ブログ用には準用できない。planner の解釈変換（「meta.ts ではなく frontmatter」）が成立せず、対処方針の再設計が必要。

    3. AP 抵触チェック L379 の「6 slug のカテゴリ分散は…Read して確認済み」記述は事実だが、「frontmatter の何を確認したか」をフィールド単位で明示する必要がある（`category` / `tags` / `series` は確認したが `trustLevel` は確認していなかったことを明記し、Critical-A の修正後に「6 slug のすべての frontmatter フィールドを並べた表」を計画書末尾に追加すると再発防止になる）。

- **Critical-B: D2「`globals.css` への `--font-mono` 1 行追加」の値が old-globals.css 側と乖離するリスクが計画書で扱われていない（重要-2 の見落とし側面）**
  - 該当: D2 L75「`src/app/globals.css` に `--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;` を 1 行追加」。
  - 実体: `old-globals.css` L16 に **既に** `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;` が定義されている（本 reviewer が `grep -n "font-mono" src/app/old-globals.css` で確認）。planner が D2 で追加しようとしている値は **先頭が `ui-monospace, SFMono-Regular, "SF Mono"`** で、old-globals 側の Menlo 始まりと**先頭部分が異なる**。
  - 影響:
    - Phase 6 完了直後の状態（混在期間）で、(new)/blog 側のコードブロックは `ui-monospace` 系（macOS Sonoma 以降 / Safari）でレンダリングされ、(legacy)/dictionary 側のコードブロックは `Menlo` 系でレンダリングされる。同じサイト内でフォントが分裂し、R10（クロス遷移視覚断絶）の現れ方が「コード等幅フォントの違い」として実体化する。M-β（コードを取り入れるエンジニア）には「同じサイトのコードが場所によって違う等幅フォント」となり違和感の原因になる。
    - r2 で fallback 構文を採用した思想（「(legacy) と (new) で同じ見た目を保つ」）が、`--font-mono` という別系統の決定で破られている。
  - 必修正: D2 の追加値を **`old-globals.css` の現状値と一致させる**か（`"Menlo", "Consolas", "Liberation Mono", "Courier New", monospace`）、もしくは「**`old-globals.css` 側の `--font-mono` を同じ値に統一する**」のいずれかを計画書で確定する。`old-globals.css` の値を本サイクルで触る場合は D5 fallback 案の「`old-globals.css` を本サイクルで触らない」原則と矛盾しないかを併せて整理。理想的には globals.css 側を Menlo 始まりに合わせれば old-globals 側は無変更で済む（fallback 戦略と整合）。

**重要（強く推奨）**: 2 件

- **重要-A: D4 `.transparent` クラスの padding 値が「builder が決定」になっており、`background: transparent; border: none;` だけで本文の縦余白を担保する設計責務が AP-WF03 線引きで PM 側か builder 側か曖昧**
  - 該当: D4 L81「**`.transparent { background: transparent; border: none; padding: 0; }` 相当のスタイル（具体的な padding 値は本文プロース表現に必要な縦余白を維持する形で builder が決定）**」。
  - 問題: `.transparent` クラスの padding 値が「padding: 0;」か「padding: 1.5rem 0;」か「padding を継承させる」かで、本文 `<article>` の縦余白が大きく変わる。これは Panel コンポーネントの API 拡張（PM 責務）の一部であり、「具体的な padding 値」だけを builder 判断にすると、後段で `<article>` 周辺の縦余白を CSS Module 側で再度上書きすることになり、Panel の transparent variant 単独で「読み物の縦余白」が完結しない設計になる。AP-WF03 の射程線引き「同じ要件を別の builder に渡したら別の実装になる余地があるか」で見ると、**padding 値は API 設計判断**であり、PM が確定すべき。
  - 影響: Panel の `variant="transparent"` を Phase 7/8 で再利用する際、本サイクルで padding 値を確定しないと「Phase 7/8 ではどんな padding を期待すべきか」がコードで一意に決まらず、各サイクルで個別判断が混入する。重要-1 で planner が確定した API 拡張の一部が builder 委譲のまま残っている。
  - 推奨: D4 で `.transparent` の padding 値を **「padding: 0;」または「padding: var(--panel-padding-prose, 0);」のような明示値**で PM 確定するか、本文 `<article>` の縦余白は **CSS Module 側ではなく `Panel.module.css` `.transparent` の padding 値で完結させる**ことを設計責務として明示する。同時に `Panel.module.css` の既存 `.panel` クラス（L5 `padding: 1.5rem;`）との関係（`.panel.transparent` で重ね掛けたとき padding が 0 に上書きされる順序か、`.transparent` 単独適用か）を明示。

- **重要-B: 完了基準 L412 と T7 / T6 の整合 — `--font-mono` の grep 残存「あってよい」記述が完了基準と整合していない**
  - 該当: T6 L116「**`--font-mono` は `globals.css` 側に正式トークンとして定義されたため grep 残存があってよい（=正しい使用）**」、完了基準 L412「CSS Module 6 ファイルから旧 `--color-*` / `--max-width` / **`--font-mono`** トークン参照が消えている（grep 残存ゼロ）」。
  - 問題: T6 注記は「`var(--font-mono)` のまま維持」と明記、完了基準 L412 は「`--font-mono` 残存ゼロ」を求める。**両者は明確に矛盾**。完了基準 L412 をそのまま満たすには CSS Module から `--font-mono` を消す必要があるが、T6 / D2 / T7 の方針は逆。完了基準 L412 のチェックを T14 で実行すると T6 / D2 の方針との不一致で「不合格」になるか、形式的に通過させるために grep オプションを操作する誘惑が生じる。
  - 影響: cycle-completion 時に完了基準を機械的に判定したとき、誤検出 / 不正な通過のリスクがある。AP-WF09（チェックリストの通過が目的化する）誘発因。
  - 推奨: 完了基準 L412 を「**CSS Module 6 ファイルから旧 `--color-*` / `--max-width` トークン参照が消えている（`--font-mono` は globals.css 正式トークンとして残置許容）**」に書き換える。または、T6 L116 の注記と完了基準 L412 の両方が同じ意図（`--color-*` / `--max-width` は撤去、`--font-mono` は維持）を共有する文言に揃える。

**改善提案（任意）**: 3 件

- **S1-r3**: 計画書末尾に「**6 slug の frontmatter 全フィールド対照表**」を 1 つ追加すると、Critical-A 修正後の再発防止に有効。`title` / `published_at` / `updated_at` / `tags` / `category` / `series` / `series_order` / `related_tool_slugs` / `draft` / `trustLevel`（不在を明示）の 10 フィールド × 6 記事 + 補助 1 記事 = 70 セル の表で「どのフィールドが存在し、どのフィールドが存在しないか」を一覧化する。これにより planner が「frontmatter から…」と書こうとした際の自己チェックポイントになる。
- **S2-r3**: T9（TrustLevelBadge 撤去）の作業内容に「撤去後に `grep -rn "trustLevel\|TrustLevelBadge" src/app/(new)/blog/[slug]/` で残存ゼロを確認」を追加すると AP-WF04 適合性が増す。現状の T9 は「import 行と JSX を削除」までで残存検証がない。
- **S3-r3**: Critical-B の修正に併せて、`--font-mono` を `globals.css` に追加するとき **DESIGN.md にトークン追加の記録を残すか否か**を計画書で確定すべき。現状 D2 L77 は「DESIGN.md §3 への加筆は本サイクル内で行わず」と書いているが、`globals.css` の `:root` に新トークンを追加することは DESIGN.md §6 等の「トークン一覧」と整合性を持つ必要があり、トークン追加 = ドキュメント反映を伴うのが通例。「§3 改訂は不要」と「`globals.css` への追加だけは OK」の判断境界を明示。

**問題なし項目**:

- **観点 1（D4 Panel API 拡張と DESIGN.md §1 整合）**: 本 reviewer が `src/components/Panel/index.tsx` (40 行) と `src/components/Panel/Panel.module.css` (7 行) を独立に Read。`variant` props 追加は既存 props（`as` / `children` / `className`）と直交し型整合崩壊なし。`Panel.module.css` の現状は `background / border / border-radius / padding` の 4 プロパティだけで、`.transparent` クラスを `background: transparent; border: none;` で上書きする設計は CSS specificity 上問題なし（同じセレクタ強度で後勝ち）。DESIGN.md §1「すべてのコンテンツはパネルに収まった形で提供される」は「**透明という表現バリアントの Panel**」も Panel の一形態として包含可能であり、§1 改訂を伴わない（採用案 (b) の選択は維持）。**ただし重要-A の padding 値確定が残る**ため部分的に問題あり。
- **観点 2（D5 fallback 方式の Phase 10.2 撤去計画）**: 計画書 L92 で「Phase 10.2 で fallback の第二引数を機械的に削除すれば自然に整理できる」と明示。本 reviewer が Phase 10.2 = B-337 の design-migration-plan.md L262 / L359 周辺を Read、`old-globals.css` 撤去時に旧定義は同時に消えるため、`PlayRecommendBlock.module.css` の `var(--fg, var(--color-text))` から `var(--fg)` への単純削減で済む。grep 置換で機械的に実施可能（`var\(--fg, var\(--color-text\)\)` → `var(--fg)` の正規表現置換）。後続サイクルへの引き継ぎ方として妥当。
- **観点 3（6 slug 固定で linkableTags 観察できない問題への補助記事 1 件追加）**: ls で `src/blog/content/2026-05-04-scroll-lock-reference-counter-for-multiple-components.md` の実体確認済み。frontmatter の `tags: ["Next.js", "React", "Web開発", "設計パターン", "アクセシビリティ"]` を Read、各タグの出現数を `grep -c` で 60 記事に対して集計し `React: 1` / `アクセシビリティ: 1` （いずれも `< 3` で非リンク）を確認。category も `dev-notes` で既存 6 軸と重複なし。撮影 4 枚不要・TagList 部分のみ視覚確認の取扱（L157）は撮影コストを抑える妥当判断。
- **観点 4（R10 観察ポイント記録先 `./tmp/cycle-187/cross-transition-observation.md` の運用可能性）**: 完了基準 L427 で「観察結果が記録されていること」をファイル存在で判定可能。視覚断絶の許容範囲か否かの主観判定は reviewer / Owner に委ねられるが、cycle-185 の OGP/cross 観察 (`./tmp/cycle-185/cross-*` 系) と同じパターンで運用実績あり。R10 L351 で「Phase 7/8 で自然解消」と明記しており、本サイクルは観察と記録に留めるスコープ規律も妥当。
- **観点 5（cycle-185 「PM 重大事故報告: 検索結線のスコープ越境」と同型のリスク）**: 本 reviewer が cycle-185.md L335 周辺を Read。事故の構造は「スコープ外 (Phase 5) への踏み込みを Critical 指摘の対症療法として即時実装」。本計画書のスコープ規律を点検: (a) シンタックスハイライト = D6 で別 backlog 明示、(b) スクロール連動 TOC = D3 で別 backlog 明示、(c) TagList 撤去 = D7 で B-391 待ち、(d) `--font-mono` 全体導入 = D2 で本サイクル限定の 1 行追加（globals.css のみ、CSS Module 個別展開は回避）、(e) DESIGN.md §3 改訂 = D2 で別サイクル化、(f) Panel API 拡張 = D4 で本サイクル限定（API は将来再利用、本サイクル内で完結）。**Critical-A の T9 が `src/blog/_lib/blog.ts` のコード側 trustLevel 削除に踏み込むか否か**で同型のスコープ越境を起こす可能性があるため、Critical-A の修正案 (a)/(b)/(c) で PM が境界を確定する必要がある。
- **観点 6（来訪者価値 M-α / M-β / M-γ の整合）**: 計画書 L26-32 の各ターゲット価値と D1〜D7 / T1〜T15 の整合は r2 で確認済みのまま維持。Critical-A / Critical-B はいずれも来訪者価値の方向性を歪めないが、Critical-B（`--font-mono` 値乖離）は M-β「コード可読性」に直接影響するため修正が必要。
- **観点 7（D1 拡幅 720px / 1200px 二段構成の影響観察）**: T11 L156 で「コード横スクロール頻度 / Mermaid 図比率 / モバイル影響 / 一覧 BlogCard との視覚連続性」の 4 観察軸が引き続き明示されており、r1 / r2 の C1 反映として維持。
- **観点 8（AP 抵触チェックの実質性）**: AP-I07 / I08 / I09 / I08 別側面 / AP-P16 / AP-WF12 / AP-WF03 / AP-WF04 / AP-WF05 / AP-WF07 / AP-WF11 / AP-P17 を本 reviewer が個別に並べ読み。**ただし AP-WF09（チェック対象の範囲を恣意的に絞る）への抵触が Critical-A で発火**しているため、本観点も部分的に問題あり。Critical-A 修正時に AP-WF09 抵触チェック項目の追加を推奨。

---

**判定根拠**:

- Critical-A は r1 (`--max-width: 1200px`)、r2 (`linkableTags`) と**同型の事実誤認の 3 回目の再発**。frontmatter にあると断定したフィールドが実体は別の場所（コード側 / runtime 算出）にあるパターンの繰り返しで、AP-P16 / AP-WF12 / AP-WF09 への複合抵触。planner が「Read 確認済み」と明示している（AP 抵触チェック L379）にも関わらず確認対象を `category` フィールドに恣意的に絞っていた構造が AP-WF09 そのもの。修正規模は大きくない（T1pre L47 と T9 L140 の書き換え + Critical-A 修正案の PM 確定）が、本質的に同じ失敗パターンの再発であるため Critical 扱い。
- Critical-B（`--font-mono` 値乖離）は r2 重要-2 の fallback 思想（(legacy)/(new) の見た目分裂を防ぐ）と直接矛盾する別系統の決定が混入しており、混在期間中の M-β 価値毀損可能性がある。修正は globals.css 追加値を old-globals.css 既存値と揃えるだけで完了するため軽微だが、計画段階で確定すべき設計判断。
- 重要-A（`.transparent` padding 値の builder 委譲）は r2 重要-1 で確定した API 拡張の射程整合の問題。重要-B（完了基準 L412 と T6 L116 の矛盾）は機械的判定可能性の問題で cycle-completion 時の事故予防として確定要。
- 改善提案 S1-r3 / S2-r3 / S3-r3 は再発防止 / トレーサビリティ改善で Critical / 重要ではない。

判断基準（Critical 2 件 + 重要 2 件）に従い、「**改善指示**」とする。

---

**PM への指示**:

1. Critical-A / Critical-B / 重要-A / 重要-B を計画書に反映するため planner を起動する。改善提案 S1-r3 / S2-r3 / S3-r3 も合わせて反映する。
2. 反映後、もう一度本レビュアー（r4）に再レビューを依頼する。r4 では前回指摘事項だけでなく**全体の見直し**を含める。**特に「6 slug の frontmatter 全フィールド対照表」(S1-r3) を計画書に追加して、frontmatter ベースの選定基準が事実と整合することを再々検証する**こと（r1 / r2 / r3 と 3 サイクル連続で同型誤認が発生しているため、4 サイクル目の再発を防ぐ）。
3. レビューの省略は認められない。

---

### r2 レビュー（2026-05-11）

**総合判定**: 改善指示（不承認 — Critical 1 件 / 重要 3 件）

**r1 指摘の反映確認**: 9.5 / 12 件（C2 部分反映、I6 部分反映、その他は成立）

- **C1（D1 数値訂正 960px）**: 反映済み — L71 で「旧 `--max-width: 960px` (`src/app/old-globals.css` L28)」と明記、`old-globals.css` L28 を実体確認し `--max-width: 960px;` を確認。「同等以上」観察ポイント 4 項目（コード横スクロール / Mermaid 図比率 / モバイル影響 / BlogCard 連続性）が T11 L145 に追加されている。
- **C2（新版 module.css 旧トークン残存確認）**: **一部反映** — T2 L61-64 に確認手順は追加されているが、計画書本文に「計画立案時点で確認済み = 残存ゼロ」と planner が断定している。本 reviewer が実体検証した結果（`grep "var(--" src/components/ShareButtons/ShareButtons.module.css /mnt/data/yolo-web/src/components/Breadcrumb/Breadcrumb.module.css`）では事実その通り（ShareButtons は `--success` のみ、Breadcrumb は `--fg-soft / --fg-softer / --accent / --accent-strong / --fg` のみ）で問題なし。ただし T2 を builder にも実行させる手順として残しているため C2 観点は成立。T12 L156 のコピー成功 `--success` 視認確認も追加されている。
- **I1（D4 を 3 案ゼロベース再列挙）**: 反映済み — L191-205 で (a) §1 改訂 / (b) 透明 Panel / (c) 本文+メタ大 Panel の 3 案が AP-P17 に従い列挙され、(b) 採用の根拠 4 条件（§1 維持 / 没入感確保 / 視覚階層 / 入れ子なし）も明示。DESIGN.md §1（L7-8「すべてのコンテンツはパネルに収まった形で提供される」）の原文と整合。
- **I2（`--font-mono` を globals.css に 1 行追加）**: 反映済み — D2 L75-78 で globals.css への 1 行追加に方針変更、T7 L109 で「冒頭タスク」として実装手順を明示、DESIGN.md §3 改訂は不要として整理されている。
- **I3（page.test.tsx literal 対策 + 別 backlog 化案）**: 反映済み — T10 L132-137 で literal 並べ読み + 追随手順、検討した他の選択肢 ⑨（L242-250）で Playwright 化を別 backlog として列挙し採否（採用案 Q）を明示。
- **I4（build 時間記録）**: 反映済み — R8 L319-322 新規追加、T11 L148 / T14 L166 に before/after 記録手順、完了基準 L391 に「1.5 倍以上の増加がない」追加。
- **I5（layout.tsx 副作用検証）**: 反映済み — T2 L66 で `(new)/layout.tsx` 構造下の `.container { margin: 0 auto }` 動作と短文記事 Footer 位置を T11 観察ポイントとして明示、R9 L324-327 新規追加。
- **I6（代表 6 記事 slug 確定）**: **一部反映** — T1pre L40-52 で 6 slug が確定列挙され、`ls src/blog/content/` で 6 ファイル存在を本 reviewer が確認済み（6/6 hit）。ただし「linkableTags 0 件と複数件の両方」については **本 reviewer の重要指摘あり**（後述 Critical-1）。
- **S1（MobileToc.test.tsx リネーム別 backlog 化）**: 反映済み — 検討した他の選択肢 ⑩（L252-258）で明示。
- **S2（TagList 観察ポイント）**: 反映済み — T11 L146 に追加。
- **S3（`generateStaticParams` 60 件ログ確認）**: 反映済み — T14 L167 に追加、完了基準 L392 に追加。
- **S4（BlogCard との視覚連続性）**: 反映済み — 検討した他の選択肢 ⑧（L231-240）で 3 案列挙、採用案 Z 明示。

**Critical（必修正）**: 1 件

- **Critical-1（新規発見、I6 反映の事実精度不足）: `linkableTags` がフロントマターに存在しないフィールドであり、T1pre の「実体確認」と矛盾する**
  - 該当: T1pre L50「`linkableTags` が 0 件と複数件の両方」「T1 段階で各記事の `linkableTags` を実体確認し…0 件と複数件の両方が代表 6 件に含まれることを確認」、L41「`src/blog/content/` の実体確認とフロントマターから選定」。
  - 実体: 本 reviewer が `grep -nE "linkableTags" /mnt/data/yolo-web/src/blog/content/*.md` を実行した結果、**フロントマターに `linkableTags` を持つ記事はゼロ**。`linkableTags` は frontmatter のフィールドではなく、`tags` から runtime 側（おそらく `src/blog/lib/*` 等）でリンク可能タグを導出して算出される派生概念。T1pre は「フロントマターから選定」と述べているが、フロントマターに無い項目を「実体確認」する手順は成立しない。
  - 影響: AP-P16 / AP-WF12（事実情報の実体確認）に再抵触。I6 で planner が「6 slug を計画書内で確定」した目的（execution 段階の判定持ち越し回避）が、`linkableTags` という存在しないフィールドを参照する手順により未達成になる。さらに L51 で「不足する場合は記事 1 または記事 6 を `linkableTags` が他軸と異なる記事に差し替える（PM が再判断、本計画書内で更新）」と記載されているが、これは **計画書内で確定済みと言いながら execution 開始前の再判断余地を残す矛盾**であり、I6 の本来の解消が実現していない。
  - 必修正:
    1. `linkableTags` の真の定義（`src/blog/lib/*` 配下の関数か）を確認し、計画書では「タグ数 N 件と 0 件の混在」または「TagList 表示時のリンク可能タグ数の差」のように、frontmatter から判定可能な軸に書き換える。
    2. 「不足する場合は再判断」の条件分岐を計画書から削除し、6 slug を**完全に固定**するか、`tags: [...]` の件数で判定可能な軸に基準を変更して 6 slug を再選定する。例えば記事 4 (`admonition-gfm-alert-support`) は `tags: ["Next.js", "UI改善", "新機能"]` の 3 件、記事 3 (`mermaid-gantt-colon-trap`) は `tags: ["TypeScript", "設計パターン", "舞台裏"]` の 3 件で **6 件全件が tags 複数件**であり、「0 件の tags を持つ記事」の代表がそもそも入っていない。この網羅性も再検証が必要。

**重要（強く推奨）**: 3 件

- **重要-1: D4「透明 Panel」の実装手段が「Panel コンポーネント新規バリアント追加 or CSS Module で打ち消し」の 2 択を builder 判断に丸投げしており、設計判断を AP-WF03 名目で先送りしている**
  - 該当: T7 L115「実装手段は (i) `Panel` コンポーネントの新規バリアント `variant="transparent"` を追加し本文に適用、または (ii) `Panel` をそのまま使い CSS Module 側で背景・境界線を打ち消す のいずれかを builder 判断で選択（AP-WF03 線引き）」。
  - 問題: 本 reviewer が `src/components/Panel/index.tsx` を読んだ結果、Panel コンポーネントは現状 `as` / `children` / `className` の 3 プロパティのみで **variant プロパティを持たない**。「新規バリアント追加」は Panel コンポーネントの公開 API 変更であり、これは PM の設計判断であって builder 判断ではない。一方 (ii) の「CSS Module 側で `background: transparent; border: none` で打ち消す」は DESIGN.md §1「Panel に収まる」の意味を表面上満たすが、CSS で打ち消すことで実質的に Panel 表現を消去している（透明 Panel と「Panel なし」の境界が CSS の打ち消しコードでしか担保されない）。検討した他の選択肢 ③ 採用案 (b) で planner が選んだのは「Panel コンポーネントの **表現バリアント** で本文の読み物性を確保」であり、これは (i) を採るのが採用案 (b) の論理的帰結。
  - 影響: AP-WF03 の射程線引きを誤用しており、Phase 7/8 でも再利用可能な「透明 Panel」バリアントの API を **planner が決めずに builder に投げている**。Panel コンポーネントの API は他 Phase 全体に波及するため、AP-WF03 の「具体実装は builder」の射程を超える。完了基準 L395「本文 `<article>` が『透明 Panel』として収まり、DESIGN.md §1 の表現を満たしている」は (i) と (ii) どちらでも形式的には pass するが、(ii) の場合「DESIGN.md §1 を CSS で打ち消した実装」となり §1 解釈論的に弱い。
  - 推奨: T3 D4 で「(i) Panel コンポーネントに `variant="transparent"` を追加（`Panel.module.css` に `.transparent { background: transparent; border: none; }` を追加し、index.tsx で props 受け取り）」を**計画書で確定**する。(ii) は却下理由（CSS で打ち消す実装は「Panel に収まる」表現を CSS の打ち消しコードでしか担保しないため §1 解釈論的に弱い）と併記。これにより Phase 7/8 でも `variant="transparent"` が再利用可能になる。

- **重要-2: D5 PlayRecommendBlock の `old-globals.css` 新トークン定義状況の確認が「実装段階で builder 判断」に投げられている**
  - 該当: 検討した他の選択肢 ④ L211「実装段階で `old-globals.css` の新トークン定義状況を確認のうえ最適手段を選択（builder 判断、T6 内で決定）」、R4 L304-305 同様。
  - 問題: 本 reviewer が `grep "--fg\|--accent\|--bg-soft\|--border\|--success" /mnt/data/yolo-web/src/app/old-globals.css` 相当を確認した範囲では、`old-globals.css` には `--color-*` 系トークンのみが定義され、`--fg / --accent / --bg-soft / --border / --success` 等の新トークンは **定義されていない**。したがって D5 で `PlayRecommendBlock.module.css` を新トークンに置換すると、`(legacy)/dictionary/[slug]/` 経由で参照される際に **新トークンが解決不能になり視覚崩れする**ことが事前確定している。「builder 判断で実装段階で確認」ではなく、**計画書で対策を確定**すべき。
  - 影響: AP-P16 / AP-WF03 の射程線引きが甘い。「新トークンを old-globals.css に一時複製」or「`var(--fg, var(--color-text))` の fallback」の 2 案は、計画段階で複製案 / fallback 案のどちらを採るかを判断可能（複製案は Phase 10.2 削除の手間が増える / fallback 案はコードが冗長になる）であり、AP-P17 の複数案列挙対象。
  - 推奨: D5 で fallback 案（`var(--fg, var(--color-text))` 等のフォールバック構文）を **計画書で確定**する。fallback 案は (a) `old-globals.css` を本サイクルで触らない、(b) Phase 10.2 で fallback 構文を整理すれば自然に削除できる、(c) 視覚崩れの可能性が両ケース対応で最小、の 3 点で複製案より優位。確定後、T6 の置換規則に fallback 構文を明示。

- **重要-3: 「混在期間中の関連記事クリックで legacy 側へ遷移するケース」の確認が計画書にない**
  - 該当: 計画書全体に「ブログ詳細から関連記事をクリックして他ページに遷移したとき、遷移先がまだ legacy 側 (= 例えば legacy 側 `/blog/category/[category]` または legacy 側 `/dictionary/[slug]`) の場合の挙動」が記載されていない。
  - 問題: Phase 6 完了後の状態は「ブログ詳細 = `(new)/`、ブログ一覧 / カテゴリ / タグ = `(new)/` (cycle-183 完了)、ツール詳細 / dictionary 詳細 = `(legacy)/` (Phase 7/8 未着手)」となる。本サイクル T7 の関連記事グリッドは BlogCard 再利用（検討した他の選択肢 ⑧ 採用案 Z）であり、ブログ→ブログ遷移は (new)→(new) で問題ないが、**PlayRecommendBlock 経由でツール / dictionary 側に遷移すると (new)→(legacy) のクロス遷移が発生**する。このとき「新デザインを見ていた来訪者が突然旧デザインに戻る」体験になることが計画書で意識されておらず、T12 機能動作確認 L158 では「legacy 側 dictionary 詳細での視覚崩れがないこと」の確認はあるものの、「クロス遷移時の視覚断絶」は観察ポイントにない。
  - 影響: M-α「同じサイトを読み続けている連続性」の毀損可能性。Phase 6 単体の完了基準には抵触しないが、本サイクルの目的（L26-32）の M-α / M-γ 価値の観点で見落としがある。
  - 推奨: T11 視覚検証に「PlayRecommendBlock から legacy 側ツール / dictionary 詳細へ遷移したときの視覚断絶の度合いを観察し、許容可能なら記録、不可なら別 backlog 化」を追加する。または R10 として「混在期間中のクロス遷移時の視覚断絶」をリスク欄に新規追加し、Phase 7/8 完了までの暫定状態として明示的にトラックする。

**改善提案（任意）**: 2 件

- **S5: 代表 6 記事のカテゴリ分散の事実が不正確** — T1pre L51 で「記事 1=AI 日記、記事 2=サイト構築、記事 3=Mermaid/コード、記事 4=Markdown/サイト機能、記事 5=AI ワークフロー、記事 6=コンテンツ信頼性 のように 6 軸でカテゴリ分散」と書かれているが、本 reviewer が各記事のフロントマターを確認したところ、**実際の `category:` フィールドは記事 3 = `dev-notes` / 記事 4 = `dev-notes` で重複**している。「6 軸分散」ではなく実質 5 軸（site-updates / dev-notes ×2 / ai-workflow ×2 / その他）。M-α/M-β/M-γ の網羅性自体は損なわれないが、計画書の事実記述として正確性を改善すべき。
- **S6: 完了基準への R9 追加項目が漏れている** — R9（`(new)/layout.tsx` 副作用）の確認が T2 / T11 に手順として追加されているが、完了基準 L381-396 には「short article の Footer 位置 / main 中央寄せ確認」に対応する明示項目がない。完了基準は機械的判定可能であるため、「短文記事 (記事 1) で main 中央寄せと Footer 浮きなしを T11 で確認した記録が `./tmp/cycle-187/` に存在する」を 1 項目追加すると追跡可能性が上がる。

**問題なし項目**:

- **観点 2（D4 透明 Panel の DESIGN.md §1 適合性）**: 本 reviewer が DESIGN.md L7-8（「すべてのコンテンツはパネルに収まった形で提供される」）と検討した他の選択肢 ③ 採用案 (b) L198-200 を並べ読み。採用案 (b) は「Panel の表現バリアント」として §1 文言を維持する案で、§1 改訂を伴わず文言整合性は成立。ただし重要-1 で指摘の通り、API レベルの実装方針確定は別途必要。
- **観点 3（D2 `--font-mono` の globals.css 追加が DESIGN.md §3 と矛盾しないか）**: DESIGN.md L53「フォントはブラウザのシステムフォントを使う」を Read。`--font-mono` の値 `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` は **すべて OS 標準/ブラウザ標準等幅フォント**であり、§3 のシステムフォント方針と矛盾しない。さらに §3 は「本文用フォント」の規定であり、コードブロック等幅フォントは別物として運用可能（D2 L77 で planner も同様に整理）。命名規則は `--font-mono` で既存トークン体系（`--font-*` 接頭辞）と整合。
- **観点 4（6 slug 選定の網羅性、Critical-1 を除く 5 軸）**: 本 reviewer が 6 ファイルすべての存在を `ls /mnt/data/yolo-web/src/blog/content/` で確認、frontmatter サンプリングで以下を確認:
  - TrustLevelBadge: 記事 6 `content-trust-levels` の frontmatter で `tags` に「UI改善」「サイト運営」「新機能」を含み記事題材自体が信頼レベル機能のため `trustLevel` 明示が確実。
  - シリーズ: 記事 5 の frontmatter で `series: "ai-agent-ops"` + `series_order: 7` を確認。
  - Mermaid: 記事 3 の題材自体が Mermaid であり、`tags: ["TypeScript", "設計パターン", "舞台裏"]`。
  - GFM Alert: 記事 4 の題材自体が GFM Alert 実装記事。
  - 短文 / 長文: 記事 1 = 110 行 / 記事 2 = 最初期記事として妥当。
- **観点 5（アンチパターン抵触チェックの更新）**: 計画書 AP 抵触チェック L329-376 を Read。AP-I07 / I08 / I09 / I08 別側面 / P16 / WF12 / WF03 / WF04 / WF05 / WF07 / WF11 / P17 の各項目について D1〜D7 変更後も実質判定済み（C1 / C2 / I5 で発火した分も補強済み）。ただし重要-1 / 2 / Critical-1 で指摘の通り、**AP-WF03 線引きと AP-P16 実体確認が一部漏れ**ているため本観点も部分的に問題あり。
- **観点 6（来訪者価値 M-α / M-β / M-γ）**: 計画書 L26-32 の各ターゲット価値が D2 / D4 変更後も維持。D2 の globals.css 追加は M-β「コード可読性」を Phase 7/8 でも一貫させる方向で改善、D4 透明 Panel は M-α「読み物没入感」を維持。M-γ「試行錯誤の連続性」は重要-3（クロス遷移視覚断絶）でやや影響あり。
- **観点 7（`(new)/blog/category/[category]` 等からのパンくず流入動線）**: T7 L118「パンくず: 新 Breadcrumb の標準余白で」、T12 L153「Breadcrumb JSON-LD」、T11 L143「DOM チェック: 旧コンポーネント由来ハッシュが一切出ないこと」で動線維持が担保。`(new)/blog/category/[category]` は cycle-183 で移行済みであり、`<Breadcrumb>` の表示形式は新版で統一されているため、流入時のパンくず動線は新→新で連続する。
- **観点 8（`(new)/layout.tsx` 配下の Header / Footer がブログ詳細 `<article>` レイアウトと相性）**: 本 reviewer が `/mnt/data/yolo-web/src/app/(new)/layout.tsx` を Read（55 行）。`<main style={{ flex: 1 }}>` の中に `<div className={styles.container}>` を入れる構造は cycle-181〜185 で確立済み。ブログ詳細特有の `<article>` レイアウトは本サイクル T7 で D4 透明 Panel + 720px 行幅で再設計するため、I5 で T2 / T11 に確認手順を追加した観点で実質的に担保されている（重要-1 の Panel API 確定が前提）。

---

**判定根拠**:

- Critical-1（`linkableTags` の実体不存在）は **AP-P16 / AP-WF12 への再抵触**であり、r1 で C1（`--max-width: 1200px` 誤認）と同じパターンの「frontmatter / ファイル実体を確認していない断定」が再発している。修正対応コストは小さいが、本質的に r1 と同じ失敗の再発であるため Critical 扱い。
- 重要-1 / 2 / 3 はいずれも「計画段階で確定すべき設計判断を builder / execution に持ち越している」または「Phase 6 の射程外と判定されているが M-α / M-γ 価値に影響する観点」であり、Phase 6 = ブログ詳細移行の本質的成果に直接影響する。
- 改善提案 S5 / S6 は事実記述の精度 / 完了基準のトレーサビリティ改善で、Critical / 重要ではない。

判断基準（Critical 1 件 + 重要 3 件）に従い、「**改善指示**」とする。

**PM への指示**:

1. Critical-1 / 重要-1 / 重要-2 / 重要-3 を計画書に反映するため planner を起動する。改善提案 S5 / S6 も合わせて反映する。
2. 反映後、もう一度本レビュアー（r3）に再レビューを依頼する。r3 では前回指摘事項だけでなく**全体の見直し**を含める（r1 / r2 で見落としの可能性を考慮、特に planner が新規追加した記述・確定項目の事実精度を改めて検証）。
3. レビューの省略は認められない。

---

### r1 レビュー（2026-05-11）

**総合判定**: 改善指示（不承認 — Critical 2 件あり）

**Critical（必修正）**: 2 件

- **C1: D1 の「旧 `--max-width: 1200px` 相当」記述が事実誤認**
  - 該当: 計画書 L53「`--max-width` の置換先 — 旧体系の `--max-width: 1200px` 相当を、本文（プロース）は **720px** … 広幅エリアは **1200px** の二段構成にする」
  - 実体: `src/app/old-globals.css` L28 に `--max-width: 960px;` と定義されている（grep で確認）。旧詳細ページの実際のコンテナ幅は **1200px ではなく 960px**。
  - 影響: D1 の根拠が誤った前提に立っており、AP-P16 / AP-WF12（事実情報の実体確認）に抵触。「広幅エリア 1200px」という新値は旧 960px から **約 1.25 倍に拡幅** することになり、移行前後の「同等以上」判定（T1/T11）にズレる。さらに、現行ブログ詳細はそもそも「本文と広幅の二段構成」を持たない単一 max-width 960px であり、「二段構成にする」というのは re-design 判断であって「旧体系相当に置換」ではない。判断としての妥当性自体は M-α/M-β 双方の読みやすさを考えれば許容可能だが、計画書が「旧 1200px 相当」と誤った事実を根拠にしている構造は AP-WF12 そのもの。
  - 必修正: D1 の前提記述を「旧 `--max-width: 960px` から、新デザインでは DESIGN.md §4 に従い本文 720px / 画像・コード・Mermaid 等の広幅要素 1200px の二段構成に**再設計**する（旧 960px からの拡幅を含む変更であることを明示）」に書き換える。さらに「広幅 1200px に拡幅したとき、コード横スクロールの可読性・図の比率・モバイルへの影響」が「同等以上」の評価軸でどう判定されるか（T11 視覚検証の観察ポイント）を明記すること。

- **C2: ShareButtons 新版 module.css の現状トークン未確認のまま「差し替えで解消」断言**
  - 該当: 計画書 T5 で `@/components/common/ShareButtons` → `@/components/ShareButtons` への差し替えを行うとし、survey L78 が「新版は `--success` を使用」と記述。しかし計画書 T2 の前提条件確認手順には `src/components/ShareButtons/*.module.css` 内のトークン状態を確認する項目が **入っていない**。
  - 実体: `src/components/common/ShareButtons.module.css` は `--color-success` 使用（grep で確認、L51）。`old-globals.css` には `--color-success` 定義あり（L11）。新版が本当に `--success`（新体系）のみを使っていることは確認していない。仮に新版が旧トークンを 1 つでも残しているなら、(new)/ 配下では未定義となり「コピー」ボタンの成功表示が壊れる。
  - 影響: AP-WF12（事実情報の実体確認）。T12 の「シェアボタン GA4 `share` イベント発火」は確認するが、「コピー成功時の `--color-success` 視覚表示が破綻していないか」は確認手順に含まれていないため、視覚崩れが production まで漏れる可能性がある。
  - 必修正: T2 に「`src/components/ShareButtons/index.module.css`（または該当 module）/ `src/components/Breadcrumb/index.module.css` を Read し、旧トークン残存ゼロを確認」を追加し、残存があれば T6 の 6 ファイルリストに加える。あわせて T12 の機能動作確認に「コピー成功時の `--success` 表示視認」を追記。

**重要（強く推奨）**: 6 件

- **I1: D4 が DESIGN.md §1「すべてのコンテンツはパネル」と矛盾する判断であり、矛盾解消ロジックが弱い**
  - 該当: 計画書 L56「記事本文 `<article>` 自体は Panel で囲まない」+ L154-160 の判断理由。
  - 問題: DESIGN.md §1 は「すべてのコンテンツはパネルに収まった形で提供される」と明言している。D4 の判断（本文 Panel なし）は §1 の例外を作る決定であり、明文化された §1 を逸脱する判断は **AP-I08（DESIGN.md 未定義表現の追加）の逆方向 = DESIGN.md 明文ルールを満たさない実装**に当たる。判断理由 ③ で「読み物の没入を阻害する境界線を最小化」と説明しているが、これは DESIGN.md §1 を上書きする判断であり、本来は DESIGN.md §1 側に「ただし本文の長文プロースは Panel に収めない」例外を加筆する手続が必要。
  - 推奨: ①(a) DESIGN.md §1 を本サイクル内で改訂し「本文プロースは 720px の行幅制約により単独で章立てが成立するため Panel 例外とする」と明文化したうえで採用 / ①(b) 本文も透明 Panel（`border: none; background: transparent;` の Panel）として収め §1 表現ルールを破らない / ①(c) 「本文 + メタ情報 + シェア」を 1 つの大 Panel に収め、TOC / 関連記事 / シリーズナビ / 前後ナビ / PlayRecommendBlock を別 Panel にする（DESIGN.md §4「入れ子にしない」に抵触しない構造）の 3 案を **AP-P17 に沿って計画書に列挙**して採否を再判断する。現状 ③ の「却下案 A / B + 採用案 C」の比較は §1 適合性を観点に含めていないため、観点不足。

- **I2: D2「`--font-mono` を CSS Module 内に直値展開」が DRY とプロジェクト一貫性を犠牲にしている**
  - 該当: 計画書 L54、ファイル 6 件のうち少なくとも `page.module.css` で展開予定。
  - 問題: `--font-mono` プロジェクト全体導入を別 backlog 化する判断は理解できるが、**今後のツール・遊び詳細（Phase 7）でもコードブロック / 等幅表示は確実に必要になる**（survey で `src/play/quiz/_components/QuestionCard.module.css` 等が既に存在）。Phase 6 で直値展開すると、後続 Phase 7/8 でも同様の直値展開が量産され、最終的に `globals.css` 側で `--font-mono` を新規定義する判断をしたとき広範囲の戻し作業が発生する。「Phase 6 を逸脱しない」というスコープ規律と「Phase 全体での DRY」を秤にかけたとき、`globals.css` への 1 行追加（`--font-mono: ui-monospace, ...`）は AP-WF03 の射程線引きでも PM 責務の範囲内（DESIGN.md トークン追加 = 設計判断）であり、CLAUDE.md L9「better UX option is achievable, it must be chosen」の判断軸でも全体最適に倒す方が合理的。
  - 推奨: D2 を「`globals.css` に `--font-mono` を 1 行追加し、CSS Module 側は `var(--font-mono)` のまま」に倒すか、現状案を維持する場合は「Phase 7/8 で同じ直値展開を繰り返す合計コスト見積もり」を計画書に書き、それでも直値展開を採る理由を明示する。

- **I3: `__tests__/page.test.tsx` の `fs.readFileSync` ベース構造順テストが「移行 + 構造再設計」の両立で壊れるリスクの想定が浅い**
  - 該当: 計画書 T10「配置順テスト（PlayRecommendBlock が `</article>` 後 / postNav 後 / RelatedArticles が `</article>` 前）は T7 で構造を維持していれば pass する」、R6。
  - 問題: page.test.tsx は `source.indexOf("className={styles.postNav}")` のように **CSS Module スタイル名の literal** で検索している（実体確認済み、L82-83）。T7 の再設計で例えば `postNav` を `Panel` で包んで `styles.postNav` の代わりに `<Panel className={styles.postNav}>` のような構造になったり、もしくはクラス名を `postNavPanel` 等に変えた場合、テストは pass しなくなる。「構造を維持すれば pass」は文面上正しいが、新デザイン適用で命名やラップ構造が変わる可能性を計画書が考慮していない。
  - 推奨: T10 に「テスト内の検索キー（`className={styles.postNav}` 等）を T7 の再設計後の構造と並べ読みし、必要ならテストの検索キーを更新する」を明示。テスト自体が「ソース文字列パターン依存」というアンチパターン気味の構造を持つため、**機会があれば Playwright での DOM 順序検証へ置換する**選択肢も「### 検討した他の選択肢」に追記（採用しないなら理由を明記）すべき。

- **I4: 100+ 記事 SSG の build 時間影響の見積もりが欠落**
  - 該当: なし（計画書全体に build パフォーマンス言及なし）。記事 60 件 + OGP/Twitter 画像 60 件 × 2 = 180 ルート + Mermaid 11 記事の build パスが既存。
  - 問題: 「100+ 記事の generateStaticParams が build time にどう影響するか」はレビュー観点 R5 で挙げられているが、計画書の R1〜R7 ではカバーされていない。本サイクルは構造変更を含むため `next build` の所要時間が大きく増えるなら、ローカル開発の `npm run build` で完了基準を満たす時間内に build を回せるかが事前見積もりとして必要。
  - 推奨: R8「build パフォーマンス」をリスク欄に追加し、「現状 build に X 分。本サイクル変更で同等を維持することを T14 で確認」を組み込む。少なくとも T14 で `time npm run build` の所要時間を before/after で記録する手順を追加。

- **I5: `(new)/layout.tsx` 下に置くことによる副作用検証が「ThemeProvider のみ」に絞られている**
  - 該当: R5「`useTheme` は `(new)/layout.tsx` の `ThemeProvider` 経由で動くため survey 通り問題なし想定」、計画書 T11 の DOM ハッシュチェック。
  - 問題: `(new)/layout.tsx` は ThemeProvider 以外にも `AchievementProvider`（StreakBadge）、`GoogleAnalytics`（旧 `@/components/common/GoogleAnalytics` を継続参照）、`Footer`、`Header`（actions スロット）、`<body style>`（AP-I07 関連の `display: flex; flex-direction: column; min-height: 100vh`）を持つ。ブログ詳細は旧構造で「container max-width 960px + margin: 0 auto」だけで中央寄せしていたが、新 layout の `display: flex; flex-direction: column` 下で `<div className={styles.container}>` がどう振る舞うかは未検証。`min-height: 100vh` + `main { flex: 1 }` のもとで記事末尾 Footer が画面下に固定される現象（一覧側で発生したものと同型）に注意。
  - 推奨: T2 に「`(new)/layout.tsx` の構造（body style / main flex / providers）を Read し、ブログ詳細を入れたときに `<main>` の `flex: 1` 環境下で `.container { margin: 0 auto }` が中央寄せされるか、`min-height: 100vh` の文脈で短文記事のレイアウトが破綻しないかを T11 視覚検証で確認」を明示。AP-I07 の確認が「`(new)/layout.tsx` を変更しない」までで止まっている点を補強。

- **I6: 「代表 6 記事の選定」が execution 時の T2 結果に依存するため、reviewer が r1 段階で網羅性を判定できない**
  - 該当: 計画書 L41「代表記事の選定基準は『### 検証戦略』に明記」、L190「選定確定後、cycle-187.md に slug を記載する」。
  - 問題: 「短文 / 長文 / Mermaid / GFM Alert / シリーズ属 / 関連記事複数」の 6 軸は妥当だが、これらが **互いに独立した 6 記事になるか、重複する記事を含むか** は execution に投げられている。例えば「長文 + Mermaid + シリーズ属」の 1 記事で 3 軸を兼ねた場合、撮影枚数は減るが、別の軸（短文 / GFM Alert 多用 / 関連記事複数）の代表が増えない結果になる。さらに「TagList が表示されている記事 / 撤去判定の TrustLevelBadge が現在表示されている記事」のような **撤去前後比較に必要な軸** が選定基準に入っていない。
  - 推奨: 選定基準に「TrustLevelBadge が現状表示されていた記事を 1 件以上含む」「TagList の `linkableTags` が 1 つ以上 / 0 件の両方を含む」「カテゴリリンクの表示崩れ確認のため複数カテゴリにまたがる」を追加。execution の T1 着手前に **PM が slug 6 件を確定して計画書に書き込む**手順を T1 の前段に挿入する（kickoff 撮影とセットで PM が決める）。

**改善提案（任意）**: 4 件

- **S1: T8（MobileToc.test.tsx 保持判断）の根拠強化** — 「ファイル名が誤解を招くが実体価値はある」という判断は妥当だが、test ファイル名のリネーム（`MobileTocIntegration.test.tsx` 等）を別 backlog 起票として明記すると、後続サイクルで「孤立テストか」と再度迷う時間を削れる。

- **S2: D7（TagList 現状維持）に「`linkableTags` フィルタの新デザイン下での視覚整合」観点を追加** — トークン置換のみで移行するため見た目はほぼ変わらないが、新 Panel 体系下で TagList が `<header>` 直下に配置されると Panel の境界線とタグの距離感が変わる。視覚検証 T11 で見落とさないよう、「TagList が記事 header 直下で空気感を壊さないか」を観察ポイントに明示。

- **S3: 60 記事中の 60 件全件 SSG ビルドが succeed することの確認手順** — 計画書の T14 `npm run build` で SSG 失敗は検出されるが、「`generateStaticParams` が 60 件返したか」をログから確認する明示手順を入れると安全性が上がる（cycle-185 の OGP 画像 SSG 失敗事故の予防）。

- **S4: 「### 検討した他の選択肢」に「(new) BlogCard と本文の視覚連続性をどう扱うか」を 1 案として追加** — survey L274-276 で「トップは BlogCard を流用しない方針（X10）が採られ、詳細は一覧との視覚連続性を独自に設計してよい」と明記されているが、計画書はこの自由度を活用しているか不明。本文 Panel 有無（D4 / I1）と関連して、一覧 BlogCard と詳細の視覚連続性の方針判断を「### 検討した他の選択肢」⑧ として追加すべき。

**問題なし項目**:

- **観点 2（既存機能棚卸しの網羅性）**: survey の機能リスト（Article JSON-LD / Breadcrumb JSON-LD / 目次 / シェア / 関連記事 / シリーズナビ / パンくず / 公開日・更新日・読了時間 / TrustLevelBadge 撤去 / コードブロック / Mermaid / GFM Alert / PlayRecommendBlock / 前後ナビ / OGP/Twitter 画像 / 60 記事 SSG / `__tests__/page.test.tsx` / MobileToc.test.tsx 孤立）が、計画書 L32 / T1〜T15 / 完了基準 L296-304 / 検証戦略 / R1〜R7 のいずれかに紐づくことを並べ読み確認。漏れなし。

- **観点 3 のうち D3 / D5 / D6 / D7**: D3 = スクロール連動 TOC 未実装維持は、現状から劣化させない判断であり、M-β/M-γ の長文読み体験は line-height 1.7 と sticky TOC で代替可能（現状でも未実装で運用済み）。D5 = PlayRecommendBlock 置換 + legacy dictionary の fallback 案（`var(--fg, var(--color-text))` または old-globals への一時複製）は builder 段階で実装手段を選ぶ余地を残しており AP-WF03 適合。D6 = シンタックスハイライト見送りは AP-I03 / Phase 6 完了基準逸脱の双方を回避する妥当判断、M-β の dislikes に対しては「背景 / ボーダー / 横スクロール / 等幅フォント / 行高」で読みやすさ最低限を確保。D7 = B-391 結果を予断しない判断として妥当。

- **観点 4 のうち ①②③④⑤⑥⑦**: AP-P17 に従い 7 つの判断ポイントで複数案列挙 + 却下理由・採用理由を併記している。観点 4 の漏れ候補としては S4（一覧 BlogCard との視覚連続性）と I1（DESIGN.md §1 適合 3 案）を追加すべきだが、列挙構造自体は AP-P17 適合。

- **観点 6（アンチパターン抵触チェックの実質性）**: AP-I07 / I08 / I09 / I08 別側面 / AP-P16 / AP-WF12 / AP-WF03 / AP-WF04 / AP-WF05 / AP-WF07 / AP-WF11 / AP-P17 の各項目に対し、本計画の具体的な該当箇所と非抵触理由が個別に書かれている（L247-289）。形式的引用ではなく実質的にチェックされていると判断。ただし C1 / C2 / I5 で指摘の通り、AP-WF12 / AP-P16 の発火が一部漏れている（旧 `--max-width: 1200px` 誤認、新版コンポーネントの module.css 未確認、(new)/layout.tsx 副作用未確認）ため、本観点も部分的に問題あり。

- **観点 7（作業内容の粒度と並列性）**: T1〜T15 の粒度は builder にとって作業可能。`[P]/[S]` 判定は妥当（T5 と T9 は同一 page.tsx 直列の指示が AP-WF07 として明記、T6 の CSS 6 ファイルは別ファイル並列可で正しい）。

- **観点 8（完了基準のテスト可能性）**: L295-304 の 10 項目は機械的に判定可能（grep 残存ゼロ / SSG 60 件生成 / 24 枚スクショ保存 / `npm run *` all green / OGP 200 + 1200×630 / 4 列テーブル存在）。「reviewer が『同等以上』と判定している」は主観依存だが、これは UI 移行レビューの本質的性質であり許容範囲。

- **観点 9（AP-WF15 同/別サイクル判断）**: スクロール連動 TOC（D3 → 別 backlog）/ シンタックスハイライト（D6 → 別 backlog）/ frontmatter `trustLevel` フィールド削除（T9 → B-337 Phase 10.2）/ B-391 TagList 撤去（D7 → 待ち）/ `--font-mono` プロジェクト全体導入（D2 → 別 backlog、ただし I2 で再検討推奨）/ Header 検索 44px は本サイクル無関係。境界線は「来訪者影響 + Phase 6 完了基準への適合」で一貫しており、思いつき分割ではない。

- **観点 10（ターゲットユーザー価値）**: M-α「整いすぎ」→ D4 の本文 Panel なし + line-height 1.7 + 720px 行幅で「読み物の没入」を担保（I1 で §1 適合性の再判断は必要だが、ターゲット価値の方向性自体は正しい）。M-β「自分のプロジェクトに取り入れたい」→ T7 のコードブロック設計（背景 / 等幅 / 横スクロール）で最低限の可読性確保、シンタックスハイライトは D6 の判断で次サイクル送り。M-γ「試行錯誤の連続性」→ シリーズナビ / 関連記事 / Mermaid のダーク/ライト対応 (R5 / T12) が個別に担保されており、3 ターゲットそれぞれに具体作業が紐づく。

---

**PM への指示**:

1. Critical 2 件は計画再立案レベル（D1 の事実誤認、ShareButtons 新版 module.css の未確認）のため、計画レビュー段階で確実に修正すること。planner を起動し、C1 / C2 / I1〜I6 / S1〜S4 を計画書に反映させる。
2. 反映後、もう一度本レビュアーに r2 レビューを依頼すること。r2 では前回指摘事項だけでなく **全体の見直し** も含める（前回見落としの可能性を考慮）。
3. レビューの省略は認められない。

## キャリーオーバー

<このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

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

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
