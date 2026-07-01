import type { Metadata } from "next";
import Panel from "@/components/Panel";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import ToolboxContent from "./ToolboxContent";
import styles from "./page.module.css";

/**
 * 道具箱ページ = 実用層（cycle-276 / B-545 決定(a)）
 *
 * cycle-276 の決定(a)で、サイトの根幹を診断中心へ一本化した。これに伴い、
 * cycle-232 でトップ `/` に据えられていた道具箱ダッシュボードをここ /toolbox
 * へ降ろした（削除ではなく降格。道具箱は実用層として存続する。
 * 詳細は docs/cycles/cycle-276.md「決定(a)」）。
 *
 * - h1（Panel 外）= 「道具箱」。トップ・about・辞典と同じ先例（ページ見出しは
 *   ページの文脈でありコンテンツではないため Panel に収めない）。
 * - intro Panel = 道具箱の使い方の説明（旧トップから移設）。
 * - 道具箱本体（タイル・プリセット・永続化）は ToolboxContent（client）。
 *   h1 はこのページの1つだけで、ToolboxContent 内の見出しは h2 以下（現状維持）。
 * - localStorage はオリジン単位のため、旧トップで保存した道具箱構成はそのまま
 *   引き継がれる（/toolbox → / の旧 redirect 撤去後も互換）。
 */

const TOOLBOX_DESCRIPTION =
  "文字数カウント・JSON整形・単位換算など、日常のちょっとした作業に使える無料のオンラインツールを一画面に並べて使える道具箱。気に入った道具を並べた構成はこのブラウザに保存され、いつでも同じ場所から使えます。";

export const metadata: Metadata = {
  title: `道具箱 | ${SITE_NAME}`,
  description: TOOLBOX_DESCRIPTION,
  openGraph: {
    title: `道具箱 | ${SITE_NAME}`,
    description: TOOLBOX_DESCRIPTION,
    type: "website",
    url: `${BASE_URL}/toolbox`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `道具箱 | ${SITE_NAME}`,
    description: TOOLBOX_DESCRIPTION,
  },
  alternates: {
    canonical: `${BASE_URL}/toolbox`,
  },
};

export default function ToolboxPage() {
  return (
    <div className={styles.page}>
      {/* h1 は Panel 外（トップ・about・辞典と同じ先例）。説明本文は Panel に収める */}
      <h1 className={styles.title}>道具箱</h1>
      <Panel as="div" className={styles.intro}>
        <p className={styles.lead}>
          日常のちょっとした作業の傍で使える道具を集めた道具箱です。気に入った道具をここに並べて、いつでも同じ場所から使えます。
        </p>
        <p className={styles.discover}>
          各タイルはページを離れずにその場で動き、並べた構成はこのブラウザに保存されます。
        </p>
      </Panel>
      <ToolboxContent />
    </div>
  );
}
