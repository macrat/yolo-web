# A群（移行済み20本）作業手順テンプレート

cycle-225 / B-490 全本再構築フェーズで A群 builder が受け取る手順書。

**これは「何を満たすか」の手順であり、真似る見本ではない。**
他のツールの実装を参照・流用することは禁じる（cycle-220 破綻根因の再発防止）。

## 対象スラッグ（A群20本）

base64 / byte-counter / char-count / cron-parser / email-validator /
fullwidth-converter / hash-generator / html-entity / image-base64 /
image-resizer / kana-converter / keigo-reference / line-break-remover /
password-generator / qr-code / regex-tester / text-diff / text-replace /
traditional-color-palette / url-encode

---

## 着手前の必読ドキュメント

builder はこの手順書に加えて、以下3点を**着手前に必ず読む**。

1. `docs/cycle-225/convergence-checklist.md` — 自己検証チェックリスト（本手順の各工程と対応）
2. `docs/cycle-225/parallel-conflict-policy.md` — 編集許可範囲・共有ファイル不可触の運用ルール
3. `docs/cycle-225/T-4b-transform-copy-policy.md` — 変換系7本のコピーボタン方針（url-encode / base64 / html-entity / kana-converter / fullwidth-converter / line-break-remover / text-replace を担当する場合）

---

## 工程一覧

```
工程1: 現状把握
工程2: 単一実装の作り直し
工程3: page.tsx の描画差し替え
工程4: Component 削除
工程5: 当該ツール個別論点の解消
工程6: 回帰テスト新設
工程7: 自己検証
```

---

## 工程1: 現状把握

**目的**: 当該ツールが現在提供している全機能を把握する。

読むべきファイル:

- `src/tools/<slug>/Component.tsx` — ページが現在描画しているフル機能の実装
- `src/tools/<slug>/Component.module.css`（または同名の CSS ファイル）— Component 専用スタイル
- `src/app/(new)/tools/<slug>/page.tsx` — 現在の page.tsx が Component を描画していることを確認する

把握すべき内容:

- Component が持つすべての入力欄・オプション・モード切替・結果表示・エラー表示・ファイル操作・コピー機能
- Component が参照している `src/tools/<slug>/logic.ts`（変換・計算ロジック）の仕様
- Component 専用 CSS が定義しているスタイルのうち、共通トークンでは賄えない固有スタイル

**確認事項**: 工程2に進む前に、「このツールのフル機能はすべて把握できたか」を自問する。把握した機能リストを頭の中（または作業メモ）に持ってから次へ進む。

> 留意: 既存の簡素 `*Tile.tsx`（`src/tools/<slug>/<Name>Tile.tsx`）は**参照しない**。
> 簡素 Tile は kind=widget のタイルサイズ最適化版であり、Component のフル機能を持っていない（cycle-220 ②-4「機能劣後」の実体）。単一実装の起点は Component であり、簡素 Tile ではない。

---

## 工程2: 単一実装の作り直し

**目的**: Component のフル機能を、共通部品で組んだ単一実装（フル機能のページ本体）として作り直す。

**完了条件**: Component と同等以上の全機能を持つ単一実装が `src/tools/<slug>/` 直下に完成していること。

### 2-1. 共通部品の必須再利用

以下の共通部品を使うべき箇所があれば必ず使う。使わない場合はチェックリスト A 群の該当項目に「N/A・理由」を明記する（独自実装での代替は認めない）。

| 部品                 | import パス                             | 使うべき場面                                      |
| -------------------- | --------------------------------------- | ------------------------------------------------- |
| `Textarea`           | `@/components/Textarea`                 | テキスト入力欄・結果表示欄                        |
| `Select`             | `@/components/Select`                   | セレクトボックス                                  |
| `SegmentedControl`   | `@/components/SegmentedControl`         | モード切替・選択                                  |
| `ErrorMessage`       | `@/components/ErrorMessage`             | エラー表示                                        |
| `FileDropZone`       | `@/components/FileDropZone`             | ファイルのドロップ・選択（image 系など）          |
| `useCopyToClipboard` | `@/components/hooks/useCopyToClipboard` | コピーボタン（`COPIED_LABEL` も同モジュールから） |
| `Input` (type=date)  | `@/components/Input`                    | 日付入力                                          |
| `ToolPageLayout`     | `@/tools/_components/ToolPageLayout`    | ページ全体の器（`meta` + `children`）             |

詳細な props 仕様は `docs/cycle-225/convergence-checklist.md` の A 群表を参照。

### 2-2. DESIGN トークン準拠

実装する CSS は以下を満たすこと。

- `var(--color-*)` 系の旧トークンをゼロにする（`grep "var(--color-"` でヒットなし）
- フォーカス: `outline: 2px solid var(--accent); outline-offset: 2px;`（`outline: none` 禁止）
- 選択・ON 状態: `--bg-invert` / `--fg-invert` ペアを使う（`--accent` 直塗り禁止）
- `font-weight: 700` 禁止
- インタラクティブ要素の角丸: `var(--r-interactive)`（8px）、非インタラクティブ要素: `var(--r-normal)`（2px）
- ボタン以外の通常要素への `box-shadow` 追加禁止
- フォーム要素の境界線: `--border-strong`

トークン・指針の詳細は `/DESIGN.md` および `.claude/skills/frontend-design/SKILL.md` を参照。

### 2-3. アクセシビリティ（WCAG AA）

- `SegmentedControl` を使う箇所には必ず `aria-label` または `aria-labelledby` を渡す
- 出力結果欄に `role="status" aria-live="polite"` を付与する
- アイコンのみのボタンには `aria-label` を付与する
- `SegmentedControl` の初期 `value` を必ず `options` 配列内のいずれかに設定する（N-A2）
- キーボード操作（←→ で選択移動）が正常に動作することを確認する

### 2-4. B-489 キャリーオーバー nice-to-have 6件の取り込み

以下のうち当該ツールに該当する項目を取り込む。

- **N-A1**: FileDropZone 安静時ボーダーを `--border-strong` に統一（image 系2本）
- **N-A2**: SegmentedControl の初期 value を必ず options 内に（2-3 と同一条件）
- **N-A3**: FileDropZone dragLeave チラつきを relatedTarget 判定で解消
- **N-B1**: タイル下二次見出しの色トークン統一
- **N-B2**: 空 region の aria 整合
- **N-C1**: 実ツール組み込み文脈での WCAG AA コントラスト再確認

### 2-5. タイマーのライフサイクル管理

`setTimeout` / `setInterval` を使う箇所（コピー成功フィードバックの復元・hydration 対策・デバウンス等）では、必ず以下を守る（D-4 / AP-I11）。

- タイマー ID を `useRef` で保持する
- `useEffect` の cleanup 関数で `clearTimeout` / `clearInterval` を呼び解除する

チェックリスト参照だけでは見落とすため、実装時に明示的に確認する。password-generator の hydration・コピー成功表示等が典型的な該当箇所となる。

### 2-6. 機能劣後ゼロの確認

工程1で把握した「Component の全機能リスト」と作り直した単一実装を突き合わせ、1機能も欠落していないことを確認する。
欠落があれば実装を完成させてから次の工程に進む（機能劣後ゼロ＝完了条件の第1条件）。

---

## 工程3: page.tsx の描画差し替え

**目的**: `src/app/(new)/tools/<slug>/page.tsx` の children を、旧 Component から工程2で作った単一実装へ差し替える。

**満たすべき条件**:

- `page.tsx` が `Component` ではなく新しい単一実装を `import` して `ToolPageLayout` の `children` に渡している
- `ToolPageLayout` の使い方（`meta` prop の渡し方）はそのまま維持する
- `page.tsx` に Component の import が残っていない

**確認事項**: 差し替え後に `npm run build`（または `npm run dev` で当該ページ）が正常に動作することを確認する。

---

## 工程4: Component 削除

**目的**: 二重実装を解消する。

削除するファイル:

- `src/tools/<slug>/Component.tsx`
- `src/tools/<slug>/Component.module.css`（または Component 専用の CSS ファイル）

削除後の確認:

- 削除したファイルへの import が他ファイルに残っていないことを確認する（`grep "Component" src/tools/<slug>/` 等）
- `npm run build` が通ることを確認する（Component への import が残っているとビルドエラーになる）

**重要**: 以下には**一切触れない**。

- `src/tools/<slug>/<Name>Tile.tsx`（簡素 Tile）— 共有 `tile-declarations.ts` から参照されており、builder が削除するとビルド全体が破綻する。撤去は T-8（DELETION UNIT 一括）の責務であり、builder の責務ではない。
- `src/tools/_constants/tile-declarations.ts` — 共有ファイル。触らない。
- その他の共有ファイル（`parallel-conflict-policy.md` §2 参照）。

---

## 工程5: 当該ツール個別論点の解消

**目的**: `docs/cycles/cycle-225.md` の「ツール個別に内包する論点」リストから、担当スラッグの項目をすべて解消する。

個別論点の一覧は `docs/cycles/cycle-225.md` §「1ツール再構築の完了条件」内の「ツール個別に内包する論点」を参照。以下に主な内容を抜粋する。

| ツール                                                                                                                    | 解消すべき論点（抜粋）                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| image-base64                                                                                                              | サイズ情報・プレビュー復元（①-10）、Base64→画像デコード機能のフル復元（②-4 致命 / B-457 内包）、FileDropZone                                                             |
| cron-parser                                                                                                               | ビルダー復元（②-4 致命）、JST 固定化（B-472 内包）、コピーボタン削除（②-15）                                                                                             |
| char-count / byte-counter                                                                                                 | フル統計復元、B-485 継承、2ツール維持（①-19）、空状態（①-13）                                                                                                            |
| text-diff                                                                                                                 | 件数・ラベル一致（①-2）、空入力「差分なし」誤表示解消（①-12）、コピー削除（②-15）                                                                                        |
| email-validator                                                                                                           | 緑「有効」とタイポ提案の矛盾シグナル解消（①-4）、コピー削除（②-15）                                                                                                      |
| image-resizer                                                                                                             | GIF 誤誘導・アニメ無言消失の解消（①-5）                                                                                                                                  |
| password-generator                                                                                                        | 強度バー動的化（①-6）、hydration（①-15 / B-469）、チェックボックス→トグル（②-11）                                                                                        |
| base64                                                                                                                    | URL-safe Base64 対応（①-7）                                                                                                                                              |
| html-entity                                                                                                               | decode 取りこぼし・encode/decode 非対称解消（①-8）                                                                                                                       |
| qr-code                                                                                                                   | エラー処理の日本語フォールバック統一（①-9・ErrorMessage 経由）                                                                                                           |
| fullwidth-converter                                                                                                       | 全 ON 固定→オプション提供（①-11）、空状態（①-13）                                                                                                                        |
| regex-tester                                                                                                              | 既定空状態解消（①-14）、`outline:none` 解消（②-9）、置換機能復元（②-4）、コピー削除（②-15）                                                                              |
| text-replace                                                                                                              | 正規表現復元（②-4）、空状態（①-13）、placeholder 仕様詰め込み解消（①-20）、省略オプションのタイル提供（③-6(1)）                                                          |
| traditional-color-palette                                                                                                 | 規定外 box-shadow 是正（②-13）、コピー削除（②-15）                                                                                                                       |
| keigo-reference                                                                                                           | コピー削除（②-15）                                                                                                                                                       |
| 変換系7本（url-encode / base64 / html-entity / kana-converter / fullwidth-converter / line-break-remover / text-replace） | 手動「変換」ボタン→リアルタイム化（①-21）、該当箇所トグル化（②-11）、**コピーボタンは `docs/cycle-225/T-4b-transform-copy-policy.md` の方針に従う（全本コピーあり）**    |
| 全ツール横断                                                                                                              | ARIA 操作モデル統一（radiogroup・矢印キー・①-18 / B-443）、結果欄 opacity:0 の予告ヒント（①-13）、横断タイポ（textarea line-height・数値 font-weight・小フォント＝②-13） |

**確認事項**: 担当スラッグの行を `cycle-225.md` の原文で確認し、すべての論点が単一実装に反映されていることを自己評価してから次の工程に進む。

---

## 工程6: 回帰テスト新設

**目的**: 単一実装の品質を長期的に保証する回帰テストを `src/tools/<slug>/__tests__/` に作成する。

テストは `docs/cycle-225/convergence-checklist.md` の **E 群（E-1〜E-12）** の観点を網羅する。
以下に観点を列挙する（詳細は収束チェックリスト E 群を参照）。

| 項目 | 観点                                                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| E-1  | 基本レンダリング: コンポーネントが正常にレンダリングされること                                                                          |
| E-2  | 入力→結果更新: 入力値の変化で結果が正しく更新されること                                                                                 |
| E-3  | 空入力: 空・未入力初期状態の挙動（エラー非表示・空結果・予告ヒント等）                                                                  |
| E-4  | 変換ロジックの正確性: 代表的な入力値で期待する出力が得られること（UI 経由で確認）                                                       |
| E-5  | ARIA: role・aria-\* 属性が正しく付与されていること（特に role="status" / aria-live="polite"・SegmentedControl の role="radiogroup"）    |
| E-6  | コピー文言変化: コピーボタンがある場合、コピー前と COPIED_LABEL 表示中で文言が切り替わること                                            |
| E-7  | コピー disabled 状態: 結果が空のときコピーボタンが disabled になること（該当ツールのみ）                                                |
| E-8  | clipboard 不在時の silent fail: navigator.clipboard が存在しない環境でも例外を投げないこと                                              |
| E-9  | 詳細リンク: 詳細ページへのリンクが正しく描画されること（該当ツールのみ）                                                                |
| E-10 | meta 由来の表示: meta.name 等から派生する表示が正しく描画されること                                                                     |
| E-11 | 既存の logic.ts テスト PASS 維持: 変換ロジックを変更した場合は修正済みテストも PASS すること                                            |
| E-12 | CSS トークン検証: `--color-*` 旧トークン・`--accent` 直塗り・`font-weight: 700` が CSS に存在しないことを `readFileSync` で確認すること |

**既存テストとの関係**:

- `src/tools/<slug>/__tests__/` に既存の `logic.test.ts` 等がある場合、それらを消さず PASS を維持する
- 簡素 Tile のテスト（`<Name>Tile.test.tsx`）には触れない（工程4と同じ理由）

---

## 工程7: 自己検証

**目的**: `docs/cycle-225/convergence-checklist.md` の全項目を満たすことを確認し、成果物を reviewer に提出する。

### 7-1. チェックリスト全項目の確認

`convergence-checklist.md` を開き、A 群〜F 群の全項目を順に確認する。

- **A 群（土台の必須再利用）**: A-1〜A-8。該当しない項目は「N/A・理由」を明記
- **B 群（DESIGN トークン準拠）**: B-1〜B-8。全項目 Yes
- **C 群（WCAG AA / アクセシビリティ）**: C-1〜C-7。全項目 Yes
- **D 群（構造）**: D-1〜D-4。全項目 Yes（特に D-1: 描画差し替え済み・D-2: Component 削除済み・D-3: 共有ファイル無編集を確認）
- **E 群（回帰テスト）**: E-1〜E-12。全項目 Yes または「N/A・理由」を明記
- **F 群（独立評価設問・必須記述）**: F-1・F-2 に builder 自身の言葉で実質的な記述をする

### 7-2. F-1・F-2 の必須記述

**F-1「このツールのフル機能はタイルに収まるか」** と **F-2「このツール固有の最難所と実装方針」** は「はい」で機械的に埋めることを禁じる。

- F-1: このツールの全機能を列挙したうえで、1ページの単一実装として提供できるかを独立に評価し、収まる/収まらない・理由・（収まらない場合）解決策を記述する
- F-2: このツール固有の実装上の難所を1つ以上、自分の言葉で挙げ、実装方針を具体的に記述する。他ツールからの転用禁止

reviewer はこれらの記述の実質性を確認し、定型文・コピー&ペーストと判断した場合は差し戻す。

### 7-3. 自動チェックの実行

```
npm run lint
npm run format:check
npm run test
npm run build
```

すべて通ることを確認する。FAIL があれば修正してから reviewer に提出する。

### 7-4. 成果物の提出

以下をまとめて reviewer に提出する。

1. 変更ファイル一覧（追加・変更・削除したファイル）
2. 収束チェックリスト申告（A〜E 群の各項目、F-1・F-2 の実質記述）
3. 個別論点の解消状況（工程5で解消した論点と対応するコードの説明）
4. 自動チェック（lint / format / test / build）の PASS 確認

---

## 禁止事項（まとめ）

builder は以下を行ってはならない。

| 禁止操作                                                              | 理由                                                                                                  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 簡素 `*Tile.tsx` の編集・削除                                         | 共有 `tile-declarations.ts` と相互依存しており、並列削除するとビルド全体が破綻する。撤去は T-8 の責務 |
| `src/tools/_constants/tile-declarations.ts` の編集                    | 共有ファイル。並列で編集すると即衝突（AP-WF13）                                                       |
| `src/tools/generated/tools-registry.ts`・`tiles-registry.ts` の手編集 | codegen 生成物。手編集禁止                                                                            |
| `src/app/(new)/internal/tiles/**` の編集                              | T-8 の DELETION UNIT 対象                                                                             |
| `src/app/sitemap.ts`・`src/app/globals.css`・`/DESIGN.md` の編集      | 共有ファイル                                                                                          |
| 他スラッグのディレクトリの編集                                        | AP-WF13（builder のスコープ越境抑止）                                                                 |
| 他ツールの実装を参照・流用                                            | cycle-220 破綻根因（独立評価の省略）の再発防止                                                        |

詳細は `docs/cycle-225/parallel-conflict-policy.md` を参照。

---

## 参照ドキュメント

- `docs/cycle-225/convergence-checklist.md` — 自己検証チェックリスト（本手順の各工程と対応）
- `docs/cycle-225/parallel-conflict-policy.md` — 編集許可範囲・共有ファイル不可触
- `docs/cycle-225/T-4b-transform-copy-policy.md` — 変換系7本のコピーボタン方針
- `docs/cycles/cycle-225.md` §「1ツール再構築の完了条件」— 完了条件の5条件・個別論点一覧
- `/DESIGN.md` — デザイントークン・指針の SSoT
- `.claude/skills/frontend-design/SKILL.md` — フロントエンドデザインスキル
