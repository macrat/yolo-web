# cycle-306 レビュー経過ログ

## 独立レビュー #1（来訪者価値レンズ・reviewer）2026-08-10

評価軸=「クリックを迷う潜在来訪者が、来訪前(検索結果favicon/シェアOGP)の顔から何を受け取るか」。
全指摘は実物を実見/実レンダーして確認した根拠を添える。結論=**改善指示**（必須2件）。

### 実見して問題なしを確認した点

- トップOGP(`tmp/cycle-306/verify/ogp-final-seal.png`): 「試」消滅・朱のy印・清潔。自己貶め除去を確認。
- favicon(`public/favicon.ico`を`convert`で16/32/48抽出し実見): 16pxで朱角丸印＋白抜きserif yが可読・存在感あり・旧(暗地サンy+点)から改善・OGP印と概念統一。
- apple-touch(`public/apple-touch-icon.png`180): 朱全面ブリード＋白抜きy。良好。
- 由来是正(`about/page.tsx:88`): 「よろず=万事・あらゆるもの」へ是正済。よろず屋比喩(lead/店の品書き)と両立。偽装解消を確認。
- 「y」= yolos頭字＝誠実なidentity。字を選ぶ病(cycle-283/304)の再演ではない(形の3案レンダー選択・字は客観的頭字で固定)。
- 店個性(店主/店の品書き)維持は妥当(site-concept.md:15オーナー承認)。過剰解体を避けた線引きは正しい。
- twitter-image.tsxはopengraph-imageを再export→新印を自動継承。
- typecheck/lint/format/該当テスト(44)いずれもクリーン(gates.logのEXIT=2はdev server併走による.next/dev/types破損の偽陽性・単独再実行で0)。

### 必須1（芯を外した見落とし・病の再演）: 伝統色辞典OGPに「試」が残存

- 実物: `tmp/color-ogp.png`（`/dictionary/colors/toki/opengraph-image`を実レンダー）。右上に朱の円環＋「試」が捺されている。
- 原因: `src/app/dictionary/colors/[slug]/opengraph-image.tsx:29` が `SHOP_SEAL_CHAR="試"` を独自にハードコードし `renderFudaImage` に渡す。共通`ogp-image.tsx`の是正から漏れた。
- これは**全伝統色ページ(数百枚・keyword「伝統色」)のog:image/twitter:image**に出る来訪前の顔で、本サイクルの芯(自己貶め「試」を顔から消す)そのものの対象。grounding 1cは「屋/店の文字はOGPに出ない」までしか確認せず**per-route OGPの「試」を走査していない**=不完全scan=cycle-304/305の現状追認/未確認と同型。
- 同ファイルのコメント(10-14・28行)も「未決/B-583で再検討」のまま=本サイクルの決定と矛盾する陳腐化。
- 根拠原則: constitution Rule2/4、cycle-282:125(試は信頼を削る)、cycle-306芯。
- 是正: 当サイクル内で「試」を除去(identity統一 or 中身に即した字)。コメント更新。決定3a(fuda既定「診」は対象外)は色ルートの「試」上書きを射程に含んでいないため、別途対応が要る。

### 必須2（検証の空洞化・病の再演）: /about OGP検証が実物を見ていない＋/aboutが共有画像を持たない

- 成果物`tmp/cycle-306/verify/ogp-final-about.png`は**画像でなくHTMLの404ページ**(dev.log: `GET /about/opengraph-image 404`)。PMは404 HTMLを「about OGP検証済」として保存＝実見したつもりで実物を見ていない(cycle-304/305の致命傷と同型・本サイクルが防ぐと宣言した病)。
- さらに実測(curl): `/about`は`twitter:card=summary_large_image`とog:title/descriptionを出すが**og:image/twitter:imageを一切出さない**→共有時に空の大カード。constitution Rule3を果たす当該ページの来訪前の顔が画像欠落。
- 画像欠落自体は既存(cycle-306はabout由来文のみ変更)だが、検証の空洞化により見逃された。gates.logのEXIT=2をverify成果物として残した点も検証衛生が甘い。
- 是正: (a)検証は必ず実画像を実見する運用の徹底、(b)/aboutの共有画像欠落をbacklog計上 or 本サイクルで是正。

### 推奨: 共有面での印「形」の不統一

- identity印(朱角丸hanko＋白抜きy)はOGP/faviconのみ。fuda-image(結果札・色OGP)は旧形(朱円環＋墨字)のまま。決定が謳う「顔の統一」は部分的。DESIGN.mdは統一の別サイクル送りを明記(誠実)だが、その送りは色ルートの「試」残存(必須1)を認識する前の判断=再考が要る。

### 任意

- OGP印のyはNoto Serif JP 600、faviconは900。小サイズ用の妥当なcraftだが「同一標章」は厳密には近似(形は一貫)。

## 独立レビュー #2（正しさ・回帰・保守性＋来訪者価値・独立の批判者）2026-08-10

前提=レビュー#1の必須2件が是正されたかを含め全体を再点検。付託の変更範囲(5項目)は実物・実レンダー・ゲート実行で検証した。結論=**改善指示**（必須1件が#1から未是正のまま・#1必須2は未記録）。

### 実行・実物で「問題なし」を確認した点（各点に根拠）

- **付託テストのミューテーション感度（必須問1）**: `src/lib/ogp-image.tsx` で `backgroundColor: ACCENT`(L355)/`color: PAPER`(L368)/`borderRadius:22`(L356) は**いずれも印の1要素のみ**で使用（他は INK/PAPER 地・grep 確認）。よって `ogp-image.test.tsx` の `bgColors).toContain(ACCENT)`・`textColors).toContain(PAPER)`・`radii).toContain(22)`・`texts).toContain("y")`＋`not.toContain("試")` は精密で、塗りを消す/別色化/角丸除去/字変更のいずれでも落ちる。`collectText` は配列要素の完全一致で "y" を拾い "yolos.net" とは区別される。撤去した「試」参照は共通OGPとそのテストからは完全に消えている。SSoT: テストのPAPER/ACCENT定数(#f8f7f2/#af3622)は utsuwaHex と一致・本体は import 使用で直書き無し。→ 該当テストは本物の回帰を捕まえる。
- **favicon生成の再現性・正しさ（必須問2）**: `npx tsx scripts/generate-favicons.ts` を実行し、生成物が commit 済み3資産と**バイト単位で一致**（icon.svg / favicon.ico / apple-touch-icon.png すべて `cmp` で identical）。手置きバイナリでなく決定的に再生成可能。favicon.ico は 16/32/48 の PNG 埋め込み3フレーム(ICO パーサで検証)、apple は 180×180 で角ピクセル=ACCENT(全面ブリード)・中央=PAPER(白抜きy)。色は utsuwaHex を import(直書き無し)。SEAL_RADIUS=SEAL*0.22(=17.6/80) と OGP の 22/100 は共に印正方形の22%で比率一貫。opentype.js/@types/opentype.js は **devDependencies**(L48,60)に正しく配置。用途(env非依存の字形再現のため glyph を path 埋め込み)から過剰でなく妥当。
- **配線（必須問3）**: dev server(自前・:3021)で `/` の `<head>` に `rel="icon" /icon.svg`・`rel="icon" /favicon.ico sizes=48x48`・`rel="apple-touch-icon" /apple-touch-icon.png sizes=180x180` の3link**のみ**が出力されることを実HTMLで確認。3資産は 200 + 正しい content-type(svg/x-icon/png)で配信。`src/app/` に favicon.ico/icon._/apple-icon._ の**規約ファイルは無く**、`icons:` 定義は site-metadata.ts の1箇所のみ=二重・競合なし。App Router v16 の public 静的配信＋metadata.icons 方式は正しく機能。
- **コントラスト（必須問4）**: ACCENT #af3622 対 PAPER #f8f7f2 の WCAG コントラスト比=**5.80**(自前計算)。大字(印y)はAA 3.0・通常文字4.5をいずれも上回りAA合格。favicon 16px でも色比は不変で成立。
- **回帰（必須問5・一部）**: `src/lib/fuda-image.tsx` は既定印「診」＋SVG円環の旧形のまま無改変(結果札=中身に即した字・DESIGN.md §4 に「別サイクルで統一」と明記)。DESIGN.md の§参照は §8-5/§8-6 等の**節番号のみ**で cycle-282 型の行番号混入は無い(§8 は番号付き1〜11で 5=一律角丸禁止・6=絵文字禁止と整合)。about 由来文は公開ブログ(2026-02-18)の「よろず=万事・あらゆるもの」と一致。
- **ゲート（必須問6）**: typecheck=exit0(単独クリーン実行)・lint=exit0・prettier(変更ソース6ファイル)=合格・該当テスト(ogp-image/design-gate 計42)=pass・build.log=Compiled successfully＋4142ページ静的生成。PMの `tmp/cycle-306/verify/gates.log` の EXIT=2 は **dev server 併走で `.next/dev/types` が壊れた偽陽性**(単独再実行で0)——ただし完了チェックリストの証跡としては exit0 のクリーン実行ログを残すべき(下記 推奨B)。

### 必須1【#1必須1が未是正・cycle の芯が250ページ分未達】伝統色OGP 250件に「試」が残存

- 実体: `src/app/dictionary/colors/[slug]/opengraph-image.tsx:29` に `const SHOP_SEAL_CHAR = "試";`、L55 で `sealChar: SHOP_SEAL_CHAR` を `renderFudaImage` へ渡す。`fuda-image.tsx:100` は `sealChar` をそのまま印に描くため、**全 250 伝統色ページ**(`getAllColorSlugs().length=250` 実測)の og:image/twitter:image に朱の「試」が捺され続けている。
- これは本サイクルの芯そのもの——decision.md 決定1「OGP器面の印『試』を撤去」・index.md 芯「自己貶め『試の烙印』を来訪前の顔から消す」——の**直接対象**。共通 `ogp-image.tsx` だけ是正し per-route override を残したため、検索/シェアに出る顔から「試」は消えていない。伝統色は grounding が示す検索流入(≈96%)の主要面で、影響は小さくない。
- **レビュー#1 の必須1 で同一箇所(:29)が既に指摘済み**。現在の作業ツリーで未是正=前回指摘が閉じていない。加えてコメント(L10-14・L28)は「未決/B-583で再検討」のまま=decision.md/DESIGN.md/design-gate.test.ts が「cycle-306で確定・B-576済み」と宣言した内容と**矛盾する陳腐化**。DESIGN.md と design-gate.test.ts が実体より先行している。
- 根拠原則: constitution Rule2/4、cycle-282:125(試は信頼を静かに削る)、cycle-306 芯。
- 是正: 250件OGPの「試」を除去する(identity統一の白抜きy印 か、少なくとも「試」の撤去)。ファイル冒頭・L28 のコメントを現決定に合わせて更新。是正後は per-route OGP を1枚実レンダーして「試」消滅を実見。**per-route(app配下)の opengraph-image/twitter-image を全走査したか**を接地に残す(今回 grep で 試 の per-route override は colors のみと確認済——他ルートは既定「診」等で対象外)。

### 必須2【#1必須2が未記録】/about に共有画像が無く、検証も未実施

- `src/app/about/` に opengraph-image/twitter-image が**存在しない**(実測)。/about は constitution Rule3(AI実験の告知)を担う面だがシェア時に og:image を持たない。画像欠落自体は cycle-306 起因ではない(既存)が、レビュー#1 必須2 で「backlog計上 or 本サイクルで是正」とされたにもかかわらず **backlog.md にもキャリーオーバーにも未記載**(実測: 該当エントリ無し・キャリーオーバー欄は空)。見つけた問題を記録する運用(index.md 補足事項チェック)が未達。
- 是正: /about OGP 欠落を backlog に起票(または本サイクルで付与)。今後の検証は必ず実画像を実見する(404 HTML を成果物として保存しない・#1指摘の運用徹底)。

### 推奨A: 共有面の印「形」が不統一（顔の統一の主張が部分的）

- identity印(朱塗り角丸hanko＋白抜きy)は共通OGP/favicon のみ。fuda-image(結果札・250色OGP)は朱円環＋墨字の旧形。decision.md は「顔の統一=来訪者価値の最大化」を確定理由に挙げるが、実際に共有される 250色OGP は別形・別字(必須1解消後も形は旧のまま)。DESIGN.md は統一の別サイクル送りを明記(誠実)だが、その判断は必須1(色OGPの試残存)を認識する前のもの。必須1対応時に「色OGPの印をどう扱うか(identity統一 か 撤去 か 中身字)」を併せて決めるべき。単独 backlog 化でも可。

### 推奨B: 完了ゲートの証跡はクリーン実行で残す

- `gates.log` が EXIT=2(dev server 併走の偽陽性)のまま verify 成果物に残っている。完了チェックリストは「5ゲートが exit0」を要件とするため、dev server 停止後に再実行した exit0 ログを正本として残す(偽陽性ログは誤解を生む)。

### 任意

- `ogp-image.tsx` の角丸例外コメント「§8-5 の 0px 基調に対する印の例外」は、"0px 基調" の出典は §4(L65)で §8-5 は「一律8〜16px角丸の禁止」。参照節がやや不正確(挙動に影響なし)。§4 併記が正確。

## PM の対応方針（第1ラウンドの全指摘に対して）2026-08-10

- **必須1（色OGPの「試」残存）= 是正した。** `dictionary/colors/[slug]/opengraph-image.tsx` の `SHOP_SEAL_CHAR="試"` を `CONTENT_SEAL_CHAR="色"`(内容を表す一字・結果札の既定「診」と平行)へ。陳腐化コメント・テスト・DESIGN.md も更新。**この見落としはわたしの接地scan(1c)の不徹底that——「屋/店」の文字しか見ずper-routeの「試」を走査しなかった=cycle-304/305の型を部分的に再演した。** 是正後、PM自身が `grep '試'`/`sealChar` を全走査(index 4b)し、実残存は色OGPの1箇所のみ(「AI試行錯誤ブログ」は別語・fuda既定「診」は内容印で対象外)と確認。再レビューで実物の「試」消滅を確認する。
- **必須2（検証の空洞化＋/about画像欠落）:**
  - (a) **検証の空洞化=わたしの誤り。** 404 HTMLを「about OGP検証済」として保存した=実物を見ずに検証したつもり(cycle-304/305の致命傷の型)。以後、検証は必ず実画像を実見する。最終確認は**ビルドが静的生成したOGP実体**を`.next`から取り出して実見する(dev server併走による`.next`汚染も回避)。
  - (b) **/about のog:image欠落=既存欠陥**(cycle-306は本文88行のみ変更)。B-583/B-576とは別件のため、**backlog(B-644)へ記録**(レビュー#1「backlog計上 or 是正」・レビュー#2「記録が未達」の双方を満たす)。実態(継承挙動・原因)はクリーンビルドで事実確認してから正確に起票する。
- **推奨A（印の「形」の不統一）:** decision.md 決定4の「顔の統一」は**汎用看板OGP＋faviconのidentity印(朱塗り角丸hanko＋白抜きy)**について正確。内容fuda(診断結果=「診」・伝統色=「色」)は**内容を表す印**という別カテゴリの設計言語で、自己貶めは除去済み(「試」→「色」)。内容fudaまで単一のidentity標章へ寄せる完全な視覚統一は、より大きな設計判断のため**backlog(B-645)へ**(任意・来訪者価値の毀損ではない=内容印は内容を伝える機能を持つ)。
- **推奨B（クリーンなゲート証跡）:** dev server皆無・`.next`削除で `gates-final.log` を正本として残す(偽陽性ログgates.log/gates2.logはtmp内の作業ログ)。
- **任意（§参照 §8-5→§4）:** 必須1 builderに同OGP領域として是正を依頼(反映を確認する)。

## 独立レビュー #3（再レビュー・白紙の新規reviewer・独立の批判者）2026-08-10

第1ラウンド必須2件の是正が本物かを実物で確かめ、かつ全体を再走査した。**すべての点を実物/コマンド/実レンダーで確認した根拠を添える**（「問題なし」の一言で済ませない=cycle-283/304/305の病）。品質5ゲートは PM の `tmp/cycle-306/verify/gates-final.log`（`GATES_FINAL_EXIT=0`・typecheck/lint/format/test 5547 passed/build 4142ページ・全コマンド確認）を参照するに留め再実行しない。結論=**改善指示**（必須1件・第1ラウンド必須2(b)の是正が不完全）。

### 実物で「是正が本物」を確認した点（各点に根拠）

- **必須1（色OGPの「試」）＝本物に是正。** ソース直読で `dictionary/colors/[slug]/opengraph-image.tsx:32` `CONTENT_SEAL_CHAR="色"`・:58 `sealChar: CONTENT_SEAL_CHAR`。冒頭コメント(L11-14)・L28-32 は「cycle-306 で撤去」に更新済で「未決/B-583再検討」の陳腐化は解消。テスト `__tests__/opengraph-image.test.ts:35` `toBe("色")`＋:37 `not.toBe("試")`＝ミューテーション両面。**PMのレンダー(toki)を鵜呑みにせず、実ビルド成果物 `.next/server/app/dictionary/colors/nadeshiko/opengraph-image.body`(status200/image/png)を自分で取り出して実見**——印は朱円環＋「色」・「試」消滅・地は撫子固有色 #dc9fb4。別の色(nadeshiko)で独立確認したので現状追認ではない。
- **必須2(a)（検証の空洞化のやり直し）＝実画像で是正済。** `verify/color-ogp-fixed.png`・`ogp-final-seal.png` は実PNG(404 HTMLではない)。トップOGPは朱塗り角丸hanko＋白抜きy・「試」なし。ゲートも `gates-final.log` が dev server皆無・`.next`削除のクリーン実行で exit0(偽陽性 gates.log/gates2.log とは別に正本を残せている)。
- **全体再走査 item3（他の per-route「試」/旧標章）＝残存なし。** `grep -rn '試' src/` の非ブログ実残は (i)コメント(撤去の説明)、(ii)`fuda-image.test.tsx:198` の override テスト用 `sealChar:"試"`、(iii)ブログ別語(試行錯誤/お試し/試験)のみ。`grep 'sealChar\|SEAL'` で稼働中の印字は identity=`y`(ogp-image.tsx:38)・fuda既定=`診`(fuda-image.tsx:44)・色=`色` の3種のみ。全 `opengraph-image.tsx`/`twitter-image.tsx` を確認(twitter系は全件 opengraph の re-export・humor は fuda 非経由で seal ハードコード無し)。**per-route に「試」相当の残存は無い。**
- **全体再走査 item4（旧ブランド資産）＝残存なし・配線正当。** `public/` のアイコンは `favicon.ico`・`icon.svg`・`apple-touch-icon.png` の3点のみ(いずれも 19:17 生成)。favicon.ico をバイナリ解析し 16/32/48 の PNG3フレームを確認。apple-touch(180)は朱全面ブリード＋白抜きy、icon.svg は紙地#f8f7f2＋朱#af3622角丸(rx17.6=22%)＋白抜きy path=F2。配線は `site-metadata.ts:42-47` の1箇所のみで `src/app/` に規約ファイル無し(二重なし)。実ビルド `about.html`/`index.html` の `<head>` に icon/favicon/apple-touch の3link だけ出力。旧favicon(暗地y+点)は不在。
- **decision.md の判断は来訪者価値から妥当。** 店個性(店主/店の品書き)維持=site-concept.md:15のオーナー承認個性で自己貶めでない。視覚言語維持=印なしでも器面が信頼できる顔。y=yolos客観頭字=誠実identity(字を選ぶ病でない)。内容印(診/色)は「面の中身を体現」でDESIGN.md §4と整合。過剰解体も過少解体も避けた線引きは正しい。

### 必須1【第1ラウンド必須2(b)の是正が不完全: B-644 の原因が事実誤認・スコープが実態の 1/2843】

第1ラウンドは「/about が og:image を持たない」を backlog(B-644)へ記録することを必須2(b)とし、PMは「実態(継承挙動・原因)はクリーンビルドで事実確認してから正確に起票する」と約した。**その起票内容(B-644)が、原因記述もスコープも実態と食い違う。**

- **原因記述が誤り(継承挙動の事実誤認)。** B-644 は原因を「about/page.tsx が独自 `metadata.openGraph` を images 無しで定義し、root(`app/opengraph-image.tsx`)の file-based og:image の**継承を抑止**」と断定。だが実ビルドの反例で否定される: `src/app/dictionary/kanji/[slug]/page.tsx` は **metadata export 自体が無い**(openGraph 上書き無し)にもかかわらず、その実ビルド `.next/server/app/dictionary/kanji/海.html` は `og:image` が **0件**。=root の file-based OGP は**ネストした子ルートに継承されない**(root の画像は `/` のみに適用)。したがって「抑止すべき root 継承」は最初から存在せず、/about に og:image が無いのは openGraph 上書きのせいではなく、**file-based OGP が自セグメントにしか効かない**ため(自前の opengraph-image を持たない全ルートで og:image は不在)。**この誤認は本サイクルが断つと宣言した病そのもの**(AP-WF12=フレームワーク挙動を検証せず思い込みで記述／cycle-304/305=未確認で追認)。PM が「クリーンビルドで事実確認して起票」と述べた継承挙動が、実ビルドで反証される。
- **スコープが実態の約 1/2843。** 実ビルド全 HTML(3299)を走査すると、`twitter:card=summary_large_image`(グローバル既定 `site-metadata.ts:55`)を出しつつ `og:image` を持たない=**空の大カードになるページが 2843件**。内訳は /about だけでなく **/tools・/dictionary・/play・/blog の各索引、blog の全カテゴリ/タグ/ページネーション、そして kanji+yoji 辞典の全エントリ(約2786)**。B-644 は /about 1件のみを記録し、是正策も「about専用opengraph-image.tsx付与 か about の metadata.openGraph.images明示」と**about限定**——このまま将来サイクルが着手すると /about だけ直り 2842件が空カードのまま残る。共有・検索の瞬間に最初に見える面(DESIGN.md §4「看板」は索引・コンテンツ面も器面基調の看板を持つ前提)で、来訪者価値の毀損は小さくない。
- 根拠原則: constitution Rule2/4、DESIGN.md §4「看板」、AP-WF12/AP-WF09(達成していない網羅性を主張しない=「原因確定」と書くなら 2843件の実態と継承挙動を突き合わせる)、CLAUDE.md(未確認情報は将来サイクルへ誤りを伝播させる)。
- **是正(本サイクル内・コード改修は不要)**: B-644 を事実に合わせて書き直す。(1)原因=「file-based opengraph-image は自ルートセグメントにのみ適用され子ルートへ継承されない＋グローバル `twitter.card=summary_large_image`(site-metadata.ts:55)が画像不在の全ルートで空の大カードを生む」、(2)スコープ=索引/辞典/blog一覧等を含む約2843件の系統的欠陥(/about はその一例)、(3)是正方針=個別 opengraph-image 付与か・索引/辞典に共通の器面看板を配線か・画像を持たない面は `card:"summary"` へ落とすか、を将来サイクルで判断。**2843件の実修正を本サイクルで行う必要はない**(既存・本サイクルの芯=印/faviconの外側)。要求は記録の正確化のみ。

### 推奨（本サイクルで直すのが望ましいが承認の絶対条件ではない）

- **§参照の是正が片側だけ(第1ラウンド任意の反映漏れ)。** 第1ラウンド任意で指摘の「§8-5→§4」は**ソース `ogp-image.tsx:41` では §4 に是正済**だが、**テスト `ogp-image.test.tsx:159` のコメントは依然「§8-5 の 0px 基調に対する印の例外」のまま**。DESIGN.md 実物で §4(L65)=「角丸: 0px 基調」・§8 項5(L110)=「一律8〜16px角丸の禁止」を確認済——0px基調の出典は §4 なのでテストコメントも §4 が正確。挙動影響なし・コメントのみ。第1ラウンドの是正が同一内容で1ファイル取りこぼされている。

### 任意

- `fuda-image.test.tsx:198` が override テストの入力に `sealChar:"試"` を使い `expect(texts).toContain("試")`。機構テストとして正しく無害だが、本サイクルで顔から消した当の一字をテスト資産に残す形。中立な一字でも機構は検証でき、皮肉を避けられる。
- `dictionary/colors/[slug]/__tests__/opengraph-image.test.ts` は export 定数 `CONTENT_SEAL_CHAR` の値だけを検証し、それが実際に `sealChar` へ配線されている(レンダーに出る)ことは検証しない。`sealChar:"試"` と定数を無視してハードコードする変異は捕まらない。jsdom で Satori 実レンダーが困難な事情から許容範囲だが、定数値検証とレンダー配線検証の差は認識しておく(共通 OGP 側 `ogp-image.test.tsx` は collectText で実配線を検証済)。

### 結論

**改善指示。** 必須1(色OGP「試」→「色」)・必須2(a)(実画像での検証やり直し)・favicon F2・全体再走査(他ルート「試」/旧資産なし)は**本物に是正済**で、独立の実ビルド成果物でも確認した。ただし**第1ラウンド必須2(b)の是正が不完全**——B-644 の原因記述が実ビルドで反証される事実誤認(root継承は存在しない)であり、かつ /about 単独として記録されているが実態は約2843件の系統的な空カード欠陥。本サイクルの芯である「未確認で追認しない」病に触れる記録の不正確さのため、B-644 の原因・スコープ・是正方針の書き直し(コード改修は不要)を求める。修正後は前回・今回の指摘に限らず全体を再走査して再レビューすること。

## 独立レビュー #4（最終・白紙の新規reviewer・独立の批判者）2026-08-10

第2ラウンド(#3)の必須=「B-644 の記録の事実誤認・スコープ過小の書き直し」が本物に閉じたかに焦点を絞って確認。**全点を既存 `.next` 成果物の grep とソース直読で一次確認**(dev server起動・`npm run build`はしない=過去の `.next/dev/types` 破損の偽陽性回避)。品質5ゲートは実行しない(PMが隔離環境で再実行予定)。結論=**承認可**。

### 確認点1: B-644 の記述が実態に整合（`docs/backlog.md:13`）——問題なし

第2ラウンドで否定された旧誤認「about独自metadataがroot継承を抑止」は**backlogから完全に消え**、実証ベースの正しい原因に書き直されている(旧文言 `継承を抑止`/`独自metadata` は backlog に不在。review-log.md:107 に残るのは"見つけた誤り"の履歴記録=適切)。以下を実成果物で一次確認:

- **原因(root OGPは子継承されない)**: `src/app/opengraph-image.tsx` は存在し、root `.next/server/app/index.html` は og:image を持つ(`/opengraph-image?...`)。一方 metadata override の無い kanji エントリ `.next/server/app/dictionary/kanji/一.html`=og:image **0件**、索引 `dictionary/kanji.html` も **0件**。=root の file-based OGP は `/` のみに効き子ルートへ継承されない。B-644 が挙げる実証例(`dictionary/kanji.html` の og:image=0)は実物と一致。
- **globalなsummary_large_image＋og:image不在**: `site-metadata.ts:55` に `card: "summary_large_image"`(全ページ共通)を実見。`.next/server/app/about.html` は summary_large_image を出しつつ og:image **0件**=空の大カード。og:image を持つのは自前 `opengraph-image.tsx` を持つルートのみ(色 `dictionary/colors/ai.html`=1件、root=1件)。
- **スコープ(約2843件・具体面の列挙)**: 全HTML 3299件を走査。summary_large_image=3298件、うち og:image 不在=**2845件**(自分でループ集計)。B-644 の「3297中2843」と1〜2件差だがタイトルは「約2843」と概数明記=許容範囲。列挙面(/about・kanji/yoji全エントリ・tools/dictionary/play/blog各索引・blogカテゴリ/タグ/ページネーション)は summary_large_image かつ og:image 不在の内訳と整合。
- **是正方針(コード改修は別サイクル)**: B-644 は「本サイクルではコード改修せず記録のみ」「是正(別サイクル): フォールバック／`summary`降格／個別付与——設計判断が要る」と明記。本サイクルの芯(印/favicon)の外という切り分けも妥当。
- **AP-WF12(未検証のフレームワーク断定)を排しているか**: 継承挙動の記述に「(実証: …og:image=0)」と一次証拠を併記し、思い込みでなく観測に接地している。第2ラウンドが指摘した病は解消。

### 確認点2: テストコメントの§参照（`src/lib/__tests__/ogp-image.test.tsx:159`）——問題なし

L159 のコメントは「§4「角丸」の 0px 基調に対する「印」の例外・borderRadius 22」に是正済(旧「§8-5」ではない)。ソース `ogp-image.tsx:41` の §4 と整合。第2ラウンドの推奨(片側取りこぼし)が閉じた。

### 確認点3: 残余MUST／記録類の事実誤認・陳腐化——なし

- 旧誤認 `継承を抑止`/`独自metadata`/`root継承` を backlog・cycle-306 doc群で grep。実結果は review-log.md の #3(誤りを見つけた履歴)のみ=保持は適切で、正典(backlog)には伝播していない。
- index.md:43-44 の B-644/検証の記述は「/about欠落をbacklogへ」「実画像で検証やり直し」で現状と整合。
- 第1〜3ラウンドで実ビルド成果物により確認済の substantive 是正(色OGP 試→色・favicon F2・OGP印y・about由来是正)は#3が確認済のため蒸し返さない。

### 任意（承認の条件ではない・記録すれば足りる）

- B-644 本文の具体数「3297/2843」は本レビュー時点の実測「3298/2845」と1〜2件差。タイトルの「約」で吸収されるが、本文側も概数記号を添えるか実測に合わせるとより正確。挙動・結論に影響なし。

### 結論

**承認可。** 第2ラウンド(#3)の必須(B-644 の原因・スコープ・是正方針の書き直し)は実成果物で反証されない正確な記述へ是正され、推奨(テストコメント§4)も閉じた。記録類に旧誤認の伝播・陳腐化は残っていない。コード面の substantive 是正は#3までで実ビルド確認済。品質5ゲートの隔離再実行(exit0ログ)はPMの完了手続きに委ねる。

## ワークフローAP点検（完了手続き・reviewer）2026-08-10

`docs/anti-patterns/workflow.md` の全項目を一つずつ、本サイクルの index.md／decision.md／grounding.md／review-log.md と**実体（ソース・ビルド成果物・backlog・git 状態）**で照合。文書の帳尻合わせでなく、AP が引き起こした実体の不整合が残っていないかを疑って確認した。dev server 起動・`npm run build` はしていない（既存成果物・ソース・docs の読解で確認）。

### 実体で裏取りした主要な主張（一致を確認）

- **色OGP「試」撤去**: `dictionary/colors/[slug]/opengraph-image.tsx:32` `CONTENT_SEAL_CHAR="色"`・:58 `sealChar` 配線・テスト `opengraph-image.test.ts:35,37`（`toBe("色")`＋`not.toBe("試")`）。冒頭コメントも「cycle-306 で撤去」に更新済＝陳腐化なし。→ index/decision/review-log の「試→色」主張は実体と一致。
- **identity 印 y**: `ogp-image.tsx:38` `SEAL_INITIAL="y"`・:356/374 で描画。`ogp-image.test.tsx` は ACCENT 塗り／PAPER 白抜きを印1要素に限定してミューテーション検出。→「試撤去・y印統一」は実体と一致。
- **favicon(B-576)**: `public/{favicon.ico,icon.svg,apple-touch-icon.png}` 3点実在（19:17 生成）・`scripts/generate-favicons.ts` 実在・`opentype.js`/`@types/opentype.js` は devDependencies。配線は `site-metadata.ts:42-47` の1箇所のみ、`src/app/` に規約ファイル無し（二重なし）。→ 主張と一致。
- **由来是正(c)**: `about/page.tsx:88` は「万事・あらゆるもの」へ是正済。差分は同一 `<p className={styles.text}>` 内の平文テキスト置換のみ＝レイアウト/色/ダーク挙動に影響なし（AP-WF05 のデザイン影響なし）。店フレーミング(d)は維持。
- **DESIGN.md §4 / design-gate.test.ts**: §4 は identity 印(朱塗り角丸hanko＋白抜きy)と内容fuda印(診/色)を明確に別カテゴリとして定義し「cycle-306 で確定/撤去」を明記。design-gate.test.ts の `TODO(B-576)` は「B-576 済み・cycle-306」へ更新済。→ 整合ファイル群（DESIGN/test/ソース/decision）に不一致・陳腐化なし（AP-WF11 の並べ読み観点で確認）。
- **全5ゲート exit0**: 正本 `verify/gates-final2.log` を実読。typecheck(`tsc --noEmit`)・lint(`eslint .`)・format:check（All matched files use Prettier code style!）・test（322 files / 5547 passed）・build（Compiled successfully・4142/4142 静的生成）が dev server 皆無・release=635ffce の隔離実行で `GATES_FINAL2_EXIT=0`。→ index.md:47 の「全5ゲート exit0/build 4142ページ」主張は実物で裏取り可。過去 cycle-282 型の `.next/dev/types` 偽陽性ではないことを確認。
- **他ルート「試」残存なし**: `grep -rn '試'` の非ブログ実残は (i) 撤去説明コメント、(ii) fuda-image.test.tsx の override テスト入力、(iii) ブログ/敬語/クイズ/常用漢字データ等の別語（「試行錯誤」「試着」「お試し」「常用漢字の一字」）のみ。稼働中の per-route `sealChar` override は colors の1箇所のみ。→「全走査で残存なし」は実体と一致。

### workflow.md 各項目の該当有無

- **AP-WF01（最終修正後のレビュー・全指摘対応）**: 該当なし。第1〜3ラウンドの必須（色OGP試/検証空洞化/B-644事実誤認）はすべて是正され、最終 #4 が実成果物で反証されないことを独立確認。最後の実体変更（B-644 書き直し）後に #4 レビューが走っている。
- **AP-WF02（来訪者価値レンズ・過去失敗の参照）**: 該当なし。全ラウンドが「クリックを迷う潜在来訪者が受け取るもの」を評価軸に据え、cycle-282/283/304/305 の失敗を明示参照。
- **AP-WF03（builder への過剰具体指示）**: 該当なし（本点検の資料内に literal コード確定の痕跡なし。実装は 3a/3b/3c で委譲）。
- **AP-WF04（正式完了通知の受領・構造的変更の実態確認）**: 該当なし。色OGP是正は per-route の実残存を grep 全走査（index 4b）で確認、favicon は生成器の再現・配線を実HTMLで確認。
- **AP-WF05（UI変更の全画面 mobile/PC×light/dark 撮影）**: 該当なし。ページUIのデザイン変更は無く（about は平文テキスト置換のみ）、favicon/OGP は固定サイズのプレビュー資産で実サイズ実見（favicon 16/32/48・apple180・OGP実PNG）で担保済。
- **AP-WF06（サブエージェントへ渡す事実の事前確認）**: 該当なし。外部仕様（Google favicon・Next.js icon 規約）は一次資料 URL で確認、GA4 は BigQuery 実測。
- **AP-WF07（1エージェント1タスク／同一ファイル並行アサイン）**: 該当なし。実装は OGP/favicon/文言で別タスク分割、触るファイルが分離。
- **AP-WF08（PMの代行・成果物改変）**: 該当なし。色OGP是正は builder へ委譲。PM が直接編集したのは PM 所有の SSoT（backlog の B-644 記述・index/decision/grounding/review-log）で役割逸脱なし。
- **AP-WF09（形式的通過・達成していない網羅性の主張）**: 該当なし。「全走査」「全5ゲートexit0」「顔の統一」等はいずれも件数/成果物と突き合わせ済（走査残存数・4142ページ・identity印を汎用看板+faviconにスコープ限定し fuda印は B-645 送りと明記）。網羅主張が実測で裏取りできる。
- **AP-WF10（SendMessage でのタスク継続）**: 該当なし。各ラウンドは白紙の新規 reviewer。
- **AP-WF11（PM 自身の通読・複数ファイル並べ読み）**: 該当なし。PM は最終成果物（OGP実PNG・favicon実フレーム・about）を実見（index 5）、DESIGN/test/ソース/decision の整合も取れている。
- **AP-WF12（計画中に参照する事実の実体確認・他タスク状態・FW挙動）**: 過去に一度 B-644 で root OGP 子継承を未検証断定した経緯があるが、#3 で捕捉→実ビルドで検証し是正済。現 backlog の B-644 は「(実証: metadata override 無しの dictionary/kanji.html も og:image=0)」と一次証拠を併記し、思い込み記述は解消。→ 現時点で該当なし。
- **AP-WF13（並行 builder のスコープ越境）**: 該当なし（証跡なし）。
- **AP-WF14（reviewer の一次集計独立実行）**: 該当なし。#4 が全HTML 3299 を自らループ集計（summary_large_image=3298・og:image不在=2845）して B-644 の数値を独立検証。
- **AP-WF15（完了後補修の振り分け軸）**: 該当なし。B-644/B-645 はレビュー中に発見し「来訪者影響／芯の範囲外／設計判断を要する規模」で別サイクル送りと明示判断。cycle-305 型の観測サイクル乱立・本丸後回しの再演なし。
- **AP-WF23（検証前の完了宣言）**: 該当なし。`completed_at: null`・末尾チェックリスト全未チェック＝完了未宣言。本点検は完了処理の前段で、ゲートは既に隔離 exit0 で回っている。
- **AP-WF24（是正駆動をオーナーに帰属）**: 該当なし。cycle-306 doc 群の「オーナー」出現は全て (i) site-concept.md:15 の SSoT 引用（店個性の維持根拠・実体で確認）、(ii) cycle-283 でのオーナー介入という史実の記録、のみ。本サイクルの是正はレビュー/来訪者価値/芯が駆動源として書かれ、駆動源のオーナー帰属なし。
- **AP-WF27（内心・原因の記録裏付けなき断言）**: 該当なし。プロセス反省（接地scan不徹底・404 HTML誤認・FW挙動断定）は可視の tool 痕跡（残存件数・dev.log の 404・実ビルド反証）で裏付く記述に留まる。

### 任意（承認の条件ではない・記録すれば足りる）

- **B-644 の件数が内部で微差**: backlog の**タイトル「約2843」**と**本文「約2845」**、および index.md キャリーオーバー「約2843」が不一致（いずれも「約」・#4 実測は2845）。挙動・結論に影響なく「約」で吸収されるが、正典（backlog）内でタイトルと本文が別数字なのは記録衛生上そろえるのが望ましい。完了処理の編集ついでに片方へ統一すれば足りる。

### 結論

**ワークフロー上の必須該当なし。** workflow.md の全項目を実体照合した結果、AP が引き起こしたプロダクト/記録の実体不整合は残っていない。過去に本サイクル内で発生した部分再演（接地scanの不徹底＝AP-WF09/12型、検証空洞化＝cycle-304/305型、B-644のFW挙動断定＝AP-WF12）はいずれも独立レビューが来訪者へ届く前に捕捉し、実体（ソース・実ビルド成果物・backlog）で是正済であることを確認した。残るのは任意1件（B-644 件数の内部微差）のみ。**問題なし（要対応なし・任意1件は完了処理で随意）。**
