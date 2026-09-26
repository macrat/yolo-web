import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import BrowsableList from "@/components/BrowsableList";
import Section from "@/components/Section";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import {
  PLAY_KINDS,
  PLAY_LIST_INTRO,
  PLAY_LIST_PER_PAGE,
  PLAY_LIST_TITLE,
  PLAY_SORTS,
  playListItems,
  playListMetadata,
} from "@/play/play-list";
import styles from "./page.module.css";

export const metadata: Metadata = playListMetadata();

/**
 * 遊びの一覧（/play）。運勢・診断・クイズ・パズルを1つの行の一覧に並べ、各行に種別を一語で出す。
 * 一覧の上に種別の索引を置かないので、種別はラジオボタンの組で絞る（DESIGN.md §7）。
 */
export default function PlayPage() {
  return (
    <Section>
      <div className={styles.view}>
        <Breadcrumb
          items={[{ label: "ホーム", href: "/" }, { label: PLAY_LIST_TITLE }]}
        />
        <div>
          <h1 className={styles.title} {...headingFontAttr(PLAY_LIST_TITLE)}>
            {PLAY_LIST_TITLE}
          </h1>
          <p className={styles.description}>{PLAY_LIST_INTRO}</p>
        </div>
        <BrowsableList
          items={playListItems()}
          hrefPrefix="/play/"
          label="遊びの一覧"
          unit="件"
          searchLabel="名前・説明で探す"
          kindGroup={{ legend: "種別", options: PLAY_KINDS }}
          sorts={PLAY_SORTS}
          perPage={PLAY_LIST_PER_PAGE}
          basePath="/play"
          page={1}
          pageTitle={PLAY_LIST_TITLE}
        />
      </div>
    </Section>
  );
}
