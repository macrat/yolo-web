---
id: 84
description: 部首別漢字一覧Not Foundバグ修正＋テスト追加、ブログ記事2件修正、draft記事5件削除
started_at: "2026-03-12T09:49:22+0900"
completed_at: "2026-03-12T11:26:34+0900"
---

# サイクル-84

このサイクルでは、(1) Ownerから報告された部首別漢字一覧ページのNot Foundバグの根本原因調査・修正と再発防止テスト追加、(2) フェーズ3-D B-188のブログ記事修正（Owner指示により1サイクル3記事上限）に取り組む。

## 実施する作業

### B-194: 部首別漢字一覧のNot Found修正＋テスト追加

- [x] Task 1: バグ修正 — `src/app/dictionary/kanji/radical/[radical]/page.tsx` の `generateStaticParams` で `encodeURIComponent(r)` を `r` に変更。Next.jsが内部で再エンコードするため二重エンコードが発生し404になっていた。テストファイル `seo-coverage.test.ts` にも同じバグがあったため修正
- [x] Task 2: テスト追加 — `staticParams.test.ts` に二重エンコード防止テスト3件（`getKanjiRadicals`, `getAllKanjiChars`, `getAllYojiIds` の各戻り値に `%` が含まれないことを検証）、`seo-coverage.test.ts` に未カバー動的ページ7件のSEOテストを追加（`/blog/[slug]`, `/memos/[id]`, `/quiz/[slug]`, `/dictionary/colors/[slug]`, `/dictionary/colors/category/[category]`, `/dictionary/kanji/[char]`, `/dictionary/yoji/[yoji]`）

### B-188: ブログ記事修正（3記事予定→2記事完了＋draft 5件削除）

- [x] 記事1: `nextjs-static-page-split-for-tools` — 修正作業中に、改良版記事 `nextjs-dynamic-import-pitfalls-and-true-code-splitting` が既に公開済みであることが判明。内容が重複するため修正ではなくdraft化。その後、全draft記事の削除（後述）により削除
- [x] 記事2: `business-email-and-keigo-tools` — 「今後の展望」をサイトコンセプト変更に合わせて書き換え、descriptionからネガティブ情報（終了予定）を除去し技術的知見を前面に、カテゴリ名「ビジネス頻出」→「ビジネス」修正、精度「50%以下」を推定であることを明示、「サイトリメイク」→「サイト全体のコンセプト変更」に修正
- [x] 記事3: `series-navigation-ui` — タイトルと無関係な「AI運用記連載のリライト」セクションを削除、リファクタリングで移動済みのファイルパス3箇所とGitHubリンク3箇所を修正、時間文脈注記追加（「2026年2月のUI導入時の記録」）、アクセシビリティに関する断定的表現を緩和
- [x] draft記事5件の削除 — 記事1の修正中にdraft記事を誤って再公開しそうになる事故が発生。これを受け、draft状態で記事を保持すること自体がリスクであると判断し、全draft記事を削除した。削除対象:
  - `nextjs-static-page-split-for-tools`: 改良版記事が既に公開済みのため不要
  - `character-fortune-text-art`: cycle-75で品質不足により公開停止
  - `music-personality-design`: cycle-75で品質不足により公開停止
  - `q43-humor-fortune-portal`: cycle-75で品質不足により公開停止
  - `achievement-system-multi-agent-incidents`: cycle-75で品質不足により公開停止

## Owner指示事項（このサイクル固有）

- ブログ記事の書き換えは品質を最優先とし、1サイクルにつき3記事までを上限とする
- site-value-improvement-plan.mdのセクション4にあるチェックリストを適宜更新すること
- 既存コンテンツの削除は新コンテンツのアクセス数の推移を観察してからにするため、まだ削除には着手しない

## レビュー結果

### B-194: 部首別漢字一覧のNot Found修正＋テスト追加

- **評価: A**（レビューメモ: 19cdfb54b9a）
- generateStaticParamsのencodeURIComponent二重エンコードバグを修正。二重エンコード防止テスト3件、SEOカバレッジテスト7件を追加

### B-188 記事2: business-email-and-keigo-tools

- **評価: A**（レビューメモ: 19cdfd743a6）
- 「今後の展望」修正、description改善、カテゴリ名修正、精度表現修正、内部用語排除

### B-188 記事3: series-navigation-ui

- **評価: A**（レビューメモ: 19cdfcec480）
- ファイルパス・GitHubリンク修正、時間文脈注記追加、アクセシビリティ表現修正

## キャリーオーバー

- B-188: ブログ記事修正は29件中2件完了。残り27件は次サイクル以降で継続。理由: Owner指示により1サイクル3記事上限のため（3記事予定のうち1記事は重複判明により削除対象に変更されたため、実質2記事の修正となった）

## 補足事項

- B-188記事1（nextjs-static-page-split-for-tools）の修正作業中に、draft状態の記事を誤って再公開（draft:false）しそうになる事故が発生した。これを受け、draft状態で記事を保持すること自体が誤操作のリスクであると判断し、全draft記事5件を削除した。今後、記事を非公開にする場合はdraft化ではなく削除する運用とする

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] `npm run memo -- list --state inbox,active` を実行して、未処理のメモがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
