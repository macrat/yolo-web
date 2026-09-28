# Playwright MCP ツールの挙動と安全な使い方

サブエージェント（reviewer・researcher など）や PM が Playwright MCP（`mcp__playwright__*`）や、リポジトリの `playwright` ライブラリで書いたスクリプトで実機を確かめるときの落とし穴と安全策。ダークの画面の撮り方、クラウドのコンテナの Chromium で WebKit の折り方を近似して測る方法、本番ビルドを並行して確かめる段取りも扱う。各項の末尾の「根拠」に、実測・確認・推論の別と、根拠になったサイクルを書く。

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

バックグラウンドで起動したサブエージェントは MCP のツールを使えない。Playwright MCP や Google Analytics の MCP を使うサブエージェントは、フォアグラウンドで起動する。

**根拠**: 実測（cycle-123 で、バックグラウンドで起動したサブエージェントから GA の MCP ツールを使えなかった。Claude Code の公式ドキュメントに、バックグラウンドのサブエージェントでは MCP ツールを使えないと書かれていることも確認した）。

## クラウドのコンテナでは MCP のブラウザが起動しない

claude.ai のクラウドのコンテナでは、Playwright MCP の呼び出しが `Browser "chrome-for-testing" is not installed` で失敗する。入っているのは `/opt/pw-browsers/chromium`（`/opt/pw-browsers/chromium-1194/` の Chromium へのリンク）だけで、コンテナの決まりにより `playwright install` でブラウザを足すこともできない。このときは、リポジトリの `playwright` ライブラリで `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` とするスクリプトを `tmp/` に書き、`node` で動かして操作とスクリーンショットを行う。このスクリプトでも、解決しない Promise や無限の待ちは使わない。

文字サイズ 200% は、ブラウザの既定の文字サイズを 32px にして作る（`html { font-size }` を書き足す方法では `rem` のメディアクエリが動かない）。確かなのは、プロファイルの設定で決める方法で、`chromium.launchPersistentContext` に渡すユーザーのディレクトリの `Default/Preferences` に `{"webkit":{"webprefs":{"default_font_size":32}}}` を書いてから起動する。CDP の `Page.setFontSizes` でも作れるが、スクリーンショットを撮ると既定の 16px に戻ることがあり（全画面では必ず戻る）、同じタブで別のページへ移り続けると3ページ目あたりから効かなくなる。`Page.setFontSizes` を使うときは、ページごとに新しいタブで設定し、撮るたびに設定し直して、測る前にルートの字の大きさが 32px であることを確かめる。

**根拠**: 実測（cycle-316）。

## ダークの画面を撮る手順は、テーマの切り替え方で変わる

このサイトのテーマは端末の設定（`prefers-color-scheme`）だけに従う（`src/app/globals.css`）。Playwright のコンテキストに `colorScheme: "dark"` を渡せばダークで描かれる。`take-screenshot` スキルの `--dark` は、撮る前に `matchMedia("(prefers-color-scheme: dark)").matches` と `<html>` の計算値の `color-scheme` が `dark` であることを確かめ、当たっていなければファイル名に `_dark-FAILED` を付けて非ゼロで終わる。

テーマをクラスで切り替える仕組み（next-themes の `attribute="class"` と `enableSystem`、`<html class="dark">` でダークにするもの）では、`page.emulateMedia({ colorScheme: "dark" })` だけでは確実にダークにならない。next-themes は水和のあとに `localStorage["theme"]` を読んでクラスを付けるので、`defaultTheme="system"` のときは読み込みの順番やキャッシュによって、見た目はライトのままダークの名前で保存される。その仕組みで確実にダークを撮るには次のようにする。

1. `browser.newContext()` の直後（`page.goto` より前）に `context.addInitScript(() => { localStorage.setItem("theme", "dark"); })` で値を入れておく
2. `page.goto` より前に `page.emulateMedia({ colorScheme: "dark" })` も呼ぶ
3. `page.goto` のあと、`page.waitForFunction(() => document.documentElement.classList.contains("dark"))` で `<html class="dark">` が付いたのを確かめてから撮る。待ちがタイムアウトしたら、ファイル名に `_dark-FAILED` を付けて保存し、`process.exit(1)` で非ゼロで終わる

**根拠**: クラスで切り替える仕組みでライトのまま撮れることと、上の手順で撮れることは実測（cycle-216、当時このサイトは next-themes を使っていた）。いまのサイトが端末の設定だけに従うことと `--dark` の確かめ方は、`src/app/globals.css` と `.claude/skills/take-screenshot/scripts/take.ts` を読んで確認（cycle-316）。

## WebKit の折り方を Chromium で近似して測る

コンテナには Chromium しか無いので、WebKit（iOS の Safari）で見出しとコントロールの名前がどこで折れるかは、Chromium で近似して測る。測る手順と合否の基準は `frontend-design` スキルの「見出しとコントロールの名前の折り方を測る」にあり、ここには近似が成り立つ前提とスクリプトの書き方の要点を置く。

近似が成り立つ前提:

- 要素を、WebKit と Chromium の両方で同じに効く機能（`<wbr>`・`word-break: keep-all`・`overflow-wrap: anywhere`・`line-break: strict`）で組んでいる。Chromium でしか効かない `word-break: auto-phrase` が効いていると、Chromium だけが辞書で折り、WebKit と違う行になる。
- 見出しの和文（Zen Antique）と、見出しとコントロールの名前の欧文と数字（IBM Plex Sans）の字の幅は、どちらのエンジンにも同じ Web フォントのファイルが決める。
- コントロールの名前の和文は本文の書体で組み、端末の書体が字の幅を決める。コンテナの Chromium で本文の並びを組むと、和文は WenQuanYi Zen Hei に落ち（`fc-match "sans-serif:lang=ja"`）、16px で仮名が 16.4px、漢字と約物が 16.0px になる。iOS のヒラギノも和文をほぼ全角で組むので字の幅は近く、コンテナのほうがわずかに広いので、折れを多めに数える側の近似になる。

書き方の要点:

- 字の分割ファイルは、ページにその字が出てもすぐには読まれない。`document.fonts.ready` は読み込みが始まっていない字を待たないので、`document.fonts.load` に字を渡して読み込みを始めさせる。待ちは上の「無限に待つ JS」の決まりどおり、タイムアウトと競わせる（例 `Promise.race([document.fonts.load('400 24px "Zen Antique"', text), new Promise((r) => setTimeout(r, 5000))])`）。IBM Plex Sans も同じく、`document.fonts.load('400 16px "IBM Plex Sans"', text)` で要素の欧文と数字を渡して待つ。そのあと `document.fonts.check` が偽なら、その要素は測らずに、測れなかったことを記録する。
- 行に分けるのは、要素の中のテキストノードを順に辿り、字ごとに `range.setStart(node, i); range.setEnd(node, i + ch.length)` とした `range.getClientRects()` の最初の矩形の `top` を読む。字は `for (const ch of node.data)` でコードポイントごとに取り、UTF-16 の位置 `i` を `ch.length` ずつ足す。`i + 1` で進めると、サロゲートペアの字（「𠮟」など）の半分の矩形を読み、行の切れ目を誤る。`top` が前の字より行の高さの半分以上下がった所が、行の切れ目である。`<wbr>` の要素は字を持たないので、行の位置を読むのはテキストノードだけでよい。
- 折り所のうち `<wbr>` の所は、要素の子を順に辿り、`<wbr>` の要素を見たら、次のテキストノードの頭を折り所として控えて分ける。閉じ括弧の直後は、`keep-all` でも Unicode の改行の規則で折れる所なので、`<wbr>` が無くても折り所に数える。
- 1字だけの行は、行に分けたあとの字の数（コードポイントの数）が1の行である。区切りの関数が最後の1字の文節を前につないでも、文節の中の折れで1字の行が出ることがあるので、文節でなく行の字で数える。
- 丸括弧の中の折れは、要素の頭から丸括弧の開きと閉じを数え、開いたままの所にある行の切れ目である。
- はみ出しは、要素の `scrollWidth` が `clientWidth` を超えるか、行の矩形の右端が要素の右端を超えるかで見る。
- 名前に括弧で数を添えたものの折れは、行の切れ目のうち、名前の中の語の切れ目（`Intl.Segmenter` の語の境目）と始め括弧の直前のどちらでもない所を数える。
- `line-break` は、要素の `getComputedStyle(el).lineBreak` を読む。
- 読み上げの名前は、CDP の `Accessibility.getFullAXTree` で要素の名前を読み、元の文と比べる。Chromium は `<wbr>` ごとに名前へ空白を1つ入れる（`locator.ariaSnapshot()` は空白をまとめて見せるので、この差が見えない）。
- 「200%」は既定の文字サイズを 32px にして作る（作り方と `Page.setFontSizes` の注意は上の節）。

**根拠**: コンテナの Chromium での書体の落ち先と字の幅、字の分割ファイルの読まれ方、サロゲートペアの読み誤り、`<wbr>` ごとに読み上げの名前へ空白が入ることは実測（cycle-316）。WebKit で同じ行になることは、WebKit を動かせないので推論（両方のエンジンで同じに効く機能と同じ Web フォントのファイルで組むことからの推論。iOS のヒラギノとの字の幅の比較も推論）。

## 本番ビルドの実機検証の段取り

- `npm run build` → `npm start`（任意のポート、例 `PORT=3127`）で本番ビルドを起動してから検証する。
- サーバーはバックグラウンドで起動し、`curl` で各ルートが 200 を返すことを確かめてから Playwright を当てる（起動の待ちも無限に待たない）。
- スクリーンショットなどの生成物は `tmp/cycle-<n>/` の下にだけ保存する。
- 複数のエージェントが同じ作業ツリーで並行して動くときは、作業ツリーの `.next` をほかのエージェントがビルドし直し、起動中のサーバーが `ChunkLoadError` を出すことがある。確かめるコミットを `git worktree add` で別に取り出し、そこでビルドして起動する。worktree の `node_modules` はシンボリックリンクにすると Turbopack が拒むので、`cp -al` でハードリンクの写しを置く。片付けで止めるサーバーは、起動したときに控えた自分の PID か、`/proc/<pid>/cwd` が自分の worktree を指すものに限る。`pkill -f next-server` はほかのエージェントのサーバーまで止め、その確かめを途中で壊す。
- worktree で本番のビルドをすると、1つにつき 2GB 台の場所を使う（`.next` が大半）。コンテナの書ける場所には上限があり、並行するエージェントが別々にビルドすると埋まって、ビルドが `ENOSPC` で落ちる。確かめ終えた `.next` と worktree はすぐ消し、前と後を比べるときも2つを同時に置かず、1つずつビルドして測る。並行する負荷でブログのページの静的生成が 60 秒を超えて落ちることもあるので、そのときは負荷の低い時に組み直す。

**根拠**: 起動と `curl` での確かめ方は、cycle-227 の実機検証で使って動いた段取りで実測。`ChunkLoadError`・シンボリックリンクの拒否・場所の使い切り・静的生成のタイムアウトは実測（cycle-316）。
