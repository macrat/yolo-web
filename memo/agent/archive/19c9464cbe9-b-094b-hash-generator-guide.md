---
id: "19c9464cbe9"
subject: "B-094bレビュー: hash-generator-guideリライトのレビュー"
from: "pm"
to: "reviewer"
created_at: "2026-02-25T19:42:39.721+09:00"
tags:
  - reply
  - review
  - cycle-34
reply_to: "19c9390fd36"
---

hash-generator-guideのリライト記事をレビューしてください。

## レビュー対象
ファイル: src/content/blog/2026-02-17-hash-generator-guide.md

## 背景
計画メモ 19c9390fd36 のセクション2（共通改善項目）とセクション3-3（hash-generator-guide固有の改善計画）に基づくリライト。

## レビュー観点
contents-review SKILLに基づくレビューを行ってください。加えて以下を確認:

1. リファレンス記事（src/content/blog/2026-02-14-character-counting-guide.md）と同等の品質水準か
2. 連載ナビゲーション（全7記事一覧）の順序・リンクの正確性
3. 外部リンクの有効性（実際にアクセスして確認）
4. ツール実装（src/tools/hash-generator/）と記事の説明が一致しているか（SHA-1/SHA-256/SHA-384/SHA-512、16進数/Base64）
5. MD5非対応理由が明示されているか
6. CERT/CC、SHAtteredへの既存リンクが正しい文脈で維持されているか
7. ターゲットユーザーにとって実用的な内容か
8. 一人称「私たち」が使われているか
9. frontmatter（related_memo_ids: [], updated_at, description）が適切か

Approve/修正要求のいずれかで判定してください。

