---
id: 254
description: デザイン移行 Phase 8.2 の第二弾として、最も見られている旅程の終点である「クイズのインライン結果本文」を (new)/ デザインへゼロベースで本格再設計する。cycle-253 で枠（ResultCard）まで新化済みのインライン結果の中身——variant 別結果本文8本（*Content.tsx + *.module.css）と OtherTypesNav に残る絵文字・派手な type-color 罫線・中央寄せ・旧トークンを、ResultCard の新デザイン言語へ genuine に統一する。検索着地の主経路（プレイ画面内で完結するインライン結果。静的結果ページURLへの流入は実測7PV/28日と僅少）の質感断裂を本質的に解消する。
started_at: "2026-06-20T08:16:23+0900"
completed_at: null
---

# サイクル-254

このサイクルでは、デザイン移行計画 **Phase 8.2（遊び群の (new)/ デザイン移行）の第二弾**として、**クイズのインライン結果本文**を新デザインへ**ゼロベースで本格再設計**する。cycle-253 で枠（`ResultCard`）まで新化したインライン結果の、その中に描画される **variant 別結果本文8本（`*Content.tsx`）と `OtherTypesNav`** を genuine に新デザイン化し、検索着地の主経路の終点に残る質感断裂を解消する。

## なぜやるか（来訪者の所在）

検索から `/play/character-personality`(62PV/28日) 等に直接着地した来訪者は、12問に答えると **プレイ画面の中でそのままインライン結果を見る**。GA4 実測（プロパティ 524708437・2026-05-23〜06-19）では、静的結果ページURL（`/play/<slug>/result/...`）への流入は全クイズ合計でも **7PV**——プレイ画面合計 152PV の 4.6% にすぎず、性格診断系（character/word-sense/yoji/music）の結果ページURLはほぼゼロ。つまり**来訪者は結果URLに遷移せず、プレイ画面内のインライン結果で完結している**。最も多くの人が目にする結果体験はインライン結果である。

cycle-253 でインライン結果の**枠**（`ResultCard`）は新化した（左寄せ・新トークン・絵文字なし・共通アクセント）。しかしその中に dynamic import される **variant 別結果本文（`CharacterPersonalityContent` 等8本の `*Content.tsx`）と `OtherTypesNav`** は旧デザインのまま残っている——`🎭✨😅💡` の絵文字マーカー、`--type-color` を注入した派手な赤・マゼンタ系の色付き左罫線見出し、`text-align: center`、`font-weight: 700`、旧トークン（`--color-text`/`--color-border`/`--color-bg-secondary`）。流入最上位 character-personality(62PV) はまさにこの旧質感の本文を持つ。

これは cycle-253 が解消しようとした断裂の**残り**で、しかも最も見られている旅程の**終点**に位置する。プレイ画面（新）→ 設問（新）→ 結果カードの枠（新）→ **結果本文（旧）** と、最後の最後で質感が割れる。ここを直すのが最もレバレッジが高い。

## 実施する作業

- [ ] 視覚的グラウンディング：移行済みプレイルート上で主要クイズ（character-personality / traditional-color / yoji-personality / animal-personality 等、`*Content` を持つもの）を実機で12問完了させ、インライン結果の「新化済みの枠（ResultCard chrome）」と「旧質感の本文（\*Content）」の境界を実機スクショで観察・言語化する
- [ ] 新化の共通方針シートを作成（`tmp/`）：ResultCard.module.css の新デザイン言語（左寄せ・新トークン・絵文字なし・共通アクセント統一・角丸 2px/8px・bold 不使用）への、旧質感（絵文字 ::before / type-color 罫線 / 中央寄せ / 旧トークン / 角丸 10px）からの対応方針。`--type-color` は装飾（罫線・見出し色・薄敷き背景）としての使用をやめ共通 `--accent` に寄せる。ただし**色そのものが診断内容である traditional-color の色見本**は内容として保持する旨を明記
- [ ] 参照実装の確立：流入最上位かつ代表構造（archetypeBreakdown＋behaviors＋characterMessage＋allTypes）を持つ `CharacterPersonalityContent`（.tsx + .module.css）を builder が genuine 新化 → reviewer 承認を得て残りの基準とする
- [ ] 残り7本の `*Content`（Animal / Contrarian / ImpossibleAdvice / Music / TraditionalColor / UnexpectedCompatibility / YojiPersonality）を参照実装基準で genuine 新化（各1サブエージェント。1本ずつ委譲しトレーサビリティを確保）
- [ ] `OtherTypesNav.module.css` を新化（中央寄せ見出し・`--type-color` 左罫線・旧トークンを ResultCard 言語へ）
- [ ] 実機の視覚確認：新化した全8クイズのインライン結果を w360・w1280 × light・dark で撮影し、新デザイン世界観に genuine に到達しているか（色だけの上塗りでないか＝AP-P28）を評価
- [ ] 退行確認：本文を共有する静的結果ページ（`(legacy)/play/<slug>/result/[resultId]`）が破綻していないこと（過渡的整合：新本文が旧枠の中に出る状態が「壊れておらず、むしろ改善」であることを実機確認）
- [ ] テスト調整（再設計に伴う assertion 追従。安易な skip 禁止）
- [ ] レビュー依頼（reviewer に「色だけの上塗りになっていないか」「ResultCard の新デザイン言語と整合するか」「8本のクイズ間で質感が割れていないか」を重点観点として明示）と指摘対応
- [ ] backlog.md 更新（キャリーオーバー登録）

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

（実装後に記入）

## キャリーオーバー

（実装後に確定。想定される後続：静的結果ページ群の枠＝ResultPageShell 新化とルート移行、ゲーム・daily 移行、タイル化方針決定、過渡的トークン定義の撤去。すべて B-522 傘下で backlog にも記載する。）

## 補足事項

- 移行は `design-migration-plan.md`「1ページ移行の標準手順」step5（トークン置換だけでは新デザインにならない／必要なら構造そのものを変える）を本文コンポーネントに適用する。本サイクルはルート移動を伴わないため step6（TrustLevelBadge 撤去）・ルートグループ分割は対象外。
- 作業は `*Content` 1本ごとにサブエージェントへ委譲し、作業後は必ず reviewer のレビューを受ける。reviewer には「色だけの上塗りでないか／ResultCard の新デザイン言語と整合するか／クイズ間で質感が割れていないか」を重点観点として渡す。
- MCP ツール（Playwright・GA4）を使うサブエージェントは foreground で実行する。

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
