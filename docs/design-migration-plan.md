# デザイン移行計画

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

  **タイル概念の定義**: 道具箱内に並ぶ「タイル」は、来訪者が **道具箱内で完結して機能を使えるコンパクトな UI 単位**。タイルに対する来訪者の操作（入力・閲覧・実行）はタイル内で閉じ、ページ遷移を伴わない設計を前提とする。**タイルは道具箱内で完結する UI 単位であり、操作がタイル内で閉じる**という性質は不変項として成立する。

  **タイルはフル機能の単一実装であり、詳細ページの本体そのものである。** 種別分類（(a) 1 対 1 / (b) 1 対多 / (c) 複数バリエーション の 3 形態）は cycle-220 の単一抽象により廃止された。現行正典は `docs/cycles/cycle-220.md` §T-3（L189, L242-246）を参照。単一タイル化（B-490）に伴い、コード上の kind 分類（`tile-definition.ts` の Discriminated Union）は不要化される。kind 撤去の具体的な実施タスクは B-490 の完了条件に明示されていないため、T-3 で確認・キャリーオーバー候補として記録する。

  > **【B-488 是正注記】** 旧 Phase 2.2 では「Phase 2.1 #3 で示される通り、(a) 1 対 1 / (b) 1 対多（タイル用の簡素な別 UI）/ (c) 複数バリエーション の 3 形態が想定される」と記述されていた。この 3 形態分類・種別設計は cycle-220 の単一抽象（タイルはフル機能の単一実装・種別分類しない）により**廃止・置換された旧設計**である。歴史的事実として記録する。

  **型契約の整備**: 2.1 の決定に従って、メタ型に「タイルとして表示するためのインタフェース」を追加する。

  **検証**: 型レベル（`tsc`）と単体テスト（vitest）で行う。実コンポーネント（DnD / 編集 / 永続化 / モーダル）は本 Phase の対象外。

**完了基準**: 設計判断と型契約の整備、タイル概念定義が確定済み。

---

**【cycle-199 補完】Phase 2.1 確定値の追記**

Phase 2 完了時点では 2.1 の確定値が本文に明記されておらず、cycle-199 で欠落が発覚した。以下は cycle-199（`docs/cycles/cycle-199.md`）で実装・確定した内容を補完記録したものである。論点比較・設計判断の経緯は cycle-199.md を参照。

**メタ型の扱い方針（確定）**

既存 4 系統のメタ型（ToolMeta / CheatsheetMeta / play 系 registry / dictionary-meta / humor-dict meta）には touch しない。4 系統共通の単一宣言ファイル `src/tools/_constants/tile-declarations.ts` が `TileRegistryEntry[]` 型の `TILE_DECLARATIONS` 配列を保持し、「配列エントリが存在する = タイル化済み」を表現する。系統識別子は `TileDomain`（`"tools" | "cheatsheets" | "play" | "dictionary"`）で区別する。型定義の一次資料は `src/tools/_constants/tile-definition.ts`。

**1 対多サポート再構成範囲（確定）**

> **【B-488 是正注記】** 以下の kind 設計（single/widget/multi の 3 形態 Discriminated Union）は cycle-220 の単一抽象（タイルはフル機能の単一実装・種別分類しない）により**廃止・置換された旧設計**である。単一タイル化（B-490）に伴いコード上の kind 分類は不要化される（kind 撤去の実施タスクは B-490 完了条件で未明示のため T-3 で確認）。現行正典は `docs/cycles/cycle-220.md` §T-3（L189, L242-246）を参照。

Phase 2.2 の 3 形態 (a)/(b)/(c) および Phase 8.1 step3 の手順から、3 形態を Discriminated Union として型レベルで強制する設計を採用した。形態識別子 `kind` の具体値と原典対応は以下の通り（廃止された旧設計として記録）：

| kind       | 原典 | 説明                                       |
| ---------- | ---- | ------------------------------------------ |
| `"single"` | (a)  | 1 対 1：詳細ページ本体をそのままタイル化   |
| `"widget"` | (b)  | 1 対多：タイル専用の簡素な別 UI            |
| `"multi"`  | (c)  | 複数バリエーション：用途別に複数タイル種類 |

optional フィールドによる形態間制約の緩和は禁止（AP-I02 対応）。形態固有フィールドはそれぞれの型に required として定義する。

**URL 構成（未決定）**

道具箱本体の URL（トップ `/` に配置するか専用 URL を設けるか）は cycle-199 では決定しなかった。Phase 10.3 の責務として扱う。Phase 10.3 着手 PM は「Phase 2.1 で URL が決まった」と読まないこと。Phase 4 L75 / Phase 10.3 L215・L217・L226 の「Phase 2.1 で決めた URL」参照は、Phase 10.3 で初めて解決される。

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

### Phase 7: タイル基盤実装

タイルが道具箱に並ぶための型契約・サイズ枠規格・レジストリの仕組みを確定する。来訪者から見える変化はない。本 Phase は個別ツール / 遊びの実装には触れない（それらの移行は Phase 8 で実施する）。

サブタスクを順に：

- **7.1** タイル登録の型契約
  - Tileable / TileComponent 等のインタフェースを整備
  - Phase 2.1 で確定したメタ型の扱い方針（既存 4 系統のメタ型には touch しない・`tile-declarations.ts` が宣言 SSoT）に従う。タイルはフル機能の単一実装を描画する（kind による形態分岐を前提にしない）
  - 個別ツールのメタ型がこの型契約を満たせるように、必要なフィールド（タイル用コンポーネント参照、推奨サイズ、入出力 placeholder 等）を定義

- **7.2** サイズ枠規格の確定と定数化
  - **基本セルサイズ**: 1 セル `128px × 128px`
  - **セル間マージン**: `8px`
  - **多セル対応**: タイルは n × m セル（整数倍）に拡張可能。実サイズは `(128n + 8(n-1))px × (128m + 8(m-1))px`
  - **定数化**: 上記値を `src/tools/_constants/tile-grid.ts`（または同等の単一ファイル）に定数として定義（例: `TILE_CELL_PX = 128` / `TILE_GAP_PX = 8` / `tileSizeStyle(w, h)` ヘルパー）。Phase 8 で実装する各タイル、Phase 10 で実装するダッシュボード本体はすべて当該定数を参照する。個別タイル内に数値を直書きしない。CSS Module 側で参照する場合は `:export` または CSS 変数経由で同じ値を共有する

- **7.3** レジストリの仕組み
  - codegen で各ツール / 遊び / cheatsheet / 辞典のタイル一覧を集約
  - タイル単独表示の検証ルート（`/internal/tiles` 等の hidden URL）を整備
  - Phase 8 で各コンテンツがタイル定義を埋めるたびに、レジストリ経由で一覧化される構造

**検証**: 型レベル（`tsc`）と単体テスト（vitest）で行う。実タイルが存在しないため Storybook 表示や hidden URL での視覚検証は本 Phase 対象外。タイル単独表示の視覚検証は Phase 8 各サイクルで実施する。

**本 Phase に含めないもの**:

- Tile コンポーネント本体（各タイルの実装は Phase 8 各サイクルで行う）
- DnD / 編集モード / モーダル / Undo / 多タイル管理機構（Phase 10）
- useToolStorage / PrivacyBadge 等の個別コンポーネント（必要が出てきたら Phase 8 で整理）
- ダッシュボード永続化スキーマ / タイル間連携（Phase 10）

**完了基準**: 7.1〜7.3 が実装され、`tsc` と vitest テストが通る。Phase 8 で各コンテンツがこの規格に従ってタイル定義を埋められる状態。

### Phase 8: ツール・遊び詳細 + タイル化（同時実施）

各コンテンツを 1 つずつ「詳細ページ移行 + タイル定義」を同サイクルで実施。「2 回の作り直し」を避けるための同時実施。

ツール / 遊びそれぞれの順序は、GA4 ページビュー高い順 + 構造単純な順を基本に決定する。

サブタスクを順に：

- **8.1** ツール群の移行 + タイル化（34 ルート、各 1 サイクル）
  - 対象：age-calculator / base64 / bmi-calculator / business-email / byte-counter / char-count / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter
  - 各サイクルで実施する内容：
    1. ロジックの CSS Module を新トークンに置換
    2. 詳細ページ（`/tools/<slug>`）を `(new)/` 配下に移動し DESIGN.md に従ってデザイン適用（後述「1 ページ移行の標準手順」参照）
    3. Phase 7.1 の型契約に沿って、ツールのフル機能を単一のタイルに実装する（ナビゲーションカードではない）。ツールページはそのタイルを主役（ファーストビュー）に描画する（`docs/cycles/cycle-220.md` L236 の確定提示方式）。タイル専用の別コンポーネント（種別分類）は作らない。1 ツール＝1 実装とし、作り直し完了時に当該 Component.tsx を削除する
    4. Phase 7.1 の型契約を埋める（タイル用コンポーネント参照、推奨サイズ、入出力 placeholder 等）。推奨サイズは Phase 7.2 サイズ枠規格に従い `tile-grid` 定数で表現する
    5. **単独レンダリング検証**: 各タイルが Phase 7.3 で整備した hidden 検証ルート（`/internal/tiles` 等）または対応する詳細ページ内で単独表示できることを Playwright で確認する（道具箱機構への組み込みは Phase 10 で行うため、本 Phase ではタイル単体での視覚・動作を検証する）

- **8.2** 遊び群の移行 + タイル化判断（20 ルート + result ページ、各 1 サイクル）
  - ゲーム（4 種）：irodori / kanji-kanaru / nakamawake / yoji-kimeru
  - クイズ（15 種）：animal-personality / character-fortune / character-personality / contrarian-fortune / impossible-advice / japanese-culture / kanji-level / kotowaza-level / music-personality / science-thinking / traditional-color / unexpected-compatibility / word-sense-personality / yoji-level / yoji-personality
  - 占い（1 種）：daily（`/play/daily` として共通ルートに既存）
  - 共通ルート：`/play/[slug]`、`/play/[slug]/result`、`/play/[slug]/result/[resultId]`
  - 各サイクルで実施する内容は 8.1 と同様。タイル化に馴染まないコンテンツ（ブログ的な遊びなど）は詳細ページのデザイン移行のみ行いタイル定義は付けない

- **8.3** サイズ枠定数の最終整合確認
  - 8.1 / 8.2 が完了した時点で、全タイルが `tile-grid` 定数を参照していること、個別タイル内に `128` / `8` などの数値直書きが残っていないことを `grep` で確認
  - サイズ枠規格が Phase 10 ダッシュボード本体実装の前提として満たされていることを確認する。逸脱があれば本 Phase 内で訂正する

**完了基準**: 各コンテンツが `(new)/` 配下で動作し、タイルがフル機能で単一実装されている（機能劣後ゼロ。Component と同等以上のフル機能を単一の Tile 形で実装済み）。Phase 7.3 検証ルートまたは詳細ページ内でタイル単体として動作確認できる。各ロジックの CSS Module から旧 `--color-*` トークン参照が消えている。全タイルが Phase 7.2 の `tile-grid` 定数（128px × 128px、8px マージン）を参照している。当該ツールの Component.tsx が削除され、実装が1つになっている。

### Phase 9: 既存コンテンツ整理の実施

Phase 1.2 の方針「全移行 + cheatsheets ブログ化」に従って実施。Phase 8 同様、各サブタスクは独立した移行単位 = 各 1 サイクルで実施する。

サブタスク（並行可、ただし 9.3.b〜9.3.e は 9.3.a の後）：

- **9.1** 実績システムへの対応
  - 新コンセプト「日常の傍にある道具」と実績システム（ゲームクリアでバッジ獲得 / ストリーク追跡）の整合を評価
  - ① 存続: `/achievements` を `(new)/` へ移行（標準手順）
  - ② 撤去: 実績システム全体（`src/lib/achievements/`、`StreakBadge`、`AchievementProvider`、Header / Footer の関連リンク、各ゲームからの実績トリガー、localStorage `yolos-achievements` キー、`/achievements` ページ）を削除し、関連 URL は 410 Gone またはトップへリダイレクト
- **9.2** cheatsheets を blog 記事として再編
  - **9.2.a** `cron` をブログ記事に転換
  - **9.2.b** `git` をブログ記事に転換
  - **9.2.c** `html-tags` をブログ記事に転換
  - **9.2.d** `http-status-codes` をブログ記事に転換
  - **9.2.e** `markdown` をブログ記事に転換
  - **9.2.f** `regex` をブログ記事に転換
  - **9.2.g** `sql` をブログ記事に転換
  - **9.2.h** `src/cheatsheets/` と `(legacy)/cheatsheets/` ディレクトリ撤去 + 旧 URL から blog 記事へのリダイレクト設定（9.2.a〜g 完了後）
- **9.3** 辞典 4 系統を `(new)/` へ移行
  - **9.3.a** dictionary トップ `/dictionary`
  - **9.3.b** `colors` 系（トップ + 詳細 + category）（9.3.a 後）
  - **9.3.c** `humor` 系（トップ + 詳細）（9.3.a 後）
  - **9.3.d** `kanji` 系（トップ + 動的サブルート + 詳細）（9.3.a 後）。kanji-kanaru ↔ kanji 辞典の双方向クロスリンク維持
  - **9.3.e** `yoji` 系（トップ + category + 詳細）（9.3.a + 9.3.d の後）。yoji 詳細から kanji 詳細への内部リンク維持

**ツール化（漢字検索ツール / 四字熟語検索ツール 等）は本 Phase の対象外**。データ資産（kanji-data.json 2,136 字、yoji-data.json 400 語等）を活かしたインタラクティブツール化は、移行完了後に独立した機能追加として別 backlog で扱う。

各サブタスクは Phase 3〜8 と同じ「1 ページ移行の標準手順」に従う。テンプレート駆動のコンテンツ（kanji 2,136 字、yoji 400 語等）はテンプレート 1 件改修で大量の動的サブルートを一括移行できる。

**完了基準**: 9.1〜9.3 のすべてのサブタスクが完了し、各ルートが `(new)/` 配下で動作する（cheatsheets は blog 記事として再編済みで旧 URL がリダイレクト）。`(legacy)/dictionary/`・`(legacy)/cheatsheets/`・`(legacy)/achievements/` ディレクトリと `src/cheatsheets/` が残らない。yoji 詳細から kanji 詳細への内部リンク、kanji 詳細と kanji-kanaru の双方向リンクなどが移行後も機能する。

### Phase 10: 道具箱機能の本実装と公開

道具箱のダッシュボード本体（多タイル管理機構）と周辺機能（プリセット / 連携 / シェア）を実装し、来訪者へ正式公開する。

サブタスクを順に：

- **10.1** ダッシュボード本体の実装

  来訪者がタイルを並べ・編集し・状態を保持できる中核機構を実装する。実装範囲には以下を含む:
  - **グリッドレイアウト**: Phase 7.2 サイズ枠規格（1 セル 128px × 128px、マージン 8px、`tile-grid` 定数参照）を前提にしたタイル配置グリッド。多セル対応（タイルが整数倍セルを占有する形）
  - **並び替え**: ドラッグ&ドロップによるタイル順序変更（DnD ライブラリ選定は本 Phase 内で確定）
  - **編集モード**: 閲覧モードと編集モードを切替える UI。編集モードでのみ並び替え・追加・削除が可能
  - **localStorage 配置永続化**: 多タイル配置情報（どのタイルがどこに / どのサイズで配置されているか）の永続化
  - **Undo**: 配置変更後の取り消し機構（操作スタックの保持）
  - **モーダル**: タイル追加用のカタログモーダル / 個別タイル設定モーダル等
  - **多タイル管理機構**: タイル一覧の保持、表示・非表示切替、複製、削除など

  実装形式（単一サイクルで全機能を実装するか、機能ごとにサイクルを分割するか）は本 Phase 着手サイクル PM が判断する。Phase 8 で揃った実タイル群を観察した上で、無理のないサイクル分割で進める。

- **10.2** 構築済み道具箱テンプレート
  - ペルソナ別プリセット（文章を書く人向け・プログラマー向け等）
  - オンボーディング動線
  - 10.3 で default content として組み込む形で利用する

- **10.3** 道具箱ページの本公開
  - Phase 2.1 で決まった URL に道具箱ページを配置
  - 10.2 のプリセットを default content として組み込み、初回来訪者に空状態を見せない
  - URL=トップの場合：Phase 4.4 で移行した現行トップ内容を、Phase 2.1 で決めた戦略に従って別ページに移す / 統合する / 廃棄する
  - URL=専用の場合：それまで noindex 等で隠れていた検証用ページを正式公開状態にアップグレード
  - 10.4 / 10.5 も本公開時に有効化する

- **10.4** ツール間の入出力連携
  - タイル間の入力元選択 UI、型システム
  - 連携 API はタイル側の型契約（Phase 7.1）に沿って実装する

- **10.5** シェア機能
  - タイル配置 + 設定の base64 エンコードによる URL シェア
  - Phase 2.1 で決めた URL 構成と整合させる

**完了基準**: 道具箱ページが来訪者に公開されている（default content 付き）。来訪者が「テンプレートから道具箱を作る → タイルを並べ替えてカスタマイズする → 配置が localStorage に保持される → ツール間連携を使う → URL でシェアする」フローを実行できる。サイズ枠規格（Phase 7.2、128px × 128px / 8px マージン）が本機構で破綻なく機能している。

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
5. **DESIGN.md に従ったデザイン適用**: トークン置換だけでは新デザインにならない。`/frontend-design` Skill と `DESIGN.md` を参照し、レイアウト（Panel に収める、余白、グリッド）、タイポ、ボタン / フォームの状態スタイル、ホバー / フォーカス、アイコン（Lucide 系）、a11y（タップターゲット 44px、`focus-visible`、`aria-current`、コントラスト 4.5:1）を新デザイン体系に合わせて再設計する。旧 UI の構造をそのまま維持するのではなく、必要に応じて構造そのものを変える。**ページ最上位コンテナに `max-width: 1200px; margin: 0 auto` を必須記載**（グローバル Header / Footer の inner DIV と同じ値。`var(--max-width)` は `(legacy)` 専用の `old-globals.css` で定義された変数であり `globals.css`（(new) 専用）には未定義のため、(new) 配下のページで `var(--max-width)` を使用すると `none` に解決されてしまう。ハードコード 1200px が唯一の正準パターン。既存正常ページ blog/tools/play/blog[slug]/トップで採用済のパターン踏襲）
6. **TrustLevelBadge の撤去**: そのページが `@/components/common/TrustLevelBadge` を import していたら、import 行と `<TrustLevelBadge />` JSX を削除し、対応する `meta.ts` の `trustLevel` フィールドも削除する。コンポーネント本体（`src/components/common/TrustLevelBadge.{tsx,module.css}`）と `src/lib/trust-levels.ts` の最終削除は Phase 11.2（legacy 撤去）で行う。【B-432 注記】trustLevel フィールド削除のタイミング・単位は B-432 の一括完全削除方針に従う（ページ移行時に漸進削除しない／AP-I02 回避）。本体・trust-levels.ts の最終削除も B-432 と整合させること。step6 の記述全体の見直しは B-432 の責務。
7. **（Phase 8 のみ）タイル対応**: ツールのフル機能を単一のタイルに実装し、ツールページはそのタイルを主役（ファーストビュー）に描画する（`docs/cycles/cycle-220.md` L236 の確定提示方式）。表示用コンポーネントの分離はしない。1 ツール＝1 実装として作り直し完了時に当該 Component.tsx を削除する。タイルの下に最小限の説明（1〜2文の用途）と道具箱への導線を添える（長い解説・FAQ・SEO テキストはタイルより下に二次的に置く）。Phase 7.1 の型契約にタイル定義を追加し、サイズ枠は Phase 7.2 の `tile-grid` 定数（1 セル 128px × 128px、マージン 8px）に従う
8. **テスト調整**: 移動後のテストパスや import が壊れていないか確認、`npm test` を当該ファイル範囲で実行
9. **視覚確認**: Playwright で w360 / w1280 のライト / ダーク両モードのスクリーンショットを取り、移行前と比較。移行前と「同等以上」（コンセプトに沿った改善）になっているかを評価。Phase 8 ではタイルとしての表示も Phase 7.3 で整備した hidden 検証ルート（`/internal/tiles` 等）または詳細ページ内で確認。**w1900 における main 直下要素の `getBoundingClientRect().width < 1300px` を Playwright 実機で確認**（全幅広がりの回帰検出。約 1200px 制約が正しく効いていることの検証）
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
