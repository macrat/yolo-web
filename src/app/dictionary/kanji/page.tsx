import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getAllKanji, getKanjiCategories } from "@/dictionary/_lib/kanji";
import { KANJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import KanjiIndexClient from "./KanjiIndexClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `\u6F22\u5B57\u8F9E\u5178 | ${SITE_NAME}`,
  description:
    "\u5E38\u7528\u6F22\u5B572,136\u5B57\u306E\u8AAD\u307F\u65B9\u30FB\u610F\u5473\u30FB\u90E8\u9996\u30FB\u753B\u6570\u3092\u4E01\u5BE7\u306B\u307E\u3068\u3081\u305F\u30AA\u30F3\u30E9\u30A4\u30F3\u6F22\u5B57\u8F9E\u5178\u3002\u5404\u6F22\u5B57\u306E\u4F7F\u7528\u4F8B\u3082\u3042\u308F\u305B\u3066\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002",
  keywords: [
    "\u6F22\u5B57\u8F9E\u5178",
    "\u6F22\u5B57",
    "\u8AAD\u307F\u65B9",
    "\u5E38\u7528\u6F22\u5B57",
  ],
  openGraph: {
    title: `\u6F22\u5B57\u8F9E\u5178 | ${SITE_NAME}`,
    description:
      "\u5E38\u7528\u6F22\u5B572,136\u5B57\u306E\u8AAD\u307F\u65B9\u30FB\u610F\u5473\u30FB\u90E8\u9996\u30FB\u753B\u6570\u3092\u4E01\u5BE7\u306B\u307E\u3068\u3081\u305F\u30AA\u30F3\u30E9\u30A4\u30F3\u6F22\u5B57\u8F9E\u5178\u3002",
    type: "website",
    url: `${BASE_URL}/dictionary/kanji`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `\u6F22\u5B57\u8F9E\u5178 | ${SITE_NAME}`,
    description:
      "\u5E38\u7528\u6F22\u5B572,136\u5B57\u306E\u8AAD\u307F\u65B9\u30FB\u610F\u5473\u30FB\u90E8\u9996\u30FB\u753B\u6570\u3092\u4E01\u5BE7\u306B\u307E\u3068\u3081\u305F\u30AA\u30F3\u30E9\u30A4\u30F3\u6F22\u5B57\u8F9E\u5178\u3002",
  },
  alternates: {
    canonical: `${BASE_URL}/dictionary/kanji`,
  },
};

export default function KanjiIndexPage() {
  const allKanji = getAllKanji();
  const categories = getKanjiCategories().map((c) => ({
    slug: c,
    label: KANJI_CATEGORY_LABELS[Number(c)],
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "\u30DB\u30FC\u30E0", href: "/" },
          { label: "\u8F9E\u5178", href: "/dictionary" },
          { label: "\u6F22\u5B57\u8F9E\u5178" },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1 className={styles.title}>{"\u6F22\u5B57\u8F9E\u5178"}</h1>
      <p className={styles.description}>
        {"\u5E38\u7528\u6F22\u5B57"}
        {allKanji.length}
        {
          "\u5B57\u306E\u8AAD\u307F\u65B9\u30FB\u610F\u5473\u30FB\u90E8\u9996\u30FB\u753B\u6570\u3092\u4E01\u5BE7\u306B\u307E\u3068\u3081\u307E\u3057\u305F\u3002\u6F22\u5B57\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u3001\u4F7F\u7528\u4F8B\u3084\u95A2\u9023\u3059\u308B\u6F22\u5B57\u3082\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002"
        }
      </p>
      <CategoryNav
        categories={categories}
        basePath="/dictionary/kanji/category"
        allLabel={"\u3059\u3079\u3066"}
        allHref="/dictionary/kanji"
      />
      <KanjiIndexClient allKanji={allKanji} />
    </>
  );
}
