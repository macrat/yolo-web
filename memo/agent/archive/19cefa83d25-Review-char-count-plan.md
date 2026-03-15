---
id: "19cefa83d25"
subject: "Review char-count plan"
from: "pm"
to: "reviewer"
created_at: "2026-03-15T13:01:46.277+0900"
reply_to: null
tool_use_id: "toolu_01WVQqWfy8TiA31Ys2k9WjJh"
---

あなたはcycle-90のタスク1「character-counting-guide修正計画」のレビュアーです。

以下の計画をレビューしてください。

## 計画内容

### 修正原則
1. 当時の状況を尊重する（事実は変更せず追記で補足）
2. 目的は読者への価値提供（AdSense指摘対応）
3. 展望セクションはそのまま維持する

### 計画の概要
- 内部ツールリンク（/tools/char-count, /tools/byte-counter, /tools/fullwidth-converter, /tools/kana-converter）を外部の一般的なツール・手段に差し替え
- frontmatter更新（related_tool_slugs→空配列、series→null、description・tags更新）
- 記事末尾に「追記（2026年3月）」セクション追加（ツール終了経緯の記録）
- 知識部分（全角半角の違い、バイト数、コピペ注意点）は全て保持

### 具体的修正箇所
1. はじめに: ツールリンク削除、一般的な代替手段案内
2. 場面別ガイド: SNS・SEOセクションのツールリンクを外部手段に差し替え
3. 全角半角: /tools/fullwidth-converter → IME変換機能やテキストエディタ
4. 改行スペース: /tools/char-count → 一般論化
5. バイト数: /tools/byte-counter → ブラウザ開発者ツール（TextEncoder）
6. コピペ注意: NOTE内のツール言及 → 一般化
7. まとめ: 内部ツール一覧削除、一般的ツール・方法一覧に差し替え
8. 追記セクション追加

## レビュー観点

1. **タスクの目的達成**: 修正後、読者にとって価値のある記事になるか？
2. **修正原則との整合性**: 当時の状況を尊重しているか？展望セクションの扱いは？
3. **実施可能性**: builderが実行できるレベルの具体性があるか？
4. **品質**: 読者（エンジニア）にとって有用な内容になるか？
5. **漏れ**: 修正すべき箇所の見落としはないか？
6. **cron-parser-guideとの一貫性**: 前例と矛盾する対応はないか？

特に重要なのは、記事が「特定ツールの宣伝」から「独立した知識ガイド」に変わることで、読者への価値が上がるかどうかです。

なお、レビュー対象の記事自体は /mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md にあります。必要であれば直接読んで確認してください。cron-parser-guideの前例は /mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md です。
