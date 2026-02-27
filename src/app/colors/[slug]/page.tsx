import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import ShareButtons from "@/components/common/ShareButtons";
import ColorDetail from "@/dictionary/_components/color/ColorDetail";
import {
  generateColorPageMetadata,
  generateColorJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import { getColorBySlug, getAllColorSlugs } from "@/dictionary/_lib/colors";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getAllColorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const color = getColorBySlug(slug);
  if (!color) return {};
  return generateColorPageMetadata(color);
}

export default async function ColorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const color = getColorBySlug(slug);
  if (!color) notFound();

  const jsonLd = generateColorJsonLd(color);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "ホーム", href: "/" },
    { label: "伝統色", href: "/colors" },
    { label: color.name },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "伝統色", href: "/colors" },
          { label: color.name },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <ColorDetail color={color} />
      <section className={styles.shareSection}>
        <ShareButtons
          url={`/colors/${color.slug}`}
          title={`${color.name}\uFF08${color.romaji}\uFF09`}
          sns={["x", "line", "copy"]}
        />
      </section>
    </>
  );
}
