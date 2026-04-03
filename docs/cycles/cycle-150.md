---
id: 150
description: "結果体験の再設計: yoji-personality（B-268）"
started_at: "2026-04-03T18:19:05+0900"
completed_at: null
---

# サイクル-150

yoji-personality（四字熟語性格診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [ ] yoji-personalityの現状の結果ページ・データ構造・コンテンツを全面的に把握する
- [ ] 受検者本人・第三者・会話の3シナリオにおける理想体験をゼロベースで設計する
- [ ] YojiPersonalityDetailedContent variant型を定義・実装する
- [ ] 全タイプのデータを新variant型に変換する
- [ ] 専用具体ルート＋OGP画像を実装する
- [ ] 受検者/第三者で統一体験を実装する
- [ ] ダークモード対応・WCAG AA準拠を確認する
- [ ] レビューを実施し、指摘事項をすべて解消する

## 作業計画

### 目的

四字熟語性格診断（yoji-personality）の結果体験を、四字熟語の文化的独自性を活かした専用 variant に再設計する。現在の標準形式（traits/behaviors/advice）から脱却し、「四字熟語で自分を表現される面白さ」「漢字の意味の深さ」「座右の銘としての共有価値」を来訪者に届ける体験を実現する。

### フィールド設計: YojiPersonalityDetailedContent

四字熟語の独自性から導出した新フィールド構成:

| フィールド       | 型                   | 文字数目安 | 設計理由                                                                                                                                                                                                                                                               |
| ---------------- | -------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`        | `"yoji-personality"` | -          | discriminated union 識別子                                                                                                                                                                                                                                             |
| `catchphrase`    | `string`             | 15-30字    | タイプのキャッチコピー。OGP・シェア時の印象を決める一行（確立パターン）                                                                                                                                                                                                |
| `kanjiBreakdown` | `string`             | 80-150字   | **四字熟語ならでは**: 漢字一字ずつの意味を分解し、組み合わせで生まれる意味を解説。例:「初」はものごとの始まり、「志」はこころざし・目標、「貫」はつらぬく、「徹」は最後までやり通す。来訪者が「へえ、そういう意味なんだ」と学びを得る                                  |
| `origin`         | `string`             | 80-150字   | **四字熟語ならでは**: 出典・由来の解説。中国古典や日本の歴史的エピソードなど。来訪者の知的好奇心を満たし、SNSシェア時の会話ネタになる。**ファクトチェック必須**                                                                                                        |
| `behaviors`      | `string[]`           | 4項目      | あるある・共感シーン（確立パターン）。四字熟語の精神が日常に現れる場面                                                                                                                                                                                                 |
| `motto`          | `string`             | 20-80字    | **四字熟語ならでは**: 座右の銘としてのひとこと。四字熟語は座右の銘に使われることが多いという文化的特性を活かし、「この四字熟語を胸に生きるあなたへ」のようなメッセージ。colorAdvice/todayAction に相当する締めのセクションだが、「座右の銘」という切り口が四字熟語固有 |

**標準形式からの変換方針**:

- `traits`（気性）: 削除。kanjiBreakdown と origin がタイプの本質を「四字熟語の言葉そのもの」から説明するため、別途「特徴リスト」は不要。特徴は behaviors の中に自然に表現される
- `behaviors`（体現する場面）: 維持・リライト。4項目に統一し、四字熟語の精神が日常で現れる瞬間にフォーカス
- `advice`（活かすには）: motto に置き換え。汎用アドバイスではなく「座右の銘」というフレーミングで四字熟語の共有価値を高める

**traditional-color との対比**:

- traditional-color: colorMeaning（色の文化的意味）/ season（季節）/ scenery（風景）→ 色の視覚的・文化的世界観
- yoji-personality: kanjiBreakdown（漢字の意味分解）/ origin（出典・由来）→ 言葉の知的・歴史的世界観
- 両者とも「その題材の文化的資産」をフィールドとして体現している

### 表示セクション構成: YojiPersonalityContent コンポーネント

表示順（上から下）:

1. **catchphrase**（呼び出し側で表示 — ResultCard/page.tsx の責務）
2. **「この四字熟語の成り立ち」**（kanjiBreakdown セクション）
   - 漢字一字ずつの意味を紐解く知的コンテンツ。来訪者の「へえ」を引き出す
3. **「この四字熟語のルーツ」**（origin セクション）
   - 歴史的背景・出典の解説。知的好奇心とシェア欲を刺激する
4. **「この四字熟語が現れる日常」**（behaviors セクション）
   - 共感あるある4項目。「わかる!」を引き出すおなじみのセクション
5. **「座右の銘として」**（motto セクション）
   - 締めのメッセージ。四字熟語を自分のモットーとして持ち帰れる一言
6. **afterMotto スロット**（CTA等のページ固有要素を注入）
7. **全タイプ一覧**（他の四字熟語も見てみよう）

**構成の意図**: 知的コンテンツ（成り立ち→ルーツ）→ 共感コンテンツ（あるある）→ 持ち帰り（座右の銘）の流れ。最初に「なるほど」を提供してから共感に入り、最後に「自分のモットー」として記憶に残す。

### 実装ステップ

#### Step 1: 型定義

**変更ファイル**: `src/play/quiz/types.ts`

- `YojiPersonalityDetailedContent` インターフェースを追加（variant: "yoji-personality", catchphrase, kanjiBreakdown, origin, behaviors, motto）
- `DetailedContent` union 型に `YojiPersonalityDetailedContent` を追加

#### Step 2: データ変換

**変更ファイル**: `src/play/quiz/data/yoji-personality.ts`

**Step 2-a: origin の事前調査（ファクトチェック）**

- データ作成の前に、8タイプすべての四字熟語の出典・由来をWeb検索で事前確認する
- 各四字熟語について「出典が明確（特定の古典・文献が特定できる）」か「出典不明確（合成語型、出典に諸説あり等）」かを分類する
- 分類結果に基づいて、origin フィールドの書き方トーンを事前に統一する:
  - **出典が明確な場合**: 出典名を含めた具体的な由来の解説（例: 「『〇〇』に由来する」）
  - **出典が不明確な場合**: 漢字の組み合わせの成り立ち、日本語での定着経緯、日常での使われ方の変遷など、出典以外の角度で由来を記述する。「由来には諸説ある」「〜とされる」等の適切な注記を含める
  - AIが「もっともらしいが裏付けのない記述」を生成するリスクを常に意識し、確認できない情報は記載しない

**Step 2-b: データ作成**

- 全8タイプの detailedContent を新 variant 形式に書き換え
- catchphrase: 新規作成（15-30字のキャッチコピー）
- kanjiBreakdown: 新規作成（漢字4文字の意味分解 + 組み合わせの意味解説）
- origin: Step 2-a の事前調査結果に基づいて作成。具体的な書籍名・人名を含む場合は、ファクトチェック済みであることをデータファイル内にコメントで明記する
- behaviors: 既存データをベースにリライト（4項目に統一）
- motto: 既存の advice をベースにリライト（座右の銘としてのフレーミングに変更）
- FAQ 回答テキストの更新: 新フィールド構成（kanjiBreakdown / origin / behaviors / motto）に合わせて FAQ の説明文を修正する
- `resultPageLabels` をメタから削除（専用コンポーネントがセクション見出しを直接管理するため）

#### Step 3: ResultCard.tsx の更新

**変更ファイル**: `src/play/quiz/_components/ResultCard.tsx`

- `YojiPersonalityDetailedContent` の import を追加
- `YojiPersonalityContent` の dynamic import を追加
- `renderDetailedContent` の switch 文に `case "yoji-personality"` を追加
- catchphrase 表示ロジックのリファクタリング: 現在の三項演算子ネスト（animal-personality / music-personality / traditional-color の3段）に yoji-personality を加えると4段になり可読性が悪化する。**根本解決として、catchphrase を持つ variant のリストを定数化し、`--catchphrase-accent-color` のマッピングも宣言的に管理する方式にリファクタリングする**。例: `CATCHPHRASE_VARIANTS` 配列と `getCatchphraseAccentColor(variant, result)` ヘルパーで一元管理
- catchphrase のアクセントカラーに result.color を使用（traditional-color と同様、タイプ固有色）

#### Step 4: 専用コンポーネント作成

**新規ファイル**:

- `src/play/quiz/_components/YojiPersonalityContent.tsx`
- `src/play/quiz/_components/YojiPersonalityContent.module.css`

**コンポーネント設計**:

- Server Component（"use client" なし）
- Props: content, resultId, resultColor, headingLevel(2|3), allTypesLayout("list"|"pill"), afterMotto?(ReactNode)
- --type-color CSS変数でタイプ固有色を注入（traditional-color パターン踏襲）
- ダークモード対応: color-mix() で背景の opacity 調整、WCAG AA 準拠のコントラスト確保

#### Step 5: 専用ルート作成

**新規ファイル**:

- `src/app/play/yoji-personality/result/[resultId]/page.tsx`
- `src/app/play/yoji-personality/result/[resultId]/page.module.css`
- `src/app/play/yoji-personality/result/[resultId]/opengraph-image.tsx`

**ルート設計**:

- traditional-color の専用ルートをテンプレートとして使用
- OGP画像: result.color をタイプ固有色として使用（各タイプに異なる色がある）。`createOgpImageResponse` 共通関数および `getContrastTextColor`（`src/lib/color-utils.ts`）を使用して、タイプ固有色に応じたテキスト色の自動判定を行う（cycle-149で実装済みの根本解決の仕組みを活用）
- generateStaticParams で全8タイプのパスを生成
- DescriptionExpander を使用した description 表示
- CTA1（上部）+ CTA2（afterMotto スロット経由、全タイプ一覧前）

#### Step 6: テスト

**新規ファイル**:

- `src/play/quiz/data/__tests__/yoji-personality-detailed-content.test.ts` を全面書き換え（新 variant 用）
- `src/play/quiz/_components/__tests__/YojiPersonalityContent.test.tsx`
- `src/app/play/yoji-personality/result/[resultId]/__tests__/page.test.ts`
- `src/app/play/yoji-personality/result/[resultId]/__tests__/opengraph-image.test.ts`

**既存テスト更新**:

- `src/play/quiz/__tests__/types-detailed-content.test.ts`: YojiPersonalityDetailedContent の variant テスト追加
- `src/play/quiz/_components/__tests__/ResultCard.test.tsx`: yoji-personality variant の case テスト追加

**テスト内容（データ）**:

- variant が "yoji-personality" であること
- catchphrase: 15-30字、全8タイプでユニーク
- kanjiBreakdown: 80-150字
- origin: 80-150字。出典不明確な四字熟語について「〜とされる」「諸説あり」等の適切な表現を含むことを確認。具体的な書籍名・人名を含む場合はデータファイル内にファクトチェック済みコメントがあることを確認
- behaviors: 正確に4項目、各項目が空でないこと
- motto: 20-80字、全8タイプでユニーク
- 旧フォーマットフィールド（traits/advice）が存在しないこと
- resultPageLabels がメタから削除されていること

#### Step 7: ビルド確認・ビジュアルテスト

- `npm run lint && npm run format:check && npm run test && npm run build` を実行して全パス確認
- Playwright で結果ページの表示を確認:
  - ライトモード / ダークモード
  - デスクトップ / モバイル
  - 受検者向け（ResultCard）/ 第三者向け（専用ルート）
  - 複数タイプ（色の異なるタイプを最低3つ）
- WCAG AA コントラスト比の確認（特にダークモードでの明るい色タイプ）

#### Step 8: 来訪者目線レビュー

- 来訪者目線で結果ページの魅力・楽しさ・エンゲージメントをレビュー
- 「四字熟語の成り立ち」「ルーツ」は知的好奇心を刺激するか
- 「座右の銘として」は持ち帰り価値があるか
- シェアしたくなる体験か

### 検討した他の選択肢と判断理由

#### 選択肢A: strengths/weaknesses パターン（animal-personality/music-personality 踏襲）

- **不採用理由**: 四字熟語の独自性（漢字の意味、出典・由来）を活かせない。strengths/weaknesses は動物や音楽ジャンルのような「性質の分類」には合うが、四字熟語は「言葉そのものに意味と歴史がある」ため、言葉の解説が主軸であるべき

#### 選択肢B: 漢字一文字ずつを個別フィールドに分離（kanji1, kanji2, kanji3, kanji4）

- **不採用理由**: 4文字の組み合わせで意味が生まれることが四字熟語の本質。個別分離するとその相互関係が表現しにくい。kanjiBreakdown として一つの散文に含めることで、「分解→統合」の流れを自然に記述できる

#### 選択肢C: 「相性の良い四字熟語」フィールドの追加

- **不採用理由**: animal-personality には既に相性機能があるが、yoji-personality にはまだ相性データがない。このサイクルのスコープ（結果体験の再設計）を超えるため、将来の拡張として検討する

#### 選択肢D: origin を省略し、kanjiBreakdown のみにする

- **不採用理由**: kanjiBreakdown は「漢字の意味」、origin は「歴史的背景」で役割が異なる。両方あることで知的コンテンツの厚みが増し、シェア時の会話ネタになる。ただし origin はファクトチェックコストが高いため、確実な出典のみ記載し、不確実なものは「由来には諸説あり」と注記する

### ファクトチェック方針

origin（出典・由来）フィールドは事実情報を含むため、以下の方針でファクトチェックを行う:

- **事前調査**: データ作成前に8タイプすべての出典をWeb検索で確認し、「出典明確」「出典不明確」に分類する（Step 2-a）
- **出典が明確な場合**: 複数の信頼できるソース（漢字辞典、国語辞典等）で裏付け、出典名を記載する
- **出典が不明確な場合**（合成語型、諸説あり等）: 漢字の組み合わせの成り立ち、日本語での定着経緯など出典以外の角度で由来を記述する。「由来には諸説ある」「〜とされる」「日本で広まった表現」等の正確な注記を含める
- AIが「もっともらしいが裏付けのない記述」を生成するリスクを常に意識し、確認できない情報は記載しない
- データファイル内に、具体的な書籍名・人名を含む場合はファクトチェック済みであることをコメントで明記する

### 計画にあたって参考にした情報

- **cycle-149（traditional-color再設計）の実装パターン**: 型定義、コンポーネント、ルート、テストの構造を参考にした
- **cycle-149の補足事項（次サイクルへの申し送り）**: 「推測するな、確認しろ」「来訪者目線レビュー最優先」「ファクトチェック」「現状が正しいとは限らない」等の教訓を計画に反映
- **既存の yoji-personality データ**: 8タイプの detailedContent（traits/behaviors/advice）の内容と文体を確認し、変換方針を策定
- **ResultCard.tsx / TraditionalColorContent.tsx / types.ts**: 既存の variant 追加パターンを確認し、一貫した実装方針を策定

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。例えば、「XXXの機能にバグを見つけたが、本サイクルのスコープ外なので次回以降のサイクルで修正する予定。backlog.mdにも記載済み。」など。>

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
