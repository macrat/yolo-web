---
title: 技術ブログの記事分類方法ベストプラクティス調査（50〜100記事規模）
date: 2026-03-27
purpose: yolos.net（52記事）の記事分類改善のための情報アーキテクチャ設計指針を収集する。カテゴリ・シリーズ・タグの3軸構成の是非を評価し、最適な分類設計を導出する。
method: |
  - "technical blog content classification best practices categories tags taxonomy information architecture"
  - "blog post categorization vs tagging flat taxonomy vs hierarchical taxonomy best practices"
  - "technical blog SEO category page vs tag page indexing strategy canonical URL"
  - "information architecture card sorting faceted classification blog content organization user mental model"
  - "developer blog best classification examples Hashnode dev.to Medium tag category strategy"
  - "blog taxonomy mistakes too many tags category overlap series vs category technical blog problems"
  - martinfowler.com/tags/ の直接閲覧（約900記事・デュアルタクソノミー構成の実例）
  - simonwillison.net の直接閲覧（タグ単軸構成の実例）
  - overreacted.io の直接閲覧（完全フラット・無分類構成の実例）
  - vercel.com/blog の直接閲覧（カテゴリ単軸の企業ブログ実例）
  - blog.cloudflare.com の直接閲覧（タグ多軸・大規模ブログ実例）
  - stripe.com/blog/engineering の直接閲覧（単一カテゴリ・時系列の企業ブログ実例）
sources: |
  - https://www.nngroup.com/articles/taxonomy-101/
  - https://kontent.ai/blog/from-chaos-to-clarity-best-practices-for-content-taxonomy/
  - https://wpvip.com/blog/content-taxonomy-setup/
  - https://www.wpbeginner.com/beginners-guide/categories-vs-tags-seo-best-practices-which-one-is-better/
  - https://www.adnovum.com/blog/a-guide-through-differences-in-taxonomy-and-ia
  - https://seranking.com/blog/seo-taxonomy/
  - https://crocoblock.com/blog/difference-between-taxonomies-categories-and-tags/
  - https://digwp.com/2023/04/taxonomies-categories-tags/
  - https://www.searchenginejournal.com/noindex-category-archive-pages/374867/
  - https://tophatrank.com/blog/crawling-exclude-low-value-pages/
  - https://hartandvine.com/insights/best-practices-for-categories-tags/
  - https://www.toptal.com/designers/ia/card-sorting
  - https://www.nngroup.com/articles/card-sorting-definition/
  - https://ahrefs.com/blog/faceted-navigation/
  - https://searchengineland.com/guide/faceted-navigation
---

# 技術ブログの記事分類方法ベストプラクティス調査

## 調査概要

yolos.net（52記事、AIエージェント・オーケストレーションがメイントピックの技術ブログ）の現状分類を評価し、50〜100記事規模の技術ブログにおける最適な情報アーキテクチャを調査した。

### yolos.netの現状

- カテゴリ5種: technical(19), ai-ops(11), release(9), guide(9), behind-the-scenes(4)
- シリーズ4種: building-yolos(30), ai-agent-ops(11), japanese-culture(4), tool-guides(1)、series: null(4)
- タグ約35種（日本語）: Web開発(25), 設計パターン(16), SEO(11), Next.js(11), 新機能(9), TypeScript(8)... 各記事3〜5個

---

## 1. 分類の軸の種類と使い分け

### 1.1 各分類軸の定義と役割

情報アーキテクチャにおける分類軸は目的によって明確に異なる。

**カテゴリ（Category）**

- サイトの「目次」に相当する。記事の主要テーマを表す排他的・階層的な分類。
- 特徴: 1記事1カテゴリが原則、階層（親子関係）が可能、必須分類。
- 役割: サイト全体の構造を訪問者に伝える。検索エンジンがサイトの主要トピックを理解するための信号。
- 例: "technical", "guide", "release"

**タグ（Tag）**

- 記事の「索引」に相当する。具体的な話題や属性を示す非階層的ラベル。
- 特徴: 1記事複数タグ可、フラット（親子なし）、オプション分類。
- 役割: カテゴリをまたいだ横断的な記事発見を可能にする。特定のキーワードで検索するユーザーの期待に応える。
- 例: "Next.js", "TypeScript", "SEO"

**シリーズ（Series）**

- 連続した記事群をまとめる「シーケンス」。順序付きの関係性を持つ。
- 特徴: 記事間のナビゲーション（前後の記事リンク）を提供、カテゴリやタグとは独立した軸。
- 役割: 読者が連続コンテンツを順番に読み進めるための補助。
- 例: "building-yolos"シリーズの第1回〜第30回

**トピック（Topic）**

- カテゴリとタグの中間的概念で、主要なテーマクラスターを表す。一部のプラットフォームではカテゴリの別名として使われる。

### 1.2 単一軸 vs 多軸 vs フラット

| 方式                              | 特徴                         | 向いている規模・状況                                                           |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| **フラット（タグのみ）**          | 全タグが同階層、柔軟性高い   | 記事数が少ない（〜30記事）、または記事が多岐にわたりカテゴリが定義しにくい場合 |
| **単一軸（カテゴリのみ）**        | シンプル、維持管理が楽       | 10〜50記事、テーマが明確に絞られている場合                                     |
| **2軸（カテゴリ+タグ）**          | カテゴリで大分類、タグで詳細 | 50〜200記事、最も一般的なベストプラクティス                                    |
| **3軸（カテゴリ+タグ+シリーズ）** | 柔軟だが複雑性増加           | 100記事以上でシリーズが充実している場合のみ正当化される                        |

Nielsen Norman Groupの調査では、情報アーキテクチャには「ナビゲーション」「サイト構造（IA）」「タクソノミー」は別個の目的を持ち混同してはならないと指摘している。

フラットタクソノミーは20〜30カテゴリ程度が限界で、それ以上になると「意思決定疲れ（decision fatigue）」を引き起こす。一方、ヒエラルキカル構造は大規模サイトには適するが、記事数が少ない場合は過剰設計になる。

### 1.3 カテゴリとシリーズの共存問題

**カテゴリとシリーズを別軸として持つことの問題点:**

現在のyolos.netでは building-yolos シリーズが30記事（全体の58%）、ai-agent-opsシリーズが11記事（21%）を占めている。一方、カテゴリのtechnicalが19記事（37%）で最大。

ここに構造的な重複問題が発生している:

1. **概念の重複**: "ai-agent-ops"（シリーズ）と"ai-ops"（カテゴリ）は類似概念であり、訪問者に混乱をもたらす可能性がある。
2. **ナビゲーションの複雑化**: 分類軸が3つある（カテゴリ・シリーズ・タグ）と、訪問者がどの軸で探せばよいか分からなくなる。
3. **シリーズとカテゴリの役割差異**: シリーズは「読み進める順序」を提供するもの。カテゴリは「主題による分類」を提供するもの。これらは独立した概念であり共存可能だが、ユーザーインターフェースでの表現が難しい。

SEO観点では、WordPressの経験則として「同じ言葉をカテゴリとシリーズ（カスタムタクソノミー）の両方に使うことは、URLの重複と検索エンジンの混乱を招くため避けるべき」とされている。

**推奨パターン:**
シリーズは「記事間ナビゲーション機能」として位置づけ、分類軸としてではなくコンテンツ内のUI要素（前後リンク、シリーズ目次）として扱う方が整合性が高い。

### 1.4 「1記事1カテゴリ」と「1記事複数タグ」パターン

これは現在、最も普及したベストプラクティスとして複数の権威ある情報源が一致して推奨している。

- **1記事1カテゴリ**: カテゴリアーカイブページの重複コンテンツ問題を防ぐ。記事のURLにカテゴリを含める場合（/blog/technical/article-title）に特に重要。
- **1記事複数タグ（3〜5個推奨）**: タグは横断的な関連付けのため複数可。ただし10個以上は「スパム的」とみなされる。

---

## 2. 記事数別の推奨分類方法

### 2.1 記事数とスケール別推奨

**10記事以下: 分類なし、またはシンプルなタグのみ**
Dan Abramov の overreacted.io がこの典型例。全50記事でカテゴリなし、タグなし、完全な時系列フラット表示。著者のブランドと記事タイトルのみで発見可能にしている。

この規模ではカテゴリを作ってもコンテンツが薄すぎてSEO効果が薄く、維持管理コストの方が高い。

**10〜50記事: 3〜5カテゴリ + タグ（オプション）**

- カテゴリ数: 3〜5が適切。各カテゴリに平均5記事以上を確保できる数に設計する。
- カテゴリ1つに記事が1〜2本しかない場合は、そのカテゴリを廃止し別カテゴリに吸収するか、より広いカテゴリに再定義する。
- タグはこの段階では任意。導入するなら一貫したコントロールドボキャブラリーを最初から設定する。

**50〜100記事（yolos.netの現状規模）: 5〜7カテゴリ + コントロールドタグ（20〜30種）**

これが今回の主要な調査対象規模。推奨構成:

- カテゴリ: 5〜7個（各カテゴリに7〜15記事が理想）
- タグ: 20〜35種（コントロールドボキャブラリーで管理）
- シリーズ: カテゴリとは独立した「ナビゲーション機能」として扱う

**100記事以上: 5〜10カテゴリ + サブカテゴリ（必要に応じて）+ タグ**

Martin Fowler のブログ（913記事）は2層構造を採用: 主要トピック約13カテゴリ + 60以上のタグ。これが大規模コンテンツの典型的な解。ただし大半の個人ブログにはオーバーエンジニアリング。

### 2.2 記事数の増加に伴う進化パターン

分類は一度決めたら固定ではなく、コンテンツの増加に応じて進化させる必要がある。

**フェーズ1（〜30記事）: シンプル設計**

- 広いカテゴリ3〜4個から開始
- タグは後付けでもリカバリ可能な規模

**フェーズ2（30〜80記事）: 分化**

- 1カテゴリに記事が15本以上溜まったらサブカテゴリ検討
- または新カテゴリへの分割（既存記事の再分類が必要）

**フェーズ3（80〜200記事）: 安定化**

- カテゴリ構造を固定し、安易な変更を避ける（URL変更がSEOに悪影響）
- タグの棚卸し: 2記事以下のタグは廃止または統合

---

## 3. 技術ブログの実例調査

### 3.1 Martin Fowler のブログ（martinfowler.com）

- **規模**: 913記事、30年分（1996〜2026）
- **分類方式**: デュアルタクソノミー（主要カテゴリ約13 + 詳細タグ60以上）
- **特徴**: 主要トピック（Architecture, Refactoring, Agile, Delivery, Microservices, Data, Testing, DSL）で大枠を定義し、詳細タグで横断的に関連付け。
- **学び**: 大規模コンテンツには階層型が有効。ただしこれほど多くのタグを管理できるのは専任著者・30年の蓄積があるからこそ。

### 3.2 Simon Willison のブログ（simonwillison.net）

- **規模**: 2002〜2026の長期蓄積（数千エントリ）
- **分類方式**: タグ単軸（数百種類のタグ）、コンテンツタイプ分類（Entries/Links/Quotes/Notes）
- **特徴**: タグ索引ページが充実しており、任意のタグでフィルタリング可能。AIエージェント・LLMカテゴリも充実。
- **学び**: タグの充実さと索引の整備があれば単軸でも十分機能する。ただし個人ブログとしては管理コストが高い。

### 3.3 Dan Abramov の overreacted（overreacted.io）

- **規模**: 約50記事
- **分類方式**: なし（完全フラット、時系列のみ）
- **特徴**: カテゴリなし、タグなし。記事タイトルの質と著者ブランドで発見可能性を担保。
- **学び**: 記事数が少なく著者ブランドが確立している場合、分類なしが最もシンプルで維持コストゼロ。ただし訪問者の「探索」行動は制限される。

### 3.4 Cloudflare Blog（blog.cloudflare.com）

- **規模**: 173ページ以上の大量記事
- **分類方式**: タグ多軸（AI, Developers, Security, Product News, Performance, Zero Trust など20種以上）
- **特徴**: カテゴリページをURLで提供（/tag/ai/ など）、複数タグ付けが基本。
- **学び**: 大企業ブログはタグで多角的に分類し、各タグアーカイブページをSEO資産として活用。

### 3.5 Vercel Engineering Blog（vercel.com/blog）

- **規模**: 数百記事
- **分類方式**: カテゴリ単軸（Engineering, Community, Company News, Customers, Security, Changelog, Press, v0）
- **特徴**: 明確なカテゴリ8個、各記事は1カテゴリのみ。シンプルで迷いのない構造。
- **学び**: カテゴリが明確に役割分担されていれば少数で十分。タグなしでも機能する。

### 3.6 Stripe Engineering Blog（stripe.com/blog/engineering）

- **規模**: 数百記事
- **分類方式**: カテゴリ単軸（"Engineering"という単一カテゴリ）、記事間の分類はなし
- **特徴**: 技術ブログとして1つのカテゴリで統一。時系列ブラウズが中心。
- **学び**: 単一テーマに絞った専門ブログは1カテゴリで十分。無理に細分化する必要なし。

### 3.7 Zenn / Qiita（日本の技術プラットフォーム）

- **Zenn**: type（tech/idea）という2分類のみ + 任意のトピックタグ
- **Qiita**: タグ完全自由形式（ユーザーが任意のタグを付ける）
- **学び**: 日本の技術者コミュニティはタグ主体を好む傾向。カテゴリよりもタグで探す行動パターンが一般的。

### 3.8 Shopify Engineering Blog

- **分類方式**: トピック別カテゴリ（development, security, infrastructure, mobile, data, culture, data-science-engineering）
- **学び**: 組織の技術スタックやチーム構成に対応したカテゴリ設計。企業ブログとして機能的。

---

## 4. 情報アーキテクチャの原則

### 4.1 カード・ソーティングの知見

カード・ソーティングはUXリサーチの手法で、ユーザーにコンテンツカードを実際にグループ化させることで、ユーザーのメンタルモデルを明らかにする。

技術ブログへの適用では:

- **オープンカード・ソーティング**: 訪問者が自然に作るグループ名 = 最適なカテゴリ名の候補
- **クローズドカード・ソーティング**: 既存のカテゴリ構造を検証する
- 30〜50枚のカードが適切（過多はユーザー疲弊の原因）

現状のyolos.netには明示的なユーザー調査は行われていないが、Google Analyticsのページ別トラフィックは「ユーザーが何を探しているか」の代替指標になる。

### 4.2 ファセット分類の理論

ファセット分類（Faceted Classification）は複数の独立した分類軸をユーザーが自由に組み合わせて絞り込める仕組み。

- **ファセットの例**: カテゴリ（topic軸）× シリーズ（series軸）× タグ（attribute軸）× 公開日（time軸）
- **重要な原則**: 各ファセットは独立した次元でなければならない。「カテゴリ」と「シリーズ」が概念的に重複している場合、ファセット分類として機能しない。

ただし、50〜100記事規模でファセット分類を導入することは過剰設計になりやすい。SEO観点では、全ファセットの組み合わせページを生成すると大量の薄いコンテンツページができるため、インデックス管理が複雑化する。

### 4.3 ユーザーのメンタルモデルとの整合性

**技術ブログ訪問者の典型的な行動パターン:**

1. **特定の問題解決型**: 検索エンジン経由で直接記事に到達 → 分類よりも記事の質が重要
2. **学習・探索型**: ブログ全体を巡回して体系的に学ぶ → カテゴリとシリーズのナビゲーションが有効
3. **著者フォロー型**: 著者の新着記事を追う → 時系列が最重要
4. **特定技術調査型**: "Next.js"タグなど特定タグで絞り込む → タグが有効

yolos.netのターゲット（AIエージェント・技術者）は主にパターン1（検索）とパターン2（学習）が中心と考えられる。

### 4.4 分類の粒度の最適化

**粗すぎる分類の問題:**

- 1カテゴリに30記事が入り込み、実質「未分類」と同じになる
- building-yolos(30記事)の状態がこれに該当する可能性

**細かすぎる分類の問題:**

- カテゴリに1〜2記事しかなく「薄いコンテンツ」扱いになる
- 訪問者が自分の興味に合ったカテゴリを見つけにくくなる

**最適な粒度の目安:**

- カテゴリごとに最低5記事、理想は8〜15記事
- タグは最低3記事以上使用されているもののみ維持（2記事以下は統合または廃止）

---

## 5. SEO観点での分類

### 5.1 カテゴリページ vs タグページのインデックス戦略

**基本原則**: アーカイブページ（カテゴリ・タグ一覧）は、そのページ自体がSEO価値を持つ場合のみインデックスする。

**カテゴリページをインデックスすべき条件:**

- そのカテゴリページに固有の説明文（50〜150語以上）がある
- 5記事以上が含まれている
- 特定の検索クエリでランクインが期待できる（例: "AIエージェント入門"）
- ユーザーが直接そのページに価値を感じる

**タグページのインデックス戦略:**

- 記事が2本以下のタグページはnoindexが推奨（薄いコンテンツ問題）
- 記事が5本以上あり固有説明文があるタグはインデックス可
- 多数のタグページをインデックスすることはクロールバジェットの無駄になりうる
- 一般的に、タグページよりカテゴリページの方がSEO価値が高い

SEJ（Search Engine Journal）の推奨: 「カテゴリが5記事未満の場合、noindexを自動適用する」

### 5.2 Canonical URLの設定

1記事が複数のカテゴリ（またはカテゴリとシリーズ）から参照される場合:

- 記事URL自体はカテゴリを含まないフラット設計（/blog/article-title）が最も安全
- カテゴリをURLに含む場合（/blog/technical/article-title）は1カテゴリのみ割り当てを徹底
- 全記事ページに自己参照canonical tagを設置する

重複コンテンツリスク:

- タグとカテゴリに同じ語を使うと、/category/nextjs/ と /tag/nextjs/ が重複URLになる
- カテゴリ名とタグ名は重複させない

### 5.3 分類がSEOに与える影響のまとめ

良い影響:

- カテゴリページが特定検索クエリのランディングページとして機能する
- 内部リンク強化（同一カテゴリ記事間のリンク）
- サイト構造の明確化によるクロール効率向上

悪い影響（やり過ぎた場合）:

- 大量のタグアーカイブページが薄いコンテンツとして評価される
- カテゴリとシリーズの重複URLによるキーワードカニバリゼーション
- タグ過多によるページ権威の分散

---

## 6. よくある失敗パターン

### 6.1 カテゴリとシリーズの概念的重複

**失敗例（yolos.netの状況に類似）:**

- カテゴリ "ai-ops" とシリーズ "ai-agent-ops" が共存
- 訪問者視点: 「このブログにはai-opsとai-agent-opsという2つの分類があるが、何が違うのか？」

**対処法**: シリーズは「コンテンツ間の順序ナビゲーション」に特化させ、トピック分類としてはカテゴリを使う。シリーズ名とカテゴリ名のスコープを明確に分離する。

### 6.2 タグの乱立（タグ過多）

**失敗例:**

- 35種類のタグがあるが、そのうち1〜2記事にしか使われていないタグが多数存在
- "RSS"(2記事), "JSON"(1記事), "SNS"(1記事), "信頼レベル"(1記事) などが該当

**問題**: 使用頻度の低いタグはアーカイブページとしての価値がなく、タグ一覧が長くなり訪問者にとって意味のないノイズになる。

**対処法**: 3記事以上で使用されているタグのみを「公式タグ」として維持。2記事以下のタグは廃止（または記事の内部メタデータとしてUI非表示にする）。

### 6.3 分類が実態と合わなくなる問題

**失敗例:**

- "release"カテゴリがあるが、yolos.netは通常のソフトウェアプロダクトではないため、訪問者にとって「何のリリースなのか」が不明確
- "behind-the-scenes"（4記事）が少なすぎてカテゴリとして機能していない

**対処法**: 四半期ごとにカテゴリの記事数と訪問者ニーズを確認し、記事が少ないカテゴリを統合または廃止する。

### 6.4 訪問者にとって意味のない分類

**内部向け分類の失敗:**

- "behind-the-scenes"は著者（開発者）の視点からの分類であり、訪問者目線では「開発日記」「制作過程」などの方が伝わりやすい
- 分類名が英語で日本語記事を分類している場合、日本語ユーザーへの直感的な伝達が弱い

**対処法**: 分類名はユーザーが「見てみたい」と思える名前にする。内部の運用分類（AI生成 vs 手書きなど）は訪問者に見せないメタデータとして管理する。

### 6.5 シリーズの膨張問題

**失敗例（yolos.netの状況）:**

- building-yolosシリーズが30記事（全体の58%）を占め、事実上「このブログのほぼ全部」になっている
- シリーズが単なる「カテゴリの代替」として使われており、シリーズ本来の「順序付きナビゲーション」としての価値が薄れている

**問題**: 1つのシリーズに30記事があっても、訪問者は第1回から読もうとは限らない。最新記事が最初に表示される通常のブログ表示と、連番で読む「シリーズ」の体験設計が矛盾する。

**対処法**: シリーズは3〜10記事程度の明確な「連続コンテンツ」にのみ使用する。

---

## 7. 50〜100記事規模の技術ブログへの推奨事項

### 7.1 推奨構成モデル

**モデルA: カテゴリ+タグの2軸（標準推奨）**

```
カテゴリ: 5〜7個
  - 各カテゴリに 7〜15記事
  - 年に1回以下の見直し
  - 1記事1カテゴリ厳守
タグ: 15〜25種
  - コントロールドボキャブラリー（事前定義済みリスト）
  - 1記事3〜5タグ
  - 3記事以上使用のタグのみ維持
シリーズ: カテゴリとは完全分離したナビゲーション機能
  - UIとしての前後リンク・目次
  - 独立したアーカイブページは作らない（または慎重に）
```

**モデルB: タグ単軸（シンプル志向）**

```
タグのみ: 20〜40種
  - 技術タグ（Next.js, TypeScript等）
  - トピックタグ（AIエージェント, 設計パターン等）
  - コンテンツタイプタグ（チュートリアル, リリースノート等）
カテゴリなし
シリーズ: 記事内ナビゲーションとして維持可能
```

### 7.2 yolos.netへの具体的提案

現状分析に基づく推奨:

**問題点1: カテゴリとシリーズの重複**

- ai-ops（カテゴリ）と ai-agent-ops（シリーズ）の概念重複を解消する
- シリーズは記事間ナビゲーション機能のみに特化させ、カテゴリとは独立した概念として運用

**問題点2: building-yolosシリーズの膨張（30記事=58%）**

- 30記事の中身は「技術解説」「リリース告知」「振り返り」など複数の性質を持つはず
- カテゴリで適切に再分類し、シリーズ属性はそれに加えて付与する形にする

**問題点3: タグの乱立（35種、使用1〜2回のタグ多数）**

- 3記事以上使用のタグのみ維持（現状では約15〜20種に絞り込める）
- タグを日本語・英語混在から統一する（日本語に統一するか英語に統一するか）

**問題点4: カテゴリ名が訪問者向けではない**

- "behind-the-scenes"（4記事）は訪問者にとって意味が分かりにくい
- "release"（9記事）はどのプロダクトのリリースかが不明確
- 訪問者視点での命名を検討する

**推奨カテゴリ再設計の方向性（例）:**

現在 → 再設計案（参考）

- technical（19） → 「技術解説」または維持
- ai-ops（11） → 「AIエージェント」へ名称変更
- guide（9） → 「使い方ガイド」または維持
- release（9） → 「新機能・更新情報」
- behind-the-scenes（4）→ 「制作の舞台裏」または「technical」に統合

**シリーズの再定義:**

- building-yolos: 実際に連番で読む価値がある記事のみを対象に絞り込む（全30を維持する必要はない）
- ai-agent-ops: 入門〜応用の順序で読むシリーズとして強化
- 各シリーズページをSEO的に価値ある「ランディングページ」として整備

**タグの整理（3記事未満を廃止・統合）:**

維持候補: Web開発、設計パターン、SEO、Next.js、TypeScript、AIエージェント、ワークフロー、ゲーム、日本語、UI改善、新機能、ClaudeCode、パフォーマンス

廃止・統合候補: RSS(2), JSON(1), SNS(1), 信頼レベル(1), アクセシビリティ(1), データ変換(1)

### 7.3 SEO推奨設定

1. **カテゴリアーカイブページ**: インデックス可（各ページに固有説明文150語以上追加推奨）
2. **タグアーカイブページ**: 5記事以上のタグはインデックス可、3〜4記事はケースバイケース、2記事以下はnoindex推奨
3. **シリーズアーカイブページ**: インデックス可（ただし独自コンテンツ追加が条件）
4. **canonical設定**: 全記事に自己参照canonical、カテゴリ名とタグ名の重複は避ける

### 7.4 将来の拡張時の注意点

記事数が100を超える時点での次のステップ:

- 人気カテゴリ（50記事以上）はサブカテゴリ検討
- タグの棚卸しを定期化（半年ごと）
- カテゴリページへのキュレーションコンテンツ追加（関連記事精選、カテゴリ解説）

---

## 8. まとめ

### 核心的な知見

1. **2軸（カテゴリ+タグ）が50〜100記事規模のベストプラクティス。3軸（カテゴリ+シリーズ+タグ）は適切に役割分担しないと訪問者を混乱させる。**

2. **カテゴリは5〜7個が認知的に適切な上限。各カテゴリに最低5記事、理想は8〜15記事を確保する。**

3. **シリーズはカテゴリの代替ではなく、記事間ナビゲーション機能として位置づけるべき。UIとしての前後リンクと目次に特化させ、独立した分類軸として機能させないのが整理しやすい。**

4. **タグは「コントロールドボキャブラリー」として事前定義し、3記事未満のタグは定期的に廃止・統合する。タグ過多はノイズになる。**

5. **SEO観点では、カテゴリページはインデックス対象として育て、タグページは記事数が少ない場合noindexを適用する戦略が有効。**

6. **最もよくある失敗は「分類が内部都合に基づいており訪問者のメンタルモデルと合っていない」こと。カード・ソーティング的な発想（訪問者が何を探すか）から設計を見直すことが重要。**

---

## 参考資料

- [Taxonomy 101: Definition, Best Practices, and How It Complements Other IA Work - NN/G](https://www.nngroup.com/articles/taxonomy-101/)
- [Content taxonomy: Best practices and tips | Kontent.ai](https://kontent.ai/blog/from-chaos-to-clarity-best-practices-for-content-taxonomy/)
- [Set Up An Effective Content Taxonomy | WordPress VIP](https://wpvip.com/blog/content-taxonomy-setup/)
- [Categories vs Tags - SEO Best Practices | WPBeginner](https://www.wpbeginner.com/beginners-guide/categories-vs-tags-seo-best-practices-which-one-is-better/)
- [Categories or Tagging? Differences in Taxonomy and IA | Adnovum](https://www.adnovum.com/blog/a-guide-through-differences-in-taxonomy-and-ia)
- [How To Set Up SEO Taxonomy | SE Ranking](https://seranking.com/blog/seo-taxonomy/)
- [Using Taxonomies, Categories, and Tags for Better Content Navigation | Crocoblock](https://crocoblock.com/blog/difference-between-taxonomies-categories-and-tags/)
- [The Difference Between Taxonomies, Categories, and Tags | Digging Into WordPress](https://digwp.com/2023/04/taxonomies-categories-tags/)
- [Should You Noindex Category & Archive Pages? | Search Engine Journal](https://www.searchenginejournal.com/noindex-category-archive-pages/374867/)
- [Best practices for categories & tags | Hart & Vine](https://hartandvine.com/insights/best-practices-for-categories-tags/)
- [Card Sorting: Better Information Architecture | Toptal](https://www.toptal.com/designers/ia/card-sorting)
- [Card Sorting Definition | NN/G](https://www.nngroup.com/articles/card-sorting-definition/)
- [Faceted Navigation: Definition, Examples & SEO Best Practices | Ahrefs](https://ahrefs.com/blog/faceted-navigation/)
- [Faceted Navigation in SEO: Best Practices | Search Engine Land](https://searchengineland.com/guide/faceted-navigation)
