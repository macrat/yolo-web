# T4-18（ブログの mermaid の図）の実装のレビュー

対象: 作業ツリーのコミットしていない変更のうち `src/blog/_components/MermaidRenderer.tsx`・`src/blog/_components/mermaid-figure.ts`・`src/blog/_components/__tests__/mermaid-figure.test.ts`・`src/app/blog/[slug]/page.module.css`・`src/components/Prose/Prose.module.css`。規定は t4-design.md の 5-5・10章の T4-18 の行・「T4-17 の結果を受けた PM の決定」の4つ目、DESIGN.md §5（図）・§6。

## 判定

**改善指示**（Major 3・Minor 3）

## 確かめたこと

- HEAD の worktree に上の5つのファイルを写して `npm run build` し、`next start`（4273）で測った。`vitest`（src/blog/_components の7ファイル・68件）・`eslint`・`tsc --noEmit`・`prettier --check` は通る。
- 1280×800 で10記事19図の、図の元の幅・コンテンツ幅・描いた幅・横に送るか・読み上げの名前を測った。
- 図の中の字の大きさ・無彩・はみ出しと印の一致は builder の記録（ライト・ダーク、375・1280・320 の 200%）と撮り比べの画像で確かめ、1280 と 375 のダークで横に送る図にキーボードで着いて送り、リングを撮った。
- テーマを 0〜250ms の間隔で切り替え直して、gantt の記事の図が最後のテーマの色で描かれていることを確かめた。workflow-simplification（6図）で、測り直し1回ぶん（字の大きさを読む処理と幅の読み取り）が約 3.5ms で、1280 から 360 まで 20px ずつ幅を変えても目立つ遅れは無い。
- mermaid の間隔の設定だけを変えて図の元の幅がどれだけ縮むかを、同じページで mermaid 11.16.1 を読み込んで試した（Major-1）。

## よくなったこと

- 図の中の字が、どの条件でも 14px（200% では 28px）を下回らなくなった。前は 375px で 2.89px、1280px でも 6.59px で、読めなかった。
- 図の色が、ライトとダークのどちらでもトークンの無彩になった。線種（実線・点線）・形（箱・菱形・区分）・字の区別は残っている。gantt の `crit` の帯も「テスト失敗」の字で読める。
- 横に送る図は、表・コードと同じ太い線・`--box-padding`・`tabindex="0"`・「図（横にスクロールできます）」を持ち、フォーカスのリングは globals.css の既定のまま太い線の外に密着して出る（outline 3px・offset 3px と `--paper` の box-shadow。表・コードと同じ）。
- 描き直しは幅が変わったときだけで、印を付けても枠の外形の幅が変わらないので、ResizeObserver が行き来しない。
- 経緯のコメントは無い。`page.module.css` の「横長図をスクロール可能にする」は書き直されている。

## Major

### Major-1: 1280px で19図のうち10図が横に送る図になり、図の全体が見えない

1280×800（目次を開いた既定）では、記事の本文の列のコンテンツ幅は 622px で、本文の幅（640px）より狭い。t4-design.md 5-5 の「PC で本文の幅（640px）に詰めずに大きく描く」は、目次を持つ 1024px 以上の画面では起きていない。その幅で図を元の大きさ（字 16px）から 0.875 倍までしか縮めないので、元の幅が 711px を超える図は、どれも横に送る図になる。

| 記事                                                  | 図                   | 元の幅                | 描いた幅             |
| ----------------------------------------------------- | -------------------- | --------------------- | -------------------- |
| how-we-built-this-site                                | 2                    | 1214                  | 1062                 |
| spawner-experiment                                    | 1                    | 869                   | 760                  |
| workflow-evolution-direct-agent-collaboration         | 1（順序図）          | 1050                  | 919                  |
| workflow-simplification-stopping-rule-violations      | 1・2・3（順序図）・4 | 1510・1010・796・1175 | 1321・884・697・1028 |
| javascript-date-pitfalls-and-fixes                    | 1（gantt）           | 990                   | 866                  |
| playwright-dark-mode-screenshot-next-themes           | 1                    | 866                   | 758                  |
| nextjs-server-only-import-in-client-component-node-fs | 1                    | 778                   | 681                  |

来訪者から見ると、PC で読む人は（375px で mermaid の記事を見た来訪者は28日で0回）、前は小さくても全体が見えていた図の、右の一部が隠れる。spawner-experiment の図は高さが約 800px あり、横に送る棒はボックスの下の端にあるので、マウスで読む人は、図の下まで降りて棒を送り、上に戻って読むことになる。

図の元の幅は、mermaid の既定の間隔（flowchart の `nodeSpacing`・`rankSpacing`・`padding`、順序図の `actorMargin`・`width`・`diagramMarginX`）のまま決まっている。間隔だけを詰めた設定（flowchart `nodeSpacing: 30`・`rankSpacing: 36`・`padding: 8`・`diagramPadding: 0`、順序図 `actorMargin: 24`・`width: 96`・`diagramMarginX: 0`・`boxMargin: 8`）で同じ図を描くと、元の幅は次のようになり、1280px で送る図は 10 → 6 に減った（順序図 1050 → 577、796 → 617、nextjs 778 → 684、gantt は Major-2 の目盛りの間引きで 622）。spawner（869 → 729）と playwright（866 → 740）も、文の折り返しの幅（`wrappingWidth`）まで詰めれば届く見込みがある。

**直してほしいこと**: 字の大きさ（14px 以上）を保ったまま、図の元の幅を詰める設定を図の種類ごとに決め、1280px（目次を開いた 622px と閉じた幅）と 375px で横に送る図の数を記録する。詰めすぎて線や字が重ならないことを撮って確かめる。PM は、5-5 の「PC で大きく描く」前提が 1024px 以上では成り立たない事実を t4-design.md に残し、T5 でブログの列の幅が変わるときに測り直す条件にする。

### Major-2: gantt を目盛りの字に合わせて広げるので、どの幅でも横に送る図になり、375px では題が見えない

`renderDiagram` は、目盛りの字が重なると時間の軸を広げる。javascript-date-pitfalls-and-fixes の gantt（0時〜15時、1時間ごとの目盛り16本）は 640 → 990 に広がり、どの幅でも横に送る図になる。

- 1280px: 11:00〜15:00 と「UTC 3月2日」が隠れる。前は小さい字で全体が見えていた。
- 375px（コンテンツ幅 273px）: 題「JST 0時〜9時のタイムゾーンギャップ」が図の横の真ん中（ボックスの左から 308〜581px）に描かれ、最初の画面にまったく入らない。「JST 0時〜9時（テスト失敗）」の帯の字も途中で切れる。記事の要の図で、何の図かが分からない。

目盛りの字を重ねない方法は、軸を広げるほかに、目盛りを間引く（mermaid の gantt の `tickInterval`、例 `2hour`・`3hour`）がある。0〜15時を3時間ごとにすれば、目盛りは6本で、622px の中に 16px の字が重ならずに入る。右の余白（75px）も、区分の名前に合わせた左の余白と違って根拠が無い。

**直してほしいこと**: まずコンテンツ幅に収まる目盛りの間隔を選び（間引く）、それでも重なるときだけ広げる。左の余白は区分の名前に合わせ、右の余白は最後の目盛りの字の半分と帯の外に出る字が収まる所まで詰める。1280px と 375px で題と全部の帯が見えるか、見えないならどこまで見えるかを撮る。

### Major-3: 375px で、横に送る図の最初の画面がほとんど空になる

横に送る図は左端から見せるが、上から下へ描く flowchart（TD）は根の箱が図の横の真ん中にあり、左端に何も無いことが多い。

- spawner-experiment（375px）: 最初に見えるのは、高さ約 650px の空の枠の下の端の「プロンプト取得」の字と線だけ。壊れた図に見える。
- playwright-dark-mode-screenshot-next-themes: 最初の箱の字が「emu」「colorSche」で切れ、菱形の左の端だけが見える。
- nextjs-server-only-import-in-client-component-node-fs: 「client バンドル」だけが見え、話の中心の「server バンドル」（page.tsx から node:fs までの流れ）は右に隠れていて、あることも分からない。

前は字が読めない大きさだったが、図の形は見えていた。いまは字が読めても、どこから読み始めればよいかが見えない。375px の19図のうち17図が横に送る図なので、狭い画面の図のほとんどに関わる。

**直してほしいこと**: 横に送る図を、図の始まり（最初に描かれる箱。TD なら根の箱）が見える位置から見せる（最初の横の位置を、その箱が見えるように決める）。表とコードは左端が始まりなので、図だけの決まりになる。§5 の図の規定に「図の始まりが見える所から見せる」を書き足すかは PM が決め、書くなら planner が先に DESIGN.md と 5-5 に書く。Major-1 で図の幅が詰まれば空の部分も減るので、あわせて撮り直す。

## Minor

### Minor-1: gantt の「今日の線」が、図でいちばん濃い線で描かれる

`todayLineColor` に `--ink` を渡しているので、javascript-date-pitfalls-and-fixes の gantt には、2px の `--ink` の縦の線が引かれる（前は赤）。この図は `dateFormat HH:mm` なので、線は読む人の時計の時刻の位置に出る。記事の中身と関係の無い線が、図の中でいちばん目立ち、時刻によっては「問題の時間帯」の帯の上に重なって意味があるように読める。記事の図に「今日」は意味を持たないので、今日の線は描かない（`.today` を描かない指定を themeCSS に入れるなど）。

### Minor-2: canvas で色を読む仕組みが、ブラウザの指紋対策に弱く、確かめるテストが無い

`createTokenReader` は canvas に塗った1画素を `getImageData` で読む。Firefox の指紋対策（Fingerprinting Protection）は、読み出した画素に乱れを混ぜる（[Mozilla Support](https://support.mozilla.org/en-US/kb/firefox-protection-against-fingerprinting)、[MDN の議論](https://github.com/mdn/content/issues/39084)）。Safari のプライベートブラウズや Brave も同じ手を持つ。乱れが小さければ見た目はほぼ変わらないが、無彩でない値（例 `#fcfbfd`）が入り、読み出しを止めるブラウザ（Tor Browser など）では、どのトークンも同じ色になって図の字と地が見分けられなくなりうる。値の読み方もテストが無く、テストは `toHexColor`（桁をそろえるだけ）にしか当たっていない。

トークンの値は hex・`lab()`・`oklch()` のどれかなので、文字列を読んで sRGB に数で直す純粋な関数にすれば、ブラウザの対策に左右されず、ライトとダークのトークンの値で結果を確かめるテストが書ける。

### Minor-3: 取り消した描き方が、新しいテーマの設定を古い設定で上書きしうる

`renderDiagram` の `finally` は、描き方が取り消された（`cancelled`）あとでも `mermaid.initialize(config)` を呼ぶ。gantt を描き直している途中でテーマが替わると、新しい描き方が `initialize` したあとに古い設定が戻り、そのあとの図が古いテーマで描かれうる。いまは gantt を持つ記事に図が1つしかなく、0〜250ms の間隔で切り替えても起きなかったが、gantt とほかの図を持つ記事が増えると現れる。取り消されたら `initialize` しない、または描くごとに設定を渡す形にする。

## 範囲の外で見つけたこと（PM が backlog に積むか決める）

- javascript-date-pitfalls-and-fixes の gantt は、終わりを `24:00` と書いた2本（「UTC 3月2日」「JST 3月2日」）が幅0で描かれ、帯が無い（前も同じ）。JST の行に帯が無いので、図の言いたい「JST の3月2日と UTC の3月1日が重なる」が見えない。記事の中身の直し。
- 1280px で目次を閉じると、目次の列が「目」「次」の縦の2行に折れる（spawner-experiment で撮影）。T5 のブログの面の直し。
- 図を差し込むときの CLS（最大 0.2 ほど）は、builder の報告どおり前から残る。PM が backlog に積む予定のもの。

## PM への指示

1. 指摘はすべて builder に直させる（Major-3 で DESIGN.md に書き足すと決めた場合は、先に planner に 5-5 と DESIGN.md §5 を書かせてレビューを受ける）。
2. 直したら、もう一度レビューを依頼する。そのときは今回の指摘だけでなく、全体を見直す。
