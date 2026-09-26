import BrowsableList from "@/components/BrowsableList";
import ListPage from "@/components/ListPage";
import {
  PLAY_KINDS,
  PLAY_LIST_BASE_PATH,
  PLAY_LIST_INTRO,
  PLAY_LIST_PER_PAGE,
  PLAY_LIST_TITLE,
  PLAY_SORTS,
  playListItems,
} from "@/play/play-list";
import { listPageHref } from "@/lib/list-pages";

interface PlayListViewProps {
  /** パスが示すページ。 */
  page: number;
}

/**
 * 遊びの一覧（/play とその2ページ目から）。運勢・診断・クイズ・パズルを1つの行の一覧に並べ、各行に種別を一語で出す。
 * 一覧の上に種別の索引を置かないので、種別はラジオボタンの組で絞る（DESIGN.md §7）。
 */
export default function PlayListView({ page }: PlayListViewProps) {
  return (
    <ListPage
      trail={[
        { label: "ホーム", href: "/" },
        {
          label: PLAY_LIST_TITLE,
          href: listPageHref(PLAY_LIST_BASE_PATH, page),
        },
      ]}
      heading={PLAY_LIST_TITLE}
      description={PLAY_LIST_INTRO}
    >
      <BrowsableList
        items={playListItems()}
        hrefPrefix={`${PLAY_LIST_BASE_PATH}/`}
        label="遊びの一覧"
        unit="件"
        searchLabel="名前・説明で探す"
        kindGroup={{ legend: "種別", options: PLAY_KINDS }}
        sorts={PLAY_SORTS}
        perPage={PLAY_LIST_PER_PAGE}
        basePath={PLAY_LIST_BASE_PATH}
        page={page}
        pageTitle={PLAY_LIST_TITLE}
      />
    </ListPage>
  );
}
