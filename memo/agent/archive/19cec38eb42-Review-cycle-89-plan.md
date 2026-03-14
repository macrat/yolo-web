---
id: "19cec38eb42"
subject: "Review cycle-89 plan"
from: "pm"
to: "reviewer"
created_at: "2026-03-14T21:01:19.170+0900"
reply_to: null
tool_use_id: "toolu_01WkMVRetbejMgsHWHr56LqL"
---

cycle-89の実施計画をレビューしてください。

## 計画内容

### サイクルの概要
B-188ブログ記事修正の一環として、site-concept.mdで削除と判断された3件のブログ記事を処理する。

### 対象記事（3件、すべて削除）
1. unit-converter-guide - Google単位変換等に対して付加価値がなく差別化困難
2. rss-feed - 一般的なRSS解説で独自性なし。別記事(rss-feed-and-pagination)で技術内容カバー済み
3. html-sql-cheatsheets - チートシート全削除後にリリース告知記事として成立しない

### タスク構成（4タスク）

**タスク0: 410 Gone 共通基盤の実装**
- 削除済みスラッグのリストを管理する仕組みを作る（定数配列として定義）
- src/app/blog/[slug]/page.tsx を修正し、削除済みスラッグへのアクセス時に 410 Gone を返す
- 410 ページには「このコンテンツは終了しました」とトップページへのリンクを表示
- cycle-88 で削除済みの password-security-guide, hash-generator-guide も含める（計5件）
- テスト追加

**タスク1-3: 各記事の削除**
- mdファイルの削除
- 内部リンク切れの確認
- 削除済みスラッグリストへの追加
- ドキュメント更新（site-concept.md, site-value-improvement-plan.md）

### 実行順序
1. タスク0（410基盤）→中間コミット
2. タスク1-3（並行実施可能）
3. 最終ビルド確認・ドキュメント更新

## レビュー観点

以下の観点でレビューしてください:

1. **目的との整合性**: site-concept.mdの削除処理方針（410 Gone、sitemapからの除外）と整合しているか
2. **410 Gone実装の妥当性**: cycle-88で削除された2件も404のまま放置されている状態を解消する意義があるか
3. **タスク分割の適切さ**: 粒度・順序は妥当か
4. **見落としの確認**: 内部リンク、関連ファイル、テストなどで見落としはないか
5. **技術的な懸念**: Next.js App Routerでの410実装に問題はないか

レビューにあたっては以下のファイルを確認してください:
- /mnt/data/yolo-web/src/app/blog/[slug]/page.tsx（現在の記事表示実装）
- /mnt/data/yolo-web/docs/site-concept.md（削除処理方針のセクション5）
- /mnt/data/yolo-web/.claude/rules/coding-rules.md（技術制約）
- /mnt/data/yolo-web/docs/blog-writing.md（ブログ品質基準）
- /mnt/data/yolo-web/src/app/sitemap.ts（サイトマップ生成）
- 削除対象の3記事ファイルの内容
- 既存テストパターン（src/配下のテストファイル）
