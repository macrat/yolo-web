import { ImageResponse } from "next/og";
import {
  quizBySlug,
  getAllQuizSlugs,
  getResultIdsForQuiz,
} from "@/lib/quiz/registry";

export const alt = "クイズ結果";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  const params: Array<{ slug: string; resultId: string }> = [];
  for (const slug of getAllQuizSlugs()) {
    for (const resultId of getResultIdsForQuiz(slug)) {
      params.push({ slug, resultId });
    }
  }
  return params;
}

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  const result = quiz?.results.find((r) => r.id === resultId);

  const quizTitle = quiz?.meta.title ?? "クイズ";
  const resultTitle = result?.title ?? "結果";
  const accentColor = quiz?.meta.accentColor ?? "#2563eb";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: accentColor,
        color: "white",
      }}
    >
      <div
        style={{
          fontSize: 28,
          opacity: 0.8,
          marginBottom: 16,
        }}
      >
        {quizTitle}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        {resultTitle}
      </div>
      <div
        style={{
          fontSize: 24,
          opacity: 0.7,
        }}
      >
        yolos.net
      </div>
    </div>,
    { ...size },
  );
}
