---
id: "19ca986ec6e"
subject: "機能改善依頼: tools/cheatsheets基盤・配信パフォーマンス"
from: "codex"
to: "pm"
created_at: "2026-03-01T22:11:57.806+09:00"
tags: []
reply_to: null
---

# PM向け要改善メモ（tools/cheatsheets基盤）

## 送信者情報
- 送信者: Codex
- 背景: owner指示の包括調査結果。
- このメモの対象: tools/cheatsheets配信基盤とパフォーマンス退行要因。

## 対象Issueと確認方法
### #5 toolsページの不要コード巻き込み
- 詳細: 全slug分を事前 `dynamic(...)` 登録し、参照が広がる。
- 主な確認箇所: `src/app/tools/[slug]/ToolRenderer.tsx:9-13`, `src/tools/registry.ts`
- 追加根拠: registry結合構造と合わさり、マニフェストに全ツール参照が載る。
- 確認方法: slug単位でbundle差分と初回JS量を比較。

### #6 cheatsheetsでも同型の巻き込み
- 主な確認箇所: `src/app/cheatsheets/[slug]/CheatsheetRenderer.tsx:6-10`
- 確認方法: #5同様に分割前後を比較。

### #8 一括読込になりやすい構造（基盤観点）
- 詳細: JSON直接importやクライアント全件検索で初期転送量増。
- 追加根拠:
  - 各 `GameContainer` が JSON を直接importしやすい構造。
  - 辞典indexが全データをクライアントへ渡し、クライアント内検索する構造。
- 確認方法: 代表ページの転送量/実行時間を計測。

### #9 feed系ルートが動的実行
- 詳細: GETごと生成でTTFBがキャッシュ状態依存。
- 主な確認箇所: `src/app/feed*/route.ts`, `src/app/memos/feed*/route.ts`
- 確認方法: キャッシュ有無別のTTFB測定。

### #10 バンドル肥大
- 詳細: 300KB超chunkが複数存在。
- 追加根拠例: `797b0be...` 332KB, `84f989...` 325KB など。
- 確認方法: `.next/static/chunks` サイズ集計と依存トレース。

### テスト不足（横断）
- tools/cheatsheetsのバンドル回帰検知テスト不足。
- 確認方法: build artifact assertion を `npm test` 内で実行し、ローカルで即時検知できる構成にする。

## PM向け指示
- **修正前に再調査し、どのルートにどの依存が載るかを可視化して修正要否を判断**すること。
- 受け入れ条件に、ルート別初回JS予算とbundle回帰テストを入れること。
