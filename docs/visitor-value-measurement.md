# 来訪者価値の継続的計測 / 低トラフィック A/B テスト基盤 設計判断書

> ## 訂正ノート（cycle-268・最優先で読むこと）
>
> 本書の統計的フレーミング（検出力・MDE・各 arm ≥50 セッション・ベイズ優越確率を判定の基礎とする論点3/8.1 等）は、本サイトの規模では**A/B の本質を取り違えている**。低トラフィックでの A/B は、**同時期に来た来訪者へ複数パターンを提示し、その一人ひとりの反応を質的に観察する手段**であって、統計的有意性を得るための手段でも、時間軸上の before/after 比較の代替でもない。
>
> - **時間的 before/after 比較は本サイトでは成立しない**: GA4 実測上、デザイン変更の有無より Google 側のインデックス変更・評価変動による流入変化のほうが支配的で、リリース前後の指標差を design 効果に帰属できない（論点8.6・B-528 の「release別 before/after 回帰確認」という前提自体が誤り＝B-545 で再検討）。
> - **「規模が小さいから前後比較で見るしかない」は逆**。規模が小さいからこそ一人ひとりの行動を丁寧に観る必要があり、A/B（同時期・個人単位の対照観察）がその唯一現実的な手段。統計的検出力やノイズは A/B 却下の理由にならない（§0「トラフィックの小ささは却下理由でなく設計入力」と整合）。
> - **判断基準の確認**: 採否の唯一の基準は「来訪者により高い価値を提供するか」（CLAUDE.md 決定原則・constitution Goal）。実装コスト・統計ノイズ・「現状そうなっているから」は理由にならない（AP-P25/P28/P30/P31）。
> - 論点3/8.1 の統計的判定手順は、この観点で**全面的な再フレーミングが必要**（本ノートは記録であり、本格的な書き直しは別途）。

- 対象: cycle-255 / B-525「来訪者価値を測りながらデザインを変える A/B テスト基盤」
- 種別: 設計判断書（方式比較・推奨・データ契約・運用手順・クエリ設計）。**実装コードは含まない**（実装は後続 builder）。
- 設計担当: アーキテクト（cycle-255）
- 設計日: 2026-06-20
- 一次資料: `docs/research/2026-06-visitor-metrics-baseline.md`（計測在庫・実トラフィック、検証済み）／本書内で参照する全ファイルパス・git コミットは `Read`/`grep`/`git log`/`git show` で実体確認済み。

---

## 0. 前提（確定事項・再議論しない）

- A/B テストを本線として採用することは確定。本書の役割は「この制約下でどう成立させるか」の設計。トラフィックの小ささは A/B 却下理由ではなく**設計の入力**。
- 憲法ルール2／コーディング原則 #2: 外部 API・DB・認証を実装しない。サーバーで個人を追跡しない。**バリアント割当は端末内乱択（localStorage）で完結**。外部 DB を持たない。
- コーディング原則 #1: 静的最優先。SSR/静的配信を壊さない。
- 憲法ルール3（AI 実験であることの開示）はサイト全体で既に充足済み。A/B でも追加開示は不要。

### 検証済みの足場事実（実体確認）

| 事実                                         | 値・所在                                                                                                                | 確認方法                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 全体トラフィック                             | PV 321 / セッション 225 / ユーザー 201（26日＝約8.7セッション/日）                                                      | `docs/research/2026-06-visitor-metrics-baseline.md` B-1 |
| 価値指標4種                                  | 直帰42.7% / 平均エンゲージ119.2秒 / 1.43 PV/セッション / /play着地→次ページ21.1%                                        | 同 A-2                                                  |
| 結果到達の代理                               | `level_end` イベント（インライン結果は別ページ遷移しないため遷移率では測れない）                                        | 同 A-2 注記・B-3                                        |
| release/experiment/variant(A/B用) パラメータ | **存在しない**。`variant` キーは toolbox タイル専用で流用不可                                                           | 同 A-3                                                  |
| GA4 カスタムディメンション                   | **0件登録**（BigQuery 直クエリは未登録でも全 event_params 取得可）                                                      | 同 A-3                                                  |
| GA イベント送出口                            | `src/lib/analytics.ts`（`trackContentStart`→`level_start` / `trackContentEnd`→`level_end`）                             | `Read` 済み                                             |
| GA スクリプト注入                            | `src/components/common/GoogleAnalytics.tsx`（両 layout からマウント）                                                   | `Read` 済み                                             |
| インライン結果の描画                         | `QuizContainer`(client) → `ResultCard`(client) → variant別 `*Content`(client, dynamic import)                           | `Read`/`grep` 済み                                      |
| クイズ結果の現所在                           | **`src/app/(legacy)/play/` 配下**（まだ (new) 未移行）。共通実装は `src/play/quiz/_components/`                         | `grep` 済み                                             |
| prebuild codegen 前例                        | `package.json` の `generate:toolbox-registry`（`scripts/generate-toolbox-registry.ts`）が meta から TS を生成しコミット | `Read` 済み                                             |
| 現在の short SHA 取得                        | `git rev-parse --short HEAD`（例: `226f1957`）動作確認済み                                                              | `Bash` 済み                                             |
| BigQuery 実行形                              | `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"`（SELECT のみ・読取専用）                             | `Read` 済み                                             |

---

## 論点1. バリアント割当・配信機構

### 選択肢

- **(a) クライアント乱択 + コンポーネント/CSS 切替**（localStorage 永続化）。同一 DOM ルート・同一 URL のまま、JS が arm を選んで旧/新コンポーネントを出し分ける。
- **(b) Next.js middleware で乱択 cookie 発行 + rewrite**。2 つの静的バリアントを別パスにビルドし、middleware が cookie に従って rewrite。
- **(c) 折衷**（middleware で arm cookie だけ発行し、描画はクライアント切替）。

### 推奨: **(a) クライアント乱択 + コンポーネント切替（localStorage 永続化）**

ただし最初の実 A/B（インラインクイズ結果）に限れば FOUC は構造的に発生しないため、(a) の弱点が現れない（後述）。

### 理由（来訪者価値・憲法整合）

1. **静的配信を壊さない（原則#1）**: (b) の middleware は Vercel Edge で動的実行となり「同一 HTML を CDN 配信」を崩す。yolos.net は全ページ静的が基本で、A/B のためにエッジ実行を導入するのは原則#1 に反する。(a) はビルド成果物を一切動的化しない。
2. **サーバーで個人を追跡しない（憲法ルール2／原則#2）**: (a) は arm を **localStorage** に保持し端末内で完結。cookie はサーバーへ送られるため、(b)/(c) の arm cookie は「サーバーが arm を見る」状態になり、原則#2 の精神（サーバー側で個人状態を持たない）に最も近いのは (a)。
3. **FOUC が最初の対象では発生しない**: 最初の実 A/B はインラインクイズ結果（論点2/6）。結果は**クイズ回答後にクライアントで初めて描画される**（`QuizContainer` の `result` フェーズ）。初期 HTML には結果 DOM が存在せず、arm を読むタイミング（マウント後）には既に JS 実行済み。よって旧/新の切替に SSR 由来のちらつきは原理的に生じない。これは (a) を選ぶ決定的な後押し。
4. **SEO**: (b) は同一 URL に2種類の本文を出すため重複コンテンツ・canonical・場合により noindex の検討が必要。(a) かつ「インライン結果（クイズ回答後のみ表示・初期 HTML 非含有）」を対象にする限り、**クローラに見える初期 HTML は arm 非依存**で不変。重複コンテンツ問題自体が発生せず canonical/noindex 操作は不要。
5. **a11y**: arm 間で `role`/`aria`/フォーカス順序/タップターゲット 44px/コントラスト 4.5:1 を同等に保つことを設計制約として明記。旧バリアント復活時もこの基準を割らないこと（論点2）。

### 割当アルゴリズム（データ契約）

- キー: `localStorage["yolos-ab"]`。値は JSON `{ "<experiment_id>": "<variant>" }`。実験ごとに独立に arm を保持（複数実験の同時稼働に耐える）。
- 初回: 当該 experiment_id の arm 未設定なら `Math.random() < 0.5 ? "A" : "B"` で乱択して書き込み、以後固定（同一来訪者＝同一 arm）。
- `localStorage` 不可（プライベートモード等）の場合: その場のメモリ arm を使い永続化しない（フォールバックでも体験は壊さない）。計測上はセッション内一貫で十分。
- arm ラベルは中立に **`A`/`B`**（"old"/"new" のような価値含意語を避ける。バイアス防止）。どちらが旧でどちらが新かは GA4 へ送る `variant` 値＋設計書側のマッピング表（論点6）で対応づける。
- **SSR ガード必須**: `localStorage` 参照は `useEffect`/イベントハンドラ内のみ（`typeof window` ガード）。サーバーレンダリング結果を arm に依存させない（原則#1・hydration 不整合回避）。

### 共通ユーティリティの置き場（builder 向け指針・実装は後続）

- `src/lib/ab/` に「arm 取得（SSR セーフ）」「実験定義（experiment_id・variant ラベル・割合）」を集約する小モジュールを置く想定。`src/lib/analytics.ts` と疎結合に保ち、analytics 側は「arm を引数で受け取って GA に載せるだけ」に徹する（関心の分離・原則#3）。

---

## 論点2. retro A/B の構成（旧バリアントの git 復活と並走）

### 剥ぎ落としの特定（実体確認済み）

- cycle-254 がインライン結果から**絵文字マーカー／type-color 装飾／中央寄せ／font-weight 700／旧トークン**を剥ぎ落とした。剥ぎ落としは **2 コミットに分かれている**（`git show --stat 1e31eb1d f448962b` で実ファイル一覧を確認済み。本数を二重計上しないこと）:
  - `1e31eb1d` 「cycle-254: 参照実装 CharacterPersonalityContent を新デザイン言語へ genuine 再設計」… **`CharacterPersonalityContent` 1本のみ**（変更ファイル: `CharacterPersonalityContent.tsx` ＋ `.module.css`）。参照実装として先行。
  - `f448962b` 「cycle-254 完了」… **残り `*Content` 7本＋`OtherTypesNav`** を統一。7本の内訳（実ファイル一覧）: `AnimalPersonalityContent` / `ContrarianFortuneContent` / `ImpossibleAdviceContent` / `MusicPersonalityContent` / `TraditionalColorContent` / `UnexpectedCompatibilityContent` / `YojiPersonalityContent`（各 `.tsx`＋`.module.css`＋テスト）。加えて `OtherTypesNav.{tsx,module.css}`。絵文字（🎭/✨/😅/💡/🎨/🎵/🎤/📖/🔄/💭）と `r.icon` 描画撤去・type-color 全廃・中央寄せ／700／旧トークン全廃。
  - **合計 = 7 + 1 = 専用 `*Content` 8本＋`OtherTypesNav`**。8本目（CharacterPersonality）は `f448962b` ではなく `1e31eb1d` にある。
- **「剥ぎ落とし前（旧バリアント）」の確定リビジョン**: `1e31eb1d^` = **`d804b5d1`**（"cycle-254 開始" コミット、`git rev-parse 1e31eb1d^` で確認済み）。`d804b5d1` 時点の対象 `*Content.tsx` と対応 `*.module.css`、および `OtherTypesNav.{tsx,module.css}` が「絵文字・カラフル・中央寄せ・太字」を持つ旧バリアントの正本。

> builder への一次情報: `git show d804b5d1:src/play/quiz/_components/CharacterPersonalityContent.module.css` 等で旧 CSS を取り出せる。対象集合は上記2コミットの変更ファイル一覧（`*Content` 8本＋`OtherTypesNav`）で裏取り済み。

### 「全クイズ共通スタイルゆえ1 A/B にプールできる」前提の妥当性 → **妥当。採用**

- 剥ぎ落としは**共通のデザイン言語の置換**（絵文字/カラフル/中央寄せ → アクセント縦線・左罫線見出し・左寄せ）であり、個別クイズ固有のロジックではない。`ResultCard` + `*Content` + `OtherTypesNav` という共通描画系に一様に効く。
- したがって「旧デザイン言語 vs 新デザイン言語」を**全クイズのインライン結果に一括適用**し、観測を横断プールして **1つの A/B 実験**として読むのが正しい（論点3の検出力要件とも整合。単一クイズでは量が足りない）。
- 例外: `TraditionalColor` の色見本（`r.color` 色ドット）は cycle-254 でも color-as-content 例外として保持された。旧バリアント復活でも**この例外は arm によらず共通**に保つ（旧/新で機能差を作らない＝公平な比較のため）。
- 例外（追記・cycle-255 波3 builder 知見）: `allTypesLayout`（「他のタイプも見てみよう」の **pill / list** レイアウト差）は cycle-254 で全 variant 縦リスト統一されたため、本実験では **arm 非依存（両 arm 共通で `"list"`）を例外として固定**する。これは独立変数を「絵文字/カラフル vs ミニマル」に集中させ、`pill`（grid 2列）vs `list`（縦列）という layout 差が A/B の効果量を希釈するのを防ぐため。位置づけは `TraditionalColor` の色見本例外と同じ（公平な比較のため arm 間で機能差を作らない）。retro 側の `ContrarianFortuneContent` / `ImpossibleAdviceContent` は当時 (d804b5d1) `"pill"` 単一だったため、`_experiments/legacy-result/` 配下の同 CSS Module に `.allTypesListVertical` クラスを追加し、prop 型を `"pill" | "list"` に広げる最小改修を入れた（独立変数の保護が retro の「完全コピー」原則に優先する場面）。

### 撤去予定コードの一時復活と `design-migration-plan.md` との整合（矛盾しない置き方）

`design-migration-plan.md` は legacy 撤去（Phase 11.2）に向かう方針。旧バリアントの復活は「移行を巻き戻す」ものに見えうるが、以下の置き方で矛盾しない:

- **置き場**: 旧バリアントは「移行前のファイルへ書き戻す」のではなく、**実験専用の隔離ディレクトリ**に retro 版として複製する。例: `src/play/quiz/_components/_experiments/legacy-result/` に旧版を retro として配置（命名で「実験用・一時的」を明示）。現行（新）コードはそのまま正本として維持。
- **複製対象の集合（builder が誤らないよう明示・`git show --stat` で裏取り済み）**: 復元するのは cycle-254 で剥ぎ落とされた **専用 `*Content` 8本**（`CharacterPersonalityContent` / `AnimalPersonalityContent` / `ContrarianFortuneContent` / `ImpossibleAdviceContent` / `MusicPersonalityContent` / `TraditionalColorContent` / `UnexpectedCompatibilityContent` / `YojiPersonalityContent`）の `.tsx`＋`.module.css`、**および `OtherTypesNav.{tsx,module.css}`** のみ。`d804b5d1` 時点の版を retro として取り出す。
  - **復元対象から除外するもの（重要）**:
    - **`ResultNextContent.{tsx,module.css}`**: cycle-254 の2コミット（`1e31eb1d`/`f448962b`）の変更ファイル一覧に含まれない＝**剥ぎ落とし対象外**。旧/新の差分がないので retro 化しても arm 間で同一になるだけ。複製しない。
    - **専用 `*Content` を持たず ResultCard 共通スタイル（`renderStandardContent`）で描画される variant**（後述）: これらは専用コンポーネントの剥ぎ落としを受けていない。旧バリアントの復元対象は「専用 `*Content` を持ち、かつ cycle-254 で剥ぎ落とされた」variant に限る。
- **切替（1か所では済まない・現実的な分岐点）**: `ResultCard.tsx` を Read で確認した実構造に基づく。`renderDetailedContent(content, …)` は **`switch (content.variant)` で 8+ case**（`contrarian-fortune` / `character-fortune` / `animal-personality` / `music-personality` / `traditional-color` / `yoji-personality` / `character-personality` / `unexpected-compatibility` / `impossible-advice`）あり、**case ごとに渡す props が異なる**（`detailedContent`/`accentColor`/`allTypesLayout` 等の組み合わせが variant 別）。さらに:
  - **`renderStandardContent`（標準 variant のインライン描画パス）が別経路として存在**し、ここでも結果本文が描かれる。専用 `*Content` を持つ variant とは別系統。
  - **`OtherTypesNav` は `ResultCard` が直 import する共有部品**で、`renderStandardContent` 内（実コード上の該当箇所）で描画される。これも旧/新を持つため arm 切替の対象。
  - したがって arm 分岐は「util から `arm` を1回引く」だけでは描画に反映されない。現実的には:
    1. retro 用に **旧 `*Content` 8本＋旧 `OtherTypesNav`** を `_experiments/` に置く。
    2. `renderDetailedContent` の **各 case で `arm==="A"` のとき retro コンポーネントを、`"B"` のとき現行コンポーネントを選ぶ**（switch の各 case に分岐が入る＝分岐点は複数）。共通化のため「variant → {retro, current} の対応表」を1テーブルにまとめ、case 側はテーブル参照に寄せると侵襲を抑えられるが、**props 差のため完全な1か所集約は不可**。
    3. `OtherTypesNav` の旧/新切替は ResultCard の import を「arm に応じて retro/current を選ぶ薄いラッパ」に通す（共有部品なので1経路で揃う）。
  - 結論: **実現可能だが「分岐1か所・本体不触」は楽観的**。switch 各 case ＋ `renderStandardContent` 経路＋共有 `OtherTypesNav` の計 3 系統に切替を通す必要がある。`*Content` 本体（新版）は触らずに済むが、`ResultCard.tsx` の描画ディスパッチ部には複数箇所の手当てが要る、と builder へ明記する。
- **整合の論拠**:
  1. **新が正本のまま**: legacy 撤去（route group の `(legacy)→(new)` 移行）と本 retro は**別軸**。design-migration の "legacy/new" は**デザインシステムの新旧**（CLAUDE.md Notes）であり、本 retro は「新デザイン言語の中での旧/新表現」を一時的に並走させるもの。route group には触れない。
  2. **撤去容易性を設計で担保**: retro は `_experiments/` に隔離し、実験終了時に**ディレクトリごと削除＋`ResultCard.tsx` の arm 分岐を撤去すれば原状復帰**できる構造にする（現行 `*Content` 本体は不触、侵襲は `ResultCard.tsx` の描画ディスパッチ部に限定）。これは「一時的フラグ/隔離ディレクトリ」での復活であり、移行計画の完了定義（`(legacy)/` 削除・grep 空）に新たな負債を残さない。
  3. **クイズ結果が現在 `(legacy)/play/` 配下である事実**（grep 確認済み）に留意: builder は retro 実験を入れる際、この共通 `_components` が両 route group 由来のページから使われている前提で、arm 分岐がどちらの経路でも一様に効くことを確認する。
- **実験の寿命と撤去手順を文書に固定**: 論点7のキャリーオーバーで「結果読み取り後に retro を削除」する手順を backlog 化（実験を放置して恒久 legacy 化させない）。

---

## 論点3. 低トラフィックでの統計設計

### (i) プール対象の範囲

- **第一実験のプール**: 全クイズのインライン結果を横断（論点2）。観測単位は「インライン結果を見たセッション」＝`level_end` を発火したセッション。実測で `level_end` セッションは character-personality 30 + word-sense 18 を中心に月数十（`docs/research/2026-06-visitor-metrics-baseline.md` B-3）。**arm はセッション単位**（同一来訪者は同一 arm なので、複数クイズを跨いでも arm 一貫）。
- プールに含めるのは「arm による出し分けが効く全クイズ」。色見本など arm 非依存の例外要素は指標に影響しない。

### (ii) 主要評価指標 — **連続量を主 KPI に。二値は従**

低トラフィックでは比率（直帰・到達率）の検出力が致命的に低い（`docs/research/2026-06-visitor-metrics-baseline.md` B-4: ベースライン50%・MDE 10pt でアーム約400必要 → 単一クイズ月20で約20ヶ月）。連続量の方が検出力が高い。

- **主要 KPI: 結果到達後のエンゲージメント時間**（`engagement_time_msec` をセッション合算）。「結果の質感が滞在・読了に効くか」を直接捉える。連続量ゆえ少 n でも効果量を推定しやすい。
- **副 KPI（連続量）: 結果以降の回遊深さ**（`level_end` 以降の page_view 数 / セッション、または「他のタイプ回遊」`OtherTypesNav` クリック由来の遷移）。
- **従 KPI（二値・参考）: 結果到達率**（`level_start`→`level_end`）・直帰。検出力が出るまで読まない（誤検出注意）。
- **送信系イベント（任意・将来）: `share` / `content_rating`**。発生が極小（`docs/research/2026-06-visitor-metrics-baseline.md`）なので主 KPI にはしない。

### (iii) 評価方法 — **ベイズ（事後分布・確率的優越）を主、逐次/常時観測を運用前提に**

固定 n を前提にしない。**always-on で periodically 読む**設計（B-525 の「継続的計測基盤」要件）。

- **連続量（エンゲージ時間）**: arm 別の平均をベイズ推定（正規近似 or 対数変換後の正規。エンゲージ時間は右に歪むため log 変換を推奨）。`P(平均_B > 平均_A)`（確率的優越）と効果量の事後信用区間を毎回算出。
- **二値（到達率・直帰）**: arm 別に Beta-Binomial 共役事前（弱情報事前 Beta(1,1)）。事後 Beta から `P(rate_B > rate_A)` を算出。
- **早期停止の歯止め**: ベイズでも「覗き見」で誤結論しうる。**判定閾値を事前固定**（例: `P(優越) ≥ 0.95` または `≤ 0.05` で「方向の示唆あり」、それ未満は「保留・継続」）。閾値・最小観測数（例: 各 arm ≥ 50 セッション到達まで結論を出さない）を論点7のキャリーオーバーに明記。頻度論の固定 n p 値での早期停止は採用しない（α 消費の管理が低 n で破綻するため）。
- 集計は**外部ツール不要**: BigQuery で arm 別の合計・件数・平均・分散を出し、ベイズ事後は集計値からスクリプト（`docs/research/` 配下の SQL ＋ 必要なら別途軽量計算）で算出。GA4 UI ではなく BigQuery を SSoT にする（カスタムディメンション登録に依存しない）。

### (iv) 「いつ何が言えるか」（MDE・必要期間の概算）

- 入力（`docs/research/2026-06-visitor-metrics-baseline.md` B-4、外挿）: インライン結果到達セッションは全クイズプールでも概ね**月 40〜50 セッション規模**（character 30 + word-sense 18 が大半、他は一桁）。50/50 で **1 arm あたり月 20〜25 セッション**。
- 連続量（エンゲージ時間）主 KPI の現実的見立て:
  - 大きな効果（例: arm 間で平均が ~0.4σ 以上＝中〜大の効果量）なら、各 arm 数十〜100 セッション規模、すなわち**数ヶ月**で `P(優越) ≥ 0.95` に届きうる。
  - 小さな効果（~0.1σ）は本トラフィックでは**実用的期間内に判定不能**。これは設計の限界として明記し、「効果量の大きい大胆な質感差（旧 絵文字カラフル vs 新 ミニマル＝まさに大きな差）を対象に選ぶ」ことで現実性を確保（論点6と整合）。
- 二値（到達率・直帰）は前述のとおり**年単位**になりうるため主指標にしない。
- 結論: **この基盤は「常時走らせ、月次程度で読み、閾値に達したら判断、達しなければ継続」**という運用。第一実験で「いつ結論が出るか」は効果量次第で、最短で数ヶ月・小効果なら出ない可能性ありと正直に設計に書く。

> **【cycle-272 の前提更新ノート（数値の出所と限界）】** 上記入力（月40〜50セッション）は 2026-06 ベースライン。cycle-272 着手時の実測:
>
> - **直近28日 `level_end` = 132**（28日窓・GA4 property 524708437 を `run_report` で取得・月換算 ≈141）。
> - **7日サンプル（2026-06-20〜26・`tmp/cycle-272-ab-recording.md`）**: 全 level_end = 54、診断対象 = 48 件（88.9%）、うち `experiment_id`/`ab_variant` タグ付き = 38（捕捉率 79.2%）。残り 10 件が cycle-272 T1 で発見した null-arm 漏れ。
>
> 数値の外挿（小サンプル・期間混在を承知の上での粗い見立て）:
>
> - 28日 level_end 132 × 7日サンプルの診断比率 88.9% ≈ **月≈117 が診断対象**（外挿）。
> - cycle-272 T1b の null-arm 漏れ是正後は 79.2%→≈100% 捕捉 ≒ **月≈117 の有効サンプル**（×100/79.2 で月≈148 という見方も可だが、修正効果は来月以降の月次読みで実測してから採用するのが誠実）。
> - 50/50 で 1 arm あたり **月≈58 セッション**。**最小観測ゲート（各 arm ≥50）達成は約4週間（=1ヶ月）見込み**。
>
> 「いつ結論できるか」の数値見立てはここでは出さない。理由: P(優越) ≥ 0.95 までの期間はサンプル数だけで決まらず**真の効果量と分散（log変換後）**に依る（サンプル線形でなく √n に比例）。本書は §3(iv) で「効果量次第・最短数ヶ月・小効果なら不能」と既に正直に書いており、cycle-272 で書き換えるべき本質は**サンプル枯渇という分量の問題が緩んだことのみ**で、効果量・分散の前提は実観測されるまで動かさない。
>
> 申し送り（cycle-271）の「既存A/Bは狭すぎる＝未解決問題」を**全面解消したわけではない**。「狭すぎる」の構造的中身: (1) 検索流入の中心が character-personality 1 本に偏っており全クイズプールでも分母の支配が単一面に依存、(2) 真の効果量と分散が未知（中〜大コントラストの介入だが実値の log-engagement_time での分離は未観測）、(3) 効果量が小さい（≤0.1σ）場合は本トラフィック規模では依然として実用期間内に判定不能、(4) traffic が今後縮小すれば期間は伸びる。
>
> 本ノートで言えるのは、(a) **サンプル枯渇という第一の障害は緩み**、最小観測ゲートへの到達が現実的なスケジュールに入った（上記推定で約4週間・中位推定で traffic 縮小なら下振れ可。**結論到達期間ではなく観測ゲートまでの期間のみ**）、(b) **結論到達期間の見立ては実測の効果量を伴うまで保留**、(c) 月次読み（§8.1）で実値を更新しながら判定する、の3点に留まる。詳細 `docs/cycles/cycle-272.md`。

---

## 論点4. GA4 記録スキーマ

### イベントパラメータ設計

- 新規パラメータ（命名）:
  - `experiment_id`: 実験識別子（例: `"quiz_result_visual_v1"`）。
  - `variant`: arm ラベル。**衝突回避が必須** — 既存 `variant` キーは toolbox タイル専用（`src/lib/analytics.ts` の `buildTileParams`）。同名で意味が二重化するのを避けるため、**A/B 用は `ab_variant` を新設**することを推奨（`variant` は toolbox の意味で温存）。値は `"A"`/`"B"`。
  - `release`: リリース識別子（後述）。全イベントに載せると後付けで「いつ・どのデプロイで効果が変わったか」を BigQuery で切れる。
- **どのイベントに付けるか**:
  - **`ab_variant` / `experiment_id`**: A/B の効果に関わる**主要イベントに限定**して付与する。第一実験では `level_end`（結果到達＝介入が効く地点）に必ず付与・`level_start`（到達率の分母）にも付与し到達率を arm 別に出せるようにする。`analytics.ts` の `trackShare` / `trackContentRating` も同様の optional `ab` 引数を受ける API として実装してあるが、**本サイクル(255)では caller 側（`ShareButtons.tsx` 等）に arm を伝播していない＝意図的に範囲外**。理由は (1) 副イベントの単発発火数は実測で極小（`docs/research/2026-06-visitor-metrics-baseline.md` 参照）で arm 別比較の検出力に寄与しない、(2) 主 KPI は「結果到達後のエンゲージ時間」（連続量・SECTION 3）でありこれは `level_end` 側で完結する、(3) 範囲を絞ることで本実験の最初の運用学習を単純化する、の3点。将来 share/rating を arm 別に見たくなったときに caller 側で `ab` を渡せば即対応可能（analytics.ts 側は実装済み）。全イベント無差別付与はしない（結果を見ていないセッションに arm を載せても主 KPI のノイズになるだけ）。
  - **`release`**: 可能なら**全イベント共通**に付与（リリース横断比較の土台。下記 config 注入が最も低コスト）。
- **送り方**: `gtag('config', GA_ID, { release: '<id>' })` で**全イベントに自動付与**できる（GoogleAnalytics.tsx の config 呼び出し）。`ab_variant`/`experiment_id` はイベント単位なので `src/lib/analytics.ts` の該当 track 関数（`trackContentEnd` 等）が arm を引数で受けて params に載せる。

### GA4 カスタムディメンション登録の要否

- **BigQuery 集計には不要**（`event_params` は未登録でも全取得＝`docs/research/2026-06-visitor-metrics-baseline.md` A-3 で一次確認済み）。本基盤は BigQuery を SSoT にするので**登録は必須ではない**。
- GA4 UI（探索・標準レポート）で arm 別に見たい場合のみ、`experiment_id`/`ab_variant`/`release` をイベントスコープのカスタムディメンションに登録（運用コスト＝GA4 管理画面で各1登録、上限注意）。**推奨: 当面は登録せず BigQuery で読む**。UI で日常監視したくなった時点で登録（後付け可能・過去データにも event_params は残る）。

### `release` 識別子の設計と付与方法

- **値**: `short SHA + ビルド日付`。例 `226f1957-20260620`。日付はデプロイ境界の可読性のため。
- **release の解決はビルド環境非依存にする（重要）**: yolos.net は Vercel 配信想定であり、**ビルド時に `git` が使えない／`.git` が存在しないことがある**（Vercel のビルドコンテナは shallow clone や git 非同梱の構成があり得る）。よって release の決定を `git rev-parse` 単独に依存させてはならない。以下の**優先順位フォールバック**で解決する:
  1. **`process.env.VERCEL_GIT_COMMIT_SHA`**（Vercel が全デプロイで自動注入するシステム環境変数）を最優先で使う。日付は `VERCEL_GIT_COMMIT_DATE`（同・コミット日時）から導出。SHA は先頭7桁に短縮。
  2. 無ければ `git rev-parse --short HEAD`（ローカル `npm run build`/`dev` 等、`.git` がある環境のフォールバック）。
  3. それも無ければ `unknown-<ビルド時刻 ISO 日付>`（最終フォールバック。release が空にならないことを保証）。
- **注入方法（具体的な注入点）**:
  - **prebuild codegen で TS 定数を生成する**。`package.json` の `prebuild`/`predev`/`pretest` は既に `generate:toolbox-registry`（`scripts/generate-toolbox-registry.ts`）と `generate:static-assets`（`scripts/build-search-index.ts`）の codegen を回している。これに倣い `generate:release-id`（仮）を追加し、上記フォールバックで解決した値から `src/lib/generated/release-id.ts`（`export const RELEASE_ID = "..."`）を生成する（生成物はコミット）。
    - 注: 既存の2つの codegen は**いずれも git に依存していない**（`scripts/*.ts` を Read で確認済み。`generate-toolbox-registry.ts` のコメントに "committed to git" の語があるが、生成ロジックは meta.ts 走査でありコマンドとして git を呼ばない）。したがって「既存と同型だから git codegen で確実」という根拠は成り立たない。release codegen は**環境変数優先で git をフォールバックに留める**点が既存とは異なる新規パターンである、と明確に位置づける。
  - 代替: `next.config.ts` の `env` で `NEXT_PUBLIC_RELEASE_ID` を `process.env.VERCEL_GIT_COMMIT_SHA`（無ければ上記フォールバック）から注入（`NEXT_PUBLIC_*` は `GoogleAnalytics.tsx`・`constants.ts` で使用実績あり）。codegen 方式と本質は同じ（どちらも環境変数優先解決）で、生成物をコミットして lint/build を prebuild 非依存にしたいなら codegen、設定の一元性を優先するなら `next.config.ts env`。**どちらでも release の解決ロジック（VERCEL_GIT_COMMIT_SHA 優先）が要件**であり、注入手段は二次的。
  - **付与点**: `GoogleAnalytics.tsx` の `gtag('config', GA_ID, { release: RELEASE_ID })`。これで全イベントに `release` が自動で乗る。`RELEASE_ID` は生成定数 or `process.env.NEXT_PUBLIC_RELEASE_ID` を import/参照。
- **GA4 property annotations 併用（任意・低コスト）**: デプロイ日に手動注釈を入れると BigQuery と突き合わせやすい（`docs/research/2026-06-visitor-metrics-baseline.md` A-4: 現状デプロイ注釈0件・利用可）。必須ではないが「いつ何をデプロイしたか」の人間可読ログとして推奨。

---

## 論点5. 指標定義 SSoT と BigQuery 比較クエリ設計

### 指標定義の SSoT

- **SQL を SSoT にする**（GA4 UI ではなく）。価値指標4種の定義は `docs/research/2026-06-visitor-metrics-baseline.md` の Q-A2 / Q-A2b が既に検証済みの正本。これを**変数化（variant 別・release 別に GROUP BY できる形）**して恒久クエリ群に昇格させる。
- 置き場: **`docs/sql/` 配下に SQL ファイル群**を置く。例: `docs/sql/ab-value-metrics.sql`。analyze-bigquery skill の実行形（`npx tsx .claude/skills/analyze-bigquery/scripts/query.ts --file <path>`・SELECT のみ）に合わせる。`./tmp/` ではなく `docs/` 配下に置くのは「次サイクル以降も periodically 実行する恒久クエリ」だから（一時物ではない）。`docs/research/` には置かない（research は調査結果の保存場所で、恒久クエリ資産は対象外）。

### パラメータ化方針

- 共通 CTE で各セッションに `ab_variant`・`release` を**セッション代表値**として紐付ける（セッション内で最初に観測した arm/release を `ARRAY_AGG(... ORDER BY event_timestamp LIMIT 1)` で代表化。arm はセッション内一貫の設計なので代表化で十分）。
- そのうえで価値指標4種（直帰・平均エンゲージ秒・PV/セッション・/play着地→次ページ）を `GROUP BY ab_variant` と `GROUP BY release` の**両軸**で算出。窓は `_TABLE_SUFFIX BETWEEN <from> AND <to>` をパラメータ化（実行時に置換 or 別 .sql）。

### クエリ構造（設計。実 SQL の骨子）

```sql
-- ab-value-metrics.sql （構造設計。<FROM>/<TO> は実行時に置換）
WITH base AS (
  SELECT
    CONCAT(user_pseudo_id,
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_name, event_timestamp,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS engaged,
    (SELECT ep.value.int_value    FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS eng_ms,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='ab_variant') AS ab_variant,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release') AS release_id
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
),
sess AS (
  SELECT sid,
    -- セッション代表 arm / release（最初に観測した非NULL値）
    (ARRAY_AGG(ab_variant IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)] AS ab_variant,
    (ARRAY_AGG(release_id IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)] AS release_id,
    MAX(engaged) AS engaged,
    COUNTIF(event_name='page_view') AS pv,
    SUM(eng_ms) AS eng_ms,
    COUNTIF(event_name='level_end') AS reached_results
  FROM base GROUP BY sid
)
SELECT
  ab_variant,                          -- ← release_id に差し替えれば release 別
  COUNT(*) AS sessions,
  ROUND(100*COUNTIF(engaged!='1' OR engaged IS NULL)/COUNT(*),1) AS bounce_pct,
  ROUND(AVG(eng_ms)/1000,1)            AS avg_engagement_sec,
  ROUND(AVG(pv),2)                     AS pages_per_session,
  COUNTIF(reached_results>0)           AS sessions_reached_results
FROM sess
WHERE ab_variant IS NOT NULL           -- 実験対象セッションに限定（release 別集計時は外す）
GROUP BY ab_variant ORDER BY ab_variant;
```

- **ベイズ用の素データクエリ**（連続量主 KPI）: 上記 `sess` から `ab_variant` 別に `COUNT`, `AVG(eng_ms)`, `STDDEV(eng_ms)`（または `AVG(LN(eng_ms+1))` と分散）を出すだけ。事後計算（`P(B>A)`）は集計値から別途算出（外部 DB 不要）。
- **release 別クエリ**は同構造で `GROUP BY release_id`（デプロイ前後の指標連続性チェック＝回帰検出）。
- 全クエリ SELECT のみ・読取専用（skill 制約・憲法ルール2整合）。

---

## 論点6. 最初の実 A/B の選定

### 第一候補: **インラインクイズ結果の「旧 絵文字/カラフル/中央寄せ/太字」 vs 「新 ミニマル」（全クイズプール）**

### 妥当性（一次トラフィック表で裏付け・`docs/research/2026-06-visitor-metrics-baseline.md`）

- **トラフィック**: インライン結果到達（`level_end`）はサイト内で最大量の「終点」体験。character-personality（着地37・`level_end` 30）＋ word-sense-personality（着地22・`level_end` 18）が `level_end` セッションのほぼ全量を占め（B-3）、プールで月数十に達する＝**本サイト内で A/B に最も量がある面**。
- **来訪者価値リスク**: 旧バリアントは cycle-253/254 で**意図的に剥がした実コード**を retro 復活させるだけ。新規制作物より公平で、リスクは「旧表現に戻ったセッションの体験」のみ（旧は元々本番で運用されていた品質）。a11y 等価制約（論点1/2）を守れば毀損リスクは限定的。
- **効果量の大きさ**: 絵文字・カラフル・中央寄せ・太字 vs ミニマル左寄せは**質感差が大きい**。論点3(iv) の「大きな効果なら数ヶ月で判定可」に最も合致する対象。小効果しか出ない退屈な A/B を選ぶより、低トラフィック下で唯一現実的に結論が出うる候補。
- **enjoyable の柱（憲法ルール2）**: クイズは enjoyable コンテンツの中核。その終点体験の質感を「測って決める」のは憲法の意思決定原則（実装コストで劣る手段を選ばない／価値最大化）に直結。
- **静的・端末内割当の親和**: 結果は回答後クライアント描画ゆえ FOUC/SEO 問題が原理的に出ない（論点1）。第一実験として技術リスクが最も低い。

### 留意（一次情報補正・`docs/research/2026-06-visitor-metrics-baseline.md` B-2 注記）

- word-sense-personality・yoji-level 等の高流入クイズは**名前付きディレクトリでなく `play/[slug]` 動的ルート**で配信。retro 切替は `ResultCard`/`*Content` 共通描画系に一様に効くので**ルート形態に依存せずプール可能**（論点2の「共通スタイル＝1 A/B」前提と一致）。対象選定はディレクトリ構成でなく実トラフィック表を根拠にすること。

### 実験範囲の明示（介入対象 vs 非対象）

**介入対象（arm に応じて retro/current が出し分けられる）**: `QuizContainer` → `ResultCard` 経由で描画される**インラインクイズ結果**のみ。具体的には専用 `*Content` を持つ personality 系 8 variant の本文と、`OtherTypesNav`（共有部品）、および `renderStandardContent` 経路の共有装飾。

**介入対象外（arm 非依存・常に current 固定）**:

- **静的結果ページ `/play/[slug]/result/[resultId]`（`src/app/(legacy)/play/...`）**: SNS シェア等から直接着地する第三者向け結果ページ。本サイクルでは route group に手出ししない方針（論点2 整合の論拠 #1）であり、ResultCard 経由のインライン結果とは異なる route のため、**arm 解決の介在点（`QuizContainer`/`useAbVariant`）が呼ばれない**。実測流入も全クイズ合計 28日7PV と僅少（`docs/research/2026-06-visitor-metrics-baseline.md`）で、独立 retro を起こす来訪者価値レバレッジが低い。**SQL 集計では `level_end` が発火しないセッション（静的結果着地のみのセッション）は `ab_variant IS NOT NULL` フィルタを通らず混入しない**。
- **knowledge 系クイズの結果ページ**: `quiz.meta.type === "personality"` ゲート（`QuizContainer`）で `ab` 非付与＋`resultVisualArm=null` を渡し常に current 描画（論点4・実装側 BL-1 解消）。
- **ResultNextContent**: cycle-254 で剥ぎ落とし対象外。retro/current 差なし。
- **TraditionalColor の色見本**: arm 非依存で保持（論点2 例外規定）。
- **`allTypesLayout`**: 両 arm `"list"` 固定（論点2 例外規定）。

この範囲分離により、本実験の独立変数は「インラインクイズ結果の絵文字/カラフル/中央寄せ/太字 vs ミニマル左寄せ」のみに絞られる。

---

## 論点7. 本サイクル(255)のスコープ分割

### 本サイクルで最小実装すべき核（仕込み）

1. **割当機構**: `src/lib/ab/`（仮）に SSR セーフな arm 取得＋実験定義（localStorage・`Math.random` 乱択・arm `A`/`B`・experiment_id 別保持）。
2. **記録機構**: `src/lib/analytics.ts` に arm/experiment を載せる経路を追加（`ab_variant`/`experiment_id` を `level_end`／可能なら `level_start` に付与。`variant` は toolbox 用に温存し**衝突回避**）。`gtag('config', …, { release })` 付与。
3. **release 識別子**: `generate:release-id` codegen（`scripts/` + `src/lib/generated/release-id.ts`）を `prebuild`/`predev`/`pretest` に追加。release は **`VERCEL_GIT_COMMIT_SHA` 優先 → `git rev-parse --short HEAD` → `unknown-<日付>`** のフォールバックで解決（論点4 B-1）。`GoogleAnalytics.tsx` の config で全イベントに付与。
4. **比較クエリ**: `docs/sql/ab-value-metrics.sql`（variant 別・release 別、論点5 構造）。analyze-bigquery 実行形で動作確認（SELECT のみ）。
5. **最初の実 A/B の仕込み**: 旧バリアント（専用 `*Content` 8本＋`OtherTypesNav`、`ResultNextContent` は除外）を `d804b5d1` から `src/play/quiz/_components/_experiments/legacy-result/`（仮）へ retro 複製し、`ResultCard.tsx` の描画ディスパッチ（`renderDetailedContent` の各 case ＋ `renderStandardContent` 経路＋共有 `OtherTypesNav`）に arm 切替を通す（**1か所では済まない・論点2 F-3**）。実験 id 確定（例 `quiz_result_visual_v1`）。a11y 等価・色見本例外（`TraditionalColor` の色ドット）の保持を確認。
6. **検証**: 各 track 関数の単体テスト（arm 付与・`variant` 衝突なし）、Playwright で arm=A/B 双方のインライン結果を w360/w1280 light/dark 実機確認（旧/新とも破綻なし・FOUC なし・`level_end` 発火に arm が乗る）。

### キャリーオーバー（必然的に後続）

- **結果の読み取り**: テストは always-on で数ヶ月走る。判定閾値（`P(優越) ≥ 0.95` 等）・最小観測数（各 arm ≥ 50 等）を**事前固定して backlog 化**し、月次程度で periodically 読む。最短数ヶ月・小効果なら結論が出ない可能性も明記。
- **実験終了処理**: 結論後に retro（`_experiments/`）を**ディレクトリごと削除**して原状復帰（論点2の撤去手順）。勝者を恒久採用。
- **第二実験以降のテーマ選定**・GA4 カスタムディメンション登録の要否再評価（UI 監視が必要になったら）。
- **クイズ結果の `(new)` 移行（design-migration Phase 8.2）との順序調整**: 本 retro は route group に触れないが、将来 `(legacy)/play/` 撤去時に retro が残らないよう、実験終了を移行に先行させるか撤去手順を移行計画に同期させる。

---

## 憲法・コーディング原則との整合（要約）

| 原則                                                        | 本設計での担保                                                                                                                                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 憲法 意思決定原則（コストで劣る手段を選ばない）             | 低トラフィックでも A/B を成立させるためプール化・連続量 KPI・ベイズ常時観測という手間の多い設計を採用。最初の対象も「現実的に結論が出る効果量の大きい面」を価値起点で選定。 |
| 憲法ルール2（helpful/enjoyable・クイズ=enjoyable の柱）     | enjoyable の中核であるクイズ結果体験を計測で改善。a11y 等価を arm 間制約に明記し体験を毀損しない。                                                                          |
| 憲法ルール3（AI 実験の開示）                                | サイト全体で開示済み。追加開示不要。                                                                                                                                        |
| コーディング原則#1（静的最優先）                            | 割当はクライアント乱択でビルド成果物を動的化しない。middleware/rewrite を採らない。                                                                                         |
| コーディング原則#2（外部API/DB/認証なし・サーバー追跡なし） | arm は localStorage 端末内完結。外部 DB なし。集計は既存 GA4→BigQuery の読取のみ。                                                                                          |
| コーディング原則#3（関心の分離）                            | 割当 util（`src/lib/ab/`）／記録（analytics.ts）／release 生成（codegen）／集計（SQL）を疎結合に分離。                                                                      |
| design-migration-plan 整合                                  | retro は `_experiments/` 隔離・終了時にディレクトリ削除＋`ResultCard.tsx` の arm 分岐撤去で原状復帰（現行 `*Content` 本体は不触）。route group（legacy/new）に非侵襲。      |

---

## 論点8. 運用接続（基盤を「継続的計測」の実体にする）

本基盤は cycle-255 で組み終わるが、**実体は本サイクル以降の運用**にある。基盤を一度作って放置すれば、結果は誰にも読まれず、次の変更は再びブラインドで切り替わる。それを避けるため、運用手順を以下に固定する。

### 8.1 毎月の読み方（A/B always-on 観測）

実験は出してから走り続けるので、判定閾値に達するまで読み続ける。

- **タイミング**: 月次（毎月1回・サイクル開始時に直近28日窓で実行）。`docs/sql/ab-value-metrics.sql` を `_TABLE_SUFFIX BETWEEN '<from>' AND '<to>'` をデプロイ後の累積窓に置換して実行。
- **判定閾値（事前固定・サイクル中に動かさない）**:
  - **最小観測数**: 各 arm が `level_end` セッション ≥ 50（合計 ≥ 100）に達するまで結論は出さない。それ未満は「保留・継続」。
  - **連続量主 KPI（結果到達後のエンゲージ時間 / log変換）**: `P(平均_B > 平均_A) ≥ 0.95` または `≤ 0.05` で「方向の示唆あり」。SECTION 3 のベイズ計算手順に従う。
  - **副 KPI（回遊・到達率）**: 主 KPI の方向と整合するときに「補強」として扱い、主 KPI 単独では結論を出さない（multiple testing による誤検出防止）。
- **読みの記録**: 各回の集計結果（n_A/n_B・mean_A/mean_B・P(B>A)・継続/終了判定）を該当サイクルドキュメントに3行で残す（恒久クエリは SQL 側 SSoT・読みは cycle-doc）。
- **結論時**: 勝者を恒久採用 → 撤去手順（後述 8.4）へ。
- **引き分け時の決定規則（cycle-272 改訂）**: 数ヶ月走らせて閾値（P(B>A) ≥ 0.95 または ≤ 0.05）に到達せず差も縮小した場合、効果量の小ささを正本に記録した上で、以下の順で決める。
  1. **来訪者価値の根拠を独立に積み上げる**: 主 KPI が区別できない＝両 arm が来訪者の体感価値で甲乙つけ難い、という事実から出発する。両 arm の体験を実機で並べて、可読性・操作性・a11y・情報階層・enjoyable／helpful の各軸で個別に指差せる根拠（指標化できない質も含む）を独立に積む。
  2. **両方が来訪者価値で同等のままなら**、サイト全体の利益（保守性・将来の追加検証可能性・撤去コスト）を根拠に決める。
  3. **ブラインドの既定（「新デザインに倒す」「移行計画の方向だから」）は採用しない**。これは申し送り（cycle-271 点2）「未検証を検証済みとして扱うな」に直接対応する是正であり、4 度の失敗（268〜271）が共有した「未検証の方向を既定にして問いを回避する」構造を基盤の運用ルールから取り除く。
- **有界実験の3条件（cycle-272 で明文化・disguised hold でないことの担保）**: cycle-270 申し送り点0 が定義した「結論ゲートが無い・半数に既知の劣る arm を無期限に配る A/B はラベルを変えた保留」を避けるため、`quiz_result_visual_v1` を始めとする本基盤の各実験は、走り始める前に以下3条件をすべて満たしていることを確認する（quiz_result_visual_v1 は確認済み・cycle-272）:
  - (a) **結論ゲートがある**: 上記「判定閾値」（最小観測数 + ベイズ確率閾値）と、上記「引き分け時の決定規則」。
  - (b) **真の不確実性がある**: いずれの arm が来訪者価値で優れるかをデザイン判断のみで決めきれない。
  - (c) **いずれの arm も既知劣位ではない**: 判断で「片方は明らかに劣る」と確信できる場合は A/B にせず勝ち arm を全員配信する。`quiz_result_visual_v1` では retro / minimal いずれの優位も判断で先取りしないことが実験の前提（申し送り点2／4）。

### 8.2 残る B-522 移行の A/B 適用判断基準

cycle-254 時点で残っていた B-522 傘下のタスクへの A/B 適用是非。**ブラインド全面移行は採らない**ことを既定とし、各タスクで A/B するか否かを以下の基準で判断する（基準は工数でなく来訪者価値）。

| タスク                                                           | A/B 適用判断                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B-523**（静的結果ページ枠 `ResultPageShell` の新デザイン移行） | 適用可否要検討。静的結果ページの実測流入は 28日7PV と僅少だが、enjoyable の柱への変更点として「中央寄せ → 左寄せ」が含まれるなら適用。検出力が出ないことが見えていたら「期間延長」または「インライン結果と同一の `experiment_id` の傘下に乗せて結合観測」（同一独立変数のため）を検討。 |
| **ゲーム4種・daily の (new)/ 移行**                              | enjoyable の柱への変更が含まれるなら A/B 必須。視覚差分のないトークン置換のみで終わる移行なら不要（変更そのものが介入になっていない）。ゲームごとに判断。`RelatedGames` 等の絵文字除去は本サイクルと同質の介入なので、可能なら同 experiment にプールするか別 experiment で併走する。    |
| **タイル化（B-295 / B-493）**                                    | タイル化は機能変更を伴うため、視覚 A/B でなく**機能 A/B**（タイル経由 vs 個別ページ）として設計。設計時に本基盤の `useAbVariant` を再利用可能（`experiment_id` を別名で）。検出力が出にくいので最初の対象は流入の大きいツールに絞る。                                                   |
| **過渡的トークン定義の撤去（Phase 11.2/11.5）**                  | A/B 不能（来訪者から見える差分が無い）。本基盤の **release 識別子による before/after コホート比較**（補完経路）で回帰検出。`docs/sql/ab-value-metrics.sql` の SECTION 2（release 別）を撤去前後 N 日窓で実行し、価値指標4種の連続性を確認。                                             |
| **legacy 撤去（Phase 11）**                                      | 同上（A/B 不能・release 別で回帰検出）。撤去サイクル前後の release 切替点を `docs/sql/ab-value-metrics.sql` SECTION 2 で観測。                                                                                                                                                          |

> **【cycle-271 の訂正ノートは撤回（4度目の失敗）】** ここに cycle-271 が「ゲーム移行の検証方法は決着＝デザイン判断＋全員配信／新デザインは検証済み／A/Bは真の不確実性のみ」と書いた訂正ノートがあったが、**撤回する**。それは Goal 由来の問い「どんなデザインが来訪者に最高の価値を提供するか」から目を逸らし、未検証のデザイン方向（austereは検証された土台ではなくツギハギのパッチ）を、最も易しい一例（実ユーザー2人・機能色が支配する nakamawake）で「検証済み」と偽ったものだった。詳細は `docs/cycles/cycle-271.md`「## 自己点検（4度目の失敗）」。上表の旧「ゲーム4種・daily: A/B 必須」も含め、**移行の検証方法は決着していない**。確かなのは、新デザイン方向の適合性こそが最大の「真の不確実性」であり（特に実トラフィックの中心＝診断面はブラインド移行のまま）、それを検証から免除してはならないこと。既存の診断A/B `quiz_result_visual_v1` は範囲が狭すぎて結論に達しない（過去3PMが一致して予測）＝対処すべき未解決の問題であって「正当なA/Bの実例」ではない。B-545 は未了として再オープン。

### 8.3 既移行高リスク面の retro A/B 判断基準

最初の retro A/B（インラインクイズ結果）の結果が出るまでは、追加の retro A/B は走らせない（基盤の経験を1つ積んでから次へ）。最初の結論が出た後、以下の優先順位で次の候補を検討する。

| 候補                                          | 来訪者価値リスク                                 | トラフィック       | 判断                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **静的結果ページの中央寄せ廃止**（cycle-253） | enjoyable の柱の質感差・中程度                   | 7PV/28日と僅少     | 7PV では検出力ゼロ。インライン結果実験と同じ独立変数なので、結果が出れば static 側にも適用可と判断（個別 retro は不要）。引き分け時は §8.1 の3段階決定規則を経由（「ミニマル既定で温存」は採用しない・cycle-272 是正）                                                                                                                   |
| **ゲーム/daily の絵文字除去**（同質の介入）   | enjoyable の柱の質感差・中-大                    | 月数十〜（要実測） | インライン結果の結論が「絵文字あり優位」なら retro 復活を検討。「ミニマル優位」の場合のみ復活不要。**引き分けの場合は §8.1 の3段階決定規則（来訪者価値の根拠を独立に積み上げる→サイト全体の利益→ブラインド既定は採用しない）を経由**（cycle-272 是正・旧記述「差なしなら復活不要」はミニマル方向のブラインド既定温存に該当するため撤回） |
| **道具系ツールの簡素化**                      | 来訪者価値リスクが低い（簡素化は実用層の道具UI） | 中程度             | 来訪者価値リスクが低く retro 対象外（既定）。具体的な懸念データが出てきた時点で個別判断                                                                                                                                                                                                                                                  |

判断は実測リスク×トラフィック×インライン結果の retro A/B の学びで行う。**工数を理由に却下しない**（憲法の意思決定原則）。**いずれの候補も、引き分け時の決定は §8.1 改訂規則を経由し、「現行のミニマル方向を既定で温存」は採用しない**（cycle-272 全体での是正）。

> **【cycle-271 の訂正ノートは撤回（4度目の失敗）】** ここに cycle-271 が追記した訂正（ゲームの絵文字除去はデザイン判断＋全員配信で決める）は、§8.2 の撤回ノートのとおり**撤回する**。新デザイン方向そのものが未検証である以上、「面ごとのデザイン判断で最高を決め全員に届ける」は核心の価値の問いを回避する装置になっていた。詳細 `docs/cycles/cycle-271.md`「## 自己点検（4度目の失敗）」。

### 8.4 実験終了時の撤去手順（二段網羅・原状復帰）

撤去対象は **(a) `_experiments/legacy-result/` ディレクトリ配下の全ファイル**（retro バリアントの本体・テスト・モジュール CSS）と **(b) 既存コードに混入した実験フック**（`QuizContainer`・`ResultCard` の arm 分岐／`useAbVariant`／retro dynamic import／GA への `ab` 引数渡し）の2系統に分かれる。前者はディレクトリ削除で一括撤去、後者は `EXPERIMENT: quiz_result_visual_v1` マーカー（既存コード側に集中して付与・現状 28 マーカー / 9 ファイル）の grep で撤去箇所を列挙する。`_experiments/` 配下の全ファイルにマーカーは付けていない（マーカーで網羅するのでなく**ディレクトリ削除で一括処理する**設計）。

実験 `quiz_result_visual_v1` 終了時：

1. **勝者の確定**: 8.1 の判定閾値に従い勝者を確定。
2. **既存コード側の撤去対象を列挙**: `grep -rn "EXPERIMENT: quiz_result_visual_v1" src/` で全マーカーを列挙（現状 28 件・**9 ファイル = 既存コード側 3 + retro 側 6**：（既存）`QuizContainer.tsx` / `ResultCard.tsx` / `_components/__tests__/QuizContainer.test.tsx` ＋（retro 側で arm 分岐を持つ実装）`_experiments/legacy-result/{CharacterPersonality,ContrarianFortune,ImpossibleAdvice,MusicPersonality}Content.tsx` / `OtherTypesNavAb.tsx` / `__tests__/OtherTypesNavAb.test.tsx`）。各マーカー箇所のコメントブロック・arm 分岐・retro import・`ab` 引数・`resultVisualArm` prop を削除し、勝者側のロジックだけ残す。
3. **`_experiments/` ディレクトリ削除**: `rm -rf src/play/quiz/_components/_experiments/legacy-result/` で retro バリアント本体・テスト・モジュール CSS を一括削除（マーカー有無に関わらず全ファイル）。負け側＝retro 採用となった場合は、勝った retro 版を `_components/` 直下へ昇格させてから残りを削除する。
4. **実験定義の撤去**: `src/lib/ab/experiments.ts` から `QUIZ_RESULT_VISUAL_V1` を削除。`QuizContainer` から `useAbVariant`/`AbEventContext` 関連を削除。
5. **SQL は維持**: `docs/sql/ab-value-metrics.sql` は次の実験でも使うので残す。`ab_variant IS NOT NULL` 行のコメントを新実験用に更新するだけ。
6. **完了確認（二段の独立検証）**:
   - (a) `grep -rn "EXPERIMENT: quiz_result_visual_v1" src/` が **0 件**（既存コード側のフック撤去確認）
   - (b) `find src/play/quiz/_components/_experiments -type f` が **0 件**もしくはディレクトリ不在（retro 本体撤去確認）
   - (c) `grep -rn "_experiments/legacy-result" src/` が 0 件（残存 import なし）
   - 全テスト green / `npm run build` 完走

撤去サイクル後の cycle-doc に判定結果（勝者・P(B>A)・採用根拠）を3-5行で記録する。

### 8.5 design-migration-plan との順序

本 retro は `(legacy)/play/` route group には触れないが、将来の Phase 11.2（legacy 撤去）時に retro が `_experiments/` に残ったままだと撤去計画にノイズが入る。**実験終了を Phase 11.2 着手より前に完了**することを移行計画側の依存として記録する。Phase 11.2 着手 PM は本書を読み、実験が走っているなら結論を待つか撤去手順を移行に同期させる（PM 判断）。

### 8.6 計測基盤の自己適用（メタ確認）

本基盤の `release` 識別子は全イベントに乗るので、本サイクル(255)のデプロイ自体が release 切替点として観測可能。デプロイ後7-14日で SECTION 2 を実行し、価値指標4種が**基盤導入前と連続している**ことを確認する（基盤導入によるパフォーマンス回帰・JS バンドル肥大化による直帰増等の検出）。これが「計測基盤を計測基盤自身で検証する」最初の応用。
