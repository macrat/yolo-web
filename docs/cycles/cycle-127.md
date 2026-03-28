---
id: 127
description: "B-228 FortunePreviewコンポーネントのHydration Error修正"
started_at: "2026-03-28T14:19:26+0900"
completed_at: null
---

# サイクル-127

このサイクルでは、FortunePreviewコンポーネントで発生しているHydration Errorを修正する（B-228）。サーバーレンダリング時のテキスト（「今日の運勢を読み込み中...」）とクライアント側のテキスト（実際の運勢内容）が一致しないことが原因で、Next.jsのHydration Errorが発生している。cycle-126で発見された既存バグ。

## 実施する作業

- [ ] B-228-1: FortunePreview.tsx の Hydration Error 修正
- [ ] B-228-2: DailyFortuneCard.tsx の同一パターン修正
- [ ] B-228-3: テストの更新と全体の動作確認
- [ ] B-228-4: Playwright によるビジュアル確認

## 作業計画

### 目的

全訪問者（「手軽で面白い占い・診断を楽しみたい人」「AIエージェントやオーケストレーションに興味があるエンジニア」の両ターゲット）に対して、トップページ（`/`）および運勢ページ（`/play/daily`）で発生しているHydration Errorを解消する。

Hydration Errorは以下のユーザー体験上の問題を引き起こしている:

- ブラウザコンソールにNext.jsのHydration Mismatchエラーが表示される
- SSRとクライアントの不一致により、画面のちらつき（フラッシュ）が発生する可能性がある
- Next.jsがHydration Error時にクライアントサイド再レンダリングにフォールバックするため、パフォーマンスが低下する

この修正により、SSRとクライアントの初回レンダリングが一致し、スムーズなHydrationが行われるようになる。

### 作業内容

#### サブタスク1: FortunePreview.tsx の修正（B-228-1）

対象ファイル: `/mnt/data/yolo-web/src/app/_components/FortunePreview.tsx`

修正内容:

- `useState(computeFortune)` を `useState<...>(null)` に変更する
- `useEffect` を追加し、マウント後に `setState(computeFortune())` を呼び出す
- `computeFortune` 関数内の `typeof window === "undefined"` ガードは不要になるが、安全のため残してもよい
- 誤解を招くコメント（「ハイドレーション不一致はローディング表示で吸収する」）を正確な説明に修正する

これにより:

- SSR時: `state === null` でローディング表示を出力
- クライアント初回レンダリング（Hydration）: `state === null` でローディング表示を出力（SSRと一致 → Hydration成功）
- マウント後（useEffect実行）: `computeFortune()` の結果で `setState` → 運勢を表示

#### サブタスク2: DailyFortuneCard.tsx の修正（B-228-2）

対象ファイル: `/mnt/data/yolo-web/src/play/fortune/_components/DailyFortuneCard.tsx`

修正内容:

- FortunePreview.tsx と同じパターンで修正する
- `useState(computeInitialFortune)` を `useState<...>(null)` に変更
- `useEffect` で運勢を計算して `setState` する
- `recordPlay` の呼び出しは既存の `useEffect` 内にあるため、state 更新後に正しく動作するか確認する（stateがnullでない場合にのみrecordPlayを呼ぶ既存ロジックはそのまま機能する）

#### サブタスク3: テスト更新と動作確認（B-228-3）

対象ファイル: `/mnt/data/yolo-web/src/app/_components/__tests__/FortunePreview.test.tsx`

修正内容:

- `useEffect` パターンに変更したことで、テスト内でのレンダリング後に運勢が表示されるタイミングが変わる可能性がある
- `render` 後に `waitFor` や `act` を使用して、useEffect実行後の状態をテストする必要があるか確認する（testing-libraryのrenderはデフォルトでactでラップされるため、useEffectも実行される可能性が高いが、確認が必要）
- DailyFortuneCard のテストファイルは存在しないため、新規作成は本サイクルのスコープ外とする（既存バグ修正に集中）
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功することを確認する

#### サブタスク4: Playwright ビジュアル確認（B-228-4）

- トップページ（`/`）の運勢プレビューセクションが正しく表示されることを確認
- `/play/daily` ページの運勢カードが正しく表示されることを確認
- ブラウザコンソールにHydration Errorが出力されていないことを確認

### 影響範囲の調査結果

FortunePreview.tsx と DailyFortuneCard.tsx 以外にも `typeof window === "undefined"` ガード付きの関数を `useState` の lazy initializer として渡す同一パターンがあるか調査し、以下の結果を得た。

#### 同一パターンが存在するファイル

1. **`/mnt/data/yolo-web/src/play/games/yoji-kimeru/_components/GameContainer.tsx`** (138行目)
   - `useState<Difficulty>(loadDifficulty)` で `loadDifficulty` 関数をlazy initializerとして使用
   - `loadDifficulty` は SSR時に `"intermediate"` を返し、クライアント側ではlocalStorageから保存済みの難易度を返す
   - ユーザーが難易度を変更済みの場合、SSRとクライアントで異なる値がstateに設定される

2. **`/mnt/data/yolo-web/src/play/games/kanji-kanaru/_components/GameContainer.tsx`** (136行目)
   - 上記と全く同じパターン（`useState<Difficulty>(loadDifficulty)`）

#### 判断: 本サイクルの修正対象外とする

以下の理由により、GameContainerの `loadDifficulty` パターンは本サイクルの修正対象に含めない:

- **Hydration Errorが実際には発生しない**: 両GameContainerは `useState(true)` で `loading` stateを初期化しており、`loading === true` の間は「読み込み中...」のスピナーのみをレンダリングする（GameHeader等のdifficultyを表示するUIはレンダリングされない）。ReactのHydrationはDOM出力を比較するため、stateの内部値が異なっていてもDOM出力が同一であればHydration Errorは発生しない。
- **loading解除前にdifficultyが参照される箇所がない**: `loading` は API呼び出し（`fetchPuzzle` / `fetchHints`）の完了後に `false` に設定される。この時点では既にクライアント側でマウント済みであり、Hydrationは完了している。
- **修正スコープの明確化**: B-228は実際にHydration Errorが発生しているFortunePreview / DailyFortuneCardの修正を目的としている。潜在的だが実害のないパターンまで含めるとスコープが拡大し、ゲームの動作への意図しない影響リスクが増える。

ただし、このパターンは設計として望ましくない（将来のリファクタリングでloading状態の管理が変わった場合にHydration Errorが顕在化するリスクがある）ため、backlogに予防的修正として追加する。

### 注意事項

1. **useEffectの依存配列**: `useEffect(() => { setState(computeFortune()); }, [])` の依存配列は空配列 `[]` にする。初回マウント時のみ実行すればよい。
2. **ローディング表示のCLS**: 既存のCSSに `min-height` が設定されているため、ローディング状態から運勢表示への切り替え時のCLS（Cumulative Layout Shift）は既に対策済み。
3. **DailyFortuneCard の recordPlay**: `state` が `null` から運勢データに変わった時点で既存の `useEffect` が `recordPlay` を呼ぶ。state初期化用の新しい `useEffect` と recordPlay用の既存 `useEffect` の実行順序に注意する。両方とも同じレンダリングサイクルで処理されるが、state更新は非同期のため、recordPlay用のuseEffectはstate更新後の再レンダリングで発火する。これは既存の動作と同じであり問題ない。
4. **テストの非同期処理**: `useEffect` パターンへの変更により、テストで `findByText`（waitForを内包）を使う必要が生じる可能性がある。testing-libraryの `render` は `act` でラップされるが、`useEffect` 内の `setState` による再レンダリングは追加の `act` が必要な場合がある。

### 完了条件

1. FortunePreview.tsx が `useEffect` + `useState(null)` パターンで実装されている
2. DailyFortuneCard.tsx が同じパターンで実装されている
3. SSR時とクライアント初回レンダリング時に同じ出力（ローディング表示）が生成される
4. マウント後に正しく運勢が表示される
5. `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
6. Playwrightでトップページと運勢ページのビジュアル確認が完了している
7. ブラウザコンソールにHydration Errorが出力されていない

### 検討した他の選択肢と判断理由

1. **`next/dynamic` + `ssr: false`**: コンポーネント全体をSSRから除外する方法。Hydration Errorは解消されるが、SSR時にコンポーネントが一切レンダリングされないため、SEOやFCP（First Contentful Paint）に悪影響がある。ローディング状態のHTMLすらSSRされないため、CLSも悪化する。採用しない。

2. **`suppressHydrationWarning`**: Reactの属性でHydration警告を抑制する方法。根本的な解決ではなく、不一致自体は残るため、パフォーマンス低下（クライアントサイド再レンダリングへのフォールバック）は解消されない。採用しない。

3. **`useEffect` + `useState(null)` パターン（採用）**: SSRとクライアント初回レンダリングの出力を確実に一致させる正攻法。マウント後にuseEffectで状態を更新するため、一瞬ローディング表示が出るが、既存のmin-heightによるCLS対策が効いており、ユーザー体験への影響は最小限。Next.js公式ドキュメントでも推奨されているパターン。

### 計画にあたって参考にした情報

- Next.js公式ドキュメント: Hydration Errorのトラブルシューティング
- React公式ドキュメント: useStateのlazy initializerの挙動（SSR時にも呼び出される）
- 既存コードの調査: FortunePreview.tsx、DailyFortuneCard.tsx、テストファイル
- cycle-126の調査結果（B-228の発見経緯）
- 影響範囲調査: GameContainer.tsx（yoji-kimeru、kanji-kanaru）のloadDifficultyパターン

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- GameContainer（yoji-kimeru、kanji-kanaru）の `loadDifficulty` lazy initializerパターンの予防的修正。現時点ではloading状態によりHydration Errorは発生しないが、将来のリファクタリングで顕在化するリスクがあるため、backlog.mdに追加予定。

## 補足事項

### サイクル選定根拠

GA データ（直近28日間）:

- 合計: ~765 PV、235セッション
- Direct: 129セッション / 344 PV / エンゲージメント率46%
- Organic Search: 74セッション / 259 PV / エンゲージメント率59% / 平均495秒
- Organic Social: 20セッション / 121 PV / エンゲージメント率100% / 平均361秒
- Referral: 9セッション / 40 PV / エンゲージメント率89%

/fortune/dailyは10 PVでサイト内上位8位。B-228はP3のバグ修正であり、Hydration Errorはユーザー体験に直接影響する（画面のちらつきやコンソールエラー）。Queued内のP3項目の中で唯一のバグ修正であるため優先的に対応する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
