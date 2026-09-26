# Playwright MCP ツールの挙動と安全な使い方

サブエージェント（reviewer / researcher 等）や PM が Playwright MCP（`mcp__playwright__*`）で実機検証するときの落とし穴と安全策。

## 無限待機する JS がエージェントを長時間ハングさせる（最重要）

**事象**: `mcp__playwright__browser_evaluate` に **解決しない Promise を返す関数**を渡したり、`mcp__playwright__browser_wait_for` で**永遠に満たされない条件**を待たせると、その MCP 呼び出しが返らず、エージェントが応答待ちのまま停止する。バックグラウンド/フォアグラウンドを問わず、PM 側は「完了通知が来ない＝作業中」と解釈してしまい、ハングと進行中を区別できない。

- **実例（cycle-227）**: サイクル全体の最終検証 reviewer が Playwright で無限待機する JS を実行してフリーズし、**約2日間**停止していた（Owner が気付いて停止）。完了通知が出ても、その過程が破綻していれば結果は信用できない。
- 同族の先行事例: WebFetch の prompt 要約呼び出しによる調査エージェントのハング（cycle-218）。**ハングの予防はこのファイルが正典**。

**やってはいけない書き方**:

- `browser_evaluate` に `async () => { await new Promise(() => {}) }` のような**永遠に解決しない Promise**を返す関数。
- `browser_evaluate` 内で `while (条件) {}` 等の**busy-wait／無限ループ**。
- 出現しない要素・発生しないイベントに対する `browser_wait_for`（タイムアウト無しの実質無限待ち）。
- `setInterval`/`requestAnimationFrame` で**ポーリングし続ける**関数を `evaluate` で起動して結果を待つ。

**安全な書き方**:

- `browser_evaluate` に渡す関数は**同期、または即座に解決する**ものにする。状態は「その時点のスナップショット」を読んで返す（例: `document.querySelectorAll(...).length` や `getComputedStyle(...)` の値を集めて return）。
- 「変化を待つ」必要があるときは、**待たずに**「操作 → 別の evaluate で結果を読む」の2ステップに分ける。React 制御 input は native setter＋`input` イベント dispatch で同期的に反映され、直後の evaluate で出力を読める（cycle-227 で実証）。
- どうしても待つ場合は**必ず有限のタイムアウト**を設け、満たされなくても返るようにする（`Promise.race` でタイムアウト Promise と競わせる等）。
- ページ遷移の有無を確認したいときは、無限待機ではなく **`window` にマーカーを置き（`window.__marker = ...`）、操作後に同じマーカーが残っているか＋`location.href` が不変か**を読む（フルナビゲーションならマーカーは消える）。cycle-227 の合格条件検証で使用。

## バックグラウンドエージェントは MCP ツールにアクセスできない

CLAUDE.md の規約どおり、Playwright / GA を使うサブエージェントは**必ずフォアグラウンド**で起動する。バックグラウンド起動の sub-agent は MCP に到達できない。

## クラウドのコンテナでは MCP のブラウザが起動しない

claude.ai のクラウドのコンテナでは、Playwright MCP の呼び出しが `Browser "chrome-for-testing" is not installed` で失敗する。入っているのは `/opt/pw-browsers/chromium` の Chromium だけで、コンテナの決まりにより `playwright install` でブラウザを足すこともできない。このときは、リポジトリの `playwright` ライブラリで `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` とするスクリプトを `tmp/` に書き、`node` で動かして操作とスクリーンショットを行う。このスクリプトでも、解決しない Promise や無限の待ちは使わない。文字サイズ 200% は CDP の `Page.setFontSizes` で既定の文字サイズを 32px にして作る（`html { font-size }` を書き足す方法では `rem` のメディアクエリが動かない）。全画面のスクリーンショット（`fullPage: true`）を撮るとこの設定が既定の 16px に戻るので、撮ったあとに測るときは設定し直す。

## WebKit の折り方を Chromium で近似して測る

コンテナには Chromium しか無いので、WebKit（iOS の Safari）で見出しがどこで折れるかは、Chromium で近似して測る。近似が成り立つのは、見出しを WebKit と Chromium の両方で同じに効く機能（`<wbr>`・`word-break: keep-all`・`overflow-wrap: anywhere`）で組み、字の幅を Web フォント（どちらのエンジンにも同じファイル）が決めるときである。Chromium でしか効かない `word-break: auto-phrase` が効いていると、Chromium だけが辞書で折り、WebKit と違う行になる。

1. 測る見出しの字の Web フォントの分割ファイルが読み込まれるのを待つ（`document.fonts.load` に見出しの書体の名前（`"Zen Antique"`）と見出しの字を渡して待ち、`document.fonts.check` が真になってから測る）。見出しの要素とその中の計算値の `word-break` が `keep-all` で、`auto-phrase` が効いていないことを確かめる。
2. 見出しの字を1字ずつ（サロゲートペアの字も1字として、コードポイントごとに）Range で行の位置を取り、行に分ける。次を数える: 文節の中で折れた見出し、語の中で折れた見出し（文節の切れ目でも、文節の中の語の切れ目でもない所で折れた）、1字の文節だけでできた行、行頭に置かない字（閉じ括弧・句読点・！？・…・小書きの仮名・長音符）で始まる行か開き括弧で終わる行（禁則の破れ）、見出しの幅からのはみ出し。行の切れ目を決めるのは `<wbr>` と Web フォントの字の幅なので、これを WebKit の近似とする。
3. `<wbr>` を持たず `word-break: auto-phrase` で折れている見出しは、WebKit では `auto-phrase` が効かず `normal` で折れるので、Chromium でその見出しに `word-break: normal` を当てて近似する。
4. 近似で拾えない差（読み上げ・実機の拡大）は、実機の iOS の Safari で確かめる項目にして残す。

書き方の要点:

- 字の分割ファイルは、ページにその字が出てもすぐには読まれない。`document.fonts.ready` は読み込みが始まっていない字を待たないので、`document.fonts.load` に字を渡して読み込みを始めさせる。待ちは上の「無限待機」の決まりどおり、タイムアウトと競わせる（例 `Promise.race([document.fonts.load('400 24px "Zen Antique"', text), new Promise((r) => setTimeout(r, 5000))])`）。そのあと `document.fonts.check` が偽なら、その見出しは測らずに、測れなかったことを記録する。
- 行に分けるのは、見出しの中のテキストノードを順に辿り、字ごとに `range.setStart(node, i); range.setEnd(node, i + ch.length)` とした `range.getClientRects()` の最初の矩形の `top` を読む。字は `for (const ch of node.data)` でコードポイントごとに取り、UTF-16 の位置 `i` を `ch.length` ずつ足す。`i + 1` で進めると、サロゲートペアの字（「𠮟」など）の半分の矩形を読み、行の切れ目を誤る。`top` が前の字より行の高さの半分以上下がった所が、行の切れ目である。`<wbr>` の要素は字を持たないので、辿るのはテキストノードだけでよい。
- 文節の切れ目は、見出しの中の `<wbr>` の位置で分かる。文節の中の語の切れ目は `Intl.Segmenter("ja", { granularity: "word" })` の切れ目のうち、次の語が漢字・片仮名・開き括弧で始まり、前の語が数字で終わらない所とする。行の切れ目がそのどちらでもなければ、語の中で折れている。
- はみ出しは、見出しの要素の `scrollWidth` が `clientWidth` を超えるか、行の矩形の右端が見出しの右端を超えるかで見る。
- 読み上げの名前は、`locator.ariaSnapshot()` で見出しの名前が元の文と一字も違わないかを見る（`<wbr>` は名前に字を足さない）。
- 「200%」は CDP の `Page.setFontSizes` で既定の文字サイズを 32px にして作る（上の節）。

## 本番ビルドの実機検証の段取り

- `npm run build` → `npm start`（任意のポート、例 `PORT=3127`）で本番ビルドを起動してから検証する。
- サーバーはバックグラウンド起動し、`curl` で各ルートが 200 を返すことを確認してから Playwright を当てる（起動待ちも無限待機にしない）。
- スクリーンショット等の生成物は `tmp/cycle-<n>/` 配下のみに保存する。
- 複数のエージェントが同じ作業ツリーで並行して動くときは、作業ツリーの `.next` をほかのエージェントがビルドし直し、起動中のサーバーが `ChunkLoadError` を出すことがある。確かめるコミットを `git worktree add` で別に取り出し、そこでビルドして起動する。worktree の `node_modules` はシンボリックリンクにすると Turbopack が拒むので、`cp -al` でハードリンクの写しを置く。片付けで止めるサーバーは、起動したときに控えた自分の PID か、`/proc/<pid>/cwd` が自分の worktree を指すものに限る。`pkill -f next-server` はほかのエージェントのサーバーまで止め、その確かめを途中で壊す。

## PM 側の監視

- 通常完了時間を**大きく超過**しても完了通知が来ないフォアグラウンド/バックグラウンドエージェントは、進行中とハングを区別するために状態を確認する（出力ファイルを覗く・必要なら停止して再実行）。「通知が来ない＝作業中」と解釈し続けない。
