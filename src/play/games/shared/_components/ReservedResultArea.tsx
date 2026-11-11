"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  saveResultHeight,
  type ResultAreaNames,
} from "@/play/games/shared/_lib/savedLayout";
import styles from "./ReservedResultArea.module.css";

interface ReservedResultAreaProps {
  names: ResultAreaNames;
  /** 解き終えた回の結果を出しているか。出しているあいだ、その高さを覚えておく。 */
  showsResult: boolean;
  /**
   * 今日の日付（"YYYY-MM-DD"）と難易度。覚えた高さは、同じ日・同じ難易度のときだけ使う。難易度の無いゲームでは
   * 難易度を渡さない（""（空の文字列）として覚える。savedLayoutScript で difficultyKey を渡さないときと同じ）。
   */
  date: string;
  difficulty?: string;
  /** 遊んでいるあいだは入力欄、解き終えたらその場所に替わる結果。 */
  children: ReactNode;
}

/**
 * 入力欄か、解き終えたらその場所に替わる結果の区画（DESIGN.md §8「結果は、それを生んだ操作の直後」）。
 *
 * 解き終えた回を開き直したときは、本体の前のスクリプト（savedLayoutScript）が書いた値で、前に同じ画面で描いた
 * 結果の区画の高さ（描いたことが無ければ画面の高さ）を、結果が出るまで取っておき、読み込むあいだは入力欄を
 * 見せない。結果が出たら取っておくのをやめ、結果の高さのままにする。結果を出しているあいだは、その高さを覚えて
 * おく。
 */
export default function ReservedResultArea({
  names,
  showsResult,
  date,
  difficulty = "",
  children,
}: ReservedResultAreaProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!showsResult || !content) return;
    const save = () => {
      // ページを離れるときに外された区画は高さ0を返す。それを覚えると、戻ったときに場所を取っておけない。
      if (!content.isConnected) return;
      saveResultHeight(
        names.storageKey,
        date,
        difficulty,
        content.getBoundingClientRect().height,
      );
    };
    save();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(save);
    observer.observe(content);
    return () => observer.disconnect();
  }, [showsResult, names.storageKey, date, difficulty]);

  // 値の名前はゲームごとに違うので、この部品の CSS が読む決まった名前の値に写す。
  const reserved = {
    "--reserved-height": `var(${names.heightProperty}, 0)`,
    "--reserved-input-visibility": `var(${names.inputVisibilityProperty}, visible)`,
  } as CSSProperties;

  return (
    <div
      className={showsResult ? undefined : styles.waitingArea}
      style={reserved}
    >
      <div
        ref={contentRef}
        className={showsResult ? undefined : styles.waiting}
      >
        {children}
      </div>
    </div>
  );
}
