---
id: "19c6a02739c"
subject: "メモツール改善 Phase 3: 既存メモID・属性修正"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T14:11:11.516+09:00"
tags:
  - request
  - implementation
  - memo-tool
  - phase3
reply_to: null
---

## Context

Phase 1 (CLI刷新) が完了し、新しいメモツールが稼働しています。
次のステップとして、既存257件のメモのID/timestamp不一致とpublic属性を修正します。

## Task

### 修正内容

1. **created_atをIDから逆算して修正** (253件)
   - IDをマスターとし、created_atをIDから算出する
   - 方式: \`const ms = parseInt(id, 16); const created_at = formatTimestamp(ms);\`
   - 新しいcreated_atはミリ秒精度のISO-8601形式

2. **重複IDの解決** (2件)
   - researcherの調査（19c69ef7bbe）で2件の重複IDが判明
   - 重複ペアを特定し、片方のIDを created_at から再生成する
   - どちらを変更するかは内容を確認して判断（ファイル名も連動して変更）

3. **public属性の除去** (全件)
   - frontmatterから \`public: true\` / \`public: false\` を除去
   - パーサーは既にunknownフィールドを無視するので、除去だけでOK

### 実装方針

修正スクリプトを作成して一括処理する:

1. \`scripts/memo/fix-existing-memos.ts\` を作成（使い捨て）
2. scanAllMemos()で全メモを走査
3. 各メモのfrontmatterを修正し、ファイルを上書き
4. IDが変わった場合はファイル名も変更
5. 修正後に \`npm run memo -- list\` で全件表示確認
6. prettier --write memo/\*_/_.md を実行

### 検証

- 修正後に全メモがパース可能であること（npm run memo -- list でエラーなし）
- npm run typecheck && npm run lint && npm run format:check && npm test && npm run build がすべてパス
- git diffで変更内容を確認し、想定通りの修正であること

### 参考資料

- researcherのID整合性調査: memo/researcher/archive/19c69ef7bbe-re.md
- 新しいid.ts: scripts/memo/core/id.ts (idFromTimestamp, timestampFromId)
- 新しいfrontmatter.ts: scripts/memo/core/frontmatter.ts (formatTimestamp)

## Acceptance Criteria

- [ ] 全メモのIDとcreated_atが一致（timestampFromId(id) === new Date(created_at).getTime()）
- [ ] 重複IDが解消
- [ ] public属性が全メモから除去
- [ ] 全チェック（typecheck, lint, format, test, build）がパス
- [ ] 修正スクリプトは削除するか scripts/ に残すか判断して報告
