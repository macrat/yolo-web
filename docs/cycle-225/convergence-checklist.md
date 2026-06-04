# 1ツール再構築の収束チェックリスト（builder 同梱版）

> **使い方の注意（必読）**
>
> これは**見本ではなくチェックリスト**である。
> 他のツールの実装を真似てはならない。各ツールは独立に評価する。
>
> cycle-220 の破綻根因は「最初の1つの誤った前提が独立評価を省略したまま19件へ無批判に伝播した」ことであり、
> 本チェックリストはその再発を防ぐために設計されている。
> 各項目を機械的に「はい」で埋めることは厳に禁じる。
> reviewer は各記述の実質性を確認する。

---

## A. 土台の必須再利用

以下の8種の共通部品を、該当するすべての箇所で使っているか。

**import パス（実ソース確認済み）:**

| 部品                 | import パス                             | 主要 props                                                                                              |
| -------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Textarea`           | `@/components/Textarea`                 | `variant?: "default" \| "mono"`, `readOnly`, `rows`, `value`, `onChange`                                |
| `Select`             | `@/components/Select`                   | `value`, `onChange`, `children`（`<option>` を渡す）                                                    |
| `SegmentedControl`   | `@/components/SegmentedControl`         | `options: {label, value}[]`, `value`, `onChange`, `aria-label` または `aria-labelledby`（どちらか必須） |
| `ErrorMessage`       | `@/components/ErrorMessage`             | `message?: string`, `children?: ReactNode`（両方省略時は日本語フォールバック表示）                      |
| `FileDropZone`       | `@/components/FileDropZone`             | `onFileSelect`, `maxSizeBytes?`, `onError?`, `accept?`, `description?`, `ariaLabel?`                    |
| `useCopyToClipboard` | `@/components/hooks/useCopyToClipboard` | 戻り値: `{ copy, copiedKey }`。`COPIED_LABEL` も同モジュールからエクスポート                            |
| `Input` (type=date)  | `@/components/Input`                    | `type="date"`, `error?: boolean`, 標準 input 属性を透過                                                 |
| `ToolPageLayout`     | `@/tools/_components/ToolPageLayout`    | `meta: ToolMeta`, `children: React.ReactNode`                                                           |

前者7種は `src/components/` 配下、`ToolPageLayout` は `src/tools/_components/` 配下。

- [ ] A-1: このツールで**テキスト入力欄**が必要な箇所に `Textarea`（`@/components/Textarea`）を使っているか。
- [ ] A-2: このツールで**セレクトボックス**が必要な箇所に `Select`（`@/components/Select`）を使っているか。
- [ ] A-3: このツールで**モード切替・選択**が必要な箇所に `SegmentedControl`（`@/components/SegmentedControl`）を使っているか。旧 `role="group"` + `aria-pressed` パターンが残っていないか。
- [ ] A-4: このツールで**エラー表示**が必要な箇所に `ErrorMessage`（`@/components/ErrorMessage`）を使っているか。英語の生エラー文字列を直接 `<p>` 等で露出していないか。**`ErrorMessage` に渡す `message` は必ず日本語であること**。`JSON.parse`・`RegExp`・各種 API が返す英語の例外メッセージをそのまま渡さず、日本語メッセージに変換してから渡すこと（`ErrorMessage` の既定フォールバックは `message` 未指定時のみ適用されるため、`message` を渡す場合は必ず日本語化する）。
- [ ] A-5: このツールで**ファイルのドロップ・選択**が必要な箇所（image 系など）に `FileDropZone`（`@/components/FileDropZone`）を使っているか。
- [ ] A-6: このツールで**クリップボードコピー**が必要な場合、`useCopyToClipboard` フック（`@/components/hooks/useCopyToClipboard`）を使い、コピー成功時の表示文言に `COPIED_LABEL`（同モジュールからエクスポート）を使っているか。
- [ ] A-7: このツールで**日付入力**が必要な箇所に `Input`（`@/components/Input`、`type="date"`）を使っているか。
- [ ] A-8: `ToolPageLayout`（`@/tools/_components/ToolPageLayout`）を `meta` prop と `children` で使い、ページ全体の器としているか。

---

## B. DESIGN トークン準拠

- [ ] B-1: このツールの CSS ファイル全体で `var(--color-*)` 系の旧トークンが**ゼロ**か（`grep "var(--color-"` でヒットなし）。
- [ ] B-2: フォーカス状態のスタイルが `outline: 2px solid var(--accent); outline-offset: 2px;` になっているか（`outline: none` が残っていないか）。
- [ ] B-3: 選択状態・ON 状態の塗りに `--accent` を**直接**使っていないか（`--bg-invert` / `--fg-invert` ペアで代替しているか）。
- [ ] B-4: CSS に `font-weight: 700` が存在しないか。
- [ ] B-5: インタラクティブ要素（ボタン・入力欄・セレクト等）に `border-radius: var(--r-interactive)`（8px）、非インタラクティブ要素に `border-radius: var(--r-normal)`（2px）を使っているか。
- [ ] B-6: 通常の要素（ボタン以外）に `box-shadow` を追加していないか（DESIGN.md §4「通常の要素にはエレベーションを使わない」）。
- [ ] B-7: フォーム要素の境界線に `--border-strong` を使っているか（`--border` ではなく）。
- [ ] B-8: DESIGN.md と `.claude/skills/frontend-design/SKILL.md` で定義された色トークン以外の色（ハードコードの色値・CSS 変数名不明の値等）を使っていないか。

---

## C. WCAG AA / アクセシビリティ

- [ ] C-1: 操作要素のタッチターゲット高さが**共通部品の規定サイズをそのまま維持しているか**（Button/Input/Select は min-height:44px・WCAG 2.5.5 AAA 推奨値、SegmentedControl は min-height:36px・B-489 出荷済み規定値）。共通部品を使っていれば個別確認は不要。やむを得ず操作要素を新規自作する場合も**共通部品の出荷済み最小値（現状 36px）を下回らない**こととし、WCAG 根拠は AA=2.5.8（最小24px）／AAA=2.5.5（44px 推奨）のみを引く。SegmentedControl の 36px は規定値であり builder が「不合格」と判定すべき対象ではない。
- [ ] C-2: `SegmentedControl` を使う箇所で `aria-label` または `aria-labelledby` を渡しているか（どちらか一方が必須）。
- [ ] C-3: 出力結果を表示する欄に `role="status" aria-live="polite"` が付与されているか（スクリーンリーダーへの動的通知）。**ライブリージョンには実テキストノードのサマリ**（例: 「整形しました」「3件マッチ」「正しいJSONです」）を入れること。`readOnly` な `<textarea>` 等のフォーム要素を `role="status"` でラップするだけでは、フォーム値の変化はスクリーンリーダーに読み上げられないため不可。出力が `textarea` の場合は、別途短いサマリのテキストノードをライブリージョンに置くか（`<div role="status" aria-live="polite">{summaryText}</div>`）、`textarea` をライブリージョンの外に出してサマリで通知する設計にすること。正しい実装例: regex-tester（マッチ件数サマリを `div[role=status]` に実テキストで配置）・unit-converter（`span`/`h2` を `role="status"` 内に配置し `aria-atomic` 併用）。
- [ ] C-4: アイコンのみのボタン（ラベルテキストのないボタン）に `aria-label` を付与しているか。
- [ ] C-5: `SegmentedControl` の初期 `value` が必ず `options` 配列内のいずれかの値になっているか（N-A2: `value` が `options` に存在しない場合、どの項目も選択されていない状態が生まれる）。
- [ ] C-6: 実際の組み込み文脈（ページとして開いた状態）で WCAG AA のコントラスト比を確認したか（N-C1: 孤立したコンポーネント単体で OK でも、背景との組み合わせで不合格になることがある）。
- [ ] C-7: `SegmentedControl` のキーボード操作（←→↑↓ で移動、端で折り返し）が正常に動作するか（B-442/B-443/B-445 の矢印キー操作要件）。

---

## D. 構造（最重要）

- [ ] D-1: `page.tsx` の描画対象が旧 `Component`（または旧 `*Tile`）から**新しい単一実装（フル機能のページ本体）**に差し替わっているか。
- [ ] D-2: `Component.tsx` と Component 専用 CSS ファイル（`Component.module.css` 等）が**削除されているか**（二重実装ゼロ）。

> **重要**: 簡素 `*Tile.tsx`（A群の旧 kind=widget タイル）には触れないこと。並列フェーズ中は共有 `tile-declarations.ts` から参照され続けているため、builder が個別に削除するとビルドが壊れる。簡素 `*Tile.tsx` の撤去は T-8（直列後段・一括）の責務であり、builder の責務ではない。

- [ ] D-3: `globals.css`・`tile-declarations.ts`・`tiles-registry.ts`・`sitemap.ts`・`internal/tiles` 以下のファイルなど、**自ツールのディレクトリ外の共有ファイルを編集していないか**（並列衝突回避・AP-WF13）。
- [ ] D-4: `setTimeout` / `setInterval` を使っている箇所で、タイマー ID を `useRef` で保持し、`useEffect` の cleanup 関数で `clearTimeout` / `clearInterval` しているか（AP-I11）。

---

## E. 回帰テスト

以下の観点を網羅した回帰テストが `__tests__/` に存在するか。

- [ ] E-1: **基本レンダリング**：コンポーネントが正常にレンダリングされることを確認するテスト。
- [ ] E-2: **入力→結果更新**：入力値が変化したとき結果が正しく更新されることを確認するテスト。
- [ ] E-3: **空入力**：入力が空のとき（または未入力初期状態）の挙動（エラー非表示・空結果・opacity:0 の予告ヒント等）を確認するテスト。
- [ ] E-4: **変換ロジックの正確性**：代表的な入力値で期待する出力が得られることを確認するテスト（logic.ts のテストと重複不可避でも UI 経由で確認する）。
- [ ] E-5: **ARIA**：`role`・`aria-*` 属性が正しく付与されていることを確認するテスト（特に `SegmentedControl` の `role="radiogroup"` / `aria-label`・出力欄の `role="status"` / `aria-live="polite"`）。出力が `textarea` の場合は、サマリテキストを持つ別の `role="status"` 要素も存在することを確認すること（C-3 の実テキストノード要件と対応）。
- [ ] E-6: **コピー文言変化**：コピーボタンがある場合、コピー前と `COPIED_LABEL` 表示中で文言が切り替わることを確認するテスト。
- [ ] E-7: **コピー disabled 状態**：結果が空のとき（または無効状態のとき）コピーボタンが disabled になることを確認するテスト（該当ツールにコピーボタンがある場合）。
- [ ] E-8: **clipboard 不在時の silent fail**：`navigator.clipboard` が存在しない環境でコピーが失敗しても例外を投げないことを確認するテスト（`useCopyToClipboard` フックが内包する挙動だが UI 経由で確認）。
- [ ] E-9: **詳細リンク**（該当ツールにある場合）：詳細ページへのリンクが正しく描画されることを確認するテスト。
- [ ] E-10: **meta 由来の表示**：`meta.name` 等から派生する表示（タイトル等）が正しく描画されていることを確認するテスト（`ToolPageLayout` を介する場合はその children が描画されることを確認）。
- [ ] E-11: **既存の logic.ts テストが PASS し続けるか**（変換ロジックを変更した場合は修正済みテストも PASS するか）。
- [ ] E-12: **CSS トークン検証**（`readFileSync` パターン）：`--color-*` 旧トークンが CSS に存在しないこと、`--accent` 直塗りが存在しないこと、`font-weight: 700` が存在しないこと等を `readFileSync` で確認するテスト（`Button.test.tsx` / `Input.test.tsx` / `SegmentedControl.test.tsx` の既存パターンに倣う）。

---

## F. 独立評価設問（形骸化防止・必須記述）

以下の2問は「はい/いいえ」で**機械的に埋めることを禁じる**。builder 自身の言葉で具体的に記述すること。reviewer はこの記述の実質性を確認する。

### F-1: このツールのフル機能はタイルに収まるか

このツールが持つすべての機能（入力・変換・オプション・コピー・エラー表示・ファイル操作等）を1ページの単一実装タイルとして提供できるか、独立に評価した結果を記述せよ。

収まる場合は「収まる・理由」を、収まらない場合は「収まらない・理由・解決策（省略オプションのトグル化等）」を記述すること。

> **（builder がここに記述）**

### F-2: このツール固有の最難所と実装方針

このツールを再構築する際に最も難しい実装上の課題（例: cron-parser なら JST 固定化、image-base64 ならデコード復元、regex-tester なら置換機能復元・フォーカス復活）を**1つ以上**、builder 自身の言葉で挙げ、その実装方針を具体的に記述せよ。

他のツールで「これが難しかった」という話の転用は禁じる。このツール固有の課題を分析すること。

> **（builder がここに記述）**

---

## チェックリスト使用後の申告

builder はこのチェックリストのすべての項目を確認し、F-1・F-2 に実質的な記述をしたうえで、以下を成果物に添付して reviewer に提出すること。

```
チェックリスト申告:
- A 群: A-1〜A-8 すべて Yes（該当なし項目は「N/A・理由」を明記）
- B 群: B-1〜B-8 すべて Yes
- C 群: C-1〜C-7 すべて Yes
- D 群: D-1〜D-4 すべて Yes
- E 群: E-1〜E-12 すべて Yes（該当なし項目は「N/A・理由」を明記）
- F-1: （実質的な記述）
- F-2: （実質的な記述）
```

reviewer は F-1・F-2 の記述が実質的か（コピー&ペーストや定型文でないか）を確認し、不実質と判断した場合は差し戻す。
