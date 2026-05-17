import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getKanjiByStrokeCount,
  getKanjiStrokeCounts,
} from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";

export function generateStaticParams() {
  return getKanjiStrokeCounts().map((c) => ({ count: String(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ count: string }>;
}): Promise<Metadata> {
  const { count } = await params;
  const title = `${count}画の漢字一覧 - 漢字辞典 | ${SITE_NAME}`;
  const description = `${count}画の漢字一覧。読み方・意味・部首情報を確認できます。`;
  const url = `${BASE_URL}/dictionary/kanji/stroke/${count}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function KanjiStrokePage({
  params,
}: {
  params: Promise<{ count: string }>;
}) {
  const { count } = await params;
  const validCounts = getKanjiStrokeCounts().map(String);
  if (!validCounts.includes(count)) {
    notFound();
  }

  const strokeCount = Number(count);
  const kanjiList = getKanjiByStrokeCount(strokeCount);
  const strokeCategories = validCounts.map((c) => ({
    slug: c,
    label: `${c}画`,
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `${count}画の漢字` },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1>
        {count}
        {"画の漢字"}
      </h1>
      <p>
        {kanjiList.length}
        {"字収録"}
      </p>

      <CategoryNav
        categories={strokeCategories}
        basePath="/dictionary/kanji/stroke"
        activeCategory={count}
        allLabel={"すべて"}
        allHref="/dictionary/kanji"
      />

      <DictionaryGrid>
        {kanjiList.map((k) => (
          <div key={k.character} role="listitem">
            <DictionaryCard
              type="kanji"
              character={k.character}
              readings={[...k.onYomi, ...k.kunYomi]}
              meanings={k.meanings}
              category={KANJI_GRADE_LABELS[k.grade]}
            />
          </div>
        ))}
      </DictionaryGrid>
    </>
  );
}
