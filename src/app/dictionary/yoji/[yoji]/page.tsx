import { notFound } from "next/navigation";
import DictionaryDetailLayout from "@/dictionary/_components/DictionaryDetailLayout";
import { YOJI_DICTIONARY_META } from "@/dictionary/_lib/dictionary-meta";
import YojiDetail from "@/dictionary/_components/yoji/YojiDetail";
import { generateYojiPageMetadata, generateYojiJsonLd } from "@/lib/seo";
import { getYojiByYoji, getAllYojiIds } from "@/dictionary/_lib/yoji";

export function generateStaticParams() {
  return getAllYojiIds().map((yoji) => ({ yoji }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ yoji: string }>;
}) {
  const { yoji: yojiParam } = await params;
  const decoded = decodeURIComponent(yojiParam);
  const yoji = getYojiByYoji(decoded);
  if (!yoji) return {};
  return generateYojiPageMetadata(yoji);
}

export default async function YojiDetailPage({
  params,
}: {
  params: Promise<{ yoji: string }>;
}) {
  const { yoji: yojiParam } = await params;
  const decoded = decodeURIComponent(yojiParam);
  const yoji = getYojiByYoji(decoded);
  if (!yoji) notFound();

  const jsonLd = generateYojiJsonLd(yoji);

  return (
    <DictionaryDetailLayout
      meta={YOJI_DICTIONARY_META}
      breadcrumbItems={[
        { label: "ホーム", href: "/" },
        { label: "辞典", href: "/dictionary" },
        { label: "四字熟語辞典", href: "/dictionary/yoji" },
        { label: yoji.yoji },
      ]}
      jsonLd={jsonLd}
      shareUrl={`/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`}
      shareTitle={`「${yoji.yoji}」の意味・読み方`}
    >
      <YojiDetail yoji={yoji} />
    </DictionaryDetailLayout>
  );
}
