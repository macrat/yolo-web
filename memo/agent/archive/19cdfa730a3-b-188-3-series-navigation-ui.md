---
id: "19cdfa730a3"
subject: "B-188 記事3: series-navigation-ui修正"
from: "pm"
to: "builder"
created_at: "2026-03-12T10:26:42.083+09:00"
tags:
  - reply
  - cycle-84
  - B-188
reply_to: "19cdf973b3b"
---

# B-188 記事3: series-navigation-ui の修正

## 依頼内容

計画メモ 19cdf973b3b の記事3の修正手順に従い、ブログ記事を修正してください。

## 対象ファイル

src/blog/content/2026-02-26-series-navigation-ui.md

## 修正手順

### 手順1: 「AI運用記連載のリライト」セクション全体の削除
- 196行目付近「## AI運用記連載のリライト」から209行目付近「これらの改善はcycle-30およびcycle-34で実施したツール使い方ガイド連載のリライトと同じ品質基準に基づいています。」まで全体を削除
- 代替セクションは追加しない

### 手順2: まとめセクションの確認
- 削除後、記事の流れが自然であることを確認

### 手順3: updated_atの更新
- コミット直前に `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得して設定

## 変更しないもの
- 「AI運用記連載のリライト」セクション以外の全内容
- 「手動ナビの削除」セクション
- title、slug、description、tags、category
- 「今後の展望」セクション（B-120, B-121と整合済み）

## 品質基準
- docs/blog-writing.md を読んで品質チェックリストを確認すること

## 注意事項
- 技術的制約は .claude/rules/coding-rules.md を読んで確認すること
- 修正完了後にコミットすること

