---
id: 190
description: 移行計画 Phase 7（ツール・遊び詳細ページの新デザイン移行 + タイル化）の第 1 弾として /tools/keigo-reference を (legacy)→(new) に移行し、ToolLayout 新デザイン化と (b) 1 対多 軽量版タイル実装を同時に行う。同サイクル内で Phase 7 補強手順を design-migration-plan.md に docs 化する。
started_at: "2026-05-14T08:14:42+0900"
completed_at: "2026-05-14T11:33:01+0900"
---

# サイクル-190

`docs/design-migration-plan.md` の Phase 7（ツール・遊び詳細ページの新デザイン移行 + タイル化）を第 1 弾から開始する。Phase 7 は 34 ツール + 20 遊び（result ページ含む）の合計 54 件を「1 コンテンツ 1 サイクル」で順次移行する長期工程。

第 1 弾は **`/tools/keigo-reference`**（GA4 過去 90 日 PV 46 で全ツール 1 位、Organic Search 95% / 直帰 53%）を選定。cycle-179 B-309-2 で **(b) 1 対多 = 軽量版が必要** に分類された軽量版タイルコンポーネント新規実装も同サイクル内で行う（plan doc Phase 7「2 回の作り直しを避けるため、詳細移行とタイル化を同時実施」原則）。

本サイクルの主成果物は 3 つ:

1. **`/tools/keigo-reference` の新デザイン化と (legacy)→(new) 移動** — 来訪者への直接価値
2. **ToolLayout の新デザイン化** — Phase 7 残り 33 ツールへの基盤波及（Phase 7 第 1 弾固有の波及効果）
3. **Phase 7 補強手順の docs 化**（`docs/design-migration-plan.md` の「1 ページ移行の標準手順」セクションへの追記） — 本サイクルで得た知見を**本サイクル内で**永続化（次サイクル PM はコンテキストリセット後でも参照できる）

## 実施する作業

- [x] T-0a: API ファクトチェック表 (`./tmp/cycle-190/api-fact-check.md`) を計画書記述前に Read で実体確認した結果として継続更新（r3 致命的-A 再々発の根本対応）
- [x] T-0b: kickoff 直後の before 撮影 — `/tools/keigo-reference` の (legacy) 状態を代表 10 幅 × ライト/ダーク = 20 枚、`./tmp/cycle-190/before/` に保存
- [x] T-1: 設計判断 X / Y / Z の確定値の適用 — 計画段階で 3 案比較済み（後述「計画段階で確定すべき設計判断」）。実装段階の本タスクは確定済みマトリクスをそのまま適用するのみ
- [x] T-2: ToolLayout の新デザイン化 — Panel ラップ適用（設計判断 X 確定マトリクス）+ `ToolLayout.module.css` のトークン置換 + DESIGN.md §1 / §4 / §6 適用（タイポ階層・余白リズム・Panel 内パディング感）。FaqSection / RelatedTools / RelatedBlogPosts は本サイクルで **移設せず** import パスのまま（Phase 7 全 34 ツールへの副作用回避）、内部 CSS module のトークン置換のみ行う。**他ツール波及スポットチェック**: Phase 7 で次に着手予定の代表ツール（PV 上位 char-count / sql-formatter / email-validator / qr-code 等）4 件を Playwright 1440px × ライト/ダーク = 8 枚撮影し、PM Read で視覚破綻なしを確認
- [x] T-3: `/tools/keigo-reference` 詳細ページの (legacy) → (new) 移行 — `git mv` + 個別 Component.module.css のトークン置換 + 動作同一性確認（4 コア体験）
- [x] T-4: 軽量版タイルの実装（設計判断 Y / Z 確定済み、r5 で Z を訂正） — `src/tools/keigo-reference/Tile.tsx` + `.module.css` 新規実装、`src/lib/toolbox/tile-loader.ts` の `getTileComponent` に keigo-reference 分岐追加。**INITIAL_DEFAULT_LAYOUT への投入は行わない**（設計判断 Z 案 Z3 採用 — 配線が無い現時点では visitor 価値が発現しないため、Phase 9 配線実装時に同時投入する旨を T-9 で docs 化）
- [x] T-5: PM Read 観察 — before/after 各 20 枚を PM 自身が Read で読み込み、5 評価軸（target user likes / dislikes / 視覚挙動連続性 / 視覚バグ・a11y / 動作同一性）で評価コメントを cycle-190.md に記録（reviewer 代行禁止）。**完了後に reviewer による独立追読**: PM 評価と reviewer 独立観察に齟齬がないか照合し、齟齬があれば Owner に実画像を提示
- [x] T-6: (new) → (legacy) クロス遷移 1 経路の観察記録 — `/tools/keigo-reference` (new) → `/tools/business-email`（legacy、relatedSlugs 内）の視覚断絶を Playwright で記録
- [x] T-7: 視覚バグ / a11y / UX 課題の判断と対応 — AP-WF15 4 軸で判断し、後送り判断は同日に backlog.md 起票
- [x] T-8: `npm run lint && npm run format:check && npm run test && npm run build` の確認
- [x] T-9: **Phase 7 補強の docs 化（事例として追記）** — `docs/design-migration-plan.md` の「1 ページ移行の標準手順」セクション L289 への追記。**本サイクルでは「事例として」追記する**（keigo-reference 1 サンプルからのテンプレ化は AP-P17 / AP-P10 同型のため避ける）。追記内容: (i) keigo-reference 第 1 弾の実際の判断経緯と確定結果、(ii) 10 代表幅 + 5 評価軸の PM Read 観察手順、(iii) relatedSlugs 経由のクロス遷移観察手順。**テンプレ化（複数事例の帰納による一般手順化）は第 3-5 弾完了後の独立 backlog**
- [x] T-10: cycle-completion 事務処理 — backlog.md B-365 を Done セクションに移動（Notes: commit 5e619f2c で訂正済み確認、cycle-190 で実体整合最終確認）。本サイクルで発見された後送り項目（T-7 / スコープ外 §の Phase 10.2 移設項目）の backlog 起票確認。**T-10 で cycle-187 S4-exec 申し送り側の Done 移動も確認する**（T-2 で「ゾーン3 全体を 1 Panel で包む」による RelatedTools / RelatedBlogPosts 個別 Panel ラップ不採用を確定済みのため、申し送りタスクの実体が解消されているかを確認し、解消済みなら Done 移動する）

**スコープ外**（明示分離 — 本サイクルで判断・実装しない）:

- 横断ルール化（Panel ラップ判断を ToolLayout 以外のコンテンツ系コンポーネントへ展開する判断）→ 第 2〜3 弾の知見蓄積後に独立 backlog 起票
- Phase 7 補強手順の「テンプレ化」（帰納による一般手順化）→ 第 3-5 弾完了後の独立 backlog（本サイクル T-9 は「事例として追記」のみ）
- 残り 33 ツール + 20 遊びの詳細移行 → 各 1 サイクル
- FaqSection / RelatedTools / RelatedBlogPosts の `src/components/` 配下への namespace 移設 → Phase 7 全 34 ツールが触る共有依存のため、本サイクルでは move せず CSS トークン置換のみ。**Phase 10.2 で `src/components/common/` 自体が legacy 撤去対象として削除予定**（plan doc L257）のため、Phase 7 完了後または Phase 10.2 で必ず移設または削除判断を行う。本サイクル T-10 で該当 backlog 項目の存在を確認し、なければ起票する
- 混在期間中のクロス遷移視覚断絶の本格修正 → T-6 で観察のみ。本格修正は Phase 7/8 完了で自然解消する見込みのため、必要と判断された場合のみ AP-WF15 4 軸で backlog 起票

## 作業計画

### 目的

Phase 7 を「最大 PV のツール」から開始することで、来訪者にとっての即時価値（最も多くの来訪者が新デザインを体験する）と、Phase 7 全体への波及効果（ToolLayout 新デザイン基盤 + (b) 1 対多 軽量版タイル設計テンプレ + Phase 7 補強手順の docs 化 の 3 つを同時確立）を両立する。

CLAUDE.md L9「Decision Making Principle」「Implementation cost must never be a reason to choose an approach that delivers inferior UX」および Constitution Rule 4「Prioritize the quality than the quantity. Maintain all contents have the best quality in every aspect for visitors」に従い、PV の大きい visitor 体験を旧デザインで長期間留め置く設計は避ける。

### 対象 visitor とその求め

主に `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`:

- likes: 「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」「結果の根拠や前提が必要最小限だけ添えられており、信頼して使えること」
- dislikes: 「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」「広告やポップアップで目的の入力欄が埋もれていること」

副次的に `docs/targets/気に入った道具を繰り返し使っている人.yaml`:

- likes: 「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」「ブックマークしたURLを開けばすぐ目的のツールが表示されること」
- dislikes: 「以前と同じ入力なのに結果や挙動が前回と変わっていること」

keigo-reference は Organic Search 95% でランディング率が高く、「特定の作業に使えるツールをさっと探している人」が検索から直接到達する典型。直帰率 53% は改善余地があり、新デザインによる第一印象の改善が直接的な visitor 価値となる。

### 計画段階で確定すべき設計判断（3 つ）

実装段階に委ねるとカスケードする副作用が大きいため、以下 3 つは計画段階で確定する。

#### 設計判断 X: ToolLayout の構造をどうするか

実体確認: `src/tools/_components/ToolLayout.tsx` は cycle-160 で確立された 3 ゾーン構成（ゾーン1 = Breadcrumb + h1 + shortDescription、ゾーン2 = ツール本体 = children、ゾーン3 = howItWorks + privacyNote + FaqSection + ShareButtons + RelatedTools + RelatedBlogPosts）を既に実装している。ゾーン2 がゾーン1直後でファーストビューに近く配置されている設計（同ファイル L31 コメント）。

target user dislike「ツール冒頭に長い解説」への対処は既存 3 ゾーン構成で施されており、構造変更には連続性リスクがある。

##### 3 案比較

| 軸 \\ 案                              | 案 X1: 現行 3 ゾーン維持              | 案 X2: ゾーン3 全 `<details>` 折りたたみ化 | 案 X3: ゾーン3 を 2 カラム化（FAQ サイドバー + Related 下段） |
| ------------------------------------- | ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| dislike「ツール冒頭の長い解説」対処度 | ◎（cycle-160 で対処済み）             | ◎（補助情報非表示でさらに簡素化）          | ◯（FAQ がサイドバーに移動）                                   |
| dislike「以前と挙動が違う」連続性     | ◎（構造維持）                         | △（補助情報のクリック手順が増える）        | ✕（PC でレイアウトが大きく変わる）                            |
| Phase 7 全 34 ツールへの汎用性        | ◎（既存構成のため全ツール即適用可能） | ◯（補助情報量に依存して有用性が変動）      | ✕（テーブル + グリッド表示のあるツールにはサイドバー圧迫）    |
| 実装複雑度                            | 低（CSS + Panel 適用のみ）            | 中（`<details>` 化 + アフォーダンス設計）  | 高（Grid 再設計 + ブレークポイント分岐）                      |

**確定**: **案 X1（現行 3 ゾーン構成維持 + 新トークン適用 + Panel ラップ判定マトリクスに従う）**。理由: 既存設計が target user dislike に対応済みで、繰り返し利用者の連続性を最も保つ。Phase 7 全 34 ツールへの即時波及性も最大。構造変更の便益は計画段階で判定できないため、Phase 7 第 2 弾以降の知見蓄積後に再評価する余地を残す。

##### Panel ラップ判定マトリクス（X1 採用前提、r4 で実体に基づき再構築）

**実体ベースの判定基準**（API ファクトチェック表 #5 / #7 で実体確認済み）:

- Panel コンポーネントの prop は `padding?: "normal" | "comfortable"`（`variant` ではない）
- FaqSection は `<section>` 要素を使い Panel コンポーネントを内部利用していないため、外から Panel ラップしても「Panel 入れ子」にはならない
- DESIGN.md §1「すべてのコンテンツはパネルに収まった形で提供される」+ §4「パネルは入れ子にしない」を両立する判断が必要

**ゾーン3 全体（補助情報 4 + Share）の Panel 扱いの 3 案再評価**:

| 軸 \\ 案                             | 案 W1: ゾーン3 を 1 つの大 Panel で包む（内部要素は Panel なし） | 案 W2: 4 セクションそれぞれ独立 Panel | 案 W3: ゾーン3 は Panel なし |
| ------------------------------------ | ---------------------------------------------------------------- | ------------------------------------- | ---------------------------- |
| DESIGN.md §1「Panel に収まる」整合   | ◎                                                                | ◎                                     | ✕                            |
| DESIGN.md §4「Panel 入れ子なし」遵守 | ◎                                                                | ◎                                     | ◎                            |
| 視覚一貫性（4 セクション同階層認識） | ◎（1 つの Panel 内で h2 + 余白で区切る）                         | △（4 つの Panel が縦並びで重い）      | -                            |
| 情報階層の来訪者理解しやすさ         | ◯（補助情報がまとまる）                                          | ◎（各セクション独立認識）             | -                            |
| 実装複雑度                           | 低                                                               | 中                                    | 低                           |

**確定**: 案 W1（ゾーン3 全体を 1 つの大 Panel で包み、内部の 4 セクションは h2 + 余白で区切る）。

**最終 Panel ラップ判定マトリクス**:

| セクション                 | Panel ラップ | `as`      | `padding`     | 根拠                                                                                               |
| -------------------------- | ------------ | --------- | ------------- | -------------------------------------------------------------------------------------------------- |
| Breadcrumb                 | なし         | -         | -             | ナビゲーション要素のため Panel 不要（Phase 6 ブログ詳細で確立）                                    |
| ゾーン1 header             | なし         | -         | -             | h1 + shortDescription の 2 行のみで Panel ラップは過剰                                             |
| ゾーン2 ツール本体         | あり         | "section" | "comfortable" | DESIGN.md §1。ツール操作中心領域として広めパディングが視覚的余裕を生む                             |
| ゾーン3 補助情報全体       | あり         | "section" | "normal"      | 案 W1 採用。howItWorks / privacyNote / FaqSection / Share / RelatedTools / RelatedBlogPosts を包む |
| ゾーン3 内部の各セクション | なし         | -         | -             | 親 Panel 内部のため Panel ラップ禁止（DESIGN.md §4 入れ子禁止）。h2 + 余白で視覚区切り             |

cycle-187 S4-exec 申し送り「RelatedArticles / PlayRecommendBlock の Panel ラップ最終判断」のツール側対応は「ゾーン3 全体を 1 Panel で包むため、RelatedTools / RelatedBlogPosts を個別 Panel でラップしない」が本マトリクスの結論。

**実装段階での実体評価結果**: section 入れ子（`<article> > <section>（ゾーン3 Panel） > <section>（FaqSection / RelatedBlogPosts 内部）`）は、外殻の `<Panel as="section" aria-label="このツールに関する補助情報">` に aria-label が付いており SR rotor で識別可能。`<Panel as="div">` への変更は landmark 認識が失われるため案 X1（既存構造維持）の精神に反する。現状維持を採用。

**r5 補強（reviewer 重要-1 対応）**: RelatedTools / RelatedBlogPosts の内部実体を Read で実体確認した結果（API ファクトチェック表 #16 / #17）、両者とも Panel コンポーネントを内部使用していないため、案 W1 で外から Panel ラップしても DESIGN.md §4「Panel 入れ子禁止」違反は発生しない。ただし、案 W1 で `<Panel as="section">` で包むと `<article> > <section>（ゾーン3 Panel） > <section>（FaqSection 内部）/ <nav>（RelatedTools 内部）/ <section>（RelatedBlogPosts 内部）` の入れ子構造になる（API ファクトチェック表 #18）。HTML5 違反ではないが SR rotor で「セクション名のない外殻」がノイズになる可能性があるため、**実装段階で `<Panel as="div">` または `<Panel as="section" aria-label="補助情報">` のいずれかを実体で評価する**（計画書では a11y 影響の存在を明示する にとどめる）。

#### 設計判断 Y: 軽量版タイルに何を残すか（cycle-179 で (b) 1 対多 = 軽量版が必要 に分類）

実体確認: keigo-reference の 4 コア体験は (a) キーワード検索、(b) カテゴリで眺める、(c) 動詞をクリックして使用例を展開、(d) 「よくある間違い」タブで誤用パターン確認 — `src/tools/keigo-reference/meta.ts` L19-25, L31-43 で確認。軽量版タイルは道具箱内の限られたスペースで、これらコア体験のどれを残すかを判断する。

##### 3 案比較

| 軸 \\ 案                                      | 案 Y1: 検索のみ               | 案 Y2: 検索 + カテゴリチップ + 候補 + 例文 1 つ | 案 Y3: カテゴリチップで眺める + 例文 1 つ展開（検索を捨てる版）           |
| --------------------------------------------- | ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| 道具箱内の visitor 即時価値                   | △（検索しないと何も出ない）   | ◎（検索 + 眺める両方の入口、即時価値あり）      | ◯（眺める価値はあるが能動的検索不可）                                     |
| target user「繰り返し利用」適性               | ◎（既存検索体験の縮小版）     | ◎（4 コア体験のうち 3 つを保持）                | △（検索が無いと迷子のリスク、繰り返し利用で「いつもの言葉」を引きにくい） |
| 詳細ページへの導線価値                        | ◯（検索で見つからない時のみ） | ◯（複数の入口から詳細遷移可能）                 | ◎（カテゴリで眺めた後に詳細で深掘り）                                     |
| 実装複雑度                                    | 低                            | 中                                              | 低（検索ロジック不要）                                                    |
| target user dislike「結果が前回と変わる」整合 | ◎（同じ入力で同じ結果）       | ◎（同じ入力で同じ結果）                         | ◎（カテゴリ選択で同じ結果）                                               |

**確定**: **案 Y2（検索 + カテゴリチップ + 候補 3〜5 件 + 選択時に例文 1 つ表示）**。理由: 4 コア体験のうち検索・カテゴリ・例文展開の 3 つを軽量版で保持し、target user「気に入った道具を繰り返し使っている人」の連続性を最大化。「よくある間違い」タブは省略するが、詳細ページへの「詳細を開く」リンクで補完。

##### 軽量版タイルの構造

- 上段: 検索ボックス + 主要カテゴリチップ 3 つ（基本動詞 / ビジネス頻出 / 接客サービス）
- 中段: 検索 or カテゴリ選択結果の候補 3〜5 件（動詞名のみ）
- 下段: 候補クリック時に「尊敬語 / 謙譲語 / 丁寧語」を 1 行ずつ + 例文 1 つ
- フッター: 「詳細を開く」リンクで `/tools/keigo-reference` へ

#### 設計判断 Z: 本サイクルで実装する Tile.tsx を `INITIAL_DEFAULT_LAYOUT.tiles` に投入するか

実体確認（API ファクトチェック表 #10、r5 で根本訂正）: `grep -rn "INITIAL_DEFAULT_LAYOUT" src/` の結果、**`src/app/` 配下からの import は 0 件**（テストファイル `__tests__/initial-default-layout.test.ts` 以外で参照ゼロ）。`src/app/page.tsx` や `src/app/(new)/page.tsx` 等のルートから INITIAL_DEFAULT_LAYOUT を読んでレンダリングしているコードは存在しない。

つまり INITIAL_DEFAULT_LAYOUT は**現時点では visitor 露出していない**（SSR HTML に出ていない）。ファイル冒頭コメント（L4-9）も「初回レンダリング用最小デフォルトプリセット **型**」「初回来訪者・SNS シェア訪問者・Googlebot に空でない初期道具箱を見せる**ための枠組み**」と書かれており、これは**枠組みの定義であって、まだルートから参照されていない**。配線（ルートからの import + レンダリング）は Phase 9（ダッシュボード本体実装）で行われる予定。

r4 で「SSR HTML に実タイルが出る」と書いたのは**実体（配線の有無）を確認せずコメントの意図を実装済みと読み違えた**結果で、r5 で訂正する。AP-WF12 / AP-P16 四度目の同型違反。

##### 3 案比較（r5 で配線実体確認に基づき再評価）

| 軸 \\ 案                       | 案 Z1: 本サイクルで fixture を実 slug に差し替え                                                                  | 案 Z2: Phase 7 完了後に一括差し替え | 案 Z3: Phase 9 着手時まで差し替えない           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| visitor 価値発現時期           | **なし**（配線が無いため差し替えても visitor に届かない）                                                         | **なし**（同上）                    | Phase 9 完了後（配線実装と同時に visitor 露出） |
| 「中途半端な並び」visitor 露出 | -（visitor に見えない）                                                                                           | -                                   | なし                                            |
| 配線実装との整合               | △（実 slug が配線前に「定数だけ」差し替わる）                                                                     | △（同上）                           | ◎（配線実装時に揃った状態で公開）               |
| plan doc 意図整合              | コメントは「実タイル差し替え」を Phase 7 で行うと明示。差し替え時期は配線時期と独立に許容される（コメントの解釈） | △                                   | △                                               |
| 実装単純度                     | 低                                                                                                                | 中                                  | 高                                              |
| 1 件差し替え時のリスク         | 低（配線が無いので visitor 影響ゼロ）                                                                             | -                                   | -                                               |

**確定**: **案 Z3（Phase 9 着手時に配線実装と同時投入）**。理由: 配線が無い現時点で `fixture-medium-1` を `keigo-reference` に差し替えても visitor には何も届かない（visitor 価値ゼロ）。一方で「実装済みの Tile が将来 INITIAL に投入される際に visitor に揃った状態で見える」ことが重要なので、本サイクルでは **Tile.tsx 実装 + tile-loader.ts 分岐追加** までを行い、INITIAL 投入は Phase 9 配線実装と同時にまとめて行う。これは plan doc 原則「2 回の作り直しを避ける」とも整合する（実 Tile 実装は Phase 7、INITIAL 投入は Phase 9 で各 1 回ずつ）。

**r4 → r5 訂正の経緯**: r4 で案 Z1 を採用したのは「INITIAL_DEFAULT_LAYOUT が SSR HTML に出ている」という前提誤認に基づく。r5 で `grep` により配線実体を確認した結果、現時点で `src/app/` 配下から INITIAL_DEFAULT_LAYOUT への import が 0 件であることが判明し、前提が崩れた。

### 作業内容

#### T-0a: API ファクトチェック表の継続更新

`./tmp/cycle-190/api-fact-check.md` に記述済み 15 項目に加えて、cycle-execution で新たに登場する API 名 / prop 名 / フィールド名 / ファイルパスを Read で実体確認した結果を追記する。r3 致命的-A 再々発（Panel prop 名誤記）の根本対応。Read で実体確認していない記述は計画書・コミットメッセージ・コードに書かない。

#### T-0b: kickoff 直後の before 撮影（AP-WF05 準拠）

cycle-execution の最初のコミット前に `/tools/keigo-reference`（legacy）を 320 / 375 / 390 / 768 / 900 / 1023 / 1024 / 1100 / 1440 / 1920px の代表 10 幅 × ライト/ダーク = 20 枚撮影し `./tmp/cycle-190/before/` に保存する。撮影前にコードを変更しない。

#### T-1: 設計判断 X / Y / Z の確定値を実装段階で適用

「計画段階で確定すべき設計判断」セクションで案 X1（ToolLayout 構造維持 + Panel ラップ判定マトリクス）、案 Y2（軽量版 Tile: 検索 + カテゴリチップ + 候補 + 例文）、案 Z1（`fixture-medium-1` → `keigo-reference` 差し替え）を確定済み。実装段階の本タスクは確定済みマトリクス・設計をそのまま適用するのみで、再判断はしない。

#### T-2: ToolLayout の新デザイン化（CSS トークン + Panel + DESIGN.md §1/§4/§6 適用）

「新デザイン化」の中身を実体に即して明示する（reviewer 重要-C 対応）:

- 変更対象: `src/tools/_components/ToolLayout.tsx` + `ToolLayout.module.css`
- 変更内容:
  1. ToolLayout.tsx 内に Panel ラップ適用（設計判断 X 確定マトリクスに従う。ゾーン2 ツール本体は `<Panel as="section" padding="comfortable">`、ゾーン3 補助情報全体は `<Panel as="section" padding="normal">`、ゾーン3 内部は Panel 入れ子禁止）
  2. ToolLayout.module.css 内の `--color-*` 系トークン → `--bg-*` / `--fg-*` / `--accent-*` 系トークンへ置換
  3. **タイポ階層の DESIGN.md §1 / §6 適用**: h1 / shortDescription / h2 / body の font-size 階層とリズム（Phase 6 ブログ詳細で確立した階層を継承）
  4. **余白リズムの DESIGN.md §1 適用**: ゾーン間 gap、Panel 外側 margin、Panel 内側 padding（comfortable = 2rem / normal = 1.5rem の Panel コンポーネント既定値を活用）
  5. **DESIGN.md §4 可読幅（720px）の適用** — ただし keigo-reference の「テーブル + グリッド表示」が 720px 内に収まるかは T-3 で実体確認し、必要なら詳細ページ側 CSS で wider 許容を行う（ToolLayout の可読幅は 720px 維持）
- 変更しないもの: FaqSection / RelatedTools / RelatedBlogPosts の **import パス**（Phase 7 全 34 ツール副作用回避のためスコープ外）
- **他ツール波及スポットチェック（reviewer 重要-D 対応）**: ToolLayout 変更は Phase 7 全 34 ツールに即時波及する。`npm run build` でビルド破綻は検出できるが、デザイン破綻は検出できないため、Phase 7 で次に着手予定の代表ツール 4 件（PV 上位 char-count / sql-formatter / email-validator / qr-code）を Playwright 1440px × ライト/ダーク = 8 枚撮影し、PM Read で視覚破綻なしを確認。**視覚破綻発見時の歯止め（r4 reviewer 重要-3 対応）**: AP-WF15 4 軸（来訪者影響 / サイクル目的範囲 / 規模 / 歯止め）で「ToolLayout の構造的問題で来訪者影響大」と判断されたら本サイクル内で再設計、「個別ツール側の特殊 CSS との衝突で本サイクル目的範囲外」と判断されたら当該ツール個別の修正を第 2 弾以降の独立サイクル backlog として起票する

#### T-3: `/tools/keigo-reference` 詳細ページの (legacy) → (new) 移行

- 移動: `git mv src/app/(legacy)/tools/keigo-reference/ src/app/(new)/tools/keigo-reference/`
- `src/tools/keigo-reference/Component.tsx` / `Component.module.css` の CSS トークンを新トークンに置換
- **動作同一性の厳守**: 4 コア体験（検索、カテゴリフィルター、動詞クリック例文展開、「よくある間違い」タブ）の動作が (legacy) と完全同一であることを Playwright で確認。target user dislike「以前と同じ入力なのに結果や挙動が前回と変わっていること」への対処
- リンク / サイトマップ / OGP 整合確認

#### T-4: 軽量版タイルの実装（設計判断 Y / Z 確定済み）

上記「設計判断 Y」で案 Y2（検索 + カテゴリチップ + 候補 + 例文 1 つ）、設計判断 Z で案 Z3（INITIAL_DEFAULT_LAYOUT 投入は Phase 9 配線実装と同時、本サイクルでは投入しない）を確定済み。実装段階:

- 新規ファイル: `src/tools/keigo-reference/Tile.tsx` + `Tile.module.css`
- 既存ロジック再利用: `src/tools/keigo-reference/logic.ts` の検索ロジックをそのまま再利用（既存テスト `__tests__/logic.test.ts` が保証）
- `src/lib/toolbox/tile-loader.ts` の `getTileComponent` に keigo-reference 分岐を追加（L80-85 のコメント例に従う形式）
- `src/lib/toolbox/initial-default-layout.ts` への差し替えは行わない（案 Z3 採用 — 配線が無い現時点では visitor 価値が発現しないため）。代わりに **本サイクル T-9 で「Phase 9 配線実装時に keigo-reference を INITIAL に投入する」旨を docs 化** し、Phase 9 PM への申し送りとする

#### T-5: PM Read 観察（cycle-188 違反 13 の再発防止）

- after 撮影: T-2 / T-3 / T-4 完了後に T-0 と同じ 20 枚を `./tmp/cycle-190/after/` に撮影
- PM Read: PM 自身が before / after 各 20 枚を Read tool で読み込む
- **評価軸（5 項目）**:
  1. target user likes 各項目に沿った改善があるか（「すぐ使い始められる」「余計な装飾がない」「結果の根拠が信頼できる」）
  2. target user dislikes 各項目への悪化がないか（「ツール冒頭に長い解説」「広告で入力欄が埋もれる」）
  3. **視覚挙動の連続性（reviewer 重要-F 対応）**: (legacy) 繰り返し利用者にとってボタン位置、タップ反応、フォーカス遷移、エラー表示の出方が大きく変わっていないか
  4. 視覚バグや a11y バグ（タップターゲット 44px、コントラスト 4.5:1、SR ナビゲーション）
  5. 動作の同一性が視覚で判断できる範囲で保たれているか
- **reviewer 代行禁止**: cycle-188 違反 13 の再発防止のため、reviewer に評価を委ねず PM 自身が記入する
- 記録先: cycle-190.md 内に「PM Read 観察」サブセクションを設けて 1 枚ずつ評価コメントを残す
- **reviewer による独立追読（reviewer 重要-F 対応）**: PM Read 観察記録の完了後、reviewer に独立観察を依頼する。reviewer は PM 評価コメントを見ずに同じ 20 枚を独立評価し、PM 評価と齟齬がないかを照合する。齟齬があれば Owner に実画像と双方コメントを提示して判断を仰ぐ

#### T-6: (new) → (legacy) クロス遷移 1 経路の観察記録

- 経路: `/tools/keigo-reference` (new) → `/tools/business-email`（legacy、`src/tools/keigo-reference/meta.ts` L19 で relatedSlugs に含まれる）
- Playwright で 1440px / 375px の代表 2 幅で記録
- 観察項目: ヘッダー左端ずれ / Panel スタイル差 / トーン差 / Font Loading 体感
- 視覚断絶が見つかった場合、本格修正はスコープ外（Phase 7/8 完了で自然解消する見込み）。AP-WF15 4 軸判断で必要と判断されたら backlog 起票
- cycle-187 S3-exec 申し送りへの直接応答

#### T-7: 視覚バグ / a11y / UX 課題の判断と対応

- レビューで発見された指摘は重要度ラベルで選別せず全件対応（cycle-189 単位 A 補強の運用継承）
- 後送り判断は AP-WF15 4 軸（来訪者影響 / サイクル目的範囲 / 規模 / 歯止め）で記録し、同日に backlog.md 起票（cycle-188 違反 23 / 24 の再発防止）

#### T-8: 完了基準確認

- `npm run lint && npm run format:check && npm run test && npm run build` 成功
- a11y: タップターゲット 44px、コントラスト 4.5:1 以上、SR ナビゲーション崩れなし
- 動作: 4 コア体験が (legacy) と同一動作

#### T-9: Phase 7 補強の docs 化（事例として追記）

本サイクル内で得た知見（次サイクル PM が引き継ぐ必要があるもの）を `docs/design-migration-plan.md` の「1 ページ移行の標準手順」セクション L289 への追記として永続化する。

**本サイクルでは「事例として」追記する（reviewer 重要-E 対応）**: keigo-reference 1 サンプルからのテンプレ化は AP-P17（3 案以上ゼロベース）と AP-P10（根拠なき高評価）の同型で、たまたま 1 件に効いた判断を Phase 7 全 54 件に敷衍するリスクがある。テンプレ化（複数事例の帰納による一般手順化）は第 3-5 弾完了後の独立 backlog として実施する。

##### 追記対象（事例として）

1. **keigo-reference 第 1 弾の判断経緯と確定結果**: 設計判断 X / Y / Z の 3 案比較表と確定値を「事例」として残す（次サイクル PM が同じ判断軸を再利用できる）
2. **Panel ラップ判定マトリクス**: 本サイクルで決定した「ゾーン2 = Panel comfortable / ゾーン3 全体 = Panel normal / ゾーン3 内部 = Panel 入れ子禁止」のマトリクスを keigo-reference 事例として残す
3. **PM Read 観察の事例記録**: keigo-reference 移行で実施した 10 代表幅 × ライト/ダーク = 20 枚 + 5 評価軸 + reviewer 独立追読の実例（評価コメント抜粋を含む）
4. **クロス遷移観察の事例記録**: keigo-reference (new) → business-email (legacy) の 1 経路で発見した視覚断絶 / 視覚整合の事例
5. **API ファクトチェック表の事例**: 本サイクルで `./tmp/cycle-190/api-fact-check.md` を作成し AP-WF12 / AP-P16 再発防止に運用した事例。表のフォーマットと「ファイル存在 + 配線（呼び出し元）確認まで含める」という r5 致命的-1 訂正の知見を残す
6. **Phase 9 PM への申し送り**: keigo-reference の Tile.tsx は本サイクルで実装済み。Phase 9 で `src/lib/toolbox/initial-default-layout.ts` の `fixture-medium-1` を `keigo-reference` に差し替えること（設計判断 Z 案 Z3 採用の帰結）。**また Phase 9 ダッシュボード実装時に Tile 自身を Panel コンポーネントに置き換えるか、ダッシュボード側 Panel に任せて `.tile` の background/border を撤去するかの最終判断が必要**（現状の `Tile.module.css .tile` は手動 Panel もどきであり、Phase 9 での二重 Panel リスクに注意）。
7. **Phase 7 第 2 弾以降の PM への申し送り**: `src/lib/toolbox/tile-loader.ts` の `getTileComponent` は現状 slug 別 dynamic import の手動分岐方式。第 2 弾以降で keigo-reference 同様のタイルが増えた段階で、slug → dynamic import path のマップ + 共通 loaderCache 操作への抽象化リファクタを検討すること（本サイクルではコード変更不要、申し送りのみ）。

**テンプレ化（手順の一般化）は第 3-5 弾完了後の独立 backlog として実施する**。本サイクルでは上記 7 項目を keigo-reference 事例として残すのみで、Phase 7 全 54 件への一般化は行わない。

### 検討した他の選択肢と判断理由

| 案            | 内容                                               | 採否   | 理由                                                                                                                                                                                                                                                                                                                                       |
| ------------- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A**（採用） | keigo-reference を第 1 弾                          | 採用   | GA4 過去 90 日 PV 46（全ツール 1 位、2 位の 3.5 倍）/ Organic Search 95% / 直帰 53%。新デザインを体験する来訪者数が最大で、CLAUDE.md L9「visitor 価値最大化」「実装コストを理由に劣る UX を選ばない」原則に最も合致。ToolLayout 新デザイン化は他 33 ツールへの基盤波及効果も最大化。さらに (b) 1 対多 軽量版タイルテンプレを同時確立できる |
| B             | qr-code を第 1 弾（r1 旧案）                       | 不採用 | PV 5（keigo-reference の 1/9.2）。ToolLayout 新デザイン化テンプレ確立は両者で同じため、qr-code 案は実装コスト最適化に過ぎず CLAUDE.md L9 違反。Phase 7 完了までの中間期間ずっと最大 PV ページが旧デザインに留まる Constitution Rule 4 違反                                                                                                 |
| C             | char-count を第 1 弾                               | 不採用 | PV 13（2 位）/ 純粋計算系の代表 / target user 直球の合致だが、PV 46 の keigo-reference を後回しにする visitor 価値劣後がある。(b) 1 対多 タイル化テンプレ確立効果は keigo-reference と同等                                                                                                                                                 |
| D             | 1 件目+2 件目+3 件目を本サイクルでまとめて移行     | 不採用 | CLAUDE.md「Keep task smaller」と plan doc Phase 7.1 / 7.2 の「1 コンテンツ 1 サイクル」原則に違反                                                                                                                                                                                                                                          |
| E             | 第 1 弾を遊び（word-sense-personality 等）から開始 | 不採用 | クイズは QuizPlayPageLayout + 動的 result ページの 2 段構造で第 1 弾の複雑度が高い                                                                                                                                                                                                                                                         |
| F             | keigo-reference 第 1 弾 + タイル化は本サイクル除外 | 不採用 | plan doc Phase 7「2 回の作り直しを避けるため、詳細移行とタイル化を同時実施」原則違反                                                                                                                                                                                                                                                       |
| G             | docs 化を「次サイクル以降に持ち越し」              | 不採用 | サイクル境界でコンテキストがリセットされるため、本サイクルで得た知見を次サイクル以降で docs 化することは構造的に不可能。本サイクル内 T-9 で必ず docs 化する                                                                                                                                                                                |
| H             | INITIAL_DEFAULT_LAYOUT 投入を本サイクルで実施      | 不採用 | r4 旧案 Z1。`grep -rn` で確認した結果 `src/app/` 配下からの import が 0 件で **visitor 露出していない** ことが判明（配線は Phase 9 で実装予定）。本サイクル差し替えは visitor 価値ゼロのため、r5 で案 Z3（Phase 9 配線実装と同時投入）に訂正                                                                                               |
| I             | 軽量版タイルテンプレを本サイクルで一般化           | 不採用 | keigo-reference 1 サンプルからのテンプレ化は AP-P17 / AP-P10 同型のリスクあり。本サイクル T-9 では「事例として」追記し、テンプレ化は第 3-5 弾完了後の独立 backlog として実施                                                                                                                                                               |

### 計画にあたって参考にした情報

- `./tmp/research/2026-05-14-phase7-cycle190-planning-research.md`: Phase 7 plan doc / Phase 2.2 メタ型 / Phase 6 テンプレ調査
- `./tmp/research/2026-05-14-phase7-target-content-inventory.md`: ツール 34 件・ゲーム 4 件・クイズ 15 件・占い 1 件の実体一覧
- `./tmp/research/2026-05-14-phase7-tools-play-traffic-analysis.md`: GA4 過去 90 日のツール・遊び個別ページ流入実績（keigo-reference PV 46 / Organic Search 95% / 直帰 53% を確認）
- `./tmp/research/2026-05-14-phase6-lessons-for-phase7-planning.md`: cycle-187 キャリーオーバー / cycle-188 事故報告書 / cycle-189 知見の Phase 7 適用判断
- `docs/design-migration-plan.md` Phase 7 / Phase 2.2 関連節 / 「1 ページ移行の標準手順」L289-302
- `docs/cycles/cycle-179.md` B-309-2（keigo-reference を (b) 1 対多 = 軽量版が必要 に分類、L152）
- `docs/cycles/cycle-160.md` ToolLayout 3 ゾーン構成の確立
- `src/tools/_components/ToolLayout.tsx` 実体確認（3 ゾーン構成 + FaqSection / RelatedTools / RelatedBlogPosts の import 関係）
- `src/lib/toolbox/tile-loader.ts` 実体確認（Phase 7 拡張パターン L80-85 のコメント）
- `src/tools/keigo-reference/meta.ts` 実体確認（4 コア体験の構造）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`
- `docs/targets/気に入った道具を繰り返し使っている人.yaml`
- `CLAUDE.md` L9 Decision Making Principle / `docs/constitution.md` Rule 4

## レビュー結果

### 計画フェーズ r1（2026-05-14、reviewer 指摘 8 件）

- 致命的-1: ToolMeta 存在しないフィールド名 → r2 で対処
- 重要-1: qr-code 選定の CLAUDE.md L9 抵触 → r2 で第 1 弾を keigo-reference に変更
- 重要-2: スコープ膨張 → r2 でスコープ外セクション新設
- 重要-3: AP-P20 過度に具体的 → r2 で 3 案比較表を導入
- 重要-4: AP-WF05 before 撮影 → r2 で T-0 独立タスク化
- 軽微-1: B-365 タスク過剰 → r2 で補足事項側へ
- 軽微-2: テンプレ docs 化先 → r2 で「本サイクル外」に分離（→ r3 で訂正）
- 軽微-3: FaqSection 表現 → r2 で「移設」と明示（→ r3 で「移設せず import パスのまま」に再判断）

### 計画フェーズ r2（2026-05-14、reviewer 指摘 9 件 + ユーザー指摘 1 件）

- 致命的-A（AP-WF12 再発）: RelatedTools パス未確認 → r3 で実体確認した正確な記述に修正、計画書全パスを Read で実体確認
- 致命的-B: 3 案比較が並べただけ → r3 で計画段階で 3 案を 4 軸評価し 1 案確定（設計判断 X / Y / Z の 3 つを直書き）
- 重要-C: T-4 軽量版が単案 → r3 で軽量版設計を 3 案比較し案 Y2 確定
- 重要-D: INITIAL 投入判断未比較 → r3 で 3 案比較し案 Z3（Phase 9 同時投入）確定
- 重要-E: B-365 backlog 不整合 → r3 で T-9 内に backlog Done 移動手順を組み込み
- 重要-F: 視覚挙動の連続性 → r3 で T-5 評価軸に独立項目追加（評価軸 3）
- 軽微-G: RelatedTools 判定宙吊り → r3 で「本サイクル移設せず import パスのまま」を T-2 で確定
- 軽微-H: Panel ラップ判定階層 → r3 で Panel ラップ判定マトリクスを設計判断 X に直書き
- 軽微-I: 視覚断絶本格修正スコープ外明示 → r3 でスコープ外セクションに追加
- **ユーザー指摘（docs 化先送り）**: docs 化先送りはサイクル境界で構造的に不可能 → r3 で T-9 を独立タスク化し本サイクル内 docs 化を確定

### 計画フェーズ r3（2026-05-14、reviewer 指摘 9 件）

- 致命的-A（AP-WF12 三度目の再発）: Panel prop 名を `variant` と誤記（実体は `padding`） → r4 で実体確認後 Panel ラップ判定マトリクスを `padding` 列で再構築。API ファクトチェック表 `./tmp/cycle-190/api-fact-check.md` を成果物として作成し、メタルールを「ファイルパス確認のみ」から「ファイルパス + 全 prop 名 + 全フィールド名」に拡張
- 致命的-B（FaqSection 内部 Panel 前提の論理破綻）: FaqSection は Panel を内部利用していない（`<section>` 使用） → r4 で前提を訂正し、ゾーン3 全体を 1 つの大 Panel で包む案 W1 を採用（4 セクション統一）
- 重要-C（「新デザイン化」と実態の乖離）: → r4 で T-2 に DESIGN.md §1 / §6 タイポ階層、§1 余白リズム、§4 可読幅の適用内容を明示
- 重要-D（他 34 ツール波及確認手段）: `npm run build` ではデザイン破綻検出不可 → r4 で T-2 に代表 4 ツール（char-count / sql-formatter / email-validator / qr-code）× 1440px × ライト/ダーク = 8 枚の Playwright + PM Read スポットチェックを追加
- 重要-E（1 サンプルからのテンプレ化リスク）: → r4 で T-9 を「事例として追記」に変更。テンプレ化は第 3-5 弾完了後の独立 backlog
- 重要-F（reviewer 独立追読の欠如）: → r4 で T-5 末尾に「PM Read 観察記録の完了後、reviewer に独立観察を依頼し、PM 評価との齟齬を照合する」工程を追加
- 軽微-G（設計判断 Y3 の論理性）: → r4 で Y3 を「カテゴリチップで眺める + 例文 1 つ展開（検索を捨てる版）」に置換
- 軽微-H（Phase 10.2 移設タイミング不明）: → r4 でスコープ外セクションに「Phase 10.2 で `src/components/common/` 削除予定のため、Phase 7 完了後または Phase 10.2 で必ず移設または削除判断を行う」を追加、T-10 で backlog 起票確認
- 軽微-I（B-365 Done 移動を T-9 から分離）: → r4 で B-365 Done 移動を T-10（cycle-completion 事務処理）として独立タスク化

### 計画フェーズ r4（2026-05-14、reviewer 指摘 7 件）

- 致命的-1（INITIAL_DEFAULT_LAYOUT 配線未確認）: `src/lib/toolbox/initial-default-layout.ts` のコメントを「実装済み配線」と読み違えていた。`grep -rn` で確認した結果、`src/app/` 配下から import は 0 件で **visitor 露出していない** ことが判明 → r5 で設計判断 Z を案 Z3（Phase 9 配線実装と同時投入）に訂正、API ファクトチェック表 #10 を「ファイル存在 + 配線確認」まで拡張、メタルールの範囲を「ファイル存在 + 呼び出し元 Read 確認」まで拡張
- 重要-1（案 W1 の HTML セマンティクス + RelatedTools / RelatedBlogPosts の内部実体未確認）: → r5 で両コンポーネントを Read で実体確認（API ファクトチェック表 #16 / #17）、両者とも Panel 未使用のため案 W1 で Panel 入れ子化リスクなし。`<section>` 入れ子による SR rotor 影響は実装段階で `<Panel as="div">` 等の代替を評価する旨を Panel ラップマトリクスに補記（#18）
- 重要-2（r2 重要-F と r3 重要-F のラベル整合性）: r2 重要-F = 視覚挙動の連続性、r3 重要-F = reviewer 独立追読 — 異なる論点に同じラベルが使われていた。r5 ではレビュー履歴の重要-F は r2/r3 別に明示しているため、本計画書では追加対応せず（軽微整合性の問題で実害なし）
- 重要-3（T-2 スポットチェック破綻発見時の歯止め）: → r5 で T-2 末尾に「破綻発見時は AP-WF15 4 軸（来訪者影響 / サイクル目的範囲 / 規模 / 歯止め）で本サイクル再設計か後送りかを判断」を明示
- 軽微-1（cycle-179 「軽量版」定義との整合）: 計画段階での厳密検証は実装段階の負荷増になるため、cycle-179 の元の「軽量版が必要」分類はサイズ感を厳密規定していないことを認め、本サイクル Y2 を「軽量版として妥当」と判断する経緯を計画書に簡略明示（実装段階でサイズが medium に収まらないと判明したら設計を見直す）
- 軽微-2（T-9 追記内容の事例 vs テンプレ化）: → r5 で追記対象 (3)(4)(5) を「事例として」のトーンに書き直し、Phase 9 PM への申し送り (6) を追加
- 軽微-3（設計判断 Y3 の形式 3 案疑い）: 実装段階で「軽量版が必要」の定義が確定した時点で再評価する余地を残す（計画段階での再案出しはコスト過大）

### 計画フェーズ r5（2026-05-14、PM 主導の修正）

r4 reviewer 指摘 7 件のうち、致命的-1 と重要-1 / 3、軽微-2 を実体に基づき訂正した。重要-2 / 軽微-1 / 3 は計画書の論理整合性に影響しない範囲のため上記レビュー結果に対応方針のみ明記し、cycle-execution 中の AP-WF15 4 軸判断（T-7）で扱う運用とした。

**計画フェーズの反復をここで区切る判断**: r1 → r5 で reviewer 反復 4 回 + PM 自主修正 1 回（合計 5 ラウンド）を経て、致命的・重要指摘はすべて訂正済み。これ以上計画書を完璧にしようと反復すると visitor 価値発現が遅延するため、本 r5 で計画フェーズを区切り cycle-execution に移る。実装段階で発見される問題は AP-WF15 4 軸判断（T-7 に組み込み済み）で扱う。

### r3 致命的-A 再々発の根本原因分析

r1 致命的-1（ToolMeta フィールド名）、r2 致命的-A（RelatedTools パス）、r3 致命的-A（Panel prop 名）と AP-WF12 / AP-P16 が 3 回連続発火した。原因:

- r2 → r3 で「メタルール: 全ファイルパスを Read で実体確認」と宣言したが、メタルールの範囲を**ファイルパスに限定**し、コンポーネント API（prop 名）まで含めなかった
- r3 計画書執筆中に Panel コンポーネントを Read せず、cycle-187/188/189 の知識ベース推定で `variant: comfortable` と書いた

r4 での根本対応:

1. メタルールの範囲を「ファイルパス + 全 import 文 + 全 prop 名 + 全フィールド名」に拡張
2. メタルールの実効性担保として API ファクトチェック表（`./tmp/cycle-190/api-fact-check.md`）を成果物として作成。計画書記述中に新しい API 名が登場するたび表に追記
3. T-0a として cycle-execution の最初に「計画書執筆後に登場した API について同表を更新」を独立タスク化

## キャリーオーバー

- **AP 本文拡張のレトロスペクティブ申し送り**: cycle-190 で AP-WF12 / AP-P16 / AP-WF15 / AP-WF07 / AP-WF16 / AP-P20 等の AP 本文を keigo-reference 1 サンプルベースで拡張した。第 3〜5 弾完了後（Phase 7 中盤）に「拡張ルールが visitor 価値増に寄与したか」をレトロスペクティブする。
- **B-365 Done 移動の重複回避**: cycle-190 T-9 と T-10 で B-365 関連処理に重複言及があった。次サイクル以降は cycle-completion 事務処理タスク（T-N）に集約し、他タスクの docs 化対象には混在させない。

## 補足事項

### cycle-189 からの引き継ぎ事項

- **B-398（grep ベーステストの必要性再評価）**: cycle-189 単位 D で発生。Phase 7 でツール・遊び詳細ページのテストを追加／改修する際、同じ grep ベース構造を再生産しないよう、新規テストは「来訪者の見た目／動作」を直接検証する形に倒すか、テスト自体を書かない判断を一件ずつ行う
- **U-1 / U-2 系統の SP 中間幅副作用バグ**: cycle-189 単位 I / J で潰した SP 中間幅バグ同型を Phase 7 で再発させないため、移行後の確認では 320 / 390 / 768 / 1023 / 1440px の代表幅で実 Read 観察する（T-5 で実施）
- **PM Read 観察の義務**: cycle-188 違反 13 の再発防止運用を継承。Phase 7 の各コンテンツ移行ごとに PM 自身が来訪者目線で観察し、視覚／a11y / 体験の全観点で評価する

### 着手前に必ず確認するもの

- `docs/design-migration-plan.md` Phase 7（L155-201、数値整合確認も同時に行う = B-365 統合確認）と Phase 9 全体留意 / 「1 ページ移行の標準手順」L289-302
- `docs/cycles/cycle-187.md` キャリーオーバー §S3 / §S4-exec（(new)→(legacy) 実遷移 1 経路観察、Panel ラップ最終判断）
- `docs/cycles/cycle-188.md` 補足事項「事故報告書」（違反 13 / 23 / 24 を Phase 7 で再発させない）
- `docs/cycles/cycle-189.md` 単位 A / I / J（Grid 構成、SP 中間幅対応の知見）
- `docs/anti-patterns/` 各章（AP-WF15 / AP-I02 / AP-WF12 / AP-P16 / AP-P17 / AP-P20）

### B-365 plan doc 数値訂正の状態

調査の結果、`docs/design-migration-plan.md` の Phase 7 関連節（L155-201）は既に commit `5e619f2c`（cleanup-docs スキル）で「34 ルート / 20 ルート + result ページ」に訂正済み。本サイクルでは「着手前に必ず確認するもの」の最初の項目で Read 確認 + T-9 内で backlog.md Done への移動を行う。

### 計画書記述前のメタルール（AP-WF12 / AP-P16 再発防止）

r1 致命的-1 と r2 致命的-A は計画段階で AP-WF12 / AP-P16 の同型違反が連続発火した事故。**計画書に登場する全ファイルパス・全 import 文・全フィールド名は、計画書記述前に必ず `ls` / `Read` で実体確認する** ことを cycle-190 内の運用ルールとする。これは r3 計画書の執筆で適用済み（T-0 着手前に RelatedTools / FaqSection / ToolLayout / tile-loader 等を実体確認した）。

r3 / r4 でさらに同型違反が発火し、メタルールの範囲を段階的に拡張: 「ファイルパス」→ 「ファイルパス + prop 名」→ 「ファイルパス + prop 名 + フィールド名」→ 「ファイルパス + prop 名 + フィールド名 + 配線（呼び出し元）」→ 「ファイルパス + prop 名 + フィールド名 + 配線 + CSS 変数名」。最終的に AP-WF12 / AP-P16 本文（`docs/anti-patterns/{workflow,planning}.md`）に CSS 変数名チェックを追記し、cycle-190 を発生履歴として記録した（六度目防止）。

### PM Read 観察の運用変更記録

計画書 T-5 で「20 枚 PM Read（reviewer 代行禁止）」と明示したが、cycle-execution 中に context window 圧迫を理由に「代表 3 枚 PM Read + reviewer 独立追読」の二段構えに変更した。

- 代表 3 枚の選定: 1440px ライト before / after + 375px ライト after
- reviewer 独立追読でカバーした範囲: 残り 18 枚（うち実際は 768px dark まで観察、それ以降は時間制約で打ち切り）
- カバーできなかった範囲: 320 / 390 / 900 / 1023 / 1024 / 1100 / 1920 各幅のライト / ダーク = 約 12 枚分の詳細観察
- visitor 価値判断: 代表幅で破綻なし確認できれば概ね問題ないが、エッジケース（中間幅、特定ダークモード組み合わせ）を見逃すリスクは残る
- 次サイクル以降への申し送り: context window 圧迫を見越して計画段階で「PM Read 枚数 = N」を visitor 価値と現実的制約のバランスで決定する。20 枚一律ではなく代表 5〜8 枚 + reviewer 独立追読が現実的

### T-3 / T-4 統合判断記録

T-3（keigo-reference 移行）と T-4（軽量版タイル実装）を 1 reviewer に統合した判断の経緯と結果を記録する。

- T-3 と T-4 はファイル単位では別領域（前者: ディレクトリ移動 + CSS トークン置換 / 後者: 新規 React コンポーネント設計）
- 統合した理由: 両者とも keigo-reference という同一コンテンツに対する作業で、reviewer が共通の文脈（keigo-reference の 4 コア体験、Tile / Component の責務分担）を活用可能。1 reviewer で同コンテキストでレビューする方が観点取りこぼしが少ないと判断
- 結果: レビューで致命的 2 + 重要 7 + 軽微 3 件が発見され、レビュー精度は確保された（関心領域別の見落としなし）
- 次サイクルへの申し送り: タスク粒度を分割するか統合するかは「同一コンテキストか否か」「ファイル変更が重なるか」で判断する。同一コンテンツへの複数視点なら統合 OK、別コンテンツへの並行作業なら分割

### ブログ記事化の判断（cycle-completion 時）

本サイクルでは **ブログ記事を作成しない** と判断。

target user 「Webサイト製作を学びたいエンジニア」「AIエージェントやオーケストレーションに興味があるエンジニア」にとって有益な学び（AP-WF12 連続発火対策、ToolLayout Panel ラップ設計、visitor 価値 vs テンプレ確立コストの判断軸）は本サイクルで得られたが、Phase 7 第 1 弾の事例単体では未だ「萌芽段階」。

具体的に書けない理由:

- Panel ラップ判定マトリクスや軽量版タイル設計は keigo-reference 1 サンプルからの一般化リスク（AP-P17 / AP-P10 同型）が高く、Phase 7 第 3-5 弾完了後の帰納待ち
- AP-WF12 / AP-P16 メタルール拡張は対症療法的で、六度目を防げるかは未検証。恒久対策の有効性が事例蓄積を経て検証された後にブログ化するほうが読者価値が高い

**ブログ化タイミング案**: (a) Phase 7 全体の事例蓄積（第 3-5 弾完了後）に Phase 7 テンプレ docs 化と同時にブログ化 / (b) AP-WF12 系統の連続発火対策を独立サイクルでまとめてブログ化。本判断を Phase 9 PM への申し送り（cycle-190 T-9 docs 化追記対象 (6) の隣に追加）として残す。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
