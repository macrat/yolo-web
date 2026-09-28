# T6 の作業の記録

t6-design.md 4章が求める、タスクごとの画像の比較と測った数を残す。

## T6-0（3332c05）

- 変更の前と後で `next build` し、`.next/server/app` の画像の body（731件）の sha256 がすべて一致した。
- `scripts/generate-favicons.ts` の出力（`favicon.ico`・`icon.svg`・`apple-touch-icon.png`）が変更の前後でバイト単位で一致した（出力はコミットしていない）。
- レビュー: [review-t6-0.md](./review-t6-0.md)（承認）。

## T6-2

- ブログの `src/app/blog/[slug]/twitter-image.tsx` の削除は、担当がステージしたものが T5 の設計のコミット 106e161 に入った。T6-2 のレビューの範囲には 106e161 のこの削除を含める。
