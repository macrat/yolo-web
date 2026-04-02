---
id: 147
description: "結果体験の再設計: animal-personality（B-265）"
started_at: "2026-04-02T15:03:37+0900"
completed_at: null
---

# サイクル-147

animal-personality（動物性格診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [x] animal-personalityの現状の結果ページ・データ構造・コンテンツを全面的に把握する
- [x] 受検者本人・第三者・会話の3シナリオにおける理想体験をゼロベースで設計する
- [x] detailedContent構造の設計（型定義・フィールド構成）
- [x] 12結果タイプ分のコンテンツを作成する
- [x] 受検者向けResultCard表示を実装する
- [x] 第三者向け結果ページを実装する
- [x] テスト・ビルド・lint・formatチェックを通す
- [x] 実装のレビューを受ける
- [x] Playwrightで視覚確認する（スマホ375px幅を含む）

## 作業計画

### 目的

animal-personality（動物性格診断、12結果タイプ）の結果体験を、来訪者にとっての最高の価値を基準としてゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオすべてにおいて、情報の非対称性による不快感をなくし、「まさに自分だ」という納得感と「友達にも診断させたい」という自然な動機を最大化する。

### 設計方針

#### 3シナリオの体験設計

**1. 受検者本人（ResultCard）**

認知的興奮が最高潮の瞬間に、以下の順序で体験を提供する。

1. アイコン + タイトル（「ニホンザル -- 温泉を発明した革命児」）: 第一印象のインパクト
2. キャッチコピー（新フィールド `catchphrase`、1文20-40字）: 核心を一文で伝える。79%がスキャンのみという来訪者心理に対応し、「自分に当てはまる核心の一文」を最初に提示する
3. description: 動物の生態と性格の関連づけ（現状のものをベースに調整）
4. 強み・弱み（新フィールド `strengths` / `weaknesses`、各2-3項目）: バーナム効果を活用し、ポジティブだけでなく「少しの自虐」も含めることで「まさに自分だ」感を高める。受検者も第三者も同じ内容を読む
5. あるある行動パターン（`behaviors`、4項目）: 共感のピーク。現状のコンテンツを活用
6. 今日のアクション（`todayAction`、旧`advice`をリネーム・調整、1文）: 具体的で即実行可能なアクション提案
7. 相性セクション（既存のcompatibilityMatrix活用、ResultCard内に統合）: referrerがいる場合は相性結果を表示、いない場合は「友達に診断を送る」ボタン。自己理解コンテンツ（strengths -> weaknesses -> behaviors -> todayAction）の流れが一続きで完結した後に、他者との関係性である相性に移る方が自然。現在 `AnimalPersonalityResultExtra` が `ResultExtraLoader.tsx` 経由でResultCardの外側にレンダリングしている相性セクションを、新variantのResultCard rendering内に統合する。これにより `AnimalPersonalityResultExtra` および `ResultExtraLoader` のanimal-personality分岐は不要になるため削除する。referrerTypeIdはQuizContainerからResultCardに新propとして渡す（QuizContainerは既にreferrerTypeIdを保持している）
8. 全タイプ一覧セクション: 12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示。「他の動物も見てみたい」需要に応える。character-fortune専用ルートの全タイプ一覧セクションと同様のパターンで実装する
9. ShareButtons: 結果を十分理解した後に自然にシェアボタンが視界に入る位置
10. もう一度挑戦するボタン

**2. 第三者（シェアリンク経由、結果ページ）**

第三者は「友達がシェアした結果」または「検索から来た」来訪者。彼らにとっての価値は「この診断は面白そう、自分もやりたい」と思うこと。

1. クイズ名 + shortDescription（コンテキスト）
2. アイコン + タイトル
3. キャッチコピー（`catchphrase`）: 受検者と同じ
4. DescriptionExpander（長いdescriptionは折りたたみ）
5. CTA1: 「あなたはどのタイプ? 診断してみよう」
6. 強み・弱み（`strengths` / `weaknesses`）: 受検者と同じ内容。第三者が読んでも「○○さんってこういう人だよね」と会話のネタになる
7. あるある行動パターン（`behaviors`）: 受検者と同じ
8. 今日のアクション（`todayAction`）: 受検者と同じ
9. 相性紹介（`with`パラメータがある場合はCompatibilityDisplay）
10. 全タイプ一覧セクション: 12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示
11. CTA2: テキストリンク形式
12. ShareButtons

重要な設計判断: **受検者と第三者で同一のコンテンツを表示する。** 情報の非対称性を完全に排除する。現状のtraitsは分析レポート文体で受検者に不自然だったが、新フィールド構成（strengths/weaknesses）は受検者が読んでも第三者が読んでも自然な文体で統一する。

**3. 両者の会話**

受検者と第三者が同じコンテンツを読んでいるため、会話が自然に成立する。「強みに書いてあった『偶然の発見を文化に変える力』って、お前のことだよな」のような具体的な会話が生まれる。弱みの共有も「自虐ネタ」として会話を盛り上げる素材になる。

#### コンテンツ設計（新フィールド構成）

現状の `traits` / `behaviors` / `advice` を以下に再構成する。

| フィールド    | 型                    | 内容                                           | 文体                                                       | 受検者表示 | 第三者表示 |
| ------------- | --------------------- | ---------------------------------------------- | ---------------------------------------------------------- | ---------- | ---------- |
| `catchphrase` | `string`              | タイプの核心を一文で（20-40字）                | 体言止めまたは短文                                         | o          | o          |
| `strengths`   | `string[]`（2-3項目） | このタイプの強み                               | 「～できる」「～がある」（主語なし、受検者も第三者も自然） | o          | o          |
| `weaknesses`  | `string[]`（2-3項目） | このタイプの弱み（自虐的だが愛嬌がある書き方） | 同上                                                       | o          | o          |
| `behaviors`   | `string[]`（4項目）   | あるある行動パターン                           | 現状維持（主語省略のあるある形式）                         | o          | o          |
| `todayAction` | `string`              | 今日試してほしい具体的アクション（1文）        | 語りかけ                                                   | o          | o          |

`traits`（現4項目）は `strengths`（2-3項目）と `weaknesses`（2-3項目）に分解・再作成する。現状のtraitsは分析レポート文体の体言止めだが、新フィールドは受検者にも第三者にも自然な文体で統一する。**既存traitsの情報を全てstrengths/weaknessesのいずれかに反映すること。** traitsに含まれている情報が新フィールドへの変換時に消失しないよう、変換前後の対応を確認する。

`advice`は`todayAction`にリネームし、より具体的で即実行可能な内容に調整する。

`behaviors`は現状のコンテンツをそのまま活用する（受検者が読んで自然な文体で既に書かれている）。

#### 型設計: 新variant `animal-personality` を定義する

Standard variantを変更すると他の6クイズに影響するため、animal-personality専用の新variantを定義する。

```
interface AnimalPersonalityDetailedContent {
  variant: "animal-personality";
  catchphrase: string;
  strengths: string[];
  weaknesses: string[];
  behaviors: string[];
  todayAction: string;
}
```

`DetailedContent` union型にこの新型を追加する。exhaustive checkにより、ResultCard・結果ページの両方でコンパイル時に対応漏れを検出できる。

#### 既存Standard variantへの影響回避

- `QuizResultDetailedContent`（Standard variant）は一切変更しない
- `DetailedContent` union型に `AnimalPersonalityDetailedContent` を追加するのみ
- 他の6クイズ（music-personality, traditional-color等）のデータ・表示には影響しない
- ResultCardの `renderDetailedContent` に `case "animal-personality":` を追加
- 第三者向け結果ページは、animal-personality専用の具体ルート（`src/app/play/animal-personality/result/[resultId]/page.tsx`）を新規作成し、動的ルートの `CONCRETE_ROUTE_SLUGS` に `"animal-personality"` を追加

### 作業内容

#### ステップ1: 型定義の追加

- `src/play/quiz/types.ts` に `AnimalPersonalityDetailedContent` インターフェースを追加
- `DetailedContent` union型に追加
- `CompatibilityEntry` 型は既存のまま使用

対象ファイル:

- `src/play/quiz/types.ts`

#### ステップ2: 12タイプ分のコンテンツ作成

animal-personality.ts の各結果の `detailedContent` を新variant形式に書き換える。

**既存Standard variant形式から新variant形式へのフィールド変換リスト:**

- `variant: undefined` → `variant: "animal-personality"` を追加
- `traits: string[]` → `strengths: string[]` + `weaknesses: string[]` に分解
- `behaviors: string[]` → そのまま維持
- `advice: string` → `todayAction: string` にリネーム・内容調整
- `catchphrase: string` を新規追加

**コンテンツ作成方針:**

- **1タイプずつ個別に作成する。** 12タイプを一括で作成すると品質が均一化しやすく、各タイプの個性が薄れる。constitution Rule 4（品質優先）に基づき、1タイプごとに以下のプロセスを踏む:
  1. 既存のdescription・traits・behaviors・adviceを読み込み、そのタイプの個性を把握
  2. catchphrase: タイトルのサブタイトル部分（例: 「温泉を発明した革命児」）とは異なる切り口で、性格の核心を一文で表現
  3. strengths: 現traitsの肯定的側面を抽出・再構成。受検者が読んで「そうそう、これが自分の良いところ」と感じる文体。**既存traitsの情報を全てstrengths/weaknessesのいずれかに反映すること（情報消失の禁止）**
  4. weaknesses: 現traitsの課題的側面を抽出・再構成。自虐的だが愛嬌のある書き方で、読んで不快にならない。**既存traitsの情報を全てstrengths/weaknessesのいずれかに反映すること（情報消失の禁止）**
  5. behaviors: 現状のコンテンツをそのまま維持（文体が既に適切）
  6. todayAction: 現adviceをベースに、より具体的で即実行可能な1文に調整
- **ただし、実装効率のため3-4タイプずつのバッチで1つのサブエージェントに委託してもよい。** その場合も、サブエージェント内で1タイプずつ順番に作成し、前のタイプとの差別化を意識すること。1バッチの中で全タイプを並列に考えない

対象ファイル:

- `src/play/quiz/data/animal-personality.ts`

#### ステップ3: 受検者向けResultCard表示の実装

ResultCardに `case "animal-personality":` のレンダリングを追加する。

**表示順（体験設計セクションと整合）:**

catchphraseはdescriptionの前に表示する。現状のResultCardのJSX構造では `description` の後に `detailedSection` がレンダリングされるため、catchphraseを `description` の前に挿入する必要がある。実装方法: `renderDetailedContent` の戻り値として `{ before: ReactNode, after: ReactNode }` を返すパターンに変更するか、または `renderAnimalPersonalityContent` から返すJSX内でResultCardのdescription表示位置より前に配置するため、ResultCardコンポーネント自体を修正してdetailedContent variantに応じてcatchphraseをdescriptionの前に挿入する仕組みを追加する。

ResultCard内での表示順（体験設計セクションの項目1-10と完全に整合）:

1. アイコン + タイトル（既存）
2. catchphrase（キャッチコピー、descriptionの前。見出しなし、目立つスタイル）
3. description（既存）
4. strengths（見出し: 「このタイプの強み」、見出し文字列は直接定義する）
5. weaknesses（見出し: 「このタイプの弱み」、見出し文字列は直接定義する）
6. behaviors（見出し: 「この動物に似た行動パターン」、見出し文字列は直接定義する）
7. todayAction（見出し: 「今日試してほしいこと」、見出し文字列は直接定義する）
8. 相性セクション（referrerTypeIdの有無に応じて相性表示またはInviteFriendButton）
9. 全タイプ一覧セクション（12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示。character-fortune専用ルートの `allTypesSection` パターンを参考に実装）
10. ShareButtons（既存）
11. もう一度挑戦するボタン（既存）

**相性セクションの統合:**

現在 `AnimalPersonalityResultExtra` が `ResultExtraLoader.tsx` 経由でResultCardの外側にレンダリングしている相性セクション（CompatibilitySection + InviteFriendButton）を、新variantのResultCard rendering内に統合する。

- ResultCardに `referrerTypeId` propを新規追加する（optional）
- QuizContainer.tsxで既にreferrerTypeIdをpropsとして保持しているため、`<ResultCard>` 呼び出し箇所に `referrerTypeId={referrerTypeId}` を追加してResultCardに渡す
- `renderAnimalPersonalityContent` 内で、referrerTypeIdの有無に応じて相性表示またはInviteFriendButtonを表示する
- 統合後、`AnimalPersonalityResultExtra` コンポーネントは削除する
- `ResultExtraLoader.tsx` のanimal-personality分岐を削除する

スタイリングは既存のResultCard.module.cssを拡張する。catchphraseスタイルはcontrarian-fortuneで既に定義済みなので再利用可能。strengths/weaknessesリストは既存のbehaviorsListスタイルをベースに、区別がつくよう微調整する。

対象ファイル:

- `src/play/quiz/_components/ResultCard.tsx`
- `src/play/quiz/_components/ResultCard.module.css`
- `src/play/quiz/_components/QuizContainer.tsx`（ResultCardへのreferrerTypeId prop追加）
- `src/play/quiz/_components/AnimalPersonalityResultExtra.tsx`（削除）
- `src/play/quiz/_components/ResultExtraLoader.tsx`（animal-personality分岐を削除）

#### ステップ4: 第三者向け結果ページの実装

animal-personality専用の具体ルートを新規作成する。character-fortune専用ルート（`src/app/play/character-fortune/result/[resultId]/page.tsx`）をパターンとして参考にする。

表示構成（体験設計セクションと整合。見出し文字列は直接定義する）:
※ ResultPageShellが提供する共通要素（ShareButtons、もう一度挑戦する等）を除いた、animal-personality固有のコンテンツのみを記載。

1. ResultPageShell（共通wrapper）
2. catchphrase（キャッチコピー。DescriptionExpanderの前に配置し、第一印象を与える）
3. DescriptionExpander（長いdescriptionは折りたたみ）
4. CTA1: 「あなたはどのタイプ? 診断してみよう」
5. strengths / weaknesses
6. behaviors
7. todayAction
8. 相性紹介（`with`パラメータがある場合はCompatibilityDisplay。animal-personalityにはcompatibilityMatrixがあるため）
9. 全タイプ一覧セクション（12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示。character-fortune専用ルートの `allTypesSection` パターンを参考に実装）
10. CTA2: テキストリンク形式

動的ルートからの除外:

- `src/app/play/[slug]/result/[resultId]/page.tsx` の `CONCRETE_ROUTE_SLUGS` に `"animal-personality"` を追加

対象ファイル:

- `src/app/play/animal-personality/result/[resultId]/page.tsx`（新規作成）
- `src/app/play/animal-personality/result/[resultId]/page.module.css`（新規作成。character-fortuneのスタイルを参考に）
- `src/app/play/[slug]/result/[resultId]/page.tsx`（CONCRETE_ROUTE_SLUGS追加のみ）

#### ステップ5: OGP画像の対応

animal-personalityの結果ページOGP画像は既に動的ルート経由で生成されている（`.next/server/app/play/animal-personality/result/*/opengraph-image.*` が存在）。具体ルートに移行するため、OGP画像の生成も具体ルート側に移す必要がある。

既存のOGP画像生成パターン（character-fortune等）を参考にopengraph-image.tsxを追加する。

対象ファイル:

- `src/app/play/animal-personality/result/[resultId]/opengraph-image.tsx`（新規作成）
- `src/app/play/[slug]/result/[resultId]/opengraph-image.tsx`（CONCRETE_ROUTE_SLUGS に `"animal-personality"` を追加）

#### ステップ6: テスト実装

- 型テスト: 新variantの型定義が正しくdiscriminated unionとして機能することを確認
- コンテンツテスト: 12タイプすべてに必須フィールドが存在し、文字数制約を満たすことを確認
- コンポーネントテスト: ResultCardのanimal-personality variant renderingのスナップショットテスト
- 結果ページテスト: 専用ルートが正しく12タイプ分のパラメータを生成し、レンダリングできることを確認
- ResultExtraLoaderテスト更新: `src/play/quiz/_components/__tests__/ResultExtraLoader.test.tsx` にanimal-personality用テストが既に存在する。animal-personality分岐の削除に伴い、このテストを更新する（animal-personalityスラグでnullが返ることを確認するテストに変更、またはテスト自体を削除）
- ビルド・lint・formatチェック: `npm run lint && npm run format:check && npm run test && npm run build` が成功

対象ファイル:

- `src/play/quiz/data/__tests__/animal-personality.test.ts`（新規または既存拡張）
- `src/play/quiz/_components/__tests__/ResultCard.test.tsx`（既存拡張）
- `src/play/quiz/_components/__tests__/ResultExtraLoader.test.tsx`（既存更新: animal-personality分岐削除に伴う修正）
- `src/app/play/animal-personality/result/[resultId]/__tests__/page.test.tsx`（新規作成）

#### ステップ7: Playwrightによる視覚確認

- デスクトップ幅で受検者向けResultCardの表示を確認
- スマホ375px幅で受検者向けResultCardの表示を確認（スクロール量が適切か）
- 第三者向け結果ページ（12タイプ中2-3タイプ）の表示を確認
- 相性表示（`with`パラメータ付き）の表示を確認

### 検討した他の選択肢と判断理由

#### 選択肢A: Standard variantを拡張して対応する

Standard variantに `catchphrase`, `strengths`, `weaknesses` 等を追加する案。却下理由: Standard variantは他の6クイズでも使用されており、フィールド追加は全クイズに影響する。animal-personalityの体験に最適化されたフィールド構成は他クイズと共通化すべきでない（constitution Rule 4: 各コンテンツの最高品質追求）。

#### 選択肢B: 受検者と第三者で異なるコンテンツを表示する

現状の設計（traitsは第三者のみ表示、behaviorsは受検者のみ表示など）を維持・拡張する案。却下理由: 情報の非対称性の3パターン検証（タスク背景参照）で指摘されたとおり、受検者と第三者が異なる情報を読むと会話が噛み合わなくなる、ネガティブな内容を第三者だけが見て悲しい思いをする等のリスクがある。全フィールドを両者で共有し、文体を統一することで解決する。

#### 選択肢C: コンテンツを一括で12タイプ分作成する

効率を優先し、12タイプのコンテンツを1つのプロンプトで一括生成する案。却下理由: 一括生成は品質が均一化しやすく、各タイプの個性が薄れる。constitution Rule 4に基づき、1タイプずつ（またはバッチでも順番に1タイプずつ）丁寧に作成する。

#### 選択肢D: 既存の動的ルートのままanimal-personalityの新variant表示に対応する

CONCRETE_ROUTE_SLUGSに追加せず、動的ルート内でvariant分岐する案。却下理由: cycle-144でdispatch機構（A案）が全面破棄された経緯があり、動的ルート内でのvariant分岐は複雑化のリスクがある。具体ルートの方がシンプルで保守しやすい。

### 計画にあたって参考にした情報

- cycle-146の体験設計方針と申し送り（`docs/cycles/cycle-146.md`）
- cycle-144のルート設計の結論: 具体ルート + ResultPageShellパターン
- 競合分析の知見: 16Personalities（10以上のセクション、強み弱み両方）、16TEST（相性16パターン、偉人・アニメキャラ）、BuzzFeed/vonvon（OGP画像+シェア前提設計）
- 来訪者心理の知見: 79%がスキャンのみ、「自分に当てはまる核心の一文」を求める、納得感の閾値を超えた瞬間にシェア動機が発生
- 情報の非対称性の3パターン検証結果: 受検者と第三者で異なるコンテンツを見せることのリスク
- 既存のcompatibilityMatrix（78通りの相性データ）: 既に受検者向けで活用済み（AnimalPersonalityResultExtra）、第三者向けでも`with`パラメータで活用
- character-fortune専用ルートの実装パターン（`src/app/play/character-fortune/result/[resultId]/page.tsx`）
- [16TEST 動物タイプ一覧](https://16test.uranaino.net/animals/) - 動物16タイプ + 相性情報の構成を参考

## レビュー結果

### 計画レビュー（4回）

- **R1**: 7件の指摘（相性セクション統合設計の欠落、表示順不整合、全タイプ一覧欠落、traits情報消失リスク、不要ステップ、テスト漏れ等）→ 全修正
- **R2**: 4件の指摘（twitter-image不要、全タイプ一覧のステップ反映漏れ、相性セクション位置整理、OGP CONCRETE_ROUTE_SLUGS漏れ）→ 全修正
- **R3**: 3件の指摘（QuizContainerのreferrerTypeId明記、ステップ4のShareButtons注記、フィールド変換リスト追加）→ 全修正
- **R4**: 指摘事項なし。承認

### 実装レビュー（2回）

- **R1**: 3件の指摘（catchphrase句読点不統一、hondo-ten behaviors重複、JSDocコメント不一致）→ 全修正
- **R2**: 指摘事項なし。承認

### UI/UXレビュー（2回）

- **R1**: 5件の指摘（accentColorコントラスト不足、セマンティックHTML、強み弱みの視覚的差別化、catchphraseの装飾不足、CTA2配置）→ 全修正
- **R2**: 4/5修正確認。CTA2配置の1件が指示と異なる実装だったためPM判断で再修正。承認

### Playwright視覚確認

- デスクトップ: 受検者向けResultCard正常表示確認（修正前・修正後）
- モバイル375px: 受検者向けResultCard正常表示確認
- 第三者向けページ（nihon-zaru）: 正常表示確認（修正前・修正後）
- 相性表示（iriomote-yamaneko?with=nihon-zaru）: 正常表示確認

## キャリーオーバー

- なし

## 補足事項

- animal-personalityは他の11クイズに先駆けてanimal-personality専用variant + 専用具体ルートのパターンを確立した。B-266〜B-276の他クイズの再設計時にはこのパターンを参考にできる
- AnimalPersonalityResultExtra.tsx を削除し、相性セクションをResultCard内に統合した。これによりResultExtraLoaderのanimal-personality分岐も不要になった

### animal-personality コンテンツセクション共通コンポーネント抽出計画

#### 背景と目的

ResultCard.tsx の `renderAnimalPersonalityContent()` と page.tsx の animal-personality 固有JSXで、strengths/weaknesses/behaviors/todayAction/全タイプ一覧の5セクションのレンダリングロジックとCSSがほぼ同一の内容で2箇所に重複している。ダークモード対応や絵文字変更など同じ修正を2箇所で揃える必要があり、不整合が生まれやすい構造になっている。共通コンポーネントを抽出し、1箇所の変更で両方に反映される構成にする。

#### 1. 共通化する対象

**レンダリングロジック（JSX）:**

以下の5セクションを共通コンポーネントとして抽出する。

| セクション   | ResultCard での実装              | page.tsx での実装                      | 差異                       |
| ------------ | -------------------------------- | -------------------------------------- | -------------------------- |
| strengths    | h3見出し + ul/liリスト           | h2見出し + ul/liリスト                 | 見出しタグのみ（h3 vs h2） |
| weaknesses   | h3見出し + ul/liリスト           | h2見出し + ul/liリスト                 | 見出しタグのみ             |
| behaviors    | h3見出し + ul/liリスト           | h2見出し + ul/liリスト                 | 見出しタグのみ             |
| todayAction  | h3見出し + divカード             | h2見出し + divカード                   | 見出しタグのみ             |
| 全タイプ一覧 | h3見出し + ul/liリスト（縦並び） | h2見出し + ul/liリスト（ピル型横wrap） | 見出しタグ + レイアウト    |

**CSS:**

以下のスタイルを共通CSSモジュールに統合する。

- `.strengthsList` / `.strengthsItem`（+ ダークモード） ※ マーカーはセクション6の方針に従い ✨/😅 に変更する
- `.weaknessesList` / `.weaknessesItem`（+ ダークモード） ※ マーカーはセクション6の方針に従い ✨/😅 に変更する
- `.behaviorsList` / `.behaviorsItem`
- `.todayActionCard`（+ ダークモード）
- `.allTypesSection` / `.allTypesList` / `.allTypesItem` / `.allTypesItemCurrent`
- `.detailedHeading` / `.detailedSectionHeading`（統一名にする）
- CSS変数定義（`--animal-accent-color`, `--animal-accent-bg`, ダークモード切替）

#### 2. 共通コンポーネントの設計

**コンポーネント名:** `AnimalPersonalityContent`

**配置場所:** `src/play/quiz/_components/AnimalPersonalityContent.tsx` + `AnimalPersonalityContent.module.css`

quiz/\_components/ 配下に置く理由: ResultCard（同ディレクトリ）と page.tsx（app/配下）の両方から参照される共通コンポーネントであり、quiz関連コンポーネントの集約場所として適切。

**Client/Server Component の選択: Server Component（"use client" を付けない）**

このコンポーネント自体にはクライアントサイドの状態・イベントハンドラ・ブラウザAPIへの依存がない。純粋なプレゼンテーションコンポーネントである。

- page.tsx（Server Component）から直接インポートできる
- ResultCard.tsx（Client Component）からインポートした場合、Client Component ツリーの一部としてクライアントバンドルに含まれるが、動作上の問題はない（Server Component は Client Component の子として使用可能）

**Props設計:**

```typescript
interface AnimalPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: AnimalPersonalityDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** 見出しタグのレベル。ResultCard内ではh3、結果ページではh2 */
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。ResultCard内では "list"（縦並び）、結果ページでは "pill"（ピル型横wrap） */
  allTypesLayout: "list" | "pill";
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionと全タイプ一覧の間に表示） */
  afterTodayAction?: React.ReactNode;
}
```

**headingLevel について:**

ResultCard 内ではクイズタイトルが h2 であるため、コンテンツセクションの見出しは h3 が適切。page.tsx では ResultPageShell 内のタイトルが h1 であるため、コンテンツセクションは h2 が適切。共通コンポーネントの props で `headingLevel` を受け取り、動的にタグを切り替える。

**allTypesLayout について:**

ResultCard 内の全タイプ一覧は縦並びリスト（`flex-direction: column`）、page.tsx の全タイプ一覧はピル型横wrap（`flex-wrap: wrap`, `border-radius: 999px`）と意図的にデザインが異なる。共通コンポーネントで `allTypesLayout` prop を受け取り、CSS クラスを切り替える。

**afterTodayAction スロットについて:**

ResultCard では相性セクション（CompatibilitySection + InviteFriendButton）、page.tsx では CompatibilityDisplay + CTA2 がtodayActionと全タイプ一覧の間に配置される。これらはページ固有の要素であるため共通化せず、`afterTodayAction` スロットとして呼び出し側から注入する。

**レンダリング構造:**

```
<div className={styles.wrapper}>  {/* CSS変数定義 + ダークモード切替 */}
  <Heading>このタイプの強み</Heading>
  <ul strengths />

  <Heading>このタイプの弱み</Heading>
  <ul weaknesses />

  <Heading>この動物に似た行動パターン</Heading>
  <ul behaviors />

  <Heading>今日試してほしいこと</Heading>
  <div todayAction />

  {afterTodayAction}  {/* 相性セクション・CTA等のスロット */}

  <div allTypesSection>
    <Heading>他の動物も見てみよう</Heading>  {/* 共通コンポーネント内でハードコード */}
    <ul allTypes />  {/* layout propに応じてCSSクラスを切替 */}
  </div>
</div>
```

#### 3. ResultCard.tsx の変更内容

- `renderAnimalPersonalityContent()` 関数を削除
- `renderDetailedContent()` の `case "animal-personality":` で `<AnimalPersonalityContent>` を使用
- `afterTodayAction` に相性セクション（CompatibilitySection + InviteFriendButton）を渡す
- `headingLevel={3}`, `allTypesLayout="list"` を指定
- ResultCard.module.css から animal-personality 固有のスタイル（`.animalPersonalityWrapper`, `.strengthsList`, `.strengthsItem`, `.weaknessesList`, `.weaknessesItem`, `.todayActionCard`, `.allTypesSection`, `.allTypesList`, `.allTypesItem`, `.allTypesItemCurrent` および関連するダークモードルール）を削除

#### 4. page.tsx の変更内容

- strengths/weaknesses/behaviors/todayAction/全タイプ一覧の個別JSXを削除
- `<AnimalPersonalityContent>` を使用
- `afterTodayAction` に CompatibilityDisplay + CTA2 を渡す
- `headingLevel={2}`, `allTypesLayout="pill"` を指定
- page.module.css から共通コンポーネントに移動したスタイルを削除し、catchphrase/CTA/DescriptionExpander等のページ固有スタイルのみを残す

#### 5. 共通化しないもの（ページ固有の要素）とその理由

| 要素                                  | 理由                                                                                                                                                                                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| catchphrase の表示                    | ResultCard版（`.catchphraseBeforeDescription`: description前配置、CSS変数による装飾線）とpage版（`.catchphrase`: カード型背景、DescriptionExpander前配置）でスタイル・配置が異なる。ResultCardでは受検者の感情が最高潮の瞬間の演出、pageでは第三者への第一印象提供という異なる目的 |
| 相性セクション                        | ResultCardではClient Component依存（CompatibilitySection + referrerTypeIdによる条件分岐 + InviteFriendButton）、pageではServer Component（CompatibilityDisplay + searchParamsベースの解決）。依存するコンポーネントとデータ解決方法が根本的に異なる                                |
| CTA（trySection, cta2Section）        | page.tsx 固有。受検者向けResultCardにはCTAは不要（既に受検済み）                                                                                                                                                                                                                   |
| DescriptionExpander                   | page.tsx 固有。ResultCardではdescriptionをそのまま表示                                                                                                                                                                                                                             |
| ShareButtons / もう一度挑戦するボタン | ResultCardの既存構造の一部であり、共通コンポーネントの責務外                                                                                                                                                                                                                       |
| CSS変数の定義元                       | `.animalPersonalityWrapper`（ResultCard）と `.detailedSection`（page）でCSS変数を定義しているが、共通コンポーネントの `.wrapper` に統合する。呼び出し側での定義は不要になる                                                                                                        |

#### 6. スタイル統一方針

現在、同じセクションでもResultCardとpageで微妙なスタイル差異がある（例: strengthsItemのborder有無、絵文字 vs テキスト記号）。共通化にあたり、border なしのレイアウト（page.tsx版）と絵文字マーカー（ResultCard版）を組み合わせて採用する。理由: border なしはUI/UXレビューを経て最適化されたレイアウトであり、絵文字マーカー（✨ / 😅）は体験設計の意図（「自虐的だが愛嬌がある書き方」「ポジティブな強み」）に合致し、来訪者の体験価値に直結するため。

具体的な統一内容:

- strengthsItem: border なし、`::before` は "✨"（絵文字マーカーで強みの肯定感を強める）
- weaknessesItem: border なし、`::before` は "😅"（絵文字マーカーで愛嬌のある弱み表現を演出）
- behaviorsItem: `::before` は "💡"、border付き（page.tsx版を採用）
- allTypesList の "list" レイアウト: 現状のResultCard版の縦並びスタイルを維持
- allTypesList の "pill" レイアウト: 現状のpage.tsx版のピル型横wrapスタイルを維持
- 全タイプ一覧の見出しテキスト: 「他の動物も見てみよう」に統一（共通コンポーネント内でハードコード）

#### 7. 影響範囲と注意点

- 他のvariant（contrarian-fortune, character-fortune, standard）のレンダリングには一切影響しない
- `.behaviorsList` / `.behaviorsItem` は他variantでも使用されているため、ResultCard.module.css から削除しない。共通コンポーネントのCSSでは別名（例: 同名でもモジュールスコープが異なるため衝突しない）を使用する
- テスト: ResultCardのanimal-personality関連テストと page.tsx のテストが既に存在するため、共通コンポーネント抽出後もこれらのテストが引き続きパスすることを確認する。共通コンポーネント自体の単体テストは、呼び出し側のテストでカバーされるため新規作成は不要

### 残作業の計画（共通コンポーネント抽出の完了）

調査レポート: `tmp/research/2026-04-02-animal-personality-common-component-extraction-status.md`

#### 前提状況

実装は概ね完了しているが、未コミット・未レビュー状態。以下の残存問題を修正し、品質チェックと視覚確認を経てコミットする。

#### ステップ1: 残存問題の修正

**問題1 [高] catchphraseBeforeDescription のインラインスタイルによるCSS変数渡し**

- 対象: `src/play/quiz/_components/ResultCard.tsx` 行287-295
- 現状: `--catchphrase-accent-color` と `--catchphrase-accent-color-dark` をインラインスタイルで渡している。`--catchphrase-accent-color-dark` の `#4ade80` はanimal-personality専用のハードコード値。
- 方針: catchphraseはAnimalPersonalityContentの共通化範囲外（設計上の意図）なので、ResultCard固有の問題として扱う。catchphraseBeforeDescriptionのCSS変数定義をResultCard.module.cssのセレクタ内に移動し、インラインスタイルを廃止する。具体的には:
  - `.catchphraseBeforeDescription::before` / `::after` のライトモード色 `#15803d` は既にCSSのフォールバック値として記述済みなので、インラインスタイルで渡す必要がない
  - ダークモードの色 `#4ade80` も既に `:global(.dark) .catchphraseBeforeDescription::before/after` のフォールバック値として記述済み
  - **確認結果:** `catchphraseBeforeDescription` クラスはResultCard.tsx内でanimal-personality variantのcatchphrase表示にのみ使用されている。他のvariant（standard, contrarian-fortune, character-fortune）では `catchphraseBeforeDescription` を使用していない（contrarian-fortuneは別クラス `.catchphrase` を使用）。したがって `accentColor` をCSS変数として渡す必要はなく、CSSフォールバック値のみで運用する
  - **最終方針:** インラインスタイルによる `--catchphrase-accent-color` / `--catchphrase-accent-color-dark` の受け渡しを削除し、`.catchphraseBeforeDescription::before/after` のCSSフォールバック値（ライトモード `#15803d`、ダークモード `#4ade80`）のみで色を定義する
  - 注意: この修正はAnimalPersonalityContent共通化とは独立した、ResultCard固有の改善である

**問題2 [中] page.module.css のコメント不一致**

- 対象: `src/app/play/animal-personality/result/[resultId]/page.module.css` 行16-18
- 現状: `/* variant-shared content styles */` というコメントだが、配下の `.trySection` / `.tryButton` / `.tryCost` はanimal-personality専用ページ固有の要素であり、他variantとは共有していない
- 方針: コメントを実態に合わせて修正する（例: `/* CTA styles */` または `/* animal-personality page-specific styles */`）

**問題3 [低] マーカーの統一（絵文字マーカーに戻す）**

- 現状: 計画のセクション6「スタイル統一方針」で、page.tsx版のスタイル（"✓" / "△"）を採用すると明記されていた
- 方針: 絵文字マーカー（✨ / 😅）に戻す。理由: 体験設計のコンテンツ設計セクションで weaknesses の文体を「自虐的だが愛嬌がある書き方」と明記しており、😅 は愛嬌の演出に直接寄与する。✨ は強みの肯定感を強める。これらは来訪者にとっての体験価値に直結する要素であり、「page.tsx版のUI/UXレビューを経た」という理由よりも優先される。セクション6のスタイル統一方針も合わせて更新済み

#### ステップ2: 品質チェック（すべてパスが必須）

以下のコマンドをすべて実行し、エラーがないことを確認する:

1. `npm run lint` — ESLintエラーがないこと
2. `npm run format:check` — フォーマットが統一されていること
3. `npx tsc --noEmit` — TypeScript型チェックがパスすること
4. `npm run test` — 全テスト（既存テスト + AnimalPersonalityContent.test.tsx）がパスすること
5. `npm run build` — ビルドが成功すること

いずれかが失敗した場合は修正してから再実行する。

#### ステップ3: スクリーンショットによる視覚確認

dev serverを起動し、Playwrightツールを使って以下のページのスクリーンショットを取得・確認する。

**確認対象URL:**

1. 受検者向け結果カード（ResultCard内のanimal-personality表示）
   - dev serverでanimal-personalityクイズを受検してResultCardの表示を確認する（結果タイプはコントロールできないが、表示の正常性確認には十分）
2. 第三者向け結果ページ: `/play/animal-personality/result/{既存の結果ID}`

**確認モード:**

- ライトモード（デフォルト）
- ダークモード（`prefers-color-scheme: dark` またはダークモード切り替え機能を使用）

**確認観点:**

- 強み / 弱み / 行動パターン / 今日のアクション / 全タイプ一覧の5セクションが正しく表示されていること
- マーカー（✨ / 😅 / 💡）が意図どおり表示されていること
- ダークモードで色のコントラストが十分であること（背景色・テキスト色・アクセント色）
- catchphraseの装飾線（ResultCard版）がライト/ダークモード両方で正しく表示されていること
- 全タイプ一覧のレイアウトが、ResultCard内では縦並び、page.tsxではピル型横wrapになっていること
- レイアウト崩れがないこと

#### ステップ4: コミット

すべてのステップが完了したら、変更をコミットする。

対象ファイル:

- `src/play/quiz/_components/AnimalPersonalityContent.tsx`（新規）
- `src/play/quiz/_components/AnimalPersonalityContent.module.css`（新規）
- `src/play/quiz/_components/__tests__/AnimalPersonalityContent.test.tsx`（新規）
- `src/play/quiz/_components/ResultCard.tsx`（変更）
- `src/play/quiz/_components/ResultCard.module.css`（変更）
- `src/play/quiz/_components/__tests__/ResultCard.test.tsx`（変更）
- `src/app/play/animal-personality/result/[resultId]/page.tsx`（変更）
- `src/app/play/animal-personality/result/[resultId]/page.module.css`（変更）

#### 完了条件

- 残存問題3件がすべて対処済み（修正 or 確認済み）
- lint / format:check / tsc / test / build がすべてパス
- ライトモード・ダークモード両方のスクリーンショットで視覚的問題がないことを確認済み
- 全変更がコミット済み

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
