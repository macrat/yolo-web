"use client";

import { useState, type ReactNode } from "react";
import Button from "@/components/Button";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import styles from "./CopyButton.module.css";

/** ボタンの面に出す字。押す前・写した・写せなかった。 */
export const COPY_FACES = {
  idle: "コピー",
  copied: "コピー済み",
  failed: "コピー失敗",
} as const;

type CopyState = keyof typeof COPY_FACES;

/** 押したあとに読み上げで言う文。何を写したかを添えて言う。 */
function announcementFor(target: string, copied: boolean): string {
  return copied
    ? `${target}をコピーしました`
    : `${target}をコピーできませんでした`;
}

const COPY_STATES: readonly CopyState[] = ["idle", "copied", "failed"];

/**
 * ボタンを置いた幅のどちらの端に寄せるか。
 * - "start": 字の始まりを並びの左端にそろえる（ボタンの後ろにほかのものが続く並び）。
 * - "end": ボタンの右端を並びの右端にそろえる（見出しの行の右や、値の右に置くもの）。
 * - "stretch": 置いた幅いっぱいに広げる。
 * 並びの組み方が画面の幅で変わるものは、align を渡さず、置く側の CSS が `--copy-button-align` で決める。
 */
type CopyButtonAlign = "start" | "end" | "stretch";

interface CopyButtonProps {
  /** 写す文 */
  text: string;
  /** 何を写すか（「HEX」「変換結果」など）。ボタンの名前（「HEXをコピー」）と、写したときの知らせで言う。 */
  target: string;
  /**
   * 押す前の面に、何を写すかも出す（「メール全文をコピー」）。そばの見出しや値が、何を写すかを言わない
   * ボタンに使う。
   */
  showTarget?: boolean;
  variant?: "default" | "primary";
  align?: CopyButtonAlign;
  disabled?: boolean;
  /** 置いた並びの中での大きさを決めるクラス（幅いっぱいに置くなど）。 */
  className?: string;
}

const ALIGN_CLASSES: Record<CopyButtonAlign, string | undefined> = {
  start: undefined,
  end: styles.end,
  stretch: styles.stretch,
};

/**
 * 結果を写すコピーのボタン（DESIGN.md §6・§8）。押すと面の字が「コピー済み」に替わり、写せなかったときは次に
 * 押すまで「コピー失敗」を出す。
 *
 * 面の字が替わってもボタンのまわりが動かないよう、ボタンを置く場所は、どの面の字も入る大きさをいつも取って
 * おく。ボタンそのものは、いま出している字の大きさで、押せる範囲とリングが字に沿う。
 *
 * 読み上げに知らせる経路は、ライブリージョンの1つだけにする。ボタンの名前は「HEXをコピー」のまま変えない。
 * フォーカスのあるボタンの名前が変わると、それも読み上げられ、同じことを2度聞くからである。名前は見える字の
 * 「コピー」をいつも含み、面に付く「済み」「失敗」はボタンの状態で、それはライブリージョンが文で言う。
 * 知らせは押すたびに要素ごと入れ直し、同じ文が続いても読まれる。
 */
export default function CopyButton({
  text,
  target,
  showTarget = false,
  variant = "default",
  align = "start",
  disabled,
  className,
}: CopyButtonProps) {
  const { copy, copiedKey, failedKey } = useCopyToClipboard();
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });
  const state: CopyState = copiedKey ? "copied" : failedKey ? "failed" : "idle";
  // 何を写すかも出す面は、並びに収まらないとき「を」の後ろで折れ、それでも収まらない何を写すかの名前は、
  // その中で折れる。
  const renderFace = (faceState: CopyState): ReactNode =>
    showTarget && faceState === "idle" ? (
      <>
        <span className={styles.targetName}>{target}を</span>
        <wbr />
        {COPY_FACES.idle}
      </>
    ) : (
      COPY_FACES[faceState]
    );

  async function handleClick(): Promise<void> {
    const copied = await copy(text);
    setAnnouncement((previous) => ({
      id: previous.id + 1,
      message: announcementFor(target, copied),
    }));
  }

  const classes = [styles.copy, ALIGN_CLASSES[align], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-variant={variant}>
      <Button
        variant={variant}
        className={styles.button}
        disabled={disabled}
        onClick={() => void handleClick()}
        aria-label={`${target}を${COPY_FACES.idle}`}
      >
        <span className={styles.face}>{renderFace(state)}</span>
      </Button>
      {COPY_STATES.map((faceState) => (
        <span
          key={faceState}
          className={
            faceState === "idle"
              ? `${styles.reserve} ${styles.reserveIdle}`
              : styles.reserve
          }
          aria-hidden="true"
        >
          {renderFace(faceState)}
        </span>
      ))}
      <span aria-live="polite" className="visually-hidden">
        <span key={announcement.id}>{announcement.message}</span>
      </span>
    </span>
  );
}
