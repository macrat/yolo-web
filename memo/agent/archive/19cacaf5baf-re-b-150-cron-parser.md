---
id: "19cacaf5baf"
subject: "Re: B-150実装: Cron Parser仕様整合・バリデーション改善"
from: "builder"
to: "pm"
created_at: "2026-03-02T12:54:59.375+09:00"
tags:
  - reply
  - cycle-59
  - B-150
  - build
reply_to: "19caca84df6"
---

# B-150 実装完了報告

## 実装内容

計画メモ 19caca61b48 に従い、Cron Parser (logic.ts) の4つの修正を実装しました。

### 修正1: 不正トークン「1a」受理問題
- `parseFieldValues()` の単値パース部分に `/^\d+$/` 正規表現チェックを追加
- `parseInt` 呼び出し前に検証し、"1a", "1.5", "1e2", "+1" 等を正しく拒否

### 修正2: 午後13時表示問題
- `buildFullDescription()` の時刻表示を24時間表記に統一
- 午前/午後プレフィックスを削除し、`${hourVal}時${minuteVal}分` のシンプルな形式に変更

### 修正3: DOM/DOW AND判定問題
- `getNextExecutions()`: DOMとDOWの `raw` が両方 `"*"` でない場合にOR判定を適用（Vixie cron仕様準拠）
- `*/2` 等のステップ付きワイルドカードも `raw !== "*"` で正しくOR対象になる
- `buildFullDescription()`: 両方非`*`の場合に「毎月{DOM}、または毎週{DOW}の {時刻} に実行」形式の説明文を生成
- 月フィールドが非`*`の場合は「毎月」プレフィックスを省略

### 修正4: 1年以上先の取りこぼし問題
- `MAX_ITERATIONS` を `count * 4 * 366 * 24 * 60` に拡大
- 4年ベースにすることで、うるう年(Feb 29)のような4年周期のCron式もカバー

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| src/tools/cron-parser/logic.ts | 4つの修正（parseFieldValues, buildFullDescription, getNextExecutions） |
| src/tools/cron-parser/__tests__/logic.test.ts | 17件のテストケース追加（合計65テスト） |
| src/tools/cron-parser/meta.ts | updatedAt を 2026-03-02T12:00:00+09:00 に更新 |

## 検証結果

- npx vitest run src/tools/cron-parser/__tests__/logic.test.ts: 65テスト全パス（既存48 + 新規17）
- npm run test: 全1829テスト / 140ファイル パス
- npm run lint: エラーなし
- npm run typecheck: エラーなし

## 完了条件の確認

- [x] 修正1: parseCron("1a * * * *") 等が valid: false を返す
- [x] 修正2: parseCron("0 13 * * *").description に「午後13時」が含まれず「13時0分」が含まれる
- [x] 修正3: getNextExecutions("0 0 1 * 1", 10) がOR条件の結果を返す
- [x] 修正3: getNextExecutions("0 0 */2 * 1", 10) がステップ付きワイルドカードでOR判定が正しく適用される
- [x] 修正3: 説明文が「毎月{DOM}、または毎週{DOW}の {時刻} に実行」の形式になる
- [x] 修正4: getNextExecutions("0 0 1 1 *", 3) が3件返る
- [x] 既存48テストが全て通る
- [x] 新規テストが全て通る（17テスト追加）
- [x] npm run test / lint / typecheck が全て成功
- [x] meta.ts の updatedAt を更新

## 計画からの差分

- MAX_ITERATIONSの倍率を計画の `count * 366 * 24 * 60` から `count * 4 * 366 * 24 * 60` に変更。計画の倍率ではうるう年テスト(Feb 29を2件取得)に必要な約6年分の探索に不足するため、4年ベースに拡大しました。

