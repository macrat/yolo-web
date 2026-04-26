---
title: cycle-169 リサーチ統合 — デザインシステム設計のための判断チェックリスト
date: 2026-04-26
purpose: cycle-170「デザインシステム＆汎用共通コンポーネント集」の設計判断に使える形で、cycle-169 の 5 本の調査レポートを統合する。プランナー・レビュアー・PM が毎回読み返す必要なく、設計・実装・レビューのチェックリストとして機能させる。
method: |
  5 本の既存レポートを精読して統合（新規 Web 調査なし）:
  - 2026-04-23-tool-ui-design-reference-for-yolos.md（以下「R-UI」）
  - 2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md（以下「R-Enforce」）
  - 2026-04-23-ai-agent-design-system-enforcement-best-practices.md（以下「R-Best」）
  - 2026-04-23-anthropic-official-design-skill-deep-dive.md（以下「R-Skill」）
  - 2026-04-23-ai-slop-definition-and-avoidance-for-design-systems.md（以下「R-Slop」）
  サイトコンセプト・キャラクター定義は docs/site-concept.md・docs/character.md を参照。
sources:
  - docs/research/2026-04-23-tool-ui-design-reference-for-yolos.md
  - docs/research/2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md
  - docs/research/2026-04-23-ai-agent-design-system-enforcement-best-practices.md
  - docs/research/2026-04-23-anthropic-official-design-skill-deep-dive.md
  - docs/research/2026-04-23-ai-slop-definition-and-avoidance-for-design-systems.md
  - docs/site-concept.md
  - docs/character.md
---

# cycle-169 リサーチ統合 — デザインシステム設計のための判断チェックリスト

## 本サイクルの設計判断に直接効く 10 個の原則

1. **Skill には `paths` グロブをかけ、CSS/コンポーネントファイル編集時にだけ自動ロードさせる。** `user-invocable: false` とセットで使う。常時コンテキストを消費しない。（R-Skill §2、R-Enforce 論点 1）

2. **SKILL.md は 200 行以内に収め、詳細は Supporting Files（tokens.md / components.md）に分離する。** 本文に全情報を詰め込むと圧縮時に失われ、長い文書は AI に無視されやすい。（R-Best §1-2、R-Skill §3-4、R-Enforce 論点 1）

3. **hooks は「additionalContext でキーポイントを注入」する警告モードで運用する。** exit 2 でブロックすると摩擦が高く、additionalContext 方式なら毎回 UI ファイルを触る前にガイドラインの要点が Claude の視野に入る。（R-Enforce 論点 2、R-Best §1-3）

4. **CSS 変数はセマンティックトークン（`--color-text`）でアクセスし、プリミティブ値をコンポーネント内にハードコードしない。** Stylelint の `declaration-strict-value` プラグインを PostToolUse hook に組み合わせることで機械的に強制できる。（R-Best §3-1、R-UI §8）

5. **ダークモードは `:root.dark` による CSS 変数の上書きパターンを採用する（next-themes 標準）。** ライトモードで合格したコントラスト比がダークモードでは不合格になる場合があるため、両モードを個別に検証する。（R-UI §3-4）

6. **新規コンポーネント作成時は「使用するトークン一覧・既存の類似コンポーネントの参照結果・意図的に避けること」の 3 点を明示させてからコードを書かせる。** プロセスを縛らないと AI は統計的最頻値に向かう。（R-Skill §6-4、R-Slop §3-2）

7. **ルールには必ず「なぜか」の理由を添え、Bad/Good のコード例を対比させる。** 理由のあるルールは AI が遵守しやすく、例のあるルールは例のないルールより効果が高い。（R-Best §4-1、R-Skill §3-1）

8. **「Inter 禁止・紫グラデーション禁止・3カラムフィーチャーグリッドをデフォルト構成に使うことの禁止」を SKILL.md の NEVER 節に明示する。** yolos.net のコンセプト「静かに傍にある道具」に照らして AI Slop の高頻度シグナルと最も矛盾する。（R-Slop §1-2、R-Skill §1-2）

9. **DESIGN.md（またはそれに相当するファイル）には Named Aesthetic Tone を 1 つ定義する。** 複数の抽象的禁止ルールより「このサイトが属する設計の方向性」の一語が AI の意思決定空間を効果的に絞る。（R-Slop §6 指針案 B）

10. **コンテキスト圧縮（compaction）後の「規約忘れ」に備え、builder.md の system prompt に最重要ルール 3〜5 件を直接埋め込む。** スキルや DESIGN.md はコンパクション後に再注入されるが、system prompt の短い明示記述は最も堅牢。（R-Skill §6-3、R-Best §4-1）

---

## A. デザインシステムのドキュメント設計（`.claude/skills/` 配下）に関する原則

### A-1. Anthropic 公式 frontend-design Skill の実際の構造

Anthropic の `anthropics/skills` リポジトリにある `frontend-design` SKILL.md の実ファイルを確認した結果（R-Skill §1-2）:

- **フロントマターは `name`・`description`・`license` の 3 フィールドのみ。** `allowed-tools`・`disable-model-invocation`・`when_to_use`・`paths` などの拡張フィールドは公式スキルでは使っていない
- **Supporting Files なし。** 単一の SKILL.md のみで完結している（`canvas-design` のみ `canvas-fonts` ディレクトリを持つ）
- **本文は約 30〜35 行。** 2 節構成（`## Design Thinking` + `## Frontend Aesthetics Guidelines`）
- **DO/NEVER 対比構造を採用。** `NEVER` 節と `CRITICAL` 節で強調し、肯定指示と否定指示を対比

ただし公式ドキュメントは「500 行以内に収め、詳細は Supporting Files へ」を推奨しており、コミュニティ（cuellarfr）は 200〜350 行のメインファイル + `references/`・`examples/` ディレクトリで実践している（R-Skill §3-4）。

**yolos.net への適用方針**:

```
.claude/skills/design-guideline/
├── SKILL.md       # 概要・クイックリファレンス（200行以内）
│                  # pathsでCSS/コンポーネントファイルを自動ロード
├── tokens.md      # globals.css の CSS 変数完全リスト
└── components.md  # 既存コンポーネントのスタイル構造パターン
```

### A-2. builder / reviewer への「UI 編集前にスキルを読ませる」配線パターン

**信頼性の高い順に 3 層で組み合わせる**（R-Enforce 各論点）:

**層 1（最も信頼性が高い）: サブエージェント定義の `skills` フィールドによるプリロード**

```yaml
# .claude/agents/builder.md フロントマター
---
name: builder
skills:
  - design-guideline
---
```

これで builder サブエージェント起動時にスキルの全文がコンテキストに自動注入される。スキルが自分で読まれる必要がない。

**層 2（決定論的）: PreToolUse hooks での additionalContext 注入**

```bash
# CSS/コンポーネントファイル編集前に注入されるメッセージ（exit 0 のまま作業は止めない）
echo '{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "additionalContext": "UI編集時: globals.cssのCSS変数を使うこと。ハードコード禁止。詳細は /design-guideline 参照。"
  }
}'
```

**層 3（advisory）: builder.md の system prompt への記述**

```markdown
src/components/\*_/_ や \*.css を編集する前に、必ず globals.css を Read で確認し、
design-guideline スキルの内容に従うこと。
```

**絶対に避けるべき配線**: `disable-model-invocation: true` を design-guideline スキルに設定すると、サブエージェントへのプリロードが無効になる（R-Enforce 論点 1、R-Skill §2）。

### A-3. ドキュメントの肥大化を避ける運用パターン

**Rule Piling のリスク** (R-Best §1-2、R-Enforce 論点 4):

- CLAUDE.md の適正サイズは 40〜80 行。絶対上限は 100 行
- 150 指示を超えると遵守率が単調に低下することが実証されている
- Claude Code のシステムプロンプトが約 50 指示を消費するため、CLAUDE.md に書ける有効な指示は実質 100〜150 程度

**対策: Progressive Disclosure の 3 層構造**（R-Best §4-3）:

- 層 1（常時コンテキスト）: 名前と 1 行説明のみ
- 層 2（タスク開始時）: 関連する指示の詳細
- 層 3（必要なときのみ）: 完全な仕様・例

**YAGNI の適用**: スキルに将来的に使うかもしれない詳細を全て書き込まない。現在の実装で実際に使うトークンと、実際に存在するコンポーネントだけを記載する。

**`paths` フィールドの活用**（R-Skill §2 の追加発見）: スキルにも `.claude/rules/` と同様の `paths` グロブが使える。`src/components/**/*` や `src/app/**/*.css` を指定すると、それ以外のファイルを扱う作業では自動ロードされず、コンテキストを消費しない。

### A-4. 「ドキュメントを読まない / 形式的に通過する」AI 固有の失敗を避ける書き方

**機能する書き方の特徴**（R-Best §1-1）:

- 「なぜそうするか」の理由を添える（AI は理由があるルールをより遵守する）
- Bad/Good の対比例を具体的なコードで示す
- 1 つのルールファイルで扱う領域を限定する

**実行不可能な指示を書かない**（R-Skill §1-3 PR #210 の教訓）:

- 「過去のサイクルで使った色と違う色にせよ」は実行不可能（会話は独立している）
- 「globals.css を Read で確認してから変数を使え」は実行可能な指示

**コンテキスト圧縮後の対策**（R-Skill §6-3、R-Best §4-4）: design-loop パターン——毎回のタスク指示に DESIGN.md の核心部分を直接コピーして埋め込む。builder.md の system prompt に最重要ルール 3〜5 件を常駐させることで、compaction 後も規約が維持される。

---

## B. CSS 変数とトークン設計に関する原則

### B-1. セマンティックトークン vs プリミティブトークンの使い分け

**Vercel Geist のパターン**（R-UI §1-2）: スケール上の「ポジション」で番号付けし、機能的役割でトークンを割り当てる。「色を感情で選ぶ」のではなく「役割を割り当てる」。

**GitHub Primer のパターン**（R-UI §1-3）: semantic 役割を 7 種（accent / success / attention / danger / open / closed / done）に限定。これ以外の場面で色を使わない設計。

**yolos.net への適用**（R-UI §8）: コンポーネントが参照するのはセマンティックトークンのみとし、プリミティブ値（`#3b82f6`・`16px` 等）はコンポーネント内にハードコードしない。

```css
/* プリミティブ（globals.css で定義） */
--primitive-blue-500: #3b82f6;

/* セマンティック（globals.css で定義） */
--color-accent: var(--primitive-blue-500);
--color-accent-hover: #2563eb;

/* コンポーネントが参照するのはセマンティックのみ */
.button {
  background-color: var(--color-accent);
} /* OK */
.button {
  background-color: #3b82f6;
} /* NG */
```

### B-2. ダークモード対応の標準パターン

**next-themes 親和性の高いパターン**（R-UI §3-4）:

```css
:root {
  --color-bg: #f9fafb;
  --color-text: #111827;
  --color-border: #e5e7eb;
}

:root.dark {
  --color-bg: #111827;
  --color-text: #f9fafb;
  --color-border: #374151;
}
```

**注意事項**: ライトモードで合格したコントラスト比（4.5:1 以上）がダークモードで失格になるケースがある。純黒（#000）・純白（#fff）は目の疲れの原因になるため、`#1a1a1a` や `#e2e8f0` 程度の「オフ」値を使う。

### B-3. 変数名を将来変えにくい問題への対処

**命名の階層化**（R-Skill §3-2 interface-design の知見）: `--gray-700` のような汎用名ではなく、意味を持つ名前を使う。ただし yolos.net のコンセプト「道具」は詩的な命名より機能的な命名が適切。以下の 2 層構造を推奨:

- プリミティブ層: `--primitive-gray-100` 〜 `--primitive-gray-900`（値の在処）
- セマンティック層: `--color-bg`・`--color-text-muted`・`--color-border`（意味の在処）

コンポーネントはセマンティック層のみを参照するため、将来プリミティブの値を変えてもコンポーネントに影響しない。

### B-4. ハードコード値が散らばった状態からの段階移行戦略

**Mozilla の事例**（R-Best §5-5）: 古い CSS 変数から設計トークンへの移行で「deprecated 変数を使ったら新しいトークンへの対応表とともにエラーを出す」という Stylelint ルールを実装した。エラーメッセージを prescriptive（「`#3b82f6` → `var(--color-accent)` を使ってください」）にすることで AI が自己修正できる。

**段階移行の実装**（R-Best §3-1）:

```json
// .stylelintrc.json
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "background-color", "border-color"],
      {
        "ignoreVariables": true,
        "ignoreValues": ["transparent", "inherit", "currentColor", "none"]
      }
    ]
  }
}
```

PostToolUse hook で CSS ファイル編集後に自動実行し、エラーを Claude に返すことで「書いたら即フィードバック」のループを作る。

---

## C. 共通コンポーネント設計に関する原則

### C-1. 「最小限の汎用コンポーネント」に含むもの・含まないもの

**含むもの（道具サイトとして日常的に使う UI 部品）**（R-UI §8 の推奨トークンと §4-2 のキーボード操作要件から導出）:

- Button（primary / secondary / ghost の 3 variant 以内）
- Input（text / textarea）
- フォーカスリング（`:focus-visible` による全コンポーネント共通）
- 状態フィードバック（loading / error / empty——R-Slop §1-2 で「省略が Slop シグナル」と確認）

**含まないもの（early abstraction のリスクが高い）**（R-Slop §4-1 Josh Cusick の論考）:

- 使われるかどうか不明なコンポーネント variant
- 汎用すぎて文脈を持てないレイアウトコンポーネント
- 1 箇所でしか使わない特殊 UI

「全体をコンポーネント化すると、コンポーネント更新の維持に忙殺されイノベーションに注力できなくなる」という批判が示すように、共通コンポーネントはスコープを絞ることが重要。

### C-2. API 設計のアンチパターン

**過度な props**（R-Slop §4-1）: props が増えるほど「扱いにくく、新規シナリオへの対応不能」になる。Button に 15 個の props を持たせるより、3 variant の Button を 3 ファイルで管理する方が AI にとっても扱いやすい。

**Early abstraction**（R-Slop §4-2 / R-Best §3-3）: 2 箇所で同じコードを見るまでは抽象化しない（Rule of Three）。AI は「将来使えそう」な抽象を生成しやすいが、それが Slop の温床になる。

**TypeScript 型による制約**（R-Best §3-3）: variant を型で制限することで AI が任意の値を渡せないようにする。

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost"; // 自由な指定を不可能にする
  // color?: string;  NG — 型で制限すべきをプロップで開放している
}
```

### C-3. アクセシビリティの最低ライン

**フォーカスリング**（R-UI §3-5、WCAG 2.2 新設 2.4.11）:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

最低 2px の厚さ、フォーカス前後で 3:1 以上のコントラスト変化が必要（WCAG 2.2 Level AA）。

**aria-label**: アイコンのみのボタン・意味のある画像には必須。テキストを持つボタンには不要（重複になる）。

**キーボード操作の最低保証**（R-UI §4-2）: Tab による順序移動・Enter による実行・Escape によるキャンセルが機能すること。ツール系サイトの上級ユーザーはキーボードを積極的に使う。

**モーション制御**（R-UI §3-6）:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

ツールサイトとして「そもそもアニメーションを最小限にとどめ、`prefers-reduced-motion` での無効化がほぼ不要な水準を目指す」のが理想（R-UI §3-6）。

---

## D. AI Slop 回避シグナル

yolos.net のコンセプト「日常の傍にある道具」「静かに傍にある」（character.md §核）に照らして、以下のパターンが該当した場合は AI Slop と判定する。

### D-1. 即時 NG パターン（NEVER 節に入れるべき）

**フォント**（R-Slop §1-2、R-Skill §1-2 NEVER 節）:

- Inter・Roboto をフォールバックを持たずに第一候補に使う（理由のない Inter 採用は Slop の最多シグナル）
- 日本語フォントを英数字フォントより前に置く（英数字に日本語フォントが適用される）

**色・装飾**（R-Slop §1-2、R-Best §3-4）:

- 紫〜青のグラデーションをボタン・ヘッダーに使う（"neon purple/blue AI aesthetic"）
- glassmorphism（すりガラス効果）を意味なく使う
- 装飾的な 3D シェイプ・グラデーションオーブ
- 絵文字を装飾 bullet として使う

**レイアウト**（R-Slop §1-2）:

- 中央寄せヒーロー + 3カラムフィーチャーグリッド + 価格テーブルをデフォルト構成として使う
- `rounded-2xl` + `shadow-lg` + グラデーションテキストの組み合わせ

**インタラクション完成度の欠落**（R-Slop §1-2 コード的シグナル）:

- loading / error / empty 状態の省略（yolos.net のツールは必ずこの 3 状態を実装する）

### D-2. yolos.net 固有リスク

**リスク A: Stylelint を通過するが魂のない UI**（R-Slop §4-1）:

Stylelint + Hook + SKILL.md の 3 層強制は CSS の一貫性を担保するが、「なぜそのトークンを使ったか」の意図は強制できない。全コンポーネントが `var(--color-accent)` を正しく使っても、レイアウト選択・余白感覚・インタラクション設計が Slop 的であれば、規約遵守と Slop 量産は両立する。reviewer は「Stylelint 通過」だけでなく「道具として心地よいか」を問う。

**リスク B: DESIGN.md の「良い例」がテンプレになる**（R-Slop §4-2）:

良質なガイドラインに書いたコンポーネントコードを AI が繰り返しコピーした場合、サイト全体がそのパターンで埋め尽くされる。DESIGN.md の例は「この状況でどう判断するか」の思考モデルを示すものとし、コピーペーストできる完成コードを置かない。

**リスク C: 「整ってはいるが刺さらない」UI**（R-Slop §4-3 Bynder 研究）:

ユーザーが「AI 臭い」と認識した瞬間にブランド印象が悪化する（Bynder 調査）。毎日使う道具サイトで信頼は特に重要。「どこかで見た」感覚を生まないために、色・余白・フォントには使う理由を持たせる。

### D-3. Named Aesthetic Tone の定義

**推奨する tone の定義**（R-Slop §6 指針案 B、R-UI 案 D「洗練された中立」を参照）:

tone 名: `functional-quiet`（機能的な静けさ）

- 意図する感情: 信頼・落ち着き・道具への安心感
- 使う視覚要素: 整列された余白（8px グリッド）・控えめな境界線・主張しないウォームグレー
- 避ける要素: 感情的な装飾・主張するグラデーション・ナビゲーション要素が作業内容より目立つ配置
- 参照プロダクト: Linear（「Don't compete for attention you haven't earned」）・ラッコツールズ（装飾ゼロ・速さ優先）

---

## E. 「Claude Design で作ったベース定義を本番に取り込む際の注意点」

cycle-169 のレポートには Claude Design の直接的な言及はないが、5 本から推論できる範囲で整理する。

### E-1. 外部生成 CSS 変数を globals.css に取り込む際の手順

**1. プリミティブとセマンティックを分離して取り込む**（R-UI §8、B-1 参照）:

Claude Design が出力した変数定義はプリミティブ値（具体的な色値・サイズ値）として扱い、そのまま globals.css の `:root` に追加しない。代わりに以下の構造で取り込む:

```css
/* プリミティブ層（Claude Design の出力をここに入れる） */
:root {
  --primitive-sand-50: #fafaf8;
  --primitive-sand-900: #1c1c1a;
  --primitive-blue-500: #3b82f6;
  /* ... */
}

/* セマンティック層（機能的役割にマッピング） */
:root {
  --color-bg: var(--primitive-sand-50);
  --color-text: var(--primitive-sand-900);
  --color-accent: var(--primitive-blue-500);
  /* ... */
}
```

**2. ダークモード値の追加検証**（R-UI §3-4）:

Claude Design が生成したライトモードの値は、ダークモードで再度コントラスト比を検証する。WCAG AA（テキスト 4.5:1・UI 3:1）への適合を確認してから `:root.dark` に追加する。

**3. 日本語フォントスタックの補完**（R-UI §3-2）:

Claude Design が出力するフォント定義には日本語フォールバックが含まれない可能性がある。必ず以下のパターンに補完する:

```css
--font-sans:
  "Inter", system-ui, -apple-system, "Hiragino Sans",
  "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
```

英数字フォント（Inter 等）を**必ず日本語フォントより前**に置く。逆順にすると英数字に日本語フォントが適用される（R-UI §3-2 の実装注意点）。

**4. 既存ハードコード値との衝突チェック**（R-Best §3-1 Stylelint パターン）:

取り込み後に Stylelint を全ファイルに対して実行し、既存ハードコード値（ `#xxxxxx`・固定 `px` 等）と新しいトークン定義の重複・衝突を機械的に検出する。AI に「このハードコード値を適切なトークンに置き換えよ」と指示するための prescriptive なエラーメッセージを Stylelint に設定しておく。

**5. globals.css の行数管理**:

AI Slop と同じ原理で、globals.css も「全変数を列挙した巨大ファイル」になると AI が全体像を把握できなくなる。プリミティブ層・セマンティック層・スペーシング・タイポグラフィのセクション分けを明確にし、コメントで各セクションの役割を 1 行で説明する。

### E-2. 取り込み後の品質チェックポイント

| チェック項目                 | 確認方法                                         | 合格条件                            |
| ---------------------------- | ------------------------------------------------ | ----------------------------------- |
| ライトモードのコントラスト比 | WebAIM Contrast Checker 等                       | テキスト 4.5:1 以上・UI 3:1 以上    |
| ダークモードのコントラスト比 | 同上                                             | 同上（ライトと個別に検証）          |
| 日本語フォールバック         | ブラウザのネットワークタブでフォント読み込み確認 | Noto Sans JP 等がロードされているか |
| ハードコード残留             | Stylelint 実行                                   | 0 件                                |
| CSS 変数の未定義参照         | ブラウザの DevTools                              | undefined トークン 0 件             |
| フォーカスリングの視認性     | Tab キーで全インタラクティブ要素を巡回           | 全要素でフォーカスリング表示        |

---

## 補足: 本サイクルの設計で参照すべき既存リポジトリアセット

- `docs/research/2026-04-23-tool-ui-design-reference-for-yolos.md` §8: globals.css のベーストークン定義サンプル（ライト + ダーク）
- `docs/research/2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md` §案 B: hooks の additionalContext 実装例
- `docs/research/2026-04-23-ai-agent-design-system-enforcement-best-practices.md` §3-1: Stylelint 設定の完全なサンプル
- `docs/research/2026-04-23-anthropic-official-design-skill-deep-dive.md` §6-1: yolos.net 向け SKILL.md フロントマターのテンプレート
- `docs/research/2026-04-23-ai-slop-definition-and-avoidance-for-design-systems.md` §6 指針案 B・D: Named Tone と reviewer rubric のテンプレート
