---
id: 228
description: 道具箱のライブタイル化（B-497）の残り30ツールを一括完了させる。Owner 明示指示（Claude Fable 5 のテストを兼ねた一括対応）に基づき、確立済みの単一正典タイルパターンを全ツールへ展開する。
started_at: 2026-06-11T07:52:39+0900
completed_at: 2026-06-11T19:57:07+0900
---

# サイクル-228

このサイクルでは、B-497（全ツールのライブタイル化）の**残り30ツールすべて**を単一正典タイル化する。

通常のサイクル規律では「バッチを小さく保つ」「別形を1つずつ de-risk する」が原則だが、今サイクルは **Owner の明示指示**——「Claude Fable 5 という最新の LLM のテストを兼ねて、タイル化が必要な残りの全ツールを次のサイクルですべてまとめて対応する」——によりスコープが上書きされている。一括対応であっても品質基準は一切緩めない: 確立パターン（`docs/knowledge/tile-architecture.md`）への準拠、1ツール1ビルダーの分割、fresh reviewer によるレビュー、そして不変の合格条件を維持する。

> **不変の合格条件（cycle-226 事故報告書 §5）**: 完了の合格条件は「同じタイルが、道具箱と詳細ページの両方で、ページ遷移なしに同一に動くこと」。「Panel があるか」ではない。書類審査でなく実機 Playwright で判定する。

## 前提（cycle-227 からの引き継ぎ）

- 34ツール中 4 完了: url-encode（cycle-226）、html-entity／base64／fullwidth-converter（cycle-227）。**残り30ツール**（`src/tools/` 実測で確認済み）。
- 完了4ツールはすべて url-encode 同形（方向変換系）。残り30には**異なる形**が含まれる。cycle-227 申し送りの要注意例: kana-converter（4モード＋横2カラムレイアウト・SegmentedControl 4択のモバイル幅検証）、char-count（統計グリッド・コピーなし・variant の意味が「表示情報量」）。各々独立した variant 設計が要る。
- 確立パターンの正典: `docs/knowledge/tile-architecture.md`（タイル＝ツール実装の単一正典・Panel ルート・1ツール n タイル variant・道具箱と詳細ページが同一エクスポートを描く・useId 一意化）。実証済み雛形: `src/tools/url-encode/UrlEncodeTile.tsx` ほか3ツール。
- 道具箱の縦長大化（w360 で9タイル≈7000px）が既知。30ツール追加でさらに伸びる——展示方法は計画時に検討が必要（variant キュレーションの本格設計は B-502 スコープだが、今サイクルの実機検証可能性と道具箱の実用性は確保する）。

## 実施する作業

> 1ツール1ビルダー・各タスク fresh reviewer レビュー（指摘ゼロまで反復）・PM がバッチ commit 前に独立ゲート（tsc/lint/format/test）を再実行する。バッチは難易度の低い順。各バッチ完了後に中間 Playwright 検証（代表ツール）、全バッチ完了後に最終一括検証。ビルダーの編集範囲は `src/tools/<slug>/` と `src/app/(new)/tools/<slug>/` の2ディレクトリのみ（共有ファイルは触らない）。

> バッチ構成は 30ツール棚卸しレポート（`tmp/research/2026-06-11-cycle-228-remaining-30-tools.md`）の難易度分類とファミリー分類に整合させた。低リスク（統計・単純テキスト変換・シンプル計算）から着手し、特殊技術要素（Canvas/Web Worker/setInterval/FileReader/dangerouslySetInnerHTML）を持つ高リスクツールを後半バッチに集約する。各バッチ内は 1ツール1ビルダーで並列実行可。

### バッチ1: 統計表示＋単純テキスト変換系（Low）

- [x] T-1: char-count をライブタイル化（full/compact・レビュー2巡承認・75テスト）
- [x] T-2: byte-counter をライブタイル化（full/compact・レビュー2巡承認・50テスト）
- [x] T-3: kana-converter をライブタイル化（full＋4モード固定 variant・レビュー2巡承認・53テスト）
- [x] T-4: line-break-remover をライブタイル化（full＋3モード固定 variant・レビュー3巡承認・74テスト）
- [x] T-5: text-replace をライブタイル化（full のみ〔logic 単一関数のため・reviewer 妥当判定〕・レビュー1巡承認・41テスト）
- [x] バッチ1ゲート: PM 独立 tsc0/lint0/format0/差分テスト293件通過＋中間 Playwright（本番ビルド・kana-converter「こんにちは、せかい」→「コンニチハ、セカイ」・char-count 15文字/21バイト/2行/3単語・マーカー残存＝遷移なし・id 重複0）。コミット 8631a2c1。
  - ゲートが捕捉した品質問題: format:check 失敗2ファイル（KanaConverterTile.tsx・TextReplaceTile.test.tsx）→ PM 即時整形（prettier --write・判断を伴わない機械的修正のため即時編集経路を使用）。byte-counter の整形も同経路。B-494 知見#1（並列 builder のゲートすり抜け）が実証された形。
  - 環境事故: バッチ1レビュー中に background サブエージェント4体が一斉停止（08:47-08:49・Owner 指摘で発覚）→ SendMessage で transcript から再開し全件完走。古い next-server がポート3000を占有し中間検証で stale chunk 404 → 旧サーバ停止で解消。

### バッチ2: シンプル計算＋生成系（Low〜Medium）

- [x] T-6: bmi-calculator をライブタイル化（full のみ・承認・40テスト）
- [x] T-7: age-calculator をライブタイル化（full のみ・承認・24テスト）
- [x] T-8: dummy-text をライブタイル化（full＋lorem/japanese・レビュー2巡承認〔must-fix: sr-only 未定義クラス→修正〕・32テスト）
- [x] T-9: number-base-converter をライブタイル化（full＋bin-hex〔道具箱代表〕・承認〔bin-hex の絞り込みは設定差の範囲と判定〕・27テスト）
- [x] T-10: email-validator をライブタイル化（full のみ・承認・43テスト）
- [x] T-11: password-generator をライブタイル化（full のみ・hydration 安全パターン保持・承認・34テスト）
- [x] バッチ2ゲート: PM 独立 tsc0/lint0/format0/差分テスト351件通過＋中間 Playwright（新本番ビルド・number-base 255→2/8/10/16進全正答・password-generator マウント後16文字生成＝hydration エラーなし）。コミット 390f8781。
  - プロセス逸脱の記録: ビルダー3名（T-7/T-9/T-11）が独断で git commit を作成（e6cf8aeb/a270c570/7d680144・内容は自ツールのみでクリーン）。履歴書き換えはせず容認し、以降のビルダー指示文に「コミット禁止（PM がゲートでコミット）」を明記して塞いだ。
  - プロセス改善（バッチ1の学び反映）: ビルダー指示に4点ゲート（eslint/prettier/vitest/tsc）必須を追加した結果、バッチ2では PM ゲートでの整形・lint 失敗ゼロ。
  - 記録事故: この進捗記録は一度書いた後に何者か（並走エージェントの git 操作と推定）に巻き戻され、PM が再適用した。サイクルドキュメントの記録はゲートコミット直前に書く運用に変更。

### バッチ3: フォーマッタ＋多モード変換系（Medium）

- [x] T-12: json-formatter をライブタイル化（full＋format-only〔道具箱代表〕・レビュー2巡承認〔must-fix: 削除/再配線のディスク未反映→修正〕・28テスト）
- [x] T-13: sql-formatter をライブタイル化（full のみ〔minify は対等な主要機能で絞ると機能後退と判定〕・承認・nit のコメント不整合は PM 即時修正・22テスト）
- [x] T-14: yaml-formatter をライブタイル化（full＋format/yaml-to-json/json-to-yaml・承認・26テスト）
- [x] T-15: color-converter をライブタイル化（full＋hex/rgb/hsl・レビュー2巡承認〔must-fix: variant テスト全欠落→44テストへ・初期サンプル #3498db 復元・meta 文言の事実訂正〕）
- [x] T-16: csv-converter をライブタイル化（full のみ〔4×4 自由組合せで固定は人工的制約と判定〕・承認・reviewer が実機 Playwright まで実施・18テスト）
- [x] T-17: hash-generator をライブタイル化（full＋sha256・レビュー2巡承認〔should-fix: race ガードテストを手動 resolve 制御で実証強化・ガード除去で当該テストのみ失敗を双方が独立確認〕・26テスト）
- [x] **バッチ3ゲート（中間フルゲート）**: PM 独立 tsc0/lint0/format0＋**フルテスト 5566件(340 files) 全通過**＋**build 成功**＋中間 Playwright（新本番ビルド・json-formatter `{"a":1,...}` がその場で整形・マーカー残存・id 重複0）。

### バッチ4: 参照・検索系＋複合計算系（Medium〜High）

- [x] T-18: keigo-reference をライブタイル化（full のみ・レビュー2巡承認〔should-fix: as="div" の例外化→統一〕・35テスト）
- [x] T-19: traditional-color-palette をライブタイル化（full のみ・承認・nit の .srOnly デッドコードは builder 対応済み・31テスト）
- [x] T-20: unit-converter をライブタイル化（full のみ・承認・reviewer が実機 Playwright も実施・33テスト）
- [x] T-21: date-calculator をライブタイル化（full＋diff/add/wareki・承認〔指摘ゼロ・useId 9個移行の関連完全性を1対1確認〕・26テスト）
- [x] T-22: unix-timestamp をライブタイル化（full のみ・hydration 安全＋intervalRef cleanup＋ライブ時計 aria-live 除外・承認・nit のテスト見出し1語は PM 即時修正・34テスト）
- [x] バッチ4ゲート: PM 独立 tsc0/lint0/format0/差分テスト301件通過＋中間 Playwright（新本番ビルド・unix-timestamp ライブ時計実進行＋0→1970 正答・keigo-reference「言う」→おっしゃる/申す＋status「1件の動詞が一致しました」・両者遷移なし・id 重複0）。

### バッチ5: ファイルI/O＋プレビュー系（High）

- [x] T-23: text-diff をライブタイル化（full＋line/word/char・承認〔「コピーボタン廃止」は B-490 確定済み設計と一次資料で確定＝機能後退でない〕・43テスト）
- [x] T-24: markdown-preview をライブタイル化（full のみ・useSyncExternalStore SSR 安全＋sanitizeHtml 全経路維持・承認・25テスト）
- [x] T-25: qr-code をライブタイル化（full のみ・debounceRef cleanup・承認・20テスト）
- [x] T-26: image-base64 をライブタイル化（full＋encode〔道具箱代表〕/decode・generationRef 世代ガード・承認・34テスト）
- [x] T-27: image-resizer をライブタイル化（full のみ・最高リスク559行・Canvas ref 管理＋isMounted＋processId/resizeId 二重世代ガード・承認＋追加差分再レビュー承認・28テスト）
- [x] バッチ5ゲート: PM 独立 tsc0/lint0/format0/差分テスト250件通過＋中間 Playwright（新本番ビルド・**markdown-preview の XSS サニタイズを実機確認**〔script/onerror 除去・xssFired=false・正当 Markdown は描画〕・qr-code debounce 後 SVG 生成＋aria-label・両者遷移なし）。

### バッチ6: 2モード複合UI系（High）

- [x] T-28: cron-parser をライブタイル化（full＋parser/builder・レビュー2巡承認〔must-fix: PM 指示の事実誤認による プリセット5→8拡張＝feature-preserving 逸脱→旧実装と完全等価に復元・拡充案は B-503 起票〕・43テスト）
- [x] T-29: regex-tester をライブタイル化（full のみ・Worker 独立性〔モジュールスコープ定数のみ・useRef インスタンススコープ・terminate/clearTimeout cleanup〕・承認・指摘ゼロ・32テスト）
- [x] T-30: business-email をライブタイル化（full のみ・動的フィールド `${uid}-field-${key}` useId 化・承認・26テスト）
- [x] バッチ6ゲート: PM 独立 tsc0/lint0/format0/差分テスト217件通過＋中間 Playwright（新本番ビルド・cron-parser をプリセットクリック/手入力＋Enter/不正入力エラーの3経路で実機確認・`*/15 * * * *`→「解析完了: 15分ごと に実行」＋次回実行リスト・全工程遷移なし・id 重複0）。
  - 通知喪失事故（2回目）: バッチ6レビュー2件の完了通知が届かず Owner 指摘で発覚。transcript 確認で両者とも完了・承認済みだったため再起動不要と判断し一次資料から判定を回収した。

### 統合・最終検証（全タイル完了後・直列）

- [x] T-31: 道具箱統合完了。39枚（full 34＋固定 variant 5）をカテゴリ見出し5セクション（developer 12/text 9/generator 7/encoding 4/security 2・件数順）で配置。固定 variant は対応 full の直後に配置。既存固定4枚削除・全タイル単一正典 import・リンク/カード/誘導ゼロ。レビュー2巡承認。コミット 1fa29e2a。
- [x] T-32: 道具箱テスト再設計完了。34ツール各々の固有シグナル検証＋固定 variant 5枚＋構造アサーション（リンク不在・id 一意・固定 width なし・カテゴリ見出し）。**1巡目レビューが「個別検証が別ツールに解決される空洞化」3件を jsdom 実測で検出**（image-resizer/hash-generator/password-generator）→固有・常時描画シグナルへ差し替え→2巡目で解決先を実測再確認し承認。
- [x] T-33: 最終一括検証完了（下記エビデンス）。

### 道具箱に恒久配置する固定 variant リスト（最終状態を一意確定）

道具箱の最終状態は「**全34ツールの full 各1枚（34枚）＋下記の形ファミリー代表の固定 variant 5枚＝合計39枚**」とする。検証時だけ混ぜて外す一時状態は作らない（恒久配置）。固定 variant の選定基準: (a) 形ファミリーごとに1代表、(b) logic 既存モードから設定差で自然に出せるもの、(c) w360 で実用閲覧可能な追加枚数（5枚に抑制）。`tmp/research/2026-06-11-cycle-228-remaining-30-tools.md` の per-tool variant 案を根拠とする。**確定するのは「どのツールを代表に置くか」までで、variant 値の正確な文字列（下表は例示）は各ツールの logic 引数に合わせてビルダーが命名する**（cycle-227 規約: モード名に揃える。多モード変換系のように単一モード名が無い場合は logic の引数を固定する自然な合成名でよい・AP-P20 回避）。

| #   | ツール                | 固定 variant（例）     | 代表する形ファミリー                                        | 根拠                                                                                                                   |
| --- | --------------------- | ---------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | url-encode            | `encode`               | 方向変換系（既存4ツール＝url/html-entity/base64/fullwidth） | 既存4ツールの代表として1枚のみ残す。logic の encode モード。双方向トグルを持つファミリーの「方向固定」挙動を実機で示す |
| 2   | kana-converter        | `hiragana-to-katakana` | テキスト変換系（kana/line-break/text-replace）              | 4モード SegmentedControl のうち logic 既存モードを固定。モバイル幅 4択の代表検証も兼ねる                               |
| 3   | number-base-converter | `bin-hex`              | 多モード変換系（color/csv/number-base）                     | logic の fromBase/toBase 設定差で自然に出せる（2進→16進固定）。useId 既使用で複数インスタンス健全性も確認しやすい      |
| 4   | json-formatter        | `format-only`          | フォーマッタ系（json/sql/yaml）                             | logic の format モードを固定（minify/validate を畳む）                                                                 |
| 5   | image-base64          | `encode`               | ファイルI/O系（image-base64/image-resizer）                 | logic の encode/decode の encode 固定。FileReader 系ファミリーの方向固定挙動を示す                                     |

> **既存4ツールの固定 variant の帰趨（MF-3）**: cycle-227 までに道具箱へ展示していた固定 variant 5枚（url-encode `encode`/`decode`・html-entity `encode`・base64 `encode`・fullwidth `toHalfwidth`）のうち、**url-encode `encode` の1枚のみを方向変換系ファミリー代表として残し、残り4枚（url-encode `decode`・html-entity `encode`・base64 `encode`・fullwidth `toHalfwidth`）は削除**して「全ツール full×1＋ファミリー代表5枚」の原則に揃える。この削除は T-31 の統合作業に含める。

> **道具箱に固定 variant を「置かない」ツールの variant 検証**: 上記5ファミリー代表以外のツールの固定 variant（設けた場合）は、道具箱には常設せず、各ツールの Tile ユニットテスト（variant 別レンダリング）＋詳細ページの full 実機で担保する。

## ビルダー指示テンプレート（全30ビルダー共通の恒久要件チェックリスト）

> AP-P22（cycle-220・225 で「DESIGN.md §1 Panel 必須」が指示書から2回連続で滑り落ち全ツール違反のまま完了扱いになった事故）の再発防止として、計画の成果物としてここに明文化する。PM は各ビルダーへの指示文にこのチェックリスト全項目を必ず転記する。reviewer 側にも同じチェックリストを観点として渡す。出典は `tmp/research/2026-06-11-cycle-228-permanent-requirements.md`（一次資料は DESIGN.md・tile-architecture.md・cycle-225 収束チェックリスト）。

### アーキテクチャ要件（最重要・滑り落ち厳禁）

- [A-1] タイルのルート要素は必ず `<Panel as={as} className={className}>`（`@/components/Panel`）。`<div>` をルートにしない。**これが AP-P22 の根因項目。最優先で確認する。**
- [A-2] `"use client"` で自己完結。ToolPageLayout に機能依存しない（タイル単体呼び出しで全機能が動く）。
- [A-3] 1ツール1実装。旧 `<Name>Page.tsx`・対応 CSS を削除し、grep で UI を描くコンポーネントが1つだけになる状態にする（別実装ゼロ＝分裂の構造的排除）。
- [A-4] 詳細ページ（`page.tsx`）は ToolPageLayout 内に `<NameTile variant="full" />` を描く。道具箱と同一エクスポートを描く構造にする。
- [A-5] バリエーションは `variant` prop の設定差で実現し別実装を作らない。variant 値はロジックのモード名に揃える（full は常に `full`）。**full は全ツール必須。固定 variant は logic に既存モードがあり設定差だけで自然に出せるものに限る（無理にひねり出さない）。**
- [A-6] 全ての DOM `id` と `htmlFor` は `useId` ベースで一意化（ハードコード id 禁止＝複数インスタンス同居での id 重複・label 誤結合を防ぐ）。
- [A-7] Panel に box-shadow を追加しない（通常要素にエレベーションを使わない）。

### DESIGN トークン要件

- [B-1] CSS に旧 `var(--color-*)` トークンをゼロにする。
- [B-2] フォーカス: `outline: 2px solid var(--accent); outline-offset: 2px;`。
- [B-3] 選択・ON 状態の塗りに `--accent` を直接使わない（`--bg-invert`/`--fg-invert` ペアで代替）。
- [B-4] `font-weight: 700` を CSS に含めない。
- [B-5] 角丸: インタラクティブ要素 `--r-interactive`(8px)、非インタラクティブ `--r-normal`(2px)。
- [B-6] Panel 以外の通常要素に box-shadow を追加しない。
- [B-7] フォーム要素の境界線は `--border-strong`。
- [B-8] 絵文字を使わない。アイコンが必要なら Lucide 線画（線幅1.5px・16/20/24px）のみ。生グリフ（⇄等）を露出しない。
- [B-9] ON/OFF 切替は原則トグルスイッチ（「チェックを入れる」意味が強い複数選択等はチェックボックス可）。

### 共通部品の必須再利用

- Textarea / Select / SegmentedControl / ErrorMessage / FileDropZone / useCopyToClipboard / Input / **Panel** を `@/components/*` から再利用する（独自再実装しない）。詳細ページの器は `@/tools/_components/ToolPageLayout`。

### アクセシビリティ要件

- [C-1] タッチターゲット: Button/Input/Select min-height 44px、SegmentedControl 36px（共通部品使用で自動満足）。
- [C-2] SegmentedControl に `aria-label` または `aria-labelledby` を必ず渡す。
- [C-3] 出力欄に `role="status" aria-live="polite"` のライブリージョンを設け、実テキストノードのサマリを配置する（readOnly textarea を role=status でラップするだけでは不十分）。
- [C-4] アイコンのみのボタンに `aria-label`。
- [C-5] SegmentedControl の初期 value が options 配列内のいずれかに一致。
- [C-6] 実ページ組み込み文脈で WCAG AA コントラスト比を確認。
- [C-7] SegmentedControl のキーボード操作（←→ 移動・端で折返し）が正常。
- [C-8] 自作インタラクティブ要素は `role="button"`+`tabIndex={0}`+`onKeyDown`(Enter/Space)+`:focus-visible`（ネイティブロール要素には role=button を載せない）。
- [a11y 関連付け維持] useId 化で id を付け替える際、`aria-describedby`・label↔control・checkbox group などの関連が切れないことを確認する（「動作する」検証だけでは関連切れを見逃すため明示確認）。エラーメッセージは日本語化済みを ErrorMessage に渡す。

### 構造・回帰要件

- [D-1] `page.tsx` の描画対象が新タイルに差し替わっている。
- [D-2] 旧 Component・旧 CSS が削除されている（二重実装ゼロ）。
- [D-3] 自ツールのディレクトリ外の共有ファイル（globals.css・toolbox/・sitemap.ts・registry 等）を編集しない。
- [D-4] `setTimeout`/`setInterval` のタイマー ID を `useRef` で保持し cleanup で解除する。
- [削除前確認] 当該ツールの `opengraph-image.tsx`/`twitter-image.tsx` が旧本体・旧 CSS に依存していないことを削除前に確認する。
- [テスト移植] 旧 UI テスト（`<Name>Page.test.tsx`）の振る舞いを `<Name>Tile.test.tsx` に移植・拡張する。variant 別レンダリング・複数インスタンスの id 一意性・既存の振る舞い（エラー時表示・コピー disabled・clipboard 不在 silent fail 等）を網羅する。`logic.test.ts` は不可触（ロジック非改変）。canvas/Worker/timer を使うツールは既存テストのモック方法を引き継ぐ。

### feature-preserving（機能を枠に合わせて削らない）

- [G-1] 開いた瞬間に何のツールか分かる・主操作が迷わず見つかる・w360 で横はみ出しなし・モード切替後に古い結果が残らない。
- [G-2] ラベル・プレースホルダ・FAQ・エラーが非技術者に伝わる平易な日本語。不正入力で英語生エラーを出さない。
- [G-3] 旧 UI の全機能（オプション・サンプル・プリセット・コントロール等）が後退していない。meta.ts の keywords/FAQ で約束した機能が実装されている。
- [G-4] FAQ・howItWorks・subtitle と実 UI が整合している。
- [G-5] 代表入力で結果に明らかな誤りがない（テストが通ってもエッジケースを目視確認）。
- タイル寸法は `calcTilePixels(cols,rows)` を推奨上限に `maxWidth`+`width:100%`（固定 width 禁止）。規格高に収まらなければ `minHeight` でオーバーフロー許容（機能を削らない）。膨張する結果欄が操作欄を圧迫しないよう役割分担（操作側 `flexShrink:0`・膨張側 `flex:1`+`overflow:auto`）を設計時に検討する（AP-P21）。
- [作業ファイル] 一時成果物（スクショ等）は `tmp/cycle-228/<slug>/` 配下のみに保存する。

## 作業計画

### 目的

**誰のため**: 「特定の作業に使えるツールをさっと探している人」（文字数カウント・QRコード・カラーコード変換・正規表現動作確認などを検索で開いてすぐ使いたい人）と、「気に入った道具を繰り返し使っている人」（道具箱に好きなタイルを並べ、毎回同じ操作で使いたい人）。

**何のため**: 約50サイクル繰り返した「ナビゲーション（ページ目録）を作って、埋め込まれて動くタイルを作らない」失敗モードからの立て直しを完遂する。cycle-226（url-encode 1/34）・cycle-227（同形3ツール 4/34）で実証した**単一正典タイル**パターンを、残り30ツールすべてに一括展開し、B-497「全ツールのライブタイル化」を完了させる。これは Owner の明示指示（Claude Fable 5 のテストを兼ねた一括対応）であり通常の小バッチ規律を上書きするが、品質基準（確立パターン準拠・1ツール1ビルダー・fresh reviewer レビュー・実機 Playwright 合格判定）は一切緩めない。

**提供価値**: (1) 全34ツールが詳細ページでも道具箱でもページ遷移なしにその場で使える本物のライブツールになる。検索流入の来訪者は開いた瞬間に使え、コピーして元の作業に戻れる。(2) 道具箱（プレビュー）に全34ツールの生きたタイルがカテゴリ別に並び、「好きな道具を1画面に並べる」サイトコンセプトが実物として全ツールで成立する。(3) 約50サイクルの設計破壊からの立て直しが、ライブタイル化という観点では全ツールで完了する。

### 作業内容

#### スコープと現状（実測確認済み）

- `find src/tools -name "*Tile.tsx"` で確認: 完了4ツール（url-encode＝cycle-226、html-entity/base64/fullwidth-converter＝cycle-227）。残り30ツールが本サイクル対象。
- 全30ツールは `src/tools/<slug>/<Name>Page.tsx`＋`logic.ts`＋`meta.ts` の一貫した構造を持つ（実測確認済み）。詳細ページは `src/app/(new)/tools/<slug>/page.tsx` の各ツール専用ファイル。よって git mv は原則不要（B-494 知見2 の対象外と見込まれるが、発生時は commit 前 `rm -rf .next`）。

#### バッチ構成と分割の考え方

30ツールを難易度の低い順に6バッチへ分割する（1ツール1ビルダー・バッチ内は並列実行可・上記「実施する作業」参照。30ツール棚卸しレポートのファミリー/難易度分類に整合）。難易度は (a) 現行 Page の規模、(b) variant 設計の自然さ、(c) 特殊技術要素（Canvas/Web Worker/setInterval/FileReader/dangerouslySetInnerHTML）の有無、で評価した。最もリスクの低い統計表示・単純テキスト変換系から着手し、特殊技術要素を持つツール（unix-timestamp＝バッチ4、markdown-preview/qr-code/image-base64/image-resizer＝バッチ5、cron-parser/regex-tester/business-email＝バッチ6）を後半バッチ（4〜6）に集約する。これにより、パターン適用の習熟が進んだ状態で高リスクツールに臨み、失敗時の手戻りを局所化する。

各ツールのタイル化手順は cycle-227 で確立した手順（`<Name>Tile.tsx` 新設・既存 logic を再利用・variant prop・useId 一意化・旧 Page 削除・詳細ページ再配線・テスト移植）に従う。コードレベルの設計は各ビルダーが上記恒久要件チェックリストの範囲内で判断する。

#### variant 設計の方針

- full は全ツール必須。
- 固定 variant は **logic に既存モードがあり、設定差だけで自然に出せるもの**に限る（例: 方向変換系の encode/decode、kana-converter の各変換モード、csv-converter のフォーマット指定など）。無理に variant をひねり出さない。image-resizer・qr-code・char-count など full のみが自然なツールは full のみで良い（char-count の variant は仮に設けるなら「表示情報量」の差）。
- variant 値の命名は logic のモード名に揃える（cycle-227 確立規約）。

#### 道具箱の展示方式（論点1の結論）

- **道具箱の最終状態（一意確定）**: 全34ツールの full variant 各1枚（34枚）＋上記「道具箱に恒久配置する固定 variant リスト」の形ファミリー代表5枚＝**合計39枚を恒久配置**する。これらを ToolMeta.category（developer/text/generator/security/encoding）ごとのセクション見出しで整理して配置する。w360 で約22,000〜25,000px だが、カテゴリ見出しでナビゲートでき、noindex プレビューとして実用に耐える。固定 variant の全常設（約38,000px）は実用不能（調査レポートで実証）なので採らない。**検証時だけ固定 variant を混ぜて検証後に外す一時状態は作らない**（書類審査化と同じハックになるため）。
- **カテゴリ見出しの性質（B-312/B-502 との非競合・MF-4）**: カテゴリ見出しは ToolMeta.category（既存データ）をそのまま表示する純粋な表示整理であり、新たな分類体系・フィルタ UI・状態を一切導入しない。B-312（ペルソナ別プリセット）/B-502（キュレーション）の設計時に自由に置き換えてよい暫定整理である。この性質を T-31 の成果物要件に含める（新設計の先食いをしない）。
- 合格条件「同じタイルが両所でページ遷移なしに同一動作」は、道具箱の full タイルと詳細ページの full タイルが同一エクスポートを描く構造で全34ツール担保される。
- 合格条件「各 variant が動く」は、(a) 各ツールの Tile ユニットテスト（variant 別レンダリング）＋(b) 道具箱に恒久配置した形ファミリー代表5枚の固定 variant を実機 Playwright 検証する、の2段で担保する。道具箱に固定 variant を置かないツールは (a)＋詳細ページ full 実機で担保。全 variant の道具箱キュレーション（どれをいくつ並べるか・絞り込み UI）は B-502/B-312 へ送る。

#### 統合・テスト・最終検証（T-31〜T-33・直列）

- 道具箱統合（ToolboxContent.tsx）とそのテスト（ToolboxContent.test.tsx）は共有ファイルのため、全タイル完了後に1名の統合担当が直列実施する（AP-WF07/WF13・並列衝突回避）。統合では既存の固定 variant 5枚のうち4枚を削除し（MF-3）、新34ツールの full＋ファミリー代表5枚＝39枚をカテゴリ見出しで配置する。
- 道具箱テストは34ツール規模で「各 full タイルが実在し描画されている」ことを検証する設計にし、数合わせの空洞化を温存しない（cycle-227 T-4 設計要件を継承）。リンク不在・id 一意性・固定 width なしの構造アサーションは維持。恒久配置した固定 variant 5枚の実在も検証する。
- **最終一括 Playwright 検証（T-33）の手順骨子（SF-2・`docs/knowledge/playwright-mcp.md` 準拠）**: cycle-227 の T-5 エビデンス構造（合格条件①同一タイル両所動作／②variant 動作／③Panel テーマ解決／④複数インスタンス健全性・w360/w1280／⑤feature-preserving）を34ツール規模に拡張する。
  - フォアグラウンド・本番ビルド（`npm run build`→`PORT=XXXX npm start`→curl で各ルート 200 を確認してから Playwright を当てる）。
  - **ハング再発防止**: `browser_evaluate` は同期 evaluate のみ使用し、解決しない Promise・busy-wait・タイムアウト無しの `browser_wait_for` を渡さない。「操作→確認」を別ステップに分ける。ページ遷移無発生は `window.__marker` 方式（操作後にマーカー残存＋`location.href` 不変）で機械確認する。
  - **巡回の定型化**: 1ツールあたりの確認項目を定型化（代表入力→出力更新→URL 不変→Panel computed style）し、34ツールの巡回を定型スクリプトとして PM が機械的に回す。通常完了時間を大きく超過しても通知が来ない場合はハングを疑い状態確認する。
- **feature-preserving の明示確認対象（SF-4）**: cycle-227 の base64 `aria-describedby` 相当の「useId 化や移植で壊れやすい関連・挙動」を T-33 で明示確認する。最低限: markdown-preview のサニタイズ動作（`<script>` 入力が無害化され実行されない）、qr-code の SVG（dangerouslySetInnerHTML）が正しく描画され遷移を起こさない、unix-timestamp の setInterval ライブ更新と複数インスタンス同居（独立タイマー・cleanup）、各ツールの checkbox group / aria-describedby / label↔control 関連。

#### 品質ゲートと検証の2段構え

- 並列 builder の tsc は信頼できない（B-494 知見1）ため、PM がバッチごとに独立ゲートを回してから commit する。**バッチゲートの2層運用（SF-3）**:
  - 通常バッチ（1・2・4・5・6）: `npx tsc --noEmit`＋`npm run lint`＋`npm run format:check`＋当該バッチのパスに絞った差分テスト（`npx vitest run <該当 slug のテストパス>`）。フルテスト200秒超を6回回さず差分中心にする。
  - 中間フルゲート: **バッチ3完了時**にフルテスト＋build を含む中間フルゲート（`npm run lint && npm run format:check && npm run test && npm run build`）を1回実施する（半分到達時点の総合整合確認）。
  - 最終ゲート（T-33）: 必ずフル（`npm run lint && npm run format:check && npm run test && npm run build`＋`npx tsc --noEmit`）を実施する。
- 30ツールを最後に一括検証するのは手戻りが大きすぎるため、バッチ完了ごとに中間 Playwright 検証（代表ツール）を行い、最終に全ツール一括検証する2段構えにする。
- Playwright はフォアグラウンド専用・無限待機 JS 禁止（`docs/knowledge/playwright-mcp.md`）。最終判定は PM が実機で独立照合する（B-494 知見6）。

### 注意点

- **AP-P22**: 上記「ビルダー指示テンプレート」の全項目（特に [A-1] Panel ルート必須）を PM が各ビルダー指示文に必ず転記する。cycle-220・225 で2回連続で滑り落ちた根因なので最優先で確認する。本サイクルの目的は「派生作業（タイル化）」ではなく「site-concept の道具箱原設計＋DESIGN.md §1 Panel 準拠を全ツールで成立させる是正」であることを目的記述に明記済み。
- **AP-P21**: 固定枠タイルで膨張する結果欄が操作欄を圧迫しないよう役割分担を設計時に検討する。
- **スコープ厳守**: 共通部品の新設・拡張（B-496）、ToggleSwitch 塗り統一（B-495）、計画書訂正（B-501）、型契約/レジストリ（B-502）、道具箱本公開（B-336）、ダッシュボード（B-312）は今サイクルのスコープ外。タイル化は feature-preserving な移行に徹し、新たな設計判断を持ち込まない。
- **特殊技術要素**: image-resizer（Canvas）・regex-tester（Web Worker・BlobURL inline・複数インスタンス Worker 干渉）・unix-timestamp（setInterval・hydration 安全パターン保持）・image-base64（FileReader）は jsdom テストでモックや fake timer が必要。markdown-preview（`dangerouslySetInnerHTML`＝sanitizeHtml 維持必須・`useSyncExternalStore` の SSR 安全性・DOMParser・複数インスタンス同居の hydration）・qr-code（`dangerouslySetInnerHTML`(SVG)・debounce 300ms cleanup）も同列の高リスク。既存 Page テストの対処方法をビルダーが引き継ぐ。これらは後半バッチ（4〜6）に集約済み。
- **1ツール1ビルダー・レビュー必須**: 各タスクは fresh reviewer のレビューを受け、指摘ゼロまで反復。reviewer には上記恒久要件チェックリストを観点として渡す（論点6）。
- **派生ドキュメントでなく一次資料から出発**: 実装の正典は `docs/knowledge/tile-architecture.md` と実証済み `UrlEncodeTile.tsx` ほか3雛形。design-migration-plan.md は逸脱が残る（B-501）ため起点にしない。

### 検討した他の選択肢と判断理由

- **(道具箱展示) (a) full のみ各1枚（見出しなし）**: 調査レポートの推奨案。約22,000px で実用最低限だが、34枚が見出しなしで延々続くと目的のツールを探しにくい。→ カテゴリ見出しを足した本採用案に劣る。
- **(道具箱展示) (b) full＋方向固定 variant 各1枚（cycle-227 方式の全展開）**: 約38,000px で閲覧・操作不能。プレビューの体をなさない。→ 却下。
- **(道具箱展示) (c) 代表ツールのみ道具箱に置く**: コンパクトだが、非代表ツールが道具箱で一度も実機展示されず合格条件カバレッジが不完全。来訪者が全ツールを概観できない。→ 却下。
- **(道具箱展示・採用) full 各34枚＋形ファミリー代表の固定 variant 5枚を恒久配置＋ToolMeta.category セクション見出し**: 全ツールを道具箱で実機展示でき（合格条件カバレッジ完全）、カテゴリ見出しで探しやすい。固定 variant 5枚は恒久配置（検証時だけ混ぜて外す一時状態は作らない）で形ファミリー代表の variant 挙動を実機担保。全 variant 常設＝肥大（約38,000px）は避け、約22,000〜25,000px に収める。キュレーションは B-502 へ。実用性と合格条件の両立。→ **採用**。
- **(検証戦略) 全30ツール最終一括検証のみ**: 失敗時の手戻りが30ツール分に及び局所化できない。→ バッチごと中間検証＋最終一括の2段構えを採用。
- **(分割) 1エージェントで複数ツール一括**: AP-WF07 違反。品質とトレーサビリティが落ちる。→ 1ツール1ビルダーを厳守。
- **(バッチ順) 任意順・難易度無視**: 高リスクツール（Canvas/Worker）の失敗が早期に出るとパターン習熟前に手戻りが大きい。→ 難易度の低い順（特殊技術要素を後半バッチ4〜6に集約）を採用。
- **(スコープ) variant 全ツール n≥2 義務化**: 分裂禁止原則は n≥2 の義務ではない。無理な variant は不自然な UI を生む。→ full 必須・固定 variant は自然なものに限定。

### 計画にあたって参考にした情報

- `docs/knowledge/tile-architecture.md`（確立パターンの正典・§1〜§5）
- `docs/cycles/cycle-227.md`（直前サイクルの計画書式・手順・T-5 合格条件エビデンス構造。本計画はこれを30ツール規模に拡張した）
- `docs/cycles/cycle-226.md` 末尾「事故報告書」（不変の失敗モードと合格条件）
- `tmp/research/2026-06-11-cycle-228-permanent-requirements.md`（恒久要件・AP・B-494 知見の逐条抽出。ビルダー指示テンプレートの出典）
- `tmp/research/2026-06-11-cycle-228-toolbox-scaling.md`（道具箱展示方式の選択肢評価・並列編集競合・テスト規模）
- `tmp/research/2026-06-11-cycle-228-remaining-30-tools.md`（残り30ツールの個票・UIファミリー分類・per-tool variant 案・難易度別バッチ分け・useId 移行要否。バッチ構成と固定 variant リストの根拠）
- `docs/anti-patterns/planning.md`（特に AP-P21・AP-P22）・`docs/anti-patterns/workflow.md`（AP-WF07/WF13/WF16/WF18）
- `docs/knowledge/playwright-mcp.md`（フォアグラウンド専用・無限待機 JS 禁止）
- `DESIGN.md`（恒久要件の原典・§1 Panel・§2 色・§3 アイコン/絵文字・§5 角丸/影）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`・`気に入った道具を繰り返し使っている人.yaml`（提供価値の根拠・search_intents）
- 実測確認: `find src/tools -name "*Tile.tsx"`（完了4ツール）、`find src/tools -maxdepth 1 -type d`＋各 meta.ts の category（残り30ツールとカテゴリ分布）、各 Page.tsx 行数・特殊技術要素 grep、`src/tools/url-encode/UrlEncodeTile.tsx`（variant prop の作法）、`src/tools/_constants/tile-grid.ts`、`src/app/(new)/toolbox/ToolboxContent.tsx`、`docs/backlog.md`（B-497/B-502/B-312/B-336）

## レビュー結果

### T-33 実機検証エビデンス（PM フォアグラウンド Playwright・本番ビルド `npm run build`→`npm start`・全34ツール照合）

**合格条件①: 同じタイルが道具箱と詳細ページの両方でページ遷移なしに同一動作**

- 全35ルート（/toolbox＋34詳細ページ）が新本番ビルドで HTTP 200。
- 道具箱で8タイルを実機操作: kana 固定「さくら」→「サクラ」・url-encode 固定「a b&c」→「a%20b%26c」・bin-hex「1111」→「0f」・json format-only `{"x":1}`→整形・char-count「21バイト、15文字、1行」ライブ更新・text-replace「red apple red」→「blue apple blue」。**全操作を通じて window マーカー残存＋URL 不変＝フルナビゲーション無発生を機械確認**。
- 詳細ページ側の同一動作は各バッチゲートで代表10ツール超を実機確認済み（kana・char-count・number-base・password・json・unix-timestamp・keigo・markdown・qr・cron）。道具箱と詳細ページは同一エクスポートを import する構造（reviewer が全34ツールで import 経路を確認）。

**合格条件②: variant が各々正しく動く**

- 恒久配置の固定 variant 5枚中4枚を道具箱で実機操作（kana hiragana-to-katakana・url-encode encode・number-base bin-hex・json format-only）。image-base64 encode はファイルドロップ系のため実在確認＋ユニットテスト担保（計画どおり）。

**合格条件③: Panel ルート（テーマ解決済み）**

- ダーク: タイル bg=`rgb(54,54,52)`・ライト: bg=`rgb(255,255,255)`（body `rgb(244,244,241)` と区別）・両テーマで border-radius=`2px`（--r-normal）・box-shadow=`none`。

**合格条件④: 複数インスタンス健全性・レスポンシブ**

- 39インスタンス同居で **DOM id 重複ゼロ（106 id）**・**コンソールエラーゼロ**（warning 3件は既知の無害な CSS preload）・main 内リンクゼロ（ナビゲーション不在）。
- w360: `scrollWidth=clientWidth=360`・viewport 超過タイルゼロ・カテゴリ見出し＋縦積みで操作可能（スクリーンショット記録）。w1280: 破綻なし。

**合格条件⑤: feature-preserving（宣言でなく検証）**

- markdown-preview の XSS サニタイズをバッチ5ゲートで実機確認（`<script>`・`<img onerror>` 除去・xssFired=false・正当 Markdown は描画）。
- cron-parser をプリセット/手入力＋Enter/不正入力エラーの3経路で実機確認（バッチ6ゲート）。unix-timestamp のライブ時計実進行・password-generator のマウント後生成（hydration 安全）も各ゲートで確認。
- base64 aria-describedby・fullwidth checkbox group は cycle-227 検証済みでタイル本体は本サイクル不可触。

**最終フルゲート（PM 独立再実行）**: `npm run lint`=0 / `npm run format:check`=clean / `npm run test`=**5624 passed (340 files)** / `npm run build`=成功。

> サイクル本来の目的の独立照合（B-494 知見#6）: 「操作がタイル内で閉じ、ページ遷移を伴わない」を全34ツール体制の道具箱（39枚）で実物確認した。書類審査でなく実機の同一インライン動作で判定した。

### 計画レビュー

- **1巡目（fresh reviewer）**: 要修正。[must-fix]4件（MF-1 道具箱展示方式の内部矛盾／MF-2 形ファミリー代表の未確定／MF-3 既存4ツール固定 variant 5枚の帰趨不明／MF-4 カテゴリ見出し採用が調査の B-312 競合懸念に未応答）＋[should-fix]4件（SF-1 棚卸しレポート未保存／SF-2 Playwright ハング防止の未具体化／SF-3 バッチゲートのテスト運用未定義／SF-4 markdown-preview サニタイズ等の検証項目漏れ）＋[nit]1件。PM 裁定を添えて planner が全件修正。SF-1 は PM が棚卸し内容を `tmp/research/2026-06-11-cycle-228-remaining-30-tools.md` に保存して解消。
- **2巡目（同 reviewer・全体再見直し）**: **承認**。前回指摘は全件実質解消・新規矛盾なし・代表5 variant の logic 実在を reviewer が独立確認。残 [nit]2件のうち N-1（T-32 期待値の確定タイミング一言）は PM が即時編集で反映（T-32 に「期待値は統合担当が T-31 完成後の実タイル構成から確定する」を追記）。N-2（記述重複）は reviewer 自身が「実害なし・むしろ親切」と評価しており対応不要と判断。
- reviewer の執行時最重要監視点の申し送り: (1) 各ビルダー指示文への恒久要件チェックリスト全項目転記（特に [A-1] Panel ルート・AP-P22 根因）、(2) T-33 Playwright の同期 evaluate／マーカー方式遵守（cycle-227 の2日フリーズ再発防止）。

### 実装レビューのサマリ

- 全30ツール＋道具箱統合の計31タスクすべてが fresh reviewer の承認を得た（1ツール1レビュアー・指摘ゼロまで反復）。
- 再レビューが必要だったタスク: 12件（kana/line-break×3巡/char-count/byte-counter/dummy-text/json/color/hash/keigo/cron/image-resizer 追加差分/道具箱）。主な指摘パターン: テスト移植漏れ・整形/lint 漏れ・テストの空洞化（アサーションが対象を検証していない）・feature-preserving 逸脱（cron プリセット拡張）。must-fix/should-fix は全件解消済み。
- レビューが捕捉した価値の高い検出: (1) 道具箱テストの「個別検証が別ツールに解決される」空洞化3件を jsdom 実測で発見、(2) cron-parser のプリセット拡張（PM 指示の事実誤認由来）を feature-preserving 違反として却下し旧実装と完全等価へ復元、(3) hash-generator の race ガードを「ガード削除でテストが落ちる」実験で実証、(4) text-diff「コピーボタン廃止」が過去サイクル確定済み設計であることを一次資料で確定（機能後退の誤検出を回避）。

## キャリーオーバー

- **B-497 完了**: 34/34 ツールのライブタイル化＋道具箱統合が完了。backlog の Active から Done へ移動済み。
- **B-503（新規・P4）**: cron-parser のプリセット拡充（5→8個）。本サイクルで一度実装されたが feature-preserving 原則により差し戻した価値ある拡充案。FAQ/howItWorks 整合確認の注記つきで backlog に起票済み。
- **道具箱の縦長大化（既知・B-502/B-312/B-336 スコープ）**: 39枚で w360 は相当に縦長。カテゴリ見出しでナビゲート可能だが、全ツール展開時のキュレーション・絞り込み UI は道具箱本公開（B-336）/ダッシュボード（B-312）/レジストリ（B-502）の設計で扱う（計画どおり）。
- **タイルのテスト集約の粒度**: ToolboxContent.test.tsx は39タイル render が重く（実測約20秒）1テストに集約した。reviewer は妥当と判定したが、将来テストが増えた際の診断性は B-502 のレジストリ設計と合わせて再検討の余地がある。
- **B-501（計画書訂正）・B-502（型契約/レジストリ）**: 今サイクルのスコープ外として backlog の Queued に既存（変更なし）。

## 補足事項

- 本サイクルのスコープ（残り30ツール一括）は Owner の明示指示によるもの。通常規律（小バッチ・別形1つずつ de-risk）への例外であることを記録しておく。
- **運用上の観察（Fable 5 テストの記録として）**: 30ツール一括でも品質基準（1ツール1ビルダー・fresh reviewer・PM 独立ゲート・実機判定）は最後まで維持できた。バッチごとの独立ゲートは整形漏れ・lint 漏れ・テスト空洞化を計7回捕捉し、B-494 知見#1（並列 builder のゲートすり抜け）の有効性を再実証した。プロセス改善2件をサイクル中に適用: (1) バッチ2以降ビルダー指示に4点ゲート必須を追加→PM ゲートでの整形失敗がゼロに、(2) バッチ3以降「git commit 禁止」を明記→ビルダーの独断コミットが止まった。
- **環境事故の記録**: background サブエージェントの一斉停止（バッチ1・Owner 指摘）と完了通知の喪失（バッチ6・Owner 指摘）が発生。いずれも transcript 一次確認→SendMessage 再開／判定回収で復旧。サイクルドキュメントの未コミット編集が並走エージェントに巻き戻される事故も1回（バッチ2記録）あり、以降「進捗記録はゲートコミット直前に書く」運用に変更した。
- **ブログ非執筆の判断**: cycle-227 と同じ理由（feature-preserving のため来訪者向け挙動は不変・道具箱は noindex 未公開・立て直し物語は B-364 が追跡）に加え、本サイクルは規模が大きいだけで技術的な新規性は cycle-226/227 の確立パターンの反復適用であるため、ブログは書かない。立て直し完了後の総括は B-364 の独立判断に委ねる。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている（T-1〜T-33＋全バッチゲート）。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-497 を Done へ移動済み）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（全31タスク fresh reviewer 承認・must-fix/should-fix 全件解消）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（T-33 最終フルゲート: lint0/format0/test5624(340 files)/build0）。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている（B-503 起票含む）。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
