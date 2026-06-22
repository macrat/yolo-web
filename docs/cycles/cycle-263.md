---
id: 263
description: B-351 デザイン移行計画 Phase 9.3.b「dictionary colors 系（伝統色辞典: トップ + 250 色の詳細 + category）の (new) デザイン体系への移行」。B-350（cycle-262・辞典トップ移行）完了で着手条件が解放された。colors 系は cycle-262 のトップと異なり共有 `_components`（DictionaryDetailLayout / CategoryNav / SearchBox / DictionaryGrid）を使い、これらは未移行の kanji/yoji 系統も共有する。新 globals.css に旧 `--color-*` トークンが存在しないため、共有部品をそのまま (new) 配下へ持ち込むと崩れ、逆に共有部品を新デザイン化すると未移行系統を巻き込む。よって段階移行の整合を保つには colors が使う共有部品を (new) 用にフォークする。色見本そのものは辞典の本文コンテンツ（伝統色がどんな色かを見せる核機能）として維持し、cycle-261 の方向決定に従い診断の視覚言語拡張（結果固有色アイデンティティ・象徴絵文字）は適用せず austere 基調で移行する。本サイクルは colors 系のみ（humor/kanji/yoji は B-352〜354 で後続）。
started_at: 2026-06-23T00:27:37+0900
completed_at: null
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

- [ ] **1. 接地（現状の来訪者体験の把握）**
  - [ ] 1a. GA/BigQuery で colors 系（トップ index・`[slug]` 詳細・category）の流入・回遊・デバイス比を確認し、移行の評価軸（新規流入獲得ではなく「主着地点の回遊性を austere で損なわず改善」）を設定
  - [ ] 1b. 現状の colors index・代表的な `[slug]` 詳細・category ページを Playwright でスクショ（w360/w1280・light/dark）。`tmp/cycle-263/before/` に保存
- [ ] **2. 移行設計の確定（Plan エージェント → reviewer）**
  - [ ] 2a. フォーク戦略の最終確定: (new) 共有部品（DictionaryDetailLayout/CategoryNav/SearchBox/DictionaryGrid）の配置・命名・トークン置換マップ（旧6トークン→ `--fg`/`--fg-soft`/`--border`/`--bg`/`--bg-soft`/`--accent` 等）。フォーク vs トークン橋渡しを「kanji/yoji が視覚・挙動とも不変（段階移行整合）」「重複/集約負債最小」の基準で評価し決定
  - [ ] 2b. TrustLevelBadge の (new) での扱い・「250色」→`.length` 化・診断拡張を持ち込まない austere 歯止めの線引き（色見本は本文として維持）を確定
  - [ ] 2c. 計画レビュー（白紙 reviewer）。指摘を反映
- [ ] **3. 移行実装（builder サブエージェント・小さく分割）**
  - [ ] 3a. (new) 共有部品のフォーク作成（DictionaryDetailLayout/CategoryNav/SearchBox/DictionaryGrid）＝新トークン・austere 構造・a11y
  - [ ] 3b. colors index 移行（`page.tsx`+`ColorsIndexClient.tsx`+`ColorCard`+`SearchBox`+`CategoryNav`+`page.module.css`）。`git mv` ベース・common→(new) Breadcrumb・metadata `.length` 化
  - [ ] 3c. colors 詳細 `[slug]` 移行（`page.tsx`+`ColorDetail`、(new) DictionaryDetailLayout 経由）。250色 `generateStaticParams` 維持・share/playRecommendations/JSON-LD 維持
  - [ ] 3d. colors category 移行（`category/[category]/page.tsx`+`page.module.css`）。CategoryNav/ColorCard/DictionaryGrid 経由
- [ ] **4. 検証**
  - [ ] 4a. `npm run lint && npm run format:check && npm run test && npm run build` が全て成功（PM 再実行で exit 0×4 を確認。配信サーバが「移行後ビルド」かを新クラス有無で先に確認＝cycle-262 の stale サーバ事故の教訓）
  - [ ] 4b. Playwright で移行後 colors index・代表 `[slug]`・category を w360/w1280・light/dark でスクショし移行前と比較＝同等以上。合格条件（旧 `--color-*` 由来不在・色見本の正確な再現・コントラスト 4.5:1・タップ44px・focus-visible・aria-current・max-width 1200px）。`tmp/cycle-263/after/`
  - [ ] 4c. 段階移行の整合性: 未移行 kanji/yoji（共有 legacy 部品を使用）が**視覚・挙動とも不変**で 200・破損なしを実機確認。colors 詳細の内部リンク（playRecommendations 等）と category↔index 遷移・戻る/進むの非破綻を確認
- [ ] **5. レビュー（白紙 reviewer）**
  - [ ] 5a. 成果物レビュー（移行後ビルド配信を確認のうえ全観点を逐条検証）。must/should をゼロにして承認
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

## キャリーオーバー

- （実施中に更新）

## 補足事項

- ブログ判断: 完了後に reader-perspective で再判断（後続辞典系の進捗段階で学び・楽しさの有無を見る）。「共有部品をフォークして段階移行する」設計判断は読者価値が出る余地があるため、完了時に独立判断する。
- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.b）の実行。新規設計判断は最小限（共有部品フォーク戦略・austere 歯止めの線引き）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-351 は本サイクル完了で Done へ移動）。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
