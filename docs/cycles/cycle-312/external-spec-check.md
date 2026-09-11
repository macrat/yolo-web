# 外部仕様への依存の再確認（一次資料）

確認日: **2026-09-11**（全項目、この日にアクセス）
対象: `DESIGN.md` §10 / `docs/site-concept.md`（中心原則の弁別子・判断基準1-3・ガード rule 3・TW-B）

---

## 主張1: oklch の対応状況（DESIGN.md §10）

> 前提: 色は oklch で定義する（2026年時点で主要ブラウザ全対応。非対応環境は対象外とする）。

### 結論: **現在も成立する**

### 一次資料

| 資料                                                                         | URL                                                                                 | 確認日     |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| MDN `oklch()`                                                                | https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch                  | 2026-09-11 |
| MDN browser-compat-data（`css/types/color.json` の `oklch`）                 | https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/types/color.json | 2026-09-11 |
| W3C WebDX Baseline（webstatus.dev API, feature `oklab` = "Oklab and OkLCh"） | https://api.webstatus.dev/v1/features/oklab                                         | 2026-09-11 |
| caniuse-db（feature `css-lch-lab`）                                          | https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/css-lch-lab.json  | 2026-09-11 |

### 原文の該当箇所

MDN（ページ冒頭の Baseline バッジ）:

> **Baseline: Widely available**
>
> This feature is well established and works across many devices and browser versions. It's been available across browsers since May 2023.

MDN browser-compat-data（`css.types.color.oklch.__compat.support`、原文 JSON）:

```
chrome   {"version_added": "111"}
edge     "mirror"          (= chrome 111)
firefox  {"version_added": "113"}
safari   {"version_added": "15.4"}
safari_ios / chrome_android / samsunginternet_android / webview_android / opera : "mirror"
status: {"experimental": false, "standard_track": true, "deprecated": false}
spec_url: https://drafts.csswg.org/css-color/#ok-lab
```

W3C WebDX Baseline（`feature_id: "oklab"`, `name: "Oklab and OkLCh"`、原文 JSON）:

```
"baseline": { "status": "widely", "low_date": "2023-05-09", "high_date": "2025-11-09" }
"browser_implementations": {
  "chrome":  {"version":"111",  "date":"2023-03-07"},
  "edge":    {"version":"111",  "date":"2023-03-13"},
  "firefox": {"version":"113",  "date":"2023-05-09"},
  "safari":  {"version":"15.4", "date":"2022-03-14"},
  "safari_ios": {"version":"15.4","date":"2022-03-14"},
  "chrome_android": {"version":"111"}, "firefox_android": {"version":"113"}
}
```

caniuse-db `css-lch-lab`（"LCH and Lab color values"、原文 JSON の値）:

```
"status": "cr"
"usage_perc_y": 93.28   （完全対応のグローバルトラフィック比率）
"usage_perc_a": 0        （部分対応なし）
```

### 事実（修正が要るかどうか）

- 「主要ブラウザ全対応」は正しい。4ブラウザすべてで **2023-05-09（Firefox 113）以降** 対応済み。Safari は 2022-03-14（15.4）が最初。
- Baseline のステータスは 2026-09-11 時点で **Widely available**（広範囲に利用可能）に昇格済み。昇格日は **2025-11-09**。「2026年時点で主要ブラウザ全対応」という記述は、より強い表現（Baseline Widely available）に置き換え可能な事実がある。
- グローバル対応率の数値は **93.28%**（caniuse-db、feature `css-lch-lab`）。ただしこの feature は `lab()` `lch()` `oklab()` `oklch()` を束ねた集計であり、`oklch()` 単独の数値ではない。また caniuse は Safari の初対応を `15`（lab/lch ベース）としており、BCD の `oklch` 固有の `15.4` とずれる。**`oklch()` 単独のグローバル対応率を示す一次資料は見つからなかった**（W3C/ブラウザベンダの公式資料に対応率の数値はない）。
- 「非対応環境は対象外とする」を数値で裏づけるなら、上記の 93.28%（約 6.7% が非対応）が最も近い公開値だが、上記のとおり厳密には oklch 単独の値ではない。

---

## 主張2: scaled content abuse のポリシー（site-concept 判断基準1-3）

> 薄いページの量産は、品質の憲法違反（rule 4）であると同時に検索エンジンのスパム認定（scaled content abuse）の直撃圏である。

### 結論: **現在も成立する**（名称・定義とも維持。ただし 2026 年に**追加された新しい適用例**があり、site-concept が想定していない禁止パターンが一つ増えている）

### 一次資料

| 資料                                                                                         | URL                                                                                                         | 確認日     | 最終更新                        |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------- |
| Google Search Central「Spam policies for Google web search」                                 | https://developers.google.com/search/docs/essentials/spam-policies                                          | 2026-09-11 | **Last updated 2026-08-28 UTC** |
| Google Search Central「Optimizing your website for generative AI features on Google Search」 | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide                                | 2026-09-11 | **Last updated 2026-07-10 UTC** |
| Search Quality Rater Guidelines §4.6.5                                                       | https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf | 2026-09-11 | 版: **September 11, 2025**      |

### 原文の該当箇所

spam-policies ページ、見出しは **"Scaled content abuse"**（名称変更なし）:

> Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users. This abusive practice is typically focused on creating large amounts of unoriginal content that provides little to no value to users, no matter how it's created.
>
> Examples of scaled content abuse include, but aren't limited to:
>
> - Using generative AI tools or other similar tools to generate many pages without adding value for users
> - Scraping feeds, search results, or other content to generate many pages (including through automated transformations like synonymizing, translating, or other obfuscation techniques), where little value is provided to users
> - Stitching or combining content from different web pages without adding value
> - Creating multiple sites with the intent of hiding the scaled nature of the content
> - Creating many pages where the content makes little or no sense to a reader but contains search keywords

Search Quality Rater Guidelines §4.6.5 Scaled Content Abuse（原文）:

> Creating an abundance of content with little effort or originality with no editing or manual curation is often the defining attribute of spammy websites.
>
> Scaled content abuse is a spam practice described in the Google Search Web Spam Policies. Scaled content abuse occurs when many pages are generated for the purpose of primarily benefiting the website owner and not helping users. (…)
>
> Pages and websites made up of content created at scale with no original content or added value for users, should be rated **Lowest**, no matter how they are created. Even if you are unsure of the method of creation, e.g. whether or not the page is created using generative AI tools, you should still use the **Lowest** rating when you strongly suspect scaled content abuse after looking at several pages on the website.

同 §4.6.6（AI 使用そのものは判定材料にならないという明示）:

> Likewise, the use of Generative AI tools alone does not determine the level of effort or Page Quality rating. Generative AI tools may be used for high quality and low quality content creation. For example, a high level of effort may be involved in creating high quality original artwork using Generative AI tools. However, it's also possible to use Generative AI tools to create **Lowest** quality content with little to no effort, little to no originality, and little to no added value for website visitors.

**2026 年に追加された適用例**（AI 最適化ガイド、Last updated 2026-07-10）:

> **Focus on what your users want, and avoid overdoing it.** While it might be tempting to create separate content for every possible variation of how people might search (for example, by focusing on other queries that people have asked, or fan-out queries), doing so primarily to manipulate rankings or generative AI responses in Google Search violates Google's scaled content abuse spam policy. This is also an ineffective long-term strategy, as a high quantity of pages doesn't make a website higher quality or more relevant to users. Google's AI systems have advanced even further and improved upon our ability to understand the relevance of pages, even when there is no exact match between the query and the page's primary content.

### 事実（修正が要る場合、どう書き換えるべきか）

- 方針は**現存し、名称も "Scaled content abuse" のまま**。定義の骨格（「多数のページを生成」「非オリジナル」「ユーザーに価値がない」「作り方は問わない」）も維持。site-concept の記述は修正不要。
- 定義文には 2つの言い回しが併存する事実がある: spam-policies ページは「**for the primary purpose of manipulating search rankings** and not helping users」、Rater Guidelines は「for the purpose of **primarily benefiting the website owner** and not helping users」。判定基準として引くならどちらを引いたか明示できる。
- **AI 生成であること自体は違反要件に含まれない**。違反要件は「量 × 非オリジナル × 無価値」。`no matter how it's created` / `the use of Generative AI tools alone does not determine the level of effort or Page Quality rating` が該当箇所。
- **新規に確認された事実**: 「検索のされ方のバリエーションごとに別ページを作る」「（AI 検索の）fan-out クエリ狙いでページを量産する」ことが、2026-07-10 版の公式ガイドで **scaled content abuse 違反として名指しされた**。site-concept の判断基準1-2（需要＝クエリから出発する）と1-3（独立したユーザー価値）を運用するとき、「クエリ差分ごとにページを割る」設計が違反側に落ちることが公式に明文化されている。site-concept はこのパターンを現状明示していない。

---

## 主張3: AI 生成コンテンツの明示に関する Google の立場（site-concept ガード rule 3）

> rule 3（AI 明示）: AI 運営の明示を維持する。人間の著者を装う偽装は検索品質評価上も最低評価に直行し、明示はむしろ保護的に働く（一次資料確認済み）。

### 結論: **部分的に修正が必要**

- 前半（**偽装は最低評価に直行**）＝ 成立する。ただし根拠は「AI であることを隠すと Lowest」という AI 固有の規定ではなく、**制作者に関する欺瞞一般**の規定である。
- 後半（**明示はむしろ保護的に働く**）＝ **一次資料にこの主張を支持する記述はない**。Rater Guidelines にも Search Central にも「開示すると評価が上がる／守られる」という趣旨の文は存在しない。存在するのは「期待される場面では開示を検討せよ」という**推奨**にとどまる。

### 一次資料

| 資料                                                                              | URL                                                                                                         | 確認日     | 版・更新日                                                                             |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| Search Quality Rater Guidelines (PDF, 182 pages)                                  | https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf | 2026-09-11 | 表紙記載 **"General Guidelines September 11, 2025"** / 各ページフッタ "Copyright 2025" |
| Google Search Central Blog「Google Search's guidance about AI-generated content」 | https://developers.google.com/search/blog/2023/02/google-search-and-ai-content                              | 2026-09-11 | Wednesday, February 8, 2023（現在も掲載中・撤回なし）                                  |
| Google Search Central「Creating helpful, reliable, people-first content」         | https://developers.google.com/search/docs/fundamentals/creating-helpful-content                             | 2026-09-11 | **Last updated 2025-12-10 UTC**                                                        |

**版の日付について**: 2026-09-11 に上記の公式 PDF URL（Google が常に最新版を置く正規 URL）から取得した版は **September 11, 2025** 付。すなわち確認日時点の最新版はちょうど1年前の版で、2026年内の改訂版は公開されていない。

### 原文の該当箇所

**(a) 偽装が Lowest に直行することの根拠**（QRG §4.5.3 Deceptive Page Purpose, Deceptive Information about the Website, Deceptive Design、p.36）:

> All pages or websites using deception of any type should be rated **Lowest** because they are Untrustworthy. Here are some types of deception to look for during Page Quality rating.
>
> | Type of Deception | Description |
> | Deceptive Purpose | The page or the website superficially appear to have one purpose, but in fact exist for a different reason. |
> | **Deceptive Information about the Website or Content Creators** | The website has deliberately inaccurate or misleading information about the website or content creators to make the website appear trustworthy. |
> | Deceptive Design | The page or content is deliberately designed to look like one type of page or content but in fact functions as another. |

同 §4.5（p.35、Untrustworthy の一覧）:

> Pages with the following characteristics should be considered Untrustworthy: (…) ● Inadequate information about the website or content creator for its purpose (…) ● Deceptive purpose, deceptive page design, or deceptive intent

同 §4.5.1（p.35）:

> As discussed in Section 2.5.3, we expect most websites to have some information about who (e.g., what individual, company, business, foundation, etc.) is responsible for the website and who created the MC and some contact information, unless there is a good reason for anonymity.

**重要**: QRG は「生成 AI」を §2.1 で定義し（p.10）、§4.6.5 / §4.6.6 / 事例（p.55, p.58）で扱うが、**「AI 生成であることを開示しないと Lowest」という条項は存在しない**。AI が Lowest に結びつくのはすべて「量産 × 非オリジナル × 無価値」の経路であり、開示の有無ではない。QRG 内で `disclos*` が出現するのは p.54（アフィリエイト開示）と p.57（sponsored content の開示）の2箇所のみで、いずれも AI 開示ではない。しかも p.57 の事例は、**開示があってもなお Lowest**という例である:

> The page goes on to disclose: "Articles attributed to this byline are authored by paying advertisers. (…)" (…) In addition to site reputation abuse, there are also potentially misleading and untrustworthy aspects to this article that warrant a Lowest rating: ● **Even though there is a disclaimer, the content could be mistaken for an article written by the newspaper.**

**(b) 開示についての Google の実際の言明**（Search Central Blog, 2023-02-08 の FAQ、原文）:

> **Should I add AI or automation disclosures to my content?**
> AI or automation disclosures are useful for content where someone might think "How was this created?". Consider adding these when it would be reasonably expected.

> **Can I list AI as the author of content?**
> Giving AI an author byline is probably not the best way to follow our recommendation to make clear to readers when AI is part of the content creation process.

> **Should I add author bylines to all my content?**
> You should consider having accurate author bylines when readers would reasonably expect it, such as to any content where someone might think, "Who wrote this?"

> **Is AI content against Google Search's guidelines?**
> Appropriate use of AI or automation is not against our guidelines. This means that it is not used to generate content primarily to manipulate search rankings, which is against our spam policies.

> Our focus on the quality of content, rather than how content is produced, is a useful guide that has helped us deliver reliable, high quality results to users for years.

**(c) 「How」の開示に関する公式ガイダンス**（Creating helpful, reliable, people-first content、Last updated 2025-12-10、原文）:

> **How (the content was created)** (…) Many types of content may have a "How" component to them. That can include automated, AI-generated, and AI-assisted content. Sharing details about the processes involved can help readers and visitors better understand any unique and useful role automation may have served.
>
> If automation is used to substantially generate content, here are some questions to ask yourself:
>
> - Is the use of automation, including AI-generation, self-evident to visitors through disclosures or in other ways?
> - Are you providing background about how automation or AI-generation was used to create content?
> - Are you explaining why automation or AI was seen as useful to produce content?
>
> Overall, AI or automation disclosures are useful for content where someone might think "How was this created?" Consider adding these when it would be reasonably expected.

> **Who (created the content)** (…) If you're clearly indicating who created the content, you're likely aligned with the concepts of E-E-A-T and on a path to success. We strongly encourage adding accurate authorship information, such as bylines to content where readers might expect it.

### 事実（修正が要る場合、どう書き換えるべきか）

以下の事実に合わせて書き換えが必要:

1. **「人間の著者を装う偽装は最低評価に直行」は成立する**が、根拠条項は AI 固有ではない。QRG §4.5.3 の "Deceptive Information about the Website or Content Creators"（「制作者について意図的に不正確・誤解を招く情報を置き、サイトを信頼できるように見せる」）に該当し、その場合 "All pages or websites using deception of any type should be rated Lowest" が適用される。
2. **「明示はむしろ保護的に働く」を支持する一次資料の記述はない**。QRG に開示が評価を上げる／守るという条項はない。逆に QRG p.57 は「開示があっても、読者が新聞社の記事と誤解しうるなら Lowest」という事例を載せており、**開示は誤認の防止として機能して初めて意味を持つ**（免罪符にはならない）。
3. Google の公式ガイダンス上の位置づけは **推奨**である: 「"How was this created?" と思われうるコンテンツには AI／自動化の開示が有用。合理的に期待される場面では追加を検討せよ」。つまり「開示すべき場面では開示せよ」であって「開示すれば保護される」ではない。
4. **AI を著者名（byline）に置くことは公式に非推奨**: "Giving AI an author byline is probably not the best way to follow our recommendation to make clear to readers when AI is part of the content creation process."。一方で「AI が作ったことを読者に明らかにする」こと自体は Google の recommendation として明示されている。site-concept の「よろず屋の店主が AI である」という自己記述が**著者 byline として実装されているか、運営主体の開示として実装されているか**で、この一次資料の当否が分かれる。
5. AI 使用そのものはガイドライン違反ではない（"Appropriate use of AI or automation is not against our guidelines."）。「明示しないと違反」という規定も存在しない。つまり constitution rule 3 の明示義務は Google の要求ではなく**当サイト独自の規律**であり、Google の資料から導けるのは「偽装は Lowest」「期待される場面では開示が有用」までである。
6. QRG の版は **September 11, 2025**。site-concept が「一次資料確認済み」と書く際に参照した版の日付を記載できる。

---

## 主張4: ゼロクリック／SERP の構造変化（site-concept 中心原則の弁別子・TW-B）

> 弁別子: 「その価値は、検索結果の画面上でテキストとして配達しきれるか（＝来訪せずに得られるか）」。配達しきれるなら外（参照型）…これらはゼロクリック環境で構造的に訪問を失う。
> TW-B: 検索エンジンの SERP 挙動の変化（ウィジェット/AI 回答の適用拡大）が弁別子の線引きを侵食 → 弁別子を再検証。

### 結論: **部分的に修正が必要**

- **AI Overviews / AI Mode の適用拡大は公式に確認できる**（範囲・規模とも公式発表あり）。前提の「適用拡大」は成立する。
- **「ゼロクリックで訪問を失う」を支持する Google 公式の数値は存在しない**。Google 公式は逆に「総オーガニッククリック量は前年比でおおむね横ばい」と主張しており、第三者の減少レポートを名指しで否定している。したがって弁別子の「参照型は訪問を失う」という主張は、**Google 公式には支持も数値化もされていない**（当サイト自身の実測による主張として保持するのは可能だが、外部の公式裏づけはない）。

### 一次資料

| 資料                                                                                                                     | URL                                                                                                              | 確認日     | 公開日                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------- |
| Google blog「AI Overviews are now available in over 200 countries and territories, and more than 40 languages」          | https://blog.google/products-and-platforms/products/search/ai-overview-expansion-may-2025-update/                | 2026-09-11 | **2025-05-20**                                          |
| Google blog「AI Mode is now available in more languages and locations around the world」                                 | https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/                  | 2026-09-11 | **2025-10-07**                                          |
| Google blog「Google Search's I/O 2026 updates: AI agents and more」                                                      | https://blog.google/products-and-platforms/products/search/search-io-2026/                                       | 2026-09-11 | **2026-05-19**                                          |
| Google blog「New opportunities, control and insights for website owners」（Mrinalini Loew, GM, Google Search Ecosystem） | https://blog.google/products-and-platforms/products/search/new-controls-website-owners/                          | 2026-09-11 | **2026-06-03**（Updated 2026-08-31）                    |
| Google blog「AI in Search is driving more queries and higher quality clicks」（Liz Reid, VP, Head of Google Search）     | https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/ | 2026-09-11 | **2025-08-06**                                          |
| Search Central Blog「Introducing Search Generative AI performance reports in Search Console」                            | https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports                                     | 2026-09-11 | **2026-06-03**（Note: As of 2026-08-31 全サイトへ展開） |
| Search Central「AI Features and Your Website」                                                                           | https://developers.google.com/search/docs/appearance/ai-features                                                 | 2026-09-11 | Last updated 2025-12-10 UTC                             |
| Search Central「Optimizing your website for generative AI features on Google Search」                                    | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide                                     | 2026-09-11 | Last updated 2026-07-10 UTC                             |

### 原文の該当箇所

**(a) 適用範囲（公式）**

AI Overviews（2025-05-20、blog.google、原文）:

> AI Overviews are now available in more than 200 countries and territories and in more than 40 languages

同記事はさらに「米国・インドなどの主要市場で、AI Overviews を表示する種類のクエリについて利用が 10% 超増加している」と述べる（※この一文は取得ツールによる要約であり、逐語引用としては未確定。逐語が必要なら原記事を直接参照のこと）。これが AI Overviews の影響について Google が出している数少ない公式の数値だが、**クリックや来訪ではなく「検索利用の増加」の数値**である。

AI Mode（2025-10-07、原文）:

> launching in more than 35 new languages and over 40 new countries and territories
> AI Mode will be available in over 200 countries and territories total.

**(b) 規模（公式の唯一の数値群）**

I/O 2026（2026-05-19、原文）:

> Just one year after its debut, AI Mode has surpassed one billion monthly users, with queries more than doubling every quarter since launch.

> [Gemini 3.5 Flash is] the new default model in AI Mode for everyone globally.

> [the new intelligent Search box is] starting to roll out today, in all countries and languages where AI Mode is available.

website owners 向け投稿（2026-06-03 / updated 2026-08-31、原文）:

> AI Overviews [has] over 2.5 billion monthly active users
> AI Mode [has] surpassed one billion monthly users

**(c) クリック・トラフィックについての Google 公式の主張**（Liz Reid, 2025-08-06、原文）:

> Overall, total organic click volume from Google Search to websites has been relatively stable year-over-year.

> average click quality has increased and we're actually sending slightly more quality clicks to websites than a year ago

> This data is in contrast to third-party reports that inaccurately suggest dramatic declines in aggregate traffic — often based on flawed methodologies, isolated examples, or traffic changes that occurred prior to the roll out of AI features in Search.

> with AI Overviews people are seeing more links on the page than before. More queries and more links mean more opportunities for websites to surface and get clicked.

> We continue to send billions of clicks to websites every day

Search Central「AI Features and Your Website」（Last updated 2025-12-10、原文）:

> With AI Overviews, people have been visiting a greater diversity of websites for help with more complex questions.
> when people click from search results pages with AI Overviews, these clicks are higher quality (meaning, users are more likely to spend more time on the site).
> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

**(d) 2026年に新設された、TW-B の再検証に直接効く事実**

Search Console の生成 AI パフォーマンスレポート（2026-06-03、原文）:

> **Note:** As of August 31, 2026, we've rolled out these insights to all websites worldwide.
>
> The new Search Console reports are designed to give you dedicated views of your **impressions** within generative AI features on Search, such as AI Overviews and AI Mode, as well as generative AI features in Discover. (…)
>
> To help you understand how pages from your site are shown, our new reports show the following information:
>
> - **Impressions:** How often URLs from your site appeared in generative AI features in Search and Discover.
> - **Pages:** Check which URLs appeared within AI features.
> - **Countries:** Understand your visibility on a country basis.
> - **Devices:** Identify the devices people are using when seeing your website (available for Search results).
> - **Dates:** Monitor your performance over time with hourly, daily, weekly, and monthly granularity.

生成 AI 機能への掲載可否のコントロール（2026-06-03 / updated 2026-08-31、原文）:

> With this new toggle in Search Console, website owners can decide if they want their site to appear in and help ground responses in our generative AI Search features
> Sites that opt out will not receive traffic or impressions from our generative AI features.

AI 最適化ガイド（Last updated 2026-07-10、原文）:

> In addition to the technical requirements for Search, a site must be included in Search generative AI features in Search Console to be eligible for display in generative AI features on Google Search.

> **Providing a unique point of view**: Our AI systems take a look at a variety of sources, so it can be helpful to have a unique viewpoint that stands out. For example, a first-hand review provides a unique perspective based on personal experience, whereas a summary of existing content simply restates information already available elsewhere. Create the content yourself based on what you know about the topic, and consider what in-depth experience you can bring to your content. **Don't just recycle what others on the internet have already said, or could easily be produced by a generative AI model.**

> **Creating non-commodity content** (…) Commodity content (for example, something like "7 Tips for First-Time Homebuyers") is often based on common knowledge, which could originate from anyone, and typically adds little unique insight for readers. In contrast, non-commodity content (such as "Why We Waived the Inspection & Saved Money: A Look Inside the Sewer Line") provides unique expert or experienced takes that go beyond common knowledge and the ordinary.

### 事実（修正が要る場合、どう書き換えるべきか）

1. **適用拡大の前提は公式に成立する**。AI Overviews は 200以上の国・地域／40以上の言語（2025年5月時点の公式発表）、AI Mode も 200以上の国・地域（2025-10-07 時点）。規模は AI Overviews が月間アクティブユーザー 25億超、AI Mode が月間ユーザー 10億超（いずれも 2026-06-03 / 2026-08-31 更新の公式）。AI Mode のクエリは「ローンチ以来、四半期ごとに2倍以上」（2026-05-19 公式）。
2. **ゼロクリック率、CTR 低下、参照型ページのクリック損失について、Google 公式の数値は存在しない**（公式には数値なし）。Google が出している唯一の関連表明は、方向が逆の定性的主張（総オーガニッククリック量は前年比でおおむね横ばい、クリックの質は向上）である。第三者の減少推計は公式に「flawed methodologies」として否定されている。
3. したがって、site-concept が「参照型の敗北は強い定量で確認済み」とする根拠は、**Google 公式資料ではなく当サイト自身の実測（Search Console / GA4）に限られる**。外部の公式裏づけがある、と読める書き方は事実と異なる。
4. **TW-B（SERP 挙動の変化が弁別子を侵食）の観測手段が 2026年に公式に用意された**: Search Console の生成 AI パフォーマンスレポートが 2026-08-31 に全世界の全サイトへ展開済み。ただし提供指標は **impressions / pages / countries / devices / dates** のみで、**クリックは含まれない**。つまり「AI 機能に表示されたか」は測れるが「AI 機能から来訪したか」は同レポートでは測れない（AI 機能由来のトラフィックは総合パフォーマンスレポートに合算される）。
5. **生成 AI 機能への掲載は Search Console のトグルで制御可能になった（既定はオプトイン、オプトアウト可）**。「a site must be included in Search generative AI features in Search Console to be eligible for display」「Sites that opt out will not receive traffic or impressions from our generative AI features」。当サイトの Search Console 設定がどちらかは本調査の範囲外（未確認）。
6. Google 公式ガイドは「**commodity content**（共通知識に基づき誰が書いてもよく、独自の洞察が乏しいもの）」対「**non-commodity content**（独自の専門・経験に基づくもの）」という軸を示している。これは site-concept の弁別子（配達しきれるか／来訪して関与しないと得られないか）と同じ方向を向くが、**Google の軸は「独自視点・一次経験の有無」であって「体験型か参照型か」ではない**。公式資料に「体験型コンテンツの方が AI 検索で訪問を保つ」という趣旨の記述はない。site-concept が「体験型の耐性」を中強度仮説としているのは、一次資料の状況と整合する。

---

## 主張5: WCAG の非テキストコントラスト要件（DESIGN.md §10 品質バー）

> コントラスト AA（4.5:1）以上・タップターゲット 44px 以上・キーボード操作可能・フォーカス可視。
> （タスク記載の理解）UI コンポーネントの境界（入力欄の枠など）には 3:1 が要る。

### 結論: **部分的に修正が必要**（「入力欄の枠には 3:1 が要る」は**過度に広い**。枠は原則として必須ではなく、罫線・装飾は 1.4.11 の対象外）

### 一次資料

| 資料                                                          | URL                                                                | 確認日     | 版                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------- |
| W3C WCAG 2.2（規範文書）                                      | https://www.w3.org/TR/WCAG22/#non-text-contrast                    | 2026-09-11 | **W3C Recommendation 12 December 2024**（2026-09-11 時点で最新の勧告） |
| W3C Understanding SC 1.4.11 Non-text Contrast（解説、非規範） | https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | 2026-09-11 | —                                                                      |

### 原文の該当箇所

**(a) 規範テキスト（WCAG 2.2, SC 1.4.11、Level AA、原文）**

> **Success Criterion 1.4.11 Non-text Contrast** (Level AA)
>
> The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s):
>
> **User Interface Components**
> Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author;
>
> **Graphical Objects**
> Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed.

**(b) "user interface component" の規範定義（WCAG 2.2 Glossary、原文）**

> **user interface component**: a part of the content that is perceived by users as a single control for a distinct function
>
> Note 1: Multiple user interface components may be implemented as a single programmatic element. "Components" here is not tied to programming techniques, but rather to what the user perceives as separate controls.
> Note 2: User interface components include form elements and links as well as components generated by scripts.

**(c) 境界（枠）の扱い — Understanding「Boundaries」節、原文**

> **Boundaries**
> This success criterion **does not require that controls have a visual boundary indicating the hit area**. If a control has visible content (such as text or a sufficiently contrasting icon), which helps users identify the presence of the control, then a border or other indication of the overall boundary of the hit area is not required, as is therefore not subject to non-text contrast requirements. **Having a visual boundary indicating the hit area is only required when there is no other visual way to identify the presence of the control** – and in those cases, the boundary must have sufficient non-text contrast in order to pass this success criterion.
>
> Note: Even when a control does not need to have a visual boundary indicating its hit area, it will still need to have a sufficiently contrasting focus indication.
> Note: For people with cognitive disabilities, it is a **best practice** to delineate the boundary of all controls, even those that have visible content, to aid in the recognition of controls and the completion of activities.

**(d) 入力欄の「adjacent colors」の取り方 — Understanding「Adjacent colors」節、原文**

> For user interface components 'adjacent colors' means the colors adjacent to the component. For example, if an input has a white internal background, dark border, and white external background the 'adjacent color' to the component would be the white external background.
>
> If components use several colors, any color which does not interfere with identifying the component can be ignored for the purpose of measuring contrast ratio. For example, a 3D drop-shadow on an input, or a dark border line between contrasting backgrounds is considered to be subsumed into the color closest in brightness (perceived luminance).
>
> Figure 3. **Pass:** The contrast of the input background (white) and color adjacent to the control (dark blue #003366) is sufficient. **There is also a border (silver) on the component that is not required to contrast with either.**

**(e) 装飾・「理解に必要でない」グラフィックの除外 — Understanding「Required for Understanding」節、原文**

> The term "required for understanding" is used in the success criterion as many graphics do not need to meet the contrast requirements. If a person needs to perceive a graphic, or part of a graphic (a graphical object) in order to understand the content it should have sufficient contrast. However, that is not a requirement when:
>
> - A graphic with text embedded or overlaid conveys the same information, such as labels and values on a chart.
> - **The graphic is for aesthetic purposes that does not require the user to see or understand it to understand the content or use the functionality.**
> - The information is available in another form, such as in a table that follows the graph, which becomes visible when a "Long Description" button is pressed.
> - The graphic is part of a logo or brand name (which is considered "essential" to its presentation).

> Not every graphical object needs to contrast with its surroundings - only those that are required for a user to understand what the graphic is conveying.

**(f) 区切り線・罫線について**

Understanding SC 1.4.11 の全文を機械的に検索した結果、**"divider" / "separator" / "rule (罫線の意)" という語は一度も出現しない**。区切り線に特化した規定・例外は 1.4.11 にも Understanding にも存在しない。

**(g) 参考: 1.4.3 Contrast (Minimum) の規範文（原文、DESIGN.md の「AA（4.5:1）」に関係）**

> **Success Criterion 1.4.3 Contrast (Minimum)** (Level AA)
> The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for the following:
>
> - **Large Text**: Large-scale text and images of large-scale text have a contrast ratio of at least 3:1;
> - **Incidental**: Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement.
> - **Logotypes**: Text that is part of a logo or brand name has no contrast requirement.

**(h) 3:1 のしきい値の扱い（Note、原文）**

> The 3:1 contrast ratios referenced in this success criterion is intended to be treated as threshold values. When comparing the computed contrast ratio to the success criterion ratio, the computed values should not be rounded (e.g. 2.999:1 would not meet the 3:1 threshold).

> Due to anti-aliasing, particularly thin lines and shapes of non-text elements may be rendered by user agents with a much fainter color than the actual color defined in the underlying CSS. (…) In these cases, best practice would be for authors to avoid particularly thin lines and shapes, or to use a combination of colors that exceeds the normative requirements of this success criterion.

### 事実（修正が要る場合、どう書き換えるべきか）

1. **「入力欄の枠には 3:1 が要る」は成立しない（過度に広い）**。1.4.11 が要求するのは「コントロールが存在することと、その状態を識別するために**必要な**視覚情報」。枠はそれ自体が必須ではなく、**枠以外にコントロールの存在を示す視覚手段がない場合にのみ** 3:1 が必要になる。
2. **入力欄（テキスト入力）の測り方は「枠」ではなく「コンポーネントの色 vs 隣接色」**。白い内側／濃い枠／白い外側という構成なら、隣接色は外側の白であり、枠は「明度が近い色に吸収される（subsumed）」ものとして扱われ、Figure 3 では「枠はどちらともコントラストする必要がない」と明記されている。テキスト入力は内側の面と外側の面が同色だと、枠が唯一の識別手段になるため 3:1 が必要になる——つまり **3:1 が要るかどうかは「枠があるか」ではなく「枠が唯一の識別手段か」で決まる**。
3. **罫線・区切り線（DESIGN.md の `--rule` / `--rule-strong`）は 1.4.11 の対象ではない**。罫線は規範定義上の "user interface component"（「ユーザーが単一の機能を持つ一個のコントロールとして知覚するコンテンツの一部」）に当たらない。また "Graphical Objects" の対象は「コンテンツを理解するために必要な部分」に限られ、「The graphic is for aesthetic purposes that does not require the user to see or understand it to understand the content or use the functionality」は明示的に除外される。**純粋な装飾・美的目的の罫線には 1.4.11 のコントラスト要件はかからない**。ただし、罫線が構造の理解に必要な情報（例: 区画の境界がなければ内容の対応関係が判別できない）を担う場合は "required to understand the content" として 3:1 の対象になりうる——この線引きは 1.4.11 にも Understanding にも明文の規定がなく、「理解に必要か」の判断に委ねられている（**区切り線を名指しした一次資料の記述は存在しない**）。
4. **DESIGN.md の「コントラスト AA（4.5:1）以上」は、テキストの下限としては 1.4.3 と整合するが、非テキスト（アイコン・コントロール・状態表示・フォーカスリング）には 1.4.11 の 3:1 という**別の要件**があり、現行の §10 はこれに言及していない。1.4.3 には大きい文字の 3:1 例外、および inactive / pure decoration / logotype の除外がある。
5. **フォーカス可視について**: 1.4.11 は 2.4.7 Focus Visible と組み合わさり、Understanding は「the visual focus indicator for a component **must** have sufficient contrast against the adjacent background when the component is focused, except where the appearance of the component is determined by the user agent and not modified by the author」と述べる。**枠の描画を省いたコントロールでも、フォーカス表示のコントラストは免除されない**（"Even when a control does not need to have a visual boundary indicating its hit area, it will still need to have a sufficiently contrasting focus indication."）。
6. **細い線への注意（DESIGN.md が罫線を「構造の主役」に据えていることに直接効く事実）**: アンチエイリアスにより細い線は CSS 上の色より淡く描画されるため、「名目上は基準を満たすが実際にはずっと低いコントラストになる」。W3C は「細すぎる線・形を避けるか、規範要件を超える配色を使う」ことを best practice としている。
7. **3:1 は丸めずに判定する**（2.999:1 は不合格）。
8. **版**: WCAG 2.2 は 2026-09-11 時点で **W3C Recommendation 12 December 2024** が最新（Errata あり）。WCAG 2.2 より新しい勧告は出ていない。

---

## 一次資料に当たれなかったもの

- **`oklch()` 単独のグローバル対応率**。W3C・各ブラウザベンダの公式資料にトラフィックベースの対応率という指標自体が存在しない。本報告に記載した 93.28% は caniuse-db（第三者データ、feature `css-lch-lab` = lab/lch/oklab/oklch の合算）の値であり、oklch 単独ではない。caniuse.com 本体は 406（Mod Security）で取得不可のため、GitHub 上の caniuse-db 原データを使用した。
- **Search Quality Rater Guidelines の 2026年版**。Google の正規配布 URL から 2026-09-11 に取得した版は September 11, 2025 付で、2026年の改訂版は公開されていない（＝これが確認日時点の最新版）。
- **当サイト（yolos.net）の Search Console における生成 AI 機能トグルの現在の設定**。Search Console の実データ確認は本タスクの範囲外のため未確認。
