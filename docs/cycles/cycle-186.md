---
id: 186
description: 横断検索を独立ページ `/search?q=...` 主軸で実装する（移行計画 Phase 5 / B-331）。URL シェア性・冪等性・ファーストビュー入力欄の来訪者価値を満たす唯一の構成として独立ページを採用。
started_at: "2026-05-11T15:35:46+0900"
completed_at: null
---

# サイクル-186

このサイクルでは、移行計画 Phase 5（B-331）として、横断検索体験を **独立ページ `/search?q=...` を主軸**として `(new)/` 配下に新設する。cycle-174 で確定した「① 横断検索を新デザインに作る」の実装フェーズに位置づく。独立ページ採用の根拠は、M1a yaml L16/L17/L22、M1b yaml L17（拡張解釈）/L19/L22/L23、S1/S2/S3 の検索結果 URL シェア性（yaml 直接引用ではなく constitution Goal 接続）、constitution Goal「higher page views」の各観点を、案 I / II / III / IV の 4 案比較で批判的に検証した結果である。ヘッダーの検索アイコン（PC・モバイル）と Cmd+K / Ctrl+K は (new) Route Group 配下では `/search` への遷移トリガーとして機能させ、(legacy) Route Group 配下では本サイクル前と完全に同一の挙動（モーダル開閉）を維持する（M1b yaml L20 likes 優先、L16 / L24 は移行期間中暫定的に整合性を欠く / Phase 10.2 で再充足、§Cmd+K の挙動設計 4 案比較）。ロジック層（`useSearch` / `highlightMatches`）を `src/lib/search/` 共有層に集約する（cycle-174 M-γ 整合）。B-340 計測関数はモーダル前提の命名から独立ページ前提の命名へ cycle-174 タスク 7 の責務継承として整理する。(legacy) の旧 SearchModal/SearchTrigger は Phase 10.2 まで据え置き、本サイクルでは regression ゼロを担保する。cycle-completion で再判断トリガー 1（cycle-174 L305-314）の観測タスクと、A-13 を根拠とした既存ドキュメント整合タスク（cycle-174.md / design-migration-plan.md の A-13 記述追記、cycle-174 ① 採用結論再点検は本サイクル内 PM 確定済みのため別サイクル起票は不要）を backlog に起票する PM 起票責務、cycle-174.md L30 改訂責務、`/search` ルート永続契約の明文化責務も果たす。

## 実施する作業

- [x] /cycle-planning で詳細計画を立案する（実装方針判断・コンポーネント設計・ランキングロジック設計・(legacy) 共存設計・段取り）
- [x] 計画レビューを受け、指摘を反映する（r1〜r4、Critical 6 件・重要 10 件・改善 9 件を全件反映して reviewer 承認獲得）
- [ ] /cycle-execution で実装する
- [ ] 実装レビューを受け、指摘を解消する
- [ ] /cycle-completion で完了処理する

> 上記は親タスクの骨格のみ。実装サブタスクは /cycle-planning フェーズで分解する。

## 作業計画

### 前提となる事実確認（ファクトチェック結果）

本計画立案にあたり、PM が WebFetch で以下の一次情報を確認した。reviewer もこの事実関係から逸脱した記述が本計画書に残存していないか厳しく検証してほしい。

- **Google sitelinks search box は 2024-11-21 に正式廃止**。一次資料: https://developers.google.com/search/blog/2024/10/sitelinks-search-box （2024-10-21 廃止告知、2024-11-21 正式廃止）。
- 結果として、`WebSite.potentialAction.SearchAction` の構造化データを記述しても、現時点（2026-05-11）で Google 検索結果にサイト内検索ボックスは表示されない。
- cycle-174.md L268 で「メリット 6（A-13）は独立ページ実装が前提の条件付き便益」と記述されているが、この便益は本サイクル時点で **実在しない**。
- 本計画では A-13 を独立ページ採用の根拠に **一切使用しない**。
- cycle-174 A-13 評価の事実無効化を受けて、cycle-174 ① 採用の判断が A-13 を除いても成立することを本計画書 §案 IV で PM 確定として再確認する。重要-1 対応として、別サイクルでの「① 採用結論再点検」backlog 起票は **行わず**、代わりに A-13 を根拠とした既存ドキュメントの整合タスクを backlog 起票する（§12 参照）。

### 目的

#### 何を成立させるか（来訪者全層への価値）

Phase 5（B-331）として、`(new)/` 配下に **独立した検索ページ `/search?q=...` を主軸とする横断検索体験** を成立させる。(new) Route Group 配下では、ヘッダーの検索アイコン（PC・モバイル両方）と Cmd+K / Ctrl+K キーバインドは `/search` への遷移トリガーとして機能する。(legacy) Route Group 配下では、本サイクル前と完全に同一の挙動（モーダル開閉）を維持する。これは M1b yaml L20 likes「仕様変更があっても、これまでの使い方が壊されないこと」を Phase 5 着手時点で守るための判断であり、その代償として M1b yaml L16（サイト内一貫性）と L24（以前と同じ入力で同じ挙動）は Phase 5 〜 Phase 10.2 の移行期間中に暫定的に整合性を欠く（Phase 10.2 で (legacy) 全廃により再充足）。詳細は §検討した他の選択肢「Cmd+K の挙動設計 4 案比較」参照（Critical-3 対応）。

本サイクルは cycle-174.md L258「判断結果: ① 新デザインに横断検索を作る」の **実装フェーズ** であり、二択判断そのものは再検討しない（再検討は cycle-174 §再判断トリガー 1 の Phase 5 公開後の利用観測後の別サイクルが担う）。A-13 の取り扱いは §前提となる事実確認 / §案 IV / §12 に集約する（改善-1 対応）。

#### constitution Goal との接続

「higher page views by providing the best value for visitors」（constitution.md Goal）との接続: (1) 検索結果ページ自体が URL を持ち、来訪者間でシェアでき、検索結果ページ自体が独立した page view 対象となる。(2) 検索結果ページからのコンテンツクリックという 1 階層の page view がサイト内に新規発生し、サイト内回遊が深まる。(3) 外部チャネル（Slack / X / メール）に `/search?q=...` URL を貼れることで外部流入経路が新規に成立する。

#### 来訪者全層への価値（各ターゲット yaml の likes / dislikes 直接引用ベース）

本セクションは各ターゲット yaml に **実在する** 記述のみを引用する。yaml に存在しない記述（例: M1b の「慣れた操作手順が突然変わる」）は使用しない（厳禁事項）。

- **M1a（特定の作業に使えるツールをさっと探している人、`docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）**:
  - likes「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」（yaml L16）→ `/search` を開いた瞬間にファーストビュー先頭に検索入力欄が配置され、初期フォーカスが自動で当たる構造で **直接満たされる**。モーダル UI では「開く」アクション（アイコンクリックまたは Cmd+K）が 1 段挟まり、likes の文言の「ページを開いた瞬間に入力欄が見えて」を構造的に満たせない。
  - likes「コピペで結果を受け取って、すぐ元の作業画面に戻れること」（yaml L17）→ 検索結果カードから直接ツールページに遷移し、ブラウザの戻るで `/search` に復帰できる URL ベース動線で整合。
  - likes「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」（yaml L18）→ `/search` 空状態は入力欄のみの静かな画面設計とする（「最近検索された語」等の運営側演出を入れない）。
  - dislikes「開いた瞬間に広告やポップアップで目的の入力欄が埋もれていること」（yaml L22）→ 独立ページ構造ではポップアップ的に他コンテンツの上に被さって入力欄を埋もれさせる構造が **発生しない**。
  - dislikes「似たようなツールが並んでいて、どれを使えばよいか迷わせること」（yaml L25）→ 8 種 ContentType をグループ化し、各結果に description / 種別ラベルを併記して判断材料を提供する設計で緩和。

- **M1b（気に入った道具を繰り返し使っている人、`docs/targets/気に入った道具を繰り返し使っている人.yaml`）**:
  - likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」（yaml L16）→ 検索の入口を (new) では 1 つ（独立ページ）に統一する。案 III（両立）を排除する根拠。なお Cmd+K の Route Group 別挙動はこの likes と Phase 5 〜 Phase 10.2 の移行期間中暫定的に整合性を欠く（§検討した他の選択肢「Cmd+K の挙動設計 4 案比較」で正直に列挙、Phase 10.2 で再充足）。
  - likes「ブックマークしたURLを開けばすぐ目的のツールが表示されること」（yaml L17）→ **L17 の本来の対象はツール URL** であるため、L17 を主根拠にする場合は **拡張解釈**（重要-2 対応）であることを明示する。すなわち L17 の本来の意図（目的のツール URL をブックマークすれば直行できること）に加え、L17 の精神「URL ベースで直接目的に到達する」の拡張として `/search?q=日付` のような検索クエリ URL もブックマーク可能にする。M1b の `search_intents = []`（yaml L25、主動線はブックマーク・履歴・直接 URL 入力）に対し、「名前を思い出せない道具」場面でクエリをブックマークしておく動線が新規に成立する。L17 を厳密適用する場合の補完論拠として「URL ベース直行性」を後述の `?q=` 永続契約と冪等性で別途支える。
    - **両者の意味的差異の明示（重要-4 対応）**: ツール URL のブックマーク（L17 本来の意図、目的のツールに直接到達）と `/search?q=foo` のブックマーク（拡張解釈）には、**後者の方が結果カードクリックの 1 階層が挟まる** という意味的差異がある。後者は「名前を思い出せない / クエリでツールを再発見したい」場面で固有便益を持ち、L17 と機能的に補完関係にある（前者の代替ではなく追加経路）。両者を同列に扱うのは PM 解釈であり、L17 を厳密適用する場合は前者のみが L17 充足、後者は M1b の `search_intents = []` を補完する独立便益と位置づける。本計画書では後者の便益を L17 拡張解釈として記述しているが、これは厳密適用上 L17 充足ではなく独立便益である点を読み手が判別できるように明示する。
  - likes「同じ入力に対して前回と同じ結果が返ってくること」（yaml L19）→ クエリ URL の冪等性（同じ `?q=` を異なるセッションで開いても同じ結果順序）を完成基準に含める。モーダルの揮発的状態では満たせない。
  - likes「仕様変更があっても、これまでの使い方が壊されないこと」（yaml L20）→ (legacy) Route Group 配下では Cmd+K の挙動を本サイクル前と完全に同一に維持し、既存来訪者の操作習慣を壊さない（Critical-3 対応）。代償として L16 / L24 が移行期間中暫定的に整合性を欠く点は §検討した他の選択肢「Cmd+K の挙動設計 4 案比較」で正直に列挙。
  - dislikes「動作が遅いツール」（yaml L22）→ `/search` の初回ロード時間・`/search-index.json` の fetch・リアルタイム検索の debounce・Fuse.js 初期化のいずれもが体感速度に抵触しないことを完成基準で担保する（重要-1 対応、後述「完成基準」参照）。
  - dislikes「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」（yaml L23）→ `/search` ルートを **永続契約** として確立し、`?q=` パラメータ仕様（URL エンコード、空文字は空状態）も将来互換を確保する責務を本サイクルで負う（重要-2 対応、後述「作業内容」参照）。
  - dislikes「以前と同じ入力なのに結果や挙動が前回と変わっていること」（yaml L24）→ ランキング設計を `src/lib/search/` 共有層に集約し、Phase 10.2 で旧 view 撤去後もロジック層は据え置きで継続することにより、入力 → 結果の決定論性を Phase 跨ぎで担保（M-γ）。(legacy) 配下の Cmd+K 挙動も据え置く。
  - **不引用宣言**: 「慣れた操作手順が突然変わる」は M1b yaml に存在しない。本計画では使用しない。

- **S1 / S2 / S3 共通: 検索結果 URL のシェア性（constitution Goal 根拠、重要-2 対応）**:
  - **yaml 直接引用上の注記**: S1（AIエージェントやオーケストレーションに興味があるエンジニア）・S2（Webサイト製作を学びたいエンジニア）・S3（AIの日記を読み物として楽しむ人）の各 yaml の likes / dislikes には「シェア」「URL 共有」を直接示す記述は **存在しない**。よって本観点は yaml 直接引用ではなく、**constitution.md Goal「higher page views by providing the best value for visitors」への接続のみ** を根拠とする独立ページ固有便益として位置づける。
  - **Goal への接続**: 検索クエリ URL（`/search?q=Claude` 等）を Slack / X / メールに貼れることで、サイト内コンテンツへの誘導動線が外部チャネルから到達可能になる。外部流入経路の新規成立は constitution Goal「higher page views」と直接整合する。これは独立ページ構成でのみ成立する固有価値（モーダル状態は URL に乗らないため案 II では実現不可能）。
  - **結果カードの内容予測（S1 / S2 / S3 共通の補助観点）**: 結果カードに description / 種別ラベル / ハイライト一致箇所を表示することで、開く前から内容予測ができる。これも S1/S2/S3 yaml 直接引用ではないが、初見遭遇層が「自分の探しているものか」を判定する助けとなる構造であり constitution Goal と整合する。

#### 範囲外（明示）

- 旧 `src/components/search/` の Search\*.tsx 撤去・改変は **対象外**（Phase 10.2 で legacy 全体と同時に削除する据え置き原則。design-migration-plan.md L144）。ロジック層のみ `src/lib/search/` への移動を伴う import path 更新を行う。
- `(legacy)/` Header / SearchTrigger 経路の挙動変更は **対象外**（旧 UI と Cmd+K 挙動は本サイクル前と完全に同じ動作で残る）。
- 検索ロジックのランキング重み・Fuse.js オプションのチューニングは対象外（M-γ 整合のため挙動は不変）。
- フィードバック窓口の整備（cycle-174 再判断トリガー 2）は別 backlog。

#### 再判断トリガー 1 の観測責務

cycle-174 §再判断トリガー設計（L305-314）が定める「Phase 5 公開後の利用観測」の観測手段が B-340 計測関数。本サイクルでは新 UI（独立ページと検索体験全体）に計測関数を接続して観測経路を確保し、cycle-completion 時に「Phase 5 公開後 N 日経過時点で結果クリック率 / abandon 率を評価する」タスクを backlog に起票する（cycle-174 タスク 11、PM 起票責務）。

ここで「結果クリック率の正確な計測」は M-γ「新旧で同じ振る舞い」の観測経路として必須であり、B-340 計測のリネームは cycle-174 タスク 7（B-340 関数を新 components 側に接続し、Phase 10.2 後も analytics 関数を残す責務）の継承として位置づける（重要-4 対応）。

### 検討した他の選択肢と判断理由

cycle-174 で「実装方針判断はモーダル維持 / 独立ページ化 / 両立のいずれかを Phase 5 で決める」と申し送られている（cycle-174.md L279）。AP-P17（3 案以上の列挙比較）に従い、ゼロベースで以下 4 案を列挙し、各ターゲット yaml の likes/dislikes 直接引用と constitution Goal のみで論証する。実装コスト・ファイル数・現状維持しやすさ・既存資産流用可否・A-13（廃止済みの sitelinks searchbox 便益）は判断材料から **完全に除外** する。

#### 案 I: 独立ページ `/search?q=...` 主軸（**採用**）

- **構成**: `/search` ルートを `(new)/` 配下に新設。`(new)` ヘッダー検索アイコン（PC・モバイル）と (new) 配下での Cmd+K / Ctrl+K は `/search` への遷移トリガー。(legacy) 配下の Cmd+K は本サイクル前と完全に同一の挙動（モーダル開閉）を維持。`?q=` 未指定時は空状態（入力欄のみ）、指定時は結果表示。入力に応じて URL を更新（typing 中は debounce 後に history を置換、Enter で確定 push、ブラウザ戻る/進むに追従）。
- **M1a yaml L16 likes 適合**: 独立ページのファーストビュー先頭に入力欄が配置され、初期フォーカスが自動で当たる構造で likes「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」を **構造的に直接満たす**。
- **M1a yaml L17 likes 適合**: 結果カードから直接ツールページに遷移し、ブラウザ戻るで `/search` に復帰できる URL ベース動線で likes「コピペで結果を受け取って、すぐ元の作業画面に戻れること」と整合。
- **M1a yaml L22 dislikes 回避**: 独立ページ構造でポップアップ的に他コンテンツが入力欄に被さる構造が発生しない。
- **M1b yaml L17 likes 適合（拡張解釈、重要-2 対応 / 重要-4 対応）**: L17 の本来の対象はツール URL であるが、L17 の精神「URL ベースで直接目的に到達すること」の **拡張として** `/search?q=日付` のような検索クエリ URL もブックマーク可能にすることで likes「ブックマークしたURLを開けばすぐ目的のツールが表示されること」と整合する。L17 を厳密適用する場合の補完論拠として、後述の `?q=` 永続契約と L19 likes（同じ入力で同じ結果順序）による「URL ベース直行性」が別途支える。**意味的差異の明示（重要-4 対応）**: ツール URL ブックマーク（L17 本来の意図）と `/search?q=foo` ブックマーク（拡張解釈）には、後者の方が結果カードクリックの 1 階層が挟まる意味的差異がある。後者は「名前を思い出せない / クエリでツールを再発見したい」場面で固有便益を持ち、L17 と機能的に補完関係にある（前者の代替ではなく追加経路）。L17 を厳密適用する場合、前者のみが L17 充足、後者は M1b `search_intents = []` を補完する独立便益と位置づけられる。案 I の評価では両者を `?q=` URL シェア性とブックマーク便益の双方として記述するが、これは PM 解釈による同列扱いであり、厳密適用上の便益区分は前段で明示した通りである。
- **M1b yaml L19 likes 適合**: クエリ URL の冪等性（同じ `?q=` で同じ結果順序）を完成基準で担保することで likes「同じ入力に対して前回と同じ結果が返ってくること」を満たす。
- **M1b yaml L20 likes 適合**: (legacy) Route Group では Cmd+K 挙動を据え置くことで likes「仕様変更があっても、これまでの使い方が壊されないこと」と整合。
- **M1b yaml L23 dislikes 回避**: `/search` ルートを永続契約として確立し、`?q=` 仕様を将来互換を確保することで dislikes「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」を予防。
- **S1 / S2 / S3 検索結果 URL のシェア性（constitution Goal 根拠、重要-2 対応）**: S1/S2/S3 yaml には「シェア」「URL 共有」を直接示す likes / dislikes は存在しないため、本観点は yaml 直接引用ではなく constitution Goal「higher page views」への接続として位置づける。`/search?q=Claude` 等を外部チャネルに貼れることで外部流入経路が新規に成立し Goal と整合する独立ページ固有便益。
- **constitution Goal**: 検索結果ページ自体が独立 page view 対象となり、結果クリックで 1 階層の page view が新規発生。外部流入経路が新規に成立し「higher page views」と直接整合。

#### 案 II: モーダル維持

- **M1a yaml L16 likes 不適合**: モーダルを開くアクション（クリックまたは Cmd+K）が 1 段挟まり「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」を **満たせない**。
- **M1b yaml L17 likes 不適合**: モーダル状態は URL に乗らないため、検索クエリ単位のブックマーク・履歴・直接 URL 入力が **全て成立しない**。likes「ブックマークしたURLを開けばすぐ目的のツールが表示されること」を満たせない。
- **M1b yaml L19 likes 不適合**: モーダルの揮発的状態では冪等性（同じ `?q=` で同じ結果順序）を URL 形態で外部公開できない。
- **S1 / S2 / S3 検索結果 URL のシェア性（constitution Goal 根拠、重要-2 対応）**: yaml 直接引用ではないが、検索結果 URL のシェアが構造的に不可能であるため Goal「higher page views」への外部流入経路新設が成立しない。
- **constitution Goal**: 検索結果ページが独立 page view にならず、外部流入経路も成立しない。
- **判断**: M1a L16 / M1b L17（拡張解釈含む）/ M1b L19 を構造的に満たせず、来訪者最高基準に到達できない。**不採用**。

#### 案 III: 両立（モーダル + 独立ページ）

- **M1a yaml L18 likes 不適合**: 検索の入口が 2 つ（モーダル / ページ）存在することで「どっちで検索すべきか」を毎回判断する必要が生まれ、likes「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」と矛盾する。
- **M1b yaml L16 likes 不適合**: 同じ「検索」アクションに対し 2 種類の UI が (new) 内に混在し、likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」と矛盾。
- **判断**: 案 I を上回る来訪者価値が無く、M1a L18 / M1b L16 likes に逆行する。**不採用**。

#### 案 IV: ② への転換（横断検索を新デザインから撤去）

- cycle-174.md L258 で **二択の設計判断として ① が確定済み**。本サイクル B-331 は ① の実装フェーズであり、二択判断そのものを覆すスコープを持たない（cycle-174 §再判断トリガー 1 は Phase 5 公開後の利用観測に基づく再判断であり、Phase 5 着手前の planner が転換できる条件ではない）。
- **A-13 削除後の ① 採用維持（改善-1 対応、§前提となる事実確認 と整合）**: cycle-174 ① 採用根拠は A-1〜A-14 の中位メリット総和（cycle-174.md L262-275）。A-13（SearchAction による sitelinks searchbox SEO 便益）が本サイクル時点で実在しないが、残る A-1〜A-12 / A-14 は yaml の likes / dislikes と整合した実在便益として残存している。A-13 を除いても ① 採用結論は **本サイクル内 PM 確定として** 据え置く（別サイクルでの再点検 backlog 起票は不要、§12 参照）。よって案 IV 棄却ロジックは A-13 削除後も維持される。
- **判断**: 責務範囲外につき不採用。

#### Cmd+K の挙動設計 4 案比較（Critical-3 対応）

(new) と (legacy) が Phase 5 〜 Phase 10.2 の間並存することにより、Cmd+K の挙動設計は M1b yaml L16（サイト内一貫性）・L20（既存使い方の保護）・L24（前回入力 → 前回挙動の維持）の 3 観点が **同時には満たし得ない** トレードオフ構造を持つ。AP-P17 に従い 4 案を列挙し、いずれも来訪者価値根拠のみで比較する。

- **案 (α)**: (legacy) は据え置き、(new) では Cmd+K = `/search` 遷移（**採用**、本計画書 §3 ヘッダー入口設計に記述）。
  - **M1b yaml L20 likes**: (legacy) 配下のヘビーユーザーが本サイクル前と同じキーバインドで同じ挙動（モーダル開閉）を得るため、likes「仕様変更があっても、これまでの使い方が壊されないこと」を満たす。
  - **M1b yaml L16 likes**: Phase 5 〜 Phase 10.2 の移行期間中、Route Group をまたぐと Cmd+K 挙動が異なるため likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」を **移行期間中暫定的に欠く**。Phase 10.2 で (legacy) 全廃により再充足される構造。
  - **M1b yaml L24 dislikes**: 同一来訪者が (legacy) → (new) → (legacy) と回遊した場合、Cmd+K の押下に対する応答が Route Group ごとに異なるため、移行期間中は dislikes「以前と同じ入力なのに結果や挙動が前回と変わっていること」と **暫定的に整合性を欠く**。Phase 10.2 で (legacy) 全廃により消滅。
- **案 (β)**: 全 Route Group で Cmd+K = `/search` 遷移に統一（(legacy) も挙動変更）。
  - **M1b yaml L16 / L24**: 整合（サイト内で Cmd+K 挙動が一貫）。
  - **M1b yaml L20 likes 違反**: (legacy) 配下のヘビーユーザーにとって Cmd+K の挙動が本サイクルで突然変わり、likes「仕様変更があっても、これまでの使い方が壊されないこと」に **明確に違反**。ヘビーユーザー（M1b）こそが本サイトのリピーターで Cmd+K を最も多用する層であるため、影響度が大きい。
- **案 (γ)**: Cmd+K を Phase 5 では (new) のみ実装、(legacy) では Cmd+K を **無効化**。
  - **M1b yaml L20 likes 違反**: (legacy) 配下で Cmd+K が「無反応」になり、本サイクル前と挙動が変わる。L20 違反かつ反応自体を失う点で案 (β) より厳しい。
  - **M1b yaml L16**: (legacy) で Cmd+K が無効、(new) で Cmd+K が遷移という差異が残るため移行期間中の一貫性は案 (α) と同じく欠く。
- **案 (δ)**: Phase 5 〜 Phase 10.2 を「移行期間」として明示し、移行期間中の Cmd+K 挙動は (legacy)/(new) で異なることを正直に明記。Phase 10.2 で (legacy) 全廃時に Cmd+K 完全統一。
  - これは案 (α) と実質同じ実装だが、「移行期間の限定性」を明示することで M1b L16 / L24 の暫定違反を **限定された期間と認識の上で受け入れる** 立場。

**採用判断（案 (α) = 案 (δ) と等価、PM 確定）**: M1b L20 likes「これまでの使い方が壊されない」を **Phase 5 着手時点で守る** ことを最優先とする。理由は yaml 直接引用根拠で以下:

- M1b の dislikes L24 は「以前と同じ入力なのに結果や挙動が前回と変わっていること」と書かれており、Cmd+K の挙動変更はこれに該当する。M1b の L20 likes「仕様変更があっても、これまでの使い方が壊されないこと」も同様に Cmd+K 挙動の保護を要求する。L16 likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」は移行期間中暫定的に欠くが、Phase 10.2 で再充足される時間限定の不整合である。
- Cmd+K を最頻使用するのは M1b（リピーター）であり、これを Phase 5 着手の瞬間に変更する案 (β)(γ) は「最頻使用層に対する突然の挙動変更」となり、L20 違反の影響範囲が大きい。
- 移行期間が確定的に Phase 10.2 で終わることが design-migration-plan.md で計画されているため、L16 / L24 の暫定違反は時間限定で許容される（運営側都合の許容ではなく、移行プロセスの構造的必然）。

ただし採用後の正直な明記責務として、案 (α) は M1b yaml L16 / L24 を移行期間中暫定的に欠くことを §3 ヘッダー入口設計内に明示する（既出）。

#### `/search` の noindex 方針 4 案比較（Critical-2 対応）

`/search` を Google にインデックスさせるかは「Google 経由で `/search?q=foo` を発見する来訪者の発生可能性」と「無限クエリページ群がインデックスされてサイト全体の検索品質を下落させるリスク」のトレードオフ構造を持つ。AP-P17 に従い 4 案を列挙する。

- **案 (a)**: noindex, follow（**採用**）。
- **案 (b)**: `?q=` 有りページのみ index、空状態（`?q=` 無し）は noindex。
- **案 (c)**: 全 index（無制限）。
- **案 (d)**: noindex で `follow` も付けない（リンク被リンク伝播も止める）。

**各案の来訪者価値評価**:

- **来訪者発見経路（プラス側面）**: 案 (b)(c) は Google で「文字数カウント」「Claude Code 使い方」等を検索した来訪者が `yolos.net/search?q=...` を結果ページとして発見し得る。M1a search_intents（yaml L27-34）「文字数カウント」「日付計算」等や S1 search_intents（yaml L27-31）「Claude Code 使い方」等の具体クエリで、yolos.net のツールページや記事ページ自身がインデックスされた結果ページとの競合になる。`/search?q=...` を経由する経路と、コンテンツページに直接到達する経路では **来訪者の用事の満たされやすさが異なる**: 後者は 1 クリックで用事を果たすが、前者は `/search` で結果カードを選ぶ 1 階層が挟まる。M1a yaml L17 likes「コピペで結果を受け取って、すぐ元の作業画面に戻れること」「すぐ使い始められること（L16）」の観点では **コンテンツページ直接到達の方が来訪者価値が高い**。
- **サイト全体の検索品質（マイナス側面）**: 案 (b)(c) はクエリ無限空間（任意の `?q=` 値）がインデックス対象になり得、Google が低品質ページ群と判定してサイト全体の検索評価が下落するリスクがある。これは constitution Goal「higher page views by providing the best value for visitors」に逆行する。
- **リンク伝播（中立側面）**: 案 (a) は `follow` を付与してリンク伝播は維持。案 (d) はこれも切るためサイト内 SEO 構造にマイナス。

**採用判断（案 (a) = noindex, follow、PM 確定）**:

- 案 (b)(c) の「Google 経由で `/search?q=...` を発見する来訪者」マイナス側面は実在するが、**PM 判断として** `/search` の位置づけを「サイト内回遊の補助 UI」とする。この位置づけは M1a yaml L16「すぐ使い始められること」/ L17「コピペで結果を受け取って」likes の **直接引用ではなく、likes からの推論**（PM 解釈）であり、サイト外検索結果として `/search?q=foo` を経由する 1 階層挟みより、ツールページに直接到達する方が M1a likes と整合するという PM の解釈に基づく。すなわち本判断は yaml 直接引用と同等のトーンで断定するのではなく、M1a L16 / L17 likes から導出した推論として位置づけ、PM 解釈であることを明示する（重要-2 対応、yaml 拡大解釈 = Owner 厳命 5 への配慮）。
- 案 (b) は「`?q=` 有りのみ index」だが、これも結局クエリ空間が無限であり、案 (c) の検索品質下落リスクを同程度に抱える。
- 案 (d) はリンク伝播も止めることで `/search` ページ上の内部リンクのクローラ追跡が損なわれ、サイト内 SEO 構造にマイナス。案 (a) と比較して来訪者価値の上振れがない。
- 案 (a) は `/search` をインデックスしない一方 `follow` を維持することで、サイト内コンテンツ発見経路への副作用なく、サイト全体の検索品質下落リスクのみを回避する。
- 構造化データ `WebSite.potentialAction.SearchAction` は本サイクル不採用のため（§4）、SearchAction の target 要件と noindex の整合性論点も消滅する（Critical-3 副次効果）。

**正直に列挙する本案のマイナス側面**: Google で具体クエリ（例: 「日付計算 yolos」のような site 修飾検索）を行った来訪者にとって、`/search?q=日付` の `<title>`「『日付』の検索結果 | yolos.net」が結果として表示される可能性は **失われる**。代替経路として個別ツールページ（`/tools/date-calc` 等）が直接インデックスされているためこの来訪者の用事は別経路で満たされるが、`/search` URL ベース動線の発見可能性は外部検索エンジン経由では失われる。本サイクルは内部回遊・URL シェア（直接共有）・ブックマーク経路に `/search` の価値を限定する判断とする。

#### 配置先と命名: `src/components/Search*/` PascalCase ディレクトリ

新 view は PascalCase ディレクトリ（例: `SearchPage` / `SearchInput` / `SearchResults` 等。具体的なファイル分割は execution で確定）で新規実装。旧 `src/components/search/`（lowercase）と命名衝突せず並存し、Phase 10.2 で旧 view 撤去後も新側はリネーム不要。

#### ロジック共有方法: `src/lib/search/` 集約

`src/components/search/useSearch.ts` / `highlightMatches.tsx` を `src/lib/search/` に移動し、旧 view / 新 view の双方から共有 import する。M-γ（新旧で同じ振る舞い、cycle-174.md L280）を満たし、Phase 10.2 で旧 view 撤去後もロジック層は据え置きで継続する（cycle-174 タスク 7）。

#### `(new)/layout.tsx` の Server Component 維持

`(new)/layout.tsx` は metadata export を持つ Server Component。独立ページ採用ではモーダル状態管理が不要となり `/search` ページ内部に閉じるため、cycle-185 で議論された SearchProvider wrapper パターンは **不要** になる。layout は metadata export / JSON-LD 配信に専念し、ヘッダーの検索アイコン → `/search` 遷移は通常の `<Link href="/search">` か `useRouter().push("/search")` で実現する。

### 作業内容（基本設計レベル）

実装の細部は execution が決めるため、本セクションは設計契約と判断条件を記述する。

#### 1. ルート `/search` の新設

- パス: `(new)` Route Group 配下に `/search` ページを新設。
- ファーストビュー: 入力欄 + プレースホルダ。`?q=` 未指定時は空状態、指定時は結果領域も描画。
- Server Component / Client Component の境界: 入力欄を含む検索体験部分は Client（URL params 駆動の入力状態とリアルタイム検索のため）。metadata は静的 export または `generateMetadata` で `?q=` を反映したタイトル（"「○○」の検索結果 | yolos.net" 形式）を動的生成。
- ページタイトル動的更新: `?q=` 変更時にブラウザタブのタイトルも追従（URL シェア時の見え方を担保）。
- robots: `/search` は **noindex, follow** を採用する（Critical-2 対応）。「来訪者価値中立」断定は撤回し、両側面（Google 経由で `/search?q=foo` を発見する来訪者を逃すマイナス vs サイト全体の検索品質下落リスク予防のプラス）を §検討した他の選択肢「noindex 方針 4 案比較」で正直に列挙した上で本案を PM 確定とする。`follow` を付与することにより、`/search` 上のリンクをクローラがたどる経路は維持し、サイト内コンテンツへのリンク伝播を損なわない。
- `?q=` 未指定でも 200 を返し、入力欄を表示する空状態を提示（404 にしない）。

#### 2. URL パラメータ `?q=` の永続契約（重要-2 対応）

- `q` は string、URL エンコード済み。空文字は「クエリ未入力扱い」（空状態を表示）。
- 入力中: ユーザーがタイプするたびに debounce（例: 200-300ms）後に history.replaceState で URL を更新（戻る履歴を汚さない）。
- Enter / 検索ボタン押下: history.pushState で確定。戻る/進むキーで履歴を行き来できる。
- ブラウザ戻る/進む: `popstate` でクエリと結果状態を復元。
- ページ離脱時の最後の状態が URL に残っていることを担保（M1b yaml L17 likes 担保）。
- **永続契約の明文化責務**: `/search` ルートと `?q=` パラメータ仕様（URL エンコード、空文字は空状態、`?q=` のみが公開クエリパラメータ）を将来互換契約として `docs/design-migration-plan.md` Phase 5 セクションと `docs/backlog.md` B-331 Notes に明記する execution タスクを追加する。これにより M1b yaml L23 dislikes「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」を Phase 10.2 以降も予防する。

#### 3. ヘッダーの入口設計 / Cmd+K の Route Group 別挙動（重要-3 対応）

- (new) PC ヘッダー: 検索アイコン（Lucide `Search`）を actions スロットに配置。クリックで `/search` へ遷移。
- (new) モバイルヘッダー: 同様に検索アイコン 1 枠を確保（cycle-174 B-7 評価通り 44px 以上）。
- **(new) 配下での Cmd+K / Ctrl+K**: keydown リスナーで押下時に `/search` へ遷移（既に `/search` 上にいるときは入力欄にフォーカスを当て直す）。
- **(legacy) 配下での Cmd+K / Ctrl+K**: 本サイクル前と **完全に同一の挙動を維持**（モーダル開閉）。Route Group の判定で挙動を分岐する設計判断を本計画段階で確定する（execution に委ねない）。
- **本案の整合性と限界（重要-3 対応、Critical-3 対応）**: Cmd+K の Route Group 別挙動は M1b yaml L20 likes「仕様変更があっても、これまでの使い方が壊されないこと」を充足する一方で、M1b yaml L16 likes「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」および M1b yaml L24 dislikes「以前と同じ入力なのに結果や挙動が前回と変わっていること」とは、Phase 5 〜 Phase 10.2 の移行期間中に限り **整合性を一時的に欠く**。Phase 10.2 で (legacy) 全廃により Cmd+K 挙動が完全に統一されることで L16 / L24 が再充足される構造である。各観点（L16 / L20 / L24）への影響と本案採用の論証は §検討した他の選択肢「Cmd+K の挙動設計 4 案比較」に集約する。
- **Route Group 跨ぎ実害の測定可能化（重要-1 対応、AP-P02 徹底）**: 案 (α) は M1b L16 / L24 への暫定違反を抱える以上、当該違反が実害として顕在化しているかを **観測可能な経路で把握する** 責務を負う。本サイクルは以下 3 点を確保することで AP-P02「戦略を否定するデータを積極的に探す」を徹底する:
  1. **Playwright での実体確認手順**: cycle-execution 段階で「(legacy) ページ → (new) ページ → (legacy) ページ」と回遊するシナリオを Playwright で実行し、各遷移後に Cmd+K を押下したときの挙動（(legacy) ではモーダル開閉 / (new) では `/search` 遷移）が Route Group ごとに異なることを **挙動ログで明示的に記録する**。これにより、「移行期間中に挙動差異が現実に発生していること」を計画上の主張から実体ベースの観測事実へ昇格させる。
  2. **B-340 計測の観測項目への追加**: §12 の cycle-completion 観測 backlog に「Route Group 跨ぎ来訪者の Cmd+K 操作後の遷移ログ」（具体的には (legacy) 直前ページから Cmd+K 経由でモーダルを開いた来訪者数と、(new) 直前ページから Cmd+K 経由で `/search` に遷移した来訪者数、および両 Route Group を同セッション内で経由した来訪者の発生頻度）を観測項目として追加する。これによって挙動差異の影響範囲（影響を受ける来訪者の割合）を実測できる。
  3. **案 (β) への切替再判断条件の明文化**: Phase 5 公開後 N 日経過時点で、Route Group 跨ぎ来訪者の abandon 率上昇（`/search` 到達直後の即離脱 / Cmd+K 押下直後の操作放棄）が cycle-174 §再判断トリガー 1 の閾値水準で観測された場合、案 (β)（全 Route Group で Cmd+K = `/search` に統一）への切替を再判断する条件として明記する。N と閾値水準の具体値は cycle-174 再判断トリガー 1 の観測 backlog（§再判断トリガー 1 の観測責務、cycle-174 タスク 11）と統合して PM が cycle-completion 時に確定する。
- ヘッダーのプロップ設計（重要-3 対応）: (new) Header と (legacy) Header のプロップは独立に設計する。既存実装の有無は判断材料に **含めない**（Owner 厳命 2 = 現状起点排除）。共有実装の有無・命名は execution が来訪者最高基準から判断する。

#### 4. SearchAction JSON-LD の取り扱い（sitelinks searchbox 廃止対応、前掲 §前提となる事実確認）

- **不採用**。Google sitelinks search box は 2024-11-21 に正式廃止されており（前掲「前提となる事実確認」セクション参照）、`WebSite.potentialAction.SearchAction` の構造化データは現時点で来訪者に何の便益も生まない。
- 来訪者価値が **ゼロ** であるため、本サイクルでは SearchAction JSON-LD の追加を **行わない**。
- 副次効果として、SearchAction の `target` 要件と `/search` の noindex の整合性論点も消滅する（§検討した他の選択肢「`/search` の noindex 方針 4 案比較」末尾参照）。
- 将来 Google または他の検索エンジンが類似機能を復活させた場合は別サイクルで再判断する。本サイクルで `/search?q=...` ルートを **永続契約として確立**（§2）しているため、SearchAction の `target` URL 構造（`/search?q={search_term_string}`）は将来仕様復活時に **追加実装のみで対応可能** であり、ルート構造の再設計は不要である。事前予測不可能な仕様復活に対する backlog 起票は不要だが、ルート構造の互換性確保により **即応性は担保されている**（重要-5 対応、誤解防止: 仕様復活時にゼロから再設計が必要というわけではない）。

#### 5. 検索ページの内部設計（境界事例の設計契約含む、改善-3 対応）

- 検索入力: 入力欄 1 つ、44px 以上のタッチターゲット、初期フォーカス自動付与。
- リアルタイム検索 vs Enter 確定: **リアルタイム検索を採用**（debounce 値は §動作が遅いツール抵触回避基準で示した通り execution が実測根拠付きで確定。本計画書では方向性として 200-300ms を仮目安として示すが、確定値は execution の baseline 計測に基づく）。M1a yaml L16 / L17 likes と整合。Enter は URL の history.pushState 確定のみに使う。
- **境界事例の設計契約**:
  - **IME 確定中**: `compositionstart` / `compositionend` を検出し、IME 変換中は検索を発火しない。IME 確定 + debounce 完了時点で検索する。
  - **typing 中の backspace 連打**: debounce タイマーをリセットし、最終入力から 200-300ms 経過後にのみ検索する。中間状態の検索結果がフラッシュしないこと。
  - **debounce 待機中のブラウザ戻るボタン**: debounce タイマーをキャンセルし、戻り先 URL の `?q=` を真として結果を復元する。
  - **race condition**: 連続入力で複数 fetch が並列発火した場合、最新クエリの結果のみを採用する（古い fetch の結果が後着で UI を上書きしないこと）。fetch にクエリ ID を紐付け、最新 ID 以外の結果は破棄する設計とする。
- 結果カード: 各結果に title / description / 種別ラベル（`src/lib/search/types.ts` の 8 種 ContentType に従う）/ 一致箇所ハイライト（`highlightMatches` 共有）。
- グループ化表示: ContentType ごとに見出し + 件数。順序はランキングスコア優先の中で種別ごとにまとまる表示（execution が確定）。
- 空状態（`?q=` 無し）: 入力欄 + 静かなプレースホルダ。「最近検索された語」「人気のツール」等の運営側演出は入れない（M1a yaml L18 likes と整合）。
- 0 件状態: 「『xxx』に一致するものが見つかりませんでした」+ 入力ヒント。サイト内の主要セクションへのリンクを補助動線として配置（M1a yaml L25 dislikes 緩和 + M1a yaml L18 likes の静けさを両立）。
- エラー状態: 検索インデックス取得失敗（ネットワーク等）時、エラー文 + リトライ動線。

#### 6. レスポンシブ / アクセシビリティ / ダークモード

- ブレークポイント: 既存の Mobile（〜768px）/ Desktop（768px〜）に従う。モバイルでは入力欄が画面幅いっぱい、結果カードは縦積み。
- aria 設計:
  - 入力欄: `role="searchbox"` + `aria-label`、`aria-busy` を検索中に true。
  - 結果領域: `aria-live="polite"` を採用。`role="region"` + `aria-label="検索結果"`。
  - **aria-live 文言ガイドライン（改善-2 対応、計画段階で評価観点を明示）**: アナウンス文言は「○○ 件の検索結果」のように **件数を含む短文** とする。リアルタイム検索で debounce ごとに連発するのを抑止するため、debounce 完了後の最終状態のみアナウンスし、中間状態ではアナウンスしない。0 件 → N 件・N 件 → 0 件の状態遷移時のみ更新する。具体的文言テンプレートは execution で複数案出して、実装サイクルの reviewer サブエージェントが以下 **4 観点** で評価・確定する:
    1. **日本語として自然か**（直訳調・機械翻訳調になっていないか）。
    2. **冗長でないか**（スクリーンリーダー読み上げで時間を消費しすぎないか）。
    3. **件数が前面に来るか**（最も重要な情報である「何件あるか」が文頭近くに来るか）。
    4. **ライブ更新で耳障りでないか**（連続更新時に同じフレーズが繰り返されて煩わしくならないか、件数のみ変化する場合は件数読み上げのみで済む設計になっているか）。
  - 結果リスト: 各カードは通常リンク（`<a>` または `<Link>`）。`role="listbox"`/`option` は強制せず、ネイティブ semantics 優先（独立ページではキーボード操作は標準のタブ移動で足りる、モーダルと違いフォーカストラップが不要）。
  - グループ見出し: 適切な見出しレベル。
- フォーカス管理: ページ遷移時に入力欄へ自動フォーカス（M1a yaml L16 likes 担保）。
- ダークモード: 新トークン（`--bg` / `--fg` / `--fg-soft` / `--border` / `--accent` 等、`src/app/globals.css` 定義）を直接参照。旧 `--color-*` トークンは持ち込まない（AP-I02、cycle-185 v3 透明バグ再発防止）。
- 角丸: 新コンセプトの二値統一（`--r-normal` / `--r-interactive`）に従う。

#### 7. ロジック層の集約（M-γ）

- 移動: `src/components/search/useSearch.ts` → `src/lib/search/useSearch.ts`、`src/components/search/highlightMatches.tsx` → `src/lib/search/highlightMatches.tsx`。関連テストも追従。
- 旧 view（`src/components/search/Search*.tsx`）の import path を `@/lib/search/...` に更新。
- 既存 `src/lib/search/types.ts` / `build-index.ts` はそのまま、新規ファイル追加。
- 新 view も同じ lib から import。
- ロジックの挙動は変更しない（同じ入力で同じ結果、M1b yaml L24 dislikes 予防）。

#### 8. B-340 計測の cycle-174 タスク 7 責務継承（重要-4 対応）

cycle-174 タスク 7（cycle-174.md L44）は「B-340 計測コードを新 components 側に接続し、Phase 10.2 後も analytics 関数を残す」責務を本サイクル B-331 に申し送っている。本サイクルではこれを継承し、以下を実施する:

- **責務の位置づけ**: 旧名 / 新名のイベントが並走する期間は「許容」ではなく **cycle-174 タスク 7 の責務継承**。結果クリック率の正確な計測は M-γ「新旧で同じ振る舞い」を観測経路として確認するために必須であり、来訪者最高基準の達成度を測定する手段である。
- **ページビュー扱いの活用**: `/search` ページの page_view は Google Analytics の標準 page_view イベントとして自動計測される。`trackSearchModalOpen` は意味的に「検索体験への入場」を表していたので、独立ページの page_view がこれを直接代替する。
- **イベント名の意味整理**（具体的なシンボル名・GA4 イベント名は execution で確定）:
  - `trackSearchModalOpen` → 廃止または `trackSearchPageView`（page_view の補完目的）。
  - `trackSearchModalClose` → `trackSearchExit`。close_reason 6 種のうち「esc_key / backdrop_click / close_button」はモーダル特有なので廃止、「result_click / route_change / programmatic」相当は保持。
  - `trackSearchResultClick` → そのまま（`search_term` / `result_path` / `result_type` / `result_index` の引数も維持）。
  - `trackSearchAbandoned` → そのまま。
  - `trackSearch` → そのまま。
- **GA4 イベント命名規約**: GA4 では underscore_case で命名統一。execution で旧名 → 新名の対応表を作成。
- **(legacy) 並走**: 旧 view は Phase 10.2 まで存続するため、旧名の関数も同時に残してデータ収集を継続する。Phase 10.2 で旧名を撤去する責務を Phase 10.2 サイクルへ申し送る（cycle-174 タスク 7 と整合）。

#### 9. (legacy) 共存（変更なしの維持）

- 旧 `src/components/search/Search{Trigger,Modal,Input,Results}.{tsx,module.css}` および (legacy) Header 経路はロジック層の import path 修正以外を **触らない**。
- (legacy) 配下の検索体験（モーダル UI）と Cmd+K 挙動は本サイクル前と完全に同じ動作で残ること（regression ゼロ）が完成基準の 1 つ。
- (legacy) 配下のページから (new) ヘッダー経由で `/search` に遷移する動線も成立する（Route Group が異なるが、`/search` は (new) 配下なので通常のページ遷移で問題なし）。

#### 10. 検索インデックス（`/search-index.json`）の経路維持（改善-4 対応）

- 既存 `/search-index.json` の **生成パイプライン・index 構造・8 種 ContentType の生成元（`src/lib/search/build-index.ts` 内部ロジック）は不変**。新 view が同じ index を fetch する。
- §7 で示した `useSearch` / `highlightMatches` の `src/lib/search/` への移動に伴い、これらを参照する側の **import path のみ更新する**。`build-index.ts` 自身の内部実装・API・出力 JSON 構造は変更しない。
- すなわち本セクションの「変更なし」は「インデックス生成と JSON 構造に関する不変」、§7 の「import path 更新」は「ロジック層ファイル移動に伴う参照側 path の追従」であり矛盾しない。

#### 11. cycle-174.md L30 改訂責務

cycle-174.md L30 は「① 採用後も新版はモーダル UI で実装する前提。Phase 10.2 撤去対象は旧 components のみ」と記述している。本サイクルが独立ページ採用に転じたため、L30 の「モーダル UI で実装する前提」は事実と食い違う。本サイクル execution で cycle-174.md L30 を以下のように改訂する責務を負う:

- L30 改訂内容（execution で正確な文言確定）: 「① 採用後の Phase 5 実装方針は cycle-186 で独立ページ採用に確定。新版は `/search?q=...` 独立ページ UI で実装。Phase 10.2 撤去対象は旧 components のみ」。
- cycle-174.md L279「Phase 5 で決める」記述は本サイクルでの決定済みを反映するよう改訂（または「cycle-186 で独立ページに確定済み」の脚注を追加）。

#### 12. cycle-174 / design-migration-plan.md ドキュメント整合 backlog 起票責務（重要-1 対応）

A-13 が本サイクル時点で実在しないと判明した（前掲「前提となる事実確認」セクション参照）。**cycle-174 ① 採用結論そのものの再点検は本サイクル内で PM 確定済み**（A-13 を除いても A-1〜A-12 / A-14 で ① 採用は据え置く、§案 IV 参照）であり、別サイクルでの結論再検証は **行わない**。代わりに、A-13 を根拠として記述している既存ドキュメントの整合タスクを backlog に起票する:

- backlog 起票内容（スコープを「ドキュメント整合」に限定）:
  - cycle-174.md 内の A-13 記述（L268 等）に「2024-11-21 廃止により本サイクル時点で実在しない便益。cycle-186 で ① 採用根拠から除外、残メリットで ① 採用は据え置き確定」の追記または該当箇所の改訂。
  - `docs/design-migration-plan.md` Phase 5 セクション内で SearchAction sitelinks searchbox を前提とした記述がある場合の整合改訂（本サイクル execution で実体確認の上、必要があれば改訂）。
- 起票タイミング: cycle-completion 時、PM 起票責務。
- **本サイクル PM 確定**: cycle-174 ① 採用結論は据え置き。再点検は backlog 化しない。重要-1 対応として「① 採用結論の再検証」表現は **撤回** し、上記のドキュメント整合タスクに限定する。
- **Phase 10.2 サイクルへの申し送り（改善-1 対応）**: 本サイクルで採用した Cmd+K の Route Group 別挙動（(legacy) はモーダル / (new) は `/search` 遷移、案 (α)）は Phase 10.2 で (legacy) を全廃する際に **Route Group 判定ロジックを撤去し、全 Route Group で `/search` 遷移に統一する責務** を伴う。これを Phase 10.2 サイクルへの申し送りとして backlog に明記する（cycle-completion 時、PM 起票責務）。これは §Cmd+K の挙動設計 4 案比較で「Phase 10.2 で再充足」と記述した整合性回復の実装責務を明文化するものである。重要-1 で追加した「Route Group 跨ぎ来訪者の Cmd+K 操作後の遷移ログ」観測結果も Phase 10.2 サイクルへの申し送り内容に含める（観測結果が案 (β) 切替条件を満たす場合は Phase 10.2 を待たずに切替を再判断する条件として記述）。

### 検索ページの基本設計（章 5/6 の実装契約サマリ）

- ファーストビュー: 既存の (new) ヘッダー + ページ本体の先頭に検索入力欄（初期フォーカス済）。スクロールなしで入力できる位置。
- レスポンシブ: モバイル（〜768px）= 縦積み、入力欄 100%幅、結果カードフル幅。Desktop（768px〜）= 入力欄中央寄せ最大幅、結果カード縦積み。
- アクセシビリティ: searchbox role、aria-busy（検索中）、aria-live="polite"（debounce 完了後の最終状態のみアナウンス、結果件数を含む短文）、初期フォーカス、結果はネイティブリンク semantics、見出しレベル整合。
- ダークモード: 新トークン直接参照。
- 結果カード: title（テキスト一致部分をハイライト）/ description（テキスト一致部分をハイライト）/ 種別ラベル / 必要に応じて補助 metadata。
- URL シェア時の見え方: `<title>` を動的更新（"「○○」の検索結果 | yolos.net" 形式）。
- 境界事例: IME 確定中の検索抑止、backspace 連打 debounce リセット、debounce 待機中の戻る/進む、race condition の最新クエリ ID 採用（前掲 §5）。

### 完成基準

#### 機能・構造の達成基準

- `/search` ページが (new) 配下に存在し、(new) ヘッダーの検索アイコン（PC / モバイル）と (new) 配下での Cmd+K / Ctrl+K から到達できる。
- (legacy) 配下の Cmd+K / Ctrl+K 挙動は本サイクル前と完全に同一（モーダル開閉、M1b yaml L20 likes「これまでの使い方が壊されないこと」充足。L16 / L24 は §Cmd+K の挙動設計 4 案比較で論じた通り移行期間中暫定的に整合性を欠くが Phase 10.2 で再充足）。
- `/search` のファーストビューに入力欄が表示され、初期フォーカスが当たっている（M1a yaml L16 likes 担保）。
- `?q=foo` で URL を開くと、ページロード時点で結果が表示される（M1b yaml L17 likes 担保）。
- 入力中はリアルタイムに結果が更新され、URL が `?q=` 反映される。Enter で履歴に push される。
- ブラウザの戻る/進むで `?q=` の遷移を追従する。debounce 待機中の戻る/進むでもタイマーキャンセルされて URL の `?q=` が真として復元される。
- IME 確定中は検索が発火しない。確定後 + debounce 完了で発火。
- 同じ `?q=` を異なるセッションで開いた際、結果順序が同一であること（M1b yaml L19 likes 担保、冪等性）。
- ページタイトルが `?q=` に応じて動的に更新される。
- 検索結果は 8 種 ContentType でグループ化表示される。各結果に description / 種別ラベル / ハイライトが付く。
- 結果クリックで legacy / 新側どちらのコンテンツページにも正しく遷移する。
- `/search` が **noindex, follow** で配信される（§検討した他の選択肢「`/search` の noindex 方針 4 案比較」で PM 確定した方針の反映確認、Critical-2 対応）。
- SearchAction JSON-LD が **追加されていない**（sitelinks searchbox 廃止のため不採用、§4 参照）。
- ダーク / ライト両モードで検索ページの背景・前景・ボーダーが正しく描画される（透明や色破綻が発生しない、AP-I07）。
- モバイル幅（〜768px）で入力欄・結果カードが破綻なく表示され、タップターゲットが 44px 以上。
- aria 設計（searchbox / aria-busy / aria-live）が正しく機能し、スクリーンリーダーで結果件数がアナウンスされる。aria-live は debounce 完了後の最終状態のみ発火し連発しないこと。
- (legacy) 配下の検索体験は本サイクル前と完全に同じ動作（モーダル開閉・結果遷移、regression ゼロ）。
- **Playwright Cmd+K Route Group 跨ぎシナリオ実体確認（重要-1 / 改善-2 対応）**: 「(legacy) ページ → (new) ページ → (legacy) ページ」と回遊する Playwright シナリオを実行し、各遷移後に Cmd+K（macOS）/ Ctrl+K（Windows / Linux）を押下したときの挙動が Route Group ごとに異なる（(legacy) ではモーダル開閉、(new) では `/search` 遷移）ことを **シナリオ実行ログとスクリーンショットの両方で明示的に記録する**。これは案 (α) の都合の悪い側面（Phase 5 〜 Phase 10.2 移行期間中の M1b L16 / L24 暫定違反）が **計画上の主張ではなく実体観測事実** であることを担保するための完成基準である（AP-P02 徹底）。
- 旧 `src/components/search/` の既存テストが全件 pass。
- ロジック層集約後の `useSearch` / `highlightMatches` テストが全件 pass。
- B-340 計測関数の新 / 旧名のイベントが期待通り発火する（GA4 DebugView または単体テストで確認）。
- cycle-174.md L30 の「モーダル UI で実装する前提」記述が本サイクルの独立ページ採用と整合する形に改訂されている（§11 参照）。
- `/search` ルート と `?q=` パラメータ仕様が `docs/design-migration-plan.md` Phase 5 セクションと `docs/backlog.md` B-331 Notes に永続契約として明記されている（重要-2 対応）。
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功。

#### 「動作が遅いツール」抵触回避基準（Critical-1 対応、M1b yaml L22 dislikes）

M1b yaml L22 dislikes「動作が遅いツール」に抵触しないことを **最低ライン（Core Web Vitals「Good」閾値）** と **来訪者最高基準（サイト内他ページ実測との相対）** の二段構えで担保する。具体的な数値閾値・debounce 値・Fuse.js 初期化時間は execution で実測根拠を取得して確定する。本計画書では下記の方向性と一次資料を完成基準として固定する。

**一次資料（PM が WebFetch で確認、Critical-1 対応）**:

- https://web.dev/articles/defining-core-web-vitals-thresholds （Core Web Vitals は LCP / INP / CLS の 3 指標。Good 閾値はそれぞれ ≤ 2500ms / ≤ 200ms / ≤ 0.1、いずれも 75th percentile）。
- https://developers.google.com/search/docs/appearance/core-web-vitals （Google 検索における Core Web Vitals 公式定義）。
- **TBT（Total Blocking Time）は Core Web Vitals ではない**。TBT は Lab Tool 補助指標であり、フィールド計測の責任性能指標は INP（Interaction to Next Paint）である（2024-03 に INP が FID を置換）。r2 計画書の「TBT < 200ms」は誤り、本 r3 で INP に修正する。

**最低ライン（Core Web Vitals Good 閾値、絶対基準）**:

- **`/search` 初回ロード LCP**: ≤ 2.5s（Good、75th percentile、Lighthouse Performance モバイルプロファイル）。
- **`/search` の INP**: ≤ 200ms（Good、75th percentile）。INP の Lab 測定は困難であるため、Lab では PageSpeed Insights / WebPageTest 等のフィールド計測ツールを優先する。Lab 補助としては TBT（Total Blocking Time）が INP の代替指標として参照可能だが、CWV 公式基準ではないため **判定根拠には使用せず参考値のみ** とする（改善-3 対応、誤解防止: 本計画書では TBT を一貫して「参考値のみ」として扱う）。手段確定は execution。

**来訪者最高基準（相対基準、CLAUDE.md L9 Decision Making Principle）**:

- Good 閾値は Google が「Good」と認める下限であって、本サイトの「来訪者最高」基準ではない。よって以下を併せて担保する:
  - **サイト内他ページとの比較**: execution で下記の固定 baseline 対象ページの LCP / INP を Playwright + Lighthouse などで実測し baseline を取得。`/search` の LCP / INP は **baseline 中央値以下** を達成する。baseline 対象が execution 都度に揺らぐと中央値も揺らぎ比較不能になるため、本計画書で対象ページを **具体パスとして固定** する（重要-3 対応）。実体は `ls src/tools/` / `ls src/blog/content/` / `ls src/play/games/` で確認済み。
  - **baseline 対象ページ群の選定 3 案（AP-P17 対応）**:
    - **案 (A) 主要ツール + 主要記事 + 主要ゲームの代表広めセット（採用）**: `/`、`/tools`、`/tools/char-count`、`/tools/business-email`、`/blog`、`/blog/2026-05-07-letter-from-an-ai-that-cant-see-the-future`、`/play`、`/play/yoji-kimeru` の 8 ページ。一覧 3 種（`/tools` / `/blog` / `/play`）と詳細 3 種（ツール 2 件 + 記事 1 件 + ゲーム 1 件）+ トップ 1 件をカバーし、中央値の代表性が高い。
    - **案 (B) 一覧ページのみ**: `/`、`/tools`、`/blog`、`/play` の 4 ページのみ。詳細ページ baseline が取れず、`/search` から遷移する先のページ群との比較ができない。
    - **案 (C) 詳細ページに偏らせる**: ツール 3 件 + 記事 2 件 + ゲーム 2 件のみ。一覧 / トップとの比較が取れない。
    - **案 (A) 採用判断**: `/search` は「一覧表示」と「結果遷移先」の両性質を併せ持つため、一覧と詳細の **両方** を baseline に含める案 (A) が中央値の代表性として最も妥当。詳細ページの選定は実体確認済みの具体パスを使用（`/tools/char-count` は yaml M1a search_intents「文字数カウント」に直接対応する主要ツール、`/tools/business-email` は別カテゴリの代表として選定、ブログ記事は最も新しい主要記事、ゲームは `/play/yoji-kimeru` を代表として選定）。
  - **baseline 対象ページ確定リスト（execution はこのリストを使用する）**:
    - `/`（トップ）
    - `/tools`（ツール一覧）
    - `/tools/char-count`（主要ツール代表 1: 文字数カウント、M1a search_intents 直接対応）
    - `/tools/business-email`（主要ツール代表 2: ビジネスメール）
    - `/blog`（ブログ一覧）
    - `/blog/2026-05-07-letter-from-an-ai-that-cant-see-the-future`（主要記事代表、`src/blog/content/` 内の最新記事）
    - `/play`（プレイ一覧）
    - `/play/yoji-kimeru`（主要ゲーム代表）
  - **(legacy) モーダルとの比較**: 既存 (legacy) モーダル経由の検索体験速度（入力 → 結果反映までの体感時間）を baseline 計測し、`/search` の体感速度がこれと **同等以下** であることを確認。

**`/search-index.json` の fetch**:

- §10 で index 生成パイプライン不変としているため、`/search-index.json` の gzip 後サイズは本サイクル前（cycle-186 着手前 main コミット）と同等以下に維持されることを **regression として** 確認する（改善-4 対応、新規目標値ではなく現状値を割らないことの確認）。execution で baseline を `git show main:public/search-index.json | gzip | wc -c` 同等手段で取得。
- preload / prefetch / cache 戦略は execution で来訪者最高基準から確定（モーダルから独立ページに移行する分、fetch のタイミングが変わる点を考慮）。

**リアルタイム検索の debounce**:

- 入力停止から結果反映までの遅延を「他ページ操作の体感速度と同等以下」とする方向性で execution が実測根拠付きで確定。具体値は execution で IME 確定タイミング / typing 連打 / race condition の境界事例設計（§5）と整合する形で決める。r2 計画書の「200-300ms」は方向性として残すが、確定根拠は execution の実測。

**Fuse.js 初期化**:

- 初期化完了までの時間を「他ページの操作可能までの体感時間と同等以下」とする方向性で execution が実測根拠付きで確定。r2 計画書の「100ms 以内」は実測根拠なき仮値のため削除し、execution で実測値に基づき確定する。

**(legacy) regression の検証手段（改善-3 対応）**:

- (legacy) モーダルの開閉・検索の体感速度が本サイクル前と同等であること（ロジック移動だけで速度劣化が起きていないこと）。検証手段は execution で確定（方向性として: Playwright の `performance.mark` / `performance.measure` で開閉・結果反映までの時間を計測、または Lighthouse を (legacy) ページ起点で再実行して該当 trace の interaction latency を比較）。

**execution 完成基準への組み込み**:

- 上記すべての数値（最低ライン Good 閾値達成 / baseline 取得値 / 同等以下達成）を execution の完了レポートに **実測値付きで** 記載する。実測値がなければ完成基準未達。

#### Playwright 本番ビルド視覚確認（AP-I07 対応、視覚崩れの実体検出のため）

- **Playwright 本番ビルド（`npm run build && npm run start`）で `/search` を 4 マトリクス（w360 / w1280 × light / dark）で視覚確認**し、透明バグや破綻が無いことを実体確認する。スクリーンショット撮影自体は **来訪者目線評価の代替にはならない**（AP-I01）ため、下記の来訪者目線評価基準で別途評価する。

#### 来訪者目線評価基準（重要-5 / AP-I01 対応）

スクショ撮影で機能整合性だけを確認することは AP-I01 違反となる。撮影した 4 マトリクスのスクリーンショットを reviewer が以下の 4 観点で **来訪者目線で評価** することを完成基準に含める:

1. **入力欄の自然な吸引力（M1a 初見遭遇観点）**: ファーストビューを開いた瞬間に「入力すれば何かが探せそう」と直感的に分かる視覚的吸引力があるか。プレースホルダ文言・サイズ・コントラスト・配置が「すぐ使い始められる」likes（M1a yaml L16）と整合するか。
2. **結果カードの判断材料の十分さ（M1a / M1b 共通観点）**: title / description / 種別ラベル / ハイライトが「似たようなツールが並んでいてどれを使えばよいか迷わせる」dislikes（M1a yaml L25）を回避するに十分な情報量と視覚的差異を持っているか。
3. **空状態の静けさ（M1a 初見遭遇観点）**: `?q=` 無しの空状態が「余計な説明や装飾がなく、用事だけ静かに片付けられる画面」likes（M1a yaml L18）と整合する静けさを持っているか。運営側演出（人気のツール等）が混入していないか。
4. **0 件状態の親切さ（M1a 初見遭遇 / M1b 繰り返し利用共通観点）**: 0 件状態が来訪者を放置せず、再入力や別動線への誘導を親切に提供しているか。「動作が遅い」「使えない」と感じさせない文言・補助動線になっているか。

**判定主体・手順の明確化（重要-4 対応）**:

- 判定主体は **実装サイクル（cycle-execution）の reviewer サブエージェント**（外部の人間レビュアーではない）。
- 判定基準は上記 4 観点それぞれの「達成 / 未達」二値、観点ごとに独立に判定し、いずれか 1 つでも未達なら全体未達とする。
- 確認手順の方向性: reviewer は (1) 4 マトリクスのスクリーンショット（Playwright 本番ビルド w360 / w1280 × light / dark）を視認、(2) 該当 yaml の引用（M1a L16/L17/L18/L25 等）に照らして 4 観点を独立判定、(3) 未達があれば該当観点と該当 yaml 引用を添えて execution に差し戻す。観点ごとの細目チェックリスト（プレースホルダ文言の具体性 / コントラスト比 / 結果カード情報量の重複可否 等）は execution が確定。

#### サイクル整合の達成基準

- 再判断トリガー 1 の backlog 起票が cycle-completion 時に完了している（cycle-174 タスク 11、PM 起票責務）。
- §12 で定めた「cycle-174 / design-migration-plan.md ドキュメント整合タスク（A-13 削除追記）」backlog 起票が cycle-completion 時に完了している（重要-1 対応、cycle-174 ① 採用結論再点検は本サイクル内 PM 確定済みのため別サイクル起票は不要）。

### 計画にあたって参考にした情報

- **ファクトチェック（PM が WebFetch で実体確認、本計画立案の前提、Critical-1 対応）**:
  - https://developers.google.com/search/blog/2024/10/sitelinks-search-box （Google 公式: sitelinks search box は 2024-10-21 廃止告知、2024-11-21 正式廃止。WebSite.potentialAction.SearchAction の構造化データは現時点で sitelinks searchbox としてレンダリングされない）。
  - https://web.dev/articles/defining-core-web-vitals-thresholds （Core Web Vitals は LCP / INP / CLS の 3 指標、Good 閾値は ≤ 2500ms / ≤ 200ms / ≤ 0.1、75th percentile）。
  - https://developers.google.com/search/docs/appearance/core-web-vitals （Google 検索における Core Web Vitals 公式定義）。
  - 補足: TBT（Total Blocking Time）は Core Web Vitals では **なく** Lab Tool 補助指標。フィールド計測指標は INP（2024-03 に FID から置換）。本計画 §動作が遅いツール抵触回避基準 はこの事実に基づき INP を採用。
- `/mnt/data/yolo-web/docs/cycles/cycle-174.md` L20-30（背景・前提）、L256-275（結論と根拠）、L268（A-13 = 本サイクル時点で実在しない便益、無効化対象）、L279（Phase 5 実装方針判断の申し送り）、L280（M-γ ランキング共有層）、L297-302（Phase 4 ヘッダー前提構造）、L305-314（再判断トリガー 1）、L44（タスク 7: B-340 計測新接続責務 + Phase 10.2 後の残置）
- `/mnt/data/yolo-web/docs/design-migration-plan.md` Phase 5 章本体、特に SearchAction target 要件記述部分（本サイクルでは SearchAction 不採用判断のため該当記述の整合を本サイクル execution で確認）、`src/lib/search/` 切り出し記述
- `/mnt/data/yolo-web/docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（M1a 全体、特に likes L16-20 / dislikes L22-26 / search_intents L27-34）
- `/mnt/data/yolo-web/docs/targets/気に入った道具を繰り返し使っている人.yaml`（M1b 全体、特に likes L16-20 / dislikes L22-24 / `search_intents = []` L25）
- `/mnt/data/yolo-web/docs/targets/AIエージェントやオーケストレーションに興味があるエンジニア.yaml`（S1 全体）
- `/mnt/data/yolo-web/docs/targets/Webサイト製作を学びたいエンジニア.yaml`（S2 全体）
- `/mnt/data/yolo-web/docs/targets/AIの日記を読み物として楽しむ人.yaml`（S3 全体）
- `/mnt/data/yolo-web/docs/constitution.md`（Goal）、`/mnt/data/yolo-web/CLAUDE.md` Decision Making Principle（L9）
- アンチパターン: `/mnt/data/yolo-web/docs/anti-patterns/planning.md`（AP-P02 / P03 / P07 / P09 / P16 / P17 / P18）、`/mnt/data/yolo-web/docs/anti-patterns/implementation.md`（AP-I01 / AP-I02 / AP-I07）、`/mnt/data/yolo-web/docs/anti-patterns/workflow.md`（AP-WF12: ファクトチェック）

### 計画段階で明示する重要な注意点（再発防止）

cycle-185 / cycle-186 r1 で発生した AP-WF12 / AP-P16 違反（ファクトチェック不実施で廃止済み仕様を便益として記述）の再発を防ぐため、Owner 厳命 6 項目と本計画の対応を逐条明示する:

1. **Owner 厳命 1（ゼロから考え直し）対応**: r1 計画から目的・案比較・作業内容・完成基準を全面書き直し。A-13 への一切の依拠を削除し、独立ページ採用根拠を yaml 直接引用のみで再構築。
2. **Owner 厳命 2（現状を所与としない、AP-P03）対応**: 「現状モーダルだから踏襲」「現状 `onSearchOpen` プロップがあるから使い続ける」のような現状起点の判断は採用しない。`/search` ルート新設・Cmd+K 分岐挙動・プロップ意味変更は、いずれも来訪者最高価値（yaml 直接引用根拠）から逆算して決まる。
3. **Owner 厳命 3（工数で判断しない、CLAUDE.md L9）対応**: 実装コスト・ファイル数・現状維持しやすさ・既存資産流用可否を判断材料として **一切使っていない**。「許容」のような工数温存ニュアンスは B-340 計測の文脈から削除し、cycle-174 タスク 7 責務継承として書き直した（重要-4）。
4. **Owner 厳命 4（Owner に判断を委ねない）対応**: 案 I 採用 / 案 II・III・IV 棄却・SearchAction 不採用・Cmd+K の Route Group 別挙動・noindex 採用・cycle-174 ① 採用結論据え置きの判断はすべて PM 確定として本計画書に明記。
5. **Owner 厳命 5（yaml 拡大解釈禁止）対応**: M1b yaml には「慣れた操作手順が突然変わる」記述は **存在しない**。本計画は yaml L16-24 の原文のみを判断材料とした。「不引用宣言」を §来訪者全層への価値 セクションに明記。
6. **Owner 厳命 6（判断軸は来訪者最高基準のみ）対応**: GA 実測件数・SEO 数値目標・既存資産流用・実装容易性は判断軸から除外。判断はすべて yaml likes/dislikes 直接引用と constitution Goal のみで論証。
7. **AP-WF12 / AP-P16（ファクトチェック）対応**: Google sitelinks search box 廃止を一次資料（developers.google.com）で WebFetch 確認し、A-13 を本計画から完全削除（Critical-1）。
8. **AP-P07（運営者目線でなく来訪者起点）対応**: 4 案比較は全て各ターゲット yaml の likes / dislikes 直接引用に基づく。
9. **AP-P09（Goal の読み替え禁止）対応**: 「higher page views」を SEO スコアや特定 KPI に読み替えない。検索結果ページが独立 page view 対象になることと外部流入経路が新規成立することを Goal と直接接続。
10. **AP-P17（3 案以上の列挙比較）対応**: 案 I / II / III / IV を独立評価し、いずれも来訪者価値の観点から判定。
11. **AP-P02（戦略を否定するデータを探す）対応**: 案 I の都合の悪い側面を §作業内容 / §検討した他の選択肢 で正直に列挙: (a) Cmd+K の Route Group 別挙動が M1b yaml L16 / L24 と Phase 5 〜 Phase 10.2 移行期間中に暫定的に整合性を欠くこと（Critical-3 対応、§Cmd+K の挙動設計 4 案比較）、(b) `/search` の noindex により Google 経由で `/search?q=...` を発見する来訪者経路が失われること（Critical-2 対応、§`/search` の noindex 方針 4 案比較）、(c) SearchAction 不採用により sitelinks searchbox 復活時の即応性も失うこと（§4）、(d) M1b yaml L17 likes の `/search?q=...` ブックマーク便益が L17 原意の拡張解釈であり厳密適用ではないこと（重要-2 対応）。
12. **AP-I02（場当たり的継ぎ足し禁止）対応**: 旧 `--color-*` トークンを新コンポーネントに持ち込まない。新トークン直接参照のみ。
13. **AP-I07（jsdom で検出できない透明バグ）対応**: Playwright 本番ビルド視覚確認を完成基準に含める（4 マトリクス: w360 / w1280 × light / dark）。
14. **AP-I01（スクショで UI/UX 評価を代替しない）対応**: スクショ撮影自体は機能整合性確認のみで、来訪者目線評価は §完成基準 「来訪者目線評価基準」の 4 観点（入力欄吸引力 / 結果カード判断材料 / 空状態の静けさ / 0 件状態の親切さ）で reviewer が独立に判定する基準を明記（重要-5）。
15. **責務系項目の本文セクションインデックス（改善-5 対応、再発防止のため必読項目を本文セクションへ案内する目次機能）**: 以下の責務系項目は本文の該当セクションに詳述しており、本注意点リストはそれらへの目次として機能する（重要-5 対応の責務散逸防止策）。
    - (legacy) 据え置き原則: §9 「(legacy) 共存（変更なしの維持）」参照。
    - cycle-174 二択判断の不再判断: §案 IV 参照。
    - 再判断トリガー 1 起票責務: §目的 §再判断トリガー 1 の観測責務 / §完成基準 §サイクル整合の達成基準 参照。
    - cycle-174 / design-migration-plan.md ドキュメント整合 backlog 起票責務: §12 参照（重要-1 対応、cycle-174 ① 採用結論再点検は本サイクル内 PM 確定済みのため別サイクル起票は不要）。
    - cycle-174.md L30 改訂責務: §11 参照。
    - `/search` 永続契約の明文化責務: §2 参照。

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
