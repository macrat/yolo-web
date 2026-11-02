# T5a-7 の二度押しの測りの道具と記録

[t5a-design.md](../../cycle-316/t5a-design.md) 6章 条件7 と [cycle-318/device-triage.md](../../cycle-318/device-triage.md) D5 の二度押しの測りの道具と、走査ごとの記録（`.jsonl`）を置く。手順の文は [t5a-measure.md](../../cycle-316/t5a-measure.md) 0章・5章にあり、道具はその文のとおりに組んである。

## ここに置く理由

この道具と記録は、cycle-320 と次のサイクルの文書（t5a-measure.md の条件7・D5 の表、外れた件の判断、T5a-8 の測り直し）に書く数の出どころで、その数をセッションを越えて確かめ直すためのサイクルの記録である。主の木の `tmp/` はセッションを越えて残らず、別のブランチへの push はこのサイクルの作業ブランチの決まりに当たるので、`docs/cycles/cycle-320/measure/` にコミットする（[index.md](../index.md) の「検討した他の選択肢と判断理由」）。`.claude/rules/doc-directory.md` の「`docs/cycles/` にはサイクルドキュメント以外は保存しない」は、サイクルに属さないもの（計画書・調べものの結果・一般の文書）を置かせないための決まりと読む。ここの道具と記録はサイクルの外では使わないので、サイクルの記録の一部である。

- 道具は ESM の `.mjs` で、`npm run lint` と `npm run format:check` の対象になり、どちらも通す。
- 記録は `.jsonl` にする。Prettier は `.jsonl` の書式を知らず（`prettier --file-info` の `inferredParser` が `null`）、`prettier --check .` はディレクトリを広げるときに飛ばすので、道具が書いたままの1行1回の形が保てる。`.json` は対象になるので使わない。
- 像と生のログは置かない。試しの走りの記録は `tmp/` に置き、ここには置かない。
- 記録の1ファイルの大きさと合計の上限は [plan-t5a7.md](../plan-t5a7.md) 3 にある。

## ファイル

| ファイル      | 役目                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version.mjs` | 測る版を `tmp/measure-builds/<名>` に書き出して本番ビルドし、指紋を書く（`build`）。2つの指紋を比べる（`compare`）                                       |
| `measure.mjs` | 二度押しを測り、1回ごとに記録を1行にして `.jsonl` の末尾に足す（`--op start・answers・last・retry`）                                                     |
| `answers.mjs` | extra を持つ3本（character-fortune・science-thinking・japanese-culture）の結果ごとに、その結果に着く答えの組（問ごとの選択肢の字）を版のソースから求める |
| `imports.mjs` | 診断のページが読み込むファイルをコミットの木から集め、2つのコミットの差と重ねる（t5a-measure.md 0章の「T5a-7 の前の確かめ」）                            |
| `*.jsonl`     | 走査ごとの記録。1行目が版の行、2行目からが回の行                                                                                                         |

どれもリポジトリの根から動かす。`measure.mjs` はリポジトリの `node_modules/playwright` を使い、ブラウザは `/opt/pw-browsers/chromium` を直に指す（`playwright install` はしない。`docs/knowledge/playwright-mcp.md`）。

## 版を作る

| 名      | もとのコミット                             | 中身                                                                                                                                                                                                                             |
| ------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`  | `2db1c7d9b5ac358c76e11ea3176f9bb94ddbdcbe` | 基準の版。T5a の最初のコードのコミット（T5a-3 の 8595a44e）の直前の版で、T5a-2b（da102212）の `character-personality.ts` を含む。t5a-measure.md 0章の「T5a-7 の前の確かめ」で、fff3d31f に da102212 を重ねた版からこの版に替えた |
| `after` | `5ea1ab898337274d7b799f7ba696a47f858cff2b` | 変更後の版。T5a-4 までを取り込んだコミット（plan-t5a7.md 3 の「版を作るコミットは固定する」）                                                                                                                                    |

```sh
node docs/cycles/cycle-320/measure/version.mjs build --label base --commit 2db1c7d9b5ac358c76e11ea3176f9bb94ddbdcbe
node docs/cycles/cycle-320/measure/version.mjs build --label after --commit 5ea1ab898337274d7b799f7ba696a47f858cff2b
```

ファイルを重ねる版は `--overlay <コミット>:<パス>` を足す（例: `--commit fff3d31f --overlay da102212:src/play/quiz/data/character-personality.ts`）。1つのビルドは約2分で、`.next` が約 1.3GB になる。

履歴が浅いクローン（`git rev-parse --is-shallow-repository` が `true`）では、先に `git fetch --unshallow origin main design-rollout` で履歴を深くする。

### 指紋

`tmp/measure-builds/<名>/fingerprint.json` に、もとのコミットと重ねたファイル、ソースの木のハッシュ、Node と npm の版、書き出した場所（`buildPath`）、`.next/static/chunks` のファイルの名前と大きさの一覧を書く。`measure.mjs` は、この指紋を記録の1行目（版の行）に写す。

| 名      | 木のハッシュ                               | Node     | npm    | チャンク |
| ------- | ------------------------------------------ | -------- | ------ | -------- |
| `base`  | `367f5d377ed8c3ae15775ecbcbe6447343daf87a` | v22.23.4 | 10.9.9 | 170      |
| `after` | `1d5cfedfcd6379aad3205266e39b49a08d8646ec` | v22.23.4 | 10.9.9 | 175      |

- **書き出す場所は名で決める**: 書き出した版はリポジトリの下にあるので、Next.js はリポジトリの根の `package-lock.json` を見てそこを Turbopack の根にし（ビルドの記録の「We detected multiple lockfiles」）、チャンクには根からの道（`/ROOT/tmp/measure-builds/<名>/node_modules/…`）が入る。道が違えば、同じコミットでもチャンクの名前（中身のハッシュ）がすべて変わる（`tmp/` の別々の2つの場所で HEAD 5ea1ab89 をビルドすると、175 のチャンクの名前がすべて違った）。同じ場所に書き出し直してビルドすると、チャンクの名前と大きさは 175 とも一致した。そこで `version.mjs` は書き出す場所を `tmp/measure-builds/<名>` に決め、指紋は木のハッシュ・Node と npm の版・場所・チャンクの一覧で組む。
- **GA の release の字**: ビルドの前の `generate:release-id` は、環境の `VERCEL_GIT_COMMIT_SHA` が無ければ `git rev-parse HEAD` を読む。書き出した版は主の木の下にあるので、そのままでは主の木の HEAD を拾い、主の木が進むとチャンクの中身が変わる。`version.mjs` は、もとのコミットとその日付を `VERCEL_GIT_COMMIT_SHA`・`VERCEL_GIT_COMMIT_DATE` で渡す。
- **見出しの Web フォント**: `next/font/google` の Zen Antique はビルドのときに取りに行く。取ったファイルが変われば CSS とメディアのチャンクが変わり、指紋の比べで分かる。
- **確かめ直す**: 続きを測る前に版を作り直し、`node docs/cycles/cycle-320/measure/version.mjs compare <記録の版の行から書き出した指紋> tmp/measure-builds/<名>/fingerprint.json` で比べる。`measure.mjs` も、`--out` の版の行と、渡した版の指紋（木・Node・npm・チャンク）、ブラウザの版、道具の blob のどれかが合わなければ止まる。合わないときの扱いは plan-t5a7.md 3 の「日をまたぐ記録と版」にある。

## サーバー

基準の版はポート 3111、変更後の版はポート 3112 で、版のディレクトリから `next start` を起こす。ほかの作業者のプロセスを巻き込まないよう、自分のグループだけを止める形で起こし、止める（`docs/knowledge/playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」）。

```sh
# 起こす（ログに Ready が出るまで、上限を決めて待つ）
DIR="$PWD/tmp/<自分の作業の名前>/server-after"; mkdir -p "$DIR"
cd tmp/measure-builds/after && PORT=3112 setsid bash -c 'echo $$ > "$0/server.pgid"; exec npx next start' "$DIR" > "$DIR/server.log" 2>&1 < /dev/null &
# 止めて、グループのプロセスが 0 でポートが空いたことを確かめる
kill -- -"$(cat "$DIR/server.pgid")"
ps -eo pgid= | awk -v g="$(cat "$DIR/server.pgid")" '$1 == g' | wc -l
lsof -nP -iTCP:3112 -sTCP:LISTEN
```

## 測る

```sh
node docs/cycles/cycle-320/measure/measure.mjs --base http://localhost:3112 --version tmp/measure-builds/after \
  --op <操作> --out docs/cycles/cycle-320/measure/<記録>.jsonl [絞り込み]
```

| 操作      | 1回                                                                                                   | 省いたときの範囲（条件7）                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `start`   | 開始の画面で「はじめる」を二度押しする                                                                | 15本 × 0・90・150・300・500ms × 6画面 × タッチ・マウス                                                |
| `answers` | 「はじめる」を `element.click()` で押し、全問を最初の行か最後の行で二度押しして解き切る（5-2 の走査） | 15本 × 最初の行・最後の行 × 90・300ms × 6画面 × タッチ・マウス                                        |
| `last`    | 最後の問まで1度ずつ押して進め、最後の答え（知識クイズは最後の「次へ」）を二度押しする（5-3）          | 15本（`--answers` を渡せば extra を持つ3本は全結果）× 0・90・150・300・500ms × 6画面 × タッチ・マウス |
| `retry`   | 結果まで解き、「もう一度挑戦する」の中心を画面の上から決めた高さに送って二度押しする                  | 15本 × 画面の上端 24px から下端 −24px までの 24px 刻み × 90・300ms × 6画面 × タッチ・マウス           |

- 6画面は 375×550・320×550・1280×800・375×800・740×360・375×550 の 200%（`--viewports` では `375x550@200`）。
- D5 は `--offsets 0:-20,0:-10,0:10,0:20,-10:0,10:0` を渡す。ずれを渡すと、省いたときの画面は 375×550・320×550、入力はタッチ、間隔は 90・300ms になる。`retry` は D5 に入らない。
- extra を持つ3本の答えの組は `npx tsx docs/cycles/cycle-320/measure/answers.mjs tmp/measure-builds/after character-fortune science-thinking japanese-culture > tmp/<自分の作業の名前>/answers.jsonl` で作り、`last` に `--answers` で渡す（2つの版で問と配点は同じ。`git diff 2db1c7d9 5ea1ab89 -- src/play/quiz/data src/play/quiz/scoring.ts` が空）。
- 1回を測り終えるたびに1行を足す。`--out` に `final` の行のある回は飛ばすので、止まったら同じコマンドで続きから測れる。測っている途中で道具を書き換えない（版の行の道具の blob が合わなくなり、続きを測れない）。

## 記録の形

1行目（`"type": "version"`）: もとのコミット・重ねたファイル・木のハッシュ・Node と npm の版・書き出した場所・チャンクの一覧・ブラウザの版・道具の blob。

2行目から（`"type": "run"`）: 1回の記録。

- `key`: 回の名（操作・画面・本・入力・間隔・ずれ・行・高さ・結果）。`attempt` は送り直しの何度目か、`final` はその回の数える行か。送り直した行は `resent` に理由（`crossed`: 実際の間隔が 150ms の側を越えた、`detail`: マウスの2打目の `mousedown` の `detail` が 2 でない、`check`: 5-2 の確かめが合わない、`error`）を持ち、上限まで越えたまま数える行は `exhausted` に同じ理由を持つ。
- `presses`: 押しごとの記録。`point`（押した点）・`scrolled`（押す前の来訪者の送り）・`gap`（1打目と2打目の押し下げの実際の間隔）・`crossed`・`first`・`second`（1つ目と2つ目の `click` の落ちた先 `el`、座標 `at`、`detail`、帯の番号 `band`、画面 `phase`、`scrollY`）・`md2`（2打目の `mousedown` の `detail`）・`selection`（マウスの記録の時点の選択）・`popups`（開いたタブの行き先）・`landings`・`frames`。
- `el.g` は落ちた先の組: `link`・`summary`・`button`（第1の組）、`choice`（問の選択肢の `button`）、`pressable`（そのほかの押せるもの）、`text`（押せない字。`row` は答えたあとの行の字）。
- `landings`（変更後の版だけ）: 着地の関数を呼ぶたびの記録。`s0`（基準の送り）・`span`（見せる範囲）・`range`（ページが送れる範囲で打ち切った範囲）・`point`・`underAtS0`（基準の送りで点の真下に来る組）・`clearOfFirst`（範囲の中に、点の真下に第1の組が来ない送りがあったか）・`clearOfBoth`（そのなかに第2の組も来ない送りがあったか）・`chosen`（選んだ着地。着地のあとの最初のフレームの `scrollY` と、関数を呼んだときの `scrollY` の差）。
- `frames`: 画面が替わるたびの、着地のあとの最初のフレーム（`requestAnimationFrame`）の記録。`h1`・`heading`（問の見出し）・`name`（結果の名前）は行の箱の上端・下端・行の数と、画面の上端が横切った行（`cut`）。`boxTop`（結果のボックスの上端）・`start`（「はじめる」の矩形）・`focus`。
- `answers` の回: `check`（1打目で答えた問の数 `firsts`・`x`・`s` と、その和が問の数に等しいか `ok`）・`leave`（2打目で離れたときの押しの番号・離れ方・移った先）・`total`（問の数）。
- `last` の回: `before`（最後の押しの前の1度ずつの押しの数と、来訪者の送りを挟んだ押し）・`resultId`（答えの組で着いた結果）・`inserts`（extra の差し込み。結果のボックスが入ってからの時刻・画面の中の上端・ボックスを上端 8px に置いたときの上端・画面の中に入ったか）。
- `retry` の回: `reached`（中心が決めた高さに着いたか）。

### 着地の関数の記録の取り方

本番のコードに測りの口を足さずに、変更後の版の `reveal.ts` の着地の関数（`chooseLanding`）の引数を、CDP の Debugger の条件付きの止め所で取る。最小化したチャンクでは、この関数は `revealLanding` の中の関数になり、引数の名前も変わるので、`measure.mjs` はチャンクを読み込むたびに `function(<名>){let{plan:…,point:…,avoidFirst:` の形を探し、その本体の頭に、引数を JSON にして `console.debug` に書き `false` を返す条件の止め所を置く（止まらない）。基準の版のチャンクにはこの形が無いので止め所は置かれないが、比べをそろえるため、Debugger はどちらの版でも有効にする。範囲の中に点の真下を外す送りがあったか（`clearOfFirst`・`clearOfBoth`）は、引数の矩形と範囲から、関数と同じ1px 刻みで道具が数える。
