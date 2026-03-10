import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getKanjiByRadical, getKanjiRadicals } from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";

export function generateStaticParams() {
  return getKanjiRadicals().map((r) => ({
    radical: encodeURIComponent(r),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ radical: string }>;
}): Promise<Metadata> {
  const { radical: rawRadical } = await params;
  const radical = decodeURIComponent(rawRadical);
  const title = `部首「${radical}」の漢字一覧 - 漢字辞典 | ${SITE_NAME}`;
  const description = `部首「${radical}」を持つ漢字の一覧。読み方・意味・画数情報を確認できます。`;
  const url = `${BASE_URL}/dictionary/kanji/radical/${encodeURIComponent(radical)}`;
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

export default async function KanjiRadicalPage({
  params,
}: {
  params: Promise<{ radical: string }>;
}) {
  const { radical: rawRadical } = await params;
  const radical = decodeURIComponent(rawRadical);
  const allRadicals = getKanjiRadicals();
  if (!allRadicals.includes(radical)) {
    notFound();
  }

  const kanjiList = getKanjiByRadical(radical);
  const radicalCategories = allRadicals.map((r) => ({
    slug: encodeURIComponent(r),
    label: r,
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `部首「${radical}」の漢字` },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1>{`部首「${radical}」の漢字`}</h1>
      <p>
        {kanjiList.length}
        {"字収録"}
      </p>

      <CategoryNav
        categories={radicalCategories}
        basePath="/dictionary/kanji/radical"
        activeCategory={encodeURIComponent(radical)}
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
