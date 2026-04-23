---
title: AIコーディングエージェントへのデザインシステム規約遵守強制 — 業界ベストプラクティスと事例調査
date: 2026-04-23
purpose: yolos.net のデザインガイドライン策定にあたり、AI エージェントが一貫したデザインシステムを守るための業界全般の手法・事例を把握する。rule-piling 回避策を含む。
method: >
  WebSearch（AI coding agents design system enforcement, rule piling anti-pattern, DESIGN.md OSS examples,
  CSS Modules design tokens stylelint, progressive disclosure AI agents, Claude Code hooks design enforcement）;
  WebFetch（tianpan.co, getdesign.md, github.com/VoltAgent/awesome-design-md,
  github.com/google-labs-code/design.md, code.claude.com/docs/en/hooks-guide,
  dev.to/mbarzeev/stylelint, dev.to/zetsubo CSS architecture AI agents 他）
sources:
  - https://tianpan.co/blog/2026-02-14-writing-effective-agent-instruction-files
  - https://dev.to/minatoplanb/i-wrote-200-lines-of-rules-for-claude-code-it-ignored-them-all-4639
  - https://dev.to/siddhantkcode/an-easy-way-to-stop-claude-code-from-forgetting-the-rules-h36
  - https://github.com/VoltAgent/awesome-design-md
  - https://github.com/google-labs-code/design.md
  - https://github.com/bergside/awesome-design-skills
  - https://code.claude.com/docs/en/hooks-guide
  - https://github.com/Dicklesworthstone/post_compact_reminder
  - https://github.com/AndyOGo/stylelint-declaration-strict-value
  - https://www.design-tokens.dev/guides/css-modules
  - https://dev.to/zetsubo/how-should-css-architecture-evolve-in-the-age-of-ai-coding-agents-317k
  - https://blog.jetbrains.com/idea/2025/05/coding-guidelines-for-your-ai-agents/
  - https://stackoverflow.blog/2026/03/26/coding-guidelines-for-ai-agents-and-people-too/
  - https://www.builder.io/blog/agents-md
  - https://yajin.org/blog/2026-03-22-why-ai-agents-break-rules/
  - https://medium.com/@martia_es/progressive-disclosure-the-technique-that-helps-control-context-and-tokens-in-ai-agents-8d6108b09289
  - https://aicodingrules.org/
---

# AIコーディングエージェントへのデザインシステム規約遵守強制 — 業界ベストプラクティスと事例調査

## 調査の文脈と前提

yolos.net は Next.js 15 + vanilla CSS + CSS Modules 構成で AI が自律運営するサイト。PM・planner・builder・reviewer 等の複数サブエージェントが協調して開発を行う。Tailwind 非採用。既に「CLAUDE.md へのルール積み重ね（rule piling）→ AI が全部無視する」という失敗パターンが観察されている。

本レポートは「業界全般でどのような手法が取られているか」「何が機能して何が機能しないか」を整理し、最終的に yolos.net 向けの選択肢を提示するものである。

---

## 1. AI コーディングエージェントへの規約強制手法の類型

### 1-1. プロンプト埋め込み系（ルールファイル）

**一般的手法**

AI エージェントに規約を守らせる最も基本的な手法は、プロジェクトルートに置くルールファイルへの記述である。ツールごとにファイル名が異なる。

| ファイル名                        | 対象ツール              | 役割                                                         |
| --------------------------------- | ----------------------- | ------------------------------------------------------------ |
| `CLAUDE.md`                       | Claude Code             | プロジェクト・ユーザー固有の指示                             |
| `AGENTS.md`                       | 汎用・GitHub Copilot 等 | エージェント向け規約の標準フォーマット（2026年に急速に普及） |
| `.cursorrules`                    | Cursor                  | Cursor 固有の規則ファイル                                    |
| `.junie/guidelines.md`            | JetBrains Junie         | Junie エージェント向けガイドライン                           |
| `.github/copilot-instructions.md` | GitHub Copilot          | Copilot 固有の指示                                           |
| `DESIGN.md`                       | ツール非依存            | デザインシステム専用ドキュメント（後述）                     |

Stack Overflow の調査（2026年3月）によれば、AI エージェント向けガイドラインは人間向けより「明示的・具体的・例示豊富」である必要がある。「AIはパターンで動く。直感がない」ため、曖昧な記述は機能しない。

**機能する書き方の特徴**

- 「なぜそうするか」の理由を添える（AI は理由があるルールをより遵守する）
- Bad/Good の対比例を示す（generation-time enforcement: 生成中に参照させる）
- 1 つのルールファイルで扱う領域を限定し、ファイルを分割する

**機能しない書き方**

- 抽象的な指針のみ（「一貫性を保て」等）
- ルールを列挙するだけで理由も例もない
- 150 指示を超えるルールファイル（後述 rule-piling 参照）

---

### 1-2. Rule Piling アンチパターン（現象と原因）

**現象**

Claude Code で 200 行のルールを書いたユーザーが「AI が全部無視した」と報告するケースは多数存在し、ドキュメント化されている（dev.to, github.com/anthropics/claude-code issues 等）。

**原因（実証的知見）**

- 言語モデルは「何をするか」を優先して処理し、「どうするか」のルールは後回しになる
- 指示カウントが増えるにつれて遵守率が単調に低下する（研究で確認）
- Claude Code の system prompt は約 50 指示を消費する → CLAUDE.md に書ける有効な指示は残り 100〜150 程度
- コンテキスト圧縮（compaction）時にルールが失われる
- 複数の急速なリクエストが来ると「ラッシュモード」になりプロセス遵守を省略する
- AI が自分でルールの例外判定を行い、自己判断でスキップする

**定量的目安（tianpan.co, 2026-02-14）**

- CLAUDE.md の目標行数: 40〜80 行
- 絶対上限: 100 行
- 超えた行のルールは実質的に無効と見なすべき

---

### 1-3. ツール実行前の自動チェック（Hook / 静的解析）

**一般的手法**

Claude Code の Hooks は「AI の意志に依存せず、コードとして強制する」最も信頼性の高い手法である。

主要な hook イベントと設計への応用:

| イベント                           | タイミング         | デザイン規約への使い方                              |
| ---------------------------------- | ------------------ | --------------------------------------------------- |
| `PostToolUse` (Edit\|Write マッチ) | ファイル編集後     | Stylelint を自動実行し CSS 違反を即時フィードバック |
| `PreToolUse` (Edit\|Write マッチ)  | ファイル編集前     | デザインシステムディレクトリへの書き込みを警告      |
| `SessionStart` (compact マッチ)    | コンテキスト圧縮後 | AGENTS.md / DESIGN.md の再読み込みを強制            |
| `Stop` (prompt type)               | AI が応答終了時    | デザイン規約チェックリストの確認を要求              |

**実装例: PostToolUse で Stylelint 自動実行**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | grep '\\.css$' | xargs npx stylelint --fix 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**post_compact_reminder パターン（GitHub: Dicklesworthstone）**

コンテキスト圧縮後に AGENTS.md を強制再読み込みさせるフック。SessionStart (compact) マッチで起動し、stdout にテキストを出力することでコンテキストに注入する。「STOP. You MUST: 1. Read AGENTS.md NOW 2. Confirm by briefly stating what key rules you found.」のような確認要求を使う。

---

### 1-4. 静的解析による物理的強制（Stylelint + Design Tokens）

**一般的手法（CSS Modules / vanilla CSS 環境向け）**

Tailwind 非採用環境で CSS の設計規約を機械的に強制するには Stylelint が最も有効である。

**stylelint-declaration-strict-value（npm パッケージ）**

指定した CSS プロパティが変数・関数・キーワードを使っているかを強制する。ハードコード色・サイズを禁止するのに直接使える。

```json
// .stylelintrc
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "background-color", "font-size", "border-radius"],
      {
        "ignoreVariables": true,
        "ignoreFunctions": false,
        "ignoreValues": ["transparent", "inherit", "currentColor", "none"]
      }
    ]
  }
}
```

この設定により、`color: #ff0000` のようなハードコード値は lint エラーとなり、`color: var(--color-text-primary)` への修正が求められる。

**Mavrin/stylelint-declaration-use-css-custom-properties**

CSS カスタムプロパティの使用を強制する別アプローチのプラグイン。プロジェクト独自のトークン名パターンに合わせた validation が可能。

**Mozilla での事例**

Mozilla は deprecated CSS variables から design token への移行を進める過程で、「カスタム Stylelint ルールで古い変数を使用した場合にエラーを出す」というアプローチを採用した（bugzilla.mozilla.org 事例）。

**dev.to「CSS Architecture in the Age of AI」が示した根本原則**

ルールを「覚えさせる」から「フィードバックシステム」へ転換すべき、という主張。エラーメッセージは「何が悪い」＋「どう直す」を含む prescriptive なものにする。AI はlint 出力をパースして自己修正する。人間も同じフローで修正する。アーキテクチャのコンバージェンスが自然に生じる。

---

### 1-5. コードレビュー自動化（別 AI によるレビュー）

**一般的手法**

Claude Code の agent-type hook を使い、コード変更後に別モデルがデザイン規約違反を検査するパターンが存在する（実験的機能）。

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Check if any CSS files modified in this session use hardcoded colors instead of CSS custom properties. Report violations with file path and line.",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

reviewer サブエージェントが builder の出力を検査するパターンは yolos.net でも既に採用されているが、デザイン規約の確認を明示的にチェックリスト化することで強化できる。

---

## 2. DESIGN.md / styleguide ファイルのパターン

### 2-1. DESIGN.md の誕生と位置づけ

DESIGN.md は 2025〜2026年に急速に普及したデザインシステム専用ドキュメントのフォーマット。Google Labs が仕様を公開（github.com/google-labs-code/design.md）。CLAUDE.md や AGENTS.md と並んで、デザイン専用のコンテキストを分離管理するためのファイル。

「.md プロトコル」の一環として、各ファイルがプロジェクトの異なる側面を担当する構造:

- `CLAUDE.md` / `AGENTS.md`: 全般的な作業規約・ワークフロー
- `DESIGN.md`: デザインシステム・UI 規約
- `SKILL.md`: 特定タスクの実行手順

### 2-2. DESIGN.md の構造（Google Labs 仕様）

ファイルは 2 層構造:

**YAML フロントマター（機械可読トークン）**

```yaml
---
version: alpha
name: "YourProject"
description: "Design system for YourProject"
colors:
  primary: "#0066FF"
  primaryHover: "#0052CC"
  textBase: "#1A1C1E"
  bgSurface: "#FFFFFF"
typography:
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    lineHeight: "1.5"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
rounded:
  sm: "4px"
  md: "8px"
  full: "9999px"
---
```

**Markdown ボディ（人間可読・セクション構造）**

Google Labs が定義した 8 セクション（推奨順）:

1. Visual Theme & Atmosphere（デザインの雰囲気・哲学）
2. Color Palette & Roles（色の意味と用途）
3. Typography Rules（フォント階層）
4. Component Stylings（ボタン・カード・入力フォーム等の状態含む仕様）
5. Layout Principles（スペーシング・グリッド）
6. Depth & Elevation（影・重なり）
7. Do's and Don'ts（ガードレール・アンチパターン）
8. Responsive Behavior（ブレークポイント・タッチターゲット）

### 2-3. 分量の目安

- DESIGN.md は CLAUDE.md より詳細で良い（CLAUDE.md はルートの 40〜80 行に抑え、DESIGN.md を参照先として使う）
- ただし AI が最初から全文を読む保証はないため、重要事項は先頭に置く
- Do's and Don'ts セクションに具体的な悪例・良例を入れることで、ルール列挙より高い効果が出る

### 2-4. OSS での参考事例

| リポジトリ                                                                                     | 説明                                                                                     |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [github.com/VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)       | Vercel, Stripe, Supabase, Notion, Linear 等 69 プロジェクトの DESIGN.md コレクション     |
| [github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md)         | Google Labs による DESIGN.md フォーマット仕様リポジトリ                                  |
| [github.com/bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) | Claude Code / Codex / Gemini 向けデザインスキル 70 種以上                                |
| [getdesign.md](https://getdesign.md)                                                           | DESIGN.md コレクションと生成ツール                                                       |
| [github.com/yzhao062/agent-style](https://github.com/yzhao062/agent-style)                     | AI 文体ルール 21 条（Bad/Good 例付き）。デザイン規約ではなく文体規約だが構造の参考になる |

---

## 3. デザイントークン管理による制約化

### 3-1. CSS Modules + vanilla CSS 環境でのトークン強制

**基本パターン: tokens.css + var() 参照**

```css
/* tokens.css（グローバル定義） */
:root {
  --color-primary: #0066ff;
  --color-primary-hover: #0052cc;
  --color-text-base: #1a1c1e;
  --color-bg-surface: #ffffff;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --radius-sm: 4px;
  --radius-md: 8px;
}
```

```css
/* Button.module.css（CSS Modules での参照） */
.button {
  background-color: var(--color-primary); /* OK */
  color: var(--color-text-base); /* OK */
  padding: var(--space-sm) var(--space-md); /* OK */
  border-radius: var(--radius-sm); /* OK */
  /* background-color: #0066FF; */ /* NG - stylelint がエラー */
}
```

**Stylelint による強制（CSS Modules 環境対応）**

```json
// .stylelintrc.json
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      [
        "/color$/",
        "background-color",
        "border-color",
        "font-size",
        "border-radius",
        "padding",
        "margin"
      ],
      {
        "ignoreVariables": true,
        "ignoreFunctions": ["var"],
        "ignoreValues": [
          "transparent",
          "inherit",
          "currentColor",
          "none",
          "0",
          "auto"
        ]
      }
    ]
  }
}
```

この設定で color/background-color 等のハードコードを自動検出し、CI/CD でブロックできる。

### 3-2. Style Dictionary による多環境対応

Style Dictionary はトークン定義（JSON/YAML）を CSS 変数・JS モジュール・その他プラットフォーム向けに一括変換するビルドシステム。

```json
// tokens/color.json
{
  "color": {
    "primary": { "value": "#0066FF" },
    "text": {
      "base": { "value": "#1A1C1E" }
    }
  }
}
```

これを変換すると:

- CSS: `--color-primary: #0066FF;`
- JS/TS: `export const colorPrimary = '#0066FF';`

**AI エージェントへの効果**: トークンの「唯一の正解ソース」を JSON で管理し、生成されるファイルは AI が変更できない（または CI でロールバックされる）ことで、ハードコードを物理的に排除できる。

### 3-3. TypeScript 型によるコンポーネント prop 制約

CSS Modules 環境でも、React コンポーネントの prop 型で使用できる値を制限することで、AIが任意の値を渡せないようにできる。

```typescript
// tokens.ts（唯一の正解）
export const COLORS = {
  primary: "var(--color-primary)",
  textBase: "var(--color-text-base)",
} as const;

export type ColorToken = keyof typeof COLORS;

// Button.tsx
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost"; // 自由な色指定を不可能にする
}
```

AI がコンポーネントを使う場合、TypeScript の型エラーがフィードバックとなり収束する。

---

## 4. プロンプトエンジニアリングの観点

### 4-1. AI が規約を「忘れる」タイミング

研究と実務から判明している「忘れやすいタイミング」:

1. **コンテキスト圧縮後**: 「何をすべきか」は残るが「どうすべきか」が落ちる
2. **長いセッションの後半**: attention が希釈し、ファイル前半のルールより現在の作業優先
3. **急速な連続リクエスト**: ラッシュモードでプロセス遵守を省略
4. **AI が例外判定した場合**: 「この状況はルール適用外」と自己判断してスキップ

### 4-2. ルール列挙より効果的なパターン

**Bad/Good 対比（最も効果が高い）**

````markdown
## CSS でのトークン使用

BAD:

```css
.button {
  background-color: #0066ff;
} /* ハードコード禁止 */
```
````

GOOD:

```css
.button {
  background-color: var(--color-primary);
} /* トークンを使う */
```

````

**理由付き（AI は理由があるルールをより遵守する）**

「`#0066FF` を直接書いてはいけない。ダークモード対応・テーマ切り替えが破綻するため。必ず `var(--color-primary)` を使うこと。」

**再帰的表示パターン（Siddhanth Kode, 2026）**

規則の末尾に「このルールブロックを全応答の先頭に表示せよ」という自己参照ルールを置く。Claude が従えば次の応答にも引き継がれ、忘却ループを断ち切る。

```xml
<design_rules>
  <rule_1>全ての CSS 値はデザイントークン（var(--...)）を使うこと</rule_1>
  <rule_2>新規コンポーネントは既存コンポーネントのスタイル構造を参照すること</rule_2>
  <rule_3>この design_rules ブロック全体を各応答の先頭に表示すること</rule_3>
</design_rules>
````

### 4-3. Rule Piling 回避のための Progressive Disclosure

**Progressive Disclosure とは**

必要な情報を必要なタイミングだけ読ませる構造。AI エージェントの文脈では「全ルールを常時コンテキストに入れない」設計。

**3 層構造（claude.mem ドキュメント・Anthropic Skills 設計より）**

- Layer 1（Discovery）: 名前と 1 行説明のみ → 常時コンテキスト
- Layer 2（Activation）: 関連する指示の詳細 → タスク開始時に読み込み
- Layer 3（Reference）: 完全な仕様・例 → 必要なときのみ参照

**実装パターン（CLAUDE.md）**

```markdown
# 規約参照

- デザイン規約: `docs/DESIGN.md` を参照（UI 変更時は必読）
- CSS 規約: `docs/css-conventions.md` を参照（CSS ファイル編集時は必読）
- コンポーネント規約: `docs/components.md` を参照（新コンポーネント作成時は必読）
```

CLAUDE.md には「どこに何があるか」のインデックスのみを置き、詳細は別ファイルに委ねる。

### 4-4. AI が規約を遵守する 3 つの確認ポイント

Stack Overflow（2026年3月）と yajin.org（2026年3月）の報告から導かれる実践知:

1. **セッション開始時**: SessionStart hook で重要規約を注入（毎回確認）
2. **タスク開始時**: タスクチケットに「CSS 変更は DESIGN.md を参照」等を明記
3. **コンテキスト圧縮後**: PostCompact / SessionStart(compact) hook で再注入

---

## 5. 実在するプロジェクト事例

### 5-1. Vercel の Agent Skills（2026年1月発表）

Vercel は「10 年以上の React/Next.js 最適化ルールをインストール可能なモジュールにまとめた」Agent Skills を 2026 年 1 月に発表。AI コーディングツールが「確率ベースのコード生成」から「ドメイン固有の制約に基づく生成」に移行するための新しいインフラ層と位置づけている。AI ツールが持っていたドメイン固有の制約不足という問題を解決するアプローチ。

### 5-2. awesome-design-md コレクション（VoltAgent, 2025〜）

Vercel, Stripe, Supabase, Notion, Linear, Raycast など 69 プロジェクトの DESIGN.md ファイルを収集。各ファイルには色・タイポグラフィ・コンポーネント仕様・Do's and Don'ts が含まれる。「Copy a DESIGN.md into your project, tell your AI agent 'build me a page that looks like this' and get pixel-perfect UI」という利用パターン。

### 5-3. agent-style（yzhao062, 2025〜）

Claude Code, Codex, Copilot, Cursor, Aider 向けの文体ルール 21 条。Bad/Good 例付きで提供。Canonical Rules（Strunk & White 等の古典から）と Field-Observed Rules（LLM 特有の失敗パターン）の 2 種に分類。Claude Opus と GPT-5.4 で 45% のスタイル違反削減を実証。

### 5-4. aicodingrules.org（2025〜）

ベンダー非依存の AI コーディングルール標準化プロジェクト。YAML + Markdown ハイブリッド形式でルールを定義し、以下の 6 原則を採用:

- 宣言的・人間可読
- モジュラー・コンポーザブル
- 階層的・上書き可能
- バージョン管理可能
- テスト可能・検証可能
- 拡張可能・ツール非依存

### 5-5. Mozilla の設計トークン移行（Bugzilla 事例）

Mozilla は古い CSS 変数から設計トークンへの移行プロジェクトで、deprecated 変数の使用を検出するカスタム Stylelint ルールを実装した。「古い変数を使ったら新しいトークンへの対応表とともにエラーを出す」という prescriptive なエラーメッセージが鍵。

---

## 6. yolos.net に推奨する方向性（複数案）

最終決定は PM と Owner が行う前提で、選択肢を提示する。各案は互いに排他的でなく、組み合わせ可能。

### 案 A: DESIGN.md 分離 + CLAUDE.md 軽量化

**構造**

```
CLAUDE.md（ルート、40〜60 行）
  └── "UI 変更時は docs/DESIGN.md を必読"
docs/
  DESIGN.md（デザイントークン・Do's and Don'ts・Bad/Good 例）
  css-conventions.md（CSS Modules 固有の規約）
```

**特徴**

- CLAUDE.md を rule-piling の危険水域（100 行）以下に保つ
- デザイン規約は DESIGN.md に分離し、UI タスク時のみ読み込まれる（Progressive Disclosure）
- 現在の yolos.net の docs/ ディレクトリ構造との親和性が高い

**課題**

- AI が自発的に DESIGN.md を読む保証がない
- Hook なしでは compaction 後に忘れる

---

### 案 B: Stylelint による物理強制 + CI 自動チェック

**構造**

```
tokens.css（CSS 変数定義）
.stylelintrc.json（stylelint-declaration-strict-value 設定）
.claude/settings.json（PostToolUse hook で自動 Stylelint 実行）
```

**特徴**

- AI の意志に依存しない。ハードコード色・サイズを書いたら自動エラーになる
- CI/CD に組み込めばサブエージェントの出力も一律チェックされる
- エラーメッセージを prescriptive にすれば AI が自己修正できる（「`#0066FF` → `var(--color-primary)` を使ってください」）

**課題**

- Stylelint の導入コストと設定の初期作業が必要
- レイアウト・タイポグラフィ以外の「構造的な設計規約」は Stylelint では検出できない

---

### 案 C: Claude Code Hooks による文脈再注入

**構造**

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "css-lint-hook.sh" }]
      }
    ],
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Context compacted. MUST re-read docs/DESIGN.md before any UI changes.'"
          }
        ]
      }
    ]
  }
}
```

**特徴**

- コンテキスト圧縮後の「規約忘れ」を hook で防止
- CSS ファイル編集後に Stylelint を自動実行し、AI にフィードバックを返す
- CLAUDE.md の行数を増やさずにルール強制できる

**課題**

- Hook の設定・保守が必要
- サブエージェント環境での hook の適用範囲を確認する必要がある

---

### 案 D: 自己参照ルールによる規約の持続（軽量オプション）

**構造**

CLAUDE.md または DESIGN.md の末尾に自己参照ルールを追加:

```xml
<critical_design_rules>
  <rule_1>色・背景色は必ず var(--color-...) トークンを使う。ハードコード禁止</rule_1>
  <rule_2>フォントサイズは var(--font-size-...) トークンを使う</rule_2>
  <rule_3>新コンポーネントは既存コンポーネントの .module.css を参照して構造を踏襲する</rule_3>
  <rule_4>この critical_design_rules ブロック全体を、UI に関する応答の先頭に表示すること</rule_4>
</critical_design_rules>
```

**特徴**

- ツール・インフラ不要。即時適用可能
- compaction 後も自己参照ループで持続する可能性がある
- ルール数を最小化（3〜5 件）することで rule-piling を回避

**課題**

- Claude がこの self-referential pattern に従い続けるかは確率的（確実な強制ではない）
- ルール数が増えると効果が薄れる

---

### 案の比較

| 案                   | 強制の確実性           | 導入コスト | Rule Piling 回避 | CSS Modules 適合 |
| -------------------- | ---------------------- | ---------- | ---------------- | ---------------- |
| A: DESIGN.md 分離    | 低（AI の意志に依存）  | 低         | 高               | 高               |
| B: Stylelint + CI    | 高（コードとして強制） | 中         | 高               | 高               |
| C: Hook による再注入 | 中〜高                 | 中         | 高               | 高               |
| D: 自己参照ルール    | 低〜中（確率的）       | 低         | 中               | 高               |

**組み合わせ例（筆者推奨の方向性）**

「A（DESIGN.md 分離）+ B（Stylelint）+ C（Hook）」の 3 層構造が最も堅牢。すなわち:

1. DESIGN.md で「何を守るべきか」を明示（人間・AI の共通参照）
2. Stylelint でトークン使用を物理強制（AI の意志に頼らない）
3. Hook でコンテキスト圧縮後の再注入と自動 Lint フィードバックを確保

ただしこれは実装コストが最大でもある。リソース制約があれば「A + B」または「B + C」から始め、段階的に追加することを推奨する。

---

## 7. 調査の限界と補足

- Tailwind v4 / shadcn/ui を前提とした事例が業界では多数存在するが、本レポートでは意図的に除外または注記した
- Claude Code の hook 仕様は 2025〜2026年に急速に更新されており、本レポートの hook イベント名は 2026 年 4 月時点のものであるが、将来変更される可能性がある
- Progressive Disclosure の効果はモデルのバージョンや使用状況によって異なる。実証的に測定しながら調整することが重要
- yolos.net のサブエージェント（planner/builder/reviewer）構成での hook 適用範囲については、R3 担当の Claude Code 固有仕様調査と照合する必要がある
