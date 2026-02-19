import { ImageResponse } from "next/og";
import { quizBySlug, getAllQuizSlugs } from "@/lib/quiz/registry";

export const alt = "クイズ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);

  const title = quiz?.meta.title ?? "クイズ";
  const icon = quiz?.meta.icon ?? "?";
  const accentColor = quiz?.meta.accentColor ?? "#2563eb";
  const description = quiz?.meta.shortDescription ?? "";

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
          fontSize: 100,
          marginBottom: 24,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 28,
          opacity: 0.9,
          marginBottom: 24,
        }}
      >
        {description}
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
