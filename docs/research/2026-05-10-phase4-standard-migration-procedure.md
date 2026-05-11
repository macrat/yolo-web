# Phase 4 標準移行手順の整理（cycle-185 / Phase 4.4 計画立案者向け）

調査日: 2026-05-10  
調査対象: docs/cycles/cycle-181.md / cycle-182.md / cycle-183.md / cycle-180.md / cycle-184.md  
一次情報: 上記ドキュメント本文・コンポーネント実体 (src/)

---

## 1. 各サイクルの実施タスク構造

### 粒度・順序・命名規則

3 サイクルで確立した命名規則: `B-334-{フェーズ番号}-{連番}` (例: B-334-2-3)。  
全サイクル共通のタスク順序テンプレートは以下の通り:

| ステップ | 役割                                                                  | 例 (cycle-183) |
| -------- | --------------------------------------------------------------------- | -------------- |
| 1        | ルート移行 (git mv)                                                   | B-334-3-1      |
| 2        | 新コンポーネント設計 + 新デザイン適用                                 | B-334-3-2      |
| 3        | フィルタ UI + 検索 UI の実装                                          | B-334-3-3      |
| 4        | NEW バッジ + 並び順                                                   | B-334-3-4      |
| 5        | テスト整備（(a) 純関数テスト 並行可 / (b) コンポーネントテスト 直列） | B-334-3-5      |
| 6        | PM 自身による視覚検証 (Playwright)                                    | B-334-3-6      |
| (+)      | config 修正など独立変更 (cycle-183 では B-334-3-7)                    | B-334-3-7      |

**cycle-181 (Phase 4.1 / /tools)**: B-334-1〜B-334-6。  
ルート移行 (B-334-1) と Header 検索トリガー構造追加 (B-334-5) が追加された Phase 4.1 固有タスク。  
(cycle-181.md L18-23)

**cycle-182 (Phase 4.2 / /play)**: B-334-2-1〜B-334-2-6 + dead code 整理。  
(legacy)/play/page.tsx に存在していた "今日のピックアップ" / "イチオシ" セクションを廃止し、単一グリッド + フィルターに統合した。  
(cycle-182.md L2-3, L20-29)

**cycle-183 (Phase 4.3 / /blog)**: B-334-3-1〜B-334-3-7。  
6 ルート (blog 一覧系全体) を同時移行 + `next.config.ts` リダイレクト追記 (B-334-3-7) が追加。  
(cycle-183.md L22-49)

### 並行可否ルール (3 サイクル共通)

- 同一ファイルを変更するタスク (N-2/N-3/N-4) は**同一 builder に直列依頼**
- 純関数テスト (N-5a) は N-2 の関数シグネチャ確定後に**別 builder で並行**可
- ルート移行と独立 config 変更 (N-7) は**別 builder で並行**可

(cycle-182.md L20-21, cycle-183.md L22-41)

---

## 2. 新デザインの共通コンポーネント

### 全 3 ページで採用された 4 層アーキテクチャ

| 層             | 種別                            | ファイル (tools / play / blog)                                                  |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| ListsView      | Server Component                | `src/tools/_components/ToolsListView.tsx`                                       |
|                |                                 | `src/play/_components/PlayListView.tsx`                                         |
|                |                                 | `src/blog/_components/BlogListView.tsx`                                         |
| FilterableList | Client Component ("use client") | `ToolsFilterableList.tsx` / `PlayFilterableList.tsx` / `BlogFilterableList.tsx` |
| Grid           | Client Component                | `ToolsGrid.tsx` / `PlayGrid.tsx` / `BlogGrid.tsx`                               |
| Card           | Client Component                | `ToolCard.tsx` / `PlayCard.tsx` / `BlogCard.tsx`                                |

**Suspense ラップ**: 全 3 サイクルで ListView が FilterableList を `<Suspense>` でラップする。  
理由: `useSearchParams` を含む Client Component を Server Component から呼ぶ Next.js 仕様要件。  
(cycle-182.md L102-103, cycle-183.md L165-166)

### Panel コンポーネント (src/components/Panel/index.tsx)

全 3 ページのヘッダー領域に `<Panel as="section">` を使用。  
ToolsListView.tsx L29: `<Panel as="section" className={styles.header}>`  
PlayListView.tsx L28: `<Panel as="section" className={styles.header}>`  
BlogListView.tsx L100: `<Panel as="section" className={styles.header}>`

### サブルートごとの layout の扱い

- `(new)/tools/` 配下: tools 専用 layout を**置かない** (共通 `(new)/layout.tsx` に委ねる)
- `(new)/play/` 配下: play 専用 layout を**置かない** (cycle-182.md L96: "cycle-181 と同方針")
- `(new)/blog/` 配下: blog 既存 layout.tsx は passthrough 相当のため移動 or 削除どちらも可 (cycle-183.md L153)

### ヘルパーファイル

各セクション共通で以下 2 種が `_components/` 直下に配置される:

- `newSlugsHelper.ts`: NEW バッジ判定純関数 (`calculateNewSlugs`)
- (blog のみ) `searchFilter.ts`: 5 系統横断検索純関数 (`filterPostsByKeyword`)

(cycle-183.md L176-177)

### not-found の扱い

`(new)/*` 配下でページ固有の `not-found.tsx` は置かない方針。  
Phase 3 (cycle-180) で設置した `src/app/global-not-found.js` + `experimental.globalNotFound: true` が unmatched URL を catch する。  
各ページから `notFound()` を呼ぶ場合は Route Group 単位の `not-found.tsx` を別途置く判断が必要。  
(cycle-180.md キャリーオーバー "not-found の配置" 行)

---

## 3. メタデータ・OGP 画像の扱い

### metadata の更新方針

- `title` / `keywords`: 検索流入経路を保つため**不変**を原則
- `description`: 構造変化 (多段 → 単一グリッド + フィルター) を反映した文言に更新
- ツール数表記: ハードコードから `allToolMetas.length` の動的生成に変更 (cycle-181.md L48)
- コンテンツ数表記: `allPlayContents.length` から動的算出 (cycle-182.md L113)

### OGP 画像の扱い

**3 サイクルとも `opengraph-image.tsx` / `twitter-image.tsx` を作らなかった**。

- `/tools`: "一覧用 OGP 画像が `(legacy)/tools/` 直下に存在する場合は git mv" という計画記述があったが、実体確認で存在せず。新規作成は別 backlog (B-387) に送出。
- `/play`: "現状 `(legacy)/play/` 直下に `opengraph-image.tsx` / `twitter-image.tsx` は存在しない" を確認し、新規作成を B-387 として起票。(cycle-182.md L244-247)
- `/blog`: "OGP 画像（B-387）は明示的にスコープ外" と明記。(cycle-183.md L16, L59)

**OGP 画像が現在 `(new)/` 配下に存在するのは `/privacy` のみ** (Phase 3 = cycle-180 で作成)。  
実体確認: `/mnt/data/yolo-web/src/app/(new)/privacy/opengraph-image.tsx` / `twitter-image.tsx`

Phase 4.4 (トップ) でも同方針が継続される見込み。B-387 の状況を確認すること。

---

## 4. テスト方針

### テスト構成パターン (3 サイクル共通)

| テスト種別                    | ファイル配置                                       | アサート対象                                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 純関数テスト                  | `_components/__tests__/newSlugsHelper.test.ts`     | calculateNewSlugs の 30 日×上位 5 件積集合、境界条件                                                                                                                                                            |
| FilterableList 振る舞いテスト | `_components/__tests__/XxxFilterableList.test.tsx` | フィルタナビ表示、aria-current="page"、カテゴリ+キーワード積集合、不正カテゴリ null フォールバック、大文字小文字不区別、空結果 role="status"、debounce router.replace、buildCategoryHref でのキーワード引き継ぎ |
| Card 表示テスト               | `_components/__tests__/XxxCard.test.tsx`           | カテゴリラベル / タイトル / 説明 / NEW バッジ / カテゴリ固有バッジ                                                                                                                                              |
| ListView 統合テスト           | `_components/__tests__/XxxListView.test.tsx`       | Server Component から FilterableList へ props が渡ること                                                                                                                                                        |
| ルート存在テスト              | `(new)/xxx/__tests__/page.test.tsx`                | ページコンポーネントが定義済み、h1 見出し、カテゴリナビ、検索ボックスの存在                                                                                                                                     |

**モック方針**: `vi.mock("next/navigation", ...)` で `useSearchParams` / `useRouter` をモック。  
`vi.mock("next/link", ...)` でリンクコンポーネントを `<a>` 相当にモック。

**旧テストの処遇**:

- cycle-181: `(legacy)/tools/page/[page]/page.test.ts` は新ルートを参照するよう更新
- cycle-182: `(legacy)/play/__tests__/page.test.tsx` は旧構造に対する assertion で全落ちするため**廃止**し B-334-2-5 で新テストを書き直す
- cycle-183: `src/blog/_components/__tests__/BlogListView.test.tsx` 旧版を削除し B-334-3-5 で新規作成

(cycle-182.md L97, cycle-183.md L181)

---

## 5. Phase 4 の「標準スコープを超えた a11y 配慮」

`docs/design-migration-plan.md` の Phase 4 a11y 責務 (L119-L131) として明文化された以下の項目が、cycle-181/182/183 で順次実装された。

### フィルタ UI セマンティクス

cycle-181 での違反 (aria-pressed のボタン + タブ風見た目の不整合) を cycle-181 R5 で是正し、以下を Phase 4 の確定方針とした:

- カテゴリフィルタ: `<Link href="?category=xxx">` + `aria-current="page"` + `data-active="true"`
- `<Button>` + `aria-pressed` は**使わない**
- 選択中のカテゴリをクリックしても何も起きない (タブの自然な挙動)

(cycle-182.md L126-130)

### タップターゲット 44px

Button / Input コンポーネント本体 (B-386: 未完) が 44px 未達のため、各ページの CSS で個別上書きする暫定対応を 3 サイクルにわたり継承。  
対象: カテゴリリンク / 検索入力 / タグリンク / ページネーションリンク。  
(cycle-181.md L65, L237; cycle-182.md L140-141; cycle-183.md L241-244)  
cycle-183 では Pagination の 44px も応急処置 (cycle-183.md L443 "Pagination 44px") → B-388 起票。

Phase 4.4 でも同じ継承対応が必要 (B-386 / B-388 が未着手の場合)。

### focus-visible

DESIGN.md §2 末尾のフォーカススタイル規約に準拠。全インタラクティブ要素 (カードリンク、フィルタリンク、検索入力、ページネーション) に適用。具体値は builder 判断。

### コントラスト 4.5:1

DESIGN.md トークン (`--bg`/`--fg`/`--accent`/`--fg-soft`) 使用で設計上担保。視覚検証で目視確認。

### カード等高 / badges 行 min-height

- `height: 100%; box-sizing: border-box;` をグリッドアイテムに設定 (cycle-181 R3-1 で確立)
- NEW バッジ有無で h2 位置がズレないよう badges 行に固定 min-height を設ける (cycle-181 R3-4)

(cycle-182.md L116-118)

### 空状態の role="status"

ヒット件数 0 件時に `role="status"` 付きメッセージを表示。文言は「次の行動を示す」形式:  
「該当するコンテンツが見つかりませんでした。キーワードを変えるか、カテゴリを切り替えてみてください。」  
(cycle-182.md L137)

### WCAG 2.4.5 Multiple Ways (複数到達経路)

各一覧ページへの到達経路が複数存在することを確認・記録することが cycle-181 から完了基準に含まれた。  
確認済み経路: (i) Header ナビ、(ii) Footer リンク、(iii) トップページからの動線、(iv) sitemap.xml。  
(cycle-181.md L90, L122; cycle-182.md L332; cycle-183.md L395-396)

**Phase 4.4 でも同じ責務を負う。** design-migration-plan.md L126-L131 に明文化されており、Phase 4 担当が一貫して引き継ぐ責務として定義されているため。

---

## 6. 新ヘッダー設計の Phase 5 準備事項

### cycle-181 (Phase 4.1) で実装済み

Header の検索トリガー構造追加 (B-334-5) は**cycle-181 で完了している**。  
Phase 4.2 / 4.3 では Header コンポーネントへの変更はなかった。

実装内容 (`src/components/Header/index.tsx`):

| 要素                              | 実装状態                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| `onSearchOpen?: () => void` props | 追加済み (L70)                                                        |
| デスクトップ検索ボタン            | `onSearchOpen != null` 時のみレンダリング (L172-181)                  |
| モバイル検索ボタン (44px)         | `onSearchOpen != null` 時のみ、ハンバーガー左隣に配置 (L188-197)      |
| Cmd+K / Ctrl+K キーバインド       | `onSearchOpen != null` 時のみリスナー登録 (L113-127)                  |
| `actions` スロット                | `(new)/layout.tsx` から `<StreakBadge />` と `<ThemeToggle />` を注入 |

**Phase 5 までは非表示**: `(new)/layout.tsx` から `onSearchOpen` を渡していないため、検索ボタン・キーバインドリスナーは DOM に存在しない。来訪者には一切見えない。  
(cycle-181.md L72-78, Header/index.tsx L67-71 コメント)

### Phase 4.4 での扱い

Header 検索トリガー構造は cycle-181 で完了済みのため、**Phase 4.4 では Header コンポーネントへの変更は不要**。  
`(new)/layout.tsx` が `<Header actions={...} />` を渡す構造も既に完成している。  
Phase 4.4 で追加が必要なのはトップ `/` ページ固有の変更のみ。

---

## 7. cycle-180 / cycle-183 の「Phase 4.4 への申し送り」

### cycle-180.md キャリーオーバー (L725-L735)

```
### B-334: 一覧・トップ移行（Phase 4、既存）への申し送り

- Header / Footer の actions スロットは Phase 3 完了時点で既に新版に統一されている: ...
- TrustLevelBadge の取り扱い: 各 Phase 4-8 移行サイクルの「ついで作業」として、
  (legacy) → (new) 移行時に import / JSX / meta.ts trustLevel フィールドを削除する。
- Phase 4.4 トップ移行のコンテンツ扱い: design-migration-plan.md L113-L114「現行のトップ内容を
  新デザインに移行」に従う = コンテンツは「占い・診断パーク」のままデザインだけ新版に移行する。
  コンセプト切替は Phase 9.2（B-336）で about・トップ・ヘッダー・フッターを一斉に行う。
  Phase 4.4 で本文を新コンセプトに書き換える誘惑があるが、Phase 9.2 まで待つ
  （道具箱機構の本実装と同時に切替えないと整合不全になる）。これは「廃棄予定の (legacy) と
  整合する (new) ページに先行で手を入れない」という cycle-180 で確立した原則
- not-found の配置: Phase 3 で `src/app/global-not-found.js` + `next.config.ts` の
  `experimental.globalNotFound: true` を採用済み。...
```

(cycle-180.md L725-L738)

### cycle-183.md キャリーオーバー (L670-L675)

```
- Phase 4.4（B-334-4 = トップ移行）への申し送り:
  - 本サイクルで確立したパターン（4 層アーキテクチャ + 5 系統検索 + ヒット件数 ≥1 件時のみ表示
    + 0 件時 `role="status"` 一本 + `::after` overlay によるカード全体クリッカブル +
    `aria-current="page"` + 44px 個別上書き継承）をトップ一覧でも踏襲する。
  - トップは Phase 9.2（B-336）で道具箱化される予定で、Phase 4.4 の現行トップ移行と Phase 9.2 の
    スコープが連動する。Phase 4.4 着手時に Phase 9.2 との関係を再評価。
  - commit 戦略は本サイクルで確立した「ルート移行 + 新コンポーネント実装を同 commit にまとめる」を
    トップでも踏襲。同時に AP-WF13（並行 builder のスコープ越境）に注意し、builder への指示文に
    「他のファイルは触らない」を明示する。
```

(cycle-183.md L670-L679)

### cycle-182.md 補足 (L429-L431)

```
- Phase 4.4（トップ）移行時のコンテンツ扱い: コンテンツは「占い・診断パーク」のままデザインだけ
  新版に移行する。コンセプト切替は Phase 9.2（B-336）まで待つ（cycle-180 申し送り）。
```

(cycle-182.md L429-L431)

---

## 8. Phase 9.2 (B-336) との境界

### cycle-180.md (L735) の定義 — 最初の明文化

```
Phase 4.4 トップ移行のコンテンツ扱い: design-migration-plan.md L113-L114「現行のトップ内容を
新デザインに移行」に従う = コンテンツは「占い・診断パーク」のままデザインだけ新版に移行する。
コンセプト切替は Phase 9.2（B-336）で about・トップ・ヘッダー・フッターを一斉に行う。
Phase 4.4 で本文を新コンセプトに書き換える誘惑があるが、Phase 9.2 まで待つ
（道具箱機構の本実装と同時に切替えないと整合不全になる）。
```

### design-migration-plan.md L113-L117 の定義

```
トップ（4.4）は現行のトップ内容を新デザインに移行する。Phase 2.1 で「URL=トップ」を採用した
場合は Phase 9.2 でこれを道具箱に置き換える。それまではトップは現行内容のまま動く。
```

### cycle-183.md キャリーオーバー (L672)

```
トップは Phase 9.2（B-336）で道具箱化される予定で、Phase 4.4 の現行トップ移行と Phase 9.2 の
スコープが連動する。Phase 4.4 着手時に Phase 9.2 との関係を再評価。
```

### cycle-184.md の補足 (L466-L468)

cycle-184 で Phase 4 を誤って "Done" にしてしまった事故が記録されている:

```
- 何をしたか: cycle-184 kickoff で B-334（Phase 4 一覧・トップ移行）を Active から Done に移動し、
  Notes に「Phase 4 全完了」「トップ `/` は当初 Phase 4 に含まれていたが Phase 9.2（B-336）に
  分離済み」と書いた。実体としては Phase 4.4（トップ `/` の `(new)/` 配下への移行）が未着手で、
  `(new)/page.tsx` が存在しないことを確認していなかった。
```

この記録から、Phase 4.4 のスコープは「**`(new)/page.tsx` の新規作成 (= トップを `(new)/` 配下に移行)」であり、「Phase 9.2 に分離済み」という解釈は誤り**であることが確認されている。

### スコープ境界のまとめ

| スコープ                                                 | Phase 4.4  | Phase 9.2 (B-336) |
| -------------------------------------------------------- | ---------- | ----------------- |
| `(legacy)/page.tsx` → `(new)/page.tsx` への git mv       | **対象**   | 対象外            |
| 新デザインへの適用 (Panel / トークン / Suspense 等)      | **対象**   | 対象外            |
| トップのコンテンツ (現在「占い・診断パーク」) の書き換え | **対象外** | 対象              |
| コンセプト「日常の傍にある道具」への切替                 | **対象外** | 対象              |
| about / ヘッダー / フッターのコンセプト切替              | **対象外** | 対象              |

---

## 付録: 実装パターンのクイックリファレンス

### URL パラメータ方式

| 用途             | パラメータ                                             | 状態管理                                           | ブラウザ戻る           |
| ---------------- | ------------------------------------------------------ | -------------------------------------------------- | ---------------------- |
| カテゴリフィルタ | `?category=xxx`                                        | Link 遷移                                          | push (自動)            |
| キーワード検索   | `?q=xxx`                                               | ローカル state + 300ms debounce + `router.replace` | replace (履歴汚染なし) |
| 不正カテゴリ値   | null フォールバック (`VALID_CATEGORY_VALUES.has(raw)`) | —                                                  | —                      |

### カード実装パターン

- カード全体を `<Link>` でクリッカブルに (または `::after` overlay 方式)
- `height: 100%; box-sizing: border-box;` でグリッド等高
- badges 行に固定 min-height (NEW バッジ有無で見出し位置がズレない)
- 絵文字・accentColor・装飾色は使わない (DESIGN.md §3)

### NEW バッジ判定

```
calculateNewSlugs(items, now): Set<string>
  - items を publishedAt 降順で並べて先頭 5 件を取得
  - そのうち now - publishedAt < 30 日のもの
  - 両条件の積集合
```

### commit 戦略

- ルート移行 (git mv) + 新コンポーネント実装 = **同 commit でアトミックに**
- 独立した config 変更 (next.config.ts 等) は別 commit / 並行 builder 可
- `git revert` 単位で巻き戻し可能な粒度を維持

### 視覚検証 (PM 自身が実施)

- シナリオ: 初期状態 / カテゴリフィルタ適用 / キーワード検索 / 併用 / 空状態
- 4 パターン: w360 × light / w360 × dark / w1280 × light / w1280 × dark
- 観測必須: カード等高 / badges 行高さ揃い / 44px タップターゲット / aria-current="page" / 空状態 role="status"
