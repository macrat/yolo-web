---
id: 179
description: B-309（ダッシュボード機能フェーズ1: タイル基盤・縮小版）の再着手。タイル概念定義 + 型契約のみのスコープで、Phase 2.1 の 3 設計判断を本サイクル内で確定する。
started_at: "2026-05-05T00:37:48+0900"
completed_at: null
---

# サイクル-179

このサイクルでは、cycle-175 / 176 / 177 で 3 サイクル連続事故認定された B-309 を、cycle-178（B-363）の条件整備を経て改めて着手する。スコープは縮小版（タイル概念定義 + 型契約のみ）。DnD / 編集モード / localStorage 永続化 / Undo / モーダルは本サイクルのスコープ外。Phase 2.1 の 3 設計判断（URL 構成 / メタ型構造 / 1 対多サポート可否）を本サイクル内で確定させる。

## 実施する作業

採否は「## 作業計画」で確定済み。各タスクの **詳細は「## 作業計画 / 実施タスク」B-309-1〜7 を真実源として参照** すること（本チェックリストは進捗の可視化のみで、スコープの真実源ではない）。

- [ ] B-309: ダッシュボード機能の実装（フェーズ1: タイル基盤・縮小版）
  - [ ] B-309-1: 一次情報の Read と内在化（PM 本人責務 / サブエージェント委譲不可。書き換え後の `docs/design-migration-plan.md` Phase 2 / Phase 7 / Phase 8.2 / Phase 9 全体留意、cycle-178.md キャリーオーバー、cycle-177.md 誤り 1〜16、`src/lib/toolbox/` 全ファイル（コード本体だけでなくコメント / JSDoc / 型シグネチャ / テスト assert まで逐語）、`docs/anti-patterns/planning.md`）。Read 時に「cycle-176 投機的基盤層の未除去残部」（`tile-loader.ts` の variantId / DEFAULT_VARIANT_ID / loaderCache キー / `initial-default-layout.ts` の variantId、`types.ts` の `Tileable.href` / `ContentKind: "cheatsheet"`）を **未判断の残部** として識別する
  - [ ] B-309-2: Phase 2.1 #3「1 対多サポート可否」の一次情報点検（実ツール 34 種 + 遊び 20 種（ゲーム 4 + クイズ 15 + 占い 1）を一巡し、タイル化時に 1 対多が必要なケースが存在するかを実例ベースで列挙）。サブエージェント分担後、PM 本人がすべての報告を統合し (b)(c) 判定の意味範囲を再評価して 0 件 / 1 件以上 を判定する。**現コードの variantId 実装は cycle-176 投機的基盤層の未除去残部であり、「1 対多が必要」の根拠として扱わない**
  - [ ] B-309-3: Phase 2.1 の 3 設計判断（URL 構成 / メタ型構造（`Tileable.href` 存続可否 / `ContentKind: "cheatsheet"` メンバ存続可否を含む） / 1 対多サポート可否（variantId 系コード残部の存続評価を含む））を本サイクル内で確定（`docs/cycles/cycle-179.md` の決定セクションに各判断とその根拠を明記）
  - [ ] B-309-4: Phase 2.2「タイル概念定義」の現 plan doc 記述で十分かを点検（cycle-178 で書き込み済み、追補不要が原則。修正が必要ならその根拠を示してから plan doc 編集）。**Phase 2.2 タイル概念定義（道具箱内で完結する UI、操作はタイル内で閉じる）と `Tileable.href` 存続が論理整合するかを点検対象に含める**
  - [ ] B-309-5: 型契約の整備（B-309-3 結果に従ってメタ型 / 関連定義にタイル契約を追加。判断結果 3 通り（1 対 1 / 1 対多 / 複数バリエーション）それぞれに対する整合手順 + `Tileable.href` / `ContentKind: "cheatsheet"` 存続可否判断結果に応じた更新 + `src/lib/toolbox/` 残置ファイルのコメント / JSDoc / テスト assert の再点検を含む）
  - [ ] B-309-6: 検証（`tsc` / vitest 型契約テスト / lint / format / build がすべて成功 + 残置コードに旧設計の痕跡が無いか grep 点検（判断結果に応じた条件付き禁止語を含む） + **plan doc 修正の有無に関わらず代理指標 2 を再実施し、本サイクルで確定した 6 項目の判断と Phase 2.2 本文の整合を点検**）
  - [ ] B-309-7: 独立 reviewer による作業計画レビュー → 実装レビューを実施（reviewer skip 禁止、指摘事項が無くなるまで反復。reviewer 観点詳細は PM が決定するが、最低限のリスク領域は依頼時に伝達する）

## 作業計画

### 目的

cycle-175 / 176 / 177 で 3 サイクル連続事故認定された B-309「道具箱フェーズ 1」を、cycle-178（B-363）の構造的整備を経て **縮小版スコープ（タイル概念定義 + 型契約のみ）** で完了させる。「タイル」という語が後続 Phase（特に Phase 7 のツール 34 + プレイ 20 タイル化、Phase 9 のダッシュボード本体実装）の共通基盤として機能するために必要な (i) Phase 2.1 の 3 設計判断、(ii) Phase 2.2 の概念定義、(iii) 型契約 を、後続サイクル PM が一次情報として参照可能な形で確定させる。

直接の利益享受者は本サイクルでは存在しない（来訪者向け UI 変化なし）。本サイクル成果物は **後続サイクル PM への入力 = 一次情報** として価値を持つ。間接的に、Phase 7 / Phase 9 を経て M1a「特定の作業に使えるツールをさっと探している人」/ M1b「気に入った道具を繰り返し使っている人」へ「日常の傍にある道具」体験として届く。

### 来訪者価値の経路

本サイクルは来訪者から見えない（タイル概念定義 + 型契約のみ）。経路は次の通り:

1. **本サイクル**: Phase 2.1 の 3 判断確定 + Phase 2.2 概念定義整合確認 + 型契約整備（B-309-1〜7）
2. **Phase 3〜6（後続複数サイクル）**: 静的・一覧・トップ・ブログ詳細の新デザイン移行（タイル概念には触れない）。**B-309-3 #1 URL 判断結果がトップ採用の場合、Phase 4.4 トップ移行は Phase 9.2 で道具箱に置換される前提で実装される。本サイクルの判断結果が Phase 4.4 着手 PM の前提となり、Phase 9.2 で「移行した現行トップ内容をどう扱うか」の追加判断連鎖が発生する**
3. **Phase 7（ツール 34 + プレイ 20 の各 1 サイクル、計 54 サイクル）**: 各コンテンツの詳細ページ移行 + Phase 2.2 で確立した型契約に沿ったタイルウィジェットの単独実装（`/storybook` または詳細ページ内で単独表示確認）。本サイクルの判断結果（特に #3 の 1 対多サポート可否）が型契約の形を決め、各 Phase 7 サイクル PM が「型契約に沿うタイルを実装する」道筋になる。**注: 現 `docs/design-migration-plan.md` Phase 7.1 / 7.2 は「30 ルート」「13 ルート」と記載されているが、本サイクルの実体確認の結果これは誤り（実体は 34 + 20）。当該不一致の取り扱いは「## 作業計画 / 検討した他の選択肢と判断理由」の選択肢 U で確定（cycle-180 申し送りに記録）。**
4. **Phase 9.2 公開**: ダッシュボード本体（並び替え / 編集モード / 永続化 / Undo / モーダル等の代表的機能）が Phase 7 で揃った実タイル群の観察に基づき設計・実装され、道具箱が公開される
5. **公開後**: M1a / M1b ペルソナに「日常の傍にある道具」体験が届く

本サイクルが破綻すると、Phase 7 着手 PM が型契約を派生規則化で補完する蓋然性が高く、cycle-175〜177 と同型の連続失敗が再生産される。よって本サイクルの完了基準は「後続 Phase が型契約を派生規則化なしに利用できること」を含む。

### 作業内容

#### B-309-1: 一次情報の Read と内在化

**目的**: 派生規則化（誤り 15「タイル = ナビゲーションカード」、誤り 1〜16）の再生産を防ぐ。本サイクル PM が Phase 2.1 #3 / Phase 2.2 を **原文で内在化** することが、次の判断段階の前提になる。

**実施主体**: **本タスクは cycle-179 PM 自身が逐語で実施する。サブエージェントに委譲しない**（一次情報の内在化は PM 本人の責務、AP-P16 / AP-WF12 / 選択肢 W 却下と整合）。

**Read 対象（順序固定、原文を読む。要約・抜粋に依存しない）**:

1. `docs/design-migration-plan.md` の Phase 2 全文（特に 2.1 の 3 判断 / 2.2 のタイル概念定義 / 完了基準 / 注）
2. `docs/design-migration-plan.md` の Phase 7「ツール・遊び詳細 + タイル化」全文（特にステップ 3〜5 の単独レンダリング検証方針）
3. `docs/design-migration-plan.md` の Phase 8.2「cheatsheets ブログ記事化」全文（cheatsheet kind の Tileable 含有が Phase 8.2 と整合するかを判断する前提として）
4. `docs/design-migration-plan.md` の Phase 9 全体留意 informational note 全文
5. `docs/cycles/cycle-178.md`（B-363 全体、特に「キャリーオーバー」セクションの確定事項 / 縮小版前提 / コードベースの状態 / 構造的気付き 1〜3）
6. `docs/cycles/cycle-177.md`「事故報告」セクションの誤り 1〜16 + 全体構造として浮かび上がる「なぜそうなったか」5 種の逃避
7. `src/lib/toolbox/` 配下の現行コード全ファイル（types.ts / registry.ts / tile-loader.ts / FallbackTile.tsx / initial-default-layout.ts / generated/toolbox-registry.ts / **tests**/ 配下 4 件）。**コード本体だけでなくコメント / JSDoc / 型シグネチャ / テストの assert 内容まで逐語で Read する**（cycle-178 構造的気付き 1「コードコメント / 型シグネチャは plan doc 同等の入力構造」）。Read の過程で以下を **cycle-176 投機的基盤層の未除去残部 = 未判断の残部** として識別し、cycle-179.md の作業メモに列挙する:
   - `tile-loader.ts` L19-25 ヘッダコメント「Phase 7 の 1 対多サポート（variant 拡張ポイント）」記述
   - `tile-loader.ts` L52-63 `TileLoaderOptions.variantId` フィールドおよび JSDoc の Phase 7 拡張ポイント記述
   - `tile-loader.ts` L66-70 `DEFAULT_VARIANT_ID = "default"` 定数
   - `tile-loader.ts` L74-79 `loaderCache` の `${slug}:${variantId}` キー実装
   - `tile-loader.ts` L82-93 `_getCacheSize()` テストヘルパおよび「異なる variantId で別キャッシュエントリが積まれること」観測コメント
   - `tile-loader.ts` L131-153 `getTileComponent` 内の variantId 取り扱いと variant 別ロード分岐サンプル
   - `initial-default-layout.ts` L20-37 `tiles[].variantId?: string` フィールドおよび JSDoc
   - `types.ts` L10 `ContentKind` の `"cheatsheet"` メンバ
   - `types.ts` L48-54 `Tileable.href?: string` フィールド + JSDoc（「タイル = ナビゲーションカード」前提の根本的な型シグネチャ）
   - `types.ts` の `toTileable()` 多重定義のうち `cheatsheet` オーバーロード分
   - `registry.ts` の `getAllTileables()` が cheatsheet を含む統合
8. `docs/anti-patterns/planning.md`（特に AP-P01 / P03 / P04 / P06 / P12 / P14 / P16）と `docs/anti-patterns/workflow.md`（AP-WF04 / WF06 / WF07 / WF12 関連）
9. `docs/targets/` の M1a「特定の作業に使えるツールをさっと探している人」、M1b「気に入った道具を繰り返し使っている人」、M2「AI エージェント / オーケストレーション」（タイル化判断の上流価値）

**完了条件**: 以降の判断段階で plan doc / cycle-178 / cycle-177 の原文を引用しながら議論できる状態。要約や記憶からの参照に頼らない。Read 対象 7 で識別した残部リストが cycle-179.md 内に明記されている（後続タスクで「能動的に再評価する」入力として参照される）。

**禁止事項**:

- backlog の旧記述（cycle-178 で書き換え済み）に引きずられた前提を持ち込まない
- cycle-176 / 177 で投機的に実装されていた具体（DnD・編集モード・localStorage・Undo・モーダル・Tile / TileGrid / ToolboxShell / AddTileModal の C 群名）を「あった前提」として再導入しない（cycle-178 で意図的に除去済み）
- Phase 2.1 #3「アプリ本体（詳細ページ）/ ホーム画面ウィジェット（タイル）」の比喩を機械的に「タイル = ホーム画面ウィジェット」と断定しない（cycle-178 reviewer CRIT-3 / MAJ-A1 で相対化済み）

#### B-309-2: Phase 2.1 #3 「1 対多サポート可否」の一次情報点検

**目的**: 「1 対多が必要かは推測ではなく実コンテンツ群の一巡で決める」という plan doc Phase 2.1 #3 末尾の指示を満たす。

**点検対象**（cycle-179 PM が `ls src/tools/` および `src/play/games/registry.ts` / `src/play/quiz/registry.ts` / `src/play/registry.ts` の Read で実体確認済み — R2-CRIT-1 対応）:

- ツール群 **34 種**（src/tools/ 配下、`_components` / `_lib` / `generated` / `registry.ts` / `types.ts` を除く）: age-calculator / base64 / bmi-calculator / business-email / byte-counter / char-count / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter
- プレイ群 **20 種** = ゲーム 4 + クイズ 15 + 占い 1
  - ゲーム 4 種（`src/play/games/registry.ts` の `gameEntries`）: kanji-kanaru / yoji-kimeru / nakamawake / irodori
  - クイズ 15 種（`src/play/quiz/registry.ts` の `quizEntries`）: kanji-level / kotowaza-level / traditional-color / yoji-level / yoji-personality / impossible-advice / contrarian-fortune / unexpected-compatibility / music-personality / character-fortune / animal-personality / science-thinking / japanese-culture / character-personality / word-sense-personality
  - 占い 1 種（`src/play/registry.ts` の `fortunePlayContentMeta`）: daily

合計点検対象 = **34 + 20 = 54 件**。

**前提（判断順序の保護）**: 現コードに存在する `tile-loader.ts` の variantId / DEFAULT_VARIANT_ID / loaderCache キー実装、および `initial-default-layout.ts` の variantId フィールドは **cycle-176 投機的基盤層の未除去残部** であり（cycle-178 で `isEditing` / 「C 群」名 / DnD 言及は除去されたが variantId 系は残置）、本タスクの一巡点検における「1 対多が必要」の **根拠として扱わない**。残部の存続/撤去判断は B-309-3 #3 の判断結果から導出する（コード残部 → 判断 の順は誤り 4「結論先行・根拠書き換え」と同型のため禁止）。

**点検手順**:

1. 各コンテンツについて、現 `(legacy)/` 詳細ページの実装規模・I/O 形態・主要操作を把握（src/tools/{slug}/、src/play/games/{slug}/、src/play/quiz/data/{slug}.ts、src/play/fortune/ 等）。サブエージェントに委譲する場合でも各サブエージェントが扱うのは数件程度に留め、1 サブエージェント = 1 コンテンツ分担までは細分化しない（54 サブエージェントは過剰）。粒度の目安: ツール 34 件を 5〜7 件単位（5〜7 サブエージェント程度）、プレイ 20 件を 4〜5 件単位（4〜5 サブエージェント程度）。サブエージェントへのプロンプトには「Phase 2.1 #3 の比喩（アプリ本体 vs ホーム画面ウィジェット）を機械的に断定しない」「タイル = ホーム画面ウィジェット と決めつけない」を必ず含める
2. 各コンテンツについて「タイル = 道具箱内で完結する UI 単位（操作がタイル内で閉じる）」要件下で、(a) 詳細ページ本体をそのままタイルとして使えるか / (b) タイル用に簡素な別 UI（ホーム画面ウィジェット相当）を必要とするか / (c) 用途別に複数バリエーションを用意するか を実例として判定
3. **PM 本人がすべてのサブエージェント報告を統合する**。単純な OR 論理で「(b)(c) を発見したサブエージェントが 1 つ以上いれば 1 対多必要」と判定するのではなく、(b)(c) の **意味範囲粒度**（タイル概念定義との整合 / 各サブエージェントの (b)(c) 解釈が「ホーム画面ウィジェット」断定に流れていないか）を PM 自身が逐項目で再評価する。各サブエージェントが「発見しなかった」と報告した場合でも、PM が探索範囲の妥当性と意味範囲の漏れを点検する（cycle-178 構造的気付き「verify は文字列だけでなく意味範囲」）
4. PM 統合後、(b) または (c) が **1 件でも実在** すれば「1 対多サポートが必要」と結論。0 件なら「1 対 1 で十分」と結論
5. 結論に至った具体例（少なくとも代表的な 3〜5 件）を記録し、判断根拠として cycle-179.md に残す

**重要**: 結論を計画段階で先取りしない。点検は execution フェーズで実施し、その結果を B-309-3 の判断に渡す。計画書には「点検手順」のみ記す。

**派生規則化の予防**:

- 「ナビゲーションカードならばすべて 1 対 1」という暗黙の前提に陥らない（誤り 15 と同型）
- 「実装が大変だから 1 対 1 にしておく」は CLAUDE.md L9 違反（実装コスト基準）
- 「将来の拡張性を考えて常に 1 対多」も AP-P03（現状を所与にしない）の裏返し。実例 0 件なら 1 対 1 でよい
- **現コードの variantId 実装が存在することを「1 対多が必要な証拠」として読むのは誤り 4 と同型**。コード残部は B-309-1 で識別した「未判断の残部」であり、本タスクの結論を導く入力ではない

#### B-309-3: Phase 2.1 の 3 設計判断の確定

**判断対象（plan doc Phase 2.1 原文 + 本サイクルでの能動再評価項目）**:

1. **URL 構成**: トップ `/` 自体を道具箱とするか / 専用 URL（例 `/dashboard`、`/toolbox`）か / 複数道具箱（`/toolbox/[id]`）か
2. **メタ型構造**: 既存の `ToolMeta` / `PlayContentMeta` / `CheatsheetMeta` 分離維持か / 単一 `ToolboxItem` 相当への統合か / `Tileable` のような統一インタフェース型を加える形か。**本判断には以下 2 つの能動再評価サブ判断を含める**:
   - **2-a. `Tileable.href` フィールドの存続可否**: 現 `types.ts` L48-54 の `href?: string` は cycle-177 誤り 15「タイル = ナビゲーションカード前提（Stretched Link で詳細ページ遷移）」の根本的な型シグネチャであり、Phase 2.2 タイル概念定義（道具箱内で完結する UI、操作はタイル内で閉じる）と論理矛盾する蓋然性が高い。本サイクル PM が能動的に存続/撤去/変形（別フィールドに置き換え 等）の根拠を出して確定する
   - **2-b. `ContentKind: "cheatsheet"` メンバの存続可否**: 現 `types.ts` L10 の `ContentKind` に `cheatsheet` が含まれ、`getAllTileables()` も cheatsheet を統合している。一方 Phase 8.2 で cheatsheets はブログ記事として再編され `src/cheatsheets/` ディレクトリは Phase 8.2.h で撤去される計画。「ブログ記事 = タイル化非対象」とすれば cheatsheet を Tileable に持つ意義がない。本サイクル PM が能動的に存続/撤去の根拠を出して確定する
3. **1 対多サポート可否**: B-309-2 の点検結果に基づく。**本判断には以下の能動再評価サブ判断を含める**:
   - **3-a. variantId 系コード残部の存続評価**: 現コードに存在する `tile-loader.ts` の `TileLoaderOptions.variantId` / `DEFAULT_VARIANT_ID` / `loaderCache` キー（`${slug}:${variantId}`）/ `_getCacheSize()` テストヘルパおよび「異なる variantId で別キャッシュエントリが積まれること」観測 / `initial-default-layout.ts` L25-28 の `variantId?: string` は cycle-176 投機的基盤層の未除去残部。判断結果が「1 対 1 で十分」なら **これら variantId 系コード / コメント / テストの撤去が型契約整合の必須条件**。判断結果が「1 対多必要」または「複数バリエーション必要」を採るなら残置可（ただしコード残部の存在を判断の根拠としては使えない）

**判断手順**:

1. 各判断について、plan doc Phase 2.1 が示す **検討材料** を列挙（URL 構成: 「日常の傍にある道具」コンセプト、初回来訪者オンボーディング、SEO、複数端末利用、シェア URL（cycle-167 構想）との整合、Phase 9.2 で現行トップ内容をどう扱うか戦略 / メタ型: タイルとして扱うコンセプトとの整合、ツールと遊びでデータ・操作モデルが大きく異なるか、`href` の存続可否、`cheatsheet` メンバの存続可否 / 1 対多: B-309-2 結果、variantId 系コード残部の取り扱い）
2. 各判断について **2〜3 個の選択肢** を立て、それぞれの選択が後続 Phase（特に Phase 4 一覧 / Phase 7 タイル化 / Phase 8.2 cheatsheets 撤去 / Phase 9 公開）に与える影響を一次情報を引きながら評価
3. **本サイクル PM の責任で確定** する（Owner エスカレーション禁止、「次サイクル送り」禁止、「実機比較で決める」「暫定採用」禁止 — cycle-177 誤り 3 / 4-C 同型回避）
4. 確定判断（判断 1 / 2 / 2-a / 2-b / 3 / 3-a の 6 項目）と各選択肢の比較を cycle-179.md「## 作業計画 / 確定判断」セクションに記録

**完了基準**: 6 項目（1 / 2 / 2-a / 2-b / 3 / 3-a）それぞれが「採用 + 採用根拠 + 不採用とした選択肢の理由」の 3 点セットで明記されている。後続 Phase へ送る判断は無い。

**派生規則化の予防**:

- URL = トップを採用しても「現行トップ内容をどうするか」を Phase 9.2 へ送る場合は、送り先と送る内容を本サイクルで明示する（先送りそのものは合理的だが、無自覚な棚上げは禁止）
- メタ型「統合」を採るとしても、現行 3 メタ型（Tool/Play/Cheatsheet）を破壊的変更で書き換える計画は本サイクルでは立てない（cycle-178 で意図的に投機的基盤層を削除した方針を継続）。「`Tileable` のような統一インタフェース型」を加える形が現実的かを検証
- 「1 対多サポートを契約に入れておけば困らない」という保険思考は AP-P03 / cycle-178 で削除した投機的基盤層と同型。実例で必要性を裏付ける
- **`Tileable.href` / `ContentKind: "cheatsheet"` / variantId 系コード残部について「残しておけば後で必要になっても困らない」「破壊的変更を避けるため残す」「Phase 8.2 / Phase 9 で再判断すればよい」は、いずれも上記 1 対多保険思考と同型構造**。残置している事実は「判断済みの帰結」ではなく「未判断の残部」として扱い、本サイクル PM が能動的に存続可否の根拠を出す。残部を「結論を支える根拠」として用いることは禁止（誤り 4 同型）
- 6 項目の判断結果を計画段階で先取りしない（Owner 指示、選択肢 X 却下と整合）

#### B-309-4: Phase 2.2「タイル概念定義」の現 plan doc 記述の点検

**前提**: Phase 2.2 のタイル概念定義は cycle-178（B-363-1）で書き込み済み。代理指標 1 / 2 もパス済み（cycle-178 5th round で固定基準達成）。本サイクルでは原則 **追補せず**、点検のみ行う。

**点検手順**:

1. cycle-178 で書かれた Phase 2.2 タイル概念定義を逐語で Read
2. B-309-3 で確定した 6 項目と整合しているかを点検:
   - 判断 3 1 対多 / 3-a variantId 系コード残部 と plan doc 本文「3 形態が想定される」の整合
   - 判断 2-a `Tileable.href` 存続可否と Phase 2.2 本文「道具箱内で完結する UI、操作はタイル内で閉じる」記述の論理整合（タイルからどこかへ遷移する `href` は本質的にタイル内で閉じない設計の前提と矛盾する蓋然性が高いことを能動的に検証）
   - 判断 2-b `ContentKind: "cheatsheet"` 存続可否と Phase 8.2 cheatsheets ブログ記事化計画の整合
3. 整合していれば「修正不要」と確定。修正が必要なら、必要箇所と根拠（具体的な不整合点）を明示した上で plan doc を編集する
4. 修正した場合は cycle-178 で固定された代理指標 1 / 2 を **同一プロンプト・同一禁止語 / 必須語で再実施** し、パスを確認（修正で派生規則化を生んでいないか検出するため）。なお、修正不要時の代理指標 2 再実施は B-309-6 で別途実施する（本タスクでは plan doc 編集トリガ時のみ）

**派生規則化の予防**:

- 「本サイクル PM の好みで書き直す」は誤り 4「結論先行・根拠書き換え」と同型。修正は具体的な不整合点が観察された場合に限る
- 「補足を追加すれば親切だ」も AP（誤り 7 / 8 / 14 ルール追加で安心）と同型。書き加えた段落が新たな派生規則化の入口になる蓋然性を考慮

#### B-309-5: 型契約の整備

**スコープ**: B-309-3 の判断結果に従って、メタ型および関連定義に「タイルとして表示するためのインタフェース」を追加する。Phase 2.2 完了基準にいう「型契約がメタ型に追加され、`tsc` と関連単体テスト（型契約に対するテスト）が通る」状態を達成する。

**作業手順**:

1. B-309-3 #2 / 2-a / 2-b（メタ型構造 / `href` 存続可否 / `cheatsheet` メンバ存続可否）の判断結果に従って `Tileable` / `toTileable()` / `ContentKind` / `getAllTileables()`（src/lib/toolbox/types.ts および registry.ts）の構造を更新する。具体的には:
   - 判断 2-a が「`href` 撤去」なら `Tileable.href` フィールドおよび JSDoc を削除し、参照箇所（あれば）も合わせて修正
   - 判断 2-a が「存続」「変形」なら、その根拠を `href` 自体の JSDoc に記述（タイル概念定義との整合がどう保たれるか）
   - 判断 2-b が「`cheatsheet` 撤去」なら `ContentKind` から `cheatsheet` を除外し、`toTileable()` の cheatsheet オーバーロードと `getAllTileables()` の cheatsheet 統合分を削除
   - 判断 2-b が「存続」なら、その根拠を `ContentKind` の JSDoc に記述（Phase 8.2 cheatsheets ブログ記事化との整合がどう保たれるか）
2. B-309-3 #3 / 3-a（1 対多サポート / variantId 系コード残部）の判断結果 3 通りそれぞれに対する整合手順:
   - **判断結果 = 1 対 1 で十分**: `tile-loader.ts` の `TileLoaderOptions.variantId` フィールド / `DEFAULT_VARIANT_ID` 定数 / `loaderCache` キーの variant 部分 / `_getCacheSize()` テストヘルパおよび関連テスト assert / `initial-default-layout.ts` の `variantId?: string` フィールドおよび JSDoc / 「Phase 7 拡張ポイント」コメント記述を **撤去**。撤去せず残すことは投機的基盤層の再生産（cycle-176 構造的要因 (2)）と同型のため禁止
   - **判断結果 = 1 対多必要 / 複数バリエーション必要**: 既存 variantId 系コードを残置可能。ただしコメント / JSDoc に「Phase 2.1 #3 で確定した結論を実装している」旨と、判断根拠（B-309-2 で観察された具体的実例）への参照を追記する。残部の存在を「Phase 7 で必要になりそうだから」のような保険理由で残してはならない
   - 判断結果に応じてタイル用コンポーネント参照の表現方法（1 参照か 複数参照か）を型に反映
3. B-309-3 #1（URL 構成）の判断結果に従い、必要があれば道具箱ページの URL 構成や identifier 表現をメタ型または別ファイルに整理（URL = トップ採用なら本サイクルでは型レベルの追加変更不要となる場合あり）
4. **残置ファイルのコメント・型契約・サンプル実装の点検**（cycle-178 構造的気付き 1 を踏襲）: 削除や追加だけでなく、`tile-loader.ts` / `types.ts` / `FallbackTile.tsx` / `initial-default-layout.ts` / `registry.ts` の **コメント・JSDoc・例示コード・テスト assert** が本サイクル方針（6 項目の判断結果すべて）と整合しているかを `grep` 点検し、不整合があれば一緒に更新
5. 型契約に対する vitest テストを追加・更新（特定の初期レイアウト形状を固定するテストは追加しない — cycle-178 MID-A3 教訓）

**派生規則化の予防**:

- DnD / 編集モード / localStorage 永続化 / Undo / モーダル / Tile / TileGrid / ToolboxShell / AddTileModal は本サイクルでは **実装しない / 型にも追加しない**（cycle-178 で意図的に削除した投機的基盤層を再生産しない）
- 「Phase 9 で必要になりそうだから」を理由に型契約に edit / view モードフラグや永続化スキーマを書き加えない（cycle-176 構造的要因 (2) の同型再生産）
- 型契約は B-309-3 で確定した判断結果のみを実装する。「将来のため」は禁句

**完了条件**: B-309-6 の検証がパスする状態。

#### B-309-6: 検証

**実施内容**:

1. `npm run lint && npm run format:check && npm run test && npm run build` のフルセットを実行し、全成功を確認
2. `tsc` 型レベル検証が通る（vitest 内に型契約テストを置くか、`tsc --noEmit` で確認）
3. `src/lib/toolbox/` 配下の **残置ファイル全体** に対し、本サイクルで合意した方針に反する語が含まれていないかを `grep` 点検:
   - 常時禁止語: DnD / drag / drop / 編集モード / edit mode / localStorage / 永続化 / Undo / モーダル / TileGrid / ToolboxShell / AddTileModal
   - **判断結果 = 1 対 1 のときのみ禁止語**: `variantId` / `DEFAULT_VARIANT_ID` / `_getCacheSize` / 「1 対多」「variant 拡張ポイント」
   - **判断 2-a = `href` 撤去のときのみ禁止語**: `Tileable.href` および `href?:` の `Tileable` 型内出現
   - **判断 2-b = `cheatsheet` メンバ撤去のときのみ禁止語**: `ContentKind` 内の `"cheatsheet"`、`getAllTileables()` 内の cheatsheet 統合
4. 計画と実装の整合点検: B-309-3 の 6 項目の判断結果と plan doc / コードの整合を逐項目で確認
5. cycle-178 で固定した代理指標 1 / 2 を **plan doc 修正の有無に関わらず再実施**。代理指標 2 については、本サイクルで確定した 6 項目の判断結果と Phase 2.2 本文の整合を点検する目的で必ず実施する（cycle-178 5th round で「固定基準で派生規則化が発覚した前例」があるため、修正不要時こそ再実施が安全弁になる）。再実施は同一プロンプト・同一禁止語 / 必須語を使用

**完了条件**: 上記 1〜5 がすべてパス。

#### B-309-7: 独立 reviewer によるレビュー

**実施内容**:

- 計画レビュー: 本作業計画（cycle-179.md「## 作業計画」）に対して独立 reviewer 1 名によるレビュー。指摘事項が無くなるまで反復（reviewer skip 禁止 — 誤り 10 同型回避）
- 実装レビュー: B-309-1〜6 の実装結果に対して独立 reviewer 1 名によるレビュー。指摘事項が無くなるまで反復
- レビュー結果は cycle-179.md「## レビュー結果」に各ラウンドごとに記録（cycle-178.md と同じ運用）

**reviewer 観点の運用**: reviewer に伝える観点詳細はレビュー実施 PM が決定する（本計画書には観点詳細を書き込まない — Owner 指示）。ただし「観点詳細を書かない」と「リスク領域を一切伝えない」は別物として区別する。レビュー依頼時に PM は最低限以下のリスク領域を reviewer タスク依頼に含める（含める形式・粒度・追加観点は PM 判断）:

- (i) `src/lib/toolbox/` 残置コードと本サイクル 6 項目の判断結果との整合（特に `tile-loader.ts` / `initial-default-layout.ts` の variantId 系、`types.ts` の `Tileable.href`、`ContentKind: "cheatsheet"` の取り扱い）
- (ii) cycle-177 誤り 1〜16 の同型再生産チェック（特に誤り 3 / 4 / 7 / 8 / 10 / 11 / 13 / 14 / 15 / 16）
- (iii) cycle-178 構造的気付き 1〜3 の同型再生産チェック（コードコメント / JSDoc / テスト assert も plan doc 同等の入力構造として扱われているか / verify が文字列でなく意味範囲で行われているか / etc.）
- (iv) 計画段階の派生規則化予防条項追加が誤り 7 / 8 / 14「ルール追加で安心」と同型構造になっていないか

#### 完了基準（本サイクル全体）

以下のすべてを満たすことを **本サイクル内** に達成する:

- Phase 2.1 の 6 項目（URL 構成 / メタ型構造 / `Tileable.href` 存続可否 / `ContentKind: "cheatsheet"` 存続可否 / 1 対多サポート可否 / variantId 系コード残部の存続評価）が確定し、cycle-179.md に記録され、Active タスクとして残っていない
- Phase 2.2 の「タイル概念定義」が plan doc に書き込まれている状態が点検で確認されている（cycle-178 で書き込み済み、本サイクルでは整合のみ確認）。**plan doc 修正の有無に関わらず、B-309-3 確定後に代理指標 2 を 1 回再実施し、6 項目の判断結果と Phase 2.2 本文の整合が確認されている**。修正が必要だった場合は修正後に代理指標 1 / 2 がパス
- 型契約がメタ型 / 関連定義に追加され、`npm run lint && npm run format:check && npm run test && npm run build` がすべて成功
- 残置コードに旧設計（DnD / 編集モード / localStorage 永続化 / Undo / モーダル / C 群コンポーネント名）の痕跡が無い（grep 検証通過）。さらに、判断結果に応じた条件付き禁止語（1 対 1 確定時の variantId 系 / `href` 撤去確定時の `Tileable.href` / `cheatsheet` 撤去確定時の関連記述）も grep 検証通過
- 独立 reviewer によるレビュー（計画 + 実装）が指摘なし判定で完了
- B-309-7 の reviewer 指摘で前提が崩れた場合は **本サイクル内続行ではなく素直に事故認定**（誤り 16 同型回避）。具体的には、reviewer が「本サイクルで採った 6 項目の判断の 1 つ以上が誤りである」「型契約が後続 Phase で来訪者価値経路を阻害する」「タイル概念定義が誤読されている」のいずれかを指摘し、本サイクル内の修正で解消できないと PM が判断した場合は事故認定で閉じる

### 検討した他の選択肢と判断理由

#### 選択肢 X: 計画段階で 3 判断の結果を先回りして書き込み、execution は機械的に実装する

**却下理由**: 誤り 4「結論先行で根拠だけ書き換え、判断を planner / Owner に委譲」と同型。Owner 指示にも「判断結果そのものを計画段階で先取りして書き込まない」と明示。計画段階では「判断手順と完了基準」を明示し、判断結果は execution で一次情報を揃えてから下す。

#### 選択肢 Y: cycle-178 で立てた条件整備（plan doc 縮小 + 投機的基盤削除）を再評価せずに、本サイクルでも独立再評価する

**却下理由**: cycle-178「キャリーオーバー」の確定事項として「(e) 沈黙領域ルール明文化は取り下げ確定 / Phase 9.0 新設不採用 / (c) は明示的な追加判断」が明記されており、cycle-179 で再検討すれば 5 サイクル目失敗の蓋然性が上がる旨が申し送りされている。本サイクルは cycle-178 の確定事項を **そのまま受け入れて実装に進む**。

#### 選択肢 Z: タイル単独表示の Playwright 検証を本サイクルで実施し UI 視覚確認まで完了させる

**却下理由**: cycle-178 で書き換えられた Phase 2.2 完了基準は「Storybook 表示や hidden URL での視覚検証は本 Phase で行わない（実タイル不在の段階で視覚検証してもダッシュボード本体評価にはならない）」を明示。本サイクルで実タイルが揃っていない段階で Playwright 視覚検証を加えると、誤り 11（D 群スキップの逆形態）+ 投機的視覚仮設の構築になりかねない。視覚検証は Phase 7（実タイル群が揃う段階）で行う設計。ただし「型契約が後続 Phase 7 の Playwright 単独表示検証を阻害しない」ことは本サイクル完了基準に含める（B-309-6 の 4 番目）。

#### 選択肢 W: B-309-1（一次情報 Read）を「Read 済みの前提」で省略する

**却下理由**: 誤り 12「形式通過」と誤り 15「タイル概念の根本誤認（一次情報未 Read）」の同型再生産。Read は本サイクル PM 自身が逐語で実施する責務（AP-P16 / AP-WF12）。サブエージェント委譲もしない（一次情報内在化は PM 本人の責務）。

#### 選択肢 V: 実装を 1 つの大きなサブエージェントタスクに集約する

**却下理由**: CLAUDE.md「Keep task smaller」原則違反。B-309-2（一巡点検）は複数サブエージェントへ分割可能だが、B-309-3 の 3 判断確定は PM 自身、B-309-5 型契約整備は判断確定後の単一タスクとして委譲可能。粒度を保つ。

#### 選択肢 U: `docs/design-migration-plan.md` Phase 7.1 / 7.2 の数値（「30 ルート」「13 ルート」）の不一致をどう扱うか

**背景**: R2-CRIT-1 修正の過程で、cycle-179 PM の実体確認により以下の不一致を確認した:

- Phase 7.1 L170「30 ルート」 → 実体は **34 ルート**
- Phase 7.2 L173「13 ルート + result ページ」 → 実体は **20 ルート**（ゲーム 4 + クイズ 15 + 占い 1）

これは本質的に R2-CRIT-1 と同型の事実誤認（コードでの実体確認を省略し、過去サイクルの記述を一次情報として転記）。

**選択肢**:

- (a) 本サイクル内で plan doc 訂正: cycle-179 のスコープに `docs/design-migration-plan.md` Phase 7.1 / 7.2 の数値訂正を含める
- (b) backlog 起票: 別タスクとして起票し、本サイクルでは触れない
- (c) cycle-180 申し送り: 次サイクル PM への申し送りに記録し、本サイクルでは触れない

**採用**: **(c) cycle-180 申し送り**

**採用理由**:

- 本サイクルのスコープ厳守原則（タイル概念定義 + 型契約のみ。DnD / 編集モード / その他への波及を防ぐ縮小版前提）と整合する。plan doc 数値訂正は Phase 2.1 / 2.2 の判断確定とは独立した編集作業であり、本サイクル内に含めるとスコープ拡張になる
- Phase 7 着手はまだ先（Phase 3〜6 が間に挟まる）であり緊急性が低い。Phase 7 着手 PM が実体確認をする時点で訂正されていれば実害はない
- backlog 起票（選択肢 b）も合理的だが、cycle-179 R2-CRIT-1 の修正文脈（「コードでの実体確認を省略する同型構造」）と分離せずに次サイクル PM が一括で扱える形にする方が、関連付けが保たれる。cycle-180 PM がキャリーオーバー記述を読めば「同型の事実誤認が plan doc にも残っている」という背景込みで対処判断ができる

**不採用とした選択肢の理由**:

- (a) 本サイクル内訂正: スコープ拡張。「同型の事実誤認だから整合性のために本サイクルで訂正」という理由付けは、それ自体が cycle-176 構造的要因 (2)「投機的拡張」と同型構造（「ついでにやる」「整合性のために加える」）。本サイクルは縮小版スコープを守ることそのものが価値であり、関連事項であってもスコープ外は外す
- (b) backlog 起票: cycle-179 の修正文脈との関連付けが弱まる。cycle-180 PM が「なぜこの訂正が必要か」を背景込みで把握しにくい

**運用**: 本サイクル完了時の「## キャリーオーバー」セクションに以下を明記して cycle-180 PM へ申し送る:

- `docs/design-migration-plan.md` L170「30 ルート」→ 実体 **34 ルート** への訂正
- `docs/design-migration-plan.md` L173「13 ルート + result ページ」→ 実体 **20 ルート**（ゲーム 4 + クイズ 15 + 占い 1）への訂正
- L174 のゲーム列挙が **13 件**（cycle-178 時点での記述）になっており、`src/play/quiz/registry.ts` の 15 件と不一致。訂正範囲に含める
- 訂正の発生機序（コードでの実体確認を省略し過去サイクル記述を転記）と R2-CRIT-1 の同型構造であること
- 訂正時に併せて、Phase 7.1 / 7.2 の他の数値派生記述（「各 1 サイクル、計 N サイクル」等）も実体に基づき更新する必要がないか点検する

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md` Phase 2 全文（cycle-178 で書き換え後、L55-94 相当）/ Phase 7 ステップ 3〜5（cycle-178 で書き換え後）/ Phase 8.2「cheatsheets ブログ記事化」全文（`ContentKind: "cheatsheet"` 存続可否判断の前提）/ Phase 9 全体留意 informational note（cycle-178 で追記後）
- `docs/cycles/cycle-178.md` 全体（特にキャリーオーバーの確定事項 / B-309 縮小版の前提 / コードベースの状態 / 構造的気付き 1〜3）
- `docs/cycles/cycle-177.md`「事故報告」誤り 1〜16 + 全体構造として浮かび上がる「なぜそうなったか」5 種の逃避（特に誤り 3 / 4 / 7 / 8 / 10 / 11 / 13 / 14 / 15 / 16）
- `src/lib/toolbox/` 全ファイルの実体確認（types.ts L1-122、tile-loader.ts L1-158、registry.ts L1-72、FallbackTile.tsx L1-39、initial-default-layout.ts L1-63、generated/toolbox-registry.ts、**tests**/ 配下 4 ファイル）
- `src/tools/` 直下サブディレクトリ列挙（**34 ツールスラッグ確定** — `_components` / `_lib` / `generated` / `registry.ts` / `types.ts` を除く）/ `src/play/` の registry / games / quiz / fortune 構造（**ゲーム 4 + クイズ 15 + 占い 1 = 20 種を確定**。`src/play/games/registry.ts` の `gameEntries` / `src/play/quiz/registry.ts` の `quizEntries` / `src/play/registry.ts` の `fortunePlayContentMeta` を Read で実体確認）
- `src/tools/types.ts` の `ToolMeta` インタフェース、`src/play/types.ts` の `PlayContentMeta` インタフェース（B-309-3 #2 メタ型構造判断の前提）
- `docs/anti-patterns/planning.md`（特に AP-P01 / P03 / P04 / P06 / P12 / P14 / P16）/ `docs/anti-patterns/workflow.md`（AP-WF04 / WF06 / WF07 / WF12）
- `docs/targets/` の M1a / M1b / M2 各ペルソナ（来訪者価値経路の上流評価）
- `CLAUDE.md` Decision Making Principle (L9) / Owner ロール (L28) / PM ロール (L29) / Keep task smaller / Verify facts before passing to sub-agents / Use knowledge base
- `docs/constitution.md` ルール 4「Maintain all contents have the best quality in every aspect for visitors」

## レビュー結果

### R1（作業計画 v1）

reviewer 1 名による独立レビューを実施。**指摘事項あり（Critical 2 / Major 4 / Minor 3）**。

cycle-178 の構造的整備を経た再着手計画として、「実施タスク」を真実源とするチェックリスト整理、Phase 2.1 #3 の 1 対多サポート可否判断手順、cycle-177 誤り 1〜16 の再生産防止条項、計画段階で結論を先取りしない構造、reviewer skip 禁止の明記、Read 対象の具体列挙、選択肢 X / Y / Z / W / V の検討記録など、cycle-178 で確立した運用との整合は概ね保たれている。一方で、コードベース現状との照合で **B-309-3 の判断結果より先に 1 対多サポートを前提とした実装が残置していた事実** に対する取り扱いが計画段階で不十分である点に Critical を 2 件出す。これが解消されない限り、本サイクルの存在意義（タイル概念定義 + 型契約のみのスコープで Phase 2.1 の 3 判断を確定する）が、コード側の先取り実装と矛盾する形で破綻する蓋然性が高い。

#### Critical

**CRIT-1: B-309-3 #3「1 対多サポート可否」がコード側で既に「サポートする」前提で先取り実装されている事実を計画書が把握しておらず、判断順序が逆転するリスクが残存している**

- **問題箇所**: 「実施する作業」B-309-2 / B-309-3 / B-309-5、特に B-309-5 の作業手順 2「現状の `tile-loader.ts` の `TileLoaderOptions.variantId` / `DEFAULT_VARIANT_ID` および `initial-default-layout.ts` の `variantId?: string` フィールドが本判断結果と整合しているかを点検」
- **具体的な事実**:
  - `src/lib/toolbox/tile-loader.ts` L19-25 のヘッダコメントに「【Phase 7 の 1 対多サポート（variant 拡張ポイント）】」「`TileLoaderOptions.variantId` フィールドで拡張ポイントを確保する」と明記
  - `tile-loader.ts` L52-63 の `TileLoaderOptions` インタフェースが `variantId?: string` を持ち、JSDoc に「Phase 7（B-314）で『1 slug に複数 variant』を実現するための拡張フィールド」と記述
  - `tile-loader.ts` L138-139 で `loaderCache` のキーを `${slug}:${variantId}` に固定し、L66-70 の `DEFAULT_VARIANT_ID = "default"` を導入
  - `initial-default-layout.ts` L25-28 の `tiles[].variantId?: string`
  - `tile-loader.ts` L83-93 の `_getCacheSize()` テストヘルパが「異なる variantId で別キャッシュエントリが積まれること」を内部観測対象として固定
- **なぜ Critical か**: cycle-178 の構造的気付き 1「コードコメント / 型シグネチャは plan doc 同等の入力構造」「`storage.ts` / `useToolboxConfig.ts` のファイル削除だけでは構造的要因 (2) は完全には除去されない」が cycle-179 着手時点でも未解消。cycle-178 では `tile-loader.ts` の `isEditing?: boolean` / 「C 群」名・DnD 言及は除去されたが、「1 対多サポート（variantId 拡張ポイント）」は残置している。これは B-309-3 #3 の判断より先に「1 対多サポートが必要」という結論を **コードと型契約で先取り** している状態であり、cycle-176 の投機的基盤層と同型構造（誤り 15 / cycle-176 構造的要因 (2)）の **未除去残部**。本計画書 B-309-2 で「1 対多サポートが必要かを実例ベースで点検する」と書きつつ、コードはすでに「サポートする」前提で書かれているため、判断順序が逆転している（コードの帰結に判断を合わせる構造、cycle-177 誤り 4「結論先行・根拠書き換え」と同型）。
- **B-309-5 の手順 2 の表現**: 「整合しているかを点検」と書いてあるが、B-309-3 #3 で「1 対 1 で十分」と確定した場合に **`variantId` 関連実装をどう扱うか**（撤去するか、残すか、残すなら何の根拠で残すか）が計画書に書かれていない。判断結果 = 1 対 1 のとき、整合させる方法の選択肢（撤去 / 凍結 / 残置）が示されていなければ、execution PM が「コードがそうなっているから 1 対多のままにしよう」と結論先行で決める誘惑（誤り 4 同型）に陥る。
- **修正指示**:
  1. B-309-1 Read 対象の `src/lib/toolbox/` 配下に **`tile-loader.ts` の variantId 関連記述を「現状先取り実装の残部」として明示** する（cycle-178 で除去されなかった残部であることを cycle-178 構造的気付き 1 と接続して書く）
  2. B-309-2 の冒頭または「派生規則化の予防」末尾に「**現コードの `variantId` 実装は cycle-176 の投機的基盤層の未除去残部であり、『1 対多が必要』の根拠として扱わない**」を明記
  3. B-309-5 の手順 2 を、判断結果 3 通り（1 対 1 / 1 対多 / 複数バリエーション）それぞれに対する **整合手順** に書き直す。特に「1 対 1 確定時は `variantId` フィールドおよび関連 cache key 実装・テスト・JSDoc を撤去する」を明示する（残置で投機的基盤層を再生産しない）
  4. B-309-6 の grep 点検対象に「`variantId`」「`DEFAULT_VARIANT_ID`」を **判断結果 = 1 対 1 のときに限り** 禁止語として追加する条件を明記する

**CRIT-2: 「タイルとは何か」の概念定義に Tileable 型と `Tileable.href`、`getAllTileables()` が cheatsheet を含む事実が反映されておらず、Phase 2.1 #2「メタ型構造」判断の前提に齟齬がある**

- **問題箇所**: B-309-1 Read 対象 6（`src/lib/toolbox/` 全ファイル）、B-309-3 #2「メタ型構造」判断手順、B-309-4「タイル概念定義の点検」
- **具体的な事実**:
  - `src/lib/toolbox/types.ts` L10 に `ContentKind = "tool" | "play" | "cheatsheet"`
  - `types.ts` L48-54 に `Tileable.href?: string` フィールドが存在し、JSDoc に「未指定時は contentKind に応じたデフォルト URL を使用する: tool → /tools/{slug} / play → /play/{slug} / cheatsheet → /cheatsheets/{slug}」と書かれている
  - `registry.ts` L31-33 の `getAllTileables()` が tool / play / cheatsheet を統合した `Tileable[]` を返す
  - 一方、design-migration-plan.md Phase 8.2 では cheatsheets はブログ記事として再編され、`src/cheatsheets/` ディレクトリは Phase 8.2.h で撤去される計画。cheatsheets は「タイル化」対象として残るのか、ブログ記事 = タイル化非対象なのかが計画書 / コードで矛盾している可能性が高い
  - `Tileable.href` は cycle-177 誤り 15「タイル = ナビゲーションカード前提（Stretched Link で詳細ページ遷移）」の派生規則化の **根本的な型シグネチャ** であり、cycle-178 では除去されていない（cycle-178 キャリーオーバーの「更新済みファイル」リストに `types.ts` の `href` 関連記述は「`href` フィールドの『使用モード/編集モード』振る舞い仕様コメントを除去」のみ書かれており、`href` フィールド自体の存続根拠は再評価されていない）
- **なぜ Critical か**:
  - B-309-3 #2「メタ型構造」判断を「現 `Tileable` / `toTileable()` の構造を点検し、必要なら型定義を更新」（B-309-5 手順 1）として進めるとき、`Tileable.href` の存続が「タイル = 道具箱内で完結する UI、操作はタイル内で閉じる」という Phase 2.2 タイル概念定義と **矛盾する可能性が高い**。href = タイルからどこかへ遷移するリンク先 = 道具箱内で完結しない設計の前提。cycle-177 誤り 15 がコード側に残置している残部の 1 つ
  - cheatsheet が Tileable に含まれている事実は、Phase 8.2 の「cheatsheets ブログ記事化」と組み合わせると論理矛盾（ブログ記事はタイル化対象ではないはず）。B-309-3 #2 の判断時に「現 3 メタ型（Tool / Play / Cheatsheet）を破壊的変更で書き換える計画は本サイクルでは立てない」（B-309-3 派生規則化の予防 2）と書いてあるが、cheatsheet を Tileable に含める現状は本サイクルで **再評価しない限り Phase 4 / 7 / 9 で誤った前提に積み上がる**
- **修正指示**:
  1. B-309-1 Read 対象 6 に **`types.ts` の `href` フィールドおよび `ContentKind` の `cheatsheet` メンバを「cycle-177 誤り 15 / Phase 8.2 cheatsheets 撤去計画と矛盾する可能性のある残部」として明示** する
  2. B-309-3 #2 の判断手順に「**`Tileable.href` の存続可否（タイル = 道具箱内で完結する UI 概念定義との整合）**」と「**`ContentKind` への `cheatsheet` 含有の存続可否（Phase 8.2 cheatsheets ブログ記事化との整合）**」の 2 点を判断対象として明記する
  3. B-309-4 の点検手順に「Phase 2.2 タイル概念定義（道具箱内で完結する UI、操作はタイル内で閉じる）と **`Tileable.href` フィールドの存続が論理整合するか** を点検」を追加する
  4. B-309-5 手順 1 を「メタ型統合 / 分離の判断結果 + `href` 存続可否 + `cheatsheet` メンバ存続可否の 3 結果に従って `Tileable` / `toTileable()` を更新」に拡張する

#### Major

**MAJ-1: B-309-2 の点検手順がサブエージェント分担を明示しているが、PM 自身による判断責務との切り分けが曖昧で、cycle-178 構造的気付き「verify は文字列だけでなく意味範囲」の運用が落ちる**

- **問題箇所**: B-309-2 点検手順 1「サブエージェントに委譲する場合でも各サブエージェントが扱うのは数件程度に留め…ツール群を 5〜7 件単位、遊び群を 4〜5 件単位」
- **問題**: サブエージェント分担が許容されているが、(b)(c) の判定（「タイル用に簡素な別 UI を必要とするか」「複数バリエーションを用意するか」）はサブエージェントが個別に出すと、各サブエージェント間で「タイル」概念の相対化粒度が揃わない蓋然性がある（cycle-177 誤り 5「ペルソナ dislikes の意味範囲を機械的に拡大解釈」と同型構造、verify は文字列でなく意味範囲）。各サブエージェントは Phase 2.1 #3 の比喩を機械的に当てはめて「アプリ本体 vs ホーム画面ウィジェット」の二択を断定する蓋然性が高く、(c) 複数バリエーション選択肢が組織的に過小評価される。
- **修正指示**: B-309-2 の手順末尾に「**サブエージェント分担後、PM が全結果を統合し、(b)(c) 判定の意味範囲粒度（タイル概念定義との整合）を PM 自身が逐項目で再評価する**」を追加する。各サブエージェントへのプロンプトに「Phase 2.1 #3 の比喩を機械的に断定しない」「タイル = ホーム画面ウィジェット と決めつけない」を必ず含めることも明記する。

**MAJ-2: 完了基準に「Phase 2.2 タイル概念定義の現 plan doc 記述で十分かを点検」のパス条件が抜けている**

- **問題箇所**: 「### 完了基準（本サイクル全体）」L180「Phase 2.2 の『タイル概念定義』が plan doc に書き込まれている状態が点検で確認されている（cycle-178 で書き込み済み、本サイクルでは整合のみ確認）。修正が必要だった場合は修正後に代理指標 1 / 2 がパス」
- **問題**: 「修正が必要だった場合」のみ代理指標再実施が条件化されており、「修正不要と判定した場合」の再実施は不要となる構造。しかし B-309-3 で 3 判断確定後（特に #3 1 対多 / 形態判断結果が確定後）には Phase 2.2 本文の **意味解釈** が変わる蓋然性があり、本文を編集しなくても「3 形態」の重みづけが判断結果と整合するか代理指標 2 で再検証する価値がある。cycle-178 では 5th round で代理指標 2 失敗 → Phase 2.2 を肯定形に書き直し、と「固定基準で発覚した派生規則化」の前例があるため、再実施は B-309-3 確定後にも実施すべき。
- **修正指示**: 完了基準に「**B-309-3 の 3 判断確定後、Phase 2.2 本文を編集しなかった場合でも代理指標 2 を 1 回再実施し、3 判断確定後の解釈で『タイル概念誤読』が発生しないかを検証する**」を追加する。代理指標 2 のプロンプトを「3 判断確定結果」を含むコンテキストで再実施するか、または 3 判断確定結果を別プロンプトとして独立 LLM に与え「タイル」の質問への回答が変わらないかを観測する。

**MAJ-3: 「Phase 9.2 で必要になりそうだから」型契約に投機的フィールドを追加しないという派生規則化予防が、`Tileable.href` の存続根拠検証として書かれていない**

- **問題箇所**: B-309-3 #2 派生規則化の予防 2「『1 対多サポートを契約に入れておけば困らない』という保険思考は AP-P03 / cycle-178 で削除した投機的基盤層と同型」
- **問題**: 「保険思考は禁止」を 1 対多サポートのみについて書いているが、`Tileable.href` および `ContentKind: "cheatsheet"` も同型構造（「将来必要かもしれないから残す」「破壊的変更を避けるため残す」）の **保険思考残部** である。CRIT-2 で指摘した型シグネチャ残部の存続評価を、「保険思考の禁止」と紐付けて派生規則化予防として明記すべき。
- **修正指示**: B-309-3 #2 派生規則化の予防に「**現 `Tileable.href` および `ContentKind: 'cheatsheet'` メンバが残置している事実は『判断済みの帰結』ではなく『未判断の残部』として扱う。残置を理由に存続させる判断は『保険思考』として禁止し、本サイクル PM が能動的に存続可否の根拠を出す**」を追加する。

**MAJ-4: B-309-7 reviewer 観点の選定責任を「レビュー実施 PM が決定する」と書いているが、最低限の必須観点（cycle-178 の代理指標継承 / cycle-177 誤り 1〜16 同型再生産チェック / コード残部の派生規則化チェック）が抜ける蓋然性がある**

- **問題箇所**: B-309-7「reviewer に伝える観点はレビュー実施 PM が決定する（本計画書には観点を書き込まない — Owner 指示）」
- **問題**: Owner 指示で「観点を書き込まない」が記載されているのは尊重するが、観点の **下限（必ず含める観点）** すら書かないと、reviewer 工程の限界（cycle-177 誤り 12 形式通過と同型）が再生産される蓋然性がある。cycle-178 reviewer のレビュー履歴で「note 追加が誤り 7 / 8 / 14 のラインを超えていない」「(c-X') 逆判断」「タイル概念の相対化過剰」など、観点設計の質が結果を決めた事実があり、最低限の必須観点を計画段階で固定しないと、cycle-179 でも同じ質を再現できない。
- **修正指示**: B-309-7 に「**Owner 指示により観点詳細は計画書に書かないが、本計画書のレビューラウンドで明らかになった『計画書中で示唆されている再生産リスクの最低限』（コード残部の派生規則化 / 代理指標 2 再実施 / cycle-177 誤り 1〜16 同型 / cycle-178 構造的気付き 1〜3 同型）は reviewer タスク依頼時に必ず含める**」と明記する。「観点を書き込まない」と「リスク領域を伝えない」は別物として区別する。

#### Minor

**MIN-1: B-309-1 Read 対象 6（`src/lib/toolbox/` 全ファイル）に「コード本体だけでなくコメント・JSDoc・型シグネチャ・テストの assert 内容まで逐語で Read」が明示されていない**

- **問題箇所**: B-309-1 Read 対象 6
- **問題**: cycle-178 構造的気付き 1「コードコメント / 型シグネチャは plan doc 同等の入力構造」を踏まえれば、Read 対象が「コード本体」だけだと運用 sub-agent が「コードを読んだから OK」で済ませ、コメント・JSDoc に残る派生規則化の入力を見落とす蓋然性がある。
- **修正指示**: B-309-1 Read 対象 6 に「**コード本体だけでなくコメント・JSDoc・型シグネチャ・テストの assert 内容まで逐語で Read（cycle-178 構造的気付き 1）**」を明記する。

**MIN-2: 「来訪者価値の経路」の 5 段階で、Phase 4（一覧 / トップ）の位置付けが「タイル概念には触れない」と書かれているが、Phase 2.1 #1 URL 構成判断結果 = 「トップ採用」のとき Phase 4.4 トップ移行 → Phase 9.2 道具箱置換の連鎖が触れられていない**

- **問題箇所**: 「### 来訪者価値の経路」L38-43 段階 2-3
- **問題**: B-309-3 #1 で URL = トップを採用した場合、Phase 4.4（現行トップを新デザインへ移行）と Phase 9.2（トップを道具箱で置換）の連鎖が来訪者価値経路に追加される。本計画書の経路では段階 2-3 が「タイル概念に触れない」とだけ書かれており、URL 判断結果が Phase 4.4 の作業内容に与える影響が漏れている。
- **修正指示**: 来訪者価値経路の段階 2-3 に「**B-309-3 #1 URL 判断結果がトップ採用の場合、Phase 4.4 トップ移行は Phase 9.2 で道具箱に置換される前提で実装される。本サイクルの判断結果が Phase 4.4 着手 PM の前提となる**」を追加する。

**MIN-3: 「検討した他の選択肢と判断理由」選択肢 W の却下理由が「サブエージェント委譲もしない（一次情報内在化は PM 本人の責務）」と書かれているが、B-309-1 本文（L52-66）に同じ責務記述が抜けている**

- **問題箇所**: 選択肢 W L201-202、B-309-1 L51-67
- **問題**: 選択肢 W の却下理由には「Read は PM 自身が逐語で実施する責務」「サブエージェント委譲もしない」が明記されているが、B-309-1 本文の「目的」「Read 対象」「完了条件」「禁止事項」のいずれにも「PM 自身が Read する / サブエージェント委譲しない」が書かれていない。レビュー観点 7「一次情報の Read と内在化が PM 本人の責務として位置付けられているか」の対応が、選択肢却下理由のみに残っており、本文に格上げされていない。
- **修正指示**: B-309-1 の冒頭または完了条件に「**本タスクは cycle-179 PM 自身が逐語で実施する。サブエージェントに委譲しない（一次情報の内在化は PM 本人の責務、選択肢 W 却下と整合）**」を明記する。

#### サマリ

- **Critical 2 件**: コードベース残部（`tile-loader.ts` の variantId 拡張ポイント / `types.ts` の `href` + `cheatsheet` メンバ）が cycle-179 の B-309-3 判断より先に「結論」を先取り実装している事実が計画書に把握されていない。これが解消されないと、B-309-3 の判断が「コードに合わせる」結論先行構造（誤り 4 / 15 同型）に陥る蓋然性が高い。
- **Major 4 件**: サブエージェント分担後の PM 統合責務 / 代理指標 2 の B-309-3 確定後再実施 / 保険思考の禁止対象拡張 / reviewer 観点の最低必須リスク領域伝達。
- **Minor 3 件**: コメント / JSDoc までの Read 明示、URL 判断と Phase 4.4 の連鎖、PM 本人 Read 責務の本文格上げ。

#### 主要な再生産リスクの要旨

- 誤り 15 同型（タイル概念の根本誤認）: コード残部の存続評価が抜けると、`Tileable.href` の存在を理由に「タイル = ナビゲーションカード」前提が再混入する蓋然性
- 誤り 4 同型（結論先行・根拠書き換え）: コードに `variantId` が実装済みである事実を「1 対多サポートが必要」の根拠として読む構造が、B-309-2 / B-309-3 の判断順序を逆転させる
- 誤り 7 / 8 / 14 同型（ルール追加で安心）: 本計画書の構造的予防条項は丁寧だが、コード残部の存続根拠を再評価しないまま予防条項を追加するだけでは、誤り 7 / 8 / 14 と同型の「予防条項追加で安心」構造に陥る

R1 判定: **改善指示**。Critical 2 件の修正後に R2 を実施する必要がある。

### R2（作業計画 v2）

reviewer 1 名による独立 R2 レビューを実施。R1 指摘 9 件（Critical 2 / Major 4 / Minor 3）に対する解決確認 + 全体としての再点検。

#### R1 指摘の解決状況

- **CRIT-1 解決**: B-309-1 Read 対象 7 末尾の残部リストに `tile-loader.ts` L19-25 / L52-63 / L66-70 / L74-79 / L82-93 / L131-153、`initial-default-layout.ts` L20-37 が明示。B-309-2 前提セクションで「現コードの variantId 実装は cycle-176 投機的基盤層の未除去残部であり、『1 対多が必要』の根拠として扱わない」が明記。B-309-5 手順 2 で判断結果 3 通り（1 対 1 / 1 対多 / 複数バリエーション）それぞれの整合手順が分岐記述。B-309-6 第 3 番目で「判断結果 = 1 対 1 のときのみ禁止語: variantId / DEFAULT_VARIANT_ID / \_getCacheSize / 1 対多 / variant 拡張ポイント」を条件付き禁止語として明記。R1 指摘の本質（判断順序逆転リスク）を捉えており、結論先取りでも保険思考の単なる条項追加でもない。
- **CRIT-2 解決**: B-309-1 残部リストに `types.ts` L10 `cheatsheet` メンバ / L48-54 `Tileable.href` / `toTileable()` cheatsheet オーバーロード / `registry.ts` `getAllTileables()` の cheatsheet 統合が明示。B-309-3 #2 に 2-a（`Tileable.href` 存続可否）/ 2-b（`ContentKind: "cheatsheet"` メンバ存続可否）の能動再評価サブ判断が追加。B-309-4 点検手順 2 に「Phase 2.2 タイル概念定義（道具箱内で完結する UI、操作はタイル内で閉じる）と `Tileable.href` 存続が論理整合するか」「判断 2-b と Phase 8.2 cheatsheets ブログ記事化計画の整合」を追加。B-309-5 手順 1 が判断 2-a / 2-b の各分岐に対応。B-309-6 で判断 2-a / 2-b 撤去確定時の条件付き禁止語が明記。
- **MAJ-1 解決**: B-309-2 点検手順 3 に「PM 本人がすべてのサブエージェント報告を統合する。単純な OR 論理ではなく (b)(c) の意味範囲粒度を PM 自身が逐項目で再評価する」が明記。サブエージェントへのプロンプトに「Phase 2.1 #3 の比喩を機械的に断定しない」「タイル = ホーム画面ウィジェット と決めつけない」も明記。
- **MAJ-2 解決**: B-309-6 第 5 番目「plan doc 修正の有無に関わらず代理指標 2 を再実施」+ 完了基準「plan doc 修正の有無に関わらず B-309-3 確定後に代理指標 2 を 1 回再実施し 6 項目の判断結果と Phase 2.2 本文の整合を確認」で対応。
- **MAJ-3 解決**: B-309-3 派生規則化の予防に「`Tileable.href` / `ContentKind: 'cheatsheet'` / variantId 系コード残部について『残しておけば後で必要になっても困らない』『破壊的変更を避けるため残す』『Phase 8.2 / Phase 9 で再判断すればよい』は、いずれも 1 対多保険思考と同型構造。残置している事実は『判断済みの帰結』ではなく『未判断の残部』として扱い、本サイクル PM が能動的に存続可否の根拠を出す。残部を『結論を支える根拠』として用いることは禁止（誤り 4 同型）」を明記。
- **MAJ-4 解決**: B-309-7 で「Owner 指示により観点詳細は計画書に書かないが…『観点詳細を書かない』と『リスク領域を一切伝えない』は別物として区別」を明記し、(i)〜(iv) の最低必須リスク領域を依頼時に reviewer タスクへ含めると規定。
- **MIN-1 解決**: B-309-1 Read 対象 7 末尾に「コード本体だけでなくコメント / JSDoc / 型シグネチャ / テストの assert 内容まで逐語で Read（cycle-178 構造的気付き 1）」が明記。
- **MIN-2 解決**: 来訪者価値の経路段階 2 に「B-309-3 #1 URL 判断結果がトップ採用の場合、Phase 4.4 トップ移行は Phase 9.2 で道具箱に置換される前提で実装される。本サイクルの判断結果が Phase 4.4 着手 PM の前提となり、Phase 9.2 で『移行した現行トップ内容をどう扱うか』の追加判断連鎖が発生する」が明記。
- **MIN-3 解決**: B-309-1 「実施主体」見出しで「本タスクは cycle-179 PM 自身が逐語で実施する。サブエージェントに委譲しない（一次情報の内在化は PM 本人の責務、AP-P16 / AP-WF12 / 選択肢 W 却下と整合）」が明記。

R1 指摘 9 件すべて **解決**。修正は表面的な条項追加に流れず、判断手順 / 残部リスト / 条件付き禁止語など能動的判断構造として実装されている。R1 修正により計画書全体のスコープが拡張した（DnD / 編集モード / localStorage 等への言及増加）形跡もない。

#### Critical（R2 新規）

**R2-CRIT-1: B-309-2 の点検対象コンテンツ数（ツール群 35 種 / 遊び群 13 種）が実コードと不一致。AP-WF12 / AP-P16 / CLAUDE.md「Verify facts before passing to sub-agents」違反**

- **問題箇所**:
  - 「実施する作業」L17「実ツール 35 種 + 遊び 13 種」
  - B-309-2 点検対象 L90「ツール群 35 種（src/tools/ 配下）: age-calculator / base64 / ... / yaml-formatter（+ paths/recommendation/seo は対象外）」（実列挙は 34 件）
  - B-309-2 点検対象 L91「遊び群 13 種（src/play/games/ + src/play/quiz/data/ + src/play/fortune/data/）」
  - 「計画にあたって参考にした情報」L256「`src/tools/` 直下サブディレクトリ列挙（35 ツールスラッグ確定）/ `src/play/` の registry / games / quiz / fortune 構造（ゲーム 4 + クイズ 8 + 占い 1 = 13 種を確定）」

- **具体的な事実（reviewer による実体確認結果）**:
  - `ls /mnt/data/yolo-web/src/tools/*/` から `_components` / `_lib` / `generated` を除外したスラッグ数 = **34**（cycle-179.md の本文列挙とも一致、35 でも 30 でもない）
  - `paths` / `recommendation` / `seo` は `src/tools/` 配下に存在しない（「対象外」とした注記そのものが事実誤認、実体確認していない）
  - `src/play/quiz/registry.ts` の `quizEntries` 配列要素数 = **15** クイズ（kanji-level / kotowaza-level / traditional-color / yoji-level / yoji-personality / impossible-advice / contrarian-fortune / unexpected-compatibility / music-personality / character-fortune / animal-personality / science-thinking / japanese-culture / character-personality / word-sense-personality）
  - `src/play/games/registry.ts` の `gameEntries` = **4** ゲーム（kanji-kanaru / yoji-kimeru / nakamawake / irodori）
  - `src/play/registry.ts` の `fortunePlayContentMeta` = 1 件（slug: "daily"）
  - 合計 = **20 プレイコンテンツ**（design-migration-plan.md L173-175 と cycle-179.md L91 で言及される「13」とも、L256 の「ゲーム 4 + クイズ 8 + 占い 1 = 13」とも不一致。クイズは 15 であり、計算上の根拠 8 が誤り）
  - 結果として B-309-2 で点検すべき総コンテンツ数は **34 + 20 = 54 件**であり、計画書記載の「35 + 13 = 48」「30 + 13 = 43」とは一致しない

- **なぜ Critical か**:
  1. **B-309-3 #3「1 対多サポート可否」判断が破綻する蓋然性**: B-309-2 の (b)(c) 実例点検は「実ツール群を一巡して 1 対多が必要なケースが存在するかを実例ベースで確認」（plan doc Phase 2.1 #3 末尾「推測だけで結論を出さない」）が前提。点検対象が 35+13 と認識されている場合、サブエージェント分担後に PM が「全件カバーした」と統合した時点で実は 7 プレイコンテンツ（kanji-level / kotowaza-level / yoji-level / science-thinking / japanese-culture / word-sense-personality / daily fortune）が点検範囲から漏れている可能性が高い。漏れた 7 件のいずれかに (b)(c) が実在すれば、B-309-3 #3 の結論は「1 対 1 で十分」を誤って採る。これは **本サイクル最重要の判断のうちの 1 つを実例点検不在の状態で確定する** ことを意味し、cycle-176 構造的要因 (2)「投機的基盤層」の同型再生産（コード残部 variantId が本来必要だったのに 1 対 1 確定で撤去 → Phase 7 着手 PM が型契約を派生規則化で再追加）にも同型逆転（実は 1 対多必要だったのに 1 対 1 確定）にもつながる。
  2. **AP-WF12 / AP-P16 違反**: AP-WF12「計画書に登場する…コンテンツ数…を、ドキュメント・SSoT・過去サイクルの記述を一次情報として扱い、ファイルシステム/コードでの実体確認を省略していないか？」+ AP-P16「計画書のタスク列挙で…依拠する一次情報を `Read`・`grep` 等で実体確認したか？」の典型違反。具体的には design-migration-plan.md L170 / L173 の「30 ルート」「13 ルート」記述と、cycle-178 の Phase 7 縮小書き換え時に当該数値を持ち越した経緯（cycle-178.md Appendix B は数値そのものは触らずステップ 3〜5 のみ書き換え）を一次情報として扱い、`ls`・`cat src/play/*/registry.ts` で実体確認していない。
  3. **CLAUDE.md「Verify facts before passing to sub-agents」違反**: cycle-179 PM が B-309-2 をサブエージェントに分担する際、「ツール群 35 種 / 遊び群 13 種」を伝達対象として渡す前提が成立している。CLAUDE.md L18-19「Always verify using files or commands first. In particular, site basics ... must be confirmed via `git log`, `ls`, or equivalent commands before being communicated. Unverified information passed to sub-agents can corrupt research documents and propagate errors across future cycles.」に直接違反。
  4. **cycle-178 構造的気付き 1「コードコメント / 型シグネチャは plan doc 同等の入力構造」の同型再生産**: 本件の発生機序は「plan doc の数値を一次情報として転記、コード側で実体確認を省略」という構造で、cycle-178 で整理された「plan doc とコード両方を一次情報として扱う」原則の片側（コード）が抜け落ちている。

- **修正指示**:
  1. cycle-179 PM 自身が `ls /mnt/data/yolo-web/src/tools/*/` および `src/play/registry.ts` / `src/play/games/registry.ts` / `src/play/quiz/registry.ts` を Read で実体確認した上で、正確な総数（実コードの実体）と全スラッグリストを cycle-179.md の B-309-2 点検対象に **書き換える**。「35」「13」「30」の数値はすべて実体確認の結果に基づいて訂正。
  2. 訂正の過程で `paths` / `recommendation` / `seo` が `src/tools/` 配下に **存在しない** ことも確認し、「対象外」注記そのものを削除（実在しない名前を「対象外」と注記する構造は「実体確認していない」の自己証明）。
  3. 「計画にあたって参考にした情報」L256「ゲーム 4 + クイズ 8 + 占い 1 = 13 種を確定」の計算根拠（特にクイズ 8 → 実際 15）を実体確認の結果で訂正。
  4. **design-migration-plan.md Phase 7.1 「30 ルート」/ Phase 7.2 「13 ルート」の数値も実体不一致である事実を本サイクルでどう扱うか** を計画書で明記する。本サイクルのスコープ（Phase 2.1 / 2.2 完了）外なので即時修正は必須ではないが、(a) cycle-179 内で plan doc 側も訂正する / (b) 訂正タスクを backlog 起票して本サイクル外で対処する / (c) 本サイクル完了後のキャリーオーバーで cycle-180 PM へ申し送る、のいずれを採るかを PM が能動的に判断して書く。**判断回避（「気付いたが触らない」）は誤り 4「結論先行・根拠書き換え」と同型構造のため禁止**。

#### Major（R2 新規）

なし。

#### Minor（R2 新規）

なし。

#### サマリ

- R1 指摘 9 件: **すべて解決**（Critical 2 / Major 4 / Minor 3）。修正は能動的判断手順として実装されており、表面的条項追加・結論先取り・スコープ拡張のいずれにも該当しない。
- R2 新規指摘: **Critical 1 件**（B-309-2 の点検対象コンテンツ数の実体不一致、AP-WF12 / AP-P16 / CLAUDE.md「Verify facts before passing to sub-agents」違反）。
- 主要な再生産リスクの要旨:
  - 本 Critical を放置すると、cycle-178 構造的気付き 1（plan doc とコード両方を一次情報として扱う）の片側欠落、cycle-176 構造的要因 (2) の同型再生産（B-309-3 #3 を実例点検不在で誤って確定）、AP-WF12 が想定する「コンテンツ数の実体確認省略」典型例の 5 サイクル目連鎖、のいずれもが現実化する蓋然性が高い。

R2 判定: **改善指示**。Critical 1 件の修正後に R3 を実施する必要がある。

### R3（作業計画 v3）

reviewer 1 名による独立 R3 レビューを実施。R1（Critical 2 / Major 4 / Minor 3）+ R2（Critical 1）指摘の解決確認 + 全体としての再点検（R2 とは独立な視点）。

#### R1 / R2 指摘の解決状況

- **R1 全件解決の継続確認**: R2 修正で再生・劣化していないことを確認。
  - CRIT-1（variantId 系判断順序逆転リスク）: B-309-2 前提セクション L98 の「現コードの variantId 実装は cycle-176 投機的基盤層の未除去残部であり、『1 対多が必要』の根拠として扱わない」、B-309-3 #3 サブ判断 3-a、B-309-5 手順 2 の判断結果 3 通り分岐、B-309-6 第 3 番目の条件付き禁止語が R2 修正後も維持されている。
  - CRIT-2（`Tileable.href` + `cheatsheet` メンバ未判断残部）: B-309-3 #2 サブ判断 2-a / 2-b、B-309-4 点検手順 2、B-309-5 手順 1、B-309-6 条件付き禁止語が維持。
  - MAJ-1〜4 / MIN-1〜3: R2 で確認した記述が R3 時点で変質していない（PM 統合責務 / 代理指標 2 再実施 / 保険思考対象拡張 / reviewer 観点 (i)〜(iv) / Read 対象逐語化 / URL 判断連鎖 / PM 本人 Read 責務）。
- **R2-CRIT-1 解決**: reviewer による実体再確認結果と整合。
  - `ls /mnt/data/yolo-web/src/tools/` から `_components` / `_lib` / `generated` / `registry.ts` / `types.ts` 除外で **34 ディレクトリ**（実列挙: age-calculator 〜 yaml-formatter で 34 件、cycle-179.md L90 の列挙と一致）。
  - `src/play/games/registry.ts` の `gameEntries` = **4 件**（kanji-kanaru / yoji-kimeru / nakamawake / irodori、cycle-179.md L92 の列挙と一致）。
  - `src/play/quiz/registry.ts` の `quizEntries` = **15 件**（kanji-level 〜 word-sense-personality、cycle-179.md L93 の列挙と一致）。
  - `src/play/registry.ts` の `fortunePlayContentMeta` = **1 件**（slug: "daily"、cycle-179.md L94 と一致）。
  - 合計 **34 + 20 = 54 件**（cycle-179.md L96 と一致）。
  - 旧版にあった `paths` / `recommendation` / `seo` を「対象外」とした注記は削除済み。代わりに L90 の除外条件として `_components / _lib / generated / registry.ts / types.ts` の正しい除外リストが記述されている。
  - design-migration-plan.md L170「30 ルート」/ L173「13 ルート + result ページ」の不一致は「## 作業計画 / 検討した他の選択肢と判断理由」選択肢 U で「(c) cycle-180 申し送り」として PM 判断確定済み。判断回避ではなく能動的判断として記録されている。

R1 / R2 指摘合計 10 件 **すべて解決**。修正は能動的判断構造として実装され、表面的条項追加・結論先取り・スコープ拡張のいずれにも該当しない。

#### Critical（R3 新規）

なし。

#### Major（R3 新規）

なし。

#### Minor（R3 新規）

なし。

#### 全体見直し（観点 3〜5）の所見

- **観点 3 / Phase 2.1 完結性**: 6 項目の判断（1 / 2 / 2-a / 2-b / 3 / 3-a）はそれぞれ B-309-3 で確定 → B-309-5 で型契約に反映 → B-309-6 で grep 検証、と本サイクル内に閉じている。Owner エスカレーション禁止 / 次サイクル送り禁止 / 暫定採用禁止が L132 に明記され、選択肢 X 却下とも整合。
- **観点 3 / B-309-2 サブエージェント分担粒度**: ツール 34 件を 5〜7 件単位（5〜7 サブエージェント）、プレイ 20 件を 4〜5 件単位（4〜5 サブエージェント）の目安は CLAUDE.md「Keep task smaller」と現実的な並列度の両立として妥当。54 サブエージェント分割は過剰として却下される旨も明記されており、過細分化への防壁が機能している。
- **観点 3 / B-309-5 型契約手順の網羅性**: 判断結果 3 通り（1 対 1 / 1 対多 / 複数バリエーション）すべてに対する分岐手順が L175-178 に具体的に記述。`Tileable.href` 撤去/存続/変形の 3 通り、`ContentKind: "cheatsheet"` 撤去/存続の 2 通りも各分岐に対応した手順が L171-174 に記述されている。
- **観点 3 / B-309-6 検証の judge 可能性**: 1〜5 番目すべてが二値判定可能（フルセット成功 / `tsc` パス / grep 0 件 / 6 項目整合 / 代理指標 2 パス）。
- **観点 3 / 完了基準達成判定**: L226-231 の 6 条件すべてが具体的な検証手段に対応している（L226: cycle-179.md 記録 / L227: 代理指標 2 再実施 / L228: lint+test+build / L229: grep / L230: reviewer / L231: 事故認定）。
- **観点 3 / スコープ縮小の維持**: 派生規則化の予防条項（B-309-3 / B-309-5）に「DnD / 編集モード / localStorage / Undo / モーダル / Tile / TileGrid / ToolboxShell / AddTileModal は本サイクルで実装しない / 型にも追加しない」が L185 で明記され、cycle-178 で意図的に削除した投機的基盤層の再生産を防ぐ防壁が機能している。
- **観点 3 / キャリーオーバー粒度**: cycle-180 PM が背景込みで把握できる水準。「30 ルート → 34 ルート」「13 ルート → 20 ルート」「L174 の個別ゲーム列挙が quiz registry 15 件と不一致」「発生機序 = コードでの実体確認省略 / cycle-179 R2-CRIT-1 と同型構造 / AP-WF12・AP-P16・CLAUDE.md「Verify facts before passing to sub-agents」違反系統」「派生計算（『各 1 サイクル、計 N サイクル』等）の同時点検」が網羅されており、cycle-180 PM が起票時に背景を再構築できる。
- **観点 4 / 保留範囲の妥当性**: R2 修正レポートで「`tile-loader.ts` L19-25 / L52-63 / L66-70 / L74-79 / L82-93 / L131-153 の引用範囲」「`initial-default-layout.ts` L25-28」を訂正範囲外として保留した判断は、reviewer の実体確認上も妥当（cycle-179.md L62-68 の引用は実際のコード位置と概ね一致しており、訂正必要箇所ではない）。R2-CRIT-1 が指摘した範囲（点検対象数の事実誤認）と、R2 で指摘されていない範囲（コード参照の引用行番号）を分離している姿勢は、cycle-177 誤り 4-C「『ついでに』修正でスコープ拡張」と逆方向の正しい判断境界。「保留」が判断回避（誤り 4-C 同型）になっている形跡はない。
- **観点 5 / 派生規則化の予防**: R2 修正で追加された「選択肢 U」「キャリーオーバー追記」は、いずれも「条項追加で安心」（誤り 7 / 8 / 14 同型）ではなく、(i) 同型事実誤認の能動的検出、(ii) 「ついでに修正」の誘惑への能動的拒否（選択肢 U の (a) 不採用理由が cycle-176 構造的要因 (2)「投機的拡張」と同型構造であることを明示している）、(iii) 次サイクルへの背景込み引き継ぎ、として機能している。条項追加というよりも「構造的予防の連鎖を維持しつつ、本サイクルのスコープを守る」判断記録になっている。

#### サマリ

- R1 指摘 9 件 + R2 指摘 1 件: **全件解決**。修正は能動的判断構造として実装されており、R1 → R2 → R3 の修正過程を通じて結論先取り・スコープ拡張・保険思考の混入は観察されない。
- R3 新規指摘: **なし**（Critical 0 / Major 0 / Minor 0）。
- 全体見直し（観点 3〜5）でも、Phase 2.1 / 2.2 完了基準達成に必要な修正点は観察されない。

R3 判定: **R3 指摘事項なし → execution へ進める**。本サイクルの計画段階レビュー（B-309-7 計画レビュー部分）は完了。実装着手後の reviewer による実装レビューは別途実施が必要。

## キャリーオーバー

<このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

### cycle-180 PM への申し送り（R2-CRIT-1 修正に伴うスコープ外訂正項目）

R2-CRIT-1 修正の過程で、`docs/design-migration-plan.md` Phase 7.1 / 7.2 の数値も実体不一致であることが判明したが、本サイクルのスコープ厳守原則（タイル概念定義 + 型契約のみ）と整合させるため、訂正は cycle-180 以降に申し送る（「## 作業計画 / 検討した他の選択肢と判断理由」選択肢 U で確定）:

- `docs/design-migration-plan.md` L170「30 ルート」→ 実体 **34 ルート**（src/tools/ 配下のスラッグ実体確認結果）
- `docs/design-migration-plan.md` L173「13 ルート + result ページ」→ 実体 **20 ルート**（ゲーム 4 + クイズ 15 + 占い 1）
- L174 のゲーム列挙が **13 件**（cycle-178 時点での記述）になっており、`src/play/quiz/registry.ts` の `quizEntries` 15 件と不一致。訂正範囲に含める
- 発生機序: コードでの実体確認を省略し、過去サイクル記述を一次情報として転記（cycle-179 R2-CRIT-1 と同型構造、AP-WF12 / AP-P16 / CLAUDE.md「Verify facts before passing to sub-agents」違反系統）
- cycle-180 PM が訂正タスクを起票する際は、同時に Phase 7.1 / 7.2 の派生計算（「各 1 サイクル、計 N サイクル」等）が plan doc 内にあれば実体に基づき更新する

## 補足事項

- B-309 は cycle-175 / 176 / 177 と 3 サイクル連続事故認定の対象。cycle-178（B-363）で構造的原因（入力資料のフィルイン強制構造 / 投機的基盤層のコード汚染）の整備が完了し、本サイクルで再着手する。
- cycle-178 で書き換えられた `docs/design-migration-plan.md` Phase 2 を一次情報として Read し、backlog 旧記述に引きずられないこと。
- cycle-177.md の誤り 1〜16 を計画前に必ず Read すること（同型の失敗を再生産しない）。
- B-364（cycle-175〜178 連続事故と回復のブログ化再判断）は本サイクル完了後に着手判断するため、Deferred に置いている。

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
