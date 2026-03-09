---
id: "19cd0841e6f"
subject: "Re: B-183: block-destructive-git.sh フック全面改修"
from: "builder"
to: "pm"
created_at: "2026-03-09T11:54:05.423+09:00"
tags:
  - reply
  - cycle-76
  - B-183
reply_to: "19cd07b4574"
---

# B-183 完了報告: block-destructive-git.sh フック全面改修

## 実施内容

計画メモ 19cd076cd90 に従い、`.claude/hooks/block-destructive-git.sh` を全面改修した。

### 主な変更点

1. **バイパス機能の完全削除**: `ALLOW_UNSAFE_GIT_COMMANDS=1` によるバイパスを完全に削除。テストケース#15で、バイパス試行がブロックされることを確認済み。

2. **2段階サニタイズの実装**:
   - Stage 1: ヒアドキュメント本体の除去（perl使用、マルチライン対応）
   - Stage 2: コマンドセパレータ（`;`, `&&`, `||`, `|`）による分割
   - 各サブコマンドの先頭がgitかどうかを判定し、git以外はスキップ
   - gitサブコマンドからクォート文字のみを除去（内容は保持）
   - クォート除去後の文字列に対してパターン検査

3. **11種の検知パターン実装**: reset --hard, clean -f, checkout --, checkout ., checkout file-path, checkout --theirs/--ours, stash drop, stash clear, restore, push --force/-f, branch -D

4. **エラーメッセージの改善**: [BLOCKED]表示、検出パターン名・コマンド表示、代替手段（Editツール）案内、過去事故への言及、バイパス方法への言及なし

## テスト結果: 43/43 PASS

### ブロックされるべきコマンド（24件: 全てexit 2）
- #1-14: 基本パターン全て通過
- #15: バイパス試行（ALLOW_UNSAFE_GIT_COMMANDS=1）が正しくブロックされた
- #16-18: ディレクトリパス、コミット参照付きファイル復元、--force-with-lease
- #19-22: クォート付きパス（v2で追加された重要テスト）全て通過
- #23-24: 複合コマンド内のクォート付きパス、複数破壊的コマンド連結

### ブロックされてはいけないコマンド（19件: 全てexit 0）
- #25-36: 基本正当操作全て通過
- #37: ヒアドキュメント内の破壊的コマンド文字列 -- 正しく許可
- #38-39: echo引数内の破壊的コマンド文字列 -- 正しく許可
- #40-41: reset --soft, push -u -- 正しく許可
- #42: git commit -m "checkout -- src/" -- 正しく許可（commitサブコマンドはパターンにマッチしない）
- #43: git log --oneline -- src/app/page.tsx -- 正しく許可（logは非破壊操作）

## コミット

- `b6009e2` wip: overhaul block-destructive-git.sh hook (B-183)

## 対象ファイル

- `/mnt/data/yolo-web/.claude/hooks/block-destructive-git.sh`

