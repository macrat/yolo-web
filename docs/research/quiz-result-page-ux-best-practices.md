---
title: 占い・診断・クイズサイトにおける「結果ページ」のベストプラクティス
date: 2026-03-28
purpose: yolos.netの結果ページのエンゲージメントを最大化するための設計指針を得る。特に「プレイ完了者」と「SNSシェアリンク経由訪問者」の2種類のユーザーに対して、関連コンテンツへの回遊を促進する手法を明らかにする。
method: |
  - "quiz result page UX best practices engagement 2024"
  - "BuzzFeed quiz result page design engagement techniques"
  - "16personalities result page design psychology sharing motivation"
  - "personality quiz result page social sharing viral mechanics psychology"
  - "quiz result page different experience returning vs new visitor share link UX"
  - "診断メーカー 結果ページ デザイン エンゲージメント シェア 2024"
  - "quiz result page call to action next content navigation internal links engagement optimization"
  - "result page progressive disclosure animation reveal engagement conversion rate"
  - "SNS shared result page take quiz yourself button conversion best practice viral loop"
  - "quiz result page related content recommendation carousel placement best practice"
  - "診断コンテンツ 結果ページ 次のアクション 関連診断 回遊率 改善 事例"
  - "quiz result page scroll depth engagement above the fold share button position UX study"
  - "personality test result reveal animation dopamine engagement hook strategy"
  - "quiz result page too much information content length user experience drop off"
sources: |
  - https://www.tryinteract.com/blog/quiz-result-landing-pages/
  - https://www.visualquizbuilder.com/post/quiz-result-page-design
  - https://www.opinionstage.com/blog/quiz-results-page/
  - https://quizandsurveymaster.com/create-attractive-quiz-result-page-design/
  - https://foreverbreak.com/guest/psychology-viral-quizzes/
  - https://www.nfx.com/post/why-people-share
  - https://www.riddle.com/blog/use-cases/data-collection/why-people-love-to-take-online-quizzes/
  - https://www.nngroup.com/articles/scrolling-and-attention/
  - https://cxl.com/blog/above-the-fold/
  - https://www.wearetribu.com/blog/designing-for-dopamine-how-to-spark-website-engagement
  - https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/
  - https://fastercapital.com/content/Viral-quiz-marketing--How-to-create-and-share-quizzes-that-generate-leads-and-engagement.html
  - https://liskul.com/diagnosis-15600
  - https://shindancloud.com/trend/624
---

# 占い・診断・クイズサイトにおける「結果ページ」のベストプラクティス

## エグゼクティブサマリー

結果ページは診断・クイズサービスにおける最重要ページである。ここで得られた知見を一言でまとめると、「**結果ページは感情的な報酬を即座に提供し、好奇心の連鎖を設計することで、エンゲージメントとシェア、回遊を同時に達成できる**」。

yolos.netにおける2種類のユーザー（プレイ完了者とSNSシェアリンク経由訪問者）それぞれに対して、結果ページが担うべき役割は異なるが、根底にある心理メカニズムは共通している。

---

## 1. 結果ページの魅力を高めるUI/UXパターン

### 1-1. 段階的な開示（Progressive Disclosure）による期待感の演出

**なぜ有効か**

人間の脳は「報酬を期待するとき」にドーパミンが分泌される。結果を一度に見せるより、段階的に明かすことで「もうすぐわかる」という期待状態を意図的に作り出せる。

**具体的な手法**

- ローディングアニメーション（「あなたの結果を分析中...」的な演出）で2〜3秒の期待感を作る
- 結果タイトルを先に大きく表示し、詳細説明を下にスクロールしながら読ませる構成
- 結果の要素を順番に出現させるアニメーション（例：まずタイプ名、次にキャッチコピー、次に詳細説明）
- 「あなたは○○タイプです」という宣言を画面上部に置き、その根拠・詳細を下に展開する

**注意点**

ローディング演出は2〜4秒が上限。それ以上は離脱率が上昇する。アニメーションは「報酬を遅らせる」のではなく「期待感を高める」目的で使う。

### 1-2. 視覚的インパクト：結果が「一目でわかる」デザイン

Nielsen Norman Groupの研究によると、ユーザーはページ閲覧時間の57%をファーストビュー（フォールド上）に費やす。結果ページのファーストビューに含めるべき要素は以下の通り。

**ファーストビューに必須の要素**

1. **結果タイトル/タイプ名**: 大きなフォント、印象的な色使い
2. **代表画像またはアイコン**: テキストだけでなく視覚的なアイデンティティ
3. **キャッチコピー的な一文**: 「あなたは〇〇な人です」のような自己同一性を強化する言葉
4. **シェアボタン**: ファーストビュー内または直後に配置（後述）

16Personalitiesが成功した最大の理由の一つは、各タイプにカラーコード・イラスト・ナラティブを組み合わせ、結果を「データ」ではなく「物語」として体験させた点にある。

### 1-3. 結果テキストの構成：「シェアしたい」と思わせる内容

**心理的原則**

ハーバード大学の神経科学研究によると、自分自身について話す・共有することは食や金銭と同じ快楽系回路（mesolimbic dopamine system）を活性化する。人がシェアする動機は主に以下の2つ。

- **自己検証欲求（Self-verification）**: 「これ、まさに私だ」という共鳴
- **自己呈示欲求（Self-presentation）**: 「こう思われたい自分」を表現する手段

**結果テキストが満たすべき条件**

| 条件                     | 説明                                 | 実装例                                      |
| ------------------------ | ------------------------------------ | ------------------------------------------- |
| 肯定的トーン             | ネガティブな表現を避け強みに着目する | 「慎重すぎる」→「深く考える思慮深い人」     |
| 具体性                   | 汎用的すぎない、でも広く当てはまる   | バーナム効果を活用しつつ具体的表現を混ぜる  |
| 共感を呼ぶ言葉           | 「あるある」と感じさせる日常の描写   | 「友達と議論になったとき、あなたはまず...」 |
| アイデンティティとの統合 | 「このタイプの人は〇〇が得意」       | 強みの説明、有名人との比較                  |
| シェアしやすい一言       | SNSの投稿文として機能する短い表現    | 「#私は〇〇タイプ」のようなハッシュタグ候補 |

**推奨される結果テキストの構成**

1. タイプ名（インパクトある命名）
2. キャッチコピー的一文（シェア用途を意識）
3. 3〜5行の核心的な説明（この人物像の本質）
4. 「あなたの強み」セクション
5. 「この結果の人に多い特徴」（共感ポイント）
6. 関連コンテンツへの誘導（後述）

### 1-4. 情報量の適正化：「ちょうど良さ」が回遊率を決める

**過剰情報の弊害**

コンテンツ量が増えるほど認知負荷が高まり、「次のアクション」を取るエネルギーが残らなくなる。特に以下の状況でユーザーは離脱する。

- 結果の説明が長文すぎて読む気が失せる
- スクロールしても情報が続き「終わり」が見えない
- CTA（シェアボタン、次のコンテンツ）が見つからない

**推奨する情報量の設計**

- 結果の核心説明: 150〜300字程度（スマートフォンで2〜3スクリーン以内）
- 詳細情報は折りたたみ（アコーディオン）または別ページへのリンクで提供
- 「もっと詳しく」のオプションは残しつつ、デフォルトは簡潔に

---

## 2. プレイ完了者とSNS来訪者の体験を分けるパターン

### 2-1. 2種類のユーザーの心理的状態の違い

| 項目               | プレイ完了者                   | SNSシェアリンク経由訪問者      |
| ------------------ | ------------------------------ | ------------------------------ |
| 状態               | 達成感・期待感が高い           | 軽い好奇心・懐疑心がある       |
| 滞在時間の傾向     | 比較的長い（投資済み）         | 短い（すぐ離脱傾向）           |
| 求めるもの         | 「自分の結果を深く理解したい」 | 「友達の結果と自分を比べたい」 |
| 次のアクション候補 | シェア・別の診断を試す         | 自分も試してみる               |
| 最大の離脱リスク   | 結果に納得できない             | ページが魅力的でない           |

### 2-2. URLパラメータによる表示制御

実装的には、シェア用URLに`?from=share`等のパラメータを付与し、JavaScript/サーバーサイドで表示を切り替える手法が使われる。

**シェアリンク経由者向けの追加要素**

- ページ最上部または目立つ位置に「あなたも試してみる？」ボタン
- 「○○さんがあなたにシェアしました」のような文脈説明
- 「全体の何%がこの結果だった」等の相対情報（好奇心を刺激）
- 結果の下に「自分の結果を見る」への誘導を強調

**プレイ完了者向けの追加要素**

- 結果の詳細説明（深掘りコンテンツ）
- シェアボタンの優先的配置
- 「もう一度試す」ボタン
- 関連コンテンツの推薦（回遊促進）

### 2-3. シェアリンク経由者に「自分もやりたい」と思わせる手法

BuzzFeedの成功を分析した研究が明らかにするように、「友人の結果」は最も強力な誘引である。この「社会的比較欲求」を活用するデザインが重要。

**有効なアプローチ**

1. **比較を可能にする**: 「あなたならどの結果になる？」という問いかけ
2. **FOMO（取り残される恐怖）を活用**: 「○○人がすでにプレイ済み」等のソーシャルプルーフ
3. **ハードルの低さを提示**: 「30秒でわかる」「3問だけ」等の所要時間の明示
4. **結果の魅力を見せてから誘導**: 他の結果タイプのプレビューを見せることで全体の価値を伝える
5. **CTAの文言**: 「自分もやってみる」より「私の結果を見る」の方が個人化されて効果的

---

## 3. 関連コンテンツへの回遊を促進する手法

### 3-1. 「満足」から「次の好奇心」への心理移行

診断結果に満足したユーザーは「達成感」の状態にある。この状態から「次をやってみたい」に移行させるには、**好奇心の種を植える**必要がある。

**効果的なトリガー**

- **結果の予告**: 「あなたが〇〇タイプなら、この診断でさらに詳しくわかる」
- **補完的な価値提案**: 「このタイプの人が最もハマる占いはこれ」
- **未解決の問い**: 「あなたの相性タイプはどれ？」「あなたの隠れた才能は？」
- **コレクション欲求**: 「全5種類のタイプを制覇しよう」的な達成感の提示

### 3-2. 関連コンテンツ配置のUXパターン

**推奨配置パターン（上から順）**

```
[結果タイトル・画像] ← ファーストビュー
[シェアボタン] ← 即座にアクション可能に
[結果の核心説明 (150-300字)]
[強み・特徴のリスト]
─────────────────────
[関連コンテンツA: 同カテゴリ別診断] ← 関連性高
[関連コンテンツB: 別ジャンルのおすすめ]
─────────────────────
[詳細説明（アコーディオン展開）]
[もう一度試す]
```

**カルーセルよりリスト形式が有効**

カルーセル（横スライド）は受動的に閲覧するコンテンツには適しているが、「次の行動を選ぶ」場面では認知負荷が高い。関連コンテンツは2〜3件の縦並びカード形式が最も効果的。

**なぜ2〜3件か**

選択肢が多すぎると「決定回避」が起きる。診断・占いという文脈では、ユーザーはすでに一定のエネルギーを使っており、次の選択は少ない選択肢の中から直感的に選べる形が望ましい。

### 3-3. 関連コンテンツのラベリングと文言

単純な「関連コンテンツ」ではなく、結果と連動したコンテキスト付きの紹介文が有効。

**Before（汎用的）**

> 他の診断も試してみよう

**After（結果連動型）**

> 〇〇タイプのあなたにぴったりな占い
> あなたの〇〇をさらに深掘りするなら

この「あなたの結果を受けたオススメ」という文脈付けが、クリック率を大幅に改善する。

### 3-4. シェアボタンの配置と設計

**ベストプラクティス**

- **位置**: 結果説明の直後、かつ詳細コンテンツより前
- **形式**: 複数SNSのアイコン + テキストボタン（どちらかだけより両方が有効）
- **OGP設定**: シェアされた際に表示される画像・タイトル・説明文を結果ごとに最適化
- **シェアテキストの自動生成**: 「私は〇〇タイプでした！#yolos」等の投稿文を自動セット

**シェアボタンのタイミング**

「結果への好奇心が満たされた直後」がシェア意欲の最高点。説明テキストを読む前にシェアボタンを見せると押してもらえない。逆に詳細を全部読み終えた後は意欲が下がる傾向がある。

シェアボタンは「結果タイトル + 核心説明」を読んだ直後の位置が最適。

### 3-5. スクロール戦略：「情報の匂い」を使った設計

Nielsen Norman Groupの研究では、ユーザーがスクロールを続けるかどうかは「今見えているコンテンツが次に何か価値あるものがあると示唆しているか」によって決まる（情報の匂い理論）。

**実装のポイント**

- 関連コンテンツカードが「少しはみ出して見える」状態にして続きがあることを示す
- セクション間に視覚的区切りを入れつつ、「次のセクションの予告」となるテキストを置く
- 例: 「↓ あなたのタイプに合う占いを見る」のような視線を引き下げるテキスト

---

## 4. 競合サービスの事例分析

### 16Personalities

- **強み**: 各タイプに固有の色・イラスト・命名を持ち、結果が「アイデンティティ」として機能する
- **シェア促進**: タイプコード（例：INTJ）がハッシュタグとして自然に流通する設計
- **結果の深さ**: トップページは簡潔だが、各セクション（強み、弱み、恋愛、キャリア等）に深掘りできる構造
- **学べる点**: 「タイプ名」自体を覚えやすく・語りやすく設計すること

### BuzzFeed Quiz

- **強み**: 結果が強烈にポジティブかつ「あるある」感が強い
- **シェア促進**: 結果ページがそのままSNS投稿として完結するシンプルな構成
- **視覚**: GIFやミーム的な画像を多用し、スクロールなしでも満足できる情報量
- **学べる点**: 「短く、笑えて、シェアしやすい」結果テキスト

### 診断メーカー（ShindanMaker）

- **強み**: シェアボタンをページ内に常時表示する設計（固定表示）
- **シェア促進**: Twitter/Xとの連携が強く、投稿テキストが自動生成される
- **関連コンテンツ**: 同作者の他診断へのリンクを結果ページ内に配置
- **学べる点**: 摩擦ゼロのシェアフローと、シェア後の流入を次の診断で受け止める循環設計

### Interact（tryinteract.com）

- **強み**: 結果ページをランディングページとして設計し、CTAを明確に1つに絞る
- **シェア促進**: OGPの最適化と、シェアテキストの自動生成
- **関連コンテンツ**: 結果に基づいた商品・サービス推薦（eコマース特化）
- **学べる点**: 結果ページのCTAは「1つの明確なアクション」に絞ることで転換率が上がる

---

## 5. yolos.netへの具体的な示唆

### 優先度高：即座に実装すべき改善

1. **シェアボタンをファーストビューに確実に入れる**
   結果タイトルと核心説明（150字以内）の直後にシェアボタンを配置。OGPを結果ごとに最適化。

2. **関連コンテンツを「結果起点の文脈」で提示する**
   「あなたは〇〇タイプです」→「〇〇タイプの人が最もハマるのはこれ」という文脈でリンクを設置。

3. **SNSシェアリンク経由訪問者向けの「自分もやる」CTAを強調**
   URLパラメータで検出し、ファーストビューに「あなたも試す？」ボタンを大きく配置。

### 優先度中：品質向上のための改善

4. **結果テキストの構成を統一する**
   全診断コンテンツで「タイプ名 → キャッチコピー → 核心説明 → 強みリスト → 関連コンテンツ」の構造を徹底。

5. **結果のビジュアルアイデンティティを強化する**
   各結果タイプに固有の色・アイコン・画像を割り当て、視覚的に記憶に残る体験を作る。

6. **関連コンテンツは2〜3件に絞り、縦並びカード形式で表示**
   選択肢を絞ることで決定回避を防ぎ、クリック率を高める。

### 優先度低：中長期的な改善

7. **段階的開示アニメーションの導入**
   結果を即座に表示するのではなく、2〜3秒の「分析演出」を入れてドーパミン的な期待感を高める。

8. **ソーシャルプルーフの活用**
   「○○人がこの結果でした」「全体の〇%がこのタイプ」等の相対情報を表示し、結果への共感と好奇心を高める。

---

## 参考文献・情報源

- [How to make custom quiz result landing pages | Interact Blog](https://www.tryinteract.com/blog/quiz-result-landing-pages/)
- [Quiz Result Page Design Ideas | Visual Quiz Builder](https://www.visualquizbuilder.com/post/quiz-result-page-design)
- [How to Create a Quiz Results Page (With Examples) | OpinionStage](https://www.opinionstage.com/blog/quiz-results-page/)
- [How to Create Attractive Quiz Result Page Design | QSM](https://quizandsurveymaster.com/create-attractive-quiz-result-page-design/)
- [The Psychology of Viral Quizzes | Forever Break](https://foreverbreak.com/guest/psychology-viral-quizzes/)
- [Why People Share: The Psychology Behind "Going Viral" | NFX](https://www.nfx.com/post/why-people-share)
- [The psychology behind quizzes | Riddle](https://www.riddle.com/blog/use-cases/data-collection/why-people-love-to-take-online-quizzes/)
- [Scrolling and Attention | NN/G](https://www.nngroup.com/articles/scrolling-and-attention/)
- [Mastering above the fold | CXL](https://cxl.com/blog/above-the-fold/)
- [Designing for Dopamine | Tribu Digital](https://www.wearetribu.com/blog/designing-for-dopamine-how-to-spark-website-engagement)
- [Progressive disclosure in UX design | LogRocket](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/)
- [Viral quiz marketing | FasterCapital](https://fastercapital.com/content/Viral-quiz-marketing--How-to-create-and-share-quizzes-that-generate-leads-and-engagement.html)
- [診断コンテンツはユーザーに好まれる？ | LISKUL](https://liskul.com/diagnosis-15600)
- [プロが解説！業界別の診断コンテンツ人気事例36選 | ヨミトル](https://shindancloud.com/trend/624)
- [How to Create Viral Quizzes | QSM](https://quizandsurveymaster.com/create-viral-quizzes-key-features-trends/)
- [Viral Loops: A Beginner's Guide | Viral Loops](https://viral-loops.com/blog/guide-to-viral-loops/)
