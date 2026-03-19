---
id: 106
description: B-152 ゲーム関連その他改善（ナカマワケ状態管理・一覧日付固定化）
started_at: "2026-03-19T15:42:16+0900"
completed_at: null
---

# サイクル-106

B-165（サイト全面価値向上プロジェクト）フェーズ3-D（既存コンテンツ強化）の残タスクであるB-152に取り組む。ナカマワケのguessHistory永続化不足・履歴型乖離・SSR/CSR不整合の修正、およびgames一覧の日付固定化を実施する。

## 実施する作業

- [ ] B-152: ゲーム関連その他改善
  - [ ] ナカマワケguessHistory永続化不足の修正(#11)
  - [ ] ナカマワケ履歴型乖離の修正(#15)
  - [ ] ナカマワケSSR/CSR不整合の修正(#26)
  - [ ] games一覧日付固定化(#29)

## 作業計画

### 目的

ナカマワケゲームおよびgames一覧ページにおいて、ユーザー体験を損なう技術的不具合を修正する。いずれもユーザーが直接的に不便を感じる問題（シェア内容が消える、画面がちらつく、ピックアップが古い）であり、修正によって「遊んだ結果を正しく共有できる」「リロードしても画面が安定表示される」「常に当日のおすすめが表示される」という価値を提供する。

### 作業内容

#### タスク1: ナカマワケguessHistory永続化不足 + 履歴型乖離の統合修正 (#11 + #15)

**誰の/何のためにやるのか:**
ナカマワケをプレイしたユーザーが、ゲーム終了後にシェアボタンを押す際、guessHistory（推測履歴）はGameState内では正しく管理されている（正解時L227-230、不正解時L291-294で配列に追加される）が、localStorageへの永続化が行われていない。そのため、ページをリロードするとguessHistoryが空配列にリセットされ、シェアテキストの絵文字行が空になってしまう。永続化のみが欠けている状態を修正する。

**問題の本質:**

- guessHistoryはGameContainer.tsx内のReact stateとしては正しく蓄積されている
- しかし`saveTodayGame()`呼び出し時（L246-250、L315-319）に`guessHistory`が保存データに含まれていない
- `NakamawakeGameHistory`型（types.ts L39-45）にも`guessHistory`フィールドが定義されていない
- つまり問題は「ゲームロジック」ではなく「永続化層のみ」にある

**提供する価値:**

- リロード後もシェアテキストに正しい絵文字行が表示され、プレイ結果を正確に共有できる
- ゲームの再訪問時に過去のプレイ内容が正しく復元される

**必要な作業:**

1. **型定義の修正** (`src/play/games/nakamawake/_lib/types.ts`)
   - `NakamawakeGameHistory`の各日付エントリに `guessHistory: { words: string[]; correct: boolean }[]` フィールドを追加する
   - フィールドはオプショナル (`guessHistory?:`) にして、既存データとの後方互換性を確保する

2. **ストレージ関数の修正** (`src/play/games/nakamawake/_lib/storage.ts`)
   - `saveTodayGame` の呼び出し元で `guessHistory` を含むデータを渡せるよう、型が自動的に反映されることを確認する
   - `loadTodayGame` の戻り値にも `guessHistory` が含まれることを確認する

3. **GameContainer.tsx の保存処理修正** (`src/play/games/nakamawake/_components/GameContainer.tsx`)
   - 正解時の `saveTodayGame` 呼び出し（L246-250付近）に `guessHistory: newGuessHistory` を追加する
   - 不正解時の `saveTodayGame` 呼び出し（L315-319付近）に `guessHistory: newGuessHistory` を追加する

4. **GameContainer.tsx の復元処理修正** (`src/play/games/nakamawake/_components/GameContainer.tsx`)
   - `loadTodayGame` から復元する際（L92-103付近）、`guessHistory: saved.guessHistory ?? []` として保存データからguessHistoryを復元する（後方互換のため `??[]` フォールバック）

5. **テストの更新** (`src/play/games/nakamawake/_lib/__tests__/storage.test.ts`)
   - `saveTodayGame` のテストデータに `guessHistory` を含める
   - `loadTodayGame` のテストで `guessHistory` が正しく返されることを検証する
   - `guessHistory` が存在しない既存データを読み込んだ場合のフォールバック動作をテストする

6. **シェアテストの確認** (`src/play/games/nakamawake/_lib/__tests__/share.test.ts`)
   - 既存テストが引き続きパスすることを確認（share.ts自体はNakamawakeGameStateを受け取るため変更不要）

**注意点:**

- 既存のlocalStorageに保存済みのデータには `guessHistory` フィールドが存在しない。`guessHistory?:` (オプショナル) にし、読み込み時に `?? []` でフォールバックすることで後方互換性を確保する
- `guessHistory` のデータサイズはゲーム1回あたり最大8エントリ（正解4 + 誤答4）程度であり、localStorageの容量には問題ない
- ゲーム終了時のstats更新ロジック（L253-282、L322-331）で`stats`ステートを直接参照している。`handleCheck`の依存配列に`stats`が含まれている（L333）ため現時点ではstale closureにはならないが、将来的なリファクタリングで依存配列が変更された場合にstale closureのリスクがある。関数型更新（`setStats(prev => ...)`）への変更は今回のスコープ外だが、実装時にこの点を意識すること

**完成条件:**

- ページをリロードしても `guessHistory` が復元され、シェアテキストに正しい絵文字行が表示される
- `guessHistory` フィールドがない既存のlocalStorageデータを読み込んでもエラーにならない
- storage.test.ts と share.test.ts が全てパスする
- ブラウザでの手動確認: ナカマワケをプレイし、途中でリロードしてguessHistoryが復元されることを確認。ゲーム完了後にシェアテキストに絵文字行が正しく表示されることを確認

---

#### タスク2: ナカマワケSSR/CSR不整合の修正 (#26)

**誰の/何のためにやるのか:**
ナカマワケページにアクセスしたユーザーに対して、SSR時とCSR時で異なる初期値が使われることによるハイドレーション不整合（Reactの警告、画面のちらつき）を解消する。安定した初期表示を提供し、ユーザー体験の質を高める。

**提供する価値:**

- ハイドレーション不整合によるReact警告の解消
- ページ読み込み時の画面ちらつきの解消
- 安定した初期表示の実現

**問題の範囲の検証結果:**

コードを検証した結果、`gameState`と`stats`の初期化は既にSSR安全であることを確認した。

- `storage.ts`の`isStorageAvailable()`（L23-33）は`typeof window === "undefined"`の場合に`false`を返す
- そのため`loadTodayGame()`はSSR時に`null`を返し、`loadStats()`はSSR時に`defaultStats()`を返す
- `gameState`の初期化（L76-118）: SSR時は`loadTodayGame()`が`null`を返すため、常にデフォルトの新規ゲーム状態が使われる。CSR時にlocalStorageにデータがなければ同じデフォルト状態が使われる。CSR時にlocalStorageにデータがある場合は異なる値になるが、これは`"use client"`コンポーネントのため`useState`の初期化関数はクライアント側でのみ実行され、SSRとの不整合は発生しない
- `stats`の初期化（L134）: 同様に、SSR時は`loadStats()`が`defaultStats()`を返すため安全

**実際に問題がある箇所は`showHowToPlay`の初期化（L137-149）のみ:**

- `typeof window === "undefined"`チェックでSSR時は`false`を返すが、CSR時にlocalStorageを読んで`true`を返す可能性がある
- この値の違いがハイドレーション不整合を引き起こす

**必要な作業:**

1. **showHowToPlay の初期化修正** (`src/play/games/nakamawake/_components/GameContainer.tsx`)
   - `useState` 内での `typeof window === "undefined"` チェックとlocalStorage読み込みを除去する
   - 初期値は `false` に固定し、`useEffect` 内で初回訪問チェックとlocalStorage書き込みを行う
   - 初回訪問時は`useEffect`内で`setShowHowToPlay(true)`を呼び出してモーダルを表示する

**注意点:**

- `useEffect`での`setShowHowToPlay(true)`は初回レンダリング後に発生するため、モーダル表示が若干遅れるが、モーダルはオーバーレイ表示であるため体験への影響は軽微
- gameStateとstatsの初期化は既にSSR安全であるため変更不要。不要なリファクタリングを避ける

**完成条件:**

- SSR時とCSR時で初期値が一致し、Reactのハイドレーション警告が出ない
- 初回訪問時のHowToPlayモーダル表示が正しく動作する
- `npm run build` がハイドレーション関連の警告なしで成功する
- ブラウザでの手動確認: 初回訪問時（localStorageをクリアした状態）にHowToPlayモーダルが表示されること。2回目以降の訪問では表示されないこと。ブラウザのコンソールにハイドレーション警告が出ないこと

---

#### タスク3: games一覧日付固定化 (#29)

**誰の/何のためにやるのか:**
games一覧ページ（`/play`）を訪れたユーザーに対して、「今日のピックアップ」が常に当日のコンテンツを表示するようにする。現状はISR（24時間キャッシュ）のためサーバー再生成タイミングによっては前日のピックアップが表示される可能性がある。

**提供する価値:**

- 常に正確な「今日のピックアップ」が表示され、日替わりコンテンツとしての信頼性が向上する
- リピーターが毎日異なるコンテンツに出会える体験が確実になる

**検討した代替案:**

- **案A: サーバー側でJST日付を計算する（採用）**
  - `getDayOfYear()`内で`new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })`等を使い、サーバーのタイムゾーンに関わらずJSTベースで正しい日付を計算する
  - メリット: 変更が最小限（`getDayOfYear()`関数の修正のみ）。SSRのまま維持できるためSEOに影響なし。ピックアップコンテンツがSSR時点で確定するため表示のちらつきがない。ISRの再生成時に正しいJST日付が使われる
  - デメリット: ISRのキャッシュ期間中（最大24時間）に日付が変わった場合、再生成されるまで前日のピックアップが残る可能性がある。ただし`revalidate=86400`は「最大24時間」であり、実際にはアクセスがあれば再生成される。日付境界付近の最大ずれは許容範囲
  - 補足: 現在の`getDayOfYear()`はタイムゾーン未指定の`new Date()`を使用しているため、サーバーのシステムタイムゾーン（UTC等）に依存しており、JSTの日付と異なる結果を返す可能性がある。これがそもそもの問題の原因

- **案B: revalidateを短くする（例: 3600秒）**
  - メリット: 変更が最小限。最大1時間のずれで済む
  - デメリット: 日付境界の問題は根本解決されない。タイムゾーンによるずれも残る。再生成頻度が上がりサーバー負荷が増加する
  - 判断: 根本解決にならないため不採用

- **案C: クライアントコンポーネント化（旧計画の案）**
  - メリット: クライアントの現在日付を使うため常に正確
  - デメリット: ピックアップ部分がSSRされなくなるためSEOに若干影響。コンポーネント分離・propsのシリアライズなど変更量が大きい。初回表示時にちらつきが発生する可能性がある
  - 判断: 案Aで十分に解決でき、案Aの方がシンプルかつSSRを維持できるため不採用

**必要な作業:**

1. **`getDayOfYear()`関数のJST対応** (`src/app/play/page.tsx`)
   - 現在の実装はタイムゾーン未指定の`new Date()`を使用しており、サーバーのシステムタイムゾーンに依存している
   - `Intl.DateTimeFormat`または`toLocaleDateString`を使ってJSTベースで年初からの経過日数を計算するよう修正する
   - 関数内のコメントも、JSTで計算していることを明記する

2. **revalidate設定の確認**
   - `revalidate = 86400` のまま維持する。JSTで日付計算するようになれば、ISR再生成時に正しいピックアップが返される

**注意点:**

- ピックアップ以外の一覧コンテンツ（カテゴリ別セクション、まずはここからセクション）には影響しない
- 既存のSSR構造を一切変更しないため、SEOへの影響はゼロ
- ISRキャッシュの有効期間中に日付が変わるケースでは、次のアクセスで再生成がトリガーされるまで最大で古いピックアップが表示される可能性があるが、これは現行の挙動と同等であり、タイムゾーン起因の日付ずれ（最大十数時間）が解消されることが本タスクの主要な改善点

**完成条件:**

- サーバーのタイムゾーンに関わらず、JSTの日付に基づく正しいピックアップコンテンツが表示される
- ページのSEO（メタデータ、カテゴリ一覧のSSR）に影響がない
- `npm run build` が成功する
- ブラウザでの手動確認: `/play`ページにアクセスし、「今日のピックアップ」が表示されること。可能であれば、システム時刻をUTC深夜（JST午前）に設定した状態でも正しいJST日付のピックアップが表示されることを確認

---

### 実施順序

1. **タスク1（guessHistory永続化 + 履歴型乖離）を最初に実施する。** 型定義の変更が他のタスクの基盤となるため。
2. **タスク2（SSR/CSR不整合）を次に実施する。** タスク1と同じファイル（GameContainer.tsx）を変更するため、順番に実施して競合を避ける。タスク2はshowHowToPlayの修正のみであり変更範囲は小さい。
3. **タスク3（games一覧日付固定化）を最後に実施する。** 独立したファイルへの変更であり、タスク1・2との依存関係がない。

### 検討した他の選択肢と判断理由

#### タスク1について

- **選択肢A: guessHistoryを別のlocalStorageキーで管理する** -- 既存のhistoryキーとは別にguessHistory専用のキーを設ける案。データの一貫性管理が複雑になるため不採用。
- **選択肢B (採用): 既存のNakamawakeGameHistoryにguessHistoryフィールドを追加する** -- 最もシンプルで、保存・復元のロジック変更が最小限。オプショナルフィールドで後方互換性も確保できる。

#### タスク2について

- **選択肢A: gameState/statsの初期化もuseEffectに移行する** -- コード検証の結果、`storage.ts`の`isStorageAvailable()`がSSR時に`false`を返すため、`loadTodayGame()`と`loadStats()`は既にSSR安全な値を返す。`"use client"`コンポーネントの`useState`初期化関数はクライアント側でのみ実行されるため、ハイドレーション不整合は発生しない。不要なリファクタリングとなるため不採用。
- **選択肢B (採用): showHowToPlayの初期化のみ修正する** -- 実際にSSR/CSR不整合が発生するのはこの箇所のみ。最小限の変更で問題を解決する。

#### タスク3について

- **案A (採用): サーバー側でJST日付を計算する** -- `getDayOfYear()`をJSTベースに修正するだけで済む。SSR維持でSEO影響なし、ちらつきなし。
- **案B: revalidateを短くする** -- 根本解決にならないため不採用。
- **案C: クライアントコンポーネント化** -- 案Aで十分解決できるため、より複雑な案Cは不採用。

### 計画にあたって参考にした情報

- `GameContainer.tsx` の既存SSR対策パターン: remainingWordsのシャッフルで `useEffect` + `isReady` フラグを使用（L121-132）
- `storage.ts`の`isStorageAvailable()`の実装: SSR時に`typeof window === "undefined"`で`false`を返す（L23-24）。これにより`loadTodayGame()`はSSR時に`null`、`loadStats()`はSSR時に`defaultStats()`を返す
- `NakamawakeGameHistory`型の現在の定義（types.ts L39-45）: `guessHistory`フィールドが未定義
- `getDayOfYear()`の現在の実装（play/page.tsx L83-87）: タイムゾーン未指定の`new Date()`を使用しており、サーバーのシステムタイムゾーンに依存
- Next.js ISR (`revalidate`) の仕様: 指定秒数後の最初のリクエストで再生成がトリガーされるが、その間は古いキャッシュが配信される

## レビュー結果

### レビュー1回目（計画レビュー）

指摘5件を受け、以下の修正を実施:

1. **[重大] タスク1の問題診断の記述を正確化**: guessHistoryがGameState内で正しく管理されていることを明記し、問題の本質が「永続化のみが欠けている」ことを正確に反映した。具体的なコード箇所（正解時L227-230、不正解時L291-294でのguessHistory追加、saveTodayGame呼び出し時L246-250/L315-319でのguessHistory未含有）を記載。
2. **[重大] タスク2のSSR/CSR不整合の範囲を再検証**: `storage.ts`の`isStorageAvailable()`がSSR時に`false`を返すため、`gameState`と`stats`の初期化は既にSSR安全であることを確認。タスク2の手順1（gameState初期化修正）と手順2（stats初期化修正）を削除し、showHowToPlayの修正のみに絞った。
3. **[中] タスク3の代替案を検討**: 案A（サーバー側JST計算）、案B（revalidate短縮）、案C（クライアントコンポーネント化）を比較検討し、最もシンプルで効果的な案A（サーバー側JST計算）を採用。計画を全面的に書き換え。
4. **[中] stale closure問題を注意点に追加**: タスク1の注意点に、stats更新ロジックでのstale closureリスクについて記載。現時点では依存配列に`stats`が含まれているため問題ないが、将来のリファクタリング時に注意が必要である旨を明記。
5. **[小] 手動テスト手順を完成条件に追加**: 各タスクの完成条件にブラウザでの手動確認手順を追加。

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。例えば、「XXXの機能にバグを見つけたが、本サイクルのスコープ外なので次回以降のサイクルで修正する予定。backlog.mdにも記載済み。」など。>

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
