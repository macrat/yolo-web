"use client";

import { useEffect, useSyncExternalStore } from "react";
import { markScrollFrame } from "@/lib/scroll-frame";
import {
  chooseWrap,
  cssColorToHex,
  FIGURE_TEXT_MIN_REM,
  figureStart,
  lineProblems,
  planFigure,
  planGantt,
  startScrollLeft,
  type GanttLayout,
  type GanttMeasure,
  type TextSpan,
  wrapCandidates,
  type WrapTrial,
} from "./mermaid-figure";

/** 図の元の文。描いた図は元の文を置き換えるので、描き直すときのために取っておく。 */
const SOURCE_ATTR = "data-source";

/** 横に送る図の読み上げの名前（表・コードと同じ言い方）。 */
const SCROLL_LABEL = "図（横にスクロールできます）";

/** gantt を描き直す回数の上限。余白・目盛り・軸の幅を決め直すたびに、字の置かれ方が変わる。 */
const GANTT_REDRAW_LIMIT = 8;

/**
 * 流れ図の箱の中の文の折り返しの幅の範囲（ルートの大きさに対する倍率）。いちばん広い幅で、まず折り返さずに描く。
 * いちばん狭い幅は、それより狭くすると短い名前まで折れる幅。
 */
const WRAP_MAX_REM = 40;
const WRAP_MIN_REM = 7.5;

/**
 * 流れ図の段（rank）の間隔の候補（ルートの大きさに対する倍率）。狭い順。段の間隔が狭いと、同じ2つの箱を結ぶ辺の
 * 名前が重なることがあるので、どの折り返しの幅でも読みにくい所が残るときだけ広げて試す。
 */
const RANK_SPACINGS_REM = [2, 3];

/**
 * 重なりとして数えない、接しの幅（px）。線の太さほどの接しは数えない。字どうしは、低いほうの字の高さの
 * TEXT_OVERLAP_RATIO より深く重なったときだけ数える（行の箱は字面より少し高いので、上下に並ぶ字の箱は接する）。
 */
const TOUCH_TOLERANCE = 2;
const TEXT_OVERLAP_RATIO = 0.25;

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
    // 順序図は、設定の最上位の fontSize で参加者・メッセージ・注記の字の大きさを上書きする。
    fontSize: rootPx,
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
      vertLineColor: line,
    },
    // 箱の中の文の折り返しの幅は、図ごとに renderDiagram が決める。部分図の題は、中の箱と重ならない余白を持つ。
    flowchart: {
      nodeSpacing: rootPx * 1.5,
      rankSpacing: rootPx * RANK_SPACINGS_REM[0],
      padding: rootPx * 0.5,
      diagramPadding: 0,
      wrappingWidth: rootPx * WRAP_MAX_REM,
      subGraphTitleMargin: { top: rootPx * 0.5, bottom: rootPx * 0.5 },
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
      // 箱の中の文は、行の頭に長音符・小書きの仮名などを置かない折り方にし（§4）、折れるブラウザでは文節で折る。
      // 文節で折れないブラウザでも、読みにくい折れは renderFlowchart が折り返しの幅を選んで避ける。
      `.nodeLabel, .edgeLabel, .cluster-label { line-break: strict; word-break: auto-phrase; }`,
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

/** 図を置く場所の大きさ。折り返しの幅を決めるのに使う。 */
interface FigureRoom {
  /** コンテンツ幅。 */
  available: number;
  /** 字の下限（px）。 */
  minText: number;
}

/** 画面の外に、測るための置き場を作って fn に渡し、終わったら片付ける。 */
async function withHost<T>(fn: (host: HTMLElement) => Promise<T>): Promise<T> {
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-100000px;top:0;visibility:hidden";
  document.body.append(host);
  try {
    return await fn(host);
  } finally {
    host.remove();
  }
}

/**
 * 描いた図を置き場に、元の大きさで置く。mermaid の図は置かれた幅いっぱいに伸び縮みするので、そのままでは字の
 * 折れ方を、mermaid が測ったのと違う大きさで見てしまう。
 */
function placeNatural(host: HTMLElement, svg: string): SVGSVGElement | null {
  host.innerHTML = svg;
  const drawn = host.querySelector("svg");
  const width = drawn?.viewBox.baseVal?.width;
  if (!drawn || !width) return drawn;
  drawn.style.width = `${width}px`;
  drawn.style.maxWidth = "none";
  return drawn;
}

/** 字の行の箱と、その字が属する箱（流れ図の箱・辺の名前・部分図）。 */
interface LineBox {
  rect: DOMRect;
  owner: Element | null;
}

/** 2つの箱の重なりの幅と高さ。 */
function overlap(a: DOMRect, b: DOMRect): { width: number; height: number } {
  return {
    width: Math.min(a.right, b.right) - Math.max(a.left, b.left),
    height: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
  };
}

function textsOverlap(a: DOMRect, b: DOMRect): boolean {
  const { width, height } = overlap(a, b);
  return (
    width > TOUCH_TOLERANCE &&
    height > TEXT_OVERLAP_RATIO * Math.min(a.height, b.height)
  );
}

function textCoversShape(text: DOMRect, shape: DOMRect): boolean {
  const { width, height } = overlap(text, shape);
  return width > TOUCH_TOLERANCE && height > TOUCH_TOLERANCE;
}

/** 要素の中の字の並び（テキストノード）。 */
function textNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push(node as Text);
  }
  return nodes;
}

/** テキストノードが折り返された行の、字と箱。 */
function textLines(text: Text): { text: string; rect: DOMRect }[] {
  const range = document.createRange();
  const lines: { text: string; rect: DOMRect }[] = [];
  for (let index = 0; index < text.length; index++) {
    range.setStart(text, index);
    range.setEnd(text, index + 1);
    const rect = range.getBoundingClientRect();
    const current = lines[lines.length - 1];
    if (rect.width === 0 && rect.height === 0) {
      // 行の終わりで消える空白は箱を持たないが、そこで折れたことを見分けるため、行の字に残す。
      if (current && /\s/.test(text.data[index]))
        current.text += text.data[index];
      continue;
    }
    if (current && rect.top < current.rect.top + rect.height / 2) {
      current.text += text.data[index];
      current.rect = new DOMRect(
        Math.min(current.rect.left, rect.left),
        current.rect.top,
        Math.max(current.rect.right, rect.right) -
          Math.min(current.rect.left, rect.left),
        Math.max(current.rect.height, rect.height),
      );
    } else {
      lines.push({ text: text.data[index], rect });
    }
  }
  return lines;
}

/**
 * 流れ図の箱の中の文の折れを、元の大きさでの折れ方のまま改行に置き換えて固める。mermaid は箱の幅を字の幅
 * ちょうどに測るので、図を縮めて描くと字の幅の端数で折れ方が変わり、測った図に無い1字の行ができる。固めた改行には
 * data-wrap を付け（空白の所で折れたものは "space"）、書き手が入れた改行と見分けられるようにする。
 */
function freezeLines(svg: SVGSVGElement) {
  for (const label of Array.from(svg.querySelectorAll("foreignObject"))) {
    for (const text of textNodes(label)) {
      const lines = textLines(text);
      if (lines.length < 2) continue;
      const fragment = document.createDocumentFragment();
      lines.forEach((line, index) => {
        if (index > 0) {
          const lineBreak = document.createElement("br");
          lineBreak.dataset.wrap = /\s$/.test(lines[index - 1].text)
            ? "space"
            : "";
          fragment.append(lineBreak);
        }
        fragment.append(line.text.trimEnd());
      });
      text.replaceWith(fragment);
    }
    label.querySelector("div")?.style.setProperty("white-space", "nowrap");
  }
}

/**
 * 描いた流れ図の、読みにくい所を数える。箱の中の文の折れ（1字だけの行・禁則の破れ・英数字の語の中の折れ）と、
 * 別の箱に属する字どうしの重なり、字と別の箱の重なり（部分図の題が中の箱に隠れるなど）。
 */
function countFlaws(svg: SVGSVGElement): number {
  let flaws = 0;
  const lineBoxes: LineBox[] = [];
  for (const label of Array.from(svg.querySelectorAll("foreignObject"))) {
    const owner = label.closest(".node, .edgeLabel, .cluster");
    for (const text of textNodes(label)) {
      const lines = textLines(text);
      const problems = lineProblems(lines.map((line) => line.text));
      flaws += problems.single + problems.forbidden + problems.splitWords;
      for (const line of lines) {
        if (line.text.trim()) lineBoxes.push({ rect: line.rect, owner });
      }
    }
  }
  const shapes = Array.from(
    svg.querySelectorAll(
      ".node rect, .node polygon, .node circle, .node ellipse, .node path",
    ),
  ).map((shape) => ({
    rect: shape.getBoundingClientRect(),
    owner: shape.closest(".node"),
  }));
  for (let i = 0; i < lineBoxes.length; i++) {
    for (let j = i + 1; j < lineBoxes.length; j++) {
      if (
        lineBoxes[i].owner !== lineBoxes[j].owner &&
        textsOverlap(lineBoxes[i].rect, lineBoxes[j].rect)
      ) {
        flaws++;
      }
    }
    for (const shape of shapes) {
      if (
        shape.owner !== lineBoxes[i].owner &&
        textCoversShape(lineBoxes[i].rect, shape.rect)
      ) {
        flaws++;
      }
    }
  }
  return flaws;
}

/** 折り返さずに描いた流れ図の、箱の文のかたまり（書き手の改行で区切ったもの）の幅。 */
function segmentWidths(svg: SVGSVGElement): number[] {
  const range = document.createRange();
  return Array.from(svg.querySelectorAll("foreignObject")).flatMap((label) =>
    textNodes(label).map((text) => {
      range.selectNodeContents(text);
      return range.getBoundingClientRect().width;
    }),
  );
}

/**
 * 流れ図の箱の中の文の折り返しの幅を、図ごとに決めて描く（列に収まる図は語を割らず、収まらない図だけ詰める）。
 * 1. 折り返さずに描き、収まって読みにくい所（1字だけの行・禁則の破れ・語の中の折れ・字の重なり）が無ければ、それ。
 * 2. 箱の文の長さから折り返しの幅の候補を作り（wrapCandidates）、いちばん狭い幅で描く。それでも収まらなければ、
 *    狭い順に試して、読みにくい所の無い最初の幅にする（横に送る量をいちばん減らす）。収まるなら、広い順に試して、
 *    収まって読みにくい所の無い最初の幅にする。
 * 3. どの幅にも読みにくい所が残るときは、段の間隔を広げて試し直し、試した中から chooseWrap で決める。
 * 決めた図の折れは、改行に置き換えて固める。
 */
async function renderFlowchart(
  mermaid: Mermaid,
  id: string,
  source: string,
  config: MermaidConfig,
  room: FigureRoom,
  firstSvg: string,
  isCancelled: () => boolean,
): Promise<string | null> {
  const rootPx = config.fontSize;
  return withHost(async (host) => {
    type Trial = WrapTrial & { svg: string };
    const trials: Trial[] = [];
    const draw = async (
      wrap: number,
      rankRem: number,
    ): Promise<Trial | null> => {
      let svg = firstSvg;
      if (trials.length > 0) {
        if (isCancelled()) return null;
        mermaid.initialize({
          ...config,
          flowchart: {
            ...config.flowchart,
            wrappingWidth: wrap,
            rankSpacing: rootPx * rankRem,
          },
        });
        ({ svg } = await mermaid.render(`${id}-${trials.length}`, source));
        if (isCancelled()) return null;
      }
      const drawn = placeNatural(host, svg);
      const width = drawn?.viewBox.baseVal?.width ?? 0;
      const trial: Trial = {
        wrap,
        svg,
        width,
        fits:
          drawn !== null &&
          width > 0 &&
          planFigure(width, room.available, smallestText(drawn), room.minText)
            .fits,
        flaws: drawn && width > 0 ? countFlaws(drawn) : 0,
      };
      trials.push(trial);
      return trial;
    };
    const frozen = (svg: string) => {
      const drawn = placeNatural(host, svg);
      if (!drawn) return svg;
      freezeLines(drawn);
      drawn.style.removeProperty("width");
      drawn.style.removeProperty("max-width");
      return host.innerHTML;
    };

    const widest = await draw(rootPx * WRAP_MAX_REM, RANK_SPACINGS_REM[0]);
    if (!widest) return null;
    if (widest.fits && widest.flaws === 0) return frozen(widest.svg);
    const drawnWidest = placeNatural(host, widest.svg);
    const candidates = wrapCandidates(
      drawnWidest ? segmentWidths(drawnWidest) : [],
      rootPx * WRAP_MIN_REM,
      rootPx * WRAP_MAX_REM,
    );
    for (const rankRem of RANK_SPACINGS_REM) {
      const narrowest = await draw(candidates[candidates.length - 1], rankRem);
      if (!narrowest) return null;
      const order = narrowest.fits
        ? candidates.slice(0, -1)
        : candidates.slice(0, -1).reverse();
      const accept = (trial: Trial) =>
        trial.flaws === 0 && (trial.fits || !narrowest.fits);
      if (accept(narrowest) && !narrowest.fits) return frozen(narrowest.svg);
      for (const wrap of order) {
        const trial = await draw(wrap, rankRem);
        if (!trial) return null;
        if (accept(trial)) return frozen(trial.svg);
      }
      if (accept(narrowest)) return frozen(narrowest.svg);
    }
    return frozen(chooseWrap(trials).svg);
  });
}

/**
 * 描いた gantt を画面の外で測り、区分の名前・目盛りの字・帯の名前が重ならない組み方で描き直し、題を左端に揃える
 * （DESIGN.md §5 のコンテナの中は左端に揃える）。
 */
async function renderGantt(
  mermaid: Mermaid,
  id: string,
  source: string,
  config: MermaidConfig,
  firstSvg: string,
  isCancelled: () => boolean,
): Promise<string | null> {
  const spanMs = await ganttSpan(mermaid, source);
  return withHost(async (host) => {
    let svg = firstSvg;
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
  });
}

/**
 * 図を描いて SVG の文字列を返す。流れ図は箱の中の文の折り返しの幅を、gantt は横の組み方を、描いて測って決める。
 * 描くたびに設定を渡し、描いている途中で取り消されたら null を返して、それより後の設定に触らない。
 */
async function renderDiagram(
  mermaid: Mermaid,
  id: string,
  source: string,
  config: MermaidConfig,
  room: FigureRoom,
  isCancelled: () => boolean,
): Promise<string | null> {
  mermaid.initialize(config);
  const { svg } = await mermaid.render(id, source);
  if (isCancelled()) return null;
  if (/aria-roledescription="gantt"/.test(svg)) {
    return renderGantt(mermaid, id, source, config, svg, isCancelled);
  }
  if (/aria-roledescription="flowchart/.test(svg)) {
    return renderFlowchart(mermaid, id, source, config, room, svg, isCancelled);
  }
  return svg;
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
 * それでも収まらなければその大きさでボックスに入れる（DESIGN.md §5）。横に送る図は、表やコードと違って左端から
 * 読むとは限らず、描き始めの所から読むので、その所から見せる。
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
      const available = figures[0].getBoundingClientRect().width;
      const config = buildConfig(available);
      const room: FigureRoom = {
        available,
        minText: config.fontSize * FIGURE_TEXT_MIN_REM,
      };
      const pass = Date.now().toString(36);
      for (const [index, figure] of figures.entries()) {
        let svg: string | null;
        try {
          svg = await renderDiagram(
            mermaid,
            `mermaid-${pass}-${index}`,
            figure.getAttribute(SOURCE_ATTR) ?? "",
            config,
            room,
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
