# cycle-316 の tmp の記録

## 何のための記録か

cycle-316 の文書（`docs/cycles/cycle-316/*.md`）は、事実の記録やレビューの記録として、git に追跡されない `tmp/` の下のファイルを多数参照している。また、T5-6・T5a-2・T5-33 の測りに使った道具（スクリプト）も `tmp/` の外の作業場にしか無かった。このブランチ `cycle-316-records` は、それらを、後のサイクル（T11）が参照を確かめた内容を本文に書き写すまで残すためのものである。サイトのコードとは無関係の、孤立したブランチである。

## 元のパスとの対応

| このブランチのパス              | 元のパス                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `tmp-records/<path>`            | リポジトリの `tmp/<path>`                                                                  |
| `tmp-records/scratchpad/<path>` | `/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/<path>` |

文書の中で `/tmp/claude-0/.../scratchpad/...` と書かれた参照は `tmp-records/scratchpad/...` に、`tmp/...` と書かれた参照は `tmp-records/...` にある。ファイルごとの対応と大きさは `MANIFEST.tsv`（列: このブランチでのパス（`tmp-records/` を含む）・元の絶対パス・バイト数）にある。

## 読み方

このブランチは、読むときだけ取る。

```sh
git fetch origin cycle-316-records
```

1ファイルは `git show origin/cycle-316-records:tmp-records/<パス>` で読む。ディレクトリは、次のようにディレクトリごと書き出す。

```sh
git archive origin/cycle-316-records tmp-records/<ディレクトリ> | tar -x -C <書き出し先>
```

`<書き出し先>/tmp-records/<ディレクトリ>` ができる。`tar` に `--strip-components=<数>` を付けると、頭の `tmp-records/` などを落として置ける。測りの道具は置き場で動くかどうかが決まるので、次の「測りの道具」の置き方に従う。

## 何を含めたか

- 文書が名指すファイル。
- 文書がディレクトリを指す参照は、その中の記録として意味のあるファイル（拡張子が md・json・jsonl・txt・mjs・cjs・ts・tsx・js・py・patch・diff・csv・png・jpg・html・sql・log・sh・css・svg・yml など）。
- 文書の参照が名前の途中で切れているもの（`tmp/cycle-316/r2-`・`tmp/cycle-316/rvt3c2-`・`tmp/cycle-316/review-headings/shot-1280-`）は、その名で始まるファイルをすべて。
- スクラッチパッドの直下を指す参照は、本文がそこにあると名指したファイル（`review-t1a-2.md` の `softnav2.mjs`・`qmix.mjs`・`inl.mjs`・`proxyMix.mjs`・`softnav-h1.png`・`q1page-fast.png`、`review-t1a-4.md` の `rv.mjs`・`inp.mjs`・`inp2.mjs`・`srch.mjs`・`lh.py`・`tm.mjs`・`inp-cc-big.png`）だけ。直下の全体（7.2GB）は含めない。
- リポジトリを写したディレクトリ（`tmp/t1a3/site` など）は、文書が名指すファイル（`site/src/app/fonts-generated.css`・`site/src/components/PageFonts.tsx`・`site/src/components/FontPreload.tsx`）だけ。`node_modules`・`.next*`・`.git` は含めない。
- `tmp/plex/package` は、文書が版と送り幅を確かめた `package.json` と `IBMPlexSans-Regular.woff`・`IBMPlexSans-Bold.woff`、記録の拡張子のファイル。
- T5-6・T5a-2・T5-33 の測りの道具（次の章）。

## 除いたもの

1ファイル 50MB を超えるものは無かった。合計を 500MB 以下にするため、文書が名指していない画像のうち、画像の合計が大きいディレクトリの画像を除いた（画像以外のファイル、文書が名指す画像、測りの道具の画像はすべて含めた）。

| 元のディレクトリ（`tmp/` から）   | 除いた画像の数 | 大きさ |
| --------------------------------- | -------------- | ------ |
| `screenshots/t55a4/`              | 55             | 24.0MB |
| `review-t1-final/`                | 161            | 30.4MB |
| `scratchpad/rv-t520b-m7x3/shots/` | 128            | 62.4MB |
| `screenshots/t55a/before/`        | 115            | 62.6MB |
| `screenshots/t55a/after/`         | 118            | 63.5MB |
| `review-t1-final-2/`              | 324            | 64.6MB |

これらのディレクトリの画像以外のファイル（測りの JSON など）は含めた。

## 文書が参照するのに、写す時点で無かったもの

- `tmp/t1a/` の全体（`all.jsonl`・`analyze.py`・`subset.py`・`full/*.ttf`・`gf/zen/`・`lh/before/`・`varC/loader.js`）
- `tmp/t1a4/`（`site/.next-r4g`・`site/.next-r5h`）、`tmp/t1a6/site/.next-r6c`
- `tmp/lh/`（`before/blog-1.json`・`before/dict-1.json`・`before/play-cp-*`）
- `tmp/design-t529.patch`・`tmp/skill-t529.patch`
- worktree: `tmp/wt-r2`・`tmp/wt-review-t34`・`tmp/wt-rv-t32fix2-a`・`tmp/wt-rv-t4-2`・`tmp/wt-t35-builder`・`tmp/cycle-316/wt-t36b`・`tmp/cycle-316/wt-t36r`・`tmp/cycle-316/rv-t4-4-2-wt`・`tmp/cycle-316/rv-t4-4-3-wt`・`tmp/cycle-316/rv-t4-4-4-wt`
- `tmp/cycle-316/review-t4-11/shots/`・`tmp/cycle-316/rv-t4-7/`・`tmp/cycle-316/rv-t4-7-2/`（`full-after/contrarian-fortune_result_accidentalprophet-375-light.png` を含む）・`tmp/cycle-316/t4-17/compare/`・`tmp/cycle-316/t4-4c/summary.md`・`tmp/cycle-316/t4-5-fix2/`・`tmp/cycle-316/t4-6/after/`（`science-thinking-profile-320-32.png` を含む）・`tmp/cycle-316/t4-6/test.log`・`tmp/cycle-316/t4-7-fix2/`・`tmp/cycle-316/t4-7-fix4/`
- スクラッチパッドの `r5/`

## 測りの道具

T5-6・T5-33 は builder が測りに使った道具、T5a-2 はレビュアーが再測りに使った道具である（T5a-2 の builder の道具は残っていない。下の節）。どれも、コンテナの Chromium（`/opt/pw-browsers/` の下）を `executablePath` で直に指し、`npm ci` 済みのリポジトリの `node_modules/playwright` を使い、測るページを出すサーバーを先に立ててから動かす。どの `node_modules` をどう読むかが道具ごとに違うので、置き場も道具ごとに決まっている。

T5-6 と T5-33 の道具は、`node_modules` と `src/` を持つリポジトリの写しの直下に `m/` として置かないと動かない。写しは、測る版を `git archive <版> | tar -x -C <写し>` で書き出して `npm ci` を済ませたディレクトリにする（リポジトリの作業ツリーの直下に置くと、追跡されない `m/` が増える）。

### T5-6: 結果のページの測り（`scratchpad/t5-6/m/`）

T5-6 の builder が、リポジトリを写した作業場 `scratchpad/t5-6/` の直下に `m/` として置いた道具と結果。`lib.cjs`・`crop.cjs` は `../node_modules/playwright` を、`ids.ts`・`phr.ts`・`cells.ts` は `../src/` を相対で読み、`shots.cjs` は撮ったものを作業場からの相対の `m/shots-<label>/` に書く。このため `m/` を写しの直下に置き、写しの直下から `node m/<道具>` のように動かす。

```sh
git archive origin/cycle-316-records tmp-records/scratchpad/t5-6/m | tar -x -C <写し> --strip-components=3
```

これで `<写し>/m/` になる。サーバーは写しで `next build` と `next start` で立てる。

- `lib.cjs`: `openContext({ width, height, dark, big })` はライト・ダークと、`big: true` で既定の文字サイズ 32px のブラウザを開く。`settle(page)` は見出しの和文と IBM Plex Sans の読み込みを待つ。
- `ids.ts`・`phr.ts`・`cells.ts`: 全診断の結果の id、題とパンくずの区切り、逆張り運勢診断の指標の表のセルの区切りを `src/` から書き出す（出力が `ids.json`・`phr.json`・`cells.json`）。`src/lib/phrase-breaks.ts` は `server-only` を読むので、`NODE_PATH=m/stub npx tsx m/ids.ts > m/ids.json` のように、中身の無い `m/stub/server-only` を読ませて動かす。
- `all.cjs <base> <out.json>`: 全結果ページを 375・320 の既定で開き、パンくずの折れ・誘いのボタンの下端・共有までの距離・横のはみ出しを書き出す（`all-before.json`・`all-after.json`）。`sum.cjs <out.json>` が幅ごとに集計し、`recheck.cjs <out.json>` がパンくずの折れを区切りと照らす。
- `table.cjs <base> <out.json>`: 逆張り運勢診断の指標の表のセルの折れ（`table-before.json`・`table-after.json`）。
- `shots.cjs <base> <label>`: 見本のページ（cp・cf・tc・kanji）を 1280×800・375×667・320×667・320×667 の文字 200%（既定の文字サイズ 32px）× ライト・ダークで撮り、セクションの並びと罫線を `shots-<label>/outline.json` に記録する。
- `probe.cjs`・`outline.cjs`・`pc.cjs`・`ty.cjs`・`solve.cjs`・`crop.cjs`: 1ページの確かめ・切り出しの補助。`pc.cjs`・`ty.cjs`・`solve.cjs` は `http://localhost:3461` を直に書いている。

### T5a-2: 回答の画面の測り（`scratchpad/rev-t5a2/`。レビュアーの道具）

T5a-2 の測り（`t5a-measure.md`）の builder の道具は、このブランチに無い。builder が測り終えて書き出しごと消しており（`t5a-measure.md` 0章）、写す時点で残っていなかった。`t5a-measure.md` 0章の手順の文から組み直すことはできる。

`scratchpad/rev-t5a2/` にあるのは、レビュアーが T5a-2 のレビューで同じ測りを確かめた道具と結果だけである。`t5a-measure.md` 4-4 の近似（問の見出しと選択肢の組みを `<style>` の差し込みで作る）は、レビュアーが 0章の文から組み直したもので、`scan.cjs` の `CSS` にある。

スクリプトは `/home/user/yolo-web/node_modules/playwright` を絶対パスで読み、`phrases.json` と書き出す `scan-*.json` は `__dirname` からの相対なので、ディレクトリはどこに置いてもよい（`/home/user/yolo-web` に `npm ci` が済んでいることが要る）。

```sh
git archive origin/cycle-316-records tmp-records/scratchpad/rev-t5a2 | tar -x -C <書き出し先> --strip-components=2
```

これで `<書き出し先>/rev-t5a2/` になる。サーバーは、レビュアーが測る版を `rev-t5a2/exp/` に書き出し、`next dev --webpack` でポート 3917 に立てたもの（`dev.log`・`dev2.log`）で、`exp/` は測り終えて消されていた。

- `phrases.json`: 全問の見出しと選択肢の区切り（`out`）と、診断ごとの問の数（`counts`）。
- `scan.cjs [slug,...] [320x550,375x550]`: `http://localhost:3917` の各診断を開き、`Math.random` を 0.9999 に固定して全問を順に答え、各問で選択肢が1画面に入るかの余りを測って `scan-<時刻>.json` に書く。`scan2.cjs` は、知識クイズの答えたあとの添えた字・解説・「次へ」の高さも測る版で、環境変数 `R` を付けると `Math.random` を 0 に固定する。`scan-before.cjs` は近似の `<style>` と区切りを差し込まず、いまの組みのまま測る版。
- `lines.cjs`: `scan.cjs` の `CSS` を読み、character-personality の見出しと選択肢の行の折れを書き出す。`fonts.cjs`・`dbg.cjs` は書体の読み込みと1問の確かめ、`shot.cjs` は character-personality の Q1 を 360×740・320×550・1280×800 × ライト・ダークで撮る。
- `dev.log`・`dev2.log`: 測ったときのサーバーの記録。

### T5-33: irodori の読み込みの CLS の測り（`scratchpad/t5-33/m/`）

T5-33 の builder が、リポジトリを写した作業場 `scratchpad/t5-33/` の直下に `m/` として置いた道具と結果。スクリプト（`.mjs`）は `playwright`・`sharp` をパッケージの名前で読み、Node は置き場から上へ `node_modules` を探すので、`m/` を写しの直下に置く。読み書きするファイルは `m/` の中（`import.meta.url` からの相対）である。

```sh
git archive origin/cycle-316-records tmp-records/scratchpad/t5-33/m | tar -x -C <写し> --strip-components=3
```

これで `<写し>/m/` になる。サーバーは写しで `next build` と `next start` で立てる。

- `cls.mjs <port> <games> <scenarios> [runs]`: デイリーゲームを開き、読み込みの CLS とずれの元（layout-shift の sources）を測る。既定は通信を絞った携帯（50KB/s・RTT 400ms・CPU 4倍）で、`NOTHROTTLE=1` で絞らず、`DESKTOP=1` で机上の画面にする。場面は `fresh`（初めて）・`playing`（途中）・`finished`（解き終えて、覚えた高さが無い）・`remembered`（同じ幅で覚えた高さがある）・`estimated`（別の幅で覚えた高さがある）。`seeds.json` はゲームごとの解き終えた状態の `localStorage` の値。
- `before-*.txt`・`after-*.txt`: 変更前と変更後の `cls.mjs` の出力（irodori・ほかのゲーム・全部、絞った携帯と机上の幅 900）。`before-probe.txt` は変更前の絞らない場合の CLS、`emul.txt` はゲーム・幅・文字の大きさごとの出力。
- `shots.mjs <port> <label>`: 読み込み後のページ全体を、初めてと解き終えたで撮る（`shots-before/`・`shots-after/`）。`cmp.mjs` は前後の画像を画素で比べ、違う行の範囲を出す。
- `frame.mjs [回数]`: kanji-kanaru を 375×667・文字 32px で開き、読み込み後のページ全体を回数だけ撮る（`k2-<回>.png`）。`frame2.mjs <label> [game] [runs]` は、読み込みの途中の画面をこまごとに撮る。`sanity.mjs` は、覚えた高さの `<style>` を差し替えたときに irodori の解き終えた状態がどう出るかを確かめる。この3つは `http://localhost:3533` を直に書いている。
- `orig.ts`: 変更前の、記録を戻す前に場所を取っておく仕組みの写し。
