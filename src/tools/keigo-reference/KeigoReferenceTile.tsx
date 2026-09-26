"use client";

/**
 * KeigoReferenceTile — 敬語早見表の単一正典タイル。ルートが <Panel>（DESIGN.md §5 のボックス）で自己完結する。
 *
 * 表示する内容（敬語早見表・よくある間違い）を切り替える。早見表は、件数の行・名前の欄・畳める分類の組と、
 * 広い画面の表・狭い画面の開閉する行を縦に並べる（§7「件数と備え」・§8）。絞り込みは URL のクエリに持つ。
 *
 * - 普通語は読みを持たず五十音順に並べられないので、並び順は分類順だけにし、件数の行がそれを言う。分類は
 *   表の列と行の字に出し、何の順かが見えるようにする。
 * - 表の <tr> に role="button" を付けると表の構造が壊れるので、先頭のセル <th scope="row"> の中の
 *   <button aria-expanded> で開閉する。
 * - 狭い画面の開閉する行は、読み上げの名前を普通語だけにし、分類と敬語の形を説明として読ませる。
 */

import { useState, Fragment } from "react";
import Panel from "@/components/Panel";
import RadioGroup from "@/components/RadioGroup";
import ListControls from "@/components/ListControls";
import ListStatus from "@/components/ListStatus";
import DisclosureTriangle from "@/components/DisclosureTriangle";
import DisclosureRow from "@/tools/_components/DisclosureRow";
import { useListBrowseState } from "@/components/BrowsableList/useListBrowseState";
import {
  KEIGO_LIST_ITEMS,
  KEIGO_LIST_SPEC,
  getCommonMistakes,
  type KeigoEntry,
  type MistakeType,
} from "./logic";
import styles from "./KeigoReferenceTile.module.css";

type ActiveTab = "table" | "mistakes";

const TAB_OPTIONS: { label: string; value: ActiveTab }[] = [
  { label: "敬語早見表", value: "table" },
  { label: "よくある間違い", value: "mistakes" },
];

const MISTAKE_SECTIONS: { type: MistakeType; label: string }[] = [
  { type: "double-keigo", label: "二重敬語" },
  { type: "wrong-direction", label: "尊敬語・謙譲語の混同" },
  { type: "baito-keigo", label: "バイト敬語" },
];

const COMMON_MISTAKES = getCommonMistakes();

/** 狭い画面の行に、普通語に続けて並べる敬語の形。 */
const KEIGO_FORMS = [
  ["尊敬語", "sonkeigo"],
  ["謙譲語", "kenjogo"],
  ["丁寧語", "teineigo"],
] as const satisfies ReadonlyArray<readonly [string, keyof KeigoEntry]>;

const [SORT] = KEIGO_LIST_SPEC.sorts;

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type KeigoReferenceTileVariant = "full";

export interface KeigoReferenceTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 全機能（表示する内容の切り替え・早見表の絞り込み・表と狭い画面の行）
   */
  variant?: KeigoReferenceTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/** 行を開いたときに出る例文と注記。 */
function EntryExamples({ entry }: { entry: KeigoEntry }) {
  return (
    <div className={styles.examplePanel}>
      {entry.examples.map((ex, i) => (
        <div key={i} className={styles.exampleItem}>
          <div className={styles.exampleContext}>{ex.context}</div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>普通:</span>
            {ex.casual}
          </div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>尊敬語:</span>
            {ex.sonkeigo}
          </div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>謙譲語:</span>
            {ex.kenjogo}
          </div>
        </div>
      ))}
      {entry.notes && <div className={styles.noteText}>{entry.notes}</div>}
    </div>
  );
}

export default function KeigoReferenceTile({
  variant = "full",
  as = "section",
  className,
}: KeigoReferenceTileProps = {}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");
  const {
    state,
    slice,
    announcement,
    clear,
    filtering,
    matched,
    searchRef,
    setKind,
    setQuery,
    statusRef,
  } = useListBrowseState({
    items: KEIGO_LIST_ITEMS,
    spec: KEIGO_LIST_SPEC,
    unit: "語",
  });
  // 開いた行を1つに保つ。ほかの行を開くと、前に開いていた行は閉じる。
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const toggleEntry = (id: string) => {
    setOpenEntryId((current) => (current === id ? null : id));
  };

  // variant は現在 full のみ。将来の拡張に備えて variant 変数を参照しておく。
  void variant;

  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      <div className={styles.inner}>
        {/* 表示する内容の切り替え。早見表の絞り込みではなく道具の画面の切り替えなので、畳む枠の外に置く。 */}
        <RadioGroup
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={(val) => setActiveTab(val as ActiveTab)}
          legend="表示する内容"
        />

        {activeTab === "table" && (
          <div className={styles.browse}>
            <div className={styles.head}>
              <ListStatus
                ref={statusRef}
                total={KEIGO_LIST_ITEMS.length}
                matched={matched}
                filtering={filtering}
                unit="語"
                sortLabel={SORT.label}
                announcement={announcement}
                onClear={clear}
              />
              <ListControls
                searchLabel="普通語・敬語で探す"
                searchRef={searchRef}
                query={state.query}
                onQueryChange={setQuery}
                kindGroup={{
                  legend: "分類",
                  options: KEIGO_LIST_SPEC.kinds,
                  value: state.kind,
                  onChange: setKind,
                }}
              />
            </div>

            {slice.items.length > 0 ? (
              <>
                {/* 広い画面の表。先頭のセルの開閉のボタンで、次の行に例文を出す。 */}
                <div className={styles.desktopTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">普通語</th>
                        <th scope="col">分類</th>
                        <th scope="col">尊敬語</th>
                        <th scope="col">謙譲語</th>
                        <th scope="col">丁寧語</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.items.map(({ entry, kind }) => (
                        <Fragment key={entry.id}>
                          {/*
                           * <tr> は暗黙の役割 row を持つので、role="button" を付けると表の構造が壊れる。
                           * 先頭のセルを <th scope="row"> にし、その中のボタンで開閉する。
                           */}
                          <tr>
                            <th scope="row" className={styles.casualCell}>
                              <button
                                type="button"
                                className={styles.expandButton}
                                onClick={() => toggleEntry(entry.id)}
                                aria-expanded={openEntryId === entry.id}
                                aria-label={`${entry.casual} の例文`}
                              >
                                <DisclosureTriangle />
                                {entry.casual}
                              </button>
                            </th>
                            <td className={styles.kindCell}>{kind}</td>
                            <td>{entry.sonkeigo}</td>
                            <td>{entry.kenjogo}</td>
                            <td>{entry.teineigo}</td>
                          </tr>
                          {openEntryId === entry.id && (
                            <tr>
                              <td colSpan={5}>
                                <EntryExamples entry={entry} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 狭い画面の行。1行1項目で、各行は開閉する行で、開くと例文が出る（§6・§8）。 */}
                <ul className={styles.mobileRows}>
                  {slice.items.map(({ entry, kind }) => (
                    <li key={entry.id} className={styles.mobileRow}>
                      <DisclosureRow
                        open={openEntryId === entry.id}
                        onToggle={() => toggleEntry(entry.id)}
                        nameClassName={styles.mobileRowTitle}
                        descriptionClassName={styles.mobileRowDetails}
                        name={entry.casual}
                        description={
                          <>
                            <span className={styles.mobileRowKind}>{kind}</span>
                            {KEIGO_FORMS.map(([label, key]) => (
                              <Fragment key={key}>
                                {" "}
                                <span className={styles.mobileRowForm}>
                                  <span className={styles.mobileRowLabel}>
                                    {label}:
                                  </span>{" "}
                                  <span className={styles.mobileRowValue}>
                                    {entry[key]}
                                  </span>
                                </span>
                              </Fragment>
                            ))}
                          </>
                        }
                      >
                        <EntryExamples entry={entry} />
                      </DisclosureRow>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        )}

        {/* よくある間違いタブコンテンツ */}
        {activeTab === "mistakes" && (
          <>
            {MISTAKE_SECTIONS.map((section) => {
              const mistakes = COMMON_MISTAKES.filter(
                (m) => m.mistakeType === section.type,
              );
              if (mistakes.length === 0) return null;
              return (
                <div key={section.type} className={styles.mistakeSection}>
                  <h2 className={styles.mistakeSectionTitle}>
                    {section.label}
                  </h2>
                  {mistakes.map((mistake) => (
                    <div key={mistake.id} className={styles.mistakeCard}>
                      <div>
                        <span className={styles.mistakeLabel}>誤:</span>
                        <span className={styles.wrongText}>
                          {mistake.wrong}
                        </span>
                      </div>
                      <div>
                        <span className={styles.mistakeLabel}>正:</span>
                        <span className={styles.correctText}>
                          {mistake.correct}
                        </span>
                      </div>
                      <div className={styles.explanationText}>
                        {mistake.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </Panel>
  );
}
