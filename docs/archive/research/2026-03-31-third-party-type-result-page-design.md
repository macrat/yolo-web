---
title: 第三者向けタイプ解説ページの設計パターン調査
date: 2026-03-31
purpose: シェアリンク・検索経由の第三者来訪者に最大の価値を提供するタイプ解説ページの設計パターンを調査する。来訪者100%が第三者であるカジュアル診断サイトの静的結果ページ再設計の参考資料とする。
method: Playwrightによる実サイトの直接訪問（Truity、CrystalKnows、ホイミーの複数ページ）、WebSearchによる補足調査（16Personalitiesのページ構造、クイズ結果ページのUX・心理学的研究）
sources:
  - https://www.truity.com/blog/personality-type/intj
  - https://www.crystalknows.com/16-personalities/intj
  - https://hoyme.jp/shindan/77054/results/845
  - https://hoyme.jp/shindan/80547/results/1351
  - https://www.16personalities.com/intj-personality（Cloudflareにより直接アクセス不可）
  - https://www.tryinteract.com/blog/how-quiz-results-get-shared-on-facebook/
---

# 第三者向けタイプ解説ページの設計パターン調査

## 調査概要

本レポートは、診断サイトにおいてシェアリンクや検索経由で到達する第三者来訪者に向けたタイプ解説ページの設計パターンを調査したものである。4サイト（Truity、CrystalKnows、ホイミー、16Personalities）を分析対象とし、実際にPlaywrightでページを訪問して構造・文体・CTAを記録した。

---

## 1. 各サイトの詳細分析

### 1.1 Truity（truity.com/blog/personality-type/intj）

**実際に訪問して確認。**

#### ページ構造（上から順に）

1. **ヘッダーエリア**
   - タイプ名（大見出し "INTJ"）
   - 別名テキスト（"The Mastermind"）
   - 1段落の概要説明（100語程度）
   - タブナビゲーション（Overview / Strengths / Careers / Relationships）

2. **Key Facts About INTJ**（箇条書き5項目）
   - 戦略的・論理的・稀少なタイプであることを端的に示す

3. **What Is an INTJ Personality Type?**
   - MBTI由来の解説。4文字の意味、別称（The Conceptual Planner、The Architect）
   - YouTube動画の埋め込み（"The INTJ Personality Type"）

4. **INTJ in a Nutshell**（150語程度の散文）

5. **Common Questions About INTJs**（Q&A形式、6問）
   - "How rare are INTJ women?" / "Are INTJs emotionally intelligent?" / "Why are INTJs considered 'evil masterminds'?" / "What types are attracted to INTJs?" / "How can an INTJ combat loneliness?" / "What are the most common Enneagram types for INTJs?"

6. **INTJ Values and Motivations**（150語程度）

7. **How Others See the INTJ**（200語程度） ← 特に注目すべきセクション
   - 第三者の視点から書かれた外見的特徴の説明

8. **How Rare Is the INTJ Personality Type?**（統計データ）
   - 一般人口の2.6%、男性3%、女性2.2%

9. **Famous INTJs**（著名人リスト15名）

10. **INTJ Quotes**（著名人の引用）

11. **Facts About INTJs**（統計的事実の箇条書き9項目）

12. **INTJ Hobbies and Interests**

13. **著者プロフィール**

14. **More Types**（他の16タイプへのリンク）

15. **関連記事**（6本のリスト）

16. **テスト一覧CTA**（TypeFinder / Enneagram / Love Styles / Career / Big Five / DISC）

17. **メールマガジン登録CTA**

#### 文体

- **人称**: 一貫して三人称。「INTJs are...」「They tend to...」
- **トーン**: 学術的だがアクセスしやすい。専門用語は使うが嚙み砕いて説明
- **「あなた」の使用**: なし。ページ全体を通じて三人称で統一
- **例外**: "Common Questions" セクションの質問文には "you" が出るが、本文は三人称

#### CTAの配置

- ページ中段やや下に **"Take a Truity Test"** セクション（横並びタブ形式）
- ページ最下部に **メール登録フォーム**
- 診断テストへの直接誘導ボタンは目立たない（テスト一覧を示す形式）

#### 第三者来訪者が得られる価値

- 友人がINTJであることを知った人が「INTJとはどんな人なのか」を深く理解できる
- "How Others See the INTJ" セクションは、INTJの友人と付き合う上で実践的
- "Famous INTJs" により「あの有名人もINTJ」という会話のネタが生まれる
- "Common Questions" のQ&A形式が興味の多様な入り口を提供
- "Facts About INTJs" の統計データが信頼性と面白みを同時に付与

---

### 1.2 Crystal Knows（crystalknows.com/16-personalities/intj）

**実際に訪問して確認。**

#### ページ構造（上から順に）

1. **ヒーローエリア**
   - タイプ名（"INTJ"）、別名（"The Intellectual"）
   - 100語以下の概要
   - **CTAボタン2つ**: "Take Free Assessment"（診断へ）/ "Learn more about INTJs"（ページ内スクロール）
   - 社会的証明: "1M+ people have discovered their type"

2. **Type Breakdown（タイプの構成要素）**
   - I/N/T/Jの各文字の意味をビジュアル表示
   - "At a Glance"カード（Focus: Strategy & Vision / Style: Independent / Strength: Planning / Approach: Logical）

3. **Understanding the INTJ Personality Type**
   - 3段落の説明
   - 5つのアイコン付き特徴リスト

4. **INTJ Strengths**（8項目）

5. **INTJ Blind Spots**（8項目）
   - "Every personality type has areas that don't come naturally" という導入で、批判的にならずに弱点を説明

6. **Best Careers for INTJ Personality Types**
   - "Works well with others who..." / "May hit obstacles when they..." / "Feel energized when..." / "Feel drained when..." の4ボックス
   - インタラクティブなキャリア選択（Strategic Consultant / Software Architect / Investment Analyst / Project Manager / Research Scientist / Executive Director）

7. **How to Communicate with INTJ Personality Types** ← 第三者向けに特化したセクション
   - Meetings / Email / Feedback / Resolving Conflict の4場面
   - INTJとのコミュニケーション方法を第三者に教える

8. **INTJ Personality Type in Relationships**
   - Relationship Strengths / Relationship Challenges / At Work の3カラム

9. **INTJ Motivations & Stressors**
   - "What Energizes INTJs"（8項目）/ "What Drains INTJs"（8項目）

10. **Growth Opportunities for INTJ Personality Types**
    - 4つのアドバイス（Develop Emotional Intelligence / Practice Patience / Embrace Flexibility / Invest in Relationships）

11. **Explore INTJ Relationships**（全16タイプとの相性リンク）

12. **For Teams & Organizations セクション（B2B CTA）**

13. **"Discover your 16 Personalities type" CTA**（ページ最下部）
    - "Free assessment • No credit card required • Results in 5 minutes"

#### 文体

- **人称**: 三人称（"INTJs are..." "They excel..."）
- **"How to Communicate with INTJ" セクション**: 二人称で読者に語りかける（"Come prepared with data..."）
- **トーン**: ビジネス向け、実用的、プロフェッショナル

#### CTAの設計

- ページ冒頭にCTAを配置（ページ上部の "Take Free Assessment"）
- ページ最下部にも大きなCTAブロック（"Discover your 16 Personalities type"）
- 社会的証明（"1M+ people have discovered their type"）をCTAの直下に配置

#### 第三者来訪者が得られる価値

- "How to Communicate with INTJ" セクションが極めて実用的：INTJの友人・上司・同僚と働くための具体的なヒント
- "Blind Spots" セクションが人間理解を深め、共感と寛容さを育む
- 全タイプとの関係性リンクにより、来訪者自身のタイプとの相性確認への誘導が生まれる

---

### 1.3 ホイミー（hoyme.jp/shindan/77054/results/845 他）

**実際に2ページ訪問して確認。**

#### ページ構造

1. **ヘッダーナビゲーション**
   - パンくずリスト（ホイミー > 診断名 > 診断結果）

2. **「この診断のトップへ」リンク**（ページ上部）

3. **診断名の表示**

4. **結果タイトル画像**（OGP用と思われる画像）

5. **メインコンテンツ**
   - 「あなたが犬だったら【チワワ】です！（解説は下へ）」
   - **「この診断をやってみる」ボタン**（結果タイトル直下に配置）
   - 「あなたってこんな人」（h2見出し）＋本文2〜3段落
   - 「特徴をまとめると」（h2見出し）＋✔️箇条書き3項目
   - 他の結果タイプへのリンク（「みんなの診断結果も覗いてみる」）
   - 関連診断へのリンク

6. **シェアセクション**
   - 「診断結果をシェアしよう」
   - ツイート / Facebook / LINE の3ボタン
   - URLコピーボックス
   - シェア用テキストのコピーボックス（簡潔な箇条書き形式）
   - フォローCTA

7. **「この診断のトップへ」リンク**（シェア後の動線）

8. **新着の診断**（20本程度のリスト）

9. **「他の診断を見る」**

#### 文体

- **人称**: 二人称（「あなた」）。ただし実際にページを見ている人間が「受験者ではない」可能性を考慮していない
- **トーン**: 親しみやすく、軽い。「浴槽いっぱいのプリンをつくりたい…などちょっと方向性がひねた大物感」のような遊び心のある表現
- **長さ**: 本文は非常に短い（合計300〜400字程度）

#### CTAの設計

- 「この診断をやってみる」ボタンが結果説明の直前（ページの比較的上方）に配置されており、fold上に近い
- このボタンの配置は「友人の結果を見に来た人が、自分もやりたくなる」流れを意図している

#### シェア設計の特徴

- シェア用テキストが自動生成されており、箇条書き形式で特徴を列挙（例：「・こう見えて勇敢でワイルド / ・警戒心が強い / ・すぐヤキモチ焼く」）
- このテキストがTwitter等でそのまま投稿されることで、第三者が「何の話だろう」と興味を持ち、URLをクリックする動線が設計されている

---

### 1.4 16Personalities（Cloudflare制限のためPlaywright直接訪問は不可）

**WebSearchおよびScribd経由のPDF、公開情報から構造を確認。**

#### 確認できたページ構造

- Introduction（タイプ概要）
- Strengths & Weaknesses
- Romantic Relationships
- Friendships
- Parenthood
- Career Paths
- Workplace Habits
- Conclusion

各セクションは個別URLを持ち（例: /intj-strengths-and-weaknesses）、非常に深い構成。

#### 文体

- **人称**: 主に三人称（"INTJs are..." "They tend to..."）
- 一部のセクションで二人称（"If you're an INTJ..."）も使用
- 世界最大規模の性格診断サイトとして、英語・日本語両対応

#### CTAの設計

- 各タイプページから「Free Personality Test」への誘導が常に存在
- ページ下部に診断テストCTA（確認はできなかったが既知の構造）

---

## 2. タイプ解説ページが提供する価値の分析

### 2.1 シェアリンク経由の来訪者（友人の結果を見に来た人）

**主な動機**: 「友人がこのタイプだと言っている/シェアしていた。どんなタイプなのか知りたい」

**提供すべき価値**:

1. **タイプの本質を素早く理解できる**（Key Facts、箇条書きサマリー）
2. **友人の行動・性格が腑に落ちる**（「あなたの友人はこんな人」という理解）
3. **友人との関係に活かせる実践的な知識**（Crystal Knowsの "How to Communicate" セクションがその好例）
4. **会話のネタになる**（Famous INTJs、レアリティの統計、「不思議ちゃん」的な特徴描写）

**「自分もやりたくなる」誘引要素**:

- ホイミーの「この診断をやってみる」ボタンの結果タイトル直下配置が典型的な設計
- "What type am I?" という好奇心の刺激
- "1M+ people have discovered their type"（社会的証明）
- 友人のタイプを読んで「私もやってみたい」と思う流れ（社会的比較の心理）

### 2.2 検索経由の来訪者（タイプについて調べている人）

**主な動機**: 「INTJ（または任意のタイプ名）について調べている。自分のタイプを確認したい、または他人を理解したい」

**提供すべき価値**:

1. **信頼性のある詳細な解説**（Truityの統計データ、Famous INTJs）
2. **SEO的な情報の充実**（Common Questions形式がFAQとして機能）
3. **他のタイプとの比較**（Crystal Knowsの全16タイプとの関係性マトリックス）

### 2.3 「自分もやってみたい」と思わせる要素

観察されたサイトで確認された有効なパターン:

1. **結果タイトル直下のCTAボタン**（ホイミー）: "この診断をやってみる" がページの早い段階に出現
2. **社会的証明**（CrystalKnows）: "1M+ people have discovered their type"
3. **好奇心の刺激**: タイプの特徴を読んで「自分はどれだろう?」という疑問を引き起こす
4. **他の全タイプへのリンク**（CrystalKnows）: "Explore INTJ Relationships" で全16タイプへのリンクが並ぶ

### 2.4 「友人との会話のネタになる」要素

1. **✔️形式の箇条書き特徴**（ホイミー）: SNSでそのままシェアできるフォーマット
2. **Famous INTJs**（Truity）: 「あの人もINTJなんだ」という発見が会話になる
3. **レアリティ統計**（Truity）: "2.6% of the population" という数字が「珍しいんだね」という会話を生む
4. **"Evil mastermind" ステレオタイプの解説**（TruityのQ&A）: 共有・議論のきっかけになるコンテンツ
5. **シェア用テキスト自動生成**（ホイミー）: 箇条書き形式のテキストがSNS投稿そのものになる

---

## 3. カジュアル診断サイトの第三者向けタイプ解説ページの理想形

以下は上記の観察事実に基づく分析であり、「こうすべき」という処方箋ではなく、観察から導かれる設計原則の記述である。

### 3.1 コンテンツの長さ

- **ホイミー（カジュアル代表）**: 本文300〜400字、特徴箇条書き3項目。非常に短く、テンポ感重視
- **Truity（本格的代表）**: 数千語、12以上のセクション
- **カジュアル寄りの最適解**: 本文200〜500字 + 特徴箇条書き3〜5項目。第三者が「友人のことをざっくり理解する」のに十分な量。長すぎると離脱する。

### 3.2 含めるべき情報

観察されたサイトの共通パターンから:

| 情報種別                   | ホイミー           | Truity | CrystalKnows                 | 第三者向け有効度           |
| -------------------------- | ------------------ | ------ | ---------------------------- | -------------------------- |
| タイプ概要（性格説明）     | あり               | あり   | あり                         | 高                         |
| 特徴箇条書き               | あり               | あり   | あり                         | 非常に高（SNS拡散性）      |
| 強み                       | なし               | あり   | あり                         | 中                         |
| 弱み・盲点                 | なし               | あり   | あり（"Blind Spots"として）  | 中（共感・納得感）         |
| コミュニケーション方法     | なし               | なし   | あり（"How to Communicate"） | 非常に高（第三者専用価値） |
| 有名人リスト               | なし               | あり   | なし                         | 高（会話ネタ）             |
| 統計データ（レアリティ等） | なし               | あり   | 一部                         | 高（へぇ知識）             |
| 診断への誘導CTA            | あり               | あり   | あり                         | 必須                       |
| 他タイプへの横断リンク     | あり（結果リスト） | あり   | あり                         | 中                         |

### 3.3 文体の設計

**重要観察**: 成功しているすべての英語サイト（Truity、CrystalKnows）は一貫して**三人称**を使用している。「INTJs are...」「They tend to...」の形式。

**ホイミーは二人称**（「あなた」）を使用しているが、これはホイミーのページが本来「受験者がSNSでシェアする想定」で設計されており、シェアされたリンクを誰かが読む際の視点は考慮されていない。来訪者が「あなた」と呼びかけられても違和感がない（受験者の友人が読んでも「あなた＝友人のこと」と解釈できる）という副次的な効果はあるが、設計として意図されたものではないと思われる。

**カジュアル診断での文体選択肢**:

| 文体   | 例                                                                 | 長所                                         | 短所                                     |
| ------ | ------------------------------------------------------------------ | -------------------------------------------- | ---------------------------------------- |
| 三人称 | 「このタイプの人は～」                                             | 第三者が読んで自然。学習コンテンツとして機能 | 受験者本人が見た場合にやや距離感         |
| 二人称 | 「あなたは～」                                                     | 受験者にとって没入感が高い                   | 第三者が読むと「自分のことではない」感覚 |
| 混在   | 冒頭「○○タイプの人は～」、後半「このような人があなたの友人なら～」 | 両方に対応できる                             | 文体が揺れる                             |

観察事実として、**第三者来訪者が100%を占めるページでは三人称が最も適切**。

### 3.4 CTAの配置設計

観察されたパターン:

- **ホイミー**: 結果タイトルの直下（ページ上部）に「この診断をやってみる」ボタン
- **CrystalKnows**: ページ冒頭（ヒーローエリア）と最下部の2カ所
- **Truity**: ページ中盤（テスト一覧）と最下部（メール登録）

**共通原則**: CTAはfold（スクロールしなくても見える範囲）に少なくとも1つ配置することで、友人の結果を見に来てそのまま離脱しようとする訪問者を捕捉できる。

### 3.5 「友人のタイプを見る」→「自分もやってみたい」への転換設計

観察から確認された転換メカニズム:

1. **段階的な好奇心の刺激**: タイプの特徴を読む → 「自分はどのタイプだろう?」という疑問が生まれる
2. **CTAのコピー設計**: 「この診断をやってみる」は「あなたも試してみよう」という明確な誘いかけ
3. **社会的比較の活用**: "1M+ people have discovered their type"（多くの人が試している）
4. **摩擦の最小化**: 「無料」「登録不要」「5分で完了」などの障壁除去コピー（CrystalKnows: "Free assessment • No credit card required • Results in 5 minutes"）

---

## 4. 各サイトの第三者向けページ設計の評価まとめ

### Truity

**強み**: 情報量が豊富で調べる目的の訪問者に価値が高い。三人称で一貫しており第三者として読んで自然。"How Others See the INTJ" というセクション名が第三者の視点を明示的に設計している。

**特記事項**: "How Others See the INTJ" というセクションは、タイプ解説ページにおける第三者向け価値の典型。INTJではない人がINTJを理解するための最短経路を提供している。

### CrystalKnows

**強み**: "How to Communicate with INTJ Personality Types" という完全に第三者向けのセクションが存在。INTJの友人・上司・同僚と接する人のための実践的なガイド。ページ上部CTAの社会的証明が強力。

**特記事項**: ビジネス向けサイトであるため全体的にプロフェッショナルなトーン。カジュアル診断には直接は適用できないが、「第三者が実際に使える情報」の方向性として参考になる。

### ホイミー

**強み**: 短さによるテンポ感。シェア用テキストの自動生成機能が優秀で、SNS拡散のサイクルを完結させている。「この診断をやってみる」ボタンの位置が効果的。

**弱み**: 文体が二人称のため、純粋に第三者として読む場合にわずかな違和感がある。コンテンツ量が少なく、「友人の性格をもっと深く知りたい」という需要には応えられない。

### 16Personalities

直接訪問は不可だったが、公開情報から確認できる特徴:

- セクションを細分化してページを横断させる構造（SEO的に有利）
- 各タイプに数千語の解説（本格的すぎてカジュアル診断には参考にならない量）
- 三人称を基本としつつ一部二人称を使用するハイブリッド文体

---

## 5. 調査から得られた主要な設計原則

以下は観察事実から帰納した設計原則であり、実際のサイトで確認されたパターンに基づく。

1. **三人称が第三者向けの基本文体である**: 英語の主要サイトはすべて三人称を使用。「このタイプの人は〜」という書き方が来訪者にとって最も自然に読める。

2. **「他者の目から見た特徴」セクションは第三者向けの核心コンテンツである**: Truityの "How Others See the INTJ"、CrystalKnowsの "How to Communicate with INTJ" がその好例。

3. **CTAはfold上または結果コンテンツの直後に置く**: ホイミーの配置（タイトル直下）が最もシンプルで効果的なパターン。

4. **箇条書き形式の特徴まとめがSNS拡散の核となる**: ホイミーのシェア用テキストはこの箇条書きを流用しており、テキスト自体が「拡散のための素材」として機能する。

5. **社会的証明が「自分もやってみたい」を後押しする**: 数値（"1M+ people"、"2.6% of population"）は来訪者の行動を促す。

6. **摩擦の除去コピーが転換率を高める**: "Free • No credit card required • Results in 5 minutes" のような安心訴求がCTAの近くにある。

---

## 参考情報: 調査で確認できなかった事項

- 16Personalitiesの日本語版ページの構造（Cloudflare制限のため直接確認不可）
- MIRRORZの公開結果ページ（アクセス制限により確認不可）
- Kuizyの結果ページ（公開URLが見つからなかった）
