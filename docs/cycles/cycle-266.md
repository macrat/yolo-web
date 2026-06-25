---
id: 266
description: dictionary yoji（四字熟語）系を (new) デザイン体系へ移行（B-354・辞典移行 Phase 9.3.e＝最終系統）
started_at: 2026-06-25T10:43:06+0900
completed_at: 2026-06-25T11:39:14+0900
---

# サイクル-266

このサイクルでは、辞典移行（Phase 9.3）の**最終系統**である `yoji`（四字熟語辞典）系を legacy デザインから (new) デザイン体系（austere 基調）へ移行する（B-354）。トップ・category 別一覧・個別詳細の3ルート＋yoji 専用部品 YojiDetail を対象とし、yoji→kanji 辞典への内部クロスリンクと SEO 構造（JSON-LD 4種・canonical・パンくず）を保全する。cycle-263（colors）/cycle-265（kanji）で確立した「共有 `_components` 依存型」の標準移行手順の5回目（同型）で、新規設計判断はほぼゼロ。

## 実施する作業

- [x] **T0**: yoji 専用部品 `YojiDetail`（`src/dictionary/_components/yoji/`）の in-place 新トークン化（YojiDetail.module.css の旧 `--color-*` 26箇所を新トークンへ・YojiDetail.tsx の yoji→kanji クロスリンク href は無改修で維持）＋ **h1 追加（DictionaryDetailLayout 設計契約の充足＝KanjiDetail/ColorDetail 同型化）**: 現状 YojiDetail は本体を装飾 span のみで出し h1 が無く h2 から始まる（見出し階層の欠陥）。装飾 span は残しつつ `<h1>四字熟語「○○○○」</h1>`（kanji の `漢字「○」` パターンに揃える）を追加。専用テスト `YojiDetail.test.tsx` に h1 存在アサーションを追加（既存の h2 アサーションは level:2 フィルタのため非破壊だが要確認）。JSON-LD DefinedTerm の name と h1 文言の齟齬が無いか確認
- [x] **T1**: トップ `/dictionary/yoji` 移行（page.tsx + YojiIndexClient.tsx + page.module.css を (new) へ `git mv`・**部品の所在別の差し替え**: page.tsx=CategoryNav と Breadcrumb(common→new) と TrustLevelBadge 撤去 / YojiIndexClient.tsx=DictionaryCard・SearchBox（→new/ フォーク）・インライン style 新トークン化・DictionaryGrid は legacy 直接再利用 / page.module.css 新トークン化・`.container` 付与）
- [x] **T2**: category `/dictionary/yoji/category/[category]` 移行（page.tsx + page.module.css を (new) へ・page.tsx は CategoryNav・DictionaryCard・DictionaryGrid を import〔CategoryNav/DictionaryCard→new/、DictionaryGrid は legacy 直接再利用〕・Breadcrumb(common→new)・TrustLevelBadge 撤去・新トークン化・`.container` 付与）
- [x] **T3**: 詳細 `/dictionary/yoji/[yoji]` 移行（page.tsx を (new) へ・DictionaryDetailLayout を new/ フォークへ差し替え・JSON-LD/metadata/パンくず/playRecommendations 無改修・YojiDetail は T0 済み）
- [x] **T4**: `src/app/(legacy)/__tests__/seo-coverage.test.ts` の yoji import 3箇所（`/dictionary/yoji`・`category/[category]`・`[yoji]`）を (new) へ追従（`play/yoji-kimeru` のゲーム本体 import は legacy 据え置き）
- [x] **検証**: 4ゲート（lint/format:check/test/build）+ typecheck + grep ゲート（旧 `--color-*` 残ゼロ・common 残参照ゼロ・legacy/yoji 空・new/ 部品採用確認・legacy 共有部品 diff 空・yoji→kanji クロスリンク href 維持）+ Playwright 視覚検証（mobile 360px 最優先 + desktop・クロスリンク往復・light/dark・console error 0・**yoji 詳細に h1 が1個だけ存在し kanji/color と同型の見出し階層になっていること**）
- [x] **レビュー**: 計画 reviewer（h1 論点の判定含む）→ 実装後に白紙 reviewer で成果物独立検証

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

## レビュー結果

本サイクルは「接地→移行設計→実装→検証→レビュー」の各段で独立サブエージェントに委譲し、3段のレビュー（計画 reviewer・視覚検証 reviewer・成果物 白紙 reviewer）すべてを通過した。

- **接地（GA4/SC・Playwright・foreground）**: yoji 系は **SC impressions 10,665・clicks 13・平均順位12・詳細が impressions の94%を担う長尾 SEO・organic 直接着地あり・mobile 79%**と判明（kanji 型）。humor 型ではなく kanji 型の評価軸（SEO 構造保全・mobile 最優先・回遊維持・順位を下げない）を設定。主要クエリは「四字熟語＋意味/読み方/とは」型。接地で**詳細ページの h1 欠落**を発見。
- **計画 reviewer（must 2件→対応後 must ゼロ承認）**: 当初 PM は h1 欠落を「独立変数だから移行と分離（別 backlog）」と判断したが、reviewer が **KanjiDetail・ColorDetail はいずれも h1 を持ち、3つの Detail 部品のうち yoji だけが h1 を欠く＝`new/DictionaryDetailLayout` 設計契約違反（既存バグ）**であることを実コードで指摘。PM は前提誤認を認め、**本サイクル内で h1 を kanji/color 同型に追加**へ方針変更（h1 化は独立 SEO 実験ではなく移行が解消すべきデザイン不統一の是正＝計測規律と矛盾しない）。importer 特定の誤り（M-2）・部品所在の明示（S-1）・評価軸更新（S-2）も対応し、再レビューで must ゼロ承認。
- **実装（builder T0〜T3 + PM 直 T4・小さく分割・逐次）**: T0=YojiDetail in-place 新トークン化（旧 `--color-*` 全置換）＋ h1 追加（`<h1>四字熟語「○○○○」</h1>`・装飾 span 残置・KanjiDetail 同型）＋ 専用テスト h1 アサーション追加、T1=トップ移行（git mv・Breadcrumb/CategoryNav/DictionaryCard/SearchBox を (new)/new へ・DictionaryGrid legacy 直接再利用・TrustLevelBadge 撤去・`.container`）、T2=category 移行（同型）、T3=詳細移行（DictionaryDetailLayout を new/ へ・JSON-LD/metadata/パンくず/クロスリンク無改修）、T4=seo-coverage.test.ts の yoji import 3経路を (new) へ追従（play/yoji-kimeru は legacy 据え置き）。いずれも設計逸脱なし。
- **検証（4ゲート + typecheck + grep + 視覚・foreground 本番配信）**: `lint/format:check/test/build` **exit 0×4**（test 343ファイル/**5679件**全通過＝h1 アサーション +1）＋ typecheck exit 0（`.next` 再生成後）。grep ゲート全合格（旧 `--color-*` 残ゼロ・common/旧部品参照ゼロ・legacy yoji 消滅・DictionaryGrid legacy 直接再利用確認・旧共有部品 diff 空・クロスリンク href 維持）。本番 `npm start` 配信で `.container`・h1=「四字熟語「一期一会」」1個・クロスリンク href を**先確認**（stale 事故なし）。Playwright 視覚検証は**全10項目 PASS**（austere 適合 light/dark・h1 が1個で正確・情報保全全要素・yoji↔kanji 双方向往復成功・検索/カテゴリナビ/400語グリッド機能・mobile 360px 横スクロールゼロ・console error 0）。
- **成果物 白紙 reviewer（must ゼロ承認）**: git diff/grep/Read で10観点を独立検証。スコープ厳守（他系統巻き込みなし）・legacy 共有部品 diff 空・new/ フォーク差し替え正否・旧トークンゼロ・SEO/metadata 保全（[yoji] diff は import 1行のみ）・クロスリンク維持・h1 設計契約充足（1個に収束）・テスト追従・seo-coverage import 追従・legacy yoji 完全消滅をすべて PASS。should 1件（legacy/kanji 等の空ディレクトリ残骸＝前サイクル由来・git 非追跡）は本サイクルで空ディレクトリ掃除を実施して解消。

有効な指摘はすべて対応済みで、残存する指摘・対応事項はない。

## キャリーオーバー

- なし。辞典移行（Phase 9.3）の4系統（colors/humor/kanji/yoji）が本サイクルで全完了。残る辞典関連の下流タスク（B-533 辞典の深掘り価値・B-534 学年×画数ページ）は Deferred の既存項目で本サイクルのスコープ外。`(legacy)/dictionary/` には共有 `layout.tsx` のみ残置（Phase 11=B-337 legacy 撤去で扱う）。
- **観測項目（既知・本移行と無関係）**: mobile 360px で CategoryNav チップ・SearchBox 等が 44px 未満の密配置だが legacy から不変で本移行による悪化なし（B-393/B-388 系の既存タップターゲット課題）。スコープ外。

## 事故記録

- **backlog の状態遷移漏れ（Queued 取り残し・start commit に混入）**: 本サイクル開始処理で、PM の最初の `docs/backlog.md` 編集（B-354 を Queued→Active へ移す操作）が **Read 前の Edit** だったためツールがエラーを返したが、同時に並行実行していた別エージェントの結果に気を取られ**そのエラーを見落とした**。結果 backlog.md は未ステージのまま「開始」コミット `79ec259a`（`docs/cycles/cycle-266.md` のみ・backlog.md 不含）が打たれ、**B-354 は Active に移らず Queued に残ったまま**サイクルが進行した。完了処理で気づき、B-354 を Queued→Done へ正しく移して是正済み（最終状態: Active 空・Done に B-354 在・Queued から消去＝実体確認済み）。プロダクト（コード・サイト・公開ドキュメント）への実害はなく、backlog の中間状態のみの不整合。
  - **根本原因**: (1) 自分のツール呼び出し（Edit）の結果（エラー）を確認せず次の操作へ進んだ。(2) 並行エージェントの結果に注意が向き、自分のフォアグラウンド操作の失敗を監視できなかった。Read-before-Edit はツール仕様上の必須前提であり、その違反エラーを見落とすと「変更したつもりで変更されていない」状態が黙って残る。
  - **再発防止**: ワークフロー AP として該当する既存項目が無いため、ワークフロー AP 点検 reviewer が新規候補（PM 自身のツール呼び出し結果の未確認＋並行実行時の自操作失敗の見落とし）を提示。記述案は本サイクルのレビュー報告に記載（`docs/anti-patterns/workflow.md` への追記は PM 判断に委ねる）。

## 補足事項

- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.e）の実行。新規論点は h1 欠落の扱い（→本サイクル内で kanji/color 同型化＝論点1で確定）に集約され、移行手法そのものは cycle-263/265 の確立パターンの踏襲。
- **新知見の活用**: route ファイルの `git mv` 後に `.next/types/validator.ts` が legacy パスを参照したまま stale 化し typecheck を壊す（knowledge §12）。`rm -rf .next` → `npm run build` で types 再生成して解消。本サイクルでも再現し、既知手順で対処。
- **h1 欠落是正の教訓**: 「デザイン移行は構造保全＝既存先例を踏襲」と判断する際、**踏襲元（kanji/color）の構造を実コードで確認せずに一般化すると前提を誤る**（AP-P16/AP-P24）。本件は kanji/color が h1 を持つことを確認しないまま「両者とも h1 を触らない」と誤って一般化していた。同一領域の先例構造は必ず実コードで裏取りする。docs/anti-patterns/ への追記要否は cycle-completion で判断。
- **ブログ判断: 不執筆**。reader-perspective で検討した結論。cycle-263/264/265 と同じく1系統のデザイン移行は来訪者に見える変化が局所的（yoji ページが austere になっただけ）で、h1 追加・設計契約充足は読者の生活に届く物語にならない。辞典4系統移行は本サイクルで完走したが、来訪者から見た「段階移行の完走」は legacy 撤去（Phase 11）まで体験として可視化されないため、Phase 11 到達時に「legacy を完全に畳んだ」物語として再評価する方が読者価値が出やすい。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-354 は本サイクル完了で Done へ移動）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（計画 reviewer must ゼロ承認・視覚検証全10項目 PASS・成果物 白紙 reviewer must ゼロ承認）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（exit 0×4・typecheck exit 0・test 343ファイル/5679件全通過）。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
