---
title: AI Slop の定義・発生原因・回避策 — デザインシステムとフロントエンド実装の文脈で
date: 2026-04-23
purpose: yolos.net B-308「デザインガイドラインとUIコンポーネント集の策定」にあたり、AI が生成する UI/コードに含まれる「AI Slop（テンプレ的で独自性のない量産アウトプット）」の実態と回避策を把握する。先行調査 R1〜R4 の補完。
method: >
  WebSearch（AI slop definition origin frontend UI shadcn vibe-coding over-engineering
  anti-slop design system SKILL.md rubric user perception trust intentional imperfection 2024-2026）;
  WebFetch（simonwillison.net/2024/May/8/slop, andrew.ooo Taste Skill review,
  the-decoder.com tragedy-of-commons study, managed-code.com AI slop in design,
  aviator.co avoid-AI-code-slop, stoptheslop.dev internal guide,
  tasteskill.dev, github.com/rand/cc-polymath anti-slop SKILL.md,
  github.com/jqbit/stop-the-slop, smashingmagazine.com intent-prototyping,
  palladiummag.com platonic-case-against-AI-slop,
  bynder.com AI-vs-human-content-study,
  joshcusick.substack.com design-systems-should-do-less,
  elements.envato.com UX-UI-design-trends）
sources:
  - https://simonwillison.net/2024/May/8/slop/
  - https://en.wikipedia.org/wiki/AI_slop
  - https://andrew.ooo/posts/taste-skill-anti-slop-ai-frontend-review/
  - https://the-decoder.com/study-maps-developer-frustration-over-ai-slop-as-a-tragedy-of-the-commons-in-software-development/
  - https://www.managed-code.com/blog-post/ai-slop-in-design
  - https://www.aviator.co/blog/how-to-avoid-ai-code-slop/
  - https://stoptheslop.dev/blog/stop-the-slop-an-internal-guide-for-devs
  - https://www.tasteskill.dev
  - https://github.com/jqbit/stop-the-slop
  - https://github.com/rand/cc-polymath/blob/main/skills/anti-slop/SKILL.md
  - https://medium.com/@abhinav.dobhal/the-end-of-ai-slop-how-ui-ux-pro-max-is-solving-the-design-crisis-in-ai-generated-code-bbc23995f0e0
  - https://www.smashingmagazine.com/2025/09/intent-prototyping-pure-vibe-coding-enterprise-ux/
  - https://www.palladiummag.com/2025/11/14/the-platonic-case-against-ai-slop/
  - https://www.bynder.com/en/press-media/ai-vs-human-made-content-study/
  - https://joshcusick.substack.com/p/design-systems-should-do-less
  - https://elements.envato.com/learn/ux-ui-design-trends
  - https://techbytes.app/posts/escape-ai-slop-frontend-design-guide/
  - https://dev.to/this-is-learning/what-i-dont-like-about-shadcnui-3amf
  - https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report
---

# AI Slop の定義・発生原因・回避策 — デザインシステムとフロントエンド実装の文脈で

## 本レポートの位置づけ

先行調査 R1〜R4（`2026-04-23-ai-agent-design-system-enforcement-best-practices.md` および `2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md` 等）では、Claude Code への規約遵守強制手法（DESIGN.md、Stylelint、Hook）を整理した。本レポートは「その規約が正しい方向を向いているか」という上流の問いを補完する。強制機構を整えても、ガイドライン自体が「AI Slop を量産する設計」になっていれば意味がない。

---

## 1. AI Slop の定義と語の定着

### 1-1. 語の起源

「AI Slop」という語は 2022〜2023 年ごろ 4chan・Hacker News で AI 生成画像を指す語として自然発生した。主流への普及は 2024 年 5 月、Simon Willison（Django co-creator、著名エンジニア）が自身のブログ記事「Slop is the new name for unwanted AI-generated content」で広めたことによる。

Willison の定義は明快である。「Not all AI-generated content is slop. But if it's mindlessly generated and thrust upon someone who didn't ask for it, slop is the perfect term.」（直訳: AI 生成コンテンツすべてが Slop ではない。しかし、それが無思慮に生成されて求めていない人に押し付けられるなら、Slop は完璧な語だ。）

彼は Slop を「spam」に相当する語として定着させようと主張し、実際に 2025 年にはメリアム＝ウェブスター・米方言学会の「2025年の単語」に選定された。Google が Gemini を検索結果に組み込んだ 2024 年第二四半期以降、インターネット上の Slop 批判は急加速した。

### 1-2. UI/フロントエンド領域における Slop の具体像

コンテンツ領域の Slop（中身のない SEO 記事など）とは別に、フロントエンド・UI 実装における Slop は 2024〜2026 年を通じて明確なパターンとして記述されるようになった。以下は複数の実務記事・OSS プロジェクトが一致して列挙するシグナルである。

**視覚的シグナル（「AI 臭い」と認識されるパターン）:**

- Inter・Roboto フォントの無条件採用（最も多く言及される）
- 紫〜青のグラデーションボタン・ヘッダー（"neon purple/blue AI aesthetic"）
- 中央寄せヒーローセクション + 3カラムフィーチャーグリッド + 価格テーブルの定番構成
- `rounded-2xl` + `shadow-lg` + `gradient-text` の組み合わせ
- glassmorphism（すりガラス効果）の意味のない多用
- 絵文字アイコンの多用（リスト先頭の絵文字 bullet など）
- 装飾的な 3D シェイプ、グラデーションオーブ（「AIを表す」オーブ状装飾）
- 汎用的な CTA 文言（"Get Started" など文脈を無視した呼びかけ）

**コード・構造的シグナル:**

- `data`、`result`、`temp`、`item` などの汎用変数名
- `handleData()`、`processItems()` などの意味のない関数名
- コードをそのまま説明するだけのコメント（セマンティクスの重複）
- 不必要な抽象化レイヤー、使われないコンポーネントバリアント
- インタラクションの完成度不足（loading・error・empty 状態の省略）
- 「動くが要件を満たさない」表面的な正しさ（hallucinatd API、非推奨メソッドの使用）

ある著名な開発者の観察を引用する。「Twitter/X には AI 生成 UI を嘲笑するスクリーンショットが溢れている。同じ青いボタン、同じ Lucide アイコン、同じ bento グリッド。」（techbytes.app）

### 1-3. コンテンツ領域 Slop との異同

コンテンツ Slop（ブログ記事等）との共通点は「学習データの最頻値への収束」という発生原因である。異なる点は、UI Slop は視覚的に即座に認識され、かつ「使えないわけではない」ために放置されやすいことにある。記事の Slop はページを読んでいるうちに空虚さに気づかれるが、UI Slop は「整っているがどこかで見た」という感覚として蓄積し、サイト全体の個性を侵食する。

### 1-4. ユーザー側の受け止め

Bynder の調査（2024〜2025 年実施）では、消費者の 50% が AI 生成コンテンツを正しく識別できる。識別した際のブランド印象は「機械的（impersonal）」26%、「怠慢（lazy）」20% など否定的なものが多数を占める。一方で、AI 生成コンテンツと明示せずに見せた場合は 56% が AI 版を好んだという逆説もある。つまり「AI 臭い」と認識された瞬間に評価は反転する。

ユーザーが「AI 臭い」と感じる具体的なシグナルとして研究・実務報告が一致して挙げるのは以下である:

- どこかで見た既視感のある視覚パターン
- 文脈を無視した汎用的な UI（fintech に playful animations、医療に激しいグラデーション）
- インタラクションの完成度不足（状態遷移の欠落）
- 「コード的には正しいが意図が読めない」構造

---

## 2. AI Slop が発生する原因

### 2-1. モデル側の性質: 学習データ最頻値への収束

LLM は学習データの統計的パターンを再現する。フロントエンドの学習データにおいて「最も多く登場する」コンポーネントレイアウト・色・フォントが生成の基準となる。これを業界では「distributional convergence（分布収束）」と呼ぶ。

Palladium Magazine の論考（2025年11月）は Plato の模倣論を援用して、この問題を「model collapse（モデル崩壊）」として厳密に記述している。Cambridge の研究者が確認した事実として: 「AI モデルが自分の出力を再学習すると、レアパターンが最初に消え、多様性が崩壊し、狭い平均へと収束する。」これは数学的必然であって、モデルを「賢く」すれば解決する問題ではない。

「犬」を生成するよう求めると「ゴールデンレトリーバーとラブラドール」ばかりになる——この比喩はそのまま UI 生成にも当てはまる。「ボタンを作れ」と指示すれば、最頻値の青いボタンに `rounded-md` と `shadow-sm` がつく。

### 2-2. プロンプト側の問題

「良い感じに作って」「モダンなデザインで」という曖昧指示は、モデルに最頻値選択を許すことに等しい。

Smashing Magazine の Yegor Gilyov（2025年9月）は「vibe coding の落とし穴は、意図を最も曖昧な形で表現させることにある——つまり会話によって」と指摘する。曖昧さはモデルが「推測」する余地を生み、推測の結果は常に統計的最頻値に向かう。

もう一つの問題はチェックリストの肥大化である。先行調査 R1 で確認した通り、CLAUDE.md に 100 行を超えるルールを書くと AI は実質的に大半を無視する。「ルールを全部守れ」という指示は「ルールがない」のと実質的に同じになる。

### 2-3. ワークフロー側の問題: 生成量が検証量を超える

CodeRabbit の調査（2025年12月）によると、AI 生成コードは人間が書いたコードより 1.7 倍多くの問題を含む。しかしレビューにかける時間は AI 生成側が短縮した分だけ増えることはなく、実際には減る傾向がある。

The Decoder が報じた「tragedy of the commons」研究では、あるチームが 1 日 30 件の PR を 6 人でレビューする状況に追い込まれたと記録されている。開発者の感想として: 「自分がこのコードを見た最初の人間だ、という感覚」——つまり AI が未検証の出力を押し込んでいる構造。

yolos.net の文脈に引き直すと、PM が builder に大きなタスクを渡し、builder が大量のファイルを変更した場合、reviewer が全体を見渡す負担は急増する。小さく分割することはコード品質だけでなく Slop 検出コストの観点からも不可欠である。

### 2-4. デザインシステム側の問題: 既製テンプレへの過度依存

shadcn/ui が「AI コーディングの標準コンポーネントライブラリ」として定着した背景には、Vercel の v0 ツールが作ったネットワーク効果がある。v0 が shadcn/ui を使う → AI がそのコードで学習する → 次の世代の AI が shadcn/ui を出力しやすくなる、というフライホイール。

その結果として何が起きているか: 「Claude Code は文脈を知らない。components.json も、Tailwind 設定も、インストール済みコンポーネント一覧も参照しない。だから間違った variant の Button を生成し、ページ間で色が変わる。」（DEV Community）

shadcn/ui 自体の問題ではなく、「AI がデフォルトとして使う」ことで全てのサイトが同じ見た目になる、という構造的問題である。「shared knowledge, shared debugging strategies」を称賛する一方で、「全員が同じ見た目になる」という副作用への批判は存在しない、という記事もある（Vibe Coder Blog）。

---

## 3. 回避策・実践知

### 3-1. 具体への固執: 抽象ルールより「この 1 箇所が使いやすいか」

stop-the-slop プロジェクト（github.com/jqbit）が定める中核原則: 「コードを理解できず、説明できず、拡張できないなら、コミットしてはならない。」これは量的指標ではなく「開発者の本能」を品質シグナルとして使う考え方である。

Taste Skill の設計思想も同様で、「全ての shadow、全ての spring constant、全ての pixel offset を手で調整した」というレベルの具体性を AI に求める。「モダンで整った UI」という指示は禁句に近い。

yolos.net への示唆: デザインガイドラインを書くとき、「一貫性を保て」「ユーザーに優しく」という抽象原則より「このボタンのここのパディングが心地よいか」「このフォントサイズが読みやすいか」という具体的な問いかけの方が AI の行動を変えやすい。

### 3-2. 意図先行: 仕様として定義してから生成させる

aviator.co の整理が明確である。「コードを書く前に、システムが何をすべきかを精密で検証可能な形で合意する。そして AI に how を任せる。」レビューの問いは「これで良さそうか？」から「合意した仕様を満たしているか？」に変わる。

Intent Prototyping（Smashing Magazine, 2025年9月）もこの発想で、デザイナーの明示的な意図を前面に出すことで vibe coding の「会話的曖昧さ」を排除しようとする。

### 3-3. 人間の介入ポイントの設計

stop-the-slop の実践指針が示す具体的な介入点:

1. **生成前**: 期待するコミット・プロンプトシーケンス・参照ファイルを事前に書き出す
2. **生成単位**: 1 ファイル単位で生成し、全体を一度に渡さない
3. **試行上限**: 2 回試みてもほぼ改善しなければ手動で対処するか最初からやり直す
4. **コミット粒度**: `git reset --hard` が怖く感じたら、タスクが大きすぎる

### 3-4. Slop 評価の指標

cc-polymath の anti-slop SKILL.md が定義するスコアリングが参考になる:

- 0〜20: 本物らしい（Authentic）
- 20〜40: 中程度のパターンあり
- 40〜60: 全体的にジェネリック
- 60 以上: 深刻

設計 Slop のシグナルスコアとして使える項目:

- 汎用グラデーション背景（紫/ピンク/シアン）: 高スコア
- 目的なき glassmorphism・neumorphism: 高スコア
- コンテンツ構造を無視したテンプレートレイアウト: 高スコア
- インタラクション状態（loading/error/empty）の欠落: 中〜高スコア

### 3-5. 意図的な非平均化の技法

デザイン業界では 2025〜2026 年に「Anti-Polish」「Imperfect by Design」運動が台頭している。手描き要素、フィルムグレイン、意図的な非対称、ウォブルするタイポグラフィ。これらは AI への反動として生まれたが、ツールサイトに直接適用するものではない。

ただし、その背景にある思想は応用できる。ユーザーが「AI 臭い」と感じる最大の原因は「どこかで見た」感覚である。これを解消するには:

- 使うフォントに理由を持たせる（Inter を使うなら「Inter だからこそ」の使い方を定義する）
- 色に固有の意味を持たせる（「AI サイトっぽい青」ではなく「yolos.net 固有の選択として○○色」）
- レイアウトパターンに固有の判断を記録する（「なぜ 3カラムではなく 2カラムなのか」の理由）

「わざと不揃いにする」より「選んだ理由を持つ」の方が、道具サイトのコンテキストでは現実的である。

### 3-6. フォーマットより意思決定プロセスを縛る

Taste Skill の設計で最も示唆的なのは、3 つのパラメーター（DESIGN_VARIANCE、MOTION_INTENSITY、VISUAL_DENSITY、各 1〜10 スケール）で「出力の方向性」を制御する点である。これは「ルールの列挙」ではなく「意思決定空間の定義」である。

stop-the-slop の aesthetic allowlist も同様の思想: 11 の named tone（brutally minimal、maximalist chaos、retro-futuristic、organic、luxury、playful、editorial、brutalist、art deco、soft、industrial）から選ばせる。「どうせ良い感じに」という指示を原則禁止にし、代わりに「どの方向に良い感じか」を強制的に選ばせる。

---

## 4. デザインシステム適用時の AI Slop リスク

### 4-1. ガイドラインの詳細化 ≠ 個性の保存

Josh Cusick（UI 設計者）の論考「Design systems should do less」は本質的な指摘をしている。コンポーネントに次々と prop が追加されると「unwieldy and unusable for novel scenarios（扱いにくく、新規シナリオへの対応不能）」になる。「全体をコンポーネント化すると、デザインシステムチームがバグ修正とコンポーネント更新に忙殺され、イノベーションとコーチングに注力できなくなる。」

これをガイドライン策定に引き直すと: ルールが詳細すぎると AI はルールに従うことに注力し、ユーザーへの価値という本来の目標から離れる。「色は var(--color-primary) を使え」は機械的に強制できる。「このボタンが心地よいか」は強制できない。前者だけを整えると「Stylelint を通過するが魂のない UI」が生産される。

### 4-2. 既製デザインシステムの Slop 温床化

shadcn/ui・Material UI・Chakra UI 等の既製システムが悪いのではない。問題は「AI がこれらを最初の選択肢として使う」ことで全アウトプットが同じ基盤の上に乗ること、そして AI が既製システムに無い状況を処理しようとすると、より深い学習データの最頻値（さらに一般的なパターン）に回帰することである。

managed-code.com の定義が明快: 「AI slop means the design has no owner at the system level.」（AI Slop とはシステムレベルでデザインにオーナーがいないことを意味する。）shadcn/ui を使うこと自体は問題ではないが、AI に「shadcn/ui で作れ」と指示するだけでは誰も全体のデザインをオーナーしていない状態になる。

### 4-3. 「整ってはいるが刺さらない」UI の罠

UI/UX Pro Max の著者が使う表現: 「glossy-but-hollow aesthetic（光沢はあるが空虚な美学）」。これは機能的には問題なく、アクセシビリティも通過し、スタイルも一貫しているが、ユーザーの記憶に残らない UI を指す。

Bynder の研究が示す逆説: 「AI コンテンツと知らずに見せると 56% が好む」が「AI と認識した瞬間に印象が悪化する」。つまり客観的な出来の問題ではなく、「誰かが意図を持って作った」という信頼の問題である。道具サイトで信頼は特に重要であり、毎日使う道具が「AI 臭い」と感じられると離脱につながりやすい。

### 4-4. yolos.net 固有リスクの整理

yolos.net の特性（AI 自律運営、ツールサイト、毎日使う道具）に照らした固有リスク:

**リスク A: 規約遵守の強制と個性の消失が同時に起きる**

先行調査 R1 で整備を目指す Stylelint + Hook + DESIGN.md の 3 層強制は、「トークンから外れた値を書けない」状態を作る。これは CSS の一貫性を担保するが、「なぜそのトークンを使ったか」の意図は強制できない。全コンポーネントが `var(--color-primary)` を正しく使っても、レイアウトの選択・余白の感覚・インタラクションの設計が Slop 的であれば、規約遵守と Slop 量産は両立する。

**リスク B: ガイドラインの「良い例」が Slop のテンプレになる**

DESIGN.md に「良い例」として書いたコンポーネントコードをAI が繰り返しコピーした場合、サイト全体がそのパターンで埋め尽くされる。多様性が失われるという意味で、良質なガイドラインがSlop製造機になりうる。

**リスク C: 「毎日使う道具」としての記憶可能性の欠如**

「道具」として毎日使われるためには、ユーザーが「このサイト独自の使い心地」を認識する必要がある。視覚的個性が薄いと、機能的に等価な他のツールサイトと区別されず、Bookmarkに入らない、直接入力で訪れない、という状況になる。

---

## 5. 実在する議論・事例

### 5-1. OSS プロジェクト: anti-slop SKILL.md

GitHub リポジトリ `rand/cc-polymath` の `skills/anti-slop/SKILL.md` は Claude Code 向けの Slop 検出・除去スキル。コード・テキスト・デザイン別に具体的な禁止パターンと代替を列挙している。デザイン Red Flags として「汎用グラデーション背景」「目的なき glassmorphism」「コンテンツ構造を無視したテンプレートレイアウト」を列挙。

### 5-2. OSS プロジェクト: stop-the-slop

GitHub リポジトリ `jqbit/stop-the-slop` は Claude Code スキルとして実装されたフロントエンド向け Slop 防止ルール。硬コードされた禁止リスト（Inter タイプフェース、紫グラデーション、中央寄せヒーロー + 3カラムグリッド、frosted glass 効果）と 11 種の named aesthetic tone（brutalist, editorial, soft 等）による強制選択が特徴。

### 5-3. Taste Skill（tasteskill.dev）

7,000 GitHub スターを 2 ヶ月で獲得した Claude Code / Cursor 向けの anti-slop 設計フレームワーク。800 行の設計ルールを SKILL.md で注入。「Inter 禁止」「紫/青の AI 美学禁止」「中央寄せヒーロー禁止（DESIGN_VARIANCE 高の場合）」などを具体的に実装。DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY の 3 パラメーターで出力の方向性を制御する設計が特に参考になる。

### 5-4. Smashing Magazine: Intent Prototyping

2025年9月の記事「Intent Prototyping: The Allure And Danger Of Pure Vibe Coding in Enterprise UX」は vibe coding の構造的問題を具体的な失敗事例（テスト追跡アプリで異なるページ間のデータ整合性が壊れる）で示した。「意図を最も曖昧に表現することをvibe codingは促す」という批判は、AI によるUI生成にも直接適用できる。

### 5-5. 「tragedy of the commons」研究（The Decoder, 2025年）

開発者調査として AI 生成コードをソフトウェア開発における「共有地の悲劇」と位置づけた研究。個人は生産性を得るが、コードレビュー・OSS メンテナンス・技術的負債の解消は共同体がコストを負担する。curl プロジェクトが AI 生成の虚偽バグ報告に対応しきれずバグバウンティを停止した事例を記録。

### 5-6. デザイン業界の反応

Nielsen Norman Group は「AI はまだ UX デザインの準備ができていない」（2024年春時点）と評価しており、AI によるデザイン生成の限界を産業として認識している。2026年のデザイントレンドとして Envato が確認した「cognitive clarity over sensory richness（感覚的豊かさより認知的明快さ）」は、日常使いのツールサイトが目指す方向と一致する。

---

## 6. yolos.net デザインガイドライン策定に織り込む AI Slop 回避指針（複数案）

最終決定は PM と Owner が行う前提で、選択肢として提示する。各案は排他的ではなく組み合わせ可能。

---

### 指針案 A: 「禁止リスト」方式

**内容:** DESIGN.md の Do's and Don'ts セクションに、具体的な禁止パターンを明記する。

禁止例:

- Inter フォントを `font-family` の第一候補にすること（理由なく使う場合）
- 紫〜青グラデーションをボタン・ヘッダーに使うこと
- 3カラムフィーチャーグリッドを「とりあえず」の構成として使うこと
- `rounded-2xl` + `shadow-lg` + グラデーションテキストの組み合わせ
- 絵文字を装飾 bullet として使うこと
- loading / error / empty 状態を省略すること

**メリット:** 即効性が高い。Slop を生成しようとした AI が参照した時点で抑止できる。

**デメリット:** 「何を使うか」を定義していないため、禁止されていない別の Slop が生まれる。ルールの肥大化リスク。

---

### 指針案 B: 「Named Aesthetic Tone」方式

**内容:** yolos.net の UI 全体に一つの named tone を定義し、全ての生成指示にそのトーンへの参照を含める。

tone の例として: 「functional-minimal」（機能優先で装飾を最小限に絞る、道具の実直さを視覚化する）

tone の定義に含める項目:

- このトーンが意図する感情（例: 信頼・落ち着き・効率）
- このトーンが使う視覚要素（例: 整列された余白、控えめな境界線、主張しない色）
- このトーンが避ける要素（例: 感情的な装飾、主張するグラデーション）
- 参照できる既存プロダクトの例（例: Linear, Vercel Dashboard）

**メリット:** 「何を作るか」の意思決定空間を限定する。複数ルールより 1 つのトーンが AI には伝わりやすい。

**デメリット:** tone の定義が抽象的になりすぎると機能しない。参照事例の選定が重要。

---

### 指針案 C: 「理由の記録」方式

**内容:** 全てのデザイン決定に「なぜそうしたか」の理由を DESIGN.md に記録する。AI は理由のあるルールをより遵守する（先行調査 R1 確認済み）。さらに、理由の記録自体が「AI が同じ文脈で同じ判断をするための教師データ」になる。

記録フォーマットの例:

```
## ボタンのコーナー半径
値: var(--radius-sm) = 4px
理由: 道具としての実直さを表現するため、過度に丸くしない。
     `rounded-2xl` は「モダンさの演出」に見え、ツールサイトの文脈と合わない。
避ける: rounded-2xl、full（pill型）
```

**メリット:** ルールの背景を AI が理解できる。判断のブレを抑制する。長期的には yolos.net 固有の設計思想のドキュメントになる。

**デメリット:** 作成コストが最も高い。デザイン決定の都度記録する習慣が必要。

---

### 指針案 D: 「生成後レビュー rubric」方式

**内容:** 生成した UI を reviewer サブエージェントが評価する際に使う rubric（評価基準）を定義する。生成前のルールではなく、生成後の検証として機能させる。

rubric の項目例:

| 評価項目               | 問い                                   | 合格条件                                        |
| ---------------------- | -------------------------------------- | ----------------------------------------------- |
| 視覚的独自性           | どこかで見た UI ではないか             | 上記禁止リストのパターンが 0 件                 |
| インタラクション完成度 | loading/error/empty 状態が存在するか   | 該当する状態が全て実装されている                |
| コンテキスト適合性     | ツールサイトとして機能優先の設計か     | 装飾要素がユーザータスクに貢献しているか        |
| トークン準拠           | CSS カスタムプロパティが使われているか | ハードコード色・サイズが 0 件（Stylelint 確認） |
| 理由の確認             | デザイン判断に理由があるか             | 新規パターン追加時は理由を DESIGN.md に記録     |

**メリット:** 既存の reviewer サブエージェントのワークフローに追加するだけで導入できる。定量化可能な項目が多い。

**デメリット:** 生成後に発見されるため修正コストが発生する。「整ってはいるが刺さらない」という定性的問題は rubric で捉えにくい。

---

### 指針案 E: 「意図先行・小タスク」方式（ワークフロー改善）

**内容:** デザインガイドラインの内容より、UI 生成のワークフローを変える。具体的には、builder へのタスク指示に必ず以下を含める。

1. このコンポーネント/ページが解決するユーザータスクの 1 行説明
2. 使用可能なデザイントークンの参照先
3. 参照すべき類似コンポーネント（もし存在すれば）
4. 許容できない出力の例（できれば具体的に）

**メリット:** ガイドラインの整備より先に適用できる。タスクの粒度を小さく保つ効果もある。

**デメリット:** PM/planner がタスク記述に追加の工数をかける必要がある。

---

### 指針案の比較

| 案                      | Slop 抑止力            | 個性の保存             | 実装コスト | 既存ワークフローとの親和性 |
| ----------------------- | ---------------------- | ---------------------- | ---------- | -------------------------- |
| A: 禁止リスト           | 中（既知パターンのみ） | 低（代替が不明）       | 低         | 高（DESIGN.md に追記）     |
| B: Named Tone           | 高（方向性を定める）   | 高（tone が個性）      | 中         | 高（DESIGN.md に追記）     |
| C: 理由の記録           | 中〜高（文脈で抑止）   | 高（意図が積み重なる） | 高         | 低（記録習慣が必要）       |
| D: レビュー rubric      | 中（生成後検証）       | 中（定性評価が限界）   | 低〜中     | 高（reviewer に追加）      |
| E: 意図先行ワークフロー | 高（上流で防ぐ）       | 中（タスク依存）       | 中         | 中（planner の負担増）     |

---

## 7. 調査の限界と補足

- 「AI Slop」を定量的に測定する標準化された指標は 2026年4月時点で存在しない。評価は定性・定量のハイブリッドが実情。
- Taste Skill・stop-the-slop 等のツールは主に Tailwind CSS 環境を前提とする。yolos.net は vanilla CSS + CSS Modules 構成であり、Tailwind 固有のクラス名禁止ルールはそのまま適用できない。思想・考え方を参考にし、具体的なルールは翻案が必要。
- 「intentional imperfection」トレンド（手描き、フィルムグレイン等）はブランドサイトやポートフォリオに向いており、日常使いのツールサイトに直接適用するには慎重な判断が必要。
- 本レポートでは「コンテンツ Slop（ブログ記事）」と「UI/コード Slop」の両方を調査対象としたが、最終節の指針案は UI/コード Slop に絞っている。コンテンツ Slop については別途 `2026-03-29-article-writing-best-practices.md` 等を参照のこと。
