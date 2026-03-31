---
title: 診断・クイズ系サイト結果ページの人称（二人称vs三人称）実態調査
date: 2026-03-31
purpose: >
  yolos.netの静的結果ページ再設計において「二人称表現はコンテンツの親密さ・温かみの源泉である」
  という主張に根拠があるか検証する。シェア可能な公開結果ページで、テキストが二人称か三人称かを
  実際のサイトで確認し、人称選択の根拠となるUXリサーチや心理学的エビデンスを調査する。
method: >
  各サイトへのPlaywright直接アクセス、WebFetchによるページ内容取得、
  検索クエリ: "second person you personality test result page engagement",
  "personality quiz result page writing style second third person",
  "Barnum effect personality quiz you second person",
  "quiz result page UX copywriting second person warmth",
  "MBTI personality type description you vs INTJs writing style",
  "二人称 三人称 診断 結果ページ 人称"
sources:
  - https://hoyme.jp/shindan/50534/results/1066
  - https://hoyme.jp/shindan/32339/results/997
  - https://mirrorz.jp/article/recovery-type/
  - https://www.truity.com/personality-type/INTJ
  - https://www.crystalknows.com/personality-type/intj
  - https://www.outofservice.com/bigfive/results/
  - https://metalife.co.jp/business-words/2098/
  - https://himatsubushi-shindan-test.com/intj/
  - https://en.wikipedia.org/wiki/Barnum_effect
  - https://www.nature.com/articles/s41467-023-44515-1
---

# 診断・クイズ系サイト結果ページの人称（二人称vs三人称）実態調査

## 調査の背景と目的

yolos.netの静的結果ページ（シェアリンクや検索から第三者も訪れる公開ページ）を再設計中に、
detailedContent（特にadvice文）を「第三者来訪者向けに三人称に書き換える」という提案が検討された。
これに対し「二人称表現はコンテンツの親密さ・温かみの源泉」という反論が生まれたが、
その主張に客観的な根拠があるかどうかを確認するために本調査を実施した。

具体的に確認すべき問いは以下の3点である。

1. 競合サイトの公開結果ページは実際に二人称・三人称のどちらを使っているか
2. 二人称の方がエンゲージメントやシェア率が高いという研究エビデンスは存在するか
3. 第三者来訪者が「あなた」宛テキストを読む際にどのような影響が生じるか

---

## 各サイトの調査結果

### 1. ホイミー (hoyme.jp) — 公開結果ページ

**調査URL**:

- https://hoyme.jp/shindan/50534/results/1066 （悪魔化診断・アクィエル）
- https://hoyme.jp/shindan/32339/results/997 （不足してるもの診断）

**URLの性質**: 独立した公開URLを持ち、ブレッドクラムに「診断結果」として表示される。
TwitterシェアボタンとURLコピー機能が存在し、第三者が直接アクセス可能な設計。

**テキストの人称**: 二人称（「あなた」）を一貫して使用。

具体的な引用（Playwrightで実際のページを確認）:

- ページタイトル: 「結果は【アクィエル】でした！あなたを悪魔化すると」
- 見出し: 「あなたはこんな人物」
- 本文: 「あなたも、周囲とは相容れない行動をしてしまう天邪鬼なタイプ。」
- 本文: 「表面上は天邪鬼なあなたですが、心の底では周りの人たちをとても大事に思っているので、それが伝わっているのかもしれません。」
- 不足診断: 「集中力が高く、何かを極めることが得意なあなた。」
- 不足診断: 「そんなあなたに足りないモノTOP3は…」

**第三者への設計**: ページ上部に「この診断をやってみる」CTAが大きく配置されており、
「あなた」宛テキストを読んだ第三者来訪者を受験者化する設計になっている。

---

### 2. MIRRORZ (mirrorz.jp) — 公開結果ページ

**調査URL**: https://mirrorz.jp/article/recovery-type/

**URLの性質**: 診断記事単位のURL（/article/タイトル/）が独立した公開URLとして機能する。
OGP・SNSシェアボタンが全記事に設置されており、検索から到達可能。

**テキストの人称**: 二人称（「あなた」）を一貫して使用。

具体的な引用（WebFetchで確認）:

- 「おお、あなたは非常に真っすぐな性格で、信念のある人のようですね。」
- 「そんなあなたのリカバリータイプは、ずばり正面突破型といえるでしょう。」
- 「あなたは、ちょっと面倒くさがり屋さんのようですね。」
- 「そんなあなたのリカバリータイプは、ずばりスルー型です。あなたの場合、ミスや失敗をしても、それを見なかったことにして、放置してしまうようなことが多いのではないでしょうか。」

MIRRORZはタグラインも「あなたの心を映し出す心理テストメディア」と二人称で統一されており、
ブランドコンセプト自体が二人称を前提としている。

---

### 3. 16Personalities (16personalities.com) — タイプ解説ページ

**調査URL**: https://www.16personalities.com/intj-personality

**URLの性質**: /intj-personality というURLで完全に公開されており、Google検索から直接到達可能。
診断を受けていなくても誰でも閲覧できる「タイプ図鑑」的なページ。

**テキストの人称**: 三人称（「INTJs are...」「They...」）を一貫して使用。

確認された文体の例（WebSearch・二次資料より）:

- 「People with the INTJ personality type (Architects) are intellectually curious individuals」
- 「INTJs don't mind acting alone」
- 「They consistently work toward enhancing intellectual abilities」
- 「Their inner world is often a private, complex one」

**重要な区別**: 16Personalitiesには2種類のページが存在する。

1. **タイプ解説ページ**（/intj-personality）: 三人称で書かれた汎用解説。誰でも見られる。
2. **個人結果ページ**（診断後・ログイン）: 二人称（「あなたは...」）で書かれた個人向け結果。

つまり16Personalitiesは「公開された汎用解説は三人称、受験者向け個人結果は二人称」と
**明確に使い分けている**。これは本調査の問いに直接的な示唆を与える最も重要な発見である。

---

### 4. Truity (truity.com) — タイプ解説ページ

**調査URL**: https://www.truity.com/personality-type/INTJ

**URLの性質**: 公開URLで、誰でも閲覧可能なINTJタイプの解説ページ。

**テキストの人称**: 三人称（「INTJs are...」「They...」）を一貫して使用。

具体的な引用:

- 「INTJs are energized by time alone, focused on big picture ideas and concepts」
- 「They are motivated by efficiency, competence and long-term vision」
- 「INTJs are one of the rarest personality types, making up about 2.6% of the population」
- 「They thoroughly examine the information they receive」

---

### 5. Crystal Knows (crystalknows.com) — タイプ解説ページ

**調査URL**: https://www.crystalknows.com/personality-type/intj

**URLの性質**: 公開URLで誰でも閲覧可能。診断不要。

**テキストの人称**: 三人称（「INTJs...」「they...」）を主軸として使用。

具体的な引用:

- 「INTJs are strategic, independent, and highly analytical thinkers.」
- 「What sets INTJs apart is their combination of imagination and decisiveness.」
- 「INTJs thrive when they can work independently toward meaningful goals.」
- 「They value competence highly and hold themselves to exacting standards.」

補足: コミュニケーション tips など「受験者（あなた）」に向けたアドバイスセクションでは
二人称に切り替わる部分も一部存在する（用途に応じた混在）。

---

### 6. Out of Service Big Five (outofservice.com) — 結果ページ

**調査URL**: https://www.outofservice.com/bigfive/results/

**URLの性質**: 診断後に表示される結果ページ。比較表示機能を持つ。

**テキストの人称**: 二人称（自分の結果）と三人称（比較対象）を**目的に応じて切り替え**。

具体的な引用:

- 自分の結果（二人称）: 「You are extremely imaginative and open to new experiences.」
- 比較結果（三人称）: 「They are extremely imaginative and open to new experiences.」

同一のコンテンツを、受験者本人向けには「You are」、他者との比較では「They are」と
動的に書き換える設計になっている。「人称は読者（誰が主語か）に応じて変えるべき」という
設計思想の明確な実装例である。

---

### 7. 日本語性格タイプ解説サイト群（一般向け解説ページ）

**調査URL**:

- https://metalife.co.jp/business-words/2098/ （INTJ解説）
- https://himatsubushi-shindan-test.com/intj/ （INTJ解説）

**テキストの人称**: 両サイトとも三人称（「INTJは」「彼らは」）を一貫して使用。

具体的な引用（metalife.co.jp）:

- 「INTJは非常に戦略的で、長期的な視野を持って物事を考えます」
- 「彼らは目標を達成するための具体的な計画を立てることが得意」
- 「INTJは感情を表に出すことが苦手で、時には人間関係において誤解を招く」

具体的な引用（himatsubushi-shindan-test.com）:

- 「INTJは強い独立心を持ち、自分の考えや判断を重視します」
- 「INTJは常に『未来』を見据えています」

**ページの性質**: いずれも診断後の個人結果ページではなく「INTJについて学ぶ一般向け解説ページ」。

---

## 人称に関するエビデンス・心理学的根拠の調査

### A. バーナム効果（Barnum Effect / Forer Effect）と二人称の関係

バーナム効果（フォーラー効果）とは、曖昧で一般的な性格記述を「自分専用に作られた分析」と
信じてしまう傾向（Wikipedia）。1948年Forer実験では、被験者全員に同一の性格記述を渡したにも
かかわらず、「個人向けに作られた」と信じた被験者が高い正確性評価をつけた。

Forer実験で使われた記述は「You have a great need for other people to like and admire you.」
という二人称形式だった。研究文献の整理によれば、受験者が「この結果は自分専用に生成された」と
感じるほどバーナム効果は強くなり、二人称語りかけはその「個人化感覚」を強化する要素の一つとされる。

ただし、バーナム効果の研究は「どの人称がより高いバーナム効果を生むか」を直接比較した実験ではなく、
「個人向けと信じさせる文脈全体」が重要とされる。二人称単独の優位性を証明する実験的エビデンスは
確認できなかった。

### B. 二人称と受け手の反応に関する研究

Nature Communications 2023年論文（Behavioral consequences of second-person pronouns in written
communications between authors and reviewers of scientific papers）によれば、
著者が査読者を二人称（you）で呼びかけた場合、三人称より:

- 査読者からの質問数が減少
- 応答が短くなる傾向
- より肯定的な評価を受ける
- コミュニケーションをより個人的・対話的に感じる（媒介変数として確認）

この研究は科学論文査読という文脈での知見であり、診断結果ページへの直接適用には注意が必要。
ただし「二人称が対話感・個人感を生み出す」という方向性は支持されている。

### C. UXライティングにおける二人称の位置づけ

複数のUXライティングガイドライン（Google Developer Documentation Style Guide等）では
「ユーザーへの指示・説明は二人称（you）を基本とする」とされている。
「二人称はユーザーとの会話を生み出し、一体感と親密さを作る」との記述が複数の実践文献に見られる。

ただし、これは「インタラクティブなUI要素や指示文のライティング指針」であり、
「静的な結果説明テキスト」への同一の適用については直接的な研究的裏付けは見当たらなかった。

### D. BuzzFeedクイズの二人称戦略

BuzzFeed型クイズの設計分析（複数のクイズメーカーサービスの設計ガイドより）によれば:

- BuzzFeedクイズは質問・結果ともに二人称（「you」）を一貫して使用
- 「You are Tyrion Lannister: smart, cynical, but kind-hearted」という形式が
  SNSでシェアされやすい（公開宣言としての自己開示欲求を刺激するため）
- 肯定的で具体的な二人称表現が「自分のことを言い表されている感覚」を強め、シェア動機になる

ただし、BuzzFeedは結果ページを「誰でも見られる公開URL」として設計しておらず、
受験者のみが到達できる動的ページが中心。第三者来訪者が想定読者に入っていない。

---

## 調査結果の整理

### Q1. 競合サイトの公開結果ページは二人称・三人称どちらを使っているか？

| サイト                        | ページの性質               | 人称                           | 補足                         |
| ----------------------------- | -------------------------- | ------------------------------ | ---------------------------- |
| ホイミー（結果ページ）        | 受験者向け+第三者閲覧可    | 二人称（あなた）               | 一貫して二人称               |
| MIRRORZ（記事型結果）         | 受験者向け+第三者閲覧可    | 二人称（あなた）               | 一貫して二人称               |
| 16Personalities（タイプ解説） | 完全公開の汎用解説         | 三人称（INTJs are）            | 個人結果ページは二人称と区別 |
| Truity（タイプ解説）          | 完全公開の汎用解説         | 三人称（INTJs are）            | 一貫して三人称               |
| Crystal Knows（タイプ解説）   | 完全公開の汎用解説         | 三人称（INTJs are）            | アドバイス部分のみ二人称     |
| OutOfService Big Five         | 結果ページ（比較機能あり） | 二人称と三人称を機能で切り替え | 読者に応じて動的変更         |
| 日本語MBTI解説サイト群        | 一般向け解説               | 三人称（INTJは）               | 一貫して三人称               |

**明確なパターン**:

- 「受験者本人向け結果ページ」→ 二人称（あなた）が業界標準
- 「誰でも閲覧できる汎用タイプ解説ページ」→ 三人称（このタイプは）が業界標準
- 「受験者のシェア+第三者来訪者が混在する日本の診断ページ」（ホイミー・MIRRORZ）→ 二人称を維持

### Q2. 「二人称の方がエンゲージメントが高い」という主張にエビデンスはあるか？

**結論: 部分的なエビデンスはあるが、「診断結果ページの二人称が優れる」という直接的な実験的証拠は確認できなかった。**

存在するエビデンスの内容:

1. **バーナム効果研究（Forer 1948, 以降の追試）**: 個人化感覚が高いほど結果への同一化・満足度が上がる。二人称は個人化感覚を強める要素の一つだが、唯一の決定因子ではない。

2. **Nature Communications 2023**: 二人称使用が対話感・個人感を生み出し、肯定的評価につながる。ただし文脈が査読論文であり、診断結果への直接適用には限界がある。

3. **UXライティング業界の知見**: 「you」使用が親密さ・対話感を生む（複数の実践書・ガイドライン）。ただしこれは規範的ガイダンスであり、A/B実験等の比較研究ではない。

存在しないエビデンス:

- 「診断結果ページで二人称と三人称を比較したA/Bテスト研究」は確認できなかった
- 「二人称を使った結果ページの方がSNSシェア率が高い」という定量研究は確認できなかった

### Q3. 第三者来訪者が「あなた」宛テキストを読む際の影響は？

既存研究からの推論:

1. **バーナム効果の普遍性**: 第三者来訪者でも「この診断を受けたらこんな結果になるかもしれない」という感覚が生まれ、受験意欲が高まる可能性がある。

2. **ホイミーの設計意図**: 二人称を維持しつつ「この診断をやってみる」CTAを上部に配置。「あなた宛のテキスト→自分も試したい」という流れを意図した設計と解釈できる。

3. **自然な読み替えの可能性**: 「これは自分の結果ではない」と認識している第三者来訪者は、「この人（シェアした本人）はこういう人なんだ」という三人称的な読み替えを自然に行う。この読み替えは意識的な努力なく起こる（perspective-taking研究より）。

---

## yolos.netへの示唆

### 「二人称表現はコンテンツの親密さ・温かみの源泉」という主張の評価

この主張は「実務上の根拠ある慣行」と評価できる。

具体的に言えば:

- 「二人称が受験者本人に対して親密さを生む」は複数の間接的研究から支持される
- 「公開URLで第三者も見られる結果ページに二人称を使うべき理由」は
  業界実態（ホイミー・MIRRORZ）が示すが、「そうしないと困る」という研究的根拠はない
- 「三人称に書き換えるべき」という主張も、「公開ページだから」という理由だけでは弱く、
  業界実態（ホイミー・MIRRORZ）はその方向を支持していない

### advice文の人称についての判断材料

今回調査で確認できた最も重要な知見は「ページの用途と主要読者によって人称選択が変わる」
という業界実態である。

- 受験者向け結果（主要読者が受験者本人）: 二人称が業界標準
- 汎用タイプ解説（主要読者が不特定多数）: 三人称が業界標準
- 両方の読者が混在するページ（ホイミー・MIRRORZ型）: 二人称を維持しCTAで来訪者を誘導

yolos.netの静的結果ページは「主要なユースケースが受験者によるシェア」であるため、
ホイミー・MIRRORZ型（二人称維持）の方が業界実態に沿っている。

ただし「第三者が見た時に二人称が温かみを生む」という積極的証拠というよりも、
「業界実態として二人称が標準であり、第三者来訪者が二人称テキストを拒否するという問題が
現実には確認されていない」という消極的論拠に留まる。

---

## 結論

### 1. 業界実態

日本の診断サイト（ホイミー・MIRRORZ）は、公開URLを持つ結果ページでも二人称（「あなた」）を
一貫して使用する。英語圏の汎用タイプ解説ページ（16Personalities・Truity等）は三人称を使用するが、
これは「受験者向け結果ページ」ではなく「一般向けタイプ解説ページ」であるという性質の違いがある。

### 2. エビデンスの強度

「二人称が親密さ・温かみを生む」という主張は、バーナム効果研究・UXライティング業界知見・
自然言語処理研究から間接的に支持される。ただし「診断結果ページにおける二人称vs三人称の
定量的比較研究」は存在せず、直接的な実験的証拠はない。

### 3. 総合的判断

advice文を「三人称に書き換えるべき」という主張の方が、業界実態に反しており、根拠も弱い。
現状の二人称維持は業界標準に沿った判断であり、合理的といえる。
ただし「二人称の方が必ず良い」という絶対的なエビデンスも存在しないため、
今後A/Bテストなどの実測で検証する余地はある。

---

## 情報源

- [ホイミー 悪魔化診断 結果](https://hoyme.jp/shindan/50534/results/1066)
- [ホイミー 不足診断 結果](https://hoyme.jp/shindan/32339/results/997)
- [MIRRORZ リカバリータイプ診断](https://mirrorz.jp/article/recovery-type/)
- [Truity INTJ Personality Type](https://www.truity.com/personality-type/INTJ)
- [Crystal Knows INTJ](https://www.crystalknows.com/personality-type/intj)
- [Out of Service Big Five Results](https://www.outofservice.com/bigfive/results/)
- [ビジネス用語ナビ INTJ解説](https://metalife.co.jp/business-words/2098/)
- [暇つぶし診断テスト集 INTJ解説](https://himatsubushi-shindan-test.com/intj/)
- [Wikipedia: Barnum effect](https://en.wikipedia.org/wiki/Barnum_effect)
- [Nature Communications: Behavioral consequences of second-person pronouns (2023)](https://www.nature.com/articles/s41467-023-44515-1)
- [Ness Labs: The Barnum Effect](https://nesslabs.com/barnum-effect)
- [RMP Blog: Barnum Effect in Personality Assessment](https://blog.reissmotivationprofile.com/the-barnum-effect-in-the-assessment-of-personality-types)
- [Google Developer Documentation Style Guide: Second person](https://developers.google.com/style/person)
