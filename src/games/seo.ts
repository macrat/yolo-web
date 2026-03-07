import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { generateGameJsonLd } from "@/lib/seo";
import { getGamePath } from "@/games/registry";
import type { GameMeta } from "./types";

export function buildGamePageMetadata(gameMeta: GameMeta): Metadata {
  const path = getGamePath(gameMeta.slug);
  const canonicalUrl = `${BASE_URL}${path}`;

  return {
    title: `${gameMeta.seo.title} | ${SITE_NAME}`,
    description: gameMeta.seo.description,
    keywords: gameMeta.seo.keywords,
    openGraph: {
      title: gameMeta.seo.ogTitle,
      description: gameMeta.seo.ogDescription,
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: gameMeta.seo.ogTitle,
      description: gameMeta.seo.ogDescription,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export function buildGameJsonLd(gameMeta: GameMeta): object {
  return generateGameJsonLd({
    name: gameMeta.seo.ogTitle,
    description: gameMeta.seo.description,
    url: getGamePath(gameMeta.slug),
    genre: "Puzzle",
    inLanguage: "ja",
    numberOfPlayers: "1",
    publishedAt: gameMeta.publishedAt,
    updatedAt: gameMeta.updatedAt,
  });
}
