---
id: 149
description: "結果体験の再設計: traditional-color（B-267）"
started_at: "2026-04-03T12:04:51+0900"
completed_at: "2026-04-03T15:13:00+0900"
---

# サイクル-149

traditional-color（伝統色性格診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [x] traditional-colorの現状の結果ページ・データ構造・コンテンツを全面的に把握する
- [x] 受検者本人・第三者・会話の3シナリオにおける理想体験をゼロベースで設計する
- [x] detailedContent構造の設計（型定義・フィールド構成）
- [x] 8結果タイプ分のコンテンツを作成する
- [x] 受検者向けResultCard表示を実装する
- [x] 第三者向け結果ページを実装する
- [x] テスト・ビルド・lint・formatチェックを通す

## 作業計画

`/cycle-planning` フェーズで記入する。作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。

### 目的

「手軽で面白い占い・診断を楽しみたい人」に向けて、伝統色診断の結果ページを「色そのもの」が主役の体験に再設計する。

受検者シナリオ: 結果を見た瞬間に「この色、私だ!」と感じ、思わず友達にシェアしたくなる体験。
第三者シナリオ: シェアリンクを開いた人が「きれい」「面白い」と感じ、自分もやりたくなる体験。
会話シナリオ: 友達同士で「私は藍色だったんだけど、あなたは?」と色を軸に盛り上がれる体験。

伝統色の最大の資産は「各タイプに固有のカラーコード（#0d5661〜#fedfe1）」であり、これを視覚・コンテンツの両面で最大限に活かす。

### 作業内容

#### ステップ1: TraditionalColorDetailedContent 型定義の追加

`src/play/quiz/types.ts` に新しい variant "traditional-color" を追加する。

フィールド設計（伝統色固有のゼロベース設計）:

- **variant**: `"traditional-color"` （discriminated union識別子）
- **catchphrase**: タイプのキャッチコピー（一行、15-30字）。例: 「静かに深く、すべてを見通す青」
- **colorMeaning**: この色が日本文化の中で持つ意味や由来（散文、80-150字）。伝統色辞典との接続点であり、他のクイズにはない「文化的深み」を提供するフィールド。例: 藍色は「ジャパンブルー」と呼ばれ、江戸時代に庶民の間で広く愛された色。深い知性と忍耐を象徴する。
- **season**: この色が最も映える季節。TypeScript の string literal union `"春" | "夏" | "秋" | "冬"` として `src/play/quiz/types.ts` 内で型定義する。季節感は日本文化の核であり、友達との会話で「私は冬の色だった」と盛り上がれる要素。
- **scenery**: この色が似合う風景・情景（1文、20-50字）。ビジュアルイメージを喚起する。例: 「月明かりに照らされた深い海」
- **behaviors**: あるある・日常での行動パターン（箇条書き4項目）。共感を呼ぶ具体的シーン。既存データの behaviors を高品質化して移行。
- **colorAdvice**: この色からのひとことメッセージ（1-2文、20-100字）。色が擬人化して語りかけるトーン。既存の advice をリライトして「色が語る」形式にする。例: 「深く考えすぎなくていい。あなたの静けさが、誰かの安らぎになっているから。」

このフィールド設計の意図:

- colorMeaning + season + scenery の3フィールドで「伝統色ならでは」の文化的・視覚的体験を提供する（他クイズのstrengths/weaknessesとは質的に異なる）
- behaviors で共感・笑いを、colorAdvice で温かい締めを提供する（診断の基本構造は維持）
- strengths/weaknesses を意図的に省略: 色の性格診断で「弱み」を列挙するのは世界観に合わない。代わりに colorMeaning で深みを、scenery で映像的な印象を提供する

`DetailedContent` union型に `TraditionalColorDetailedContent` を追加する。

#### ステップ2: 8結果タイプ分のコンテンツデータ作成

`src/play/quiz/data/traditional-color.ts` の各結果の detailedContent を新しい variant 形式に書き換える。

- 既存の traits は colorMeaning の素材として活用しつつ、日本文化的な色の由来・意味に書き換える
- 既存の behaviors はクオリティを維持しつつ、4項目に統一する
- 既存の advice を「色が語りかける」トーンにリライトする
- catchphrase, season, scenery は新規作成
- resultPageLabels は削除する。見出しは専用コンポーネント（TraditionalColorContent）内に固定する。これは前例（MusicPersonalityContent, AnimalPersonalityContent）と同様の方針である

#### ステップ3: ResultCard.tsx の variant dispatch 更新

- `renderDetailedContent` の switch 文に `"traditional-color"` ケースを追加
- `TraditionalColorContent` コンポーネントを dynamic import で読み込み
- TraditionalColorContent を呼び出す際、afterColorAdvice は省略（undefined）する。ResultCard 内では相性データがないため afterColorAdvice スロットは使用しない。afterColorAdvice はステップ5の専用ルート（第三者向けページ）でのみ CTA2 を注入するために使用する
- catchphrase の表示ロジックを追加（animal-personality/music-personality と同様に description の前に配置）。catchphrase 表示部分では CSS変数 `--catchphrase-accent-color` を各タイプの固有カラー（result.color）に設定する。variant 分岐を追加し、`"traditional-color"` の場合は result.color を使用する
- exhaustive check が引き続き機能することを確認

#### ステップ4: TraditionalColorContent 共通コンポーネント作成

`src/play/quiz/_components/TraditionalColorContent.tsx` と対応する CSS Module を作成する。

受検者向け（ResultCard内）と第三者向け（専用ルート）の両方から使用される共通コンポーネント。

表示順序:

1. colorMeaning セクション（「この色の物語」）— 色の文化的背景
2. scenery + season 表示（「この色が映える風景」）— 視覚的イメージ喚起、季節タグ付き
3. behaviors セクション（「この色が現れる場面」）— あるある
4. colorAdvice セクション（「この色からのひとこと」）— 締めのメッセージ
5. afterColorAdvice スロット（相性・CTA等のページ固有要素を注入）。相性機能なしの現時点では、CTA2（診断を受けるボタン）のみを注入する。既存パターンの afterTodayAction とは異なるスロット名だが、traditional-color には todayAction フィールドがないため、最終セクション名に合わせた afterColorAdvice という命名とする
6. 全タイプ一覧セクション（「他の色も見てみよう」）

CSS設計の重要ポイント:

- result.color を inline style で CSS変数 `--type-color` として注入し、見出しやアクセントに反映する。ダークモード時は `--type-color` に対して opacity または明度調整（例: `color-mix()` や `hsl` 変換）でコントラストを確保する汎用的手法を用いる。8タイプそれぞれの色に個別対応するのではなく、どの色でも機能する単一のロジックとする
- colorMeaning セクションは色をバックグラウンドに薄く敷いたカード形式で、伝統色の雰囲気を視覚的に伝える。ダークモードでは暗い色の背景が見えにくくなる問題に対し、背景色の opacity を上げる、または border 表現に切り替える方針で対応する

#### ステップ5: 専用ルートの作成

`src/app/play/traditional-color/result/[resultId]/` に以下のファイルを作成する:

- **page.tsx**: 第三者向け結果ページ。music-personality の専用ルートをパターンとして踏襲しつつ、TraditionalColorContent を使用する。catchphrase -> DescriptionExpander -> CTA1 -> TraditionalColorContent -> CTA2 の構成。
- **opengraph-image.tsx**: 専用OGP画像。結果タイプの固有カラーをアクセントカラーとして使用する（quiz.meta.accentColor ではなく result.color を使用）。これにより、シェアされたときにタイプごとに異なる色のOGP画像が表示される。
- **page.module.css**: ページ固有のスタイル。
- `__tests__/page.test.ts`: generateStaticParams と detailedContent variant の検証テスト。

#### ステップ6: テストの作成・更新

- `src/app/play/traditional-color/result/[resultId]/__tests__/page.test.ts`: 全8タイプの generateStaticParams、detailedContent variant 確認、catchphrase 存在確認
- 既存テスト `src/play/quiz/data/__tests__/traditional-color-detailed-content.test.ts` と `traditional-color-traits-advice-quality.test.ts` を新しいフィールド構成に合わせて更新。`traditional-color-traits-advice-quality.test.ts` の具体的な更新方針:
  - traits → colorMeaning に検証対象を変更。description との重複チェックは引き続き実施
  - advice → colorAdvice に変更。「色が語りかける」トーンに合わせたチェックに変更
  - catchphrase（15-30字）、scenery（20-50字）、colorMeaning（80-150字）、colorAdvice（20-100字）の文字数範囲チェックを追加
- ResultCard.tsx の exhaustive check が新 variant を含めてコンパイルが通ることを確認

#### ステップ7: ビルド・lint・テスト・ビジュアル確認

- `npm run lint && npm run format:check && npm run test && npm run build` の全パス
- Playwright でローカル起動し、受検者向け ResultCard と第三者向け結果ページの両方を視覚確認
- ダークモードでの視認性確認
- OGP画像の生成確認

### 検討した他の選択肢と判断理由

**選択肢A: strengths/weaknesses/behaviors/todayAction の流用（music-personality/animal-personality パターン踏襲）**

- 却下理由: backlog.md の明示的指示「型のグルーピングで共通化しない」に反する。伝統色という題材は「強み/弱み」のフレームワークより「色の文化的意味」「季節感」「風景」という軸の方が自然で、ユーザーにとってユニークな体験を提供できる。

**選択肢B: colorMeaning の代わりに strengths を採用し、weaknesses の代わりに scenery を採用する折衷案**

- 却下理由: 名前を変えただけで構造が同じになり、「ゼロベースで検討する」という指示の意図を満たさない。フィールドの意味そのものが伝統色の世界観に根ざしている必要がある。

**選択肢C: 相性データを今回のサイクルで実装する**

- 却下理由: 相性データは8x8=36通り（対称）のコンテンツ作成が必要で、今回のスコープを大きく超える。結果体験の再設計を高品質で完了させることを優先し、相性は将来のサイクルに委ねる。ただし、afterColorAdvice スロットの設計により、将来の相性機能追加が容易な構造にしておく。

**選択肢D: OGP画像に result.color ではなく quiz.meta.accentColor を使用する**

- 却下理由: 伝統色診断の最大の資産は「タイプごとに異なる美しい色」であり、OGP画像でもその色を活かすべき。シェアされたときに「藍色の人のOGPは青系、桜色の人のOGPはピンク系」と色が異なることで、視覚的なインパクトとシェア時の話題性が向上する。

### 計画にあたって参考にした情報

- `src/play/quiz/types.ts`: 既存の DetailedContent discriminated union の設計パターン（5つの variant が既に存在）
- `src/play/quiz/data/traditional-color.ts`: 現行の8結果タイプのデータ構造（traits 4項目、behaviors 4項目、advice 1文、各タイプに固有の color フィールド）
- `src/play/quiz/_components/MusicPersonalityContent.tsx` / `AnimalPersonalityContent.tsx`: 共通コンポーネントの設計パターン（headingLevel, allTypesLayout, afterTodayAction スロット）
- `src/app/play/music-personality/result/[resultId]/page.tsx`: 専用ルートの実装パターン（generateStaticParams, generateMetadata, OGP画像）
- `src/app/play/music-personality/result/[resultId]/opengraph-image.tsx`: OGP画像生成パターン
- `src/play/quiz/_components/ResultCard.tsx`: variant dispatch（renderDetailedContent 関数の switch 文、exhaustive check、catchphrase の表示ロジック）
- `src/app/play/[slug]/result/[resultId]/page.tsx`: 汎用動的ルート（traditional-color が現在使用中、専用ルート作成後は Next.js のファイルシステムルーティングが自動的に専用ルートを優先）

## レビュー結果

各ステップで独立したレビューを実施。主な指摘と対応:

- **ステップ1（型定義）**: 指摘なし。1回で承認
- **ステップ2（データ）**: 3回レビュー。MUST: 山吹色colorMeaning「戦国武将が好んだ色」の歴史的不正確性→小判との関連に修正。紺色「武士道の精神」→「勝色」の語呂合わせに修正。季節配分の偏り（春4）→山吹色を秋に変更（春3/夏2/秋2/冬1）。SHOULD: colorAdviceを色の一人称語りかけトーンに全8タイプ修正。山吹色sceneryの植物学的不正確性（ヤマブキは春の花）→銀杏並木に修正
- **ステップ3（ResultCard）**: 指摘なし。1回で承認
- **ステップ4（コンポーネント）**: 2回レビュー。MUST: ダークモードでfilter:brightness()が明るい色で白飛び→color-mix()に変更。SHOULD: aria-current="page"追加
- **ステップ5（専用ルート）**: 3回レビュー。MUST: CTA1ボタン・キャッチコピーの動的カラーによるコントラスト不足→アウトライン型ボタン+テキスト色固定に変更。ルーティング問題はdevサーバー再起動で解消する既知の挙動
- **来訪者目線レビュー**: 2回レビュー。MUST: 色の視覚的インパクト不足→カラーヒーローエリア追加+catchphraseの視覚強化。OGP画像の桜色等明るい色でテキストが読めない→createOgpImageResponse共通関数にテキスト色自動判定を追加（color-utils.tsのgetContrastTextColorに統一、全OGP画像に自動適用）

## キャリーオーバー

- DescriptionExpanderの閾値見直し: 来訪者目線レビューで、短い説明文（128字程度）でも折りたたまれるのは惜しいと指摘された。ただしDescriptionExpanderは共通コンポーネントであり、閾値変更は全クイズに影響するため、単独のタスクとして検討が必要。現状では緊急性は低い

## 補足事項

- 専用ルート追加後、devサーバー（または本番サーバー）を再起動しないと新しいルートが反映されない。これはNext.js App Routerのルーティングマニフェストがビルド時に生成されるためで、前サイクル（cycle-148）でも確認済みの既知の挙動。新ルート追加後は必ずサーバーを再起動（再ビルド）すること。

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
