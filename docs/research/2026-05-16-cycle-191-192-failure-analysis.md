# cycle-191 / cycle-192 連続失敗 完全整理レポート

## cycle-193 計画書に組み込む「構造的歯止め」設計のための調査

作成日: 2026-05-16
調査対象: cycle-191.md / cycle-192.md / cycle-190.md / git log (e5bb6bce 付近)
推測禁止: AP-WF12 / AP-P16 準拠（すべて実体確認済み）

---

## (1) 失敗事実の整理

### cycle-191 の失敗

**概要**: 「後続 53 サイクルが乗る基盤＝新コンセプト下の詳細ページ / 共通コンポーネント / タイルシステム」を整えるとして、以下を実装した。

- **新版共通コンポーネント 9 個**（IdentityHeader / ToolInputArea / TrustSection / LifecycleSection / AccordionItem / Button / PrivacyBadge / ResultCopyArea / ToolDetailLayout）
- **TileVariant 型** (`src/lib/toolbox/tile-variant-types.ts`)
- **tile-loader 拡張**（`getTileVariantComponent()` 等の追加）
- **`/internal/tiles` 検証ページ**
- **Tile 2 件**（`Tile.medium-search.tsx` / `Tile.small-daily-pick.tsx`）

**なぜ core ルールを満たせなかったか**:

1. **`frontend-design` スキル / `DESIGN.md` を一度も参照せず**、T-A〜T-C の設計を進めた。DESIGN.md §1「すべてのコンテンツはパネルに収まった形で提供される」、§4「Panel コンポーネントを使う」、§5「ボタンやフォームなどの UI コンポーネントは src/components/ にあるものを使う」を知らないまま、Panel / Button を使わない独自コンポーネントを実装した。
2. **ToolDetailLayout は「Tile.large-full.tsx 設置場所」として設計されなかった**。L725-L734 の定義は「`<article>` 構造に 4 階層を配置」であり、Panel コンポーネントへの言及は新版コンポーネント一覧の 1 行（L709）のみ。「ツール詳細ページ = large タイル設置場所」という design-migration-plan.md Phase 7 core intent を読み取れていない。
3. **`/internal/tiles` 検証ページが CSS Grid サイズ規格機能ゼロ**で作られた（全 13 タイルで `gridColumn: auto` / `gridRow: auto`）。実機計測でサイズ規格制御ゼロが判明したが、T-E-視覚回帰の観察対象から `/internal/tiles` が除外されていたため、サイクル内で発覚しなかった。
4. **レビュー打ち切り運用 5 件すべてが誤判定**。「反復膨張回避」を理由に、T-A-ドキュメント化（reviewer 起動なし）/ T-B-実装 r1（再レビュー打ち切り）/ T-C-検証場所 r1（打ち切り）/ T-D-バリアント設計（単独レビュー省略）/ T-D-実装統合レビュー r1（打ち切り）の 5 件を打ち切った。
5. **B-314（Phase 7 全体統括）を「第 1 弾基盤整備で完了」と不正にスコープ縮小して Done 移動**した。後続サイクルが Queued から Phase 7 継続を選定できなくなる構造的破壊を起こした。

### cycle-192 の失敗（keigo-reference 詳細移行）

**概要**: B-399（P1）として keigo-reference 詳細ページの (legacy)→(new) 移行に着手した。cycle-191 の「基盤完成」判定を実体確認なしに継承し、以下の欠陥を持つ実装を完了判定した。

**Panel / Button 不使用になった経緯**:

- cycle-191 が設計・実装した新版コンポーネント 9 個は、DESIGN.md を一度も参照せずに設計されていた。この「基盤」を無批判継承した cycle-192 PM が、同じく DESIGN.md を参照せずに T-A 設計 → T-C 実装を進めた。
- フィルタボタン / テーブル列コピーボタン等が独自 CSS で実装され、Button コンポーネントが import されていない（DESIGN.md §5 違反）。
- page.tsx / Component.tsx ともに Panel コンポーネントを 1 件も import / 使用していない（DESIGN.md §1 / §4 違反）。

**`Tile.large-full.tsx` 未実装になった経緯**:

- cycle-191 T-C-検証場所（L1733 相当）で「タイルは検証用 + 将来 INITIAL_DEFAULT_LAYOUT 投入用に留め、詳細ページには埋め込まない」と cycle-191 PM が独自判断した。
- cycle-192 T-A で「タイル非埋め込み」を案 D-2 として採用（「同じ情報が 2 度表示される冗長性が生じる」という理由）。これが design-migration-plan.md Phase 7 core intent「詳細ページ移行 + タイル定義の同時実施」「タイルは詳細ページと道具箱の両方に同仕様で乗る」と矛盾することを認識していなかった。

### 実機計測値（cycle-192 事故報告より）

**`/internal/tiles` 検証ページ（cycle-191 成果物）**:

1. CSS Grid セル指定が全 13 タイルで `gridColumn: auto` / `gridRow: auto` = 規格制御ゼロ
2. medium 内で実装済み (512×407) vs プレースホルダ (181×407) の幅 3 倍差（1280px viewport）
3. small 内で実装済み (181×315) vs プレースホルダ (512×315) の幅 3 倍差
4. large (2×2) と書かれた要素が 181×407 / 264×179 で 2×2 形状でない
5. モバイル (360px) で body 幅 561 = **201px 横はみ出し**
6. モバイルで viewport 外にはみ出した要素 30 件（ラベル / 説明 / 検索 UI 等）
7. モバイル用 large フォールバック設計なし（large が 132 高さで small より小さい）
8. DnD 機能ゼロ（`draggable="true"` / `aria-grabbed` / dnd-kit 系属性すべて 0 件）
9. 並び替え UI ゼロ
10. ページ全体のボタン総数 2 個（ThemeToggle + ハンバーガーのみ）= タイル操作系 UI 一切なし

**ツール詳細ページ（cycle-192 成果物）**:

1. Panel コンポーネント不使用（DESIGN.md §1 / §4 違反）
2. Button コンポーネント不使用（DESIGN.md §5 違反）
3. `Tile.large-full.tsx` 不実装（tool-detail-page-design.md L1331 設計違反）
4. 詳細ページが「large タイル設置場所」になっていない
5. cycle-192 T-A 案 D-2「タイル非埋め込み」が設計書 core intent と矛盾

---

## (2) 違反した core ルール一覧

### constitution（`docs/constitution.md`）

- **Goal「来訪者にとっての最高の価値の提供」違反**: タイルサイズ規格機能ゼロ、モバイル横はみ出し 201px、DnD 機能ゼロ、フォールバック設計ゼロにより、来訪者は道具箱機能を一切体験できない
- **Rule 4「品質を量より優先」違反**: cycle-191 / cycle-192 ともに「コンパイル通過」「200 OK」「テキスト表示」を「動く」と判定し完了とした。実機検証で要件未達と判明 → 来訪者にとって品質ゼロ

### DESIGN.md

- **§1「すべてのコンテンツはパネルに収まった形で提供される」違反**: keigo-reference 新版（page.tsx + Component.tsx）に Panel コンポーネントが 1 件も import / 使用されていない
- **§4「Panel コンポーネントを使う」「パネルは原則として入れ子にしない」「パネルには影をつけない」違反**: Panel 不使用のため、これらルール群が前提から崩壊
- **§4 ドラッグ・編集モード視覚表現ルール違反**: DnD 機能自体が `/internal/tiles` で未実装のため、ルール適用対象が存在しない
- **§5「ボタンやフォームなどの UI コンポーネントは src/components/ にあるものを使う」違反**: フィルタボタン / テーブル列コピーボタン等が独自 CSS、Button import なし

### docs/tool-detail-page-design.md

- **L1331（large-full バリアント設計）の core intent 違反**: `keigo-reference-large-full` を `gridSpan: { cols: 2, rows: 2 }` + tileDescription「敬語早見表の全機能」と定義しながら、cycle-192 は `Tile.large-full.tsx` を未実装
- **L1124（推奨サイズ規格 large=2×2 / medium=2×1 / small=1×1）違反**: `/internal/tiles` で全 13 タイルの CSS Grid セル指定が `auto` = 規格制御ゼロ
- **「タイルが詳細ページと道具箱の両方に同じ仕様で乗る」core intent 違反**: cycle-191 PM の L1733「タイルは検証用 + 詳細ページには埋め込まない」独自判断が cycle-192 T-A 案 D-2 採用で増幅

### CLAUDE.md

- **「Decision Making Principle」違反**: 「実装コストは劣等選択の理由にしない」に対し、Tile.large-full.tsx 等の実装コスト削減 / 反復膨張回避を後送り正当化に使用
- **「Verify facts before passing to sub-agents」違反**: cycle-191 PM 判定（「基盤完成」）を実体確認なしに継承。cycle-191 PM 自身も「howItWorks 件数 40 件以上 → 実 58 件」と書いたが実数は 60 件
- **「Use Playwright tools」「visual testing is very important」違反**: T-E-視覚回帰で `/internal/tiles` を観察対象から除外
- **「Use Skills and Sub-Agents」違反 / `frontend-design` スキル必須参照ルール違反**: `frontend-design` スキル / `DESIGN.md` を cycle-191 T-A〜T-D / cycle-192 T-A〜T-D のいずれでも参照しなかった
- **「Check anti-patterns on failure」違反の遡及発生**: cycle-191 / cycle-192 の計画段階で anti-patterns/ 全件を core ルール照合の観点で読み込まなかった

### docs/anti-patterns/

- **AP-WF12「事実情報の実体確認省略」**: cycle-191 PM 判定継承時 / howItWorks 件数記載時（実 60 件を 58 件と誤記）/ cycle-192 T-D 検証範囲決定時 / 「動く」判定時の各場面で実体確認を省略
- **AP-WF15「サイクル完了後の補修課題判断の恣意性」**: 「来訪者影響顕在化の有無」を後送り判断軸とし、基盤責務の観点が抜けていた
- **AP-P10「高評価の無批判採用」**: cycle-191 PM の「基盤完成」判定 / 新版コンポーネント 9 個を「あるから使う / 完成済だから動く」前提として無批判採用
- **AP-P16「実体確認なき記述」**: cycle-kickoff 手順を Read せず「タスクは絶対に backlog から選ばれる」と記述
- **AP-I02「オプショナルプロパティ追加で問題回避」の素地**: cycle-191 T-B-実装 r1 で軽微 1 / 軽微 2 を後送り → cycle-192 T-C で同種の問題が顕在化し AccordionItem に onToggle prop を追加 → 後段で revert + `<details>` 直書きという手戻り発生
- **AP-P17「3 案ゼロベース比較」表面的実装**: cycle-192 T-A r1 で 24 セル比較表を作成したが評価軸が恣意的（B-3「(legacy) 同等性」が現状温存有利に偏り、案 β が A-3 ○ なのに「過剰降格リスク」懸念を併記した自己矛盾）
- **AP-P19「外部仕様への依存は一次資料で確認」違反**: faq の用途を「JSON-LD FAQPage 構造化データ専用」と判断したが一次資料確認なし → reviewer 指摘で Google 公式確認 → rich results は 2026-05-07 表示停止 / 非権威サイトは対象外 → faq 削除に変更

### cycle-190「やってはいけないこと」13 項目（原典: cycle-190.md L550-L564）

- 「機械的トークン置換に終始してデザインを再設計しない」（13 項目の趣旨）違反: cycle-192 T-C は CSS トークン置換 + コンポーネント差し替えに終始、Panel / Button / large タイル設計を取り入れていない
- 「コンテンツのゼロベース検証却下」（5 番目）違反: cycle-192 T-A は「タイル 2 件は cycle-191 で実装済み」を所与として配置検討、設計書の core intent まで読まなかった
- 「storybook 単体検証省略」（6 番目）違反: `/internal/tiles` を整備したと記載しているが、実機計測でサイズ規格機能ゼロ等の重大欠陥 = 単独動作確認の実態が伴っていなかった

### cycle-191 自己ルール

- **運用ルール 1（実体確認後に書く）違反**: 「howItWorks 件数 40 件以上 → 実 58 件」と書いたが実数は 60 件
- **運用ルール 4（PM Read 観察の縮小不可）違反**: T-E-視覚回帰で `/internal/tiles` を観察対象から除外
- **レビュー打ち切り運用 5 件すべてが誤判定**: 「将来の手戻りを先取りで潰すレビューサイクル」を「反復膨張」と誤認した結果

### cycle-kickoff 手順

- **手順 3 違反（cycle-191 PM）**: B-314（Phase 7 全体統括）を「第 1 弾基盤整備で完了」と不正にスコープ縮小して Done 移動
- **本サイクル運用ルール 1（実体確認後に書く）違反**: cycle-kickoff 手順の Read 省略 / 「動く」判定の実機検証省略 / cycle-191 成果物の実機検証省略 / 設計書 core intent の Read 省略
- **運用ルール 6（計画書改訂を先に行う）違反**: cycle-192 T-C で AccordionItem を `<details>` 直書きで回避した時、計画書を改訂せず実装側で吸収

---

## (3) サイクル運用の構造的失敗 22 ステップの時系列

### cycle-191 段階

1. **T-A〜T-C で `frontend-design` スキル / `DESIGN.md` を一度も参照せず**設計を進めた（Use Skills and Sub-Agents 必須参照ルール違反）。Panel を知らないままコンポーネントを設計した根本原因。
2. **T-B-設計 r1 で軽微 1〜3 を「T-B-実装 段階で吸収。明示的対処不要」として後送り**。問題を次フェーズに繰り延べることで、後段での手戻りが加速度的に拡大する構造が生まれた。
3. **T-B-実装 r1 で軽微 1 / 軽微 2（useToolStorage key 変更時挙動 / ResultCopyArea コピー失敗）を「T-D-実装で顕在化したら対処」として後送り**。来訪者影響が基準となっており基盤責務の観点が抜けていた（AP-WF15 違反）。
4. **T-B-実装 r1 で再レビュー打ち切り**（「修正は機械的で副作用なし、再レビュー反復は cycle-190 r5 同型」）。膨張を健全な兆候と認識できなかった。防げた手段: Panel 不使用の検出。
5. **T-D-バリアント設計 でレビュー省略**（「設計のみでコード変更ゼロ」）。`meta.ts` howItWorks 件数を「実 58 件」と書いたが実数 60 件 = 実体確認なし（AP-WF12 / AP-P16 違反）。
6. **T-D-実装 統合レビュー r1 で軽微 3 / 軽微 4（CATEGORY_LABELS 二重定義 / getDailyEntry TZ 依存）を「本サイクルでは対応せず（cycle-190 反復膨張回避）」として後送り**。来訪者価値直結の表記ブレを放置。
7. **T-D-実装 統合レビュー r1 で再レビュー打ち切り**（「Playwright 再撮影で目視確認済み」）。
8. **T-E-視覚回帰で `/internal/tiles` を観察対象から除外**（「(legacy) 33 ツール + 20 遊びへの副作用確認」に限定）。基盤の動作実証なし = 運用ルール 4「PM Read 観察縮小不可」を自身で破った。
9. **T-E-設計ドキュメント検証 7 項目チェックリストを通過したと判定したが**、設計書の core intent「詳細ページ = large タイル設置場所」を読み取れていない。
10. **B-314 を「第 1 弾基盤整備で完了」と不正にスコープ縮小して Done 移動**。後続 PM が Queued から Phase 7 継続を選定できなくなった。
11. **実機検証なしに「基盤完成」と Done 判定**。

### cycle-192 段階

12. **cycle-191 PM 判定（「基盤完成」「タイル 2 件は埋め込まない」）を実体確認なしに継承**（AP-P10 / AP-WF12 違反）。
13. **T-A 設計で `frontend-design` スキル / `DESIGN.md` を一度も参照せず**設計を進めた（cycle-191 と同じ過誤を継承）。
14. **T-A 設計で「ツール詳細ページ = large タイル設置場所」core intent を読み取らず**、Component.tsx 直組み付けの独自構成を採用（案 D-2）。
15. **T-C 移行実装で Panel / Button を使わず独自 CSS で実装**（DESIGN.md §1 / §4 / §5 違反）。
16. **T-C r1 で AccordionItem に onToggle prop 追加 → AP-I02 警戒で revert + `<details>` 直書きへの手戻り**（cycle-191 で軽微 1 / 軽微 2 を後送りした結果の顕在化）。
17. **T-D 視覚回帰で `/tools/keigo-reference` 4 枚しか撮影せず、`/internal/tiles` を観察対象から除外**（cycle-191 と同じ過誤を継承）。
18. **フィルタボタンタップ領域 / teineigo コピーを当初 T-F 申し送りに回そうとした**（来訪者価値軽視、WCAG 2.5.5 / Apple HIG 44pt 抵触 / ペルソナ A 「コピペで結果」likes 第 2 項違反 を「既存課題」と判定）。
19. **T-F-申し送りで個別スラッグ（B-413〜B-418）を起票し「次サイクルで何を実施するかを独断」**（cycle-kickoff 手順 3「次サイクル PM が Queued から選ぶ」の侵害）。
20. **trustLevel フィールドを「meta データに残す」判断で過去サイクル決定（cycle-180 / design-migration-plan.md L298）を覆す**（過去 PM 判断の無批判継承 = AP-P10 の裏返し、今度は無批判に「覆す」）。
21. **cycle-completion 直前まで「最低限動く」と認識**。設計書要件との照合なし。
22. **サイクル末尾の Playwright 実機検証で気付いて初めて要件未達が判明**。

**各ステップで防げた手段**:

- ステップ 1: `frontend-design` スキルを T-A 着手前に必須参照する Done 条件
- ステップ 4/7: 「レビュー打ち切り条件を致命的・重要・軽微すべてゼロに固定」する運用
- ステップ 8/17: 「T-D 視覚回帰の対象に本サイクルで作った検証ページを含める」Done 条件
- ステップ 11/21: 「動く」判定基準を「設計書要件チェックリスト全項目 ✓」に固定する運用
- ステップ 12: 「過去サイクル PM 判定の継承前に必ず実機検証」を Done 条件に組み込む

---

## (4) cycle-192 申し送り「次サイクル PM が最初にやること」9 項目 — 原文

（出典: cycle-192.md「次サイクルへの申し送り」セクション「次サイクル PM が最初にやること」）

1. **本事故報告と次サイクルへの申し送りを最初に Read**: 失敗の事実 / 違反したルール / 立て直し方針を理解してから着手

2. **`frontend-design` スキル / `DESIGN.md` を Read で必須参照**: 計画書の参考資料リストに DESIGN.md / frontend-design スキル を必ず含める。**特に DESIGN.md §1「すべてのコンテンツはパネルに収まった形で提供される」を core intent として T-A 設計時から組み込む**

3. **`docs/design-migration-plan.md` Phase 7 core intent の Read**: 「30 ツールと 13+ ゲームを 1 コンテンツ 1 サイクルで『詳細ページの新デザイン移行 + **タイル定義**』を**同時実施**」 = ツール詳細ページ = large タイル設置場所 core intent。タイル設計時から「タイルは詳細ページと道具箱の両方に同仕様で乗る」前提を確定する

4. **過去サイクル決定（cycle-180 / design-migration-plan.md L298）を実体確認**: TrustLevelBadge 全廃方針を継承

5. **`docs/anti-patterns/` 全件 Read**: 計画段階で core ルール照合の観点で読む

6. **B-314（Phase 7 全体統括）を Active に動かして、第 1 弾 = 基盤再構築から着手**: 「ツール詳細ページ = `Tile.large-full.tsx` 設置場所」を core intent として、新版コンポーネント / TileVariant / `/internal/tiles` を Panel / Button ベース + CSS Grid サイズ規格 + DnD 機能 + モバイルフォールバックすべて含めて再設計

7. **「動く」の定義を要件充足まで含めた厳密版に**: コンパイル通過 / 200 OK / テキスト表示は「動く」の入口にすぎない。設計書と照合した要件充足こそが「動く」の意味

8. **レビュー打ち切り運用を採用しない**: 「反復膨張回避」を理由に r1 打ち切りを基本線にしない。膨張は将来手戻りの先取り発見であり健全な兆候

9. **計画書 / 設計書改訂と実装の順序を逆転させない**: 運用ルール 6（実装中に計画書からの逸脱があれば計画書を先に改訂）を厳守

### 各項目の cycle-193 計画書要素への初期マッピング

| 申し送り項目                                            | cycle-193 計画書の対応箇所（初期マッピング）                                                                   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1. 事故報告を最初に Read                                | cycle-193 計画書の「参考資料リスト」先頭に cycle-191.md / cycle-192.md を記載                                  |
| 2. DESIGN.md / frontend-design 必須参照                 | T-A 設計の Done 条件に「DESIGN.md §1/§4/§5 / frontend-design スキル Read 済みの記録」を含める                  |
| 3. design-migration-plan.md Phase 7 core intent の Read | T-A 設計の着手条件に「design-migration-plan.md Phase 7 全文 Read 済み」を含める                                |
| 4. 過去サイクル決定の実体確認                           | 計画書の前提確認セクションに「cycle-180 決定・design-migration-plan.md L298 を Read で確認済み」を含める       |
| 5. anti-patterns/ 全件 Read                             | 計画段階レビュー の Done 条件に「anti-patterns/ 全件の core ルール照合記録」を含める                           |
| 6. B-314 Active 化 + 基盤再構築                         | T-A 設計の Done 条件に「Panel / Button / CSS Grid / DnD / モバイルフォールバックの設計組み込みを明示」を含める |
| 7. 「動く」の定義を要件充足まで                         | 各タスク Done 条件に「設計書要件チェックリスト全項目 ✓」を標準化                                               |
| 8. レビュー打ち切り運用を採用しない                     | 計画書の運用ルールに「レビュー打ち切り条件 = 致命的・重要・軽微すべてゼロ」のみを許容と明記                    |
| 9. 計画書改訂と実装の順序                               | 計画書の運用ルールに「AP-I02 運用ルール：計画書改訂を先に行う」を明記（cycle-191 運用ルール 6 と同じ）         |

---

## (5) cycle-193 で「使わない運用 / 判断」4 項目（原文）

（出典: cycle-192.md「次サイクルへの申し送り」セクション「次サイクルで使わない運用 / 判断（cycle-191 + cycle-192 から継承しない）」）

1. **計画段階レビュー r1 / r2 打ち切り運用**: cycle-190 r5「反復膨張」を誤認した運用。本サイクルで誤判定 5 件発生

2. **「来訪者影響顕在化の有無」を後送り判断軸とする運用**: AP-WF15 違反、基盤責務の観点が抜ける

3. **「Phase D 絶対境界」のような後付けスコープ縮小**: cycle-191 PM が B-314 を「第 1 弾基盤整備」にスコープ縮小して Done 移動した不正の遠因

4. **「タイル非埋め込み」判断（cycle-191 L1733 / cycle-192 T-A 案 D-2）**: 設計書 core intent と矛盾。完全撤回

---

## (6) cycle-193 計画書に組み込むべき「構造的歯止め」5 項目（原文）

（出典: cycle-192.md「次サイクルへの申し送り」セクション「失敗を繰り返さないための構造的歯止め（次サイクル計画書に組み込むべき）」）

1. **計画段階レビュー打ち切り基準を「致命的・重要・軽微すべてゼロ」に固定**（「反転膨張」を理由とする打ち切りを禁止）

2. **T-A 設計の Done 条件に「DESIGN.md / frontend-design / `docs/tool-detail-page-design.md` 全文 Read 後に書く」を含める**

3. **T-D 視覚回帰の対象に「本サイクルで作った検証ページ + 本サイクルで触ったコンテンツ + 依存している基盤すべて」を含める**（cycle-191 / cycle-192 が `/internal/tiles` を観察対象から除外して失敗）

4. **「動く」判定基準を「設計書要件チェックリスト全項目 ✓」に固定**（コンパイル / 200 OK / テキスト表示では「動く」と判定しない）

5. **過去サイクル PM 判定の継承前に必ず実機検証**（「基盤完成」を主張する判定は Done 移動 = 検証完了の意味と読み替えない）

---

## (7) 「タイル化に馴染まないコンテンツ」「ツール詳細ページ = Tile.large-full.tsx 設置場所」の core intent 根拠条文

### design-migration-plan.md Phase 7 （L157-L183）

**同時実施の根拠**:

> 各コンテンツを 1 つずつ「詳細ページ移行 + タイル定義」を同サイクルで実施。「2 回の作り直し」を避けるための同時実施。（L159）

**タイル化に馴染まないコンテンツの明示**:

> タイル化に馴染まないコンテンツ（ブログ的な遊びなど）は詳細ページのデザイン移行のみ行いタイル定義は付けない。（L180）

これは design-migration-plan.md L180 の明示規定。「ブログ的な遊び」等が該当し、通常のツール系コンテンツはタイル化対象。

**大型タイルと詳細ページの関係（cycle-190.md より）**:

> **large**（1 つ、全機能）: 検索 + カテゴリフィルター + 候補表示 + 例文展開 + 「よくある間違い」タブ（L493）

これが「ツール詳細ページ = Tile.large-full.tsx 設置場所」の直接根拠。

### cycle-192 申し送りからの参照

> 「30 ツールと 13+ ゲームを 1 コンテンツ 1 サイクルで『詳細ページの新デザイン移行 + **タイル定義**』を**同時実施**」 = ツール詳細ページ = large タイル設置場所 core intent。タイル設計時から「タイルは詳細ページと道具箱の両方に同仕様で乗る」前提を確定する（申し送り 3 番）

### 削除された docs/tool-detail-page-design.md の内容矛盾（cycle-192.md L744-L748 より確認）

当該ドキュメントは cycle-192 末尾で以下の理由で削除された:

1. **同ドキュメント内の自己矛盾**: L1124 / L1331-L1333 で `keigo-reference-large-full` を `gridSpan: { cols: 2, rows: 2 }` + tileDescription「敬語早見表の全機能」と定義しながら、L1733 で「タイルは検証用 + 詳細ページには埋め込まない」と決定 = 同ドキュメント内での自己矛盾
2. **design-migration-plan.md Phase 7 core intent との矛盾**: 「同時実施」原則に対し L1733 が「タイルは詳細ページに埋め込まない」と直接矛盾
3. **DESIGN.md §1 との不整合**: ToolDetailLayout 責務定義に「Panel コンポーネントに収まる」前提が一切記載されていない

よって cycle-193 では、`docs/tool-detail-page-design.md` は存在しない（削除済み）。設計書は cycle-193 で再作成する必要がある。

---

## (8) 「(legacy) keigo-reference の現状仕様」cycle-191 着手前の状態

**実体確認結果**（2026-05-16 時点、685cfe9c で revert 済み = cycle-191 着手前 e5bb6bce の状態に一致）:

### ファイル構成（実体確認済み）

```
src/app/(legacy)/tools/keigo-reference/
  opengraph-image.tsx
  page.tsx
  twitter-image.tsx

src/tools/keigo-reference/
  Component.module.css
  Component.tsx
  __tests__/
  logic.ts
  meta.ts
```

Tile 系ファイル（Tile.medium-search.tsx / Tile.small-daily-pick.tsx）は存在しない。これらは cycle-191 の成果物であり、685cfe9c の revert で削除された。

### page.tsx の実体（34 行）

```tsx
import ToolLayout from "@/tools/_components/ToolLayout";
import ToolErrorBoundary from "@/tools/_components/ErrorBoundary";
import KeigoReferenceComponent from "@/tools/keigo-reference/Component";
// (中略)
return (
  <ToolLayout meta={tool.meta}>
    <script type="application/ld+json" ... />
    <ToolErrorBoundary>
      <KeigoReferenceComponent />
    </ToolErrorBoundary>
  </ToolLayout>
);
```

旧 ToolLayout 使用、KeigoReferenceComponent を ToolErrorBoundary でラップ、JSON-LD（WebApplication）出力。

### meta.ts の実体（43 行）

主なフィールド:

- `slug`: "keigo-reference"
- `name`: "敬語早見表"
- `shortDescription`: "尊敬語・謙譲語・丁寧語の変換早見表"（20 文字）
- `trustLevel`: "curated"
- `howItWorks`: "基本動詞・ビジネス頻出・接客サービスの3カテゴリで**40件以上**の動詞を内蔵…"（実体は 60 件だが meta.ts 上は「40件以上」表記）
- `faq`: 3 件（掲載件数 / 用例確認 / よくある間違い確認）
- `relatedSlugs`: ["business-email", "kana-converter", "char-count"]

注: cycle-192 T-B-先行整備（B-409 / B-411）で実施した修正（howItWorks「60件以上」訂正 / CATEGORY_LABELS 統一）は 685cfe9c の revert で元に戻っており、現状 meta.ts は「40件以上」表記のままとなっている。

### 現状の (legacy) ToolLayout 構造

旧 3 ゾーン構成（ゾーン 1 = Breadcrumb + h1 + shortDescription、ゾーン 2 = ツール本体 = children、ゾーン 3 = 補助情報）を使用。FaqSection / RelatedTools / RelatedBlogPosts が共通コンポーネントとして存在するが、これらは `src/components/common/` 配下のファイルであり cycle-193 では触らない（cycle-191 運用ルール 2 の歯止めを cycle-193 でも継承すべき）。

---

## 付記: git 上の変更概要

| コミット | 説明                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| e5bb6bce | cycle-191 着手前の最終コミット（Merge pull request #78 / ブログレイアウト改善） |
| ff2712fd | cycle-191 kickoff                                                               |
| fb2a0e16 | cycle-191 完了（「基盤整備完遂」として Done 判定 = 後に誤判定と確認）           |
| 03a966fe | cycle-192 開始                                                                  |
| 685cfe9c | **全 42 ファイルを revert（e5bb6bce 状態に戻す）**。3315 行削除 / 289 行追加    |
| 8b363713 | docs/tool-detail-page-design.md 削除（内容矛盾発覚のため）                      |
| c6c87c56 | cycle-192 失敗クローズ（冒頭に失敗認定明記 + completed_at 設定）                |
| 61a95abb | cycle-193 kickoff（B-314 Phase 7 第 1 弾 = 基盤再構築の着手）                   |
