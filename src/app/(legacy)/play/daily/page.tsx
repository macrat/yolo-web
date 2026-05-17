import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import DailyFortuneCard from "@/play/fortune/_components/DailyFortuneCard";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { generatePlayMetadata, generatePlayJsonLd } from "@/play/seo";
import { safeJsonLdStringify } from "@/lib/seo";
import { fortunePlayContentMeta } from "@/play/registry";
import styles from "./page.module.css";

export const metadata = generatePlayMetadata(fortunePlayContentMeta);

const jsonLd = generatePlayJsonLd(fortunePlayContentMeta);

export default function DailyFortunePage() {
  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊ぶ", href: "/play" },
          { label: fortunePlayContentMeta.title },
        ]}
      />
      <TrustLevelBadge level="generated" />
      <DailyFortuneCard />
      <RecommendedContent currentSlug="daily" />
    </div>
  );
}
