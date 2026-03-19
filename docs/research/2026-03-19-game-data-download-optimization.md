# ゲームデータダウンロード最適化の検討結果

B-193（ゲーム・クイズのサーバーサイドAPI横展開検討）の検討結果をまとめる。

## 対象コンテンツと現状の問題

### 問題ありと判断したコンテンツ

#### 1. yoji-kimeru（四字熟語きめる）

- **問題**: `GameContainer.tsx`（"use client"）が `yoji-data.json`（400件全データ、約130KB raw / 25KB gzip）をstatic import。当日1件のみ必要
- **影響**: 不要なデータ約25KB（gzip概算）がクライアントバンドルに含まれる

#### 2. nakamawake（ナカマワケ）

- **問題**: `GameContainer.tsx`（"use client"）が全パズルデータ+スケジュール（約51KB raw / 約10KB gzip）をstatic import。当日1パズルのみ必要
- **影響**: 不要なデータ約10KB（gzip概算）がクライアントバンドルに含まれる

#### 3. irodori（いろどり）

- **問題**: `GameContainer.tsx`（"use client"）が全色データ+スケジュール（約52KB raw / 約10KB gzip）をstatic import。当日5色のみ必要
- **影響**: 不要なデータ約10KB（gzip概算）がクライアントバンドルに含まれる

#### 4. character-personality クイズ

- **問題**: 相性マトリクスデータ（約121KB）がRSCペイロード経由で送信される可能性。相性機能は結果画面で `ref` クエリパラメータがある場合にのみ使用されるが、データは常に含まれる
- **影響**: 相性機能を使わないユーザー（大多数）にも不要な大容量データが送信される

### 問題なしと判断したコンテンツ

- **kanji-kanaru**: API化済み（626KB → 13KB gzip に削減済み）
- **クイズ全般（character-personality 以外）**: Server Component でアクセスされた1クイズ分のみ RSC 経由で送信
- **yoji-kimeru のスケジュール**: dynamic import で1ファイルのみ遅延ロード済み

## 各コンテンツの改善方法と選択理由

### 1. yoji-kimeru → サーバーサイドAPI化

**改善方法:**

- `GET /api/yoji-kimeru/puzzle`: ゲーム初期化時にパズル情報取得（puzzleNumber, reading, category, origin, difficulty）。difficulty をリクエストパラメータで受け取る
- `POST /api/yoji-kimeru/evaluate`: 推測評価をサーバー側で実行。difficulty はリクエストボディに含める
- `GameContainer.tsx` から `yoji-data.json` のimportを削除し、APIを呼び出す形に変更

**選択理由:**

yoji-kimeru は Wordle 型ゲームであり、答えをクライアントに渡せない。kanji-kanaru と同じ問題構造（全データをクライアントバンドルに含める）を持つため、同じ API 化パターンが最適。

**Server Component 方式が不適切な理由:**

props で答えを渡すとブラウザの開発者ツールで答えが見える。バンドルサイズは削減できるが、ゲーム体験の公正性に問題が残る。

**実装時の注意事項:**

- handleGuess の非同期化（同期関数から async 関数に変更）
- gameState 構造の変更（ゲーム中は答えを保持せず、ゲーム終了時に API レスポンスから取得）
- ローディング状態の追加（API 応答待ち中の入力無効化およびローディングインジケーター）
- エラーハンドリング（ネットワークエラー時の再試行機能およびエラーメッセージ表示）
- yoji-kimeru には beginner, intermediate, advanced の3難易度があり、それぞれ別のスケジュールとデータプールを持つため、difficulty を API パラメータとして扱うこと
- `engine.test.ts`, `daily.test.ts`, `GameBoard.test.tsx` などの既存テストが API 化に伴い影響を受ける場合は適切に更新すること

### 2. nakamawake → Server Component データ選択

**改善方法:**

- `page.tsx` で `getTodaysPuzzle()` を呼び出し、当日パズルデータと `puzzleNumber` を取得する
- `GameContainer` の props に `puzzle: NakamawakePuzzle` と `puzzleNumber: number` を追加する
- `GameContainer` から `nakamawake-data.json` と `nakamawake-schedule.json` のimportを削除する
- `getTodaysPuzzle` と `formatDateJST` のimportを `page.tsx` 側に移動する

**選択理由:**

グループ情報はクライアント側の `checkGuess` 関数に必要。API 化してもブラウザの開発者ツールでの答え確認を防げないため、よりシンプルな Server Component 方式が最適。

**API 化が不適切な理由:**

正誤判定ロジックがクライアントにある限り答え秘匿は不可能。API 化の追加的なユーザー価値がなく、過剰な対応となる。

### 3. irodori → Server Component データ選択

**改善方法:**

nakamawake と同じパターン。`page.tsx` で当日の5色を選択し props で渡す。

- `page.tsx` で `getTodaysPuzzle()` を呼び出し、当日の `colors: IrodoriColor[]` と `puzzleNumber` を取得する
- `GameContainer` の props に `colors` と `puzzleNumber` を追加する
- `GameContainer` から `traditional-colors.json` と `irodori-schedule.json` のimportを削除する

**選択理由:**

色情報はクライアント側の `colorDifference` 計算に必要。nakamawake と同じ理由で API 化より Server Component 方式が適切。

**注意事項:**

`getInitialSliderValues` 関数はバンドルサイズに影響せず、答えとも無関係であるため、クライアント側に残す。

### 4. character-personality → ResultExtraLoader パターン

**改善方法:**

`compatibilityMatrix` を独立モジュールに分離し、`ResultExtraLoader` で遅延ロード。既存5クイズ（music-personality, character-fortune, animal-personality, science-thinking, japanese-culture）のパターンを踏襲する。

**実装前の確認事項:**

ビルド分析（`npm run build` の出力やバンドルアナライザ）で相性データが実際にクライアントに送信されているか確認する。ResultExtraLoader 化はコード構造改善として有効なので、相性データがクライアントに含まれていなくても対応は行う。

## バンドルサイズ比較の見込み値

| コンテンツ            | 現在 (gzip 概算) | 改善後 (gzip 概算) | 削減量 |
| --------------------- | ---------------- | ------------------ | ------ |
| yoji-kimeru           | 25KB             | ~1KB               | ~24KB  |
| nakamawake            | ~10KB            | ~1KB               | ~9KB   |
| irodori               | ~10KB            | ~1KB               | ~9KB   |
| character-personality | 要確認           | 要確認             | 要確認 |

※ gzip 圧縮率はビルド設定に依存するため、正確な数値は実装後のビルド分析で確認すること。

## 実装の推奨順序

1. **nakamawake**（最もシンプル、パターン確立）
2. **irodori**（nakamawake と同じパターン適用）
3. **yoji-kimeru**（API 化、最も変更量が大きい）
4. **character-personality**（独立性が高い）

## 関連バックログ

- B-193: ゲーム・クイズのサーバーサイドAPI横展開検討（本検討の親タスク）
- B-214: nakamawake/irodori の Server Component データ選択化
- B-215: yoji-kimeru のサーバーサイドAPI化
- B-216: character-personality クイズの相性データ ResultExtraLoader 化
