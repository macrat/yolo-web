import type { Metadata } from "next";
import Link from "next/link";
import Panel from "@/components/Panel";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import ToolboxContent from "./toolbox/ToolboxContent";
import styles from "./page.module.css";

/**
 * トップページ = 道具箱（cycle-232 T-3 / Phase 10.3 本公開）
 *
 * site-concept.md の核「気に入ったツールを1つの画面にまとめられる
 * ダッシュボード的な機能を通じて、『日常の傍にある』存在を目指す」を、
 * サイトの顔であるトップで体現する（T-2 決定記録: URL = トップ `/` 採用。
 * 旧 /toolbox プレビューは next.config.ts で `/` へ permanent redirect）。
 *
 * - 旧トップ（占い・診断パークのヒーロー・おすすめタブ・運勢プレビュー・
 *   ブログ欄）は cycle-232 で廃棄した。/play・/blog の機能本体は無変更で、
 *   ヘッダーナビから引き続き到達できる。
 * - 冒頭の intro はサーバーレンダリングの静的テキスト（サイト名・一行
 *   コンセプト・AI 運営の明示〔constitution rule 3。詳細な注記は Footer〕・
 *   /tools への発見導線）に留め、長い説明は /about に置く。
 * - 道具箱本体（タイル・プリセット・永続化）は ToolboxContent（client）。
 *   h1 はこのページの1つだけで、ToolboxContent 内の見出しは h2 以下。
 */

const TOP_DESCRIPTION =
  "文字数カウント・JSON整形・単位換算など、日常のちょっとした作業に使える無料のオンラインツールを集めたサイト。気に入った道具を道具箱に並べて、いつでも同じ場所から使えます。";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: TOP_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: TOP_DESCRIPTION,
    type: "website",
    url: BASE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: TOP_DESCRIPTION,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function Home() {
  return (
    <div className={styles.page}>
      {/* h1 は Panel 外に置く: about・ブログ詳細と同じ先例（ページ見出しは
          「コンテンツ」ではなくページの文脈であり、Panel に収めない）。
          説明本文は DESIGN.md §1「すべてのコンテンツはパネルに収まる」に
          従って Panel に収める（T-6 r1 SF-1） */}
      <h1 className={styles.title}>{SITE_NAME}</h1>
      <Panel as="div" className={styles.intro}>
        <p className={styles.lead}>
          日常のちょっとした作業の傍で使える道具を集めたサイトです。気に入った道具をこの道具箱に並べて、いつでも同じ場所から使えます。
        </p>
        {/* AI 運営の明示（constitution Rule 3。詳細な注記は Footer が常時表示） */}
        <p className={styles.aiNotice}>
          AIが企画・運営する実験的なサイトです。
        </p>
        <p className={styles.discover}>
          各タイルはページを離れずにその場で動き、並べた構成はこのブラウザに保存されます。すべての道具は
          <Link href="/tools">ツール一覧</Link>から探せます。
        </p>
      </Panel>
      <ToolboxContent />
    </div>
  );
}
