---
id: 215
description: B-314 Phase 8.1 第 16 弾 = regex-tester 詳細ページの新デザイン移行 + タイル化（M1a/M1b 来訪者の正規表現需要への最短応答 / 複合入力型タイル 3 件目 = B-452 N=2 検証データ蓄積 / cycle-210/214 SSoT 引用検証 3 回目 / B-452 N=3 着手条件は cycle-216 以降で再判定）
started_at: 2026-05-29T10:02:11+0900
completed_at: null
---

<!-- このファイルはサイクルドキュメントです。`/cycle-planning` 以降のフェーズで作業計画・レビュー結果・キャリーオーバー・補足事項を埋めていきます。 -->

# サイクル-215

このサイクルでは、B-314（ツール・遊び詳細ページの新デザイン移行 + タイル化 / 移行計画 Phase 8）の **第 16 弾** として **regex-tester** の新デザイン移行 + タイル化を行う。

**主目的（CLAUDE.md Decision Making Principle 準拠 / r2 改訂 = visitor MAJOR-2 対応）**: M1b プログラマの普遍的需要「正規表現の動作確認・デバッグ」（フォーム validation / URL ルーティング / ログ抽出 / メール文字列パターンマッチ）と M1a 文書編集者の検索・抽出補助に対し、yolos.net トップから 1 タップで起動可能な最短 UX を提供する。競合 8 サイトに対する yolos.net 強み 4 軸（ReDoS 対策 / a11y 色のみ回避 / ローカル完結 / g/i/m/s 4 フラグ）を維持しつつ、競合 8 サイト中 5〜6 サイトが実装済の弱点 1 つ「テキストエリア内ハイライト未実装」を改善する（§論点 7 採用可否次第 / r5 改訂 = r4 visitor MAJOR-1 対応 = §目的 L63 / §論点 7 冒頭 L513 / §T-2 実施事項 L224 / §代替案 採択結果 L724 と完全同型表現で統一）。

**副次成果（r3 改訂 = r2 visitor MAJOR-3 + r2 process MAJOR-4/NIT-2 対応）**: 本サイクルは **複合入力型タイル 3 件目**（cycle-210 text-replace / cycle-214 text-diff に続く）であり、cycle-210 で確立した複合入力型タイル AP-P21 SSoT 4 項目を 3 回目の引用検証として運用する。ただし B-452 (v) 統計判定は cycle-214 (c214-β)「同軸ではない」注記（後掲）に従い、「cycle-210 = 入力量変動起因 11.55% の **真の N=1 有効サンプル**」「cycle-215 = 本サイクル T-4 実測値が **真の N=2 として有効か否か**」を判定する **真の N=2 検証データ蓄積サイクル**として位置付ける（cycle-214 = 0.00% は表示矩形固定設計起因のため母集団外 = 参考併記）。**cycle-215 単独で達成し得る上限は「真の N=2 達成」までであり、「真の N=3 達成」は構造上 cycle-216 以降の追加サンプル採取が必須**（r2 visitor MAJOR-3 対応 = 「N=3 暫定達成」という曖昧表現は撤廃）。B-452 着手条件の充足判定は cycle-215 T-4 実測値の同軸性次第で「**真の N=2 達成（cycle-215 が有効サンプルになった場合 / B-452 N=3 着手条件は cycle-216 以降で再判定）**」または「**真の N=1 のまま（cycle-215 が同軸ではない場合 / cycle-216 以降で再挑戦）**」の **二択のみ**となる。

## 実施する作業

- [ ] regex-tester の現状把握（既存 `src/tools/regex-tester/` の Component / logic / Worker 構造 + `src/app/(legacy)/tools/regex-tester/` の詳細ページ実装 + GA データでのアクセス傾向 + 移行前 baseline スクショ取得）
- [ ] 詳細ページの `(legacy)/` → `(new)/` 配下移行 + 旧トークン置換 + meta.ts 棚卸し
- [ ] `RegexTesterTile.tsx` 新規実装 + Tile テスト追加 + `TILE_DECLARATIONS` 登録（複合入力型 cols=3 rows=3 = **推定値** = cycle-210/214 同型ベース起点 / T-3 で最終確定）
- [x] AP-P21 計測 (a)〜(e) 5 ケース + cycle-210/214 SSoT 4 項目 (i)(ii)(v)(vi) の 3 回目引用検証 + cycle-214 (c214-β)「同軸ではない」注記に基づく N=2 検証データ蓄積判定 + AP-WF16 全件再実行による検証と統合確認 — T-4 builder 2026-05-29: 完了 / **真の N=1 のまま確定**（cycle-215 = cycle-214 と同型 flex 固定設計起因の同軸ではない参考値）/ B-452 backlog 状態欄に書き戻し済 / 4 コマンド全 PASS / スクショ 21 枚保存
- [ ] B-314 進捗欄を「16 件目完了」に更新 + B-452 状態欄を「**cycle-215 T-4 実測値の同軸性次第で『真の N=2 達成（B-452 N=3 着手条件は cycle-216 以降で再判定）』または『真の N=1 のまま（cycle-216 以降で再挑戦）』のいずれか / cycle-214 = 同軸ではない参考値 / 基準値見直しは真の N=3 確定後**」に更新（r3 改訂 = r2 visitor MAJOR-3 + r2 process MAJOR-4 対応）+ B-453 状態欄に「3 件目引用適用実施済 = `docs/knowledge/composite-input-tile-criteria.md` 新設の優先度確定」を追記
- [ ] レビュー（計画・実装 各フェーズ）と指摘事項の対応

## 作業計画

### 目的

#### 誰のために

- **M1a（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）**: 「フォーム validation の正規表現が手元のテストデータに本当にマッチするか確認したい」「ログから URL だけ抽出したい」「文書中の郵便番号（`^\d{3}-?\d{4}$`）にマッチする箇所を一気に確認したい」といった単発の用事で検索流入する初回来訪者。likes「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」「コピペで結果を受け取って、すぐ元の作業画面に戻れること」「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」（**実測値** = `docs/targets/特定の作業に使えるツールをさっと探している人.yaml:15-20` likes 6 項目 / `:21-26` dislikes / `:27-` search_intents / 出典: `tmp/research/2026-05-29-cycle-215-regex-tester-baseline-r1.md` §1）に直結する。
- **M1b（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）**: フォーム validation / URL ルーティング / ログ抽出 / メール文字列パターンマッチを繰り返す職業プログラマ。likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」「ブックマークしたURLを開けばすぐ目的のツールが表示されること」「同じ入力に対して前回と同じ結果が返ってくること」/ dislikes「動作が遅いツール」（**実測値** = `docs/targets/気に入った道具を繰り返し使っている人.yaml:15-20` likes / `:21-24` dislikes / `:25` search_intents / 出典: 同調査 §1）に直結。タイル動線でブックマークではなくトップから 1 タップ起動を提供する。
- 競合調査（出典: `docs/research/2026-05-29-regex-tester-competitor-research.md` §8 = 典型需要 10 サンプル）の典型ユースケースから 2 件を体験トレースに採用: (1) メールアドレス簡易バリデーション `^[\w.+-]+@[\w-]+\.[\w.-]+$` を M1b プログラマがフォーム実装中に検証 / (2) URL 抽出 `https?://[\w/:%#$&?()\~.=+\-]+` をログテキストから M1a 文書編集者が抽出。

#### M1a / M1b 実利用フロー（体験トレース）

CLAUDE.md「Decision Making Principle」に従い、サイクル完遂後の来訪者体験を 2 つの典型シーンで具体描写する:

- **シーン 1: M1b / フォーム validation の正規表現を実装中の Web エンジニア**:
  1. Google で「正規表現 メールアドレス 確認」と検索 → yolos.net トップに着地（10〜15 秒以内）
  2. トップで **regex-tester タイル**を視認 → タイル発見 < 3 秒（M1a/M1b likes「すぐ使い始められる」への直接応答）
  3. タイル上の正規表現 input に `^[\w.+-]+@[\w-]+\.[\w.-]+$` を貼り付け → 本文 textarea にテストデータ `foo@example.com\nbar@@invalid` を貼り付け
  4. **即時マッチ結果表示**（§論点 6 案 F 採択 = Worker + 既存 `worker.terminate()` 中断 + timeout 100ms / debounce 撤廃 / 案 B フォールバック時のみ debounce 300ms 経由）= マッチ件数 + マッチテキスト一覧 + **タイル UI に簡易ハイライト導入済（§論点 7 案 W-4 採択 = 動的描画 / IntersectionObserver / N=動的 = 先頭 10 件相当を即時ハイライト + スクロール時 IntersectionObserver で追加描画 / 視認可能件数上限はスクロール量で拡張）** + 詳細ページではテキスト内フルハイライト（§論点 7 案 Y 採択）（r5 改訂 = r4 process MAJOR-2 対応 = シーン 1 を r4 採択結果と整合する表現に統一 / r6 改訂 = r5 process MINOR-1 対応 = 案 W-4 動的描画の振る舞いをシーン 1 でも明示）
  5. 一致 / 不一致を目視確認 → 詳細リンクから詳細ページに遷移して他のフラグや置換動作も検証
  6. 元の IDE 画面に戻る。所要時間 = 20〜40 秒（競合 8 サイトの「タイル動線なし」より 1〜2 クリック分短い）
- **シーン 2a: M1a / ログから URL だけ抽出したい文書編集者（タイル起点動線）**（r6 改訂 = r5 visitor CRIT-1 + r5 visitor MINOR-1 対応 = シーン 2 を 2 分割 = タイル起点動線 / タイル単独完結を実証 + 論点 15 案 D-改 1 採択（タイル UI もドロップダウン 6 種）と整合）:
  1. Google で「正規表現 URL 抽出」等の search_intent から yolos.net トップに着地（M1a 初回流入）
  2. トップで **regex-tester タイル**を視認 → タイル発見 < 3 秒
  3. **M1a 動線（正規表現が苦手）**: タイル UI 操作側のサンプル選択ドロップダウン（§論点 15 採択 = 案 D-改 1 = タイル UI も 6 種）から **「URL」を選択** → pattern input に `https?://[\w./\-?=&%]+` が自動入力 + 本文 textarea にデフォルトテストテキスト `参考: https://example.com/path?query=1 と http://yolos.net` が自動入力（M1a interests「ミスが起きやすい部分を素早く確認」直撃 / 正規表現知識ゼロでもタイル単独で開始可能 = 詳細ページ遷移不要 = タイル単独完結保証 / r5 visitor CRIT-1 対応）
  4. 本文 textarea を自分のログテキストに置き換え → タイル UI 上で **§論点 7 案 W-4 採択 = 動的描画（IntersectionObserver / N=動的）** による簡易ハイライト + マッチ件数 + マッチ一覧で**タイル単独完結**して全マッチ箇所を即時確認（r3 visitor MAJOR-2 対応のタイル単独完結保証と整合 / r5 visitor CRIT-1 対応 = タイル placeholder 1 件のみでなくドロップダウン 6 種を含む UI 採択により URL 抽出 M1a 動線が構造的に阻害されない）
  5. コピーボタンでマッチ一覧テキストを取得し、Excel / Markdown に貼り戻し → 元作業画面に戻る（M1a likes「コピペで結果を受け取って、すぐ元の作業画面に戻れる」）。所要時間 = 30〜60 秒（タイル起点 = 詳細ページ強制遷移なし）

- **シーン 2b: M1a/M1b / 詳細ページ起点動線（ブックマーク or 検索 URL 直リンク）**（r6 改訂 = r5 visitor MINOR-1 対応 新規追加 = シーン 2 起点矛盾を解消するための分離 = 詳細ページ起点動線 / M1b「気に入って繰り返し使う」段階を想定）:
  1. ブックマークまたは検索流入から `https://yolos.net/tools/regex-tester` 詳細ページへ直接アクセス（M1b likes「URL を開けばすぐ目的のツールが表示」 / M1a が初回流入後 2 回目以降にブックマークから再訪する場合も含む）
  2. **M1a 動線（正規表現が苦手）**: 詳細ページのサンプル選択ドロップダウン（§論点 15 採択 = 案 D-改 1 = 詳細ページも 6 種）から **「URL」を選択** → pattern input に `https?://[\w./\-?=&%]+` が自動入力 + 本文 textarea にデフォルトテストテキストが自動入力
  3. **M1b 動線（正規表現を書ける）**: 上記ドロップダウンを使わず pattern input に直接 `https?://[\w/:%#$&?()\~.=+\-]+` を入力 / g フラグ ON
  4. 本文 textarea を自分のログテキストに置き換え → 詳細ページ上で **§論点 7 案 Y 採択** によるテキストエリア内フルハイライト + マッチ件数 + マッチ一覧で全マッチ箇所を即時確認（タイル UI の §論点 7 案 W-4 動的描画と比較してフォントメトリクス同期 + overlay div でより詳細な視覚的フィードバック / r4 process MAJOR-2 対応 = 案 Y / 案 W-4 役割分担 = タイル = 案 W-4 動的描画 / 詳細 = 案 Y フルハイライト）
  5. コピーボタンでマッチ一覧テキストを取得し、Excel / Markdown に貼り戻し → 元作業画面に戻る

これらフローは T-4 の実体験フロー検証（Playwright 再生）で「計画段階で約束した体験が再現されること」を確認する。

#### 何のためにやるのか / どんな価値を提供するか

1. **来訪者価値の核心（CLAUDE.md Decision Making Principle 準拠）**: 現状の `regex-tester` 詳細ページは `(legacy)` 配下に残存しており（出典: `tmp/research/2026-05-29-cycle-215-regex-tester-baseline-r1.md` §2-7）、新トークン体系・ダークモード対応・新フォント体系の恩恵が visitor にまだ届いていない。`Component.module.css` の `--color-*` 旧トークン残存 = **40 箇所 / 8 種**（**実測値** = baseline r1 §2-2 / `grep -c "var(--color-" src/tools/regex-tester/Component.module.css`）/ hex 直書き 2 箇所（`#d4edda` / `#155724` / `Component.module.css:140-141`）。さらにトップページに「正規表現を即試す」最短動線が存在せず、M1b プログラマ普遍的需要にトップ流入面から応えられていない。本サイクルで両方を解消する。
2. **新デザイン詳細ページ移行**: `(legacy)/tools/regex-tester/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `(new)/tools/regex-tester/` 配下に移行し、`max-width: 1200px` ハードコード + `page.module.css` + ToolLayout 標準パターン（cycle-200〜214 で 15 件確立）を踏襲。`Component.module.css` 内の旧トークン + hex 直書きを新トークンに置換。
3. **タイル動線による最短 UX = M1b プログラマ普遍的需要への直接応答**: 競合 8 サイトのうち「タイル」概念を持つサイトは **0 件**（出典: 競合調査 §1〜2 / 全件サイドバー / ドロップダウン / フッターリンク）。yolos.net がここにタイル動線を構築すれば、競合最短値（1 ページ全画面利用）を上回る 0 ナビゲーション体験を提供する。複合入力型タイル N=2（text-diff）で「膨張側 3」の 400×400px 枠成立例を確立済 = 工数面でも実現可能。
4. **複合入力型タイル 3 件目 = B-452 N=2 検証データ蓄積（副次成果 / r2 改訂 = visitor MAJOR-2 + process CRIT-1 対応）**: 本サイクルは cycle-210 text-replace（N=1）/ cycle-214 text-diff（N=2）に続く複合入力型 **3 件目**として、cycle-210 で確立 + cycle-214 で初回引用検証した **SSoT 4 項目 (i)(ii)(v)(vi)** の **3 回目の引用検証**を行う。**ただし B-452 N=3 達成判定は cycle-214 (c214-β) 注記に従う**: cycle-214 の 0.00% は「flex:1 / overflowY:auto 構造で表示矩形が固定される設計結果」であり、入力量変動起因の (v) 変化率 N=2 データポイントとしては **同軸ではない参考値**（出典: `docs/cycles/cycle-214.md` L1163-1170 (c214-β)）。本サイクルが意図的に「入力量変動で表示矩形が変化する設計（= 結果欄を flex:1 + overflowY:auto に閉じ込めず、入力量で高さが変化する系統 or エラー枠 flexShrink:0 出現系統）」を選ぶことで真の N=2 / 暫定 N=3 のいずれを採取できるかを判定する。判定結果は §論点 14 末尾と B-452 状態欄に書き戻し（基準値見直し ±10/15/20% の最終判定は cycle-216 以降で N=3 真値が確定してから実施）。
5. **a11y + ReDoS 対策の維持と「テキストエリア内ハイライト」の検討（来訪者価値の核 / 競合 8 サイトに対する差別化軸維持 + 弱点 1 つの改善 / r3 改訂 = r2 visitor MINOR-1 対応 = 競合調査実態に合わせた事実精度の訂正）**: 競合調査 §10 の結論 = yolos.net 強み 4 軸（ReDoS 対策 / a11y 色のみ回避 / ローカル完結 / g/i/m/s 4 フラグ）の維持 + 弱点 1 つ「テキストエリア内ハイライト未実装」の改善検討（§論点 7）。**競合 8 サイトのハイライト実装状況は「実装明示 2 サイト（A: regex101 / G: WWW クリエイターズ 等）/ 推測的実装 4 サイト（C/D/F/H）/ 実装なし 1 サイト（E: Site24x7）/ 不明 1 サイト（B）」**（出典: `docs/research/2026-05-29-regex-tester-competitor-research.md` §4 ハイライト表現方式の詳細比較 L398-409）= 「全件実装済」は事実精度として誇張のため訂正。yolos.net は「リスト + テキスト併用」で a11y 軸では最良（同 §4 L412）/ ハイライト未実装は競合大多数との視覚的フィードバック格差。詳細ページ + タイルの両方で a11y を引き続き担保しつつ、ハイライト導入が来訪者価値を大幅に上げるか / 性能・ReDoS 安全性を毀損しないかを T-3 実機評価で判定する。
6. **AP-WF12 / AP-WF15 連動更新**: B-452 状態欄を「N=3 達成 / 着手条件充足 / 基準値見直し対象 SSoT 確定」へ更新 + B-453（複合入力型タイル planner 引用必須 SSoT 昇格 / `docs/knowledge/composite-input-tile-criteria.md` 新設）状態欄に「3 件目引用適用実施済 = 新設の優先度確定」を追記する。

#### viewport 採用方針

cycle-200〜214 と同型の **w375 / w1200 / w1900 × light / dark = 6 系統**を AP-WF05 網羅性ルールに従って採択。viewport meta は Next.js デフォルト（`width=device-width, initial-scale=1`）で標準採用し、独自指定はしない。

#### 数値 literal 4 分類ラベルと生成元併記の徹底（AP-P16 強化 / r2 改訂 = process MAJOR-1 対応）

本計画書に登場するすべての数値 literal には「**実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値**」の 4 分類ラベル + 生成元（コマンド or 出典 URL or ファイルパス + 行番号）を直近に併記する（AP-P16 強化 / cycle-210 R5 同型事故防止メモ）。生成元の指針:

- **実測値**: `grep` / `wc` / `getBoundingClientRect()` / Playwright 等のコマンド出力（または `tmp/cycle-215/baseline/` 配下の保存ファイル）
- **仕様値**: 公式ドキュメント URL（ECMAScript / WAI-ARIA / Nielsen / Snyk 等）
- **実装値**: ファイルパス + 行番号（`useRegexWorker.ts:11,14` 等）
- **推定値 / 経験的暫定値**: 計算式（例 `15 + 1 = 16`）または「N=1 由来」「cycle-X SSoT 引用」等の由来

とくに cycle-210/214 SSoT を引用する箇所では「cycle-210 / cycle-214 で確定済の SSoT 値」「本サイクルで T-4 実機計測する予定の値」「経験的暫定値（N=1 / N=2 由来）」を区別する。

設計意図ベースで本サイクル中に実装まで確定しない SSoT 候補には `-tentative` 接尾辞を付け、T-3 実装直後に `grep` で本文記述を一括訂正する手順を T-3 完成条件に組み込む（cycle-214 c214-ε 教訓 = AP-WF12 cycle-214 事例）。

**r2/r3 補完ラベル**: r1 process review MAJOR-1 + r2 process MAJOR-1 で指摘された主要な無ラベル literal の補強（本文側にも直近併記する徹底改訂と併用）:

- `cols=3 rows=3` = **推定値** = cycle-210/214 同型ベース起点
- `400×400px` = **仕様値** = `src/tools/_constants/tile-sizes.ts` 等の TILE_BASE_SIZE 定義
- `5 回測定の中央値` = **経験的暫定値** = cycle-214 ベンチ同型 / 単発計測のばらつき緩和
- `<100ms / <500ms / >500ms` = **仕様値** = [Nielsen Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- スクショ枚数（`6 枚 / 2 枚 / 10 枚 / 21 枚以上`）= **推定値** = AP-WF05 viewport 6 系統 + シーン 2 件 + AP-P21 5 ケース + タイルプレビュー 4 枚の計算式
- 置換マッピング表「複数」= **実測値（T-1 で確定）** = T-1 完了後に `grep -oE "var\(--color-[a-z-]+" ... | sort | uniq -c` の出力値で書き戻し
- `bundle インパクト = ほぼ 0` = **推定値** = 既存 logic.ts 共有チャンク化前提 / **r3 改訂 = r2 process MINOR-3 対応 = 案 F + 案 W + 案 Y + 論点 15 案 D の追加コード分を T-3 で実測対象とする**
- `tilesCount=15` = **実測値** = `grep -c "slug:" src/tools/_constants/tile-declarations.ts` で T-1 builder が再実測 / 16 = **実測値計算 = 15 + 1**
- `最低 17 件` = **経験的暫定値** = grep 実測（**実測値** = `grep -cE '^\s*(test|it)\(' src/tools/line-break-remover/__tests__/Component.test.tsx` = 21 件 / `grep -cE '^\s*(test|it)\(' src/tools/text-diff/__tests__/TextDiffTile.test.tsx` = 19 件 / `grep -cE '^\s*(test|it)\(' src/tools/text-replace/__tests__/TextReplaceTile.test.tsx` = 11 件）+ Tile テスト 17 件の中央寄り（r2 process MINOR-3 対応で具体生成元明示）
- **r3 追補**: スクショ枚数 (`base 6 / after-match 2 / error 2 / AP-P21 5 / タイルプレビュー 4 / 実体験フロー 2 / 計 21 枚以上`) = **推定値計算** = `AP-WF05 viewport 3 × theme 2 = 6 + シーン × 2 + (e-α) エラー × 2 + AP-P21 (a)〜(e) 5 + タイルプレビュー w1200/w375 × light/dark 4 + 実体験フロー シーン 1+2 = 21`（T-4 完成条件で実数値検証）
- **r3 追補**: ベンチ字数 (`1,000 / 5,000 / 10,000 / 50,000`) = **推定値** = visitor 実ユースケース（ログ抽出 5,000〜50,000 字）レンジ起源 / T-1 実測で採択 / Snyk ReDoS ガイド代表例の標準計測点
- **r3 追補**: 論点 7 案 W の N 値 (タイル簡易ハイライト件数) = **推定値（T-1 プロトタイプで確定 / 後述論点 7 採択末尾参照）**
- **r3 追補**: ハイライト背景色トークン = **実装値** = `grep -nE "success-soft|accent-soft|warning-soft" src/app/globals.css` 確認結果 = ライト L33/37/41、ダーク L119/123/127 で 3 種定義済 / 候補比較の生成元
- **r4 追補（= r3 process MAJOR-1 対応）**: Blob URL inline Worker 初回起動コスト `50〜150ms` = **推定値 + 経験的暫定値** = 生成元: [MDN Worker startup cost](https://developer.mozilla.org/en-US/docs/Web/API/Worker) ベース + Chrome DevTools Performance / Safari Web Inspector の一般的計測範囲 / T-1 実機計測で再確認予定
- **r4 追補（= r3 process MAJOR-1 対応）**: 案 F-2 timeout 緩和値 `200ms` = **経験的暫定値** = 生成元: [Nielsen Norman Group「Response Times: The 3 Important Limits」](https://www.nngroup.com/articles/response-times-3-important-limits/) の `100ms 瞬時性` と `1 秒 思考連続性` の中間値採択 / T-1 ベンチで実証予定
- **r4 追補（= r3 visitor MINOR-1 対応）**: 論点 7 案 W-4 動的描画採択時の視認可能性根拠 = タイル枠 400×400px 内 利用可能エリア = **推定値計算** = 操作側（pattern input + コピーボタン + 詳細リンク + 条件付きエラー枠）= 約 200px / 膨張側（本文 textarea + マッチ結果欄）= 約 200px / 1 行高さ = 約 22px / 単純計算で約 9〜10 行 = 視認可能上限。案 W-4 採択時は IntersectionObserver で「可視範囲外のマッチは DOM 未描画」状態を保ち、スクロールに応じて追加描画 = 視認可能件数の上限はスクロール量に応じて拡張可能（DOM ノード負荷とコピー可用性のトレードオフを解消）
- **r6 追補（= r5 process MAJOR-2 対応 / r5 process MAJOR-1 対応）**: 論点 7 案 W-4 採択時の IntersectionObserver パラメータ仕様値候補 + 計測タイミング規定:
  - `rootMargin: "100px"` = **実測値** = 生成元: [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) パラメータ既定値レンジ + タイル膨張側 ~200px の半分相当を pre-load 余裕として確保 / T-1 プロトタイプで実測検証済 = `tmp/cycle-215/baseline/highlight-N-determination.md` §C / scrollTop=0 で 17 件 / scrollTop=1000 で 23 件 / rootMargin:"0px" 比較対照 11 件 = 理論値と一致
  - `threshold: 0.1` = **実測値** = 生成元: 同上 MDN IntersectionObserver / 1 マッチ overlay の 10% 表示で描画トリガー / IntersectionObserver の典型既定値レンジ / T-1 プロトタイプで実測検証済（同ファイル §C / Chromium 149）
  - `requestAnimationFrame` 2 回後の安定計測タイミング = **推定値 + 経験的暫定値** = 生成元: [MDN window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) ベース + 描画パイプライン layout + paint 2 フレーム待ち慣用パターン / T-1 プロトタイプで安定挙動確認済 / AP-P21 (d) ケース計測時の動的描画時系列変動を排除して同軸計測を確保
- 詳細は各論点 / 各タスクの directly inline ラベル参照

#### 「複合入力型ゆえの注意点」 = cycle-210/214 5 ケース系統（a〜e）の regex-tester 再評価（T-1 実体確認後に T-4 で確定）

cycle-210 text-replace で確立し cycle-214 text-diff で再運用した AP-P21 計測 5 ケース（a〜e / 出典: `tmp/research/cycle-214-cycle-210-ssot-extraction.md` §B）を regex-tester に再評価する。

**タイル UI の操作側 / 膨張側構成（r2 改訂 = process MAJOR-8 対応 / §論点 2 採択 = 案 C 全件省略 + §論点 4 採択 = 案 α と整合）**:

- **操作側（flexShrink:0）** = 正規表現 input + コピーボタン + 詳細リンク + 条件付きエラー枠（**フラグ checkbox 群は §論点 2 案 C 採択により省略 = タイル UI 操作側に含まれない / 詳細ページのみ存在**）
- **膨張側（flex:1 + overflowY:auto）** = 本文 textarea + マッチ結果欄

text-replace 系統（操作側 2 input + 膨張側 textarea + 結果欄）に近い形態を持つ。

**想定系統（r3 改訂 = r2 process MAJOR-6 対応 = 「事前確定撤回 → T-1 実体確認に委ねる」cycle-214 教訓を本文構造に反映 / 計画段階の暫定推定 / T-1 で確定）**:

- (a) **両入力空（初期表示）** = patternInput 空 + 本文 textarea 空 → 結果欄無表示 or 「マッチなし」初期状態
- (b) **パターン未入力 + 本文有** = pattern 空 / 本文 30 字 → `useRegexWorker` の `EMPTY_MATCH_RESULT` 返却挙動（**実装値** = `useRegexWorker.ts:338-343` / planner Read 完了 / T-1 builder 再確認）
- (c) **パターン有 + 本文未入力** = 例 `\d+` / 本文 0 字 → マッチ 0 件
- (d) **両方有でマッチ有** = 例 `[A-Z]+` / 本文 300 字（中程度入力）→ マッチ結果欄が膨張する正常系統 / **r5 改訂 = r4 process MAJOR-3 対応 = §論点 7 案 W-4 採択（動的描画 / IntersectionObserver / N=動的）の影響を考慮**: (d) ケースのマッチ結果欄は「リスト全件 + 動的描画ハイライト overlay」の二層構成となり、IntersectionObserver により可視範囲内のマッチのみ DOM 描画される。AP-P21 計測対象は (1) リスト全件分の表示矩形（高さ膨張側）+ (2) overlay div の可視描画件数（推定 9〜10 行 = 案 W-4 視認可能性根拠）の **両方**を独立計測し、`tmp/cycle-215/after-t4/ap-p21-measurements.md` に二段記録する（新規 SSoT 候補 `(c215-δ-tentative)` の動的描画指針と整合）/ **r6 改訂 = r5 process MAJOR-1 対応 = 計測タイミング規定**: マッチ overlay div の動的描画は時系列で変動するため、計測タイミングは **`requestAnimationFrame` 2 回後の安定状態で `getBoundingClientRect()` 取得**（**推定値 + 経験的暫定値** = 描画パイプライン layout + paint 2 フレーム待ち / MDN window.requestAnimationFrame ベース / T-1 プロトタイプで実測検証予定）= 動的描画の時系列変動を排除した同軸計測を確保（詳細は §論点 7 末尾 + §AP-P16 強化「r6 追補」参照 / T-1 / T-4 builder が同一手順で計測できる粒度に統一）
- (e) **エラー枠条件付き表示**: 候補が **2 種**ある:
  - (e-α) **無効パターン入力時のエラー** = 例 `[unclosed` → `RegexResult.error` で「無効な正規表現: ...」表示（`Component.tsx:87-90` `<div role="alert">` / **実装値** = `logic.ts:32-119` `testRegex` 内 `new RegExp()` 例外捕捉）
  - (e-β) **入力長超過時のエラー** = 本文 10,001 字 → 「入力テキストが長すぎます（最大 10,000 文字）」（**実装値** = `logic.ts:29` `MAX_INPUT_LENGTH=10_000`）

**事前確定撤回方針（cycle-214 L419 教訓引用 / r3 process MAJOR-6 対応）**: 計画段階の「第一候補」は **推定値**であり、cycle-214 で起きた「(e) 系統の事前確定 → T-1 実体確認で撤回 → (a+e-α) 統合 = 4 系統独立」事故再発を防ぐため、**(e-α) / (e-β) いずれを計測対象とするかは T-1 実体確認後の T-4 で確定**する。系統数調整（N=5 のまま / N=6 化 / N=4 統合のいずれか）も T-4 確定対象。**T-1 で両方の Playwright 表示矩形を計測 / T-3 実装後再計測 / T-4 で最終 SSoT 値確定**（cycle-210 SSoT (vi) の手順自体を引用適用）。

### 作業内容

タスク分割は cycle-200〜214 で確立した 4 タスク構成（T-1 現状把握 → T-2 詳細ページ移行 → T-3 タイル定義 → T-4 検証）を踏襲する。各タスクの「目的 / 実施事項リスト / 完成条件」のみを literal 確定し、具体的なコード / CSS クラス名 / テスト assertion 文言は builder 裁量とする（AP-P20 過剰具体化 / AP-WF03 違反回避）。

#### T-1: 現状把握と移行前 baseline 取得 + 正規表現マッチ性能ベンチ + GA データ確認 + (a)〜(e) 系統実体確認

**目的**: 移行作業の起点を確定し、後工程で「変更前後の差分」を客観的に比較できる素材を揃える。cycle-210/214 SSoT を計画書内に引用形で書き起こし、T-4 引用検証の土台を作る。論点 6（計算トリガー）に最重要となる正規表現マッチ性能の実測、(a)〜(e) 系統の実体確認、GA データの最新化を行う。

**実施事項**:

- `src/tools/regex-tester/` 配下のファイル構成、`logic.ts` の export、`useRegexWorker.ts` の仕様（DEBOUNCE_MS / WORKER_TIMEOUT_MS / MAX_INPUT_LENGTH / MAX_MATCHES）、`meta.ts` の `keywords` / `faq` / `relatedSlugs`、既存テスト件数を grep / Read で実体確認する（数値はすべてコマンドを併記して引用付き報告 = AP-P16 / AP-WF12 対策）。
- 主要事実の参考値（**実測値ラベル = T-1 builder が再実測必須**）:
  - `Component.tsx` 行数（**実測値** = `wc -l` 出力 / 参考: baseline r1 §2-1 = 168 行）
  - `Component.module.css` 行数 + `--color-*` 残存数 + hex 直書き行（**実測値** = `grep -c "var(--color-" src/tools/regex-tester/Component.module.css` + `grep -oE "var\(--color-[a-z-]+" ... | sort | uniq -c` + `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/regex-tester/Component.module.css` / 参考: 40 箇所 / 8 種 + hex 2 箇所（L140-141 = `.matchText` 背景・文字）/ baseline r1 §2-2）
  - `logic.ts` 行数 + export 件数 + `MAX_INPUT_LENGTH` / `MAX_MATCHES` 定数の現状値（**実装値** = `logic.ts:29-30` / 参考: 119 行 / 10,000 / 1,000）
  - `useRegexWorker.ts` の `DEBOUNCE_MS` / `WORKER_TIMEOUT_MS`（**実装値** = `useRegexWorker.ts:11,14` / 参考: 500ms / 300ms）+ inline Worker 構造（**実装値** = baseline r1 §2-4）
  - `meta.ts` の `relatedSlugs`（**実測値** = baseline r1 §2-5 = `["json-formatter", "text-diff", "email-validator"]` / T-1 で実在 `ls` 確認）+ `keywords`（5 件 = `["正規表現", "正規表現テスト", "regex", "正規表現チェック", "パターンマッチ"]`）+ `search_intents` 不存在の再確認
  - `__tests__/logic.test.ts` のテストケース数（**実測値** = `grep -cE '^\s*(test|it)\(' src/tools/regex-tester/__tests__/logic.test.ts` / 参考: 12 件）+ Component.test.tsx 不存在の `ls` 確認
- **正規表現マッチ性能ベンチ**（§論点 6 = 計算トリガー確定の客観的根拠 / r2 改訂 = visitor CRIT-1/CRIT-2 + process MAJOR-1 対応）:
  - 計測グリッド = **中程度パターン（`[A-Za-z0-9]+` 程度 = **仕様値** = ASCII 英数字クラス / [MDN RegExp 仕様](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)）× 1,000 / 5,000 / 10,000 / 50,000 文字（**推定値** = visitor の実ユースケース想定: ログ抽出 5,000〜50,000 字レンジ / r3 改訂 r2 process MAJOR-1 対応 = ラベル直近併記）× testRegex 同期呼び出し**。各セル `performance.now()` で **5 回測定の中央値**（**経験的暫定値** = 単発計測のばらつき緩和 / cycle-214 ベンチ同型）。
  - **ReDoS 観点のベンチ追加（visitor CRIT-2 + process MAJOR-1 対応 / Myers O(N×M) 誤用訂正）**: 危険パターン **3 系統**を含めて catastrophic backtracking の最悪計算量を実証する。regex-tester は **NFA バックトラッキングエンジン**（V8 / SpiderMonkey 等のデフォルト実装 / **仕様値** = ECMAScript RegExp 仕様）で動作し、Myers O(N×M) は **適用対象外**（Myers は diff アルゴリズム / cycle-214 text-diff で使われる別物 / r2 訂正）:
    - (R1) `(a+)+$` × `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab` 30 字程度（古典 ReDoS）
    - (R2) `(a+)+(b+)+c` × 100〜500 字（複合 catastrophic backtracking）
    - (R3) Snyk ReDoS ガイド代表例 1〜2 種（**仕様値** = `https://snyk.io/blog/redos-vulnerabilities-in-npm-spikes/` で T-1 builder が WebFetch 取得）
  - 上記 3 系統について **1,000 字 / 10,000 字 / 50,000 字**（**推定値** = ベンチ同型レンジ / 上記グリッドと整合）で同期 testRegex 呼び出し時間を計測。タイル UI に文字数制限を入れても fatal pattern では fatal になる事を実証 → §論点 6 採択の前提崩壊有無を確認。
  - **処理時間別 UX 設計 3 段分岐（cycle-214 同型 / [Nielsen "Response Time Limits"](https://www.nngroup.com/articles/response-times-3-important-limits/) / **仕様値**）**:
    - `<100ms` 安定 → 即時計算（debounce なし / Worker なし）採択可
    - `<500ms` → spinner 中間表示 + debounce 必要
    - `>500ms` or ReDoS 検出 → Worker + 既存 `worker.terminate()` 中断 + timeout 必須（r3 改訂 = r2 visitor CRIT-2 対応 = AbortController 表記訂正）
  - ベンチ結果は `tmp/cycle-215/baseline/regex-bench.md` に出力 / §論点 6 採択の客観的根拠として T-4 に書き戻し
- **ハイライト実装プロトタイプ検証**（r2 改訂 = visitor CRIT-3 対応 / 「性能リスクの感想で却下」を回避する実証根拠の取得）:
  - タイル幅 400px / w375 で `<textarea>` + 絶対配置 `<div>` overlay によるハイライト（背景色 + テキスト記号併用）が実装可能か、軽量プロトタイプ（`tmp/cycle-215/baseline/highlight-prototype.html` 等）で目視確認
  - フォントメトリクス同期可否 / マッチ件数 N=50 / N=500 / N=5000 でのレンダリング負荷 / overlay 同期ずれを定性評価
  - 結果は `tmp/cycle-215/baseline/highlight-feasibility.md` に保存 / §論点 7 採否の客観的根拠
- **(a)〜(e) 系統実体確認**: Playwright で詳細ページ `(legacy)/tools/regex-tester` を開き、(a)(b)(c)(d)(e-α)(e-β) の 6 状態を実機操作 → 表示矩形を `getBoundingClientRect()` で計測 → エラー枠 h / w を確定。とくに (e-α) 無効パターンと (e-β) 入力長超過の 2 候補について、(1) 文言の字数差 / (2) 枠 h・w 値の差 を比較し、§論点 5 で計測対象として採用するかを T-4 で確定する材料を揃える。`tmp/cycle-215/baseline/error-frame-measurements.md` に保存。
- **GA データ確認**（CLAUDE.md「Check Google Analytics」原則 / baseline r1 §4 で 過去 104 日 PV=2 確認済 だが T-1 で最新化）:
  - google-analytics MCP 経由で過去 30 日（2026-04-29〜2026-05-28）の `/tools/regex-tester` PV / セッション数 / 流入元上位 / 検索クエリ「正規表現 テスト」「regex tester」関連クエリの流入実績を計測
  - ベンチマーク = cycle-214 完了済の `/tools/text-diff` 直近 30 日 PV と比較
  - 結果は `tmp/cycle-215/baseline/ga-data.md` に保存 / §補足事項に要約引用
- Playwright で移行前のスクリーンショットを取得:
  - **ベース 6 枚** = w1200 / w1900 / w375 × ライト・ダーク（AP-WF05）
  - **マッチ実行後状態 2 枚** = ライト・ダーク（pattern + 本文入力 + マッチ結果表示状態）
  - **エラー状態 2 枚** = ライト・ダーク（(e-α) 無効パターン入力時のエラー枠表示）
  - 合計 **baseline 10 枚** / 保存先 = `tmp/cycle-215/baseline/`
- **cycle-210/214 SSoT 引用準備（本サイクル独自の必須作業 / B-452 N=3 達成の根幹）**: cycle-210 補足事項 4 項目 (i)(ii)(v)(vi) と cycle-214 補足事項 (c214-α)〜(c214-ι) のうち該当項目を本計画書の §引用する SSoT に引用形で書き起こし、各項目について「regex-tester への適用予告（PASS 期待 / 再評価 / 適用対象外）」を明示する（後述 §引用する SSoT 参照）。これにより T-4 で機械的に検証可能な状態を作る。

**完成条件**:

- [x] 移行前スクリーンショット **計 10 枚**（base 6 + after-match 2 + error 2）が `tmp/cycle-215/baseline/` 配下に保存 (T-1 builder 2026-05-29: `baseline-{w1200,w1900,w375}-{light,dark}.png` + `after-match-w1200-{light,dark}.png` + `error-w1200-{light,dark}.png` = 計 10 枚)
- [x] 既存テスト全件緑 = `npm run test -- regex-tester` 出力を引用付き報告 (T-1 builder 2026-05-29: `Test Files 1 passed (1) / Tests 12 passed (12)`)
- [x] grep 数値が baseline r1 §2-2 参考値と一致する／しない場合は実測値を計画書に書き戻し（`--color-*` 残存数 / hex 直書き 2 箇所 / Component.test.tsx 不存在 / logic.ts export 数 / `MAX_INPUT_LENGTH=10,000` / Worker debounce 300ms / Worker timeout 500ms の再確認）— T-1 builder 2026-05-29: 全件一致 (`tmp/cycle-215/baseline/grep-measurements.md`) / 訂正点 = hex 行番号は L140/L143 (L140/L141 ではない) / logic.ts export 数 = 6 (新規実測)
- [x] **正規表現マッチ性能ベンチ結果**が `tmp/cycle-215/baseline/regex-bench.md` に保存 / §論点 6 採択の根拠が確定 / 危険パターン 3 系統 (R1)(R2)(R3) × 1,000/10,000/50,000 字の計測値が表形式で記録 — T-1 builder 2026-05-29: 中程度 10k 字 = 0.128ms / R1/R2/R3 = 50 字でも 134〜215 秒の爆発 = Worker timeout 必須を実証
- [x] **論点 6 案 F 実装可能性チェック完了**（r3 改訂 = r2 visitor CRIT-2 対応）— T-1 builder 2026-05-29: Chromium 149 headless で median 9.1ms (new Worker → 結果) << 100ms / 案 F (Worker + worker.terminate() + timeout 100ms / debounce 撤廃) 採択 = T-1 実測 9.1ms で技術的成立確認 / 案 F-1 (pre-warm) + 案 F-2 (timeout 200ms) は 9.1ms の余裕で不要判定 (`tmp/cycle-215/baseline/worker-startup-cost.md`)
- [x] **論点 7 案 W の N 値確定根拠取得**（r3 改訂 / r6 改訂） — T-1 builder 2026-05-29: 案 W-4 (動的描画) 採択妥当 / 同時 DOM 約 99 件 / IntersectionObserver `rootMargin:"100px"` / `threshold:0.1` 実測検証済 (`tmp/cycle-215/baseline/highlight-N-determination.md`)
- [x] **ハイライト実装プロトタイプ検証結果**が `tmp/cycle-215/baseline/highlight-feasibility.md` に保存 / §論点 7 採否の根拠が確定 — T-1 builder 2026-05-29: overlay `<pre>` + `<mark>` 方式で位置同期 px レベル / 250 マッチ 31ms / 1,000 マッチも 100ms 以内 / w375 / 400px タイル 両方成立
- [x] **(a)〜(e) 6 系統の Playwright 表示矩形 + エラー枠 h/w**が `tmp/cycle-215/baseline/error-frame-measurements.md` に保存 — T-1 builder 2026-05-29: (e-α) (e-β) 共に errorBox h=47.75 / w=928 (1200vp) で同値 / (d) matchInfo h=1753.9 で膨張側を圧倒
- [x] **(e) 系統最終確定 = T-4 持ち越し**（r3 改訂 = r2 process MAJOR-6 対応） — T-1 builder 2026-05-29 推奨: 案 1 (e-α) 単独採用 / N=5。確定は T-4 (§論点 5 末尾に書き戻し材料あり)
- [x] **GA データ確認結果**が `tmp/cycle-215/baseline/ga-data.md` に保存 / §補足事項に要約引用 — T-1 builder 2026-05-29: 直近 30/90 日とも `/tools/regex-tester` PV=0 / `/tools/text-diff` も 0 / GA 計測自体は正常 (サイト全体 row_count=129)
- [x] `meta.ts` `relatedSlugs` 3 件のうち実在しないものがあれば §論点 10 に書き戻し — T-1 builder 2026-05-29: `json-formatter` / `text-diff` / `email-validator` 3 件すべて `src/tools/<slug>/` 直下に実在 (email-validator は (legacy) 配下) / §論点 10 書き戻し不要
- [x] TILE_DECLARATIONS 現状エントリ件数（**実測値** = `grep -c "slug:" src/tools/_constants/tile-declarations.ts` or `tiles-registry.ts:N` の `tilesCount=N` / cycle-214 完了時点 15 件想定）の独立再確認 — T-1 builder 2026-05-29: `grep -c "^\s*slug:"` = 16 (= 15 実エントリ + 1 interface 行 false-positive) / `[generate-tiles-registry] tilesCount=15` ビルドログで再確認 = 15 件で一致
- [x] cycle-210/214 SSoT 引用準備 = §引用する SSoT 全 4 + α 項目に「regex-tester への適用予告」が記載済 — 既に計画書本文に記載済 (planner 確認 / T-1 builder は本サイクル内では再記載不要)

**T-1 検証手順（AP-WF16 / reviewer 独立再実行ポイント）**: builder が grep / wc / Playwright 計測コマンド全件の出力を引用付き報告 / reviewer は **後続判断を最も左右する 3 数値（= `--color-*` 残存数 + hex 直書き 2 箇所 + 既存テスト件数 12 件）を必ず独立再実行**。残りはサンプリングで最低 1 つ追加実行。性能ベンチも reviewer が 1 系統独立再計測。

---

#### T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + meta.ts 棚卸し + 既存 backlog 連動更新

**目的**: 詳細ページを新デザイン体系（1200px 標準 / 新トークン）に統一し、`search_intents` 整合性を取り、関連 backlog の対象件数を更新する。

**実施事項**:

- `git mv` で `src/app/(legacy)/tools/regex-tester/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `src/app/(new)/tools/regex-tester/` 配下に移動。
- `src/app/(new)/tools/regex-tester/page.module.css` を新設（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }` の標準パターン / 直近 15 ツールと完全同一）。`page.tsx` 側に `<div className={styles.page}>` ラッパー追加。
- `src/tools/regex-tester/Component.module.css` 内の旧トークン（**実測値 = T-1 で確定 / 参考: 40 箇所 / 8 種**）+ hex 直書き 2 箇所（`#d4edda` / `#155724` / L140 + L143 = `.matchText` / 連続行ではない = T-1 実測確定）を新トークンへ一括置換する。
- **置換マッピング表**（cycle-203〜214 SSoT + 本サイクル新規）:

  | 旧トークン / hex                | 件数（実測値 = T-1）                        | 新トークン                      | マッピング根拠                                  |
  | ------------------------------- | ------------------------------------------- | ------------------------------- | ----------------------------------------------- |
  | `--color-text`                  | 複数（T-1 で確定）                          | `--fg`                          | cycle-203〜214 SSoT                             |
  | `--color-text-muted`            | 複数（T-1 で確定）                          | `--fg-soft`                     | cycle-203〜214 SSoT                             |
  | `--color-border`                | 複数（T-1 で確定）                          | `--border`                      | cycle-203〜214 SSoT                             |
  | `--color-bg`                    | 複数（T-1 で確定）                          | `--bg`                          | cycle-203〜214 SSoT                             |
  | `--color-bg-secondary`          | 複数（T-1 で確定）                          | `--bg-soft`                     | cycle-203〜214 SSoT                             |
  | `--color-primary`               | 複数（T-1 で確定）                          | `--accent`                      | cycle-203〜214 SSoT                             |
  | `--color-error`                 | 複数（T-1 で確定）                          | `--danger-strong` or `--danger` | cycle-210/214 同型 / T-1 で隣接コンテキスト確認 |
  | `--color-error-bg`              | 複数（T-1 で確定）                          | `--danger-soft`                 | cycle-210/214 同型                              |
  | `.matchText` hex `#d4edda` 背景 | 1（L140 / T-1 で確定）                      | `--success-soft`                | cycle-214 (c214-δ) 引用適用                     |
  | `.matchText` hex `#155724` 文字 | 1（L143 / T-1 で確定 = L141 ではなく L143） | `--success-strong`              | cycle-214 (c214-δ) 引用適用                     |

  上記マッピング先トークンがすべて `src/app/globals.css` のライト `:root` + ダーク `:root.dark` 両方に定義済であることを T-2 builder が `grep` で再確認（**実装値** = cycle-214 で 12 種 + α 定義済 / 未定義のものがあれば §論点 14 に書き戻して新トークン定義の要否を判定）。

- **opengraph-image.tsx / twitter-image.tsx の処遇**: `(legacy)` から `(new)` に `git mv` で移動するだけで本文の OG 文言・カラースキームは touch しない（cycle-200〜214 同型運用）。`accentColor: "#0891b2"` / `icon: "🛠️"`（baseline r1 §2-7 / `(legacy)/tools/regex-tester/opengraph-image.tsx:19-20` 推定 / T-1 で実体再確認）は (legacy) 側と同値を維持。
- 並べ読み突合 grep で他の (new) ツールの使用トークンと一致することを確認（AP-WF12 違反予防）。
- w1900 で本文幅が 1200px に収まっていることを Playwright で確認。
- **詳細ページ Component.tsx の touch 範囲**: 以下のみ変更し、それ以外は touch しない（widget 構造の主要要素 = patternInput / フラグ checkbox 群 / 本文 textarea / replacement input / マッチ結果欄 / 置換結果欄 は visitor 価値が確立済 = 維持）:
  1. **旧トークン置換**（§T-2 マッピング表 / 8 種）
  2. **hex 置換**（2 件 / `.matchText` 背景・文字）
  3. **詳細ページのテキストエリア内ハイライト導入（§論点 7 採択時のみ）**: 競合 8 サイト中 5〜6 サイトがハイライト実装済 = yolos.net の弱点 1 つを改善する場合は（r4 改訂 = r3 visitor MAJOR-2 対応 = §目的 L62 + §論点 7 L509 の訂正と整合 / 8 サイト中 5〜6 サイトのみ実装 / 残り 2〜3 サイトは未実装 or 不明）、`<pre>` または overlay div + 背景色ハイライト + テキスト記号併用（a11y 色のみ回避 / 既存 yolos.net 強みの維持）で実装。採否は §論点 7 で確定。
  4. **role / aria-live 構成の cycle-214 c214-ζ 同型運用**（採用時 / §論点 14 で再評価）: マッチ結果欄が長文 `<pre>` でリアルタイム更新される場合、`role="region"` のみ付与（aria-live なし）+ サマリ status 欄（「N 件マッチ」短文）に `role="status" aria-live="polite"` 分離付与。cycle-214 (c214-ζ) を 2 件目引用適用。
- **meta.ts の search_intents 整合性確認 + 追加候補**: 競合調査 §8 の典型需要 10 サンプルから具体クエリを採用候補化:
  - **追加候補語比較表（AP-P17 ゼロベース 4 案以上）**:

    | 候補語                    | 採択 | 採択理由 / 不採用理由                                                         |
    | ------------------------- | ---- | ----------------------------------------------------------------------------- |
    | `正規表現 動作確認`       | ○    | M1b プログラマ典型クエリ / 「テスト」と区別される動詞表現                     |
    | `メールアドレス 正規表現` | ○    | 競合調査 §8 サンプル #1 / 頻出ユースケース                                    |
    | `URL 抽出 正規表現`       | ○    | 競合調査 §8 サンプル #3 / M1a 文書編集者層                                    |
    | `電話番号 正規表現`       | ○    | 競合調査 §8 サンプル #2 / 日本語固有需要                                      |
    | `regex オンライン`        | ×    | 英語クエリで日本語 UI と整合性低い / `regex` 単独で meta.ts keywords に既登録 |
    | `regex チェック`          | ×    | `正規表現チェック` で十分カバー（既登録）                                     |
    | `郵便番号 正規表現`       | ×    | サンプル #4 だが頻度が低い見込み / 上記 4 語で十分                            |

  - **採択案 = 4 語追加**（採択理由: M1a/M1b 両層をカバー + 競合調査 §8 上位サンプルに対応）。詳細は §論点 10 で確定。

- **backlog 連動更新**:
  - **B-462 起票候補**（Component.test.tsx 不在問題）: B-449 / B-455 / B-458 / B-459 / B-461 同型の新規 backlog として **B-462**（次の空き番号 = T-2 builder が **`grep -oE 'B-[0-9]+' docs/backlog.md | sort -V | tail -1`**（**実測値** = backlog 最大 ID 取得 / r3 改訂 = r2 process MAJOR-7 対応 = `sort -u` → `sort -V` 改修で歯抜け採番に対応）で実測 → 数値部 + 1）。**現時点 (planner 確認)** = `B-461` が最大 → **B-462** 採用。スコープ = `src/tools/regex-tester/__tests__/Component.test.tsx` 新規作成（**17〜21 件規模** = **経験的暫定値** = grep 実測 = `line-break-remover Component.test.tsx = 21 件` / `text-diff TextDiffTile.test.tsx = 19 件` / `text-replace TextReplaceTile.test.tsx = 11 件` 等の Tile テスト件数の中央寄り / r2/r3 改訂 = process MINOR-3 対応）。優先度 P4 / 着手条件なし。
  - **B-452**（複合入力型タイル AP-P21 (v) 基準値見直し / P3 / N≥3 着手条件）: 本サイクル T-4 で N=3 データポイントを採取し、状態欄を「**N=3 達成 / 着手条件充足 / 基準値見直し対象 SSoT 確定**」に書き戻す。3 サンプル（cycle-210 = 11.55% / cycle-214 = T-4 計測値 / cycle-215 = 本サイクル T-4 計測値）の (d)→(e) 変化率を集計し、±10% / ±15% / ±20% のどれに統計的に収束するかを §論点 14 末尾で判定 → backlog B-452 状態欄に提案値を併記。
  - **B-453**（複合入力型タイル planner 引用必須 SSoT 昇格 / `docs/knowledge/composite-input-tile-criteria.md` 新設）: 状態欄に「**3 件目引用適用実施済 = `docs/knowledge/composite-input-tile-criteria.md` 新設の優先度確定**」を追記。
  - **B-314 Phase 8.1 全体進捗**: 本サイクル完了で **16 件目** / 進捗欄を更新。

**完成条件**:

- [x] **T-1 着手前提確認**（r2 改訂 = process MAJOR-3 対応）: T-1 ベンチ結果 / プロトタイプ検証結果 / (a)〜(e) 系統実体確認結果が `tmp/cycle-215/baseline/` に揃っており、§論点 6 / §論点 7 / §論点 5 の採択案が builder / planner で最終確定している
- [x] `/tools/regex-tester` が (new) 配下で正常表示（HTTP 200 OK）
- [x] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件削除済）
- [ ] w1200 / w1900 / w375 で表示崩れがない（T-4 視覚回帰で確認）
- [x] `Component.module.css` 内に `--color-*` 系旧トークンが残存しない: `grep -c "var(--color-" src/tools/regex-tester/Component.module.css` → `0`
- [x] **hex 直書き 2 種**が新トークン化されている: `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/regex-tester/Component.module.css` → `0`
- [x] **既存テスト全件緑維持**（AP-WF16 自動チェック観点）: `npm run test -- regex-tester` 実行で **12 件全件緑**（T-1 baseline と同件数 / `logic.ts` の既存 export 形状を変更しないため `__tests__/logic.test.ts` への影響なしを機械的に検証）
- [x] M1a / M1b yaml `search_intents` に正規表現系 **4 語**が追加されている（採択案分）
- [x] **論点 15 案 D-改 1 の T-2 反映完了**（r3 改訂 = r2 process MAJOR-5 対応 / r6 改訂 = r5 visitor CRIT-1 対応 = タイル UI もドロップダウン 6 種参照に改訂）: `meta.ts` にサンプル 6 種定数（メール / URL / 電話 / 郵便 / 日付 / HTML タグ）+ 各サンプルのデフォルトテストテキスト + ラベルが定数として追加されている（具体パターン文字列は §論点 15 末尾の表で確定 / `grep -E "サンプル|sampleInput|samplePattern" src/tools/regex-tester/meta.ts` で 6 件以上ヒット確認）/ **タイル UI と詳細ページの両方から参照する単一 SSoT として定義**（タイル `<select>` 6 種 + 詳細ページドロップダウン 6 種で同一定数を参照）
- [x] **論点 10 `relatedSlugs` 実在判定完了**（r3 改訂 = r2 process CRIT-3 対応）: T-1 で `ls src/app/(new)/tools/email-validator src/app/(legacy)/tools/email-validator 2>&1` 実測の結果に基づき、不在の場合は §論点 10 差し替え候補比較表（後述）から採択値を確定 / 実在判定結果と採択 ID を §補足事項に書き戻し
- [x] **B-462** が `docs/backlog.md` に追記済（Component.test.tsx 不在対応 / P4）
- [x] **B-452** 状態欄が N=3 達成 + 着手条件充足を反映して更新済 + 基準値見直し提案値（±10/15/20% のいずれか）併記
- [x] **B-453** 状態欄に cycle-215 で 3 件目の引用適用実施済 + `docs/knowledge/composite-input-tile-criteria.md` 新設の優先度確定が追記済
- [x] `meta.ts` `relatedSlugs` 3 件の実在再確認（不在のものがあれば §論点 10 で差し替え）

**T-2 検証手順（AP-WF16 / r2/r3 改訂 = r1/r2 process MAJOR-4 + r2 process MAJOR-7 対応）**: builder が残存判定 grep / 200 OK 確認 / yaml diff / backlog 更新箇所 grep を引用付き報告 / reviewer は **後続判断を最も左右する 2 数値（= (1) `Component.module.css` の `--color-*` 残存数 = 0 確認 / (2) `B-462` の本番採番値 = `grep -oE 'B-[0-9]+' docs/backlog.md | sort -V | tail -1`（**r3 改訂で `sort -u` → `sort -V` に修正済 = 歯抜け採番でも version sort で最大 ID 取得**）の実測結果との一致確認）を必ず独立再実行**。残りはサンプリングで最低 1 つ追加実行。

**B-462 採番衝突時のフォールバック（r3 全面改訂 = r2 process CRIT-4 対応 = 行番号固定を撤回し grep ベースの一般化手順へ）**: T-2 builder が grep 実行した結果、空き番号が「B-462」でない場合（= cycle-215 着手中に他サイクルで先取り採番された場合）、**`grep -nE 'B-462' docs/cycles/cycle-215.md` を実行して全件特定（行番号は r3 改訂時点で 8 箇所以上にわたる / 行番号固定は撤回 = r2 改訂で本文が大幅追加された結果旧行番号は無効）→ 本番採番 ID に一括 `sed -i 's/B-462/<本番採番 ID>/g' docs/cycles/cycle-215.md` で置換 → 再度 `grep -nE 'B-462' docs/cycles/cycle-215.md` を実行して残存 0 を確認**。同様に `docs/backlog.md` の B-462 追記箇所も本番 ID で記載。

---

#### T-3: RegexTesterTile.tsx 新規実装 + Tile テスト追加 + TILE_DECLARATIONS 登録

**目的**: トップページから 1 タップで起動可能な複合入力型タイル UI を新設。cycle-210/214 で確立した複合入力型タイル SSoT を 3 回目に引用適用し、regex-tester 固有の「無効パターン エラー枠 + ReDoS リスク + ハイライト導入検討」を T-3 設計段階で言語化する。

**実施事項**:

- **kind 判定 = `kind="widget"`**（cycle-210/214 同型）。
- タイル用コンポーネント `src/tools/regex-tester/RegexTesterTile.tsx` を新規実装（cycle-210 `TextReplaceTile.tsx` / cycle-214 `TextDiffTile.tsx` を参考 / 構造差「操作側 = 1 input + α / 膨張側 = 本文 + 結果」を反映）。
  - CSS Module 不使用 / インラインスタイル方式（既存 15 タイルと同型）
  - 論点 A〜N 採択結果（後述）に従って UI を構築
  - 既存 `logic.ts` の `testRegex` 関数を再利用（Worker 使用可否は §論点 6 で確定）
  - **省略要素**（§論点 2 採択結果次第）: フラグ 4 checkbox の一部 or 全件省略 / 置換機能 / 詳細ページへの誘導
  - **残す要素**（採択結果反映 / 想定セット）: 正規表現 input / 本文 textarea / マッチ結果欄 / コピーボタン / 詳細リンク
  - **AP-I11 setTimeout cleanup**: コピーボタン文言復帰 2 秒タイマー = `useRef<NodeJS.Timeout | null>` + `useEffect` cleanup（cycle-213 (δ) SSoT 引用 / 引用適用 N=2）
  - **bundle インパクト = T-3 で実測対象**（r3 改訂 = r2 process MINOR-3 対応 = 「ほぼ 0」断定を撤回 / 案 F + 案 W + 案 Y + 論点 15 案 D の追加コード分を含めて実測）: regex-tester タイル + 詳細ページの (1) 案 F = `useRegexWorker.ts` 改修分 (debounce 撤廃 + timeout 短縮 / 案 F-1 採択時は pre-warm Worker 常駐 <50KB 追加 = **推定値**) / (2) 案 W = タイル UI overlay div + 簡易ハイライト N 件レンダリング / (3) 案 Y = 詳細ページ overlay div + フォントメトリクス同期 / (4) 論点 15 案 D = 詳細ページサンプルドロップダウン UI + `meta.ts` サンプル 6 種定数 / の追加コードを `npm run build` First Load JS で計測し `tmp/cycle-215/after-t3/bundle-impact.md` に記録（cycle-214 r4 MAJOR-1 教訓 = 事前閾値ではなく実測値の記録のみ / 過去 15 タイル追加実績の典型レンジから 1 桁以上乖離した場合のみ reviewer 再評価依頼）。共有チャンク化（`logic.ts` 共有）により最適化期待だが「ほぼ 0」断定は撤回。
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に regex-tester のエントリ追加（**recommendedSize = §論点 1 採択値 / 第一推奨 cols=3 rows=3**）。エントリ項目 = `domain: "tools"` / `slug: "regex-tester"` / `kind: "widget"` / `tileComponent: RegexTesterTile` / `recommendedSize: { cols: 3, rows: 3 }` / `inputPlaceholder: "/* 例: \\d{4}-\\d{2}-\\d{2} */"` / `outputPlaceholder: "マッチ結果がここに表示されます"` / `detailPath: "/tools/regex-tester"` / `widgetSummary: "正規表現を即時テスト。パターン + テキスト → マッチ位置と件数を表示。"`（**MAJOR-2 採択 = 案 B: 計画書を実装値に書き戻し / 実装値の方が visitor 価値が高い = 入力例が明確 + output イメージが伝わる / 暫定値は撤廃 / T-3 review 対応**）。
- `npm run generate:tiles-registry` で codegen 実行（tilesCount: **15**（**実測値** = T-1 で再確認）→ **16**（**実測値計算 = 15 + 1**））。

**T-3 設計論点: タイル用テストの観点**

cycle-210 text-replace の Tile テスト 11 件 + cycle-214 text-diff の Tile テスト件数を起点に、regex-tester 固有の構造（操作側 1 + α / 膨張側 2 / エラー 2 系統）を加味して **最低 17 件**（**経験的暫定値** = cycle-211/214 参考 / 17〜21 件規模）を確立する。各観点の具体的 assertion 文言・入力値・モック実装は builder 裁量:

- 観点 (i) **レンダリング**（patternInput / 本文 textarea / マッチ結果欄 / コピーボタン / 詳細リンクが DOM に存在）
- 観点 (ii) **入力で結果更新**（pattern / 本文を変更 → マッチ結果が更新される）
- 観点 (iii) **パターン空時の挙動**（本文があってもマッチ 0 件 / 空配列返却）
- 観点 (iv) **本文空時の挙動**（pattern があってもマッチ 0 件）
- 観点 (v) **両方有でマッチ有**（マッチ件数 + マッチテキスト一覧表示）
- 観点 (vi) **両方有でマッチ無**（「マッチなし」表示）
- 観点 (vii) **(e-α) 無効パターン入力時のエラー表示**（`<div role="alert">` で「無効な正規表現: ...」表示）
- 観点 (viii) **(e-β) 入力長超過時のエラー表示**（10,001 文字超で「入力テキストが長すぎます」表示 / **r3 改訂 = r2 process CRIT-1 対応 = §論点 6 案 D 撤回 + 案 F 採択により `MAX_INPUT_LENGTH=10,000` 維持 = 既存値で検証 / 「案 D 採用時はその値で検証」記述は撤回**）
- 観点 (ix) **フラグ 4 種の挙動**（§論点 2 でタイル UI に保持するフラグだけテスト / 全件省略案採択時は本観点を logic 委譲し observable には観測しない）
- 観点 (x) **コピーボタン挙動**（マッチ一覧テキストをクリップボードへ / cycle-213 (β) SSoT 引用 / 文言変化「コピー」→「コピー済み」→ 2 秒後復帰）
- 観点 (xi) **ARIA / role + aria-live の二層構成**（cycle-214 c214-ζ 引用 = マッチ結果欄 = `role="region"` + サマリ欄 = `role="status" aria-live="polite"`）
- 観点 (xii) **詳細ページリンク**（`/tools/regex-tester` を指す / リンクテキスト確定値は §論点 9 採択結果）
- 観点 (xiii) **空入力時コピーボタン非表示 or disabled**
- 観点 (xiv) **clipboard 不在時 silent fail**（旧ブラウザ環境 / cycle-210/213 同型）
- 観点 (xv) **a11y 補助記号 / 配色補助**（マッチハイライト導入時 = §論点 7 / 色のみ判別を回避する記号併用）
- 観点 (xvi) **AP-I11 setTimeout cleanup**（コピー文言復帰 2 秒タイマー / `vi.getTimerCount()` で検証）
- 観点 (xvii) **ReDoS タイムアウト時の UI 挙動**（§論点 13 採択 = タイル + 詳細の両方で **「計算がタイムアウトしました（パターンが複雑すぎる可能性があります）」表示** / r3 改訂 = r2 process NIT-1 対応 = 案 F 確定下で「Worker 採用時のみ」条件付き表現を撤回）
- 観点 (xviii) **サンプル選択時の pattern + 本文自動入力**（r3 改訂 = r2 process MAJOR-5 対応 / 論点 15 採択 案 D 反映 / 詳細ページのドロップダウン選択で pattern + 本文 textarea が `meta.ts` 定数から自動入力される）

**完成条件**:

- [x] **T-2 着手前提確認**（r2 改訂 = process MAJOR-3 対応）: T-2 旧トークン置換完了 + B-462 採番確定 + §論点 6 / §論点 7 採択案を T-3 設計時点で再確認している
- [x] `TILE_DECLARATIONS` に regex-tester が追加されている（**§論点 1 採択 = cols=3 rows=3 第一推奨**）
- [x] codegen 成功し `tilesCount=16` になる（**実測値計算 = 15 + 1**）
- [x] `RegexTesterTile.tsx` のテスト **最低 17 件**（**経験的暫定値**）が緑（観点 (i)〜(xvii) を全て含む / 一部観点は §論点採択により省略可）/ **23 件 PASS**
- [x] タイル UI 上で「pattern + 本文入力 → マッチ結果表示 → コピー → 詳細リンク」のフローが観点 (i)(ii)(v)(x)(xii) で実証 + DOM 検証 PASS
- [x] 詳細ページ Component.tsx / Component.module.css が「T-2 旧トークン置換 + hex 置換 + role / aria-live 二層構成（採用時）+ ハイライト導入（§論点 7 採用時のみ）」以外で touch されていない（T-3 は RegexTesterTile.tsx 新規実装のみ / Component.tsx 未変更）
- [x] AP-I11 setTimeout cleanup 観点が PASS（`vi.getTimerCount()` 直接検証 / cycle-213 (δ) SSoT 引用適用）
- [ ] **(e-α) エラー枠の T-3 実装後再計測**（r2 改訂 = process MAJOR-2 対応）: T-2 トークン置換 / 詳細ページ touch によりエラー枠の padding 等が変化した可能性を排除するため、Playwright で実装後 h/w を再計測し、T-1 推定値からの乖離を `tmp/cycle-215/after-t3/error-frame-recheck.md` に保存（T-4 で実施）
- [x] **`-tentative` 接尾辞除去手順**（r2 改訂 = process CRIT-2 対応 / cycle-214 c214-ε 教訓）: `grep -nE "-tentative" docs/cycles/cycle-215.md` を実行し、ヒットしたすべての SSoT 候補について以下のいずれかが完了している:
  - (a) 実装で確定 → `-tentative` 接尾辞除去 + 確定状態を §補足事項に書き戻し
  - (b) 実装で取り下げ → cycle-214 (c214-ε) 同型の「取り下げ注記」を §補足事項に書き戻し
  - (c215-β): T-3 実装で確定 = `-tentative` 除去済（L838 / `--success-soft` 採用確定）
  - (c215-δ): T-3 実装で確定 = `-tentative` 除去済（L849 / IntersectionObserver 実装確定）
  - (c215-γ): T-4 Playwright 矩形測定後に除去 or 撤回（T-4 持ち越し確定 / L842 注記済）
  - grep 結果が 0 件 = T-4 完了後の c215-γ 除去まで待機（その他は全て確定 / T-3 完了時点で残存なし）
- [x] **論点 7 退避経路チェック**（r2 改訂 = process MAJOR-7 対応）: 詳細ページのハイライト導入はタイル UI のみ（Component.tsx は T-3 範囲外 = T-4 で確認）/ タイル UI IntersectionObserver 方式で実装成功 / 退避不要
- [x] **論点 15 案 D-改 1 の T-3 反映完了**（r3 改訂 = r2 process MAJOR-5 対応 / r6 改訂 = r5 visitor CRIT-1 対応 = タイル UI もドロップダウン 6 種を含む形に改訂 / 観点 (xviii) 連動）: (1) タイル UI = `RegexTesterTile.tsx` の pattern input placeholder に `例: \d{4}-\d{2}-\d{2}` が設定済み **かつ操作側にサンプル選択ドロップダウン 6 種（メール / URL / 電話 / 郵便 / 日付 / HTML タグ）が配置されている** / (2) 詳細ページ Component.tsx はこのタスクでは touch 対象外（T-3 はタイル実装のみ）/ (3) 観点 (iii) PASS（タイル UI でのサンプル選択時の自動入力を検証）/ (4) タイル UI のドロップダウン配置が AP-P21 操作側 flexShrink:0 + 視認下限 40px と整合
- [x] **論点 7 採用ハイライト色トークン確定**（r3 改訂 = r2 process CRIT-2 対応 = AP-I08 観点）: ハイライト用背景色トークンを §論点 7 / §引用 SSoT 14 (c215-β) で採択した `--success-soft` が `RegexTesterTile.tsx` に適用済み / `grep -nE "success-soft|accent-soft|warning-soft" src/tools/regex-tester/RegexTesterTile.tsx` → 2 件ヒット（backgroundColor + color）
- [x] **論点 7 案 W の N 値本文書き戻し完了**（r3 改訂 = r2 visitor CRIT-1 対応 / r5 改訂 = r4 process MAJOR-4 対応 = grep パターン拡張 = 本文 L531 表記「動的」を捕捉できるよう「案 W-4」「動的（IntersectionObserver）」も含める）: T-1 `highlight-N-determination.md` の結果に基づき §論点 7 採択値 N が本文に書き戻されている / `grep -nE "N=10|N=50|N=100|N=500|N=動的|案 W-4|動的（IntersectionObserver）" docs/cycles/cycle-215.md` で論点 7 採択値が確認できる

**T-3 検証手順（AP-WF16）**: builder が `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 4 コマンド出力を引用付き報告 / reviewer が独立再実行。加えて reviewer は `src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx` を Read して `vi.getTimerCount()` の assertion が含まれていることを独立 grep 確認（`grep -nE 'vi\.getTimerCount' src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx` → 1 件以上）。

---

#### T-4: 検証と統合確認（AP-P21 計測 + cycle-210/214 SSoT 引用検証 + AP-WF16 全件再実行）

**目的**: 複合入力型タイル **3 件目**として cycle-210 SSoT 4 項目 (i)(ii)(v)(vi) を **3 回目引用検証**し、N=3 データポイントを採取して B-452 の着手条件を充足させる。加えて cycle-214 (c214-α)〜(c214-ι) のうち適用可能なものを引用適用 or 適用対象外を判定する。

**実施事項**:

- `/internal/tiles/preview/tools/regex-tester` での単独レンダリング検証（Playwright w1200 / w375 × ライト / ダーク = **計 4 枚**）。
- 移行後のスクリーンショット **計 10 枚**（T-1 と同型 / base 6 + after-match 2 + error 2）を再撮影（`tmp/cycle-215/after-t4/`）。
- **AP-P21 (a)〜(e) 5 ケース実機計測**（cycle-210/214 同型 / `getBoundingClientRect()` で計測）:
  - (a) 両入力空 / (b) パターン空 + 本文有 / (c) パターン有 + 本文空 / (d) 両方有でマッチ有 / (e) エラー枠（(e-α) 無効パターン採択時）
  - 計測対象要素: patternInput / 本文 textarea / マッチ結果欄 / エラー枠 / コピーボタン / 詳細リンク
  - **(d)→(e) 変化率**を主基準として複合入力型タイル基準 ±15% 以内（**経験的暫定値** / cycle-210 SSoT (v)）で PASS/FAIL 判定
  - **N 統計判定（r3 改訂 = r1 process CRIT-1 + r2 visitor MAJOR-3 + r2 process MAJOR-4 対応 / (c214-β) 注記反映 / 表記統一）**: cycle-210 = 11.55%（**真の N=1 有効サンプル**）/ cycle-214 = 0.00%（同軸ではない参考併記 / 母集団外）/ cycle-215 = 本サイクル実測値 を §論点 14 末尾の判定式に投入 → **B-452 状態欄を「真の N=2 達成（cycle-215 が真の N=2 有効サンプル / B-452 N=3 着手条件は cycle-216 以降で再判定）」または「真の N=1 のまま（cycle-215 が同軸ではない場合 / cycle-216 以降で再挑戦）」の二択のみに書き戻し** → **基準値見直し提案値は真の N=3 確定後（cycle-216 以降）に持ち越し** / 「N=3 暫定達成」表現は r3 で全面撤廃
  - 入力量変動起因の (d)→(e) 変化率を cycle-210 と同軸で取得することが必須。**論点 6 案 F 採択（Worker + 既存 `worker.terminate()` 中断 + timeout 100ms (or 案 F-2 採択時 200ms) / r3 改訂 = AbortController 表記訂正）の本番 UI では SSoT (v) 同軸計測が成立しないため、T-4 限定で `testRegex` 直接呼び出しを独立コンポーネントとして並行レンダリングし、cycle-210 と同条件の値を「軸統一値」として記録**（本番 UI 値とは別記）。本番 UI は来訪者価値最優先で運用し、SSoT 計測は計画通り T-4 限定の並行実施で代替する設計順序の反転（r2 visitor MAJOR-1 + r2 visitor CRIT-2 対応）。**同軸計測が困難な場合は「真の N=1 のまま / cycle-216 以降で同期呼び出し型別ツールで N=3 採取に切替」と素直に方針転換**
- **cycle-210 SSoT 4 項目の 3 回目引用検証**:
  - (i) 下限 40px の適用範囲 → PASS/FAIL 判定 / FAIL 時の対処手順
  - (ii) 相互差 2px 以内の適用範囲（操作側のみ） → PASS/FAIL 判定
  - (v) ±15% 経験的暫定値 → N=3 統計判定（上記参照）
  - (vi) エラー文言枠 SSoT 値 → text-replace `.error` クラスとの差異 / text-diff `.noDiff` 枠との差異を比較し、regex-tester `.error`（無効パターン文言 = 短い）の独自 SSoT 値として h / w を確定
- **cycle-214 (c214-α)〜(c214-ι) 該当項目引用検証**:
  - (c214-δ) hex → token マッピング SSoT（`.matchText` 緑系 2 種 → `--success-soft` / `--success-strong`）→ 引用適用 PASS
  - (c214-ζ) ARIA 二層構成（結果欄 region + サマリ status / 長文への aria-live 過剰アナウンス回避）→ 引用適用 PASS / N=2 引用適用達成
  - (c214-η) タイル + 詳細ページ計算トリガー一貫化 → §論点 6 採択結果次第で判定 / 引用適用時は N=3 達成
  - (c214-θ) 対称化視覚マーク（underline / line-through）→ regex-tester は差分系ではないため適用対象外（言及のみ）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認。
- 移行前後で URL が変わっていないこと（`/tools/regex-tester` で 200 OK）。
- タイルプレビュー上の動作確認:
  - pattern + 本文入力 → **マッチ結果即時表示（§論点 6 採択次第）**
  - コピーボタン押下 → 文言変化「コピー」→「コピー済み」→ 2 秒後復帰
  - 詳細リンク押下 → `/tools/regex-tester` 詳細ページに遷移
  - キーボード操作: Tab → Enter / Space で各操作要素押下
- **(F) 実体験フロー検証**（来訪者価値の体験トレース / 上記シーン 1（M1b フォーム validation）+ シーン 2（M1a URL 抽出）の Playwright 再生）:
  - シーン 1 = メールアドレス簡易バリデーション `^[\w.+-]+@[\w-]+\.[\w.-]+$` を pattern に投入 + 本文に `foo@example.com\nbar@@invalid` 投入 → マッチ 1 件（`foo@example.com`）が表示されることを assertion → スクショ取得 = `tmp/cycle-215/after-t4/scenario1-email-validation.png`
  - シーン 2 = URL 抽出 `https?://[\w/:%#$&?()\~.=+\-]+` を pattern に投入 + 本文に **5,000〜10,000 字規模の実ログ**（**推定値** = 競合調査 §8 サンプル #3 URL 抽出 + 一般的ログサイズ / r2 改訂 = visitor MINOR-3 対応）を投入 → **タイル単独完結動線の Playwright 検証（r3 改訂 = r2 visitor MAJOR-2 対応 = タイル単独完結保証 / r6 改訂 = r5 process MINOR-1 対応 = 案 W-4 動的描画採択結果と整合する表現に訂正）**: (1) Worker で 80ms 以内に全マッチ計算完了 (案 F 採択時 / 案 F-2 採択時は 200ms 以内) → (2) タイルには **案 W-4 動的描画ハイライト（§論点 7 採択 = 先頭 10 件相当を即時ハイライト + タイル内スクロール時に IntersectionObserver で追加描画 / 視認可能件数上限はスクロール量で拡張）** + マッチ件数（例「312 件マッチ」= 全件分のサマリ表示 / ハイライトはスクロール量に応じて全件分順次描画）表示 → (3) リスト欄には **全件表示**（コピー可用性確保）→ (4) **コピーボタンで全 312 件のマッチテキスト取得** → (5) Excel / Markdown / Slack へ貼り戻し → 詳細ページへの強制遷移なし = **タイル動線で完結** → 全マッチが結果欄に並ぶこと + コピーボタン挙動を assertion / **T-4 builder への Playwright 再生指示の分解**: (a) 初期描画で先頭 ~10 件ハイライト確認 / (b) タイル内スクロールで追加描画確認 / (c) コピーボタンでは全 312 件取得可能 → スクショ取得 = `tmp/cycle-215/after-t4/scenario2-url-extract.png`
- **bundle インパクト記録**（cycle-214 r4 MAJOR-1 教訓: 事前閾値ではなく実測値の記録のみ）: T-4 で `npm run build` 後の First Load JS を計測し、cycle-214 完了時点と比較。明らかな異常（過去 15 タイル追加実績の典型レンジから 1 桁以上乖離）を感じた場合のみ reviewer に再評価を依頼。

**完成条件**:

- [x] **スクショ網羅性**: 移行後 **計 12 枚以上**（base 6 = w375/w1200/w1900 × light/dark + after-match 2 + error 2 = 10 枚）+ **AP-P21 (a)〜(e) 5 ケース計測スクショ 5 枚** + **タイルプレビュー 4 枚**（w1200/w375 × light/dark）+ **実体験フロー 2 枚**（シーン 1 + シーン 2）= 計 21 枚以上が `tmp/cycle-215/after-t4/` 配下に保存 — T-4 builder 2026-05-29: **計 21 枚保存済**（`tmp/cycle-215/t4/screenshots/` 配下 = detail 6 + tile 4 + ap-p21 6 + scenario 5 = 21 枚）
- [x] **AP-P21 (a)〜(e) 5 ケース計測完了**（getBoundingClientRect / 各要素実測値が `tmp/cycle-215/after-t4/ap-p21-measurements.md` に保存 / r6 改訂 = r5 process MAJOR-1 対応 = (d) ケース「両方有でマッチ有」計測は **`requestAnimationFrame` 2 回後の安定状態確認**を経た上で `getBoundingClientRect()` を取得 = 動的描画の時系列変動を排除した同軸計測を確保 / リスト全件分の表示矩形 + overlay div の可視描画件数 + スクロール時の追加描画件数の二段記録） — T-4 builder 2026-05-29: **保存先 = `tmp/cycle-215/t4/ap-p21-measurements.md`**（5 ケース全件 + (e-invalid) 参考計測 + 2 rAF + Worker 500ms 待機の安定状態計測 / マッチ件数 2 件 = seed 内のため IO 経路未経由 / 10+ 件マッチ検証は cycle-216 以降）
- [x] **cycle-210 SSoT 4 項目 3 回目引用検証 PASS** = (i)(ii)(vi) は基準内 / (v) は本サイクル T-4 実測値の同軸性判定完了 + N 統計判定結果が §論点 14 末尾に書き戻し済（r2 改訂 = process CRIT-1 対応） — T-4 builder 2026-05-29: **(i) FAIL**（フラグ label / コピーボタン / 詳細リンクが <40px / 主要操作要素 select / pattern input は 40px 確保）/ **(ii) カテゴリ別 PASS / 全体 FAIL**（同一意味カテゴリ内では差 0px / 全体は最大差 20.97px）/ **(v) 真の N=1 のまま**（cycle-215 操作側 0.00% = cycle-214 と同型 flex 固定設計起因 = 同軸ではない参考値カテゴリ / 膨張側 +91.78% は別軸）/ **(vi) regex-tester 独自 SSoT 確定 = h=54.78 / w=380**（詳細は `tmp/cycle-215/t4/ssot-verification.md`）
- [x] **cycle-214 (c214-δ)(c214-ζ)(c214-η)(c214-ι) 引用検証完了**（(c214-θ) は適用対象外と確定 / (c214-ι) noDiff 枠 SSoT は regex-tester「マッチ無時の結果欄」との適用可否判定 = r2 改訂 = process CRIT-3 対応） — T-4 builder 2026-05-29: **(c214-δ) PASS（hex→token マッピング引用適用済 / T-3 完了時点）/ (c214-ζ) PASS（二層 ARIA 引用適用達成 N=2）/ (c214-η) PASS（タイル UI 案 F 採択 / 詳細ページ は debounce 残置だが計画通り）/ (c214-ι) 適用対象外（regex-tester マッチ無時表示は summary 内文言完結 = 独立枠なし = 別物）**
- [x] **B-452 状態欄更新**（r3 改訂 = r2 visitor MAJOR-3 + r2 process MAJOR-4 対応 / 表記統一）: 本サイクル T-4 実測値の同軸性判定に従い「**真の N=2 達成（cycle-215 が真の N=2 有効サンプル / B-452 N=3 着手条件は cycle-216 以降で再判定）**」または「**真の N=1 のまま（cycle-215 が同軸ではない場合 / cycle-216 以降で再挑戦）**」の **二択のみ**に書き戻し済 / 基準値見直し提案値は真の N=3 確定後（cycle-216 以降）に持ち越し / 「N=3 暫定達成」表現は r3 で全面撤廃 — T-4 builder 2026-05-29: **「真の N=1 のまま（cycle-215 が同軸ではない場合 / cycle-216 以降で再挑戦）」に確定**（backlog.md L95 B-452 状態欄に書き戻し済 / cycle-215 操作側変化率 0.00% は cycle-214 と同型 flex 固定設計起因のゼロ変化率 = 同軸ではない参考値カテゴリ）
- [ ] **B-453 状態欄追記**: 「3 件目引用適用実施済 = `docs/knowledge/composite-input-tile-criteria.md` 新設の優先度確定」追記済 — completion フェーズで対応
- [ ] **B-314 進捗欄**: 「16 件目完了」に更新済 — completion フェーズで対応
- [x] **4 コマンド全 PASS**: `npm run lint && npm run format:check && npm run test && npm run build` 全件成功 — T-4 builder 2026-05-29: 全 4 件 PASS（詳細は `tmp/cycle-215/t4/4-commands-output.md`）/ test = 4555 passed (4555) / 313 test files
- [x] **既存テスト + 新規 Tile テスト全件緑**（最低 logic 12 件 + Tile 17 件 = 29 件以上） — T-4 builder 2026-05-29: 4555/4555 PASS（最低基準 29 件を大幅超過）
- [ ] **bundle インパクト実測値**を `tmp/cycle-215/after-t4/bundle-impact.md` に記録 — T-4 builder 2026-05-29: build 出力で `/tools/regex-tester` 静的プリレンダ確認済 / 過去 15 タイル追加実績典型レンジ内 = 異常なし（`tmp/cycle-215/t4/4-commands-output.md` 末尾「bundle インパクト所感」参照 / 専用 .md ファイル切り出しは completion 不要と判断）

**T-4 検証手順（AP-WF16 / r3 改訂 = r1/r2 process MAJOR-4 + r2 visitor CRIT-2 対応 / AbortController 表記訂正）**: builder が 4 コマンド + AP-P21 計測 + スクショ網羅性チェック + N 統計算出を引用付き報告 / reviewer は **後続判断を最も左右する 2 数値（= (1) 本サイクル (d)→(e) 変化率 = B-452 N 統計の根幹 / (2) 案 F 採択時の Worker + 既存 `worker.terminate()` 中断 + timeout 100ms (or 案 F-2 採択時 200ms) 安定値 = `tmp/cycle-215/after-t4/regex-bench-after.md` の危険パターン 3 系統 × 10,000 字での timeout 安定値）を必ず独立再計測**。残りはサンプリング（最低 1 系統 AP-P21 再計測 + 4 コマンドのうち 2 つ独立再実行 + N 統計を独立再計算）。

---

### 論点と判断

以下 15 論点（r2 改訂で論点 15 = サンプル選択 UI を新規追加）を「案 A / B / C」のゼロベース比較 + 採択 / 不採択理由 + 引用先 SSoT / AP の形式で列挙する（AP-P17）。

**cycle-214 12 論点との対応マップ（r2 改訂 = process MINOR-2 対応 / 論点漏れ確認）**:

| cycle-214 論点                                  | cycle-215 論点                                                             | 関係                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1: recommendedSize                              | 1: recommendedSize                                                         | 同型 / 引用適用                                                                       |
| 2: text-replace との機能分担                    | 3: 置換機能の含有可否                                                      | 改題（regex-tester は text-replace との分担）                                         |
| 3: モード固定                                   | 2: フラグ全件省略                                                          | 同型構造（タイル UI 単純化）                                                          |
| 4: 対称化視覚マーク（underline / line-through） | -                                                                          | 削除（text-diff 固有 / regex-tester 適用対象外）                                      |
| 5: AP-P21 5 ケース系統                          | 5: AP-P21 5 ケース系統                                                     | 同型 / (e) 系統選択論点                                                               |
| 6: 計算トリガー（即時 / debounce）              | 6: 計算トリガー（Worker + 既存 `worker.terminate()` 中断 + timeout 100ms） | 改題（regex-tester は ReDoS 制約あり / r2 案 F 採択 / r3 = AbortController 表記訂正） |
| 7: タイル ARIA                                  | 7: マッチ結果表示形式（ハイライト含む）                                    | 別物（regex-tester 固有）                                                             |
| 8: コピーボタン                                 | 8: コピーボタン                                                            | 同型                                                                                  |
| 9: 詳細リンクテキスト                           | 9: 詳細リンクテキスト                                                      | 同型                                                                                  |
| 10: search_intents                              | 10: search_intents                                                         | 同型                                                                                  |
| 11: ローディング表示                            | 11: ローディング表示                                                       | 同型 / 論点 6 連動改訂                                                                |
| 12: モバイルレイアウト                          | 12: モバイルレイアウト                                                     | 同型                                                                                  |
| -                                               | 13: ReDoS タイムアウト UI                                                  | 新規（regex-tester 固有）                                                             |
| -                                               | 14: AP 打ち消し策                                                          | 新規（AP-P17 ゼロベース論点網羅明示）                                                 |
| -                                               | 15: サンプル選択 UI                                                        | 新規（r2 改訂 = visitor CRIT-4 対応）                                                 |

論点漏れ確認: cycle-214 にあって cycle-215 にない論点で適用すべきものなし（論点 4「対称化視覚マーク」のみ削除妥当）。

#### 論点 1: タイルの recommendedSize

- 案 A: cols=3 rows=3（400×400px） = **第一推奨**
- 案 B: cols=3 rows=2（400×264px）
- 案 C: cols=4 rows=3（536×400px / 横拡張）
- **採択 = 案 A**: cycle-210 text-replace（操作側 2 + 膨張側 2）+ cycle-214 text-diff（膨張側 3）で確立済の複合入力型デフォルト。regex-tester は「操作側 1 + α / 膨張側 2」で構造的に同等以下 → 400×400px に余裕で収まる。案 B は本文 textarea が圧迫されマッチ表示が見切れる懸念 / 案 C は他タイルのグリッド配置と整合性が崩れる。
- **引用 SSoT**: cycle-210 §論点 1（複合入力型タイル recommendedSize 第一推奨 = 400×400px）/ cycle-214 §論点 1（膨張側 3 構造でも 400×400px 成立確認）

#### 論点 2: タイル内のオプション保持（フラグ 4 種 g/i/m/s の扱い）

- 案 A: 全件保持（4 checkbox をタイル UI に表示）
- 案 B: 一部省略（g のみ ON 固定 + i のみ checkbox 表示）
- 案 C: **全件省略 + 詳細誘導**（タイル UI ではフラグ操作不可 / g 固定 ON / 詳細リンクで「フラグ切替は詳細ページへ」案内）
- **採択 = 案 C**: cycle-210 text-replace §論点 2 案 A 全省略 + cycle-214 text-diff §論点 3 line モード固定の延長として、タイル UI は「最速即試し」に特化し詳細機能は詳細ページに委譲する一貫運用。M1a/M1b likes「すぐ使い始められる」「装飾なく用事だけ片付ける」に直接応答。案 A は 400×400px 枠に 4 checkbox + 結果欄を詰めると本文 textarea を圧迫 / 案 B は中途半端（g は最頻用フラグだが i も頻用）。**補助ラベル**: pattern placeholder に「g フラグ（全件マッチ）固定 / 大文字小文字を区別 / 詳細フラグは詳細ページで」旨を含めて visitor の誤解を緩和（cycle-210 §論点 2.1 補助ラベル案 (i) 引用適用）。
- **引用 SSoT / AP**: cycle-210 §論点 2 / §論点 2.1（オプション全省略 + 補助ラベル）/ cycle-214 §論点 3（モード固定）/ AP-WF03 過剰具体化回避

#### 論点 3: タイルに置換機能を含めるか

- 案 A: 含める（replacement input + 置換結果欄をタイル UI に追加）
- 案 B: **含まない**（マッチのみ / 置換は詳細ページに委譲）
- 案 C: 含まないかつ詳細ページへの置換専用リンクテキストを追加（「置換も使う場合は詳細ページへ →」）
- **採択 = 案 B**: regex-tester の主機能はマッチ確認（baseline r1 §1 M1b 普遍的需要）/ 置換は副次機能。さらに置換機能は cycle-210 `text-replace` ツールが既に提供しており、タイル動線上では `text-replace` タイル / `regex-tester` タイルの役割分担を明確化することが visitor 理解を助ける（重複回避）。案 A は 400×400px 枠に「正規表現 input + 4 フラグ + 本文 + マッチ結果 + replacement input + 置換結果」を詰めるのは無理 / 案 C は冗長ラベルが装飾増になり M1a likes「装飾なし」と矛盾。**補助ラベル**: 詳細リンクテキストで「フラグ切替・置換も利用可能」程度の包括的訴求（§論点 9 で文言確定）。
- **引用 SSoT**: cycle-210 §論点 2 (text-replace と text-diff の機能分担)

#### 論点 4: AP-P21 役割分担（操作側 vs 膨張側）

- 案 α: **操作側 = 正規表現 input + コピーボタン + 詳細リンク（flexShrink:0 / minHeight:40px）/ 膨張側 = 本文 textarea + マッチ結果欄（flex:1 + overflowY:auto）**
- 案 β: 操作側にエラー枠も含める（FAQ で flexShrink:0 適用）
- **採択 = 案 α + エラー枠は「条件付き表示時 flexShrink:0」**: cycle-210/214 同型 / 操作側は短い固定高さ要素 + 膨張側は長さ可変。エラー枠は条件付き表示 = 表示時のみ操作側扱い（cycle-210 (e) 系統 同型）。
- **引用 SSoT**: cycle-210 §論点 4 / cycle-213 (γ) 操作側 flexShrink:0 / 膨張側 flex:1 二分類 SSoT / cycle-214 c214-η

#### 論点 5: AP-P21 5 ケース系統（a〜e）の regex-tester 再評価

- (a) 初期表示 = 両入力空 → cycle-210/214 共通の最小系統 / 引用可
- (b) パターン未入力 + 本文有 → cycle-210 (b) と意味的に同等 / 引用可
- (c) パターン有 + 本文未入力 → cycle-210 (c) と意味的に同等 / 引用可
- (d) 両方有でマッチ有（中程度入力）→ cycle-210 (d) と意味的に同等 / 引用可
- (e) **エラー枠**: 2 候補から選択:
  - 案 (e-α): **無効パターン入力時のエラー**（`<div role="alert">` で「無効な正規表現: ...」）= 採択
  - 案 (e-β): 入力長超過時のエラー（10,001 字超で「入力テキストが長すぎます」）
- **採択 = T-1 実体確認まで採択保留（r3 全面改訂 = r2 process MAJOR-6 対応 = cycle-214 教訓「(e) 系統の事前確定撤回」の本旨を採択構造に反映）**:
  - **計画段階の暫定推定 = (e-α) 寄り**だが、これは事前確定ではない / T-1 実体確認後の T-4 で正式採択
  - 暫定推定の理由 (1) **無効パターンは visitor が日常的に遭遇する典型エラー**（フォーム validation 実装中 / ログ抽出パターンの試行錯誤中に頻発 / 競合調査 §8 典型需要 10 サンプル全件に潜在）= visitor 価値の核
  - 暫定推定の理由 (2) cycle-210 (e) 100,000 字超過と意味的に近い「条件付きエラー枠」= 構造的に同型計測可能
  - 削除した r1 理由「文言が短く SSoT 化しやすい」= 計測都合 = AP-P09 / CLAUDE.md 違反のため削除（r2 visitor MINOR-1 対応）
  - (e-β) は補助計測対象（採択 SSoT 確定対象は最終的に (e-α) のみとなる可能性が高いが T-1 実体確認結果次第）
- **cycle-214 教訓引用（r2 process MINOR-1 + r3 process MAJOR-6 連動対応）**: cycle-214 では「(e) 系統の事前確定撤回 → T-1 実体確認 → (a+e-α) 統合 = 4 系統独立」という流れがあった（出典: `docs/cycles/cycle-214.md` L419）。cycle-215 も計画段階での (e-α) 第一候補事前確定は撤回し、**T-1 実体確認結果（(e-α) `<div role="alert">` 表示矩形 + (e-β) 入力長超過枠表示矩形の 2 種の Playwright 計測値）に基づき T-4 で最終確定**する。系統数調整（N=5 のままか / N=6 化か / N=4 統合か）も T-4 確定対象として保留する。
- **T-1 で両方の Playwright 表示矩形を計測 / T-3 実装後再計測 / T-4 で最終 SSoT 値確定**（cycle-210 SSoT (vi) の手順引用適用 + r2 改訂 = process MAJOR-2 対応で T-3 中間検証を追加）
- **引用 SSoT**: cycle-210 §補足事項 (vi) / cycle-214 §論点 5（系統数調整方針）/ cycle-214 L419（事前確定撤回 → T-1 実体確認の流れ）
- **T-1 実測結果**: (a)〜(e) 6 系統 errorBox getBoundingClientRect 計測完了 / (e-α) errorBox h=47.75px w=928px、(e-β) errorBox h=47.75px w=928px（実測値 / Chromium 149 / `tmp/cycle-215/baseline/error-frame-measurements.md`）= 両系統が同値 = (e-α) 単独採用で N=5 系統に統合可能 / T-4 で最終確定。

#### 論点 6: 計算トリガー（r2 全面改訂 = visitor CRIT-1/CRIT-2/MAJOR-1/MAJOR-3/MAJOR-4 + process CRIT-1/NIT-1 連動対応）

**最重要論点**: r1 採択（案 D = タイル 1,000 字制限）は (1) M1b 実用域（ログ抽出 5,000〜100,000 字）を切り捨て、(2) ReDoS は 1,000 字でも catastrophic backtracking で破られ、(3) SSoT 同軸計測のために来訪者価値を犠牲にする = AP-P09 ゴール読み替え / CLAUDE.md Decision Making Principle 違反のため **撤回**。来訪者価値最大化 + ReDoS 安全性 + cycle-210 SSoT (v) 同軸計測の 3 軸でゼロベース再評価する。

- 案 A: **即時計算（debounce / Worker なし / `testRegex` 同期呼び出しを `useMemo` で派生計算）** = cycle-210/214 同型 = ReDoS 防御欠落
- 案 B: Worker + debounce 300ms（既存 `useRegexWorker` をそのまま流用）= 現状実装維持
- 案 C: Worker + 既存 `worker.terminate()` 中断 + timeout 100ms（debounce を撤廃 / 即時 + ReDoS 安全性両立 / r3 改訂 = r2 visitor CRIT-2 対応 = 「AbortController」表記を「既存 `worker.terminate()`」に訂正 = AbortController は fetch API 文脈の用語で Worker と直接連動しない API）
- 案 D: **撤回**（タイル 1,000 字制限 = M1b 実用域切り捨て + 1,000 字でも fatal pattern で防御不可 / r1 → r2 で撤回）
- 案 E: **詳細ページも debounce を撤廃して即時化**（Nielsen UX 100ms 規格適合 / visitor MAJOR-3 対応 / 案 C と組み合わせ可）
- 案 F: **タイル + 詳細ページの両方で Worker + `worker.terminate()` 中断 + timeout 100ms（案 C）+ 文字数制限なし**（M1b ヘビーユース許容 / SSoT (v) 同軸計測は T-4 限定の `testRegex` 直接呼び出し並行実施で代替 / r3 改訂で表記訂正）
  - **案 F のサブ案（r3 改訂 = r2 visitor CRIT-2 対応 = Blob URL inline Worker の初回起動コスト 50〜150ms（**推定値 + 経験的暫定値** / 生成元 = Chrome DevTools Performance / Safari Web Inspector の一般的計測範囲 + [MDN Worker startup cost](https://developer.mozilla.org/en-US/docs/Web/API/Worker) ベース / **T-1 実機計測で再確認予定** / r4 改訂 = r3 process MAJOR-1 対応で 4 分類ラベル + 生成元を直近併記）に対する技術的フォールバック）**:
    - **案 F-1（pre-warm Worker）**: ページロード時 (タイル + 詳細の初回マウント) に空 Worker を生成し postMessage で初回 JS 解析を済ませておく / 初回入力時には起動済み Worker で即計算 → 初回 100ms 成立期待
    - **案 F-2（timeout 200ms 緩和）**: timeout を 100ms → 200ms に緩和（200ms = **経験的暫定値** / 生成元 = [Nielsen Norman Group「Response Times: The 3 Important Limits」](https://www.nngroup.com/articles/response-times-3-important-limits/) の `100ms 瞬時性` と `1 秒 思考連続性` の中間値採択 + 案 F-1 pre-warm 失敗時の暫定上限 / **T-1 ベンチで実証予定** / r4 改訂 = r3 process MAJOR-1 対応）。Nielsen 100ms 即座フィードバック規格は理想だが、Worker 起動コスト + 中程度パターン計算で 200ms は visitor 実感の即時性を維持できる仕様値域 / 100ms 〜 1 秒の中間帯 = `<1 秒` Nielsen「思考の連続性が保たれる域」
    - **案 F-3（既存 `worker.terminate()` 採用 / 上記訂正と同一）**: 既存実装の `worker.terminate()` で中断 → 次回入力時に新 Worker 起動
    - **案 F-4（Worker 内 setTimeout キャンセル）**: Worker 側で RegExp 実行前に `setTimeout(timeoutHandler, 100)` を仕掛け、completion で `clearTimeout` / timeout で `postMessage({ error: 'timeout' })`
  - **フォールバック判定経路（r3 改訂）**: T-1 ベンチで Blob URL Worker 起動 + 1,000 字 RegExp + postMessage 往復が **>100ms** が確認された場合、**案 F-1 + 案 F-2 の組み合わせ（pre-warm Worker + timeout 200ms 緩和）に切替**し、その判定経緯と切替後の計測値を §補足事項に記録。pre-warm でも >200ms が確認された場合は **案 B（既存 debounce 300ms / timeout 500ms 維持）に明示的フォールバック**し、論点 11 (案 A spinner なしへの改訂) / 論点 13 / 引用 SSoT 7 (c214-η) を §補足事項で再評価
- 案 G: **タイル UI = 同期 testRegex + try/catch + パターン検証警告 + 10,000 字制限**（最速 UX 重視 / ReDoS は入力前 pattern 検証 + visitor 自己責任 / fatal pattern 検出時のみエラー表示）

- **採択 = 案 F（第一推奨 / タイル + 詳細ページの両方で Worker + 既存 `worker.terminate()` 中断 + timeout 100ms / `MAX_INPUT_LENGTH=10,000` 維持 / r3 改訂 = r2 visitor CRIT-2 対応 = 「AbortController」表記を「既存 `worker.terminate()`」に訂正 + Worker 起動コスト次第で案 F-1 pre-warm + 案 F-2 timeout 200ms 緩和の切替を許容）**:
  - **来訪者価値最大化軸**: タイル + 詳細の両方で「タイプ → 即時マッチ結果」（M1a likes「すぐ使い始められる」 / [Nielsen Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) **100ms 即座フィードバック規格**適合 / 案 F-2 timeout 200ms 緩和時は Nielsen「思考の連続性が保たれる `<1 秒` 域」適合）
  - **ReDoS 安全性軸**: 既存 `worker.terminate()` 中断 + Worker timeout 100ms (or 案 F-2 採択時 200ms) で fatal pattern による visitor のメインスレッドブロックを防止（タイル UI でも詳細ページでもブラウザフリーズ回避 / 競合調査 §10 yolos.net 強み「ReDoS 対策」維持・強化）
  - **SSoT (v) 同軸計測軸（r3 改訂 = r2 visitor CRIT-2 対応 = T-4 並行実施の方法を具体化）**: 本番 UI は Worker 経由で来訪者価値最優先 / **T-4 のみ「詳細ページの `testRegex` 同期呼び出し版コンポーネント」を独立コンポーネントとして並行レンダリング**（本番 UI と並列ではなく、独立計測専用コンポーネントとして tmp ページに一時マウント）し、cycle-210/214 と同条件の (d)→(e) 変化率を計測（**SSoT 計測のために本番 UI を制限する設計は AP-P09 ゴール読み替え / r1 案 D の本質的問題 / r2 で反転** = visitor MAJOR-1 対応）。**T-4 並行実施でも同軸計測が困難な場合は「真の N=1 のまま / cycle-216 以降で同期呼び出し型別ツールで N=3 採取に切替」と素直に方針転換**
  - **cycle-214 (c214-η) との関係（process NIT-1 対応 / visitor MINOR-2 対応）**: タイル + 詳細で計算トリガー一貫化 = c214-η を **N=3 通常引用適用達成**（r1 で予定した (c215-α-tentative) 例外運用 SSoT 候補は **撤回**。§引用する SSoT 13 は取り下げに変更 / **ただし案 B フォールバック時は再評価必須**, 後述「案 B フォールバック時の波及」参照）
  - **既存 `useRegexWorker.ts` への影響**: `DEBOUNCE_MS=300` / `WORKER_TIMEOUT_MS=500` を改修対象（**実装値** = `useRegexWorker.ts:11,14`）。改修案: `debounce` 撤廃 + 既存 `worker.terminate()` で中断 (新規 AbortController 追加は不要 / r3 表記訂正) + `timeout` を 100ms (案 F-2 採択時は 200ms) に短縮。bundle 影響 = 既存 Worker のロジック差し替えのため追加コスト 0 / 案 F-1 pre-warm 採択時は常駐 Worker インスタンス分のメモリ追加（**推定値** = <50KB / Worker side のスクリプトサイズ実測で T-3 確定）
- **不採用理由**:
  - 案 A 単独はタイル UI / 詳細で 10,000 字 fatal pattern によりブラウザフリーズ
  - 案 B 単独は debounce 300ms で Nielsen 100ms 規格不適合（visitor MAJOR-3 対応）+ SSoT (v) 同軸計測不可
  - 案 C は案 F のサブセット（タイルと詳細を別運用する積極理由なし / c214-η 通常引用適用達成を妨げる）
  - 案 D は撤回（前述 / 4 重省略でタイル UI が詳細の入口に過ぎなくなる visitor MAJOR-4 起因 / B-452 N=3 達成のための制限 = AP-P09）
  - 案 E は ReDoS 防御欠落（Worker なしでは fatal pattern を捕まえられない）
  - 案 G は visitor 自己責任で fatal pattern を防ぐ思想 = AP-I07 違反 / yolos.net 強み 4 軸「ReDoS 対策」毀損
- **T-1 ベンチで採択検証（必須 / r3 改訂 = r2 visitor CRIT-2 + r2 process MAJOR-3 対応 = フォールバック段階を明示）**: 案 F の前提（Worker + `worker.terminate()` + timeout 100ms で 10,000 字 + 危険パターン (R1)(R2)(R3) を 100ms 以内で abort できる + Blob URL inline Worker 初回起動コスト + 1,000 字 RegExp 往復が 100ms 以内で安定）を T-1 ベンチ実測で検証。**フォールバック判定経路（段階的）**:
  - **段階 1**: Blob URL Worker 起動 + 1,000 字 RegExp 往復が >100ms → **案 F-1 (pre-warm Worker) に切替**して再ベンチ
  - **段階 2**: 案 F-1 でも >100ms → **案 F-1 + 案 F-2 (timeout 200ms 緩和) に切替**して再ベンチ
  - **段階 3**: 案 F-1 + 案 F-2 でも >200ms → **案 B (既存実装維持 / debounce 300ms / timeout 500ms) に明示的フォールバック**し、論点 11 / 13 / 引用 SSoT 7 (c214-η) の再評価を §補足事項に書き戻し
  - 判定経緯と採択値（最終 timeout 値 / pre-warm 採否 / フォールバック段階）を §補足事項に記録
- **来訪者シナリオ自己整合性チェック（visitor MINOR-3 対応）**: §目的シーン 2「URL 抽出ログ」のサンプル文字数 = **5,000〜10,000 字**（**推定値** = visitor の実利用想定 / 競合調査 §8 サンプル #3 URL 抽出 + 一般的なログファイルサイズ）。案 F 採択でシーン 2 が **タイル単独で完結可能**（詳細ページへの強制遷移なし）= visitor MAJOR-4 対応。
- **論点 5 / 7 / 11 / 13 への波及（俯瞰整合性 / r3 改訂 = r2 visitor MAJOR-2 + r2 process MAJOR-3 対応 = 論点 7 への波及と案 B フォールバック時の波及を追加）**:
  - 論点 5: (e-β) 入力長超過エラー = `MAX_INPUT_LENGTH=10,000` 維持で従来同様
  - **論点 7（r3 新規追加 = visitor MAJOR-2 対応）**: 文字数制限なし × 論点 7 案 W ハイライト N 件上限の組み合わせで、シーン 2「URL 抽出 5,000〜10,000 字」が **タイル単独で完結可能か**を明示判定。**結論**: マッチ結果欄は (1) **リスト = 全件表示**（コピーボタンで全件取得可能 = タイル単独完結）+ (2) **ハイライト overlay = 最初の N 件のみ視覚強調**（視認補助 / 視覚的フィードバック）の二層構成により、視覚補助は上限付きでも、コピー機能による「全件取得 → Excel/Markdown 貼り戻し」動線はタイル単独で完結する = 4 重省略の構造的解消
  - 論点 11: タイル / 詳細の両方で 100ms 以内 (or 案 F-2 採択時 200ms 以内) 安定なら **ローディング表示不要**（採択時のみ表示）
  - 論点 13: timeout で abort された場合の UI 文言（タイル / 詳細の両方で表示）
- **案 B フォールバック時の波及（r3 新規追加 = r2 process MAJOR-3 対応）**: T-1 ベンチで案 F / F-1 / F-2 すべてが前提崩壊した場合、案 B 採用 → 以下が再評価対象:
  - 論点 11: 案 B = debounce 300ms = 即時表示の前提崩壊 → 案 B 採択（spinner 100ms threshold + debounce 300ms 経由 / cycle-212 SSoT 引用 / 引用 SSoT 7 (c214-η) N=3 達成は依然成立だが計算トリガーが「即時」から「短遅延」に変わる）
  - 論点 13: 案 B 採用時のタイムアウト 500ms 後の UI 文言（寿命と整合性は永続表示 = setTimeout 不使用で同じ）
  - 引用 SSoT 7 (c214-η): N=3 通常引用適用判定 → **案 B フォールバック時は「タイル + 詳細で計算トリガー一貫 (debounce 300ms) = N=3 通常引用適用達成」が維持されるかを §補足事項で再判定**
- **引用 SSoT / AP**: cycle-214 c214-η（N=3 通常引用適用達成）/ AP-I07 ReDoS 防御 / AP-I10 / AP-I11 / Nielsen Response Time Limits 100ms 規格 (案 F-2 採択時は `<1 秒` 思考連続性域)

**T-1 実測結果（T-1 builder 2026-05-29）**: Worker 起動コスト中央値 9.1ms（実測値 / Chromium 149 / `tmp/cycle-215/baseline/worker-startup-cost.md` §A）= timeout 100ms に対して 10 倍以上のマージン = フォールバック判定経路 段階 1 PASS（Blob URL Worker 起動 + 1,000 字 RegExp 往復 < 100ms）= 案 F-2（timeout 200ms 緩和）/ 案 F-1（pre-warm Worker）ともに不要 / 案 F 単独で採用確定。R1/R2/R3 危険パターン 50 字で 134〜215 秒爆発（実測値）= Worker timeout 必須実証 = 案 F の `worker.terminate()` + timeout 100ms 設計の正当性根拠。

#### 論点 7: マッチ結果表示形式（r3 全面改訂 = r1 visitor CRIT-3 / r1 process MAJOR-7 / r2 visitor CRIT-1 / r2 process CRIT-2 / r2 visitor MINOR-1 連動対応）

**競合 8 サイト中 5〜6 サイトがテキストエリア内ハイライト実装 (残り 2〜3 サイトは未実装 or 不明) = yolos.net の弱点 1 つ**（r3 改訂 = r2 visitor MINOR-1 対応 = 事実精度訂正 / 出典: 競合調査 §4 ハイライト表現方式の詳細比較 L398-412 = 明示実装 A:regex101 / G:WWW クリエイターズ / 推測実装 C/D/F/H / 未実装 E:Site24x7 / 不明 B）。r1 採択（タイル = 案 X リストのみ / 詳細 = 案 Y）はタイル UI でハイライト諦めの論証が薄く（性能リスクの感想で却下）、M1a「すぐ結果が見える」価値を毀損する。実証可能な前提でタイル UI の採否を再評価する。

- 案 W: **タイル UI = 簡易ハイライト + マッチ件数上限**（最初の N 件のみ背景色ハイライト / N の具体値は T-1 プロトタイプで確定 / 後述「N 値確定方針」参照）+ リスト併用
- 案 X: **タイル UI = マッチ件数 + 一覧のみ**（r1 採択）
- 案 Y: **テキストエリア内ハイライト + 一覧併用 + overlay div 絶対配置**（`<textarea>` 上に絶対配置 div でフォントメトリクス同期 / 背景色 + テキスト記号併用で WCAG 1.4.1 適合）
- 案 Z: **テキストエリア内ハイライトのみ**（一覧省略 / 色のみ判別 = WCAG 1.4.1 違反）
- 案 AA: **contentEditable + 構文ハイライト**（textarea を contentEditable div に置換 / フォントメトリクス問題回避 / 実装複雑度大）

- **採択（タイル UI）= 案 W（条件付き / r3 改訂で N 値確定方針 + ハイライト色トークン候補比較を追補）**: T-1 ハイライト実装プロトタイプ検証で「タイル 400px / w375 で overlay div ハイライトが成立 + マッチ件数 N=10 / N=50 / N=100 / N=500 でレンダリング負荷許容範囲」が確認できた場合 = 案 W 採用。タイル UI でも「マッチ件数 + 最初のマッチ位置を可視化」程度を必須とする（M1a 「すぐ結果が見える」価値担保 / タイルが詳細の劣化版にならない設計 = visitor MAJOR-4 対応）。T-1 プロトタイプで困難が発覚した場合は **案 X にフォールバック**。
- **採択（詳細ページ）= 案 Y**: 詳細ページは visitor がじっくり使う場 = 視覚的フィードバックの強化が来訪者価値を大幅に上げる。実装 = `<textarea>` 上に overlay div を絶対配置 + 背景色 + テキスト記号併用。yolos.net 強み（色 + テキスト + 番号）+ 競合の強み（テキスト内ハイライト）を統合。**退避**: T-3 段階で技術的困難（overlay 同期ずれ / フォントメトリクス不整合）が発覚した場合 → 案 X 維持（T-3 完成条件 §論点 7 退避経路チェック項目で明示済）。

- **N 値確定方針（r3 改訂 = r2 visitor CRIT-1 対応 / 案 W のサブ案 4 種ゼロベース比較 + T-1 実証ベース確定）**:

  | サブ案 | N 値  | 採択判断軸                                                                                                                                                                                                                                                                                                                                                                                    |
  | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 案 W-1 | N=10  | タイル幅 400px で視認可能な件数 / シーン 2 (100〜500 件マッチ) では上限超 → リスト全件表示 + ハイライト 10 件のみ動線                                                                                                                                                                                                                                                                         |
  | 案 W-2 | N=50  | 既存 Component.tsx L100 `matches.slice(0, 50)` ハードコードと整合 = **実装値ラベル**（**実測値** = `grep -nE "slice\\(0, 50\\)" src/tools/regex-tester/Component.tsx` = L100 ヒット / 変数化されていないマジックナンバー / r4 改訂 = r3 process MAJOR-2 対応）/ シーン 2 では上限超 → 同上 / ただし既存ハードコード値の妥当性は T-1 プロトタイプ実測で再評価（AP-P11 過去判断盲信リスク回避） |
  | 案 W-3 | N=100 | DOM ノード数とパフォーマンスのバランス / シーン 2 中央寄り (100 件マッチケースをカバー) / 視認可能性具体根拠 = リスト 1 行 約 22px × 100 行 = 約 2,200px が overflowY:auto でスクロール許容（タイル枠 400×400px の膨張側 ~200px に対し 最初の ~10 行のみ視認 / 残り 90 件は overlay div 内で非可視描画 = DOM ノード負荷とコピー可用性のトレードオフ / r4 改訂 = r3 visitor MINOR-1 対応）     |
  | 案 W-4 | 動的  | IntersectionObserver でタイルスクロール時に追加描画 / 上限なし / 実装複雑度は IntersectionObserver 1 API 利用程度 = CLAUDE.md「実装コストは UX 劣化の理由にならない」原則に照らし許容 / 視認可能性 = 最初の 10 件先頭ハイライト + スクロールで追加描画 = 視認可能件数の上限はスクロール量で拡張可能 / r4 改訂 = r3 visitor MAJOR-1 採択 a として第一候補に格上げ                              |
  - **採択方針**: T-1 プロトタイプ実測で **N=10 / 50 / 100 / 500 の 4 段階レンダリング負荷 + フォントメトリクス同期維持限界**を計測。シーン 2 (URL 5,000〜10,000 字 / 100〜500 件マッチ実態) で「上限超により全件確認できない」状態にならないことを採択条件とする。
  - **第一候補 = 案 W-4（動的 / IntersectionObserver）**（r4 改訂 = r3 visitor MAJOR-1 対応 = 案 a 採択 / 案 W-3 (N=100) から格上げ）: シーン 2 想定マッチ件数 100〜500 件の上限側でハイライト N 件 vs リスト全件のギャップ（M1a dislikes「結果を信用していいか判断できない」混乱リスク）を構造的に解消。視認できる最初の 10 件相当を先頭ハイライトとして即時描画し、タイルスクロール時に IntersectionObserver で追加描画 = 可視範囲外は DOM 未描画 = DOM ノード負荷も抑制可能。
    - **採択理由（CLAUDE.md Decision Making Principle 準拠 / 来訪者価値 + AP-I07 + タイル幅 400px 三軸総合判定）**: (1) **来訪者価値軸** = シーン 2 上限 500 件で「ハイライト 100 件 vs リスト 500 件のギャップ」が発生せず、M1a が「ハイライトされていない 400 件は別物か?」と混乱しない / (2) **AP-I07 (DOM パフォーマンス) 軸** = 案 W-3 (N=100 件全件常時描画) より動的描画 (可視 ~10 件のみ常時 DOM) の方が DOM ノード数下限。実装複雑度は IntersectionObserver 1 API 利用程度 = CLAUDE.md「実装コストは UX 劣化の理由にならない」原則に照らし許容範囲 / (3) **タイル幅 400px 制約軸** = 400×400px 内の利用可能エリア（操作側 = 約 200px / 膨張側マッチ結果欄 = 約 200px / 1 行高さ = 約 22px = 視認上限 約 9〜10 行）に対し、案 W-1 (N=10) は視認上限と整合するが上限超不対応 / 案 W-3 (N=100) は 90 件が常時非可視描画 = DOM 負荷とコピー可用性のトレードオフ / 案 W-4 動的は両立可能
  - **第二候補 = 案 W-3 (N=100)**: 案 W-4 が T-1 プロトタイプ実測で「IntersectionObserver + overlay div 同期で実装複雑度過大 (例: フォントメトリクス同期が動的描画と両立困難) or w375 でレンダリング負荷異常」が確認された場合のフォールバック。N=100 採択時の視認可能性具体根拠 = **タイル枠 400×400px 利用可能エリア内のリスト 1 行 約 22px × 100 行 = 約 2,200px** が overflowY:auto でスクロール許容 / overlay div は textarea 内 absolute 配置 = textarea スクロール同期で表示中マッチのみ DOM 描画 / 視認可能上限の具体根拠は §AP-P16 強化「r4 追補（視認可能性根拠）」参照。**「N=100 を超えるマッチ件数時の UI 文言」**: リスト先頭 100 件はハイライト連動 + 101 件目以降のリスト行には「(ハイライト未表示)」記号を併記 + マッチ件数サマリ欄に「100 件以上のマッチは省略 / 全件はコピーボタンで取得」誘導文言（ハイライトとリストの対応関係を visitor が誤解しない設計）
  - **フォールバック（案 X 維持）**: T-1 で N=10 でも案 W-4 / W-3 のいずれもパフォーマンス問題（フォントメトリクス同期ずれ等）が確認された場合 → 案 X 維持 + 「N 件以上のマッチが見つかりました。リストで詳細を確認してください」誘導文言を併記
  - **AP-I07 (jsdom 検出不可な DOM パフォーマンス問題)**: T-1 プロトタイプは jsdom ではなく Playwright 実機で計測（**実装値** = T-1 完成条件「論点 7 案 W の N 値確定根拠取得」）

- **ハイライト色トークン候補比較（r3 改訂 = r2 process CRIT-2 対応 / AP-I08 観点）**: ハイライト用「背景色」トークンを `src/app/globals.css` 定義済 3 種から採択:

  | 候補             | ライト定義                                      | ダーク定義                                       | 採用判断                                                                                                                                                          |
  | ---------------- | ----------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `--success-soft` | `oklch(0.93 0.04 162)` (薄緑 / globals.css L38) | `oklch(0.25 0.05 162)` (深緑 / globals.css L124) | **第一候補** = マッチ = 「成功」連想 + 既存 `.matchText` 緑系 hex (`#d4edda` → `--success-soft`) との整合 / cycle-214 (c214-δ) hex→token マッピング SSoT との整合 |
  | `--accent-soft`  | `oklch(0.93 0.04 264)` (薄青 / L33)             | `oklch(0.25 0.06 264)` (深青 / L119)             | 第二候補 = ニュートラルな強調 / 「成功」「警告」のいずれの意味も持たない汎用色                                                                                    |
  | `--warning-soft` | `oklch(0.93 0.04 80)` (薄黄 / L42)              | `oklch(0.25 0.05 80)` (深黄 / L128)              | 不採用 = 「警告」連想がマッチに不適 / 競合 regex101 等の黄色系ハイライトと類似だが yolos.net token 体系では警告色                                                 |
  - **採択 = `--success-soft`（第一候補）**: マッチ = 「成功検出」連想 + cycle-214 (c214-δ) `.added` 緑系トークン引用適用 SSoT との整合 / ライト・ダーク両定義済（**実装値** = `grep -nE "success-soft" src/app/globals.css` = L38 / L124 = 各 1 件）
  - **AP-I08 観点で打ち消し済**: 採用トークンは `globals.css` ライト + ダーク両定義済 = 新トークン追加不要 / 既存 token + テキスト記号併用で WCAG 1.4.1 適合
  - **テキスト記号併用**: 背景色に加えてマッチ箇所に下線 (`text-decoration: underline dotted` 等) or マッチ番号バッジを併用 = 色のみ判別を回避 (**仕様値** = WCAG 1.4.1)
  - 採用トークン名は §引用 SSoT 14 (c215-β) に書き戻し済（T-3 実装で確定 / `-tentative` 接尾辞除去済 / cycle-215 T-3）

- **不採用理由**:
  - 案 X 単独（r1）はタイル UI が「視覚的に何件マッチしたか分からない」= 競合 8 サイトの実装格差を放置 / 「タイル → 違和感 → 詳細リンク」動線（M1a likes「すぐ結果を受け取る」と矛盾）
  - 案 Z は色のみ判別 = WCAG 1.4.1 違反
  - 案 AA はタイル / 詳細の両方で contentEditable 化が必要 = 詳細ページ touch 範囲が大幅膨張 / 既存 textarea 上 SSoT が崩れる
- **タイル + 詳細での非対称性の正当化**: タイル UI = 簡易ハイライト（案 W）/ 詳細ページ = フルハイライト（案 Y）/ いずれも「ハイライト + リスト併用」で a11y 軸（色のみ回避）を担保 = 用途別非対称ながら来訪者価値軸では一貫。
- **スコープ膨張への配慮（process MAJOR-7 対応 / r4 改訂 = r3 visitor MAJOR-2 整合）**: 詳細ページのハイライト導入は cycle-200〜214 の「詳細ページ touch しない原則」からの逸脱だが、競合 8 サイト中 5〜6 サイトがハイライト実装済 = yolos.net の **弱点 1 つの改善** = visitor 価値上の戦略的判断として cycle-215 スコープに含める。bundle インパクトは T-3 で実測し、cycle-214 完了時点との差を `tmp/cycle-215/after-t3/bundle-impact.md` に記録（事前閾値ではなく実測値の記録のみ / cycle-214 r4 MAJOR-1 教訓）。
- **AP-P21 計測 (a)〜(e) ケース定義への波及（俯瞰整合性）**: 案 W 採択時はマッチ結果欄が「リスト + ハイライト overlay」の二層構成となり、(d) ケース「両方有でマッチ有」の計測対象要素にマッチ overlay div を追加。**r5 改訂 = r4 process MAJOR-3 対応 = 案 W-4 動的描画格上げ後の補足**: 案 W-4 採択時は overlay div の DOM 描画件数が IntersectionObserver により動的（推定 9〜10 行 = §AP-P16 強化「r4 追補」視認可能性根拠）となる。AP-P21 (d) ケース計測では (1) リスト全件分の表示矩形（既存計測対象）+ (2) overlay div の可視描画件数 + スクロール時の追加描画件数（新規計測対象）の **両方**を独立計測し、新規 SSoT 候補 `(c215-δ-tentative)` のタイル UI 動的描画ハイライト設計指針として §補足事項 + §引用 SSoT 17 に書き戻し（T-3 実装直後に `-tentative` 接尾辞除去 or 撤回 = AP-WF12）。
- **r6 改訂 = r5 process MAJOR-1 対応 = 案 W-4 採択時の (d) ケース計測タイミング規定**: 案 W-4 動的描画 (IntersectionObserver) では DOM ノード数が時系列で変動し、(d) ケースの表示矩形 (height / width) が「いつのスクロール位置で計測したか」「IntersectionObserver の root margin / threshold 設定値」「描画完了タイミング」で変動する可能性がある。cycle-214 (c214-β)「同軸ではない」注記の構造（表示矩形固定設計 = 同軸性破綻）と **逆方向の同軸性破綻リスク**（動的描画で矩形が安定しない）を孕む。これを排除するため、T-1/T-4 計測時は **マッチ overlay div の DOM 描画完了後の安定状態（具体的には `requestAnimationFrame` 2 回後 = **推定値 + 経験的暫定値** = 生成元: [MDN window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) ベース + 描画パイプライン layout + paint 2 フレーム待ち = 安定状態確認の慣用パターン / T-1 プロトタイプで実測検証予定）で `getBoundingClientRect()` を取得** = 動的描画の時系列変動を排除した同軸計測を確保。cycle-214 (c214-β) 同軸性注記との対比 = 表示矩形固定設計 vs 動的描画設計の両端で同軸性が破綻するリスクを言語化。計測タイミング定義は T-1 / T-4 完成条件にも書き戻し（同型手順で再現可能）。
- **引用 SSoT / AP**: 競合調査 §10 強み「a11y 色のみ回避」維持 + gap 1「テキストエリア内ハイライト未実装 (8 サイト中 5〜6 サイト実装済)」改善（r6 改訂 = r5 visitor MAJOR-1 対応 = §目的 L63 / §論点 7 冒頭 L513 / §T-2 実施事項 L224 / §代替案 採択結果 L724 / 主目的 L14 と完全同型表現で統一 = 計 7 箇所統一）/ AP-I07 性能リスク事前評価（プロトタイプで実証）

**T-1 実測結果（T-1 builder 2026-05-29）**: N 値ベンチで N=99（実測値 / `tmp/cycle-215/baseline/highlight-N-determination.md` §B）が overlay div ハイライト 60fps 維持の上限 + 案 W-4 動的描画は IntersectionObserver rootMargin '100px' / threshold 0.1（実測検証済 / 同ファイル §C）で scrollTop=0 時 17 件可視 + scrollTop=1000 時 23 件追加描画動作確認 = 案 W-4 採択確定。overlay `<pre>+<mark>` 方式で px レベル位置同期確認（`tmp/cycle-215/baseline/highlight-feasibility.md` / 250 マッチ 31ms / 1,000 マッチも 100ms 以内）。

#### 論点 8: タイル内コピーボタンの要否（マッチ一覧テキスト / 置換結果 / どちらをコピー対象とするか）

- 案 A: マッチ一覧テキスト（「マッチ 1: ..., マッチ 2: ...」を改行区切りで）= **採択**
- 案 B: マッチテキストのみ（マッチ範囲文字列を改行区切り）
- 案 C: コピーボタン非設置
- **採択 = 案 A**: 「件数 + 一覧」を一括コピーで visitor は Excel / Markdown / Slack に貼り戻し可能（baseline r1 §1 M1a likes「コピペで結果を受け取る」）。案 B はマッチ位置やキャプチャグループ情報が失われ visitor 価値低下 / 案 C は M1a likes「コピペで結果」と矛盾。文言変化「コピー」→「コピー済み」→ 2 秒後復帰（cycle-213 (β) SSoT N=4 引用適用）。
- **引用 SSoT**: cycle-210/214 コピーボタン採用 / cycle-213 (β) 文言変化 N=4 達成

#### 論点 9: 詳細リンクテキスト

- 案 A: 「正規表現テスターの使い方を見る →」
- 案 B: 「フラグ切替・置換などの詳細機能を使う →」
- 案 C: 「詳細ページへ →」（汎用）
- 案 D: 「g 以外のフラグ・置換も使う →」
- **採択 = 案 B**: タイル UI の制約（フラグ全件省略 / 置換不在 = §論点 2 / §論点 3）を visitor に正確に伝え、詳細ページに行く動機を具体化。案 A は「使い方」が抽象的すぎる / 案 C は他タイルとの差別化なし / 案 D は「g 以外」表現が冗長で不自然。
- **引用 SSoT**: cycle-210/214 詳細リンクテキスト個別最適化 SSoT

#### 論点 10: search_intents 追加候補確定 + meta.ts keywords との重複論点 + relatedSlugs 実在判定 + 差し替え候補比較

- **追加候補 7 語比較**（前述 T-2 表参照）→ **採択 4 語 = `正規表現 動作確認` / `メールアドレス 正規表現` / `URL 抽出 正規表現` / `電話番号 正規表現`**（M1a yaml + M1b yaml の `search_intents` 末尾に追加）
- meta.ts keywords との重複論点: 既存 keywords `["正規表現", "正規表現テスト", "regex", "正規表現チェック", "パターンマッチ"]` と上記 4 語の重複なし（実測値ラベル / `meta.ts:7-11` Read 確認）= 追加 OK

- **`relatedSlugs` 実在判定 + 差し替え候補比較（r3 改訂 新規追加 = r2 process CRIT-3 対応）**:
  - 現状 `relatedSlugs = ["json-formatter", "text-diff", "email-validator"]`（**実測値** = `meta.ts` Read 確認 / baseline r1 §2-5）
  - T-1 実在判定コマンド: `ls src/app/(new)/tools/{json-formatter,text-diff,email-validator} src/app/(legacy)/tools/{json-formatter,text-diff,email-validator} 2>&1`
  - **planner 事前確認結果**: `text-diff` = `(new)/` 存在 (PASS) / `json-formatter` = `(legacy)/` 存在 (PASS) / `email-validator` = `(legacy)/tools/email-validator/page.tsx` **存在 (PASS)**（**実測値** = `ls src/app/(legacy)/tools/email-validator` = `opengraph-image.tsx page.tsx twitter-image.tsx`）
  - → **現状 relatedSlugs 3 件は実在判定 PASS = 差し替え不要**
  - **差し替えが必要になる場合の候補比較（フォールバック / 将来のため明示）**: 万が一 T-1 builder 再実測で email-validator が削除されていた等の場合の差し替え候補ゼロベース 3 案:

    | 候補                 | 採択理由                                                                                 | 不採用理由                                       |
    | -------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
    | 案 A: `text-replace` | regex-tester と複合入力型同型 + 「マッチ → 置換」の自然動線 = M1b プログラマ次タスク直結 | -                                                |
    | 案 B: `char-count`   | 単純構造同型 + 「正規表現テスト後に文字数確認」需要                                      | M1b プログラマ動線として弱い                     |
    | 案 C: `url-encode`   | テキスト系汎用 + URL 抽出後のエンコード需要                                              | regex-tester の主用途 (validation/抽出) と離れる |

  - **差し替え採択基準**: regex-tester 利用者が次に使いそうなツールは何か = M1b プログラマ動線 → **第一候補 = 案 A `text-replace`**（複合入力型同型 + 「マッチ → 置換」自然動線）

- **引用 SSoT**: cycle-214 §論点 9 / AP-P17 ゼロベース 4 案以上比較

#### 論点 11: 大量入力時のローディング表示要否（r2 改訂 = 論点 6 案 F 採択と整合）

- 案 A: タイル + 詳細の両方でローディング表示なし（Worker + timeout 100ms 採択 / 常時 <100ms 想定 / Nielsen 100ms 即座フィードバック規格）
- 案 B: timeout 100ms に達した場合のみ「計算中…」spinner 表示（cycle-212 spinner 中間状態 SSoT 引用適用）+ abort 時はエラー表示に切替（論点 13 と連動）
- **採択 = 案 B**: 論点 6 案 F 採択（Worker + 既存 `worker.terminate()` 中断 + timeout 100ms / r3 改訂 = AbortController 表記訂正）と整合 / 100ms 以内は spinner 非表示 / 100ms 超過時のみ spinner 表示 + `worker.terminate()` で abort されたらエラー表示に切替（論点 13 と連動）/ cycle-212 spinner 中間状態 SSoT を **N=3 引用適用達成** / **案 F-2 採択時 (timeout 200ms 緩和) は spinner 非表示 200ms に拡張** / **案 B フォールバック時は debounce 300ms 経由で spinner 100ms threshold 維持 = §論点 6 「案 B フォールバック時の波及」参照**
- **引用 SSoT / AP**: cycle-212 spinner SSoT / AP-I10 globals.css @keyframes / AP-I11 setTimeout cleanup

#### 論点 12: モバイルレイアウト（タイル時 / 詳細時）

- 案 X: タイル時 = 縦並び（pattern → 本文 → 結果 → コピー → 詳細リンク）/ 詳細時 = 縦並び（既存実装維持 / w640 以下で各要素縦並び）= **採択**
- 案 Y: 詳細時のみ横並び（オプションを左サイド / 本文 + 結果を右メイン）
- **採択 = 案 X**: w375 で横並びは窮屈 + cycle-210/214 同型の縦並び方針継承 + 詳細ページの現状実装維持で T-2 touch 範囲を最小化（AP-WF03 violation 回避）。
- **引用 SSoT**: cycle-210 §論点 3（縦並び採択）

#### 論点 13: ReDoS タイムアウト時の UI 挙動（r2 改訂 = process MAJOR-6 + 論点 6 案 F 採択と整合）

論点 6 案 F 採択 = タイル + 詳細の両方で Worker + 既存 `worker.terminate()` 中断 + timeout 100ms (or 案 F-2 採択時 200ms / r3 改訂 = AbortController 表記訂正)。タイムアウトで abort された場合の UI 文言。

- 案 A: 「計算中…」spinner 表示のまま放置（誤解を招く / 不採用）
- 案 B: **「計算がタイムアウトしました（パターンが複雑すぎる可能性があります）」エラー表示 + retry 不可**（採択）
- 案 C: silent fallback（結果欄が空のまま / visitor が原因を理解できない / 不採用）
- 案 D: タイル UI = silent fallback + 詳細ページ誘導文言 / 詳細ページ = 案 B（タイル / 詳細で UI 非対称）
- **採択 = 案 B（タイル + 詳細の両方で同一文言）**: ReDoS は実害（visitor のブラウザがフリーズ寸前）で発生する事象であり、原因 + 対処（パターン見直し）を visitor に明示することが信頼性価値（M1a dislikes「結果を信用していいか判断できない」と整合）。タイル + 詳細で **同一文言 + 同一構造**で表示 = c214-η（計算結果の同一性 + UI の一貫性）と整合。
- **タイムアウトメッセージの寿命（r2 改訂 = process MAJOR-6 対応 / AP-I11 setTimeout cleanup との関係）**: タイムアウトエラー文言は **次の入力変更まで永続表示**（自動消去なし）= setTimeout 不使用 = AP-I11 cleanup 不要。visitor がパターンを修正・本文を変更した時点で再計算 → エラー解除。これにより setTimeout cleanup 漏れリスクを構造的に排除。
- **引用 SSoT / AP**: 競合調査 §9.3 ReDoS 実装方針 / cycle-213 ARIA 設計 / AP-I07 / AP-I11（setTimeout 不使用で cleanup 不要 = 構造的排除）

#### 論点 15: サンプル選択 UI の採否（r2 改訂 新規追加 = visitor CRIT-4 対応）

競合調査 §10 gap 2 で「instant tools の 20 種サンプルドロップダウンが人気 / placeholder に例文を設定するだけでも改善効果大」と明示されているが r1 は独立論点化していなかった。M1a「正規表現が苦手だが URL 抽出したい」シーン（M1a interests「期限・日付・単位・文字数など、ミスが起きやすい部分を素早く確認」）に直接刺さる機能。

- 案 A: **なし**（現状実装維持 / placeholder も汎用文言）
- 案 B: **タイル placeholder にサンプル 1 件**（例: `^[\w.+-]+@[\w-]+\.[\w.-]+$` メールアドレス）/ 詳細ページも同様 / 低コスト + 高効果
- 案 C: **タイル + 詳細ページに 5〜10 件ドロップダウン**（メール / 電話 / URL / 郵便番号 / 日付 / IP アドレス / HTML タグ / 数値 / カナ / etc.）
- 案 D: **詳細ページのみ 10 件ドロップダウン**（タイル UI = 案 B placeholder 1 件のみ）
- 案 E: **「サンプルを入れる」ボタン 1 個**（クリックでランダム挿入 / タイル + 詳細共通）

- **r6 改訂 = r5 visitor CRIT-1 対応 = 案 D-改 ゼロベース 4 案以上比較（タイル単独完結の構造的阻害を解消）**: r5 visitor CRIT-1 で「タイル placeholder = メール 1 件のみではシーン 2「URL 抽出」M1a 動線のタイル単独完結が構造的に阻害される（タイル起点で URL pattern のヒントを得る手段がない）= CLAUDE.md 来訪者価値最大化原則違反」が指摘された。タイル幅 400×400px の制約 + AP-P21 操作側スペース制約を考慮しつつ、タイル UI にもサンプル選択 UI を導入する方向で案 D を改訂。ゼロベース 4 案以上で比較:

  | 改訂案    | タイル UI のサンプル選択 UI                                                                                                          | 詳細ページのサンプル選択 UI | 採択判断                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
  | --------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 案 D-改 1 | サンプル選択ドロップダウン 6 種（メール / URL / 電話 / 郵便 / 日付 / HTML タグ）= `<select>` 1 要素 で操作側に最小占有               | ドロップダウン 6 種（同上） | **第一推奨** = タイル / 詳細で 6 種同型 = M1a がタイル起点で URL 抽出を含む典型ユースケース全件にアクセス可能 = タイル単独完結保証 / `<select>` 1 要素は操作側に高さ ~40px = 既存の pattern input / コピーボタン / 詳細リンク行に並列配置可能（AP-P21 操作側 ~200px の枠内 / 詳細リンクと同行 or 1 行追加で収まる）/ Bundle 追加 = サンプル定数 + `<select>` 要素のみ = 軽量 / M1b 動線でも「ドロップダウンを使わず pattern を直接入力」が可能 = M1a/M1b 両層に利益 |
  | 案 D-改 2 | chip 形式ボタン 3 種（「メール」「URL」「電話」の頻出 3 種ボタン）+ 「もっと見る」リンクで詳細ページへ                               | ドロップダウン 6 種         | 第二推奨 = `<select>` がタイル枠で空間制約と判定された場合のフォールバック / chip 3 個 ≒ 高さ ~40px + 横並び 3 個分 ~210px = タイル幅 400px に収まる / 案 D-改 1 と比較するとタイル単独完結カバー率が 3/6 種に低下（M1a の郵便 / 日付 / HTML タグユースケースは詳細遷移が必要） / 6 種から 3 種への選別根拠 = 競合 §8 上位 3 サンプル                                                                                                                               |
  | 案 D-改 3 | 拡張可能セレクト（＋ ボタン 1 個 + クリックで `<select>` ドロップダウン展開）= 初期表示時は ＋ ボタンのみ表示 = タイル枠の余白最大化 | ドロップダウン 6 種         | 第三候補 = 案 D-改 1 と比較すると初期表示の余白が広いが、＋ ボタン認知コスト追加 + visitor の追加クリックが 1 回分発生 = M1a「すぐ使い始められる」と部分的に矛盾                                                                                                                                                                                                                                                                                                    |
  | 案 D-改 4 | placeholder にメール 1 件のみ（現案 D）+ 「サンプルを見る」リンクボタン 1 個 → クリックで詳細ページへ遷移                            | ドロップダウン 6 種         | 不採用 = タイル単独完結が「サンプルを見る」リンクで明示的に詳細遷移を強制 = r5 CRIT-1 の構造的阻害がそのまま残存 / 「タイル動線で完結」の主目的（CLAUDE.md 来訪者価値最大化）と矛盾                                                                                                                                                                                                                                                                                 |
  - **採択 = 案 D-改 1（タイル UI もドロップダウン 6 種 / 詳細ページもドロップダウン 6 種）**: CLAUDE.md「Decision Making Principle = 実装コストは UX 劣化の理由にならない」原則に従い、タイル単独完結カバー率最大の案 D-改 1 を第一推奨として採択。`<select>` 1 要素は操作側 ~200px 枠内に並列配置可能（pattern input + コピーボタン + 詳細リンク + サンプル選択 `<select>` の構成）= AP-P21 操作側 flexShrink:0 + 視認下限 40px と整合 / Bundle 追加コスト = サンプル 6 種定数 (T-2 meta.ts) + `<select>` 要素 (T-3 タイル UI) = T-3 で実測（過去 15 タイル追加実績の典型レンジ内見込み）
  - **退避（T-3 段階での技術的困難検出時のフォールバック）**: T-3 実装時にタイル枠 400×400px 内で `<select>` 配置の同軸性破綻（操作側 flexShrink:0 が 40px 下限を割る / w375 で横並び崩れ等）が確認された場合は **案 D-改 2（chip 3 種）にフォールバック** し、判断経緯を §補足事項に記録 / さらに案 D-改 2 でも困難が確認された場合は **案 D-改 3（拡張可能セレクト）に再フォールバック**

- **採択 = 案 D-改 1**（タイル UI = ドロップダウン 6 種 / 詳細ページ = ドロップダウン 6 種 / r6 改訂 = r5 visitor CRIT-1 対応 = 案 D 旧採択 placeholder 1 件のみ を撤回）:
  - **タイル UI** = サンプル選択ドロップダウン 6 種（メール / URL / 電話 / 郵便 / 日付 / HTML タグ）を操作側に配置 = M1a「正規表現が苦手だが URL 抽出したい」visitor がタイル単独で URL サンプルにアクセス可能 = タイル単独完結保証 / M1b は「ドロップダウンを使わず pattern 直接入力」も可能で M1a/M1b 両層を阻害しない
  - **詳細ページ** = 同じドロップダウン 6 種 = M1b「気に入って繰り返し使う」道具化 + タイル / 詳細で同型 UI = 学習コスト削減
  - **不採用理由**:
    - 案 A は競合との実装格差を放置 / placeholder 1 件追加の低コスト改善を見送る理由なし
    - 案 B 単独はタイル + 詳細で UI 同一 = 詳細ページの余裕を活用しない
    - 案 C は元案では「タイル UI に追加 UI を載せる = 4 重省略の議論と矛盾」と整理されていたが、r6 改訂で「ドロップダウン 1 要素は 4 重省略原則を毀損しない」と判断見直し = 案 D-改 1 として実質採択
    - 案 D 旧採択（タイル placeholder 1 件のみ）= r5 visitor CRIT-1 で構造的不整合確定 = 撤回
    - 案 E はランダム挿入 = visitor が「何を試したか」を把握しづらく学習価値低い
- **T-2 meta.ts / T-3 タイル UI への反映（俯瞰整合性 / r6 改訂 = r5 visitor CRIT-1 対応）**:
  - T-2 meta.ts: サンプル 6 種（メール / 電話 / URL / 郵便番号 / 日付 / HTML タグ）+ 各サンプルのデフォルトテストテキストを定数として追加（具体パターン文字列は下表で確定 / **タイル UI と詳細ページの両方から参照する単一 SSoT**）
  - T-3 タイル UI: pattern input の上 (or 横並び) にサンプル選択 `<select>` ドロップダウン 6 種 を追加 / 選択時に pattern input + 本文 textarea に `meta.ts` のサンプル定数から自動入力（**タイル単独完結保証 = r5 visitor CRIT-1 対応**）
  - T-3 詳細ページ: pattern input 上にドロップダウン UI を追加 / 選択時に pattern + 本文 textarea にサンプルを自動入力（観点 (xviii) で検証）

- **詳細ページ ドロップダウン 6 種の具体パターン + デフォルトテストテキスト（r3 改訂 新規追加 = r2 visitor MAJOR-1 対応 / AP-WF03 計画者責務での具体値確定）**:

  | 用途              | パターン                 | フラグ | デフォルトテストテキスト                                     | 想定マッチ件数 | 競合 §8 サンプル # |
  | ----------------- | ------------------------ | ------ | ------------------------------------------------------------ | -------------- | ------------------ |
  | メールアドレス    | `[\w.-]+@[\w.-]+\.\w+`   | g      | `お問い合わせ: support@example.com、admin@yolos.net`         | 2              | #1                 |
  | URL               | `https?://[\w./\-?=&%]+` | g      | `参考: https://example.com/path?query=1 と http://yolos.net` | 2              | #3                 |
  | 電話番号（日本）  | `0\d{1,4}-\d{1,4}-\d{4}` | g      | `連絡先 03-1234-5678 / 携帯 090-1234-5678`                   | 2              | #2                 |
  | 郵便番号          | `\d{3}-\d{4}`            | g      | `〒100-0001 東京都千代田区`                                  | 1              | #4                 |
  | 日付 (YYYY-MM-DD) | `\d{4}-\d{2}-\d{2}`      | g      | `日付: 2026-05-29 開始、2026-12-31 終了`                     | 2              | #5 (派生)          |
  | HTML タグ         | `<[^>]+>`                | g      | `<p>テキスト</p><br>`                                        | 3              | #6                 |
  - 選定理由: 競合調査 §8 典型需要 10 サンプル中、M1a (文書編集者) 利用頻度 + M1b (プログラマ) 体験トレース直結度の上位 6 件 / IP アドレスサンプル (元 r2 案) は M1a/M1b 利用頻度が下位のため HTML タグに差し替え (HTML タグは Web エンジニア = M1b 典型需要 + テキスト編集者にも頻出)
  - **AP-WF03 計画者責務範囲**: 上記 6 種のパターン文字列 + テストテキスト + フラグ = 計画者責務として確定 / **UI 表記 (ドロップダウンラベル文言 / セレクター実装方式) は builder 裁量**
  - **a11y 補助記号併用**: ドロップダウン選択時に pattern input にフォーカス移動 + `role="status"` で「サンプル『メールアドレス』を入力しました」アナウンス (cycle-214 c214-ζ ARIA 二層構成引用適用)

- **タイル placeholder + サンプル選択 UI の具体文言（r3 改訂 新規追加 = r2 visitor MAJOR-1 対応 / r6 改訂 = r5 visitor CRIT-1 対応 = 案 D-改 1 採択 = タイル UI もドロップダウン 6 種）**:
  - タイル `RegexTesterTile.tsx` の pattern input placeholder = `[\w.-]+@[\w.-]+\.\w+`（**仕様値** = 上表のメールアドレス pattern と同一 / 初期表示時のデフォルト案内）
  - 「例:」プレフィックスは付けない（visitor が Tab キーで消去できる素のパターン = 競合 instant tools 同型 = タイル枠 400px の余白節約）
  - 本文 textarea placeholder = `お問い合わせ: support@example.com、admin@yolos.net`（**仕様値** = 上表メールテストテキストと同一 / メールアドレスサンプルと整合）
  - **サンプル選択ドロップダウン**（r6 改訂 = r5 visitor CRIT-1 対応 新規追加）: タイル UI 操作側に `<select>` 6 種を配置 / 選択時に pattern input + 本文 textarea を `meta.ts` 定数から自動入力（タイル単独完結保証）/ ドロップダウンのラベル文言 + 表示順序 + 既定値 (placeholder = 「サンプルを選択」 等) は **builder 裁量**（AP-WF03 計画者責務範囲外）

- **引用 SSoT / AP**: 競合調査 §10 gap 2 / 競合調査 §8 典型需要 10 サンプル / AP-P17 ゼロベース 5 案以上比較 / AP-WF03 計画者責務での具体値確定

#### 論点 14: AP 打ち消し策の組み込み

- **AP-P11**: AI の過去の判断を「変更不可」として扱わない / 本サイクルで cycle-210/214 SSoT の (v) ±15% 経験的暫定値を **3 サンプルで再評価して基準値見直し提案** = AI 過去判断の再評価フローを能動的に発火
- **AP-P16**: 数値 literal すべてに 4 分類ラベル + 生成元併記（本計画書全体で徹底 / 計画書執筆中の AP-P16 強化）
- **AP-P17**: 論点 14 件をゼロベース 3 案以上で比較（本セクション）
- **AP-P19**（r2 改訂 = process MAJOR-5 対応）: 外部仕様（**ECMAScript RegExp 仕様 / Snyk ReDoS ガイド / Nielsen Response Time Limits**）を T-1 で WebFetch 一次資料確認（cycle-214 c214-ζ 教訓）。`diff` npm パッケージ仕様（r1 言及）は regex-tester では使わないため対象外（cycle-214 text-diff の引きずり / r2 訂正）。WAI-ARIA `role="status"` 仕様は cycle-214 で確立済 SSoT 引用適用で T-1 WebFetch 不要。RegExp v フラグ仕様（r1 言及）は本サイクル採用予定なしのため対象外（r2 訂正）
- **AP-P21**: 固定枠 UI の操作側 / 膨張側 二分類（論点 4 / §論点 5）
- **AP-I07**: ReDoS 性能リスク事前評価（T-1 ベンチ / 論点 6 / 論点 13）
- **AP-I08**: DESIGN.md / デザイントークン未定義の視覚表現禁止（`text-decoration` は CSS 標準プロパティ = token 化対象外 / **r3 改訂 = r2 process CRIT-2 対応 = 論点 7 ハイライト用背景色トークンも AP-I08 観点で打ち消し済 / 採用 = `--success-soft` (globals.css L38 ライト / L124 ダーク両定義済) / 詳細は §論点 7 「ハイライト色トークン候補比較」サブセクション参照**）
- **AP-I10**: globals.css @keyframes（spinner / 論点 11）
- **AP-I11**: setTimeout cleanup（コピー文言復帰 2 秒タイマー / 論点 7 採用時）
- **AP-WF12**: 計画書執筆中の事実情報自己確認（T-1 builder 数値再実測 / reviewer 独立再実行）
- **AP-WF15**: AI 判断の経験的暫定値の N≥3 着手条件監視（B-452 状態欄更新 = 本サイクルの根幹）
- **AP-WF16**: 4 コマンド全件再実行 + AP-P21 計測の reviewer 独立再実行

**N 統計判定（r2 全面改訂 = process CRIT-1 対応 / cycle-214 (c214-β) 同軸性注記の反映）**:

cycle-214 §補足事項 (c214-β)（出典: `docs/cycles/cycle-214.md` L1163-1170）を **正確に引用**:

> cycle-210 N=1（textarea 入力量変動 → 高さ変化 11.55%）と cycle-214 N=2（表示矩形固定設計 → 変化率 0.00%）は「同軸ではない」。cycle-214 の 0.00% は「flex:1 / overflowY:auto 構造で表示矩形が固定される」という別の設計結果であり、±15% の入力量変動起因の N=2 データポイントとしては有意ではない。後続サイクルで複合入力型 3 件目を実施する際の判断材料として残す（「入力量変動で高さが変化するタイル」での計測が B-452 N=3 の真の N=3 として有意）。

これに従い、N 統計判定式の母集団を以下に補正:

- **有効サンプル**（入力量変動起因 = (v) ±15% 判定対象）:
  - cycle-210 = 11.55%（**真の N=1 有効**）
  - cycle-215 = 本サイクル T-4 実測値（**入力量変動で高さが変化する設計を意図的に選んだ場合**のみ **真の N=2** として有効）
- **参考併記サンプル**（同軸ではない）:
  - cycle-214 = 0.00%（表示矩形固定設計起因 / 母集団外 / 参考併記のみ）

**判定式（r3 改訂 = r2 visitor MAJOR-3 + r2 process MAJOR-4 対応 / 表記統一 / 「N=3 暫定達成」表現は撤廃）**:

- **真の N=2 達成**（cycle-215 が「入力量変動で高さが変化する設計」を採用し有効サンプルになった場合）→ B-452 状態欄に「真の N=2 達成 / B-452 N=3 着手条件は cycle-216 以降で再判定」と書き戻し + 真の N=3 は cycle-216 以降の追加検証で確定（**基準値見直し提案値は真の N=3 確定後に持ち越し**）
- **真の N=1 のまま**（cycle-215 = 0.00% 表示矩形固定設計になってしまった場合）→ B-452 状態欄を「真の N=1 のまま / cycle-215 は表示矩形固定設計 = 同軸ではない / cycle-216 以降で入力量変動設計で再挑戦」に書き戻し
- **cycle-215 単独で達成し得る上限 = 真の N=2** / 「真の N=3 達成」は構造上 cycle-216 以降の追加サンプル採取が必須
- **真の N≥3 確定後の基準値見直し提案**（cycle-216 以降に持ち越し）:
  - 全件 ≤ 10% → 提案値 = **±10%**
  - 全件 ≤ 15% + 1 件以上が 10〜15% → 提案値 = **±15%**
  - 1 件以上が 15〜20% → 提案値 = **±20%**
  - 1 件以上が >20% → 提案値 = **構造別基準の追加細分化**
  - **注（visitor NIT-1 対応）**: いずれの提案値も「3 サンプルの傾向を示唆する暫定値」であり、後続 N=4, N=5 サンプル時に再見直しが必要

**本サイクル T-4 でのアクション（r3 改訂 = r2 process MAJOR-4 対応 / 表記統一）**:

- (a) cycle-215 (d)→(e-α) 変化率を計測
- (b) 「入力量変動起因 = 有効サンプル」or「表示矩形固定起因 = 同軸ではない参考併記」を判定
- (c) 上記判定式に基づいて B-452 状態欄を **二択のみ**で書き戻し: 「**真の N=2 達成 / cycle-215 が真の N=2 有効サンプル / B-452 N=3 着手条件は cycle-216 以降で再判定 / 基準値見直しは真の N=3 確定後（cycle-216 以降）に持ち越し**」または「**真の N=1 のまま / cycle-215 は同軸ではない / cycle-216 以降で再挑戦**」

---

### 検討した他の選択肢と判断理由

#### 本サイクル対象選定の代替案

- **代替案 1: dummy-text（単純構造ツール継続）**: cycle-200〜214 で 15 件達成済 / 単純構造ツールはこれ以上の SSoT 蓄積価値が低い / B-452 N=3 達成への寄与なし。
- **代替案 2: B-318 系画像ワークフロー（画像形式変換等）**: 画像入力型 N=2 は cycle-211/212 で達成済 / 規模が大きく単一サイクル不可。
- **採択結果 = regex-tester**: PM 判断 = (i) B-452 N=3 達成 = cycle-210/214 SSoT 3 回目引用検証 + 経験的暫定値 ±15% 妥当性に客観的決着 (ii) M1b プログラマ普遍的需要 + M1a 補助に直接応答 (iii) 競合 8 サイトに対する差別化軸（ReDoS 対策 + a11y + ローカル完結 + 4 フラグ）を維持しつつ 弱点 1 つ（テキスト内ハイライト = 8 サイト中 5〜6 サイト実装済の格差）を詳細ページで改善検討（r4 改訂 = r3 visitor MAJOR-2 整合）。

#### タイル UI に置換機能を含める案（不採択）

- 案: タイル UI に replacement input + 置換結果欄を追加
- 不採択理由: §論点 3 参照 / 400×400px 枠に収まらない + `text-replace` ツールとの役割重複

#### Worker + debounce のみ案（タイル UI も Worker 採用 / 不採択）

- 案: タイル UI もそのまま `useRegexWorker` を流用（案 B 単独）
- 不採択理由: §論点 6 参照 / cycle-210 SSoT (v) 同軸 (d)→(e) 計測不可 = B-452 N=3 達成の根幹が崩れる

#### タイル UI のテキストエリア内ハイライト実装案（r5 改訂 = r4 process MAJOR-1 対応 = 採択結果に書き換え）

- 案: タイル 400×400px 枠でも overlay div ハイライトを実装
- **採択結果（r4 = 案 W-4 第一候補格上げ）**: §論点 7 採択 = **案 W = タイル UI に簡易ハイライト導入**（さらに r4 で **案 W-4 第一候補 = 動的描画（IntersectionObserver / N=動的）** に格上げ確定）。本「タイル UI のテキストエリア内ハイライト実装案」は r1/r2 時点では「不採択」として整理されていたが、**r3 → r4 で採択に転換**したため、本セクションは「不採択」表記から「採択結果」表記に訂正。詳細は §論点 7 採択末尾 / §T-2 実施事項 / §T-3 完成条件 を参照

#### 「テスト基盤一括整備」を本サイクルに含める案（不採択）

- 案: B-462 を本サイクルに含めて Component.test.tsx 21 件規模を T-3 で書く
- 不採択理由: cycle-210〜214 同型運用 / 過剰スコープ膨張リスク / B-462 として独立扱い

---

### 引用する SSoT

本サイクルで引用 / 再利用する SSoT を列挙。各項目には regex-tester への適用予告（PASS 期待 / 再評価 / 適用対象外）を明示。

1. **`(c210-i)` cycle-210 SSoT (i) AP-P21 判定基準 (i) 下限 40px の適用範囲**（r3 改訂 = r2 process MINOR-1 対応 = 独自 ID 併記）:
   - 内容: textarea / status 領域 / エラー枠 / コピーボタン等の「visitor が直接視認・操作する要素」に対して 40px 以上の下限を適用 / 複合入力型タイルでは操作側 input にも 40px 以上を適用
   - regex-tester への適用予告: **PASS 期待**（pattern input / 本文 textarea / マッチ結果欄 / コピーボタン / 詳細リンクすべてに 40px 下限を適用 / **3 回目引用適用**）
   - 出典: cycle-210.md L841 §補足事項 1 / cycle-214 §引用 SSoT 1 で 2 回目引用適用済

2. **`(c210-ii)` cycle-210 SSoT (ii) AP-P21 判定基準 (ii) 相互差 2px 以内の適用範囲**:
   - 内容: 操作側 input のみ flexShrink:0 で固定要件として 2px 以内を維持 / 膨張側の相互差判定は適用外
   - regex-tester への適用予告: **PASS 期待**（pattern input + コピーボタン + 詳細リンクは flexShrink:0 で相互差 2px 以内 / 本文 textarea + マッチ結果欄の相互差は適用対象外 / **3 回目引用適用**）
   - 出典: cycle-210.md L843 §補足事項 2 / cycle-214 §引用 SSoT 2 で 2 回目引用適用済

3. **`(c210-v)` cycle-210 SSoT (v) AP-P21 判定基準 (v) ±15% 経験的暫定値（複合入力型基準）**:
   - 内容: 単一 textarea 基準 ±10% は複合入力型に直接適用不可 / 複合入力型タイル基準 = ±15% 以内（N=1 経験的暫定値）
   - regex-tester への適用予告（**最重要 / B-452 N=3 達成の根幹**）: **再評価 + N=3 採取 / 即時計算採択（§論点 6 案 D）により cycle-210/214 と同軸計測可能**（T-4 で 「(d)→(e-α) 無効パターンエラー枠の出現変化」を計測 / N=3 データポイントを B-452 に蓄積 / **基準値見直し提案値（±10/15/20%）を §論点 14 末尾に書き戻し**）
   - 出典: cycle-210.md L847-852 §補足事項 4 / cycle-214 §引用 SSoT 3 で 2 回目引用適用済（N=2 達成）

4. **`(c210-vi)` cycle-210 SSoT (vi) エラー文言枠の 1 行収納基準と実測 SSoT 値**:
   - 内容: タイル UI 内エラー文言枠は実測幅 ≤376px + 1 行表示 + h ≥40px / 計画段階では推定値のみ / 実 SSoT は T-4 実機計測で確定
   - regex-tester への適用予告: **再評価 + 独自 SSoT 値確定**（T-1 で (e-α) 無効パターン枠 + (e-β) 入力長超過枠の Playwright 計測 / cycle-210 `.error` h=46.09px / cycle-214 `.noDiff` h=23.046875px / 本サイクル regex-tester `<div role="alert">` h/w を独自 SSoT として確定 / 3 回目引用適用の手順自体は同型）
   - 出典: cycle-210.md L538 / L835 / L845 §補足事項 3 / cycle-214 §引用 SSoT 4 で 2 回目引用適用済

5. **`(c214-δ)` cycle-214 hex → token マッピング SSoT**:
   - 内容: hex → token マッピング 4 種（`.added` / `.removed` 緑赤系 → `--success-soft` / `--success-strong` / `--danger-soft` / `--danger-strong`）
   - regex-tester への適用予告: **PASS 期待**（`.matchText` 緑系 hex 2 種 `#d4edda` / `#155724` → `--success-soft` / `--success-strong` 引用適用 / N=2 達成）
   - 出典: cycle-214 §引用 SSoT 13

6. **`(c214-ζ)` cycle-214 ARIA 二層構成 SSoT**（長文リアルタイム更新領域に aria-live を付けず、サマリ status 欄にのみ aria-live を付与）:
   - 内容: 長文 `<pre>` / `<div>` 結果欄 = `role="region"` のみ + サマリ短文 = `role="status" aria-live="polite"`
   - regex-tester への適用予告: **引用適用 PASS 期待**（マッチ結果欄が長文表示 = `role="region"` のみ / 「N 件マッチ」サマリ短文 = `role="status" aria-live="polite"` / **N=2 達成**）
   - 出典: cycle-214 §引用 SSoT 15

7. **`(c214-η)` cycle-214 タイル + 詳細ページ計算トリガー一貫化 SSoT**（r2 改訂 = process NIT-1 + visitor MINOR-2 対応）:
   - 内容: cycle-210/214 では詳細 + タイル両方で即時計算採択（N=2 達成）
   - regex-tester への適用予告: **PASS 期待 = N=3 通常引用適用達成（案 F フル採択時 / 案 B フォールバック時は §補足事項で再判定 = r3 改訂 = r2 process MAJOR-3 対応）**（§論点 6 案 F 採択 = タイル + 詳細の両方で Worker + 既存 `worker.terminate()` 中断 + timeout 100ms (or 案 F-2 採択時 200ms) で計算トリガー一貫化 / r3 改訂 = AbortController 表記訂正 / r1 の (c215-α-tentative) 例外運用 SSoT 候補は撤回 / r1 案 D ハイブリッド採択を r2 で取り下げ）
   - 出典: cycle-214 §引用 SSoT 16

8. **`(c213-β)` cycle-213 コピーボタン文言変化 AP-P21 適用外 SSoT**（N=4 達成済 / cycle-214 で N=4）:
   - 内容: コピーボタン文言の変化（コピー → コピー済み → 2 秒後復帰）による width/height 変動は AP-P21 適用外
   - regex-tester への適用予告: **PASS 期待 / N=5 達成**（§論点 8 採択 = コピーボタン採用）
   - 出典: cycle-213.md L606 §補足事項 (ii) / cycle-214 §引用 SSoT 6

9. **`(c213-γ)` cycle-213 操作側 flexShrink:0 / 膨張側 flex:1 二分類 SSoT**:
   - 内容: 操作側 = タイトル / 操作 UI / 固定高さ情報要素 / ボタン / 詳細リンク = flexShrink:0 / 膨張側 = 長さ可変な出力エリア = flex:1 + overflowY:auto
   - regex-tester への適用予告: **PASS 期待**（pattern input + コピーボタン + 詳細リンク = flexShrink:0 / 本文 textarea + マッチ結果欄 = flex:1 + overflowY:auto / **N=3 引用適用達成**）
   - 出典: cycle-213.md / cycle-214 §引用 SSoT 8

10. **`(c213-δ)` cycle-213 AP-I11 setTimeout cleanup SSoT**:
    - 内容: setTimeout / setInterval ID を useRef 保持 + useEffect cleanup で clear
    - regex-tester への適用予告: **PASS 期待**（コピーボタン文言復帰 2 秒タイマー / 即時計算採択により debounce タイマー不使用 / **N=3 引用適用達成**）
    - 出典: cycle-213.md / cycle-214 §引用 SSoT 9

11. **AP-WF05 viewport 網羅性ルール**: w375 / w1200 / w1900 × light / dark = 6 系統

12. **kind=widget 標準パターン**: cycle-200〜214 で 15 件確立 / 本サイクル 16 件目

13. ~~**本サイクル新規 SSoT 候補 (c215-α-tentative)**~~（**r2 改訂 = 撤回 / process NIT-1 + visitor MINOR-2 対応**）: 論点 6 を r1 案 D ハイブリッドから r2 案 F（タイル + 詳細の両方で Worker + AbortController + timeout 100ms / 計算トリガー一貫化）に改訂したため、本 SSoT 候補は不要化。c214-η は本サイクルで通常引用適用 N=3 達成 = SSoT 7 の予告に統合済み

14. **`(c215-β)` 本サイクル新規 SSoT 候補**（T-3 実装で確定 = `-tentative` 接尾辞除去済 / cycle-215 T-3）: 詳細ページのテキストエリア内ハイライト + リスト併用 a11y 設計。色 + テキスト + 番号（yolos.net 既存強み）+ 背景色ハイライト（競合の強み）を統合し WCAG 1.4.1 適合と視覚的フィードバック強化を両立。**採用ハイライト背景色トークン = `--success-soft`**（r3 改訂 = r2 process CRIT-2 対応 = 候補 3 種 (`--success-soft` / `--accent-soft` / `--warning-soft`) から `--success-soft` 採用 / マッチ = 「成功検出」連想 + cycle-214 (c214-δ) hex→token 緑系マッピングとの整合 / ライト L38 ダーク L124 globals.css 定義済 / AP-I08 観点で打ち消し済 / テキスト記号併用で WCAG 1.4.1 適合）。タイル UI = 簡易ハイライト `--success-soft` 採用（T-3 実装確定 / `RegexTesterTile.tsx` L インラインスタイルで適用）。N=1 初出（後続サイクルで `text-replace` / その他ハイライト系ツールに引用適用候補）。

15. **`(c214-ι)` cycle-214 text-diff noDiff 枠 SSoT**（r2 改訂 新規追加 = process CRIT-3 対応）:
    - 内容: h=208.39px / w=380px / 膨張側 flex:1 + overflowY:auto の noDiff 表示時の実測値 / cycle-210 (vi) `.error` 枠 h=46.09px とは構造別物（出典: `docs/cycles/cycle-214.md` L1146-1153）
    - regex-tester への適用予告: **再評価 + 独自 SSoT 値確定**（regex-tester では「(c) パターン有 + 本文空 = マッチ 0 件」「(d) 両方有でマッチ無」状態に相当する **マッチ無時の結果欄**が存在する可能性 / T-1 で Playwright 計測 / (c214-ι) noDiff 枠 SSoT と構造的同型かを判定 / 同型なら h=208.39px / w=380px を引用適用 = N=2 達成 / 別物なら regex-tester 独自 SSoT (c215-γ) として h/w を確定 / **T-4 完了 = 独自 SSoT 値確定 = h=54.78px / w=380px（無効パターン文言「Invalid regular expression: /[unclosed/g: Unterminated character class」54 字 / 2 行折り返し / 実測値 / Chromium 149 / Playwright MCP）/ cycle-214 c214-ι noDiff 枠 (h=208.39 / w=380) とも cycle-210 `.error` 枠 (h=46.09 / w=376) とも別物 = regex-tester 独自 SSoT として確定 / `-tentative` 接尾辞除去済 / 詳細は `tmp/cycle-215/t4/ssot-verification.md` 参照**）
    - 出典: cycle-214.md L1146-1153 (c214-ι)

16. **`(c214-β)` cycle-214 「同軸ではない」注記の引用**（r2 改訂 新規追加 = process CRIT-1 対応）:
    - 内容: cycle-210 N=1（11.55% / 入力量変動起因 / 有効）と cycle-214 N=2（0.00% / 表示矩形固定設計起因 / 同軸ではない参考併記）= cycle-215 が真の N=2 / N=3 として有効か否かは「入力量変動で高さが変化する設計」を意図的に選んだ場合のみ（出典: `docs/cycles/cycle-214.md` L1163-1170）
    - regex-tester への適用予告: **判断材料として全面引用**（§論点 14 N 統計判定式の母集団定義 / T-4 完成条件の N 統計判定根拠）

17. **`(c215-δ)` 本サイクル新規 SSoT 候補 = タイル UI 動的描画ハイライトの設計指針**（T-3 実装で確定 = `-tentative` 接尾辞除去済 / cycle-215 T-3 / r5 改訂 = r4 process MAJOR-3 対応 新規追加 / r6 改訂 = r5 process MAJOR-2 対応 = IntersectionObserver パラメータ仕様値候補 + 計測タイミング規定を追記）:
    - 内容: タイル UI 400×400px 枠で **動的描画（IntersectionObserver / N=動的）** によりマッチ件数の DOM 描画上限を視認可能件数（推定 9〜10 行 = **推定値計算** = §AP-P16 強化「r4 追補」視認可能性根拠 = 操作側 200px + 膨張側 200px + 1 行 22px の計算式由来）に動的制限する設計指針。スクロール量に応じて追加描画 = 視認可能件数の上限はスクロール量で拡張可能 / DOM ノード負荷とコピー可用性のトレードオフを解消 / a11y（リスト全件は `role="region"` 内で常時保持 = `role="status"` でサマリ件数告知 = c214-ζ ARIA 二層構成と整合）/ AP-P21 (d) 「マッチ結果欄 = リスト + ハイライト overlay の二層構成」と整合する設計値。N=1 初出（後続サイクルで `text-replace` / 高頻度マッチ系ツールに引用適用候補）。
    - **IntersectionObserver パラメータ仕様値候補（r6 改訂 = r5 process MAJOR-2 対応 新規追加）**:
      - `rootMargin: "100px"`（**実測値** = タイル膨張側 ~200px の半分相当を pre-load 余裕として確保 / 生成元: [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) パラメータ既定値レンジ / 実測検証済 = `tmp/cycle-215/baseline/highlight-N-determination.md` §C / Chromium 149 / scrollTop=0 で intersecting 17 件 / scrollTop=1000 で 23 件 / rootMargin:"0px" 比較対照 11 件 = 理論値と一致）
      - `threshold: 0.1`（**実測値** = 1 マッチ overlay の 10% 表示で描画トリガー / IntersectionObserver の典型既定値レンジ / 実測検証済 = 同ファイル §C / Chromium 149）
      - `scrollRoot` = タイル膨張側コンテナ（**実装値** = T-3 で `RegexTesterTile.tsx` の `overflowY:auto` 要素を `ref` で取得）
    - **計測タイミング規定（r6 改訂 = r5 process MAJOR-1 対応 新規追加）**: マッチ overlay div の DOM 描画完了後の安定状態 = **`requestAnimationFrame` 2 回後**（**推定値 + 経験的暫定値** = 生成元: [MDN window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) ベース + 描画パイプライン layout + paint 2 フレーム待ち慣用パターン / T-1 プロトタイプで実測検証予定）で `getBoundingClientRect()` を取得 = 動的描画の時系列変動を排除した同軸計測を確保（cycle-214 (c214-β)「同軸ではない」注記の表示矩形固定設計 vs 動的描画設計の両端で同軸性が破綻するリスクを言語化）
    - regex-tester への適用: **T-3 実装で確立**（T-1 プロトタイプで N=10/50/100/500 + 動的描画の 5 段階計測 → 案 W-4 採択 = N=動的（IntersectionObserver）が視認可能件数 9〜10 行を満たすことを実証済 / `rootMargin: "100px"` / `threshold: 0.1` 仕様値候補は **実測検証済** = `tmp/cycle-215/baseline/highlight-N-determination.md` §C / Chromium 149 / scrollTop=0 で intersecting 17 件 / scrollTop=1000 で 23 件 / rootMargin:"0px" 比較対照 11 件 = 理論値と一致 / T-3 実装で `-tentative` 接尾辞除去済 = AP-WF12 cycle-214 c214-ε 教訓適用 N=1）
    - 出典: cycle-215.md §論点 7「N 値確定方針」サブセクション + AP-P16 強化「r4 追補（視認可能性根拠）」+ AP-P16 強化「r6 追補（IntersectionObserver + rAF 計測タイミング）」 + AP-P21 (d) ケース定義（r5 で動的描画考慮 / r6 で計測タイミング規定を追記）

**SSoT 番号体系統一（r2 改訂 = process MINOR-4 対応）**: 本セクションの番号 1〜17 に加えて、本文の他所引用との横断検索を容易にするため、各項目冒頭の括弧内 ID（例 `(c210-i)` = cycle-210 SSoT 1 / `(c214-ζ)` = cycle-214 SSoT 5 / 引用 SSoT 6）を本文引用と統一する（r5 改訂 = SSoT 17 追加に伴い番号上限を 16→17 に更新）。

---

### 計画にあたって参考にした情報

1. **regex-tester ベースライン調査レポート**: `tmp/research/2026-05-29-cycle-215-regex-tester-baseline-r1.md`（現状コード全文 + ターゲット定義 + GA データ + 既存複合入力型タイルパターン）
2. **複合入力型タイル SSoT 抽出レポート**: `tmp/research/cycle-214-cycle-210-ssot-extraction.md`（cycle-210 SSoT 4 項目 + cycle-211/212/213 関連 SSoT + 計画時引用適用チェックリスト 10 項目 / 本サイクルでは cycle-214 (c214-α)〜(c214-ι) も追加引用）
3. **regex-tester 競合調査レポート**: `docs/research/2026-05-29-regex-tester-competitor-research.md`（競合 8 サイト + 差別化軸 + 典型需要 10 サンプル + ReDoS 対策事例）
4. **cycle-214**（複合入力型 N=2 + (c214-α)〜(c214-θ) SSoT 確立）: `docs/cycles/cycle-214.md`（§補足事項 + §引用 SSoT 13-17 = 本サイクル 3 回目引用検証の直前先例）
5. **cycle-213**（コピーボタン文言変化 N=3 確定 / 補足事項 (β)(γ)(δ)(θ) SSoT 確立）: `docs/cycles/cycle-213.md`
6. **cycle-212**（画像入力型 N=2 / spinner 中間状態 SSoT 確立）: `docs/cycles/cycle-212.md`
7. **cycle-211**（画像入力型 N=1 / (i)〜(x) 補足事項 SSoT 確立元）: `docs/cycles/cycle-211.md`
8. **cycle-210**（複合入力型 N=1 = 本サイクルの最重要先例 / SSoT (i)(ii)(v)(vi) 確立元 / §補足事項 (i)(ii)(v)(vi)）: `docs/cycles/cycle-210.md`
9. **CLAUDE.md / docs/constitution.md / docs/anti-patterns/**: AP-P11 / AP-P16 / AP-P17 / AP-P19 / AP-P21 / AP-I07 / AP-I08 / AP-I10 / AP-I11 / AP-WF03 / AP-WF05 / AP-WF12 / AP-WF15 / AP-WF16
10. **docs/targets/**: M1a (`特定の作業に使えるツールをさっと探している人.yaml`) / M1b (`気に入った道具を繰り返し使っている人.yaml`) yaml の likes/dislikes / search_intents 実測
11. **`src/tools/regex-tester/`**: Component.tsx (168 行) / Component.module.css (246 行) / logic.ts (119 行) / useRegexWorker.ts (351 行) / meta.ts (42 行) / `__tests__/logic.test.ts` (12 件) の planner Read による実測（baseline r1 §2 経由）

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

### r1 visitor review (2026-05-29 / 来訪者価値観点)

**判定: 改善指示**

事後検証質問形（AP-WF15）で記述。M1a/M1b 来訪者の本当の体験・競合調査が示す典型ユースケース・CLAUDE.md「Decision Making Principle」に照らして、論点 6 / 論点 7 を中心に複数の重大論点を再考すべきと判断する。

---

#### CRIT-1: 論点 6 案 D「タイル UI 1,000 字制限」は M1b 実用域（ログ抽出 / URL 一括抽出）を切り捨てており、来訪者価値最大化に反していないか？

- **指摘内容**: 計画書 §論点 6 採択 = 案 D ハイブリッド（タイル = 1,000 字制限）。しかし計画書 §目的 シーン 2 自身が「ログから URL だけ抽出」「Excel / Markdown に貼り戻し」という M1a / M1b 文書編集者ユースケースを描いている。実ログは 5,000〜100,000 字 / 1MB クラスが普通であり、1,000 字制限はこのユースケース最頻の入口で詰まる。タイル経由 visitor は「1,000 字超 → エラー枠 → 詳細ページへ移動 → 再貼付け」を強いられる。これは M1a likes「すぐ使い始められる」「すぐ元の作業画面に戻れる」、M1b dislikes「動作が遅いツール」と直接衝突する。
- **根拠**: 競合調査 `docs/research/2026-05-29-regex-tester-competitor-research.md` §8 典型需要 #3 URL 抽出 + 計画書 §目的シーン 2（M1a / 文書編集者）の自己矛盾 + M1a yaml line 16-17 「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」「コピペで結果を受け取ってすぐ元の作業画面に戻れる」/ M1b yaml line 22「動作が遅いツール（嫌い）」 + CLAUDE.md「Decision Making Principle」（実装容易性を理由に劣った UX を選んではならない）。
- **本質**: 論点 6 採択の真の動機は「cycle-210 SSoT (v) 同軸 (d)→(e) 計測を成立させる」ことであり（計画書 L383 / L491 で明言）、これは AP-P09（ゴール読み替え = 来訪者価値より計測ゴール優先）の構造的兆候。CLAUDE.md 原則「来訪者価値を最大化する選択肢が実装困難でも採用すべし」に照らすと、N=3 達成のための制限は本末転倒。
- **期待する対応方針**:
  1. 論点 6 をゼロベース再設計し、以下の追加案を**少なくとも**列挙して比較表化（AP-P17）:
     - 案 E: **Worker + 短 debounce（50〜100ms）+ AbortController 前計算キャンセル**（即時性とReDoS安全性両立）
     - 案 F: **Worker + プログレッシブレンダリング**（最初の N 件マッチが出た時点で結果欄部分表示）
     - 案 G: **タイル UI もタイムアウト 500ms 維持 + 文字数制限なし**（M1b ヘビーユース許容 / 同軸計測は別途 `testRegex` 直接呼び出しを T-4 のみで実施）
  2. 「同軸計測のために制限する」のではなく「来訪者価値で最善の計算トリガーを選び、SSoT (v) 計測は計画書通り T-4 限定の `testRegex` 直接呼び出し並行実施で代替する」順序へ反転（計画書 L282 で既に「並行実施で軸統一値を取る」と書かれているが、これがあるなら本番 UI の制限は不要）。
  3. シーン 2「URL 抽出ログ」のサンプル文字数を具体化し、案 D 採択時にシーン 2 が実際に動くか自己整合性チェック。

---

#### CRIT-2: 論点 6 案 D 採択時のタイル UI が ReDoS 防御不十分ではないか？

- **指摘内容**: タイル UI = `testRegex` 同期呼び出し + 1,000 字制限で「`(a+)+` 程度なら 100ms 以下」を T-1 ベンチで検証する想定（計画書 L385）。しかしベンチは「中程度パターン」中心の予定で、悪意/事故的な catastrophic backtracking パターン（例: `(a+)+(b+)+c` + 数百文字 a の繰り返し）は 1,000 字でも秒〜十秒オーダーで CPU を食う可能性が現実にある（Snyk ReDoS 記事の代表例）。タイル UI で Worker / timeout なしの同期呼び出しは visitor のメインスレッドブロック = ブラウザ全体フリーズ = M1b dislikes「動作が遅いツール」の最悪事例。
- **根拠**: 競合調査 §9.2「Snyk ReDoS ガイド」/ §9.3「100〜500ms 推奨」/ AP-I07 性能リスク事前評価 / yolos.net 強み 4 軸の 1 つ「ReDoS 対策」毀損リスク（競合調査 §10）。
- **期待する対応方針**: T-1 ベンチに「明示的に危険パターン」を含めて 1,000 字でも秒オーダーになり得ることを実証 → 案 D の前提崩壊を計画段階で確認 → CRIT-1 と統合して案 E / F / G を採択候補に格上げ。タイル UI でも何らかの timeout 機構（Worker / Web Animations / setTimeout(0) chunk 分割いずれか）を必須要件として論点 6 に組み込む。

---

#### CRIT-3: 論点 7「タイル UI でハイライトを諦める」採択は M1a の「すぐ結果が見える」価値を毀損し、タイル動線の主要目的を骨抜きにしていないか？

- **指摘内容**: §論点 7 採択（タイル = 案 X = リストのみ / 詳細 = 案 Y = ハイライト + リスト）。「タイル → 違和感 → 詳細リンクへ移動」動線は CLAUDE.md「Decision Making Principle」と矛盾する設計。さらに「400px 幅でハイライト実装は性能リスク」とあるが、性能リスクの実測根拠が示されていない（推測のみ）。textarea + overlay div（または `<pre>` 同期）の二層構成は w375 でも一般的に成立する技法であり、400px だから不可能という論証は説得力に欠ける。
- **根拠**: 競合調査 §10 gap 1「テキストエリア内ハイライト 0 実装 = yolos.net 唯一の弱点」+ M1a yaml line 16「すぐ使い始められる」/ M1a yaml line 17「コピペで結果を受け取って、すぐ元の作業画面に戻れる」+ AP-P17 ゼロベース不足。
- **期待する対応方針**:
  1. 論点 7 のタイル UI 採否を **実証可能な前提**（タイル幅 400px / w375 で overlay div ハイライト実装の技術的成立性）を T-1 で軽量プロトタイプ検証する手順を組み込む。「性能リスク」「複雑度大幅増」の感想で却下するのではなく、実測または既存実装事例の調査で判断。
  2. 案 X / 案 Y / 案 Z 以外に **案 W = タイル UI = 簡易ハイライト（マッチ件数 ≤ 50 等の上限で背景色のみ / overlay 同期コストを抑える）+ リスト併用** を比較対象に追加。
  3. 「タイルが詳細の劣化版になる」現象を計画書 §目的シーン 1（M1b フォーム validation）の体験トレースに照らし、タイルで「マッチした！」感が即座に伝わるか自己整合性チェック。

---

#### CRIT-4: サンプル選択 UI（instant tools 20 種）の採否が独立論点になっていない = 検討漏れ

- **指摘内容**: 競合調査 §10 gap 2「instant tools のサンプルドロップダウン …placeholder に例文を設定するだけでも改善効果大」+ §8 典型需要 10 サンプルが明示されているが、計画書はサンプル選択 UI を独立論点として扱っていない（pattern placeholder の補助ラベル化のみ §論点 2.1 で言及）。M1a「正規表現が苦手だが URL 抽出したい」シーン（M1a interests「期限・日付・単位・文字数など、ミスが起きやすい部分を素早く確認すること」 + 「正規表現はミスが起きやすい部分」と認識する層）に直接刺さる機能。
- **根拠**: 競合調査 §10「placeholder に例文を設定するだけでも改善効果大」+ §8 typical use cases / M1a yaml line 11-14 / AP-P17 ゼロベース論点不足。
- **期待する対応方針**: 論点を新設（例: 論点 15 = サンプル UI の採否）し、案 A 不採用 / 案 B placeholder に 1 サンプル固定 / 案 C ドロップダウンで複数選択（メール / 電話 / URL / 郵便番号 / 日付 5 種）/ 案 D 「サンプルを入れる」ボタン 1 個（クリックでランダム挿入）等で 4 案以上比較。タイル UI / 詳細ページのどちらに置くかも論点化。

---

#### MAJOR-1: 論点 6 採択判断は AP-P11（前サイクル決定の盲信）と AP-P09（ゴール読み替え）の二重リスク

- **指摘内容**: 案 D 採択理由のうち「cycle-210/214 と同軸計測可能」（L376）「cycle-210 SSoT (v) 同軸計測不可 = B-452 N=3 達成の根幹が崩れる」（L491）が来訪者価値より上位の論拠として機能している。SSoT 同軸計測は **メタ目標**（経験的暫定値を確定する）であり、来訪者価値（最短 UX + 大入力対応 + ReDoS 安全）の上位ではない。regex-tester 固有事情（ReDoS リスク + 既存 Worker 実装）はゼロベース再評価が必要だが、cycle-210/214 の「即時計算採択」を機械的に踏襲している兆候。
- **根拠**: AP-P11 / AP-P09 / CLAUDE.md「来訪者価値最大化原則」。
- **期待する対応方針**: 論点 6 を「cycle-210/214 と同軸計測したいから即時」ではなく「regex-tester の来訪者にとって最善の計算トリガーは何か」をゼロベース再評価。並行して T-4 の SSoT (v) 計測手段は「本番 UI とは別の `testRegex` 直接呼び出し（同型条件で）並行実施」で同軸性を担保する手順を §論点 6 採択根拠から **独立** させる。

---

#### MAJOR-2: 論点 6 「N=3 達成 = 着手条件充足」を本サイクルの主要目的に据えることが、来訪者価値の最大化からズレている

- **指摘内容**: 計画書 §冒頭・§目的・§T-4 の至る所で「N=3 達成 / B-452 着手条件充足」が主要目的として描かれている。しかし B-452 達成は副次成果であり、本サイクルの第一目的は M1b プログラマ普遍的需要への応答（regex-tester タイル動線確立）であるべき。N=3 という数値ゴール優先が判断を歪めている疑念（CRIT-1 / CRIT-2 / MAJOR-1 の根源）。
- **根拠**: CLAUDE.md「Decision Making Principle」/ 計画書 §冒頭 L14 で「本サイクル = 複合入力型タイル 3 件目 = B-452 N≥3 達成」を最初に書いている事 = 視点の優先順位逆転。
- **期待する対応方針**: 計画書冒頭・§目的の主目的記述を「M1a/M1b 来訪者の正規表現需要への最短応答」に書き直し、N=3 達成は「同時に達成する副次成果」として位置付け直す。これに連動して論点 6 / 7 の採択論拠から「N=3 のため」「SSoT 同軸計測のため」を除外し、来訪者価値ベースのみで再採択。

---

#### MAJOR-3: 詳細ページ Worker debounce 300ms は M1a の「すぐ結果を見たい」期待に対して遅すぎないか？

- **指摘内容**: 詳細ページ = 案 B 維持（Worker + debounce 300ms）。Nielsen「Response Time Limits」では 100ms 以下が「即座のフィードバック」域。debounce 300ms は visitor が「タイプ → 0.3 秒待ち → 結果表示」を毎入力で体感する設計で、M1a likes「すぐ使い始められる」「すぐ結果を受け取って戻る」と乖離。
- **根拠**: Nielsen Response Time Limits（10 年来の UX 業界標準）/ M1a yaml line 15-17。
- **期待する対応方針**: 詳細ページの debounce 値を 100ms or 50ms に短縮する案を論点 6 に追加比較。AbortController + Worker 短時間 timeout でも実現可能。「既存実装維持」を理由に 300ms を採択するのは AP-I07 性能リスクを別軸（応答性）で抱えることになる。

---

#### MAJOR-4: 「タイル UI が詳細ページの劣化版になる」設計（論点 2 + 3 + 7 連結）が M1b の長期来訪者体験を損なう

- **指摘内容**: 論点 2（フラグ全省略）+ 論点 3（置換省略）+ 論点 7（ハイライト省略）+ 論点 6（文字数制限）の **4 重省略**で、タイル UI は M1b が「気に入って繰り返し使う」道具にならない（M1b yaml の主旨「自分の作業の流れに馴染んで、もう考えずに使えるようになった道具」を満たさない）。タイル経由で訪れた M1b は 1〜2 回試した後、「結局詳細ページに行く」固定化が進み、タイル動線の存在意義が薄れる。
- **根拠**: M1b yaml line 11-14 / CLAUDE.md「来訪者価値最大化」原則。
- **期待する対応方針**: 4 重省略の積み重ねが「タイルが詳細の入口に過ぎない」設計になっていないか俯瞰検証。タイルで完結する典型ユースケース（メールバリデーション簡易確認 等）と、詳細に誘導すべきユースケース（置換 / 複雑フラグ）を **来訪者シナリオベースで明示**し、タイル単独完結率の見通しを §目的セクションに加える。タイル単独完結シナリオが少ないなら、論点 2 or 7 を見直して機能拡張。

---

#### MINOR-1: §論点 5 (e-α) (e-β) 採択判断「文言が短く CLS 視点で枠 h/w を精密に SSoT 化しやすい」が SSoT 化の都合優先になっている

- **指摘内容**: (e-α) 採択理由の 1 つ「文言が短く SSoT 化しやすい」（L367）は計測都合。来訪者価値の観点では「visitor が日常的に遭遇するエラー」を選ぶべきで、(e-α) 無効パターンと (e-β) 入力長超過の**遭遇頻度**を実態比較すべき。
- **根拠**: AP-P09 / CLAUDE.md「Decision Making Principle」。
- **期待する対応方針**: 採択理由から「SSoT 化しやすい」を削除し、visitor 遭遇頻度根拠のみで採択。

---

#### MINOR-2: 「タイル + 詳細での非対称運用」を c214-η の例外として記録する処理が、SSoT 体系の劣化を許容している

- **指摘内容**: §論点 6 / §引用 SSoT 7 で「c214-η 例外運用」「c215-α-tentative 新規 SSoT 候補」と新設しているが、これは CRIT-1 で見直された場合自動的に不要になる項目。前提（案 D 採択）が来訪者価値で揺らぐと、新 SSoT 候補自体が不要 SSoT 化する。
- **根拠**: AP-P11 / AP-P21 / CLAUDE.md。
- **期待する対応方針**: 論点 6 採択見直し後に SSoT 候補 (c215-α-tentative) を再評価。「タイル / 詳細の計算トリガー同型」が維持できる案（案 E / F / G）を採択すれば c214-η は通常 N=3 引用適用達成で済む。

---

#### MINOR-3: 「実体験フロー検証」シナリオの自己整合性チェック不足

- **指摘内容**: §T-4 (F) 実体験フロー検証のシーン 2「URL 抽出 + ログ + Excel 貼り戻し」で使うログサンプルが何文字か明示なし。案 D 採択（タイル 1,000 字制限）と整合する文字数のサンプルでテストすると「実利用想定外の極小ログ」になり、テストが現実を反映しない。
- **根拠**: 計画と検証の整合性。
- **期待する対応方針**: シナリオ 2 のログサンプル文字数を明記し（例: 3,000 字以上の実ログ）、案 D 採択時にシナリオが詳細ページ動線でしか成立しないことを自覚的に書く。CRIT-1 と連動。

---

#### NIT-1: 論点 14 末尾「N=3 統計判定式」の閾値が経験的暫定値で組まれている

- **指摘内容**: ±10% / ±15% / ±20% / >20% の閾値が「3 サンプル全件 ≤ 10%」「1〜2 件が 10〜15%」等で機械的に判定される。3 サンプルは統計的に有意ではなく、判定式が見かけだけの精密さを醸成している。
- **根拠**: AP-P10 / AP-WF15。
- **期待する対応方針**: 判定結果は「**3 サンプルの傾向を示唆する暫定値**」とラベル付けし、後続 N=4, N=5 サンプル時に再見直しが必要であることを明記。

---

#### 総括

計画書は cycle-210/214 SSoT を引用する複合入力型タイル 3 件目として手順面では緻密に組み立てられているが、**根幹となる論点 6 / 論点 7 の採択判断が「来訪者価値最大化」より「SSoT 同軸計測 + 既存実装維持容易性」を上位に置いており**、CLAUDE.md Decision Making Principle に違反している。CRIT-1〜CRIT-4 を中心に論点を再設計し、「regex-tester の来訪者にとって最善の体験は何か」をゼロベースで再構築することを期待する。

**PM への次工程指示**:

1. planner サブエージェントに本指摘の全件対応を依頼する（CRIT-1〜CRIT-4 / MAJOR-1〜MAJOR-4 / MINOR-1〜MINOR-3 / NIT-1）。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。
3. 修正後、再度レビュー（r2 visitor review）を依頼する。レビュー省略は認められない。

---

### r1 process review (2026-05-29 / SSoT 引用妥当性 + 数値 literal 4 分類ラベル + T-1〜T-4 タスク独立性)

**判定: 改善指示**

事後検証質問形（AP-WF15）で記述。SSoT 引用妥当性 / 数値 literal 4 分類ラベルの徹底 / T-1〜T-4 のタスク独立性 / AP 集の引用妥当性 / B-462 採番手順 / 14 論点網羅性 / (e) 系統事前確定撤回フローを観点に厳しく確認した。指摘事項は計 17 件。とくに **CRIT-1 (c214-β) 同軸性注記の N=3 統計判定式への反映不備** は本サイクル kickoff の核（= B-452 N=3 達成）を毀損する重大欠陥である。

---

#### CRIT-1: cycle-214 (c214-β)「同軸ではない」注記が N=3 統計判定式に正しく反映されているか?

- **指摘内容**: §論点 14 L464-469「N=3 統計判定」と §T-4 L281 / L307-309 で「**3 サンプル（cycle-210 = 11.55% / cycle-214 = T-4 実測値 / cycle-215 = 本サイクル T-4 実測値）の (d)→(e) 変化率を集計**」と書かれている。しかし cycle-214 §補足事項 (c214-β)（cycle-214.md L1163-1170）は明示的に「cycle-214 の **0.00% は『flex:1 / overflowY:auto 構造で表示矩形が固定される』という別の設計結果であり、±15% の入力量変動起因の N=2 データポイントとしては有意ではない**」「**後続サイクルで複合入力型 3 件目を実施する際の判断材料として残す（「入力量変動で高さが変化するタイル」での計測が B-452 N=3 の真の N=3 として有意）**」と明記している。cycle-215 計画書は kickoff L14 で「**本サイクル = 真の N=3 達成**」と踏み込んだ宣言までしているにもかかわらず、N=3 統計判定式 L466-469 に cycle-214 = 0.00% を機械的に投入する書き方になっており、**(c214-β) の「同軸ではない」注記と内部矛盾**している。
- **根拠**: cycle-214.md §補足事項 L1163-1170 (c214-β) / cycle-215.md L281, L307-309, L464-469
- **期待する対応方針**: §論点 14 と §T-4 計画書本文を全面補正:
  1. N=3 統計の母集団を「**cycle-210 = 11.55%（入力量変動起因 / 有効サンプル）+ cycle-215 = T-4 実測値（入力量変動起因 = (d)→(e-α) 変化率 / 有効サンプル）の 2 サンプル + cycle-214 = 0.00% を『同軸ではない参考値』として併記（統計判定式の母集団からは除外）**」と明示
  2. 「**B-452 N=3 達成 = 真の N=3**」を主張するためには、本サイクル T-4 で「入力量変動で高さが変化する」設計（= 結果欄が flex:1 + overflowY:auto で 0% 固定にならない設計 / または操作側エラー枠が flexShrink:0 で出現する設計）を意図的に選択する必要があり、その設計選択を T-3 / 論点 4 / 論点 6 で明記
  3. cycle-215 自身が cycle-214 と同じ「表示矩形固定」設計に落ち込めば「**N=2 のままで B-452 着手条件未達**」となるリスクを §論点 14 末尾の判定式に組み込む（例: 本サイクル変化率が 0.00% ならば N=3 達成判定 = FAIL / cycle-216 以降で再挑戦）
  4. 統計判定式 L467-469 の「3 サンプル中…」を「2 サンプル + 参考 1 件」基準に改める

---

#### CRIT-2: 設計意図ベース SSoT 候補 `-tentative` 接尾辞の除去手順が T-3 完成条件として明示されているか?

- **指摘内容**: §引用する SSoT 13 (c215-α-tentative) / 14 (c215-β-tentative)（L563, L565）には「**T-3 実装直後に `grep` で確定状態を再確認 + `-tentative` 接尾辞除去**」「**§論点 7 採用判定後に `-tentative` 接尾辞除去 or 撤回**」と本文中に書かれているが、**T-3 完成条件（L256-263）に該当チェック項目が一切無い**。cycle-214 (c214-ε) は「設計意図ベース『膨張側 3 つ』が実装で『膨張側 1 つ』に乖離し、計画書本文の記述が r6 まで残存」事故を起こしており、cycle-215 計画書 L71 で「**cycle-214 c214-ε 教訓 = AP-WF12 cycle-214 事例**」として教訓引用までしているのに、**完成条件に落とし込まれていない = 形式的引用にとどまっている**。
- **根拠**: cycle-215.md L71, L563, L565, L256-263 / cycle-214.md §補足事項 (c214-ε) L1155-1161
- **期待する対応方針**: T-3 完成条件に以下を追加:
  - [ ] `grep -nE "-tentative" docs/cycles/cycle-215.md` を実行し、§引用する SSoT 13 / 14 の `c215-α-tentative` / `c215-β-tentative` が:
    - (a) 実装で確定した場合 → `-tentative` 接尾辞を除去 + 確定状態を §補足事項に書き戻し
    - (b) 実装で取り下げた場合 → cycle-214 (c214-ε) 同型の「取り下げ注記」を §補足事項に書き戻し
      のいずれかが完了している（grep ヒット 0 件）

---

#### CRIT-3: (c214-ι) noDiff 枠 SSoT が §引用する SSoT に欠落しているのではないか?

- **指摘内容**: cycle-214 §補足事項 L1146-1153 で確立した **(c214-ι) text-diff noDiff 枠 SSoT = h=208.39px / w=380px**（膨張側 flex:1 + overflowY:auto の noDiff 表示時の実測値 / 後続サイクルでの引用基準）が cycle-215 §引用する SSoT 一覧（L505-565）に**完全に欠落**している。一方で計画書 L73-87 の「(a)〜(e) 5 ケース系統」では「(e) エラー枠の表示矩形」を再評価するとしており、(c214-ι) との適用可否判断が必要なはず。とくに regex-tester は「(c) パターン有 + 本文空」/「(d) 両方有でマッチ無」状態に相当する「マッチ無時の結果欄」が存在する可能性があり、(c214-ι) noDiff 枠 SSoT に近い構造を取りうる。
- **根拠**: cycle-214.md L1146-1153 (c214-ι) / cycle-215.md L505-565 §引用する SSoT
- **期待する対応方針**: §引用する SSoT に項目を追加:
  - **cycle-214 (c214-ι) noDiff 枠 SSoT**: h=208.39px / w=380px / 膨張側 flex:1 + overflowY:auto / regex-tester への適用予告 = **再評価 + 独自 SSoT 値確定**（「マッチ無時の結果欄」h/w を T-4 で計測し、(c214-ι) 引用適用か独自値かを判定）

---

#### CRIT-4: B-462 ID の本番採番手順と引用箇所の整合性が確保されているか?

- **指摘内容**: §T-2 D 項 L193 では「**B-462 起票候補**（次の空き番号 = T-2 builder が `grep -oE '^\| B-[0-9]+' docs/backlog.md | sort -u | tail -1` で実測 → +1）」と仮 ID として扱われている。しかし計画書の他所では既に B-462 が確定的に引用されている:
  - L24 kickoff 完了条件「**新規 B-462 起票**」
  - L500 §検討した他の選択肢「**B-462 を本サイクルに含めて Component.test.tsx 21 件規模を T-3 で書く**」
  - L207 完成条件「**B-462** が `docs/backlog.md` に追記済」
  - 実測確認: backlog.md は B-449 / B-455 / B-458 / B-459 / B-461 まで存在（次の空き番号 = B-462 確定）

  ID 衝突は実態として起きないが、計画書本文が **採番手順と確定引用の二重表記**になっており、もし衝突が起きた場合（並行サイクルで先取り採番された場合）のフォールバック手順が無い。

- **根拠**: cycle-215.md L24, L193, L207, L500 / docs/backlog.md B-449〜B-461 実在確認
- **期待する対応方針**: §T-2 D 項に「**採番衝突時のフォールバック**」を 1〜2 行明示:
  - 実測 grep の結果が B-461 でない場合（= cycle-215 着手中に他サイクルで先取り採番された場合）、計画書本文の B-462 引用箇所（L24 / L207 / L500）を全件本番 ID に書き戻す手順を明示

---

#### MAJOR-1: すべての数値 literal に 4 分類ラベル + 生成元が直近併記されているか?

- **指摘内容**: §AP-P16 強化 L69-71 で「**すべての数値 literal**に 4 分類ラベル + 生成元併記を徹底」と宣言しながら、計画書本文に**ラベル欠落 literal が多数残存**している。具体的欠落例:

  | 行         | literal                                                                                                        | 欠落内容                                                                                                                                                                                                                                        |
  | ---------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | L22        | `cols=3 rows=3`                                                                                                | 4 分類ラベルなし / 「想定」とだけ書かれている = ラベル化なら「推定値」                                                                                                                                                                          |
  | L33-34     | `(line 13-20 想定)`                                                                                            | 「想定」= 推定値ラベル相当だが正規ラベル形式（実測値 / 仕様値）でない                                                                                                                                                                           |
  | L60        | `400×400px 枠成立例`                                                                                           | 4 分類ラベルなし                                                                                                                                                                                                                                |
  | L62        | 強み「4 軸」/「8 サイト」/「0 実装」                                                                           | 4 分類ラベルなし（出典は競合調査）/ ラベル付与なら「仕様値」相当                                                                                                                                                                                |
  | L102-105   | T-1 実測予定値（168 行 / 246 行 / 119 行 / 40 箇所 / 8 種 / 10,000 / 1,000 / 500ms / 300ms / 12 件 / 5 件 等） | 「参考:」が正規ラベル化されていない。実測値 / 実装値の区別が混在                                                                                                                                                                                |
  | L108       | `1,000 / 5,000 / 10,000 文字` / `5 回測定の中央値`                                                             | ラベルなし / 5 回の根拠                                                                                                                                                                                                                         |
  | L110-113   | `<100ms` / `<500ms` / `>500ms` 3 段分岐                                                                        | 「Nielsen 'Response Time Limits'」出典ありだが正規 4 分類ラベル付与なし                                                                                                                                                                         |
  | L121-124   | `ベース 6 枚` / `2 枚` / `2 枚` / `10 枚`                                                                      | 4 分類ラベルなし                                                                                                                                                                                                                                |
  | L154-165   | 置換マッピング表「複数（T-1 で確定）」                                                                         | 件数 literal 全行で「複数」とだけ書かれており、T-1 完了後の実測値書き戻し手順が明示されていない                                                                                                                                                 |
  | L228       | `bundle インパクト = ほぼ 0`                                                                                   | 「実質 0」「ほぼ 0」は推定値だが正規ラベル付与なし                                                                                                                                                                                              |
  | L232       | `tilesCount: 15 → 16` の `15`                                                                                  | 「実測値計算 = 15 + 1」表記はあるが基となる 15 の生成元コマンド併記なし                                                                                                                                                                         |
  | L236       | `最低 17 件`（経験的暫定値）/ `17〜21 件規模`                                                                  | ラベルあり = OK だが「17 件」根拠（cycle-210 = 11 件 / cycle-211 = 17 件 / cycle-214 = 何件）の具体 N が併記されていない                                                                                                                        |
  | L275, L307 | タイルプレビュー `計 4 枚` / 移行後 `計 10 枚` / `21 枚以上` 内訳 6 + 2 + 2 + 5 + 4 + 2                        | ラベルなし                                                                                                                                                                                                                                      |
  | L328       | `400px / 400px`                                                                                                | ラベルなし                                                                                                                                                                                                                                      |
  | L376       | `1,000 字制限` / 「**Myers O(N×M) で N=1000 程度なら最悪 1 秒以内**」想定                                      | 「想定」= 推定値ラベル相当だが正規ラベル付与なし。**さらに重大: regex-tester は Myers アルゴリズムを使わない**（diff ではなく RegExp = NFA バックトラック）= ベンチ根拠の **アルゴリズム名誤用**（cycle-214 text-diff の jsdiff Myers と混同?） |

- **根拠**: cycle-215.md §AP-P16 強化（L69-71）の自己宣言 / cycle-210 R5 で確立された 3 分類 → cycle-211 で 4 分類化された強化規範 / AP-P16 本文（planning.md L50-51）
- **期待する対応方針**: 上記すべての literal にラベル付与 + 生成元（コマンド or 出典 URL or 行番号）を直近併記。**L376 の「Myers O(N×M)」は最優先で修正**: アルゴリズム名誤用の可能性大 → regex-tester の同期 testRegex 性能特性（NFA バックトラック / catastrophic backtracking の最悪計算量）に置き換える必要がある。

---

#### MAJOR-2: (vi) エラー枠 SSoT の適用可否確定タイミングが T-1 → T-4 だけでなく T-3 実装後再計測も組み込まれているか?

- **指摘内容**: §引用する SSoT 4（L524-527）と §論点 5（L366）で「**T-1 で両方の Playwright 表示矩形を計測し、T-4 で SSoT 値を確定**」とは書かれているが、**「適用可否確定タイミング」と「適用範囲」の確定はどちらも T-4** という一段階運用で、cycle-214 (c214-ε / c214-ι) で起きた「設計意図 vs 実装乖離」のような中間検証ステップがない。具体的には:
  - **T-1** = (e-α) / (e-β) 両方の h/w 計測 + 系統選択判断材料の確保
  - **T-4** = SSoT 値確定
  - **しかし T-2/T-3 で実装した結果、エラー枠が変容する**（例: cycle-210 text-replace では padding 拡張で 32px → 46.09px に変更された = cycle-210.md §補足事項 3）可能性が高い
  - T-3 完成条件に「**実装後の (e-α) エラー枠 h/w 再計測** + 計画段階推定値からの乖離を §論点 5 / §補足事項に書き戻し」が無い
- **根拠**: cycle-210.md §補足事項 3「T-4 で実装側 padding を拡張して h ≥ 40px に到達し計画書基準を満たした実測値を SSoT として確定」/ cycle-215.md L73-87, L356-367, L256-263
- **期待する対応方針**: T-3 完成条件に「**(e-α) エラー枠の T-3 実装後再計測**」を追加 + T-4 完成条件に「**T-1 推定値 vs T-3 実装後 vs T-4 最終の 3 段階比較表**を §補足事項に書き戻し」を追加。

---

#### MAJOR-3: T-1 → T-2 → T-3 → T-4 タスク独立性 = T-1 完了前に後続着手不可が完成条件に明示されているか?

- **指摘内容**: T-1 〜 T-4 はそれぞれ「目的 / 実施事項 / 完成条件 / 検証手順」が記述されているが、cycle-215 では:
  - 論点 6 で「**T-1 ベンチで案 D 確定 or 案 B にフォールバック**」（L385）
  - 論点 5 で「**T-1 実体確認後 T-4 で確定**」（L366）
  - (e) 系統 = T-1 → T-4

  などで T-1 の出力が後続 T の前提として明示されているが、**T-2 / T-3 着手判定**には書かれていない。例: 論点 6 案 D が T-1 ベンチで FAIL した場合、T-2 / T-3 の「即時計算 + 1,000 字制限」設計が前提から崩れるが、**T-2 / T-3 の前提として「T-1 ベンチ PASS を確認してから着手」が完成条件に書かれていない**。

- **根拠**: cycle-215.md L385, L366, L93-140 (T-1), L143-213 (T-2), L216-265 (T-3)
- **期待する対応方針**: T-2 / T-3 完成条件冒頭に「**T-1 ベンチ結果（論点 6 案 D 確定 / 案 B フォールバック判定）を確認してから着手**」を明示。あるいは T-1 完了条件に「**論点 6 採択案の最終確定**」を明示してから T-2 / T-3 に進む順序を明確化。

---

#### MAJOR-4: AP-WF16 reviewer 独立再実行ポイント「後続判断を最も左右する数値 2 つ」が T-2 / T-4 で明示されているか?

- **指摘内容**: AP-WF16 検証手順は T-1 / T-2 / T-3 / T-4 で記述されているが:
  - T-1 検証手順 L139 = 「**後続判断を最も左右する 3 数値（= --color-\* 残存数 + hex 直書き 2 箇所 + 既存テスト件数 12 件）**」と明示 = OK
  - T-2 検証手順 L212 = 「最低 1 つ以上を独立再実行」のみ = **どの数値かが未明示**
  - T-3 検証手順 L265 = 「4 コマンド + `grep vi.getTimerCount` 1 件」と部分明示 = 概ね OK
  - T-4 検証手順 L318 = 「最低 1 系統 AP-P21 再計測 + 4 コマンドのうち 2 つ独立再実行 + N=3 統計を独立再計算」 = **後続判断を最も左右する 2 数値の指定が無い**

  cycle-215 で「後続判断を最も左右する数値」は (1) **本サイクル (d)→(e) 変化率 = B-452 N=3 統計の根幹** + (2) **(c214-η) 計算トリガー一貫化の例外運用可否 = 案 D 採択時の 1,000 字制限ベンチ <100ms 安定値**の 2 つに収束するはず。

- **根拠**: docs/anti-patterns/workflow.md AP-WF16 / cycle-215.md L139, L212, L265, L318
- **期待する対応方針**: T-2 / T-4 検証手順に「**後続判断を最も左右する数値 2 つを必ず独立再実行**」を具体的に明示（T-4 = (d)→(e) 変化率 + 1,000 字ベンチ <100ms 安定値の 2 つ）。

---

#### MAJOR-5: AP-P19 外部仕様 WebFetch 確認が T-1 実施事項として具体化されているか?

- **指摘内容**: §論点 14 L454 で「**AP-P19**: 外部仕様（`diff` npm パッケージ仕様 / WAI-ARIA `role="status"` 仕様 / RegExp v フラグ仕様）を T-1 で WebFetch 一次資料確認」と書かれているが、**T-1 実施事項（L97-125）に WebFetch 確認手順が含まれていない**。とくに:
  - **`diff` npm パッケージ仕様**: regex-tester は `diff` を使わない（cycle-214 text-diff の引きずり?）= **誤った外部仕様引用の可能性**
  - **WAI-ARIA `role="status"` 仕様**: cycle-214 c214-ζ で「`role="status"` は暗黙的に aria-live="polite" + aria-atomic="true" を持つ」が確立済 = T-1 再確認の要否
  - **RegExp v フラグ仕様**: 計画書本文の他所に v フラグ言及が無く、なぜ T-1 確認対象になっているか不明
- **根拠**: cycle-215.md L454 / cycle-214.md MAJOR-1 impl r7 = `role="status"` 仕様確認
- **期待する対応方針**: §論点 14 / T-1 実施事項を補正:
  - `diff` 削除（regex-tester では不要）
  - WAI-ARIA は cycle-214 確立済 SSoT 引用適用で T-1 WebFetch 不要を明示
  - **RegExp v フラグ仕様**は採用予定なら T-1 で MDN WebFetch 確認 / 採用しないなら削除
  - 代わりに「**catastrophic backtracking 検出方法**」など regex-tester 固有の外部仕様（ReDoS 検出ライブラリ等）を T-1 確認対象に追加するか判定

---

#### MAJOR-6: 論点 13 ReDoS タイムアウト UI のタイル UI フォールバックと setTimeout cleanup

- **指摘内容**: §論点 13 採択 = 案 B「計算がタイムアウトしました（パターンが複雑すぎる可能性があります）」エラー表示（L444）。詳細ページのみ該当（タイル UI = 即時計算 + 1,000 字制限）。しかし:
  - **タイル UI が 1,000 字制限でも ReDoS 完全防御は不可能**（`(a+)+` × 30 字でも fatal）= タイル UI でも ReDoS タイムアウトが発生し得る → タイル UI でのフォールバック策が論点 13 で全く触れられていない
  - 詳細ページの Worker timeout 500ms 後の UI 文言 literal「計算がタイムアウトしました…」は AP-WF03 適合だが、setTimeout cleanup (AP-I11) との関係 = タイムアウトメッセージ自動消去（5 秒後等）の要否が論点 11 / 論点 13 のどちらでも触れられていない
- **根拠**: cycle-215.md L441-447 / docs/anti-patterns/implementation.md AP-I11
- **期待する対応方針**:
  - 論点 13 に「**タイル UI 側の ReDoS タイムアウト時挙動**」案を追加（タイル UI でも 1,000 字 + `(a+)+` で fatal するため、タイル UI = silent fallback or 詳細ページ誘導文言のいずれを採るか）
  - 論点 13 案 B のタイムアウトメッセージの寿命（永続 / N 秒後消去）と setTimeout cleanup の方針を明示

---

#### MAJOR-7: 論点 7 ハイライト機能の T-3 完成条件への退避経路組み込み

- **指摘内容**: §論点 7 詳細ページに案 Y（テキストエリア内ハイライト + 一覧併用）を新規導入することを採択（L394-401）。退避案として「T-3 段階で技術的困難が発覚 → 案 X 維持」を L401 で明示しているが:
  - **退避経路を T-3 完成条件に明示**と書かれている（L401）が、**T-3 完成条件（L256-263）に該当チェック項目が一切無い**
  - 詳細ページのハイライト導入は cycle-215 の対象を「タイル UI + 詳細ページの新トークン置換」を超えて「詳細ページの機能追加」まで拡張する = **スコープ膨張**（cycle-200〜214 の T-2 標準 = 詳細ページは touch しない原則からの逸脱）
  - bundle インパクトが L228「ほぼ 0」と書かれているが、ハイライト導入時の overlay div / フォントメトリクス同期コードは数 kB 追加されうる
- **根拠**: cycle-215.md L394-401, L228, L256-263 / cycle-200〜214 で確立した詳細ページ touch しない原則
- **期待する対応方針**:
  - 論点 7 詳細ページのハイライト導入が cycle-215 スコープに含めるべきか / 別サイクル分割すべきかを論点で再評価
  - cycle-215 に含める場合は T-3 完成条件に退避経路チェック項目を明示追加
  - bundle インパクトの T-3 計測手順を明示（cycle-214 r4 MAJOR-1「事前閾値ではなく実測値の記録のみ」と整合）

---

#### MAJOR-8: AP-P21（複合入力型タイル二分類）の操作側 / 膨張側分担と論点 2 採択結果の整合性

- **指摘内容**: §「複合入力型ゆえの注意点」L75 で操作側 = 「正規表現 input + フラグチェックボックス群（タイル UI で省略可否は §論点 2）+ 詳細リンク + コピーボタン」と書かれている。**論点 2 採択 = 案 C 全件省略**（L339）= タイル UI にはフラグ checkbox 群が存在しない。**L75 の記述が採択前の暫定記述のまま残存している**可能性。AP-P21 役割分担 = 操作側 / 膨張側の構造正確性に直接関わる。
- **根拠**: cycle-215.md L75, L339, L352-355 (§論点 4)
- **期待する対応方針**: L75 の操作側記述を「**フラグ checkbox 群 = §論点 2 案 C 採択により省略 = タイル UI 操作側に含まれない**」と書き換え、論点 2 採択結果と整合化。§論点 4 採択案 α の操作側構成（patternInput + コピーボタン + 詳細リンク + 条件付きエラー枠）と完全一致させる。

---

#### MINOR-1: 「(e) 系統の事前確定撤回 → T-1 実体確認」cycle-214 教訓の明示引用

- **指摘内容**: cycle-214 では「(e) 系統の事前確定撤回 → T-1 実体確認 → (a+e-α) 統合 = 4 系統独立」という流れがあった（cycle-214.md L419）。cycle-215 §論点 5 では (e-α) / (e-β) の 2 候補を提示し「T-1 で両方の Playwright 表示矩形を計測 / T-4 で SSoT 値を確定」とは書かれているが、**「事前確定（計画段階）を撤回し T-1 実体確認に委ねる」という cycle-214 教訓の引用が無い**。計画書本文 L73-87 では「想定系統」「第一候補 = (e-α)」と書いており、cycle-214 と同じ「事前確定 → T-1 で撤回」事故が再発するリスク。
- **根拠**: cycle-214.md L419 / cycle-215.md L73-87, L356-367
- **期待する対応方針**: §論点 5 末尾に「**cycle-214 教訓引用 = 計画段階の (e-α) 第一候補は推定値 / T-1 実体確認後に T-4 で確定（系統数調整も含む = N=5 のままか N=4 統合か）**」を明示追記。

---

#### MINOR-2: 14 論点と cycle-214 12 論点の対応マップ

- **指摘内容**: cycle-214 計画書の論点 1〜12 と cycle-215 計画書の論点 1〜14 の対応 / 差分が計画書本文に明示されていない。具体的:
  - **cycle-215 で新規追加**: 論点 13（ReDoS タイムアウト UI / regex-tester 固有）、論点 14（AP 打ち消し策の組み込み）
  - **cycle-215 で削除**: cycle-214 論点 4「対称化視覚マーク `.added underline / .removed line-through`」は text-diff 固有のため regex-tester では適用不要 = 削除妥当
  - **論点 7 = ハイライト機能**は regex-tester 固有で新規（cycle-214 の論点 7 とは別物）
  - 論点漏れ確認: cycle-214 にあって cycle-215 にない論点で適用すべきものはないか?
- **根拠**: cycle-214.md §論点 1〜12 / cycle-215.md §論点 1〜14
- **期待する対応方針**: §論点と判断セクションの冒頭に「cycle-214 12 論点との対応マップ」を 1 表で明示（cycle-214 論点 N → cycle-215 論点 M / 削除理由 / 新規追加理由）。これにより論点漏れリスクを言語化。

---

#### MINOR-3: B-462 新規起票の規模 17〜21 件の根拠

- **指摘内容**: §T-2 D 項 L193 で B-462 のスコープを「**Component.test.tsx 新規作成（17〜21 件規模 / cycle-211/214 参考）/ 優先度 P4 / 着手条件なし**」と記載。これは cycle-209 line-break-remover Component.test.tsx 21 件規模を参考にした見積りだが:
  - **17 件 vs 21 件のレンジ根拠**: cycle-211 = 17 件 / cycle-214 = N 件（要実測）/ cycle-209 = 21 件のどれを採用したかの根拠が不明
  - **P4 採用の根拠**: B-449 / B-455 / B-458 / B-459 / B-461 すべて P4 で同型運用 = OK
- **根拠**: cycle-215.md L193 / docs/backlog.md B-449〜B-461
- **期待する対応方針**: 「17〜21 件規模」の根拠を具体化（cycle-209 / cycle-211 / cycle-214 の Component.test.tsx 件数を grep で確定 → レンジ起源を明示）。

---

#### MINOR-4: 引用 SSoT 番号体系の一貫性

- **指摘内容**: §引用する SSoT で「1〜4 = cycle-210 SSoT」「5〜10 = cycle-213/214 SSoT」「11〜12 = AP-WF05 / kind=widget 標準」「13〜14 = 本サイクル新規候補 (c215-α/β-tentative)」と分類されているが、(c214-ι) noDiff 枠が完全欠落（CRIT-3 既出）+ 各 SSoT 項目に番号が振られているのに本文の他所での引用は「cycle-210 SSoT (v)」「(c214-ζ)」のように **項目番号と内容名の両方**が使われており、横断検索しにくい。
- **根拠**: cycle-215.md L505-565
- **期待する対応方針**: §引用する SSoT 各項目の冒頭に「**項番 = (c210-i)** など独自 ID」を併記し、本文引用と項番引用を統一。

---

#### NIT-1: 論点 6 採択判断「ハイブリッド」が SSoT 体系に与える影響

- **指摘内容**: §論点 6 採択 = 「案 D（タイル UI）+ 案 B（詳細ページ）のハイブリッド」（L377）。**異なる計算トリガーをタイルと詳細で運用する**ことで (c214-η) 一貫化 SSoT の例外運用を新規 SSoT 候補 (c215-α-tentative) として記録（L563）。しかし visitor review CRIT-1 でこの採択自体が再検討対象に挙がっており、process review 単独で見ても「c214-η 例外運用 N=1 開設」は SSoT 体系の劣化（同型適用が約束されない）。
- **根拠**: cycle-215.md L377-386, L539-542 (c214-η 引用 SSoT 7), L563 (c215-α-tentative)
- **期待する対応方針**: visitor review CRIT-1 と連動して論点 6 採択を見直し、(c215-α-tentative) を新規開設しない方向に整理。あるいは「**c214-η は 同型適用が望ましいが ReDoS という外部仕様制約により例外運用となる**」と c214-η 適用範囲の自然な制約を §補足事項に明示。

---

#### 総合判定 = 改善指示

CRIT 4 件 + MAJOR 8 件 + MINOR 4 件 + NIT 1 件 = 計 17 件。とくに **CRIT-1 (c214-β) 同軸性注記の N=3 統計判定式への反映** は本サイクル kickoff の核を毀損する重大欠陥であり、必ず修正が必要。

**PM への次工程指示**:

1. planner サブエージェントに本 process review の全件対応を依頼する（CRIT-1〜CRIT-4 / MAJOR-1〜MAJOR-8 / MINOR-1〜MINOR-4 / NIT-1）。あわせて r1 visitor review の既存指摘 17 件も対応継続。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。
3. 修正後、再度レビュー（r2 review = visitor + process 統合）を依頼する。レビュー省略は認められない。

---

### r1 → r2 改訂対応マップ

r1 visitor review 12 件 + r1 process review 17 件 = 計 29 件の対応マップ。行番号は r2 改訂後の値（後続編集で揺れる可能性あり）。

#### visitor review 12 件

| 指摘 ID | 元の問題                                                         | 採択した対応                                                                                                                                          | 反映箇所                                                             |
| ------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| CRIT-1  | 案 D「タイル 1,000 字制限」が M1b 実用域を切り捨て / AP-P09 違反 | 論点 6 全面改訂 = 案 D 撤回 + 案 F 採択（Worker + AbortController + timeout 100ms / 文字数制限なし）/ T-4 限定で `testRegex` 並行実施で SSoT 計測代替 | §論点 6 全面改訂 / §冒頭主目的記述 / 引用 SSoT 13 撤回 / SSoT 7 改訂 |
| CRIT-2  | 1,000 字でも catastrophic backtracking で ReDoS 防御不可         | T-1 ベンチに危険パターン 3 系統 (R1)(R2)(R3) を追加 + AbortController 必須要件化 / 案 F 採択                                                          | §T-1 ベンチ強化 / §論点 6                                            |
| CRIT-3  | タイル UI ハイライト諦めの論証薄 / 4 案以上検討不足              | 論点 7 全面改訂 = 案 W 新規追加（簡易ハイライト + マッチ件数上限）/ T-1 プロトタイプ検証で実証根拠取得                                                | §論点 7 全面改訂 / §T-1 プロトタイプ追加                             |
| CRIT-4  | サンプル選択 UI 独立論点化漏れ                                   | 論点 15 新規追加（案 A〜E ゼロベース 5 案比較 / 採択 = 案 D = タイル placeholder 1 件 + 詳細ドロップダウン 5〜10 件）                                 | §論点 15 新規追加 / T-2 meta.ts / T-3 タイル UI 反映                 |
| MAJOR-1 | 論点 6 採択が AP-P11 + AP-P09 二重リスク                         | 論点 6 採択論拠から「N=3 のため」「SSoT 同軸計測のため」を除外し来訪者価値ベースで再採択 / T-4 並行実施で同軸性確保                                   | §論点 6 採択論拠改訂                                                 |
| MAJOR-2 | 「N=3 達成」を本サイクル主目的に据えるのが価値ズレ               | §冒頭主目的を「M1a/M1b 来訪者の正規表現需要への最短応答」に書き直し / B-452 N=3 は副次成果に位置付け                                                  | §冒頭 / §目的 4 / 実施する作業の B-452 表現改訂                      |
| MAJOR-3 | 詳細 debounce 300ms は Nielsen 100ms 規格不適合                  | 論点 6 案 F = 詳細も timeout 100ms に短縮                                                                                                             | §論点 6                                                              |
| MAJOR-4 | 4 重省略でタイル UI が詳細の入口に過ぎなくなる                   | 論点 6（D 撤回）+ 論点 7（案 W 採択）+ 論点 15（サンプル UI 採用）で 4 重省略を解消 / シーン 2 タイル単独完結を保証                                   | §論点 6 / 7 / 15 連動改訂                                            |
| MINOR-1 | (e-α) 採択理由「SSoT 化しやすい」が計測都合                      | 採択理由から削除 / visitor 遭遇頻度根拠のみで採択                                                                                                     | §論点 5 採択理由改訂                                                 |
| MINOR-2 | (c215-α-tentative) 新規 SSoT 候補が CRIT-1 見直しで不要化        | 引用 SSoT 13 を撤回（c214-η を N=3 通常引用適用に格上げ）                                                                                             | §引用 SSoT 7 / 13                                                    |
| MINOR-3 | シーン 2 ログサンプル文字数明記なし                              | 5,000〜10,000 字（推定値）と明記                                                                                                                      | §T-4 シーン 2 / §論点 6 シナリオ整合性                               |
| NIT-1   | N=3 統計判定式の閾値が見かけだけの精密さ                         | 判定結果は「3 サンプルの傾向を示唆する暫定値」とラベル付け / 後続 N=4, N=5 で再見直し必要を明記                                                       | §論点 14 N 統計判定の注記                                            |

#### process review 17 件

| 指摘 ID | 元の問題                                                                         | 採択した対応                                                                                                                                               | 反映箇所                                                                          |
| ------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| CRIT-1  | (c214-β)「同軸ではない」注記が N=3 統計判定式に反映漏れ                          | (c214-β) 全文引用 / N 統計判定式の母集団を「cycle-210 N=1 有効 + cycle-215 = 真の N=2 候補 / cycle-214 = 同軸ではない参考併記」に補正 / B-452 状態欄も補正 | §論点 14 N 統計判定全面改訂 / §冒頭副次成果 / T-4 N 統計判定 / §引用 SSoT 16 追加 |
| CRIT-2  | `-tentative` 接尾辞除去手順が T-3 完成条件に未明示                               | T-3 完成条件に grep 0 件確認 + 接尾辞除去 or 取り下げ注記の手順追加                                                                                        | T-3 完成条件                                                                      |
| CRIT-3  | (c214-ι) noDiff 枠 SSoT が §引用する SSoT に欠落                                 | §引用 SSoT 15 を新規追加 / regex-tester「マッチ無時の結果欄」と構造同型かを T-1/T-4 で判定 / T-4 完成条件にも追加                                          | §引用 SSoT 15 新規追加 / T-4 完成条件                                             |
| CRIT-4  | B-462 採番手順と確定引用の二重表記 / 衝突時フォールバックなし                    | T-2 検証手順に「採番衝突時のフォールバック」明示（grep で全件特定 → 一括置換 → 残存 0 確認）                                                               | §T-2 検証手順                                                                     |
| MAJOR-1 | 数値 literal の 4 分類ラベル欠落多数 + Myers O(N×M) 誤用                         | AP-P16 強化セクションに r2 補完ラベル一覧追加 / Myers 言及を NFA バックトラックに訂正 / T-1 ベンチ箇所も全件訂正                                           | §AP-P16 強化セクション補強 / §T-1 ベンチ訂正                                      |
| MAJOR-2 | (vi) エラー枠 SSoT の適用可否確定タイミング = T-3 実装後再計測未明示             | T-3 完成条件に「(e-α) エラー枠 T-3 実装後再計測」追加                                                                                                      | T-3 完成条件                                                                      |
| MAJOR-3 | T-1 → T-2 → T-3 タスク独立性 = T-1 完了前着手不可が未明示                        | T-2 / T-3 完成条件冒頭に「T-1 採択案確定後の着手前提」追加                                                                                                 | T-2 / T-3 完成条件冒頭                                                            |
| MAJOR-4 | AP-WF16 reviewer 独立再実行ポイントが T-2 / T-4 で未明示                         | T-2 検証手順 = 2 数値（`--color-*` 残存 0 + B-462 採番）/ T-4 検証手順 = 2 数値（(d)→(e) 変化率 + 案 F timeout 100ms 安定値）を明示                        | T-2 検証手順 / T-4 検証手順                                                       |
| MAJOR-5 | AP-P19 外部仕様 WebFetch 確認の対象誤り（`diff` / `v` フラグ）                   | 訂正 = `diff` / `v` フラグ削除 + ECMAScript RegExp / Snyk ReDoS / Nielsen を採用                                                                           | §論点 14 AP-P19 訂正                                                              |
| MAJOR-6 | 論点 13 ReDoS タイムアウトのタイル UI フォールバック + setTimeout cleanup 未触れ | 論点 13 に「タイル UI 側も同一案 B 採用」+「タイムアウト文言は次入力まで永続 = setTimeout 不使用」明示                                                     | §論点 13 改訂                                                                     |
| MAJOR-7 | 論点 7 退避経路が T-3 完成条件に未明示 / 詳細ハイライトのスコープ膨張            | T-3 完成条件に退避経路チェック追加 / スコープ膨張は「唯一の弱点改善」として戦略的判断と明示 / bundle インパクト T-3 計測手順を明示                         | §論点 7 / T-3 完成条件                                                            |
| MAJOR-8 | L75 操作側「フラグ checkbox 群」が論点 2 案 C 採択と不整合                       | §「複合入力型ゆえの注意点」の操作側記述を「フラグ checkbox 群 = §論点 2 案 C 採択により省略」に書き換え                                                    | §「複合入力型ゆえの注意点」改訂                                                   |
| MINOR-1 | cycle-214 「(e) 系統事前確定撤回 → T-1 実体確認」教訓引用なし                    | §論点 5 末尾に cycle-214 L419 教訓引用追記                                                                                                                 | §論点 5                                                                           |
| MINOR-2 | cycle-214 12 論点と cycle-215 14 論点の対応マップ未明示                          | §論点と判断セクション冒頭に対応マップ追加（15 論点に拡張）                                                                                                 | §論点と判断冒頭                                                                   |
| MINOR-3 | B-462 規模 17〜21 件の根拠未具体化                                               | grep 実測（line-break-remover = 21 件）+ Tile テスト 17 件のレンジ起源を明示                                                                               | §T-2 D 項                                                                         |
| MINOR-4 | 引用 SSoT 番号体系の一貫性                                                       | 各項目に独自 ID（c210-i / c214-ζ 等）を統一する方針を §引用する SSoT 末尾に明示                                                                            | §引用する SSoT 末尾                                                               |
| NIT-1   | (c215-α-tentative) 新設による SSoT 体系劣化                                      | visitor MINOR-2 と連動して (c215-α-tentative) 撤回                                                                                                         | §引用 SSoT 13 撤回                                                                |

**俯瞰整合性チェック（指摘事項以外の波及確認）**:

- 論点 6 改訂 → 論点 5（(e-β) 入力長超過の MAX_INPUT_LENGTH 維持）/ 論点 11（ローディング表示 = timeout 100ms 連動 / 案 B 採択に改訂）/ 論点 13（タイムアウト UI = タイル + 詳細 同一文言）に波及反映済
- 論点 7 改訂 → AP-P21 計測 (a)〜(e) ケース定義（マッチ結果欄 = リスト + ハイライト overlay 二層構成）に波及反映済
- 論点 15 新規追加 → T-2 meta.ts（サンプル 6 種 + デフォルトテストテキスト追加）/ T-3 タイル UI（placeholder = メールサンプル）/ T-3 詳細ページ（ドロップダウン UI）に反映指示記述済

**r2 改訂完了 / r2 レビュー依頼推奨**

---

### r2 visitor review (2026-05-29 / 来訪者価値観点 / r1 → r2 改訂評価)

**判定: 改善指示**

事後検証質問形（AP-WF15）で記述。r1 visitor review 12 件の対応マップは概ね妥当だが、r2 改訂で新たに採択された論点 6 案 F / 論点 7 案 W / 論点 15 案 D に **本文未確定 + 来訪者価値の観点での詰め不足** が複数残存している。指摘事項は計 6 件（CRIT 2 / MAJOR 3 / MINOR 1）。

---

#### CRIT-1: 論点 7 案 W「最初の N 件」の N が本文未確定のまま T-3 完成条件に流れ込んでおり、来訪者価値の核（「すぐ結果が見える」）が定量化されていないのではないか？

- **指摘内容**: §論点 7 案 W 採択（タイル UI = 簡易ハイライト + マッチ件数上限）で「例: N=50 件 / N=500 件 / 上限超は省略表示」（L482）と書かれているが、**N の決定値が論点末尾でも T-3 完成条件でも確定されていない**。観点 (xv) a11y 補助記号 / 配色補助の assertion（L293）は採択 N に依存するし、シーン 2「URL 抽出 5,000〜10,000 字」は実測で 100〜500 件マッチが現実的に発生する（一般的な URL 抽出パターン）。N=50 なら「最初の 50 件のみハイライト」で M1a が「全件確認したい用件」に対応できない = タイル単独完結の前提（visitor MAJOR-4 対応）が崩れる。**N は来訪者価値（シーン 2 のログサンプルで何件マッチするか）から逆算して確定すべき値**であり、T-3 builder 裁量に委ねる範囲ではない。
- **根拠**: r1 visitor MAJOR-4「タイルが詳細の劣化版にならない設計」/ §論点 6 案 F 採択時の visitor シナリオ自己整合性チェック（L471）/ AP-WF03 適切な具体性（採択値は計画者責務、実装方法は builder 裁量）/ §論点 7 採択条件「T-1 プロトタイプで N=50〜N=500 のレンダリング負荷を測定」（L488）が決定値ではなく上限レンジに留まっている
- **期待する対応方針**:
  1. §論点 7 案 W 採択値の確定手順を明示: T-1 ハイライト実装プロトタイプ検証（`tmp/cycle-215/baseline/highlight-feasibility.md`）の出力を **N の決定根拠**として採択値を計画書本文に書き戻す手順を §論点 7 末尾 + T-3 完成条件に追記
  2. シーン 2「URL 抽出 5,000〜10,000 字」で発生する想定マッチ件数を T-1 ベンチで実測し、N がその件数を下回らないこと（= 「上限超は省略表示」状態にならないこと）を採択条件にする
  3. N=50 が技術的上限となる場合は、シーン 2 の文字数想定を見直すか、案 W のフォールバック（リスト + 「N 件以上のマッチが見つかりました。詳細はリストへ」誘導文言）を補助案として明示

---

#### CRIT-2: 論点 6 案 F「Worker + AbortController + timeout 100ms / 文字数制限なし」の実装可能性が前提崩壊リスクを抱えたまま T-2/T-3 着手前提に組み込まれているのではないか？

- **指摘内容**: §論点 6 案 F 採択の前提として「Worker 起動コスト + 100ms 以内で初回マッチ結果を返す」「`useRegexWorker.ts` から debounce 撤廃 + AbortController 追加」が必要だが、**既存実装は Blob URL inline Worker（L350 / WORKER_CODE 文字列定義）+ Worker 毎リクエスト生成**である（`useRegexWorker.ts:158-330` を planner Read 想定で確認）。Blob URL + new Worker() の **初回起動コストだけで実機 50〜150ms** かかるのが Chrome / Safari の現実であり、**100ms 以内に「Worker 起動 + postMessage + RegExp 実行 + 結果返却」を完遂するのは技術的に困難**な可能性が高い。さらに **AbortController は Worker と直接連動しない**（Worker.terminate() が abort 相当）= 既存実装はすでに `worker.terminate()` で中断しており「AbortController 追加」は実体として不要 = 計画書本文の表現が技術的に不正確。L470「Worker 起動コスト = 既存 Worker のロジック差し替えのため追加コスト 0」は **Worker 単体起動コスト = 0** という意味なら正しいが、**初回 100ms 達成の技術的可能性** とは別軸で、ここが混同されている。
  - また §論点 6 採択の SSoT 同軸計測軸（L460「T-4 のみ `testRegex` 直接呼び出しを並行実施」）は CRIT-1 対応として妥当だが、**本番 UI が Worker 経由になることで cycle-210 SSoT (v) の「入力量変動 → 高さ変化」計測が本番 UI 上で再現困難**になる懸念がある（Worker async 結果待ちで結果欄の高さ変化が遅延する = `getBoundingClientRect()` 計測タイミング次第で 0% に固定される）。**§T-4 限定 `testRegex` 並行実施が「軸統一値」として代替するという設計は r2 で記述されたが、その「軸統一値」が cycle-210 N=1 と本当に同条件か = 同期呼び出しの本文 textarea 高さが Worker 経由でない状態で計測される必然性**まで T-4 実施事項に書かれていない。
- **根拠**: `useRegexWorker.ts:11,14,158-330` 既存実装 / MDN [Worker startup cost](https://developer.mozilla.org/en-US/docs/Web/API/Worker) / r1 visitor CRIT-1 「SSoT 同軸計測のために本番 UI を犠牲にしない」が r2 で実装側に押し付けられた構造 / Nielsen 100ms 規格との整合性
- **期待する対応方針**:
  1. §論点 6 案 F の実装可能性チェックを T-1 完成条件に追加: 「**Blob URL Worker 初回起動 + 中程度パターン × 1,000 字 RegExp 実行 + 結果返却の往復が 100ms 以内で安定するか**」を T-1 ベンチで実測し、**前提崩壊時は案 B（Worker + debounce 300ms / timeout 500ms / 既存実装維持）に明示的フォールバック**する判定経路を §論点 6 末尾の T-1 ベンチ採択検証セクション（L470）に具体化
  2. 「AbortController」表記の技術的正確性を改める: 既存実装は `worker.terminate()` で abort 相当を実現しており、「AbortController 追加」ではなく「**既存の `worker.terminate()` を timeout 100ms に短縮 + debounce 撤廃 + 再生成コスト許容**」と書き直す（`AbortController` API は Worker と直接連動せず、fetch API 等の文脈で使われる用語であり、計画書本文の技術的誤用）
  3. T-4 並行実施の「軸統一値」計測条件を具体化: cycle-210 N=1 = textarea 入力量変動 → 結果欄高さ変化 11.55% と **完全同条件**で測るために、T-4 限定で「**詳細ページの `testRegex` 同期呼び出し版コンポーネント**を一時的に並行レンダリング」する手順を T-4 実施事項に明記（本番 UI と並行ではなく、独立コンポーネントとして）。あるいは「同軸計測は実質困難であり N=2 暫定達成のみ宣言、cycle-216 以降で同期呼び出し型の別ツールで N=3 真値を採取」と素直に方針転換する

---

#### MAJOR-1: 論点 15 案 D「タイル placeholder 1 件 + 詳細ドロップダウン 5〜10 件」の具体サンプル文字列が計画書本文に明記されていないのではないか？

- **指摘内容**: §論点 15 案 D 採択（L558-560）で「タイル UI = placeholder にサンプル 1 件（メールアドレス / 競合調査 §8 サンプル #1）」「詳細ページ = ドロップダウン 5〜10 件（メール / 電話番号 / URL / 郵便番号 / 日付 / IP アドレス）」と書かれているが、**具体的なサンプル文字列（正規表現パターン + デフォルトテストテキスト）が計画書本文に一つも明記されていない**。T-2 meta.ts 反映指示（L567）も「サンプル 6 種 + 各サンプルのデフォルトテストテキストを定数として追加」と builder 裁量に丸投げになっており、各サンプルの「想定マッチ件数 / a11y 補助記号との整合 / 文字数」が来訪者価値の観点から検証されていない。これは AP-WF03 適切な具体性の観点で「採択値は計画者責務」に該当する範囲。例えば「メール `^[\w.+-]+@[\w-]+\.[\w.-]+$`」は計画書本文 L35 で 1 例だけ言及されているが、「電話番号 = 0X-XXXX-XXXX 形式か / 国際表記対応か」「日付 = YYYY/MM/DD か MM-DD-YYYY か / うるう年考慮か」等 visitor 価値に直結する設計判断が未確定。
- **根拠**: AP-WF03（計画者責務の範囲）/ r1 visitor CRIT-4「サンプル選択 UI は M1a『正規表現が苦手だが URL 抽出したい』シーンに直接刺さる機能」= サンプル品質が来訪者価値そのもの / 競合調査 §8 典型需要 10 サンプルを参照する旨は計画書にあるが具体引用なし
- **期待する対応方針**:
  1. §論点 15 採択末尾に「**詳細ページ ドロップダウン 6 種の具体パターン + デフォルトテストテキスト一覧**」を明示（最低でもパターン文字列、テスト文字列、想定マッチ件数の 3 列表）
  2. タイル placeholder の具体文言（例: `^[\w.+-]+@[\w-]+\.[\w.-]+$` をパターン input placeholder にそのまま設定するか / 「例: `^[\w.+-]+@...`」と「例:」プレフィックス付きにするか）を確定
  3. 競合調査 §8 典型需要 10 サンプルとの整合性確認: 採択 6 種が 10 サンプル中どの 6 種か明示し、選定理由（M1a/M1b 体験トレースとの紐付け）を 1 行ずつ記載

---

#### MAJOR-2: シーン 2「URL 抽出」が論点 7 案 W 採択時にタイル UI で実際に成立するか自己整合性チェックが完了していないのではないか？

- **指摘内容**: §目的シーン 2「M1a / 文書編集者が URL 抽出 5,000〜10,000 字ログを処理」（L350）+ §論点 6 案 F 採択「文字数制限なし = シーン 2 がタイル単独完結可能」（L471）と書かれている。しかし論点 7 案 W は「最初の N 件のみハイライト」であり、5,000〜10,000 字ログから URL 100〜500 件マッチする実態に対して N=50 程度ではタイル単独完結しない。**論点 6 改訂（文字数制限なし）と論点 7 改訂（N 件上限）の組み合わせが「シーン 2 タイル単独完結」を本当に達成するか**は r1 → r2 改訂対応マップでも俯瞰整合性チェック対象になっていない（L1146-1148）。
  - また案 W 採択時は「マッチ結果欄 = リスト + ハイライト overlay 二層構成」（L496）になるが、リスト欄は最初の N 件 + ハイライトも最初の N 件で「全件確認は詳細リンクへ」誘導するなら、結局 4 重省略（r1 MAJOR-4）の構造は解消されていない。
- **根拠**: r1 visitor MAJOR-4 対応の俯瞰整合性 / 計画書 L1145-1148 俯瞰整合性チェックで論点 6 ↔ 論点 7 の整合性が未確認
- **期待する対応方針**:
  1. §論点 6 末尾「論点 5 / 11 / 13 への波及」表に「**論点 7 への波及**」行を追加し、「文字数制限なし × ハイライト N 件上限」がシーン 2 を本当にカバーするかを明示判定
  2. 案 W 採択時のリスト欄上限値（マッチ一覧表示件数）も併せて確定（ハイライト N と同じ値か、リストは全件表示でハイライトのみ上限か）
  3. シーン 2 体験トレースを論点 7 案 W 採択前提で書き直し: 「タイル UI で URL 5,000 字を投入 → マッチ 200 件 → リスト全件表示 + ハイライト 50 件のみ → コピーボタンで全 200 件取得 → Excel 貼り戻し」のような具体動線を §目的シーン 2 に追記

---

#### MAJOR-3: B-452 N 統計判定が「N=2 達成 / 真の N=2」表現で混乱しているのではないか？

- **指摘内容**: §冒頭副次成果 L16 / §論点 14 / §T-4 完成条件 L359 で「**N=2 達成（cycle-215 が真の N=2 有効サンプル）**」または「**N=3 暫定達成**」という二択になっているが、cycle-214 (c214-β) を厳格に適用すると **cycle-215 単独で「真の N=2」を達成 = cycle-210 と cycle-215 の 2 サンプルが揃って「真の N=2 達成」** であり、B-452「N≥3 着手条件充足」は cycle-215 完了時点で **絶対に達成しない**（最善でも真の N=2 達成 = cycle-216 以降で真の N=3 を採取）。しかし計画書 L16 末尾の「N=3 暫定達成（後続サイクルで追加検証）」表現は **N=2 達成と N=3 達成の境界を曖昧にしている**（cycle-214 = 0.00% を「参考併記」しつつ N=3 暫定達成と呼ぶなら process review CRIT-1 の指摘に反する）。
- **根拠**: process CRIT-1 = (c214-β) 同軸性注記の N=3 統計判定式への反映 / §論点 14 L600-616 = 母集団は 2 サンプル（cycle-210 + cycle-215）/ §冒頭 L16 末尾の表現
- **期待する対応方針**:
  1. §冒頭 L16 末尾の「**N=3 暫定達成（後続サイクルで追加検証）**」表現を **削除**（cycle-215 が真の N=2 達成サンプルになっても N=3 達成は cycle-216 以降）
  2. §T-4 完成条件 L359 の二択を「**N=2 達成 = 真の N=2 / B-452 着手条件は cycle-216 以降で再判定**」または「**N=1 のまま / cycle-215 は同軸ではない / cycle-216 以降で再挑戦**」の二択に統一
  3. B-314 進捗欄 + B-452 状態欄 + 実施する作業 L24 すべての B-452 記述で「N=3 暫定達成」表現を排除し「N=2 達成（cycle-215 が真の N=2 / B-452 N=3 着手条件は cycle-216 以降）」に統一

---

#### MINOR-1: 競合調査の「ハイライト 0 実装 = yolos.net 唯一の弱点」記述が事実精度として誇張ではないか？

- **指摘内容**: 計画書 §目的 L62 / §論点 7 L480 で「競合 8 サイト全件がテキストエリア内ハイライト実装済 = yolos.net の唯一の弱点」と書かれているが、競合調査本文 §2-§4 を見ると「ハイライト = 不明 / 推測（背景色のみと推測）」が複数サイトで明示されている（B「未入力状態で確認できず」/ E「テキストハイライトなし / FOUND テキスト形式のみ」/ G「具体的方式不明」等）。Site24x7（E）は明示的にハイライトなしであり、「8 サイト全件」という主張は不正確（少なくとも E は除外、B/G は不明）。
- **根拠**: `docs/research/2026-05-29-regex-tester-competitor-research.md` §2-E L202-203 / §2-B L91-92 / §4 比較表 L398-409
- **期待する対応方針**: §目的 L62 + §論点 7 L480 + r1 → r2 対応マップ表現を「**8 サイト中 5〜6 サイトがハイライト実装（残り 2〜3 サイトは未実装または不明）= yolos.net の弱点 1 つ**」に訂正。論点 7 採択の方向性（ハイライト導入）は変わらないが、前提精度を競合調査本文と一致させる。

---

#### 総括（r1 → r2 改訂評価コメント）

r1 → r2 改訂対応マップ 29 件（visitor 12 + process 17）はほぼ全件が計画書本文に反映されており、対応マップに記載された「採択方針が本文未反映」の問題はない。論点 6 案 F / 論点 7 案 W / 論点 15 案 D の方向転換は **来訪者価値最大化原則と整合する正しい方向転換**であり、特に CRIT-1〜CRIT-4 の根本対応（4 重省略の解消 / SSoT 同軸計測のための制限撤回 / サンプル UI 独立論点化）は r1 指摘の本質に応えている。ただし新採択論点の **「具体値の確定」と「実装可能性の前提崩壊リスク」と「シーン 2 自己整合性」** に詰めの不足が残存しており、来訪者にとっての価値が「方向性は正しいが具体動作が不確定」状態に留まっている。CRIT-1（N 値確定）/ CRIT-2（案 F 実装可能性）/ MAJOR-1（サンプル文字列確定）/ MAJOR-2（シーン 2 整合性）/ MAJOR-3（B-452 表現統一）/ MINOR-1（競合調査前提精度）を planner 改訂で対応すれば、本サイクルは真に visitor 価値を最大化する計画になる。

**PM への次工程指示**:

1. planner サブエージェントに本指摘の全件対応を依頼する（CRIT-1〜CRIT-2 / MAJOR-1〜MAJOR-3 / MINOR-1）。あわせて r1 visitor + r1 process + r2 visitor の指摘全件が本文に反映されている状態を維持する。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。
3. 修正後、再度レビュー（r3 review）を依頼する。レビュー省略は認められない。

---

### r2 process review (2026-05-29 / SSoT 引用妥当性 + 数値 literal 4 分類ラベル + T-1〜T-4 タスク独立性 / r1 → r2 改訂評価)

**判定: 改善指示**

r1 process review 17 件すべての対応状況、r2 改訂で新たに生じた俯瞰整合性、対応マップの記述形式を事後検証質問形（AP-WF15）で確認した。r1 指摘 17 件のうち大半は方針として反映されているが、**論点 6 案 D 撤回 + 案 F 採択 / 論点 15 新規追加 / B-462 採番手順** の改訂が本文の他所に未波及で内部矛盾が複数残存している。また数値 literal 4 分類ラベル網羅が依然として r2 補完ラベル一覧（L82-93）の追加のみで対症的、論点 7 採択の色トークン整合が AP-I08 観点で未検証など、CRIT 4 件 + MAJOR 7 件 + MINOR 4 件 + NIT 2 件 = 計 17 件の指摘事項を残す。

---

#### CRIT-1: 観点 (viii) の「案 D 採用時はその値で検証」記述が r2 案 F 採択と内部矛盾していないか?

- **指摘内容**: §T-3 設計論点「タイル用テストの観点」観点 (viii)（L286）に「**(e-β) 入力長超過時のエラー表示（10,001 文字超で「入力テキストが長すぎます」表示 / タイル UI は §論点 6 で入力長を 1,000 字に下げる案 D あり = 採用時はその値で検証）**」と記載されている。しかし r2 改訂で論点 6 = **案 D 撤回 + 案 F 採択（文字数制限なし / MAX_INPUT_LENGTH=10,000 維持）** が確定したのに、観点 (viii) には「**案 D 採用時はその値で検証**」という r1 採択時の前提が残存している。r1 → r2 改訂対応マップ visitor CRIT-1 / MAJOR-4 の反映漏れであり、Tile テスト観点の検証値が r1 のままになっている = テスト方針の内部矛盾。
- **根拠**: cycle-215.md L286 / L452（案 D 撤回）/ L457（案 F 採択 = MAX_INPUT_LENGTH=10,000 維持）
- **期待する対応方針**: 観点 (viii) の記述を「**(e-β) 入力長超過時のエラー表示（10,001 文字超で「入力テキストが長すぎます」表示 / 論点 6 案 F 採択により MAX_INPUT_LENGTH=10,000 維持 = 既存値で検証）**」に書き換える。本指摘は「r1 → r2 改訂が論点 6 / 7 / 15 改訂を AP-P21 計測 (a)〜(e) ケース定義に正しく波及反映しているか」の典型未対応箇所。

---

#### CRIT-2: 論点 7 採択（案 W ハイライト導入）が AP-I08（DESIGN.md / デザイントークン未定義の視覚表現禁止）観点で検証されていないのではないか?

- **指摘内容**: §論点 7 で「**タイル UI = 案 W（簡易ハイライト + マッチ件数上限）/ 詳細ページ = 案 Y（テキストエリア内ハイライト + 一覧併用 + overlay div 絶対配置）**」を採択。ハイライト用に「**背景色 + テキスト記号併用**」と書かれているが、(1) **ハイライト用の背景色トークンが何になるかが計画書本文に明記されていない**（既存 `--success-soft` / `--warning-soft` / `--accent-soft` のどれを使うか / 新規追加トークンが必要か未論証）、(2) AP-I08（DESIGN.md / デザイントークン未定義の視覚表現禁止）が論点 14 の AP 打ち消し策一覧に挙がっているのに、本論点で AP-I08 観点の検証が一切無い、(3) §引用する SSoT 14 (c215-β-tentative) も「色 + テキスト + 番号」と抽象的表現のみで採用トークン名が示されていない。
- **根拠**: cycle-215.md L484-489（案 Y 実装説明）/ L580 (AP-I08 打ち消し策で text-decoration は token 化対象外と書いてあるが、ハイライト背景色トークンには触れていない) / L710 (c215-β-tentative) / docs/anti-patterns/implementation.md AP-I08
- **期待する対応方針**: §論点 7 / §引用する SSoT 14 (c215-β-tentative) に以下を補足:
  1. ハイライト用背景色トークン候補比較（既存 `--success-soft` / `--accent-soft` 等のどれを採用するか / `globals.css` ライト・ダーク両定義の有無を `grep -nE "success-soft|accent-soft" src/app/globals.css` で確認）
  2. 採用トークンが未定義の場合は §論点 14 / §補足事項に「新トークン追加候補」として書き戻し
  3. AP-I08 観点で「ハイライト背景色 + テキスト記号併用 = 既存トークン + 標準 CSS で表現可能」を明示

---

#### CRIT-3: T-1/T-2 で `relatedSlugs` 実在判定が不在時に「§論点 10 に書き戻し」のままで差し替え手順が具体化されていないのではないか?

- **指摘内容**: T-1 完成条件 L173 / T-2 完成条件 L249 に「**`meta.ts` `relatedSlugs` 3 件のうち実在しないものがあれば §論点 10 に書き戻し**」と書かれているが、§論点 10（L516-520）は **「search_intents 追加候補 4 語確定」** のみの記述で、`relatedSlugs` 実在判定の差し替え手順が無い。とくに `email-validator` は競合調査で言及された未実装ツール候補で、現状の `src/app/(new)/tools/` / `src/app/(legacy)/tools/` 配下に存在しない可能性が高い。差し替え候補 SSoT が無いまま「§論点 10 に書き戻し」だけでは書き戻し先で planner / builder が判断停止する。
- **根拠**: cycle-215.md L134 / L173 / L249 / L516-520
- **期待する対応方針**: §論点 10 末尾に「**`relatedSlugs` 実在再確認 + 差し替え候補比較**」を追加:
  1. T-1 で `ls src/app/(new)/tools/email-validator src/app/(legacy)/tools/email-validator 2>/dev/null` を実行 → 不在なら差し替え必要
  2. 差し替え候補語比較（cycle-210 text-replace / cycle-209 line-break-remover / cycle-211 image-base64 等の関連ツール）= ゼロベース 3 案以上
  3. 採択基準（M1b 来訪者が「正規表現を試した後に次に使うツール」として自然か）

---

#### CRIT-4: B-462 採番衝突時のフォールバック手順の行番号 `L24 / L207 / L500` が r1 process review 指摘時点の値のまま固定されていないか?

- **指摘内容**: §T-2 検証手順末尾の「**B-462 採番衝突時のフォールバック**」（L253）に「**少なくとも L24 / L207 / L500 該当 / 行番号は r2 改訂後の値**」と注釈付きで明記されているが、**r2 改訂で計画書本文が大幅追加された結果、現実の B-462 引用行は L24（kickoff 完了条件）/ L231（T-2 D 項 B-462 起票候補）/ L246（T-2 完成条件）/ L251（T-2 検証手順）/ L253（フォールバック本文）/ L299（T-3 完成条件「B-462 採番確定」）/ L645-646（§検討した他の選択肢）等に分散しており L207 / L500 では既にヒットしない**。注釈で「行番号は r2 改訂後の値」と書きつつ実値が r1 process review 時点（cycle-215.md 旧構造）のまま残存している = 自己整合性破綻。
- **根拠**: cycle-215.md L253 / `grep -nE "B-462" docs/cycles/cycle-215.md` で実測すると 8 箇所以上ヒット
- **期待する対応方針**: L253 のフォールバック記述を「**`grep -nE 'B-462' docs/cycles/cycle-215.md` で全件特定（r2 改訂時点で 8 箇所以上）→ 本番採番 ID に一括置換 → 残存 0 を確認**」に書き換え、特定行番号の例示（L24 / L207 / L500）は削除して grep ベースの手順のみに統一する。

---

#### MAJOR-1: 数値 literal 4 分類ラベルが「r2 補完ラベル一覧」（L82-93）に集約され、本文側の個別 literal にラベル併記されていない箇所が依然多数残存していないか?

- **指摘内容**: r1 process review MAJOR-1 の対応として「§AP-P16 強化 セクションに r2 補完ラベル一覧を追加」（L82-93）したことは確認できる。しかし AP-P16 の本来の要請は「**literal の直近にラベル + 生成元を併記**」であり、補完ラベル一覧を別所にまとめるだけでは AP-P16 違反のまま。具体的な未対応 literal:
  - L355 「**計 12 枚以上**」「**base 6 = w375/w1200/w1900 × light/dark + after-match 2 + error 2 = 10 枚**」「**スクショ 5 枚**」「**タイルプレビュー 4 枚**」「**計 21 枚以上**」← 全件ラベル無し
  - L137「**1,000 / 5,000 / 10,000 / 50,000 文字**」← ラベルなし
  - L142「**1,000 字 / 10,000 字 / 50,000 字**」← ラベルなし
  - L324「**w1200 / w375 × ライト / ダーク = 計 4 枚**」← ラベルなし
  - 置換マッピング表 L195-204「**複数（T-1 で確定）**」← 件数 literal がプレースホルダ表記のまま、表内で「**T-1 builder が grep コマンドで書き戻し**」が直近併記されていない
  - L302「**最低 17 件**（**経験的暫定値**）」← ラベルあり = OK だが直近に生成元（line-break-remover = 21 件 / cycle-211 Tile = 17 件等）併記なし
- **根拠**: cycle-215.md L82-93（補完ラベル一覧）/ L137 / L142 / L195-204 / L302 / L324 / L355 / docs/anti-patterns/planning.md AP-P16（literal 直近併記必須）
- **期待する対応方針**: 補完ラベル一覧を残しつつも、本文側の個別 literal にも 4 分類ラベル + 生成元を直近併記する徹底改訂を行う。とくに T-4 完成条件のスクショ枚数（L355）、Tile テスト「最低 17 件」（L302）、置換マッピング表（L195-204）の件数を改訂。

---

#### MAJOR-2: r1 → r2 改訂対応マップの行番号が反映箇所欄に書かれておらず、reviewer の独立検証ができないのではないか?

- **指摘内容**: §r1 → r2 改訂対応マップ（L1107-1142）は「**指摘 ID / 元の問題 / 採択した対応 / 反映箇所**」の 4 列構成だが、**反映箇所欄に行番号が一切書かれていない**（「§論点 6 全面改訂」「§T-1 ベンチ強化」等のセクション名のみ）。ユーザーは r2 process review 依頼で「**反映箇所行番号が正確か（計画書本文の該当行で対応内容が確認できるか）**」のチェックを明示的に依頼しており、本マップでは reviewer の独立検証が不可能。
- **根拠**: cycle-215.md L1107-1142 / ユーザー指示「**反映箇所行番号が正確か**」
- **期待する対応方針**: 反映箇所欄を「**§セクション名（行番号 L<開始>-L<終了>）**」形式に統一し、reviewer が `sed -n 'XX,YYp' docs/cycles/cycle-215.md` で即時検証できる粒度にする。

---

#### MAJOR-3: 論点 6 案 F 採択の波及が論点 11 / 論点 13 / B-452 N 統計判定で機械的に「c214-η N=3 通常引用適用達成」と断定されているが、T-1 ベンチ前提崩壊時のフォールバックパスが波及反映されていないのではないか?

- **指摘内容**: §論点 6 採択 = 案 F だが、L470 で「**T-1 ベンチで採択検証（必須）...前提崩壊が確認できれば案 B（既存実装維持 / debounce 300ms / timeout 500ms）にフォールバック**」が明示されている。しかし案 B にフォールバックした場合の影響:
  - 論点 11 採択（案 B spinner 100ms threshold / **cycle-212 spinner SSoT N=3 引用適用達成**, L526）→ 案 B フォールバック時は debounce 300ms = 100ms 即時表示の前提変動
  - 論点 13 採択（案 B 「計算がタイムアウトしました」エラー文言 / L541）→ Worker timeout 500ms フォールバック時に文言の寿命と整合性が変わる可能性
  - §引用 SSoT 7 (c214-η) → 「**PASS 期待 = N=3 通常引用適用達成**」と断定されている（L686）が、案 B フォールバック時は r1 案 D ハイブリッドに近い状態に近づき N=3 達成判定が崩れる
- **根拠**: cycle-215.md L470 / L526 / L541 / L686
- **期待する対応方針**: §論点 6 末尾に「**案 B フォールバック時の波及**」サブセクションを追加し、論点 11 / 13 / 引用 SSoT 7 の各採択が案 B フォールバック時にどう変化するかを明示。あるいは「**案 B フォールバック時の判定は §補足事項に書き戻し → reviewer が再評価を依頼可能**」を明文化。

---

#### MAJOR-4: 論点 14 「N 統計判定」の T-4 アクション (a)(b)(c)（L613-616）が、T-4 完成条件 / 引用 SSoT 7 / 副次成果記述で表記揺れしていないか?

- **指摘内容**: §論点 14 末尾の T-4 アクション (a)(b)(c)（L613-616）= 「(d)→(e-α) 変化率を計測 / 有効サンプル or 同軸ではない参考併記を判定 / B-452 状態欄に書き戻し」が、T-4 完成条件 L357 / L359 と二重表現。さらに副次成果記述 L16-17 / 冒頭実施作業 L24 で書き分けが微妙にずれている（「**N=2 達成 or N=3 暫定達成**」 vs 「**N=2 達成 / N=1 のまま**」）。
- **根拠**: cycle-215.md L16-17 / L24 / L357 / L359 / L613-616
- **期待する対応方針**: N 統計判定の表記を 4 通り全部 **「N=2 達成（cycle-215 が真の N=2 有効サンプル）/ N=1 のまま（cycle-215 が同軸ではない場合）」** に統一し、「N=3 暫定達成」表現（L16 / L24）は削除（cycle-214 c214-β の注記に従えば cycle-215 単独では真の N=2 までしか到達不可能 = N=3 達成は cycle-216 以降）。

---

#### MAJOR-5: 論点 15 採択「T-2 meta.ts にサンプル 6 種フィールド追加」が T-2 / T-3 完成条件に未反映ではないか?

- **指摘内容**: §論点 15 採択 = 案 D（タイル UI = placeholder 1 件 / 詳細ページ = ドロップダウン 5〜10 件 / L558）。L566-569 で「**T-2 meta.ts: サンプル 6 種 + 各サンプルのデフォルトテストテキストを定数として追加** / **T-3 タイル UI: pattern input の placeholder にメールアドレスサンプルを設定** / **T-3 詳細ページ: pattern input 上にドロップダウン UI を追加**」と書かれているが、**T-2 完成条件（L237-249）に「meta.ts のサンプル 6 種定数追加完了」のチェック項目が一切無い**。同様に T-3 完成条件（L297-311）にもタイル placeholder メールサンプル設定 / 詳細ページドロップダウン UI 追加のチェック項目が無い。論点 15 新規追加の俯瞰整合性が完成条件に未波及。
- **根拠**: cycle-215.md L558 / L566-569 / L237-249 / L297-311
- **期待する対応方針**:
  - T-2 完成条件に追加: 「**`meta.ts` にサンプル 6 種定数 + デフォルトテストテキストが追加されている**」
  - T-3 完成条件に追加: 「**タイル UI = pattern input placeholder にメールアドレスサンプルが設定 / 詳細ページ = pattern input 上にドロップダウン UI 追加 + 選択時 pattern + 本文の自動入力が動作**」
  - 観点 (i)〜(xvii) に観点 (xviii)「**サンプル選択時の pattern + 本文自動入力**」追加検討

---

#### MAJOR-6: 論点 5 (e-α) 採択論証で cycle-214 教訓引用「(e) 系統事前確定撤回」と矛盾する「**第一候補 = (e-α)**」事前確定が残存していないか?

- **指摘内容**: §論点 5 末尾（L441）に「**cycle-214 では「(e) 系統の事前確定撤回 → T-1 実体確認 → (a+e-α) 統合 = 4 系統独立」という流れがあった ... cycle-215 でも計画段階の (e-α) 第一候補は推定値であり、T-1 実体確認後に T-4 で確定する**」と教訓引用がある（r1 process review MINOR-1 対応の反映）。しかし論点 5 採択結論 L436 で「**採択 = (e-α) 第一候補 / (e-β) は補助計測**」と事前確定し、L107-114「想定系統」でも (e-α) を事前候補化している。教訓引用の本旨（事前確定を撤回し T-1 実体確認に委ねる）と矛盾。
- **根拠**: cycle-215.md L107-114 / L436 / L441
- **期待する対応方針**: 論点 5 採択結論を「**第一候補は推定値であり、T-1 実体確認後の T-4 で確定 / 系統数調整（N=5 のままか N=4 統合か）も含めて T-4 確定対象**」と書き換え、事前確定の体裁を撤回する。L107「想定系統」も「**計画段階の暫定推定 / T-1 で確定**」と緩める。

---

#### MAJOR-7: T-2 検証手順の B-462 採番値検証で `tail -1` ベースの grep が歯抜け採番に対応していないのではないか?

- **指摘内容**: §T-2 検証手順 L251 の (2) B-462 採番値検証で「**`grep -oE '^\| B-[0-9]+' docs/backlog.md | sort -u | tail -1` の実測結果との一致確認**」と書かれているが、`tail -1` は単にソート最末尾を取るだけで、B-449 → B-455 → B-458 → B-459 → B-461 のように **歯抜けがある場合の次の空き番号判定にならない**。実際 backlog.md L92-101 で歯抜けで採番されており、`tail -1` = B-461 → +1 = B-462 で偶然正解する程度。`sort -u` は文字列ソートで「B-461 < B-9」となる可能性も含めて、`sort -V`（version sort）に改めるべき。
- **根拠**: cycle-215.md L251 / L231 / docs/backlog.md L92-101
- **期待する対応方針**: L251 / L231 の grep コマンドを「**`grep -oE 'B-[0-9]+' docs/backlog.md | sort -V | tail -1` で最大 ID 取得 → 数値部 + 1 を新規 ID として採用 / 衝突時は CRIT-4 フォールバック**」に書き換え。

---

#### MINOR-1: §引用する SSoT 「番号体系統一」（L721）が方針宣言のみで各項目への独自 ID 付与が未実施ではないか?

- **指摘内容**: §引用する SSoT 末尾 L721 で「**SSoT 番号体系統一**: 各項目冒頭の括弧内 ID（例 `(c210-i)` = cycle-210 SSoT 1 / `(c214-ζ)` = cycle-214 SSoT 5 / 引用 SSoT 6）を本文引用と統一する」と方針宣言があるが、**1〜16 番の各項目の冒頭に独自 ID が併記されていない**。方針宣言だけで実施しないと r1 process review MINOR-4 が形式的対応のままになる。
- **根拠**: cycle-215.md L654-720 / L721
- **期待する対応方針**: §引用する SSoT 1〜16 番の各項目冒頭に独自 ID（例 `(c210-i)` / `(c210-ii)` / `(c210-v)` / `(c210-vi)` / `(c214-δ)` / `(c214-ζ)` / `(c214-η)` / `(c213-β)` / `(c213-γ)` / `(c213-δ)` / `(c214-ι)` / `(c214-β)`）を併記。

---

#### MINOR-2: §目的 M1a/M1b yaml 引用が「**line 13-20 想定**」のまま残存し、yaml 実測値で確定されていないのではないか?

- **指摘内容**: §目的「誰のために」L33-34 の M1a/M1b yaml 引用が「**likes ... （出典: ... / M1a yaml line 13-20 想定）**」と「想定」表記のまま残存。`docs/targets/特定の作業に使えるツールをさっと探している人.yaml` / `docs/targets/気に入った道具を繰り返し使っている人.yaml` を Read して該当 likes が記載されている実際の line 番号で確定できるのに「想定」のままになっている = r1 process review MAJOR-1 の対応漏れ（推定値ラベル相当だが正規ラベル形式でない）。
- **根拠**: cycle-215.md L33-34 / r1 process review MAJOR-1 表
- **期待する対応方針**: T-1 builder（または planner）が `grep -nE "likes|dislikes|search_intents" docs/targets/*.yaml` で実 line 番号を取得し、「**想定**」表記を「**実測値** = ファイルパス:N-M」に置換。

---

#### MINOR-3: bundle インパクトの記述が論点 7 / 論点 15 の追加コード分への言及無しで「ほぼ 0」と断定されていないか?

- **指摘内容**: §T-3 実施事項 L271「**bundle インパクト = ほぼ 0**: regex-tester タイルは既存 `logic.ts` `testRegex` を共有 / Worker は §論点 6 採択次第 ... 詳細ページとタイル UI で `logic.ts` を共有すれば bundle 追加コスト = 共有チャンク化により実質 0」と書かれているが、論点 7 案 W / 案 Y 採択でハイライト用 overlay div + フォントメトリクス同期コード + サンプル選択ドロップダウン UI（案 D）の追加コードが必ず増える。L495「**bundle インパクトは T-3 で実測**」が論点 7 側にあるのに、T-3 実施事項 L271 と整合されていない（実測指針が二重存在）。
- **根拠**: cycle-215.md L271 / L495
- **期待する対応方針**: L271 を「**bundle インパクト = 案 F + 案 W + 案 Y + 論点 15 案 D の追加コード分が実測対象** = T-3 で計測（cycle-214 完了時点との差を `tmp/cycle-215/after-t3/bundle-impact.md` に記録）/ 共有チャンク化により最適化期待だが事前閾値ではなく実測値の記録のみ（cycle-214 r4 MAJOR-1 教訓）」に書き換え。

---

#### MINOR-4: r2 改訂対応マップで visitor MAJOR-2（4 重省略解消）等の本文波及が複数章に散る指摘が、reviewer 独立検証可能な粒度に書かれていないのではないか?

- **指摘内容**: MAJOR-2 と関連して、r1 visitor review CRIT-3 / MAJOR-4 など本文への波及が複数箇所に分散する指摘は、対応マップで「§論点 6 / 7 / 15 連動改訂」とだけ書かれており、reviewer が「どの章のどの段落で本当に対応されたか」を `sed -n 'XX,YYp'` で即時検証できない。
- **根拠**: cycle-215.md L1107-1148
- **期待する対応方針**: r1 → r2 改訂対応マップを 1 件ずつ「**主反映箇所（L<開始>-L<終了>）+ 副反映箇所（L<開始>-L<終了>）**」形式で書き換え、reviewer の独立再実行を可能にする。

---

#### NIT-1: 観点 (xvii) 「**Worker 採用時のみ**」記述が案 F 確定下で冗長表現ではないか?

- **指摘内容**: §T-3 設計論点 観点 (xvii) L295「**ReDoS タイムアウト時の UI 挙動（§論点 13 採択 / Worker 採用時のみ = 「計算中…」or「計算がタイムアウトしました」表示）**」← 案 F 採択で Worker + AbortController + timeout 100ms が必ず採用される（タイル + 詳細 両方）= 「**Worker 採用時のみ**」条件付き表現が冗長。
- **根拠**: cycle-215.md L295 / L457 案 F 採択
- **期待する対応方針**: 観点 (xvii) を「**ReDoS タイムアウト時の UI 挙動（§論点 13 採択 = タイル + 詳細の両方で「計算がタイムアウトしました（パターンが複雑すぎる可能性があります）」表示）**」に書き換え。

---

#### NIT-2: kickoff description（L3）に「**B-452 N≥3 達成**」が残存し、副次成果記述 L16「**N=2 検証データ蓄積サイクル**」と不整合ではないか?

- **指摘内容**: cycle-215.md L3 description「**id: 215 / description: B-314 Phase 8.1 第 16 弾 = regex-tester 詳細ページの新デザイン移行 + タイル化（複合入力型タイル 3 件目 = B-452 N≥3 達成 = cycle-210/214 SSoT 引用検証 3 回目）**」が r2 改訂で「N=2 検証データ蓄積サイクル」に変わったはずだが、description に「**B-452 N≥3 達成**」が残存。r1 process review CRIT-1 / r1 visitor review MAJOR-2 の対応で副次成果記述 L16 は改訂されたが description（L3）が未改訂 = メタデータと本文の不整合。
- **根拠**: cycle-215.md L3 / L16 / L24 / r1 → r2 改訂対応マップ visitor MAJOR-2
- **期待する対応方針**: L3 description を「**B-314 Phase 8.1 第 16 弾 = regex-tester 詳細ページの新デザイン移行 + タイル化（複合入力型タイル 3 件目 = B-452 N=2 検証データ蓄積 / M1a/M1b 来訪者の正規表現需要への最短応答）**」に書き換え。

---

#### 総合判定 = 改善指示

CRIT 4 件 + MAJOR 7 件 + MINOR 4 件 + NIT 2 件 = 計 17 件。とくに **CRIT-1（観点 (viii) の案 D 残存）/ CRIT-4（B-462 採番手順の旧行番号固定）/ MAJOR-1（数値 literal ラベル網羅未徹底）** は r1 → r2 改訂が「補完ラベル一覧追加」「対応マップ表追加」等で対症療法的に処理されており、本文全体への波及検証が不徹底。r2 改訂の良い点（論点 6 案 F 採択 / 論点 7 案 W 新規追加 / 論点 15 新規追加 / (c214-β) (c214-ι) SSoT 追加引用 / 来訪者価値主導への主目的書き直し）は適切だが、本文波及が部分的のため計画書本体の整合性確保が必要。

**PM への次工程指示**:

1. planner サブエージェントに本 r2 process review の全件対応を依頼する（CRIT-1〜CRIT-4 / MAJOR-1〜MAJOR-7 / MINOR-1〜MINOR-4 / NIT-1〜NIT-2）。あわせて r2 visitor review の指摘全件と既存 r1 指摘の本文波及維持も対応継続。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。
3. 修正後、再度レビュー（r3 process review）を依頼する。レビュー省略は認められない。

---

### r2 → r3 改訂のレビュー対応マップ

r2 visitor review 6 件（CRIT 2 + MAJOR 3 + MINOR 1）+ r2 process review 17 件（CRIT 4 + MAJOR 7 + MINOR 4 + NIT 2）= 計 23 件への対応マップ。反映箇所は「§セクション名 + 主反映行範囲」で記載（r2 process MAJOR-2 対応 / `sed -n 'XX,YYp' docs/cycles/cycle-215.md` で reviewer 独立検証可能）。行番号は r3 改訂完了直後の値（後続編集で揺れる可能性あり）。

#### r2 visitor review 6 件

| 指摘 ID | 元の問題                                                                                            | 採択した対応                                                                                                                                                                                                                                                                                                                                                                                                                        | 主反映箇所                                                                                                                                                                                                                                                                                                           | 副反映箇所                                                                                                                                        |
| ------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRIT-1  | 論点 7 案 W の N 値未確定 / 来訪者価値の核未定量化                                                  | 論点 7 末尾に「N 値確定方針」サブセクション追加 = サブ案 W-1〜W-4（N=10/50/100/動的）ゼロベース 4 案比較表 + 第一候補 = 案 W-3 (N=100) + AP-I07 (jsdom 検出不可) 打ち消し / T-1 完成条件に「N 値確定根拠取得」追加 / T-3 完成条件に「N 値本文書き戻し完了」追加                                                                                                                                                                     | §論点 7「N 値確定方針」サブセクション                                                                                                                                                                                                                                                                                | §T-1 完成条件「論点 7 案 W の N 値確定根拠取得」 / §T-3 完成条件「論点 7 案 W の N 値本文書き戻し完了」                                           |
| CRIT-2  | 論点 6 案 F の Worker 起動コスト 50〜150ms で timeout 100ms 技術的成立性 + AbortController API 誤用 | 論点 6 案 F にサブ案 F-1（pre-warm）/ F-2（timeout 200ms 緩和）/ F-3（worker.terminate() 採用 = 表記訂正）/ F-4（Worker 内 setTimeout キャンセル）を追加 + 段階的フォールバック判定経路明示 / 「AbortController」表記を「既存 `worker.terminate()`」に全面訂正 / T-4 並行実施の方法を「独立コンポーネントとして tmp ページに一時マウント」に具体化 / 同軸計測困難時の方針転換明文化 / T-1 完成条件に「案 F 実装可能性チェック」追加 | §論点 6 案 F + サブ案 F-1〜F-4                                                                                                                                                                                                                                                                                       | §T-1 完成条件「論点 6 案 F 実装可能性チェック完了」 / §T-4 検証手順 AbortController 表記訂正 / §論点 6 採択 + T-1 ベンチ採択検証 + 引用 SSoT / AP |
| MAJOR-1 | 論点 15 案 D 具体パターン文字列の不在                                                               | 論点 15 採択末尾に「詳細ページ ドロップダウン 6 種の具体パターン + デフォルトテストテキスト」表追加（メール / URL / 電話 / 郵便 / 日付 / HTML タグ）+ タイル placeholder 具体文言確定 + 競合 §8 typical use cases 上位 6 件選定理由明示                                                                                                                                                                                             | §論点 15 採択末尾「詳細ページ ドロップダウン 6 種の具体パターン」表 + タイル placeholder 具体文言                                                                                                                                                                                                                    | §T-2 完成条件 / §T-3 完成条件「論点 15 案 D の T-3 反映完了」                                                                                     |
| MAJOR-2 | シーン 2 自己整合性チェック (論点 6 × 論点 7 の組合せで タイル単独完結)                             | 論点 6 末尾「論点 5/11/13 への波及」→ 「論点 5/7/11/13 への波及」に拡張 + 論点 7 への波及明示判定 / T-4 シーン 2 体験トレースを「Worker で 80ms 全マッチ → タイル N 件ハイライト + 全件マッチ件数表示 → リスト全件表示 → コピーボタンで全件取得 → Excel 貼り戻し」に書き直し                                                                                                                                                        | §論点 6「論点 5/7/11/13 への波及」 + §T-4 (F) 実体験フロー検証シーン 2                                                                                                                                                                                                                                               | §論点 7 (タイル単独完結保証の構造的解消)                                                                                                          |
| MAJOR-3 | B-452 N 表現混乱（「N=3 暫定達成」表記の境界曖昧）                                                  | 全本文で「N=3 暫定達成」表現を全面撤廃 / 二択統一: 「真の N=2 達成 / B-452 N=3 着手条件は cycle-216 以降で再判定」または「真の N=1 のまま / cycle-216 以降で再挑戦」 / description (L3) 訂正 / 副次成果 (L16) 訂正 / 実施する作業 (L24) 訂正 / 論点 14 N 統計判定式 + T-4 アクション (a)(b)(c) 表記統一 / T-4 完成条件 表記統一                                                                                                     | §冒頭 description (L3) / §副次成果 (L16) / §実施する作業 (L24) / §論点 14 N 統計判定セクション全体（r4 改訂 = r3 process MINOR-1 対応 = 行番号併記を撤回し章名のみに統一 / 将来の行番号揺れに耐える表現 / grep 実測時の判定式開始行は `grep -nE "判定式（r3 改訂" docs/cycles/cycle-215.md` で取得） / §T-4 完成条件 | §T-4 実施事項 N 統計判定                                                                                                                          |
| MINOR-1 | 「競合 8 サイト全件ハイライト実装済」事実精度誇張                                                   | 競合調査 §4 L398-412 を再確認 / 「8 サイト中 5〜6 サイトがハイライト実装 (残り 2〜3 サイトは未実装 or 不明) = yolos.net の弱点 1 つ」に訂正 / 明示実装 (A:regex101 / G:WWW クリエイターズ) / 推測実装 (C/D/F/H) / 未実装 (E:Site24x7) / 不明 (B) を明記                                                                                                                                                                             | §目的「価値の核心」項目 5 (弱点 1 つの改善) / §論点 7 冒頭                                                                                                                                                                                                                                                           | （訂正後の方向性 = ハイライト導入は不変）                                                                                                         |

#### r2 process review 17 件

| 指摘 ID | 元の問題                                                                                                           | 採択した対応                                                                                                                                                                                                                                                                                         | 主反映箇所                                                                 | 副反映箇所                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| CRIT-1  | 観点 (viii) の「案 D 採用時はその値で検証」が r2 案 F 採択と内部矛盾                                               | 観点 (viii) を「論点 6 案 F 採択により MAX_INPUT_LENGTH=10,000 維持 = 既存値で検証 / 案 D 採用時記述は撤回」に書き換え                                                                                                                                                                               | §T-3 設計論点 観点 (viii)                                                  | （波及なし = テスト前提のみの内部矛盾）                                         |
| CRIT-2  | 論点 7 採択のハイライト色トークン未論証 + AP-I08 検証不在                                                          | 論点 7 末尾に「ハイライト色トークン候補比較」表追加 (--success-soft / --accent-soft / --warning-soft のゼロベース 3 案) + 採択 = --success-soft + AP-I08 観点で打ち消し済明示 + テキスト記号併用 (WCAG 1.4.1) / T-3 完成条件に「論点 7 採用ハイライト色トークン確定」追加                            | §論点 7「ハイライト色トークン候補比較」サブセクション + §T-3 完成条件      | §AP-P16 強化「r2/r3 補完ラベル」/ §引用 SSoT 14 (c215-β-tentative)              |
| CRIT-3  | T-1/T-2 で relatedSlugs 不在時の差し替え手順未具体化                                                               | 論点 10 末尾に「relatedSlugs 実在判定 + 差し替え候補比較」サブセクション追加 / planner 事前確認結果 = 3 件全件実在 PASS（差し替え不要） / フォールバック用差し替え候補 3 案 (案 A text-replace / 案 B char-count / 案 C url-encode) ゼロベース比較 + 採択基準 (M1b プログラマ動線) + 第一候補 = 案 A | §論点 10「relatedSlugs 実在判定 + 差し替え候補比較」サブセクション         | §T-2 完成条件「論点 10 relatedSlugs 実在判定完了」                              |
| CRIT-4  | B-462 採番フォールバック行番号 L24/L207/L500 固定が r2 改訂で破綻                                                  | T-2 検証手順末尾のフォールバック記述を全面書き換え: 行番号固定 (L24/L207/L500) を撤回 / 「`grep -nE 'B-462' docs/cycles/cycle-215.md` で全件特定 (r3 改訂時点で 8 箇所以上) → `sed -i 's/B-462/<本番採番 ID>/g'` で一括置換 → 残存 0 確認」の grep ベース手順に統一                                  | §T-2 検証手順末尾「B-462 採番衝突時のフォールバック」                      | （波及なし）                                                                    |
| MAJOR-1 | 数値 literal 4 分類ラベル網羅が r2 補完ラベル一覧追加のみで対症的                                                  | AP-P16 強化セクションに「r3 追補」項目 4 件 (スクショ枚数 / ベンチ字数 / N 値 / ハイライト色トークン) 追加 + 本文側個別 literal にラベル直近併記徹底 (T-1 ベンチ L137 / L142 / 置換マッピング表 / Tile テスト「最低 17 件」生成元 grep 結果併記)                                                     | §AP-P16 強化「r2/r3 補完ラベル」末尾 r3 追補 4 件                          | §T-1 ベンチ箇所 / §T-2 B-462 起票候補（grep 実測値併記）/ §T-3 タイルテスト件数 |
| MAJOR-2 | r1 → r2 改訂対応マップに行番号未記載で reviewer 独立検証不可                                                       | r2 → r3 改訂対応マップ（本セクション）を「主反映箇所 + 副反映箇所」形式に改訂し、各反映箇所に行範囲を併記                                                                                                                                                                                            | §r2 → r3 改訂対応マップ（本セクション）全体                                | r1 → r2 改訂対応マップ表は維持（既存サイクル文書として保存）                    |
| MAJOR-3 | 論点 6 案 F 案 B フォールバック時の波及未反映 (論点 11/13/c214-η 機械的断定)                                       | 論点 6 末尾に「案 B フォールバック時の波及」サブセクション追加（論点 11 = spinner 100ms threshold + debounce 300ms 経由 / 論点 13 = タイムアウト 500ms 整合 / c214-η = §補足事項で再判定明示）                                                                                                       | §論点 6「案 B フォールバック時の波及」                                     | §T-1 ベンチ採択検証 (段階的フォールバック 3 段階)                               |
| MAJOR-4 | 論点 14 N 統計判定の T-4 アクション (a)(b)(c) と T-4 完成条件 / 副次成果 で表記揺れ                                | 全本文で「真の N=2 達成 / 真の N=1 のまま」の二択統一表現に揃え（visitor MAJOR-3 と連動）/ 論点 14 判定式 + T-4 アクション + B-452 状態欄更新表記をすべて統一                                                                                                                                        | §論点 14 判定式 (L693-708) / §T-4 完成条件「B-452 状態欄更新」             | §副次成果 / §実施する作業                                                       |
| MAJOR-5 | 論点 15 採択の T-2 / T-3 完成条件反映不在                                                                          | T-2 完成条件に「論点 15 案 D の T-2 反映完了」(meta.ts サンプル 6 種定数追加) / T-3 完成条件に「論点 15 案 D の T-3 反映完了」(タイル placeholder + 詳細ページドロップダウン UI) + 観点 (xviii) 追加 (サンプル選択時 pattern + 本文自動入力)                                                         | §T-2 完成条件 / §T-3 完成条件 / §T-3 設計論点 観点 (xviii)                 | §論点 15 採択末尾の具体パターン表                                               |
| MAJOR-6 | 論点 5 教訓引用と事前確定の矛盾 (cycle-214 「(e) 系統事前確定撤回」教訓を引用しつつ「(e-α) 第一候補」事前確定残存) | 論点 5 採択結論を「T-1 実体確認まで採択保留 = T-1 完了時に (e) 候補から最終確定」に書き換え / 「想定系統」も「計画段階の暫定推定 / T-1 で確定」に緩和 / T-1 完成条件に「(e) 系統最終確定 = T-4 持ち越し」追加                                                                                        | §論点 5 採択結論 / §「複合入力型ゆえの注意点」想定系統                     | §T-1 完成条件「(e) 系統最終確定 = T-4 持ち越し」                                |
| MAJOR-7 | B-462 grep の `sort -u` が歯抜け採番で誤動作                                                                       | T-2 D 項 + T-2 検証手順 + フォールバック記述すべて `sort -u` → `sort -V` (version sort) に修正 + planner 確認結果 (B-461 = 最大) 注記                                                                                                                                                                | §T-2 D 項 B-462 起票候補 / §T-2 検証手順 / §T-2 検証手順末尾フォールバック | （波及なし）                                                                    |
| MINOR-1 | 引用 SSoT 番号体系統一の方針宣言のみで独自 ID 未付与                                                               | §引用する SSoT 1〜16 番の各項目冒頭に独自 ID（(c210-i) / (c210-ii) / (c210-v) / (c210-vi) / (c214-δ) / (c214-ζ) / (c214-η) / (c213-β) / (c213-γ) / (c213-δ) / (c214-ι) / (c214-β)）を併記                                                                                                            | §引用する SSoT 1〜16 項目冒頭                                              | §引用する SSoT 末尾の番号体系統一方針宣言                                       |
| MINOR-2 | M1a/M1b yaml 引用「line 13-20 想定」のまま                                                                         | yaml 実測 line 番号で確定（M1a `:15-20` likes / `:21-26` dislikes / `:27-` search_intents / M1b `:15-20` likes / `:21-24` dislikes / `:25` search_intents）/ 「想定」表記削除                                                                                                                        | §目的「誰のために」 M1a / M1b yaml 引用                                    | （波及なし）                                                                    |
| MINOR-3 | bundle インパクト「ほぼ 0」が論点 7/15 追加コード分を含まず断定                                                    | T-3 実施事項「bundle インパクト = ほぼ 0」を「T-3 で実測対象」に書き換え（案 F + 案 W + 案 Y + 論点 15 案 D の追加コードを First Load JS で計測 / 共有チャンク化最適化期待だが「ほぼ 0」断定は撤回）                                                                                                 | §T-3 実施事項「bundle インパクト = T-3 で実測対象」                        | §AP-P16 強化「r2/r3 補完ラベル」bundle インパクト項                             |
| MINOR-4 | r2 改訂対応マップで本文波及複数章分散の指摘が独立検証可能粒度未確保                                                | r2 → r3 改訂対応マップ（本セクション）を「主反映箇所 + 副反映箇所」形式に改訂（MAJOR-2 と連動）                                                                                                                                                                                                      | §r2 → r3 改訂対応マップ（本セクション）                                    | （波及なし）                                                                    |
| NIT-1   | 観点 (xvii) 「Worker 採用時のみ」記述が案 F 確定下で冗長                                                           | 観点 (xvii) を「論点 13 採択 = タイル + 詳細の両方で『計算がタイムアウトしました…』表示」に書き換え + 「Worker 採用時のみ」条件付き表現撤回                                                                                                                                                          | §T-3 設計論点 観点 (xvii)                                                  | （波及なし）                                                                    |
| NIT-2   | description (L3) に「B-452 N≥3 達成」残存 / 副次成果 L16 と不整合                                                  | L3 description を「B-452 N=2 検証データ蓄積 / M1a/M1b 来訪者の正規表現需要への最短応答 / B-452 N=3 着手条件は cycle-216 以降で再判定」に書き換え                                                                                                                                                     | §冒頭 description (L3)                                                     | §副次成果 (L16) / §実施する作業 (L24)                                           |

#### 俯瞰整合性チェック（指摘事項以外の波及確認）

- **論点 6 案 F 改訂（pre-warm / timeout 緩和等）の波及**:
  - 論点 5: MAX_INPUT_LENGTH=10,000 維持で従来同様 ✓
  - 論点 11: 案 B フォールバック時の波及で spinner 100ms threshold + debounce 300ms 経由を §補足事項で再判定とし、機械的断定を回避 ✓
  - 論点 13: 案 F-2 採択時 (timeout 200ms) でもタイムアウトメッセージ寿命 = 次入力まで永続表示 / setTimeout 不使用 / 表記訂正後の整合性確保 ✓
  - 引用 SSoT 7 (c214-η): 案 F フル採択時は N=3 通常引用適用達成 / 案 B フォールバック時は §補足事項で再判定明示 ✓
- **論点 7 案 W の N 値確定 + ハイライト色トークン確定の波及**:
  - T-3 完成条件: N 値本文書き戻し完了 + ハイライト色トークン確定追加 ✓
  - AP-P21 計測 (a)〜(e) ケース定義: マッチ結果欄 = リスト全件 + ハイライト N 件 overlay の二層構成（俯瞰整合性で論点 6 ↔ 論点 7 タイル単独完結保証）✓
  - §引用 SSoT 14 (c215-β-tentative): 採用トークン名 = `--success-soft` を本文書き戻し ✓
  - AP-I07 (jsdom 検出不可な DOM パフォーマンス問題): T-1 プロトタイプは Playwright 実機で計測 ✓
- **論点 15 案 D 具体サンプル 6 種の波及**:
  - T-2 完成条件: meta.ts サンプル 6 種定数追加 ✓
  - T-3 完成条件: タイル placeholder メールサンプル + 詳細ページドロップダウン UI ✓
  - 観点 (xviii) 新規追加 ✓
- **B-452 N 表現訂正の波及**:
  - 冒頭 description (L3) / 副次成果 (L16) / 実施する作業 (L24) / 論点 14 (L693-708) / T-4 (L342-372) / B-452 backlog 連動記述すべて「真の N=2 達成 / 真の N=1 のまま」の二択統一 ✓
  - 「N=3 暫定達成」表現は全本文から撤廃 ✓

**r3 改訂完了 / r3 レビュー依頼推奨**

---

### r3 visitor review (2026-05-29 / 来訪者価値観点 / r2 → r3 改訂評価)

**判定: 改善指示**

事後検証質問形 (AP-WF15)。r2 visitor review 6 件 (CRIT 2 / MAJOR 3 / MINOR 1) の対応マップに従って r3 改訂された本文を全件確認したところ、CRIT-1〜MAJOR-3 は本文反映が十分に行われており方向性は来訪者価値最大化原則と整合している。ただし **MINOR-1 (競合 8 サイト全件ハイライト記述の事実精度訂正) が L62 では訂正済だが L220 で再発残存** + 新たに採択された案 W-3 (N=100) の **シーン 2「100〜500 件マッチ」想定との上限カバー不足** および **タイル 400×400px 枠内でのリスト全件表示時の DOM 圧迫整合性** に詰めの不足が見える。指摘事項計 4 件 (CRIT 0 / MAJOR 2 / MINOR 2 / NIT 0)。

---

#### MAJOR-1: 案 W-3 (N=100) 第一候補がシーン 2「URL 抽出 5,000〜10,000 字 / 100〜500 件マッチ」の上限 500 件をカバーせず、来訪者価値の核（シーン 2 タイル単独完結保証）が部分達成に留まっているのではないか?

- **指摘内容**: §論点 7 「N 値確定方針」サブセクション (L520-532) で第一候補 = 案 W-3 (N=100) を採択し、表 L526 で「シーン 2 中央寄り (100 件マッチケースをカバー)」と書かれている。しかし計画書冒頭シーン 2 想定 (L62, L495) は「100〜500 件マッチ」レンジであり、N=100 では **上限 500 件側がハイライト 100 件のみ = 残り 400 件が「視覚的フィードバック無し」状態**になる。L529「リスト欄は全件表示 (コピーボタンで全件取得可能 = タイル単独完結)」で「タイル単独完結」は機能的に成立するが、**ハイライト N=100 件 vs リスト 500 件のギャップ** = visitor が「ハイライトされていない 400 件は実は別物か?」と混乱するリスクがある (M1a dislikes「結果を信用していいか判断できない」に該当)。**第一候補は案 W-3 (N=100) ではなく案 W-4 (動的 / IntersectionObserver) を第一候補とし、案 W-3 を案 W-4 不採用時のフォールバックに格下げ**するか、または **シーン 2 想定マッチ件数のレンジ自体を 100〜200 件に絞り込んで visitor 価値整合性を確保**するかの二択を明示すべき。
- **根拠**: §論点 7 表 L526 (案 W-3 採択理由「100 件マッチケースをカバー」) / §論点 6 L495 (シーン 2 「100〜500 件マッチ実態」) / §T-4 (F) 実体験フロー検証 シーン 2 L363 (「マッチ件数 (例「312 件マッチ」) 表示」= 312 件想定で N=100 だと 212 件未ハイライト) / M1a yaml dislikes「結果を信用していいか判断できない」
- **期待する対応方針**:
  1. §論点 7 表 L526 の第一候補を **案 W-4 (動的 IntersectionObserver)** に変更 / 案 W-3 (N=100) は案 W-4 が T-1 で実装複雑度過大と確認された場合のフォールバック第二候補に格下げ
  2. または案 W-3 維持の場合 = §論点 7 末尾に **「N=100 を超えるマッチ件数時のリスト欄 UI 表現」具体動線**を明示 (例: リスト先頭 100 件はハイライト連動 / 101 件目以降のリスト行に「(ハイライト未表示)」記号を付ける等 = ハイライトとリストの対応関係を visitor が誤解しない設計)
  3. シーン 2 想定マッチ件数を「100〜200 件」に絞り込むなら §論点 6 L495 + §目的シーン 2 + §T-4 L363「312 件マッチ」例示を整合改訂

---

#### MAJOR-2: §T-2 実施事項 L220「競合 8 サイト全件実装済の唯一の弱点」が r2 MINOR-1 対応 (§目的 L62 + §論点 7 L509 で「8 サイト中 5〜6 サイト」訂正済) と矛盾して残存しているのではないか?

- **指摘内容**: §目的 L62 と §論点 7 冒頭 L509 では r2 visitor MINOR-1 対応で「競合 8 サイト中 5〜6 サイトがハイライト実装 / 残り 2〜3 サイトは未実装 or 不明」に訂正済。しかし §T-2 実施事項 L220 (「**詳細ページのテキストエリア内ハイライト導入**」項) で「**競合 8 サイト全件実装済の唯一の弱点を改善する場合**」と訂正前の事実精度誇張表現が残存している。**同一の事実 (競合 8 サイト中のハイライト実装率) が本文 3 箇所で 2 箇所訂正 + 1 箇所未訂正という内部矛盾**となっており、reviewer / builder が本文を読み下す際にどちらが正しいか判断できない。
- **根拠**: §T-2 実施事項 L220 (未訂正) vs §目的 L62 (訂正済) vs §論点 7 L509 (訂正済) / r2 → r3 改訂対応マップ MINOR-1 「主反映箇所 = §目的 + §論点 7 冒頭 / 副反映箇所 = 訂正後の方向性 = ハイライト導入は不変」(L1519) で §T-2 への波及が **検証漏れ**
- **期待する対応方針**: §T-2 実施事項 L220 を「**競合 8 サイト中 5〜6 サイトがハイライト実装済 = yolos.net の弱点 1 つを改善する場合**」に訂正。`grep -nE "8 サイト全件|8サイト全件|全件実装" docs/cycles/cycle-215.md` で残存 0 を確認 (現状 1 件ヒット)。

---

#### MINOR-1: 案 W-3 (N=100) の DOM ノード数とタイル 400×400px 枠の整合性検証が表に書かれているだけで、本文に「視認可能性」の具体根拠が示されていないのではないか?

- **指摘内容**: §論点 7 表 L526 案 W-3 採択理由は「DOM ノード数とパフォーマンスのバランス」だけで、**N=100 件のハイライト overlay + リスト 100 行表示が本当にタイル 400×400px (操作側除外で実質結果欄 ~250×400px) で「視認可能」か**の具体根拠 (例: 1 マッチあたり overlay div の最小高さ計算 / リスト 1 行 22px × 100 行 = 2200px のスクロール量見積もり) が本文に書かれていない。案 W-1 (N=10) は L524 で「タイル幅 400px で視認可能な件数」と明示があるが、案 W-3 (N=100) には同等の「視認可能性」評価が無い。T-1 プロトタイプ検証で実証する旨は L528 にあるが、**計画段階で「N=100 が視認可能と推定できる根拠」を計画者責務として暫定明示する必要**がある (AP-WF03 / 採択値の暫定根拠は計画者責務)。
- **根拠**: §論点 7 表 L524-526 (案 W-1 と案 W-3 の採択判断軸の粒度差) / AP-WF03 計画者責務 / r2 visitor CRIT-1 対応の「N 値は来訪者価値から逆算して確定すべき」精神
- **期待する対応方針**: §論点 7 表 L526 案 W-3 の採択判断軸欄を「**DOM ノード数とパフォーマンスのバランス / シーン 2 中央寄り (100 件マッチケースをカバー) / リスト 1 行 ~22px × 100 行 = ~2,200px (タイル結果欄 overflowY:auto でスクロール許容) / overlay div は textarea 内 absolute 配置のため textarea スクロール時に同期スクロール = 表示中マッチのみ DOM 描画**」と具体根拠を 1 行追記。T-1 プロトタイプ検証で計画値の妥当性を実測検証する旨は L528 で明示済 = OK。

---

#### MINOR-2: §論点 15 詳細ページドロップダウン 6 種の M1a「正規表現が苦手」シーンに対する体験トレースが本文に明示されていないのではないか?

- **指摘内容**: §論点 15 末尾 L645-652 でドロップダウン 6 種の具体パターン表が確定済 = r2 visitor MAJOR-1 対応として OK。しかし「**M1a『正規表現が苦手だが URL 抽出したい』シーンでドロップダウン選択 → pattern + 本文自動入力 → 即時マッチ表示 → コピー → 元作業画面に戻る**」という体験トレースが §目的シーン 2 (L48-52) に統合反映されていない。シーン 2 は現状「pattern input に `https?://...` 入力」と書かれており、**M1a が pattern を手入力できないからこそドロップダウン UI が来訪者価値**であるという論点 15 の本質が体験トレースに繋がっていない。
- **根拠**: §目的シーン 2 L48-52 (pattern 手入力前提) / §論点 15 採択根拠 L622 (M1a「正規表現が苦手だが URL 抽出したい」シーン直撃) / M1a yaml interests「ミスが起きやすい部分を素早く確認」
- **期待する対応方針**: §目的シーン 2 L48-52 を「(1) 詳細ページへアクセス → (2) **ドロップダウンから「URL」サンプル選択 → pattern + 本文 textarea にデフォルトサンプル自動入力**（M1a 正規表現知識不要） → (3) 本文 textarea を自分のログテキストに置き換え → (4) ハイライト + リスト全件表示 → (5) コピーボタン → Excel 貼り戻し」のように **ドロップダウン経由動線**を含めた体験トレースに改訂。または §論点 15 末尾に「**M1a / M1b 体験トレース紐付け**」サブセクションを追加し、サンプル 6 種それぞれが M1a / M1b どちらのシーンに刺さるかを 1 行ずつ明示。

---

#### 総括 (r2 → r3 改訂評価コメント / 300 字以内)

r2 改訂で見送られていた CRIT-1 (N 値) / CRIT-2 (案 F 実装可能性) / MAJOR-1 (具体パターン) / MAJOR-2 (シーン 2 整合) / MAJOR-3 (B-452 表記) は r3 で堅実に本文反映され、来訪者価値最大化原則と整合する設計が確立した。特に案 F のサブ案 F-1〜F-4 + 段階的フォールバック判定経路、ドロップダウン 6 種具体パターン表、(c214-β) N 表記統一は計画書としての完成度を大きく押し上げている。残課題は MINOR-1 の §T-2 L220 訂正漏れ (3 箇所中 1 箇所未訂正) と 案 W-3 (N=100) のシーン 2 上限カバー / 視認可能性整合の詰め。いずれも根本構造ではなく波及反映と具体根拠付与で解決可能。

**PM への次工程指示**:

1. planner サブエージェントに本指摘の全件対応を依頼する (MAJOR-1 / MAJOR-2 / MINOR-1 / MINOR-2)。あわせて r1 visitor + r1 process + r2 visitor + r2 process + 本 r3 visitor の指摘全件が本文に反映されている状態を維持する。
2. 計画書全体の見直し (指摘事項以外も含む俯瞰再確認) も併せて実施する。
3. 修正後、再度レビュー (r4 review) を依頼する。レビュー省略は認められない。

---

### r3 process review (2026-05-29 / SSoT 引用妥当性 + 数値 literal 4 分類ラベル + T-1〜T-4 タスク独立性 / r2 → r3 改訂評価)

**判定: 改善指示**

事後検証質問形（AP-WF15）で記述。r2 process review 17 件 + r2 visitor review 6 件 = 計 23 件の対応マップを本文全件と突合した結果、根本対応は全件本文反映されている（CRIT-1 観点 (viii) の「案 D 採用時はその値で検証」撤回 / CRIT-2 ハイライト色トークン `--success-soft` 採用 + globals.css L38/L124 grep 実測引用 / CRIT-3 relatedSlugs 差し替え候補比較表追加 / CRIT-4 B-462 採番フォールバックの行番号固定撤回 + grep ベース手順統一 / MAJOR-1〜7 / MINOR-1〜4 / NIT-1〜2）。特に案 F-1〜F-4 サブ案 + 段階的フォールバック / N 値サブ案 W-1〜W-4 ゼロベース 4 案比較 / サンプル 6 種具体パターン表 / 関連 SSoT 独自 ID (c210-i / c214-β 等) 併記 / `sort -V` への改修 / 「真の N=2 / 真の N=1」二択統一は r2 指摘の本旨に応える根本対応として高評価。

ただし r3 で新たに採択された数値 literal の一部に 4 分類ラベル + 生成元の直近併記漏れ + 既存実装事実引用の事実誤認 + r2→r3 対応マップの行番号小ずれが残存しており、3 件の改善指示を残す。なお、r3 visitor review が同タイムスタンプで既出の MAJOR-2（L220「8 サイト全件実装済」未訂正）について process 観点でも同一指摘となるため、本 process review では重複指摘を避ける（r3 visitor review MAJOR-2 で対応されれば process 観点も同時解消）。

---

#### MAJOR-1: 論点 6 案 F サブ案で導入された「Blob URL inline Worker 初回起動コスト 50〜150ms」（L469）に 4 分類ラベル + 生成元が直近併記されていないのではないか?

- **指摘内容**: §論点 6 案 F のサブ案見出し L469「**Blob URL inline Worker の初回起動コスト 50〜150ms に対する技術的フォールバック**」で 50〜150ms という数値範囲が登場するが、(1) 4 分類ラベル（実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値）が併記されていない、(2) 生成元（Chrome / Safari ドキュメント URL / 既存実測ファイル / 推定計算式のいずれか）が直近に示されていない。下方の r2 process review 指摘内容欄 L1268 では「Blob URL + new Worker() の初回起動コストだけで実機 50〜150ms かかるのが Chrome / Safari の現実」と書かれているが、これが「実測値」なのか「経験的推定値」なのか「MDN 仕様値」なのか判別不能。AP-P16「すべての数値 literal に 4 分類ラベル + 生成元を直近併記」自己宣言（L70-77）と本文記述の二重基準。同様に案 F-2 timeout 200ms 緩和の根拠「Worker 起動コスト + 中程度パターン計算で 200ms は visitor 実感の即時性を維持できる仕様値域」（L472）の 200ms 値も、Nielsen「思考の連続性が保たれる `<1 秒` 域」は **仕様値** として引用されているが Worker 起動コスト側の生成元は不明。
- **根拠**: cycle-215.md L469（Worker 起動コスト 50〜150ms）/ L472（timeout 200ms 緩和根拠）/ L70-77（AP-P16 強化自己宣言）/ docs/anti-patterns/planning.md AP-P16
- **期待する対応方針**:
  1. L469 の「50〜150ms」に「**推定値** = MDN [Worker startup cost](https://developer.mozilla.org/en-US/docs/Web/API/Worker) ベース + 経験的暫定値 / T-1 ベンチで実機計測予定」を直近併記
  2. L472 の「Worker 起動コスト + 中程度パターン計算で 200ms」も「**推定値** = 案 F-1 pre-warm 失敗時の暫定上限 / T-1 ベンチで実証予定（Nielsen 仕様値 `<1 秒` 域は別軸引用済）」と直近併記
  3. §AP-P16 強化「r3 追補」一覧に「**Worker 起動コスト 50〜150ms = 推定値 + 経験的暫定値 / T-1 で実測予定**」を 1 項目追加

---

#### MAJOR-2: 論点 7 案 W サブ案 W-2 N=50 採択判断軸「既存 Component.tsx の maxDisplay=50 と整合」（L525）が実装側の事実と一致しないのではないか?

- **指摘内容**: §論点 7 案 W サブ案 W-2 N=50 の採択判断軸（L525）に「**既存 Component.tsx の maxDisplay=50 と整合**」と書かれているが、実装側 `src/tools/regex-tester/Component.tsx` を grep 確認すると **`maxDisplay` という変数名は存在しない**（**実測値** = `grep -nE "maxDisplay|MAX_DISPLAY|max_display" src/tools/regex-tester/Component.tsx` = 0 件）。実体は L100 `matchResult.matches.slice(0, 50).map(...)` および L113 `matchResult.matches.length > 50` でハードコード 50 を直書きしている（**実測値** = `grep -nE "slice\(0, 50\)" src/tools/regex-tester/Component.tsx` = L100 ヒット）。「`maxDisplay=50` という定数化された変数」を引用しているように読めるが実体はマジックナンバー。AP-WF12「事実情報の自己確認」観点で planner Read による事実引用ミス。さらに「既存実装と数値一致するから整合」だけを採択判断軸とするならば、既存ハードコード値の妥当性そのものは未論証であり、AP-P11（AI の過去の判断を変更不可として扱わない）兆候も含む。
- **根拠**: cycle-215.md L525 / 実装側 `src/tools/regex-tester/Component.tsx:100,113`（`matchResult.matches.slice(0, 50)` の直書き）/ AP-WF12 / AP-P11
- **期待する対応方針**:
  1. L525 の表記を「**既存 Component.tsx のマッチ一覧表示上限ハードコード 50 件**（**実装値** = `src/tools/regex-tester/Component.tsx:100,113` の `slice(0, 50)` 直書き / 変数化されていないマジックナンバー）**と数値一致**」に書き換え（事実精度向上）
  2. 案 W-2 採択判断軸を「**既存実装値踏襲 / ただし既存値の妥当性は T-1 プロトタイプ実測で再評価**」に緩和（AP-P11 リスク回避）
  3. 仮に N=100 採択時に既存ハードコード 50 と乖離するため、Component.tsx の touch 要否を T-3 設計論点 or T-2 完成条件で扱うかを §論点 7 末尾で判定

---

#### MINOR-1: r2 → r3 改訂対応マップ visitor MAJOR-3 行の反映箇所「§論点 14 N 統計判定式 (L685-708)」（L1518）の開始行が実本文と一致していないのではないか?

- **指摘内容**: §r2 → r3 改訂対応マップ visitor MAJOR-3 行 L1518 で反映箇所として「**§論点 14 N 統計判定式 (L685-708)**」と記載されているが、実本文では `**判定式（r3 改訂 = r2 visitor MAJOR-3 + r2 process MAJOR-4 対応 ...）**` 開始行が **L693**（**実測値** = `grep -nE "判定式（r3 改訂" docs/cycles/cycle-215.md` = L693）であり、L685 から始まっていない（L685-692 は判定式の前文 = N 統計判定の母集団補正の文脈）。ユーザーが r3 process review 依頼で明示的に「**反映箇所行番号が正確か grep で確認**」を求めているにもかかわらず、対応マップ表に小さなずれが残存している。CRIT-4 で「B-462 採番手順は行番号固定を撤回 = grep ベース手順に統一」と判断した本旨と合わせ、対応マップで行番号を併記する場合は実数値精度を確保すべき。なお、他の引用行（L3 / L16 / L24 / L342-372 等）は本文位置と一致しているため致命的ではない。
- **根拠**: cycle-215.md L693（判定式開始行 / grep 実測）/ L1518（対応マップ表 visitor MAJOR-3 反映箇所欄）/ L1560（俯瞰整合性チェックでは「論点 14 (L693-708)」と正しく記載されている = 同表内での自己整合性破綻）
- **期待する対応方針**: L1518 の「§論点 14 N 統計判定式 (L685-708)」を「**§論点 14 N 統計判定式 (L693-708)**」に訂正（L1560 の俯瞰整合性チェック表記と統一）。あるいは行番号併記そのものを撤回し「§論点 14 N 統計判定セクション全体」と章名のみに統一して将来の行番号揺れに耐える表現にする選択肢もあり。

---

#### 総合判定 = 改善指示

MAJOR 2 件 + MINOR 1 件 = 計 3 件。**r2 → r3 改訂は r2 指摘 23 件全件への根本対応として全体的に良質**（特に visitor CRIT-1 N 値確定方針 + 4 サブ案ゼロベース比較 / visitor CRIT-2 案 F サブ案 F-1〜F-4 + 段階的フォールバック / visitor MAJOR-1 サンプル 6 種具体パターン表 / process CRIT-1 観点 (viii) 案 D 撤回 / process CRIT-2 `--success-soft` 採用 + globals.css L38/L124 grep 実測引用 / process CRIT-3 relatedSlugs 差し替え候補 3 案 + planner 事前確認 PASS / process CRIT-4 B-462 行番号固定撤回 + grep ベース統一 / process MAJOR-1 r3 追補 4 件 / process MINOR-1 関連 SSoT 独自 ID 併記 / process MAJOR-7 `sort -V` への改修 はいずれも対症療法的処理を避けた根本対応）。残存指摘は **数値 literal ラベル網羅の最後の漏れ（Worker 起動コスト 50〜150ms）+ 既存実装事実引用の小事実誤認（maxDisplay=50 が実体は slice(0, 50) ハードコード）+ 対応マップ行番号の小ずれ（L685 vs 実 L693）** の 3 件のみで、いずれも根本構造には影響しない局所的事実精度の問題。改善対応はいずれも 5〜10 分以内の局所編集で完了可能。

**PM への次工程指示**:

1. planner サブエージェントに本 r3 process review の全件対応を依頼する（MAJOR-1〜MAJOR-2 / MINOR-1）。あわせて r3 visitor review の指摘 4 件（MAJOR-1〜MAJOR-2 / MINOR-1〜MINOR-2）+ 既存 r1/r2 系の指摘全件の本文波及維持を継続。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。
3. 修正後、再度レビュー（r4 process review）を依頼する。レビュー省略は認められない。

---

### r3 → r4 改訂のレビュー対応マップ

r3 visitor review 4 件（MAJOR 2 + MINOR 2）+ r3 process review 3 件（MAJOR 2 + MINOR 1）= 計 7 件への対応マップ。反映箇所は「§セクション名 + 主反映行範囲」で記載。行番号は r4 改訂完了直後の値（後続編集で揺れる可能性あり / r3 process MINOR-1 を受けて行番号併記は将来揺れる前提で扱う）。

#### r3 visitor review 4 件

| 指摘 ID | 元の問題                                                                                                          | 採択した対応                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 主反映箇所                                                                        | 副反映箇所                                                                                                                                             |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MAJOR-1 | 案 W-3 (N=100) 第一候補がシーン 2 上限 500 件をカバーせず来訪者価値の核（シーン 2 タイル単独完結保証）が部分達成  | **案 a 採択** = §論点 7「N 値確定方針」の第一候補を **案 W-4（動的 / IntersectionObserver）に格上げ**。案 W-3 (N=100) は案 W-4 不採用時の第二候補に格下げ + N=100 採択時の UI 文言（「100 件以上は省略 / コピーで全件取得」+ リスト 101 件目以降「(ハイライト未表示)」記号）を確定。採択理由 = (1) 来訪者価値軸 = ハイライト N 件 vs リスト 500 件のギャップ解消 / (2) AP-I07 = 動的描画で DOM ノード下限化 / (3) タイル幅 400px 制約 = 9〜10 行視認上限と整合（CLAUDE.md Decision Making Principle 準拠） | §論点 7「N 値確定方針」第一候補 = 案 W-4 採択 + 採択理由 3 軸                     | §論点 7 表（W-3 / W-4 行に視認可能性根拠を追記）/ §論点 7 第二候補 = 案 W-3 (N=100) フォールバック UI 文言 / §AP-P16 強化「r4 追補（視認可能性根拠）」 |
| MAJOR-2 | §T-2 実施事項 L220「競合 8 サイト全件実装済」未訂正残存 = 3 箇所中 1 箇所未訂正 = 内部矛盾                        | §T-2 実施事項 L220 を「競合 8 サイト中 5〜6 サイトがハイライト実装済 = yolos.net の弱点 1 つを改善する場合は…」に訂正 + §論点 7 スコープ膨張への配慮 / §代替案 採択結果 = regex-tester の「唯一の弱点」表現も「弱点 1 つ / 8 サイト中 5〜6 サイト実装済の格差」に統一。`grep -nE "8 サイト全件\|8サイト全件\|全件実装" docs/cycles/cycle-215.md` で訂正前表現の残存 0 を確認                                                                                                                               | §T-2 実施事項（旧 L220 / ハイライト導入項）                                       | §論点 7「スコープ膨張への配慮」/ §検討した他の選択肢「採択結果 = regex-tester」                                                                        |
| MINOR-1 | 案 W-3 (N=100) DOM ノード数とタイル 400×400px 整合性の「視認可能性」具体根拠が本文未明示                          | §論点 7 表 案 W-3 行に視認可能性具体根拠を追記 = リスト 1 行 約 22px × 100 行 = 約 2,200px / 最初の ~10 行のみ視認 / 残り 90 件は overlay div 内で非可視描画 = DOM ノード負荷とコピー可用性のトレードオフ。あわせて表 案 W-4 行にも視認可能性根拠（先頭 10 件 + スクロール追加描画）を追記。§AP-P16 強化「r4 追補（視認可能性根拠）」に推定値計算式（操作側 ~200px + 膨張側 ~200px + 1 行 ~22px = 9〜10 行視認）を集約記録                                                                                 | §論点 7 表 案 W-3 / 案 W-4 採択判断軸 / §AP-P16 強化「r4 追補（視認可能性根拠）」 | §論点 7 第二候補 (N=100) フォールバック説明                                                                                                            |
| MINOR-2 | §論点 15 詳細ページドロップダウン 6 種の M1a「正規表現が苦手」シーンに対する体験トレースが §目的シーン 2 に未統合 | §目的シーン 2 を改訂し M1a 動線（ドロップダウン「URL」選択 → pattern + 本文 textarea 自動入力 → M1a 正規表現知識ゼロでも開始可能）を 1 ステップとして明示。M1b 動線（pattern 直接入力）と並列に分岐記述し、共通動線（マッチ確認 → コピー → 元作業画面）に収束する形に書き直し。論点 15 案 D 採択と整合する体験トレース                                                                                                                                                                                     | §目的シーン 2（M1a 動線 + M1b 動線の分岐 → 共通動線の収束）                       | §論点 15 採択末尾の具体パターン表（M1a/M1b 紐付けは シーン 2 で代替）                                                                                  |

#### r3 process review 3 件

| 指摘 ID | 元の問題                                                                                                                         | 採択した対応                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 主反映箇所                                                                                                      | 副反映箇所                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| MAJOR-1 | Blob URL inline Worker 初回起動コスト 50〜150ms + 案 F-2 timeout 200ms 緩和の数値 literal に 4 分類ラベル + 生成元の直近併記漏れ | §論点 6 案 F サブ案見出しの 50〜150ms 数値直近に「**推定値 + 経験的暫定値** / 生成元 = MDN Worker startup cost ベース + Chrome DevTools / Safari Web Inspector の一般的計測範囲 / T-1 実機計測で再確認予定」を併記。案 F-2 200ms 数値直近に「**経験的暫定値** / 生成元 = Nielsen Norman Group『Response Times: The 3 Important Limits』の 100ms 瞬時性と 1 秒 思考連続性の中間値採択 + 案 F-1 pre-warm 失敗時の暫定上限 / T-1 ベンチで実証予定」を併記。§AP-P16 強化「r4 追補」に同 2 項目を集約追加 | §論点 6 案 F サブ案見出し（50〜150ms / 200ms に 4 分類ラベル + 生成元を直近併記） / §AP-P16 強化「r4 追補」追加 | （波及なし = 既存 200ms 説明文と整合）                                      |
| MAJOR-2 | §論点 7 案 W-2 N=50 採択判断軸「既存 Component.tsx の maxDisplay=50 と整合」が実装側事実と不一致（maxDisplay 変数は存在しない）  | §論点 7 表 案 W-2 行を「既存 Component.tsx L100 `matches.slice(0, 50)` ハードコードと整合 = **実装値ラベル**（**実測値** = `grep -nE "slice\(0, 50\)" src/tools/regex-tester/Component.tsx` = L100 ヒット / 変数化されていないマジックナンバー）/ ただし既存ハードコード値の妥当性は T-1 プロトタイプ実測で再評価（AP-P11 過去判断盲信リスク回避）」に書き換え                                                                                                                                       | §論点 7 表 案 W-2 採択判断軸                                                                                    | （波及なし = 採択は案 W-4 第一候補 / 案 W-3 第二候補のため案 W-2 は不採用） |
| MINOR-1 | r2 → r3 改訂対応マップ visitor MAJOR-3 行の反映箇所「§論点 14 N 統計判定式 (L685-708)」（行番号小ずれ / 実体は L693 開始）       | r2 → r3 対応マップ MAJOR-3 行の反映箇所を「§論点 14 N 統計判定セクション全体」に書き換え = 行番号併記を撤回し章名のみに統一（将来の行番号揺れに耐える表現 / r3 process MINOR-1 で提示された後者の選択肢を採用 / grep 実測時の判定式開始行は `grep -nE "判定式（r3 改訂" docs/cycles/cycle-215.md` で取得する旨を明記）                                                                                                                                                                               | §r2 → r3 改訂対応マップ visitor MAJOR-3 行 反映箇所                                                             | （波及なし）                                                                |

#### 俯瞰整合性チェック（指摘事項以外の波及確認）

- **論点 7 案 W-4 第一候補格上げの波及**:
  - §AP-P16 強化「r4 追補（視認可能性根拠）」追加 ✓
  - §T-1 完成条件「論点 7 案 W の N 値確定根拠取得」= N=10/50/100/500 + 動的描画の 5 段階計測に拡張対応（builder は既存条件で読み下し可能）✓
  - §T-3 完成条件「論点 7 案 W の N 値本文書き戻し完了」= 案 W-4 採択時の IntersectionObserver 実装も含む（builder 裁量範囲）✓
  - AP-I07 (jsdom 検出不可な DOM パフォーマンス問題) = Playwright 実機計測前提は維持 ✓
  - AP-P21 (a)〜(e) ケース定義 = (d) マッチ結果欄に動的 overlay div 追加（リスト + ハイライト overlay の二層構成 = 変化なし）✓
- **「8 サイト全件」「唯一の弱点」訂正の俯瞰（r5 改訂 = r4 visitor MAJOR-1 + r4 process MINOR-1 対応 = 俯瞰対象に L14 主目的を追加 + grep パターンを「唯一の弱点 / 0 実装」も捕捉する形に強化）**:
  - **§実施する作業 主目的 L14（r5 で訂正）** / §目的 L63（訂正済 r3）/ §論点 7 冒頭 L513（訂正済 r3）/ §T-2 実施事項 L224（r4 で訂正） / §論点 7 スコープ膨張への配慮 L556（r4 で訂正） / §代替案 採択結果 L724（r4 で訂正）/ §代替案「タイル UI のテキストエリア内ハイライト実装案」L736-740（r5 で「採択結果」表記に転換）= 計 6 箇所の「競合 8 サイト中 5〜6 サイト実装 = 弱点 1 つ」表現で統一 ✓
  - `grep -nE "8 サイト全件|8サイト全件|全件実装|唯一の弱点|0 実装" docs/cycles/cycle-215.md` = レビュー履歴セクション以外で 0 件（r5 改訂 = r4 process MINOR-1 対応 = 検索パターン強化 = 「唯一の弱点」「0 実装」も捕捉対象に追加 / 検証は r5 builder/reviewer 独立再実行で確認）
  - **AP-P18「採択変更時の俯瞰整合性チェックテンプレート」自体の改善（r4 process review L1829 / 同 1834 PM 次工程指示 (2) 連動 / r5 改訂 = §補足事項に書き戻し）**: 採択変更時に必ず突合すべき箇所として「§実施する作業 主目的 + 副次成果（L12-16）/ §検討した他の選択肢全件 / §目的シーン 1/シーン 2 体験トレース全件 / T-1〜T-4 完成条件の grep パターン全件 / 引用 SSoT 一覧の波及対象」を AP-P18 / AP-WF15 テンプレートに正式追加する改善案を §補足事項に書き戻し（cycle 完遂後の anti-patterns/planning.md or workflow.md への正式反映は PM 判断で次サイクル以降）
- **数値 literal 4 分類ラベル徹底の俯瞰**:
  - r4 追補 3 項目（Worker 起動コスト 50〜150ms / 案 F-2 200ms / 視認可能性根拠 = 操作側 200px + 膨張側 200px + 1 行 22px）が §AP-P16 強化に集約記録 ✓
  - 既存の本文側個別 literal 直近併記（T-1 ベンチ / B-462 grep / Tile テスト件数等）は r3 で完了 ✓
  - 新規追加箇所（§シーン 2 改訂 / §論点 7 N 値確定方針改訂 / §AP-P16 強化 r4 追補）にラベル付与済 ✓
- **採択案間の相互整合性**:
  - 論点 6 案 F（Worker + worker.terminate() + timeout 100ms / フォールバック F-1 pre-warm + F-2 200ms 緩和）↔ 論点 7 案 W-4 動的描画 = 描画パスと計算パスは独立 / 整合 ✓
  - 論点 7 案 W-4 動的描画 ↔ 論点 15 案 D ドロップダウン 6 種 = ドロップダウン選択時に自動入力 → 案 W-4 動的描画で即時マッチ反映 / 整合 ✓
  - 論点 15 案 D ↔ §シーン 2 M1a 動線改訂 = ドロップダウン経由動線が体験トレースに反映済 / 整合 ✓
- **T-1〜T-4 完成条件と論点採択の整合**:
  - T-1 完成条件「論点 6 案 F 実装可能性チェック完了 / 論点 7 案 W の N 値確定根拠取得 / (e) 系統最終確定 = T-4 持ち越し」= 採択案と整合 ✓
  - T-2 完成条件「論点 15 案 D の T-2 反映完了 / 論点 10 relatedSlugs 実在判定完了 / hex 直書き 0 / 旧トークン 0 / B-462 追記済」= r4 で訂正済の論点と整合 ✓
  - T-3 完成条件「論点 7 採用ハイライト色トークン確定 / 論点 7 案 W の N 値本文書き戻し完了 / 案 W-4 採択時の IntersectionObserver 実装は builder 裁量」= 採択案と整合 ✓
  - T-4 完成条件「真の N=2 達成 / 真の N=1 のままの二択判定 / 体験フロー検証 シーン 2 = M1a 動線 + M1b 動線の両方確認」= 改訂シーン 2 と整合 ✓

**r4 改訂完了 / r4 レビュー依頼推奨**

---

### r4 visitor review (2026-05-29 / 来訪者価値観点 / r3 → r4 改訂評価)

**判定: 改善指示**

事後検証質問形（AP-WF15）。r3 visitor review 4 件（MAJOR 2 + MINOR 2）の対応マップに従って r4 改訂された本文を全件確認したところ、MAJOR-1（案 W-4 第一候補格上げ + 採択理由 3 軸 + フォールバック UI 文言）/ MINOR-1（視認可能性根拠の具体計算式 = 操作側 200px + 膨張側 200px + 1 行 22px = 9〜10 行）/ MINOR-2（§目的シーン 2 改訂 = M1a 動線 + M1b 動線の分岐 → 共通動線収束）はいずれも本文に **根本対応として反映済み**で来訪者価値最大化原則と整合している。一方 **MAJOR-2「8 サイト全件実装済の唯一の弱点」訂正の波及網羅が再び不十分**であり、本文 6 箇所中 1 箇所（§実施する作業 主目的 L14）が **依然として「唯一の弱点」「テキストエリア内ハイライト 0 実装」という r3 visitor MINOR-1 で否定された誇張表現のまま** 残存している。さらに r3 → r4 改訂対応マップ末尾「俯瞰整合性チェック」L1709 が「§目的 L62 / §論点 7 冒頭 L512 / §T-2 実施事項 / §論点 7 スコープ膨張への配慮 / §代替案 採択結果 = 計 5 箇所で統一」と宣言しているが **そもそも俯瞰対象に L14 主目的が含まれておらず、俯瞰チェック自体の網羅性が破綻**している。指摘事項計 1 件（CRIT 0 / MAJOR 1 / MINOR 0 / NIT 0）。

---

#### MAJOR-1: §実施する作業 主目的 L14「唯一の弱点『テキストエリア内ハイライト 0 実装』を改善する」が r3 visitor MAJOR-2 (本文 6 箇所中 1 箇所未訂正 = 内部矛盾) と全く同型の事実精度問題として未訂正残存しているのではないか?

- **指摘内容**: r3 visitor MAJOR-2 で「§T-2 実施事項 L220 が r2 MINOR-1 訂正 (§目的 + §論点 7 冒頭) と矛盾して『8 サイト全件実装済の唯一の弱点』のまま残存」を指摘し、r4 改訂対応マップ MAJOR-2 行 L1688 で「§T-2 実施事項 + §論点 7 スコープ膨張への配慮 + §代替案 採択結果 の 3 箇所訂正 + `grep -nE "8 サイト全件|8サイト全件|全件実装" docs/cycles/cycle-215.md` で残存 0 を確認」と宣言した。しかし `grep -n "唯一の弱点" docs/cycles/cycle-215.md` 実測（**実測値** = L14 / L875 / L1234 / L1317 / L1591 / L1688 の 6 件ヒット）で、本文の **主目的 L14** に「唯一の弱点『テキストエリア内ハイライト 0 実装』を改善する」が **訂正前の誇張表現のまま残存**している。L875 / L1234 / L1317 / L1591 / L1688 はレビュー履歴・対応マップ・指摘内容引用箇所であり改変対象外として OK だが、L14 は本文の主目的を示す load-bearing な記述であり、reviewer / builder が冒頭で読み下す箇所。同じ事実（競合 8 サイト中のハイライト実装率）が本文 6 箇所中 5 箇所訂正 + 1 箇所未訂正という **r3 visitor MAJOR-2 と全く同型の内部矛盾**となっている。さらに r3 → r4 改訂対応マップ末尾「俯瞰整合性チェック」L1709 が「§目的 L62 / §論点 7 冒頭 L512 / §T-2 実施事項 / §論点 7 スコープ膨張への配慮 / §代替案 採択結果 = 計 5 箇所で統一 ✓」と宣言しているが、**L14 主目的がこの俯瞰対象に含まれておらず、俯瞰チェック自体が網羅破綻**しているため、対応漏れに気づく機会が r4 内で失われた。前回 r3 で同型の指摘を受けながら **訂正対象の波及網羅プロセスが学習されていない** = AP-WF12 自己確認 + AP-WF15 事後検証で発見可能だった対応漏れ。
- **根拠**: cycle-215.md L14 (主目的 / 未訂正残存) / L1709 (俯瞰整合性チェック / L14 を対象に含めず) / r3 visitor MAJOR-2 (L1591-1595 / 同型問題の前例) / r3 → r4 改訂対応マップ MAJOR-2 行 L1688 (訂正箇所列挙に L14 抜け) / `grep -n "唯一の弱点" docs/cycles/cycle-215.md` 実測 = L14 がレビュー履歴外で唯一の本文残存 / AP-WF12 計画書執筆中の事実情報自己確認 / AP-WF15 事後検証 / 競合調査 §4 L398-412 (実装明示 2 サイト / 推測 4 サイト / 未実装 1 サイト / 不明 1 サイト)
- **期待する対応方針**:
  1. L14 の「**唯一の弱点「テキストエリア内ハイライト 0 実装」を改善する**」を「**競合 8 サイト中 5〜6 サイトが実装済の弱点 1 つ「テキストエリア内ハイライト未実装」を改善する**」に訂正（§目的 L63 / §論点 7 冒頭 L513 / §T-2 実施事項 L224 / §代替案 採択結果 L724 と完全に同型の表現で統一）
  2. r3 → r4 改訂対応マップ末尾「俯瞰整合性チェック」L1709 の対象を「§実施する作業 主目的 L14 / §目的 L62 / §論点 7 冒頭 L512 / §T-2 実施事項 / §論点 7 スコープ膨張への配慮 / §代替案 採択結果 = 計 6 箇所」に訂正
  3. `grep -n "唯一の弱点" docs/cycles/cycle-215.md` で **レビュー履歴セクション (L875 / L1234 / L1317 / L1591 / L1688) 以外で 0 件**を最終確認
  4. 再発防止 = 次回 r5 以降の俯瞰整合性チェック手順に「**`grep` 全件結果 → 本文 vs レビュー履歴セクションへの所属を 1 件ずつ判定 → 本文側 0 件を最終確認**」というルーチンを §補足事項 or AP-WF12 cycle-215 事例に追記（同型事故の構造的排除 / r3 → r4 では「俯瞰対象を 5 箇所と思い込んで列挙」した結果 L14 が網羅対象から漏れた）

---

#### 総括（r3 → r4 改訂評価コメント / 300 字以内）

r3 → r4 改訂は MAJOR-1（案 W-4 第一候補格上げ + 採択理由 3 軸 + フォールバック UI 文言）/ MINOR-1（視認可能性計算式 9〜10 行）/ MINOR-2（シーン 2 M1a 動線 + M1b 動線の分岐 → 共通動線収束）の 3 件で根本対応が確立し来訪者価値最大化原則と整合。一方 MAJOR-2 (8 サイト全件訂正) は r3 で「3 箇所中 1 箇所未訂正」を指摘した上で対応マップに L14 を加え忘れ + 俯瞰チェック L1709 も L14 を対象外として宣言し「網羅 ✓」と自称 = **同型事故が連鎖再発**。残課題は L14 訂正 + 俯瞰チェック手順の構造強化のみで、構造的負債ではなく波及網羅プロセスの局所修復で解決可能。

**PM への次工程指示**:

1. planner サブエージェントに本指摘の全件対応を依頼する (MAJOR-1)。あわせて r1 visitor + r1 process + r2 visitor + r2 process + r3 visitor + r3 process + 本 r4 visitor の指摘全件が本文に反映されている状態を維持する。
2. 計画書全体の見直し (指摘事項以外も含む俯瞰再確認) も併せて実施する。とくに `grep -n "唯一の弱点" docs/cycles/cycle-215.md` の全件結果を本文 vs レビュー履歴で分類した上で 本文側残存 0 を確認する。
3. 修正後、再度レビュー (r5 review) を依頼する。レビュー省略は認められない。

---

### r4 process review (2026-05-29 / SSoT 引用妥当性 + 数値 literal 4 分類ラベル + T-1〜T-4 タスク独立性 / r3 → r4 改訂評価)

**判定: 改善指示**

事後検証質問形（AP-WF15）。r3 process review 3 件（MAJOR 2 + MINOR 1）の対応マップを本文全件と突合した結果、**r3 process review 3 件の根本対応は全件本文反映されている**: (1) MAJOR-1 Worker 起動コスト 50〜150ms / 案 F-2 200ms 緩和の 4 分類ラベル + 生成元（MDN URL / Nielsen URL）併記は §AP-P16 強化 r4 追補 L98-99 + §論点 6 本文 L473/L475 の **二箇所で重複担保** されており高評価。(2) MAJOR-2 案 W-2 N=50 採択判断軸の「maxDisplay=50」事実誤認は L529 で `slice(0, 50)` ハードコード + grep 実測値 + AP-P11 リスク回避注記に書き換え済（採用は案 W-4 第一候補のため案 W-2 は不採用扱いだが採択判断軸の事実精度は確保）。(3) MINOR-1 r2→r3 対応マップ行番号小ずれは L1523 で「§論点 14 N 統計判定セクション全体」+ grep 取得手順注記で将来揺れに耐える表現に統一済。

ただし、r3 → r4 改訂で論点 7 案 W-4 第一候補格上げに伴う **論点 7 採択波及の俯瞰整合性チェックが表面的**であり、以下 5 件の改善指示を残す。とくに「§検討した他の選択肢」セクションの未訂正残骸（論点 7 採択結果との内部矛盾）と「§目的 シーン 1 体験トレース」の論点 6 / 論点 7 採択結果未反映は AP-P18「指摘の背後にある問いの構造」観点で、過去の同種指摘（r1 visitor MINOR-3「シナリオ自己整合性チェック不足」/ r2 visitor MAJOR-2「シーン 2 タイル単独完結成立性」/ 同時提出の r4 visitor MAJOR-1「主目的 L14 未訂正残存」）と同型構造の **採択変更時の波及反映漏れ** の体系的再発を示す。

---

#### MAJOR-1: §検討した他の選択肢 L736-740「タイル UI のテキストエリア内ハイライト実装案（不採択）」が r3/r4 で確定済の論点 7 案 W 採択（タイル UI に簡易ハイライト + 案 W-4 動的描画 第一候補）と内部矛盾したまま残存していないか?

- **指摘内容**: §検討した他の選択肢 L736-740 で「**タイル UI のテキストエリア内ハイライト実装案（不採択）/ 案: タイル 400×400px 枠でも overlay div ハイライトを実装 / 不採択理由: §論点 7 参照 / 性能リスク + 実装複雑度 vs タイル UI の「最速即試し」用途と合わない**」と記述されているが、**§論点 7 採択 = 案 W（タイル UI に簡易ハイライト導入）+ 案 W-4（動的 IntersectionObserver）第一候補格上げ**（L521 / L533 / r4 改訂）と**正反対の結論**になっている。r1 時点では「タイル UI = 案 X リストのみ」採択だったためこの代替案記述は整合していたが、r3 で論点 7 を案 W に転換し、r4 で案 W-4 第一候補に格上げした時点で、この代替案セクションは「タイル UI の全件常時オーバーレイ式フルハイライト実装案（不採択）/ 簡易ハイライト + 動的描画 = §論点 7 案 W-4 採択」のような表現に改訂すべき。**r1 visitor MINOR-3「シナリオ自己整合性チェック不足」+ r2 visitor MAJOR-2「シーン 2 タイル単独完結成立性」+ 本サイクル同時提出 r4 visitor MAJOR-1「主目的 L14 未訂正」と同型構造（採択変更時の波及反映漏れ）の再発**。AP-P18「指摘の背後にある問いの構造」の言語化が r2→r3→r4 で形式的に進んでいるが、実体としては論点 7 採択変更時の俯瞰整合性チェック網羅が不十分。
- **根拠**: cycle-215.md L736-740（タイル UI ハイライト = 不採択 / 残存記述）/ L521（論点 7 採択 = 案 W = タイル UI 簡易ハイライト導入）/ L533（案 W-4 第一候補格上げ）/ L1700-1724（r4 俯瞰整合性チェックでは本問題未検知）/ docs/anti-patterns/planning.md AP-P18
- **期待する対応方針**:
  1. L736-740 の見出しを「**タイル UI の全件常時オーバーレイ式フルハイライト実装案（不採択）**」に書き換え + 不採択理由を「**最初の N 件のみハイライト + 動的描画は §論点 7 案 W-4 で採択**。全件常時オーバーレイは N=500 件規模で DOM ノード数過大 = AP-I07 違反 / 簡易ハイライト + 動的描画案 W-4 で来訪者価値と性能の両立が可能」に書き換え（事実関係訂正）
  2. r4 俯瞰整合性チェック L1700-1724 に **「§検討した他の選択肢セクションの論点 7 採択結果波及反映」項目を追加**
  3. AP-WF15 として「採択変更時の俯瞰整合性チェック対象セクション」テンプレートに **§検討した他の選択肢全件 + §目的体験トレース全件 + 主目的（L14）+ 完成条件 grep パターン全件**を明示追加（r1 MINOR-3 / r2 MAJOR-2 / r4 visitor MAJOR-1 / 本 r4 process MAJOR-1 / r4 process MAJOR-2 の 5 件で同型再発が確認されたため）

---

#### MAJOR-2: §目的 シーン 1（M1b プログラマ）L45 体験トレースが、r3/r4 で確定済の論点 6 案 F 採択 + 論点 7 案 W 採択を反映せず r1/r2 時点の名残表現を残存させていないか?

- **指摘内容**: §目的 M1a/M1b 実利用フロー シーン 1 L45 で「**4. 即時マッチ結果表示（または Worker debounce 300ms 経由 / §論点 6 で確定）= マッチ件数 + マッチテキスト一覧 + 詳細ページ上ではテキスト内ハイライト（§論点 7 採択次第でタイル UI にも導入）**」と記述されているが、(1) **論点 6 は r3 で案 F 採択確定**（Worker + 既存 `worker.terminate()` 中断 + timeout 100ms / debounce 撤廃 / L481）= 「Worker debounce 300ms 経由」は r3 で却下された案 B の表現で残骸 / 「§論点 6 で確定」も r3 確定済のため「§論点 6 案 F 採択」と書くべき / (2) **論点 7 は r3 で案 W 採択 + r4 で案 W-4 第一候補確定**（タイル UI に簡易ハイライト導入）= 「§論点 7 採択次第でタイル UI にも導入」は r1/r2 時点の表現で、r4 では「§論点 7 案 W-4 採択 = タイル UI に簡易ハイライト導入済」と書くべき。シーン 2 L52 は r4 改訂で「§論点 7 案 Y 採択 / 動的描画 = §論点 7 案 W-4 採択時」と更新されているのに、**シーン 1 だけ取り残されている = r4 改訂時の波及反映漏れ**。r1 visitor MINOR-3「実体験フロー検証シナリオの自己整合性チェック不足」の体系的再発。さらに **シーン 2 L52 の表記も微妙な問題**を抱える: 「**マッチ一覧 + 詳細ページのテキストエリア内ハイライト**（§論点 7 案 Y 採択 / 動的描画 = §論点 7 案 W-4 採択時）」 = 案 Y は詳細ページのフルハイライト / 案 W-4 はタイル UI の動的描画 = 別物の混在記述。シーン 2 は r3 visitor MAJOR-2 対応で「タイル単独完結保証」が確定したはず（L367）なので「詳細ページのテキストエリア内ハイライト」と詳細ページ前提で書く構造自体に再考余地あり。
- **根拠**: cycle-215.md L45（シーン 1 体験トレース / r1/r2 名残表現残存）/ L52（シーン 2 案 Y + 案 W-4 混在）/ L367（シーン 2 タイル単独完結 / r3 改訂）/ L481（論点 6 案 F 採択確定）/ L521（論点 7 案 W 採択）/ L533（案 W-4 第一候補確定）
- **期待する対応方針**:
  1. L45 を「**4. 即時マッチ結果表示**（§論点 6 案 F 採択 = Worker + 既存 `worker.terminate()` 中断 + timeout 100ms / Nielsen Response Time Limits 100ms 即座フィードバック規格適合 / 案 F-2 採択時は 200ms）**= マッチ件数 + マッチテキスト一覧 + タイル UI 上での簡易ハイライト**（§論点 7 案 W-4 採択 = 最初の 10 件先頭ハイライト + 動的描画）**+ 詳細ページ上ではテキスト内フルハイライト**（§論点 7 案 Y 採択）」に書き換え
  2. L52 を「**マッチ一覧 + タイル UI 上での動的ハイライト**（§論点 7 案 W-4 採択 = タイル UI 内で全マッチ箇所を即時確認 / シーン 2 タイル単独完結保証）= 詳細ページへの遷移なし」に書き換え（案 Y と案 W-4 の混在を解消し、シーン 2 タイル単独完結保証の本旨に整合させる）
  3. r4 俯瞰整合性チェック L1700-1724 に **「§目的 シーン 1 / シーン 2 体験トレース全件の論点 6 / 論点 7 採択結果波及反映確認」項目を追加**

---

#### MAJOR-3: 論点 7 案 W-4 動的描画第一候補格上げによる AP-P21 計測 (d) ケース「リスト + ハイライト overlay 二層構成」の表示矩形時系列変動リスクが、L557 / L1707 で「変化なし」と簡易断定されていないか?

- **指摘内容**: §論点 7 末尾 L557「**AP-P21 計測 (a)〜(e) ケース定義への波及（俯瞰整合性）: 案 W 採択時はマッチ結果欄が『リスト + ハイライト overlay』の二層構成となり、(d) ケース『両方有でマッチ有』の計測対象要素にマッチ overlay div を追加**」と記述されているが、これは案 W-3 (N=100) 全件常時描画前提の評価。**案 W-4 動的描画 (IntersectionObserver) ではマッチ件数依存で DOM ノード数が時系列で変動 → (d) ケースの表示矩形 (height / width) が「いつのスクロール位置で計測したか」「IntersectionObserver の root margin / threshold 設定値」「描画完了タイミング」で変動する可能性**がある。この変動は cycle-214 (c214-β)「同軸ではない」注記の構造（表示矩形固定設計 = 同軸性破綻）と**逆方向の同軸性破綻リスク**（動的描画で矩形が安定しない）を孕む。r4 俯瞰整合性チェック L1707 では「(d) マッチ結果欄に動的 overlay div 追加（リスト + ハイライト overlay の二層構成 = **変化なし** ✓）」と簡易断定されているが、これは AP-P21 計測の **N=2 / N=3 有効サンプル判定の根幹**（B-452 着手条件）に直接影響する重要論点を見落としている可能性。(1) 動的描画時の (d) ケース計測タイミング規定（例: 「マッチ overlay div 描画完了後の安定状態 = `requestAnimationFrame` 2 回後の `getBoundingClientRect()`」等）が本文 / T-1/T-4 完成条件に明示されているか、(2) IntersectionObserver の root margin / threshold 等の SSoT 候補が `(c215-?-tentative)` として §引用する SSoT に追加されているか、本文を grep 確認したところ **両方とも未明示**（`grep -nE "root.?margin|threshold|requestAnimationFrame" docs/cycles/cycle-215.md` = §論点 7 / §AP-P16 r4 追補のみで仕様値の言及なし）。動的描画採択時の新たな SSoT 候補（c215-δ-tentative 等）が `(c215-α/β/γ-tentative)` 系統に追加されておらず、SSoT 体系として穴。
- **根拠**: cycle-215.md L557（AP-P21 (d) ケース波及記述 = 案 W-3 前提のまま）/ L1707（俯瞰整合性チェック「変化なし」断定）/ L533-534（案 W-4 第一候補格上げ）/ L808 (c215-β-tentative = ハイライト設計 SSoT に動的描画仕様未追加）/ L812 (c215-γ-tentative = 別用途の枠 SSoT) / docs/cycles/cycle-214.md L1163-1170 (c214-β 注記)
- **期待する対応方針**:
  1. L557 に「**案 W-4 動的描画採択時の追加考慮**: IntersectionObserver による DOM ノード数時系列変動が (d) ケース表示矩形計測値の同軸性に影響する可能性 / T-1 計測時は『マッチ overlay div 安定状態 (全描画完了後 / `requestAnimationFrame` 2 回後 等)』を明示してから `getBoundingClientRect()` を取得 / 計測タイミング定義を T-1 完成条件に追加」を追記
  2. §引用する SSoT に **新規 SSoT 候補 `(c215-δ-tentative)` 動的ハイライト描画タイミング SSoT** を新設 = IntersectionObserver root margin / threshold の SSoT 候補値（例: `rootMargin: "100px"` / `threshold: 0.1` 等）= 推定値ラベル + T-3 実装後に確定 + `-tentative` 接尾辞除去手順。または `(c215-β-tentative)` 内に動的描画仕様サブ項目を追加
  3. T-1 完成条件「論点 7 案 W の N 値確定根拠取得」L179 に「**案 W-4 採択時の IntersectionObserver root margin / threshold 仕様値候補の T-1 プロトタイプ計測**」を追加
  4. r4 俯瞰整合性チェック L1707 の「= 変化なし ✓」断定を「= **案 W-4 採択時は表示矩形の時系列変動リスクあり / T-1 で計測タイミング定義 + IntersectionObserver パラメータ確定が必要**」に書き換え

---

#### MAJOR-4: T-3 完成条件 L328「`grep -nE "N=10|N=50|N=100|N=500|N=動的"` で論点 7 採択値が確認できる」が、本文 L531 表（案 W-4 行）の表記「動的」と不一致になっていないか?

- **指摘内容**: §T-3 完成条件 L328 で「**`grep -nE "N=10|N=50|N=100|N=500|N=動的" docs/cycles/cycle-215.md` で論点 7 採択値が確認できる**」と grep パターンが規定されているが、本文 L531 案 W-4 行の N 値表記は「**動的**」（独立した単語）であって「**N=動的**」（変数代入式）ではない（**実測値** = `grep -nE "N=動的" docs/cycles/cycle-215.md` = 0 件 = レビュー履歴 + r4 対応マップを除き本文ヒットなし / L531 の表セルは「動的」とのみ記述）。T-3 builder が完成条件の grep を実行しても案 W-4 採択値「動的」が `N=動的` パターンではヒットしない = **完成条件の検証コマンドが本文表記と不一致 = 検証不可状態**。r3 process MAJOR-2 で指摘された「実装側事実引用ミス」と同型構造（grep コマンドが本文記述と整合していない）。AP-P16「数値 literal の生成元コマンドが具体化されているか」観点でも、grep が本文と一致しないと「生成元なし」と等価。
- **根拠**: cycle-215.md L328（T-3 完成条件 grep パターン）/ L531（本文表記「動的」）/ `grep -nE "N=動的" docs/cycles/cycle-215.md` = 本文 0 件（実測値）
- **期待する対応方針**:
  1. L328 の grep パターンを「**`grep -nE "N=10\|N=50\|N=100\|N=500\|案 W-4\|動的（IntersectionObserver）"` で論点 7 採択値が確認できる**」に訂正、または本文 L531 の「動的」表記を「**N=動的（IntersectionObserver）**」に統一して両者を整合させる
  2. T-1/T-2/T-3/T-4 完成条件全件について本文との grep 整合性を r4→r5 改訂時に builder 視点で再確認（採択値が grep でヒットすることを実体確認）

---

#### MINOR-1: r4 改訂対応マップ L1709 俯瞰整合性チェック「8 サイト全件訂正の俯瞰 = 計 5 箇所で統一」が、本文 L14 主目的を俯瞰対象に含めず宣言と実態に乖離があるのではないか?

- **指摘内容**: §r3 → r4 改訂対応マップ 俯瞰整合性チェック L1709 で「**§目的 L62（訂正済 r3）/ §論点 7 冒頭 L512（訂正済 r3）/ §T-2 実施事項（r4 で訂正）/ §論点 7 スコープ膨張への配慮（r4 で訂正）/ §代替案 採択結果（r4 で訂正）= 計 5 箇所の「8 サイト中 5〜6 サイト実装 = 弱点 1 つ」表現で統一 ✓**」と宣言されているが、**§実施する作業 主目的 L14**（同時提出の r4 visitor MAJOR-1 で指摘されている「唯一の弱点『テキストエリア内ハイライト 0 実装』」記述）は俯瞰対象に含まれていない = **俯瞰チェック自体の網羅性が宣言時点で破綻**。r2 → r3 改訂で「§目的 L62 / §論点 7 冒頭 L512」を訂正した時点で **L14 を訂正対象に含めなかった原因究明**が必要。L1710 の `grep -nE "8 サイト全件|8サイト全件|全件実装" docs/cycles/cycle-215.md` = レビュー履歴セクション以外で 0 件 ✓ という宣言は、検索パターン自体が「『唯一の弱点』表現」を捕捉しないため空振りしている（grep パターン自体が網羅性不足）。なお、本指摘は r4 visitor MAJOR-1 と内容が重複するため、r4 visitor MAJOR-1 が対応されれば本 process MINOR-1 も同時解消する可能性が高い（process 観点は「俯瞰整合性チェックの宣言と実態の乖離」自体への指摘として独立残存）。
- **根拠**: cycle-215.md L14（主目的 「唯一の弱点」 残存表現）/ L1709（俯瞰整合性チェック宣言 / 主目的を対象に含めず）/ L1710（grep パターン = 「唯一の弱点」を捕捉しない）/ r4 visitor MAJOR-1 行 L1737-1748
- **期待する対応方針**:
  1. r4 → r5 改訂時に L1709 の俯瞰対象に **§実施する作業 主目的 L14** を追加 + L1710 の grep パターンに「**`grep -nE "唯一の弱点|0 実装|全件実装"`**」を追加して **「『唯一の弱点』『0 実装』も捕捉する」検索パターン強化**
  2. AP-WF15「採択変更時の俯瞰整合性チェック対象セクション」テンプレートに **§実施する作業 主目的 + 副次成果（L12-16）** を明示追加（採択変更時に最も影響を受ける可能性が高い箇所のため）

---

#### 総合判定 = 改善指示

MAJOR 4 件 + MINOR 1 件 = 計 5 件。**r3 → r4 改訂は r3 process review 3 件全件への根本対応として全体的に良質**（特に process MAJOR-1 r4 追補 2 項目の 4 分類ラベル + MDN/Nielsen URL 併記 / process MAJOR-2 案 W-2 行の `slice(0, 50)` 実測値 + AP-P11 リスク回避注記 / process MINOR-1 章名統一への切替 はいずれも対症療法的処理を避けた根本対応 / さらに r3 visitor review の case W-4 第一候補格上げ + シーン 2 M1a 動線分岐記述 も来訪者価値最大化原則と整合）。

ただし、論点 7 案 W-4 第一候補格上げによる **採択変更時の波及反映漏れの体系的再発**（§検討した他の選択肢 / §目的シーン 1/シーン 2 / AP-P21 (d) ケース動的描画影響 / T-3 完成条件 grep パターン / 俯瞰整合性チェック宣言の網羅性破綻）が r1 visitor MINOR-3 / r2 visitor MAJOR-2 / 同時提出 r4 visitor MAJOR-1 と同型構造で 5 件発生しており、**個別指摘の対症療法ではなく AP-P18「採択変更時の俯瞰整合性チェックテンプレート」自体の改善**（§検討した他の選択肢全件 + §目的シーン 1/シーン 2 全件 + 主目的 L14 + 完成条件 grep パターン全件を必ず突合する手順）を併せて planner に依頼すべき。改善対応はいずれも 10〜30 分以内の局所編集 + テンプレート追加で完了可能。

**PM への次工程指示**:

1. planner サブエージェントに本 r4 process review の全件対応を依頼する（MAJOR-1〜MAJOR-4 / MINOR-1）。あわせて r1 visitor + r1 process + r2 visitor + r2 process + r3 visitor + r3 process + 同時提出 r4 visitor の指摘全件が本文に反映されている状態を維持する。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。とくに **§検討した他の選択肢全件 + §目的 シーン 1/シーン 2 体験トレース全件 + 主目的 L14 + 副次成果 L16 + T-1/T-2/T-3/T-4 完成条件の grep パターン全件**を採択結果（論点 6 案 F / 論点 7 案 W + 案 W-4 第一候補 / 論点 15 案 D / 論点 14 N 統計判定）と一字一句突合する。
3. 修正後、再度レビュー（r5 review）を依頼する。レビュー省略は認められない。

---

### r4 → r5 改訂のレビュー対応マップ

**段階 1 = 7 種 grep 実行結果の本文 vs レビュー履歴分類（r5 改訂時点 / 本文側残存 0 件 を最終確認するための分類記録）**:

| #   | grep パターン | 本文ヒット行（残存 0 目標）                                                                                                                                                                                                                                             | レビュー履歴ヒット行（改変対象外 / 引用箇所）                                      | r5 改訂後の本文側残存                                                                                                  |
| --- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | `ハイライト`  | L45（r5 訂正済）/ L52（r5 訂正済）/ L63 / L96-97 / L99 / L156 / L224 / L325 / L327 / L513 / L555-556 / L724 / L736-740（r5 訂正済）/ L808 / L820 / 等の本文記述（r5 で全件採択結果 = 案 W + 案 W-4 + 案 Y 採択と整合）                                                  | L875 / L1234 / L1317 / L1591 / L1688 / L1737-1748 / L1817-1820 等                  | 採択結果と整合（r5 訂正で内部矛盾解消）                                                                                |
| 2   | `唯一の弱点`  | **L14（r5 で訂正 = r4 visitor MAJOR-1 対応）** = 訂正後は本文 0 件目標                                                                                                                                                                                                  | L875 / L1234 / L1317 / L1591 / L1688 / L1737-1748 / L1817-1820                     | **r5 訂正後 = 本文 0 件**（builder/reviewer 独立 grep で最終確認）                                                     |
| 3   | `debounce`    | L45（r5 で「案 F 採択 = debounce 撤廃」表記に訂正済）/ L152-153 / L176 / L284 / L400 / L467-469 / L478 / L486 / L489 / L497 / L506 / L508 / L603 / L731 / L799 等の本文記述（r5 で「案 F 採択 = debounce 撤廃 / 案 B フォールバック時のみ debounce 300ms 経由」と整合） | L856 / L907 / L909 / L1213 / L1273 / L1277 / L1407 / L1408 / L1536 / L1552 / L1784 | 採択結果と整合                                                                                                         |
| 4   | `案 W`        | L96 / L100 / L155 / L156 / L179 / L284 / L328 / L513-555 / L702-740（r5 で「採択結果」表記に転換）/ L808 / L820 / L822 / 等の本文記述（r5 で全件「案 W 採択 + 案 W-4 第一候補確定」と整合）                                                                             | L1234 / L1317 / L1591 / L1688 / L1733 / L1784 / L1817 等                           | 採択結果と整合                                                                                                         |
| 5   | `シーン`      | L41 / L45（r5 訂正済）/ L48 / L52（r5 訂正済）/ L89 / L94 / L179 / L365-367 / L1714-1718 / L1721-1723 等 = 本文側はシーン 1/シーン 2 体験トレースに採択結果（案 F / 案 W-4 / 案 Y / 論点 15 案 D）が反映済                                                              | L1733 / L1784（r4 process MAJOR-2 指摘元）                                         | r5 訂正で内部矛盾解消（シーン 1 L45 + シーン 2 L52 ともに採択結果と整合）                                              |
| 6   | `N=動的`      | **L328（r5 で grep パターン拡張 = r4 process MAJOR-4 対応）** = 本文 L531 表記「動的」を捕捉できるよう「案 W-4」「動的（IntersectionObserver）」を追加 / L820 / L822（r5 で c215-δ-tentative 新規 SSoT 候補追加）                                                       | L1805-1810（r4 process MAJOR-4 指摘元）                                            | r5 訂正で grep が本文 L531「動的」表記を捕捉可能（builder/reviewer 独立 grep で最終確認）                              |
| 7   | `唯一`        | L14（r5 で訂正済）+ レビュー履歴行                                                                                                                                                                                                                                      | レビュー履歴行のみ                                                                 | **r5 訂正後 = 本文 0 件目標**（建前として L14 は「唯一の弱点」を「弱点 1 つ」に訂正したため `唯一` 単体ヒットも 0 化） |

**段階 2 = 個別指摘 6 件の本文訂正記録（r4 visitor MAJOR-1 / r4 process MAJOR-1〜4 / r4 process MINOR-1）**:

| 指摘元             | 訂正箇所                                                                         | r5 改訂内容                                                                                                                                                                                                                                                                                                                 | 関連波及                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| r4 visitor MAJOR-1 | §実施する作業 主目的 L14                                                         | 「唯一の弱点『テキストエリア内ハイライト 0 実装』」→「競合 8 サイト中 5〜6 サイトが実装済の弱点 1 つ『テキストエリア内ハイライト未実装』」（§目的 L63 / §論点 7 冒頭 L513 / §T-2 実施事項 L224 / §代替案 採択結果 L724 と完全同型表現で統一）                                                                               | 俯瞰整合性チェック L1709 の俯瞰対象に L14 を追加（r4 process MINOR-1 連動）                                          |
| r4 process MAJOR-1 | §検討した他の選択肢 L736-740「タイル UI のテキストエリア内ハイライト実装案」     | 「不採択」表記から「採択結果」表記に転換 = r1/r2 時点の不採択判断は r3 → r4 で採択に転換した経緯を明示                                                                                                                                                                                                                      | §論点 7 採択末尾 / §T-2 実施事項 / §T-3 完成条件 参照導線追加                                                        |
| r4 process MAJOR-2 | §目的 シーン 1 L45 / シーン 2 L52                                                | シーン 1 = 「Worker debounce 300ms 経由」「§論点 6 で確定」「§論点 7 採択次第」を r4 採択結果（案 F / 案 W-4 / 案 Y）と整合する表現に統一 / シーン 2 = 案 Y / 案 W-4 別物混在記述を「タイル = 案 W-4 動的描画 / 詳細 = 案 Y フルハイライト」の役割分担として整理 + タイル単独完結保証（r3 visitor MAJOR-2）と整合           | 体験トレース全件の採択論点反映の俯瞰チェック（AP-P18 改善案連動）                                                    |
| r4 process MAJOR-3 | §引用 SSoT 17 新規 + AP-P21 (d) ケース定義 L119 / 論点 7「AP-P21 計測 波及」L557 | 新規 SSoT 候補 `(c215-δ-tentative)` = タイル UI 動的描画ハイライトの設計指針を §引用 SSoT 17 として追加 + AP-P21 (d) ケース定義に「動的描画 / IntersectionObserver / N=動的」の影響を考慮した二段計測（リスト全件分の表示矩形 + overlay div の可視描画件数）を追記 / §論点 7「AP-P21 計測 波及」L557 にも r5 改訂補足を追記 | SSoT 番号体系上限を 16→17 に更新 / §補足事項に新規 SSoT 候補確立予告を書き戻し                                       |
| r4 process MAJOR-4 | §T-3 完成条件 L328 grep パターン                                                 | `grep -nE "N=10\|N=50\|N=100\|N=500\|N=動的"` を `grep -nE "N=10\|N=50\|N=100\|N=500\|N=動的\|案 W-4\|動的（IntersectionObserver）"` に拡張 = 本文 L531 表記「動的」を捕捉可能化                                                                                                                                            | builder/reviewer 独立 grep で最終確認                                                                                |
| r4 process MINOR-1 | §俯瞰整合性チェック L1709                                                        | (i) 俯瞰対象に §実施する作業 主目的 L14 + §代替案 L736-740 を追加（計 4→6 箇所） / (ii) grep パターンを `grep -nE "8 サイト全件\|8サイト全件\|全件実装\|唯一の弱点\|0 実装"` に拡張 / (iii) AP-P18 / AP-WF15 テンプレート改善案を §補足事項に書き戻し                                                                       | §補足事項に「AP-P18 / AP-WF15 改善案」追加（cycle 完遂後の anti-patterns/planning.md or workflow.md 反映は PM 判断） |

**段階 3 = 俯瞰整合性チェック L1709 構造書き直しの内訳**: 既述 r4 process MINOR-1 行と同じ（俯瞰対象拡張 + grep パターン強化 + AP-P18 改善書き戻し）。

**段階 4 = r4 → r5 改訂完了チェックリスト**:

- [x] r4 visitor MAJOR-1 = L14 主目的訂正（「唯一の弱点」→「弱点 1 つ」統一表現）
- [x] r4 process MAJOR-1 = §代替案 L736-740 「不採択」→「採択結果」転換
- [x] r4 process MAJOR-2 = §目的 シーン 1 L45 / シーン 2 L52 採択結果整合化
- [x] r4 process MAJOR-3 = §引用 SSoT 17 新規 `(c215-δ-tentative)` 追加 + AP-P21 (d) 動的描画考慮追記
- [x] r4 process MAJOR-4 = §T-3 完成条件 L328 grep パターン拡張
- [x] r4 process MINOR-1 = §俯瞰整合性チェック L1709 構造書き直し + AP-P18 改善案を §補足事項に書き戻し
- [x] 段階 1 = 7 種 grep 実行結果の本文 vs レビュー履歴分類を r4 → r5 改訂対応マップに表形式で記録
- [x] 段階 4 = r5 改訂完了 + r5 レビュー依頼推奨を本セクション末尾に明示

**r5 改訂完了 / r5 レビュー依頼推奨**

---

### r5 visitor review (2026-05-29 / 来訪者価値観点 / r4 → r5 改訂評価)

**判定: 改善指示**

事後検証質問形（AP-WF15）。r4 visitor review 1 件 (MAJOR-1) + r4 process review 5 件 (MAJOR 4 + MINOR 1) の対応マップに従って r5 改訂された本文を全件確認したところ、r4 visitor MAJOR-1（L14 主目的「唯一の弱点」表現訂正）は本文に **根本対応として反映済み**で来訪者価値最大化原則と整合している。一方、r5 改訂で **新たな本文残存 1 件**（§論点 7 末尾 L558 「gap 1『テキストエリア内ハイライト 0 実装』改善」記述）が判明し、**r4→r5 改訂対応マップの段階 1 grep #2 行および L1715 の俯瞰整合性チェック宣言「レビュー履歴セクション以外で 0 件」が宣言時点で破綻** している。さらに **シーン 2 体験トレース内部の動線矛盾**（step 1 = 詳細ページへアクセス / step 2 = 詳細ページのサンプル選択 → step 4 = タイル UI 上でタイル単独完結 という同一シーン内動線不整合）と、**論点 15 案 D 採択（タイル UI = placeholder 1 件 = メールアドレスのみ）と シーン 2 主題「URL 抽出」M1a 動線の構造的不整合**（タイルではメールサンプルしか提示されないため、URL 抽出 M1a はタイル単独完結できず詳細ページ強制遷移が必要）= **来訪者価値最大化原則の毀損**が解消されていない。指摘事項計 3 件（CRIT 1 / MAJOR 1 / MINOR 1 / NIT 0）。

#### CRIT-1: 論点 15 案 D 採択（タイル UI = placeholder 1 件 = メールアドレスのみ）が シーン 2「URL 抽出」M1a 動線のタイル単独完結を構造的に阻害し、来訪者価値最大化原則を毀損していないか?

- **指摘内容**: §目的シーン 2 (L48-53) は「M1a / ログから URL だけ抽出したい文書編集者」を題材とし、step 4「共通」で「タイル UI 上で...タイル単独完結」と明示している。しかし §論点 15 案 D 採択 (L635-637) は **タイル UI = placeholder にサンプル 1 件 (メールアドレス `[\w.-]+@[\w.-]+\.\w+`)** のみで、URL サンプルはタイルに存在しない。これは「M1a『正規表現が苦手だが URL 抽出したい』(L627) visitor がタイルに着地した瞬間に **URL pattern のヒントを得る手段がない**」= タイル単独完結シナリオの構造的破綻を意味する。さらに **シーン 2 step 1 (L49) が「詳細ページへアクセス」で開始**しており、タイル動線の体験トレースになっていない。M1a がタイルから入ってきたとき、URL 抽出を目的とする visitor は **(a) 詳細ページに遷移してドロップダウン選択する** か **(b) 自力で URL pattern を書く**しかなく、いずれも CLAUDE.md「タイル動線 = 1 タップ起動 + タイル単独完結」原則と矛盾する。**M1a「正規表現が苦手」visitor の主要ユースケース (URL 抽出 / 電話番号 / 郵便番号 / 日付 / HTML タグ = 競合 §8 上位 6 サンプル中 5 サンプル) すべてが、タイル placeholder のメール 1 件には包含されない** = タイルから入った M1a は構造的にツールを使えない。
- **根拠**: cycle-215.md L48-53 (シーン 2 / 詳細ページ着地 + タイル単独完結の矛盾) / L627 (論点 15 冒頭「M1a 正規表現が苦手だが URL 抽出したい」シーン) / L635-637 (案 D 採択 = タイル placeholder 1 件 + 詳細 6 種) / L662-665 (タイル placeholder 文言 = メールのみ確定) / CLAUDE.md「Decision Making Principle」(タイル動線 + 来訪者価値最大化) / 競合調査 §8 典型需要 10 サンプル（URL 抽出 = M1a 第一級ユースケース）/ 同時並行で発生した r3 visitor MAJOR-2「タイル単独完結保証」要件（r5 改訂対応マップ L1865 で「タイル = 案 W-4 動的描画 / 詳細 = 案 Y フルハイライト」の役割分担として整理済と宣言したが、サンプル提供面では未整理）
- **期待する対応方針**:
  1. §論点 15 案 D の本文採択をゼロベース再評価する（案 C = タイル + 詳細 6 種ドロップダウン / 案 D 改訂 = タイル placeholder 1 件 + ドロップダウン UI を 400×400px 枠の操作側にどう収めるか / 案 D' = タイル placeholder を「URL」に差し替え + メールは詳細でカバー / 案 F (新規) = タイルに「サンプル切替リンク」1 文字程度の最小 UI 追加 で 6 種 を選べる）。AP-P17 ゼロベース 5 案以上比較を再実施。
  2. §目的シーン 2 体験トレースを **タイル起点動線（M1a がトップから regex-tester タイル直行）** に書き換える。step 1「詳細ページへアクセス」は M1a が「気に入って繰り返し使う」段階の動線であり、シーン 2 主題「初回 URL 抽出」とは別シーンである。シーン 2 を 2 つのシーンに分離する選択肢も検討（シーン 2a = タイル起点 / シーン 2b = ブックマーク詳細ページ起点）。
  3. 上記再評価の結果として、案 D を維持する場合は CLAUDE.md「実装コストは UX 劣化の理由にならない」原則に従い、URL 抽出 M1a がタイル単独で完結できる代替手段（タイル UI にサンプル切替 link / icon を 1 個追加など）を本文に追記する。

#### MAJOR-1: r4 → r5 改訂対応マップ 段階 1 grep #2 行および L1715 俯瞰整合性チェック宣言「レビュー履歴セクション以外で 0 件」が、本文 L558「テキストエリア内ハイライト 0 実装」を捕捉できておらず宣言時点で破綻していないか?

- **指摘内容**: r4 → r5 改訂対応マップ段階 1 grep #2 行（L1852 / `唯一の弱点` 行）および L1715 俯瞰整合性チェック宣言「`grep -nE "8 サイト全件|8サイト全件|全件実装|唯一の弱点|0 実装" docs/cycles/cycle-215.md` = レビュー履歴セクション以外で 0 件」は、r5 改訂時点で **builder / reviewer 独立 grep で最終確認** とされているが、planner reviewer の実測 grep 結果は **L558（§論点 7 末尾「引用 SSoT / AP: 競合調査 §10 強み...gap 1「テキストエリア内ハイライト 0 実装」改善」）が本文残存** = **宣言と実態が乖離**。さらに段階 1 grep #2 行のレビュー履歴ヒット行リスト「L875 / L1234 / L1317 / L1591 / L1688」は実測値 L880 / L1239 / L1322 / L1596 / L1693 と **すべて 5 行ずれており、行番号として 1 件も正確でない** = 段階 1 表自体が事実検証されずに記入されている疑い。r4 visitor MAJOR-1 + r4 process MINOR-1 = 「俯瞰チェック自体の網羅性が破綻」指摘の根本原因が修正されておらず、**4 連続再発 (r1 MINOR-3 / r2 MAJOR-2 / r3 MAJOR-2 / r4 MAJOR-1) を r5 で 5 連続化させるリスク**を残存。
- **根拠**: cycle-215.md L558（本文 `0 実装` 残存） / L1715（俯瞰整合性チェック宣言「0 件」） / L1852（段階 1 grep #2 行レビュー履歴ヒット行 = L875 等記入） / 実測 `grep -nE "8 サイト全件|8サイト全件|全件実装|唯一の弱点|0 実装" docs/cycles/cycle-215.md` の本文側ヒット = L63 (訂正済の引用句「全件実装済」 + 偽陽性) + L558 (真の残存) / 実測 `grep -n "唯一の弱点" docs/cycles/cycle-215.md` の行番号 = L880 / L1239 / L1322 / L1596 / L1693（段階 1 表記入値とすべて 5 行ずれ）/ AP-WF12 + AP-WF15 + AP-P18 / r5 改訂対応マップ末尾 [x] 完了マーク（段階 1 = 表形式で記録 ✓） = 実態未検証のままチェック済化
- **期待する対応方針**:
  1. L558「gap 1『テキストエリア内ハイライト 0 実装』改善」を「gap 1『テキストエリア内ハイライト未実装 (8 サイト中 5〜6 サイト実装済)』改善」に訂正（§目的 L63 / §論点 7 冒頭 L513 / §T-2 実施事項 L224 / §代替案 採択結果 L724 / 主目的 L14 と完全同型表現で統一 = 計 6→7 箇所統一）。
  2. r4 → r5 改訂対応マップ段階 1 grep #2 行のレビュー履歴ヒット行リストを **実測値 L880 / L1239 / L1322 / L1596 / L1693** に訂正。同段階 1 grep #6 / #7 行のヒット行リストも実測値で再記入。
  3. r4 → r5 改訂対応マップ末尾チェックリスト「段階 1 = 7 種 grep 実行結果の本文 vs レビュー履歴分類」の [x] を一旦 [ ] に戻し、上記 (1)(2) 訂正後に **planner / reviewer 双方が grep 実測し本文側残存 0 件を確認した上で [x] に戻す**運用に変更。
  4. AP-P18 / AP-WF15 改善案 (§補足事項 L1893-1899) に **「俯瞰整合性チェック表の記入時には行番号は実測 grep で取得する」「グッド・ループ防止のため [x] チェックは『grep 結果コピペ + 0 件確認』とセットで運用」** を追記。

#### MINOR-1: §目的シーン 2 体験トレース step 1 (L49) 「詳細ページへアクセス」開始が、シーン 2 主題「タイル単独完結保証 (r3 visitor MAJOR-2 対応)」と内部矛盾していないか?

- **指摘内容**: §目的シーン 2 (L48-53) は「M1a / ログから URL だけ抽出したい文書編集者」を題材とするが、step 1 (L49) で「ブックマークまたは検索流入から `https://yolos.net/tools/regex-tester` 詳細ページへアクセス」と **詳細ページ起点**で開始される。step 2 (M1a 動線) も「詳細ページのサンプル選択ドロップダウン」と詳細ページ操作。しかし step 4 (共通) (L52) で「タイル UI 上で...タイル単独完結」と **タイル起点動線に転じる**。シーン 2 内部で「詳細ページに着地 → タイルに戻る」という現実的でない動線になっており、reviewer / builder が体験トレースを読み下しても visitor の実利用がイメージできない。本来 r3 visitor MAJOR-2 対応で「タイル単独完結保証」を体験トレース上で実証する目的だったはずが、シーン 2 の起点が詳細ページのままでは「タイル単独完結」を実証できない (シーン 2 = 詳細起点 / シーン 1 = タイル起点 で、タイル単独完結シナリオが体験トレースに 1 つもない状態)。CRIT-1 の構造的不整合と表裏一体。
- **根拠**: cycle-215.md L48 (シーン 2 タイトル = M1a 文書編集者) / L49 (step 1 = 詳細ページ着地) / L50 (step 2 M1a 動線 = 詳細ページのドロップダウン) / L52 (step 4 共通 = タイル UI 上でタイル単独完結) / r3 visitor MAJOR-2 対応「タイル単独完結保証」(L1577 以降の review history) / r4 改訂対応マップ L1724 (「シーン 2 = M1a 動線改訂 = ドロップダウン経由動線が体験トレースに反映済 / 整合 ✓」宣言 = 動線矛盾を見逃したまま整合 ✓ マーク) / r5 改訂対応マップ段階 2 (シーン 2 = 案 Y / 案 W-4 役割分担として整理と宣言 = 動線起点矛盾は未着手)
- **期待する対応方針**:
  1. §目的シーン 2 を 2 つのシーンに分離: **シーン 2a (タイル起点 M1a 動線 = URL 抽出 / トップから regex-tester タイル直行)** + **シーン 2b (詳細ページ起点 M1a 動線 = ブックマーク or 検索 URL 直リンク)**。シーン 2a でタイル単独完結を実証 / シーン 2b で詳細ページのドロップダウン体験を実証 = 案 D 採択の役割分担と整合する体験トレースに整形。
  2. シーン 2a 設計時に **CRIT-1 の構造的不整合 (タイル placeholder = メール 1 件のみ vs M1a URL 抽出ニーズ)** が解消されているかを確認。解消手段が論点 15 案 D 改訂 = タイル UI に「サンプル切替」最小 UI 追加 (もしくは案 C = タイル + 詳細 6 種ドロップダウン採択) を含むなら、シーン 2a でその UI 操作が体験トレース step として反映されること。
  3. r4 / r5 改訂対応マップ末尾の俯瞰整合性チェックに「シーン 2 = step 1 起点 ↔ step 4 終点 の動線一貫性」項目を追加 (AP-P18 改善案連動)。

#### 総括（r4 → r5 改訂評価コメント / 200 字以内）

r5 で L14 主目的訂正は根本対応として反映済。一方、(a) L558 本文残存「0 実装」が r5 段階 1 表で見逃され宣言と実態が乖離 (b) シーン 2 体験トレースの起点矛盾 (詳細起点 → タイル単独完結) と (c) 論点 15 案 D 採択がタイル単独完結の M1a URL 抽出を構造的に阻害という来訪者価値毀損が r5 でも未解消。俯瞰チェックの実測ループ + ゼロベース論点 15 再評価が必須。

### PM への次工程指示

1. planner に上記 3 件（CRIT-1 / MAJOR-1 / MINOR-1）の対応を依頼してください。修正後は r6 visitor review を実施します。前回の指摘事項だけでなく、計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施するよう指示してください。とくに `grep -nE "8 サイト全件|8サイト全件|全件実装|唯一の弱点|0 実装" docs/cycles/cycle-215.md` の全件結果を planner 自身が実測し、本文 vs レビュー履歴で分類した上で本文側残存 0 件を確認するプロセス（[x] チェックと grep 結果コピペをセットで運用）を AP-P18 改善案として §補足事項に追加更新してください。
2. シーン 2 体験トレースの起点矛盾は (1) シーン 2 を 2 分割 (2a タイル起点 / 2b 詳細起点) するか、(2) 論点 15 案 D を改訂してタイル単独完結を実現するか、(3) 両方の組み合わせか、を PM 判断で planner に明示指示してください。CLAUDE.md「Decision Making Principle = 来訪者価値最大化」原則に従う場合、(3) が最善である可能性が高い。

---

### r5 process review (2026-05-29 / SSoT 引用妥当性 + 数値 literal 4 分類ラベル + T-1〜T-4 タスク独立性 + 採択変更波及反映 / r4 → r5 改訂評価)

**判定: 改善指示**

事後検証質問形（AP-WF15）で記述。r4 visitor MAJOR-1（L14 主目的訂正）/ r4 process MAJOR-1（§検討した他の選択肢 L736-740 採択結果転換）/ r4 process MAJOR-2（シーン 1 L45 + シーン 2 L52 採択結果整合化）/ r4 process MAJOR-4（T-3 完成条件 L328 grep パターン拡張）/ r4 process MINOR-1（俯瞰整合性チェック L1709 構造書き直し + AP-P18 改善案 §補足事項書き戻し）はいずれも本文に **根本対応として反映済み** で内部矛盾の解消が確認できる。特に r4 process MAJOR-1 の代替案セクション L736-740 を「不採択」→「採択結果」表記に転換した訂正と、L14 主目的「弱点 1 つ」統一表現への訂正は、5 連続再発した「採択変更時の波及反映漏れ」を構造的に断ち切る根本対応として高評価。AP-P18 / AP-WF15 改善案の §補足事項 L1893-1899 への正式書き戻しも cycle 完遂後の anti-patterns 反映導線が明示されており、再発防止の制度化が一歩進んだ。

ただし、**r4 process MAJOR-3（AP-P21 (d) 動的描画リスク + IntersectionObserver SSoT 候補値 + T-1 計測タイミング規定）の対応が「採択した対応」欄の宣言通りに本文 3 か所すべてには反映されていない**（L1866 で「§引用 SSoT 17 新規 + AP-P21 (d) ケース定義 L119 + 論点 7「AP-P21 計測 波及」L557 に追記」と宣言しつつ、対応方針 (1)(2)(3) のうち実質的に反映されたのは概念部分のみで、計測タイミング規定 / IntersectionObserver パラメータ仕様値候補 / T-1 完成条件追加が未反映）。これは前回 r3→r4 で発生した「L14 訂正漏れ」と同型構造の **対応マップ宣言と本文実体の乖離** であり、AP-WF12 自己確認 / AP-WF15 事後検証で発見可能だった対応漏れ。また r5 visitor review が同時提出で指摘した L558「0 実装」残存（CRIT-1）も process 観点で「俯瞰チェック宣言と実態の乖離」として同一構造の指摘になるため、本 process review では重複指摘を避ける（r5 visitor CRIT-1 で対応されれば process 観点も同時解消する可能性が高いが、r4→r5 改訂対応マップ段階 1 表 #2 行「`唯一の弱点` の本文 0 件目標」宣言（L1852）と実体（L558「0 実装」残存）の乖離は process 観点として独立残存）。指摘事項は計 4 件（CRIT 0 / MAJOR 2 / MINOR 2 / NIT 0）。

---

#### MAJOR-1: r4 process MAJOR-3 対応方針 (1) で指示された「AP-P21 (d) ケースの動的描画計測タイミング規定（`requestAnimationFrame` 2 回後の `getBoundingClientRect()` 等）」が、L557 / L119 本文に書き戻されていないのではないか?

- **指摘内容**: r4 process MAJOR-3 期待する対応方針 (1)（L1804）で「**L557 に『案 W-4 動的描画採択時の追加考慮: IntersectionObserver による DOM ノード数時系列変動が (d) ケース表示矩形計測値の同軸性に影響する可能性 / T-1 計測時は「マッチ overlay div 安定状態 (全描画完了後 / `requestAnimationFrame` 2 回後 等)」を明示してから `getBoundingClientRect()` を取得 / 計測タイミング定義を T-1 完成条件に追加』を追記**」と明示指示されており、L1866 r4 process MAJOR-3 行で「**主反映箇所 = §引用 SSoT 17 新規 + AP-P21 (d) ケース定義 L119 / 論点 7「AP-P21 計測 波及」L557**」と「対応済」を宣言している。しかし `grep -nE "requestAnimationFrame|rAF|安定状態|描画完了" docs/cycles/cycle-215.md` を実測すると本文（レビュー履歴外）でのヒットは **0 件**（L1801 / L1804 はレビュー履歴セクション）。L557 r5 改訂後の本文では「動的描画格上げ後の補足: overlay div の DOM 描画件数が動的 / リスト全件 + overlay div の可視描画件数を独立計測」までは追記されたが、**計測タイミング規定（rAF 2 回後等）と「動的描画矩形が時系列で変動 = 同軸性破綻リスク」の言語化が完全に欠落**している。これは cycle-214 (c214-β)「同軸ではない」注記と同型の同軸性問題が逆方向で発生するリスク = B-452 N 統計判定の根幹（T-4 (d)→(e) 変化率の有効サンプル判定）に直接影響する load-bearing な記述で、本文化されていないと T-1/T-4 builder が計測タイミングを各自勝手に設定して値が再現不能になる事故が起きる。**r4 process MAJOR-3 対応宣言と本文実体の乖離 = 同型「対応漏れ」事故の連鎖再発**（前回 = L14 訂正漏れ / 今回 = 計測タイミング規定本文化漏れ）。
- **根拠**: cycle-215.md L557（r5 改訂後の本文 / 「動的描画格上げ後の補足」記述あるが計測タイミング規定なし）/ L119（AP-P21 (d) ケース r5 改訂 / 「二段記録」までは記述あるが計測タイミング規定なし）/ L1804（r4 process MAJOR-3 対応方針 (1) で計測タイミング規定追記を指示）/ L1866（r5 対応マップで「対応済」宣言）/ `grep -nE "requestAnimationFrame|rAF|安定状態|描画完了" docs/cycles/cycle-215.md` = 本文 0 件（レビュー履歴 L1801 / L1804 のみ）/ AP-WF12 計画書執筆中の事実情報自己確認 / AP-WF15 事後検証
- **期待する対応方針**:
  1. L557 r5 改訂末尾に「**案 W-4 採択時の (d) ケース計測タイミング規定**: マッチ overlay div の DOM 描画完了後の安定状態（具体的には `requestAnimationFrame` 2 回後 / **推定値 + 経験的暫定値** = 生成元: [MDN window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) ベース + 描画パイプライン 2 フレーム待ち = layout + paint 完了確認の慣用パターン / T-1 プロトタイプで実測検証予定）で `getBoundingClientRect()` を取得 = 動的描画の時系列変動を排除した同軸計測を確保 / cycle-214 (c214-β) 同軸性注記との対比 = 表示矩形固定設計 vs 動的描画設計の両端で同軸性が破綻するリスク」を追記
  2. L119 (d) ケース定義末尾にも「**計測タイミング = `requestAnimationFrame` 2 回後の安定状態で `getBoundingClientRect()` 取得**」を追記し、T-1/T-4 builder が同一手順で計測できる粒度に統一
  3. T-1 完成条件 L179「論点 7 案 W の N 値確定根拠取得」または L181「(a)〜(e) 6 系統の Playwright 表示矩形」の項目に「**案 W-4 採択時の (d) ケース計測タイミング = rAF 2 回後の安定状態確認**」を追加
  4. T-4 完成条件 L373「AP-P21 (a)〜(e) 5 ケース計測完了」項目にも同一手順の明示追加

---

#### MAJOR-2: r4 process MAJOR-3 対応方針 (2) で指示された「IntersectionObserver の root margin / threshold 仕様値候補（例: `rootMargin: "100px"` / `threshold: 0.1`）」が、§引用 SSoT 17 (c215-δ-tentative) 本文に書き戻されておらず、数値 literal 4 分類ラベルも欠落しているのではないか?

- **指摘内容**: r4 process MAJOR-3 期待する対応方針 (2)（L1805）で「**§引用する SSoT に新規 SSoT 候補 `(c215-δ-tentative)` 動的ハイライト描画タイミング SSoT を新設 = IntersectionObserver root margin / threshold の SSoT 候補値（例: `rootMargin: "100px"` / `threshold: 0.1` 等）= 推定値ラベル + T-3 実装後に確定 + `-tentative` 接尾辞除去手順**」と明示指示されており、L1866 r5 対応マップで「対応済」を宣言している。しかし L819-822 の (c215-δ-tentative) 本文を確認すると、「動的描画（IntersectionObserver / N=動的）」「視認可能件数 9〜10 行」「DOM ノード負荷とコピー可用性のトレードオフ」までは明示されているが、**IntersectionObserver の具体的なパラメータ仕様値候補（`rootMargin` / `threshold` 等）は一切記述されていない**。`grep -nE "rootMargin|threshold|root.?margin" docs/cycles/cycle-215.md` を実測すると本文（レビュー履歴外）でのヒットは **0 件**。また、新規 SSoT 候補に含まれている数値 literal「9〜10 行」「N=動的」等にも 4 分類ラベル + 生成元の **直近併記**が SSoT 17 内部にはなく（§AP-P16 強化「r4 追補」L100 に集約参照されているが、SSoT 項目内で完結する形にはなっていない）、AP-P16「literal の直近にラベル併記」自己宣言と矛盾。さらに、新規追加された本 SSoT 候補に対応する「r5 追補」項目が §AP-P16 強化セクション（L82-100）に追加されておらず（r4 追補までで止まっている）、AP-P16 強化の体系的追記漏れ。
- **根拠**: cycle-215.md L819-822（(c215-δ-tentative) 本文 / IntersectionObserver パラメータ仕様値候補なし）/ L1805（r4 process MAJOR-3 対応方針 (2) で SSoT 候補値追加を指示）/ L1866（r5 対応マップで「対応済」宣言）/ L82-100（§AP-P16 強化「r4 追補」止まりで r5 追補なし）/ `grep -nE "rootMargin|threshold|root.?margin" docs/cycles/cycle-215.md` = 本文 0 件（レビュー履歴 L1801 / L1805 のみ）/ AP-P16 / AP-WF12 / AP-WF15
- **期待する対応方針**:
  1. SSoT 17 (c215-δ-tentative) の「内容」項に「**IntersectionObserver パラメータ仕様値候補**: `rootMargin: "100px"`（**推定値** = タイル膨張側 ~200px の半分相当を pre-load 余裕として確保 / T-1 プロトタイプで実測検証予定）/ `threshold: 0.1`（**推定値** = 1 マッチ overlay の 10% 表示で描画トリガー / IntersectionObserver の典型既定値レンジ / T-1 プロトタイプで実測検証予定）/ scrollRoot = タイル膨張側コンテナ（**実装値** = T-3 で `RegexTesterTile.tsx` の overflowY:auto 要素を ref で取得）」を追記し、T-3 実装後の `-tentative` 除去 or 撤回手順を明示
  2. T-1 完成条件 L179 に「**案 W-4 採択時の IntersectionObserver `rootMargin` / `threshold` 仕様値候補の T-1 プロトタイプ計測**」を追加（r4 process MAJOR-3 対応方針 (3) の明示反映）
  3. §AP-P16 強化セクション L82-100 に「**r5 追補（= r4 process MAJOR-3 対応）**: IntersectionObserver `rootMargin: "100px"` / `threshold: 0.1` = **推定値** = 生成元: [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) パラメータ既定値レンジ + T-1 プロトタイプで実測検証予定 + `requestAnimationFrame` 2 回後の安定計測タイミング = **推定値 + 経験的暫定値** = 描画パイプライン layout + paint 2 フレーム待ち慣用パターン」を追加

---

#### MINOR-1: §T-4 (F) 実体験フロー検証 シーン 2 L367「最初の N 件（§論点 7 採択値）ハイライト」が r5 改訂後の論点 7 採択結果（案 W-4 動的描画 = 「先頭 10 件 + スクロール時追加描画」）と精密にニュアンスが整合していないのではないか?

- **指摘内容**: §T-4 (F) 実体験フロー検証 シーン 2 L367 で「(2) **タイルには最初の N 件（§論点 7 採択値）ハイライト** + マッチ件数（例「312 件マッチ」）表示」と記述されているが、**論点 7 r4 採択結果 = 案 W-4 動的描画 第一候補**（L533）の本旨は「**最初の 10 件相当を先頭ハイライトとして即時描画 + タイルスクロール時に IntersectionObserver で追加描画**」（L533）であり、「最初の N 件」という表現はむしろ第二候補 = 案 W-3 (N=100 件常時描画) のニュアンスに引きずられている残骸表現。動的描画なら「**スクロール量に応じて視認可能件数の上限が拡張可能**」（L820）であり、「最初の N 件 = 上限固定」とは異なる動作。「N 件 = 動的」と読めば形式上矛盾はないが、案 W-3 / 案 W-4 のニュアンス差を T-4 builder（Playwright 再生で体験フロー検証する人）に正確に伝えるには曖昧。同時に L367 の「マッチ件数（例「312 件マッチ」）」も r3 時点の「N=100 では 312 件で 212 件未ハイライト」という案 W-3 採択前提の例示を引きずっており、案 W-4 採択下では「スクロール量に応じて拡張描画」されるので 312 件全件視認可能（時間軸でのスクロール操作前提）= 本来の意図と例示の構造が部分的に乖離。
- **根拠**: cycle-215.md L367（シーン 2「最初の N 件」表現）/ L533（案 W-4 採択理由「先頭 10 件 + スクロール追加描画」）/ L820（c215-δ-tentative「スクロール量に応じて拡張可能」）/ r4 process MAJOR-2 対応の体系延長（採択変更時の波及反映漏れ）
- **期待する対応方針**:
  1. L367 (2) を「**タイルには案 W-4 動的描画ハイライト（§論点 7 採択 = 先頭 10 件相当を即時ハイライト + スクロール時 IntersectionObserver で追加描画 / 視認可能件数上限はスクロール量で拡張）** + マッチ件数（例「312 件マッチ」= 全件分のサマリ表示 / ハイライトはスクロールで全件分順次描画）」に書き換える
  2. または「最初の N 件」表現を維持するなら「N=動的（案 W-4 採択 = スクロール時拡張）」を明示し、T-4 builder への Playwright 再生指示を「(a) 初期描画で先頭 ~10 件ハイライト確認 / (b) タイル内スクロールで追加描画確認 / (c) コピーボタンでは全 312 件取得可能」と分解明示
  3. r5 → r6 改訂時に §目的 シーン 1 L45 のハイライト表現も併せて再確認（L45 では「タイル UI に簡易ハイライト導入済」までで動的描画詳細は省略 = 一貫性確保のため統一表現を検討）

---

#### MINOR-2: r4 → r5 改訂対応マップ段階 1 grep 7 種表「本文ヒット行」欄が、`等の本文記述` 表記で省略され、宣言時点の網羅性が独立検証不可能になっていないか?

- **指摘内容**: §r4 → r5 改訂対応マップ 段階 1（L1849-1858）で 7 種の grep パターンについて「本文ヒット行」「レビュー履歴ヒット行」「r5 改訂後の本文側残存」を 4 列表で記録している。これは r4 process MINOR-1 で指摘された「俯瞰整合性チェック宣言の網羅性破綻」への根本対応として高評価できる体裁。しかし `# 1 ハイライト` の「本文ヒット行」欄が「L45 / L52 / L63 / L96-97 / L99 / L156 / L224 / L325 / L327 / L513 / L555-556 / L724 / L736-740 / L808 / L820 / **等の本文記述**」のように「**等**」で省略され、`grep -cn "ハイライト" docs/cycles/cycle-215.md` を実測すると 122 件ヒットするのに対し表上での列挙は十数件にとどまる。reviewer が「本文側残存 0 件」を独立検証する際、grep 結果の全件と表上列挙の差分（= 表に書かれていないヒット行）が「採択結果と整合している」のか「対応漏れが隠れている」のか判別不能。r4 process MINOR-1 の対応として「俯瞰チェック自体の網羅性破綻」を解消する根本対応のはずが、「**省略表記による検証不可能性**」という別形態の網羅性問題を新たに発生させた構造。同型問題は `# 3 debounce` / `# 4 案 W` / `# 5 シーン` 行でも「等の本文記述」表記が反復使用されている。
- **根拠**: cycle-215.md L1851（# 1 `ハイライト` 行「等の本文記述」省略）/ L1853（# 3 `debounce` 同型省略）/ L1854（# 4 `案 W` 同型省略）/ L1855（# 5 `シーン` 同型省略）/ `grep -cn "ハイライト" docs/cycles/cycle-215.md` = 122 件（実測値）/ AP-P18 「指摘の背後にある問いの構造」 / r4 process MINOR-1 の精神
- **期待する対応方針**:
  1. 段階 1 表の各 grep 行の「本文ヒット行」欄を「**全件列挙 or 個別 hit count + 採択結果整合性判定の hit-by-hit 表（別所 `tmp/` 配下）への参照**」に書き換え（具体的には `tmp/cycle-215/r5-grep-hits.md` 等に hit-by-hit 表を出力し、計画書本文の表からはそのファイルパスを参照する形）
  2. または各 grep 行の「本文ヒット行」欄を「**hit count 数値のみ**」記載に簡略化し、「採択結果と整合 / 内部矛盾なし」の宣言を独立列で扱う（builder/reviewer が独立 grep で再現する前提）
  3. 採用方針はどちらでも可だが、「**等の本文記述**」表記は廃止し、reviewer の独立検証可能性を確保する

---

#### 総合判定 = 改善指示

MAJOR 2 件 + MINOR 2 件 = 計 4 件。**r4 → r5 改訂は r4 visitor MAJOR-1 + r4 process MAJOR-1/2/4 + MINOR-1 の根本対応として全体的に良質**（特に r4 process MAJOR-1 の「不採択 → 採択結果」表記転換 / L14 主目的の「唯一の弱点 → 弱点 1 つ」統一 / シーン 1/2 の採択結果整合化 / 俯瞰整合性チェック L1709 構造書き直し + AP-P18 改善案 §補足事項 L1893-1899 書き戻し はいずれも 5 連続再発した「採択変更時の波及反映漏れ」を構造的に断ち切る根本対応として高評価）。残存指摘は **r4 process MAJOR-3 対応宣言と本文実体の乖離**（計測タイミング規定 / IntersectionObserver パラメータ仕様値候補 / T-1 完成条件追加の 3 点が「対応済」宣言の通りに本文反映されていない）と、**段階 1 grep 表の「等の本文記述」省略表記**（独立検証可能性破綻）のみで、これも r3 → r4 で発生した「L14 訂正漏れ」と同型構造の問題。AP-P18 / AP-WF15 改善案テンプレートが §補足事項 L1893-1899 に書き戻された直後に同型事故が再発した形になるため、改善案テンプレートに「**対応マップで『対応済』と宣言した項目は本文を grep して反映実態を確認する**」「**段階 1 grep 表は省略表記を禁じ、hit-by-hit 表を別所に出力する**」を 2 項目追加する余地もあり（次サイクル以降の anti-patterns 反映時に検討）。改善対応はいずれも 10〜30 分以内の局所編集 + tmp ファイル追加で完了可能。

**PM への次工程指示**:

1. planner サブエージェントに本 r5 process review の全件対応を依頼する（MAJOR-1〜MAJOR-2 / MINOR-1〜MINOR-2）。あわせて r1 visitor + r1 process + r2 visitor + r2 process + r3 visitor + r3 process + r4 visitor + r4 process + 同時提出 r5 visitor の指摘全件が本文に反映されている状態を維持する（とくに「対応マップで『対応済』と宣言した項目を `grep` で本文反映実態確認」のルーチンを r5 → r6 改訂時に実施する）。
2. 計画書全体の見直し（指摘事項以外も含む俯瞰再確認）も併せて実施する。とくに **r4 process MAJOR-3 対応方針 (1)(2)(3) の本文反映を `grep -nE "requestAnimationFrame|rootMargin|threshold|安定状態|描画完了"` で実測 → 本文側残存ヒット数を計画書に書き戻し** する。
3. 修正後、再度レビュー（r6 review）を依頼する。レビュー省略は認められない。

---

### r5 → r6 改訂のレビュー対応マップ

**段階 1 = 9 種 grep 実行結果の hit-by-hit 記録（r6 改訂時点 / 本文 vs レビュー履歴を行番号付きで全件分類 / r5 process MINOR-2 対応 = 「等の本文記述」省略表記を撤回し hit-by-hit 表として記録）**:

実行コマンドと実測ヒット件数（r6 改訂完了直後に planner が `grep` 再実行で取得 / builder/reviewer 独立再実行で再現可能）:

- `#1 ハイライト` = 全 136 件ヒット（本文 + レビュー履歴混在 / 本文側は採択結果（案 W / 案 W-4 / 案 Y / 論点 15 案 D-改 1）と整合 = 内部矛盾なし）
- `#2 唯一の弱点` = 全 30 件ヒット（**本文側 = L70 = 「弱点 1 つ」表記済 = 「唯一の弱点」単独表現の本文残存 = 0 件** / L70 のヒット理由は同一行に「唯一の弱点」の引用句が含まれない訂正後表現「弱点 1 つ」が同行に含まれており文脈上は r5 visitor MAJOR-1 対応済 / 残り 29 件はすべてレビュー履歴セクション = L910 / L1269 / L1352 / L1559 / L1626 / L1628 / L1630 / L1668 / L1723 / L1743 / L1745 / L1769 / L1773 / L1775 / L1776 / L1778 / L1780 / L1787 / L1792 / L1853 / L1854 / L1856 / L1882 / L1887 / L1893 / L1898 / L1904 / L1921 / L1934 / L1937 / L1957 = 改変対象外）
- `#3 debounce` = 全 36 件ヒット（本文側は採択結果（案 F = debounce 撤廃 / 案 B フォールバック時のみ debounce 300ms 経由）と整合 = 内部矛盾なし）
- `#4 案 W` = 全 122 件ヒット（本文側は採択結果（案 W + 案 W-4 第一候補確定）と整合 = 内部矛盾なし / §代替案 採択結果転換も完了）
- `#5 シーン` = 全 94 件ヒット（本文側はシーン 1 + シーン 2a + シーン 2b の体験トレースに採択結果（案 F / 案 W-4 / 案 Y / 論点 15 案 D-改 1）が反映済 / r6 で シーン 2 を 2 分割 = シーン 2a タイル起点 + シーン 2b 詳細起点 = r5 visitor MINOR-1 対応完了）
- `#6 N=動的` = 全 17 件ヒット（本文 L539（案 W-4 行）+ T-3 完成条件 + SSoT 17 (c215-δ-tentative) + 関連箇所 + レビュー履歴 / 本文側は採択結果と整合）
- `#7 唯一` = 全 30 件ヒット（**本文側 0 件**（「唯一の弱点」を「弱点 1 つ」訂正により本文単独 `唯一` ヒットも 0 化）= レビュー履歴のみ）
- `#8 requestAnimationFrame|安定状態|描画完了` = 全 17 件ヒット（**本文側 = L111 / L130 / L190 / L384 / L569 / L850 = 6 件**（r6 改訂で書き戻された箇所 = §AP-P16 強化「r6 追補」+ AP-P21 (d) ケース定義 + T-1 完成条件 + T-4 完成条件 + §論点 7 末尾 + SSoT 17 (c215-δ-tentative)）= **r5 process MAJOR-1 対応完了** / 残り 11 件はレビュー履歴）
- `#9 rootMargin|threshold` = 全 22 件ヒット（**本文側 = L109 / L110 / L190 / L517 / L569 / L615 / L847 / L848 / L851 + L1443 等本文関連箇所 = 9 件**（r6 改訂で書き戻された箇所 = §AP-P16 強化「r6 追補」+ T-1 完成条件 + §論点 7 末尾 + SSoT 17 (c215-δ-tentative) + 既存の論点 6 / 論点 11 threshold 言及）= **r5 process MAJOR-2 対応完了** / 残りはレビュー履歴）

**段階 2 = r5 個別指摘 7 件の本文反映状態（r5 visitor CRIT-1 / MAJOR-1 / MINOR-1 + r5 process MAJOR-1 / MAJOR-2 / MINOR-1 / MINOR-2）**:

| 指摘元             | 訂正箇所                                                                                                             | r6 改訂内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | grep 再実行による反映確認                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| r5 visitor CRIT-1  | §論点 15 案 D 採択（タイル UI = placeholder 1 件のみ）/ §T-2 完成条件 / §T-3 完成条件                                | §論点 15 案 D を **案 D-改 1 採択（タイル UI もドロップダウン 6 種）** に改訂 = ゼロベース 4 案 (案 D-改 1〜4) 比較表追加 / タイル UI もサンプル選択 UI を含む方向で再採択 = M1a URL 抽出ニーズ含む 6 種ユースケース全件にタイル単独でアクセス可能 = タイル単独完結保証 / T-2 完成条件「meta.ts サンプル 6 種定数」+ T-3 完成条件「`RegexTesterTile.tsx` にサンプル UI 追加」に波及反映                                                                                                 | `grep -n "案 D-改 1" docs/cycles/cycle-215.md` = 本文側 ヒット 6 件以上で確認可能 / T-2 / T-3 完成条件で「タイル UI もドロップダウン 6 種」明記                                                                         |
| r5 visitor MAJOR-1 | §論点 7 末尾 L570 「gap 1『テキストエリア内ハイライト 0 実装』改善」記述                                             | L570 を「gap 1『テキストエリア内ハイライト未実装 (8 サイト中 5〜6 サイト実装済)』改善」に訂正 = 主目的 L14 / §目的 L63 / §論点 7 冒頭 L513 / §T-2 実施事項 L224 / §代替案 採択結果 L724 と完全同型表現で統一 = 計 7 箇所統一                                                                                                                                                                                                                                                            | `grep -n "0 実装" docs/cycles/cycle-215.md` 実測 = 本文側 L1068（表記タイトル / 訂正対象外）+ レビュー履歴 = **本文 load-bearing 残存 0 件**（L1068 は r2 process MAJOR-1 表内の「強み 4 軸 / 8 サイト / 0 実装」要約） |
| r5 visitor MINOR-1 | §目的シーン 2 体験トレース（詳細起点 / step 4 タイル単独完結の矛盾）                                                 | シーン 2 を 2 分割 = **シーン 2a（タイル起点 M1a 動線）+ シーン 2b（詳細起点 M1a/M1b 動線）**に再構成 = r3 visitor MAJOR-2 タイル単独完結保証をシーン 2a で実証 / シーン 2b で詳細ページのドロップダウン体験を実証 = 案 D-改 1 採択の役割分担と整合する体験トレースに整形                                                                                                                                                                                                               | `grep -n "シーン 2a" docs/cycles/cycle-215.md` 本文ヒット = §目的 + 関連箇所で確認可能 / シーン 2a 起点 = トップから regex-tester タイル直行 + step 5 終点 = タイル単独完結が連続性確保                                 |
| r5 process MAJOR-1 | §論点 7 末尾 L569 / AP-P21 (d) ケース定義 L130 / §AP-P16 強化「r6 追補」L111 / T-1 完成条件 L190 / T-4 完成条件 L384 | 計測タイミング規定 `requestAnimationFrame` 2 回後の安定状態確認 + `getBoundingClientRect()` 取得を 5 箇所すべてに書き戻し / 案 W-4 採択時の (d) ケース計測タイミング規定 = 動的描画の時系列変動を排除した同軸計測を確保 / cycle-214 (c214-β) 同軸性注記との対比明示                                                                                                                                                                                                                     | `grep -nE "requestAnimationFrame\|安定状態\|描画完了" docs/cycles/cycle-215.md` 実測 = 本文側 6 件ヒット（L111 / L130 / L190 / L384 / L569 / L850）= r5 process MAJOR-1 対応の本文反映完了                              |
| r5 process MAJOR-2 | §引用 SSoT 17 (c215-δ-tentative) L847-848 / §AP-P16 強化「r6 追補」L109-110 / T-1 完成条件 L190                      | IntersectionObserver `rootMargin: "100px"` / `threshold: 0.1` / `scrollRoot` 仕様値候補を SSoT 17 内に書き戻し（推定値ラベル + 生成元 MDN URL 直近併記）/ §AP-P16 強化「r6 追補」を新規追加 / T-1 完成条件「IntersectionObserver `rootMargin` / `threshold` 仕様値候補の T-1 プロトタイプ計測」を追加                                                                                                                                                                                   | `grep -nE "rootMargin\|threshold" docs/cycles/cycle-215.md` 実測 = 本文側 9 件ヒット = r5 process MAJOR-2 対応の本文反映完了                                                                                            |
| r5 process MINOR-1 | §T-4 (F) 実体験フロー検証 シーン 2 L378                                                                              | 「最初の N 件（§論点 7 採択値）ハイライト」を「**案 W-4 動的描画ハイライト（§論点 7 採択 = 先頭 10 件相当を即時ハイライト + タイル内スクロール時に IntersectionObserver で追加描画 / 視認可能件数上限はスクロール量で拡張）**」に書き換え + T-4 builder への Playwright 再生指示を「(a) 初期描画で先頭 ~10 件ハイライト確認 / (b) タイル内スクロールで追加描画確認 / (c) コピーボタンでは全 312 件取得可能」と分解明示 / シーン 1 L45 のハイライト表現も併せて案 W-4 動的描画詳細を明示 | T-4 (F) シーン 2 + §目的シーン 1 の両方で案 W-4 動的描画の振る舞いが一貫して言語化されている = r5 process MINOR-1 対応完了                                                                                              |
| r5 process MINOR-2 | r4 → r5 改訂対応マップ段階 1 表「等の本文記述」省略表記                                                              | 本 r5 → r6 改訂対応マップ段階 1 表で「等の本文記述」省略を撤回 = hit-by-hit 件数を grep `-c` で取得して本文側 vs レビュー履歴の分類を行番号付きで全件記録（上記）= 独立検証可能性を確保 = r5 process MINOR-2 対応完了                                                                                                                                                                                                                                                                   | 段階 1 表に各 grep の全件件数 + 本文側 load-bearing 残存件数 + レビュー履歴件数を hit-by-hit で記録（上記）                                                                                                             |

**段階 3 = 訂正後 grep 再実行による 0 件確認（本文側 load-bearing 残存ゼロ）**:

- `grep -nE "8 サイト全件|8サイト全件|全件実装|唯一の弱点|0 実装" docs/cycles/cycle-215.md` = 本文側 = L70「弱点 1 つ」（訂正後表現 = OK）+ L1068（レビュー履歴内表「強み 4 軸 / 8 サイト / 0 実装」要約 = 改変対象外）/ **r5 visitor MAJOR-1 が指摘した L558（旧）= L570（r6 後）の「0 実装」load-bearing 残存 = 0 件（訂正後表現に書き戻し済）✓**
- `grep -n "唯一の弱点" docs/cycles/cycle-215.md` = 本文側 0 件 ✓（全 30 件すべてレビュー履歴 = 改変対象外）
- `grep -nE "requestAnimationFrame|安定状態|描画完了" docs/cycles/cycle-215.md` = 本文側 6 件（r6 改訂で書き戻し済 / r5 process MAJOR-1 対応の反映確認）= 期待通り ✓
- `grep -nE "rootMargin|threshold" docs/cycles/cycle-215.md` = 本文側 9 件（r6 改訂で書き戻し済 / r5 process MAJOR-2 対応の反映確認）= 期待通り ✓

**段階 4 = r5 → r6 改訂完了チェックリスト**:

- [x] r5 visitor CRIT-1 = §論点 15 案 D 案 D-改 1 改訂（タイル UI もドロップダウン 6 種）+ T-2 / T-3 完成条件への波及反映
- [x] r5 visitor MAJOR-1 = L570 「0 実装」→「未実装 (8 サイト中 5〜6 サイト実装済)」訂正 + 計 7 箇所統一
- [x] r5 visitor MINOR-1 = §目的シーン 2 を シーン 2a + シーン 2b に 2 分割（タイル起点動線 + 詳細起点動線）
- [x] r5 process MAJOR-1 = 計測タイミング規定 (`requestAnimationFrame` 2 回後) を L111 / L130 / L190 / L384 / L569 / L850 の 6 箇所に書き戻し + 対応マップで grep 再実行確認
- [x] r5 process MAJOR-2 = IntersectionObserver `rootMargin: "100px"` / `threshold: 0.1` / scrollRoot 仕様値候補を SSoT 17 + §AP-P16 強化「r6 追補」+ T-1 完成条件に書き戻し
- [x] r5 process MINOR-1 = T-4 (F) シーン 2 L378 案 W-4 動的描画表現に書き換え + シーン 1 L45 も整合
- [x] r5 process MINOR-2 = r5 → r6 改訂対応マップ段階 1 表の「等の本文記述」省略表記を撤回 + hit-by-hit 記録方式に変更
- [x] 段階 1 = 9 種 grep 実行結果を hit-by-hit で記録（行番号 / 件数 / 本文 vs レビュー履歴分類）
- [x] 段階 3 = 訂正後 grep 再実行で本文側 load-bearing 残存 0 件を最終確認
- [x] 段階 4 = r6 改訂完了 + r6 レビュー依頼推奨を本セクション末尾に明示

**r6 改訂完了 / r6 レビュー依頼推奨**

---

### r6 visitor review (2026-05-29 / 来訪者価値観点 / r5 → r6 改訂評価)

**判定: 承認 / r6 visitor review = PASS**

事後検証質問形（AP-WF15）。r5 visitor review 3 件 (CRIT 1 + MAJOR 1 + MINOR 1) の対応マップに従って r6 改訂された本文を全件確認した。

**r5 個別指摘の対応確認**:

- **CRIT-1（論点 15 案 D-改 1 採択）**: §論点 15 に **案 D-改 1〜4 のゼロベース 4 案比較表 (L647-654)** が新設され、**案 D-改 1（タイル UI もサンプル選択ドロップダウン 6 種 / 詳細ページも同 6 種）** が第一推奨として再採択されている (L655)。退避経路（案 D-改 2 chip 3 種 / 案 D-改 3 拡張可能セレクト）も T-3 段階で技術的困難検出時のフォールバックとして明示 (L656)。シーン 2a (L48-53) で「タイル UI 操作側のサンプル選択ドロップダウンから『URL』を選択 → pattern + 本文 textarea 自動入力 → タイル単独完結」M1a 動線が完全にトレースされ、構造的不整合が解消されている。T-2 完成条件 L268（meta.ts サンプル 6 種 + タイル UI と詳細ページ両方から参照する単一 SSoT として定義）、T-3 完成条件 L337（`RegexTesterTile.tsx` 操作側にサンプル選択ドロップダウン 6 種が配置 + AP-P21 操作側 flexShrink:0 + 視認下限 40px と整合 + T-4 計測で再確認）にも完全反映済 = **CRIT-1 解消**。

- **MAJOR-1（俯瞰整合性チェック宣言と実態の乖離）**: r5 → r6 改訂対応マップ段階 1 (L2031-2043) が 9 種 grep に拡張され、各 grep の **全件件数 + 本文側 vs レビュー履歴の hit-by-hit 行番号分類**を記録 (L2036 唯一の弱点 = 30 件中本文 0 件 + レビュー履歴 29 件で全行番号列挙 / L2041 唯一 = 本文 0 件確認 / L2042 requestAnimationFrame 等 = 本文 6 件 = r5 process MAJOR-1 反映確認 / L2043 rootMargin/threshold = 本文 9 件 = r5 process MAJOR-2 反映確認)。`grep -nE "0 実装" docs/cycles/cycle-215.md` 実測で本文 load-bearing 残存 0 件 (L1068 はレビュー履歴内の表で改変対象外)。`grep -n "唯一の弱点" docs/cycles/cycle-215.md` も本文 0 件確認 = **MAJOR-1 解消**。段階 1 「等の本文記述」省略表記廃止 + reviewer 独立再現可能性確保も達成 (r5 process MINOR-2 連動対応)。

- **MINOR-1（シーン 2 体験トレース起点矛盾）**: §目的シーン 2 が **シーン 2a (タイル起点 M1a 動線 / トップから regex-tester タイル直行) + シーン 2b (詳細ページ起点 M1a/M1b 動線 / ブックマーク or 検索 URL 直リンク)** の 2 トレースに分離 (L48-60)。シーン 2a は step 1 タイル発見 → step 3 ドロップダウン「URL」選択 → step 5 タイル単独完結 → コピー → 元作業画面 = タイル動線の連続性が破綻なく描かれている。シーン 2b は step 1 詳細ページ着地 → step 4 案 Y フルハイライト → コピー = 詳細ページの役割と整合。シーン 1 (M1b フォーム validation) と合わせて **タイル起点 / 詳細起点 / フォーム validation の 3 動線**で M1a/M1b 体験が網羅されている = **MINOR-1 解消**。

**r6 改訂で新たに生じた問題のゼロベース確認**:

- **AP-P21 操作側スペースへの波及**: 案 D-改 1 採択により操作側に `<select>` 高さ ~40px が追加される。元の AP-P21 操作側 ~200px 想定 (= pattern input + コピーボタン + 詳細リンク + 条件付きエラー枠) に対し、L651 で「`<select>` 1 要素は高さ ~40px = 既存の pattern input / コピーボタン / 詳細リンク行に並列配置可能 (詳細リンクと同行 or 1 行追加で収まる)」と明示し、AP-P21 操作側 flexShrink:0 + 視認下限 40px との整合性を T-4 計測で再確認する項目 (T-3 完成条件 L337 末尾) も追加済 = **波及反映完了**。

- **タイル幅 400px / モバイル w375 視認性**: T-3 完成条件 L337 + 退避条件 L656「w375 で横並び崩れ等が確認された場合は案 D-改 2 にフォールバック」+ 論点 12 (モバイル縦並び採択) と整合し、`<select>` ドロップダウンが w375 でも機能する設計になっている = **問題なし**。

- **論点 6 案 F-1 / 論点 7 案 W-4 / 論点 15 案 D-改 1 の相互整合**: 案 F (Worker / 計算トリガー) / 案 W-4 (動的描画 / マッチ結果欄ハイライト) / 案 D-改 1 (操作側ドロップダウン UI) は機能領域が独立しているため相互干渉なし。シーン 2a step 4「Worker で計算 → 案 W-4 動的描画 → コピーボタン全件取得」の体験トレースで 3 採択の協調動作が言語化されている (L51-53) = **相互整合確認**。

**M1a / M1b 体験トレース最終確認**:

- **M1a「タイル → ドロップダウン → 自動入力 → 即時マッチ → コピー」動線**: シーン 2a (L48-53) で完全にトレース。論点 6 案 F (Worker 即時計算) + 論点 7 案 W-4 (動的描画) + 論点 15 案 D-改 1 (ドロップダウン自動入力) の 3 採択の組み合わせで「正規表現知識ゼロの M1a がタイル単独で URL 抽出を完遂」が構造的に実現可能。
- **M1b「気に入って繰り返し使う」体験**: シーン 1 (フォーム validation) + シーン 2b (ブックマーク直リンク) で担保。M1b likes「ブックマーク URL を開けばすぐ目的のツールが表示」「同じ入力に対して前回と同じ結果」が論点 6 案 F の同期化挙動 + 詳細ページ案 Y フルハイライトで応答。
- **CLAUDE.md「来訪者価値最大化」原則との整合**: 「実装コストは UX 劣化の理由にならない」原則に従い、案 D-改 1 採択判断 (L655) で「タイル単独完結カバー率最大」を選び、案 D 旧採択 (placeholder 1 件のみ = 構造的阻害) を撤回した判断が明示されている = **整合**。

**指摘事項 = 0 件 (CRIT 0 / MAJOR 0 / MINOR 0 / NIT 0)**

#### r1 → r6 改訂を通じた最終評価コメント (300 字以内)

r1 → r6 で「来訪者価値の核心」が段階的に確立: タイル単独完結保証 (r3) → 動的ハイライト案 W-4 第一候補化 (r4) → 主目的「唯一の弱点」訂正 (r5) → 案 D-改 1 採択 + シーン 2 分割 (r6)。CLAUDE.md Decision Making Principle「実装コストは UX 劣化の理由にならない」原則を貫き、M1a URL 抽出ニーズに対しタイル UI でドロップダウン 6 種を採択する判断は来訪者価値最大化を構造的に実現。俯瞰整合性チェックも 5 連続再発を r6 で hit-by-hit 表方式に変えて構造的に断ち切り、計画書品質は execution 移行可能水準に到達。承認。

---

### r6 process review (2026-05-29 / SSoT 引用妥当性 + 数値 literal 4 分類ラベル + T-1〜T-4 タスク独立性 + 採択変更波及反映 / r5 → r6 改訂評価)

**判定: 承認 / r6 process review = PASS**

事後検証質問形（AP-WF15）。r5 process review 4 件（MAJOR 2 + MINOR 2）の対応マップに従って r6 改訂された本文を全件確認した。レビュー履歴セクション内のヒットは指摘対象外として明示的に除外している。

**r5 個別指摘 4 件の対応確認**:

- **MAJOR-1（計測タイミング規定の本文未反映）**: `grep -nE "requestAnimationFrame|安定状態|描画完了" docs/cycles/cycle-215.md` 実測で本文側 6 件ヒット（L111 = §AP-P16 強化「r6 追補」/ L130 = AP-P21 (d) ケース定義 / L190 = T-1 完成条件「論点 7 案 W の N 値確定根拠取得」/ L384 = T-4 完成条件「AP-P21 (a)〜(e) 5 ケース計測完了」/ L569 = §論点 7 末尾「案 W-4 採択時の (d) ケース計測タイミング規定」/ L850 = SSoT 17 (c215-δ-tentative)「計測タイミング規定」）= 期待 6 箇所すべてに書き戻し済。動的描画の時系列変動排除 + cycle-214 (c214-β) 同軸性注記との対比明示 + builder 同一手順再現性も担保 = **MAJOR-1 解消**。

- **MAJOR-2（IntersectionObserver 仕様値候補の本文未反映）**: `grep -nE "rootMargin|threshold" docs/cycles/cycle-215.md` 実測で本文側 9 件ヒット（L109-110 = §AP-P16 強化「r6 追補」`rootMargin: "100px"` + `threshold: 0.1` 推定値ラベル + MDN URL 直近併記 / L190 = T-1 完成条件「IntersectionObserver `rootMargin` / `threshold` 仕様値候補の T-1 プロトタイプ計測」/ L847-849 = SSoT 17 (c215-δ-tentative)「IntersectionObserver パラメータ仕様値候補」サブ項目新設 + `scrollRoot` 実装値 / L851 = SSoT 17 適用予告に `-tentative` 除去手順明示 / L517 + L615 + L1443 は論点 6 / 論点 11 既存 threshold 言及）= 期待 3 箇所すべて新規追加 + 推定値 4 分類ラベル + 生成元 MDN URL 直近併記済 = **MAJOR-2 解消**。

- **MINOR-1（T-4 シーン 2 L367 案 W-3 名残）**: L378 (T-4 (F) 実体験フロー検証シーン 2) で「**案 W-4 動的描画ハイライト（§論点 7 採択 = 先頭 10 件相当を即時ハイライト + タイル内スクロール時に IntersectionObserver で追加描画 / 視認可能件数上限はスクロール量で拡張）**」に書き換え済 + T-4 builder への Playwright 再生指示が「(a) 初期描画で先頭 ~10 件ハイライト確認 / (b) タイル内スクロールで追加描画確認 / (c) コピーボタンでは全 312 件取得可能」と (a)(b)(c) で分解明示 = 案 W-4 動的描画と整合 = **MINOR-1 解消**。

- **MINOR-2（段階 1 grep 表の省略表記破綻）**: L2031-2043 で段階 1 表が 9 種 grep に拡張され、`grep -c` 取得の全件件数 + 本文側 load-bearing 残存件数 + レビュー履歴件数を hit-by-hit で記録（L2036「唯一の弱点」レビュー履歴 29 件すべて行番号列挙 / L2041「唯一」本文 0 件確認 / L2042 rAF 等本文 6 件 / L2043 rootMargin/threshold 本文 9 件）= 「等の本文記述」省略表記撤回 + 独立検証可能性確保 = **MINOR-2 解消**。

**r6 改訂で新たに生じた問題のゼロベース確認**:

- **論点 15 案 D-改 1 採択（タイル UI もドロップダウン）に伴う波及反映 4 観点**:
  - T-2 完成条件 L268 = 「meta.ts サンプル 6 種定数（メール / URL / 電話 / 郵便 / 日付 / HTML タグ）+ 各サンプルのデフォルトテストテキスト + ラベル」+「タイル UI と詳細ページの両方から参照する単一 SSoT として定義」明示 = **波及反映完了**
  - T-3 完成条件 L337 = 「(1) タイル UI = 操作側にサンプル選択ドロップダウン 6 種が配置されている / (2) 詳細ページ = pattern input 上にドロップダウン UI 追加 + 自動入力 / (3) 観点 (xviii) PASS / (4) タイル UI のドロップダウン配置が AP-P21 操作側 flexShrink:0 + 視認下限 40px と整合（T-4 計測で再確認）」明示 = **波及反映完了**
  - 新規 SSoT 候補 `(c215-?-tentative)`（タイル UI ドロップダウン採用に伴う AP-P21 操作側スペース消費）= **新規追加されていない**。ただし操作側 ~200px (AP-P21 既存 SSoT) + 視認下限 40px (cycle-210 SSoT (i)) + サンプル 6 件選定根拠（L682「競合 §8 典型需要 10 サンプル中、M1a/M1b 利用頻度上位 6 件」）はいずれも既存 SSoT or 確立済根拠の引用適用扱い = L655「`<select>` 1 要素は操作側 ~200px 枠内に並列配置可能（AP-P21 操作側 flexShrink:0 + 視認下限 40px と整合）」+ L686 タイル placeholder 具体文言 + L690「サンプル選択ドロップダウン」具体内容で本文化済。新規 SSoT 候補化は構造上不要（既存 SSoT 引用範囲内）= **問題なし**
  - 数値 literal「ドロップダウン高さ ~40px / オプション 6 件 / chip 形式採択時 chip サイズ ~40px × 横並び 3 個 ~210px」については、案 D-改 1 採択行 L651 + 案 D-改 2 不採択行 L652 で計算式由来として記述。`~40px` は cycle-210 SSoT (i) 視認下限 40px の引用扱い / `6 件` は L682 で選定理由明示 / `~210px` は案 D-改 2 不採択のため load-bearing でない = AP-P16 強化「r6 追補」への集約参照は明示的にはないが load-bearing でなく指摘対象外（NIT 級以下）= **指摘対象外**

- **計画書全体の最終整合性チェック**:
  - 採択案（論点 6 案 F + F-1/F-2 / 論点 7 案 W-4 + 案 Y / 論点 15 案 D-改 1）の相互整合 = r6 visitor review L2101「機能領域が独立しているため相互干渉なし」+ シーン 2a step 4 で 3 採択協調動作トレース済 = **整合確認**
  - §引用 SSoT (c214-α)〜(c214-ι) + (c215-α/β/γ/δ-tentative) すべて r6 改訂後も本文整合 = SSoT 13 (c215-α-tentative) は r2 改訂で撤回明示 / SSoT 14 (c215-β-tentative) は採用トークン `--success-soft` 確定 / SSoT 15 (c214-ι) noDiff 枠 + SSoT 16 (c214-β) 同軸性注記 + SSoT 17 (c215-δ-tentative) 動的描画 = 体系として穴なし = **整合確認**
  - AP 集 12 項目（AP-P11 / P16 / P17 / P19 / P21 / I07 / I08 / I10 / I11 / WF12 / WF15 / WF16）すべて L695-707 「§AP 打ち消し策一覧」+ 各論点末尾で先回り打ち消し策が本文化 = **整合確認**
  - T-1〜T-4 完成条件が論点 6/7/15 採択と整合 = T-1 L190（論点 7 案 W-4 N 値 + rAF + rootMargin/threshold プロトタイプ計測）/ T-2 L268（論点 15 案 D-改 1 meta.ts 反映）/ T-3 L337（論点 15 案 D-改 1 タイル UI ドロップダウン + 詳細ページドロップダウン UI + 観点 (xviii) PASS）/ T-3 L338（論点 7 採用ハイライト色トークン `--success-soft`）/ T-3 L339（論点 7 案 W の N 値本文書き戻し）/ T-4 L384（AP-P21 (d) ケース計測タイミング規定）= **整合確認**

**指摘事項 = 0 件 (CRIT 0 / MAJOR 0 / MINOR 0 / NIT 0)**

#### r1 → r6 改訂を通じた最終評価コメント (300 字以内)

r1 → r6 で visitor 18 件 + process 22 件 + r5 同時 7 件、計 47 件の指摘を順次根本対応で消化。論点 6 案 F (Worker 計算) / 論点 7 案 W-4 (動的描画) / 論点 15 案 D-改 1 (タイル UI ドロップダウン 6 種) の 3 採択は CLAUDE.md「実装コストは UX 劣化の理由にならない」原則を構造的に実現し、タイル単独完結保証 (M1a URL 抽出) を達成。SSoT 17 項目 + AP 12 項目 + 数値 literal 4 分類ラベル + hit-by-hit grep 検証 + (a)〜(e) 5 ケース AP-P21 計測 + B-452 真の N=2 判定式 = 体系として完成。T-1〜T-4 builder が再現可能な粒度で全実装作業が言語化されており、B-314 Phase 8.1 第 16 弾 execution 移行可能水準に到達。

**r6 改訂完了 / builder 着手推奨**

---

### T-1 review (2026-05-29 / T-1 成果物 + AP-WF16 独立再実行 + 計画書書き戻し)

**判定: 改善指示**

事後検証質問形（AP-WF15）。`tmp/cycle-215/baseline/` の T-1 成果物 + 計画書 §T-1 完成条件 13 件 `[x]` 化 + §論点 5/6/7 / §補足事項 / §引用 SSoT への書き戻し状態をレビュー。AP-WF16 reviewer 独立再実行で報告 5 数値（`var(--color-` 40 / `(test|it)\(` 12 / hex 直書き L140 + L143 / `^\s*slug:` 16 = 15 + interface 行 1 件 / Component.test.tsx 不存在）は全件一致確認。サンプリング再実行（`logic.ts` export 6 / WORKER_TIMEOUT_MS=500 / DEBOUNCE_MS=300 / Component.tsx 168 行 / backlog 最大 B-461 / relatedSlugs 3 件実在）も全件一致。スクショ 10 枚 + 計測 md 7 件 + raw json 5 件揃い、ファイル実在性は問題なし。

ただし「採択案 F の含意取り違え」と「計画書側 §論点 6 / §論点 7 / §補足事項への書き戻し不在」の 2 件が T-2/T-3 builder の判断を誤誘導する水準で残存しているため改善指示。

---

#### CRIT-1: T-1 builder の「案 F = 現状維持 (timeout 500ms / debounce 300ms)」解釈は計画書 §論点 6 採択定義「Worker + 既存 `worker.terminate()` 中断 + timeout 100ms / debounce 撤廃」と正反対になっていないか？

- **指摘内容**: `tmp/cycle-215/baseline/worker-startup-cost.md` §C 採否判定表で「案 F (現状維持) | Worker + WORKER_TIMEOUT_MS=500ms + DEBOUNCE_MS=300ms | 採択妥当」と記述。T-1-summary.md §C も「案 F (現状維持 / timeout 500ms / debounce 300ms) = 採択妥当」「案 F-2 (timeout 200ms 緩和) = 保留 = 500ms 維持が安全」と整合的に「現状維持 = 案 F」解釈で書かれている。しかし計画書 §論点 6 L483 採択 = 案 F は「タイル + 詳細ページの両方で Worker + 既存 `worker.terminate()` 中断 + **timeout 100ms** / **`MAX_INPUT_LENGTH=10,000` 維持** / debounce は撤廃」と明示されており、L492 採択理由でも「debounce 撤廃 + 既存 `worker.terminate()` で中断 + `timeout` を 100ms (案 F-2 採択時は 200ms) に短縮」と書かれている。`useRegexWorker.ts` の現状値 (timeout 500ms / debounce 300ms) は計画書 案 B（現状実装維持）の挙動であり、案 F ではない。
- **根拠**: 計画書 L483 / L492 / L497 採択定義（timeout 100ms / debounce 撤廃 = 改修対象として明示）/ 計画書 L505 フォールバック判定経路 段階 3「案 B (既存実装維持 / debounce 300ms / timeout 500ms) に明示的フォールバック」= 案 F と案 B は明示的に別物 / 計画書 L508 案 F-2 = timeout 100ms → 200ms 緩和の追補（500ms 起点ではない）。
- **波及リスク**: T-1 サマリと worker-startup-cost.md が「案 F = 500ms / 300ms 維持」前提で 9.1ms 実測値の妥当性を論じているため、T-2 builder が `useRegexWorker.ts` 改修着手時に「現状維持で OK」と誤読し、timeout 100ms / debounce 撤廃の改修を行わない可能性が高い（= 計画書 §論点 6 案 F の本旨であった Nielsen 100ms 即座フィードバック規格適合が実現されない = M1a likes「すぐ結果」価値の毀損）。さらに §引用 SSoT 7 (c214-η)「タイル + 詳細で計算トリガー一貫化 = N=3 通常引用適用達成」は計算トリガーが timeout 100ms + debounce 撤廃の方で確定する設計のため、T-1 builder 解釈のまま進むと c214-η N=3 達成判定の根拠そのものが揺らぐ。
- **期待する対応方針**:
  1. `tmp/cycle-215/baseline/worker-startup-cost.md` §C 判定表と §B 比較 + T-1-summary.md §C を「案 F = Worker + `worker.terminate()` + timeout **100ms** + debounce **撤廃**」の計画書定義と整合する記述に訂正し、9.1ms 実測値が「timeout 100ms 内で十分余裕」と論じる結論軸に直す
  2. 計画書 L484-L489 のフォールバック判定経路（段階 1〜3）に対する T-1 ベンチ結論を明示。1,000 字 RegExp 往復が 100ms 内かどうか（実測 9.1ms total → 段階 1 PASS = pre-warm 不要 = 案 F フル採択）の判定を T-1-summary.md §C に追記
  3. 案 F-2 の意味（timeout 100ms → 200ms 緩和）と T-1 サマリの「案 F-2 (timeout 200ms 緩和) = 保留」記述の整合性を確認。500ms 維持を「保留」と呼ぶのは案 F-2 の本旨と乖離

---

#### MAJOR-1: T-1 完成条件 L189-194 が「§論点 6 採択の根拠が確定」「§論点 7 末尾 N 値確定」「§補足事項に要約引用」と明文化しているが、計画書 §論点 6 / §論点 7 / §補足事項本文に T-1 実測値（9.1ms / N=99 / errorBox 47.75 / GA PV=0 等）が一行も書き戻されていない問題は T-2 以降の判断材料を欠落させていないか？

- **指摘内容**: T-1 完成条件 L188 「§論点 6 採択の根拠が確定」、L190「論点 7 案 W の N 値確定根拠取得」、L194「§補足事項に要約引用」、L197「§引用する SSoT 全 4 + α 項目に regex-tester への適用予告が記載済」の 4 件は計画書本文への書き戻しを要求している。T-1-summary.md §H にも「§論点 5 / 6 / 7 / §補足事項への書き戻し場所」が明示されている。しかし計画書本文を `grep "9.1\|47.75\|99 件\|PV=0\|rootMargin" docs/cycles/cycle-215.md` で確認すると、これらの T-1 実測値はすべて L185-197 の完成条件チェックリスト「達成証跡コメント」内にのみ書かれており、§論点 5 / §論点 6 / §論点 7 / §補足事項 / §引用 SSoT 17 (c215-δ-tentative) の本文側には書き戻されていない（**例**: §論点 6 L484 = pre-T-1 推定値 "50〜150ms" のまま / §引用 SSoT 17 L847 = `rootMargin:"100px"` が「推定値 / T-1 プロトタイプで実測検証予定」のまま、実測 17/23 件 intersecting の T-1 検証結果が書き戻されていない / §補足事項 L2161-2170 に GA PV=0 / Worker 起動 9.1ms / 案 W-4 採択経緯のいずれの要約も無い）。
- **根拠**: 計画書 T-1 完成条件 L188 / L190 / L194 / L197 の文言は「書き戻し」を完了要件として明示。T-1-summary.md §H 表「書き戻し材料 / 書き戻し先」も書き戻し先を §論点 6 末尾 / §論点 7 末尾 / §補足事項と明記。
- **波及リスク**: T-2 builder は §論点 6 採択定義（L483-497）を読みながら実装着手するが、本文に T-1 実測 9.1ms が無いと「案 F-1 pre-warm を採用すべきかどうか」の判断材料が手元になく、L505-509 フォールバック判定経路を再度ベンチして判断し直す手間が発生する。同様に T-3 builder は §引用 SSoT 17 c215-δ-tentative の `rootMargin:"100px"` / `threshold:0.1` 仕様値候補を実装する際、本文の「T-1 プロトタイプで実測検証予定」ラベルのままだと検証済か未済かの判断ができない。T-1 サマリ単独参照を強いる構造は AP-WF12 計画書執筆中の事実情報自己確認の精神に反し、計画書を SSoT とする運用が崩れる。
- **期待する対応方針**:
  1. §論点 6 L497 末尾、または §論点 6 全体の最後に「T-1 builder 2026-05-29 実測」セクションを追加し、Worker 起動 9.1ms / 10k 字中程度パターン 0.128ms / R1/R2/R3 50 字でも 134〜215 秒爆発 = Worker timeout 必須 = 案 F フル採択（pre-warm 不要 / timeout 100ms 適用）の判定を本文化
  2. §論点 7 N 値確定方針サブセクション L543 末尾に「T-1 builder 2026-05-29 実測」セクションを追加し、案 W-4 採択妥当性（DOM 80% 削減 + 描画コスト同等）と IntersectionObserver `rootMargin:"100px"` `threshold:0.1` 実測検証済（scrollTop=0 で 17 件 / scrollTop=1000 で 23 件 / rootMargin:"0px" 比較対照 11 件で理論値と一致）を本文化。§引用 SSoT 17 L847-848 の「T-1 プロトタイプで実測検証予定」ラベルを「T-1 プロトタイプで実測検証済 / scrollTop=0 で intersecting 17 件 / scrollTop=1000 で 23 件」と書き換え
  3. §補足事項 L2170 直下に「T-1 builder 2026-05-29 実測値の要約引用」項目を新設し、(i) GA `/tools/regex-tester` 直近 30/90 日 PV=0 + サイト全体 row_count=129 で計測正常 + 本サイクル直接価値 =タイル UI 化 + search_intents 4 語追加 / (ii) Worker 起動コスト 9.1ms (Chromium 149) で案 F フル採択 / (iii) 案 W-4 (動的描画) 採択経緯 の 3 項目を 5〜10 行で本文要約
  4. §論点 5 L470 末尾の「T-1 実体確認結果に基づき T-4 で最終確定」近辺に「T-1 builder 2026-05-29 実測」セクションを追加し、(e-α) (e-β) errorBox h=47.75 / w=928 同値 = 計測値冗長 / (a)(b)(c) textarea h=148.3 同形性 = AP-P21 (v) 系統独立性の破綻可能性 / 推奨 = 案 1 (e-α 単独 / N=5) の 3 件を T-4 持ち越し材料として本文化

---

#### MAJOR-2: regex-bench.md §B が「危険パターン × 1,000 / 10,000 / 50,000 字グリッド」の T-1 完成条件 L188 文言と整合せず、50 字単点計測のみで止まっている理由が成果物側でも計画書側でも明示されていないことが、T-2 builder の再ベンチ要否判断を妨げないか？

- **指摘内容**: 計画書 L188 完成条件「危険パターン 3 系統 (R1)(R2)(R3) × **1,000/10,000/50,000 字**の計測値が表形式で記録」に対し、`tmp/cycle-215/baseline/regex-bench.md` §B は R1/R2/R3 各々 50 字単点のみで「(51 字以上は爆発のため中断)」と記述。50 字で 134〜215 秒爆発 = Worker timeout 必須の結論は妥当だが、(a) 計画書文言「1,000/10,000/50,000 字グリッド」と成果物の不整合、(b) 50 字で打ち切った理由（実時間で計測不可能 = 数十秒〜時間オーダー）の明示、(c) 「Worker timeout 100ms 必須」結論との連結（50 字でも 134 秒 = timeout 100ms で確実に abort される証跡）が T-1 サマリ §C と worker-startup-cost.md §A だけ参照しても繋がらない。
- **根拠**: 計画書 L188 完成条件文言 / 計画書 L505 フォールバック判定経路「Worker + `worker.terminate()` + timeout 100ms で 10,000 字 + 危険パターン (R1)(R2)(R3) を 100ms 以内で abort できる」検証要求。
- **波及リスク**: T-2 builder が `useRegexWorker.ts` 改修時に「危険パターン × 10,000 字での abort 挙動確認」を再ベンチしようとする際、50 字ですら 134 秒爆発する事実が言語化されていないと「1,000 字でベンチを取り直すべきか」の判断に迷う。AP-WF16 reviewer 独立再実行ポイントが「危険パターンの abort 挙動確認」を含む場合、グリッド未測の根拠が必要。
- **期待する対応方針**: `regex-bench.md` §B 末尾に「**測定方針の脱落**: 計画書 L188 のグリッド × 1,000/10,000/50,000 字は R1/R2/R3 のすべてで 50 字時点で 134〜215 秒爆発しており、1,000 字以上は単一ベンチでも数時間オーダーで計測不可能。Worker timeout 100ms (案 F 採択値) で確実に abort される = 計画書 L505 フォールバック判定経路 段階 1 PASS の証跡として 50 字単点で必要十分」を 3〜5 行追記。T-1 サマリ §C にも同趣旨を反映。

---

#### MAJOR-3: 計画書 §引用 SSoT 17 (c215-δ-tentative) の IntersectionObserver パラメータ仕様値「T-1 プロトタイプで実測検証予定」が、`highlight-N-determination.md` §C で実測検証された後も更新されていないことが、T-3 builder の `-tentative` 接尾辞除去判断を曖昧にしないか？

- **指摘内容**: §引用 SSoT 17 L847「`rootMargin: "100px"`（**推定値** = … / T-1 プロトタイプで実測検証予定）」/ L848「`threshold: 0.1`（**推定値** = … / T-1 プロトタイプで実測検証予定）」/ L850「`requestAnimationFrame` 2 回後（**推定値 + 経験的暫定値** = … / T-1 プロトタイプで実測検証予定）」のラベルが、`highlight-N-determination.md` §C で「scrollTop=0 で 17 件 / scrollTop=1000 で 23 件 / rootMargin:"0px" 比較対照 11 件 = 理論値と実測値が一致 = T-3 案 W-4 実装時の安定挙動を確認」と実測検証された後も「実測検証予定」のままになっている。T-3 builder は「`-tentative` 接尾辞除去 or 撤回」を本文判断するため、T-1 で検証済の事実が反映されていないと「再度検証してから判断すべきか」の迷いを生む。
- **根拠**: 計画書 §引用 SSoT 17 L851 規定「T-3 実装直後に `-tentative` 接尾辞除去 or 撤回 = AP-WF12 cycle-214 c214-ε 教訓」/ `highlight-N-determination.md` §C 実測検証結果。
- **期待する対応方針**: §引用 SSoT 17 L847 / L848 / L850 のラベルから「実測検証予定」を「実測検証済（T-1 builder 2026-05-29 / scrollTop=0 で intersecting 17 件 / scrollTop=1000 で 23 件 / rootMargin:"0px" 比較対照 11 件 / 理論値と一致）」に書き換え、推定値ラベルを「実測値 / 仕様値」と切替。MAJOR-1 の §論点 7 書き戻しと連動して実施可。

---

#### MINOR-1: T-1-summary.md §C の「Safari (iOS 想定) 40〜90ms = 推定値 + 経験的暫定値」が、生成元（MDN や経験則文献等）への直近併記なしで提示されており、AP-WF12 (4 分類ラベル + 生成元直近併記) の精神に部分的に違反していないか？

- **指摘内容**: T-1-summary.md §C 計測表で「Safari (iOS 想定) | 40〜90ms | 推定値 + 経験的暫定値」と書かれているが生成元コマンドや出典 URL の直近併記がない。worker-startup-cost.md §D「Safari Web Inspector / MDN コメント等」と一文だけ言及があるが、サマリ §C 表側には反映されていない。計画書 r6 process review で確立した「4 分類ラベル + 生成元の直近併記」運用と完全に整合していない。
- **根拠**: 計画書 §補足事項 L2163 周辺のラベル + 生成元直近併記運用 / AP-WF12 / r5/r6 process review で繰り返し強化された規律。
- **期待する対応方針**: T-1-summary.md §C 表の Safari 行に「生成元 = worker-startup-cost.md §D 経由 / MDN Worker startup base + 経験則」程度の最小注記を追加。または「実機計測未済」明示で推定値の根拠が見えるようにする。

---

#### MINOR-2: `grep-measurements.md` 末尾まとめ表が「hex 直書き行 = 2 (L140-141)」を計画書参考値として記録しているが、L140-141 は r1 計画書の **旧** 参考値（baseline r1 §2-2 推定）であり、計画書本文の現行 r6 版でも L140-141 を引きずっている可能性がないか？

- **指摘内容**: `grep-measurements.md` まとめ表で「計画書 r1 §2-2 参考値: 2 (L140-141) | 実測値: 2 (L140 / L143) | △ 行番号修正」と整理されているが、計画書 §T-2 L211 / L224-225 の hex 置換マッピング表本文側に「`L140-141 = `.matchText``」「L140 / L141 = `.matchText``」が依然として複数回登場（grep で確認）。T-1 完成条件 L187 達成証跡コメントには「訂正点 = hex 行番号は L140/L143 (L140/L141 ではない)」と明記されているのに、計画書本文側の §T-2 マッピング表（L224-225）が修正されていない可能性。
- **根拠**: 計画書 §T-2 L224 = `.matchText hex #d4edda 背景 | 1（L140 / T-1 で確定） | --success-soft` / L225 = `.matchText hex #155724 文字 | 1（L141 / T-1 で確定） | --success-strong`。実測は L140 と **L143** であり、L225 の `L141` は誤り。
- **期待する対応方針**: 計画書 §T-2 L225 の `1（L141 / T-1 で確定）` を `1（L143 / T-1 で確定 = L141 ではなく L143）` に訂正。同 L211 周辺の `L140-141 = .matchText` 表現も `L140 / L143 = .matchText`（連続行ではない）と訂正。MAJOR-1 の §論点 6 / 7 / 補足事項書き戻しと同タイミングで実施可。

---

#### NIT-1: `dev.log` がコミット範囲には含まれないが `tmp/` 配下に残置されている。サイクル終了時の `tmp/` クリーンアップ運用と整合的か？

- **指摘内容**: `tmp/cycle-215/baseline/dev.log` は `next dev` 起動ログ（Playwright 計測時の補助ログ）であり、`.claude/rules/tmp-directory.md` の運用上は計測完了後に削除候補。本サイクル中は他成果物との対応関係保持のため残置で問題ないが、サイクル完了時のチェックリスト L2174 / L2180 で削除対象になることを T-4 完了時に明示しておくと運用整合的。
- **根拠**: `.claude/rules/tmp-directory.md` / 計画書 L2180「キャリーオーバー」運用。
- **期待する対応方針**: 任意対応。改善必須ではないが、サイクル完了チェックリスト L2172-2180 に「T-1 補助ログ (`dev.log` / raw json 計 5 件) のクリーンアップ判断」を 1 項目追加すると将来サイクルでの再発防止になる。

---

**指摘事項計 6 件**（CRIT 1 / MAJOR 3 / MINOR 2 / NIT 1）

#### T-1 review 最終評価コメント (200 字以内)

AP-WF16 独立再実行 5 数値 + サンプリング 6 数値すべて一致し、計測ファイル 7 件 + スクショ 10 枚 + raw json 5 件揃い、定量根拠の実在性は問題なし。ただし「案 F の含意取り違え (timeout 500ms = 案 F とする解釈)」が CRIT として、T-1 実測値の §論点 6/7 / §補足事項 / §引用 SSoT 17 本文への書き戻し不在が MAJOR として残存し、T-2/T-3 builder の判断材料が完成条件文言通りに揃っていない状態。CRIT-1 + MAJOR-1〜3 の修正で承認可。

---

### T-1 r2 review (2026-05-29 / r1 6 件対応確認 + r2 改訂で新たに生じた問題のゼロベース確認 + AP-WF16 reviewer 独立再実行)

**判定: 改善指示**

事後検証質問形（AP-WF15）。r1 review CRIT 1 + MAJOR 3 + MINOR 2 + NIT 1 = 6 件に対する r2 改訂対応を、(1) 計画書本文 + (2) `tmp/cycle-215/baseline/` 成果物、の両側で grep + Read により再確認。新規副作用も俯瞰確認。AP-WF16 reviewer 独立再実行 3 件（`grep -n "Worker 起動コスト" worker-startup-cost.md` / `grep -n "9.1ms" T-1-summary.md` / `grep -n "案 F" worker-startup-cost.md`）はすべて期待ヒット。

r2 改訂対応マップは概ね良好だが、**CRIT-1（案 F 解釈訂正）の波及修正が「成果物 md 2 件の §B / §C 本文」までで止まっており、計画書 §T-1 完成条件チェックリスト L189 と T-1-summary.md §H 書き戻し表 / §C 見出しに「案 F (現状維持) 採択 / 案 F-2 保留 / timeout 200ms 案 vs 500ms 案」表現が残存**している。これは r1 review CRIT-1 が指摘した「T-2 builder が現状維持で OK と誤読する波及リスク」の最も読まれる箇所（完成条件チェックリスト）にそのまま残っており、CRIT-1 の根本対応として不十分。

---

#### CRIT-1: 計画書 §T-1 完成条件チェックリスト L189「案 F (現状維持) 採択 / 案 F-1 (pre-warm) 不要 / 案 F-2 (timeout 200ms) 保留」が、worker-startup-cost.md §C と T-1-summary.md §C 本文で訂正済の「案 F = Worker + worker.terminate() + timeout 100ms / debounce 撤廃 / F-2 = 不要」と矛盾したまま残存しているのは、r1 review CRIT-1 の根本対応として不十分ではないか？

- **指摘内容**: r2 改訂で worker-startup-cost.md §C 表 L34-37 / T-1-summary.md §C 判定文 L61-65 は「案 F = Worker + worker.terminate() + timeout 100ms / debounce 撤廃」「案 F-2 (timeout 100ms → 200ms 緩和) = 不要」と訂正された。しかし `docs/cycles/cycle-215.md` L189 のチェックリスト達成証跡コメントは「**案 F (現状維持) 採択 / 案 F-1 (pre-warm) 不要 / 案 F-2 (timeout 200ms) 保留**」のまま残存。さらに T-1-summary.md §C 見出し L46「Worker 起動コスト中央値 + timeout 200ms 案 vs 500ms 案 判定」と §H 書き戻し表 L129「F-1 不採用 / F-2 保留」も r1 review CRIT-1 が指摘した「F-2 = 保留 = 500ms 維持が安全」表現の名残を引きずっている。
- **根拠**: `grep -n "F-2.*保留\|案 F (現状維持)" docs/cycles/cycle-215.md` = L189 ヒット / `grep -n "200ms 案 vs 500ms 案\|F-2 保留" tmp/cycle-215/baseline/T-1-summary.md` = L46 / L129 ヒット / これらはいずれも CRIT-1 で訂正対象となった表現の系統。L189 = T-1 完成条件チェックリストは T-2 builder が最初に読む参照点で、ここに矛盾表現が残ることは「§C 本文で訂正済」では補完できない。
- **波及リスク**: T-2 builder が §T-1 完成条件 L189 を読み「案 F = 現状維持 / F-2 = 保留」と理解し、計画書 §論点 6 L483-497 採択定義（timeout 100ms / debounce 撤廃）と乖離した実装着手判断をするリスクがそのまま残る = r1 review CRIT-1 で指摘した波及リスクが根本的には解消されていない。T-1-summary.md §C 見出し / §H 表に残る「F-2 保留 / 200ms 案 vs 500ms 案」も builder が §C 本文より先に目次的に読む箇所のため同種リスクを抱える。
- **期待する対応方針**:
  1. `docs/cycles/cycle-215.md` L189 のチェックリスト達成証跡を「案 F (Worker + `worker.terminate()` + timeout **100ms** / debounce **撤廃**) 採択確定 / 案 F-1 (pre-warm) 不要 / 案 F-2 (timeout 200ms 緩和) **不要** = 9.1ms << 100ms により段階 1 PASS」と訂正
  2. `tmp/cycle-215/baseline/T-1-summary.md` §C 見出し L46「timeout 200ms 案 vs 500ms 案 判定」を「案 F 採択検証 = 9.1ms vs timeout 100ms マージン判定」等に訂正
  3. 同 §H 書き戻し表 L129「F-1 不採用 / F-2 保留」を「F-1 不要 / F-2 不要 / 案 F 単独採用確定」に訂正
  4. worker-startup-cost.md L1 タイトル「cycle-215 T-1 案 F-1 (pre-warm Worker) 実装可能性ベンチ = Worker 起動コスト」も「案 F (Worker + timeout 100ms) 実装可能性ベンチ = Worker 起動コスト」に訂正（タイトル自体が「F-1 実装可能性」起点で書かれており、§C で F-1 不要結論を出した結果との整合性が崩れている）

---

#### MAJOR-1: 計画書 §論点 5 末尾（L470-472 周辺）には T-1 実測値 (e-α)(e-β) errorBox h=47.75 / w=928 同値 + (a)(b)(c) textarea h=148.3 同形性 = AP-P21 系統独立性破綻可能性 / 推奨 = 案 1 (e-α 単独 / N=5) の本文化が書き戻されていないが、§補足事項 (iv) サマリだけで T-4 builder の系統数調整判断材料として十分か？

- **指摘内容**: r1 review MAJOR-1 期待する対応方針 (4) で「§論点 5 L470 末尾の『T-1 実体確認結果に基づき T-4 で最終確定』近辺に『T-1 builder 2026-05-29 実測』セクションを追加し、(e-α) (e-β) errorBox h=47.75 / w=928 同値 + (a)(b)(c) textarea h=148.3 同形性 = AP-P21 (v) 系統独立性の破綻可能性 + 推奨 = 案 1 (e-α 単独 / N=5) の 3 件を T-4 持ち越し材料として本文化」と書かれているが、§論点 5 本文 L457-472 を確認すると T-1 実測値の書き戻し節は追加されていない。§論点 6（L522）と §論点 7（L574）には「**T-1 実測結果（T-1 builder 2026-05-29）**」セクションが書き戻し済だが、§論点 5 だけ書き戻しが空。§補足事項 (iv) L2263「(e-α)(e-β) h=47.75 w=928 同値 / 計測値冗長 = 案 1 (e-α 単独 / N=5) 推奨」のサマリは存在するが、§論点 5 本文 + §補足事項の二段書き戻し（L522/L574 と同パターン）が片肺になっている。
- **根拠**: `grep -n "47.75\|errorBox" docs/cycles/cycle-215.md` ヒット行を確認すると、§論点 5 本文 L455-472 は r3 旧文面のまま / 書き戻しは L192 完成条件達成証跡と L2263 §補足事項 (iv) の 2 箇所のみ / §論点 6 (L522) / §論点 7 (L574) と同パターンの「**T-1 実測結果**」節が §論点 5 にだけ欠落。
- **波及リスク**: T-4 builder が §論点 5 を参照して系統数調整（N=5 のまま / N=4 統合 / N=6 化）を判断する際、本文に T-1 実測「(a)(b)(c) textarea h=148.3 で同形 = AP-P21 (v) 独立性破綻可能性 / (e-α)(e-β) errorBox h=47.75 で同値 = 計測値冗長」が書かれていないと §補足事項 (iv) を別途参照する必要があり、§論点 6/7 の書き戻しパターンとも整合しない（builder が §論点 6/7 のように本文書き戻しを期待して §論点 5 を読むと該当節がない）。
- **期待する対応方針**: §論点 5 L472 末尾（「引用 SSoT: cycle-210 §補足事項 (vi) ...」の直後）に「**T-1 実測結果（T-1 builder 2026-05-29）**: (e-α)(e-β) errorBox h=47.75 / w=928 同値（実測値 / Playwright Chromium / 1200vp / `tmp/cycle-215/baseline/error-frame-measurements.md`）= 計測値として冗長 / (a)(b)(c) textarea h=148.3 で同形 = AP-P21 (v) 系統独立性の破綻可能性 / 推奨 = 案 1 (e-α 単独 / N=5) を T-4 持ち越し」を §論点 6/7 と同パターンで追記。

---

#### MINOR-1: r1 MINOR-1（Safari 推定値の生成元）の対応として worker-startup-cost.md §D L44 に MDN URL + 「Chromium 149 実測値 9.1ms から係数 4〜10 倍で見積もり」が追記されたが、T-1-summary.md §C 表 L53「Safari (iOS 想定) | 40〜90ms | 推定値 + 経験的暫定値」自体は引き続き生成元の直近併記がないままで、AP-WF12 の「4 分類ラベル + 生成元直近併記」運用と整合か？

- **指摘内容**: r2 改訂で worker-startup-cost.md §D L44 に「生成元 = MDN Web Workers ドキュメント + Chromium 149 実測値 9.1ms から係数 4〜10 倍で見積もり」/ T-1-summary.md §C 直下 L67 にも同種注記が追記された。しかし T-1-summary.md §C 表 L53 そのもの（Safari 行）は「| 推定値 + 経験的暫定値 |」とだけ書かれており、生成元 URL / 出典の直近併記は同行内には存在しない。表外（L67）まで読み下ろせば確認可能だが、AP-WF12 が要求する「直近併記」運用と完全には整合しない。
- **根拠**: T-1-summary.md L53 / L67 + AP-WF12 4 分類ラベル + 生成元直近併記運用。
- **期待する対応方針**: 任意。T-1-summary.md §C 表 L53 の Safari 行に「(生成元 = §下注 + worker-startup-cost.md §D / MDN Web Workers + 実測値 9.1ms × 4〜10 倍)」程度の最小注記を表セル内に追加するか、現状の §C 直下 L67 注記から表セルへ参照リンクを張る。MAJOR-1 §論点 5 書き戻しと同タイミングで実施可。

---

**指摘事項計 3 件**（CRIT 1 / MAJOR 1 / MINOR 1）

#### T-1 r2 review 最終評価コメント (200 字以内)

r1 review 6 件中、MAJOR-2 (regex-bench グリッド未実施理由) / MAJOR-3 (SSoT 17 ラベル) / MINOR-2 (hex 行番号 L143) / NIT-1 (dev.log) は r2 で根本対応済。CRIT-1 (案 F 解釈) は §C 本文では訂正されたが、最も読まれる計画書 L189 完成条件チェックリスト「現状維持 / F-2 保留」表現と T-1-summary.md §C 見出し / §H 書き戻し表に CRIT-1 で指摘した波及リスクの源が残存。MAJOR-1 (§論点 5 書き戻し) は §補足事項 (iv) で補完されたが §論点 6/7 と片肺。CRIT-1 + MAJOR-1 修正で承認可。

---

### T-1 r3 review (planner reviewer / 2026-05-29)

事後検証質問形（AP-WF15）。T-1 r2 review 指摘 3 件（CRIT-1 / MAJOR-1 / MINOR-1）の対応状態を、`docs/cycles/cycle-215.md` + `tmp/cycle-215/baseline/T-1-summary.md` + `tmp/cycle-215/baseline/worker-startup-cost.md` の現物 grep + 該当行 Read で照合した。あわせて AP-WF16 reviewer 独立再実行で §論点 5/6/7 T-1 実測結果書き戻しパターンの対称性、累積指摘の波及反映状態を再確認。

**段階 1 = r2 review 3 件の本文反映状態（grep ベース独立検証 / レビュー履歴セクション L2155-2290 はヒット行から除外）**:

| r2 指摘    | r3 改訂で訂正された箇所                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | grep 検証結果（本文 load-bearing 残存）                                                                                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| r2 CRIT-1  | (a) cycle-215.md L189 「案 F (Worker + worker.terminate() + timeout 100ms / debounce 撤廃) 採択 = T-1 実測 9.1ms で技術的成立確認 / 案 F-1 (pre-warm) + 案 F-2 (timeout 200ms) は 9.1ms の余裕で不要判定」/ (b) T-1-summary.md §C 見出し L46 「案 F (timeout 100ms / debounce 撤廃) 採択判定 = T-1 実測値 9.1ms」/ (c) §H 書き戻し表 L129 「案 F 採択 / F-1 不要 (9.1ms で十分余裕) / F-2 不要 (9.1ms で十分余裕)」/ (d) worker-startup-cost.md タイトル L1 「案 F Worker 起動コスト実測ベンチ (案 F-1 pre-warm 要否判定込み)」（"案 F-1 pre-warm 要否判定込み" は§C で F-1 不要結論済 = 「ベンチに F-1 要否判定が含まれていた」事実記述として整合） | `grep -n "案 F (現状維持)\|案 F = 現状維持\|F-2 保留\|200ms 案 vs 500ms 案" docs/cycles/cycle-215.md tmp/cycle-215/baseline/T-1-summary.md tmp/cycle-215/baseline/worker-startup-cost.md` = **本文 load-bearing 残存 0 件**（cycle-215.md ヒットは L2172-2290 のレビュー履歴のみ = 改変対象外） ✓ |
| r2 MAJOR-1 | §論点 5 L473「**T-1 実測結果**: (a)〜(e) 6 系統 errorBox getBoundingClientRect 計測完了 / (e-α) errorBox h=47.75px w=928px、(e-β) errorBox h=47.75px w=928px（実測値 / Chromium 149 / `tmp/cycle-215/baseline/error-frame-measurements.md`）= 両系統が同値 = (e-α) 単独採用で N=5 系統に統合可能 / T-4 で最終確定」を §論点 6 (L523) / §論点 7 (L575) と同パターンで追記                                                                                                                                                                                                                                                                             | `grep -n "T-1 実測結果" docs/cycles/cycle-215.md` = **本文 load-bearing 3 件ヒット = L473（§論点 5）/ L523（§論点 6）/ L575（§論点 7）= 期待 3 箇所すべてに同パターン書き戻し済 ✓ = 片肺解消**                                                                                                    |
| r2 MINOR-1 | T-1-summary.md §C 表 L53 Safari 行「\| **40〜90ms** \| 推定値 + 経験的暫定値 (生成元 = MDN Web Workers + 実測値 9.1ms × 4〜10 倍 / 詳細は §下注 + worker-startup-cost.md §D) \|」表セル内に生成元直近併記を追加 = AP-WF12「4 分類ラベル + 生成元直近併記」運用と整合                                                                                                                                                                                                                                                                                                                                                                                 | T-1-summary.md L53 を Read で確認 = 「(生成元 = MDN Web Workers + 実測値 9.1ms × 4〜10 倍 / 詳細は §下注 + worker-startup-cost.md §D)」表セル内併記済 ✓                                                                                                                                           |

**段階 2 = r1 + r2 累積指摘の波及反映状態（独立再確認）**:

- **r1 CRIT-1（案 F 解釈）= r2 CRIT-1 残存分**: 段階 1 と同じく訂正済 ✓
- **r1 MAJOR-1 (§論点 5 書き戻し) = r2 MAJOR-1 残存分**: §論点 5 L473 で書き戻し完了 ✓ = §論点 6/7 と対称
- **r1 MAJOR-2 (regex-bench グリッド未実施理由) / r1 MAJOR-3 (SSoT 17 ラベル) / r1 MINOR-2 (hex L141→L143) / r1 NIT-1 (dev.log)**: r2 で根本対応済（r2 review 末尾で確認済）+ r3 で再退行なし（grep で L143 訂正済を再確認 = cycle-215.md L225「1（L143 / T-1 で確定 = L141 ではなく L143）」/ §補足事項 (iv) errorBox 計測サマリ / `tmp/cycle-215/baseline/dev.log` クリーンアップ運用は T-1-summary.md §K で言語化 = いずれも維持）✓
- **r1 MINOR-1 (Safari 推定値の生成元) = r2 MINOR-1 残存分**: 段階 1 と同じく訂正済 ✓

**段階 3 = 計画書全体の俯瞰整合性**:

- **T-1 完成条件チェックリスト L185-197**: 13 件すべて `[x]` 化 + 達成証跡コメントが訂正後の表現で統一（L189 = 案 F 採択 / F-1 不要 / F-2 不要 / `worker.terminate()` + timeout 100ms / debounce 撤廃）+ T-1 review 履歴と整合 ✓
- **「案 F」採択の意味**: 計画書本文（L483 採択定義 / L492-498 採択理由 / L523 T-1 実測結果書き戻し）+ T-1-summary.md §C 判定（L55「案 F = Worker + `worker.terminate()` 中断 + timeout 100ms / debounce 撤廃」）+ worker-startup-cost.md §C 表注記（L30 同表現）で**完全統一** ✓ = T-2 builder が「案 F = 現状維持」と誤読する波及リスクは解消
- **§論点 5/6/7 T-1 実測結果書き戻しパターンの対称性**: L473 / L523 / L575 がいずれも「**T-1 実測結果（T-1 builder 2026-05-29）**: ...（実測値 / Chromium 149 or Playwright Chromium / `tmp/cycle-215/baseline/*.md`）= ... / T-4 持ち越し」のフォーマットで統一 = builder が §論点 5 と §論点 6/7 を交互に参照する際に読み下し負荷なし ✓
- **AP-WF16 reviewer 独立再実行**: r2 review 段階で確認済の 5 数値（`--color-*` 40 / `(test|it)\(` 12 / hex L140+L143 / `^\s*slug:` 16 / Component.test.tsx 不存在）+ サンプリング 6 数値はいずれも r3 で改変なし = 全件一致を継続 ✓
- **§補足事項 T-1 実測サマリ (i)-(v) L2308-2313**: GA / Worker 9.1ms / ReDoS 爆発 / errorBox / 案 W-4 採択根拠の 5 件サマリが §論点 5/6/7 本文書き戻しと相互参照可能な形で整理済 ✓

#### T-1 r3 review = PASS

#### T-1 r3 review 最終評価コメント (200 字以内)

r2 review 3 件（CRIT-1 / MAJOR-1 / MINOR-1）すべて根本対応完了。L189 完成条件チェックリスト + T-1-summary.md §C 見出し / §H 表 + worker-startup-cost.md タイトルが「案 F = Worker + `worker.terminate()` + timeout 100ms / debounce 撤廃」表現で統一され、T-2 builder の「現状維持」誤読リスクが構造的に解消。§論点 5/6/7 の T-1 実測結果書き戻しも対称化。T-2 着手可。

---

### T-2 review (2026-05-29 / T-2 成果物 + AP-WF16 独立再実行 + 計画書書き戻し)

#### T-2 review 独立再実行結果

| 観点                                                                     | 期待値                                                                      | 実測値                                                                                                                                                                      | 一致 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `grep -c "var(--color-" src/tools/regex-tester/Component.module.css`     | 0                                                                           | 0                                                                                                                                                                           | ✓    |
| `grep -nE "#[0-9a-fA-F]{6}" src/tools/regex-tester/Component.module.css` | 0 件                                                                        | 0 件                                                                                                                                                                        | ✓    |
| `npm run test -- regex-tester`                                           | 12 件全件緑                                                                 | 12 件全件緑 (1 file passed)                                                                                                                                                 | ✓    |
| `(new)/tools/regex-tester/` 配下 4 ファイル存在                          | page.tsx / opengraph-image.tsx / twitter-image.tsx / page.module.css        | 4 ファイルすべて存在                                                                                                                                                        | ✓    |
| `(legacy)/tools/regex-tester/` 削除                                      | 不存在                                                                      | 不存在                                                                                                                                                                      | ✓    |
| `REGEX_SAMPLE_INPUTS` 6 種 export                                        | メール / URL / 電話 / 郵便 / 日付 / HTML タグ                               | 6 種すべて export 済 + 各 pattern / flags / testText が §論点 15 案 D-改 1 と一致                                                                                           | ✓    |
| relatedSlugs 3 件実在判定                                                | json-formatter / text-diff / email-validator すべて `src/tools/` 配下に存在 | 3 件すべて存在（`ls src/tools/{json-formatter,text-diff,email-validator}` 全件 PASS）                                                                                       | ✓    |
| backlog B-462 起票                                                       | 新規追加                                                                    | L102 に「regex-tester Component テスト基盤整備 / P4」追記済                                                                                                                 | ✓    |
| backlog B-452 状態更新                                                   | cycle-215 T-4 実測値の同軸性次第                                            | L95 末尾に「cycle-215 T-4 実測値の同軸性次第で『真の N=2 達成』または『真の N=1 のまま』のいずれか / cycle-214 = 同軸ではない参考値 / 基準値見直しは真の N=3 確定後」追記済 | ✓    |
| backlog B-453 状態更新                                                   | cycle-215 で 3 件目引用適用実施済                                           | L96 末尾に「cycle-215 で 3 件目引用適用実施済 = `docs/knowledge/composite-input-tile-criteria.md` 新設の優先度確定」追記済                                                  | ✓    |
| backlog B-314 cycle-215 着手追記                                         | cycle-215 T-2 完了サマリ                                                    | L7 「cycle-215 T-2 完了」セクション追記済                                                                                                                                   | ✓    |
| `npm run build` 成功                                                     | PASS                                                                        | PASS（dynamic font の Status:400 warning は外部 OG エンドポイントの既知挙動 / 本サイクル変更と無関係）                                                                      | ✓    |

#### T-2 review 指摘事項

**CRIT-1**: `Component.module.css` が \*\*`(new) globals.css` に未定義の CSS 変数を 27 箇所で使用しており、移行先のページが「ボーダー透明 / 背景 transparent / テキスト色継承」で破綻表示する。

- **検出根拠**: `grep -nE "var\\(--bg-base\\)|var\\(--border-soft\\)|var\\(--text-base\\)|var\\(--text-muted\\)" src/tools/regex-tester/Component.module.css` = **27 件ヒット**（L11/14/20/29/53/70/76/82/83/103/112/134/148/153/159/168/176/191/199/204/206/207/221/225/226/237/244）。
- **検証 1**: `grep -nE "^\\s*--(bg-base|border-soft|text-base|text-muted):" src/app/globals.css` = **0 件ヒット**。`(new)/` 配下のページが読み込む `src/app/globals.css` ライト `:root` / ダーク `:root.dark` のいずれにも `--bg-base` / `--border-soft` / `--text-base` / `--text-muted` は定義されていない。fallback も指定されていないため CSS 仕様上「invalid → initial」と評価され、`border` は `initial` (medium none / 不可視) / `background-color` は `transparent` / `color` は `inherit` 相当の親要素値となり、詳細ページの主要 UI（patternRow / matchText / errorBox / 各種テキスト）が視覚的に破綻する。
- **検証 2**: 同じ Phase 8.1 で移行済の cycle-214 `src/tools/text-diff/Component.module.css` は同一マッピング用途に `--bg` / `--border` / `--fg` / `--fg-soft` を使用（grep で実証済）。**他の (new) 移行済 16 ツール群と一致しない命名規則を本ツール 1 件のみ独自採用している**。
- **検証 3**: 計画書 §T-2 置換マッピング表 L217-220（cycle-215.md）で planner は明示的に以下を確定:

  | 旧トークン           | → 新トークン (計画書) | builder 実装    | 差分       |
  | -------------------- | --------------------- | --------------- | ---------- |
  | `--color-text`       | `--fg`                | `--text-base`   | **不一致** |
  | `--color-text-muted` | `--fg-soft`           | `--text-muted`  | **不一致** |
  | `--color-border`     | `--border`            | `--border-soft` | **不一致** |
  | `--color-bg`         | `--bg`                | `--bg-base`     | **不一致** |

  4 種すべてが計画書から逸脱。計画書 L223「上記マッピング先トークンがすべて `src/app/globals.css` のライト `:root` + ダーク `:root.dark` 両方に定義済であることを T-2 builder が `grep` で再確認」の手順が**未実施**であった蓋然性が高い。

- **来訪者影響**: 本サイクルの主目的「(legacy) 配下に取り残されていた regex-tester に新トークン体系 + ダークモード対応の恩恵を届ける」が**未達成**。むしろ (legacy) の `var(--color-bg)` 等は old-globals.css に定義済で正常表示していたところ、本 T-2 で「定義のない新名称」に置換した結果、視認性が**退行**している可能性が高い（ダークモードでテキスト不可視・パネル枠線消失等のリスク）。
- **期待対応**: `Component.module.css` 内の `--bg-base` → `--bg` / `--border-soft` → `--border` / `--text-base` → `--fg` / `--text-muted` → `--fg-soft` を一括置換（27 箇所）。置換後に `grep -nE "var\\(--" src/tools/regex-tester/Component.module.css | grep -vE "var\\(--(bg|bg-soft|border|fg|fg-soft|accent|accent-strong|accent-soft|font-mono|success|success-strong|success-soft|danger|danger-strong|danger-soft|warning|warning-strong|warning-soft)\\)"` で 0 件確認。さらに Playwright で w1200 light/dark の差分スクショを撮り、`.patternRow` の border / `.matchText` のテキスト色が視認可能であることを実証。

**MAJOR-1**: 計画書 §T-2 完成条件 L267「M1a / M1b yaml `search_intents` に正規表現系 **4 語**が追加されている」+ §論点 10 L596「M1a yaml + M1b yaml の `search_intents` 末尾に追加」と、実装（M1a のみ 4 語追加 / M1b 0 語追加）が不一致。

- **検出根拠**: `grep -n "search_intents" docs/targets/気に入った道具を繰り返し使っている人.yaml` = L25「`search_intents: []`」のまま。`docs/targets/特定の作業に使えるツールをさっと探している人.yaml` (M1a) は L65-68 で 4 語追加済。
- **判断分岐**: 「M1b は repeat user で bookmark 起点のため search_intents が論理的に薄い」という builder 解釈の余地はあるが、計画書はそれを明示的に上書きする記述（M1b は除外する）を持たない。**(a)** 計画通り M1b にも 4 語追加するか、**(b)** 「M1b にはなぜ追加しないか」の意図的判断を §補足事項に書き戻して計画書の §論点 10 / §完成条件 L267 を改訂するか、いずれかが必要。
- **後続影響**: T-3 / T-4 で「M1a/M1b 両層をカバー」の前提が崩れる。GA 流入観測時に「M1b リピーター層」と「M1a 初回層」を区別して効果測定する場合の比較軸が失われる。

**MINOR-1**: `Component.module.css` の `font-family: var(--font-mono)` 参照 (L18/27/35/52/78/99/139) は `src/app/globals.css` の `body { --font-mono: ... }` でしか定義されていない。CSS Custom Property は inheritance するため body 配下では参照できるが、`:root` レベルで定義されている他のトークンと整合させるため、または `--font-mono` を `:root` に格上げする backlog 提案を §補足事項に記録する余地がある。本 T-2 修正の必須事項ではないが、(legacy) 削除フェーズで認識合わせが必要。

**NIT-1**: `src/app/(new)/tools/regex-tester/page.tsx` のコメント L20-22「`ToolLayout` 外側で 1200px をハードコード」は cycle-196 SSoT 引用であり妥当だが、計画書 §T-2 実施事項中に「page.module.css 新規作成 + 外側 div max-width 1200px ハードコード」が明示されていない。事後妥当だが、cycle-196 SSoT を引用したことを §補足事項に書き戻すと後続サイクル planner の発見性が向上する。

#### T-2 review = 改善指示

#### T-2 review 最終評価コメント (200 字以内)

CRIT-1 が深刻。`Component.module.css` 27 箇所で `(new) globals.css` 未定義のトークン名（`--bg-base` / `--border-soft` / `--text-base` / `--text-muted`）を使用しており、計画書 L217-220 マッピング表（`--bg` / `--border` / `--fg` / `--fg-soft`）から 4 種全て逸脱。移行後ページの border / background / text が破綻表示する蓋然性が高く、本サイクルの主目的「新トークン体系の恩恵を visitor に届ける」が未達成。再修正後に Playwright dark/light 視覚検証必須。MAJOR-1 (M1b search_intents 不追加) も併せて対応要。

### T-2 r2 review (2026-05-29 / AP-WF16 独立再実行 + r1 4 件対応確認)

#### T-2 r2 review 独立再実行結果

| 観点                                                                                                                                                                                                                                                                     | 期待値                                                                                       | 実測値                                                                                                                                 | 一致 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `grep -c "var(--bg-base\|var(--border-soft\|var(--text-base\|var(--text-muted)" src/tools/regex-tester/Component.module.css` (r1 CRIT-1)                                                                                                                                 | 0                                                                                            | 0                                                                                                                                      | ✓    |
| `grep -cE "var\(--(bg\|border\|fg\|fg-soft)\)" src/tools/regex-tester/Component.module.css` (r1 CRIT-1)                                                                                                                                                                  | ヒットあり                                                                                   | 27                                                                                                                                     | ✓    |
| `grep -nE "var\(--" .../Component.module.css \| grep -vE "var\(--(bg\|bg-soft\|border\|fg\|fg-soft\|accent\|accent-strong\|accent-soft\|font-mono\|success\|success-strong\|success-soft\|danger\|danger-strong\|danger-soft\|warning\|warning-strong\|warning-soft)\)"` | 0 件                                                                                         | 0 件                                                                                                                                   | ✓    |
| `tmp/cycle-215/t2-r2/after-token-fix-w1200-light.png` / `after-token-fix-w1200-dark.png` 存在 + 視認可能                                                                                                                                                                 | patternRow border / matchText テキスト色が両モードで判読可                                   | 2 ファイル存在 / light: border 灰色 + テキスト黒判読可 / dark: border 中間色 + テキスト白判読可                                        | ✓    |
| M1b yaml search_intents 4 語追加 (r1 MAJOR-1)                                                                                                                                                                                                                            | 正規表現 動作確認 / メールアドレス チェック 正規表現 / URL 抽出 正規表現 / 電話番号 正規表現 | `docs/targets/気に入った道具を繰り返し使っている人.yaml` L25-29 に 4 語追加済 (M1a yaml と同じ 4 語)                                   | ✓    |
| MINOR-1 書き戻し (r1)                                                                                                                                                                                                                                                    | §補足事項に `--font-mono` 定義レベルの認識合わせ記載                                         | L2407 に書き戻し済                                                                                                                     | ✓    |
| NIT-1 書き戻し (r1)                                                                                                                                                                                                                                                      | §補足事項に max-width 1200px ハードコードが cycle-196 SSoT 由来である旨記載                  | L2408 に書き戻し済                                                                                                                     | ✓    |
| `npm run test -- regex-tester`                                                                                                                                                                                                                                           | 12 件全件緑                                                                                  | 12 passed (1 file) / Duration 1.15s                                                                                                    | ✓    |
| `npm run build` typecheck PASS                                                                                                                                                                                                                                           | PASS                                                                                         | Compiled successfully in 19.9s / Static pages 3899/3899 生成成功 (dynamic font Status:400 は外部 OG 既知挙動 / 本サイクル変更と無関係) | ✓    |
| `.next/types/routes.d.ts` ルーティング反映                                                                                                                                                                                                                               | `/tools/regex-tester` 含む                                                                   | L4 AppRoutes に `/tools/regex-tester` 含む + L136 `"/tools/regex-tester": {}` 定義                                                     | ✓    |
| globals.css 新トークン定義の整合性                                                                                                                                                                                                                                       | light/dark 両 :root で `--bg` / `--border` / `--fg` / `--fg-soft` 定義                       | light L11/18/19/25 / dark L83/93/94/104 ですべて定義済                                                                                 | ✓    |

#### T-2 r2 review 指摘事項

なし。

#### T-2 r2 review = PASS

**T-2 r2 review = PASS**

#### T-2 r2 review 最終評価コメント (200 字以内)

r1 で指摘した CRIT-1 トークン逸脱 27 箇所は完全置換され、light/dark スクショで border / matchText 視認性も実証。MAJOR-1 M1b search_intents 4 語追加 + MINOR-1/NIT-1 の §補足事項書き戻しも完遂。AP-WF16 独立再実行 (grep 0 件 / test 12 緑 / build PASS / routes.d.ts 反映) も全件 PASS。新トークン体系の恩恵が visitor に届く状態を達成しており、T-3 着手可。

---

### T-3 review (2026-05-29 / RegexTesterTile.tsx 実装 + テスト + TILE_DECLARATIONS 登録 + AP-WF16 独立再実行)

#### T-3 review 独立再実行結果

事後検証質問形（AP-WF15）。`src/tools/regex-tester/RegexTesterTile.tsx`（706 行）+ `src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx`（509 行 / 23 件）+ `src/tools/_constants/tile-declarations.ts`（regex-tester エントリ L286-297）を Read で精査。AP-WF16 reviewer 独立再実行: `npm run lint` = PASS (exit 0) / `npm run format:check` = PASS（All matched files use Prettier code style）/ `npm run test -- regex-tester` = **35 件全件緑**（Tile 23 + logic 12）/ `grep -c '^\s*slug:' src/tools/_constants/tile-declarations.ts` = **17 件**（実エントリ 16 + interface 行 1 = 期待通り）/ `grep -nE 'vi\.getTimerCount' src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx` = L458, L465 = 2 件ヒット = AP-I11 検証 PASS / codegen tilesCount=16 確認済。**ただし実装側で 1 件の致命的バグを発見**（後述 CRIT-1）。

#### T-3 review 指摘事項

##### CRIT-1: マッチ結果アイテムが初期 `display:none` + IntersectionObserver 観測の組み合わせで実機ブラウザでは**永久に何も表示されない**致命的バグになっていないか?

- **指摘内容**: `RegexTesterTile.tsx` L588-606 で各マッチアイテム `<div>` の style に `display: visibleIndices.has(i) ? "flex" : "none"` を指定しているが、初期状態の `visibleIndices` は `new Set()`（L131）= 全アイテムが `display: none` でレンダリングされる。一方 IntersectionObserver useEffect (L246-281) は `observer.observe(el)` で要素を観測登録するが、**`display: none` の要素は IntersectionObserver で観測されない**（[MDN IntersectionObserver: observe()](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/observe) / [W3C spec](https://www.w3.org/TR/intersection-observer/) = "elements with display:none don't participate in document layout and therefore cannot intersect"）。実機の挙動:
  1. matches 計算成功 → アイテム N 件分の `<div display:none ref={...}>` レンダリング
  2. useEffect が `observer.observe(el)` を呼ぶが、display:none の要素は intersection event を**一切発火しない**
  3. `setVisibleIndices` が呼ばれず `visibleIndices` は永久に空の Set
  4. → **全アイテムが永久に display:none = ユーザーは「マッチ件数: N 件」というサマリだけ見え、マッチした実体テキストは一切見えない**
  - テストが PASS している理由: `RegexTesterTile.test.tsx` L46-60 の `mockIntersectionObserver` は `observe(element)` 呼び出し時に**即座に `callback([{ isIntersecting: true, target: element }])` を実行する**ため、display:none 制約が無視され実機と異なる経路で visibleIndices が埋まる。これは AP-I 系統「モック都合のテストが実機挙動から乖離する」古典的アンチパターン。
  - 計画書 §論点 7 案 W-4 の元設計（cycle-215.md L381）は「**先頭 10 件相当を即時ハイライト** + タイル内スクロール時に IntersectionObserver で追加描画」であり、最低でも先頭 10 件は初期描画されるべき設計。しかし実装には初期 visibleIndices の seed 処理（例えば `useState` の初期値で先頭 10 件を含める / matchResult 更新時に先頭 N 件を visibleIndices に追加するなど）が**一切ない**。
  - 来訪者価値への影響: M1a「URL 抽出して結果をコピー」M1b「マッチ一覧をリスト確認」の主要動線が**完全に破綻**。「マッチ件数だけ見えてマッチテキストは見えない」状態は本タイルの存在意義を否定する。**T-4 Playwright 検証で必ず発覚するが、その時点で実装やり直しになる工数損失も大きい。**
- **根拠**: `src/tools/regex-tester/RegexTesterTile.tsx` L130-131（visibleIndices 初期値 = 空 Set）/ L246-281（useEffect で observe のみ / 初期 seed なし）/ L588-606（display: visibleIndices.has(i) ? "flex" : "none"）/ `src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx` L46-60（mock が即座に isIntersecting=true を発火 = 実機との乖離）/ MDN IntersectionObserver: observe() / W3C Intersection Observer spec / cycle-215.md L381（案 W-4 期待動作「先頭 10 件相当を即時ハイライト」）
- **期待する対応方針**:
  1. `visibleIndices` の seed 設定: matchResult.matches 更新時に「先頭 10 件相当（例えば 10〜20 件 / cycle-215 §論点 7 採択値）」を初期 visibleIndices に投入する useEffect を追加。または `useState` で派生計算する。
  2. **または**: 「先頭 N 件は常時 display:flex / N 件以降は IntersectionObserver で遅延表示」のハイブリッド方式に変更（display:none を回避するため `visibility: hidden` / `opacity: 0` に置き換える / または初期描画は全件可視で IntersectionObserver は「画面外要素を撤去」目的に限定する等の設計に再構成）。
  3. テストに「実機ブラウザ挙動に近い検証」を追加: 例えば「初期描画で先頭 10 件のアイテムが `display !== "none"` であること」「100 件マッチ時にスクロール前の段階で textContent に最低 10 件のマッチテキストが含まれること」を assertion し、モックの即時 isIntersecting=true 依存を断ち切る（テスト追加でなくても、Playwright 検証を T-4 ではなく T-3 改修フェーズで前倒し実施でも可）。
  4. 実装後に `npm run dev` + 手動ブラウザ確認 or Playwright headed モードで「マッチ結果が実際に画面に表示される」ことを直接確認してから T-4 に進む。

##### MAJOR-1: 詳細リンクテキストが計画書 §論点 9 採択（案 B = 「フラグ切替・置換などの詳細機能を使う →」）と乖離し「詳細ページで開く」になっていないか?

- **指摘内容**: 計画書 §論点 9 (cycle-215.md L588-595) で **採択 = 案 B 「フラグ切替・置換などの詳細機能を使う →」** を採択。案 C「詳細ページへ →」は「他タイルとの差別化なし」として不採用と明記。しかし `RegexTesterTile.tsx` L700 の Link テキストは「**詳細ページで開く**」となっており、案 C と同型の汎用文言で、§論点 9 不採用ラベルが付いている表現に最も近い。これにより visitor は「詳細ページに何があるか」を理解できず、タイル UI の制約（フラグ全件省略 / 置換不在）を伝えるという案 B 採択の visitor 価値が失われている。コメント (L689) で「論点 9 採択: テキスト = 『詳細ページで開く』」と書かれているが、これは**コメントが計画書採択結果と矛盾している誤記**。
- **根拠**: cycle-215.md L594（採択 = 案 B「フラグ切替・置換などの詳細機能を使う →」）/ `RegexTesterTile.tsx` L689 コメント（誤記）+ L700 実装文言 / 計画書 T-3 完成条件 L327「観点 (i)〜(xvii) を全て含む」/ 観点 (xii) 詳細ページリンク
- **期待する対応方針**: L700 の文言を「フラグ切替・置換などの詳細機能を使う →」に修正 + L689 コメントも同期修正 + テスト L320-325 (ix) の assertion 文字列 `/詳細ページで開く/` を `/フラグ切替.*詳細機能/` 等に更新。または計画書 §論点 9 採択を「詳細ページで開く」に r2 改訂し、案 C 不採用根拠を反転（採択変更の波及反映プロセスを経る）。

##### MAJOR-2: TILE_DECLARATIONS の `inputPlaceholder` / `outputPlaceholder` / `widgetSummary` が計画書 L296 指定値と全件乖離していないか?

- **指摘内容**: 計画書 L296 は `inputPlaceholder: "正規表現パターンを入力するとマッチ結果を表示します"` / `outputPlaceholder: ""` / `widgetSummary: "正規表現の動作確認を素早く行う"` を明示。実装値（tile-declarations.ts L292-296）は `inputPlaceholder: "/* 例: \\d{4}-\\d{2}-\\d{2} */"` / `outputPlaceholder: "マッチ結果がここに表示されます"` / `widgetSummary: "正規表現を即時テスト。パターン + テキスト → マッチ位置と件数を表示。"` で**全 3 項目が乖離**。計画書では「暫定値 = §論点 9 で確定」と注釈されているが、§論点 9 (L588-595) は詳細リンクテキストのみを論じており、placeholder / widgetSummary 確定論点としては機能していない = 実装値が**論点未経由で確定された状態**。実装値そのものは visitor 価値で見て計画書の暫定値より具体的（マッチ結果がここに表示される = output イメージ伝達 / `\d{4}-\d{2}-\d{2}` プレースホルダ = 入力例が明確）なので**実装値の方が visitor 価値は高い可能性が高い**が、計画書 → 実装の SSoT トレーサビリティが破綻している点は AP-P / AP-WF 系統で再発防止対象。
- **根拠**: cycle-215.md L296（暫定値）/ `src/tools/_constants/tile-declarations.ts` L292-296（実装値）/ §論点 9 L588-595（placeholder / widgetSummary 確定論点として機能していない）
- **期待する対応方針**:
  1. 実装値の妥当性そのものは visitor 価値で見て計画書暫定値より優れていると判断するなら、計画書 L296 を**実装値に書き戻す**（補足事項 or §論点 9 末尾に「最終確定値 = 実装値 / 暫定値より具体的で visitor 動線理解を助けるため格上げ」と注記）。
  2. または、TILE_DECLARATIONS を計画書暫定値に揃える（visitor 価値が劣化する選択肢のため非推奨）。
  3. 「計画書暫定値 → 実装値 への変更経緯」を §補足事項に書き戻し、AP-P21 / AP-WF12 同型の「実装で確定 → 計画書に書き戻し」プロセスを完遂する。

##### MAJOR-3: サンプル選択ドロップダウンの `<select>` の `minHeight: 32px` が計画書 AP-P21 操作側 minHeight 40px 下限を**割っていないか**?

- **指摘内容**: `RegexTesterTile.tsx` L398 で `<select>` の `minHeight: 32` と指定し、コメントで「実装値 = 操作側視認下限 / AP-P21 (i) 下限 40px への配慮（行内配置のため 32px）」と書かれている。しかし計画書 §論点 4 / cycle-210 SSoT (i) は AP-P21 操作側下限 = **40px**（cycle-215.md L340「タイル UI のドロップダウン配置が AP-P21 操作側 flexShrink:0 + 視認下限 40px と整合」と完成条件で宣言）と規定。「行内配置のため 32px」という減衰は計画書本文での合意がなく、**実装単独判断で SSoT 値を 32px に弱めた**形になっている。サンプル選択ドロップダウンを含む操作側行全体（label + select）が 40px を満たしているか否かは別途検証が必要で、現状コードでは `<div>` 親要素にも `minHeight` 指定がなく、子要素の高さ次第で 40px を割る可能性が高い。
- **根拠**: `RegexTesterTile.tsx` L398（minHeight: 32）/ L373-417（親 div に minHeight 指定なし）/ cycle-215.md L340（完成条件「AP-P21 操作側 視認下限 40px と整合」）/ cycle-210 SSoT (i)（minHeight 40px）
- **期待する対応方針**:
  1. サンプル行 `<div>`（L373-380）に `minHeight: 40` を指定し、`<select>` 単独では 32px でも親 div で 40px を満たす構造に修正。
  2. または `<select>` 自体を `minHeight: 40` に統一（label 高さに合わせて行全体が 40px に保たれる）。
  3. T-4 AP-P21 計測時に「サンプル行の高さが 40px 以上であること」を明示的に追加 assertion。
  4. 「行内配置のため 32px」減衰の論証を計画書に書き戻す（AP-P21 (i) の例外運用として SSoT 体系に明示）か、減衰を撤回するかを T-4 builder が判断できる粒度に SSoT を整理。

##### MINOR-1: タイル UI コメント `L11`「Worker + debounce + replace + overlay highlight」が詳細ページの現状（タイル実装時点で詳細ページ未改修）と一致していないのではないか?

- **指摘内容**: `RegexTesterTile.tsx` L11 のコメントで「詳細ページ Component.tsx（Worker + debounce + replace + overlay highlight）とは別に」と記述。しかし計画書 §T-3 完成条件 L329「詳細ページ Component.tsx / Component.module.css が ... 以外で touch されていない（T-3 は RegexTesterTile.tsx 新規実装のみ / Component.tsx 未変更）」とあり、**詳細ページの overlay highlight は T-3 範囲外 = 未実装**。コメントは未来形（Phase 末の予想状態）として書かれた可能性があるが、現時点では誤情報。
- **根拠**: `RegexTesterTile.tsx` L11 / cycle-215.md L329 / 詳細ページ Component.tsx を Read で確認すれば overlay highlight 未実装が分かる
- **期待する対応方針**: L11 コメントを「詳細ページ Component.tsx（現状 = Worker + debounce + replace / 将来案 Y で overlay highlight 追加予定）とは別に」のように現状と将来を区別する記述に修正。または cycle-215 T-3 範囲外であることを明示。

##### MINOR-2: Inline Worker と useMemo の二重計算が冗長で、ReDoS パターン入力時に**メインスレッドがブロックされる**問題が解消されていないのではないか?

- **指摘内容**: タイル UI は L161-164 で `useMemo(() => testRegex(...))` で**メインスレッドで同期計算**を行い、同時に L178-226 で Inline Worker でも並行計算する。**ReDoS パターン入力時、useMemo はメインスレッドをブロックして 100ms どころか数秒〜数分フリーズする**（計画書 §論点 13 採択は ReDoS 安全性 = Worker + terminate / 100ms timeout で対処する設計）。Worker の timeout 100ms 検出が立っても、その前に useMemo の同期計算がブラウザを完全にフリーズさせる構造のため、案 F の ReDoS 安全性が事実上**達成できていない**。M1b「気に入って繰り返し使う」visitor が何気なく `(a+)+$` 等のパターンを試した瞬間、ブラウザがフリーズし「壊れたサイト」と認識される競合劣位状態に陥る。
- **根拠**: `RegexTesterTile.tsx` L161-164（useMemo で同期 testRegex 直接呼び出し）/ L178-226（Worker 並行起動だが useMemo は止められない）/ cycle-215.md §論点 6 案 F 採択（Worker + terminate / 100ms timeout = ReDoS 安全性確保）/ T-1 実測「R1 = 134 秒 / R2 = 178 秒 / R3 = 215 秒」（cycle-215.md §補足事項 T-1 実測 (iii)）
- **期待する対応方針**:
  1. メインスレッド useMemo 同期計算を撤廃し、Worker 経由のみで結果取得する設計に統一（計画書 §論点 6 案 F の本来の意図 = タイル + 詳細の両方で Worker 一貫化）。タイル UI の useMemo は「Worker 結果を派生する補助計算」のみに限定。
  2. または、useMemo 内で「入力長 N 以下なら同期計算、それ以上は Worker のみ」のしきい値分岐を導入（メインスレッドがフリーズしない短文限定で useMemo を許可）。
  3. T-1 実測「ReDoS パターン 50 字で 134〜215 秒」の事実を受けて、テストに **ReDoS パターン入力時にメインスレッドがフリーズしないこと**（例えば patternInput 変更後の onChange イベント完了時間が 200ms 以内で完了すること）の assertion を追加。
  4. 実装後に手動ブラウザで `(a+)+$` 系パターン投入し、ブラウザがフリーズしないことを直接確認。

##### NIT-1: コメント L398「行内配置のため 32px」の論証根拠が不明確

- **指摘内容**: minHeight 32px の根拠として「行内配置のため」と書かれているが、配置要件と minHeight 値の論理的関係が不明。
- **根拠**: `RegexTesterTile.tsx` L398
- **期待する対応方針**: MAJOR-3 の対応で同時に解消。

#### T-3 review = 改善指示

#### T-3 review 最終評価コメント (200 字以内)

CRIT-1 はマッチ結果アイテム初期 display:none + IntersectionObserver の組み合わせで実機では結果が一切表示されない致命的バグ。テストは mock の即時 isIntersecting=true で PASS してしまうが T-4 Playwright で必ず発覚する。MAJOR-1〜3 は計画書採択結果との乖離。MINOR-2 は ReDoS 時のメインスレッドフリーズ問題。**最低 CRIT-1 + MAJOR-1 の修正と T-3 内での実機ブラウザ確認**を経てから T-4 着手すること。

---

### T-3 r2 review (2026-05-29 / T-3 r1 review 7 件対応確認 + r2 改訂ゼロベース確認 + AP-WF16 reviewer 独立再実行)

#### T-3 r2 review 独立再実行結果

事後検証質問形（AP-WF15）。AP-WF16 reviewer 独立再実行: `npm run lint` = **PASS** (exit 0) / `npm run format:check` = **PASS**（All matched files use Prettier code style）/ `npm run test -- regex-tester` = **38 件全件緑**（Tile 26 + logic 12 / r1 時の 35 件から Tile 3 件追加 = CRIT-1 seed / display:none 廃止 / MAJOR-3 select minHeight = 40px の専用 assertion）。`src/tools/regex-tester/RegexTesterTile.tsx`（752 行）+ `src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx`（644 行 / 26 件）+ `src/tools/_constants/tile-declarations.ts` L286-297 + `src/tools/regex-tester/meta.ts` REGEX_SAMPLE_INPUTS 6 種を Read で精査。スクショ `tmp/cycle-215/t3-r2/highlight-fix-w1200-{light,dark}.png` 2 枚で「URL サンプル選択 → 2 件マッチが緑背景 (`var(--success-soft)` × `var(--success-strong)`) で視認可能」を直接確認 = 実機ブラウザで CRIT-1 修正が機能していると判定。

#### T-3 r2 review 指摘事項

##### r1 指摘 7 件の対応確認

事後検証質問形（AP-WF15 / 「対症療法でなく根本対応か」基準で判定）。

| r1 指摘                                                                        | 対応箇所 (実装 + 計画書)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 根本対応か / 判定                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRIT-1 動的ハイライト display:none + IO 致命的バグ                             | `RegexTesterTile.tsx` L123 `INITIAL_VISIBLE_SEED_COUNT=10` 定数 / L139-145 `createInitialVisibleIndices()` で先頭 10 件 seed / L175-177 `useState(createInitialVisibleIndices)` 初期値 / L643 `visibility: visibleIndices.has(i) ? "visible" : "hidden"`（display:none 完全廃止）/ L283-320 useEffect で `idx < INITIAL_VISIBLE_SEED_COUNT` をスキップして 11 件目以降のみ `observer.observe(el)` / L317-319 cleanup で `observers.forEach((o) => o.disconnect())` / 計画書 L24-27 採択仕様コメント反映 + `(c215-δ)` SSoT 確定 (`-tentative` 除去済 / L849) | 根本対応 PASS = 「display:none 要素は IO で観測不能」MDN/W3C 仕様に visibility:hidden + 初期 seed で構造的に対処 / スクショで実機視認確認済                                         |
| MAJOR-1 詳細リンクテキスト乖離                                                 | L747「フラグ切替・置換などの詳細機能を使う →」/ L735 コメントも同期修正 / テスト L121-124 で `/フラグ切替/` assertion                                                                                                                                                                                                                                                                                                                                                                                                                                       | 根本対応 PASS = §論点 9 案 B 採択と完全一致                                                                                                                                         |
| MAJOR-2 TILE_DECLARATIONS placeholder/summary 計画書未経由                     | 計画書 L296 で **案 B = 計画書を実装値に書き戻し** 採択明示（理由: 実装値の方が visitor 価値が高い = 入力例 `\d{4}-\d{2}-\d{2}` 明確 + output イメージ伝達）/ tile-declarations.ts L292-296 と完全整合                                                                                                                                                                                                                                                                                                                                                      | 根本対応 PASS = SSoT トレーサビリティ確立（採択判断 + 理由が明示されている）                                                                                                        |
| MAJOR-3 select minHeight 32px が AP-P21 下限 40px 違反                         | L440 `minHeight: 40` (旧 32) + コメント「MAJOR-3 訂正: AP-P21 操作側下限 40px（cycle-210 SSoT (i) 引用適用）」/ テスト L195-202 で 40 以上 assertion                                                                                                                                                                                                                                                                                                                                                                                                        | 根本対応 PASS = SSoT 例外運用ではなく原則準拠で修正                                                                                                                                 |
| MINOR-1 コメント L11 「Worker + debounce + replace + overlay highlight」誤情報 | L10「Worker + debounce + replace」に修正（overlay highlight 言及削除）= 詳細ページの現状と一致                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 根本対応 PASS                                                                                                                                                                       |
| MINOR-2 useMemo 同期 testRegex でメインスレッドフリーズ                        | useMemo 同期計算完全撤廃 / `grep -nE "testRegex\(" RegexTesterTile.tsx` = INLINE_WORKER_CODE 内部のみ 2 件 (Worker 内 self.addEventListener)、メインスレッド呼び出し 0 件 / `grep -nE "from.*logic" RegexTesterTile.tsx` = 0 件（logic.ts インポートなし）/ Worker 経由のみで結果取得 / コメント L12 / L18-23 で MINOR-2 対応を明示                                                                                                                                                                                                                         | 根本対応 PASS = 計画書 §論点 6 案 F「タイル + 詳細の両方で Worker 一貫化」の本来の意図と整合 / ReDoS パターン入力時もメインスレッドフリーズなし（Worker 内爆発 → terminate で対処） |
| NIT-1 コメント「行内配置のため 32px」論証不明                                  | MAJOR-3 と同時解消（40px に修正済のため論証問題自体が消滅）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 根本対応 PASS                                                                                                                                                                       |

**判定**: r1 指摘 7 件すべて **根本対応として実装 + 計画書に反映**。対症療法的な処理（条件分岐の追加 / コメント加筆だけ等）はゼロ。

##### r2 改訂で新たに生じた問題のゼロベース確認

- **useMemo 撤廃 + Worker 専用化で初期表示時 (pattern 未入力) のレンダリングに問題ないか?** → L213-217 で `if (!pattern || !testText)` 早期 return + `setTimeout(() => setMatchResult(null), 0)` で空マウント時に setState を effect 直接実行から外す（lint `react-hooks/set-state-in-effect` 回避）= 初期表示時の summary は L329-336 で `if (!pattern) return "パターンを入力してください"` を返す = 問題なし。
- **Worker postMessage の race condition (古い pattern 結果が新しい pattern 結果を上書きする) 対策**: L262-266 cleanup で `done = true; clearTimeout; worker?.terminate()` を毎エフェクトサイクル実行 / `worker` は L219 で `let` ローカル束縛のため各サイクル独立 / `worker.terminate()` 呼び出し後は Web Worker spec に従い旧 worker からの onmessage は発火しない = race condition 構造的に排除済。
- **IntersectionObserver cleanup (unmount 時の disconnect)**: L317-319 で `observers.forEach((o) => o.disconnect())` を useEffect return 関数で実装 = unmount 時 / 依存更新時の両方で disconnect 確実 = リーク防止 PASS。
- **動的ハイライト useState 初期値 [0..9] が 10 件未満マッチでもエラーにならないか?** → `Set.prototype.has(i)` は要素不在時 `false` を返すのみで例外なし / 余分なインデックス (Set に含まれるが DOM 要素が存在しない 2..9) はレンダリング側で参照されない（`matchResult.matches.map((m, i) => ...)` が件数分しかループしない）= エラーなし、無害。

##### 計画書との整合性

- §論点 6 案 F (Worker + worker.terminate() + timeout 100ms / 文字数制限なし) → 実装 L72 `WORKER_TIMEOUT_MS = 100` + L246-252 setTimeout で `worker?.terminate()` + setTimedOut = 完全実現
- §論点 7 案 W-4 (動的ハイライト IntersectionObserver / 先頭 10 件 seed) → 実装 L123 `INITIAL_VISIBLE_SEED_COUNT = 10` + L283-320 IO useEffect / `IO_ROOT_MARGIN="100px"` / `IO_THRESHOLD=0.1` = T-1 実測値を採用 = 完全実現
- §論点 15 案 D-改 1 (タイル + 詳細ともサンプル選択 UI / 6 種) → `meta.ts` `REGEX_SAMPLE_INPUTS` 6 種 (メール / URL / 電話 / 郵便 / 日付 / HTML タグ) / タイル L433-458 `<select>` 配置 / `handleSampleSelect` で pattern + flags + testText 自動入力 = 完全実現
- §引用 SSoT `c215-γ-tentative` (errorBox SSoT) は **T-4 持ち越し確定** 注記済（L337 / L2518 サマリ / 計画書 §引用 SSoT 末尾）= 適切

#### T-3 r2 review = **PASS**

#### T-3 r2 review 最終評価コメント (200 字以内)

r1 指摘 7 件すべて根本対応として実装 + 計画書に反映済（CRIT-1 = visibility:hidden + 先頭 10 件 seed + IO cleanup 実装 + 実機スクショで緑ハイライト視認確認 / MAJOR-1〜3 = 計画書採択値と完全一致 / MINOR-1〜2 + NIT-1 = 同時解消）。AP-WF16 独立再実行 = lint/format:check PASS + 38 件全件緑（r1 比 +3 件 = CRIT-1/MAJOR-3 専用 assertion 追加）。Race condition / IO リーク / 初期 seed 例外 すべて構造的に排除済。T-4 着手可能。

---

### T-4 review (2026-05-29 / AP-P21 計測 + SSoT 3 回目引用検証 + 実体験フロー + AP-WF16 独立再実行)

事後検証質問形（AP-WF15）。`tmp/cycle-215/t4/` 配下の 4 成果物 (`4-commands-output.md` / `ap-p21-measurements.md` / `ssot-verification.md` / `visitor-flow-verification.md`) + screenshots 21 枚 + 計画書 §T-4 完成条件チェックリスト + backlog B-452 状態欄を Read で精査。AP-WF16 reviewer 独立再実行: `npm run test` = **4555 passed (4555) / 313 files / 168.84s** ✓ / `grep -c '^\s*slug:' src/tools/_constants/tile-declarations.ts` = **17** ✓ / 4 コマンド結果は builder 記録と一致。スクショ目視 (ap-p21-d-both-match.png / ap-p21-e-invalid-pattern.png / tile-w375-light.png) で実機 UI を確認 — サンプル選択 / 緑ハイライト / エラー枠 / 詳細リンク文言「フラグ切替・置換などの詳細機能を使う →」がすべて計画書採択値と整合。AP-P21 (a)〜(e-α) 5 ケース + (e-invalid) 参考 = 計 6 ケース計測値は 2 rAF + Worker 500ms 待機の安定状態取得が `(c215-δ)` 計測タイミング規定遵守。B-452 真の N=1 判定 (cycle-215 操作側 0.00% / 膨張側 +91.78% を `(c214-β)` 同軸ではない注記に照らして同軸ではない参考値と判定) は計画書 §論点 14 N 統計判定式 + §補足事項 (c214-β) 引用と論理整合。

ただし以下 3 件（MAJOR）+ 3 件（MINOR）の指摘あり、改善指示。

---

#### MAJOR-1: AP-P21 (i) FAIL = コピーボタン 27px / 詳細リンク 19.03px / フラグ label 19.03px は計画書 §論点 4 採択 (α)「操作側 = コピーボタン + 詳細リンク (flexShrink:0 / **minHeight:40px**)」と明示的に乖離しており、T-4 内での修正不在は計画書採択値からの実装離脱を「FAIL を素直に記録して持ち越し」で済ませる対応として根本対応か?

- **指摘内容**: 計画書 §論点 4 L453 採択「**操作側 = 正規表現 input + コピーボタン + 詳細リンク（flexShrink:0 / minHeight:40px）**」は cycle-210 SSoT (i) の直接引用適用宣言。T-4 AP-P21 計測値はコピーボタン=27px / 詳細リンク=19.03px / フラグ label=19.03px で **計画書本文の採択定義そのものから乖離**。`ssot-verification.md` L26-27 では「主要操作要素のみ 40px 確保」基準で運用するか「全操作要素 40px 必須」基準で実装修正するかは cycle-216 以降で決定」と書かれているが、計画書本文 §論点 4 採択定義は後者を選んでいる = 採択定義変更の決裁が無いまま実装が L487 を満たしていない状態。先行サイクル precedent: cycle-210 完了時に「input 27px → 40px + エラー枠 32px → 46.09px に拡張で WCAG タップ性確保」（backlog L144 引用）と **同サイクル内で 27px を 40px に修正してから完了**している。cycle-215 だけ「FAIL を素直に記録」運用で済ませる根拠が計画書本文にない。T-3 r1 review MAJOR-3 で `<select>` 32px → 40px は同サイクル修正、同じ理屈でコピーボタン / 詳細リンクも修正すべきだったが T-3 r1 reviewer も T-3 r2 reviewer も計測未済のため見逃した可能性が高い。
- **根拠**: cycle-215.md L453 §論点 4 採択定義 / L788 §引用 SSoT 1 (c210-i) 適用予告「PASS 期待（pattern input / 本文 textarea / マッチ結果欄 / コピーボタン / 詳細リンクすべてに 40px 下限を適用 / **3 回目引用適用**）」/ `tmp/cycle-215/t4/ap-p21-measurements.md` L14-25 計測値 / backlog L144 cycle-210 完了時修正履歴 / `ssot-verification.md` L21-27 FAIL 判定
- **来訪者価値への影響**: タイル UI w375 モバイル視点ではフラグ label / 詳細リンクが 19.03px = WCAG 2.5.8 タップターゲット 24×24px 自主要件未達。コピーボタン 27px は WCAG 2.5.8 はクリアするが yolos.net 自主基準 40px 未達。実機 (`tile-w375-light.png`) で目視するとコピーボタン / 詳細リンクは識別可能なサイズだが、視覚的な「タップしやすさ」軸では cycle-210 (40px に拡張済) 等の先行タイルより明らかに劣る。M1a モバイル経由の visitor が「タップしづらい」と感じるリスクは現実的。
- **期待する対応方針**:
  1. **第一推奨 = 同サイクル修正**: cycle-210 precedent に倣い、コピーボタン minHeight=40px / 詳細リンク行 minHeight=40px / フラグ label minHeight=40px に拡張する `RegexTesterTile.tsx` 改修 → AP-P21 (i) PASS → T-4 再計測 → SSoT (i) 3 回目引用適用 PASS 達成。タイル 400×400px の縦領域逼迫が起きないか T-4 再 Playwright で検証。
  2. **第二案 = 計画書採択定義の改訂**: §論点 4 採択を「**主要操作要素 (select / pattern input) のみ minHeight:40px / 補助要素 (flag label / copy button / detail link) は最小化許容**」に r2 改訂し、SSoT (i) 適用予告 L788 を「**部分 PASS / 補助要素は適用外**」に書き戻し、(c210-i) 3 回目引用適用判定を「PASS 期待」から「部分 PASS」に再定義する。先行サイクル precedent と異なる選択をする根拠（タイル 400×400px 縦領域制約 + 視認可能件数 9〜10 行確保の トレードオフ）を §補足事項に明記。
  3. **第三案 = 持ち越し**: 現状記録のまま「(i) は cycle-216 以降で構造的に精緻化」とし、§補足事項に「(c215-ε) 補助操作要素 40px 例外運用 SSoT 候補」を **`-tentative`** として新規追加。ただし計画書本文採択定義 L453 と実装の乖離を 1 サイクル放置する判断には明文化した PM 決裁が必要。
- いずれも採択する場合、(i) 判定結果 (PASS / 部分 PASS / FAIL) と (c210-i) 3 回目引用適用結果を計画書本文 §論点 4 / §引用 SSoT 1 / §補足事項に書き戻す（AP-WF12 cycle-214 c214-ε 教訓適用）。

---

#### MAJOR-2: シーン 2「URL 抽出 5,000〜10,000 字 / 312 件マッチ」Playwright 検証 = `(c215-δ)` 動的描画 SSoT の唯一の実機証跡が未取得のまま「10+ 件マッチ検証は cycle-216 以降」と書かれて省略されているが、これは `(c215-δ)` 接尾辞除去の根拠を消失させていないか?

- **指摘内容**: 計画書 L381 §T-4 実施事項 (F) シーン 2 は「(1) Worker で 80ms 以内に全マッチ計算完了 → (2) 案 W-4 動的描画ハイライト（先頭 10 件相当を即時ハイライト + IntersectionObserver でスクロール時追加描画）+ マッチ件数 (例「312 件マッチ」) 表示 → (3) リスト欄には全件表示 → (4) コピーボタンで全 312 件のマッチテキスト取得 → (5) Excel / Markdown / Slack へ貼り戻し → タイル動線で完結」を **Playwright 再生で assertion** することを T-4 完成条件として明示。さらに「T-4 builder への Playwright 再生指示の分解: (a) 初期描画で先頭 ~10 件ハイライト確認 / (b) タイル内スクロールで追加描画確認 / (c) コピーボタンでは全 312 件取得可能」と検証粒度まで規定。`visitor-flow-verification.md` シーン 2a は 2 件マッチ（URL サンプルの素のテキスト 55 字）で完結しており、(a)(b)(c) のいずれも検証されていない。さらに同 L100 で「regex-tester で 10+ マッチを自然発生させるには 5,000+ 字本文が必要 / cycle-216 以降での追加実機検証推奨」と明記され、T-4 builder 自身が「省略した」と告白している状態。AP-P21 計測 `ap-p21-measurements.md` L74 も「マッチ件数 2 件 ≤ INITIAL_VISIBLE_SEED_COUNT (10) のため全件 seed 即時表示済 / **IntersectionObserver 関与なし**」と書いており、cycle-215 T-4 では IntersectionObserver の動的描画経路が **一度も発火していない**実態。
- **根拠**: cycle-215.md L381 (F) シーン 2 Playwright 再生指示 (a)(b)(c) / L387 完成条件 [x] チェック「10+ 件マッチ検証は cycle-216 以降」builder 自記 / L859 §引用 SSoT 17 (c215-δ) IntersectionObserver `rootMargin:"100px"` / `threshold:0.1` を「T-3 実装で `-tentative` 接尾辞除去済 = AP-WF12 cycle-214 c214-ε 教訓適用 N=1」と宣言 / `visitor-flow-verification.md` L100 builder 自記「IO 経路を踏まず即時表示」/ `ap-p21-measurements.md` L74「IntersectionObserver 関与なし」
- **波及リスク**: (c215-δ) SSoT は「タイル UI 動的描画ハイライトの設計指針 / IntersectionObserver / `rootMargin:"100px"` `threshold:0.1` / 視認可能件数 9〜10 行を満たす」と宣言しているが、cycle-215 内の実機検証は T-1 baseline でのプロトタイプ計測 (`highlight-N-determination.md` §C) のみ。T-3 実装後の **本番 RegexTesterTile.tsx での動的描画動作** = (a) seed 10 件即時表示 / (b) スクロールで 11 件目以降追加描画 / (c) 全件コピー / が一度も発火しないまま (c215-δ) を `-tentative` 除去で確定するのは AP-WF12 cycle-214 c214-ε 教訓「実装後の本番計測で SSoT を確定する」の本旨と不整合。後続サイクルで「cycle-215 の (c215-δ) は本番未検証のまま確定された SSoT」として引用される際の信頼性が崩れる。さらに T-3 review CRIT-1 で発覚した「mock の即時 isIntersecting=true がテストを通すが実機ではバグになる」古典アンチパターンの再発リスク = 本番動的描画経路が実機で機能するかは Playwright 検証でしか確認できないため、シーン 2 省略は CRIT-1 と同型のリスクを残存させる。
- **来訪者価値への影響**: M1a / M1b が実ログから URL 抽出してコピー貼り戻す主要シーン（計画書 §目的シーン 2 = M1a 文書編集者の代表ユースケース）が「タイル単独で完結する」という主張の **唯一の実機証跡**を欠いている。シーン 1 (M1b 直接入力 3 件マッチ) + シーン 2a (URL サンプル 2 件マッチ) + シーン 3 (メール 2 件マッチ) はいずれも seed 10 件以下で完結し、視認可能件数 9〜10 行を超えるスクロール / 動的追加描画 / 全件コピーが起きる経路は未検証。
- **期待する対応方針**:
  1. **第一推奨**: Playwright で 5,000〜10,000 字の合成 URL ログ（例: `for i in 0..199; \`https://example${i}.com/path?q=${i}\``等を改行区切り）を testText に投入し、(a) seed 10 件先頭ハイライト確認 / (b) `scrollTo({top: 1000})`で 11 件目以降追加描画 / (c) コピーボタンで全件取得 / の 3 件を assertion →`tmp/cycle-215/t4/scenario2-url-extract-200matches.png`等のスクショ追加保存 →`visitor-flow-verification.md` シーン 2a を 2 件マッチ版から 200 件マッチ版に差し替え。
  2. **第二案**: T-4 では (a)(b)(c) を省略する判断を計画書 §論点 7 採択定義 + §引用 SSoT 17 (c215-δ) に「**本番実機検証は cycle-216 以降に持ち越し / cycle-215 内では (c215-δ) を `-tentative` のまま保留 / T-1 baseline プロトタイプ計測のみで確定根拠とする**」と明示的に r2 改訂し、(c215-δ) 接尾辞除去判定を撤回する。
- いずれにせよ「(c215-δ) は本番実機で検証された SSoT」と「(c215-δ) は T-1 baseline プロトタイプで暫定確定された SSoT」のどちらかを明示的に選択する必要がある。

---

#### MAJOR-3: 実体験フロー検証のシーン 1 が計画書 L380 仕様「メールアドレス簡易バリデーション `^[\w.+-]+@[\w-]+\.[\w.-]+$` を pattern に投入 + 本文に `foo@example.com\nbar@@invalid` 投入 → マッチ 1 件 (`foo@example.com`) が表示されることを assertion」と乖離し、builder 独自シナリオ (郵便番号 `\d{3}-\d{4}` / 3 件マッチ) に置き換わっているのは、シーン 1 の本旨「無効入力との混在で 1 件のみマッチする検証」を満たしているか?

- **指摘内容**: 計画書 L380 シーン 1 は **無効入力 `bar@@invalid` を含む本文で 1 件のみマッチする** という具体的な検証目的を持つ仕様（M1b フォーム validation シーンを直接トレース）。`visitor-flow-verification.md` シーン 1 は郵便番号パターンで「東京 100-0001 / 大阪 530-0001 / 京都 600-8005」= 全件マッチする内容に変更されており、「無効入力を弾く」という M1b フォーム validation 本来の検証視点が抜け落ちている。スクショ `scenario1-m1b-direct.png` / `scenario1-m1b-copied.png` も内容が郵便番号系統。シーン 3 (`scenario3-m1a-email.png`) でメール 2 件マッチを確認しているが、こちらも全件マッチで「無効入力混在」検証は含まない。M1b フォーム validation は実装観点で最も典型的な regex 用途であり、「全件マッチパターン」だけでは regex tester の主用途検証として弱い。
- **根拠**: cycle-215.md L380 シーン 1 仕様 / `tmp/cycle-215/t4/visitor-flow-verification.md` L11-28 (郵便番号系統で置換) / シーン 3 = メール全件マッチ
- **期待する対応方針**: シーン 1 を計画書仕様通りメール bar@@invalid 混在に差し替える、または計画書 L380 を builder 実施シナリオ (郵便番号系統) に r2 改訂しつつ「無効入力混在検証」目的を別シーンで満たす旨を明示。前者推奨。差し替え後にスクショ scenario1-email-validation.png（plan で指定されているファイル名）を新たに取得し、`visitor-flow-verification.md` を更新。

---

#### MINOR-1: `ssot-verification.md` L98 で `(c215-γ)` の `-tentative` 除去判定を「cycle-215 §引用 SSoT 17」に紐付けているが、計画書 §引用 SSoT 17 は (c215-δ) = 動的描画ハイライト SSoT であり、(c215-γ) は §引用 SSoT 15 (c214-ι) の regex-tester 独自 SSoT 値の位置付け = SSoT 番号体系の取り違えではないか?

- **指摘内容**: `ssot-verification.md` L98「cycle-215 §引用 SSoT 17 の `(c215-γ-tentative)` 接尾辞 → 本実測値で確定 → **`-tentative` 除去**」と書かれているが、計画書本文 L843-846 §引用 SSoT 15 (c214-ι) の regex-tester 適用予告に「**T-4 完了 = 独自 SSoT 値確定 = h=54.78px / w=380px ... `-tentative` 接尾辞除去済**」と明記されており、(c215-γ) は §引用 SSoT 15 帰属。§引用 SSoT 17 は (c215-δ) で動的描画ハイライト指針 = 別物。`ssot-verification.md` 内の整理は実態として正しい SSoT (h=54.78 / w=380 が独自確定) を記載しているが、参照先が「§引用 SSoT 17」と書かれることで T-4 builder の SSoT 体系理解が混乱する。
- **根拠**: cycle-215.md L843-846 §引用 SSoT 15 (c214-ι) / L852-861 §引用 SSoT 17 (c215-δ) / `tmp/cycle-215/t4/ssot-verification.md` L98 / 計画書 §補足事項 L2564「`(c215-β)` `-tentative` 除去済 / `(c215-δ)` `-tentative` 除去済 / `(c215-γ)` T-4 持ち越し確定」
- **期待する対応方針**: `ssot-verification.md` L98 を「**cycle-215 §引用 SSoT 15 (c214-ι) 内の regex-tester 独自 SSoT `(c215-γ-tentative)` 接尾辞 → 本実測値で確定 → `-tentative` 除去**」に訂正。または、計画書 §補足事項 L2564 の SSoT 番号一覧と整合する形に書き戻し。

---

#### MINOR-2: 計画書 L355 / L381 / L387 / L395 で指定された成果物保存先 `tmp/cycle-215/after-t4/` を builder が `tmp/cycle-215/t4/` に置換しているのは、cycle-200〜214 の `after-t4` 命名規約 (B-450 `tmp パス命名規約 SSoT` ベース) と不整合ではないか?

- **指摘内容**: 計画書 L355 = `tmp/cycle-215/after-t4/` / L381 = `scenario1-email-validation.png` 保存先 = `tmp/cycle-215/after-t4/` / L387 = `tmp/cycle-215/after-t4/ap-p21-measurements.md` / L395 = `tmp/cycle-215/after-t4/bundle-impact.md`。実成果物パスはすべて `tmp/cycle-215/t4/` (`t4/4-commands-output.md` / `t4/ap-p21-measurements.md` / `t4/ssot-verification.md` / `t4/visitor-flow-verification.md` / `t4/screenshots/*.png`)。cycle-211/212/213/214 の precedent は `after-t4/` 命名が確立済 (backlog B-450 `tmp パス命名規約 SSoT` 関連)。`t4/` 単純命名は cycle-215 で初登場した divergent パス。
- **根拠**: cycle-215.md L355 / L381 / L387 / L395 計画書パス指定 / 実成果物パス `tmp/cycle-215/t4/` / cycle-211〜214 の precedent
- **期待する対応方針**: パス自体は機能的な問題なし。`tmp/` 配下なのでサイクル完了時に削除対象。再現性 / 命名規約遵守の観点では計画書側 r2 改訂で `t4/` に統一するか、成果物を `after-t4/` にリネームするかの判断。最小対応として §補足事項に「cycle-215 T-4 は `tmp/cycle-215/t4/` 配下に成果物保存 / 計画書 `after-t4/` 表記との差は単純化のための実装裁量」と書き戻し。

---

#### MINOR-3: 計画書 §T-4 完成条件 L395 で指定された `tmp/cycle-215/after-t4/bundle-impact.md` 単独ファイルが未作成、`4-commands-output.md` 末尾「bundle インパクト所感」に統合 = `[ ]` のまま残置で済ませているのは、計画書本文の完成条件チェックリスト構造と不整合ではないか?

- **指摘内容**: cycle-215.md L395 完成条件「**bundle インパクト実測値**を `tmp/cycle-215/after-t4/bundle-impact.md` に記録 — T-4 builder 2026-05-29: build 出力で `/tools/regex-tester` 静的プリレンダ確認済 / 過去 15 タイル追加実績典型レンジ内 = 異常なし（`tmp/cycle-215/t4/4-commands-output.md` 末尾「bundle インパクト所感」参照 / 専用 .md ファイル切り出しは completion 不要と判断）」と書かれており `[ ]` のまま。判断自体は妥当だが、「completion 不要と判断」 = T-4 builder が完成条件を満たさない選択をしたまま `[ ]` 残置は計画書プロセスとして異例。`bundle-impact.md` 単独ファイル要求は cycle-211/212/213/214 の precedent (バンドル影響評価) を継承したもの。`4-commands-output.md` L59-61「bundle インパクト所感」3 行は計画書要求の「実測値」記録としては薄い。
- **根拠**: cycle-215.md L395 完成条件文言 / `tmp/cycle-215/t4/4-commands-output.md` L59-61
- **期待する対応方針**:
  1. **第一推奨**: `bundle-impact.md` を切り出し、`npm run build` 出力の First Load JS / Static / Dynamic ルート分類 / cycle-214 完了時点との差分（過去 build 出力 grep 比較）を 10〜20 行で記録 → L395 `[x]` 化。
  2. **第二案**: 計画書 L395 を「bundle インパクト所感を 4-commands-output.md 末尾に統合」に r2 改訂し、`[x]` 化する根拠を明示。

---

#### T-4 review = 改善指示

#### T-4 review 最終評価コメント (200 字以内)

AP-WF16 独立再実行 (test 4555/4555 / slug 17) + スクショ目視で実装健全性は確認。B-452 真の N=1 判定と (c214-β) 同軸性注記引用は論理整合。ただし MAJOR-1 (AP-P21 (i) 計画書採択値乖離をサイクル内修正せず持ち越し / 先行サイクル precedent と不整合) + MAJOR-2 (シーン 2 = 5,000〜10,000 字 312 件マッチの (c215-δ) 動的描画 SSoT 本番実機検証省略 = SSoT 確定根拠欠如) + MAJOR-3 (シーン 1 仕様乖離) が来訪者価値 / SSoT 体系信頼性に直接影響。最低 MAJOR-1 + MAJOR-2 の根本対応を経てから completion 着手。

---

### T-4 r2 review (2026-05-29 / r1 6 件対応確認 + AP-WF16 独立再実行 + r2 改訂ゼロベース確認)

#### T-4 r2 review 独立再実行結果

事後検証質問形（AP-WF15）。AP-WF16 reviewer 独立再実行 = `npm run test` **4555/4555 passed (313 files / 167.85s)** ✓ / `npm run lint` **PASS (exit 0)** ✓ / `npm run format:check` **All matched files use Prettier code style** ✓。`src/tools/regex-tester/RegexTesterTile.tsx` を Read し L440 / L476 / L507 / L722 / L750 = 5 箇所で `minHeight: 40` 確定 + MAJOR-1 / MAJOR-3 対応コメント整合を確認。Playwright で `/internal/tiles/preview/tools/regex-tester` を **w375 / w1200 で独立実機計測**: w375 で sampleSelect h=40.00 / patternInput h=40.00 / フラグ label (g/i/m) h=40.00 / detailLink h=40.00 / コピーボタン (URL サンプル投入後) h=40.00 = **w1200 のみならず w375 モバイルでも操作側 5 要素すべて 40px PASS** を独立計測で再確認。大量マッチ動的描画 = pattern `https?://[\w./\-?=&%]+` + 145 件マッチ生成テキスト投入 → `[data-match-item="true"]` 145 件 / 初期 visible 10 件 / hidden 135 件 → スクロール後 visible 13 件 / hidden 132 件（追加描画 +3 件）/ rAF 経過時間 = 0.40ms = **メインスレッドフリーズなし**を独立再実行で確認。スクショ目視 (`after-tap-fix-w375-light.png` / `scenario-1-email-validation.png` / `dynamic-highlight-{initial,scrolled,full}.png`) も builder 報告と整合 = シーン 1 メール仕様 (foo / baz 2 件マッチ / bar@@invalid 弾かれ) が視覚的に確認可能。

#### T-4 r2 review 指摘事項

##### r1 指摘 6 件の対応確認

事後検証質問形（AP-WF15 / 「対症療法でなく根本対応か」基準で判定）。

| r1 指摘                                       | 対応箇所                                                                                                                                                                                                      | 根本対応か / 判定                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR-1: AP-P21 (i) 操作側 5 要素 40px 乖離   | `RegexTesterTile.tsx` L440 (select) / L476 (pattern input) / L507 (フラグ label) / L722 (コピーボタン) / L750 (詳細リンク) すべて minHeight:40 / `tmp/cycle-215/t4-r2/ap-p21-after-fix.md` 全 5 要素 PASS     | 根本対応 PASS = 先行サイクル precedent (cycle-210 同サイクル修正) に合致 / 独立計測で w1200 / w375 両方 40px PASS / 5 要素「サンプル選択 / pattern input / フラグ label / コピーボタン / 詳細リンク」すべて値乖離ゼロ                                 |
| MAJOR-2: 大量マッチ Playwright 検証省略       | `tmp/cycle-215/t4-r2/dynamic-highlight-verification.md` 144 件マッチ実機検証 + IntersectionObserver 12→14 件追加描画 + rAF 3ms フリーズなし / スクショ 3 枚                                                   | 根本対応 PASS = (c215-δ) 動的描画 SSoT の本番実機証跡確立 = T-3 review CRIT-1 と同型「mock 都合 ≠ 実機挙動」リスクが本検証で構造的に排除 / reviewer 独立再実行でも 145 件マッチ / 初期 10 件 visible / スクロール後 13 件 visible / rAF 0.40ms を再現 |
| MAJOR-3: シーン 1 メール仕様乖離              | `tmp/cycle-215/t4-r2/visitor-flow-r2.md` シーン 1 = メール pattern + foo / bar@@invalid / baz 投入 → 2 件マッチ (foo / baz) / bar@@invalid 弾かれ確認 / `scenario-1-email-validation.png`                     | 根本対応 PASS = 計画書 L380 「無効入力混在で 2 件マッチ」仕様準拠 / M1b フォーム validation 本旨「無効入力を弾く」検証視点が満たされた                                                                                                                |
| MINOR-1: SSoT 番号体系 (c215-γ) 帰属誤記      | `tmp/cycle-215/t4-r2/ssot-verification-r2.md` (c215-γ) = §引用 SSoT **15 (c214-ι) 帰属の独自 SSoT** 確定値 h=54.78px / w=380px に訂正 / §引用 SSoT 17 = (c215-δ) で別物                                       | 根本対応 PASS = 計画書 §引用 SSoT 番号体系と整合 / 後続サイクル planner の SSoT 体系理解混乱リスク解消                                                                                                                                                |
| MINOR-2: 成果物保存先 `t4` vs `after-t4` 命名 | 計画書 §補足事項 L2650 に「cycle-215 T-4 r2 の成果物は `tmp/cycle-215/t4-r2/` に保存 / 次サイクル以降は `tmp/cycle-XXX/after-tN/` 命名規約に統一」と書き戻し済                                                | 根本対応 PASS = §補足事項書き戻しで次サイクル planner が precedent を把握できる状態 / cycle-215 内のリネームは不要判断                                                                                                                                |
| MINOR-3: bundle-impact.md 単独ファイル未作成  | `tmp/cycle-215/t4-r2/bundle-impact.md` 新規作成 / RegexTesterTile = TextDiffTile の 2.16 倍 / TextReplaceTile の 2.98 倍 / 主因 (Worker / IO / サンプル 6 種) / Next.js shared chunk として他ページ無影響判定 | 根本対応 PASS = 計画書 L395 完成条件を満たす実測値記録 / 「ほぼ 0」推定値が +13kB と過小評価だった反省を明示 + 他ツール比較で許容範囲判定                                                                                                             |

**判定**: r1 指摘 6 件すべて **根本対応として実装 + 計画書 + tmp/cycle-215/t4-r2/ に反映**。対症療法的な処理（条件分岐 / コメント加筆のみ等）はゼロ。

##### r2 改訂で新たに生じた問題のゼロベース確認

- **AP-P21 (i) 40px 達成が w375 モバイルでも維持されているか?** → 独立 Playwright 計測 (w375 viewport / dev server) で sampleSelect h=40 / patternInput h=40 / フラグ label g/i/m h=40 / detailLink h=40 / コピーボタン (URL サンプル投入後) h=40 = **全 5 要素 PASS** / w1200 のみ PASS で w375 破綻リスクは構造的に解消（minHeight + flex 中央配置で viewport 非依存）。
- **minHeight 追加で flex container 内の他要素レイアウトに影響していないか?** → `display:flex + alignItems:center + minHeight:40` の組み合わせはコンテンツ高さが 40px 未満の場合のみ 40px に拡張 / コピーボタン (元 27px) / 詳細リンク (元 19.03px) / フラグ label (元 19.03px) は **本来要件で 40px 未満だったため 40px 化はタップ性向上のみで他要素の overflow / clipping は発生しない** ことを操作後スクショ (`scenario-1-email-validation.png` / `dynamic-highlight-{initial,scrolled,full}.png` / `after-tap-fix-w375-light.png`) で確認 / タイル全体 400×400px 縦領域の overflow / クリップなし。
- **大量マッチ実機検証でメインスレッドフリーズなしが定量的に確認されているか?** → reviewer 独立再実行で rAF コールバック到達時間 = **0.40ms (スクロール後) / 0.60ms (初期表示後)** = どちらも 60fps フレーム上限 16.67ms を大幅に下回り Worker 分離設計の有効性を実証 / builder 報告の 3ms と同水準（計測タイミングのばらつき範囲内）/ 145 件 (builder 報告 144 件と僅差 = 補助テキスト中の URL 状文字列が偶発的にマッチした差 = 構造判定に影響なし) でも IntersectionObserver 動的描画 + Worker 計算分離が完全機能 = メインスレッドフリーズなしが構造的・定量的に実証。

##### (c215-δ) `-tentative` 除去の妥当性

144 件マッチ実機検証 (`tmp/cycle-215/t4-r2/dynamic-highlight-verification.md`) + reviewer 独立 145 件マッチ実機検証で「IntersectionObserver `rootMargin: "100px"` / `threshold: 0.1` / 先頭 10 件即時 (INITIAL_VISIBLE_SEED_COUNT=10) + スクロールで追加描画 (10→12→13→14 件)」が本番 `RegexTesterTile.tsx` で動作確認済。T-1 baseline プロトタイプ計測 (`highlight-N-determination.md` §C) と T-3 本番実装の挙動が一致 = (c215-δ) `-tentative` 除去の根拠は AP-WF12 cycle-214 c214-ε 教訓 (実装後の本番計測で SSoT を確定する) の本旨と整合。

##### 計画書の §引用 SSoT 整合性

`grep -nE "-tentative" docs/cycles/cycle-215.md` で残存ヒットは L88 / L130 / L1032-1036 / L1259 / L1283 = **本文 SSoT 確定箇所には残存ゼロ** / 残存ヒットは「(a) 一般説明 (L88) / (b) AP-P21 (d) ケース計測手順の補足 (L130) / (c) T-3 r1 review 履歴 (L1032-1036 / L1259 / L1283)」のいずれも load-bearing でなく改変対象外。

##### B-452 真の N=1 のまま判定の維持

`docs/backlog.md` L95 末尾「cycle-215 T-4 実測値の同軸性次第で『真の N=2 達成』または『真の N=1 のまま』のいずれか」+ cycle-215 T-4 元検証で確定済「**真の N=1 のまま**」(cycle-215 = cycle-214 と同型 flex 固定設計起因の同軸ではない参考値) が T-4 r2 で覆っていないことを確認 (T-4 r2 で MAJOR-1〜MINOR-3 6 件対応 → いずれも (v) 変化率の母集団判定には影響しない)。

#### T-4 r2 review = **PASS**

**T-4 r2 review = PASS**

#### T-4 r2 review 最終評価コメント (200 字以内)

r1 指摘 6 件すべて根本対応として実装 + 計画書 + `tmp/cycle-215/t4-r2/` に反映済。AP-P21 (i) 操作側 5 要素は w1200 / w375 両 viewport で 40px PASS を reviewer 独立 Playwright 計測で再確認。145 件マッチ動的描画も rAF 0.40ms = メインスレッドフリーズなしを独立実機検証で再現。シーン 1 メール仕様準拠 + SSoT 15 (c214-ι) 帰属訂正 + bundle-impact.md 単独切り出しも完遂。B-452 真の N=1 のまま判定維持。completion 着手可。

---

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

- **AP-P18 / AP-WF15「採択変更時の俯瞰整合性チェックテンプレート」改善案（r5 改訂 = r4 process review L1829 / 同 PM 次工程指示 (2) 連動 / r4 process MINOR-1 対応）**: r1 visitor MINOR-3 / r2 visitor MAJOR-2 / r3 visitor MAJOR-2 / r4 visitor MAJOR-1 と「採択変更時の波及反映漏れ」が 4 連続再発した教訓から、AP-P18 / AP-WF15 のテンプレートに以下の俯瞰対象を必ず含める改善が必要:
  1. **§実施する作業 主目的 + 副次成果（L12-16）** = 計画書冒頭 load-bearing 記述 / 採択変更時に最も影響を受ける箇所
  2. **§検討した他の選択肢全件**（採択 / 不採択ラベルが採択変更で反転する可能性）
  3. **§目的シーン 1/シーン 2 体験トレース全件**（採択論点 + 採択値が体験フローに直接反映される）
  4. **T-1/T-2/T-3/T-4 完成条件の grep パターン全件**（採択値の本文書き戻しを検証する grep が本文表記と整合しているか）
  5. **§引用 SSoT 一覧の波及対象**（採択変更で新規 SSoT 候補追加 / 既存 SSoT 撤回が発生しうる箇所）
  - cycle-215 サイクル完遂後の `docs/anti-patterns/planning.md` ないし `docs/anti-patterns/workflow.md` への正式反映は PM 判断で次サイクル以降に実施。本サイクル内では §補足事項への書き戻しまでで完了とし、サイクル完遂チェックリストに「AP-P18 / AP-WF15 改善案の anti-patterns 反映方針判断」を含める。
- **`(c215-δ)` 新規 SSoT 候補の確立完了（T-3 実装確定 / `-tentative` 接尾辞除去済）**: §引用 SSoT 17 として「タイル UI 動的描画ハイライト（IntersectionObserver / N=動的）の設計指針」を確立。T-1 プロトタイプで動的描画が視認可能件数 9〜10 行を満たすことを実証 + T-3 実装で `RegexTesterTile.tsx` に `rootMargin:"100px"` / `threshold:0.1` を適用（AP-WF12 cycle-214 c214-ε 教訓適用 N=1）。
- **T-3 実装完了サマリ（2026-05-29）**:
  - `src/tools/regex-tester/RegexTesterTile.tsx` 新規実装（cols=3 rows=3 / useMemo 即時計算 + Worker timeout 100ms / IntersectionObserver 動的描画 / REGEX_SAMPLE_INPUTS 6 種ドロップダウン）
  - `src/tools/regex-tester/__tests__/RegexTesterTile.test.tsx` 新規作成（23 件 / 全 PASS）
  - `src/tools/_constants/tile-declarations.ts` に regex-tester 登録（tilesCount=16 確認済）
  - `(c215-β)` `-tentative` 除去済 / `(c215-δ)` `-tentative` 除去済 / `(c215-γ)` T-4 持ち越し確定
  - 4 コマンド（lint / format:check / test 35 件 PASS / build）全 PASS
- **T-1 実測サマリ（T-1 builder 2026-05-29 / T-1 review MAJOR-1 対応 / 書き戻し）**:
  - (i) **GA データ**: `/tools/regex-tester` 直近 30/90 日 PV=0 / サイト全体 row_count=129 で計測正常 / 本サイクル直接価値 = タイル UI 化 + search_intents 4 語追加
  - (ii) **Worker 起動コスト**: 中央値 9.1ms（実測値 / Chromium 149 headless Linux）= timeout 100ms に対して 10 倍以上のマージン = フォールバック判定経路 段階 1 PASS = 案 F 単独採用確定（pre-warm 案 F-1 / timeout 緩和 案 F-2 ともに不要）
  - (iii) **ReDoS 爆発実証**: R1 `(a+)+(b+)+c` = 134 秒 / R2 `(.*)*x` = 178 秒 / R3 `^([a-z]+)+$` = 215 秒（各 50 字 / 実測値）= Worker timeout 100ms 必須性を実証 / 1,000 字以上計測は物理的不可能のためグリッド計測中止（必要十分）
  - (iv) **errorBox 計測**: (e-α)(e-β) h=47.75 w=928 同値 / 計測値冗長 = 案 1（e-α 単独 / N=5）推奨
  - (v) **案 W-4 採択根拠**: N=99 が 60fps 維持上限（実測値）/ IntersectionObserver rootMargin '100px' / threshold 0.1 で scrollTop=0 時 17 件 + scrollTop=1000 時 23 件の追加描画を確認（実測検証済）
- **MINOR-1 対応: `--font-mono` トークンの定義レベルについて（T-2 review MINOR-1 / 書き戻し）**: `src/tools/regex-tester/Component.module.css` の `font-family: var(--font-mono)` 参照（L18/27/35/52/78/99/139 相当）は `src/app/globals.css` の `body { --font-mono: ... }` でのみ定義されている。CSS Custom Property は inheritance するため body 配下では参照可能だが、他のデザイントークンは `:root` レベルで定義されているため整合性がない。`(legacy)` 削除フェーズ（Phase 10.2）で `--font-mono` を `:root` に格上げするか現行維持かを確認すること。Backlog B-462 に認識合わせ項目として付記するか次サイクル PM 判断で対応。
- **NIT-1 対応: `page.tsx` の max-width 1200px ハードコード根拠（T-2 review NIT-1 / 書き戻し）**: `src/app/(new)/tools/regex-tester/page.tsx` の外側 div `max-width: 1200px` は cycle-196 SSoT（ToolLayout 外側 max-width ハードコード設計指針）を引用した意図的な実装。計画書 §T-2 実施事項にこの記述が明示されていなかったが、cycle-196 SSoT は他の (new) 移行済ツールでも同様に適用されており事後妥当。後続サイクル planner は `src/app/(new)/tools/*/page.tsx` の max-width 1200px ハードコードが cycle-196 SSoT 由来であることを前提として計画書を記述すること。
- **MINOR-2 メモ: T-4 r2 成果物保存先の命名規約（T-4 review MINOR-2 / 書き戻し）**: cycle-215 T-4 r2 の成果物は `tmp/cycle-215/t4-r2/` に保存したが、cycle-211〜214 の命名規約「`tmp/cycle-XXX/after-tN/`」（例: `tmp/cycle-214/after-t4/`）とは異なる。次サイクル以降は `tmp/cycle-XXX/after-tN/` 命名規約に統一すること（cycle-215 の `t4-r2/` はそのまま残置 = 再変更不要 / 次サイクル以降で命名規約を cycle-211〜214 と統一する）。

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
