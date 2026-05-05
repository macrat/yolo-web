---
title: Anthropic 公式デザインスキルの実態調査 — ファイル内容・構造・運用パターンの深掘り
date: 2026-04-23
purpose: yolos.net の /design-guideline Skill 設計に向けて、Anthropic 公式の frontend-design スキルをはじめとするデザイン関連スキルの実ファイル内容・フロントマター仕様・コミュニティ事例を詳細に把握し、再現可能な実装パターンを抽出する
method: |
  - WebFetch で anthropics/skills の frontend-design SKILL.md・canvas-design SKILL.md・brand-guidelines SKILL.md の raw ファイルを直接取得
  - WebFetch で anthropics/claude-code の plugins/frontend-design の README・SKILL.md を取得
  - WebFetch で code.claude.com/docs/en/skills（公式スキル仕様ドキュメント）を全文取得
  - WebFetch で code.claude.com/docs/en/plugins を全文取得
  - GitHub PR #210（frontend-design 改善）の内容を調査
  - WebSearch でコミュニティのデザインスキル事例（triptease、interface-design、design-loop、cuellarfr/design-skills 等）を横断調査
  - WebFetch で各コミュニティリポジトリの実ファイルを取得
  - WebSearch で失敗事例・教訓の記事を調査
sources:
  - https://raw.githubusercontent.com/anthropics/skills/refs/heads/main/skills/frontend-design/SKILL.md
  - https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
  - https://github.com/anthropics/skills/tree/main/skills
  - https://github.com/anthropics/skills/pull/210
  - https://code.claude.com/docs/en/skills
  - https://code.claude.com/docs/en/plugins
  - https://github.com/triptease/claude-skill-design-system
  - https://github.com/Dammyjay93/interface-design
  - https://github.com/jezweb/claude-skills/blob/main/plugins/frontend/skills/design-loop/SKILL.md
  - https://github.com/cuellarfr/design-skills
  - https://impeccable.style
  - https://medium.com/@julian.oczkowski/7-claude-code-design-skills-that-follow-a-real-design-process-b871b8673d05
  - https://medium.com/design-bootcamp/a-designers-guide-to-organizing-ai-skills-and-tools-in-claude-code-f87477c35b82
---

# Anthropic 公式デザインスキルの実態調査 — ファイル内容・構造・運用パターンの深掘り

## エグゼクティブサマリー

本レポートは、先行調査 R3・R4 が押さえた「仕組み論」を補完する形で、**実ファイルの中身**に集中して調査したものである。Anthropic 公式の `frontend-design` スキルの SKILL.md 全文を raw ファイルとして確認した。フロントマターは `name`・`description`・`license` の 3 フィールドのみで、Claude Code 固有の `allowed-tools` や `disable-model-invocation` は**使っていない**。これは重要な発見であり、公式スキルがシンプルな構造を採用していることを示す。コミュニティ事例では、より複雑なデザイン規約強制のパターンが実用化されている（Triptease の design-system スキル、interface-design の探索フロー強制等）。yolos.net の `/design-guideline` スキルへの応用については末尾に示す。

---

## 1. Anthropic 公式 frontend-design スキルの実ファイル内容

### 1-1. ファイルの在処と構造

公式スキルは 2 つのリポジトリに存在する:

- `anthropics/skills` リポジトリ: `skills/frontend-design/SKILL.md` + `LICENSE.txt`（2 ファイルのみ）
- `anthropics/claude-code` リポジトリ: `plugins/frontend-design/` 配下（`.claude-plugin/`・`skills/frontend-design/SKILL.md`・`README.md`）

`anthropics/skills` は Agent Skills 標準のリファレンス実装。`anthropics/claude-code` は Claude Code の Marketplace Plugin として配布されるバージョン。両者の `SKILL.md` 内容はほぼ同一であることを raw ファイル取得で確認した。

`anthropics/skills` 全スキル一覧（2026 年 4 月時点、デザイン関連を含む）:

```
algorithmic-art/
brand-guidelines/
canvas-design/
claude-api/
doc-coauthoring/
docx/
frontend-design/
internal-comms/
mcp-builder/
pdf/
pptx/
skill-creator/
slack-gif-creator/
theme-factory/
web-artifacts-builder/
webapp-testing/
xlsx/
```

デザイン関連は `frontend-design`・`canvas-design`・`brand-guidelines`・`algorithmic-art`・`theme-factory` の 5 つ。

### 1-2. frontend-design SKILL.md の実全文

raw ファイルを直接取得して確認した全文は以下の通り:

**フロントマター（YAML）:**

```yaml
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---
```

フィールドは `name`・`description`・`license` の **3 つのみ**。`allowed-tools`・`disable-model-invocation`・`user-invocable`・`when_to_use`・`context`・`agent` などの Claude Code 拡張フィールドは一切使っていない。これは Agent Skills 標準（`agentskills.io`）の最小仕様に準拠した書き方であり、Claude Code 非依存のクロスプラットフォーム互換を意識した構造である。

**本文構造（章立て・分量）:**

本文は約 30〜35 行。章は 2 節:

- `## Design Thinking`（7 項目）
- `## Frontend Aesthetics Guidelines`（5 箇条 + NEVER 節 + IMPORTANT 節）

本文全体を再現する（改行等のニュアンスも含む）:

---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

**## Design Thinking**

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. ...
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

**## Frontend Aesthetics Guidelines**

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices...
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML...
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors...

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

...

**IMPORTANT**: Match implementation complexity to the aesthetic vision...

---

**設計上の特徴（実ファイルから判明した事実）:**

1. **supporting files なし**: `references/`・`assets/`・`examples/` ディレクトリが存在しない。単一の SKILL.md のみ
2. **進歩的開示（Progressive Disclosure）なし**: 本文が 1 ファイルに完結している。詳細ファイルへの参照リンクも存在しない
3. **フレームワーク非依存**: 「HTML/CSS/JS, React, Vue, etc.」と列挙。CSS Modules・Tailwind の区別がない
4. **DO/DON'T 構造を採用**: `NEVER` 節と `CRITICAL` 節で強調。肯定的指示と否定的指示を対比
5. **description は目的語を多く含む**: 「when the user asks to build web components, pages, artifacts, posters, or applications...」と具体的なユースケースを列挙して自動発火を誘導

### 1-3. PR #210 — frontend-design スキルの改善の教訓

GitHub PR #210（Improve frontend-design skill clarity and actionability）の内容:

- **問題**: 「他の世代と重複する選択肢を絶対に避けろ」「同じデザインであってはならない」という指示が不正だった。各会話は独立しており、モデルは過去の生成物を参照できないため、実行不可能な指示だった
- **修正**: クロスセッション認識を前提とした指示を削除、NEVER ガイダンスとペアになる「INSTEAD ブロック」を追加
- **検証**: 50 プロンプトで評価。Haiku で 8-2、Sonnet で 7-3、Opus で 6-4（全体 75% 改善）
- **重要な発見**: 改善効果は小さいモデルほど大きい。「Opus は曖昧な指示でも対応できるが、Haiku は明確な指示から大きく恩恵を受ける」

**yolos.net への示唆**: スキルの指示は「モデルがどの情報にアクセスできるか」を理解した上で書く必要がある。「過去のサイクルで使った色と違う色にせよ」「前回のコンポーネントを参考にせよ」という指示は実行不可能（会話が独立しているため）。指示は「globals.css の CSS 変数を参照せよ」「既存ファイルを Read で確認せよ」など実行可能な行動に変換する。

### 1-4. canvas-design と brand-guidelines の比較

**canvas-design SKILL.md フロントマター:**

```yaml
---
name: canvas-design
description: Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.
license: Complete terms in LICENSE.txt
---
```

**本文の特徴（canvas-design）:**

- 2 フェーズの順序が明示的: (1) Design Philosophy Creation → (2) Canvas Expression
- 「Movement name（1-2 words）」「4-6 paragraphs」という**定量的な指示**がある
- フォントは `./canvas-fonts` ディレクトリを参照（supporting files の実用例）
- 「Rather than adding more graphics; instead refine what has been created and make it extremely crisp」という精錬優先のディレクティブ

**brand-guidelines SKILL.md フロントマター:**

```yaml
---
name: brand-guidelines
description: （Anthropic のブランド規約を artifacts に適用する旨の説明）
license: Complete terms in LICENSE.txt
---
```

**本文の特徴（brand-guidelines）:**

- 色パレットを具体的に指定: `dark (#141413)`・`light (#faf9f5)`・`mid gray (#b0aea5)`等
- タイポグラフィ指定: Poppins（見出し 24pt 以上）・Lora（本文）、Arial/Georgia をフォールバック
- 「post-processing tool」として設計されている

**3 スキルの比較:**

| 観点             | frontend-design                | canvas-design                   | brand-guidelines           |
| ---------------- | ------------------------------ | ------------------------------- | -------------------------- |
| フォントスペック | DO/NEVER で方向性のみ          | ./canvas-fonts ディレクトリ参照 | 具体的な font name と size |
| 色指定           | 方向性のみ（cohesive palette） | 哲学から導く                    | 16進値で具体指定           |
| Supporting Files | なし                           | canvas-fonts ディレクトリ       | なし                       |
| 対象             | 汎用 Web UI                    | 静的アート（PNG/PDF）           | Anthropic ブランド適用     |
| 組織規約         | なし（個人/汎用）              | 部分あり（フォント場所）        | 組織固有ブランド           |

---

## 2. 公式スキル仕様（SKILL.md フロントマター完全版）

公式ドキュメント `code.claude.com/docs/en/skills` から確認した全フロントマターフィールド:

| フィールド                 | 必須 | 説明                                                                                                  |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| `name`                     | No   | スキル識別子。ディレクトリ名から自動設定。英小文字・数字・ハイフンのみ（最大 64 文字）                |
| `description`              | 推奨 | スキルの説明と使用タイミング。自動発火の判断に使用。`when_to_use` との合計が 1,536 文字でカットされる |
| `when_to_use`              | No   | 自動発火のトリガー条件の追加記述。`description` に追記される形でスキルリストに含まれる                |
| `argument-hint`            | No   | オートコンプリート時のヒント表示。例: `[issue-number]`                                                |
| `arguments`                | No   | 名前付き引数（`$name` 置換用）                                                                        |
| `disable-model-invocation` | No   | `true` にすると Claude による自動ロードを禁止。スラッシュコマンドのみでの呼び出しになる               |
| `user-invocable`           | No   | `false` にするとスラッシュメニューから非表示。Claude のみが呼び出せる                                 |
| `allowed-tools`            | No   | スキル実行中に許可するツール（承認不要）。スペース区切りまたはリスト                                  |
| `model`                    | No   | スキル実行時に使用するモデル                                                                          |
| `effort`                   | No   | 思考量レベル（`low`・`medium`・`high`・`xhigh`・`max`）                                               |
| `context`                  | No   | `fork` にするとサブエージェントで実行                                                                 |
| `agent`                    | No   | `context: fork` 時のサブエージェントタイプ                                                            |
| `hooks`                    | No   | スキルのライフサイクルに連動するフック                                                                |
| `paths`                    | No   | グロブパターン。指定すると特定ファイルを扱う時だけ自動ロードされる                                    |
| `shell`                    | No   | インライン Shell コマンドの Shell 指定（`bash`/`powershell`）                                         |

**重要な動作仕様（公式ドキュメントから抜粋）:**

- `disable-model-invocation: true` を設定すると、サブエージェントへのプリロードも無効になる
- `user-invocable: false` はメニュー非表示のみ。`disable-model-invocation: true` とは独立
- スキル本文は呼び出し時に会話に 1 メッセージとして注入され、セッション中は保持される
- Auto-compaction 時: 最新の呼び出しが再注入（最大 5,000 トークン/スキル、合計 25,000 トークン）
- `paths` グロブを使うと、関連ファイルを扱う時だけ自動ロードされる（`.claude/rules/` と同等）

**`paths` フィールドの発見:**

スキルにも `paths` グロブが使えることが判明した。これは先行調査 R3 では確認できていなかった情報。rules ファイルだけでなく、スキルそのものにパスフィルターをかけることができる。

---

## 3. コミュニティの実装事例

### 3-1. Triptease Design System スキル

リポジトリ: `triptease/claude-skill-design-system`

単一ファイル構成（`triptease-design-system.md`）で、スキルではなくコマンドファイルとして実装。フロントマターなし（plain Markdown）。

**注目すべき設計パターン:**

- 「**ALWAYS research before implementing**」を核心原則として冒頭に置く
- Playwright browser tools で公式ドキュメントを実際に参照することを義務化
- 「DO / DON'T」を**コード例付きで**対比:

```css
/* DON'T */
padding: 24px;
background: #5e43c2;

/* DO */
padding: var(--space-scale-3);
background: var(--color-surface-100);
```

- 意思決定ツリーをMarkdownで明示（Web コンポーネント vs HTML+CSS vs デザイントークン）
- コンポーネントごとのドキュメントURLを検証済み URL として列挙（Claude がリサーチする先を確定する）

**yolos.net への示唆**: 「Claude が判断する」ではなく「Claude が調べる先を確定する」という設計。`globals.css` の URL や CSS 変数の一覧ページへの直接リンクをスキルに埋め込む。

### 3-2. interface-design スキル（Dammyjay93）

リポジトリ: `Dammyjay93/interface-design`

**特徴的なアプローチ — 探索フェーズの強制:**

コードを書く前に 4 つの必須アウトプットを要求する:

1. **Domain**: 5 個以上の、そのプロダクトの世界固有の概念
2. **Color world**: そのドメインの物理世界に自然に存在する 5 色以上
3. **Signature**: そのプロダクト専用にしか存在できない 1 つの要素
4. **Defaults**: 意図的に避ける 3 つの「明らかな選択」

この 4 つを明示的に参照しない提案は受け付けない、という強制。

**バリデーション チェックポイント（コード提出前に必須）:**

- **Swap test**: タイプフェイスとレイアウトを標準的なものに置き換えたら、違いが感じられるか
- **Squint test**: ぼかして見ても階層が見えるか
- **Signature test**: 5 つの具体的要素にシグネチャが表れているか
- **Token test**: 変数名がこのプロダクトの世界に属するか、汎用的なものでないか

**CSS トークン命名の哲学:**

`--gray-700` のようなトークン名はテンプレートアプローチのシグナル。`--ink`・`--parchment` のように意図的な世界を喚起する名前を使うべき、とする。

**メモリ機構**: 探索→提案→確認→実装→評価のワークフロー。パターンを `.interface-design/system.md` に保存して次回セッションに引き継ぐ。

### 3-3. design-loop スキル（jezweb）

リポジトリ: `jezweb/claude-skills/plugins/frontend/skills/design-loop/`

**「バトン渡しループ」パターン:**

`.design/next-prompt.md` をリレーファイルとして使い、ページ生成を繰り返す自律型サイトビルダー。

**デザイン整合性の担保方法:**

- **Shared Element Replication**: ヘッダー・フッター・ナビは直近ページから HTML を exact copy（「Never regenerate」）
- **DESIGN.md の再注入**: 「Include the design system block in every baton prompt — Claude needs it fresh each time」
- DESIGN.md のセクション 6 に「再利用可能ブロック」を用意し、毎回のタスクプロンプトにそのまま貼り付ける

**構造:**

```
.design/
├── DESIGN.md   # デザインシステム（Platform, Theme, Colors, Font, Corners, Shadows, Spacing）
├── SITE.md     # サイトのページ一覧（ページの再作成防止）
└── next-prompt.md  # 次タスクのバトン
```

**コンテキスト管理の重要な知見**: Claude はセッションをまたぐと DESIGN.md を忘れる。だから「毎回のタスクプロンプトにデザインシステムブロックを Copy」することで、コンテキスト圧縮後でも整合性を保つ。これは R3 のコンパクション問題への実践的な解決法。

### 3-4. cuellarfr/design-skills

リポジトリには 11 個のデザイン専門スキルが含まれる。CSS Modules 環境に直接適用できる最も関連性が高いのは:

**Design Systems スキル（~4,500 行の大型スキル）:**

- 3 層デザイントークンアーキテクチャ（W3C 形式）
- コンポーネント仕様テンプレート
- ガバナンスモデル（集中型 / 連合型 / ハイブリッド）

**重要な構造的特徴:**

- 各スキルは 200〜350 行のメインファイル + `references/`・`templates/`・`examples/` ディレクトリ
- スキル本体はスタンドアロンで動くように設計されているが、詳細は Supporting Files に分離

### 3-5. impeccable — 公式スキルの強化コミュニティ版

サイト: `impeccable.style`

Anthropic の公式 frontend-design スキルを「内部評価フレームワークに対して再構築した」バージョン 2.0 を提供。

- 18 個のコマンドで構成
- `/impeccable teach`: プロジェクトコンテキスト確立（基盤）
- `/polish`・`/audit`・`/typeset`・`/distill`・`/bolder`: 強化コマンド
- `/shape`（発見）・`/impeccable craft`（ブリーフから実装）: 生成コマンド
- `/critique`: ペルソナベースのレビュー
- 25 個のアンチパターンを特定（カードレイアウトの氾濫「Cardocalypse」、Generic Inter フォント等）

---

## 4. Katherine Yeh の設計論 — スキルを設計システムとして組織する

Medium 記事「A Designer's Guide to Organizing AI Skills and Tools in Claude Code」（2026 年 3 月）から。

**3 層アーキテクチャ（スキルを設計システムのように組織する）:**

1. **Reference Skills（知識層）**: デザイン原則・コンポーネント仕様・コンテンツ戦略・モーション仕様
2. **Capability Skills（ワークフロー層）**: デザインレビュー・生成・プロトタイピング。Reference Skills を必要時にロード
3. **Tools & Connectors（MCP 層）**: Figma・Jira 等の外部連携

**失敗事例（引用）:**

「Some overlapped. Some contradicted each other. Claude would load the wrong one, or load three at once and get confused. It was chaos.」

スキルが互いに重複・矛盾し、Claude が誤ったスキルをロードしたり 3 つ同時にロードして混乱した経験。

**教訓**: スキルは「一つの責任を持つ」ように設計する。複数のスキルが同じ概念をカバーしてはいけない。

---

## 5. 失敗事例と教訓

### 5-1. 「プロンプトして祈る」アプローチの失敗

Julian Oczkowski の記事（Medium, 2026 年 3 月）で言及された根本問題:

「The output looks like software but does not feel like software. It is missing the invisible work that separates a prototype from a product.」

スキルがあっても、生成前に意図的な設計決定を強制するプロセスがないと、AI が既知のパターンから素材を引っ張るだけになる。**スキルは「知識の置き場所」ではなく「プロセスの強制装置」として設計する必要がある**。

### 5-2. 公式スキル改善の教訓（PR #210）

モデルが物理的に実行できない指示を書いてはいけない:

- 「前回と違う色を使え」（会話が独立しているため前回を参照できない）
- 「他のプロジェクトとデザインが被らないようにせよ」（同上）

指示の明確さと実行可能性の検証が必要。小さいモデルほど曖昧な指示への耐性が低い。

### 5-3. コンテキスト圧縮後の喪失

design-loop スキルが示す実践的解決: 各タスクプロンプトにデザインシステムの核心部分を毎回コピーして埋め込む。「Claude はセッションをまたぐと忘れる」前提での設計。

---

## 6. yolos.net への具体的な応用示唆

### 6-1. 公式スキルをアレンジする場合の具体的な差分

公式 `frontend-design` スキルをベースに yolos.net 向けにアレンジするなら、以下の変更が必要:

**フロントマターの追加:**

```yaml
---
name: design-guideline
description: |
  yolos.net のデザインガイドライン。src/components, src/app, *.css ファイルを
  編集するとき、またはデザイン・スタイル・レイアウト・色・タイポグラフィ
  について作業するときに必ず参照すること。
when_to_use: |
  - CSS Modules を編集するとき
  - 新しいコンポーネントを作成するとき
  - globals.css のトークンを変更するとき
  - デザインレビューを行うとき
paths:
  - src/components/**/*
  - src/app/**/*.css
  - src/app/globals.css
user-invocable: false
---
```

`paths` フィールドを使うことで、関連ファイルを扱う時だけ自動ロードされる。`user-invocable: false` でメニューから隠し、Claude の自動判断にゆだねる。

**本文の差分:**

公式スキルは「汎用的な美的判断」を扱う。yolos.net のスキルには「既存のデザイントークンへの参照義務」が必要:

```markdown
## このサイトのデザイントークン

このサイトは CSS Modules + globals.css のカスタムプロパティでスタイルを管理している。
Tailwind は使っていない。色・サイズ・スペーシングは必ず以下から参照すること:

- `src/app/globals.css`: CSS 変数の定義元（--color-_, --space-_, --font-\* 等）
- **作業前に Read ツールで必ず globals.css を確認すること**

## NEVER

- 色や余白を `#xxxxxx` や `px` でハードコードしない
- globals.css に定義されていない新しいカスタムプロパティを作らない
- 既存コンポーネントのスタイル構造を無視した独自実装をしない
```

**Triptease パターンの採用:**

DO/DON'T をコード例付きで対比することを推奨（Triptease スキルの手法）:

```css
/* DON'T */
.button {
  background-color: #3b82f6;
  padding: 12px 24px;
}

/* DO */
.button {
  background-color: var(--color-primary);
  padding: var(--space-sm) var(--space-md);
}
```

### 6-2. Supporting Files による Progressive Disclosure

公式スキルは単一ファイルだが、公式ドキュメントは「500 行以内に収め、詳細は Supporting Files へ」を推奨している。yolos.net では:

```
.claude/skills/design-guideline/
├── SKILL.md                    # 概要・クイックリファレンス（200行以内）
│                               # pathsフィールドで CSS/コンポーネントファイルを自動ロード
├── tokens.md                   # globals.css の CSS 変数完全リスト
└── components.md               # 既存コンポーネントのスタイル構造パターン
```

### 6-3. design-loop パターンのコンパクション対策

デザイン規約の核心部分（変更禁止トークン・最重要禁止事項）は、毎回のタスク指示に直接埋め込む。builder.md の system prompt に以下を追加:

```markdown
## デザイン規約（毎回確認）

CSS Modules を編集するとき、以下は必ず守ること:

1. 色・余白は var(--...) トークンを使う（ハードコード禁止）
2. globals.css を Read で読んでから作業する
3. 詳細は /design-guideline スキルを参照

この規約はコンテキスト圧縮後も適用される。
```

### 6-4. interface-design のプロセス強制パターンの採用

新規コンポーネント作成時に「探索フェーズ強制」を取り入れる選択肢:

```markdown
## 新規コンポーネント作成時の必須フロー

コードを書く前に以下を明示すること:

1. **既存参照**: 類似コンポーネントのスタイルを Read で確認した結果
2. **使用トークン**: 利用する CSS 変数の一覧（globals.css から）
3. **意図的に避けること**: 汎用的なデザインアンチパターン（インライン color・固定 px 等）

これを明示しない提案は受け付けない。
```

### 6-5. 複数スキルのオーバーラップ防止（Katherine Yeh の教訓）

yolos.net では現状 design-guideline スキルは 1 つ。しかし将来スキルが増えた場合、各スキルが「一つの責任のみを持つ」ように設計すること。デザイン系で複数スキルを作るなら:

- `design-guideline`: CSS トークン・コンポーネントスタイル規約（CSS 編集時に自動ロード）
- `design-review`: レビュー観点のチェックリスト（/design-review として明示呼び出し）

この 2 つが内容を重複させないように分離する。

---

## 7. 先行調査との差分まとめ

先行調査 R3・R4 が押さえた「仕組み論」に対して、本調査が追加した具体的な知見:

| 論点                       | R3・R4 の知見                                         | 本調査での追加発見                                                                                        |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 公式スキルのフロントマター | `name`・`description` が必須と記述                    | 実ファイル確認: 公式は `name`・`description`・`license` の 3 フィールドのみ。拡張フィールドは使っていない |
| Supporting Files           | 存在することを紹介                                    | 公式 frontend-design は Supporting Files なし（単一ファイル）。canvas-design のみ `canvas-fonts` を使用   |
| Progressive Disclosure     | 概念として紹介                                        | 公式スキルは実践していない。コミュニティ（cuellarfr）が 200〜350 行 + references/ で実践                  |
| `paths` フィールド         | rules ファイルに paths があると紹介                   | スキルにも `paths` グロブが使えることを公式仕様で確認（先行調査未収録）                                   |
| コンパクション対策         | hooks でのフラグ管理を提案                            | design-loop パターン: 毎タスクに DESIGN.md のコアをコピーする手法が実用化されている                       |
| スキルの呼び出し制御       | `disable-model-invocation` と `user-invocable` の違い | 詳細確認: 2 つは独立したフィールド。組み合わせ時の動作テーブルが公式に存在                                |
| 失敗パターン               | rule piling を紹介                                    | 実行不可能な指示（クロスセッション参照）・スキル重複による混乱の具体事例を確認                            |

---

## 8. 調査の限界

- `anthropics/skills` の `canvas-design` にある `canvas-fonts` ディレクトリの内容は未確認
- `impeccable` の SKILL.md の実ファイルは取得できていない（商用サービスのため）
- `cuellarfr/design-skills` の Design Systems スキル（4,500 行）の全文は未取得
- Tailwind / shadcn/ui を使わない CSS Modules 専用のスキル事例は限られており、ほとんどの事例はフレームワーク非依存か Tailwind 前提
