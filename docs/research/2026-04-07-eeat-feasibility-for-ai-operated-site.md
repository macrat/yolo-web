---
title: AI運営サイトのGoogleEEAT要件充足可能性調査
date: 2026-04-07
purpose: AI（Claude Code）が自律的に運営するyolos.netがGoogleのEEAT要件をどの程度満たせるかを評価し、SEO戦略の方向性を決定するための根拠を提供する
method: |
  - Google公式ドキュメント（Search Quality Rater Guidelines PDF、Google Search Central）を参照
  - SEO専門メディア（Search Engine Journal、Search Engine Land、Backlinko、SEMrush等）の2025〜2026年記事を収集
  - YMYL分類、EEAT各要素のAI対応可能性、事例を調査
sources:
  - "Google Search Quality Rater Guidelines (September 2025版): https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf"
  - "Search Engine Land - Google quality raters AI-generated content: https://searchengineland.com/google-quality-raters-content-ai-generated-454161"
  - "Search Engine Land - Google updates rater guidelines Sept 2025: https://searchengineland.com/google-updates-search-quality-raters-guidelines-adding-ai-overview-examples-ymyl-definitions-461908"
  - "SEOZoom - Google Quality Rater Guidelines comprehensive guide: https://www.seozoom.com/google-search-quality-rater-guidelines/"
  - "wearetg.com - What's New with Google E-E-A-T in 2025: https://www.wearetg.com/blog/google-eeat/"
  - "Originality.AI - Google Search Quality Rater Guidelines AI Use: https://originality.ai/blog/google-search-quality-rater-guidelines-ai"
  - "ALM Corp - Google December 2025 Core Update: https://almcorp.com/blog/google-december-2025-core-update-complete-guide/"
  - "SEMrush - Can AI Content Rank on Google (20K URLs analysis): https://www.semrush.com/content-hub/can-ai-content-rank-on-google/"
  - "Writesonic - Does AI Content Rank in Google 2025: https://writesonic.com/blog/does-ai-content-rank-in-google"
  - "Search Engine Land - 16-month AI content experiment: https://searchengineland.com/ai-generated-content-google-search-experiment-472234"
---

# AI運営サイトのGoogle EEAT要件充足可能性調査

## 調査の背景

yolos.net（開設：2026-02-13）はClaude Codeが自律的に運営するサイトである。コンテンツは占い・診断・ツール・技術ブログの4カテゴリで構成され、すべてAIが生成している。本調査は、このサイトがGoogleのEEAT要件をどの程度満たせるか、またどのような施策が有効かを評価することを目的とする。

---

## 1. GoogleのAI生成コンテンツに対する公式スタンス（2025〜2026年）

### 1.1 基本原則（検証済み事実）

Googleの公式見解は「AIの適切な利用はガイドライン違反ではない」である。Google Search Centralの文書には「AIや自動化の適切な利用は、検索ランキングを操作することを主目的としていない限り、ガイドラインに反しない」と明記されている。

Googleが処罰するのはコンテンツの生成手段ではなく、以下の行動である。

- **スケールドコンテンツ乱用（Scaled Content Abuse）**：大量の低品質コンテンツを生成してランキングを操作する行為
- **付加価値のない自動生成**：人間の編集・監修なしに公開されたコンテンツ

2025年1月のSearch Quality Rater Guidelines更新でGenerative AIが初めて明確に定義され、「有用なツールだが悪用される可能性がある」と位置づけられた。

### 1.2 2025〜2026年の主要アップデートと影響（検証済み事実）

**2025年1月更新**

- 生成AIの定義を初めてガイドラインに追加
- Scaled Content Abuse、Filler Content（内容のない水増しコンテンツ）の定義を明確化
- 架空の著者プロファイルやAIペルソナによる偽のEEATシグナルを明示的に問題視

**2025年9月更新**

- AI Overviewの評価方法の例を追加
- YMYLの定義を拡張（後述）
- 1ページ追加（181→182ページ）

**2025年12月コアアップデート**

- EEAT要件が従来のYMYLトピック以外にも広く適用されるようになった
- 医療・金融サイトでは60%超のランキング低下事例あり
- 一方でAIコンテンツそのものへのペナルティではなく、人間の専門的監修なしに公開されたコンテンツへの評価が厳格化された

**2026年2月**

- Google Search Centralにて Authors セクションが新設され、著者の透明性が品質評価の直接的な考慮事項であることが公式に明示された

### 1.3 品質評価の実際（検証済み事実）

SEMrushの2万URL分析（2025年）によると、AI生成コンテンツと人間が書いたコンテンツはGoogle検索結果での表示率がほぼ同等であった（AI：57%、人間：58%がトップ10に出現）。ただしこれは品質フィルターを通過したコンテンツの比較であり、低品質なAIコンテンツが大量に生成されて検索インデックスから除外されたケースは含まれない。

Search Engine Landの16ヶ月実験でも、適切に編集されたAIコンテンツはGoogle検索でのランキングを維持・向上させることが確認されている。

---

## 2. EEAT各要素のAI運営による充足可能性

EEATはExperience（経験）、Expertise（専門性）、Authoritativeness（権威性）、Trustworthiness（信頼性）の4要素から構成される。重要度はTrustworthiness > その他の順とされており、信頼性が最重要である。

### 2.1 Experience（経験）— 最難関要素

**定義**：コンテンツ作者がトピックについて直接・実体験的な知識を持っているかどうか。

**AI運営の課題**：これは4要素の中でAI運営サイトにとって最も充足が困難な要素である。Googleは「AIはExperienceを偽ることができない」という立場であり、2025年のガイドライン更新でExperienceの重みが増している。

**yolos.netへの適用**：

- **占い・診断コンテンツ**：占い・診断は人間でも「経験」を証明することが元来困難なジャンルである。エンターテインメント目的であることを明示しているため、このカテゴリにおいてExperienceの欠如は構造的な問題にはなりにくい（後述のYMYL分析参照）。
- **技術ブログ（AI運営記録）**：AIエージェントによるサイト運営という実際の経験を記録しているため、このジャンルに限りExperienceを主張できる唯一のカテゴリである。

**対応策（推測を含む）**：ブログカテゴリで実際の運営経験（試行錯誤、失敗、学習）を継続的に記録することで、このトピックに関するExperienceシグナルを蓄積できる可能性がある。

### 2.2 Expertise（専門性）— 部分的充足可能

**定義**：コンテンツがトピックについて深く正確な知識を示しているかどうか。

**AI運営の充足可能性**：Googleは「AIは専門的に聞こえるよう指示できる（prompt to sound expert）が、それは本物の専門性ではない」としている。ただし、非YMYLコンテンツでは要求水準が低い。

**yolos.netへの適用**：

- **診断・占いコンテンツ**：エンターテインメント目的であり、医学的・科学的根拠を求められない。コンテンツの面白さ・意外性・正確な設計ロジックが「品質」の代替指標となる。
- **ツールサイト**：計算・変換・テキスト処理ツールはその機能が正確に動作することそのものがExpertiseの証明になり得る。
- **技術ブログ**：AI技術・Next.js・エージェント運用に関する正確な技術情報が蓄積されれば、このジャンルでのExpertiseを示せる。

### 2.3 Authoritativeness（権威性）— 蓄積に時間がかかる

**定義**：サイトやコンテンツが業界・ジャンルで権威ある存在として認知されているかどうか。外部からの被リンク、メディア言及、業界認知等で評価される。

**AI運営の充足可能性**：権威性は外部のエコシステムによって形成されるため、サイト自身がコントロールできない側面が強い。開設2ヶ月のサイトに権威性がないのは当然であり、これはAI運営固有の問題ではない。

**yolos.netへの適用**：

- SNSでのシェア・バイラルがブランド認知につながる可能性がある
- AI技術ブログ経由でエンジニアコミュニティからの被リンクを得られる可能性がある
- ただし2ヶ月の新興サイトとして、権威性の蓄積はまだほぼゼロである

### 2.4 Trustworthiness（信頼性）— 最優先・部分的充足済み

**定義**：サイトが正直で誠実であり、ユーザーを欺かない設計になっているかどうか。4要素中で最重要。

**AI運営での充足方法**（対応可能な要素）：

- HTTPS使用（達成済みと推定）
- プライバシーポリシーの設置
- お問い合わせページの設置
- Aboutページでの運営者情報の透明な開示
- AI運営であることの明示（constitution.mdで要求済み）

**yolos.netへの適用**：

- constitution.md Rule 3において「AIが実験として運営していることをビジターに通知する」と規定されており、AI透明性の開示は構造的に担保されている
- フッター・Aboutページでの開示により、Trustworthinessの基礎的シグナルを提供できる
- 重要：Google Quality Rater Guidelinesのセクション2.5.2では「コンテンツに責任を持つのは誰か」を評価することが求められており、「AI運営の実験サイト」という明示はこの要件に対する誠実な回答となる

---

## 3. yolos.netコンテンツのYMYL該当性

### 3.1 YMYL（Your Money or Your Life）の定義（2025年9月更新版）

2025年9月版ガイドラインにおけるYMYLカテゴリは以下の4つである。

1. **健康と安全**：身体的・精神的健康に影響する情報（疾患、治療、栄養、薬等）
2. **財務的安全**：投資、住宅ローン、ローン、税金等
3. **政府・市民・社会（Government, Civics & Society）**：選挙・投票情報、公的機関への信頼、社会的に重大な影響を持つトピック（2025年に拡張・改名）
4. **その他の敏感なトピック**：上記以外で危害を生じ得るもの（交通安全、自然災害ガイドライン等）

スポーツ、エンターテインメント、日常的なライフスタイルに関するコンテンツはYMYLに含まれないと明記されている。

### 3.2 各コンテンツカテゴリのYMYL該当性評価

| コンテンツカテゴリ                 | YMYL該当性 | 根拠                                                                                                                 |
| ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 占い（エンターテインメント）       | **非該当** | エンターテインメント分野に属する。健康・財務・選挙に直接影響しない。免責事項を設置しエンタメ目的を明示すれば問題なし |
| 診断（性格診断・キャラクター診断） | **非該当** | 自己発見・娯楽目的の性格診断。医学的診断や金融アドバイスではない                                                     |
| 知識テスト（漢字・ことわざ等）     | **非該当** | 学習・エンターテインメント目的。健康・財務に影響しない                                                               |
| おみくじ                           | **非該当** | 伝統的エンターテインメント。ランダム結果のゲームコンテンツ                                                           |
| テキストツール（文字数計算等）     | **非該当** | ユーティリティツール。健康・財務・安全に関わらない                                                                   |
| 技術ブログ（AI運営記録）           | **非該当** | IT技術情報。医療・金融・政治の専門アドバイスではない                                                                 |

**結論（検証済み）**：yolos.netの現在のコンテンツ構成はYMYLに該当しない。これはEEATの充足可能性にとって有利な条件である。非YMYLサイトに対するEEAT要件の水準は、YMYLサイトと比較して大幅に低い。

### 3.3 潜在的なYMYL境界ケース（注意事項）

以下の内容を追加する場合には注意が必要である。

- 健康・ダイエット関連の占い（YMYL境界に近づく可能性）
- 金融運・投資運的な占い（YMYL該当リスク）
- 恋愛に関するアドバイス的コンテンツ（文脈次第でYMYL境界）

現在の「笑えるエンターテインメント」という定位は、YMYLリスクを回避する上でも適切なポジショニングである。

---

## 4. AI運営を明示したサイトの検索上位表示事例

### 4.1 確認できた事例（検証済み事実）

調査時点（2026年4月）において、「AI運営であることを明示した上で検索上位を取っているサイト」の具体的な公開事例は確認できなかった。これは該当事例が存在しないことを意味しない。以下の理由から調査の限界がある。

- サイト運営者がAI運営を積極的に公表するケースが少ない
- GoogleがAI開示を直接的なランキング要因として扱わないため、事例として注目されにくい

### 4.2 関連する実証データ（検証済み事実）

**AI生成コンテンツのランキング実績**：

- SEMrushの2万URL分析：AI生成コンテンツとヒューマンコンテンツはトップ10表示率がほぼ同等（57% vs 58%）
- Search Engine Landの16ヶ月実験：適切に編集されたAIコンテンツはGoogleでランキングを維持・向上
- GravityWrite.com事例：AIドラフトを人間が編集・個人体験を追加した結果、2025年更新後にランキング30%向上

**AIコンテンツのペナルティ事例**：

- Izoate.com：価値を付加しないAIコンテンツで2025年3月に89.14%のトラフィック低下
- 某フィンテックブログ：500記事を一夜に公開し2週間でオーガニックトラフィック80%減少

**示唆**：AI運営の開示自体は検索ランキングに正負いずれの方向にも直接的な影響を与えないが、AI生成コンテンツの品質と価値が決定的な要因となる。

### 4.3 エンターテインメント・クイズカテゴリの状況

BuzzFeed、Quizly.co、GoToQuiz等の大手クイズ・占いサイトは、エンターテインメント目的のAI補助コンテンツを展開している。GoToQuizは「for entertainment purposes only」という免責表示を明示しており、Googleはこれらのサイトを通常のエンターテインメントコンテンツとして扱っている。これは占い・診断を提供するyolos.netにとって参考事例となる。

---

## 5. AI運営サイトとしてのEEAT戦略の評価

### 5.1 充足可能な要素（現実的）

| EEAT要素                        | 充足可能性 | 必要なアクション                                                                  |
| ------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| Trustworthiness                 | **高**     | AboutページにAI運営の透明な開示、プライバシーポリシー、お問い合わせフォームの整備 |
| Expertise（ツール・技術ブログ） | **中**     | ツールの正確な動作、技術ブログの正確な技術情報                                    |
| Authoritativeness               | **低〜中** | 時間をかけてのSNS拡散・被リンク獲得。短期では困難                                 |
| Experience（AI運営記録）        | **中**     | 実際の運営経験を継続的にブログで記録                                              |

### 5.2 構造的に充足困難な要素

**Experience（占い・診断分野）**：AIエージェントが占いの「経験」を持つことは不可能。ただし、このカテゴリが非YMYLのエンターテインメントである限り、Experienceへの要求水準は低い。

**Authoritativeness（外部認知）**：外部からの被リンク・メディア言及・業界認知は外部エコシステムに依存し、新規サイトは時間をかけて蓄積するしかない。AI運営であることはこの点で有利でも不利でもない。

### 5.3 最重要施策（優先度順）

1. **Trustworthinessの基盤整備**（最優先）：AboutページにAI運営の詳細、プライバシーポリシー、お問い合わせ手段、免責事項の整備。これはGoogleがSection 2.5.2で「コンテンツの責任者の特定」を評価することへの直接的な対応である。

2. **コンテンツ品質の維持**：AIコンテンツがペナルティを受けるのは「付加価値がない大量生産」の場合である。各コンテンツが独自のロジック・面白さを持ち、ユーザーに実際の価値を提供することが不可欠。

3. **エンタメ免責事項の明示**：「このサイトはエンターテインメント目的です」「占い結果に基づく判断は自己責任で」という免責表示は、YMYL外に留まる上で有効なシグナルとなる。

4. **技術ブログの継続**：AI運営という実際の経験（Experience）を証明できる唯一のカテゴリ。エンジニアコミュニティからの被リンク獲得（Authoritativeness）の主要チャネルでもある。

5. **スケールドコンテンツ乱用の回避**：一度に大量のコンテンツを公開することはGoogleのスパムポリシー違反リスクを高める。継続的・計画的なコンテンツ追加が必要。

---

## 6. 総合評価

### 6.1 現状のポジション評価

yolos.netの現状は、EEATの観点から以下のように評価できる。

**有利な条件**：

- コンテンツ全体が非YMYL（EEATの要求水準が低い）
- AI運営の透明な開示（Trustworthinessの基礎）がconstitution.mdに規定済み
- エンターテインメント目的の明確化によりYMYLリスクを回避している
- 技術ブログがExperienceを証明できる唯一のカテゴリとして機能し得る

**不利な条件**：

- 開設2ヶ月（権威性の蓄積がほぼゼロ）
- 完全AI運営のためExperienceの証明が構造的に困難（ただし非YMYLなので実害は限定的）
- 被リンク・外部メディア言及の実績なし

### 6.2 長期的な見通し

**推測（確認できないが合理的と考えられる）**：

Googleの方向性は「AI生成かどうか」ではなく「ユーザーに本当に有用か」に収束している。yolos.netのコンテンツがエンターテインメントとして実際に面白く・楽しめるものであれば、SEO上の不利はAI運営固有の問題ではなく、単純に「新規サイトの権威性不足」という時間で解決できる問題に帰着する可能性が高い。

最大のリスクは「AI運営であること」ではなく、「品質の低いコンテンツを大量生成してしまうこと」である。

---

## 参考情報源

- [AI Content, EEAT and Google: How to Avoid Getting Penalized in 2026](https://medium.com/@makarenko.roman121/ai-content-eeat-and-google-how-to-avoid-getting-penalized-in-2026-575f3cb56e37)
- [Google AI Content Guidelines: Complete 2026 Guide](https://koanthic.com/en/google-ai-content-guidelines-complete-2026-guide/)
- [Google's new position and policy for AI text and content](https://seo.ai/blog/googles-position-policy-ai-text-content)
- [Google Search Quality Rater Guidelines (September 2025)](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf)
- [Google quality raters now assess whether content is AI-generated](https://searchengineland.com/google-quality-raters-content-ai-generated-454161)
- [Google updates search quality raters guidelines - YMYL definitions](https://searchengineland.com/google-updates-search-quality-raters-guidelines-adding-ai-overview-examples-ymyl-definitions-461908)
- [Google Quality Raters Update 2025: Key Changes & SEO Impact](https://textuar.com/blog/google-quality-raters/)
- [What's New with Google E-E-A-T in 2025?](https://www.wearetg.com/blog/google-eeat/)
- [Google's Updated Raters Guidelines Target Fake EEAT Content](https://www.searchenginejournal.com/googles-updated-raters-guidelines-target-fake-eeat-content/546042/)
- [Does AI Content Rank in Google? A Comprehensive Report](https://writesonic.com/blog/does-ai-content-rank-in-google)
- [Can AI Content Rank on Google? We Analyzed 20K Blog URLs](https://www.semrush.com/content-hub/can-ai-content-rank-on-google/)
- [How AI-generated content performs in Google Search: A 16-month experiment](https://searchengineland.com/ai-generated-content-google-search-experiment-472234)
- [Google December 2025 Core Update analysis](https://almcorp.com/blog/google-december-2025-core-update-complete-guide/)
- [Google E-E-A-T: Guide to Creating Expert Content in 2026](https://linkbuilder.com/blog/google-eeat-guide)
- [Understanding Google's E-E-A-T, YMYL Guidelines | Wix SEO Hub](https://www.wix.com/seo/learn/resource/google-search-quality-guidelines)
