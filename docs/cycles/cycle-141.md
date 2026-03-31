---
id: 141
description: "detailedContent構造最適化: contrarian-fortune専用の第三者向け結果ページ構成への変更（型定義拡張・コンポーネント・データ・テスト）"
started_at: "2026-03-31T20:04:43+0900"
completed_at: "2026-03-31T21:45:20+0900"
---

# サイクル-141

逆張り運勢診断（contrarian-fortune）の静的結果ページの `detailedContent` 構造を、設計レポート（docs/research/2026-03-31-contrarian-fortune-third-party-result-page-design.md）で定義された理想形に基づいて最適化する。現在の固定3フィールド（traits/behaviors/advice）では理想の8要素構成を実現できないため、discriminated union による型拡張を行い、contrarian-fortune 専用の表示ロジックとデータを実装する。このサイクルではインフラ作業（型定義の拡張・コンポーネントの分岐対応）も含む。

## 実施する作業

- [x] 運勢型に最適なdetailedContent構造を設計する
- [x] データモデル（型定義）を診断種類別の構造に対応できるよう拡張する
- [x] 結果ページコンポーネントを新しいデータ構造に対応させる
- [x] contrarian-fortune（8結果）のdetailedContentを新構造で書き換える
- [x] 結果ページの表示確認・レビュー

## 作業計画

### 目的

逆張り運勢診断（contrarian-fortune）の静的結果ページに表示する `detailedContent` の構造を最適化する。現在の固定3フィールド（traits/behaviors/advice）では、設計レポート（docs/research/2026-03-31-contrarian-fortune-third-party-result-page-design.md）で定義された理想的な8要素構成を実現できないため、型定義を拡張し、コンポーネントとデータを対応させる。

### 現状と理想のギャップ分析

現在の `QuizResultDetailedContent` は `traits: string[]` / `behaviors: string[]` / `advice: string` の3フィールドのみ。理想形の8要素との対応は以下の通り。

| #   | 理想の要素                             | 現状                                           | ギャップ                                                          |
| --- | -------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| 1   | タイプ名 + キャッチコピー              | title/icon は存在するがキャッチコピーなし      | 新フィールド `catchphrase` が必要                                 |
| 2   | 核心の一文（診断コンセプト提示）       | `description` をそのまま表示しているが長すぎる | 新フィールド `coreSentence` が必要                                |
| 3   | あるある箇条書き                       | `behaviors` として存在                         | そのまま活用可能                                                  |
| -   | シェアボタン第一置き場（あるある直後） | 末尾のみに配置                                 | コンポーネント変更が必要                                          |
| 4   | タイプの人物像（散文）                 | `traits` が箇条書きで存在するが形式が異なる    | 新フィールド `persona` （散文テキスト）が必要。現 `traits` は廃止 |
| 5   | 第三者専用セクション                   | 存在しない                                     | 新フィールド `thirdPartyNote` が必要                              |
| 6   | タイプ固有の笑い指標（省略可）         | 存在しない                                     | 新フィールド `humorMetrics`（オプショナル）が必要                 |
| 7   | 全タイプ一覧 + 診断CTA                 | 存在しない                                     | コンポーネント側で実装（データ変更不要）                          |
| 8   | SNSシェアボタン                        | 末尾に存在                                     | 位置はそのまま                                                    |

`advice` フィールドは理想形では独立セクションとして不要。レポートでは「ユーモアのトーンを維持した一言として要素4（人物像）の締めに自然に組み込む」と指定されているため、`persona` の散文内に統合する。

### 作業内容

#### Step 1: 型定義の拡張（discriminated union による後方互換設計）

**ファイル**: `src/play/quiz/types.ts`

現在の `QuizResultDetailedContent` を残しつつ（後方互換性のため）、contrarian-fortune 専用の新しいインターフェースを追加する。discriminated union を使い、`variant` フィールドで型を判別する。

- 既存の `QuizResultDetailedContent` に `variant?: undefined` を明示的に追加する（= variant なしは既存の「デフォルト」形式）。これにより TypeScript のナローイングが正しく機能する
- 新しい `ContrarianFortuneDetailedContent` を `variant: "contrarian-fortune"` で定義する
  - `catchphrase: string` -- タイプのキャッチコピー（一行）
  - `coreSentence: string` -- 逆張りコンセプトの核心を伝える1-2文
  - `behaviors: string[]` -- あるある箇条書き（既存フィールドを引き継ぐ）
  - `persona: string` -- タイプの人物像（散文150-250字、ユーモアトーンの締め含む）
  - `thirdPartyNote: string` -- 「このタイプの人と一緒にいると」セクションの内容（散文）
  - `humorMetrics?: Array<{ label: string; value: string }>` -- タイプ固有の笑い指標（省略可）
- `QuizResult` の `detailedContent` の型を `QuizResultDetailedContent | ContrarianFortuneDetailedContent` の union に変更する

**後方互換性の確保方法**: 既存の `QuizResultDetailedContent` に `variant?: undefined` を明示的に追加することで、discriminated union のナローイングが `detailedContent.variant === "contrarian-fortune"` という統一された条件式で機能する。結果ページコンポーネントはこの条件式で分岐する。

#### Step 2: コンポーネントの対応

**ファイル**: `src/app/play/[slug]/result/[resultId]/page.tsx` および `page.module.css`

`detailedContent` の表示部分を以下のように変更する。

1. `variant` の存在チェックで分岐:
   - `variant` なし（または未定義）: 既存のレンダリングロジック（traits/behaviors/advice）をそのまま使用
   - `variant === "contrarian-fortune"`: 新しいレンダリングロジックを使用

2. contrarian-fortune 用の表示順序:
   - (a) キャッチコピー（`catchphrase`）: タイプ名（h1）の直下に配置
   - (b) 核心の一文（`coreSentence`）: 現在の `description` 表示位置を置き換え。DescriptionExpander は使わず短い散文として表示。`description` はページ上に表示せず、metaタグ（SEO）でのみ使用する
   - (c) あるある箇条書き（`behaviors`）: 見出し「このタイプの人、こんなことしてませんか？」
   - (d) シェアボタン第一置き場: あるある直後に配置。既存の ShareButtons コンポーネントを再利用し、シェアテキストは現在の shareText をそのまま使用する（第三者向けのシェアテキスト変更はB-248の検討範囲）
   - (e) タイプの人物像（`persona`）: 見出しなし or 控えめな見出しで散文表示
   - (f) 第三者専用セクション（`thirdPartyNote`）: 見出し「このタイプの人と一緒にいると」
   - (g) タイプ固有の笑い指標（`humorMetrics`）: 存在する場合のみ表示。テーブル or カード形式
   - (h) 全タイプ一覧 + 診断CTA: クイズの全 results を列挙し、各タイプの結果ページ（/play/contrarian-fortune/result/[resultId]）へのリンクを配置。現在表示中のタイプはハイライト表示で区別する。診断への誘導CTA（「あなたのタイプはどれ？」+ 診断ページへのリンク）を末尾に配置
   - (i) シェアボタン（末尾）: 既存の位置

3. CSS の追加:
   - catchphrase 用のスタイル（サブタイトル的な控えめテキスト）
   - coreSentence 用のスタイル
   - persona 用のスタイル（散文表示）
   - thirdPartyNote 用のスタイル（セクション区切り + 見出し付き）
   - humorMetrics 用のスタイル（コンパクトなテーブル or カード）
   - allTypes 一覧用のスタイル

4. `resultPageLabels` の変更:
   - contrarian-fortune 用の新しい variant のレンダリングロジックでは traitsHeading/behaviorsHeading/adviceHeading は使用しないため、見出しはレンダリングロジック内にハードコードする（このコンテンツ専用であるため）
   - contrarian-fortune.ts の meta から `resultPageLabels` を削除する作業は Step 3 で行う（後述）

#### Step 3: データの書き換え（8結果タイプすべて）および resultPageLabels の削除

**ファイル**: `src/play/quiz/data/contrarian-fortune.ts`

8つの結果タイプそれぞれの `detailedContent` を、新しい `ContrarianFortuneDetailedContent` 構造に書き換える。各タイプごとにサブエージェントに委譲し、品質を個別に確保する。

書き換えの方針:

- `catchphrase`: 設計レポートのサンプルを参考に、タイプ名の世界観を一行で伝えるコピーを作成
- `coreSentence`: 現在の `description` から「逆張りフレーム」の核心部分を抽出・凝縮（1-2文）
- `behaviors`: 現在の `behaviors` をベースに、設計レポートの基準（具体的シーン、笑えるトーン、「友人の顔が浮かぶ」粒度）で品質チェック・必要に応じてリライト
- `persona`: 現在の `traits`（箇条書き）を散文に統合。設計レポートの基準（内面・動機の解説、150-250字、ユーモアトーンの締め）に準拠。現在の `advice` の内容は、ユーモアのトーンに合うものは persona の締めに統合し、真面目すぎるものは削除 or リライト
- `thirdPartyNote`: 新規作成。設計レポートのサンプル（cosmicworrier の旅行例）を参考に、各タイプの特性を「友人として一緒にいるとどうなるか」という第三者視点で描写
- `humorMetrics`: タイプごとに「面白い固有指標が作れるか」を判断し、作れる場合のみ設定。設計レポートの推奨に従い、面白くない場合は省略

現在の `description` フィールドは SEO の meta description として引き続き使用するため、変更しない。

また、contrarian-fortune 用の新しい variant のレンダリングでは traitsHeading/behaviorsHeading/adviceHeading を使用しなくなるため、contrarian-fortune.ts の meta から `resultPageLabels` を削除する。

#### Step 4: テストの更新

**ファイル**: `src/play/quiz/data/__tests__/contrarian-fortune-detailed-content.test.ts`

- 現在のテスト（traits/behaviors/advice の存在・サイズ検証）を新しい構造（catchphrase/coreSentence/behaviors/persona/thirdPartyNote/humorMetrics）に合わせて書き換える
- 他のクイズの detailedContent テスト（例: music-personality, character-personality 等）は変更不要（それらは variant なしの既存構造を使い続ける）
- 以下のバリデーション項目を追加する:
  - `catchphrase`: 非空、10-50字程度
  - `coreSentence`: 非空、20-100字程度
  - `persona`: 非空、150-250字の範囲
  - `thirdPartyNote`: 非空
  - `humorMetrics`: 存在する場合、各要素の `label` と `value` が非空であることを確認

#### Step 5: 表示確認（Playwright）

- contrarian-fortune の全8結果タイプの静的結果ページを Playwright で目視確認
- モバイル表示でのレイアウト崩れがないか確認
- 他のクイズ（music-personality 等）の結果ページが壊れていないか確認（後方互換性の検証）

### 変更の順序と依存関係

```
Step 1（型定義）
  ↓
Step 2（コンポーネント）  ←→  Step 3（データ）は並行可能だが、型定義完了後に開始
  ↓                              ↓
Step 4（テスト更新）← Step 2・3 の両方が完了してから
  ↓
Step 5（表示確認）← すべて完了後
```

実際の作業では Step 1 → Step 2 + Step 3（並行）→ Step 4 → Step 5 の順序で進める。Step 3 は8タイプをそれぞれ個別のサブエージェントに委譲し、品質を確保する。

### 検討した他の選択肢と判断理由

**選択肢A: 既存の `QuizResultDetailedContent` を拡張してオプショナルフィールドを追加する**

`QuizResultDetailedContent` に `catchphrase?: string`, `coreSentence?: string`, `persona?: string` 等を追加する方式。型がフラットで理解しやすいが、「traits と persona が同時に存在したらどうするか」「advice と persona の関係はどうか」等の曖昧さが生じる。また、将来の他コンテンツ最適化時に同じインターフェースにさらにフィールドが追加されて肥大化するリスクがある。不採用。

**選択肢B: detailedContent を完全に自由なオブジェクトにする（Record<string, unknown> 等）**

型安全性が失われるため不採用。

**選択肢C（採用）: discriminated union で variant ごとに異なる型を持つ**

`variant` フィールドの値でどの構造かを判別する。型安全であり、各コンテンツに最適な構造を定義できる。将来の他コンテンツ最適化時も新しい variant を追加するだけで対応可能。コンポーネント側は variant で switch して分岐するため、各コンテンツ固有のレンダリングロジックを安全に実装できる。

### 計画にあたって参考にした情報

- `docs/research/2026-03-31-contrarian-fortune-third-party-result-page-design.md` -- 理想形の設計レポート（レビュー承認済み）
- `src/play/quiz/types.ts` -- 現在の型定義
- `src/app/play/[slug]/result/[resultId]/page.tsx` -- 現在の表示ロジック
- `src/play/quiz/data/contrarian-fortune.ts` -- 現在のデータ構造（全8タイプ）
- `src/play/quiz/data/__tests__/contrarian-fortune-detailed-content.test.ts` -- 現在のテスト
- `src/app/play/[slug]/result/[resultId]/page.module.css` -- 現在のスタイル
- `docs/cycles/cycle-140.md` -- 前サイクルの設計方針（第三者向けページ設計）

## レビュー結果

### 理想形レポートのレビュー（3回）

- R1: 5件の指摘（AI運営通知欠落、ユーモア型扱いの根拠不足、advice扱い曖昧、あるある視点最適化、シェアボタン中間配置位置）→ 修正
- R2: 2件の指摘（逆張り度表示の価値不足、要素4/5の役割重複）→ 修正
- R3: 指摘事項なし → 承認

### 実装計画のレビュー（2回）

- R1: 7件の指摘（CTA1配置位置、DescriptionExpander扱い、テスト文字数検証、シェアボタン実装詳細、全タイプ一覧具体性、resultPageLabels矛盾、variant discriminant）→ 修正
- R2: 指摘事項なし → 承認

### 実装のレビュー（2回）

- R1: 3件の指摘（calmchaosユーモアトーン不足、mundaneoracle/inversefortune重複、coreSentence視覚的区切り不足）→ 修正
- R2: 指摘事項なし → 承認

## キャリーオーバー

- B-250〜B-257のタスク設計を見直す必要がある。現在は「運勢型」「ユーモア型」「性格診断型」とグルーピングしてインフラを共有する前提で作られているが、各コンテンツは個別に最適なコンテンツ構成を検討すべき。「型でまとめる」のは来訪者への価値を軽視して実装の手間を惜しむ行為であり、各診断コンテンツの個性を無視している。次サイクル以降でタスクに着手する際に、そのコンテンツ固有の特性に基づいた理想形を個別に検討すること。

## 補足事項

- 理想形のコンテンツ設計は、現状のコードを見せずにゼロベースで検討した（Owner指示）。その後でplannerが現状とのギャップを分析して実装計画を立てた
- B-247は9個の個別タスク（B-249〜B-257）に分割済み。各コンテンツは個別に理想形を検討すべき（Owner指示）
- discriminated unionによる型拡張は将来の他コンテンツ最適化時にも新しいvariantを追加するだけで対応可能

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
