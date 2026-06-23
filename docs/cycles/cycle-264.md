---
id: 264
description: B-352 デザイン移行計画 Phase 9.3.c「dictionary humor 系（ユーモア語辞典: トップ index + 詳細 [slug]）の (new) デザイン体系への移行」。B-351（cycle-263・colors 系移行）完了で着手条件が解放された。humor 系は colors と異なり共有 `_components`（DictionaryDetailLayout / CategoryNav / SearchBox / DictionaryGrid）を一切使わず、自前の `page.module.css` で完結する（cycle-262 のトップ移行に近い「self-contained」型）。よって本サイクルは共有部品のフォークを必要とせず、index/詳細の自前 CSS を in-place で新トークン化し、common→(new) の Breadcrumb/ShareButtons へ差し替え、TrustLevelBadge を撤去する。humor 専用 client 部品 EntryRatingButton の CSS は旧 `--color-*` トークンを参照していない（grep 確認済）が移行後の見た目整合を検証する。cycle-261 の方向決定（DESIGN.md §7）に従い診断の視覚言語拡張（結果固有色アイデンティティ・象徴絵文字）は適用せず austere 基調で移行する。詳細ページに (new) DictionaryDetailLayout を採用するか自前レイアウトを温存するかは Plan エージェントで判断する。本サイクルは humor 系のみ（kanji=B-353・yoji=B-354 は後続）。
started_at: 2026-06-23T16:01:48+0900
completed_at: null
---

# サイクル-264

このサイクルでは **B-352（デザイン移行計画 Phase 9.3.c: dictionary humor 系移行）** を実施する。

`(legacy)/dictionary/humor/`（ユーモア語辞典: トップ index + 詳細 `[slug]`）を、`(new)/` の新デザイン体系へ移行する。`docs/design-migration-plan.md` の Phase 9.3.c に相当し、辞典4系統移行（B-351〜354）の3番目にあたる。

## 位置づけと前提

- **なぜ今か**: cycle-262（B-350・辞典トップ）→ cycle-263（B-351・colors 系）と進めてきた辞典移行チェーンの継続。デザイン体系の統一と legacy 撤去（Phase 11）に向けたコード健全化は道具箱の地位と無関係に価値があり、辞典移行は概念非依存（cycle-259 で要否確認済 = 実施）。来訪者が検索から実際に降り立つ辞典画面のデザイン混在を一歩解消する。
- **本サイクルは「self-contained 型」= cycle-263 とは難所が異なる**: cycle-263（colors）の肝は共有 `_components`（DictionaryDetailLayout / CategoryNav / SearchBox / DictionaryGrid）を kanji/yoji に巻き込まず移行するための **(new) フォーク**だった。しかし **humor はこれらの共有部品を一切使わない**（現物 grep 確認済）。humor の index も詳細も自前の `page.module.css` で完結しており、構造的には cycle-262 のトップ移行（自前 CSS の in-place トークン化）に近い。よって本サイクルは共有部品のフォークを必要としない。cycle-263 が整備した `src/dictionary/_components/new/` の4部品は humor では原則出番がない（詳細ページが DictionaryDetailLayout を採用する場合のみ再利用しうる＝下記の設計判断）。
- **austere 基調で移行・診断拡張は不適用**: 辞典は site-concept 3層では診断を支える「文化層」だが、cycle-261 の方向決定（DESIGN.md §7）は「拡張は**診断のタッチポイント限定**・道具・**辞典本文**・道具箱の austere 基調は維持」と明記する。したがって humor 辞典の移行に、結果固有色アイデンティティ・象徴絵文字といった診断の視覚言語拡張は**適用しない**。chrome（タイポ・カード・罫・余白）を移行済み index（`/tools`・`/blog`・`/dictionary`・colors）と同じ標準 (new) austere 基調へ揃える。
- **スコープは humor 系のみ**: 移行計画は 9.3.b〜e を各1サイクルに分割する方針。kanji/yoji は legacy 残置で後続サイクル（B-353/B-354）。

## 移行スコープ（接地済みの現物確認）

計画時に現物を確認して確定した（行数・import・トークン依存）:

- **対象ページ**:
  - `humor/page.tsx`（index・79行）+ `humor/page.module.css`（101行）。サーバーコンポーネントで、`getAllEntries()` を五十音順に `entryList`（`<ul>`）で一覧表示（**DictionaryGrid 不使用の自前リスト**）。収録数は `entries.length` を直接表示（**ハードコード無し＝B-541 系の再発予兆なし**）。
  - `humor/[slug]/page.tsx`（詳細・128行）+ `humor/[slug]/page.module.css`（163行）+ `opengraph-image.tsx` / `twitter-image.tsx` + `__tests__/`（page.test.tsx / opengraph-image.test.tsx）。`getAllSlugs()` で静的生成。自前レイアウトに Breadcrumb・ShareButtons・EntryRatingButton を持つ（**DictionaryDetailLayout 不使用・playRecommendations 無し**）。
- **共有部品の差し替え（cycle-262/263 で確立したパターンを踏襲）**:
  - `@/components/common/Breadcrumb` → `@/components/Breadcrumb`（(new) 版）。
  - `@/components/common/ShareButtons`（詳細で使用）→ `@/components/ShareButtons`（(new) 版が存在することを確認済）。
  - `@/components/common/TrustLevelBadge`（index/詳細で使用）→ (new) では**撤去**（cycle-262/263 と同方針。AI 運用の注記は憲法ルール3に従いサイト共通の Footer/about 側で担保される前提を確認する）。型/meta 値は legacy 使用中のため残す。
- **humor 専用 client 部品**: `EntryRatingButton`（`src/humor-dict/_components/`・評価ボタン）。`EntryRatingButton.module.css` は旧 `--color-*` トークンを**参照していない**（grep 確認済＝0件）。移行後も見た目・挙動が新デザインと整合するか実機で検証する（新トークンや別手段で着色されている可能性があるため要確認）。
- **旧トークン依存（in-place 置換対象）**: humor の2つの `page.module.css` が参照する旧トークンは `--color-border` / `--color-primary` / `--color-text` / `--color-text-muted` / `--color-bg` / `--color-bg-secondary` の6種。cycle-263 で確定した置換マップ（旧6種→`--fg`/`--fg-soft`/`--border`/`--bg`/`--bg-soft`、`--color-primary` は用途別: リンク/focus=`--accent`・hover罫=`--border-strong`・active=`--bg-invert`/`--fg-invert`）を踏襲する。新 `globals.css` に旧 `--color-*` は1つも無いため、未置換が残ると崩れる（全消し grep で検証）。
- **データ/JSON-LD**: index は `safeJsonLdStringify`、詳細は `generateHumorDictMetadata` 等の既存 SEO ヘルパを使用。OGP/Twitter カード（`opengraph-image.tsx`/`twitter-image.tsx`）・JSON-LD は既存パターンを**踏襲のみ**（新規の外部仕様依存判断を導入しない）。移行で構造化データの出力内容を変えない。
- **設計判断（Plan で確定）**: 詳細ページに cycle-263 でフォークした **(new) DictionaryDetailLayout を採用して colors 詳細とレイアウト統一するか**、自前レイアウトを温存して in-place トークン化に留めるか。humor のコンテンツ形状（語釈＋評価ボタン、playRecommendations 無し）が colors（色面＋関連色）と異なるため、機能・挙動の同等性とスコープ最小を優先しつつ Plan エージェントで判断する。

## 実施する作業

- [ ] **1. 接地（現状の来訪者体験の把握）**
  - [ ] 1a. GA で humor 系の着地・回遊を確認（index/詳細の PV・流入経路・デバイス比）。母数が小さい場合は数値KPIではなく「index⇄詳細の回遊性と体験を austere で同等以上に保つ」を評価軸に据える（cycle-263 と同方針）
  - [ ] 1b. 移行前スクショを `tmp/cycle-264/before/` に保存（index・代表数語の詳細 × w360/w1280 × light/dark）。保つべき価値の核を記録（五十音順の見出し語一覧・語釈・ShareButtons・EntryRatingButton・AIバッジの扱い・回遊リンク）
- [ ] **2. 移行設計の確定（Plan エージェント → reviewer）**
  - [ ] 2a. 詳細ページのレイアウト方針を確定（Plan）= 自前レイアウト温存 in-place トークン化 か (new) DictionaryDetailLayout 採用か。トークン置換マップ（cycle-263 踏襲）・TrustLevelBadge 撤去/ShareButtons (new) 化・EntryRatingButton の着色整合方針を文書化（`tmp/cycle-264/design.md`）
  - [ ] 2b. austere 歯止めの線引き（診断視覚言語拡張は不適用・辞典本文は維持）を確定
  - [ ] 2c. 計画レビュー（白紙 reviewer）= 承認を得てから実装着手（Review always）
- [ ] **3. 移行実装（builder サブエージェント・小さく分割）**
  - [ ] 3a. index 移行（`page.tsx`/`page.module.css` を git mv・Breadcrumb 差替・TrustLevelBadge 撤去・新トークン化・`.container` 付与・収録数 `entries.length` 維持）
  - [ ] 3b. 詳細 `[slug]` 移行（git mv・(new) Breadcrumb/ShareButtons・TrustLevelBadge 撤去・EntryRatingButton 整合・新トークン化・generateStaticParams/JSON-LD/OGP/Twitter 全維持・`__tests__` 追従）
  - [ ] 3c. seo-coverage 等で humor を import している箇所があれば (new) パスへ追従（grep 確認）
- [ ] **4. 検証**
  - [ ] 4a. `npm run lint && npm run format:check && npm run test && npm run build` exit 0×4。本番ビルド（`npm start`）で配信確認（cycle-262 stale 事故対策＝`.container` 出現・TrustLevelBadge 痕跡ゼロを先確認）。全体ゲート grep: 旧 `--color-*` 残ゼロ・`(legacy)/dictionary/humor/` 空
  - [ ] 4b. Playwright で humor after スクショを `tmp/cycle-264/after/`、評価軸全 pass（情報保全・回遊リンク維持/向上・austere 化〔hero gradient/影/transform/旧トークン痕跡ゼロ〕・EntryRatingButton 挙動・AI 注記 Footer 経由保全）
  - [ ] 4c. 未移行 kanji/yoji を実機確認（legacy デザイン不変＝段階移行整合・回遊リンク非破綻）
- [ ] **5. レビュー（白紙 reviewer）**
  - [ ] 5a. 成果物レビュー（白紙 reviewer・本番ビルド配信確認のうえ逐条検証）= 指摘ゼロまで対応
- [ ] **6. 完了処理（`/cycle-completion`）**

## 作業計画

### 目的

ユーモア語辞典（humor 系）を新デザイン体系へ移行し、来訪者体験を損なわず（視覚的・機能的に同等以上で）デザイン混在を一歩解消する。最終的な来訪者価値は「辞典を訪れた来訪者が、サイト全体と一貫した上質な画面で、見出し語・語釈を正確に受け取り、安心して回遊できること」。

### 作業内容

上記「実施する作業」のとおり。要点は4つ。

1. **接地を先に**（作業1）。humor の現状の着地・回遊を GA と実スクショで掴んでから移行する。
2. **self-contained 移行を正しく行う**（作業2・3）。humor は共有部品を使わない自前 CSS 完結型なので、cycle-263 のようなフォークは不要。cycle-262 のトップ移行と同じく in-place の新トークン化＋common→(new) 部品差し替えが基本。詳細レイアウトの方針（DictionaryDetailLayout 採用要否）だけ Plan で判断し、reviewer のレビューを経てから実装に入る（Review always）。
3. **austere 基調を守る**（作業2b・3）。診断の視覚言語拡張は持ち込まない。辞典本文（見出し語・語釈）は正確に保つ。
4. **スコープを humor 系に限定**（タスクを小さく保つ）。kanji/yoji は legacy 残置で壊さず後続サイクルへ。

タスクはサブエージェントへ小さく委譲する（接地・GA/Playwright は foreground、設計は Plan、実装は builder を index/詳細で分割、レビューは白紙 reviewer）。MCP を使うサブエージェントは foreground で起動する（CLAUDE.md）。

### 検討した他の選択肢と判断理由

- **humor 詳細に (new) DictionaryDetailLayout を無条件で採用してレイアウト統一する**: 保留（Plan で判断）。colors 詳細との視覚統一は魅力だが、humor は playRecommendations 無し・EntryRatingButton 有りでコンテンツ形状が異なる。機能・挙動の同等性とスコープ最小を優先し、Plan エージェントで採否を確定する。無理に統一して既存の評価ボタン挙動を壊さないことを優先する。
- **辞典4系統を一気に移行する**: 不採用。移行計画が各系統を各1サイクルに分割（タスクを小さく保つ・トレーサビリティ）。
- **humor トップ/詳細に診断の視覚言語拡張を適用する**: 不採用。cycle-261 の歯止め（拡張は診断タッチポイント限定・辞典本文は austere 維持）に反する。
- **B-540（AP集 規約準拠クリーンアップ・P1）を先にやる**: 不採用。プロセス文書整備で来訪者価値の連鎖から遠い。移行チェーン（B-350→351→352→…）を進める方が画面に直結し Phase 11 にも前進する。
- **ブログを書く**: 完了後の状態を見て再判断（cycle-263 と同方針）。デザイン移行は局所的変化で読者の学び・楽しさになりにくい。辞典移行を完走した段階での再評価が読者価値を出しやすい。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md`（Phase 9.3.c の定義・「1ページ移行の標準手順」・段階移行整合性の検証項目）
- `docs/cycles/cycle-263.md`（B-351 colors 系移行の手順・トークン置換マップ・austere 歯止めの線引き・本番ビルド配信先確認による stale 事故回避）
- `docs/cycles/cycle-262.md`（B-350 トップ移行＝self-contained 移行の手順・common→(new) Breadcrumb 差し替え・収録数 `.length` 維持・stale サーバ配信事故の教訓）
- `docs/cycles/cycle-261.md`（B-539 方向決定。DESIGN.md §7 = 拡張は診断タッチポイント限定・辞典本文は austere 維持＝本サイクルが austere で移行する根拠）
- `DESIGN.md`（§1〜§6 austere 基調・新トークン名・§7 診断の視覚言語と文化層への橋渡しの線引き）／`/frontend-design` SKILL（実装フェーズで参照）
- 現物確認（grep/wc 済）: humor は共有 `_components` 不使用の self-contained 型・index は `entries.length` 直接表示（ハードコード無し）・詳細は ShareButtons/EntryRatingButton 使用で playRecommendations 無し・旧トークン6種を2つの page.module.css が参照・EntryRatingButton.module.css は旧トークン参照ゼロ・(new) Breadcrumb/ShareButtons が `src/components/` に存在。

**外部仕様への依存**: 本サイクルの主作業（既存 index/詳細の (new) 移行）は内部デザインシステムに閉じる。外部仕様接点は humor-dict の JSON-LD（Schema.org）・OGP/Twitter カードだが、いずれも既存の移行済みページ（cycle-262/263・blog/tools）で確立済みのパターンを**踏襲するのみ**で、新規の外部仕様依存判断を導入しない。よって一次資料の新規事前確認は不要と判断する（新規の構造化データを設計する場合のみ既存パターン準拠を確認）。

## キャリーオーバー

- 現時点でなし。後続の辞典移行（kanji=B-353・yoji=B-354）は本サイクルのスコープ外の既存下流タスク（Queued）。

## 補足事項

- ブログ判断は完了時に reader-perspective で再判断する（cycle-263 と同方針）。
- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.c）の実行。新規設計判断は詳細ページのレイアウト方針（DictionaryDetailLayout 採用要否）に集約され、Plan → reviewer で確定する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
