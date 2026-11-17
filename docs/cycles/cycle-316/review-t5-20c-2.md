# レビュー（2回目）: T5-20c 今日のほかのパズルとほかの分類

対象: 9510306a（T5-20c の本体）と、「T5-20c: daily-game comments state current facts only」の直し。直しは、ほかの担当の書きかけのファイルが書式チェックに掛かってまだコミットできていないため、作業ツリーの `git diff -- src/play/games/shared/_lib/crossGameProgress.ts src/play/games/types.ts` を見た。基準は review-t5-20c.md の指摘と、t5-design.md の T5-20c の行・6-a・6-c・10-4、DESIGN.md §4・§5・§7、CLAUDE.md のツギハギ禁止。

## 判定: 改善指示

指摘1・指摘2はどちらも直った。T5-20c 全体を読み直して、指摘1と同じ種類の記述が T5-20c の受け持ちのファイルにもう1か所残っているのを見つけた（下の指摘3）。1行の直しで済む。

## 前回の指摘の確かめ

### 指摘1: 直った

- `crossGameProgress.ts` の `ALL_GAMES` の説明は「デイリーゲーム（isDaily が true のゲーム）。解き終えた画面の今日の進み（NextGameBanner）が数えるのはこれだけ。」になった。「今日のパズル」、いまのレジストリに無いゲーム（ヨジドル）の名前、ランダム出題型の話が消えている。
- `types.ts` の `isDaily` の説明は「デイリーゲームかどうか。true のゲームが、解き終えた画面の今日の進み（NextGameBanner）に数えられる。」になった。経緯の注記（「後方互換性のため…」）も消えている。
- どちらもいまの事実どおり（`ALL_GAMES` は `isDaily === true` で絞り、NextGameBanner の `totalCount` はその本数）。`GameInfo` の説明（9行目）は前回のとおり手を付けていない。
- `src/play/games` の中で「今日のパズル」「後方互換」「ヨジドル」は0。「クリア|制覇」は、それが無いことを確かめる試験の1か所だけ。
- prettier・eslint は2つのファイルで通る。

### 指摘2: t5-design.md に入った（55d5f8a0）

- T5-20b の行: 「最初のセクションの中の小見出し（結果のあとの「この結果を共有」など）を、4本とも h2（§4 の小見出しの段）にそろえる」と、いまの分かれ方（kanji-kanaru・irodori は h2、yoji-kimeru の `GameResult.tsx`・nakamawake の `GameContainer.tsx` は h3）が書かれ、完了の条件に「4本の遊び終えた画面で、最初のセクションの中の小見出し（「この結果を共有」を含む）がどれも h2 で、同じ大きさ（見出しの要素と計算値の `font-size` を並べる）」が入った。確かめられる形になっている。
- 10-4 の受け持ち: 各ゲームの `GameContainer.tsx` の行に「nakamawake は → T5-20b」、`GameResult.tsx` の行に「yoji-kimeru の `GameResult.tsx` は → T5-20b」が入った。
- 10-1 の順: 「T5-20d → T5-20b（yoji-kimeru の `GameResult.tsx`）。nakamawake の `GameContainer.tsx` は T5-20a → T5-20b。ほかは並行してよい」。同じファイルを触る2つのタスクが並行しない順になっている。

## 指摘

### 指摘3（builder）: NextGameBanner.tsx に、いまのレジストリに無い種類のゲームを言うコメントが残る

`src/play/games/shared/_components/NextGameBanner.tsx:89`:

```ts
// デイリーゲームの総数（ランダム出題型ゲームは含まない）
const totalCount = ALL_GAMES.length;
```

指摘1の直しで、`types.ts` と `crossGameProgress.ts` からは「ランダム出題型」の話を消した（いまのレジストリの4本はすべて `isDaily: true` で、ランダム出題型のゲームは無い）。ところが、同じ話がこの1行に残り、コードベースの中でランダム出題型を言うのはここだけになった。読む人は、除外されているゲームがどこかにあると受け取る。NextGameBanner.tsx は T5-20c の受け持ちのファイルなので、このタスクで直す。

`ALL_GAMES` の説明がすでに「デイリーゲームだけ」を言っているので、このコメントは消すのがいちばん素直（残すなら「デイリーゲームの本数」だけにする）。前回のレビューでこの行を見落としていた。

## T5-20c 全体の見直し（前回からの変わりが無いことの確かめ）

- 9510306a の6ファイルを読み直した。組み方（h2 の小見出し・`--text-heading-sub`・上の細い線 `--rule-w-hair`／`--rule-2`・進みの行 `--text-small`／`--ink-2`・§7 のボックスの一覧・`aria-labelledby`）、言い方（「今日は4本のうち1本を遊びました」「今日の4本をすべて遊びました」。数えている `lastPlayedDate === 今日` と一致）、文節の区切り、試験（モックせずに端末の記録を通す・負けた回で「クリア」「制覇」が出ない）は、前回確かめたとおりで変わりない。見た目にかかわる変更は今回の直しに無いので、撮り直しはしていない。
- 指摘3のほかに、T5-20c のファイルに経緯の注記や事実と合わないコメントは無い（`CrossCategoryBanner.tsx` の旧い「区画は上の罫線で区切るので…」の注記は 9510306a で消えている）。
- `npx vitest run src/play/games`: 44 ファイル・458 件すべて通過。`npx tsc --noEmit`: エラー0。ビルドはしていない。

## PM への指示

1. 指摘3を builder に直させる（`NextGameBanner.tsx:89` のコメントを消す）。まだコミットしていない指摘1の直しと一緒にコミットしてよい。
2. 直したあと、もう一度レビューを依頼する。そのときは指摘の箇所だけでなく、T5-20c 全体を見直す。
