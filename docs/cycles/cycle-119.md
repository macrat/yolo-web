---
id: 119
description: "B-207 /playカテゴリナビのアクティブ状態表示"
started_at: "2026-03-26T15:24:42+0900"
completed_at: "2026-03-26T16:20:33+0900"
---

# サイクル-119

このサイクルでは、/playページのカテゴリナビゲーションにアクティブ状態表示を追加します。IntersectionObserverを使ってスクロール位置に応じたカテゴリタブのハイライトを実装し、ユーザーが現在どのセクションを見ているか視覚的にフィードバックします。

## 実施する作業

- [x] B-207: /playカテゴリナビのアクティブ状態表示

## 作業計画

### 目的

/playページでコンテンツをブラウズする際に、今どのカテゴリセクションを閲覧中かを視覚的に示す。これにより、ページの見通しが良くなり、ユーザーが目的のカテゴリに素早くたどり着ける。特にモバイルではスクロール量が多く、現在位置の把握がUXに直結するため、効果が大きい。

### 作業内容

全体を4つのフェーズに分割し、順序通りに進める。

#### フェーズ1: Client Componentの作成

1. **CategoryNavクライアントコンポーネントの新規作成**
   - ディレクトリ: `src/app/play/_components/` を新規作成（Next.jsの `_` プレフィックスによりルート除外される）
   - ファイル: `src/app/play/_components/CategoryNav.tsx`
   - `"use client"` ディレクティブを付与したClient Componentとして作成する
   - propsとしてカテゴリ一覧（`{ category: string; label: string }[]`）を受け取る
   - IntersectionObserverを使い、4つのカテゴリセクション（`id="fortune"`, `id="personality"`, `id="knowledge"`, `id="game"`）の表示状態を監視する
   - `rootMargin` はnavバーの高さに基づいて動的に設定する。`useEffect`内で`nav`要素の`getBoundingClientRect().height`を取得し、`rootMargin`を`-${navHeight}px 0px 0px 0px`として設定する。これにより、navの高さがフォントサイズ・パディング・flex-wrap（640px以下ではnowrap、それ以上ではwrap）で変動しても正しく検知できる
   - `threshold` は `0`（セクションの先頭がビューポートに入った時点で検知）
   - **アクティブセクション判定ロジック**: 現在ビューポート内にある（`isIntersecting === true`）セクションIDのSetを`useRef`で保持する。コールバックで各entryの`isIntersecting`に応じてSetを更新した後、Set内のセクションのうち`CATEGORY_DISPLAY_ORDER`の順序で最初のもの（=画面最上部に最も近いもの）をアクティブとする。これによりIntersectionObserverが差分のみを返す仕様でも正しく動作する
   - アクティブなカテゴリのstateを `useState` で管理する
   - アクティブタブには既存の `categoryNavTab` クラスに加え、新たに定義する `categoryNavTabActive` クラスを付与する
   - コンポーネントのクリーンアップ時にobserverを `disconnect` する

2. **設計上の考慮点**
   - ページ最上部（featuredSectionが見えている状態）ではどのタブもアクティブにしない。アクティブ状態はカテゴリセクションが実際に表示された時のみ発火させる
   - SSR時（hydration前）はアクティブ状態なしでレンダリングされるため、見た目の一貫性が保たれる
   - `useEffect` 内でobserverを初期化し、SSRでのエラーを回避する

#### フェーズ2: CSSの追加

3. **アクティブ状態のCSSスタイル定義**
   - ファイル: `src/app/play/page.module.css`
   - `.categoryNavTabActive` クラスを新規追加する
   - 具体的なアクティブ時スタイル:
     - `background-color: var(--color-primary)` --- サイトのプライマリカラー（ライト: #2563eb、ダーク: #60a5fa）
     - `color: #fff` --- 白文字で背景とのコントラストを確保
     - `border-color: var(--color-primary)` --- ボーダーも統一
   - 既存hoverスタイル（`background-color: var(--color-border); color: var(--color-text)`）とは明確に差別化される。hoverは控えめなグレー系、アクティブはプライマリカラーで強調
   - `transition` は既存の `categoryNavTab` に設定済み（`background-color 0.15s, color 0.15s, border-color 0.15s`）なので、クラス切り替えだけでスムーズなトランジションが実現される
   - ダークモードではCSS変数 `--color-primary` が自動的にダーク用の値に切り替わるため、追加のダークモード対応は不要

#### フェーズ3: Server Componentとの接続

4. **page.tsxの修正**
   - ファイル: `src/app/play/page.tsx`
   - 既存の `<nav>` 内の4つの `<a>` タグ部分を、新しい `CategoryNav` コンポーネントに置き換える
   - IntersectionObserverのロジックとタブのレンダリングは密結合のため、`<nav>` 要素ごとClient Componentに含める
   - `CATEGORY_DISPLAY_ORDER` の定義はpage.tsxに残し、propsとしてClient Componentに渡す
   - page.tsx自体は引き続きServer Componentのままとする（`"use client"` は追加しない）

#### フェーズ4: テストとビルド検証

5. **テストの作成**
   - ディレクトリ `src/app/play/_components/__tests__/` を新規作成する
   - ファイル: `src/app/play/_components/__tests__/CategoryNav.test.tsx`
   - IntersectionObserverをモックしてテストする
   - テストケース:
     - 初期状態でアクティブタブがないこと
     - 特定セクションがintersectした時に対応タブがアクティブになること
     - セクションが離れた時にアクティブが切り替わること
     - 複数セクションが同時にintersectしている場合、CATEGORY_DISPLAY_ORDER順で最初のものがアクティブになること
     - 最後のセクション（game）までスクロールした場合にgameタブがアクティブになること
     - 各タブのリンクが正しいhrefを持つことの確認

6. **ビルド検証**
   - `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功することを確認する

### 検討した他の選択肢と判断理由

#### 選択肢A: CSS `:target` 擬似クラスを利用する方法

- アンカーリンクのクリック時に `:target` でハイライトする純CSS手法
- **不採用理由**: ユーザーがスクロールでセクションに到達した場合にはURLフラグメントが変わらないため、`:target` は発火しない。タブクリック時にしかハイライトされず、スクロール追従というコア要件を満たせない

#### 選択肢B: scroll イベントリスナーで `getBoundingClientRect` を使う方法

- scrollイベントで各セクションの位置を計算し、アクティブなセクションを判定する手法
- **不採用理由**: scrollイベントは高頻度で発火するためパフォーマンスに難がある。throttle/debounceの追加が必要になり、実装が複雑化する。IntersectionObserverはブラウザがネイティブに最適化しており、パフォーマンスと実装の簡潔さの両面で優れる

#### 選択肢C（採用）: IntersectionObserverを使う方法

- 各セクション要素を監視し、ビューポートへの出入りをコールバックで検知する手法
- **採用理由**: ブラウザネイティブのAPIで高パフォーマンス。scrollイベントのようなthrottle不要。主要ブラウザで広くサポートされている（IE以外の全モダンブラウザ対応済み）。Next.jsのClient Componentパターンとも相性が良い

#### 選択肢D: page.tsx全体をClient Componentにする方法

- `"use client"` をpage.tsxに追加し、IntersectionObserverロジックを直接組み込む
- **不採用理由**: Server Componentの利点（初期HTML生成のパフォーマンス、メタデータ処理）を失う。影響範囲が大きく、不必要なクライアントバンドルの増加を招く。NavLinksコンポーネントが既に同様の「Server Component内にClient Componentを埋め込む」パターンを採用しており、プロジェクトの慣習にも合致する

### 計画にあたって参考にした情報

1. **既存コードの調査結果**
   - `src/app/play/page.tsx`: Server Component、4つのカテゴリセクション（`id="fortune"`, `id="personality"`, `id="knowledge"`, `id="game"`）、stickyな `<nav>` 要素
   - `src/app/play/page.module.css`: `categoryNav` がsticky（`position: sticky; top: 0; z-index: 10`）、`categoryNavTab` にhoverトランジション設定済み、アクティブ状態のクラスは未定義
   - `src/components/common/NavLinks.tsx`: Server Component内にClient Componentを埋め込むパターンの既存実装例。propsでデータを渡し、`usePathname`でアクティブ状態を判定している

2. **プロジェクトのコーディング規約（`.claude/rules/coding-rules.md`）**
   - 「静的最優先、クライアントは必要に応じて」の原則に従い、IntersectionObserverロジックのみをClient Componentに分離する設計とした
   - CSS変数ベースでダークモード対応する方針は既存のpage.module.cssの設計パターンに準拠

3. **テスト戦略（`.claude/rules/testing.md`）**
   - テストファイルは対象ファイルと同階層の `__tests__/` に配置する規約に従う
   - IntersectionObserverはjsdom環境では利用不可のためモックが必要

4. **IntersectionObserver API**
   - `rootMargin` オプションでstickyナビの高さ分を補正可能。navの実際の高さを `getBoundingClientRect()` で取得し動的に設定する
   - `threshold: 0` でセクションの1pxでもビューポートに入れば発火
   - コールバックは状態変化のあったエントリのみを返すため、現在intersectしている全セクションのSetを`useRef`で自前管理する必要がある

5. **CSS変数の調査結果**
   - `--color-primary`: ライトモード #2563eb（青）、ダークモード #60a5fa（明るい青）。アクティブタブの背景色に使用する
   - 既存のhoverスタイル（`var(--color-border)` / `var(--color-text)`）とは視覚的に明確に差別化される

## レビュー結果

### 計画レビュー（1回目）

5件の指摘を受け、すべて対応済み。

- **指摘1 (重要)**: rootMarginのハードコーディングリスク --- navバーの高さは可変のため、`useEffect`内で`getBoundingClientRect().height`を動的に取得する方式に変更（作業内容 項目1のrootMargin説明を修正）
- **指摘2 (重要)**: アクティブセクション判定ロジックの曖昧さ --- IntersectionObserverの`entries`は状態変化分のみを含むため、`useRef`でintersecting中のセクションIDのSetを保持し、Set内でCATEGORY_DISPLAY_ORDER順で最初のものをアクティブとするロジックを明記（作業内容 項目1のアクティブセクション判定ロジックを追加）
- **指摘3 (軽微)**: ページ最下部のエッジケース --- テストケースに「最後のセクション（game）までスクロールした場合」を追加（作業内容 項目5のテストケースに追加）
- **指摘4 (軽微)**: CSSクラスの具体的なスタイル値 --- `globals.css`を調査し、`--color-primary`（ライト: #2563eb、ダーク: #60a5fa）を背景色に、白文字をテキスト色に採用。hoverスタイルとの差別化を明記（作業内容 項目3を具体化）
- **指摘5 (軽微)**: `_components`ディレクトリの新規作成 --- ディレクトリの新規作成であることを明記（作業内容 項目1, 5に追記）

### 実装レビュー（1回目）

4件の指摘を受け、すべて対応済み。

- **指摘1 (重要)**: ダークモードでアクティブタブのコントラスト比がWCAG AA基準を満たさない --- `:global(:root.dark) .categoryNavTabActive` で `color: #1e293b`（slate-800）を設定し、コントラスト比約5.4:1（WCAG AA充足）を確保
- **指摘2 (中)**: アクティブタブに `aria-current` 属性がない --- `aria-current={isActive ? "true" : undefined}` を追加
- **指摘3 (低)**: ウィンドウリサイズ時にrootMarginが更新されない制約 --- コメントで制約を明記
- **指摘4 (低)**: クリーンアップ時にintersectingSetがクリアされない --- `currentIntersectingSet.clear()` を追加（React hooks/exhaustive-deps対策でローカル変数に代入）

### 実装レビュー（2回目）

1件の指摘を受け、対応済み。

- **指摘1 (低)**: CSSコメントのコントラスト比の記載が不正確（7.0:1→実際は約5.4:1） --- 「コントラスト比約5.4:1（WCAG AA基準を充足）」に修正

### 実装レビュー（3回目）

指摘事項なし。レビュー通過。

## キャリーオーバー

なし

## 補足事項

なし

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
