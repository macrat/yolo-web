---
id: 110
description: B-215 yoji-kimeruのサーバーサイドAPI化
started_at: "2026-03-20T01:01:30+0900"
completed_at: "2026-03-20T01:57:42+0900"
---

# サイクル-110

B-193（ゲーム・クイズのサーバーサイドAPI横展開）の一環として、yoji-kimeruのサーバーサイドAPI化を実施する。クライアントバンドルから不要なデータダウンロードを削減し、パフォーマンスを改善する。

## 実施する作業

- [x] B-215: yoji-kimeruのサーバーサイドAPI化（GET /api/yoji-kimeru/puzzle + POST /api/yoji-kimeru/evaluate）

## 作業計画

### 目的

**誰のためにやるのか**: メインターゲットである「手軽で面白い占い・診断を楽しみたい人」に向けて、yoji-kimeru（四字熟語きめる）のページ読み込み速度を改善し、より快適なゲーム体験を提供する。

**どんな価値を提供するのか**:

- クライアントバンドルから yoji-data.json（400件、約25KB gzip）を削除し、初回読み込みサイズを約24KB削減する。これにより、とくにモバイル回線の訪問者のページ表示速度が改善される
- ゲーム中に答え（四字熟語の漢字4文字）がクライアント側に露出しなくなり、ブラウザ開発者ツールでの答え確認を防止できる。ゲームの公正性が向上し、訪問者がより達成感を持ってプレイできるようになる

### 作業内容

作業はkanji-kanaruで確立済みのAPI化パターンに沿って進める。変更対象ファイルの一覧と、タスクの依存関係を踏まえた実施順序を以下に示す。

#### タスク1: 型定義の更新

**対象ファイル**: `src/play/games/yoji-kimeru/_lib/types.ts`

**作業内容**:

- `YojiGameState` の `targetYoji` フィールドを `YojiEntry | null` に変更する（ゲーム中はnull、終了時のみセット）
- API レスポンス用の型を追加する:
  - `PuzzleResponse`: puzzleNumber, reading, category, origin, difficulty を含む（答えのyojiフィールドは含まない）
  - `EvaluateResponse`: feedback（YojiGuessFeedback）, isCorrect, targetYoji（ゲーム終了時のみ）を含む
- `YojiGameHistory` に `feedbacks?: YojiGuessFeedback[]` フィールドを追加する（kanji-kanaru同様、ローカル保存したフィードバックからの復元に使用）

#### タスク2: GET /api/yoji-kimeru/puzzle APIルート作成

**対象ファイル**: `src/app/api/yoji-kimeru/puzzle/route.ts`（新規作成）

**作業内容**:

- クエリパラメータ: `date`（YYYY-MM-DD形式）, `difficulty`（beginner/intermediate/advanced）
- サーバー側で `yoji-data.json` と難易度別スケジュール3ファイルをimportし、`getTodaysPuzzle(yojiData, schedule, difficulty, dateObj)` を呼び出してパズルを解決する。yoji-kimeruの `getTodaysPuzzle()` は内部で `filterByDifficulty()` を呼ぶため、APIルート側で別途 `filterByDifficulty()` を呼ぶ必要はない（kanji-kanaruとはシグネチャが異なる点に注意）
- レスポンスに含めるフィールド: `puzzleNumber`, `reading`, `category`, `origin`, `difficulty`（数値1-3）
- アンチチート: `yoji`（答えの漢字4文字）、`meaning`（意味）、`sourceUrl` をレスポンスに含めない
- バリデーション: date形式チェック、difficulty値チェック。不正な場合は400エラーを返す
- kanji-kanaruのhintsルートと同じ構造（NextResponse.json使用、パラメータバリデーション先行）に従う

#### タスク3: POST /api/yoji-kimeru/evaluate APIルート作成

**対象ファイル**: `src/app/api/yoji-kimeru/evaluate/route.ts`（新規作成）

**作業内容**:

- リクエストボディ: `guess`（4文字の漢字文字列）, `puzzleDate`（YYYY-MM-DD）, `difficulty`（beginner/intermediate/advanced）, `guessNumber`（1-6の整数）
- サーバー側で `getTodaysPuzzle(yojiData, schedule, difficulty, dateObj)` を呼び出して答えを解決し、`evaluateGuess(guess, target)` でフィードバックを計算する
- ゲーム中（正解でなく最終ターンでもない場合）: `feedback` と `isCorrect: false` のみを返す
- ゲーム終了時（正解 or guessNumber >= MAX_GUESSES）: `feedback`, `isCorrect`, `targetYoji`（yoji, reading, meaning, category, origin, difficulty, sourceUrl を含むYojiEntry情報）を返す
- バリデーション: guess が `isValidYojiInput()` を通るか、puzzleDate形式、difficulty値、guessNumber範囲。不正な場合は400エラー
- kanji-kanaruのevaluateルートと同じ構造に従う

#### タスク4: APIルートのテスト作成

**対象ファイル**:

- `src/app/api/yoji-kimeru/puzzle/__tests__/route.test.ts`（新規作成）
- `src/app/api/yoji-kimeru/evaluate/__tests__/route.test.ts`（新規作成）

**作業内容**:

- kanji-kanaruのAPIテストと同じパターンで作成する（vitest + `new Request()` でルートハンドラ関数を直接呼び出し）
- puzzleテスト: 正常系、答え非公開の確認、date/difficulty バリデーション400、全難易度対応、同一パラメータの一貫性、異なる日付で異なるパズル
- evaluateテスト: 正常系（不正解時feedback+targetYoji未返却）、最終ターン時targetYoji返却、正解時targetYoji返却、ゲーム中targetYoji非返却（アンチチート）、各種バリデーション400（空文字列、4文字未満/超過、非漢字、不正difficulty、不正date、guessNumber範囲外、不正JSON）、全難易度対応

#### タスク5: GameContainer.tsxのAPI化改修

**対象ファイル**: `src/play/games/yoji-kimeru/_components/GameContainer.tsx`

**作業内容**:

- `yoji-data.json` のstatic importを削除する
- `loadSchedule()` 関数を削除する（スケジュール読み込みはサーバー側に移動済み）
- モジュールスコープに `fetchPuzzle()` と `fetchEvaluate()` 関数を追加する（kanji-kanaruの `fetchHints()` / `fetchEvaluate()` と同じパターン）
- state管理の変更:
  - `error` state を追加する（初期化エラー表示用）
  - `submitting` state を追加する（推測API呼び出し中の入力無効化用）
  - `puzzleData` state を追加する（APIから取得したヒント情報: reading, category, origin, difficulty を保持）
  - `gameState.targetYoji` の初期値を `null` に変更する（ゲーム中は答えを保持しない）
- `initializeGame()` の改修:
  - `fetchPuzzle()` を呼び出してパズル情報を取得する
  - localStorageからの復元処理を変更: 保存済みのfeedbacksがあればそのまま使用、ゲーム終了状態なら `fetchEvaluate()` で最終推測を再送信して答えを再取得する（kanji-kanaruと同じパターン）
  - try-catch でエラーハンドリングし、`error` state にセットする
- `handleGuess()` の改修:
  - 同期関数 `(input: string): string | null` から非同期関数 `async (input: string): Promise<string | null>` に変更する
  - クライアント側で軽量バリデーション（`isValidYojiInput()`, 重複チェック）を実施してから `fetchEvaluate()` を呼び出す
  - APIエラー時はエラーメッセージを返す（try-catch）
  - `submitting` state を操作して二重送信を防止する
  - ゲーム終了時のみAPIレスポンスから `targetYoji` を取得して `gameState` にセットする
- localStorage保存処理の変更: playing/won/lost全ての状態で `feedbacks` を含めて保存する（再訪問時にAPIを呼ばずにフィードバックを復元するため）。kanji-kanaruと同じく、ステータスに関わらず一つの保存パスでfeedbacksを含めて保存する形に統合する
- ローディングUI: 既存のローディング表示はそのまま活用する
- エラーUI: エラー状態の表示と再試行ボタンを追加する（kanji-kanaruの `styles.error` / `styles.retryButton` パターンに従う）

#### タスク6: GuessInput.tsxの非同期対応

**対象ファイル**: `src/play/games/yoji-kimeru/_components/GuessInput.tsx`

**作業内容**:

- `onSubmit` propsの型を `(input: string) => string | null` から `(input: string) => Promise<string | null>` に変更する
- `handleSubmit` 内で `await onSubmit(trimmed)` を呼び出すように変更する
- `submitting` propsを追加し、送信中はボタンとインプットを無効化する（kanji-kanaruの `GuessInput` と同じパターン）

#### タスク7: ResultModal / HintBar の targetYoji null対応

**対象ファイル**:

- `src/play/games/yoji-kimeru/_components/ResultModal.tsx`
- `src/play/games/yoji-kimeru/_components/HintBar.tsx`

**作業内容**:

- `ResultModal`: `gameState.targetYoji` が `null` の場合は `null` を返す早期リターンガードを追加する（実際にはゲーム終了時に必ず値がセットされるが、型安全のため）。ガード後は `targetYoji` が non-null として扱えるようになるため、既存のプロパティアクセスコードの変更は不要
- `HintBar`: propsをAPIから取得した `puzzleData` から渡す形に変更する。GameContainerから直接 `targetYoji.reading` 等を参照するのではなく、`puzzleData` state の値を参照する

#### タスク8: storage.tsの更新

**対象ファイル**: `src/play/games/yoji-kimeru/_lib/storage.ts`

**作業内容**:

- `YojiGameHistory` の型更新に合わせて、`feedbacks` を含むデータの保存・復元をサポートする
- `loadTodayGame()` の実行順序: まずfeedbacksの有無をチェックし、feedbacksがない古いデータはnullを返す（API化以前の保存データなので再初期化が必要）。feedbacksがある場合のみ、既存のlost->playing移行ロジック（`status === "lost" && guessCount < MAX_GUESSES` → statusを"playing"に補正）を適用する

#### タスク9: 既存テストの更新

**対象ファイル**:

- `src/play/games/yoji-kimeru/_lib/__tests__/engine.test.ts` — 変更なし（engine.tsの関数シグネチャは変わらない）
- `src/play/games/yoji-kimeru/_lib/__tests__/daily.test.ts` — 変更なし（daily.tsの関数シグネチャは変わらない）
- `src/play/games/yoji-kimeru/_components/__tests__/GameBoard.test.tsx` — 変更が必要な場合は更新する
- `src/play/games/yoji-kimeru/_lib/__tests__/share.test.ts` — `YojiGameState` の `targetYoji` がnullableになるため、テストデータの型をそのまま `YojiGameState` として扱うと型エラーになる。テストデータではtargetYojiにnon-nullの値を設定し、`as YojiGameState` でキャストして対応する
- `src/play/games/yoji-kimeru/_lib/__tests__/storage.test.ts` — feedbacks対応の保存・復元テストを追加する

#### タスク10: ビルド検証と動作確認

**作業内容**:

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功することを確認する
- ビルド出力でyoji-kimeruのクライアントバンドルからyoji-data.jsonが除去されていることを確認する

### 注意事項

1. **アンチチート設計の徹底**: puzzle APIはヒント情報のみ返し、答え（yojiフィールド）は決して含めない。evaluate APIはゲーム終了時（正解 or 最終ターン）のみ targetYoji を返す。これはkanji-kanaruと同じ設計原則である

2. **yoji-kimeru固有の考慮点**:
   - kanji-kanaruの推測は1文字だが、yoji-kimeruは4文字の漢字文字列。evaluateのバリデーションでは `isValidYojiInput()` を使う
   - kanji-kanaruではguessが常用漢字セットに含まれるかチェックするが、yoji-kimeruでは任意の漢字4文字の組み合わせを受け付ける（辞書照合は行わない）
   - 3難易度（beginner/intermediate/advanced）はkanji-kanaruと同じ構造なので同じように扱う
   - ヒント情報はreading/category/origin/difficulty で、kanji-kanaruのstrokeCount/onYomiCount/kunYomiCountとは異なる

3. **後方互換性**: 既存プレイヤーのlocalStorageデータとの互換性を維持する。feedbacksを持たない古い保存データは、kanji-kanaruと同じ移行戦略（feedbacksなしの場合はnullを返してゲームを再初期化）で対処する

4. **GuessInputの非同期化**: onSubmitの型変更に伴い、handleSubmitをasyncに変更する必要がある。送信中はawaitの完了を待つため、submitting状態で入力を無効化してUXの混乱を防ぐ

5. **エラーハンドリング**: ネットワークエラー時にユーザーが再試行できるUIを提供する。初期化エラーは専用のエラー画面、推測時のエラーはGuessInputのエラーメッセージとして表示する

6. **kanji-kanaruとの一貫性**: APIルートの構造、テストパターン、GameContainerの3ステート分離（loading/submitting/error）、localStorage保存形式のすべてをkanji-kanaruに合わせる。将来の保守性のために一貫性を最優先する

7. **ヒント情報の初回一括返却の判断根拠**: puzzle APIで reading/category/origin/difficulty を初回レスポンスに含める。これらはヒント情報であり答え（yojiフィールド）ではないため、初回に渡しても問題ない。kanji-kanaruのhints APIと同じ設計原則に従う。段階的ヒント表示（guessCount >= 3 で読み先頭文字、>= 4 で出典、>= 5 でカテゴリ）はUI上の演出であり、セキュリティ的な制約ではない

### 完了条件

1. `GET /api/yoji-kimeru/puzzle` が正しいヒント情報を返し、答えを含まないこと
2. `POST /api/yoji-kimeru/evaluate` がフィードバックを正しく計算し、ゲーム中は答えを返さず、ゲーム終了時のみ答えを返すこと
3. `GameContainer.tsx` から `yoji-data.json` のimportが完全に削除されていること
4. ゲームが正常にプレイできること（初期化、推測、勝敗判定、統計更新、シェア機能）
5. 既存プレイヤーのlocalStorageデータとの後方互換性が維持されていること
6. APIルートのテスト（puzzle, evaluate）がすべてパスすること
7. 既存テスト（engine, daily, share, storage, GameBoard）がすべてパスすること
8. `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

### 検討した他の選択肢と判断理由

**Server Component方式（page.tsxで答えを含むデータをpropsで渡す方式）**:
バンドルサイズは削減できるが、RSCペイロードにtargetYoji（答え）が含まれるため、ブラウザ開発者ツールで答えが確認可能になる。yoji-kimeruはWordle型ゲームであり、答えの秘匿がゲーム体験の核心であるため、この方式は不適切と判断した。docs/research/2026-03-19-game-data-download-optimization.md の検討結果と一致する。

### 計画にあたって参考にした情報

- `docs/research/2026-03-19-game-data-download-optimization.md` — B-193の検討結果。yoji-kimeruにAPI化が必要な理由と推奨アプローチ
- `src/app/api/kanji-kanaru/hints/route.ts` — puzzle APIのリファレンス実装
- `src/app/api/kanji-kanaru/evaluate/route.ts` — evaluate APIのリファレンス実装
- `src/play/games/kanji-kanaru/_components/GameContainer.tsx` — API化後のGameContainerのリファレンス実装
- `src/app/api/kanji-kanaru/hints/__tests__/route.test.ts` — APIテストのリファレンス
- `src/app/api/kanji-kanaru/evaluate/__tests__/route.test.ts` — APIテストのリファレンス

## レビュー結果

計画レビュー: 2回（第1回で5件指摘→修正→第2回で承認）
実装レビュー: 2回（第1回で推奨事項1件→修正→第2回で承認）

### 計画レビュー第1回 指摘事項（5件、すべて修正済み）

1. ResultModal.tsx / share.test.ts のnullable化対応の具体化
2. ヒント情報をpuzzle APIで初回に全て返す判断根拠の明示
3. getTodaysPuzzle()のシグネチャの違いが計画に未反映
4. playing状態でもfeedbacksを含めた保存の明示
5. loadTodayGame()での移行ロジック実行順序の明記

### 実装レビュー第1回 推奨事項（1件、修正済み）

1. evaluate APIの返却フィールド選別 — YojiEntryをそのまま返さず、TargetYojiInfoインターフェースで明示的にフィールドを選別（kanji-kanaruのTargetKanjiInfoパターンに合わせる）

## キャリーオーバー

- なし

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
