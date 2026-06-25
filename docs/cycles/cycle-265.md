---
id: 265
description: B-353 デザイン移行計画 Phase 9.3.d「dictionary kanji 系（漢字辞典: トップ index + 動的サブルート grade/radical/stroke + 詳細 [char]）の (new) デザイン体系への移行」。B-352（cycle-264・humor 系）完了で辞典移行チェーン（B-350→351→352→353→354）の4番目に着手する。kanji は humor の self-contained 型と異なり共有 `_components`（CategoryNav / DictionaryGrid / SearchBox / DictionaryDetailLayout）を多用する colors 型。cycle-263（colors）が `src/dictionary/_components/new/` にフォーク済みの CategoryNav / SearchBox / DictionaryDetailLayout を再利用し、DictionaryGrid は colors の先例どおりデザイン中立な legacy 版を直接再利用する（要・旧トークン非依存の確認）。対象は index（page.tsx + KanjiIndexClient.tsx）・3 動的サブルート（grade/[grade]・radical/[radical]・stroke/[count]）・詳細 [char]（DictionaryDetailLayout で KanjiDetail を包む）。共有部品差し替え（common→(new) Breadcrumb・TrustLevelBadge 撤去・_components/*→_components/new/*）と page.module.css の旧トークン置換（`--color-text-muted`×2 のみ）が要点。kanji-kanaru ↔ kanji 辞典の双方向クロスリンク（KanjiDetail.tsx 内 /play/kanji-kanaru）を維持する。cycle-261 の方向決定（DESIGN.md §7）に従い診断の視覚言語拡張は不適用・austere 基調で移行する。本サイクルは kanji 系のみ（yoji=B-354 は後続）。
started_at: 2026-06-25T08:47:02+0900
completed_at: 2026-06-25T10:09:15+0900
---

# サイクル-265

このサイクルでは **B-353（デザイン移行計画 Phase 9.3.d: dictionary kanji 系移行）** を実施する。

`(legacy)/dictionary/kanji/`（漢字辞典: トップ index + 動的サブルート grade/radical/stroke + 詳細 `[char]`）を、`(new)/` の新デザイン体系へ移行する。`docs/design-migration-plan.md` の Phase 9.3.d に相当し、辞典4系統移行（B-351〜354）の最後から2番目（残りは yoji=B-354）にあたる。

## 位置づけと前提

- **なぜ今か**: cycle-262（B-350・辞典トップ）→ cycle-263（B-351・colors）→ cycle-264（B-352・humor）と進めてきた辞典移行チェーンの継続で、B-350 完了により着手条件が解放されている（P1・Queued 先頭）。**kanji 辞典は humor（超低PV・回遊終点）と違い、検索から来訪者が実際に降り立つページ群**（grade/radical/stroke のロングテール需要、SC research の「2画の漢字 小学生」需要=B-534 はこの系統に乗る）。検索でたどり着いた来訪者がサイト全体と一貫した上質な画面で漢字情報を受け取れるようにすることは、デザイン混在の解消＝来訪者価値に直結する。同時に legacy 撤去（Phase 11）と後続 yoji 移行（B-354・B-534）への前進にもなる。
- **本サイクルは「colors 型」= 共有部品依存（humor の self-contained 型とは難所が異なる）**: 現物 grep で確認済み。kanji は index も3サブルートも詳細も共有 `_components`（CategoryNav / DictionaryGrid / SearchBox / DictionaryDetailLayout）を使う。よって cycle-263（colors）が `src/dictionary/_components/new/` にフォークした **CategoryNav / SearchBox / DictionaryDetailLayout を再利用**するのが基本線。**DictionaryGrid は cycle-263 で colors が new/ にフォークせず legacy 版を直接再利用した先例**（colors の category サブルートが `@/dictionary/_components/DictionaryGrid` を import）があり、これは DictionaryGrid がデザイン中立（旧 `--color-*` トークン非依存）であることを示唆する。kanji でも legacy DictionaryGrid を直接再利用する方針だが、**旧トークン非依存を Plan で再確認**する（依存があれば new/ へのフォーク要否を判断）。
- **austere 基調で移行・診断拡張は不適用**: 辞典は site-concept 3層では診断を支える「文化層」だが、cycle-261 の方向決定（DESIGN.md §7）は「拡張は診断のタッチポイント限定・道具・辞典本文・道具箱の austere 基調は維持」と明記。kanji 辞典の移行に結果固有色アイデンティティ・象徴絵文字といった診断の視覚言語拡張は**適用しない**。chrome（タイポ・カード・罫・余白）を移行済み index（colors/humor 等）と同じ標準 (new) austere 基調へ揃える。
- **スコープは kanji 系のみ**: 移行計画は 9.3.b〜e を各1サイクルに分割する方針。yoji（B-354）は legacy 残置で後続サイクル。kanji-kanaru ゲーム本体（`/play/kanji-kanaru`）はスコープ外（リンク先として維持するのみ）。

## 移行スコープ（接地済みの現物確認）

計画時に現物を grep/wc で確認して確定した（行数・import・トークン依存）:

- **対象ページ（7ファイル・計566行＋module.css）**:
  - `kanji/page.tsx`（index サーバー・103行）+ `kanji/KanjiIndexClient.tsx`（client・70行）+ `kanji/page.module.css`（12行）。トップは CategoryNav×3（grade/radical/stroke への導線）+ KanjiIndexClient（SearchBox + DictionaryGrid）。
  - `kanji/[char]/page.tsx`（詳細・55行）。`DictionaryDetailLayout` で `KanjiDetail`（`src/dictionary/_components/kanji/KanjiDetail.tsx`）を包む。**kanji-kanaru へのクロスリンクは KanjiDetail.tsx:114**（`/play/kanji-kanaru`）。
  - `kanji/grade/[grade]/page.tsx`（109行）・`kanji/radical/[radical]/page.tsx`（107行）・`kanji/stroke/[count]/page.tsx`（110行）。各サブルートは Breadcrumb + TrustLevelBadge + CategoryNav + DictionaryGrid。
- **共有部品の差し替え（cycle-262/263 で確立したパターンを踏襲）**:
  - `@/components/common/Breadcrumb` → `@/components/Breadcrumb`（(new) 版）。index/3サブルートで使用。
  - `@/components/common/TrustLevelBadge`（index/3サブルートで使用）→ (new) では**撤去**（cycle-262/263/264 と同方針。AI 運用注記は憲法ルール3に従いサイト共通の Footer/about 側で担保される前提を検証）。型/meta 値は legacy 使用中のため残す。
  - `@/dictionary/_components/CategoryNav` → `@/dictionary/_components/new/CategoryNav`（フォーク済み再利用）。
  - `@/dictionary/_components/SearchBox` → `@/dictionary/_components/new/SearchBox`（フォーク済み再利用）。
  - `@/dictionary/_components/DictionaryDetailLayout` → `@/dictionary/_components/new/DictionaryDetailLayout`（フォーク済み再利用。colors 詳細と同じ）。
  - `@/dictionary/_components/DictionaryGrid` → **legacy 版を直接再利用**（colors 先例。Plan で旧トークン非依存を再確認）。
- **詳細の内容コンポーネント**: `KanjiDetail`（`src/dictionary/_components/kanji/KanjiDetail.tsx` + `.module.css`）。旧トークン依存の有無を Plan/builder で確認し、依存があれば in-place 新トークン化（legacy 側 yoji 等が同コンポーネントを共用していないかを確認し、巻き込み事故を防ぐ）。**kanji-kanaru クロスリンクを無改修で維持**。
- **旧トークン依存（in-place 置換対象）**: `kanji/page.module.css` は `--color-text-muted`×2 のみ（軽量）。各サブルート・詳細が参照する module.css・KanjiDetail.module.css の旧 `--color-*` を Plan/builder で全数把握し、cycle-263 で確定した置換マップ（旧6種→`--fg`/`--fg-soft`/`--border`/`--bg`/`--bg-soft`、`--color-primary` は用途別）を踏襲。新 `globals.css` に旧 `--color-*` は無いため未置換が残ると崩れる（全消し grep で検証）。
- **データ/JSON-LD/OGP**: 既存 SEO ヘルパ（DefinedTermSet/Breadcrumb JSON-LD・generateStaticParams・OGP/Twitter）を**踏襲のみ**。移行で構造化データの出力内容を変えない。**双方向クロスリンク（kanji 詳細→kanji-kanaru / kanji-kanaru→kanji 辞典）の維持を実機で確認**。
- **設計判断（Plan で確定）**: ① DictionaryGrid を legacy 直接再利用でよいか（旧トークン非依存の確認）。② KanjiDetail.tsx/.module.css の新トークン化が legacy yoji 等に波及しないか（共用有無の確認）。③ 3サブルートと詳細のレイアウト統一を colors 移行と同水準に保つ手順。

## 実施する作業

- [x] **1. 接地（現状の来訪者体験の把握）**
  - [x] 1a. GA/SC 接地完了（`tmp/cycle-265/grounding-ga.md`）= kanji は humor と桁違いの実流入＝**SC 15,798 impressions・organic 直接着地あり・mobile/desktop 拮抗**（mobile 42%/desktop 40%/tablet 17%）。「○○ 部首」クエリ支配的で radical サブルート需要が実在。上位10位以内の高 impression ページ多数（袋/込/詩 等）。**数値KPIが意味を持つ水準＝順位良好ページの SEO 構造保全が最重要**を評価軸に確定
  - [x] 1b. 移行前スクショ20枚を `tmp/cycle-265/before/`（index + grade/1 + radical/一 + stroke/1 + 詳細「一」× w360/w1280 × light/dark）。保つべき核を `NOTES.md` に記録＝SearchBox・DictionaryGrid・学年/部首/画数 CategoryNav・詳細の読み/画数/部首/学年/用例・同部首リスト・kanji-kanaru クロスリンク・FAQ・ShareButtons・パンくず
- [x] **2. 移行設計の確定（Plan エージェント → reviewer）**
  - [x] 2a. 設計判断3点を確定（Plan・`tmp/cycle-265/design.md`）= ①**DictionaryGrid は legacy 直接再利用**（`--color-*` 非依存を grep 確認・colors 先例）②**KanjiDetail は in-place 新トークン化で安全**（importer は [char]/page.tsx とテストのみ＝kanji 専用・yoji 非共用）③トークン置換表を全 module.css 全数で確定。さらに**新発見=DictionaryCard は kanji/yoji 共用＋旧トークン7箇所＋austere 違反のため `new/DictionaryCard` へフォーク必須**（in-place は yoji 巻き込み）
  - [x] 2b. austere 歯止め確定（影/大角丸/transform/TrustLevelBadge 撤去・診断拡張不適用・辞典本文＋kanji-kanaru クロスリンクは維持）
  - [x] 2c. 計画レビュー（白紙 reviewer）= **must ゼロで承認**。should 2件（S-1 インライン style 含む `--color-` 全消し確認の明記・S-2 `new/DictionaryCard.test.tsx` を必須化）・nit 2件（N-1 valueProposition 増減・N-2 relatedLink 呼称＝検証観察項目）を builder タスクへ織り込み（設計の根本変更なしのため計画再レビューは回さず最終成果物レビューで履行確認）
- [x] **3. 移行実装（builder サブエージェント・小さく分割）**
  - [x] 3-0. グループ0=`new/DictionaryCard` フォーク新設（builder T0）= legacy をコピーし §3-d で新トークン化・austere 化（border 1px・radius 2px・影/transform 削除）・kanji/yoji 両分岐維持（B-354 再利用基盤）・legacy 不変・`new/__tests__/DictionaryCard.test.tsx` 追加（S-2 達成・4 tests pass）
  - [x] 3a. index 移行（builder T1）= `page.tsx`/`KanjiIndexClient.tsx`/`page.module.css` を git mv・Breadcrumb→(new)・CategoryNav/SearchBox/DictionaryCard→new/・TrustLevelBadge 撤去・新トークン化（インライン style 含む S-1 達成）・`.container` 付与・DictionaryGrid legacy 再利用・JSON-LD/収録数維持
  - [x] 3b. 3動的サブルート移行（builder T2・同型一括）= grade/radical/stroke を git mv・Breadcrumb/CategoryNav/DictionaryCard 差替・DictionaryGrid legacy 維持・TrustLevelBadge 撤去・各サブルートに `.container` の page.module.css 新設・generateStaticParams/metadata/収録数維持
  - [x] 3c. 詳細 [char] 移行（builder T3）= ディレクトリ git mv・(new) DictionaryDetailLayout 差替（唯一の import 変更）・KanjiDetail.module.css を §3-c で in-place 新トークン化（tsx 無改修）・kanji-kanaru クロスリンク無改修維持・OGP/Twitter/JSON-LD/generateStaticParams 全維持・付随要素（FAQ/Share/同部首リスト）保全
  - [x] 3d. テスト/参照追従（PM）= seo-coverage.test.ts の kanji 5 dynamic import を (new) パスへ差替（kanji-kanaru ゲーム本体 import は legacy 据え置き・非改変）
- [x] **4. 検証**
  - [x] 4a. `npm run lint && npm run format:check && npm run test && npm run build` **exit 0×4**（テスト 343ファイル/5678件全通過・kanji 全ルート: トップ static + [char]/grade/radical/stroke SSG prerender）。typecheck も exit 0。全体 grep ゲート: 旧 `--color-*` 残ゼロ・common 残参照ゼロ・`(legacy)/dictionary/kanji/` 空・new/DictionaryCard 採用4件・legacy 共有部品 diff 空・クロスリンク維持。**知見**: route の git mv で stale 化する `.next/dev/types/validator.ts` が pre-commit typecheck を壊す→`rm -rf .next/dev` で解消（docs/knowledge/nextjs.md §12 に記録）
  - [x] 4b. 視覚・回遊検証（foreground・本番 `npm start` 配信で `.container`/AIバッジ DOM ゼロを先確認）= after 20枚 `tmp/cycle-265/after/`・**全評価軸 PASS**（情報保全・回遊リンク実クリック全周回・kanji-kanaru 双方向往復成功・mobile w360 横スクロールなし・austere 化を computed style 実測〔radius 2px/border 1px/影 none/transform none〕・AI 注記 Footer 担保/TrustLevelBadge DOM ゼロ・light/dark 破綻なし・console error 0）
  - [x] 4c. 未移行 yoji を実機確認＝**legacy デザイン不変**（TrustLevelBadge/影付きカード継続・巻き込み事故なし）。`tmp/cycle-265/legacy-unchanged/`。kanji-kanaru ゲーム→辞典戻りリンクが新 (new) パスへ解決確認
- [x] **5. レビュー（白紙 reviewer）**
  - [x] 5a. 成果物レビュー（白紙 reviewer・本番ビルド配信確認＋自前 lint/test/build exit 0 のうえ9観点逐条検証）= **must/should ゼロで承認・完了可**（標準移行手順/デザイン体系適合〔用途別トークン判定〕/austere 歯止め/スコープ厳守〔legacy 共有部品 diff 空・yoji 巻き込みなし・new/DictionaryCard yoji 分岐は B-354 再利用＝非死蔵〕/SEO 構造保全〔JSON-LD・generateStaticParams・canonical/OGP・収録数 不変〕/kanji-kanaru 双方向維持/S-1・S-2 履行/テスト追従）
- [x] **6. 完了処理（`/cycle-completion`）**

## 作業計画

### 目的

漢字辞典（kanji 系: トップ + grade/radical/stroke + 詳細）を新デザイン体系へ移行し、来訪者体験を損なわず（視覚的・機能的に同等以上で）デザイン混在を一歩解消する。最終的な来訪者価値は「検索から漢字辞典に降り立った来訪者が、サイト全体と一貫した上質な画面で漢字情報（読み・画数・部首・学年・用例）を正確に受け取り、安心して回遊（サブルート横断・kanji-kanaru ゲーム往復）できること」。

### 作業内容

上記「実施する作業」のとおり。要点は4つ。

1. **接地を先に**（作業1）。kanji は humor と違い実流入があり得る。GA/SC で順位良好なページを特定し、SEO 構造保全を評価軸に組み込む。
2. **colors 型の共有部品移行を正しく行う**（作業2・3）。cycle-263 がフォークした `_components/new/`（CategoryNav/SearchBox/DictionaryDetailLayout）を再利用し、DictionaryGrid は colors 先例どおり legacy 直接再利用（旧トークン非依存を Plan で再確認）。最大の論点は KanjiDetail の新トークン化が legacy 側に波及しないかの確認。Plan→reviewer を経てから実装に入る（Review always）。
3. **austere 基調を守る**（作業2b・3）。診断の視覚言語拡張は持ち込まない。辞典本文（読み・画数・部首・用例）は正確に保つ。kanji-kanaru 双方向クロスリンクは無改修で維持する。
4. **スコープを kanji 系に限定**（タスクを小さく保つ）。yoji は legacy 残置で壊さず後続サイクルへ。タスクは index/サブルート/詳細でサブエージェントに分割委譲（接地・GA/Playwright は foreground、設計は Plan、実装は builder、レビューは白紙 reviewer）。

### 検討した他の選択肢と判断理由

- **DictionaryGrid を new/ へフォークする**: 保留（Plan で判断）。colors は legacy DictionaryGrid を直接再利用しており、DictionaryGrid がデザイン中立（旧トークン非依存）なら kanji でも同様にフォーク不要。スコープ最小・先例踏襲を優先。旧トークン依存が見つかった場合のみフォーク。
- **辞典4系統を一気に移行する**: 不採用。移行計画が各系統を各1サイクルに分割（タスクを小さく保つ・トレーサビリティ）。kanji は3サブルート＋詳細＋client と最も重く、単独サイクルが妥当。
- **kanji 詳細/サブルートに診断の視覚言語拡張を適用する**: 不採用。cycle-261 の歯止め（拡張は診断タッチポイント限定・辞典本文は austere 維持）に反する。
- **B-540（AP集 規約準拠クリーンアップ・P1）を先にやる**: 不採用。プロセス文書整備で来訪者価値の連鎖から遠い。移行チェーンを進める方が画面に直結し Phase 11 にも前進する。
- **ブログを書く**: 完了後の状態を見て再判断（cycle-263/264 と同方針）。辞典4系統移行（B-351〜354）を完走し legacy 撤去が見えた段階での再評価が読者価値を出しやすい。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md`（Phase 9.3.d の定義「トップ + 動的サブルート + 詳細・kanji-kanaru ↔ kanji 双方向クロスリンク維持」・「1ページ移行の標準手順」・段階移行整合性の検証項目）
- `docs/cycles/cycle-263.md`（B-351 colors 系移行の手順・`_components/new/` フォーク・DictionaryGrid legacy 直接再利用の先例・トークン置換マップ・austere 歯止め・本番ビルド配信先確認による stale 事故回避）
- `docs/cycles/cycle-264.md`（B-352 humor 移行＝self-contained 型の手順・common→(new) Breadcrumb/ShareButtons 差し替え・TrustLevelBadge 撤去・stale サーバ配信事故の教訓）
- `docs/cycles/cycle-261.md`（B-539 方向決定。DESIGN.md §7 = 拡張は診断タッチポイント限定・辞典本文は austere 維持＝本サイクルが austere で移行する根拠）
- `DESIGN.md`（§1〜§6 austere 基調・新トークン名・§7 診断の視覚言語と文化層への橋渡しの線引き）／`/frontend-design` SKILL（実装フェーズで参照）
- 現物確認（grep/wc 済）: kanji は共有 `_components`（CategoryNav/DictionaryGrid/SearchBox/DictionaryDetailLayout）使用の colors 型・index は page.tsx+KanjiIndexClient.tsx・3動的サブルート（grade/radical/stroke）・詳細 [char] は DictionaryDetailLayout で KanjiDetail を包む・kanji-kanaru クロスリンクは KanjiDetail.tsx:114・`page.module.css` は `--color-text-muted`×2 のみ・`_components/new/` に CategoryNav/SearchBox/DictionaryDetailLayout がフォーク済み（DictionaryGrid は無く colors は legacy 直接再利用）。

**外部仕様への依存**: 本サイクルの主作業（既存 index/サブルート/詳細の (new) 移行）は内部デザインシステムに閉じる。外部仕様接点は kanji-dict の JSON-LD（Schema.org）・OGP/Twitter カードだが、いずれも既存の移行済みページ（cycle-262/263/264・blog/tools）で確立済みのパターンを**踏襲するのみ**で、新規の外部仕様依存判断を導入しない。よって一次資料の新規事前確認は不要と判断する（新規の構造化データを設計する場合のみ既存パターン準拠を確認）。

## レビュー結果

本サイクルは「接地→移行設計→実装→検証→レビュー」の各段で独立したサブエージェントに委譲し、最終成果物は白紙 reviewer に独立検証させた。

- **接地（GA/SC・Playwright・foreground）**: kanji 系は humor（cycle-264）と桁違いの実流入＝**SC 15,798 impressions・organic 直接着地あり・mobile/desktop 拮抗**と判明。「○○ 部首」クエリ支配的で radical サブルートの需要が実在。よって評価軸を「数値比較放棄」ではなく「**順位良好ページの SEO 構造（JSON-LD・h1・canonical・内部リンク）保全・mobile/desktop 双方検証・回遊維持**」に設定。移行前 20枚と保つべき核（SearchBox・グリッド・CategoryNav 3種・詳細の読み/画数/部首/学年/用例・同部首リスト・kanji-kanaru クロスリンク・FAQ・ShareButtons）を記録。
- **移行設計（Plan → reviewer・must ゼロ承認）**: kanji は colors 型（共有 `_components` 依存）。cycle-263 フォーク済みの `new/CategoryNav`・`new/SearchBox`・`new/DictionaryDetailLayout` を再利用。設計判断＝①**DictionaryGrid は legacy 直接再利用**（旧トークン非依存を grep 確認・colors 先例）②**KanjiDetail は in-place 新トークン化で安全**（importer は [char]/page.tsx とテストのみ＝kanji 専用）③**新発見＝DictionaryCard は kanji/yoji 共用＋旧トークン7箇所＋austere 違反のため `new/DictionaryCard` へフォーク必須**（in-place は未移行 yoji を巻き込む）。reviewer は must ゼロで承認し should（S-1 インライン style 含む全消し確認の明記・S-2 new DictionaryCard テスト必須化）を builder タスクへ反映。
- **実装（builder T0〜T3 + Task T4・小さく分割）**: T0=`new/DictionaryCard` フォーク（austere 化・kanji/yoji 両分岐維持＝B-354 再利用基盤・テスト追加で S-2 達成・legacy 不変）、T1=index 移行（git mv・Breadcrumb/CategoryNav/SearchBox/DictionaryCard を (new)/new/ へ・TrustLevelBadge 撤去・インライン style 含む新トークン化で S-1 達成・`.container` 付与・DictionaryGrid legacy 再利用）、T2=3サブルート移行（同型一括・各 `.container` page.module.css 新設）、T3=詳細 [char] 移行（(new) DictionaryDetailLayout 差替・KanjiDetail.module.css in-place 新トークン化・tsx 無改修・kanji-kanaru クロスリンク維持・付随要素保全）、T4=seo-coverage.test.ts の kanji 5 import を (new) へ追従（ゲーム本体 import は据え置き）。いずれも設計逸脱なし。
- **検証（4ゲート + typecheck + 視覚・foreground 本番配信）**: `lint/format/test/build` **exit 0×4**（テスト 343ファイル/5678件全通過・kanji 全ルート SSG prerender）＋ typecheck exit 0。全体 grep ゲート全合格（旧 `--color-*` 残ゼロ・common 残参照ゼロ・legacy/kanji 空・new/DictionaryCard 採用4件・legacy 共有部品 diff 空・クロスリンク維持）。本番 `npm start` 配信で `.container` 出現・TrustLevelBadge DOM ゼロを**先確認**（stale 事故の再発なし）。Playwright 視覚検証は**全評価軸 PASS**（情報保全・回遊全周回・kanji-kanaru 双方向往復成功・mobile w360 横スクロールなし・austere 化を computed style 実測・AI 注記 Footer 担保・light/dark 破綻なし・console error 0）。未移行 yoji は legacy デザイン不変で巻き込み事故なし。
- **成果物レビュー（白紙 reviewer・must/should ゼロ承認）**: 9観点（標準移行手順・デザイン体系適合・austere 歯止め・スコープ厳守・段階移行整合・SEO 構造保全・クロスリンク・S-1/S-2 履行・ビルド健全性）を git diff/grep/自前ビルドで逐条検証。legacy 共有部品 diff 空・yoji 巻き込みなし・`new/DictionaryCard` yoji 分岐は B-354 再利用で非死蔵・[char]/page.tsx の実変更は import 1行のみで metadata/JSON-LD 不変・kanji-kanaru href 無改修を確認し、**must/should ゼロで承認**。

有効な指摘はすべて対応済みで、残存する指摘・対応事項はない。

## キャリーオーバー

- なし。後続の辞典移行（yoji=B-354）は本サイクルのスコープ外の既存下流タスク（Deferred）であり、本サイクルで新設した `new/DictionaryCard`（kanji/yoji 両分岐維持）が B-354 の再利用基盤になる。kanji-kanaru ゲーム本体（`/play/kanji-kanaru`）は URL 不変で legacy 残置のまま正常（Phase 11 で扱う）。
- **観測項目（既知・本移行と無関係）**: mobile w360 で CategoryNav チップ 35px・SearchBox 39px と 44px 未満だが、これは legacy から不変の密配置仕様で本移行による悪化なし（B-393/B-388 系の既存タップターゲット課題）。本移行のスコープ外。

## 補足事項

- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.d）の実行。新規設計判断は ①DictionaryGrid 再利用方式（legacy 直接）②KanjiDetail in-place の安全性 ③**DictionaryCard の new/ フォーク必須（kanji/yoji 共用部品の巻き込み回避）** に集約され、Plan → reviewer で確定した。③は colors（ColorCard 使用で DictionaryCard 不使用）では顕在化しなかった kanji 固有の論点。
- **新知見の記録**: route ファイルを `git mv` すると stale 化する `.next/dev/types/validator.ts` が pre-commit の typecheck を壊す（build は通るのに commit 不可）。`rm -rf .next/dev` で解消。後続の辞典移行（B-354）や Phase 11 でも再発するため `docs/knowledge/nextjs.md` §12 に記録した。
- **検証環境の知見（活用）**: cycle-262/263/264 の「移行系の視覚検証では配信中サーバが移行後ビルドかを新クラス等で先確認してから撮る」教訓を本サイクルでも適用し、stale 事故ゼロで完了。
- **ブログ判断: 不執筆**。reader-perspective で検討した結論。cycle-263/264 と同じく1系統のデザイン移行は来訪者に見える変化が局所的で、新設計判断（DictionaryCard フォーク・段階移行機構）は中間成果物として読者の生活に届かない。辞典4系統移行（B-351〜354）を完走し legacy 撤去が見えた段階で「段階移行を完走した」物語として再評価する方が読者価値が出やすい（cycle-263/264 と同方針）。残るは yoji=B-354 の1系統。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-353 は本サイクル完了で Done へ移動）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（計画 reviewer must ゼロ承認・視覚検証全軸 PASS・成果物 reviewer must/should ゼロ承認）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（exit 0×4・テスト 343ファイル/5678件全通過）。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
