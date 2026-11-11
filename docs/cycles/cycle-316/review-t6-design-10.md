# T6 設計のレビュー（10巡目）

対象: `git show HEAD`（dbe0f7e1。`docs/cycles/cycle-316/t6-design.md`・`t5-design.md`）を、[review-t6-design-9.md](./review-t6-design-9.md) の指摘1〜4に照らして確かめた。

## 判定: 承認

### 指摘1（`src/play/seo.ts` の理由）: 直っている

- 3-2「b の組み方」と4章の頭の表の `seo.ts` の行は、`src/lib/seo.ts` だけを「クライアントの部品から読まれる」とし、`src/play/seo.ts` は「クライアントから読まれていないが、形をそろえ、画像の値を作る所を `page.tsx` の1か所にするため」と書いている。
- `rg` で確かめた事実と合う:
  - `crossCategoryItems.ts` を import するのは `src/app/play/{kanji-kanaru,yoji-kimeru,nakamawake,irodori}/page.tsx`（サーバー）の4本だけ。
  - `@/play/seo` を値で読むのは `crossCategoryItems.ts`・`QuizPlayPageLayout.tsx`（`"use client"` なし。使うのは `play/[slug]`・`music-personality` の `page.tsx` だけ。`QuestionCard.tsx` の一致はコメント）と、`page.tsx`・テストだけ。
  - `"use client"` のファイルで `Breadcrumb` を値で読むのは `src/app/storybook/StorybookContent.tsx:17` だけで、`src/components/Breadcrumb/index.tsx:7` が `@/lib/seo` を読む。
- 変更の履歴の節（まとめ）も同じ言い方にそろっている。

### 指摘2（「T6 が触るのはブログの JSON-LD だけ」）: 直っている

「画像のルートを持つページのディレクトリ」の行は、T6 が `page.tsx` の `generateMetadata` とブログの JSON-LD の `image` だけを触り、本文は触らないこと、どのタスクがいつ触るかは上の各行と索引の行によることを書いている。変更後の設計と食い違いはない。

### 指摘3（受け持ちの表の漏れ）: 直っている

- T6-2: `generateMetadata` と JSON-LD、T5-22b・T5-15、`page.test.tsx` がある。
- T6-3: ユーモア辞典・`play/[slug]`・`music-personality` の `page.tsx`、`seo-humor-dict.test.ts` がある。
- T6-4: T5-5a → T5-22b → T5-6 のあと、になっている。
- T6-5: 伝統色の `page.tsx`、`seo.test.ts` の該当の試験がある。
- T6-8: 漢字・四字熟語の `page.tsx`、`seo.test.ts` の該当の試験がある。
- `seo.ts` の行: `seo.test.ts` を含めて、T6-3・T6-5・T6-8 を並行させない。

### 指摘4（t5-design.md 10-1・10-4）: 直っている。向きも同じ

- 10-1「T6 と重なるもの」に、ブログ（T5-22b・T5-15 と T6-2 を並行させない）、ユーモア辞典（T5-22b → T5-13 と T6-3）、`play/[slug]`（T5-22b と T6-3。T5-4 が触るのは `page.module.css` だけ）、`music-personality`（T6-3 だけ）、伝統色・漢字・四字熟語（T5-22b → T5-9 と T6-5・T6-8。T5-10〜T5-12 は `page.tsx` を触らない）、結果10本（T5-5a → T5-22b → T5-6 → T6-4）が入った。t6-design.md 4章の頭の表の各行（392・395〜398行）と同じ順で、矛盾はない。
- 10-4 の受け持ちの表（797・798・801・804・806行）も同じ順になっている。`play/[slug]/page.tsx` の行を新しく足している。
- 前提も確かめた: T5-22b の16ファイル（718行）はこれらの `page.tsx` を含み、T5-4 の受け持ちは `play/[slug]/page.module.css`（790行）で `page.tsx` ではなく、`music-personality/page.tsx` は t5-design.md の受け持ちに無い。

## 気づいたこと（直さなくてよい）

- t6-design.md の「9巡目」の節は、指摘4を「PM に渡す」と書いている。同じコミットで t5-design.md も直っているが、サイクルの文書の履歴として、T6 の設計の側での扱いを書いたものなので誤りではない。
