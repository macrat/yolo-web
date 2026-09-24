# デザイン刷新が依拠する外部仕様の確認結果

確認日: 2026-09-24

本書は一次資料で確認した事実のみ。案・評価は含まない。

- 取得方法: WebFetch、WebSearch、curl（取得した原文を HTML からテキストに変換して読んだ）、GitHub コード検索。以下の「確認した URL」はすべて 2026-09-24 に取得した。
- 引用は原文（英語）のまま。要旨は日本語で書く。

---

## 1. WCAG 2.2 の達成基準

### 文書の状態

- 確認した URL: https://www.w3.org/TR/WCAG22/ （取得日 2026-09-24）
- 現行版は **W3C Recommendation 12 December 2024**。This version は https://www.w3.org/TR/2024/REC-WCAG22-20241212/ 。
- WCAG 3 の状況
  - 確認した URL: https://www.w3.org/TR/wcag-3.0/ （取得日 2026-09-24）
  - **Working Draft（2026-09-10 付）** である。原文: "This is a draft document and may be updated, replaced, or obsoleted by other documents at any time."
  - WCAG 2 との関係: "WCAG 3 is a successor to Web Content Accessibility Guidelines 2.2 but does not deprecate WCAG 2."
  - 勧告になる時期は明記されていない。

### 各達成基準の文言（WCAG 2.2 本文からの抜粋。Note も本文から写した）

**1.3.4 Orientation（表示の向き）(AA)**
"Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific display orientation is essential."

- Note: 向きの固定が必須な例として、小切手、ピアノアプリ、プロジェクターやテレビ用のスライド、VR コンテンツを挙げている。

**1.3.5 Identify Input Purpose（入力目的の特定）(AA)**
"The purpose of each input field collecting information about the user can be programmatically determined when: The input field serves a purpose identified in the Input Purposes for user interface components section; and The content is implemented using technologies with support for identifying the expected meaning for form input data."

**1.4.3 Contrast (Minimum)（コントラスト(最低限)）(AA)**
"The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for the following:"

- Large Text: "Large-scale text and images of large-scale text have a contrast ratio of at least 3:1"
- Incidental: 次のテキストにはコントラストの要件がない。非アクティブな UI コンポーネントの一部、純粋な装飾、誰にも見えないもの、重要な他の視覚コンテンツを含む画像の一部。
- Logotypes: "Text that is part of a logo or brand name has no contrast requirement."
- 定義 "large scale (text)": "with at least 18 point or 14 point bold or font size that would yield equivalent size for Chinese, Japanese and Korean (CJK) fonts"
- 定義 "contrast ratio": "(L1 + 0.05) / (L2 + 0.05)"

**1.4.4 Resize Text（テキストのサイズ変更）(AA)**
"Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality."

**1.4.10 Reflow（リフロー）(AA)**
"Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels. Except for parts of the content which require two-dimensional layout for usage or meaning."

- Note 1: "320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom."
- Note 2: 2 次元レイアウトが必要な例として、地図、図、動画、ゲーム、プレゼンテーション、データテーブル（個々のセルは含まない）、操作中にツールバーを表示し続ける必要がある UI を挙げている。これらの部分には 2 次元スクロールを用意してよい。

**1.4.11 Non-text Contrast（非テキストのコントラスト）(AA)**
"The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s):"

- User Interface Components: "Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author"
- Graphical Objects: "Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed."

**1.4.12 Text Spacing（テキストの間隔）(AA)**
"In content implemented using markup languages that support the following text style properties, no loss of content or functionality occurs by setting all of the following and by changing no other style property:"

- 行の高さ（行間）: フォントサイズの 1.5 倍以上
- 段落の後の間隔: フォントサイズの 2 倍以上
- 文字間隔（トラッキング）: フォントサイズの 0.12 倍以上
- 単語の間隔: フォントサイズの 0.16 倍以上
- Exception: これらのプロパティの一部を使わない言語・文字体系は、その組み合わせに存在するプロパティだけで適合できる。
- Note 1: "Content is not required to use these text spacing values."
- Note 2: 段落冒頭の字下げなど、言語ごとに異なる間隔設定がある。その言語圏のガイダンスに従うことを推奨している。

**1.4.13 Content on Hover or Focus（ホバー又はフォーカスで表示されるコンテンツ）(AA)**
ホバーやフォーカスで追加コンテンツが表示されるときは、次の 3 条件をすべて満たす。

- Dismissible: ホバーやフォーカスを移動しなくても追加コンテンツを消せる仕組みがある。ただし、入力エラーを伝える場合や、他のコンテンツを隠したり置き換えたりしない場合を除く。
- Hoverable: ポインターを追加コンテンツの上へ動かしても消えない。
- Persistent: ホバーやフォーカスが外れる、ユーザーが消す、または情報が無効になるまで表示が続く。
- Exception: 表示を UA が制御し、制作者が変更していない場合。
- Note 1: title 属性によるブラウザのツールチップは UA 制御の例である。
- Note 3: フォーカスで表示されるスキップリンクのように、コンポーネント自身が表示されるだけのものは対象外。

**2.2.2 Pause, Stop, Hide（一時停止、停止、非表示）(A)**

- 動く・点滅する・スクロールする情報で、(1) 自動的に始まり、(2) 5 秒より長く続き、(3) 他のコンテンツと並行して表示されるものには、一時停止・停止・非表示の仕組みが必要。動きが必須な活動の一部である場合を除く。
- 自動更新する情報で、(1) 自動的に始まり、(2) 並行して表示されるものには、一時停止・停止・非表示、または更新頻度を調整する仕組みが必要。必須の場合を除く。
- Note 2: 非干渉（Conformance Requirement 5）の対象である。つまりページ上のすべてのコンテンツがこの基準を満たす必要がある。
- Note 4: プリロード中のアニメーションは、その間どのユーザーも操作できず、進捗を示さないと混乱を招く場合は「必須」とみなせる。

**2.3.1 Three Flashes or Below Threshold（3 回の閃光、又は閾値以下）(A)**
"Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds."

- 非干渉の対象である。

**2.4.7 Focus Visible（フォーカスの可視化）(AA)**
"Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."

**2.4.11 Focus Not Obscured (Minimum)（フォーカスが隠されない(最低限)）(AA、2.2 で新設)**
"When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content."

- Note 1: ユーザーが位置を変えられる UI では、初期位置だけを評価する。
- Note 2: ユーザーが開いたコンテンツがフォーカスを隠していても、フォーカスを動かさずに表示できるなら、制作者のコンテンツで隠されているとはみなさない。

**2.5.5 Target Size (Enhanced)（ターゲットのサイズ(拡張)）(AAA)**
"The size of the target for pointer inputs is at least 44 by 44 CSS pixels except when:"

- Equivalent: 同じページに 44×44 以上の同等のリンクやコントロールがある。
- Inline: ターゲットが文やテキストブロックの中にある。
- User Agent Control: サイズを UA が決め、制作者が変更していない。
- Essential: そのターゲットの表示方法が、伝える情報にとって必須である。

**2.5.7 Dragging Movements（ドラッグ動作）(AA、2.2 で新設)**
"All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author."

- Note: ポインター操作を解釈する Web コンテンツに適用する。UA や支援技術の操作には適用しない。

**2.5.8 Target Size (Minimum)（ターゲットのサイズ(最低限)）(AA、2.2 で新設)**
"The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:"

- Spacing: "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target;"
- Equivalent: "The function can be achieved through a different control on the same page that meets this criterion;"
- Inline: "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text;"
- User Agent Control: サイズを UA が決め、制作者が変更していない。
- Essential: "A particular presentation of the target is essential or is legally required for the information being conveyed."
- Note 1: スライダーやカラーピッカーのように、位置で値を選ぶターゲットは 1 つのターゲットとみなす。
- Note 2: インラインターゲットの line-height は、テキストの流れに垂直な方向で解釈する（縦書きなら水平方向）。
- 定義 "target": 重なり合うターゲットでは、重なった部分をサイズに含めない。ただし同じ動作をするか同じページを開く場合は含める。

**3.3.7 Redundant Entry（冗長な入力）(A、2.2 で新設)**
"Information previously entered by or provided to the user that is required to be entered again in the same process is either: auto-populated, or available for the user to select."

- 例外: 再入力が必須な場合、コンテンツのセキュリティ確保に必要な場合、以前の入力が有効でなくなった場合。

---

## 2. Google Fonts の書体

- 確認した資料（いずれも取得日 2026-09-24）
  - https://fonts.google.com/metadata/fonts （Google Fonts 公式のメタデータ JSON）
  - https://raw.githubusercontent.com/google/fonts/main/ofl/zenantique/METADATA.pb
  - https://raw.githubusercontent.com/google/fonts/main/ofl/bizudpgothic/METADATA.pb
  - https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/METADATA.pb
  - CSS API の実レスポンス: https://fonts.googleapis.com/css2?family=Zen+Antique&display=swap と https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap
- 補足: specimen ページ（fonts.google.com/specimen/Zen+Antique）は JavaScript で描画されるため、WebFetch では本文を取得できなかった。

| 書体          | 提供状況                          | ウェイト / 軸                                        | subsets（メタデータ）                                                                  | ライセンス | デザイナー                   |
| ------------- | --------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- | ---------------------------- |
| Zen Antique   | 提供中（lastModified 2025-09-08） | 400 のみ（normal）                                   | cyrillic, greek, **japanese**, latin, latin-ext, menu                                  | OFL        | Yoshimichi Ohira             |
| BIZ UDPGothic | 提供中（lastModified 2026-01-06） | 400, 700（normal）                                   | cyrillic, greek-ext, **japanese**, latin, latin-ext, menu                              | OFL        | Type Bank Co., Morisawa Inc. |
| IBM Plex Sans | 提供中（lastModified 2025-09-08） | 可変フォント。wght 100–700、wdth 75–100。italic あり | cyrillic, cyrillic-ext, greek, latin, latin-ext, vietnamese, menu（**japanese なし**） | OFL        | Mike Abbink, Bold Monday     |

- 参考: 日本語を含む別ファミリー **IBM Plex Sans JP** もある。ウェイトは 100–700 の 7 段階で、subsets に japanese を含む。

**CSS API が japanese をどう配信するか（実レスポンスで確認）**

- Zen Antique の CSS には @font-face が 122 個ある。
  - 118 個は unicode-range で分割された番号付き woff2 である（例: ファイル名 `...zw.2.woff2`）。直前にサブセット名のコメントがない。
  - 残り 4 個に `/* cyrillic */` `/* greek */` `/* latin-ext */` `/* latin */` のコメントが付き、ファイル末尾（945 行目以降）に並ぶ。
  - CSS に `/* japanese */` というブロックはない。
- BIZ UDPGothic（400;700）の CSS には @font-face が 248 個あり、1 ウェイトあたり 124 個である。

---

## 3. Next.js の `next/font/google`

- リポジトリで確認したバージョン
  - package.json: `"next": "^16.3.0"`
  - node_modules/next/package.json: `"version": "16.3.0"`
- 確認した資料
  - 同梱ドキュメント: /home/user/yolo-web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md （16.3.0 同梱）
  - Web 版: https://nextjs.org/docs/app/api-reference/components/font （取得日 2026-09-24、ページのメタデータは `version: 16.3.6`）。記述内容は同梱版と同じだった。
  - 実装: node_modules/next/dist/compiled/@next/font/dist/google/ と node_modules/next/dist/server/font-utils.js

### ドキュメントに書いてあること

- **display**: "`'auto'`, `'block'`, `'swap'`, `'fallback'` or `'optional'` with default value of `'swap'`."
- **preload**: "The default is `true`."
- **subsets**: "Fonts specified via `subsets` will have a link preload tag injected into the head when the `preload` option is true, which is the default."
  - さらに "Failing to specify any subsets while `preload` is `true` will result in a warning."
- **adjustFontFallback（next/font/google の場合）**: "A boolean value that sets whether an automatic fallback font should be used to reduce Cumulative Layout Shift. The default is `true`."
- **CJK について**: 日本語・中国語・韓国語、CJK、unicode-range、size-adjust への言及は、ドキュメント（同梱版・Web 版とも）に**なかった**。

### 16.3.0 の実装で確認したこと（ドキュメントではなくソースコード）

**subsets に `japanese` を指定できない**

- `google/font-data.json` に登録された subsets に japanese が含まれていない。
  - Zen Antique: cyrillic, greek, latin, latin-ext
  - BIZ UDPGothic: cyrillic, greek-ext, latin, latin-ext
  - 参考として Noto Sans JP も japanese を含まない。
- `validate-google-font-function-call.js` は、この一覧にない subset を指定すると次のエラーを出す。
  - エラー文: "Unknown subset `${subset}` for font ..."
- preload が有効で subsets を指定しないと、次のエラー文を出す。
  - エラー文: "Preload is enabled but no subsets were specified ... Please specify subsets or disable preloading if your intended subset can't be preloaded."
  - この文面の中で `preload: false` の使用に触れている。

**preload の対象は名前付きサブセットだけ**

- `find-font-files-in-css.js` は、Google の CSS にある `/* subset名 */` コメントを上から追い、指定した subsets に一致するファイルだけを preload の対象にする。
- 上記 2 のとおり、日本語の分割ファイルにはサブセット名のコメントがない。そのため subsets に何を指定しても、日本語の分割ファイルは preload の対象にならない。
- ここまでは実装とレスポンスからの事実である。「preload: false が必要」とドキュメントに明記されているわけではない。

**unicode-range による分割配信**

- Google の CSS に含まれるすべての @font-face の font ファイルをダウンロードして、自サイトから配信する（self-host）。
- Google の CSS に書かれた unicode-range は、生成される CSS にも残る。
- これを説明するドキュメントの記述はない。

**adjustFontFallback / size-adjust の計算方法**

- `getFallbackFontOverrideMetrics` → `calculateSizeAdjustValues` が、`capsize-font-metrics.json` にあらかじめ用意された値から fallback 用の @font-face を生成する。
- 生成される記述子は ascent-override、descent-override、line-gap-override、size-adjust。
- fallback 先の書体
  - category が serif の書体: Times New Roman
  - それ以外: Arial
- size-adjust の計算: 対象書体の xWidthAvg ÷ fallback 書体の平均文字幅（ラテン文字の平均幅にもとづく）。
- 3 書体とも capsize-font-metrics.json にメトリクスがある。
  - zenAntique: category serif、unitsPerEm 1000、xWidthAvg 488
  - bIZUDPGothic: category sans-serif、unitsPerEm 2048、xWidthAvg 1152
  - iBMPlexSans: エントリあり
- 値が見つからない場合は `Failed to find font override values for font` をログに出す（`Log.error`）。

---

## 4. iOS Safari で 16px 未満の入力欄にフォーカスすると自動ズームする挙動

**Apple / WebKit のドキュメント・公式ブログでは確認できなかった。**

- 検索: webkit.org と developer.apple.com を対象に WebSearch した。
- https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/ （取得日 2026-09-24）を読んだ。ピンチズームについて "Now, we ignore the `user-scalable`, `min-scale` and `max-scale` settings." という記述はあるが、フォーカス時の自動ズームや 16px への言及はない。
- bugs.webkit.org でも該当する記述は見つからなかった。

**代わりに確認できた最も信頼できる資料: WebKit のソースコード（一次資料）**

- URL: https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebKit/UIProcess/API/ios/WKWebViewIOS.mm
  - 取得日 2026-09-24、main ブランチ。GitHub コード検索の索引 ref は 25a956c1a79e8076c25c3a0882366d97eb5a3247。
- `-_zoomToFocusRect:selectionRect:fontSize:minimumScale:maximumScale:allowScaling:forceScroll:` の中に次のコードがある（watchOS 以外）。
  ```
  // Zoom around the element's bounding frame. We use a "standard" size to determine the proper frame.
  const double webViewStandardFontSize = 16;
  scale = clampTo<double>(webViewStandardFontSize / fontSize, minimumScale, maximumScale);
  ```
  - つまりフォーカス時のズーム倍率を「16 ÷ 要素のフォントサイズ」で求め、minimumScale と maximumScale の範囲に収めている。
- 渡される fontSize は Source/WebKit/WebProcess/WebPage/ios/WebPageIOS.mm で決まる。
  - `information.nodeFontSize = ...renderer->style()...fontDescription().usedSize();`
  - つまりフォーカスした要素の実際のフォントサイズである。
- これはソースコードから読み取れる事実であり、Apple が公開している仕様ではない。
- 二次資料の例: CSS-Tricks「16px or Larger Text Prevents iOS Form Zoom」 https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/ （検索結果に出たことだけ確認。本文は取得していない）

---

## 5. `<meta name="theme-color">` の media 属性と Next.js の Viewport API

### HTML Living Standard

- 確認した URL: https://html.spec.whatwg.org/multipage/semantics.html の "theme-color" の節（取得日 2026-09-24）
- 値: "The value must be a string that matches the CSS <color> production"
- 一意性: "the media attribute value must be unique amongst all the meta elements with their name attribute value set to an ASCII case-insensitive match for theme-color."
- 例:
  - 原文: "The media attribute may be used to describe the context in which the provided color should be used."
  - 例のコード: `<meta name="theme-color" content="#3c790a" media="(prefers-color-scheme: dark)">`
- UA が色を決める手順
  - name が theme-color で content 属性を持つ meta を、ツリー順に候補として並べる。
  - media があって環境に一致しない要素は飛ばす。
  - content の値を CSS の色として解釈し、最初に解釈できた色を返す。
  - 該当がなければテーマカラーはない。
  - meta の追加・削除・属性変更、または環境の変化で media の一致が変わったときは、手順をやり直す。
- 原文: "user agents may adjust it in implementation-specific ways"（コントラスト確保のため暗い色に調整する例が書かれている）
- 同じ節に MDN の互換性表が埋め込まれている。取得時点の表示:
  - Firefox No
  - Safari 15+
  - Chrome 73+（部分対応の印付き）
  - Edge 79+（部分対応の印付き）
  - Chrome Android 80+
  - Samsung Internet 6.2+

### Next.js 16.3.0

- 確認した資料: 同梱の node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md
- `viewport` オブジェクト（または `generateViewport`）の `themeColor` に、次のように配列で指定する。
  ```ts
  export const viewport: Viewport = {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "cyan" },
      { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
  };
  ```
- `<head>` に出力されるもの:
  ```html
  <meta
    name="theme-color"
    media="(prefers-color-scheme: light)"
    content="cyan"
  />
  <meta
    name="theme-color"
    media="(prefers-color-scheme: dark)"
    content="black"
  />
  ```
- generate-metadata.md: "The `themeColor` option in `metadata` is deprecated as of Next.js 14. Please use the `viewport` configuration instead."
- `viewport` / `generateViewport` は v14.0.0 で導入された。
- 同じページに `colorScheme` フィールドもある。

---

## 6. OGP 画像と X の summary_large_image

### Open Graph protocol

- 確認した URL: https://ogp.me/ （取得日 2026-09-24）
- 必須プロパティは og:title、og:type、og:image、og:url の 4 つ。
- og:image の構造化プロパティ: og:image:url、og:image:secure_url、og:image:type、og:image:width、og:image:height、og:image:alt
- og:image:alt: "A description of what is in the image (not a caption). If the page specifies an og:image it should specify og:image:alt."
- **推奨サイズやアスペクト比の記載はない**（例として 400x300 が出てくるだけ）。

### 参考: Meta（Facebook）の開発者ドキュメント

これは OGP の読み手側の一次資料である。

- 確認した URL: https://developers.facebook.com/docs/sharing/webmasters/images/ （取得日 2026-09-24）
- 推奨: "Use images that are at least 1200 x 630 pixels for the best display on high resolution devices."
- 最低: "At the minimum, you should use images that are 600 x 315 pixels"
- 許容する最小寸法: "The minimum allowed image dimension is 200 x 200 pixels."
- ファイルサイズ: "The size of the image file must not exceed 8 MB."
- アスペクト比: "Try to keep your images as close to 1.91:1 aspect ratio as possible"

### X の summary_large_image

**現行の公式ページは取得できなかった。**

- https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image と、旧 developer.twitter.com の URL は、どちらも https://docs.x.com/ へ 307 リダイレクトされる。
- docs.x.com の sitemap.xml と llms-full.txt に Cards のページは見つからなかった（"summary_large_image" で 0 件）。

**確認できた最新の公式文言**: 上記 URL の Wayback Machine アーカイブ（2026-02-04 取得分、`https://web.archive.org/web/20260204074639id_/https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image`、取得日 2026-09-24）

- twitter:card: "Must be set to a value of “summary_large_image”"（必須）
- twitter:title: 必須
- twitter:site / twitter:description / twitter:image / twitter:image:alt: 任意
- twitter:image: "Images for this Card support an aspect ratio of 2:1 with minimum dimensions of 300x157 or maximum of 4096x4096 pixels. Images must be less than 5MB in size. JPG, PNG, WEBP and GIF formats are supported. Only the first frame of an animated GIF will be used. SVG is not supported."
  - あわせて "You should not use a generic image such as your website logo..." とも書かれている。
- twitter:image:alt: "Maximum 420 characters."
- twitter:description: iOS/Android では表示されない。Web では 3 行で切り詰める。
- twitter:title: iOS/Android では 2 行、Web では 1 行で切り詰める。
- 注意: このアーカイブは 2026-02 時点のもので、現在の公式ページとして確認したものではない。

---

## 7. oklch() のブラウザ対応

- **MDN**
  - 確認した URL: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch （取得日 2026-09-24）
  - 表示: "Baseline: Widely available*"（"*Some parts of this feature may have varying levels of support."）、"available across browsers since May 2023"
- **browser-compat-data**（MDN のデータ元）
  - 確認した URL: https://cdn.jsdelivr.net/npm/@mdn/browser-compat-data/data.json （v8.1.2、timestamp 2026-09-17、取得日 2026-09-24）
  - `css.types.color.oklch` の対応開始バージョン:
    - Chrome 111
    - Edge 111
    - Firefox 113
    - Safari 15.4
    - Safari iOS 15.4
    - Chrome Android 111
    - Samsung Internet 22.0
- **web-features**（Baseline の判定データ）
  - 確認した URL: https://cdn.jsdelivr.net/npm/web-features/data.json （取得日 2026-09-24）
  - "Oklab and OkLCh" は baseline "high"。
  - baseline_low_date 2023-05-09、baseline_high_date 2025-11-09。
  - `oklch.mixed_type_parameters`（引数に数値と % を混在させる書き方）は Chrome 116 / Safari 16.2 から対応。baseline high は 2026-02-21。
- **caniuse**
  - 確認した URL: https://caniuse.com/mdn-css_types_color_oklch （取得日 2026-09-24）
  - Global Usage 94.25%
  - 対応開始: Chrome 111、Edge 111、Firefox 113、Safari 15.4、iOS Safari 15.4
  - Baseline の表記は取得した本文に見当たらなかった。

---

## 8. LCP の「良好」の基準

計画の2巡目のレビューで表示の速さに合格の線を置くことになり、PM が追加で確認した。

- 確認した URL: https://web.dev/articles/lcp （取得日 2026-09-24）
- 原文: "To provide a good user experience, sites should strive to have Largest Contentful Paint of 2.5 seconds or less. To ensure you're hitting this target for most of your users, a good threshold to measure is the 75th percentile of page loads, segmented across mobile and desktop devices."

---

## 9. Google 検索の favicon の要件

計画の4巡目のレビューで指摘され、PM が追加で確認した。

- 確認した URL: https://developers.google.com/search/docs/appearance/favicon-in-search （取得日 2026-09-24）
- 原文: "Your favicon must be a square (1:1 aspect ratio) that's at least 8x8px. While the minimum size requirement is 8x8px, we recommend using a favicon that's larger than 48x48px so that it looks good on various surfaces."
- 原文: "Google Search supports the following favicon file formats: BMP, GIF, ICO, PNG, JPEG, PPM, and TIFF."（SVG は挙がっていない）
- 原文: "The favicon URL must be stable (don't change the URL frequently)."
