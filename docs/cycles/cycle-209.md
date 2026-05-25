---
id: 209
description: B-314 Phase 8.1 第 10 弾として line-break-remover（改行削除）の (new)/tools/ 配下移行とタイル化を行う通常運用継続フェーズ 3 回目。固有の構造的新規性は「smart-pdf 選択時のみ joinStyle サブオプションが現れる 2 階層オプション」を Phase 8.1 で初導入し、opacity フェードによる条件付き表示で発見性を確保する点で、Phase 10.1 ダッシュボード設計時の SSoT を 1 件確立する。
started_at: 2026-05-25T13:09:10+0900
completed_at: null
---

# サイクル-209

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 10 弾**として `line-break-remover`（改行削除）を扱う。cycle-200〜208 で 9 回適用済みの標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）を継続する **通常運用継続フェーズ 3 回目**。cycle-207（qr-code）の重い回 → cycle-208（kana-converter）の通常運用継続成功のリズムを引き継ぐ。

来訪者にとっての価値は「PDF・メール・チャットからコピペしたテキストの不要な改行をワンステップで除去する」一点。論文 PDF からのコピペ、メール返信時の引用整形、Word/Excel からの貼り付け整形など『日常の傍にある道具』として頻度の高い実用ツール。新デザイン移行とタイル化の両側に直接価値を持つ。

構造的位置づけ:

- **textarea×2 双方向 / 3 モード混在型**: cycle-206（fullwidth-converter）/ cycle-208（kana-converter）と同じく入力 1 + 出力 1 の対称構造。3 モード（`remove` = 純粋削除 / `replace-space` = 改行→スペース置換 / `smart-pdf` = PDF 整形ヒューリスティック）を持ち、結果はいずれも入力と同サイズ以下に収まる **膨張ゼロ型**。AP-P21 textarea 高さ計測 4 ケースは cycle-206 / cycle-208 と同じ膨張ゼロ型枠組で実施可能。
- **2 階層オプション構造（本サイクル固有の新規性）**: `smart-pdf` モードが選択された場合のみ表示される `joinStyle`（`remove` / `space`）サブオプションを持つ。これまでの cycle-200〜208 は単一階層オプションのみで、2 階層オプションをタイル UI に収めるのは本サイクルが初。**条件付き表示は opacity フェードイン/アウト + 微小 translateY による「アニメーション付き条件付き表示」で実装**（高さ自体は即時切替）。なお research §5.3 は発見性補完の手段として **高さトランジション** を定性的に推奨しているが、これは CSS grid-template-rows アニメーションの Chrome jumpy 挙動で破綻するため採用せず、§5.3 が重視する「発見性補完の通知」目的は共通としつつ、実装技法を opacity + translateY に差し替えることで全モダンブラウザの一貫体験を保証する。既存タイル 9 件に **条件付きオプション UI 表示**（モード選択に応じてオプション選択肢の DOM 構造自体が出入りするパターン = `aria-pressed` / `role="radio"` / `<input type="radio">` / `<input type="checkbox">` 等の選択 UI 要素を含むブロックの条件付き JSX レンダリング）が一切存在しないことを T-1 で実証する（結果欄の placeholder 切替・`{result === null ? "" : result}` のような汎用データ表示分岐・`{svgTag ? (...)}` のような出力プレビュー切替は対象外）。
- **rows=2 タイル**: cycle-207 の rows=3 ではなく、cycle-208 と同じく rows=2 の標準形を踏襲予定（論点 6 で確定）。
- **cycle-208 IME composition 観察結果の参照可能性**: cycle-208 補足事項で「kana-converter 実機観察結果を踏まえた『軽量同期テキスト処理 + textarea×2 構造には debounce 不要』」を引用可能と明記されている。本サイクル debounce 要否判断（論点 5）で根拠として活用する。

## 実施する作業

- [ ] T-1: 現状把握と移行前 baseline 取得（line-break-remover のファイル構成 / 旧トークン箇所 / `logic.ts` export / 既存テスト 57 件 / `TILE_DECLARATIONS` 件数を grep 実測で確認、Playwright で baseline 撮影、既存テストが緑であることの確認）
- [ ] T-2: 詳細ページの `(new)/tools/line-break-remover/` 配下への移行（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークン 24 箇所 7 種を新トークンに置換 / T1 yaml の search_intents 追加 / backlog B-443 件数更新）
- [ ] T-3: タイル定義（`src/tools/line-break-remover/LineBreakRemoverTile.tsx` 一式を新規実装、`kind=widget` / rows=2 標準形 / 3 モードセグメント + smart-pdf サブオプション 2 階層**条件付き表示**（opacity フェード + 微小 translateY 200ms / 高さは即時切替 / `prefers-reduced-motion: reduce` で即時表示 Fallback）/ AP-P21 役割分担 / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト 8 件以上追加）
- [ ] T-4: 検証と統合確認（Playwright 視覚回帰 + AP-P21 textarea 高さ 4 ケース計測 + 2 階層オプション挙動の 5 状態スクショ × 2 モード + IME composition 観察 + AP-WF16 reviewer 独立再実行 / baseline + tiles-preview + after の各種スクリーンショット / `lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

詳細なタスク分解と作業計画は `/cycle-planning` フェーズで具体化する。

## 作業計画

### 目的

**誰のために**: T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）/ T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）。line-break-remover を使う具体的来訪者像は以下が代表ケース:

- 論文・取扱説明書などの **PDF をコピペした際に紛れ込んだ改行**を一括除去したい人（横断調査でも最大の visitor needs / `docs/research/2026-05-25-cycle-209-line-break-tool-ux-research.md` §2）
- **DeepL 翻訳・ChatGPT 入力の前処理**で英文の段落内改行を半角スペースに揃えたい人
- メール返信時の **引用テキストの改行整形**で「行末改行を消して横長 1 行にし直したい」事務系来訪者
- **Word / Excel から貼り付けた**改行混じりテキストを 1 行に揃えたい人

これらに共通するのは「**改行という見えない文字を、目的に合わせて意図通りに処理したい**」非常に身近な日常需要で、cycle-208 の kana-converter と同じ「日常の傍にある道具」コンセプトの系列に位置する実用ツール。特に **`smart-pdf` モード**（段落構造を保持しつつ段落内の改行のみ処理）は横断調査した 7 競合中 yolos.net 単独提供の差別化要素で（`docs/research/2026-05-25-cycle-209-line-break-tool-ux-research.md` §1）、移行を機にタイル UI 側でもこの価値を維持する。

**どんな価値を提供するか**:

1. **新デザイン詳細ページ移行**: `(legacy)` の旧トークン・旧 1200px 標準パターン未適用な状態から `(new)` 配下に移行することで、サイト全体で進行中のデザイン統一の一部を完成させ、T2 likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」に寄与する。
2. **タイル化**: 来訪者が将来のダッシュボード上で「PDF 改行削除タイル」を選んで配置し、ブックマーク代わりに繰り返し使えるようにする土台を作る（T2 likes「ブックマークした URL を開けばすぐ目的のツールが表示されること」のダッシュボード時代への置き換え）。
3. **T1 検索からの導線整備**: 現状 T1 yaml の `search_intents` 13 語に**改行関連語が一語もない**（実測コマンド: `grep -nE '^\s+- "' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → L28-40 / 改行関連語ゼロ）。これは Phase 8.1 各サイクルで T1 yaml を継続棚卸ししてきた SSoT 整合運用に違反する状態。本サイクル T-2 で改行関連必須語を追加する（追加クエリと並び順は後述「目的セクション内 追加クエリ確定」で AP-WF03 に従い計画段階で確定）。
4. **2 階層オプション収納パターン SSoT 1 件確立**: smart-pdf モード選択時のみ表示される joinStyle サブオプションを、タイル UI（高さ制約あり）でどう収めるかは Phase 8.1 で初めて扱う構造論点。Phase 10.1 ダッシュボード設計時に再利用できる「条件付き表示オプション」運用パターンを **1 件確立** + **本サイクル T-4 で得る挙動データ（5 状態スクショ / textarea 高さ変化計測）を Phase 10.1 設計時の SSoT として参照可能とする条件**（同型 = textarea×2 軽量同期 + 単一サブオプション + AP-P17 ゼロベース 3 案比較を独立に実施）を補足事項に明記する。

#### 追加クエリ確定（AP-WF03 = builder 裁量排除、計画段階で literal を確定）

5 候補語と既存 13 語との重複可能性を比較表で確定する。

**既存 13 語の重複検索コマンド**: `grep -nE '"[^"]*(改行|PDF|削除|一括)[^"]*"' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → **0 件**（既存語に改行 / PDF / 削除 / 一括の語句が一つも含まれていないことを確認済）。

5 候補語の比較:

| 候補語                   | 検索意図カバー範囲                                                            | 既存 13 語との重複                     | line-break-remover meta.keywords との整合     | 採否       |
| ------------------------ | ----------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------- | ---------- |
| "改行削除"               | 「改行を削除したい」直球の最大公約数語。検索ボリューム最大。                  | 重複なし（grep 0 件 / 上記コマンド）。 | meta.keywords「改行削除」と完全一致。         | **採択 1** |
| "改行 削除"              | スペース区切り形。Google サジェストで頻出。「改行削除」とは別マッチング扱い。 | 重複なし。                             | meta.keywords「改行 削除 ツール」の語頭一致。 | **採択 2** |
| "PDF 改行"               | PDF コピペ用途（最大の差別化価値 smart-pdf）への導線語。                      | 重複なし（既存に "PDF" 0 件）。        | meta.keywords「PDF 改行 削除」の語頭一致。    | **採択 3** |
| "PDFコピペ 改行"         | より具体的な意図表現。SEO ロングテール狙い。                                  | 重複なし。                             | meta.keywords には未記載だが意図直結。        | **採択 4** |
| "テキスト 改行 一括削除" | 「Word/Excel/メール本文の一括処理」意図。                                     | 重複なし。                             | meta.keywords には未記載だが補完的に有効。    | 不採用     |

**2 案以上の比較**:

| 案                                                                        | (i) 検索意図カバー                                                                              | (ii) 既存 13 語との重複 | (iii) 件数規模（cycle-207/208 との均衡）                                                                                      | 採否     |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| 案 1: 4 語追加 = "改行削除" / "改行 削除" / "PDF 改行" / "PDFコピペ 改行" | 改行削除 2 表記 + PDF 関連 2 表記で「即時用途 + 差別化用途」を網羅。最大公約数 + 差別化を両立。 | すべて重複なし。        | cycle-207 「QRコード」3 語 / cycle-208 「ひらがな〜半角全角」3 語と比べ +1 だが、改行関連語ゼロからの追加初回のため許容範囲。 | **採択** |
| 案 2: 3 語のみ = "改行削除" / "改行 削除" / "PDF 改行"                    | 改行削除直球 + PDF 1 語。 cycle-207 / 208 の 3 語追加と件数均衡が取れる。                       | すべて重複なし。        | cycle-207/208 と均衡（3 語）。                                                                                                | 不採用   |
| 案 3: 5 語追加（候補語すべて）                                            | 「テキスト 改行 一括削除」まで含めることで Word/Excel/メール本文用途も網羅。                    | すべて重複なし。        | +5 で前 2 サイクル比 +2 と件数膨張。                                                                                          | 不採用   |

**採択 = 案 1（4 語追加）**。理由: (a) 改行関連語ゼロからの追加初回のため最大公約数 + 差別化の両軸カバーが優先。(b) 「PDFコピペ 改行」はロングテール SEO 価値が高く、smart-pdf 差別化への直接導線となるため落とせない。(c) 案 3 の「テキスト 改行 一括削除」は重複ゼロだが、「改行削除」と「PDF 改行」のいずれかで既に検索意図カバーされる二次的ワードで、必須性が低い。

**並び順**: 既存 13 項目の末尾に「改行削除 → 改行 削除 → PDF 改行 → PDFコピペ 改行」の順で追加（並びに意味は持たせない / cycle-207・208 と同方針）。

#### 「淡々と進むはず」油断打ち消し策

cycle-208 と同様、AP-WF16 / AP-WF05 / AP-P21 の 3 つを油断なく履行する。本サイクル固有の追加項目:

- 2 階層オプション挙動の **5 状態スクショ × light/dark = 計 10 枚** 撮影（後述 T-4）
- AP-P21 計測に **第 5 ケース「smart-pdf 選択時の入力 textarea 高さ変化」** を追加（opacity アニメーション完了後 300ms 待機 → 前後 ±10% 以内を判定）
- T-3 builder Playwright 実物確認による退避案フォールバック判定（前述 §退避案分岐の優先順位 §Step 1〜3 / r5 NIT-1 + r6 NIT-3 表記統一 = 「§退避案分岐の優先順位 §Step N」形式に統一）

#### viewport 採用方針

AP-WF05 網羅性ルールに対し、本サイクルは cycle-208 と完全同型の **w375 / w1200 / w1900**（タイルプレビューは w1200 / w375）を採用する。cycle-200〜208 の Phase 8.1 標準パターンと整合（cycle-209 初版 r0 で w360 にしていた理由がないため cycle-208 標準形に揃える / w360 タイル viewport は B-434 で Phase 10.1 必須検討、Phase 8.1 内は暫定許容）。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

**目的**: 移行作業の起点を確定し、後工程で「変更前後の差分」を客観的に比較できる素材を揃える。

- `src/tools/line-break-remover/` 配下のファイル構成、`logic.ts` の export、`meta.ts` の `keywords` / `faq` / `relatedSlugs`、既存テストの構成を grep / Read で実体確認する。数値の出典は本計画書本文に grep コマンドを併記し、`tmp/` 配下削除後も再現可能とする（AP-P16 / AP-WF12 対策）:
  - `src/tools/line-break-remover/`: `Component.tsx` / `Component.module.css` / `logic.ts` / `meta.ts` / `__tests__/{logic.test.ts,Component.test.tsx,meta.test.ts}`
  - `src/app/(legacy)/tools/line-break-remover/`: `page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイル
  - `Component.module.css` 内の `--color-*` 残存数 = **24 箇所 / 7 種**。**実測コマンド**: `grep -c -- "--color-" src/tools/line-break-remover/Component.module.css`（→ 24）/ `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/line-break-remover/Component.module.css | sort -u`（→ `--color-bg` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-text` / `--color-text-muted` の 7 種）
  - `logic.ts` の export = **6 件**（型 3: `RemoveMode` / `SmartPdfJoinStyle` / `RemoveLineBreakOptions` + interface 1: `RemoveLineBreakResult` + 関数 2: `normalizeLineEndings` / `removeLineBreaks`）。**実測コマンド**: `grep -c '^export ' src/tools/line-break-remover/logic.ts`（→ 6）
  - 既存テスト件数 = **57 件総計**（内訳: `logic.test.ts` 27 件 / `Component.test.tsx` 21 件 / `meta.test.ts` 9 件）。**実測コマンド**: `grep -cE '^\s*test\(|^\s*it\(' src/tools/line-break-remover/__tests__/logic.test.ts`（→ 27）/ `... Component.test.tsx`（→ 21）/ `... meta.test.ts`（→ 9）
  - `meta.ts` の `trustLevel`: `"verified"`（B-432 一括削除を待つ。本サイクルでは維持）
  - `TILE_DECLARATIONS` 現状エントリ件数 = **9**。**実測コマンド**: `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts`（→ 9）。codegen 出力 `src/tools/generated/tiles-registry.ts` の `tilesCount` 値も Read で直接確認できる
  - **3 モード literal の確認**: `"remove"` / `"replace-space"` / `"smart-pdf"` の 3 値が `logic.ts` および `Component.tsx` で定義されている。**実測コマンド**: `grep -nE '"(remove|replace-space|smart-pdf)"' src/tools/line-break-remover/{logic.ts,Component.tsx}`
  - **2 階層オプション literal の確認**: smart-pdf 内サブオプション `joinStyle` の 2 値（`"remove"` / `"space"`）の確認。**実測コマンド**: `grep -nE 'SmartPdfJoinStyle|smartPdfJoinStyle' src/tools/line-break-remover/{logic.ts,Component.tsx}`
  - **詳細ページの ARIA 実装確認**: 詳細ページが `role="radiogroup"` で 3 モード選択を実装している事実。**実測コマンド**: `grep -n 'role="radiogroup"' src/tools/line-break-remover/Component.tsx`（→ L50 / MAJOR-3 対応 = B-443 対象件数更新の根拠出典）
  - **(legacy) OGP の accentColor**: `src/app/(legacy)/tools/line-break-remover/opengraph-image.tsx` は (new) 配下へ `git mv` する際に内容変更しない（cycle-207 / 208 と同型 / opengraph-image は静的 OGP 生成のため `logic.ts` 依存なし、`git mv` のみで安全）
- Playwright で移行前のスクリーンショットを取得する:
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 着手前撮影 + dark mode 必須）
  - **結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**: 任意のテキスト（例: PDF コピペ想定の改行混在 200 文字程度）を入力 → 既定モード（`remove`）で結果が出ている状態を撮影。cycle-208 r5 MINOR-4 で確立した「結果表示済み状態スクショは baseline 撮影段階で必須」運用継続
  - **合計 = baseline 計 8 枚**（cycle-208 と同型）。保存先: `tmp/cycle-209/baseline/`
  - tiles-preview は本サイクル T-3 で新規作成されるため、T-1 では撮影対象外（NIT-2 対応）
- 既存テストの実行確認: `npm run test -- line-break-remover` で 57 件全件緑であることを確認

**完成条件**:

- [ ] 移行前スクリーンショット **計 8 枚**（ベース 6 + 結果表示済み 2）が `tmp/cycle-209/baseline/` 配下に保存されている
- [ ] 既存テスト **57 件**が緑（内訳: logic 27 / Component 21 / meta 9）
- [ ] grep 数値が本計画書本文と一致: `--color-*` 残存 24 / 7 種 / `logic.ts` export 6 / test 57（内訳 27/21/9）/ `TILE_DECLARATIONS` 件数 9 / 詳細ページ `role="radiogroup"` 1 行（L50）
- [ ] **既存 9 タイルに「条件付きオプション UI 表示」パターン（モード選択に応じて `aria-pressed` / `role="radio"` / `<input type="radio">` / `<input type="checkbox">` 等の選択 UI 要素を含む DOM ブロックが出入りするパターン）が一切存在しないことの実証**（r5 MINOR-1 対応 = line-break-remover 固有命名規則に依存しない一般化形式 / r6 NIT-2 対応 = grep を補助 / Read を主に位置付け直し + 複数 grep パターン併用 / r7 MINOR-1 対応 = 結果欄 placeholder 切替・`{result === null ? "" : result}` 等の汎用データ表示分岐・`{svgTag ? (...)}` 等の出力プレビュー切替は対象外で、本サイクルが論点としている「2 階層オプション UI」のみに対象を限定）: (1) **一般 grep（条件付き JSX レンダリングのヒット行を網羅抽出する補助的指標 / 取りこぼしを前提に運用）**: 以下 3 パターン併用で条件付き JSX レンダリング（`{ flag && <X /> }` / `{ mode === "..." ? <X /> : null }` / `{ obj.prop && <X /> }` 等）相当のヒット行を抽出する。
  - パターン (1-a) **単独識別子**: `grep -rnE '\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*(===|!==|&&|\?)' src/tools/*/[A-Z]*Tile.tsx`（`{ flag && ... }` 形式）
  - パターン (1-b) **ドットアクセス / プロパティ参照**: `grep -rnE '\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*(===|!==|&&|\?)' src/tools/*/[A-Z]*Tile.tsx`（`{ props.flag && ... }` / `{ state.mode === "x" && ... }` 形式）
  - パターン (1-c) **関数呼び出し / 配列アクセス含む式**: `grep -rnE '\{\s*[a-zA-Z_$][a-zA-Z0-9_$.()\[\]]*\s*(===|!==|&&|\?|>|<)' src/tools/*/[A-Z]*Tile.tsx`（`{ items.length > 0 && ... }` / `{ getMode() === "x" && ... }` 形式）
  - **ヒット行の分類手順（builder が手動で分類）**: パターン (1-a)〜(1-c) でヒットした各行について、当該行を含む条件付き JSX ブロックを Read し、「ブロック内に `aria-pressed` / `role="radio"` / `<input type="radio">` / `<input type="checkbox">` のいずれかが含まれる = **オプション UI の条件付き表示に該当**」/「いずれも含まれない = 対象外（結果欄 placeholder 切替・データ表示分岐・出力プレビュー切替）」に二分し、**該当ヒット = 0 件** であることを確認する。例示として、qr-code `QrCodeTile.tsx` L178 `{svgTag ? (...)}` / base64 など 7 件の `{result === null ? "" : result}` は grep にヒットするが、ブロック内に選択 UI 要素を含まないため「対象外」分類で 0 件カウントに影響しない。
  - パターン (1-d) **選択 UI 要素併用パターン（補助確認）**: `grep -rnE '(aria-pressed|role="radio"|<input type="(radio|checkbox)")' src/tools/*/[A-Z]*Tile.tsx | head -100` で既存 9 タイル内の選択 UI 要素出現箇所を網羅抽出し、各出現箇所の前後 ±15 行を Read して「親要素が `{ ... && ... }` / `{ ... ? ... : null }` の条件付き JSX ブロックでラップされていない」ことを確認（条件付き表示なし = 常時 DOM 存在の SSoT）。
  - **注意**: 上記 grep 群はあくまで補助的指標であり、正規表現の網羅性に限界があるため、決定的判定は (2) の手動 Read で行う。grep の各分類結果に関わらず (2) の手動 Read を必ず実施する。
  - (2) **手動 Read 確認（決定的判定 / Read 主・grep 補助）**: 全 9 タイル（base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter / qr-code / char-count / byte-counter）の `src/tools/*/[A-Z]*Tile.tsx` を **builder と reviewer がそれぞれ独立に Read** し、選択 UI 要素（`aria-pressed` / `role="radio"` / `<input type="radio">` / `<input type="checkbox">`）を含む DOM ブロックが `{ ... && ... }` / `{ ... ? ... : null }` 等の条件付き JSX レンダリングでラップされていないことを目視確認（grep でカバーできないパターンを含めて確認）。reviewer 独立再実行は §T-1 検証手順で扱う。本サイクルが「条件付きオプション UI 表示の Phase 8.1 初導入」であることを SSoT として確立
- [ ] **meta.ts `relatedSlugs` 5 件すべてが `src/tools/` 配下に実在することの grep 実証**（MAJOR-4 対応）: `for slug in text-replace fullwidth-converter char-count kana-converter text-diff; do ls src/tools/$slug/meta.ts; done` → 5 件すべて出力（壊れたリンク混入の予防）。実在しないスラッグがある場合は T-2 で `meta.ts` の `relatedSlugs` から該当エントリを除去する

**T-1 検証手順（AP-WF16）**（NIT-2 対応 = grep 一致確認は T-1 検証手順に統合）:

- T-1 builder: `npm run test -- line-break-remover` 出力と本計画書記載の grep コマンド全件の出力を引用付きで報告
- T-1 reviewer: 最低 1 つ以上の grep コマンドを **独立に再実行** して出力一致を確認（数値・件数の一致を確認すれば完成条件の grep 数値一致もカバーされる）+ **r5 MINOR-1 対応 = 「既存 9 タイル条件付き表示なし」実証は reviewer 独立で全 9 タイル `src/tools/*/[A-Z]*Tile.tsx` を Read** し、`{ ... && ... }` / `{ ... ? ... : null }` 形式の条件付き JSX レンダリングが存在しないことを目視確認（一般 grep のヒット行分類結果も独立に検証）

#### T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + T1 yaml 追加 + B-443 backlog 更新

**目的**: 詳細ページを新デザイン体系（1200px 標準 / 新トークン）に統一し、T1 yaml の search_intents 整合を取り、B-443 backlog の対象件数を更新する。

**A. 移行作業**:

- `git mv` で `src/app/(legacy)/tools/line-break-remover/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `src/app/(new)/tools/line-break-remover/` 配下に移動
- `src/app/(new)/tools/line-break-remover/page.module.css` を新設（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }` の標準パターン / 直近 9 ツールと完全同一）。`page.tsx` 側に `<div className={styles.page}>` ラッパー追加
- `src/tools/line-break-remover/Component.module.css` の旧トークン **24 箇所 / 7 種**を以下マッピングで一括置換（cycle-205〜208 SSoT 踏襲）:
  - `--color-bg → --bg`
  - `--color-border → --border`
  - `--color-primary → --accent`
  - `--color-text → --fg`
  - `--color-text-muted → --fg-soft`
  - `--color-error → --danger`
  - `--color-error-bg → --danger-soft`
- `#fff` リテラルの取扱い: `.modeButton.active { color: #fff }` が存在する場合は **cycle-207 起票の B-440 一括点検対象として本サイクルでは維持**。WCAG 実測値（cycle-208 で kana-converter 同型ボタンを実測: ライト 3.63:1 / ダーク 2.59:1 = 両モード 4.5:1 未達）は **`docs/cycles/cycle-207.md` L597 / `docs/backlog.md` B-440 行に記録済**（git 管理下 SSoT）。line-break-remover も同一 globals.css 値・同一ボタンパターンのため B-440 一括点検まで本サイクルでの再計測不要（MINOR-3 対応）
- **並べ読み突合**: `grep -h -o -- '--\(bg\|border\|accent\|fg\|fg-soft\|danger\|danger-soft\)\b' src/tools/{base64,hash-generator,fullwidth-converter,kana-converter}/Component.module.css | sort -u` を実行し、置換先 7 種が既存 SSoT に揃っていることを直接確認（AP-WF12 違反予防）
- w1900 で本文幅が 1200px に収まっていることを確認

**B. T1 yaml 追加**（前述「目的 §追加クエリ確定」で計画段階確定済）:

- 追加先: `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` の `search_intents` 末尾
- 追加 4 語（採択案 1）: 「改行削除」/「改行 削除」/「PDF 改行」/「PDFコピペ 改行」
- 並び順: 既存 13 項目の末尾 = L41〜L44 相当に追加（並びに意味なし）
- 棚卸しスコープ外: 全体棚卸しは B-438 提案で温存（本サイクルでは改行関連 4 語追加のみ）

**C. B-443 backlog 件数更新**（MAJOR-3 対応 = cycle-208 で B-443 が「対象 6 件」として整備されたが、本サイクル kana-converter→line-break-remover への拡張で「7 件」へ更新する運用）:

- `docs/backlog.md` B-443 行の対象件数記述を **「6 件 → 7 件」** に更新
- **ARIA 件数の根拠表（NIT-3 対応 / 9 タイルの内訳明示）**:

| #   | ツール                              | タイル aria-pressed?       | 詳細 radiogroup?  | ARIA 分裂?                                |
| --- | ----------------------------------- | -------------------------- | ----------------- | ----------------------------------------- |
| 1   | base64                              | Yes                        | Yes               | Yes（分裂）                               |
| 2   | url-encode                          | Yes                        | Yes               | Yes（分裂）                               |
| 3   | html-entity                         | Yes                        | Yes               | Yes（分裂）                               |
| 4   | fullwidth-converter                 | Yes                        | Yes               | Yes（分裂）                               |
| 5   | kana-converter                      | Yes                        | Yes               | Yes（分裂）                               |
| 6   | hash-generator                      | Yes                        | No (region のみ)  | No（タイル/詳細とも button トグル統一済） |
| 7   | char-count                          | No (排他選択なし)          | No (排他選択なし) | -                                         |
| 8   | byte-counter                        | No (排他選択なし)          | No (排他選択なし) | -                                         |
| 9   | qr-code                             | No (rows=3 / 排他選択なし) | No                | -                                         |
| 10  | line-break-remover (本サイクル新規) | Yes                        | Yes               | Yes（分裂）                               |

- **集計**:
  - タイル `aria-pressed` 排他選択 = **7 件**（base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter + 本サイクル line-break-remover）
  - 詳細 radiogroup 採用 = **6 件**（base64 / url-encode / html-entity / fullwidth-converter / kana-converter + 本サイクル line-break-remover / hash-generator は radiogroup 無し）
  - 分裂解消対象 = **6 件**（タイル aria-pressed + 詳細 radiogroup 両方持ち = 上記詳細 radiogroup 6 件と一致 / hash-generator は分裂なしのため除外）
- **完了確認コマンド**: `grep -n "B-443" docs/backlog.md` で「7 件」表記がヒットすること

**注意事項**:

- ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは touch しない（B-431 一括対応）
- `meta.ts` の `trustLevel: "verified"` は削除しない（B-432 一括削除を待つ）
- `meta.ts` の `keywords` / `description` / `howItWorks` / `faq` も touch しない（既存 SEO 文言を維持）
- opengraph-image.tsx / twitter-image.tsx の内容は変更しない（`git mv` のみ）
- **詳細ページ Component.tsx は touch しない**（kind=widget 標準パターン継続。詳細ページ `<fieldset>` + `<legend>` 化や `mergeConsecutive` デフォルト変更は本サイクルでは扱わない / 後述「キャリーオーバー」参照）

**完成条件**:

- [ ] `/tools/line-break-remover` が (new) 配下で正常表示される（HTTP 200 OK）
- [ ] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件 `git mv` 済）
- [ ] w1200 / w1900 / w375 で表示崩れがない（T-4 Playwright 視覚回帰で確認）
- [ ] Component.module.css 内に `--color-*` 系旧トークンが残存しない: `grep -c -- "--color-" src/tools/line-break-remover/Component.module.css` → `0`
- [ ] `--accent-hover`（globals.css に存在しないトークン / cycle-207 R2 訂正済の誤記注意喚起）: `grep -c 'accent-hover' src/tools/line-break-remover/Component.module.css` → `0`
- [ ] `#fff` リテラル（`.modeButton.active color` が存在する場合）は維持されている（B-440 一括点検対象として残置）
- [ ] T1 yaml `search_intents` に 改行関連 4 語が追加されている: `grep -nE '"改行|"PDF' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → 4 件以上ヒット
- [ ] `docs/backlog.md` の B-443 行内の **件数すべて** が line-break-remover 追加で連動更新されている（r4 MINOR-1 → r5 MAJOR-1 対応 / cycle-208 完了時点の現行 backlog 数値「タイル群 5 件 + kana-converter 1 件 = 6 件タイル / 既存 4 件 + kana-converter 1 件 = 5 件 radiogroup / 分裂解消対象 5 件」を起点に line-break-remover 1 件追加で連動更新 / 上記 §T-2 C 集計表 L173-176 と完全整合）:
  - (a) **タイル群: 6 件 → 7 件**（cycle-208 完了時点の 6 件タイル + 本サイクル line-break-remover 1 件 = 7 件タイル / §T-2 C 集計「タイル aria-pressed = 7 件」と一致）
  - (b) **詳細ページ radiogroup: 5 件 → 6 件**（cycle-208 完了時点の 5 件 radiogroup + 本サイクル line-break-remover 1 件 = 6 件 radiogroup / §T-2 C 集計「詳細 radiogroup = 6 件」と一致）
  - (c) **分裂解消対象: 5 件 → 6 件**（cycle-208 完了時点の 5 件 + 本サイクル line-break-remover 1 件 = 6 件 / §T-2 C 集計「分裂解消対象 = 6 件」と一致 / base64 / url-encode / html-entity / fullwidth-converter / kana-converter + line-break-remover = 6 件）
  - (d) **ARIA 集計表（L173-176）との連動明示**: B-443 行内のすべての件数が「タイル aria-pressed 7 件 / 詳細 radiogroup 6 件 / 分裂解消対象 6 件」で §T-2 C 集計と完全整合していること
  - 完了確認コマンド: `grep -n "B-443" docs/backlog.md` 出力を Read し、上記 (a)(b)(c) すべてが新数値（タイル群 7 件 / 詳細 radiogroup 6 件 / 分裂解消対象 6 件）になっていること + B-443 行内に旧数値（タイル群 5 件 / 既存 4 件 / 5 件 radiogroup / 分裂解消対象 5 件 / 6 件タイル）が残存していないこと
  - (e) **B-443 行全文書き換え方針の literal 確定（r6 MINOR-1 対応 = builder 裁量排除）**: B-443 行のタイトル（行頭メタ）は「タイル群 **7 件タイル** の `<button>` + `aria-pressed` → `role="radiogroup"` 統一 + 詳細ページ radiogroup **6 件維持**（分裂解消対象 **6 件分裂解消** + hash-generator は別検討）」相当形に書き換える（タイトル文字列に残っている旧件数 = 「6 件タイル」「5 件 radiogroup」「分裂解消対象 5 件」をすべて新件数に置換 / 言い回しは既存タイトル構造を踏襲）。Description 内の **cycle-208 経緯文中の歴史的件数表記**（「既存 5 件 = base64 / url-encode / html-entity / hash-generator / fullwidth-converter」「kana-converter 1 件追加」など cycle-208 完了時点の事実記述）は **履歴的事実として残置**し書き換えない（builder が誤って書き換えないよう、置換対象は「現状を表す件数集計」のみで、cycle-208 当時の経緯記述は対象外であることを明示）。完了確認: `grep -n "B-443" docs/backlog.md` 出力をタイトル行と Description 行に分け、(α) タイトル行内の現状件数表記がすべて新数値（7/6/6）に統一されている、(β) Description 内の cycle-208 経緯文（「既存 5 件」「kana-converter 1 件」等）は cycle-208 完了時点の事実記述として残置されている、の両方を確認

**T-2 検証手順（AP-WF16）**:

- T-2 builder: 残存判定 grep / `/tools/line-break-remover` HTTP 200 OK / T1 yaml diff / `grep -n "B-443" docs/backlog.md` の結果を引用付きで報告
- T-2 reviewer: 最低 1 つ以上を独立再実行

#### T-3: タイル定義（kind=widget + 3 モード + 2 階層オプション + AP-P21 役割分担）

**目的**: ダッシュボード時代の `line-break-remover` 利用導線を新設。Phase 8.1 第 10 弾としての構造的新規性（2 階層オプション）の運用パターン SSoT を確立する。

- **kind 判定**: line-break-remover の詳細ページ Component は「3 モード選択 + 条件付きサブオプション + 入力 textarea + 結果情報 + 出力 textarea + コピーボタン」で縦に長く、128px タイルセル基準では収まらないため **kind=widget**（kind=single は「ページを開いた瞬間に … すぐ使い始められる」核心価値が失われるため AP-P17 観点で却下）

論点 1〜6 は後述「検討した他の選択肢と判断理由」で計画段階に確定する（builder 裁量を排除 / AP-WF03）。

##### T-3 共通実装事項

- タイル用コンポーネント `src/tools/line-break-remover/LineBreakRemoverTile.tsx` を新規実装
  - CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 9 タイルと同型
  - `role="status" aria-live="polite"` を結果欄に付与（既存タイルと同型）
  - モード選択ボタン群の ARIA は `<button>` + `aria-pressed` を採用（後述論点 4 案 b / 既存 6 タイル = base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter と同型 / **実測コマンド**: `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx`）
  - smart-pdf 選択時のみ joinStyle サブオプションを **条件付き表示**（後述論点 2 採択案 a / 論点 2.5 採択案 (a)）。**アニメーション技法 = opacity フェードイン/アウト（0 → 1）+ 微小 `transform: translateY(-4px → 0)` を 200ms ease-out で適用**。**高さは即時切替**（`display: none ↔ display: block`）で grid-template-rows トランジションの Chrome jumpy 挙動 / Hydration ミスマッチを根本回避。`prefers-reduced-motion: reduce` 設定下では opacity アニメーションも無効化し即時表示/非表示
  - mergeConsecutive はタイル UI から省略（後述論点 3 採択案 ii）
  - 末尾「詳細ページで開く」`<Link>` 配置（既存タイル同型）
  - debounce なし（後述論点 5 採択案 1）
  - **モード切替時の `copied` 状態リセット仕様（r4 MINOR-2 対応 = builder 裁量排除）**: `handleModeChange` 内で `setCopied(false)` を呼びコピー完了状態をリセットする（詳細ページ `src/tools/line-break-remover/Component.tsx` L40-43 の `setCopied(false)` パターン踏襲）。モードを切替えれば結果も変わるためコピー完了表示は古い情報となり、リセットすることで T2 likes「タイル / 詳細で操作モデル一致」を満たす
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に line-break-remover のエントリ追加（**recommendedSize は第一推奨 cols=3 rows=2 / 退避時 cols=3 rows=3 を許容**。論点 2 退避案 α 採択時のみ rows=3 への拡張を再評価）
- `npm run generate:tiles-registry` で codegen 実行（tilesCount: 9 → 10）

##### T-3 設計論点 6: タイル用テストの観点（最低 8 件 / MAJOR-3 対応で観点別件数細分化）

タイル用コンポーネントのテストを追加する。**最低 8 件**、以下の観点別ベースライン内訳をすべて満たすこと（MAJOR-3 対応 / cycle-208 「最低 7 件」を本サイクル 2 階層構造に合わせて 8 件に拡張）。assertion 文言は builder 裁量:

- **観点 (i) レンダリング 1 件**: タイル初期描画（remove 既定 + 空入力）でモード選択ボタン 3 件 + 入力 textarea + 結果欄 + 詳細リンクが DOM に存在
- **観点 (ii) モード切替挙動 2 件**:
  - (ii-a) **remove → replace-space**: 既定モードから replace-space に切替、入力テキスト保持 + 結果欄がスペース置換結果に変化
  - (ii-b) **replace-space → smart-pdf**: replace-space から smart-pdf に切替、joinStyle サブオプションが DOM 挿入される
- **観点 (iii) 条件付き表示の表示切替 1 件**: smart-pdf 選択時に joinStyle サブオプションが DOM に表示され、別モード（remove）に戻すと DOM から消える（出入り両方向 1 件で検証）
- **観点 (iv) 入力 → 出力反映 1 件**: 入力 onChange で即座に結果が更新（debounce なし）。改行混在 30 文字程度を入力 → 既定 remove モードで改行削除結果が即時反映
- **観点 (v) コピーボタン 1 件**: コピーボタン押下で `navigator.clipboard.writeText` が呼ばれる（モック検証）+ コピー成功状態の UI 表示
- **観点 (vi) ARIA / aria-pressed 1 件**: モード選択ボタン群が `getByRole("button")` で各モードボタン計 3 件検出可能、選択中ボタンの `aria-pressed` が `"true"`、他 2 件が `"false"`
- **観点 (vii) 空入力 + `role="status" aria-live="polite"` 1 件**: 結果欄が空表示で `role="status"` を持つ要素として描画される

**合計 = ベースライン 8 件**。実装段階で必要に応じて追加可（特に観点 (ii) で smart-pdf → remove の戻り検証 / 観点 (iii) で joinStyle=remove と =space の出力差検証を追加すれば 10 件規模）。8 件を下回ることはない。

**完成条件**:

- [ ] `TILE_DECLARATIONS` に line-break-remover が追加されている（**cols=3 rows=2 第一推奨 / rows=3 退避時許容**。論点 2 退避フローに従う）
- [ ] codegen 成功し `tilesCount=10` になる: `src/tools/generated/tiles-registry.ts` 直接 Read で確認 + `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts` → 10
- [ ] `LineBreakRemoverTile.tsx` のテスト **8 件以上**（観点 (i)〜(vii) を全て含む / MAJOR-3 対応で観点別細分化）が緑
- [ ] タイル UI 上で 3 モード切替が機能、smart-pdf 選択時のみ joinStyle サブオプションが opacity フェード + translateY で表示される（高さは即時切替）
- [ ] 条件付き表示の opacity フェードが全モダンブラウザ（Chrome / Safari / Firefox 各最新版）で動作確認済（T-4 視覚検証で確認）
- [ ] `prefers-reduced-motion: reduce` 設定下では opacity アニメーションも無効化され即時表示/非表示に Fallback することが Playwright で確認済
- [ ] 詳細ページ Component.tsx が touch されていない（`git diff src/tools/line-break-remover/Component.tsx` で空）

**T-3 検証手順（AP-WF16）**:

- T-3 builder: `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて**の出力を引用付きで報告
- T-3 reviewer: **4 コマンドすべて**を独立に再実行して出力一致を確認

#### T-4: 検証と統合確認（AP-P21 計測 / 2 階層オプション挙動 / IME 観察 / AP-WF16 全件再実行）

**目的**: 通常運用フェーズ 3 回目として AP-WF16 reviewer 独立再実行を含む油断打ち消し策を完全実施し、来訪者に届く品質を保証する。

- `/internal/tiles/preview/tools/line-break-remover` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク = **計 4 枚 固定**撮影 / MINOR-2 対応 = cycle-208 と同型の viewport 構成。w1900 はタイルプレビューでは撮影しない = タイル単独確認はダッシュボード相当の w1200 が代表値、w1900 は after の詳細ページ撮影で網羅）

- **2 階層オプション挙動の 5 状態スクショ × 2 モード = 計 10 枚**（MAJOR-5 対応 / 本サイクル最大の構造的新規性の SSoT 実証データ）。撮影状態:
  1. smart-pdf 非選択時（remove or replace-space 表示中）
  2. smart-pdf 選択直後（joinStyle サブオプションが DOM 挿入された瞬間）
  3. smart-pdf + joinStyle=remove 選択時
  4. smart-pdf + joinStyle=space 選択時
  5. smart-pdf から別モード（remove）に戻した直後（joinStyle が DOM から消えた状態）
  - 各 5 状態を light / dark 両モードで撮影 = **計 10 枚**
  - 保存先: `tmp/cycle-209/conditional-options/`

- 移行後のスクリーンショット（**計 8 枚**: ベース 6 枚 + 結果表示済み 2 枚 = T-1 と同型）を再撮影（T-2 スクショ流用事故の再発防止 / cycle-203 T-4 MINOR-1 教訓）

- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認

- 移行前後で URL が変わっていないことの確認（`/tools/line-break-remover` で 200 OK）

- タイルプレビュー上の動作確認を Playwright で実施:
  - デフォルト表示（remove 既定 + 空入力）でプレースホルダー or 空状態
  - 3 モード切替の動作確認（remove → replace-space → smart-pdf を順に押下し、結果欄が各モードに従って更新される）
  - smart-pdf 選択時のみ joinStyle サブオプションが DOM に表れる / 別モードに戻すと消える（条件付きレンダリング動作確認）
  - **キーボード操作の動作確認**: Tab キーで 3 モードボタン → 入力 textarea → 結果欄 → 詳細リンクの順にフォーカスが移動、モードボタンにフォーカスが当たった状態で Space / Enter キー押下でモード切替。**ARIA 主語の明確化（r4 MINOR-3 対応）**: 本検証は**タイル UI（`<button>` + `aria-pressed`、role なし）** の挙動について行う。タイルは Space / Enter で button activation のみ対応する（矢印キーは元々非対応 = `aria-pressed` パターンには radiogroup の矢印キー仕様は適用されない）。一方、**詳細ページは `<button>` + `role="radio"` + `aria-checked` で実装**されており WAI-ARIA 上は矢印キー操作が期待されるが、その対応欠如は B-442 スコープのため本サイクル対象外。タイル ARIA と詳細 ARIA の分裂は cycle-208 と同型の許容運用継続（既存 5 件と同じ分裂パターンが 6 件目になるのみで、新規分裂パターンは導入されない / 補足事項「タイル / 詳細 ARIA 分裂の許容運用継続」参照）
  - 入力 onChange で即座に結果が更新される（debounce なし）

- **【IME composition 中のチラつき観察】**: cycle-208 補足事項の「kana-converter 実機観察結果引用可能条件」（同型軽量同期 + textarea×2 + AP-P17 ゼロベース 3 案以上比較を独立に実施 / 後述論点 5 = 4 案比較に該当）に合致するため、cycle-208 観察結果を**参照根拠として引用可能**。ただし本サイクル独自でも以下の実機観察を実施し、再現性を確認する:
  - Playwright で日本語 IME を介した連続入力（例: 改行混在テキスト「あいうえお\nかきくけこ\nさしすせそ」を 1 文字ずつ確定 = `compositionstart` → `compositionupdate` × n → `compositionend` を 3 回反復）を再現
  - 結果欄の連続書き換え過程を **動画 or 連続スクリーンショット（最低 5 枚 / 各 compositionend 直後）** で記録
  - 観察項目: (i) 結果欄のフリッカー、(ii) compositionupdate イベント中の意図齟齬書き換え、(iii) IME 候補ウィンドウと結果欄が視覚的に重なる際の表示崩れ
  - **客観判定基準（r5 MINOR-2 対応 = builder 主観排除）**:
    - (i) **フリッカー** = 連続スクショ 5 枚のうち、結果欄テキストが直前フレームと**異なる方向に 2 回以上変動**（例: A→B→A→B のように直前状態に戻る動きが 2 回以上発生）したら「顕在化」
    - (ii) **意図齟齬書き換え** = compositionend 直後の結果欄テキストが、入力 textarea の確定済テキストに `removeLineBreaks()` を適用した期待値と**異なれば「顕在化」**（compositionend 確定値ベースの 1 対 1 比較で判定）
    - (iii) **表示崩れ** = タイル枠（cols=3 rows=2 = 400×264px、退避案 α 採用時は 400×400px）の**外側にコンテンツ要素が描画**されている / 結果欄テキスト内に文字化け（U+FFFD など）・重複表示・カーソル位置ずれが Playwright スクショで観察されたら「顕在化」
  - 判定: いずれかが顕在化したら T-4 報告書に明示し PM / reviewer エスカレーション
  - 保存先: `tmp/cycle-209/ime-observation/`（NIT-3 対応）

- **【AP-P21 textarea 高さ計測 5 ケース】**。入力 textarea / 結果 textarea の `getBoundingClientRect()` 高さを以下 5 ケースで計測。**(e) は smart-pdf 選択 → `await page.waitForTimeout(300)` で opacity アニメーション完了を待機後の安定状態を計測する**（MAJOR-1 対応 = アニメーション完了後の最終高さを判定対象に確定）:
  - (a) **空入力**（膨張なし）
  - (b) **短い改行混在入力**（例: 改行 1 つを含む 30 文字程度）
  - (c) **中程度の改行多数入力**（例: 改行 10 個を含む 300 文字程度）
  - (d) **入力長制限ぎりぎり付近**（10 万文字制限の手前 = 9 万文字程度の改行混在文）
  - (e) **smart-pdf 選択時の入力 textarea 高さ変化**: smart-pdf 選択前（remove モード時）の入力 textarea 安定高さと、smart-pdf 選択後 300ms 待機して joinStyle サブオプションが完全表示された状態での入力 textarea 安定高さを比較
  - **判定基準**:
    - (i) **下限 40px 以上**（全 5 ケース、入力 / 結果 textarea 両方）
    - (ii) **(a)(b)(c) の 3 ケース間の入力 textarea / 結果 textarea のそれぞれの高さの相互差が 2px 以内**（cycle-205 hash-generator / cycle-206 fullwidth-converter / cycle-208 kana-converter の実測値 4 ケース全件 46px・相互差 0px との一致確認）
    - (iii) **(d) 単独基準**: 入力 textarea ≥ 40px 維持 + 結果欄が `overflowY: auto` で枠内収納
    - (iv) **(e) 単独基準**: smart-pdf 選択前後の入力 textarea 高さ変化が **±10% 以内**（例: 46px → 41.4px〜50.6px の範囲内）。これを超えると「smart-pdf を試そうとして UI がガクッと縮む」visitor 負体験となり、退避案分岐（前述 §退避案分岐の優先順位 §Step 2）の判定根拠となる
  - 計測結果の意味付け: (a)(b)(c) で 46px ± 0px 再現 → 膨張ゼロ型 4 件目サンプル成立。(e) で ±10% 以内 → 2 階層オプション条件付き表示パターン SSoT として Phase 10.1 設計時に引用可能

- 結果欄 `role="status" aria-live="polite"` の DOM 確認

- **【アニメーション展開時のブラウザ API 挙動確認】** 以下 2 項目を T-4 で実機検証（CRIT-1 方針転換に伴い CLS / Web Vitals 計測は計画から削除 = 単一インタラクションの shift は CLS 指標の本来計測対象外であり、AP-P21 (e) ±10% 判定で visitor 体験リスクをカバーする）:
  1. **Hydration ミスマッチリスク**: joinStyle サブオプションは smart-pdf 選択時のみ表示する条件付きレンダリング（未選択時は DOM 不在）。タイル UI は `"use client"` 前提のため SSR 不一致は構造的に発生しない見込みだが、`npm run build` 出力と Playwright での初期描画時のコンソールに Hydration warning が出ていないことを実機確認。判定 = warning 0 件
  2. **focus 遷移挙動**: smart-pdf ボタン押下時の `document.activeElement` を Playwright で観察。仕様確定 = smart-pdf ボタンに focus が残ったまま、joinStyle サブオプション側への自動移動は行わない（AP-WF03 = builder 裁量排除 / アクセシビリティ仕様の事前確定）。判定 = ボタン押下後 `activeElement` が押下したボタン要素のまま

**完成条件**:

- [ ] 全検証項目クリア。lint / format / test / build 全パス
- [ ] Playwright スクショ枚数（MINOR-2 対応で枚数確定）: **baseline 8 + tiles-preview 4 + after 8 + 2 階層オプション 5 状態 × 2 モード 10 = 計 30 枚 固定**が `tmp/cycle-209/` 配下に保存（cycle-208 計 24 枚 + 2 階層オプション 10 枚の固有追加分 - tiles-preview を 4 枚 = w1200/w375 × light/dark 固定化）
- [ ] AP-P21 計測 5 ケース: (a)(b)(c) は下限 40px 以上 + 相互差 ≤ 2px / (d) は入力 textarea ≥ 40px 維持 + 結果欄枠内収納 / **(e) は smart-pdf 選択前後の入力 textarea 高さ変化 ±10% 以内**
- [ ] 2 階層オプション挙動: 5 状態スクショ × 2 モード = 10 枚が `tmp/cycle-209/conditional-options/` 配下に保存
- [ ] IME composition 観察結果: フリッカー / 操作齟齬の顕在化なしの記録、または顕在化時のエスカレーション報告。連続スクショ最低 5 枚が `tmp/cycle-209/ime-observation/` 配下に保存
- [ ] `role="status"` 検証完了
- [ ] タイル ARIA は `<button>` + `aria-pressed` で既存 6 タイルと同型 = タイル群一貫性を優先（採択論点 4 案 b）
- [ ] 詳細ページとの ARIA 分裂は既存 5 件と同様に許容し、B-443 で分裂解消対象 6 件（5 既存 + 本サイクル 1）一括統一を待つ
- [ ] `TILE_DECLARATIONS` の tilesCount が 9→10 に増えたことを `src/tools/generated/tiles-registry.ts` で直接 Read 確認
- [ ] **ブラウザ API 確認 2 項目**: (a) Hydration warning 0 件 / (b) focus は smart-pdf ボタンに残置（CLS 計測は CRIT-1 方針転換で削除）

**T-4 検証手順（AP-WF16）**:

- T-4 builder: 4 コマンド全件出力 + Playwright 計測 5 ケース実測値 + 2 階層オプション 10 枚スクショ + IME 観察記録 + ブラウザ API 2 項目（Hydration / focus）の実測値を引用付きで報告
- T-4 reviewer: (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測 5 ケースのうち最低 1 ケース（推奨 (e)）を独立に再現、(iii) 2 階層オプション 5 状態スクショのうち最低 1 状態を独立に再撮影、(iv) ブラウザ API 2 項目のうち最低 1 項目を独立に再計測

### 検討した他の選択肢と判断理由

#### 退避案分岐の優先順位（Step 1〜3 統合フロー / 各論点で重複説明せず本セクションを参照）

論点 1（3 モードボタン配置）/ 論点 2（2 階層オプション収納）/ 論点 6（rows=2 vs rows=3）の退避案は相互に依存するため、T-3 builder の退避案判定順序を以下の **Step 1〜3** で明文化する（builder 単独判定で連鎖を進めるリスクを排除 / AP-WF03）。各論点本文では本セクションへの参照のみとし、判定基準の重複説明を避ける（NIT-1 対応）。

**Step 1: 論点 1（3 モードボタン横一列）の Playwright 実物確認**

- 出力: (1) 論点 1 採択結果（案 A 横一列 or 案 B 縦並び）、(2) **AP-P21 計測 (a)(b)(c)(d) 4 ケースの実測値**（Step 2 への引き継ぎ起点とする）
- T-3 builder は案 A（横一列 3 ボタン）で実装 → w375 viewport で Playwright 実物確認 → モード選択行の `scrollWidth > clientWidth` でないこと（横スクロール / クリップ未発生）を判定
- **PASS（破綻なし）** → 論点 1 = 案 A 確定 → AP-P21 (a)(b)(c)(d) を計測 → **Step 2 へ**
- **FAIL（破綻）** → 案 C（横 2 + 縦 1 グリッド）→ 案 B（縦並び）の順でフォールバック → **案 C 試行 → 案 C PASS（w375 で `scrollWidth > clientWidth` でない）なら案 C 確定 / 案 C FAIL なら案 B 確定**（r7 NIT-1 対応 = 案 C PASS 時の処理経路を明示） → 採択案で AP-P21 (a)(b)(c)(d) を計測（縦 2 行追加で下限 40px を割る可能性が高まる）→ **Step 2 へ**

**Step 2: AP-P21 (a)(b)(c)(d)(e) の 5 ケース再計測と退避案分岐**

- Step 1 出力の AP-P21 (a)(b)(c)(d) を起点に、smart-pdf 選択 → 300ms 待機後の入力 textarea 高さを計測して **(e) 第 5 ケースを追加** → 計 5 ケースを評価
- **5 ケースすべて PASS**（(a)(b)(c) 下限 40px 以上 + 相互差 ≤ 2px / (d) 入力 ≥ 40px 維持 + 結果欄枠内収納 / (e) ±10% 以内）→ 論点 2 = 案 a（条件付き表示）+ 論点 2.5 = 案 (a)（opacity フェード）+ 論点 6 = rows=2 確定 → **Step 3 へ**
- **いずれか FAIL** → 以下の順序でフォールバック判断:
  1. **退避案 α（rows=3 拡張、論点 6 連動）を最初に試行**: rows=3 (400×400px) に拡張 → +136px の縦余裕で条件付き表示時の圧迫を回避。**α 採用後は 5 ケース全件を rows=3 環境で再計測**（rows=3 拡張により入力 textarea 高さが (a)(b)(c) で 46px → 異なる値に変わる可能性があるため、5 ケース全件再計測が必須 / 判定優先順位は (e) ±10% を最優先 + (a)(b)(c) 相互差 ≤ 2px / (d) 入力 ≥ 40px の順）→ 5 ケース全件 PASS なら退避案 α 確定（論点 6 = rows=3 / 論点 2 = 案 a 維持 / r5 NIT-2 対応）
  2. **退避案 β（joinStyle 固定 = `remove`）**: 退避案 α でも FAIL なら joinStyle サブオプション UI 自体を削除し、smart-pdf 内 joinStyle は日本語ユーザーに適切なデフォルト `remove` で固定。条件付き表示なしで rows=2 余裕確保 → 再計測 PASS なら退避案 β 確定
  3. **退避案 γ（smart-pdf をタイルから除外、論点 2 案 b 復活）**: 退避案 β でも FAIL = smart-pdf 自体が rows=2/3 いずれでも収まらない最終手段。**PM / reviewer 判断必須**（builder 単独判定禁止）。smart-pdf 差別化喪失のため最終手段

  優先順位の根拠（visitor 価値起点、r4 MAJOR-2 対応で再記述）: (a) **退避案 α は機能犠牲ゼロ** = タイル単体の縦方向拡大のみで visitor の利用可能機能は維持される。Phase 8.1 で qr-code が既に rows=3 で稼働しており「rows=2/3 混在」は既に成立済の許容範囲（混在は Phase 10.1 ダッシュボード設計で再検討するが、本サイクル時点で先例あり = ダッシュボードへの visitor 影響は最小）、(b) **退避案 β は英文ユーザー向け joinStyle=space の選択肢が visitor から奪われる中間影響** = smart-pdf の差別化価値の半分（英文 PDF コピペ visitor 向けの空白置換）を毀損、(c) **退避案 γ は smart-pdf 自体を visitor から奪う最大影響** = yolos.net 単独差別化要素（research §1）の完全喪失で visitor 影響が最大。`美観 vs 機能` の対比ではなく、すべて visitor 価値毀損の大小で α < β < γ の順序付けとなる

**Step 3: 最終確定と記録**

- Step 2 で確定した「論点 1 + 論点 2 + 論点 2.5 + 論点 6」の組合せを T-3 完成形として `TILE_DECLARATIONS` に反映
- 退避案 α/β/γ を採用した場合は本サイクル T-4 報告書に「退避案採択経緯 + 5 ケース実測値」を必ず記録（後続サイクル / Phase 10.1 設計時の SSoT 化判断材料）

**運用補足（2 つの想定経路の最終形 / r4 MINOR-4 対応）**:

- **経路 1（ベストケース = 第一推奨形）**: Step 1 案 A（横一列 3 ボタン）採択 → Step 2 全 PASS = 「**案 A（横一列）+ 案 a（条件付き表示）+ rows=2**」
- **経路 2（Step 1 案 B 採択時の標準ルート）**: Step 1 案 B（縦並び 3 ボタン）採択 → 縦 2 行追加で (a)(b)(c) が下限 40px を割る可能性が高く Step 2 で退避案 α が最優先採用されるのが標準ルート = 「**案 B（縦並び 3 ボタン）+ 案 a（条件付き表示）+ rows=3**」（案 B + rows=3 の組合せでも横ボタン破綻の本質原因 = w375 横方向のラベル長問題は rows 拡大では解消しないため、Step 1 で案 A を選択不能と判定した場合は案 B 縦並びを rows=3 で動作させる形が最終形となる）。なお、Step 1 で案 C（横 2 + 縦 1 グリッド）が中間フォールバック候補として書かれているが、これは「案 A FAIL 時に案 B より先に案 C を試す」順序付けを意味するのみで、経路 2 の最終形は案 B 確定後のフローを示している（案 C は論点 1 比較表で第一推奨外として位置付けられており、§退避案分岐の優先順位 §Step 2 以降では案 B 採択を前提に判定する = r6 NIT-1 対応）。仮に案 C が Step 1 で採択された場合は、横方向圧迫が案 A より緩和され縦方向増分は 1 行のみのため AP-P21 (a)(b)(c)(d)(e) が PASS する可能性が経路 1 寄りに高く、経路 1 の最終形「案 C + 案 a + rows=2」を準用する（案 C 採択時の経路は経路 1 と経路 2 の中間でいずれの最終形にも当てはまるため、§退避案分岐の優先順位 §Step 2 の 5 ケース実測値で個別判定する）

#### 論点 1: 3 モードボタンの配置

| 評価軸                              | 案 A: 横一列 3 ボタン（**第一推奨**）                                                                                                                                                                                                                                                                                                                      | 案 B: 縦並び 3 ボタン                                                | 案 C: 横 2 + 縦 1 のグリッド                                                              | 案 D: ドロップダウン                                                          | 案 E: 4 値の固定省略型省略                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| (i) 来訪者価値（即時性）            | 3 モードすべて視覚的に見えて即切替可能。T1 likes「ページを開いた瞬間に … すぐ使い始められる」最大適合。                                                                                                                                                                                                                                                    | 縦 2 行追加で textarea / 結果欄を圧迫。                              | 非対称グリッドで視覚的バランス欠落。                                                      | 「どんなモードがあるか」が開くまで見えず即時性損失（AP-P07 認知モデル違反）。 | smart-pdf 差別化を奪う（Decision Making Principle 違反）。 |
| (ii) AP-P21 / 枠内収納              | ラベル「改行を削除 / 改行をスペースに置換 / PDFスマートモード」のうち最長は「改行をスペースに置換」（実測コマンド: `grep -n "改行を" src/tools/line-break-remover/Component.tsx` → L60/L69/L78）。w375 で 3 ボタン横並びは 1 ボタン約 100px、`改行をスペースに置換` は全角 11 字相当で 130px 超過の懸念があり、T-3 builder Playwright 実物確認で確定する。 | 縦並びは破綻リスク最小だが AP-P21 リスク中（横並びより縦方向圧迫）。 | 1 ボタン約 150px に拡大可能、長ラベル「改行をスペースに置換」が w375 でも収まる可能性高。 | 1 行で省スペース。AP-P21 リスク最小。                                         | 最大の余裕（0 行追加）。                                   |
| (iii) 詳細ページとの責務分離        | 全 3 モード提供で重複大。タイル価値は「即時アクセス」のみ。                                                                                                                                                                                                                                                                                                | 同上。                                                               | 同上。                                                                                    | 同上 + プルダウンで詳細ページの体験が優位化、タイル価値低下。                 | タイル = 即時 / 詳細 = 全モード で責務分離明確。           |
| (iv) ラベル文言の確定（NIT-1 対応） | 実体 = 詳細ページ Component.tsx L60「改行を削除」/ L69「改行をスペースに置換」/ L78「PDFスマートモード」。**タイル用ラベルは詳細ページ準拠**（タイル / 詳細で同じラベルにすることで T2 likes 操作性一貫を強化）。                                                                                                                                          | 同上。                                                               | 同上。                                                                                    | -                                                                             | -                                                          |
| (v) 実装コスト                      | 低（cycle-208 kana-converter 横一列 4 ボタンの 3 ボタン縮小）。                                                                                                                                                                                                                                                                                            | 低。                                                                 | 中（非対称グリッド CSS）。                                                                | 低（`<select>` 要素のインラインスタイル化）。                                 | 最低。                                                     |

**第一推奨 = 案 A（横一列 3 ボタン）/ 退避案 = 案 C（横 2 + 縦 1 のグリッド）または 案 B（縦並び）**。

**ラベル確定（NIT-1 対応）**: タイル UI のラベルは詳細ページ準拠で「改行を削除 / 改行をスペースに置換 / PDFスマートモード」を採用する。これにより T2 likes「操作性一貫」を強化（タイル → 詳細遷移時にラベル変化がない）。

**退避案分岐条件**: 前述 §退避案分岐の優先順位 §Step 1 に従い、T-3 builder Playwright 実物確認（w375 で `scrollWidth > clientWidth` 判定）で案 A 破綻時は案 C → 案 B の順でフォールバック（NIT-1 対応で詳細フローは退避案分岐セクションに集約）。

#### 論点 2: 2 階層オプション（joinStyle）の収納方法

| 評価軸                          | 案 a: 条件付き表示（smart-pdf 選択時のみ joinStyle 表示 / **第一推奨**）                                                                                                           | 案 b: タイルでは smart-pdf モードを採用しない                                                                       | 案 c: タイルでは joinStyle を固定値で省略                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値                  | research §3 で NN/G プログレッシブディスクロージャー推奨と一致。smart-pdf 差別化要素をタイル来訪者に届けられる。                                                                   | smart-pdf は yolos.net 単独差別化要素（research §1）。これをタイルから奪うのは Decision Making Principle 違反。     | joinStyle は「remove」（日本語向け）「space」（英文向け）で**最大公約数のデフォルトが存在しない**。固定省略は半数の visitor に不正解を提示。 |
| (ii) AP-P21 リスク              | smart-pdf 選択時のみ 1 行 + サブオプション約 28〜32px が追加される。rows=2 = 264px 枠で他要素を圧迫する可能性は MAJOR-5 第 5 ケース計測で実証。                                    | 0 行追加。最大余裕。                                                                                                | 0 行追加。最大余裕。                                                                                                                         |
| (iii) 詳細ページとの責務分離    | タイル / 詳細で同じ操作モデル（条件付き表示）。T2 likes「操作性一貫」適合。                                                                                                        | タイル = 2 モード / 詳細 = 3 モードで責務分離。ただし visitor が「タイルでは PDF 用途が使えない」と気付く必要あり。 | タイル = 2 階層なし / 詳細 = 2 階層あり で操作モデル分裂。T2 likes 違反。                                                                    |
| (iv) 詳細ページのデフォルト整合 | 詳細ページの smart-pdf 内 joinStyle デフォルトは `"remove"`（Component.tsx L16: `useState<SmartPdfJoinStyle>("remove")`）。タイル条件付き表示時も同じデフォルトを継承可能 → 整合。 | -                                                                                                                   | 固定値選定（remove or space）が詳細ページデフォルト（remove）と異なる場合さらに分裂深化。                                                    |
| (v) 操作モデル一致度            | タイル / 詳細で「smart-pdf 選択 → joinStyle が現れる」操作モデル一致 = T2 likes 主軸。                                                                                             | 不一致（タイルでは smart-pdf 自体がない）。                                                                         | 不一致。                                                                                                                                     |

**第一推奨 = 案 a（条件付き表示）**。

**退避案フロー**: AP-P21 (e) ±10% 超過時は前述 §退避案分岐の優先順位 §Step 2 に従い退避案 α（rows=3 拡張）→ β（joinStyle 固定 remove）→ γ（smart-pdf 除外）の順で評価する（判定基準・優先順位の詳細はそちらを参照 / NIT-1 対応 = 重複説明を集約）。

**ラベル文言の visitor 理解度に関する補足**（MAJOR-3 対応）: 「PDFスマートモード」ラベルは詳細ページ準拠で維持する（前述「ラベル確定」参照）。タイル UI 内でモードの意味を補助説明するテキスト（title 属性 / aria-describedby / 補助文 1 行）の追加は本サイクル保留とし、T-4 で実機の visitor 操作を Playwright + 5 状態スクショで観察し、ラベル単独で理解困難という兆候があればキャリーオーバー B-XXX として起票する。

#### 論点 2.5: 条件付き表示のアニメーション形式（CRIT-1 r3 PM 判断で再構成）

論点 2 で案 a（条件付き表示）採択を所与として、条件付き表示の **アニメーション形式** を独立論点化する。r3 レビューで `grid-template-rows: 0fr → 1fr` トランジションが Chrome で jumpy 挙動を起こす問題が複数文献で確認されたため、PM 判断で「opacity フェード + 高さ即時切替」へ方針転換した。CLAUDE.md Decision Making Principle に従い「全モダンブラウザで一貫した visitor 体験を保証する」visitor 価値最大解として案 (a) を採択する。

**比較表（AP-P17 ゼロベース 3 案）**:

| 評価軸                              | 案 (a) opacity フェード + 高さ即時切替（**第一推奨** / CRIT-1 PM 判断で確定）                                                                                                                                                                                    | 案 (b) アニメーションなし（即時表示/非表示）                                                     | 案 (c) 詳細ページ誘導（条件付き表示自体を行わない / smart-pdf 選択時にタイル内案内文「詳細ページで joinStyle を選択」） |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| (i) visitor 発見性                  | opacity フェード + 微小 translateY でサブオプション出現が視覚的に強調され、smart-pdf 選択後に「joinStyle がある」気付きやすい（research §5.3 は高さトランジションを推奨しているが、§5.3 が重視する「発見性補完の通知」目的を opacity + translateY で代替実装）。 | 即時切替で出現するため一瞬で完了。視覚的に分かるが「気付かない visitor」が残る可能性あり。       | タイル内で完結せず、詳細ページへ 1 クリック遷移必要。即時性が失われる。                                                 |
| (ii) 実装コスト                     | 低〜中（インラインスタイルでの opacity 0/1 切替 + `transform: translateY(-4px → 0)` + 200ms ease-out + `useEffect` での `matchMedia` 評価による `prefers-reduced-motion` Fallback）。                                                                            | 最低（条件付きレンダリングのみ）。                                                               | 低（案内文の追加のみ）。                                                                                                |
| (iii) ブラウザ対応 / 動作安定性     | opacity と transform は全モダンブラウザ（Chrome / Safari / Firefox）の数年来 Baseline で安定動作。grid-template-rows トランジションで報告されている Chrome jumpy 挙動を構造的に回避できる。                                                                      | 全ブラウザ対応（条件付きレンダリングのみ）。                                                     | 全ブラウザ対応。                                                                                                        |
| (iv) Decision Making Principle 整合 | research §5.3 が高さトランジションで実現を推奨する「発見性を補う通知」目的を、Chrome jumpy 問題で破綻しない opacity + translateY 技法で代替実装し、全ブラウザで一貫した visitor 体験を保証。                                                                     | 「実装コストが最低」を理由に visitor 発見性で劣る案を選ぶ構造 = Decision Making Principle 違反。 | smart-pdf の差別化価値を visitor から直接奪う（タイル内で完結しない）= Decision Making Principle 違反。                 |
| (v) アクセシビリティ                | `prefers-reduced-motion: reduce` 設定下では opacity アニメーションも無効化し即時表示/非表示 = WCAG 2.1 SC 2.3.3 (AAA) 準拠                                                                                                                                       | -                                                                                                | -                                                                                                                       |
| (vi) CLS / レイアウト変化           | 高さは即時切替のため smart-pdf 選択時に joinStyle 行ぶんの高さ変化（CLS）が発生する。visibility 切替 + 高さ常時確保で CLS をゼロにする選択肢も技術的には可能だが、AP-P21 (e) 入力 textarea 高さとの trade-off となるため不採用（後述採択理由 5）。               | 同左（即時切替で同様に高さ変化発生）。                                                           | 高さ変化なし（詳細ページ遷移するため）。                                                                                |

**採択 = 案 (a)（opacity フェード + 高さ即時切替）**（CRIT-1 PM 判断で確定）。

**採択理由**:

1. **research §5.3 が重視する発見性補完目的の代替実装**: research §5.3 は「条件付き表示 + 視覚的通知」のセットで visitor 発見性を確保することを定性的に推奨し、具体技法として高さトランジションを挙げている。本サイクルは §5.3 が重視する「発見性補完の通知」目的を共通としつつ、Chrome jumpy 問題で破綻する高さトランジションを採用せず、opacity + translateY で同じ目的を達成する。即時切替は「条件付き表示の発見性の低さを放置する」設計となり visitor 価値を毀損する
2. **Chrome jumpy 問題の根本回避**: grid-template-rows トランジションは Chrome で滑らかに動作しない報告が複数文献にあり、ブラウザ間で一貫体験を提供できない。opacity + transform は全モダンブラウザで安定動作するためこの問題を構造的に回避
3. **Hydration ミスマッチの構造的回避**: 高さ自体を即時切替（display none ↔ block）にすることで、CSS トランジションの中間状態と React の DOM 更新タイミングの齟齬を構造的に排除
4. **アクセシビリティ準拠**: `prefers-reduced-motion: reduce` Fallback で前庭機能感受性ユーザーへの WCAG 2.1 SC 2.3.3 (AAA) 準拠
5. **CLS と AP-P21 (e) の trade-off 設計**: 高さ常時確保（visibility: hidden / aria-hidden 切替）で CLS をゼロにする選択肢は技術的には可能だが、smart-pdf 非選択時にも joinStyle 行ぶんのスペースが残り AP-P21 ベース高さを圧迫する trade-off となる。本サイクルでは AP-P21 (e) ±10% 維持を優先し、CLS は許容（単一インタラクション内のため Web Vitals スコアは「ページライフタイム合計」基準で計測対象外）。visitor 体験リスクは AP-P21 (e) ±10% 判定で直接評価する形を採用する

**実装仕様確定**（AP-WF03 = builder 裁量排除）:

- **アニメーション技法**: opacity（0 → 1）+ `transform: translateY(-4px → 0)` を 200ms ease-out で適用
- **高さ切替**: `display: none ↔ display: block`（即時切替 / grid-template-rows トランジションは採用しない）
- **持続時間**: 200ms ease-out（visitor 体感で「滑らかに現れた」と感じる最短時間）
- **Fallback**: `prefers-reduced-motion: reduce` 設定下では opacity アニメーションも無効化し即時表示/非表示（`useEffect` + `matchMedia('(prefers-reduced-motion: reduce)')` で初期評価 + change イベント購読）
- **ブラウザ対応**: opacity と transform は全モダンブラウザで安定動作。具体的なバージョン番号の明記は出典不確実性を避けるため行わず、T-4 で Chrome / Safari / Firefox 各最新版での実物確認を行う

**本サイクルで実体確認するブラウザ API は以下 2 件**（CRIT-1 方針転換に伴い CLS / Web Vitals 計測項目は削除 / 単一インタラクションの shift は CLS 指標の本来計測対象外 = AP-P21 (e) ±10% で代替）:

1. **Hydration ミスマッチリスク**: joinStyle サブオプションは smart-pdf 選択時のみ表示する条件付きレンダリング（未選択時は DOM 不在）。タイル UI は `"use client"` 前提のため SSR 不一致は構造的に発生しない見込みだが、initial state（`mode = "remove"`）での Server/Client 描画が完全一致することを `npm run build` 出力 + Playwright での初期描画コンソールに Hydration warning が出ていないことを T-4 で実機確認 → 判定 = warning 0 件
2. **focus 遷移挙動**: smart-pdf ボタンを押下 → joinStyle サブオプションが DOM 表示された瞬間、`document.activeElement` がどこに留まるかを Playwright で観察。**仕様確定**: smart-pdf ボタンに focus が残ったまま、joinStyle サブオプション側への自動移動は行わない（自動移動は visitor の意図と齟齬する可能性が高い）。判定 = ボタン押下後 `activeElement` が押下したボタン要素のまま

その他で利用するブラウザ API（`navigator.clipboard.writeText` 等）は cycle-207 / 208 で既に利用実績があり新規確認不要。`<fieldset>` + `<legend>` semantics は本サイクル外（後述キャリーオーバー）。

#### 論点 3: mergeConsecutive チェックボックスのタイル収納

**ロジック実体の確認**（CRIT-4 対応 / `src/tools/line-break-remover/logic.ts` L62-85 / L94-119 を Read で確認した結果）:

- **`remove` モード**: `mergeConsecutive=true` の場合、`\n{2,}` → `\n` に正規化してから全 `\n` を `""` に置換（L69-76）。`mergeConsecutive=false` の場合、直接全 `\n` を `""` に置換（L79-82）。**結果は同一**（連続改行を統合してから削除しても、直接削除しても文字列としては同じ）。**つまり remove モードでは mergeConsecutive ON/OFF で出力差なし**
- **`replace-space` モード**: `mergeConsecutive=true` の場合、`\n{2,}` → `\n` → " " で **連続改行 → 1 スペース**。`mergeConsecutive=false` の場合、各 `\n` → " " で **連続改行 → 連続スペース**。**ここが mergeConsecutive の本質的な意味で唯一出力差が出るモード**
- **`smart-pdf` モード**: `processSmartPdf()` 関数（L94-119）が `smartPdfJoinStyle` のみを参照し、`mergeConsecutive` は完全に**無視**される
- **詳細ページのデフォルト**: `mergeConsecutive=false`（Component.tsx L14: `useState(false)`）= OFF
- **詳細ページの条件付き表示**: mergeConsecutive チェックボックスは `mode === "remove" || mode === "replace-space"` 時のみ表示（Component.tsx L83-94）= **詳細ページにも条件付き表示が併存** = 詳細ページには「mergeConsecutive 条件付き表示」+「smart-pdf 内 joinStyle 条件付き表示」の **2 種類の条件付き表示**が存在

| 評価軸                              | 案 i: タイルに mergeConsecutive チェックボックス表示                                                                                                                                                                                                                    | 案 ii: タイルでは mergeConsecutive 省略（**第一推奨**）                                                                                                                                                                                                                                                                 | 案 iii: タイルでも remove / replace-space 時のみ mergeConsecutive を条件付き表示                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値                      | mergeConsecutive ON/OFF で出力差が出るのは **replace-space モードのみ**。タイル来訪者の主用途は最大公約数の remove と想定され、replace-space + 連続改行というニッチ用途のためにチェックボックスを追加するのは T1 likes「余計な装飾なく … 静かに片付けられる画面」違反。 | タイル UI = 即時性最大、最も visitor 価値毀損が少ない（remove では出力差なし / replace-space では「連続改行 → 連続スペース」固定 = 詳細ページデフォルト OFF と完全一致）。**OFF 固定**を採用することで詳細ページデフォルト OFF と整合（CRIT-4 対応 / 「ON 固定」案は詳細ページ OFF と矛盾するため撤回）。               | タイル / 詳細で操作モデル対称化（MINOR-5 解消）。ただし「2 階層条件付き表示」が 2 種類になりタイル UI 複雑化、本サイクルの構造的新規性が 2 重化される。 |
| (ii) AP-P21 リスク                  | 1 行追加 + smart-pdf 時の joinStyle 追加で 2 行追加可能性 → rows=2 圧迫リスク大。                                                                                                                                                                                       | 0 行追加。最大余裕。                                                                                                                                                                                                                                                                                                    | 条件付き表示で smart-pdf 時 1 行 / remove・replace-space 時 1 行で常時 1 行追加と等価 = 案 i と同等の rows=2 圧迫リスク。                               |
| (iii) 詳細ページとの責務分離        | タイル = 全オプション / 詳細 = 全オプションで重複大、責務分離なし。                                                                                                                                                                                                     | タイル = 即時性 / 詳細 = 細部制御（mergeConsecutive 含む 2 階層オプション）で責務分離明確。                                                                                                                                                                                                                             | タイル / 詳細でほぼ同じオプション、責務分離弱い。                                                                                                       |
| (iv) 詳細ページのデフォルトとの整合 | タイルでも詳細と同じ OFF デフォルトにすれば整合。ただし visitor がタイルで OFF を期待しているかは不明（merge ON が「より整理された結果」と期待される可能性も）。                                                                                                        | タイル省略 = OFF 固定（実装上 `mergeConsecutive: false` 固定）→ 詳細ページデフォルト OFF と完全一致。タイル → 詳細遷移時に同じ動作。**ON 固定は詳細ページ OFF と矛盾するため不採用**（CRIT-4 = タイル ON / 詳細 OFF だと visitor が「タイルで試して詳細でも同じ結果が出ると思ったら違った」体験になり T2 likes 違反）。 | タイル / 詳細とも条件付き表示 + デフォルト OFF で完全一致。整合性最大。                                                                                 |
| (v) タイル / 詳細の操作モデル一致度 | チェックボックス 1 個分の不一致（タイル = チェックなし固定 / 詳細 = チェック表示）。                                                                                                                                                                                    | タイル = mergeConsecutive UI なし / 詳細 = 条件付き表示で UI 表示 = 不一致だが「タイル = 即時 / 詳細 = 細部」責務分離許容範囲（cycle-206 fullwidth-converter「オプション全 ON 固定省略」と同型構造）。                                                                                                                  | 完全一致。                                                                                                                                              |

**第一推奨 = 案 ii（タイルでは mergeConsecutive 省略 / OFF 固定）**。

**採択理由（CRIT-4 対応 / visitor 価値起点で再評価）**:

1. **ロジック実体に基づく判断**: mergeConsecutive ON/OFF で出力差が出るのは replace-space モードのみで、remove / smart-pdf では出力差なし。タイル来訪者の最大公約数用途（PDF コピペ後の改行削除 = remove or smart-pdf）では mergeConsecutive 設定の影響なし。**「mergeConsecutive ON が最大公約数」は実体未確認に基づく誤判断だったため撤回 = 案 ii で「OFF 固定」を採用**
2. **詳細ページデフォルトとの整合**: 詳細ページデフォルト OFF（Component.tsx L14）と完全一致。visitor がタイル → 詳細遷移時に同じ動作を体験できる
3. **タイル UI の最小化**: T1 likes「余計な装飾なく … 静かに片付けられる画面」に従い、出力差が限定的なオプションは省略
4. **詳細ページの細部制御は維持**: replace-space モード + 連続改行で「1 スペース vs 連続スペース」を制御したい visitor は詳細ページに進めば mergeConsecutive チェックボックスが使える（責務分離 = タイル即時 / 詳細細部）
5. **タイル / 詳細の「条件付き表示の数」非対称（タイル = 1 種類 smart-pdf のみ / 詳細 = 2 種類 mergeConsecutive + smart-pdf）の許容根拠**: (i) rows=2 (264px) 内に両方の条件付き表示を収めると AP-P21 (e) ±10% を超過するリスク大で smart-pdf 差別化保持を優先、(ii) cycle-200〜208 で確立された「タイル = 即時 / 詳細 = 細部制御」運用の継続、(iii) visitor が詳細ページに 1 クリック遷移すれば mergeConsecutive を制御可能 = visitor 価値毀損ゼロ、(iv) cycle-206 fullwidth-converter「タイル省略 / 詳細制御」非対称構造の 2 件目として SSoT 強化に寄与

   **visitor 体験リスクの T-4 検証**: 案 ii 採択により visitor がタイルで `replace-space` + 連続改行入力した場合「連続改行 → 連続スペース」になる。空行 3 連続を含む 100 字テキスト入力時の結果をスクショ撮影し、補足事項に体験リスクとして記録する。

#### 論点 4: ARIA パターン（aria-pressed vs radiogroup）

cycle-208 論点 5b と完全同型の構造論点。詳細ページは `role="radiogroup"` 実装済（**実測コマンド**: `grep -n 'role="radiogroup"' src/tools/line-break-remover/Component.tsx` → L50 / MAJOR-3 対応で出典明示）。

| 案                                                                              | 詳細ページとの整合            | 既存タイル群との整合                                                                                             | 実装コスト / B-443 影響                                                                                      | 採否                       |
| ------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 案 a: タイルも `role="radiogroup"` / `role="radio"` / `aria-checked`            | 一致（音声出力同一）          | 既存 6 タイル（base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter）と分裂 | 中 + B-443 全件統一作業の規模が 6 件→7 件に増加 + 本サイクルのみ「他 6 件と異なる ARIA」状態を抱える期間発生 | 不採用                     |
| 案 b: タイル `<button>` + `aria-pressed` / 詳細 radiogroup 維持（**第一推奨**） | 不一致（既存 5 件と同型分裂） | 既存 6 件と完全一致 = タイル群一貫性最大化                                                                       | 低 + B-443 統一対象は分裂解消対象 5 件 + cycle-208 kana-converter 1 件 + 本サイクル 1 件 = **計 7 件**に増加 | **採択**                   |
| 案 c: タイル / 詳細とも `<button>` + `aria-pressed` 統一                        | 一致                          | 既存 6 タイル + hash-generator 詳細と統一                                                                        | 高（詳細ページ Component.tsx touch 必要 = 本サイクル「touch しない」方針と矛盾）                             | 本サイクル外（B-443 候補） |

**採択 = 案 b**（cycle-208 と完全同型 / r4 reviewer 流れの再帰）。

**採択理由（cycle-208 採択理由を踏襲）**:

1. タイルダッシュボードの一貫性 = T2 likes の主軸（Phase 10.1 ダッシュボードの主役 UI）
2. 既存 6 件すべて `<button>` + `aria-pressed` の SSoT との整合
3. 「詳細 radiogroup / タイル aria-pressed」分裂は既存 5 件で運用済の許容済リスク = 本案採択で 6 件化（新たな分裂パターンは導入されない）
4. B-443 統一対象を 6 件 → **7 件**に拡張（MAJOR-3 対応 / T-2 完成条件で backlog 件数更新）

#### 論点 5: debounce 要否（実時間処理の更新タイミング）

cycle-208 補足事項の「kana-converter 実機観察結果引用可能条件」は **AP-P17 ゼロベース 3 案以上比較を独立に実施**することを引用許容条件としている。本サイクルでは **4 案** を独立比較する（MAJOR-7 対応 = 2 案から 4 案に拡張）。

| 評価軸                       | 案 1: debounce なし即時更新（**第一推奨**）                                                                                                                                                                                            | 案 2: debounce 100ms                                                                           | 案 3: debounce 300ms（cycle-207 qr-code 同型）                                                                                       | 案 4: compositionstart/end 検知での結果欄更新抑制（IME 中は更新しない設計）                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| (i) 来訪者価値               | 入力ごと即時更新 = 最大の即時性。`removeLineBreaks()` は同期 + 軽量（正規表現置換のみ）でチラつきリスク低。                                                                                                                            | 100ms 遅延でほぼ即時性維持しつつ連打抑制効果。微差。                                           | 300ms 遅延は visitor に「待たされている」体感が出る可能性。qr-code は画像描画コスト由来で必要だったが、line-break-remover では不要。 | IME 中の意図齟齬リスクを根本的に排除する設計。ただし「composition 中も結果を見たい」visitor 体験を制限する。 |
| (ii) 詳細ページとの整合      | 詳細ページ既存実装は `useMemo` で `removeLineBreaks()` 即時実行（Component.tsx L19-27）/ debounce なし。タイルも即時で T2 likes「操作性一貫」適合。                                                                                    | 詳細との挙動分離 → T2 likes 違反。両方 debounce 化なら詳細 touch 必要 = 本サイクル方針と矛盾。 | 同上。                                                                                                                               | 同上 + 詳細ページに `compositionstart/end` ハンドラ追加が必要 = 本サイクル方針と矛盾。                       |
| (iii) IME composition リスク | cycle-208 kana-converter T-4 実機観察結果 = フリッカー / 操作齟齬 顕在化せず（cycle-208 L460-464）。引用許容条件（同型軽量同期 + textarea×2 + AP-P17 4 案比較を独立実施）に合致するため、line-break-remover 同型ツールに**引用可能**。 | -                                                                                              | -                                                                                                                                    | 完全に IME 中のリスクを排除するが、軽量同期処理ではそもそも顕在化しない（cycle-208 実証済）ため過剰。        |
| (iv) 実装コスト              | 最低（useMemo のみ / 既存実装と同型 = 約 5 行）                                                                                                                                                                                        | 中（useEffect + setTimeout cleanup = 約 15 行）                                                | 中（約 15 行）                                                                                                                       | 中（compositionstart/end イベントハンドラ + isComposing 状態管理 = 約 50 行 / MINOR-3 対応で確定値）         |

**採択 = 案 1（debounce なし即時更新）**。

**採択理由**:

1. line-break-remover の変換特性（純粋同期 + 計算コスト極小 + テキスト出力）に最適
2. 詳細ページとの整合（T2 likes 操作性一貫）
3. cycle-208 IME 観察実証データ（フリッカー / 操作齟齬 顕在化せず）を引用根拠として活用可能 + 本サイクル T-4 で再現性確認
4. AP-P17 ゼロベース 4 案比較を独立に実施した結果として案 1 を採択（cycle-208 補足事項の引用許容条件 b 項を満たす）

#### 論点 6: タイルサイズ（rows=2 vs rows=3）

3 案以上は事実上 2 択しかないため、AP-P17 機械適用は過剰（MINOR-4 対応）。代わりに **rows=2 が成立しない条件 = フォールバック判定基準** を明示する:

| 評価軸                           | 案 X: rows=2（既存 9 件と同型 / **第一推奨**）                                                                                               | 案 Y: rows=3（cycle-207 qr-code と同型 / 縦長）                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| (i) 来訪者価値                   | 264px 高さ内に「モードボタン 1 行 + 入力 textarea + 結果 textarea + コピーボタン + 条件付き joinStyle 行（smart-pdf 時のみ）」が収まる試算。 | 余裕大、textarea / 結果欄に対して垂直スペース過剰。                                            |
| (ii) AP-P21 リスク               | 圧迫リスクあり。論点 2 案 a（条件付き表示）採択時に AP-P21 計測 (e) で smart-pdf 選択前後の入力 textarea 高さ変化 ±10% 以内を判定。          | 余裕大、最大の安全マージン。                                                                   |
| (iii) ダッシュボード全体バランス | 既存 8 タイル（cols=3 rows=2）と完全一致でグリッド美観維持。                                                                                 | cycle-207 qr-code に続き 2 個目の rows=3、混在パターン 1 件追加。                              |
| (iv) 採用論拠                    | 画像出力 / DL ボタン / 大きいプレビューが不要なため rows=3 の必然性なし（standard-patterns §8 = qr-code 例外論拠）。                         | 「Phase 10.1 ダッシュボードのサンプル数を増やすため」だけでは Decision Making Principle 弱い。 |

**第一推奨 = 案 X（rows=2 維持）+ 案 Y（rows=3 拡張）を退避案として保持**。

**rows=2 が成立しない条件 = フォールバック判定基準**: AP-P21 5 ケース計測のうちいずれかが FAIL の場合、前述 §退避案分岐の優先順位 §Step 2 の退避案 α（rows=3 拡張）が連動して採用される（判定基準・優先順位の詳細はそちらを参照 / NIT-1 対応）。

#### その他の検討項目（キャリーオーバー候補化）

- **詳細ページの `<fieldset>` + `<legend>` 化** (research §6 推奨): 現状 `<div className={styles.radioGroup}>` + `<span>`。アクセシビリティ改善だが、Component.tsx 全体のリファクタ性質。**本サイクル外**（後述キャリーオーバー 1）
- **PDF コピペ用ワンクリックプリセット** (research §9 ラッコ手帳例): 「smart-pdf + joinStyle: space」を 1 ボタン化する案。本サイクル新デザイン移行 + タイル化スコープを超える機能拡充。**本サイクル外**（後述キャリーオーバー 2）
- **smart-pdf モードの before-after 例 / 解説**: 詳細ページに比較例追加で smart-pdf 差別化を伝えやすいが、ツール本体の機能拡充。**本サイクル外**（後述キャリーオーバー 3）
- **タイル UI 内のモードラベル理解度補助テキスト追加** (MAJOR-3 対応 = research §4.2 課題): 「PDFスマートモード」ラベル単独の理解度を補う 1 行説明追加。本サイクル T-4 で実機観察し兆候があれば起票（後述キャリーオーバー 4 = 条件起票）
- **条件付き表示のアニメーション化**: r2 で本サイクル取込（論点 2.5 採択 = opacity フェード）= キャリーオーバーから削除

### 計画にあたって参考にした情報

- `docs/cycles/cycle-208.md`（直前サイクル / kana-converter / 通常運用継続 2 回目 / IME 観察結果 / 論点 1 退避案 B フォールバック / 論点 5b 案 b 採択 / B-442 / B-443 起票）
- `docs/cycles/cycle-207.md`（qr-code / 画像 / SVG 出力型初回 / rows=3 / リアルタイム化 / debounce 300ms / B-440 起票元 / AP-P19 教訓）
- `docs/cycles/cycle-206.md`（fullwidth-converter / オプション全 ON 固定省略 / textarea×2 双方向先例）
- **本サイクル planning フェーズで実施した code-researcher による現状把握調査**（MINOR-4 対応 / line-break-remover 現状: ファイル構成 / 旧トークン 24 箇所 7 種 / T1 yaml 改行関連語ゼロ / 既存テスト 57 件 / TILE_DECLARATIONS 9→10 / 詳細ページ `role="radiogroup"` 1 行（`src/tools/line-break-remover/Component.tsx` L50）/ logic.ts L62-119 mergeConsecutive 挙動）。調査レポートは tmp/ 配下に存在しサイクル完了後は消える前提のため、**内容は本計画書本文（T-1 / T-2 / 論点 3 ロジック実体確認）に grep コマンド付きで全件転記済**（reviewer 独立再現可能）
- **同じく cycle-200〜208 標準パターン抽出調査**（MINOR-4 対応 / AP-P21/P17/WF16/P19 最新定義 / `src/tools/_constants/tile-grid.ts` 定数 / 既存タイル 9 件 = base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter / qr-code / char-count / byte-counter のオプション収納実例）。標準パターンの根拠は `docs/cycles/cycle-200.md` 〜 `docs/cycles/cycle-208.md` 各サイクルドキュメントを直接参照（cycle-208 = AP-P21 計測 4 ケース 46px / 相互差 0px 実測値 / 論点 5b 案 b 採択経緯）
- `docs/research/2026-05-25-cycle-209-line-break-tool-ux-research.md`（visitor needs 横断調査 / 7 競合比較 / smart-pdf 単独差別化 / 2 階層オプション NN/G 推奨 / fieldset+legend 推奨 / アニメーション付き条件付き表示 §5.3）
- `docs/anti-patterns/planning.md` / `implementation.md` / `workflow.md`（AP-P17 / AP-P19 / AP-P21 / AP-WF05 / AP-WF16 の最新規定）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1 yaml 現状 = 13 語 / 改行関連語ゼロ）
- `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2 yaml / 一貫性 / ブックマーク代替）
- `docs/design-migration-plan.md`（Phase 8.1 全体計画 / 新デザイン移行ルール）
- `src/tools/_constants/tile-declarations.ts` / `src/tools/_constants/tile-grid.ts`（タイル基盤）
- `src/tools/kana-converter/` 配下（直近実例 / KanaConverterTile.tsx 構造）
- `src/tools/line-break-remover/` 配下（移行対象実体 / logic.ts L62-119 で mergeConsecutive と smart-pdf の挙動を Read 確認）

## レビュー結果

作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。

## キャリーオーバー

本計画書中で「本サイクル外」「B-XXX 起票候補」と判断した派生課題を、AP-WF15 判断軸 4 項目（(α) 来訪者影響 / (β) 当該サイクル目的範囲との整合 / (γ) 本格対応規模 / (δ) 暫定対応長期化への歯止め策）で評価して明示する（MAJOR-6 対応）:

1. **B-XXX 起票候補: 詳細ページの `<fieldset>` + `<legend>` 化**（research §6 推奨 / Component.tsx 全体のリファクタ性質 / r2 でキャリーオーバー 1（条件付き表示アニメーション化）削除 = 本サイクル取込により番号繰り上げ / CRIT-1 対応）
   - (α) 来訪者影響: 中（スクリーンリーダー読み上げ改善）
   - (β) 範囲整合: 本サイクル「(new) 配下移行」とは独立した別レイヤー（Component.tsx touch 必要）
   - (γ) 規模: 大（line-break-remover 単独ではなく全 radiogroup ツール横展開 = B-442 / B-443 と統合検討すべき）
   - (δ) 歯止め: B-442 / B-443 着手時の同時検討対象として明記

2. **B-XXX 起票候補: PDF コピペ用ワンクリックプリセット**（「smart-pdf + joinStyle: space」ワンクリック化 / PM 判断で本サイクル取込せず別サイクル化）
   - (α) 来訪者影響: 高（smart-pdf を 1 クリックで起動 = 体感即時性向上）
   - (β) 範囲整合: 新デザイン移行 + タイル化スコープを超える機能拡充
   - (γ) 規模: 中（タイル UI 上のプリセットボタン 1 個追加 / 既存ロジック流用）
   - (δ) 歯止め: Phase 8.1 完了後に独立サイクル化 or B-XXX として明示起票。Phase 10.1 ダッシュボード時代に「タイル横断プリセット」設計と統合検討する選択肢も残す
   - **PM 判断（本サイクル取込しない理由）**: (1) 本サイクル主目的（新デザイン移行 + タイル化 + 標準パターン継続）に対し新機能追加はスコープ外、(2) smart-pdf 差別化価値は条件付き表示で提供済のため必須改善ではない、(3) 単独サイクルなら横断プリセット設計を伴う検討ができ長期価値が高い、(4) 本サイクル外送りでも smart-pdf 自体は提供されるため毀損は 2 操作 → 1 操作縮約価値のみ

3. **B-XXX 起票候補: smart-pdf モードの before-after 例 / 解説**（詳細ページ拡充）
   - (α) 来訪者影響: 中（smart-pdf 差別化を visitor に伝える / 利用学習コスト低減）
   - (β) 範囲整合: ツール本体の機能拡充（新デザイン移行スコープ外）
   - (γ) 規模: 小（詳細ページに静的解説セクション追加のみ）
   - (δ) 歯止め: ツール拡充カテゴリの backlog として GA 観測（smart-pdf 利用率 / detail 滞在時間）駆動で優先度判定

4. **B-XXX 起票候補（条件起票）: タイル UI 内のモードラベル理解度補助テキスト追加**（MAJOR-3 対応 / research §4.2「PDFスマートラベル理解しにくい」課題への暫定対応）
   - (α) 来訪者影響: 中（「PDFスマートモード」ラベル単独では意味が掴みにくい visitor の理解度向上）
   - (β) 範囲整合: タイル UI の文言追加 1 行（title 属性 / aria-describedby / 補助文）= 本サイクル「タイル化」スコープに収まる可能性あり
   - (γ) 規模: 小（タイル内に補助テキスト 1 行追加 / 詳細ページ touch 不要）
   - (δ) 歯止め: **本サイクル T-4 で 5 状態スクショ × 2 モード = 10 枚を観察し、ラベル単独で理解困難という兆候があれば本サイクル T-4 報告書末尾で起票決定**。兆候なしならキャリーオーバーから削除して継続不要

本サイクル T-4 終了時点で起票決定したものは backlog.md に B 番号付きで登録する。

## 補足事項

- **2 階層オプション SSoT 引用可能条件**: 本サイクル T-4 で得る 2 階層オプション挙動データ（5 状態スクショ × 2 モード = 10 枚 + AP-P21 計測 (e) 結果）を Phase 10.1 ダッシュボード設計時の SSoT として参照可能とする条件:
  - (a) 本サイクル T-4 の 5 状態スクショ + AP-P21 (e) ±10% 以内の実測値が記録されている
  - (b) 引用先サイクル / Phase 10.1 設計時でも AP-P17 ゼロベース 3 案以上比較を独立に実施（具体的な案候補は引用先の文脈に応じて選定 = 本サイクル論点 2 では「条件付き表示 / smart-pdf 不採用 / joinStyle 固定省略」の 3 案、論点 2.5 では「opacity フェード / アニメーションなし / 詳細ページ誘導」の 3 案を比較。引用先サイクルでも同型のゼロベース比較を独立実施することが条件 / MINOR-4 対応）
  - 上記 (a) (b) を満たす場合のみ「line-break-remover 実機観察結果」を引用根拠として活用可能。SSoT 化（機械適用）は本サイクル単独では行わず、Phase 10 以降の整理サイクルで再判断
- **debounce 適用判断は line-break-remover 単独判断**: 論点 5 採択案 1（debounce なし）は本サイクル単独判断として扱う。Phase 8.1 全体の SSoT 化 = 機械適用は cycle-208 で既に撤回済の判断であり、本サイクルではその運用を継続する形（新規撤回ではない）。cycle-208 IME 観察結果と本サイクル T-4 観察結果を合わせて 2 件目の実証データを蓄積する
- **タイル / 詳細 ARIA 分裂の許容運用継続（件数表は T-2 セクション参照）**: 論点 4 採択案 b により、タイル `<button>` + `aria-pressed` と詳細 `role="radiogroup"` の分裂は既存 5 件（base64 / url-encode / html-entity / fullwidth-converter / kana-converter）+ 本サイクル line-break-remover 1 件 = **計 6 件**として運用。B-443 着手範囲はタイル aria-pressed 採用 7 件すべての ARIA 再検討（base64 / url-encode / html-entity / hash-generator / fullwidth-converter / kana-converter + 本サイクル line-break-remover）であり、**分裂解消対象は 6 件**（hash-generator は詳細・タイル両側で button トグル統一済 = 分裂なしのため統一作業対象外 / NIT-2 対応で件数表記の曖昧さを解消）

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
