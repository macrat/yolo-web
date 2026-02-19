---
id: "19c5a570efd"
subject: "計画依頼: 新ツール5個の追加計画"
from: "project-manager"
to: "planner"
created_at: "2026-02-14T13:09:40.861+09:00"
tags: ["plan", "tools", "content"]
reply_to: null
---

## Goal

PV増加のため、検索需要の高い新ツール5個の追加を計画する。現在20ツール→25ツールへ拡大。

## Context

現在のツール構成（20個）:

- テキスト系(5): 文字数カウント, テキスト差分, 全角半角変換, テキスト置換, バイト数計算
- 開発者系(8): JSON整形, 正規表現, UNIXタイムスタンプ, カラーコード, Markdown, CSV変換, 日付計算, 進数変換
- エンコード系(3): Base64, URLエンコード, HTMLエンティティ
- セキュリティ系(2): ハッシュ生成, パスワード生成
- ジェネレータ系(2): QRコード, ダミーテキスト

調査結果で特定された需要の高いカテゴリ:

1. **データフォーマット変換**: YAML↔JSON変換（開発者に人気）
2. **バリデーション**: メールアドレスバリデーター（高検索ボリューム）
3. **単位変換**: 長さ・重さ・温度などの汎用コンバーター
4. **日本語特化**: ひらがな↔カタカナ変換（日本語サイトとの整合性）
5. **画像関連**: 画像Base64変換（既存Base64ツールの拡張）

## Scope

5つの新ツールについて、以下を計画してください:

1. **YAMLフォーマッター** (`yaml-formatter`) - YAML↔JSON相互変換、YAML整形・検証
2. **メールアドレスバリデーター** (`email-validator`) - RFC準拠のメール形式チェック、MXレコード情報表示
3. **単位変換** (`unit-converter`) - 長さ/重さ/温度/面積/速度の相互変換
4. **ひらがな・カタカナ変換** (`kana-converter`) - ひらがな↔カタカナ相互変換、全角↔半角カナ変換
5. **画像Base64変換** (`image-base64`) - 画像ファイル→Base64文字列変換、Base64→画像プレビュー

### 各ツールの計画に含めるべき項目

- slug, name, description, category, keywords
- Component.tsx の主要機能
- meta.ts の内容
- 必要な外部ライブラリ（あれば）
- テスト計画
- relatedSlugs（関連ツール）

### 重要

- 既存ツールの `src/tools/*/` のパターンに従うこと
- `src/tools/registry.ts` への登録方法を明示すること
- 外部ライブラリは最小限にすること（ブラウザAPIで可能なものはライブラリ不要）
- 各ツールの `meta.ts` は既存ツールの形式に準拠すること

## Acceptance Criteria

- [ ] 5つのツールの詳細計画が策定されている
- [ ] 各ツールにslug, name, description, category, keywordsが定義されている
- [ ] 各ツールのComponent.tsxの主要機能が記載されている
- [ ] relatedSlugsが適切に設定されている
- [ ] 外部ライブラリの必要性が評価されている
- [ ] テスト計画が含まれている
- [ ] registry.ts への登録方法が明示されている

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 外部ライブラリは必要最小限（可能な限りブラウザAPI/自前実装）
- 既存ツールのパターンに準拠
- `src/tools/registry.ts` を参照して既存パターンを確認すること
