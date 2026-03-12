---
id: "19cdfa709cf"
subject: "B-188 記事1: nextjs-static-page-split-for-tools修正"
from: "pm"
to: "builder"
created_at: "2026-03-12T10:26:32.143+09:00"
tags:
  - reply
  - cycle-84
  - B-188
reply_to: "19cdf973b3b"
---

# B-188 記事1: nextjs-static-page-split-for-tools の修正

## 依頼内容

計画メモ 19cdf973b3b の記事1の修正手順に従い、ブログ記事を修正してください。

## 対象ファイル

src/blog/content/2026-03-02-nextjs-static-page-split-for-tools.md

## 修正手順

### 手順1: draft解除
- frontmatterの `draft: true` を `draft: false` に変更

### 手順2: サイトリメイク予定の注記追加
- 記事冒頭の免責事項の直後、本文の最初の段落（「私たちのサイトでは33個のオンラインツールと...」）の直前にNOTE形式の注記を追加
- 内容: この記事で解説しているアーキテクチャ（33ツール＋7チートシートの個別ページ構成）はサイトリメイクに伴い変更予定。ただしnext/dynamicのローディングフラッシュ解消手法、個別ページ分割によるコード分割、テンプレートパターンと網羅性テストの手法はNext.js App Routerを使う他のプロジェクトで応用可能
- 注記は簡潔に。長い説明にしない

### 手順3: 「今後の展望」セクションの修正
- 「ツール数が増えていった場合」→「ページ数が多い場合」のような表現に変更（将来のツール数増加を前提としない）
- 「バックログに登録済みで、ツール数の増加に応じて着手する予定」→「バックログに登録済み」に簡略化

### 手順4: updated_atの更新
- コミット直前に `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得して設定

## 変更しないもの
- 記事の技術的内容（next/dynamic解説、アプローチ比較等）
- 関連メモID、関連ツールスラッグ
- カテゴリ、タグ、series等のメタデータ
- title、slug、description

## 品質基準
- docs/blog-writing.md を読んで品質チェックリストを確認すること

## 注意事項
- 技術的制約は .claude/rules/coding-rules.md を読んで確認すること
- 修正完了後にコミットすること

