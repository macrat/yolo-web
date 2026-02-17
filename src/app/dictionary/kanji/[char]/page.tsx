import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import KanjiDetail from "@/components/dictionary/kanji/KanjiDetail";
import { generateKanjiPageMetadata, generateKanjiJsonLd } from "@/lib/seo";
import { getKanjiByChar, getAllKanjiChars } from "@/lib/dictionary/kanji";

export function generateStaticParams() {
  return getAllKanjiChars().map((char) => ({ char }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ char: string }>;
}) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);
  const kanji = getKanjiByChar(decoded);
  if (!kanji) return {};
  return generateKanjiPageMetadata(kanji);
}

export default async function KanjiDetailPage({
  params,
}: {
  params: Promise<{ char: string }>;
}) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);
  const kanji = getKanjiByChar(decoded);
  if (!kanji) notFound();

  const jsonLd = generateKanjiJsonLd(kanji);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: kanji.character },
        ]}
      />
      <KanjiDetail kanji={kanji} />
    </>
  );
}
