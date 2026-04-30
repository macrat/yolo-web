# デザイン移行計画

cycle-171 で整備した新デザインシステムへ既存全ページを段階的に移行するための計画書。cycle-172 以降の実装作業の指針として使う。

## 目的

- `(legacy)/` 配下の全ページを新コンポーネント体系（`src/components/` 直下）へ置き換える
- 移行と同時に、cycle-167 で確定したコア機能「道具箱（ダッシュボード）」の前提となるタイル化対応を進める
- 移行完了時に `src/app/(legacy)/`、`src/app/old-globals.css`、`src/components/common/` を完全に削除する
- 各ページの来訪者体験を損なわず、視覚的・機能的に同等以上の状態で移行を完了する

## 順序最適化の原則: 「2 回の作り直しを避ける」

ツール・遊びコンテンツの実装方法は、道具箱機能（タイルとしての動作要件）の影響を強く受ける。順序を誤ると、既存ツールを「単独ページ用に新デザイン化」した直後に「タイル化のためにもう一度書き直す」という二度手間が発生する。

そこで本計画では:

1. ツール詳細ページのデザイン移行（旧 Phase 3）と、ツールのタイル対応（B-314）を **同じ Phase に統合** する
2. その前提として、**タイル基盤（B-309）を先に構築** する
3. 道具箱機能と独立して進められる作業（静的ページ・一覧ページの移行）は先行する

## 移行アーキテクチャ

Route Group「複数 root layout」パターンを土台にする:

```
src/app/
├── (legacy)/  旧デザイン: layout.tsx → old-globals.css + src/components/common/
└── (new)/     新デザイン: layout.tsx → globals.css + src/components/
```

各 Route Group が独立した root layout を持つ。**移行は 1 ページずつ `git mv (legacy)/foo/ (new)/foo/` で完結する**。各ルートが独立しているため、移行済みページに旧スタイル / 旧コンポーネントが漏れることはない。

## 移行フェーズ

### Phase 0: 共通コンポーネントの整備

Phase 1 以降の前提条件。本サイクル（cycle-171）では Pagination / ShareButtons までを実装済の状態にし、その他は cycle-172 以降のページ移行に合わせて段階的に整備する。

#### 必要に応じて新規実装するもの

| 名前              | 旧版利用箇所数 | 必要性                                                               |
| ----------------- | -------------- | -------------------------------------------------------------------- |
| `TrustLevelBadge` | 19             | B-315 でコンテンツ縮小方針が確定後に判断（使わない可能性あり）       |
| `FaqSection`      | 5              | 特定ページに密接なため共通化せず、利用ページの移行時にページ内で実装 |

実装規約は cycle-171 T3 と同一（`src/components/<Name>/index.tsx` + `<Name>.module.css` + ロジックがあれば `__tests__/<Name>.test.tsx`）。

#### 既存ファイルのトークン置換 + 新 Header への結線が必要なもの

`src/components/search/` 配下に以下が既に実装済（フラット構成）。これらは新規実装ではなく、旧 `--color-*` トークン参照を新体系に置換し、新 Header の `actions` スロットに `SearchTrigger` を組み込む作業。

- `SearchModal` / `SearchTrigger` / `SearchInput` / `SearchResults`
- `useSearch.ts` / `highlightMatches.tsx`

CSS Module 内で `:root.dark` を使っている場合は `:global(:root.dark)` に修正する（CSS Modules のスコープ問題、`docs/knowledge/css-modules.md` 参照）。

**完了基準**: ページ移行で必要になった共通コンポーネントが `src/components/<Name>/` 直下に揃い、`/storybook` で実機確認できる状態になっている。`src/components/search/` 配下が新体系のトークンのみを使う状態になっている。

### Phase 1: 静的・依存少ない単独ページの移行

道具箱機能の影響を受けないため最初に進められる。

- `/about`
- `/privacy`
- `/not-found`
- `/feed`（RSS/Atom、UI なしだが Route の整理）

**完了基準**: 上記 4 ルートが `(new)/` 配下に移動済み。`(legacy)/` には残らず、Playwright 視覚確認で旧と同等以上の見た目と動作。

### Phase 2: 主要セクション一覧ページの移行

道具箱機能と独立した一覧ページ。Phase 1 と並列または後続で進められる。

- `/`（トップ）
- `/play`（一覧）
- `/tools`（一覧）
- `/blog`（一覧）

**完了基準**: 4 つの主要セクション一覧が `(new)/` 配下で動作し、Header / Footer の動線が新版と整合（リンク先がエラーなく到達）。

### Phase 3: タイル基盤の構築（B-309）

道具箱機能の土台。**詳細ページの移行（Phase 4）の前提となる**ため先に着手する。

- `Tile` コンポーネントの実装（`src/components/Tile/`）。サイズ・配置の規約、ドラッグハンドル、編集モード切替
- `/dashboard` ルートの新設（`(new)/dashboard/`）
- ドラッグ＆ドロップによるタイル配置 UI
- localStorage によるレイアウト永続化
- `ToolMeta` / `PlayMeta` 等のメタ型に「タイルとして表示するためのインタフェース」を追加（コンポーネント参照、推奨サイズ、入出力型の placeholder 等）。実体のタイル対応は Phase 4 で各コンテンツに対して実施する

**完了基準**: `/dashboard` ページが空のダッシュボードとして表示でき、サンプルのダミータイル（プレースホルダ）でドラッグ＆ドロップ・永続化が動作する。`ToolMeta` / `PlayMeta` の型定義にタイル対応の枠組みが入っている。

### Phase 4: ドメインコンテンツの「タイル対応 + 詳細ページのデザイン移行」を同時実施

ツール・遊びコンテンツのロジックを **1 回だけ書き直す** ためのフェーズ。各コンテンツについて以下を同時に行う:

1. ロジック（`src/tools/<slug>/`、`src/play/games/<slug>/` 等）の CSS Module を新トークンに置換
2. 表示用コンポーネントを **詳細ページとタイルの両方から再利用できる形** にリファクタ（例: `<ToolBody />` のような薄い表示コンポーネントを切り出し、詳細ページとタイルで共用）
3. 詳細ページ（`/tools/<slug>` 等）を `(new)/` 配下に移動
4. Phase 3 の `ToolMeta` / `PlayMeta` のタイル対応インタフェースに沿って、そのコンテンツのタイル定義を埋める
5. ブログ記事や辞典のような「タイル化に馴染まない」コンテンツは、詳細ページのデザイン移行のみ行いタイル定義は付けない（道具箱の対象外として扱う）

対象ルート:

- `/tools/[slug]`（30+ ツール、原則タイル対応）
- `/play/[slug]/result/[resultId]`、`/play/<game>` 各種（タイル対応の対象を選別）
- `/blog/[slug]`、`/blog/category/[category]`、`/blog/tag/[tag]`（記事ページ、タイル対応はしない）
- `/cheatsheets/[slug]`（タイル対応の判断は B-315 と連動）

**完了基準**: 各詳細ページが `(new)/` 配下で動作。タイル対応対象のコンテンツは `/dashboard` から実コンテンツとしてタイル配置できる。各ロジックの CSS Module から旧 `--color-*` トークン参照が消えている。

### Phase 5: 縮小予定コンテンツの移行 or 削除

cycle-167 で縮小方針が確定したコンテンツ。移行するか削除するかは B-315「既存コンテンツの整理」と連動して判断する:

- `/dictionary` 各種（漢字・四字熟語・伝統色・ユーモア）
- `/achievements`
- `/cheatsheets` 一覧
- `/memos`

**完了基準**: 各ページが「移行された」か「削除された」かのいずれかになっており、`(legacy)/` 配下に該当ディレクトリが残らない。

### Phase 6: 道具箱機能の拡張（B-312 / B-313 / B-324）

タイル基盤（Phase 3）と各コンテンツのタイル対応（Phase 4）が揃った後の機能拡張。それぞれ独立してサイクルを切ってよい。

- **6-A**: 構築済み道具箱テンプレート（B-312）。ペルソナ別プリセット（文章を書く人向け・プログラマー向け等）、オンボーディング動線
- **6-B**: ツール間の入出力連携（B-324）。タイル間の入力元選択 UI、型システム
- **6-C**: シェア機能（B-313）。タイル配置 + 設定の base64 エンコードによる URL シェア

**完了基準**: 各サブフェーズの実装と来訪者向け公開が完了。来訪者が「テンプレートから道具箱を作る → カスタマイズする → URL でシェアする」フローを実行できる。

### Phase 7: 統合・撤去

すべてのページが `(new)/` 配下に揃い、道具箱機能の最低限（Phase 3〜4）が動作したら最終整理:

1. `src/app/(legacy)/` を完全削除（残骸ゼロを `git status` で確認）
2. `src/app/(new)/` 配下のすべて（`layout.tsx`、`storybook/`、`dashboard/`、その他各ページ）を `src/app/` 直下に `git mv` で戻す。`(new)/` ディレクトリ自体を削除して Route Group を解消
3. `src/app/old-globals.css` を削除
4. `src/components/common/` を完全削除
5. `globals.css` の冒頭コメントから `(legacy)/` 関連の記述を削除
6. DESIGN.md §7「暫定対応」セクションを削除（移行完了で不要）
7. `src/app/layout.tsx` に `GoogleAnalytics` を直接組み込む（layout の部品として、共通コンポーネント化はしない）
8. **本計画書を `docs/archive/design-migration-plan.md` に移動**（移行完了でこのドキュメントの役割は終了。将来参照のために archive で保管）

**完了基準**: 上記 8 項目すべてが完了し、`grep -rE "legacy|old-globals|components/common|\\(new\\)|\\(legacy\\)" src/` が空。`docs/design-migration-plan.md` が存在せず、`docs/archive/design-migration-plan.md` が存在する。`npm run lint && format:check && test && build` が pass。

## 1 ページ移行の標準手順

各ページごとに以下を順に実施する。**Phase 4 ではタイル対応のステップ 5 が追加される**:

1. **依存コンポーネントの確認**: そのページが import している `@/components/common/*` を grep で列挙し、新版が存在するか確認。なければ Phase 0 に戻って整備
2. **`git mv (legacy)/foo/ (new)/foo/`**: ファイル/ディレクトリを丸ごと移動
3. **import パス修正**: ページ内の `@/components/common/*` を `@/components/*` に置換
4. **CSS Module 内のトークン置換**: `--color-*` 系（旧）→ `--bg`/`--fg`/`--accent` 系（新）に置換。`:root.dark` を使っている箇所は `:global(:root.dark)` に修正
5. **（Phase 4 のみ）タイル対応**: 表示用コンポーネントを詳細ページとタイルの両方から再利用できる形にリファクタし、`ToolMeta` / `PlayMeta` にタイル定義を追加
6. **テスト調整**: 移動後のテストパスや import が壊れていないか確認、`npm test` を当該ファイル範囲で実行
7. **視覚確認**: Playwright で w360 / w1280 のライト/ダーク両モードのスクリーンショットを取り、移行前と比較。崩れがないか・新デザインの意図に沿うかを確認。Phase 4 ではタイルとしての表示も `/dashboard` で確認
8. **コミット**: 1 ページ 1 コミットを基本（差分が大きい場合は適切に分割）

## 検証方法

### コンポーネント単体（`/storybook` 運用ルール）

- Phase 0 で新コンポーネントを追加したら、**必ず `/storybook` のページに対応セクションを追加する**。一覧から漏れた新コンポーネントは品質確認の網をすり抜けるため
- 各セクションで以下を満たすこと:
  - ライト/ダーク両モードで視覚的に成立している
  - DESIGN.md と整合する見た目（`-soft` 背景の border は `-strong`、フォーム要素の border は `--border-strong` 等）
  - ロジックがあるコンポーネントは `/storybook` 上でクリック等の動作確認ができる（controlled state 等）
- 各 Phase 完了時に `/storybook` 全体を Playwright で撮影し、ライト/ダーク両モードで破綻がないことを確認する

### ページ単位

- Playwright で `/foo` を w360 / w1280 のライト/ダーク両モードで撮影
- DOM に旧 `src/components/common/` 由来の class（`Header-module__Pzgc7q__*` 等のハッシュ）が一切出ないこと
- 視覚的崩れ・コントラスト不足がないこと
- 既存テスト（vitest）が pass すること
- `npm run build` が通り、該当ルートが正しく生成されること

### 段階的移行の整合性確認

各フェーズで「移行済みページと未移行ページが同時に存在しても、それぞれ意図したデザインで動く」状態を維持する。具体的に毎フェーズ完了時に:

- 移行直後、移行したページは新スタイル、未移行ページは旧スタイルのまま動くこと
- 共通リンク（Header / Footer の動線）が両方のページから機能すること
- ブラウザの戻る・進むで両方のページを行き来しても破綻しないこと

## ロールバック条件

以下のいずれかを観測したら当該ページの移行コミットを `git revert` する:

- 視覚的崩れ（レイアウト破綻、テキスト溢れ、色のコントラスト不足）
- アクセシビリティ低下（screen reader 操作の阻害、キーボード操作不能）
- WCAG コントラスト比 4.5:1 を下回る箇所の発生
- パフォーマンス低下（Lighthouse スコア悪化、Core Web Vitals 悪化）
- テスト失敗（既存テスト破壊）
- 来訪者影響（GA4 で当該ページの離脱率急増等）

`(legacy)/` と `(new)/` が独立しているため、ロールバックは `git mv` を逆方向に実行するだけで完了する。

## 完了の定義

- `src/app/(legacy)/` ディレクトリが存在しない
- `src/app/old-globals.css` が存在しない
- `src/components/common/` が存在しない
- `src/app/(new)/` が `src/app/` 直下に統合されている（Route Group 解消）
- `globals.css` から legacy 関連の記述が消えている
- DESIGN.md §7「暫定対応」セクションが削除されている
- `/dashboard`（道具箱機能）の最低限（タイル基盤 + 既存コンテンツのタイル対応）が動作している
- 本計画書が `docs/archive/design-migration-plan.md` に移動済み
- 移行時点で残存する全ページの Playwright 視覚確認が完了
- `npm run lint && npm run format:check && npm run test && npm run build` が pass
- yolos.net 本番環境のデプロイで全ページがエラーなく表示される
