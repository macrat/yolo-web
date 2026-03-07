import type { Metadata } from "next";
import Link from "next/link";
import {
  generateGameJsonLdFromMeta,
  generateGameMetadata,
  safeJsonLdStringify,
} from "@/lib/seo";
import { gameBySlug } from "@/games/registry";
import GameLayout from "@/games/_components/GameLayout";
import GameContainer from "@/games/kanji-kanaru/_components/GameContainer";

const gameMeta = gameBySlug.get("kanji-kanaru")!;

export const metadata: Metadata = generateGameMetadata(gameMeta);

const gameJsonLd = generateGameJsonLdFromMeta(gameMeta);

export default function KanjiKanaruPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}
      />
      <GameLayout
        meta={gameMeta}
        attribution={
          <>
            <p>
              漢字データは{" "}
              <a
                href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
                target="_blank"
                rel="noopener noreferrer"
              >
                KANJIDIC2
              </a>{" "}
              (CC BY-SA 4.0) を基に作成しています。
            </p>
            <p>
              <Link href="/dictionary/kanji">漢字辞典</Link>
              で漢字の読み方・意味を調べる
            </p>
          </>
        }
      >
        <GameContainer />
      </GameLayout>
    </>
  );
}
