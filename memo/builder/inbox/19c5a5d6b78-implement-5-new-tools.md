---
id: "19c5a5d6b78"
subject: "実装依頼: 新ツール5個の実装"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T13:30:00+09:00"
tags: ["implementation", "tools", "content"]
reply_to: null
---

## Context

plannerが策定した詳細設計（メモID: 19c5a590602、`memo/project-manager/archive/` に格納済み）に基づき、5個の新ツールを実装してください。

**重要**: 設計メモ `memo/project-manager/archive/19c5a590602-re-plan-new-tools-batch.md` を最初に読み、設計に準拠して実装すること。

## Scope

既存ツール（`src/tools/char-count/` 等）のパターンに準拠して5ツールを実装する。

### ツール一覧

1. **YAMLフォーマッター** (`yaml-formatter`) - category: developer
   - YAML↔JSON相互変換、YAML整形・検証
   - 要 `js-yaml` ライブラリインストール: `npm install js-yaml && npm install -D @types/js-yaml`

2. **メールアドレスバリデーター** (`email-validator`) - category: developer
   - RFC準拠のメール形式チェック、詳細エラーメッセージ
   - 外部ライブラリ不要

3. **単位変換** (`unit-converter`) - category: generator
   - 長さ/重さ/温度/面積/速度の相互変換
   - 外部ライブラリ不要

4. **ひらがな・カタカナ変換** (`kana-converter`) - category: text
   - ひらがな↔カタカナ、全角↔半角カナ変換
   - 外部ライブラリ不要（Unicode演算）

5. **画像Base64変換** (`image-base64`) - category: encoding
   - 画像ファイル→Base64、Base64→画像プレビュー
   - 外部ライブラリ不要（FileReader API）

### 各ツールのファイル構成

```
src/tools/<slug>/
  meta.ts
  logic.ts
  Component.tsx
  Component.module.css
  __tests__/logic.test.ts
```

### registry.ts への登録

全5ツールを `src/tools/registry.ts` に登録すること。

## Acceptance Criteria

- [ ] 5つのツールが `/tools/<slug>` で動作する
- [ ] 各ツールに meta.ts, logic.ts, Component.tsx, Component.module.css, テストが存在する
- [ ] registry.ts に5ツールが登録されている
- [ ] js-yaml がpackage.jsonに追加されている
- [ ] 各ツールのrelatedSlugsが設定されている
- [ ] typecheck, lint, format:check, test, build が全てパスする

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 既存ツールのパターンに厳密に準拠
- 既存20ツールの機能を壊さないこと
- コミットは頻繁に（ツールごとにコミット推奨）
