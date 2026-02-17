import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import YojiDetail from "@/components/dictionary/yoji/YojiDetail";
import { generateYojiPageMetadata, generateYojiJsonLd } from "@/lib/seo";
import { getYojiByYoji, getAllYojiIds } from "@/lib/dictionary/yoji";

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "四字熟語辞典", href: "/dictionary/yoji" },
          { label: yoji.yoji },
        ]}
      />
      <YojiDetail yoji={yoji} />
    </>
  );
}
