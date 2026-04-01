# character-fortune 受検者本人と第三者の情報格差問題 調査レポート

調査日: 2026-03-31
調査対象: `/play/character-fortune` の受検者本人と第三者向けページの情報格差

---

## 1. 受検者本人が見る結果画面の全要素

ファイル: `src/play/quiz/_components/ResultCard.tsx`

受検者本人は `/play/character-fortune` のページ上でクイズを受け、結果フェーズで `ResultCard` コンポーネントが表示される。

### ResultCard が表示する要素

| 要素                    | ソース                                                | 備考                                       |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------ |
| アイコン絵文字          | `result.icon`                                         | 例: 🔥 (commander)                         |
| タイトル                | `result.title`                                        | 例: 「締切3分前に本気出す炎の司令塔」      |
| スコア (知識クイズのみ) | `score` / `totalQuestions`                            | character-fortuneはpersonalityなので非表示 |
| 説明文                  | `result.description`                                  | キャラが語りかける長文                     |
| おすすめリンク          | `result.recommendation` / `result.recommendationLink` | character-fortuneでは未設定                |
| シェアボタン            | ShareButtons                                          | X, LINE, コピー                            |
| もう一度挑戦するボタン  | ローカルstate                                         | onRetry呼び出し                            |

### ResultCard に続いて表示される追加要素 (QuizContainer 経由)

ResultCard の下に `ResultExtraLoader` が配置されており、character-fortune の場合は `CharacterFortuneResultExtra` が描画される。

| 要素                                | 条件                      | 内容                            |
| ----------------------------------- | ------------------------- | ------------------------------- |
| 相性診断結果 (CompatibilitySection) | referrerTypeId がある場合 | 友達タイプとの相性ラベル・説明  |
| 友達招待ボタン (InviteFriendButton) | 常に表示                  | 「キャラ診断で相性を調べよう!」 |

### 受検者本人が見ない情報 (detailedContent)

`ResultCard` は `result.detailedContent` を一切参照しない。`QuizContainer` も `detailedContent` を `ResultCard` に渡していない。

そのため、以下のフィールドは受検者本人には表示されない:

- `characterIntro` (キャラの自己紹介)
- `behaviorsHeading` + `behaviors` (あるある4項目)
- `characterMessageHeading` + `characterMessage` (キャラの本音)
- `thirdPartyNote` (第三者視点シーン描写)
- `compatibilityPrompt` (相性診断誘導文)

---

## 2. 第三者が見る結果ページの全要素

ファイル: `src/app/play/[slug]/result/[resultId]/page.tsx` の character-fortune variant 部分 (行 451-574)

第三者向け静的ページ (`/play/character-fortune/result/[resultId]`) の表示要素:

### 共通部分 (全variant)

| 要素             | 内容                                                                |
| ---------------- | ------------------------------------------------------------------- |
| パンくずリスト   | ホーム > 遊ぶ > あなたの守護キャラ診断 > 結果                       |
| クイズ名         | 「あなたの守護キャラ診断の結果」                                    |
| shortDescription | 「ユニークなシチュエーションから守護キャラを診断する。相性診断も!」 |
| アイコン絵文字   | `result.icon`                                                       |
| タイトル (h1)    | `result.title`                                                      |

### character-fortune variant 専用要素 (detailedSection)

| 要素                | ソース                                    | 内容例 (commander)                               |
| ------------------- | ----------------------------------------- | ------------------------------------------------ |
| キャラの自己紹介    | `detailedContent.characterIntro`          | 「俺か?普段はゆるくてのんびりしてるけど...」     |
| CTA1 (診断ボタン)   | ハードコード                              | 「あなたはどのタイプ? 診断してみよう」           |
| あるある見出し      | `detailedContent.behaviorsHeading`        | 「お前、こういうとこあるだろ?」                  |
| あるある4項目 (li)  | `detailedContent.behaviors`               | 具体的なシーン描写                               |
| シェアボタン (中間) | ShareButtons                              | X, LINE, コピー                                  |
| 本音見出し          | `detailedContent.characterMessageHeading` | 「司令塔からの本音」                             |
| キャラの本音        | `detailedContent.characterMessage`        | 長文の前向きメッセージ                           |
| 第三者視点見出し    | ハードコード                              | 「このキャラの守護を受けている人と一緒にいると」 |
| 第三者視点テキスト  | `detailedContent.thirdPartyNote`          | 第三者から見た行動描写                           |
| 相性診断誘導文      | `detailedContent.compatibilityPrompt`     | 「お前と相性がいいのは誰だ?...」                 |
| 相性診断CTAボタン   | ハードコード                              | 「診断して相性を見てみる」                       |
| 全タイプ一覧        | `quiz.results`                            | 全6キャラのリンク一覧                            |
| CTA2 (全タイプ直下) | ハードコード                              | 「あなたはどのタイプ? 診断してみよう」           |

### 末尾共通要素

| 要素                                    | 内容                             |
| --------------------------------------- | -------------------------------- |
| シェアボタン (末尾)                     | ShareButtons                     |
| 関連クイズ (RelatedQuizzes)             | personality カテゴリの他のクイズ |
| おすすめコンテンツ (RecommendedContent) | 記事・コンテンツ推薦             |

### 注意: description は非表示

`page.tsx` 行 259-267 で、character-fortune variant では `DescriptionExpander`（descriptionの表示）が **スキップされる**。description はメタタグのみに使用される。

---

## 3. 全クイズでの状況（character-fortune 以外も含む）

### detailedContent を持つクイズ一覧

| クイズ                   | variant                | detailedContent の有無 |
| ------------------------ | ---------------------- | ---------------------- |
| character-fortune        | `"character-fortune"`  | あり (全6タイプ)       |
| contrarian-fortune       | `"contrarian-fortune"` | あり (全タイプ)        |
| music-personality        | なし (標準形式)        | あり (全タイプ)        |
| animal-personality       | なし (標準形式)        | あり (全タイプ)        |
| traditional-color        | なし (標準形式)        | あり                   |
| yoji-personality         | なし (標準形式)        | あり                   |
| unexpected-compatibility | なし (標準形式)        | あり                   |
| impossible-advice        | なし (標準形式)        | あり                   |
| character-personality    | なし (標準形式)        | あり (batch1-3)        |

### ResultCard での detailedContent 表示

`ResultCard.tsx` は全クイズ共通のコンポーネントであり、`detailedContent` を参照するコードは **一切存在しない**。

これは **character-fortune 固有の問題ではなく、全クイズ共通の設計**である。

contrarian-fortune, music-personality, animal-personality, character-personality など、detailedContent を持つ全クイズで同様に、受検者本人が見る ResultCard には detailedContent が表示されない。

### この設計の意図（コードコメントより）

`page.tsx` の JSDoc コメント（行 140-147）に以下の記述がある:

> 「このページを閲覧するのはクイズを受けた本人ではない。本人は /play/[slug] 上の ResultCard（動的コンポーネント）で結果を確認し、そこからシェアする。このページに到達するのは、シェアリンクをクリックした友人や、検索エンジンから来た来訪者であり、彼らにとっての主要アクションは「自分もクイズを受けてみる」（CTAボタン）である。」

つまり、当初の設計では **受検者本人 = ResultCard** / **第三者 = 静的ページ** という役割分担が意図されており、detailedContent は第三者向けページへの訪問者のエンゲージメント向上を目的として設計されている。

---

## 4. 受検者がシェアした後の情報乖離

### 情報量の差

受検者本人がシェアする際のシェアテキスト（ResultCard から）:

```
あなたの守護キャラ診断の結果は「締切3分前に本気出す炎の司令塔」でした! #あなたの守護キャラ診断 #yolosnet
```

受検者が見た情報:

- タイトル: 「締切3分前に本気出す炎の司令塔」
- description（キャラが2人称で語りかける長文）

第三者が静的ページで見る情報（受検者が見ていない追加情報）:

- characterIntro（キャラの自己紹介1文）
- behaviors（あるある4項目）
- characterMessage（キャラの本音・長文）
- thirdPartyNote（第三者視点シーン描写）
- compatibilityPrompt（相性診断誘導文）
- 全タイプ一覧

### 全6タイプの thirdPartyNote のネガティブ要素確認

各タイプの `thirdPartyNote` を全て確認し、受検者にとって不利益・悲しみ・ハームを生じさせうる内容がないか検討した。

**commander（炎の司令塔）:**

> 「このタイプの友人がいると、行き詰まった場面でも不思議と空気が変わる。誰も手を挙げない場面でふっと立ち上がり、「まあやってみよ」と笑いながら引っ張り始める姿に、いつの間にか周りが引き寄せられる。終わった後は一番早くケロッとしていて、「次どうする?」と前だけ見ている。」
> → 完全にポジティブ。

**professor（博士）:**

> 「博士タイプの守護を受けている人と一緒にいると、ふとした雑談が気づけば深夜まで続く知識の旅になっている。「それ、どこで知ったの?」と何度も聞きたくなるほど、話の引き出しが底をつかないのである。」
> → 完全にポジティブ。

**dreamer（妄想家）:**

> 「妄想家タイプの守護を受けている人のそばにいると、日常のふとした場面に豊かな物語が宿るように感じられます。「あの雲、なんか顔に見えない?」「あの人はきっと壮大な過去があるはず」——そんなひと言が、灰色だった景色を鮮やかに染め直してくれます。」
> → 完全にポジティブ。

**trickster（曲者）:**

> 「曲者タイプの守護を受けている人と一緒にいると、思考が固まりそうな瞬間にいつも「別の視点」を差し込まれる体験ができる。当初の結論がいつの間にか改善されており、後から振り返ると「あの一言がターニングポイントだった」と気づくことが多い。集団の判断ミスを未然に防ぐ存在として、静かに機能している。」
> → 完全にポジティブ。

**guardian（守護神）:**

> 「守護神タイプの守護を受けている人のそばにいると、気づかないうちに助けられていることが多い。傘を忘れた雨の日に「これ使って」とさっと差し出され、体調が悪い時には先に気づいて声をかけてくれる。頼んでもいないのに、ちゃんと準備されている——そんな安心感が、静かに日常を支えてくれている。」
> → 完全にポジティブ。

**artist（感性の住人）:**

> 「感性の住人の守護を受けている人のそばにいると、見過ごしていた日常のきれいさに気づかされる。「この光、すごくない?」って言われて空を見上げると、確かにそこには見事な夕焼けがある。そういう人だよ。」
> → 完全にポジティブ。

**全6タイプの thirdPartyNote にネガティブな内容はない。**

### behaviors（あるある）のネガティブ要素確認

あるある（behaviors）は「笑えるリアルなシーン描写」として設計されており、当人が「あるある！」と共感するトーンになっている。第三者がこれを読んだとき、受検者の特性を揶揄したり笑ったりする要素になりうるかを確認した。

- **commander**: 「期末レポートの提出1時間前...」「友達から『手伝って』って連絡が来た瞬間...」等 → ダメなエピソードを含むが、全体のトーンは「でもそれがいい」という肯定的な文脈。
- **professor**: 「タブが23個に...」「フライパンを火にかけたまま調べ始めて焦がした...」等 → 抜けているエピソードを含むが、愛情ある笑いのトーン。
- **dreamer**: 「脳内で3パターン...」「布団に入ってから壮大な物語が...」等 → 空想家としての特性を愛情込めて描写。
- **trickster**: 「反証を探したくなるのが止められない...」等 → ひねくれ者の習性だが肯定的文脈。
- **guardian**: 「荷物を詰め直して3回繰り返して...」「早く着きすぎて...」等 → 心配しすぎとして笑えるが否定的ではない。
- **artist**: 「照明の色が気になって天井を見上げる...」「なんとなくいやだという感覚を無視できない...」等 → 感性豊かさの表れ。

**全6タイプの behaviors は、全体として受検者を傷つけるトーンではない。** ただし、個別のシーン描写が受検者の実際の行動と照合されて「笑われた」と感じる可能性はゼロではない（これはあらゆるパーソナリティ診断共通のリスク）。

---

## 5. constitution Rule 2 との関連

### Rule 2 の内容

> 「Make a website that is helpful or enjoyable for visitors. Never create content that harms people or makes people sad.」

### リスク評価

#### 5-1. 「受検者が知らない情報が第三者に公開されている」という構造的問題

情報開示の非対称性が存在する:

- 受検者: description のみを見て「良い内容だ」と判断してシェア
- 第三者: descriptionに加え、characterMessage, thirdPartyNote, behaviors を見る

受検者が「自分のことが書かれている」と認識していない情報（thirdPartyNote等）が第三者に公開される。

ただし、以下の緩和要因がある:

1. 全6タイプの thirdPartyNote はポジティブな内容のみ
2. キャラクターのロールプレイ口調（1人称はキャラクター）であり、受検者本人の言動を直接暴露するものではない
3. あるある（behaviors）は「笑える自己開示」のトーンで設計されており、character-fortuneという診断の性質上、受検者もそのような文脈を期待してシェアしている

#### 5-2. 受検者本人が見ていない詳細情報が公開されること

受検者はdescriptionを見て「自分に合っている」と判断してシェアするが、静的ページには追加のcharacterMessage（「本音」）が掲載される。このメッセージは全タイプとも前向きな内容で、受検者のアイデンティティを傷つける内容ではない。

#### 5-3. 情報格差による受検者の不快感リスク

受検者が後から静的ページを見て「自分が知らない情報が公開されていた」と感じる可能性がある。これは軽微なネガティブ体験につながりうる。

ただし、現状のconstitution Rule 2への違反と断定するには至らない。全コンテンツがポジティブ・エンターテイメント文脈で書かれており、個人情報の漏洩でもないためである。

#### 5-4. 比較的深刻なリスク: 受検者が「こんな情報が公開されているとは思わなかった」体験

もし受検者が「descriptionのみがシェアされる」と期待してシェアし、後に友人から behaviors や thirdPartyNote について言及されたとき、受検者にとって「知らないうちに追加情報が公開されていた」という感覚を生む可能性はある。

しかしこれは **character-fortune固有の問題ではなく全クイズ共通の設計** であり、かつ現時点でコンテンツ内容自体はRule 2に抵触しない。

---

## 6. まとめ・所見

### 問題の性質

この問題は「受検者が不利益を被る」ではなく、**「受検者が受け取る体験が最高水準に達していない」** という品質問題である。

constitution Rule 4（「Prioritize the quality than the quantity」）の観点では、受検者本人がdetailedContentを見られないことは情報体験の機会損失である。

### 技術的な現状整理

| 情報                | 受検者本人 (ResultCard) | 第三者 (静的ページ)       |
| ------------------- | ----------------------- | ------------------------- |
| icon                | 表示                    | 表示                      |
| title               | 表示                    | 表示                      |
| description         | 表示                    | **非表示** (meta tagのみ) |
| characterIntro      | **非表示**              | 表示                      |
| behaviors (4項目)   | **非表示**              | 表示                      |
| characterMessage    | **非表示**              | 表示                      |
| thirdPartyNote      | **非表示**              | 表示                      |
| compatibilityPrompt | **非表示**              | 表示                      |
| 全タイプ一覧        | なし                    | 表示                      |

受検者本人は description + title + icon のみ。第三者は description を除く detailedContent 全部 + title + icon。

特筆すべきことは、第三者ページでは description が非表示（メタタグ専用）になっているため、**受検者と第三者は互いに相手が見ていない情報を見ている**という逆転現象が生じている。

### 設計的背景

cycle-140-142 の設計思想として、静的結果ページは「第三者向けランディングページ」として位置付けられており、detailedContent はSEO・第三者エンゲージメント向上のために設計された。受検者本人の体験改善は明示的にスコープ外とされてきた。

### 対応の方向性（本調査の範囲外だが記録）

受検者本人が detailedContent を見られない問題を解消するには、以下のアプローチが考えられる:

1. **ResultCard に detailedContent 表示を追加**: character-fortune variant と contrarian-fortune variant の表示ロジックを ResultCard または CharacterFortuneResultExtra に実装する
2. **受検者本人をシェア後に静的ページへ誘導**: ResultCard からシェア後に静的ページへのリンクを表示する（「詳しい診断結果はこちら」）
3. **設計を現状のまま維持**: 受検者本人は description で十分、第三者向けページは第三者向けという役割分担として合理化する

---

## 参照ファイル

- `src/play/quiz/_components/ResultCard.tsx` — 受検者本人向け結果表示
- `src/play/quiz/_components/QuizContainer.tsx` — クイズライフサイクル管理
- `src/play/quiz/_components/CharacterFortuneResultExtra.tsx` — 相性診断追加表示
- `src/play/quiz/_components/ResultExtraLoader.tsx` — Extra コンポーネントのローダー
- `src/app/play/[slug]/result/[resultId]/page.tsx` — 第三者向け静的結果ページ
- `src/play/quiz/data/character-fortune.ts` — コンテンツデータ (全6タイプの detailedContent)
- `src/play/quiz/types.ts` — `CharacterFortuneDetailedContent` 型定義
