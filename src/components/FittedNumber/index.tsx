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
 * 下げる。いちばん下の段（本文の大きさ）でも収まらなければ、並びのあいだで折り返す。
 *
 * 字の幅が変わりうるときは選び直す——置かれた幅が変わったとき（端末の回転・窓の大きさ）、既定の文字の
 * 大きさが変わったとき（ブラウザや端末の文字サイズの設定を、ページを開いたまま変えたとき）、Web フォントが
 * 読み込まれて字の形が差し替わったとき。
 */
export default function FittedNumber({ segments }: FittedNumberProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const remProbeRef = useRef<HTMLSpanElement>(null);
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
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    fonts?.addEventListener("loadingdone", fit);
    if (typeof ResizeObserver === "undefined") {
      return () => fonts?.removeEventListener("loadingdone", fit);
    }
    // 置かれた幅と、1rem の見本の幅が変わったときに選び直す。段を替えると高さが変わるので、高さの変化では
    // 選び直さない。見本の幅は段で変わらず、既定の文字の大きさだけで変わる。
    const probe = remProbeRef.current;
    let width = container.clientWidth;
    let rem = probe?.offsetWidth ?? 0;
    const observer = new ResizeObserver(() => {
      const nextRem = probe?.offsetWidth ?? 0;
      if (container.clientWidth === width && nextRem === rem) return;
      width = container.clientWidth;
      rem = nextRem;
      fit();
    });
    observer.observe(container);
    if (probe) observer.observe(probe);
    return () => {
      observer.disconnect();
      fonts?.removeEventListener("loadingdone", fit);
    };
  }, [text]);

  return (
    <p ref={ref} className={styles.number} data-step={step}>
      <span ref={remProbeRef} className={styles.remProbe} aria-hidden="true" />
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {segment}
        </Fragment>
      ))}
    </p>
  );
}
