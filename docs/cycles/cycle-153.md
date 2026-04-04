---
id: 153
description: "結果体験の再設計: impossible-advice（B-271）"
started_at: "2026-04-04T13:03:19+0900"
completed_at: "2026-04-04T15:10:51+0900"
---

# サイクル-153

impossible-advice（ありえないアドバイス診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [x] ImpossibleAdviceDetailedContent variant型を types.ts に追加する（Step 1）
- [x] 最初の3タイプ（timemagician, gravityfighter, digitalmonk）を新variant形式に変換し、トーン基準を確立する（Step 2）
- [x] 残り4タイプ（sleeparchitect, conversationsamurai, weathercontroller, snackphilosopher）を新variant形式に変換する（Step 3）
- [x] resultPageLabels を更新する（Step 4）
- [x] ImpossibleAdviceContent 専用コンテンツコンポーネント + CSS を作成する（Step 5）
- [x] ResultCard にimpossible-advice variantの統合を行う（Step 6）
- [x] 専用ルート + OGP画像を作成する（Step 7）
- [x] テストを作成・更新する（Step 8）
- [x] ビルド検証・ビジュアル確認（全7タイプ × デスクトップ/モバイル × ライト/ダーク）を実施する（Step 9）
- [x] クリーンアップ・FAQテキスト確認を行う（Step 10）
- [x] レビューを実施し、指摘事項をすべて解消する

## 作業計画

### 目的

「達成困難アドバイス診断」（impossible-advice）の結果体験を、このクイズ固有の面白さ――「正しいけれど実行不可能なアドバイス」のギャップユーモアと、「あるある」への共感、そして意外にもまともな実用的アドバイスによるポジティブな余韻――を最大限に引き出す専用variantに再設計する。

ターゲットは「手軽で面白い診断を楽しみたい人」。結果を見た瞬間に笑い、読み進めて「わかる！」と共感し、最後に「あ、これは本当に使えるかも」と前向きな気持ちになり、「面白かったからシェアしよう」と行動する一連の体験を設計する。

受検者本人（診断直後）、第三者（シェアリンク経由）、両者の会話（「俺は時間魔術師見習いだったww」「おやつの哲学者やばい笑」）の3シナリオすべてで最高の体験を提供する。

### フィールド設計: ImpossibleAdviceDetailedContent

| フィールド      | 型                    | 文字数目安 | 役割・設計理由                                                                                                                                                                                                                                                                                                                                     |
| --------------- | --------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`       | `"impossible-advice"` | -          | discriminated union 識別子                                                                                                                                                                                                                                                                                                                         |
| `catchphrase`   | `string`              | 15-30字    | タイプのキャッチコピー。OGP・シェア時の第一印象を決める一行（確立パターン）。例: 「あなたの1日は25時間制」（時間魔術師見習い）、「重力は友だち、ただしツンデレ」（重力と戦う者）                                                                                                                                                                   |
| `diagnosisCore` | `string`              | 80-150字   | **このクイズならでは**: 「あなたの悩みの本質」を鋭くユーモラスに分析するテキスト。現在未表示のtraitsを散文形式に再構成。「この悩みの正体」を箇条書きではなく、読み物として語ることで「そうそう、まさにそれ！」という自己認識の快感を提供する。traitsの箇条書きは共感度が浅くなりがちだが、散文にすることで読者が「物語として自分を見る」体験になる |
| `behaviors`     | `string[]`            | 4項目      | あるある・共感シーン（確立パターン）。「ついやってしまうこと」として具体的な日常シーンを描写。既存behaviorsの微調整（4項目統一）。このクイズのbehaviorsは「悩みを自覚しつつもやめられない行動」に特化しており、他クイズの「性格あるある」とは質的に異なる                                                                                          |
| `practicalTip`  | `string`              | 30-80字    | **このクイズならでは**: 「本当に使える小さなアドバイス」。descriptionの「ありえないアドバイス」との対比で「え、これはガチで使えるやつだ」と思わせる締めのセクション。既存adviceのリライト。このクイズの核心的ギャップ（無理なアドバイス vs 本当に役立つヒント）を最も効果的に演出するフィールド                                                    |

**フィールド構成の設計意図**:

このクイズの体験の核心は3段階のギャップにある:

1. descriptionの「ありえないアドバイス」で爆笑する（コメディ）
2. diagnosisCoreとbehaviorsで「自分のことだ」と気づく（自己認識・共感）
3. practicalTipで「あ、これは本気で役に立つ」と思う（ポジティブな裏切り）

このため、フィールドは「笑い → 共感 → 実用」の3段階を過不足なくカバーする4フィールド（catchphrase + diagnosisCore + behaviors + practicalTip）に絞った。

**traitsを独立セクションにせず、diagnosisCoreに統合した理由**:

現在のtraitsは「この悩みの正体」として3-4項目の箇条書きだが、以下の理由で散文セクション（diagnosisCore）に再構成する:

- 箇条書きの「特徴リスト」は自己分析寄りで、このクイズの軽妙なユーモアトーンと相性が悪い
- 散文にすることで「あなたの悩みの本質はこうです」と語りかけるトーンになり、読者が「物語として自分を理解する」面白さが生まれる
- unexpected-compatibilityのentityEssence（存在の本質を哲学的に語る）と同じ発想だが、こちらは「悩みの本質」をユーモラスに語る
- whyCompatibleのような第2散文フィールドは不要。このクイズは「相性」を語るものではなく、1つの散文で悩みの核心を捉えれば十分

**practicalTipという名前にした理由**:

既存の`advice`を`practicalTip`にリネームするのは、descriptionに書かれた「ありえないアドバイス」と区別するため。descriptionが「アドバイス（実行不可能）」、practicalTipが「ヒント（本当に使える）」というコントラストを名前レベルでも明確にする。

**標準形式からの変換方針**:

- `traits` → `diagnosisCore`に再構成。3-4項目のtraitsを1つの散文（80-150字）にリライト。「あなたの悩みの本質はこういうことだ」というトーンで、読み物として楽しめる文体にする
- `behaviors` → 維持・微調整。4項目に統一し、「ついやってしまうこと」のトーンを維持。既に十分な品質があるため大幅な変更は不要
- `advice` → `practicalTip`にリライト。「本当に使える小さなヒント」としてのトーンを強化。既存のadviceは既にこの方向性にあるため、文字数調整と文体統一が主な作業

### 表示セクション構成: ImpossibleAdviceContent コンポーネント

表示順（上から下）:

1. **catchphrase**（呼び出し側で表示 -- ResultCard/page.tsxの責務。colorHeroセクション）
2. **description**（呼び出し側で表示 -- ResultCard/page.tsxの責務。catchphraseの直下）。このクイズの「笑い」フェーズを担う最重要コンテンツ。「【本日のアドバイス】」ヘッダー付きの「ありえないアドバイス」が含まれており、体験フロー全体の起点となる。descriptionを読んで笑った後に、以降のセクションで深みを提供する構成
3. **「あなたの悩みの本質」**（diagnosisCore セクション）
   - 悩みの核心をユーモラスに分析する散文。descriptionの「無理なアドバイス」で笑った後に「でも本当の問題はこういうことだよね」と鋭く指摘される体験
4. **「ついやってしまうこと」**（behaviors セクション）
   - 共感あるある4項目。diagnosisCoreで指摘された悩みの「日常での現れ」を具体的シーンで描写。「わかるwww」を誘発する
5. **「本当に使える小さなヒント」**（practicalTip セクション）
   - descriptionの「無理なアドバイス」との対比で「これはガチで使えるやつだ」と思わせる。ポジティブな余韻で結果体験を締める
6. **全タイプ一覧**（他のタイプも見てみよう）

**構成の意図**: catchphraseで興味を引く → descriptionの「ありえないアドバイス」で爆笑する → diagnosisCoreで「自分のことだ」と刺さる → behaviorsで「わかるwww」と共感する → practicalTipで「あ、これは使える」とポジティブに締める → 全タイプ一覧で他タイプを探索。興味→笑い→自己認識→共感→実用→探索の6段階フロー。

**会話シナリオの設計判断**: 第三者との会話（「俺は時間魔術師見習いだったww」「おやつの哲学者やばい笑」）においては、descriptionの「ありえないアドバイス」が会話の主要ネタとなり、catchphraseとタイプ名がアイデンティティを表現する。これらの既存フィールドで会話の盛り上がりに必要な要素は十分にカバーされるため、会話専用の追加コンテンツ（会話テンプレートや比較テキスト等）は設けない。

### 作業内容

**Step 1: 型定義の追加**

- ファイル: `src/play/quiz/types.ts`
- `ImpossibleAdviceDetailedContent` インターフェースを追加（variant: "impossible-advice", catchphrase, diagnosisCore, behaviors, practicalTip）
- `DetailedContent` union型に追加
- JSDocコメントも更新

**Step 2: データ変換（バッチ1: 最初の3タイプ）**

- ファイル: `src/play/quiz/data/impossible-advice.ts`
- timemagician, gravityfighter, digitalmonk の3タイプを新variant形式に変換
- catchphrase新規作成、traits → diagnosisCore再構成（箇条書き→散文）、behaviors微調整（4項目に統一）、advice → practicalTipリライト
- WCAG AA未達の4色（gravityfighter #ea580c, digitalmonk #059669, weathercontroller #0891b2, snackphilosopher #f59e0b）について、白背景コントラスト比4.5:1以上を満たす代替色を選定し、データに反映する。このバッチではgravityfighterとdigitalmonkの2色を対応する
- 最初の1-2タイプでトーン基準（ユーモラスな分析トーン、文字数感）を確立し、残り1タイプはそれに合わせる
- **既存テストファイルの更新**: `src/play/quiz/data/__tests__/impossible-advice-detailed-content.test.ts` と `impossible-advice-traits-advice-quality.test.ts` を新variant形式に合わせて修正（`QuizResultDetailedContent`型のキャスト→`ImpossibleAdviceDetailedContent`型に変更、traits→diagnosisCoreの検証、advice→practicalTipの検証）

**Step 3: データ変換（バッチ2: 残り4タイプ）**

- ファイル: `src/play/quiz/data/impossible-advice.ts`
- sleeparchitect, conversationsamurai, weathercontroller, snackphilosopher の4タイプを新variant形式に変換
- バッチ1で確立したトーン基準に厳密に合わせる
- WCAG AA未達の残り2色（weathercontroller #0891b2, snackphilosopher #f59e0b）について、白背景コントラスト比4.5:1以上を満たす代替色を選定し、データに反映する

**Step 4: resultPageLabels の更新**

- ファイル: `src/play/quiz/data/impossible-advice.ts`
- meta.resultPageLabels を削除（専用コンポーネントでセクション見出しをハードコードするため不要になる）

**Step 5: 専用コンテンツコンポーネントの作成**

- ファイル: `src/play/quiz/_components/ImpossibleAdviceContent.tsx`
- ファイル: `src/play/quiz/_components/ImpossibleAdviceContent.module.css`
- UnexpectedCompatibilityContentと同じパターンのServer Component
- diagnosisCore / behaviors / practicalTip / 全タイプ一覧の4セクション
- afterPracticalTip スロット（CTA等を挿入するため）
- --type-color CSS変数で各タイプのカラーを反映
- ダークモード対応（color-mix()による明度調整）

**Step 6: ResultCard への統合**

- ファイル: `src/play/quiz/_components/ResultCard.tsx`
- CATCHPHRASE_VARIANTS に "impossible-advice" を追加
- CATCHPHRASE_ACCENT_COLOR に タイプ固有色（result.color）を設定
- dynamic import で ImpossibleAdviceContent を遅延ロード
- `renderDetailedContent` のswitch文に `case "impossible-advice":` を追加
  - `headingLevel={3}`, `allTypesLayout="pill"`, `resultColor={resultColor ?? ""}`
  - `referrerTypeId` は不要（一人完結型のため除外）
  - `afterPracticalTip` スロットはResultCard内では不要

**Step 7: 専用ルートの作成**

- ファイル: `src/app/play/impossible-advice/result/[resultId]/page.tsx`
- ファイル: `src/app/play/impossible-advice/result/[resultId]/page.module.css`
- ファイル: `src/app/play/impossible-advice/result/[resultId]/opengraph-image.tsx`
- unexpected-compatibility の専用ルートをテンプレートとして使用
- 相性機能は不要（一人完結型）のため、CompatibilityDisplay / InviteFriendButton / searchParams 関連は除外
- generateStaticParams, generateMetadata, OGP画像生成を実装
- OGP画像: result.color（タイプ固有色）を使用、WCAG AA自動判定
- shareTextのハッシュタグ: ResultCardのshareTextは `#${quizTitle.replace(/\s/g, "")}` で自動生成されるため `#達成困難アドバイス診断`（17文字）になる。専用ルートのshareTextはカスタマイズ可能だが、統一性のため同じハッシュタグを使用する。短縮候補（`#無理アドバイス診断` 10文字、`#ありえないアドバイス` 11文字）も検討したが、クイズの正式名称との一致を優先し `#達成困難アドバイス診断 #yolosnet` を採用する。Xの140字制限下でも結果テキスト+ハッシュタグ+URLで十分収まる長さである

**Step 8: テストの作成・更新**

- ファイル: `src/app/play/impossible-advice/result/[resultId]/__tests__/page.test.tsx`（新規）
  - 正常系: 有効なresultIdでページ関数が動作する（generateStaticParams, generateMetadata）
  - 異常系: 無効なresultIdでgenerateMetadataが空を返す
  - 全7タイプのresultIdを返すことの確認
  - CTAテキストがモバイル(375px)で1行に収まる長さであること
- ファイル: `src/play/quiz/data/__tests__/impossible-advice-detailed-content.test.ts`（更新）
  - `QuizResultDetailedContent`型→`ImpossibleAdviceDetailedContent`型に変更
  - traits検証→diagnosisCore検証（string型、80-150字）に変更
  - advice検証→practicalTip検証に変更
  - catchphrase検証を追加（15-30字）
  - variant === "impossible-advice" の確認を追加
- ファイル: `src/play/quiz/data/__tests__/impossible-advice-traits-advice-quality.test.ts`（更新）
  - R2-1: traits→diagnosisCoreのdescriptionとの重複チェックに変更
  - R2-2: advice→practicalTipのアクション指向チェックに変更

**Step 9: ビルド検証・ビジュアル確認**

- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- `npm run build && npx next start` で本番ビルドを起動し、専用ルートが正しく動作することを確認
- 全7タイプの結果ページをPlaywrightでビジュアル確認（デスクトップ/モバイル × ライト/ダーク = 4パターン × 7タイプ = 28枚）
- descriptionの長文表示が各タイプで適切にレイアウトされていることを確認（特にモバイル幅での改行・余白・可読性）。descriptionはこのクイズの「笑い」フェーズを担う最重要コンテンツであり、表示崩れは体験の致命的な毀損となる
- OGP画像の色がタイプ固有色になっていることを確認

**Step 10: クリーンアップ**

- resultPageLabels削除後、他のテストやコードに影響がないことを確認
- FAQテキストの確認（コードのフィールド名が露出していないか）

### 注意事項

- **前サイクルからの申し送り**:
  - 推測するな、確認しろ: 判断の根拠は必ず現在のファイル・データ・ビルド結果で確認する
  - constitutionの基準は「最高の価値」: 「十分」「問題なし」ではなく「最高の価値」
  - 自分が決めたものは変更できる: AIが決めた色・テキスト等は制約ではない
  - スキルの手順を実行前に必ず読む: 記憶に頼らない

- **専用ルート追加後のビジュアル確認はdevサーバーでは不可**: `npm run build && npx next start` で本番ビルドを使うこと。devサーバーではNext.js App Routerのルーティングマニフェストがビルド時に生成されるため、専用ルートが動的ルートにフォールバックする偽陽性が発生する

- **CSSカスタムプロパティにフォールバック値を付ける**: `var(--type-color, #374151)` のように。フォールバックがないとSSR時やprops未設定時に透明になる

- **FAQテキストにコードのフィールド名を露出させない**: `diagnosisCore`や`practicalTip`のようなフィールド名を来訪者向けテキストに含めない

- **データ変換はバッチ分割**: 最初の3タイプでトーン基準を確立してから残り4タイプに展開。口調の一貫性は既存descriptionで照合する

- **このクイズは創作コンテンツ**: diagnosisCoreの「悩みの本質分析」はあくまで軽いユーモアとして書く。「心理学的に証明された」「医学的に」等の事実っぽい表現は避ける。trustNote（「アドバイスは実行しないでください」）との整合性も保つ

- **相性機能は不要**: 一人完結型の診断。CompatibilityDisplay / InviteFriendButton / searchParams 関連のコードは除外する

- **全タイプ一覧のレイアウト**: 7タイプのため、専用ルート・ResultCard両方で "pill"（ピル型横wrap）を使用。7タイプはyoji-personalityの8タイプと同程度だがpillの方がコンパクトに表示できる

- **タイプカラーのWCAG AA準拠確認**: 現在の7色のうち、白背景でのコントラスト比4.5:1を満たさない色が4色ある。gravityfighter (#ea580c: 3.56:1)、digitalmonk (#059669: 3.77:1)、weathercontroller (#0891b2: 3.68:1)、snackphilosopher (#f59e0b: 2.15:1)。Step 2およびStep 3のデータ変換時に、これら4色のWCAG AA準拠代替色を選定して適用すること（残り3色 #7c3aed, #1e40af, #db2777 は4.5:1以上で問題なし）

### 検討した他の選択肢と判断理由

**選択肢A（採用）: diagnosisCore（散文） + behaviors + practicalTip の3セクション構成**

- traitsを散文化してdiagnosisCoreに統合し、behaviorsは維持、adviceをpracticalTipにリネームする構成
- 採用理由: このクイズの体験フロー「笑い→自己認識→共感→実用」に過不足なくマッピングされる。descriptionが「笑い」を、diagnosisCoreが「自己認識」を、behaviorsが「共感」を、practicalTipが「実用」を担い、各フェーズに専用のセクションがある
- traitsを散文化することで、箇条書きリストが2つ並ぶ（traits + behaviors）重複感を解消し、散文+箇条書きの交互リズムで読みやすさを向上させる

**選択肢B（不採用）: traits（箇条書き維持） + behaviors + practicalTip の3セクション構成**

- 現在のtraitsをそのまま箇条書きで表示する案
- 不採用理由: traitsとbehaviorsが両方とも箇条書きリストになり、ページが単調になる。「悩みの正体」を箇条書きで並べると自己分析ツールのような印象になり、このクイズの軽妙なユーモアトーンと乖離する。散文の方が「語りかけ」のトーンになり、読み物としての面白さが生まれる

**選択肢C（不採用）: diagnosisCore + impossibleAdviceHighlight + behaviors + practicalTip の4セクション構成**

- descriptionに含まれる「ありえないアドバイス」部分を独立セクション（impossibleAdviceHighlight）として抽出・ハイライト表示する案
- 不採用理由: descriptionは既にResultCard/page.tsxのメインエリアに表示されるため、同じ内容を別セクションに再掲すると冗長。descriptionの中でアドバイス部分は十分に目立つ書き方（【本日のアドバイス】ヘッダー付き）になっており、追加ハイライトは不要

**選択肢D（不採用）: diagnosisCore + whyImpossible + behaviors + practicalTip の4セクション構成**

- 「なぜこのアドバイスは達成困難なのか」を解説するwhyImpossibleフィールドを追加する案
- 不採用理由: descriptionの「ありえないアドバイス」は読めば明らかに不可能とわかるレベルのユーモアであり、「なぜ不可能か」の解説はジョークの説明になってしまう。ユーモアコンテンツにおいて「笑いの説明」は面白さを減殺する。ツッコミは読者自身が行う方が楽しい

**選択肢E（不採用）: unexpected-compatibilityパターンの踏襲（entityEssence + whyXxx + behaviors + yyy）**

- cycle-152で確立した2散文フィールド + 箇条書き + 締めのパターンをそのまま適用する案
- 不採用理由: cycle-146の教訓「ゼロベースで検討する」に従い、各クイズの独自性に基づいて判断する。unexpected-compatibilityのentityEssence + whyCompatibleは「存在の本質」と「相性の理由」という2つの異なる切り口が必要だったが、impossible-adviceでは「悩みの本質」1つで十分。フィールド数を増やすことが体験の向上につながらない場合、シンプルな構成の方が読者の集中を維持できる

### 計画にあたって参考にした情報

- **既存再設計パターン**: cycle-152（unexpected-compatibility）の作業計画・フィールド設計・実装構成を主なテンプレートとして参照。ただし「ゼロベースで検討」の原則に基づき、フィールド構成はimpossible-advice固有の判断を行った
- **既存variant型の一覧**: types.ts に定義された9つのvariant型（標準形式含む）のフィールド設計を比較し、各クイズがどのように独自性を反映したフィールドを持っているか確認
- **impossible-adviceデータの精読**: 全7タイプのdescription、traits、behaviors、adviceの内容・トーン・文字数を精読し、各フィールドの質と役割を把握。特にtraitsが現在表示されていないこと、adviceが意外にも実用的であることを確認
- **UnexpectedCompatibilityContent**: 相性機能を持たないvariantの専用コンテンツコンポーネントの実装パターン（Server Component、afterLifeAdviceスロット）を参照
- **ResultCard.tsx**: CATCHPHRASE_VARIANTS / CATCHPHRASE_ACCENT_COLOR の管理パターン、renderDetailedContentのswitch文の構成を確認
- **既存テストファイル**: impossible-advice-detailed-content.test.tsとimpossible-advice-traits-advice-quality.test.tsの構造を確認し、新variant形式への更新方針を策定
- **申し送り事項**: cycle-152から引き継いだ注意事項（devサーバー不可、CSSフォールバック、FAQ露出、バッチ分割、タイプカラー変更可能）を計画に反映
- **cycle-152事故報告**: 7件の事故報告を参照し、同種のミスを防ぐための注意事項を計画に組み込んだ（ビジュアルレビューの全パターン確認、受検者本人向けResultCardの確認、推測ではなく実機検証など）

## レビュー結果

### 計画レビュー（2回）

- R1: WCAGコントラスト比の認識不正確（4色未達を1色のみと誤認）、shareTextハッシュタグの未検討、description表示位置の曖昧さ、会話シナリオ設計の不足の4件指摘→修正
- R2: 指摘事項なし、承認

### ビジュアルレビュー: 第三者向け結果ページ（1ラウンド）

- R1（全7タイプ × デスクトップ/モバイル × ライト/ダーク = 28枚）: 指摘事項なし、承認

### ビジュアルレビュー: 受検者本人向けResultCard

- クイズを実際に受験してResultCardの表示を検証（結果: 重力と戦う者）
- デスクトップ×ライト/ダーク、モバイル×ライト/ダーク=4パターンすべてでスクリーンショット撮影
- catchphrase、diagnosisCore、behaviors、practicalTip、全タイプ一覧（pill）がすべて正常に表示されることを確認
- 承認

### 実装修正: バンドルバジェット超過

- ResultCard.tsxからクイズデータの直接インポート（impossibleAdviceQuiz, unexpectedCompatibilityQuiz）を削除し、allResults propに変更。/play/[slug]が149KB→140KB以内に収まるよう修正

### 実装レビュー（1回）

- R1: コード品質、コンテンツ品質、WCAG AA準拠、ダークモード対応、バンドルバジェット修正、テスト網羅性の全観点で確認。指摘事項なし、承認

## キャリーオーバー

なし

## 次サイクルへの申し送り

### 作業の心構え

- **推測するな、確認しろ**: 判断の根拠となる事実は、必ず現在のファイル・データ・ビルド結果で確認する。記憶やキャッシュに頼らない。バグの可能性が報告されたら、コードを読んで「問題ないはず」と推測するのではなく、実際にブラウザで再現を試みて検証すること
- **constitutionの基準は「最高の価値」**: レビューや判断の基準は「十分」「問題なし」ではなく「最高の価値を提供しているか」。常に「もっと良くできないか？」を問いかける
- **自分が決めたものは変更できる**: AIが決めた色・テキスト・レイアウト等は制約ではない。来訪者にとってより良い選択があれば躊躇なく変更する
- **問題には根本解決で対応する**: 場当たり的な解決策ではなく共通の仕組みで根本解決する
- **「現状そうなっているから正しい」は根拠にならない**: ゼロベースで検討する
- **スキルの手順を実行前に必ず読む**: 記憶に頼らない。やり直し時も正規のスキルフロー（`/cycle-execution` 等）を省略しない
- **すべての変更にレビューが必須**: バグ修正・リファクタリング・小さな追加修正であっても、レビューなしでコミットしてはならない。「明らかに正しい」修正ほど見落としが潜む

### ビジュアルレビューの必須ルール

- **すべての画面 × デスクトップ/モバイル × ライト/ダークの全組み合わせをスクリーンショットで確認する**: コードレビューだけではレビュー完了にならない
- **受検者本人向け（ResultCard）と第三者向け（専用ルート）の両方を確認する**: 第三者向けだけでは片手落ち。ResultCardはクイズを実際に受けて表示を確認すること
- **devサーバーではなく本番ビルドで確認する**: `npm run build && npx next start` を使う。devサーバーでは専用ルートが動的ルートにフォールバックする偽陽性が発生する

### よくある落とし穴

- **CSSカスタムプロパティにフォールバック値を付ける**: `var(--type-color, #374151)` のように。フォールバックがないとSSR時やprops未設定時に透明になる
- **FAQテキストにコードのフィールド名を露出させない**: 来訪者向けの自然な日本語のみで記述する
- **コンテンツに事実を含める場合はファクトチェックを怠らない**: AIが「もっともらしいが裏付けのない記述」を生成するリスクに常に注意。創作コンテンツはその旨を明示する
- **色はWCAG AA準拠（白背景コントラスト比4.5:1以上）を必ず満たす**: 計画段階で全色のコントラスト比を計算し、不足する色を早期に特定しておく。ダークモードでも視認性を確認する
- **CTAボタンのテキストはモバイル375px幅で1行に収まる長さにする**: 長いと2行折り返しになり不安定に見える
- **多くのページで使われる共有コンポーネントにデータファイルを直接インポートしない**: そのデータが全ページのバンドルに含まれてバンドルバジェットを超過する。データはpropsで親から渡すか、dynamic importで分離する

### データ変換作業のコツ

- **大量タイプのデータ変換はバッチ分割する**: 最初のバッチ（2-3タイプ）でトーン基準を確立してから残りに展開すると品質のばらつきを防げる
- **口調の一貫性は既存descriptionで照合する**: 新規フィールドの口調がdescriptionと一致しているか、各タイプで必ずチェックする

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
