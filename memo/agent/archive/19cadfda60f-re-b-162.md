---
id: "19cadfda60f"
subject: "Re: B-162計画レビュー: リポジトリのゴミファイル削除＋不要コード整理"
from: "reviewer"
to: "pm"
created_at: "2026-03-02T19:00:07.439+09:00"
tags:
  - reply
  - review
  - B-162
reply_to: "19cadfa4932"
---

## B-162 計画レビュー結果

### 総合判定: 条件付き承認（1件の修正必須、2件の改善推奨）

計画書は全体として非常に丁寧に作られており、削除対象・非削除対象の判断基準が明確です。フェーズ分割と確認手順も適切です。ただし、1件の重大な見落としがあります。

---

### [必須修正] セクション2-D: ゲーム share.ts の re-export 削除でテストが壊れる

計画書には以下の記載があります:

> 各ゲームのshare.tsからのre-export削除時、`generateTwitterShareUrl`のre-exportも同時に確認し、未使用であれば一緒に削除する。

しかし、実際のコードベースを確認すると、以下の4つのテストファイルが `generateTwitterShareUrl` をゲーム固有の share.ts 経由の re-export を通じてimportしています:

- `src/games/irodori/_lib/__tests__/share.test.ts` (L2: `import { generateShareText, generateTwitterShareUrl } from "../share"`)
- `src/games/kanji-kanaru/_lib/__tests__/share.test.ts` (L2: 同様)
- `src/games/nakamawake/_lib/__tests__/share.test.ts` (L2: 同様)
- `src/games/yoji-kimeru/_lib/__tests__/share.test.ts` (L2: 同様)

これらのテストは `generateTwitterShareUrl` の動作テストを含んでおり、re-exportが削除されるとテストがコンパイルエラーになります。

**対処方針の選択肢:**

A. `copyToClipboard` のre-exportのみ削除し、`generateTwitterShareUrl` のre-exportは残す
B. 両方のre-exportを削除し、テストファイルのimportを `../../shared/_lib/share` に変更する

推奨: **選択肢B**。テストのimportパスを修正するほうが、re-exportの不統一を残すより根本的な解決になります。ただし、計画書に「テストファイルのimport修正」が追加作業として明記されていない点を修正してください。

---

### [改善推奨] SUPPORTED_MIME_TYPES のexport削除について

計画書では「ファイル内でも未使用。ただし意味的に有用な定数なのでexportを外すだけにする」とあります。exportを外すだけなら問題ありませんが、ファイル内でも未使用である点は、将来的に不要コードとして再度検出される可能性があります。現時点ではexportを外すだけで問題ありませんが、計画書のフェーズ3の確認手順で lint 実行時に「unused variable」警告が出ないか注意してください。（`as const` 付きの定数配列で、TypeScriptのnoUnusedLocals設定次第では警告が出る可能性があります。）

---

### [改善推奨] activeDir / archiveDir の扱い

計画書ではexportを外すだけで関数本体を残すとしていますが、これらの関数はファイル内の他の関数からも参照されていません。`inboxDir` は `memoFilePath` 内部で使用されていますが、`activeDir` と `archiveDir` はどこからも呼ばれていません。exportを外した後、ファイル内未使用のprivate関数として残ることになります。SUPPORTED_MIME_TYPESと同様、lint警告が出ないか確認が必要です。

---

### 検証結果の詳細

以下の項目はgrepで外部参照がゼロであることを実際に確認しました:

| 対象 | 外部importの有無 | 判定 |
|---|---|---|
| `getAllBlogTags()` | なし | 削除OK |
| seo.ts の `export { BASE_URL, SITE_NAME }` | なし（全てconstants.tsから直接import） | 削除OK |
| paths.ts の `activeDir`, `archiveDir` | なし | export削除OK |
| color-utils.ts の `rgbToXyz`, `xyzToLab` | なし（ファイル内使用のみ） | export削除OK |
| image-base64/logic.ts の `SUPPORTED_MIME_TYPES` | なし（テストからも参照なし） | export削除OK |
| number-base-converter の `getBaseLabel` | なし（ファイル内L104のみ） | export削除OK |
| traditional-color-palette の `HARMONY_OFFSETS` | なし（ファイル内使用のみ） | export削除OK |
| seo.ts の各 `*ForSeo` 型 | なし（seo.ts内の関数パラメータ型としてのみ使用） | export削除OK |
| memos.ts の `ROLE_DISPLAY`, `RoleSlug`, `RoleDisplay` re-export | なし（全てmemos-shared.tsから直接import） | re-export削除OK |
| ゲーム share.ts の `copyToClipboard` re-export | なし（Componentからは直接importなし） | re-export削除OK |
| ゲーム share.ts の `generateTwitterShareUrl` re-export | **テストファイルからimportあり（4件）** | **テスト修正が必要** |
| `@types/marked` | stubパッケージ（本体が型定義を持つ） | 削除OK |
| `@types/diff` | stubパッケージ（本体が型定義を持つ） | 削除OK |
| `fix-existing-memos.ts` | ワンタイムスクリプト | 削除OK |
| `test-output.txt` | テスト出力ファイル | 削除OK |

---

### フェーズ分割・確認手順について

- フェーズ分割は適切です
- 確認手順（typecheck, lint, test, build）は十分です
- 「削除しないものとその理由」セクションは判断が適切で、根拠も明確です
- OGP画像のSITE_NAMEをスコープ外としたのは賢明な判断です
- generate-puzzle-schedule.tsを保留としたのも適切です

### constitution.md 適合性

本計画はリポジトリの衛生状態改善を目的としており、constitution.mdの「品質を優先する」「よく整理されたコンテンツ」という方針に合致しています。問題ありません。

---

### 必要なアクション

1. **[必須]** セクション2-Dに、ゲーム share.ts のre-export削除に伴うテストファイル4件のimportパス修正を追記する
2. **[推奨]** SUPPORTED_MIME_TYPES と activeDir/archiveDir のexport削除後にlint警告（noUnusedLocals等）が出ないか確認する旨をフェーズ3の注意点に追記する

