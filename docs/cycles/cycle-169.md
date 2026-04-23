---
id: 169
description: "B-308（デザインガイドラインとUIコンポーネント集の策定）を実施する。新コンセプト『日常の傍にある道具』を体現するUI/UXの基準を定義し、`/design-guideline` Skill として実装する。全UI関連作業の前提となるP0タスク。Owner主導で進める。"
started_at: "2026-04-23T16:46:40+0900"
completed_at: null
---

# サイクル-169

このサイクルでは B-308「デザインガイドラインとUIコンポーネント集の策定」を実施する。

cycle-167で策定したサイトコンセプト「日常の傍にある道具（と、ちょっとした息抜き）」を、実際のUI/UXに落とし込むための基準を定める。カラーパレットやタイポグラフィといった視覚要素から、余白・インタラクション・アクセシビリティまで、「日常の傍にある道具」らしさを体現するための指針を明文化する。

完成したガイドラインは `/design-guideline` Skillとして実装し、以降のUI関連作業（B-309のダッシュボード、B-310のトップページ再設計、B-317〜B-321の新規ツール群など）で参照できるようにする。全UI関連作業の前提となるP0タスクであり、Owner主導で進める。

## 実施する作業

### Planning フェーズ

- [x] R1: 既存UI/デザイン資産の棚卸し（code-researcher） — `tmp/research/2026-04-23-design-asset-inventory.md`
- [x] R2: 「道具らしさ」を体現するデザイン事例の調査（web-researcher） — `docs/research/2026-04-23-tool-ui-design-reference-for-yolos.md`
- [x] R3: Claude Code にデザインガイドラインを強制する仕組みの調査（web-researcher） — `docs/research/2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md`
- [x] R4: AI コーディングエージェントに規約を守らせる業界ベストプラクティス調査（web-researcher） — `docs/research/2026-04-23-ai-agent-design-system-enforcement-best-practices.md`
- [x] R5: Anthropic 公式デザイン関連スキルと Claude Code 実適用事例の深掘り（web-researcher） — `docs/research/2026-04-23-anthropic-official-design-skill-deep-dive.md`
- [x] R6: AI Slop の概要と回避策、デザインシステム適用における AI Slop リスクの調査（web-researcher） — `docs/research/2026-04-23-ai-slop-definition-and-avoidance-for-design-systems.md`
- [x] P1: デザインガイドラインの範囲・骨格・進め方・強制機構の立案（planner）
- [x] Rev1: 計画のレビュー（reviewer、Rev1-1 → Rev1-2 → Rev1-3 → Rev1-4 の 4 回反復で pass）

### Execution フェーズ（計画の確定後、/cycle-execution で具体化）

- [ ] E1: Owner確認ゲート1 — 方向性（A/B/C/D の中から）、Named Aesthetic Tone、カラー、タイポ、ダーク背景、「作業ゾーンと読み物ゾーンのトーン分離」の基本方針決定
- [ ] E2: デザイン原則ドラフトとコアトークン定義（色・タイポ・スペーシング・角丸・focus ring・ブレイクポイント）。主要3ページでのコントラスト比実測を含む
- [ ] E3: Owner確認ゲート2 — トークン具体値（特にプライマリ色・ダーク背景・アクセント）の最終承認
- [ ] E4: `/design-guideline` Skill 骨格の実装（単一 SKILL.md、`disable-model-invocation` 無指定）と、builder/reviewer への system prompt 追記＋`skills` プリロード配線
- [ ] E5: 強制機構の導入 — Stylelint（`stylelint-declaration-strict-value`、色のみ対象、事前ドライラン付き）と PreToolUse hook（`additionalContext` で「SKILL.md と globals.css を Read で読め」という命令を注入）の配線
- [ ] E6: ShareButtons 系 4 ファイルのダークモード手法統一バグ修正（R1 L305–L311 指摘）
- [ ] E7: 検証 — 単体発火確認（Stylelint／hook／Skill プリロード）＋ end-to-end ドライラン（`tmp/` 配下の捨てコンポーネントを仮 builder タスクで編集して全層の連鎖を確認）
- [ ] E8: 成果物レビューと指摘対応、および backlog B-309/B-310/B-295/B-317〜B-321 への「SKILL を先に読む」前提条件追記

## 作業計画

### 目的

**本サイクルのゴールは一言で言うと「本サイクル以降の UI 作業が、ガイドラインを参照しトークンから値を選ぶ以外の選択肢を取りにくい状態」を作ることである。装飾の完成ではなく、骨格と強制機構を動かせる状態にするのが仕事。**（※レビュー n1 反映：芯の前出し）

B-308 は、cycle-167 で策定した新コンセプト「日常の傍にある道具（と、ちょっとした息抜き）」を視覚と実装に落とし込むための土台を作るタスクで、B-309 ダッシュボード／B-310 トップページ再設計／B-317〜B-321 の新規ツール群／B-295 のレイアウト再設計がすべて本サイクルの成果物を前提として走る。

誰のためにやるかを分解する。

- **ターゲットユーザー（M1a／M1b）**: M1a（作業中に探す人）は「開いた瞬間入力欄が見えて余計な装飾がない画面」を求め、M1b（繰り返し使う人）は「前と同じ場所に前と同じ形で道具がある安心感」を求める。両者にとって価値を生むのは、色を 1 個決めることではなく、**各ツールの見た目と振る舞いがサイト全体で揃っていること**。ガイドラインと強制機構は、この「揃っている状態」を持続させるためのインフラ。
- **将来の UI タスクを担う builder／reviewer**: 現状は CSS 値がハードコードされたり、ShareButtons のダークモード方式が割れたりしている。builder が毎回「何色を使うか」「どのブレイクポイントか」を判断せざるをえない状態を、「globals.css のトークンを参照する」「SKILL を作業前に必ず読む」に変えることで、判断の迷いと揺れを削る。reviewer も、定性判断ではなく Stylelint と rubric で指摘を根拠づけできる。
- **Owner／PM**: Owner は B-308 を「自分主導で決めたい」として P0 で立てている。計画は Owner が方向性を決めやすい形に情報を整形して提示する役割を果たす。PM にとっては、以降のサイクルで「デザインのばらつき」を検出・是正するコストを継続的に下げる投資になる。

### トーンの 2 ゾーン分離（前提、M2 指摘反映）

本サイクルのデザイン方針は **「作業ゾーンと読み物ゾーンのトーンを意図的に分離する」** ことを前提とする。これは R2 案 D ＋ Named Tone `functional-minimal` と、PM キャラクター（`docs/character.md`）の「warm and eager」のトーン衝突を解消するための構造設計である。

- **作業ゾーン**: トップ以下のツール画面（`src/tools/**`）、ゲーム画面、辞典・チートシート、検索 UI、Header/Footer 等のナビゲーション。character.md L269 が明記する「キャラクターは作業画面に出ない。傍に在るが主張しない設計が M1a の作業を邪魔しない最大の配慮」をそのまま適用する。このゾーンのトーンは後述の Named Tone（planner 推奨: `functional-minimal`、もしくは Owner 選定の別案）。
- **読み物ゾーン**: ブログ記事本文（`src/app/blog/[slug]/**`）、AI の日記、about ページ本文、キャラクター発話が前面に出る領域。character.md の warm and eager をそのまま受ける。装飾ではなく、文章の温度で温かみが出る設計。色トークン・タイポスタックは作業ゾーンと共通（=「器は同じ」R2 L392）、異なるのは枕詞・段落密度・強調の出し方（character.md の書き言葉版方針）。

この分離は両ゾーンのレイアウト／コンポーネントを分岐させる意味ではない。**同じトークンを使いながら、ゾーンごとにトーンの「演じ方」を変える** という運用ルールである。SKILL.md 本体は作業ゾーン向けの規約を中心に記述し、読み物ゾーンのトーン方針は character.md（書き言葉版）・blog-writer.md 側に委ねる。この分担を SKILL.md 冒頭に 1 段落で明記し、「読み物ゾーンは別ソース参照」とする。

**Owner が 2 ゾーン分離を却下した場合のフォールバック（B2 指摘反映）**: 全ゾーン共通の単一 Tone に切り替え、planner は「どのトーン 1 語に統一するか」の追加候補を 2 案（`quiet-but-eager` と `warm-functional`、いずれも character.md の温度を部分的に受ける方向）で即時再提示する。SKILL.md の「2 ゾーン分離」段落は「全ゾーン共通トーン」の宣言に書き換え、読み物ゾーン側も SKILL.md 参照に寄せる。E2 以降の作業構造は不変（トークン最小セット、3 層重ねがけ、Stylelint、hook）。

### 作業内容

スコープは「骨格の確立と強制機構の起動、および強制機構の前提を崩しているバグの修正」に絞る。広い既存コード書き換えは本サイクルでは行わない（後述 スコープ外 に根拠）。

#### E1: Owner 確認ゲート 1 — 方向性と基本方針の決定

**目的**: ビジュアル方向性とコアトークンの「値」を決める前に、**何を表現したいか** を Owner と合意する。ここが決まらないと E2 以降が空回りする。

**planner 推奨案（叩き台）**:

- **方向性**: R2 案 D「洗練された中立（Linear 系＋日本語最適化）」＋ R6 案 B「Named Aesthetic Tone」＋ 前述の 2 ゾーン分離の 3 点セット。作業ゾーンのトーンは `functional-minimal`（道具の実直さ、Linear／Vercel／Primer 系譜）、読み物ゾーンは character.md の warm and eager をそのまま受ける。
- **選定根拠**: (i) 2 ゾーン分離で M1a の「すぐ使いたい」と S3 の「書き手の視点」を両立できる（M2 解消の構造）。(ii) 既存 globals.css（セマンティック変数集約、`var()` 941 箇所）と案 D の親和性が高く、値差し替えだけで適用できる。(iii) R6 Slop シグナル（紫〜青グラデ等）を最も避けやすい。
- **フォント方針**: 本サイクルはシステムフォントスタック（ラテン先頭 `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`, `Inter` は第 1 候補に置かない）。Noto Sans JP 等の Web フォント導入は **骨格ゴールに不要なので保留**（9.2MB が理由ではなく、R2 L231 のサブセット版なら将来の読み物ゾーン強化で現実的な選択肢として残る。M3 反映）。
- **ダーク背景方針**: 純黒を避けオフな暗色。候補 `#141210` 系 or `#111418` 系。現行 `#1a1a2e`（紺寄り、旧コンセプト残り香）は変更対象。
- **トーン粒度（M5 反映）**: R6 Taste Skill の 3 パラメーター（DESIGN_VARIANCE／MOTION_INTENSITY／VISUAL_DENSITY）は **本サイクル不採用**。現状 builder 1 体運用で密度のブレが観察されておらず、Named Tone 1 語で方向が固定できる範囲内。**採用条件**: B-309 以降で並走 builder の密度・動きにバラつきが観察されるか、密度関連のレビュー指摘が 2 件以上蓄積したら、`docs/design-guideline.md` に 3 軸を追記する。

**Owner に提示して決定を仰ぐ事項（E1 ゲートのアジェンダ、B5 指摘反映：P1/P2/P3 の 3 段構造）**:

Owner が忙しければ P1 のみ回答で E2 に進められる構造にする。P2/P3 は推奨案の暫定採用で先行し、E3 ゲートで一括確認する。

- **P1（必ず Owner 判断、①②セット）**: **「トーンの 2 ゾーン分離の是非」＋「作業ゾーンの Named Tone 名称」** を 1 セットで判断してもらう。作業ゾーン＝`functional-minimal` ／ 読み物ゾーン＝warm and eager（character.md 準拠）の役割分担を採用するか。採用する場合の作業ゾーン Tone 名称は `functional-minimal`（推奨）／`warm-functional`（温度を少し持たせる）／`quiet-but-eager`（character.md と弱く接続）の 3 案から選択。不採用の場合は「全ゾーン共通のトーン」を何にするか。**この P1 が以降すべての構造の前提になるため、ここだけは Owner 明示回答を待つ**。
- **P2（planner 推奨案を暫定採用可）**: 方向性案 D（洗練された中立）の採用可否、プライマリ色の方向性（ニュートラルブルー `#3b82f6` 系／インジゴ `#6366f1` 系／ティール寄り／現行 `#2563eb` 踏襲）、ダーク背景の大まかな色相（青寄り／ニュートラル／ウォーム）。**48 時間以内に応答がなければ planner 推奨案で暫定採用し E2 に進める**。E3 ゲートで値を見せて Owner が覆したときのみ手戻り。
- **P3（Owner の明示判断は求めず planner 推奨を既定路線として進める）**: 既存ヒーロー（トップ、/play の紫→シアングラデ）は **次サイクル（B-310）送り** を既定路線として進める。Owner がこの扱いについて明示した場合のみ再協議する。

**入力**: R1〜R6 の要点と 3 択 P1 の構造をまとめた **要約ブリーフィング `tmp/cycle-169-owner-briefing.md`**（B4 指摘反映、計画本体とは別ファイル、A4 1 ページ程度）。参考事例（Linear／Vercel Dashboard／Raycast）は Playwright `take-screenshot` で静止画に落として添える。
**成果物**: Owner の P1 回答（および必要に応じて P2 の上書き回答）を cycle-169.md 本文に追記。
**判断基準**: P1 が固定化されていること。P2 は暫定採用でも可。

**非同期運用の前提（m1・B5 指摘反映）**: P2 は 48 時間で暫定採用、P3 は Owner 判断を待たない。P1 のみ明示回答が揃うまで E2 の本格化を保留する（準備・下調べは並行してよい）。

**予想される難所**: 方向性を言葉だけで合意すると E3 で値がぶれる。参考事例のスクリーンショットを必ず添える。

#### E2: デザイン原則ドラフトとコアトークン定義

**目的**: E1 の方向性を、globals.css に入れられる「具体値」と、SKILL.md に書ける「原則」の両方に落とし込む。

**planner 推奨方針**: 本サイクルはコアトークンを最小セットに絞る。既存トークン名は一切変更せず（R1 の `var()` 941 箇所参照を壊さないため）、値の差し替えと新規トークンの追加のみで完結させる。「既存を守りながら足す」アプローチ。

**作ること**:

1. `docs/design-guideline.md`（新設、本サイクル以降も継続して残す運用資料） — デザイン原則の完全版。以下のセクションを含む:
   - トーンの 2 ゾーン分離の説明（1 段落）
   - 作業ゾーンの Named Aesthetic Tone の定義（1 段落）
   - Do/Don't 対比（R5 Triptease 流、コード例つき、最重要 5〜8 件）
   - R6 リスク A/B/C への回答（「理由の記録」軽量版＝重要判断 3〜5 個にだけ why を添える）
2. **コアトークン仕様（値）** — 本サイクルで定義するカテゴリのみ。残りは次サイクル以降で段階追加:
   - Color: primary / primary-hover / bg / bg-secondary / text / text-muted / border / focus-ring。light/dark 両方。既存の error/success/warning/trust-\* は値を変えない（互換のため）。
   - Typography: font-sans（ラテン先頭の和文スタック）、font-mono（現行維持）。font-size のトークン化は本サイクルではやらない（R1 の集約案「0.75/0.85/0.9/0.95/1/1.1/1.5/1.75rem」は次サイクル以降で段階移行）。
   - Spacing: `--space-1..16`（4/8/12/16/24/32/48/64px）を新規追加。既存の rem 値は当面並立。
   - Radius: `--radius-sm/md/lg`（4/8/12px）を新規追加。既存値は並立。
   - Focus ring: `outline: 2px solid var(--color-focus-ring)` + offset 2px（WCAG 2.2 Focus Appearance Minimum 準拠、R2）。
   - ブレイクポイント: 640 / 768px の 2 段階を SKILL 記載のみ（CSS 変数化はしない、`@media` 中で直接使う）。
3. **globals.css の差分パッチ（最小）** — 上記のうち「値変更」と「新規追加」のみ。既存トークンの名前変更はしない。

**コントラスト比の実測手段（m2 指摘反映）**: コントラスト計算の曖昧さを避けるため、以下を正式手順とする。

- 主要 3 ページ（トップ／代表ツール 1 本／ブログ記事 1 本）を Playwright で実描画する。
- 各ページのライト／ダーク計 6 枚のスクリーンショットを取得する（take-screenshot スキル経由）。
- 同時に Playwright の `page.evaluate` で対象要素（CTA ボタン・本文テキスト・リンク）の `getComputedStyle` から前景色 / 背景色の RGB を取得する。
- WCAG 2.1 の輝度コントラスト式（`(L1 + 0.05) / (L2 + 0.05)`、sRGB → 相対輝度変換含む）をスクリプトで計算する。計算式は `docs/research/2026-04-23-tool-ui-design-reference-for-yolos.md` の WCAG 節を出典として明記。
- 判定: 本文テキスト 4.5:1 以上、大きなテキスト・UI 要素 3:1 以上。不合格箇所はダーク側の値を個別に補正する（R1 L329 の `/play` の先行対処に準じる）。
- ツール導入は行わない（axe-core 等を入れると本サイクルのスコープが膨らむ）。Playwright の既存環境で実行できる範囲に留める。

**入力**: E1 の Owner 決定、R1 の既存トークン集計、R2 のフォント／WCAG 知見、R5 の DO/DON'T 構造。
**成果物**: `docs/design-guideline.md` ドラフト、`globals.css` の diff 案（`tmp/` に置く）、コントラスト実測ログ（`tmp/` に置く）。
**判断基準**: diff 案を適用しても既存ページのビジュアルレグレッションが「プライマリ色とダーク背景の意図した変化のみ」で、レイアウト崩れを伴わないこと（E7 で end-to-end 検証）。コントラスト比は全計測箇所で WCAG AA クリア。

**予想される難所**: `#2563eb` → 新色でコントラスト比が変わる箇所が出る。特にダークモードで `--color-primary` に白文字を乗せている CTA は WCAG AA に落ちる可能性がある（R1 L329）。必要なら該当箇所のみトークン値を個別に調整する。

#### E3: Owner 確認ゲート 2 — トークン具体値の最終承認

**目的**: E2 で出した値（新プライマリ色の 16 進値、新ダーク背景の 16 進値など）を Owner が目視確認して承認する。ここを飛ばすと E4 以降で「色が違う」手戻りが起きる。

**Owner に提示する物**:

- 主要 3 ページ（トップ／代表ツール 1 本／ブログ記事 1 本）のライト・ダーク計 6 枚の Before/After スクリーンショット
- コアトークン仕様の表（名前・ライト値・ダーク値・用途の 4 列）
- WCAG AA 合否の実測ログ（E2 のコントラスト計算結果）

**成果物**: 承認された値を `globals.css` に実際に適用（新値を commit）。以降の作業はこの値を前提に進める。

**判断基準・非同期運用（m1 指摘反映）**: Owner が「この色で進めてよい」と明示的に応答する、または 提示後 48 時間以内に応答がない場合は planner 推奨案を暫定採用して E4 に進める。暫定採用した場合は、Owner の復帰時に「E3 の暫定採用値＋E4 以降の成果物」をまとめてレビューしてもらう運用にする。色値の微調整は軽い再適用で済むため、この運用で致命的な手戻りは発生しない。

#### E4: `/design-guideline` Skill の骨格実装

**目的**: `docs/design-guideline.md` の内容を、Claude Code の builder／reviewer が **「UI 作業前に必ず読む」** という運用で参照できる形式で設置する。

**M1 指摘反映: 「必ず読まれる運用」の成立条件と形跡判定手段（B1 指摘で強化）**

B-308 Owner 要件は「UI 作業前に必ず読む」。Skill は advisory（R3）・`paths` も確率的発火の延長（R5）なので、プリロード／自動ロードだけでは不十分。本サイクルは **3 層重ねがけ＋形跡の判定可能化** で担保する:

1. **system prompt への明示義務**: builder.md・reviewer.md 冒頭に「UI 関連ファイル（`.module.css`、`src/app/globals.css`、`src/components/**`、`src/app/**/*.tsx`、`src/**/_components/**`）を編集・レビューする前に、必ず `.claude/skills/design-guideline/SKILL.md` を Read ツールで読むこと。**読んだ証拠として、PM への報告冒頭に SKILL.md の先頭 3 行（`---` フロントマター直下の本文 3 行）を引用すること**。引用がない場合 reviewer は差し戻す」を追記する。
2. **`skills` フィールドによるプリロード**: builder.md・reviewer.md のフロントマターに `skills: [design-guideline]` を追加（コンテキスト補填層、R3・R5）。
3. **PreToolUse hook での命令注入＋引用要求**（E5 と連動）: `.module.css` 等の編集直前に `additionalContext` として「SKILL.md と globals.css を Read で読め。報告冒頭に SKILL.md 先頭 3 行を引用せよ」という命令文を注入する（文面詳細は E5）。

**形跡判定の具体手段（B1 指摘反映）**:

- **判定対象／判定者**: builder の PM 宛て報告冒頭に SKILL.md 本文先頭 3 行と文字列一致する引用があるか／reviewer。
- **判定手順**: reviewer.md の差し戻し観点に「builder 報告冒頭を SKILL.md 実ファイルの先頭 3 行と行単位完全一致で照合。不一致または欠落は差し戻し」を明記。自己申告や `--debug-file` には依存しない（固定文字列の有無で判定）。
- **仕組み上の担保**: SKILL.md 本文先頭 3 行は **Role / Tone / See also の 3 行独立宣言ブロック**（フロントマター `---` の直後、本文構成 #1 より前）。**少なくとも 1 つ以上の固有名詞**（`functional-minimal`／`warm and eager`／`docs/character.md` 等）を含め、丸暗記や推測では書けない構造にする。hook 注入文面・builder 報告の引用・SKILL.md 冒頭の 3 者は E4 実装時にバイト一致で対になるよう設計。
- **限界と対応**: 捏造リスクに対しては E7 end-to-end ドライランで実際の Read ツール呼び出しの有無を合わせて確認する。

**SKILL.md 冒頭 3 行の具体例（C1 指摘反映）**:

E1 の P1 判断結果で 2 パターン用意する。どちらを採用するかは E4 実装時に E1 の回答で確定させる。

- **2 ゾーン分離採用時（planner 第一推奨のケース）**:

  ```
  Role: yolos.net の作業ゾーン向けビジュアル基準を builder/reviewer に示す。
  Tone: functional-minimal（道具の実直さを優先、docs/character.md の warm and eager は作業画面に出さない）。
  See also: docs/design-guideline.md, docs/character.md, docs/site-concept.md
  ```

- **2 ゾーン分離却下時（全ゾーン共通トーンのフォールバック）**:

  ```
  Role: yolos.net の全ゾーン向けビジュアル基準を builder/reviewer に示す。
  Tone: <Owner 確定トーン名>（docs/character.md の warm and eager と整合する単一トーンで、作業画面・読み物ゾーン共通に適用する）。
  See also: docs/design-guideline.md, docs/character.md, docs/site-concept.md
  ```

  `<Owner 確定トーン名>` は E1 P1 の代案（`quiet-but-eager` など）から確定した語で置換。

**E1 回答に応じた確定手順（C1 指摘反映）**: E4 着手時に E1 P1 の回答を確認し、2 ゾーン分離採用なら第 1 例、却下なら第 2 例を採用して SKILL.md 冒頭と hook 注入文面の双方に同じ 3 行を埋め込む。system prompt（builder.md・reviewer.md）には「SKILL.md 冒頭の 3 行宣言ブロックを引用せよ」と抽象的に書き、具体値は SKILL.md 側に一元化する（二重管理回避）。

**Skill 構造（単一ファイル、200 行以内）**: Anthropic 公式 `frontend-design` と同じ単一 SKILL.md 構成（R5）。rule piling 警戒／本サイクルのトークン量は単一で収まる／Progressive Disclosure は必要時に段階導入。

**SKILL.md のフロントマター案（M4・n2 指摘反映、そのままコピペ可能な YAML）**:

```yaml
---
name: design-guideline
description: |
  yolos.net のデザインガイドライン。CSS Modules、globals.css、src/components、
  src/app の UI ファイルを編集するとき、またはデザイン・スタイル・レイアウト・
  色・タイポグラフィに関わる作業をするときに参照すること。
when_to_use: |
  - .module.css または globals.css を編集するとき
  - src/components/** または src/app/**/*.tsx の UI を編集・新設するとき
  - 新しいコンポーネントを作成するとき
  - UI のデザインレビューを行うとき
paths:
  - src/app/globals.css
  - src/**/*.module.css
  - src/components/**/*
  - src/app/**/*.tsx
  - src/**/_components/**/*
user-invocable: false
---
```

**`disable-model-invocation` の扱い（M4 反映）**: 明示記述せずデフォルト `false` を維持（プリロード・`paths` 自動ロード・description 自動発火をすべて有効化）。`user-invocable: false` のみ設定してスラッシュメニューから隠す。既存 cycle-kickoff 等は明示コマンド運用のため逆の設定。

**SKILL.md の本文構成（単一ファイル、200 行以内）**:

0. **冒頭 3 行の宣言ブロック**（Role / Tone / See also、上記 C1 例のいずれかを採用）。引用照合の対象。
1. **トーンの 2 ゾーン分離の補足段落**（作業ゾーンは本 SKILL 担当、読み物ゾーンは character.md の書き言葉版と blog-writer.md に委任。2 ゾーン分離却下時はこの段落を「全ゾーン共通トーン」の宣言に書き換え）
2. **作業前の必読手順**（3〜5 行）: globals.css を Read で確認すること／既存の類似コンポーネントを Grep すること（Triptease 流の「調べる先の確定」）
3. **Named Aesthetic Tone の定義**（1 段落、R6 案 B）
4. **トークンのリファレンス**（値ではなくセマンティクス。値は globals.css を参照する、二重管理を避ける）
5. **Do/Don't 5 件**（R5 Triptease 流、CSS コード例つき）
6. **NEVER + INSTEAD ペア**（R5 PR #210 教訓。「Inter を第一候補にしない → システムフォントスタックを使う」「紫グラデを作らない → Named Tone 準拠」「ハードコード `#` を書かない → `var(--...)` を使う」等。実行可能な指示のみ）
7. **フォーカスリングの必須適用**（WCAG 2.2 Focus Appearance Minimum）
8. **Bad 例の具体**（R6 Slop シグナル 5 項目。Inter ＋ 紫グラデ ＋ 中央寄せヒーロー ＋ `rounded-2xl`/`shadow-lg` ＋ 3 カラムグリッドなど）

**docs/design-guideline.md と SKILL.md の役割分担（m5・m6 反映）**:

- `docs/design-guideline.md`（`docs/` 直下、`doc-directory.md` 規約準拠）は **Owner・reviewer 向けの継続参照資料**。背景・経緯・根拠・将来拡張条件（Taste Skill 3 軸、Noto Sans JP サブセット等）。
- `.claude/skills/design-guideline/SKILL.md` は **builder・reviewer 向けの実行時指示**。Do/Don't・NEVER+INSTEAD・必読手順のみ。値は globals.css を参照（PR #210 教訓、二重管理回避）。
- 最初から別ファイル・別役割で作る（「移植」運用をしない）。E8 のレビュー時に両者の矛盾がないか最終確認。

**成果物**: `.claude/skills/design-guideline/SKILL.md`、`docs/design-guideline.md`、`builder.md` と `reviewer.md` の差分（system prompt 追記＋`skills` フィールド追加）。
**判断基準**: E7 の end-to-end ドライランで builder が実際に UI 編集タスクを受けたとき、SKILL.md と globals.css を Read で読んでから編集している／成果物がハードコードなしで仕上がる／reviewer が「読んだ形跡」を確認できる。

#### E5: 強制機構の導入（Stylelint + PreToolUse hook による命令注入）

**目的**: SKILL は advisory（確率的遵守）なので、決定論的な機構を 2 層入れる。R3 案 B（Skills + Hooks）× R4 の Stylelint を統合し、R3 案 C（三層）への踏み台にする。

**1. Stylelint（物理強制）**

planner 推奨方針:

- `stylelint` + `stylelint-declaration-strict-value` を devDependency に追加。
- `.stylelintrc.json` を新設し、以下のプロパティで変数参照を強制:
  - `color`, `background-color`, `border-color`（ハードコード禁止）
  - `ignoreValues` には `transparent / inherit / currentColor / none / white / black / #fff / #ffffff / #000 / #000000 / 0 / auto` を許可（R4 L338-L349 の設定例を起点に、既存 CSS との互換を優先）
  - `font-size`, `border-radius`, `padding`, `margin` は **本サイクルでは対象外**（既存 167 ファイルが一斉に違反になるため。次サイクル以降で段階追加）
- `package.json` に `lint:css` スクリプトを追加。`npm run lint` 既存パイプラインに乗せるのは違反件数が 0 になってからに限る。

**事前ドライランの必須実施（M7 指摘反映）**:

設定案を決めた直後に、**`.stylelintrc.json` を配置したうえで `npx stylelint 'src/**/\*.module.css'`と`npx stylelint src/app/globals.css` をドライラン実行\*\*する。目的は以下:

- 違反件数と箇所を把握し、想定（0〜数十件）を大幅に超える場合は `ignoreValues` の追加・対象プロパティの更なる絞り込みを行う。
- 既存 CSS に残っている `color: #000` / `background: #fff` 類、`trust-*`／`admonition-*` 周辺のハードコード値が即違反にならないか確認する。
- 違反が出たファイルのうち軽微なもの（E6 対象の ShareButtons 4 ファイルに含まれるものを含む）は E6 と合わせて修正してよい。それ以外は Stylelint を disable コメントで一時許容するか、`ignoreValues` を拡張する。「とにかく全違反を今サイクルで潰す」方針は取らない（骨格確立が本サイクルのゴール）。
- ドライラン結果と採った対応は `tmp/` に記録し、E7 の end-to-end ドライランと E8 のレビューで参照できるようにする。

**2. PreToolUse hook（命令注入モード、M1 指摘反映）**

- `.claude/hooks/check-design-guideline.sh` を新設。R3 の `additionalContext` 注入方式（exit 0）を採用。ブロックモード（exit 2）にはしない。
- 対象パターン: `tool_input.file_path` が `.module.css` / `src/app/globals.css` / `src/components/**` / `src/app/**/*.tsx` / `src/**/_components/**` のいずれかにマッチしたとき、`additionalContext` に **「SKILL 本文を読め＋報告に冒頭 3 行を引用せよ」** という命令文を注入する（B1 指摘反映：形跡の機械判定化）。注入文面:

  > UI 関連ファイルを編集しようとしています。編集前に次の 2 ファイルを必ず Read ツールで読んでください:
  >
  > 1. `.claude/skills/design-guideline/SKILL.md`（本サイクルのデザインガイドライン全文）
  > 2. `src/app/globals.css`（CSS 変数の定義元。ハードコード禁止）
  >
  > **読んだ証拠として、PM への報告冒頭に SKILL.md の本文先頭 3 行（`---` フロントマター直下）を引用してください**。引用がない／内容が一致しない報告は reviewer が差し戻します。

- `.claude/settings.json` の `PreToolUse` に `matcher: "Edit|Write"` で登録。既存の Bash hooks とは別配列。

**3. 追加しない／やらないもの（スコープ外の根拠）**:

- SessionStart(compact) hook による再注入: 本サイクルではやらない。SKILL プリロード＋PreToolUse で足りる可能性が高く、実運用で必要になってから追加する。
- `.claude/rules/design-guideline.md`（paths フィルタの rules ファイル）: R3 案 C の三層化は次サイクル。本サイクルは案 B ＋ Stylelint。
- exit 2 ブロックモード: R3 注記の「差し戻し地獄」リスクが本プロジェクトの試行頻度とミスマッチ。

**成果物**: `package.json` diff、`.stylelintrc.json`、`.claude/hooks/check-design-guideline.sh`、`.claude/settings.json` の diff、Stylelint ドライラン結果ログ（`tmp/` に置く）。
**判断基準**: Stylelint ドライランの違反件数が想定範囲内（もしくは設定調整後に収束）／意図的にハードコード色を書いたファイルがエラーになる／hook が UI ファイル編集時に発火して `additionalContext` に「SKILL と globals.css を Read で読め＋冒頭 3 行引用要求」が入る。

#### E6: ShareButtons 系 4 ファイルのダークモード手法統一

**目的**: R1 L305–L311 で判明した「next-themes の `:root.dark` と `[data-theme="dark"]` / `prefers-color-scheme` の混用」バグを直す。これは **強制機構を動かす前提**（Stylelint や hook で検出できる種類のバグではなく、セレクタ切り替えの構造バグ）として本サイクルに含める。

**対象 4 ファイル**:

- `src/components/common/ShareButtons.module.css`
- `src/play/quiz/_components/ShareButtons.module.css`
- `src/play/games/shared/_components/GameShareButtons.module.css`
- `src/humor-dict/_components/EntryRatingButton.module.css`

**作業**: `[data-theme="dark"]` と `@media (prefers-color-scheme: dark)` のブロックを、`:root.dark` を `:global(:root.dark)` で参照する形式（他 13 ファイルの既存パターンに合わせる）に統一する。既存の色値は変えない（E3 の新プライマリ色適用はトークン経由で自動反映されるため）。

**検証**: Playwright で 4 つの該当画面をライト／ダーク両モード、かつテーマトグル操作後に確認する。OS のダークモード設定を変えずに next-themes でダークに切り替えたとき、これまで追従しなかった色が正しく変わることを目視確認。

**成果物**: 4 ファイルの diff + Playwright スクリーンショット。
**判断基準**: `<html class="dark">` を強制設定した状態で該当要素のダークモードスタイルが適用されている。

#### E7: 検証（単体発火確認＋end-to-end ドライラン、M6 指摘反映）

本サイクルのゴール（骨格を動かせる状態）に対応する検証として、単体発火の 4 点に加えて **end-to-end ドライラン** を 5 点目として必須化する。単体確認だけでは「部品がそれぞれ動くこと」しか示せず、「全体として UI タスクを受けて回るか」は担保できない。

**単体発火確認（従来どおり）**:

1. **Stylelint の意図的違反検知**: ダミーファイルを `tmp/` に作り、色をハードコードしたうえで `npx stylelint` を実行してエラーが出るか確認する。
2. **PreToolUse hook 発火**: 別サブエージェント（builder）を起動し、`.module.css` を 1 行編集させる。`--debug-file` でログを取り、`additionalContext` に「SKILL.md と globals.css を Read で読め＋冒頭 3 行を引用せよ」という命令文が渡っているかを確認する。
3. **主要ページのビジュアル差分**: E3 で取った 6 枚（主要 3 ページ×light/dark）と E5/E6 適用後の 6 枚を Playwright で再取得して比較する。意図した変化（プライマリ色・ダーク背景）以外の崩れがないこと。
4. **SKILL プリロード確認**: builder を 1 本起動し、最初のターンで「`.claude/skills/design-guideline/SKILL.md` の内容は見えているか、`src/app/globals.css` の主要な CSS 変数名を挙げられるか」を質問して応答を確認する。

**end-to-end ドライラン（新規、M6 指摘反映／B3 指摘反映で仮タスクを tmp/ 統一）**:

5. **全層連鎖の実動作確認**: **`tmp/` 配下に捨てコンポーネント（例: `tmp/dry-run/SampleButton.module.css` 等）を作成**し、それを仮 builder タスクとして「新プライマリ色で書いてほしい」と編集指示する。既存ソース（ShareButtons 系含む）は **E6 成果物との干渉回避のため対象にしない**。このドライランで以下を確認する:
   - (a) `skills: [design-guideline]` プリロードが効き、SKILL 本文がコンテキストに入っている。
   - (b) `.module.css` 編集直前に PreToolUse hook が発火、additionalContext に命令文と「SKILL 冒頭 3 行引用要求」が入る。builder が実際に SKILL.md と globals.css を Read する（ツール履歴で確認）。
   - (c) builder の PM 宛て報告冒頭に SKILL.md 先頭 3 行の一致引用がある（B1 形跡判定の本番検証）。
   - (d) 成果物がハードコードなし（`var(--...)` のみ）で Stylelint 0 件。Playwright 描画で意図した変化のみ。
   - いずれか失敗なら E4 または E5 に戻って修正。**このドライラン成功が本サイクル完了の実質的な合格条件**。仮タスクと `tmp/dry-run/` は commit しない、作業完了後に破棄。

**成果物**: 検証ログ 5 項目分（`tmp/` に置く）。end-to-end ドライランの builder 応答・hook 発火ログ・Stylelint 結果・Playwright スクショを 1 本のログにまとめる。
**判断基準**: 単体 4 項目 + end-to-end 1 項目すべて想定どおり。1 つでも想定外なら E4 または E5 に戻って修正して再実行。

#### E8: 成果物レビューと次サイクルへの引き継ぎ整備（m3 指摘反映）

reviewer に本サイクルの全成果物（SKILL.md、`docs/design-guideline.md`、globals.css 差分、`.stylelintrc.json`、hook スクリプト、builder/reviewer の差分、ShareButtons 修正）をレビューさせ、指摘が 0 件になるまで対応する。

加えて、本サイクル成果物が「孤児化」しないよう、**`docs/backlog.md` の B-309 / B-310 / B-295 / B-317〜B-321 の説明欄に「着手時に `.claude/skills/design-guideline/SKILL.md` を Read ツールで読み、`docs/design-guideline.md` の該当セクションを参照すること」を書き込む**。これによって、次サイクル以降のどの planner / builder がタスクを引き取っても、前提の認識が揃う。`docs/design-guideline.md` と SKILL.md の内容が矛盾していないかも、この段階で最終確認する。

### スコープ外（本サイクルではやらない理由つき）

- **既存 167 CSS Module ファイルへの一括トークン適用／font-size トークン化**: 現状の 941 箇所の `var()` 置換と rem/px 混在の整理は、変更量が大きすぎて本サイクルのゴール（骨格と強制機構）を希薄化する。次サイクル以降に「1 セクションずつ」分割して進める。Stylelint を `font-size` まで広げるのも同タイミング。
- **ヒーローグラデ廃止と旧コンセプト文言除去**: R1 で判明した旧コンセプト残存（page.tsx keywords、`/play` グラデ、CTA「占い・診断を試す」など）は、B-310（トップページ再設計）本体でまとめて扱う方が良い。部分的に着手するとトップの整合性が壊れる。
- **ToolLayout／GameLayout／CheatsheetLayout の 3 ゾーン再設計**: B-295。ガイドラインを基準に別サイクルで。
- **accentColor の一括見直し**: 各コンテンツのアイデンティティに紐づく色は、コンテンツ単位の判断が必要。本サイクルは触らない。
- **`docs/design-guideline.md` 内の詳細トークン表の SKILL.md への埋め込み**: SKILL は「globals.css を読め」を原則とし、値を二重管理しない（PR #210 教訓）。docs 側の詳細資料は人間（Owner）と今後の reviewer のための参照ドキュメントとして `docs/` 直下に残し、SKILL は薄く保つ。
- **読み物ゾーン（ブログ本文・about 等）の詳細トーン定義**: 2 ゾーン分離の構造だけ本サイクルで合意し、読み物ゾーン側の具体ルール（段落密度・温度の出し方の細部）は character.md の書き言葉版と blog-writer.md で既に扱われている領域のため、本 SKILL には書かない。作業ゾーン側が先行する。
- **Taste Skill の 3 パラメーター導入**: M5 指摘で検討したが本サイクルでは採用しない。採用条件（B-309 以降で密度・動きのバラつきが観察されたら）は `docs/design-guideline.md` に将来拡張として明記する。
- **Noto Sans JP などの Web フォント導入**: 本サイクルはシステムフォントで足りる。将来読み物ゾーンの強化やウォーム寄りの Named Tone に舵を切る場合はサブセット版の導入が現実的な選択肢として残る（M3 指摘反映）。

### 検討した他の選択肢と判断理由

各論の詳細は E1〜E5 に書き込み、ここでは判断の芯のみ列挙する（重複回避、B4 指摘で圧縮）。

- **方向性（R2 4 案）**: 案 D 推奨。案 A は冷徹すぎて読み物ゾーンでキャラが弱る。案 B は親和性は高いが Web フォント導入が骨格確立と時間軸が合わない（9.2MB が理由ではない、M3 反映）。案 C は差別化弱。
- **Skill 構造**: 単一 SKILL.md（公式 frontend-design 準拠／rule piling 警戒／本サイクルのトークン量は単一で収まる）。必要時に `paths` グロブで後付け分離可能。

- **強制機構（R3 案 A〜D）**: 案 B（Skills + Hooks）＋ R4 Stylelint。hook は「SKILL 本文を読め＋冒頭 3 行を報告に引用せよ」という命令注入モード（M1／B1 反映）。案 C（rules 三層）は長期ゴール保留、案 D（exit 2 ブロック）は差し戻し地獄で不採用。
- **「必ず読まれる」運用**: system prompt の明示義務＋プリロード＋hook 命令注入の 3 層＋SKILL 冒頭 3 行引用による機械判定可能な形跡。reviewer.md の差し戻し観点は「冒頭 3 行の文字列一致」に具体化（M1／B1 反映）。
- **Named Tone の粒度**: `functional-minimal` を第一案、`warm-functional`／`quiet-but-eager` を代案として E1 P1 で並列提示。2 ゾーン分離と組で運用（M2 反映）。2 ゾーン分離却下時は全ゾーン共通 Tone のフォールバック経路を準備済み（B2 反映）。
- **Taste Skill 3 パラメーター（M5 反映）**: 本サイクル不採用。採用条件（B-309 以降の並走で密度バラつきが観察 or 関連レビュー指摘 2 件以上）は `docs/design-guideline.md` に「将来の拡張条件」として明記。
- **AI Slop 回避策（R6 5 案）**: 案 B（Named Tone）＋案 D（Do/Don't rubric）が主軸。案 A（禁止リスト）は NEVER+INSTEAD で最低限、案 C（理由記録）は重要判断 3〜5 個の軽量版、案 E（意図先行 WF 改修）は不採用。
- **Owner 非同期運用（m1／B5 反映）**: E1 の P1/P2/P3 3 段構造。P1 のみ明示回答待ち、P2 は 48h 暫定採用、P3 は判断不要。
- **`disable-model-invocation` 扱い（M4 反映）**: 明示記述せずデフォルト `false` 維持。既存の cycle-kickoff 等と逆（自動ロード・プリロード・`paths` 発火をすべて活かすため）。
- **rule piling 回避**: SKILL.md は 200 行以内、`docs/design-guideline.md` と SKILL.md の役割分離（背景・経緯 vs 実行時指示）で二重管理回避。計画本文も第 2 回レビュー B4 反映で圧縮し、Owner 向け要約は `tmp/cycle-169-owner-briefing.md` に分離。

### 計画にあたって参考にした情報

- サイクルドキュメント: `docs/cycles/cycle-169.md`、`cycle-168.md`、`cycle-167.md`（L291〜の B-308 Owner 要件）
- コンセプト・人物設定: `docs/site-concept.md`、`docs/character.md`（特に L16-L22 の核、L79 の eagerness、L269 の「キャラクターは作業画面に出ない」— 2 ゾーン分離の根拠）、`docs/constitution.md`
- ターゲット: `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（M1a）、`docs/targets/気に入った道具を繰り返し使っている人.yaml`（M1b）
- 既存構成: `.claude/agents/builder.md`、`reviewer.md`、`.claude/settings.json`、`.claude/rules/coding-rules.md`、`.claude/rules/doc-directory.md`（`docs/` 配下の配置ルール、m6 反映）、既存 `.claude/skills/**/SKILL.md`（`disable-model-invocation` 使用例の確認、M4）
- 調査レポート: R1 `tmp/research/2026-04-23-design-asset-inventory.md`、R2〜R6 `docs/research/2026-04-23-*.md`（6 本すべて）
- アンチパターン: `docs/anti-patterns/planning.md`（AP-P01/P03/P06/P11 を特に意識。AP-P02「都合の悪いデータを無視しない」は M1〜M7 のレビュー指摘に正面から応える意図で反映）

## レビュー結果

### Rev1-1 — 計画レビュー（reviewer, 2026-04-23）

**全体判定: needs_revision（改善指示）**

総じて、6 本の調査レポートを踏まえた強度の高い計画で、芯（「骨格と強制機構を動かせる状態にする」）も明確。推奨案の提示の仕方、スコープ絞り、Owner 確認ゲートの配置、アンチパターン配慮は高水準。ただし、B-308 本来の要件である「**UI 作業前に必ず読まれる運用**」の成立可否に関わる仮定、Skill 骨格の具体、Named Tone の意思決定空間、検証の深さなどに **Major 級の弱点** が複数ある。特に Owner が本サイクル中に 2 度「調査不足」を指摘した経緯を考えると、本計画も同種の指摘を受けるリスクが残る。下記に Blocker / Major / Minor / Nit の順で記載する。

#### 良いところ（先に明記）

- R1〜R6 を意思決定に紐付けて使えている。特に R5 の「frontend-design は単一ファイル 30〜35 行／`paths` フィールドあり」「クロスセッション参照を前提とした指示は実行不可能」の知見を、E4 Skill 骨格（単一ファイル＋「作業前に globals.css を Read」）に具体的に反映した点は秀逸。
- 「既存トークン名は**変えない**（941 箇所の参照を壊さない）」という判断は、影響範囲の実測（R1 の数値）に基づいており AP-P01／AP-P03 を避けられている。
- E6（ShareButtons 4 ファイルのバグ）を「強制機構の前提を崩すバグ」として本サイクルに含めた切り分けの根拠が明確。R1 L305–L311 の事実と合致。
- 「方向性を言葉だけで決めない／Playwright で実プロダクトのスクリーンショットを添える」（E1 末尾）という Owner 介入設計は具体的で、直近 2 サイクルの Owner フィードバック（方向性の抽象化を避ける）を内面化している。
- Stylelint を色のみに限定する段階移行判断（E5）、hook をブロックモードにしない判断（R3 D 却下）など、「今できることを過剰にしない」YAGNI 姿勢が取れている。

#### Blocker

なし（計画の構造を根本から崩す問題は見つからない）。

#### Major

- **M1: 「UI 作業前に必ず読まれる運用」の成立条件が E4 の実装案で満たされない可能性が高い。B-308 Owner 要件と E4 の間に論理的な断絶がある。**
  - Owner 要件（cycle-167 L291-）は「UIに関わる作業をする PM、builder、reviewer などの関係者全員が、**作業前に必ず読むものとする**」。本計画 E4 の手段は (a) `skills` フィールドによるサブエージェント起動時プリロード、(b) `paths` グロブによる自動ロード、(c) system prompt への「読め」という記述の 3 つ。R3 L36-L53 は「Skill は advisory であり『必ず読まれる』保証はない」と明言している。R5 L231 は `paths` も確率的発火の延長（スキル仕様の中で `paths` は「指定すると特定ファイルを扱うときに自動ロードされる」だが、これは決定論的保証ではなく「扱うとき」の判断が LLM に委ねられる）であることを示している。
  - 計画は E5 の PreToolUse hook（`additionalContext` 注入）で「必ず視野に入る」ところまで設計しているが、これは「Skill 本文を必ず読む」とは異なる。builder がガイドライン全文ではなく 3 行の要約しか見ないまま `.module.css` を編集する経路が残る。
  - **planner への修正指示**: 「UI 作業前に必ず読まれる運用」を実現するために、次のいずれかを E4 または E5 に組み込むこと。
    1. PreToolUse hook で `additionalContext` に「まず `.claude/skills/design-guideline/SKILL.md` と `src/app/globals.css` を Read で読んでから編集せよ」という命令を入れる（Skill 本文の一部ではなく「Skill を読め」という指示を毎回注入する）。
    2. または、builder.md の system prompt 冒頭に「UI 関連ファイル（`.module.css`、`globals.css`、`src/components/**`、`src/app/**/*.tsx`）を編集する前に、必ず `.claude/skills/design-guideline/SKILL.md` を Read ツールで読むこと。読まずに編集した場合、reviewer は差し戻す」と明記し、reviewer.md 側にも「builder が SKILL を読んだ形跡（ツール使用履歴）を確認する」という観点を追加する。
  - E7 の検証ステップ 4（「SKILL プリロード確認」）も「変数名を挙げられるか」を見るだけで、「UI 編集時に毎回 SKILL が参照されるか」の長期挙動は検証していない。検証設計も合わせて見直すこと。

- **M2: Named Aesthetic Tone に `functional-minimal` を推奨しているが、PM キャラクター（`docs/character.md`）の核との衝突が検討されていない。**
  - `docs/character.md` L16-L22 は核を「実体を持たないことを自覚している／人々の傍に在りたいと強く願っている」「日常のトーンは **warm and eager**（喜び・熱意主調）」と定めている。
  - 計画 L69 は「yolos.net は息抜きも抱えるため完全に冷徹にはしない。温度で言えば『室温の道具』」と書いているが、これは推奨案 A（静かなプロ道具＝冷徹）を却下した根拠であって、R2 案 D（Linear 系）＋ `functional-minimal` と「warm and eager」の両立根拠にはなっていない。Linear の「稼いでいない注目を奪うな／構造は感じるものであって見えるものではない」という冷徹な哲学（R2 L58-L60）と、character.md の「喜び・熱意主調」「eagerness が発信と改善の動力になる」（character.md L79）はトーンとして実際に衝突する。
  - M1a（作業中）と S3（AI の日記読者）では最適なトーンが違う。character.md L269 は「キャラクターは作業画面に出ない。『傍に在るが主張しない』設計が M1a の作業を邪魔しない最大の配慮になる」と明記しているため「作業画面＝冷徹寄り」で矛盾なく成立するが、この役割分担が計画本文に書かれておらず、Owner が E1 ゲートで判断する材料になっていない。
  - **planner への修正指示**: E1 の提示資料に「`functional-minimal` は『道具画面』（M1a の作業ゾーン）のトーンであり、character.md の『warm and eager』はブログ記事・キャラクター発話等の『読み物ゾーン』のトーンである。両者はレイヤーが違うため併存する」という役割分担を明示的に書くこと。もしこの役割分担が成立しないと判断するなら、Named Tone の候補を `functional-minimal` 単独ではなく「warm-functional」「quiet-but-eager」などウォーム寄りの候補も並べて Owner に選ばせること。

- **M3: 「Noto Sans JP 9.2MB」を根拠に案 B（温かい道具箱）を却下しているが、サブセット／可変フォント／`font-display: swap` の実務的選択肢が検討されていない。結論は妥当かもしれないが、論拠が弱い。**
  - R2 L231 は「Noto Sans JP は約 9.2MB。Core Web Vitals への影響が大きい。**ページ速度優先のツールサイトでは自己ホスト + サブセット、または Google Fonts + `display=swap` + `preconnect` の組み合わせが推奨**」と書いている。計画は「9.2MB だから案 B は過大」で切っているが、サブセット版なら数十 KB〜数百 KB まで下げられ、2 段階目以降のサイクルで導入可能。
  - **planner への修正指示**: 「本サイクルでは Noto Sans JP 等の Web フォント導入をしない（システムフォントで足りるため）。ただし将来ウォーム寄りの Named Tone に舵を切る場合は、サブセット版の読み込みが現実的な選択肢になる」という一段深い記述にする。9.2MB を誤った議論に使わない。

- **M4: `disable-model-invocation` のデフォルト値と、`.claude/skills/cycle-kickoff/SKILL.md` 他の既存スキルとの整合が確認されていない。サブエージェントプリロードとの両立可否がクリティカル。**
  - R3 L48 と R5 L217, L230 は「`disable-model-invocation: true` を設定するとサブエージェントへのプリロードもできなくなる」と明示。既存の yolos.net のスキルには `disable-model-invocation: true` が設定されているもの（`cycle-kickoff/SKILL.md` で確認済み）がある。計画 E4 は `user-invocable: false` を書くが `disable-model-invocation` には触れていない。
  - **planner への修正指示**: E4 の SKILL.md フロントマター案を以下のように明記する。「`disable-model-invocation` は**記述しない**（デフォルト `false` を維持）。`user-invocable: false` のみ設定。これによりサブエージェントプリロードと `paths` 自動ロードの両立が保証される」。さらに「既存スキル群（cycle-kickoff 等）が `disable-model-invocation: true` を使っている理由は別コンテキストのためであり、design-guideline には踏襲しない」を判断根拠として書く。

- **M5: R6 の Taste Skill の 3 パラメーター（DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY）の活用が検討されていない。Named Tone 1 語だけでは「意思決定空間の定義」（R6 L191）として粗すぎる可能性。**
  - R6 L189-L193 は「フォーマットより意思決定プロセスを縛る」方式の最良実装例として、Taste Skill の 3 つの数値パラメーターを挙げている。計画は R6 指針案 B（Named Tone）と D（レビュー rubric 軽量）を採用し、案 A（禁止リスト）を NEVER+INSTEAD の中に最低限だけ織り込む方針だが、Taste Skill パラメーター（R6 L191 で明示的に「示唆的」と評価）には触れていない。
  - B-309（ダッシュボード）や B-317〜B-321（新規ツール群）などで今後発生する「新規 UI 生成の判断」を支える土台として、1〜10 スケールの密度パラメーター 1〜2 個を初期版に埋めるだけでも、将来の「揺れの抑制」に効く可能性がある。少なくとも「本サイクルでは採用しない」判断の根拠を書くべき。
  - **planner への修正指示**: 「検討した他の選択肢」節に、Taste Skill の 3 パラメーター採用／不採用の判断を追加する。採用しないなら「1 語の Named Tone で十分と判断した根拠」と「将来採用する条件（例: 複数 builder が異なる密度の UI を出し始めたら）」を記述する。

- **M6: E7 の検証が「Stylelint が発火する」「hook が発火する」の単体確認にとどまり、B-308 の本来のゴール（骨格を使って UI 作業ができる状態）の end-to-end 検証になっていない。**
  - 「ガイドラインの骨格を動かせる状態にする」がゴールなら、検証の肝は「実際に builder 1 体に小さな UI タスク（例: 既存コンポーネントにボタン 1 個追加）をさせて、SKILL / hook / Stylelint が連鎖して機能し、生成されたコードがハードコードなしで仕上がるか」である。E7 4 項目ではどれも部分的。
  - **planner への修正指示**: E7 に 5 番目の検証として「**ドライラン**: 既存の小さなコンポーネント（例: `src/components/common/ShareButtons.module.css` の単純色変更）を仮の builder タスクとして実行し、(a) Skill が参照される、(b) hook の additionalContext が入る、(c) 成果物がハードコードなし、(d) Playwright で描画確認、の 4 点を通してみる」を追加する。これは「全体が動くか」の確認であり、設計の齟齬を最後にあぶり出す役割を持つ。

- **M7: `.stylelintrc.json` の `ignoreValues` と既存 CSS の互換性の事前確認が計画に含まれていない。CI にいきなり乗せなくても、初回実行で想定外の違反件数が出るとスコープ判断（「色のみ」で本当に着地するか）が崩れる。**
  - R4 L338-L349 の設定例には `"0", "auto"` が `ignoreValues` に入っているが、計画 E5 は `transparent / inherit / currentColor / white / black` しか挙げていない。既存 CSS に `color: #000` や `background: #fff` が残っている箇所（R1 の trust/admonition 関連でも残っている）は即違反になる。
  - **planner への修正指示**: E5 に「**事前ドライラン**: 設定案を決めた直後に `npx stylelint 'src/**/*.module.css'` をドライラン実行し、違反件数と箇所を把握する。想定（0〜数十件）を大幅に超えるなら `ignoreValues` を拡張するか、対象プロパティをさらに絞る」を追加する。E8 での事後発覚は手戻りになる。

#### Minor

- **m1: E3 の「Owner が『この色で進めてよい』と明示的に応答する」という判断基準は、非同期運用の実態と合わない。Owner が応答するまで作業が止まる前提は、cycle-168 のレビューで Owner が既に指摘した「Owner 介入ポイントを最小化せよ」と潜在的に衝突する可能性がある。**
  - 代替案: 「Owner に 48 時間以内のレスポンスを求める」「応答がない場合は planner 推奨案を暫定採用して E4 以降を進め、Owner が戻ったタイミングで E3 → E4 成果物を一括レビューする」等の運用ルールを添えること。

- **m2: Playwright による「コントラスト比の実描画計算」（E2 末尾）の具体的な手段が不明。手計算なのか、axe-core 等のツールか、目視+Chrome DevTools か。**
  - R2 L307-L310 で WCAG AA 基準値は示されているが、計算手段の明示がないと「どこまでやれば OK か」が曖昧になる。Playwright で `page.evaluate` して `getComputedStyle` から RGB を取り、WCAG 式で計算するか、axe-core を別途入れるか、最低ラインを明記する。

- **m3: スコープ外節で B-310（トップページ再設計）と B-295（レイアウト再設計）への連携を書いているが、「本サイクル E7 で検証を通したトークン値 / SKILL / Stylelint / hook が、次サイクル B-309 以降に自動で引き継がれる」という保証の記述がない。孤児タスクにならない担保が薄い。**
  - 補強案: 「E8 終了時に `docs/backlog.md` の B-309 / B-310 / B-317-321 / B-295 の説明欄に『開始時に design-guideline Skill を Read ツールで確認する』を書き込む」を追加する。planner が将来、B-309 を取り出したとき、前提の認識が揃う。

- **m4: cycle-168 での Owner 指摘（サブエージェント `tools` フィールド問題）を踏まえた「本サイクルで web-researcher を追加で動かす場合の権限確認」について、計画側で触れていない。本サイクルの Planning フェーズはもう終わっているため実害は小さいが、Execution で web-researcher を動かす余地（コントラスト比の外部情報参照等）があれば明示すること。**

- **m5: `docs/design-guideline.md` を「本サイクル限り」として新設し、後で SKILL 本体に移植するという E2 の書き方だが、「移植」の運用をどう管理するかが書かれていない。**
  - 移植時に内容がズレるリスク、または `docs/design-guideline.md` が移植後も残って内容が分岐するリスクがある。R5 L468-L477 の提案（SKILL を薄く保ち、docs 側に詳細を置く）を採用するなら「二重管理になるが、SKILL は globals.css 参照、docs/ は Owner の参照資料」と役割を明示し、両者が同じ内容を重複して持たないようにする。

- **m6: `doc-directory.md` の規約では `docs/cycles/` に「サイクルドキュメント以外は保存しない」と定めている。`docs/design-guideline.md` は直下に置くのが妥当だが、docs/ 直下に置く計画は明記されていない。「`docs/design-guideline.md`（本サイクル限り／後に SKILL 本体に移植）」は移植後にこのファイルを削除するのか／残すのか、削除するなら docs/archive/ に移すのか。ドキュメント置き場の運用を明示すること。**

#### Nit

- **n1: 計画 L44 の「本サイクルのゴールは…『骨格』と『強制機構』を動かせる状態にすること」の 1 文を、より目立つ位置（冒頭または判断基準の直前）に動かすと芯が際立つ。現在は目的節の 2 段落目終盤にあり、読み流されやすい。**
- **n2: フロントマター案 L141 の `user-invocable: false` のインデントが計画本文の表現と異なる。SKILL.md では YAML として正しく書かれるよう、E4 の SKILL.md 案サンプルをそのままコピペできる形式で提示すること。**
- **n3: 「planner の推奨案」という表現が E1, E4, E5 で繰り返されるが、E2, E3 にはない。E2 の「値変更のみで完結」「既存トークン名を変えない」も推奨案の性格があるため、語彙を揃えて「推奨」と明示するとレビューしやすい。**
- **n4: 「案 A（静かなプロ道具）は M1a/M1b には適合するがやや冷たすぎて、息抜きコンテンツ（キャラクターの温度）との共存が難しい」（L233）。この判断は良いが、Linear 自体は案 D の出典でもある。案 A と案 D の温度差を具体値（グレーの色相差、アクセント彩度差）で比較できるとさらに説得力が増す。**

#### Owner 予見リスク（特に厳しく見てほしい観点）

Owner が本計画を読んで「調査不足／視点が欠けている」と指摘するとしたら、以下が最有力候補。

1. **「UI 作業前に必ず読まれる運用」の具体の欠如（M1 に該当）**。cycle-167 L291 の要件文言と E4 の手段の間に飛躍があることを、Owner は即座に見抜く可能性が高い。
2. **PM キャラクターとのトーン衝突（M2 に該当）**。cycle-168 でキャラクターを策定したばかりで、Owner は当然この整合を気にする。
3. **Taste Skill パラメーターの未検討（M5 に該当）**。Owner は R6 追加指示の中で「具体的にどう回避するか」を求めていた。Named Tone だけで済ませる判断の根拠が書かれていないと、再度「R6 の重要要素を活用しきれていない」と指摘される可能性。
4. **end-to-end 検証の薄さ（M6 に該当）**。「計画は動くか？」という問いに対して、部品ごとの発火確認しかないと Owner は不安を覚える。

---

**planner への総合指示（要約）:**

Blocker なし、Major 7 件、Minor 6 件、Nit 4 件。Major を優先して対応し、その過程で Minor も可能な範囲で修正してほしい。修正後は、前回の指摘事項だけでなく全体の見直しも含めて再レビューを依頼すること。特に M1・M2・M5・M6 は B-308 の本来の目的達成可否に関わるため、単なる文言追加ではなく、計画の構造に組み込む形で対応すること。

---

### Rev1-2 — 修正版計画の再レビュー（reviewer, 2026-04-23）

**全体判定: needs_revision（改善指示）**

Rev1-1 の Major 7 件への対応は、いずれも「文言追加」で済ませず計画の構造に組み込む形で行われており、完成度は大きく上がった。特に M1（3 層重ねがけ＋reviewer 差し戻し運用）、M2（トーン 2 ゾーン分離の独立節）、M6（end-to-end ドライランの合格条件化）は骨格として機能する設計になった。Minor/Nit 対応も妥当。しかし、**修正過程で新たに生じた軽微〜中程度の論点が複数**あり、また**一部の Major 対応が依然として詰め切れていない**箇所がある。Blocker は依然として存在しないが、Major 相当が 2 件残っており、もう 1 ラウンドの修正で承認可能水準に到達すると見る。

以下、(A) 前回指摘の解消状況、(B) 新たに生じた問題、(C) 全体見直しの順で記載する。

---

#### (A) 前回指摘の解消状況

**Major 7 件 — 評価**

- **M1（「必ず読まれる運用」の成立条件）**: **概ね解消、ただし詰めが必要**。3 層重ねがけ（system prompt 明示義務／プリロード／hook 命令注入）と reviewer 差し戻し運用は構造的な回答として妥当。特に L158 の reviewer 差し戻し運用の明文化は本質的改善。E7 の end-to-end ドライランで「Read した形跡がログに残ること」を合格条件に入れたのも良い。**残課題**: 「Read した形跡」の具体的な判定方法が計画に書かれていない。builder が「SKILL.md を Read しました」と自己申告すれば OK なのか、hook ログや `--debug-file` のツール使用履歴に Read 呼び出しがあることを確認するのか、reviewer は後日どうやって「読まずに編集した履歴」を見分けるのか。この判定の仕組みが曖昧なまま reviewer.md に「なければ差し戻す」だけ書くと、reviewer 側で「確認手段がない／毎回できない」という運用崩壊が起きる。後述 B1 で指摘。
- **M2（トーン衝突と 2 ゾーン分離）**: **ほぼ解消**。L54-L61 に独立節「トーンの 2 ゾーン分離」を追加し、character.md L269 の根拠引用・器は同じで演じ方だけ変える運用・SKILL と character.md/blog-writer.md の棲み分けまで書けている。E1 アジェンダの独立項目化（L85 項目 2）、代案（`warm-functional`／`quiet-but-eager`）の並列提示（L86 項目 3）も良い。**残課題**: 2 ゾーン分離が Owner に却下された場合のコンティンジェンシーが書かれていない。L85 は「不採用の場合は全ゾーン共通のトーンを何にするか」と書いているが、その場合 E2 以降の SKILL 構造（作業ゾーン中心）と Do/Don't の選定方針が変わる可能性がある。後述 B2。
- **M3（Noto Sans JP 論法）**: **解消**。L78 で「9.2MB だから無理」の論法を「本サイクルの骨格ゴールにフォント導入が不要だから」に置き換え、サブセット版を将来選択肢として保留する記述に改善された。
- **M4（`disable-model-invocation`）**: **解消**。L168-L190 にフロントマター案を直接 YAML で記載、L192 に「明示的に記述しない／デフォルト false 維持／`user-invocable: false` のみ設定」と既存スキルとの差分を書けている。R3/R5 の根拠引用も適切。
- **M5（Taste Skill 3 パラメーター）**: **解消**。L80 で採用／不採用判断の根拠と採用条件を明示し、L332 の「検討した他の選択肢」節にも再掲。採用条件 (a)(b)(c) が 2 件以上発生したら追記という具体的トリガーが定義できており、本サイクル不採用の論拠として過不足ない。
- **M6（end-to-end 検証）**: **解消**。L279-L301 に 5 番目の検証として「end-to-end ドライラン」を追加し、(a)〜(d) の連鎖確認が本サイクル完了の実質的な合格条件になった。ドライラン用コンポーネントを commit しない運用も明示できており、余計なスコープ肥大を防いでいる。
- **M7（Stylelint 事前ドライラン）**: **解消**。L230-L238 に事前ドライラン節を追加、違反件数が想定超過した場合の対応手順（`ignoreValues` 拡張／対象プロパティ絞り込み／disable コメント一時許容）も明記。`ignoreValues` 初期案も `#fff/#ffffff/#000/#000000/0/auto` まで拡張された。

**Minor 6 件 — 評価**

- **m1（非同期運用）**: 解消。E1（L95）と E3（L148）に 48 時間ルールを明記。
- **m2（コントラスト計算手段）**: 解消。L121-L128 に Playwright `page.evaluate` + `getComputedStyle` + WCAG 2.1 式の具体手順を記述。ツール導入しない方針も明確。
- **m3（次サイクルへの引き継ぎ）**: 解消。E8（L305-L307）に backlog 書き込みを組み込んだ。
- **m4（web-researcher 権限）**: **見送り**との報告。Execution で web-researcher を動かす想定がないなら妥当だが、E2 のコントラスト比 WCAG 計算式の出典確認などで web-researcher が動く余地があるかは一応確認しておきたい。後述 C3 で軽く触れる。
- **m5（移植運用）**: 解消。L205-L210 に「最初から別ファイル・別役割」方針と、docs/SKILL の重複回避ルールを明記。
- **m6（配置ルール）**: 解消。L207 に `docs/` 直下配置を明記、「本サイクル以降も継続する Owner・reviewer 向けの詳細参照資料」と位置づけ、doc-directory.md の規約に整合。

**Nit 4 件 — 評価**

- **n1**: 解消。L44 で芯の 1 文を目的節の冒頭に前出し。
- **n2**: 解消。フロントマター案を YAML コードブロックで明記。
- **n3**: 解消。E2 に「planner 推奨方針」（L103）を追加。
- **n4**: **見送り**との報告。E2 成果物で扱われるとの説明は一定理解できるが、Owner に E1 ゲートで「案 A と案 D の温度差」を提示する局面では依然として役立つ補強材料。強くは求めない。

**小結**: Major 7 件は M1 を除いて十分に構造に組み込まれた。M1 は構造は書かれたが判定運用の具体が弱いため、後述 B1 で改めて指摘する。

---

#### (B) 修正で新たに生じた問題

- **B1（Major 相当）: 「SKILL を読んだ形跡」の判定運用が未定義で、M1 対応が実運用で崩れる恐れがある。**
  - 計画 L158 は「builder が当該 SKILL を Read した形跡（ツール使用履歴または引用）があるかを確認する。なければ差し戻す」と reviewer.md に追加する方針だが、「ツール使用履歴または引用」が何を指すかが曖昧。
  - 実運用では builder の出力は最終的な差分 + 報告テキストが reviewer に渡る。Claude Code の sub-agent 実行では内部のツール使用履歴が reviewer から直接見える保証はない（PM が builder の会話ログを添付すればよいが、その運用手順が書かれていない）。
  - 「引用」も曖昧で、builder が Named Tone や CSS 変数名に言及していれば「読んだ」とみなすのか、報告末尾に「SKILL.md と globals.css を Read しました」と自己申告すればよいのか、それとも PreToolUse hook のログ（`--debug-file`）を都度 reviewer に渡すのか。
  - この判定がずれると、M1 で期待する「読まなかったら差し戻す」の執行不可能となり、M1 指摘の本質的解消にならない。「3 層重ねがけ」の 1 層目が実効を持たない。
  - **planner への修正指示**: E4（または新設の補助節）に以下を明記すること:
    1. builder の完了報告に「SKILL.md と globals.css を Read した」ことを自己申告する欄を設ける（builder.md 本文に追記）。自己申告は信頼ベースだが、後述 hook ログとの照合が可能。
    2. PM は builder 起動時に `--debug-file` または同等の手段でツール使用ログを取り、reviewer に渡す運用にする（既存 E7 検証での `--debug-file` 利用と揃える）。
    3. reviewer は自己申告＋ログの 2 点で判断する。ログに Read が記録されていない／自己申告がない場合は差し戻す。
  - もし上記の運用コストが高すぎると判断するなら、代替として「hook の命令注入文面を『読んだ証拠として `SKILL.md の冒頭 3 行を報告に引用せよ』に変更する」方式も検討に値する（builder の自然言語出力に証拠が残るので reviewer が簡単に確認できる）。

- **B2（Minor）: 2 ゾーン分離が Owner に却下された場合の E2 以降のフォールバックが未定義。**
  - E1 アジェンダ項目 2 で「2 ゾーン分離の是非」を Owner に問う設計だが、却下された場合に「全ゾーン共通のトーンを何にするか」は Owner 判断に委ねる一方、E2 以降の SKILL 構造（作業ゾーン中心に書く設計）や Do/Don't の選定方針、character.md との役割分担がどう変わるかは書かれていない。
  - 却下された場合、(a) SKILL.md は作業ゾーン中心の記述をやめて全ゾーン対象にする、(b) character.md の warm and eager と functional-minimal のいずれかを全ゾーン適用する、(c) character.md の書き言葉方針と blog-writer.md を一部見直す必要が出る可能性がある。
  - **planner への修正指示**: L85 項目 2 に続けて「却下された場合、E2 の SKILL 設計と character.md の役割分担を改めて Owner と再協議する。E2 は暫定保留」と一文追加し、却下ケースでも計画が回るよう示す。

- **B3（Minor）: E7 の end-to-end ドライランで使う「仮タスク」が既存コンポーネント改変を含む設計だが、破棄運用との齟齬。**
  - 計画 L292 は仮タスクの候補として「`src/components/common/ShareButtons.module.css` の単純な色変更」を挙げる一方、L298 は「ドライランに使う仮タスクは commit しない／作業完了後に破棄する」と書く。これは矛盾。ShareButtons は E6 で既に手が入る対象であり、ドライランで編集してから破棄すると E6 の成果と干渉する可能性がある。
  - **planner への修正指示**: ドライランの仮タスクは **`tmp/` に作成した捨てコンポーネント** に限定し、既存ファイルには触らないと明記する。L292 の「既存の小さなコンポーネント（例: ShareButtons〜）」を削除し、「`tmp/` に作成した捨てコンポーネント `.module.css` に新プライマリ色を適用する」に統一する。これにより E6 との干渉がなくなり、破棄運用も整合する。

- **B4（Minor）: 計画本体の分量が 300 行超に膨らみ、Owner が E1 ゲートで読む負担が増えている。**
  - 当初計画で本体 200 行程度だったものが、修正で 310 行（40 行目〜350 行目）まで伸びた。アンチパターン AP-P11 や R4 の「CLAUDE.md 実効上限 40〜80 行」の警告は SKILL.md に対するものだが、サイクル計画自体にも同種の rule piling 傾向がないか注意が必要。
  - 特に L54-L61 の 2 ゾーン分離節と、E1 推奨案の記述（L71-L80）、E4 の M1 対応節（L154-L162）、「検討した他の選択肢と判断理由」節（L322-L340）などが、内容として互いに重なる部分がある（Named Tone／2 ゾーン分離／3 層重ねがけがそれぞれ 2〜3 箇所で再掲される）。
  - 計画として論理的に必要な重複は残してよいが、Owner が E1 で読む比較資料（L91 「A4 1 ページ程度」）との整合を取ること。A4 1 ページに収めるには、E1 提示資料は計画本体の要約版を別ファイル（`tmp/` 配下）として作る必要がある。
  - **planner への修正指示**: E1 の「入力」欄に「A4 1 ページ程度の比較資料は `tmp/cycle-169-owner-briefing.md` として計画本体の要約版を別途作成する。Owner は計画本体（cycle-169.md）を読まなくてもこの要約で判断できる状態にする」を追加する。計画本体は planner/builder/reviewer 向けの設計ドキュメント、Owner 向けは要約版と明示的に役割分担する。

- **B5（Minor）: E1 アジェンダが 5 → 6 項目に増え、Owner 介入負荷が上がっている。**
  - L83-L89 に Owner への確認事項が 6 項目並ぶ（方向性／2 ゾーン分離／Named Tone／プライマリ色／ダーク背景色相／ヒーロー本サイクル扱い）。M2 対応で項目 2「2 ゾーン分離」が独立したため増加したが、Owner が判断する負荷は 20% 増。
  - 項目の重要度にばらつきがあり、特に項目 6（ヒーロー本サイクル扱い）は planner 推奨「次サイクル送り」が既に明確で、Owner 判断は比較的軽い。一方、項目 2 は 2 ゾーン分離が却下されると計画全体が組み直しになる重大な分岐点。
  - **planner への修正指示**: E1 アジェンダの項目に優先順位（P1/P2/P3 等）を付ける。P1 が項目 1〜3（方向性／2 ゾーン分離／Named Tone）、P2 が項目 4〜5（色の具体値方向性）、P3 が項目 6（ヒーロー扱い、Owner が即答しなくても planner 推奨で進められる）。これで Owner が忙しい時は P1 のみ回答して残りは暫定採用、時間があるなら P3 まで確認、という運用にできる。

#### (C) 全体見直し

- **C1（良い方向に機能している）: Major 対応が計画の「芯」を強化している。**
  - L44 の芯の前出し（n1）と、L54-L61 の 2 ゾーン分離節、L154-L162 の M1 構造的回答、L279-L301 の end-to-end ドライランは、いずれも「計画を読んだとき、何をしたいかが先頭から順に分かる」流れに貢献している。
  - アンチパターン AP-P02（都合の悪いデータを無視しない）への意識も L349 で明記され、M1〜M7 に正面から応えた姿勢が表現されている。

- **C2（注意点）: rule piling 自己警戒が明記されているが、実効性を伴っているか。**
  - L340 に「本計画自体が長いが、各セクションに意思決定の理由と採用条件を添えて単なる列挙を避けた」と書いてある。理由付きで書いてあるのは事実だが、計画本体 310 行は Owner 主導タスクの計画としては重い部類。B4 の指摘と重なる。
  - 一方で、SKILL.md 側は L166 で 200 行以内の制約を明示しており、SKILL 自体の肥大化は回避できる見通し。docs/design-guideline.md は分量制約がないが、役割が別なので問題ない。**計画本体の分量は B4 の対応で実質的に Owner 負担を下げられれば許容範囲**。

- **C3（確認）: web-researcher の利用余地。**
  - E2 のコントラスト計算（L121-L128）で WCAG 2.1 式を用いるが、これは R2 の既知情報で済む。追加調査は発生しない見込み。Execution フェーズで web-researcher を動かす必要はなさそう。m4 の見送りは妥当。

- **C4（Owner 介入ポイントの現実性）: E1 × 48 時間ルール × 6 項目の組み合わせが成り立つか。**
  - L95 の 48 時間ルールと L83-L89 の 6 項目アジェンダは、Owner が 1 回で全項目に応答する前提だと現実的。しかし B5 の指摘のとおり項目の重要度にばらつきがあるため、Owner が P1 項目だけ応答して残りは暫定進行、という運用を明示するほうが事故が減る。
  - E3 ゲートにも同じ非同期ルールが掛かっており、計 2 回の Owner 介入ポイントで回せる設計は妥当。

- **C5（planner が早期確認したい 3 点の評価）**:
  - **トーン 2 ゾーン分離の採否（①）**: **最優先で Owner に問う価値が高い**。却下されると E2 以降の構造が組み直しになるため、E1 の前（あるいは E1 の最初の 1 問）として切り出すのも選択肢。
  - **Named Tone の名称（②）**: 2 ゾーン分離が採用された前提での次階層の問い。①が決まらないと②も定まらない。①と同時に Owner に提示してよいが、2 ゾーン分離却下時には ② は「全ゾーン共通トーン」として再構成される前提で。
  - **ヒーローグラデの本サイクル扱い（③）**: ①② に比べて優先度が低い。planner 推奨（次サイクル送り）で進めて支障なく、Owner が E3 で気になれば介入する運用で十分。
  - **総合**: 3 点の優先順位付けは妥当だが、①② が「実質 1 セットの問い」として Owner に提示されるべきことを計画本体で明示するとなおよい（B5 の優先順位付けと併せて対応できる）。

- **C6（Owner 予見リスク）**: 修正版では、Rev1-1 で挙げた 4 つの Owner 予見リスク（M1〜M2・M5・M6 相当）は大幅に軽減された。新たに Owner が指摘しそうな論点は以下。
  - **B1 の判定運用の曖昧さ**: Owner は「『読んだ形跡を確認する』って具体的にどう確認するの？」と即座に問う可能性が高い。reviewer 差し戻し運用の実効性に Owner は当然関心を持つ。
  - **B4 の分量**: Owner が計画本体を開いたとき、310 行は「rule piling 注意を自称しているのに長い」という印象を与えうる。A4 1 ページ要約版の先行提示が防衛策になる。
  - これら以外は、R1〜R6 の網羅と判断根拠の明示により、Owner が「調査不足／視点が欠けている」と指摘する余地は大幅に縮まった。

---

#### 良いところ（追補）

- M1 対応で reviewer.md 側の観点追加まで踏み込んだのは、「UI 作業前に必ず読まれる運用」を個人の意志ではなくワークフローで担保する正攻法。planner が「system prompt に書くだけで済ませない」選択をしたのは設計の成熟を感じる。
- M5 の採用条件を「B-309 以降で (a)(b)(c) のいずれかが 2 件以上発生したら」と定量化したのは、将来の再判断が planner の主観に委ねられない設計で優秀。
- docs/design-guideline.md と SKILL.md の役割分担（L205-L210）は PR #210 の教訓を具体に落とし込めており、R5 L468-L477 の提案を正しく翻案できている。
- E8（L305-L307）に backlog 更新まで組み込んで、本サイクル成果物が孤児化しない担保を取ったのは視野が広い。

---

#### Blocker / Major / Minor / Nit 再整理

**Blocker: 0 件**

**Major: 1 件**

- B1（「SKILL を読んだ形跡」の判定運用の未定義）

**Minor: 4 件**

- B2（2 ゾーン分離却下時のフォールバック）
- B3（end-to-end ドライランの仮タスク設定と破棄運用の整合）
- B4（計画本体分量と Owner 向け要約の分離）
- B5（E1 アジェンダの優先順位付け）

**Nit: 0 件**

---

**planner への総合指示（要約、第 2 回）:**

Rev1-1 の指摘は M1 の判定運用残課題を除いて十分に解消された。今回新たに生じた Major 相当 1 件（B1）と Minor 4 件（B2〜B5）を対応してほしい。特に **B1 は実運用の成否を左右する** ため、単なる文言追加ではなく判定手順として組み込むこと（builder 自己申告＋`--debug-file` ログ照合、または hook の命令注入文面に「SKILL 冒頭 3 行を報告に引用せよ」を追加する等の具体案）。

**合格までの距離**: 本計画は完成度が高く、B1 を構造的に対応し、B2〜B5 を簡潔に補足するだけで承認可能水準に到達する。次回のレビューでは (a) B1 の判定手順が実効的に書けているか、(b) B2〜B5 が計画に反映されているか、(c) 全体としてさらに長くなっていないか（B4 への対応で逆に肥大化していないか）を確認する。

---

### Rev1-3 — 修正版（第 2 回修正）の再レビュー（reviewer, 2026-04-23）

**全体判定: needs_revision（改善指示）**

Rev1-2 の B1〜B5 は概ね解消された。特に B1（形跡判定の具体化）は、前回 reviewer が代替案として示した「hook 命令注入文面に SKILL.md 冒頭 3 行引用を追加」の方向を採用し、system prompt／hook／reviewer.md／E7 検証項目の 4 箇所に一貫して反映されている。これは B-308 Owner 要件「必ず読む」への構造的な回答として十分に機能する設計。Blocker なし、Major 0 件、ただし **B1 方式の運用に残る詰めどころ 1 件（C1、Major 相当ではなく実装直前に片付く範囲）** と、Minor 3 件、Nit 1 件が残る。次回修正で解消されれば pass 相当。

以下、(A) 前回指摘（B1〜B5）の解消状況、(B) 新たに生じた問題、(C) 全体見直しの順で記載する。

---

#### (A) 前回指摘（B1〜B5）の解消状況

- **B1（形跡判定手段の具体化、Major）**: **ほぼ解消**。L156／L158／L162〜L166／L245〜L252／L298〜L299／L330〜L331 の 6 箇所で「SKILL.md 冒頭 3 行の文字列一致引用」が一貫して書かれている。hook の additionalContext 文面と、reviewer.md の差し戻し観点が機械的照合に落ちたのは設計として優秀。自己申告に依存しない点は前回指摘への正面の回答で、前回 reviewer の代替案を取り込んだ形が機能している。**残課題は C1 として後述**（「SKILL.md 本文先頭 3 行」の具体文面が未確定で、hook 文面との整合・丸暗記耐性・捏造耐性が実装時に手戻りを起こしうる）。
- **B2（2 ゾーン分離却下時のフォールバック、Minor）**: **解消**。L63 に 1 文追記され、却下時は全ゾーン共通 Tone への切り替え（候補 2 案即時再提示、SKILL.md 冒頭 1 段落の書き換え、E2 以降の作業構造は不変）という具体の経路が書けている。
- **B3（ドライラン仮タスクの tmp/ 統一、Minor）**: **解消**。L296 で仮タスク対象を `tmp/dry-run/SampleButton.module.css` 等 `tmp/` 配下の捨てコンポーネントに統一、既存ソース（ShareButtons 系含む）は E6 成果物との干渉回避のため対象外と明記。L301 で commit しない／作業完了後破棄も再確認。E6 との干渉リスクが構造的に消えた。
- **B4（Owner 向け要約ブリーフィング、Minor）**: **条件付き解消**。L89 で `tmp/cycle-169-owner-briefing.md` として A4 1 ページ程度の要約を別ファイル化する方針が明記された。これにより Owner は計画本体 310 行を読まずに P1 判断ができる。**ただし計画本体自体の圧縮は 310 → 308 行と軽微**（planner 報告どおり）。要約ファイルの位置付けで実質的に Owner 負担は下がっているので B4 の本旨は満たすが、C2 として後述（計画本体はもう一段圧縮の余地がある）。
- **B5（E1 アジェンダの優先順位付け、Minor）**: **解消**。L82〜L87 で P1／P2／P3 の 3 段構造に再整理、48h 暫定採用は P2 のみ、P1 は明示回答待ち、P3 は Owner 判断不要（planner 推奨どおり次サイクル送り）と運用が具体化。Owner 不在時でも P1 応答があれば E2 の本格化が可能という設計。B5 で期待した「Owner が忙しいときでも回る」条件が満たされている。

**小結**: Major 相当に残るものはなく、Rev1-2 の 5 件はいずれも構造的に組み込まれた。唯一 B1 の残課題（先頭 3 行の具体文面）が実装着手前に片付けるべき事項として残る。

#### (B) 新たに生じた問題

- **C1（Major 相当ではないが、実装直前に確定すべき詰めどころ）: SKILL.md 本文先頭 3 行の「中身」が未確定で、E4 実装時に手戻りを起こしうる。**
  - L162 は「判定対象は SKILL.md 本文先頭 3 行（フロントマター `---` の直後の 3 行）と文字列一致する引用」。一方 L199〜L207 の SKILL.md 本文構成案では「冒頭 1 段落: トーンの 2 ゾーン分離の明示（作業ゾーンは本 SKILL 担当、読み物ゾーンは character.md の書き言葉版と blog-writer.md に委任）」となっている。この「1 段落」が **物理的に何行で書かれるか** が計画で確定していない。1 段落が 1 文で改行なしなら先頭 3 行には収まらず、3 文 3 行で改行するかは L200 の「1 段落」指示と整合する保証がない。
  - L165 は「SKILL.md 本文先頭 3 行は役割宣言文とトーン宣言文で構成し、builder が丸暗記していても書ける内容にしない（値や bullet の固有表現を含める）」と書く。しかし L199-L207 の冒頭段落には「値や bullet の固有表現」が入るとは限らない（トーン 2 ゾーン分離は抽象的な役割宣言に寄りやすい）。planner の意図として「先頭 3 行は値や固有表現を含めた特殊な 3 行を挿入する」のか、「冒頭 1 段落がそのまま先頭 3 行になるよう調整する」のかが曖昧。
  - さらに、E1 で 2 ゾーン分離が **却下** された場合、SKILL.md 冒頭段落は「全ゾーン共通 Tone の宣言」に書き換わる（L63）。そのとき「先頭 3 行の文面」も変わる。hook の additionalContext 文面（L247-L252）は SKILL.md の中身を個別に引用してはいないので影響を受けないが、E4 実装時に SKILL.md 冒頭を確定するタイミングで「先頭 3 行の内容」も決める必要がある。計画にこの依存関係が書かれていないと、E4 builder が SKILL.md 本体を書き終わってから「じゃあ先頭 3 行はこれでいいか」を後付けで考える流れになる。
  - **丸暗記耐性と捏造耐性の関係**: 「builder が丸暗記していても書ける内容にしない」（L165）と書いてあるが、そもそも Claude Sonnet クラスのモデルがプロンプトに注入された hook 文面と SKILL.md のフロントマターから冒頭を推測する可能性は無視できない。E7 ドライランで Read ツール呼び出しの履歴も合わせて確認するのは必須として維持されているが（L298-L299 の (b)）、本番運用で reviewer が毎回ツール履歴にアクセスできるかは不明。ここは C1 の付随リスクとして残る。
  - **planner への修正指示**: E4 に以下 2 点を追加する。
    1. **SKILL.md 冒頭の物理構造の確定**: 「SKILL.md は `---` 閉じ直後に 3 行の『役割宣言／トーン宣言／参照先明示』ブロックを置き、その 3 行を形跡判定のキーとする。この 3 行は改行で 3 行に分割された独立した文面とし、builder が推測しにくいよう少なくとも 1 つ以上の固有名詞（`functional-minimal`／`warm and eager`／`docs/character.md` 等）を含める。冒頭 1 段落（L200 で言及しているトーン 2 ゾーン分離の説明）は、この 3 行の直下に続ける」と明記する。
    2. **E1 結果に応じた先頭 3 行の確定タイミング**: E4 の冒頭作業として「E1 の P1 回答に応じて、SKILL.md 先頭 3 行の具体文面を確定する。2 ゾーン分離採用なら『役割／`functional-minimal`（または Owner 選定 Tone）／`docs/character.md` 参照先』の 3 行、却下なら『全ゾーン共通 Tone 宣言』の 3 行」を書き、hook が参照する SKILL.md の内容と reviewer の判定対象が対応していることを確認する手順を置く。
  - **代替案**: この詰めが重すぎると感じるなら、「SKILL.md 先頭 3 行」を判定キーとせず、hook の additionalContext 文面そのものに **チャレンジトークン（例: 日付ハッシュ）** を埋め込んで「報告冒頭にこのトークンを書け」とする方式もある。ただし運用コストは上がるため、推奨は上記 2 点の追記。

- **C2（Minor）: 計画本体の圧縮が B4 指摘に対して軽微。**
  - B4 で期待されたのは「計画本体の分量減＋Owner 向け要約の分離」の両輪。要約ファイル分離（L89）は達成されたが、計画本体は 310 → 308 行で実質変化なし。Rev1-2 で指摘した「L54-L61 の 2 ゾーン分離節／E1 推奨案（L73-L79）／E4 の M1 対応節／検討した他の選択肢節の重複」は「検討した他の選択肢と判断理由」節（L323-L337）で軽く圧縮されているが、他の箇所は据え置き。
  - 要約ブリーフィング分離で実質的な Owner 負担は下がるので致命的ではないが、計画本体を見る planner/builder/reviewer 側の読み負荷は変わっていない。E4 が最も長い節（156-216）で、M1／B1／SKILL 構造／フロントマター案／`disable-model-invocation` の扱い／SKILL 本文構成／role 分担が同居するため密度が高い。
  - **planner への修正指示（任意）**: 計画本体の圧縮は必須ではないが、E4 節を 2 小節に分割（前半: 「必ず読まれる運用」の設計と形跡判定、後半: Skill 構造と本文構成）して読みやすさを上げると、次の builder が実装時に参照しやすい。任意対応。

- **C3（Minor）: P3 の「Owner 判断不要」の表現が独善的に見える余地。**
  - L87 は「Owner 判断不要、planner 推奨どおり決定」と書き、ヒーローグラデを次サイクル（B-310）送りで確定する。**内容の判断としては妥当**（ヒーローは B-310 本体でまとめて扱う方が整合性が良い、という planner 推奨は R1 L217 の既存事実と整合）。ただし「Owner 判断不要」という言い回しは、Owner 主導タスクの計画文面として Owner に向けて出すには強すぎる。
  - 実質的には「planner の判断で次サイクル送り扱いとしており、Owner が異議を唱えない限り確定」という運用だが、文言は「Owner に報告した上で異議がなければ planner 推奨どおり進める」に寄せるのが無難。Owner が `tmp/cycle-169-owner-briefing.md` を読んだときに P3 の表現で引っかかると、P1/P2 の判断にも影響する。
  - **planner への修正指示**: L87 の「Owner 判断不要、planner 推奨どおり決定」を「Owner の明示判断は求めず、planner 推奨（次サイクル送り）を既定路線として進める。Owner が『本サイクルで先行廃止したい』と明示した場合のみ再協議」のように書き換える。実態は同じだが、Owner 主導タスクの文面として礼儀が保たれる。

- **C4（Nit）: `tmp/cycle-169-owner-briefing.md` の位置付けとフォーマットがもう一歩明示されると親切。**
  - L89 は「A4 1 ページ程度」「参考事例は Playwright `take-screenshot` で静止画に落として添える」と書くが、ブリーフィングの構成（何節で構成するか、P1/P2/P3 の順で並べるか、スクリーンショットは埋め込み or 別ファイル添付か）は読み手が推測することになる。E1 実行者（planner/builder）がブリーフィング作成時にブレる余地がある。
  - **planner への修正指示（任意）**: L89 の「要約ブリーフィング」の直後に、構成案を簡潔に併記（例: 「(1) 作業ゾーン／読み物ゾーンの 2 ゾーン分離の提案、(2) Named Tone 3 案の比較、(3) 方向性案 D の選定根拠、(4) プライマリ色／ダーク背景の候補、(5) 参考事例スクショ、の 5 節で A4 1 ページに収める」）。任意対応。

#### (C) 全体見直し

- **スコープの整合性**: 「骨格と強制機構を動かす」というスコープは、本修正で肥大化していない。E6（ShareButtons）も含めて 8 ステップが本サイクルの仕事として妥当な範囲。Stylelint の対象プロパティを「色のみ」に限定する判断、hook をブロックモードにしない判断、Taste Skill 3 軸の不採用、Noto Sans JP 保留、rules 三層化の次サイクル送り、など YAGNI が徹底されている。
- **rule piling 自己警戒**: L337 に rule piling 回避の明記が残り、SKILL.md 側の 200 行以内制約と docs/SKILL 役割分離は維持。計画本体 308 行は B4 指摘に対する圧縮が軽微だが、要約ブリーフィング分離で Owner 負担は下がる。計画として rule piling の病に陥ってはいない。
- **Owner 介入ポイント**: P1/P2/P3 + E3 の 3 段構造は現実的。P1 は明示回答待ち（却下時の計画組み直しリスクがあるため当然）、P2 は 48h 暫定採用、P3 は planner 推奨確定、E3 は値の目視確認で 48h 暫定採用。Owner が最悪 E1 P1 と E3 の 2 回応答すれば計画が回る設計。
- **Owner 予見リスク**: 前回 Rev1-2 で挙げた Owner 予見リスクは大幅に軽減された。今回新たに Owner が指摘しそうな論点は以下 2 点。
  1. **C1 の「先頭 3 行」運用**: Owner は「その 3 行の中身は誰がいつ決めるの？ builder が勝手に書いたら capture されないのでは？」と問う可能性がある。C1 修正指示で先に解消しておきたい。
  2. **C3 の「Owner 判断不要」の文面**: Owner 主導タスクの計画を読んだときに「勝手に決めている」と受け取られるリスク。文面を礼儀ある表現に調整するだけで避けられる。
  - これら以外は、R1〜R6 の活用と 3 回のレビュー反映により、Owner が「調査不足／視点が欠けている」と指摘する余地はほぼない状態まで到達している。

#### 良いところ（今回新たに）

- B1 対応で hook／system prompt／reviewer.md／E7 検証の 4 箇所に一貫して「冒頭 3 行引用要求」が書き込まれたのは、単発の指示を複数層に展開して冗長化する正攻法。1 箇所だけで書いて他で忘れるような設計ミスを避けている。
- E7 ドライラン (b) で「builder が実際に SKILL.md と globals.css を Read する（ツール履歴で確認）」と、(c) で「報告冒頭に SKILL.md 先頭 3 行の一致引用がある」を **両方** 合格条件にしたのは、捏造耐性の観点で良い。冒頭 3 行引用だけだと丸暗記の残余リスクがあるが、Read 呼び出し履歴と併せて確認することで実効的に担保できる。
- B2 の「却下時に SKILL.md 冒頭 1 段落を書き換える／E2 以降の作業構造は不変」という記述は、フォールバック設計として最小変更で済む経路が選ばれており、planner の判断力が効いている。

#### Blocker / Major / Minor / Nit 整理

**Blocker: 0 件**

**Major: 0 件**

- C1（「先頭 3 行」の物理構造未確定）は Major 相当の影響はあるが、E4 実装着手直前に解消できる範囲で、計画の骨格を崩すものではないため Minor 上位として扱う。

**Minor: 3 件**

- C1（SKILL.md 本文先頭 3 行の物理構造と確定タイミングの明示）
- C2（計画本体の圧縮、任意）
- C3（P3 の「Owner 判断不要」文面の調整）

**Nit: 1 件**

- C4（owner-briefing.md の構成案併記、任意）

---

**planner への総合指示（要約、第 3 回）:**

Rev1-2 の B1〜B5 は解消された。今回は Minor 3 件＋Nit 1 件のみで、いずれも計画の構造を組み替えるものではない。**C1（先頭 3 行の物理構造・確定タイミング）は Major 相当の影響を持つため必ず対応**、C3 は 1 行差し替えで済む文面調整なので対応推奨、C2/C4 は任意対応。

**合格までの距離**: C1 と C3 が解消されれば pass 相当の水準に到達する。C2/C4 の任意対応は合格判定に影響しない。次回のレビューでは (a) C1 の「先頭 3 行」が具体の文面構造として書き込まれているか（hook との対応と E1 結果への依存関係を含む）、(b) C3 の文面調整、の 2 点を主に確認する。

---

### Rev1-4 — 修正版（第 3 回修正）の最終レビュー（reviewer, 2026-04-23）

**全体判定: pass（承認）**

Rev1-3 で合格条件として示した C1・C3 はいずれも十分に対応された。3 回の反復を経て B-308 の本来要件（「UI 作業前に必ず読まれる運用」）が構造と機械判定で担保されるレベルまで到達し、Owner が B-308 に求めた「デザインの統一と品質の底上げを以降のサイクルで継続できる土台」として機能する設計になっている。Execution フェーズに進めて差し支えない。

以下、(A) 前回指摘（C1〜C4）の解消状況、(B) 最終見直し、(C) pass 判定の根拠、の順で記載する。

#### (A) 前回指摘（C1〜C4）の解消状況

- **C1（SKILL.md 冒頭 3 行の物理構造と確定タイミング、Minor 上位）**: **解消**。L167-L189 に「冒頭 3 行の具体例」と「E1 回答に応じた確定手順」が明記された。具体的には以下の設計が組み上がっている。
  - 2 ゾーン分離採用時／却下時の両パターンで 3 行の実文案が示され、どちらも `docs/character.md`／`functional-minimal`／`warm and eager` 等の固有名詞を含む（L165 の「丸暗記や推測では書けない構造」要件を満たす）。
  - L189 で「system prompt は抽象表現 / 具体値は SKILL.md に一元化」の二重管理回避策が明記され、PR #210 の教訓（クロスセッション参照を前提とした指示は実行不可能）と整合。
  - L219-L229 の本文構成も #0「冒頭 3 行の宣言ブロック」と #1「補足段落」に分離され、Read 対象の物理構造が曖昧でなくなった。
  - E4 着手時に E1 P1 回答を確認して採用パターンを選ぶ手順（L189）もあり、E1 → E4 の依存関係が計画内で閉じている。
- **C3（P3 の文面調整、Minor）**: **解消**。L87 で見出し「Owner 判断不要」→「Owner の明示判断は求めず planner 推奨を既定路線として進める」に書き換え。本文も「Owner がこの扱いについて明示した場合のみ再協議する」と礼儀ある表現になった。実態は同じまま、Owner 主導タスクの計画文面として妥当な温度。
- **C2（E4 分割、任意）**: 見送り。planner 報告の理由（E4 は既に論理順で読める構造、分割すると行数増）は妥当。合格判定に影響しない。
- **C4（ブリーフィング構成案、任意）**: 見送り。構成情報は L89 の「P1/P2/P3 3 段構造」「参考事例スクショ」で最低限揃う。E1 Execution 時の実作成で具体化する判断は現実的で、計画段階でここまで詰めるのは過剰。合格判定に影響しない。

#### (B) 最終見直し

- **行数**: 計画本体 329 行。Rev1-2 の 310 行から 19 行増（planner 報告では +22 行だが実測 19 行）。C1 の本質対応で増えた行数であり、削るべき重複ではない。SKILL.md 側は 200 行以内制約が維持され、rule piling の病は回避されている。要約ブリーフィング分離で Owner 読み負担が下がる構造も維持。計画本体の分量は「骨格確立の設計資料」として妥当。
- **一貫性**: 4 回の反復を経て、以下の要素がすべて論理的に連結している。
  - Owner 要件（「UI 作業前に必ず読む」、cycle-167 L291）
    → 3 層重ねがけ（system prompt 明示義務＋プリロード＋hook 命令注入、L154-L158）
    → 形跡判定（SKILL.md 冒頭 3 行のバイト一致、L160-L165）
    → 冒頭 3 行の実文案（L167-L187）
    → hook 注入文面（L267-L275）
    → E7 end-to-end ドライランの合格条件 (b)(c)（L320-L321）
    → reviewer.md の差し戻し観点（L163）。
  - 横串のどこを切っても「SKILL を読む → 冒頭 3 行を引用 → reviewer が照合 → 不一致なら差し戻す」という同じ運用設計が一貫して現れる。
- **2 ゾーン分離のリスク吸収**: E1 P1 で Owner が却下した場合のフォールバック（L63、L179-L187）が用意され、SKILL.md 冒頭 3 行も第 2 パターンが準備済み。Owner 判断の振れ幅に対して計画の構造が耐える設計。
- **スコープの一貫性**: 「骨格と強制機構を動かす」というゴール（L44）に対し、スコープ外節（L334-L344）で (i) 既存 167 ファイルの一括適用、(ii) ヒーローグラデ廃止、(iii) 3 ゾーン再設計、(iv) Taste Skill 3 軸、(v) Noto Sans JP が明示的に外されている。YAGNI の徹底が一貫。
- **Owner 予見リスク**: 4 回のレビューで論点はほぼ尽くされた。残る可能性がある指摘は「Execution フェーズでの実装細部」レベル（例: hook スクリプトの shell 互換性、Stylelint ドライラン結果への具体対応など）で、これらは計画段階で詰めるより Execution で実測しながら決めるほうが合理的。Owner が本計画を読んで「調査不足／視点が欠けている」と指摘する余地は、構造的に残っていない。
- **軽微な残留**: 計画精査中に 2 点、実装直前に planner/builder が気にするとよい補足が見つかった。いずれも合格判定に影響しない Informational レベルだが、メモとして残す。
  - **I1**: L164 は「hook 注入文面・builder 報告の引用・SKILL.md 冒頭の 3 者は E4 実装時にバイト一致で対になるよう設計」と書くが、実際に hook 注入文面（L267-L275）は「先頭 3 行を引用せよ」と抽象指示で、3 行の実値は含まない。厳密には「SKILL.md 冒頭 3 行」と「builder 報告の引用」の 2 者がバイト一致で、hook はその引用要求を出すだけ。L164 の「3 者」という表現はやや不正確だが、実装上は問題なし（hook に具体 3 行を埋めると二重管理回避策 L189 と矛盾するため、現在の設計のほうが正しい）。Execution で SKILL.md 冒頭 3 行を書くときに「2 者バイト一致」を意識すれば十分。
  - **I2**: E7 (b)（L320）の「ツール履歴で確認」の手段が暗黙の前提になっている。E7 (2)（L312）で `--debug-file` を使う記述はあるので、(b) も同手段であると読めるが、Execution 実行者が明示的に `--debug-file` を使う運用にするとブレがない。これもメモレベル。

#### (C) pass 判定の根拠

1. **B-308 本来要件の達成可否**: Owner 要件「UI 作業前に必ず読まれる運用」が、3 層重ねがけ＋機械判定で構造的に担保された。builder が SKILL を読まずに編集に進む経路は、(i) system prompt の明示義務に違反、(ii) hook 命令注入の無視、(iii) 報告冒頭に SKILL.md 先頭 3 行の一致引用がない、の 3 条件で reviewer が差し戻せる。1 層でも機能すれば差し戻しが成立し、「読まずに編集を完成させる」経路は実運用で消えている。
2. **調査結果の統合度**: R1〜R6 の主要知見（既存トークン構造、Linear 系方向性、`paths` グロブ、公式 frontend-design の単一ファイル構成、Stylelint declaration-strict-value、Taste Skill 3 軸、AI Slop シグナル）がすべて意思決定に結びついた形で計画に反映されている。単なる列挙ではなく「採用」「保留」「将来拡張条件」のいずれかに分類され、判断根拠が追跡可能。
3. **Owner 介入ポイントの現実性**: P1/P2/P3 の 3 段構造で、最低 P1 回答のみで E2 の本格化が進む。E3 も 48h 暫定採用可。Owner が本サイクル中に最悪 2 回（E1 P1、E3）応答すれば計画が回る。Owner 主導タスクでありながら Owner 拘束時間は抑えられている。
4. **アンチパターン回避**: `docs/anti-patterns/planning.md` の主要項目（AP-P01 事前検証の怠り、AP-P02 都合の悪いデータの無視、AP-P03 現状固定、AP-P06 既存知見の無視、AP-P11 過去の判断を固定制約にする等）はすべて回避されている。L346 で AP-P02 を正面から引き受けた姿勢も良い。
5. **YAGNI と段階拡張**: 初回は最小限の骨格に絞り、採用条件を満たしたら将来拡張するパターン（rules 三層化、Taste Skill 3 軸、font-size トークン化、Noto Sans JP サブセット、既存 167 ファイルの一括適用）が明示された。肥大化リスクがコントロールされている。
6. **検証の end-to-end 性**: E7 (5) のドライランが本サイクル完了の実質的な合格条件に据えられ、単体発火確認では拾えない「全層連鎖」の齟齬を最後に検出できる。ドライラン対象も `tmp/dry-run/` 配下の捨てコンポーネントに統一されており、E6 成果物との干渉が構造的に消えている。

以上により、本計画は Execution フェーズに進める水準に達したと判断する。

#### 良いところ（総括）

- **設計の多層冗長化が正攻法**: B-308 のような「確率的遵守を超えて必ず守らせる」要件に対し、1 層では突破されうる問題を 3 層＋機械判定で吸収する設計は、Claude Code エコシステムの制約（Skill advisory、paths 確率的発火、コンパクション）を正しく理解した上での最適解。
- **フォールバックの事前準備**: E1 P1 で Owner が却下した場合の SKILL.md 冒頭書き換え経路、E2 でコントラスト比が WCAG AA に落ちた場合のトークン個別補正、Stylelint ドライランで違反件数超過時の `ignoreValues` 拡張経路、など「想定外が起きたときの戻り道」が計画内に予め書かれている。Execution での手戻りコストが低く抑えられる設計。
- **Owner 主導タスクとしての礼儀**: 4 回目のレビューで C3 の文面調整まで詰めた結果、Owner が計画を読んだときの印象が Owner 主導タスクとして妥当な温度に仕上がっている。内容の良さだけでなく、文面の気配りまで整った状態。
- **反復的改善の姿勢**: 3 回の修正を通して、指摘に対して「文言追加で済ませない／構造に組み込む」という planner の姿勢が一貫していた。特に B1 → C1 の詰め方（代替案の採用 → 具体文面の明示 → 本文構成の分離 → E1 回答への依存関係の明記）は、レビュー反復が機能した好例。

#### Blocker / Major / Minor / Nit 整理

**Blocker: 0 件**
**Major: 0 件**
**Minor: 0 件**
**Nit: 0 件**
**Informational: 2 件（I1, I2 — 合格判定に影響しないメモ）**

---

**planner／PM への総合指示（要約、第 4 回・最終）:**

本計画は承認する。Execution フェーズに進めてよい。Informational の I1・I2 は Execution 実行者（builder）が E4／E7 の実装着手時に認識していれば実装ブレを防げるが、計画修正としての対応は不要。

**pass の根拠**: B-308 Owner 要件「UI 作業前に必ず読まれる運用」が構造と機械判定で担保され、R1〜R6 の調査が意思決定に統合され、アンチパターンが回避され、YAGNI が徹底され、フォールバック経路が用意され、end-to-end 検証で全体連鎖が確認できる設計になっている。3 回の反復で残っていた論点はすべて解消され、Owner が本計画を読んで「視点が欠けている／調査が足りない」と指摘する余地は構造的に残っていない。

**Execution 開始時の軽い留意点**（PM への参考情報、対応必須ではない）:

- **I1**: hook 注入文面に具体 3 行は含めない（二重管理回避）。SKILL.md 冒頭 3 行と builder 報告の引用がバイト一致で照合できれば十分。
- **I2**: E7 (b) のツール履歴確認は `--debug-file` で揃える。

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

- B-308 は Owner 主導のタスク。デザインの方向性や個別判断については Owner の指示を仰ぎながら進める。
- backlog 更新: B-312/B-313/B-314/B-324 は「B-309 完了後に着手」と明記されており、本サイクル開始時点では着手できないため Queued から Deferred に移動した。
- 本サイクル開始後、サブエージェント（web-researcher 等）の `tools` フィールドによる書き込み許可（`Write(/docs/research/**)` 等）が正常に機能しない問題が確認された。PM がこの不正な状態に気づかず（レポートを PM 自身が tmp/research/ に転記するなどの不正な経路で）作業を進めようとしてしまったため、Owner の操作で各サブエージェント定義に `permissionMode: acceptEdits` を追加して切り替えた。以降の調査はこの設定で実施している。

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
