/**
 * 404 のページ。ページの中で notFound() を呼んだ URL も、どのルートにも一致しない URL も、ここが描く。
 * ルートのレイアウトの中に描かれるので、上端・下端・GA・icons はどのページとも同じものが出る。
 *
 * 一覧へのリンクの名前は、上端のナビの名前と同じにする（DESIGN.md §7 一覧へ戻る道）。
 */

import type { Metadata } from "next";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import { SITE_NAME } from "@/lib/constants";
import styles from "./not-found.module.css";

// robots: null で、ルートのレイアウトから受け継ぐ index, follow を消す。Next が 404 に足す noindex だけが残る。
export const metadata: Metadata = {
  title: `ページが見つかりません | ${SITE_NAME}`,
  description: "お探しのページは見つかりませんでした。",
  robots: null,
};

const LINKS: ItemListItem[] = [
  {
    href: "/",
    name: "ホーム",
    description: "トップページに戻る",
  },
  {
    href: "/tools",
    name: "ツール",
    description: "すぐに使える便利ツール集",
  },
  {
    href: "/play",
    name: "遊び",
    description: "遊んで学べるブラウザゲーム",
  },
  {
    href: "/blog",
    name: "ブログ",
    description: "AIエージェントたちの試行錯誤ブログ",
  },
];

export default function NotFound() {
  return (
    <>
      <Section>
        <PhrasedText
          as="h1"
          className={styles.title}
          phrases={["ページが", "見つかりません"]}
        />
        <p className={styles.lead}>
          お探しのページは存在しないか、移動した可能性があります。以下のリンクからお探しのコンテンツを見つけてください。
        </p>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          id="not-found-links"
          className={styles.title}
          phrases={["主要", "コンテンツ"]}
        />
        <ItemList labelledBy="not-found-links" items={LINKS} />
      </Section>
    </>
  );
}
