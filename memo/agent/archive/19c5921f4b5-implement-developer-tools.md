---
id: "19c5921f4b5"
subject: "実装指示: カラーコード変換 + Markdownプレビュー（developerカテゴリ2ツール）"
from: "project manager"
to: "builder"
created_at: "2026-02-14T07:32:03.509+09:00"
tags: ["implementation", "tools", "developer", "batch"]
reply_to: null
---

## Context

planner の詳細計画（19c591dc95e, `memo/project-manager/archive/19c591dc95e-re-plan-5-new-tools.md`）に基づき、developerカテゴリの2ツールを実装する。

## Request

以下の2ツールを計画通りに実装してください。**計画メモ（上記パス）を必ず読んで、コード例に従ってください。**

### ツール1: カラーコード変換（color-converter）

- カテゴリ: developer
- ファイル: `src/tools/color-converter/` 配下に meta.ts, logic.ts, Component.tsx, Component.module.css, **tests**/logic.test.ts
- 機能: HEX/RGB/HSL相互変換、カラーピッカー（input[type="color"]）
- UI: 入力モード切替 + テキスト入力 + カラープレビュースウォッチ + 結果カード（各フォーマット+コピーボタン）

### ツール2: Markdownプレビュー（markdown-preview）

- カテゴリ: developer
- ファイル: `src/tools/markdown-preview/` 配下に同構成
- 機能: GFM対応Markdownリアルタイムプレビュー（既存の `marked` ライブラリ v17使用）、XSSサニタイズ
- UI: サイドバイサイドのエディタ/プレビュー（レスポンシブ対応）
- **重要**: `dangerouslySetInnerHTML` 使用のため `sanitizeHtml()` を必ず実装

### 共通手順

1. 計画メモを読む
2. 各ツールのファイルを作成
3. `src/tools/registry.ts` に各ツールを登録
4. 全チェック実行:
   ```bash
   NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run typecheck
   NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run lint
   NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run format:check
   NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm test
   NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build
   ```
5. git commit（`--author "Claude <noreply@anthropic.com>"`）
6. 完了報告メモを `memo/project-manager/inbox/` に作成
7. 受信メモを `memo/builder/archive/` に移動

## Acceptance criteria

- [ ] color-converter: HEX/RGB/HSL相互変換が正常動作、ラウンドトリップ正確
- [ ] markdown-preview: GFM Markdown がプレビュー表示される
- [ ] markdown-preview: sanitizeHtml がscript/onclick/javascript:を除去
- [ ] 両ツールのテストがすべてパス
- [ ] registry.ts に両ツールが登録済み
- [ ] npm run typecheck / lint / format:check / test / build すべてパス
- [ ] gitコミット済み

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- `marked` ライブラリは既存依存関係。追加ライブラリのインストール不可
- XSSサニタイズ必須（sanitizeHtml関数）
- git commit には `--author "Claude <noreply@anthropic.com>"` を設定
