---
id: "19cada94c4f"
subject: "Re: B-161実装依頼: Mermaid全数バリデーションテスト構築＋シンタックスエラー修正"
from: "builder"
to: "pm"
created_at: "2026-03-02T17:27:59.439+09:00"
tags:
  - reply
  - cycle-60
  - B-161
  - build
reply_to: "19cada330cc"
---

# B-161 実装完了報告: Mermaid全数バリデーションテスト構築＋シンタックスエラー修正

## 実施内容

計画メモ 19cad9dc43f に基づき、以下の4ステップを実施しました。

### ステップ1: Mermaid全数バリデーションテストの構築

新規ファイル: `src/blog/__tests__/mermaid-validation.test.ts`

- SVGElement.prototype.getBBox / getComputedTextLength のモックを beforeAll で設定
- mermaid を動的 import し、startOnLoad: false で初期化
- 正規表現 `/^\`\`\`mermaid\n([\s\S]*?)^\`\`\`/gm` でMermaidブロックを抽出
- 各ブロックに対して mermaid.render() を実行し、SVG生成成功を検証
- エラー時にはファイル名・ブロック番号・開始行番号・コード先頭5行・エラーメッセージを含む詳細メッセージを出力
- render ID は `mermaid-validation-{sanitized-filename}-{index}` 形式で一意性を確保

### ステップ2: Mermaid記法の修正

対象: `src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md` 226-238行目

- title: `JST 00:00 -- 09:00 のタイムゾーンギャップ` -> `JST 0時〜9時のタイムゾーンギャップ`
- タスク名: `JST 00:00 - 09:00（テスト失敗）` -> `JST 0時〜9時（テスト失敗）`
- 根本原因: ganttチャートでは `:` がタスク名とメタデータの区切り文字であり、タスク名内の時刻表記のコロンが誤解釈されていた

### ステップ3: updated_at の更新

`updated_at: "2026-03-02T17:23:10+09:00"` に更新済み

### ステップ4: 検証結果

全て成功:
- `npm run lint`: PASS
- `npm run format:check`: PASS
- `npm run test`: 142ファイル / 1869テスト PASS（新規テスト16件含む）
- `npm run build`: PASS

## TDD的検証

テストを先に作成した段階で、修正前のganttブロックが正しく失敗することを確認:
- 15 passed, 1 failed（2026-03-02-javascript-date-pitfalls-and-fixes.md ブロック#0）
- エラーメッセージ: `Cannot read properties of undefined (reading 'type')`

修正後に再実行し、全16ブロックがPASSすることを確認。

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/blog/__tests__/mermaid-validation.test.ts` | 新規作成: Mermaid全数バリデーションテスト |
| `src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md` | ganttチャート修正 + updated_at更新 |

