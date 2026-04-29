import type { Metadata } from "next";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { STATIC_PAGE_TRUST_LEVELS } from "@/lib/trust-levels";
import DashboardClient from "./_components/DashboardClient";
import styles from "./page.module.css";

const PAGE_TITLE = "実績ダッシュボード";
const PAGE_DESCRIPTION =
  "あなたの利用実績を確認できます。バッジの獲得状況、連続利用日数、今日の進捗などを表示します。";

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | ${SITE_NAME}`,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: `${BASE_URL}/achievements`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
  },
  alternates: {
    canonical: `${BASE_URL}/achievements`,
  },
};

export default function AchievementsPage() {
  return (
    <div className={styles.main}>
      <h1 className={styles.title}>{PAGE_TITLE}</h1>
      <TrustLevelBadge level={STATIC_PAGE_TRUST_LEVELS["/achievements"]} />
      <DashboardClient />
    </div>
  );
}
