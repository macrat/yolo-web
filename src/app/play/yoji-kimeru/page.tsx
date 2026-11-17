import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/yoji-kimeru/_components/GameContainer";
import { computeCrossCategoryItems } from "@/play/games/shared/_lib/crossCategoryItems";

const gameMeta = gameBySlug.get("yoji-kimeru")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

// ビルド時に他カテゴリ推薦データを計算。
// Server Component（page.tsx）で計算することで、registry/seoのimportが
// クライアントバンドルに含まれるのを防ぐ。
const crossCategoryItems = computeCrossCategoryItems("yoji-kimeru");

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
        <GameContainer crossCategoryItems={crossCategoryItems} />
      </GameLayout>
    </>
  );
}
