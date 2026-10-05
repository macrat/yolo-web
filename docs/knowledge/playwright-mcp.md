# Playwright MCP ツールの挙動と安全な使い方

サブエージェント（reviewer・researcher など）や PM が Playwright MCP（`mcp__playwright__*`）や、リポジトリの `playwright` ライブラリで書いたスクリプトで実機を確かめるときの落とし穴と安全策。ダークの画面の撮り方、クラウドのコンテナの Chromium で WebKit の折り方を近似して測る方法、ほかのエージェントを巻き込まずにバックグラウンドのプロセスを起こして止める方法、本番ビルドを並行して確かめる段取りも扱う。各項の末尾の「根拠」に、実測・確認・推論の別と、根拠になったサイクルを書く。

## 無限に待つ JS がエージェントを長時間止める（最重要）

**事象**: `mcp__playwright__browser_evaluate` に**解決しない Promise を返す関数**を渡したり、`mcp__playwright__browser_wait_for` で**満たされない条件**を待たせたりすると、その MCP の呼び出しが返らず、エージェントが応答を待ったまま止まる。止まったエージェントは完了の通知を出さないので、通知が来ないことは作業が進んでいる証拠にならない。バックグラウンドでもフォアグラウンドでも同じで、通常の完了時間を大きく超えても通知が来ないときは、進行中かハングかを確かめる必要がある。

同じ形のハングは、WebFetch に prompt で要約させる呼び出しでも起きる。

**やってはいけない書き方**:

- `browser_evaluate` に `async () => { await new Promise(() => {}) }` のような**解決しない Promise**を返す関数。
- `browser_evaluate` の中の `while (条件) {}` などの**busy-wait・無限ループ**。
- 出現しない要素・起きないイベントに対する `browser_wait_for`（タイムアウトの無い、実質の無限の待ち）。
- `setInterval`・`requestAnimationFrame` で**ポーリングし続ける**関数を `evaluate` で起動して結果を待つ。

**安全な書き方**:

- `browser_evaluate` に渡す関数は**同期、またはすぐに解決する**ものにする。状態は「その時点のスナップショット」を読んで返す（例: `document.querySelectorAll(...).length` や `getComputedStyle(...)` の値を集めて return）。
- 「変化を待つ」必要があるときは、**待たずに**「操作 → 別の evaluate で結果を読む」の2段に分ける。React の制御された input は、native setter で値を入れて `input` イベントを dispatch すると同期的に反映され、直後の evaluate で出力を読める。
- どうしても待つときは**必ず有限のタイムアウト**を設け、満たされなくても返るようにする（`Promise.race` でタイムアウトの Promise と競わせるなど）。
- ページ遷移が起きたかを確かめるときは、無限に待つのではなく、**`window` にマーカーを置き（`window.__marker = ...`）、操作のあとに同じマーカーが残っているかと `location.href` が変わっていないか**を読む（フルナビゲーションならマーカーは消える）。

**根拠**: 実測。cycle-227 でサイクル全体の最終確認の reviewer が Playwright で無限に待つ JS を実行して止まり、Owner が気付いて止めるまで約2日かかった。制御された input の2段の読み方とマーカーの確かめ方は、同じサイクルの最終確認で使って動いた。WebFetch の要約でのハングは cycle-218（researcher が約1日止まった）。

## バックグラウンドのエージェントは MCP ツールに届かない

バックグラウンドで起動したサブエージェントは MCP のツールを使えない。Playwright MCP や Google Analytics の MCP を使うサブエージェントは、フォアグラウンドで起動し、フォアグラウンドで動いているかを `ai-agent-communication.md` の「サブエージェントの起動の形」の手順で確かめる（フォアグラウンドを指定してもバックグラウンドで起動したと返ったことがある）。

**根拠**: 実測（cycle-123 で、バックグラウンドで起動したサブエージェントから GA の MCP ツールを使えなかった。Claude Code の公式ドキュメントに、バックグラウンドのサブエージェントでは MCP ツールを使えないと書かれていることも確認した）。

## クラウドのコンテナでは MCP のブラウザが起動しない

claude.ai のクラウドのコンテナでは、Playwright MCP の呼び出しが `Browser "chrome-for-testing" is not installed` で失敗する。`/opt/pw-browsers` に入っているブラウザは Chromium 141（`chromium-1194`。`/opt/pw-browsers/chromium` はその本体 `chromium-1194/chrome-linux/chrome` へのリンク）と、そのヘッドレスの殻（`chromium_headless_shell-1194`）だけで（ほかに `ffmpeg-1011` がある）、リポジトリの `playwright` が求める版は無い。ブラウザは足さない。claude.ai のクラウドのセッションの環境の指示が「Chromium is pre-installed and Playwright is configured to find it … Do not run "playwright install".」と定めているためで、`PLAYWRIGHT_BROWSERS_PATH=<dir> npx playwright install …` で別のディレクトリへ入れる形も同じ決まりに当たる（入れることはできるが、決まりに反するので入れない）。ブラウザを入れる雛形（`npm init playwright`）も同じく使わない。このプロジェクトの作業者は誰も WebKit（iOS の Safari）と Firefox の実機を使えないので、WebKit と Firefox でしか確かめられない差は、`frontend-design` スキルの「見出しとコントロールの名前の折り方を測る」の4と同じく、(i) 端末の振る舞いに頼らない作りにして確かめを要らなくする、(ii) それができなければ、環境の決まりに反しない近似に置き換える（WebKit の折り方は下の「WebKit の折り方を Chromium で近似して測る」）、(iii) どちらもできないときに限り、確かめられない危険として受け入れ、出荷のあとにブラウザ別の GA の数で見張り、見張る数と戻す判断の線を ADR に書く、の順に、どれで確かめるかを決める。Chromium で撮るだけなら、`take-screenshot` スキルの `take.ts` で撮れる（求める版の Chromium が無いときは、入っている Chromium のうち版がいちばん新しいもので起動する。書き出し先は `--out` で自分専用のディレクトリにできる）。操作や測りを伴う確かめは、リポジトリの `playwright` ライブラリで `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` とするスクリプトを自分の専用のディレクトリに書き、`node` で動かす。このスクリプトでも、解決しない Promise や無限の待ちは使わない。

文字サイズ 200% は、ブラウザの既定の文字サイズを 32px にして作る（`html { font-size }` を書き足す方法では `rem` のメディアクエリが動かない）。確かなのは、プロファイルの設定で決める方法で、`chromium.launchPersistentContext` に渡すユーザーのディレクトリの `Default/Preferences` に `{"webkit":{"webprefs":{"default_font_size":32}}}` を書いてから起動する。CDP の `Page.setFontSizes` でも作れるが、スクリーンショットを撮ると既定の 16px に戻ることがあり（全画面では必ず戻る）、同じタブで別のページへ移り続けると3ページ目あたりから効かなくなる。`Page.setFontSizes` を使うときは、ページごとに新しいタブで設定し、撮るたびに設定し直して、測る前にルートの字の大きさが 32px であることを確かめる。

**根拠**: MCP の呼び出しの失敗と、`/opt/pw-browsers` の中身（`ls -la /opt/pw-browsers`・`/opt/pw-browsers/chromium --version` が `Chromium 141.0.7390.37`）、文字サイズ 200% の作り方は実測（cycle-316）。求める版が無いことは、`take.ts` が入っている Chromium で起動し直したことで実測（cycle-316）。`playwright install` を使わない決まりは、claude.ai のクラウドのセッションの環境の指示の文で確認（cycle-316）。

## ダークの画面を撮る手順は、テーマの切り替え方で変わる

このサイトのテーマは端末の設定（`prefers-color-scheme`）だけに従う（`src/app/globals.css`）。Playwright のコンテキストに `colorScheme: "dark"` を渡せばダークで描かれる。`take-screenshot` スキルの `--dark` は、撮る前に `matchMedia("(prefers-color-scheme: dark)").matches` と `<html>` の計算値の `color-scheme` が `dark` であることを確かめ、当たっていなければファイル名に `_dark-FAILED` を付けて非ゼロで終わる。

テーマをクラスで切り替える仕組み（next-themes の `attribute="class"` と `enableSystem`、`<html class="dark">` でダークにするもの）では、`page.emulateMedia({ colorScheme: "dark" })` だけでは確実にダークにならない。next-themes は水和のあとに `localStorage["theme"]` を読んでクラスを付けるので、`defaultTheme="system"` のときは読み込みの順番やキャッシュによって、見た目はライトのままダークの名前で保存される。その仕組みで確実にダークを撮るには次のようにする。

1. `browser.newContext()` の直後（`page.goto` より前）に `context.addInitScript(() => { localStorage.setItem("theme", "dark"); })` で値を入れておく
2. `page.goto` より前に `page.emulateMedia({ colorScheme: "dark" })` も呼ぶ
3. `page.goto` のあと、`page.waitForFunction(() => document.documentElement.classList.contains("dark"))` で `<html class="dark">` が付いたのを確かめてから撮る。待ちがタイムアウトしたら、ファイル名に `_dark-FAILED` を付けて保存し、`process.exit(1)` で非ゼロで終わる

**根拠**: クラスで切り替える仕組みでライトのまま撮れることと、上の手順で撮れることは実測（cycle-216、当時このサイトは next-themes を使っていた）。いまのサイトが端末の設定だけに従うことと `--dark` の確かめ方は、`src/app/globals.css` と `.claude/skills/take-screenshot/scripts/take.ts` を読んで確認（cycle-316）。

## WebKit の折り方を Chromium で近似して測る

コンテナで使えるブラウザは Chromium だけなので（上の節）、WebKit（iOS の Safari）で見出しとコントロールの名前がどこで折れるかは、Chromium で近似して測る。測る手順と合否の基準は `frontend-design` スキルの「見出しとコントロールの名前の折り方を測る」にあり、ここには近似が成り立つ前提とスクリプトの書き方の要点を置く。

近似が成り立つ前提:

- 要素を、WebKit と Chromium の両方で同じに効く機能（`<wbr>`・`word-break: keep-all`・`overflow-wrap: anywhere`・`line-break: strict`）で組んでいる。Chromium でしか効かない `word-break: auto-phrase` が効いていると、Chromium だけが辞書で折り、WebKit と違う行になる。
- 見出しの和文（Zen Antique）と、見出しとコントロールの名前の欧文と数字（IBM Plex Sans）の字の幅は、どちらのエンジンにも同じ Web フォントのファイルが決める。
- コントロールの名前の和文は本文の書体で組み、端末の書体が字の幅を決める。コンテナの Chromium で本文の並びを組むと、和文は WenQuanYi Zen Hei に落ち（`fc-match "sans-serif:lang=ja"`）、16px で仮名が 16.4px、漢字と約物が 16.0px になる。iOS のヒラギノも和文をほぼ全角で組むので字の幅は近く、コンテナのほうがわずかに広いので、折れを多めに数える側の近似になる。

書き方の要点:

- 字の分割ファイルは、ページにその字が出てもすぐには読まれない。`document.fonts.ready` は読み込みが始まっていない字を待たないので、`document.fonts.load` に字を渡して読み込みを始めさせる。待ちは上の「無限に待つ JS」の決まりどおり、タイムアウトと競わせる（例 `Promise.race([document.fonts.load('400 24px "Zen Antique"', text), new Promise((r) => setTimeout(r, 5000))])`）。IBM Plex Sans も同じく、`document.fonts.load('400 16px "IBM Plex Sans"', text)` で要素の欧文と数字を渡して待つ。そのあと `document.fonts.check` が偽なら、その要素は測らずに、測れなかったことを記録する。
- 行に分けるのは、要素の中のテキストノードを順に辿り、字ごとに `range.setStart(node, i); range.setEnd(node, i + ch.length)` とした `range.getClientRects()` の最初の矩形の `top` を読む。字は `for (const ch of node.data)` でコードポイントごとに取り、UTF-16 の位置 `i` を `ch.length` ずつ足す。`i + 1` で進めると、サロゲートペアの字（「𠮟」など）の半分の矩形を読み、行の切れ目を誤る。`top` が前の字より行の高さの半分以上下がった所が、行の切れ目である。`<wbr>` の要素は字を持たないので、行の位置を読むのはテキストノードだけでよい。
- 折り所のうち `<wbr>` の所は、要素の子を順に辿り、`<wbr>` の要素を見たら、次のテキストノードの頭を折り所として控えて分ける。閉じ括弧の直後は、`keep-all` でも Unicode の改行の規則で折れる所なので、`<wbr>` が無くても折り所に数える。
- 1字だけの行は、字が2つ以上の要素で、行に分けたあとの字の数（コードポイントの数）が1の行である。区切りの関数が最後の1字の文節を前につないでも、文節の中の折れで1字の行が出ることがあるので、文節でなく行の字で数える。
- 丸括弧の中の折れは、要素の頭から丸括弧の開きと閉じを数え、開いたままの所にある行の切れ目である。
- はみ出しは、要素の `scrollWidth` が `clientWidth` を超えるか、行の矩形の右端が要素の右端を超えるかで見る。
- 名前に括弧で数を添えたものの折れは、行の切れ目のうち、名前の中の語の切れ目と始め括弧の直前のどちらでもない所を数える。語の切れ目は、見出しの文節の中の語の切れ目と同じく、`src/lib/word-starts.ts` の `wordStartsOf` が返す位置で見る。素の `Intl.Segmenter` の境目で数えると、辞書が片仮名の語を刻んだ切れ端の境目（「バリ|デー|ター」）での折れを語の切れ目での折れと数え違える。`wordStartsOf` は書記素の番号を返すので、Node のスクリプトで `node --experimental-strip-types` から読み込んで要素の字の語の頭を求め、ページで読んだ行の切れ目（コードポイントの位置）を書記素の番号に直してから突き合わせる。
- `line-break` は、要素の `getComputedStyle(el).lineBreak` を読む。
- 読み上げの名前は、CDP の `Accessibility.getFullAXTree` で要素の名前を読み、元の文と比べる。Chromium は `<wbr>` ごとに名前へ空白を1つ入れる（`locator.ariaSnapshot()` は空白をまとめて見せるので、この差が見えない）。
- 「200%」は既定の文字サイズを 32px にして作る（作り方と `Page.setFontSizes` の注意は上の節）。

**根拠**: コンテナの Chromium での書体の落ち先と字の幅、字の分割ファイルの読まれ方、サロゲートペアの読み誤り、`<wbr>` ごとに読み上げの名前へ空白が入ることは実測（cycle-316）。WebKit で同じ行になることは、コンテナで WebKit を使わないので推論（両方のエンジンで同じに効く機能と同じ Web フォントのファイルで組むことからの推論。iOS のヒラギノとの字の幅の比較も推論）。

## バックグラウンドのプロセスを起こして止める

同じコンテナでは、ほかのエージェントも `next start`・`next dev`・vitest などを動かしている。名前やコマンドラインの一致、ポートの一致でプロセスを探して止めると、それらと自分のシェルまで止め、止めたプロセスは戻せない。バックグラウンドで起こすプロセスは、自分が起こしたプロセスのグループだけを止められる形で起こす。

1. 作業者ごとの専用のディレクトリを作り、PGID・ログ・スクリーンショットなどの書き出し（`take-screenshot` スキルの `take.ts` では `--out`）・ブラウザのプロファイルをすべてその下に置く。場所は `tmp/cycle-<n>/<作業の名前>/`、または依頼で示された scratchpad の下の自分の名前のディレクトリにする。共有のディレクトリの直下に `server.pid` のような決まった名前で置くと、ほかの作業者が同じ名前で上書きし、そのファイルの PID を止めてほかの作業者のサーバーを止める。
2. ポートは自分で選んだ番号にする。`lsof -nP -iTCP:<番号> -sTCP:LISTEN` で何かが待ち受けていれば、それはほかの作業者のサーバーかもしれないので、止めずに別の番号を選ぶ。
3. `setsid` で新しいプロセスグループを作って起こし、グループの頭の PID（PGID）を、起こされた側から書き出す。

   ```bash
   DIR=tmp/cycle-<n>/<作業の名前>; mkdir -p "$DIR"
   PORT=3127 setsid bash -c 'echo $$ > "$0/server.pgid"; exec npm start' "$DIR" > "$DIR/server.log" 2>&1 < /dev/null &
   ```

   起こしたら、ログ（`$DIR/server.log`）に `Ready` が出るまで、上限を決めて待ってから使う（無限に待たない）。`$!` は控えない。Bash ツールのシェルでは `setsid` が fork するので、`$!` はすぐに終わる `setsid` の PID になり、グループの PID と違う。また、起こしたプロセスは起こした直後から親が 1 になるので、親の PID が 1 であることは、自分のものでないことの印にならない。

4. `next dev` は、同じディレクトリで2つ目を起こさない（`.next/dev/lock` を取る）。ログに `Another next dev server is already running.` と、先にいるサーバーの PID・URL と `kill <PID>` を勧める文が出たら、それはほかの作業者のサーバーなので、勧められた `kill` は打たない。止めずに、自分の担当の木（`.claude/worktrees/agent-<id>`）で起こす。担当の木は `.next` をほかの木と分けるので、そこで書いた自分の変更をそのまま起こせる。`next build` も同じく `.next/lock` で2つ目を止める。

5. グループごと止める。Bash ツールはコマンドの間でシェルの変数を引き継がないので、止めるコマンドでも `DIR` を書き直す。`npm start` は `sh` を通して `next start` を起こし、`next start` は自分のプロセスの名前を `next-server` に替える。`npm run dev` は `sh` を通して `next dev` を起こし、`next dev` は `next-server` の子を起こす。どちらも `npm` の PID だけを止めると `next-server` が残ってポートを持ち続けるので、グループに送る。

   ```bash
   DIR=tmp/cycle-<n>/<作業の名前>
   kill -- -"$(cat "$DIR/server.pgid")"
   ```

6. 止めたあと、そのグループのプロセスが0になったことと、ポートが空いたことを確かめる。止めた直後は、片付けを待つ `<defunct>` のプロセスが数に入ることがあるので、0 にならなければ少しおいて数え直す。それでも残っていれば、同じグループに `kill -KILL -- -"$(cat "$DIR/server.pgid")"` を送って確かめ直す。

   ```bash
   ps -eo pgid= | awk -v g="$(cat "$DIR/server.pgid")" '$1 == g' | wc -l   # 0 になればよい
   lsof -nP -iTCP:3127 -sTCP:LISTEN                                        # 何も出なければよい
   ```

止めるときは、上の手順で書き出した PGID を使う。名前やポートで探したものをそのまま止める形（`pkill`・`killall`・`npx kill-port`・`fuser -k`、`pgrep`・`lsof` の結果をそのまま `kill` に渡す形）と、`kill` の的に `-1` や `0` を渡す形は、ほかの作業者のプロセスを巻き込むので使わない。PGID を控え損ねた自分のプロセス（迷子になったサーバーなど）を止めるときは、名前やポートで候補を探してよいが、止める前に1つずつ自分のものかを確かめ、確かめられたものだけを PID かグループで止める。自分の担当の木で起こしたものは、`ls -l /proc/<PID>/cwd` がその木を指すことで見分ける。自分で選んだポートを `PORT` で渡して起こしたものは、`tr '\0' '\n' < /proc/<PID>/environ | grep '^PORT='` が自分の番号を返すことでも見分ける。プロセスの名前（`next-server`）はどのサーバーも同じなので、それでは見分けられない。自分のものと確かめられないプロセスは止めず、PM に知らせる。

**根拠**: `setsid` が fork して `$!` がグループの PID と違うこと、起こされた側が書いた PGID でグループごと止まること、止めたあとの2つの確かめ方、止めた直後に `<defunct>` が数に入り、少しおくと 0 になることは実測（cycle-316 の完了の処理。子を持つ代わりのサーバー、`npm start`、`npm run dev` で試した）。起こした直後から親が 1 になることは実測（同じ）。プロセスの木は実測で、`npm start` は `npm start` → `sh -c next start` → `next-server (v16.3.0)`、`npm run dev` は `npm run dev` → `sh -c next dev` → `node …/next dev` → `next-server (v16.3.0)` だった（Next.js 16.3.0。`next start` が名前を替えるのは `node_modules/next/dist/server/lib/start-server.js` の `process.title`、`next dev` が子を起こすのは `node_modules/next/dist/cli/next-dev.js` の `fork` で確認）。`next dev` と `next build` が2つ目を止めることと、そのときの文は、`node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js` の `.next/dev/lock`、`build/index.js` の `.next/lock`、`build/lockfile.js` で確認（Next.js 16.3.0）。共有の scratchpad の `server.pid` の取り違えでほかの作業者のサーバーを止めたこと、`pkill -f` でほかの作業者の試験と自分のシェルを止めたこと、`npm` の PID を止めて `next-server` が残ったことは実測（cycle-316）。`PORT` を渡して起こしたグループの子の `/proc/<PID>/environ` にもその値が残ることは実測（cycle-316 の完了の処理。`sh` と `sleep` の子で試した。`next-server` では試していない）。

## 本番ビルドの実機検証の段取り

- `npm run build` のあと、上の「バックグラウンドのプロセスを起こして止める」の形で `npm start`（任意のポート、例 `PORT=3127`）を起こしてから検証する。
- `curl` で各ルートが 200 を返すことを確かめてから Playwright を当てる（起動の待ちも無限に待たない）。
- スクリーンショットなどの生成物は、自分の専用のディレクトリの下にだけ保存する。
- 複数のエージェントが同じ作業ツリーで並行して動くときは、作業ツリーの `.next` をほかのエージェントがビルドし直して、起動中のサーバーが `ChunkLoadError` を出すことがある。ほかのエージェントの `next build` が `.next/lock` を持っていれば、自分の `next build` は始まらない。ビルドと起動は、`.next` をほかと分ける自分の担当の木でする。担当の木の `node_modules` はシンボリックリンクにすると Turbopack が拒むので、`cp -al <主の木>/node_modules ./node_modules` でハードリンクの写しを置く。ハードリンクの写しは中身を主の木とほかの木と分け合うので、担当の木では `node_modules` の下を書き換えない（`npm install` を打たない、パッケージのファイルを手で直さない）。
- 担当の木で本番のビルドをすると、1つにつき 2GB 台の場所を使う（`.next` が大半）。コンテナの書ける場所には上限があり、並行するエージェントが別々にビルドすると埋まって、ビルドが `ENOSPC` で落ちる。確かめ終えたらサーバーのグループを止め、担当の木の `.next` をすぐ消す。前と後を比べるときも2つを同時に置かず、1つずつビルドして測る。並行する負荷でブログのページの静的生成が 60 秒を超えて落ちることもあるので、そのときは負荷の低い時に組み直す。

**根拠**: 起動と `curl` での確かめ方は、cycle-227 の実機検証で使って動いた段取りで実測。`ChunkLoadError`・シンボリックリンクの拒否・場所の使い切り・静的生成のタイムアウトは実測（cycle-316）。
