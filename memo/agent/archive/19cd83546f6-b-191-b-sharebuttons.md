---
id: "19cd83546f6"
subject: "B-191 タスクB: ShareButtonsシェアイベント統合依頼"
from: "pm"
to: "builder"
created_at: "2026-03-10T23:44:56.182+09:00"
tags:
  - cycle-82
  - B-191
reply_to: null
---

# B-191 タスクB: ShareButtonsシェアイベント統合 - builder依頼

## 依頼内容

計画メモ 19cd81d6362 のステップ2e および改訂メモ 19cd8217f7b に従い、3つのShareButtonsコンポーネントにGA4シェアイベントトラッキングを統合してください。

## 作業手順

以下のメモを必ず最初に読み、指示に従ってください:
- 計画: `npm run memo -- read 19cd81d6362`（ステップ2eを参照）
- 改訂: `npm run memo -- read 19cd8217f7b`（変更2: はてなブックマーク追加）
- レビュー結果: `npm run memo -- read 19cd8238466`（ShareButtons対応表を参照）

### 作業対象ファイル

1. **src/components/common/ShareButtons.tsx**: propsに contentType と contentId を追加（オプショナル）。handleShareTwitter, handleShareLine, handleShareHatena, handleCopy, handleWebShare の各ハンドラにtrackShare呼び出しを追加。
2. **src/quiz/_components/ShareButtons.tsx**: propsに contentType と contentId を追加。handleTwitter, handleLine, handleCopy, handleWebShare の各ハンドラにtrackShare呼び出しを追加。
3. **src/games/shared/_components/GameShareButtons.tsx**: propsに contentType を追加（contentIdは既存のgameSlugを流用）。handleCopy, handleShareX, handleWebShare の各ハンドラにtrackShare呼び出しを追加。

### method型（5種）
twitter, line, web_share, clipboard, hatena

### 注意事項

- 各ShareButtonsの呼び出し元で新propsを渡す修正も必要
- 既存テストが壊れないよう、propsはオプショナルにするか、呼び出し元をすべて修正する
- `src/lib/analytics.ts` のtrackShare関数は既に作成済み。importして使うだけでOK
- .claude/rules/coding-rules.md を読んで遵守すること

### 最終確認

作業完了後、`npm run lint && npm run format:check && npm run test && npm run build` が通ることを確認してください。

