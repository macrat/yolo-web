---
id: 108
description: B-214 nakamawake/irodoriのServer Componentデータ選択化
started_at: "2026-03-19T19:41:14+0900"
completed_at: "2026-03-19T20:32:47+0900"
---

# サイクル-108

nakamawake（ナカマワケ）とirodori（いろどり）の2ゲームで、全データをクライアントに送信している現状を改善する。Server Component（page.tsx）で当日データを選択し、GameContainerにpropsで渡す方式に変更することで、不要なデータダウンロードを削減する。

## 実施する作業

- [x] B-214: nakamawakeのServer Componentデータ選択化（GameContainerからstatic importを削除し、page.tsxで当日パズルを選択してpropsで渡す）
- [x] B-214: irodoriのServer Componentデータ選択化（同上の方式をirodoriにも適用）
- [x] ビルド後のバンドルサイズ確認（期待: nakamawake約10KB gzip + irodori約10KB gzip の削減）

## 作業計画

### 目的

**誰の/何のためにやるのか:**

スマホブラウザで手軽にゲームを遊ぶユーザーに対して、ページロード速度を向上させる。現在、nakamawakeでは50パズル全データ（約51KB raw / 約10KB gzip）、irodoriでは250色全データ+スケジュール（約52KB raw / 約10KB gzip）がクライアントに送信されているが、ユーザーが実際に必要なのは当日1パズル分、当日5色分のみである。

**この作業によってどんな価値を提供するのか:**

- ページロード速度の向上（合計約20KB gzip削減の見込み）
- モバイルデータ通信量の節約
- Core Web Vitals（LCP, FCP）の改善によるSEO効果

### 作業内容

---

#### タスク1: nakamawakeのServer Componentデータ選択化

**変更対象ファイルと変更内容:**

##### 1-1: `src/app/play/nakamawake/page.tsx`（Server Component）

- `export const dynamic = "force-dynamic"` を追加し、リクエストごとにServer Componentが実行されるようにする（静的レンダリングではビルド時の日付で固定されてしまうため）
- `@/play/games/nakamawake/data/nakamawake-data.json` と `@/play/games/nakamawake/data/nakamawake-schedule.json` をimportする
- `getTodaysPuzzle` と `formatDateJST` を `_lib/daily.ts` からimportする。`formatDateJST` はpage.tsxで `todayStr` を生成するために必要。GameContainer側にも `formatDateJST` のimportは残す（ストリーク計算用）
- `getTodaysPuzzle(puzzleData, schedule)` を呼び出し、当日の `puzzle` と `puzzleNumber` を取得する
- `formatDateJST(new Date())` を呼び出し、`todayStr` を取得する
- `todayStr` から `dateDisplayString`（日本語表示用日付文字列、例: "2026年3月19日"）を生成する。`new Date(todayStr)` はUTC 00:00:00として解釈されるが、`Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" })` で `timeZone: "Asia/Tokyo"` を指定しているため、UTC+9に変換されて正しい日本語日付になる（例: "2026-03-19" -> UTC 2026-03-19T00:00:00Z -> JST 2026-03-19T09:00:00 -> "2026年3月19日"）。サーバー側で生成することで、日付境界での不整合を防ぐ
- `<GameContainer puzzle={puzzle} puzzleNumber={puzzleNumber} todayStr={todayStr} dateDisplayString={dateDisplayString} />` としてpropsで渡す

##### 1-2: `src/play/games/nakamawake/_components/GameContainer.tsx`（Client Component）

- propsインターフェースを定義する: `{ puzzle: NakamawakePuzzle; puzzleNumber: number; todayStr: string; dateDisplayString: string }`
- `@/play/games/nakamawake/data/nakamawake-data.json` と `@/play/games/nakamawake/data/nakamawake-schedule.json` のimportを削除する
- `getTodaysPuzzle` のimportを削除する（`formatDateJST` はストリーク計算で使うため残す）
- `useMemo` で `getTodaysPuzzle()` を呼び出している箇所を削除し、propsの `puzzle` と `puzzleNumber` を直接使用する
- `useMemo` で `formatDateJST(new Date())` を呼び出して `todayStr` を生成している箇所を削除し、propsの `todayStr` を直接使用する
- `useMemo` で `dateDisplayString` を生成している箇所（`Intl.DateTimeFormat` + `new Date()`）を削除し、propsの `dateDisplayString` を直接使用する
- `gameState` の初期化で `todaysPuzzle.puzzle` / `todaysPuzzle.puzzleNumber` を参照している箇所をpropsの値に置き換える

##### 1-3: テスト対応

- `src/play/games/nakamawake/_components/__tests__/GameContainer.showHowToPlay.test.tsx` は、GameContainer本体ではなくshowHowToPlayのロジックを独立したテストコンポーネントで検証しているため、propsインターフェース変更の影響を受けない。変更不要
- `src/play/games/nakamawake/_lib/__tests__/daily.test.ts` は `getTodaysPuzzle` 関数の単体テストであり、GameContainerとは独立。変更不要
- 新規テストの追加は不要（GameContainerのpropsインターフェース変更は型チェックで検証される）

**完成条件:**

- `GameContainer` が `nakamawake-data.json` と `nakamawake-schedule.json` をimportしていないこと
- `page.tsx` に `export const dynamic = "force-dynamic"` が設定されていること
- `page.tsx` で当日パズルを選択し、propsで渡していること
- `todayStr` と `dateDisplayString` がServer Componentで生成され、propsで渡されていること
- ゲームの動作に変化がないこと（パズル選択、正誤判定、ストリーク計算、localStorage保存/復元がすべて正常）
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

---

#### タスク2: irodoriのServer Componentデータ選択化

**変更対象ファイルと変更内容:**

##### 2-1: `src/app/play/irodori/page.tsx`（Server Component）

- `export const dynamic = "force-dynamic"` を追加し、リクエストごとにServer Componentが実行されるようにする（静的レンダリングではビルド時の日付で固定されてしまうため）
- `@/data/traditional-colors.json` と `@/play/games/irodori/data/irodori-schedule.json` をimportする
- `getTodaysPuzzle` と `formatDateJST` を `_lib/daily.ts` からimportする。`formatDateJST` はpage.tsxで `todayStr` を生成するために必要。GameContainer側にも `formatDateJST` のimportは残す（ストリーク計算用）
- `TraditionalColor` は `@/play/games/irodori/_lib/daily.ts` からimportする（`getTodaysPuzzle` の引数の型として必要。JSONデータを `TraditionalColor[]` にキャストする）
- `getTodaysPuzzle(traditionalColors, schedule)` を呼び出し、当日の `colors`（`IrodoriColor[]` 型）と `puzzleNumber` を取得する。`getTodaysPuzzle` は内部で `TraditionalColor` を `IrodoriColor` に変換するため、戻り値は `{ colors: IrodoriColor[]; puzzleNumber: number }` である
- `formatDateJST(new Date())` を呼び出し、`todayStr` を取得する
- `todayStr` から `dateDisplayString`（日本語表示用日付文字列）を生成する。nakamawakeのpage.tsxと同じ方法で、`new Date(todayStr)` をUTC 00:00:00としてパースし、`Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo" })` でフォーマットする
- `<GameContainer colors={colors} puzzleNumber={puzzleNumber} todayStr={todayStr} dateDisplayString={dateDisplayString} />` としてpropsで渡す

##### 2-2: `src/play/games/irodori/_components/GameContainer.tsx`（Client Component）

- propsインターフェースを定義する: `{ colors: IrodoriColor[]; puzzleNumber: number; todayStr: string; dateDisplayString: string }`。`IrodoriColor` は `@/play/games/irodori/_lib/types` からimportする。`getTodaysPuzzle` の戻り値は `IrodoriColor[]` であり、`TraditionalColor[]` ではない（`TraditionalColor` は `hsl: [number, number, number]` という配列形式で `h`, `s`, `l` を直接持たないため、`TraditionalColor[]` を使うと実行時エラーになる）
- `@/data/traditional-colors.json` と `@/play/games/irodori/data/irodori-schedule.json` のimportを削除する
- `getTodaysPuzzle` のimportを削除する（`formatDateJST` はストリーク計算で使うため残す。`getInitialSliderValues` と `ROUNDS_PER_GAME` はクライアント側に残す）
- `TraditionalColor` のimportを削除する（propsで受け取るのは `IrodoriColor[]` であるため不要になる）
- `useMemo` で `getTodaysPuzzle()` を呼び出している箇所を削除し、propsの `colors` と `puzzleNumber` を直接使用する
- `useMemo` で `formatDateJST(new Date())` を呼び出して `todayStr` を生成している箇所を削除し、propsの `todayStr` を直接使用する
- `useMemo` で `dateDisplayString` を生成している箇所（`Intl.DateTimeFormat` + `new Date()`）を削除し、propsの `dateDisplayString` を直接使用する
- `gameState` の初期化で `todaysPuzzle.colors` / `todaysPuzzle.puzzleNumber` を参照している箇所をpropsの値に置き換える
- `getInitialSliderValues(todayStr, ROUNDS_PER_GAME)` の呼び出しはクライアント側に残す（バンドルサイズへの影響が小さく、答えとも無関係であるため。cycle-107で確認済み）

##### 2-3: テスト対応

- irodoriにはGameContainer本体のテストが存在しないため、テスト変更は不要
- `src/play/games/irodori/_lib/__tests__/daily.test.ts` は `getTodaysPuzzle` 関数の単体テストであり、GameContainerとは独立。変更不要

**完成条件:**

- `GameContainer` が `traditional-colors.json` と `irodori-schedule.json` をimportしていないこと
- `page.tsx` に `export const dynamic = "force-dynamic"` が設定されていること
- `page.tsx` で当日の色を選択し、propsで渡していること
- `todayStr` と `dateDisplayString` がServer Componentで生成され、propsで渡されていること
- ゲームの動作に変化がないこと（色表示、スライダー初期値、スコア計算、ストリーク計算、localStorage保存/復元がすべて正常）
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

---

#### タスク3: ビルドサイズ確認

**手順:**

1. 変更前に `npm run build` を実行し、nakamawakeとirodoriのページのクライアントバンドルサイズを記録する
2. タスク1, 2の変更後に `npm run build` を再度実行し、バンドルサイズを比較する
3. 期待される削減量: nakamawake約10KB gzip + irodori約10KB gzip = 合計約20KB gzip

**完成条件:**

- 変更前後のバンドルサイズ比較結果がサイクルドキュメントの補足事項に記録されていること
- 期待通りの削減（合計約20KB gzip程度）が確認されていること。大幅に異なる場合は原因を調査すること

---

#### 実施順序

1. **変更前のビルドサイズ記録**（タスク3の前半）
2. **nakamawakeの変更**（タスク1）-- 最もシンプルで、パターンを確立する
3. **irodoriの変更**（タスク2）-- nakamawakeで確立したパターンを適用する
4. **変更後のビルドサイズ確認と比較**（タスク3の後半）

#### 作業中の注意事項

1. **Static Rendering回避（force-dynamic）**: Next.jsのpage.tsxはデフォルトで静的レンダリング（ビルド時にHTML生成）される。`getTodaysPuzzle()` や `formatDateJST(new Date())` をpage.tsxで呼び出すだけでは、ビルド時の日付で固定されてしまい、毎日のパズル更新が機能しなくなる。必ず `export const dynamic = "force-dynamic"` をpage.tsxに追加し、リクエストごとにServer Componentが実行されるようにすること

2. **JSTタイムゾーン**: Server Component（page.tsx）で `getTodaysPuzzle()` を呼び出す際、日付はJST基準。`formatDateJST` を使用すること。Next.jsのServer Componentはビルドマシンのタイムゾーンで実行されるが、`formatDateJST` は内部で `timeZone: "Asia/Tokyo"` を指定しているため問題ない

3. **todayStrをpropsで渡す理由**: サーバーとクライアントで `new Date()` の呼び出しタイミングが異なるため、JST日付境界付近でサーバーが選んだパズルとクライアントが計算した `todayStr` が不一致になるリスクがある。サーバーで生成した `todayStr` をpropsで渡すことで、パズル選択とlocalStorage管理の日付が常に一致することを保証する

4. **dateDisplayStringもサーバー側で生成する**: 両GameContainerには `dateDisplayString`（日本語表示用日付文字列、例: "2026年3月19日"）を `useMemo` + `Intl.DateTimeFormat` + `new Date()` で生成している箇所がある。`todayStr` をサーバーから渡すのと同様に、`dateDisplayString` もサーバー側で `todayStr` から生成してpropsで渡す。これにより、表示日付とパズル選択日付が常に一致することを保証する。具体的なパース方法: `new Date(todayStr)` はUTC 00:00:00として解釈される（例: `new Date("2026-03-19")` -> `2026-03-19T00:00:00Z`）。これを `Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" })` でフォーマットすると、UTC+9に変換されて "2026年3月19日" となる。`todayStr` は常にJST基準の日付文字列なので、UTC 00:00:00をJSTに変換しても同日の09:00:00となり、日付がずれることはない

5. **formatDateJSTはクライアント側にも残す**: ストリーク計算（`formatDateJST(yesterday)`）でクライアント側でも使用されるため、`formatDateJST` のimportはGameContainerに残す。ただし `todayStr` 自体の計算はserver propsに移行する。page.tsxでも `todayStr` 生成のために `formatDateJST` をimportする（二重importになるが、それぞれ用途が異なる）

6. **getInitialSliderValuesはクライアント側に残す（irodori）**: バンドルサイズへの影響が小さく（関数コードのみ、データなし）、答えとも無関係であるため、移動する必要がない。cycle-107で確認済み

7. **Next.jsのServer Component props**: Server ComponentからClient Componentへのprops渡しはRSCペイロードでシリアライズされる。`NakamawakePuzzle` と `IrodoriColor[]` はJSONシリアライズ可能なプレーンオブジェクトであるため問題ない

8. **既存テストへの影響**: 両ゲームとも、GameContainer本体のレンダリングテストは存在しない（nakamawakeにはshowHowToPlayの独立テストのみ）。`_lib/__tests__/` のテストはGameContainerに依存しない純粋関数のテストであるため影響を受けない

9. **`TraditionalColor` 型の扱い**: irodoriの `page.tsx` で `getTodaysPuzzle` を呼ぶ際、`traditional-colors.json` を `TraditionalColor[]` にキャストする必要がある。`TraditionalColor` は `@/play/games/irodori/_lib/daily.ts` からimportする。ただし `getTodaysPuzzle` の戻り値は `{ colors: IrodoriColor[]; puzzleNumber: number }` であり、内部で `TraditionalColor` から `IrodoriColor` への変換が行われる。GameContainerのpropsで受け取るのは変換後の `IrodoriColor[]` である

### 検討した他の選択肢と判断理由

#### todayStrの生成場所

- **選択肢A (採用): Server Componentで生成してpropsで渡す** -- パズル選択とlocalStorage管理で使われる日付の一貫性を保証できる。JST日付境界付近でサーバーとクライアントの `new Date()` が異なる値を返すリスクを排除する。propsが1つ増えるが、日付不整合バグの防止という価値がある
- **選択肢B: クライアント側で生成し続ける** -- `formatDateJST` は軽量でバンドルサイズへの影響は小さいが、サーバーが選んだパズルとクライアントが計算した日付が不一致になる可能性がある。特にJST 00:00前後にアクセスしたユーザーで問題が発生しうる。不採用

#### dateDisplayStringの生成場所

- **選択肢A (採用): Server Componentで `todayStr` から生成してpropsで渡す** -- `todayStr` と同じ日付から導出するため、表示日付とパズル選択日付の一貫性が保証される。クライアント側の `useMemo` + `new Date()` による生成を削除でき、日付境界での不整合リスクを排除する
- **選択肢B: クライアント側で生成し続ける** -- `todayStr` はサーバーから渡すのに `dateDisplayString` はクライアントで `new Date()` から生成すると、日付境界付近で表示日付とパズルの日付が不一致になるリスクがある。不採用

#### 改善方法の選択（cycle-107で検討済み）

- **選択肢A (採用): Server Componentでデータ選択+props渡し** -- 最もシンプルで変更量が少ない。`page.tsx`（Server Component）で `getTodaysPuzzle()` を呼び出し、結果をpropsで渡すだけ。nakamawakeのグループ情報はクライアント側の `checkGuess` 関数に必要であり、irodoriの色情報もクライアント側の `colorDifference` 計算に必要。API化しても正誤判定ロジックがクライアントにある限りDevToolsでの答え確認は防げない。したがってAPI化の追加的なユーザー価値はなく、よりシンプルなServer Component方式が最適
- **選択肢B: サーバーサイドAPI化** -- nakamawakeとirodoriではAPI化のメリットが薄い。グループ情報や色情報は答え合わせに必要でクライアントに渡さざるを得ない。過剰な対応となるため不採用

### 計画にあたって参考にした情報

- **cycle-107の検討結果**: `/docs/cycles/cycle-107.md` のセクション1-B（nakamawake）と1-C（irodori）に詳細な改善方法が記載されている。本計画はこの検討結果に基づく
- **検討結果ドキュメント**: `/docs/research/2026-03-19-game-data-download-optimization.md` にバンドルサイズの見込み値と改善方法の選択理由がまとまっている
- **現行コードの実地調査**:
  - nakamawake `GameContainer.tsx`: `puzzleDataJson`（50パズル）と `scheduleJson`（365エントリ）をstatic import。`useMemo` 内で `getTodaysPuzzle()` と `formatDateJST()` を呼び出し。`todayStr` はlocalStorage管理（loadTodayGame, saveTodayGame）とストリーク計算に使用。`dateDisplayString` は `useMemo` + `Intl.DateTimeFormat` + `new Date()` で生成し、`GameHeader` の `dateString` propsに渡している
  - irodori `GameContainer.tsx`: `traditionalColorsJson`（250色）と `scheduleJson`（スケジュール）をstatic import。`useMemo` 内で `getTodaysPuzzle()`, `formatDateJST()`, `getInitialSliderValues()` を呼び出し。`todayStr` はlocalStorage管理とストリーク計算に使用。`dateDisplayString` は nakamawake と同様の方法で生成し、`GameHeader` に渡している
  - 両ゲームの `page.tsx`: 現在は `<GameContainer />` をpropsなしで呼び出し
  - nakamawakeの `GameContainer.showHowToPlay.test.tsx`: GameContainer本体に依存しない独立テスト。propsインターフェース変更の影響なし
  - irodoriにはGameContainer本体のテストなし
  - `_lib/__tests__/` のテスト群はGameContainerとは独立した純粋関数のテスト

## レビュー結果

### レビュー1回目（v1計画レビュー）

重大1件・中2件・小1件の指摘を受け、以下を修正:

1. **[重大] Static Rendering問題**: page.tsxで`new Date()`を呼ぶとビルド時固定される → `export const dynamic = "force-dynamic"` の追加を計画に明記
2. **[中] formatDateJSTの二重import**: page.tsxとGameContainer両方でimportが必要な理由を明記
3. **[中] TraditionalColorのimport元**: `@/play/games/irodori/_lib/daily.ts` を明記
4. **[小] dateDisplayStringの扱い**: サーバー側でtodayStrから生成してpropsで渡す方針を追加

### レビュー2回目（v2計画レビュー）

前回4件の修正を確認済み。新たに重大1件・中1件・小1件の指摘:

1. **[重大] irodoriのpropsの型誤り**: `colors: TraditionalColor[]` → `colors: IrodoriColor[]` に修正（getTodaysPuzzleは内部で変換済みのIrodoriColor[]を返す）
2. **[中] JSONファイルのimportパス**: フルパス（`@/play/games/nakamawake/data/...` 等）を明記
3. **[小] dateDisplayStringパース方法**: `new Date(todayStr)` のUTC解釈とIntl.DateTimeFormatでのJST変換フローを具体例付きで明示

### レビュー3回目（v3計画レビュー）

前回3件の修正を確認済み。ソースコードとの照合を実施し、型の整合性・importパス・削除対象・force-dynamic設定・テスト影響・日付処理の説明のすべてが正確であることを確認。指摘なしで承認。

### レビュー4回目（実装レビュー）

4ファイルすべてのコードを確認。計画に対して正確かつ漏れなく実装されており、技術的にも正しく、不要なコードの残存や意図しない変更もなし。ビルド出力で両ページが `ƒ` (Dynamic) と表示されることを確認。lint/format/test/buildすべて成功。指摘なしで承認。

## キャリーオーバー

なし

## 補足事項

### ビルドサイズ比較結果

変更前後でクライアントバンドルのサイズを比較した結果:

| ゲーム     | 変更前の主要チャンク (raw) | 変更後の主要チャンク (raw) | 削減量 (raw)      |
| ---------- | -------------------------- | -------------------------- | ----------------- |
| nakamawake | 59,770 bytes               | 24,809 bytes               | -34,961 bytes     |
| irodori    | 68,344 bytes               | 30,853 bytes               | -37,491 bytes     |
| **合計**   |                            |                            | **-72,452 bytes** |

gzip換算で合計約20KB以上の削減（計画の期待値: nakamawake約10KB gzip + irodori約10KB gzip = 合計約20KB gzip）。期待通りの結果を確認。

両ページのビルドモードが `○` (Static) から `ƒ` (Dynamic) に変更されたことも確認（`export const dynamic = "force-dynamic"` による想定通りの変化）。

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
