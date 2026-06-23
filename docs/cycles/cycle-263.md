---
id: 263
description: B-351 デザイン移行計画 Phase 9.3.b「dictionary colors 系（伝統色辞典: トップ + 250 色の詳細 + category）の (new) デザイン体系への移行」。B-350（cycle-262・辞典トップ移行）完了で着手条件が解放された。colors 系は cycle-262 のトップと異なり共有 `_components`（DictionaryDetailLayout / CategoryNav / SearchBox / DictionaryGrid）を使い、これらは未移行の kanji/yoji 系統も共有する。新 globals.css に旧 `--color-*` トークンが存在しないため、共有部品をそのまま (new) 配下へ持ち込むと崩れ、逆に共有部品を新デザイン化すると未移行系統を巻き込む。よって段階移行の整合を保つには colors が使う共有部品を (new) 用にフォークする。色見本そのものは辞典の本文コンテンツ（伝統色がどんな色かを見せる核機能）として維持し、cycle-261 の方向決定に従い診断の視覚言語拡張（結果固有色アイデンティティ・象徴絵文字）は適用せず austere 基調で移行する。本サイクルは colors 系のみ（humor/kanji/yoji は B-352〜354 で後続）。
started_at: 2026-06-23T00:27:37+0900
completed_at: 2026-06-23T09:43:46+0900
---

# サイクル-263

このサイクルでは **B-351（デザイン移行計画 Phase 9.3.b: dictionary colors 系移行）** を実施する。

`(legacy)/dictionary/colors/`（伝統色辞典: トップ index + 250 色の詳細 `[slug]` + カテゴリ `category/[category]`）を、`(new)/` の新デザイン体系へ移行する。`docs/design-migration-plan.md` の Phase 9.3.b に相当し、辞典4系統移行（B-351〜354）の2番目・**共有部品を最初に (new) 化する「先頭打者」**にあたる。

## 位置づけと前提

- **なぜ今か**: cycle-262（B-350）で辞典トップ `/dictionary` を移行し、9.3.b〜e の着手条件が解放された。デザイン体系の統一と legacy 撤去（Phase 11）に向けたコード健全化は道具箱の地位と無関係に価値があり、辞典移行は概念非依存（cycle-259 で要否確認済 = 実施）。colors はトップではなく**検索からの主着地点**でもある（cycle-262 接地: Organic 流入の主動線は系統トップ/詳細に直接着地〔colors/yoji 中心〕）。ここを整えるのは来訪者が実際に降り立つ画面に直結する。
- **本サイクルの設計上の難所（共有部品のフォーク）**: cycle-262 のトップ移行が綺麗だったのは共有 `_components` を一切使わなかったため。colors は **DictionaryDetailLayout・CategoryNav・SearchBox・DictionaryGrid**（いずれも `src/dictionary/_components/` の共有部品で kanji/yoji も使用）と、**ColorCard・ColorDetail**（`_components/color/` 配下で colors 専用）を使う。新 `globals.css` には旧 `--color-*` トークンが **1つも無い**（`(legacy)` は `old-globals.css`、`(new)` は `globals.css` を読む）。共有部品の CSS は `--color-text` 等の旧トークン6種を参照しているため、(a) そのまま (new) 配下へ持ち込むと未定義トークンで崩れ、(b) 逆に共有部品自体を新デザイン化すると `(legacy)` に残る kanji/yoji の詳細・一覧を巻き込む。新デザインは構造的（角丸2px・影撤去・余白）に変わるためトークン別名の橋渡しでは両立しない。→ **段階移行の整合（kanji/yoji を視覚的にも挙動的にも不変に保つ）を満たすため、colors が使う共有部品は (new) 用にフォークする。** colors 専用の ColorCard/ColorDetail は他系統が使わないため、その場で新トークン化してよい。フォークした (new) 共有部品は後続 B-352（humor）以降が再利用し、kanji/yoji 移行完了（B-353/354）で legacy 共有部品は全消費者を失い Phase 11 で撤去される。重複はこの段階移行の機構であって死蔵ではない。
- **austere 基調で移行・診断拡張は不適用**: 辞典は site-concept 3層では診断を支える「文化層」だが、cycle-261 の方向決定（DESIGN.md §7）は「拡張は**診断のタッチポイント限定**・道具・**辞典本文**・道具箱の austere 基調は維持」と明記する。したがって colors 辞典の移行に、結果固有色アイデンティティ・象徴絵文字といった診断の視覚言語拡張は**適用しない**。ただし**色見本（伝統色の色面）は辞典の本文コンテンツ**——「その伝統色がどんな色か」を見せるのが核機能であり、装飾の色ではない。色見本は維持し、それ以外の chrome（タイポ・カード・罫・余白）を移行済み index（`/tools`・`/blog`）と同じ標準 (new) austere 基調に揃える。「結果固有色を最近傍の伝統色に対応づける橋渡し」は診断面（B-523/B-542）の役割であって colors 辞典トップ自身の役割ではない。
- **スコープは colors 系のみ**: 移行計画は 9.3.b〜e を各1サイクルに分割する方針。humor/kanji/yoji は legacy 残置で後続サイクル（B-352〜354）。

## 移行スコープ（接地済みの現物確認）

計画時に現物を確認して確定した:

- **対象ページ**: `colors/page.tsx`（index・79行）+ `ColorsIndexClient.tsx`（70行・client検索/フィルタ）+ `page.module.css`、`colors/[slug]/page.tsx`（詳細・56行・`generateStaticParams` で250色を静的生成）、`colors/category/[category]/page.tsx`（102行）+ `page.module.css`。
- **共有部品（フォーク対象 = (new) 用に新トークン・austere 構造で用意）**: `DictionaryDetailLayout`（詳細の枠・`--color-text`/`--color-border` 参照）、`CategoryNav`（index/category のカテゴリ切替）、`SearchBox`（index 検索）、`DictionaryGrid`（グリッド・CSS は token 不参照のレイアウトのみ＝そのまま再利用可か要確認）。いずれも kanji/yoji も使うため legacy 版は残す。
- **colors 専用部品（その場で新トークン化）**: `ColorCard`（一覧カード・色面表示）、`ColorDetail`（詳細・色面/HEX/RGB/HSL）。他系統が import しないことを grep 確認済み。
- **共通部品の差し替え**: `@/components/common/Breadcrumb` → `@/components/Breadcrumb`（cycle-262 と同じ (new) 版）。`@/components/common/TrustLevelBadge`（colors index/category が `level="curated"` で使用）の (new) での扱いを確定する（cycle-262 トップ移行では (new) で不使用＝撤去した。tools/blog index の (new) パターンに合わせる。AI 運用の注記は憲法ルール3に従いサイト共通の footer/about 側で担保される前提を確認）。
- **データ/JSON-LD**: 色数は実データ250（`traditional-colors.json`）で「250色」表記は現状正しいが、本サイクルで `colors/page.tsx` の metadata を書き換えるため `getAllColors().length` 由来へ置換し再発予兆を断つ（B-541 の colors 分を本サイクルで回収・他系統分は B-541 に残す）。`generateColorJsonLd`（Schema.org）・BreadcrumbList JSON-LD・OGP は既存パターンを**踏襲のみ**（新規の外部仕様依存判断を導入しない）。
- **詳細ページの付随要素**: 詳細は `DictionaryDetailLayout` 経由で breadcrumb・share（`shareUrl`/`shareTitle`）・`playRecommendations`（`getPlayRecommendationsForDictionary("colors")`）を持つ。移行後もこれらが機能し、リンク先（未移行 `/play` 等）が壊れないことを検証する。

## 実施する作業

- [x] **1. 接地（現状の来訪者体験の把握）**
  - [x] 1a. GA で colors 系を確認＝**index が最大の着地玄関 兼 回遊ハブ**（90日 PV88/47人・ほぼ全量 Organic〔Bing/Google〕直接着地・詳細はロングテール〔人気の単色なし〕・利用者ベース PC64%/モバイル36%）。評価軸は「数値KPI」ではなく「index⇄詳細の相互リンク回遊性と体験を austere で同等以上に保つ」（母数小さく数値比較不可）
  - [x] 1b. 移行前スクショ24枚（index・代表4色 mizuasagi/kurenai/haizakura/edomurasaki・category/blue × w360/w1280 × light/dark）を `tmp/cycle-263/before/` に保存。保つべき価値の核を記録（色面 w1280≈700×200px・色コード3種+コピー・関連色列=回遊の生命線・250色色相順グリッド+CategoryNav+検索・AIバッジ）
- [x] **2. 移行設計の確定（Plan エージェント → reviewer）**
  - [x] 2a. フォーク戦略を確定（Plan）＝**フォーク採用**。`src/dictionary/_components/new/` に DictionaryDetailLayout/CategoryNav/SearchBox/PlayRecommendBlock をフォーク（DictionaryGrid はトークン非参照で共用＝フォーク不要）。トークン置換マップ（旧6種→`--fg`/`--fg-soft`/`--border`/`--bg`/`--bg-soft`、`--color-primary` は用途別: リンク/focus=`--accent`・hover罫=`--border-strong`・active pill=`--bg-invert`/`--fg-invert`）。設計は `tmp/cycle-263/design.md`
  - [x] 2b. TrustLevelBadge は (new) 撤去（AI注記は Footer 担保・型/meta値は legacy 使用中で残す）・「250色」→`getAllColors().length`・色見本(HEX)は本文コンテンツとして維持し chrome のみトークン化・診断拡張(結果固有色/象徴絵文字/にじみグラデ)は不適用、を確定
  - [x] 2c. 計画レビュー（白紙 reviewer・2巡）＝**承認（指摘ゼロ・着手可）**。M-1/S-1〜S-4/N-1/N-2 を全反映
- [x] **3. 移行実装（builder サブエージェント・小さく分割）**
  - [x] 3a. T1=(new) 共有部品フォーク4種（DictionaryDetailLayout/CategoryNav/SearchBox/PlayRecommendBlock）＋(new) Layout テスト12 passed・DictionaryGrid 共用＝legacy 未編集確認。T2=colors 専用部品 in-place 新トークン化（ColorCard/ColorDetail・色面HEX保持）
  - [x] 3b. T3=index 移行（`page.tsx`/`ColorsIndexClient.tsx`/`page.module.css` を git mv・Breadcrumb差替・TrustLevelBadge撤去・hero gradient撤去・metadata `getAllColors().length` 化・`.container`付与）
  - [x] 3c. T4=詳細 `[slug]` 移行（git mv・new DictionaryDetailLayout 経由・250色 generateStaticParams/Color JSON-LD/share/playRecommendations 全維持）
  - [x] 3d. T4=category 移行（git mv・new CategoryNav・TrustLevelBadge撤去・`.container`付与・page.module.css 新トークン化）。+ T5=seo-coverage の colors 3 import を (new) 化
- [x] **4. 検証**
  - [x] 4a. `npm run lint && npm run format:check && npm run test && npm run build` exit 0×4（テスト 342ファイル/5674件全通過・build成功・250色完全prerender）。本番ビルド(`npm start`)で配信確認＝stale 事故なし（`.container` クラス出現・TrustLevelBadge 痕跡ゼロ・title 動的算出）。全体ゲート grep: 旧 `--color-*` 残ゼロ・legacy 共有部品変更行ゼロ・`(legacy)/dictionary/colors/` 空
  - [x] 4b. Playwright で colors after 24枚を `tmp/cycle-263/after/`、評価軸全 pass（色面寸法/HEX 保全・getComputedStyle で `#66bab7` 一致・情報保全・回遊リンク維持/向上・austere化〔hero gradient/影/transform/旧トークン痕跡ゼロ〕・aria-current="page" 付与・active pill `--bg-invert`/`--fg-invert` テーマ追従・AI注記 Footer 経由保全）
  - [x] 4c. 未移行 kanji/yoji/humor を 12枚 `tmp/cycle-263/legacy-unchanged/` で実機確認＝legacy デザイン pixel 同等で不変。回遊リンク（詳細→index/category/関連色/play/tools）非破綻・実機 200×3
- [x] **5. レビュー（白紙 reviewer）**
  - [x] 5a. 成果物レビュー（白紙 reviewer・本番ビルド配信確認のうえ6観点逐条検証）＝**指摘なし（must/should/nit すべてゼロ）・完了処理可**。標準移行手順/デザイン体系適合/austere 歯止め/スコープ厳守/段階移行整合（legacy 共有部品変更行ゼロ・既存テスト13/13 passing）/コード品質を確認。視覚検証は別 reviewer が承認済（24+12 枚で評価軸全 pass）
- [ ] **6. 完了処理（`/cycle-completion`）**

## 作業計画

### 目的

伝統色辞典（colors 系）を新デザイン体系へ移行し、来訪者体験を損なわず（視覚的・機能的に同等以上で）デザイン混在を一歩解消する。同時に、後続の辞典系統移行（humor=B-352・kanji=B-353・yoji=B-354）が再利用する **(new) 共有 dictionary 部品の基盤**を整える。最終的な来訪者価値は「検索から色名で降り立つ来訪者が、サイト全体と一貫した上質な画面で、色見本と読み・カラーコードを正確に受け取り、安心して回遊できること」。

### 作業内容

上記「実施する作業」のとおり。要点は4つ。

1. **接地を先に**（作業1）。colors は検索からの主着地点。現状を GA と実スクショで掴んでから移行する。
2. **共有部品のフォークを正しく行う**（作業2・3a）。これが本サイクルの肝。kanji/yoji を巻き込まないために colors が使う共有部品は (new) 用にフォークし、colors からのみ参照させる。設計は Plan エージェントで詰め、reviewer のレビューを経てから実装に入る（Review always）。
3. **austere 基調を守りつつ色見本は維持する**（作業2b・3）。診断の視覚言語拡張（結果固有色アイデンティティ・象徴絵文字）は持ち込まない。一方で**色見本そのものは辞典の本文コンテンツ**なので、伝統色の色面・HEX/RGB/HSL は正確に保つ。
4. **スコープを colors 系に限定**（タスクを小さく保つ）。humor/kanji/yoji は legacy 残置で壊さず後続サイクルへ。

タスクはサブエージェントへ小さく委譲する（接地・GA/Playwright は foreground、設計は Plan、実装は builder を index/詳細/category/共有フォークで分割、レビューは白紙 reviewer）。MCP を使うサブエージェントは foreground で起動する（CLAUDE.md）。

### 検討した他の選択肢と判断理由

- **共有部品をフォークせず、トークン別名で橋渡しする**: 不採用（要 Plan 再評価）。新 token 名を old-globals にも定義すれば色は解決するが、新デザインは角丸2px・影撤去・余白など**構造的**に変わるため、共有部品を新デザイン化すると `(legacy)` に残る kanji/yoji の詳細/一覧が「legacy パレット＋austere 構造」の半移行状態に巻き込まれる。段階移行整合（他系統は自分のサイクルまで不変）を破る。フォークなら他系統は完全に不変。重複は B-352〜354 と Phase 11 で機構的に解消する。
- **辞典4系統を一気に移行する**: 不採用。移行計画が各系統を各1サイクルに分割（タスクを小さく保つ・トレーサビリティ）。共有部品のフォークは一度作れば後続が再利用するため、先頭の colors で基盤を作り後続を軽くするのが筋。
- **colors トップに診断の視覚言語拡張（伝統色アイデンティティ・象徴絵文字）を適用する**: 不採用。cycle-261 の歯止め（拡張は診断タッチポイント限定・辞典本文は austere 維持）に反する。橋渡しの視覚設計は診断面（B-523/B-542）の役割。色見本の維持は「本文コンテンツの保持」であって診断拡張ではない（区別を作業2bで明文化）。
- **B-540（AP集 規約準拠クリーンアップ・P1）を先にやる**: 不採用。プロセス文書整備で来訪者価値の連鎖から遠い。設計再適合（cycle-261）後の今は、その体系を来訪者の見る画面へ展開する移行チェーン（B-350→351〜354）を進める方が画面に直結し Phase 11 にも前進する。B-540 は単独で別サイクル。
- **ブログを書く**: 完了後の状態を見て再判断（後述・補足事項）。デザイン移行は局所的変化で読者の学び・楽しさになりにくい。ただし「共有部品フォークによる段階移行」という設計判断には読者価値が出る可能性があり、完了時に reader-perspective で再判断する。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md`（Phase 9.3.b の定義・「1ページ移行の標準手順」・段階移行整合性の検証項目・テンプレート駆動コンテンツの一括移行）
- `docs/cycles/cycle-262.md`（B-350 トップ移行の手順・教訓: stale サーバ配信事故＝移行後ビルド配信を先に確認／common→(new) Breadcrumb 差し替え／収録数 `.length` 維持）
- `docs/cycles/cycle-261.md`（B-539 方向決定。DESIGN.md §7 = 拡張は診断タッチポイント限定・辞典本文は austere 維持＝本サイクルが austere で移行する根拠）
- `DESIGN.md`（§1〜§6 austere 基調・新トークン名 `--fg`/`--bg`/`--border`/`--accent` 系・§7 診断の視覚言語と文化層への橋渡しの線引き）／`/frontend-design` SKILL（実装フェーズで参照）
- 現物確認: 上記「移行スコープ」記載のファイル群・トークン依存（共有 `_components` が参照する旧6トークン＝`--color-border`/`--color-primary`/`--color-text`/`--color-text-muted`/`--color-bg`/`--color-bg-secondary`、新 `globals.css` に `--color-*` 定義ゼロ、`(new)`/`(legacy)` の layout が読む globals の差）。色数 = `traditional-colors.json` 実データ250。
- 共有部品の消費者マップ（grep 確認済）: DictionaryDetailLayout=colors/kanji/yoji、CategoryNav/SearchBox/DictionaryGrid=colors/kanji/yoji、ColorCard/ColorDetail=colors 専用、DictionaryCard=kanji/yoji（colors 不使用）。

**外部仕様への依存**: 本サイクルの主作業（既存 index/詳細/category の (new) 移行）は内部デザインシステムに閉じる。外部仕様接点は Color JSON-LD（Schema.org）・BreadcrumbList JSON-LD・OGP/Twitter カードだが、いずれも既存の移行済みページ（cycle-262 トップ・blog/tools）で確立済みのパターンを**踏襲するのみ**で、新規の外部仕様依存判断を導入しない（OGP は `sharedMetadata` 経由で一元化済み）。よって一次資料の新規事前確認は不要と判断する（新規の構造化データを設計する場合のみ既存パターン準拠を確認）。

## レビュー結果

本サイクルは「接地→移行設計→実装→検証→レビュー」の各段で独立したサブエージェントに委譲し、最終成果物は白紙 reviewer に独立検証させた。

- **接地（GA・foreground）**: colors 系は **index が最大の着地玄関 兼 回遊ハブ**（90日 PV88/47人・ほぼ全量 Organic 直接着地・詳細はロングテール）と判明。母数が小さく数値比較は無理なため、移行の評価軸を「数値KPI」ではなく「**index⇄詳細の相互リンク回遊性と体験を austere で同等以上に保つ**」に設定。利用者ベース PC64%/モバイル36% で両幅検証。
- **移行設計（Plan → reviewer 2巡）**: 共有部品の (new) フォーク戦略を確定（`src/dictionary/_components/new/` に DictionaryDetailLayout/CategoryNav/SearchBox/PlayRecommendBlock の4種をフォーク・DictionaryGrid はトークン非参照で共用＝フォーク不要）。トークン置換マップ（`--color-*` 6種→新トークン、`--color-primary` は用途別: リンク/focus=`--accent`・hover罫=`--border-strong`・active pill=`--bg-invert`/`--fg-invert`）と austere 歯止めの線引き（色面 HEX は本文コンテンツとして維持・chrome のみトークン化・診断視覚言語拡張は不適用）を確定。reviewer 指摘 M-1/S-1〜S-4/N-1/N-2 を全反映して**承認（指摘ゼロ・着手可）**。
- **実装（builder T1〜T5・小さく分割）**: T1=(new)共有部品フォーク4種＋(new)Layout テスト12 passed・legacy 未編集確認、T2=ColorCard/ColorDetail in-place 新トークン化（色面HEX保持）、T3=index 移行（hero gradient 撤去・metadata `.length` 化）、T4=詳細 [slug] と category 移行（付随要素全維持）、T5=seo-coverage の colors 3 import を (new) 化。builder の独自判断（ShareButtons 実ラベル「URLをコピー」・PlayRecommendBlock hover を二層構造で `--bg-softer` 採用）はいずれも根拠付きで妥当。
- **移行前後比較（Playwright・foreground・本番ビルド配信）**: colors after 24枚+未移行 kanji/yoji/humor 12枚で評価軸全 pass。色面寸法/HEX 保全（getComputedStyle で `#66bab7` 一致確認）・情報保全・回遊リンク維持/向上（category カードに「青系」リンク追加）・austere 化（hero gradient/影/transform/旧トークン痕跡ゼロ）・aria-current="page" 付与・active pill `--bg-invert`/`--fg-invert` でテーマ追従・AI注記 Footer 経由保全。未移行系統は legacy デザイン pixel 同等で不変確認＝段階移行整合 OK。配信は本番ビルド `npm start` で行い `.container` クラス出現・TrustLevelBadge 痕跡ゼロ・title 動的算出を先確認＝cycle-262 stale サーバ事故の再発なし。
- **成果物レビュー（白紙 reviewer）**: 6観点（標準移行手順・デザイン体系適合・austere 歯止め・スコープ厳守・段階移行整合・コード品質）を逐条検証し、`grep -rE '\-\-color-'` 残ゼロ・`common/` 残参照ゼロ・診断拡張の混入なし・型/meta 値の legacy 残置・`getAllColors().length` 動的化（B-541 colors 分回収完了）・250色完全 prerender・**legacy 共有部品変更行ゼロ**（git diff --stat で確認）・既存テスト13/13 passing を確認し、**must/should/nit すべてゼロで承認**。

有効な指摘はなく、対応事項・残置事項なし。

## キャリーオーバー

- なし。後続の辞典移行（humor=B-352・kanji=B-353・yoji=B-354）は本サイクルのスコープ外の既存下流タスク（Queued）であり、本サイクルが整備した (new) 共有部品（`src/dictionary/_components/new/` の4種）と DictionaryGrid 共用パターンをそのまま再利用する基盤になる。

## 補足事項

- **ブログ判断: 不執筆**。「共有部品をフォークして段階移行する」設計判断は技術的に意義あるが、(a) cycle-262 と同じく1〜数ページのデザイン移行は来訪者に見える変化が局所的、(b) フォークそのものは中間成果物で読者の生活には届かない、(c) B-352〜354 完了で legacy が撤去された段階で「段階移行を完走した」物語として再評価する方が読者価値が出やすい。後続辞典系移行が一通り進んだ段階で読者価値を再判断する（cycle-262 と同方針）。
- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.b）の実行。新規設計判断は (new) 共有部品の **フォーク採用・配置（`_components/new/`）・austere 歯止めの線引き（色面=本文コンテンツ／chrome=トークン）** の3点に集約され、いずれも段階移行整合と DESIGN.md §7 に従って確定。
- **検証環境の知見（活用）**: cycle-262 で得た「移行系の視覚検証では、配信中サーバが移行後ビルドかを新クラス等で先確認してから撮る」教訓を本サイクルでも適用（本番 `npm start` 配信 + `.container` クラス/TrustLevelBadge 痕跡ゼロ/title 動的算出の3点先確認）し、stale 事故ゼロで完了。
- **B-541 の進捗**: colors の「250色」ハードコードを `getAllColors().length` に置換して **colors 分を回収**。他系統（kanji/yoji 等）の `.length` 化は B-541 に残存。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている（6 完了処理を実行中）。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-351 は本サイクル完了で Done へ移動）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（白紙 reviewer 6観点逐条で must/should/nit ゼロ承認・視覚検証も別 reviewer 承認済）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（PM 再実行で exit 0×4 を確認・テスト 342ファイル/5674件全通過）。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている（キャリーオーバーなし・B-541 colors 分回収済の進捗を補足事項に明記）。
