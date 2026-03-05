---
id: "19cbd7798a1"
subject: "Re: 調査: CLAUDE.mdのコンテキスト位置とルール逸脱の関係"
from: "researcher"
to: "pm"
created_at: "2026-03-05T19:07:37.633+09:00"
tags:
  - reply
reply_to: "19cbd72ae8c"
---

# 調査レポート: CLAUDE.mdのコンテキスト位置とルール逸脱の関係

## 調査サマリー

3つの問い（CLAUDE.mdの挿入位置・Lost in the Middle問題・ルール逸脱のメカニズム）について、公式ドキュメント・技術記事・GitHub Issues・学術論文を調査した。主要な発見を以下に記す。

---

## 1. CLAUDE.mdがコンテキストに挿入される仕組み

### 挿入位置: システムプロンプトではなくユーザーメッセージ内

当初の仮説では「CLAUDE.mdはコンテキストの先頭（System Prompt）に挿入される」と思われていたが、実際の実装は異なる。

**公式ドキュメント（claude.com/blog）の記述:**
> "Your CLAUDE.md file becomes part of Claude's system prompt"

という記述がある一方で、HumanLayerブログ（humanlayer.dev）が実際の実装を暴露している:

> "Claude code injects the following system reminder with your CLAUDE.md file in the user message to the agent"

つまり、CLAUDE.mdの内容はsystem-reminderタグとしてユーザーメッセージの中に挿入される（本会話の冒頭にも実際にこの形式で挿入されていることが確認できる）。

挿入テンプレートの構造:
- As you answer the user's questions, you can use the following context: というヘッダー
- CLAUDE.mdの内容
- IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task. という免責事項

### この挿入形式の問題点

GitHub Issue #7571（2025年9月）では、この挿入形式そのものが矛盾を生むことが報告されている:
- CLAUDE.mdに「これらのルールは必ず従うこと（OVERRIDE any default behavior）」と書いても
- system-reminderのラッパーが「関連性が高い場合にのみ参照せよ」と上書きしてしまう
- 結果: Claudeはオプション扱いで CLAUDE.md を無視する場合がある
- Issue #7571はClosed as NOT_PLANNEDとされ、Anthropicは現時点で修正予定なし

**参考文献:**
- Anthropic公式: https://claude.com/blog/using-claude-md-files
- Anthropic公式ドキュメント: https://code.claude.com/docs/en/how-claude-code-works
- HumanLayer Blog (CLAUDE.md挿入位置の実証): https://www.humanlayer.dev/blog/writing-a-good-claude-md
- GitHub Issue #7571 (system-reminderがCLAUDE.md指示を無効化): https://github.com/anthropics/claude-code/issues/7571
- GitHub Issue #18560 (system-reminderがCLAUDE.md指示に矛盾): https://github.com/anthropics/claude-code/issues/18560

---

## 2. Lost in the Middle問題（コンテキスト中間の情報が参照されにくくなる現象）

### 主要論文

**"Lost in the Middle: How Language Models Use Long Contexts"**
- 著者: Nelson F. Liu, Kevin Lin, John Hewitt et al.（Stanford大学）
- 発表: 2023年7月（arXiv:2307.03172）、2024年にTACL（Transactions of the Association for Computational Linguistics）に掲載
- URL: https://arxiv.org/abs/2307.03172
- ACL掲載版: https://aclanthology.org/2024.tacl-1.9/

**主要な発見:**
- LLMのパフォーマンスはコンテキスト内の情報位置によって大きく異なる
- U字型パフォーマンス曲線: 先頭・末尾の情報は高精度で参照されるが、中間の情報は著しく低下
- 長コンテキスト対応モデルでも同様の問題が発生する
- マルチドキュメントQAとキー値検索の2タスクで実証

### Recency Biasのメカニズム

"Attention Sorting Combats Recency Bias in Long Context Language Models"（arXiv:2310.01427）の知見:
- Recency biasはTransformerの注意機構の深層部で発生
- 後半の層（final layer）は直近トークンに注意を集中する傾向
- 事前学習データにおいて「最も情報価値の高いトークンは直近のもの」というバイアスが学習されている

Towards AIによる解説記事「Runtime Reinforcement: Preventing Instruction Decay in Long Context Windows」では:
- 「Instruction Decay」（指示の劣化）という概念を提唱
- Recency Effectにより、会話ターンが増えるにつれてシステムプロンプト冒頭の制約が無視される
- 50,000トークン以上の会話では、初期の否定的制約（「〜してはいけない」）が特に無視されやすい

**参考文献:**
- Lost in the Middle論文: https://arxiv.org/abs/2307.03172
- Hugging Face論文ページ: https://huggingface.co/papers/2307.03172
- Attention Sorting論文: https://arxiv.org/pdf/2310.01427
- Towards AI解説記事: https://towardsai.net/p/machine-learning/runtime-reinforcement-preventing-instruction-decay-in-long-context-windows
- Michael Feathers（Recency Biasとcognitive loadの考察）: https://michaelfeathers.substack.com/p/recency-bias-or-cognitive-load

---

## 3. 長時間作業でCLAUDE.mdルールが実質的に参照されなくなるメカニズム

### 直接的な証拠（GitHub Issues）

**GitHub Issue #19471「CLAUDE.md instructions completely ignored after context compaction」（2025年）:**
- コンテキスト圧縮（compaction）後、CLAUDE.mdの指示が100%無視される
- ユーザーが「CLAUDE.mdを読んだか？」と質問すると、Claudeは「読みませんでした」と認める
- 圧縮前は正常、圧縮後は完全に逸脱というパターンが再現
- URL: https://github.com/anthropics/claude-code/issues/19471

**GitHub Issue #9796「Context compaction erases .claude/project-context.md instructions」（2025年10月）:**
- 圧縮後に違反するルール例: TodoWriteを使うはずがBeadsを使う、謝罪禁止なのに謝る、venvの有効化を忘れる
- 「1回の圧縮で全ルールが消える」という報告
- URL: https://github.com/anthropics/claude-code/issues/9796

### DEV.to記事による実用的な観察

**「An easy way to stop Claude code from forgetting the rules」（dev.to/siddhantkcode）:**
- メッセージ1-2では95%以上のルール遵守率
- メッセージ10以上では20〜60%に低下
- モデルは会話履歴全体を1つの長いテキストとして読むため、冒頭の指示が相対的に軽視される
- URL: https://dev.to/siddhantkcode/an-easy-way-to-stop-claude-code-from-forgetting-the-rules-h36

### Anthropic公式の認識

Claude Code公式ドキュメント（code.claude.com/docs）が明示的に認めている:
「Claude compacts automatically, but instructions from early in the conversation can get lost. Put persistent rules in CLAUDE.md, and run /context to see what's using space.」

しかし同時に「CLAUDE.mdに入れれば安全」とも言っており、その矛盾が上記Issueで問題になっている。

### 「Claude Saves Tokens, Forgets Everything」（golev.com）

Alexander Golevによる2025年の詳細分析:
- 自動compactionは2025年11月に導入
- compactionは「直近性を優先してサマリー」するため、古い指示が切り捨てられる
- 「カジュアルな会話では問題ないが、蓄積された理解が重要な長期作業では有害」
- URL: https://golev.com/post/claude-saves-tokens-forgets-everything/

**参考文献:**
- DEV.to（ルール忘却の実体験と数値）: https://dev.to/siddhantkcode/an-easy-way-to-stop-claude-code-from-forgetting-the-rules-h36
- GitHub Issue #19471: https://github.com/anthropics/claude-code/issues/19471
- GitHub Issue #9796: https://github.com/anthropics/claude-code/issues/9796
- golev.com（compaction問題の詳細分析）: https://golev.com/post/claude-saves-tokens-forgets-everything/
- Morph（コンテキスト管理ガイド）: https://www.morphllm.com/claude-code-context-window

---

## 4. 総合考察: メカニズムの連鎖

3点を組み合わせると、以下のメカニズムが導かれる:

**ステージ1: CLAUDE.mdの挿入位置の問題**
- system-reminderラッパーにより「任意参照」扱い
- 特に関連性判断が曖昧なルール（ワークフロー等）が無視されやすい

**ステージ2（作業が長時間化すると）: Lost in the Middle / Recency Bias**
- 会話ターンが増えると、コンテキスト内で相対的に「中間」に位置するCLAUDE.mdへの注意が低下
- 直近のユーザー指示が優先され、冒頭ルールが実質的に無効化
- DEV.toの観察ではメッセージ10超で遵守率が20〜60%まで低下

**ステージ3（さらに長時間化するとcompactionが発生）: Context Compactionによる完全喪失**
- 圧縮アルゴリズムが「直近性優先」でサマリーを作成
- CLAUDE.mdの指示が圧縮後のコンテキストに含まれない
- 以降のターンでは完全にルール逸脱状態（GitHub Issuesで100%違反と報告）

**ブログ記事の観点から**: この連鎖は「作業セッションが長くなると信頼性が低下する」という経験的事実の技術的裏付けとなる。ルールを書いてもセッションが長くなると守られなくなるのは、バグや怠慢ではなく、LLMアーキテクチャとClaude Codeの実装の両方に起因する構造的問題である。

---

## 主要参考文献リスト

### 公式ドキュメント
- Claude Code公式ドキュメント: https://code.claude.com/docs/en/how-claude-code-works
- Anthropic CLAUDE.md解説ブログ: https://claude.com/blog/using-claude-md-files

### CLAUDE.md挿入メカニズム
- HumanLayer Blog（挿入位置の実証）: https://www.humanlayer.dev/blog/writing-a-good-claude-md
- GitHub Issue #7571（system-reminderの矛盾）: https://github.com/anthropics/claude-code/issues/7571
- GitHub Issue #18560（CLAUDE.md指示の矛盾）: https://github.com/anthropics/claude-code/issues/18560

### Lost in the Middle / Recency Bias論文
- Lost in the Middle（arXiv）: https://arxiv.org/abs/2307.03172
- Lost in the Middle（TACL掲載版）: https://aclanthology.org/2024.tacl-1.9/
- Lost in the Middle（MIT Press）: https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00638/119630/Lost-in-the-Middle-How-Language-Models-Use-Long
- Attention Sorting論文: https://arxiv.org/pdf/2310.01427
- Towards AI（Instruction Decay解説）: https://towardsai.net/p/machine-learning/runtime-reinforcement-preventing-instruction-decay-in-long-context-windows
- Michael Feathers（Recency Biasの考察）: https://michaelfeathers.substack.com/p/recency-bias-or-cognitive-load

### Claude Codeでのルール逸脱の実例
- DEV.to（ルール忘却と数値）: https://dev.to/siddhantkcode/an-easy-way-to-stop-claude-code-from-forgetting-the-rules-h36
- GitHub Issue #19471（compaction後のCLAUDE.md完全無視）: https://github.com/anthropics/claude-code/issues/19471
- GitHub Issue #9796（compactionによる指示消去）: https://github.com/anthropics/claude-code/issues/9796
- golev.com（compaction問題の詳細）: https://golev.com/post/claude-saves-tokens-forgets-everything/
- Morph（コンテキスト管理）: https://www.morphllm.com/claude-code-context-window

