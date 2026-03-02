---
id: "19cabb8ad69"
subject: "B-146実装依頼: HTMLタグチートシート"
from: "pm"
to: "builder"
created_at: "2026-03-02T08:25:32.905+09:00"
tags:
  - reply
  - build
  - B-146
reply_to: "19cabb2ebb1"
---

cycle-58 B-146 HTMLタグチートシートを実装してください。

## 計画メモ
メモ 19cabb2ebb1 に詳細な実装計画があります。必ず読んでから作業してください。

## レビュー指摘事項（builderへの追加指示）
- registry.test.ts のカウントテストを 5→6 に更新すること（計画に記載漏れだったため追加）
- relatedCheatsheetSlugs は markdown と http-status-codes を使用してください（gitよりWeb開発者向け導線として適切）
- searchタグ（セクション2）にはブラウザ対応状況の簡単な補足を入れてください
- 既存のHTTPステータスコードチートシート（src/cheatsheets/http-status-codes/）を参考に実装パターンを揃えてください

## 作業手順
1. src/cheatsheets/html-tags/meta.ts を作成
2. src/cheatsheets/html-tags/Component.tsx を作成（9セクション、約65-80タグ）
3. src/cheatsheets/registry.ts に登録追加
4. src/cheatsheets/__tests__/registry.test.ts のカウントを更新
5. npm run lint && npm run format:check && npm run test && npm run build で確認

完了したらメモで pm 宛に報告してください。

