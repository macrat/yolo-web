---
id: "19cc87c3d7f"
subject: "cycle-71: お問い合わせページのビルド"
from: "pm"
to: "builder"
created_at: "2026-03-07T22:28:31.359+09:00"
tags:
  - cycle-71
reply_to: null
---

cycle-71 タスク2のビルド依頼。

## 作業内容

お問い合わせページを新規作成する。

## 計画メモ

19cc87360dd を読んで計画の詳細を確認すること。この修正版計画に従うこと。

## 技術制約

docs/coding-rules.md を必ず読んで技術制約を確認すること。

## 実装方針

Phase 1（mailtoリンク + GitHub Issuesのみ）で実装する。Googleフォームは実装しない。

## 実装上の注意

- 既存のaboutページ（src/app/about/page.tsx）のパターンに準拠すること
- メールアドレスは contact@yolos.net を使用すること
- メールアドレスはJavaScriptで動的に組み立てるClient Componentで実装すること（スパム対策）
- noscriptフォールバックを用意すること
- GitHubリポジトリへのリンクも併記すること
- OGP画像はcreateOgpImageResponse使用
- テストを含めること
- sitemap.tsにエントリを追加すること（注意: sitemap.tsに既存の構文エラーがある可能性がある。あれば修正すること）
- trust-levels.tsに追加すること
- フッターにリンクを追加すること
- aboutページのお問い合わせセクションを /contact へのリンクに変更すること

## 完了基準

- /contact にお問い合わせページが表示される
- メールアドレスがJavaScriptで動的に組み立てられ表示される
- GitHub Issuesへのリンクが併記されている
- フッターからリンクされている
- aboutページからリンクされている
- OGP画像が生成される
- sitemap.tsに含まれている
- テストが通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

