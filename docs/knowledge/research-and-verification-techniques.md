# 調査・検証の技法

色のコントラスト、検索結果、日付、アクセス解析の数値など、調査や検証で数字や事実を取るときの落とし穴と、確かな取り方についての知見。

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

## サブエージェントへの日付指定は自分で `date` を引いてから書く

- PM が指示文に書いた日付を、サブエージェントはそのまま「アクセス日」として記録する。指示文の日付が誤っていると、その指示で作られた調査レポート群のアクセス日が一括でずれる（実測・cycle-278）。
- 対策: 指示文に日付を書く前に `date` コマンドで実時刻を確認する。もしくは「アクセス日は自分で date を実行して記録せよ」と指示する（推論・cycle-278）。

## GA4 の「エンゲージ秒」はセッション合計であり、面ごとの滞在ではない

- `engagement_time_msec` の総和は回答時間・閲覧時間の合算で、「結果を何秒見たか」のような**特定局面の滞在は、イベント（例: level_end）のタイムスタンプ前後で分離集計**しないと読めない。集計値を局面の滞在と誤読すると満足度の判定を誤る（実測・cycle-278。Owner の指摘で誤読がわかった）。
- モバイルは離脱時の最終ビーコンが届かないことが多く、「最終イベント=表示直後」は「即離脱」と「計測欠落」を区別できない。デスクトップ（欠落が少ない）を分離して下限推定に使う（cycle-278。完走した run のうち最後の記録が結果の表示であるものはモバイルに偏り、デスクトップでは9割が表示後のシグナルを持つことは実測。その差の多くがビーコンの欠落によるというのは推論）。
