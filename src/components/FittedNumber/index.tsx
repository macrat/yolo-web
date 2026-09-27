"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import styles from "./FittedNumber.module.css";

/** 字の段。§4 の主見出しの段から、置かれた幅に収まる段まで下げる（DESIGN.md §8 数字・短い語）。 */
const STEPS = ["main", "section", "sub", "body"] as const;

type Step = (typeof STEPS)[number];

interface FittedNumberProps {
  /**
   * 数の文を、折ってよい所で分けた並び。並びのあいだにだけ折り所（<wbr>）を置き、並びの1つの中では折らない。
   * 数を折るのは桁区切りの位置だけで、単位は数から離さないので、単位は数の最後の並びに付ける
   * （「1,」「234文字」、「10問中」「8問正解」）。
   */
  segments: readonly string[];
}

/**
 * 結果の数・短い語（DESIGN.md §8）。§4 の主見出しの段で1行に組み、置かれた幅に収まらなければ、収まる段まで
 * 下げる。いちばん下の段（本文の大きさ）でも収まらなければ、並びのあいだで折り返す。幅と文字の大きさが
 * 変わったら（端末の回転・ブラウザの拡大）選び直す。
 */
export default function FittedNumber({ segments }: FittedNumberProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [step, setStep] = useState<Step>("main");
  const text = segments.join("");

  useLayoutEffect(() => {
    const element = ref.current;
    const container = element?.parentElement;
    if (!element || !container) return;
    const fit = () => {
      // 段を上から当てて、1行が幅に収まる最初の段を選ぶ。測るあいだだけ属性を直に替える。
      const fitting =
        STEPS.find((candidate) => {
          element.dataset.step = candidate;
          return element.scrollWidth <= element.clientWidth;
        }) ?? "body";
      element.dataset.step = fitting;
      setStep(fitting);
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    // 置かれた幅が変わったときだけ選び直す。段を替えると高さが変わるので、高さの変化では選び直さない。
    let width = container.clientWidth;
    const observer = new ResizeObserver(() => {
      if (container.clientWidth === width) return;
      width = container.clientWidth;
      fit();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  return (
    <p ref={ref} className={styles.number} data-step={step}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {segment}
        </Fragment>
      ))}
    </p>
  );
}
