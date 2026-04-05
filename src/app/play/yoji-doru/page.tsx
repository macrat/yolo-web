import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/yoji-doru/_components/GameContainer";
import type { YojiQuizEntry } from "@/play/games/yoji-doru/_lib/quiz";
import rawYojiData from "@/data/yoji-data.json";

const gameMeta = gameBySlug.get("yoji-doru")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

/**
 * yoji-data.json から必要なフィールドのみ抽出する。
 * difficulty / structure / sourceUrl をサーバーサイドで除外することで、
 * クライアントバンドルサイズを削減する。
 */
const quizData: YojiQuizEntry[] = (
  rawYojiData as Array<{
    yoji: string;
    reading: string;
    meaning: string;
    category: string;
    origin: string;
    example: string;
  }>
).map(({ yoji, reading, meaning, category, origin, example }) => ({
  yoji,
  reading,
  meaning,
  category,
  origin,
  example,
}));

export default function YojiDoruPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}
      />
      <GameLayout
        meta={gameMeta}
        attribution={
          <p>
            <Link href="/dictionary/yoji">四字熟語辞典</Link>
            で四字熟語の読み方・意味を調べる
          </p>
        }
      >
        <GameContainer data={quizData} />
      </GameLayout>
    </>
  );
}
