---
id: 254
description: デザイン移行 Phase 8.2 の第二弾として、最も見られている旅程の終点である「クイズのインライン結果本文」を (new)/ デザインへゼロベースで本格再設計する。cycle-253 で枠（ResultCard）まで新化済みのインライン結果の中身——variant 別結果本文8本（*Content.tsx + *.module.css）と OtherTypesNav に残る絵文字・派手な type-color 罫線・中央寄せ・旧トークンを、ResultCard の新デザイン言語へ genuine に統一する。検索着地の主経路（プレイ画面内で完結するインライン結果。静的結果ページURLへの流入は実測7PV/28日と僅少）の質感断裂を本質的に解消する。
started_at: "2026-06-20T08:16:23+0900"
completed_at: "2026-06-20T11:15:01+09:00"
---

# サイクル-254

このサイクルでは、デザイン移行計画 **Phase 8.2（遊び群の (new)/ デザイン移行）の第二弾**として、**クイズのインライン結果本文**を新デザインへ**ゼロベースで本格再設計**する。cycle-253 で枠（`ResultCard`）まで新化したインライン結果の、その中に描画される **variant 別結果本文8本（`*Content.tsx`）と `OtherTypesNav`** を genuine に新デザイン化し、検索着地の主経路の終点に残る質感断裂を解消する。

## なぜやるか（来訪者の所在）

検索から `/play/character-personality`(62PV/28日) 等に直接着地した来訪者は、12問に答えると **プレイ画面の中でそのままインライン結果を見る**。GA4 実測（プロパティ 524708437・2026-05-23〜06-19）では、静的結果ページURL（`/play/<slug>/result/...`）への流入は全クイズ合計でも **7PV**——プレイ画面合計 152PV の 4.6% にすぎず、性格診断系（character/word-sense/yoji/music）の結果ページURLはほぼゼロ。つまり**来訪者は結果URLに遷移せず、プレイ画面内のインライン結果で完結している**。最も多くの人が目にする結果体験はインライン結果である。

cycle-253 でインライン結果の**枠**（`ResultCard`）は新化した（左寄せ・新トークン・絵文字なし・共通アクセント）。しかしその中に dynamic import される **variant 別結果本文（`CharacterPersonalityContent` 等8本の `*Content.tsx`）と `OtherTypesNav`** は旧デザインのまま残っている——`🎭✨😅💡` の絵文字マーカー、`--type-color` を注入した派手な赤・マゼンタ系の色付き左罫線見出し、`text-align: center`、`font-weight: 700`、旧トークン（`--color-text`/`--color-border`/`--color-bg-secondary`）。流入最上位 character-personality(62PV) はまさにこの旧質感の本文を持つ。

これは cycle-253 が解消しようとした断裂の**残り**で、しかも最も見られている旅程の**終点**に位置する。プレイ画面（新）→ 設問（新）→ 結果カードの枠（新）→ **結果本文（旧）** と、最後の最後で質感が割れる。ここを直すのが最もレバレッジが高い。

## 実施する作業

- [x] 視覚的グラウンディング：移行済みプレイルート上で主要クイズ（character-personality / traditional-color / animal-personality）を実機で12問完答させ、インライン結果の「新化済みの枠（ResultCard chrome）」と「旧質感の本文（\*Content）」の境界を実機スクショで観察・言語化（`tmp/grounding-*-w360-{light,dark}-*.png`）
- [x] 新化の共通方針シートを作成（`tmp/content-newdesign-spec.md`）：ResultCard 言語への変換指針、AP-P28 回避基準、color-as-content 例外条項を明文化
- [x] 参照実装の確立：流入最上位 `CharacterPersonalityContent`（.tsx + .module.css）を builder が genuine 新化 → reviewer 承認（7本展開の基準として確定）
- [x] 残り7本の `*Content`（Animal / Contrarian / ImpossibleAdvice / Music / TraditionalColor / UnexpectedCompatibility / YojiPersonality）を参照実装基準で genuine 新化（バッチ1: 4並列＋バッチ2: 4並列）
- [x] `OtherTypesNav.module.css` / `.tsx` を新化（中央寄せ撤去・絵文字描画除去・現在タイプを `--accent` 枠＋`--accent-soft` 面へ）
- [x] **pill→grid の統一**：page.tsx caller の `"pill"` 値を内部で grid にマップ。最終レビューで ResultCard インライン経路の 5 variant が grid に倒れていた不整合（質感断裂）が発覚し、ResultCard caller を全 8 variant 縦リスト統一に修正（reviewer ブロッカー対応）
- [x] 実機の視覚確認：8 variant のインライン結果と静的結果ページを w360 light/dark で撮影し、新デザイン世界観への genuine 到達、絵文字撤去、色飛びなしを評価（`tmp/ref-*-after-*.png`）
- [x] 退行確認：本文を共有する静的結果ページ（`(legacy)/play/<slug>/result/[resultId]`）が破綻していないことを実機確認（過渡的整合：新本文が旧枠の中に出る状態が「壊れておらず、むしろ改善」）
- [x] テスト調整（pill→grid 追従・絵文字除去・layout 排他 assert 追加。安易な skip なし。5586→5588 件 pass）
- [x] レビュー依頼と指摘対応（参照実装承認 → 最終一括レビューでブロッカー検出 → 修正 → 再レビュー承認）
- [x] backlog.md 更新（B-522 partial 完了、B-523/B-524 を Queued 追加）

## 作業計画

### 目的

最も見られている結果体験であるインライン結果の本文（variant 別 `*Content` 8本＋`OtherTypesNav`）を、cycle-253 で確立した `ResultCard` の新デザイン言語へ genuine に統一する。検索着地〜結果表示の旅程の終点に残る質感断裂を解消し、後続の静的結果ページ群・ゲーム・daily 移行の基準となる「結果本文の新化参照実装」を確立する。

### アーキテクチャ上の前提（調査で確定）

- インライン結果は `QuizContainer` → `ResultCard`（cycle-253 で新化済み・左寄せ/新トークン/絵文字なし/共通アクセント）→ その中に dynamic import される variant 別 `*Content.tsx`。`*Content` は `src/play/quiz/_components/` に8本（Animal / Character / Contrarian / ImpossibleAdvice / Music / TraditionalColor / UnexpectedCompatibility / YojiPersonality）。
- これら `*Content.tsx` は **インライン結果（`ResultCard` 経由）と静的結果ページ（`(legacy)/play/<slug>/result/[resultId]/page.tsx`）の両方から共有**される。`*Content.module.css` を新化すると静的ページ側にも反映される。静的ページの枠（`ResultPageShell`）はまだ旧質感（中央寄せ）→ **新本文が旧枠の中に出る過渡状態**になるが、これは破綻ではなく改善であり、cycle-253 で確立した「過渡的整合」の正当な適用（移行済み側＝インラインは full 新化、未移行 legacy 側＝静的結果ページ枠は後続サイクルで新化）。別実装（インライン用と静的用の二重 CSS）は作らない（AP 回避）。
- 一部 variant（contrarian-fortune の catchphrase/humorMetrics、character-fortune の characterIntro/Message 等）は専用 `*Content` を持たず `ResultCard.module.css` 内の共通 detailedSection スタイルで既に新化済み。本サイクル対象は専用 `*Content` を持つ8本＋`OtherTypesNav` に限る。
- `ResultCard.module.css` には既に新化済みの共通スタイル（detailedHeading＝`--accent` 左罫線、traitsItem＝アクセント縦線マーカー、adviceCard＝`--accent-soft`/`--accent-strong` 等）がある。`*Content` の新化はこの共通言語に寄せ、variant 固有の構造のみ `*Content.module.css` で同じ言語を使って表現する。

### 設計の指針（息抜きの結果を道具箱の世界観に置く）

サイトコンセプト（`docs/site-concept.md`）はコアを「日常の傍にある道具」、クイズ等を「息抜き」と位置づける。結果本文も `ResultCard` と同じ落ち着いた質感の中で、息抜きとしての楽しさを表現する。各タイプの個性は**派手な色**ではなく**言葉（本文）**で立てるのが新デザインの思想（`ResultCard` が `--type-color` を共通 `--accent` に統一したのと同じ）。`DESIGN.md` と `/frontend-design` を一次規範とし、旧 UI の構造を温存せず各局面を新体系で作り直す。具体の設計判断は builder が実機スクショを観察したうえで行う（PM は過度に literal な指示をしない＝AP-WF 回避）が、芯として「ResultCard の新デザイン言語への統一」「絵文字・type-color 装飾の脱却」「ただし traditional-color の色見本は診断内容として保持」を渡す。

### スコープ外（後続サイクルへ・すべて B-522 傘下）

- 静的結果ページ群の (new)/ ルート移行（共通 `[slug]/result` の枠＝`ResultPageShell` 新化、`(legacy)→(new)` 移動、Type C 専用結果8本の `page.tsx`/`opengraph-image.tsx`）。実測流入 7PV/28日と僅少のため、最も見られているインライン結果を本サイクルで先行。
- ゲーム4種・daily の (new)/ 移行（`RelatedGames` 等の絵文字除去同梱）。
- 遊びコンテンツのタイル化方針の決定（B-295/B-493 統合）。
- 過渡的トークン定義（old-globals.css 側）の撤去（Phase 11.2/11.5）。

### 検討した他の選択肢と判断理由

1. **前回キャリーオーバー通り「結果ページ群を一括移行」（共通結果＋Type C 専用8本＋インライン）** — 約60〜70ファイル規模で1サイクルに収まらず「タスクは小さく」に反する。かつ静的結果ページの実測流入は7PV/28日と僅少で、レバレッジが低い面に大きな工数を割く判断になる。却下し、来訪者の所在（インライン結果が主経路）で範囲を切り直した。
2. **流入上位のクイズ（character/traditional-color）の本文だけ新化** — 工数は小さいが、character は新・animal は旧のように**クイズ間で質感が割れ**、回遊時に新たな断裂を生む（cycle-253 が解消した断裂の再生産）。インライン結果という1体験を割らず8本まとめて新化する。各 `*Content` は独立 CSS Module でサブエージェント1本ずつに委譲でき、ルート移動を伴わないため cycle-253 よりリスクは小さい。
3. **静的結果ページの枠（ResultPageShell）も本サイクルで新化** — `*Content` 新化で生じる「新本文 in 旧枠」の過渡状態を即解消できるが、ルート移動（`(legacy)→(new)`）とビルド構造変更を伴い範囲が膨らむ。実測流入が僅少な面であり、過渡状態は破綻ではない（cycle-253 の過渡的整合と同型）ため後続サイクルへ。
4. **新ツール追加等の別系統に着手** — 進行中の移行を放置する cycle-252 の判断ミスの再発。却下。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-253.md`：プレイ画面の本格再設計移行とそのキャリーオーバー（インライン結果に legacy 質感が残存・最重要・次サイクル必須）。
- GA4 実測（プロパティ 524708437・2026-05-23〜2026-06-19）：/play/ PV 上位＝character-personality(62)・word-sense-personality(30)・traditional-color(15)・yoji-level(10)。静的結果ページURLは全クイズ合計7PV（traditional-color 5・character-personality 2、他はゼロ）。インライン結果が主経路であることの裏付け。
- コード調査：`*Content.tsx` 8本の所在、`ResultCard`/静的結果ページ双方からの共有、`ResultCard.module.css`（新化済み共通言語）・`CharacterPersonalityContent.module.css`/`OtherTypesNav.module.css`（旧質感の所在＝絵文字 ::before・type-color 罫線・中央寄せ・旧トークン）を grep/Read で確定。
- `ResultCard.module.css` 冒頭の設計方針コメント（左寄せ・新トークンのみ・bold 不使用・絵文字なし・共通アクセント統一・角丸 2px/8px）を新化の一次基準とする。
- `docs/site-concept.md`：コア「日常の傍にある道具」・クイズ等は「息抜き」。
- `DESIGN.md`・`.claude/skills/frontend-design/SKILL.md`：新デザイン体系の一次規範。
- `docs/knowledge/css-modules.md`（`:global(.dark)` 化）、`docs/anti-patterns/planning.md` AP-P28（工数を理由に本質的作り直しを回避しない）。

#### 外部仕様への依存

本サイクルの判断は外部仕様（SEO 機能・ブラウザ API・Schema.org 仕様・サードパーティプラットフォーム機能）に依存しない。CSS Module のスタイル新化のみで、ルート移動も SEO メタ変更も伴わない。`color-mix()` のブラウザ対応は既存 `@supports` フォールバックを踏襲する。よって一次資料の WebFetch は不要。

## レビュー結果

### 参照実装レビュー（reviewer 承認・基準確立）

最頻出 character-personality（62PV/28日）の本格再設計を builder が完了後、reviewer が DESIGN.md / 方針シート / 実機（Playwright で w360 light/dark）/ ResultCard 言語との地続き性 / caller 互換 / dead code 整理 を点検。

- **総合判定: 承認（7本展開の基準として採用可）**。色だけの上塗りではなく構造ごと作り直し（AP-P28 回避）：CSS `::before` の 🎭 と TSX の `r.icon` 描画を完全撤去。type-color 注入は caller 互換のため受け取りだけ残し装飾では参照しない方針。見出しは ResultCard `detailedHeading` 言語、リストはアクセント縦線マーカー、archetypeBreakdownCard は `--accent-soft`＋`--accent-strong`、characterMessageCard は中立 `--bg-soft` でトーンを使い分け。実機 dark で本文 `rgb(232,232,229)` がダーク面に乗り十分なコントラスト。
- **申し送り**: マーカー有無を各 \*Content の元構造に応じ明示的に揃える／`--type-color` は traditional-color のみ実消費・他は caller 互換で残置。

### 最終一括レビュー（ブロッカー検出 → 修正 → 承認）

8本＋OtherTypesNav の全変更を reviewer が一括点検。

#### 第1回（ブロッカー検出）

- 残7本＋OtherTypesNav は genuine に新デザイン言語へ統一されている（絵文字・旧トークン・独自トークン `--animal-accent-*`/`--music-accent-*`・`font-weight: 700`・`text-align: center`・ハードコード色をすべて撤去。tests も pill→grid 追従＋排他 assert 追加で意図を骨抜きにせず保持）。
- **ブロッカー指摘**: PM の「`*Content` の `"pill"` を内部で grid にマップ」判断は page.tsx caller までしか追っておらず、**`ResultCard.tsx`（インライン caller）でも 5 variant（Music/Yoji/Contrarian/Unexpected/Impossible）に `"pill"` を渡していたため、インラインで Animal/Color/Character は縦リスト、他5本は grid 2列に割れた**。完了基準 #5「8 クイズ間で質感が揃う」に正面から反する。AP-WF（caller 監査の漏れ）。

#### 修正（builder）

- `ResultCard.tsx` の 5 か所を `allTypesLayout="pill"` → `"list"` に変更。
- ContrarianFortune と ImpossibleAdvice は型が `"pill"` 単一だったため、`"list" | "pill"` に拡張し `.allTypesListVertical` クラスを参照実装と同型で追加し、内部マップを `"pill"→allTypesGrid` / `"list"→allTypesListVertical` に。
- テストに排他 assert を追加（`"list"` で vertical が付き grid が付かない／`"pill"` で逆、を両方向で）。

#### 第2回（再レビュー・承認）

- インライン経路で 8 variant 全て `allTypesListVertical` に統一されたことを実機確認（Character / Animal / Yoji / Music / TraditionalColor / Unexpected / Contrarian / Impossible いずれも縦リスト・flex column）。静的結果ページ caller は `"pill"`→grid のまま無変更で動く（実機で contrarian-fortune の grid 2列維持を確認）。
- ContrarianFortune / Impossible の `.allTypesListVertical` は CharacterPersonalityContent 169-202 行と完全同型（flex column / gap 0.5rem / 透明枠で高さ整合 / `--r-interactive` 角丸 / 現在タイプ `--accent` 枠＋`--accent-soft` 面）。
- 過渡的整合（ResultPageShell の旧枠の中に新本文が出る状態）は実機で各クイズの静的結果ページを確認し「破綻ではなく改善」を満たすことを確認。
- **総合判定: 承認**。ゲート4種（lint / format / test 334ファイル 5588件 / build）すべて clean。完了基準 #5 がインライン surface・page surface 両方で達成。

reviewer の振り返り推奨（任意・本サイクル PM の AP-WF 抵触の具体化）:

1. **caller 監査の漏れ**: prop 値の内部マッピング方針変更時は、**全 caller（grep 等で網羅）を必ず一度通読**してから判断を確定する。今回 PM は page.tsx caller のみ確認し ResultCard caller を見落とした。
2. **surface ごとの語彙分離**: `"list" / "pill"` という public 型は dead literal 状態でやや誤解を招く（B-524 で整理）。

### ブログ（書かない判断）

本サイクルの経験＝「CSS Module 移行で内部マッピングを判断したが caller 監査が漏れて UI 質感が割れ、reviewer 指摘で根治した」は、サイト来訪者にとっての価値が薄い（オーケストレーション読者には平凡、Web 製作読者には固有構成依存、日記読者には他サイクルと差別化できない）。AP-W12（誰に向けた何の一文かを確定せず素材ありきで書きにいかない）に従い書かない。

## キャリーオーバー

すべて B-522 傘下。

- **B-523（次サイクル必須）**: 静的結果ページ群の枠 `ResultPageShell` の新デザイン移行＋ルート移動（`(legacy)→(new)`）。共通結果ページ `[slug]/result/[resultId]` の枠を新化し、Type C 専用結果8本の page.tsx／opengraph-image.tsx を (new) へ。本サイクルで本文が新化されたため「過渡的整合（新本文 in 旧枠）」を解消する後続。
- **B-524（次サイクル必須・B-523 と同時実施推奨）**: `*Content.tsx` の public props 型 `allTypesLayout: "list" | "pill"` を `"vertical" | "grid"`（または `"list" | "grid"`）の意味通り命名へ整理し、`"pill"` の dead literal を撤去。page.tsx caller も合わせて置換。なお page.tsx caller の現状は不揃い（yoji-personality だけ `"list"` で他7本は `"pill"`→grid。静的 surface での質感不揃いは本サイクル以前から存在）。B-523/B-524 同時実施で全 caller 一斉整理する。
- ゲーム4種・daily の (new)/ 移行（`RelatedGames` 等の絵文字除去同梱）— B-522 残り。
- 遊びコンテンツのタイル化方針の決定（B-295/B-493 統合）— B-522 残り。
- 過渡的トークン定義（old-globals.css 側）の撤去（Phase 11.2/11.5）— Phase 11 一括対応。

### 本サイクルで PM が抵触したアンチパターン（記録）

新規 AP は乱立させず、既存への再発として記録する。今サイクルで PM が抵触したのは（cycle-completion フェーズの workflow AP 点検 reviewer が指摘した分も含む）:

- **AP-WF03（過度に literal な指示・上流原因）**: builder 指示書（cycle-254 中盤の pill→grid 統一フェーズ）で、PM が「`"pill"` を内部で grid にマップ」「クラス名は `allTypesGrid` で参照実装と完全に揃える」と**実装表現の単位**まで literal で確定した。本来は「OtherTypesNav 系の縦リスト統一」のような抽象方針だけ渡し、内部マッピング設計と全 caller 確認を builder の判断に委ねるべきだった。literal 指示は builder の caller 監査機会を奪い、下記 AP-WF12/WF（caller 漏れ）の上流原因となった。
- **AP-WF12 射程拡張（内部仕様の実体確認漏れ）**: AP-WF12 はもともと外部仕様確認が射程だが、**他タスクの状態・フレームワーク API の挙動・他コードベース内部の prop 全 caller 集合**も「自ら参照すべき事実情報」として射程に含むべき。本サイクルでは `allTypesLayout` の値域変更を方針として降ろす前に `grep -r "allTypesLayout" src/` を実行すべきだった。後続 PM へ：**prop 値の意味を変える方針判断の前に、その prop が登場する全 caller を grep で網羅して通読する**。
- **AP-WF（PM の責務範囲）**: 上記の派生。page.tsx caller のみ確認し ResultCard.tsx（インライン caller）を見落とした結果、インライン surface で 5 variant が grid に倒れる質感断裂を生んだ。最終一括レビューが reviewer ブロッカーとして検出して根治。
- **AP-WF23（チェックリスト記録の漏れ）**: 第1回ゲート再実行（test 5586件）と第2回（最終修正後 5588件）の独立再走を PM が実行していたが、cycle-doc に明示記録していなかった。**完了処理フェーズの AP 点検 reviewer 指摘により、最終 HEAD `f448962b` で 4 ゲートを独立再走し下記に記録**。

### 完了処理フェーズの追加対応（AP 点検 reviewer 指摘の反映）

- **最終 HEAD `f448962b` での独立ゲート再走（AP-WF23 解消）**:
  - `npm run lint`: clean
  - `npm run format:check`: All matched files use Prettier code style
  - `npm run test`: 334 ファイル / 5588 件 pass（duration ~197s）
  - `npm run build`: 完走（Static/SSG/Dynamic 全形態のルートを正常プリレンダリング）
- **AP-WF07 隣接（並列水平展開時の質感統一）— 後続 PM への申し送り**: 並列水平展開（参照実装→7本展開）では、最終一括レビューだけに質感統一の検証を依存すると、reviewer ブロッカー検出は幸運にすぎず再現可能な仕組みでない。本サイクルの教訓として、**並列展開後、最終レビュー前に PM が「参照実装＋各並列成果物」を並べ読みして質感の揃いを独立確認**するチェックを入れることを推奨。
- **AP-I02 観点での B-524 残置の根拠**: 本サイクル修正後、`*Content.tsx` の public props 型 `allTypesLayout: "list" | "pill"` は dead literal 化（`"pill"` が page.tsx で grid・ResultCard.tsx で list を意味する曖昧状態）。本サイクル内で根治するには、全 8 本の型を `"vertical" | "grid"` 系へ変更し、page.tsx 全 8 本＋ResultCard.tsx の caller を一斉置換、テストも追従する必要があり、**B-523（静的結果ページの枠とルート移動）と一緒にやる方が caller 全体を一度に整理できて綺麗**。よって本サイクルでは残置するが、**B-524 を低優先から「次サイクル必須（B-523 と同時実施）」に昇格**して根拠を明記する（backlog 更新済み）。実行時の挙動は正しく、実プロダクトへの影響はない。

## 補足事項

- 移行は `design-migration-plan.md`「1ページ移行の標準手順」step5（トークン置換だけでは新デザインにならない／必要なら構造そのものを変える）を本文コンポーネントに適用する。本サイクルはルート移動を伴わないため step6（TrustLevelBadge 撤去）・ルートグループ分割は対象外。
- 作業は `*Content` 1本ごとにサブエージェントへ委譲し、作業後は必ず reviewer のレビューを受ける。reviewer には「色だけの上塗りでないか／ResultCard の新デザイン言語と整合するか／クイズ間で質感が割れていないか」を重点観点として渡す。
- MCP ツール（Playwright・GA4）を使うサブエージェントは foreground で実行する。

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
