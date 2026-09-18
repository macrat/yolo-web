# Web サイト「コンセプト策定」段階で定義すべきとされる要素 — 調査報告

調査日: 2026-09-18 / 調査者: research サブエージェント
対象: 一般論としての「Web サイトのコンセプト策定で定義するとよいとされる要素」。特定サイトへの当てはめ・提言は含まない。

## 0. 出典の格付け（本報告の凡例）

| 記号     | 種別                                                                      | 本調査での該当                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[P]**  | 一次情報（書籍本文・著者本人の公式サイト/公式配布物・公的機関文書・規格） | Garrett『The Elements of User Experience』抜粋 PDF、Roman Pichler 公式テンプレート/公式ブログ、Strategyzer 公式、Basecamp『Shape Up』本文、デジタル庁ガイドライン案 PDF |
| **[P-]** | 一次情報だが本文未確認（書誌情報のみ確認）                                | Abell (1980)、Moore『Crossing the Chasm』、細田高広『コンセプトの教科書』、ISO 9241-210、Gothelf & Seiden『Lean UX』                                                    |
| **[S]**  | 二次情報（制作会社ブログ・個人ブログ・まとめ記事）                        | 日本語圏の Web 制作会社ブログ群、英語圏のマーケ系まとめ記事                                                                                                             |

**重要な前提**: 本テーマは SEO 目的の量産記事が非常に多い領域である。特に「日本語圏の Web 制作実務」については、**制作会社ブログ（[S]）以外の出典がほとんど見つからなかった**。日本語圏で書籍・公的機関・学術の一次情報として「サイトコンセプトの定義項目リスト」を示すものは、本調査の範囲では確認できなかった。

---

## A. 何を定義するとされているか

### A-1. 出典ごとの項目セット（対応表）

#### [P] Jesse James Garrett『The Elements of User Experience』（New Riders, 2002 / 2nd ed. 2010）

著者公式サイト jjg.net で配布されている第2章本文 PDF と目次 PDF を取得・全文抽出して確認した。

第2章本文（原文）より、Strategy Plane（戦略段階）に置かれる要素は 2 つ:

- **User needs（ユーザーニーズ）** — 「the goals for the site that come from outside our organization—specifically from the people who will use our site」。答える問い: _サイトの外部（利用者）が、このサイトから何を得たいのか_
- **Site objectives（サイトの目的）** — 「our own objectives for the site. These site objectives can be business goals ("Make $1 million in sales over the Web this year") or other kinds of goals ("Inform voters about the candidates in the next election")」。答える問い: _運営側はこのサイトから何を得たいのか_

目次 PDF（第1版）より、第3章「The Strategy Plane: Site Objectives and User Needs」の内部構成は以下:

```
Defining the Strategy
Site Objectives
  Business Goals
  Brand Identity
  Success Metrics
User Needs
  User Segmentation
  Usability and User Research
Team Roles and Process
```

したがって Garrett が戦略段階で定義するとしている項目は:
**① ビジネスゴール ② ブランドアイデンティティ ③ 成功指標（Success Metrics） ④ ユーザーニーズ ⑤ ユーザーセグメンテーション**。

- 出典 URL: http://www.jjg.net/elements/pdf/elements_ch02.pdf , http://www.jjg.net/elements/pdf/elements_toc.pdf （2026-09-18 取得・全文抽出済み）
- 第2版では章題が "Product Objectives and User Needs" に変更されている（O'Reilly の書誌ページのタイトルで確認: https://www.oreilly.com/library/view/the-elements-of/9780321688651/ch03.html , 2026-09-18 確認）
- **注**: Brand Identity / Success Metrics の各節の本文は第3章であり、無料配布されているのは第2章のみ。**本文の記述内容は未確認**（目次による項目名の確認のみ）。

Garrett のモデルは「戦略段階に含めないもの」も明確である。機能仕様・コンテンツ要件（Scope）、インタラクション設計・IA（Structure）、UI/ナビゲーション/情報デザイン（Skeleton）、ビジュアルデザイン（Surface）は、戦略の**上位の層**に置かれ、戦略段階の成果物ではない。これは C の論点に直結する（後述）。

#### [P] Roman Pichler「Product Vision Board」（公式テンプレート v01/2023 + チェックリスト © 2024）

romanpichler.com 公式配布 PDF を取得・全文抽出して確認した。5 区画と、各区画に書かれている問いは以下（PDF 原文）:

| 区画               | 原文の問い                                                                                                                                            | 答える問い（要約）                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **VISION**         | "What is the reason for creating the product? What positive change should it create?"                                                                 | なぜ作るのか／どんな良い変化を起こすのか |
| **TARGET GROUP**   | "Which market or market segment does the product address? Who are the target customers and users?"                                                    | 誰のためか                               |
| **NEEDS**          | "What problem does the product solve or which benefit does it offer? If you identify several needs, prioritise them..."                               | どんな課題を解くのか／何の便益か         |
| **PRODUCT**        | "What product is it? What are its three to five stand-out features that set it apart from competing offering? Is it feasible to develop the product?" | 何であるか／何が競合と違うか／実現可能か |
| **BUSINESS GOALS** | "How will the product benefit the company that develops and provides it? What are the desired business benefits?"                                     | 作り手側は何を得るのか                   |

チェックリスト（同 PDF 2ページ目）に、粒度・分量の規定がある（D 章で詳述）。

- 出典 URL: https://www.romanpichler.com/downloads/tools/Product-Vision-Board-with-Checklist.pdf （2026-09-18 取得・全文抽出済み）

#### [P] Strategyzer / Alexander Osterwalder & Yves Pigneur「Value Proposition Canvas」（書籍『Value Proposition Design』, Wiley, 2014）

公式ライブラリページで確認。2面 6ブロック:

| 面               | ブロック                | 答える問い                         |
| ---------------- | ----------------------- | ---------------------------------- |
| Customer Profile | **Jobs to be done**     | 顧客は何を成し遂げようとしているか |
| Customer Profile | **Pains**               | その途中で何が障害になるか         |
| Customer Profile | **Gains**               | どんな成果を望んでいるか           |
| Value Map        | **Products & Services** | 何を提供するか                     |
| Value Map        | **Pain Relievers**      | それが障害をどう取り除くか         |
| Value Map        | **Gain Creators**       | それが望む成果をどう生むか         |

- 出典 URL: https://www.strategyzer.com/library/the-value-proposition-canvas （2026-09-18 確認）

#### [P] デジタル庁「ウェブサイトガイドライン案」（2025年1月21日時点）

**日本の公的機関の一次文書**。PDF を取得し全文抽出して確認した。**「コンセプト」という語での項目定義は行っていない**。企画段階に相当する要求は第9章にあり、以下の 2 点のみ:

- **9.1 利用ニーズの特定** — 「適切な利用者層を特定し、対象ウェブサイトの利用ニーズを明らかにするよう努める」
- **9.1.1 利用者の特定** — 「ウェブサイトの企画時には、（中略）ウェブサイトのニーズに応じた**主利用者**を決定し、利用者中心の視点に立ったウェブサイトの提供に努める」。主利用者の候補表（一般的な利用者／報道関係者／行政機関の担当者／所管分野の事業者・関係者／研究者・専門家／調達参加事業者／こども／非日本語話者／その他）と「主ニーズの例」が掲載されている
- **9.2** 主利用者別に「提供する情報・資料の対象範囲（種類及び期間）」「提供する機能群の概要」を企画する
- **10.1〜10.3** 評価観点（アクセシビリティ準拠状況、情報設計の妥当性、ポリシーの最新性、セキュリティ、プライバシー、利用品質目標＝有効性・効率性・満足度、アクセス解析）

つまり公的文書が企画時に義務づけているのは「**主利用者の決定**」「**利用ニーズの特定**」「**提供範囲の企画**」であり、トーン&マナーや差別化要因といった項目は登場しない。

- 出典 URL: https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/f836e61e-3939-4513-8b38-261defc53874/065a37e9/20250225_policies_development_management_outline_07%20.pdf （2026-09-18 取得・全文抽出済み）
- **注**: 文書上の表記は「案」であり、改訂履歴欄は「2025 年（令和 7 年）●月●日策定」と未確定のまま。**正式版が発効済みかどうかは本調査では確認できなかった。**

#### [P-] ISO 9241-210（人間中心設計）

人間中心設計プロセスの 4 活動として「①利用状況の理解と明示（context of use）②ユーザ要求事項の明示 ③設計解の作成 ④要求事項に対する評価」を規定する、とされる。企画段階に相当するのは ①②。

- ISO 公式書誌: https://www.iso.org/standard/77520.html （2026-09-18 確認）
- **規格本文は有料であり未確認**。上記の 4 活動の記述は二次解説（https://blog.rheinwerk-computing.com/how-to-do-ux-design-a-guide-to-the-iso-9241-210-standard , 2026-09-18 確認）による。**一次確認できていない。**

#### [P] Ryan Singer『Shape Up』（Basecamp / 37signals, Web 版無料公開）

「コンセプト」ではなく「Pitch（企画）」という名称だが、企画段階の定義項目リストとして機能する。5 要素:

| 要素             | 原文                                                                                                           | 答える問い                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Problem**      | "The raw idea, a use case, or something we've seen that motivates us to work on this"                          | なぜやるのか               |
| **Appetite**     | "How much time we want to spend and how that constrains the solution"                                          | どれだけ賭けるか（＝制約） |
| **Solution**     | "The core elements we came up with, presented in a form that's easy for people to immediately understand"      | 何をやるのか               |
| **Rabbit holes** | 実装時に問題になりうる箇所の事前明示                                                                           | どこで詰まりうるか         |
| **No-gos**       | "Anything specifically excluded from the concept: functionality or use cases we intentionally aren't covering" | **何をやらないと決めたか** |

- 出典 URL: https://basecamp.com/shapeup/1.5-chapter-06 （2026-09-18 確認）
- 「No-gos」を明示項目として持つのは、本調査で見つかった枠組みの中でこれだけである。

#### [S] 日本語圏の Web 制作実務（制作会社ブログ）

日本語圏の検索結果は**圧倒的に 5W1H に収束している**。以下は全て**二次情報のみ**。

| 出典                                                                                                                  | 挙げている項目                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessible & Usable「Webサイト設計におけるコンセプトワークのコツ（5W1Hを意識する）」2006-08-05 公開 / 2011-01-11 更新 | What=サイトの目的や意義／Who=誰が利用するか（→ペルソナ）／When=いつ利用するか（時間帯・曜日・シーズン・シチュエーション）／Where=どんな環境か（接続環境・ブラウザ・解像度・場所）／Why=なぜ Web を使うか（他メディアとの比較）／How=どのように利用するか（→シナリオ） |
| WACUL「サイトのコンセプトについて解説!」2017-10-12 公開 / 2025-04-15 更新（著者: 兒島、株式会社WACUL）                | What=目的／Why=意義／Who=ユーザー像／When=利用時期／Where=閲覧場所・デバイス／How=訪問経路                                                                                                                                                                            |
| LeadGrid（株式会社GIG）「Webサイト制作におけるコンセプトとは？」2025-05-15                                            | 5W1H（What=目的／Why=ユーザーが得られる価値／Who=具体的なユーザー像／When=閲覧タイミング／Where=閲覧デバイス／How=訪問経路）＋ フレームワークとして 3C 分析・SWOT 分析・ロジックツリー                                                                                |
| ビズサイ（株式会社アクセスジャパン）「サイトコンセプトとは？」2025-05-22                                              | ①ターゲットユーザー（誰に向けるか）②Webサイトの目的（何の目的か）③最終的なゴール（何を目指すか）＋ 5W1H                                                                                                                                                               |
| ブリッジコーポレーション「Webサイトのコンセプト設計を成功させる！実践的フレームワーク5選」2025-03-25                  | サイトの目的／伝えたいメッセージ／ペルソナ／ターゲットのニーズと期待／差別化戦略。フレームワーク: ロジックツリー・3C・SWOT・STP・AIDMA                                                                                                                                |
| LIG「デザインコンセプトとは？」2025-10-31（著者: 内藤昌史）                                                           | ※サイトコンセプトではなく**デザイン**コンセプト。書体・フォント／色の使い方／ブランドの理念や個性の反映方針。最終的に「3つほどのキーワード」→さらに「1つのワード」に絞る                                                                                              |
| 株式会社GIG「コンセプト設計のやり方と手順」2023-07-05                                                                 | 手順: リサーチ → ターゲットのニーズ・課題の理解 → ユーザー向け価値提案の策定 → コンセプトキーワードの決定 → ストーリー・ビジュアル表現 → 検証                                                                                                                         |

**Accessible & Usable について**: 個人運営の実務者サイトで、運営者は HCD-Net 認定人間中心設計専門家、WAIC 翻訳作業部会主査、『Form Design Patterns』訳者と About ページに記載がある（https://accessible-usable.net/about）。制作会社の集客ブログよりは信頼度が高いが、**書籍・公的機関ではないため本報告では [S] に分類する。また、取得したページ上で著者氏名を確認できなかった。**

### A-2. 共通して挙げられている項目（出典横断）

複数系統（英語圏の一次情報と日本語圏の実務記事の双方）で繰り返し登場するのは以下の 3 つ。**これが最大公約数**である。

| 項目                            | 答える問い                                   | 挙げている出典                                                                                                                                                                                                        |
| ------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **① 目的 / 運営側のゴール**     | このサイトで運営側は何を得たいのか           | Garrett (Site Objectives / Business Goals) [P]、Pichler (Business Goals) [P]、Shape Up (Problem) [P]、5W1H 系の What/Why [S]、ビズサイ [S]、ブリッジ [S]                                                              |
| **② ターゲット / 利用者**       | 誰のためか                                   | Garrett (User Segmentation) [P]、Pichler (Target Group) [P]、Strategyzer (Customer Profile) [P]、**デジタル庁ガイドライン案 (主利用者の決定) [P]**、5W1H 系の Who [S]、Abell (Who) [P-]、Moore (target customer) [P-] |
| **③ 提供価値 / ユーザーニーズ** | 利用者は何を得るのか・どんな課題が解けるのか | Garrett (User Needs) [P]、Pichler (Needs) [P]、Strategyzer (Jobs/Pains/Gains) [P]、**デジタル庁ガイドライン案 (利用ニーズの特定) [P]**、ISO 9241-210 (利用状況・ユーザ要求事項) [P-]、5W1H 系の Why [S]               |

次点で共通性が高いもの:

| 項目                 | 答える問い                   | 挙げている出典                                                                                                                                 | 備考                                                                |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **④ 差別化要因**     | 競合・代替手段と何が違うのか | Pichler (PRODUCT の "stand-out features that set it apart") [P]、Moore (unlike...) [P-]、ブリッジ [S]、ferret One 等リニューアル要件定義系 [S] | Garrett の戦略段階には**無い**（Garrett はこれを Scope 以降で扱う） |
| **⑤ 成功指標 / KPI** | 達成したと何で判断するのか   | Garrett (Success Metrics) [P]、デジタル庁ガイドライン案（第10章の評価観点・利用品質目標）[P]、日本のリニューアル要件定義系記事の KGI/KPI [S]   |                                                                     |

### A-3. 出典ごとに固有（＝共通していない）項目

| 項目                                         | それを挙げている出典のみ                                     | コメント                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ブランドアイデンティティ**                 | Garrett (Brand Identity) [P]、ブランドプラットフォーム論 [S] | Pichler・Strategyzer・Shape Up・デジタル庁には無い                                                                                                                                                                                                                                            |
| **やらないこと（No-gos）**                   | Shape Up のみ [P]                                            | 本調査で唯一                                                                                                                                                                                                                                                                                  |
| **Appetite（投下可能な時間＝制約）**         | Shape Up のみ [P]                                            |                                                                                                                                                                                                                                                                                               |
| **ビジョン（5〜10年の大きな変化）**          | Pichler [P]、Cagan [S]                                       | Garrett の戦略段階には無い                                                                                                                                                                                                                                                                    |
| **When / Where（いつ・どんな環境で使うか）** | 日本語圏 5W1H 系のみ [S]                                     | 英語圏の一次情報（Garrett, Pichler, Strategyzer）に対応項目は**無い**。ISO 9241-210 の「利用状況（context of use）」が概念的に近いが、5W1H 系記事がそれを参照している形跡は確認できなかった                                                                                                   |
| **How（訪問経路・流入）**                    | 日本語圏 5W1H 系のみ [S]                                     | 同上。日本語圏では「How」を「どのようにサイトへ来るか（集客経路）」と解釈する記事が多い                                                                                                                                                                                                       |
| **トーン&マナー**                            | 日本語圏の制作会社ブログのみ [S]                             | **一次情報でトーン&マナーを「コンセプト」の構成要素として挙げるものは確認できなかった。** 日本語圏の記事群でも、トンマナは「コンセプトに基づいて後から決めるもの」と位置づける記述が多い（例: https://www.kwm.co.jp/blog/tone-and-manner/ , https://sevendex.com/post/28737/ , いずれも [S]） |
| **3C / SWOT / STP / AIDMA**                  | 日本語圏の制作会社ブログのみ [S]                             | これらは元々サイトコンセプトの枠組みではなく、一般的なマーケティング分析手法の転用                                                                                                                                                                                                            |

---

## B. 代表的なフレームワーク

### B-1. 5W1H 型のコンセプト整理 — **日本語圏でのみ確認。提唱者は特定できなかった**

- 日本語圏の Web 制作実務記事では事実上の標準になっている（A-1 の表を参照）。確認できた最古のものは Accessible & Usable の 2006-08-05 記事。
- **誰が提唱したものかは確認できなかった。** 5W1H 自体は報道・情報整理の一般的な枠組みであり、「Web サイトのコンセプト策定に 5W1H を使う」という定式を最初に提唱した人物・文献は本調査では特定できていない。
- **英語圏の UX / ブランド論の一次情報で、5W1H をサイトコンセプトの枠組みとして提示するものは確認できなかった。**

### B-2. 「誰に・何を・どのように」の3要素 — **Derek F. Abell の事業ドメイン定義に遡ると考えられるが、Web への適用の系譜は未確認**

- **Derek F. Abell, "Defining the Business: The Starting Point of Strategic Planning", Prentice-Hall, 1980** が、事業定義を3軸（① served customer groups＝誰に／② served customer functions＝何を／③ technologies utilized＝どのように）で行うことを提唱した。
  - 書誌: https://books.google.com/books/about/Defining_the_Business.html?id=nJMoAQAAMAAJ , https://en.wikipedia.org/wiki/Derek_F._Abell （2026-09-18 確認）
  - **[P-] 書籍本文は未確認。** 3軸の内容は上記書誌ページおよび二次解説による。
- 日本のビジネス実務で「誰に・何を・どのように」が事業ドメイン定義の定型として広く使われていることは事実だが、**それが Abell 由来であると明記した一次文献は本調査では確認できなかった**（二次解説では Abell 由来とされる）。
- **Web サイトのコンセプトにこの3要素をそのまま使う、という定式を提唱した特定の出典は確認できなかった。**

関連する定式として、以下は出典が明確:

- **Geoffrey A. Moore『Crossing the Chasm』のポジショニング・ステートメント（"elevator pitch test"）** [P-]
  「For (target customer) who (statement of the need or opportunity), our (product/service name) is (product category) that (statement of benefit). Unlike (competition), (differentiator)」
  書誌: https://en.wikipedia.org/wiki/Crossing_the_Chasm （2026-09-18 確認）。**書籍本文は未確認**。テンプレート文言は二次情報（https://the.gt/geoffrey-moore-positioning-statement/ 等）による。
- **Steve Blank の「We help (X) do (Y) by doing (Z)」** [S]
  X=ターゲット顧客、Y=可能にする成果、Z=どう独自に解決するか。Blank 本人の記事を直接確認できず、二次情報（https://louismorgner.medium.com/value-propositions-d81c01f5d60b 等, 2026-09-18 確認）のみ。**Blank 本人の一次記事は確認できなかった。**

### B-3. バリュープロポジション（Value Proposition Canvas） — **実際に使われている。出典明確 [P]**

- 提唱者: **Alexander Osterwalder と Yves Pigneur**。書籍『Value Proposition Design: How to Create Products and Services Customers Want』(Wiley, 2014, ISBN 9781118968055)。Business Model Canvas の姉妹ツール。
- 中身は A-1 の表のとおり（Jobs / Pains / Gains ↔ Products & Services / Pain Relievers / Gain Creators）。両面の「Fit（適合）」を主張ではなく**顧客による検証で確かめる**ことを求める。
- 公式が挙げる「よくある間違い」は C 章に記載。
- 出典: https://www.strategyzer.com/library/the-value-proposition-canvas , https://www.wiley.com/en-gb/Value+Proposition+Design:+How+to+Create+Products+and+Services+Customers+Want-p-9781118968055 , https://www.strategyzer.com/library/5-common-mistakes-to-avoid-when-using-the-value-proposition-canvas （いずれも 2026-09-18 確認）

**類似の一次ツールとして Roman Pichler「Product Vision Board」** [P]（A-1 参照）。Pichler 自身の著書は『Strategize』。テンプレートは CC BY-SA 4.0 で公開。

### B-4. ブランドプラットフォーム / ブランドコア — **英語圏のブランド実務では用語として流通。ただし本調査で確認できたのはエージェンシー記事のみ [S]**

- 典型的な構成要素として挙げられるのは: Purpose（存在意義）／Mission（使命）／Vision（将来像）／Core Values（価値観）／Brand Positioning（市場での位置づけ）／Brand Personality・Tone of Voice（人格と語り口）／Target Audience／Key Messaging。
- 出典: https://www.frontify.com/en/guide/brand-platforms , https://brandfolder.com/resources/brand-platform/ , https://www.parkerwhite.com/insights/14-components-of-a-brand-platform （2026-09-18 確認）— **いずれもツールベンダー/エージェンシーのコンテンツであり二次情報。**
- 学術的・書籍的な一次情報としては **David A. Aaker の Brand Vision モデル**（6 components）が言及されている（https://prophet.com/2014/03/185-it-starts-with-a-brand-vision/ , 2026-09-18 確認。Prophet は Aaker が副会長を務めた会社のため準一次）が、**本調査では Aaker の書籍本文を確認していない。**
- **「ブランドプラットフォーム」の構成要素について、単一の標準的定義は存在しない。** 出典ごとに 5〜14 項目とばらつく。

### B-5. UX 分野の成果物とコンセプトの関係

- **プロトペルソナ**: **Jeff Gothelf & Josh Seiden『Lean UX』(O'Reilly, 初版2013)** が提唱。「検証済みのリサーチ結果ではなく、チームの現時点での最善の推測であることを明示した、仮説ベースのユーザー像」であり、部門横断チームが1時間以内で共同作成する。4分割フォーマット（左上: スケッチ・名前・役割／右上: デモグラフィックと行動特性／左下: ニーズと不満／右下: 想定される解決策）。目的は「リサーチに数週間かけずにチームの認識を揃えること」。
  - 出典: https://www.senseandrespond.co/blog/proto-personas （Gothelf & Seiden 自身の会社 Sense & Respond Learning のブログ、準一次）, https://www.oreilly.com/library/view/lean-ux/9781491983690/video308618.html （2026-09-18 確認）
  - **[P-] 書籍本文は未確認。**
- **カスタマージャーニーマップ**: ペルソナを先に定め、そのペルソナが目的達成に至る過程を「行動・思考・感情」の軸で時系列可視化するもの、という順序関係が日本語圏の解説で一貫している [S]（https://blog.nijibox.jp/article/persona_customer-journey/ , https://proximo.co.jp/media/persona-customer-journey-map/ , 2026-09-18 確認）。
- **コンセプトとの関係について**: Garrett のモデルでは、ユーザーリサーチ・ペルソナは戦略段階（Strategy Plane）の**内部**に位置づけられる（第3章に "User Segmentation", "Usability and User Research" 節がある）。一方 Double Diamond（Design Council, 2004年発表）では、Discover→**Define** フェーズの出力がデザインブリーフ／問題定義であり、コンセプトはそこに相当する（https://www.designcouncil.org.uk/resources/the-double-diamond/ , 2026-09-18 確認）。
- **コンセプトダイアグラム（日本発）**: **清水誠**が2008年以降に再定式化して提唱。「顧客視点での可視化に、事業のゴール・目的・戦略・顧客がたどる道筋を含めたもの」。縦横軸に「こだわりの強さ」「危機感」「自己理解」といった**顧客視点の心理的要素**を置く点、および**作図後に KPI・指標を定義して分析・改善アクションにつなげることが主目的**である点で、カスタマージャーニーマップと区別される。
  - 出典: https://concept-diagram.com/note/about-concept-diagram/ , https://makoto-shimizu.com/news/what-is-concept-diagram/ （清水誠本人のサイト、準一次。2026-09-18 確認）
  - 書籍『コンセプトダイアグラムでわかる ［清水式］ビジュアルWeb解析』（Web Professional Books）あり。**書籍本文は未確認。**
  - **注意**: 名称に「コンセプト」を含むが、これは**サイトのコンセプト文書**ではなく**分析・KPI 設計の道具**である。混同しないこと。

---

## C. コンセプトに「書かないほうがよい」とされているもの

### C-1. 確認できた明示的な指摘

| 指摘内容                                                                                                                                                                                                                                                  | 誰の指摘か                                   | 出典                                                                                                                        | 格付け  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| **ビジョンに戦略の詳細を書かない。** ビジョンは「記憶に残るステートメントやスローガン」として捉え、ターゲット層・ニーズ・プロダクト・ビジネスゴールという戦略要素とは**区画を分ける**。ビジョンと戦略は疎結合に保ち、戦略が変わってもビジョンは安定させる | Roman Pichler                                | https://www.romanpichler.com/blog/double-vision-how-to-capture-the-product-vision/                                          | [P]     |
| **ワイヤーフレームや高精細モックで設計を過剰に規定しない。** "we don't want to over-specify the design with wireframes or high-fidelity mocks. They'll box in the designers who do the work later."                                                       | Ryan Singer (Basecamp/37signals)             | https://basecamp.com/shapeup/1.5-chapter-06                                                                                 | [P]     |
| **顧客のニーズと、プロダクトの機能を同じ欄に混ぜない。** 顧客が何を成し遂げようとしているか／何に困っているかは、自社の提供物がそれにどう応えるかとは**分けて**記述する                                                                                   | Strategyzer（公式）                          | https://www.strategyzer.com/library/5-common-mistakes-to-avoid-when-using-the-value-proposition-canvas                      | [P]     |
| **複数の顧客セグメントを1枚に混ぜない。** セグメントごとに Jobs/Pains/Gains が異なるため、どのセグメントの話か分からなくなる                                                                                                                              | Strategyzer（公式）                          | 同上                                                                                                                        | [P]     |
| **クリエイティブブリーフに「方向性を装った解決策」を書かない。** ブリーフは問題を記述し、解決はクリエイティブチームに委ねる。実行案を決め打ちして持ち込むのは、チームを置く意味を消す                                                                     | （個別の著名実務家ではなくマーケ系メディア） | https://www.simple.io/blog/biggest-mistakes-marketers-make-creative-brief , https://www.admove.ai/blog/creative-brief-guide | **[S]** |
| コンセプトに含めるべきでないもの = 複雑・難解な表現、独自性のない内容、根拠のないもの                                                                                                                                                                     | 株式会社GIG（BLOG編集部）                    | https://giginc.co.jp/blog/giglab/concept-design-approach                                                                    | **[S]** |

### C-2. 構造的に「分けて」いる例（明示的な禁止ではないが、層の分離を設計している）

- **Garrett の5層モデル** [P]: 機能仕様・コンテンツ要件は Scope、IA・インタラクション設計は Structure、ナビ/UI/情報デザインは Skeleton、ビジュアルデザイン（カラーパレット・タイポグラフィ・スタイルガイド）は Surface に置かれる。**これらは戦略段階（＝コンセプト相当）の成果物ではない**。特に「Color Palettes and Typography」「Design Comps and Style Guides」は第7章（Surface）に置かれている（目次 PDF で確認）。
- **Pichler の Product Vision Board** [P]: ビジョン（5〜10年、変えない）と戦略（3ヶ月ごとに見直す）を別区画に分離し、さらにロードマップは別ツール（GO Product Roadmap）に外出しする、と明記。
- **日本語圏でのコンセプトとトンマナの関係** [S]: 「デザインやトンマナはコンセプトに基づいて作られる」＝コンセプトが先、トンマナは派生物、という階層関係が記事群で共有されている（https://www.kwm.co.jp/blog/tone-and-manner/ 他）。ただし**「コンセプトにトンマナを書くな」と明言した出典は確認できなかった。**

### C-3. 確認できなかったこと

- **「コンセプトと運用ルールは分けるべき」という明示的な指摘は、一次・二次のいずれでも確認できなかった。**
  日本語で「コンセプト 運用ルール 分ける」に類する検索を行ったが、この論点を正面から扱った出典は見つからなかった。近いのは Pichler の「ビジョンと戦略を分ける」[P] と、日本語圏の「コンセプト → トンマナ／ガイドライン」という階層観 [S] のみである。
- **「コンセプト文書に個別施策を書くな」と明言した一次情報も確認できなかった。** Shape Up の「設計を過剰規定するな」[P] とクリエイティブブリーフ論の「解決策を書くな」[S] が最も近い。

---

## D. 分量・粒度

### D-1. 確認できた明示的な分量・粒度の規定

| 規定                                                                                                                                                                                                           | 誰の                                                                          | 出典                                                                                                                                                           | 格付け                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **ビジョンは Concise（簡潔）: "Easy to understand and remember."** ビジョンボードのチェックリスト項目の1つ。ビジョン自体は「記憶に残るステートメントやスローガン」で、公式の例示は **"HEALTHY EATING"（2語）** | Roman Pichler                                                                 | Product-Vision-Board-with-Checklist.pdf / double-vision 記事                                                                                                   | **[P]**                                                              |
| **ボード全体が A4 1枚のキャンバス**（VISION / TARGET GROUP / NEEDS / PRODUCT / BUSINESS GOALS の5区画）                                                                                                        | Roman Pichler                                                                 | 同 PDF 1ページ目                                                                                                                                               | **[P]**                                                              |
| **PRODUCT 欄の特徴は "three to five stand-out features"、かつ "Focused: There are no more than five features." / "Big: The features are big, coarse-grained product capabilities."**                           | Roman Pichler                                                                 | 同 PDF チェックリスト                                                                                                                                          | **[P]**                                                              |
| **NEEDS は "Focused: Concentrate on the main problem/benefit"**、複数ある場合は優先順位をつけて最重要を最上段に置く                                                                                            | Roman Pichler                                                                 | 同 PDF                                                                                                                                                         | **[P]**                                                              |
| **プレスリリース部分は「数段落、常に1ページ未満」。FAQ は5ページ以下。** 「ページ数や語数に賞は出ない。目的は行った作業をすべて説明することではなく、そこから蒸留された思考を共有すること」                    | Amazon「Working Backwards」PR/FAQ                                             | https://workingbackwards.com/resources/working-backwards-pr-faq/ , https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes | **[P]**（Amazon 公式 / 元幹部 Colin Bryar & Bill Carr の公式サイト） |
| **コンセプトは「3つほどのキーワード」に落とし込み、さらに「1つのワード」に厳選する**                                                                                                                           | LIG（内藤昌史）                                                               | https://liginc.co.jp/614130                                                                                                                                    | **[S]**                                                              |
| **5W1H を設定し終えたら「シンプルにまとめる」。ここで簡潔にまとめられないなら 5W1H を確認し直す必要がある**（掲載例は1〜2文）                                                                                  | WACUL                                                                         | https://wacul-ai.com/blog/site-improvement/method/website-concept/                                                                                             | **[S]**                                                              |
| **「コンセプトは、ターゲットに対して自社が提供できる価値を一言で表すもの」**                                                                                                                                   | 株式会社シフト                                                                | https://www.shift-jp.net/blog/site-renewal-concept/                                                                                                            | **[S]**                                                              |
| マーケティングコンセプトは1文にまとめるのが効果的（「3点整理法」「情報の削ぎ落し」「2単語ルール」）                                                                                                            | 細田高広『コンセプトの教科書 あたらしい価値のつくりかた』ダイヤモンド社, 2023 | https://www.diamond.co.jp/book/9784478116340.html （書誌）／内容は読書記録ブログ経由                                                                           | **[P-]**（書誌のみ確認、本文未確認。内容記述は二次情報）             |

### D-2. 「一文で言えること」「A4 一枚」という目安について

- **「一文/一言で言えること」は、日本語圏の Web 制作実務で広く語られている** [S]。ただし確認できたのは制作会社ブログのみで、**一次情報でこれを規定したものは日本語圏では確認できなかった**（細田高広の書籍が最も近いが本文未確認）。
- **「A4 一枚」という表現は、Web サイトのコンセプトに特化した目安としては確認できなかった。**
  「A4一枚企画書」は日本のビジネス文書一般の作法として多数の記事・書籍があるが（例: 日経クロステック https://xtech.nikkei.com/it/pc/article/technique/20140423/1128643/ , 2026-09-18 確認）、**サイトコンセプトの分量目安として A4 一枚を指定した出典は見つからなかった。**
  一方、英語圏には「1ページに収まるキャンバス」という形で実質的に同じ制約を課す一次情報がある（Pichler の Product Vision Board、Osterwalder の Value Proposition Canvas、Amazon の PR 1ページ規定）。これらは**分量の目安というより、キャンバス/テンプレートの物理的制約として1ページを強制する**という形をとる。
- **Marty Cagan は「1〜2文」という定型に否定的**とされる（ビジョンの伝達手段は Web ページ、ホワイトペーパー、スライド、動画など複数あってよい）。ただしこれは二次情報（https://medium.com/@tschwaiger/product-vision-f1613299eb6d , 2026-09-18 確認）による。**Cagan 本人の記事（svpg.com/vision-vs-strategy/）の本文は本調査では確認していない。**

### D-3. 粒度に関する規定

- Pichler は各欄について **Outcome-based（成果ベース）/ Specific（検証できる程度に具体的）/ Prioritised（優先順位づけ）/ Validated（仮説ではなく検証済み）** を求めている [P]。「Adaptive: 少なくとも3ヶ月に一度は見直す」という更新頻度の規定もある。
- Shape Up は「high level, but add a little more concreteness（高い抽象度を保ちつつ、少しだけ具体性を足す）」という粒度指定をしている [P]。

---

## 補足: 日本語圏と英語圏の扱いの違い（明確に分けて報告）

| 論点                               | 日本語圏の Web 制作実務                                                                                                                                                            | 英語圏の UX / プロダクト / ブランド論                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 支配的な枠組み                     | **5W1H**（ほぼ全記事が採用）[S]                                                                                                                                                    | Garrett の5層モデル [P]、Pichler の Vision Board [P]、Osterwalder の VPC [P]、Moore のポジショニング文 [P-] |
| When / Where（いつ・どこで使うか） | **必ず入る**（時間帯・デバイス・接続環境） [S]                                                                                                                                     | **対応する項目は無い**。ISO 9241-210 の「利用状況」が概念的に近いが別枠組み [P-]                            |
| How の意味                         | 「どうやってサイトに来るか（流入経路）」と解釈されることが多い [S]                                                                                                                 | 該当項目なし。Abell の3軸では How=「どの技術で satisfy するか」[P-]                                         |
| トーン&マナー                      | コンセプトの文脈で頻出。ただし「コンセプトから派生するもの」と位置づけられる [S]                                                                                                   | Garrett では Surface 層（第7章）、ブランド論では Brand Platform の一要素 [S]                                |
| 成功指標                           | KGI/KPI としてリニューアル要件定義の文脈で登場 [S]                                                                                                                                 | Garrett が Success Metrics として戦略段階に明示 [P]                                                         |
| 「やらないこと」の明示             | **確認できなかった**                                                                                                                                                               | Shape Up の No-gos [P]                                                                                      |
| 出典の質                           | **書籍・公的機関・学術の一次情報が見つからなかった**（制作会社ブログのみ）。公的文書（デジタル庁）は「コンセプト」ではなく「主利用者の決定」「利用ニーズの特定」という形で規定 [P] | 書籍・提唱者本人の公式配布物が豊富                                                                          |
| 分量の目安                         | 「一文」「一言」「1ワード」 [S]                                                                                                                                                    | 1ページのキャンバス/テンプレートによる物理的制約 [P]                                                        |

---

## 確認できなかったこと（明記）

1. **日本語圏で、書籍・公的機関・学術いずれかの一次情報が「Web サイトのコンセプト策定で定義すべき項目リスト」を示しているもの** — 見つからなかった。日本語圏の項目リストは全て制作会社/個人ブログ（二次情報）である。
2. **「Web サイトのコンセプトを 5W1H で整理する」という定式の提唱者・初出** — 特定できなかった。確認できた最古は 2006年の個人サイト記事。
3. **「誰に・何を・どのように」を Web サイトのコンセプトに適用した定式の出典** — 特定できなかった。Abell (1980) の事業ドメイン3軸に遡ると二次解説は述べるが、Web への適用の系譜は追えなかった。
4. **「コンセプトと運用ルールは分ける」という明示的な指摘** — 一次・二次とも見つからなかった。
5. **「コンセプト文書は A4 一枚」という、Web サイトのコンセプトに限定した分量目安** — 見つからなかった（ビジネス文書一般の作法としては多数あるが別物）。
6. 以下は書誌のみ確認し、**本文を確認していない**: Garrett 第3章本文、Abell (1980)、Moore『Crossing the Chasm』、細田高広『コンセプトの教科書』、Gothelf & Seiden『Lean UX』、Pichler『Strategize』、Aaker のブランドビジョン論、ISO 9241-210 規格本文、清水誠の書籍。
7. **デジタル庁「ウェブサイトガイドライン案」が正式版として発効済みか** — 取得した PDF は「案」かつ改訂履歴が「●月●日」のままであり、確認できなかった。
8. **総務省「みんなの公共サイト運用ガイドライン」（2024年版）の本文** — アクセシビリティ確保の手順書であり「基本方針策定ガイド」を含むことは確認したが、PDF 本文は未取得。コンセプト項目の規定があるかは**確認できなかった**。
9. **Steve Blank 本人による「We help X do Y by doing Z」の一次記事** — 確認できなかった。
10. **Marty Cagan 本人による vision vs strategy の記述本文** — 確認できなかった（svpg.com のページを直接読んでいない）。

---

## 出典一覧（確認日: すべて 2026-09-18）

### 一次情報 [P]

- Jesse James Garrett『The Elements of User Experience』第2章 PDF: http://www.jjg.net/elements/pdf/elements_ch02.pdf
- 同 目次 PDF: http://www.jjg.net/elements/pdf/elements_toc.pdf
- 同 第2版 第3章 書誌: https://www.oreilly.com/library/view/the-elements-of/9780321688651/ch03.html
- Roman Pichler「Product Vision Board with Checklist」(v01/2023, © 2024): https://www.romanpichler.com/downloads/tools/Product-Vision-Board-with-Checklist.pdf
- Roman Pichler「Double Vision: How to Capture the Product Vision」: https://www.romanpichler.com/blog/double-vision-how-to-capture-the-product-vision/
- Roman Pichler「The Official Product Vision Board」: https://www.romanpichler.com/tools/product-vision-board/
- Strategyzer「The Value Proposition Canvas」: https://www.strategyzer.com/library/the-value-proposition-canvas
- Strategyzer「5 Common Mistakes to Avoid When Using the Value Proposition Canvas」: https://www.strategyzer.com/library/5-common-mistakes-to-avoid-when-using-the-value-proposition-canvas
- Wiley 書誌『Value Proposition Design』: https://www.wiley.com/en-gb/Value+Proposition+Design:+How+to+Create+Products+and+Services+Customers+Want-p-9781118968055
- Ryan Singer『Shape Up』第6章「Write the Pitch」(Basecamp/37signals): https://basecamp.com/shapeup/1.5-chapter-06
- デジタル庁「ウェブサイトガイドライン案」2025年1月21日時点: https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/f836e61e-3939-4513-8b38-261defc53874/065a37e9/20250225_policies_development_management_outline_07%20.pdf
- Working Backwards（Colin Bryar & Bill Carr）PR/FAQ Instructions & Template: https://workingbackwards.com/resources/working-backwards-pr-faq/
- About Amazon「An insider look at Amazon's culture and processes」: https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes
- Design Council「The Double Diamond」: https://www.designcouncil.org.uk/resources/the-double-diamond/
- Sense & Respond Learning (Gothelf & Seiden)「Proto-Personas」: https://www.senseandrespond.co/blog/proto-personas
- 清水誠「コンセプトダイアグラムとは」: https://concept-diagram.com/note/about-concept-diagram/ , https://makoto-shimizu.com/news/what-is-concept-diagram/

### 一次情報だが本文未確認 [P-]

- Derek F. Abell『Defining the Business: The Starting Point of Strategic Planning』Prentice-Hall, 1980: https://books.google.com/books/about/Defining_the_Business.html?id=nJMoAQAAMAAJ
- Geoffrey A. Moore『Crossing the Chasm』: https://en.wikipedia.org/wiki/Crossing_the_Chasm
- 細田高広『コンセプトの教科書 あたらしい価値のつくりかた』ダイヤモンド社: https://www.diamond.co.jp/book/9784478116340.html
- ISO 9241-210:2019: https://www.iso.org/standard/77520.html
- 総務省「みんなの公共サイト運用ガイドライン（2024年版）」: https://www.soumu.go.jp/main_content/000945249.pdf

### 二次情報 [S]

- Accessible & Usable「Webサイト設計におけるコンセプトワークのコツ（5W1Hを意識する）」2006-08-05/2011-01-11 更新: https://accessible-usable.net/2006/08/entry_060805.html
- WACUL「サイトのコンセプトについて解説!」2017-10-12/2025-04-15 更新: https://wacul-ai.com/blog/site-improvement/method/website-concept/
- LeadGrid（株式会社GIG）「Webサイト制作におけるコンセプトとは？」2025-05-15: https://goleadgrid.com/blog/website-concept
- ビズサイ（株式会社アクセスジャパン）「サイトコンセプトとは？」2025-05-22: https://www.webdeki.com/column/11531/
- ブリッジコーポレーション「Webサイトのコンセプト設計を成功させる！実践的フレームワーク5選」2025-03-25: https://bridge-net.com/blog/791/
- LIG「デザインコンセプトとは？」2025-10-31: https://liginc.co.jp/614130
- 株式会社GIG「コンセプト設計のやり方と手順」2023-07-05: https://giginc.co.jp/blog/giglab/concept-design-approach
- 株式会社シフト「サイトリニューアルのコンセプトはどのように決める？」: https://www.shift-jp.net/blog/site-renewal-concept/
- キーワードマーケティング「トンマナとは？」: https://www.kwm.co.jp/blog/tone-and-manner/
- セブンデックス「トンマナとは｜策定プロセス」: https://sevendex.com/post/28737/
- ニジボックス「カスタマージャーニーにおけるペルソナの重要さ」: https://blog.nijibox.jp/article/persona_customer-journey/
- Proximo「ペルソナとカスタマージャーニーマップの違い」: https://proximo.co.jp/media/persona-customer-journey-map/
- Frontify「What Is a Brand Platform?」: https://www.frontify.com/en/guide/brand-platforms
- Brandfolder「What Is a Brand Platform? 14 Key Components」: https://brandfolder.com/resources/brand-platform/
- ParkerWhite「14 Components of a Brand Platform」: https://www.parkerwhite.com/insights/14-components-of-a-brand-platform
- Prophet (Aaker)「It Starts With a Brand Vision」: https://prophet.com/2014/03/185-it-starts-with-a-brand-vision/
- Simple「Biggest Creative Brief Mistakes Marketers Make」: https://www.simple.io/blog/biggest-mistakes-marketers-make-creative-brief
- Admove「Creative Brief: What it is, Why Most Fail」: https://www.admove.ai/blog/creative-brief-guide
- Louis M. Morgner「Value Propositions（Steve Blank の式）」: https://louismorgner.medium.com/value-propositions-d81c01f5d60b
- the.gt「Geoffrey Moore Positioning Statement with examples」: https://the.gt/geoffrey-moore-positioning-statement/
- Thomas Schwaiger「Product vision（Cagan / Pichler 比較）」: https://medium.com/@tschwaiger/product-vision-f1613299eb6d
- Rheinwerk「How to "Do" UX Design: A Guide to the ISO 9241-210 Standard」: https://blog.rheinwerk-computing.com/how-to-do-ux-design-a-guide-to-the-iso-9241-210-standard
- 日経クロステック「【企画書編】図がメインのA4一枚文書を作る」: https://xtech.nikkei.com/it/pc/article/technique/20140423/1128643/
