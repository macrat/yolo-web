---
id: 192
description: B-399 keigo-reference 詳細ページ全体の (legacy)→(new) 移行（Phase 7 第 2 弾）。cycle-191 で整えた基盤（新版共通コンポーネント / TileVariant 型 / 検証場所 `/internal/tiles`）の上で、keigo-reference の詳細ページ本体を `(new)/tools/keigo-reference/` 配下へ移行し、`docs/tool-detail-page-design.md` 確定の 4 階層構造（識別 / 使用 / 信頼・透明性 / 生活への組み込み）で再構築する。
started_at: 2026-05-14T23:08:42+0900
completed_at: null
---

# サイクル-192

このサイクルでは B-399（P1）に取り組む。cycle-191 が「Phase 7 第 1 弾基盤整備」として新版共通コンポーネント群・タイルシステム基盤・検証用タイル 2 件までを完遂したのを受け、本サイクルは「Phase 7 第 2 弾本格移行」として keigo-reference 詳細ページ本体を `(legacy)→(new)` へ移行する。`docs/tool-detail-page-design.md` で確定した 4 階層構造（識別 / 使用 / 信頼・透明性 / 生活への組み込み）に沿った新ページを構築し、(legacy) のページを撤去するところまでを射程とする。なお `(new)/tools/` 配下で初めての本格詳細ページとなるため、後続 Phase 7 移行サイクルの参照実装となることも意識する（ただし B-401「テンプレ化」は第 3-5 弾完了後の評価で行うため、本サイクルでは設計ドキュメント化はしない）。

## 実施する作業

### サイクル全体の運用ルール（cycle-191 から継承）

cycle-191 で確立した 6 つの運用ルールを本サイクルでもそのまま適用する。違反があれば該当タスクを Done にしない。

1. **実体確認後に書く**（AP-WF12 / AP-P16）: 計画書 / 設計ドキュメント / 実装中に登場する API 名 / prop 名 / フィールド名 / ファイルパス / 件数は、Read / grep / ls で実体を確認した **直後** に書く。
2. **ファイルを書く前に必ず Read**: 既存ファイルへの編集はその編集の直前に Read する。記憶や前回 Read 結果に依拠しない。
3. **reviewer 指摘の最終判断は PM が行う**: false positive 判定の理由は指摘単位で 1 行以上記述。理由「スコープ外」のみは不可。
4. **PM Read 観察の縮小は本サイクル中不可**: 計画書で具体的に列挙した PM Read 観察対象（後述 T-D の 4 枚目視）は context 圧迫を理由にしても縮小しない。
5. **境界拡張の禁止**（後述 Phase D 絶対境界）。拡張せざるを得ないと判断した場合は本サイクルを失敗としてクローズする。
6. **計画書からの逸脱時は計画書改訂を先に行う**（AP-I02）: 実装中に T-A / T-B の設計に手戻りが必要になったら、実装側でハードコード吸収せず計画書 / 設計ドキュメントを先に改訂してから実装に戻る。

加えて cycle-190 失敗・cycle-191 運用踏襲として、**計画段階レビューは以下の打ち切り条件** に従う（反復膨張回避）:

- (a) r1 致命的指摘が全件吸収済み + r1 重要指摘がすべて r1 修正で吸収済み → **r1 で打ち切り**
- (b) 致命的指摘が残存 / 重要指摘の吸収が r2 を要する規模 → **r2 を実施**（全体再点検を含む）
- (c) r2 でも致命的・重要が残存 → 本サイクルを失敗としてクローズし next cycle で再着手（cycle-190 r5 反復膨張の轍を踏まないため、r3 以上は実施しない）

**本サイクル r1 レビュー結果（PM 判断）**: 致命的 2 件（B-409 実体 75 件誤記 / T-A 着手条件矛盾）+ 重要 19 件 + 軽微 17 件のすべてを r1 修正で吸収済み。実体確認は PM 直接で実施（KEIGO_ENTRIES = 60 件、shortDescription = 20 字、css-modules.md 存在 OK）。条件 (a) を満たすため r1 打ち切り → r2 で整合性最終チェックを 1 回のみ実施し T-訂正 へ進む。

### 本サイクルの絶対境界（拡張禁止）

以下のいずれか 1 項目でも「拡張しないと達成できない」と判断された時点で、運用ルール 5 に従い本サイクルを失敗としてクローズし次サイクルで再着手する。

- (i) `INITIAL_DEFAULT_LAYOUT` への投入は行わない（B-400 の責務）
- (ii) `src/components/common/` 配下のファイルは触らない（Phase 10.2 の責務 / cycle-191 から継続）
- (iii) Tile.tsx の新規追加（large 等）は行わない（small / medium のみ既存維持。本サイクルは詳細ページ本体が主)
- (iv) B-407 / B-408 / B-410 / B-412 は本サイクルでは触らない（cycle-190 反復膨張回避。理由は T-A の判断根拠で詳述）
- (v) 後続 Phase 7 サイクルへのテンプレ化（B-401）は行わない（第 3-5 弾完了後の責務）
- (vi) `docs/design-migration-plan.md` への追記禁止（`git diff --stat docs/design-migration-plan.md` が空であること）
- (vii) `docs/tool-detail-page-design.md` への追記は keigo-reference 固有の T-A 設計記録（バリアント設計セクション末尾）に限定し、Phase 7 共通テンプレ化の文言・節構造再編は行わない。追記量は 30 行を上限の目安とする

### タスク一覧

タスク順序は **T-訂正 → T-B-先行整備 → T-A-設計 → T-C-移行実装 → T-D-視覚回帰 → T-E-品質保証 → T-F-申し送り** で直列実行する（T-A は T-B の修正後 meta.ts / logic.ts を前提とするため、必ず T-B 完了後に着手）。

- [x] **T-訂正**: backlog B-409 行の「実体 75 件」誤記を「実体 60 件」に訂正済（PM 直接実施）。本計画書 / backlog / 事前調査レポートに残存する「5 階層」「3 ゾーン構成」「実体 75 件」等の旧構造由来 / 誤情報の表記を grep で点検し、誤記があれば追加訂正
- [ ] **T-B-先行整備**: B-409（howItWorks 件数不整合）と B-411（CATEGORY_LABELS 二重定義）を本サイクル内で先行解消（判断根拠は「### 検討した他の選択肢と判断理由」案 A 参照）。各タスクは独立に着手 → 件数を実体確認した結果をコミットメッセージに記載 → 既存テストパス → `npm run lint && format:check && test && build` 全成功で完了
- [ ] **T-A-設計**: keigo-reference の 8 機能（メインタブ切替 / 検索欄 / カテゴリフィルタ / 候補一覧 / 例文展開 / 件数表示 / 誤用パターンセクション / 誤用カード詳細）を 4 階層へ割り付ける配置案を 3 案以上ゼロベース列挙し、target user 適合判定（ペルソナ A・B の likes/dislikes）で採否確定。永続化対象（useToolStorage キー、`expandedEntryId` を含む）、Tile 2 件との整合確認、TrustSection に乗せる情報の確定（howItWorks / 出典 / 更新日 / faq の扱い / AI 注記）、cycle-191 実装済新版コンポーネント 9 個の採用 / 不採用 / 部分採用の判定、meta.ts / logic.ts 表示用フィールドのゼロベース再評価までを含む。設計結果は `docs/tool-detail-page-design.md` の §バリアント設計セクション末尾に追記（追記量は絶対境界 (vii) に従い 30 行上限）
- [ ] **T-C-移行実装**: T-A 設計に従い、Phase 7 標準手順 10 ステップ（`docs/design-migration-plan.md` L289-L302）に案 C ハイブリッド（OGP / Twitter は git mv / page.tsx は新規作成）と旧構造混入自己点検 grep を加えた 12 サブステップで移行実施。具体ステップは「### 作業内容」T-C 節で展開
- [ ] **T-D-視覚回帰**: Playwright で `/tools/keigo-reference` を **ページ単位** で 4 枚撮影（360px / 1280px × light / dark）+ Playwright 操作で 8 機能の主要シナリオ（タブ切替 / 検索入力 / 例文展開 / カテゴリフィルタ）を動作確認。PM が 4 枚すべてを Read で目視（縮小不可、運用ルール 4）。ペルソナ A 5 観点（A-1〜A-5）/ ペルソナ B 3 観点（B-1〜B-3）と JSON-LD / OGP 継続性（B-4・B-5）を確認
- [ ] **T-E-品質保証**: `npm run lint && npm run format:check && npm run test && npm run build` 全成功、grep による副作用ゼロ確認（`src/components/common/` 不触 / (legacy) keigo-reference 配下の完全削除確認 / `keigo-reference` 全参照点検 / sitemap への含有確認）、(legacy) 残り 33 ツール詳細ページの代表 GA4 上位 2 件（char-count / sql-formatter、keigo-reference 自身が移行対象のため cycle-191 の 3 件基準から 2 件に縮小）に対する Playwright スポット観察
- [ ] **T-F-申し送り**: 後送り判断項目（cycle-191 で起票済の B-407 / B-408 / B-410 / B-412 の状態確認 + 本サイクルで新規発見の項目）を独立 B-XXX として backlog 起票。Notes 押し込めは禁止（cycle-191 運用踏襲）。次サイクル（Phase 7 第 3 弾）の候補スラッグを GA4 PV / 構造単純度 / タイル設計検証カバレッジの 3 軸比較表で示す

## 作業計画

<!-- /cycle-planning で planner が立案する。立案時はサブエージェント（planner）を起動して docs/tool-detail-page-design.md / docs/design-migration-plan.md / cycle-191.md を読み込ませる。cycle-190 反復膨張の轍を踏まないために、計画書 r1 で実質的修正が完了した段階で計画段階レビューを打ち切る運用を踏襲する。 -->

### 目的

本サイクルは Phase 7 第 2 弾として、**`(new)/tools/` 配下で初めての本格的なツール詳細ページ**を keigo-reference で実装し、cycle-191 で整備した基盤（4 階層設計 / 新版共通コンポーネント 9 個 / Tileable + TileVariant 型 / `/internal/tiles` 検証場所 / useToolStorage）が **詳細ページ本体の文脈でも成立する**ことを実証する。cycle-191 は基盤と検証用タイル 2 件で完結したが、詳細ページ本体に新版コンポーネント群を組み付けたケースは未検証であり、後続 Phase 7（残り 32 ツール + 20 遊び）にとって参照可能な唯一の「現役運用詳細ページ」を立ち上げることが本サイクルの基盤的役割。

誰のためか。**ペルソナ A（特定の作業に使えるツールをさっと探している人、検索流入主体、Bing organic 83 %）** にとっては、移行によりファーストビューがツール本体支配（旧 ToolLayout は shortDescription 文字数無制限のため階層 1 が肥大していた）になり、30 秒で用が済む体験に近づく。**ペルソナ B（気に入った道具を繰り返し使っている人、ブックマーク再訪主体）** にとっては、`useToolStorage` 導入により検索クエリ・カテゴリ選択・アクティブタブが localStorage に永続化され、再訪時に前回状態が復元される。GA4 直近 30 日で 41 PV / 平均滞在 3 分 20 秒の実績ある本ツール（全ツール中 PV1 位）の体験劣化は来訪者影響が大きいため、移行は劣化ではなく改善を伴うことが成功条件。

完成条件は以下 5 点すべての成立。(a) `src/app/(new)/tools/keigo-reference/page.tsx` が存在し、`docs/tool-detail-page-design.md` 確定の 4 階層構造でレンダリングされる、(b) `src/app/(legacy)/tools/keigo-reference/` が完全削除されている（`grep -rn "keigo-reference" src/app/(legacy)/` が空）、(c) URL `/tools/keigo-reference` が維持され OGP 画像が新ルートで 200 OK + 1200×630 を返し、JSON-LD（`WebApplication` 構造化データ）がページ HTML に含まれる、(d) Playwright 撮影 4 枚（360 / 1280 × light / dark）に対し PM が観察記録（破綻の有無 / 破綻があれば箇所）を残し、破綻記録ゼロかつ T-D の確認観点 10 件（A-1〜A-5 / B-1〜B-5）すべて充足、(e) `npm run lint && format:check && test && build` 全成功 + (legacy) 残り 33 ツールへの副作用ゼロ（GA4 上位 2 件 = char-count / sql-formatter の Playwright スポット観察で確認）。

### 作業内容

#### T-訂正

- **目的（来訪者価値）**: ドキュメント整合性は計画読解誤りによる実装事故を防ぐ間接的来訪者保護。
- **Done 条件**: `grep -rn "5 階層\|3 ゾーン\|実体 75 件\|FaqSection\|RelatedTools\|RelatedBlogPosts" docs/cycles/cycle-192.md docs/backlog.md tmp/research/` を実行し、本サイクルで使う表現として残ってはならないものが残っていないこと（4 階層が正、実体は 60 件、旧版コンポーネント名は (legacy) 撤去予定の文脈以外で言及禁止）。
- **着手条件**: なし（独立タスク、即着手可）。
- **スコープ**: 本サイクルドキュメント冒頭 description / backlog B-399 行 / B-409 行 / 事前調査レポート / 本ファイル T-訂正 以外の行で誤記が見つかった場合は当該箇所のみ訂正（PM 計画段階で大半は既に訂正済）。
- **スコープ外**: docs/tool-detail-page-design.md の本文修正（cycle-191 で完成しているため触らない、運用ルール 6 該当時のみ T-A で改訂）。
- **アンチパターン警戒**: なし（軽微）。

#### T-A-設計（最重要 / 質の核）

- **目的（来訪者価値）**: keigo-reference の 8 機能を 4 階層のどこに置くかが、ファーストビューでの「ツール本体支配」（ペルソナ A）と「前回状態復元範囲」（ペルソナ B）を直接決定する。配置を誤れば cycle-190 と同じ「旧版踏襲機械的移行」になりかねず、新コンセプト「日常の傍にある道具」が体験として実装されない。
- **ペルソナ A 5 要件（事前調査レポート §1 L62-L68 から本計画書本文に転記）**:
  - A-1: ページを開いた瞬間に入力欄が見えてすぐ使い始められる（検索欄ファーストビュー支配）
  - A-2: shortDescription は 2 行以内（旧版 ToolLayout には制限なし）。**PM 計画段階で実体確認**: meta.ts L9 = `"尊敬語・謙譲語・丁寧語の変換早見表"` = 20 文字 = 360px 環境でも 1 行で確実に収まる。改訂不要を計画段階で確定
  - A-3: 使い方説明・FAQ・関連コンテンツがツール本体より下位（階層 3 以下）
  - A-4: プライバシー表示（「ブラウザ上で動作」「外部送信なし」）が最小文字数で表示
  - A-5: 結果の根拠や前提が信頼できる（出典 / 更新日が階層 3 位置）
- **ペルソナ B 3 要件（事前調査レポート §1 L69-L72 から本計画書本文に転記）**:
  - B-1: URL `/tools/keigo-reference` が維持される
  - B-2: 検索クエリ・カテゴリ選択が localStorage に永続化される（リロードで復元）
  - B-3: 操作フロー・入出力仕様が (legacy) と同等（同じ検索結果が同じ件数・順序で出る）
- **Done 条件**:
  - (i) 8 機能（メインタブ切替 / 検索欄 / カテゴリフィルタ / 候補一覧 / 例文展開 / 件数表示 / 誤用パターンセクション / 誤用カード詳細）を 4 階層（識別 / 使用 / 信頼・透明性 / 生活への組み込み）のいずれかに割り付けた配置案を **3 案以上** ゼロベース列挙し、**各案について A-1〜A-5 + B-1〜B-3 = 8 項目すべてに対する適合度を ○ / △ / × で表記**（8 項目 × 3 案 = 24 セルすべて埋まる比較表、AP-P17 形式的 3 案回避）。
  - (ii) 採用案 1 つを確定し、その採用根拠を 8 要件の充足判定で 1 件 1 行以上で記述。
  - (iii) `useToolStorage` で永続化するキー候補（`searchQuery` / `selectedCategory` / `activeTab` / `expandedEntryId`）の **すべて** について採用 / 不採用を各 1 行で判定し、不採用には理由を記述（例: `expandedEntryId` は再訪時にリセットが意図的なら不採用、UX 上残すべきなら採用）。
  - (iv) Tile 2 件（`Tile.medium-search.tsx` / `Tile.small-daily-pick.tsx`）と詳細ページの整合確認を 1 段落以上で記述（タイルは詳細ページ本体には埋め込まず `/internal/tiles` で検証用、両者の設計が独立しつつ齟齬がないことを確認）。
  - (v) TrustSection に乗せる情報の具体: **howItWorks / 出典 / 更新日 / `meta.ts` の faq（3 件） / AI 注記**。特に faq は 4 階層構造の採用要素に明示的に登場しないため、 (a) 階層 3 内に「よくある質問」セクションとして表示 / (b) JSON-LD の FAQPage 構造化データのみに残し画面非表示 / (c) 削除 のいずれかを判断根拠つきで確定。AI 注記は Footer 任せか TrustSection でも明示するかを判断。`relatedSlugs`（meta.ts L19）の扱い（要素 7 関連コンテンツ採用オプショナルの採否）も判断。
  - (vi) cycle-191 実装済の新版コンポーネント 9 個（IdentityHeader / ToolInputArea / TrustSection / LifecycleSection / AccordionItem / Button / PrivacyBadge / ResultCopyArea / ToolDetailLayout）について、keigo-reference 文脈での **採用 / 不採用 / 部分採用** を 1 コンポーネント 1 行で判定。不採用 / 部分採用には理由を記述（AP-P10 警戒「あるから使う」回避）。
  - (vii) `src/tools/keigo-reference/meta.ts` 全項目（description / shortDescription / keywords / category / relatedSlugs / publishedAt / updatedAt / structuredDataType / trustLevel / howItWorks / faq）+ `logic.ts` の表示文言生成箇所について、ペルソナ A・B 要求に対する適合度を 1 項目 1 行で再評価し、不採用 / 改稿 / 維持を判定（コンテンツのゼロベース再評価、cycle-190 違反 5 への対処）。
- **着手条件**: T-訂正 完了 + **T-B-先行整備 完了**（T-B の修正後 meta.ts / logic.ts を前提とするため）。
- **スコープ**: 配置案の比較表・採用根拠・useToolStorage キー確定・Tile 整合確認・shortDescription 制約準拠案・TrustSection 内容確定。
- **スコープ外**: コードレベルの prop 名・関数名・CSS クラス名（実装段階で builder が決定）。Component.tsx の内部状態管理ロジック再設計（既存ロジック温存が前提、運用ルール「結果の決定性」= ペルソナ B 要求 2-L7 維持）。
- **アンチパターン警戒**:
  - AP-P07（実装が容易な配置を選び来訪者認知モデルを軽視）: 8 機能を「現状の Component.tsx の DOM 順番」で割り付けない。あくまで「ペルソナがどの順に視線移動するか」基準。
  - AP-P08（ゼロベース対象の限定）: 「タブ切替を階層 2 に置く」を所与とせず、誤用パターンセクションを階層 4 に押し出すか階層 2 に並置するか等の議論を含める。
  - AP-P10（高評価の無批判採用 / "あるから使う"）: cycle-191 で実装した新版コンポーネント 9 個を「あるから使う」で済ませず、keigo-reference 文脈での適合性を Done 条件 (vi) で批判的に評価する。
  - AP-P17（3 案ゼロベース比較）: 必ず 3 案以上 + 8 項目 × 3 案の 24 セル比較表で形式的 3 案を抑制。
  - AP-P20（過度に具体的な計画）: コード詳細ではなく配置と責務まで。
- **設計結果の保存場所**: `docs/tool-detail-page-design.md` の §バリアント設計セクション末尾に「keigo-reference 固有記録」として 30 行以内で追記（絶対境界 (vii)）。B-401（テンプレ化）は第 3-5 弾完了後の責務のため、抽象化はしない。

#### T-B-先行整備

- **目的（来訪者価値）**: B-409（howItWorks「40 件以上」記述 vs 実体 60 件）は信頼性表示（階層 3）の核心情報の誤りであり、ペルソナ A 要件「結果の根拠や前提が信頼できる」（1-L9）に直接違反している。B-411（CATEGORY_LABELS 二重定義・表記ブレ）は Tile 2 件（cycle-191 実装済）と詳細ページの間で「基本動詞 / 基本」の表記揺れを露呈させる可能性があり、ペルソナ B 要件「操作性・トーン一貫性」（2-L1）に違反するリスク。
- **Done 条件**: B-409 / B-411 それぞれについて (a) 修正 commit が存在、(b) 既存テスト全件パス、(c) `npm run lint && format:check && test && build` 全成功。
- **着手条件**: T-訂正 完了。T-A 完了を待たない（T-A の設計判断は T-B-先行整備の修正後の logic.ts / meta.ts を前提とするため、本来は T-A 開始前に B-409 / B-411 を解消するのが望ましい。よって順序は **T-訂正 → T-B-先行整備 → T-A-設計** が推奨）。
- **スコープ**: B-409 と B-411 の 2 件のみ（backlog 記述に従って修正）。
- **スコープ外**: B-407 / B-408 / B-410 / B-412（cycle-190 反復膨張回避、本サイクルでは触らない。判断根拠は「### 検討した他の選択肢と判断理由」案 A 参照）。
- **アンチパターン警戒**:
  - AP-WF15（サイクル完了後の補修課題判断の恣意性）: 本サイクルに含める判断と含めない判断の根拠を明文化（後述）。
  - AP-I02（実装中の計画外吸収）: B-411 修正中に「ついでに B-410 も整理する」等の境界拡張は禁止。

#### T-C-移行実装

- **目的（来訪者価値）**: 4 階層構造で構築された詳細ページが、ファーストビュー支配 + 前回状態復元 + 信頼情報の透明性 という来訪者価値を 1 つのページとして実装する。Phase 7 標準手順 10 ステップ（`docs/design-migration-plan.md` L289-L302）を keigo-reference に適用する。
- **Done 条件**: 以下 12 サブステップすべてに通過。
  - (1) **依存コンポーネントの確認**: `grep -rn "from \"@/components/common" src/app/(legacy)/tools/keigo-reference/ src/tools/keigo-reference/` で旧 common/ 依存を列挙、新版での代替が cycle-191 実装済みであることを確認。
  - (2) **OGP / Twitter 画像の git mv**: `git mv src/app/(legacy)/tools/keigo-reference/opengraph-image.tsx src/app/(new)/tools/keigo-reference/`、同様に `twitter-image.tsx`。`git log --follow` で履歴継承を確認。
  - (3) **page.tsx の新規作成 + (legacy) page.tsx 削除**: `src/app/(new)/tools/keigo-reference/page.tsx` を **新規作成**（git mv は使わない、cycle-190 機械踏襲リスク回避の構造的歯止め）。(legacy) page.tsx は同コミットで削除（両方の同 URL 共存はビルドエラー）。
  - (4) **import パス修正**: `@/components/common/*` → `@/components/*`、`@/tools/_components/ToolLayout` → `@/tools/_new-components/ToolDetailLayout` 等。
  - (5) **CSS Module トークン置換**: `src/tools/keigo-reference/Component.module.css` の `--color-*` 系を `--bg` / `--fg` / `--border` / `--accent` 系に置換。`:root.dark` は `:global(:root.dark)` に修正（`docs/knowledge/css-modules.md` 参照）。置換完了後 `grep -rn "var(--color-" src/tools/keigo-reference/ src/app/(new)/tools/keigo-reference/` の出力が空であることを確認。
  - (6) **TrustLevelBadge 撤去**: 旧 ToolLayout 経由の TrustLevelBadge import / JSX / meta.ts の trustLevel フィールドを削除（手順 6、design-migration-plan.md L298）。`ToolMeta` 型定義から `trustLevel` を optional にする / 既存呼び出し全数の影響評価は本サイクル T-C 範囲（他 33 ツールの meta.ts は触らない、optional 化のみで吸収）。
  - (7) **4 階層への組み付け**: T-A 設計で確定した配置に従い、`ToolDetailLayout` / `IdentityHeader` / `ToolInputArea`（中に KeigoReferenceComponent を内包）/ `TrustSection`（howItWorks + 出典 + 更新日 + faq の扱い）/ `LifecycleSection`（オプショナル、T-A で必要性を判断）に組み付け。
  - (7.5) **旧構造混入の自己点検 (cycle-190 違反 1 への構造的歯止め)**: `grep -n "ToolLayout\|ToolErrorBoundary\|ContentSection\|ZoneA\|ZoneB\|ZoneC\|FaqSection\|RelatedTools\|RelatedBlogPosts" src/app/(new)/tools/keigo-reference/ src/tools/keigo-reference/Component.tsx` の出力が空であることを確認。旧コンポーネント名 / 旧ゾーン由来の識別子が新ページに混入していないことを実体確認。
  - (8) **useToolStorage 適用**: T-A で確定したキーについて Component.tsx の useState を useToolStorage に置換。`src/lib/use-tool-storage.ts` を Read で実体確認し、SSR / hydration mismatch 戦略（isMounted フラグ等）が組み込まれていることを確認したうえで適用。Component.tsx は "use client" 維持。
  - (9) **テスト調整**: 既存 `__tests__/logic.test.ts` がパスすること。Component.tsx の useState → useToolStorage 置換でテスト追加が必要なら追加。
  - (10) **タイル対応**: cycle-191 で実装済の Tile 2 件は本ページに **埋め込まない**（タイルは `/internal/tiles` 検証用 + 将来 INITIAL_DEFAULT_LAYOUT 投入用、詳細ページ本体の責務外）。整合確認のみ（タイルと本ページがカテゴリ名・件数表示で齟齬がないことを T-D で目視確認）。
  - (11) **コミット**: 1 ページ 1 コミット原則。差分が大きければ「(legacy) page 撤去 + (new) page 新設」「OGP git mv」「CSS 置換」「useToolStorage 適用」等で分割可。
- **着手条件**: T-A-設計 + T-B-先行整備 両方完了（T-A の設計と T-B の logic.ts / meta.ts 修正結果が両方揃わないと整合した実装にならない）。
- **スコープ**: 上記 12 サブステップ。
- **スコープ外**: タイル 2 件の改修（B-411 修正に伴う差分のみ許容、それ以外は cycle-191 実装維持）。共通コンポーネント（cycle-191 で実装済）の再改修（運用ルール 6 該当時のみ T-A 設計改訂を経由）。
- **アンチパターン警戒**:
  - AP-I02（計画書からの執行中逸脱）: 次のいずれかが発生した場合は実装を中断し計画書を先に改訂する（運用ルール 6）: **(a)** T-A で確定した useToolStorage キー / 配置 / TrustSection 内容と実装上必要なものが乖離、**(b)** 4 階層への組み付けで T-A 設計に存在しない新コンポーネントが必要、**(c)** CSS トークン置換で `docs/knowledge/css-modules.md` に未記載の問題が発生。
  - AP-I07（Next.js layout の body style と useEffect 競合）: Component.tsx に `document.body.style.*` 直書きがないかを (8) 着手前に Read で確認。`classList.add/remove` への置換要なら本サイクル T-C 範囲で実施。
  - cycle-190 違反 23 同型（機械的トークン置換に終始してデザインを再設計しない）: 手順 5「DESIGN.md に従ったデザイン適用」（design-migration-plan.md L297）を省略しない。新トークンに置換しただけでは Phase 7 の責務を果たさない。

#### T-D-視覚回帰

- **目的（来訪者価値）**: ペルソナ A・B 双方の体験劣化がないことを目視確認。本サイクルが 41 PV / 月の現役運用ページを触るため、視覚的破綻は来訪者影響大。
- **Done 条件**:
  - (i) Playwright で `/tools/keigo-reference` を **ページ単位（タイル単位ではない）** に 4 枚撮影:
    - `keigo-reference-360-light.png`
    - `keigo-reference-360-dark.png`
    - `keigo-reference-1280-light.png`
    - `keigo-reference-1280-dark.png`
  - (ii) PM が 4 枚すべてを **Read で目視**（縮小指定なし、運用ルール 4、全枚目視必須）。観察記録（破綻の有無 / 破綻があれば箇所）を本ファイル「## レビュー結果」に残す。破綻記録ゼロが Done。
  - (iii) 確認観点として以下 10 件すべてをチェック（ペルソナ A 5 + ペルソナ B 3 + JSON-LD/OGP 継続性 2）:
    - A-1: ファーストビューに検索入力欄が視覚的に支配的に見える（360px / 1280px の両方、目視）
    - A-2: shortDescription が 2 行以内（**計画段階で 20 字 = 1 行収納を実体確定済、本観点は実機での回り込み有無の目視確認のみ**）。Playwright `getBoundingClientRect()` で shortDescription 要素高さが `line-height × 2 + 2px 許容誤差` 以下も併用
    - A-3: 使い方説明・FAQ・関連コンテンツがツール本体より下位（DOM 順 / 表示順の両方で確認）
    - A-4: プライバシー表示が最小文字数（PrivacyBadge 1 行表示）
    - A-5: 更新日・出典の信頼性情報が階層 3 位置にある
    - B-1: URL が `/tools/keigo-reference` のまま（Playwright で navigate 後 URL 確認）
    - B-2: 検索クエリ・カテゴリ選択が localStorage に永続化される（Playwright 操作: 値を入れて reload して復元を確認）
    - B-3: 操作フロー・入出力仕様が (legacy) と同等（旧版で出ていた検索結果が新版でも同じ件数・順序で出る）
    - B-4: `view-source:/tools/keigo-reference` の `<script type="application/ld+json">` に `WebApplication` 構造化データが含まれる（Bing 検索結果リッチ表示の継続性）
    - B-5: `/tools/keigo-reference/opengraph-image` が 200 OK + 1200×630 画像を返す（SNS / Bing シェアの継続性）
  - (iv) **Playwright 動作確認 4 シナリオ**（観点 (iii) では撮影しない動的機能の検証）:
    - シナリオ 1: 検索欄に「いる」と入力 → 候補が絞り込まれる（候補件数が減ることを確認）
    - シナリオ 2: 行クリック → 例文展開が表示される
    - シナリオ 3: 「よくある間違い」タブクリック → 誤用パターンセクションが表示される（mistakes タブの初期撮影が 4 枚目視に含まれないため、本動作確認で補完）
    - シナリオ 4: カテゴリフィルタを「ビジネス」に変更 → 該当カテゴリの動詞のみが表示される
- **着手条件**: T-C-移行実装 完了。
- **スコープ**: 4 枚撮影 + PM Read 目視 + 8 観点確認。
- **スコープ外**: 5 段階代表幅観察（320 / 375 / 768 / 900 / 1024 / 1440 / 1920）の網羅。本サイクルはあくまで 360 / 1280 の 2 幅 × 2 モード = 4 枚に限定（cycle-189 のブログ詳細 5 段階観察は記事レイアウト固有、ツール詳細では過剰）。
- **アンチパターン警戒**:
  - cycle-188 違反「PM が縮小指定で全体俯瞰で済ませる」: 縮小なし全枚目視。
  - cycle-190 違反 24「視覚観察を後送りして実態と乖離」: 撮影後即 Read。

#### T-E-品質保証

- **目的（来訪者価値）**: ビルド / lint / format / test 全成功は最小限の動作保証。副作用ゼロ確認は (legacy) 残り 33 ツールの来訪者保護。
- **Done 条件**:
  - (i) `npm run lint && npm run format:check && npm run test && npm run build` 全成功。
  - (ii) `git diff --stat src/components/common/ src/app/old-globals.css src/app/(legacy)/layout.tsx docs/design-migration-plan.md` が空（絶対境界 (ii) / (vi) の構造的歯止め）。
  - (iii) `grep -rn "keigo-reference" src/app/(legacy)/` が空（撤去完全性）。
  - (iv) `grep -rn "from \"@/tools/keigo-reference" src/` の出力に旧パス参照がないことを確認。加えて `grep -rn "keigo-reference" src/` の全出力を点検し、破綻参照がないことを確認（registry / sitemap / 他ツールの relatedSlugs / ブログ記事リンク等の波及確認）。
  - (v) `curl -sI https://yolos.net/sitemap.xml` 相当の自動生成 sitemap 内容を `npm run build` 後の `.next/server/app/sitemap.xml/route.js` 出力に対して確認するか、ローカルで `/sitemap.xml` を fetch して `https://yolos.net/tools/keigo-reference` URL が含まれていることを確認。
  - (vi) (legacy) GA4 PV 上位 2 件（char-count / sql-formatter）に対する Playwright スポット観察を 2 幅 × 2 モード = 各 4 枚 = 計 8 枚 撮影 + PM Read 目視。確認観点は「視覚的破綻がないこと」のみ（本サイクルでこれらは移行対象外、副作用ゼロ確認のため）。
- **観察対象縮小の根拠**: cycle-191 では GA4 PV 上位 3 件（keigo-reference / char-count / sql-formatter）を観察対象としていた。本サイクルでは keigo-reference 自身が移行対象であり T-D で個別に 4 枚撮影 + 4 動作シナリオを実施するため、副作用ゼロ確認の対象は残り 2 件（char-count / sql-formatter）となる。T-D 4 枚 + T-E 8 枚 = 計 12 枚で cycle-191 と同等の網羅性を維持（運用ルール 4 縮小なし）。
- **着手条件**: T-D-視覚回帰 完了。
- **スコープ**: 上記 6 項目。
- **スコープ外**: (legacy) 残り 33 ツール **全件** の視覚確認（過剰、GA4 上位 2 件のスポット観察で代替。理由: 本サイクルは共通インフラ（`src/components/common/` 等）を触らないため、副作用が広範に波及する経路がない）。
- **アンチパターン警戒**:
  - cycle-191 違反「副作用ゼロを PM Read 観察で確認」が legacy 観察を含めず空言になった失敗の教訓: GA4 上位 2 件は **必ず実撮影**。

#### T-F-申し送り

- **目的（来訪者価値）**: 本サイクルで触らない項目（B-407 / B-408 / B-410 / B-412）の状態が腐敗しないよう、後送り判断の根拠を残す。Phase 7 第 3 弾以降の PM が参照可能な状態にする。
- **Done 条件**:
  - (i) cycle-191 起票済の B-407 / B-408 / B-410 / B-412 を本サイクル完了時点の状態で再点検し、(a) 依然として未着手なら理由を 1 行追記、(b) 本サイクルで部分的に動いた（例: B-410 が T-B-先行整備の B-411 解消で間接的に影響を受けた等）なら状態を更新。
  - (ii) 本サイクルで新規発見した課題は独立 B-XXX として backlog 起票（Notes 押し込め禁止、cycle-191 運用踏襲）。
  - (iii) Phase 7 第 3 弾の候補スラッグを以下 3 軸の比較表で推奨候補 1 件を選定。確定は次サイクル kickoff で行うが、推奨理由は決定論的に書く:
    - **GA4 PV**: cycle-192 完了時点で `mcp__google-analytics__run_report` または BigQuery で直近 30 日 PV を再集計（事前調査時点の値を流用しない、運用ルール 1 = 実体確認）
    - **構造単純度**: Component.tsx 行数 / 状態管理の複雑度 / タイル設計検証カバレッジ（cycle-191 で実装済の Tile 数）
    - **タイル設計検証カバレッジ**: cycle-191 T-C-事例発散の 3 事例（keigo-reference 6 / sql-formatter 3 / char-count 4 = 13 バリアント）のうち未消化分
- **着手条件**: T-E-品質保証 完了。
- **スコープ**: 上記 3 項目。
- **スコープ外**: B-401（テンプレ化）の着手判断。本サイクルは第 2 弾であり、B-401 着手条件「第 3-5 弾完了」を満たさない。
- **アンチパターン警戒**:
  - AP-WF15（サイクル完了後の補修課題判断の恣意性）: 後送り判断の根拠を明文化する。
  - cycle-191 違反「Notes 押し込め」: 必ず独立 B-XXX 起票。

### 検討した他の選択肢と判断理由

#### 案 A: B-409 / B-411 を別サイクルに分ける案 vs 本サイクルで先行解消する案

- **案 A-1（別サイクルに分ける）**: B-399 のみに集中し、B-409 / B-411 は P4 として独立着手する。
- **案 A-2（本サイクルで先行解消）**: T-B-先行整備として B-409 / B-411 を本サイクル内で解消してから T-A-設計に入る。**採用**。
- **判断根拠**:
  - B-409 は「実体 60 件 vs 表示 40 件以上」と来訪者影響が顕在化している（ペルソナ A 要件 1-L9「信頼性」直接違反）。本サイクルで階層 3「信頼・透明性」を新設するのに、その階層に乗る情報自体が誤っているまま移行するのは新コンセプトの体現として矛盾する。
  - B-411 は cycle-191 実装済の Tile 2 件と本ページ Component.tsx の間に表記ブレを残し、ペルソナ B 要件 2-L1「操作性・トーン一貫性」に影響する。本サイクルで Component.tsx に手を入れる絶好の機会のため、ここで併せて解消するのが効率的。
  - 一方 B-407 / B-408 / B-410 / B-412 は **本サイクルで触らない**: B-407 は useToolStorage の挙動明確化（key 変更時）で来訪者影響は現状なし、B-408 はコピー失敗フィードバック（来訪者影響限定的）、B-410 は API 整理（来訪者影響ゼロ）、B-412 は SSR TZ 問題（INITIAL_DEFAULT_LAYOUT 投入後に顕在化、B-400 サイクルの責務）。これらを巻き込むと cycle-190 反復膨張の轍を踏む。
  - AP-WF15「サイクル完了後の補修課題判断の恣意性」への対処として、**「来訪者影響が顕在化しているか」**を判断軸とした（B-409 / B-411 は顕在、その他 4 件は潜在）。
  - 採用案は案 A-2。

#### 案 B: Tile.tsx に large バリアントを追加する案 vs しない案

- **案 B-1（large 追加）**: 本サイクルで詳細ページ全体を触るついでに、Tile.tsx に large バリアントを追加する。
- **案 B-2（追加しない）**: small / medium のみ維持し、large 追加は将来サイクル（B-400 着手時または独立サイクル）に送る。**採用**。
- **判断根拠**:
  - large バリアントの責務は「詳細ページ本体に近い情報量を持つタイル」であり、cycle-191 の「small / medium が異なる機能切り出し」設計と独立した第三軸が必要（cycle-191 T-D-バリアント設計の 3 軸対照表で large は未検証）。
  - INITIAL_DEFAULT_LAYOUT への投入は B-400 の責務であり、large が必要かどうかは「道具箱の実運用で large サイズが visitor に提供される文脈」が確立してから判断するのが正しい。
  - 本サイクルの責務は「詳細ページ本体の (legacy)→(new) 移行」であり、Tile 追加は責務外。境界拡張禁止（運用ルール 5）。
  - 採用案は案 B-2。

#### 案 C: `git mv` で丸ごと移動する案 vs 新規 page.tsx を書いて (legacy) を削除する案

- **案 C-1（git mv）**: `git mv src/app/(legacy)/tools/keigo-reference/ src/app/(new)/tools/keigo-reference/` で丸ごと移動し、その後 page.tsx 内の import 修正・JSX 再構築を行う。git 履歴が継承される。
- **案 C-2（新規作成 + 削除）**: `src/app/(new)/tools/keigo-reference/page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` を新規作成し、(legacy) 側を削除。git 履歴は途切れるが、新ページが旧構造の踏襲にならない構造的歯止めになる。
- **判断根拠**:
  - cycle-190 失敗の核は「旧 ToolLayout + 旧 Component.tsx 構造を機械的にトークン置換した結果、4 階層が体現されないまま完了とした」こと。`git mv` は便利だが、cycle-190 同型の機械作業に陥るリスクがある。
  - 一方、4 階層の組み付けは page.tsx レベルでの構造再設計を伴うため、`git mv` 後でも JSX は大幅書き換えになる。git mv の利点（履歴継承）は実質的に薄い。
  - design-migration-plan.md L294 は「`git mv (legacy)/foo/ (new)/foo/`」を標準手順としているが、cycle-187〜189（ブログ詳細）でも実態は新規記述に近い書き換えが行われている。
  - **採用判断**: **OGP / twitter / metadata 周りのアセット類は `git mv` で移動**（履歴継承の価値あり、構造変更が少ない）、**page.tsx は新規作成 + (legacy) page.tsx 削除**（4 階層の組み付けは構造的再設計）。Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/` / Tile 系は `git mv` で `src/tools/keigo-reference/` 配下に既にあるため移動不要。
  - 採用案は案 C ハイブリッド（OGP は git mv、page.tsx は新規作成）。

#### 案 D（追加検討）: タイル 2 件を本サイクルで詳細ページに埋め込む案 vs 埋め込まない案

- **案 D-1（埋め込む）**: 詳細ページ階層 4「生活への組み込み」に small-daily-pick の「今日のひとこと」要素を埋め込む。
- **案 D-2（埋め込まない）**: タイルは `/internal/tiles` 検証用 + 将来 INITIAL_DEFAULT_LAYOUT 投入用に留め、詳細ページには埋め込まない。**採用**。
- **判断根拠**:
  - cycle-191 T-C-検証場所の判断と整合（タイルは道具箱内表示用であり、詳細ページとは独立した責務）。
  - 詳細ページに埋め込むと「同じ情報が 2 度表示される」（階層 2 のメインタブ「敬語早見表」 vs 階層 4 のタイル）冗長性が生じ、ペルソナ A 要件「余計な装飾なく用事だけ片付ける」（1-L18）に違反するリスク。
  - 階層 4「日替わりコンテンツ（要素 17）」を埋め込む場合でも、タイルコンポーネントを再利用するか専用 UI にするかは別の設計判断であり、本サイクルのスコープから外れる。
  - 採用案は案 D-2。階層 4 の具体的な要素採用判断は T-A-設計で実施（要素 17「日替わり」の採否、要素 4「永続化」は採用確定、要素 7「関連コンテンツ」の採否）。

### 計画にあたって参考にした情報

- **事前調査レポート**:
  - `./tmp/research/2026-05-14-cycle-192-keigo-reference-migration-research.md` L9-L74（ペルソナ A・B 定義と UX 要件）、L76-L86（(new) 側既存ツール詳細ページ不在の確認）、L88-L135（cycle-191 実装済共通コンポーネント群・新トークン体系・OGP 生成方式）、L137-L174（GA4 直近 30 日: PV 41 / Bing organic 83% / desktop 73% / mobile 滞在 5 分超）、L191-L216（CSS トークン置換必須 / B-409 / JSON-LD / useToolStorage / URL 維持）。
  - `./tmp/research/2026-05-14-cycle-191-phase7-codebase-survey.md` L8-L54（旧 ToolLayout の 3 ゾーン構造とトークン使用状況）、L256-L283（keigo-reference 現状ファイル構成と Tile.tsx 不在）、L218-L253（新旧トークン対比）。
  - `./tmp/research/2026-05-14-phase7-cycle190-planning-research.md` L286-L308（Phase 7 1 ページ移行の標準手順 10 ステップ）、L131-L194（Phase 6 ブログ詳細から導出された Phase 7 適用パターン / 差異パターン）。
- **設計ドキュメント**:
  - `docs/tool-detail-page-design.md` L461-L501（採否確定 10 + 5 + 9 件）、L506-L594（4 階層への独自分類根拠と各階層責務）、L596-L621（dislike 抜本対処）、L640-L651（共通インフラ移管 9 件）、L662-L748（新版コンポーネント設計 = cycle-191 実装済）。
  - `docs/design-migration-plan.md` L157-L182（Phase 7 全体構造）、L289-L302（1 ページ移行の標準手順 10 ステップ）、L304-L325（検証方法）。
- **前サイクル記録**:
  - `docs/cycles/cycle-191.md` L1-L77（運用ルール 6 件 + Phase A/B/C/D/E 構造 + Phase D 絶対境界）— 本サイクルでも継承する運用ルールと境界。
  - `docs/cycles/cycle-190.md`（失敗認定の振り返り、特に「旧構造盲目的踏襲 + 機械的トークン置換」の失敗構造を回避するための判断軸）。
- **ターゲット定義**:
  - `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` L16-L26（ペルソナ A の likes 5 件 / dislikes 5 件）。
  - `docs/targets/気に入った道具を繰り返し使っている人.yaml` L16-L24（ペルソナ B の likes 5 件 / dislikes 3 件）。
- **backlog（実体確認済み）**:
  - `docs/backlog.md` L7（B-399 完了条件）、L72-L74（B-409 / B-410 / B-411 詳細）、L106-L114（B-400 / B-401 / B-405 / B-406 / B-407 / B-408 / B-412 詳細）。
- **アンチパターン**:
  - `docs/anti-patterns/planning.md` AP-P07 / AP-P08 / AP-P17 / AP-P20（T-A 設計時の警戒）、AP-P16（実体確認なき記述の禁止）。
  - `docs/anti-patterns/implementation.md` AP-I02（実装中の計画書からの逸脱）。
  - `docs/anti-patterns/workflow.md` AP-WF12（事実情報の自己確認）、AP-WF15（補修課題判断の恣意性）。
- **コードベース実体**（運用ルール 1 に従い計画立案直前に実体確認したファイル）:
  - `src/tools/keigo-reference/`（9 ファイル構成: Component.tsx 248 行 / Component.module.css / logic.ts 1278 行 / meta.ts 43 行 / Tile.medium-search.{tsx,module.css} / Tile.small-daily-pick.{tsx,module.css} / `__tests__/`）。
  - `src/app/(legacy)/tools/keigo-reference/page.tsx` 34 行（ToolLayout + ToolErrorBoundary + KeigoReferenceComponent + JSON-LD）。

## レビュー結果

### 実施フェーズレビュー

#### T-訂正 レビュー（PM 自己確認）

builder 起動で 3 箇所訂正（事前調査レポート L204 / cycle-192.md L114 / L221 = いずれも「実体 75 件」→「実体 60 件」）。PM が grep を再実行して本サイクル文脈での誤情報残存ゼロを確認（残存 2 件はいずれも「コマンド例 / 誤記と明記した記録」で許容範囲）。Done 条件は機械チェック可能で訂正は機械的副作用なしのため、reviewer 起動なしで打ち切り（cycle-191 T-A-ドキュメント化と同方針）。

### 計画段階レビュー

#### r1（3 観点並列レビュー: 来訪者価値 / 構造整合 / アンチパターン整合）

- 来訪者価値観点: 重要 6 件 + 軽微 4 件
- 構造整合観点: 致命的 2 件（C1 B-409 実体 75 件誤記 / C2 T-A 着手条件矛盾）+ 重要 6 件 + 軽微 5 件
- アンチパターン整合観点: 重要 7 件 + 軽微 6 件

合計: 致命的 2 件 + 重要 19 件 + 軽微 15 件。PM は実体確認（`KEIGO_ENTRIES = 60 件` / shortDescription = 20 字 = 1 行収納 / `docs/knowledge/css-modules.md` 存在）を行ったうえで全件を r1 修正で吸収。具体的反映:

- backlog B-409 行を「実体 60 件」に訂正（C1 解消）
- T-A 着手条件を「T-訂正 + T-B-先行整備 完了」に変更、タスク順序も入替（C2 解消）
- T-A Done 条件を 7 項目に拡張: (vi) cycle-191 実装済新版コンポーネントの採否判定（AP-P10 対処）/ (vii) コンテンツのゼロベース再評価（cycle-190 違反 5 対処）/ (iii) 永続化キー候補に `expandedEntryId` 追加 / (v) faq・relatedSlugs の扱い判断追加 / shortDescription の実体確認結果（20 字 = 1 行）を計画段階で確定
- T-C を 12 サブステップに拡張: (2) OGP/Twitter は git mv、(3) page.tsx は新規作成（cycle-190 機械踏襲リスク回避）、(7.5) 旧構造混入の自己点検 grep（cycle-190 違反 1 対処）、(5) CSS 置換漏れ grep
- T-D Done 条件を 10 観点 + 4 動作シナリオに拡張: B-4 JSON-LD / B-5 OGP 継続性、Playwright 動作確認 4 シナリオ
- T-E Done 条件 (iv) を `keigo-reference` 全参照点検に拡張、(v) sitemap 含有確認を追加。観察対象縮小 2 件の根拠を運用ルール 4 整合性として明示
- 絶対境界に (vi) `docs/design-migration-plan.md` 追記禁止 + (vii) `docs/tool-detail-page-design.md` 追記 30 行上限 を追加
- T-F (iii) の候補スラッグ選定を 3 軸決定論的比較表に変更
- 計画段階レビュー打ち切り条件 (a)(b)(c) を明示化

#### r2（整合性最終チェック 1 観点）

承認。新規致命的・重要なし。軽微 3 件のうち T-C (5) の grep に `-r` 追加のみ反映、他 2 件は実行者裁量で許容範囲のためスキップ。本計画書は cycle-execution へ進む準備が整っている。

<!-- 実施フェーズの各タスク完了ごとのレビュー結果は本セクションに追記していく。 -->

## キャリーオーバー

<!-- 完了できなかった作業や次サイクルへ持ち越す項目はここと docs/backlog.md の両方に記載する。cycle-191 の運用に倣い、後送り項目は独立した B-XXX 起票（Notes 押し込めを避ける）。 -->

## 補足事項

- 本サイクルは cycle-191 で確立した基盤の上に乗る。基盤側（Tileable / 新版コンポーネント / TileVariant / 検証場所）を再設計する必要が顕在化した場合は、計画書を改訂してから実装に入る（運用ルール 6）。
- cycle-190 失敗（反復膨張・対症療法的メタルール拡張）の轍を踏まないため、計画段階レビューは r1 で実質的修正完了 → 打ち切りを基本線とする（cycle-191 運用踏襲）。
- 本サイクル単体のスコープに含めない: B-400（INITIAL_DEFAULT_LAYOUT 投入）/ B-401（手順テンプレ化）/ B-405〜B-412（cycle-191 申し送り）。これらは B-399 完了後の評価で着手判断する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が **独立 B-XXX として `docs/backlog.md` に起票** され、キャリーオーバーには起票 ID リストのみが残されている（Notes 押し込め禁止、cycle-191 運用踏襲）。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
