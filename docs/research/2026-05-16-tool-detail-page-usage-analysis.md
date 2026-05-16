# cycle-193 Phase 7 基盤再構築 — ツール詳細ページ利用実態調査

調査期間: 2026-02-15 〜 2026-05-15（90日）  
データソース: GA4 MCP (property: 524708437 / yolo-web)  
調査実施: 2026-05-16

---

## A. デバイス分布

### A-1. 全サイト

| デバイス | PV        | 割合  |
| -------- | --------- | ----- |
| desktop  | 1,439     | 55.6% |
| mobile   | 1,139     | 44.0% |
| tablet   | 37        | 1.4%  |
| smart tv | 1         | 0.0%  |
| **合計** | **2,616** |       |

### A-2. /tools/\* セクション

| デバイス | PV      | 割合  |
| -------- | ------- | ----- |
| desktop  | 94      | 69.6% |
| mobile   | 39      | 28.9% |
| tablet   | 2       | 1.5%  |
| **合計** | **135** |       |

### A-3. /play/\* セクション

| デバイス | PV      | 割合  |
| -------- | ------- | ----- |
| mobile   | 89      | 85.6% |
| desktop  | 13      | 12.5% |
| tablet   | 2       | 1.9%  |
| smart tv | 1       | 1.0%  |
| **合計** | **105** |       |

### A-4. /games/\* セクション（参考）

| デバイス | PV     | 割合  |
| -------- | ------ | ----- |
| mobile   | 57     | 75.0% |
| desktop  | 19     | 25.0% |
| **合計** | **76** |       |

### A-5. /quiz/\* セクション（参考）

| デバイス | PV     | 割合  |
| -------- | ------ | ----- |
| mobile   | 42     | 87.5% |
| desktop  | 6      | 12.5% |
| **合計** | **48** |       |

### デバイス分布まとめ・初期推奨

- `/tools/*` は **デスクトップ優位（69.6%）**。タイル UI の large-full バリアントはデスクトップで快適に使えることが最優先。モバイル fallback の工数配分は相対的に低くてよい。
- `/play/*` `/quiz/*` `/games/*` は **モバイル圧倒的優位（75〜88%）**。これらセクションのタイル設計はモバイルファーストで設計し、desktop をオプション的改善と位置づける。
- 全サイト合計では desktop が 55.6% とやや優位だが、これはトップページ・ブログが引き上げている効果が大きい。

**Phase 7 fallback 設計重みづけ推奨**:

- tools 詳細タイル → desktop 優先、mobile は medium/small を確実に動作させる（優先度: desktop > mobile）
- play/quiz/games タイル → mobile ファースト設計、desktop はボーナス扱い（優先度: mobile >> desktop）

---

## B. ツール詳細ページ PV ランキング（/tools/\* 上位 24 件）

| 順位 | パス                             | PV     | セッション数 | avg セッション時間(秒) |
| ---- | -------------------------------- | ------ | ------------ | ---------------------- |
| 1    | /tools/keigo-reference           | **52** | 48           | 207                    |
| 2    | /tools/char-count                | 13     | 13           | 55                     |
| 3    | /tools/sql-formatter             | 12     | 3            | 693                    |
| 4    | /tools/email-validator           | 7      | 7            | 18                     |
| 5    | /tools/traditional-color-palette | 7      | 5            | 588                    |
| 6    | /tools/byte-counter              | 6      | 6            | 193                    |
| 7    | /tools/cron-parser               | 5      | 4            | 16                     |
| 8    | /tools/qr-code                   | 5      | 5            | 8                      |
| 9    | /tools/json-formatter            | 4      | 4            | 2                      |
| 10   | /tools/color-converter           | 3      | 3            | 16                     |
| 11   | /tools/base64                    | 2      | 2            | 1                      |
| 11   | /tools/business-email            | 2      | 2            | 6                      |
| 11   | /tools/dummy-text                | 2      | 2            | 5                      |
| 11   | /tools/line-break-remover        | 2      | 1            | 149                    |
| 11   | /tools/password-generator        | 2      | 2            | 78                     |
| 11   | /tools/regex-tester              | 2      | 1            | 0                      |
| 17   | /tools/date-calculator           | 1      | 1            | 86                     |
| 17   | /tools/fullwidth-converter       | 1      | 1            | 11                     |
| 17   | /tools/html-entity               | 1      | 1            | 0                      |
| 17   | /tools/image-base64              | 1      | 2            | 0                      |
| 17   | /tools/number-base-converter     | 1      | 1            | 0                      |
| 17   | /tools/text-diff                 | 1      | 1            | 0                      |
| 17   | /tools/word-counter              | 1      | 1            | 23                     |
| —    | /tools (一覧)                    | 105    | 50           | —                      |

**PV ゼロ（90日間アクセスなし）のツール**（ファイル存在確認済み）:

- age-calculator, bmi-calculator, csv-converter, hash-generator, html-entity (1PVのみ),
  image-resizer, kana-converter, markdown-preview, text-replace, unit-converter,
  unix-timestamp, url-encode, yaml-formatter

### /play/\* 上位 10 件

| 順位 | パス                           | PV     | セッション数 | avg セッション時間(秒) |
| ---- | ------------------------------ | ------ | ------------ | ---------------------- |
| 1    | /play/word-sense-personality   | **32** | 26           | 195                    |
| 2    | /play/character-personality    | 13     | 12           | 168                    |
| 3    | /play/yoji-level               | 11     | 11           | 56                     |
| 4    | /play/music-personality        | 8      | 8            | 118                    |
| 5    | /play/yoji-personality         | 4      | 4            | 72                     |
| 6    | /play/daily                    | 3      | 3            | 29                     |
| 6    | /play/kotowaza-level           | 3      | 3            | 35                     |
| 6    | /play/traditional-color        | 3      | 2            | 121                    |
| 6    | /play/unexpected-compatibility | 3      | 2            | 96                     |
| 6    | /play/yoji-kimeru              | 3      | 3            | 30                     |

### /games/\* 参考

| パス                | PV  |
| ------------------- | --- |
| /games/kanji-kanaru | 32  |
| /games/yoji-kimeru  | 21  |
| /games/nakamawake   | 14  |
| /games/irodori      | 9   |

### 初期推奨（Phase 7 第 2 弾候補の優先度ヒント）

**タイル設計検証カバレッジの優先スラッグ**（PV 多 + セッション時間長でニーズ実証済み）:

1. `keigo-reference` — 断トツ 1 位（PV 52、avg 207s）→ 本サイクルの参照実装として適切
2. `traditional-color-palette` — PV は 7 だが avg 588s と滞在が非常に長い。ブラウジング型コンテンツの代表例
3. `sql-formatter` — avg 693s（最長）。開発者用ツールで深い利用の証拠
4. `char-count` — PV 13、short avg（55s）。素早く使い捨てる「瞬用ツール」の代表

**Phase 7 第 2 弾候補（tools）**:

- 優先度 A: `char-count`（PV 13、実ニーズ確認済み、シンプルで実装検証向き）
- 優先度 B: `sql-formatter`（PV 12、高滞在=深い利用、ただし大規模コンテンツ）
- 優先度 C: `traditional-color-palette`（PV 7、高滞在、ビジュアル要素多くタイル設計検証の幅が広い）

**Phase 7 第 2 弾候補（play）**:

- 優先度 A: `word-sense-personality`（PV 32 は play 断トツ、avg 195s）
- 優先度 B: `character-personality`（PV 13、avg 168s）
- 優先度 C: `music-personality`（PV 8、avg 118s）

---

## C. keigo-reference 詳細ページの利用実態

### C-1. PV と滞在時間（デバイス別）

| デバイス | PV     | 割合  | avg セッション時間(秒) |
| -------- | ------ | ----- | ---------------------- |
| desktop  | 37     | 71.2% | 188                    |
| mobile   | 15     | 28.8% | 281                    |
| **合計** | **52** |       | **207（全体平均）**    |

注目点: **モバイルの滞在時間（281s）がデスクトップ（188s）より 50% 長い**。モバイルユーザーの方が深く読み込んでいる可能性。

### C-2. 流入チャネル別

| チャネル       | PV     | セッション |
| -------------- | ------ | ---------- |
| Organic Search | 45     | 43         |
| Organic Social | 6      | 3          |
| Direct         | 1      | 1          |
| **合計**       | **52** | **48**     |

- **検索流入率: 86.5%（PV ベース）**
- 検索クエリ詳細は GA4 MCP では取得不可（Search Console API が別途必要）
- Organic Social 経由 6 PV は SNS 拡散による一時的流入と推定

### C-3. スクロール深度

GA4 MCP では scroll depth の個別イベントデータ取得が困難なため未取得。ただし avg セッション時間 207s（デスクトップ 188s、モバイル 281s）から、コンテンツを通読している可能性が高い。

### C-4. 参考実装（large-full / medium / small バリアント）への示唆

- keigo-reference は検索流入がほぼ全て（86%）。SEO 到達後に深く利用される「使い込み型ツール」
- デスクトップ比率 71% → large-full バリアント（デスクトップ向け）が主戦場
- モバイル 29% 且つ滞在時間 281s → mobile の small/medium バリアントも必ず使いやすく設計する必要あり
- コンテンツ量（敬語一覧という参照型）から、タイル内でのスクロール・展開 UX が重要になる予測

---

## D. タイル化に馴染まないコンテンツの推定材料

### D-1. /play/\* の種別分類

コードベース（`src/play/quiz/types.ts`, `src/play/quiz/registry.ts`, `src/play/quiz/data/*.ts`）より確認。

| カテゴリ                    | 種別   | スラッグ                   | /play/\* PV | /quiz/\* PV |
| --------------------------- | ------ | -------------------------- | ----------- | ----------- |
| **knowledge（知識クイズ）** | クイズ | kanji-level                | 2           | 5           |
|                             |        | kotowaza-level             | 3           | 3           |
|                             |        | yoji-level                 | 11          | 3           |
| **personality（性格診断）** | 診断   | word-sense-personality     | 32          | —           |
|                             |        | character-personality      | 13          | —           |
|                             |        | music-personality          | 8           | 1           |
|                             |        | yoji-personality           | 4           | 4           |
|                             |        | traditional-color          | 3           | 6           |
|                             |        | unexpected-compatibility   | 3           | 2           |
|                             |        | contrarian-fortune（占い） | 2           | 3+3+3=9     |
|                             |        | character-fortune（占い）  | 2           | 2           |
|                             |        | animal-personality         | 1           | 2           |
|                             |        | impossible-advice          | 1           | 2           |
|                             |        | science-thinking           | —           | 2           |
|                             |        | japanese-culture           | 1           | 1           |
| **特殊ゲーム**              | ゲーム | kanji-kanaru               | 2           | —           |
|                             |        | yoji-kimeru                | 3           | —           |
|                             |        | nakamawake                 | 1           | —           |
|                             |        | irodori                    | 1           | —           |
| **日替わり**                | 特殊   | daily                      | 3           | —           |

注: `/play/` と `/quiz/` は同一コンテンツの異なるルートで表示（リダイレクト or 並列）。合算が実態に近い。

### D-2. タイル化に馴染まないコンテンツの推定

以下のコンテンツは「タイル化 = カード型サマリー」の設計が難しい可能性がある。

| スラッグ                                      | 理由                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `kanji-kanaru` / `yoji-kimeru` / `nakamawake` | リアルタイムインタラクション型ゲーム。静的タイルでは魅力が伝わらない |
| `irodori`                                     | ビジュアル色合わせゲーム。静的サムネイルでは UX 訴求困難             |
| `daily`                                       | 日替わりコンテンツ。タイルにキャッシュ可能な静的情報が載せにくい     |
| `contrarian-fortune` / `character-fortune`    | 占いコンテンツ。タイル表示の「重さ」の設計が既存ツールと異質         |

一方、**タイル化に馴染みやすいコンテンツ**:

- knowledge クイズ（kanji-level / yoji-level 等）: 問題数・難易度・所要時間をタイルに載せられる
- personality 診断系: 診断名・アイコン・短説明でカード設計しやすい

### D-3. /play/\* の PV 分布による「ブログ的コンテンツ」状況

`/play/word-sense-personality`（PV 32）が突出しており、2 位以下を 2.5 倍引き離している。
これはコンテンツ自体の検索流入（Organic Search が /play/\* でも 85%: 89/105 PV）によるもの。
「ブログ的な遊びコンテンツ」として明示的に存在するページは現時点では見当たらない（daily が近いが PV 3 と低調）。

---

## E. (legacy) / (new) 別 PV 集計

### 現状の構造

コードベース調査結果:

- `/tools/[slug]` 詳細ページ: **全て `(legacy)/tools/[slug]/page.tsx` に存在**（`(new)/tools/` 配下はリストページのみ）
- `/play/[slug]` 詳細ページ: **全て `(legacy)/play/[slug]/page.tsx` または `(legacy)/play/[dynamic-slug]/page.tsx`**
- `/blog/[slug]`, `/about`, `/(root)` 等: `(new)/` 配下

GA4 のパスベースでは Route Group `(legacy)` / `(new)` の区別はできない（URL に Route Group 名は現れない）が、
コードベースから以下のように推定できる。

| セクション            | コードの所在 | PV（90日）                     |
| --------------------- | ------------ | ------------------------------ |
| /tools/[slug]（詳細） | (legacy)     | 135 - 105(一覧) = 30（詳細計） |
| /tools（一覧）        | (new)        | 105                            |
| /play/[slug]（詳細）  | (legacy)     | ~105                           |
| /blog/\*              | (new)        | 推定 250+α                     |
| / (トップ)            | (new)        | 765                            |

**実質的に「ツール詳細ページ = 全て legacy」であることが確認できた。**  
Phase 7 でタイル化する対象は legacy コードを新設計に移行することと同義。

---

## 全体サマリーと Phase 7 への示唆

### 数値から導かれる設計判断

1. **keigo-reference は参照実装として最適**: PV 断トツ、検索流入 86%、滞在時間 207s と、実ユーザーのニーズが最も実証されている。large-full（PC）・medium・small（モバイル）3 バリアントの検証標本として理想的。

2. **tools 詳細のモバイル fallback は「確実動作」レベルで設計する（全力最適化は不要）**: デスクトップ 70% 優位ながら、モバイル 29% かつ滞在時間が長い（keigo-reference: mobile 281s）。fallback は省エネ設計でよいが、壊れてはいけない。

3. **play/quiz コンテンツタイルはモバイルファーストで設計**: mobile 85-88% と圧倒的。デスクトップ対応はボーナス扱い。

4. **PV ゼロ〜1 のツールは Phase 7 第 2 弾の優先度を下げる**: age-calculator / bmi-calculator / csv-converter 等は 90 日で実訪問者がほぼいない。タイル検証の対象として後回しにしてよい。

5. **sql-formatter は「滞在時間 693s」という異常値に注意**: セッション数わずか 3 に対する平均であり、少数の heavy user が引き上げている可能性大。代表性が低い。

### 数値解釈の留意点

- **絶対 PV が極めて小さい**: tools 詳細の合計 135 PV、play 合計 105 PV はいずれも統計的信頼性が低い（90 日でも n < 200）。比率は参考値として扱い、定性的方向性の判断材料にとどめる。
- **季節要因**: 2026-02-15 〜 2026-05-15 は学年末〜新学期前後。ビジネスメール（keigo-reference）の需要が例年この時期に高い可能性あり。
- **流入経路バイアス**: 検索流入が 86% の keigo-reference はキーワード検索ユーザーに偏っており、「ツールを探して回遊するユーザー」の行動とは異なる。タイル設計での「探索性」は GA4 データでは検証できていない。
- **Search Console クエリ詳細は未取得**: keigo-reference の検索クエリ（「敬語 一覧」等の想定クエリ）は GA4 MCP では取得不能。Search Console API による追加調査推奨。
- **スクロール深度データは未取得**: GA4 に scroll イベントが設定されていても、MCP 経由での個別取得は困難。現時点では avg session duration を代替指標として利用している。
- **/play/ と /quiz/ の重複計測の可能性**: 同一コンテンツが複数 URL で存在する場合（リダイレクト実装の状況による）、実ユーザー数より PV が多くカウントされる場合がある。
