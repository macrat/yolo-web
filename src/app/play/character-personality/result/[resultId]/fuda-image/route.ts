/**
 * 札画像の**決定的 URL**（GET Route Handler）。
 *
 *   GET /play/character-personality/result/<resultId>/fuda-image  → image/png（札）
 *
 * なぜ Route Handler か（cycle-280 設計・MUST-1）: file-based `opengraph-image.tsx` は
 * メタ（og:image）向けでハッシュ付き URL に埋まり、クライアント JS が fetch するための
 * 決定的 URL を保証しない。そこで同じ {@link renderFudaImage} を固定 URL で返し、
 * クライアント（保存/共有 UI・タスク C）が `"/play/character-personality/result/<id>/fuda-image"`
 * で PNG を取得できるようにする。メタプレビューと保存画像は**単一のレンダラ＝単一の真実**。
 *
 * キャッシュ方針: 画像は resultId から決定的に定まるため静的に扱う。
 * `dynamic = "force-static"` でビルド時プリレンダ＆静的配信、`revalidate = false` で
 * 再検証しない。`generateStaticParams` で実在 24 タイプを列挙、未知 ID は既存流儀
 * （opengraph-image と同じ）でフォールバック描画する（`dynamicParams` 既定 true）。
 */

import { renderFudaImage } from "@/lib/fuda-image";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import characterPersonalityQuiz from "@/play/quiz/data/character-personality";

const SLUG = "character-personality";
const quiz = characterPersonalityQuiz;

// 静的配信・再検証なし（決定的な画像）。
export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

type RouteContext = {
  params: Promise<{ resultId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);

  // ImageResponse は Response のサブクラスなのでそのまま返せる。
  return renderFudaImage({
    id: result?.id ?? resultId,
    title: result?.title ?? "結果",
    productName: quiz.meta.title,
  });
}
