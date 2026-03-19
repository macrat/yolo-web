---
id: 109
description: B-217 ユーモア辞書への「おもしろかった」評価ボタン実装
started_at: "2026-03-19T21:18:35+0900"
completed_at: "2026-03-19T22:03:18+0900"
---

# サイクル-109

ユーモア辞書（humor dictionary）の各エントリに「おもしろかった」評価ボタンを追加する。ユーザーが気に入ったエントリに反応できるようにし、GA4でコンテンツの人気度を計測可能にする。

## 実施する作業

- [x] B-217: ユーモア辞書への「おもしろかった」評価ボタン実装（EntryRatingButton.tsx新設、rating-storage.ts新設、analytics.tsにtrackContentRating追加、humor辞書ページへの組み込み）

## 作業計画

### 目的

**誰の/何のためにやるのか:**

手軽で面白い占い・診断を楽しみたいユーザーが、ユーモア辞書のエントリを読んで「おもしろい」と感じたとき、その気持ちをワンタップで表現できるようにする。現状はエントリを読んだ後に何のインタラクションもなく、ユーザーの感情が行き場を失っている。

**この作業によってどんな価値を提供するのか:**

- ユーザーにとって: 面白いと思った気持ちを即座に表現でき、コンテンツとの一体感が高まる。登録不要でワンタップという手軽さがターゲットユーザーの嗜好に合致する
- サイト運営として: GA4の `content_rating` イベントで各エントリの人気度を計測でき、今後のコンテンツ改善の判断材料になる

### 作業内容

---

#### タスク1: LocalStorageユーティリティの新設

**変更対象ファイルと変更内容:**

##### 1-1: `src/humor-dict/_lib/rating-storage.ts`（新規作成）

- `src/humor-dict/_lib/` ディレクトリを新規作成する（現在存在しない）
- `isStorageAvailable()` 関数を実装する。既存パターン（各ゲームの `_lib/storage.ts`、例: `src/play/games/nakamawake/_lib/storage.ts` で使われている `isStorageAvailable`）と同じロジックで、`typeof window === "undefined"` チェックと `try/catch` で `localStorage` の利用可否を判定する
- `isRated(slug: string): boolean` 関数をexportする。LocalStorageキー `humor-dictionary-ratings` から値を読み出し、指定slugが評価済みかどうかを返す。ストレージが使用不可の場合やパースエラーの場合は `false` を返す
- `markAsRated(slug: string): void` 関数をexportする。LocalStorageキー `humor-dictionary-ratings` に指定slugを追加する。ストレージが使用不可の場合はサイレントに何もしない
- LocalStorageの値のフォーマット: `string[]`（評価済みslugの配列）をJSON.stringifyして保存する。読み出し時は `JSON.parse` してslugの配列として扱う
- LocalStorageキー名 `humor-dictionary-ratings` は名前付き定数として定義する（RecordPlay.tsxの `humor-dictionary` と整合性のある命名）

##### 1-2: `src/humor-dict/_lib/__tests__/rating-storage.test.ts`（新規作成）

- `isRated`: 未評価のslugに対して `false` を返すこと
- `markAsRated` + `isRated`: 評価後に `true` を返すこと
- `markAsRated`: 同じslugを2回呼んでも重複しないこと
- `isRated`: LocalStorageが使用不可（`typeof window === "undefined"` やエラー時）の場合に `false` を返すこと
- `markAsRated`: LocalStorageが使用不可の場合にエラーを投げないこと
- テストパターンは純粋な関数のユニットテスト。LocalStorageはグローバルのモック/スタブで代替し（`vi.spyOn(Storage.prototype, 'getItem')` 等）、関数を直接呼び出して戻り値を検証する

**完成条件:**

- `isRated` と `markAsRated` が正しく動作すること
- LocalStorage使用不可時にエラーを投げず安全に動作すること
- すべてのユニットテストが通ること

---

#### タスク2: GA送信関数の追加

**変更対象ファイルと変更内容:**

##### 2-1: `src/lib/analytics.ts`（既存ファイルに追記）

- `trackContentRating()` 関数をexportする
- 内部で `sendGaEvent("content_rating")` を呼び出す。パラメータは不要（GA4の `page_path` 自動収集でどのエントリが評価されたか特定できる）
- 関数シグネチャ: `export function trackContentRating(): void`
- JSDocコメントを付与する（既存の `trackShare` 等と同じスタイル）
- `GaContentType` 型の変更は不要（`content_rating` イベントでは `content_type` パラメータを送信しないため）

**完成条件:**

- `trackContentRating` がexportされていること
- `sendGaEvent("content_rating")` を引数なしで呼び出すこと
- 既存の関数に影響を与えないこと

---

#### タスク3: 評価ボタンコンポーネントの新設

**変更対象ファイルと変更内容:**

##### 3-1: `src/humor-dict/_components/EntryRatingButton.tsx`（新規作成）

- `"use client"` ディレクティブを先頭に記述する（クライアントコンポーネント）
- propsインターフェース: `{ slug: string }`
- 状態管理: `useState<boolean>(false)` で `rated` 状態を管理する。初期値は `false`（SSR安全のため未評価状態で開始）
- SSR安全な初期化: `useEffect` で `isRated(slug)` を呼び出し、評価済みならば `rated` を `true` に更新する。これにより、SSR時はボタンが未評価状態でレンダリングされ、クライアントサイドのhydration後にLocalStorageから状態を復元する
- クリックハンドラ: `rated` が `true` の場合は何もしない。`false` の場合は `markAsRated(slug)` でLocalStorageに記録し、`trackContentRating()` でGA4イベントを送信し、`setRated(true)` で楽観的にUIを更新する
- ボタンの表示:
  - 未評価状態: 絵文字とテキスト（例: "おもしろかった"）を表示。クリック可能
  - 評価済み状態: テキストを変更（例: "おもしろかった!"）して押下済みであることを視覚的に示す。クリック不可（`disabled` ではなく、ハンドラ内で早期リターン。`disabled` にすると見た目がグレーアウトして「ありがとう」感が出ない）
- アクセシビリティ: `aria-pressed` 属性で `rated` の状態を表現する。スクリーンリーダーがトグル状態を読み上げられるようにする
- アニメーション: クリック時に絵文字部分にポップアニメーション（scale変化）を適用する。`prefers-reduced-motion: reduce` の場合はアニメーションを無効にする（デフォルトはアニメーションなし、`@media (prefers-reduced-motion: no-preference)` でアニメーションを有効にするパターン）

##### 3-2: `src/humor-dict/_components/EntryRatingButton.module.css`（新規作成）

- ボタンのスタイル: 既存のShareButtons.module.cssのスタイルパターンに合わせる
  - `padding: 0.625rem 1.25rem`
  - `border-radius: 8px`
  - `min-height: 44px` / `min-width: 44px`（タッチターゲット確保）
  - `font-weight: 600`
  - `transition: opacity 0.2s ease`（ShareButtonsと同一）
- 未評価状態のスタイル: 背景色は辞書のアクセントカラーや既存のCSS変数を使用。テキストカラーは白
- 評価済み状態のスタイル: ボタンの見た目を変更して押下済みを示す（例: 背景色を変える、チェックマーク的な表現）。ただしグレーアウトはしない（ポジティブなフィードバック感を保つ）
- ポップアニメーション用のキーフレーム: `@keyframes reaction-pop` を定義。`scale(1)` -> `scale(1.4)` -> `scale(0.9)` -> `scale(1.1)` -> `scale(1)` の弾むような動き
- `@media (prefers-reduced-motion: no-preference)` でのみアニメーションを適用する
- ダークモード対応: `@media (prefers-color-scheme: dark)` と `:global([data-theme="dark"])` の両方でダークモード時の背景色・テキスト色を調整する（ShareButtons.module.cssと同じパターン）
- ボタン全体を中央寄せで配置するラッパースタイル（ShareButtonsの `.wrapper` と同様の `display: flex; justify-content: center` パターン）
- ボタンの上下にマージンを設定して関連語セクションとShareButtonsの間に適切な余白を確保する

##### 3-3: `src/humor-dict/_components/__tests__/EntryRatingButton.test.tsx`（新規作成）

- rating-storage モジュールを vi.mock でモックする
- analytics モジュールを vi.mock でモックする
- 初期表示テスト: ボタンが表示され、`aria-pressed="false"` であること
- クリックテスト: ボタンをクリックしたら `markAsRated` が呼ばれ、`trackContentRating` が呼ばれ、`aria-pressed="true"` に変わること
- 評価済み復元テスト: `isRated` が `true` を返すようモックした場合、`useEffect` 後に `aria-pressed="true"` になること
- 二重クリック防止テスト: 評価済み状態でクリックしても `markAsRated` が追加で呼ばれないこと

**完成条件:**

- ボタンがクリック可能で、クリック後にLocalStorageへの記録とGA4イベント送信が行われること
- 評価済みのエントリではボタンの見た目が変わり、再クリックが無効化されること
- ページ再訪問時にLocalStorageから評価済み状態が復元されること
- `aria-pressed` でアクセシビリティが確保されていること
- アニメーションが `prefers-reduced-motion` を尊重すること
- タッチターゲットが44x44px以上であること
- すべてのテストが通ること

---

#### タスク4: ユーモア辞書ページへの組み込み

**変更対象ファイルと変更内容:**

##### 4-1: `src/app/dictionary/humor/[slug]/page.tsx`（既存ファイルに追記）

- `EntryRatingButton` をimportする: `import EntryRatingButton from "@/humor-dict/_components/EntryRatingButton"`
- 配置位置: `<ShareButtons>` の直前に `<EntryRatingButton slug={entry.slug} />` を追加する。関連語セクションがある場合はその後に、関連語がない場合は用例セクションの後に表示される
- このページはServer Component（`generateStaticParams` で静的生成）であるが、`EntryRatingButton` は `"use client"` ディレクティブを持つClient Componentなので、Server Componentの中にそのまま配置できる（Next.jsの標準的なパターン）
- `slug` はServer Componentで既に取得済みの `entry.slug` をpropsで渡す

**完成条件:**

- `EntryRatingButton` が関連語セクションとShareButtonsの間に表示されること
- ページの静的生成（`generateStaticParams`）に影響を与えないこと
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

---

#### 実施順序

1. **タスク1: LocalStorageユーティリティ**（`rating-storage.ts` + テスト）-- 他のタスクの依存関係の根元。最初に実装してテストを通す
2. **タスク2: GA送信関数**（`analytics.ts` への追記）-- 1行程度の追加で独立性が高い。タスク1と並行可能だが、順序としてはタスク1の後
3. **タスク3: 評価ボタンコンポーネント**（`EntryRatingButton.tsx` + CSS + テスト）-- タスク1, 2に依存する。コンポーネントの実装とスタイリングとテスト
4. **タスク4: ページへの組み込み**（`page.tsx` の修正）-- タスク3が完了した後に実施。import文1行とJSX1行の追加のみ

#### 作業中の注意事項

1. **SSR安全性**: `EntryRatingButton` は `"use client"` を持つが、初回レンダリングはサーバーサイドで行われる。`useState` の初期値を `false`（未評価）に固定し、`useEffect` でクライアントサイドのみLocalStorageから状態を復元する。`useEffect` の外で `window` や `localStorage` に直接アクセスしないこと

2. **LocalStorageキー名の一貫性**: キー名は `humor-dictionary-ratings` とする。RecordPlay.tsxが `humor-dictionary` というコンテンツIDを使用しており、それにサフィックス `-ratings` を付けた命名。異なるキー名を使わないこと

3. **カウンター非表示**: サーバーサイドのカウント集計機能がないため、評価数のカウンターは表示しない。ボタンのみの実装とする

4. **取り消し機能不要**: 「おもしろかった」の1種類のみで誤クリックのリスクが低いため、取り消し機能は実装しない

5. **`disabled` 属性を使わない**: 評価済み状態のボタンは `disabled` にしない。`disabled` にするとブラウザのデフォルトスタイルでグレーアウトされ、「押してくれてありがとう」というポジティブなフィードバック感が損なわれる。代わりにクリックハンドラ内で `rated` をチェックして早期リターンする

6. **静的生成への影響なし**: `page.tsx` は `generateStaticParams` で静的生成されるServer Component。`EntryRatingButton` はClient Componentとしてpropsで `slug` を受け取るだけなので、静的生成のフローに影響しない

7. **既存コンポーネントとの視覚的一貫性**: ボタンのサイズ感・border-radius・font-weight・transitionは `ShareButtons.module.css` のパターンに合わせる。ただし色味は ShareButtons と区別する（ShareButtonsはSNSの各ブランドカラー、評価ボタンはサイトのアクセントカラー系）

8. **`GaContentType` 型は変更しない**: `trackContentRating` は `content_type` パラメータを送信しないため、既存の `GaContentType` 型に `"humor-dictionary"` を追加する必要はない

### 検討した他の選択肢と判断理由

#### 評価済み状態のボタン表現

- **選択肢A (採用): ハンドラ内で早期リターン + スタイル変更** -- ボタンの見た目を変えてポジティブなフィードバック感を保ちつつ、再クリックを防止する。`aria-pressed="true"` でアクセシビリティも確保できる
- **選択肢B: `disabled` 属性を使用** -- ブラウザのデフォルトスタイルでグレーアウトされ、ネガティブな印象を与える。ユーザーが「押してくれてありがとう」ではなく「使えなくなった」と感じる可能性がある。不採用

#### LocalStorageのデータフォーマット

- **選択肢A (採用): JSON配列 (`string[]`)** -- シンプルで十分。slug数が増えても問題ない（辞書エントリ数は有限）
- **選択肢B: カンマ区切り文字列** -- JSON.parseが不要で軽量だが、slugにカンマが含まれる場合のエスケープ処理が必要になりうる。不採用
- **選択肢C: slug毎に個別のキー** -- キーが散乱し管理が煩雑になる。不採用

#### GA4イベントのパラメータ

- **選択肢A (採用): パラメータなし** -- GA4の `page_path` 自動収集により、どのエントリページで発火したか特定できる。カスタムディメンション不要でGA4の設定変更も不要。cycle-107で調査済み
- **選択肢B: `content_id` パラメータを付与** -- カスタムディメンション登録が必要になり、GA4管理画面での設定作業が発生する。`page_path` で代替できるため不要。不採用

### 計画にあたって参考にした情報

- **cycle-107の設計方針**: 2-A（LocalStorageユーティリティ）、2-B（GA送信関数）、2-C（評価ボタンコンポーネント）、2-D（ページへの組み込み方針）、2-E（テスト計画）の5つの設計方針に準拠
- **既存コードの実地調査**:
  - `src/lib/analytics.ts`: `sendGaEvent` が非エクスポートの内部関数であること、外部からはラッパー関数（`trackShare`, `trackContentStart` 等）を通じて使うパターンであることを確認
  - `src/app/dictionary/humor/[slug]/page.tsx`: Server Componentで `generateStaticParams` を使用。現在の構造（Breadcrumb -> TrustLevelBadge -> RecordPlay -> article内に header/sections/ShareButtons/backLink）を確認。配置位置は関連語セクションとShareButtonsの間
  - `src/humor-dict/_components/RecordPlay.tsx`: `"use client"` + `useEffect` + `useRef` で副作用をクライアントサイドのみで実行する既存パターン。LocalStorageアクセスの直接的なパターンとしては各ゲームの `_lib/storage.ts`（例: `src/play/games/nakamawake/_lib/storage.ts`）を参照
  - `src/humor-dict/_components/__tests__/RecordPlay.test.tsx`: vi.mockでモジュールをモック、render後の副作用確認というテストパターン
  - `src/components/common/ShareButtons.module.css`: ボタンのサイズ感・border-radius・font-weight・transition等の既存スタイルパターン
  - `src/humor-dict/_lib/`: 現在存在しないディレクトリ。新規作成が必要
- **UXベストプラクティス**: 絵文字は嬉し泣きの顔、reaction-popアニメーション、`prefers-reduced-motion` 対応、`aria-pressed` でのトグル状態管理

## レビュー結果

### レビュー1回目（v1計画レビュー）

中1件・小2件の指摘を受け、以下を修正:

1. **[中] `isStorageAvailable` の参照元**: 「RecordPlay.tsxで使われているachievementsの `isStorageAvailable`」→「各ゲームの `_lib/storage.ts`（例: `src/play/games/nakamawake/_lib/storage.ts`）で使われている `isStorageAvailable`」に修正
2. **[小] テストパターン記述**: `rating-storage.ts` のテストは「render後の副作用確認」ではなく「純粋な関数のユニットテスト（vi.spyOnでlocalStorageをモック）」に修正
3. **[小] ダークモード対応**: EntryRatingButton.module.cssにダークモード対応（`@media (prefers-color-scheme: dark)` + `:global([data-theme="dark"])`）を追加

### レビュー2回目（v2計画レビュー）

前回3件の修正確認に加え、新たに小2件の指摘:

4. **[小] 配置位置の補足**: 「関連語セクションの後」→「関連語がない場合は用例セクションの後」の補足を追加
5. **[小] 参考情報の記述精度**: RecordPlay.tsxの説明を「LocalStorageアクセスする既存パターン」→「副作用をクライアントサイドのみで実行する既存パターン」に修正し、LocalStorageアクセスのパターンは `nakamawake/_lib/storage.ts` を参照と明記

### レビュー3回目（v3計画レビュー）

前回5件の修正すべてを確認済み。コードベースとの照合を実施し、ファイルパス・関数名・型名・スタイル値・cycle-107設計方針との整合性・SSR安全性・アクセシビリティ・テスト方針のすべてが正確であることを確認。指摘なしで承認。

### レビュー4回目（v1実装レビュー）

全7ファイルのコードを確認。重大1件・中1件・小1件の指摘:

1. **[重大] コントラスト比不足**: ライトモードのamber背景(`#f59e0b`)に白テキストでWCAG AA基準(4.5:1)未達 → テキスト色を `#78350f` に変更
2. **[中] 評価済みhoverのopacity変化**: `.button:hover` が評価済み状態にも適用され混乱を招く → `.button:not(.rated):hover` に変更
3. **[小] eslint-disable理由なし**: `-- Restore rating state from localStorage on mount` を追記

### レビュー5回目（v2実装レビュー）

前回3件の修正を確認。コントラスト比が依然として不足（未評価4.22:1、評価済み2.85:1）。重大1件:

1. **[重大] コントラスト比依然不足**: 背景色をより明るく（未評価`#fbbf24`、評価済み`#fde68a`）、テキスト色をより暗く（`#451a03`）に変更

### レビュー6回目（v3実装レビュー）

前回1件の修正を確認。コントラスト比: 未評価8.97:1、評価済み12.03:1でWCAG AA基準を大幅に上回ることを確認。全体を改めてレビューし、ユーザー価値・計画整合性・技術的正しさ・コード品質すべて問題なし。指摘なしで承認。

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
