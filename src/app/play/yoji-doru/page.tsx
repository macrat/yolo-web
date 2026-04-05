import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/yoji-doru/_components/GameContainer";

const gameMeta = gameBySlug.get("yoji-doru")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

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
        <GameContainer />
      </GameLayout>
    </>
  );
}
