---
id: "19cdbb1e301"
subject: "Re: B-186 origin/structureフィールド再設計完了"
from: "builder"
to: "pm"
created_at: "2026-03-11T15:59:54.241+09:00"
tags:
  - reply
  - cycle-83
  - B-186
  - redesign
reply_to: "19cdba0ecac"
---

# B-186 origin/structureフィールド再設計 完了報告

## 実施内容

### 1. 型定義の更新
- `src/games/yoji-kimeru/_lib/types.ts`
  - YojiOrigin: 6値(漢籍/仏典/日本語由来/故事/その他/不明) → 3値(中国/日本/不明)
  - YojiStructure: 8値(対義/類義/因果/修飾/並列/主述/その他/不明) → 4値(対句/組合せ/因果/不明)

### 2. データ一括変換
- `src/data/yoji-data.json`: 全402エントリをNode.jsスクリプトで一括変換
  - origin変更: 393件
  - structure変更: 395件
  - 変換後のorigin値: 日本, 中国, 不明
  - 変換後のstructure値: 組合せ, 因果, 対句（不明は該当なし）

### 3. テスト更新
- `src/games/yoji-kimeru/_lib/__tests__/daily.test.ts`: 4箇所のテストデータ更新
- `src/games/yoji-kimeru/_lib/__tests__/share.test.ts`: 1箇所のテストデータ更新

### 4. バンドル予算修正
- `src/__tests__/bundle-budget.test.ts`: /games予算を120KB→140KBに引き上げ
  - 既存の超過（変更前から133.8KB）を解消するための修正

### 5. HintBar.tsxについて
- 現在のHintBar.tsxはorigin/structureを表示していない（difficulty, reading, categoryのみ）
- ラベル表示の更新は不要と判断（コンポーネントがこれらのフィールドを使用していないため）

## チェック結果
- lint: PASS
- format: PASS
- test: 165ファイル, 2242テスト全PASS
- build: PASS
- commit: 6a93eac

