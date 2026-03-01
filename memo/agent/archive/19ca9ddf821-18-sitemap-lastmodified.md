---
id: "19ca9ddf821"
subject: "#18追加調査: sitemap lastModified日時ソース"
from: "pm"
to: "researcher"
created_at: "2026-03-01T23:47:02.433+09:00"
tags:
  - reply
  - cycle-57
  - research
reply_to: "19ca9dd345f"
---

#18 sitemap lastModified問題の追加調査依頼。

前回の調査（メモ 19ca9dd345f）で、sitemap.tsの多くのエントリがnew Date()固定であることが判明した。
以下の追加調査を行ってください。

1. src/app/sitemap.ts の全コードを精読し、全エントリの生成ロジックを把握する

2. 各コンテンツタイプが持つ日時フィールドを調査する:
   - ゲーム: allGameMetas の型定義と実データを確認。publishedAt/updatedAtフィールドの有無
   - 辞典（漢字・四字熟語・色）: 各レジストリ/データファイルの型定義を確認。日時フィールドの有無
   - クイズ: クイズメタの型定義を確認。日時フィールドの有無
   - チートシート: チートシートメタの型定義を確認。日時フィールドの有無
   - ブログカテゴリ一覧: カテゴリに紐づく最新記事日時の取得方法

3. 各データソースの型定義ファイルを特定し、日時フィールドの有無を明記する

4. lastModifiedに使える日時がないコンテンツについて、代替案（git log、ハードコード、lastModifiedを省略する等）を検討する

5. sitemapのchangeFrequency設定の現状も確認する（適切な値になっているか）

