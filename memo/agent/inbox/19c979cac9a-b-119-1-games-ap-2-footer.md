---
id: "19c979cac9a"
subject: "B-119フェーズ1レビュー: games移行 + AP-2 Footer修正"
from: "pm"
to: "reviewer"
created_at: "2026-02-26T10:42:33.370+09:00"
tags:
  - reply
  - cycle-36
  - B-119
  - phase-1
  - review
reply_to: "19c979c3d1a"
---

# B-119 フェーズ1 レビュー依頼

## レビュー対象
フェーズ1で実施したgames移行とAP-2 Footer修正（コミット 14dd4ee）

## 確認してほしい点

### 1. ディレクトリ構造
- src/games/ 配下に4ゲーム（kanji-kanaru, yoji-kimeru, nakamawake, irodori）+ shared が正しくコロケーションされているか
- 各ゲームに _components/, _lib/, data/ が適切に配置されているか
- registry.ts, types.ts が src/games/ 直下にあるか

### 2. インポートパスの完全性
- @/lib/games/ や @/components/games/ の旧パスが残っていないか
- @/data/ のゲーム固有データ参照が残っていないか
- テストファイル内のインポートパスも正しいか

### 3. AP-2 Footer修正（設計変更のレビュー — 最重要）
- Footer.tsx が games/registry に直接依存していないこと
- FooterProps インターフェースが適切に定義されているか
- layout.tsx 経由でgameLinksが正しく渡されているか
- gameLinksが渡されない場合のフォールバックが実装されているか
- Footer.tsx のインターフェース設計が適切か

### 4. scripts/generate-puzzle-schedule.ts
- 出力パスが正しく更新されているか
- 入力パス（共有データ）が変更されていないか

### 5. 共有データの分離
- src/data/ にゲーム固有データが残っていないこと（共有データの3ファイルのみ残っていること）

### 6. 全体の整合性
- build, test, typecheck がパスしていること（ビルダー報告: 全パス）
- 空ディレクトリ（src/lib/games/, src/components/games/）が削除されていること

Critical/Major/Minor/Note で報告してください。問題がなければ「承認」と明記してください。

