---
id: 266
description: dictionary yoji（四字熟語）系を (new) デザイン体系へ移行（B-354・辞典移行 Phase 9.3.e＝最終系統）
started_at: 2026-06-25T10:43:06+0900
completed_at: null
---

# サイクル-266

このサイクルでは、辞典移行（Phase 9.3）の**最終系統**である `yoji`（四字熟語辞典）系を legacy デザインから (new) デザイン体系（austere 基調）へ移行する（B-354）。トップ・category 別一覧・個別詳細の3ルート＋yoji 専用部品 YojiDetail を対象とし、yoji→kanji 辞典への内部クロスリンクと SEO 構造（JSON-LD 4種・canonical・パンくず）を保全する。cycle-263（colors）/cycle-265（kanji）で確立した「共有 `_components` 依存型」の標準移行手順の5回目（同型）で、新規設計判断はほぼゼロ。

## 実施する作業

- [ ] **T0**: yoji 専用部品 `YojiDetail`（`src/dictionary/_components/yoji/`）の in-place 新トークン化（YojiDetail.module.css の旧 `--color-*` 26箇所を新トークンへ・YojiDetail.tsx の yoji→kanji クロスリンク href は無改修で維持）＋ **h1 追加（DictionaryDetailLayout 設計契約の充足＝KanjiDetail/ColorDetail 同型化）**: 現状 YojiDetail は本体を装飾 span のみで出し h1 が無く h2 から始まる（見出し階層の欠陥）。装飾 span は残しつつ `<h1>四字熟語「○○○○」</h1>`（kanji の `漢字「○」` パターンに揃える）を追加。専用テスト `YojiDetail.test.tsx` に h1 存在アサーションを追加（既存の h2 アサーションは level:2 フィルタのため非破壊だが要確認）。JSON-LD DefinedTerm の name と h1 文言の齟齬が無いか確認
- [ ] **T1**: トップ `/dictionary/yoji` 移行（page.tsx + YojiIndexClient.tsx + page.module.css を (new) へ `git mv`・**部品の所在別の差し替え**: page.tsx=CategoryNav と Breadcrumb(common→new) と TrustLevelBadge 撤去 / YojiIndexClient.tsx=DictionaryCard・SearchBox（→new/ フォーク）・インライン style 新トークン化・DictionaryGrid は legacy 直接再利用 / page.module.css 新トークン化・`.container` 付与）
- [ ] **T2**: category `/dictionary/yoji/category/[category]` 移行（page.tsx + page.module.css を (new) へ・page.tsx は CategoryNav・DictionaryCard・DictionaryGrid を import〔CategoryNav/DictionaryCard→new/、DictionaryGrid は legacy 直接再利用〕・Breadcrumb(common→new)・TrustLevelBadge 撤去・新トークン化・`.container` 付与）
- [ ] **T3**: 詳細 `/dictionary/yoji/[yoji]` 移行（page.tsx を (new) へ・DictionaryDetailLayout を new/ フォークへ差し替え・JSON-LD/metadata/パンくず/playRecommendations 無改修・YojiDetail は T0 済み）
- [ ] **T4**: `src/app/(legacy)/__tests__/seo-coverage.test.ts` の yoji import 3箇所（`/dictionary/yoji`・`category/[category]`・`[yoji]`）を (new) へ追従（`play/yoji-kimeru` のゲーム本体 import は legacy 据え置き）
- [ ] **検証**: 4ゲート（lint/format:check/test/build）+ typecheck + grep ゲート（旧 `--color-*` 残ゼロ・common 残参照ゼロ・legacy/yoji 空・new/ 部品採用確認・legacy 共有部品 diff 空・yoji→kanji クロスリンク href 維持）+ Playwright 視覚検証（mobile 360px 最優先 + desktop・クロスリンク往復・light/dark・console error 0・**yoji 詳細に h1 が1個だけ存在し kanji/color と同型の見出し階層になっていること**）
- [ ] **レビュー**: 計画 reviewer（h1 論点の判定含む）→ 実装後に白紙 reviewer で成果物独立検証

## 作業計画

### 目的

辞典4系統（colors/humor/kanji/yoji）の (new) 移行を完走し、Phase 9.3 を完了させる。yoji は辞典移行の最終系統であり、本サイクル完了で `(legacy)/dictionary/` 配下のデザイン移行残が yoji だけ解消する（cheatsheets/achievements は別途完了済み）。デザイン体系の統一は道具箱の地位と無関係に価値があり（cycle-259 で要否確認済）、Phase 11（legacy 撤去）の前提を整える。

### 作業内容

**移行対象（3ルート＋1専用部品）:**

1. トップ `/dictionary/yoji`: `page.tsx` + `YojiIndexClient.tsx` + `page.module.css`
2. category `/dictionary/yoji/category/[category]`: `page.tsx` + `page.module.css`
3. 詳細 `/dictionary/yoji/[yoji]`: `page.tsx`（DictionaryDetailLayout で YojiDetail を包む薄いラッパ）
4. yoji 専用部品 `src/dictionary/_components/yoji/YojiDetail.{tsx,module.css}`（in-place 新トークン化）

**部品差し替え方針（kanji=cycle-265 と同型・全フォーク済み）:**

- `Breadcrumb`（common）→ (new) Breadcrumb
- `TrustLevelBadge` → **撤去**
- `CategoryNav` → `new/CategoryNav`（フォーク済）
- `DictionaryCard` → `new/DictionaryCard`（前回 kanji で yoji 分岐を維持してフォーク済み＝本サイクルで yoji が採用することで非死蔵化）
- `DictionaryGrid` → **legacy 直接再利用**（`DictionaryGrid.module.css` の旧トークン使用 0 を grep 確認済み・colors/kanji 先例）
- `SearchBox` → `new/SearchBox`（フォーク済）
- `DictionaryDetailLayout` → `new/DictionaryDetailLayout`（フォーク済・内部で `new/PlayRecommendBlock` を使用）

**新トークン化が必要なファイル（旧 `--color-*` 使用を grep 確認済み）:**

- `(legacy→new)/dictionary/yoji/page.module.css`
- `(legacy→new)/dictionary/yoji/YojiIndexClient.tsx`（インライン style）
- `(legacy→new)/dictionary/yoji/category/[category]/page.module.css`
- `src/dictionary/_components/yoji/YojiDetail.module.css`（in-place）

**保全必須（接地 Playwright で実機確認済み）:**

- **yoji→kanji クロスリンク**（`YojiDetail.tsx:98` の `href={/dictionary/kanji/${encodeURIComponent(ch)}}`）。構成漢字クリックで kanji 辞典詳細へ遷移。リンク先 kanji 詳細は cycle-265 で (new) 移行済みのため生きている。**href は無改修**。
- **JSON-LD 4種**（WebSite・DefinedTerm・BreadcrumbList・FAQPage）＝`generateYojiJsonLd` 既存・無改修
- canonical・パンくず（ホーム>辞典>四字熟語辞典>語）・FAQ・ShareButtons・同カテゴリ関連語リスト（回遊源）・関連ゲーム（/play/yoji-kimeru）リンク・カテゴリバッジのリンク

**評価軸（接地 GA4/SC より＝kanji 型）:**

- yoji 系は SC impressions **10,665**（kanji 15,798 と同オーダー）・organic 直接着地あり・詳細ページが impressions の94%を担う長尾 SEO・mobile **79%**。よって humor 型（流入小・視覚中心）ではなく **kanji 型**＝「数値の単純比較ではなく SEO 構造の**非劣化＋h1 欠落の是正**を基準に、mobile を最優先（+desktop）、回遊維持、検索順位を下げないことを最低ライン」とする。h1 欠落是正（論点1）は非劣化ではなく改善方向だが、設計契約（DictionaryDetailLayout）の充足＝他2部品（kanji/color）との同型化であり、移行の目的（デザイン不統一の解消）に内包される。

**新知見の適用（cycle-265 §補足）:** route ファイルを `git mv` すると `.next/dev/types/validator.ts` が stale 化し pre-commit の typecheck を壊す。`rm -rf .next/dev` で解消（`docs/knowledge/nextjs.md` §12）。

### 検討した他の選択肢と判断理由

**【論点1】詳細ページの h1 欠落をこの移行で直すか → 直す（計画 reviewer 判定で確定）**

接地で判明：yoji 詳細ページには **h1 要素が無い**（四字熟語本体は `<span className={styles.character}>` でレンダリングされ、以降いきなり h2 から始まる＝見出し階層の欠陥）。

当初 PM は「h1 化は独立変数で計測規律に反するから別 backlog へ分離」（選択肢A）と判断したが、これは**前提が誤っていた**。計画 reviewer の指摘で、KanjiDetail（`<h1>漢字「○」</h1>`）・ColorDetail（`<h1>`）は**いずれも h1 を持っており**、`new/DictionaryDetailLayout` の設計契約コメント（「h1 は各 Detail コンポーネント〔KanjiDetail, YojiDetail, ColorDetail〕内部で管理されるため、このレイアウトには h1 を置かない」）も3部品が h1 を持つ前提だと確認した。つまり**3つの Detail 部品のうち yoji だけが h1 を欠く設計契約違反（既存バグ）**であり、これは「移行と独立な SEO 実験」ではなく「移行が解消すべきデザイン不統一そのもの」。h1 を測定対象の独立変数と見なした選択肢A の論拠（計測規律）は成立しない。

- 選択肢B（採用・確定）: **本サイクル内で YojiDetail に h1 を追加し、kanji/color と同型化する。** 装飾 span は残しつつ `<h1>四字熟語「○○○○」</h1>`（kanji の `漢字「○」` パターンに揃える）を追加。専用テスト `YojiDetail.test.tsx` に h1 アサーション追加。JSON-LD DefinedTerm の name と h1 文言の齟齬無きこと・h1 が1ページ1個に収まることを検証。
- 選択肢A（不採用・撤回）: h1 据え置き＋別 backlog 起票。前提誤認のため撤回。

来訪者価値の観点でも、yoji 詳細は SC impressions の94%を担う長尾 SEO 面であり、h1 欠落は検索到達（＝憲法 Goal）に直結する欠陥。欠陥を認識し YojiDetail を全面改修する手に触れていながら欠陥だけ先送りするのは AP-P27（途中まで進めた作業が実害を残す）に当たる。

**【論点2】DictionaryGrid を new/ にフォークするか legacy 直接再利用か**
→ legacy 直接再利用（colors/kanji と同じ）。`DictionaryGrid.module.css` の旧トークン使用 0 を grep 確認済みで、austere 基調を壊さない。不要なフォークは二重管理コストを生むため作らない。

**【論点3】YojiDetail を new/ にフォークするか in-place 新トークン化か**
→ in-place 新トークン化（kanji の KanjiDetail と同じ）。YojiDetail の importer は `src/app/(legacy)/dictionary/yoji/[yoji]/page.tsx` と専用テスト `src/dictionary/_components/__tests__/YojiDetail.test.tsx` の2つのみ＝yoji 系に閉じ、未移行系統を巻き込まない（seo-coverage.test.ts は YojiDetail を直接 import していない＝当初記述の誤りを訂正）。DictionaryCard（kanji/yoji 共用）のような共用部品ではないためフォーク不要。h1 追加（論点1）に伴い専用テスト `YojiDetail.test.tsx` の追従が必要。

### 計画にあたって参考にした情報

- 接地サブエージェント報告（GA4 property 524708437 過去90日・BigQuery SC 過去90日・Playwright 本番 https://yolos.net 実機）: yoji 系 PV 約78（トップ12・詳細裾野・category 少数）・organic 28セッション中27・mobile 79%・**SC impressions 10,665 / clicks 13 / 平均順位12 / 詳細が impr 94%**・主要クエリ「四字熟語＋意味/読み方/とは」型・mobile 360px 破綻なし・yoji→kanji クロスリンク遷移実機確認（至→/dictionary/kanji/至）・**詳細に h1 無し**。
- `docs/design-migration-plan.md` §9.3.e（yoji 系移行＝トップ+category+詳細・yoji 詳細から kanji 詳細への内部リンク維持・9.3.a + 9.3.d の後）／§9.3 完了基準
- `docs/cycles/cycle-265.md`（B-353 kanji 移行＝共有 `_components` 依存型の標準手順・`new/DictionaryCard` フォーク〔yoji 分岐維持〕・DictionaryGrid legacy 直接再利用・\*Detail in-place 新トークン化・seo-coverage.test.ts の import 追従パターン・`.next/dev` stale 知見）
- `docs/cycles/cycle-263.md`（B-351 colors 移行＝`new/` フォーク基盤の確立）
- `DESIGN.md` §1〜§6（austere 基調・新トークン名）／§7（診断タッチポイント限定の視覚拡張＝辞典本文は austere 維持＝本サイクルが austere で移行する根拠）／`/frontend-design` SKILL（実装フェーズで参照）
- 現物確認（grep/find 済）: yoji は共有 `_components`（CategoryNav/DictionaryCard/DictionaryGrid/SearchBox/DictionaryDetailLayout）使用の colors/kanji 型・new/ フォークは全て存在（CategoryNav/DictionaryCard/DictionaryDetailLayout/PlayRecommendBlock/SearchBox）・YojiDetail は yoji 専用（importer は [yoji]/page.tsx と専用テスト YojiDetail.test.tsx の2つ・KanjiDetail/ColorDetail は h1 を持つが YojiDetail のみ h1 欠落＝設計契約違反）・旧トークン使用は page.module.css/YojiIndexClient.tsx(インラインstyle)/category page.module.css/YojiDetail.module.css(26箇所)の4ファイル・seo-coverage.test.ts の yoji import 3箇所が要追従。

**外部仕様への依存**: 本サイクルの主作業（既存トップ/category/詳細の (new) 移行）は内部デザインシステムに閉じる。外部仕様接点は yoji 詳細の JSON-LD（Schema.org の DefinedTerm/FAQPage 等）・OGP/Twitter カードだが、いずれも既存の移行済みページ（cycle-262/263/264/265・blog/tools）で確立済みパターンを**踏襲するのみ**で、新規の外部仕様依存判断を導入しない（`generateYojiJsonLd`/`generateYojiPageMetadata` は無改修）。よって一次資料の新規事前確認は不要と判断する。

## キャリーオーバー

- （実装完了時に更新）

## 補足事項

- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.e）の実行。新規論点は h1 欠落の扱い（→本サイクル内で kanji/color 同型化＝論点1で確定）に集約され、移行手法そのものは cycle-263/265 の確立パターンの踏襲。
- ブログ判断は実装完了後に reader-perspective で行う（cycle-263/264/265 は「1系統のデザイン移行は来訪者に見える変化が局所的」で不執筆。yoji 完走＝辞典4系統移行の完走点なので「段階移行を完走した」物語として再評価の余地あり）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-354 は本サイクル完了で Done へ移動）。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
