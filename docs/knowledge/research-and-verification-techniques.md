# 調査・検証の技法

色のコントラスト、検索結果、外部の一次資料、日付、アクセス解析の数値など、調査や検証で数字や事実を取るときの落とし穴と、確かな取り方についての知見。

## oklch 色のコントラスト実測は canvas 読み出しで行う

- `getComputedStyle().color` は oklch を **sRGB に解決せずそのまま返す**（Chrome 111+ は指定色空間で計算値を保持する）。この文字列から数値を取り出して RGB として扱うと、全ペアが約 1:1 になる派手な誤測になる（実測・cycle-278）。
- 正しい方法: canvas に `fillStyle = "oklch(...)"` で塗り、`getImageData()`（`colorSpace: "srgb"`）でピクセルを読み出して WCAG 相対輝度を計算する。Playwright + `page.evaluate` で自動化できる（実測・cycle-278）。
- 注意: tsx（esbuild）でトランスパイルした関数を `page.evaluate` に渡すと `__name is not defined` で落ちる——**評価コードは文字列で渡す**（実測・cycle-278）。

## 描く前に元へ戻る一瞬の組みの変化は、そのあいだにヒットテストが走ったときだけ layout-shift と `scroll` になる

- 組みを変えて次の画面まで残す変化は、入力が無くても layout-shift の記録になる。一方、組みを変えて描く前に元へ戻す変化（コピーの出来事の中で字を除き、次の `requestAnimationFrame` で戻す、など）は、そのあいだにヒットテストが走ったときだけ、layout-shift の記録と `scroll`（スクロールのアンカーの直し）になる。ヒットテストは、マウスがページの上にあるとブラウザがホバーを直すために走らせ、スクリプトの `document.elementFromPoint` でも走る。
- Playwright で開いた Chromium の本体（`/opt/pw-browsers/chromium`、新しい headless）は、マウスの出来事を1度も受けていないページではホバーを直さないので、字をスクリプトで選んでキーボードだけで操作すると、一瞬の変化は記録されない。マウスを動かすだけ（押さなくてよい）で記録される。Playwright の指の模倣（`hasTouch`・`isMobile` で `touchscreen.tap`）では、押したあとも記録されなかった。
- 一瞬の変化を来訪者の動きに合わせて測るときは、写す前にマウスを動かすか押す。入力なしで測った 0 件は「動かない」ことの根拠にならない。測った記録には、ブラウザの種類と、写す前の入力の有無と種類を書く。
- 記録が CLS に入るかは、変化を起こした操作で決まる。ずれの前 500ms 以内にページが押す・叩く・キーの出来事を受けていれば `hadRecentInput: true` で CLS に入らない。右クリックや「編集」のメニューからの操作はページに入力として届かないので `false` になり、CLS に入る。コピーなら、Ctrl+C（キー）と、メニューを模した「右クリックのあと `document.execCommand("copy")`」の両方で測る（Playwright ではブラウザのメニューの項目を押せない）。
- 描かれたかどうかは layout-shift の記録では分からない（描く前に元へ戻る変化も記録される）。CDP の screencast（`Page.startScreencast`）の枠を前後で比べる。

根拠: 実測（cycle-316。本番ビルドを Chromium の本体 `chromium-1194`（Chrome 141.0.7390.37）で開き、記事 `nextjs-global-not-found-for-multiple-root-layouts` の h1 を写した。1280×900 で、入力なしに `main` の頭へ高さ 120px の `div` を足して残すと 1 件（0.063、`hadRecentInput: false`）。入力なしに h1 をスクリプトで選んで Ctrl+C（コピーの受け手が字を除いて戻す組み方）では 0 件、同じ操作でコピーの出来事の中で `elementFromPoint(100, 100)` を呼ぶと 2 件（0.127・0.114）、写す前にマウスを動かすだけでも 2 件（同じ値）。入力なしに 3000px 送った所で Ctrl+A・Ctrl+C し、`elementFromPoint` を呼ぶと 2 件（0.044・0.044）と `scroll` 2 回（2918 → 3000）。375×900 の指の模倣で1度押してから写すと、見出しでも 3000px 送った所の Ctrl+A でも、記録も `scroll` も 0 で、`MutationObserver` にはコピーのたびに 8 件届いた。headless shell `chromium_headless_shell-1194` は、入力なしでも一瞬の変化を記録する（review-t5-3b-done-5.md）。同じ組み方で、h1 を3度押して選び、右クリックのあと 700ms か 1500ms 待って `execCommand("copy")` で写すと、2 件（0.127・0.114）がどちらも `hadRecentInput: false` で出た。Ctrl+C では同じ値が `true` で出た。screencast の比べ方は `docs/knowledge/clipboard-and-copy.md` の 2）。

## Google SERP の実査は bot 検出で失敗する——代替経路を持つ

- Playwright からの google.co.jp / google.com 検索は 429 / sorry ページ（bot 検出）でほぼ閲覧不可（実測・cycle-278）。
- 代替: **Yahoo! JAPAN 検索は Google のインデックス/技術を採用**しており、Google 相当の SERP を bot 検出なしで実査できる（実測・cycle-278）。Bing も日本語設定で実査に使えるが、インデックスが Google と異なり、Google・Yahoo! で上位に出るページが Bing の1ページ目に出ないことがある（実測・cycle-278）。どのエンジンで見た結果かを必ず記録する。

## Chromium の bug とソースは、WebFetch で読めなくても curl で読める

- issues.chromium.org の bug の頁（`https://issues.chromium.org/issues/<id>`）は、スクリプトで中身を描くので、WebFetch にはログインの画面（「Chromium」「Sign in」の字だけ）しか返らない。入らないと読めないわけではない（実測・cycle-319）。
- 本文は頁の裏の API から取れる。`curl -sS "https://issues.chromium.org/action/issues/<id>"` が JSON を返す。頭の1行は `)]}'`（JSON の乗っ取りよけ）なので、それを除いてから読む（`tail -n +2` のあと `python3 -c "import json,sys; json.load(sys.stdin)"` などで読める）。中は名前の無い入れ子の配列で、題・コンポーネント・ラベル・最初の報告の本文（字のままのものと `<br>` で区切ったものの2通り）が入る。2つ目以降のコメントは入らない（実測・cycle-319）。
- コメントまで読むときは、Playwright で開いた Chromium の本体（`/opt/pw-browsers/chromium`）で頁を開き、`document.body.innerText` を取る。入らずに状態・優先度とコメントの全部が読める。`networkidle` まで待っても字が空のことがあるので、空なら開き直す（実測・cycle-319）。
- chromium.googlesource.com のソースは、`https://chromium.googlesource.com/chromium/src/+/main/<パス>?format=TEXT` が中身を base64 で返す。`curl -sS "<URL>" | base64 -d` で元のファイルに戻る。`main` のところをリリースのタグ（例: `141.0.7390.37`）に替えると、その版のファイルになる（実測・cycle-319）。
- googlesource は、同じ URL でもときどき HTTP 503（「Error 503 (Service Unavailable)」の HTML）を返す。そのまま `base64 -d` に流すと「invalid input」で止まり、中身は空になる。取るときは HTTP の状態を見て（`c=$(curl -sS -w '%{http_code}' -o <ファイル> "<URL>")`）、200 のときだけ `base64 -d <ファイル>` で戻し、503 なら数秒待って同じ URL を取り直す。少し待てば 200 で返る（実測・cycle-319）。

根拠: 実測（cycle-319。issue 41453122 を WebFetch で開くとログインの画面だけが返り、`curl` の `action/issues/41453122` は HTTP 200・`application/json` で約 100KB を返し、題「preventScroll of element.focus doesn't work on Chrome/Android」と最初の報告の本文が入っていた。同じ id の `/events`・`/comments` は 404。Playwright の Chromium 本体で頁を開くと、状態（Obsolete）・優先度（P3）と、最初の報告から #16 までのコメントが字で取れた（3回開いて1回は字が空だった）。`third_party/blink/renderer/core/dom/element.cc` を `main` の `?format=TEXT` で取ると HTTP 200・約 740KB の base64 で、戻すと 14,596 行のソースで `preventScroll()` を呼ぶ行があった。タグ `141.0.7390.37` で取ると 12,558 行だった。同じ `element.cc` の URL を続けて 8 回取ると 2 回が HTTP 503 で、1,459 バイトの HTML が返り、`base64 -d` は「invalid input」で 0 行だった。`-w '%{http_code}'` で状態を見て 503 なら 3 秒待って取り直す形で 3 度取ると、3 度とも 2〜3 回目で 200 になり、戻すと 14,596 行だった）。

## サブエージェントへの日付指定は自分で `date` を引いてから書く

- PM が指示文に書いた日付を、サブエージェントはそのまま「アクセス日」として記録する。指示文の日付が誤っていると、その指示で作られた調査レポート群のアクセス日が一括でずれる（実測・cycle-278）。
- 対策: 指示文に日付を書く前に `date` コマンドで実時刻を確認する。もしくは「アクセス日は自分で date を実行して記録せよ」と指示する（推論・cycle-278）。

## GA4 の「エンゲージ秒」はセッション合計であり、面ごとの滞在ではない

- `engagement_time_msec` の総和は回答時間・閲覧時間の合算で、「結果を何秒見たか」のような**特定局面の滞在は、イベント（例: level_end）のタイムスタンプ前後で分離集計**しないと読めない。集計値を局面の滞在と誤読すると満足度の判定を誤る（実測・cycle-278。Owner の指摘で誤読がわかった）。
- モバイルは離脱時の最終ビーコンが届かないことが多く、「最終イベント=表示直後」は「即離脱」と「計測欠落」を区別できない。デスクトップ（欠落が少ない）を分離して下限推定に使う（cycle-278。完走した run のうち最後の記録が結果の表示であるものはモバイルに偏り、デスクトップでは9割が表示後のシグナルを持つことは実測。その差の多くがビーコンの欠落によるというのは推論）。
