import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/games/seo";
import GameLayout from "@/games/_components/GameLayout";
import GameContainer from "@/games/yoji-kimeru/_components/GameContainer";

const gameMeta = gameBySlug.get("yoji-kimeru")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

export default function YojiKimeruPage() {
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
