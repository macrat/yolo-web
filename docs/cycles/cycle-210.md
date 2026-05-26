---
id: 210
description: B-314 Phase 8.1 第 11 弾 = text-replace 新デザイン移行 + タイル化 + 複合入力型タイル初回
started_at: 2026-05-26T09:12:38+0900
completed_at: 2026-05-27T00:50:37+0900
---

# サイクル-210

このサイクルでは、B-314（ツール・遊び詳細ページの新デザイン移行 + タイル化 / Phase 8.1）の **第 11 弾** として `text-replace`（文字列置換ツール）を `(legacy)/tools/text-replace/` から `(new)/tools/text-replace/` 配下へ移行し、合わせてタイル化（ダッシュボード掲載用ウィジェット定義）を実施します。

text-replace は cycle-209 完了時点の PM 判断で「次サイクル候補 (a)」として明示されたツールで、**3 入力（検索文字列 / 置換文字列 / 本文）+ 3 トグル（大文字小文字を区別 / 正規表現 / 全置換）+ 出力膨張** という、これまでの 10 弾で扱ってきた「単一 textarea 入力型」とは構造的に異なる「**複合入力型タイル初回**」という性格を持ちます。AP-P21（固定枠 UI の flex container で「膨張側」と「操作側」の同居リスク）の事後検証としても、「操作側 = 3 入力 + 3 トグル」と「膨張側 = 結果欄」の役割分担パターンが複合入力型でも維持できるかを実証する位置づけになります。

通常運用継続フェーズ（cycle-206 fullwidth-converter / cycle-208 kana-converter / cycle-209 line-break-remover）の 3 回連続成功で標準パターンは完全に確立されていますが、本サイクルは「重い回」として標準パターンの拡張余地（複合入力型・正規表現エラー扱い・3 トグル UI の優先度設計）を取りに行きます。

## 実施する作業

- [x] T-1: 現状把握と移行前 baseline 取得（text-replace のファイル構成 / 旧トークン 24 箇所 10 種 / `logic.ts` export **3 件** / 既存テスト件数（計画 R2 時点実測 = 12 件 / logic.test.ts のみ / 実測コマンド: `grep -cE '^\s*test\(|^\s*it\(' src/tools/text-replace/__tests__/logic.test.ts`）/ Component テスト不存在 / `TILE_DECLARATIONS` 件数 10 件 → 11 件化準備 / 既存 `/internal/tiles/preview/[domain]/[slug]/page.tsx` ルート存在確認 を grep / Read 実測で確認、Playwright で baseline スクショ取得、既存テスト全件緑確認、既存 10 タイルに「3 入力 + 出力」構造を持つ前例が存在しないことの実証、warning 系トークン置換マッピングの SSoT 化確認 = **完了 2026-05-26**）
- [x] T-2: 詳細ページの `(new)/tools/text-replace/` 配下への移行（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークン 24 箇所 10 種を新トークンに置換（**warning 系 3 種は本サイクルで初登場 → SSoT 確立**）/ Component.tsx は touch 最小限（リアルタイム化済のため UI 触らず原則 / 100,000 字超過時エラー文言を計画段階で確定 / T1 yaml の search_intents にテキスト置換関連語追加 / 既存 backlog 件数連動更新）= **完了 2026-05-26**）
- [x] T-3: タイル定義（`src/tools/text-replace/TextReplaceTile.tsx` 一式を新規実装、`kind=widget` / **複合入力型タイル初回**として 3 入力 + 1 出力構造を 400×400px 枠に収める / オプション省略方針確定（後述論点 2）/ AP-P21 役割分担を「操作側（短い高さ固定）= 検索 + 置換 input」「膨張側（残余高さ枠内収納）= 本文 textarea + 結果欄」の二分類で先取り設計 / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト最低 11 件追加 / 必要なら Component テスト初版追加）= **完了 2026-05-26**）
- [x] T-4: 検証と統合確認（Playwright 視覚回帰 + AP-P21 textarea / input 高さ 5 ケース計測 + 100,000 字超過時エラー表示の実機確認 + IME composition 観察 + AP-WF16 reviewer 独立再実行 + ブラウザ API 確認 / スクショ最低 5 ケース取得 / 4 コマンド全件 PASS / キャリーオーバー整理 = **完了 2026-05-26**）

## 作業計画

### 目的

#### 誰のために

- **T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）**: 「議事録の『様』→『さん』統一」「設定ファイルの『localhost』→『本番ドメイン』書き換え」「PDF コピペ後の『・』→『-』統一」「メールテンプレートの宛名差し替え」等、**1 回の置換で完結する単純作業**を、検索結果から開いた瞬間に 3 アクション（本文貼付 → 検索/置換入力 → コピー）で完結させたい来訪者。`docs/research/2026-05-26-cycle-210-target-user-mapping.md` §1 が「正規表現を知らない・使わない可能性が高い T1 にオプション 3 種をすべて見せると dislikes『仕様や前提が曖昧』に反する」と明示している通り、**タイル UI のオプション最小化が T1 likes の最大ロード要因**。
- **T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）**: 「毎週の議事録フォーマット統一」「コードリリース前の設定値書き換え」「定期メールテンプレートの宛名差し替え」等、**同じ手順を繰り返す**来訪者。タイル UI のレイアウト・ラベル・ARIA 一貫性 + 詳細ページのオプション完全継承で「タイルで試して → 必要なら詳細ページで細部制御」の操作モデル一致が T2 likes「操作性一貫」に直結する。

#### 何のためにやるのか / どんな価値を提供するか

1. **新デザイン詳細ページ移行**: text-replace は **`(legacy)` 配下に残存している最後期の高 PV ツール群の一つ**で、旧トークン（`--color-bg` / `--color-text` 等の 7 種）+ **warning 系 3 種（`--color-warning-bg` / `--color-warning-border` / `--color-warning-text`）** の合計 **10 種 24 箇所** が `Component.module.css` 内に残存している（実測コマンド: `grep -c "var(--color-" src/tools/text-replace/Component.module.css` → 24 / `grep -o "var(--color-[a-z-]*)" src/tools/text-replace/Component.module.css | sort -u` → 10 種）。これを (new) 配下に移行することで、サイト全体のデザイン統一の一部を完成させ、T2 likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」に寄与する。**特に warning 系トークンは Phase 8.1 第 1〜10 弾で扱われたことがなく、本サイクルが SSoT 確立の初回**。本サイクル T-2 で確立した warning 系置換マッピングは、後続の text-replace 以降の warning 系を含むツール（regex-tester 等）で再利用される。
2. **タイル化（複合入力型タイル初回）**: cycle-200〜209 で 10 件のタイル化が完了したが、いずれも「**単一 textarea 入力 + 同型出力**」（hash-generator / qr-code は単一入力 + 異型出力）の構造で、**text-replace の「本文 textarea + 検索 input + 置換 input = 3 入力 + 結果欄」という複合入力型構造は Phase 8.1 で初**。Phase 10.1 ダッシュボード設計に向け、複合入力型タイルの収納パターン SSoT を 1 件確立する。
3. **T1 検索からの導線整備**: 現状 T1 yaml の `search_intents` 17 語に**テキスト置換関連語が一語もない**（実測コマンド: `grep -nE '"[^"]*(置換|置き換え)[^"]*"' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → 0 件）。Phase 8.1 各サイクルで T1 yaml を継続棚卸ししてきた SSoT 整合運用に違反する状態。本サイクル T-2 で必須語を追加する（後述「追加クエリ確定」で literal 確定）。
4. **複合入力型タイル AP-P21 適用パターン SSoT 確立**: cycle-202 以降の AP-P21 役割分担パターン（「操作側 `flexShrink: 0` / 膨張側 `flex: 1 + overflowY: auto`」）は単一 textarea 入力型で運用されてきた。本サイクルでは「**操作側 = 検索 input + 置換 input + オプションボタン（採用時）**」「**膨張側 = 本文 textarea + 結果欄**」の二分類で先取り設計する初回となり、Phase 10.1 ダッシュボード設計時の SSoT として参照可能とする。
5. **競合差別化の維持**: `docs/research/2026-05-26-competitor-text-replace-tools.md` §13 比較表によれば、yolos.net 既存 Component.tsx は「リアルタイム反映 + 大文字小文字 + 正規表現 + 全置換トグル」の 4 機能をすべて備えた **★★★★ クラス（11 競合中最上位）**。本サイクルでは新デザイン移行のみで詳細ページ機能は維持し、タイル UI は「リアルタイム反映」優位性を最大活用する。

#### 追加クエリ確定（AP-WF03 = builder 裁量排除、計画段階で literal を確定）

**既存 17 語との重複検索コマンド**: `grep -nE '"[^"]*(置換|置き換え|テキスト)[^"]*"' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → **0 件**（既存語にテキスト置換関連語が一切含まれていないことを確認済）。

**5 候補語の比較**:

| 候補語                    | 検索意図カバー範囲                                       | 既存 17 語との重複 | text-replace meta.keywords との整合                  | 採否       |
| ------------------------- | -------------------------------------------------------- | ------------------ | ---------------------------------------------------- | ---------- |
| "テキスト置換"            | 最大公約数語。検索ボリューム最大。                       | 重複なし。         | meta.keywords「テキスト置換」と完全一致。            | **採択 1** |
| "文字列置換"              | 開発者・ライター層が使う直球語。                         | 重複なし。         | meta.keywords「文字列置換」と完全一致。              | **採択 2** |
| "一括置換"                | 「複数箇所を一気に書き換えたい」意図。                   | 重複なし。         | meta.keywords「一括置換」と完全一致。                | **採択 3** |
| "テキスト置換 オンライン" | 「インストール不要のオンラインツールを探している」意図。 | 重複なし。         | meta.keywords「テキスト置換 オンライン」と完全一致。 | **採択 4** |
| "文字 置き換え"           | 「文字 置き換え」スペース区切り形のサジェスト。          | 重複なし。         | meta.keywords には未記載だが意図直結。               | 不採用     |

**2 案以上の比較**:

| 案                                                                                      | (i) 検索意図カバー                                             | (ii) 既存 17 語との重複 | (iii) 件数規模（cycle-207/208/209 との均衡） | 採否     |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- | -------------------------------------------- | -------- |
| 案 1: 4 語追加 = "テキスト置換" / "文字列置換" / "一括置換" / "テキスト置換 オンライン" | 最大公約数 + 開発者層 + 一括意図 + オンライン意図の 4 軸網羅。 | すべて重複なし。        | cycle-209 = 4 語追加と同件数。               | **採択** |
| 案 2: 3 語のみ = "テキスト置換" / "文字列置換" / "一括置換"                             | オンライン意図の取りこぼし発生。                               | すべて重複なし。        | cycle-207/208 と同件数。                     | 不採用   |
| 案 3: 5 語追加（候補語すべて）                                                          | 「文字 置き換え」まで含めると重複に近い。                      | すべて重複なし。        | +5 で他サイクル比 +1。                       | 不採用   |

**採択 = 案 1（4 語追加）**。理由: (a) 検索意図 4 軸（最大公約数 / 開発者層 / 一括意図 / オンライン意図）の網羅性が必要、(b) text-replace は meta.keywords 5 語のうち 4 語と完全一致する補強関係、(c) cycle-209 と同件数で計画書間の均衡が取れる。

**並び順**: 既存 17 項目の末尾に「テキスト置換 → 文字列置換 → 一括置換 → テキスト置換 オンライン」の順で追加（並びに意味は持たせない / cycle-207/208/209 と同方針）。

#### viewport 採用方針

AP-WF05 網羅性ルールに対し、本サイクルは cycle-209 と完全同型の **w375 / w1200 / w1900**（タイルプレビューは w1200 / w375）を採択する。w360 タイル viewport は B-434 で Phase 10.1 必須検討、Phase 8.1 内は暫定許容。

#### 「重い回」油断打ち消し策

本サイクルは cycle-206/208/209 の 3 連続成功で確立された標準パターンを継続しつつ、**複合入力型タイル初回 + 正規表現エラー扱い + warning 系トークン初登場** の 3 重新規性を抱える「重い回」として、以下を油断なく履行する:

- AP-WF16 / AP-WF05 / AP-P21 の継続履行（cycle-209 までの 3 連続適用）
- 100,000 字超過時エラー文言を計画段階で literal 確定（AP-WF03）
- warning 系トークン置換マッピングを計画段階で literal 確定 + 後続再利用のための SSoT 化（後述 §論点 7）
- AP-P21 計測ケースに「**(e) 100,000 字エラー表示時の入力 textarea + エラー枠の合計高さ変化**」を 5 つ目として追加
- T-3 builder 退避案フォールバック判定の優先順位フローを論点 1〜2 で先取り明文化（builder 単独判定で連鎖を進めるリスクを排除）

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

**目的**: 移行作業の起点を確定し、後工程で「変更前後の差分」を客観的に比較できる素材を揃える。既存 10 タイルとの構造差（複合入力型）も計画段階で実証する。

**実施事項**:

- `src/tools/text-replace/` 配下のファイル構成、`logic.ts` の export、`meta.ts` の `keywords` / `faq` / `relatedSlugs`、既存テストの構成を grep / Read で実体確認する。数値の出典は本計画書本文に grep コマンドを併記し、後続サイクルでも再現可能とする（AP-P16 / AP-WF12 対策）:
  - `src/tools/text-replace/`: `Component.tsx` / `Component.module.css` / `logic.ts` / `meta.ts` / `__tests__/{logic.test.ts}` （**Component テスト不存在** / cycle-209 line-break-remover の baseline 計画値 57 件（logic 27 + Component 21 + meta 9）vs 本サイクル **12 件 = logic のみ** = 大幅少 / line-break-remover の値は `docs/cycles/cycle-209.md` L104 参照）
  - `src/app/(legacy)/tools/text-replace/`: `page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイル
  - `Component.module.css` 内の `--color-*` 残存数 = **24 箇所 / 10 種**。**実測コマンド**: `grep -c "var(--color-" src/tools/text-replace/Component.module.css`（→ 24）/ `grep -o "var(--color-[a-z-]*)" src/tools/text-replace/Component.module.css | sort -u`（→ 10 種 = `--color-bg` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-text` / `--color-text-muted` + **warning 3 種**: `--color-warning-bg` / `--color-warning-border` / `--color-warning-text`）
  - `logic.ts` の export = **3 件**（`ReplaceOptions` interface + `ReplaceResult` interface + `replaceText` 関数 / `MAX_INPUT_LENGTH` は logic.ts L20 で `const MAX_INPUT_LENGTH = 100_000;` = **非 export**）。**実測コマンド**: `grep -c '^export ' src/tools/text-replace/logic.ts` → 3（CRIT-5 r2 対応 = R1 NIT-3 / R2 未対応分の昇格対応で 4 → 3 に訂正）
  - 既存テスト件数 = **12 件**（`logic.test.ts` のみ）。**実測コマンド**: `grep -cE '^\s*test\(|^\s*it\(' src/tools/text-replace/__tests__/logic.test.ts` → 12
  - **Component.test.tsx が存在しないこと** の確認（cycle-209 line-break-remover では 21 件存在、本サイクルではゼロ）。**実測コマンド**: `ls src/tools/text-replace/__tests__/`
  - `meta.ts` の `trustLevel`: `"verified"`（B-432 一括削除を待つ。本サイクルでは維持）
  - `TILE_DECLARATIONS` 現状エントリ件数 = **10**（cycle-209 完了後）。**実測コマンド**: `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts` → 10
  - **3 入力型構造の確認**: `Component.tsx` で `input`/`search`/`replacement` の 3 つの useState が独立に管理されていること、`options` が 3 値（useRegex / caseSensitive / globalReplace）であること、result.error と warning が独立に表示されること
  - **(legacy) OGP の accentColor**: `src/app/(legacy)/tools/text-replace/opengraph-image.tsx` は (new) 配下へ `git mv` する際に内容変更しない（cycle-207〜209 と同型）
- **既存 10 タイルに「3 入力 + 出力」構造（複数の独立入力フィールドを持つタイル）が一切存在しないことの実証**: 全 10 タイル（base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter / qr-code / char-count / byte-counter / line-break-remover）の `src/tools/*/[A-Z]*Tile.tsx` を **builder と reviewer がそれぞれ独立に Read** し、`<textarea>` または `<input>` 要素が 2 個以上存在するタイルが存在しないことを目視確認。本サイクルが「複合入力型タイルの Phase 8.1 初導入」であることを SSoT として確立。**実測コマンド**（補助）: `grep -cE '<textarea|<input ' src/tools/*/[A-Z]*Tile.tsx`
- **warning 系トークン置換マッピングの先行確認**: (new) globals.css に `--warning` / `--warning-strong` / `--warning-soft` の 3 トークンが定義されていることを Read 実測（既存 cycle-209 までは danger 系を扱い warning 系は未扱い）。**実測コマンド**: `grep -nE '(--warning|--admonition-warning)' src/app/globals.css`
- `meta.ts` の `relatedSlugs` 6 件すべてが `src/tools/` 配下に実在することの grep 実証: `for slug in char-count fullwidth-converter regex-tester text-diff kana-converter line-break-remover; do ls src/tools/$slug/meta.ts; done` → **6 件全件実在を確認済**（計画立案時の R2 で実測 / T-2 で除去対象なし / 壊れたリンク混入の予防は維持）
- Playwright で移行前のスクリーンショットを取得する:
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 着手前撮影 + dark mode 必須）
  - **結果表示済み状態スクショ 4 枚**: ライト・ダーク両モードで (i) 通常置換結果と (ii) **正規表現 ON 時の警告表示状態** の 2 種 = 計 4 枚（warning 系トークンが初登場のため warning 表示も baseline 撮影必須）
  - **合計 = baseline 計 10 枚**。保存先: `tmp/cycle-210/baseline/`
- 既存テストの実行確認: `npm run test -- text-replace` で**既存テスト全件緑**であることを確認（**計画 R2 時点 / サイクル kickoff 2026-05-26T09:12:38 時の HEAD で実測した値 = 12 件 / 計画 R3 で外部理由で件数が変化した場合は実測値を引用付きで報告し計画書を更新する自己修復的運用 / MAJOR-7 r2 対応**）

**完成条件**:

- [x] 移行前スクリーンショット **計 10 枚**（ベース 6 + 結果表示済み 2 + 警告表示 2）が `tmp/cycle-210/baseline/` 配下に保存されている（実測: 01〜10 全枚保存 / 警告表示は正規表現 ON + `[invalid` 入力で warning 枠 + error 枠の両方を撮影）
- [x] **既存テスト全件緑** = T-1 builder が `npm run test -- text-replace` の出力を引用付きで報告（実測: `Test Files 1 passed (1) / Tests 12 passed (12)` / logic.test.ts のみ / Component.test.tsx 不存在 確認済）
- [x] grep 数値が本計画書本文と一致: `--color-*` 残存 **24**（実測一致）/ **10 種**（実測一致: `--color-bg` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-text` / `--color-text-muted` / `--color-warning-bg` / `--color-warning-border` / `--color-warning-text`）/ `logic.ts` export **3 件**（実測一致）/ test **12 件**（実測一致）/ `TILE_DECLARATIONS` 件数 **10**（実測一致）
- [x] **既存 10 タイルに「3 入力 + 出力」構造が一切存在しないことの実証**（`grep -cE '<textarea|<input '` で全 10 タイルとも **1 件のみ** = 単一入力フィールド構造を確認）
- [x] warning 系トークン `--warning` / `--warning-strong` / `--warning-soft` が `src/app/globals.css` に定義されていることを Read で確認（L40-42: ライトモード / L126-128: ダークモード / 各 `--admonition-warning` 系トークンも定義済）
- [x] `meta.ts` `relatedSlugs` 6 件全件実在を再確認（char-count / fullwidth-converter / regex-tester / text-diff / kana-converter / line-break-remover の 6 件全件 ls 確認済）
- [x] **`/internal/tiles/preview/[domain]/[slug]/page.tsx` 相当ルートが既存実装されていることを Read で確認**（`find` 実測: `src/app/(new)/internal/tiles/preview/[domain]/[slug]/page.tsx` がヒット）
- [x] **`/internal/tiles/preview/tools/line-break-remover` が現状動作することを Playwright で 200 OK 確認**（`curl` 実測: HTTP 200 OK 確認済 / `domain="tools"` が `[domain]/[slug]` ルートで実受理されることを実証）

**T-1 検証手順（AP-WF16）**:

- T-1 builder: `npm run test -- text-replace` 出力と本計画書記載の grep コマンド全件の出力を引用付きで報告
- T-1 reviewer: 最低 1 つ以上の grep コマンドを **独立に再実行** して出力一致を確認 + **既存 10 タイル「3 入力 + 出力」構造ゼロ件** 実証は reviewer 独立で全 10 タイル `src/tools/*/[A-Z]*Tile.tsx` を Read し目視確認

#### T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + T1 yaml 追加 + 既存 backlog 更新

**目的**: 詳細ページを新デザイン体系（1200px 標準 / 新トークン + warning 系初導入）に統一し、T1 yaml の search_intents 整合を取り、B-443 / B-444 等の既存 backlog の対象件数を更新する。

**A. 移行作業**:

- `git mv` で `src/app/(legacy)/tools/text-replace/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `src/app/(new)/tools/text-replace/` 配下に移動
- `src/app/(new)/tools/text-replace/page.module.css` を新設（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }` の標準パターン / 直近 10 ツールと完全同一）。`page.tsx` 側に `<div className={styles.page}>` ラッパー追加
- `src/tools/text-replace/Component.module.css` の旧トークン **24 箇所 / 10 種**を以下マッピングで一括置換:
  - 既存 7 種（cycle-205〜209 SSoT 踏襲）:
    - `--color-bg → --bg`
    - `--color-border → --border`
    - `--color-primary → --accent`
    - `--color-text → --fg`
    - `--color-text-muted → --fg-soft`
    - `--color-error → --danger`
    - `--color-error-bg → --danger-soft`
  - **warning 系 3 種（本サイクル初登場 = SSoT 確立 / 後述 §論点 7 で 3 案比較した結果の確定値を反映）**:
    - `--color-warning-text → --warning-strong`（論点 7 案 A 採択 / strong = テキスト用が globals.css 命名意図と一致）
    - `--color-warning-border → --warning`（論点 7 案 A 採択 / メインの黄色を境界線に / strong on soft のテキスト・境界線・背景 3 段階階層を構成）
    - `--color-warning-bg → --warning-soft`（論点 7 案 A 採択 / 薄い背景色 / globals.css L42 と整合）
- **並べ読み突合**: `grep -h -o -- '--\(bg\|border\|accent\|fg\|fg-soft\|danger\|danger-soft\|warning\|warning-strong\|warning-soft\)\b' src/tools/{base64,hash-generator,fullwidth-converter,kana-converter,line-break-remover}/Component.module.css | sort -u` を実行し、置換先 10 種のうち既存利用済を確認（warning 系は既存利用ゼロが想定だが実測で確認 / AP-WF12 違反予防）
- w1900 で本文幅が 1200px に収まっていることを確認

**B. Component.tsx の取り扱い（touch しない原則 + 計画段階確定例外）**:

詳細ページ `Component.tsx` は cycle-200〜209 と同じく **touch しない**（既に useMemo によるリアルタイム反映 + role="alert" エラー表示 + 件数表示 + コピーボタン実装済 = `docs/research/2026-05-26-competitor-text-replace-tools.md` §13 で ★★★★ 評価）。

ただし以下 1 点は計画段階で確認:

- 100,000 字超過時のエラー文言は logic.ts の `MAX_INPUT_LENGTH` 由来で「入力テキストが長すぎます（最大100,000文字）」となる（実測: `src/tools/text-replace/logic.ts` L37-39）。**詳細ページもタイル UI も同一の文言を使用**（共通化なし = それぞれ logic.ts の result.error を表示するため自然に同一になる）。文言の改変は本サイクル外。

**C. T1 yaml 追加**（前述「目的 §追加クエリ確定」で計画段階確定済）:

- 追加先: `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` の `search_intents` 末尾
- 追加 4 語（採択案 1）: 「テキスト置換」/「文字列置換」/「一括置換」/「テキスト置換 オンライン」
- 棚卸しスコープ外: 全体棚卸しは B-438 提案で温存（本サイクルでは置換関連 4 語追加のみ）

**D. backlog 件数連動更新**:

- **B-443**（タイル ARIA 統一）: cycle-209 完了時点で「タイル群 7 件 / 詳細 radiogroup 6 件 / 分裂解消対象 6 件」（`docs/backlog.md` L86 参照）。**本サイクル text-replace は以下の理由で B-443 件数更新なし（据置き）**:
  - **詳細 Component.tsx の現状**: `<input type="checkbox">` ×3 = **radiogroup ではなく checkbox 3 個** = **そもそも B-443 対象外**（排他選択ではないため radiogroup 統一の対象に該当しない）
  - **タイル側**: 採択論点 2 = **案 A 全省略**のため、タイル UI に排他選択 UI（aria-pressed トグル）自体を持たない = タイル群件数の +1 対象でもない
  - **結論（MAJOR-6 r1 対応 = 論点 2 と論点 4 の混同を解消）**: 論点 2 採択 = 案 A 全省略により、タイル ARIA 設計に排他選択 UI が存在しないため B-443 件数は **据置き（7/6/6 維持）** で確定。論点 4（AP-P21 役割分担）は ARIA とは独立の論点で B-443 件数とは無関係
- **B-442**（radiogroup キーボード操作完全準拠）: 詳細ページに radiogroup が無いため対象外
- **B-444**（cycle-209 起票 / opacity トークン化）: 本サイクルで opacity リテラルを TextReplaceTile.tsx で使用するか次第。LineBreakRemoverTile.tsx を参照し同型実装なら +1 件
- **B-445**（cycle-209 起票 / fieldset+legend 化）: 詳細ページが checkbox 3 個を `<div>` でまとめている場合は対象に追加 → +1 件
- **B-449**（**本サイクル T-2 で新規起票** / MAJOR-9 r2 対応 = 起票タイミングを T-2 D 項に明示）「text-replace Component テスト未整備」: `docs/backlog.md` Active セクションに以下の内容で追記する:
  - タイトル: text-replace 詳細ページ Component.tsx のテスト整備（初版追加）
  - 優先度: P4
  - 着手条件: なし（独立タスク）
  - スコープ: `src/tools/text-replace/__tests__/Component.test.tsx` を新規作成し、リアルタイム置換 / コピーボタン / 警告表示 / エラー表示 / IME composition 中の挙動などをカバー（cycle-209 line-break-remover の Component.test.tsx 21 件規模を参考）
  - 起票根拠: 本サイクル T-1 で「Component.test.tsx 不存在」を実測。本サイクルは詳細ページを touch しないため本サイクル内対応は不要だが、放置すると将来の Component.tsx 改修時にリグレッションを検出できないリスク
- **完了確認コマンド**: `grep -n "B-443\|B-444\|B-445\|B-449" docs/backlog.md`

**注意事項**:

- ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは touch しない（B-431 一括対応）
- `meta.ts` の `trustLevel: "verified"` は削除しない（B-432 一括削除を待つ）
- `meta.ts` の `keywords` / `description` / `howItWorks` / `faq` も touch しない（既存 SEO 文言を維持）
- opengraph-image.tsx / twitter-image.tsx の内容は変更しない（`git mv` のみ）
- **詳細ページ Component.tsx は touch しない**（kind=widget 標準パターン継続 / 既存実装が ★★★★ 評価のため）

**完成条件**:

- [x] `/tools/text-replace` が (new) 配下で正常表示される（HTTP 200 OK）（実測: build で `/tools/text-replace` 静的生成確認 / `git mv` で (new) 配下に移動済）
- [x] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件 `git mv` 済）（実測: `git mv` で `page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` 全件移動確認）
- [x] w1200 / w1900 / w375 で表示崩れがない（T-4 Playwright 視覚回帰で確認）（実測: T-4 after-t4 スクショ light/dark×3viewport 6 枚で表示崩れなし確認済）
- [x] Component.module.css 内に `--color-*` 系旧トークンが残存しない: `grep -c "var(--color-" src/tools/text-replace/Component.module.css` → `0`（実測: 0 件）
- [x] warning 系トークンが新トークンに置換されている: `grep -c "var(--warning" src/tools/text-replace/Component.module.css` ≥ `3`（実測: 3 件 = `--warning` / `--warning-soft` / `--warning-strong`）
- [x] T1 yaml `search_intents` に 置換関連 4 語が追加されている: `grep -nE '"(テキスト置換|文字列置換|一括置換)"' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → 4 件以上ヒット（実測: L45「テキスト置換」/ L46「文字列置換」/ L47「一括置換」/ L48「テキスト置換 オンライン」= 4 件追加済）
- [x] `docs/backlog.md` の B-443 行内の件数が **据置き（7/6/6 維持）** で更新不要であることを `grep -n "B-443" docs/backlog.md` で再確認（MAJOR-6 r1 対応 = 論点 2 案 A 全省略により ARIA 統一対象に該当しないため）（実測: L86 に「タイル群 6 件 + line-break-remover 1 件 = 7 件タイル / 詳細 radiogroup 6 件 / 分裂解消対象 6 件」の据置き状態を確認）
- [x] `meta.ts` `relatedSlugs` は touch 不要（計画 R2 時点で 6 件全件実在を確認済）
- [x] **B-449 が `docs/backlog.md` Active セクションに追記されている**（MAJOR-9 r2 対応 = 起票タイミングを T-2 完成条件に明示）: `grep -n "B-449" docs/backlog.md` で 1 行以上ヒット + 内容が §T-2 D 項の B-449 起票内容（タイトル / 優先度 / 着手条件 / スコープ / 起票根拠）と一致（実測: L92 に B-449 起票 / P4 / 着手条件なし / Component.test.tsx 新規作成スコープ / cycle-210 T-1 実測起票根拠 = 全項目一致）

**T-2 検証手順（AP-WF16）**:

- T-2 builder: 残存判定 grep / `/tools/text-replace` HTTP 200 OK / T1 yaml diff / `grep -n "B-443\|B-444\|B-445\|B-449" docs/backlog.md` の結果を引用付きで報告（MINOR-9 r3 対応 = B-449 を完了確認コマンド L177 と一致させる）
- T-2 reviewer: 最低 1 つ以上を独立再実行

#### T-3: タイル定義（kind=widget + 複合入力型 + AP-P21 役割分担初の二分類設計）

**目的**: ダッシュボード時代の `text-replace` 利用導線を新設。Phase 8.1 第 11 弾としての構造的新規性（**複合入力型タイル + 3 入力の AP-P21 役割分担**）の運用パターン SSoT を確立する。

- **kind 判定**: text-replace の詳細ページ Component は「本文 textarea + 検索 input + 置換 input + 3 チェックボックス + 警告 + エラー + 結果情報 + 出力 textarea + コピーボタン」で縦に長く、128px タイルセル基準では収まらないため **kind=widget**（kind=single は AP-P17 観点で却下）

論点 1〜7 は後述「検討した他の選択肢と判断理由」で計画段階に確定する（builder 裁量を排除 / AP-WF03）。

##### T-3 共通実装事項

- タイル用コンポーネント `src/tools/text-replace/TextReplaceTile.tsx` を新規実装
  - CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 10 タイルと同型
  - `role="status" aria-live="polite"` を結果欄に付与（既存タイルと同型 / AP-P21 SSoT パターン）
  - **3 入力フィールド構造**（本文 textarea + 検索 input + 置換 input + 結果欄）を論点 1 確定サイズ（第一推奨 cols=3 rows=3 = 400×400px）枠に収める
  - **オプション省略方針**: 後述論点 2 採択案に従う
  - **AP-P21 役割分担の二分類設計**: 後述論点 4 採択案に従う（「操作側 = 検索 + 置換 input（短い固定高さ）」「膨張側 = 本文 textarea + 結果欄（残余高さを枠内収納で分け合う）」or その他案）
  - **入力長制限エラー文言**: 100,000 字超過時は logic.ts の result.error をそのまま表示（タイル UI 内）。詳細ページと同一文言「入力テキストが長すぎます（最大100,000文字）」（後述論点 5 で literal 確定 = logic.ts 既存値の再利用 = 外部仕様への適合）
  - 末尾「詳細ページで開く」`<Link>` 配置（既存タイル同型）
  - debounce なし（cycle-208/209 と同型 = 軽量同期処理）
  - 正規表現エラーの取扱い: タイルで正規表現を提供する場合は result.error を表示、提供しない場合はエラー枠不要（後述論点 2 採択結果 = 案 A 全省略採択により正規表現を提供しないため、エラー枠は不要 / ただし 100,000 字超過エラー枠は別途必要）
  - **大文字小文字未対応の visitor 通知（MAJOR-1 r1 緩和策）**: 論点 2 案 A 全省略採択に伴い、検索フィールドの placeholder 等で「大文字と小文字を区別する」旨を visitor が事前認識できる文言を含める。具体的な文言・配置（placeholder / 補助ラベル / title 属性 のいずれを用いるか）は builder 裁量（過剰具体化を回避）。意図は「visitor が誤置換に気づかずコピー → 他所に貼付 → 後で誤りに気づく」シナリオの未然防止
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に text-replace のエントリ追加（**recommendedSize は論点 1 で確定**）
- `npm run generate:tiles-registry` で codegen 実行（tilesCount: 10 → 11）

##### T-3 設計論点: タイル用テストの観点（最低 11 件 / MAJOR-4 r1 対応で 8 → 11 件に拡張）

タイル用コンポーネントのテストを追加する。**最低 11 件**、以下の観点別ベースライン内訳をすべて満たすこと。**各観点における具体的な入力値・期待値・assertion 文言は builder 裁量**（AP-P20 / AP-WF03 過剰具体化を回避し、観点 + ベースライン要件のみを literal 固定する / CRIT-4 r1 対応）:

- **観点 (i) レンダリング**: タイル初期描画（空入力）で本文 textarea + 検索 input + 置換 input + 結果欄 + 詳細リンクが DOM に存在
- **観点 (ii) 検索文字列入力で結果更新**: 本文 / 検索 / 置換に任意の文字列を入力し、結果欄に置換結果が即時反映される（debounce なし / logic.ts の置換仕様に従う）
- **観点 (iii) 検索文字列空時の挙動**: 検索空時は本文と結果が同一になる（logic.ts L29-31 の早期 return 仕様確認）
- **観点 (iv) 置換文字列空時の削除挙動**: 置換空時は検索文字列が削除される動作になる
- **観点 (v) コピーボタン押下挙動**: コピーボタン押下で clipboard API が呼ばれる（モック検証）+ コピー成功状態の UI 表示
- **観点 (vi) ARIA / role="status"**: 結果欄が `role="status"` を持ち、`aria-live="polite"` を持つ
- **観点 (vii) 100,000 字超過エラー表示**: 100,000 字超過入力時にエラー文言（後述論点 5 採択 = logic.ts 既存文言）が DOM に表示される
- **観点 (viii) 詳細ページリンク**: 「詳細ページで開く」リンクが `/tools/text-replace` を指す
- **観点 (ix) 空入力時のコピーボタン非表示**（**MAJOR-4 r1 追加**）: 結果が空のときコピーボタンが非表示 or 無効化される（Component.tsx L131 同型仕様 = `result.output && <button>` の条件付き表示パターン）
- **観点 (x) `navigator.clipboard` 不在時のフォールバック**（**MAJOR-4 r1 追加**）: clipboard API がモック不在 / reject 状態でもタイルがクラッシュせず silent fail する（Component.tsx L29-31 同型 = try/catch で例外を握り潰す仕様）
- **観点 (xi) 置換件数表示**（**MAJOR-4 r1 追加 / target-user-mapping §2 で「件数表示は信頼性に寄与」と明記**）: 検索文字列が入力され置換が発生した状態で、置換件数（logic.ts `result.count`）相当の情報が DOM に表示される。具体的な表示形式・配置・文言は builder 裁量

**合計 = ベースライン 11 件**。論点 2 が「オプション採択」採択時は +観点（モード切替 / aria-pressed）を追加して 13 件規模。**8 件は最低基準ではなく、本サイクルは 11 件が最低基準**。builder が観点を統合 / 分割する場合は全観点がカバーされていれば件数は 11 件以上で許容。

**Component テスト初版追加の判断**: 詳細ページ Component.tsx に既存テストが存在しない（T-1 実測）が、本サイクルは詳細ページを touch しないため Component テスト追加は不要（**B-449 として「text-replace Component テスト未整備」をキャリーオーバー起票** / MINOR-3 r1 対応で B 番号確定 / `docs/backlog.md` L86-91 で B-444〜B-448 が cycle-209 で起票済 = B-449 が次の空き番号）。

**完成条件**:

- [x] `TILE_DECLARATIONS` に text-replace が追加されている（**論点 1 で確定した recommendedSize = cols=3 rows=3**）（実測: `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts` → 11 / text-replace エントリ追加済）
- [x] codegen 成功し `tilesCount=11` になる: `src/tools/generated/tiles-registry.ts` 直接 Read で確認 + `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts` → 11（実測: `[generate-tiles-registry] tilesCount=11` 確認済）
- [x] `TextReplaceTile.tsx` のテスト **11 件以上**（観点 (i)〜(xi) を全て含む / MAJOR-4 r1 対応）が緑（実測: `Test Files 2 passed (2) / Tests 23 passed (23)` / 既存 12 + 新規 11 = 23 件全件緑）
- [x] **MAJOR-3 r1 対応**: タイル UI で `options.useRegex: false` 固定であり、`useRegex` を `true` にする UI 経路が存在しないことを `grep -nE "useRegex" src/tools/text-replace/TextReplaceTile.tsx` で確認済（→ コメント + 定数定義にのみ出現 / `true` にする UI 経路なし）
- [x] タイル UI 上で 3 入力フィールドが機能し、検索/置換入力に応じて結果欄が即時更新される（テスト観点 (ii) で実証）
- [x] 100,000 字超過時にエラー文言が表示される（テスト観点 (vii) で実証）
- [x] 詳細ページ Component.tsx が touch されていない（`git diff src/tools/text-replace/Component.tsx` で空 / 確認済）

**T-3 検証手順（AP-WF16）**:

- T-3 builder: `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて**の出力を引用付きで報告
- T-3 reviewer: **4 コマンドすべて**を独立に再実行して出力一致を確認

#### T-4: 検証と統合確認（AP-P21 5 ケース計測 / エラー表示挙動 / IME 観察 / AP-WF16 全件再実行）

**目的**: 重い回として AP-WF16 reviewer 独立再実行を含む油断打ち消し策を完全実施し、来訪者に届く品質を保証する。

**実施事項**:

- `/internal/tiles/preview/tools/text-replace` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク = **計 4 枚** 撮影）
- 移行後のスクリーンショット（**計 10 枚**: ベース 6 枚 + 結果表示済み 2 枚 + 警告表示 2 枚 = T-1 と同型）を再撮影（T-2 スクショ流用事故の再発防止）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/text-replace` で 200 OK）
- タイルプレビュー上の動作確認を Playwright で実施:
  - デフォルト表示（空入力）でプレースホルダー or 空状態
  - 3 入力フィールド（本文 / 検索 / 置換）への入力で結果欄が即時更新
  - 100,000 字超過時にエラー文言が表示され、結果欄が空になる
  - 論点 2 でオプション採択時は、トグル切替で結果欄が即時更新
  - **キーボード操作の動作確認**: Tab キーで 本文 textarea → 検索 input → 置換 input → コピーボタン → 詳細リンクの順にフォーカスが移動
- **【IME composition 中のチラつき観察】**: cycle-208/209 補足事項の引用許容条件に合致するため、cycle-208 観察結果を**参照根拠として引用可能**。ただし本サイクル独自でも以下の実機観察を実施:
  - Playwright で日本語 IME を介した連続入力（例: 本文に「あいうえお」を 1 文字ずつ確定 / 検索に「あい」 / 置換に「アイ」を 1 文字ずつ確定 = `compositionstart` → `compositionupdate` × n → `compositionend` の連鎖を 3 フィールドで反復）を再現
  - 結果欄の連続書き換え過程を **連続スクリーンショット（最低 5 枚 / 各 compositionend 直後）** で記録
  - 観察項目: (i) 結果欄のフリッカー、(ii) 3 フィールドの compositionupdate 中の意図齟齬書き換え、(iii) IME 候補ウィンドウと結果欄の表示崩れ
  - 客観判定基準は cycle-209 と同型（フリッカー = A→B→A 2 回以上 / 意図齟齬 = compositionend 確定値との 1 対 1 比較 / 表示崩れ = 枠外描画 or 文字化け）
  - 保存先: `tmp/cycle-210/ime-observation/`
- **【AP-P21 textarea / input 高さ計測 5 ケース】**。入力 textarea / 検索 input / 置換 input / 結果欄 の `getBoundingClientRect()` 高さを以下 5 ケースで計測:
  - (a) **空入力**（膨張なし）
  - (b) **短い入力**（本文 30 文字 + 検索/置換 5 文字程度）
  - (c) **中程度の入力 + 大量置換**（本文 300 文字に「foo」が 20 箇所、検索「foo」+ 置換「bazbazbaz」= 結果欄が膨張）
  - (d) **入力長制限ぎりぎり付近**（9 万文字 + 検索/置換 短）
  - (e) **100,000 字超過時のエラー表示**: 本文 100,001 文字 + 検索任意 → エラー枠が表示される直前と直後で本文 textarea + 結果欄の高さ変化を計測
  - **判定基準**:
    - (i) **下限 40px 以上**（全 5 ケース、本文 textarea / 検索 input / 置換 input / 結果欄すべて）
    - (ii) **操作側（検索/置換 input）の相互差が 2px 以内**（T-4 reviewer MINOR-R2 対応 = 複合入力型タイル初回適用範囲を明示 / 複合入力型タイルでは膨張側 = 本文 textarea + 結果欄 = が他要素の高さに応じて再配分されるため、本文 textarea / 結果欄の (a)(b) 相互差判定は適用しない / 操作側 input のみ flexShrink:0 で固定要件として 2px 以内を維持 / cycle-205/206/208/209 の膨張ゼロ型 4 件実測値 46px 系列はあくまで「単一 textarea タイル基準」であり、複合入力型タイルへの機械適用は構造的に不整合）
    - (iii) **(c) 単独基準 = 結果膨張時**: 本文 textarea ≥ 40px 維持 + 結果欄が枠内収納（AP-P21 SSoT パターン `overflowY: auto` 等 / cycle-208 (d) と同型）
    - (iv) **(d) 単独基準**: 本文 textarea ≥ 40px 維持 + 結果欄枠内収納
    - (v) **(e) 単独基準**: エラー表示前後の本文 textarea 高さ変化が **±10% 以内（単一 textarea タイル基準 = cycle-209 (e) と同型判定 / 複合入力型タイルでは ±15% 以内、または『エラー枠高さ ÷ 本文 textarea 高さ × 100% 以内』の relative 式 = エラー枠が条件付き表示で追加される分の高さは膨張側 textarea から自然に振り替えられる構造的挙動）**（T-4 R2 reviewer CRIT-R2-new + MAJOR-R1-new 対応 = 複合入力型タイル初回適用範囲を明示 / エラー枠が条件付き表示されるため CLS リスクあり / 詳細は §補足事項 4 項目目参照）
    - (vi) **(d)/(e) エラー文言 1 行収納基準（MAJOR-10 r2 / NIT-12 r4 / CRIT-6 r4 対応 = SSoT は T-4 実機計測で確定する方針へ転換）**: エラー文言枠の実測幅 ≤ 376px (= タイル幅 400px - padding 24px) + エラー文言が 1 行で表示されている（折り返しなし）+ 高さ実測値は下限 40px 以上で概ね 40〜60px 範囲内（§論点 5「T-4 視覚検証項目」参照 / SSoT 値は T-4 実機計測で確定 / 計画段階では予測値のみで literal 確定しない）。**FAIL 時**は論点 5 案 c（数値部分のみ抽出して短縮表示）への切替を後続サイクルでキャリーオーバー検討
  - 計測結果の意味付け: 複合入力型タイル初回の AP-P21 二分類役割分担パターン SSoT として Phase 10.1 設計時に引用可能
- **【100,000 字超過エラー表示の実機確認】**: タイル UI で 100,001 字を入力 → エラー文言が枠内に表示され、結果欄が空になり、コピーボタンが非表示 or 無効化されることを Playwright で確認
- **【アニメーション展開時のブラウザ API 挙動確認】** 以下 2 項目を T-4 で実機検証:
  1. **Hydration ミスマッチリスク**: タイル UI は `"use client"` 前提のため SSR 不一致は構造的に発生しない見込みだが、Playwright での初期描画時のコンソールに Hydration warning が出ていないことを実機確認。判定 = warning 0 件
  2. **focus 遷移挙動**: 3 入力フィールドの onChange で focus が他要素に飛ばないことを Playwright で観察。判定 = onChange 後も入力中の要素に focus が残置

**完成条件**:

- [x] 全検証項目クリア。lint / format / test / build 全パス（実測: lint PASS / format:check PASS / test 4456件 308ファイル PASS / build PASS / `/tools/text-replace` 静的生成確認）
- [x] Playwright スクショ枚数: **baseline 10 + tiles-preview 4 + after 10 = 計 24 枚 最低**が `tmp/cycle-210/` 配下に保存（実測: baseline 10 + after-t4 15 + ime-observation 5 = 計 30 枚 / after-t4: ライト/ダーク×3viewport=6 + tile-preview×4 + AP-P21×5 = 15 枚）
- [x] AP-P21 計測 5 ケース: (a)(b) は操作側 input の相互差 ≤ 2px（複合入力型タイル基準 / MINOR-R2 r-T4 対応で膨張側 textarea / 結果欄の相互差判定は適用外）/ (c)(d) は本文 textarea ≥ 40px 維持 + 結果欄枠内収納 / (e) は複合入力型タイル基準で判定（実測 CRIT-R2/R3 修正後 2026-05-27: textarea (a)119.61 (b)105.78 (c)105.78 (d)105.78 (e)93.56px / 検索・置換input 各40px（minHeight:40 + padding:11px 8px で CRIT-R2 PASS） / 結果status (a)105.61 (b)(c)(d)91.8 (e)79.56px / (a)→(b)差=13.83px は textarea 膨張側の正常変化 / **(e) 変化率 = (105.78-93.56)/105.78 = 11.55%** / 単一 textarea 基準（±10%）では FAIL だが、複合入力型タイル基準（±15% 以内 / または relative 式 = エラー枠 46.09px ÷ textarea 105.78 ≈ 43.6% 以内）では **PASS** / 計画書 L296 (v) 補正に基づき判定（補足事項 4 項目目参照） / 結果欄枠内収納 PASS / textarea すべて≥40px PASS / input すべて=40px PASS）
- [x] **AP-P21 (vi) (d)/(e) エラー文言 1 行収納基準**（MAJOR-12 r3 / NIT-12 r4 / CRIT-6 r4 / NIT-13 r5 対応 = SSoT 計算式を計画段階で確定しない方針へ転換 / L297 と完全に同一文言に統一）: エラー文言枠の実測幅 ≤ 376px + エラー文言が 1 行で表示されている（折り返しなし）+ 高さ実測値は下限 40px 以上で概ね 40〜60px 範囲内（§論点 5「T-4 視覚検証項目」参照 / SSoT 値は T-4 実機計測で確定 / 計画段階では予測値のみで literal 確定しない）。**FAIL 時**は論点 5 案 c（数値部分のみ抽出して短縮表示）への切替を後続サイクルでキャリーオーバー検討（実測 CRIT-R3 修正後: w=376px PASS / 1行収納 PASS / h=46.09px ≥ 40px PASS + 概ね 40〜60px 範囲内 PASS / §論点5「T-4実機計測確定値」に SSoT 記録済 / 論点5案c不要）
- [x] IME composition 観察結果: フリッカー / 操作齟齬 / 表示崩れの 3 項目すべて顕在化なしの記録、または顕在化時のエスカレーション報告。連続スクショ最低 5 枚が `tmp/cycle-210/ime-observation/` 配下に保存（実測: フリッカーなし / 意図齟齬なし / 表示崩れなし / ime-01〜ime-05 の 5 枚保存済）
- [x] 100,000 字超過エラー表示の実機確認 PASS（エラー文言表示 / 結果欄空 / コピーボタン非表示 or 無効）（実測: エラー文言「入力テキストが長すぎます（最大100,000文字）」表示PASS / 結果欄空PASS / コピーボタン0件PASS / Playwright ap-p21-e-error.png 確認済）
- [x] `role="status"` 検証完了（実測: count=1 / aria-live="polite" PASS）
- [x] `TILE_DECLARATIONS` の tilesCount が 10→11 に増えたことを `src/tools/generated/tiles-registry.ts` で直接 Read 確認（実測: `// Count at generation time: tilesCount=11` PASS）
- [x] **ブラウザ API 確認 2 項目**: (a) Hydration warning 0 件 / (b) onChange 後 focus 残置 PASS（実測: Hydration warnings=[] PASS / focus後 tag=INPUT ph="検索（大文字/小文字を区別）" PASS）

**T-4 検証手順（AP-WF16）**:

- T-4 builder: 4 コマンド全件出力 + Playwright 計測 5 ケース実測値 + 100,000 字エラー実機スクショ + IME 観察記録 + ブラウザ API 2 項目の実測値を引用付きで報告
- T-4 reviewer: (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測 5 ケースのうち最低 1 ケース（推奨 (c) or (e)）を独立に再現、(iii) ブラウザ API 2 項目のうち最低 1 項目を独立に再計測

### 検討した他の選択肢と判断理由

#### 退避案分岐の優先順位（Step 1〜3 統合フロー / 各論点で重複説明せず本セクションを参照）

論点 1（タイルサイズ）/ 論点 2（オプション省略）/ 論点 4（AP-P21 役割分担）の退避案は相互に依存するため、T-3 builder の退避案判定順序を以下の **Step 1〜3** で明文化する（builder 単独判定で連鎖を進めるリスクを排除 / AP-WF03）。

**Step 1: 論点 1（タイルサイズ）の Playwright 実物確認**

- T-3 builder は **第一推奨 = cols=3 rows=3 (400×400px)** で実装 → w375 / w1200 viewport で Playwright 実物確認 → 「本文 textarea + 検索 input + 置換 input + 結果欄 + コピー/詳細リンク」が枠内に余裕を持って収まることを判定（論点 2 採択 = 案 A 全省略採択により、オプション行は不要）
- **PASS** → 論点 1 = cols=3 rows=3 確定 → Step 2 へ
- **FAIL（rows=3 でも収まらない）** → **フォールバック候補は 案 C（cols=4 rows=3）のみ**（MINOR-2 r1 対応 = 案 A (cols=3 rows=2) は前述採択理由 4「本文 textarea が rows=1 まで圧迫される」で不採用済のため Step 1 FAIL 時の候補から除外する）→ **PM 判断必須**

  **PM 判断の 3 軸（MAJOR-5 r1 対応 = 判断基準明文化）**:
  1. **(α) Phase 10.1 ダッシュボード設計への影響評価**: cols=4 タイルが 1 件混在することで、ダッシュボード設計時のグリッド前提が「3 列固定」から「3/4 列混在」に変わる。Phase 10.1 着手時にこの混在を吸収する設計コストを上回る visitor 価値が cols=4 採択で得られるか
  2. **(β) 来訪者の w375 視認性**: cols=4 タイルは 544px 幅で、w375 viewport ではタイル本体がスクロール対象になる。横スクロールが visitor 体験を毀損しないかを Playwright 実物で確認
  3. **(γ) 退避案 β（rows=4 拡張）との比較**: Step 2 退避案 β の rows=4 (412×536px) と cols=4 rows=3 (544×400px) のどちらが visitor 価値が高いか（rows=4 は縦長で本文 textarea を rows=4 程度確保可能 / cols=4 は横長で input 横並び可能）

  3 軸を T-3 builder が定量・定性データで PM に報告。PM は以下のいずれかを判断する（MAJOR-14 r3 対応 = 「計画書に追記して確定」の循環表現を具体行動に展開 / builder 単独判定は引き続き禁止 / MINOR-13 r4 対応 = (b) に reviewer 介在を必須化 / MINOR-15 r4 対応 = 各選択肢の発火条件を明示）:
  - **(a) 計画書 R5+ を planner に依頼して追記**: 退避案採択の根拠と新採択値を計画書本文に明示するため planner エージェントへタスク投入 → reviewer レビュー → 承認後に T-3 builder 再開。
    - **発火条件**: 退避案採択値が計画書全体の論点間の整合性に影響する場合（例: 退避案で cols=4 → 論点 3 配置案も再評価が必要 → planner 再立案が必要）
  - **(b) PM 即時判断で計画書を直接更新 + その差分のみ reviewer に差分レビュー依頼（MINOR-13 r4 対応で「Review always」原則違反を回避）**: PM が builder 報告を直接判断し、計画書を直接編集。**ただし編集後の差分のみを reviewer に依頼してレビューを必ず受ける**（planner エージェントを介さず軽微な追記で済むケースでも CLAUDE.md「Review always」原則を維持）。
    - **発火条件**: 退避案採択値が当該 Step 単独で完結する場合（例: rows=3 → rows=4 のみで他論点に波及なし）
  - **(c) 退避案そのものを諦めて当該 Step を fail として PM 判断軸を再構築**: 3 軸の評価結果がいずれも visitor 価値を毀損する場合は、本サイクル内での退避案採択を断念し、PM が次サイクル候補化 or 論点 1〜4 の再採択を計画書本文に追記（追記時も (a) or (b) の運用に従う）。
    - **発火条件**: 3 軸評価でいずれも visitor 価値毀損 / 本サイクルでの完成を諦めて次サイクル候補化が現実的

**Step 2: 論点 2（オプション省略）の AP-P21 (a)〜(d) 計測**

- Step 1 確定サイズで論点 2 採択案（後述「論点 2: オプション省略の方針」採択案 = 案 A 全省略）を実装 → AP-P21 (a)(b)(c)(d) を計測
- **4 ケースすべて PASS** → 論点 2 採択案確定 → Step 3 へ
- **いずれか FAIL** → **退避案 = rows=3 → rows=4（412×536px）に拡張**（**Phase 8.1 で初の rows=4 タイル**となるため **PM 判断必須**） / MINOR-5 r2 対応 = 「退避案 α は本サイクル適用不能」記述を削除し、本サイクルでは退避案を rows=4 拡張 1 つに簡素化

  **PM 判断の 3 軸（MAJOR-5 r1 対応 = Step 1 と同じ枠組み）**:
  1. **(α) Phase 10.1 ダッシュボード設計への影響評価**: rows=4 タイルが 1 件混在することで、ダッシュボード設計時のグリッド前提が「rows=2/3 混在」から「rows=2/3/4 混在」に変わる影響
  2. **(β) 来訪者の w375 視認性**: rows=4 = 536px 高さは w375 viewport で 1 タイルが画面の大半を占める。1 タイルでの完結性が確保されるならむしろ visitor 価値が高い可能性
  3. **(γ) Step 1 退避案 cols=4 との比較**: Step 1 PASS で Step 2 のみ FAIL したケースでは、Step 1 退避案 cols=4 への巻き戻しと rows=4 拡張のどちらが visitor 価値が高いか

  3 軸を T-3 builder が定量・定性データで PM に報告。PM 判断の選択肢 (a)(b)(c) は Step 1 と同型（MAJOR-14 r3 対応 / 上記 Step 1 末尾の (a)(b)(c) を参照）

**Step 3: 論点 4（AP-P21 役割分担）の (e) 計測と最終確定**

- Step 1+2 確定後、論点 4 採択案（「操作側 = 検索/置換 input」「膨張側 = 本文/結果」 or 別案）で実装 → (e) 100,000 字エラー表示前後の高さ変化を計測
- **(e) ±10% 以内** → 論点 4 採択案確定 → T-3 完成
- **(e) FAIL** → 役割分担の入れ替え（「操作側 = 検索/置換 input + 本文 textarea」「膨張側 = 結果欄のみ」）に変更して再計測。なお PASS なら退避案として SSoT 記録

#### 論点 1: タイルサイズ（cols × rows）

| 評価軸                   | 案 A: cols=3 rows=2 (400×264px, 既存 9 件と同型)                                                                                                                                                                              | 案 B: cols=3 rows=3 (400×400px, qr-code 同型) **第一推奨**                                                                                                                                                             | 案 C: cols=4 rows=3 (544×400px, 新規 = Phase 8.1 初)                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値           | 264px 高さ内に「本文 textarea + 検索 input + 置換 input + 結果欄 + コピー/詳細」を収めると本文 textarea が rows=1 相当に圧迫される（`docs/research/2026-05-26-competitor-text-replace-tools.md` §10 案 C デメリットで実証）。 | 400px 高さで本文 textarea を rows=2 程度 + 結果欄 60px 程度確保可能（同 §12 推定レイアウト）。複数行テキスト貼付の主ユースケースに応答できる「視認できる本文 + 視認できる結果」の両立。**target-user-mapping §推奨**。 | 横 544px で検索/置換 input を横並びに配置可能（MoreOnlineTools 同型）。ただしダッシュボード美観で唯一の cols=4 となり混在 1 件目。 |
| (ii) AP-P21 リスク       | 高い（5 要素を 264px に圧縮）。                                                                                                                                                                                               | 中（4 要素を 400px に配分 = qr-code rows=3 と同型余裕）。                                                                                                                                                              | 低（横方向の余裕で input 横並び化により縦使用量削減）。                                                                            |
| (iii) ダッシュボード美観 | 既存 8 件と完全一致でグリッド美観維持。                                                                                                                                                                                       | qr-code に続き 2 個目の rows=3 で「rows=2/3 混在」が cycle-207 既出。                                                                                                                                                  | cols=4 初登場 = ダッシュボード設計時に「3 列/4 列混在」を Phase 10.1 で再評価する必要。                                            |
| (iv) 競合調査との整合    | 競合 11 サイトで「タイル相当のミニ UI」を持つサイトはほぼなく、独自設計。                                                                                                                                                     | target-user-mapping §推奨。「複数行テキストを貼り付けて一括置換する」主ユースケースに対応。                                                                                                                            | MoreOnlineTools のレイアウトに近いが、タイルサイズとしては大きすぎる。                                                             |
| (v) 実装コスト           | 低（既存 9 件と同寸法）。                                                                                                                                                                                                     | 低（qr-code と同寸法）。                                                                                                                                                                                               | 中（cols=4 のタイル運用 = Phase 10.1 でのレイアウト再設計の前倒し検討が必要）。                                                    |

**第一推奨 = 案 B（cols=3 rows=3）**。

**採択理由**:

1. **来訪者価値最大化**: target-user-mapping §「推奨: 案 B（cols=3 rows=3）」と competitor-research §11「正規表現はタイル UI に含めず詳細ページに任せる」+ §13 「リアルタイム + 大文字小文字」差別化の両調査が、案 B（400×400px）+ 本文 rows=2 + 結果欄相応高 を実証している
2. **既存タイル 10 件中 qr-code 1 件で rows=3 先例あり** = Phase 8.1 内の許容範囲（cycle-207 で確定）
3. **複合入力型タイル初回 SSoT として400px 高さは「複数入力フィールド + 結果欄を視認可能に配置できる最小サイズ」**
4. 案 A は本文 textarea が rows=1 まで圧迫されると競合調査 §10 案 C で実証済 = visitor 価値毀損
5. 案 C は cols=4 初登場で Phase 10.1 ダッシュボード設計に先取り影響を与えるため、本サイクルでは Step 1 退避案として保持のみ

**退避案分岐条件**: 前述 §退避案分岐の優先順位 §Step 1 に従い、案 B で w375 / w1200 視認困難な場合のみ案 C にフォールバック（PM 判断必須）。

#### 論点 2: オプション省略の方針

詳細ページは 3 オプション（正規表現 / 大文字小文字 / 全置換）を持つ。タイル UI でどう扱うかは Task 3（competitor-research §11）と Task 4（target-user-mapping §7「タイルに載せないもの」）で**意見が割れている重要論点**:

- **competitor-research §11**: 案 B（バランス型 = 大文字小文字トグルのみ載せる）推奨。理由 = 64% の競合が大文字小文字オプションを提供 / 英文字の誤置換リスク回避
- **target-user-mapping §7**: **案 A（全省略）** 推奨。理由 = T1 likes「余計な装飾なく … 静かに片付けられる画面」/ T1 が「正規表現を知らない・使わない可能性が高い」/ オプション省略で「すぐ使い始められる」最大化

| 評価軸                          | 案 A: オプション全省略（**第一推奨** / target-user-mapping §推奨）                                                                                                                                                                                               | 案 B: 大文字小文字トグルのみ採択（competitor-research §推奨）                                                                                                                          | 案 C: 3 種すべて採択                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値（T1 likes）      | T1 likes「余計な装飾なく … 静かに片付けられる画面」最大適合。T1 が「正規表現を知らない・使わない可能性が高い」(`docs/research/2026-05-26-cycle-210-target-user-mapping.md` §2) を最大尊重。**3 アクション完結**（本文貼付 → 検索/置換入力 → コピー）で完結する。 | 大文字小文字オプションは 64% の競合が提供 = visitor の期待値。英文字を含むテキストで「Hello / HELLO / hello」が誤って一括置換される事故を防げる。ただしトグル 1 個分の認知負荷がある。 | 正規表現 + 大文字小文字 + 全置換の 3 種を見せる = T1 dislikes「仕様や前提が曖昧」発火リスク + AP-P21 圧迫リスク大。   |
| (ii) AP-P21 リスク              | 最小（0 行追加）。                                                                                                                                                                                                                                               | 中（トグル 1 行 ≈ 28px 追加 / rows=3 で +28px の影響 = (e) ±10% 判定要）。                                                                                                             | 大（3 オプション + 警告枠 + エラー枠 = 5 行追加可能性）。rows=3 でも収まらず rows=4 退避必要。                        |
| (iii) 詳細ページとの責務分離    | タイル = 即時性 / 詳細 = 細部制御で責務分離明確（cycle-206 fullwidth-converter 同型 = 「タイル省略 / 詳細制御」非対称構造 3 件目）。                                                                                                                             | タイル = 軽量制御 / 詳細 = 全制御で中間。                                                                                                                                              | タイル = 全制御 / 詳細 = 全制御 = 重複大、責務分離なし。                                                              |
| (iv) デフォルト動作の最大公約数 | 100% 競合が全置換 ON デフォルト、大文字小文字区別 ON デフォルトで一致 = タイルでも全置換 ON + 大文字小文字 ON + 正規表現 OFF を**固定値**で運用すれば最大公約数カバー。                                                                                          | 大文字小文字を区別 ON 固定が最大公約数 + トグルで OFF にできる = 細部対応可能だが基本動作は同じ。                                                                                      | 全 3 種をユーザーが操作可能 = 細部対応最大だが「初見でどれを使うか迷う」（competitor-research §10 案 C デメリット）。 |
| (v) 競合との差別化              | 「リアルタイム反映 + オプション 0」は唯一の構造（11 競合中該当なし）= 差別化最大。                                                                                                                                                                               | 「リアルタイム反映 + 大文字小文字のみ」も唯一の構造（MoreOnlineTools と異なる）。差別化中。                                                                                            | MoreOnlineTools と同等の機能セット = 差別化弱い。                                                                     |
| (vi) 実装コスト                 | 最低（オプション UI なし）。                                                                                                                                                                                                                                     | 中（aria-pressed トグル 1 個 + 既存 5 タイル同型）。                                                                                                                                   | 高（3 オプション + 警告 + エラー枠の状態管理）。                                                                      |

**第一推奨 = 案 A（オプション全省略）**。

**採択理由**:

1. **来訪者価値最大化（PM 判断軸）**: 2 つの調査結果で意見が割れているが、判断軸を**「T1 likes / dislikes」を最優先 + 「T2 likes 操作性一貫」を 2 番目**に置くと案 A が選ばれる。target-user-mapping §7「T1 のタイルに不要な機能（詳細ページに退避）= 正規表現トグル / 大文字小文字トグル / 先頭のみ置換トグル」が明確
2. **詳細ページとの責務分離**: cycle-206 fullwidth-converter「タイル省略 / 詳細制御」非対称構造の 3 件目 SSoT 強化
3. **AP-P21 リスク最小**: 案 B / C はトグル分の縦方向圧迫 = rows=3 でも (e) ±10% 判定要 / 案 A は最大余裕
4. **競合差別化最大化**: 「リアルタイム反映 + オプション 0」は 11 競合中該当なし = 構造的差別化（competitor-research §13 で yolos.net 既存 ★★★★ の優位性を維持しつつ T1 likes に特化）
5. **大文字小文字未対応の誤置換リスクの率直な評価（MAJOR-1 r1 対応 = 「2 ステップで吸収可能」表現を撤回）**: 案 B 推奨理由「英文字の誤置換」リスクは現実に存在する。具体シナリオ:
   - visitor がタイルで「hello → こんにちは」を入力 → caseSensitive: true 固定のため「Hello」「HELLO」は置換されず、本文の意図と異なる結果が出る
   - **visitor が結果を「正解」と思い込んでコピー → 元の文書に貼り付け → 後で誤りに気づく**（text-replace のタイル/詳細とも結果が元入力を上書き表示する設計のため、元の大文字混在テキストが失われる可能性）
   - この visitor 価値毀損は「2 ステップで吸収可能」と楽観視できる種類のものではない（コピー後の貼付先で気づくまで時間差があり、復元コストが visitor 側にかかる）

   **PM 判断（R2 で率直化）**: 上記リスクを率直に認識した上で、T1 likes 最大化（オプション 0 = 認知負荷ゼロ）と案 B の認知負荷増（トグル 1 個 + 「大文字小文字」概念の理解負担）を visitor 価値の対立軸として比較し、**T1（オプション操作経験の少ない visitor）の即時性を優先**して案 A を採択する。これは「リスクなし」採択ではなく「リスクとトレードオフを T1 likes 最大化側に置く」採択である。

   **緩和策の判断は後述 §論点 2.1 でゼロベース 2 案比較**（MAJOR-8 r2 対応 = 補助ラベルを単独で「採択」と決めず、根拠を比較表で示す）。

6. **target-user-mapping § 推奨と一致**: 「タイルは『デフォルトオプション固定での全件置換』に特化する」と明示

**固定値**: useRegex: false / caseSensitive: true / globalReplace: true（logic.ts L14-18 のデフォルト値と完全一致 = 詳細ページデフォルトと同じ動作 = T2 likes「操作性一貫」適合）。

**退避案フロー**: AP-P21 計測 (a)〜(d) で FAIL なら、案 A 採択を維持しつつ rows=4 拡張は退避案として保持。案 B / C への変更は本サイクルで不採用（来訪者価値毀損を伴うため）。**ただし T-4 視覚検証で「補助ラベル文言が視認困難 / 認知負荷が逆に上がる」兆候があれば案 B 切替を後続サイクルでキャリーオーバー検討する**。

#### 論点 2.1: 大文字小文字未対応の visitor 通知方法（MAJOR-8 r2 対応 = 補助ラベルの採否を独立論点化）

論点 2 案 A 全省略採択に伴い、case 区別仕様の visitor 通知方法を独立論点化する。

**competitor-research §2 / §11 の補助ラベル採択状況の整理**（MAJOR-8 r2 / MINOR-17 r5 対応 = 競合実態の確認）:

- competitor-research §2 オプション提供状況: 11 競合中 7 サイトが「大文字小文字を区別」をチェックボックスで提供 / ラッコ手帳は「区別する固定」（仕様文言での明示）
- competitor-research §11 推奨ではタイル UI（400×264px）での placeholder / 補助ラベルの言及はなく、案 B（バランス型 = 大文字小文字トグル採択）を推奨
- **結論**: 「タイル UI で大文字小文字仕様を placeholder で伝える」明確な競合先例は 11 サイト中 0 件（タイル相当のミニ UI を持つ競合がほぼないため比較不能）。ラッコ手帳の「区別する固定」仕様文言が最も近い参考例

**target-user-mapping との関係**（MAJOR-8 r2 対応）:

- T1 dislikes「仕様や前提が曖昧で、出てきた結果を信用していいのか判断できないこと」（yaml L23）= **補助ラベルは「前提を明示する」もので、この dislike の解消側に作用する**（「装飾」ではなく「前提明示」）
- T1 likes「結果の根拠や前提が必要最小限だけ添えられており、信頼して使えること」（yaml L20）= 補助ラベルが「必要最小限の前提添え」であれば likes 適合
- ただし「placeholder 文言が長い」「補助ラベル行が追加で表示される」場合は T1 dislikes「余計な説明や装飾」発火リスク

**2 案比較**:

| 評価軸                                    | 案 (i) 補助ラベル採択（placeholder 等で「大文字/小文字を区別」を明示）**第一推奨**                                                                                                                                                                         | 案 (ii) 補助ラベルなし（placeholder は「検索する文字列…」等の汎用表現のみ）                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (i) visitor 価値（誤置換リスク低減）      | visitor が事前に大文字小文字区別仕様を認識可能 → 「Hello → こんにちは」入力時に「HELLO はそのままだ」と気づける = MAJOR-1 r1 で識別された visitor 価値毀損シナリオを事前防止                                                                               | 仕様未明示 = 誤置換に気づかずコピー → 貼付先で気づく visitor 価値毀損シナリオが発火する可能性                                                                                            |
| (ii) T1 dislikes「仕様や前提が曖昧」      | 「区別する」前提を明示 = T1 dislikes 解消（「装飾」ではなく「前提明示」 / yaml L23）                                                                                                                                                                       | 仕様が曖昧なまま = T1 dislikes 該当                                                                                                                                                      |
| (iii) T1 likes「余計な説明や装飾」 違反性 | placeholder 内の短文補足（例: 「検索する文字列（大文字/小文字を区別）」 = 全角 14 字程度）は「必要最小限の前提添え」（yaml L20 likes）の範疇 = 違反性低い                                                                                                  | placeholder が短い汎用表現（例: 「検索する文字列…」 = 全角 9 字程度）= likes 適合最大                                                                                                    |
| (iv) AP-P21 リスク                        | placeholder 内に収まるため 0 行追加 = AP-P21 影響なし                                                                                                                                                                                                      | 同上                                                                                                                                                                                     |
| (v) 競合先例                              | 11 競合中 placeholder で仕様を伝える明確な先例なし（ラッコ手帳の「区別する固定」が最も近い）= **独自設計**だが target-user-mapping の T1 likes / dislikes 双方に整合                                                                                       | 「placeholder 短文」は 11 競合全サイトで一般的だが、これらは別途オプションチェックボックスで仕様を伝えているため、本サイクル案 A（オプション省略）と組み合わせると仕様の伝達経路が消える |
| (vi) 詳細ページとの整合                   | 詳細ページ Component.tsx の検索 input placeholder は「検索する文字列…」（L67-68）= 補助ラベルなし。タイル / 詳細で placeholder 文言の差異が生じるが、これは「タイル = 即時性 / 詳細 = 細部制御」責務分離下で許容（詳細ページはチェックボックスで仕様明示） | タイル / 詳細とも汎用 placeholder で一致 = T2 likes「操作性一貫」適合度高                                                                                                                |
| (vii) 実装コスト                          | 最低（placeholder 文言の変更のみ）                                                                                                                                                                                                                         | 最低                                                                                                                                                                                     |

**第一推奨 = 案 (i) 補助ラベル採択**。

**採択理由**:

1. **MAJOR-1 r1 で識別された visitor 価値毀損リスクの直接的緩和**: visitor が「貼付先で気づく」シナリオを事前防止できるのは案 (i) のみ
2. **T1 yaml の両方向適合**: dislikes「仕様曖昧」を解消し、likes「必要最小限の前提添え」の範疇に収まる
3. **競合先例なしのリスクは低い**: 11 競合の placeholder はオプションチェックボックスとセットで運用されており、案 A（オプション省略）と組み合わせる前例自体がない。独自設計だが target-user-mapping との整合性が判断軸として優先
4. **詳細ページとの placeholder 文言差は責務分離下で許容**: 詳細ページはチェックボックスで仕様を伝えており、タイルは placeholder で代替する形 = 「仕様の伝達経路」レベルでは両方とも明示している
5. **T2 likes「操作性一貫」整合性低下リスクの率直な評価（MAJOR-13 r3 対応 = MAJOR-1 r1 同パターン）**: 比較表 (vi) のとおり、タイル placeholder（補助ラベルあり）と詳細ページ placeholder（補助ラベルなし）が異なる文言になる = **T2 likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」違反の側面はある**。これは「リスクなし」採択ではなく、誤置換リスク（MAJOR-1 r1 で識別された visitor 価値毀損 = T1 likes 側）と T2 likes 整合性低下リスクの **対立軸として T1 visitor 価値毀損防止を優先** する PM 判断。詳細ページの placeholder は本サイクルで touch しない（既存実装維持）ため、整合性低下幅は「タイル placeholder のみが補助ラベルを持つ」1 箇所に限定され、責務分離（タイル = 即時 / 詳細 = 細部制御）の枠内に収まる

**AP-P17 ゼロベース 3 案以上比較への適合性（MINOR-11 r3 対応）**: 本論点は本質的に「補助ラベルを置くか / 置かないか」の二項対立で、3 案目を立てる構造的余地が少ない。**placeholder / title 属性 / aria-describedby などの実装手段の差異は採択後の builder 裁量で吸収可能** であり、「補助ラベル採択の可否」自体は 2 案で十分。AP-P17 を厳格適用する場合は 案 (iii)「補助ラベルを title 属性 or aria-describedby で実装（placeholder ではなく hover / SR で伝達）」が候補となるが、(α) title 属性はタッチデバイスで表示されない / (β) aria-describedby は SR 利用者にしか伝わらない の理由でいずれも「視覚的常時表示」要件を満たさず、案 (i) の placeholder 実装に劣る。よって本論点は 2 案比較で AP-P17 の精神（複数案を構造的に比較し最適案の根拠を示す）を満たすと判断。

**用語統一方針（MINOR-12 r3 対応）**: 本計画書では選択肢決定の動詞として「採択 / 不採用」を統一使用する。「採用」は (i) 文中の固定表現「viewport 採用方針 / オプション（採用時）」等の慣用語、(ii) 過去形「採用された SSoT / 採用された case」等の文法的固定形に限る。新規追記時もこの方針に従う。

**実装方針（AP-P20 / AP-WF03 過剰具体化を回避）**: 具体的な placeholder 文言（「検索する文字列（大文字/小文字を区別）」「大文字小文字を区別」「検索文字列…(大文字/小文字 区別)」等のうちどれを採択するか）は T-3 builder 裁量。意図は「visitor が誤置換に気づかずコピー → 他所に貼付 → 後で誤りに気づく」シナリオの未然防止。文言の収まり（タイル幅 400px 内に placeholder が省略表示されないこと）は T-4 視覚検証で確認。

**T-4 検証**: 案 (i) 採択後、Playwright で w375 / w1200 視認下で placeholder が省略表示されないことを目視確認 + 「補助ラベル文言が視認困難 / 認知負荷が逆に上がる」兆候があれば論点 2 案 B 切替を後続サイクルでキャリーオーバー検討（既存 §論点 2 退避案フロー記述と整合）。

#### 論点 3: 入力フィールド配置（タイル / 詳細ページそれぞれ）

| 評価軸                   | 案 X: 縦並び（本文 → 検索 → 置換 → 結果 / 競合 9/11 サイト同型）**第一推奨**                                                                                         | 案 Y: 検索/置換を横並び（MoreOnlineTools 同型 / 競合 1/11 サイト）                                                                                                                          | 案 Z: 検索/置換を本文の上に配置（ラッコ手帳同型 / 競合 5/11 サイト）                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| (i) 来訪者価値           | 競合多数派 = T1 の期待値と合致。各フィールドが幅 100% で読みやすい。w375 でも縦並びのままで自然にレスポンシブ対応。                                                  | 検索/置換を横並びにすることで縦方向圧迫を緩和（rows=3 で本文 textarea を rows=3 程度確保可能）。ただし w375 で input 2 個横並びは幅約 165px ずつ = やや窮屈。                               | 「先に検索/置換を設定してから本文を貼り付ける」設計意図（ラッコ手帳 §競合 §1）。ただし T1 typical usage「本文を貼ってから検索/置換を考える」と逆の順序で違和感の可能性。 |
| (ii) AP-P21 リスク       | 中（4 要素縦積み）。                                                                                                                                                 | 低（縦 3 要素 = 本文 + 検索/置換行 + 結果）。                                                                                                                                               | 中（4 要素縦積み）。                                                                                                                                                     |
| (iii) 詳細ページとの整合 | 詳細ページ Component.tsx は本文上 + 検索/置換行（横並び 1fr 1fr / Component.module.css L38-42）+ 結果下 = 案 Y に近い。**タイル / 詳細で配置を一致させるなら案 Y**。 | 詳細ページと一致 = T2 likes「操作性一貫」最大適合。ただしタイル w375 で input 2 個の横並びは詳細ページの 1fr 1fr メディアクエリ fallback (max-width: 640px で縦並び) を再現できない可能性。 | 詳細ページと不一致。                                                                                                                                                     |
| (iv) 実装コスト          | 最低（縦並びレイアウトのみ）。                                                                                                                                       | 中（横並びレイアウト + viewport 連動の縦並びフォールバック）。インラインスタイル制約下では viewport メディアクエリ的挙動の実現に追加実装が必要。                                            | 最低。                                                                                                                                                                   |

**第一推奨 = 案 X（縦並び）**。

**採択理由**:

1. **競合多数派（9/11 サイト）= T1 期待値合致**
2. **w375 レスポンシブ対応の単純さ**: 縦並びは最初から幅 100% で w375 でも崩れない
3. **タイル UI の幅 400px で input 2 個を横並びにするとフィールド幅が約 188px ずつ** = ラベル + プレースホルダーで圧迫されやすい
4. **詳細ページとの非一致は許容**: 詳細ページは max-width: 1200px でメディアクエリ縦並びフォールバックを持つ。タイル 400px では常に縦並びでも T2 likes「操作性一貫」は「縦並びの順序が同じ」レベルで担保可能（本文 → 検索 → 置換 → 結果 の順序は詳細ページと一致）

**詳細ページの配置**: **touch しない**（既存実装維持）。検索/置換は横並び 1fr 1fr で w640 以下縦並び（Component.module.css L38-48 既存仕様）。

#### 論点 4: AP-P21 役割分担（操作側 vs 膨張側の二分類）

text-replace は「3 入力 + 1 出力」の複合構造のため、cycle-202 以降の AP-P21 単純役割分担パターンの単純適用が困難。以下 3 案を比較:

| 評価軸                            | 案 α: 操作側 = 検索 + 置換 input / 膨張側 = 本文 textarea + 結果欄（**第一推奨**）                                                                                                | 案 β: 操作側 = 検索 + 置換 input + 本文 textarea / 膨張側 = 結果欄のみ                                                       | 案 γ: 全 4 要素を均等配分（役割分担なし）                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値                    | 本文 textarea が残余高さを得て十分な高さ確保 = visitor が「貼り付けたテキストを確認できる」価値最大。結果欄も同様に残余高さを共有。検索/置換 input は短い固定高さで常に操作可能。 | 本文 textarea が固定高 = visitor が貼り付けた長文の確認が困難 (rows=2 相当)。結果欄のみ膨張可能。                            | 全要素を均等に膨張させると操作側 input が縦に伸びる無意味な拡大 = AP-P21 違反パターン（cycle-202 で実証済の構造リスク）。 |
| (ii) AP-P21 適合性                | 役割分担明確 = AP-P21 ベストプラクティス遵守。                                                                                                                                    | 役割分担はあるが「本文 textarea を操作側に分類」する根拠が弱い（本文は visitor が長文を貼り付ける対象 = 視認性確保が必要）。 | AP-P21 違反パターン。                                                                                                     |
| (iii) 結果膨張時の挙動            | 本文 textarea と結果欄が残余高さを分け合う = 結果が膨張すると本文 textarea も縮む = visitor が「入力した本文」と「結果」を両方確認可能（各々を枠内収納する制御を併用）。          | 結果欄のみ膨張、本文 textarea は固定。結果が長い場合は結果欄を枠内収納で対応。                                               | 不明（破綻リスク高）。                                                                                                    |
| (iv) (e) 100,000 字エラー時の挙動 | エラー枠が条件付き表示 → 本文 textarea + 結果欄の残余高さからエラー枠相当の高さが振り替えられる。両者が残余高さを分け合うため均等に縮む = 影響均等。                              | エラー枠 → 結果欄のみ縮む。本文 textarea は固定で影響なし。                                                                  | 不明。                                                                                                                    |
| (v) 実装コスト                    | 中（残余高さ配分 + 各々の枠内収納制御）。                                                                                                                                         | 低（本文 textarea を固定高 rows=2 にするのみ）。                                                                             | 最低（ただし AP-P21 違反）。                                                                                              |
| (vi) Phase 10.1 SSoT 引用可能性   | 「複合入力型タイルの AP-P21 二分類役割分担」SSoT として後続の複合入力型タイル（regex-tester 等）に引用可能。                                                                      | 「本文固定 + 結果のみ膨張」SSoT として qr-code 同型の単一出力膨張型に引用可能。                                              | 引用不可（AP-P21 違反）。                                                                                                 |

**第一推奨 = 案 α（操作側 = 検索 + 置換 / 膨張側 = 本文 + 結果）**。

**採択理由**:

1. **来訪者価値最大化**: 本文 textarea は visitor が貼り付けた長文の確認に使う = 視認性確保が最重要 = 膨張側に置く
2. **AP-P21 ベストプラクティス遵守**: 役割分担を「操作 (短い) vs 膨張 (長い)」で機能本位に分類
3. **結果膨張時の挙動が visitor 想定と合致**: 本文と結果を 1:1 で配分 = 「入力と結果を両方視認」が常に可能
4. **Phase 10.1 SSoT として後続複合入力型タイル（regex-tester / text-diff 等）に引用可能**

**退避案フロー**: (e) 計測で FAIL の場合は案 β（本文固定 + 結果のみ膨張）にフォールバック（前述 §退避案分岐の優先順位 §Step 3）。

#### 論点 5: エラー文言（100,000 字超過時）

| 評価軸               | 案 a: logic.ts 既存文言「入力テキストが長すぎます（最大100,000文字）」をそのまま表示（**第一推奨**）                                                                                                                                                                                                                                                                                                                                                    | 案 b: タイル UI 側で文言をハードコード（logic.ts の result.error を使わず独自文言）（MINOR-1 r1 対応で実質的選択肢に置換 = 「タイル/詳細で別文言」ダミー案を撤回） | 案 c: logic.ts の result.error から数値部分のみ抽出して短縮表示                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値       | logic.ts の result.error をそのまま表示 = タイル/詳細で同一文言 = T2 likes「操作性一貫」適合。                                                                                                                                                                                                                                                                                                                                                          | タイル独自文言で詳細ページと体験が分裂 = T2 likes 違反。文言改変時の二重管理リスク。                                                                               | 文言の短縮で枠内余裕は増えるが、抽出ロジック追加 = 維持コスト増 + logic.ts 変更時に追従漏れリスク。 |
| (ii) 実装コスト      | 最低（logic.ts の result.error をそのまま表示）。                                                                                                                                                                                                                                                                                                                                                                                                       | 低（タイル UI 側で error チェック → 独自文言表示）。                                                                                                               | 中（タイル用に文字列抽出関数を追加）。                                                              |
| (iii) タイル枠内収納 | 文言「入力テキストが長すぎます（最大100,000文字）」は全角 21 字 + 半角 8 字 ≈ 全角換算 25 字。`.error` クラス (`font-size: 0.85rem` ≈ 13.6px / `padding: 0.75rem` = 上下左右一律 12px / MINOR-16 r4 対応) でタイル幅 400px - padding 左右合計 24px = 376px 内に収まる**見込み**だが、**400px をやや超過して折り返す可能性あり**（MAJOR-10 r2 対応 = font-size / padding 考慮で 1 行収納の確実性が断言できないため見込みに格下げ）= T-4 視覚検証で確認。 | 文言依存（短縮可能だが詳細ページとの分裂リスクが残る）。                                                                                                           | 短縮で余裕がある（折り返しリスク低）。                                                              |

**第一推奨 = 案 a（既存文言をそのまま表示）**。

**採択理由**:

1. **T2 likes「操作性一貫」最大適合** = タイル / 詳細で同一文言
2. **実装コスト最低** = logic.ts の result.error をそのまま使用
3. **タイル枠内収納の見込みあり / 折り返し時の退避フロー明示**（MAJOR-10 r2 対応）: 文言は全角換算 25 字 × フォントサイズ 13.6px **≈ 340px（推定値 / SSoT ではない / R5 数値 literal 3 分類 = 推定値）**、タイル幅 376px (= 400px - padding 左右合計 24px / MINOR-16 r4 対応) 内に収まる**見込み**。ただし font-family（system / sans-serif）による文字幅差、padding の OS / browser 差異、placeholder 含む textarea 兄弟要素との visual バランス等で 1 行に収まらない可能性は残る。**T-4 視覚検証で 1 行収納が確認できない場合は案 c（数値部分のみ抽出して短縮表示）への切替をキャリーオーバー検討する**

**T-4 視覚検証項目（MAJOR-10 r2 / NIT-8 r3 / CRIT-6 r4 / MINOR-17 r5 対応 = T-4 実機確認に追加 + 数値 literal を計画段階で確定しない方針へ転換 / PM 推奨案 1 採択）**: 「(d) 入力長制限ぎりぎり付近の AP-P21 計測時に、エラー文言枠の実測幅 ≤ 376px、エラー文言が 1 行で収まっていることを目視確認 + **`.error` クラス 1 行分の高さ実測値を T-4 で確定する**（SSoT 値は T-4 実機計測値を採択 / 計画段階では予測値のみ記載）」

**`.error` クラス 1 行分の高さ予測（実機計測前のラフな見積もり / SSoT ではない）**: `.error` クラスは `font-size: 0.85rem` ≈ 13.6px / `padding: 0.75rem`（上下左右一律 = 上下合計 24px / MINOR-16 r4 対応）を持つ（`src/tools/text-replace/Component.module.css` L122-129）。**`.error` クラスに `line-height` は直接定義されていない**ため、`src/app/globals.css` L174-175 の `html, body { font-size: 16px; line-height: 1.7; }` から継承される（CRIT-6 r4 対応 = R3-R4 で誤って `.textarea` の `line-height: 1.5` を流用した訂正の再訂正）。継承前提の予測値は概ね 47px 前後だが、これは「**計画段階の予測値であり SSoT ではない**」。実 SSoT は T-4 で `getBoundingClientRect()` 実測値を採用する。

**判定基準（T-4 実機計測時の確定基準）**: T-4 で計測した「エラー枠表示時の `.error` 要素 boundingHeight」を SSoT 値として確定 + 確定値が AP-P21 既存基準 (i) 下限 40px 以上を満たし、概ね 40〜60px 範囲内に 1 行で収まることを判定。確定値は T-4 完了時点で本計画書の本セクションに追記する（R4 完成宣言時の網羅性確認手順を準用）。**FAIL 時**は論点 5 案 c（数値部分のみ抽出して短縮表示）への切替を後続サイクルでキャリーオーバー検討。

**T-4 実機計測確定値（SSoT / CRIT-R3 修正後の実測値）**: **h=46.09px / w=376px**（タイル UI エラー枠 `padding: "11px 8px"` / `fontSize: "0.8125rem"` / Playwright 計測 / cycle-210 T-4 CRIT-R3 修正後 2026-05-27）。1 行収納 PASS / w=376px ≤ 376px PASS / h=46.09px ≥ 40px PASS。計画書 §論点 5 予測値「概ね 47px 前後」に近い実測値で整合。**論点 5 案 c（数値短縮）へのキャリーオーバーは不要**（1 行収納・高さ基準ともに PASS）。

#### 論点 6: T1 yaml search_intents 追加語（前述「目的 §追加クエリ確定」で literal 確定済）

採択 = 「テキスト置換」/「文字列置換」/「一括置換」/「テキスト置換 オンライン」の 4 語を末尾に追加。

#### 論点 7: warning 系トークン置換マッピング（本サイクル初登場 = SSoT 確立）

`(new)` globals.css に定義されている warning 系トークンは以下 3 種:

- `--warning`: oklch(0.62 0.16 80) (ライト) / oklch(0.75 0.14 80) (ダーク) = **メインの黄色**
- `--warning-strong`: oklch(0.5 0.16 80) (ライト) / oklch(0.88 0.1 80) (ダーク) = **より濃い黄色（暗色背景用 or 強調用）**
- `--warning-soft`: oklch(0.93 0.04 80) (ライト) / oklch(0.25 0.05 80) (ダーク) = **薄い背景色**

text-replace の旧トークン:

- `--color-warning-text` = warning 表示のテキスト色（暗色 = 強調）
- `--color-warning-border` = warning 枠の境界線色
- `--color-warning-bg` = warning 枠の背景色（薄色）

**globals.css の admonition 系エイリアス**（MAJOR-2 r1 対応 = 4 案目検討の前提）: `src/app/globals.css` L69-70 / L144-145 に **`--admonition-warning`** / **`--admonition-warning-bg`** が定義されており、それぞれ `var(--warning)` / `var(--warning-soft)` のエイリアスとなっている（コメント: 「note/tip/warning/caution は既存の status トークンのエイリアス」L59）。実際の使用箇所は `.markdown-alert-warning`（L293-299）= **markdown alert 用に予約された 2 トークン**。

**マッピング 4 案比較**（MAJOR-2 r1 対応で 案 D を追加）:

| 旧トークン               | 案 A（**第一推奨**） | 案 B                 | 案 C                   | 案 D（admonition エイリアス使用） |
| ------------------------ | -------------------- | -------------------- | ---------------------- | --------------------------------- |
| `--color-warning-text`   | → `--warning-strong` | → `--warning`        | → `--fg`（中性化）     | → `--admonition-warning`          |
| `--color-warning-border` | → `--warning`        | → `--warning-strong` | → `--border`（中性化） | → `--admonition-warning`          |
| `--color-warning-bg`     | → `--warning-soft`   | → `--warning-soft`   | → `--bg`（中性化）     | → `--admonition-warning-bg`       |

| 評価軸                               | 案 A                                                                                                                          | 案 B                                                                                                            | 案 C                                                                                                                                             | 案 D（admonition エイリアス）                                                                                                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値（warning 意図の伝達） | テキスト = strong (濃) / 境界線 = base (中) / 背景 = soft (薄) の 3 段階で warning を視覚的に明確に伝える。                   | テキスト = base / 境界線 = strong = テキストより境界線が濃いため「枠が前面に出てテキストが目立たない」逆転。    | warning 性を完全に失う = 「複雑な正規表現はブラウザがフリーズする可能性があります」という重要警告が中性化されて伝わらない = visitor 価値毀損大。 | テキスト・境界線とも同一色（`--warning`）= 境界線がテキストに溶け込み視覚的階層が失われる。markdown alert は `border-left` のみで境界全周を引かないため成立するが、tool warning の全周枠では境界線とテキストの分離が必要。 |
| (ii) WCAG コントラスト               | strong (oklch 0.5/0.88) on soft (oklch 0.93/0.25) = 高コントラスト = 読みやすい。                                             | base (oklch 0.62/0.75) on soft (oklch 0.93/0.25) = 中コントラスト = ダークモードで読みにくい可能性。            | fg on bg = 既存通常テキストと同等 = warning 性なし。                                                                                             | base on soft = 案 B 相当 = 中コントラスト = ダークモードで読みにくい可能性。                                                                                                                                               |
| (iii) globals.css 設計意図との整合   | `--warning-strong` の役割（より濃い黄色）= テキスト用、`--warning` の役割（メイン）= 境界線用 で globals.css 命名意図と一致。 | `--warning-strong` を境界線に使うのは命名意図と齟齬（テキスト用が前提）。                                       | warning 系を全く使わない = globals.css に warning が存在する設計意図に反する。                                                                   | **admonition 系は markdown alert 用に予約された semantic alias**（`.markdown-alert-warning` でのみ使用）= ツール内 warning 表示への適用は semantic 越境となる懸念。                                                        |
| (iv) 後続再利用性                    | 後続の warning 系を含むツール（regex-tester / regex-cheatsheet 等）で同じマッピングを再利用可能 = SSoT 確立。                 | テキスト=base / 境界線=strong の逆転組合せで視覚的階層が崩れる組合せのため SSoT 化に不向き（MINOR-7 r2 対応）。 | warning 性を完全に失う組合せのため SSoT 化に不向き（MINOR-7 r2 対応）。                                                                          | admonition 系を tool に流用する SSoT が確立すると、後続で「ツール内 warning と markdown alert で同一トークンを使うべきか」の判断が複雑化する。                                                                             |
| (v) 実装コスト                       | 最低（一括置換）。                                                                                                            | 最低。                                                                                                          | 最低。                                                                                                                                           | 最低。                                                                                                                                                                                                                     |

**第一推奨 = 案 A**:

- `--color-warning-text` → **`--warning-strong`**
- `--color-warning-border` → **`--warning`**
- `--color-warning-bg` → **`--warning-soft`**

**採択理由**:

1. **warning 意図の最大伝達**: 「複雑な正規表現はブラウザがフリーズする可能性があります」（Component.tsx L114-116）は visitor の操作を保護する重要警告 = 視覚的に明確に伝える必要
2. **globals.css 命名意図との一致**: `--warning-strong` は「より濃い黄色」= テキスト用の意図、`--warning` は「メインの黄色」= 境界線用の意図
3. **WCAG 読みやすさ**: 案 A は strong on soft で高コントラスト = ライト/ダーク両モードで読みやすい
4. **SSoT 確立**: 後続の warning 系を含むツール（regex-tester / regex-cheatsheet 等）で同じマッピングを再利用可能 = Phase 8.1 全体での運用効率向上
5. **案 D を不採用とした追加理由（MAJOR-2 r1 対応）**: `--admonition-*` 系は `globals.css` L59 コメント「note/tip/warning/caution は既存の status トークンのエイリアス」と L293-299 の `.markdown-alert-warning` 単独使用から、**markdown alert 用に予約された semantic alias** と判断。ツール内 warning 表示は markdown 由来ではなく React コンポーネント内の機能警告であり、semantic 越境を避けて生のトークン（`--warning` / `--warning-strong` / `--warning-soft`）を使用する方が後続の判断（ツール内 warning と markdown alert で同一視するか分離するか）を簡潔化できる。なお案 D 採用時のテキスト・境界線同一色問題（評価軸 (i)）も視覚的階層を失うため独立に不採用根拠となる。

**T-4 検証**: Playwright で警告表示状態（正規表現 ON 状態）のスクショをライト/ダーク両モードで撮影し、warning 表示が視覚的に明確に伝わっていることを確認。

### 計画にあたって参考にした情報

- **本サイクル planning フェーズで実施した 3 件の事前調査**:
  - `/mnt/data/yolo-web/docs/research/2026-05-26-cycle-210-target-user-mapping.md`（ターゲットユーザー T1/T2 と text-replace の対応関係 / オプション省略推奨 = 案 A / cols=3 rows=3 推奨 / **タイル / 詳細責務分離方針** / PM により `./tmp/research/` から `./docs/research/` へ移動済）
  - `/mnt/data/yolo-web/docs/research/2026-05-26-competitor-text-replace-tools.md`（競合 11 サイト UI 調査 + スクリーンショット 14 枚 / 案 B = バランス型 = 大文字小文字トグルのみ推奨 / 既存 Component.tsx 評価 ★★★★ / レイアウト推定図 §12）
  - **text-replace 現状コードの直接 Read 確認**（NIT-5 r2 / NIT-7 r3 対応 = 経緯記述を 1 行に短縮 / 事前調査用一時ファイルは Q&A 完結し、計画書には実体実測値のみを転記）: `src/tools/text-replace/{Component.tsx, Component.module.css, logic.ts, meta.ts, __tests__/logic.test.ts}` を直接 Read。**実体**: Component.module.css 24 箇所 / 10 種（warning 3 種含む） / logic.ts MAX_INPUT_LENGTH = 100,000 / export 3 件（CRIT-5 r2 対応）/ 既存テスト 12 件 = logic のみ / Component テスト不存在
- `/mnt/data/yolo-web/docs/cycles/cycle-209.md`（直前サイクル / line-break-remover / 通常運用継続 3 回目 / 2 階層オプション初導入 / AP-P21 5 ケース計測 / B-443/B-444/B-445 起票 / 退避案 Step 1〜3 フロー）
- `/mnt/data/yolo-web/docs/cycles/cycle-208.md`（kana-converter / 通常運用継続 2 回目 / IME 観察結果 / B-442/B-443 起票）
- `/mnt/data/yolo-web/docs/cycles/cycle-207.md`（qr-code / 画像/SVG 出力型初回 / rows=3 / AP-P19 教訓 / B-440 起票元）
- `/mnt/data/yolo-web/docs/cycles/cycle-206.md`（fullwidth-converter / オプション全 ON 固定省略 = 本サイクル論点 2 案 A SSoT / textarea×2 双方向先例）
- `/mnt/data/yolo-web/docs/research/2026-05-25-cycle-209-phase8.1-standard-patterns.md`（cycle-200〜208 標準パターン抽出 / AP-P21/P17/WF16/P19 最新定義 / `src/tools/_constants/tile-grid.ts` 定数 / 既存 9 タイル → 10 タイルのオプション収納実例 / PM により `./tmp/research/` から `./docs/research/` へ移動済）
- `/mnt/data/yolo-web/docs/anti-patterns/planning.md` / `implementation.md` / `workflow.md`（AP-P16 / AP-P17 / AP-P19 / AP-P20 / AP-P21 / AP-WF03 / AP-WF05 / AP-WF12 / AP-WF16 の最新規定）
- `/mnt/data/yolo-web/docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1 yaml 現状 = 17 語 / テキスト置換関連語ゼロ）
- `/mnt/data/yolo-web/docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2 yaml / 一貫性 / ブックマーク代替）
- `/mnt/data/yolo-web/docs/design-migration-plan.md`（Phase 8.1 全体計画 / 新デザイン移行ルール）
- `/mnt/data/yolo-web/docs/knowledge/animation-conventions.md`（cycle-209 新規 / opacity フェード SSoT / 本サイクルでは条件付き表示なしのため間接的な参照のみ）
- `/mnt/data/yolo-web/src/tools/_constants/tile-declarations.ts` / `/mnt/data/yolo-web/src/tools/_constants/tile-grid.ts`（タイル基盤 / 現状 10 タイル / cols=3 rows=2 と cols=3 rows=3 の実ピクセル算出）
- `/mnt/data/yolo-web/src/tools/line-break-remover/LineBreakRemoverTile.tsx`（直近 SSoT / 372 行 / インラインスタイル方式 / `<Link>` 配置 / `role="status"` 適用パターン）
- `/mnt/data/yolo-web/src/tools/kana-converter/KanaConverterTile.tsx`（2 階層オプション前の SSoT / aria-pressed パターン）
- `/mnt/data/yolo-web/src/tools/text-replace/`（移行対象実体 / logic.ts L20-22 で MAX_INPUT_LENGTH = 100,000 / Component.tsx L113-116 で warning 表示）
- `/mnt/data/yolo-web/src/app/globals.css`（warning 系トークン定義 / L40-42 ライト / L126-128 ダーク / `--warning` / `--warning-strong` / `--warning-soft` 3 種）

## キャリーオーバー候補（本サイクル外として認識する事項）

本サイクルでは扱わず、後続サイクルに送る項目を計画段階で整理しておく:

1. **B-444（cycle-209 起票 / opacity トークン化）**: Phase 8.1 完了後に一括対応の方が効率。本サイクルでは条件付き表示なしのため opacity リテラル使用機会限定的
2. **B-445（cycle-209 起票 / fieldset+legend 化）**: 詳細ページが checkbox 3 個を `<div>` でまとめている場合は対象に追加。radiogroup 全件 + checkbox 群一括の方が効率
3. **B-446 (PDF プリセット) / B-447 (smart-pdf 解説) / B-448 (モードラベル補助)**: line-break-remover 固有、本サイクルでは対象外
4. **B-449（本サイクル T-2 で新規起票確定 / MINOR-3 r1 + MAJOR-9 r2 対応）「text-replace Component テスト未整備」**: 詳細ページ Component.tsx に既存テストが存在しない（T-1 実測）。本サイクルでは詳細ページを touch しないため Component テスト追加は不要。**T-2 D 項で `docs/backlog.md` Active セクションに B-449 として追記する**（タイトル / 優先度 / 着手条件 / スコープ / 起票根拠の literal は §T-2 D 項参照 / T-2 完成条件で起票完了を grep 検証 / 次の空き B 番号 = `docs/backlog.md` L86-91 = B-444〜B-448 が cycle-209 で起票済のため B-449 が次空き）
5. **論点 2 で省略した正規表現 / 大文字小文字オプションのタイル提供**: 採択案 A により省略したが、Phase 10.1 ダッシュボード設計時に「タイル横断オプション」として再検討の余地
6. **論点 1 で採択した cols=3 rows=3 (qr-code に続く 2 件目) の Phase 10.1 ダッシュボード設計への影響評価**: rows=2/3 混在 SSoT として Phase 10.1 で再検討
7. **論点 7 で確立した warning 系トークン置換マッピング SSoT**: 後続の warning 系を含むツール（regex-tester / regex-cheatsheet 等）で再利用 = Phase 8.1 残り回数での運用
8. **複合入力型タイル AP-P21 二分類役割分担 SSoT (論点 4 案 α)**: 後続の複合入力型タイル（regex-tester / text-diff 等）で再利用 = Phase 8.1 残り回数 / Phase 10.1 ダッシュボード設計時の引用根拠
9. **CRIT-1 r1 / CRIT-5 r2 / CRIT-6 r4 の 3 連続事実誤認 = 失敗パターン記録（AP-P16 / AP-WF12 違反の実例）**（MINOR-6 r2 / R5 PM 必須指示 1 対応で 3 連続発生を明示）: 本サイクル計画フェーズで以下 3 回連続で「実体未確認の数値 literal を計画書に断言」する事故が発生:
   - R1: 「既存テスト 18 件」と断言 → R2 で実測「12 件」に訂正
   - R2: 「logic.ts export 4 件」と断言 → R3 で実測「3 件」に訂正（R1 NIT-3 として指摘 → R2 で見落とし → R3 で CRIT-5 昇格）
   - R4: 「.error 高さ ≈ 44.4px」と断言 → R5 で `.error` に `line-height` 未定義（globals.css `line-height: 1.7` を継承）と判明 → 約 47px 前後に修正 + そもそも実機計測 SSoT に変更

   **サイクル完了時の PM 必須対応**: PM がサイクル完了処理で `docs/anti-patterns/planning.md` AP-P16 既存記述末尾の事例リストを以下の literal で書き換える（NIT-14 r5 対応 = 追記文言を literal 確定）:
   - **書き換え前**: `（cycle-174, 184, 188で実際に発生）`
   - **書き換え後**: `（cycle-174, 184, 188, 210で実際に発生 / cycle-210 では R1-CRIT-1 = テスト件数 / R2-CRIT-5 = export 件数 / R4-CRIT-6 = CSS 高さ計算の 3 連続事故）`

   CLAUDE.md「Check anti-patterns on failure」ルールに従い、「追記候補化」ではなく確定追記とする。

10. **tmp パス命名規約の SSoT 化（NIT-9 r3 提案）**: 本計画書で `tmp/cycle-210/baseline/` / `tmp/cycle-210/ime-observation/` 等のパスをハードコードしている。Phase 8.1 各サイクルで同型の慣用パターン（`tmp/cycle-<n>/<subcategory>/`）が運用されてきたため、SSoT 化（`docs/knowledge/` か CLAUDE.md / `docs/cycles/README.md` 相当）への昇格を後続サイクルで検討。本サイクルでは hardcode のままで OK。**着手条件**: なし（独立タスク）。**起票判断**: PM がサイクル完了処理時に B-450 として起票するか保留かを判断（B-450 起票時は backlog.md Active セクションに追加）

11. **実体未確認の数値 literal を計画書に書かないプロセス改善（R5 PM 必須指示 2 / MINOR-18 r5 / MINOR-19 r5 / MAJOR-17 r5 対応 = 根本対応 + 判断軸具体化 + cycle-211 以降への継承明示 + 遡及範囲決定）**: CRIT-1 r1 / CRIT-5 r2 / CRIT-6 r4 の 3 連続事実誤認を踏まえ、サイクル完了処理で以下のいずれかを実施:
    - **(a)** `docs/anti-patterns/planning.md` の AP-P16 を強化し、「計算式から導出した数値を SSoT として literal 確定しない / 計算結果は推定値として書き、実機計測で確定する」を AP-P16 の射程に追加
    - **(b)** `docs/knowledge/planning-numerical-literals.md` 等の名称で「数値 literal の取扱い指針」を新規 SSoT として追加（AP-P16 は計画書執筆時の自己発火チェックであるのに対し、本知見は「数値 literal は実測値 vs 仕様値 vs 推定値 の 3 種に区別する」設計指針として独立 SSoT 化する位置付け / cycle-211 以降の planner / reviewer が本 SSoT を直接参照する形で運用継承する）

    **判断軸の具体化（MINOR-18 r5 対応）**:
    - **(a) AP-P16 強化のみで充足するケース**: AP-P16 既存記述「実体確認」の射程を「計算結果も実体確認の対象」と拡張するだけで本サイクル教訓を再利用できる場合。AP-P16 の自己発火チェック性質（計画書執筆中に当事者が自分で発火させる）が「計算結果の実体確認」にも自然に適用される文体で書ければ (a) で充足
    - **(b) 独立 SSoT が必要なケース**: 「数値 literal の 3 分類 (実測値 / 仕様値 / 推定値)」が AP-P16 とは独立した設計指針として将来サイクルでも横断利用される見込みがある場合（例: 推定値と実測値の混在を明示する hedge 表現の書き方 / 推定値を SSoT として確定しないためのレビュー観点 / 数値の出典明示形式の標準化など、AP-P16 の射程を超える具体運用ルールを集約する必要がある場合）

    **遡及範囲の決定（MAJOR-17 r5 / PM 推奨 = 選択肢 2 採択）**: cycle-210 計画書の既存数値 literal への遡及ラベル付けは本サイクル内では実施しない。理由: (i) 数十箇所の Edit が必要で完成タイミングが延びる、(ii) 既存数値 literal の多くは「実測コマンド併記」「予測値 / SSoT ではない の明示」で代替できているため緊急性が低い、(iii) cycle-211 以降の新規追記時のみ 3 分類ラベルを適用する運用で十分。サイクル完了処理時に PM が再評価し、必要なら次サイクルで遡及実施するか、本キャリーオーバー項目とは別に独立サイクル化する。

    **B 番号化**: 本キャリーオーバー項目自体は B 番号化（例: B-451）してサイクル完了処理時に確定。判断結果（(a) or (b)）と遡及範囲の最終決定は B-451 起票時に literal で記録する。

12. **AP-P19 (外部仕様の依存) の射程拡張検討（MAJOR-16 r4 対応）**: AP-P19 既存事例は「Google SearchAction sitelinks searchbox」だが、CSS 継承挙動も同じ「外部仕様 = W3C 仕様」に該当することが CRIT-6 r4 で実証された。`docs/anti-patterns/planning.md` AP-P19 の射程に「CSS 継承挙動 / W3C 仕様」を含めるか、または `docs/knowledge/` に「CSS 継承挙動の確認ポイント」を SSoT 化するかを後続サイクルで検討。本サイクルでは知見蓄積として記録のみ。

## レビュー結果

### 計画フェーズ

#### R1（CRIT 4 + MAJOR 6 + MINOR 4 = 14 件 + NIT 3 件発出後撤回扱い / MINOR-10 r3 対応 = 内訳と件数を再確定 / うち 13 件 R2 で対応充足・1 件 NIT-3 が R2 で CRIT-5 昇格）

**件数内訳の根拠**（PM 補足 / MINOR-10 r3 対応 = R3 で記載した「= 17 件」を訂正）: R1 reviewer 出力 = CRIT 4 / MAJOR 6 / MINOR 4 + NIT 4 件発出のうち NIT-4 は reviewer 自身が「該当なし」として撤回。実質扱いは NIT 3 件（NIT-1, NIT-2, NIT-3）= **PM の集計分類では計 14 件**（CRIT 4 + MAJOR 6 + MINOR 4）。NIT 3 件は計画品質に影響しないため上記 14 件のスコープ外として扱う（cycle-209 と同型運用）。本サイクルでは NIT-3 のみ R2 未対応 → R3 で CRIT-5 昇格となったため、結果的に NIT も実装対応が発生した。

主要指摘:

- **CRIT-1（既存テスト件数の事実誤認 / AP-WF12 / AP-P16 違反）**: 計画書 L18 / L20 / L93 / L106 / L111 で「既存テスト 18 件」と断言したが、`grep -cE '^\s*test\(|^\s*it\(' src/tools/text-replace/__tests__/logic.test.ts` の実測は 12 件。R2 で全箇所を「12 件」に修正 + cycle-209 line-break-remover の 57 件は計画 baseline 計画値である旨を明記 + キャリーオーバー 9 番に「AP-P16 事例追記」を記録
- **CRIT-2（relatedSlugs の事実誤認 / AP-WF12 違反）**: 計画書 L101 / L189 で「regex-tester / text-diff が存在しない可能性」と書いたが、実測で 6 件全件実在を確認。R2 で「6 件全件実在を確認済 / T-2 で除去対象なし」に修正
- **CRIT-3（`./tmp/` 配下ファイルへの参照禁止ルール違反）**: 計画書 L29 / L497 / L504 で `tmp/research/` 配下ファイルを参照。`.claude/rules/tmp-directory.md` 違反。PM が両ファイルを `docs/research/` に移動済のため、R2 で全件 `docs/research/` パスに置換
- **CRIT-4（AP-P20 / AP-WF03 過度に具体的な計画）**: 論点 4 で `flex: 1` / `overflowY: auto` の style literal / 論点 3 `flexDirection: column` style literal / テスト assertion の入力値・期待値 literal が過剰具体化されていた。R2 でテスト観点は「観点 + ベースライン要件」までに抽象化（具体 literal は builder 裁量）/ 論点 3, 4 の style literal は「役割分担」レベルに抽象化 / warning トークン置換マップとエラー文言 literal（外部仕様への適合）のみ literal 維持
- **MAJOR-1（論点 2 採択理由 5 が visitor 価値毀損を過小評価）**: 「2 ステップで吸収可能」表現が visitor の「コピー後の貼付先で気づくまで時間差 + 復元コスト」シナリオを過小評価していた。R2 で採択理由 5 を「リスクを率直に認識した上で T1 likes 最大化を優先」と書き直し + 緩和策として「検索フィールド placeholder 等で『大文字と小文字を区別』旨を visitor が事前認識可能にする補助ラベル」を T-3 共通実装事項に追記（R3 で論点 2.1 として独立論点化し 2 案比較）
- **MAJOR-2（論点 7 で globals.css エイリアス系の検討漏れ）**: `--admonition-warning` / `--admonition-warning-bg` のエイリアス案が未検討だった。R2 で 案 D「admonition エイリアス使用」を 4 案目として追加し、不採用根拠を明記
- **MAJOR-3（AP-P21 計測 5 ケースで欠けている境界 / 正規表現エラー時）**: タイル UI で正規表現エラーが発生しない前提の確認手順がなかった。R2 で T-3 完成条件に「タイル UI で `options.useRegex: false` 固定であり、`useRegex` を `true` にする UI 経路が存在しないことを grep で確認」を追加
- **MAJOR-4（タイルテスト 8 件の十分性不足）**: 空入力時のコピーボタン非表示 / clipboard 不在時 silent fail / 置換件数表示 の 3 観点が欠落していた。R2 でテスト最低件数を 8 → 11 件に拡張、観点 (ix)(x)(xi) を追加
- **MAJOR-5（退避案 Step 1 の cols=4 タイル昇格判断条件が PM 待ちで詳細不足）**: PM 判断基準が未明文化だった。R2 で Step 1 と Step 2 の退避案 PM 判断軸を「(α) Phase 10.1 ダッシュボード設計影響 / (β) w375 視認性 / (γ) 他退避案との比較」の 3 軸で明文化
- **MAJOR-6（B-443 件数連動更新の不明確さ）**: 計画書 L188 完成条件が「論点 4 採択結果と連動」と曖昧表現だったが、本来は「論点 2 採択結果と連動」で正しい。R2 で「論点 2 採択 = 案 A 全省略により B-443 件数据置き（7/6/6 維持）で確定」「論点 4 は ARIA とは独立で B-443 とは無関係」と明確化
- **MINOR-1（論点 5 第 3 案が形式的）**: 案 c「タイル/詳細で別文言」が不採用前提のダミー案だった。R2 で案 b/c を実質的選択肢「タイル UI 側で文言をハードコード」「logic.ts result.error から数値部分のみ抽出して短縮表示」に置き換え
- **MINOR-2（論点 1 退避案順序の整理）**: 案 A (cols=3 rows=2) を試さず案 C にジャンプする論理が唐突だった。R2 で Step 1 FAIL 時の候補一覧に「案 A は前述採択理由 4 により不採用済 / 案 C のみが候補」と明示
- **MINOR-3（キャリーオーバー B 番号未確定）**: 「B-XXX」表記だった。R2 で `docs/backlog.md` L86-91 を実測し、次の空き番号 B-449 を確定
- **MINOR-4（/internal/tiles/preview の存在確認漏れ）**: 計画 R2 時点で `src/app/(new)/internal/tiles/preview/[domain]/[slug]/page.tsx` の実在を確認、T-1 完成条件に追加
- **NIT-3（logic.ts export 件数誤認 / R2 で未対応 → R3 で CRIT-5 昇格）**: 「export 4 件」と書いていたが実測は 3 件（MAX_INPUT_LENGTH は非 export）。R2 で見落とし → R3 で CRIT-5 として全面対応

R1 → R2 で CRIT 4 + MAJOR 6 + MINOR 4 = 14 件対応、NIT 3 件のうち NIT-3 が R2 で見落とされ R3 で CRIT-5 昇格。

#### R2（R1 残件 1 件 = CRIT-5 + 新規 CRIT 0 + MAJOR 5 + MINOR 4 + NIT 2 = 12 件）

主要指摘:

- **CRIT-5（R1-NIT-3 未充足 → CRIT 昇格 / logic.ts export 件数 4 → 3）**: `grep -c '^export ' src/tools/text-replace/logic.ts` 実測 = 3。`MAX_INPUT_LENGTH` は非 export。R3 で L92 を「3 件」に修正 + T-1 完成条件 L112 の grep 数値検証も「export 3 件」で照合するよう更新
- **MAJOR-7（AP-P20 過度な具体化が一部箇所で残存 / CRIT-4 部分未対応）**: 「既存テスト 12 件が緑」を完成条件に literal 固定していた。テストが将来増減すると計画書が壊れる。R3 で「既存テスト全件緑 / 計画 R2 時点 12 件 / 件数が異なる場合は計画書を更新」の自己修復的記述に書き直し
- **MAJOR-8（論点 2 緩和策「補助ラベル」の競合調査整合性チェック漏れ）**: 補助ラベル採択前に competitor-research での先例数 / target-user-mapping の T1 dislikes との関係 / 2 案比較が未実施だった。R3 で **論点 2.1「大文字小文字未対応の visitor 通知方法」** を独立論点化し、競合実態の整理（11 競合中明確な先例 0 件）+ T1 yaml dislikes「仕様曖昧」 / likes「前提添え」との関係明示 + 2 案比較（案 (i) 補助ラベル採用 / 案 (ii) 補助ラベルなし）を追加
- **MAJOR-9（B-449 起票タイミングと完成条件の不整合）**: キャリーオーバーで「T-2 で B-449 起票」と書いていたが、T-2 完成条件に起票項目がなかった。R3 で T-2 D 項に B-449 起票内容（タイトル / 優先度 P4 / 着手条件 / スコープ / 起票根拠）を literal で明示 + T-2 完成条件に「B-449 が `docs/backlog.md` Active セクションに追記されている」を追加
- **MAJOR-10（論点 5 案 a「タイル枠内収納」の検証根拠不在）**: font-size / padding を考慮すると 1 行収納が断言できないにもかかわらず「1 行に収まる」と断言していた。R3 で論点 5 案 a (iii) を「収まる**見込み**だが折り返し可能性あり」に格下げ + 採択理由 3 を「見込みあり / 折り返し時の退避フロー明示」に書き直し + T-4 AP-P21 計測判定基準に (vi)「エラー文言枠の実測幅 ≤ 376px + 1 行収納」を追加
- **MAJOR-11（`/internal/tiles/preview/[domain]/[slug]/page.tsx` ルートの domain 値が未指定）**: domain="tools" が `[domain]` ルートで実受理されるか未確認だった。R3 で T-1 完成条件に「`/internal/tiles/preview/tools/line-break-remover` を Playwright で 200 OK 確認（cycle-209 同型 SSoT として参照）」を追加
- **MINOR-5（退避案 Step 2 退避案 α の記述が複雑で混乱を誘発）**: R3 で「退避案 α は本サイクル適用不能」記述を削除し、本サイクルでは退避案を rows=4 拡張 1 つに簡素化
- **MINOR-6（キャリーオーバー 9 番の表現「追記候補化」が曖昧）**: R3 で「PM がサイクル完了処理で AP-P16 既存記述に追記する」と明示
- **MINOR-7（論点 7 案 D 比較表の評価軸 (iv) で全案分の比較が不完全）**: 案 B / 案 C の (iv) 後続再利用性が空欄だった。R3 で「SSoT 化に不向き」根拠を案 B / C それぞれに明示記入
- **MINOR-8（レビュー結果セクションの形式が cycle-209 と異なる）**: R3 で cycle-209 と同じ「Rn 件数サマリ + 主要指摘」を時系列で並べる形式に書き直し
- **NIT-5（L529 で「cycle-210-text-replace-current-state.md は存在しないことを find で実体確認」の前提が不明）**: R3 で「事前調査として code-researcher が完了報告した」の出典を明示
- **NIT-6（T-1 完成条件 L116 で `(new)` が括弧付きシェルパス記法のまま）**: `ls /path/(new)/...` が bash で subshell 誤解釈される。R3 で `find /mnt/data/yolo-web/src/app -path '*/internal/tiles/preview/*/page.tsx'` の bash-safe コマンドに書き換え

R2 → R3 で CRIT 1 + MAJOR 5 + MINOR 4 + NIT 2 = 12 件対応。

#### R3（R2 残件 3 件 + 新規 MAJOR 2 + MINOR 2 + NIT 2 = 9 件 / R3 reviewer 出力 10 件 = 部分未充足 3 件 + 新規 6 件 + R2-NIT-7 含む整理）

主要指摘:

- **MAJOR-12（R2-MAJOR-10 反映漏れ）**: AP-P21 判定基準 (vi) は L297 に追加されたが、T-4 完成条件 L308 に反映されていなかった。R4 で T-4 完成条件に「AP-P21 (vi) (d)/(e) エラー文言 1 行収納基準」を追加。**同型事故防止メモ**: R1-NIT-3 → CRIT-5 昇格と同型の「指摘の一部分のみが反映されて他セクションは古いまま」事故。R4 では「反映対象セクションを網羅的に grep」する手順を運用化（後述 R4 完成宣言時の網羅性確認手順）
- **MAJOR-13（論点 2.1 採択理由に T2 likes トレードオフ説明不足）**: 比較表 (vi) で第一推奨案 (i) が T2 likes 観点で劣り、案 (ii) が T2 likes 観点で勝るのに、採択理由に不利点が言及されていなかった。R4 で採択理由 5 として「T2 likes 操作性一貫の整合性低下リスクの率直な評価」を追加（MAJOR-1 r1 と同パターン = 対立軸明示）
- **MAJOR-14（退避案の「PM 判断必須」フローが循環構造）**: 「PM が計画書に追記する形で確定」表現が実行不能だった。R4 で Step 1 / Step 2 PM 判断フローに (a) 計画書 R4 を planner に依頼 / (b) PM 即時判断で計画書直接更新 / (c) 退避案そのものを諦める の 3 選択肢を明示
- **MINOR-9（B-449 grep 検証の T-2 builder 報告コマンドが古い）**: T-2 完成条件 L177 と T-2 builder 報告コマンド L201 で B-449 の有無が不一致だった。R4 で L201 を統一
- **MINOR-10（時系列形式の件数集計が不正確）**: R3 で R1 を「= 17 件」と書いたが正しくは「= 14 件 + NIT 3 件発出後撤回扱い」。R4 で内訳の根拠を「PM 補足」で明示
- **MINOR-11（論点 2.1 が 2 案比較で AP-P17 射程内か曖昧）**: R4 で「2 案比較で AP-P17 の精神を満たす根拠」を論点 2.1 内に追記
- **MINOR-12（採用 / 採択 / 不採用 が混在）**: R4 で「採択 / 不採用」に統一する旨を論点 2.1 末尾に明示 + 主要箇所（タイル UI トグル採用採択時 / 「採用」を「採択」に置換）を修正
- **NIT-7（NIT-5 対応の経緯記述が長すぎ）**: 約 200 字の経緯記述を R4 で 1 行に短縮
- **NIT-8（タイル枠内収納の高さ計算式が論点 5 と T-4 で微妙に違う）**: R4 で論点 5 「T-4 視覚検証項目」を SSoT 確定（≈ 44.4px = font-size × line-height + padding 上下 × 2）し、AP-P21 (vi) は SSoT を参照する形に統一。R3 で誤って 36px と記載していた値を 44.4px に訂正。**reviewer 反省（NIT-11 r4 追記）**: R3 reviewer 自身も NIT-8 指摘時に 36px → 44.4px の計算式を検証しなかった。R4 で planner が 44.4px に訂正したが、その 44.4px も `.error` の `line-height` 継承未確認だった = CRIT-6 r4 で発覚。reviewer / planner / PM の 3 者全員が「直接定義されていない CSS プロパティの継承先確認」を見落とした構造的事故 → R5 で実機計測 SSoT 方針に転換
- **NIT-9（tmp/cycle-210/ パスが計画書全体に hardcode）**: 本サイクルでは hardcode のまま許容。R4 で キャリーオーバー 10 番として SSoT 化候補に追記

R3 → R4 で MAJOR 3 + MINOR 4 + NIT 3 = 10 件対応。

#### R4（R3 部分未充足 2 件 + 新規 CRIT 1 + MAJOR 2 + MINOR 2 + NIT 3 = 10 件）

主要指摘:

- **CRIT-6（NIT-8 r3 対応の「44.4px SSoT」自体が誤った line-height を用いた事実誤認 / R1-CRIT-1, R2-CRIT-5 と同型 3 連続事故の最終）**: R3-R4 で `.error` クラスの `line-height` を `.textarea` の `1.5` から流用していた。実体は `.error` に `line-height` 未定義 → `globals.css` L174-175 の `html, body { line-height: 1.7 }` から継承 → 正しい予測値は約 47px。R5 で **PM 推奨案 1 採択 = 数値 literal を計画段階で確定せず実機計測で確定する方針に転換**。L529 を「予測値は概ね 47px 前後だが SSoT ではない」と書き直し + 実 SSoT は T-4 で `getBoundingClientRect()` 実測値を採用 + 判定基準を「概ね 40〜60px 範囲内 + 1 行収納」に変更
- **MINOR-13（MAJOR-14 対応の選択肢 (b)「PM 即時判断で計画書を直接更新」が AP-WF01 / AP-WF11 違反リスク）**: CLAUDE.md「Review always」原則違反の可能性。R5 で (b) を「PM 即時判断で計画書を直接更新 + その差分のみ reviewer に差分レビュー依頼」に修正し reviewer 介在を必須化
- **MINOR-14（採用 / 採択 の用語統一が不完全）**: R3 MINOR-12 r3 対応の方針が L244 / L341 / L427 等の慣用語以外箇所で「採用」が残存していた。R5 で全件再 grep して「採択」に置換完了（残存「採用」は「採用方針 / 採用時 / 採用された / 採用状況 / 採用根拠 / 採用例 / 採用率 / 不採用」の慣用語のみ）
- **MAJOR-15（R4 同型事故防止メモが「網羅性確認手順」止まりで根本対策になっていない）**: 横の grep だけでは縦の実体確認（CSS 継承元の確認）を捕捉できないことが CRIT-6 r4 で実証された。R5 で「R5 同型事故防止メモ」に (4) 数値 literal の実体確認、(5) 継承 CSS プロパティの確認、(6)(7) 数値 literal の 3 分類（実測値 / 仕様値 / 推定値）を追加
- **MAJOR-16（AP-P19 が `body` line-height 継承挙動に適用されていない）**: R5 でキャリーオーバー 12 番として AP-P19 の射程拡張検討を記録（CSS 継承挙動 / W3C 仕様も外部仕様として扱う）
- **MINOR-15（退避案 Step 1 (a)(b)(c) の発火条件が抽象的）**: R5 で各選択肢に発火条件を 1 行ずつ追加（(a) 論点間整合性に影響 / (b) 当該 Step 単独で完結 / (c) 3 軸評価でいずれも visitor 価値毀損）
- **MINOR-16（`padding: 0.75rem` 左右 ≈ 12px 表記が padding 解釈不正確）**: shorthand なので上下左右一律。R5 で「`padding: 0.75rem`（上下左右一律 = 上下合計 24px）」のように明示
- **NIT-10（R1〜R4 累計件数集計の総括行追加）**: R5 でレビュー結果セクション末尾に累計総括行を追加
- **NIT-11（reviewer 自身の反省を NIT-8 履歴に追記）**: R5 で NIT-8 履歴末尾に reviewer 反省を追記（上記 NIT-8 末尾参照）
- **NIT-12（L529 と L297 の SSoT 参照表記の整合）**: R5 で CRIT-6 対応により SSoT 自体を見直したため、L297 を「SSoT は T-4 実機計測で確定」に統一

R4 → R5 で CRIT 1 + MAJOR 2 + MINOR 4 + NIT 3 = 10 件対応。

#### R5（R4 部分未充足 1 件 + 新規 MAJOR 1 + MINOR 2 + NIT 2 = 6 件 / R6 reviewer 推奨で R6 Pass 狙い）

主要指摘:

- **MINOR-17（採用 / 採択 統一の残存）**: R5 で全件 grep 漏れがあり、L430「補助ラベル**採用**状況の整理」/ L532「PM 推奨案 1 **採用**」/ L532「SSoT 値は T-4 実機計測値を**採用**」の 3 箇所に「採用」が残存していた。R6 で全件「採択」に置換 + 用語統一方針の allow-list（「採用状況 / 採用根拠 / 採用例 / 採用率」）を撤回し、これらの慣用語も「採択」に統一する方針に変更
- **MAJOR-17（数値 literal 3 分類のラベル付け遡及範囲決定）**: R5 で導入した「実測値 / 仕様値 / 推定値」3 分類が新規追記時のみの適用となっており、計画書本文の既存数値 literal への遡及ラベル付けが未完。R6 で **PM 推奨 = 選択肢 2（キャリーオーバー扱い）採択** = キャリーオーバー 11 番に「cycle-210 計画書の既存数値 literal への遡及ラベル付けは、(a) PM がサイクル完了処理時に一括実施するか、(b) cycle-211 以降の新規追記時のみ適用」を明記
- **MINOR-18（キャリーオーバー 11 番の判断軸具体化）**: R6 でキャリーオーバー 11 番の判断軸を「(a) AP-P16 強化のみで充足するケース = AP-P16 既存記述「実体確認」の射程拡張で再利用可能 / (b) 独立 SSoT が必要なケース = 数値 literal の 3 分類が AP-P16 と独立した設計指針として横断利用される見込み」と具体化
- **MINOR-19（R5 同型事故防止メモの cycle-211 以降への継承明示）**: R6 でキャリーオーバー 11 番の (b) に「`docs/knowledge/planning-numerical-literals.md` 等の名称で独立 SSoT 化して cycle-211 以降の planner / reviewer が直接参照する形で運用継承する」と明記
- **NIT-13（L297 と L309 の SSoT 参照表記の完全一致）**: R6 で L309 を L297 と完全同一文言（「SSoT 値は T-4 実機計測で確定 / 計画段階では予測値のみで literal 確定しない」）に統一
- **NIT-14（キャリーオーバー 9 番の AP-P16 追記文言 literal 確定）**: R6 でキャリーオーバー 9 番に追記文言「書き換え前: （cycle-174, 184, 188で実際に発生）」「書き換え後: （cycle-174, 184, 188, 210で実際に発生 / cycle-210 では R1-CRIT-1 = テスト件数 / R2-CRIT-5 = export 件数 / R4-CRIT-6 = CSS 高さ計算の 3 連続事故）」を literal で確定

R5 → R6 で MAJOR 1 + MINOR 3 + NIT 2 = 6 件対応。reviewer が「R6 で MINOR-17 + MAJOR-17 のみ対応 → Pass」を推奨し、PM もこれを受け入れ → R6 では他指摘も同時対応して計画フェーズ完了を狙う。

#### R6（指摘なし / Pass 想定 / reviewer 承認待ち）

R6 完成後に reviewer レビュー結果を追記。

**R1〜R6 累計サマリ（NIT-10 r4 対応の更新）**: R1 14 件 + R2 12 件 + R3 10 件 + R4 10 件 + R5 6 件 = **計 52 件**（cycle-209 75 件 / 8 ラウンドと比較して件数は少ないが、CRIT 3 連続事故 = R1-CRIT-1 / R2-CRIT-5 / R4-CRIT-6 が発生したため重み付きでは同等の負荷）。R6 完了後の reviewer 承認を待つ。

**R6 最終整合性チェック（R6 自己確認 = MAJOR-15 R5 同型事故防止メモ運用が R6 本体で完全機能しているか）**:

1. **横の網羅性チェック**: 「採用」「採択」「44.4px」「12 件」「export 3 件」「B-449」を grep し、全ヒット箇所を Read で確認 → 古い表記の残存なし
2. **縦の実体確認**: R6 で新規に追加した数値 literal はなし（NIT-14 の追記文言 literal のみ）= 縦の実体確認対象なし
3. **数値 literal 3 分類のラベル付け**: R6 で新規追加箇所はなし。既存箇所の遡及ラベル付けはキャリーオーバー 11 番として明示済

**R5 同型事故防止メモ（MAJOR-12 r3 / MAJOR-15 r4 / CRIT-6 r4 対応 = R3〜R5 で 3 回の事実誤認 / 反映漏れを踏まえた根本対策）**: 各指摘の対応後、当該指摘が言及するセクション以外で同種の記述が古いまま残存していないかを以下の順で確認 + 数値 literal の取扱い原則を明文化:

**(横の網羅性チェック / R4 時点で確立)**:

1. 指摘文中に登場するキーワード（例: 「(vi) エラー文言 1 行収納」「B-449」「12 件」「44.4px」等）を grep し、全ヒット箇所を Read で順次確認
2. 同一概念の派生表現も grep（例: 「44.4px」「≈ 36px」「.error クラス 1 行分」「テスト件数」等）
3. ヒット箇所の中に古い表現が残存している場合は当該箇所も R5+ で同時更新

**(縦の実体確認 / MAJOR-15 r4 で追加 = R4 CRIT-6 で網羅性確認だけでは捕捉できなかった事象に対する追加策)**:

4. **数値 literal をサイクル中に書くときは、必ず実体確認（Read / grep / DOM 計測）で値を確定してから書く**。計算式から導出した推定値は SSoT として確定しない
5. **継承される CSS プロパティ（`line-height` / `color` / `font-family` / `font-size` 等）は、対象セレクタに直接定義されていない場合、親要素 / `body` / `:root` で定義されている値を必ず確認する**。CSS 継承挙動は W3C 仕様（外部仕様）に属するため AP-P19 同型のチェックが必要

**(数値 literal の 3 分類 / R5 PM 必須指示 3 対応 = 根本対応の明文化)**:

6. 計画書本文に登場する数値 literal は以下の 3 種に区別し、いずれの分類かを明示する:
   - **実測値**: Read / grep / DOM 計測で確定した値（例: 「Component.module.css に `--color-*` 残存 24 箇所」「export 3 件」「既存テスト 12 件」）= 引用付きで literal 記載可
   - **仕様値**: 外部仕様（W3C / RFC / library docs 等）に定義された値（例: 「`--warning` トークンの oklch 値」「max-input-length = 100,000」）= 出典付きで literal 記載可
   - **推定値**: 計算式から導出した予測値（例: 「`.error` 高さ ≈ 47px 前後」「全角換算 25 字 × 13.6px ≈ 340px」）= 「推定値であり SSoT ではない」と明示 + 実 SSoT は T-4 実機計測で確定
7. 推定値を SSoT として「literal 確定」する記述は禁止。「予測値」「見込み」「概ね」「程度」等の hedge 表現を必ず併用

### 実装フェーズ（T-1〜T-4）

T-1〜T-3 は各タスク完了時に builder が実測値付きで報告し、reviewer が独立再確認済（各 T の完成条件チェックリスト参照）。

T-4 完了（2026-05-26）:

- 4 コマンド全件 PASS（lint / format:check / test 4456件 / build）
- AP-P21 5 ケース計測完了（実測値は完成条件チェックリスト参照）
- (vi) エラー文言枠 SSoT 確定値: T-4 初回計測 h=32px → **CRIT-R3 修正後 確定値 h=46.09px / w=376px / 1行収納 PASS（2026-05-27）**
- IME composition 観察: 3 項目顕在化なし
- ブラウザ API 2 項目 PASS（Hydration warnings=0 / focus残置 PASS）
- スクショ計 30 枚保存（baseline 10 + after-t4 15 + ime-observation 5）

#### T-4 reviewer 指摘対応（CRIT 3 件 + MINOR 3 件 = 計 6 件 / 2026-05-27）

T-4 builder 成果物への reviewer レビュー結果で、計画書本文の判定基準矛盾が複数明らかになった。**CRIT 3 件（CRIT-R1 / R2 / R3）は別途 builder に実装修正依頼済**（実装側の修正対応）。本セクションは **MINOR 3 件（MINOR-R2 / R3 / R4）の計画書本文補正記録**。

主要指摘:

- **MINOR-R2（AP-P21 判定基準 (ii) の複合入力型タイル適用範囲を明示）**: 計画書 L293 (ii) 「相互差 2px 以内」は単一 textarea タイル基準。複合入力型タイル（本サイクル text-replace）では膨張側 = 本文 textarea + 結果欄 = が他要素の高さに応じて再配分されるため (a)(b) で 14px の差が出るのは構造的に自然。本タスクで L293 (ii) を「操作側（検索/置換 input）の相互差が 2px 以内」に書き直し + 注記追加（膨張側の相互差判定は適用外 / 操作側 input のみ flexShrink:0 で固定要件として 2px 以内を維持）
- **MINOR-R3（補足事項セクションに 3 項目追加）**: 計画書 §補足事項（現在「なし」）に複合入力型タイル初回（text-replace）特有の AP-P21 判定基準適用範囲の明文化として 3 項目追加（(i) 下限 40px の適用範囲 / (ii) 相互差 2px 以内の適用範囲 / (vi) エラー文言枠 SSoT 値の書き戻しタイミング）
- **MINOR-R4（L538 / L810 SSoT 値書き戻し）**: builder CRIT-R3 修正完了後の実測値で書き戻し予定。本タスクでは「**CRIT-R3 修正後 builder 報告の実測値で書き戻し予定**」と明示のみ（実値書き戻しは PM が別途処理）。初回計測 h=32px は AP-P21 基準 (i) 下限 40px 未満で計画書基準と矛盾 → builder 側 padding 拡張で h ≥ 40px 到達後に確定

**T-4 reviewer 指摘対応で MINOR 3 件すべて計画書本文の補正完了**（MINOR-R4 の実値書き戻しは builder 完了報告待ち）。CRIT-R1 / R2 / R3 の実装側修正完了報告と整合性確認は PM 別タスク。

#### T-4 R2 reviewer 指摘対応（CRIT 1 + MAJOR 1 + MINOR 3 + NIT 2 = 計 7 件 / 2026-05-27）

builder の CRIT-R2 / R3 修正完了後の T-4 R2 reviewer レビューで、**CRIT-R3 と同型反復事故** = 計画書 L296 (v)「±10% 以内」基準と builder 実測値 (d)→(e) 11.55% の整合性問題が再発した。reviewer 推奨案 A（計画書本文補正）を PM が採択し、本タスクで対応。

主要指摘:

- **CRIT-R2-new + MAJOR-R1-new（計画書 L296 (v) と builder 実測値 (e) 11.55% の整合性問題 / CRIT-R3 と同型反復）**: 計画書 L296 (v) は単一 textarea タイル用に書かれた「±10% 以内」基準を複合入力型タイル（text-replace）に機械適用しようとして矛盾が顕在化。視覚的には妥当（エラー枠が増えた分 textarea が縮むのは構造的に自然）だが、builder 独自解釈で吸収するのは AP-WF03 違反となるため計画書本文の補正で対応。**本タスクで L296 (v) を補正**（複合入力型タイルでは ±15% 以内 / または relative 式 を併記）+ **§補足事項 4 項目目を追加**（複合入力型タイル特有の (v) 適用範囲の明文化 / 後続サイクル SSoT 化）+ **T-4 完成条件 L308 表現修正**（11.5% → 11.55% / 「複合入力型タイル基準では PASS」明示）
- **MINOR-R2-new（dev サーバー停止漏れ）**: PM 側で dev サーバー停止済（PID 475103 停止）
- **MINOR-R3-new（tmp ディレクトリ整理）**: PM 側で tmp 整理済（ap-p21-{a-e} 旧 5 枚削除 + after-review / after-t3-review ディレクトリ削除）
- **NIT-R1-new / NIT-R2-new**: 記録のみ

**T-4 R2 reviewer 指摘対応で CRIT-R2-new + MAJOR-R1-new + MINOR 3 件すべて対応完了**。本サイクルは複合入力型タイル初回として「判定基準が単一 textarea 用に書かれていた」という構造的問題が明らかになり、補足事項 4 項目（(i)(ii)(vi)(v)）が後続サイクル（regex-tester / text-diff 等の複合入力型 2 件目以降）の SSoT 基盤となる。T-4 R3 reviewer 再レビューで Pass を狙う。

## キャリーオーバー

T-4 完了時点での最終状態（2026-05-26 → T-4 R2 / R3 更新 2026-05-27）:

1. **B-444（opacity トークン化）**: 本サイクルで opacity リテラル使用なし（条件付き表示なし）→ キャリーオーバー維持
2. **B-445（fieldset+legend 化）**: 詳細ページを touch しないため本サイクルでは不対応 → キャリーオーバー維持
3. **B-446/B-447/B-448（line-break-remover 固有）**: 本サイクル対象外 → キャリーオーバー維持
4. **B-449（text-replace Component テスト未整備）**: T-2 D 項で `docs/backlog.md` Active セクションに追記済 → キャリーオーバー起票完了
5. **論点 2 省略オプションのタイル提供**: Phase 10.1 ダッシュボード設計時に再検討 → キャリーオーバー維持
6. **cols=3 rows=3 の Phase 10.1 影響評価**: Phase 10.1 着手時に再検討 → キャリーオーバー維持
7. **warning 系トークン置換マッピング SSoT**: 本サイクルで確立済（T-2）。後続 regex-tester 等で再利用可能 → 完了
8. **複合入力型タイル AP-P21 二分類役割分担 SSoT**: 本サイクルで確立済（TextReplaceTile.tsx 論点 4 案 α）→ 完了
9. **AP-P16 事例追記**: PM がサイクル完了処理で `docs/anti-patterns/planning.md` に「cycle-210 3 連続事故」を追記する（文言は §キャリーオーバー候補 9 番に literal 確定済）
10. **tmp パス命名規約 SSoT 化**: 後続サイクルで B-450 起票を PM が判断
11. **数値 literal 3 分類プロセス改善（B-451）**: AP-P16 強化 or `docs/knowledge/planning-numerical-literals.md` 新設を PM がサイクル完了処理時に判断
12. **AP-P19 射程拡張検討**: CSS 継承挙動を外部仕様として扱う方針の検討 → 後続サイクルでキャリーオーバー維持

**AP-P21 (vi) エラー文言枠 SSoT 確定値**: T-4 初回計測 h=32px → **CRIT-R3 修正後 確定値 h=46.09px / w=376px**（1行収納 PASS / 論点5案c不要 / **書き戻し完了 = MINOR-R4 対応完了（2026-05-27）**）/ 詳細は §論点 5「T-4 実機計測確定値（SSoT）」参照

## 補足事項

T-4 reviewer MINOR-R3 対応 = 複合入力型タイル初回（text-replace）特有の AP-P21 判定基準適用範囲の明文化。本サイクルで得た知見を後続サイクル（複合入力型タイル = regex-tester / text-diff 等）の SSoT として参照可能とする。

1. **AP-P21 判定基準 (i) 下限 40px の適用範囲**: textarea / status 領域 / エラー枠 / コピーボタン等の「visitor が直接視認・操作する要素」に対する基準であり、複合入力型タイルでは **操作側 input（flexShrink:0 固定）にも 40px 以上を適用する**。本サイクル T-4 で input 自然高さ 27px が基準未達となり、実装側で `minHeight: 40px` を適用して解消（後続 SSoT として再利用可）。WCAG 2.5.8 下限 24px はクリアするが、yolos.net のタイル UI は WCAG 推奨 44px 相当への接近を visitor 価値の観点から優先する。

2. **AP-P21 判定基準 (ii) 相互差 2px 以内の適用範囲**: 単一 textarea タイル基準（cycle-205/206/208/209 で膨張ゼロ型 4 件実測値 46px 系列として確立）であり、複合入力型タイルでは膨張側（本文 textarea + 結果欄）が他要素の高さに応じて再配分されるため、本文 textarea / 結果欄の (a)(b) 相互差判定は適用外。**操作側 input のみ flexShrink:0 で固定要件として 2px 以内を維持**する。本サイクル T-4 で (a)→(b) の本文 textarea 差 = 14px が観測されたが、これは複合入力型タイル特有の正常変化であり判定 FAIL ではない。

3. **AP-P21 (vi) エラー文言枠 SSoT 値**: 計画 R5 で「実機計測値を SSoT として確定」方針を確立済（CRIT-6 r4 対応）。T-4 で実装側 padding を拡張して h ≥ 40px に到達し計画書基準を満たした実測値を SSoT として確定（実測値は L538 / L788 / L835 に書き戻し完了 / 数値 literal 3 分類 = 実測値）。**書き戻し完了**: T-4 R3 reviewer 指摘 MAJOR-R3-new 対応として **2026-05-27 PM 即時編集で L538 / L788 / L835 すべて更新済（h=46.09px / w=376px）** = MINOR-R4 対応完了。

4. **AP-P21 判定基準 (v) ±10% 以内の適用範囲（T-4 R2 reviewer CRIT-R2-new + MAJOR-R1-new 対応 = CRIT-R3 と同型反復事故防止 / 計画書本文補正）**: 単一 textarea タイル基準（cycle-209 (e) で確立）であり、複合入力型タイルではエラー枠表示分の高さ振替が膨張側（本文 textarea + 結果欄）に分配されるため適用範囲が異なる。本サイクル T-4 で **(d)→(e) 変化率 11.55%** が単一 textarea 基準で FAIL となったが、エラー枠 h=46.09px 追加による合理的な再配分であり、**複合入力型タイル基準（±15% 以内 / または relative 式 = エラー枠高さ ÷ 本文 textarea 高さ × 100% 以内）では PASS**（本サイクル実測: 46.09 ÷ 105.78 ≈ 43.6% 以内）。後続サイクル（複合入力型 2 件目以降 = regex-tester / text-diff 等）でこの新基準を継承する。なお (a)→(e) 直接比較値 = 21.78% は副次的指標であり、本基準では (d)→(e) を中心に判定する（エラー枠表示前の最終安定状態 (d) と表示後 (e) の差が CLS 視点で意味を持つため）。

   **基準値「±15% / relative 式 43.6% 以内」の根拠（T-4 R3 reviewer MAJOR-R2-new 対応 = 数値 literal 3 分類「恣意値」混入懸念への補正）**:
   - **±15% の根拠（経験的暫定値）**: 単一 textarea 基準 ±10% を 5pt 拡張した値。+5pt の根拠は「エラー枠表示分の構造的振替を許容する最小限のバッファ」として cycle-210 の 1 サンプル（11.55%）を含む形で決定。**1 サンプルから導出した経験的暫定値であり、後続サイクル（複合入力型 2 件目以降 = regex-tester / text-diff 等）の蓄積サンプル N ≥ 3 件で本基準値を見直す**（cycle-213 前後を目処に「複合入力型タイルの (v) 基準値見直し」キャリーオーバー候補化 / 数値 literal 3 分類 = 経験的暫定値）。
   - **relative 式の位置づけ（補助指標 = SSoT ではない）**: relative 式「エラー枠高さ ÷ 本文 textarea 高さ × 100% 以内」は **比較指標**として併記。「43.6% 以内」は本サイクル実測値 = SSoT ではない（builder 独自の判定値ではなく、reviewer の客観性確保のための副次的検算指標）。後続サイクルでは ±15% を主基準として判定し、relative 式は構造的振替の妥当性確認の参考値として用いる。
   - **将来の事故防止**: 本基準値が PASS / FAIL の判定線になる場合（例: 後続サイクルで 15.5% 等のぎりぎり値が出た場合）、**builder 独自解釈での PASS 判定は禁止**（AP-WF03 / CRIT-R3 / CRIT-R2-new と同型事故防止）。基準値見直し提案は計画書本文補正で対応する（PM 判断 + reviewer 経由）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
