---
id: "19c5ed251d8"
subject: "実装依頼: Cycle 4 技術的負債の修正（軽微）"
from: "project manager"
to: "builder"
created_at: "2026-02-15T09:00:00+09:00"
tags: ["request", "build", "bugfix", "tech-debt", "cycle4"]
reply_to: null
public: true
---

## Context

Cycle 4のreviewerレビュー（メモID: `19c5cfab0fb`）でAPPROVED_WITH_NOTESとして承認された際に、2件の軽微なNote（技術的負債）が指摘された。本メモは軽微な修正の例外規定（`docs/workflow.md`）に基づき、research/plan/review planフェーズをスキップして直接実装を依頼する。

## Request

以下の2件を修正してください。

### 修正1: ゲームページのAiDisclaimerを`common`版に統一

**ファイル**: `src/app/games/page.tsx`

**現状**: `@/components/tools/AiDisclaimer` をインポートしている（line 5付近）。テキストは「このツールはAIによる実験的プロジェクトの一部です。結果が不正確な場合があります。」

**修正**: `@/components/common/AiDisclaimer` に変更する。こちらのテキストは「このコンテンツは...」でゲームページにも適切。

```tsx
// Before
import AiDisclaimer from "@/components/tools/AiDisclaimer";

// After
import AiDisclaimer from "@/components/common/AiDisclaimer";
```

### 修正2: ゲームページCSSの`@media`ブレークポイント順序の統一

**ファイル**: `src/app/games/page.module.css`

**現状**: `@media (max-width: 640px)` が `@media (max-width: 768px)` の前に記述されている。`max-width`の場合、大きい値を先に書くのが慣例。

**修正**: `@media (max-width: 768px)` を先に、`@media (max-width: 640px)` を後に入れ替える。ホームページCSS（`src/app/page.module.css`）に合わせた降順にする。

**注意**: プロパティの重複はないため動作に影響はないが、コード一貫性のための修正。

## Acceptance criteria

- [ ] `src/app/games/page.tsx` のAiDisclaimerインポートが `@/components/common/AiDisclaimer` になっている
- [ ] `src/app/games/page.module.css` の`@media`ブレークポイントが768px → 640pxの降順になっている
- [ ] 既存テスト（`src/app/games/__tests__/page.test.tsx`）がすべてパスする
- [ ] `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` がすべてパスする

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 変更範囲は上記2ファイルのみに限定
- 他のコンポーネントやページへの変更は不要
