# レビュー: T5-20a ゲームの `new/` の移動（7438ca63）

対象: 7438ca63「T5-20a: move games' new/ components up one level and fix imports」。基準は t5-design.md の T5-20a の行（完了条件「`src/play/games` に `_components/new` が無い。4本の 375px のスクリーンショットが変更の前とピクセルで同じ」）と 10-4 の受け持ち。

## 判定: 承認

## 確かめたこと

### 1. 移動が中身を変えない rename として記録されているか

`git show -M --summary 7438ca63` で、16 ファイルすべてが `rename` として記録されている。

- `src/play/games/_components/{new => }/` の5つ（GameLayout.tsx・.module.css、RelatedGames.tsx・.module.css、`__tests__/GameLayout.test.tsx`）: すべて 100%
- `src/play/games/shared/_components/{new => }/` の11個（CrossCategoryBanner・NextGameBanner・NextPuzzleTime・ReservedResultArea とその CSS・試験）: 10個が 100%、`__tests__/ReservedResultArea.test.tsx` だけ 98%。差は import の1行（`@/play/games/shared/_components/new/ReservedResultArea` → `.../_components/ReservedResultArea`）で、必要な修正。

移した部品の中の相対 import（`./RelatedGames`・`./*.module.css`・試験の `../GameLayout` など）は、同じディレクトリごと上がったので向きは変わらず、そのまま正しい。移したファイルの中に `new`・旧・legacy を指すコメントも無い。

### 2. import の直し

設計の行が挙げた呼び出し側（4本の `page.tsx`、4つの `GameContainer.tsx`、kanji-kanaru と yoji-kimeru の `GameResult.tsx`、試験）がすべて同じコミットで直っている。差分は import の行だけ（21 行の入れ替え）で、ほかの変更は混ざっていない。10-4 の受け持ちの範囲（`src/play/games/_components/*`・`shared/_components/*`・4本の page・各 GameContainer・GameResult の import の行）に収まっている。

### 3. `_components/new` の残り

リポジトリ全体（node_modules・.next・.git・tmp・cycle 文書・ADR・ブログ本文を除く。`docs/*.md`・`docs/knowledge`・`.claude`・Storybook を含む）を `components/new` で grep した。

- `src/play/games` 配下: 0件（完了条件を満たす）
- 残りは `src/app/dictionary/{yoji,kanji,colors}/…/page.tsx` の `@/dictionary/_components/new/DictionaryDetailLayout` の3件と `docs/backlog.md`。辞典の `new/` は T5-9 の受け持ち（10-5 の表の B-567 の行）で、T5-20a の範囲外。
- `tsconfig.tsbuildinfo` にも文字列があるが、git で追跡されていない生成物。

### 4. 試験・型・書式（7438ca63 の detached worktree で実行。共有ツリーではビルドしていない）

共有ツリーには他のタスクの未コミットの変更（`kanji-kanaru`・`yoji-kimeru` の `GuessInput.test.tsx` など）があるため、7438ca63 を scratchpad に worktree として取り出し、node_modules をリンクして実行した（終わったあと worktree は消した）。

- `vitest run src/play/games src/app/play/{kanji-kanaru,yoji-kimeru,nakamawake,irodori}`: 46 ファイル・462 件すべて成功
- `tsc --noEmit`: エラー 0（worktree には生成物の `src/lib/generated/release-id.ts` が無いので、共有ツリーのものを写してから実行。本件と無関係）
- `eslint`（同じ範囲）: 指摘 0
- `prettier --check`（コミットの全ファイル）: 通る

### 5. 見た目が変わらないこと（ビルダーの主張の確認）

`scratchpad/t520a-shots/{before,after}` の 20 組（4ゲーム × 320・320x2・375・375-dark・1280）を `cmp` で全件比べ、20 組すべてバイト単位で同一だった（完了条件の 375px の4本を含む）。before は 17:11〜17:12、after は 17:18〜17:19 に撮られていて、同じファイルの写しではない。`after/kanji-kanaru_375.png` を開いて、パンくず・h1・入力・難易度・FAQ・共有・関連ゲーム・他のジャンル・関連ブログ・フッターまでのページ全体が写っていることを確かめた（空の画面や読み込み中の画面ではない）。

なお、解き終えたあとに出る NextGameBanner・CrossCategoryBanner・NextPuzzleTime はこの 20 組には写らないが、変更は import の行だけで中身は 100% の rename なので、見た目が変わる経路は無い。試験（各バナーの試験と GameContainer の試験）も通っている。

## アンチパターンの確認

- implementation.md: ツギハギ（移したファイルに経緯のコメントや旧パスへの再輸出を残していない。`new/index.ts` のような互換の置き場も作っていない）、残骸の網羅 grep、ほかの変更の混入、いずれも該当なし。
- workflow.md: 設計の行と受け持ちに沿った1コミットで、並行禁止の相手（T5-3c の `GameLayout`、T6-9 の irodori の `GameContainer.tsx`）とも同じファイルを同時に触った跡は無い（7438ca63 の前後のコミットはどちらも別のファイル）。

## B-567・B-775 について（PM への情報。本件の判定には含めない）

- **どちらもまだ閉じられない。** 両方とも辞典の `new/`（`src/dictionary/_components/new/` の DictionaryDetailLayout・PlayRecommendBlock と試験、3本の page からの import）を範囲に含み、それはまだ残っている（T5-9 の受け持ち）。
- **狭められる。** ゲームの2つ（`src/play/games/_components/new/`・`src/play/games/shared/_components/new/`）は本件で片付いたので、残りは辞典の1件だけ。B-567 の「片翼 new/ 3件…約24 import」と B-775 の「games・games/shared・dictionary の `new`」は、いまの状態とずれている。
- **2つは同じ中身の重複。** B-567（cycle-279 起票）と B-775（cycle-316 起票）はどちらも「対になる旧版が消えた `new/` の名を外す」で、範囲も同じ。T5-9 が終わった時点で両方を閉じるか、いま B-775 を B-567 の重複として閉じ、B-567 を「辞典の `new/`（T5-9）」に絞るのがよい。backlog の書き換えは本レビューの範囲外なので行っていない。
