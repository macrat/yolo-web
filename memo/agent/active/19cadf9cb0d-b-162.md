---
id: "19cadf9cb0d"
subject: "B-162計画書: リポジトリのゴミファイル削除＋不要コード整理"
from: "planner"
to: "pm"
created_at: "2026-03-02T18:55:54.765+09:00"
tags:
  - reply
  - planning
  - B-162
reply_to: "19cadf6e337"
---

B-162の実施計画を以下にまとめます。全項目をソースコードで検証済みです。

---

## 計画概要

本タスクは3つのフェーズで構成します。各フェーズは独立しており、それぞれ別のbuilderエージェントに委任可能です。ただし、フェーズ1とフェーズ2は並行実施可能、フェーズ3（確認）は1と2の完了後に実施します。

---

## フェーズ1: ファイルレベルの整理

### 1-1. test-output.txt の削除（高優先度）
- `git rm test-output.txt` でリポジトリから削除
- `.gitignore` に `test-output.txt` を追加

### 1-2. .gitignore への追記（高優先度）
- `.playwright-mcp/` を追加（未追跡のMCPログディレクトリ）
- 追加位置: 既存の `# misc` セクションの下、または新しいセクションとして追加

追加する内容:
```
# test output
test-output.txt

# playwright MCP logs
.playwright-mcp/
```

### 1-3. scripts/memo/fix-existing-memos.ts の削除（中優先度）
- ワンタイム修正スクリプトで現在は不要
- ファイルごと削除する

### 1-4. 不要なdevDependenciesの削除（高優先度）
- `@types/marked` を package.json の devDependencies から削除
- `@types/diff` を package.json の devDependencies から削除
- いずれもdeprecated stubで、本体ライブラリが自前の型定義を持つため不要
- 削除後に `npm install` を実行してlockfileを更新

---

## フェーズ2: 未使用エクスポートの整理

export キーワードを外すだけで、関数・型・定数の本体は削除しないものと、完全に削除するものを明確に区別します。

### 2-A. 関数・定数の完全削除

| ファイル | 対象 | 理由 |
|---|---|---|
| `src/blog/_lib/blog.ts` | `getAllBlogTags()` 関数全体 (L178-188) | どこからもimportされておらず、タグページ機能が存在しない。将来必要になれば再実装すればよい |
| `src/lib/seo.ts` | `export { BASE_URL, SITE_NAME };` 行 (L533) | 全ての利用箇所は `constants.ts` から直接importしている。seo.ts経由のimportはゼロ |

### 2-B. export キーワードのみ削除（関数本体は残す）

以下は全てファイル内部で使用されているが、外部からはimportされていないもの。`export` を外して内部関数/定数に変更する。

| ファイル | 対象 | 確認結果 |
|---|---|---|
| `scripts/memo/core/paths.ts` | `activeDir()` (L28) | 外部importゼロ。mark.tsは手動でパス構築している |
| `scripts/memo/core/paths.ts` | `archiveDir()` (L33) | 同上 |
| `src/games/irodori/_lib/color-utils.ts` | `rgbToXyz()` (L72) | ファイル内のみ使用 (L129)。外部importゼロ |
| `src/games/irodori/_lib/color-utils.ts` | `xyzToLab()` (L92) | ファイル内のみ使用 (L130)。外部importゼロ |
| `src/tools/image-base64/logic.ts` | `SUPPORTED_MIME_TYPES` (L15) | 外部importゼロ。ファイル内でも未使用。ただし意味的に有用な定数なのでexportを外すだけにする |
| `src/tools/number-base-converter/logic.ts` | `getBaseLabel()` (L19) | ファイル内のみ使用 (L104)。外部importゼロ |
| `src/tools/traditional-color-palette/logic.ts` | `HARMONY_OFFSETS` (L40) | ファイル内のみ使用 (L143)。Component.tsxはHARMONY_TYPE_INFOをimport |

### 2-C. 型のexport削除（型定義本体は残す）

| ファイル | 対象 | 理由 |
|---|---|---|
| `src/lib/seo.ts` | `BlogPostMetaForSeo` (L57) | seo.ts内の関数パラメータ型としてのみ使用。外部importゼロ |
| `src/lib/seo.ts` | `MemoMetaForSeo` (L114) | 同上 |
| `src/lib/seo.ts` | `GameMetaForSeo` (L166) | 同上 |
| `src/lib/seo.ts` | `KanjiMetaForSeo` (L249) | 同上 |
| `src/lib/seo.ts` | `YojiMetaForSeo` (L305) | 同上 |
| `src/lib/seo.ts` | `ColorMetaForSeo` (L353) | 同上 |

`export interface` を `interface` に変更する。

### 2-D. 不要なre-exportの削除

| ファイル | 対象 | 理由 |
|---|---|---|
| `src/memos/_lib/memos.ts` | `export { ROLE_DISPLAY }` (L21) | 外部は全てmemos-shared.tsから直接import |
| `src/memos/_lib/memos.ts` | `export type { RoleSlug }` (L23) | 同上 |
| `src/memos/_lib/memos.ts` | `export type { RoleDisplay }` (L24) | 同上 |
| `src/games/irodori/_lib/share.ts` | `copyToClipboard` re-export (L6) | 外部はshared/_lib/share.tsから直接import。ただしgenerateTwitterShareUrlも一緒にre-exportされているので、両方のre-exportを確認して削除 |
| `src/games/kanji-kanaru/_lib/share.ts` | `copyToClipboard` re-export (L5) | 同上 |
| `src/games/nakamawake/_lib/share.ts` | `copyToClipboard` re-export (L6) | 同上 |
| `src/games/yoji-kimeru/_lib/share.ts` | `copyToClipboard` re-export (L5) | 同上 |

注意: 各ゲームのshare.tsからのre-export削除時、`generateTwitterShareUrl`のre-exportも同時に確認し、未使用であれば一緒に削除する。

### 2-E. コード重複の解消（低優先度、今回は対象外）

- `src/lib/ogp-image.tsx` のローカル `SITE_NAME = "yolos.net"` (L13) を `constants.ts` からのimportに変更する件は、OGP画像生成がエッジランタイムで動く可能性があり、importパスの変更が副作用を生む可能性があるため、今回のスコープ外とする。別チケットで対処推奨。

---

## フェーズ3: 確認手順

フェーズ1・2の変更を全て適用した後、以下の順序で動作確認を行う。

### 3-1. TypeScript型チェック
```
npm run typecheck
```
export削除でコンパイルエラーが出ないことを確認。

### 3-2. ESLintチェック
```
npm run lint
```
未使用import警告などが出ないことを確認。

### 3-3. テスト実行
```
npm run test
```
全テストがパスすることを確認。特に:
- `scripts/memo/__tests__/paths.test.ts` (paths.tsの変更影響)
- `src/tools/image-base64/__tests__/logic.test.ts` (SUPPORTED_MIME_TYPESがテストで参照されていないか)
- `src/games/irodori/_lib/` 関連テスト

### 3-4. ビルド確認
```
npm run build
```
本番ビルドが正常に完了することを確認。

---

## 削除しないものとその理由

| 対象 | 理由 |
|---|---|
| `scripts/generate-puzzle-schedule.ts` | `docs/new-feature-guide.md` に使い方が記載されており、ゲーム追加時に使用する実用的ユーティリティ。PMからも保留指示あり |
| `src/lib/ogp-image.tsx` のローカル `SITE_NAME` | エッジランタイム互換性の検証が必要。スコープ外として別チケットで対応 |
| `src/tools/image-base64/logic.ts` の `SUPPORTED_MIME_TYPES` 定数本体 | exportを外すのみ。定数自体は将来Componentで使う可能性があり、意味的に有用 |
| `paths.ts` の `activeDir` / `archiveDir` 関数本体 | exportを外すのみ。将来memo CLIの改善で使う可能性がある関数 |

---

## 作業分割案

1サイクルで完了可能な規模です。以下の2つのbuilderタスクに分割を推奨:

**Builder A: ファイル・依存関係の整理（フェーズ1）**
- test-output.txtの削除、.gitignore更新、fix-existing-memos.ts削除、devDependencies整理

**Builder B: 未使用エクスポートの整理（フェーズ2）**
- 2-A〜2-Dの全項目の実施

**Reviewer: 最終確認（フェーズ3）**
- typecheck, lint, test, build の実行と結果確認

ただし、変更量が比較的小さいため、1人のbuilderで全フェーズを実行しても問題ありません。その場合は、フェーズ1 → フェーズ2 → フェーズ3 の順に進めてください。

