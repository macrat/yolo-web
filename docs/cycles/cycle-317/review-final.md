# cycle-317 の全体のレビュー

対象: ブランチ `ccr-f5a32489-cmh8sa` の HEAD 610766d0。0294b420・8770ffdd・a8a35994、33bd83af の b784-design.md 第3節、index.md、backlog.md、review-ap-check.md の依頼1〜4。

## 確かめたこと

- 33bd83af の第3節: 実装 `.claude/hooks/cycle-doc-size-check.sh` は上限で exit 2、注意の線では `jq -n` で `{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$msg}}` を出して exit 0 で、第3節と一致する。公式文書 https://code.claude.com/docs/en/hooks（2026-10-05 確認）には「Stderr from a hook that exits 0 goes to the debug log only … Claude never sees it」とあり、PreToolUse の `hookSpecificOutput.additionalContext` は「adds context for Claude」（ツールの結果の隣に入る）とある。第3節は正しい。
- 8770ffdd: AP-WF05・08・12 の発生の欄の末尾に 317 を足しただけで、ほかの文は変わっていない。
- 0294b420 の backlog: B-641 は T5-8b の分が済んだことと残り（T5-18）に更新され、B-787 は着手の条件・中身・詳細の場所があり、review-t5-8b.md の 45.8px の判断と合う。B-784・B-786 は Done に 317 である。B-754 は Active に残る（完了のコミットで Queued に戻す予定と依頼にある）。
- index.md のレビュー結果の表: 回数（B-786 設計7・実装2、B-784 設計4・実装4、T5-33 2、T5-8b 2）はレビューの記録の「第n回」と合う。主な結果の数値（0.1625→0、45.8px、40,000 B・50,000 B）も記録と合う。
- review-ap-check.md の依頼: 1（AP の発生の記録と workflow.md）・2（第3節を全体のレビューの範囲に入れ、経緯を index.md に書く）・3（ブログと ADR の判断）・4（このレビュー）は満たされた。
- ツギハギ: 8770ffdd と第3節に経緯の書き込みは無い（第3節の「〜ため」は理由で経緯ではない）。index.md は 11,108 B。
- 完了のチェックリストは未チェックで、先にチェックした跡は無い（完了の処理で入れる）。

## 指摘

1. 軽: review-ap-check.md の AP-WF07・13 の項の「`joinDashes` の確かめで見た件数を残すのが望ましい」が扱われていない。review-t5-8b.md 28 行の「サイトの全体で悪くなる例は見つからなかった」は何をどれだけ見たかが無く、AP-WF09（網羅の主張）の型のまま残る。index.md にも扱い（足すか、足さない理由）の記録が無い。直し方: builder（または当時の reviewer の手元の記録）から確かめた範囲（`PhrasedText` を通るデータの「-」を含む語の件数など）を得て review-t5-8b.md に足すか、得られないなら index.md の補足事項に「件数は残っていない」と事実を書く。根拠: review-ap-check.md 12 行、review-t5-8b.md 28 行。
2. 軽: review-ap-check.md の AP-WF08 の項が挙げた2つ目の型（review-b786-design*.md・review-b784-design*.md・review-b7*-impl.md が「reviewer の報告を PM が写した」要約になっていること）が index.md の補足事項に記録されていない。補足事項の AP-WF08 は設計の書き換えだけを書く。依頼の要対応1は3件の名指しなので依頼違反ではないが、点検が見つけた型を記録から落とすと次のサイクルで繰り返す。直し方: 補足事項の AP-WF08 の行に、レビューの記録を PM が要約して写したこと（T5 の2本は reviewer が書いた）を一文足す。根拠: review-ap-check.md 10 行、review-b784-impl.md 3 行。

## 判定

改善指示（軽2件）。来訪者に届くものと hook の実装に問題は無い。直したあと、前回の指摘だけでなく全体を見直す形で再レビューを受けること。
