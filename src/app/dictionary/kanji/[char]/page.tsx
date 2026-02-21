import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/components/common/ShareButtons";
import KanjiDetail from "@/components/dictionary/kanji/KanjiDetail";
import { generateKanjiPageMetadata, generateKanjiJsonLd } from "@/lib/seo";
import { getKanjiByChar, getAllKanjiChars } from "@/lib/dictionary/kanji";
import styles from "./page.module.css";

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
      <section className={styles.shareSection}>
        <ShareButtons
          url={`/dictionary/kanji/${encodeURIComponent(kanji.character)}`}
          title={`\u6F22\u5B57\u300C${kanji.character}\u300D\u306E\u60C5\u5831`}
          sns={["x", "line", "copy"]}
        />
      </section>
    </>
  );
}
