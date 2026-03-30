import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/kanji-kanaru/_components/GameContainer";
import { computeCrossCategoryItems } from "@/play/games/shared/_lib/crossCategoryItems";

const gameMeta = gameBySlug.get("kanji-kanaru")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

// ビルド時に他カテゴリ推薦データを計算。
// Server Component（page.tsx）で計算することで、registry/seoのimportが
// クライアントバンドルに含まれるのを防ぐ。
const crossCategoryItems = computeCrossCategoryItems("kanji-kanaru");

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
        <GameContainer crossCategoryItems={crossCategoryItems} />
      </GameLayout>
    </>
  );
}
