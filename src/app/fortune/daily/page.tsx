import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import DailyFortuneCard from "@/fortune/_components/DailyFortuneCard";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";

const PAGE_TITLE = "今日のユーモア運勢";
const PAGE_DESCRIPTION =
  "毎日変わるユーモア運勢占い。斜め上のラッキーアイテムと達成困難なアクション付き。";

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | ${SITE_NAME}`,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/fortune/daily`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  alternates: {
    canonical: `${BASE_URL}/fortune/daily`,
  },
};

export default function DailyFortunePage() {
  return (
    <div className={styles.wrapper}>
      <Breadcrumb
        items={[{ label: "ホーム", href: "/" }, { label: PAGE_TITLE }]}
      />
      <TrustLevelBadge level="generated" />
      <DailyFortuneCard />
    </div>
  );
}
