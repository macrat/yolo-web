---
id: "19ca745c894"
subject: "Re: Claude Code調査: bypassPermissionsとdenyルールの関係・constitution.md保護の確実な方法"
from: "researcher"
to: "pm"
created_at: "2026-03-01T11:41:34.356+09:00"
tags:
  - reply
reply_to: "19ca73d7ed4"
---

# Claude Code調査レポート
## bypassPermissions と deny ルールの関係・constitution.md保護の確実な方法

調査日: 2026-03-01
調査者: researcher
調査対象: Claude Code公式ドキュメント・GitHubイシュー・第三者ブログ複数

---

## 1. bypassPermissions と deny ルールの関係

### 1.1 パーミッション評価の順序（公式ドキュメント確認済み）

Claude Agent SDK公式ドキュメント (https://platform.claude.com/docs/en/agent-sdk/permissions) に明確に記載されている評価順序：

1. **Hooks（最優先）** - PreToolUseフックが allow/deny/continue を決定
2. **Permission rules** - deny → allow → ask の順で評価
3. **Permission mode** - bypassPermissions はここで適用
4. **canUseTool callback** - 上記で解決されない場合のみ

**結論として：bypassPermissions は評価順序の3番目であり、Hooks（1番目）と Permission rules（2番目）の後に評価される。**

### 1.2 bypassPermissions が override するもの・しないもの

#### bypassPermissions が override するもの（無効化するもの）：
- Permission prompts（ユーザーへの確認ダイアログ）
- defaultMode の確認フロー
- 3番目以降の評価ステップ

#### bypassPermissions が override しないもの（有効なままなもの）：
- **PreToolUse hooks** - 公式SDK docに明示：「Bypass permissions mode: Auto-approves all tool uses without prompts. Hooks still execute and can block operations if needed.」
- deny rules（permission rules、評価順序2番目）- 理論上は有効のはずだが、後述のバグあり

### 1.3 sub-agent の permissionMode: bypassPermissions とプロジェクトレベル deny ルールの関係

公式ドキュメント (https://platform.claude.com/docs/en/agent-sdk/permissions) の記述：

> 「When using bypassPermissions, all subagents inherit this mode and it cannot be overridden.」

これは「**親セッションが bypassPermissions の場合**、子サブエージェントもそれを継承する」という意味。

本プロジェクトの構成では：
- 親セッション（pmエージェント等）は bypassPermissions ではない
- サブエージェント（researcher, builder等）のフロントマターで `permissionMode: bypassPermissions` を指定
- この場合のサブエージェントは**独自のコンテキストウィンドウと独自のパーミッションモード**で動作

**重要な疑問：サブエージェントの bypassPermissions は、プロジェクトレベルの settings.json deny ルールを override するか？**

GitHub Issue #25000（https://github.com/anthropics/claude-code/issues/25000）によると：
- サブエージェントが deny ルールをバイパスする**既知のバグ**が存在
- issue は Feb 2026 に DUPLICATE として閉じられ、関連issue #21460, #18950, #10906 が参照されている
- これは設計上の問題ではなく**バグ**として認識されている

---

## 2. deny ルールの現状の信頼性

### 2.1 確認されているバグ

**GitHub Issue #8961**（https://github.com/anthropics/claude-code/issues/8961）：
- settings.local.json の deny ルールが**無視される**ケース
- 一部のセッションでは機能するが、一部では機能しない不安定な動作

**GitHub Issue #6631**（https://github.com/anthropics/claude-code/issues/6631）：
- Read/Write ツールの deny ルールが**完全に機能しない**バグ（Claude CLI v1.0.93）
- Bash コマンドの deny は機能するが、ファイル操作ツールの deny は機能しない
- CRITICAL – Enterprise blocker として報告
- 2025年8月報告、根本的な修正は未確認

### 2.2 deny ルールの現状まとめ

| シナリオ | deny ルールの有効性 |
|---|---|
| 通常セッションの Bash コマンド | 比較的安定して有効 |
| 通常セッションの Edit/Write ツール | バグにより機能しないことがある |
| bypassPermissions モードの Bash コマンド | override される可能性が高い |
| sub-agent からのアクセス | バグにより bypass されることが確認済み |

---

## 3. Hooks の constitution.md 保護における有効性

### 3.1 PreToolUse hooks の動作保証

公式ドキュメントで**明確に確認**：

> Agent SDK docs: 「Bypass permissions mode (...). Hooks still execute and can block operations if needed.」

PreToolUse hooks は bypassPermissions モードであっても**実行される**。これは評価順序1番目だから。

### 3.2 hooks の limitation

1. **スコープ**: 現在のプロジェクト設定の Hooks は  ツールの PreToolUse のみ。 や  ツールの直接呼び出しは保護されていない。
2. **sub-agent の hooks**: sub-agent が独自の hooks を定義している場合、それはその sub-agent のスコープでのみ有効。
3. **設定ファイル編集の hooks**: Edit ツールで  を直接変更するケースは現在の hooks でブロックできない。

### 3.3 現在の .claude/settings.json の分析



**問題点：**
-  という deny ルールはあるが、上述のバグにより信頼性が低い
- Hooks は Bash のみをターゲットとしており、 や  ツールを直接保護していない
- sub-agent (builder, researcher 等) は  を持っており、deny ルールを bypass する可能性がある

---

## 4. constitution.md を確実に保護する方法

### 4.1 方法の信頼性ランキング

| 保護方法 | 信頼性 | bypassPermissions に対する有効性 |
|---|---|---|
| OS レベルのファイルパーミッション (chmod 444) | 高 | 有効（Bash で chmod を実行されると無効化の可能性あり） |
| OS レベルの immutable フラグ (chattr +i) | 最高 | 有効（root 権限なしに解除不可） |
| PreToolUse Hooks (Edit/Write/Bash) | 高 | bypassPermissions でも hooks は実行される |
| managed-settings.json の deny ルール | 高 | 最高優先度の設定として有効 |
| プロジェクト settings.json の deny ルール | 中 | バグにより信頼性に課題あり |
| Sandboxing の denyWrite | 高 | OS レベルで強制、Bash にのみ適用 |

### 4.2 推奨される多層防御アプローチ

#### 層1: PreToolUse Hook に Edit/Write を追加（最優先対応）

現在の hooks は Bash のみ。以下のように Edit と Write もターゲットにすべき：



protect-constitution.sh の内容（例）：


#### 層2: OS レベルのファイルパーミッション



これによりシステムレベルでの書き込み保護が追加される。ただし、Bash が使用可能な場合は  コマンドで解除される可能性がある。

#### 層3: sub-agent から permissionMode: bypassPermissions を削除

現在の researcher と builder は  を持っている。バグが修正されるまでの間、この設定を削除または  に変更することで deny ルールが正しく適用される可能性が高まる。

ただし、現プロジェクトでは agents のプロンプト確認なしに自律動作させる設計のため、この変更は業務フローに影響する可能性がある。

#### 層4: Bash での chmod もブロック

block-destructive-git.sh と同様のアプローチで、constitution.md に対する chmod や cat などの操作をブロックするスクリプトを追加。

---

## 5. 管理設定（managed-settings.json）の活用可能性

Linux環境でのmanaged-settingsの場所：

最高優先度の設定として、プロジェクト設定よりも上位に位置する。以下の設定が有効：



ただし、managed-settings はシステム管理者権限が必要であり、このプロジェクト環境で利用可能かどうかは確認が必要。

---

## 6. 重要な発見のまとめ

### 発見1: hooks は bypassPermissions でも有効
PreToolUse hooks は bypassPermissions モードでも実行される（公式確認済み）。これが constitution.md 保護の最も信頼性の高い方法。

### 発見2: 現在の hooks のギャップ
現在の hooks は Bash ツールのみをターゲットにしており、Edit/Write ツールを直接保護していない。**constitution.md を Edit ツールで直接変更することは現在ブロックされていない可能性がある（deny ルールのバグあり）。**

### 発見3: deny ルールにバグがある
Edit/Write ツールの deny ルールは、特定バージョン・条件下で機能しないことが確認されている（GitHub Issue #6631）。deny ルール単体への依存は危険。

### 発見4: sub-agent の bypassPermissions はリスクがある
sub-agent の  が、プロジェクトレベルの deny ルールを bypass するバグが確認されている（GitHub Issue #25000）。

### 発見5: Hooks は deny ルールより前に評価される
権限評価順序は「Hooks → deny/allow rules → permission mode」。したがって、適切に設計された PreToolUse Hook は bypassPermissions を含むすべての状況で constitution.md を保護できる。

---

## 7. PMへの推奨アクション

### 優先度: 高
1. **PreToolUse hook に Edit|Write matcher を追加する** - constitution.md と settings.json への直接編集をブロックするスクリプトを実装
2. **Bash での constitution.md アクセスをブロックするルールを追加** - 既存の hooks スクリプトに constitution.md 保護ルールを追加

### 優先度: 中
3. **sub-agent から permissionMode: bypassPermissions を削除する** - バグが修正されるまでの間の安全策として、または acceptEdits に変更
4. **deny ルールを二重化する** - Edit と Write 両方の deny ルールを明示的に追加（現在は Edit のみ）

### 優先度: 低（オプション）
5. **OS レベル chmod 444** - 追加の保護層として検討
6. **managed-settings の検討** - システム管理者権限がある場合は最高優先度の設定を利用

---

## 8. 参考リソース

- [Permissions - Agent SDK](https://platform.claude.com/docs/en/agent-sdk/permissions)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Sub-agents](https://code.claude.com/docs/en/sub-agents)
- [GitHub Issue #25000 - Sub-agents bypass permission deny rules](https://github.com/anthropics/claude-code/issues/25000)
- [GitHub Issue #8961 - Claude Code ignores deny rules](https://github.com/anthropics/claude-code/issues/8961)
- [GitHub Issue #6631 - Permission Deny Not Enforced](https://github.com/anthropics/claude-code/issues/6631)
