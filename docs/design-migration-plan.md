# デザイン移行計画

> **【コンセプト更新の注記（cycle-259 / B-538）】** 本計画の目的#2「コア機能『道具箱』のタイル化対応を進める」および Phase 10（道具箱を `/` トップに公開・10.4 連携・10.5 シェア）は、**道具箱-as-core コンセプトを前提に書かれている**。このコンセプトは cycle-257（B-535）で実測の結果降ろされ、`docs/site-concept.md` は診断中心へ再センタリングされた。よって:
>
> - **目的#1（legacy→新デザイン体系へ全ページ移行）と Phase 11（legacy 撤去）は概念非依存で引き続き有効**。デザイン体系の統一とコード健全化は道具箱の地位と無関係に価値がある。辞典移行（Phase 9.3 / B-350 系）もこの文脈で実施（cycle-259 で要否確認済）。
> - **道具箱-paradigm 固有の投資（全面タイル化・Phase 10.4 連携 B-324・10.5 シェア B-313）は降格・保留**（cycle-259 で backlog 再編）。道具箱への追加投資は来訪者トラクションがデータで示されてから行う。
> - 道具箱がトップ `/` を占める現状の位置づけ自体の再設計は B-542（トップ`/`位置づけ再設計）で扱う。
>
> 詳細は `docs/cycles/cycle-259.md` / `docs/cycles/cycle-257.md`。

新デザインシステムへ既存全ページを段階的に移行する計画書。各 Phase を 1 つの Claude Code セッション = 1 サイクルで実施する単位とする。Phase は逐次進行。並行は前提にしない。Phase 内のサブタスクも逐次。

## 目的

- `(legacy)/` 配下の全ページを新コンポーネント体系（`src/components/` 直下）へ移行
- 移行と同時に、コア機能「道具箱」のタイル化対応を進める
- 移行完了時に `src/app/(legacy)/`、`src/app/old-globals.css`、`src/components/common/` を完全に削除
- 各ページの来訪者体験を損なわず、視覚的・機能的に同等以上の状態で完了する
- 来訪者から見える「デザイン混在期間」を最小化する。来訪者からは見えない作業（判断・基盤実装）を可能な限り前倒しし、可視のデザイン切替が始まる時点を遅らせる

## 移行アーキテクチャ

Route Group「複数 root layout」パターンを土台にする：

```
src/app/
├── (legacy)/  旧デザイン: layout.tsx → old-globals.css + src/components/common/
└── (new)/     新デザイン: layout.tsx → globals.css + src/components/
```

各 Route Group が独立した root layout を持つ。**移行は 1 ページずつ `git mv (legacy)/foo/ (new)/foo/` で開始し、その後デザイン適用作業が続く**。各ルートが独立しているため、移行済みページに旧スタイル / 旧コンポーネントが漏れることはない。

`metadata` は `src/lib/site-metadata.ts` の `sharedMetadata` を両 layout から import する。値の変更は `sharedMetadata` 1 か所のみで完結するよう一元化されている。

`(new)/` 配下のページは既定でインデックス対象（`sharedMetadata` の `robots: index=true`）。検索エンジンに公開したくないページは、そのページの `page.tsx` で `metadata` export または `generateMetadata` を使い `robots: { index: false, follow: ... }` を返す（既存パターン、例：`src/app/(legacy)/blog/tag/[tag]/page.tsx`）。`page.tsx` がインタラクティブで `"use client"` となる場合は、`page.tsx` を server component に保ち interactive 部分を子の client component に分離する（実例：`src/app/(new)/storybook/page.tsx` + `StorybookContent.tsx`）。

## Phase 一覧

### Phase 1: 着手前判断（完了済）

検索方針と既存コンテンツ整理の方針を確定するフェーズ。

- **1.1 検索方針判断**: 新デザインに横断検索を作らない（Phase 5 をスキップ、(legacy) の横断検索は Phase 11 で自然消滅）
- **1.2 既存コンテンツ整理方針**: 全コンテンツ移行 + cheatsheets を blog 記事として再編

**完了基準**: 上記方針が確定済み。Phase 8 の実施スコープに引き継がれる。

### Phase 2: 道具箱の基盤整備（完了済）

道具箱機能の **タイル概念定義** と **型契約** を確立するフェーズ。来訪者から見える変化はない。ダッシュボード本体（並び替え / 編集モード切替 / Undo / モーダル / 多タイル管理機構 / localStorage 配置永続化）は本 Phase の対象外。

サブタスク：

- **2.1** 設計判断（URL 構成 / メタ型構造）
- **2.2** タイル概念定義 + 型契約

  **タイル概念の定義**: 道具箱内に並ぶ「タイル」は、来訪者が **道具箱内で完結して機能を使えるコンパクトな UI 単位**。タイルに対する来訪者の操作（入力・閲覧・実行）はタイル内で閉じ、ページ遷移を伴わない設計を前提とする。**タイルは道具箱内で完結する UI 単位であり、操作がタイル内で閉じる**という性質は不変項として成立する。**タイルのルートは必ず `<Panel>`（`@/components/Panel`）でなければならない**——これは DESIGN.md §1「すべてのコンテンツはパネルに収まる」を構造で満たす不変項であり（`docs/knowledge/tile-architecture.md` §1 参照）、約50サイクルにわたった Panel 準拠未達の根本是正として cycle-226 で実証済みである。

  **タイルはフル機能の単一実装であり、詳細ページの本体そのものである。** 旧種別分類（(a) 1 対 1 / (b) 1 対多 / (c) 複数バリエーション の 3 形態・kind=widget 等の Discriminated Union 設計）は cycle-220 の単一抽象により廃止された。**ただし廃止されたのは kind=widget による「道具箱版と詳細ページ版の分裂」であり、同一コンポーネントの `variant` prop による提示バリエーション（1ツール n タイル）は廃止されていない。** 1ツール n タイル（variant による提示バリエーション）は `docs/knowledge/tile-architecture.md` §2 で確立済みの正典である（cycle-226 の url-encode full/encode/decode で実証済み）。現行正典は `docs/knowledge/tile-architecture.md`（cycle-226 以降）および `docs/cycles/cycle-220.md` §T-3 を参照。コード上の kind 分類（`tile-definition.ts` の Discriminated Union）は cycle-225 T-8 で撤去済み（B-490 完了）。

  > **【B-488 是正注記】** 旧 Phase 2.2 では「Phase 2.1 #3 で示される通り、(a) 1 対 1 / (b) 1 対多（タイル用の簡素な別 UI）/ (c) 複数バリエーション の 3 形態が想定される」と記述されていた。この 3 形態分類・種別設計（特に kind=widget による分裂）は cycle-220 の単一抽象（タイルはフル機能の単一実装・種別分類しない）により**廃止・置換された旧設計**である。歴史的事実として記録する。なお variant による同一コンポーネントの提示バリエーション（1ツール n タイル）は廃止されておらず、`docs/knowledge/tile-architecture.md` §2 が現行正典。

  **型契約の整備**: 2.1 の決定に従って、メタ型に「タイルとして表示するためのインタフェース」を追加する。

  **検証**: 型レベル（`tsc`）と単体テスト（vitest）で行う。実コンポーネント（DnD / 編集 / 永続化 / モーダル）は本 Phase の対象外。

**完了基準**: 設計判断と型契約の整備、タイル概念定義が確定済み。

---

**【cycle-199 補完】Phase 2.1 確定値の追記**

Phase 2 完了時点では 2.1 の確定値が本文に明記されておらず、cycle-199 で欠落が発覚した。以下は cycle-199（`docs/cycles/cycle-199.md`）で実装・確定した内容を補完記録したものである。論点比較・設計判断の経緯は cycle-199.md を参照。

**メタ型の扱い方針（確定・一部撤去済）**

既存 4 系統のメタ型（ToolMeta / CheatsheetMeta / play 系 registry / dictionary-meta / humor-dict meta）には touch しない。**【撤去済み（cycle-225 T-8 / B-490）】** かつての単一宣言ファイル `src/tools/_constants/tile-declarations.ts`（`TileRegistryEntry[]` 型の `TILE_DECLARATIONS` 配列）および型定義の一次資料であった `src/tools/_constants/tile-definition.ts`（Discriminated Union・kind 分類）は、cycle-225 T-8 で一括撤去済み。現在 `src/tools/_constants/` には `tile-grid.ts` のみ存在する。現行の実装 SSoT は各ツールの `XxxTile.tsx`（単一正典コンポーネント）であり、確立パターンは `docs/knowledge/tile-architecture.md` に記録されている（cycle-226 以降）。

**1 対多サポート再構成範囲（確定）**

> **【B-488 是正注記】** 以下の kind 設計（single/widget/multi の 3 形態 Discriminated Union）は cycle-220 の単一抽象（タイルはフル機能の単一実装・種別分類しない）により**廃止・置換された旧設計**である。**【撤去済み（cycle-225 T-8 / B-490）】** コード上の kind 分類（`tile-definition.ts` の Discriminated Union）は cycle-225 T-8 で撤去完了済み（旧来の「T-3 で確認・キャリーオーバー候補」の注記は完了事実により無効）。現行正典は `docs/knowledge/tile-architecture.md`（cycle-226 以降）および `docs/cycles/cycle-220.md` §T-3 を参照。

Phase 2.2 の 3 形態 (a)/(b)/(c) および Phase 8.1 step3 の手順から、3 形態を Discriminated Union として型レベルで強制する設計を採用した。形態識別子 `kind` の具体値と原典対応は以下の通り（廃止された旧設計として記録）：

| kind       | 原典 | 説明                                       |
| ---------- | ---- | ------------------------------------------ |
| `"single"` | (a)  | 1 対 1：詳細ページ本体をそのままタイル化   |
| `"widget"` | (b)  | 1 対多：タイル専用の簡素な別 UI            |
| `"multi"`  | (c)  | 複数バリエーション：用途別に複数タイル種類 |

optional フィールドによる形態間制約の緩和は禁止（AP-I02 対応）。形態固有フィールドはそれぞれの型に required として定義する。

**URL 構成（未決定）**

道具箱本体の URL（トップ `/` に配置するか専用 URL を設けるか）は cycle-199 では決定しなかった。Phase 10.3 の責務として扱う。Phase 10.3 着手 PM は「Phase 2.1 で URL が決まった」と読まないこと。Phase 4「一覧・トップ移行」および Phase 10.3「道具箱ページの本公開」内の「Phase 2.1 で決めた URL」参照は、Phase 10.3 で初めて解決される（旧記述の行番号参照は編集のたびにずれるため節名参照に変更・D-1 訂正）。

---

### Phase 3: 静的 + リダイレクト先行（完了済）

来訪者から見える「デザイン混在期間」がここから始まる。低リスクのページを最初に切替える。

- **3.1** 静的ページ移行：`/about`、`/privacy`、`/not-found`、`/feed`（RSS）、`/feed/atom`（Atom）
- **3.2** リダイレクト専用ディレクトリの移動：`/memos`、`/memos/[id]`、`/memos/feed`、`/memos/feed/atom`、`/memos/thread/[id]`

**完了基準**: 上記すべての URL が `(new)/` 配下で動作。Playwright 視覚確認で旧と同等以上の見た目と動作。

### Phase 4: 一覧・トップ移行（完了済）

リスト系で新デザインのリスト/カード系パターンを確立してから、それを集約する形でトップを移行する。Phase 2.1 で決定した新メタ型を前提に実装する。

- **4.1** ツール一覧：`/tools`、`/tools/page/[page]`
- **4.2** 遊び一覧：`/play`
- **4.3** ブログ一覧：`/blog`、`/blog/page/[page]`、`/blog/category/[category]`、`/blog/tag/[tag]`
- **4.4** トップ：`/`

トップ（4.4）は現行のトップ内容を新デザインに移行する。Phase 2.1 で「URL=トップ」を採用した場合は Phase 10.3 でこれを道具箱に置き換える。それまではトップは現行内容のまま動く。

**a11y 配慮の責務**: グローバルナビ / 一覧 / サイトマップ / タグで複数経路（WCAG 2.4.5 Multiple Ways）を Phase 4 標準スコープを超えて丁寧に作る。`aria-current`、focus-visible、コントラスト 4.5:1、タップターゲット 44px を含む。

**完了基準**: 4 つの主要セクションが `(new)/` 配下で動作し、Header / Footer の動線が新版に統一される。リンク先（記事詳細、ツール詳細など）は移行済みの新ページ or 未移行の legacy ページのいずれでも崩れない。

### Phase 5: 検索の実装（実施しない）

Phase 1.1 の方針（横断検索を作らない）により、Phase 5 は **実施しない**。Phase 4 で用意した Header の actions スロット / 検索アイコン枠 / Cmd+K 受け口は (new) Route Group では未結線のまま Phase 11 まで維持され、(legacy) Route Group 全廃と一体で旧 search 群ごと撤去される。

**完了基準**: 本 Phase は実施しない。

### Phase 6: ブログ詳細移行（完了済）

- **6.1** `/blog/[slug]`：記事 100+ 件のテンプレ移行

ブログ系（一覧 → 詳細）が Phase 4 → Phase 6 で完結する。

**完了基準**: すべての記事が `(new)/` 配下で表示でき、Article JSON-LD、目次、シェアボタン、関連記事などの既存機能が移行後も動作する。

### Phase 7: タイル基盤実装（完了済 - cycle-199。ただし 7.1/7.3 実装成果物は cycle-225 B-490 で撤去済み。tile-grid.ts のみ現役）

タイルが道具箱に並ぶための型契約・サイズ枠規格・レジストリの仕組みを確定する。来訪者から見える変化はない。本 Phase は個別ツール / 遊びの実装には触れない（それらの移行は Phase 8 で実施する）。

サブタスクを順に：

- **7.1** タイル登録の型契約（**実装は cycle-225 T-8 で撤去済み**）
  - **【撤去済み（cycle-225 T-8 / B-490）】** Tileable / TileComponent 等のインタフェース、および `tile-declarations.ts` が宣言 SSoT とする機構は cycle-225 T-8 で一括撤去済み。「Phase 2.1 で確定したメタ型の扱い方針（既存 4 系統のメタ型には touch しない・`tile-declarations.ts` が宣言 SSoT）に従う」という指示は無効。現行の実装 SSoT は各ツールの `XxxTile.tsx` であり、`docs/knowledge/tile-architecture.md` が確立パターンを記録している
  - 歴史的記録: cycle-199 時点では Phase 2.1 の決定に従って、メタ型に「タイルとして表示するためのインタフェース」を追加する計画であった

- **7.2** サイズ枠規格の確定と定数化
  - **基本セルサイズ**: 1 セル `128px × 128px`
  - **セル間マージン**: `8px`
  - **多セル対応**: タイルは n × m セル（整数倍）に拡張可能。実サイズは `(128n + 8(n-1))px × (128m + 8(m-1))px`
  - **定数化**: 上記値を `src/tools/_constants/tile-grid.ts`（または同等の単一ファイル）に定数として定義（例: `TILE_CELL_PX = 128` / `TILE_GAP_PX = 8` / `tileSizeStyle(w, h)` ヘルパー）。Phase 8 で実装する各タイル、既存の道具箱（`/toolbox`）はすべて当該定数を参照する（`tile-grid.ts` は cycle-199 以降現役）。個別タイル内に数値を直書きしない。CSS Module 側で参照する場合は `:export` または CSS 変数経由で同じ値を共有する

- **7.3** レジストリの仕組み（**実装は cycle-225 T-8 で撤去済み**）
  - **【撤去済み（cycle-225 T-8 / B-490）】** codegen タイル一覧集約（`scripts/generate-tiles-registry.ts` および `src/tools/generated/tiles-registry.ts`）、タイル単独表示の hidden 検証ルート（`src/app/(new)/internal/tiles/`）、およびレジストリ経由で一覧化される構造はすべて cycle-225 T-8 で一括撤去済み（`find src/app/(new)/internal -type f` → 0 件で実測確認）。
  - **現行の検証環境**: 道具箱 `/toolbox` が生きたタイル（39枚・実機 Playwright 検証済み）を描画する実検証環境として機能している（cycle-226-228 B-497 完了）。旧来の `/internal/tiles` に相当する役割を道具箱が果たす

**検証**: 型レベル（`tsc`）と単体テスト（vitest）で行う。実タイルが存在しないため Storybook 表示や hidden URL での視覚検証は本 Phase 対象外。タイル単独表示の視覚検証は Phase 8 各サイクルで実施する。

**本 Phase に含めないもの**:

- Tile コンポーネント本体（各タイルの実装は Phase 8 各サイクルで行う）
- DnD / 編集モード / モーダル / Undo / 多タイル管理機構（Phase 10）
- useToolStorage / PrivacyBadge 等の個別コンポーネント（必要が出てきたら Phase 8 で整理）
- ダッシュボード永続化スキーマ / タイル間連携（Phase 10）

**完了基準（達成済 - cycle-199。ただし注記あり）**: 7.1〜7.3 が実装され、`tsc` と vitest テストが通る状態として cycle-199 で達成済み（completed_at: 2026-05-21T14:36:59+0900）。**ただし 7.1（型契約）と 7.3（/internal/tiles・codegen レジストリ）の実装成果物は cycle-225 T-8（B-490）で後から撤去済み。tile-grid.ts（7.2 の成果物）のみ現役。** Phase 8 で各コンテンツがタイル定義を埋める規格の現行形は `docs/knowledge/tile-architecture.md` に記録されている（cycle-226 以降）。

### Phase 8: ツール・遊び詳細 + タイル化（同時実施）

**【核心ルール】** タイル実装のすべては `docs/knowledge/tile-architecture.md` §1-§5 の確立パターンに従う（cycle-226 で実証済み）。特に §5「やってはならないこと」（ナビゲーションを作る・タイルを実装から切り離す・バリエーション別実装・機能を枠に合わせて削る・詳細ページと道具箱を別実装にする）を必ず参照すること。このパターンから外れると cycle-175〜225 の約50サイクル繰り返した設計破壊が再発する。

各コンテンツを 1 つずつ「詳細ページ移行 + タイル定義」を同サイクルで実施。「2 回の作り直し」を避けるための同時実施。

ツール / 遊びそれぞれの順序は、GA4 ページビュー高い順 + 構造単純な順を基本に決定する。

サブタスクを順に：

- **8.1** ツール群の移行 + タイル化（34 ルート、各 1 サイクル）**（完了済 - cycle-228 B-497。34/34 タイル＋道具箱39枚・実機 Playwright 検証済み）**
  - 対象：age-calculator / base64 / bmi-calculator / business-email / byte-counter / char-count / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter
  - 各サイクルで実施する内容：
    1. ロジックの CSS Module を新トークンに置換
    2. 詳細ページ（`/tools/<slug>`）を `(new)/` 配下に移動し DESIGN.md に従ってデザイン適用（後述「1 ページ移行の標準手順」参照）
    3. Phase 7.1 の型契約に沿って、ツールのフル機能を単一のタイルに実装する（ナビゲーションカードではない）。ツールページはそのタイルを主役（ファーストビュー）に描画する（`docs/cycles/cycle-220.md` L236 の確定提示方式）。タイル専用の別コンポーネント（種別分類）は作らない。1 ツール＝1 実装とし、作り直し完了時に当該 Component.tsx を削除する
    4. **【Phase 7.1 型契約は撤去済み（cycle-225 T-8）】** 旧来の「Phase 7.1 の型契約を埋める（tile-declarations.ts への登録等）」というステップは無効。代わりに `docs/knowledge/tile-architecture.md` の確立パターン（各ツールの `XxxTile.tsx` が単一正典コンポーネント・ルートは `<Panel>`）に従う。推奨サイズは Phase 7.2 サイズ枠規格に従い `tile-grid` 定数で表現する（`tile-grid.ts` は現役）
    5. **道具箱 + 詳細ページ検証**: タイルを持つコンテンツについては、道具箱（`/toolbox`）に生きたタイルとして組み込まれ、ページ遷移なしに動作することを Playwright で確認する（`page.url()` 不変・full reload／`framenavigated` 無発生。`docs/knowledge/tile-architecture.md` §4 合格条件参照）。詳細ページのヒーローが同一タイルコンポーネントで同一動作することもあわせて確認する。タイル定義を持たないコンテンツ（L184「タイル化に馴染まないコンテンツ」）は詳細ページ内で確認する。旧記述「道具箱機構への組み込みは Phase 10 で行う」は原設計逸脱（cycle-178 由来・A-1）のため撤廃。cycle-226 以降 /toolbox は既存・実機検証済み

- **8.2** 遊び群の移行 + タイル化判断（20 ルート + result ページ、各 1 サイクル）
  - ゲーム（4 種）：irodori / kanji-kanaru / nakamawake / yoji-kimeru
  - クイズ（15 種）：animal-personality / character-fortune / character-personality / contrarian-fortune / impossible-advice / japanese-culture / kanji-level / kotowaza-level / music-personality / science-thinking / traditional-color / unexpected-compatibility / word-sense-personality / yoji-level / yoji-personality
  - 占い（1 種）：daily（`/play/daily` として共通ルートに既存）
  - 共通ルート：`/play/[slug]`、`/play/[slug]/result`、`/play/[slug]/result/[resultId]`
  - 各サイクルで実施する内容は 8.1 と同様。タイル化に馴染まないコンテンツ（ブログ的な遊びなど）は詳細ページのデザイン移行のみ行いタイル定義は付けない

- **8.3** サイズ枠定数の最終整合確認
  - 8.1 / 8.2 が完了した時点で、全タイルが `tile-grid` 定数を参照していること、個別タイル内に `128` / `8` などの数値直書きが残っていないことを `grep` で確認
  - サイズ枠規格が既存の道具箱（`/toolbox`）および Phase 10 の拡充実装で正しく機能することを確認する。逸脱があれば本 Phase 内で訂正する

**完了基準**: 各コンテンツが `(new)/` 配下で動作し、タイルがフル機能で単一実装されている（機能劣後ゼロ。Component と同等以上のフル機能を単一の Tile 形で実装済み）。タイルを持つコンテンツについては、道具箱（`/toolbox`）でタイル内のツールがページ遷移なしに動くこと（`page.url()` 不変・full reload／`framenavigated` 無発生。`docs/knowledge/tile-architecture.md` §4 合格条件参照）、および詳細ページのヒーローが同一コンポーネントで同一動作することを確認する。タイル定義を持たないコンテンツ（L184「タイル化に馴染まないコンテンツ」例外）は詳細ページ内で確認する。各ロジックの CSS Module から旧 `--color-*` トークン参照が消えている。全タイルが Phase 7.2 の `tile-grid` 定数（128px × 128px、8px マージン）を参照している。当該ツールの Component.tsx が削除され、実装が1つになっている。

### Phase 9: 既存コンテンツ整理の実施

Phase 1.2 の方針「全移行 + cheatsheets ブログ化」に従って実施。Phase 8 同様、各サブタスクは独立した移行単位 = 各 1 サイクルで実施する。

サブタスク（並行可、ただし 9.3.b〜9.3.e は 9.3.a の後）：

- **9.1** 実績システムへの対応 — **完了（cycle-236・B-338）: ② 撤去を実施済み**
  - **【完了注記（cycle-236・B-338）】** 実績システムを撤去完了。削除 38 ファイル（`src/lib/achievements/` 一式・`(legacy)/achievements/` ページ一式・humor-dict RecordPlay）・編集 24 ファイル（両 layout の AchievementProvider 解除・StreakBadge 解除〔(new) layout actions と legacy common/Header〕・新旧 Footer の「実績」リンク削除・sitemap エントリ削除・trust-levels エントリ 1 行削除・bundle-budget ホワイトリスト削除・analytics の trackAchievementUnlock 削除・recordPlay 解除 7 ファイル〔GA level_end 等の併存機能は保持〕・fortuneStore の getTodayJst を crossGameProgress 直参照へ張り替え）。旧 URL `/achievements` は標準 404（実機確認済み）・localStorage キー `yolos-achievements` の掃除コードは追加せず（読み書きコード消失で書き込み停止・既存データは実害なし）。本番の表示バグ（「今日の進捗」に生 ID 3 件表示）は撤去で解消。残存参照 grep 0 件・4 ゲート全通過（test 333 ファイル・5498 件）・Playwright 実機検証全項目合格（404・ヘッダー無痕跡・ゲーム/運勢の非破損）。詳細は docs/cycles/cycle-236.md。
  - 新コンセプト「日常の傍にある道具」と実績システム（ゲームクリアでバッジ獲得 / ストリーク追跡）の整合を評価
  - **判断済み（cycle-235・B-355）: ② 撤去を採用**。評価軸 4 つ（コンセプト整合・ターゲット寄与・利用実態・コスト）すべてが撤去を支持（`/achievements` は観測可能な全期間約 17 週で 6 PV・SC 表示 0・ストリーク到達者 1 人のみ。対象 20 コンテンツはすべて遊び系で道具ゼロ）。詳細スコープ（移行計画の当初列挙 + sitemap / trust-levels / bundle-budget / fortuneStore の getTodayJst import 張り替え等の追加項目）は docs/cycles/cycle-235.md「判断（T-3 の結論）」を SSoT とする
  - 旧 URL `/achievements` は**リダイレクト・410 とも実装せず標準 404 とする**（当初案「410 Gone またはトップへリダイレクト」を実測根拠で上書き: 検索流入 0・SC 表示 0・内部リンクは撤去と同時に消えるため実害が想定されない。cycle-233 で確立した「実害なき旧 URL にリダイレクトを積まない」に従う。B-338 実施時点で 404 着地が観測されたら再判断）
  - ~~① 存続: `/achievements` を `(new)/` へ移行（標準手順）~~（不採用）
- **9.2** cheatsheets を blog 記事として再編
  - **9.2.a** `cron` をブログ記事に転換
  - **9.2.b** `git` をブログ記事に転換
  - **9.2.c** `html-tags` をブログ記事に転換
  - **9.2.d** `http-status-codes` をブログ記事に転換
  - **9.2.e** `markdown` をブログ記事に転換
  - **9.2.f** `regex` をブログ記事に転換
  - **9.2.g** `sql` をブログ記事に転換
  - **9.2.h** `src/cheatsheets/` と `(legacy)/cheatsheets/` ディレクトリ撤去 + 旧 URL から blog 記事へのリダイレクト設定（9.2.a〜g 完了後）
  - **【経緯注記（cycle-244・B-511）】** 9.2 の当初計画は「チートシートの内容をブログへ移行し、その後ページを削除する」だった。しかし cycle-243 で内容を十分に移行しないままページが削除され、旧 URL が内容の異なる解説記事へリダイレクトされる状態になった（憲法ルール2違反が本番に残存）。cycle-244（B-511）で、削除された早見表を独立した早見表記事（`/blog/*-cheatsheet` 6 本）として正しく復元し、旧 `/cheatsheets/*` を早見表記事へ向け直して是正した。http-status は既存ガイドに網羅早見表があるため、そのアンカーへ誘導している。
- **9.3** 辞典 4 系統を `(new)/` へ移行
  - **9.3.a** dictionary トップ `/dictionary`
  - **9.3.b** `colors` 系（トップ + 詳細 + category）（9.3.a 後）
  - **9.3.c** `humor` 系（トップ + 詳細）（9.3.a 後）
  - **9.3.d** `kanji` 系（トップ + 動的サブルート + 詳細）（9.3.a 後）。kanji-kanaru ↔ kanji 辞典の双方向クロスリンク維持
  - **9.3.e** `yoji` 系（トップ + category + 詳細）（9.3.a + 9.3.d の後）。yoji 詳細から kanji 詳細への内部リンク維持

**ツール化（漢字検索ツール / 四字熟語検索ツール 等）は本 Phase の対象外**。データ資産（kanji-data.json 2,136 字、yoji-data.json 400 語等）を活かしたインタラクティブツール化は、移行完了後に独立した機能追加として別 backlog で扱う。

各サブタスクは Phase 3〜8 と同じ「1 ページ移行の標準手順」に従う。テンプレート駆動のコンテンツ（kanji 2,136 字、yoji 400 語等）はテンプレート 1 件改修で大量の動的サブルートを一括移行できる。

**完了基準**: 9.1〜9.3 のすべてのサブタスクが完了し、各ルートが `(new)/` 配下で動作する（cheatsheets は blog 記事として再編済みで旧 URL がリダイレクト）。`(legacy)/dictionary/`・`(legacy)/cheatsheets/`・`(legacy)/achievements/` ディレクトリと `src/cheatsheets/` が残らない。yoji 詳細から kanji 詳細への内部リンク、kanji 詳細と kanji-kanaru の双方向リンクなどが移行後も機能する。

### Phase 10: 道具箱機能の拡充と公開

**達成済み状態（cycle-226-228 B-497 完了）**: 34/34 ツールタイルが道具箱（`/toolbox`）で生きたまま動く（39枚のライブタイル・noindex プレビュー）。Phase 10 の残タスクは「道具箱をそのまま公開するための拡充機能追加」と「正式公開」である。旧記述「道具箱のダッシュボード本体を本 Phase で初めて実装する」は原設計逸脱（cycle-194 由来・A-4）のため撤廃。

周辺機能（プリセット / 連携 / シェア）を実装し、来訪者へ正式公開する。

サブタスクを順に：

- **10.1** ダッシュボード本体の拡充実装（完了済 - cycle-230）

  **【完了注記（cycle-230・B-504/B-434）】** 公開に向けた中核機構＝「来訪者がタイルを外す・追加でき、構成（どのタイルが・どの順で並ぶか。並び順は外す/追加の結果としてカタログ定義位置に従う＝並べ替え操作そのもの（DnD）は後続）が localStorage に保持され、リセットでデフォルトに戻せる」を実装済み（カタログ39エントリのデータ化・バージョン付きスキーマ・破損フォールバック・hydration 安全。本番ビルド + Playwright で遷移なし動作・リロード保持・w360/w1280×light/dark を実機検証済み）。B-434（w360）は現行実装で再現せず解消済み確認。DnD 並べ替え・編集モード・Undo・モーダル等は下記の整理どおり「公開後に順次追加する機能」のまま残る（10.1 の完了条件ではない）。詳細は docs/cycles/cycle-230.md。

  cycle-226 以降 `/toolbox` は noindex プレビューとして既存であり、来訪者が好きなタイルを並べて使う個人ダッシュボードとして機能している。Phase 10.1 では公開に向けた中核機構を追加実装する。DnD・編集モード・localStorage 配置永続化・Undo・モーダル・多タイル管理機構等は「道具箱の初回公開の前提条件」ではなく「**公開後に順次追加する機能**」として整理する（原設計の核は「気に入ったツールを1画面にまとめられる」であり、複雑機能の全揃えより道具箱が動くことが優先。`docs/site-concept.md` L7 参照）。Phase 10.1 に対応する backlog タスクは B-504 として起票され cycle-230 で完了済み（B-434 w360 も同サイクルで解消済み確認。B-433 入力値 localStorage は未着手の独立タスクとして残る。B-312＝Phase 10.2 プリセット・B-324＝Phase 10.4 連携・B-313＝Phase 10.5 シェアはそれぞれ別フェーズ。「DnD 等は B-312 が担う」と読まないこと）。

  実装内容の具体仕様（DnD ライブラリ選定・編集モード設計等）は本 Phase 着手サイクル PM が `/toolbox` の実物を観察した上で判断する。Phase 8 で揃った実タイル群を観察した上で、無理のないサイクル分割で進める。

- **10.2** 構築済み道具箱テンプレート（完了済 - cycle-231）
  - ペルソナ別プリセット（文章を書く人向け・プログラマー向け等）
  - オンボーディング動線
  - 10.3 で default content として組み込む形で利用する

  **【完了注記（cycle-231・B-312）】** ペルソナ別プリセット5本（文章を書く／開発／事務・ビジネス／暮らし／デザイン・Web制作）を設計・実装済み。`/toolbox` 冒頭の「プリセットから始める」（インライン選択 UI・モーダルなし）で適用でき、構成は既存の localStorage 永続化に乗る。手作業構成の誤消去防止（インライン確認）付き。プリセットデータ（src/app/(new)/toolbox/toolbox-presets.ts）は UI から独立しており 10.3 が default content としてそのまま再利用できる。10.3 初期表示の設計者見立て（第一候補 daily-life）と選定理由は docs/cycles/cycle-231.md 参照。表示モデル: デフォルト構成（全39）のみカテゴリ見出し付き・それ以外は見出しなし単一グリッドで構成順描画・追加は末尾。

- **10.3** 道具箱ページの本公開（完了済 - cycle-232）
  - Phase 2.1 で決まった URL に道具箱ページを配置
  - 10.2 のプリセットを default content として組み込み、初回来訪者に空状態を見せない
  - URL=トップの場合：Phase 4.4 で移行した現行トップ内容を、Phase 2.1 で決めた戦略に従って別ページに移す / 統合する / 廃棄する
  - URL=専用の場合：それまで noindex 等で隠れていた検証用ページを正式公開状態にアップグレード
  - 10.4 / 10.5 は公開後に順次有効化する（**文言訂正（cycle-232 T-10）**: 旧記述「10.4 / 10.5 も本公開時に有効化する」は、Phase 10 サブタスクの列挙順〔10.3 が 10.4/10.5 に先行〕および Phase 10.1 の整理〔連携・シェアは「公開後に順次追加する機能」〕と矛盾するため訂正。cycle-229 の原設計訂正（B-501）では本行は見直し対象に含まれず原文残存していた。詳細は docs/cycles/cycle-232.md 計画「Phase 10.4 / 10.5 との順序の解釈」参照）

  **【完了注記（cycle-232・B-336）】** URL は**トップ `/`** を採用（Phase 2.1 から持ち越された未決定事項を cycle-232 T-2 で4案比較のうえ決定。判断材料: トップへの検索流入0・流入の約79%が個別コンテンツへの検索直行・原典 site-concept L7 の中核機能をサイトの顔に置く）。トップを道具箱ページ本体に置換し、旧トップ内容（占い・診断ヒーロー等）は廃棄（息抜きはヘッダー「遊び」から到達可）。旧 `/toolbox` は `/` へ permanent redirect（localStorage 構成はオリジン単位のため引き継がれる）。default content は daily-life プリセット6枚（リセットの戻り先も同プリセット・全39枚はカタログ=「タイルを追加」パネル専任）。サイト自己定義（seo.ts WebSite JSON-LD・site-metadata.ts keywords）と about ページも新コンセプトへ刷新。本番ビルド + Playwright 実機検証全項目合格。詳細は docs/cycles/cycle-232.md。

- **10.4** ツール間の入出力連携
  - タイル間の入力元選択 UI、型システム
  - 連携 API はタイル側の実装（各ツールの `XxxTile.tsx` および `docs/knowledge/tile-architecture.md` の確立パターン）に沿って実装する（旧来の「Phase 7.1 の型契約」は cycle-225 T-8 で撤去済み）

- **10.5** シェア機能
  - タイル配置 + 設定の base64 エンコードによる URL シェア
  - Phase 2.1 で決めた URL 構成と整合させる

**完了基準**: 道具箱ページが来訪者に公開されている（default content 付き）。来訪者が「テンプレートから道具箱を作る → タイルを並べ替えてカスタマイズする → 配置が localStorage に保持される → ツール間連携を使う → URL でシェアする」フローを実行できる。サイズ枠規格（Phase 7.2、128px × 128px / 8px マージン）が本機構で破綻なく機能している。

> **【切り分け注記（cycle-232 T-10）】** 上記は **Phase 10 全体**（10.1〜10.5 すべて）の完了基準であり、Phase 10.3「本公開」単体の完了基準ではない。「ツール間連携を使う」「URL でシェアする」は 10.4（B-324）・10.5（B-313）の完了によって初めて満たされる。10.3（本公開・cycle-232 完了）の合否を本基準で判定しないこと。

### Phase 11: 撤去・統合

厳密に直列で実施。前段が完了していないと壊れる。

サブタスクを順に：

- **11.1** API ルート移行：`(legacy)/api/` 配下（`kanji-kanaru/evaluate`、`kanji-kanaru/hints`、`quiz/compatibility`、`yoji-kimeru/evaluate`、`yoji-kimeru/puzzle`）を `(new)/api/` へ `git mv`

- **11.2** legacy 撤去
  - `src/app/(legacy)/` 削除
  - `src/app/old-globals.css` 削除
  - `src/components/common/` 削除
  - `CLAUDE.md` の `## Notes` セクションにある `(legacy)` / `(new)` ディレクトリの意味メモを削除（撤去後は意味メモ自体が無意味になるため）
  - `src/components/search/`（旧版）の Search\*.tsx / useSearch.ts / highlightMatches.tsx / 各 module.css をすべて削除（Phase 1.1 の方針により新版は実装されておらず、撤去対象は旧版のみ）
  - `src/lib/analytics.ts` 内の search 関連関数（trackSearchModalOpen / trackSearchModalClose / trackSearchResultClick / trackSearchAbandoned / trackSearch）も同時に撤去
  - `public/search-index.json` の生成スクリプト（`scripts/build-search-index.ts`）および `src/lib/search/{build-index,types}.ts` も (legacy) 撤去と同時にすべて撤去。`/search-index.json` の生成も停止
  - `package.json` の `prebuild` / `predev` / `pretest` から `generate:static-assets` 呼び出しを外す（または `generate:static-assets` スクリプト自体を削除）。`generate:static-assets` が `tsx scripts/build-search-index.ts` のみで構成される場合、後者（スクリプト自体の削除）の方が単純で副作用がない
  - 旧 `src/components/common/Header.tsx` から `SearchTrigger` を直接 import している箇所も legacy 撤去と一体で消える
  - 現サイトに `/search` 等の検索専用ルートは存在しないため、ルート単位の 410 / リダイレクト設定は不要

- **11.3** Route Group 解除
  - `(new)/` 配下のすべて（`layout.tsx`、各ページ、`api/` 等）を `src/app/` 直下に `git mv`
  - `(new)/` ディレクトリ自体を削除
  - 個別ページの `metadata` export（noindex 等）が新場所でも機能するか確認

- **11.4** layout 統合
  - `GoogleAnalytics`、`AchievementProvider`、`WebSite JSON-LD`、`sharedMetadata` を `src/app/layout.tsx` 単一に集約
  - `src/lib/site-metadata.ts` は import 元が一本化されるが、ファイル自体は維持しても削除しても可

- **11.5** globals.css 後始末
  - legacy 関連のコメント削除
  - 旧トークン互換が残っていれば全撤去
  - `.scroll-locked` クラスは `globals.css` のみに残す
  - DESIGN.md §7「暫定対応」セクション削除

- **11.6** 計画書アーカイブ
  - `docs/design-migration-plan.md` → `docs/archive/design-migration-plan.md`
  - 移行完了でこのドキュメントの役割は終了。将来参照のため archive で保管

**完了基準**: `grep -rE "legacy|old-globals|components/common|\(new\)|\(legacy\)" src/` が空。`docs/design-migration-plan.md` が存在せず、`docs/archive/design-migration-plan.md` が存在する。`npm run lint && npm run format:check && npm run test && npm run build` がすべて成功。

## 1 ページ移行の標準手順

各ページごとに以下を順に実施。Phase 8 ではタイル対応のステップ 7 が追加される。

1. **依存コンポーネントの確認**: そのページが import している `@/components/common/*` を grep で列挙し、新版が存在するか確認。存在しなければ、共通化すべきかページ密接として扱うべきかを判断
2. **`git mv (legacy)/foo/ (new)/foo/`**: ファイル / ディレクトリを丸ごと移動
3. **import パス修正**: ページ内の `@/components/common/*` を `@/components/*` に置換
4. **CSS Module 内のトークン置換**: `--color-*` 系（旧）→ `--bg` / `--fg` / `--accent` 系（新）に置換。`:root.dark` を使っている箇所は `:global(:root.dark)` に修正（CSS Modules のスコープ問題、`docs/knowledge/css-modules.md` 参照）
5. **DESIGN.md に従ったデザイン適用**: トークン置換だけでは新デザインにならない。`/frontend-design` Skill と `DESIGN.md` を参照し、レイアウト（Panel に収める、余白、グリッド）、タイポ、ボタン / フォームの状態スタイル、ホバー / フォーカス、アイコン（Lucide 系）、a11y（タップターゲット 44px、`focus-visible`、`aria-current`、コントラスト 4.5:1）を新デザイン体系に合わせて再設計する。旧 UI の構造をそのまま維持するのではなく、必要に応じて構造そのものを変える。**【厳守・AP-P28】** デザイン移行はメタファーの質的入れ替えであり、工数・規模・リスクを理由に「トークン互換レイヤー／色エイリアスで旧 UI を温存し色だけ新化する」上塗りは禁止（constitution / CLAUDE.md 意思決定原則違反）。規模が大きい場合はサイクルを適切に分割して本質的にやり切る。絵文字は使わない（DESIGN.md §3）・本文太字は原則使わない・角丸はパネル/カード/タグ=2px・ボタン/入力=8px。**ページ最上位コンテナに `max-width: 1200px; margin: 0 auto` を必須記載**（グローバル Header / Footer の inner DIV と同じ値。`var(--max-width)` は `(legacy)` 専用の `old-globals.css` で定義された変数であり `globals.css`（(new) 専用）には未定義のため、(new) 配下のページで `var(--max-width)` を使用すると `none` に解決されてしまう。ハードコード 1200px が唯一の正準パターン。既存正常ページ blog/tools/play/blog[slug]/トップで採用済のパターン踏襲）
6. **TrustLevelBadge の撤去**: そのページが `@/components/common/TrustLevelBadge` を import していたら、import 行と `<TrustLevelBadge />` JSX を削除し、対応する `meta.ts` の `trustLevel` フィールドも削除する。コンポーネント本体（`src/components/common/TrustLevelBadge.{tsx,module.css}`）と `src/lib/trust-levels.ts` の最終削除は Phase 11.2（legacy 撤去）で行う。【B-432 注記】trustLevel フィールド削除のタイミング・単位は B-432 の一括完全削除方針に従う（ページ移行時に漸進削除しない／AP-I02 回避）。本体・trust-levels.ts の最終削除も B-432 と整合させること。step6 の記述全体の見直しは B-432 の責務。
7. **（Phase 8 のみ）タイル対応**: ツールのフル機能を単一のタイルに実装し、ツールページはそのタイルを主役（ファーストビュー）に描画する（`docs/cycles/cycle-220.md` L236 の確定提示方式）。表示用コンポーネントの分離はしない。1 ツール＝1 実装として作り直し完了時に当該 Component.tsx を削除する。タイルの下に最小限の説明（1〜2文の用途）と道具箱への導線を添える（長い解説・FAQ・SEO テキストはタイルより下に二次的に置く）。**【Phase 7.1 型契約は撤去済み（cycle-225 T-8）】** 旧来の「Phase 7.1 の型契約にタイル定義を追加」というステップは無効。代わりに `docs/knowledge/tile-architecture.md` の確立パターン（ルートが `<Panel>`・`"use client"` で自己完結・`ToolPageLayout` に機能依存しない）に従う。サイズ枠は Phase 7.2 の `tile-grid` 定数（1 セル 128px × 128px、マージン 8px）に従う（`tile-grid.ts` は現役）
8. **テスト調整**: 移動後のテストパスや import が壊れていないか確認、`npm test` を当該ファイル範囲で実行
9. **視覚確認**: Playwright で w360 / w1280 のライト / ダーク両モードのスクリーンショットを取り、移行前と比較。移行前と「同等以上」（コンセプトに沿った改善）になっているかを評価。Phase 8 でタイルを持つコンテンツは、道具箱（`/toolbox`）および詳細ページ内で `docs/knowledge/tile-architecture.md` §4 合格条件（`page.url()` 不変・full reload 無発生・Panel ルート・DOM id 重複ゼロ・ライト/ダーク・w360/w1280 で破綻なし）を Playwright 実機で確認する（旧来の「Phase 7.3 で整備した hidden 検証ルート（/internal/tiles 等）」は cycle-225 T-8 で撤去済みのため無効。撤去前提の記述は削除・C-5/B-492 #10 訂正）。**w1900 における main 直下要素の `getBoundingClientRect().width < 1300px` を Playwright 実機で確認**（全幅広がりの回帰検出。約 1200px 制約が正しく効いていることの検証）
10. **コミット**: 1 ページ 1 コミットを基本（差分が大きい場合は適切に分割）

## 検証方法

### 共通コンポーネント単体（`/storybook` 運用ルール）

`/storybook` は **共通コンポーネント専用** のカタログ。特定コンテンツ / カテゴリ固有のコンポーネント（ブログ記事のレイアウト、特定ツールの UI など）は置かない。

- 共通コンポーネントを追加したら、必ず `/storybook` のページに対応セクションを追加する。一覧から漏れた新コンポーネントは品質確認の網をすり抜ける
- 各セクションで以下を満たすこと：
  - ライト / ダーク両モードで視覚的に成立している
  - DESIGN.md と整合する見た目（`-soft` 背景の border は `-strong`、フォーム要素の border は `--border-strong` 等）
  - ロジックがあるコンポーネントは `/storybook` 上でクリック等の動作確認ができる（controlled state 等）
- 各 Phase 完了時に `/storybook` 全体を Playwright で撮影し、ライト / ダーク両モードで破綻がないことを確認

### ページ単位

- Playwright で `/foo` を w360 / w1280 のライト / ダーク両モードで撮影
- DOM に旧 `src/components/common/` 由来の class（`Header-module__Pzgc7q__*` 等のハッシュ）が一切出ない
- WCAG コントラスト 4.5:1 以上
- タップターゲット 44px 以上（`min-height` で確保）
- `focus-visible` スタイル
- ナビゲーションには `aria-current="page"`
- 構造化データ（記事は Article、パンくずは BreadcrumbList、サイトは WebSite）
- 既存テスト（vitest）が pass
- `npm run build` が通り、該当ルートが正しく生成される
- production ビルドの実機検証で GA4 計測動作

### 段階的移行の整合性確認

各 Phase で「移行済みページと未移行ページが同時に存在しても、それぞれ意図したデザインで動く」状態を維持する。具体的に毎 Phase 完了時に：

- 移行直後、移行したページは新スタイル、未移行ページは旧スタイルのまま動く
- 共通リンク（Header / Footer の動線）が両方のページから機能する
- ブラウザの戻る・進むで両方のページを行き来しても破綻しない

## アンチパターン回避

以下を、ページ移行ごとの検証で必ず確認：

- **AP-I07** (Next.js layout の body style と useEffect の競合)：`(new)/layout.tsx` の `<body style={...}>` を React が管理するため、`useEffect` で `document.body.style.*` を直書きしても次の reconciliation で消える。クラス操作 / data 属性で切替し CSS で定義
- **AP-I08** (fixed オーバーレイ背後の static 操作要素)：`position: fixed` + z-index のオーバーレイの背後に static の操作要素を置くと、要素がタップ不能になる。`position: relative; z-index: <overlay より大>` で前面化。Playwright の `document.elementFromPoint` で実機検証
- **AP-I09** (jsdom 単体テストの限界)：jsdom 単体テストは layout / CSS スタッキング / production ビルド由来のバグを検出できない。layout 依存・CSS レイアウト・production 挙動に関わるものは Playwright 本番ビルド実機検証を必須化

詳細は `docs/anti-patterns/implementation.md` 参照。移行中に新発見次第、同ファイルに追加していく。

## metadata 管理ルール

- `src/lib/site-metadata.ts` の `sharedMetadata` を両 layout から import
- 値変更は `sharedMetadata` のみ更新する一元化運用。片方の layout だけ更新する形は不整合の元
- `(new)/` 配下に追加するページは既定でインデックス対象（`sharedMetadata` の `robots: index=true`）
- noindex にしたい場合は、そのページの `page.tsx` 自身で `metadata` export または `generateMetadata` を使い `robots: { index: false, follow: ... }` を返す（既存パターン、例：`src/app/(legacy)/blog/tag/[tag]/page.tsx`）
- ページがインタラクティブで `"use client"` となる場合は `page.tsx` を server component に保ち、interactive 部分を子の client component に分離する（実例：`src/app/(new)/storybook/page.tsx` + `StorybookContent.tsx`）

## `.scroll-locked` クラスの扱い

- 移行中は `globals.css`（新側）と `old-globals.css`（旧側）の両方に同一定義 `.scroll-locked { overflow: hidden; }` を持つ
- Phase 11.2 で `old-globals.css` 撤去時に旧定義は同時に消え、`globals.css` 側のみで継続動作

## ロールバック条件

以下のいずれかを観測したら当該ページの移行コミットを `git revert`：

- 視覚的崩れ（レイアウト破綻、テキスト溢れ、色のコントラスト不足）
- アクセシビリティ低下（screen reader 操作の阻害、キーボード操作不能）
- WCAG コントラスト比 4.5:1 を下回る箇所の発生
- パフォーマンス低下（Lighthouse スコア悪化、Core Web Vitals 悪化）
- テスト失敗（既存テスト破壊）
- 来訪者影響（GA4 で当該ページの離脱率急増等）

ロールバック時の影響範囲は変更内容によって異なる。デザイン適用がトークン置換のみで完結している場合は `git revert` で実質元に戻るが、レイアウト構造を変えていたり、ページ密接コンポーネントを新規実装していたり、共通コンポーネントの API を変えていたりする場合は、関連するファイルの整合確認や追加の手戻り作業が必要になる。`(legacy)/` と `(new)/` が独立しているため、ディレクトリ位置だけは戻しやすい。

## コミット粒度

- 1 ページ 1 コミットを基本
- 共通コンポーネント追加（移行中に必要が判明した場合）は別コミット
- 巻き込み修正は別コミット
- コミットメッセージで「何を移行したか」「何を残したか」を明示

## 完了の定義

- `src/app/(legacy)/` ディレクトリが存在しない
- `src/app/old-globals.css` が存在しない
- `src/components/common/` が存在しない
- `src/app/(new)/` が `src/app/` 直下に統合されている（Route Group 解消）
- `docs/design-migration-plan.md` が `docs/archive/design-migration-plan.md` に移動されている
