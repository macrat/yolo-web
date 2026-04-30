# 既存コンテンツ整理の方針確定（移行計画 Phase 1.2）

- **出典**: cycle-172
- **判断完了日**: 2026-04-30
- **cycle-161 期間差分注記**: cycle-161 の GA4 データは「直近 30 日: 2026-03-07〜04-06」基準で取得した値（cycle-161.md L40 に明記）。本サイクルの判断は **過去 90 日: 2026-01-30〜2026-04-30** を基準とし、月次換算を「90 日合計 ÷ 3」で算出している。取得期間が 30 日 vs 90 日で異なるため、季節変動・月内変動の影響が異なり、厳密な同条件比較ではない。cycle-161 の値（例：辞典平均 0.003 PV/ページ）と本サイクルの値を直接比較する際はこの差分を必ず考慮すること。

---

## セクション 1: 全体集計

| 集計              | 件数        |
| ----------------- | ----------- |
| 判断対象単位 合計 | 19 単位     |
| **移行**          | **8 単位**  |
| **削除**          | **11 単位** |
| **保留**          | **0 単位**  |

グループ別内訳：

- **dictionary グループ（10 単位）**: 移行 8 / 削除 2 / 保留 0
  - dictionary トップ（1）: 移行
  - colors 系（3）: 移行
  - humor 系（2）: 移行
  - kanji 系（2）: 削除
  - yoji 系（2）: 移行
- **cheatsheets グループ（8 単位）**: 移行 0 / 削除 8 / 保留 0
- **achievements グループ（1 単位）**: 移行 0 / 削除 1 / 保留 0

---

## セクション 2: 統合判断結果表

| ルート名                                      | 判断 | 90日合計 全体PV | 月次全体PV | 90日合計 OS PV | 月次 OS PV | コンセプト整合                       | 主要根拠                                                                                                                                                                                                                                                                                             | リダイレクト要否                                                             |
| --------------------------------------------- | ---- | --------------- | ---------- | -------------- | ---------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/dictionary`                                 | 移行 | 33              | 11.0       | 14             | 4.7        | 道具（ハブ）                         | 辞典群のハブとして構造的価値があり、OS PV 月次 4.7 は辞典ルートの中で最も高い。他辞典を移行する場合、トップも移行しないとハブが断絶する。                                                                                                                                                            | 不要（URL維持）                                                              |
| `/dictionary/colors`                          | 移行 | 10              | 3.3        | 8              | 2.7        | 道具（情報参照）                     | OS 流入率 80%（8/10）と高く、色を調べる目的の来訪者が実際に来ている。colors 詳細ページ群の入口として構造的に必要。                                                                                                                                                                                   | 不要（URL維持）                                                              |
| `/dictionary/colors/[slug]`                   | 移行 | 37              | 12.3       | 35             | 11.7       | 道具（情報参照）                     | 全辞典ルート中で最も高い OS PV（月次 11.7）。OS 流入率 95%。mizuasagi・cyohsyun 等に実際の検索流入あり。1ページあたり 0.047/月（cycle-161 辞典平均の約 16 倍、期間差に注意）。                                                                                                                       | 不要（URL維持）                                                              |
| `/dictionary/colors/category/[category]`      | 移行 | 6               | 2.0        | 6              | 2.0        | 道具（ナビハブ）                     | OS PV 月次 2.0 とサンプルは少ないが OS 流入率 100%。colors スラッグ群への navigation ハブとして構造的価値がある。削除すると色カテゴリからの探索動線が失われる。                                                                                                                                      | 不要（URL維持）                                                              |
| `/dictionary/humor`                           | 移行 | 6               | 2.0        | 6              | 2.0        | 息抜き                               | OS 流入率 100%（6/6）。humor 詳細ページ群への入口として構造的に必要。コンセプト的に「息抜き」枠に属し、新コンセプトの「息抜き」（1割以下の制約）に収まる規模。                                                                                                                                       | 不要（URL維持）                                                              |
| `/dictionary/humor/[slug]`                    | 移行 | 8               | 2.7        | 8              | 2.7        | 息抜き                               | morning が 6 PV で突出（OS 率 100%）。cycle-161 の分析で「辞典平均の 2000 倍」と評価された morning は依然として流入あり。コンセプト「息抜き」として明確に位置づけられる。ただし 30 語中 3 語のみ観測でサンプル少。                                                                                   | 不要（URL維持）                                                              |
| `/dictionary/kanji`（トップ集約単位）         | 削除 | 57              | 19.0       | 20             | 6.7        | 該当なし（弱い情報参照）             | 月次 OS PV 6.7 のうち多くは Direct/Organic Social 由来であり、SEO 経由の来訪者価値は低い。1ページあたり月次 OS PV 0.003 の kanji 詳細群の入口ハブとして残す構造的価値もゲーム依存がないため低い。コンセプト「道具」との整合も弱く、新規ドメインでの漢字検索 SEO 競争には勝てない状態が継続している。 | 要（`/dictionary/kanji` → 削除時は 410 または `/dictionary` へリダイレクト） |
| `/dictionary/kanji/[char]`（詳細）            | 削除 | 24              | 8.0        | 18             | 6.0        | 該当なし（弱い情報参照）             | 1ページあたり月次 OS PV 0.0028 は cycle-161 の値（0.002）と同水準で改善なし。2,136 字中 90 日間でアクセスがあったのは 21 ページのみ（1.0%）。大手漢字辞典との競争で SEO 勝機なし。移行工数（2,136 字の QA）に対するリターンが極めて低い。                                                            | 要（個別ページは 410 または `/dictionary` へ）                               |
| `/dictionary/yoji`（トップ+category集約単位） | 移行 | 22              | 7.3        | 11             | 3.7        | 弱い道具（情報参照）                 | 月次 OS PV 3.7 は辞典系トップとしては kanji トップ（2.0）より高い。category ページへの OS 流入あり（knowledge・life 各 2）。yoji/[yoji] を移行する場合、その入口ハブとして移行が必要。                                                                                                               | 不要（URL維持）                                                              |
| `/dictionary/yoji/[yoji]`（詳細）             | 移行 | 19              | 6.3        | 13             | 4.3        | 弱い道具（情報参照）＋独自コンテンツ | 1ページあたり月次 OS PV 0.011 は cycle-161 値（0.005、30日窓）より高く、AI 視点の独自例文による SEO 差別化効果が出ている可能性がある。個別の検索流入あり（明鏡止水・教学相長・自己中心等）。移行工数（400 語）はカニジと比べて現実的。                                                               | 不要（URL維持）                                                              |
| `/cheatsheets`                                | 削除 | 12              | 4.0        | 2              | 0.67       | 道具（参照リファレンス）             | 全サブページが削除される前提ではトップ一覧ページ自体の存在価値が消失。月次 OS PV 0.67 は極小で SEO 価値なし。内部リンクハブ機能もサブページ消滅後は意味をなさない                                                                                                                                    | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/cron`                           | 削除 | 0               | 0          | 0              | 0          | 道具（整合）                         | 90 日合計 PV ゼロ。来訪者価値を示すデータが皆無であり、削除以外の選択肢を支持するデータが存在しない                                                                                                                                                                                                  | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/git`                            | 削除 | 1               | 0.33       | 1              | 0.33       | 道具（整合）                         | 90 日で OS 流入 1 件は統計的に意味のある水準ではなく、cycle-161 の「約 0 PV」評価から本質的な変化なし。移行しても来訪者価値を示す実績がない                                                                                                                                                          | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/html-tags`                      | 削除 | 0               | 0          | 0              | 0          | 道具（整合）                         | 90 日合計 PV ゼロ。来訪者価値を示すデータが皆無であり、削除以外の選択肢を支持するデータが存在しない                                                                                                                                                                                                  | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/http-status-codes`              | 削除 | 1               | 0.33       | 0              | 0          | 道具（整合）                         | 全体 PV 1 件があるが OS 流入ゼロ。サイト内回遊またはダイレクトによるものと推定され、外部からの需要を示すデータなし                                                                                                                                                                                   | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/markdown`                       | 削除 | 1               | 0.33       | 1              | 0.33       | 道具（整合）                         | 90 日で OS 流入 1 件は統計的に意味のある水準ではない。`/cheatsheets/git` と同様の評価であり、移行を支持するデータなし                                                                                                                                                                                | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/regex`                          | 削除 | 4               | 1.33       | 0              | 0          | 道具（整合）                         | cheatsheets 内で全体 PV 最多（4 件）だが OS 流入ゼロ・平均滞在 1.9 秒は来訪者価値が低いことを示す。外部からの検索需要なく、移行を正当化するデータなし                                                                                                                                                | 要（`/` へリダイレクト）                                                     |
| `/cheatsheets/sql`                            | 削除 | 0               | 0          | 0              | 0          | 道具（整合）                         | 90 日合計 PV ゼロ。来訪者価値を示すデータが皆無であり、削除以外の選択肢を支持するデータが存在しない                                                                                                                                                                                                  | 要（`/` へリダイレクト）                                                     |
| `/achievements`                               | 削除 | 5               | 1.67       | 4              | 1.33       | 該当なし                             | play 系ゲーミフィケーション専用。新コンセプト「道具と息抜き」への移行でゲーミフィケーション対象コンテンツ自体が整理対象。来訪者が積極的に訪問する価値がない独立ページ                                                                                                                                | 要（フッターリンク削除・about ページリンク修正）                             |

---

## セクション 3: グループ別詳細

### 3-1. dictionary グループ（グループA: dictionary トップ + colors 系 + humor 系）

#### GA4 データ（2026-01-30〜2026-04-30、90日間）

**全体 PV（全チャネル）**

| ルート                                                    | 90日合計 全体PV | 月次全体PV |
| --------------------------------------------------------- | --------------- | ---------- |
| `/dictionary`                                             | 33              | 11.0       |
| `/dictionary/colors` (トップ)                             | 10              | 3.3        |
| `/dictionary/colors/[slug]` (全スラッグ合計)              | 37              | 12.3       |
| `/dictionary/colors/category/[category]` (全カテゴリ合計) | 6               | 2.0        |
| `/dictionary/humor` (トップ)                              | 6               | 2.0        |
| `/dictionary/humor/[slug]` (全スラッグ合計)               | 8               | 2.7        |

**Organic Search PV（sessionDefaultChannelGroup = 'Organic Search'）**

| ルート                                                    | 90日合計 OS PV | 月次 OS PV |
| --------------------------------------------------------- | -------------- | ---------- |
| `/dictionary`                                             | 14             | 4.7        |
| `/dictionary/colors` (トップ)                             | 8              | 2.7        |
| `/dictionary/colors/[slug]` (全スラッグ合計)              | 35             | 11.7       |
| `/dictionary/colors/category/[category]` (全カテゴリ合計) | 6              | 2.0        |
| `/dictionary/humor` (トップ)                              | 6              | 2.0        |
| `/dictionary/humor/[slug]` (全スラッグ合計)               | 8              | 2.7        |

**colors 詳細内訳（全体 PV 上位）**

| ページ                          | 全体PV | OS PV |
| ------------------------------- | ------ | ----- |
| /dictionary/colors/mizuasagi    | 6      | 6     |
| /dictionary/colors/cyohsyun     | 4      | 4     |
| /dictionary/colors/asagi        | 2      | 2     |
| /dictionary/colors/benikakehana | 2      | 2     |
| /dictionary/colors/ebicha       | 2      | 0     |
| /dictionary/colors/edomurasaki  | 2      | 2     |
| /dictionary/colors/sabiasagi    | 2      | 2     |
| /dictionary/colors/tsutsuji     | 2      | 2     |
| その他（1PV以下）               | 15     | 15    |

**humor 詳細内訳**

| ページ                     | 全体PV | OS PV |
| -------------------------- | ------ | ----- |
| /dictionary/humor/morning  | 6      | 6     |
| /dictionary/humor/commute  | 1      | 1     |
| /dictionary/humor/exercise | 1      | 1     |

**コンテンツ規模**

- colors 辞典: 250 色（`src/data/traditional-colors.json`）
- humor 辞典: 30 語（`src/humor-dict/data.ts`）
- 90日間でアクセスされた colors スラッグ: 24 色（250色中）
- 90日間でアクセスされた humor スラッグ: 3 語（30語中）

**1ページあたり月次 OS PV**

- colors/[slug]: 月次 OS PV 11.7 ÷ 250色 ≒ **0.047/ページ**
- humor/[slug]: 月次 OS PV 2.7 ÷ 30語 ≒ **0.090/ページ**

cycle-161 の辞典平均「0.003/ページ（月次 OS PV、30日窓）」との比較（期間差分に注意）:

- colors/[slug] は 0.047 で約 **16 倍**
- humor/[slug] は 0.090 で約 **30 倍**

#### 各単位の根拠詳細

**`/dictionary` トップ**

辞典グループ内で最も高い月次全体 PV（11.0）と月次 OS PV（4.7）。このルートは漢字・四字熟語・伝統色・ユーモアの 4 辞典を束ねるハブであり、削除すると URL `/dictionary` が 404 となり、そこからのナビゲーションが失われる。colors/humor/kanji/yoji のいずれかを移行する場合、トップも移行しないとサイト構造として不整合になる。コンセプト整合は「道具（ハブページ）」として許容範囲。

**`/dictionary/colors`（colorsトップ）**

月次全体 PV 3.3、月次 OS PV 2.7（OS 率 80%）。アクセス者のほとんどが検索由来であり、色を調べる目的の来訪者が存在する。250 色のコンテンツを持つ colors スラッグ群への入口として削除は構造的に問題がある。「伝統色を調べたい」という情報参照ユースケースは「道具的」利用として位置づけられる。

**`/dictionary/colors/[slug]`（colors詳細）**

全辞典ルート中で月次 OS PV が最も高い（11.7）。mizuasagi (OS PV 6)・cyohsyun (OS PV 4) が上位を占め、個別の色名で検索してたどり着く来訪者が存在する。cycle-161 の辞典平均 0.003/ページ（30日窓）と比較して 0.047/ページ（90日窓）は相対的に高い値（期間差に注意）。OS 流入率 95% は来訪者が明確な検索意図を持って来ていることを示す。移行コストは 250 色のデータ維持が必要だが、データは JSON で管理されており UI 変更のみ。

**`/dictionary/colors/category/[category]`（colorsカテゴリ別）**

月次 OS PV 2.0、サンプルは 3 カテゴリ（blue/achromatic/red）のみ観測。単体の PV は少ないが、OS 流入率 100% かつ colors スラッグへの navigation ハブとして構造的価値がある。削除した場合、カテゴリ別に色を探したいユーザーの動線が失われる。移行コストは低い（カテゴリ数は限定的）。

**`/dictionary/humor`（humorトップ）**

月次 OS PV 2.0、OS 流入率 100%。humor 詳細ページへの入口であり、humor/[slug] を移行する場合はトップも移行が必要。30 語の humor コンテンツはコンセプト「息抜き」として明確に位置づけられる。サイト全コンテンツに占める息抜き割合は現状でも 1 割未満であり、コンセプトの制約内に収まる。

**`/dictionary/humor/[slug]`（humor詳細）**

morning が OS PV 6 で突出（全 humor PV の 75%）。cycle-161 分析で「辞典 2800 ページ中で唯一突出した 6 PV」と評価されたページが 90 日後も同水準を維持しており、偶発ではなく安定した検索流入がある可能性が高い。commute と exercise はそれぞれ 1 PV のみ。30 語中 27 語はアクセスゼロだが、これは humor コンテンツ全体の潜在価値の下限を示すものではなく、morning の成功パターンが他の語にも波及する可能性を否定しない。コンセプト「息抜き」として整合性が高く、移行の妥当性は明確。

---

### 3-2. dictionary グループB（kanji 系 + yoji 系）

#### GA4 データ（2026-01-30〜2026-04-30、90日間）

**kanji 系 全体 PV**

| ルート                                             | 90日合計 全体PV | 月次全体PV |
| -------------------------------------------------- | --------------- | ---------- |
| `/dictionary/kanji`（トップ）                      | 30              | 10.0       |
| `grade/[grade]`（grade/1〜7 合計）                 | 10              | 3.3        |
| `radical/[radical]`（観測分合計）                  | 6               | 2.0        |
| `stroke/[count]`（観測分合計）                     | 7               | 2.3        |
| `category/[category]`（観測分合計）                | 4               | 1.3        |
| **kanji トップ単位合計**                           | **57**          | **19.0**   |
| `/dictionary/kanji/[char]`（詳細、観測ページ合計） | 24              | 8.0        |

**kanji 系 Organic Search PV**

| ルート                             | 90日合計 OS PV | 月次 OS PV |
| ---------------------------------- | -------------- | ---------- |
| `/dictionary/kanji`（トップ）      | 6              | 2.0        |
| `grade/[grade]`                    | 8              | 2.7        |
| `radical/[radical]`                | 0              | 0.0        |
| `stroke/[count]`                   | 4              | 1.3        |
| `category/[category]`              | 2              | 0.7        |
| **kanji トップ単位合計**           | **20**         | **6.7**    |
| `/dictionary/kanji/[char]`（詳細） | 18             | 6.0        |

**yoji 系 全体 PV**

| ルート                            | 90日合計 全体PV | 月次全体PV |
| --------------------------------- | --------------- | ---------- |
| `/dictionary/yoji`（トップ）      | 12              | 4.0        |
| `category/[category]`             | 10              | 3.3        |
| **yoji トップ単位合計**           | **22**          | **7.3**    |
| `/dictionary/yoji/[yoji]`（詳細） | 19              | 6.3        |

**yoji 系 Organic Search PV**

| ルート                            | 90日合計 OS PV | 月次 OS PV |
| --------------------------------- | -------------- | ---------- |
| `/dictionary/yoji`（トップ）      | 6              | 2.0        |
| `category/[category]`             | 5              | 1.7        |
| **yoji トップ単位合計**           | **11**         | **3.7**    |
| `/dictionary/yoji/[yoji]`（詳細） | 13             | 4.3        |

**コンテンツ規模**

- kanji 辞典: 2,136 字（`src/data/kanji-data.json` より）
- yoji 辞典: 400 語（`src/data/yoji-data.json` より）
- 90日間でアクセスされた kanji/[char]: 21 ページ（2,136字中の約 1.0%）
- 90日間でアクセスされた yoji/[yoji]: 15 ページ（400語中の約 3.8%）

**1ページあたり月次 OS PV**

- kanji/[char]: 月次 OS PV 6.0 ÷ 2,136字 ≒ **0.0028/ページ**（≒ 0.003）
- yoji/[yoji]: 月次 OS PV 4.3 ÷ 400語 ≒ **0.011/ページ**

#### 各単位の根拠詳細

**`/dictionary/kanji`（トップ集約単位）**

90日全体 PV 57 のうち、月次 OS PV は 6.7 にすぎない。トップページ自体（30 PV）のうち OS は 6 のみで、残り 20 は Direct・4 は Organic Social。grade/radical/stroke サブルートへの OS 流入も合計 8 PV と少なく、主要なアクセスはサイト内遷移や直接アクセスと推測される。漢字検索分野では漢字辞典オンライン等の大手が SEO 上位を独占しており、cycle-161 評価「新規ドメインでは戦えない」（L87）が本サイクルでも変わっていない。ゲーム（kanji-kanaru）との URL 依存は確認できず、削除してもゲームに影響なし。コンセプト「道具」との整合も弱い。移行する場合の工数（多数の動的サブルート）に対し来訪者価値のリターンが見合わない。

**`/dictionary/kanji/[char]`（詳細）**

2,136 字中 90 日間でアクセスがあったのは 21 ページ（1.0%）のみで、月次 OS PV 6.0 を 2,136 字で割ると 0.0028/ページ。これは cycle-161 の「漢字辞典 0.002/ページ（30日窓）」と実質的に同水準であり、改善の兆候はない。大手サイトとの SEO 競争で劣勢が続いており、移行工数（2,136 字の UI 移行と QA）に対する来訪者価値のリターンが著しく低い。削除時は外部からの被リンクがある可能性を考慮してリダイレクトまたは 410 応答を設定する。

**`/dictionary/yoji`（トップ+category集約単位）**

月次 OS PV 3.7 は、kanji トップ単位（6.7）には劣るが OS 来訪の質は高い（yoji トップ自体 OS 率 50%、category ページ OS 率 50〜100%）。category ページへの流入が knowledge・life で各 2 PV あり、四字熟語をカテゴリ別に探すユーザーが存在する。yoji/[yoji] 詳細を移行するならその入口ハブとして移行が必要であり、単独削除は意味をなさない。コンセプト整合は「弱い道具」だが、AP-P11 に従い実測データを優先して移行を選択する。

**`/dictionary/yoji/[yoji]`（詳細）**

400 語中 90 日でアクセスのあった 15 ページで月次 OS PV 4.3。1ページあたり 0.011/月は cycle-161 値（0.005/ページ、30日窓）より高く、`docs/research/2026-03-22-dictionary-seo-value.md` が指摘した「AI 視点の独自例文による SEO 差別化」が一定程度機能している可能性がある（ただし 90日窓と30日窓の差分を考慮すると確定的とは言えない）。明鏡止水・教学相長・自己中心・一期一会・三寒四温など個別語への検索流入が観測されており、特定の四字熟語を調べたいユーザーが来訪している。400 語の移行工数は kanji 2,136 字と比べて現実的であり、1テンプレート変更で対応できる。削除した場合は独自コンテンツの喪失と外部被リンクへの影響が懸念される。

---

### 3-3. cheatsheets・achievements グループ

#### cheatsheets（8 単位）の GA4 データ（2026-01-30〜2026-04-30、90日間）

| ルート名                         | 90 日合計 全体 PV | 月次全体 PV | 90 日合計 OS PV | 月次 OS PV | 備考                                             |
| -------------------------------- | ----------------- | ----------- | --------------- | ---------- | ------------------------------------------------ |
| `/cheatsheets`                   | 12                | 4.0         | 2               | 0.67       | アクティブユーザー 6、平均セッション時間 25.3 秒 |
| `/cheatsheets/cron`              | 0                 | 0           | 0               | 0          | GA4 のレスポンス行に出現せず（= 実質 0 PV）      |
| `/cheatsheets/git`               | 1                 | 0.33        | 1               | 0.33       | アクティブユーザー 1、平均セッション時間 17.1 秒 |
| `/cheatsheets/html-tags`         | 0                 | 0           | 0               | 0          | GA4 のレスポンス行に出現せず（= 実質 0 PV）      |
| `/cheatsheets/http-status-codes` | 1                 | 0.33        | 0               | 0          | アクティブユーザー 1、平均セッション時間 28.8 秒 |
| `/cheatsheets/markdown`          | 1                 | 0.33        | 1               | 0.33       | アクティブユーザー 1、平均セッション時間 12.1 秒 |
| `/cheatsheets/regex`             | 4                 | 1.33        | 0               | 0          | アクティブユーザー 2、平均セッション時間 1.9 秒  |
| `/cheatsheets/sql`               | 0                 | 0           | 0               | 0          | GA4 のレスポンス行に出現せず（= 実質 0 PV）      |

#### achievements の GA4 データ

| ルート名        | 90 日合計 全体 PV | 月次全体 PV | 90 日合計 OS PV | 月次 OS PV | 備考                                                              |
| --------------- | ----------------- | ----------- | --------------- | ---------- | ----------------------------------------------------------------- |
| `/achievements` | 5                 | 1.67        | 4               | 1.33       | アクティブユーザー 3（全体）/ 2（OS）、平均セッション時間 21.1 秒 |

#### 各単位の根拠詳細

**`/cheatsheets`（トップ一覧）**

月次 OS PV 0.67 は極小であり、SEO 価値を示すデータとして意味のある水準ではない。内部リンクハブとして機能しているのは事実（`ToolsListView.tsx` L46、`Footer/index.tsx` L58、`common/Footer.tsx` L28 の 3 箇所からリンク）だが、全サブページが削除される前提ではトップ一覧ページ自体の存在価値が消失する。移行しても現行の参照リファレンス形式では新コンセプト「道具」の価値提供（実際に使えるインタラクティブなツール）を実現できず、デザイン移行コストに見合う来訪者価値を見込めない。

**`/cheatsheets/cron`、`/cheatsheets/html-tags`、`/cheatsheets/sql`**

90 日間で計測可能な PV ゼロ。削除を支持しない方向のデータが一切存在しない。削除が唯一の合理的選択肢。

**`/cheatsheets/git`、`/cheatsheets/markdown`**

OS 流入が 1 件あるが、3 ヶ月で 1 PV は統計的に意味のある水準ではなく、cycle-161 の「約 0 PV」評価から本質的な変化がない。月次 OS PV 0.33 は移行を正当化するデータが存在しないため削除とする。

**`/cheatsheets/http-status-codes`**

全体 PV は 1 件あるが OS 流入ゼロ。サイト内回遊またはダイレクト流入によるものと推定され、外部からの検索需要を示すデータがない。OS 流入ゼロという事実が決定的であり、削除とする。

**`/cheatsheets/regex`**

PV 最多 4 件・OS PV 0 件・平均滞在時間 1.9 秒。1.9 秒の滞在はモバイル離脱・ブラウザバック・読み込み中断などの解釈もあり得るが、いずれの解釈でも「来訪者が価値を見出した滞在」とは言えない。OS 流入が皆無であり、新コンセプトの「道具」適合度も低い（静的リファレンスであり、インタラクティブなツールではない）ため、削除判断が妥当。

**`/achievements`**

OS PV 月次 1.33 はゼロではなく、OS 経由の来訪者が存在するという点は注目すべきデータ。しかし以下の理由から削除が適切と判断する。(1) コンセプト整合ゼロ: `/achievements` は play 系コンテンツ向けのゲーミフィケーション機能を表示するページ。新コンセプト「日常の傍にある道具（と、ちょっとした息抜き）」において、play 系コンテンツ自体が「将来的に整理する」対象（site-concept.md L26）。ゲーミフィケーションの基盤となるコンテンツが整理される以上、achievements ページの独立した存在価値は消失する。(2) 来訪者価値の薄さ: 90 日合計 5 PV（月次 1.67 PV）は極小。OS 流入 4 件も「実績ダッシュボード」という特定のクエリに応じたものと推定されるが、このページが来訪者に提供できる価値はゲーミフィケーション文脈でのみ機能し、独立したページとしての価値はない。(3) cycle-167 L379 の示唆: 「実績システムの位置づけ検討も含む」と書かれているが、同サイクルで「ダッシュボード中心の体験への移行に伴い変更が必要になる可能性がある」とも記されており、独立ページとしての存続を前提にしていない。

**cheatsheets ツール統合の扱い（本サイクルスコープ外）**

cycle-167 L379 で「チートシートについては『道具』として統合する可能性もあり、ダッシュボードのタイル設計との関係も検討する」と示唆されているが、本サイクル（Phase 1.2）ではツール統合の可能性を判断対象に含めない（Phase 1.2 計画書 L192 明記）。将来ツール統合する場合は、既存 cheatsheets ページの移行/削除とは別問題として、新規ツールをゼロから作る形で対応できる。本サイクルで cheatsheets を削除しても、後続サイクルで新規ツールとして起こすことは可能であり、削除判断がツール統合の選択肢を永続的に閉じるものではない。

---

## セクション 4: Phase 8 影響箇所

### 4-1. cheatsheets 削除時の内部リンク影響箇所

cheatsheets 8 単位を削除する場合、以下のファイルで修正が必要：

1. **`src/tools/_components/ToolsListView.tsx` L46**: `/cheatsheets` へのリンク（「チートシート」表示）を削除
2. **`src/components/Footer/index.tsx` L58**: `/cheatsheets` へのリンクエントリを削除
3. **`src/components/common/Footer.tsx` L28**: `/cheatsheets` へのリンクエントリを削除
4. **`src/app/sitemap.ts` L312, L318**: cheatsheets 系 URL を sitemap から削除
5. **`src/lib/search/build-index.ts` L4, L51**: cheatsheets をサーチインデックスから除外
6. **ブログ記事内リンク**: 以下の記事に `/cheatsheets` 系へのリンクが存在し、各記事の扱い（記事削除・リライト・注記追加）を Phase 8 で判断する：
   - `src/blog/content/2026-02-19-cheatsheets-introduction.md`（複数箇所: L83・L87・L91・L99〜L101・L130）― cheatsheets 各ページへの直接リンクを多数含む紹介記事。cheatsheets 削除後は記事ごと削除またはアーカイブ注記が必要。
   - `src/blog/content/2026-03-01-http-status-code-guide-for-rest-api.md`（L51・L312）― L51 で `/cheatsheets/http-status-codes` へのリンク、L312 で `/cheatsheets/http-status-codes` と `/cheatsheets/cron` へのリンクが存在。削除後はリンクを除去またはリライトが必要。
   - `src/blog/content/2026-02-28-url-structure-reorganization.md`（L228）― `/cheatsheets/[slug]` への言及（URL 設計の説明文脈）。リンクではなく記述上の参照のため削除または注記追加で対応可能。
   - `src/blog/content/2026-02-13-content-strategy-decision.md`（L120）― `/blog/cheatsheets-introduction` 経由での言及。
7. **`src/lib/seo.ts`（L7・L383・L394・L405 周辺）**: `CheatsheetMeta` 型の import と、`/cheatsheets/${meta.slug}` を生成する SEO ヘルパ関数（`generateCheatsheetMetadata`・`generateCheatsheetStructuredData`）を削除。
8. **`src/lib/__tests__/seo-cheatsheet.test.ts`**: cheatsheets 向け SEO ヘルパのテストファイル一式。`seo.ts` の該当関数削除と同時にテストも削除する。

**cheatsheets リダイレクト先の検討記録**: 各 cheatsheets ページのリダイレクト先として、関連ツールへの個別リダイレクト（例: `/cheatsheets/regex` → `/tools/regex-tester`）を検討したが、cheatsheets は「静的リファレンス（構文の一覧確認）」であり、ツールは「動的処理（入力を与えて結果を得る）」が主目的のため用途のコンテキストが根本的に異なる。個別リダイレクトは採用しない。リダイレクト先は `/`（トップ）一律とするか、削除として HTTP 410 Gone を返すかは Phase 8（B-338）で確定する。

### 4-2. achievements 削除時の内部リンク影響箇所

achievements を削除する場合、以下のファイルで修正が必要：

1. **`src/components/common/Header.tsx`（L7・L27）**: `StreakBadge` を import しヘッダーに表示。クリックすると `/achievements` へ遷移する（`StreakBadge.tsx` L27 の `href="/achievements"` に依存）。achievements 削除時は StreakBadge をヘッダーから除去するか StreakBadge 自体の意義を再考する必要がある。
2. **`src/app/(new)/layout.tsx`（L8・L9・L35・L40・L47）**: `AchievementProvider` と `StreakBadge` の両方を import・使用。新レイアウト（`(new)` ルートグループ）の根幹部分のため、削除範囲が広い。
3. **`src/app/(legacy)/layout.tsx`（L9・L32・L37）**: `AchievementProvider` を import・使用。既存ページ群全体をラップしているため、削除時はレイアウト全体への影響を確認する必要がある。
4. **`src/app/sitemap.ts`（L24・L216）**: `ACHIEVEMENTS_LAST_MODIFIED` の import と `/achievements` の sitemap エントリ。削除時は両方除去が必要。
5. **`src/lib/trust-levels.ts`**: achievements に関連する定義を含む。Phase 8 で依存関係を精査して削除範囲を確定する。
6. **`src/lib/achievements/` ディレクトリ一式**: `AchievementProvider.tsx`、`AchievementToast.tsx`、`AchievementToast.module.css`、`StreakBadge.tsx`、`StreakBadge.module.css`、`useAchievements.ts`、`engine.ts`、`storage.ts`、`badges.ts`、`types.ts`、`date.ts`、`__tests__/` 配下テスト一式。
7. **`src/app/(legacy)/achievements/` ディレクトリ一式**: `page.tsx`、`_components/` 配下（`StatsSection.tsx`、`DashboardClient.tsx`、`BadgeList.tsx`、`BadgeCard.tsx`、`StreakDisplay.tsx`、`DailyProgress.tsx`）、`__tests__/page.test.tsx`。
8. **`src/components/common/__tests__/Header.test.tsx`**: `StreakBadge` のレンダリングテストが含まれる。StreakBadge 削除時に合わせて修正が必要。
9. **play 系コンポーネントの依存**: `src/play/fortune/_components/DailyFortuneCard.tsx`、ゲーム系 `GameContainer.tsx`（kanji-kanaru・nakamawake・yoji-kimeru）が `useAchievements` を利用。achievements 削除時はこれらからも achievement 呼び出しを除去する必要がある。
10. **`src/components/Footer/index.tsx` L58・`src/components/common/Footer.tsx` L28**: `/achievements` へのフッターリンクを削除。
11. **`src/app/(legacy)/about/page.tsx`**: `/achievements` へのリンクが存在。削除または注記追加が必要。

**特記事項 — StreakBadge の扱い**: StreakBadge は現行の新レイアウトヘッダー（`(new)/layout.tsx` L40）に直接埋め込まれており、クリックで `/achievements` に遷移する設計になっている。achievements ページを完全削除する場合、StreakBadge をヘッダーに残す理由（遷移先がない）がなくなるため、**StreakBadge ごと削除するか別の機能に転換するかの判断を Phase 8 スコープに含める**こと。単に `/achievements` ページだけを消してリンク切れ状態にすることは避けなければならない。

---

## セクション 5: 後続サイクルへの引継ぎ事項

Phase 8（B-338）着手前に確定が必要な事項を以下に記録する。

### 5-1. cheatsheets のツール統合可能性の再判断

cycle-167 L379 で「チートシートについては『道具』として統合する可能性もあり、ダッシュボードのタイル設計との関係も検討する」と示唆されている。本 Phase 1.2 では「移行 or 削除」の 2 択で判断した（移行の観点から削除と判定）が、後続で「cheatsheets ではなく新規ツールとして実装する価値があるか」を別途検討してもよい。具体的には、regex テスター・markdown プレビュー・git チートシートを新機能として実装する価値があるかを、ツール計画（B-316〜B-321 等）の中で検討すること。

### 5-2. cheatsheets リダイレクト方式の確定

各 cheatsheets ページのリダイレクト先は「`/` 一律リダイレクト」か「HTTP 410 Gone」かを Phase 8 着手前に確定する必要がある。本 Phase 1.2 では `/` への一律リダイレクトを暫定案としたが、410 Gone の方が SEO 的には正確な削除意図を伝えられる。判断材料として、外部からの被リンク有無を確認した上で方針を決定すること。

### 5-3. achievements の StreakBadge 残留判断

achievements ページ削除後も StreakBadge をヘッダーに残す場合、遷移先が `/achievements` ではなくなる（別ページへのリンク変更か、クリック機能の無効化が必要）。StreakBadge をヘッダーに残す場合の目的・遷移先の明確化を Phase 8 スコープに含めること。削除が最もシンプルな選択肢だが、ゲーム継続利用のモチベーションとして機能している可能性も考慮する。

### 5-4. kanji リダイレクト先の確定

`/dictionary/kanji` および `/dictionary/kanji/[char]` 削除時のリダイレクト先として、`/dictionary`（辞典トップ）への 301 リダイレクトか HTTP 410 Gone かを Phase 8 で確定する。外部からの被リンクがある場合は /dictionary へのリダイレクトが望ましい。

### 5-5. 着手条件の確認

B-338（Phase 8 実施）の着手条件は「Phase 7（B-314）完了 + 推奨再評価日（2026-05-13）以降」。2026-05-13 以降に新コンセプトのコンテンツが十分な価値を提供していることを GA4 で確認してから実施する。

---

## 参照した既存リサーチ

- `docs/cycles/cycle-161.md` L73-76: カテゴリ別 OS PV 表（漢字辞典 0.002/ページ、四字熟語辞典 0.005/ページ）
- `docs/cycles/cycle-161.md` L87: 「漢字辞典・四字熟語辞典・伝統色辞典: 大手が支配するレッドオーシャン領域で新規ドメインでは戦えない」
- `docs/cycles/cycle-167.md` L52: 「辞典ページ 平均月間 OS PV 0.003/ページ」（cycle-161 分析、30日窓）
- `docs/cycles/cycle-167.md` L379: 「低PV（0.003PV/月/ページ）かつコンセプトとの整合性が低い」、チートシートのツール統合示唆
- `docs/research/2026-03-22-dictionary-seo-value.md`: 四字熟語辞典の SEO 価値分析（AI 視点独自例文の差別化効果）
- `docs/research/2026-03-22-parody-dictionary-analysis.md`: humor 辞典の成功パターン分析
- `docs/research/2026-03-22-yoji-search-user-analysis.md`: 四字熟語検索ユーザーの属性分析
- `docs/site-concept.md`: 新コンセプト「道具」と「息抜き」の定義
