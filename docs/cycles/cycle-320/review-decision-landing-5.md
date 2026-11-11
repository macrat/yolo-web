# レビュー第5回: 着地の作りの決め直し（decision-landing.md）

- 対象: docs/cycles/cycle-320/decision-landing.md（主の木 design-rollout、HEAD 23443b9f）。第4回の指摘1〜3・PM が直して閉じる2件と、全体を見直した
- 読んだもの: review-decision-landing.md〜-4.md、`git diff 618c0d1d 23443b9f -- decision-landing.md`、landing-options.md（1-3・2-2・2-5・3・4-2）、cycle-316/t5a-design.md 4-6〜4-9・6章 条件7・8章、cycle-316/t5a-measure.md 5-1〜5-5・10-1、cycle-316/options.md「B-620 を含めない理由」、cycle-301/design.md・observation-impact.md・index.md（600ms の窓の記録）、cycle-318/device-triage.md・index.md（OS 別の閲覧）、DESIGN.md §6・§11、src/play/quiz/_components/QuizContainer.tsx（捕捉の段階の受け手）、src/lib/analytics.ts、docs/backlog.md の B-613・B-620
- 結論: **改善指示**

## 良い所

- 第4回の指摘1〜3 と PM が直して閉じる2件は、どれも事実どおりに解けている（下の表）。
- 3つの切り替わり（「はじめる」・知識クイズの「次へ」・結果へ）の窓の守りは、`detail` に頼らず、押し下げの時刻と画面の座標だけで決まる。iOS の Safari でも、そのまま働く作りである。型 (2) の「はじめる」（character-personality の 375×550）と、型 (3) の結果の画面のリンク（375×800 の知識クイズ）の 700ms 未満の2打目は、ここで無くなる。窓は押しを1打目の点の 100px に絞り、キーボードの起動を通す。knowledge §4 の「領域を絞った窓」の型にも、§5 の軸1〜3 にも当たらない。
- 止め方（`mousedown` の `preventDefault`、`click` の `preventDefault` と `stopPropagation`）は、ページの部品が押しを `onClick` だけで受けていることと合っている（クイズの面に `onPointerDown`・`onMouseDown` の受け手は無い。`src/` の中で `onMouseDown` を持つのは `Slider` だけ）。React の受け手・素の `a[href]`・`summary`・`Link` はどれも止まる。
- 測りは、押しのあとの状態で数える形に揃い、間隔・ずれ・境目・対の確かめが、走らせられる程度に決まっている。

## 指摘

### 1. 診断の答え→次の問の守りは、来訪者の約6割の iOS で働かない見込みが高い。端末に頼らない作り（8章の (i)）があるのに、(iii) で受け入れている（来訪者に届く設計の決めごと。改善指示の理由）

連続の押しの守りは、ブラウザが付ける `mousedown` の `detail >= 2` に頼る。決定はこの数え方を、iOS の Safari では「確かめられないので、塞げなければ塞げない分として残る」と書き、出荷のあとにブラウザ別の率で見る（理由の「診断の答え→次の問に…」・確かめること）。

- 外の資料は、iOS の Safari のタップで `detail` が数えられないことを示している。Leaflet のコード（`DomEvent.DoubleTap.js`）は、タッチで dblclick を出さない環境では click の `detail` がいつも 1 になるとして、時刻で自分で数える。Apple の開発者フォーラム（iOS 13）には、Safari の二度押しが mousedown・mouseup・click を1組だけ出すという報告がある。どれも古く、いまの版で確かめた資料ではない。一方、Android の Chrome は、ジェスチャの tap の数を click の `detail` に渡す（Chromium のコードレビュー 289373009。1・2・3 と数え、3 で止まる）。
- 診断のプレイ面の閲覧は、iOS が 58.9%（iOS の Safari 48.6%）、Android が 30.4%で、ほぼ character-personality である（cycle-318/device-triage.md 1章）。この決定のとおりに作ると、B-620 の本体（二度押しの2打目が、読んでいない次の問に答えを入れ、結果が変わる）は、Android とマウスでは塞がり、来訪者の約6割の iOS ではそのまま残る見込みが高い。決定の「見ること」の問い（どこで無くなりどこで残るか）に対して、この残り方が書かれていない。
- t5a-design.md 8章は、端末の振る舞いに頼る項目を、まず (i)「端末の振る舞いに頼らない作りにして、確かめを要らなくする」で扱い、(iii) は「どちらもできないときに限り」とする。ここでは (i) ができる。タッチ（`pointerType` が `touch` と `pen`）の押しでは、ブラウザの `detail` を使わず、守りが連続を自分で数える。たとえば、答えを入れた押しの離し（`pointerup`）から次の押し下げまでが Android の `DOUBLE_TAP_TIMEOUT`（300ms）未満で、`DOUBLE_TAP_SLOP`（100px）以下の押しを、連続の押しとする（Leaflet と同じ形）。この守りが捨てうる押しは、次の問が出てから約 250ms のうちに（押す時間をふつうの 100ms 前後とした算術）同じ点を押したものだけである。いまの決定の窓（次の問が出てから 550ms）より、ずっと狭い。マウスはいまのとおり `detail` で数える。マウスの連続の時間は来訪者の OS の設定で決まり、来訪者が選んだ設定に従うからである。
- これは「覆す決めごと」の「診断の答え→次の問には窓を入れない」を、タッチの押しについて変える判断になる。cycle-301 の 600ms の窓（切り替わりから数え、すべての押しを捨てた）や、決定が退けた 700ms の窓との違いは、捨てうる時間が読む時間よりずっと短いことと、二度押しの判定の値を OS の定義から取ることである。

次を決めること。

- タッチの押しの連続を守りで数える (i) を採るか、`detail` に頼り続ける (iii) を採るかを、上の事実（iOS の Safari では `detail` が数えられない見込み、iOS が閲覧の 58.9%）を書いたうえで決める。(i) を採るなら、数え方（何から何までの時間か、何 ms か、距離）・試験（`detail` が 1 のままのタッチの2打目が答えを入れないこと。時間と距離の境目の両側）・測りの合否（タッチの行を、`detail` によらず合否に入れる）・GA の `transition: answer` の見方を、それに合わせて書き直す。
- (iii) を残すなら、その理由を書く。あわせて、iOS では守りが働かない見込みが高いことと、そのとき B-620 の何が残るか（iOS の来訪者で、答えを入れる2打目が守りの前と同じに残る）を、決めたこと 3 と「確かめること」に書く。いまの「確かめられない」だけでは、T10 と B-620 の判断が、`quiz_press_guarded` の iOS の率が低いことを、外の資料で見込めたことでなく思わぬ件として読むことになる。

## PM が直して閉じるもの（言い回し。もう一度のレビューは要らない）

- 冒頭の「レビューは review-decision-landing.md〜-3」は、第4回（と、この第5回）まで指すよう直す。

## 前回の指摘の解け方

| 指摘                                     | 解け方                                                                                                                                                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 残す2打目の受け入れと 8章・見張りの文  | 解けた（「覆す決めごと」で、答えを入れるものとページを離れるものを 8章の4つの選び方に回さずに受け入れると書き、(iii) の「見張らずに受け入れた」と、見えるもの（ブラウザ別の率・B-613）を分けた）                |
| 2 直すものから漏れた測り方の文3つ        | 解けた（6章 条件7 の「捕捉の段階の click の受け手で記録する」、knowledge §3 の小節、plan-t5a7.md 5 と t5a-measure.md 5-2 の X・S の数え方を、押しのあとの状態で数える形にすると足した）                         |
| 3 550ms の前提と cycle-301 の害の地位    | 解けた（550ms のうちに読んで押す来訪者がいるかは測っていないと書き、窓と連続の押しの守りの捨てうる範囲の差で理由を立て、cycle-301 の害がコードから導いたもので別の所に 0 件とあることを、地位とあわせて書いた） |
| PM 1 `DOUBLE_TAP_TIMEOUT` の物差しの違い | 解けた（1打目を押している時間が 400ms 未満のときに覆う、と書いた）                                                                                                                                              |
| PM 2 0・90ms の回は守りを試していない    | 解けた（守りを試しているのは 150・300・500ms の回だと記録に書く、と足した）                                                                                                                                     |

## 確かめた事実

- t5a-design.md 8章の「実機に頼る項目」は、(i) 端末の振る舞いに頼らない作り、(ii) Chromium の近似、(iii)「どちらもできないときに限り」受け入れて見張る、の順で扱う（指摘1）。
- cycle-318/device-triage.md 1章と cycle-318/index.md: 診断のプレイ面（15本）の page_view 2,862 のうち、iOS 58.9%（1,687）・Android 30.4%（870）。iOS の Safari 48.6%、アプリの中の Safari 4.9%、iOS の Chrome 5.5%（GA4、2026-09-07〜2026-10-04）（指摘1）。
- t5a-design.md 6章 条件7 は「Chromium のタッチでは、500ms 空けた2打目の `detail` は 1 になる」と書き、近い間隔のタッチの2打目には 2 が付きうることを前提にしている。t5a-measure.md 10-1 はマウスの2打目の `detail` だけを数えており、タッチの2打目の `detail` の値は記録に無い。
- `QuizContainer.tsx` は `window` の捕捉の段階に `click`（押した点）と `mousedown`（2打目で語を選ばない守り）の受け手を置いている。クイズの面の部品は押しを `onClick` で受ける。
- 外の資料（指摘1）:
  - [Leaflet `DomEvent.DoubleTap.js`](https://gitverse.ru/githubmirror/Leaflet/tag/dev/src/dom/DomEvent.DoubleTap.js): タッチで dblclick を出さない環境では click の `detail` がいつも 1 で、時刻で数え直す
  - [Apple Developer Forums「iOS 13 does not emit proper JS events in Safari」](https://developer.apple.com/forums/thread/123331): 二度押しが mousedown・mouseup・click の1組になる報告
  - [Chromium のコードレビュー 289373009](https://codereview.chromium.org/289373009): Android のタップの数を click の `detail` に渡す（1・2・3 で止まる）
  - [MDN `UIEvent.detail`](https://developer.mozilla.org/docs/Web/API/UIEvent/detail): click の `detail` は押しの数
