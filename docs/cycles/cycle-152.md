---
id: 152
description: "結果体験の再設計: unexpected-compatibility（B-270）"
started_at: "2026-04-03T23:52:04+0900"
completed_at: null
---

# サイクル-152

unexpected-compatibility（意外な相性診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [ ] unexpected-compatibilityの現状の結果ページ・データ構造・コンテンツを全面的に把握する
- [ ] 受検者本人・第三者・会話の3シナリオにおける理想体験をゼロベースで設計する
- [ ] UnexpectedCompatibilityDetailedContent variant型を定義・実装する
- [ ] 全タイプのデータを新variant型に変換する
- [ ] 専用具体ルート＋OGP画像を実装する
- [ ] 受検者/第三者で統一体験を実装する
- [ ] ダークモード対応・WCAG AA準拠を確認する
- [ ] レビューを実施し、指摘事項をすべて解消する

## 作業計画

### 目的

「斜め上の相性診断」（unexpected-compatibility）の結果体験を、このクイズの独自性――真面目な性格質問から導かれる「無機物・自然現象・概念との相性」というギャップのユーモアと、その裏にある哲学的な深み――を最大限に活かした専用variantに再設計する。

ターゲットは「手軽で面白い診断を楽しみたい人」。結果を見た瞬間の「何それ!?」という驚き、読み進めるうちの「なるほど...」という納得、そして「面白い! シェアしよう」という行動を一連の体験として設計する。

受検者本人（診断直後）、第三者（シェアリンク経由）、両者の会話（「私は自動販売機だったよ」「私は404 Not Found!」）の3シナリオすべてで最高の体験を提供する。

### フィールド設計: UnexpectedCompatibilityDetailedContent

| フィールド      | 型                           | 文字数目安 | 役割・設計理由                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------- | ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`       | `"unexpected-compatibility"` | -          | discriminated union 識別子                                                                                                                                                                                                                                                                                                                                                                                           |
| `catchphrase`   | `string`                     | 15-30字    | タイプのキャッチコピー。OGP・シェア時の第一印象を決める一行（確立パターン）。例: 「24時間、あなたの選択を待っている」（自動販売機）                                                                                                                                                                                                                                                                                  |
| `entityEssence` | `string`                     | 80-150字   | **このクイズならでは**: その「存在」の本質を、哲学的かつユーモラスに解説するテキスト。単なる物の説明ではなく「自動販売機とは、見返りを求めない即時応答システムであり...」のように、存在を深読みして人間の性質に通じる解説を行う。yoji-personalityのkanjiBreakdown、character-personalityのarchetypeBreakdownに相当する「知的コンテンツ」ポジション。このクイズの核心である「暗喩としての無機物」を読み解くセクション |
| `whyCompatible` | `string`                     | 80-150字   | **このクイズならでは**: 「なぜあなたとこの存在の相性が良いのか」を核心的に説明するテキスト。entityEssenceで語った存在の本質と、診断で明らかになったあなたの性質がどう響き合うかを解説する。「相性診断」を名乗る以上、「なぜ相性が良いか」の説明がなければ体験として不完全。既存のtraitsを「存在との共鳴」という切り口で再構成する                                                                                    |
| `behaviors`     | `string[]`                   | 4項目      | あるある・共感シーン（確立パターン）。「この存在と共鳴する日常」として、具体的な日常シーンを描写。既存behaviorsのリライト                                                                                                                                                                                                                                                                                            |
| `lifeAdvice`    | `string`                     | 30-80字    | その存在から学べる人生の教訓（締めのメッセージ）。既存adviceのリライト。yoji-personalityのmotto、traditional-colorのcolorAdviceに相当する締めセクション                                                                                                                                                                                                                                                              |

**調査レポート提案からの変更点と判断理由**:

- 提案をほぼそのまま採用。フィールド名・役割・文字数は提案通り
- `traits`は削除。`entityEssence`（存在の本質）と`whyCompatible`（なぜ相性が良いか）の2フィールドで、存在の解説と性格特性の紐づけを一体的に語る方が、「相性診断」としての体験が完結する。traitsを別途リスト化すると散漫になる
- `advice`は`lifeAdvice`にリネーム。「存在から学べる教訓」というフレーミングがこのクイズの世界観（無機物・概念から人間が学ぶ）に合致する

**標準形式からの変換方針**:

- `traits` -> `entityEssence`と`whyCompatible`に再構成。4つのtraitsの内容を「存在の本質」と「相性の理由」に分離・統合してリライト
- `behaviors` -> 維持・リライト。4項目に統一し、「この存在と共鳴する日常」というトーンに調整
- `advice` -> `lifeAdvice`にリライト。「この存在から学べること」のトーンを維持しつつ文字数を調整

### 表示セクション構成: UnexpectedCompatibilityContent コンポーネント

表示順（上から下）:

1. **catchphrase**（呼び出し側で表示 -- ResultCard/page.tsxの責務。colorHeroセクション）
2. **「この存在の本質」**（entityEssence セクション）
   - 哲学的・ユーモラスな存在解説。「自動販売機とは何か」を深読みする知的コンテンツ
3. **「なぜ相性が良いのか」**（whyCompatible セクション）
   - entityEssenceで語った存在の本質と、あなたの性質がどう響き合うかの解説
4. **「この存在と共鳴する日常」**（behaviors セクション）
   - 共感あるある4項目
5. **「この存在から学べること」**（lifeAdvice セクション）
   - 締めの教訓メッセージ
6. **全タイプ一覧**（他の「相性の良い存在」も見てみよう）

**構成の意図**: 驚き（catchphrase）-> 知的好奇心（本質の深読み）-> 納得（なぜ相性が良いか）-> 共感（あるある）-> 行動（教訓）-> 探索（全タイプ一覧）の流れ。「斜め上」のギャップで引き込み、哲学的な深みで「なるほど」を提供し、共感で定着させ、教訓で前向きな余韻を残す。

### 作業内容

**Step 1: 型定義の追加**

- ファイル: `src/play/quiz/types.ts`
- `UnexpectedCompatibilityDetailedContent` インターフェースを追加
- `DetailedContent` union型に追加
- コメントも更新

**Step 2: データ変換（バッチ1: 最初の3タイプ）**

- ファイル: `src/play/quiz/data/unexpected-compatibility.ts`
- vendingmachine, oldclock, streetlight の3タイプを新variant形式に変換
- catchphrase新規作成、traits -> entityEssence + whyCompatible再構成、behaviors微調整（4項目に統一）、advice -> lifeAdviceリライト
- 最初の1-2タイプでトーン基準（哲学的×ユーモラスのバランス、文字数感）を確立し、残り1タイプはそれに合わせる
- **既存テストファイルの更新**: `src/play/quiz/data/__tests__/unexpected-compatibility-detailed-content.test.ts` と `unexpected-compatibility-traits-advice-quality.test.ts` を新variant形式に合わせて修正（標準形式前提のアサーションを更新）

**Step 3: データ変換（バッチ2: 残り5タイプ）**

- ファイル: `src/play/quiz/data/unexpected-compatibility.ts`
- benchpark, windchime, rainyday, cloudspecific, 404page の5タイプを新variant形式に変換
- バッチ1で確立したトーン基準に厳密に合わせる

**Step 4: resultPageLabels の更新**

- ファイル: `src/play/quiz/data/unexpected-compatibility.ts`
- meta.resultPageLabels を新variantのセクション見出しに合わせて更新（または専用コンポーネントで見出しをハードコードするため削除）

**Step 5: 専用コンテンツコンポーネントの作成**

- ファイル: `src/play/quiz/_components/UnexpectedCompatibilityContent.tsx`
- ファイル: `src/play/quiz/_components/UnexpectedCompatibilityContent.module.css`
- YojiPersonalityContentと同じパターンのServer Component
- entityEssence / whyCompatible / behaviors / lifeAdvice / 全タイプ一覧の5セクション
- afterLifeAdvice スロット（CTA等を挿入するため）
- --type-color CSS変数で各タイプのカラーを反映
- ダークモード対応（color-mix()による明度調整）

**Step 6: ResultCard への統合**

- ファイル: `src/play/quiz/_components/ResultCard.tsx`
- CATCHPHRASE_VARIANTS に "unexpected-compatibility" を追加
- CATCHPHRASE_ACCENT_COLOR に タイプ固有色（result.color）を設定
- dynamic import で UnexpectedCompatibilityContent を遅延ロード
- `renderDetailedContent` のswitch文に `case "unexpected-compatibility":` を追加
  - `headingLevel={3}`, `allTypesLayout="pill"`, `resultColor={resultColor ?? ""}`
  - `referrerTypeId` は不要（一人完結型のため除外）
  - `afterLifeAdvice` スロットはResultCard内では不要（CTA等はResultCard側で管理）

**Step 7: 専用ルートの作成**

- ファイル: `src/app/play/unexpected-compatibility/result/[resultId]/page.tsx`
- ファイル: `src/app/play/unexpected-compatibility/result/[resultId]/page.module.css`
- ファイル: `src/app/play/unexpected-compatibility/result/[resultId]/opengraph-image.tsx`
- character-personality の専用ルートをテンプレートとして使用
- 相性機能は不要（一人完結型）のため、CompatibilityDisplay / InviteFriendButton / searchParams 関連は除外
- generateStaticParams, generateMetadata, OGP画像生成を実装
- OGP画像: result.color（タイプ固有色）を使用、WCAG AA自動判定

**Step 8: テストの作成**

- ファイル: `src/app/play/unexpected-compatibility/result/[resultId]/__tests__/page.test.tsx`
- 正常系: 有効なresultIdでページがレンダリングされる
- 異常系: 無効なresultIdでnotFoundが呼ばれる
- コンテンツ確認: catchphrase、entityEssence等のセクションが表示される

**Step 9: ビルド検証・ビジュアル確認**

- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- `npm run build && npx next start` で本番ビルドを起動し、専用ルートが正しく動作することを確認
- 全8タイプの結果ページをPlaywrightでビジュアル確認（ライトモード・ダークモード）
- OGP画像の色がタイプ固有色になっていることを確認

**Step 10: クリーンアップ**

- 不要になった resultPageLabels の整理（専用コンポーネントで見出しをハードコードする場合）
- FAQテキストの確認（コードのフィールド名が露出していないか）

### 注意事項

- **専用ルート追加後のビジュアル確認はdevサーバーでは不可**: `npm run build && npx next start` で本番ビルドを使うこと。devサーバーではNext.js App Routerのルーティングマニフェストがビルド時に生成されるため、専用ルートが動的ルートにフォールバックする偽陽性が発生する
- **CSSカスタムプロパティにフォールバック値を付ける**: `var(--type-color, #374151)` のように。フォールバックがないとSSR時やprops未設定時に透明になる
- **FAQテキストにコードのフィールド名を露出させない**: `entityEssence`や`whyCompatible`のようなフィールド名を来訪者向けテキストに含めない
- **データ変換はバッチ分割**: 最初の3タイプでトーン基準を確立してから残り5タイプに展開。口調の一貫性は既存descriptionで照合する
- **このクイズは創作コンテンツ**: entityEssenceの「哲学的解説」は創作であることが明白なトーンで書く。「科学的に証明された」等の事実っぽい表現は避ける
- **相性機能は不要**: character-personalityやmusic-personalityと異なり、一人完結型の診断。CompatibilityDisplay / InviteFriendButton / searchParams 関連のコードは除外する。ただしShareButtons（SNSシェア）はResultPageShellに含まれるため別途対応不要
- **全タイプ一覧のレイアウト**: 専用ルートでは "list"（yoji-personalityと同じ8タイプのパターン）、ResultCardでは "pill" を使用。gridは24タイプのcharacter-personality専用であり、8タイプには既存パターンとの整合性からlistが適切

### 検討した他の選択肢と判断理由

**選択肢A（採用）: entityEssence + whyCompatible の2フィールド分離**

- 存在の本質と相性の理由を分けることで、読者が「まず存在を理解し、次に自分との関係を理解する」というステップを踏める
- 「相性診断」を名乗る以上、「なぜ相性が良いか」を独立セクションで説明することが体験の完結に不可欠

**選択肢B（不採用）: entityEssence 1フィールドに統合**

- 存在の本質と相性理由を1つの長文（160-300字）にまとめる案
- 不採用理由: セクション見出しを付けにくく、読者が「何の話をしているのか」を見失いやすい。2つに分けた方がスキャンしやすく、シェア時の会話のネタにもなりやすい（「本質の解説がめっちゃ深い」「相性の理由が面白い」と別々に語れる）

**選択肢C（不採用）: strengths/weaknesses パターン（animal-personality型）**

- 強み・弱みのリストを追加する案
- 不採用理由: このクイズは「性格の長所短所を教える」ではなく「意外な存在との相性」がコンセプト。strengths/weaknessesは「自己分析」寄りになり、「斜め上」のユーモアが薄まる

**選択肢D（不採用）: characterMessage パターン（存在が語りかける）**

- 自動販売機や街灯が一人称で語りかけるメッセージを追加する案（「やあ、僕は自動販売機。君のことずっと見てたよ」）
- 不採用理由: 面白いがやりすぎのリスクがある。8タイプ中「404 Not Found」「雨の日の午後」「特定の形の雲」は擬人化すると不自然。lifeAdvice（教訓）の方が全タイプで一貫したトーンを維持できる

**全タイプ一覧のレイアウト: list vs grid vs pill**

- list採用（専用ルート）: yoji-personality（同じ8タイプ）との整合性を重視。gridは24タイプのcharacter-personality専用パターンであり、8タイプには過剰。pillはResultCard内で使用

### 計画にあたって参考にした情報

- **既存再設計パターン**: cycle-151（character-personality）の作業計画・フィールド設計・実装構成を主なテンプレートとして参照
- **既存variant型の一覧**: types.ts に定義された8つのvariant型（標準形式含む）のフィールド設計を比較し、各クイズがどのように独自性を反映したフィールドを持っているか確認
- **YojiPersonalityContent**: 相性機能を持たないvariantの専用コンテンツコンポーネントの実装パターン（Server Component、afterMottoスロット）を参照
- **CharacterPersonalityContent**: 相性機能を持つvariantの実装パターン（Client Component、API呼び出し、afterCharacterMessageスロット）を参照し、unexpected-compatibilityでは不要と判断
- **ResultCard.tsx**: CATCHPHRASE_VARIANTS / CATCHPHRASE_ACCENT_COLOR の管理パターンを確認
- **既存データファイル**: unexpected-compatibility.ts の全8タイプのdescription、traits、behaviors、adviceの内容・トーン・文字数を確認
- **申し送り事項**: cycle-151から引き継いだ5つの注意事項（devサーバー不可、CSSフォールバック、FAQ露出、ファクトチェック、バッチ分割）を計画に反映

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。例えば、「XXXの機能にバグを見つけたが、本サイクルのスコープ外なので次回以降のサイクルで修正する予定。backlog.mdにも記載済み。」など。>

## 次サイクルへの申し送り

### 作業の心構え

- **推測するな、確認しろ**: 判断の根拠となる事実は、必ず現在のファイル・データ・ビルド結果で確認する。記憶やキャッシュに頼らない
- **レビューは来訪者目線を最優先にする**: 技術レビューだけでなく、ビジュアル確認は全組み合わせ（画面種類 × カラーモード × デバイス）を省略しない
- **問題には根本解決で対応する**: 場当たり的な解決策ではなく共通の仕組みで根本解決する
- **「現状そうなっているから正しい」は根拠にならない**: ゼロベースで検討する
- **スキルの手順を実行前に必ず読む**: 記憶に頼らない
- **原因不明の問題を推測で片付けない**: 特定できないなら正直に報告する

### よくある落とし穴

- **専用ルート追加後のビジュアル確認はdevサーバーでは不可**: Next.js App Routerのルーティングマニフェストはビルド時に生成されるため、devサーバーでは専用ルートが動的ルートにフォールバックする偽陽性が発生する。`npm run build && npx next start` で本番ビルドを使うこと
- **CSSカスタムプロパティにフォールバック値を付ける**: `var(--type-color, #374151)` のように。フォールバックがないとSSR時やprops未設定時に透明になる
- **FAQテキストにコードのフィールド名を露出させない**: `kanjiBreakdown` のようなフィールド名をそのまま日本語テキストに含めない。来訪者向けの自然な日本語のみで記述する
- **コンテンツに事実を含める場合はファクトチェックを怠らない**: AIが「もっともらしいが裏付けのない記述」を生成するリスクに常に注意。創作コンテンツはその旨を明示する

### データ変換作業のコツ

- **大量タイプのデータ変換はバッチ分割する**: 最初のバッチ（2-3タイプ）でトーン基準を確立してから残りに展開すると品質のばらつきを防げる
- **口調の一貫性は既存descriptionで照合する**: 新規フィールドの口調がdescriptionと一致しているか、各タイプで必ずチェックする

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
