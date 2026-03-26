---
id: 120
description: "B-209 /playページ「まずはここから」のトップページとの役割差別化"
started_at: "2026-03-26T16:35:38+0900"
completed_at: "2026-03-26T17:54:04+0900"
---

# サイクル-120

このサイクルでは、/playページの「まずはここから」セクションがトップページと同一のコンテンツを表示している問題を解決し、/playページ独自の価値を提供できるよう差別化します。

## 実施する作業

- [x] B-209: /playページ「まずはここから」のトップページとの役割差別化

## 作業計画

### 目的

トップページと/playページの「まずはここから」セクションが同一の `FEATURED_SLUGS` を参照しており、まったく同じ3件（animal-personality, kanji-level, character-personality）が表示されている。/playページに到達したユーザーは「何か遊びたいが何をするか決めていない」状態であるため、トップページとは異なる文脈で、/playならではの入口体験を提供する必要がある。

#### 「ゼロから作り直すとしたらどうするか」の検討

現在の/playページの情報設計を根本から見直した。/playページには以下の4つの表示レイヤーがある:

1. ヒーロー「今日のピックアップ」（日替わり1件 -- リピーター向けの「今日来る理由」）
2. カテゴリナビ（4カテゴリへのジャンプ -- 目的が明確なユーザー向け）
3. 「まずはここから」（固定3件 -- 目的が不明確なユーザー向けのキュレーション）
4. カテゴリ別全件一覧（全19件 -- 網羅的に探したいユーザー向け）

問題は(3)と(4)の機能的重複である。(3)の3件は(4)にも含まれるため、同じカードが同じ見た目で2回出現する。ユーザーから見ると「さっき見たカードがまたある」としか映らない。

ゼロから設計するなら、(3)のセクションの存在意義は「なぜこのコンテンツを選ぶべきなのか」の理由付きキュレーションにある。単にカードを並べるのではなく、「おすすめ理由」を一言添えることで、カテゴリ別一覧には無い付加価値を生む。加えて、トップページで既に露出済みのコンテンツではなく、トップページでは埋もれているコンテンツを発掘することで、/playページに来る意味を作る。

具体的には、/playページのおすすめセクションを以下の方針で再設計する:

- セクション見出しを「イチオシ」に変更（初回/リピーター問わず違和感のないネーミング）
- トップページで一切露出していない7件（traditional-color, impossible-advice, contrarian-fortune, unexpected-compatibility, character-fortune, japanese-culture, science-thinking）から3件を厳選し、/playページでしか出会えないコンテンツを配置する
- 各カードに「おすすめ理由」の一言バッジを付与し、カテゴリ別一覧との差別化を図る
- カードデザインをおすすめセクション専用のスタイルにし、視覚的にもカテゴリ別一覧と区別する
- dailyは「今日のピックアップ」と重複するリスクがあるため含めない

### コンテンツ露出状況の分析

全19コンテンツのうち、トップページで何らかのセクションに露出しているのは12件:

- FEATURED_SLUGS（まずはここから）: animal-personality, kanji-level, character-personality
- FortunePreview: daily
- DIAGNOSIS_SLUGS（もっと診断してみよう）: music-personality, yoji-personality, kotowaza-level, yoji-level
- デイリーパズル（game全件）: kanji-kanaru, yoji-kimeru, nakamawake, irodori

トップページに一切露出していない7件:

1. traditional-color（性格診断, 8問）-- 伝統色で性格診断
2. impossible-advice（性格診断, 7問）-- 達成困難アドバイスを診断
3. contrarian-fortune（性格診断, 8問）-- 逆張り運勢タイプを診断
4. unexpected-compatibility（性格診断, 8問）-- 意外な相性を診断
5. character-fortune（性格診断, 8問）-- キャラクター運勢診断
6. japanese-culture（性格診断, 18問）-- 日本文化7タイプ診断
7. science-thinking（知識テスト, 20問）-- 科学的思考力テスト

### /play「イチオシ」に選出する3件とその理由

トップページ未露出の7件から、以下の基準で3件を選出する:

- 手軽さ: 問数が少なく気軽に始められる（7-8問が理想）
- 独自性: コンセプトが際立っていてクリックしたくなる
- カテゴリ多様性: 性格診断に偏りすぎない（ただし未露出7件中6件がpersonalityなので完全回避は困難）

選出:

1. **`contrarian-fortune`**（逆張り運勢, 8問）-- おすすめ理由: 「ひと味違う運勢診断」。categoryは"personality"のため、CTAテキスト「診断する」との整合性を考慮し「占い」ではなく「運勢診断」と表現。タイトルのインパクトが高くCTRが見込める
2. **`unexpected-compatibility`**（意外な相性診断, 8問）-- おすすめ理由: 「友達にシェアしたくなる」。相性診断はSNSシェア率が高いジャンル。8問で手軽
3. **`traditional-color`**（伝統色性格診断, 8問）-- おすすめ理由: 「和の色であなたを表現」。視覚的に美しい結果が得られ、日本文化テーマとしてサイトのブランドに合致。8問で手軽

不採用とした4件の理由:

- impossible-advice: 「達成困難アドバイス」というコンセプトが一見ネガティブに見え、キュレーションの入口としてはクリック率が下がるリスク
- character-fortune: character-personalityとタイトルが似ており混乱しやすい（トップページのFEATURED_SLUGSにcharacter-personalityが含まれている）
- japanese-culture: 18問と多く「手軽さ」が失われる
- science-thinking: 20問と最多で、知識テストカテゴリだがトップページ未露出の知識テストはこれしかなく、問数の多さが入口としてハードルが高い

### 作業内容

#### ステップ1: おすすめ理由付きのデータ構造を定義し、registry.tsに/play専用の定数と関数を追加

対象ファイル: `/mnt/data/yolo-web/src/play/registry.ts`

- 定数定義用のローカル型 `PlayFeaturedItem` を定義する（slug: string と recommendReason: string のペア）。この型は registry.ts 内でのみ使用するためexportしない
- 新しい定数 `PLAY_FEATURED_ITEMS` を追加する。以下の3件:
  - `contrarian-fortune` -- おすすめ理由: 「ひと味違う運勢診断」
  - `unexpected-compatibility` -- おすすめ理由: 「友達にシェアしたくなる」
  - `traditional-color` -- おすすめ理由: 「和の色であなたを表現」
- 新しい関数 `getPlayFeaturedContents()` を追加する。PLAY_FEATURED_ITEMS の各 slug から PlayContentMeta を取得し、`PlayContentMeta & { recommendReason: string }` の交差型で返す。返り値の型は registry.ts 内で `interface PlayFeaturedContent extends PlayContentMeta { recommendReason: string }` として定義しexportする（page.tsx 側でカードの props 型として必要なため。coding-rules.md に従いインターフェースを使用）
- 既存の `FEATURED_SLUGS` と `getFeaturedContents()` はトップページ専用として維持する（変更不要）
- `FEATURED_SLUGS` のコメントに「トップページ専用」であることを明記する

#### ステップ2: /playページのおすすめセクションを再設計

対象ファイル: `/mnt/data/yolo-web/src/app/play/page.tsx`

- import文を `getFeaturedContents` から `getPlayFeaturedContents` に変更
- `featuredContents` の取得元を `getPlayFeaturedContents()` に変更
- セクション見出しを「まずはここから」から「イチオシ」に変更
- 見出しの下にサブテキスト「まだ試していない？厳選おすすめコンテンツ」を追加（なぜこの3件が特別なのかを説明し、/playに来た価値を感じさせる。「トップページ」のような内部用語は避け、ユーザー視点の表現にする）
- 各カードにおすすめ理由バッジを表示する（カードのアイコン上部またはタイトル付近に、理由テキストを小さく表示）
- カードのCTAテキストをカテゴリに応じて変更（fortune→「占う」, personality→「診断する」, knowledge→「挑戦する」, game→「遊ぶ」）。現状は全カード一律「遊ぶ」になっているため改善

#### ステップ3: おすすめセクション専用のカードスタイルを追加

対象ファイル: `/mnt/data/yolo-web/src/app/play/page.module.css`

- おすすめセクションのカードに視覚的な差別化を施す。カテゴリ別一覧の `.card` と区別するために、おすすめセクション専用のカードクラスを追加する
- 具体的な差別化の方向性: おすすめ理由バッジのスタイル（小さいラベル、背景色はアクセントカラーの薄い色）を追加する
- 大幅なデザイン変更は不要で、理由バッジの存在自体が十分な差別化要素となる。カード本体のレイアウトは既存の `.card` を基本とし、理由バッジ関連のスタイルのみ追加する

#### ステップ4: テストの更新

対象ファイル: `/mnt/data/yolo-web/src/play/__tests__/registry.test.ts`

- `PLAY_FEATURED_ITEMS` のテストを追加: 3件であること、全slugがレジストリに存在すること、トップページの FEATURED_SLUGS / DIAGNOSIS_SLUGS と重複がないことを検証
- `getPlayFeaturedContents()` のテストを追加: 返却される配列が3件であること、各要素にrecommendReasonが存在すること

対象ファイル: `/mnt/data/yolo-web/src/app/play/__tests__/page.test.tsx`

- 「まずはここから」関連のテスト（L232-L274付近）を更新:
  - 見出しテキストを「イチオシ」に変更
  - featured cardの件数を3件のまま維持（件数は変わらないが、中身が完全に入れ替わる）
  - サブテキストの存在を検証するテストを追加
  - おすすめ理由バッジが表示されていることを検証するテストを追加

#### ステップ5: 品質確認

- `npm run lint && npm run format:check && npm run test && npm run build` を実行して全パスを確認

### 検討した他の選択肢と判断理由

#### 選択肢A: 4カテゴリ各1件選出（前回計画、不採用）

前回の計画では4カテゴリから各1件ずつ選出する方式だった。しかし:

- fortuneカテゴリはdailyの1件しかなく、「今日のピックアップ」と5日に1回重複する問題が解決できない
- animal-personality, kanji-levelがトップページと重複していた
- 「カテゴリ代表を1つずつ」という縛りが、最適なコンテンツ選定を妨げていた

#### 選択肢B: 「まずはここから」セクション自体の削除（不採用）

カテゴリ別セクションが既にあるため不要という考え方。しかし「何をしようか決めていない」ユーザーにとって全19件の一覧は選択肢過多。厳選された少数のキュレーションは意思決定コストを下げるために必要。

#### 選択肢C: 日替わりローテーション方式（不採用）

日替わりでおすすめを変えるアプローチ。リピーターには新鮮だが、「今日のピックアップ」が既にこの役割を担っている。2つの日替わりセクションは冗長。

#### 選択肢D: トップページの DIAGNOSIS_SLUGS とも重複しない完全ユニーク3件 + おすすめ理由付与（採用）

トップページのすべてのセクション（FEATURED_SLUGS, FortunePreview, DIAGNOSIS_SLUGS, gameセクション）で露出していないコンテンツのみを選出する。これにより:

- トップページから/playに遷移したユーザーが「見たことのないコンテンツがある」と感じる（新鮮さの提供）
- トップページでは埋もれていた良質なコンテンツに光を当てる（/playページの独自価値）
- おすすめ理由の一言を添えることで、カテゴリ別一覧の同じカードとの差別化が生まれる（キュレーションとしての付加価値）
- dailyを含めないため「今日のピックアップ」との重複問題が完全に解消される

### レビュー指摘への対応まとめ

| 指摘                                                    | 対応                                                                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘1: dailyが「今日のピックアップ」と重複              | dailyを含めない。おすすめ3件はすべてpersonalityカテゴリのクイズ系コンテンツ                                                              |
| 指摘2: トップページとの重複                             | FEATURED_SLUGS, DIAGNOSIS_SLUGS, FortunePreview, gameセクションのいずれとも重複しない3件を選出                                           |
| 指摘3: 「はじめてならこれ」がリピーターに不適切         | 「イチオシ」に変更。初回/リピーター問わず自然なネーミング                                                                                |
| 指摘4: セクション役割の根本的再検討                     | おすすめ理由バッジの付与により、カテゴリ別一覧との機能的差別化を実現。セクションの存在意義を「理由付きキュレーション」として再定義       |
| 指摘5: カテゴリ別CTAの改善は将来課題                    | 認識済み。今回はおすすめセクションのCTAのみ改善。カテゴリ別セクションのCTA改善はキャリーオーバーとして記録                               |
| R2-指摘1: contrarian-fortuneのおすすめ理由とCTAの不整合 | 確認済み。おすすめ理由を「ひと味違う運勢診断」とし、CTA「診断する」と整合。「占い」表現を避けることでcategory: personalityとの齟齬を解消 |
| R2-指摘2: サブテキストの表現                            | 確認済み。「まだ試していない？厳選おすすめコンテンツ」に修正済み。内部用語を排除しユーザー視点の表現に変更済み                           |
| R2-指摘3: getPlayFeaturedContents()の返り値の型が曖昧   | 型設計を具体化。`interface PlayFeaturedContent extends PlayContentMeta { recommendReason: string }` を定義しexportする方針を計画に明記   |

### 計画にあたって参考にした情報

- `/mnt/data/yolo-web/src/play/registry.ts` -- FEATURED_SLUGS, DAILY_UPDATE_SLUGS, DAILY_PICKUP_SLUGS, DIAGNOSIS_SLUGS の定義と getFeaturedContents() の実装パターン。allPlayContents の全19件の構成
- `/mnt/data/yolo-web/src/app/play/page.tsx` -- /playページの現在のセクション構成（ヒーロー、カテゴリナビ、まずはここから、カテゴリ別一覧）。DAILY_PICKUP_SLUGS の定義とローテーションロジック（dayOfYear % 5）
- `/mnt/data/yolo-web/src/app/page.tsx` -- トップページの全セクション構成: FEATURED_SLUGS（まずはここから3件）、FortunePreview（daily）、DIAGNOSIS_SLUGS（もっと診断4件）、gameセクション（全4件）。合計12件がトップに露出。カテゴリ別CTAテキストの実装パターン
- `/mnt/data/yolo-web/src/app/play/page.module.css` -- 現在のカードスタイル（.card, .featuredGrid）。おすすめセクションとカテゴリ別セクションが同じ .card クラスを共有している現状
- `/mnt/data/yolo-web/src/play/types.ts` -- PlayContentMeta インターフェース定義。recommendReason フィールドは現在存在しないため、拡張型または別型が必要
- `/mnt/data/yolo-web/src/play/quiz/data/` 配下の各クイズデータ -- 未露出7件の shortDescription と questionCount を確認し、手軽さとコンセプトの独自性を評価
- `/mnt/data/yolo-web/src/app/play/__tests__/page.test.tsx` -- 既存のfeaturedセクションテスト（件数3件、見出し「まずはここから」の検証箇所）
- `/mnt/data/yolo-web/src/play/__tests__/registry.test.ts` -- registryのテストパターン
- `/mnt/data/yolo-web/.claude/rules/coding-rules.md` -- 静的最優先、型安全の徹底、可読性のルール
- `/mnt/data/yolo-web/.claude/rules/testing.md` -- テストファイルの命名規約と配置ルール

## レビュー結果

### 計画レビュー R1（2026-03-26）

#### 指摘1【重要】dailyが「今日のピックアップ」と同一ページ内で重複する

PLAY_FEATURED_SLUGSに`daily`を含める計画だが、/playページのヒーローセクション「今日のピックアップ」はDAILY_PICKUP_SLUGSからdayOfYear % 5でローテーションしており、5日に1回は`daily`が選出される。その日は同一ページ内の「今日のピックアップ」と「はじめてならこれ」の両方にdailyが表示され、明らかな重複になる。

占いカテゴリはdailyの1件しかないため代表作としてdailyを選ぶ理由は理解できるが、「今日のピックアップ」との重複を回避する仕組みが計画に含まれていない。以下のいずれかの対応が必要:

- (A) 「はじめてならこれ」でdailyを表示する場合、「今日のピックアップ」がdailyと被る日は「今日のピックアップ」側のdailyをスキップして次のスラグを使うロジックを追加する
- (B) 「はじめてならこれ」にdailyを含めず、占いカテゴリの代表はこのセクションでは提示しない（3カテゴリ3件にする）
- (C) そもそも「はじめてならこれ」セクションの役割自体を再検討する（後述の指摘4を参照）

#### 指摘2【重要】animal-personalityとkanji-levelがトップページのFEATURED_SLUGSと重複しており差別化が不十分

計画の目的は「トップページとの差別化」だが、PLAY_FEATURED_SLUGSの4件中2件（animal-personality, kanji-level）はトップページのFEATURED_SLUGSにも含まれている。計画書には「dailyとkanji-kanaruはトップのFEATURED_SLUGSに含まれない」と書かれているが、裏を返せば半分は重複している。

トップページから/playに遷移してきたユーザーは、「まずはここから」で見たanimal-personalityとkanji-levelを再び目にすることになる。見出しとサブテキストを変えたとしても、同じコンテンツが並んでいれば「同じものがある」という印象は避けられない。

差別化を目的とするなら、トップページのFEATURED_SLUGSとの重複をゼロにすべき。例えば:

- personality: music-personality または yoji-personality（トップで未露出のもの）
- knowledge: kotowaza-level または yoji-level（トップで未露出のもの）

#### 指摘3【重要】「はじめてならこれ」というネーミングがリピーターに不適切

/playページに来るユーザーの多くはリピーターになりうる（特にデイリー更新コンテンツがあるため）。毎回「はじめてならこれ」が表示されるのはリピーターにとって違和感がある。「まずはここから」も同様の問題があるが、「はじめてならこれ」はさらに初回限定感が強い。

このセクションの役割を「初心者向けの固定おすすめ」に限定するのか、「すべてのユーザーにとって有用なキュレーション」にするのかを明確にし、ネーミングをそれに合わせるべき。

例えば:

- 「おすすめコンテンツ」（シンプルで誰にでも適用可能）
- 「ジャンル別おすすめ」（4カテゴリ各1件という選定基準と合致）
- 「スタッフのおすすめ」「編集部のイチオシ」的なニュアンス（キュレーション感を出す）

#### 指摘4【中】「ゼロから作り直すとしたら」の観点が不足 -- セクションの役割の根本的再検討

ownerから「ゼロから作り直すとしたらどうするか？」というフィードバックがあるが、計画は「表示するアイテムとラベルを変える」というインクリメンタルな改善にとどまっている。

/playページの現在の構成を見ると:

1. ヒーロー（「今日のピックアップ」1件）
2. カテゴリナビ（4カテゴリへのアンカーリンク）
3. 「まずはここから」（3件 → 計画では4件）
4. カテゴリ別セクション（全19件を4カテゴリで表示）

ここで根本的に考えるべきは、(3)おすすめ固定4件と(4)カテゴリ別全件表示の間にある機能的な重複である。(3)の4件は(4)にも必ず含まれるので、ユーザーは同じコンテンツを2回見ることになる。

ゼロから設計するなら、例えば以下のようなアプローチが考えられる:

- (3)のカードに「なぜおすすめなのか」の一言理由を付与する（例: 「一番人気」「毎日新問題」「手軽に3分」など）。単に同じカードを並べるだけでなく、キュレーションとしての付加価値を持たせる。これにより(4)のカテゴリ別一覧との差別化が生まれる
- (3)を視覚的にも(4)と異なるカードデザインにする（現状は同じcardスタイル）。おすすめセクションとしての特別感を出す

この点は計画の根本方針に関わるため、plannerが再検討すべき。ただし、スコープが過度に広がるリスクもあるので、「おすすめ理由の一言付与」など、追加実装コストが小さく効果が大きいものに絞って検討するのがよい。

#### 指摘5【低】CTAテキストのカテゴリ別変更は良い改善だが、補足事項あり

計画書に「現状は全カード一律『遊ぶ』になっているため改善」と記載があるが、これはplay/page.tsxのfeaturedセクション（L206）については正しい。一方、play/page.tsxのカテゴリ別セクション（L278付近）のCTAも同様に一律「遊ぶ」のままである。今回のスコープ外だが、将来的な改善候補として認識しておくべき。

#### 総合判定: 差し戻し -- 計画の修正が必要

指摘1（daily重複）と指摘2（トップページとの半数重複）は、この計画の目的である「トップページとの差別化」を損なう実装上の問題であり、修正が必須。指摘3（ネーミング）も合わせて、plannerが再検討した上で計画を修正すべき。指摘4（根本的再検討）は、計画の方向性自体を変える可能性があるため、少なくとも検討した結果を計画書に明記してほしい。

### 計画レビュー R2（2026-03-26）

#### R1指摘への対応確認

- 指摘1（daily重複）: 解消済み。dailyを含めない方針に変更し、「今日のピックアップ」との重複が完全に排除されている。
- 指摘2（トップページとの重複）: 解消済み。トップページの全セクション（FEATURED_SLUGS, FortunePreview, DIAGNOSIS_SLUGS, game全件）で露出していない7件から3件を選出する方針に変更された。コンテンツ露出状況の分析も正確である。
- 指摘3（ネーミング）: 解消済み。「イチオシ」は初回・リピーター問わず自然で適切。
- 指摘4（セクション役割の根本的再検討）: 解消済み。「ゼロから作り直すとしたらどうするか」の検討セクションが追加され、おすすめ理由バッジによるキュレーションとしての再定義が明確に記述されている。検討の論理展開も納得できる。
- 指摘5（カテゴリ別CTA）: 認識済み。キャリーオーバーとして記録する方針で妥当。

#### 指摘1【中】contrarian-fortuneのおすすめ理由「ひと味違う占い」とCTAテキスト「診断する」の不整合

contrarian-fortune は slug に "fortune" を含みコンセプトも「占い」の逆張りだが、registry上の category は "personality" である（`src/play/quiz/data/contrarian-fortune.ts` L29: `category: "personality"`）。計画ステップ2のCTAテキスト変更ルール（fortune→「占う」, personality→「診断する」）に従うと、このカードのCTAは「診断する」になる。

一方で、おすすめ理由バッジには「ひと味違う占い」と書かれている。バッジで「占い」と銘打っておきながらCTAが「診断する」では、ユーザーに微妙な違和感を与える。

対応案:

- (A) おすすめ理由を「ひと味違う運勢診断」に修正する（categoryの実態に合わせる）
- (B) CTAテキストはcategory準拠のまま、おすすめ理由の表現だけ「占い」を避ける形に調整する

どちらでもよいが、バッジとCTAの間でユーザーが受ける印象が一貫するようにすること。

#### 指摘2【低】サブテキスト「トップページでは紹介しきれなかった隠れた名作を厳選」の表現について

このサブテキストは「トップページ」というサイト内部の構造用語をユーザーに見せている。一般的なWebサイト利用者は「トップページ」がどこを指すか理解できるが、「トップページでは紹介しきれなかった」という表現は、やや内部事情の説明に聞こえる。また「隠れた名作」は19件中の3件に対しては少し大げさな印象もある。

対応案: 「まだ試していない？ 厳選おすすめコンテンツ」「埋もれた名作を厳選しました」など、ユーザー視点の表現に調整する。ただしこの点は軽微であり、builderの裁量で微調整してもよい。

#### 指摘3【低】`getPlayFeaturedContents()` の返り値の型について、計画の記述にやや曖昧さがある

ステップ1で「PlayContentMeta を拡張した型（recommendReason付き）を定義する。型の具体的な設計は実装者に委ねる」とある。coding-rules.md には「型安全の徹底」「`any`の使用を避け、適切な型を定義する」とあるため、builderに型設計を完全に委ねると判断が分かれる可能性がある。

具体的には、以下のどちらかを計画で明示しておくとよい:

- (A) `PlayContentMeta & { recommendReason: string }` という交差型を返す
- (B) `PlayFeaturedContentMeta` のような新しいインターフェースをtypes.tsに定義する

ただし、現時点の記述でも「slug + おすすめ理由のペアが管理でき、カードに理由を表示できること」という要件は明確なので、builderが大きく迷うことはないと判断する。

#### 計画全体の評価

コンテンツ選定の妥当性: 選出された3件（contrarian-fortune, unexpected-compatibility, traditional-color）はいずれも8問で手軽、コンセプトに独自性があり、ターゲットユーザー（手軽で面白い占い・診断を楽しみたい人）にとって魅力的な選定になっている。不採用理由も合理的で、特にcharacter-fortuneをcharacter-personalityとの混同回避で外した判断は適切。

おすすめ理由の品質: 「友達にシェアしたくなる」と「和の色であなたを表現」は具体的でクリックを誘う良いコピー。「ひと味違う占い」は指摘1の不整合を解消すれば問題ない。

情報設計の整合性: 4つの表示レイヤーの役割分析が的確で、各セクションの存在意義が明確に定義されている。検討した代替案（A〜D）の比較も論理的。

実装の具体性: 5ステップの作業内容は対象ファイル・変更内容・テスト項目がすべて具体的に記述されており、builderが迷わずに作業を進められる水準。

#### 総合判定: 承認（条件付き）

指摘1【中】（おすすめ理由とCTAの不整合）は実装時に解消すること。指摘2・3【低】はbuilderの裁量で対応可能な範囲であり、計画の差し戻しは不要。修正版計画は前回の全指摘に対して適切に対応しており、「ゼロから作り直すとしたら」の観点も十分に反映されている。builderは指摘1を踏まえた上で実装に着手してよい。

### 計画レビュー R3（2026-03-26）

#### R2指摘への対応確認

- R2-指摘1【中】（contrarian-fortuneのおすすめ理由とCTAの不整合）: 解消済み。おすすめ理由が「ひと味違う運勢診断」に修正されており、category: personalityに基づくCTA「診断する」と整合している。「占い」という表現が排除され、ユーザーが受ける印象の一貫性が確保されている。
- R2-指摘2【低】（サブテキストの内部用語）: 解消済み。「まだ試していない？厳選おすすめコンテンツ」に変更されており、「トップページ」という内部用語が排除されている。ユーザー視点の自然な表現になっている。
- R2-指摘3【低】（返り値の型が曖昧）: 解消済み。`interface PlayFeaturedContent extends PlayContentMeta { recommendReason: string }` をregistry.ts内で定義しexportする方針が明記されている。coding-rules.mdのインターフェース優先ルールにも準拠しており、builderが迷う余地がない。

#### 計画全体の再確認

コンテンツ選定、情報設計、実装手順、テスト計画のすべてを改めて確認した。

- コンテンツ選定: トップページ未露出7件からの3件選出（contrarian-fortune, unexpected-compatibility, traditional-color）は、手軽さ・独自性・クリック訴求の観点で妥当。不採用4件の理由も合理的。
- 情報設計: 4つの表示レイヤーの役割分析が明確で、おすすめセクションの存在意義が「理由付きキュレーション」として再定義されている。カテゴリ別一覧との機能的重複の問題に対して適切な解決策が示されている。
- 実装手順: 5ステップすべてで対象ファイル・変更内容が具体的に記述されている。特にステップ1の型設計（PlayFeaturedItem非公開 / PlayFeaturedContent公開の使い分け）とステップ4のテスト項目が十分に具体的。
- 既存コードとの整合性: FEATURED_SLUGSとgetFeaturedContents()をトップページ専用として維持する方針は、既存のトップページ実装に影響を与えず安全。
- レビュー指摘への対応まとめ表: R1の5件とR2の3件すべてが正確に記録・対応されている。

#### 総合判定: 承認（指摘事項なし。レビュー通過。）

R2の全指摘が適切に解消されており、計画全体にも新たな問題は見つからなかった。builderは本計画に基づいて実装に着手してよい。

### 実装レビュー R3（計画整合性）

#### R2指摘への対応確認

- R2-指摘1【重要】（`npm run format:check` 失敗）: 解消済み。PMの報告通り、prettier適用済みでフォーマットチェックが通過している。
- R2-指摘2【低】（FEATURED_SLUGS / getFeaturedContents() のコメントに古い記述）: 解消済み。`registry.ts` L96のFEATURED_SLUGSコメントが「トップページのみで使用される定数（/play ページは getPlayFeaturedContents() を使用）。」に修正されている。L139のgetFeaturedContents()コメントも同様に「トップページのみで使用される関数（/play ページは getPlayFeaturedContents() を使用）。」に修正されている。

#### 品質確認（lint / format / test）

PMの報告通り `npm run lint && npm run format:check && npm run test` がすべて通過済み（2694テストパス）。

#### 計画との整合性確認

各ステップの実装を計画（作業計画セクション）と照合した結果:

- **ステップ1（registry.ts）**: 計画通り。PlayFeaturedItem（非公開）、PlayFeaturedContent（公開インターフェース）、PLAY_FEATURED_ITEMS（3件）、getPlayFeaturedContents() がすべて計画に記載された通りに実装されている。FEATURED_SLUGS / getFeaturedContents() のコメントも「トップページのみで使用」に修正済み。
- **ステップ2（page.tsx）**: 計画通り。import変更、getPlayFeaturedContents()への切り替え、「イチオシ」見出し、おすすめ理由バッジ表示、カテゴリ別CTAテキスト（getCtaText関数）がすべて実装されている。サブテキストは計画書の対応まとめ表では「まだ試していない？厳選おすすめコンテンツ」と記載されているが、実装は「迷ったらここから！厳選おすすめコンテンツ」になっている。ただし、これは実装側の表現がより適切であると判断する（「迷ったらここから」は/playページに来た目的未定のユーザーへの導線として自然で、リピーターにも違和感がない）。テストもこの表現で通過しているため問題なし。
- **ステップ3（page.module.css）**: 計画通り。.recommendBadge のスタイル（accentColor連動の薄い背景色、小さいラベル）が追加されている。ダークモード対応（.recommendBadge の色補正）も品質向上のために追加されており良い判断。
- **ステップ4（テスト）**: 計画通り。registry.test.ts にPLAY_FEATURED_ITEMS（3件、各slug・recommendReason検証）、getPlayFeaturedContents()（3件、recommendReasonフィールド検証）、トップページ定数との重複なしテストが追加されている。page.test.tsx に「イチオシ」見出し、サブテキスト、3件カード、おすすめ理由バッジ表示テストが追加されている。
- **ステップ5（品質確認）**: 通過済み。

#### コーディング規約・テスト戦略の準拠確認

- 型安全: PlayFeaturedContentはインターフェースで定義されexportされており、coding-rules.md（インターフェース優先、型安全の徹底）に準拠。anyの使用なし。
- 可読性: 各定数・関数にJSDocコメントで「なぜ」を説明しており、マジックナンバーもない。
- テスト配置: `__tests__/` ディレクトリ内にtesting.mdの命名規約通りに配置されている。
- テスト内容: データ変換ロジック、コンポーネントレンダリング、エッジケース（重複チェック）をカバーしている。

#### 総合判定: 指摘事項なし。レビュー通過。

R2の2件の指摘は適切に解消されている。計画の5ステップすべてが正確に実装されており、コーディング規約・テスト戦略にも違反がない。サブテキストの文言が計画書の対応まとめ表と微妙に異なるが（「まだ試していない？」→「迷ったらここから！」）、実装の方がUX的に優れた表現であり、テストも通過しているため問題として扱わない。

## キャリーオーバー

なし（当初キャリーオーバー予定だったカテゴリ別一覧のCTA統一も本スコープ内で対応済み）

## 補足事項

なし

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

### 実装レビュー R1（計画整合性）

#### ステップ別の計画整合性確認

**ステップ1（registry.ts）: 合格**

- PlayFeaturedItem インターフェースが registry.ts 内にローカル定義されており、export されていない。計画通り。
- PlayFeaturedContent インターフェースが `extends PlayContentMeta` で定義され、export されている。coding-rules.md のインターフェース優先ルールにも準拠。計画通り。
- PLAY_FEATURED_ITEMS の3件（contrarian-fortune, unexpected-compatibility, traditional-color）と各おすすめ理由が計画と完全に一致。
- getPlayFeaturedContents() が PlayFeaturedContent[] を返す関数として正しく実装されている。flatMap パターンは既存の getFeaturedContents() / getDiagnosisContents() と一貫している。
- FEATURED_SLUGS のコメントに「トップページ専用」が明記されている（L92: `トップページ専用 —`）。計画通り。
- 既存の FEATURED_SLUGS / getFeaturedContents() は変更なく維持されている。計画通り。

**ステップ2（page.tsx）: 指摘あり（後述）**

- import文に getPlayFeaturedContents が追加されている。計画通り。
- featuredContents の取得元が getPlayFeaturedContents() に変更されている（L118）。計画通り。
- セクション見出しが「イチオシ」に変更されている（L183）。計画通り。
- サブテキスト「まだ試していない？厳選おすすめコンテンツ」が追加されている（L185）。計画通り。
- おすすめ理由バッジが recommendBadge クラスでカード上部に表示されている（L208-L209）。計画通り。
- CTAテキストがカテゴリに応じて変更される getCtaText 関数が実装されている（L87-L100）。計画通り。

**ステップ3（page.module.css）: 合格**

- .recommendBadge スタイルが追加されている（L319-L340）。accentColor の薄い背景色を使用し、カテゴリ別一覧の .card と視覚的に差別化されている。計画通り。
- ダークモードでの recommendBadge の視認性補正も適切（L450-L452）。

**ステップ4（テスト）: 指摘あり（後述）**

- registry.test.ts に PLAY_FEATURED_ITEMS と getPlayFeaturedContents のテストが追加されている。3件であること、各slugの存在、recommendReason の値が検証されている。
- page.test.tsx に「イチオシ」見出し、サブテキスト、3件のカード、おすすめ理由バッジの表示テストが追加されている。

#### 指摘1【重要】getFeaturedContents の未使用インポートが残存

ファイル: `/mnt/data/yolo-web/src/app/play/page.tsx` L9

getFeaturedContents が import されているが、コンポーネント内で一切使用されていない。ESLint が `@typescript-eslint/no-unused-vars` warning を出力している。計画ステップ2には「import文を getFeaturedContents から getPlayFeaturedContents に変更」とあるが、実際には getFeaturedContents が削除されず残っている。

このまま放置すると `npm run lint` でwarningが出力され、サイクル終了チェックリストの品質確認に影響する可能性がある。getFeaturedContents の import を削除すること。

#### 指摘2【中】PLAY_FEATURED_ITEMS と FEATURED_SLUGS / DIAGNOSIS_SLUGS の重複がないことを検証するテストが欠落

計画ステップ4には「トップページの FEATURED_SLUGS / DIAGNOSIS_SLUGS と重複がないことを検証」と明記されているが、registry.test.ts にこのテストが存在しない。PLAY_FEATURED_ITEMS の3件がトップページのどのセクションとも重複しないことは本タスクの核心的な要件であり、テストで保証されるべき。

以下のようなテストを追加すること:

- PLAY_FEATURED_ITEMS の各 slug が FEATURED_SLUGS に含まれないこと
- PLAY_FEATURED_ITEMS の各 slug が DIAGNOSIS_SLUGS に含まれないこと

#### 指摘3【中】featuredGrid のグリッド列数が4列だが、表示コンテンツは3件

ファイル: `/mnt/data/yolo-web/src/app/play/page.module.css` L239

`.featuredGrid` の `grid-template-columns: repeat(4, 1fr)` は4列グリッドだが、PLAY_FEATURED_ITEMS は3件しかない。4列グリッドに3アイテムを配置すると、右端に空セルが1つ残り、視覚的にアンバランスになる。

これはおそらく以前の DIAGNOSIS_SLUGS（4件）用の設定が残っているものと考えられる。`repeat(3, 1fr)` に変更するか、`repeat(auto-fit, minmax(250px, 1fr))` のようなレスポンシブ指定にすべき。

#### 型安全の確認: 合格

- PlayFeaturedItem は slug と recommendReason の2フィールドのみで最小限。適切。
- PlayFeaturedContent は PlayContentMeta を extends しており、recommendReason フィールドを追加。coding-rules.md のインターフェース優先ルールに準拠。
- page.tsx 側で `content: PlayFeaturedContent` の型注釈が使用されている（L192）。型安全が確保されている。

#### 既存コードとの一貫性: 合格

- getPlayFeaturedContents() は既存の getFeaturedContents() / getDiagnosisContents() と同じ flatMap パターンを使用しており一貫性がある。
- PLAY_FEATURED_ITEMS は既存の FEATURED_SLUGS / DIAGNOSIS_SLUGS と同様の ReadonlyArray 定数として定義されている。
- テストの記述パターンも既存の describe/test 構造と一貫している。

#### コーディング規約の確認: 指摘1を除き合格

- 静的最優先: 全て静的/ビルド時生成。適切。
- 可読性: コメントが適切に付与されている。PlayFeaturedItem の非公開理由、PLAY_FEATURED_ITEMS の選定基準がコメントで説明されている。
- マジックナンバー: なし。
- 命名: getPlayFeaturedContents は意図が明確。PlayFeaturedContent / PlayFeaturedItem の命名も既存パターンと整合。

#### テスト戦略の確認: 指摘2を除き合格

- テストファイルの配置と命名規約に準拠（`__tests__/` ディレクトリ内に `*.test.ts(x)` パターン）。
- registry.test.ts: データ構造と変換関数のテストとして適切。各フィールドの値を具体的に検証している。
- page.test.tsx: コンポーネントのレンダリングと基本動作のテストとして適切。IntersectionObserver のモックも正しく実装されている。

#### 総合判定: 差し戻し -- 修正が必要

指摘1（未使用インポート）はlint warningを発生させる実装上の問題であり修正必須。指摘2（重複検証テストの欠落）は計画で明示された要件の未実装であり追加が必要。指摘3（グリッド列数）は3件表示に対して4列グリッドが不整合であり修正が必要。builderはこれら3点を修正した上で再度レビューを依頼すること。

### 実装レビュー R2（計画整合性）

#### R1指摘への対応確認

- R1-指摘1【重要】（getFeaturedContentsの未使用import残存）: 解消済み。page.tsx のimport文が `getFeaturedContents` から `getPlayFeaturedContents` に正しく変更されている。`getFeaturedContents` はファイル内に一切残っていない。
- R1-指摘2【中】（FEATURED_SLUGS/DIAGNOSIS_SLUGSとの重複不在テスト欠落）: 解消済み。registry.test.ts L497-509に「PLAY_FEATURED_ITEMS -- トップページの FEATURED_SLUGS/DIAGNOSIS_SLUGS との重複なし」テストブロックが追加され、各slugがFEATURED_SLUGSにもDIAGNOSIS_SLUGSにも含まれないことが検証されている。
- R1-指摘3【中】（featuredGrid 4列→3列）: 解消済み。page.module.css L242が `repeat(3, 1fr)` に変更されている。

#### 追加修正の確認

- カテゴリ別一覧セクションのCTAに `getCtaText(content.category)` を使用: page.tsx L309で確認。カテゴリ別一覧のCTAも「遊ぶ」固定ではなくカテゴリに応じたテキストに変更されている。計画ステップ2の「指摘5: カテゴリ別CTAの改善は将来課題」をキャリーオーバーではなく同時に解消した形で、ページ内のCTA不一致が解消されている。良い改善。
- ダークモードのバッジコントラスト改善（白混合率60%）: page.module.css L452で確認。`color-mix(in srgb, var(--play-accent) 60%, #ffffff)` によりダークモードでの文字視認性が確保されている。
- モバイルで1列レイアウト: page.module.css L485-488で確認。`@media (max-width: 640px)` 内で `.featuredGrid { grid-template-columns: 1fr }` となっており、モバイルでカード内容を省略せず読める設計になっている。
- 「イチオシ」見出しにプライマリカラーのborder-bottom: page.module.css L229で確認。`border-bottom: 2px solid var(--color-primary)` が設定されており、カテゴリ見出し（L270: `var(--color-border)`）との視覚的差別化が実現されている。
- サブテキスト変更: page.tsx L184で「迷ったらここから！厳選おすすめコンテンツ」に変更されている。計画R2指摘で「まだ試していない？厳選おすすめコンテンツ」とされていたが、今回さらに変更された。「迷ったらここから！」は初回・リピーター問わず自然で、ユーザーの心理状態（何をするか決めていない）にも合致しており適切。

#### 計画ステップ別の整合性確認

**ステップ1（registry.ts）: 合格**

- PlayFeaturedItem: 非export、slugとrecommendReasonの2フィールド。計画通り。
- PlayFeaturedContent: `extends PlayContentMeta` でexport。coding-rules.mdのインターフェース優先ルールに準拠。計画通り。
- PLAY_FEATURED_ITEMS: 3件（contrarian-fortune, unexpected-compatibility, traditional-color）と各おすすめ理由が計画と完全一致。
- getPlayFeaturedContents(): PlayFeaturedContent[]を返す。flatMapパターンで既存関数と一貫。計画通り。
- FEATURED_SLUGSのコメント: L92に「トップページ専用」が明記されている。計画通り。

**ステップ2（page.tsx）: 合格**

- import変更: getPlayFeaturedContents + PlayFeaturedContent型。計画通り。
- featuredContents取得元: getPlayFeaturedContents()。計画通り。
- 見出し「イチオシ」: L181。計画通り。
- サブテキスト: L184。計画の意図に沿った表現に変更されている。
- おすすめ理由バッジ: L207-209。recommendBadgeクラスで表示。計画通り。
- CTAテキスト: getCtaText関数（L86-99）でカテゴリ別に返す。計画通り。

**ステップ3（page.module.css）: 合格**

- .recommendBadge: L324-341。accentColorの薄い背景色（12%透明度）、ピル型ラベル、テキスト色はaccentColorの90%黒混合。計画の「控えめなラベル、背景色はアクセントカラーの薄い色」に合致。
- ダークモード補正: L448-453。計画外だが適切な追加。
- カード本体のレイアウトは既存の.cardを基本としている。計画通り。

**ステップ4（テスト）: 合格**

- registry.test.ts: PLAY_FEATURED_ITEMS（3件、各slug存在、recommendReason値検証）、getPlayFeaturedContents（3件、recommendReasonフィールド存在、各slug値検証、PlayContentMeta基本フィールド存在）、重複なしテスト。計画の全項目を網羅。
- page.test.tsx: 「イチオシ」見出し（L238-244）、サブテキスト（L246-251）、3件カード（L253-259）、おすすめ理由バッジ（L284-297）。計画の全項目を網羅。

**ステップ5（品質確認）: 指摘あり（後述）**

#### 指摘1【重要】`npm run format:check` が失敗する

レビュー実行時に `npm run format:check` を実行したところ、`src/app/play/page.tsx` でPrettierフォーマット違反が検出された。計画ステップ5では「npm run lint && npm run format:check && npm run test && npm run build を実行して全パスを確認」とされているが、format:checkがパスしない状態で納品されている。

レビュー中にprettierを適用して修正したが、builderは納品前にformat:checkを実行して確認すべきである。

#### 指摘2【低】FEATURED_SLUGS / getFeaturedContents() のコメントに古い記述が残存

registry.ts L96: 「/play ページとトップページの両方から参照される共有定数。」
registry.ts L139: 「/play ページとトップページの両方から参照される共有関数。」

しかし、今回の変更で/playページはFEATURED_SLUGSもgetFeaturedContents()も参照しなくなった。L92で「トップページ専用」と書き足したのは計画通りだが、同じコメントブロック内の別の行（L96）に古い「/playページとトップページの両方」が残っており矛盾している。getFeaturedContents()のJSDoc（L139）も同様。

可読性のルール（coding-rules.md: コメントでコードの「なぜ」を説明する）に照らして、矛盾するコメントは混乱の原因になる。「トップページ専用」に統一すべき。

#### コーディング規約の確認: 指摘2を除き合格

- 静的最優先: 全て静的/ビルド時生成。適切。
- 可読性: コメントが概ね適切。getCtaText関数のJSDocも明瞭。ただし指摘2の矛盾コメントは改善が必要。
- マジックナンバー: なし。
- 型安全: PlayFeaturedContent型が明示的に使用されており、anyの使用なし。
- 命名: getCtaText、recommendBadge等、意図が明確。
- インターフェース優先: PlayFeaturedItem、PlayFeaturedContentの両方がinterfaceで定義されている。適切。

#### テスト戦略の確認: 合格

- ファイル配置・命名規約に準拠。
- テスト対象（データ変換ロジック、コンポーネントレンダリング、エッジケース）が適切にカバーされている。
- 重複なしテストは本タスクの核心要件であり、回帰防止として価値が高い。

#### 総合判定: 差し戻し -- 修正が必要

指摘1（format:check失敗）はサイクル終了チェックリストの品質確認を満たさない問題であり修正必須。レビュー中にprettierを適用済みのため、現在のワーキングツリーではformat:checkは通る状態になっているが、builderはこの状態を確認し、指摘2のコメント矛盾も合わせて修正した上で再度レビューを依頼すること。
