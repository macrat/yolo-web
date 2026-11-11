# レビュー: registry の試験の重なりを1つにする（第1回）

対象: 7ebec01a（`src/play/__tests__/registry.test.ts`、9行の削除）

## 判定

**改善指示**

## 見たこと

- `npx vitest run src/play/__tests__` を回した。8ファイル・135件がすべて通った。
- 消した `allPlayContents (ゲーム)` の `contains all expected game slugs` と、残した `allPlayContents (20種)` の `contains all 4 game slugs` は、本文が1字も違わない（`allPlayContents` の slug を並べ、`EXPECTED_GAME_SLUGS` の4本がそれぞれ入っているかを見る）。消した方にしか無い確かめは無い。確かめる中身は減っていない。
- 残した方の置き場所は、`allPlayContents` の数・ゲーム・クイズ・運勢を順に確かめる `describe` の中で、自然である。名前の「all 4 game slugs」も、中身と合っている。
- `EXPECTED_GAME_SLUGS` は、残した試験と `playContentBySlug` の試験がまだ使っている。宙に浮いた定数は無い。

## 指摘

### 1. 同じ形の重なりが、同じファイルにもう1つ残っている（要修正）

`describe("getPlayContentsByCategory (ゲーム)")` の `returns all 4 games for category 'game'`（195〜200行）は、`describe("getPlayContentsByCategory (20種)")` の同じ名前の試験（146〜149行）と、名前も本文もまったく同じである。今回消したものと同じ種類の重なりで、同じ経緯（5cc8be2・ca3e43b のころに別々に足されたもの）で残っている。このタスクは「ファイルの重なりを直す」ためのものなので、ここで一緒に消すこと。195〜200行の `describe` をまるごと消せば、確かめる中身は減らない。

### 2. `describe` の名前に、足したときの経緯が残っている（要修正）

- `quizMetaToPlayContentMeta - shortTitle フィールド (7-10)` の「(7-10)」は、過去のタスクの番号で、いまの読み手には意味が無い。CLAUDE.md の「ツギハギ禁止」に当たる。
- 「(20種)」「(ゲーム)」は、同じ関数の `describe` が2つずつあったのを見分けるために付いた添え字である。指摘1を直すと `allPlayContents`・`getPlayContentsByCategory` の `describe` はそれぞれ1つになるので、添え字は要らなくなる。関数の名前だけにする。「20」の数は試験の本文（`toHaveLength(20)`・`toBe(20)`）が確かめているので、名前から外しても何も失わない。
- あわせて、shortTitle の `describe` は `quizMetaToPlayContentMeta` の試験なので、名前を `quizMetaToPlayContentMeta の shortTitle` のように経緯の無い言い方にする。置き場所を `quizMetaToPlayContentMeta` の `describe` のすぐ後ろへ移すと、ファイルが関数ごとの並びになり、読みやすい（これは任意でよいが、移すなら同じコミットで）。

### 3. 小さなこと（任意）

- 121行のコメント「ゲーム4種 + クイズ15種 + Fortune 1種 = 20種」は、直上の試験名と同じことを言っている。消してもよい。

## 直した後の確かめ

- 直した後に `npx vitest run src/play/__tests__` を回し、件数が1件減って（135→134）すべて通ることを確かめる。
- 直しは builder が行い、もう一度レビューを受ける。そのときは今回の指摘だけでなく、ファイル全体を見直す。

## PM への報告

改善指示です。今回の削除そのものは正しく、確かめる中身も減っていません。ただ、同じファイルに、まったく同じ形の重なり（`getPlayContentsByCategory` の `returns all 4 games for category 'game'`）と、経緯の残る `describe` の名前（「(7-10)」・重なりを見分けるための「(20種)」「(ゲーム)」）が残っています。builder に直させ、ファイル全体の見直しを含めて、もう一度レビューを依頼してください。
