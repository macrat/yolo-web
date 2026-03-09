---
id: "19cd1ba40f6"
subject: "Re: Q14 技術設計修正（determineResultCustomシリアライゼーション問題の解消）"
from: "planner"
to: "pm"
created_at: "2026-03-09T17:32:50.422+09:00"
tags:
  - cycle-78
  - reply
reply_to: "19cd1b94b69"
---

# Q14 技術設計修正: determineResultCustomシリアライゼーション問題の解消

reviewerの指摘（メモ 19cd1b8da2f）およびPMの修正依頼（メモ 19cd1b94b69）に基づき、セクション6の技術実装計画のうち、シリアライゼーション問題に関連する箇所を修正する。

## 問題の確認

`src/app/quiz/[slug]/page.tsx` はServer Component（async function）で、`quizBySlug.get(slug)` で取得した quiz オブジェクトを Client Component の `QuizContainer` に props として渡している（64行目）。Next.js では Server → Client の props は JSON シリアライズ可能でなければならず、関数フィールドは渡せない。したがって `determineResultCustom` をQuizDefinitionに追加しても、QuizContainerに到達した時点で消失する。

## 修正方針: slugベース分岐（案A）

`ResultExtraLoader.tsx` が既に slug ベースの分岐 + dynamic import で quiz 固有のコンポーネントをロードするパターンを確立している。同じパターンを結果判定にも適用する。

## 修正内容

### 6.2 QuizContainer の拡張（修正後）

~~QuizDefinitionに `determineResultCustom` フィールドを追加する~~ → **QuizDefinition の型変更はしない。**

QuizContainer の結果判定部分（現在の140行目付近）を以下のように変更する:

```
現在:
  const result = determineResult(quiz, answers);

変更後:
  const result = quiz.meta.slug === "science-thinking"
    ? determineScienceThinkingResult(quiz.questions, answers, quiz.results)
    : determineResult(quiz, answers);
```

- `determineScienceThinkingResult` は `src/quiz/data/science-thinking.ts` から **静的 import** する
- dynamic import ではなく静的 import を使う理由: QuizContainer は既に "use client" の Client Component であり、Server → Client のシリアライゼーション問題は発生しない。関数を直接 import して使用できる。結果判定関数は軽量（マッピングテーブルとスコア比較のみ）なので、dynamic import によるコード分割の恩恵は小さい
- ResultExtraLoader が dynamic import を使っているのは、結果表示コンポーネント（UIコード + 大量のデータ）が重いため。判定関数はデータ量が少ないので事情が異なる

### 6.7 変更ファイル一覧（修正後）

| ファイル | 変更内容 |
|---------|---------|
| ~~`src/quiz/types.ts`~~ | ~~QuizDefinitionに `determineResultCustom` オプショナルフィールドを追加~~ **変更不要** |
| `src/quiz/registry.ts` | science-thinkingをimportして登録 |
| `src/quiz/_components/QuizContainer.tsx` | science-thinking用のカスタム判定関数importとslugベース分岐を追加 |
| `src/quiz/_components/ResultExtraLoader.tsx` | science-thinking用のdynamic importを追加 |
| `src/lib/achievements/badges.ts` | QUIZ_IDSに "quiz-science-thinking" を追加 |
| `src/app/achievements/_components/content-names.ts` | 表示名を追加 |

### 6.8 型の拡張（修正後）

~~QuizDefinitionに `determineResultCustom` フィールドを追加する~~ → **QuizDefinition の型は変更しない。既存のまま。**

既存の `QuizChoice.points` の `Record<string, number>` のキーを軸名（theory, empirical, quantitative, observational, creative）にして使用する。型上の変更は不要。

`determineScienceThinkingResult` 関数のシグネチャ:
```typescript
export function determineScienceThinkingResult(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  results: QuizResult[],
): QuizResult
```

この関数は `src/quiz/data/science-thinking.ts` 内で定義し、export する。内部で `calculatePersonalityPoints()` を呼び出して5軸スコアを取得し、(最高軸, 第2軸) → result ID のマッピングで結果を決定する。

## 修正しない箇所

- セクション6.1（スコアリング方式）: 変更なし。`determineScienceThinkingResult` の内部ロジックは計画通り
- セクション6.3（レーダーチャート）: 変更なし
- セクション6.4（結果表示カスタマイズ）: 変更なし
- セクション6.5（OGP画像）: 変更なし
- セクション6.6（新規ファイル一覧）: 変更なし
- セクション7（テスト計画）: 変更なし
- セクション8（完了条件）: 変更なし
- 質問、ポイント配分、結果タイプ: すべて変更なし
