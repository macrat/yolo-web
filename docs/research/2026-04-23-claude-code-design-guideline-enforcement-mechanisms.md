---
title: Claude Code デザインガイドライン強制執行メカニズム調査
date: 2026-04-23
purpose: yolos.net プロジェクトにおいて、PM・builder・reviewer サブエージェントにデザインガイドラインを確実に遵守させるための Claude Code ネイティブ機構を調査し、推奨設計を提示する
method: |
  - Claude Code 公式ドキュメント（skills, hooks, sub-agents, best-practices, memory）を直接フェッチ
  - 独立系ブログ（blakecrosley.com, paddo.dev, mikhail.io, obviousworks.ch, humanlayer.dev）を調査
  - yolos.net の既存 .claude/ 構成（agents, hooks, skills, rules, settings.json）を直接確認
  - WebSearch で 2025–2026 年のコミュニティ事例を横断調査
sources:
  - https://code.claude.com/docs/en/skills
  - https://code.claude.com/docs/en/hooks-guide
  - https://code.claude.com/docs/en/hooks
  - https://code.claude.com/docs/en/sub-agents
  - https://code.claude.com/docs/en/best-practices
  - https://blakecrosley.com/blog/claude-code-organization
  - https://blakecrosley.com/blog/claude-code-hooks-tutorial
  - https://paddo.dev/blog/claude-skills-controllability-problem/
  - https://mikhail.io/2025/10/claude-code-skills/
  - https://www.obviousworks.ch/en/designing-claude-md-right-the-2026-architecture-that-finally-makes-claude-code-work/
  - https://www.humanlayer.dev/blog/writing-a-good-claude-md
---

# Claude Code デザインガイドライン強制執行メカニズム調査

## エグゼクティブサマリー

Claude Code には、ガイドラインを「読み物」として提示する仕組みと「強制実行」する仕組みが明確に分かれている。Skills と CLAUDE.md / rules は LLM への注意喚起（advisory）であり遵守は確率的にしか担保されない。一方、hooks は決定論的（deterministic）であり、設定されれば必ず発火する。yolos.net のデザインガイドライン強制には、この二層構造を前提とした設計が必要である。

---

## 論点 1: Skill をデザインガイドラインの置き場所に使う妥当性

### 結論

Skill はデザインガイドラインの「格納場所」として有効だが、「強制実行装置」にはなれない。「UI 変更前に必ず読まれる」という保証はない。ただし、サブエージェント定義の `skills` フィールドでプリロードすることで、サブエージェント起動時に確実にコンテキストへ注入できる。

### 前提（動く条件）

**明示的 `/skill-name` 呼び出し**: ユーザーまたはエージェントが `/design-guideline` と打てば確実に発火する。builder.md の指示文に「UI を触る前に `/design-guideline` を実行すること」と書き、かつ `disable-model-invocation: false`（デフォルト）にしておけば、Claude 自身が判断してロードする可能性はある。

**description 自動発火**: フロントマターの `description` と `when_to_use` フィールドに記述したキーワードが会話に出現したとき、Claude が自動的にスキルをロードする。ただしこれは LLM の意味的判断によるものであり決定論的ではない。`src/components` の編集、`.css` ファイルの変更、「デザイン」「色」「レイアウト」等のキーワードが引き金になりうるが、必ず発火するとは言えない。

**サブエージェントへのプリロード**: サブエージェント定義（`.claude/agents/builder.md` 等）の `skills` フィールドに `design-guideline` を列挙すると、そのサブエージェント起動時にスキルの全文がコンテキストに注入される。これはサブエージェントが自分でスキルを探す必要がないため、最も信頼性が高い方法。

### 注意点

- `disable-model-invocation: true` を設定すると Claude は自動ロードしなくなる。デザインガイドラインは自動ロードさせたいので `false`（デフォルト）のままにすること。
- `user-invocable: false` にするとスラッシュコマンドメニューから消える（Claude のみがロード可能になる）。
- スキルのフルコンテンツがコンテキストに入るのは呼び出し時のみ。description だけは常にコンテキストに存在するが本文は入らない。
- コンテキスト圧縮（compaction）が発生すると、スキル内容は最大 5,000 トークン・合計 25,000 トークンの予算内で再注入される。長大なガイドラインは圧縮後に失われる可能性がある。
- スキルを「読み物ドキュメント」として使うことは公式ドキュメントが明示的に推奨している（「Reference content」カテゴリ）。ただし設計思想として「行動を引き起こすコマンド」と「知識として参照する情報」は区別して設計することが推奨される。

### SKILL.md フロントマターのベストプラクティス

```yaml
---
name: design-guideline
description: |
  yolos.net のデザインガイドライン。src/components, src/app, *.css ファイルを
  編集するとき、または UI・デザイン・スタイル・レイアウト・色・タイポグラフィ
  について作業するときに必ず参照すること。
when_to_use: |
  - CSS Modules を編集するとき
  - 新しいコンポーネントを作成するとき
  - globals.css のトークンを変更するとき
  - デザインレビューを行うとき
user-invocable: false
---
```

`when_to_use` フィールドは `description` に追記される形でスキルリストに含まれ、Claude の自動発火判断に使われる。description + when_to_use の合計は 1,536 文字でカットされるため、前半に最重要キーワードを配置すること。

### Progressive Disclosure（段階的開示）

スキルのメインファイル（SKILL.md）は 500 行以内に収め、詳細は Supporting Files に分離する。

```
.claude/skills/design-guideline/
├── SKILL.md                    # 概要・クイックリファレンス（500行以内）
├── tokens.md                   # CSS変数トークン仕様
├── components.md               # コンポーネント設計パターン
└── examples/
    └── before-after.md         # 良い例・悪い例
```

SKILL.md 末尾で Supporting Files を参照させる:

```markdown
## 詳細リファレンス

- CSS変数トークンの完全な仕様は [tokens.md](tokens.md) を参照
- コンポーネント設計パターンは [components.md](components.md) を参照
```

---

## 論点 2: Hooks による強制

### 結論

PreToolUse hook は「UI 関連ファイルを編集しようとしたとき、先にデザインガイドラインを参照せよ」という差し戻しを実装できる。これは決定論的であり、`bypassPermissions` モードでも無効化できない唯一の強制手段。ただし、完全な「強制読み込み」より「警告と誘導」として設計するほうが実用的。

### 前提（動く条件）

**hook の発火タイミングとブロック機能**:

- PreToolUse hook は Edit・Write ツールの実行前に発火する
- exit code 2 で終了すると、stderr の内容が Claude へのフィードバックとしてツール呼び出しをブロックする
- `permissionDecision: "deny"` を JSON で返すことでもブロックできる
- ブロックは `bypassPermissions` モードでも有効（これが hooks の最大の強みである）

**ファイルパスの取得**:
stdin から JSON が渡され、`tool_input.file_path` で対象ファイルの絶対パスが取得できる。

```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/mnt/data/yolo-web/src/components/Button/Button.module.css",
    "old_string": "...",
    "new_string": "..."
  }
}
```

**サブエージェントへの適用**: hook はサブエージェントのツール呼び出しにも適用される。hook 入力に `agent_id` と `agent_type` フィールドが追加されるだけで、同じ設定が有効になる。

**設定場所**: `.claude/settings.json`（プロジェクト共有）に記述する。

### UI 関連ファイル検出スクリプトの例

```bash
#!/bin/bash
# .claude/hooks/check-design-guideline.sh

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# UI関連パターンのチェック
UI_PATTERNS=(
  "src/components/"
  "src/app/"
  ".module.css"
  "globals.css"
)

for pattern in "${UI_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    # デザインガイドラインの参照を促すメッセージを stderr に出力
    echo "デザインガイドラインを確認してください: /design-guideline を実行してから作業を再開してください。" >&2
    echo "対象ファイル: $FILE_PATH" >&2
    exit 2
  fi
done

exit 0
```

settings.json への登録:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-design-guideline.sh"
          }
        ]
      }
    ]
  }
}
```

### 注意点

**「差し戻し地獄」問題**: すべての UI ファイル編集をブロックすると、Claude が `/design-guideline` を呼び出した後も再度ブロックされる。一度スキルが呼び出されたかを判定する仕組みが必要。セッション内のフラグファイル（例: `/tmp/design-guideline-loaded`）を使うか、または「警告だけして続行させる（exit 0）」方式にすることを検討すること。実務的には「ブロックする」より「additionalContext でガイドラインのサマリーを注入する（exit 0）」のほうが運用しやすい。

**実用的な代替案**: exit 2 でブロックするのではなく、JSON の `additionalContext` でデザインガイドラインの要点を Claude のコンテキストに注入する方法。これはブロックしないが、毎回ガイドラインのキーポイントが Claude の視野に入る。

```bash
echo '{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "additionalContext": "UI編集時の注意: globals.css のCSS変数トークンを使用すること。新しい色・サイズ・スペーシングを直接ハードコードしないこと。詳細は /design-guideline を参照。"
  }
}'
```

**SessionStart hook**: セッション開始時に stdout に文字列を出力すると Claude のコンテキストに注入できる。デザインガイドラインの簡易サマリーを毎セッション冒頭に注入する用途に使える。ただし、毎セッション毎回読み込ませるとコンテキストを消費するため、UI 関連セッションに限定するなどの工夫が必要。

**UserPromptSubmit hook**: ユーザーのプロンプト送信時に発火。UI 変更に関するキーワードが含まれていた場合にガイドラインを注入する方式も可能だが、LLM によるキーワード判定は避け、単純な文字列マッチにとどめること。

**`permissions.deny` の利用**: lint スキップフラグなど特定の危険なコマンドパターンを物理的に禁止できる。デザイン違反を引き起こすような特定のファイル編集（例: `globals.css` の CSS 変数を削除する）を防ぐ用途には適用困難（内容レベルの検査が必要なため）。

---

## 論点 3: サブエージェント定義への組み込み

### 結論

サブエージェント定義に「UI 変更時は `/design-guideline` を必ず読め」と書くことは有効だが、効果は「advisory（推奨）」の範囲にとどまる。`skills` フィールドによるプリロードのほうが確実性が高く、サブエージェントの system prompt への記述と組み合わせるのが最善。

### 前提（動く条件）

**`skills` フィールドによるプリロード**: builder.md に以下を追加すると、builder サブエージェントが起動した瞬間に design-guideline スキルの全文がコンテキストに注入される（ただし `disable-model-invocation: true` のスキルはプリロード不可）。

```yaml
---
name: builder
skills:
  - design-guideline
---
```

この方法は「スキルを探す」という行動自体が不要になるため、最も信頼性が高い。

**System prompt への記述**: builder.md や reviewer.md の本文（system prompt 部分）に「`src/components/**` や `*.css` を編集する前に、必ず `/design-guideline` スキルを確認すること」と明示する。LLM はこれを system prompt として受け取るため、通常の会話コンテキスト内の指示より権威がある。

**hooks はサブエージェントにも効く**: `.claude/settings.json` に設定された hooks は、PM や builder などすべてのサブエージェントのツール呼び出しに対しても発火する。サブエージェント専用の hooks を設定する場合は、サブエージェント定義の YAML フロントマターの `hooks` フィールドを使う。

### 注意点

- サブエージェントは親会話からスキルを継承しない。`skills` フィールドに明示的に列挙する必要がある。
- サブエージェントが起動時にプリロードされたスキル内容は、コンパクション時に再注入される（5,000 トークン / スキルの制限あり）。
- description や system prompt に書かれた指示は、コンテキストが長くなると埋もれる可能性がある。プリロードとの組み合わせで対策する。

---

## 論点 4: CLAUDE.md / rules ファイルパターン

### 結論

CLAUDE.md は「プロジェクト全体に通じる、変わらない原則」だけを書く場所。デザインガイドラインの詳細を CLAUDE.md に書くのは「rule piling」の典型的な失敗パターン。正しいアーキテクチャは、CLAUDE.md から `@` 参照でリンクし、詳細を rules ファイルまたは skills に分離すること。

### 前提（動く条件）

**CLAUDE.md の `@` インポート構文**: `@docs/design-concept.md` や `@.claude/skills/design-guideline/SKILL.md` の形式で外部ファイルを参照できる。CLAUDE.md 本文には「デザインガイドラインの詳細は `@.claude/skills/design-guideline/SKILL.md` を参照」のような一行を入れるだけでよい。

**`.claude/rules/` ディレクトリ**: paths グロブが設定できる。`paths: - src/**/*` のように記述すると、src 以下のファイルを扱うときだけロードされる。yolos.net では既に `coding-rules.md` がこのパターンで実装されている。デザインガイドラインも `paths: - src/**/*.css\n- src/components/**/*\n- src/app/**/*` のような絞り込みで rules ファイルとして配置できる。

**CLAUDE.md の適正サイズ**: 研究者とプラクティショナーの一致した知見によると、200〜300 行を上限とすること。yolos.net の現状（30 行）は理想的。デザインガイドラインは CLAUDE.md に加筆するのではなく、別ファイルに切り出す。

### 注意点

**Rule piling の症状**: Claude が繰り返し同じルールを破る場合、CLAUDE.md が長すぎて指示が埋もれている可能性が高い。対処法は削減であり、追加ではない。

**Progressive disclosure の設計例（yolos.net 向け）**:

```
CLAUDE.md（30行・現状維持）
  └── @docs/constitution.md（参照のみ）

.claude/rules/
  ├── coding-rules.md（src/**/* に適用・現状維持）
  └── design-guideline.md（src/components/**, src/app/**, *.css に適用・新設）

.claude/skills/design-guideline/
  ├── SKILL.md（overview、500行以内）
  ├── tokens.md（CSS変数詳細）
  └── components.md（コンポーネントパターン）
```

rules ファイルは CLAUDE.md と異なり paths フィルタで lazy-load されるため、関係ないタスクではコンテキストを消費しない。

---

## 論点 5: 他者の事例

### 結論

2025〜2026 年のコミュニティ知見は「hooks が唯一の決定論的手段」「CLAUDE.md は 200 行以下」「skills は contextual な知識格納庫」という方向で収束している。デザインシステムの強制事例はまだ成熟していないが、coding standards 強制（lint チェック、commit 前検証）の hooks パターンは広く実用化されている。

### 主な事例

**Blake Crosley（139 個の拡張機能の整理研究）**: Rules（常時適用・200行以下）/ Skills（文脈適用・サイズ制限なし）/ Commands（明示的呼び出し）の三層分離を推奨。設計ガイドラインは「domain-specific knowledge = Skills」として分類し、rules には入れない。

**paddo.dev（Skills の制御可能性問題）**: description ベースの自動発火は「LLM の意味的推論に依存するため非決定論的」と指摘。デザイン基準など「必ず守られなければならないルール」には hooks を使うべきとしている。

**HumanLayer（CLAUDE.md ベストプラクティス）**: LLM が安定して従える指示は 150〜200 程度（Claude Code のシステムプロンプト分を引くと 100〜150）。それ以上は全体的な指示品質の低下を招く。

**Obviousworks.ch（2026 年アーキテクチャ）**: CLAUDE.md〜SKILLS の 5 層スコープ（Global / Project / Local / Folder / Skills）で progressive disclosure を実現。「CLAUDE.md は 70% 遵守、hooks は 100% 強制」という二層構造を明示。

**公式 Anthropic ドキュメント**: "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens."（[Best Practices](https://code.claude.com/docs/en/best-practices)）

---

## yolos.net への推奨設計（複数案）

### 前提条件の整理

- 既存構成: rules/coding-rules.md（paths: src/\*_/_）、hooks 3 本（pre-commit-check.sh、pre-push-check.sh、block-destructive-git.sh）、builder.md に `skills` フィールドなし
- 問題: UI 変更時にデザインガイドラインが読まれる保証がない
- 技術スタック: Next.js 15 + CSS Modules + globals.css トークン（Tailwind 非採用）

---

### 案 A: Skills のみ（最小変更・低コスト）

**変更内容**:

1. `.claude/skills/design-guideline/SKILL.md` を新設（デザインガイドライン全体）
2. `builder.md` と `reviewer.md` の `skills` フィールドに `design-guideline` を追加
3. `builder.md` の system prompt に「UI 関連ファイルを変更するときは `design-guideline` スキルの内容を参照すること」を追記

**トレードオフ**:

- 利点: 実装が簡単・既存の hooks や rules を変更しない・コンテキスト消費が比較的少ない
- 欠点: 「プリロードはされるが読まれる保証はない」という限界がある。コンパクション後に失われる可能性がある。「忘れる」リスクはゼロではない。

**適合シーン**: デザインガイドラインの「参照機会を増やす」ことが目的で、完全な強制は求めない場合。

---

### 案 B: Hooks による差し戻し警告（中程度の強制・中コスト）

**変更内容**:

1. `.claude/skills/design-guideline/SKILL.md` を新設
2. `.claude/hooks/check-design-guideline.sh` を新設（UI 関連ファイルへの Edit/Write を検出して `additionalContext` でガイドライン要点を注入）
3. `.claude/settings.json` の hooks に追加
4. `builder.md` に `skills: [design-guideline]` を追加

**hook の動作（警告モード）**: exit 2 でブロックせず、JSON で `additionalContext` にデザインガイドラインのキーポイント（200 文字程度）を返す。Claude は毎回 UI ファイルを触る前にこのコンテキストを見た上で作業する。

**トレードオフ**:

- 利点: 決定論的にコンテキストが注入される・Claude の作業を止めない・サブエージェントにも効く
- 欠点: hook スクリプトの保守が必要・`additionalContext` は全ガイドラインではなくサマリーのみ（詳細はスキル参照）

**適合シーン**: 「必ず見せる」ことは保証したいが、「差し戻しによる作業停滞」は避けたい場合。yolos.net の現状に最も適合する可能性が高い。

---

### 案 C: Skills + Rules + Hooks の三層組み合わせ（高信頼・高コスト）

**変更内容**:

1. `.claude/skills/design-guideline/SKILL.md` を新設（詳細ガイドライン・Supporting Files あり）
2. `.claude/rules/design-guideline.md` を新設（paths: `src/components/**/*`, `src/app/**/*.css`, `src/app/globals.css`）- 5〜10 行の必須ルールのみ記載
3. `.claude/hooks/check-design-guideline.sh` を新設（警告モードまたは差し戻しモード）
4. `builder.md` と `reviewer.md` に `skills: [design-guideline]` を追加
5. CLAUDE.md には「デザインガイドラインは `.claude/skills/design-guideline/SKILL.md` に定義されている」という 1 行のみ追記（詳細を書かない）

**三層の役割分担**:

- rules: 「Tailwind クラスを使わない」「CSS 変数を直接上書きしない」等のハードルール（5〜10 行）。paths でフィルタされ、関連ファイルを触るときだけロードされる
- skills: ガイドライン全体（デザイントークン、コンポーネントパターン、Before/After 例）。builder/reviewer にプリロードされる
- hooks: additionalContext でキーポイントを注入（毎回確実に視野に入る）

**トレードオフ**:

- 利点: 三層が互いを補完し、単一障害点がない・rules で「絶対ルール」のみを強制・skills で「文脈知識」を提供・hooks で「注意喚起」を保証
- 欠点: 設定ファイルが複数に分散して保守コストが上がる。rules と skills の内容が重複しないように管理が必要

**適合シーン**: デザインガイドラインの重要性が高く、builder や reviewer が今後も増える予定がある場合。yolos.net の長期運用に最も向いている。

---

### 案 D: Hooks による強制ブロック（最強制・高摩擦）

**変更内容**: 案 C に加えて、hook を exit 2 ブロックモードにする。スキルがロード済みの場合のみ通過させる（フラグファイル `/tmp/design-guideline-loaded` で管理）。

**トレードオフ**:

- 利点: 「スキルを読まずに UI を触る」ことが物理的に不可能になる
- 欠点: builder が `/design-guideline` を呼び出してもフラグ管理のロジックが複雑になる。hook スクリプトのバグが作業を完全停止させる危険がある。摩擦が高く、デバッグが困難。

**適合シーン**: ガイドライン違反が深刻な問題を繰り返し引き起こしている場合のみ。現状の yolos.net では過剰設計になる可能性が高い。

---

## 各案の比較表

| 観点                    | 案 A（Skills のみ） | 案 B（Skills + Hooks 警告） | 案 C（三層組み合わせ） | 案 D（Hooks 強制ブロック） |
| ----------------------- | ------------------- | --------------------------- | ---------------------- | -------------------------- |
| 実装コスト              | 低                  | 中                          | 高                     | 高                         |
| 保守コスト              | 低                  | 中                          | 中-高                  | 高                         |
| 遵守の確実性            | 確率的              | 高い（決定論的注入）        | 高い（三層）           | 最高（物理的強制）         |
| 作業摩擦                | 低                  | 低                          | 低-中                  | 高                         |
| サブエージェント対応    | プリロードで対応    | hooks で対応                | 両方で対応             | 両方で対応                 |
| コンパクション耐性      | 中（再注入あり）    | 高（hooks は毎回発火）      | 高                     | 高                         |
| 現状 yolos.net との適合 | 高                  | 高                          | 高                     | 低                         |

---

## 実装上の注意事項（全案共通）

1. **CLAUDE.md は現状維持**: 30 行という現在の規模は理想的。デザインガイドラインの詳細を CLAUDE.md に加筆しないこと。

2. **スキルの `disable-model-invocation`**: `false`（デフォルト）にしておくこと。`true` にするとサブエージェントへのプリロードもできなくなる。

3. **hooks のデバッグ**: hook が動作しない場合は `/hooks` コマンドで登録確認、`--debug-file /tmp/claude.log` でログ確認。matcher は大文字小文字を区別する（`"Edit|Write"` が正しく `"edit|write"` は効かない）。

4. **hooks はサブエージェントにも効く**: これが hooks の最大の強み。PM が設定した `.claude/settings.json` の hooks は builder・reviewer を含む全サブエージェントに適用される。

5. **スキルのプリロード制約**: `disable-model-invocation: true` のスキルはプリロードできない。design-guideline スキルには設定しないこと。

6. **`context: fork` を使わない**: デザインガイドラインスキルは inline で実行させる。`context: fork` にするとサブエージェントに isolated で実行され、メイン会話のコンテキストに反映されない。

---

## 最終的な実装優先順位の推奨

最終決定は PM と Owner が行うが、調査結果から以下の観点を提示する。

「デザインガイドラインの遵守を確実にしたい」というニーズに対し、**案 B（Skills + Hooks 警告モード）** が yolos.net の現状規模・運用体制に最もバランスがよい。設計の核心は「hooks は必ず発火する、skills はコンテキストに注入される、その二層で互いの限界を補完する」という組み合わせ。

案 C（三層）は長期的に目指す状態として適切だが、まず案 B を導入して運用知見を得てから段階的に rules レイヤーを加えることを推奨する。案 D（強制ブロック）は現時点では過剰であり、ガイドライン違反が深刻な問題になってから導入を検討すればよい。
