"use client";

import { useState, type ReactNode } from "react";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  type CopyStatus,
} from "@/components/hooks/useCopyToClipboard";
import styles from "./CopyButton.module.css";

/** ボタンの面に出す字。押す前・写した・写せなかった。 */
export const COPY_FACES: Record<CopyStatus, string> = {
  idle: "コピー",
  copied: "コピー済み",
  failed: "コピー失敗",
};

/**
 * ボタンの名前。何を写すかを添え、しばらく出ている面の字を含める。「コピー済み」はすぐ押す前の面に戻るので、
 * そのあいだも押す前の名前のままにする。「コピー失敗」は次に押すまで残るので、見えている字を名前に含める。
 */
function accessibleName(target: string, status: CopyStatus): string {
  return status === "failed"
    ? `${target}の${COPY_FACES.failed}`
    : `${target}を${COPY_FACES.idle}`;
}

/** 押したあとに読み上げで言う文。何を写したかを添えて言う。 */
function announcementFor(target: string, copied: boolean): string {
  return copied
    ? `${target}をコピーしました`
    : `${target}をコピーできませんでした`;
}

const COPY_STATUSES: readonly CopyStatus[] = ["idle", "copied", "failed"];

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
  /** 何を写すか（「HEX」「変換結果」など）。ボタンの名前（「HEXをコピー」）と、押したあとの知らせで言う。 */
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
 * 道具や辞典が出した値を、その場で使うために写すコピーのボタン（DESIGN.md §6・§8）。押すと面の字が
 * 「コピー済み」に替わり、写せなかったときは次に押すまで「コピー失敗」を出す。
 *
 * 面の字が替わってもボタンのまわりが動かないよう、ボタンを置く場所は、どの面の字も入る大きさをいつも取って
 * おく。ボタンそのものは、いま出している字の大きさで、押せる範囲とリングが字に沿う。
 *
 * 読み上げに知らせる経路は、ライブリージョンの1つだけにする。知らせは押すたびに要素ごと入れ直し、同じ文が
 * 続いても読まれる。ボタンの名前は、面の字が「コピー済み」のあいだは押す前のまま変えない。フォーカスの
 * あるボタンの名前が変わると、それも読まれて知らせと2度聞くうえ、面が戻るときにも押していないのに名前の
 * 変化が読まれうるからである。「コピー失敗」は次に押すまで残る面なので、名前もそれを含む形にし、見えている
 * 字を言って押し直せるようにする。
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
  const { copy, status } = useCopyToClipboard();
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });
  // 何を写すかも出す面は、並びに収まらないとき「を」の後ろで折れ、それでも収まらない何を写すかの名前は、
  // その中で折れる。
  const renderFace = (faceStatus: CopyStatus): ReactNode =>
    showTarget && faceStatus === "idle" ? (
      <>
        <span className={styles.targetName}>{target}を</span>
        <wbr />
        {COPY_FACES.idle}
      </>
    ) : (
      COPY_FACES[faceStatus]
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
        aria-label={accessibleName(target, status)}
      >
        <span className={styles.face}>{renderFace(status)}</span>
      </Button>
      {COPY_STATUSES.map((faceStatus) => (
        <span
          key={faceStatus}
          className={
            faceStatus === "idle"
              ? `${styles.reserve} ${styles.reserveIdle}`
              : styles.reserve
          }
          aria-hidden="true"
        >
          {renderFace(faceStatus)}
        </span>
      ))}
      <span aria-live="polite" className="visually-hidden">
        <span key={announcement.id}>{announcement.message}</span>
      </span>
    </span>
  );
}
