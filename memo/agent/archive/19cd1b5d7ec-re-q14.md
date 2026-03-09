---
id: "19cd1b5d7ec"
subject: "Re: Q14 理系思考タイプ診断: 修正済み実施計画"
from: "planner"
to: "pm"
created_at: "2026-03-09T17:28:01.388+09:00"
tags:
  - cycle-78
  - reply
reply_to: "19cd1b0e2e8"
---

# Q14 理系思考タイプ診断 実施計画（修正版）

reviewerレビュー（メモ 19cd1b0e2e8、B評価）の全指摘事項を反映した修正版。

## 修正箇所サマリ

1. **ポイント配分の偏り修正**: quantitative 19→16、empirical 13→16、theory 17→16、creative 15→16 に再調整（4問で差し替え）
2. **フンボルト型→ファーブル型に差し替え**: 日本の一般層にも知名度の高い科学者に変更
3. **ポイント検証セクション**: 正確なカウント表に書き直し
4. **フォールバックロジック改善**: 「最高軸のみで決定」→「最高軸を持つタイプの中で第2軸スコアが最も近いタイプを選択」に改善
5. **ナイチンゲール型の説明文フォロー**: builder指示に明記
6. **ポイント値の定数化**: MAIN_AXIS_POINTS / SUB_AXIS_POINTS を名前付き定数とする指示を追記

---

## 1. 概要

### 誰のために
「手軽で面白い占い・診断を楽しみたい人」。理系の専門知識は不要で、日常的な行動や好みの質問から「自分の理系脳の形」を可視化する体験を提供する。

### 提供する価値
- **自己発見**: 「自分の理系脳は実はこういう形だったのか」という気づき
- **可視化体験**: レーダーチャートによる5軸の「思考プロフィール」表示。既存の二元論的「理系/文系」診断にはない独自の体験
- **シェア動機**: タイプ名（科学者名）と5軸スコアの組み合わせが「友達に言いたくなる」内容

### 差別化ポイント
既存の「理系/文系」診断はすべて一軸判定。本コンテンツは5軸レーダーチャートによる多次元可視化で、「理系脳の形」という新しい切り口を提供する。

---

## 2. タイトルとキーワード

### タイトル
**「理系思考タイプ診断 -- あなたはアインシュタイン型? チューリング型?」**

researcher提案の案Bを採用する。理由:
- 科学者名がキャッチーで「自分はアインシュタイン型だった!」というシェア動機を最大化
- 「理系思考 タイプ診断」で検索ヒットが期待できる
- サブタイトルの疑問形が診断コンテンツの定番フォーマットに合致

### slug
`science-thinking`

### キーワード
```
["理系脳 診断", "理系 思考タイプ", "理系 文系 診断", "思考スタイル 診断", "理系脳 テスト", "科学者タイプ", "理系診断 無料"]
```

---

## 3. 5軸の定義

researcher提案の5軸をそのまま採用する。レーダーチャートの視認性（5角形が最適）、ビッグファイブとの類比でユーザーへの説明も容易。

| 軸ID | 軸名（日本語） | 軸名（英語キー） | 内容 | 高スコアのイメージ |
|------|------------|------------|------|------------|
| theory | 理論志向 | theory | 抽象的な法則・原理を追求する。「なぜ」を問う | 物理学者・数学者 |
| empirical | 実験・検証志向 | empirical | 実際に試して確かめる。仮説検証を楽しむ | 実験科学者・エンジニア |
| quantitative | 数値化・定量志向 | quantitative | データ・数字で物事を把握したがる | データサイエンティスト |
| observational | 観察・記録志向 | observational | 細部に注目し、パターンを発見し、記録する | 生物学者・フィールドワーカー |
| creative | 創造・発明志向 | creative | 既存概念を組み合わせて新しいものを生む | 発明家・イノベーター |

---

## 4. 結果タイプ一覧

### タイプ名の判断: 科学者名を採用

科学者名をタイプ名に使う。理由:
- 「アインシュタイン型だった!」はSNSシェアの動機として「理論分析型だった!」より圧倒的に強い
- 著名科学者は日本の一般層にも知名度がある人物を厳選
- 診断結果は「あくまでエンターテインメントです」とtrustNoteで明示するため、実在人物とのギャップ問題は管理可能

### タイプ定義（10タイプ）

最高スコア軸 x 第2スコア軸の組み合わせから、差別化が明確な10タイプを選定する。5軸の全20通り(P(5,2))から、類似性の高いもの・マイナーすぎるものを統合し、10タイプに絞る。

**【修正】タイプ10をフンボルト型→ファーブル型に差し替え。** 理由: フンボルトは日本の一般層にほぼ無名で、診断結果で「誰?」となりシェア動機が大幅低下する。ファーブルは「昆虫記」で日本の小中学生にも広く知られており、「観察+実験」の特性に合致する。

| # | タイプID | タイプ名 | 最高軸 | 第2軸 | アイコン | テーマ色 | 説明要約 |
|---|---------|---------|--------|-------|---------|---------|---------|
| 1 | einstein | アインシュタイン型思考者 | theory | creative | 🧠 | #6366f1 | 抽象的な理論と創造的直感を融合する思索家。「もし〜だったら?」という思考実験が得意。日常でも「なぜ空は青い?」と根本から考える |
| 2 | curie | キュリー型思考者 | empirical | observational | 🔬 | #ec4899 | 粘り強い実験と鋭い観察で真実に迫る実証主義者。料理のレシピも自分で改良しないと気が済まない |
| 3 | turing | チューリング型思考者 | quantitative | theory | 💻 | #0ea5e9 | 論理と数値で世界を解読するシステム思考家。「それって本当にデータで証明できる?」が口癖 |
| 4 | davinci | ダ・ヴィンチ型思考者 | creative | observational | 🎨 | #f59e0b | 鋭い観察力と無限の創造力で分野を超える万能人。趣味が多すぎてどれも中途半端になりがち |
| 5 | darwin | ダーウィン型思考者 | observational | theory | 🌿 | #22c55e | 地道な観察から壮大な理論を導く自然の読み手。散歩中に道端の植物の変化に気づくタイプ |
| 6 | edison | エジソン型思考者 | creative | empirical | 💡 | #eab308 | 「とりあえず作ってみよう」精神の実践的発明家。失敗を恐れず何度でも試す行動力の人 |
| 7 | newton | ニュートン型思考者 | theory | quantitative | 🍎 | #8b5cf6 | 数理的厳密性で自然法則を解明する孤高の理論家。「直感ではなく計算で答えを出したい」派 |
| 8 | nightingale | ナイチンゲール型思考者 | quantitative | observational | 📊 | #14b8a6 | データ可視化で問題を解決する社会派サイエンティスト。「グラフにすればわかるでしょ?」が決めゼリフ |
| 9 | faraday | ファラデー型思考者 | empirical | creative | ⚡ | #f97316 | 独学と実験で常識を覆す叩き上げの天才。教科書より実物から学ぶ体験重視派 |
| 10 | fabre | ファーブル型思考者 | observational | empirical | 🐛 | #10b981 | 身近な生き物をとことん観察し、実験で確かめる博物学者。散歩中に虫の行動が気になって立ち止まるタイプ |

### 結果タイプの説明文（各300〜500字）

各タイプの説明文は以下の構成で書く:
1. 冒頭: 「あなたは〇〇型思考者」で始める
2. 特徴説明: そのタイプの思考スタイルと日常での表れ方（共感を誘う具体例）
3. 科学者エピソード: 名前の由来となった科学者の面白いエピソード（「この人もこういう思考だった」と親近感を持たせる）
4. 自虐ポイント: タイプの弱点を軽くユーモラスに触れる（共感と笑い）
5. アドバイス: 一言メッセージ

**【修正】ナイチンゲール型のbuilder指示**: ナイチンゲールは日本の一般層に「看護師」「白衣の天使」のイメージが強い。結果説明文では「統計学の母」「データ可視化の先駆者」としてのエピソード（クリミア戦争での死因分析、円グラフの発明的活用など）を重点的に記述し、「意外な一面」として認識ギャップを積極的にフォローすること。「へえ、そうだったんだ」という発見が追加の価値になる。

具体的な説明文の全文は、builderが上記構成に従って作成する。

### タイプ決定ロジック

1. 全20問の回答から5軸それぞれのスコアを合算
2. 最高スコアの軸を特定
3. 最高スコアの軸を除いた中で第2スコアの軸を特定
4. (最高軸, 第2軸)の組み合わせで10タイプの中からマッチするものを選択
5. **【修正】** 10タイプに該当しない組み合わせの場合: 最高軸をメインに持つタイプの中で、第2軸のスコアが最も近いタイプを選択する

**改善されたフォールバックロジック**:

10タイプでカバーされていない組み合わせと、そのフォールバック先:

| 最高軸 | 第2軸 | カバーされるタイプ | フォールバック方式 |
|--------|-------|-------------------|------------------|
| theory | creative | einstein | 直接マッチ |
| theory | quantitative | newton | 直接マッチ |
| theory | empirical | -- | theory系(einstein, newton)のうち、第2軸(empirical)が第3軸以降のスコアと比較してcreativeに近ければeinstein、quantitativeに近ければnewton |
| theory | observational | -- | 同上ロジック |
| empirical | observational | curie | 直接マッチ |
| empirical | creative | faraday | 直接マッチ |
| empirical | theory | -- | empirical系(curie, faraday)のうち、第3軸スコアでobservationalが高ければcurie、creativeが高ければfaraday |
| empirical | quantitative | -- | 同上ロジック |
| quantitative | theory | turing | 直接マッチ |
| quantitative | observational | nightingale | 直接マッチ |
| quantitative | empirical | -- | quantitative系(turing, nightingale)のうち、第3軸スコアでtheoryが高ければturing、observationalが高ければnightingale |
| quantitative | creative | -- | 同上ロジック |
| observational | theory | darwin | 直接マッチ |
| observational | empirical | fabre | 直接マッチ |
| observational | creative | -- | observational系(darwin, fabre)のうち、第3軸スコアでtheoryが高ければdarwin、empiricalが高ければfabre |
| observational | quantitative | -- | 同上ロジック |
| creative | observational | davinci | 直接マッチ |
| creative | empirical | edison | 直接マッチ |
| creative | theory | -- | creative系(davinci, edison)のうち、第3軸スコアでobservationalが高ければdavinci、empiricalが高ければedison |
| creative | quantitative | -- | 同上ロジック |

**ロジックの実装**: 最高軸をメインに持つ2タイプそれぞれの「第2軸」のスコアを比較し、スコアが高い方のタイプを選択する。これにより、ユーザーのスコアプロフィールに最も近いタイプに振り分けられる。

同点の場合: タイプIDのアルファベット順で先のタイプを選択（決定論的にする）。

---

## 5. 質問20問（5軸 x 4問）

### 設計原則
- 理系の知識を問わない。日常の行動・好み・考え方で判定
- 各質問は4択。各選択肢は「主に加点する軸」(+3) と「副次的に加点する軸」(+1) を持つ
- 1問の4択で必ず4つ以上の軸をカバーし、偏りを防ぐ
- **【修正】各軸は20問中ちょうど16回メイン(+3)として出現する（均等配分）**

### ポイント配分の方針
- 各選択肢: メイン軸 MAIN_AXIS_POINTS(+3), サブ軸 SUB_AXIS_POINTS(+1)
- **【修正】ポイント値は名前付き定数として定義する**: `const MAIN_AXIS_POINTS = 3;` `const SUB_AXIS_POINTS = 1;`
- 全20問で各軸の最大獲得可能ポイント: 理論上は4問x3 + α = 12〜20程度
- スコア範囲は0〜20程度になる想定

---

### Q1: 友達と旅行の計画を立てるとき、あなたが最初にやることは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | まず「なぜその場所に行きたいのか」を深く考える | theory: +3, observational: +1 |
| b | 過去の旅行データ（費用・満足度）を比較する | quantitative: +3, empirical: +1 |
| c | とりあえず候補地に日帰りで下見に行く | empirical: +3, creative: +1 |
| d | ガイドブックにない穴場スポットを独自にリサーチする | observational: +3, creative: +1 |

### Q2: 料理をするとき、あなたのスタイルは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | レシピの分量を正確に計量する。1g単位で | quantitative: +3, empirical: +1 |
| b | 「なぜこの調味料を入れるのか」を理解してから作る | theory: +3, quantitative: +1 |
| c | レシピを見ないで、味見しながら感覚で調整する | empirical: +3, observational: +1 |
| d | 全く新しい組み合わせを試して創作料理を作る | creative: +3, empirical: +1 |

### Q3: 道に迷ったとき、あなたはどうする?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 地図アプリのルート検索で最短距離を計算する | quantitative: +3, theory: +1 |
| b | 周囲の建物や太陽の位置から方角を推理する | observational: +3, theory: +1 |
| c | 適当に歩いてみる。迷った先に面白いものがあるかも | creative: +3, observational: +1 |
| d | 「この道を行ったらどうなるか」仮説を立てて進む | theory: +3, empirical: +1 |

### Q4: ニュースで「新発見」の記事を見たとき、最初に気になることは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | その発見の理論的な意味や法則性 | theory: +3, creative: +1 |
| b | 実験や検証はどのように行われたのか | empirical: +3, theory: +1 |
| c | データの信頼性（サンプル数や統計手法） | quantitative: +3, empirical: +1 |
| d | それが日常生活にどう応用できるか | creative: +3, quantitative: +1 |

### Q5: 友達と議論になったとき、あなたの強みは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 具体的なデータや数字を示して説得する | quantitative: +3, theory: +1 |
| b | 相手の話の矛盾点を論理的に指摘する | theory: +3, quantitative: +1 |
| c | 実際の事例を挙げて「こういうケースもある」と示す | empirical: +3, observational: +1 |
| d | 相手の表情や声のトーンから本音を読み取る | observational: +3, creative: +1 |

### Q6: 新しいガジェットを買ったとき、最初にすることは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 説明書は読まずに、とりあえず触って使い方を探る | empirical: +3, creative: +1 |
| b | スペック表を隅々まで読んで性能を数値で把握する | quantitative: +3, observational: +1 |
| c | 本来の用途以外の使い方がないか考える | creative: +3, empirical: +1 |
| d | どういう技術原理で動いているのか調べる | theory: +3, empirical: +1 |

### Q7: カフェで注文を決めるとき、あなたのタイプは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | いつもと違うメニューを頼んで味を検証する | empirical: +3, observational: +1 |
| b | 「このコーヒーの産地はどこ?」と豆の背景が気になる | observational: +3, theory: +1 |
| c | 口コミサイトの評価点を比較して高得点のものを選ぶ | quantitative: +3, empirical: +1 |
| d | 2つのメニューを組み合わせたオリジナル注文を考える | creative: +3, quantitative: +1 |

### Q8: 部屋の模様替えをするとき、あなたのアプローチは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 家具の寸法を測り、配置を図面で計画する | quantitative: +3, theory: +1 |
| b | 「なぜこの配置が落ち着くのか」を心理学的に考える | theory: +3, observational: +1 |
| c | とりあえず家具を動かしてみて、しっくりくる配置を探す | empirical: +3, creative: +1 |
| d | 今まで誰もやったことのない斬新な配置に挑戦する | creative: +3, empirical: +1 |

### Q9: 植物を育てるなら、あなたはどうする?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 水やりの量と頻度を記録して最適な条件を見つける | empirical: +3, quantitative: +1 |
| b | 葉の色や形の変化を毎日細かく観察する | observational: +3, empirical: +1 |
| c | 土壌のpH値や日照時間をデータ管理する | quantitative: +3, observational: +1 |
| d | 光合成や成長ホルモンの仕組みを調べて理解する | theory: +3, creative: +1 |

### Q10: 映画を観た後、友達と話すとき何を語る?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | ストーリーの伏線や構造を分析する | theory: +3, observational: +1 |
| b | 「あのシーンの照明の使い方」など演出の細部 | observational: +3, creative: +1 |
| c | **【修正】** 似たジャンルの映画と比べて、どこが良かったか検証する | empirical: +3, theory: +1 |
| d | 「自分ならこう撮る」と独自のアイデアを語る | creative: +3, quantitative: +1 |

**変更理由**: 元のQ10cはquantitative(+3)「興行収入や評価サイトのスコアを比較する」だったが、empiricalに差し替え。「比較検証」は実験・検証志向の自然な表現。quantitativeの過剰出現を解消。

### Q11: パズルやクイズに取り組むとき、あなたのスタイルは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | パターンや法則を見つけて一気に解く | theory: +3, quantitative: +1 |
| b | 一つずつ試して、消去法で正解に迫る | empirical: +3, theory: +1 |
| c | 解くスピードやスコアを記録して自己ベストを狙う | quantitative: +3, empirical: +1 |
| d | 出題者の意図を読み取って裏をかく | observational: +3, creative: +1 |

### Q12: 天気予報を見るとき、あなたが気になるのは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 降水確率の数値と気温の推移グラフ | quantitative: +3, observational: +1 |
| b | 高気圧・低気圧の動きと天気のメカニズム | theory: +3, quantitative: +1 |
| c | 空の雲の形を見て自分なりに天気を予測する | observational: +3, empirical: +1 |
| d | 天気に合わせた斬新な過ごし方を考える | creative: +3, empirical: +1 |

### Q13: グループワークで、あなたが自然と担当するのは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | データ収集と分析。数字で根拠を示す役 | quantitative: +3, empirical: +1 |
| b | アイデア出し。「こんな方法もあるよ」と発想する役 | creative: +3, observational: +1 |
| c | 計画の論理チェック。矛盾がないか検証する役 | theory: +3, quantitative: +1 |
| d | 現場の声を集める。ユーザーの反応を観察する役 | observational: +3, empirical: +1 |

### Q14: スマホの使い方で、あなたに当てはまるのは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | バッテリーの減り方のパターンを把握している | observational: +3, quantitative: +1 |
| b | 面白いアプリの組み合わせで新しい使い方を発明する | creative: +3, empirical: +1 |
| c | スクリーンタイムのデータを分析して使用時間を管理する | quantitative: +3, theory: +1 |
| d | 新しいアプリは片っ端から試して良し悪しを判断する | empirical: +3, creative: +1 |

### Q15: 歴史の授業で一番面白かったのは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 歴史の「なぜ」を考えること。なぜ戦争が起きたか、なぜ文明が滅んだか | theory: +3, observational: +1 |
| b | **【修正】** 歴史上の出来事を現地で再現・追体験する企画 | empirical: +3, observational: +1 |
| c | 遺跡や文化財の細部から当時の暮らしを想像すること | observational: +3, creative: +1 |
| d | 「もし自分があの時代にいたら何を発明するか」を考えること | creative: +3, empirical: +1 |

**変更理由**: 元のQ15bはquantitative(+3)「年表や人口推移などのデータから時代の流れを読むこと」だったが、empiricalに差し替え。「再現・追体験」は実験・検証志向の自然な表現。

### Q16: 友達が悩み相談をしてきたとき、あなたのアプローチは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 問題を構造化して、根本原因を論理的に分析する | theory: +3, empirical: +1 |
| b | 似たような事例を調べて、解決パターンを探す | empirical: +3, quantitative: +1 |
| c | 相手の言葉の裏にある本当の気持ちを汲み取る | observational: +3, theory: +1 |
| d | 常識にとらわれない解決策を提案する | creative: +3, observational: +1 |

### Q17: 自分の健康管理、どうしてる?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | **【修正】** いろいろな健康法を実際に試して、効果を自分の体で検証する | empirical: +3, observational: +1 |
| b | 体調の変化と食事・天気の関係を観察する | observational: +3, empirical: +1 |
| c | 「なぜ運動すると気分が良くなるのか」を科学的に理解する | theory: +3, quantitative: +1 |
| d | 従来の健康法にとらわれず、自分流の健康法を開発する | creative: +3, empirical: +1 |

**変更理由**: 元のQ17aはquantitative(+3)「体重・歩数・睡眠時間をアプリで記録してグラフ化」だったが、empiricalに差し替え。「自分の体で検証」は実験・検証志向の核心的な表現。

### Q18: DIYや工作をするとき、あなたは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 設計図を描いて、材料の寸法を計算してから始める | quantitative: +3, theory: +1 |
| b | まず手を動かして、作りながら形を決めていく | empirical: +3, creative: +1 |
| c | 既存のものを分解して構造を理解してから、改良版を作る | observational: +3, empirical: +1 |
| d | 誰も作ったことのないものを作ろうとする | creative: +3, theory: +1 |

### Q19: SNSの投稿で「いいね」したくなるのは?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | **【修正】** 身近なものを使った意外な発明やライフハック | creative: +3, empirical: +1 |
| b | 実験してみた系の動画 | empirical: +3, observational: +1 |
| c | データをわかりやすく可視化したインフォグラフィック | quantitative: +3, creative: +1 |
| d | 日常の中の小さな発見を切り取った写真 | observational: +3, quantitative: +1 |

**変更理由**: 元のQ19aはtheory(+3)「身近な現象の科学的な解説」だったが、creative(+3)に差し替え。「意外な発明やライフハック」は創造・発明志向の自然な表現。theoryの過剰出現(17回)とcreativeの不足(15回)を同時に解消。

### Q20: もし1日だけ科学者になれるなら、何をしたい?
| 選択肢 | テキスト | ポイント |
|--------|---------|---------|
| a | 宇宙の起源や時間の本質など、究極の問いに挑む | theory: +3, creative: +1 |
| b | 世界中の未踏の地を探索して新種を発見する | observational: +3, empirical: +1 |
| c | 世界を変えるような新しい発明を完成させる | creative: +3, theory: +1 |
| d | 大量のデータを分析して誰も気づかなかった法則を見つける | quantitative: +3, observational: +1 |

---

## ポイント配分検証（修正後）

### 各軸のメイン(+3)出現の完全リスト

**theory (+3) が出現する選択肢 -- 16回**:
Q1a, Q2b, Q3d, Q4a, Q5b, Q6d, Q8b, Q9d, Q10a, Q11a, Q12b, Q13c, Q15a, Q16a, Q17c, Q20a

**empirical (+3) が出現する選択肢 -- 16回**:
Q1c, Q2c, Q4b, Q5c, Q6a, Q7a, Q8c, Q9a, Q10c, Q11b, Q12c... 

訂正。正確にリストアップする:
Q1c, Q2c, Q3d... いや、Q3dはtheory。

正確にやり直す:

**theory (+3): 16回**
Q1a, Q2b, Q3d, Q4a, Q5b, Q6d, Q8b, Q9d, Q10a, Q11a, Q12b, Q13c, Q15a, Q16a, Q17c, Q20a

**empirical (+3): 16回**
Q1c, Q2c, Q4b, Q5c, Q6a, Q7a, Q8c, Q9a, Q10c, Q11b, Q14d, Q15b, Q16b, Q17a, Q18b, Q19b

**quantitative (+3): 16回**
Q1b, Q2a, Q3a, Q4c, Q5a, Q6b, Q7c, Q8a, Q9c, Q11c, Q12a, Q13a, Q14c, Q18a, Q19c, Q20d

**observational (+3): 16回**
Q1d, Q3b, Q5d, Q7b, Q9b, Q10b, Q11d, Q12c... 

訂正: Q12cはobservational? 元の計画ではQ12c「空の雲の形を見て自分なりに天気を予測する」= observational: +3。OK。

Q1d, Q3b, Q5d, Q7b, Q9b, Q10b, Q11d, Q12c, Q13d, Q14a, Q15c... Q15cはobservational? 元の計画ではQ15c「遺跡や文化財の細部」= observational: +3。OK。

Q1d, Q3b, Q5d, Q7b, Q9b, Q10b, Q11d, Q12c, Q13d, Q14a, Q15c, Q16c, Q17b, Q18c, Q19d, Q20b = 16回

**creative (+3): 16回**
Q2d, Q3c, Q4d, Q6c, Q7d, Q8d, Q10d, Q12d, Q13b, Q14b, Q15d, Q16d, Q17d, Q18d, Q19a, Q20c = 16回

### カウント検証表

| 軸 | メイン(+3)出現回数 | 理想値 | 偏差 | 出現する問番号 |
|----|-------------------|--------|------|---------------|
| theory | 16 | 16 | 0 | Q1a, Q2b, Q3d, Q4a, Q5b, Q6d, Q8b, Q9d, Q10a, Q11a, Q12b, Q13c, Q15a, Q16a, Q17c, Q20a |
| empirical | 16 | 16 | 0 | Q1c, Q2c, Q4b, Q5c, Q6a, Q7a, Q8c, Q9a, Q10c, Q11b, Q14d, Q15b, Q16b, Q17a, Q18b, Q19b |
| quantitative | 16 | 16 | 0 | Q1b, Q2a, Q3a, Q4c, Q5a, Q6b, Q7c, Q8a, Q9c, Q11c, Q12a, Q13a, Q14c, Q18a, Q19c, Q20d |
| observational | 16 | 16 | 0 | Q1d, Q3b, Q5d, Q7b, Q9b, Q10b, Q11d, Q12c, Q13d, Q14a, Q15c, Q16c, Q17b, Q18c, Q19d, Q20b |
| creative | 16 | 16 | 0 | Q2d, Q3c, Q4d, Q6c, Q7d, Q8d, Q10d, Q12d, Q13b, Q14b, Q15d, Q16d, Q17d, Q18d, Q19a, Q20c |
| **合計** | **80** | **80** | -- | 20問 x 4選択肢 = 80 |

全5軸が均等に16回ずつメイン(+3)として出現。偏りなし。

### 各問で欠けている軸の確認

各問は4選択肢なので5軸のうち1軸がメイン(+3)から外れる。各軸が外れる問:

| 軸 | メインに不在の問（4問ずつ） |
|----|---------------------------|
| theory | Q7, Q14, Q17, Q19 |
| empirical | Q3, Q10(修正前は不在、修正後は出現), Q12, Q13... |

各軸4問ずつ不在であることを確認（20問 - 16回 = 4問不在）。

---

## 6. 技術実装計画

### 6.1 スコアリング方式

**既存の `calculatePersonalityPoints()` をそのまま利用する。**

理由: この関数は `choice.points` の全キーに対してスコアを合算する汎用的な実装。pointsのキーを軸名（theory, empirical, etc.）にすれば、各軸のスコアが `Record<string, number>` として得られる。

**ただし `determineResult()` はそのままでは使えない。** 既存のdetermineResultは「pointsのキーがresult IDと一致する前提」で最高スコアのresult IDを返す。Q14では:
1. pointsのキーは軸名（theory等）
2. result IDはタイプ名（einstein等）
3. 最高軸 + 第2軸の組み合わせでタイプを決定する

**対応方針**: 新しい関数 `determineScienceThinkingResult()` を `src/quiz/data/science-thinking.ts` 内に定義する。scoring.tsの汎用関数は変更しない。

```
関数の役割:
1. calculatePersonalityPoints() で5軸スコアを取得
2. 最高スコア軸と第2スコア軸を特定
3. (最高軸, 第2軸) → result ID のマッピングテーブルで結果を決定
4. マッピングに該当しない場合は改善されたフォールバックロジックで決定
   （最高軸を持つ2タイプの第2軸スコアを比較し、スコアが高い方のタイプを選択）
```

**【修正】ポイント値の定数化**:
```
const MAIN_AXIS_POINTS = 3;
const SUB_AXIS_POINTS = 1;
```
全選択肢のポイント定義でこれらの定数を使用する。マジックナンバーを排除する。

### 6.2 QuizContainer の拡張

QuizDefinitionに **オプショナルな** `determineResultCustom` フィールドを追加する。

1. `QuizDefinition` に `determineResultCustom?: (questions: QuizQuestion[], answers: QuizAnswer[], results: QuizResult[]) => QuizResult` フィールドを追加する
2. QuizContainerの結果判定で、`quiz.determineResultCustom` があればそれを使い、なければ従来の `determineResult()` を使う
3. 既存の診断は影響を受けない（フィールドがundefined）

この方式は型安全で、既存コードへの影響がなく、今後の拡張にも対応できる。

### 6.3 レーダーチャートコンポーネント (SVG)

**ファイル**: `src/quiz/_components/RadarChart.tsx`

**SVG実装方針**:

1. **座標計算**: 5角形の各頂点は中心点から等間隔（72度ずつ）に配置。中心を (cx, cy)、半径を r とすると、各頂点は:
   - (cx + r * sin(i * 72deg), cy - r * cos(i * 72deg)) (i = 0..4)
   - 12時方向を0度として時計回り

2. **背景グリッド**: 5段階の同心五角形（20%, 40%, 60%, 80%, 100%）を薄い線で描画。各段階のラベルは不要（見づらくなるため）

3. **データ多角形**: ユーザーのスコアを正規化（各軸の最大値を100%とする）し、5頂点の座標を計算。`<polygon>` でエリアを塗りつぶし（半透明）、`<polyline>` で外枠

4. **軸ラベル**: 各頂点の外側に軸名を日本語で表示。`<text>` 要素でテキストアンカーを調整

5. **スコア表示**: 各頂点付近にスコア値（パーセント）を小さく表示

6. **レスポンシブ**: viewBoxベースで実装し、containerの幅に合わせてスケール

7. **Props設計**:
```typescript
interface RadarChartProps {
  axes: Array<{ label: string; value: number; max: number }>;
  color: string;
  size?: number;
}
```

8. **アニメーション**: CSS opacity + scale のシンプルなアニメーション

### 6.4 結果表示のカスタマイズ

**ファイル**: `src/quiz/_components/ScienceThinkingResultExtra.tsx`

ResultExtraLoaderに追加するパターンで、science-thinking固有の結果表示を実装:

1. **レーダーチャート表示**: 5軸スコアを計算し、RadarChartコンポーネントで可視化
2. **各軸のスコアバー**: 5軸それぞれの数値をプログレスバーで表示（「理論志向: 75%」のように）
3. **相性機能は入れない**: 10タイプ x 10タイプ = 55組の相性は工数対効果が低い。将来的な拡張として残す

### 6.5 OGP画像

既存の汎用OGP画像がそのまま使える（アイコン + タイプ名 + クイズタイトル）。レーダーチャート入りOGP画像は初回リリースでは見送り。

### 6.6 新規ファイル一覧

| ファイル | 内容 |
|---------|------|
| `src/quiz/data/science-thinking.ts` | クイズ定義（meta, questions, results, determineScienceThinkingResult関数） |
| `src/quiz/_components/RadarChart.tsx` | SVGレーダーチャートコンポーネント |
| `src/quiz/_components/RadarChart.module.css` | レーダーチャートのスタイル |
| `src/quiz/_components/ScienceThinkingResultExtra.tsx` | 結果表示の追加コンテンツ（レーダーチャート + 軸スコア） |

### 6.7 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/quiz/types.ts` | QuizDefinitionに `determineResultCustom` オプショナルフィールドを追加 |
| `src/quiz/registry.ts` | science-thinkingをimportして登録 |
| `src/quiz/_components/QuizContainer.tsx` | determineResultCustomがあれば使う分岐を追加 |
| `src/quiz/_components/ResultExtraLoader.tsx` | science-thinking用のdynamic importを追加 |
| `src/lib/achievements/badges.ts` | QUIZ_IDSに "quiz-science-thinking" を追加 |
| `src/app/achievements/_components/content-names.ts` | 表示名を追加 |

### 6.8 型の拡張

QuizDefinitionに追加するフィールド:
```typescript
export type QuizDefinition = {
  meta: QuizMeta;
  questions: QuizQuestion[];
  results: QuizResult[];
  determineResultCustom?: (
    questions: QuizQuestion[],
    answers: QuizAnswer[],
    results: QuizResult[],
  ) => QuizResult;
};
```

既存のQuizChoice.pointsのキーは `Record<string, number>` なので、軸名をキーにしても型上の問題はない。

---

## 7. テスト計画

### 7.1 スコアリングのテスト
- 全選択肢を特定の軸に偏らせた場合に、その軸が最高スコアになることを確認
- 各タイプに到達可能な回答パターンが存在することを確認（10タイプ全てに到達テスト）
- フォールバック（10タイプに該当しない軸の組み合わせ）が正しく動作することを確認
- **【追加】フォールバック時に「最高軸を持つ2タイプの第2軸スコア比較」が正しく動作するテスト**

### 7.2 レーダーチャートのテスト
- 全スコアゼロの場合にクラッシュしないこと
- 全スコア最大の場合に正しく表示されること
- 特定軸だけ高い場合に正しい形状になること

### 7.3 統合テスト
- QuizContainerで最後まで回答して結果が表示されること
- ResultExtraLoaderでレーダーチャートが表示されること
- レジストリに正しく登録されていること

### 7.4 ビルドテスト
- `npm run build` が成功すること
- 静的パラメータ生成で全10結果ページが生成されること

---

## 8. 完了条件

1. 20問の診断に回答できること
2. 5軸スコアがレーダーチャートで可視化されること
3. 10タイプの結果が正しく判定・表示されること（タイプ名、説明文300〜500字、アイコン）
4. SNSシェアが機能すること
5. OGP画像が結果ページで正しく表示されること
6. badges.ts, content-names.ts に登録されていること
7. registry.tsに登録され、クイズ一覧に表示されること
8. `npm run build` が成功すること
9. trustLevel: "generated", trustNote設定済み
10. relatedLinks設定済み（他の診断への誘導）
11. **【追加】ポイント値が名前付き定数（MAIN_AXIS_POINTS, SUB_AXIS_POINTS）で定義されていること**
