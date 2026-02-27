import { notFound } from "next/navigation";
import DictionaryDetailLayout from "@/dictionary/_components/DictionaryDetailLayout";
import { KANJI_DICTIONARY_META } from "@/dictionary/_lib/dictionary-meta";
import KanjiDetail from "@/dictionary/_components/kanji/KanjiDetail";
import { generateKanjiPageMetadata, generateKanjiJsonLd } from "@/lib/seo";
import { getKanjiByChar, getAllKanjiChars } from "@/dictionary/_lib/kanji";

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
    <DictionaryDetailLayout
      meta={KANJI_DICTIONARY_META}
      breadcrumbItems={[
        { label: "ホーム", href: "/" },
        { label: "辞典", href: "/dictionary" },
        { label: "漢字辞典", href: "/dictionary/kanji" },
        { label: kanji.character },
      ]}
      jsonLd={jsonLd}
      shareUrl={`/dictionary/kanji/${encodeURIComponent(kanji.character)}`}
      shareTitle={`漢字「${kanji.character}」の情報`}
    >
      <KanjiDetail kanji={kanji} />
    </DictionaryDetailLayout>
  );
}
