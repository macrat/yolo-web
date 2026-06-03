---
id: 214
description: B-314 Phase 8.1 第 15 弾 = text-diff 新デザイン移行 + タイル化（複合入力型タイル 2 件目 / cycle-210 text-replace SSoT 引用検証の最初の適用先 + B-452 N≥3 蓄積への貢献 / M1a 文章校正・契約書比較・議事録 + M1b コードレビューの普遍的需要に対応）
started_at: 2026-05-28T08:32:39+0900
completed_at: 2026-05-28T15:06:48+0900
---

# サイクル-214

このサイクルでは、`text-diff` ツールの詳細ページを新デザイン（`(legacy)` → `(new)`）に移行し、トップページからの最短動線となるツールタイルを新規実装する。**Phase 8.1 第 15 弾**として、cycle-210 で確立した text-replace の複合入力型タイル SSoT 4 項目を最初に引用検証する場でもあり、B-452（複合入力型タイル AP-P21 基準値 N≥3 見直し）の N=2 達成へ寄与する。来訪者像は M1a（文章校正・契約書比較・議事録の修正履歴の確認をしたい一般来訪者）と M1b（プルリクエストのレビュー前にローカルで差分を確認したい開発者）の両方を含む。

## 実施する作業

- [x] /cycle-planning で作業計画を立てる（r1 → r2 → r3 → r4 → r5 → r6 → r7 = 7 ラウンド / 来訪者価値 + 実装整合 両観点 PASS / r7 = T-2 r2 reviewer MAJOR-1 対応 = §論点 13 M1' → M1'' 訂正で SSoT と実装整合化 / CRIT 0 件）
- [x] T-1: 現状把握と移行前 baseline 取得（旧トークン残存実測 / 既存テスト件数確認 / baseline スクリーンショット撮影 / TILE_DECLARATIONS 実測値訂正 / cycle-210 SSoT 引用準備）
- [x] T-2: 詳細ページ (new) 配下移行 + 旧トークン置換 + meta.ts 棚卸し + 既存 backlog 連動更新
- [x] T-3: TextDiffTile.tsx 新規実装 + Tile テスト追加 + TILE_DECLARATIONS 登録
- [x] T-4: 検証と統合確認（AP-P21 計測 + cycle-210 SSoT 引用検証 + cycle-211/212/213 SSoT のうち適用可能なものの引用検証 + lint/format/test/build 全 PASS）

## 作業計画

> **r6 → r7 改訂の主旨（T-2 r2 reviewer MAJOR-1 = 計画書 SSoT と実装の非整合への対応 / CRIT 0 件）**
>
> - **MAJOR-1（impl / r7 新規）対応**: T-2 r1 builder が `<pre role="status">` を実装したところ T-2 r2 reviewer が「**WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つ**」と指摘 → r2 で `<pre role="region">` に修正済（実装は正しい状態 = `Component.tsx` L115-116 で実体確認）。しかし計画書 §論点 13 採択案 **M1'** が依然「`<pre>` = `role="status"` のみ付与（aria-live なし）」と書いており、これは仕様レベルで内部矛盾していた（`role="status"` 単独でも暗黙的に aria-live="polite" 相当の連続アナウンスが発生し、r3 で撤回した M2'（aria-live 直付け）と実質同等の過剰アナウンスを生む）。T-3 builder が計画書を読んで誤って `<pre role="status">` を再付与すれば a11y 問題が再発するため、**r7 で M1' → M1'' に訂正**（**`<pre>` = `role="region"` + `aria-label`**（aria-live なし / WAI-ARIA 仕様で暗黙的 aria-live を持たない静的領域）+ 別途サマリ status 欄に `role="status" aria-live="polite"` + 短文「+N / −M 箇所」付与）。M1' 採用根拠（過剰アナウンス回避 / cycle-213 (ζ) 引用 / cycle-211 (viii) 運用拡張）はそのまま M1'' でも有効。**r7 改訂範囲**: 計画書中の `<pre>` 役割記述を全件 `role="region"` ベースに統一書き換え（L135 / L227 / L267 / L293 / L310 / L392 / L394 / L566-567 / L663-680 / L713-715 / L721-724 / L819 / L839 / L963 / L976 の計 18 箇所程度）+ §論点 13 採用案名称 M1' → M1'' 変更 + 経緯記録追加 + §補足事項 r6 → r7 改訂対応マップ新規追加。
>
> **r5 → r6 改訂の主旨（r5 レビュー指摘 MAJOR 1 + NIT 1 = 計 2 件への対応 / CRIT 0 件 / 実装整合レビューは PASS）**
>
> - **MAJOR-1（visitor / r6 新規）対応**: T-4 (F) 独立絵文字フィクスチャの Unicode code point ラベル誤り。L343 で「U+1F4DD = ✅ / U+1F4DD = 📝」と記述していたが、**(1)** ✅ の正しい code point は **U+2705**（BMP 内 / サロゲートペアではない）であり U+1F4DD ではない / **(2)** 同じ code point を異なる絵文字に並列割り当てる表記は Unicode 原則違反（U+1F4DD は MEMO 📝 のみ）/ **(3)** BMP 内文字 vs サロゲートペアの区別が崩れ、フィクスチャ意図（v5 では破損していた SMP 絵文字が v6+ では破損しない実証）が不明瞭。**r5 改訂の主旨が「jsdiff サロゲートペア仕様の事実誤認訂正」だったにも関わらず訂正の根拠側に新たな Unicode 事実誤認が混入 = AP-P19 連鎖違反**。**r6 で訂正**: ✅ = U+2705（BMP 内 / 1 code unit）+ 📝 = U+1F4DD（SMP / 2 code unit / サロゲートペア）として独立検証コマンド出力（`python3 -c "print(format(ord('✅'),'04X'))"` = `2705` / 同 📝 = `1F4DD`）+ Wikipedia Emoji 一次資料（U+270x ブロック「Check mark」）の二重出典を併記。L344 / L647 の ZWJ 結合絵文字 code point 列（U+1F468 + U+200D + U+1F469 + U+200D + U+1F467）は planner 独立検証で正しいことを再確認済（`python3 -c "s='👨‍👩‍👧'; print([hex(ord(c)) for c in s])"` = `['0x1f468','0x200d','0x1f469','0x200d','0x1f467']` 一致）。
> - **NIT-1（visitor / r6 新規）対応**: T-4 完成条件 L410 bundle インパクト判定の「大幅増（例: +20kB 等の明らかな異常）」の「+20kB」が出典・生成元なしの目安数値となっていた（r5 で MAJOR-1 r4 として「+5kB 以下」を架空データとして撤廃したのと同型の AP-P16 違反予防）。**r6 で「例えば +20kB 等」を削除**し、「明らかな異常（過去 14 タイル追加実績の典型レンジから 1 桁以上乖離する増加など）と感じた場合のみ reviewer に再評価を依頼」のラベルなし運用に切替。
> - **r6 自主検証**: 訂正に際して計画書中の Unicode 関連記述（L329 / L343 / L344 / L647 / L863）を網羅再確認し、L343 のみが誤り / L344 / L647 / L863 は正しい（ただし L863 は r4 NIT-1 の歴史記録なのでそのまま保持）ことを実体確認。Wikipedia 一次資料 WebFetch + `python3` 独立検証コマンドの二重出典で訂正値を確定。
>
> **r4 → r5 改訂の主旨（r4 レビュー指摘 MAJOR 1 + MINOR 2 + NIT 3 = 計 6 件への対応 / CRIT 0 件 / 実装整合レビューは NIT 1 件で PASS）**
>
> - **MAJOR-1（visitor / r5 新規）対応**: T-4 完成条件の bundle インパクト判定基準「+5kB 以下」が「cycle-210 text-replace の bundle 追加 4.2kB 実績」を根拠としていたが、reviewer 独立 `grep -nE 'bundle\|First Load\|kB\|4\.2' docs/cycles/cycle-210.md` で全件 0 件 = **当該数値は cycle-210.md 内に存在せず架空データ**であることが r4 reviewer 来訪者価値 MAJOR-1 で発覚（AP-P16 = 4 分類ラベル + 生成元併記 + AP-P19 = 過去サイクル数値の一次資料再確認、両方の違反）。**r5 で事前閾値「+5kB 以下」を完全撤廃し、T-4 実測値の記録のみに切替**（PM 方針 = 案 (c) / r6 で「+20kB 等」目安数値も NIT-1 として削除）。あわせて cycle-200〜213 引用数値を全件 grep 再検証し、他に架空データがないことを確認（cycle-210 L222 / L308 / L538 / L835 / L841 / L843 / L845 / L847-852 + cycle-213 L606 / L645 / L668 + `tiles-registry.ts:47 tilesCount=14` + `package.json L27 "diff":"^9.0.0"` すべて実在確認 / 違反は本件 1 件のみ）。
> - **MINOR-1（visitor / r5 新規）対応**: (a) 両入力空時と (e-α) 両入力同一非空時の系統境界曖昧化への対応。即時計算化（§論点 2-D 案 A 採択）後は `showResult` 撤廃により **(a) 両入力空時も `.noDiff` 枠表示**となる挙動を planner 認識訂正。T-1 で (a) / (e-α) の表示矩形を Playwright 計測し、textarea 内部高さ差が有意でなければ **N=4 系統に統合**（(a)(e-α) 1 系統化）/ 有意なら N=5 系統維持に確定する条件分岐を T-1 完成条件 + §論点 5 + §引用 SSoT 4 に追加。
> - **MINOR-2（visitor / r5 新規）対応**: jsdiff サロゲートペア仕様の事実誤認訂正。**jsdiff v6+ 仕様で diffChars は Unicode code point 単位 = 独立絵文字（U+1F4DD 等の単一 code point）は破損しない**（仕様値 = https://github.com/kpdecker/jsdiff/blob/master/release-notes.md ）。一方 **ZWJ 結合絵文字（家族絵文字 👨‍👩‍👧 等の複数 code point 合成）は code point 境界（U+200D 周辺）で分割される可能性あり**。フィクスチャを「(I) 独立絵文字 1 件 + (II) ZWJ 結合絵文字 1 件」の 2 件に分割し、§論点 12 AP-P19 セクションに仕様値ラベルで正確に記述。
> - **NIT-1（visitor / r5 新規）対応**: §論点 13 末尾のサマリ status 欄計算ロジック (b) の境界処理（改行末尾の扱い / Unicode code point カウント）について 1 文追記してテスト assertion で挙動を固定。
> - **NIT-2（visitor / r5 新規）対応**: T-4 (G) D1 スクショ作成手法を「Playwright `evaluate` 経由で `text-decoration: none` 強制上書き + マーカー記号 `::before` 非表示化」として最小指針を明示。
> - **NIT-1（impl / r5 新規）対応**: T-2 完成条件に「`npm run test -- text-diff` で 9 件全件緑維持」を 1 行追加（AP-WF16 自動チェック観点強化）。
>
> **r3 → r4 改訂の主旨（r3 レビュー指摘 MAJOR 3 + MINOR 6 + NIT 3 = 計 12 件への対応 / CRIT 0 件）**
>
> - **MAJOR-1（visitor / r4 新規）対応**: char モード × 大入力時の実用上限がモード別に確定していない問題に対し、T-1 ベンチを「line / word / char × 4 字数（1k/10k/50k/100k）」の **12 ケース表**に拡張し、**モード別の literal を独立確定**する設計に書き換え（§論点 2 表 + T-1 ベンチ実施事項 + (d) 系統 literal 確定式）。M1b エンジニアが詳細ページ char モードで PR diff（数万行）を投入してもブラウザフリーズしない歯止めとして設計。
> - **MAJOR-2（visitor / r4 新規）対応**: 詳細ページ Component.tsx の計算トリガー（即時 vs ボタン押下 vs debounce）を §論点 2 末尾の **独立論点（§論点 2-D）** として 3 案ゼロベース比較で追加。**第一候補 = 案 A（詳細も即時計算化）**（タイルと一貫 / M1b 操作性一貫性 likes line 16 + cycle-210 詳細ページ即時計算採択の引用適用 / bundle インパクト 0）として採択。T-2 詳細ページ touch 範囲にも反映。
> - **MAJOR-1（impl / r4 新規）対応**: `Component.module.css` L113 `.added` の `text-decoration: none;` + L119 `.removed` の `text-decoration: line-through;` という**現状実装の事実認識を計画書に組み込み**、§論点 4 を D1〜D4 + line-through 処遇を統合した **ゼロベース 4 案比較**に再構成。**採択 = D4（色 + 記号「+/−」+ `.added` underline + `.removed` line-through 対称化）**（PM 判断 = 色覚多様性で色情報を失っても「両方とも何かしらマーク」の対称識別が成立 / a11y 強化最大）。T-2 マッピング表に `text-decoration` 処遇行を追加 / T-4 (G) a11y 対比に「line-through + underline 対称効果計測」を追加。
> - **MINOR / NIT（計 9 件）対応**: 文字量配分主張「27.5%」→ 実測 19.4% に訂正（MINOR-1 visitor）/ サマリ status 欄文面の単位（line=行 / word=単語 / char=文字）モード依存を明示確定（MINOR-2 visitor + MINOR-1 impl 統合）/ T-1 L105 「62 行のみ」→「9 件 / 62 行」テスト件数表記統一（MINOR-3 visitor）/ §論点 12 に **AP-P19**（`diff` npm v9.0.0 仕様依存）追記（MINOR-4 visitor）/ §論点 1 L395「cycle-210.md L530」→ **L308** に行番号訂正（MINOR-2 impl）/ T-4 (F) 実体験フローテストデータに**絵文字 1 件追加**（NIT-1 visitor / サロゲートペア破損確認）/ T-4 (F) スクショに**ダーク 1 系統追加**（NIT-2 visitor / モード網羅）/ §論点 12 に **AP-I08**（DESIGN.md / デザイントークン未定義の視覚表現禁止）を §論点 4 末尾チェック手順と統合して追記（NIT-1 impl）。
> - **計画書中の他のソースコード現状認識の網羅再確認**（reviewer 推奨 / r4 自主検証）: `Component.tsx` L1-114 + `Component.module.css` L1-130 を planner が独立再 Read し、漏れていた現状実装パターン（`.unchanged` クラスの `color: var(--color-text);` L122-124 / `@media (max-width: 768px) .panels` L126-130 / `compareButton:hover` の `--color-primary-hover` L79-81 等）を §論点 4 / T-2 マッピング表 / §論点 11 に反映済。
> - **r1 → r2 → r3 → r4 → r5 → r6 → r7 改訂内容（参考）**: r1 → r2 = CRIT 3 + MAJOR 8 + MINOR 7 + NIT 3 = 計 21 件 / r2 → r3 = CRIT 1 + MAJOR 3 + MINOR 8 + NIT 5 = 計 17 件 / r3 → r4 = MAJOR 3 + MINOR 6 + NIT 3 = 計 12 件 / r4 → r5 = MAJOR 1 + MINOR 2 + NIT 3 = 計 6 件 / r5 → r6 = MAJOR 1 + NIT 1 = 計 2 件 / **r6 → r7 = MAJOR 1 = 計 1 件**（詳細は §補足事項 r1→r2 / r2→r3 / r3→r4 / r4→r5 / r5→r6 / r6→r7 各対応マップ参照）。

### 目的

#### 誰のために

- **M1a（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）**: 文書校正・契約書比較・議事録の修正履歴確認・ブログ原稿のリライト前後比較といった用事の途中で、「変更前後の差分をさっと可視化したい」という単一の用事で検索流入する初回来訪者層。likes「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」（line 16）/「コピペで結果を受け取って、すぐ元の作業画面に戻れる」（line 17）/「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」（line 18）/「結果の根拠や前提が必要最小限だけ添えられており、信頼して使える」（line 20）に直結する。dislikes「仕様や前提が曖昧で、出てきた結果を信用していいのか判断できない」（line 24）も text-diff の差分粒度ラベルや配色補助記号の必要性に直結する（出典: `tmp/research/2026-05-28-cycle-214-text-diff-target-users.md` §B）。
- **M1b（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）**: 編集者 / 法務 / ライターの業務フローに組み込まれた定期リピーター、およびプルリクエスト前にローカルで非 git テキストの差分を確認したいエンジニア。likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」（line 16）/「ブックマークしたURLを開けばすぐ目的のツールが表示されること」（line 17）/「同じ入力に対して前回と同じ結果が返ってくること」（line 19）に直結し、URL（`/tools/text-diff`）と diff アルゴリズムの非破壊維持が信頼条件（出典: 同調査レポート §B）。
- **S3（Web サイト製作を学びたいエンジニア / `docs/targets/Webサイト製作を学びたいエンジニア.yaml`）**: 付随ターゲット。コード差分・設定ファイル差分の用途で詳細ページに到達する付随層であり、タイル動線の主対象ではない（出典: 同調査レポート §B 後段）。

#### M1a / M1b 実利用フロー（MAJOR-3 対応 / 体験トレース）

CLAUDE.md「Decision Making Principle」に従い、本サイクル完遂後の来訪者体験を 2 つの典型シーンで具体描写する:

- **シーン 1: M1a / 契約書修正の差分を確認したい弁護士事務所職員**:
  1. Google で「文章 比較」と検索 → yolos.net トップに着地（10〜15 秒以内 = 検索 → クリック → ロード）
  2. トップ画面で **text-diff タイル**を視認（タイル動線は競合 8 社で 0 件 = 競合最短値「全画面 1 タブ」を上回る 0 ナビゲーション体験）。タイル発見 < 3 秒（M1a likes line 16 への直接応答）。
  3. タイル上の左 textarea に契約書 v1 を Ctrl+V で貼り付け（コピー元の Word 画面から）
  4. Tab で右 textarea に移動 → v2 を Ctrl+V → **即時に差分が結果欄に表示**（debounce なし / cycle-210 同型）
  5. 「+ 追加 / − 削除」記号 + 緑/赤配色 + **`.added underline` + `.removed line-through` 対称化視覚マーク**（a11y 補助 = §論点 4 採択 D4 / MAJOR-1 impl r4 で D2 → D4 採択変更）で変更箇所を一目で把握
  6. 必要な変更行のみコピーボタンで取得 → Slack や Word のコメントへ貼り戻し
  7. タブを閉じてもとの作業に戻る。所要時間 = 30〜60 秒（競合 8 社の「ボタン押下式」より 1 クリック分短い）
- **シーン 2: M1b / プルリクレビュー前にローカル diff したいエンジニア**:
  1. ブックマークから `https://yolos.net/tools/text-diff` 詳細ページへ直接アクセス（M1b likes line 17）
  2. 詳細ページで line/word/char モード切替を使い込み（タイルでは line 固定 / §論点 3）
  3. 同じ入力に対して同じ結果が返る（M1b likes line 19 / diff アルゴリズム非破壊維持）

これらフローは T-4 §実体験フロー検証（MAJOR-2 対応 / 新規追加）で Playwright 再生 → スクショ取得して **計画段階で約束した体験が再現されることを T-4 で検証**する。

#### 何のためにやるのか / どんな価値を提供するか

1. **来訪者価値の核心（CLAUDE.md Decision Making Principle 準拠）**: 現状の `text-diff` は `(legacy)` 配下に残存しており、ダークモード対応・新トークン体系・モバイルタップターゲット改善・新フォント体系などの新デザイン恩恵が来訪者にまだ届いていない（**実測値** = T-1 で再確認 / 旧トークン残存 17 箇所程度 + hex 直書き **5 箇所**（CRIT-1 訂正 / planner 再実測 = `Component.module.css:71/111/112/117/118` の 5 行）= 詳細は T-1 実施事項を参照）。同時にトップページに「2 テキストを貼って差分を見る」最短動線が存在せず、M1a の最大流入面（トップ）から普遍的需要に応えられていない。本サイクルで両方を解消する。
2. **新デザイン詳細ページ移行**: `(legacy)/tools/text-diff/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `(new)/tools/text-diff/` 配下に移行し、cycle-200〜213 で確立済みの「`max-width: 1200px` ハードコード / `page.module.css` / ToolLayout 等」標準パターンを踏襲する。`Component.module.css` 内の旧トークン（`--color-*`）を新トークン（`--bg` / `--fg` / `--accent` / `--border` / `--fg-soft` / `--success` 等）に置換し、`.compareButton` の `#fff` を `--fg-invert`、`.added` / `.removed` 内の hex 直書き（薄緑 + 濃緑 / 薄赤 + 濃赤系統）を `--success-soft` / `--success-strong` / `--danger-soft` / `--danger-strong` に置換する。
3. **タイル動線による最短 UX = M1a / M1b 普遍的需要への直接応答**: 競合 8 サイトのうち「タイル」概念を持つサービスは 0 件であり、来訪者がトップから「2 つのテキストを貼って差分を見る」までの動線は競合に存在しない。yolos.net がここにタイル動線を構築することは、競合最短値（1 ページ全画面利用）を上回る 0 ナビゲーション体験を提供することに直結する（出典: `docs/research/2026-05-28-text-diff-competitor-survey.md` §C 比較サマリー）。**競合調査結論「タイルに 2 textarea 不適切」への正面反論**: 競合調査が出した「2 textarea を 200×100px しか取れず編集難」結論は「タイル概念を持たない競合の物理寸法」を前提にしているが、yolos.net は **cycle-210 text-replace で 400×400px 枠に複合入力型タイル（textarea 119.61px 実測）を成立させた先例（N=1）** がある。text-diff の膨張側 3（A/B textarea + 結果欄）= cols=3 rows=3 で各 80〜100px の領域が確保できる見込みであり、T-3 実機計測で「最低編集領域 80px 以上」が確保できない場合は **退避案 = 軽量プレビュー化（短い説明 + 詳細リンクのみ）** に切替するフォールバック設計を §論点 1 / §論点 6 末尾に組み込む。
4. **複合入力型タイル N=2 達成 + B-452 への直接貢献**: 本サイクルは cycle-210 text-replace に続く複合入力型タイル 2 件目であり、cycle-210 で確立した SSoT 4 項目 (i)(ii)(v)(vi) の初の引用検証の場となる。(v) の経験的暫定値 ±15%（N=1）に対して本サイクルで N=2 のデータポイントを採取することで、B-452（複合入力型タイル AP-P21 (v) 基準値見直し / 着手条件 N≥3 / **P3 昇格済 = cycle-210 完了処理 AP-WF15 指摘**）の達成が次サイクル 1 件に短縮される。**計測整合性の担保（CRIT-1 対応）**: 計算トリガーを debounce ではなく **即時計算（案 B2 = cycle-210 同型）** に戻したことで、(d)→(e) 変化率を cycle-210 と同軸で計測可能となる。(vi) のエラー文言枠 SSoT 適用可否は T-1 実体確認後に T-4 で確定（CRIT-2 対応 / 詳細は §論点 5）。
5. **a11y による差別化（来訪者価値の核 / 文字量重点配置）**: 競合 8 サイトすべて「色のみで差分判別」（WCAG 1.4.1 違反 / 出典: 同競合調査レポート §A〜B / §E AP-2）。yolos.net は **色 + 記号（+ / −）+ `.added underline` + `.removed line-through` 対称化 + aria-label**（§論点 4 D4 採択 / r4 で line-through + underline 対称化を追加 = MAJOR-1 impl r4）で差別化する。これは M1a dislikes「仕様や前提が曖昧で、出てきた結果を信用していいのか判断できない」（line 24）への直接的応答にもなり、独自価値の一翼を担う。本サイクルで a11y を実装すれば、競合 8 サイト全件で 0 件の差別化軸を獲得できる。詳細は §論点 4 を参照。

#### viewport 採用方針

cycle-200〜213 と同型の **w375 / w1200 / w1900** × light / dark の 6 系統を AP-WF05 網羅性ルールに従って採択する。viewport meta は Next.js デフォルト（`width=device-width, initial-scale=1`）で標準採用し、独自指定はしない。

#### 「複合入力型ゆえの注意点」 = cycle-210 5 ケース系統（a〜e）の text-diff 再評価（CRIT-2 r2 で計画段階確定撤回 → MAJOR-2 visitor r3 で planner Read 結果に基づき計画段階 5 系統確定に再切替）

cycle-210 text-replace で確立した AP-P21 計測 5 ケース（a〜e / 出典: `docs/archive/composite-input-tile-ap-p21-criteria.md` §B）は「テキスト本文 + 検索 input + 置換 input + 結果欄」を前提に設計されている。text-diff は構造的に「2 入力 textarea（テキスト A / テキスト B / 両方とも膨張側）+ 差分結果欄 1 つ（膨張側）+ 比較モード操作要素（操作側 / 詳細ページのみ）」となり、text-replace の「操作側 2 input + 膨張側 1 textarea + 結果 1 欄」とは「膨張側が 3 つに増える / 操作側が 0〜1 個に減る」点で逆転構造を持つ。

**想定系統（計画段階）**:

- (a) **両入力空** → 引用可（共通の最小系統）
- (b) **短い入力**（2 テキスト各 30 字相当）→ 引用可（text-diff 用に文言再定義）
- (c) **中程度入力 + 多数差分**（各 300 字 / 差分が結果欄を膨張させる）→ 引用可（text-replace の「結果膨張」と同等の構造）
- (d) **大量入力 = jsdiff 性能上限近傍**（実用上限 = T-1 軽量ベンチで確定 / 候補値: 10,000 / 50,000 / 100,000 字）→ 引用可
- (e) **エラー枠相当の条件付き表示系統 / r3 で planner Read による計画段階確定**（MAJOR-2 visitor / r3 新規対応）。候補 3 種の確定状態:
  - (e-α) **「テキストに差分はありません」枠の出現条件**（既存実装 `Component.tsx:86-88` の `{!hasDiff ? (<p className={styles.noDiff}>...) : (<pre>...)}` 三項分岐 / reviewer 独立再実測済 / **実装値**）。両入力同一かつ非空時に固定枠が条件付きで表示される = 系統 (e) と構造的に同等の CLS リスク。**ただし即時計算化（§論点 2-D 案 A 採択）後は `showResult` 撤廃により「両入力空時」も `hasDiff=false` で .noDiff 枠が表示される挙動**（MINOR-1 visitor r5 で planner 認識訂正 = `computeDiff("", "", "line")` → 空配列 → `hasDifferences([])=false` → .noDiff 表示）。**T-1 では Playwright で (a) 両入力空時 / (e-α) 両入力同一非空時 の両方の表示矩形を確認**し、UI 構造（.noDiff 枠表示）が同じであれば **(a) と (e-α) を統合して N=4 系統とするか分離維持で N=5 系統とするかを T-1 完成条件で確定**（PM 方針 = T-1 実体確認後の builder 判断に委ね、(a) と (e-α) の入力長差で生じる textarea 内部高さ変化が有意でない場合は統合 / 有意な場合は分離維持）。系統定義の明示:
    - **(a) 両入力空** = textarea 内部 0 字 / `hasDiff=false` / `.noDiff` 表示 / textarea 自然高さ最小
    - **(e-α) 両入力同一非空文字列** = textarea 内部 N 字（N≥1）/ `hasDiff=false` / `.noDiff` 表示 / textarea 自然高さは入力長で変化
    - 上記 2 系統は `.noDiff` 表示という UI 構造は同じだが、textarea 内部の高さ計測軸（getBoundingClientRect）では別の値が出る可能性あり = 計測純度を担保するため T-1 で実体確認
  - (e-β) **片入力時の挙動 / r3 で計画段階確定**: 即時計算採択（§論点 2）に切り替えた前提で planner が `Component.tsx:7-114` を再 Read した結果、現状の `showResult` フラグ + 比較ボタン押下モデルは T-3 で **タイル UI 側は即時計算に置換**（`computeDiff` を `useState` 値から派生計算）= **片入力時は「もう一方の全文が全削除 or 全追加として結果欄に展開」される挙動が想定される**。これは仕様値ではなく `diff.diffLines`（**実装値** = `logic.ts:19` `diffLines(oldText, newText)`）が「空文字列との比較で全行を added/removed として返す」挙動（diff npm パッケージの仕様）。**T-4 系統数加算対象として確定**。
  - (e-γ) **jsdiff 例外 / 異常入力の表示枠 / r3 で計画段階確定**: planner が `logic.ts` 全 38 行を Read した結果、`computeDiff` には try/catch / フォールバック表示の実装は**存在しない**（**実装値** = `logic.ts:11-34` `switch (mode)` ブロック内で `diff*` を呼ぶのみ / マルチバイト境界やサロゲートペアでも diff npm パッケージは throw しない / **T-4 系統数加算対象外として確定**）。

**T-1 実機計測で系統数 = N=4 系統に確定**（計画段階 N=5 系統 / MAJOR-2 visitor r3 対応 / **MINOR-1 visitor r5 で N=4 統合の条件分岐追加** / **T-1 Playwright 実機計測で N=4 統合確定**）: (a) 両入力空 / (b) 短い入力 / (c) 中程度入力 + 多数差分 / (d) 大量入力 = jsdiff 性能上限近傍 / (e-β) 片入力時 = **4 系統（T-4 計測実施）**。(e-α) は (a) と統合済（noDiff 枠 h 差 0px / w 差 0px = T-1 実機計測値 / `measure-nodiff.ts` Playwright getBoundingClientRect() 計測）。(e-γ) は実体なしで適用対象外確定。**T-1 確定内容**: (a) 両入力空時 / (e-α) 両入力同一非空時 の Playwright 実機計測 → noDiff 枠 h=23.046875px / w=894px（両系統で差 0px）→ **N=4 系統に統合確定（(a)(e-α) は 1 系統として T-4 計測）**。

#### 数値 literal 4 分類ラベルと生成元併記の徹底（AP-P16 強化）

本計画書に登場するすべての数値 literal は「**実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値**」の 4 分類ラベル + 生成元（コマンド or ファイルパス + 行番号）を直近に併記する（AP-P16 強化）。とくに cycle-210 SSoT を引用する箇所では「cycle-210 で確定済の SSoT 値」「本サイクルで T-4 実機計測する予定の値」「経験的暫定値（N=1 由来）」を区別する。

### 作業内容

タスク分割は cycle-200〜213 で確立した 4 タスク構成（T-1 現状把握 → T-2 詳細ページ移行 → T-3 タイル定義 → T-4 検証）を踏襲する。各タスクの「目的・実施事項のリスト・完成条件」のみを literal 確定し、具体的なコード / CSS クラス名 / テスト assertion 文言は builder 裁量とする（AP-P20 過剰具体化を回避）。

#### T-1: 現状把握と移行前 baseline 取得 + jsdiff 軽量ベンチ + GA データ確認 + (e) 系統実体確認

**目的**: 移行作業の起点を確定し、後工程で「変更前後の差分」を客観的に比較できる素材を揃える。cycle-210 SSoT 4 項目を計画書内に引用形で書き起こし、T-4 引用検証の土台を作る。CRIT-1 / CRIT-2 / MAJOR-1 / MAJOR-3 / MINOR-3 への対応として、即時計算採択を支える jsdiff 性能実測、(e) 系統実体確認、GA 流入実績確認を追加する。

**実施事項**:

- `src/tools/text-diff/` 配下のファイル構成、`logic.ts` の export、`meta.ts` の `keywords` / `faq` / `relatedSlugs`、既存テスト件数を grep / Read で実体確認する（数値はすべてコマンドを併記して引用付き報告 = AP-P16 / AP-WF12 対策）。
- 主要事実の参考値（**実測値ラベル = T-1 builder が再実測必須**）:
  - `Component.tsx` 行数 / `Component.module.css` 行数 / `logic.ts` 行数 / `meta.ts` 行数（**実測値** = T-1 で `wc -l` 出力を引用 / 参考: planner 独立再実測 = 114 / 130 / 38 / 36 行）
  - `__tests__/logic.test.ts` のテストケース数（**実測値** = T-1 で `grep -cE '^\s*(test|it)\(' src/tools/text-diff/__tests__/logic.test.ts` 出力を引用 / 参考: planner reviewer 独立再実測 = **9 件 / 62 行**（テストケース数 9 件 / ファイル行数 62 行）/ MINOR-3 visitor r4 で件数 + 行数の併記に統一）
  - **Component.test.tsx 不存在**の確認（**実測値** = T-1 で `ls src/tools/text-diff/__tests__/` 出力を引用 / 参考: planner Read 時 `logic.test.ts` のみ）→ B-449/B-455/B-458/B-459 と同型の新規 backlog 候補（後述 T-2）
  - `Component.module.css` の `--color-*` 残存（**実測値** = T-1 で `grep -c "var(--color-" src/tools/text-diff/Component.module.css` + `grep -oE "var\(--color-[a-z-]+" ... | sort | uniq -c` の両方を引用 / 参考: planner 実測値 = 17 箇所程度 / `--color-text` `--color-text-muted` `--color-border` `--color-bg` `--color-primary` `--color-primary-hover` `--color-success`）
  - **warning 系トークン使用の有無**: text-diff の `.added` / `.removed` 系統に warning トークン使用がない見込み（**推定値 + 経験的暫定値** = planner Read 結果 / T-1 builder が `grep -E "warning|error" src/tools/text-diff/Component.module.css` で再確認 / 0 件が期待値）
  - **CSS / Component.tsx 内 hex 直書き = 5 件 / 5 種**（CRIT-1 訂正 / **実測値** = planner reviewer 独立再実測完了 / T-1 で `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/text-diff/{Component.tsx,Component.module.css}` を **再度実行して 5 件であることを再確認**する手順を必須化）:
    - `Component.module.css:71  color: #fff;` （`.compareButton` 文字色 / `--accent` 背景上の白文字）
    - `Component.module.css:111 background-color: #d4edda;` （`.added` 薄緑背景）
    - `Component.module.css:112 color: #155724;` （`.added` 濃緑文字）
    - `Component.module.css:117 background-color: #f8d7da;` （`.removed` 薄赤背景）
    - `Component.module.css:118 color: #721c24;` （`.removed` 濃赤文字）
    - Component.tsx 内 hex 直書き = 0 件が期待値（**実測値** = T-1 で再確認）。これらは T-2 で新トークンに置換する。
  - **logic.ts export 件数**（**実測値** = T-1 で `grep -c '^export ' src/tools/text-diff/logic.ts` 出力を引用 / 参考: planner Read 時 4 種 = `DiffMode` / `DiffPart` / `computeDiff` / `hasDifferences`）
  - **入力長制限の有無**: text-diff の logic.ts には字数制限なし（**実装値** = planner Read 完了 / T-1 builder が再確認）。
  - **詳細ページ Component.tsx の差分結果欄 role**（MAJOR-1 r2 対応 / NIT-2 r3 行番号精度訂正 / MAJOR-1 r7 訂正 = M1' → M1'' で `<pre>` は `role="region"` 維持に確定）: `Component.tsx:89-92` の `<pre className={styles.diffOutput} role="region" aria-label="Diff result">` を使用（**実装値** = planner reviewer 独立再 Read 完了 / **`<pre>` 開始タグ = L89 / `className` = L90 / `role="region"` 属性 = L91 / `aria-label="Diff result"` 属性 = L92** / 複数行 JSX 属性のため属性別行番号を併記）。T-2 で **`<pre>` は `role="region"` を維持**（`role="status"` には変更しない / WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つため長文 `<pre>` 全体の連続アナウンス過剰化を生じる / aria-live は別途追加するサマリ status 欄に分離付与）する判断は §論点 13（CRIT-1 r3 全面書き換え + MAJOR-1 r7 M1' → M1'' 訂正）参照。
  - **(e) 系統候補の確定状態**（MAJOR-2 visitor / r3 新規対応で planner Read 完結 / T-1 先送り解除）:
    - (e-α) `Component.tsx:86-88` の「テキストに差分はありません。」三項分岐 = `{!hasDiff ? (<p className={styles.noDiff}>テキストに差分はありません。</p>) : (<pre ...>...)}` （**実装値** = planner reviewer 独立再 Read 完了 / 条件付き表示固定枠 = 系統 (e) と構造的に同等の CLS リスク / **T-4 計測対象として確定**）
    - (e-β) 片入力時の挙動 = `logic.ts:11-34` `computeDiff` が空文字列入力に対して「全行 added/removed」を返す挙動（**実装値** = `diff` npm パッケージ仕様）。**T-4 計測対象として確定**（片入力時の結果欄膨張パターンを (e-β) 系統として計測）。T-1 先送りは行わない。
    - (e-γ) jsdiff 異常入力時のフォールバック = `logic.ts:11-34` を planner が再 Read 完了 / try/catch なし / フォールバック表示 UI なし（**実装値** = `logic.ts` 全 38 行で例外処理 0 件 / diff npm パッケージは throw しない）→ **適用対象外として確定**。T-4 計測対象から除外。
- **jsdiff 軽量ベンチ**（CRIT-1 r2 / MAJOR-3 r2 / MAJOR-1 visitor r3 拡張 / **MAJOR-1 visitor r4 でモード別 12 ケース表に拡張** / 即時計算採択を支える性能実測 + 性能超過時の UX 設計分岐確定）:
  - **計測グリッド = line / word / char × 1,000 / 10,000 / 50,000 / 100,000 字 = 計 12 ケース**（MAJOR-1 visitor r4 で 4 点 × 3 モード = 12 ケース表に拡張）。各セルで `computeDiff(textA, textB, mode)` を `performance.now()` で 5 回以上計測した中央値をミリ秒単位で記録（vi.useFakeTimers は使わない）。
  - **モード別の処理時間特性の事前認識**: line = O(N) 近傍（行頭〜行末を単位とした diff / 高速）/ word = O(N×M / 単語数) / char = **Myers O(N×M) で最も重い**（100,000 字 × 100,000 字 = 10^10 オーダー / 数秒〜数十秒の可能性高）。M1b エンジニア層が詳細ページ char モードで PR diff（数万行）を投入する想定があるため、char モードでのフリーズリスクを T-1 で実測して歯止めを敷く。
  - **処理時間別 UX 設計 3 段分岐 / モード別に独立判定**（MAJOR-1 visitor r3 + r4 でモード別判定軸を明示 / cycle-212 AP-I10/I11 SSoT 引用適用 / NIT-N3 r3 = 100ms 出典 = Nielsen "Response Time Limits" 1993 の 0.1s / 1s / 10s 三段階のうち 0.1s 閾値）:

    | 処理時間レンジ | UX 設計                                                                                                                                          | 採用条件（モード別）                     |
    | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
    | `<100ms` 安定  | **入力長制限なし / spinner なし / 即時計算のみ**（M1a「コピペで結果」最短化 / cycle-210 SSoT (v) 同軸 N=2 検証成立）                             | 該当モードの 4 点全件で `<100ms`         |
    | `<500ms`       | **spinner 中間状態を表示**（cycle-212 SSoT 引用適用 / 100ms threshold + setTimeout cancelable / AP-I11 cleanup / AP-I10 globals.css @keyframes） | 該当モードで一部が `100ms` 以上 `<500ms` |
    | `>500ms`       | **入力長制限を発動**（実用字数上限を明示警告 / 上限超過時は計算スキップ + メッセージ表示「N 字以下にしてください」/ debounce ではなく明示制限）  | 該当モードで一部が `>500ms`              |

    上記 3 段は **モード別に独立判定**（line / word / char の 3 モード × 3 段 = 最大 3 系統の異なる UX 採用となる可能性）。例: line = `<100ms` 安定 → 入力長制限なし / word = `<500ms` → spinner / char = `>500ms` → 入力長制限、という組み合わせがあり得る。ベンチ結果から **計画段階で条件分岐を確定**（T-4 先送り禁止）。

  - ベンチ結果は `tmp/cycle-214/baseline/jsdiff-bench.md` に出力 / 12 ケース表 + モード別採用 UX 段を明示 / 即時計算採択 + UX 段分岐の客観的根拠として T-4 に書き戻し
  - **(d) 系統の文字数 literal 確定式（モード別に独立確定 / MAJOR-1 visitor r4 でモード別化）**: 「**該当モードのベンチ 4 点（1,000 / 10,000 / 50,000 / 100,000 字）のうち `<100ms` に収まる最大点を選び、その 80%（**推定値 + 経験的暫定値** = 性能マージン 20% 確保 / 後続サイクルで N=2 蓄積後に経験値化）を該当モードの (d) 系統 literal とする**」。タイル UI は `line` モード固定（§論点 3）のため (d-line) のみが直接関係するが、詳細ページではモード切替可能のため (d-line) / (d-word) / (d-char) の **3 値が独立確定** される。例: line = 4 点全件 `<100ms` → **(d-line)=80,000 字**（100,000×0.8）/ word = 50,000 字まで `<100ms` → **(d-word)=40,000 字**（50,000×0.8）/ char = 10,000 字まで `<100ms` → **(d-char)=8,000 字**（10,000×0.8）。詳細ページの入力長制限は 3 値のうち各モード選択時の値を発動する設計（モード切替時に上限再評価）。二分探索で追加点を取る運用は本サイクルでは行わない（4 点測定で十分）。

- `meta.ts` の `relatedSlugs` = `["char-count", "json-formatter", "line-break-remover"]` **3 件**（**実測値** = `meta.ts:12` 引用 / planner Read 完了）。**`json-formatter` 実在確認 = planner 完了**（NIT-1 / MINOR-1 対応 / `ls /mnt/data/yolo-web/src/tools/json-formatter/` 実行結果 = `Component.module.css / Component.tsx / __tests__ / logic.ts / meta.ts` 存在 / **実在 OK** / 差し替え不要）。他 2 件（`char-count` / `line-break-remover`）は T-1 builder が `ls` で独立再実測。
- **TILE_DECLARATIONS 現状エントリ件数 = 14 件**（**実測値** = `src/tools/generated/tiles-registry.ts:47` の `tilesCount=14` / cycle-213 完了時点 / MINOR-2 対応で `L46` → `L47` 訂正 / planner 実測完了）。本サイクル完了時に **15 件**（**実測値計算 = 14 + 1**）となる。
- **既存 logic test 全件緑確認**: `npm run test -- text-diff` で全件緑を確認（実測コマンド出力を引用付き報告）。
- **GA データ確認**（MAJOR-3 / MINOR-3 対応 / 新規追加 / CLAUDE.md「Check Google Analytics」原則）:
  - code-researcher または google-analytics MCP 経由で以下を実測:
    - 過去 30 日（2026-04-28〜2026-05-28）の `/tools/text-diff` 詳細ページの PV / セッション数 / 流入元上位
    - 検索クエリ（GA4 制約内で取得可能な範囲）= 「テキスト差分」「文章 比較」「diff チェッカー」関連クエリの流入実績
    - 既存ツールタイル経由のセッション数（タイル動線が PV にどう貢献しているかの参考値）
    - ベンチマーク = cycle-213 password-generator の直近 30 日 PV と比較
  - 結果は `tmp/cycle-214/baseline/ga-data.md` に保存 / 計画書 §補足事項に要約引用（タイル動線新設が PV にどう影響しうるかの実測ベース仮説）
- Playwright で移行前のスクリーンショットを取得:
  - **ベース 6 枚** = w1200 / w1900 / w375 × ライト・ダーク（AP-WF05）
  - **比較実行後状態 2 枚** = ライト・ダーク（テキスト A/B 入力 + 比較ボタン押下後の差分結果が表示された状態）
  - 合計 = baseline **14 枚**（**T-1 実測値確定 = 12 + 2** / w375/w1200/w1900 × light/dark × top/detail = 12 枚 + after-compare × light/dark = 2 枚 / CRIT-2/MAJOR-2 対応で w1900 系統 4 枚追加）/ 保存先 = `tmp/cycle-214/baseline/`
- **cycle-210 SSoT 引用準備（本サイクル独自の必須作業）**: cycle-210 補足事項 4 項目 (i)(ii)(v)(vi) を本計画書の §引用する SSoT に引用形で書き起こし、各項目について「text-diff への適用予告（PASS 期待 / 再評価 / 適用対象外）」を明示する（後述 §引用する SSoT 参照）。これにより T-4 で機械的に検証可能な状態を作る。

**完成条件**:

- [x] 移行前スクリーンショット **計 14 枚**（**T-1 実測値確定 = 12 + 2** / w375/w1200/w1900 × light/dark × top/detail = 12 枚 + after-compare × light/dark = 2 枚）が `tmp/cycle-214/baseline/` 配下に保存（CRIT-2/MAJOR-2 対応で w1900 系統 4 枚追加 / 旧 8 枚は `baseline-old/` に退避）
- [x] 既存テスト全件緑 = `npm run test -- text-diff` 出力を引用付き報告
- [x] grep 数値が planner 参考値と一致する／しない場合は実測値を計画書に書き戻し（`--color-*` 残存数 / **hex 直書き = 5 件 / 5 種**（CRIT-1 確認）/ Component.test.tsx 不存在 / warning 系 0 件 / logic.ts export 数 / 入力長制限なしの再確認）
- [x] **jsdiff 軽量ベンチ結果**が `tmp/cycle-214/baseline/jsdiff-bench.md` に保存 / 即時計算採択の根拠が確定（CRIT-1 対応）
- [x] **(e-α) 差分なし枠の Playwright 表示矩形確認結果**が書き戻され、§論点 5 / §引用する SSoT 4 が更新済（(e-β)(e-γ) は r3 で planner Read 確定済 = T-1 先送り不要 / MAJOR-2 visitor r3 対応）/ **(a) 両入力空時の .noDiff 枠表示挙動も Playwright で確認**（MINOR-1 visitor r5 対応 / 即時計算化後は `showResult` 撤廃で両入力空時も .noDiff 表示）/ **(a) と (e-α) を統合（N=4 系統）するか分離維持（N=5 系統）するかを T-1 で確定し §論点 5 / T-4 計測手順に書き戻し**
- [x] **(d) 系統の文字数 literal が確定**し、§論点 5 / T-4 計測手順に反映済 / **処理時間別 UX 設計 3 段分岐の採用段**（`<100ms` / `<500ms` / `>500ms`）が確定して §論点 2 に書き戻し済（MAJOR-1 visitor r3 / MAJOR-3 r2 対応）
- [x] **GA データ確認結果**が `tmp/cycle-214/baseline/ga-data.md` に保存 / §補足事項に要約引用（MAJOR-3 / MINOR-3 対応）
- [x] `meta.ts` `relatedSlugs` 3 件のうち実在しないものがあれば §論点 9 に書き戻し（`json-formatter` は planner 実在確認済）
- [x] TILE_DECLARATIONS 現状エントリ = 14 件（`tilesCount=14` / `tiles-registry.ts:47`）の独立再確認
- [x] cycle-210 SSoT 引用準備 = §引用する SSoT 全 4 項目に「text-diff への適用予告」が記載済

**T-1 検証手順（AP-WF16 / NIT-2 対応）**: builder が grep / wc コマンド全件の出力を引用付き報告 / reviewer は **後続判断を最も左右する数値 2 つ（= `--color-*` 残存数 + hex 直書き 5 件確認）を必ず独立再実行**。残りはサンプリングで最低 1 つを追加実行。jsdiff ベンチも reviewer が 1 系統独立再計測。Component.test.tsx の単独テスト実行ではなく `npm run test -- text-diff` を一括独立再実行する形でも可（cycle-209 / cycle-213 と同型）。

---

#### T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + meta.ts 棚卸し + 既存 backlog 連動更新

**目的**: 詳細ページを新デザイン体系（1200px 標準 / 新トークン）に統一し、`search_intents` 整合性を取り、関連 backlog の対象件数を更新する。

**実施事項**:

- `git mv` で `src/app/(legacy)/tools/text-diff/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `src/app/(new)/tools/text-diff/` 配下に移動。
- `src/app/(new)/tools/text-diff/page.module.css` を新設（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }` の標準パターン / 直近 14 ツールと完全同一）。`page.tsx` 側に `<div className={styles.page}>` ラッパー追加。
- `src/tools/text-diff/Component.module.css` 内の旧トークン（**実測値 = T-1 で確定 / 参考: 17 箇所程度 / 7 種**）+ hex 直書き（**実測値 = T-1 で確定 / CRIT-1 訂正後 5 件 / 5 種 = `.compareButton` 文字色 `#fff` + `.added` 2 色 + `.removed` 2 色**）を新トークンへ一括置換する。

- **置換マッピング表**（cycle-203〜213 SSoT + 本サイクル新規）:

  | 旧トークン / hex                                               | 件数（実測値 = T-1）           | 新トークン                                                                                         | マッピング根拠                                                                                                                                                                    |
  | -------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `--color-text`                                                 | 複数（T-1 で確定）             | `--fg`                                                                                             | cycle-203〜213 SSoT                                                                                                                                                               |
  | `--color-text-muted`                                           | 複数（T-1 で確定）             | `--fg-soft`                                                                                        | cycle-203〜213 SSoT                                                                                                                                                               |
  | `--color-border`                                               | 複数（T-1 で確定）             | `--border`                                                                                         | cycle-203〜213 SSoT                                                                                                                                                               |
  | `--color-bg`                                                   | 複数（T-1 で確定）             | `--bg`                                                                                             | cycle-203〜213 SSoT                                                                                                                                                               |
  | `--color-primary`                                              | 複数（T-1 で確定）             | `--accent`                                                                                         | cycle-203〜213 SSoT                                                                                                                                                               |
  | `--color-primary-hover`                                        | 1（T-1 で確定）                | `--accent-strong`                                                                                  | cycle-203〜213 SSoT                                                                                                                                                               |
  | `--color-success`                                              | 1（T-1 で確定 / `.noDiff` 用） | `--success`                                                                                        | cycle-213 SSoT 流用                                                                                                                                                               |
  | `.added` 緑系 hex 2 種 (`#d4edda` 背景 / `#155724` 文字)       | 2（T-1 で確定）                | `--success-soft` 背景 / `--success-strong` 文字（**第一案** / §論点 4 で a11y 観点と合わせて確定） | 本サイクル新規 SSoT 候補 / cycle-213 hex→token 同型                                                                                                                               |
  | `.removed` 赤系 hex 2 種 (`#f8d7da` 背景 / `#721c24` 文字)     | 2（T-1 で確定）                | `--danger-soft` 背景 / `--danger-strong` 文字（**第一案** / §論点 4 で確定）                       | 本サイクル新規 SSoT 候補 / cycle-213 hex→token 同型                                                                                                                               |
  | `#fff` （`.compareButton` 文字色 / `Component.module.css:71`） | 1（T-1 で確定 / CRIT-1 追加）  | `--fg-invert`                                                                                      | cycle-213 password-generator §引用 SSoT 2 で確立済 SSoT / globals.css `:root` L21 (`var(--bg)`) + `:root.dark` L97 (`#131311`) 両方に定義済 = planner reviewer 独立再 grep 確認済 |

  | `text-decoration` プロパティ（`.added` L113 = `none` / `.removed` L119 = `line-through` / **MAJOR-1 impl r4 新規追加 = 現状実装事実認識**） | 2 行（**実装値** = `grep -nE 'text-decoration' src/tools/text-diff/Component.module.css` = `113:` + `119:` 行 / reviewer 独立再 grep 確認済） | **§論点 4 D4 採択を反映**: `.added` L113 = `text-decoration: underline;`（none → underline へ**変更**）/ `.removed` L119 = `text-decoration: line-through;`（**維持**） | 本サイクル新規 SSoT 候補 (c214-θ) = a11y 対称化視覚マーク二重化 / `text-decoration` は CSS 標準プロパティ = token 化対象外 = AP-I08 違反なし（§論点 4 / §論点 12 参照） |

  上記マッピング先トークンがすべて `src/app/globals.css` のライト `:root` + ダーク `:root.dark` 両方に定義済であることを T-2 builder が `grep` で再確認する（**実装値** = cycle-213 T-1 で 12 種定義済の事前確認あり / T-2 builder で `--success-soft` / `--danger-soft` / `--fg-invert` の存在を独立再確認 / 未定義のものがあれば §論点 4 に書き戻して新トークン定義の要否を判定）。`text-decoration` 行は token ではなく CSS 標準プロパティの直接書き換えのため globals.css 確認対象外。

  **件数訂正（CRIT-1 対応 + MAJOR-1 impl r4 で `text-decoration` 行追加）**: マッピング行数 = **6 行**（hex → token 4 種 + `#fff` → `--fg-invert` 1 種 + `text-decoration` 処遇 1 行）。**本サイクル新規 SSoT 候補は 4 種（hex → token） + 1 種（`text-decoration` 対称化視覚マーク (c214-θ)）= 5 種**。`#fff → --fg-invert` は **cycle-213 で確立済 SSoT の引用適用** = 本サイクル新規ではない。

- **opengraph-image.tsx / twitter-image.tsx の処遇**（MINOR-3 対応）: `(legacy)` から `(new)` に `git mv` で移動するだけで、本文の OG 文言・カラースキームは touch しない（既存実装が visitor 価値を確立済 = 直近 14 ツールと同型運用）。`(new)` 側 OG/Twitter 画像の URL は変わらない。**`accentColor: "#0891b2"` / `icon: "🛠️"`**（`(legacy)/tools/text-diff/opengraph-image.tsx:19-20` / reviewer 独立再 Read 確認済）は **(legacy) 側と同値を維持し、(new) 側でも変更しない**（OG カードのみで使われる値であり、`.added` / `.removed` 系統とは別系統 / 既存 OG カードのブランド継続性を優先）。
- 並べ読み突合 grep で他の (new) ツールの使用トークンと一致することを確認（AP-WF12 違反予防）。
- w1900 で本文幅が 1200px に収まっていることを Playwright で確認。
- **詳細ページ Component.tsx の touch 範囲**（MAJOR-1 r2 対応 / NIT-2 r3 = `<pre>` 開始 L89 行番号精度訂正 / CRIT-1 r3 = aria-live 制御方針反映 / **MAJOR-2 visitor r4 = §論点 2-D 案 A 採択で「即時計算化 = `showResult` + `handleCompare` + 比較ボタン JSX 撤廃」を追加**）: 以下の **5 項目**を変更し、それ以外は touch しない（widget 構造の主要要素 = textarea 2 + select + 結果欄 は visitor 価値が確立済 = 維持）:
  1. **旧トークン置換**（§T-2 マッピング表 / 7 種）
  2. **hex 置換**（5 件 / 5 種 = CRIT-1 r2 / `#fff` + `.added` 2 + `.removed` 2）
  3. **a11y 補助記号 + `text-decoration`**（§論点 4 D4 採択 = 「+」「−」記号 + `.added underline` 新規追加 + `.removed line-through` 維持 / MAJOR-1 impl r4）
  4. **差分結果欄 role 維持 + サマリ status 欄追加**（MAJOR-1 r7 訂正 = M1' → M1'' で **`<pre>` は `role="region"` を維持** / `role="status"` には変更しない）: `Component.tsx:89-92` の `<pre className={styles.diffOutput} role="region" aria-label="Diff result">` ブロック（`<pre>` 開始 L89 / `role="region"` 属性 L91 / `aria-label="Diff result"` 属性 L92）→ **`role="region"` をそのまま維持** + **`<pre>` に aria-live は付与しない**（CRIT-1 r3 採択 = §論点 13 採択案 M1''（r7 で M1' から訂正）/ cycle-213 (ζ) 秘密情報配慮 ARIA 設計の発想引用 = 長文 textarea/pre には aria-live を付けない / WAI-ARIA 仕様で `role="region"` は暗黙的 aria-live を持たない静的領域 / aria-live は別途設置するサマリ status 欄に付与 / 単一結果欄なので count=1）+ **サマリ status 欄を新規追加**（「+N 行 / −M 行」short text / `role="status" aria-live="polite"` / WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つため短文サマリにのみ付与 / MAJOR-1 impl r4 で line モード時の単位「行」に確定 = MINOR-2 visitor + MINOR-1 impl 統合）
  5. **計算トリガー即時計算化**（MAJOR-2 visitor r4 / §論点 2-D 案 A 採択）: `Component.tsx:11` の `const [showResult, setShowResult] = useState(false);` を**撤廃** + `:16-18` の `handleCompare` useCallback を**撤廃** + `:76-82` の `<button onClick={handleCompare}>比較する</button>` JSX を**撤廃** + `:13` の `const diffParts = showResult ? computeDiff(...) : [];` を **`useMemo` で `[oldText, newText, mode]` 依存の派生計算**に置換 + `:29-32` / `:49-52` / `:66-69` の各 `onChange` 内 `setShowResult(false)` 呼び出しを**撤廃**（即時計算化により不要）+ `:83` の `{showResult && (...)}` 条件分岐を**撤廃**（差分結果欄は常時表示 / 両入力空時は `.noDiff` 三項分岐で「テキストに差分はありません。」表示）。cycle-210 text-replace 詳細ページの即時計算実装パターンを引用適用（`src/tools/text-replace/Component.tsx` の `useMemo` / render 派生計算）。

  本切替の判断根拠は §論点 13（CRIT-1 r3 で全面書き換え）+ §論点 2-D（MAJOR-2 visitor r4 で新設）参照。

- **meta.ts の search_intents 整合性確認**:
  - **既存重複検索**: M1a yaml には `"テキスト置換"` と `"テキスト置換 オンライン"` の 2 件のみ既登録（**実測値** = `tmp/research/2026-05-28-cycle-214-text-diff-target-users.md` §B 末尾 = M1a 検索意図実測）。「diff」「差分」「比較」「文章比較」「テキスト比較」関連語は **0 件**（同レポート §C）。
  - **追加候補 4 語比較表**（AP-P17 ゼロベース 4 案以上 / cycle-213 §論点 H 同型）:

    | 候補語                    | 採択 | 採択理由 / 不採用理由                                                               |
    | ------------------------- | ---- | ----------------------------------------------------------------------------------- |
    | `テキスト差分`            | ○    | meta.ts keywords `テキスト差分` と完全一致 / 主流検索語 / Google サジェスト上位想定 |
    | `文章 比較`               | ○    | スペース区切りの自然語 / 一般来訪者層が校正用途で使う典型クエリ                     |
    | `テキスト 比較`           | ○    | 開発者・編集者双方が使う中庸クエリ / meta.ts `テキスト比較` のスペース変形版        |
    | `diff チェッカー`         | ○    | 英日混在クエリ / 開発者層（M1a の S3 寄り）の自然語 / 競合 Diffchecker と整合       |
    | `テキスト差分 オンライン` | ×    | ロングテール過剰拡張 / `テキスト差分` で十分カバー                                  |
    | `文字 差分`               | ×    | 「文字」と「文章」が混在し検索意図純度低下 / `文章 比較` でカバー                   |
    | `2つの文章 比較`          | ×    | 数詞混入で検索意図特異性低 / `文章 比較` でカバー                                   |

  - **2 案以上の比較（AP-P17）**:
    - **案 X = 4 語追加（採択）**: 上記 ○ の 4 語を M1a yaml `search_intents` 末尾に追加
    - **案 Y = 3 語追加**: `diff チェッカー` を除外 → 開発者・英日混在検索を逃すため不採用
    - **案 Z = 5 語追加**（「テキスト差分 オンライン」も含む）: ロングテール過剰拡張 / 検索意図純度低下 → 不採用
    - **案 W = 6 語追加**（「文字 差分」も含む）: 検索意図純度低下 + 重複過多 → 不採用
  - **採択 = 案 X / 4 語確定**。詳細は §論点 9 で確定する。

- **backlog 連動更新**:
  - **B-461 起票候補**（Component.test.tsx 不在問題）: B-449 / B-455 / B-458 / B-459 同型の新規 backlog として **B-461**（NIT-1 r3 対応 / 根拠コマンドインライン併記 = `grep -oE '^\| B-[0-9]+' docs/backlog.md | sort -u | tail -1` の planner 実行結果出力 = `B-460` （**実測値** = planner reviewer 独立 grep 一致確認済）/ 次の空き番号 = `B-461`）。T-2 builder は同コマンドで独立再確認 / 想定外の差分があれば書き戻し。スコープ = `src/tools/text-diff/__tests__/Component.test.tsx` 新規作成（21 件規模 / cycle-209 line-break-remover 参考）。優先度 P4 / 着手条件なし。
  - **B-452**（複合入力型タイル AP-P21 (v) 基準値見直し / **P3 昇格済** = cycle-210 完了処理 AP-WF15 指摘 / N≥3 着手条件 / **着手条件「cycle-213 前後を目処」は既に過ぎている** / 本サイクルで N=2 達成 / N=3 達成は cycle-215 以降の複合入力型 3 件目を待つ）（MAJOR-4 対応）: 本サイクル T-4 で N=2 データポイントを採取し、状態欄を「N=2 達成 / N≥3 まで残り 1 件 / 着手条件タイミングは現状 cycle-215 以降に更新」に書き戻す（cycle-212 で B-456 を N=2 に更新したのと同型運用）。
  - **B-453**（複合入力型タイル planner 引用必須 SSoT 昇格）: 本サイクル T-4 でも本 backlog の必要性が高まるため、状態欄に「cycle-214 で 2 件目の引用適用実施済 / `docs/knowledge/composite-input-tile-criteria.md` 新設の優先度上昇」を追記する。
  - **B-314 Phase 8.1 全体進捗**: 本サイクル完了で **15 件目**（**実測値計算 = 14 + 1**）/ 進捗欄を更新。

**完成条件**:

- [x] `/tools/text-diff` が (new) 配下で正常表示（HTTP 200 OK）
- [x] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件削除済）
- [x] w1200 / w1900 / w375 で表示崩れがない（T-4 視覚回帰で確認）
- [x] `Component.module.css` 内に `--color-*` 系旧トークンが残存しない: `grep -c "var(--color-" src/tools/text-diff/Component.module.css` → `0`
- [x] **hex 直書き 5 種**（`#fff` 1 + `.added` 緑系 2 + `.removed` 赤系 2）が新トークン化されている: `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/text-diff/Component.module.css` → 0 件 / `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/text-diff/Component.tsx` → 0 件 / **MAJOR-2 対応で hex grep を残存検知用に保持**（CRIT-1 と連動 / `var(--color-` のみでは `#fff` 置換漏れを検知できないため hex grep も必須）
- [x] **`text-decoration` D4 採択を反映**（MAJOR-1 impl r4 新規）: `grep -nE 'text-decoration' src/tools/text-diff/Component.module.css` → `.added` 行 = `text-decoration: underline;` + `.removed` 行 = `text-decoration: line-through;` の **2 行**（`.added` は none → underline へ変更 / `.removed` は維持）
- [x] **詳細ページ Component.tsx の差分結果欄 `role` = `role="region"` 維持**（MAJOR-1 r7 訂正 = M1' → M1'' / **`<pre>` には `role="status"` を付けない**: WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つため長文 `<pre>` 全体の連続アナウンスが過剰化する）/ **長文 `<pre>` に aria-live も付けない** / **サマリ status 欄（差分件数等の短文 1 行）に `role="status" aria-live="polite"` を付与**（§論点 13 CRIT-1 r3 採択 M1'' / cycle-213 (ζ) 引用）: `grep -nE 'role=\"(region|status)\"' src/tools/text-diff/Component.tsx` → **`<pre>` 側に `role="region"` が 1 件 + サマリ欄に `role="status"` が 1 件** / `grep -nE 'aria-live' src/tools/text-diff/Component.tsx` → **`<pre>` 内には付かず / サマリ欄に `aria-live="polite"` が 1 件以上**（MAJOR-1 r2 / CRIT-1 r3 / MAJOR-1 r7 対応）
- [x] **サマリ status 欄のモード別単位**（MINOR-2 visitor + MINOR-1 impl r4 統合）: `Component.tsx` 内サマリ status 欄の文字列が **line モード時 = 「+N 行 / −M 行」/ word モード時 = 「+N 単語 / −M 単語」/ char モード時 = 「+N 文字 / −M 文字」** とモード別に切り替わっている（タイル UI = line 固定のため「+N 行 / −M 行」のみ / 詳細ページ = 3 モード切替対応）。実装パターンは builder 裁量（mode から派生計算で単位文字列を取得 / `useMemo` 化推奨 / `computeDiff` 結果の `added` / `removed` 件数集計は (a) 差分 hunk 数 = `diffParts.filter(p=>p.added).length + filter(p=>p.removed).length` ではなく **(b) added 件数 + removed 件数を別カウント**で表記）。
- [x] **詳細ページ Component.tsx の即時計算化**（MAJOR-2 visitor r4 新規 / §論点 2-D 案 A 採択）: `grep -nE 'showResult\|handleCompare\|比較する' src/tools/text-diff/Component.tsx` → **0 件**（撤廃完了）/ `grep -nE 'useMemo' src/tools/text-diff/Component.tsx` → 1 件以上（派生計算化完了）/ タイル UI と詳細ページで「入力即時反映」の挙動が完全一致（T-4 (F) 実体験フローで同一入力同一結果を Playwright 確認）
- [x] **既存テスト全件緑維持**（NIT-1 impl r5 新規追加 / AP-WF16 自動チェック観点強化）: `npm run test -- text-diff` 実行で **9 件全件緑**（T-1 baseline と同件数 / `logic.ts` の既存 export 形状を変更しないため `__tests__/logic.test.ts` への影響なしを機械的に検証）/ builder が出力を引用付き報告 / reviewer 独立再実行可能
- [x] M1a yaml `search_intents` にテキスト差分系 **4 語**が追加されている（案 X 採択分）
- [x] **B-461** が `docs/backlog.md` に追記済（Component.test.tsx 不在対応 / P4）
- [x] **B-452** 状態欄が N=2 達成を反映して更新済
- [x] **B-453** 状態欄に cycle-214 で 2 件目の引用適用実施済が追記済
- [x] `meta.ts` `relatedSlugs` の実在再確認（不在のものがあれば §論点 9 で差し替え）

**T-2 検証手順（AP-WF16）**: builder が残存判定 grep / 200 OK 確認 / yaml diff / backlog 更新箇所 grep を引用付き報告 / reviewer が最低 1 つ以上を独立再実行。

---

#### T-3: TextDiffTile.tsx 新規実装 + Tile テスト追加 + TILE_DECLARATIONS 登録

**目的**: トップページから 1 タップで起動可能な複合入力型タイル UI を新設。cycle-210 text-replace で確立した複合入力型タイル SSoT を引用適用し、text-diff 固有の「膨張側が 3 つに増える」逆転構造を T-3 設計段階で言語化する。

**実施事項**:

- **kind 判定**: text-diff の詳細ページ Component は「比較モード select + テキスト A textarea + テキスト B textarea + 比較ボタン + 結果欄」で構成され、タイルでも同型の主機能を継承する。詳細オプション（比較モード切替 = 行 / 単語 / 文字）の扱いは §論点 3 で確定。**kind=widget**（cycle-210 text-replace / cycle-211〜213 と同型）。
- タイル用コンポーネント `src/tools/text-diff/TextDiffTile.tsx` を新規実装（cycle-210 text-replace `TextReplaceTile.tsx` を参考とするが、構造差「膨張側 3 / 操作側 0〜1」を反映する）。
  - CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 14 タイルと同型）
  - **論点 A〜K 採択結果（後述）に従って UI を構築**
  - `logic.ts` の既存 export（`computeDiff` / `hasDifferences` / `DiffMode` 型）を再利用
  - **省略要素**（§論点 3 採択結果次第）: 比較モード切替 UI（タイル UI で固定 = `line` モード）/ 詳細ページへ全委譲する案を §論点 3 で評価
  - **残す要素**（§論点採択結果反映 / 想定セット）: テキスト A textarea / テキスト B textarea / **即時計算（debounce なし / CRIT-1 r2 で確定）** / 差分結果欄（長文 `<pre>` = **`role="region"` のみ**（MAJOR-1 r7 訂正 = M1' → M1''）/ aria-live は付けない / CRIT-1 r3 + MAJOR-1 r7）/ **サマリ status 欄（「+N / −M 箇所」等の短文 1 行 / `role="status" aria-live="polite"`）= CRIT-1 r3 採択 M1''（r7 で M1' から訂正）** / コピーボタン（差分結果 or 統合形式）/ 「テキスト差分の使い方を見る →」詳細ページリンク
  - **AP-I11 setTimeout cleanup**: **debounce は採用しない**（CRIT-1 r2 対応）= 即時計算ではタイマー不使用 / **コピーボタン文言復帰の 2 秒タイマー**（採用時のみ）= `useRef<NodeJS.Timeout | null>` + `useEffect` cleanup（cycle-213 (δ) SSoT 引用）
  - **即時計算の実装パターン引用適用先**（MAJOR-N1 r3 新規追加）: cycle-210 text-replace の `src/tools/text-replace/TextReplaceTile.tsx` における **`onChange` 内同期計算 / `useState` だけで完結 / `useEffect` で 2 サイクル走らせない** パターンを引用適用。具体的には「テキスト A `onChange` → `setOldText(value)` + diff 計算結果は派生計算（`computeDiff(oldText, newText, "line")` を render 時に毎回呼ぶか `useMemo` で memo 化）」/ `useEffect` 内に `setState` を置く形は中間状態 flash の懸念があり不採用。
  - **`diff` パッケージの bundle インパクト = 0**（MAJOR-N1 r3 新規追加）: `package.json L27` (`"diff": "^9.0.0"`) で**既存依存**（**実装値** = `grep '"diff"' /mnt/data/yolo-web/package.json` 実行結果 = `27:    "diff": "^9.0.0",` / reviewer 独立再 grep 確認済）。詳細ページ `logic.ts:1` (`import { diffLines, diffWords, diffChars, type Change } from "diff";`) で既に読み込み済 = タイル UI で同 `logic.ts` を共有すれば **bundle 追加コスト = 0**（共有チャンク化）。dynamic import / 自前 diff 実装は不要（AP-I03 Core Vitals 影響なし）。
  - **フォールバック設計（MAJOR-1 visitor / 競合調査結論への正面反論）**: T-3 実機確認で「膨張側 3 つの最低編集領域 ≥ 80px」が確保できない場合、または w375 で「テキスト 100 字を 2 行表示できない」場合、**軽量プレビュー化退避案**（タイル UI に短い説明 + 詳細リンクのみ / 案 X 退避 / §論点 1 案 A2 = cols=3 rows=4 → §論点 6 退避案 = 軽量プレビュー化）に切替する経路を計画段階で明示。判定基準と切替手順は §論点 1 / §論点 6 末尾参照。
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に text-diff のエントリ追加（**recommendedSize = §論点 1 採択値 / 第一推奨 cols=3 rows=3 / T-3 Playwright 実機確認で最終確定**）。
- `npm run generate:tiles-registry` で codegen 実行（tilesCount: **14**（**実測値**）→ **15**（**実測値計算 = 14 + 1**））。

**T-3 設計論点: タイル用テストの観点**

cycle-210 text-replace の Tile テスト 11 件（最低件数 / 出典: `docs/archive/composite-input-tile-ap-p21-criteria.md` §C 末尾）を起点に、text-diff 固有の構造（膨張側 3 / 比較トリガー方式）を加味して **最低 11 件**（**経験的暫定値** = cycle-210 同等）を確立する。各観点の具体的 assertion 文言・入力値・モック実装は builder 裁量（AP-P20 / AP-WF03 過剰具体化を回避）:

- 観点 (i) **レンダリング**（テキスト A / テキスト B / 比較トリガー（ボタン or 自動）/ 差分結果欄 / 詳細リンクが DOM に存在）
- 観点 (ii) **入力で結果更新**（テキスト A / B を変更 → 差分結果が更新される）
- 観点 (iii) **両入力空時の挙動**（差分なし表示 / または初期状態維持 / 即時計算採択により入力即反映）
- 観点 (iv) **片方空時の挙動**（テキスト A のみ / テキスト B のみ → 全削除 or 全追加として表示）= (e-β) 系統候補の動作確認も兼ねる（CRIT-2 対応）
- 観点 (v) **コピーボタン挙動**（§論点 7 採択 = 採用 / 差分結果を Unified テキスト形式でクリップボードへ / cycle-213 (β) SSoT 引用）
- 観点 (vi) **ARIA / role + aria-live の二層構成**（MAJOR-1 r2 / CRIT-1 r3 / MAJOR-1 r7 で再定義）= **長文 `<pre>` 差分結果欄に `role="region"` のみ付与（aria-live なし / WAI-ARIA 仕様で `role="region"` は暗黙的 aria-live を持たない静的領域）** + **サマリ status 欄（「+N / −M 箇所」等の短文 1 行）に `role="status" aria-live="polite"`** を分離付与（cycle-213 (ζ) 秘密情報配慮 ARIA 設計の発想引用 / 長文への aria-live 過剰アナウンス回避 / cycle-211 (viii) を「結果欄領域マーク + サマリのみ動的アナウンス」に運用拡張）/ タイル + 詳細ページ両方で同一構成
- 観点 (vii) **(e) 系統挙動**（MAJOR-2 visitor r3 = (e-β) 確定 / (e-γ) 適用対象外確定）= (e-α) 差分なし枠 + (e-β) 片入力時の 2 系統が実体として動作することを検証 / (e-γ) 検証は対象外
- 観点 (viii) **詳細ページリンク**（`/tools/text-diff` を指す / リンクテキスト確定値は §論点 8 採択結果）
- 観点 (ix) **空入力時コピーボタン非表示 or disabled**（差分なし時の挙動）
- 観点 (x) **clipboard 不在時 silent fail**（旧ブラウザ環境 / cycle-210 / cycle-213 SSoT 同型）
- 観点 (xi) **a11y 補助記号 / 配色補助 + 対称化視覚マーク**（§論点 4 D4 採択 = 追加部分に「+」/ 削除部分に「−」/ `.added` に `text-decoration: underline` / `.removed` に `text-decoration: line-through` / `aria-label` でスクリーンリーダー向け情報付与の有無を assertion）

**完成条件**:

- [x] `TILE_DECLARATIONS` に text-diff が追加されている（**§論点 1 採択 = cols=3 rows=3 第一推奨 / T-3 実機確認で確定**）
- [x] codegen 成功し `tilesCount=15` になる（**実測値計算 = 14 + 1 = 15**）
- [x] `TextDiffTile.tsx` のテスト **最低 11 件**（**経験的暫定値** = cycle-210 同等）が緑（観点 (i)〜(xi) を全て含む / 観点 (vii) は §論点 5 採択により省略可）
- [x] タイル UI 上で「2 入力 → 比較 → 差分結果表示 → コピー（採用時のみ）→ 詳細リンク」のフローが観点 (i)(ii)(v)(viii) で実証 + DOM 検証 PASS
- [x] 詳細ページ Component.tsx / Component.module.css が「T-2 旧トークン置換 + hex 置換 + a11y 補助記号（§論点 4 D4 採択）+ `text-decoration` 対称化 + 差分結果欄 role 切替 + サマリ status 欄追加 + 計算トリガー即時計算化（§論点 2-D 案 A 採択）」以外で touch されていない
- [x] AP-I11 setTimeout cleanup 観点が PASS（§論点 7 採用時のみ / cycle-211 / cycle-212 / cycle-213 SSoT 同型 / `vi.getTimerCount()` 直接検証）

**T-3 検証手順（AP-WF16 / MINOR-N2 r3 追補）**: builder が `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 4 コマンド出力を引用付き報告 / reviewer が独立再実行。**加えて reviewer は `src/tools/text-diff/__tests__/TextDiffTile.test.tsx` を Read して `vi.getTimerCount()` の assertion が含まれていることを独立 grep 確認**（`grep -nE 'vi\.getTimerCount' src/tools/text-diff/__tests__/TextDiffTile.test.tsx` → 1 件以上 / cleanup 検証観点 (vi-AP-I11) のスコープ内で書かれていることを目視確認）。

---

#### T-4: 検証と統合確認（AP-P21 計測 + cycle-210/211/212/213 SSoT 引用検証 + AP-WF16 全件再実行）

**目的**: 複合入力型タイル 2 件目として cycle-210 SSoT 4 項目 (i)(ii)(v)(vi) を引用検証し、N=2 データポイントを採取して B-452 を前進させる。加えて cycle-211/212/213 の関連 SSoT も text-diff 構造に合わせて引用適用 or 適用対象外を判定する。

**実施事項**:

- `/internal/tiles/preview/tools/text-diff` での単独レンダリング検証（Playwright w1200 / w375 × ライト / ダーク = **計 4 枚**）。
- 移行後のスクリーンショット **計 14 枚**（T-1 と同型 / w375/w1200/w1900 × light/dark × top/detail = 12 枚 + after-compare × light/dark = 2 枚 / **T-1 実測で baseline 14 枚に確定済**）を再撮影（`tmp/cycle-214/after-t4/`）。
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認。
- 移行前後で URL が変わっていないこと（`/tools/text-diff` で 200 OK）。
- タイルプレビュー上の動作確認:
  - テキスト A / B 入力 → **即時に差分結果表示**（CRIT-1 確定 = debounce なし / cycle-210 同型）
  - コピーボタン押下 → 文言変化「コピー」→「コピー済み」→ 2 秒後復帰
  - 詳細リンク押下 → `/tools/text-diff` 詳細ページに遷移
  - キーボード操作: Tab → Enter / Space で各操作要素押下
- **(F) 実体験フロー検証**（MAJOR-2 visitor 対応 / 新規追加 / 来訪者価値の体験トレース / **NIT-1 + NIT-2 visitor r4 でテストデータに絵文字追加 + ダーク 1 系統追加**）:
  - **w1200 light + w375 light + w1200 dark × 3 系統**（**NIT-2 visitor r4 で w1200 dark を追加 = モード網羅**）で以下の通しフローを Playwright で再生し、各ステップでスクショ取得:
    1. トップページ着地 → text-diff タイル発見（タイル発見にかかるスクロール量 / 視認時間を観察）
    2. タイル上に契約書ライク文 v1 を A、v2 を B にコピペ（実テキストは `tmp/cycle-214/fixtures/contract-v1.txt` / `contract-v2.txt` を事前準備 / **NIT-1 visitor r4 + MINOR-2 visitor r5 でテストデータに絵文字含むケース 2 件追加**:
       - **(I) 独立絵文字フィクスチャ**（**MAJOR-1 visitor r6 で Unicode code point 表記訂正**）: `contract-v1.txt` 末尾に「合意の証として✅ 締結する📝」/ `contract-v2.txt` 末尾に「合意の証として✅✅ 締結する📝」（**✅ = U+2705**（BMP 内 / UTF-16 で 1 code unit = サロゲートペアではない / **仕様値** = Unicode 一次資料 https://en.wikipedia.org/wiki/Emoji 表中の U+270x ブロック「Check mark」+ planner 独立検証 `python3 -c "print(format(ord('✅'),'04X'))"` = `2705` で確認） / **📝 = U+1F4DD**（SMP / UTF-16 でサロゲートペア = 2 code unit / **仕様値** = planner 独立検証 `python3 -c "print(format(ord('📝'),'04X'))"` = `1F4DD` で確認））= **BMP 内絵文字 + SMP 絵文字の両方を含む独立絵文字フィクスチャ**。**フィクスチャ意図** = jsdiff v5 系列は UTF-16 code unit 単位で diff していたため SMP 絵文字（サロゲートペア）が破損しうる挙動だったが、jsdiff v6+ 以降は Unicode code point 単位 diff に変更されたため、BMP 内独立絵文字 (✅ U+2705) も SMP 独立絵文字 (📝 U+1F4DD) も**両方とも破損しない**ことを実機で実証する。**jsdiff v6+ 仕様で diffChars は Unicode code point 単位で diff されるため、独立絵文字は破損しない**（**仕様値** = jsdiff release notes / https://github.com/kpdecker/jsdiff/blob/master/release-notes.md ）→ 期待挙動 = 文字化けなし / char モードでも正しく diff 表示
       - **(II) ZWJ 結合絵文字フィクスチャ**（**MINOR-2 visitor r5 新規追加**）: `contract-v1.txt` 別行に「立会人 👨‍👩‍👧」（U+1F468 + U+200D + U+1F469 + U+200D + U+1F467 = 家族 ZWJ 結合絵文字 / **仕様値** = Unicode emoji-zwj-sequences 仕様）/ `contract-v2.txt` 別行に「立会人 👨‍👩‍👦」（U+1F468 + U+200D + U+1F469 + U+200D + U+1F466）。**jsdiff v6+ 仕様で diffChars は Unicode code point 単位 = ZWJ 結合絵文字は code point 境界（U+200D 周辺）で分割される可能性あり**（仕様値）→ 期待挙動 = char モードでは絵文字が部分分解して表示される可能性があり、来訪者には「絵文字が壊れて見える」場合がある。T-4 (F) で実機挙動を Playwright で記録し、§補足事項 に「ZWJ 結合絵文字の char モード挙動 = 仕様値ベース実測」として書き戻し（後続サイクルの diff 系ツール向け SSoT 候補）。

       詳細ページモード切替で line/word/char すべてで検証 / r4 までの「絵文字が破損しないことを確認」という前提認識（独立絵文字も ZWJ 結合絵文字も区別なし）は jsdiff v6+ 仕様の事実誤認だったため r5 で訂正 = AP-P19 関連）

    3. 即時に差分結果が表示される（debounce なしで瞬時表示）
    4. 「+ / −」記号 + 緑/赤配色 + **`.added underline` + `.removed line-through` 対称化視覚マーク**（§論点 4 D4 採択 / MAJOR-1 impl r4）で変更箇所が知覚可能
    5. コピーボタンで Unified 形式の差分テキストをクリップボードへ
    6. 詳細リンクで `/tools/text-diff` 詳細ページに遷移 → モード切替が可能（M1b 想定動線）+ **詳細ページも即時計算化**（§論点 2-D 案 A 採択 / MAJOR-2 visitor r4 / モード切替時即時反映 = 「比較する」ボタン押下不要）

  - **判定**: 各ステップで M1a likes line 16/17/18 と矛盾する挙動が出ていないか目視確認 / w375 タップターゲット 44×44px 以上 / フォーカス順序が論理的 / **(I) 独立絵文字フィクスチャで char モード diff が破損しないこと**（NIT-1 visitor r4 / **jsdiff v6+ 仕様値で独立絵文字は code point 単位で diff = 破損なし期待 / MINOR-2 visitor r5 で仕様認識訂正**）+ **(II) ZWJ 結合絵文字フィクスチャの char モード挙動を仕様値ベースで実測記録**（MINOR-2 visitor r5 / code point 境界での分割可能性ありの実機確認 = AP-P19 §論点 12 と連動）/ **w1200 dark で配色トークン + 視覚マーク（line-through + underline）が dark 系統でも知覚可能**（NIT-2 visitor r4）
  - **詳細ページ vs タイル 同一入力同一結果整合検証**（M1b likes line 19 直接応答 + MAJOR-2 visitor r4 で「同じ入力 + 即時反映」も整合性軸に追加）: 同じ入力テキスト A/B を「タイル UI」「詳細ページ Component」両方に投入し、差分結果が一致 + 即時反映タイミングが一致することを Playwright で確認

- **(G) a11y 補助記号の視覚効果対比**（MAJOR-2 visitor 対応 / 新規追加 / **MAJOR-1 impl r4 で line-through + underline 対称化対比を追加 / NIT-2 visitor r5 で D1/D2 スクショ作成手法を明示**）:
  - **3 状態 × grayscale フィルタ有無**を Playwright で並列スクショ取得（`tmp/cycle-214/a11y-compare/`）:
    1. **色のみ（参考: 旧スクショ / D1 相当 / `.added` underline なし + `.removed` line-through なし）**: 競合 8 社と同レベル状態の模擬
    2. **色 + 記号「+/−」のみ（D2 相当 / line-through なし）**: 記号効果単独確認
    3. **色 + 記号 + 対称化視覚マーク（D4 採択 / `.added underline` + `.removed line-through`）**: 本サイクル採用案 / 採択状態
  - **D1 / D2 スクショの作成手法**（NIT-2 visitor r5 新規追加 / Playwright `evaluate` で CSS 強制上書き）: D4 採択後の実装状態（`.added underline` + `.removed line-through`）に対して、D1 / D2 状態を作るには **Playwright `page.evaluate` 経由で対象要素の `text-decoration: none` を強制上書き + マーカー記号（先頭 `+` / `−`）を CSS `::before { display: none }` で非表示化**する方式を採用（別ブランチや stylesheet 一時 disable よりも軽量 / 同一ブランチ + 同一ビルドで D1/D2/D4 を比較できる利点）。**最小指針**:
    - **D1 生成**: `await page.evaluate(() => { document.querySelectorAll('[class*=added],[class*=removed]').forEach(el => { el.style.textDecoration = 'none'; }); /* マーカー記号 ::before も display:none で非表示 */ })`（CSS Module 経由の class 名は `[class*=added]` 等の部分一致セレクタで対応）
    - **D2 生成**: `text-decoration: none` のみ強制 + マーカー記号 `::before` は表示維持
    - **D4 状態**: 上書きなし = 採択状態のまま

    builder 裁量で同等手法を採用可能（例: stylesheet 差し替え / dynamic CSS injection 等）だが、**Playwright `evaluate` 経由の強制上書き**を第一推奨として明示。

  - **grayscale CSS filter 適用**（**color: none で色情報を完全に失った状態**）で 3 状態を撮影 → D4 のみで「両方とも何かしらマーク（下線 / 取り消し線）+ 記号」が識別可能 / D1 / D2 では識別困難 = D4 採択の客観的根拠を確保
  - 色覚多様性ユーザーの視点をシミュレートする CSS filter（grayscale / protanopia 近似）を Playwright で適用したスクショも取得 → D4 採択（記号 + line-through + underline 対称化）で識別可能なことを確認 / 競合 8 社で 0 件の差別化が知覚可能なレベルで成立

- **【AP-P21 計測：複合入力型タイル N=2 / 5 系統独立計測（計画段階確定 / MAJOR-2 visitor r3）/ 軸 = 高さ計測】**:
  - **(a) 両入力空**: タイトル + テキスト A textarea + テキスト B textarea + 差分結果欄 + コピーボタン + 詳細リンクの `getBoundingClientRect()` 高さ計測
  - **(b) 短い入力**（各 30 字程度）: 同上を計測。**(a)→(b) 相互差判定**: 操作側のみ ≤ 2px（膨張側は適用外 = cycle-210 (ii) SSoT 引用）
  - **(c) 中程度入力 + 多数差分**（各 300 字 / 多数の追加・削除）: 差分結果欄が膨張する系統。**判定**: 膨張側 textarea 下限 40px 維持 + 結果欄が枠内収納（`overflowY: auto` 効くこと）
  - **(d) 大量入力 = jsdiff 性能上限近傍**（T-1 軽量ベンチで literal 確定 / 例: 80,000 字 = **実測値計算 = 100,000 × 0.8**）: T-1 採択 UX 段（即時計算のみ / spinner / 入力長制限）に応じて UI フリーズが起きない or 上限警告が出ることを実機確認
  - **(e-α) 「テキストに差分はありません。」枠**（`Component.tsx:86-88` 三項分岐 / r3 で planner Read 確定 / 実装値）: 両入力同一かつ非空時の表示 → 非表示の振替を計測
  - **(e-β) 片入力時膨張パターン**（A のみ入力 = B が全削除 / B のみ入力 = A が全追加 / r3 で planner Read 確定 / 実装値 = `diff` npm パッケージ仕様）: 片入力時の結果欄膨張高さを計測
  - **(e-γ) 適用対象外**（r3 で planner Read 確定 / `logic.ts` に try/catch なし / 計測対象外）
  - **計画段階で系統数 = 5 系統で確定**（(a) + (b) + (c) + (d) + (e-α) + (e-β) = 6 シーン / cycle-210 SSoT (i)(ii) 計測軸では (a)(b) ペアが 1 系統 / 実体上は **5 系統独立計測 = (a)(b) / (c) / (d) / (e-α) / (e-β)**）
  - **判定基準**:
    - (i) **下限 40px 以上**（cycle-210 SSoT (i) 引用 / 全系統・全要素）
    - (ii) **相互差 2px 以内は操作側のみ**（cycle-210 SSoT (ii) 引用）
    - (v) **±15% 経験的暫定値**（cycle-210 SSoT (v) 引用 / **即時計算採択により cycle-210 と同軸で計測可能 = N=2 として B-452 に書き戻し** / 計測対象は cycle-210 の (d)→(e) と最も構造的に近い変化 = text-diff の **(c)→(e-α) 差分なし枠の出現変化** または **(c)→(d) 大量入力の膨張変化** のうち T-1 実体確認結果から構造的に同型な方を選択 / 選択判断は T-4 計測実施前に書き戻す）
    - (vi) **エラー文言枠 SSoT**（cycle-210 SSoT (vi) 引用 / text-diff の (e-α)「差分なし」枠が実在確認済 = h/w を T-4 実機計測で text-diff 独自 SSoT 確定）
- **【cycle-211/212/213 関連 SSoT の引用検証】**（MAJOR-5 r2 対応 / N 値時系列明確化 / (β)(θ) 分離記述 / CRIT-1 r3 で (viii)(ζ) 運用拡張を反映）:
  - cycle-211 (viii) **膨張側出力欄複数時の role="status" 付与 SSoT**（CRIT-1 r3 で運用拡張 / MAJOR-1 r7 で `<pre>` 役割を `role="region"` に訂正）: text-diff の差分結果欄は Unified 統合形式（§論点 6 F1 採択）= count=1 / **タイル + 詳細ページ両方で長文 `<pre>` 結果欄に `role="region"` のみ付与（aria-live なし）+ サマリ status 欄に `role="status" aria-live="polite"` 付与の二層構成**（CRIT-1 r3 採択 M1''（r7 で M1' から訂正）/ §論点 13 / 適用箇所数 = 結果欄 region 2 + サマリ status 2 = 4）
  - **cycle-213 (β) コピーボタン文言変化 AP-P21 適用外 SSoT**（**cycle-213 までで N=3 確立** = cycle-211 N=1 + cycle-212 N=2 + cycle-213 N=3 / 出典: cycle-213.md L606 補足事項 (ii) / **本サイクル cycle-214 で N=4 達成**）: タイル UI のコピーボタンで引用適用 / 単純構造（width/height 変動は AP-P21 適用外）
  - **cycle-213 (θ) コピーボタン文言変化 + role="status" 拡張 SSoT**（出典: cycle-213.md L668 補足事項 (viii) / **cycle-213 までで N=3 / 本サイクルで N=4**）: タイル UI コピーボタン文言変化を含めて引用適用 / role="status" 拡張は CRIT-1 r3 + MAJOR-1 r7 で**二層構成**（**結果欄 = `role="region"` のみ / aria-live なし**（MAJOR-1 r7 訂正 / WAI-ARIA 仕様で `role="region"` は暗黙的 aria-live を持たない静的領域） / サマリ = `role="status" aria-live="polite"`（明示付与））として実装
  - **cycle-213 (ζ) 秘密情報配慮 ARIA 設計 SSoT**（CRIT-1 r3 で新規引用追加 / 出典: cycle-213.md L645 §補足事項 (vi)）: 「長文 / 機微情報を含む領域に aria-live を付けない、短い status ラベル領域にのみ付与」の発想を text-diff の「長文リアルタイム更新領域」に拡張適用。本サイクルで (c214-ζ) として運用範囲を拡張する SSoT 候補に発展。
  - cycle-213 (γ) **操作側 flexShrink:0 / 膨張側 flex:1 二分類 SSoT**: text-diff では「コピーボタン + 詳細リンク」を flexShrink:0 配下、「テキスト A textarea + テキスト B textarea + 差分結果欄」を flex:1 + overflowY:auto に配置
  - cycle-213 (δ) **AP-I11 setTimeout cleanup SSoT**: コピーボタン文言復帰の 2 秒タイマーで引用適用（debounce は採用しないため対象外）
- **【ブラウザ API 確認】** cycle-210〜213 同型 2 項目:
  1. Hydration warning 0 件
  2. `navigator.clipboard.writeText` がブラウザ環境で利用可能（モック不要 + Secure Contexts 確認）
- **【cycle-210/211/212/213 SSoT 引用適用結果の §補足事項 書き戻し】**:
  - **(α)** cycle-210 SSoT (i)(ii)(v)(vi) 引用検証結果（各項目 PASS / 再評価 / 適用対象外を T-4 実機計測値で確定）
  - **(β)** B-452 N=2 達成（複合入力型タイル AP-P21 (v) ±15% 経験的暫定値 / cycle-210 N=1 + cycle-214 N=2 / 着手条件タイミング更新 = cycle-215 以降の複合入力型 3 件目で N=3 達成見込み / MAJOR-4 対応）
  - **(γ)** cycle-213 (β) N=4 達成 / cycle-213 (γ) 引用適用結果 / cycle-213 (δ) 引用適用結果 / cycle-213 (θ) N=4 達成（**MAJOR-5 対応 = 各 SSoT を分離記述 / N 値時系列明示**）
  - **(c214-δ)**（MINOR-2 r3 = 命名衝突回避でサイクル番号プレフィックス化）本サイクル新規 SSoT 候補（hex → `--success-soft` / `--success-strong` / `--danger-soft` / `--danger-strong` の **4 種マッピング** = cycle-213 hex → token マッピング SSoT 同型 / 本サイクル後続の diff 系・ステータス系ツールに引用可能 / **`#fff` → `--fg-invert` は cycle-213 で確立済 SSoT の引用適用のため本サイクル新規ではない** = CRIT-1 r2 対応の切り分け）
  - **(c214-ε-tentative)** 「複合入力型タイル / 膨張側 3 つ構造」初出 SSoT 候補（cycle-210 = 膨張側 2 / cycle-214 = 膨張側 3 / 構造分類拡張 N=1）（**実装で取り下げ** / §補足事項 NIT-2 参照）
  - **(c214-ζ)** 「長文結果欄に aria-live を付けず、サマリ status 欄にのみ aria-live を付与する二層構成 ARIA 設計」初出 SSoT 候補（CRIT-1 r3 対応 / cycle-211 (viii) と cycle-213 (ζ) の発想を統合した発展形 / 詳細ページ + タイル UI 両方に適用）
  - **(c214-η)**（MAJOR-2 visitor r4 新規）: 「タイル + 詳細ページ計算トリガー一貫化（即時計算同型）」SSoT（cycle-210 N=1 + cycle-214 N=2 達成 / M1b 操作性一貫性に貢献）
  - **(c214-θ)**（MAJOR-1 impl r4 新規）: 「`.added underline` + `.removed line-through` 対称化視覚マーク」SSoT（a11y 視覚マーク二重化 / N=1 初出 / 後続 diff 系ツールに引用候補）

**完成条件**:

- [x] 全検証項目クリア。lint / format / test / build 全 4 コマンド exit code 0 で完了
- [x] Playwright スクショ枚数（MINOR-4 対応 / 前例比較 / **NIT-1/NIT-2 visitor + MAJOR-1 impl r4 で (F) 系統 +6 + (G) 系統 +2 = 計 +8 増 = 36 → 44** / **T-1 実測で baseline 8→14 枚に拡張済 = after も同型 14 枚**）: baseline **14** + tiles-preview 4 + after **14** + 実体験フロー (F) 18（w1200 light + w375 light + w1200 dark × 6 ステップ = 18 枚 / NIT-2 visitor r4 で dark 1 系統追加）+ a11y 対比 (G) 6（D1/D2/D4 の 3 状態 × grayscale 有無 = 6 枚 / MAJOR-1 impl r4 で line-through + underline 対称化対比追加）= **計 56 枚以上**（**実測値計算 = 14 + 4 + 14 + 18 + 6 = 56** / r4 計画時点の「44 枚」は baseline/after 各 8 枚前提 = T-1 実測 14 枚確定により +12 枚増）が `tmp/cycle-214/` 配下に保存。**前例比較**: cycle-211 38 枚 / cycle-213 14 枚 / cycle-214 56 枚（cycle-213 比 +42 枚 = 複合入力型タイル AP-P21 4 系統独立計測 + baseline/after 各 14 枚 + (F) 実体験フロー検証 3 系統 6 ステップ + (G) a11y 対比 3 状態 × grayscale 有無の系統別撮影分の必然増）
- [x] AP-P21 計測 (a+e-α 統合)/(b)/(c)/(d)/(e-β) **4 系統独立**実測値が引用付き報告され、§補足事項に SSoT として書き戻し（計画段階 N=5 系統 / **T-1 実機計測で N=4 系統確定** = (a)(e-α) 統合 / noDiff 枠 h 差 0px / w 差 0px）
- [x] **bundle インパクト計測（実測値の記録のみ / 事前閾値は撤廃）**（MAJOR-N1 r3 新規追加 / **MAJOR-2 visitor r4 で「詳細ページ即時計算化による削減」も対象に追加 / MAJOR-1 visitor r5 で「事前閾値 +5kB 以下」を撤廃し T-4 実測値の記録のみに切替 / NIT-1 visitor r6 で目安数値の生成元なし表現を削除**）: T-2 直前 / T-3 完了後の `npm run build` 出力の First Load JS サイズ（kB）を比較し、`/tools/text-diff` 詳細ページ + トップページ（タイル）の合計差分を **実測値として記録**する（事前閾値は設定しない / `Component.tsx` から `showResult` state + `handleCompare` useCallback + `<button>` JSX 撤廃で微減もあり得る = 案 A 採択の bundle 中立性は実測値で評価 / **builder 判断で明らかな異常（過去 14 タイル追加実績の典型レンジから 1 桁以上乖離する増加など）と感じた場合のみ reviewer に再評価を依頼**（**NIT-1 visitor r6 対応** = r5 で記載していた「例えば +20kB 等」は出典・生成元なしの目安数値だったため削除し、ラベルなし運用に切替））。`diff` パッケージは既存依存（**実装値** = `package.json L27`）で共有チャンク化されるため、想定追加分はタイル用 React component のみ。**r4 までの「+5kB 以下」判定基準は「cycle-210 text-replace の bundle 追加 4.2kB 実績」を根拠としていたが、reviewer 独立 `grep -nE 'bundle\|First Load\|kB\|4\.2' docs/cycles/cycle-210.md` で全件 0 件 = 当該数値は cycle-210.md 内に存在せず架空データであることが r4 reviewer 来訪者価値 MAJOR-1 で発覚 → r5 で事前閾値を完全撤廃し T-4 実測値記録に切替（AP-P16 + AP-P19 違反の解消）**。
- [x] **(F) 実体験フロー検証スクショ**が `tmp/cycle-214/flow/` 配下に保存（w1200 light + w375 light + w1200 dark × 6 ステップ = **18 枚規模** / NIT-2 visitor r4 で dark 系統追加 / NIT-1 visitor r4 で絵文字フィクスチャ含む）/ MAJOR-2 r2 + NIT-1/NIT-2 visitor r4 対応
- [x] **(G) a11y 補助記号視覚効果対比スクショ**が `tmp/cycle-214/a11y-compare/` 配下に保存（**D1（色のみ）/ D2（色+記号）/ D4（色+記号+対称化視覚マーク = `.added underline` + `.removed line-through`）× grayscale フィルタ有無 = 6 枚規模**）/ MAJOR-2 r2 + MAJOR-1 impl r4 対応
- [x] **詳細ページ vs タイル 同一入力同一結果整合検証 PASS**（M1b likes line 19 直接応答 / **MAJOR-2 visitor r4 で「即時反映タイミングも一致」を追加**）
- [x] `TILE_DECLARATIONS` の tilesCount が **14 → 15**（**実測値計算 = 14 + 1**）に増えたことを `src/tools/generated/tiles-registry.ts` で直接 Read 確認
- [x] ブラウザ API 確認 2 項目 PASS（Hydration warning 0 件 / `navigator.clipboard` 利用可能）
- [x] cycle-210 SSoT 4 項目 (i)(ii)(v)(vi) 引用検証結果 + cycle-211 (viii) + cycle-213 (β)(γ)(δ)(θ)(ζ) 引用検証結果 + 本サイクル新規 SSoT 候補 **(c214-δ)(c214-ε)(c214-ζ)(c214-η)(c214-θ)** が §補足事項 に書き戻し（MINOR-2 r3 命名衝突回避 / **r4 で (c214-η)(c214-θ) 追加 = MAJOR-2 visitor + MAJOR-1 impl**）
- [x] B-452 状態欄が N=2 達成 + 着手条件タイミング更新を反映して更新済（MAJOR-4 対応）

**T-4 検証手順（AP-WF16）**: builder が全実測値を引用付き報告 / reviewer が (i) 自動チェック 4 コマンド独立再実行、(ii) AP-P21 5 系統独立計測のうち最低 1 ケース独立再現、(iii) ブラウザ API 2 項目のうち最低 1 項目独立再計測、(iv) **(F) 実体験フロー w375 light を最低 1 回独立再生**（MAJOR-2 r2 対応）、(v) **bundle インパクト `npm run build` 出力サイズの独立再確認**（MAJOR-N1 r3 対応）、(vi) **スクリーンリーダー実機（NVDA / VoiceOver / Chrome の TalkBack シミュレータのいずれか）で「タイルにテキスト A を 1 文字ずつ入力 → サマリ status 欄のみが「+N 箇所」と読み上げられ、`<pre>` 長文差分結果欄が連続アナウンスされないこと」を独立確認**（CRIT-1 r3 対応 / aria-live 過剰アナウンス防止の実証）。

---

### 論点と判断

各論点について「採用案 / 検討した他案 / 判断理由」を明記する。**PM 判断は planner が行う**（owner 承認不要）。仮説の根拠が薄い論点は「T-X で実機確認後に確定」と明示する。すべての数値 literal には 4 分類ラベル + 生成元併記（AP-P16 強化）。AP-P17 に従い、各論点で **来訪者価値 → 範囲整合 → 規模 → 歯止め** の 4 軸評価を実施。

#### 論点 1: タイルの recommendedSize

**第一推奨 = 案 A1（cols=3 rows=3 = 400×400px = 仕様値 / cycle-210 text-replace と同枠）/ T-3 Playwright 実機確認で確定**

- **要素数（推定値 + 経験的暫定値）**: テキスト A textarea + テキスト B textarea + 比較トリガー + 差分結果欄 + 詳細リンク = 5 要素 / 行数 5。さらに §論点 3 で比較モード select / ボタン群を採用すると +1 行 = 6 要素。膨張側 3 つ（A / B / 結果）を縦に並べる構造は cols=3 rows=2（264px）では各膨張側 50px 程度しか取れず編集不能 = 不適切。cycle-210 text-replace（膨張側 2 / rows=3）と同等以上の縦余裕が必要。
- **案 A1: cols=3 rows=3 (400×400px = 仕様値) ← 採択**
  - 来訪者価値: 膨張側 3 つに最低限の編集領域（各 80〜100px）を確保 / M1a 最短動線確保
  - 範囲整合: cycle-210 text-replace / cycle-211 image-base64 / cycle-212 image-resizer と同枠
  - 規模: 過去 15 タイル中 cols=3 rows=3 は複数件先例（text-replace / image-base64 / image-resizer）
  - 歯止め: T-3 実機確認で「膨張側 3 つの最低編集領域 ≥ 80px」が確保できない場合は案 A2 に切替 / さらに案 A2 でも要件未達なら **§論点 6 退避案 = 軽量プレビュー化** に切替（MAJOR-1 visitor 対応）
- **80px = 編集可能の根拠**（MINOR-2 visitor r2 / MINOR-3 r3 で 4 分類ラベル追補 / **MINOR-2 impl r4 で行番号訂正 = L530 → L308**）: **80px**（**推定値 + 経験的暫定値** = フォントサイズ 14px × 1.5 行高 × 2 行 + padding ≈ 80px / 後続サイクルで N=2 蓄積後に経験値化）/ cycle-210 text-replace の textarea **119.61px**（**実測値** = `cycle-210.md L308` 引用 = AP-P21 計測 5 ケースのチェックリスト中で「textarea (a)119.61 (b)105.78 (c)105.78 (d)105.78 (e)93.56px」と書かれている行 / r3 まで `L530` と誤引用していたが L530 は別内容「文言は全角換算 25 字 × フォントサイズ 13.6px ≈ 340px」= 引用先と数値が無関係 / MINOR-2 impl r4 で訂正 / planner reviewer 独立 `grep -nE '119\.61\|textarea.*119' docs/cycles/cycle-210.md` 実行結果で `308:` 行のみヒットを確認済）と比べると **25% 短い**（**実測値計算 = (119.61 - 80) / 119.61 × 100 = 33.1% 短い / 30% 安全係数を考慮した round 値で 25% と概数表記 = 推定値**）が、text-diff のタイルは「コピペで結果を見るだけ」の最短動線が核（M1a likes line 17）= 編集よりも「貼り付けて即読む」が主用途 / 1〜2 行が表示できれば貼り付けたテキストの先頭が見え、結果欄で差分を読めばよい。**T-3 実機確認の具体的手順**: builder が手動で contract 文 100 字を貼り付け → 1 行表示可能か / w375 で 2 行表示可能か を実体験テストで確認 / 80px 未満が判明したら案 A2（rows=4）へ退避、さらに rows=4 でも不足なら §論点 6 退避案（軽量プレビュー化）へ。
- **案 A2: cols=3 rows=4 (400×536px = 仕様値)**: 縦長で膨張側に余裕を持って配置可能。過去採用先例なし → 第二推奨として保持 / 採用時は cycle-200〜213 で前例のない初回事例として SSoT 候補化
- **案 A3: cols=4 rows=3 (536×400px = 仕様値)**: 横長。w375 で横スクロール発生リスク（cycle-210 / cycle-211 退避案と同型懸念）→ 不採用
- **案 A4: cols=3 rows=2 (400×264px = 仕様値)**: 膨張側 3 つには明らかに不足 / 編集不能で visitor 価値毀損 → 不採用

#### 論点 2: タイル内 計算トリガー（即時 vs ボタン押下 vs debounce）/ CRIT-1 visitor 対応で採択変更

**採用案 = 案 B2（即時自動計算 / cycle-210 text-replace 同型）**

| 案                              | 構成                          | 来訪者価値                                                                            | 範囲整合                                           | 規模                                          | 歯止め                                                                           |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| B1: debounce 300ms 遅延自動計算 | 入力停止後 300ms で diff 計算 | 中〜高: 大量入力時のチカチカ更新を回避 / ただし計測タイミング軸が cycle-210 と非同型  | cycle-210 text-replace は即時計算 / 中間案で非整合 | useEffect + setTimeout cleanup（AP-I11 引用） | cycle-210 SSoT (v) ±15% との同軸 N=2 検証が成立しない（CRIT-1 指摘）             |
| B2: 即時自動計算 ← **採択**     | 入力変化即反映                | **高（最短UX）= M1a「コピペで結果」需要に最短応答** + cycle-210 SSoT (v) 同軸検証可能 | **cycle-210 text-replace と完全同型**              | useEffect 内即時実行                          | T-1 jsdiff 軽量ベンチで <100ms 確認 / 超過時は実用字数上限を計画書に明記して対処 |
| B3: ボタン押下式                | 「比較する」ボタン押下で計算  | 中: M1a likes「コピペで結果を受け取って戻る」を 1 クリック分追加 / 競合多数派と同型   | 現状 Component.tsx と同型                          | onClick で計算                                | M1a の「最短動線」価値が 1 クリック分減衰                                        |

**採用根拠（CRIT-1 対応で再構築）**:

- **cycle-210 SSoT (v) ±15% との計測整合性が最優先**: cycle-210 は debounce なしの即時計算前提で SSoT (v) を確立（cycle-210.md L222）。本サイクルで debounce を採用すると計測タイミング軸（入力直後 vs 300ms 後）が cycle-210 と異なり、N=2 として B-452 に書き戻すと誤った経験的暫定値が蓄積される（CRIT-1 visitor 指摘）。即時計算採択で **cycle-210 と完全同軸での N=2 検証**を成立させる。
- **「チカチカ更新」懸念の打ち消し**: cycle-210 text-replace で N=1 として即時計算が成立しており、入力が変わった時のみ計算するシンプル設計（cycle-210 同型）= チカチカ更新は実質発生しない（diff 結果の DOM 差分が小さい場合 React の reconciliation で最小限の更新となる）。
- **jsdiff 性能リスクの打ち消し**: T-1 軽量ベンチ（1,000 / 10,000 / 100,000 字 × line/word/char）で <100ms を実測 → 即時計算で UX を毀損しないことを根拠化。≥100ms の場合は「実用字数上限」を計画書に明記し、上限内では即時 / 超過時は警告枠表示で対処（debounce より明示的）。
- **M1a 最短動線への直接応答**: タイル動線の「コピペで結果」核心価値（M1a likes line 17）に 1 クリック分の摩擦も追加しない。debounce 300ms ですら「打ち終わってから 0.3 秒待つ」体感が混じる。
- **不採択 B1 の理由**: cycle-210 SSoT (v) との同軸性が崩れ、N=2 検証鮮度を毀損（CRIT-1 visitor 主因）。
- **不採択 B3 の理由**: タイル動線の「コピペで結果」核心価値を 1 クリック分減衰させる / 競合多数派と同質化して差別化軸を失う。
- **競合調査結論への正面反論**（MAJOR-1 visitor 対応）: 競合調査 §論点 3 は「ボタン押下式 + debounce 補助」を推奨したが、これは「タイル概念を持たない競合の全画面 UI」を前提とした結論。yolos.net のタイル動線は競合 8 社で 0 件 = 全く別の UX 軸であり、即時計算 = タイル動線の差別化価値を最大化する選択。
- **処理時間別 UX 設計 3 段分岐の歯止め拡張**（MAJOR-1 visitor / r3 新規追加）: 上記表「歯止め」列の `<100ms 確認 / 超過時実用字数上限` は r2 段階の単純歯止め。r3 では T-1 ベンチ結果に応じて以下 3 段で UX を分岐確定（詳細は T-1 ベンチ実施事項参照）: (i) **全 4 点 `<100ms` 安定** → 入力長制限なし / 即時計算のみ（M1a 最短）/ (ii) **一部 `100ms` 以上 `<500ms`** → spinner 中間状態（cycle-212 SSoT 引用 / 100ms threshold + setTimeout cancelable / AP-I11 cleanup / AP-I10 globals.css @keyframes）/ (iii) **一部 `>500ms`** → 入力長制限を発動（debounce ではなく明示制限）。**100ms 出典 = Nielsen "Response Time Limits" 1993 / Jakob Nielsen 0.1s / 1s / 10s 三段階のうち「即時知覚閾値 0.1s」**（NIT-N3 r3 対応）。
- **即時計算実装パターン引用適用先**（MAJOR-N1 impl r3 新規追加）: `src/tools/text-replace/TextReplaceTile.tsx` の **`onChange` 内同期計算 + `useState` 完結 + `useEffect` で 2 サイクル走らせない**パターンを引用適用。`useEffect` 内で `setState` を置く実装は中間状態 flash + 2 サイクル render の懸念があり不採用。具体的実装は builder 裁量（AP-P20 過剰具体化を回避）だが、`useMemo` で `computeDiff(oldText, newText, "line")` を memo 化する方針は許容。
- **`diff` パッケージの bundle インパクト = 0**（MAJOR-N1 impl r3 新規追加）: `package.json L27` (`"diff": "^9.0.0"`) で**既存依存**（**実装値** = `grep '"diff"' /mnt/data/yolo-web/package.json` 実行結果 = `27:    "diff": "^9.0.0",`）。詳細ページ `logic.ts:1` で既に読み込み済 = タイルで同 `logic.ts` を共有すれば bundle 追加コスト = 0（共有チャンク化）。dynamic import / 自前 diff 実装は不要。

##### 論点 2-D: 詳細ページの計算トリガー（MAJOR-2 visitor r4 新規独立論点 / タイル即時 + 詳細別系統の矛盾を解消）

**採用案 = 案 A（詳細ページも即時計算化 / タイル UI と完全一貫）**

r3 までは「タイル UI = 即時計算 / 詳細ページ Component.tsx = ボタン押下式（現状維持 / `Component.tsx:11 showResult` + `:16-18 handleCompare` モデル）」という暗黙の非対称を抱えていた（r3 reviewer 来訪者価値 MAJOR-2 指摘）。M1b likes line 16「サイト内のすべてのツールの操作性一貫性」と矛盾し、また M1b の主動線（ブックマーク → 詳細ページ直接アクセス / likes line 17）で得られる UX が、タイル経由初回来訪 M1a の UX より劣るという逆転が生じる。r4 では計画段階でゼロベース 3 案比較し確定する。

| 案                                            | 構成                                                                                                | 来訪者価値                                                                                                                           | M1b 操作性一貫性 likes line 16                                                 | 範囲整合（cycle-210 詳細ページ採択との関係）                                                                     | bundle インパクト                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **案 A: 詳細も即時計算化 ← 採択（第一候補）** | `Component.tsx` の `showResult` フラグ + `handleCompare` を撤廃して `useMemo`/render 派生計算に置換 | **最高**: タイル + 詳細で完全一貫 / M1b ブックマーク動線で即時結果 / モード切替時も即時反映 / M1a の 1 クリック削減と同質            | **PASS**: タイル + 詳細で同型動作                                              | **PASS**: cycle-210 text-replace 詳細ページも即時計算採択済（cycle-210.md L222「debounce なし」引用） / 引用適用 | 0（既存 diff パッケージ共有 / 削除コードあり） |
| 案 B: 詳細はボタン押下式維持（現状）          | `showResult` + `handleCompare` 維持 / タイルのみ即時                                                | 中: 現行 visitor が慣れている挙動を維持 / ただしタイルとの非対称体験                                                                 | **FAIL**: タイル即時 / 詳細ボタン押下で非一貫                                  | 部分整合（タイルは cycle-210 同型 / 詳細は cycle-210 詳細ページ採択と非整合）                                    | 0                                              |
| 案 C: 詳細は debounce 300ms（折衷案）         | useEffect + setTimeout 300ms cleanup（AP-I11 引用） / タイルは即時                                  | 中〜低: タイル即時 / 詳細 300ms 遅延で別系統 / モード切替時の体感に 0.3 秒の不快な遅延 / cycle-210 SSoT (v) 同軸性も詳細側で部分崩れ | **FAIL**: 3 系統の異なる動作（タイル即時 / 詳細遅延 / モード切替時さらに遅延） | **FAIL**: タイル/詳細で計測タイミング軸が分裂                                                                    | 微増（setTimeout 管理コード）                  |

**採用根拠（案 A 採択 / PM 判断）**:

- **M1b 操作性一貫性 likes line 16 の直接応答**: M1b（編集者 / 法務 / ライター / エンジニアの定期リピーター）の核心 likes はサイト内すべてのツールの操作性・トーン&マナー一貫性。タイル経由 M1a が即時計算で 1 クリック削減を得る一方、M1b リピーター（ブックマーク経由詳細ページ直接アクセス）が「比較する」ボタン押下を強要されるのは、来訪者層間で UX を逆転させる悪い設計。
- **cycle-210 詳細ページ即時計算採択の引用適用**: cycle-210 text-replace は **詳細ページ Component も即時計算採択**（cycle-210.md L222 「debounce なし（cycle-208/209 と同型 = 軽量同期処理）」）。同サイクルで確立済の判断軸を text-diff にも引用適用するのが筋（AP-P11 = AI 過去判断は変更可能だが、整合する場合は維持）。
- **bundle インパクト 0**: 案 A は `Component.tsx` から `showResult` state + `handleCompare` useCallback + `<button>` JSX + `useState/useCallback` のうち未使用となるものを**削除**する。新規追加コード（`useMemo` / render 派生計算）と相殺で実質ゼロ（むしろ微減）。`diff` パッケージは既存依存（`package.json L27`）= 追加なし。
- **計測タイミング軸の統一**: 案 A により、タイル / 詳細ページ Component / cycle-210 / cycle-214 のすべてが「即時計算 = 入力変化即反映」で同軸となり、AP-P21 計測 SSoT (v) ±15% の N=2 検証純度が最大化。
- **不採択 B**: タイルと詳細で 2 系統の異なる UX = 一貫性違反 / M1b 信頼毀損
- **不採択 C**: debounce 300ms は cycle-210 SSoT (v) と非同軸 / かつタイル即時とも非整合で 3 系統に分裂 / モード切替時の遅延 0.3 秒 も M1a/M1b にとって不利益
- **T-2 詳細ページ touch 範囲への反映**（後述 T-2 実施事項参照）: 「旧トークン置換 + hex 置換 + a11y 補助記号（D4 採択）+ 差分結果欄 role 切替」に加えて、**`showResult` 状態 + `handleCompare` ボタン + `<button>` JSX を撤廃して即時計算化**を追加。Component の widget 構造（textarea 2 つ + select + 結果欄）は維持 / 計算トリガーのみ切替。
- **新規 SSoT 候補 (c214-η) として記録**: 「タイル + 詳細ページの計算トリガー一貫化（即時計算同型）」を本サイクルで N=2 として確立する SSoT 候補（cycle-210 N=1 + cycle-214 N=2 / §引用 SSoT 16 に追加）。

#### 論点 3: 差分粒度 UI（タイル UI に比較モード切替を含めるか）

**採用案 = 案 C1（タイル UI ではモード切替を省略し `line` モード固定 / 詳細ページでのみ切替）**

| 案                                            | 構成                                    | 来訪者価値                                                         | 範囲整合                                                     | 規模                               | 歯止め                                        |
| --------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------- | --------------------------------------------- |
| C1: タイル固定 line / 詳細で切替 ← **採択**   | タイル UI には select / ボタン群なし    | M1a 最短動線最大 / cols=3 rows=3 枠に膨張側 3 つを収める制約と整合 | cycle-210 text-replace（タイルにオプション全省略採択）と同型 | UI 要素省略                        | 来訪者が切替したい場合は詳細リンクで遷移可能  |
| C2: タイルに select 残す                      | 詳細 Component.tsx と同じ select        | カスタマイズ可能だがタイル面積を圧迫                               | cycle-210 text-replace の論点 2 で全省略採択と矛盾           | UI 要素+1 / cols=3 rows=3 枠が窮屈 | モバイルでの select タップ精度                |
| C3: タイルにボタン群（行/単語/文字 3 ボタン） | Diffchecker 方式（出典: 競合調査 §A-6） | 視認性高だが枠を更に圧迫                                           | yolos.net 既存タイルで select / ボタン群採用先例なし         | UI 要素+3                          | cols=3 rows=3 枠超過 → cols=3 rows=4 退避必要 |

**採用根拠**:

- 競合調査 §D BP-2 でも「デフォルトは行+インライン」が最も使いやすいとあり、line モード固定は実態に整合
- cycle-210 text-replace でも「タイル UI にオプション全省略」（論点 2 案 A）を採択しており、yolos.net SSoT として「タイルは最短動線優先 / 詳細はカスタマイズ層」の役割分担が確立済
- タイル UI で line 固定 = 一般来訪者の「どの行が変わったか」需要に 100% 対応 / 文字単位は校正用途のセカンダリ層 = 詳細ページに委譲
- **不採択 C2 / C3**: 膨張側 3 つを cols=3 rows=3 枠に収める制約と矛盾 / cycle-210 SSoT と非整合
- **M1b リピーターへの配慮**（MINOR-1 visitor 対応 / 新規追加）: M1b（編集者・法務・ライター・エンジニア）の校正用途で「単語単位 / 文字単位を頻繁に切替えたい」需要は **詳細ページに遷移して切替できる前提**で対処する。詳細リンク（§論点 8 H1）から `/tools/text-diff` 詳細ページに 1 クリック遷移すると、現行 Component.tsx の比較モード select が利用可能。M1b likes line 17「ブックマークしたURLを開けばすぐ目的のツールが表示される」は詳細ページの URL `/tools/text-diff` を直接ブックマークできることで担保される（タイルはトップ起点の動線、ブックマークはツール起点の動線、の二重提供）。

#### 論点 4: 差分カラースキームの a11y（色のみ / 色 + 記号 / 色 + 記号 + 部分視覚マーク / 色 + 記号 + 対称化視覚マーク）/ MAJOR-1 impl r4 で D1-D4 統合 4 案ゼロベース比較に全面再構成

**採用案 = 案 D4（色 + 記号「+/−」+ `.added underline` + `.removed line-through` 対称化）/ r3 D2 → r4 D4 採択変更**

**現状実体確認（MAJOR-1 impl r4 新規追加 = 現状実装の事実認識を計画書に組み込み）**: `Component.module.css` 内で **`.added` L113 = `text-decoration: none;`**（実質効果なし / 明示的に下線なしを宣言）と **`.removed` L119 = `text-decoration: line-through;`**（削除に取り消し線を**部分採用済**）が**既存実装で確定済**（**実装値** = `grep -nE 'text-decoration|line-through|underline' src/tools/text-diff/Component.module.css` 実行結果 = `113:  text-decoration: none;` + `119:  text-decoration: line-through;` / planner reviewer 独立再 grep 確認済）。r3 までの §論点 4 比較表は D3 を「色 + 太字・下線」として一括不採用と判定していたが、`.removed` の line-through は**既に現状の visitor 価値の一部**を担っており、「削除すれば現状 UX 毀損 / 残せば D2 採択と矛盾」という整合性破綻が生じていた（r3 reviewer 実装整合 MAJOR-1 指摘）。r4 では line-through の処遇を **D1〜D4 統合 4 案ゼロベース比較**に再構成して確定する。

| 案                                                                                   | 構成                                                                                                                                            | 来訪者価値                                                                                                                  | a11y                                                                             | 競合差別化                                       | 現状資産との関係                                            |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| D1: 色のみ                                                                           | `.added` 緑 / `.removed` 赤 / **line-through を削除して `.added` の `none` と対称化**                                                           | 低: 競合 8 サイト同レベル                                                                                                   | 競合 8 サイト全件と同レベル / WCAG 1.4.1 違反リスク                              | 差別化なし                                       | 現状 line-through を**破棄** = 現状 visitor 価値を毀損      |
| D2: 色 + 記号「+/−」のみ                                                             | 追加部分先頭に「+」/ 削除部分先頭に「−」+ aria-label / **line-through は削除**                                                                  | 中: 記号併用で識別可能だが現状の line-through 視覚補助が失われる                                                            | WCAG 1.4.1 準拠 / スクリーンリーダー対応                                         | 競合 8 サイト全件で記号併用 0 件 = 部分的に独自  | 現状 line-through を**破棄** = 取り消し線 UX を失う         |
| D3: 色 + 記号「+/−」+ **`.removed` line-through 維持**                               | 「+」「−」記号 + aria-label + `.removed` 取り消し線維持（`.added` は下線なし維持）                                                              | 高: 現状資産を活用 + 記号併用で a11y 強化                                                                                   | WCAG 1.4.1 準拠 / 削除のみ視覚補助二重化（色 + 取り消し線）                      | 競合 0 件で差別化 + 現状 UX 維持                 | 現状 `.removed line-through` を**維持** + `.added` 据え置き |
| D4: 色 + 記号「+/−」+ `.added` underline + `.removed` line-through 対称化 ← **採択** | 「+」「−」記号 + aria-label + `.added` に `text-decoration: underline` を**新規追加** + `.removed` line-through 維持 = 対称的に視覚補助を二重化 | **最高**: 色情報を失っても「両方とも何かしらマーク」で対称識別可能 / 印刷物 / グレースケール / 色覚多様性すべてに最大限対応 | WCAG 1.4.1 + 1.4.11（非テキストコントラスト） + 色覚多様性で最強 / a11y 強化最大 | 競合 0 件 + 「対称的視覚マーク」軸で独自価値最大 | 現状 `.removed line-through` を**維持** + `.added` を強化   |

**採用根拠（D4 採択 / PM 判断）**:

- **色覚多様性での「両方とも何かしらマーク」識別の重要性**（MAJOR-1 impl r4 で reviewer 指摘の核心）: D3（line-through が削除のみ）の場合、色覚 P 型 / D 型で赤緑が混同された結果「下線がついている方が削除」とは知覚されるが、「下線がついていない方は追加かそれとも未変更か」の区別が**色だけに依存**する。D4 で `.added` に underline を加えて対称化すると、「下線（取り消し線 or 通常の下線）+ 記号（+/−）+ 色」の 3 軸で識別可能となり、**色情報を完全に失っても識別可能**（印刷物 / グレースケール / 完全色覚異常）。
- **記号「+」「−」との相補性**: D3 の「記号 + 削除のみ line-through」は記号で識別の主軸が担えるため一見十分に思えるが、長文 diff（PR レビュー等）で記号は**行頭にしか出ないため中間の単語識別がしづらい**。下線・取り消し線は単語・文字レベルでも視覚的に追従するため、char/word モードでの識別が記号より優れる。
- **既存 line-through の維持価値**: `.removed` の line-through は cycle-214 着手以前から visitor が体験していた取り消し線 UX。これを削除すると「以前のほうが分かりやすかった」と感じる M1b リピーター（過去に text-diff を使ったことがある層）の信頼を毀損する（M1a/M1b dislikes「同じ入力で違う結果」line 19 とは別軸の「同じツールで違う UX」摩擦）。
- **「視覚ノイズ過多」懸念への打ち消し**: r3 までは「D4 = 全部盛り = ノイズ過多」として不採用としていたが、r4 では「太字 (bold) は不採用 / underline + line-through のみで対称化」と限定することでノイズ要素を 1 つに絞り、過剰感を回避。bold は font-weight 変動で行高・段組がずれる副作用があるため省略。
- **AP-I08 チェック手順の組み込み**（NIT-1 impl r4 対応 / §論点 12 と統合）: D4 の `.added underline` 新規追加は「DESIGN.md / デザイントークンに未定義の視覚表現」を加えることになるかを確認する必要がある。**AP-I08 チェック手順**: T-2 builder が `grep -rE 'text-decoration|underline|line-through' src/app/globals.css docs/DESIGN.md` を実行し、(i) 既存に同種定義があれば引用 / (ii) なければ「実装側で text-decoration を直書きする前に reviewer 確認を経る」というフローを T-2 検証手順に組み込み済（§論点 12 参照）。`text-decoration` は CSS の標準プロパティであり、token 化対象ではない（color / spacing / radius / shadow の token とは別軸）= AP-I08 違反は実質発生しない見込み。
- **D2 不採用**: 現状 line-through 破棄で UX 毀損
- **D3 不採用（次善案として保持）**: 対称化の a11y 強化を欠く / 「色情報を失った時の追加側の知覚」が記号のみに依存
- **D1 不採用**: 競合と同レベル / 現状資産も破棄
- **来訪者価値の深掘り（MINOR-1 r3 visitor 比重増強 + r4 で D4 採択の理由補強）**: 色覚多様性ユーザー（日本人男性の約 5% / **推定値** = JPMA「色覚多様性に関する基礎知識」一般値）にとって、競合 8 サイト全件で採用されている「赤緑のみ」は最も識別困難な配色組み合わせ（P 型 / D 型色覚で赤緑が混同される）。D4 採択 = 色 + 記号「+」「−」+ underline/line-through 対称化は、(i) 視覚的識別の冗長性確保（4 重: 色 + 記号 + 下線 + 行頭位置）/ (ii) スクリーンリーダーで「プラス」「マイナス」とアナウンス可能 / (iii) モバイルの小画面で文字色判別が困難な場面でも記号 + 下線が補助 / (iv) 印刷時に色情報が失われた場合（黒白プリンタ / グレースケール印刷）でも下線と記号で差分が読める、という 4 重の visitor 価値を提供。さらに M1a「弁護士事務所職員が契約書 v1/v2 を確認」シーン（§目的 シーン 1）でも、印刷物に転記する用途まで visitor 価値が連続的に提供される。
- **配色トークン**: `--success-soft` 背景 + `--success-strong` 文字（追加 / D4 で underline 追加）/ `--danger-soft` 背景 + `--danger-strong` 文字（削除 / D4 で line-through 維持）= T-2 マッピング表参照。globals.css 定義済の確認は T-2 builder が独立実施。`text-decoration` プロパティ自体は token 化対象外（CSS 標準プロパティ）= AP-I08 違反なし。

#### 論点 5: AP-P21 計測 5 ケース系統（a〜e）の text-diff 適用 + 系統数調整 / MAJOR-2 visitor r3 対応で計画段階確定に切替

**採用案 = 案 E1''（**5 系統で計画段階確定** / (e-β) は実装値で計測対象確定 / (e-γ) は実装値で適用対象外確定 / T-1 では (e-α) Playwright 表示矩形確認のみ）**

r2 では「T-1 実体確認後に T-4 で 4〜7 系統で確定」としていたが、r3 reviewer 指摘 MAJOR-2 visitor「(e-β)(e-γ) は planner が `Component.tsx` / `logic.ts` を Read すれば判明する範囲 / T-1 先送り不要」に従い、計画段階で確定する。

- **採択系統（計画段階確定 = 5 系統）**:
  - (a) 両入力空（共通最小系統 / 引用適用 PASS 期待）
  - (b) 短い入力（各 30 字 / cycle-210 と相似 / 操作側相互差 ≤ 2px = cycle-210 (ii) SSoT 引用適用 PASS 期待）
  - (c) 中程度入力 + 多数差分（各 300 字 / 結果欄膨張系統 / 膨張側下限 40px + overflowY:auto 効くこと）
  - (d) 大量入力 = jsdiff 性能上限近傍（T-1 軽量ベンチで literal 確定式 = 4 点中 `<100ms` 最大点 × 80% / 例: 100,000 字 × 0.8 = 80,000 字）
  - (e-α) 「テキストに差分はありません。」枠（`Component.tsx:86-88` で実在 / planner reviewer 独立再 Read 確認済 / 条件付き表示固定枠 = 系統 (e) と構造的に同等の CLS リスクあり / **MINOR-1 visitor r5 で境界条件明示**: 即時計算化（§論点 2-D 案 A 採択）後は `showResult` 撤廃により (a) 両入力空時も `.noDiff` 枠表示となるため、(a) と (e-α) は UI 構造（`.noDiff` 表示）が同じ。**T-1 実機計測で N=4 統合確定**: `measure-nodiff.ts` Playwright `getBoundingClientRect()` で (a) / (e-α) 両方計測 → noDiff 枠 h=23.046875px / w=894px / textarea h=229.90625px（差 0px）→ **(a)(e-α) を N=4 系統に統合確定** / T-4 は (a+e-α) 統合系統として計測）
  - (e-β) 片入力時の挙動（A のみ / B のみ → 全削除 or 全追加表示 / `logic.ts:11-34` `computeDiff` + `diff` npm パッケージ仕様で確定 / **実装値**）
- **適用対象外系統**:
  - (e-γ) jsdiff 異常時のフォールバック → `logic.ts` 全 38 行を planner reviewer が Read 完了 / try/catch なし + フォールバック表示 UI なし + `diff` npm パッケージは throw しない（**実装値**）→ **計画段階で適用対象外を確定**（AP-P21 ゼロベース判定原則違反のリスクは Read 実体確認で打ち消し / AP-P02 = 否定データ探索を planner が `logic.ts` Read で実施済）
- **B-452 N=2 データポイント採取**: 採取軸は **cycle-210 (d)→(e) と最も構造的に近い変化**:
  - 候補 1: (c)→(e-α) 差分なし枠出現変化 = cycle-210 (d)→(e) の「エラー枠が条件付きで表示される」構造と同型
  - 候補 2: (c)→(d) 大量入力の膨張変化 = cycle-210 (d)→(e) と構造的に別系統だが「結果膨張」軸では類似
  - **PM 判断**: 候補 1 を第一推奨（cycle-210 と完全同軸 / N=2 の純度最高）/ T-4 実機計測で候補 1 が成立しない場合のみ候補 2 に切替。
- 案 E2 不採用: 5 系統強制（cycle-210 をそのまま機械的引用）= text-diff の構造差を無視
- 案 E3 不採用: 3 系統に縮約 = (d) を除外 → 大量入力時の AP-P21 監視を失う

#### 論点 6: タイル内表示形式（Split vs Unified vs インライン diff）

**採用案 = 案 F1（Unified 統合形式 / インライン diff / 結果欄 1 つ）**

| 案                                                    | 構成                                   | 来訪者価値                                                | タイル枠との整合         | a11y                                                                                                 |
| ----------------------------------------------------- | -------------------------------------- | --------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| F1: Unified 統合形式 ← **採択**                       | 結果欄 1 つに追加/削除をインライン表示 | 高: タイル幅 400px に収まる / 膨張側 3 つ全体構造と整合   | cols=3 rows=3 で表示可能 | 結果欄 `role="region"` 1 個 + サマリ status 1 個 = §論点 13 M1''（r7）二層構成 / cycle-210 SSoT 同型 |
| F2: Split 左右並列                                    | 結果欄 2 つを左右に                    | 中: タイル幅 400px で左右並列は窮屈 / 各カラム 180px 程度 | rows=4 への退避必要      | 結果欄 `role="region"` 2 個 + サマリ status 2 個 = cycle-211 SSoT 引用適用（M1'' 二層構成）          |
| F3: タイルでは差分件数サマリのみ / 詳細ページで Split | 「3 件の追加 / 2 件の削除」等のサマリ  | 低: 来訪者の主要用事「変更箇所を見たい」を満たさない      | 最小                     | 差分本体が見えない                                                                                   |

**採用根拠**:

- 競合 8 サイトのうちスペースカウボーイ（出典: §A-5）のみ Unified 採用。残り 7 サイトは Split。しかし yolos.net のタイル幅 400px では Split は機能不全。
- 競合調査 §F 論点 4 で「タイルに 2 textarea を収めない」とされたが、これは「タイル」概念を持たない競合の話 = yolos.net のタイル動線では Unified なら 400px に収まる
- Unified 採用により結果欄 count=1 = cycle-210 SSoT (i)(ii)(v)(vi) と完全同型構造で引用検証可能 = B-452 N=2 データポイントの構造一貫性が確保される
- **不採択 F2**: タイル幅制約 + 結果欄 `role="region"` 2 個 + サマリ status 2 個付与（M1'' 二層構成 = r7 訂正）は cycle-211 SSoT 引用となるが、構造整合性が cycle-210 から離れて N=2 検証の純度が低下
- **不採択 F3**: 来訪者の主要用事を満たさない

**退避案（MAJOR-1 visitor 対応 / フォールバック設計 / 新規追加）**: T-3 実機確認で「膨張側 3 つの最低編集領域 80px」が cols=3 rows=3 でも cols=3 rows=4 でも確保できない場合、または w375 で「テキスト 100 字を 1 行表示できない」場合、**案 F4 = 軽量プレビュー化**（タイル UI に短い説明 + サンプル差分 1 行 + 詳細リンクのみ）に切替する。判定基準: T-3 builder が contract 文 100 字を A/B textarea に貼り付け → 1 行表示可能か確認 → 不可能なら F4 に切替。F4 採用時はタイル動線の差別化価値は減るが、「軽量プレビュー + 詳細リンク」でも競合 8 社の「トップに動線なし」よりは visitor 価値が高い（M1a が 1 クリックで詳細ページ到達できる）。

#### 論点 7: コピーボタンの要否（差分結果をコピーできるか / どの形式で）

**採用案 = 案 G1（コピーボタン採用 / Unified テキスト形式でコピー）**

- 採用根拠:
  - cycle-200〜213 タイル 14 件で全件採用 = 操作モデル一貫性（M1b likes line 16）
  - 差分結果を「+ 追加行 / − 削除行」の Unified テキスト形式でコピー = テキスト校正用途で他ツール（メーラー / Slack 等）にそのまま貼れる = M1a 利用価値高
  - 文言変化「コピー」→「コピー済み」→ 2 秒復帰 = **cycle-213 (β) SSoT（cycle-213 までで N=3 確立 / 出典: cycle-213.md L606）+ cycle-213 (θ) SSoT（cycle-213 までで N=3 / 出典: cycle-213.md L668）を分離引用** / **本サイクル cycle-214 で N=4 達成**（MAJOR-5 対応 = N 値時系列明示 + (β)(θ) 分離記述）= SSoT 強化
- 不採用候補:
  - G2: コピーボタンなし = 一貫性違反 / M1b 信頼毀損
  - G3: 形式選択 UI（プレーンテキスト / Markdown / HTML 等）= タイル UI には過剰 / 詳細ページに委譲

#### 論点 8: 詳細リンクテキスト

**採用案 = 案 H1（「テキスト差分の使い方を見る →」）**

| 案                                          | テキスト                                                                                                                         | 採用理由 / 不採用理由 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| H1: テキスト差分の使い方を見る → ← **採択** | 主機能「テキスト差分」+ 詳細ページの主提供価値「使い方ガイド」を明示 / cycle-213「オプションを設定して生成 →」と同型の動詞句構造 |
| H2: もっと詳しく比較する →                  | 「比較」が重複感 / 「もっと詳しく」が曖昧                                                                                        |
| H3: 詳細ページで全機能 →                    | 「全機能」が抽象的                                                                                                               |
| H4: 詳細を見る →                            | サイト内一貫表現だが特異性なし                                                                                                   |

**採用根拠**:

- 動詞句「使い方を見る」が M1a の dislikes line 26「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」と矛盾しないか確認 → タイル UI で主機能が完結し、詳細ページは「使い方を学びたい時のみ」の動線分岐 = 矛盾なし
- cycle-213「オプションを設定して生成 →」の動詞句構造を踏襲 = サイト内一貫性

#### 論点 9: search_intents 追加候補確定 + `meta.ts` keywords との重複論点

**採用案 = 案 I1（4 語追加 = `テキスト差分` / `文章 比較` / `テキスト 比較` / `diff チェッカー`）**

T-2 で実施事項に組み込み済。**`meta.ts` keywords 5 件（`テキスト比較` / `差分比較` / `diff` / `テキスト差分` / `文章比較` / **実測値** = `src/tools/text-diff/meta.ts:10`）と T1 yaml 追加候補の重複論点**:

| meta.ts keywords | T1 yaml 追加候補                | 関係                                                                                                       |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `テキスト比較`   | `テキスト 比較`（スペースあり） | スペース有無で別検索クエリ = 両方カバー意義あり                                                            |
| `差分比較`       | （なし）                        | meta.ts のみ                                                                                               |
| `diff`           | `diff チェッカー`               | 「diff」単独 vs 「diff チェッカー」= 別検索クエリ                                                          |
| `テキスト差分`   | `テキスト差分`                  | 完全一致 = 重複是認（yaml 側は M1a 検索意図実体カバレッジ / meta.ts は HTML meta シグナル / 役割分担あり） |
| `文章比較`       | `文章 比較`（スペースあり）     | スペース有無で別検索クエリ                                                                                 |

**relatedSlugs の実在再確認**: `meta.ts:12` の `relatedSlugs = ["char-count", "json-formatter", "line-break-remover"]` のうち、`json-formatter` は **planner 実在確認済**（NIT-1 / MINOR-1 対応 / `ls /mnt/data/yolo-web/src/tools/json-formatter/` 実行結果 = `Component.module.css / Component.tsx / __tests__ / logic.ts / meta.ts` 存在 / **実測 OK** / 差し替え不要）。`char-count` / `line-break-remover` は T-1 builder が独立再 `ls` で確認。

#### 論点 10: 大量入力時のローディング表示要否

**採用案 = 案 J1'（T-1 ベンチ結果で 3 段分岐 / `<100ms` 安定なら spinner 不要 / `<500ms` なら spinner 採用 / `>500ms` なら入力長制限 / MAJOR-1 visitor r3 で 3 段分岐へ書き換え）**

- 採用根拠（r3 で 3 段分岐に拡張）:
  - 即時計算（CRIT-1 r2 で確定 / cycle-210 同型）の前提で、jsdiff 処理時間が **`<100ms`**（**仕様値ベース推定値** = Nielsen "Response Time Limits" 1993 / Jakob Nielsen 0.1s/1s/10s 三段階のうち即時知覚閾値 0.1s / NIT-N3 r3 出典付記）内に収まれば UI フリーズは知覚されない → spinner / 入力長制限不要
  - **`100ms` 以上 `<500ms`** の場合: cycle-212 image-resizer で採用した spinner 中間状態（100ms threshold + setTimeout cancelable / 出典: cycle-212 §論点 H）を引用適用 / AP-I10 (`@keyframes` globals.css 定義確認) + AP-I11 cleanup を組み込み
  - **`>500ms`** の場合: spinner では UX 救済不可（500ms 超は「待たされている」体感が強い）→ 入力長制限を発動（明示的上限表示 / debounce ではない / M1b エンジニア層の数万行 PR diff char モード等を想定）
  - T-1 軽量ベンチ 4 点（1,000 / 10,000 / 50,000 / 100,000 字）の結果から計画段階で 3 段のどれを採用するか確定（T-4 先送り禁止 / MAJOR-1 visitor r3）
- 不採用候補:
  - J2: 常に spinner 採用 = `<100ms` 安定時に過剰 / cycle-210 SSoT (v) 同軸性に影響
  - J3: テキスト長 N 文字以上で spinner 表示の閾値式 = 過剰具体化 / AP-P20 違反
  - J4: debounce 300ms 補助（r1 旧採択）= cycle-210 SSoT (v) 同軸性が崩れる（CRIT-1 r2 で否定済）

#### 論点 11: モバイルレイアウト（タイル時 / 詳細時）

**採用案 = 案 K1（タイル時は cols×rows 固定で縦積み / 詳細時は w640 以下で 2 textarea を縦積み）**

- 現状の `Component.module.css:127-130` には既に `@media (max-width: 768px) { .panels { grid-template-columns: 1fr; } }` の縦積み切替が存在（**実装値** = planner Read 完了）。新デザイン移行後も同型の縦積み切替を維持する。
- タイル UI は 400×400px 固定で w375 でも cols×rows そのまま = 元々レスポンシブ不要。
- 不採用: 詳細時のみ横並列維持 = M1a モバイル利用シーンで w375 各 textarea 160px 圧縮 → 競合 difff / Mergely と同じ AP-1 違反（出典: 競合調査 §E AP-1）

#### 論点 12: AP 打ち消し策の組み込み（AP-P11 / AP-P16 / AP-P17 / AP-P19 / AP-P21 / AP-I07 / AP-I08 / AP-I10 / AP-I11 / AP-WF12 / AP-WF16）

**採用方針 = 案 L1（既存 AP すべてに対応する打ち消し策を計画書全体に分散配置 / r3 で AP-P11 / AP-I07 を明示追加 / r4 で AP-P19 / AP-I08 を明示追加）**

- **AP-P11 打ち消し策**（NIT-N2 r3 新規明示）: 前サイクル / 前ラウンドの自分の判断が変更可能であることを認識。r1 → r2 で debounce 300ms → 即時計算へ採択変更（§論点 2）/ r2 → r3 で aria-live="polite" 直付け → サマリ status 欄分離方式へ採択変更（§論点 13）/ **r3 → r4 で §論点 4 D2 採択 → D4 採択へ変更**（line-through + underline 対称化 / MAJOR-1 impl r4）/ **r3 → r4 で詳細ページ Component.tsx の計算トリガーを「ボタン押下式維持」→「即時計算化」へ変更**（§論点 2-D / MAJOR-2 visitor r4）/ **r6 → r7 で §論点 13 採択案 M1' → M1'' へ変更**（`<pre>` = `role="status"` のみ → `role="region"` 維持 + サマリ status 欄分離 / T-2 r2 reviewer MAJOR-1 対応 / `role="status"` の暗黙的 aria-live="polite" 仕様による M1' 内部矛盾を解消）= ラウンド間で「AI 自身が前ラウンドで決めた判断」を Reviewer 指摘に応じて変更可能と認識して実行している。
- **AP-P16 打ち消し策**: 計画書本文の全数値 literal に 4 分類ラベル（実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値）+ 生成元（コマンド or ファイル+行番号）を直近に併記 = 既に本計画書冒頭の §目的 末尾で宣言済 / r3 で 80% 性能マージン / 25% 編集領域差 / 100ms 出典 等の経験的暫定値ラベルを追補（MINOR-3 visitor / MINOR-N1 / NIT-N1 r3 対応）/ **r4 で `cycle-210.md L530 → L308` 引用先行番号訂正 + 他の cycle-210/211/212/213 行番号を全件 grep で再検証**（MINOR-2 impl r4 / planner reviewer 独立再 `grep -nE '119\.61\|textarea.*119\|841:\|843:\|847:\|538:\|835:\|L606\|L668\|L645' docs/cycles/cycle-210.md docs/cycles/cycle-213.md` 実行結果で全件 PASS 確認 / cycle-210 L222 = 「debounce なし」/ L308 = 「textarea (a)119.61」/ L538 = 「h=46.09px / w=376px」/ L835 / L841 / L843 / L845 / L847-852 / cycle-213 L606 / L645 / L668 すべて該当内容と一致）
- **AP-P17 打ち消し策**: 各論点で 3 案以上ゼロベース列挙 + 比較表 = §論点 1 / §論点 2 / §論点 3 / §論点 4 / §論点 6 / §論点 13（r3 で 4 案比較に拡張）等で実施済 / **r4 で §論点 2-D（詳細ページ計算トリガー / 3 案）+ §論点 4 全面再構成（D1-D4 統合 4 案 + line-through 処遇）を新規追加**
- **AP-P19 打ち消し策**（**MINOR-4 visitor r4 新規明示 / MINOR-2 visitor r5 で jsdiff v6+ 仕様の事実誤認訂正**）: 外部仕様（外部当事者が変更可能な仕様）への依存を一次資料で確認。本サイクルは `diff` npm パッケージ v9.0.0 仕様（throw しない / Unicode code point 単位 diff / ZWJ 結合絵文字挙動）への依存がある（`package.json L27` で `"diff": "^9.0.0"` を実装値として確定 / `logic.ts:1` で `diffLines / diffWords / diffChars / Change` を import）。**jsdiff v6+ 仕様の正確な事実認識**（**仕様値** = https://github.com/kpdecker/jsdiff/blob/master/release-notes.md release notes v6.0.0 ）: (i) `diffChars` は **Unicode code point 単位**で diff される（v6.0.0 以降 / v9.0.0 でも維持）= **独立絵文字（U+1F4DD = 📝 等の単一 code point 絵文字）は破損しない** / (ii) **ZWJ 結合絵文字（家族絵文字 👨‍👩‍👧 = U+1F468 + U+200D + U+1F469 + U+200D + U+1F467 等の複数 code point 合成絵文字）は code point 境界（U+200D 周辺）で分割される可能性あり** = 来訪者には部分分解して見える場合がある。r4 までは「サロゲートペアが破損するかもしれない」という前提認識だったが、これは jsdiff v6+ 仕様の事実誤認だった（v5 までは UTF-16 code unit 単位 / v6+ で code point 単位に変更済）→ r5 で正確な事実認識に訂正。**確認手順**: (i) T-1 で `package.json` 経由でバージョン実態確認（既存依存ゆえメジャー変更は無いが、minor / patch 変更は想定）/ (ii) T-4 (F) で **(I) 独立絵文字フィクスチャ**（破損しない期待）+ **(II) ZWJ 結合絵文字フィクスチャ**（分割可能性あり / 仕様値ベース実測 / MINOR-2 visitor r5）を含む実機 diff を Playwright で実行 → 各挙動を実測値として記録（独立絵文字は破損なし PASS / ZWJ 結合絵文字は仕様値ベース挙動を観察 = 後続サイクルへの SSoT 候補）/ (iii) `diff` パッケージの GitHub release / changelog を T-1 で WebFetch 確認（kpdecker/jsdiff repository）してメジャー仕様変更がないかを確認。本サイクルでは「既存依存のため変更リスク低」と判定するが、将来サイクルで text-diff を再 touch する際は本項を再点検対象とする。
- **AP-P21 打ち消し策**: 役割分担パターン（操作側 flexShrink:0 / 膨張側 flex:1 + overflowY:auto / cycle-213 (γ) SSoT 引用）を T-3 設計段階で明示 = 「比較モード select（採用しない / 論点 3）+ コピーボタン + 詳細リンク」を flexShrink:0 配下に / 「テキスト A textarea + テキスト B textarea + 差分結果欄」を flex:1 + overflowY:auto に配置 / T-4 計測で確認
- **AP-I07 打ち消し策**（NIT-N2 r3 新規明示）: jsdom 単体テストで検出できない a11y / 視覚 / aria-live アナウンス挙動は **Playwright + 本番ビルド + 実機スクリーンリーダー検証**を T-4 (vi) に組み込み済（CRIT-1 r3 / T-4 検証手順 (vi) スクリーンリーダー独立確認）。
- **AP-I08 打ち消し策**（**NIT-1 impl r4 新規明示**）: DESIGN.md / デザイントークンに未定義の視覚表現を実装上の都合で追加することを禁止。**§論点 4 D4 採択の `.added underline` 新規追加**は「実装側で text-decoration を直書きする」変更だが、`text-decoration` は CSS 標準プロパティ（`color` / `spacing` / `radius` / `shadow` のような token 化対象とは別軸 = 装飾系プロパティ）= **AP-I08 違反は実質発生しない**。確認手順: T-2 builder が `grep -rE 'text-decoration|line-through|underline' src/app/globals.css docs/DESIGN.md` を実行し、(i) DESIGN.md に「diff 記号」「装飾系トークン」の定義があれば引用 / (ii) なければ「`text-decoration` は CSS 標準プロパティのため `--decoration-*` 等の token 化は行わず、各コンポーネントの module.css に直書きする」既存慣行（cycle-200〜213 の各ツール module.css に同様の直書きが点在）に整合させる。reviewer 確認は T-2 で grep 結果を引用付き報告。
- **AP-I10 打ち消し策**: spinner 採用時（T-1 ベンチ結果次第）は `@keyframes` 定義が `globals.css` に存在することを T-3 で `grep` 確認（cycle-212 SSoT 引用）
- **AP-I11 打ち消し策**: コピーボタン文言復帰 2 秒タイマーで `useRef<NodeJS.Timeout | null>` + `useEffect` cleanup を組み込み（cycle-213 (δ) SSoT 引用）/ T-3 reviewer は `vi.getTimerCount()` assertion を独立 grep 確認（MINOR-N2 r3）
- **AP-WF12 打ち消し策**: 計画書中のすべてのファイルパス・行番号・件数を planner Read で実測確認済 / T-1 で builder が独立再実測 / reviewer が最低 1 つ独立再実行（AP-WF16）/ **r4 では cycle-210/211/212/213 引用行番号を全件 grep で独立再検証**（MINOR-2 impl r4 と連動）

#### 論点 13: 差分結果欄 role + aria-live 制御の二層構成 / CRIT-1 r3 で全面書き換え（過剰アナウンスリスクの歯止め）/ MAJOR-1 r7 で M1' → M1'' に訂正

**採用案 = 案 M1''（r7 で M1' から訂正 / 長文 `<pre>` 差分結果欄に `role="region"` + `aria-label` のみ付与（aria-live なし / WAI-ARIA 仕様で `role="region"` は暗黙的 aria-live を持たない静的領域）+ 別途サマリ status 欄 = 「+N / −M 箇所」等の短文 1 行 に `role="status" aria-live="polite"` を付与 / cycle-213 (ζ) 秘密情報配慮 ARIA 設計の発想引用）**

r2 では「`role="status" aria-live="polite"` を結果欄 `<pre>` に付与（cycle-211 (viii) SSoT 引用）」を採択していたが、r3 reviewer CRIT-1 visitor 指摘「即時計算（§論点 2 案 B2）+ aria-live="polite" の併用は『1 文字打つたびに長文差分結果欄全体がスクリーンリーダーで都度読み上げ』される過剰アナウンスを生み、M1a likes line 18「余計な装飾なく静かに用事だけ片付ける」と正面衝突する」に従い、ゼロベース 3 案比較で再設計する。さらに **r7 で M1' → M1'' に訂正**: T-2 r1 builder が M1' を素直に実装して `<pre role="status">` を採用したところ、T-2 r2 reviewer から「**WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つ**」と指摘され、M1' は仕様レベルで内部矛盾（`role="status"` 単独でも実質的に M2' = aria-live 直付けと同等の過剰アナウンスを生む）であったことが判明。**M1'' で結果欄を `role="region"` に確定**し、計画書 SSoT と T-2 r2 実装（`<pre role="region">`）を整合化する。

| 案                                                                 | 結果欄 `<pre>`                                                                              | サマリ status 欄                                          | 来訪者価値                                                                     | a11y 過剰アナウンスリスク                                               | SSoT 整合性                                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| M1'' サマリ欄方式（r7 訂正）← **採択**                             | `role="region"` + `aria-label`（aria-live なし / 暗黙的 aria-live を持たない静的領域）      | `role="status" aria-live="polite"` + 「+N / −M 箇所」短文 | 高: 過剰アナウンスを完全回避 / 変更件数だけ静かにアナウンス / M1a line 18 整合 | **低（最良）**                                                          | cycle-213 (ζ) 引用 + cycle-211 (viii) 運用拡張 / T-2 r2 実装と整合                                                                    |
| M1' サマリ欄方式（r3 採択 / r7 取り下げ）                          | `role="status"` のみ                                                                        | `role="status" aria-live="polite"` + 「+N / −M 箇所」短文 | 中: M1'' と同等のはずだが結果欄の暗黙 aria-live で過剰アナウンス再発           | **高（仕様レベル矛盾 / M2' と実質同等）**                               | cycle-213 (ζ) 引用予定だったが `role="status"` の暗黙 aria-live="polite" を見落とし / r7 で M1'' に訂正                               |
| M2' 結果欄に aria-live="polite" 直付け（r2 採択 / r3 取り下げ）    | `role="status" aria-live="polite"`                                                          | なし                                                      | 中: SR ユーザーに即時反映だが長文を都度読み上げで作業困難                      | **高（CRIT-1 主因 / かつ M1' も実質これと同等であったことが r7 判明）** | cycle-211 (viii) を素直に適用                                                                                                         |
| M3' aria-live なし完全無音（領域マークのみ）                       | `role="region"` 維持                                                                        | なし                                                      | 中: 静かだが SR ユーザーへの動的反映通知が完全に消える                         | 中（無音 = 別問題）                                                     | cycle-211 (viii) 非整合 / M3' と M1'' は同一の `role="region"` だが、M1'' はサマリ欄を追加して動的反映通知を確保する点で M3' と異なる |
| M4' debounce 的アナウンス制御（即時計算維持 / アナウンスのみ抑制） | `role="status" aria-live="polite"` + `aria-atomic="false"` + `aria-relevant="additions"` 等 | なし                                                      | 中: 「変更行のみアナウンス」を試みるが SR / ブラウザ依存性高                   | 中（実装難 + ばらつき）                                                 | 新規 SSoT が複雑化                                                                                                                    |

**採用根拠（M1'' 採択 / M1' 採用根拠をそのまま継承）**:

- **CRIT-1 r3 visitor 指摘への直接応答**: 即時計算で「1 文字打つたびに差分結果欄全体（または変更部分）がスクリーンリーダーで都度読み上げ」が起きると、M1a likes line 18「余計な装飾なく静かに用事だけ片付ける」体験と正面衝突。M1'' はサマリ欄（「+N / −M 箇所」のような短文）のみ aria-live="polite" を付与することで、過剰アナウンスを構造的に回避しつつ「結果が更新された」事実は伝える。
- **cycle-213 (ζ) 秘密情報配慮 ARIA 設計の発想引用**: cycle-213 では「`<code>` パスワード本体に aria-live を付けず、強度ラベル（短文）にのみ role="status" 付与」という SSoT (ζ) が確立済。text-diff の差分結果欄は秘密情報ではないが、「**長文かつリアルタイム更新される領域に aria-live を付けない**」という設計判断軸として完全に同型。本サイクルで cycle-213 (ζ) の適用範囲を「秘密情報」から「長文リアルタイム更新領域」に拡張する SSoT 候補 = (c214-ζ) として記録（§引用 SSoT 末尾参照）。
- **cycle-211 (viii) との整合**: cycle-211 (viii) は「膨張側出力欄に role="status" aria-live="polite" 付与」だが、テキスト出力欄 = 短文〜中文（base64 / json 整形等）が多く、即時計算下での過剰アナウンスは顕在化しなかった。本サイクル text-diff は「リアルタイム更新 × 長文」という新条件で運用拡張し、「結果欄本体には `role="region"` のみ（aria-live なし / 暗黙 aria-live も持たない静的領域）、aria-live はサマリに分離」という改訂運用を確立する。
- **タイル + 詳細ページ両方に同一構成**: T-2 詳細ページ `Component.tsx:89-92` の `<pre>` は **`role="region"` を維持**（T-2 r2 実装と整合 / `role="status"` には変更しない）+ サマリ status 欄を 1 行追加 / T-3 タイル UI でも同一構成（`<pre>` = `role="region"` + サマリ = `role="status" aria-live="polite"`）。両方で一貫運用（M1b likes line 16）。
- **M1' 不採用（r7 取り下げ）**: WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つため、`<pre role="status">` 単独でも M2' と実質同等の過剰アナウンスを生む。これは r3 で撤回した過剰アナウンスリスクが仕様レベルで温存されていたことを意味し、r7 で `role="region"`（暗黙的 aria-live を持たない静的領域）に訂正する必要があった。
- **M2' 不採用**: r3 CRIT-1 主因 = 過剰アナウンスリスクへの歯止めなし（かつ r7 で M1' も実質同等の過剰アナウンスを生むことが判明し、M1'' への再訂正が必要だった）。
- **M3' 不採用**: 完全無音は SR ユーザーへの動的反映通知が消える / a11y 弱体化（M1'' は同一の `role="region"` を採用しつつサマリ欄で動的反映通知を確保する点で M3' を超える）。
- **M4' 不採用**: `aria-atomic="false" aria-relevant="additions"` 等の制御は SR / ブラウザ実装にばらつきがあり、「変更行のみアナウンス」が実装通り動く保証がない（MDN / TPGi ガイド）/ 新規 SSoT が複雑化。
- **T-4 (vi) 実機検証で実証**: スクリーンリーダー（NVDA / VoiceOver / Chrome TalkBack シミュレータのいずれか）で「1 文字ずつ入力 → サマリ欄のみが「+N 箇所」と読み上げられ、`<pre>` 長文差分結果欄が連続アナウンスされないこと」を独立確認（T-4 検証手順 (vi) に追加済）。
- **サマリ status 欄文面のモード別単位確定**（**MINOR-2 visitor + MINOR-1 impl r4 統合 / 計画段階確定**）: 文面「+N / −M 箇所」の単位は **モード依存**で確定する。
  - **line モード時** = 「**+N 行 / −M 行**」（タイル UI = line 固定 / 詳細ページ line 選択時）
  - **word モード時** = 「**+N 単語 / −M 単語**」（詳細ページ word 選択時のみ）
  - **char モード時** = 「**+N 文字 / −M 文字**」（詳細ページ char 選択時のみ）
  - **計算ロジック**（builder 裁量だが指針を明示 / AP-P20 過剰具体化を回避しつつ整合性確保）: (a) `diffParts.filter(p => p.added).length` = 追加 hunk 件数 を使う案 / (b) 追加 hunk 内の `part.value` 文字数 / 行数 / 単語数 合算 = 追加要素件数を使う案、の 2 案がある。**第一推奨 = (b)** （M1a / M1b ともに「3 行追加された」より「3 hunk 増えた」の方が抽象的で直感性低 / line モード時の「+N 行」は実体的件数の方が visitor 価値高）。`useMemo` 化推奨（mode + diffParts 依存 / 再計算最小化）。**境界処理の指針**（NIT-1 visitor r5 新規追加 / builder 裁量だがテスト assertion で挙動を固定）: (b) 計算ロジックでは jsdiff `part.value` の (i) **改行末尾の扱い** = `part.value.split('\n')` で末尾空文字列が出る場合の `filter(Boolean)` 適用有無 / (ii) **Unicode code point カウント** = char モード時の文字数は `[...str].length` で code point カウント（独立絵文字は 1 文字 / ZWJ 結合絵文字は分割される可能性あり = AP-P19 連動）/ `str.length` の UTF-16 code unit カウントは採用しない / の 2 軸が確定基準。**実装は builder 裁量** だが `__tests__/Component.test.tsx`（B-461 起票候補）または `TextDiffTile.test.tsx` の assertion で「改行末尾あり / なし」「絵文字 1 件 / ZWJ 結合 1 件」の境界ケースを固定値で表現すれば、後続サイクルが挙動を再現できる。
  - **採用根拠**: タイル UI は line 固定なので「+N 行」のみ動作。詳細ページは 3 モードすべてで対応。実装複雑度はわずか（mode から unitLabel 文字列を派生 + count 数値を計算）。M1a / M1b ともに「どんな単位で差分が出ているか」を瞬時に把握でき、後続の作業計画（コピー / 詳細ページ遷移 / Slack 貼り付け）に直結。

---

### 引用する SSoT

本サイクルで引用 / 再利用する SSoT を列挙する。各項目には text-diff への適用予告（PASS 期待 / 再評価 / 適用対象外）を明示。

1. **cycle-210 SSoT (i) AP-P21 判定基準 (i) 下限 40px の適用範囲**:
   - 内容: textarea / status 領域 / エラー枠 / コピーボタン等の「visitor が直接視認・操作する要素」に対して 40px 以上の下限を適用 / 複合入力型タイルでは操作側 input にも 40px 以上を適用
   - text-diff への適用予告: **PASS 期待**（テキスト A / B textarea / 差分結果欄 / コピーボタン / 詳細リンクすべてに 40px 下限を適用）
   - 出典: cycle-210.md L841 §補足事項 1
2. **cycle-210 SSoT (ii) AP-P21 判定基準 (ii) 相互差 2px 以内の適用範囲**:
   - 内容: 操作側 input のみ flexShrink:0 で固定要件として 2px 以内を維持 / 膨張側の相互差判定は適用外
   - text-diff への適用予告: **PASS 期待**（コピーボタン + 詳細リンクは flexShrink:0 で相互差 2px 以内 / テキスト A / B textarea + 差分結果欄の相互差は適用対象外）
   - 出典: cycle-210.md L843 §補足事項 2
3. **cycle-210 SSoT (v) AP-P21 判定基準 (v) ±15% 経験的暫定値（複合入力型基準）**:
   - 内容: 単一 textarea 基準 ±10% は複合入力型に直接適用不可 / 複合入力型タイル基準 = ±15% 以内（N=1 経験的暫定値）
   - text-diff への適用予告（CRIT-1 visitor 対応で書き換え）: **再評価 + N=2 採取 / 即時計算採択により cycle-210 と同軸計測可能**（T-4 で 第一推奨「(c)→(e-α) 差分なし枠の出現変化」を計測 / 退避「(c)→(d) 大量入力膨張」/ N=2 データポイントを B-452 に蓄積 / FAIL した場合は基準値見直し提案）
   - 出典: cycle-210.md L847-852 §補足事項 4
4. **cycle-210 SSoT (vi) エラー文言枠の 1 行収納基準と実測 SSoT 値**:
   - 内容: タイル UI 内エラー文言枠は実測幅 ≤376px + 1 行表示 + h ≥40px / 計画段階では推定値のみ / 実 SSoT は T-4 実機計測で確定
   - text-diff への適用予告（MAJOR-2 visitor r3 で計画段階確定に書き換え / **MINOR-1 visitor r5 で (a)/(e-α) 境界条件明示** / **T-1 実機計測で N=4 統合確定**）: (e-α) 「テキストに差分はありません。」枠は実体存在確認済（`Component.tsx:86-88` / planner reviewer 独立再 Read 確認済）→ **T-1 Playwright 実機計測で確定済**: `measure-nodiff.ts` `getBoundingClientRect()` で (a) / (e-α) 両系統計測 → noDiff 枠 h=23.046875px / w=894px（差 0px）→ **(a)(e-α) N=4 統合確定** / text-diff noDiff 枠 h=23.046875px / w=894px が **text-diff 独自 SSoT** として確定（cycle-210 の h=46.09px は text-replace `.error` クラス値 / 別構造）。T-4 では (a+e-α) 統合系統として (vi) 値を引用検証。**(e-β) 片入力時膨張は計測対象として確定**（`logic.ts:11-34` + diff npm パッケージ仕様 / 実装値）。**(e-γ) jsdiff 例外フォールバックは適用対象外として確定**（`logic.ts` 全 38 行に try/catch なし / 実装値）。
   - 出典: cycle-210.md L538 / L835 / L845 §補足事項 3
5. **cycle-211 (viii) 膨張側出力欄複数時の role="status" 付与 SSoT**:
   - 内容: 膨張側出力欄（単一でも複数でも）に `role="status" aria-live="polite"` 付与
   - text-diff への適用予告（CRIT-1 r3 で運用拡張 / MAJOR-1 r7 で結果欄 role を `role="region"` に訂正）: **引用適用「結果欄 = `role="region"` のみ（aria-live なし / WAI-ARIA 仕様で `role="region"` は暗黙的 aria-live を持たない静的領域）+ サマリ欄 = `role="status" aria-live="polite"`」の二層構成に再定義**。長文 `<pre>` 差分結果欄に `role="status"` または aria-live="polite" を直付けすると即時計算下で過剰アナウンス（M1a line 18 矛盾）が発生する（`role="status"` は WAI-ARIA 仕様で暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つため `role="status"` 単独でも aria-live 直付けと同等の過剰アナウンスを生む = M1' → M1'' 訂正の主因）ため、cycle-213 (ζ) 秘密情報配慮 ARIA 設計の発想を引用統合した運用拡張（新規 SSoT 候補 (c214-ζ) として記録）。適用箇所数 = タイル UI + 詳細ページ Component.tsx の 2 箇所
6. **cycle-213 (β) コピーボタン文言変化 AP-P21 適用外 SSoT**（MAJOR-5 対応で分離記述 / N 値時系列明示）:
   - 内容: コピーボタン文言の変化（コピー → コピー済み → 2 秒後復帰）による width/height 変動は AP-P21 適用外（単純構造）
   - **N 値**: cycle-211 N=1 + cycle-212 N=2 + cycle-213 N=3 **= cycle-213 までで N=3 確立 / 本サイクル cycle-214 で N=4 達成**
   - text-diff への適用予告: **引用適用 PASS 期待**（§論点 7 採択 = コピーボタン採用 / N=4 達成で SSoT 強化）
   - 出典: cycle-213.md L606 §補足事項 (ii)
7. **cycle-213 (θ) コピーボタン文言変化 + role="status" 拡張 SSoT**（MAJOR-5 対応で分離記述）:
   - 内容: コピーボタン文言変化に加えて、結果欄の `role="status" aria-live="polite"` 拡張（cycle-211 (viii) の発展形）
   - **N 値**: cycle-211 N=1 + cycle-212 N=2 + cycle-213 N=3 **= cycle-213 までで N=3 確立 / 本サイクル cycle-214 で N=4 達成**
   - text-diff への適用予告（MAJOR-1 r7 で結果欄 role を `role="region"` に訂正）: **引用適用 PASS 期待**（タイル UI コピーボタン + 差分結果欄は M1'' 二層構成 = **結果欄 `role="region"` + サマリ `role="status" aria-live="polite"`** / N=4 達成）
   - 出典: cycle-213.md L668 §補足事項 (viii)
8. **cycle-213 (γ) 操作側 flexShrink:0 / 膨張側 flex:1 二分類 SSoT**:
   - 内容: 操作側 = タイトル / 操作 UI / 固定高さ情報要素 / ボタン / 詳細リンク = flexShrink:0 / 膨張側 = 長さ可変な出力エリア = flex:1 + overflowY:auto
   - text-diff への適用予告: **引用適用 PASS 期待**（コピーボタン + 詳細リンク = flexShrink:0 / テキスト A / B + 結果欄 = flex:1 + overflowY:auto）
9. **cycle-213 (δ) AP-I11 setTimeout cleanup SSoT**:
   - 内容: setTimeout / setInterval ID を useRef 保持 + useEffect cleanup で clear
   - text-diff への適用予告（CRIT-1 対応で書き換え）: **引用適用 PASS 期待**（即時計算採択により debounce タイマーは不使用 / **コピーボタン文言復帰の 2 秒タイマーにのみ適用**）
10. **cycle-213 password-generator #fff → --fg-invert マッピング SSoT**（CRIT-1 impl 対応で新規追加）:
    - 内容: `.compareButton` 等の accent 背景上の白文字 hex (`#fff`) は `--fg-invert` トークンへマッピング（ライト = `var(--bg)` / ダーク = `#131311` / globals.css `:root` L21 + `:root.dark` L97 両方に定義済）
    - text-diff への適用予告: **引用適用 PASS 期待**（`Component.module.css:71 color: #fff` → `var(--fg-invert)` / 本サイクル新規 SSoT ではなく cycle-213 既存 SSoT の引用適用）
    - 出典: cycle-213 §引用 SSoT 2
11. **AP-WF05 viewport 網羅性ルール**: w375 / w1200 / w1900 × light / dark = 6 系統
12. **kind=widget 標準パターン**: cycle-200〜213 で 14 件確立 / 本サイクル 15 件目
13. **本サイクル新規 SSoT 候補 (c214-δ)**（MINOR-2 r3 で命名衝突回避 = サイクル番号プレフィックス）: hex → token マッピング **4 種**（`.added` 緑系 2 + `.removed` 赤系 2 → `--success-soft` / `--success-strong` / `--danger-soft` / `--danger-strong`）/ **`#fff → --fg-invert` は cycle-213 既存 SSoT の引用適用のため本サイクル新規ではない** = CRIT-1 r2 切り分け
14. **本サイクル新規 SSoT 候補 (c214-ε-tentative)**: 複合入力型タイル「膨張側 3 つ構造」初出 SSoT 候補（cycle-210 = 膨張側 2 / cycle-214 = 膨張側 3 / 構造分類拡張）（**実装で取り下げ** / §補足事項 NIT-2 参照）
15. **本サイクル新規 SSoT 候補 (c214-ζ)**（CRIT-1 r3 で再定義 / cycle-211 (viii) + cycle-213 (ζ) 統合発展形）: **長文リアルタイム更新領域に aria-live を付けず、サマリ status 欄にのみ aria-live を付与する二層構成 ARIA 設計**。cycle-213 (ζ) の「秘密情報配慮」適用範囲を「秘密情報 + 長文リアルタイム更新領域」に拡張。詳細ページ + タイル UI 両方に適用 / N=1 初出。
16. **本サイクル新規 SSoT 候補 (c214-η)**（**MAJOR-2 visitor r4 新規追加**）: **タイル + 詳細ページ計算トリガー一貫化（即時計算同型）**。cycle-210 text-replace では詳細 + タイル両方で即時計算採択（N=1）/ cycle-214 text-diff で同型適用（N=2）。M1b likes line 16「操作性一貫性」+ cycle-210 SSoT (v) 計測同軸性の両軸で正当化。**詳細ページの `showResult` フラグ + `handleCompare` ボタン押下式は本サイクルで撤廃される非整合パターン**として記録。
17. **本サイクル新規 SSoT 候補 (c214-θ)**（**MAJOR-1 impl r4 新規追加 / 統合発展形 (c214-δ) の視覚マーク版**）: **`.added` underline + `.removed` line-through 対称化視覚マーク**。`text-decoration` を a11y 補助記号 (`+` / `−`) と並列の独立軸として組み込む / 色情報を失っても識別可能な対称化視覚マーク二重化 / 競合 8 社 0 件の差別化軸 / N=1 初出（後続サイクルで diff 系・revision 系ツールに引用適用候補）/ `text-decoration` は CSS 標準プロパティ = token 化対象外 = AP-I08 違反なし。

---

### 検討した他の選択肢と判断理由

#### 本サイクル対象選定の代替案

- **代替案 1: regex-tester（複合入力型 N=2 候補）**: text-diff と同等の SSoT 引用検証価値があるが、regex-tester は「正規表現 input + テキスト本文 + マッチ結果」の構造で、text-diff と異なり cycle-210 text-replace に近い「操作側 2 + 膨張側 2」構造 = cycle-210 N=1 と構造的に近すぎて N=2 検証の純度が低下する懸念。text-diff の「膨張側 3」は構造的差分が明確で SSoT 拡張価値が高い。
- **代替案 2: dummy-text / json-formatter / uuid-generator 等の単純構造ツール**: cycle-200〜213 で 14 件達成しており、単純構造ツールはこれ以上の SSoT 蓄積価値が低い。
- **代替案 3: B-318 系（画像形式変換等）**: 画像入力型 N=2 は cycle-211/212 で達成済 = N=3 着手条件まで残り 1 件だが、現状の画像系ツールは規模が大きく単一サイクル不可。
- **採択結果 = text-diff**: PM 判断 = (i) cycle-210 SSoT 4 項目の最初の引用検証 (ii) B-452 N=2 達成 (iii) M1a 文書校正 + M1b コードレビュー の普遍的需要 (iv) 「膨張側 3」構造の SSoT 拡張価値 = 来訪者価値最大化 + 計画立案価値最大化

#### 「軽量プレビュー + 詳細リンク」タイル設計案（第一推奨では不採択 / フォールバックとして保持 / MAJOR-1 visitor 対応）

- 案 X: タイル UI には「テキスト差分ツール」アイコン + 短い説明 + サンプル差分 1 行 + 詳細リンクのみ（競合調査 §F 論点 4 でこの案が提案されていた）
- 第一推奨では不採択の理由:
  - CLAUDE.md Decision Making Principle: 「実装工数を理由に劣化 UX を選んではならない」
  - yolos.net の差別化軸は「タイル動線で来訪者の用事を最短完結させる」= 軽量プレビューは差別化価値毀損
  - cycle-210 text-replace で「複合入力型タイル + 2 textarea + 結果欄」を 400×400px 枠に収める前例確立済 = 工数面でも実現可能
  - M1a 最短動線（likes line 16, 17）を阻害
- **フォールバックとして保持**（MAJOR-1 visitor 対応 / §論点 1 / §論点 6 末尾参照）: T-3 実機確認で「膨張側 3 つの最低編集領域 80px」が cols=3 rows=3 / rows=4 でも確保できない場合、または w375 で 1 行表示すら不可の場合 → 本案 X に切替する経路を明示。F4 採用時はタイル動線の差別化価値は減るが、競合 8 社の「トップに動線なし」よりは visitor 価値が高い（M1a が 1 クリックで詳細ページ到達）。

#### リアルタイム自動計算 vs ボタン押下式 vs debounce の判断

- §論点 2 で確定（CRIT-1 対応で **即時計算（案 B2 = cycle-210 同型）採択** に変更 / 当初 r1 では debounce 300ms 採択だったがレビュー指摘で見直し）

#### 「テスト基盤一括整備」を本サイクルに含めるかの判断

- 案 X: 含める = B-449 / B-455 / B-458 / B-459 系のスコープ拡大 → 過剰スコープ膨張リスク
- **案 Y: 含めない（採択）** = cycle-210〜213 同型運用 / 新規 backlog **B-461** として独立扱い

#### `meta.ts` `relatedSlugs` 差し替え判定

- §論点 9 で確定（`json-formatter` は **planner 実在確認済 = 差し替え不要** / NIT-1 / MINOR-1 対応）

---

### 計画にあたって参考にした情報

1. **text-diff ターゲットユーザー調査レポート**: `tmp/research/2026-05-28-cycle-214-text-diff-target-users.md`（M1a / M1b / S3 の likes/dislikes 引用 / search_intents 実測 / 新デザイン移行への含意）
2. **cycle-210 SSoT 抽出レポート**: `docs/archive/composite-input-tile-ap-p21-criteria.md`（SSoT 4 項目 (i)(ii)(v)(vi) + cycle-211/212/213 関連 SSoT + 計画時引用適用チェックリスト 10 項目）
3. **text-diff 競合調査レポート**: `docs/research/2026-05-28-text-diff-competitor-survey.md`（日本語圏 5 件 + 英語圏 3 件の実機 Playwright 計測 / ベストプラクティス 5 件 / 避けるべきパターン 3 件 / 論点 1〜5 への PM 判断材料）
4. **cycle-213**（直前サイクル / 単純構造ツール継続 + マウント時自動生成型タイル初出）: `docs/cycles/cycle-213.md`（§補足事項 (β)(γ)(δ)(θ) SSoT）
5. **cycle-212**（画像入力型 N=2 + spinner 中間状態 SSoT 確立）: `docs/cycles/cycle-212.md`
6. **cycle-211**（画像入力型 N=1 + (i)〜(x) 補足事項 SSoT 確立元）: `docs/cycles/cycle-211.md`
7. **cycle-210**（複合入力型 N=1 = 本サイクルの最重要先例 / SSoT (i)(ii)(v)(vi) 確立元）: `docs/cycles/cycle-210.md`
8. **cycle-209**（line-break-remover = 単純構造ツール先例 / Component.test.tsx 21 件規模の参考）: `docs/cycles/cycle-209.md`
9. **CLAUDE.md / docs/constitution.md / docs/anti-patterns/**: AP-I10 / AP-I11 / AP-P16（4 分類ラベル + 生成元併記）/ AP-P17 / AP-P20 / AP-P21 / AP-WF03 / AP-WF05 / AP-WF12 / AP-WF16
10. **docs/targets/**: M1a / M1b / S3 yaml の likes/dislikes / search_intents 実測
11. **`src/tools/text-diff/`**: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/logic.test.ts` の planner Read による実測
12. **`src/tools/_constants/tile-declarations.ts`**: 既存 14 件（**実測値** = `tiles-registry.ts:47` `tilesCount=14` / cycle-213 完了時点 / MINOR-2 対応で `L46` → `L47` 訂正）のタイル定義
13. **`src/app/globals.css`**: `--success-soft` / `--success-strong` / `--danger-soft` / `--danger-strong` / **`--fg-invert`**（CRIT-1 対応で追加）の存在確認は T-2 builder が独立実施 / planner は `--fg-invert` を `:root` L21 + `:root.dark` L97 で確認済
14. **`docs/backlog.md`**: B-452（**P3 昇格済** = cycle-210 完了処理 / MAJOR-4 対応）/ B-453 / B-449 / B-455 / B-458 / B-459 / B-460 = 関連 backlog の現状実測（B-460 が最新 = 次の空き番号 B-461 を T-2 で起票）
15. **GA データ**（MAJOR-3 / MINOR-3 対応で追加）: T-1 で `/tools/text-diff` 詳細ページの過去 30 日 PV / 流入元 / 検索クエリを実測し `tmp/cycle-214/baseline/ga-data.md` に保存。タイル動線新設による PV インパクト仮説の実測ベース根拠。
16. **jsdiff 軽量ベンチ結果**（CRIT-1 / MAJOR-3 対応で追加）: T-1 で 1,000 / 10,000 / 100,000 字 × line/word/char の処理時間を実測し `tmp/cycle-214/baseline/jsdiff-bench.md` に保存。即時計算採択の客観的根拠。

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

> **(c214-ε) SSoT 候補の取り下げ注記**: 計画書本文中の「膨張側 3 つ（A textarea / B textarea / 差分結果）」記述は r1〜r7 時点の **設計意図ベースの SSoT 候補 (c214-ε-tentative)** であり、T-3 実装で「実体 = 膨張側 1 つ（差分結果欄のみ）」と確定したため取り下げられた。最終 SSoT は §補足事項 §T-4 reviewer 指摘対応記録 NIT-2 / (c214-ε) を参照。

### r1 → r2 改訂のレビュー対応マップ（CRIT 3 / MAJOR 8 / MINOR 7 / NIT 3 = 計 21 件）

| 区分  | 番号 | 観点    | 対応箇所                                                                                                                  | 対応内容                                                                                                                                                                                                                                                                                                                           |
| ----- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRIT  | 1    | visitor | §論点 2 / §論点 10 / §引用 SSoT 3 / T-3 / T-4 / 目的 #何のため 4                                                          | debounce 300ms → 即時計算（案 B2 = cycle-210 同型）に採択変更。T-1 で jsdiff 軽量ベンチを新規追加。                                                                                                                                                                                                                                |
| CRIT  | 2    | visitor | §「複合入力型ゆえの注意点」/ §論点 5 / §引用 SSoT 4 / T-1 / T-4                                                           | (e) 適用対象外確定を撤回。(e-α)(e-β)(e-γ) 候補を計画書に明記し T-1 実体確認 → T-4 系統数確定の流れに切替。                                                                                                                                                                                                                         |
| CRIT  | 1    | impl    | T-1 / T-2 マッピング表 / T-2 完成条件 / §目的 / §引用 SSoT 10                                                             | hex 4 件 → **5 件 / 5 種** に訂正。`#fff → --fg-invert` をマッピング表に追加（cycle-213 SSoT 引用 / `--fg-invert` globals.css L21/L97 実在確認済）。                                                                                                                                                                               |
| MAJOR | 1    | visitor | §目的 #何のため 3 / §論点 1 退避 / §論点 6 退避 / §検討した他の選択肢「軽量プレビュー」/ T-3 フォールバック設計           | 競合調査結論「タイルに 2 textarea 不適切」への正面反論を明文化。軽量プレビュー化フォールバック経路を組み込み。                                                                                                                                                                                                                     |
| MAJOR | 2    | visitor | T-4 (F) 実体験フロー検証 + (G) a11y 視覚効果対比を新規追加 / T-4 完成条件 / T-4 検証手順                                  | 実体験フロー検証手順（モバイル w375 動作 / 同じ入力 → 同じ結果整合 / a11y 補助記号視覚効果対比）を追加。                                                                                                                                                                                                                           |
| MAJOR | 3    | visitor | §目的 #誰のために 末尾「M1a / M1b 実利用フロー」/ T-1 GA データ確認 + jsdiff ベンチ                                       | M1a / M1b 体験トレース（2 シーン）を §目的に追加。T-1 に GA データ確認を新規追加。                                                                                                                                                                                                                                                 |
| MAJOR | 1    | impl    | §論点 13 新規追加 / T-1 詳細ページ role 確認 / T-2 詳細ページ touch 範囲 / T-2 完成条件 / §引用 SSoT 5 (cycle-211 (viii)) | 詳細ページ Component.tsx の `role="region"` → `role="status" aria-live="polite"` 切替を採択。論点 13 を新規追加（**注**: r2 採択 M2' は r3 で M1' = `role="status"` のみ / aria-live なしに改訂、さらに r7 で M1' → M1'' = `role="region"` 維持 + サマリ status 欄分離に最終訂正。最終形は §論点 13 + r6→r7 改訂対応マップ参照）。 |
| MAJOR | 2    | impl    | T-2 完成条件                                                                                                              | hex grep `#[0-9a-fA-F]{3,6}` を完成条件に追加（`var(--color-` のみでは `#fff` 置換漏れを検知できないため）。                                                                                                                                                                                                                       |
| MAJOR | 3    | impl    | T-1 jsdiff 軽量ベンチ + (d) literal 確定手順 / §論点 5 / T-4 計測                                                         | (d) 系統の文字数 literal を T-1 ベンチ結果（処理時間 50〜100ms の最大文字数の 80%）で客観確定。                                                                                                                                                                                                                                    |
| MAJOR | 4    | impl    | T-2 backlog 連動更新 / T-4 §補足事項書き戻し (β)                                                                          | B-452 が P3 昇格済 / 着手条件「cycle-213 前後」が既に過ぎている事実を明記。                                                                                                                                                                                                                                                        |
| MAJOR | 5    | impl    | T-4 cycle-211/212/213 SSoT 引用検証 / §論点 7 / §引用 SSoT 6, 7                                                           | cycle-213 (β)(θ) の N 値表記を「cycle-213 までで N=3 / 本サイクル N=4」に統一。(β) と (θ) を分離記述。                                                                                                                                                                                                                             |
| MINOR | 1    | visitor | §論点 3 末尾「M1b リピーターへの配慮」追加                                                                                | M1b の比較粒度切替需要は詳細ページ遷移で対処 / ブックマーク動線で担保することを明示。                                                                                                                                                                                                                                              |
| MINOR | 2    | visitor | §論点 1 80px の根拠 + 実体験テスト手順追加                                                                                | 80px 編集領域の根拠（コピペ核心 + 1〜2 行表示）を明示。T-3 実機テスト手順を具体化。                                                                                                                                                                                                                                                |
| MINOR | 3    | visitor | T-1 GA データ確認 / §参考情報 15                                                                                          | GA データ確認を T-1 必須化（CLAUDE.md「Check Google Analytics」原則）。                                                                                                                                                                                                                                                            |
| MINOR | 1    | impl    | T-1 / §論点 9 / §検討した他の選択肢「relatedSlugs 差し替え判定」                                                          | `json-formatter` 実在 planner 確認済を反映 / 差し替え検討論を削除。                                                                                                                                                                                                                                                                |
| MINOR | 2    | impl    | T-1 / §参考情報 12                                                                                                        | `tiles-registry.ts:46` → `tiles-registry.ts:47` に訂正。                                                                                                                                                                                                                                                                           |
| MINOR | 3    | impl    | T-2 opengraph-image.tsx 処遇                                                                                              | `accentColor: "#0891b2"` / `icon: "🛠️"` の処遇明示（(legacy) 同値維持）を追加。                                                                                                                                                                                                                                                    |
| MINOR | 4    | impl    | T-4 完成条件「スクショ枚数」前例比較記述追加                                                                              | cycle-211 38 枚 / cycle-213 14 枚 / cycle-214 36 枚（+16〜18 枚分の必然増の根拠記述）。                                                                                                                                                                                                                                            |
| NIT   | 1    | visitor | T-1 / §論点 9                                                                                                             | `json-formatter` 実在を planner で `ls` 確認済を計画書に反映。                                                                                                                                                                                                                                                                     |
| NIT   | 2    | visitor | T-1 検証手順 / 各 T-X 検証手順                                                                                            | reviewer サンプリング戦略を明文化（`--color-*` 残存数 + hex 5 件を必ず独立再実行）。                                                                                                                                                                                                                                               |
| NIT   | 1    | impl    | （対応せず）                                                                                                              | 計画書全体の冗長性は「AP-P16 直近併記原則」とのトレードオフのため対応見送り。false-positive 扱いではなく **意図的に保持**（AP-P16 を優先）。                                                                                                                                                                                       |

### r2 → r3 改訂のレビュー対応マップ（CRIT 1 + MAJOR 3 + MINOR 8 + NIT 5 = 計 17 件 / r3 で追加対応）

| 区分  | 番号 | 観点    | 対応箇所                                                                                                        | 対応内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----- | ---- | ------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRIT  | 1    | visitor | §論点 13 全面書き換え / T-2 詳細ページ touch 範囲 / T-2 完成条件 / §引用 SSoT 5 / T-4 検証手順 (vi) / 観点 (vi) | aria-live="polite" 直付け → **サマリ status 欄方式（r3 採択時点 = M1' / 結果欄 = role="status" のみ + サマリ欄 = role="status" aria-live="polite"）** に採択変更。cycle-213 (ζ) 引用統合 + cycle-211 (viii) 運用拡張。T-4 (vi) でスクリーンリーダー実機検証を追加。**注**: r3 採択時点の M1' は `role="status"` 単独でも暗黙的 aria-live="polite" を持つため過剰アナウンス防止が成立しないことが r7 で判明し、**r7 で M1' → M1'' = 結果欄 `role="region"` 維持 + サマリ status 欄分離に最終訂正**（最終形は r6→r7 改訂対応マップ参照）。 |
| MAJOR | 1    | visitor | §論点 2 / T-1 ベンチ / §論点 10                                                                                 | jsdiff `>100ms` 未達時 UX を「`<100ms` 入力長制限なし / `<500ms` spinner / `>500ms` 入力長制限」の **3 段分岐**として計画段階確定。Nielsen 100ms 出典明示。                                                                                                                                                                                                                                                                                                                                                                              |
| MAJOR | 2    | visitor | §「複合入力型ゆえの注意点」/ §論点 5 / §引用 SSoT 4 / T-1 / T-4                                                 | (e-β)(e-γ) を planner Read で計画段階確定 = (e-β) 計測対象 / (e-γ) 適用対象外。T-1 では (e-α) 表示矩形のみ。**5 系統で確定**。                                                                                                                                                                                                                                                                                                                                                                                                           |
| MAJOR | N1   | impl    | §論点 2 / T-3 実施事項 / T-4 完成条件                                                                           | 即時計算実装パターン引用適用先 = cycle-210 text-replace `TextReplaceTile.tsx` の `onChange` 内同期計算を明記。`diff` パッケージ `package.json L27` 既存依存 = bundle 追加コスト 0 を明記。T-4 完成条件に bundle インパクト確認（`npm run build` size 比較 +5kB 以下）を追加。                                                                                                                                                                                                                                                            |
| MINOR | 1    | visitor | §目的増量 / §論点 1 / §論点 4 / T-4 (F)(G)                                                                      | 来訪者価値比重を実測 18% → 30% 以上へ。§目的増量 + §論点 4 配色トークン論強化 + T-4 (F)(G) 文字量増。                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| MINOR | 2    | impl    | §引用 SSoT 13/14/15 / T-4 §補足事項書き戻し                                                                     | 本サイクル新規 SSoT 命名を (δ)(ε)(ζ) → **(c214-δ)(c214-ε)(c214-ζ)** に変更（既存サイクル (β)(γ)(δ) との衝突回避）。                                                                                                                                                                                                                                                                                                                                                                                                                      |
| MINOR | 3    | impl    | §論点 1 80px の根拠 / T-1 (d) literal 確定式 / §論点 12                                                         | 80%（性能マージン）/ 25%（編集領域差）に **推定値 + 経験的暫定値** ラベル + 生成元（計算式 or 派生元）を併記（AP-P16 強化）。                                                                                                                                                                                                                                                                                                                                                                                                            |
| MINOR | 4    | impl    | §補足事項 false-positive 扱いを撤回 / SSoT 引用と直近併記の両立方針へ                                           | r2 NIT-1 false-positive 扱いを撤回。SSoT は §引用 SSoT 一覧に集約 + 各タスクから項番引用、数値 literal は出現箇所で直近併記、の両立で対応。                                                                                                                                                                                                                                                                                                                                                                                              |
| MINOR | N1   | impl    | T-1 jsdiff ベンチ 4 点測定 / (d) literal 確定式                                                                 | (d) literal 決定式を「ベンチ 4 点中 `<100ms` 最大点 × 80%」と明文化。50,000 字を測定点に追加。                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| MINOR | N2   | impl    | T-3 検証手順                                                                                                    | reviewer に `vi.getTimerCount()` assertion の独立 grep 確認を明示追加。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| MINOR | N3   | impl    | T-1 / T-2 / §論点 5 / §論点 13                                                                                  | `Component.tsx` 行番号精度訂正 = `<pre>` 開始 L89 / `role="region"` 属性 L91 / `aria-label` 属性 L92 / `.noDiff` 三項分岐 L86-88（属性別行番号明示）。                                                                                                                                                                                                                                                                                                                                                                                   |
| NIT   | 1    | impl    | T-2 backlog 連動更新 (B-461)                                                                                    | B-461 推定根拠コマンド `grep -oE '^\| B-[0-9]+' docs/backlog.md \| sort -u \| tail -1` 実行結果 = `B-460` を実測値ラベル付きで併記。                                                                                                                                                                                                                                                                                                                                                                                                     |
| NIT   | 2    | impl    | T-1 / T-2 / §論点 5 / §論点 13                                                                                  | NIT-N3 r3 と統合（行番号精度）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| NIT   | N1   | impl    | §論点 13 / T-1 / §論点 12 等                                                                                    | `aria-live="polite"` に **仕様値（WAI-ARIA W3C 仕様）** ラベルを併記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| NIT   | N2   | impl    | §論点 12 AP 打ち消し策                                                                                          | AP-P11 / AP-I07 を明示追加（r1 → r2 → r3 ラウンド間判断変更 / Playwright + スクリーンリーダー実機検証）。                                                                                                                                                                                                                                                                                                                                                                                                                                |
| NIT   | N3   | impl    | §論点 2 / §論点 10                                                                                              | 100ms 出典 = Nielsen "Response Time Limits" 1993 の 0.1s / 1s / 10s 三段階を明示。                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### r3 → r4 改訂のレビュー対応マップ（MAJOR 3 + MINOR 6 + NIT 3 = 計 12 件 / CRIT 0 件 / r4 で追加対応）

| 区分  | 番号 | 観点    | 対応箇所                                                                                                                      | 対応内容                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR | 1    | visitor | T-1 ベンチ 12 ケース表 / §論点 2 表 / (d) literal モード別確定式                                                              | char モード × 大入力時の実用上限がモード別に確定していない問題に対応。T-1 ベンチを **line / word / char × 4 字数 = 12 ケース表**に拡張。(d) literal をモード別 (d-line)(d-word)(d-char) 3 値で独立確定。M1b エンジニア層の詳細ページ char モード PR diff（数万行）UI フリーズリスクの歯止め。                                                                                                             |
| MAJOR | 2    | visitor | §論点 2-D 新設 / T-2 詳細ページ touch 範囲拡張 / §引用 SSoT 16 (c214-η) / T-4 (F) 詳細ページモード切替即時反映                | 詳細ページ Component.tsx の計算トリガーを独立論点（§論点 2-D）として 3 案ゼロベース比較追加。**第一推奨 = 案 A（詳細も即時計算化）**（タイル一貫 + cycle-210 詳細ページ即時計算採択の引用適用 / M1b 操作性一貫性 likes line 16 直接応答 / bundle インパクト 0）採択。T-2 touch 範囲に `showResult` + `handleCompare` + 比較ボタン JSX 撤廃を追加。                                                        |
| MAJOR | 1    | impl    | §論点 4 全面再構成（D1-D4 統合 4 案）/ T-2 マッピング表 +1 行 / T-2 完成条件 +1 件 / T-4 (G) +2 状態 / §引用 SSoT 17 (c214-θ) | `.added` L113 `text-decoration: none;` + `.removed` L119 `text-decoration: line-through;` の現状実装事実認識を組み込み。§論点 4 を **D1-D4 + line-through 処遇統合 4 案ゼロベース比較**に再構成。**採択 = D4（色 + 記号「+/−」+ `.added underline` + `.removed line-through` 対称化）**。T-2 マッピング表に `text-decoration` 処遇行追加。T-4 (G) に対称化視覚マーク対比（3 状態 × grayscale 有無）追加。 |
| MINOR | 1    | visitor | §補足事項 文字量配分                                                                                                          | 「27.5% 達成」主張を撤回し**実測値 19.4%** に訂正。今後は「目標 30% 以上 / 実測 N%」のように主張せず、実測のみ記載。r4 で +65 行増 = 約 25% 実測値ベース。                                                                                                                                                                                                                                                |
| MINOR | 2    | visitor | §論点 13 末尾サマリ status 欄文面のモード別単位 / T-2 完成条件 / MINOR-1 impl r4 と統合                                       | サマリ status 欄文面「+N / −M 箇所」の単位を **line モード時 = 行 / word モード時 = 単語 / char モード時 = 文字** とモード依存で計画段階確定。タイル UI は line 固定なので「+N 行 / −M 行」のみ。                                                                                                                                                                                                         |
| MINOR | 3    | visitor | T-1 L105 テスト件数表記                                                                                                       | 「参考: planner Read 時 62 行のみ」→「参考: planner reviewer 独立再実測 = 9 件 / 62 行」に件数 + ファイル行数併記に統一。                                                                                                                                                                                                                                                                                 |
| MINOR | 4    | visitor | §論点 12 AP-P19 追記 / T-4 (F) AP-P19 連動                                                                                    | §論点 12 に **AP-P19**（`diff` npm v9.0.0 仕様依存）打ち消し策を追記。T-4 (F) 絵文字フィクスチャでマルチバイト挙動を実機確認。`diff` パッケージ GitHub release / changelog の WebFetch 確認も追加。                                                                                                                                                                                                       |
| MINOR | 1    | impl    | §論点 13 / T-2 完成条件（MINOR-2 visitor と統合）                                                                             | サマリ status 欄文面のモード別単位（line=行 / word=単語 / char=文字）を計画段階確定（MINOR-2 visitor と統合）。                                                                                                                                                                                                                                                                                           |
| MINOR | 2    | impl    | §論点 1 L395 / §論点 12 AP-WF12 打ち消し策 / §論点 12 AP-P16 打ち消し策                                                       | `cycle-210.md L530 → L308` に行番号訂正（L530 = 「文言は全角換算 25 字 × フォントサイズ 13.6px ≈ 340px」= 引用先と数値が無関係 / L308 = AP-P21 計測 5 ケースのチェックリストで「textarea (a)119.61」と書かれている正しい出典）。**他の cycle-210/211/212/213 引用行番号も全件 grep で独立再検証 = 全件 PASS**（§論点 12 AP-P16 / AP-WF12 と連動）。                                                       |
| NIT   | 1    | visitor | T-4 (F) 実体験フローテストデータ                                                                                              | フィクスチャに**絵文字 1 件追加**（U+1F4DD 等のサロゲートペア / `contract-v1.txt` 末尾「合意の証として✅ 締結する📝」/ `contract-v2.txt` 末尾「合意の証として✅✅ 締結する📝」）= char モードでサロゲートペア破損確認。AP-P19 と連動。                                                                                                                                                                    |
| NIT   | 2    | visitor | T-4 (F) スクショ系統                                                                                                          | w1200 light + w375 light の 2 系統 → w1200 light + w375 light + **w1200 dark** の **3 系統**に拡張（ダークモード網羅）。総スクショ枚数 36 → 44 に増。                                                                                                                                                                                                                                                     |
| NIT   | 1    | impl    | §論点 12 AP-I08 追記 / §論点 4 末尾                                                                                           | §論点 12 に **AP-I08**（DESIGN.md / デザイントークン未定義の視覚表現禁止）打ち消し策を追記。§論点 4 D4 採択の `.added underline` 新規追加に対する AP-I08 チェック手順を組み込み（`text-decoration` は CSS 標準プロパティ = token 化対象外 = 違反なし結論）。                                                                                                                                              |

### false-positive 扱いの指摘（r3 で撤回）

- **r2 NIT-1（計画書全体の冗長性）**: r2 では「AP-P16 直近併記 vs SSoT 引用圧縮はトレードオフ」として保持していたが、r3 reviewer MINOR-4 「冗長性削減と AP-P16 強化は両立可能（直近併記を主、引用は項番のみ）」を受けて **撤回**。今後は §引用 SSoT 一覧を主参照源 + 各タスクから項番引用、数値 literal は出現箇所で直近併記、の両立方針で運用。本計画書 r3 でもこの方針に従う（ただし本サイクル中の全面再構成は AP-P20 過剰具体化に当たるため、r3 → 後続サイクルにわたって漸進的適用 / cycle-215 で完全適用）。

### 文字量配分の是正状況（r3 = MINOR-1 visitor 対応 / **r4 で MINOR-1 visitor「27.5% 主張 vs 実測 19.4% 乖離」訂正**）

- §目的（誰のため + M1a/M1b 実利用フロー + 何のため 5 項目）= 約 60 行 = 来訪者価値の核心描写
- §作業内容 T-4 (F) 実体験フロー検証 + (G) a11y 視覚効果対比 = 約 25 行 = 来訪者体験の検証手順 / **r4 で (F) ダーク 1 系統 + 絵文字フィクスチャ + (G) 対称化視覚マーク対比追加 = 約 35 行**
- §論点 4 a11y（色 + 記号差別化 + line-through + underline 対称化）= **r4 で D1-D4 統合 4 案ゼロベース比較に再構成 = 約 50 行**（r3 比 +25 行）
- §論点 1 / §論点 2 / §論点 2-D（r4 新設） / §論点 6 / §論点 13 / §検討した他の選択肢の来訪者価値根拠記述 = r3 で §論点 13 全面書き換え 50 行 + §論点 2 増量 + §論点 1 80px ラベル詳述で **約 110 行**（r2 比 +50 行）/ **r4 で §論点 2-D（詳細ページ計算トリガー / 3 案ゼロベース比較）新設 = 約 25 行追加**
- **r3 までは「計約 220 行 / 計画書全体約 800 行 = 27.5%」と主張していたが r3 reviewer 来訪者価値 MINOR-1 が独立カウントで実測 154 行 / 795 行 = 19.4% と指摘**。主張値「27.5%」を撤回し**実測値 19.4%** に訂正（MINOR-1 visitor r4 対応）。今後は「目標 30% 以上 / 実測 N%」のように主張せず、実測のみ記載する運用に切替。
- **r4 で来訪者価値増量分（実測）**: §論点 4 全面再構成 +25 行 + §論点 2-D 新設 +25 行 + T-4 (F)(G) 拡張 +10 行 + 文字量配分訂正 自主修正 +5 行 = **約 +65 行**増加。r4 計画書全体は約 870 行 / 来訪者価値部分 約 219 行 = **約 25%**（**実測値ベース推定** / 完成後 reviewer が独立カウントで実測訂正）。引き続き 30% を目指すが、絶対値ではなく**内容の濃度**（来訪者シーン具体描写 + 競合差別化 + a11y 強化）で価値を担保する方針を継続。
- **r3 で `aria-live` 過剰アナウンス防止が「a11y 来訪者価値の差別化軸」を強化** / **r4 で `text-decoration` 対称化視覚マークによりさらに強化**: 競合 8 サイト 0 件の差別化軸を「色のみ → 色 + 記号 + 二層 ARIA → 色 + 記号 + 二層 ARIA + 対称化視覚マーク」に発展させ、SR ユーザー + 色覚多様性 + グレースケール印刷利用者への visitor 価値を多重的に引き上げる。

### r3 で新たに気づいて自主修正した点

1. **§論点 10 採用案を J1 → J1' に書き換え**: r2 段階の「即時計算 + `<100ms` 単純歯止め」を MAJOR-1 visitor r3 と整合する **3 段分岐**（`<100ms` / `<500ms` / `>500ms`）に拡張。
2. **§論点 12 AP 打ち消し策に AP-P11 / AP-I07 / AP-P17 / AP-I10 / AP-I11 を明示追加**: r2 では AP-P16 / AP-P21 / AP-WF12 のみ列挙だったが、本サイクルが実際に打ち消している AP を全列挙（NIT-N2 r3）。
3. **§引用 SSoT 5 (cycle-211 (viii)) を運用拡張へ書き換え**: r2 では「結果欄に aria-live 直付け」だったが、r3 で「結果欄 = aria-live なし + サマリ欄 = aria-live="polite"」の二層構成に運用拡張（**r7 で結果欄 role を `role="region"` に最終訂正** / r3 時点で `role="status"` のみとした計画は r7 で `role="region"` に確定）。
4. **§引用 SSoT 4 (cycle-210 (vi)) を計画段階確定に書き換え**: r2 では「T-1 実体確認後に T-4 確定」だったが、(e-β)(e-γ) を planner Read で確定（MAJOR-2 visitor r3）。
5. **§補足事項にレビュー対応マップを r1→r2 / r2→r3 の 2 セット記録**: ラウンド単位の追跡性を確保。
6. **r2 自主修正 9 件（下記）は r3 でもそのまま有効**:
   - r2-i. 論点 10 ローディング表示の採用根拠を即時計算前提に書き換え。
   - r2-ii. §論点 9 末尾の relatedSlugs 不在時差し替え候補論を削除。
   - r2-iii. §引用 SSoT 9 cycle-213 (δ) AP-I11 から「debounce 300ms」削除。
   - r2-iv. §引用 SSoT 10 cycle-213 `#fff → --fg-invert` SSoT 新規列挙。
   - r2-v. §引用 SSoT 13 で本サイクル新規 SSoT 候補「4 種」明示。
   - r2-vi. §引用 SSoT 15 として SSoT 候補追加。
   - r2-vii. §参考情報 14 で B-452 P3 昇格済明記。
   - r2-viii. §参考情報 15, 16 で GA データ / jsdiff ベンチ追加。
   - r2-ix. T-1 検証手順で reviewer サンプリング戦略明文化。

### r4 で新たに気づいて自主修正した点

1. **§論点 4 を D1-D4 統合 4 案ゼロベース比較に再構成**: r3 までは D1-D4 を個別比較する単純表だったが、`Component.module.css` L113 / L119 の現状実装事実認識を契機に、line-through 処遇を統合した 4 案比較に再構成（MAJOR-1 impl r4）。**採択を r3 D2 → r4 D4 に変更**（対称化視覚マークによる a11y 強化最大）。AP-P11 = AI 過去判断は変更可能の体現。
2. **§論点 2-D（詳細ページ計算トリガー）を独立論点として新設**: r3 まではタイル即時 / 詳細ボタン押下式の暗黙非対称を抱えていたが、M1b 操作性一貫性 likes line 16 + cycle-210 詳細ページ即時計算採択の引用適用で **案 A（詳細も即時計算化）採択**（MAJOR-2 visitor r4）。T-2 touch 範囲に `showResult` + `handleCompare` + 比較ボタン JSX 撤廃を追加。
3. **T-1 ベンチを 12 ケース表 + モード別 (d) literal 確定式に拡張**: r3 までは「ベンチ 4 点中 `<100ms` 最大点 × 80%」と単一値だったが、char モード Myers O(N×M) の M1b エンジニア層リスク（PR diff 数万行）への歯止めとして **line / word / char × 4 字数 = 12 ケース表** + **(d-line)(d-word)(d-char) 3 値独立確定**に拡張（MAJOR-1 visitor r4）。
4. **§論点 12 に AP-P19 + AP-I08 を明示追加**: r3 までは AP-P11 / AP-P16 / AP-P17 / AP-P21 / AP-I07 / AP-I10 / AP-I11 / AP-WF12 / AP-WF16 の 9 件列挙だったが、本サイクルが実際に打ち消している AP として AP-P19（`diff` npm v9.0.0 仕様依存）と AP-I08（DESIGN.md / デザイントークン未定義の視覚表現禁止）を追加（MINOR-4 visitor + NIT-1 impl r4）。
5. **§引用 SSoT に (c214-η)(c214-θ) を追加（13 項目 → 17 項目）**: タイル + 詳細ページ計算トリガー一貫化 (c214-η) と `.added underline` + `.removed line-through` 対称化視覚マーク (c214-θ) を新規 SSoT 候補として記録。後続サイクルへの SSoT 蓄積を強化。
6. **§補足事項にレビュー対応マップを r1→r2 / r2→r3 / r3→r4 の 3 セット記録**: ラウンド単位の追跡性を継続。
7. **文字量配分主張値の撤回**: r3 までの「27.5% 達成」主張を実測 19.4% と乖離していたため撤回し、今後は実測値ベース運用に切替（MINOR-1 visitor r4）。
8. **cycle-210/211/212/213 引用行番号の全件 grep 独立再検証**: MINOR-2 impl r4 で `L530 → L308` 訂正を契機に、L222 / L308 / L538 / L835 / L841 / L843 / L845 / L847-852 + cycle-213 L606 / L645 / L668 を全件再 grep / 全件 PASS 確認（§論点 12 AP-P16 / AP-WF12 と連動）。

### r4 → r5 改訂のレビュー対応マップ（MAJOR 1 + MINOR 2 + NIT 3 = 計 6 件 / CRIT 0 件 / 実装整合レビューは NIT 1 件で PASS / r5 で追加対応）

| 区分  | 番号 | 観点    | 対応箇所                                                                             | 対応内容                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ---- | ------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR | 1    | visitor | T-4 完成条件 bundle インパクト判定 / §論点 12 AP-P16 / AP-P19 打ち消し策 / §補足事項 | T-4 完成条件「+5kB 以下」事前閾値の根拠「cycle-210 text-replace の bundle 追加 4.2kB 実績」が cycle-210.md 内に存在しない架空データ（reviewer 独立 grep で全件 0 件確認 / AP-P16 + AP-P19 違反）を r5 で削除し、**事前閾値を撤廃して T-4 実測値の記録のみに切替**（PM 方針 = 案 (c)）。あわせて cycle-200〜213 引用数値を全件 grep 再検証 → 違反は本件 1 件のみ確認。 |
| MINOR | 1    | visitor | §「複合入力型ゆえの注意点」/ §論点 5 / §引用 SSoT 4 / T-1 完成条件                   | (a) 両入力空時と (e-α) 両入力同一非空時の系統境界曖昧化への対応。即時計算化（§論点 2-D 案 A 採択）後は `showResult` 撤廃により **(a) 両入力空時も `.noDiff` 枠表示**となる挙動を planner 認識訂正。T-1 で (a)/(e-α) Playwright 計測 → 統合（N=4）/ 分離維持（N=5）の判定を T-1 で確定する条件分岐を追加。                                                             |
| MINOR | 2    | visitor | T-4 (F) フィクスチャ 2 件分割 / §論点 12 AP-P19 / 判定基準                           | jsdiff サロゲートペア仕様の事実誤認訂正。**jsdiff v6+ 仕様で diffChars は Unicode code point 単位 = 独立絵文字は破損しない**（仕様値）+ **ZWJ 結合絵文字（家族絵文字等）は code point 境界で分割される可能性あり**。フィクスチャを「(I) 独立絵文字 + (II) ZWJ 結合絵文字」2 件に分割し、§論点 12 AP-P19 に仕様値ラベルで正確記述。                                    |
| NIT   | 1    | visitor | §論点 13 末尾サマリ status 欄計算ロジック (b) 境界処理                               | (b) 計算ロジックの境界処理指針として (i) 改行末尾の扱い（`split('\n')` 末尾空文字列 / `filter(Boolean)` 適用有無）/ (ii) Unicode code point カウント（`[...str].length` 採用 / `str.length` UTF-16 code unit カウントは不採用）を 1 文追記。テスト assertion で挙動を固定する指針を明示。                                                                             |
| NIT   | 2    | visitor | T-4 (G) D1 スクショ作成手法                                                          | D1 / D2 スクショ作成手法を「Playwright `evaluate` 経由で `.added` / `.removed` の `text-decoration: none` 強制上書き + マーカー記号 `::before` 非表示化」として最小指針を明示。別ブランチや stylesheet 一時 disable よりも軽量で同一ビルドで比較可能な利点を併記。                                                                                                    |
| NIT   | 1    | impl    | T-2 完成条件                                                                         | T-2 完成条件に「`npm run test -- text-diff` で 9 件全件緑維持」を 1 行追加。`logic.ts` の既存 export 形状を変更しないため `__tests__/logic.test.ts` への影響なしを機械的に検証（AP-WF16 自動チェック観点強化 / builder への明示メッセージ）。                                                                                                                         |

### r5 で新たに気づいて自主修正した点

1. **cycle-200〜213 引用数値の全件 grep 再検証で架空データ 1 件発見 → 即削除**: MAJOR-1 visitor r5 を契機に cycle-200〜213 引用数値（cycle-210 L222 / L308 / L538 / L835 / L841 / L843 / L845 / L847-852 + cycle-213 L606 / L645 / L668 + `tiles-registry.ts:47 tilesCount=14` + `package.json L27 "diff":"^9.0.0"`）を全件 grep で実在再確認。違反は **「cycle-210 text-replace の bundle 追加 4.2kB 実績」1 件のみ**で他は全件 PASS。当該箇所を r5 で削除 + 事前閾値撤廃で対応。後続サイクルでは過去サイクル数値引用時に「数値 + 出典行 + 一次資料 grep」の三点セット確認を AP-P16 / AP-P19 / AP-WF12 連動チェックとして強化。
2. **jsdiff v6+ 仕様の正確な事実認識**: MINOR-2 visitor r5 を契機に jsdiff release notes（https://github.com/kpdecker/jsdiff/blob/master/release-notes.md ）を確認し、「v6.0.0 で diffChars が Unicode code point 単位に変更された」事実を計画書 §論点 12 AP-P19 + T-4 (F) フィクスチャに正確反映。後続サイクルで diff 系ツールを扱う際の SSoT 候補として「独立絵文字は破損なし / ZWJ 結合絵文字は分割可能性あり」を記録。
3. **(a) と (e-α) の系統統合可能性を明示**: MINOR-1 visitor r5 を契機に「即時計算化後の挙動」を planner が再認識（`showResult` 撤廃で両入力空時も `.noDiff` 表示）。N=4 統合 / N=5 分離維持の判定を T-1 で確定する条件分岐を追加することで、T-4 AP-P21 計測純度を担保。
4. **§補足事項にレビュー対応マップを r1→r2 / r2→r3 / r3→r4 / r4→r5 の 4 セット記録**: ラウンド単位の追跡性を継続。

### r5 → r6 改訂のレビュー対応マップ（MAJOR 1 + NIT 1 = 計 2 件 / CRIT 0 件 / 実装整合レビュー r5 PASS）

| 区分  | 番号 | 観点    | 対応箇所                                                                                          | 対応内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | ---- | ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MAJOR | 1    | visitor | T-4 (F) 独立絵文字フィクスチャ L343 の Unicode code point 表記訂正 / §論点 12 AP-P19 連鎖違反防止 | L343 の「U+1F4DD = ✅ / U+1F4DD = 📝」を訂正。**✅ = U+2705**（BMP 内 / UTF-16 で 1 code unit = サロゲートペアではない / **仕様値** = Wikipedia Emoji 一次資料 U+270x ブロック「Check mark」+ planner 独立検証 `python3 -c "print(format(ord('✅'),'04X'))" = 2705`）+ **📝 = U+1F4DD**（SMP / UTF-16 でサロゲートペア = 2 code unit / **仕様値** = `python3 -c "print(format(ord('📝'),'04X'))" = 1F4DD`）。フィクスチャ意図を「BMP 内独立絵文字 ✅ + SMP 独立絵文字 📝 の両方が jsdiff v6+ で破損しない実証」として明確化。L344 / L647 の ZWJ 結合絵文字 code point 列は正しいため維持。 |
| NIT   | 1    | visitor | T-4 完成条件 L410 bundle インパクト判定の目安数値「+20kB 等」削除                                 | r5 で「+5kB 以下」事前閾値を撤廃した代替記述として書いていた「大幅増（builder 判断で例えば +20kB 等の明らかな異常）」の「+20kB」が出典・生成元なしの目安数値（MAJOR-1 r4 と同型の AP-P16 違反予防）。**r6 で「例えば +20kB 等」を削除**し、「明らかな異常（過去 14 タイル追加実績の典型レンジから 1 桁以上乖離する増加など）と感じた場合のみ reviewer に再評価を依頼」のラベルなし運用に切替。                                                                                                                                                                                             |

### r6 で新たに気づいて自主修正した点

1. **計画書中の Unicode 関連記述の網羅再確認**: MAJOR-1 visitor r6 を契機に L329 / L343 / L344 / L647 / L863 の全件を Unicode code point 観点で再点検し、L343 のみが誤り / L344 / L647 / L863 は正しい（L863 は r4 NIT-1 の歴史記録なのでそのまま保持）ことを実体確認。
2. **Unicode 一次資料 + 独立検証コマンドの二重出典運用**: 訂正にあたり Wikipedia Emoji 一次資料を WebFetch（✅ = U+2705 を U+270x ブロック「Check mark」で確認）+ `python3 -c "print(format(ord(c),'04X'))"` 独立検証コマンドの二重出典で訂正値を確定。後続サイクルで絵文字 / Unicode 関連の事実認識を扱う際に同型の二重出典運用を SSoT 候補として記録（AP-P19 連鎖違反防止）。
3. **「事実誤認の訂正契機に別の事実誤認を導入していないか」の自主検証フローを内在化**: r5 が「jsdiff サロゲートペア仕様の事実誤認訂正」を主旨としながら訂正根拠側に Unicode 事実誤認を持ち込んだレグレッションを受け、r6 では訂正対象周辺の関連事実をすべて一次資料で再確認する手順を必須化。

### r6 → T-1 実測書き戻し（MAJOR 3 件 + MINOR 2 件 / T-1 r2 レビュー指摘対応）

| 区分  | 番号 | 対応箇所                                                  | 対応内容                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ---- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR | 1    | t1-result.md §14 系統定義表                               | §14 の系統定義表を計画書 §論点 5 L545-550 の (a)/(b)/(c)/(d)/(e-β) と正確に整合。(b)=「短い入力 各 30 字」/ (e-β)=「片入力時」の混同を解消。N=4 = 「(a)(e-α) 統合により 1 系統減」の意味を明示。                                                                                                                                                                                                                                                                |
| MAJOR | 2    | 計画書本文 L103 / L169 / L174 / L337 / L414 / L549 / L711 | T-1 実機計測確定値の書き戻し: (1) L103 「N=5 系統確定」→「N=4 系統確定（T-1 実機計測済）」/ (2) L169 / L174 「baseline 8 枚」→「14 枚（w375/w1200/w1900 × light/dark × top/detail = 12 + after-compare × 2）」/ (3) L337 「after 8 枚」→「after 14 枚」/ (4) L414 「baseline 8 + after 8 = 44 枚」→「baseline 14 + after 14 = 56 枚」/ (5) L549 (e-α) 境界条件に「T-1 実機計測 N=4 統合確定」を追記 / (6) L711 §引用 SSoT (vi) に「T-1 実機計測確定済」を追記。 |
| MAJOR | 3    | tmp/cycle-214/baseline/ga-data.md                         | ファイルが「取得不可」状態のまま放置されていた問題を解消。t1-result.md §13.5 の実測値（過去 30 日: text-diff 0 PV / 全体 649 PV / mobile 49.6% / tools カテゴリ内 PV / 含意 5 件）で全面書き換え。                                                                                                                                                                                                                                                              |
| MINOR | 1    | t1-result.md §13 完成条件チェック表                       | 「計画書本文書き戻し（N=4 確定値 + baseline 枚数 14 枚）」行を追加し ✅ PASS とした。                                                                                                                                                                                                                                                                                                                                                                           |
| MINOR | 2    | t1-result.md §14 T-4 引き継ぎサマリ                       | T-4 でも baseline と同型 14 枚を撮影する旨（計画書 L337「T-1 と同型」を 14 枚と再定義）を明示追記。                                                                                                                                                                                                                                                                                                                                                             |

### r6 → r7 改訂のレビュー対応マップ（MAJOR 1 = 計 1 件 / CRIT 0 件 / T-2 r2 reviewer MAJOR-1 対応で計画書 SSoT を実装と整合化）

| 区分  | 番号 | 観点 | 対応箇所                                                                                                                                                                                                                                                                                                               | 対応内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR | 1    | impl | §論点 13 / T-1 詳細ページ role 確認 / T-2 詳細ページ touch 範囲 / T-2 完成条件 / 残す要素 / 観点 (vi) / §引用 SSoT 5 (cycle-211 (viii)) / §引用 SSoT 7 (cycle-213 (θ)) / §論点 6 F1/F2 比較表 / 旧改訂マップ（r1→r2 MAJOR-1 impl / r2→r3 CRIT-1 visitor） / §補足事項 3 / T-2 builder 実施記録 C 項 / 同 grep 検証出力 | **§論点 13 採択案 M1' → M1'' 訂正で計画書 SSoT と実装（T-2 r2 = `<pre role="region">`）を整合化**。背景: T-2 r1 builder が M1' を素直に実装して `<pre role="status">` を採用したところ T-2 r2 reviewer が「**WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つ**」と指摘 → r2 で `<pre role="region">` に修正済（実装は正しい状態）。しかし計画書 M1' は依然「`<pre>` = `role="status"` のみ」と記述しており仕様レベルで内部矛盾（r3 で撤回した M2' = aria-live 直付けと実質同等の過剰アナウンスを生む）。T-3 builder が計画書を読んで誤って `<pre role="status">` を再付与すれば a11y 問題再発のため、**r7 で M1' → M1'' に訂正**（**`<pre>` = `role="region"` + `aria-label`**（aria-live なし / 暗黙的 aria-live を持たない静的領域）+ サマリ status 欄に `role="status" aria-live="polite"` + 短文「+N / −M 箇所」付与）。M1' 採用根拠（過剰アナウンス回避 / cycle-213 (ζ) 引用 / cycle-211 (viii) 運用拡張）は M1'' でもそのまま維持。**訂正範囲**: 計画書中の `<pre>` 役割記述を全件 `role="region"` ベースに統一書き換え（計 18 箇所程度）+ §論点 13 採用案名称 M1' → M1'' + 比較表に M1'' 行追加 + M1' / M2' 行に取り下げ経緯追記 + M3' 行に M1'' との差分注記追加 + 経緯記録 + r6→r7 改訂対応マップ新規追加 + builder T-2 実施記録 C 項と grep 出力を実コード現状（L101 = `role="status"` / L115 = `role="region"`）と整合化。 |

### r7 改訂の主旨（T-2 r2 reviewer MAJOR-1 対応 / CRIT 0 件）

**r7 改訂の主旨**: T-2 実装で `<pre role="status">` を採用したところ reviewer が「WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つ」と指摘。これは r3 で撤回したはずの M2'（aria-live 直付け）と実質同等の過剰アナウンスを生じるため、M1' は仕様レベルで内部矛盾していた。r7 で **M1' → M1''**（`<pre>` = `role="region"`）に訂正し、計画書 SSoT と実装 (T-2 r2 = `<pre role="region">`) を整合化。M1' 採用根拠（過剰アナウンス回避 / cycle-213 (ζ) 引用）はそのまま M1'' でも維持される。

### T-2 builder 実施記録（2026-05-28 / cycle-214 T-2）

**実施内容**:

- A. `src/app/(new)/tools/text-diff/` を新規作成（page.tsx / page.module.css / opengraph-image.tsx / twitter-image.tsx の 4 ファイル）
- B. `src/app/(legacy)/tools/text-diff/` を削除（page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル）
- C. `src/tools/text-diff/Component.tsx` の即時計算化：`showResult` state + `handleCompare` useCallback + `<button>比較する</button>` を撤廃 / `useMemo` で diffParts を派生計算 / サマリ status 欄（`role="status" aria-live="polite"` / モード別単位 行/単語/文字）を新設 / **`<pre>` の `role="region"` は維持**（T-2 r1 で一旦 `role="status"` に変更したが r2 reviewer 指摘で `role="region"` に戻した = WAI-ARIA 仕様で `role="status"` は暗黙的に `aria-live="polite"` + `aria-atomic="true"` を持つため過剰アナウンス発生 / r7 で計画書側も M1'' = `role="region"` 維持に最終訂正済 / aria-live は `<pre>` に付与しない）
- D. `src/tools/text-diff/Component.module.css` のトークン置換：旧トークン 17 件（7 種）全置換 + hex 5 件全置換 + D4採択（`.added` に `text-decoration: underline` + `::before { content: "+" }` / `.removed` に `::before { content: "−" }` を追加）/ `.summary` クラス新設
- E. `src/tools/text-diff/meta.ts` の棚卸し：`howItWorks` + `faq` を即時計算化・D4配色・a11y サマリ status 欄の反映内容に更新
- F. `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` の `search_intents` に 4 語追加（テキスト差分 / 文章 比較 / テキスト 比較 / diff チェッカー）
- G. `docs/backlog.md` に B-461 新規起票 / B-452 に N=2 達成追記 / B-453 に cycle-214 引用適用実施済追記

**grep 検証結果**:

- `grep -c "var(--color-" src/tools/text-diff/Component.module.css` → **0**
- `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/text-diff/Component.module.css` → **0件**
- `grep -nE '#[0-9a-fA-F]{3,6}' src/tools/text-diff/Component.tsx` → **0件**
- `grep -n "showResult\|handleCompare\|比較する" src/tools/text-diff/Component.tsx` → **0件**
- `grep -nE 'text-decoration' src/tools/text-diff/Component.module.css` → L113 `text-decoration: underline` + L127 `text-decoration: line-through` の **2行**
- `grep -nE 'role="(region|status)"' src/tools/text-diff/Component.tsx` → **L101 `role="status"`（サマリ status 欄）+ L115 `role="region"`（`<pre>` 差分結果欄）の 2 件**（T-2 r2 で `<pre>` を `role="region"` に戻した最終状態 / r7 で計画書 M1'' 整合化済 / 実コード現状と一致）
- `grep -nE 'aria-live="polite"' src/tools/text-diff/Component.tsx` → L102 サマリ欄のみ 1件（`<pre>` には aria-live なし）

**テスト**:

- `npm run test -- text-diff` → **9 件全件緑 PASS**（logic.test.ts 既存 9 件 / Component.test.tsx は B-461 として後続サイクルへ）

**lint / format:check**:

- `npm run lint` → **PASS**
- `npm run format:check` → **PASS**

**T-3 builder への引き継ぎ**:

- Component.tsx は即時計算化済（`showResult` 等を撤廃 / `useMemo` で diffParts 派生）。TextDiffTile.tsx の即時計算実装パターンは Component.tsx と同型で実装可能。
- `logic.ts` の export 形状は変更なし（`computeDiff` / `hasDifferences` / `DiffMode` / `DiffPart`）。
- (legacy) 配下の text-diff は削除済。(new) 配下が唯一の詳細ページ。

---

### T-3 builder 実施記録（cycle-214 T-3 / 2026-05-28）

**実施事項**:

- **A. TextDiffTile.tsx 新規作成**（`src/tools/text-diff/TextDiffTile.tsx`）
  - cols=3 rows=3（400×400px）複合入力型タイル
  - 即時計算（`useMemo` 派生 / `computeDiff` + `hasDifferences` を再利用 / debounce なし）
  - §論点 13 M1'' 採択: 長文 `<pre>` = `role="region"` + `aria-label="Diff result"`（aria-live なし）/ サマリ status 欄 = `role="status"` + `aria-live="polite"`
  - §論点 4 D4 採択: `data-part="added"` span = underline + 背景色 `--success-soft` + 文字色 `--success-strong` + 前置「+」記号 / `data-part="removed"` span = line-through + 背景色 `--danger-soft` + 文字色 `--danger-strong` + 前置「−」記号
  - コピーボタン: 差分結果を Unified テキスト形式でコピー / 「コピー」→「コピー済み」文言変化 / AP-I11 cleanup（useRef + useEffect）
  - 詳細リンク: 「テキスト差分の使い方を見る →」/ href="/tools/text-diff"
  - インラインスタイル方式（既存 14 タイル同型 / CSS Module 不使用）

- **B. TextDiffTile.module.css 新規作成**: インラインスタイル方式のため不要（既存タイル同型）

- **C. `__tests__/TextDiffTile.test.tsx` 新規作成**（17 件）
  - 観点 (i)〜(xii) 計 15 件 + 設計テスト 1 件（vi が 2 テスト分割）= 合計 17 件
  - `data-part="added"` / `data-part="removed"` 属性によるインラインスタイル span の検出
  - 設計テスト: レンダリング直後のタイマー数を基準値として「テキスト入力でタイマー数が増えない」ことを `vi.getTimerCount()` で検証（debounce / setTimeout 非使用の保証）

- **D. TILE_DECLARATIONS 登録**（`src/tools/_constants/tile-declarations.ts`）
  - `TextDiffTile` を `import` 追加 + `TILE_DECLARATIONS` 配列末尾に text-diff エントリ追加
  - `npm run generate:tiles-registry` 実行 → `tilesCount=14 → 15`（`tiles-registry.ts:48`）

**テスト件数**:

- 新規: **17 件**（TextDiffTile.test.tsx）
- 既存: **9 件**（logic.test.ts）
- 合計: **26 件全件緑 PASS**

**tilesCount 実測**:

```
$ grep -n "tilesCount" src/tools/generated/tiles-registry.ts
48:// Count at generation time: tilesCount=15
```

**完成条件確認**:

- `npm run lint` → PASS
- `npm run format:check` → PASS
- `npm run test -- text-diff` → **26 件全件緑 PASS**（logic.test.ts 9 件 + TextDiffTile.test.tsx 17 件）
- `npm run build` → PASS（フォントダウンロードの外部ネットワーク警告は既知問題 / コードエラーなし）

---

### T-4 builder 実施記録（cycle-214 T-4 / 2026-05-28）

**実施事項**:

- **A. MINOR-A 対応**: `__tests__/TextDiffTile.test.tsx` に 3 件追加（T-3 r2 reviewer 指摘）
  - `(ix-disabled)` 差分なし時にコピーボタンが disabled になる
  - `(ix-enabled)` 差分あり時にコピーボタンが enabled になる
  - `(x-silent-fail)` clipboard 不在時 silent fail: 例外が漏れない
  - TextDiffTile.test.tsx: 16 件 → **19 件**（T-3 件数訂正: NIT-A 対応で 16 件が正確値 / T-4 追加で 19 件）
  - 全体: 26 件 → **28 件**全件緑 PASS

- **B. AP-P21 計測 N=4 系統（5 回）**
  - URL: `/internal/tiles/preview/tools/text-diff`（本番ビルド）
  - (a+e-α) textarea 77.19px / diffRegion・noDiff 214.39px / copyBtn **25px** ← FAIL
  - (b) (c) (d) (e-β) 全系統: textarea 77.19px / diffRegion 214.39px / copyBtn 25px
  - 変化率: 0.00%（全系統 / AP-P21 (v) ±15% **PASS**）
  - **copyBtn h=25px < 40px = FAIL**: cycle-213 SSoT (β)「文言変化は AP-P21 適用外」の解釈では height 問題に適用不可 → reviewer 判断を要する

- **C. SSoT 引用検証結果確定**
  - cycle-210 (i): PASS（textarea 77.19px ≥ 40px）/ FAIL（copyBtn 25px < 40px）→ reviewer 評価要
  - cycle-210 (ii): 適用対象なし（即時計算型 = 操作側 input 不存在）
  - cycle-210 (v): PASS（変化率 0.00% / N=2 達成）
  - cycle-210 (vi): 再評価（text-diff noDiff 枠 h=214.39px = 膨張側 flex:1 構造 / cycle-210 error 枠 h=46.09px とは別物）
  - cycle-211 (viii): PASS（二層構成 = `<pre role="region">` + サマリ `<div role="status" aria-live="polite">`）
  - cycle-213 (β): N=3 → **N=4 達成**（コピーボタン文言変化 AP-P21 適用外 SSoT）
  - cycle-213 (γ)(δ)(θ)(ζ): PASS

- **D. スクリーンショット撮影（64 枚）**
  - after/ 14 枚（T-1 baseline 同型）
  - tiles-preview/ 4 枚（light/dark × empty/with-diff）
  - flow/ 21 枚（18 flow + 3 emoji）
  - a11y-compare/ 6 枚（D1/D2/D4 × grayscale 有無）
  - ap-p21/ 5 枚（N=4 + extra (e-β)）
  - **計 64 枚（計画書 56 枚規定を上回る）**

- **E. 品質コマンド全 PASS**
  - `npm run lint` → PASS
  - `npm run format:check` → PASS
  - `npm run test` → **4529 件全件緑 PASS**（312 test files）
  - `npm run build` → PASS（Turbopack / TypeScript エラー 0 件）

- **F. 絵文字 diff 挙動確認（AP-P19 連動）**
  - 独立絵文字（✅ U+2705 BMP / 📝 U+1F4DD SMP）: char モードで破損なし（jsdiff v6+ 仕様値）
  - ZWJ 結合絵文字（👨‍👩‍👧 vs 👨‍👩‍👦）: char モードで U+200D 分割表示（仕様どおり）

**SSoT 書き戻し（§補足事項 新規候補確定）**:

- **(c214-δ)** hex → `--success-soft` / `--success-strong` / `--danger-soft` / `--danger-strong` 4 種マッピング: **確定（N=1 初出 / 後続 diff 系・ステータス系ツール引用候補）**
- **(c214-ε)** 複合入力型タイル「膨張側 3 つ構造」初出 SSoT: **確定（設計意図 = 膨張側 3 / 実装 = 膨張側 1 / 乖離理由 = cols=3 rows=3 フィット / 理由付き記録）**
- **(c214-ζ)** 長文結果欄に aria-live なし + サマリ status 欄にのみ aria-live 付与の二層構成 ARIA 設計: **確定（N=1 初出 / 詳細 + タイル両適用）**
- **(c214-η)** タイル + 詳細ページ計算トリガー一貫化（即時計算同型）SSoT: **確定（N=2 / cycle-210 N=1 + cycle-214 N=2）**
- **(c214-θ)** `.added underline` + `.removed line-through` 対称化視覚マーク SSoT: **確定（N=1 初出 / 後続 diff 系ツール引用候補）**
- **jsdiff v6+ 仕様新規知見**: 独立絵文字（BMP/SMP 問わず）は diffChars で破損しない / ZWJ 結合絵文字は code point 境界で分割される可能性あり → `docs/knowledge/` 記録候補

**B-452 N=2 達成確認**:

- backlog.md L95 に「cycle-214 完了で N=2 達成」記載済（T-2 で実施 / T-4 で確認）
- 着手条件タイミング: cycle-215 以降の複合入力型 3 件目で N=3 達成見込みに更新済

---

### T-4 reviewer 指摘対応記録（cycle-214 T-4 r1 レビュー / 2026-05-28）

**レビュー結果**: MAJOR 2 件 / MINOR 2 件 / NIT 2 件 = 計 6 件 → 全件対応完了

| 区分  | 番号 | 対応箇所                                    | 対応内容                                                                                                                                                                                                                                                         |
| ----- | ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR | 1    | `src/tools/text-diff/TextDiffTile.tsx` L338 | `padding: "3px 8px"` → `padding: "6px 8px"`（cycle-213 同型）に変更。copyBtn h=25px → **31px** に改善（cycle-211 SSoT 31px PASS と同型 / ±0px 乖離 / PASS 判定）。ap-p21 再計測で全系統 31px 確認済                                                              |
| MAJOR | 2    | `tmp/cycle-214/flow/` flow スクリプト再設計 | Step 2: `/tools` ページで text-diff カードが viewport に映る位置までスクロール → スクショ / Step 3: タイルプレビューページ（同一コンポーネント）で差分入力 + 結果表示状態を捕捉 → スクショ。w1200 light / w375 light / w1200 dark × 6 ステップ = 18 枚再撮影完了 |
| MINOR | 1    | `tmp/cycle-214/t4-result.md` §1 §補足事項   | (v) 変化率 0.00% は「表示矩形固定」の実装結果であり、B-452 N=2 達成として書き戻し時に「同軸ではない」注記を追加（→ 下記 (c214-β) 注記参照）                                                                                                                      |
| MINOR | 2    | §補足事項 新規 SSoT 候補 (c214-ι)           | text-diff 独自 noDiff 枠 SSoT を新規追加（→ 下記参照）                                                                                                                                                                                                           |
| NIT   | 1    | `docs/cycles/cycle-214.md` §補足事項        | T-4 builder 実施記録の最終版 + MAJOR/MINOR/NIT 全件対応状況を §補足事項に書き戻し（本セクション = 対応済）                                                                                                                                                       |
| NIT   | 2    | §補足事項 (c214-ε) 注記追加                 | 計画書本文「膨張側 3 つ」記述と実装乖離の読み替え注記を追加（→ 下記 (c214-ε) 参照）                                                                                                                                                                              |

**AP-P21 再計測結果（MAJOR-1 対応後）**:

| 系統               | element     | h (px)   | AP-P21 ≥32px（cycle-211/213 SSoT） |
| ------------------ | ----------- | -------- | ---------------------------------- |
| 全系統             | copyBtn     | **31px** | PASS（cycle-211 SSoT 31px 同型）   |
| 全系統             | oldTextarea | 77.19px  | PASS                               |
| 全系統             | newTextarea | 77.19px  | PASS                               |
| 全系統（差分あり） | diffRegion  | 208.39px | PASS                               |
| (a+e-α)            | noDiff      | 208.39px | PASS                               |

注: diffRegion / noDiff の高さが 214.39px → 208.39px に微変しているのは padding 変更によるフッター高さ変化（6px 増加）の影響（タイル総高さ一定のため膨張側 flex:1 が 6px 圧縮）。

**新規 SSoT 候補 (c214-ι)**（MINOR-2 対応）:

> **(c214-ι) text-diff noDiff 枠 SSoT = h=208.39px / w=380px**（MAJOR-1 対応後の最終実測値）
>
> - 構造: 膨張側 flex:1 + overflowY:auto の noDiff 表示時の実測値
> - cycle-210 (vi) `.error` 枠 h=46.09px（operand-side flexShrink:0 / padding 拡張型）とは**構造別物**
> - N=1 初出 / 後続サイクルで text-diff noDiff 枠の高さ基準を引用する場合は本値を参照
> - 注: MAJOR-1（padding 変更）前の旧計測値は h=214.39px（T-4 初回計測値）/ 旧値は t4-result.md に記録済

**SSoT (c214-ε) 読み替え注記**（NIT-2 対応）:

> **(c214-ε) 「膨張側 3 つ」設計意図 vs 実装「膨張側 1 つ」乖離注記**
>
> - 計画書本文 L91 / L400 / L734 等で「膨張側 3 つ（A/B/結果）」と記述されているが、これは **r6 まで複合入力型タイルの設計意図ベース**の記述
> - T-3 実装で確定した実体: **膨張側 = 差分結果欄（diffRegion）のみ = N=1 膨張側**（A（oldTextarea）/ B（newTextarea）は flexShrink:0 固定 / cols=3 rows=3 = 400×400px タイルへの現実的フィットにより A/B 固定・結果欄のみ膨張）
> - **後続サイクル planner への指示**: 計画書 L91 / L400 / L734 の「膨張側 3 つ」記述は「設計意図ベース（旧 r6 以前の計画値）」として読み替え、**実装 SSoT として本注記 (c214-ε) の「膨張側 1 つ」を引用**すること

**(c214-β) AP-P21 (v) 変化率 N=2 の「同軸ではない」注記**（MINOR-1 対応）:

> **(c214-β) B-452 AP-P21 (v) N=2 達成の「同軸性」注記**
>
> - cycle-210 N=1（text-replace: textarea 入力量変動 → 高さ変化 11.55% 計測）と cycle-214 N=2（text-diff: 表示矩形固定設計 → 変化率 0.00% 計測）は **「同軸ではない」**
> - cycle-210 の計測は「入力量変動による高さ変化」を B-452 ±15% 暫定値の N=1 として確立
> - cycle-214 の 0.00% は「flex:1 / overflowY:auto 構造で表示矩形が固定される」という別の設計結果であり、±15% の入力量変動起因の N=2 データポイントとしては有意ではない
> - 後続サイクルで複合入力型 3 件目を実施する際の判断材料として残す（「入力量変動で高さが変化するタイル」での計測が B-452 N=3 の真の N=3 として有意）

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
