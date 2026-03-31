---
id: 138
description: "クイズ結果ページdetailedContent追加（第3弾: impossible-advice, contrarian-fortune, unexpected-compatibility）"
started_at: "2026-03-31T11:58:14+0900"
completed_at: "2026-03-31T12:55:14+0900"
---

# サイクル-138

cycle-136, 137で実施したdetailedContent追加の第3弾として、残り6種のうち3種のクイズにdetailedContentを追加する。

対象:

- **impossible-advice**（達成困難アドバイス診断）: 7結果タイプ
- **contrarian-fortune**（逆張り運勢診断）: 8結果タイプ
- **unexpected-compatibility**（斜め上の相性診断）: 8結果タイプ

## 実施する作業

- [x] 1. impossible-advice（7結果タイプ）のdetailedContent追加 + テスト作成
- [x] 2. contrarian-fortune（8結果タイプ）のdetailedContent追加 + テスト作成
- [x] 3. unexpected-compatibility（8結果タイプ）のdetailedContent追加 + テスト作成
- [x] 4. 全結果タイプの表示確認（Playwright目視）・最終レビュー

## 作業計画

### 目的

**誰のために**: 「手軽で面白い占い・診断を楽しみたい人」。くすっと笑える切り口を求め、「自分だけに当てはまる」感覚（バーナム効果）を楽しむユーザー。

**何のために**: 診断結果ページの体験価値を高める。具体的には、detailedContent（traits/behaviors/advice）を追加することで「これ自分だ!」という自己認識体験を生み、シェア動機を高める。Harvard PNAS 2012の知見に基づき、自己開示の報酬性がシェアを促すという前提に立つ。

**提供する価値**:

- behaviorsの「あるある」場面描写による「わかる!」体験
- traitsによる自己理解の深掘り（descriptionとは異なる角度から）
- adviceによる軽いポジティブな行動促進
- 副次効果として、detailedContentのある結果ページはnoindex対象外となりSEOに寄与する（ただし効果は4ヶ月-1年後）

### 変更しないもの

以下のファイル・機能は本サイクルでは一切変更しない:

- 結果ページのコンポーネント（`page.tsx`）
- 結果ページのCSS（`page.module.css`）
- detailedContentの型定義（`QuizResultDetailedContent`）
- 先行6種（character-personality, animal-personality, music-personality, traditional-color, character-fortune, yoji-personality）のデータ
- ShareButtonsの配置

### 作業内容

全タスクにおいて、1クイズにつき1タスクとして独立したサブエージェントに委任する。

#### タスク1: impossible-advice（7結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/impossible-advice.ts`
- **結果タイプ**: timemagician, gravityfighter, digitalmonk, sleeparchitect, conversationsamurai, snackphilosopher, weathercontroller（計7種）
- **コンテンツ方針**: descriptionにはすでに「笑えるアドバイス」（毎朝4時起き、すべての移動1.5倍速、デジタル断食等）が書かれている。detailedContentはこれと棲み分け、「悩みタイプの共感ポイント深掘り」として書く。traitsは「このタイプの人が持つ内面の傾向」、behaviorsは「このタイプの人の日常あるある」を場面描写で。adviceはdescriptionの不可能なアドバイスとは異なる角度から、実行可能だが温かいトーンで。口調はdescriptionのカジュアルな語り口を維持する。
- **作業内容**:
  - 7結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを2つ作成（先行実装パターンを踏襲）:
    - 構造テスト（`src/play/quiz/data/__tests__/impossible-advice-detailed-content.test.ts`）
    - 品質テスト（`src/play/quiz/data/__tests__/impossible-advice-traits-advice-quality.test.ts`）
  - lint/format/test/buildの全パス確認
- **注意事項**:
  - 結果は7種（8種ではない）なので、adviceの具体的行動提案の閾値は「7結果中5以上」とする
  - descriptionの「実行不可能なアドバイス」をtraitsやbehaviorsで焼き直さないこと（15文字以上の部分一致不可）

#### タスク2: contrarian-fortune（8結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/contrarian-fortune.ts`
- **結果タイプ**: reverseoptimist, overthinker, cosmicworrier, paradoxmaster, accidentalprophet, calmchaos, inversefortune, mundaneoracle（計8種）
- **コンテンツ方針**: descriptionは「普通の占いなら○○だが、実は△△」という占いパロディの逆張りフレームで書かれている。detailedContentはこの逆張りフレームと棲み分け、「このタイプの人の日常リアル」として書く。traitsは「逆張り的な性格傾向」、behaviorsは「逆張り的行動が日常で現れる場面描写」を活用する。口調はdescriptionの軽妙なユーモアトーンを維持する。
- **作業内容**:
  - 8結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを2つ作成:
    - 構造テスト（`src/play/quiz/data/__tests__/contrarian-fortune-detailed-content.test.ts`）
    - 品質テスト（`src/play/quiz/data/__tests__/contrarian-fortune-traits-advice-quality.test.ts`）
  - lint/format/test/buildの全パス確認
- **注意事項**:
  - descriptionの「逆張り」フレーム（「一般的な占いなら〜だが」等）をdetailedContentで繰り返さないこと
  - adviceの具体的行動提案の閾値は「8結果中6以上」

#### タスク3: unexpected-compatibility（8結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/unexpected-compatibility.ts`
- **結果タイプ**: vendingmachine, oldclock, streetlight, benchpark, windchime, rainyday, cloudspecific, 404page（計8種）
- **コンテンツ方針**: descriptionは「あなたと相性の良い意外な存在」を詩的・哲学的なトーンで描写している。detailedContentもこのトーンを引き継ぎ、各「意外な存在」のメタファーをtraits/behaviors/advice全体で一貫活用する。traitsは「この存在と相性が良い人の内面」、behaviorsは「この存在に通じる日常の場面描写」、adviceは「この存在との相性を活かすための提案」とする。
- **作業内容**:
  - 8結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを2つ作成:
    - 構造テスト（`src/play/quiz/data/__tests__/unexpected-compatibility-detailed-content.test.ts`）
    - 品質テスト（`src/play/quiz/data/__tests__/unexpected-compatibility-traits-advice-quality.test.ts`）
  - lint/format/test/buildの全パス確認
- **注意事項**:
  - descriptionの詩的表現（「24時間いつでもそこにいて」「台風の目のように」等）をtraits/behaviorsで焼き直さないこと
  - メタファーの活用とは、同じ文言の繰り返しではなく、同じ「存在」の世界観の中で新しい角度から描くこと
  - adviceの具体的行動提案の閾値は「8結果中6以上」

#### タスク4: 全体レビューと最終確認

- 全23結果タイプの表示をPlaywrightで目視確認（各クイズの代表的な結果ページを実際に開く）
- 全クイズのlint/format/test/buildが通ることを確認
- コンテンツ品質の横断レビュー（トーンの一貫性、品質のばらつきがないか）

### コンテンツ品質基準（全タスク共通）

cycle-136/137の先行実装で確立された品質基準を踏襲する。

**traits（あなたの特徴）**:

- 3-5項目、各1-2文（5-150文字）
- 内面の心理・性格傾向を描写する
- 共感的で少し自己認識的なトーン（「実はこういうところがある」）
- descriptionの焼き直しは禁止（15文字以上の部分一致不可）

**behaviors（あるある行動パターン）**:

- 3-5項目、各10-150文字
- 具体的な日常の「あるある」シーンを描写する（説明的な表現ではなく、場面描写）
- 面白く、読んだ人が「わかる!」と共感できる内容
- 悪い例: 「人の気持ちを察するのが得意」（説明的）
- 良い例: 「LINEの返信が遅い友達に対して、忙しいのかなと3パターンの理由を想像してから既読スルーを許す。」（場面描写）

**advice（ひとことアドバイス）**:

- 10-200文字
- ポジティブで行動を促す1-2文
- 温かいトーン
- 具体的行動提案の閾値: 7結果なら5以上、8結果なら6以上
- 全結果が「あなたのXXは才能です」のような汎用テンプレートにならないこと（3結果以下に制限）

**口調維持**: 各クイズ固有のトーンをdetailedContent全体で維持すること。descriptionを読んで口調を確認してから執筆する。

**総文字数目安**: 約280-340文字/タイプ（厳密な制限ではなく、目安として）

### テストファイルの構成（全タスク共通）

先行実装のテストパターン（`traditional-color-detailed-content.test.ts` と `traditional-color-traits-advice-quality.test.ts`）を踏襲する。

**構造テスト（\*-detailed-content.test.ts）**:

- 全結果にdetailedContentが存在すること
- traits/behaviorsの件数が3-5であること
- traits各項目が5-150文字、behaviors各項目が10-150文字であること
- adviceが10-200文字であること
- seoTitleが設定されていること

**品質テスト（\*-traits-advice-quality.test.ts）**:

- traits・behaviorsがdescriptionの焼き直しでないこと（15文字以上の部分一致禁止）
- adviceの多様性（汎用テンプレート使用が3結果以下）
- adviceに具体的行動提案が含まれること（閾値: 7結果なら5以上、8結果なら6以上）

### 検討した他の選択肢と判断理由

**ビジュアル再設計を行わない理由**: 現在の結果ページは既にカード型デザインで実装されている（cycle-137で確認済み）。detailedContentのtraitsは背景色+角丸のカード、behaviorsはボーダー+角丸のカード。十分な品質であり、根拠のない変更はしない。

**シェアボタンの位置変更を今回行わない理由**: fold上移動でシェア率490%増のA/Bテスト実績はあるが文脈依存。中程度の根拠はあるものの、このサイクルは小さく保つ。バックログに記載済み。

**3クイズ同時実施の理由**: 3クイズとも同じ構造（detailedContent追加+テスト作成）であり、品質基準もテストパターンも確立済み。1クイズ1サブエージェント原則により品質とトレーサビリティを維持しつつ、効率的に進められる。

### 計画にあたって参考にした情報

- **先行実装パターン**: `src/play/quiz/data/traditional-color.ts` のdetailedContent実装
- **テストパターン**: `src/play/quiz/data/__tests__/traditional-color-detailed-content.test.ts` および `traditional-color-traits-advice-quality.test.ts`
- **cycle-137の計画と完了結果**: `docs/cycles/cycle-137.md`（判断根拠・品質基準・テスト構成を踏襲）
- **調査レポート**: `tmp/research/2026-03-31-cycle138-target-user-and-detailed-content-best-practices.md`, `tmp/research/2026-03-31-detailed-content-best-practices-for-cycle138.md`, `docs/research/quiz-result-page-ux-best-practices.md`, `docs/research/2026-03-30-quiz-diagnosis-user-behavior-research.md`, `docs/research/2026-03-31-quiz-result-page-value-assumptions-verification.md`, `docs/research/2026-03-31-japanese-casual-diagnosis-result-page-analysis.md`

### 完成条件

- [x] 3クイズ全23結果タイプにdetailedContentが追加されている（impossible-advice: 7種、contrarian-fortune: 8種、unexpected-compatibility: 8種）
- [x] 3クイズすべてにseoTitleが設定されている
- [x] 各クイズのテストファイル（構造テスト + 品質テスト）が作成され、全テストがパスしている
- [x] impossible-adviceのdetailedContentがdescriptionの「笑えるアドバイス」と棲み分けられている
- [x] contrarian-fortuneのdetailedContentがdescriptionの「逆張りフレーム」と棲み分けられている
- [x] unexpected-compatibilityのdetailedContentがdescriptionの詩的トーンを引き継ぎつつ、メタファーを新しい角度から活用している
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
- [x] 結果ページの表示がPlaywrightで目視確認されている

## レビュー結果

各クイズごとに独立したreviewerがレビューを実施。3つとも指摘事項なしで初回承認。

- **impossible-advice**: behaviorsの場面描写が具体的で共感性が高い。descriptionのネタアドバイスとdetailedContentの共感路線の棲み分けが明確。全15テストパス。
- **contrarian-fortune**: 逆張りフレームとの棲み分けが完全。advice全8結果に具体的行動提案を含む（基準6以上を超過）。全15テストパス。
- **unexpected-compatibility**: 各「意外な存在」のメタファーが一貫して活用されている。advice8中7結果に具体的行動提案（基準6以上を超過）。全15テストパス。

Playwright目視確認: プロダクションビルド後に3種各1結果ページを確認し、detailedContent（traits/behaviors/advice）が正しく表示されること、robotsメタがindex,followであることを確認済み。

## キャリーオーバー

なし。全タスク完了。

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
