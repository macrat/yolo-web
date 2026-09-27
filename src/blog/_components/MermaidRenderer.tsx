"use client";

import { useEffect, useSyncExternalStore } from "react";
import { markScrollFrame } from "@/lib/scroll-frame";
import {
  cssColorToHex,
  FIGURE_TEXT_MIN_REM,
  figureStart,
  planFigure,
  planGantt,
  startScrollLeft,
  type GanttLayout,
  type GanttMeasure,
  type TextSpan,
} from "./mermaid-figure";

/** 図の元の文。描いた図は元の文を置き換えるので、描き直すときのために取っておく。 */
const SOURCE_ATTR = "data-source";

/** 横に送る図の読み上げの名前（表・コードと同じ言い方）。 */
const SCROLL_LABEL = "図（横にスクロールできます）";

/** gantt を描き直す回数の上限。余白・目盛り・軸の幅を決め直すたびに、字の置かれ方が変わる。 */
const GANTT_REDRAW_LIMIT = 8;

type Mermaid = typeof import("mermaid").default;
type MermaidConfig = ReturnType<typeof buildConfig>;

interface GanttTask {
  startTime: Date;
  endTime: Date;
}

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
 * mermaid の設定。図を UI のトークンで無彩に描く（地は --paper、箱の地は --paper-2、線は --rule-2、字は --ink）。
 * base のテーマが自前に持つ色（注記・gantt の帯など）にも、同じ組の値を渡す。テーマの変数を持たずに mermaid が
 * 値を直に書くもの（矢じりの黒・gantt の目盛りと題の字の大きさ）は、themeCSS で揃える。gantt の今日の線は、記事の
 * 図の中身と関係が無いので描かない。
 * 字はどれもルートの大きさで描き、図の中の間隔もルートの大きさに比べて決める。間隔は、字どうしと、字と箱が
 * 重ならない所まで詰め、図の元の幅を本文の列に収まりやすくする。
 */
function buildConfig(figureWidth: number) {
  const root = getComputedStyle(document.documentElement);
  const token = (name: string) => {
    const value = root.getPropertyValue(name).trim();
    return cssColorToHex(value) ?? value;
  };
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
      todayLineColor: line,
      vertLineColor: line,
    },
    flowchart: {
      nodeSpacing: rootPx * 1.5,
      rankSpacing: rootPx * 2,
      padding: rootPx * 0.5,
      diagramPadding: 0,
      wrappingWidth: rootPx * 7.5,
    },
    sequence: {
      actorFontSize: rootPx,
      noteFontSize: rootPx,
      messageFontSize: rootPx,
      actorMargin: rootPx,
      width: rootPx * 5,
      boxMargin: rootPx * 0.5,
      diagramMarginX: 0,
    },
    // gantt は渡された幅に時間の軸を詰めて描くので、コンテンツ幅で描き始め、測って組み直す（renderDiagram）。
    // 帯の高さと上下の余白は、字の大きさに比べて決める。
    gantt: {
      useWidth: figureWidth,
      leftPadding: rootPx * 4,
      rightPadding: rootPx * 4,
      fontSize: rootPx,
      sectionFontSize: rootPx,
      barHeight: rootPx * 1.5,
      barGap: rootPx * 0.5,
      topPadding: rootPx * 3.5,
      gridLineStartPadding: rootPx * 2.5,
      titleTopMargin: rootPx * 1.5,
    } as GanttLayout & Record<string, number>,
    themeCSS: [
      `marker [stroke="black"], marker [stroke="#000000"] { stroke: ${line}; }`,
      `marker [fill="black"] { fill: ${line}; }`,
      `.tick text, .titleText { font-size: ${fontSize}; }`,
      `.today { display: none; }`,
    ].join(" "),
  };
}

/** SVG の字や形の、図の元の座標での横の範囲。 */
function horizontalSpan(
  shape: SVGGraphicsElement,
  svg: SVGSVGElement,
): TextSpan {
  const box = shape.getBBox();
  const toSvg = svg.getScreenCTM()?.inverse();
  const fromShape = shape.getScreenCTM();
  if (!toSvg || !fromShape) return { left: box.x, right: box.x + box.width };
  const matrix = toSvg.multiply(fromShape);
  return {
    left: matrix.a * box.x + matrix.e,
    right: matrix.a * (box.x + box.width) + matrix.e,
  };
}

/** 描いた gantt の、目盛りの字・区分の名前・帯の名前の置かれ方を測る。 */
function measureGantt(svg: SVGSVGElement, spanMs: number): GanttMeasure {
  const spans = (selector: string) =>
    Array.from(svg.querySelectorAll<SVGGraphicsElement>(selector))
      .filter((shape) => shape.tagName !== "text" || shape.textContent?.trim())
      .map((shape) => horizontalSpan(shape, svg));
  const sections = spans(".sectionTitle");
  const bars = spans("rect.task");
  const labels = spans(
    ".taskText, .taskTextOutsideLeft, .taskTextOutsideRight, .milestoneText",
  );
  return {
    spanMs,
    ticks: spans(".tick text"),
    sectionRight: Math.max(0, ...sections.map((section) => section.right)),
    // mermaid は帯と帯の名前を同じ順に描くので、数が揃えば順に組にする。
    labels: labels.map((label, index) => ({
      ...label,
      bar: bars.length === labels.length ? bars[index] : undefined,
    })),
  };
}

/** gantt の時間の軸の長さ（いちばん早い始まりから、いちばん遅い終わりまで）。 */
async function ganttSpan(mermaid: Mermaid, source: string): Promise<number> {
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  const db = diagram.db as { getTasks?: () => GanttTask[] };
  const tasks = db.getTasks?.() ?? [];
  const starts = tasks.map((task) => task.startTime.getTime());
  const ends = tasks.map((task) => task.endTime.getTime());
  return Math.max(1, Math.max(...ends) - Math.min(...starts));
}

/**
 * 図を描いて SVG の文字列を返す。gantt は画面の外に置いて測り、区分の名前・目盛りの字・帯の名前が重ならない
 * 組み方で描き直し、題を左端に揃える（DESIGN.md §5 のコンテナの中は左端に揃える）。描いている途中で取り消されたら
 * null を返し、mermaid の設定に触らない。
 */
async function renderDiagram(
  mermaid: Mermaid,
  id: string,
  source: string,
  config: MermaidConfig,
  isCancelled: () => boolean,
): Promise<string | null> {
  mermaid.initialize(config);
  let { svg } = await mermaid.render(id, source);
  if (isCancelled()) return null;
  if (!/aria-roledescription="gantt"/.test(svg)) return svg;

  const spanMs = await ganttSpan(mermaid, source);
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-100000px;top:0;visibility:hidden";
  document.body.append(host);
  try {
    let layout: GanttLayout = config.gantt;
    for (let attempt = 0; attempt <= GANTT_REDRAW_LIMIT; attempt++) {
      host.innerHTML = svg;
      const drawn = host.querySelector("svg");
      if (!drawn) return svg;
      const next =
        attempt < GANTT_REDRAW_LIMIT
          ? planGantt(
              layout,
              measureGantt(drawn, spanMs),
              config.gantt.fontSize / 2,
            )
          : null;
      if (!next) {
        alignGanttTitle(drawn);
        return host.innerHTML;
      }
      layout = next;
      if (isCancelled()) return null;
      mermaid.initialize({ ...config, gantt: { ...config.gantt, ...layout } });
      ({ svg } = await mermaid.render(`${id}-${attempt}`, source));
      if (isCancelled()) return null;
    }
    return svg;
  } finally {
    host.remove();
  }
}

/** gantt の題を、区分の名前の左端に揃える。mermaid は題を図の横の真ん中に置く。 */
function alignGanttTitle(svg: SVGSVGElement) {
  const title = svg.querySelector<SVGTextElement>(".titleText");
  if (!title) return;
  const sections = Array.from(
    svg.querySelectorAll<SVGGraphicsElement>(".sectionTitle"),
  ).map((section) => horizontalSpan(section, svg).left);
  title.setAttribute(
    "x",
    String(sections.length > 0 ? Math.min(...sections) : 0),
  );
  title.style.textAnchor = "start";
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
 * 横に送る図を、図の始まりが見える位置から見せる。上から下へ描く流れ図はいちばん上の箱（根）を、下から上へ描く
 * 流れ図はいちばん下の箱を、見える幅の真ん中に置く。右から左へ描く流れ図は右端から、ほかの図は左端から見せる。
 */
function showFigureStart(figure: HTMLElement, svg: SVGSVGElement) {
  const start = figureStart(figure.getAttribute(SOURCE_ATTR) ?? "");
  const viewport = figure.clientWidth;
  if (start === "left") {
    figure.scrollLeft = 0;
    return;
  }
  if (start === "right") {
    figure.scrollLeft = figure.scrollWidth - viewport;
    return;
  }
  const nodes = Array.from(svg.querySelectorAll(".node")).map((node) =>
    node.getBoundingClientRect(),
  );
  if (nodes.length === 0) return;
  const root = nodes.reduce((best, node) =>
    (start === "top" ? node.top < best.top : node.bottom > best.bottom)
      ? node
      : best,
  );
  const origin =
    figure.getBoundingClientRect().left + figure.clientLeft - figure.scrollLeft;
  figure.scrollLeft = startScrollLeft(
    root.left + root.width / 2 - origin,
    viewport,
    figure.scrollWidth,
  );
}

/**
 * 図の大きさと、横に送るかを決める。コンテンツ幅に収まらない図は字が補助情報の大きさを下回らない所まで縮め、
 * それでも収まらなければその大きさでボックスに入れ、図の始まりから見せる（DESIGN.md §5）。
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
  if (figure.hasAttribute("data-scrolls")) showFigureStart(figure, svg);
}

/**
 * 本文の図（`.mermaid`）を描く。mermaid はブラウザでだけ読み込む。
 * 図を差し込み、大きさと横に送るボックスと最初の送り位置を決めるまでを同じ処理の中で行うので、描いたあとに枠が
 * 付いて図とその下が動くことはない。端末のテーマが替わると、そのテーマのトークンで描き直す。幅が変わると、
 * 大きさと横に送るかを決め直す。
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
    const isCancelled = () => cancelled;
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
      const pass = Date.now().toString(36);
      for (const [index, figure] of figures.entries()) {
        let svg: string | null;
        try {
          svg = await renderDiagram(
            mermaid,
            `mermaid-${pass}-${index}`,
            figure.getAttribute(SOURCE_ATTR) ?? "",
            config,
            isCancelled,
          );
        } catch {
          // 描けない図は、元の文のまま残す。
          if (cancelled) return;
          continue;
        }
        if (cancelled || svg === null) return;
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
