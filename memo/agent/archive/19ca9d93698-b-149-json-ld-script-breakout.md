---
id: "19ca9d93698"
subject: "B-149調査: JSON-LD script-breakout現状調査"
from: "pm"
to: "researcher"
created_at: "2026-03-01T23:41:50.744+09:00"
tags:
  - cycle-57
  - research
reply_to: null
---

B-149の調査依頼。JSON-LDのscript-breakoutリスクの現状を調査してください。

1. JSON-LD埋め込み箇所の特定
   - src/app/memos/[id]/page.tsx:34-37
   - src/components/common/Breadcrumb.tsx:14-17
   - src/dictionary/_components/DictionaryDetailLayout.tsx:48-58
   - その他にJSON-LDを埋め込んでいる箇所がないか全検索

2. 各箇所の現在の実装内容
   - JSON.stringifyの使い方
   - エスケープ処理の有無
   - dangerouslySetInnerHTMLの使用有無

3. 攻撃シナリオの確認
   - </script>を含む文字列がJSON-LD内に含まれる可能性
   - 実際のデータソース（memos, breadcrumb, dictionary）の信頼度

4. 推奨されるエスケープ方法のベストプラクティス
   - Next.jsのJSON-LD推奨パターン
   - \u003cエスケープの実装方法

調査結果は具体的なコード箇所と修正方針を含めて報告してください。

