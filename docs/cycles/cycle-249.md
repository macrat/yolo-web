---
id: 249
description: 診断を遊んで自分のタイプを知った人に「他のタイプも見てみたい」を受け止める回遊導線を、来訪者価値起点で設計・実装する（B-516）。実装は唯一未対応だった標準形式診断 word-sense-personality 向けに共有コンポーネント OtherTypesNav を新設し、受検者本人の ResultCard と第三者向け静的結果ページの両 surface に展開（8 variant 診断は既存実装済み）。cycle-247 で撤回した SEO 動機の実装との違いは「人がいる場所に・来訪者価値起点で・視覚確認込みで置く」こと。
started_at: "2026-06-18T11:45:42+0900"
completed_at: "2026-06-18T13:21:09+0900"
---

# サイクル-249

このサイクルでは、診断（性格診断系クイズ）を遊んで**自分のタイプを知った人**に、「他のタイプも見てみたい」という素直な好奇心を受け止める**回遊導線**を設計・実装する（B-516）。

## なぜやるか（来訪者の所在）

cycle-247 で word-sense-personality の結果体験を厚くし、診断系は実測の勝者と確定している（cycle-247 当時の80日窓で完了率72%。本サイクルの30日窓で再計測すると word-sense 単体は約80%——窓が異なるため数値は前後するが、いずれも「結果到達者が多い」傾向を示す）。せっかく結果を読み終えて「面白い・わかる!」と高まった人が、その勢いのまま次に行ける場所が今は乏しい。「もう一度挑戦」か「別の診断へ」しかなく、**今読んだ診断の"他のタイプ"を覗く道が無い**。24タイプある character-personality のような診断では「自分はこれだったけど、他の23タイプはどんな人?」という好奇心は強いはず。これを受け止めれば、来訪者の満足とページ回遊（＝PV、本プロジェクトの目的）が同時に増える。

## 撤回版（cycle-247 OtherResultTypes）との本質的な違い

cycle-247 は一度この導線を実装したが撤回した。理由は (1) 動機が SEO 内部リンク偏重、(2) 来訪者起点の設計が欠落、(3) フロントエンドデザイン・視覚確認なし。さらに撤回版は**第三者向け静的結果ページ（`/play/:slug/result/:id`、実測PVほぼゼロ）**に手を入れていた。本サイクルの再設計は逆に立つ：

- **人がいる場所に置く**: 実際に到達するのは受検者本人が見る `ResultCard`（完了率80%・診断ページ inline）。回遊導線をここに置く。**加えて**、レビューで「標準形式の静的結果ページ（第三者向け）には全タイプ回遊が無い」と判明したため（cycle-247 当時の『静的ページにはグリッドがある』という前提は variant 診断の話で、標準形式 word-sense には当てはまらなかった）、word-sense の結果ページに t.co シェア外部流入が実在する実測も踏まえ、**両 surface（ResultCard と静的結果ページ）に同じ導線を出して真の parity を成立させた**。共有コンポーネント `OtherTypesNav` を両者で利用。
- **来訪者価値起点**: 「SEO のため」ではなく「自分のタイプを知った人の好奇心を満たすため」。指標は目的化しない。
- **フロントエンドデザイン・視覚確認を必須**: frontend-design スキル参照、変更前後の take-screenshot、ダーク/ライト×PC/モバイル確認。

> **確定レバー（スコープ確定で絞り込み）**: 回遊導線は既に8 variant 診断すべてに存在し、**標準形式（variant 無し）の word-sense-personality だけが全タイプ回遊セクションを持たない**ことが判明（cycle-247 で detailedContent を厚くした直後の唯一の取り残され）。よって本サイクルは **word-sense-personality の ResultCard に8先行例と同じ「他のタイプも見てみよう」全タイプ回遊セクションを追加し parity を回復する**。根拠・GA実測・設計は `tmp/cycle-249/scope.md`（PM 核心コード事実 再検証済み: 8 variant が既に result リンク保持 / 標準形式は word-sense のみ / QuizContainer が allResults を無条件供給 / 送り先8タイプ全て index 可）。

- [x] **スコープ確定（分析）**: foreground sub-agent で最新 GA4/BigQuery を取得。word-sense は診断トップ PV 第2位（29PV/25ユーザー）・完了率80%・結果ページに t.co シェア外部流入が実在・**導線が無い現状でも手動 URL 操作で他タイプ結果へ自発遷移1件（需要の実証）**。並行して PM が ResultCard / 結果データ構造 / variant 各 Content を精読し、回遊導線の欠落が word-sense（標準形式）のみと確定。`tmp/cycle-249/scope.md`。
- [x] **変更前スクリーンショット取得**: ResultCard をダーク/ライト×PC/モバイルで記録（`tmp/cycle-249/before/`）。静的結果ページ分は実装後に気付いたため git stash で kickoff 状態を復元して撮影（`tmp/cycle-249/before-resultpage/`、復旧フロー使用を明記）。
- [x] **実装**: 共有 presentational コンポーネント `OtherTypesNav`（`src/play/quiz/_components/OtherTypesNav.tsx` + `.module.css`）を新設し、(a) `ResultCard.tsx` の `renderStandardContent`（本人向け・client）と (b) 静的結果ページ `result/[resultId]/page.tsx` の標準形式 branch（第三者向け・server）の**両方**で利用。advice の後・CTA/シェアの前に配置。現在タイプは非リンクのハイライト span（aria-current=page・タイプ色の左アクセント）、他は `/play/<slug>/result/<id>` への Link。レイアウトは pill ではなく**全幅の縦リスト**（後述「レビュー記録」M-1/M-2 参照: 長いタイプ名で pill が不揃いに折り返すため list に変更し `word-break: keep-all` で語中改行を抑制）。標準形式の汎用実装で将来の標準診断にも自動適用。
- [x] **品質テストの追加**: `OtherTypesNav.test.tsx`（8件: 描画・他タイプリンク・現在タイプ非リンク化・--type-color 設定・nav ランドマーク・headingLevel h2/h3・1件以下で非描画）と `ResultCard.test.tsx` の統合テスト5件を追加。
- [x] **変更後スクリーンショット取得・可視確認**: 両 surface × ダーク/ライト×PC/モバイル（`tmp/cycle-249/after/`・`tmp/cycle-249/after-resultpage/`）。レイアウト破綻なし・タップtarget（行高〜44px）・ダークモード可読性・現在タイプ識別性を確認。
- [x] **レビュー**: reviewer 2名（コード+設計 / 視覚+UX）。指摘と対応は後述「レビュー記録」。M-1（typecheck赤）含む must/should を是正し再確認。
- [x] **品質ゲート**: `npm run lint`・`format:check`・`vitest run`（5528 pass / 331 files）・`npm run build`（exit 0・tsc --noEmit 0）すべて成功（クリーン環境で一括再実行・reviewer 独立再実行でも全緑確認）。

## 作業計画

### 目的

診断を遊んで自分のタイプを知った来訪者に、「他のタイプも見てみたい」を満たす回遊導線を、実際に人がいる ResultCard 上に来訪者価値起点で届ける。結果としてのページ回遊・PV 増は副次効果であり、指標を目的化しない。

### 作業内容

1. **スコープ確定（分析）** — GA4/BigQuery を foreground sub-agent で取得し対象診断と現状の次アクションを実測把握。並行して ResultCard / 結果データ構造 / 静的タイプ解説ページの index 状態をコード精読し、設計選択肢を整理。
2. **設計判断** — frontend-design に沿って対象範囲・置き場所・遷移先・多タイプの見せ方を決定。
3. **実装** — ResultCard 中心に回遊導線を実装。診断差があれば sub-agent 分割。
4. **検証** — take-screenshot で変更前後（ダーク/ライト×PC/モバイル）、テスト追加、品質ゲート。
5. **レビュー** — reviewer 複数で分担、指摘対応。

### 検討した他の選択肢と判断理由

- **B-323 残スコープ（他の強診断への detailedContent 展開・P2）**: 結果体験を厚くする路線の継続で価値はあるが、cycle-247 で word-sense を仕上げた直後であり、同じレバーの反復より「読み終えた人の次の一歩」を作る方が回遊・満足の伸びしろが大きい。B-516 は撤回した宿題でもあり、来訪者価値起点でやり直す責務がある。本サイクルは B-516 に集中し、B-323 は次以降に継続。
- **B-510 系（道具箱計測の初回分析・P2）**: Deferred（着手目安 2026-06-26）で測定窓が未到達のため今サイクル不可。
- **AP集の残り整理（B-390・P3）**: 来訪者価値を直接生まない社内プロセス負債。cycle-247 で Owner から「実装コストを理由に劣る UX を選ぶな」と指摘された教訓に従い、来訪者向けレバーを優先。
- **新規ツール群（B-317/320/321 等・P2）**: 実測でツール系は流入が薄い。強コンテンツ（診断）の体験を伸ばす方が期待値が高い。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-247.md`（B-516 起票の経緯・撤回理由・ResultCard と静的ページの PV 非対称: 完了率72% vs 静的PVほぼゼロ）
- `docs/research/2026-06-15-search-traffic-priority-reassessment.md`（診断系が実測の勝者）
- コード精読（Explore 調査・本サイクル）: `src/play/quiz/_components/ResultCard.tsx`（本人向け、回遊導線の置き場所）/ `ResultPageShell.tsx`（第三者向け静的ページ・全タイプグリッド既存）/ `src/play/quiz/data/`（14診断・タイプ数: character-personality=24, animal=12 等）/ 結果ルート `src/app/(legacy)/play/[slug]/result/[resultId]/page.tsx`
- 注: 本サイクルの計画は内部 UI/UX 設計であり、外部仕様（SEO 機能・ブラウザ API・Schema.org・サードパーティ）への新規依存はない。遷移先に静的結果ページを使う場合の index 可否は既存 robots 実装（detailedContent 有無で判定）に従い、新たな外部仕様確認は不要。

## キャリーオーバー

- **9つに分散した「全タイプ回遊」実装の共通化（SSoT）**: 本サイクルで標準形式用の共有 `OtherTypesNav` を新設したが、8 variant 診断（yoji 等）の Content コンポーネントは依然それぞれ独自の全タイプセクションを持つ。将来これらを `OtherTypesNav`（または拡張版）へ寄せて単一実装化する余地がある。本サイクルは来訪者価値（word-sense parity）に集中し、リスクの大きい8コンポーネント横断リファクタは行わない方針。backlog 起票。
- variant 診断の全タイプセクションは現在タイプを Link＋`pointer-events:none` で無効化する方式、本サイクルの `OtherTypesNav` は現在タイプを非リンク span で表す方式。共通化時にこの差異の統一要否を判断する。

## 補足事項

- 本サイクルは UI 変更を伴うため、take-screenshot による変更前後の視覚確認を必須とした（cycle-247 撤回の主因が視覚確認欠如だったため）。静的結果ページの「変更前」は実装後に必要と気付いたため、take-screenshot スキルの復旧フロー（commit 前のため `git stash` で kickoff 状態を復元）で撮影した（`tmp/cycle-249/before-resultpage/`）。
- 送り先は word-sense 8タイプ全てが detailedContent 保持（cycle-247）＝index 可で、noindex の薄いページへ送る問題はない。

### 設計判断の記録

- **現在タイプを非リンク span にした**（variant 実装は Link＋CSS 無効化）: 「自分が今いる結果へのリンクは張らない」という素直なセマンティクスのため。reviewer も span 方式の方が a11y 的に素直と評価。
- **pill ではなく全幅の縦リストを採用**: word-sense のタイプ名は「柔和温順（にゅうわおんじゅん）タイプ」のように furigana 付きで長く、pill だと不揃いに折り返し「自分のタイプ」の pill が最も不格好に見えた（reviewer 視覚 M-1）。character/animal など長ラベル多タイプ診断が使う縦リストに合わせ、`word-break: keep-all`＋`overflow-wrap: anywhere` で「タイプ」の語中改行を抑制。

### レビュー記録

**reviewer 1（コード+設計）**:

- M-1（must, typecheck 赤）: 追加テストの `allTypes` 要素が必須の `description` を欠き `tsc --noEmit` が3件エラー（vitest は型を見ないため pass していた＝AP-I01）。→ `description` を補い typecheck 緑を確認。**是正済**。
- S-1/S-2（should）: 現在タイプの span 方式・CSS セレクタが先行 variant と分岐。→ 意図的判断として上記「設計判断の記録」に明記。**対応済**。
- N-1（nit）: nav ランドマーク未化。→ 共有化に際し `<nav aria-label>` 化して解消。**是正済**。N-2（aria-hidden アイコン）は良好（指摘なし）。

**reviewer 2（視覚+UX）**:

- M-1（中, モバイルで現在 pill が「タ/イプ」分断）: → pill を縦リストに変更＋keep-all で解消。**是正済**（`after/nav-mobile-light-closeup.png`）。
- M-2（中, `justify-content:center` が既存 pill と不一致）: → list 化で解消。**是正済**。
- M-3（中, 静的結果ページに回遊が無く「parity」コメントが誇大）: → 静的結果ページにも `OtherTypesNav` を追加し真の parity を成立。**是正済**（`after-resultpage/`）。
- m-1（タップ39px）: → 縦リスト行高〜44px に改善。**是正済**。m-3（ライトで背景フィル弱い）: → 現在行にタイプ色の左アクセントバーを追加し light でも識別可。**是正済**。m-2（絵文字アイコン）: 既存 quiz 横断仕様で本サイクル新規逸脱でないため対象外、ブランド整合は将来 backlog 候補。

### ブログ記事（cycle-completion 成果物）

- **記事**: `src/blog/content/2026-06-18-url-rewrite-as-demand-signal.md`「導線が無いのにURLを手で書き換えた人がいた -- 不便の回避は需要のシグナルだ」（category: ai-workflow）。blog-writer が執筆。
- **読者価値**: 「ユーザーの回避行動（URL 手書き換え等）は満たされていない需要のシグナル」「機能は人が実際にいる場所に置く」「指標（SEO）起点でなく好奇心起点で設計する」という転用可能な学びを、本サイクルの実体験（GA 実測の手動URL書き換え1件・SEO起点で取り下げた過去との対比）を題材に展開。
- **ブログレビュー（reviewer 内容レビュー・2巡）**: 初回＝承認＋指摘（中1: tag「ゲーム」が弱い→「失敗と学び」推奨／軽微2: description 長・コード例 quizSlug 変数）。対応＝tag を「失敗と学び」へ差し替え（メタデータのみ＝updated_at 据え置き）、軽微2は reviewer 許容のうえ PM 判断で据え置き。再確認＝**最終承認**（本文不変・規約遵守確認）。
- **今後の展望**: 記事に将来計画セクションは無し＝backlog 追加対象なし。

### ワークフロー・アンチパターン点検（cycle-completion 手順4）

- reviewer が `docs/anti-patterns/workflow.md` の AP-WF01〜24 を一つずつ照合。スコープ管理（word-sense に絞り→レビューで静的ページへ拡張）は健全（AP-WF09 非該当）、vitest 緑/tsc 赤事象は reviewer が捕捉・是正済みで AP-I01 として正しく分類済み（AP-WF16 違反は不成立）、完了偽装なし。
- 指摘と対応: (重大-1) 点検実行時点でブログがサイクル記録未記載・レビュー痕跡なし → 本「ブログ記事」節と上記レビュー2巡記録を追記して解消。(中-1) B-516 の Done 移動が未実施のままチェック済み → backlog で実際に Active→Done へ移動して実態と一致。(中-2) 完了率 72%/80% の窓差が未明示 → 本文と backlog で窓（80日/30日）を明示し統一。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-516 を Done セクションへ移動済み・Active は空）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（reviewer 2名とも承認・残 nit は B-517 射程）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（クリーン環境で一括再実行・全緑）。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている（B-517 起票・絵文字ブランド整合は将来 backlog 候補として記録）。
