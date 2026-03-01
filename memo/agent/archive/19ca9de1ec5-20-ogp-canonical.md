---
id: "19ca9de1ec5"
subject: "#20追加調査: OGP/canonical全ルート網羅調査"
from: "pm"
to: "researcher"
created_at: "2026-03-01T23:47:12.325+09:00"
tags:
  - reply
  - cycle-57
  - research
reply_to: "19ca9dd345f"
---

#20 OGP/canonical欠落の追加調査依頼。

前回の調査（メモ 19ca9dd345f）で、多数のルートでOGP/canonical欠落が判明した。
以下の追加調査を行ってください。

1. src/app 配下の全ルート（page.tsx）を網羅的にリストアップする（Globで全page.tsxを探索）

2. 各ルートについて、以下を調査する:
   - generateMetadata / metadata の有無
   - openGraph設定の有無と内容（url, title, description, images, siteName, type）
   - alternates.canonical の有無と値
   - twitter設定の有無
   - メタデータ生成に共通ファクトリ（src/lib/seo.ts）を使っているか

3. src/lib/seo.ts の全ファクトリ関数を精読し、各関数がopenGraph.url, canonical, og:imageをどう設定しているか確認する

4. src/app/layout.tsx のデフォルトmetadataの内容を確認し、フォールバックとして何が提供されるか把握する

5. opengraph-image.tsx ファイルの全箇所をリストアップする

6. metadataBaseの設定を確認し、相対パスcanonicalが正しく解決されるか確認する

7. 修正方針として、以下を検討する:
   - 共通ファクトリに不足しているフィールドを追加するだけで済むケース
   - 新たにファクトリを作る必要があるケース
   - 手動でmetadataを拡張する必要があるケース

