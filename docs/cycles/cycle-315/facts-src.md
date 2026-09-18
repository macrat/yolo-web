# 事実調査: `src/` 内の店メタファー語彙の実測

対象リビジョン: `fb069c0`（調査時点の作業ツリー。`src/` は無変更）
調査方法: `src/` 全 1,145 ファイルを走査し、各行を「コード（＝実行・描画される部分）」と「コメント」に機械的に分離したうえで計数した。数値はすべて実測値であり、概数ではない。

対象語: `店` `店主` `店構え` `店号` `のれん` `暖簾` `品書き` `品名` `棚` `値札` `包み` `札` `看板` `よろず` `印`、およびローマ字表記 `shinagaki` `nefuda` `tsutsumi` `noren` `kanban` `yorozu` `fuda`（大文字小文字を問わない）。

---

## A. 来訪者に届いている店語彙

### 件数（届き方の種類ごと）

| 届き方                                                        | 件数                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| A-1 画面に表示されるテキスト（サイト UI）                     | 6 件（3 ファイル）                                         |
| A-1' 画面に表示されるテキスト（`noindex` の開発者向けページ） | 4 件（1 ファイル）                                         |
| A-1'' 画面に表示されるテキスト（ブログ本文・記事メタ）        | 4 記事（延べ 43 語）                                       |
| A-2 スクリーンリーダーに読まれる文字列                        | コード上 11 箇所（8 ファイル）／実際に描画される文言 17 種 |
| A-3 メタデータ                                                | 4 件（3 ファイル）                                         |
| A-4 URL のパスに含まれるもの                                  | 2 件                                                       |

上記とは別に、**店メタファーではなく普通の日本語として**同じ字が出るコンテンツデータが 89 行・19 ファイルある（A-5）。

### A-1 画面に表示されるテキスト（サイト UI・6 件）

1. `src/app/page.tsx:194` — `<span className={styles.phrase}>AIが営む、よろず屋です。</span>`
   トップページの h1「yolos.net」直下のリード文の3文節目。初見の来訪者が最初に読む2行のうちの1行。
2. `src/app/page.tsx:219` — `12の問いに答えると、あなたに近いキャラクター像がひとつ。結果は札にして持ち帰れます。`
   トップの「今日のためしどころ」区画、キャラ診断の説明文。**「札」の語に説明はなく、隣に見本画像が置かれているだけ**。
3. `src/app/page.tsx:249` — `結果はこんな札になります（これは見本です）。`
   同区画の見本画像（`Tsutsumi`）直下のキャプション。見本画像そのものには「札」の字は出ない（出るのは `yolos.net` / 診断名 / 朱の丸印「診」）。
4. `src/app/about/page.tsx:82` — `yolos.netは、「AIが営むよろず屋」です。読むだけで終わるサイトではなく、その場でためして、結果や作ったものを持ち帰れるサイトを目指しています。`
   `/about` の導入文。
5. `src/app/about/page.tsx:88` — `「yolos.net」には、二つの意味を重ねています。…もうひとつは「よろず」——「万事・あらゆるもの」を意味する日本語で、ジャンルを問わずいろいろなものを扱う、という意味です。`
   `/about`「名前の由来」。**「よろず」だけは語義が本文中で明示的に説明されている唯一の店語彙**。
6. `src/play/quiz/_components/FudaActions.tsx:193` — `この結果を札として持ち帰る`
   キャラ診断（`/play/character-personality`）を**12問すべて回答し終えた結果画面**にだけ出る、保存/共有ボタンの上のラベル。`ResultCard.tsx:522` の条件 `detailedContent?.variant === "character-personality"` により、この面以外には出ない。静的な結果 URL（`/play/character-personality/result/<id>`）には出ない（SSR の HTML に文字列が存在しないことを確認済み）。

### A-1' 画面に表示されるテキスト（`/storybook`・4 件）

`src/app/storybook/StorybookContent.tsx` はトークン一覧表の「用途」欄に店語彙をそのまま出す。

- `:40` `{ token: "--ink-2", role: "補足・値札の文字・キャプション" }`
- `:47` `{ token: "--rule-strong", role: "強い罫（のれん罫・区切りの主格）" }`
- `:53` `{ token: "--accent", role: "朱。リンク・主ボタン・現在地・記入印" }`
- `:235` `例外は値札ラベルと入力欄のみ`

`/storybook` は `robots: { index: false, follow: false }`（`src/app/storybook/page.tsx:12`）で、サイトナビからの導線もない。URL を直接知っている場合のみ到達する。

### A-1'' 画面に表示されるテキスト（ブログ本文・4 記事）

| 記事（`src/blog/content/`）                                | 出現                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `2026-07-13-character-quiz-result-as-fuda.md`              | 札 17・店号 3・店構え 2（本文で「店構え」「店号」「札」の見立てを来訪者に向けて説明している唯一の記事） |
| `2026-06-12-top-page-toolbox-launch.md`                    | 店構え 2（冒頭の追記で「デザイン刷新（「店構え」への移行）」と言及）                                    |
| `2026-02-18-site-rename-yolos-net.md`                      | よろず 3（名前の由来の説明）                                                                            |
| `2026-05-07-letter-from-an-ai-that-cant-see-the-future.md` | 札 10（**店メタファーではなく「立て札」の比喩**。同じ字だが別の意味で使われている）                     |

### A-2 スクリーンリーダーに読まれる文字列（コード上 11 箇所・描画される文言 17 種）

すべて `aria-label`。`alt` / `title` / `aria-describedby` / visually-hidden なテキストに店語彙は**存在しない**（`export const alt` は全 58 件中 1 件だけが店語彙で、それは A-3 のメタデータ）。

**(a) `Shinagaki`（品書き）コンポーネントの `ariaLabel` → `<ul aria-label>`（呼び出し 10 箇所・描画される文言 16 種）**

`src/components/Shinagaki/index.tsx:71` で `<ul className={styles.list} aria-label={ariaLabel}>` として出力される。呼び出し側:

| ファイル・行                                  | 逐語                                       | 実際に読まれる文言                                                                                                                                           |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/page.tsx:261`                        | `ariaLabel="診断・占い・あそびの品書き"`   | 「リスト 診断・占い・あそびの品書き」                                                                                                                        |
| `src/app/page.tsx:275`                        | `ariaLabel="辞典の品書き"`                 | 「リスト 辞典の品書き」                                                                                                                                      |
| `src/app/page.tsx:281`                        | `ariaLabel="道具の品書き"`                 | 「リスト 道具の品書き」                                                                                                                                      |
| `src/app/page.tsx:294`                        | `ariaLabel="読みものの品書き"`             | 「リスト 読みものの品書き」                                                                                                                                  |
| `src/app/about/page.tsx:100`                  | `ariaLabel="サイトの品書き"`               | 「リスト サイトの品書き」                                                                                                                                    |
| `src/app/dictionary/page.tsx:106`             | `ariaLabel="辞典の品書き"`                 | 「リスト 辞典の品書き」                                                                                                                                      |
| `src/app/dictionary/colors/page.tsx:121`      | `ariaLabel="色みのグループから探す品書き"` | 同左                                                                                                                                                         |
| `src/app/play/page.tsx:118`                   | ``ariaLabel={`${shelf.label}の品書き`}``   | 「あなたはどのタイプ？の品書き」「どこまで知ってる？の品書き」「今日の運勢の品書き」「毎日のパズルの品書き」（4 種・実測）                                   |
| `src/app/tools/page.tsx:107`                  | ``ariaLabel={`${heading}の品書き`}``       | 「文章の道具の品書き」「計算・生成の道具の品書き」「エンコード変換の道具の品書き」「パスワードとハッシュの道具の品書き」「開発の道具の品書き」（5 種・実測） |
| `src/blog/_components/RelatedArticles.tsx:32` | `ariaLabel="関連記事の品書き"`             | 全ブログ記事ページに出る                                                                                                                                     |

品書きの語は**可視の見出しには一切出ない**。同じ区画の可視見出しは「診断・占い・あそび」「辞典」「道具」「読みもの」などの平明な語であり、**スクリーンリーダー利用者だけが「品書き」を聞く**という非対称がある。

**(b) `In`（印）コンポーネントの `role="img"` + `aria-label`（呼び出し 1 箇所・文言 1 種）**

`src/components/Tsutsumi/index.tsx:111` — ``<In char={seal} size="100%" label={`印 ${[...seal][0]}`} />``
`src/components/In/index.tsx:52-54` で `label` が `{ role: "img", "aria-label": label }` になる。`seal` は `"診"`（診断系 4 箇所）と `"占"`（`DailyFortuneCard.tsx:82`）。実際に読まれるのは **「画像 印 診」**（アクセシビリティツリーで実測）。トップページ、診断結果画面、日替わり運勢の包みに出る。

### A-3 メタデータ（4 件）

| ファイル・行                                                                  | 出力先                                                                          | 逐語                                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/app/page.tsx:38`                                                         | トップの `<meta name="description">` / `og:description` / `twitter:description` | `AIが営むよろず屋、yolos.net。性格診断や占い、…`                    |
| `src/app/about/page.tsx:23`                                                   | `/about` の同上                                                                 | `yolos.netは「AIが営むよろず屋」です。…`                            |
| `src/app/play/character-personality/result/[resultId]/opengraph-image.tsx:29` | `og:image:alt`                                                                  | `export const alt = "診断結果の札";`                                |
| `src/blog/content/2026-07-13-character-quiz-result-as-fuda.md:4`              | 記事の `description`（`<meta name="description">`・一覧のひとこと）             | `…店号・診断名・あなたのタイプ名と一字を刷った1枚の札の画像として…` |

`<title>` / `og:title` に店語彙は**ない**（トップ `yolos.net`、`/about` `サイト紹介 | yolos.net`、`/dictionary` `辞典 | yolos.net`）。
構造化データ（JSON-LD）にも店語彙は**ない**（`WebSite` / `BreadcrumbList` の中身を実測。`description` は `src/lib/site-metadata.ts` 由来の別文で、店語彙を含まない）。

### A-4 URL のパスに含まれるもの（2 件）

1. `/play/character-personality/result/<resultId>/fuda-image` — `src/app/play/character-personality/result/[resultId]/fuda-image/route.ts`（ディレクトリ名がそのままパス）。札 PNG の固定 URL。保存ボタンが `fetch` する先で、保存した画像を開き直したときにアドレスバーに出る。
2. `/blog/character-quiz-result-as-fuda` — `src/blog/content/2026-07-13-character-quiz-result-as-fuda.md` の `slug`。

`fuda` はほかに GA4 のイベントパラメータ値としても送られる（`src/lib/analytics.ts:26` `export type ShareSurface = "fuda" | "invite" | "text";`）。これは来訪者の目にも耳にも触れない。

### A-5 店メタファーではない、同じ字の出現（参考・89 行 / 19 ファイル）

辞典・診断・ゲームのコンテンツデータ内で、`店`（飲食店・商店街など）・`棚`（本棚・棚からぼたもち）・`札`（改札・花札・札幌）・`印`（印象・矢印）・`看板`（お稲荷さんの看板）が普通名詞として出る。これらは店メタファーの語彙ではない。

| ファイル                                                                                                                                                                                                        | 行数 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `src/data/kanji-data.json`                                                                                                                                                                                      | 25   |
| `src/data/yoji-data.json`                                                                                                                                                                                       | 16   |
| `src/play/games/nakamawake/data/nakamawake-data.json`                                                                                                                                                           | 7    |
| `src/humor-dict/data.ts`                                                                                                                                                                                        | 5    |
| `src/play/quiz/data/science-thinking.ts`                                                                                                                                                                        | 5    |
| `src/play/quiz/data/contrarian-fortune.ts`                                                                                                                                                                      | 4    |
| `src/data/kanji-embeddings-384.json`                                                                                                                                                                            | 4    |
| `src/play/games/kanji-kanaru/data/joyo-kanji-set.ts`                                                                                                                                                            | 4    |
| `src/play/quiz/data/kotowaza-level.ts`                                                                                                                                                                          | 3    |
| `src/play/quiz/data/music-personality.ts`                                                                                                                                                                       | 3    |
| `src/play/quiz/data/traditional-color.ts`                                                                                                                                                                       | 3    |
| `src/play/quiz/data/animal-personality.ts`                                                                                                                                                                      | 2    |
| `src/play/quiz/data/word-sense-personality.ts`                                                                                                                                                                  | 2    |
| その他 6 ファイル（`character-fortune.ts` / `character-personality-compat-shared.ts` / `unexpected-compatibility.ts` / `yoji-personality.ts` / `tools/dummy-text/logic.ts` / `tools/keigo-reference/logic.ts`） | 各 1 |

なお `src/blog/_lib/blog.ts:89` の「包み隠さず公開しています」は「包み」を含むが慣用句であり、店メタファーではない。

---

## B. 来訪者に届かない店語彙

### B-1 コンポーネント名・ファイル名・ディレクトリ名

**ディレクトリ 5（＋テスト用 4）・ファイル 19（うちテスト 6）。**

| 種別               | パス                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ディレクトリ       | `src/components/Shinagaki/` `src/components/Nefuda/` `src/components/Tsutsumi/` `src/components/In/` `src/app/play/character-personality/result/[resultId]/fuda-image/`                                                                                                                                                                                                                                                                                                                                               |
| 実装ファイル       | `src/components/Shinagaki/index.tsx` `src/components/Shinagaki/Shinagaki.module.css` `src/components/Nefuda/index.tsx` `src/components/Nefuda/Nefuda.module.css` `src/components/Tsutsumi/index.tsx` `src/components/Tsutsumi/Tsutsumi.module.css` `src/components/In/index.tsx` `src/components/In/In.module.css` `src/lib/fuda-image.tsx` `src/play/quiz/_components/FudaActions.tsx` `src/play/quiz/_components/FudaActions.module.css` `src/app/play/character-personality/result/[resultId]/fuda-image/route.ts` |
| ブログ記事ファイル | `src/blog/content/2026-07-13-character-quiz-result-as-fuda.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| テストファイル     | `src/components/Shinagaki/__tests__/Shinagaki.test.tsx` `src/components/Nefuda/__tests__/Nefuda.test.tsx` `src/components/Tsutsumi/__tests__/Tsutsumi.test.tsx` `src/components/In/__tests__/In.test.tsx` `src/lib/__tests__/fuda-image.test.tsx` `src/play/quiz/_components/__tests__/FudaActions.test.tsx`                                                                                                                                                                                                          |

### B-2 変数名・関数名・型名・CSS クラス名・CSS 変数名

**ローマ字の店語彙がコード（非コメント）に出る行は 229 行 / 44 ファイル**（うちテスト除きで 136 行 / 35 ファイル）。

出現する識別子（重複排除・実測）: `Shinagaki` `ShinagakiProps` `ShinagakiItem` `toShinagakiItem` `Nefuda` `NefudaProps` `NefudaGroup` `NefudaGroupProps` `Tsutsumi` `TsutsumiProps` `In` `InProps` `FudaActions` `FudaActionsProps` `fetchFudaFile` `renderFudaImage` `FudaImageResult` `FudaImageSize` `FudaImageContentType` `FUDA_SIZE`、CSS クラス `.shinagaki` `.nefuda` `.tsutsumi` `.in`、CSS カスタムプロパティ `--in-size` `--in-rotate`。

代表 5 ファイル: `src/components/Shinagaki/index.tsx`（9 行）、`src/components/Tsutsumi/Tsutsumi.module.css`（9 行）、`src/play/quiz/_components/FudaActions.tsx`（16 行）、`src/app/page.tsx`（13 行）、`src/lib/fuda-image.tsx`（7 行）。

これらの CSS モジュールのクラス名は**本番ビルドの DOM にもそのまま残る**（実測: https://yolos.net/ の HTML に `class="Shinagaki-module__MMdnaW__list"` `class="Nefuda-module__w3PS2q__nefuda"` `class="Tsutsumi-module__Qvq-Wq__head"` などが 85 箇所）。ただし画面にも読み上げにも出ない。

### B-3 コード内のコメント・JSDoc

**店語彙を含むコメント行は 720 行 / 222 ファイル**（テスト除きで 649 行 / 198 ファイル）。`src/` の全ファイル 1,145 のうち **約 19% のファイルのコメントに店語彙がある**。

コメント内の語別頻度（実測）: `店` 224・`札` 184・`店構え` 162・`品書き` 121・`値札` 116・`品名` 85・`棚` 62・`印` 56・`包み` 38・`店号` 32・`のれん` 25・`よろず` 12・`看板` 10・`店主` 2。

うち **`DESIGN.md` を名指しして店語彙を引くコメントが 169 行 / 155 ファイル**、**`§` 番号と店語彙を同じ行に書くコメントが 206 行 / 103 ファイル**。

コメント件数上位ファイル: `src/app/page.tsx`（34）、`src/lib/ogp-image.tsx`（25）、`src/lib/fuda-image.tsx`（20）、`src/app/page.module.css`（18）、`src/app/globals.css`（13）。

代表例 5 件:

- `src/components/Shinagaki/index.tsx:47` — `* 品書き（Shinagaki）— 一覧の既定形（DESIGN.md §4「品書き」）。`
- `src/components/Header/Header.module.css:2` — `* Header（のれん）— DESIGN.md §4「のれん」。`
- `src/components/Nefuda/Nefuda.module.css:2` — `* 値札（Nefuda）— メタ情報の小ラベル（DESIGN.md §4「値札」・§3 補助情報の字サイズ）。`
- `src/components/Tsutsumi/index.tsx:71` — `* 包み（Tsutsumi）— 「見せたくなる結果」の結果カード（DESIGN.md §4「包み」/§7）。`
- `src/components/Button/Button.module.css:1` — `/* Button — クリック操作のボタン（DESIGN.md フェーズ R・店構えへ変換）。`

---

## C. DESIGN.md の § 番号を引いているコード参照

`src/` 内の `§` 付き参照は **1,245 件 / 263 ファイル**。うち 564 件は同じ行に `DESIGN.md` の文字列があり、681 件は `§4` `§8-5` のように文書名を省いて番号だけを引いている。

現行 `DESIGN.md` の節は **§1〜§11**、`§8` のみ 1〜11 の番号付き禁止項目を持つ。

### C-1 引いている § 番号が現行 DESIGN.md に実在しないもの（7 件）

| ファイル・行                                                     | 引いている節 | 逐語                                                                                      | 実態                                                                                                                                               |
| ---------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx:198`                                           | §0.1         | `「店」の枠を来訪者が受け入れる前提の押し付け(§0.1(3))のため「運営しているのは」へ是正。` | DESIGN.md に §0 は存在しない。文書名の明示がなく、`docs/cycles/cycle-309/grounding.md §0.1` を指していると思われるが、コメント上からは判別できない |
| `src/app/about/page.tsx:98`                                      | §0.1         | `押し付け(§0.1(3))かつ site-concept の明瞭さガードに反するため平明表現へ是正。`           | 同上                                                                                                                                               |
| `src/play/_components/__tests__/RecommendedContent.test.tsx:152` | §2.4         | `（data-category 属性によるカテゴリ別配色は廃止。色は機能のみ・DESIGN.md §2.4）。`        | **`DESIGN.md` を名指ししているが、DESIGN.md に §2.4 という細目番号は存在しない**（§2 は番号付きの小項目を持たない）                                |
| `src/play/quiz/_components/__tests__/ResultCard.test.tsx:1045`   | §2.4         | `DESIGN.md §2.4: 色は機能のためだけに使う。variant 別の装飾色は廃止した。`                | 同上                                                                                                                                               |
| `src/blog/_components/BlogList.tsx:83`                           | §3-2         | `消費して行間が不揃いになる（設計 §3-2 MUST-2・cycle-281）。`                             | DESIGN.md §3 に番号付き項目はない。「設計」＝サイクルの設計文書を指すと思われるが、コメントからは判別できない                                      |
| `src/play/quiz/__tests__/character-personality.test.ts:177`      | §4.1         | `G1 の∀理想回答者「族」を構築する(research §4.1 の∀分割モデル)。`                         | `research` と明記されており DESIGN.md 参照ではない                                                                                                 |
| `src/blog/content/2026-04-30-….md:219`                           | §9.9         | `[CSS 2.1 §9.9](https://www.w3.org/TR/CSS21/visuren.html#z-index)`                        | W3C CSS 2.1 仕様の参照。DESIGN.md とは無関係                                                                                                       |

**DESIGN.md を名指ししたうえで実在しない節を引いているのは `§2.4` の 2 件**（どちらもテストファイル）。

### C-2 引用文が引いた節に逐語で存在しないもの（43 種 / 81 種中）

`§N「…」` の形で節の文言を引いている箇所は 81 種あり、そのうち **43 種は引いた節の本文に逐語では存在しない**。多くは言い換え（例: `§4「一覧の既定は品書き」`×6 は実際には §4「品書き（一覧の既定形）」）だが、次の 2 種は **DESIGN.md のどこにも該当文言がない**:

- `§7「非テキスト要素も AA」`×2（`src/play/quiz/_components/ScienceThinkingResultExtra.module.css:3` ほか）— 「非テキスト」は DESIGN.md 全体で 0 件。コントラスト AA の規定があるのは §10。
- `§7「実務辞典は引く体験が主役」`×2（`src/app/dictionary/yoji/page.tsx:28` ほか）— 「引く体験」は DESIGN.md 全体で 0 件。

また `§1「器は静か」`×5 は、「器は静か」の語が §4（包み）にはあるが §1 にはない。

### C-3 店語彙のラベルを名指しで引いている参照（69 件）

`§4「品書き」` `§4「値札」` `§4「札」` `§4「包み」` `§4「のれん」` `§4「印」` `§2/§4「店構え」` などの形で DESIGN.md の店語彙ラベルを引いている箇所の全件は、後掲「付録 C-3」に逐語で示す。

---

## D. 実際の画面の確認

**見たのはローカルの開発サーバ**（`npx next dev -p 3117`、`http://localhost:3117/`）。本番（https://yolos.net/）とは `aria-label` の一覧が完全に一致することを HTML 取得で照合済み（トップページの `aria-label` 10 件が両者で同一）。確認後、開発サーバは停止した。

スクリーンショットは `tmp/` に保存した（`cycle-315-src-top.png` / `cycle-315-src-about.png` / `cycle-315-src-dictionary.png` / `cycle-315-src-quiz-result-fuda.png`）。**`tmp/` はサイクル終了時に消える一時ファイルであり、この記録の結論はスクリーンショットなしで読めるように本文に書いてある。**

### D-1 トップページ（`/`）

**可視テキストに出ている店語彙: 3 件。**

- リード 3 行目「**AIが営む、よろず屋です。**」— h1「yolos.net」の直下、ファーストビュー。
- 「今日のためしどころ」区画「…結果は**札**にして持ち帰れます。」
- 見本画像の下「結果はこんな**札**になります（これは見本です）。」

初見の来訪者がこの語で理解できること（画面から読み取れる事実のみ）:

- 「よろず屋」は、直後に「診断・占い・あそび」「辞典」「道具」「読みもの」の4区画が並ぶので、**画面の並びから「いろいろ置いてある」ことは補完できる**。ただしトップ上ではこの語の説明はない（説明があるのは `/about`）。
- 「札」は**画面上に語の説明がなく、隣の見本画像だけが手がかり**。見本画像には「yolos.net／あなたに似たキャラ診断／大きな一字／タイプ名」が刷られていて、「札」の字は画像の中には出ない。したがって来訪者は「札＝この結果カード画像のこと」と、**画像との対応づけを自分で推測する必要がある**。

区画の見出しは「診断・占い・あそび」「辞典」「道具」「読みもの」で、**「品書き」「棚」「のれん」は可視テキストには一切出ない**。

**スクリーンリーダー向けラベルに出ている店語彙: 5 件**（DOM 実測）。

```
aria-label="診断・占い・あそびの品書き"
aria-label="辞典の品書き"
aria-label="道具の品書き"
aria-label="読みものの品書き"
aria-label="印 診"   （見本の包みの朱丸。role="img"）
```

アクセシビリティツリーでは `list "診断・占い・あそびの品書き"` `img "印 診"` として現れる。**可視見出しは「診断・占い・あそび」なのに、読み上げでは同じ区画が「品書き」という別語で呼ばれる**（可視テキストと読み上げの語彙が一致していない）。

### D-2 `/about`

**可視テキストに出ている店語彙: 2 件。**

- 導入文「yolos.netは、「AIが営む**よろず屋**」です。…」
- 「名前の由来」節「…もうひとつは「**よろず**」——「万事・あらゆるもの」を意味する日本語で、ジャンルを問わずいろいろなものを扱う、という意味です。」

**このページだけが店語彙の意味を来訪者に説明している**（ただし説明されるのは「よろず」のみ）。「何が置いてあるか」の節見出しは店語彙ではない平明な日本語で、続く一覧も「診断・占い・あそび／辞典／道具／ブログ」。**「品書き」「店主」「店」は可視テキストに出ない。**

**スクリーンリーダー向けラベル: 1 件** — `aria-label="サイトの品書き"`。可視の節見出しは「何が置いてあるか」であり、ここでも可視と読み上げの語彙がずれている。

### D-3 `/dictionary`（辞典一覧）

**可視テキストに出ている店語彙: 0 件。** 見出しは「辞典」、リード文は「漢字・四字熟語・日本の伝統色、それにAIが作ったユーモア辞典。気になる言葉や色を引いて、読み方や意味、由来を確かめてください。」で、店語彙はない。一覧の各行も「漢字辞典／四字熟語辞典／伝統色辞典／ユーモア辞典」＋件数（2136字・400語・250色・30語）だけ。

**スクリーンリーダー向けラベル: 1 件** — `aria-label="辞典の品書き"`。アクセシビリティツリーの実測結果:

```
- heading "辞典" [level=1]
- paragraph: 漢字・四字熟語・日本の伝統色、…
- list "辞典の品書き":
  - listitem ×4
```

**このページでは「品書き」はスクリーンリーダー利用者にしか届かない。**視覚的な来訪者はこの語に一度も出会わない。

### D-4 追加確認: キャラ診断の結果画面

`/play/character-personality` を 12 問回答して到達する結果画面でのみ、可視テキスト「**この結果を札として持ち帰る**」が出る（保存／共有ボタンの上）。同じ画面の結果カードには朱丸の印があり、読み上げは「画像 印 診」。静的な結果 URL（`/play/character-personality/result/<id>`）にはこのラベルは出ない。

---

## 付録

### 付録 C-1: § 番号別の参照回数

| §番号 | 参照回数 |
| ----- | -------- |
| §4    | 349      |
| §2    | 207      |
| §3    | 175      |
| §10   | 91       |
| §1    | 84       |
| §7    | 69       |
| §8    | 59       |
| §6    | 34       |
| §8-5  | 30       |
| §8-6  | 28       |
| §8-4  | 27       |
| §8-1  | 23       |
| §5    | 20       |
| §8-2  | 17       |
| §8-3  | 12       |
| §8-7  | 10       |
| §0.1  | 2        |
| §2.4  | 2        |
| §3-2  | 1        |
| §4.1  | 1        |
| §8-11 | 1        |
| §8-8  | 1        |
| §8-9  | 1        |
| §9.9  | 1        |

### 付録 C-2: ファイル別の § 参照（263 ファイル）

| ファイル                                                                                   | 参照している §                                                                                                                    |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/__tests__/middleware-gone-slugs.test.ts`                                              | §2×2, §3×2, §4×2, §10×1, §8×1, §8-1×1, §8-5×1, §8-6×1                                                                             |
| `src/app/__tests__/page.test.tsx`                                                          | §3×3, §7×3                                                                                                                        |
| `src/app/about/__tests__/page.test.tsx`                                                    | §7×1                                                                                                                              |
| `src/app/about/page.module.css`                                                            | §3×3, §4×3, §1×1, §10×1, §6×1, §8×1                                                                                               |
| `src/app/about/page.tsx`                                                                   | §4×2, §0.1×1, §3×1                                                                                                                |
| `src/app/blog/[slug]/__tests__/page.test.tsx`                                              | §4×3                                                                                                                              |
| `src/app/blog/[slug]/page.module.css`                                                      | §3×4, §2×3, §4×2, §10×1, §8×1                                                                                                     |
| `src/app/blog/[slug]/page.tsx`                                                             | §4×3, §3×1                                                                                                                        |
| `src/app/dictionary/colors/[slug]/opengraph-image.tsx`                                     | §2×1, §4×1                                                                                                                        |
| `src/app/dictionary/colors/category/[category]/page.module.css`                            | §1×1, §10×1, §3×1, §4×1                                                                                                           |
| `src/app/dictionary/colors/category/[category]/page.tsx`                                   | §2×2, §10×1, §8-4×1, §8-5×1                                                                                                       |
| `src/app/dictionary/colors/page.module.css`                                                | §3×2, §4×2, §1×1, §10×1, §2×1                                                                                                     |
| `src/app/dictionary/colors/page.tsx`                                                       | §2×2, §4×1, §6×1, §7×1                                                                                                            |
| `src/app/dictionary/humor/[slug]/page.module.css`                                          | §4×6, §3×5, §7×3, §10×1, §2×1                                                                                                     |
| `src/app/dictionary/humor/page.module.css`                                                 | §3×6, §4×4, §10×2, §1×1                                                                                                           |
| `src/app/dictionary/humor/page.tsx`                                                        | §4×3, §6×2, §10×1                                                                                                                 |
| `src/app/dictionary/kanji/grade/[grade]/page.module.css`                                   | §1×1, §10×1, §3×1, §4×1                                                                                                           |
| `src/app/dictionary/kanji/grade/[grade]/page.tsx`                                          | §10×1, §4×1, §8-4×1, §8-5×1                                                                                                       |
| `src/app/dictionary/kanji/page.module.css`                                                 | §10×3, §3×2, §4×2, §1×1                                                                                                           |
| `src/app/dictionary/kanji/page.tsx`                                                        | §6×3, §7×3, §4×2, §8-4×2, §1×1, §10×1                                                                                             |
| `src/app/dictionary/kanji/radical/[radical]/page.module.css`                               | §1×1, §10×1, §3×1, §4×1                                                                                                           |
| `src/app/dictionary/kanji/radical/[radical]/page.tsx`                                      | §10×1, §8-4×1, §8-5×1                                                                                                             |
| `src/app/dictionary/kanji/stroke/[count]/page.module.css`                                  | §1×1, §10×1, §3×1, §4×1                                                                                                           |
| `src/app/dictionary/kanji/stroke/[count]/page.tsx`                                         | §10×1, §8-4×1, §8-5×1                                                                                                             |
| `src/app/dictionary/page.module.css`                                                       | §3×2, §4×2, §1×1, §10×1                                                                                                           |
| `src/app/dictionary/page.tsx`                                                              | §4×3, §6×2, §1×1, §8-4×1                                                                                                          |
| `src/app/dictionary/yoji/category/[category]/page.module.css`                              | §1×1, §10×1, §3×1, §4×1                                                                                                           |
| `src/app/dictionary/yoji/category/[category]/page.tsx`                                     | §10×1, §8-4×1, §8-5×1                                                                                                             |
| `src/app/dictionary/yoji/page.module.css`                                                  | §3×2, §4×2, §1×1, §10×1                                                                                                           |
| `src/app/dictionary/yoji/page.tsx`                                                         | §4×5, §6×4, §7×3, §8-4×2, §1×1, §10×1                                                                                             |
| `src/app/global-not-found.module.css`                                                      | §4×1                                                                                                                              |
| `src/app/globals.css`                                                                      | §2×13, §3×9, §4×2, §8-1×2, §10×1, §7×1                                                                                            |
| `src/app/layout.tsx`                                                                       | §3×1                                                                                                                              |
| `src/app/page.module.css`                                                                  | §3×7, §4×4, §10×3, §8×3, §7×2, §1×1, §2×1, §6×1, §8-4×1, §8-5×1                                                                   |
| `src/app/page.tsx`                                                                         | §7×4, §8×3, §1×2, §4×2, §6×2, §0.1×1, §2×1, §3×1, §8-4×1                                                                          |
| `src/app/play/[slug]/page.module.css`                                                      | §4×3, §3×1                                                                                                                        |
| `src/app/play/[slug]/result/[resultId]/page.module.css`                                    | §2×1, §3×1, §4×1, §8-3×1                                                                                                          |
| `src/app/play/__tests__/page.test.tsx`                                                     | §4×1                                                                                                                              |
| `src/app/play/character-fortune/result/[resultId]/page.module.css`                         | §4×3, §2×1, §3×1, §8-4×1                                                                                                          |
| `src/app/play/character-fortune/result/[resultId]/page.tsx`                                | §8-6×1                                                                                                                            |
| `src/app/play/character-personality/result/[resultId]/opengraph-image.tsx`                 | §2×2, §4×1, §8×1                                                                                                                  |
| `src/app/play/contrarian-fortune/result/[resultId]/page.module.css`                        | §2×1                                                                                                                              |
| `src/app/play/daily/page.module.css`                                                       | §10×1                                                                                                                             |
| `src/app/play/impossible-advice/result/[resultId]/page.module.css`                         | §2×1                                                                                                                              |
| `src/app/play/page.module.css`                                                             | §3×2, §4×2, §1×1, §10×1, §7×1                                                                                                     |
| `src/app/play/page.tsx`                                                                    | §4×4, §1×2, §6×1, §7×1                                                                                                            |
| `src/app/play/traditional-color/result/[resultId]/opengraph-image.tsx`                     | §2×1, §4×1, §8×1                                                                                                                  |
| `src/app/play/traditional-color/result/[resultId]/page.module.css`                         | §2×1                                                                                                                              |
| `src/app/play/unexpected-compatibility/result/[resultId]/page.module.css`                  | §2×1, §4×1, §7×1                                                                                                                  |
| `src/app/play/unexpected-compatibility/result/[resultId]/page.tsx`                         | §4×1                                                                                                                              |
| `src/app/privacy/page.module.css`                                                          | §4×4, §3×2, §2×1, §8×1                                                                                                            |
| `src/app/storybook/StorybookContent.tsx`                                                   | §1×19, §4×3, §2×1                                                                                                                 |
| `src/app/storybook/page.module.css`                                                        | §2×1, §4×1                                                                                                                        |
| `src/app/tools/page.module.css`                                                            | §3×2, §4×2, §1×1, §10×1                                                                                                           |
| `src/app/tools/page.tsx`                                                                   | §4×4, §1×2, §6×2, §8-4×1                                                                                                          |
| `src/blog/_components/BlogFilterableList.module.css`                                       | §10×2, §4×2, §2×1, §8×1                                                                                                           |
| `src/blog/_components/BlogList.module.css`                                                 | §10×4, §4×4, §3×2, §2×1, §8-6×1                                                                                                   |
| `src/blog/_components/BlogList.tsx`                                                        | §3-2×1                                                                                                                            |
| `src/blog/_components/BlogListView.module.css`                                             | §3×2, §10×1, §4×1                                                                                                                 |
| `src/blog/_components/CollapsibleTOC.module.css`                                           | §10×1, §2×1                                                                                                                       |
| `src/blog/_components/SeriesNav.module.css`                                                | §10×1, §2×1                                                                                                                       |
| `src/blog/_components/TagList.module.css`                                                  | §10×2, §4×1                                                                                                                       |
| `src/blog/_components/__tests__/MobileToc.test.tsx`                                        | §3×2                                                                                                                              |
| `src/blog/content/2026-04-30-nextjs-multiple-root-layouts-for-gradual-design-migration.md` | §9.9×1                                                                                                                            |
| `src/blog/content/2026-07-13-design-token-migration-build-blind-spots.md`                  | §5×1                                                                                                                              |
| `src/components/Breadcrumb/Breadcrumb.module.css`                                          | §2×1                                                                                                                              |
| `src/components/Breadcrumb/index.tsx`                                                      | §2×1                                                                                                                              |
| `src/components/Button/Button.module.css`                                                  | §4×3, §2×2, §7×1, §8-2×1                                                                                                          |
| `src/components/Button/index.tsx`                                                          | §2×1, §4×1                                                                                                                        |
| `src/components/ErrorMessage/ErrorMessage.module.css`                                      | §2×1, §4×1                                                                                                                        |
| `src/components/ErrorMessage/__tests__/ErrorMessage.test.tsx`                              | §2×2, §3×1, §4×1                                                                                                                  |
| `src/components/ErrorMessage/index.tsx`                                                    | §2×1, §5×1                                                                                                                        |
| `src/components/FaqSection/FaqSection.module.css`                                          | §2×2, §4×1                                                                                                                        |
| `src/components/FaqSection/__tests__/FaqSection.test.tsx`                                  | §4×2, §2×1, §5×1                                                                                                                  |
| `src/components/FileDropZone/FileDropZone.module.css`                                      | §2×2, §4×1                                                                                                                        |
| `src/components/FileDropZone/__tests__/FileDropZone.test.tsx`                              | §4×1                                                                                                                              |
| `src/components/Footer/Footer.module.css`                                                  | §4×4, §6×2, §7×2, §3×1, §8-6×1                                                                                                    |
| `src/components/Footer/__tests__/Footer.test.tsx`                                          | §6×1                                                                                                                              |
| `src/components/Footer/index.tsx`                                                          | §3×1, §4×1, §6×1                                                                                                                  |
| `src/components/Header/Header.module.css`                                                  | §4×8, §3×3, §5×2, §2×1                                                                                                            |
| `src/components/Header/index.tsx`                                                          | §4×1                                                                                                                              |
| `src/components/In/In.module.css`                                                          | §4×3, §8-5×1                                                                                                                      |
| `src/components/In/__tests__/In.test.tsx`                                                  | §4×2, §8-5×1                                                                                                                      |
| `src/components/In/index.tsx`                                                              | §4×8, §8×1, §8-5×1                                                                                                                |
| `src/components/Input/Input.module.css`                                                    | §2×2, §4×1                                                                                                                        |
| `src/components/Input/index.tsx`                                                           | §2×1, §4×1                                                                                                                        |
| `src/components/Nefuda/Nefuda.module.css`                                                  | §4×4, §3×2                                                                                                                        |
| `src/components/Nefuda/__tests__/Nefuda.test.tsx`                                          | §4×1                                                                                                                              |
| `src/components/Nefuda/index.tsx`                                                          | §4×5, §3×1                                                                                                                        |
| `src/components/Pagination/Pagination.module.css`                                          | §2×2, §10×1, §3×1, §4×1                                                                                                           |
| `src/components/Pagination/index.tsx`                                                      | §2×1, §4×1                                                                                                                        |
| `src/components/Panel/Panel.module.css`                                                    | §4×2                                                                                                                              |
| `src/components/Panel/index.tsx`                                                           | §1×1, §4×1                                                                                                                        |
| `src/components/RelatedBlogPosts/RelatedBlogPosts.module.css`                              | §4×1                                                                                                                              |
| `src/components/RelatedBlogPosts/__tests__/RelatedBlogPosts.test.tsx`                      | §4×1                                                                                                                              |
| `src/components/RelatedBlogPosts/index.tsx`                                                | §2×1                                                                                                                              |
| `src/components/RelatedTools/RelatedTools.module.css`                                      | §3×2, §4×1                                                                                                                        |
| `src/components/RelatedTools/index.tsx`                                                    | §4×2, §2×1                                                                                                                        |
| `src/components/SegmentedControl/SegmentedControl.module.css`                              | §2×2, §4×1                                                                                                                        |
| `src/components/SegmentedControl/__tests__/SegmentedControl.test.tsx`                      | §2×1, §4×1                                                                                                                        |
| `src/components/Select/Select.module.css`                                                  | §2×1, §4×1                                                                                                                        |
| `src/components/Select/__tests__/Select.test.tsx`                                          | §4×1                                                                                                                              |
| `src/components/Select/index.tsx`                                                          | §2×1, §4×1, §5×1                                                                                                                  |
| `src/components/ShareButtons/ShareButtons.module.css`                                      | §3×2, §4×2, §8×2, §2×1, §6×1                                                                                                      |
| `src/components/ShareButtons/index.tsx`                                                    | §6×3, §2×2, §8×2, §4×1, §7×1                                                                                                      |
| `src/components/Shinagaki/Shinagaki.module.css`                                            | §4×6, §3×5, §10×3, §8×1                                                                                                           |
| `src/components/Shinagaki/index.tsx`                                                       | §4×4, §3×2                                                                                                                        |
| `src/components/SkipLink/SkipLink.module.css`                                              | §10×3, §2×2, §4×2                                                                                                                 |
| `src/components/Textarea/Textarea.module.css`                                              | §2×1, §4×1                                                                                                                        |
| `src/components/Textarea/__tests__/Textarea.test.tsx`                                      | §2×2, §4×2, §3×1                                                                                                                  |
| `src/components/Textarea/index.tsx`                                                        | §4×2, §2×1, §3×1                                                                                                                  |
| `src/components/ThemeToggle/ThemeToggle.module.css`                                        | §4×3, §10×1, §2×1, §8-5×1                                                                                                         |
| `src/components/ThemeToggle/index.tsx`                                                     | §3×4, §5×1                                                                                                                        |
| `src/components/ToggleSwitch/ToggleSwitch.module.css`                                      | §2×2, §4×2, §10×1, §5×1, §8-5×1                                                                                                   |
| `src/components/ToggleSwitch/index.tsx`                                                    | §2×1, §5×1                                                                                                                        |
| `src/components/Tsutsumi/Tsutsumi.module.css`                                              | §4×4, §7×3, §8×3, §3×1                                                                                                            |
| `src/components/Tsutsumi/index.tsx`                                                        | §4×7, §2×2, §7×2, §8×2                                                                                                            |
| `src/dictionary/_components/DictionaryEntryList/DictionaryEntryList.module.css`            | §3×4, §4×4, §10×2, §2×2, §1×1, §8-2×1, §8-4×1                                                                                     |
| `src/dictionary/_components/DictionaryEntryList/index.tsx`                                 | §2×2, §4×1, §8-2×1, §8-4×1                                                                                                        |
| `src/dictionary/_components/DictionarySearch/DictionarySearch.module.css`                  | §4×4, §10×2, §3×2, §1×1, §2×1, §8-2×1, §8-4×1, §8-5×1                                                                             |
| `src/dictionary/_components/DictionarySearch/index.tsx`                                    | §4×2, §2×1, §7×1, §8×1, §8-4×1                                                                                                    |
| `src/dictionary/_components/FacetIndex/FacetIndex.module.css`                              | §10×3, §4×3, §3×1, §8-5×1                                                                                                         |
| `src/dictionary/_components/FacetIndex/index.tsx`                                          | §4×3, §8-5×2                                                                                                                      |
| `src/dictionary/_components/__tests__/KanjiDetail.test.tsx`                                | §3×1, §4×1, §6×1                                                                                                                  |
| `src/dictionary/_components/color/ColorDetail.module.css`                                  | §3×4, §4×3, §10×2, §2×1, §7×1                                                                                                     |
| `src/dictionary/_components/kanji/KanjiDetail.module.css`                                  | §3×6, §4×5, §10×2, §7×2, §2×1, §6×1                                                                                               |
| `src/dictionary/_components/new/DictionaryDetailLayout.module.css`                         | §4×2, §10×1, §6×1, §7×1                                                                                                           |
| `src/dictionary/_components/new/DictionaryDetailLayout.tsx`                                | §4×1, §7×1                                                                                                                        |
| `src/dictionary/_components/new/PlayRecommendBlock.module.css`                             | §3×4, §4×3, §10×1, §2×1, §8×1                                                                                                     |
| `src/dictionary/_components/new/PlayRecommendBlock.tsx`                                    | §3×1, §4×1, §8-3×1                                                                                                                |
| `src/dictionary/_components/yoji/YojiDetail.module.css`                                    | §3×4, §4×4, §7×2, §10×1, §2×1                                                                                                     |
| `src/dictionary/_components/yoji/YojiDetail.tsx`                                           | §3×1, §4×1                                                                                                                        |
| `src/humor-dict/_components/EntryRatingButton.module.css`                                  | §2×2, §8×1                                                                                                                        |
| `src/humor-dict/_components/EntryRatingButton.tsx`                                         | §2×1, §6×1, §8-6×1                                                                                                                |
| `src/lib/__tests__/fuda-image.test.tsx`                                                    | §8-6×1                                                                                                                            |
| `src/lib/__tests__/ogp-image.test.tsx`                                                     | §8-6×2, §2×1                                                                                                                      |
| `src/lib/__tests__/wairoHex.test.ts`                                                       | §2×1                                                                                                                              |
| `src/lib/analytics.ts`                                                                     | §4×1                                                                                                                              |
| `src/lib/fonts.ts`                                                                         | §3×3, §10×1, §8-7×1                                                                                                               |
| `src/lib/fuda-image.tsx`                                                                   | §4×7, §2×4, §8×3, §3×2, §7×1                                                                                                      |
| `src/lib/ogp-image.tsx`                                                                    | §4×5, §3×4, §2×2, §8×2, §8-6×1                                                                                                    |
| `src/lib/seo.ts`                                                                           | §7×1                                                                                                                              |
| `src/lib/utsuwaHex.ts`                                                                     | §2×1                                                                                                                              |
| `src/lib/wairoHex.ts`                                                                      | §2×3, §4×1                                                                                                                        |
| `src/middleware.ts`                                                                        | §2×2, §3×2, §4×2, §10×1, §8×1, §8-1×1                                                                                             |
| `src/play/_components/RecommendedContent.module.css`                                       | §4×3, §3×2                                                                                                                        |
| `src/play/_components/RelatedContentCard.module.css`                                       | §3×1, §4×1                                                                                                                        |
| `src/play/_components/__tests__/RecommendedContent.test.tsx`                               | §2.4×1                                                                                                                            |
| `src/play/fortune/_components/DailyFortuneCard.module.css`                                 | §10×1, §2×1, §4×1, §5×1, §7×1                                                                                                     |
| `src/play/fortune/_components/DailyFortuneCard.tsx`                                        | §2×1, §4×1, §7×1                                                                                                                  |
| `src/play/fortune/_components/StarRating.module.css`                                       | §2×1                                                                                                                              |
| `src/play/games/_components/new/RelatedBlogPosts.module.css`                               | §4×1                                                                                                                              |
| `src/play/games/_components/new/RelatedGames.tsx`                                          | §3×1                                                                                                                              |
| `src/play/games/irodori/_components/ColorTarget.module.css`                                | §4×1, §8-5×1                                                                                                                      |
| `src/play/games/irodori/_components/FinalResult.tsx`                                       | §6×1                                                                                                                              |
| `src/play/games/irodori/_components/GameContainer.module.css`                              | §2×2                                                                                                                              |
| `src/play/games/irodori/_components/HslSliders.module.css`                                 | §4×1, §8-1×1                                                                                                                      |
| `src/play/games/kanji-kanaru/_components/GameContainer.module.css`                         | §5×1                                                                                                                              |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css`                    | §2×4                                                                                                                              |
| `src/play/games/nakamawake/_components/GameContainer.module.css`                           | §5×1                                                                                                                              |
| `src/play/games/nakamawake/_components/HowToPlayModal.module.css`                          | §2×1                                                                                                                              |
| `src/play/games/nakamawake/_components/SolvedGroups.module.css`                            | §2×1                                                                                                                              |
| `src/play/games/nakamawake/_components/WordGrid.module.css`                                | §2×1                                                                                                                              |
| `src/play/games/shared/_components/new/CountdownTimer.module.css`                          | §7×1                                                                                                                              |
| `src/play/games/shared/_components/new/CrossCategoryBanner.tsx`                            | §2×1, §3×1                                                                                                                        |
| `src/play/games/shared/_components/new/GameDialog.module.css`                              | §10×1, §4×1                                                                                                                       |
| `src/play/games/shared/_components/new/GameShareButtons.module.css`                        | §2×1, §8×1                                                                                                                        |
| `src/play/games/shared/_components/new/NextGameBanner.module.css`                          | §2×2                                                                                                                              |
| `src/play/games/yoji-kimeru/_components/styles/GameContainer.module.css`                   | §5×1                                                                                                                              |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`                      | §2×4                                                                                                                              |
| `src/play/quiz/__tests__/character-personality.test.ts`                                    | §2×1, §4.1×1                                                                                                                      |
| `src/play/quiz/_components/AnimalPersonalityContent.module.css`                            | §4×3, §2×1, §3×1, §8-3×1, §8-4×1                                                                                                  |
| `src/play/quiz/_components/CharacterPersonalityContent.module.css`                         | §4×3, §10×2, §2×1, §3×1, §8-3×1, §8-4×1                                                                                           |
| `src/play/quiz/_components/CompatibilitySection.module.css`                                | §4×1, §5×1, §7×1                                                                                                                  |
| `src/play/quiz/_components/CompatibilitySection.tsx`                                       | §8-6×1                                                                                                                            |
| `src/play/quiz/_components/ContrarianFortuneContent.module.css`                            | §4×3, §10×2, §2×1, §3×1, §8-3×1, §8-4×1                                                                                           |
| `src/play/quiz/_components/FudaActions.module.css`                                         | §4×3, §8×2, §10×1, §2×1, §7×1                                                                                                     |
| `src/play/quiz/_components/FudaActions.tsx`                                                | §3×1, §4×1, §7×1                                                                                                                  |
| `src/play/quiz/_components/ImpossibleAdviceContent.module.css`                             | §4×3, §2×1, §3×1, §8-3×1, §8-4×1                                                                                                  |
| `src/play/quiz/_components/MusicPersonalityContent.module.css`                             | §4×3, §2×1, §3×1, §8-3×1, §8-4×1                                                                                                  |
| `src/play/quiz/_components/OtherTypesNav.module.css`                                       | §3×1, §4×1                                                                                                                        |
| `src/play/quiz/_components/ProgressBar.module.css`                                         | §4×1                                                                                                                              |
| `src/play/quiz/_components/QuestionCard.module.css`                                        | §2×1                                                                                                                              |
| `src/play/quiz/_components/QuizContainer.module.css`                                       | §4×1                                                                                                                              |
| `src/play/quiz/_components/QuizContainer.tsx`                                              | §4×2                                                                                                                              |
| `src/play/quiz/_components/QuizPlayPageLayout.tsx`                                         | §1×1, §7×1                                                                                                                        |
| `src/play/quiz/_components/RadarChart.module.css`                                          | §5×1, §7×1, §8-2×1                                                                                                                |
| `src/play/quiz/_components/RadarChart.tsx`                                                 | §10×1, §2×1, §8-2×1                                                                                                               |
| `src/play/quiz/_components/RelatedQuizzes.module.css`                                      | §3×1, §4×1                                                                                                                        |
| `src/play/quiz/_components/ResultCard.module.css`                                          | §4×5, §2×2, §5×2, §7×2, §3×1, §8-3×1                                                                                              |
| `src/play/quiz/_components/ResultCard.tsx`                                                 | §7×4, §2×2, §4×2, §3×1, §8-6×1                                                                                                    |
| `src/play/quiz/_components/ResultNextContent.module.css`                                   | §4×1                                                                                                                              |
| `src/play/quiz/_components/ResultPageShell.module.css`                                     | §4×2, §7×1                                                                                                                        |
| `src/play/quiz/_components/ResultPageShell.tsx`                                            | §7×4, §2×1, §4×1, §8-6×1                                                                                                          |
| `src/play/quiz/_components/ScienceThinkingResultExtra.module.css`                          | §7×1                                                                                                                              |
| `src/play/quiz/_components/ScienceThinkingResultExtra.tsx`                                 | §2×1                                                                                                                              |
| `src/play/quiz/_components/ShareButtons.module.css`                                        | §8×2, §2×1, §4×1                                                                                                                  |
| `src/play/quiz/_components/TraditionalColorContent.module.css`                             | §4×5, §2×3, §3×2, §8-3×1, §8-4×1                                                                                                  |
| `src/play/quiz/_components/UnexpectedCompatibilityContent.module.css`                      | §4×3, §2×1, §3×1, §8-3×1, §8-4×1                                                                                                  |
| `src/play/quiz/_components/YojiPersonalityContent.module.css`                              | §4×3, §10×2, §2×1, §3×1, §8-3×1, §8-4×1                                                                                           |
| `src/play/quiz/_components/__tests__/RelatedQuizzes.test.tsx`                              | §3×1                                                                                                                              |
| `src/play/quiz/_components/__tests__/ResultCard.test.tsx`                                  | §2×4, §7×2, §2.4×1, §8-6×1                                                                                                        |
| `src/play/quiz/_components/__tests__/ResultPageShell.test.tsx`                             | §4×1, §7×1, §8-6×1                                                                                                                |
| `src/play/quiz/_components/resultVisual.ts`                                                | §2×2, §4×1, §8-6×1                                                                                                                |
| `src/play/quiz/data/character-personality.ts`                                              | §2×2                                                                                                                              |
| `src/test/design-gate.test.ts`                                                             | §2×27, §8×21, §8-1×18, §8-5×13, §8-6×13, §10×12, §8-2×11, §8-7×9, §4×7, §1×1, §3×1, §6×1, §8-11×1, §8-3×1, §8-4×1, §8-8×1, §8-9×1 |
| `src/tools/_components/ErrorBoundary.module.css`                                           | §2×1                                                                                                                              |
| `src/tools/_components/ToolPageLayout/ToolPageLayout.module.css`                           | §4×4, §3×2, §10×1, §7×1                                                                                                           |
| `src/tools/_components/ToolPageLayout/__tests__/ToolPageLayout.test.tsx`                   | §4×3, §3×1, §5×1                                                                                                                  |
| `src/tools/_components/ToolPageLayout/index.tsx`                                           | §3×1                                                                                                                              |
| `src/tools/age-calculator/AgeCalculatorTile.module.css`                                    | §4×1                                                                                                                              |
| `src/tools/age-calculator/AgeCalculatorTile.tsx`                                           | §1×1                                                                                                                              |
| `src/tools/base64/Base64Tile.tsx`                                                          | §1×1                                                                                                                              |
| `src/tools/bmi-calculator/BmiCalculatorTile.module.css`                                    | §2×4, §4×3, §7×2                                                                                                                  |
| `src/tools/bmi-calculator/BmiCalculatorTile.tsx`                                           | §1×1, §3×1                                                                                                                        |
| `src/tools/bmi-calculator/__tests__/BmiCalculatorTile.test.tsx`                            | §2×2, §6×1                                                                                                                        |
| `src/tools/business-email/BusinessEmailTile.module.css`                                    | §4×1                                                                                                                              |
| `src/tools/business-email/BusinessEmailTile.tsx`                                           | §1×1                                                                                                                              |
| `src/tools/byte-counter/ByteCounterTile.module.css`                                        | §4×1                                                                                                                              |
| `src/tools/byte-counter/ByteCounterTile.tsx`                                               | §1×1                                                                                                                              |
| `src/tools/char-count/CharCountTile.module.css`                                            | §4×1                                                                                                                              |
| `src/tools/char-count/CharCountTile.tsx`                                                   | §1×1                                                                                                                              |
| `src/tools/color-converter/ColorConverterTile.module.css`                                  | §2×2, §3×1, §4×1                                                                                                                  |
| `src/tools/color-converter/ColorConverterTile.tsx`                                         | §1×1                                                                                                                              |
| `src/tools/cron-parser/CronParserTile.module.css`                                          | §2×1, §4×1                                                                                                                        |
| `src/tools/cron-parser/CronParserTile.tsx`                                                 | §1×1                                                                                                                              |
| `src/tools/csv-converter/CsvConverterTile.module.css`                                      | §2×1, §3×1, §4×1                                                                                                                  |
| `src/tools/csv-converter/CsvConverterTile.tsx`                                             | §1×1                                                                                                                              |
| `src/tools/date-calculator/DateCalculatorTile.tsx`                                         | §1×1                                                                                                                              |
| `src/tools/dummy-text/DummyTextTile.tsx`                                                   | §1×1                                                                                                                              |
| `src/tools/email-validator/EmailValidatorTile.module.css`                                  | §2×2, §4×1                                                                                                                        |
| `src/tools/email-validator/EmailValidatorTile.tsx`                                         | §1×1, §3×1                                                                                                                        |
| `src/tools/fullwidth-converter/FullwidthConverterTile.tsx`                                 | §1×1                                                                                                                              |
| `src/tools/hash-generator/HashGeneratorTile.tsx`                                           | §1×1                                                                                                                              |
| `src/tools/html-entity/HtmlEntityTile.tsx`                                                 | §1×1                                                                                                                              |
| `src/tools/image-base64/ImageBase64Tile.module.css`                                        | §4×1                                                                                                                              |
| `src/tools/image-base64/ImageBase64Tile.tsx`                                               | §1×1                                                                                                                              |
| `src/tools/image-resizer/ImageResizerTile.module.css`                                      | §2×2, §3×1                                                                                                                        |
| `src/tools/image-resizer/ImageResizerTile.tsx`                                             | §1×1, §3×1                                                                                                                        |
| `src/tools/image-resizer/__tests__/ImageResizerTile.test.tsx`                              | §3×4                                                                                                                              |
| `src/tools/json-formatter/JsonFormatterTile.tsx`                                           | §1×1                                                                                                                              |
| `src/tools/kana-converter/KanaConverterTile.tsx`                                           | §1×1                                                                                                                              |
| `src/tools/keigo-reference/KeigoReferenceTile.module.css`                                  | §2×1                                                                                                                              |
| `src/tools/keigo-reference/KeigoReferenceTile.tsx`                                         | §1×2                                                                                                                              |
| `src/tools/line-break-remover/LineBreakRemoverTile.tsx`                                    | §1×1                                                                                                                              |
| `src/tools/markdown-preview/MarkdownPreviewTile.tsx`                                       | §1×1                                                                                                                              |
| `src/tools/number-base-converter/NumberBaseConverterTile.tsx`                              | §1×1                                                                                                                              |
| `src/tools/password-generator/PasswordGeneratorTile.module.css`                            | §2×2, §1×1                                                                                                                        |
| `src/tools/password-generator/PasswordGeneratorTile.tsx`                                   | §1×2, §5×1                                                                                                                        |
| `src/tools/percent-calculator/PercentCalculatorTile.module.css`                            | §4×1                                                                                                                              |
| `src/tools/qr-code/QrCodeTile.tsx`                                                         | §1×1                                                                                                                              |
| `src/tools/regex-tester/RegexTesterTile.module.css`                                        | §3×1, §4×1                                                                                                                        |
| `src/tools/regex-tester/RegexTesterTile.tsx`                                               | §1×1                                                                                                                              |
| `src/tools/sql-formatter/SqlFormatterTile.module.css`                                      | §4×1                                                                                                                              |
| `src/tools/sql-formatter/SqlFormatterTile.tsx`                                             | §1×1, §5×1                                                                                                                        |
| `src/tools/text-diff/TextDiffTile.module.css`                                              | §4×1                                                                                                                              |
| `src/tools/text-diff/TextDiffTile.tsx`                                                     | §1×1                                                                                                                              |
| `src/tools/text-replace/TextReplaceTile.tsx`                                               | §1×1                                                                                                                              |
| `src/tools/traditional-color-palette/TraditionalColorPaletteTile.tsx`                      | §1×1                                                                                                                              |
| `src/tools/unit-converter/UnitConverterTile.tsx`                                           | §1×1, §3×1                                                                                                                        |
| `src/tools/unix-timestamp/UnixTimestampTile.tsx`                                           | §1×1                                                                                                                              |
| `src/tools/url-encode/UrlEncodeTile.tsx`                                                   | §1×1                                                                                                                              |
| `src/tools/yaml-formatter/YamlFormatterTile.tsx`                                           | §1×1                                                                                                                              |

### 付録 C-3: 店語彙ラベルを引いている参照（69 件・逐語）

- `src/components/Pagination/Pagination.module.css:4` — * §4「ページネーションは店構え（罫・文字・現在地朱・ピル禁止）」に従い、塗りの
- `src/components/In/In.module.css:2` — * 印（In）— 成果物に捺す店の印（DESIGN.md §4「印」の厳密仕様）。
- `src/components/In/index.tsx:4` — /** 回転の許容範囲（DESIGN.md §4「印」: ±8° 以内）。逸脱を型と実装の両方で締める。 */
- `src/components/In/index.tsx:9` — * 印の一文字（明朝で組む）。DESIGN.md §4「印」は「文字1字」を厳密仕様とするため、
- `src/components/In/index.tsx:19` — * 表示サイズ（CSS 長さ・幅=高さ）。§4「大きさは包み幅の 1/5 以下」。
- `src/components/In/index.tsx:31` — * 印（In）— 成果物に捺す店の印（DESIGN.md §4「印」の厳密仕様）。
- `src/components/ShareButtons/ShareButtons.module.css:2` — * ShareButtons — 共有ボタン群（DESIGN.md §4「札」/§8 準拠の店構え版）。
- `src/components/ShareButtons/index.tsx:34` — * ShareButtons — 共有ボタン群（DESIGN.md §4「札」/§6/§8 準拠の店構え版）。
- `src/components/Tsutsumi/Tsutsumi.module.css:2` — * 包み（Tsutsumi）— 「見せたくなる結果」の結果カード（DESIGN.md §4「包み」/§7）。
- `src/components/Tsutsumi/Tsutsumi.module.css:24` — /* 見出し帯: 店号（出所）と品名（何の結果か）。札単体で出所が読めるように（§4「札」）。 */
- `src/components/Tsutsumi/Tsutsumi.module.css:49` — * 印: 成果物に一つだけ・右上に捺す。§4「大きさは包み幅の 1/5 以下」。
- `src/components/Tsutsumi/index.tsx:46` — * 店号（札として単独で持ち帰った画像からも出所が分かるように・DESIGN.md §4「札」）。
- `src/components/Tsutsumi/index.tsx:71` — * 包み（Tsutsumi）— 「見せたくなる結果」の結果カード（DESIGN.md §4「包み」/§7）。
- `src/components/Tsutsumi/index.tsx:78` — * - 単独で持ち帰れる画像（札）として成立する構図——店号・品名・結果が画像単体で読める（§4「札」）。
- `src/components/Tsutsumi/index.tsx:108` — {/* 印は成果物に一つだけ捺す。§4「大きさは包み幅の 1/5 以下」を .seal 側の幅で担保する。 */}
- `src/components/Header/Header.module.css:2` — * Header（のれん）— DESIGN.md §4「のれん」。
- `src/components/Header/index.tsx:60` — * デザイン（DESIGN.md §4「のれん」）:
- `src/components/ThemeToggle/ThemeToggle.module.css:6` — * - トラック/サムは pill（999px/50%）を撤去し、§4「角丸は0px基調・例外は値札/入力欄の2px」
- `src/components/Shinagaki/Shinagaki.module.css:2` — * 品書き（Shinagaki）— 一覧の既定形（DESIGN.md §4「品書き」）。
- `src/components/Shinagaki/Shinagaki.module.css:56` — * 品名: 一覧の主役。§4「品名（リンク・墨）」に従い既定は墨、明朝で組む。
- `src/components/Shinagaki/index.tsx:47` — * 品書き（Shinagaki）— 一覧の既定形（DESIGN.md §4「品書き」）。
- `src/components/SkipLink/SkipLink.module.css:5` — * 見た目は DESIGN.md §2/§4「店構え」トークン、可視性・タップ標的は §10 に従う。
- `src/components/RelatedBlogPosts/__tests__/RelatedBlogPosts.test.tsx:171` — // §4「品書き」の行リンクはカードではないため角丸は不要（旧トークン痕跡の不在で確認する）。
- `src/components/RelatedBlogPosts/RelatedBlogPosts.module.css:3` — * §4「品書き（一覧の既定形）」: 罫区切りのリストで組む。器は静か——背景色・角丸装飾なし。
- `src/components/Nefuda/Nefuda.module.css:2` — * 値札（Nefuda）— メタ情報の小ラベル（DESIGN.md §4「値札」・§3 補助情報の字サイズ）。
- `src/components/Nefuda/index.tsx:7` — * DESIGN.md §4「値札は情報であって装飾ではない——中身の無いラベルを貼らない」に従い、
- `src/components/Nefuda/index.tsx:14` — * 値札（Nefuda）— メタ情報の小ラベル（DESIGN.md §4「値札」）。
- `src/components/RelatedTools/RelatedTools.module.css:3` — * §4「品書き（一覧の既定形）」: カードのグリッドではなく罫区切りのリストで組む
- `src/components/RelatedTools/index.tsx:19` — * として並べる（PlayRecommendBlock と同型・§4「一覧の既定は品書き」）
- `src/app/dictionary/yoji/page.tsx:28` — * 構成（§1「器は静か」/ §4「一覧の既定は品書き」/ §6 文章 / §7「実務辞典は引く体験が主役」）:
- `src/app/dictionary/yoji/page.tsx:32` — * リンク）+ ひとこと（note）+ 収録数の値札（Nefuda・§4「件数は値札で」）。件数の多い順に並べる。
- `src/app/dictionary/page.tsx:55` — * 構成（§1「器は静か」/ §4「一覧の既定は品書き」/ §6 文章）:
- `src/app/dictionary/kanji/grade/[grade]/page.tsx:20` — * 学年で絞ったので値札は重複を避け画数を添える（§4「値札は情報であって装飾ではない」）。
- `src/app/dictionary/humor/page.tsx:13` — * 全廃し、§4「一覧の既定は品書き（罫区切りリスト）」に沿って作り直した。器は静か（紙墨朱・罫・
- `src/app/dictionary/humor/page.module.css:83` — /* 見出し語: 一覧の主役。§4「品名（リンク・墨）」に従い墨、§3 に従い明朝で組む。 */
- `src/app/dictionary/colors/page.tsx:47` — // 件数は値札（Nefuda）で各棚に添える（§4「メタは値札で・中身のあるものだけ」）。
- `src/app/play/[slug]/page.module.css:10` — * （§4「本文・品書きは左揃え基調」）。左寄せの読み幅で運用する。 */
- `src/app/play/character-personality/result/[resultId]/opengraph-image.tsx:14` — * 画像は「札（Tsutsumi の視覚言語）」で組む（DESIGN.md §4「札」/「印」・§2 和色・§8）。
- `src/app/play/traditional-color/result/[resultId]/opengraph-image.tsx:14` — * 画像は「札（Tsutsumi の視覚言語）」で組む（DESIGN.md §4「札」/「印」・§8）。
- `src/app/tools/page.tsx:15` — * 構成（§1「器は静か」/ §4「一覧の既定は品書き」/ §6 文章）:
- `src/app/tools/page.tsx:20` — * （§4「値札は情報であって装飾ではない」——全行共通になる情報はラベル化しない）。
- `src/blog/_components/BlogFilterableList.module.css:4` — * （§4「一覧の既定は品書き」・§8「ピル形状のボタン禁止」）。全トークン経由・直書きなし（§10）。
- `src/blog/_components/BlogList.module.css:2` — * ブログ記事一覧 — 品書き（DESIGN.md フェーズ R「店構え」・§4「一覧の既定は品書き」）。
- `src/blog/_components/TagList.module.css:3` — * §4「値札は罫囲みの静かな器」に従い、背景ベタ塗り・ピル角丸を撤去し
- `src/dictionary/_components/new/PlayRecommendBlock.module.css:3` — * DESIGN.md §4「品書き」の流儀: 罫区切りのリスト（カードのグリッド・色付き左罫・絵文字は使わない）。
- `src/dictionary/_components/new/PlayRecommendBlock.module.css:65` — /* 品名: 一覧の主役。§4「品名（明朝リンク・墨）」——静止は墨、hover で朱＋下線（§3 リンク専有）。 */
- `src/dictionary/_components/DictionaryEntryList/DictionaryEntryList.module.css:62` — /* 品名: 一覧の主役。§4「品名（リンク・墨）」・§3 明朝で組む。 */
- `src/dictionary/_components/DictionarySearch/DictionarySearch.module.css:26` — * 入力欄（店構え）。§4「角丸の例外は値札と入力欄のみ（--radius-sm=2px）」に従う。
- `src/play/_components/RecommendedContent.module.css:3` — * §4「品書き（一覧の既定形）」: カードのグリッドではなく罫区切りの一覧で組む
- `src/play/_components/RecommendedContent.module.css:72` — /* カテゴリの値札（DESIGN.md §4「値札」）。中身のある情報として添える。 */
- `src/play/_components/RelatedContentCard.module.css:6` — * §4「品書き（一覧の既定形）」: カードのグリッドではなく罫区切りの一覧で組む
- `src/play/quiz/_components/ResultCard.tsx:497` — // 結果を包み（Tsutsumi）で見せる（DESIGN.md §4「包み」/§7「見せたくなる結果」）。
- `src/play/quiz/_components/FudaActions.module.css:2` — * 札（結果画像）の保存/共有アクション。DESIGN.md §4「札」/§7/§8/§10。
- `src/play/quiz/_components/FudaActions.tsx:4` — * FudaActions — 「札（結果画像）」の保存/共有アクション（DESIGN.md §4「札」/§7「見せたくなる結果」）。
- `src/play/quiz/_components/ResultNextContent.module.css:66` — /* カテゴリ値札（診断/クイズ/パズル等・DESIGN.md §4「値札」語彙・radius-sm 例外）。 */
- `src/play/quiz/_components/ShareButtons.module.css:2` — * 結果カードのシェアボタン群。DESIGN.md §4「札」/§8。
- `src/play/quiz/_components/ResultPageShell.tsx:77` — // 結果を包み（Tsutsumi）で見せる（DESIGN.md §4「包み」/§7「見せたくなる結果」）。
- `src/play/quiz/_components/resultVisual.ts:67` — * DESIGN.md §4「包み」の symbol は「絵文字ではなく漢字/かな1字の『顔』になる字」。
- `src/play/fortune/_components/DailyFortuneCard.module.css:2` — * 今日のユーモア運勢カード — DESIGN.md フェーズR・店構え（§4「包み」/§7「見せたくなる結果」）。
- `src/play/fortune/_components/DailyFortuneCard.tsx:33` — * デザイン（DESIGN.md §4「包み」/§7「見せたくなる結果」）: 占いは診断・ゲームと同じく
- `src/play/games/_components/new/RelatedBlogPosts.module.css:3` — * §4「品書き（一覧の既定形）」: 罫区切りのリストで組む。器は静か——背景色・角丸装飾なし。
- `src/lib/ogp-image.tsx:12` — * 和色はいっさい使わない（DESIGN §2/§4「和色は結果の包みに限る・器へ漏らさない」）。
- `src/lib/ogp-image.tsx:30` — /** 店号（カード単体で出所 yolos.net が読めるように・DESIGN §4「のれん」）。 */
- `src/lib/fuda-image.tsx:18` — * （DESIGN.md §4「包み」/「札」/「印」・§7・§8）。
- `src/lib/fuda-image.tsx:41` — /** 店号（札単体で出所が読めるように・DESIGN §4「札」）。 */
- `src/lib/fuda-image.tsx:43` — /** 印の一字の既定（診断の「診」・§4「印」）。呼び出し側が sealChar で上書きできる。 */
- `src/lib/fuda-image.tsx:66` — * 品名（何の結果か・"あなたに似たキャラ診断" 等・DESIGN §4「札」）。
- `src/lib/fonts.ts:5` — * - 見出し明朝: DESIGN.md §3「見出し・店号・品名」の明朝系 Web フォント1書体。
- `src/lib/wairoHex.ts:10` — * ライト固定の根拠（DESIGN §2/§4「札」）: OG は 1枚の PNG で light/dark を切り替えられない。
