---
id: 154
description: "結果体験の再設計: contrarian-fortune（B-272）"
started_at: "2026-04-04T16:35:28+0900"
completed_at: null
---

# サイクル-154

contrarian-fortune（天邪鬼占い）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [ ] Step 1: WCAG AA非準拠の4色を修正（データファイル `contrarian-fortune.ts` の `color` フィールド）
- [ ] Step 2: 共通コンポーネント `ContrarianFortuneContent` を作成（Server Component, headingLevel prop, --type-color CSS変数）
- [ ] Step 3: 専用ルート page.tsx を再設計（colorHero + DescriptionExpander + CTA1 + コンテンツ + CTA2 + 全タイプ一覧）
- [ ] Step 4: 専用ルート page.module.css を再設計（impossible-advice のパターンに準拠）
- [ ] Step 5: OGP画像を修正（`accentColor` 固定 → `result.color` 使用）
- [ ] Step 6: ResultCard の `renderContrarianFortuneContent` を共通コンポーネント呼び出しに置き換え、CATCHPHRASE_VARIANTS に追加
- [ ] Step 7: テストを更新（データテスト・ページテスト・共通コンポーネントテスト）
- [ ] Step 8: 本番ビルド + ビジュアルレビュー（全8タイプ × 専用ルート/ResultCard × デスクトップ/モバイル × ライト/ダーク）
- [ ] Step 9: 最終レビュー + 修正対応

## 作業計画

### 目的

contrarian-fortune（逆張り運勢診断）は「一般的な占いなら〜だが、あなたは逆」という逆張りフレームで天邪鬼な性格を肯定的・ユーモラスに描くクイズである。このクイズ固有の面白さは次の3点にある:

1. **逆張りのユーモア**: 「普通の占いなら〜」で始まる予測裏切り構造がコンテンツの核心
2. **天邪鬼な自分への肯定**: 「あるある」行動リストで「わかる!」共感を生み、人物像で「それでいい」と肯定する
3. **SNS会話のネタ性**: キャッチフレーズとタイプ名が友人間の会話で引用されやすい

再設計の目的は、これらの面白さを最大限に引き出すページ体験を提供し、シェア率・回遊率を向上させることである。現状の問題（catchphraseが目立たない、全タイプ同一色、シェアボタンの配置不適切、共通コンポーネントなし）を解消し、再設計済みの他variant（impossible-advice等）と同等の品質基準に引き上げる。

### 作業内容

#### Step 1: WCAG AA非準拠の4色を修正

contrarian-fortune の8タイプ中4色が白背景でWCAG AA（コントラスト比4.5:1以上）を満たさない。テキスト色として使用する箇所（見出し、装飾線）でアクセシビリティ問題が発生する。

| タイプ          | 現在の色 | コントラスト比 | 修正後の色            | 修正後比 |
| --------------- | -------- | -------------- | --------------------- | -------- |
| reverseoptimist | #f59e0b  | 2.15           | #b45309 (amber-700)   | 5.02     |
| paradoxmaster   | #059669  | 3.77           | #047857 (emerald-700) | 5.48     |
| calmchaos       | #0891b2  | 3.68           | #0e7490 (cyan-700)    | 5.36     |
| inversefortune  | #ea580c  | 3.56           | #c2410c (orange-700)  | 5.18     |

修正は `contrarian-fortune.ts` の各 result の `color` フィールドのみ。accentColor（#f59e0b）はクイズ全体のブランドカラーであり、テキスト色として直接使わないため変更不要（ただし、page.tsx で accentColor を直接テキスト色として使用している箇所があれば、result.color に置き換えるか、--type-color CSS変数を経由させる必要がある）。

#### Step 2: 共通コンポーネント `ContrarianFortuneContent` を作成

impossible-advice の `ImpossibleAdviceContent` と同じパターンで、ResultCard（受検者向け）と page.tsx（第三者向け）の両方から使用される共通コンポーネントを作成する。

**共通化対象セクション**（体験フロー順）:

1. **coreSentence**: 逆張りフレームの核心一文 → 色付きカード形式（--type-color の薄い背景 + 左ボーダー）
2. **behaviors**: あるある行動リスト → カード風リスト項目（装飾アイコン付き）
3. **persona**: タイプの人物像 → 散文セクション（見出し「このタイプの人物像」）
4. **thirdPartyNote**: 第三者視点のシーン描写 → 散文セクション（見出し「このタイプの人と一緒にいると」）
5. **humorMetrics**: 笑い指標テーブル（6/8タイプのみ、存在する場合のみ表示）
6. **全タイプ一覧**: pill型横wrapレイアウト

**共通化しないもの（呼び出し側の責務）**:

- catchphrase の表示（ResultCardではcatchphraseBeforeDescription、page.tsxではcolorHero内に配置）
- CTA（afterPersona スロットとして注入）
- ShareButtons / もう一度挑戦するボタン

**Props設計**: ImpossibleAdviceContent と同様に `quizSlug`, `resultId`, `detailedContent`, `allResults`, `headingLevel`, `allTypesLayout`, `resultColor`, `afterPersona?` を受け取る。

**CSS設計**: `ContrarianFortuneContent.module.css` に --type-color CSS変数ベースのスタイルを定義。color-mix() でダークモード対応。フォールバック値を全箇所に付与。

#### Step 3: 専用ルート page.tsx を再設計

impossible-advice の page.tsx パターンに準拠し、以下の構成に再設計する:

```
ResultPageShell
  └─ detailedSection (--type-color CSS変数を注入)
      ├─ colorHero (タイプカラー薄背景、負margin でカード端まで拡張)
      │   └─ catchphrase (1.25rem, bold, 中央揃え)
      ├─ DescriptionExpander (長いdescriptionは折りたたみ)
      ├─ CTA1 (アウトライン型ボタン、--type-color border)
      ├─ ContrarianFortuneContent (共通コンポーネント)
      │   ├─ coreSentence (色付きカード)
      │   ├─ behaviors (あるあるリスト)
      │   ├─ persona (人物像散文)
      │   ├─ thirdPartyNote (第三者視点散文)
      │   ├─ humorMetrics (笑い指標テーブル、あれば)
      │   ├─ [afterPersona スロット → CTA2]
      │   └─ 全タイプ一覧 (pill型)
      └─ (ShareButtons は ResultPageShell が末尾に配置)
```

**体験フローの設計意図**:

- colorHero + catchphrase: 第三者が最初に見る「このタイプの一言要約」を大きく印象的に
- DescriptionExpander: 元の description（逆張りフレームの説明文）を収納。全8タイプのdescriptionは128字超（最短でも約110字、大半が120-140字）のため、DESCRIPTION_LONG_THRESHOLD = 128 で大半が折りたたみ対象になる。impossible-advice と同じ閾値を使用
- CTA1: ファーストビューに近い位置で「あなたも診断してみよう」を誘導（主に第三者向け）
- coreSentence: 逆張りの核心を改めて提示
- behaviors: 「わかる!」共感ポイントで読者を引き込む（ここが最も面白いセクション）
- persona: 天邪鬼な自分を肯定する散文で「読んでよかった」感を提供
- thirdPartyNote: 「このタイプの人と一緒にいると」で第三者にも楽しめる情報
- humorMetrics: ユーモア指標で最後に笑いを提供
- CTA2: コンテンツ読了後の自然な誘導
- 全タイプ一覧: 他タイプへの回遊を促す

#### Step 4: 専用ルート page.module.css を再設計

impossible-advice の page.module.css パターンに準拠:

- colorHero: 負margin + color-mix(--type-color 12%, white) + border-radius
- catchphrase: 1.25rem, bold, color: var(--color-text)
- tryButton: アウトライン型（--type-color border, 透明背景, var(--color-text) テキスト）
- cta2Section / cta2Link: テキストリンク形式CTA
- ダークモード: colorHero は color-mix(--type-color 20%, #1a1a2e) + box-shadow

#### Step 5: OGP画像を修正

現在 `accentColor` 固定（全タイプ同じ #f59e0b）→ `result.color` を使用してタイプごとに異なるOGP画像色にする。SNSでシェアされた際の視覚的差別化が目的。

#### Step 6: ResultCard の更新

**受検者体験の変更点**: 現在のResultCard内 `renderContrarianFortuneContent` は catchphrase, behaviors, humorMetrics の3セクションのみを表示している。共通コンポーネント化により、coreSentence, persona, thirdPartyNote, 全タイプ一覧 の4セクションが新たに追加され、計6セクションになる。これは再設計済みの他variant（impossible-advice: diagnosisCore + behaviors + practicalTip + 全タイプ一覧、unexpected-compatibility: entityEssence + whyCompatible + behaviors + lifeAdvice + 全タイプ一覧）と同等の情報量であり、受検者がResultCard内で結果体験を完結できるようにする。特にpersonaとthirdPartyNoteは「自分のタイプの深い理解」と「周囲からの視点」を提供し、受検者の満足度を高める。

1. `renderContrarianFortuneContent` 関数を削除し、`ContrarianFortuneContent` コンポーネントの dynamic import に置き換える
2. CATCHPHRASE_VARIANTS リストに `"contrarian-fortune"` を追加
3. CATCHPHRASE_ACCENT_COLOR に `"contrarian-fortune": result.color ?? null` を追加
4. `renderDetailedContent` の switch 文に `case "contrarian-fortune"` で共通コンポーネント呼び出しを追加
5. `allResults` prop の受け渡し: ResultCard は既に `allResults?: QuizResult[]` propを持ち、`renderDetailedContent` に渡している。`ContrarianFortuneContent` はこの既存の `allResults` をそのまま使用するため、QuizContainer側の変更は不要

#### Step 7: テスト更新

- 共通コンポーネント `ContrarianFortuneContent` の基本レンダリングテスト
- 既存ページテスト (`page.test.tsx`) の更新（新しい構成に合わせたセレクタ変更）
- 既存データテストは color 値変更に伴う修正が必要かチェック

#### Step 8: 本番ビルド + ビジュアルレビュー

`npm run build && npx next start` で本番ビルドし、以下を全パターン確認:

- 全8タイプ × 専用ルート（第三者向け）
- 全8タイプ × ResultCard（受検者向け）: クイズを実際に受けて確認
- デスクトップ / モバイル(375px)
- ライトモード / ダークモード
- OGP画像が各タイプで異なる色になっているか

#### Step 9: 最終レビュー + 修正対応

レビューエージェントによる最終確認。指摘事項があれば修正し、再レビューを実施。

### 検討した他の選択肢と判断理由

#### 1. フィールド構成の検討

**選択肢A: 現状のフィールド構成をそのまま使用**（採用）

- catchphrase, coreSentence, behaviors, persona, thirdPartyNote, humorMetrics の6フィールド
- 各フィールドが明確に異なる役割を持っている: coreSentence=逆張りフレームの核心提示、persona=内面・動機の散文描写
- humorMetrics が6/8タイプにしかないのは「面白い指標が作れるタイプのみ」という意図的な設計（型定義でも optional）
- 判断理由: 各フィールドの役割が重複しておらず、ページ体験の各セクションに1対1でマッピングできるため、統合・分割の必要がない

**選択肢B: coreSentenceとpersonaを統合して1つの散文フィールドにする**（不採用）

- 統合すると、coreSentenceの「逆張りフレーム提示」（短い核心文）とpersonaの「人物像の温かい散文」（150-250字）の2つの異なる表示形式が失われる
- coreSentenceは色付きカードで目立たせ、personaは散文で読ませる、という異なるビジュアル表現が適切
- 判断理由: 2つのフィールドは長さ・トーン・表示形式がすべて異なり、統合するメリットがない

**選択肢C: humorMetrics を全8タイプに追加（2タイプ分を新規作成）**（不採用）

- 現在の型定義が optional であること、「面白い指標が作れるタイプのみ」という設計意図を尊重
- 無理に作ると品質低下のリスクがある
- 判断理由: 品質を優先し、現状の6/8タイプを維持

**選択肢D: thirdPartyNoteを削除してpersonaに統合する**（不採用）

- thirdPartyNote は「第三者視点のシーン描写」という独自の価値を持つ。persona とは視点（本人の内面 vs 周囲から見た姿）が明確に異なる
- 判断理由: 第三者視点のコンテンツはシェアリンク経由の来訪者にとって特に価値が高い

#### 2. ページ構成の検討

**選択肢A: 受検者と第三者で同一ページ（1ページ統合）**（不採用）

- ResultCard をなくし、クイズ完了後も専用ルートにリダイレクトする案
- 問題点: ResultCard は「もう一度挑戦する」ボタンを含むクライアントコンポーネントであり、クイズフロー（QuizContainer）と統合されている。専用ルートにリダイレクトするとクイズの状態管理が切れ、「もう一度挑戦する」の体験が大幅に劣化する。また、ResultCard内のShareButtonsの shareUrl が window.location.origin を使っているのは、受検者がシェアする際に専用ルートのURLを渡すためであり、1ページ統合ではこの仕組みが不要になるが、代わりに全体アーキテクチャの変更が必要
- 判断理由: 受検者の「もう一度挑戦する」体験を犠牲にするため不採用

**選択肢B: 受検者向け/第三者向けで別テキスト（文体分け）**（不採用）

- 同じページだが、受検者向けの文体（「あなたは〜」）と第三者向けの文体（「このタイプの人は〜」）を出し分ける案
- 問題点: contrarian-fortune のコンテンツはすでに三人称で書かれている（「このタイプは〜」）。受検者向けに二人称に書き換えると、各フィールドが2倍に増え、データ管理の複雑さが大幅に増す。また、実際のコンテンツを読むと、三人称でも受検者が「自分のこと」として楽しめる書き方になっており（例: 「電車が遅延して乗り換えを逃したとき〜」）、文体分けによるUX向上効果が限定的
- 判断理由: 実装コストに対してUX向上効果が限定的なため不採用

**選択肢C: 2ページ分離 + 共通コンポーネント（現状パターン改良）**（採用）

- ResultCard（受検者向け）と専用ルート（第三者向け）の2ページ構成を維持し、共通コンポーネントでコンテンツの一貫性を担保する
- ResultCard: catchphraseBeforeDescription + 共通コンポーネント（coreSentence〜全タイプ一覧）
- 専用ルート: colorHero(catchphrase) + DescriptionExpander + CTA + 共通コンポーネント + CTA2
- 判断理由: 受検者体験（もう一度挑戦する、クイズフローとの統合）を維持しつつ、第三者体験（CTA配置、colorHero、OGP最適化）を最大化できる。impossible-advice で確立されたパターンと統一性があり、保守性も高い

**選択肢D: 3ページ構成（ResultCard + 受検者専用ルート + 第三者専用ルート）**（不採用）

- 受検者がシェアした後に見る「自分の結果ページ」と、第三者が見る「シェアされた結果ページ」を分ける案
- 問題点: 現状のアーキテクチャでは受検者のシェアURLは専用ルートを指しており（shareUrl が /play/slug/result/id）、受検者自身がそのURLを訪れた場合と第三者が訪れた場合を区別する手段がない。Cookie等で区別することは可能だが、アーキテクチャの大幅変更が必要
- 判断理由: アーキテクチャ変更のコストに対してUX向上効果が不明確なため不採用

#### 3. 体験フローの検討

**選択肢A: 現状の順序（catchphrase → coreSentence → behaviors → ShareButtons → persona → thirdPartyNote → humorMetrics → 全タイプ一覧）**（不採用）

- ShareButtons がコンテンツ途中にあり、読了前にシェアを促している。persona, thirdPartyNote, humorMetrics を読む前にシェアを求めるのは、まだコンテンツの価値を十分に体験していない段階での誘導であり、シェア率を下げる可能性がある

**選択肢B: coreSentence → behaviors → persona → thirdPartyNote → humorMetrics の順（採用）**

- 「逆張りの核心提示 → 共感ポイント → 深い理解 → 第三者視点 → 笑い」という体験フロー
- coreSentence で「このタイプの本質」を提示してから、behaviors で「わかる!」共感を得る。persona で内面を深く理解し、thirdPartyNote で「周りからどう見えるか」という新たな視点を提供。最後に humorMetrics で軽い笑いを残す
- CTA1 は colorHero 後（ファーストビュー付近）、CTA2 は全タイプ一覧の前（読了後）に配置
- 判断理由: 体験の深度が段階的に増していく構成であり、最も自然なフロー

**選択肢C: behaviors → coreSentence → persona → thirdPartyNote → humorMetrics の順**（不採用）

- 「あるある」を最初に持ってきて共感から入る案
- 問題点: behaviors は coreSentence（逆張りフレームの核心）を理解してから読んだ方が「だからこういう行動をするのか」という納得感が増す。先に behaviors を見ると、なぜそういう行動をするのかの文脈が不足する
- 判断理由: 核心提示 → 共感の順序の方が体験として優れている

**選択肢D: persona を先、behaviors を後にする順序**（不採用）

- 長い散文（persona）を先に読ませ、その後にリスト（behaviors）で軽く読ませる案
- 問題点: 箇条書きの方が認知負荷が低く、読者の離脱を防ぎやすい。先にリストで興味を引いてから散文に進む方が、全体の読了率が高くなる
- 判断理由: エンゲージメントの観点からリスト → 散文の順が優れている

### 計画にあたって参考にした情報

- **impossible-advice の再設計実装** (cycle-153): page.tsx, ImpossibleAdviceContent.tsx, page.module.css, ImpossibleAdviceContent.module.css のパターンを基準とした
- **cycle-152/153 の事故報告**: ページ構成のゼロベース検討漏れ（事故6、事故3として再発）を踏まえ、4つのページ構成選択肢を明示的に比較検討した
- **cycle-153 の申し送り**: devサーバー不可、CSSフォールバック、WCAG AA、CTA幅、バンドルバジェット等の注意事項を計画に反映
- **WCAG AAコントラスト比計算**: 全8タイプの色を白背景(#ffffff)に対して計算し、4色が4.5:1未満であることを特定。Tailwind CSS カラースケールの-700 variant を代替色として選定
- **ResultCard.tsx の CATCHPHRASE_VARIANTS**: contrarian-fortune が含まれていないことを確認。他の7 variant が含まれており、追加が必要
- **ContrarianFortuneDetailedContent 型定義** (types.ts L49-64): 6フィールドの型と制約を確認
- **既存データ** (contrarian-fortune.ts): 全8タイプのコンテンツを確認し、coreSentence/persona の役割の違い、humorMetrics の有無（6/8タイプ）、文体（三人称）を把握

## レビュー結果

### 計画レビュー（2回）

- R1: 3件の指摘（ResultCard側セクション拡大の説明不足、allResults prop受け渡し記載漏れ、description折りたたみ閾値の未記載）→修正
- R2: 指摘事項なし、承認

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 次サイクルへの申し送り

<前サイクルの申し送りを確認し、引き続き有効なものを残す。今回のサイクルで学んだ教訓や次以降のPMに役立つ知見を追記する。>

## 補足事項

なし

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
