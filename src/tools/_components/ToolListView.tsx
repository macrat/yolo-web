import BrowsableList from "@/components/BrowsableList";
import ListPage from "@/components/ListPage";
import {
  TOOL_KINDS,
  TOOL_LIST_BASE_PATH,
  TOOL_LIST_INTRO,
  TOOL_LIST_PER_PAGE,
  TOOL_LIST_TITLE,
  TOOL_SORTS,
  toolListItems,
} from "@/tools/_lib/tool-list";

interface ToolListViewProps {
  /** パスが示すページ。 */
  page: number;
}

/**
 * ツールの一覧（/tools とその2ページ目から）。全ツールを1つの行の一覧に並べ、各行に種別を一語で出す。
 * 一覧の上に種別の索引を置かないので、種別はラジオボタンの組で絞る（DESIGN.md §7）。
 */
export default function ToolListView({ page }: ToolListViewProps) {
  return (
    <ListPage
      trail={[{ label: "ホーム", href: "/" }, { label: TOOL_LIST_TITLE }]}
      heading={TOOL_LIST_TITLE}
      description={TOOL_LIST_INTRO}
    >
      <BrowsableList
        items={toolListItems()}
        hrefPrefix={`${TOOL_LIST_BASE_PATH}/`}
        label="ツールの一覧"
        unit="件"
        searchLabel="名前・説明で探す"
        kindGroup={{ legend: "種別", options: TOOL_KINDS }}
        sorts={TOOL_SORTS}
        perPage={TOOL_LIST_PER_PAGE}
        basePath={TOOL_LIST_BASE_PATH}
        page={page}
        pageTitle={TOOL_LIST_TITLE}
      />
    </ListPage>
  );
}
