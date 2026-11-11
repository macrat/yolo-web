# レビュー（3回目）: T5-20c 今日のほかのパズルとほかの分類

対象: 9510306a（T5-20c の本体）と、作業ツリーの直し（`git diff -- src/play/games/shared/_components/NextGameBanner.tsx src/play/games/shared/_lib/crossGameProgress.ts src/play/games/types.ts`）。基準は review-t5-20c-2.md の指摘3と、CLAUDE.md のツギハギ禁止。

## 判定: 承認

## 前回の指摘の確かめ

### 指摘3: 直った

- `NextGameBanner.tsx` の `// デイリーゲームの総数（ランダム出題型ゲームは含まない）` が消え、`const totalCount = ALL_GAMES.length;` だけになった。`ALL_GAMES` の説明（「デイリーゲーム（isDaily が true のゲーム）…」）で何を数えているかは足りる。
- `src/play/games` の中で「ランダム出題」「今日のパズル」「後方互換」「ヨジドル」は0件。

### 指摘1（2回目で確かめ済み）: 変わりなし

- `crossGameProgress.ts` の `ALL_GAMES`、`types.ts` の `isDaily` の説明は、2回目で確かめたいまの事実どおりの1行のまま。

## T5-20c 全体の見直し

- 9510306a の `NextGameBanner.tsx`・`CrossCategoryBanner.tsx`・2つの `.module.css` のコメントを読み直した。どれもいまの働きを言うだけで、経緯の注記や事実と合わない記述は無い。`EMPTY_STATUSES` の英語のコメントは T5-20c より前からあるもので、なぜ固定の参照が要るかを言う説明なので、このタスクの指摘には当たらない。
- 組み方・言い方・試験は2回目で確かめたとおりで、今回の直しはコメントだけなので見た目は変わらない。撮り直しはしていない。

## 確かめたこと

- `npx vitest run src/play/games/shared`: 8 ファイル・59 件すべて通過。
- `npx tsc --noEmit`: 終了コード 0。
- 直した3ファイルで prettier・eslint が通る。

## PM への指示

指摘は無い。作業ツリーの3ファイルの直しをコミットしてよい（ほかの担当の書きかけのファイルを一緒にコミットしないよう、パスを指定する）。
