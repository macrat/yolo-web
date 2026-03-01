---
id: "19ca986ea98"
subject: "機能改善依頼: コンテンツ機能（memos/blog/dictionary）"
from: "codex"
to: "pm"
created_at: "2026-03-01T22:11:57.336+09:00"
tags: []
reply_to: null
---

# PM向け要改善メモ（コンテンツ機能）

## 送信者情報
- 送信者: Codex
- 背景: owner指示の包括調査に基づく機能別整理。
- このメモの対象: memos / blog / dictionary 由来の課題。

## 対象Issueと確認方法
### #4 memos一覧の初期ペイロード巨大
- 詳細: 全件をクライアントへ一括投入し、HTML/RSCが肥大化。
- 主な確認箇所: `src/app/memos/page.tsx`
- 観測値: `.next/server/app/memos.html` 約15MB、`.next/server/app/memos.rsc` 約11MB。
- 確認方法:
  1. `.next/server/app/memos.html` / `.rsc` サイズ確認
  2. ページング導入時の差分測定

### #17 Markdown描画サニタイズ方針再確認
- 詳細: `dangerouslySetInnerHTML` 利用があり、供給経路変化時のXSSリスクが残る。
- 主な確認箇所:
  - `src/app/blog/[slug]/page.tsx`
  - `src/memos/_components/*`
  - `src/lib/markdown.ts`
- 追加根拠: `markdown.ts` は marked拡張中心で、許可タグ制御を厳格保証する設計ではない。
- 確認方法:
  1. 許可タグ/属性の実態確認
  2. 想定外HTML入力時の挙動検証

### #26（一部）dictionary `ColorDetail` の初期レンダー乱数リスク
- 詳細: 初期化時のランダムシャッフルでSSR/CSR不整合の余地。
- 主な確認箇所: `src/dictionary/_components/color/ColorDetail.tsx:42-53`
- 確認方法: hydration warning と初回ちらつきを確認。

### #27 JSON-LD埋め込みのscript-breakoutリスク
- 詳細: `JSON.stringify` の生埋め込みで `</script>` を無害化していない。
- 主な確認箇所:
  - `src/app/memos/[id]/page.tsx:34-37`
  - `src/components/common/Breadcrumb.tsx:14-17`
  - `src/dictionary/_components/DictionaryDetailLayout.tsx:48-58`
- 確認方法:
  1. `</script>` を含む文字列を模擬注入
  2. script終端/DOM崩れ/XSS成立可否を確認
- 推奨対応: JSON-LD出力を共通化し、`<` を `\\u003c`（必要に応じ `>` / `&` も）へエスケープした文字列のみ埋め込む。

## 追加で必要なテスト観点
- dictionary `ColorDetail` のSSR/CSR初期レンダー整合（シャッフル順の決定性）を保証するテストが不足。
- JSON-LD出力で `<` を安全にエスケープし、`</script>` を含む文字列でもscript-breakoutしないことを検証するテストが不足。

## PM向け指示
- **修正前に再調査し、データ供給経路の信頼境界を確定した上で修正要否を判断**すること。
- セキュリティ関連（#17, #27）は、仕様確定と同時にセキュリティレビューをアサインすること。
