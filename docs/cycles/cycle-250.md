---
id: 250
description: 診断（性格診断系クイズ）の中で実測トラフィックがありながら結果体験が薄い「理系思考タイプ診断（science-thinking）」の10タイプに、cycle-247でword-senseに有効だった標準形式 detailedContent（traits / behaviors / advice）を追加し、結果到達者の「わかる!・シェアしたい」体験を厚くする。副次的に cycle-249 の OtherTypesNav 回遊導線が自動有効化され、第三者向け静的結果ページも読み応えのある10ページになる（B-518、B-323の具体化）。
started_at: "2026-06-18T16:44:11+0900"
completed_at: null
---

# サイクル-250

このサイクルでは、**理系思考タイプ診断（`/play/science-thinking`）の結果体験を厚くする**。10タイプそれぞれに標準形式の `detailedContent`（traits / behaviors / advice）を追加し、診断を遊んで自分のタイプを知った人の「わかる!・もっと読みたい・シェアしたい」を受け止める。

## なぜやるか（来訪者の所在）

GA4（直近28日、property 524708437）で見ると、このサイトに来た人の大半は**診断（性格診断系クイズ）**で遊んでいる。PV上位は character-personality(32) / word-sense-personality(28) / traditional-color(15) と診断がエンジンになっている。

その中で `science-thinking` は **診断PV第5位（6PV / 4ユーザー / 28日）** と確かに人が来ているのに、**結果体験が一段浅い**。診断を最後まで遊んで自分のタイプ（例: アインシュタイン型思考者）を知っても、表示されるのは1段落の `description` だけ。cycle-247 で word-sense に `detailedContent`（特徴・あるある・締めの言葉）を足したところ完了率は約80%に達し、結果ページに t.co シェア外部流入も生まれた。**science-thinking は、その厚い結果体験を持つ診断の中で detailedContent を欠く最上位**＝最も投資対効果の高い取り残しだ。

10人中4人がせっかく20問を解いて結果まで到達してくれているのに、読み終えてすぐ手ぶらで帰ってしまう。ここを厚くすれば、来訪者の満足とページ回遊（＝PV、本プロジェクトの目的）が同時に増える。

### この実装が同時に解く2つのこと

1. **結果到達者本人の体験（ResultCard）**: 標準形式の `detailedContent` を足すと `renderStandardContent` が特徴・あるあるリスト・アドバイスを描画し、結果が「読み応えのあるタイプ解説」になる。
2. **cycle-249 の回遊導線の自動有効化**: `OtherTypesNav`（他の9タイプへ回遊）は標準形式の `renderDetailedContent` 経路で描画される。science-thinking は現在 detailedContent が無いため**回遊導線も出ていない**。detailedContent を足すことで、cycle-249 で整えた回遊導線が science-thinking でも自動的に有効化される（新規実装ゼロ）。
3. **第三者向け静的結果ページ（`/play/science-thinking/result/<id>`）**: 同じ detailedContent が静的結果ページ10枚にも反映され、薄かったページが読み応えのある独立ページになる（インデックス価値・シェア時の見え方の向上は副次効果）。

## スコープ確定（核心コード事実・検証済み）

- `src/play/quiz/data/science-thinking.ts`：`type: "personality"` / `category: "personality"` の**標準形式**診断。`SCIENCE_TYPE_IDS` は10件（einstein, curie, turing, davinci, darwin, edison, newton, nightingale, faraday, fabre）。各 result は濃い `description` を持つが `detailedContent` は**全件欠落（grep 0件）**。`resultPageLabels` 未設定（デフォルト見出しを使用）。
- 標準形式 `detailedContent` の型（`src/play/quiz/types.ts` `QuizResultDetailedContent`）: `{ variant?: undefined; traits: string[]（3-5項目・各1-2文）; behaviors: string[]（3-5項目・共感を呼ぶ具体的シーン）; advice: string（ポジティブな1-2文） }`。
- 描画経路（`ResultCard.tsx` `renderDetailedContent`）: `variant` 未定義 → `renderStandardContent`（traits/behaviors/advice ＋ cycle-249 の `OtherTypesNav`）。**新規コンポーネント不要・純粋なデータ/文章の追加で完結**。

## 実施する作業

- [ ] **変更前スクリーンショット取得**: science-thinking の結果ページ（ResultCard と静的結果ページ `/result/<id>`）をダーク/ライト×PC/モバイルで記録（`tmp/cycle-250/before/`）。take-screenshot スキル使用。
- [ ] **詳細コンテンツ仕様の確定**: word-sense の detailedContent を参照に、science-thinking 用の執筆ガイド（既存 description と重複させない・各タイプの思考スタイル固有の具体性・トーン一貫性・本サイトのAI生成エンタメ免責との整合）を `tmp/cycle-250/spec.md` にまとめる。resultPageLabels を理系思考の世界観に合わせるか（例:「この思考タイプの特徴」「この思考タイプのあるある」）を判断。
- [ ] **detailedContent 執筆（小分けでサブエージェントに委譲）**: 10タイプを少数ずつのバッチに分け、それぞれ専任サブエージェントに detailedContent（traits 3-5 / behaviors 3-5 / advice）を執筆させる。並列書き込み衝突を避けるため各エージェントは tmp に成果物を出力し、PM が `science-thinking.ts` に統合する。
- [ ] **データ統合**: 10タイプ分の detailedContent を `science-thinking.ts` に反映。必要なら resultPageLabels を追加。
- [ ] **品質テストの追加**: 既存 batch テスト（例: `character-personality-results-batch*.test.ts`）に倣い、science-thinking の全10タイプが detailedContent（traits/behaviors/advice 必須フィールド・件数下限）を持つことを検証するテストを追加。
- [ ] **変更後スクリーンショット取得・可視確認**: ResultCard と静的結果ページ × ダーク/ライト×PC/モバイル（`tmp/cycle-250/after/`）。detailedContent 描画・OtherTypesNav 回遊導線の自動有効化・レイアウト破綻なし・可読性を確認。
- [ ] **レビュー**: reviewer（コード/データ整合 と 内容/UX）に依頼。指摘を判断し必要分を是正。
- [ ] **品質ゲート**: `npm run lint && npm run format:check && npm run test && npm run build` をクリーン環境で一括再実行し全緑を確認。

## 作業計画

### 目的

理系思考タイプ診断を最後まで遊んで自分のタイプを知った来訪者に、「わかる!・もっと読みたい・他のタイプも見たい」を満たす厚い結果体験を、実際に人がいる ResultCard と静的結果ページの両方に届ける。指標（PV・シェア・インデックス）は目的化せず、結果到達者の満足を起点に置く。

### 作業内容

cycle-247（word-sense）で確立した「標準形式 detailedContent による結果体験強化」を、診断PVで detailedContent を欠く最上位の science-thinking に適用する。新規コンポーネントやインフラは追加せず、`science-thinking.ts` のデータに detailedContent を足すだけで、ResultCard・OtherTypesNav 回遊・静的結果ページの3面が同時に厚くなる。執筆は1タイプの質と全体の一貫性を両立させるため、小バッチでサブエージェントに委譲し PM が統合・整合確認する。

### 検討した他の選択肢と判断理由

- **B-517（OtherTypesNav 9実装の共通コンポーネント統一・SSoT）**: cycle-249 の直接の後続だが内部リファクタ（技術的負債解消）であり、来訪者への直接価値は薄い。憲法は「設計の美しさより来訪者価値」を優先するため見送り、本サイクルは来訪者価値の高い結果体験強化を選択。
- **B-505（Dependabot 脆弱性対応）**: 健全性維持として重要だが、対象は全て推移依存・ビルド時のみ・露出低で来訪者影響が小さい。緊急性が低いため別サイクルへ。
- **japanese-culture（detailedContent=0・3PV）も同時対応**: PVが science-thinking より低く、1サイクル1診断に絞った方が質とトレーサビリティを保てる（cycle-247 も word-sense 1診断に集中）。次サイクル以降の候補として backlog 化。
- **送り先のPV規模（6PV）が小さいことについて**: 6PVは「結果到達者本人」だが、本実装は静的結果ページ10枚も同時に厚くするため、将来の新規検索流入・シェア時の見え方という波及も得られる。診断というエンジンへの投資として妥当と判断。

### 計画にあたって参考にした情報

- GA4（property 524708437・直近28日・pagePath別 screenPageViews/totalUsers）: 診断系が PV 上位を占有、science-thinking は診断第5位（6PV/4ユーザー）で detailedContent を欠く最上位であることを確認（2026-06-18 取得）。
- `docs/cycles/cycle-247.md`: word-sense への detailedContent 追加が結果体験（完了率約80%）に有効だった先行事例。
- `docs/cycles/cycle-249.md`: OtherTypesNav の標準形式描画経路（renderStandardContent 内）。本サイクルで science-thinking に detailedContent を足すと自動有効化される根拠。
- ソースコード一次確認: `src/play/quiz/data/science-thinking.ts`（10タイプ・detailedContent 皆無・標準形式）、`src/play/quiz/types.ts`（QuizResultDetailedContent 標準型）、`src/play/quiz/_components/ResultCard.tsx`（renderDetailedContent → renderStandardContent の分岐）。
- **外部仕様への依存**: 本計画は内部コンテンツ/データ追加で完結し、SEO機能・ブラウザAPI・Schema.org・サードパーティ仕様の存続に依存しない（インデックス価値向上は既存の描画/インデックス機構を使う副次効果に留まる）。よって外部一次資料の確認は不要。

## キャリーオーバー

- （着手前）なし。サイクル進行中に判明した持ち越しはここと `docs/backlog.md` に追記する。

## 補足事項

- 本サイクルは結果ページの表示が変わる UI 変更を伴うため、take-screenshot による変更前後の視覚確認を必須とする。
- detailedContent は既存 description と内容を重複させず、各思考スタイル固有の新しい具体性（あるある・行動パターン）を足すこと。AI生成エンタメである旨の trustNote と矛盾しない範囲で書く。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
