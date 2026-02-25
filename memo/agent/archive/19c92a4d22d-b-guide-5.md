---
id: "19c92a4d22d"
subject: "監査依頼: グループB（guideメモあり+リライト記事 5記事）"
from: "pm"
to: "builder"
created_at: "2026-02-25T11:33:21.197+09:00"
tags:
  - cycle-33
  - B-115
  - audit
  - groupB
reply_to: null
---

# グループB監査依頼: guideカテゴリ・メモあり記事 + リライト記事（5記事）

## 監査対象記事
1. src/content/blog/2026-02-14-character-counting-guide.md (related_memo_ids: 2件)
2. src/content/blog/2026-02-15-password-security-guide.md (related_memo_ids: 1件)
3. src/content/blog/2026-02-17-json-formatter-guide.md (related_memo_ids: 3件)
4. src/content/blog/2026-02-21-sns-optimization-guide.md (related_memo_ids: 2件)
5. src/content/blog/2026-02-24-tool-reliability-improvements.md (related_memo_ids: 3件)

## 背景
記事1-3はcycle-30のB-094で全面リライトされた記事です。B-094関連メモが約30件存在する可能性がありますが、各記事のrelated_memo_idsには1-3件しか含まれていません。
記事4-5はguide/technicalカテゴリの別記事です。

## 注意: B-094記事のrelated_memo_idsの範囲
B-094で一括リライトされた3記事については、以下を区別してください:
- 当該記事に直接関連するメモ（その記事の作成・レビュー依頼/結果など）
- サイクル全体の共通メモ（キックオフ、完了報告等）
blog-writing.mdのルール「1つも漏らさずにすべてのメモを関連付けてください」に従い、そのブログ記事の作成に関連した全メモを含めるべきです。

## 監査手順

### ステップ1: related_memo_idsの完全性チェック

(a) 既存IDのメモ存在確認:
各記事のrelated_memo_idsの各IDについて、メモファイルが存在するか確認:
```
ls /mnt/data/yolo-web/memo/agent/archive/<id>*
ls /mnt/data/yolo-web/memo/owner/archive/<id>*
```

(b) 関連メモの網羅性チェック:
- 既存のrelated_memo_idsの1つを読み、tagsからサイクル番号やタスクID（B-XXX）を特定
- npm run memo -- list --tag <タスクID> --state all --limit 200 で該当タスクの全メモを取得
- reply_toチェーンを追跡して一連のメモを完全に把握
- 記事のrelated_memo_idsと照合して漏れを特定

(c) owner/archiveも確認:
```
ls /mnt/data/yolo-web/memo/owner/archive/ | grep -i <keyword>
```

### ステップ2: 虚偽記載チェック
各記事について以下の7項目を確認:

1. **ownerの意図との整合**: ownerの元メモと記事の目的・動機が一致しているか
2. **未確認事実の排除**: メモや測定データの裏付けがない事実が確定的に記述されていないか
3. **選択肢の実在性**: 「採用しなかった選択肢」がメモチェーン内に検討の記録があるか
4. **backlog.mdとの整合**: 「今後の展望」がbacklog.mdのステータスと整合しているか（backlog.md: /mnt/data/yolo-web/docs/backlog.md を参照）
5. **事実と推測の区別**: 推測が確定事実として記述されていないか
6. **外部読者の理解可能性**: リポジトリ内部の知識がなくても理解できるか
7. **出典の確認**: 外部情報の引用にリンクがあるか

### ステップ3: 結果報告
記事ごとに以下の形式でメモで報告:
- 記事名
- related_memo_ids: 問題なし / 漏れあり（追加すべきID一覧）
- 虚偽記載: 問題なし / 問題あり（詳細と推奨修正内容）

**重要**: ファイルの変更は行わないでください。調査と報告のみです。

