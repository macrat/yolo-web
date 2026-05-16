# タイルと詳細ページの統合設計

**対象サイクル**: cycle-193（B-314 Phase 7 第 1 弾 = 基盤再構築）
**確定判断ソース**: `docs/cycles/cycle-193.md` 案 1-17（r5 最終確定）
**一次資料**: `DESIGN.md` / `docs/cycles/cycle-179.md` / `docs/constitution.md` / `docs/design-migration-plan.md`

---

## §1 ペルソナ要件と本サイクル来訪者出口

### M1a: 特定の作業に使えるツールをさっと探している人

出典: `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`

**likes（設計直結項目）**:

- likes 1: ページを開いた瞬間に入力欄が見えて、すぐ使い始められること
- likes 2: コピペで結果を受け取って、すぐ元の作業画面に戻れること
- likes 3: 余計な説明や装飾がなく、用事だけ静かに片付けられる画面
- likes 4: 入力した内容が外部に送られないなど、不安なく使えること
- likes 5: 結果の根拠や前提が必要最小限だけ添えられており、信頼して使えること

**dislikes（設計制約項目）**:

- dislikes 5: ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと

### M1b: 気に入った道具を繰り返し使っている人

出典: `docs/targets/気に入った道具を繰り返し使っている人.yaml`

**likes（設計直結項目）**:

- likes 1: サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること
- likes 2: ブックマークしたURLを開けばすぐ目的のツールが表示されること
- likes 3: 前回入力した値や設定が残っていて、作業がさらに短縮されること
- likes 4: 同じ入力に対して前回と同じ結果が返ってくること

**dislikes（設計制約項目）**:

- dislikes 1: 動作が遅いツール
- dislikes 3: 以前と同じ入力なのに結果や挙動が前回と変わっていること

### 本サイクル来訪者出口

来訪者が実際に到達するページは **`/tools/keigo-reference`（新版詳細ページ）の 1 ページのみ**（`docs/cycles/cycle-193.md` L84 実体スコープ第 1 項）。

- `/internal/tiles` は `robots: noindex` の検証ページ。来訪者には届かない
- keigo-reference 詳細ページの主体は `ToolDetailLayout`
- 編集モード / DnD 視覚は本サイクル来訪者には届かない（Phase 9.2 で本格設計）

### ファーストビュー要件（M1a likes 1 / dislikes 5 の直接充足）

`/tools/keigo-reference` を開いた瞬間（above-the-fold）:

- w360 / w1280 ともに検索入力欄とカテゴリフィルタがファーストビュー内に表示される
- `LifecycleSection`（公開日 / 更新日）/ howItWorks 解説 / FAQ は below-the-fold に配置
- ファーストビューの高さ予算: `IdentityHeader`（ツール名 / 説明 / カテゴリ）は必要最小限の高さ。`ToolInputArea`（検索欄 + フィルタ）がファーストビューの大部分を占める

実機計測（T-視覚回帰で Playwright の `getBoundingClientRect()` で確認）。

---

## §2 屋台骨と Core Intent（cycle-179 (b) 採用継承）

### 確定判断の継承元

`docs/cycles/cycle-179.md` L130-186（B-309-3 #3 / サブ判断 3-a）:

- **Phase 2.1 #3 確定**: 「(b) 1 対多採用 / (c) 複数バリエーション不採用 / variantId 系撤去」
- keigo-reference の (b) 分類根拠 = 「大量データ表示（テーブル + グリッド）→ 軽量版が必要」（L152）
- (c) は 0 件（全 54 コンテンツで複数バリエーションが必要な実例なし、L142 表）
- (c) が将来必要になった時点で型契約を拡張する方針を明示維持（L161）

### Phase 2.2 タイル概念定義

`docs/design-migration-plan.md` Phase 2.2（cycle-178 書き込み）:

- タイル = 道具箱内で完結する UI 単位。操作がタイル内で閉じ、ページ遷移を伴わない
- 「ナビゲーションカード = 詳細ページへ遷移するリンク」は概念違反（cycle-179 L254 誤り 15）

### Core Intent（3 項目）

1. **Panel に収まる**: `DESIGN.md` §1「すべてのコンテンツはパネルに収まった形で提供される」（L8）。本サイクルで作る 9 個の新版共通モジュール + 1 軽量版タイルはすべて Panel 内収容前提。
2. **既存コンポーネントを使う**: `DESIGN.md` §5「ボタンやフォームなどの UI コンポーネントは src/components/ にあるものを使う」（L82）。フィルタ / コピー / 展開ボタンを独自 CSS で書かない。
3. **詳細ページとタイルは別 UI**: cycle-179 (b) 採用。詳細ページの主体は `ToolDetailLayout`、タイルは 1 つの軽量別 UI。両者は `src/tools/keigo-reference/logic.ts` の共通ロジックのみ共有（`cycle-193.md` L92-93 core intent 第 3 項）。

### 撤回判断のサマリ

| 撤回対象                                                                | 撤回理由                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------ |
| `Tile.large-full.tsx` 命名 / 大型タイル概念                             | cycle-191 独自判断 / cycle-179 (b) 採用と矛盾    |
| `TileVariant` 型 4 値 union（small/medium/large/large-full）            | cycle-179 サブ判断 3-a で variantId 系撤去確定済 |
| keigo-reference 3 バリアント並列実装                                    | cycle-179 (c) 不採用確定                         |
| tile-loader.ts の拡張（variantId 引数 / loader cache キー変更）         | cycle-179 B-309-5 で撤去済状態を維持             |
| CSS Grid サイズ規格 large=2×2 / medium=2×1 / small=1×1 の本サイクル実装 | Phase 9（B-336）= 道具箱本体の責務               |
| cycle-192 申し送り 6「ツール詳細ページ = Tile.large-full.tsx 設置場所」 | cycle-191 独自判断 / cycle-179 (b) 採用と矛盾    |

---

## §3 9 個の新版共通モジュール責務 + 依存グラフ DAG

### 各モジュールの責務と主要 API

すべてのモジュールは `src/components/Panel` を内部使用するか Panel 内に収まる前提で設計する（`DESIGN.md` §1 L8 / §4 L61-67 根拠）。

#### 1. AccordionItem

**責務**: 開閉可能なセクション。`<details>` 要素の直書きを避け、アクセシブルな開閉 UI を提供。

**主要 API（概要）**:

- `title`: 見出し文字列（必須）
- `children`: 折りたたみ内容（必須）
- `defaultOpen`: 初期状態（任意、デフォルト: false）

**`<details>` / `<summary>` 直書きを避ける理由**: focus 管理 / aria 属性の制御性 / 開閉トリガーのスタイリング統一が AccordionItem 経由でないと統一できない（cycle-192 失敗ステップ 16 で逸脱が発生）。**AccordionItem は内部実装で `<details>` を使うか、`<button aria-expanded>` + `<div role="region">` を使うかは T-B 実装裁量**だが、外部 API は AccordionItem 経由に統一する。

#### 2. PrivacyBadge

**責務**: 「ブラウザ内で完結」表記バッジ。TrustSection 内部で使用。M1a likes 4（外部送信への不安解消）に直結。

**主要 API（概要）**:

- props なし、もしくは `className` のみ
- 「このツールはブラウザ内で完結します。入力データは外部に送信されません。」の表示内容を持つ

#### 3. ResultCopyArea

**責務**: コピー可能な結果領域 + `navigator.clipboard.writeText()` **失敗時の通知 UI**。M1a likes 2（コピペで結果を受け取る）に直結。

**主要 API（概要）**:

- `value`: コピー対象の文字列（必須）
- `label`: ボタンのラベル文字列（任意）
- clipboard 失敗時は**成功通知と同じ場所に失敗状態を表示**する（「コピーできませんでした」等）

**注意**: clipboard API 失敗通知は `useToolStorage` 責務ではなく、ResultCopyArea 側の責務（`cycle-193.md` L184 Done 条件独立列挙）。

#### 4. ToolDetailLayout

**責務**: **詳細ページの主体**。Panel グリッド構造で `IdentityHeader` + `ToolInputArea` + `TrustSection` + `LifecycleSection` 等を内包。cycle-191/192 の「`<article>` 4 階層構造誤定義」の根本対処を維持（`cycle-193.md` L183）。

**主要 API（概要）**:

- `meta`: ToolMeta（ツール名 / 説明等、SSoT）
- `children`: ToolInputArea など入力・結果表示コンポーネント
- LifecycleSection の below-the-fold 配置は ToolDetailLayout 側で制御

**注意**: `isEmbedded` 等のモード切替 prop は導入しない（`cycle-193.md` 案 9 確定）。

Storybook 上では Panel 階層 + 子コンポーネント差し込みのラッパー検証に留まる。詳細ページ全体の検証（JSON-LD 出力 / ファーストビュー幅 / A11y）は実ページ + Playwright で行う（`design-migration-plan.md` L319-326 検証方法参照）。

#### 5. IdentityHeader

**責務**: ツール名 / 説明 / カテゴリの簡潔ヘッダー。ファーストビュー内の高さを最小限に保つ。

**主要 API（概要）**:

- `name`: ツール表示名（必須）
- `shortDescription`: 短い説明（必須）
- `category`: カテゴリ（任意）

#### 6. TrustSection

**責務**: ブラウザ内完結の旨 + 動作原理の簡単な説明 + 必要な場合の情報源開示。**`trustLevel` を一切参照しない**（案 8-A 確定、`cycle-193.md` L388）。描画場所は ToolDetailLayout 内のみ（軽量版タイル内では描画しない）。

**主要 API（概要）**:

- `privacy`: PrivacyBadge を内部使用する（「ブラウザ内完結」表記）
- `howItWorks`: 動作原理テキスト（meta.howItWorks フィールドを渡す）
- `source`: 情報源開示テキスト（任意）

**注意**: `trustLevel` フィールドは cycle-180 L701 で全廃確定済。TrustSection は「ブラウザ内完結 + howItWorks + source disclaimer」の構成。

#### 7. LifecycleSection

**責務**: 公開日 / 更新日の表示。**ファーストビュー外（below-the-fold）配置**。配置責務は ToolDetailLayout 側で決定（`cycle-193.md` L107 実体一覧）。M1a dislikes 5（解説がファーストビューを占拠する）を構造的に防ぐ。

**主要 API（概要）**:

- `publishedAt`: ISO 8601 文字列（必須）
- `updatedAt`: ISO 8601 文字列（任意）

#### 8. ToolInputArea

**責務**: 入力欄ラッパー。`src/components/Input` / `Button` を内部使用。**本サイクルの「44px タップターゲット達成」はこのコンポーネント内コントロールに限定**（案 10-D、`cycle-193.md` L411-418）。

**主要 API（概要）**:

- `children`: Input / Button / ToggleSwitch 等の入力要素
- wrapper レベルで min-height: 44px を満たす形でレイアウトする（Button / Input 本体の CSS 変更なし）

**注意**: Button / Input 本体の 44px 改修は B-386 独立サイクル送り。本コンポーネント内では wrapper / padding の調整で達成する。

#### 9. useToolStorage（Hook）

**責務**: localStorage 永続化。Storybook 不可な Hook のため、unit test + 実ページ動作で代替検証（`cycle-193.md` L213）。

**責務 4 項目**（T-品質保証チェックリスト独立列挙対象）:

- **(i) key 命名規約**: `yolos-tool-<slug>-<purpose>`。`<slug>` = `meta.ts` の slug フィールド値（keigo-reference 用なら `keigo-reference`）、`<purpose>` = 単一目的の英小文字 kebab-case（例: `search` / `category-filter` / `expansion-state`）。1 キー = 1 purpose。具体的な purpose 値は T-B 実装裁量
- **(ii) key 変更時の旧値クリア挙動**: key が変更された場合、旧 key の値は参照せず新 key で初期化する。旧 key のエントリは**放置**（`localStorage.removeItem` による積極削除は行わない）。将来の key 変更による旧データ蓄積は許容範囲とし、localStorage の容量圧迫が問題になった時点で別途対処する方針とする
- **(iii) JSON parse 失敗時のフォールバック**: localStorage の値が壊れている場合は initialValue にフォールバックし、エラーをスローしない（複数キー併用で局所影響を抑制）
- **(iv) storage 書き込み失敗時の挙動**: `localStorage.setItem` が失敗（QuotaExceededError 等）した場合は silent fail（UI を壊さない）

**主要 API（概要）**:

- `useToolStorage<T>(key: string, initialValue: T): [T, (value: T) => void]`
- または類似シグネチャ（具体的な引数型は T-B 実装裁量）

### 依存グラフ DAG

```
src/components/
  Panel
  Button
  Input
  ToggleSwitch
    ↑ 既存コンポーネント（本サイクルで変更しない）

新版共通モジュール（src/components/）:
  PrivacyBadge
  AccordionItem
  ResultCopyArea
  LifecycleSection
  IdentityHeader
  useToolStorage（Hook）
    ↑ 独立して実装可能（外部依存: Panel / Button / Input / ToggleSwitch）

  TrustSection
    ← PrivacyBadge を内部使用

  ToolInputArea
    ← Button / Input / ToggleSwitch を内部使用

  ToolDetailLayout
    ← IdentityHeader を内包
    ← ToolInputArea スロット（children 経由）
    ← TrustSection を内包
    ← LifecycleSection を内包（below-the-fold 配置を制御）
    ← Panel を使用（グリッド構造）
```

### 実装順序 DAG（依存先から先に実装する）

```
フェーズ A（依存なし、並列実装可）:
  PrivacyBadge
  AccordionItem
  ResultCopyArea
  LifecycleSection
  IdentityHeader
  useToolStorage

フェーズ B（フェーズ A の完了後）:
  TrustSection（← PrivacyBadge 完了後）
  ToolInputArea（← Button / Input / ToggleSwitch 既存確認後）

フェーズ C（フェーズ B の完了後）:
  ToolDetailLayout（← IdentityHeader / TrustSection / LifecycleSection / ToolInputArea 完了後）
```

T-B の担当者はこの順序（フェーズ A → フェーズ B → フェーズ C）で実装する。各コンポーネントは 1 エージェント 1 コンポーネント単位で分割（`CLAUDE.md` "Keep task smaller" 遵守）。

---

## §4 keigo-reference 用 1 軽量版タイル設計（案 17-A 確定）

### 採用根拠

`docs/cycles/cycle-193.md` 案 17（L587-625）でゼロベース比較（17-A / 17-B / 17-C）の結果 17-A を確定。

- cycle-179 タイル概念整合（タイル内完結 / 非遷移）を満たす
- M1a likes 1「すぐ使い始められる」を最大充足（入力欄がファーストアクション）
- M1b likes 3「前回入力した値が残っている」を useToolStorage で実装可能
- M1b dislikes 3「結果が変わらない」を stable sort で保証
- 軽量版の本質（cycle-179 L152 = 大量データの軽量別 UI）を「検索 + 上位 N 件」で満たす

17-B（今日の 1 動詞ピックアップ）は M1b dislikes 3 に直撃するため不採用。17-C（カテゴリ別エントリポイント）はタイル概念違反（ナビゲーションカード = 遷移 UI）のため不採用。

### 具体機能仕様（案 17-A）

以下の機能を 1 コンポーネントで実装する（`cycle-193.md` L616-625）:

1. **検索 input + クリアボタン**: `Input` コンポーネントを使用（type="search"）。M1a likes 1 充足
2. **3 カテゴリフィルタ**: `KeigoCategory` union の 3 値 = `basic`（基本動詞）/ `business`（ビジネス）/ `service`（接客・サービス）。実体確認: `logic.ts` L2 / L43-47
3. **検索結果上位 N 件のリスト表示**: N は T-A が決定権を持つが、Panel 内収容の最終確認が実機計測を要するため T-C 実装段階で確定する。軽量版 = 60 件全件ではなく上位 N 件に絞る（cycle-179 L152 (b) 採用との整合）
4. **各エントリの敬語三形コピーボタン**: 実体確認済フィールド名: `sonkeigo`（尊敬語）/ `kenjogo`（謙譲語）/ `teineigo`（丁寧語）（`logic.ts` L13-15）。各形に `Button` コンポーネントのコピーボタン
5. **useToolStorage で前回状態を復元**:
   - 検索文字列: key = `yolos-tool-keigo-reference-search`（`cycle-193.md` L622）
   - カテゴリフィルタ: key = `yolos-tool-keigo-reference-category-filter`（T-C が命名）
   - 上位 N 件選択: key = `yolos-tool-keigo-reference-expansion-state`（T-C が命名）
6. **stable sort**: M1b dislikes 3 対応（同じ検索文字列で同じ順序が返る）

### tile-loader.ts への組み込み

**変更内容**: 既存 `getTileComponent(slug)` の slug 単独引数を維持したまま、if 分岐を 1 件追加するのみ。

```
// 追加する if 分岐の形式（L21 コメントの既存パターンを踏襲）:
// if (slug === "keigo-reference") {
//   const loader = dynamic(() => import("@/tools/keigo-reference/Tile"), { ssr: false });
//   loaderCache.set(slug, loader);
//   return loader;
// }
```

- `TileVariant` 型 / `variantId` / loaderCache キー変更は導入しない（cycle-179 サブ判断 3-a 継承）
- `dynamic({ ssr: false })` を維持（`docs/knowledge/dnd-kit.md` §1 根拠: DndContext の SSR/CSR hydration 不一致防止）

### initial-default-layout.ts との整合

既存 `initial-default-layout.ts` の `size: "small" | "medium" | "large"` 3 値 union（L26 実体確認）は**触らない**。keigo-reference 用 1 軽量版タイルは既存 union のうち `"small"` または `"medium"` のいずれか 1 値を指定する（具体値は T-C で Panel 内収容確認後に決定）。

### Panel 1 つ分の幅・高さ予算

- w360 viewport で Panel 1 つ分の幅内に収まること（横はみ出しゼロ）
- 検索 input + 3 カテゴリフィルタ + 上位 N 件リスト + コピーボタンが w360 で破綻しない

**フィルタが w360 に収まらない場合の設計指針**（T-A 引き継ぎ 2 番、tasklog 参照）:

フィルタ UI は以下の 4 択から実機検証で選定する:

- 案 A: 3 ボタン横並び（カテゴリ名を略称に）
- 案 B: ドロップダウン select
- 案 C: 縦積み（1 列に並べる）
- 案 D: ToggleSwitch 3 個縦積み（ToggleSwitch コンポーネント使用）

T-C 担当者は `/internal/tiles` 上で w360 実機計測を行い、44px タップターゲットを満たす最もシンプルな案を採用する（`DESIGN.md` §6 Do「最小限のシンプルな構造」/ Don't「過度な区切り線」）。

---

## §5 詳細ページとタイルの関係（案 9 確定）

### 確定判断

`docs/cycles/cycle-193.md` 案 9（L390-396）:

- 詳細ページの主体: `ToolDetailLayout`
- タイルは `ToolDetailLayout` に内包されない**別 UI**
- 共有: `src/tools/keigo-reference/logic.ts` の共通ロジックのみ
- `isEmbedded` 等のモード切替 prop は導入しない
- JSON-LD（WebApplication / FAQPage / BreadcrumbList）の出力責務は `page.tsx` 配下（詳細ページ側）に固定。タイル側は出力しない

### ファイル構成（イメージ）

```
src/tools/keigo-reference/
  logic.ts          ← 共通ロジック（両者が参照）
  meta.ts           ← SSoT（詳細ページとタイルが参照）
  Component.tsx     ← 既存の legacy ツール実装（移行元）
  Tile.tsx          ← 新規: 1 軽量版タイルコンポーネント（T-C で作成）

src/app/(new)/tools/keigo-reference/
  page.tsx          ← 詳細ページ（T-E で移行。JSON-LD 出力 / ToolDetailLayout 使用）
```

cycle-191/192 の「ツール詳細ページ = `Tile.large-full.tsx` 設置場所」は cycle-179 (b) 採用と矛盾するため完全撤回済（`cycle-193.md` 撤回判断のサマリ）。

---

## §6 JSON-LD と JSX で SSoT 原則（IR4-4 対応）

### SSoT 二段構造

SSoT は **2 層に分かれている**（IR-3 対応）:

- **第 1 層（データ SSoT）= `logic.ts`**: 動詞件数 / 間違い件数の根拠。`KEIGO_ENTRIES.length`（= 60）/ `COMMON_MISTAKES.length`（= 15）がここで確定する
- **第 2 層（表示 SSoT）= `meta.ts`**: 文章表現・表示順の確定。`logic.ts` を import して件数テンプレートリテラルを構築した `howItWorks` / `faq` フィールドを持つ

`page.tsx`（JSON-LD 出力）と `ToolDetailLayout` 配下（JSX 表示）は、**両方とも `meta.ts` 経由で同じフィールドにアクセス**する（`cycle-193.md` L191）。

```
logic.ts
  KEIGO_ENTRIES.length = 60        ← 動詞件数の根拠（第 1 層 SSoT）
  COMMON_MISTAKES.length = 15      ← 間違い件数の根拠

    ↓ import

meta.ts
  meta.howItWorks = "...${KEIGO_ENTRIES.length}件..."  ← 文章表現確定（第 2 層 SSoT）
  meta.faq[0].answer = "...${KEIGO_ENTRIES.length}件..."

    ↓ 両者が参照

page.tsx                    ToolDetailLayout 配下
  generateToolJsonLd()        TrustSection（howItWorks 表示）
  → JSON-LD 出力              FAQ セクション（faq 表示）
```

JSON-LD と JSX で件数がずれることは、この二段構造により**構造的に発生しない**（T-品質保証チェックリスト R12 参照）。

### 動詞件数の SSoT 化（案 13-A 経路 X 確定）

`cycle-193.md` L473-495 で確定した実装経路:

- `logic.ts` L53 の `KEIGO_ENTRIES` と L1067 の `COMMON_MISTAKES` に `export` を付与
- `meta.ts` で `import { KEIGO_ENTRIES } from "./logic"` を追加
- `howItWorks` 文字列内の「40 件以上」を `${KEIGO_ENTRIES.length} 件` に置換 → 現在値: **60 件**（**テンプレートリテラル（バッククォート `` `...${KEIGO_ENTRIES.length}...` ``）で囲む必要がある。通常の文字列リテラル `'...'` / `"..."` では展開されない**）
- `faq[0].answer` 内の「合計 40 件以上」も同様に置換（`meta.ts` L30 実体確認済）

**表記方針**: 「動詞 60 件」（M1a likes 5「結果の根拠が必要最小限」に従い動詞数のみ表記。`COMMON_MISTAKES` の 15 件は別セクションで個別表示）。

**実装可能性確認済**: `logic.ts` L1 に `"use client"` なし（実体確認済）。meta.ts での `logic.ts` import は server-side で問題なし。循環参照リスクなし（meta.ts は logic.ts を一方向 import、logic.ts は meta.ts を import しない）。

---

## §7 /internal/tiles 検証ページ責務（屋台骨縮小後）

### 責務の限定

`docs/cycles/cycle-193.md` L192-196 屋台骨第 4 項:

- **責務**: keigo-reference 用 1 軽量版タイルが Panel 内で破綻なく描画できることの**単体確認場所**
- 来訪者は到達しない（`robots: noindex`）
- 「CSS Grid サイズ規格 large=2×2 等」「ダッシュボード本体グリッドの DnD 検証」「複数タイル並列での DnD」は**本サイクル外**（Phase 9 / B-336 の責務）

### 検証項目（T-D Done 条件）

| 検証項目                                             | 計測方法                               |
| ---------------------------------------------------- | -------------------------------------- |
| w360 viewport で body 幅 = 360px、横はみ出しゼロ     | Playwright `document.body.scrollWidth` |
| フォーカス可視性（focus-visible でアウトライン表示） | Playwright フォーカス後スクショ        |
| タップターゲット 44px 以上                           | Playwright `getBoundingClientRect()`   |
| Panel 内に収まること                                 | Playwright DOM 幅計測                  |

### robots: noindex 設定

```tsx
// /internal/tiles の page.tsx または layout.tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

---

## §8 編集モード視覚 / DnD 仕様（最小限実装）

**本章の実装は暫定**。本サイクル来訪者が触れない（`/internal/tiles` noindex）ため最小限実装に留め、Phase 9.2（B-336）でゼロベース再評価する。

### 方針（案 4-C 確定）

`docs/cycles/cycle-193.md` 案 4（L313-329）で確定:

- 本サイクル来訪者には届かない（`/internal/tiles` は noindex の単体検証場所）
- タイル単体の「触れる状態」表現は **`box-shadow: var(--shadow-dragging)` + `--accent` 系トークンによるアウトライン** のみ
- 具体的には `focus-visible` 系の `outline: 2px solid var(--accent)` 相当を採用（`DESIGN.md` §2 L49 と同じトークン体系）

**導入しないもの**:

- jiggle（rotate アニメーション）→ `DESIGN.md` §4「規定外の表現禁止」違反（AP-I08）
- 破線ボーダー（`border-dashed`）→ §4 (b) 明示外
- 半透明（opacity 変化）→ §4「半透明禁止」明記
- 色相変化 / スケール変化 → §4「規定外の表現禁止」

**根拠**: `DESIGN.md` §4（L69-77）「ドラッグ中の視覚表現は `box-shadow: var(--shadow-dragging)` のみ」「編集モードのタイルはアクセント色（`--accent` 系トークン）で『触れる状態』を示すことができる」。

### Phase 9.2 への引き継ぎ

編集モード視覚の本格設計は Phase 9.2（B-336 = 道具箱本体）でゼロベース再評価。**Phase 9.2 着手 PM への引き継ぎ事項として、T-申し送りタスクが定める成果物に明記すること**。

---

## §9 軽量版タイル内コンテンツのレスポンシブ設計（案 5-C 確定 + 実機検証手順）

### 確定判断

`docs/cycles/cycle-193.md` 案 5（L330-355）でゼロベース比較（5-A 新 / 5-B 新 / 5-C 新）の結果:

- **採用: 案 5-C 新（コンテナクエリ / cqi / cqw）**
- ただし dnd-kit との互換性のみ T-A で実機検証（本計画書唯一の T-A 実機検証項目）
- 問題があれば案 5-B 新（flex-wrap + min-width のみ）にフォールバック

**5-A 新（メディアクエリ）は最終手段としても採らない**: `DESIGN.md` §4「ブレークポイントを作るより自然なレイアウト優先」（L67）違反。

### 採用根拠（5 軸）

1. **Panel 1 つ分追従**: コンテナ幅に正確に追従（media query はviewport 基準のため Panel 幅と乖離する）
2. **DESIGN.md §4 自然レイアウト優先**: ブレークポイント不使用
3. **将来 Phase 9 互換性**: Phase 9 で道具箱内の異なる Panel サイズに配置されても折り返し / 縦積みが破綻しない
4. **2026 年全主要ブラウザ対応**（`docs/research/2026-05-16-dashboard-tile-ui-best-practices.md` L127 実体確認）
5. **フォールバック経路**: dnd-kit 互換性問題があれば 5-B 新へ（本サイクル直接価値は維持）

### dnd-kit 互換性実機検証手順（本サイクル唯一の T-A 実機検証）

T-A 段階で最小再現環境を用意して実機検証する。T-D（`/internal/tiles`）や T-C（軽量版タイル本体）は T-A 着手時点では存在しないため、**T-A 担当者が最小再現コードを一時的に作成**して Playwright で動かし、検証完了後に破棄する（再現コード自体を設計書から参照しない。検証結果 = 採用案 + 計測値のみを下記「§9 検証結果」に記録する）。

**最小再現環境の構成**:

- `container-type: inline-size` を適用した親 div（Panel と同等の幅制約）
- 内部に flex / grid + `min-width` / `cqw` でレイアウトされた子要素（検索 input + ボタン相当の DOM）
- `@dnd-kit/sortable` の `SortableContext` + `DndContext` + `PointerSensor` でラップ
- `dynamic({ ssr: false })` でクライアント専用 import（`docs/knowledge/dnd-kit.md` §1）

**Playwright 自動判定基準**（IR-1 / 質問-1 統合対応）:

| 判定項目                               | 合格条件                                                              | 計測方法                                                                    |
| -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ドラッグ中の横はみ出し                 | `scrollWidth === clientWidth`（横スクロール発生しない）               | ドラッグ操作後 `document.querySelector('.tile-container').scrollWidth` 取得 |
| ドラッグ前後でコンテンツ幅が変わらない | ドラッグ前後の子要素 `getBoundingClientRect().width` の差が ±2px 以内 | ドラッグ前後に計測し比較                                                    |
| コンテンツ重複なし                     | 兄弟要素の `getBoundingClientRect()` が重複しない                     | 隣接要素の top / bottom を比較                                              |

**フォールバック判定**: 上記いずれかが不合格の場合は案 5-B 新（flex-wrap + min-width のみ）に切り替える。

**§9 検証結果（T-A 実施後に記録）**:

> _(T-A 担当者が実機検証後、「案 5-C 採用」または「案 5-B フォールバック採用」+ 計測値をここに直接記載する)_

**詳細な class 名 / 切替閾値 / container-type の付与位置は T-C / T-B 実装裁量に降ろす**（`cycle-193.md` 運用R14）。

---

## §10 A11y

### タップターゲット 44px（WCAG 2.5.5）

根拠: WCAG 2.5.5「Target Size」。`docs/cycles/cycle-193.md` 案 10-D（L411-418）で確定。

**本サイクル達成範囲**:

- keigo-reference の `ToolInputArea` 内コントロール（検索 input / カテゴリフィルタの Button / クリアボタン等）
- 軽量版タイル内の操作ボタン（コピー Button 等）

**本サイクル外（B-386 独立サイクル送り）**:

- Footer / Header / Breadcrumb / Pagination 内の Button / Input
- 関連リンクカード / ShareButtons 等

**達成方法**: `ToolInputArea` の wrapper レベルで min-height: 44px を満たす形で組み立てる。既存 Button / Input の CSS は変更しない（B-386 独立サイクル送り）。

具体的な実装イメージ: クリッカブル要素（コピーボタン / フィルタボタン等）を `display: flex; align-items: center; min-height: 44px` を持つ wrapper で囲み、タッチ可能な領域を 44px 以上に確保する。これは ToolInputArea 内の全コントロールに均一適用する**パターン化した手法**であり、AP-I02「個別ケースのハードコードで回避」には該当しない（個別ハードコードではなくコンポーネント単位で統一した wrapper 設計）。

### フォーカス可視性

`DESIGN.md` §2 L49:

```css
outline: 2px solid var(--accent);
outline-offset: 2px;
```

全インタラクティブ要素（Button / Input / ToggleSwitch / AccordionItem のトリガー）に `focus-visible` でこのスタイルを適用。`src/components/` の既存実装はすでに準拠。新規コンポーネントも同様に実装する。

### コントラスト

WCAG AA 準拠（4.5:1 以上）。`--fg` on `--bg` / `--fg` on `--bg-soft` の組み合わせが基準。T-視覚回帰で Playwright 計測。

---

## §11 keigo-reference 詳細ページ移行段取り

### 概要

`docs/design-migration-plan.md` L289-302（1 ページ移行の標準手順）に準拠。

### 実施順序: (g) → (a) → (b) → (c) → (d) → (e) → (f)

TS コンパイル連鎖回避のためこの順序を守る（`cycle-193.md` 案 16 L573-583）。

#### (g) 既存テスト書き換え（実施順序 1 = 最初に実施）

書き換え対象は**2 箇所のみ**（`cycle-193.md` 案 16 表 / L575 確定）:

1. `src/lib/toolbox/__tests__/types.test.ts` L151-152: `allToolMetas` 全件ループ内の `expect(result.trustLevel, ...).toBeTruthy()` → `if (meta.trustLevel !== undefined) expect(result.trustLevel).toBeTruthy()` に変更
2. `src/lib/toolbox/__tests__/registry.test.ts` L40-41: `getAllTileables()` 全件ループ内の `expect(item.trustLevel, ...).toBeTruthy()` → `if (item.trustLevel !== undefined) expect(item.trustLevel).toBeTruthy()` に変更

**書き換え不要（確定）**: types.test.ts L20 / L34 / L66 / L68 / L118 / L183（fixture 定義 / 固定値検証 / play 側全件ループ）

#### (a) ToolMeta.trustLevel を optional 化（実施順序 2）

`src/tools/types.ts` L25: `trustLevel: TrustLevel` → `trustLevel?: TrustLevel`

#### (b) Tileable.trustLevel を optional 化（実施順序 3）

`src/lib/toolbox/types.ts` L45: `trustLevel: TrustLevel` → `trustLevel?: TrustLevel`

#### (c) toTileable() adapter を omit 実装に書き換え（実施順序 4）

`src/lib/toolbox/types.ts` L77 / L92:

- `trustLevel` が undefined の場合はフィールド自体を返さない（optional フィールド省略形式）
- `if (meta.trustLevel !== undefined) result.trustLevel = meta.trustLevel;` 相当の実装

#### (d) 影響範囲内 4 箇所の optional 参照確認（実施順序 5）

本サイクル変更対象の具体 4 箇所（`cycle-193.md` 案 16 表で確定）が optional 参照になっていることを確認:

1. `src/lib/toolbox/types.ts` L77（`toTileable()` tool 側 `trustLevel` 参照）
2. `src/lib/toolbox/types.ts` L92（`toTileable()` play 側 `trustLevel` 参照）
3. `src/lib/toolbox/__tests__/types.test.ts` L151-152（`allToolMetas` 全件ループ — (g) で書き換え済）
4. `src/lib/toolbox/__tests__/registry.test.ts` L40-41（`getAllTileables()` 全件ループ — (g) で書き換え済）

T-A 着手時に新規参照箇所が発見されれば `cycle-193.md` を先に改訂してから実装（運用R7）。

#### (e) keigo-reference の meta.ts から trustLevel フィールド削除（実施順序 6）

`src/tools/keigo-reference/meta.ts` L23: `trustLevel: "curated"` 行を削除（`design-migration-plan.md` L298 標準手順ステップ 6 充足）。

残 33 件の `src/tools/*/meta.ts` は**本サイクルでは触らない**（後続 Phase 7 各サイクルで「ついで」削除、最終 Phase 10.2 = B-337 で型自体撤去）。

#### (f) keigo-reference の JSX / import から TrustLevelBadge を削除（実施順序 7）

`src/app/(new)/tools/keigo-reference/page.tsx`: `TrustLevelBadge` の import 行 + JSX 削除（cycle-180 L701 方針 + `design-migration-plan.md` L298 ステップ 6）。

### ファイル移動方式（案 11-A 確定）

`docs/cycles/cycle-193.md` 案 11（L428-452）で確定:

```bash
git mv src/app/(legacy)/tools/keigo-reference/ src/app/(new)/tools/keigo-reference/
```

`docs/design-migration-plan.md` L294 標準手順（実体確認済）。後続 33 ツール + 20 遊びの移行サイクルが踏襲する標準を確立する責務を本サイクルが持つ。

### howItWorks 件数自動算出（案 13-A 経路 X 確定）

`cycle-193.md` L479-493 で確定した実装手順:

1. `src/tools/keigo-reference/logic.ts` L53 の `const KEIGO_ENTRIES` に `export` を付与
2. `src/tools/keigo-reference/logic.ts` L1067 の `const COMMON_MISTAKES` に `export` を付与
3. `src/tools/keigo-reference/meta.ts` に `import { KEIGO_ENTRIES, COMMON_MISTAKES } from "./logic"` を追加
4. `meta.ts` L25 の「40 件以上の動詞を内蔵」→ `${KEIGO_ENTRIES.length} 件の動詞を内蔵`（現在値: 60 件）
5. `meta.ts` L30 の「合計 40 件以上の動詞を掲載」→ `合計 ${KEIGO_ENTRIES.length} 件の動詞を掲載`

**注意**: 手順 4・5 の文字列はバッククォート（`` ` ``）で囲むテンプレートリテラルにする必要がある。通常の文字列リテラル（`'...'` / `"..."`）では `${KEIGO_ENTRIES.length}` が展開されず、リテラル文字列として表示されてしまう。

**stable sort 要件**: filterEntries() / searchEntries() が返すエントリの順序は stable であること。M1b dislikes 3（同じ入力で同じ結果）対応。

### 既存テスト破壊なし要件

- `src/lib/toolbox/__tests__/` 内のテストが (g) の書き換えを経て全件 pass
- `npm run lint && npm run format:check && npm run test && npm run build` 全成功

---

## §12 「ツール内検索」と「横断検索」の概念区別

**本サイクル対象**: ツール内検索のみ。keigo-reference の動詞絞り込み検索。

**横断検索**: cycle-186 で不採用確定（複数ツールにまたがるキーワード検索）。本サイクルでは実装しない。

keigo-reference の `Input`（type="search"）はツール内の 60 件動詞を絞り込むためのもの。横断検索との混同に注意（`cycle-193.md` L207）。

---

## §13 設計ドキュメントライフサイクル

### 本ドキュメントの位置づけ

`docs/cycles/cycle-193.md` 案 6-B（L357-367）:

- 本ドキュメントは **Phase 7 進行中の作業基盤**
- Phase 9.2 完了で道具箱本体が公開され、道具箱本体の設計が DESIGN.md 等に統合された時点で `docs/archive/` に移動するかどうかを判断する

### archive 移動判断条件

Phase 9.2 着手 PM が以下をすべて確認した時点で `docs/archive/tile-and-detail-design.md` に移動する:

1. **ToolDetailLayout の設計が DESIGN.md §4 / §5 等または Phase 9.2 で確立する道具箱本体設計ドキュメントに統合済み**: 各 Phase 7 ツールが参照すべき設計がすべて反映されており、本ドキュメントを参照する必要がない状態になっている（`design-migration-plan.md` は移行作業計画であり恒久設計の置き場ではないため、同ファイルへの反映は archive 条件に含めない。cycle-179 B-309-4「Phase 2.2 修正不要」確定 / 案 15-A 整合）
2. **道具箱本体（B-336）の設計が確立済み**: Phase 9.2 でダッシュボードグリッド / DnD / タイル配置規格が設計されており、本ドキュメントの §7 / §8 が陳腐化している

上記 2 条件をともに満たした時点で移動する。1 つでも未達の場合は移動しない。

### 更新方針

本ドキュメント内容に変更が必要になった場合（実装中の設計逸脱等）は、`cycle-193.md` 運用R7 に従い計画書を先に改訂してから本ドキュメントを更新する。本ドキュメントは計画書 r5 の確定判断を統合したものであり、計画書改訂なしの単独更新は禁止。

---

## §14 設計要件チェックリスト（T-品質保証で使用）

T-E 実装担当者と T-品質保証担当者の双方が参照する要件番号体系。

### Panel / コンポーネント使用要件

- **R1**: 新版共通モジュール 9 個すべてが Panel コンポーネントを内部使用するか Panel 内収容前提で設計されていること（`DESIGN.md` §1 L8 / §4 L61-67）
- **R2**: ToolDetailLayout が Panel グリッド構造を使用していること
- **R3**: フィルタ / コピー / 展開ボタン等を独自 CSS で書かず、`src/components/` の Button / Input / ToggleSwitch を使用していること（`DESIGN.md` §5 L82）
- **R4**: keigo-reference 詳細ページが `Panel` を 1 件以上 import / 使用していること（T-E Done 条件 (c)）

### タイル設計要件

- **R5**: keigo-reference 用タイルが 1 コンポーネントのみで、TileVariant 型 / variantId / 複数バリアント並列実装がないこと
- **R6**: tile-loader.ts の diff が「if 分岐 1 件追加（slug === "keigo-reference"）」のみで、TileVariant 型 / variantId / loaderCache キー変更が含まれないこと（機械的 diff 検証）
- **R7**: タイルが `dynamic({ ssr: false })` でロードされていること（`docs/knowledge/dnd-kit.md` §1）

### useToolStorage 要件

- **R8**: useToolStorage の key 命名が `yolos-tool-<slug>-<purpose>` 形式に従っていること
- **R9**: useToolStorage が key 変更時の旧値クリア挙動を実装していること
- **R10**: useToolStorage が JSON parse 失敗時に initialValue へフォールバックすること
- **R11**: useToolStorage が storage 書き込み失敗時に silent fail すること

### JSON-LD / SSoT 要件

- **R12**: JSON-LD 出力箇所（page.tsx の generateToolJsonLd）と JSX 表示箇所（ToolDetailLayout 配下）が同じ meta.ts フィールドを参照していること（SSoT 原則）
- **R13**: JSON-LD（WebApplication / FAQPage / BreadcrumbList）の出力責務が page.tsx 側に固定されていること（タイル側は出力しない）
- **R14**: 動詞件数の SSoT は `logic.ts` の `KEIGO_ENTRIES.length`（現在値 60）であること。`meta.ts` の `howItWorks` / `faq` 内ではテンプレートリテラル `${KEIGO_ENTRIES.length} 件` 形式で参照し、JSON-LD と JSX の件数が構造的に一致していること（案 13-A 経路 X）

### A11y / パフォーマンス要件

- **R15**: ToolInputArea 内コントロール（検索 input / フィルタ Button / クリアボタン等）のタップターゲットが 44px 以上であること（WCAG 2.5.5）
- **R16**: 軽量版タイル内コピーボタンのタップターゲットが 44px 以上であること
- **R17**: 全インタラクティブ要素が `focus-visible` でアクセント色アウトライン（`outline: 2px solid var(--accent); outline-offset: 2px;`）を表示すること（`DESIGN.md` §2 L49）
- **R18**: コントラスト 4.5:1 以上（WCAG AA）

### レスポンシブ / 幅要件

- **R19**: w360 viewport で `/tools/keigo-reference` の body 幅 = 360px（横スクロールなし）
- **R20**: w360 viewport で `/internal/tiles` のタイルが Panel 内に収まり横はみ出しゼロであること

### 移行段取り要件

- **R21**: TrustLevelBadge の import / JSX が keigo-reference (new) ページから削除されていること（案 15-A / `design-migration-plan.md` L298）
- **R22**: `meta.ts` の `trustLevel` フィールドが keigo-reference から削除されていること（案 16-A (e)）
- **R23**: `ToolMeta.trustLevel` が optional 化されていること（`src/tools/types.ts` L25）
- **R24**: `Tileable.trustLevel` が optional 化されていること（`src/lib/toolbox/types.ts` L45）
- **R25**: 既存テスト（vitest）が全件 pass し、`npm run lint && npm run format:check && npm run test && npm run build` が全成功していること

### 詳細ページ構成要件

- **R26**: 詳細ページの主体が ToolDetailLayout であること（案 9 確定 / cycle-191/192 の「Tile.large-full.tsx が詳細ページ本体」は撤回済）
- **R27**: LifecycleSection が below-the-fold に配置されていること（M1a dislikes 5 対応）
- **R28**: ToolInputArea（検索欄 + フィルタ）が w360 / w1280 ともにファーストビュー内に表示されていること（M1a likes 1 対応 / Playwright `getBoundingClientRect()` で実機計測）

### 検索 / ソート要件

- **R29**: 検索結果のソートが stable sort であること（M1b dislikes 3 / M1b likes 4 対応）
- **R30**: 「ツール内検索」と「横断検索」が概念として混在していないこと（横断検索は cycle-186 不採用確定）

### Phase 9.2 引き継ぎ要件

- **R31**: §8 編集モード視覚は暫定実装（案 4-C）であり Phase 9.2 でゼロベース再評価される旨が、**T-申し送りタスクの Done 条件として組み込まれていること**

---

_本ドキュメントは `docs/cycles/cycle-193.md` r5 確定判断（案 1-17）を統合記述したもの。T-B / T-C / T-E 実装担当者の第一参照先。計画書と矛盾がある場合は計画書（cycle-193.md）を正として本ドキュメントを先に改訂する（運用R7）。_
