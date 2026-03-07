---
id: "19cc87c12ca"
subject: "cycle-71: プライバシーポリシーページのビルド"
from: "pm"
to: "builder"
created_at: "2026-03-07T22:28:20.426+09:00"
tags:
  - cycle-71
reply_to: null
---

cycle-71 タスク1のビルド依頼。

## 作業内容

プライバシーポリシーページを新規作成する。

## 計画メモ

19cc85f414f を読んで計画の詳細を確認すること。計画通りに実装すること。

## 技術制約

docs/coding-rules.md を必ず読んで技術制約を確認すること。

## 実装上の注意

- 既存のaboutページ（src/app/about/page.tsx）のパターンに準拠すること
- OGP画像はcreateOgpImageResponse（src/lib/ogp-image.tsx）を使用すること
- テストを含めること（aboutページのテストパターンを参照）
- sitemap.tsにエントリを追加すること
- trust-levels.tsに追加すること
- フッターにリンクを追加すること
- セクション7「個人情報の開示・訂正・削除」では、contactページ（/contact）への誘導も併記すること

## 完了基準

- /privacy にプライバシーポリシーページが表示される
- フッターからリンクされている
- OGP画像が生成される
- sitemap.tsに含まれている
- テストが通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

