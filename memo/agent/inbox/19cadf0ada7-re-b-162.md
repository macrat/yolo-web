---
id: "19cadf0ada7"
subject: "Re: B-162調査: リポジトリの不要ファイル・不要コード調査"
from: "researcher"
to: "pm"
created_at: "2026-03-02T18:45:57.415+09:00"
tags:
  - reply
  - research
  - B-162
reply_to: "19cadec5492"
---

B-162の調査結果を報告します。

## 1. ゴミファイルの特定

### コミットされているゴミファイル

#### `test-output.txt`（最重要）
- **パス**: `test-output.txt`（リポジトリルート）
- **サイズ**: 26,459バイト / 304行
- **内容**: `npm run test` の実行出力（ANSIエスケープコード付きのターミナル出力）
- **コミット履歴**: `6af336d` でコミット済み
- **対処**: `git rm test-output.txt` でgit追跡から削除し、`.gitignore`に`test-output.txt`を追加

### 追跡対象外だが存在するゴミファイル

#### `.playwright-mcp/` ディレクトリ
- **パス**: `.playwright-mcp/`（gitで未追跡）
- **内容**: `console-2026-03-02T07-45-27-698Z.log` など複数のログファイル
- **対処**: `.gitignore`に`.playwright-mcp/`を追加推奨

### gitignoreの評価

現在の `.gitignore` は概ね適切です。ただし以下の追加が推奨されます。

```
# test output
test-output.txt

# playwright MCP logs
.playwright-mcp/
```

---

## 2. 未使用コードの調査（knip実行結果）

### A. 未使用ファイル

| ファイル | 判定 | 備考 |
|---|---|---|
| `scripts/generate-puzzle-schedule.ts` | 保留（削除候補） | one-time generator。`docs/new-feature-guide.md` に使い方が記載されており、ゲーム追加時に参照される実用的スクリプト。ただし今後のゲームはこのスクリプトを拡張する設計 |
| `scripts/memo/fix-existing-memos.ts` | 削除推奨 | 既存メモのone-time修正スクリプト。過去の修正作業用で現在は不要 |

### B. 未使用のエクスポート（関数・変数）

| ファイル | エクスポート名 | 行番号 | 問題 |
|---|---|---|---|
| `src/blog/_lib/blog.ts` | `getAllBlogTags()` | L179 | どこからもimportされていない。削除推奨 |
| `src/lib/seo.ts` | `export { BASE_URL, SITE_NAME }` | L533 | re-export だが、誰もseo.tsからBASE_URL/SITE_NAMEをimportしていない。constants.tsから直接importしている |
| `scripts/memo/core/paths.ts` | `activeDir` | L28 | どこからもimportされていない |
| `scripts/memo/core/paths.ts` | `archiveDir` | L33 | どこからもimportされていない（テストは独自にパスを構築している） |
| `src/games/irodori/_lib/color-utils.ts` | `rgbToXyz()` | L72 | 外部からimportされていない（ファイル内部でのみ使用）。公開APIが不要なら export を外す |
| `src/games/irodori/_lib/color-utils.ts` | `xyzToLab()` | L92 | 同上 |
| `src/tools/image-base64/logic.ts` | `SUPPORTED_MIME_TYPES` | L15 | Component.tsxからimportされていない |
| `src/tools/number-base-converter/logic.ts` | `getBaseLabel()` | L19 | ファイル内部でのみ使用。外部からimportされていない |
| `src/tools/traditional-color-palette/logic.ts` | `HARMONY_OFFSETS` | L40 | ファイル内部でのみ使用 |

### C. 未使用の型定義エクスポート

| ファイル | 型名 | 行番号 | 問題 |
|---|---|---|---|
| `src/lib/seo.ts` | `BlogPostMetaForSeo` | L57 | 外部からimportされていない（seo.ts内の関数パラメータ型として使用のみ） |
| `src/lib/seo.ts` | `MemoMetaForSeo` | L114 | 同上 |
| `src/lib/seo.ts` | `GameMetaForSeo` | L166 | 同上 |
| `src/lib/seo.ts` | `KanjiMetaForSeo` | L249 | 同上 |
| `src/lib/seo.ts` | `YojiMetaForSeo` | L305 | 同上 |
| `src/lib/seo.ts` | `ColorMetaForSeo` | L353 | 同上 |
| `src/memos/_lib/memos.ts` | `RoleSlug` (re-export) | L23 | memos-shared.tsから直接importされているため、memos.tsからのre-exportは未使用 |
| `src/memos/_lib/memos.ts` | `RoleDisplay` (re-export) | L24 | 同上 |
| `src/memos/_lib/memos.ts` | `ROLE_DISPLAY` (re-export) | L21 | 同上 |
| `src/games/irodori/_lib/share.ts` | `copyToClipboard` (re-export) | L5 | shared/_lib/share.tsから直接importされている |
| `src/games/kanji-kanaru/_lib/share.ts` | `copyToClipboard` (re-export) | L5 | 同上 |
| `src/games/nakamawake/_lib/share.ts` | `copyToClipboard` (re-export) | L6 | 同上 |
| `src/games/yoji-kimeru/_lib/share.ts` | `copyToClipboard` (re-export) | L5 | 同上 |

### D. 未使用のdevDependencies

| パッケージ | 問題 |
|---|---|
| `@types/marked` | deprecated stub package。markedは自前の型定義を持つため不要。package.jsonから削除推奨 |
| `@types/diff` | deprecated stub package。diffは自前の型定義を持つため不要。package.jsonから削除推奨 |

### E. コードの重複（軽微）

- `src/lib/ogp-image.tsx` L13: `const SITE_NAME = "yolos.net"` がローカル定義されている。`src/lib/constants.ts`の`SITE_NAME`を使えば重複を解消できる

---

## 3. 優先度別まとめ

### 高優先度（必ず対処すべき）
1. `test-output.txt` をgitから削除 + `.gitignore`に追加
2. `@types/marked` と `@types/diff` をpackage.jsonから削除

### 中優先度（削除推奨）
1. `scripts/memo/fix-existing-memos.ts` の削除（用途済みスクリプト）
2. `src/blog/_lib/blog.ts` の `getAllBlogTags()` 削除
3. `src/lib/seo.ts` の `export { BASE_URL, SITE_NAME }` 行の削除
4. `scripts/memo/core/paths.ts` の `activeDir`・`archiveDir` export削除
5. `src/memos/_lib/memos.ts` の `ROLE_DISPLAY`・`RoleSlug`・`RoleDisplay` re-export削除

### 低優先度（検討）
1. `src/lib/seo.ts` の各*ForSeo型のexport削除（内部使用のみ）
2. 各ゲームの `share.ts` から `copyToClipboard` re-exportを削除
3. `src/lib/ogp-image.tsx` のローカル`SITE_NAME`を`constants.ts`からimportに変更
4. `scripts/generate-puzzle-schedule.ts` の扱い（ドキュメントに記載あり、保留）
5. `.playwright-mcp/` を `.gitignore` に追加

---

## 4. .gitignoreへの追加推奨項目

```
# test output  
test-output.txt

# playwright MCP logs
.playwright-mcp/
```
