# B群 再構築作業手順テンプレート（未移行14本）

cycle-225 / B-490 で B群（未移行14本）の各 builder が受け取る手順書。  
「真似る見本（基準実装）」ではなく「**何を満たすか**」の手順書である。

---

## 対象スラッグ一覧（B群14本）

age-calculator / bmi-calculator / business-email / color-converter / csv-converter /
date-calculator / dummy-text / json-formatter / markdown-preview / number-base-converter /
sql-formatter / unit-converter / unix-timestamp / yaml-formatter

各 builder は自分が担当する **1スラッグのみ** を対象にこの手順を実施する。

---

## B群の前提（実機確認済み）

- `src/app/(legacy)/tools/<slug>/` のみが実在し、旧 `ToolLayout`（legacy 側の layout.tsx が提供）を使用している。
- `(new)/tools/<slug>/` は存在しない（移行未着手）。
- `*Tile.tsx` は存在しない（タイル化未着手）。
- 各 `(legacy)/tools/<slug>/` には `page.tsx`・`opengraph-image.tsx`・`twitter-image.tsx` の3ファイルが存在する。
- `src/tools/<slug>/` には `meta.ts`・`Component.tsx`（フル実装）・`logic.ts`（任意）・Component 専用 CSS・`__tests__/` が存在する。
- tools レジストリ（`src/tools/generated/tools-registry.ts`）には B群14本がすでに登録済み。

---

## 着手前の必読ドキュメント

以下を着手前に必ず読むこと。

| ドキュメント                                               | 読む目的                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `docs/cycle-225/convergence-checklist.md`                  | 完了条件の全項目（A〜F）。本手順書と併用して自己検証に使う |
| `docs/cycle-225/parallel-conflict-policy.md`               | 編集許可範囲・禁止操作・git mv の作法                      |
| `DESIGN.md`                                                | デザイントークン・角丸・影・フォーカス・カラーシステム     |
| `.claude/skills/frontend-design/SKILL.md`                  | DESIGN.md の実装ガイド                                     |
| `docs/design-migration-plan.md` §「1ページ移行の標準手順」 | step1〜10 の全体像                                         |

---

## 工程一覧

```
工程1: 現状把握
工程2: ディレクトリの git mv（(legacy)→(new)）
工程3: 旧 ToolLayout import を ToolPageLayout に差し替える
工程4: 単一実装（フル機能のページ本体）をゼロから構築する
工程5: Component.tsx と Component 専用 CSS を削除する
工程6: 当該ツール個別論点の解消
工程7: 回帰テストの新設
工程8: 自己検証（収束チェックリスト全項目の確認）
```

---

## 各工程の詳細

### 工程1: 現状把握

当該ツールの実装を隅々まで読み、フル機能を把握する。

**読む対象ファイル:**

- `src/app/(legacy)/tools/<slug>/page.tsx` — 現在のページ構成。旧 ToolLayout の使い方を確認
- `src/tools/<slug>/Component.tsx` — フル機能の実装本体。**これが工程4で単一実装に移植すべき機能の源泉**
- `src/tools/<slug>/` の Component 専用 CSS — 旧トークンや旧スタイルのパターンを把握
- `src/tools/<slug>/logic.ts`（存在する場合）— 変換ロジック。工程4でそのまま再利用する
- `src/tools/<slug>/meta.ts` — ツール名・説明・メタ情報

**把握すべき観点:**

- Component.tsx が持つ **全機能の列挙**（入力・オプション・変換・コピー・エラー表示・ファイル操作等）
- 当該スラッグのコピーボタン可否は `docs/cycle-225/T-4b-transform-copy-policy.md` の B群14本確定表で確認する（工程4で機械適用する）
- cycle-225.md の「ツール個別論点」リストに当該 slug の論点があれば、その内容を読む

> この工程の成果物は文書やコードではなく、builder 自身の頭の中にある「このツールのフル機能の全体像」と「工程4での実装方針」である。

---

### 工程2: ディレクトリの git mv（(legacy)→(new)）

自スラッグのディレクトリを `git mv` でディレクトリごと移動する。

```
git mv src/app/(legacy)/tools/<slug> src/app/(new)/tools/<slug>
```

**必須の確認事項:**

- `opengraph-image.tsx` と `twitter-image.tsx` を含む**ディレクトリごと**移動すること。3ファイルが揃って移動されていることを確認する
- **自スラッグのみ**を mv する。他スラッグの mv は絶対に行わない（AP-WF13・parallel-conflict-policy.md §5）
- `(legacy)/tools/` の **他スラッグのディレクトリは一切触らない**

**A群の (legacy)/tools/<slug>/ 残骸について:**  
A群12本の `(legacy)/tools/<slug>/` は空ディレクトリ（ファイルゼロ・git 追跡外の残骸）として存在する。本サイクルでは放置してよい。最終撤去は Phase 11/B-337 の領分。

---

### 工程3: 旧 ToolLayout import を ToolPageLayout に差し替える

移動した `src/app/(new)/tools/<slug>/page.tsx` を開き、ページの器を新しい共通部品に切り替える。

**実施する置換:**

| 置換前                                                                 | 置換後                                                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/app/(legacy)/tools/layout.tsx`（または旧 ToolLayout）が提供する器 | `ToolPageLayout`（`@/tools/_components/ToolPageLayout`）を import して `<ToolPageLayout meta={meta}>` で使う |
| `@/components/common/*` の import                                      | `@/components/*` に置換（標準手順 step3 相当）                                                               |
| CSS Module 内の `--color-*` 旧トークン                                 | `--bg` / `--fg` / `--accent` 系トークンに置換（標準手順 step4 相当）                                         |

**ToolPageLayout の使い方（実機確認済みの API）:**

- import パス: `@/tools/_components/ToolPageLayout`
- 必須 props: `meta`（`ToolMeta` 型）と `children`（`React.ReactNode`）
- `meta` は `src/tools/<slug>/meta.ts` からエクスポートされた値をそのまま渡す

**注意:**  
この工程でのページの描画内容は既存の Component のままでよい。まだ単一実装は存在しない。工程4で作る。

---

### 工程4: 単一実装（フル機能のページ本体）をゼロから構築する

当該ツールのフル機能を、共通部品で組んだ**単一の実装**として新規に書き起こす。  
既存の Component.tsx を「参照して機能を把握する素材」として使い、そのままコピーしない。  
**新しく書く。ゼロ構築。**

**完了条件（この工程の成果として満たすべき状態）:**

- Component.tsx が持つ全機能（工程1で把握した機能リスト）が単一実装に含まれている（機能劣後ゼロ）
- 共通部品8種（下表）のうち、このツールで必要なものをすべて使っている
- `page.tsx` が、作成した単一実装を描画するように差し替えられている（確定提示方式）

**共通部品8種（必須再利用・import パス一覧）:**

| 部品                 | import パス                             | 主な用途               |
| -------------------- | --------------------------------------- | ---------------------- |
| `Textarea`           | `@/components/Textarea`                 | テキスト入力・出力欄   |
| `Select`             | `@/components/Select`                   | セレクトボックス       |
| `SegmentedControl`   | `@/components/SegmentedControl`         | モード切替・選択       |
| `ErrorMessage`       | `@/components/ErrorMessage`             | エラー表示             |
| `FileDropZone`       | `@/components/FileDropZone`             | ファイルドロップ・選択 |
| `useCopyToClipboard` | `@/components/hooks/useCopyToClipboard` | クリップボードコピー   |
| `Input`（type=date） | `@/components/Input`                    | 日付入力               |
| `ToolPageLayout`     | `@/tools/_components/ToolPageLayout`    | ページ全体の器         |

> 前者7種は `src/components/` 配下、`ToolPageLayout` は `src/tools/_components/` 配下。

**DESIGN.md 準拠の要点（実装時に必ず守ること）:**

- フォーム要素の境界線: `--border-strong`
- インタラクティブ要素の角丸: `--r-interactive`（8px）
- 非インタラクティブ要素の角丸: `--r-normal`（2px）
- フォーカス: `outline: 2px solid var(--accent); outline-offset: 2px;`（`outline: none` は禁止）
- 選択状態の塗り: `--bg-invert` / `--fg-invert` ペア（`--accent` 直塗り禁止）
- `font-weight: 700` 禁止
- 通常の要素への `box-shadow` 禁止

**確定提示方式（cycle-220.md L236）:**  
ページを開いた瞬間に入力欄が見えてすぐ使い始められる設計。長い解説・FAQ・SEO テキストはタイルより下に二次的に置く（タイルより前に配置しない）。道具箱導線は Phase 10 で追加するため本サイクルでは作らない。

**コピーボタンの扱い:**  
`docs/cycle-225/T-4b-transform-copy-policy.md` の「確定（B群14本）」表を**機械適用する**。builder が自己判断する余地はない（cycle-220 ②-16「個別判断任せ＝ばらつき」の再生産を防ぐため）。確定は以下のとおり。

| コピーあり（9本）                                                                                                                                        | コピーなし（5本）                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| business-email / color-converter / csv-converter / dummy-text / json-formatter / number-base-converter / sql-formatter / unix-timestamp / yaml-formatter | age-calculator / bmi-calculator / date-calculator / markdown-preview / unit-converter |

実装上の取り決め（T-4b 記載どおり）: `useCopyToClipboard`（`@/components/hooks/useCopyToClipboard.ts`）+ `COPIED_LABEL`「コピーしました」を使う。独自実装しない。出力が空のときはコピーボタンを `disabled` にする。

**SegmentedControl を使う場合の必須事項:**

- `aria-label` または `aria-labelledby` を必ず渡す（どちらか一方が必須）
- 初期 `value` は必ず `options` 配列内のいずれかの値にする（N-A2）
- キーボード操作（←→ で移動・端で折り返し）が動作すること（B-442/B-443/B-445）

**出力欄の ARIA:**  
動的に変化する結果欄には `role="status" aria-live="polite"` を付与する（スクリーンリーダーへの動的通知）。

---

### 工程5: Component.tsx と Component 専用 CSS を削除する

単一実装の構築が完了したら、旧 Component を削除して実装を1つに絞る。

**削除対象:**

- `src/tools/<slug>/Component.tsx`
- `src/tools/<slug>/Component.module.css`（または `src/tools/<slug>/` 内の Component 専用 CSS ファイル）

**削除前に確認すること:**

- `page.tsx` の描画対象が、削除する Component ではなく工程4で作った単一実装に差し替わっていること（D-1）
- logic.ts やその他のファイルを単一実装から正しく参照できていること

**削除してはいけないもの:**

- `src/tools/<slug>/logic.ts`（ロジックは再利用する）
- `src/tools/<slug>/meta.ts`
- `src/tools/<slug>/__tests__/` 配下（既存テストは維持・工程7で新設する）
- `src/app/(new)/tools/<slug>/opengraph-image.tsx`
- `src/app/(new)/tools/<slug>/twitter-image.tsx`

---

### 工程6: 当該ツール個別論点の解消

`docs/cycles/cycle-225.md` §「ツール個別に内包する論点」に当該 slug が挙げられている場合、その論点をこの工程で解消する。

**B群14本の主な個別論点（例示。実際は cycle-225.md を読んで確認すること）:**

- 変換系（csv-converter / json-formatter / yaml-formatter / sql-formatter 等）: T-4b の「確定（B群14本）」表どおりにコピーボタンを実装（工程4で既に適用済みのはず）
- 全ツール横断論点（すべての builder が対象）:
  - ARIA 操作モデル統一（radiogroup・矢印キー）
  - 結果欄 opacity:0 の予告ヒント（空入力時に入力を促す表示）
  - ソースの社内プロセスログ除去（ゼロ構築で自動的に解消される）

論点に自分のスラッグが含まれていない場合も、全ツール横断論点は必ず確認すること。

---

### 工程7: 回帰テストの新設

`src/tools/<slug>/__tests__/` に回帰テストを作成する。

**テストを新設・更新する際の方針:**

- 既存の `logic.ts` テストが存在する場合は、そのテストが引き続き PASS することを確認する（変換ロジックを変更した場合は修正済みテストも PASS させる）
- 以下の観点を網羅したテストを `src/tools/<slug>/__tests__/` に作成する

**新設する回帰テストの観点（収束チェックリスト E群 E-1〜E-12 に対応）:**

| 観点                               | 内容                                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| E-1 基本レンダリング               | コンポーネントが正常にレンダリングされること                                                                   |
| E-2 入力→結果更新                  | 入力値が変化したとき結果が正しく更新されること                                                                 |
| E-3 空入力                         | 入力が空のときの挙動（エラー非表示・空結果・opacity:0 の予告ヒント等）                                         |
| E-4 変換ロジックの正確性           | 代表的な入力値で期待する出力が得られること                                                                     |
| E-5 ARIA                           | role・aria-\* 属性が正しく付与されていること                                                                   |
| E-6 コピー文言変化                 | コピーボタンがある場合、コピー前と COPIED_LABEL 表示中で文言が切り替わること                                   |
| E-7 コピー disabled 状態           | 結果が空のときコピーボタンが disabled になること（コピーボタンがある場合）                                     |
| E-8 clipboard 不在時の silent fail | `navigator.clipboard` が存在しない環境でコピーが失敗しても例外を投げないこと                                   |
| E-9 詳細リンク                     | 詳細ページへのリンクが正しく描画されること（該当ツールにある場合）                                             |
| E-10 meta 由来の表示               | meta.name 等から派生する表示が正しく描画されていること                                                         |
| E-11 既存 logic.ts テスト          | 既存テストが引き続き PASS すること                                                                             |
| E-12 CSS トークン検証              | `--color-*` 旧トークン・`--accent` 直塗り・`font-weight: 700` が CSS に存在しないこと（readFileSync パターン） |

> 該当しない観点（例: コピーボタンがないツールの E-6〜E-8）は「N/A・理由」を添えてスキップしてよい。

**テストフレームワーク:**

- Vitest + Testing Library（既存テストと同じスタック）
- 既存の `src/tools/<slug>/__tests__/` 内のパターンを参考にする

---

### 工程8: 自己検証（収束チェックリスト全項目の確認）

`docs/cycle-225/convergence-checklist.md` の全項目（A〜F）を builder 自身が確認する。

**確認の手順:**

1. チェックリスト A〜E の各項目を逐条確認する
2. **F-1「このツールのフル機能はタイルに収まるか」** を builder 自身の言葉で実質的に記述する。「はい」だけで埋めることは禁じられている
3. **F-2「このツール固有の最難所と実装方針」** を builder 自身の言葉で実質的に記述する。他ツールの転用は禁じられている
4. チェックリスト末尾の「申告」フォーマットに全項目の結果を記載し、成果物に添付して reviewer に提出する

**reviewer が特に確認する箇所:**

- F-1・F-2 の記述が実質的か（定型文・コピー&ペーストでないか）
- D-1「page.tsx の描画対象が単一実装に差し替わっているか」
- D-2「Component.tsx と Component 専用 CSS が削除されているか」
- D-3「共有ファイルを編集していないか」

---

## 絶対に触らない共有ファイル（並列衝突回避）

以下のファイルは **一切編集しない**。詳細は `docs/cycle-225/parallel-conflict-policy.md` §2 を参照。

| 禁止ファイル                                | 理由                                                                |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `src/tools/_constants/tile-declarations.ts` | 簡素 \*Tile.tsx 20本を一括 import する SSoT。並列で編集すると即衝突 |
| `src/tools/registry.ts`                     | codegen 生成物への thin re-export。手編集禁止                       |
| `src/tools/generated/tools-registry.ts`     | codegen 生成物。prebuild で自動再生成される                         |
| `src/tools/generated/tiles-registry.ts`     | codegen 生成物。手編集禁止                                          |
| `src/app/(new)/internal/tiles/**`           | tile-declarations.ts に依存するプレビュールート                     |
| `src/app/sitemap.ts`                        | tools レジストリに依存。個別ツール作業では不変                      |
| `src/app/globals.css`                       | サイト全体のグローバルスタイル                                      |
| `/DESIGN.md`                                | デザイントークン・指針の SSoT（読む専用）                           |

**B群は `tile-declarations.ts` に新規宣言を追加しない。**  
kind 機構は T-8（直列後段）で一括撤去されるため、本サイクル並列フェーズで宣言を追加しても撤去対象が増えるだけで意味がない。

---

## 編集してよいディレクトリ（自ツールディレクトリ完結）

| 対象                              | パス                                                   |
| --------------------------------- | ------------------------------------------------------ |
| ツールロジック・Component・テスト | `src/tools/<slug>/`（Component.tsx・CSS の削除を含む） |
| 移動後のページ                    | `src/app/(new)/tools/<slug>/`（git mv 後の移動先）     |
| 移動元（git mv 実行時のみ）       | `src/app/(legacy)/tools/<slug>/`（自スラッグのみ）     |

---

## tools レジストリは手編集不要

B群14本はすでに `src/tools/generated/tools-registry.ts` に登録済み。  
`git mv` 後も、次回 `predev`/`prebuild`/`pretest` の実行時に codegen が自動再生成するため、レジストリを手編集する必要はない。

---

## B群に `*Tile.tsx` は存在しない（タイル宣言の追加も不要）

B群は A群と異なり、`*Tile.tsx` が最初から存在しない。  
工程4で構築する「単一実装（フル機能のページ本体）」が、そのままタイル機能を兼ねる。  
`tile-declarations.ts` に新規宣言を追加する必要も、追加してはいけない（上記参照）。

---

## この手順を完了するとできる状態

- `src/app/(new)/tools/<slug>/page.tsx` が存在し、`ToolPageLayout` を使い、単一実装（フル機能のページ本体）を描画している
- `src/app/(new)/tools/<slug>/opengraph-image.tsx` と `twitter-image.tsx` が存在する
- `src/app/(legacy)/tools/<slug>/` が存在しない（git mv で移動済み）
- `src/tools/<slug>/Component.tsx` と Component 専用 CSS が存在しない（削除済み）
- `src/tools/<slug>/__tests__/` に回帰テストが存在し、全テストが PASS する
- 収束チェックリスト全項目（A〜F）を満たし、F-1・F-2 の記述が成果物に添付されている

---

## 参照先

- `docs/cycle-225/convergence-checklist.md` — 自己検証チェックリスト（A〜F）
- `docs/cycle-225/parallel-conflict-policy.md` — 編集許可範囲・禁止操作
- `docs/cycle-225/T-4b-transform-copy-policy.md` — 変換系コピーボタン方針
- `docs/cycles/cycle-225.md` — サイクル全体の計画・個別論点リスト・完了条件
- `DESIGN.md` — デザイントークン・実装指針
- `.claude/skills/frontend-design/SKILL.md` — DESIGN.md の実装ガイド
- `docs/design-migration-plan.md` §「1ページ移行の標準手順」— step1〜10 の全体像（Phase 8: step7 がタイル対応）
