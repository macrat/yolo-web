---
id: 225
description: "B-490: 全34ツールを単一タイル化＋Component 削除＋kind 分類撤去（前段）と、Owner 指摘を受けた全34ツール『最高の価値』基準での UX/コピー critical 監査と是正（後段 U-0a〜U-18）。デザイン移行立て直し critical path（B-488→B-489→B-490）の第3段（最終段）。遊び（ゲーム）は別レイアウトのためスコープ外。本プロジェクト初の workflow 利用サイクル。"
started_at: 2026-06-04T18:42:35+0900
completed_at: 2026-06-05T16:06:14+0900
---

# サイクル-225

このサイクルでは、デザイン移行の立て直し critical path（**B-488→B-489→B-490**）の第3段＝最終段である **B-490** に着手する。

前2段（cycle-223 / B-488 で計画書を単一抽象に是正、cycle-224 / B-489 で共通部品語彙とツールページの器 `ToolPageLayout` を新設）で土台が揃った。本サイクルは、その土台の上で **全34ツールを「単一タイル化（＝所定デザインを当てた本体にフル機能 UI を共通部品で組んだ、ただ一つの実装＝ページ本体）」に再構築し、旧 Component を削除し、最後に不要化した kind 分類（`tile-definition.ts` の Discriminated Union ／ `tile-declarations.ts` の25宣言）をコードから撤去する**。

最終受益者は来訪者（`docs/targets/` 参照）。全ツールが「開いた瞬間に使えるフル機能のツール」に揃い、デザイン・アクセシビリティ・コピーの品質が一貫することで、探す→使う→また使うの体験が滑らかになる。

## スコープと前提（準備フェーズで Owner と合意）

- **対象は34ツールのみ。遊び（ゲーム）は除外**。ゲームは別レイアウト（GameLayout 系）で変換の型が異なるため、別サイクルで安全に実施する。
- **実行は本プロジェクト初の workflow を使用**。通常サイクル（kickoff→planning→execution→確認→completion）に載せる。planning フェーズ＝workflow 設計。
- **収束の錨は「土台の必須再利用＋明文化済み基準」**。単一の基準実装をクローンして配る方式は**禁止**（cycle-220 で最初の1つの誤った前提が20個全部に伝播して破綻した履歴があるため）。錨は次のとおり：
  - B-489 の土台（共通部品6種＋Input(type=date)拡張＋`ToolPageLayout`）の必須再利用
  - 明文化済み基準：更新後の標準手順（design-migration-plan.md step7）／DESIGN.md／frontend-design スキル／AP-P21 判定基準／B-489 nice-to-have 6件
- カナリア（数本）はレシピ（手順＋基準）の検証であって、真似るための見本ではない。問題があれば**直すのはレシピ側**であり、1ツールから接ぎ木しない。
- 各ツールの再構築は自ディレクトリ内で独立完結させ、1個の失敗が他へ伝播しない構造にする。
- kind 撤去は全タイル化完了後に**直列で1回・一括**（漸進削除禁止＝AP-I02）。

## 合意済みの実行フェーズ構造（詳細は planning で確定）

1. **直列前段**: 再構築の収束基準（チェックリスト）を整備。各 builder に同梱する。
2. **workflow**: カナリア数本をパイプライン（builder→reviewer）で検証 → レシピ確認後に残り全本を並列再構築（各ツール独立・自ディレクトリ完結）。
3. **直列後段**: kind 分類撤去を一括実施。
4. **確認フェーズ**: フォアグラウンドで Playwright 視覚検証。指摘がゼロになるまで修正ループ（規模次第で workflow 再作 or 直接 builder→reviewer）。
5. 作業単位ごとの詳細記録は `docs/cycle-225/`（リポジトリ直下の作業記録ディレクトリ）に残す。本サイクルドキュメントは全体の進め方と結果のみを記録する。

## 実施する作業

TaskWrite 登録に使えるよう、小さく独立したタスクへ分割する。ツール34本は個別タスクにせず「群＋workflow 項目」として扱い、カナリア・kind 撤去・確認は独立タスクにする（PM 指示の粒度）。

**直列前段（収束基準の確定。workflow 着手前に完了させる）**

- [x] T-1 収束チェックリスト（builder 同梱版）を成果物として確定する（30項目・問い掛け形式）。**「このツールのフル機能はタイルに収まるか」を独立評価する設問を必須に含め、さらに形骸化防止のため「当該ツール固有の最難所（例: cron なら JST、image-base64 ならデコード）を builder 自身の言葉で1つ以上挙げ、その実装方針を記す」を必須設問とする**（『はい』で機械的に埋まる ②-14 再来を防ぐ。reviewer はこの記述の実質性を確認する）。`docs/cycle-225/` に置く。
- [x] T-2 A群（移行済み20本）の作業手順テンプレートを文章で定義する（クローン用コードではなく「何を満たすか」の手順書）。**page.tsx の描画対象を Component から単一実装へ差し替える工程・`Component.tsx` と Component 専用 CSS の削除を明示の工程に含める**。**簡素 `*Tile.tsx` には触れない**（並列フェーズ中は共有 `tile-declarations.ts` から参照され続けるため生かしておく。撤去は T-8 が相互依存ごと一括で行う）と明記する。`docs/cycle-225/` に置く。
- [x] T-3 B群（未移行14本）の作業手順テンプレートを文章で定義する手順書。**`git mv` は `opengraph-image.tsx`・`twitter-image.tsx` を含めてディレクトリごと `(legacy)→(new)` する**ことを明記し、旧 `ToolLayout` import を `ToolPageLayout` へ差し替える工程・単一タイルのゼロ構築工程を含める。`docs/cycle-225/` に置く。
- [x] T-4 並列衝突回避方針を確定する（共有ファイルへの編集が各 builder で発生しないことの最終確認と、発生する操作を直列段へ集約する取り決めを手順書に明記）。
- [x] T-4b 変換系コピー方針を PM が確定する（変換系7本＝url-encode/base64/html-entity/kana-converter/fullwidth-converter/line-break-remover/text-replace のコピーボタン可否を PM 裁量で確定し `docs/cycle-225/` に記録）。**T-6 着手のブロッカー**（変換系は全て A群＝T-6 で並列処理されるため、前段で確定しないと依存グラフに乗らない）。

**カナリア（独立タスク。レシピ検証であり接ぎ木の見本ではない）**

- [x] T-5 カナリア4本（後述）を workflow パイプライン（builder→reviewer）で再構築し、レシピ（手順＋チェックリスト）が通ることを検証する。通らなければ直すのはレシピ側（T-1/T-2/T-3）であり、1ツールから接ぎ木しない。**完了条件＝カナリア4本すべて reviewer 指摘ゼロ＋指摘から導いたレシピ（T-1〜T-3）への反映完了を PM が確認する（＝カナリアゲート通過）。** これが T-6/T-7 着手の前提。

**全本パイプライン（workflow・各ツール独立・自ディレクトリ完結。カナリアを除く30本）**

- [x] T-6 A群バッチ（移行済み20本のうちカナリア分を除く残り）を workflow で再構築する（各ツール builder→reviewer・1ツール=1パイプライン単位）。**着手条件＝T-5 カナリアゲート通過＋T-4b 変換系コピー方針確定**。
- [x] T-7 B群バッチ（未移行14本のうちカナリア分を除く残り）を workflow で再構築する（各ツール builder→reviewer・1ツール=1パイプライン単位）。**着手条件＝T-5 カナリアゲート通過**。

**直列後段（独立タスク）**

- [x] T-8 kind 分類撤去を直列1回・一括で実施する（全34本のタイル化完了後。漸進削除禁止＝AP-I02）。撤去直前に宣言の実数を再確認してから撤去する。

**確認フェーズ（独立タスク）**

- [x] T-9 フォアグラウンド Playwright 視覚検証（全34ツールページ・w360/w1280・ライト/ダーク＝最大136枚）を**複数バッチに分割**して行い、指摘ゼロまで修正ループする（収束方法は後述「確認フェーズ（T-9）の収束方法」に従う＝指摘は必ず該当ツール単位タスクに分解し 1タスク1builder・修正手段は閾値で判断）。

**completion 準備**

- [x] T-10 完成の定義（後述）を逐条で確認し、`npm run lint && npm run format:check && npm run test && npm run build` の全通過を独立再実行で確認する（AP-WF16）。

## 実施する作業（後段）

> B-490 本体（全34ツールの単一タイル化・Component 削除・kind 撤去）は完了済み。後段は、完了手続き中の「最高の価値」基準 UX/コピー critical 監査（`docs/cycle-225/ux-gate-findings.md`）で検出した約20本の UX/コピー/機能後退/正答性/デザイン整合の穴を是正する。すべての是正項目・深刻度・PM 判断は findings が単一ソース。後段の詳細設計は「## 後段: UX是正の作業計画」節を参照。

**直列前段（是正 builder のブロッカー。並列着手前に完了させる）**

- [x] U-0a T-4b 更新（`docs/cycle-225/T-4b-transform-copy-policy.md`）: PM 判断を反映し markdown-preview を「なし→あり（HTML コピー）」、traditional-color-palette を「なし→あり」に更新。cron-parser は「解析結果＝なし維持」を明記しつつ「ビルダー生成 cron 式はコピーあり」を補足。各 builder が機械適用できる粒度で確定する（個別 builder の自己判断に委ねない）。
- [x] U-0b 収束チェックリスト（`docs/cycle-225/convergence-checklist.md`）に天井基準4項目を恒久追加: (1) 最高の価値（魅力・直感性・操作性）を独立評価する設問、(2) 説明文・エラーがリテラシーの高低を問わず理解できるか（リテラシー非依存コピー）、(3) 再構築・是正で機能/オプションの後退がゼロか、(4) FAQ・howItWorks・subtitle と実 UI の整合。是正 builder が参照するため U-1 以降の前に確定する。

**是正バッチ（中以上の指摘がある各ツール＝1タスク・1 fresh builder。低のみの磨き込みは該当タスクに同梱／低のみ単独ツールは末尾でまとめタスク化）**

- [x] U-1 markdown-preview を是正する（[高] HTML コピー追加＋subtitle/keywords/FAQ の整合）。
- [x] U-2 business-email を是正する（[中高] 空フィールドの placeholder フォールバックで初期から一貫した見本メール表示・破綻文コピー解消）。
- [x] U-3 regex-tester を是正する（[中] 説明と実態の一致 or 入力内ハイライト実装・サンプル投入機能の復元・フラグ説明の常時表示）。
- [x] U-4 cron-parser を是正する（[中] モード切替での stale エラー解消・ビルダー出力コピー追加。[低] エラーに修正方法・ビルダー次回実行表示）。
- [x] U-5 sql-formatter を是正する（[中] キーワード大文字をトグルスイッチへ。[低] subtitle 補足・サンプル初期値検討）。
- [x] U-6 text-replace を是正する（[中] FAQ 文言の「スイッチ」修正・正規表現等の平易補足）。
- [x] U-7 text-diff を是正する（[中] 末尾改行アーティファクトとサマリ件数の是正）。
- [x] U-8 traditional-color-palette を是正する（[中] コピー追加＋FAQ 整合）。※規定外 box-shadow は T-6 で既に是正済み（CSS L4/L60 コメント・テスト L68 で回帰保証）のため本タスクには含めない。
- [x] U-9 dummy-text を是正する（[中] 日本語モードの無意味な単語数表示の是正・statusSummary も同様）。
- [x] U-10 password-generator を是正する（[中] 文字種全 OFF 時のエラー表示・生成無効化 or 強度バー「—」）。
- [x] U-11 unit-converter を是正する（[中] 入れ替えボタンの生グリフ「⇄」を Lucide 線画＋aria-label へ）。
- [x] U-12 image-resizer を是正する（[中] アスペクト比ロックの絵文字を可視ラベル付き UI／Lucide＋ラベルへ）。
- [x] U-13 bmi-calculator を是正する（[中] メーターのグラデーション廃止・ソリッド status 色・低体重ゾーンの --accent 誤用是正＝DESIGN 準拠）。
- [x] U-14 低のみ磨き込みツールをまとめて是正する（html-entity・url-encode・line-break-remover・json/yaml-formatter・csv-converter・char-count・hash-generator・qr-code・age-calculator・email-validator）。**1ツール1 builder の原則に従い、本タスクは「対象ツール群」を内部で各ツール独立 builder にファンアウトする傘タスクとして扱う**（findings 低セクション参照）。※「横断 about の専門語言い換え」（FileReader/Canvas/Web Crypto 等）は別途独立した1 builder のスコープとして U-14 内に分離（対象は image-base64/image-resizer/hash-generator/qr-code 等を含む数本・各 builder の低磨き込みと重複しないよう「about 内の API 名表現の言い換え」のみに限定）。

**各是正後の検証・締め**

- [x] U-15 各是正ツールごとに fresh reviewer が当該ツール全体をゼロから「最高の価値」基準で再点検する（差分でなく全体再評価・指摘ゼロまで反復・毎回新エージェント）。
- [x] U-16 全是正完了後、是正した全ツールを fresh で UX 再ゲート（フォアグラウンド Playwright）。
- [x] U-17 自動チェック（`npm run lint && npm run format:check && npm run test && npm run build`）を PM が独立再実行する（AP-WF16）。
- [x] U-18 ブログ（fresh レビュー承認済み分）を含め再 push（デプロイ）＋ cycle-completion 再実行。

## 作業計画

### 目的

デザイン移行立て直し critical path（B-488→B-489→B-490）の最終段として、**全34ツールを「単一タイル化（所定デザインを当てた本体にフル機能 UI を共通部品で組んだ、ただ一つの実装＝ページ本体）」に再構築し、旧 Component を削除し、最後に不要化した kind 分類をコードから撤去する**。

最終受益者は来訪者（`docs/targets/`）。ターゲット1「特定の作業に使えるツールをさっと探している人」の likes は「開いた瞬間に入力欄が見えてすぐ使い始められる」「余計な説明や装飾がなく用事だけ静かに片付く画面」、dislikes は「冒頭の長い解説」「似たツールで迷う」。ターゲット2「気に入った道具を繰り返し使う人」の likes は「すべてのツールの操作性・トンマナが一貫していること」「同じ入力に同じ結果」。全34ツールが単一実装タイルに揃うことで、二重実装に起因する乖離（cycle-220 ①-1/①-2/①-3）が構造的に起こり得なくなり、デザイン・a11y・コピーの品質が一貫し、両ターゲットの likes を一度の正しい作り直しで満たす。

### 作業内容

#### 確定済みの前提（調査で裏取り済み・本計画はこれを具体化する）

34本は作業の型が異なる2群に分かれる（実機確認済み）。

- **A群（移行済み20本・低リスク）**: 既に `(new)/tools/<slug>/page.tsx` が存在し `ToolPageLayout`（B-489 の新器）を使用するが、**page.tsx が描画しているのは `Component`（フル版）であり `*Tile` ではない**（全20本の page.tsx が `Component` を import・`*Tile` を import する page.tsx はゼロ＝実機確認済み）。既存の `*Tile.tsx`（kind:widget）は「タイルサイズ最適化の簡素版 UI」であって、design-migration-plan 現行正典（L51/L137/L175）が定める「タイル＝フル機能の単一実装＝詳細ページ本体」とは**別物**（簡素版こそ cycle-220 ②-4『機能劣後』の実体）。したがって A群の作業は「既存の簡素 `*Tile` をフル機能化（膨らませる）」ではない —— それは ②-4 の再生産源になる。正しくは、**Component のフル機能を単一実装（＝ページ本体）に作り直し、page.tsx の描画対象を Component から当該単一実装へ差し替え、`Component.tsx` と Component 専用 CSS を削除する**（＝二重実装を解消して page.tsx の描画を単一実装に一本化する）。各 builder は Component の全機能を共通部品で単一実装に移植できたことを independent に検証する。＋ARIA/nice-to-have 取り込み＋回帰テスト新設。**旧の簡素 `*Tile.tsx` 20本は各 builder（並列）では撤去しない**（共有 `tile-declarations.ts` から参照され続けるため、並列で消すとビルドが壊れる）。簡素 Tile の撤去は相互依存ごと T-8（DELETION UNIT 一括撤去）が担う。`(legacy)/tools/<slug>/` は空ディレクトリ（過去の git mv の残骸・git 追跡外）で、ルートとしては存在しない。対象: base64, byte-counter, char-count, cron-parser, email-validator, fullwidth-converter, hash-generator, html-entity, image-base64, image-resizer, kana-converter, keigo-reference, line-break-remover, password-generator, qr-code, regex-tester, text-diff, text-replace, traditional-color-palette, url-encode。
- **B群（未移行14本・高リスク・重い）**: `(legacy)/tools/<slug>/`（`page.tsx`＋`opengraph-image.tsx`＋`twitter-image.tsx`）のみが実在し旧 `ToolLayout` を使用。`(new)` ページ無し・`*Tile.tsx` 無し。作業＝`git mv (legacy)→(new)`＋単一タイルをゼロ構築＋DESIGN 適用＋`ToolPageLayout` 連結（旧 `ToolLayout` import を新器へ差し替え）＋Component 削除＋回帰テスト新設。対象: age-calculator, bmi-calculator, business-email, color-converter, csv-converter, date-calculator, dummy-text, json-formatter, markdown-preview, number-base-converter, sql-formatter, unit-converter, unix-timestamp, yaml-formatter。

**境界の確定**: (legacy)→(new) 移行は B-490 が内包する（design-migration-plan Phase 8.1 が全34ルート対象・標準手順 step2 に `git mv` が含まれる）。サイト全体の legacy 撤去（`(legacy)/` ディレクトリ・`old-globals.css`・`components/common/` の削除）は Phase 11／B-337 の領分であり、Phase 10 後の最終撤去のみで本サイクル外。B-490 は「ツール＝タイル」までを担い、B-337 と重複させない。

**遊び（ゲーム）はスコープ外**（別レイアウト＝GameLayout 系で型が異なる。Owner 合意・別サイクル）。

#### 収束の錨（最重要・cycle-220 の根因の再発防止）

cycle-220 の破綻根因は「最初の1つの誤った前提（Component 所与の kind=widget 判断）が独立評価を省略したまま19件へ無批判に伝播した」こと。これを再発させないため、本サイクルは次を不変原則とする。

- **単一基準実装のクローンは禁止**。各 builder には「真似る見本（基準実装）」ではなく**客観的チェックリスト（T-1）**を渡す。チェックリストは問い掛け形式30項目で、骨子は (a) 土台の必須再利用（共通部品8種＝Textarea / Select / SegmentedControl / ErrorMessage / FileDropZone / useCopyToClipboard / Input(type=date) / ToolPageLayout。前者7種は `src/components/` 配下、ToolPageLayout は `src/tools/_components/` 配下）、(b) DESIGN トークン準拠、(c) WCAG AA、(d) 構造（`Component.tsx` と Component 専用 CSS の削除＝page.tsx が単一実装を描画。※簡素 `*Tile.tsx` の撤去は builder の責務ではなく T-8 一括の責務）、(e) 回帰テスト、(f) 視覚確認。
- **各 builder が「このツールのフル機能はタイルに収まるか」を独立評価することを必須にする**（cycle-220 の根因＝この独立評価の省略）。チェックリストに当該設問を入れ、**加えて「当該ツール固有の最難所を builder 自身の言葉で1つ以上挙げ実装方針を記す」必須設問**で『はい』の機械記入（②-14 形骸化）を封じ、reviewer がその独立評価・最難所記述の実質性を確認する。
- カナリアは「レシピ（手順＋チェックリスト）の検証」であってクローン元ではない。レシピが通らなければ**直すのはレシピ側**であり、1ツールから接ぎ木しない。

#### 1ツール再構築の完了条件（cycle-220 の5条件＋B-489 キャリーオーバー）

各ツールについて以下をすべて満たす（チェックリスト T-1 に逐条反映する）。

1. タイルが Component と同等以上のフル機能を持つ（機能劣後ゼロ＝cycle-220 ②-4。Component の全機能を共通部品で実装）。
2. ツールページ（page.tsx）が当該**単一実装**を主役（ファーストビュー）に描画し（A群は描画対象を Component から単一実装へ差し替え済み）、確定提示方式（タイル主役＋最小説明＋※道具箱導線は Phase 10 で追加するため本サイクルでは作らない）に沿う。
3. **`Component.tsx` と Component 専用 CSS が削除され、page.tsx が単一実装を描画している**（追跡可能成果物）。※A群の簡素 `*Tile.tsx` の撤去は本 builder の完了条件には含めない（共有 `tile-declarations.ts` 等から参照され続けるため並列では消せない。撤去は T-8 完了で満たされる全体条件）。
4. 当該ツール個別問題の解消（下表）。
5. a11y（focus 可視・ARIA 操作モデル・radiogroup の矢印キー）・hydration error ゼロ・コピー原則を満たし、回帰テストがある。

加えて B-489 キャリーオーバー nice-to-have 6件を取り込む: N-A1 FileDropZone 安静時ボーダーを `--border-strong` に統一（image 系2本）／N-A2 SegmentedControl の value 不一致時到達性（初期 value を必ず options 内に）／N-A3 FileDropZone dragLeave チラつき（relatedTarget 判定）／N-B1 タイル下二次見出しの色トークン統一／N-B2 空 region の aria 整合／N-C1 実ツール組み込み文脈での AA 再確認。

**ツール個別に内包する論点（サイレントドロップ防止のため明示）**:

- image-base64: サイズ情報・プレビュー復元（①-10）＋Base64→画像デコード機能のフル復元（②-4 致命／B-457 内包）＋FileDropZone。
- cron-parser: ビルダー復元（②-4 致命）＋①-3 正答化（B-486 logic 継承）＋**真の JST 固定化（B-472 内包）**＋コピーボタン削除（②-15）。
- char-count / byte-counter: フル統計復元＋①-1 の正しい数え方を B-485 から継承＋2ツール維持（①-19）＋空状態（①-13）。
- text-diff: 件数・ラベル一致（①-2）＋空入力「差分なし」誤表示解消（①-12）＋コピー削除（②-15）。
- email-validator: 緑「有効」とタイポ提案の矛盾シグナル解消（①-4）＋コピー削除（②-15）。
- image-resizer: GIF 誤誘導・アニメ無言消失の解消（①-5）。
- password-generator: 強度バー動的化（①-6）＋hydration（①-15/B-469）＋チェックボックス→トグル（②-11）。
- base64: URL-safe Base64 対応（①-7）。
- html-entity: decode 取りこぼし・encode/decode 非対称解消（①-8）。
- qr-code: エラー処理の日本語フォールバック統一（①-9・ErrorMessage 経由）。
- fullwidth-converter: 全 ON 固定→オプション提供（①-11）＋空状態（①-13）。
- regex-tester: 既定空状態解消（①-14）＋`outline:none` 解消＝フォーカス復活（②-9）＋置換機能復元（②-4）＋コピー削除（②-15）。
- text-replace: 正規表現復元（②-4）＋空状態（①-13）＋placeholder 仕様詰め込み解消（①-20）＋省略オプションのタイル提供（③-6(1)）。
- url-encode / kana-converter / line-break-remover 等の変換系: 手動「変換」ボタン→リアルタイム化（①-21）＋該当箇所トグル化（②-11）＋**コピーボタンは T-4b で PM が確定した変換系コピー方針に従う（機械適用しない）**。
- traditional-color-palette: ツール固有の規定外 box-shadow 是正（②-13 のツール固有分）＋コピー削除（②-15）。
- keigo-reference: コピー削除（②-15）。
- 全ツール横断: ARIA 操作モデル統一（radiogroup・矢印キー・①-18/B-443）／コピー原則（②-15/②-16）／結果欄 opacity:0 の予告ヒント（①-13）／横断タイポ（textarea line-height・数値 font-weight・小フォント＝②-13）／ソースの社内プロセスログ除去（④-1。再構築でソースごと書き直され消える）。

**未確定論点（変換系コピー）の扱い＝直列前段ゲート（T-4b）として PM が確定**: url-encode / base64 / html-entity / kana-converter / fullwidth-converter / line-break-remover / text-replace のコピーボタン可否は、cycle-220 時点で Owner 判断ペンディングだったが、**現在 Owner は監視のみに戻り判断は PM 裁量に委ねられている**。これら変換系7本は**すべて A群＝T-6 で並列処理される**ため、「各 builder 着手前に取得」では依存グラフに乗らず取りこぼす（RevB M-2）。したがって本計画では、**直列前段の独立項目 T-4b として PM が変換系コピー方針（コピーが主目的か＝持ち帰り対象か知る対象か＝②-16 の判定軸で各本を確定）を確定し `docs/cycle-225/` に記録することを T-6 着手のブロッカーにする**。確定までは機械適用しない（個別 builder に判断を委ねない）。

#### 実行フェーズ構造（cycle-225.md 合意済み5フェーズの具体化）

本サイクルはプロジェクト初の workflow（決定論的サブエージェント・オーケストレーション）利用サイクル。

**workflow の実体と制約（設計の前提）**: ここでいう「workflow」はリポジトリ内のスキルではなく、**PM のメインループが持つハーネスレベルのオーケストレーション機能**である。決定論的な JS スクリプトで `agent()`／`pipeline()`／`parallel()` を回し、builder/reviewer の型付きサブエージェントを起動できる。実在し、Owner が B-490 で使うと明示済み。**重要な制約**: workflow が起動するエージェントは**バックグラウンド実行**であり、本プロジェクトのルール（CLAUDE.md「バックグラウンドのサブエージェントは MCP ツールにアクセスできない」）により **Playwright／Google Analytics に触れない**。したがって、コード生成・テスト・lint 等で完結する builder→reviewer パイプライン（T-5/T-6/T-7）は workflow に載せられるが、**視覚検証（T-9）は MCP（Playwright）が必須のため workflow の外＝フォアグラウンドに置く**。これが「全本再構築は workflow・視覚検証はフォアグラウンド」という本サイクルの構造的分離の根拠である。

1. **直列前段（T-1〜T-4）**: 収束チェックリスト（builder 同梱版）を成果物として確定。A群／B群それぞれの作業手順テンプレートを文章で定義（クローン用コードではなく「何を満たすか」の手順書）。並列衝突回避方針を確定。**変換系コピー方針を PM が確定する**（後述の前段ゲート、T-6 のブロッカー）。すべて `docs/cycle-225/` に作業記録として残す。
2. **カナリア（T-5）**: 代表4本を workflow パイプライン（builder→reviewer）で再構築し、レシピ（手順＋チェックリスト）を検証。問題があればレシピ側を直す。**カナリアゲート＝4本すべて reviewer 指摘ゼロ＋レシピへの反映完了を PM が確認**したら次へ。
3. **全本パイプライン（T-6/T-7）**: カナリアゲート通過（かつ T-6 は T-4b 変換系コピー方針確定）後に残り全本を workflow で並列再構築。各ツール独立・自ディレクトリ完結・builder→reviewer。
4. **直列後段（T-8）**: kind 分類撤去を直列1回・一括。
5. **確認フェーズ（T-9）**: フォアグラウンド Playwright 視覚検証（w360/w1280・ライト/ダーク）→指摘ゼロまで修正ループ（収束方法は後述）。**workflow の外（フォアグラウンド）に置く**＝MCP（Playwright）が必須でバックグラウンドの workflow エージェントからは触れないため。
6. **completion 準備（T-10）**: 完成の定義の逐条確認＋自動チェックの独立再実行。

#### カナリア選定

**4本を提案**: A群2本・B群2本とし、複雑系を必ず含める。

- A群カナリア: **image-base64**（Base64→画像デコード復元・FileDropZone・サイズ情報＝最難所の一つ）と **regex-tester**（既知 a11y 実害 `outline:none`・置換機能復元・SegmentedControl 系）。
- B群カナリア: **json-formatter**（B群で最も典型的な変換系・ゼロからの単一タイル構築の標準形を検証）と **unit-converter**（Select／SegmentedControl を使う複数選択系で B群の難所代表）。

選定理由: A群は「Component を単一実装に作り直し＋page.tsx 差し替え＋Component 削除（簡素 Tile 除去は T-8 一括）」、B群は「git mv（OG/twitter 画像含む）＋ゼロ構築」と作業の型が異なるため両群を含める。複雑系として image-base64（デコード復元＝最難所）と regex-tester（a11y 実害・置換復元）を A群側で押さえ、B群はゼロ構築の標準形（json-formatter）と複数コントロール系（unit-converter）でレシピの網羅性を検証する。カナリアで FileDropZone・SegmentedControl・ErrorMessage・useCopyToClipboard・Input(date) いずれの土台部品も一度は通る。残る複雑系（cron-parser の JST 等）はカナリアではなく T-6/T-7 で各ツール builder が T-1 の最難所必須設問により独立に押さえる。**カナリアはレシピ検証であり、ここで詰まればチェックリスト T-1／手順テンプレート T-2・T-3 を直す**（1ツールから接ぎ木しない）。

#### 並列衝突リスクの解消（worktree 不要の判断含む）

調査で確定した共有ファイル依存は次のとおり。

- **tools レジストリ（`src/tools/registry.ts` → `src/tools/generated/tools-registry.ts`）**: `meta.ts` を自動スキャンする codegen。34本すべて既に `meta.ts` を持ち登録済み（B群も既登録）。**B群の (new) 追加でレジストリ手編集は不要**（codegen が prebuild/predev/pretest で再生成）。各 builder は `meta.ts` を触らない限りレジストリ生成物に触れない。
- **`tile-declarations.ts`（kind 宣言 SSoT）**: 現在の実体配列は20本（移行済み）の widget 宣言のみ（json-formatter / irodori はコメント例示で配列外。実機 grep で確認済み）。これを各 builder が触ると衝突する。**方針＝各 builder は `tile-declarations.ts` を編集しない。kind 撤去を直列後段（T-8）に集約する**ため、本サイクルでは個別タイル化で宣言を増減させず、最後に一括撤去する。
- **`internal/tiles` プレビュールート（`src/app/(new)/internal/tiles/**`）と sitemap（`src/app/sitemap.ts`）**: 前者は noindex の開発者専用ルートで `tile-declarations`に依存。後者は tools レジストリに依存（タイル宣言には非依存）。いずれも個別 builder の自ディレクトリ作業では触らない。kind 撤去（T-8）で`internal/tiles` 系の整合も直列で扱う。

**結論**: 各 builder は**自ツールディレクトリ（`src/tools/<slug>/` と `src/app/(new)/tools/<slug>/`、B群は `git mv` 元の `(legacy)/tools/<slug>/`）内のみを編集**し、共有ファイル（`tile-declarations.ts`／`internal/tiles`／`sitemap.ts`／レジストリ生成物）の編集は直列段（T-8 ＋必要なら T-1〜T-4）に集約する。この設計が成立するため、各ツールは自ディレクトリ完結＝**worktree 分離は不要（低コスト）**と判断する。AP-WF13（builder のスコープ越境抑止）として、手順テンプレート T-2/T-3 に「共有ファイルを触らない」を明記する。

> 注: B群の `git mv` は builder が自ツール分のみを実行する（他ツールの mv は行わない＝AP-WF13）。`(legacy)/tools/` の空ディレクトリ（A群12本の git 追跡外残骸）はルートを持たないため衝突せず、本サイクルでは放置してよい（最終撤去は Phase 11/B-337）。

#### kind 撤去（T-8）の進め方と撤去範囲の確定（基本設計レベル）

全34本を単一タイル＝ページ本体に一本化すると、簡素 `*Tile.tsx` 20本・`tile-declarations.ts`・生成物 `tiles-registry.ts`・`internal/tiles` プレビュー機構が丸ごと dead 化する。これを直列1回・一括で撤去する（漸進削除禁止＝AP-I02）。

**簡素 `*Tile.tsx` 20本は個別撤去できず一括撤去が必須（C-3 の根拠）**: 簡素 `*Tile.tsx` 20本はすべて共有ファイル `tile-declarations.ts` が import しており（20本を一括 import して `TILE_DECLARATIONS` 配列を構成）、加えて各 Tile は自身のテスト（`<slug>/__tests__/<Name>Tile.test.tsx`）や `internal/tiles` プレビューからも参照される。したがって**個別 builder が並列で自分の `*Tile.tsx` を消すと、共有 `tile-declarations.ts`・当該テスト・プレビューの import が同時破綻してビルドが壊れる**（並列衝突回避方針「builder は `tile-declarations.ts` を触らない・自ディレクトリ完結」と物理的に矛盾し AP-WF13/AP-WF07 に抵触する）。よって簡素 Tile 20本の撤去は、これらの相互依存（共有ファイル・テスト・プレビュー）ごと T-8 が一括で行う（builder の並列フェーズでは触らず生かしておく）。

**宣言数の齟齬（実測で解明済み）**: backlog 記載「25」と実測が食い違う。実測では `tile-declarations.ts` の**実体配列は widget20本のみ**（json-formatter:single・irodori:play は JSDoc コメント内の例示で配列外。grep を膨らませていた原因）。**撤去直前にもう一度実数を再確認**してから撤去する。

**撤去範囲の境界（基本設計として本計画で確定。コードレベルの削除手順は後続 builder）**: `tile-declarations.ts` 冒頭と `scripts/generate-tiles-registry.ts` 冒頭に **DELETION UNIT コメント**が存在し、一体削除単位が規定されている（実機確認済み）。明記された7点＝(1) `scripts/generate-tiles-registry.ts`、(2) `scripts/__tests__/generate-tiles-registry.test.ts`、(3) `src/tools/_constants/tile-declarations.ts`、(4) `src/tools/generated/tiles-registry.ts`、(5) `src/app/(new)/internal/tiles/page.tsx`、(6) package.json scripts の `generate:tiles-registry`、(7) package.json prebuild/predev/pretest からの同呼び出し。**DELETION UNIT に未列挙だが撤去範囲特定の対象に含めるべき依存**（grep で確認済み）＝ `src/app/(new)/internal/tiles/preview/[domain]/[slug]/page.tsx` とそのテスト `__tests__/page.test.tsx`、`src/tools/_constants/__tests__/tile-definition.test.ts`、各ツールの簡素 `*Tile.tsx` 20本（＋簡素 Tile 専用 CSS）。

**消費箇所の確定（grep で裏取り済み）**: `tile-declarations`／`tiles-registry`／`tile-definition` を消費しているのは **(a) 簡素 `*Tile.tsx` 20本、(b) `internal/tiles` プレビュー（`page.tsx`＋`preview/[domain]/[slug]` サブルート＋各テスト）、(c) DELETION UNIT 内のファイル、(d) `tile-definition.test.ts` のみ**。**ダッシュボード構想（B-312/B-324/B-313）の実コードはまだ存在せず**（`Dashboard*` の grep ヒットは無関係の achievements 機能）、トップページ（`(new)/page.tsx`）もタイル登録機構を消費していない。よって本機構を撤去しても Phase 10 ダッシュボードは未着工のため依存破壊は起きない。

**T-8 が撤去するのは「kind discriminant だけ」か「タイル登録・プレビュー機構ごと（DELETION UNIT 全体）」かの確定**: **後者＝タイル登録・プレビュー機構ごと（DELETION UNIT 全体＋上記未列挙依存）を撤去する**。理由: 単一タイル＝ページ本体への一本化により、簡素 Tile・タイル宣言・noindex プレビュー機構は kind だけでなく機構ごと dead 化するため、kind discriminant のみを抜く中途半端な撤去は意味を持たない（残骸が dead code として残る）。

**ただし `tile-grid`（多セル規格）は残す**: cycle-220 ④（確定済み重要判断4）のとおり `tile-grid.ts`（1セル128px・整数倍スパン）は健全で Phase 10 ダッシュボードの前提として残す。現状 `tile-grid` を import しているのは撤去対象の簡素 `*Tile.tsx`・プレビュールートのみのため、撤去後は `tile-grid.ts`（＋そのテスト）が未参照で残る形になる。これは Phase 10 で参照される予定の規格であり、撤去対象に含めない（撤去するのはタイル「登録・プレビュー・kind 分類」機構であって、サイズ「規格」定数ではない）。この線引きを T-8 builder への指示に明記する。

撤去対象の最終特定と削除単位の編成は後続 builder が決定する（本計画ではコードレベルの削除順序・差分までは確定しない）。

#### 確認フェーズ（T-9）の収束方法

全34ツール × w360/w1280 × ライト/ダーク＝最大136枚をフォアグラウンド（PM のメインループ）で撮る負荷を踏まえ、次の収束原則を確定する。

- **(a) 複数バッチに分割する**: 34ツールを一度に撮らず、群・優先度などで数バッチに分けて撮影・確認する（一度のセッションに溜め込まない）。撮影は MCP（Playwright）必須のためフォアグラウンドで行い、workflow には載せない。
- **(b) 指摘は必ず該当ツール単位タスクに分解し 1タスク1builder（AP-WF07）**: 視覚検証で見つかった指摘は「ツール横断の一括修正」にまとめず、**指摘が出たツールごとに独立タスク化して 1ツール1builder で修正**する。複数ツールの修正を1 builder に束ねない。
- **(c) 修正手段の判断軸（AP-WF15 回避・曖昧さなく定義）**: 修正の流し方を思いつきで決めず、**指摘が出たツール本数で判断する**。**指摘ツールが概ね5本以上**なら T-6/T-7 と同型の workflow パイプライン（builder→reviewer）を再作成して回す。**5本未満**なら workflow を組まず直接 builder→reviewer で個別に修正する。いずれの場合も修正後は当該ツールを再度フォアグラウンドで視覚再確認し、**全バッチで指摘ゼロになるまでループ**する。

### 完成の定義（B-490 全体）

- 全34ツールが上記5条件を満たす（フル機能・単一実装の主役描画・Component 削除・個別問題解消・a11y/hydration/コピー原則/回帰テスト）。
- **`Component.tsx` が全34本で削除され、二重実装ゼロ**（A群は Component を単一実装に作り直して page.tsx の描画対象を差し替え、B群は新規単一タイルに一本化。`(new)/tools/<slug>/page.tsx` が単一実装を描画）。A群の簡素 `*Tile.tsx` 20本は T-8 の一括撤去で消える（個別 builder では撤去しない）。
- **タイル登録・プレビュー・kind 分類機構が撤去済み**（DELETION UNIT 全体＝`tile-declarations.ts`／`tile-definition.ts` の Discriminated Union／codegen `generate-tiles-registry.ts`＋テスト／生成物 `tiles-registry.ts`／`internal/tiles` プレビュー（`page.tsx`＋`preview/[domain]/[slug]`＋テスト）／package.json の関連スクリプト・呼び出し、および簡素 `*Tile.tsx` 20本が整合的に除去）。**`tile-grid.ts`（多セル規格）は Phase 10 の前提として残す**。
- hydration error ゼロ。
- `npm run lint && npm run format:check && npm run test && npm run build` が全通過（PM 独立再実行で確認＝AP-WF16）。
- フォアグラウンド Playwright 視覚検証（全34ページ・w360/w1280・ライト/ダーク）で指摘ゼロ。
- 作業単位ごとの詳細記録が `docs/cycle-225/`（リポジトリ直下）に残り、本サイクルドキュメントは全体像と結果のみを保持する。

### 検討した他の選択肢と判断理由

- **配布方式（収束の錨）**: (a) 単一基準実装をクローンして配る【却下】cycle-220 で1個の誤った前提が20件に伝播した構造そのものの再現。(b) 客観チェックリスト＋手順テンプレートを配り各 builder が独立評価する【採用】伝播の連鎖を断ち、各ツールの「フル機能がタイルに収まるか」を独立に問わせる。
- **A群／B群の扱い**: (a) 34本を一律の単一手順で処理【却下】A群は「Component を単一実装に作り直し＋page.tsx 差し替え＋Component 削除（簡素 Tile 撤去は T-8）」、B群は「git mv（OG/twitter 画像含む）＋ゼロ構築」で前提作業が異なり、一律手順は B群の git mv とゼロ構築を取りこぼす。(b) 群別に手順テンプレートを分け、完了条件は同一にする【採用】作業の型の差を吸収しつつ「単一実装・5条件」の到達点は統一できる。
- **A群の作り直し起点**: (a) 既存の簡素 `*Tile.tsx` をフル機能化（膨らませる）【却下】簡素 Tile は kind=widget の機能劣後版（②-4 の実体）で、それを起点にすると「どこまで膨らませたか」が曖昧になり ②-4 を再生産する。(b) Component のフル機能を単一実装に作り直し page.tsx の描画対象を差し替え、Component を削除する（簡素 Tile の除去は共有ファイル・テスト・プレビューとの相互依存ごと T-8 が一括）【採用】フル機能の源は Component であることが確定事項（cycle-220 (B)）で、Component を基準に「同等以上」を independent 検証できるため起点として正しい。簡素 Tile を builder が並列で消すとビルドが壊れる（C-3）ため撤去主体は T-8 に一本化する。
- **並列衝突回避**: (a) 各 builder に worktree を分離する【却下＝過剰】共有ファイル編集を直列段へ集約すれば自ディレクトリ完結が成立し、worktree 分離は低リターンの追加コスト。(b) 自ディレクトリ完結＋共有ファイルは直列段集約【採用】codegen がレジストリを自動再生成し、kind 宣言は本サイクル中は増減させず最後に一括撤去するため、builder の編集範囲が自ディレクトリに閉じる。
- **kind 撤去のタイミングと範囲**: (a) 各ツール完了ごとに漸進的に宣言を削る【却下】AP-I02（漸進削除禁止）違反かつ並列衝突源。(b) 全本完了後に直列1回で一括撤去【採用】dead 化が全体で確定してから撤去でき、衝突せず、実数の再確認も一度で済む。範囲は「kind discriminant だけ」ではなく「タイル登録・プレビュー機構ごと（DELETION UNIT 全体）」を採用（単一実装一本化で機構ごと dead 化するため。ただし `tile-grid` 規格は Phase 10 用に残す）。
- **カナリア本数**: 2本（A群B群各1）も検討したが、複雑系（デコード・JST・a11y 実害・複数コントロール）を1群1本では網羅できず、レシピの網羅検証として弱い。4本（A群2・B群2）でレシピを十分に揉む。
- **視覚検証（T-9）の置き場**: (a) workflow に載せる【却下＝不可能】workflow のエージェントはバックグラウンド実行で MCP（Playwright）に触れない（CLAUDE.md）。(b) フォアグラウンドでバッチ分割し、指摘はツール単位タスクに分解して 1タスク1builder、修正手段は指摘本数の閾値（概ね5本）で workflow 再作 or 直接 builder を判断【採用】MCP 制約と AP-WF07/AP-WF15 を満たす唯一の構造。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-225.md`（スコープ・前提・合意済み実行構造）
- `docs/design-migration-plan.md`（標準手順 step1-10／Phase 8 の step7／Phase 8 完了基準／Phase 11・B-337 の legacy 撤去領分）
- `docs/cycles/cycle-220.md` §T-3（5つの完了条件・立て直しの根因・確定提示方式・コピーボタン原則・①〜④問題リスト）
- `docs/cycles/cycle-224.md`（B-489 で構築した共通部品8種・ToolPageLayout・キャリーオーバー nice-to-have 6件）
- `DESIGN.md`／`.claude/skills/frontend-design/SKILL.md`（トークン・角丸・影・フォーカス・AA）
- `docs/targets/`（特定の作業に使えるツールをさっと探している人／気に入った道具を繰り返し使っている人）
- `docs/anti-patterns/planning.md`（AP-P16 数値ラベルの典拠／AP-P20 過度に具体的な計画の回避／AP-P21 固定枠 UI の flex 膨張）、`docs/anti-patterns/workflow.md`（AP-WF07 1エージェント1タスク／AP-WF13 builder のスコープ越境抑止／AP-WF15 補修課題の振り分け判断軸／AP-WF16 自動チェックの独立再実行）
- **workflow の実体（RevA M-1 への回答）**: 「workflow」はリポジトリのスキルではなく、PM のメインループが持つハーネスレベルのオーケストレーション機能（決定論的 JS スクリプトで `agent()`／`pipeline()`／`parallel()` を回し builder/reviewer の型付きサブエージェントを起動）。実在し Owner が B-490 で使うと明示済み。制約＝workflow のエージェントはバックグラウンド実行で、CLAUDE.md「バックグラウンドのサブエージェントは MCP ツールにアクセスできない」により Playwright/GA に触れない（→視覚検証 T-9 はフォアグラウンドで workflow の外）。
- 実機確認（コマンドで裏取り）: `find src/tools -name "Component.tsx"`=34本／`-name "*Tile.tsx"`=20本。`(new)/tools` の20本（A群）の page.tsx は**いずれも `Component` を描画し `*Tile` を import していない**（A群は `ToolPageLayout` 使用）。`(legacy)/tools` の14本（B群）は `page.tsx`＋`opengraph-image.tsx`＋`twitter-image.tsx` を持ち旧 `ToolLayout` 使用、12本の重複スラッグは空ディレクトリ（git 追跡外残骸）。tools レジストリは `meta.ts` 自動スキャン codegen（B群も既登録）。`tile-declarations.ts` の実体配列は20本の widget 宣言のみ（json-formatter/irodori はコメント例示で配列外）。`tile-declarations`/`tiles-registry`/`tile-definition` の消費箇所は簡素 `*Tile.tsx` 20本＋`internal/tiles` プレビュー（noindex・`page.tsx`＋`preview/[domain]/[slug]`＋テスト）＋DELETION UNIT 内ファイル＋`tile-definition.test.ts` のみ（ダッシュボード B-312/B-324/B-313 の実コードは未存在＝`Dashboard*` ヒットは無関係の achievements、トップページも非依存）。`tile-declarations.ts`／`generate-tiles-registry.ts` 冒頭に DELETION UNIT コメント（7点）が存在。sitemap はレジストリ依存でタイル宣言非依存。

## 後段: UX是正の作業計画

### 目的

B-490 本体は「全34ツールを単一タイル化・Component 削除・kind 撤去」を完遂し、機能・回帰・視覚の各レビューと自動チェックを全通過した。しかし完了手続き中、Owner 指摘を受けて全34ツールを憲法の「最高の価値」基準で来訪者目線で critical 監査した結果（`docs/cycle-225/ux-gate-findings.md`）、機能・回帰レビューが見逃した UX/コピー/機能後退/正答性/デザイン整合の穴が約20本に残っていた。

後段の目的は、findings に集約された全指摘を「最高の価値」基準（憲法 rule 2・rule 4／`docs/targets/`）で根本是正し、B-490 を真に「開いた瞬間に最高の価値を提供するツール群」として締めることである。findings が是正の単一ソースであり、本計画はそれを TaskWrite 登録可能な粒度の実行計画に具体化する（是正項目そのものは findings から引用し、ここで新たな判断は加えない）。

最終受益者は来訪者。ターゲット1「特定の作業に使えるツールをさっと探している人」は「開いた瞬間にすぐ使い始められる／用事だけ静かに片付く画面」を、ターゲット2「気に入った道具を繰り返し使う人」は「操作性・トンマナの一貫」を likes に持つ。リテラシー非依存の説明・初期表示の一貫・機能後退ゼロ・FAQ と実 UI の整合は、両ターゲットの likes を直接満たす。

### 根因と再発防止（findings から継承）

機能・回帰レビューと収束チェックリストは「Component 同等のフル機能・DESIGN トークン・a11y・テスト通過」は担保したが、**「来訪者にとって最高の価値か」「説明文・エラーがリテラシーを問わず理解できるか」「再構築で機能/オプションが後退していないか」「FAQ と実 UI が整合しているか」という天井基準を強制していなかった**。また meta.ts の説明文（howItWorks/FAQ/subtitle）が旧ツールから引き継がれ、新 UI（トグル/コピー有無等）と同期されていなかった。

→ 再発防止として、これら天井基準4項目を収束チェックリスト（`convergence-checklist.md`）に恒久追加する（U-0b）。次回以降の全ツール作業で builder/reviewer がこの基準を強制されるようにする。これが後段の最重要の構造的成果（個別是正よりも上位の価値）。

### 作業内容

#### 直列前段（是正 builder のブロッカー・並列着手前に確定）

是正 builder が機械適用・参照する共有ドキュメントを先に確定する。これらは並列フェーズで builder が触らない（並列衝突回避）ため、必ず前段で直列に確定する。

- **U-0a T-4b コピー方針の更新**: PM 判断（findings §PM 判断）を反映する。
  - markdown-preview: 「なし」→「あり（HTML をコピー）」。出力＝持ち帰り対象。
  - traditional-color-palette: 「なし」→「あり」。色コード（hex/rgb/hsl）は CSS 等に貼る持ち帰り対象。color-converter とコピー有無を一貫させ FAQ とも一致させる。cycle-220 ②-15 の「知る対象」分類は FAQ の約束・color-converter との一貫性に照らし誤りと判断した経緯を T-4b に明記する。
  - cron-parser: 解析結果（知る対象）はコピー「なし」維持。ただしビルダーが生成する cron 式は持ち帰り対象なので「ビルダー生成式はコピーあり」を T-4b に補足する。
  - 各 builder が表を機械適用できる粒度で確定する（②-16 の「個別判断任せ＝ばらつき」を構造的に封じる）。
- **U-0b 天井基準4項目の恒久追加**: 収束チェックリストに新セクション（仮 G 群）として以下を問い掛け形式で追加する。
  1. 最高の価値（魅力・直感性・操作性）を来訪者目線で独立評価したか。
  2. 説明文・エラー・ラベルがリテラシーの高低を問わず理解できるか（専門語・生関数名・生グリフ・英語例外の露出ゼロ）。
  3. 再構築・是正で機能・オプションが後退していないか（meta.ts のデッドコード／旧 UI で提供されていた機能の欠落チェックを含む）。
  4. FAQ・howItWorks・subtitle・keywords が実 UI と整合しているか（トグル/チェックボックス・コピー有無・操作語の一致）。
  - 形骸化防止のため、F-1/F-2 と同様に「機械的『はい』で埋めることを禁じ、reviewer が実質性を確認する」運用を明記する。

#### 是正バッチ（中以上の各ツール＝1タスク・1 fresh builder）

findings の「ツール別 是正項目」を、中以上の指摘があるツールごとに独立タスク化する（U-1〜U-13）。CLAUDE.md「1タスク1エージェント」を厳守し、1ツール=1 fresh builder（使い回し禁止）。低のみの磨き込みはまとめ傘タスク U-14 とし、内部で各ツール独立 builder にファンアウトする。

各 builder には次を渡す: (a) findings の当該ツール是正項目（引用）、(b) 更新後の収束チェックリスト（天井基準4項目込み）、(c) 更新後の T-4b（該当する場合）、(d) DESIGN.md・frontend-design スキル。各 builder は自ツールディレクトリ内で完結させ、共有ファイル（T-4b/DESIGN/convergence-checklist）は前段確定済みのため触らない。

是正の性質は2系統が混在する点に留意する（タスク粒度・検証観点に影響）。

- **実装を伴う是正**（機能復元・新規実装）: markdown-preview の HTML コピー追加（U-1）、business-email の placeholder フォールバック（U-2）、regex-tester のサンプル投入機能復元・ハイライト or 説明整合・フラグ常時表示（U-3）、cron-parser の stale エラー解消・ビルダー出力コピー（U-4）、text-diff の末尾改行アーティファクト是正（U-7）、traditional-color-palette のコピー追加（U-8）、dummy-text の日本語モード表示是正（U-9）、password-generator の全 OFF 時エラー/無効化（U-10）。これらは回帰テストの追加・更新を伴う。
- **コピー文言・表示の是正のみ**（平易化・整合）: sql-formatter のトグル化＋subtitle 補足（U-5）、text-replace の FAQ 文言・平易補足（U-6）、unit-converter/image-resizer の生グリフ/絵文字のアイコン化（U-11/U-12）、U-14 の低磨き込み群。これらも meta.ts／コピー文言の変更がテストに影響しないかは builder が確認する。

各タスクは findings の深刻度（高/中高/中/低）と是正項目をそのまま引用し、builder が「何を満たせば完了か」を一意に判断できる粒度にする。コードレベルの実装手段（どの関数・どの diff か）は builder が決定する（AP-P20）。

**ツール個別の是正要点（findings から引用・サイレントドロップ防止）**:

- markdown-preview [高]: HTML 出力手段が無い。プレビュー欄に「HTML をコピー」追加（生成済み HTML を取得可能に）。subtitle/keywords/FAQ の「HTML 変換」の約束と実態を一致させる。
- business-email [中高]: 初期全空で本文プレビューが破綻（空差し込みで「様/です。/について」等）。破綻文を「全文コピー」できてしまう。空フィールドを `field.placeholder` にフォールバックして差し込み、初期から一貫した見本メールを表示。
- sql-formatter [中]: 単一 ON/OFF の「キーワード大文字」がチェックボックス→DESIGN §5 に従いトグルスイッチへ。
- text-replace [中]: FAQ が「正規表現チェックボックス」だが実 UI はトグル→「スイッチ」に修正。正規表現・$1・\d+ 等に平易な一言補足。
- regex-tester [中]: (a)「リアルタイムにハイライト表示」が実態（マッチ一覧）と不一致→説明を実態に合わせる or 入力内ハイライト実装、(b) meta.ts の `REGEX_SAMPLE_INPUTS`（6サンプル）が UI 未参照のデッドコード→サンプル投入機能を復元（機能後退の是正）、(c) フラグ説明（g/i/m/s 等）が title ツールチップのみでタッチ端末で発見不能→平易な説明を常時表示。
- text-diff [中]: 行モードで末尾改行差により不変行が +/− の無意味な差分になり件数も過剰→末尾改行アーティファクトとサマリ件数を是正。
- traditional-color-palette [中]: コピー追加＋FAQ 整合（U-0a と対）。規定外 box-shadow 是正。
- dummy-text [中]: 日本語モードで「単語数＝段落数」の無意味表示→日本語では単語数を出さない（文字数のみ）か文数等へ。statusSummary（SR 用）も同様に。
- password-generator [中]: 文字種を全 OFF で生成→結果空・強度バー「弱い」誤表示→ErrorMessage で「使用する文字の種類を1つ以上選んでください」、生成ボタン無効化 or 強度バー「—」表示。
- unit-converter [中]: 入れ替えボタンの生グリフ「⇄」を Lucide 線画アイコン（aria-label 維持）へ（DESIGN §3）。
- image-resizer [中]: アスペクト比ロックの絵文字（🔒/🔓）を可視ラベル付きチェックボックス or Lucide アイコン＋ラベルへ。状態が見て分かるように（DESIGN §3）。
- cron-parser [中]: (a) 解析エラー後のモード切替で「入力エラーがあります」が残る→モード切替で liveSummary をリセット、(b) ビルダー出力にコピー追加。(低) エラーに修正方法を添える／ビルダーにも次回実行表示。
- bmi-calculator [中]: メーターのグラデーション廃止・ソリッドな status 色（--warning/--danger）に、低体重ゾーンの --accent 誤用も中立色へ（DESIGN 準拠・DESIGN.md は中サイクルで拡張しない）。
- 低のみ（U-14 傘タスク）: html-entity（操作ボタン語と統一）・url-encode（生関数名の平易化）・line-break-remover（生 `\n` の後退）・json/yaml-formatter（subtitle 補足・サンプル初期値）・csv-converter（句点統一・ラベル折返し）・char-count（Unicode 平易化・文字数主役化）・hash-generator（導入の平易な一文・ラベル折返し）・qr-code（ラベル折返し）・age-calculator（干支の読み仮名併記）・email-validator（記号の任意調整）・横断（about の FileReader/Canvas/Web Crypto 等の言い換え）。※sql-formatter は [中] U-5 に低も同梱済みのため重複登録を避け U-14 から除外（中以上ツールの低は当該ツールの中タスクに同梱、低のみツールのみ U-14 という冒頭ルールに準拠）。

#### 実行機構の提案（ファンアウト方式）

是正対象は中以上 約13本（U-1〜U-13）＋低のみ数本（U-14 傘内）。並列衝突は構造的に無い（各ツール自ディレクトリ完結・共有ファイル T-4b/DESIGN/convergence-checklist は前段 U-0a/U-0b で直列確定済み・builder は触らない）。これは T-6/T-7 と同じ前提条件であり、当時 workflow（Dynamic Workflows）が機能したレシピが既に確立している。

**方式の選択肢と判断**:

- **(a) workflow（Dynamic Workflows）で builder→reviewer をファンアウト**【採用候補・本命】: T-6/T-7 で検証済みのレシピ（手順＋チェックリスト＋reviewer 修正ループ）がそのまま使える。是正対象13本＋数本は T-6（A群18本）と同規模で、per-tool パイプラインの実効性が実証済み。実装を伴う是正（HTML コピー・サンプル復元等）もコード生成・scoped test・lint で完結するため workflow に載る。**ただし workflow エージェントはバックグラウンド実行で Playwright/GA に触れない**ため、視覚を伴う確認（U-16 再ゲート・生グリフのアイコン化の見た目確認）は workflow の外＝フォアグラウンドに置く（T-9 と同じ構造的分離）。**カナリアの扱い**: 本体の単一タイル化レシピは T-5 で検証済みのため改めての全本検証は不要だが、U-0b で天井基準4項目を新規追加するため、最初の1〜2本（実装を伴う U-1 と コピー文言中心の U-5 等の代表ペア）を意図的に先行させ更新済み収束チェックリストの運用適合性を検証してから、残りに展開する（cycle-220→cycle-225 本体で確立した「カナリア＝レシピ検証」原則の縮小適用）。
- **(b) 直接 fresh builder を並べる**【小規模なら可】: 是正本数が少ない（概ね5本未満）なら workflow を組むコストが見合わず、直接 builder→reviewer で個別に回す方が速い。これは AP-WF15／T-9 収束方法の閾値判断と同型。
- **判断**: 中以上13本＋低数本＝**概ね5本以上**のため、**(a) workflow ファンアウトを本命とする**。ただし「実装を伴う是正（U-1〜U-4・U-7〜U-10・U-13）」と「コピー文言のみの是正（U-5・U-6・U-11・U-12・U-14）」が混在するため、各パイプライン単位は1ツールに閉じ（1パイプライン=1ツール）、reviewer は当該ツール全体をゼロ視点で再評価する（差分レビューにしない＝U-15）。U-14 の低のみ群は各ツール独立 builder にファンアウトする（複数ツールを1 builder に束ねない＝AP-WF07）。**最終的な workflow 採否・パイプライン編成は PM が実行直前に是正本数を再確認して確定する**（本数が閾値未満なら (b) に切替）。

#### 各是正後の検証（U-15・fresh reviewer のゼロ視点再評価）

各是正ツールについて、**fresh な reviewer が当該ツール全体をゼロから「最高の価値」基準で再点検**する。差分確認（「指摘が直ったか」だけ）ではなく、ツール全体を新規に「最高の価値」基準・収束チェックリスト（天井基準4項目込み）で再評価する。指摘が出れば是正→再レビューを指摘ゼロまで反復し、**レビューのたびに新エージェント**を起こす（毎回ゼロ視点＝ドキュメント規定・cycle-220 伝播事故の再発防止と同じ原理）。reviewer は実装を伴う是正では Playwright をフォアグラウンドで使い実機確認する（バックグラウンド workflow reviewer は MCP 不可のため、見た目・操作の最終確認はフォアグラウンド reviewer が担う）。

#### 全是正後の締め（U-16〜U-18）

- **U-16 fresh UX 再ゲート**: フォアグラウンド Playwright で「最高の価値」基準にゼロから再ゲートする（w360/w1280・ライト/ダーク）。当初監査と同じく fresh エージェント・バッチ分割。**範囲は全34本を既定**（当初監査では「優」分類の初期ドラフトに是正対象が混入していた経緯があり、findings のレビュー過程で訂正済みだが、優分類運用の独立検証として全本を fresh で再評価する。PM 裁量で範囲を拡大することは許容するが縮小はしない）。指摘が出れば該当ツール単位タスクに分解し 1タスク1builder で修正（AP-WF07・T-9 収束方法と同型）、指摘ゼロまでループ。
- **U-17 自動チェックの PM 独立再実行**: `npm run lint && npm run format:check && npm run test && npm run build` を PM が独立に再実行し全通過を確認する（AP-WF16）。
- **U-18 再 push・cycle-completion 再実行**: ブログ（既に fresh レビュー承認済みの本サイクルブログ）を含め再 push（デプロイ）し、cycle-completion を再実行する。

### 完成の定義（後段）

- 全是正ツール（U-1〜U-14 対象）が「最高の価値」基準で fresh reviewer の指摘ゼロ。
- T-4b（更新後）・DESIGN・FAQ/howItWorks/subtitle と実 UI が整合（食い違いゼロ）。
- 機能後退ゼロ（regex-tester のサンプル投入・markdown-preview の HTML 取得など、旧機能・約束された機能が実 UI に存在）。
- 絵文字・生グリフ・生関数名・英語例外などリテラシー依存の露出ゼロ（DESIGN §3 準拠・Lucide＋可視ラベル）。
- `npm run lint && npm run format:check && npm run test && npm run build` が全通過（PM 独立再実行＝AP-WF16）。
- フォアグラウンド Playwright の fresh UX 再ゲートで指摘ゼロ。
- 収束チェックリストに天井基準4項目が恒久追加済み（U-0b・次回以降の再発防止）。
- ブログ含め再 push（デプロイ）済み・cycle-completion 再実行済み。

### 検討した他の選択肢と判断理由（後段）

- **是正の単位**: (a) 「UX 一括是正」で複数ツールを1 builder にまとめる【却下】1タスク1エージェント（AP-WF07）違反・cycle-220 の伝播事故と同じ「1エージェントが複数対象を横断して誤りを撒く」構造。(b) 中以上の各ツール=1タスク・1 fresh builder、低のみは傘タスク内で各ツール独立 builder にファンアウト【採用】トレーサビリティと品質を担保。
- **検証の方式**: (a) 是正した差分だけを reviewer が確認【却下】見逃しの根因が「天井基準を強制していなかった」ことなので、差分確認では同じ穴を再び見逃す。(b) fresh reviewer が当該ツール全体をゼロから「最高の価値」基準で再評価・毎回新エージェント【採用】当初監査が fresh ゼロ視点で穴を見つけた事実と整合し、伝播・見逃しを構造的に防ぐ。
- **実行機構**: (a) workflow ファンアウト【本命・約13本＋数本＝閾値以上のため】、(b) 直接 builder→reviewer【本数が閾値未満なら切替】。視覚を伴う確認は MCP 制約によりフォアグラウンドに置く（T-9 と同じ分離）。実行直前に本数を再確認して PM が確定する。
- **天井基準の置き場**: (a) 本サイクル限りのチェックとして使い捨てる【却下】同じ見逃しが次回以降も起こる。(b) 収束チェックリストに恒久追加し次回以降の全作業で強制【採用】根因（天井基準の未強制）を構造的に塞ぐ。
- **コピー方針の確定主体**: (a) 各 builder が②-16 判定軸で個別判断【却下】②-16 の「個別判断任せ＝ばらつき」を再生産。(b) PM が T-4b を前段で更新し機械適用【採用】markdown-preview/traditional-color-palette/cron-parser ビルダーの3点を一意に確定。

### 計画にあたって参考にした情報（後段）

- `docs/cycle-225/ux-gate-findings.md`（全指摘・深刻度・PM 判断・是正方針・根因の単一ソース）
- `docs/cycle-225/convergence-checklist.md`（天井基準4項目を恒久追加する対象）
- `docs/cycle-225/T-4b-transform-copy-policy.md`（コピー方針＝markdown-preview/traditional-color-palette/cron-parser ビルダーの更新対象）
- `docs/targets/`（ターゲット1・2 の likes/dislikes＝「最高の価値」の具体）
- `DESIGN.md`（§3 絵文字不可・Lucide 線画／§5 トグル／status 色）・`.claude/skills/frontend-design/SKILL.md`
- `docs/anti-patterns/planning.md`（AP-P07 来訪者の認知モデル／AP-P20 過度に具体的な計画の回避）・`docs/anti-patterns/workflow.md`（AP-WF07 1エージェント1タスク／AP-WF15 補修課題の振り分け閾値／AP-WF16 自動チェックの独立再実行）
- 本サイクル前段の知見（T-9 視覚検証はフォアグラウンド／workflow エージェントは MCP 不可／カナリア不要＝本体検証済みでレシピ確立済み）

## レビュー結果

### 計画レビュー（execution 着手前）

2観点（目的達成・再発防止／workflow 実行可能性）の reviewer で計画を精査。指摘ゼロまで反復した。

- **1巡目**: 対応必須7件＋workflow 実体明記。主要なものは——(a) A群の作業記述が実機と食い違い（既存簡素 \*Tile.tsx の「フル機能化」と読め、cycle-220 ②-4「機能劣後」を再生産する恐れ）。2 reviewer が独立に指摘。→「Component のフル機能を単一実装に作り直し→page.tsx 描画差し替え→Component.tsx 削除」へ全面是正。(b) kind 撤去の範囲が「DELETION UNIT 全体（タイル登録・プレビュー機構ごと）」であることを基本設計で確定、tile-grid は Phase10 用に残す線引きを明記。(c) workflow 実体（PM メインループのハーネス機能・バックグラウンド実行で MCP 不可）を明記し、視覚検証 T-9 をフォアグラウンドに置く根拠とした。(d) カナリアゲート T-5、変換系コピー方針ゲート T-4b、T-9 収束方法（1タスク1builder・閾値判断）を追加。
- **2巡目**: RevA 承認。RevB が Critical 1件（C-3: 簡素 \*Tile.tsx の撤去主体が builder 並列と T-8 に二重定義され、共有 tile-declarations.ts の一括 import を並列削除すると即ビルド破綻）。→ 撤去主体を T-8 一括に一本化（builder は簡素 Tile に触れない）。なお RevB が例示したツール間 Tile 横依存は実機ではコメント言及のみで、planner が事実訂正のうえ正確な依存（共有宣言＋自テスト＋プレビュー）で記録。
- **3巡目**: RevB 承認、Minor 1件（カナリア選定理由に旧表現が1箇所残存）。→ 全箇所「簡素 Tile 撤去は T-8 一括」に表現統一（grep で残存ゼロ確認）。
- **結果**: 2 観点とも承認。実行時破綻に直結する指摘ゼロで execution へ。

> 計画段階で C-3（隠れた共有依存による並列ビルド破綻）を捕捉できたのは多段レビューの成果。実装フェーズで踏んでいれば全本パイプラインが一斉に破綻していた。

### 実装レビュー（execution 中）

**T-5 カナリア（4本）の成果＝カナリアゲートの価値の実証**

カナリア4本（image-base64・regex-tester＝A群／json-formatter・unit-converter＝B群）を workflow（builder→reviewer 修正ループ・最大3巡）で再構築。本来の目的どおり、全34本へ展開する前に**レシピ（前段の手順＋チェックリスト）の穴を4件炙り出し、レシピ側を是正した**：

1. **C-3 の曖昧さ**: `role="status"` で readOnly `<textarea>` をラップしてもフォーム値変化は SR に読まれない。実テキストノードのサマリを要する旨を明記。
2. **A-4 の不足**: 英語の生例外（JSON.parse/RegExp）を ErrorMessage にそのまま渡せた。日本語化を必須化。
3. **検証コマンド義務の未明記**: builder が lint/format/scoped test を実行・添付する義務を明記（全体 build/test は PM が T-10）。
4. **散らかしファイル**: 作業用ファイルをリポジトリ直下に残さない旨を明記。

**特筆**: レシピを締め直した後に「合格3本」を更新 A-4/C-3 で再点検したところ、image-base64（C-3＝textarea への role=status）と regex-tester（A-4＝英語 RegExp エラー露出）に同種の欠陥が残存していた。緩い基準での「合格」だった。**30本へ撒く前にこれを捕捉・是正できたことがカナリアゲートの最大の価値**。最終的に4本すべて更新レシピで承認（189テスト PASS）、レシピ反映完了を PM 確認＝ゲート通過。

**T-4b の事実訂正**: traditional-color-palette のコピー可否を当初「あり（色コード）」としたが、cycle-220 ②-15 L348 の削除対象（短いコード・色を選ぶ/見るのが目的＝知る対象）に明記されていたため「なし」に訂正（原典照合で是正）。全34本のコピー可否を T-4b で確定。

**T-6 A群18本（workflow）**: 15/18 が3巡以内に reviewer 承認。NG3本＝cron-parser（page.tsx コメントが旧バグ挙動を説明したまま＝実装と矛盾）・email-validator（`.badge` の `border-radius:9999px` 未定義値）・qr-code（単一子要素の冗長 Fragment）。加えて PM の commit 前 tsc で image-resizer のテスト型エラー1件（builder の検証に型チェックが無くすり抜け）を検出。いずれも PM 側で builder→reviewer により是正し全18本承認。レシピ起因の指摘ゼロ。

**T-7 B群12本（workflow・git mv は PM が直列で先行実施＝並列衝突回避）**: 11/12 が承認。NG1本＝bmi-calculator（BMI メーターの目盛ラベルが等間隔配置で線形スケール・ゾーン塗りと乖離＝旧 Component からの先行欠陥）。`getMeterPercent` を logic.ts へ昇格し線形位置配置に是正、reviewer が Playwright で目盛とゾーンの一致を確認し承認。レシピ起因の指摘ゼロ。

**T-8 DELETION UNIT 一括撤去**: kind 機構（tile-definition.ts／tile-declarations.ts／generate-tiles-registry.ts＋test／生成物 tiles-registry.ts／internal/tiles ルート／簡素 \*Tile.tsx 20本＋test20本＝計47ファイル）＋package.json の generate:tiles-registry を撤去。tile-grid は Phase10 用に保持。reviewer がフルスイート（test 5314・build 成功・tsc ゼロ・dangling ゼロ・過剰削除なし）で承認。

**T-9 視覚検証（フォアグラウンド Playwright・5バッチ・全34本×w360/w1280×ライト/ダーク）**: 33本 PASS。指摘1本＝unix-timestamp の w360 で年入力欄が「2026」を末尾見切れ（モバイル幅＋ネイティブ number スピナー圧迫）→スコープ限定 CSS（スピナー抑止＋幅72px）で是正、w360 完全表示を視覚再確認。hydration（password-generator/dummy-text/unix-timestamp）mismatch ゼロ・コピー方針（あり/なし）・確定提示順・ダークコントラスト、全本仕様どおり。

**T-10 完成の定義の逐条確認（PM 独立再実行＝AP-WF16）**: 全項目達成を確認。

- Component.tsx 残存 **0本**（全34本削除＝二重実装ゼロ）／簡素 \*Tile.tsx 残存 **0本**／kind 機構撤去済み（tile-grid のみ保持）／internal/tiles 撤去済み。
- (new)/tools の単一実装ページ 35（34ツール＋一覧）。
- hydration error ゼロ（T-9 で確認）。視覚検証 指摘ゼロ（unix 是正後）。
- `npm run lint`（exit 0）／`npm run format:check`（exit 0）／`npm run test`（337ファイル 5306 passed/8 skipped・exit 0）／`npm run build`（exit 0・全 /tools ルート生成・/internal/tiles なし）。
- 作業単位の詳細記録は `docs/cycle-225/`（収束チェックリスト・群テンプレート・衝突回避方針・コピー方針）に保全。

### 後段 UX 是正レビュー（U-0a〜U-18）

cycle-completion 中に Owner 指摘で **全34ツールを「最高の価値」基準で UX/コピー critical 監査**（6バッチ・fresh エージェント）→**約20本に実在の問題**（機能・回帰レビューが見逃した UX/コピー/機能後退/正答性/デザイン整合の穴）を発見。サイクル再オープン→cycle-planning→cycle-execution。

- **前段（U-0a/U-0b）**: T-4b コピー方針更新（markdown=あり HTML コピー／traditional=あり 色コード／cron ビルダー=あり）と収束チェックリストに **G 群天井基準5項目を恒久追加**（G-1 魅力/直感性/操作性/モバイル/状態残留・G-2 リテラシー非依存・G-3 機能後退ゼロ・G-4 FAQ/UI 整合・G-5 結果の正答性）。3巡 fresh レビューで承認（うち1巡で「申告テンプレが C-1〜C-7 と本文 C-1〜C-8 が不整合」を fresh ゼロ視点が捕捉）。
- **縮小カナリア（U-1/U-5）**: 実装系 markdown-preview と コピー文言系 sql-formatter を先行し、更新済み収束チェックリストが実効的に機能することを確認後に展開。
- **本展開（U-2〜U-13・U-14）**: Dynamic Workflows で計23タスク fresh builder→fresh reviewer 修正ループ。全本承認。U-9 reviewer がレシピ起因の改善提案（A-7 を type=number 等にも拡張）を出し、次サイクルへ申し送り。
- **U-16 fresh UX 再ゲート（全34本）**: バッチA〜D で fresh ゼロ視点が**6件の新指摘を炙り出し全て是正**：(1) bmi-calculator .categoryLow を `--accent-strong`→`--fg-soft`（DESIGN §2 リンク色との混同解消）、(2) color-converter の G-1 状態残留違反（不正入力→入力修正でエラー残留）→ `onChange` でエラーのみクリア、(3) unix-timestamp FAQ「ミリ秒チェックボックス」を実 UI（SegmentedControl）に整合化、(4) html-entity encode 側 placeholder/label を「エンコード」表記で対称化、(5) json/yaml-formatter の `.controlLabel` に `white-space: nowrap` 追加（w1280 でも 2 行折返ししていた）、(6) hash-generator about 冒頭に「ハッシュとは何か」平易な一文＋shortDescription に SHA-384 補完。**「優分類」をゼロから疑う規律が、優分類リスト内の color-converter G-1 違反まで炙り出した**＝Owner 懸念の「優分類運用は信用に値しない」を実証。
- **PM 独立 tsc の捕捉力**: 各バッチ commit 前に PM が project 全体 tsc を独立実行する運用で、qr-code テストの ES2017 違反 regex フラグ・unix-timestamp meta.test.ts の faq optional 型エラーを捕捉→各 fresh builder で別個に修正。並列 workflow builder の限界を補完する設計が機能。
- **U-17 PM 独立自動チェック**: lint=0／format:check=0／test=5415 passed 8 skipped／build=0、全項目 green（AP-WF16）。

### 本サイクルで得た知見（workflow 運用）

- **カナリアゲートの実効性**: カナリア4本がレシピの穴4件（C-3 ライブリージョン／A-4 エラー日本語化／検証コマンド義務／散らかしファイル）を炙り出し、レシピを締め直した後に「合格3本」を再点検したところ image-base64・regex-tester に同種欠陥が残存。30本へ撒く前の是正で全体伝播を防いだ。単一基準クローン禁止＋客観チェックリスト＋カナリアでレシピ検証、という設計が cycle-220 の伝播事故の再発を構造的に防いだ。
- **workflow builder の型チェック限界**: 並列フェーズ中は作業ツリー共有のため builder が project 全体 `tsc` を信頼性高く走らせられず、型エラー（image-resizer テスト）がすり抜けた。**バッチ commit 前に PM が `tsc` で捕捉する運用**で補完（有効に機能）。
- **Next.js route の git mv で `.next/types/validator.ts` が stale 化**し pre-commit の tsc を落とす。commit 前 `rm -rf .next` で対処（補足事項に既述）。

### ブログレビュー

本サイクルの成果を題材に技術ブログ1本を執筆（`src/blog/content/2026-06-05-claude-code-dynamic-workflows-34-tools-rebuild.md`「Dynamic Workflowsで34ツールを1日で再構築した実数記録」）。Owner フィードバックで2度方向転換した：

1. 当初「ミスの防ぎ方（カナリア）」を主役にしたが、**新機能 Dynamic Workflows（2026-05-28 発表・Research Preview）の解説＋なぜ今回のワークロードに最適か**を主役へ建て直し（web-researcher で公式情報・発表時期・日本語記事の空きを裏取り＝`docs/research/2026-06-05-claude-code-dynamic-workflows.md`）。
2. 「エージェント数・トークン・時間などの客観数字は読者が『自分も使えるか』を判断する核心」との指摘で、**実数を主役に据え直し**、旧来の per-cycle 方式との定量比較を追加。

**重要な学び（PM の検証責務）**: 当初稿は「80エージェント・6.7Mトークン」を「検証不能」として省き、reviewer も「Bun 事例の数字」と誤認した（ハルシネーション）。実際は本プロジェクトの A群ワークフローの実数（出力ファイル `wyl1ubpog.output` の `agentCount=80`）。PM が一次ソース（ワークフロー完了通知の usage・出力ファイル）で全数字を照合して是正。旧方式のコストも code-researcher が cycle-200〜219 のフロントマターと git log から裏取り（20ツール/20セッション/延べ133.0h/暦11.2日）し、PM が独立検算で確認。トークンは「分母定義が違い厳密比較不能」と誠実に切り分けた（優位を誇張しない）。全面書き直しは別コンテキストの blog-writer で実施（古い原稿に引っ張られないため）。独立 reviewer が数字の再計算・公式ドキュメント実取得での機能照合・トークンの誠実さ・公平性（フル工程13.4h 同士の比較）を確認。最終の description 用語修正（サイクル→セッション）は blog-writer の報告が不正確だったため PM が直接修正・確認。サブエージェントの報告を一次ソースで照合してから受け取る規律を徹底した。

## キャリーオーバー

- **design-migration-plan.md のドキュメントドリフト**: 本サイクルで撤去した `tile-definition.ts`／`tile-declarations.ts`／`/internal/tiles` を現行/予定構成として記述した箇所（L51/L69/L137/L148/L177/L318 付近）が残存。B-490 のコードスコープ外のため未是正。次サイクルまたは B-337（Phase 11・計画書 archive 化）で更新する。backlog に起票する。
- **B-432（trustLevel 一括削除）が着手可能化**: 着手条件「B-490 完了後」を満たした。次サイクル以降で着手可能（backlog の Deferred→Queued 検討は cycle-completion / 次 kickoff で実施）。
- **遊び（ゲーム）の単一タイル化**: 本サイクルはツール34本のみ。ゲーム（GameLayout 系）は別サイクルで実施する（backlog 起票）。
- **workflow 運用知見の恒久化**: 「workflow builder は並列中に project 全体 tsc を走らせられない→PM がバッチ commit 前に型チェック」「Next route の git mv で `.next` stale→commit 前 `rm -rf .next`」「reviewer/builder の Playwright スクショ等の作業用ファイルをリポジトリ直下に置く違反が散発→tmp/ 配下のみに限定する規律」「機能・回帰レビューだけでは UX/コピーの天井基準は強制できない＝収束チェックリストに G 群天井基準を恒久追加すべき」を docs/knowledge/ または anti-patterns へ恒久化することを検討（次サイクルで判断）。
- **共通部品 ToggleSwitch の B-3 抵触**: U-16 バッチ B 再ゲートで参考所見として発見。`src/components/ToggleSwitch/ToggleSwitch.module.css` の ON 状態が `var(--accent)` 直塗りで、収束チェックリスト B-3「選択中の塗りに --accent を直接使わない」に文言上抵触。sql/text-replace/line-break-remover/base64/password-generator 等の ToggleSwitch 採用ツールに横断的に波及するが、本サイクル後段スコープ外。次サイクルで「DESIGN.md を更新するか／ToggleSwitch を --bg-invert に統一するか」を planner 判断する（backlog 起票）。
- **A-7 拡張**: U-9 reviewer が「共通部品 Input は type=date 限定でなく type=number/email/password/search/tel/url 全種を A-7 で要求すべき」と提案。dummy-text の段落数/文数入力は raw `<input type="number">` のままで Input 共通部品を使えていない。A-7 をレシピで拡張し、dummy-text を含む数値入力ツールを共通 Input に統一する（backlog 起票）。

## 補足事項

- 遊び（ゲーム）の単一タイル化は本サイクル外。次サイクル以降で別途起票・実施する。
- `ToolMeta.trustLevel` 削除（B-432）は「B-490 完了後」が着手条件のため本サイクル外（Deferred 据え置き）。
- cron-parser の真の JST 固定化（B-472）・image-base64 のデコード復元（B-457）等、特定ツール再構築に内包される個別論点は planning で対象ツールのタスクに織り込む。
- **知見（Next.js）**: B群の `git mv (legacy)→(new)` で route ディレクトリを移動すると、`.next/types/validator.ts`（ビルドキャッシュ・gitignore 済み）が旧 legacy パスを参照したまま stale 化し、pre-commit の `tsc --noEmit` が TS2307 で失敗する。**commit 前に `rm -rf .next` でキャッシュを捨てる**（次ビルドで再生成）。T-5（json-formatter/unit-converter の git mv）で発生・対処済み。T-7（B群 git mv 12本）でも PM は commit 前に同対処をすること。cycle 完了時に docs/knowledge/ へ恒久化を検討。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
