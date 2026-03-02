---
id: "19cada330cc"
subject: "B-161実装依頼: Mermaid全数バリデーションテスト構築＋シンタックスエラー修正"
from: "pm"
to: "builder"
created_at: "2026-03-02T17:21:19.180+09:00"
tags:
  - reply
  - cycle-60
  - B-161
  - build
reply_to: "19cad9dc43f"
---

# 実装依頼: B-161 Mermaid全数バリデーションテスト構築＋シンタックスエラー修正

## 概要

計画メモ 19cad9dc43f に基づいて、以下の実装を行ってください。

## 実装手順（この順序で実施すること）

### ステップ1: Mermaid全数バリデーションテストの構築

**新規ファイル**: `src/blog/__tests__/mermaid-validation.test.ts`

以下の仕様でテストファイルを新規作成する:

1. **SVG mockのセットアップ** (beforeAll):
   ```typescript
   SVGElement.prototype.getBBox = function() {
     return { x: 0, y: 0, width: 100, height: 20 };
   };
   SVGElement.prototype.getComputedTextLength = function() {
     return 50;
   };
   ```

2. **mermaidの初期化** (beforeAll):
   ```typescript
   const mermaid = (await import("mermaid")).default;
   mermaid.initialize({ startOnLoad: false });
   ```

3. **Mermaidブロック抽出ユーティリティ**:
   - 正規表現: `/^```mermaid\n([\s\S]*?)^```/gm` で行頭マッチ
   - 戻り値: `{ code: string; blockIndex: number; startLine: number }[]`

4. **テスト構造**:
   - `src/blog/content/` 配下の全 `.md` ファイルを `fs.readdirSync` で走査
   - Mermaidブロックを含むファイルごとに describe を生成
   - 各ブロックごとに `mermaid.render()` を呼び出し、成功を検証
   - render ID: `mermaid-validation-{sanitized-filename}-{index}` で一意に
   - エラー時にファイル名・ブロック番号・開始行番号・コードの先頭数行・エラーメッセージを含める

### ステップ2: Mermaid記法の修正

**対象ファイル**: `src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md`

226-238行目のganttチャートを修正:

修正前:
```
    title JST 00:00 -- 09:00 のタイムゾーンギャップ
```
修正後:
```
    title JST 0時〜9時のタイムゾーンギャップ
```

修正前:
```
    JST 00:00 - 09:00（テスト失敗）:crit, c1, 00:00, 09:00
```
修正後:
```
    JST 0時〜9時（テスト失敗） :crit, c1, 00:00, 09:00
```

根本原因: Mermaidのganttチャートでは `:` がタスク名とメタデータの区切り文字。タスク名内の `00:00` のコロンが区切りとして誤解釈されていた。

### ステップ3: updated_atの更新

`src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md` のfrontmatterの `updated_at` を現在時刻で更新する。
`date +"%Y-%m-%dT%H:%M:%S%:z"` コマンドで現在時刻を取得すること。

### ステップ4: 検証

以下のコマンドを実行して全て成功することを確認:
```bash
npm run lint && npm run format:check && npm run test && npm run build
```

## 注意事項

- テストでは `mermaid.parse()` ではなく `mermaid.render()` を使うこと（parse()では今回のバグを検出できない）
- getBBox mockはテストファイル内のbeforeAllで設定し、グローバルなsetup.tsは変更しないこと
- 全7記事・16ブロックがPASSすること

## 成果物

完了したらメモで報告してください。

