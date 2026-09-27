"use client";

import { useEffect, useSyncExternalStore } from "react";
import { markScrollFrame } from "@/lib/scroll-frame";
import {
  FIGURE_TEXT_MIN_REM,
  planFigure,
  toHexColor,
  widenGantt,
  type GanttLayout,
} from "./mermaid-figure";

/** 図の元の文。描いた図は元の文を置き換えるので、描き直すときのために取っておく。 */
const SOURCE_ATTR = "data-source";

/** 横に送る図の読み上げの名前（表・コードと同じ言い方）。 */
const SCROLL_LABEL = "図（横にスクロールできます）";

/** mermaid の gantt の左右の余白の既定。 */
const GANTT_PADDING = 75;

/** gantt を広げ直す回数の上限。広げると目盛りの数が変わることがあるので、1回で足りないときに備える。 */
const GANTT_WIDEN_LIMIT = 3;

type Mermaid = typeof import("mermaid").default;
type MermaidConfig = ReturnType<typeof buildConfig>;

/** 端末のテーマ（DESIGN.md §10）。 */
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function subscribeColorScheme(callback: () => void): () => void {
  const mq = window.matchMedia(DARK_SCHEME_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getIsDarkSnapshot(): boolean {
  return window.matchMedia(DARK_SCHEME_QUERY).matches;
}

// 図はクライアントでだけ描く。この値は水和のためだけにある。
function getIsDarkServerSnapshot(): boolean {
  return false;
}

/**
 * トークンの色を、sRGB の hex で読む。mermaid が色の計算に使う khroma は hex・rgb・hsl・色の名前しか読まず、
 * トークンの値（oklch と、ビルドが足す lab）を読まない。ブラウザに sRGB の画素として塗らせて読み取るので、
 * 画面に塗られる色と同じになる。
 */
function createTokenReader(root: CSSStyleDeclaration) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  return (name: string): string => {
    const value = root.getPropertyValue(name).trim();
    if (!context) return value;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return toHexColor(red, green, blue);
  };
}

/**
 * mermaid の設定。図を UI のトークンで無彩に描く（地は --paper、箱の地は --paper-2、線は --rule-2、字は --ink）。
 * base のテーマが自前に持つ色（注記・gantt の帯・今日の線など）にも、同じ組の値を渡す。テーマの変数を持たずに
 * mermaid が値を直に書くもの（矢じりの黒・gantt の目盛りの字の大きさ）は、themeCSS で揃える。
 * 字はどれもルートの大きさで描く。
 */
function buildConfig(figureWidth: number) {
  const root = getComputedStyle(document.documentElement);
  const token = createTokenReader(root);
  const paper = token("--paper");
  const paper2 = token("--paper-2");
  const line = token("--rule-2");
  const ink = token("--ink");
  const rootPx = parseFloat(root.fontSize);
  const fontSize = `${rootPx}px`;
  return {
    startOnLoad: false,
    theme: "base" as const,
    fontFamily: getComputedStyle(document.body).fontFamily,
    themeVariables: {
      fontSize,
      background: paper,
      primaryColor: paper2,
      secondaryColor: paper2,
      tertiaryColor: paper2,
      primaryBorderColor: line,
      secondaryBorderColor: line,
      tertiaryBorderColor: line,
      primaryTextColor: ink,
      secondaryTextColor: ink,
      tertiaryTextColor: ink,
      textColor: ink,
      titleColor: ink,
      lineColor: line,
      arrowheadColor: line,
      mainBkg: paper2,
      nodeBkg: paper2,
      nodeBorder: line,
      nodeTextColor: ink,
      clusterBkg: paper,
      clusterBorder: line,
      edgeLabelBackground: paper,
      defaultLinkColor: line,
      errorBkgColor: paper2,
      errorTextColor: ink,
      actorBkg: paper2,
      actorBorder: line,
      actorTextColor: ink,
      actorLineColor: line,
      signalColor: line,
      signalTextColor: ink,
      labelBoxBkgColor: paper2,
      labelBoxBorderColor: line,
      labelTextColor: ink,
      loopTextColor: ink,
      noteBkgColor: paper2,
      noteBorderColor: line,
      noteTextColor: ink,
      activationBkgColor: paper2,
      activationBorderColor: line,
      sequenceNumberColor: paper,
      sectionBkgColor: paper2,
      altSectionBkgColor: paper,
      sectionBkgColor2: paper2,
      excludeBkgColor: paper2,
      taskBkgColor: paper2,
      taskBorderColor: line,
      taskTextColor: ink,
      taskTextLightColor: ink,
      taskTextDarkColor: ink,
      taskTextOutsideColor: ink,
      taskTextClickableColor: ink,
      activeTaskBkgColor: paper2,
      activeTaskBorderColor: ink,
      doneTaskBkgColor: paper,
      doneTaskBorderColor: line,
      critBkgColor: paper2,
      critBorderColor: ink,
      gridColor: line,
      todayLineColor: ink,
      vertLineColor: line,
    },
    sequence: {
      actorFontSize: rootPx,
      noteFontSize: rootPx,
      messageFontSize: rootPx,
    },
    // gantt は渡された幅に合わせて描くので、本文の幅（--measure）を下限に、コンテンツ幅で描き始める。
    gantt: {
      useWidth: Math.max(figureWidth, rootPx * 40),
      leftPadding: GANTT_PADDING,
      rightPadding: GANTT_PADDING,
      fontSize: rootPx,
      sectionFontSize: rootPx,
    },
    themeCSS: [
      `marker [stroke="black"], marker [stroke="#000000"] { stroke: ${line}; }`,
      `marker [fill="black"] { fill: ${line}; }`,
      `.tick text { font-size: ${fontSize}; }`,
    ].join(" "),
  };
}

/** 要素の、図の元の座標での横の位置（transform の平行移動を足し上げる）。 */
function offsetX(element: SVGGraphicsElement, svg: SVGSVGElement): number {
  let x = 0;
  for (
    let node: Element | null = element;
    node && node !== svg;
    node = node.parentElement
  ) {
    if (node instanceof SVGGraphicsElement) {
      x += node.transform.baseVal.consolidate()?.matrix.e ?? 0;
    }
  }
  return x;
}

/**
 * 描いた gantt を画面の外で測り、目盛りの字が重ならず区分の名前が帯に掛からない組み方を返す。足りていれば null。
 */
function measureGantt(
  svg: SVGSVGElement,
  layout: GanttLayout,
  gap: number,
): GanttLayout | null {
  const ticks = Array.from(
    svg.querySelectorAll<SVGTextElement>(".tick text"),
  ).map((text) => {
    const box = text.getBBox();
    return {
      center: offsetX(text, svg) + box.x + box.width / 2,
      width: box.width,
    };
  });
  let sectionRight = 0;
  svg.querySelectorAll<SVGTextElement>(".sectionTitle").forEach((text) => {
    const box = text.getBBox();
    sectionRight = Math.max(
      sectionRight,
      offsetX(text, svg) + box.x + box.width,
    );
  });
  return widenGantt(layout, ticks, sectionRight, gap);
}

/**
 * 図を描いて SVG の文字列を返す。gantt は画面の外に置いて測り、目盛りの字と区分の名前が収まる幅で描き直す。
 */
async function renderDiagram(
  mermaid: Mermaid,
  id: string,
  source: string,
  config: MermaidConfig,
): Promise<string> {
  let { svg } = await mermaid.render(id, source);
  if (!/aria-roledescription="gantt"/.test(svg)) return svg;
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-100000px;top:0;visibility:hidden";
  document.body.append(host);
  let layout: GanttLayout = config.gantt;
  try {
    for (let attempt = 0; attempt < GANTT_WIDEN_LIMIT; attempt++) {
      host.innerHTML = svg;
      const drawn = host.querySelector("svg");
      if (!drawn) break;
      const wider = measureGantt(drawn, layout, config.gantt.fontSize / 2);
      if (!wider) break;
      layout = wider;
      mermaid.initialize({ ...config, gantt: { ...config.gantt, ...layout } });
      ({ svg } = await mermaid.render(`${id}-${attempt}`, source));
    }
  } finally {
    host.remove();
    mermaid.initialize(config);
  }
  return svg;
}

/** 図の中のいちばん小さい字の、図の元の座標での大きさ。 */
function smallestText(svg: SVGSVGElement): number {
  let smallest = Infinity;
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || !node.textContent?.trim() || parent.closest("style")) {
      continue;
    }
    smallest = Math.min(
      smallest,
      parseFloat(getComputedStyle(parent).fontSize),
    );
  }
  return smallest;
}

/**
 * 図の大きさと、横に送るかを決める。コンテンツ幅に収まらない図は字が補助情報の大きさを下回らない所まで縮め、
 * それでも収まらなければその大きさでボックスに入れる（DESIGN.md §5）。
 */
function fitFigure(figure: HTMLElement) {
  const svg = figure.querySelector("svg");
  const naturalWidth = svg?.viewBox.baseVal?.width;
  if (!svg || !naturalWidth) return;
  const rootPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  const plan = planFigure(
    naturalWidth,
    figure.getBoundingClientRect().width,
    smallestText(svg),
    rootPx * FIGURE_TEXT_MIN_REM,
  );
  const width = naturalWidth * plan.scale;
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.style.width = plan.fits ? "100%" : `${width}px`;
  svg.style.maxWidth = plan.fits ? `${width}px` : "none";
  markScrollFrame(figure, SCROLL_LABEL);
}

/**
 * 本文の図（`.mermaid`）を描く。mermaid はブラウザでだけ読み込む。
 * 図を差し込み、大きさと横に送るボックスを決めるまでを同じ処理の中で行うので、描いたあとに枠が付いて図とその
 * 下が動くことはない。端末のテーマが替わると、そのテーマのトークンで描き直す。幅が変わると、大きさと横に
 * 送るかを決め直す。
 */
export default function MermaidRenderer() {
  const isDark = useSyncExternalStore(
    subscribeColorScheme,
    getIsDarkSnapshot,
    getIsDarkServerSnapshot,
  );

  useEffect(() => {
    const figures = Array.from(
      document.querySelectorAll<HTMLElement>(".mermaid"),
    );
    if (figures.length === 0) return;

    figures.forEach((figure) => {
      if (!figure.hasAttribute(SOURCE_ATTR)) {
        figure.setAttribute(SOURCE_ATTR, figure.textContent ?? "");
      }
    });

    let cancelled = false;
    const widths = new Map<HTMLElement, number>();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver((entries) => {
            for (const entry of entries) {
              const figure = entry.target as HTMLElement;
              const width = figure.getBoundingClientRect().width;
              if (widths.get(figure) === width) continue;
              widths.set(figure, width);
              fitFigure(figure);
            }
          });

    async function renderFigures() {
      const mermaid = (await import("mermaid")).default;
      await document.fonts?.ready;
      if (cancelled) return;
      const config = buildConfig(figures[0].getBoundingClientRect().width);
      mermaid.initialize(config);
      const pass = Date.now().toString(36);
      for (const [index, figure] of figures.entries()) {
        let svg: string;
        try {
          svg = await renderDiagram(
            mermaid,
            `mermaid-${pass}-${index}`,
            figure.getAttribute(SOURCE_ATTR) ?? "",
            config,
          );
        } catch {
          // 描けない図は、元の文のまま残す。
          continue;
        }
        if (cancelled) return;
        figure.innerHTML = svg;
        fitFigure(figure);
        widths.set(figure, figure.getBoundingClientRect().width);
        observer?.observe(figure);
      }
    }

    renderFigures();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [isDark]);

  return null;
}
