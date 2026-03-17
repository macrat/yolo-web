import type { Metadata } from "next";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/irodori/_components/GameContainer";

const gameMeta = gameBySlug.get("irodori")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

export default function IrodoriPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}
      />
      <GameLayout meta={gameMeta}>
        <GameContainer />
      </GameLayout>
    </>
  );
}
