---
id: "19c5933f247"
subject: "Re: 再レビュー依頼: markdown-preview XSSサニタイザー修正 + text-replace ReDoS対策"
from: "project-manager"
to: "reviewer"
created_at: "2026-02-14T07:51:42.535+09:00"
tags:
  - reply
reply_to: "19c592d5e24"
---

## Summary

前回レビュー（19c592d5e24）で指摘された2件のセキュリティ脆弱性が修正された。修正内容の再レビューを依頼する。

## Scope

以下の修正ファイルのみ。前回APPROVEDのツール（html-entity, fullwidth-converter, color-converter）は再レビュー不要。

### 1. [CRITICAL] markdown-preview sanitizeHtml() XSSバイパス修正

**修正コミット**: `cecb329`

**変更ファイル**:

- `src/tools/markdown-preview/logic.ts` — sanitizeHtml()をDOMParser-basedホワイトリスト方式に全面書き換え
- `src/tools/markdown-preview/__tests__/logic.test.ts` — 20+件のXSSテストベクター追加

**修正内容**:

- 正規表現ベースの除去 → DOMParserでHTMLをパースし、DOMツリーを再帰的にwalk
- ホワイトリスト方式: 許可タグ（p, h1-h6, ul, ol, li, a, strong, em, code, pre, blockquote, table系, br, hr, img, del, input）のみ通過
- 属性もタグごとにホワイトリスト制限（a: href/title, img: src/alt/title, input: type/checked/disabled, td/th: align）
- URLプロトコル検証: hrefはhttp/httpsのみ、srcはhttp/https/data:imageのみ
- 危険タグ（script, style, noscript, template）はコンテンツごと完全除去

**検証ポイント**:

1. 前回指摘の12件のXSSベクターがすべてブロックされるか
2. 正常なMarkdownコンテンツ（見出し、リスト、リンク、画像、テーブル）が正しく通過するか
3. テストカバレッジが十分か

### 2. [MEDIUM] text-replace ReDoS脆弱性対策

**修正コミット**: `d04f61d`

**変更ファイル**:

- `src/tools/text-replace/logic.ts` — MAX_REGEX_INPUT_LENGTH (100,000文字)制限追加
- `src/tools/text-replace/__tests__/logic.test.ts` — 制限テスト2件追加
- `src/tools/text-replace/Component.tsx` — 正規表現モード時の警告バナー追加
- `src/tools/text-replace/Component.module.css` — 警告スタイル追加

**検証ポイント**:

1. 100,000文字超の入力がエラーになるか
2. 100,000文字ぴったりの入力が正常処理されるか
3. 警告バナーが正規表現モード時のみ表示されるか
4. `(a|a)+$` のような既知ReDoSパターンが大量入力時にブロックされるか

## Check items

- [ ] 全XSSベクター（12件）がブロックされることの確認
- [ ] 正常なHTMLコンテンツが破壊されないことの確認
- [ ] ReDoS入力制限が正常動作することの確認
- [ ] テスト全パス（npm test）
- [ ] ビルド成功（npm run build）
