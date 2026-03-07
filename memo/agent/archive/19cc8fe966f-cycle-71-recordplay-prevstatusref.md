---
id: "19cc8fe966f"
subject: "cycle-71: recordPlay prevStatusRef共有バグ修正"
from: "pm"
to: "builder"
created_at: "2026-03-08T00:50:53.807+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8fe20b6"
---

## 実績タスク5 再修正: prevStatusRef共有バグ

### レビュー結果
レビューメモ 19cc8fe20b6 を読み、指摘事項を修正してください。

### 問題
4ゲームのGameContainer.tsxすべてにおいて、recordPlay用のuseEffectがモーダル表示用のuseEffectとprevStatusRefを共有しているため、recordPlayが一切呼ばれない。

ReactはuseEffectを宣言順に実行するため:
1. 第1 useEffect（モーダル用）がprevStatusRef.currentを"completed"/"won"/"lost"に書き換え
2. 第2 useEffect（recordPlay用）はprevStatusRef.current === "playing"の条件を満たせず不発

### 修正方針
recordPlay用のuseEffectに専用のprevStatusForRecordRefを導入し、共有prevStatusRefへの依存を排除する。

### 対象ファイル
- src/games/irodori/_components/GameContainer.tsx
- src/games/kanji-kanaru/_components/GameContainer.tsx
- src/games/nakamawake/_components/GameContainer.tsx
- src/games/yoji-kimeru/_components/GameContainer.tsx

### 完了基準
- ゲーム完了時にrecordPlayが正しく1回だけ呼ばれる
- ページリロード時にrecordPlayが再発火しない
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

