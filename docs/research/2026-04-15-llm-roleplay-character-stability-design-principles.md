# LLMロールプレイにおけるキャラクター安定性の設計原則

調査完了日: 2026-04-15

## 1. キャラクター崩れの主要因（ペルソナドリフト）

### 1-1. アテンション減衰によるドリフト

LLMのTransformerアーキテクチャは、コンテキスト長が伸びるにつれてシステムプロンプト冒頭へのアテンションウェイトが低下する。LLaMA2-7Bを用いた実証実験（Li et al., 2024 / arXiv:2402.10962）では、**8ターンの対話内でペルソナ自己一貫性が30%以上低下**することが確認された。これは yolos.net の既存知見（`docs/knowledge/2026-03-16-ai-agent-communication.md`「CLAUDE.mdの指示はセッションが長くなるほど強制力が低下する」）と完全に一致する。

### 1-2. ドリフトが特に起きやすいシナリオ

Anthropicの研究（Assistant Axis, 2025）およびペルソナ崩壊の分類研究（HuggingFace Blog, 2025）によると、以下7類型が確認されている：

| 崩壊タイプ                             | トリガー                                     | リスク                               |
| -------------------------------------- | -------------------------------------------- | ------------------------------------ |
| Type I: Epistemic Drift                | 哲学的・存在論的な問い（「本当にAI？」等）   | 状況認識の喪失、セラピー系用途で危険 |
| Type II: Recursive Contradiction       | 「fail」など単一ワードの再帰的トリガー       | ロールプレイの意図せぬ早期終了       |
| Type III: Ontological Inversion        | ユーザーのアイデンティティ分類失敗           | カスケード的崩壊                     |
| Type IV: Privacy Design Breakdown      | プライバシー原則違反（Gemini Pro 2.5で観察） | 法的コンプライアンスリスク           |
| Type V: Interpretive Misalignment      | 分析的質問の感情的解釈                       | 科学的・技術的用途での精度低下       |
| Type VI: Apology Reinforcement Cascade | 解決済みの問題への謝罪ループ                 | 会話効率の劣化                       |
| Type VII: Training Adequacy Concession | 基本機能への能力不足宣言                     | モデル信頼性の問題                   |

yolos.netのPMユースケースで特に注意すべきは Type I（哲学的問い）と、アジェンティックタスク特有の崩れ（次節参照）である。

### 1-3. アジェンティックタスクでのキャラクター崩れ

ツール呼び出しを伴うエージェント動作中は維持難度が上がる。研究（Talk Less, Call Right, 2025 / arXiv:2509.00482）で確認された問題：

- 存在しない関数を生成する
- 返答前に不要なツール呼び出しをする
- ツール呼び出し後の「タスク遂行モード」でキャラクター的な文体・判断軸が薄れる

---

## 2. システムプロンプト設計の原則

### 2-1. 粒度の設計

**研究の結論（2024-2025）**: ペルソナプロンプトの長さと効果は比例しない。長文ペルソナはLLMの一般能力（推論精度・MMLU）を低下させ、短いペルソナの方がダメージが少ない（Expert Personas研究, 2025）。

効果的な粒度の設計方針：

| 項目             | 書き方の原則                                                       |
| ---------------- | ------------------------------------------------------------------ |
| アイデンティティ | 名前・役割を冒頭に簡潔に（アテンション確保のため）                 |
| 価値観・動機     | 「〜が好き」「〜を気にしている」という**行動記述**で               |
| 口癖・文体       | 指示で書くのではなく、プロンプト自体をその文体で書いてモデルに示す |
| 禁止事項         | 明示的に「〜は絶対にしない」と記述（ネガティブアンカー）           |
| 事例             | Good/Bad両方の実例を含める                                         |

**最も重要な原則**: 「振る舞いのルールリスト」より「**価値観・動機の記述**」の方が安定性が高い。理由は、ルールはコンテキストに埋もれると無視されやすいが、キャラクターの「性格」は生成トークンが次の生成パターンに影響するため自己強化的に機能するためである。

### 2-2. プロンプトを「自分の声で書く」テクニック

Medium記事（On Persona Prompting, stunspot, 2026）の核心的なテクニック：**プロンプト本文自体をそのキャラクターの声で記述する**。これはプロンプトが「指示」と「例示」を同時に担い、非常に効率的にキャラクターを定着させる。

モデルはコンテキスト内のパターンを模倣する性質があるため、「穏やかで観察力のあるキャラクター」を作りたければ、システムプロンプト本文を穏やかで観察力のある文体で書く。「説明」より「実演」が確実に機能する。

### 2-3. 矛盾する指示の回避と優先順位の明示

OpenAIのガイドライン（Prompt Personalities, 2025）とAnthropicの公式ドキュメントが共通して推奨する2レイヤー分離：

- **システムレベルのパーソナリティ**（全セッションで一定のトーン・スタイル・判断軸）
- **タスク固有の出力フォーマット**（特定の作業時の書き方・長さ・構造）

タスク指示がパーソナリティ指示を上書きしないよう、階層と優先順位を明確化することが重要。「常に〜」という絶対的な指示が複数競合すると機能不全を起こしやすい。トレードオフが生じる状況では「X という状況では Y より Z を優先する」という形で具体的に書く。

---

## 3. キャラクター崩れへの対策テクニック

### 3-1. Post-History Instructions（ポストヒストリー指示）

会話履歴の後ろ、生成直前に短い「リマインダー」を挿入する手法。モデルのアテンションは直近のコンテキストに強く向くため、位置的に優位（Meganova Blog）。

- **50〜100トークン以内**に抑える（長いと100ターンで合計2万トークン消費）
- システムプロンプトの全コピーではなく、要点のみ
- 定型文例: "Remember: You are [name]. You always [positive trait]. You never [drift pattern]."

Claude Code の Output Styles は「all output styles trigger reminders for Claude to adhere to the output style instructions during the conversation」と公式ドキュメントに明記されており、この仕組みをシステムレベルで実装している。

### 3-2. ネガティブアンカー（否定的境界の明示）

「〜はしない」という否定例を含めることで、ドリフトの典型パターンを事前に封じる。典型的なアンカー例：

- 「汎用AIアシスタントとして返答しない」
- 「感情的な圧力に屈してキャラクターを破らない」
- 「過剰に謝罪しない」（Type VI Apology Cascade対策）
- 「技術的なタスク中でも同じ視点・言葉選びを保つ」

### 3-3. Good/Bad実例によるスタイル固定

Good例とBad例を両方提示することでモデルが許容範囲を理解する（latitude.so）。自分のユースケースに近い具体的なシナリオを用いること。汎用的な例より、「ツール呼び出し直後の返答」「エラー時の対応」など実際に発生するシチュエーションを選ぶ。

### 3-4. 文体のセルフリファレンシャル設計（パターン連鎖効果）

初期コンテキストで確立した文体・言葉の選び方は後続の生成に影響する。プロンプト設計者はこの特性を利用して冒頭で強くキャラクターの声を確立することで、長いセッションでも惰性でキャラクターが維持される。定期的な会話要約（古い履歴を要約に置き換える）でキャラクター定義の密度を保つことも有効（Ian Bicking, 2024）。

---

## 4. 「共通項目」と「分岐項目」の設計

### 4-1. 推奨アーキテクチャ：キャラクターSSoT + 分岐ガイド

| レイヤー                          | 内容                                                   | 変更頻度 |
| --------------------------------- | ------------------------------------------------------ | -------- |
| キャラクターSSoT                  | 価値観、判断軸、好き嫌い、口癖の原型、禁止事項         | 低       |
| 話し言葉ガイド（Output Styles）   | セッション中の返答スタイル、ツール呼び出し後の振る舞い | 中       |
| 書き言葉ガイド（blog-writing.md） | ブログ文体、NG表現、段落構成、読者への語りかけ方       | 中       |

Character.AIのPrompt Poet（2024）では、プロンプトを名前付きコンポーネントに分解する同様のアーキテクチャが採用されている。OpenAIのPrompt Personalities（2025）も「パーソナリティ（全体の振る舞い）」と「チャンネル別書き方コントロール」の2レイヤー分離を明示的に推奨している。

### 4-2. 分岐時の設計上の注意点

- 共通項目と分岐項目が矛盾しないようにする
- 分岐項目は「共通項目の同じ価値観を別の文体で表現する方法」として記述する（新たな価値観を追加しない）
- 両方のガイドに「相互参照リンク」を入れてメンテナンス時の整合性チェックを促す
- Claude Code Output Stylesの`keep-coding-instructions: true`フラグで「コーディング機能」と「パーソナリティ」の共存が可能

---

## 5. アンチパターン集

### AP-1: 過度な口癖・語尾指定

「語尾に必ず『〜だよ！』をつける」などの機械的な口癖指定。文脈と噛み合わず不自然になり、長いセッションで指示が薄れると消える。**代替**: 傾向を指定し、口癖は実例1〜2回のみ示す。

### AP-2: 曖昧な価値観記述

「常に誠実に行動する」など抽象的な価値観のみ。矛盾状況での判断がブレる。**代替**: 「新機能を提案するとき、まず『これで誰が喜ぶの？』と自分に問う」のように、具体的な行動シナリオとセットで記述する。

### AP-3: ルールの羅列

「〜すること」「〜してはならない」の大量列挙。相互矛盾が生じ、コンテキストが長くなるとアテンションが下がる（既存知見 `docs/knowledge/2026-03-16-ai-agent-communication.md` と一致）。**代替**: 少数の核となる価値観から行動が演繹されるよう設計する。

### AP-4: タスクモードとキャラクターモードの未分離

「技術的なタスク中はキャラクターを一時停止する」と読める指示。ツール呼び出し後にキャラクターに戻れなくなる。**代替**: 「ツールを使うときも、エラーが起きたときも、技術的な議論をするときも同じ視点・同じ言葉選びで反応する」と明示する。

### AP-5: 複数ペルソナの共存

「状況Aではキャラクターα、状況Bではキャラクターβ」の並列定義。LLMは中間状態の共存が苦手（既存知見と一致）。**代替**: 話し言葉・書き言葉はキャラクターSSoTから派生した独立した設定として別々に運用する。

### AP-6: 過剰なポジティブフィードバック要求

「常に励ます」「ネガティブなことを言わない」。Type VI（Apology Reinforcement Cascade）の温床。**代替**: 「正直に、でも建設的に。良い点も課題点も率直に言う。トーンは穏やか。」のように内容の誠実さとトーンを分離して指定する。

### AP-7: 長文のキャラクター説明文

数百〜数千トークンの背景説明。研究（Expert Personas, 2025）で一般能力への悪影響が確認済み。**代替**: コアな価値観・視点に絞り簡潔に記述する。

---

## 6. planner向け：設計原則の選択肢と前提条件

| 設計原則                               | 効果                                 | 前提・制約                                                   |
| -------------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| 価値観中心の記述                       | 長期的な安定性が高い                 | 価値観が具体的な行動と結びついて記述されている必要がある     |
| プロンプト自体をキャラクターの声で書く | 指示と例示を兼ねる                   | 設計者がキャラクターの声を事前に理解していること             |
| キャラクターSSoT + 分岐ガイドの分離    | メンテナンス性が高い                 | SSoTと分岐の関係が明確に定義されていること                   |
| ネガティブアンカーの明示               | ドリフトパターンを事前に封じる       | 主要なドリフトパターンを事前に識別していること               |
| Good/Bad実例の提供                     | 許容範囲を明確化する                 | 実際のユースケースに近い実例を用意できること                 |
| 過剰な口癖指定を避ける                 | 自然さを保つ                         | キャラクターの個性を口癖ではなく価値観・視点で表現できること |
| `keep-coding-instructions: true`       | コーディング機能と共存               | Claude Code Output Stylesの場合のみ適用                      |
| ツール呼び出し後の振る舞いを明示       | アジェンティックタスク中の崩れを防ぐ | どんな状況でもキャラクターは一貫していると明記すること       |

---

## 参考文献

- [Li et al. (2024). "Measuring and Controlling Persona Drift in Language Model Dialogs." arXiv:2402.10962](https://arxiv.org/html/2402.10962v1)
- [HuggingFace Blog (2025). "A Taxonomy of Persona Collapse in Large Language Models"](https://huggingface.co/blog/unmodeled-tyler/persona-collapse-in-llms)
- [Anthropic Research (2025). "The assistant axis: situating and stabilizing the character of large language models"](https://www.anthropic.com/research/assistant-axis)
- [Anthropic Docs (2025). "Prompting best practices"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Anthropic Docs (2025). "Output styles"](https://code.claude.com/docs/en/output-styles)
- [Character.AI Blog (2024). "Prompt Design at Character.AI"](https://blog.character.ai/prompt-design-at-character-ai/)
- [Meganova Blog (2024). "How to Use Post-History Instructions to Prevent Character Drift"](https://blog.meganova.ai/how-to-use-post-history-instructions-to-prevent-character-drift/)
- [stunspot (2026). "On Persona Prompting." Medium](https://medium.com/@stunspot/on-persona-prompting-8c37e8b2f58c)
- [OpenAI Cookbook (2025). "Prompt Personalities"](https://developers.openai.com/cookbook/examples/gpt-5/prompt_personalities)
- [Bicking, I. (2024). "Roleplaying driven by an LLM: observations & open questions"](https://ianbicking.org/blog/2024/04/roleplaying-by-llm)
- [latitude.so (2024). "How Examples Improve LLM Style Consistency"](https://latitude.so/blog/how-examples-improve-llm-style-consistency)
- [EchoMode (2024). "Persona Drift: Why LLMs Forget Who They Are." Medium](https://medium.com/@seanhongbusiness/persona-drift-why-llms-forget-who-they-are-and-how-echomode-is-solving-it-774dbdaa1438)
- [arXiv (2025). "Talk Less, Call Right: Enhancing Role-Play LLM Agents"](https://arxiv.org/html/2509.00482v1)
