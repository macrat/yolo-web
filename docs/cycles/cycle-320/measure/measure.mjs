// 診断の回答の画面の二度押しを測る（t5a-design.md 6章 条件7・cycle-318/device-triage.md D5。手順は t5a-measure.md 0章・5章）。
//
//   node docs/cycles/cycle-320/measure/measure.mjs --base http://localhost:3112 --version <版のディレクトリ> \
//     --op start|answers|last|retry --out <記録.jsonl> [絞り込み]
//
// 絞り込み（どれも省けば、その操作の設計の範囲のすべて）:
//   --slugs a,b  --viewports 375x550,375x550@200  --inputs touch,mouse  --intervals 90,300
//   --rows first,last（answers）  --offsets 0:0,0:-20（D5 のずれ。2打目だけをずらす）  --positions 24,48（retry）
//   --answers <answers.mjs の出力>（last。渡せば extra を持つ3本は全結果を回り、渡さなければ1回ずつ）
//   --limit <回の数>
//
// 1回（新しいブラウザの文脈で行う1つの走査か1つの二度押し）を測り終えるたびに、その回の記録を1行にして
// --out の末尾に足してから次へ進む。--out にすでに記録のある回は飛ばすので、止まったら同じコマンドで続きから
// 測れる。--out の1行目は版の行（版の指紋と、ブラウザの版と、この道具のファイルの git の blob）で、続きを
// 測るときは、いま測る版の指紋・ブラウザ・道具のどれかがこの行と合わなければ止まる。

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const CHROMIUM = "/opt/pw-browsers/chromium";

const ALL_SLUGS = [
  "character-personality",
  "word-sense-personality",
  "character-fortune",
  "animal-personality",
  "science-thinking",
  "japanese-culture",
  "music-personality",
  "impossible-advice",
  "contrarian-fortune",
  "unexpected-compatibility",
  "traditional-color",
  "yoji-personality",
  "kotowaza-level",
  "yoji-level",
  "kanji-level",
];
const KNOWLEDGE = new Set(["kotowaza-level", "yoji-level", "kanji-level"]);
const EXTRA_SLUGS = new Set([
  "character-fortune",
  "science-thinking",
  "japanese-culture",
]);

const CONDITION7_VIEWPORTS = [
  "375x550",
  "320x550",
  "1280x800",
  "375x800",
  "740x360",
  "375x550@200",
];
const D5_VIEWPORTS = ["375x550", "320x550"];

const OP_DEFAULTS = {
  start: { intervals: [0, 90, 150, 300, 500] },
  answers: { intervals: [90, 300] },
  last: { intervals: [0, 90, 150, 300, 500] },
  retry: { intervals: [90, 300] },
};

/** 見せる 150ms の内と外を試す間隔。実際の間隔が 150ms の側を越えた回を送り直す（plan-t5a7.md 4 の「間隔」）。 */
const SHOWN_MS = 150;
const BOUNDARY_INTERVALS = new Set([90, 300]);
/** 1回で終わる操作の送り直しの上限。 */
const MAX_RESENDS = 3;
/** 記録するまでの待ち（t5a-measure.md 0章）。 */
const WAIT_AFTER_SECOND_MS = 700;
const WAIT_FROM_FIRST_MS = 450;
/** extra の差し込みを待つ長さ（t5a-measure.md 7章は 2.5 秒で来ない回を 6 秒で測り直した）。 */
const EXTRA_WAIT_MS = 6000;
/** 「もう一度挑戦する」の中心を置く刻み（画面の上端 24px から下端 −24px まで）。 */
const RETRY_STEP = 24;
const GAP = 8;

// ---------------------------------------------------------------------------
// 引数

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    options[argv[index].replace(/^--/, "")] = argv[index + 1];
  }
  for (const required of ["base", "version", "op", "out"]) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }
  if (!OP_DEFAULTS[options.op]) throw new Error(`unknown op ${options.op}`);
  const list = (value) => (value ? value.split(",") : undefined);
  const offsets = (list(options.offsets) ?? ["0:0"]).map((pair) => {
    const [dx, dy] = pair.split(":").map(Number);
    return { dx, dy };
  });
  const isD5 = offsets.some((offset) => offset.dx !== 0 || offset.dy !== 0);
  return {
    base: options.base.replace(/\/$/, ""),
    version: options.version,
    op: options.op,
    out: options.out,
    slugs: list(options.slugs) ?? ALL_SLUGS,
    viewports:
      list(options.viewports) ?? (isD5 ? D5_VIEWPORTS : CONDITION7_VIEWPORTS),
    inputs: list(options.inputs) ?? (isD5 ? ["touch"] : ["touch", "mouse"]),
    intervals:
      list(options.intervals)?.map(Number) ??
      (isD5 ? [90, 300] : OP_DEFAULTS[options.op].intervals),
    rows: list(options.rows) ?? ["first", "last"],
    offsets,
    positions: list(options.positions)?.map(Number),
    answers: options.answers,
    limit: options.limit ? Number(options.limit) : Infinity,
  };
}

function parseViewport(text) {
  const [size, scale] = text.split("@");
  const [width, height] = size.split("x").map(Number);
  return { name: text, width, height, big: scale === "200" };
}

function retryPositions(height) {
  const positions = [];
  for (let y = RETRY_STEP; y <= height - RETRY_STEP; y += RETRY_STEP) {
    positions.push(y);
  }
  return positions;
}

// ---------------------------------------------------------------------------
// 回の並び

function enumerateRuns(options, answerPlans) {
  const runs = [];
  for (const viewportName of options.viewports) {
    const viewport = parseViewport(viewportName);
    for (const slug of options.slugs) {
      for (const input of options.inputs) {
        for (const interval of options.intervals) {
          for (const offset of options.offsets) {
            const common = { slug, viewport, input, interval, offset };
            if (options.op === "answers") {
              for (const row of options.rows) runs.push({ ...common, row });
            } else if (options.op === "retry") {
              for (const position of options.positions ??
                retryPositions(viewport.height)) {
                runs.push({ ...common, position });
              }
            } else if (
              options.op === "last" &&
              EXTRA_SLUGS.has(slug) &&
              answerPlans.size > 0
            ) {
              // 条件7 は、extra を持つ3本を全結果について測る。D5 は --answers を渡さず、全15本を1回ずつ測る。
              const plans = answerPlans.get(slug);
              if (!plans) throw new Error(`--answers lacks ${slug}`);
              for (const [resultId, choices] of Object.entries(plans)) {
                runs.push({ ...common, plan: { resultId, choices } });
              }
            } else runs.push(common);
          }
        }
      }
    }
  }
  return runs;
}

function runKey(op, run) {
  return [
    op,
    run.viewport.name,
    run.slug,
    run.input,
    run.interval,
    `${run.offset.dx}:${run.offset.dy}`,
    run.row ?? "",
    run.position ?? "",
    run.plan?.resultId ?? "",
  ].join("|");
}

// ---------------------------------------------------------------------------
// 記録の置き場

function toolBlob() {
  return execFileSync(
    "git",
    ["hash-object", new URL(import.meta.url).pathname],
    { encoding: "utf8" },
  ).trim();
}

function readRecords(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function ensureVersionLine(file, fingerprint, browserVersion) {
  const records = readRecords(file);
  const versionLine = {
    type: "version",
    commit: fingerprint.commit,
    overlays: fingerprint.overlays,
    tree: fingerprint.tree,
    node: fingerprint.node,
    npm: fingerprint.npm,
    buildPath: fingerprint.buildPath,
    chunks: fingerprint.chunks,
    browser: browserVersion,
    tool: toolBlob(),
  };
  if (records.length === 0) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(versionLine)}\n`);
    return records;
  }
  const head = records[0];
  const same =
    head.type === "version" &&
    head.tree === versionLine.tree &&
    head.node === versionLine.node &&
    head.npm === versionLine.npm &&
    head.browser === versionLine.browser &&
    head.tool === versionLine.tool &&
    JSON.stringify(head.chunks) === JSON.stringify(versionLine.chunks);
  if (!same) {
    throw new Error(
      `${file} was recorded with another version, browser or tool (tree ${head.tree}, browser ${head.browser}, tool ${head.tool}); compare before continuing`,
    );
  }
  return records;
}

// ---------------------------------------------------------------------------
// ページの側に置くもの（ブラウザの文脈の初期化スクリプト。ページのどのスクリプトより前に走り、遷移した先にも置かれる）

function pageProbe() {
  if (window.top !== window) return;
  const send = (record) => {
    try {
      window.__yolosMeasure(record);
    } catch {
      // 記録の口が無いページ（開いたタブ）では送らない。
    }
  };
  // 見える字（innerText。構造化データの script の字を含めない）の頭の 24 字。
  const text = (element) =>
    (element?.innerText ?? element?.textContent ?? "")
      .replace(/\s+/g, "")
      .slice(0, 24);
  const questionHeading = () => document.querySelector('h2[tabindex="-1"]');
  const resultBox = () => document.querySelector('section[tabindex="-1"]');
  const band = () => {
    const bar = document.querySelector('[role="progressbar"]');
    return bar ? Number(bar.getAttribute("aria-valuenow")) : null;
  };
  const choiceList = () => {
    const heading = questionHeading();
    const list = heading?.nextElementSibling;
    return list?.matches('ul[data-text-box="rows"]') ? list : null;
  };
  const startButton = () =>
    [...document.querySelectorAll("button")].find(
      (button) => text(button) === "はじめる",
    ) ?? null;
  const describe = (node) => {
    const element = node instanceof Element ? node : node?.parentElement;
    if (!element) return { g: "none" };
    const link = element.closest("a[href]");
    if (link) {
      const url = new URL(link.href, location.href);
      return {
        g: "link",
        path: url.origin === location.origin ? url.pathname : url.href,
        hash: url.hash || undefined,
        blank: link.target === "_blank" || undefined,
        name: text(link),
      };
    }
    const summary = element.closest("summary");
    if (summary) return { g: "summary", name: text(summary) };
    const button = element.closest("button");
    if (button) {
      const list = choiceList();
      if (list && list.contains(button)) {
        return { g: "choice", name: text(button) };
      }
      return { g: "button", name: text(button) };
    }
    const pressable = element.closest(
      'input, select, textarea, label, [role="button"], [role="link"]',
    );
    if (pressable) return { g: "pressable", name: text(pressable) };
    const row = element.closest('ul[data-text-box="rows"] > li');
    const list = choiceList();
    return {
      g: "text",
      tag: element.tagName.toLowerCase(),
      row: row && list && list.contains(row) ? text(row) : undefined,
      name: text(element.closest("p, h1, h2, h3, li, span, div")),
    };
  };
  const phase = () =>
    resultBox()
      ? "result"
      : questionHeading()
        ? "playing"
        : startButton()
          ? "intro"
          : "other";
  for (const type of ["touchstart", "mousedown", "click"]) {
    window.addEventListener(
      type,
      (event) => {
        send({
          ev: type,
          t: performance.timeOrigin + event.timeStamp,
          detail: event.detail ?? null,
          trusted: event.isTrusted,
          x: Math.round(event.clientX ?? event.touches?.[0]?.clientX ?? -1),
          y: Math.round(event.clientY ?? event.touches?.[0]?.clientY ?? -1),
          el: describe(event.target),
          band: band(),
          phase: phase(),
          scrollY: window.scrollY,
          path: location.pathname,
        });
      },
      true,
    );
  }

  // 行の箱を、画面の上端が横切っているか（行の上端 < 0 < 行の下端）。
  const cutLines = (element) => {
    if (!element) return null;
    const range = document.createRange();
    range.selectNodeContents(element);
    const lines = [];
    for (const rect of range.getClientRects()) {
      if (rect.width === 0 || rect.height === 0) continue;
      const line = lines.find(
        (known) => Math.abs(known.top - rect.top) < rect.height / 2,
      );
      if (line) {
        line.top = Math.min(line.top, rect.top);
        line.bottom = Math.max(line.bottom, rect.bottom);
      } else lines.push({ top: rect.top, bottom: rect.bottom });
    }
    lines.sort((a, b) => a.top - b.top);
    const cut = lines.findIndex((line) => line.top < 0 && line.bottom > 0);
    return {
      top: Math.round(lines[0]?.top ?? 0),
      bottom: Math.round(lines.at(-1)?.bottom ?? 0),
      lines: lines.length,
      cut: cut === -1 ? undefined : cut + 1,
    };
  };
  const resultName = (box) => {
    const id = box.getAttribute("aria-labelledby");
    return (id && document.getElementById(id)) || box;
  };
  const answeredNow = () => {
    const list = choiceList();
    return list ? !list.querySelector("button") : false;
  };
  const signature = () =>
    [
      location.pathname,
      phase(),
      band(),
      answeredNow(),
      [...document.querySelectorAll("button")].some(
        (button) => text(button) === "次へ",
      ),
    ].join("|");
  // 差し込みの位置は、結果のボックスの上端を画面の上端から 8px に置いたときの位置に直す（t5a-measure.md 7章）。
  const boxGap = 8;
  let lastSignature = "";
  let resultSeen = false;
  let inserts = 0;
  const snapshot = () => {
    const box = resultBox();
    const start = startButton();
    const focus = document.activeElement;
    send({
      ev: "frame",
      t: performance.timeOrigin + performance.now(),
      sig: signature(),
      scrollY: window.scrollY,
      h1: cutLines(document.querySelector("h1")),
      heading: cutLines(questionHeading()),
      name: box ? cutLines(resultName(box)) : undefined,
      boxTop: box ? Math.round(box.getBoundingClientRect().top) : undefined,
      start: start
        ? {
            top: Math.round(start.getBoundingClientRect().top),
            bottom: Math.round(start.getBoundingClientRect().bottom),
          }
        : undefined,
      focus: focus
        ? focus === start
          ? "start"
          : focus.tagName.toLowerCase()
        : null,
      selection: String(getSelection() ?? ""),
      innerHeight: window.innerHeight,
    });
  };
  const observer = new MutationObserver((mutations) => {
    const now = signature();
    if (now !== lastSignature) {
      lastSignature = now;
      // 着地は塗る前（useLayoutEffect）に済むので、次のフレームの頭で読めば、着地のあとの最初のフレームになる。
      requestAnimationFrame(snapshot);
    }
    const box = resultBox();
    if (!box) {
      resultSeen = false;
      return;
    }
    if (!resultSeen) {
      resultSeen = true;
      window.__yolosResultAt = performance.timeOrigin + performance.now();
      return;
    }
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement) || inserts >= 5) continue;
        if (box.contains(node) || !node.closest("main")) continue;
        const rect = node.getBoundingClientRect();
        if (rect.height === 0) continue;
        inserts++;
        const boxTop = box.getBoundingClientRect().top;
        send({
          ev: "insert",
          t: performance.timeOrigin + performance.now(),
          sinceResult:
            performance.timeOrigin + performance.now() - window.__yolosResultAt,
          top: Math.round(rect.top),
          atBoxGap: Math.round(rect.top - boxTop + boxGap),
          innerHeight: window.innerHeight,
          tag: node.tagName.toLowerCase(),
          name: text(node),
        });
      }
    }
  });
  const begin = () =>
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-valuenow"],
    });
  if (document.documentElement) begin();
  else document.addEventListener("readystatechange", begin, { once: true });
}

// 着地の関数の入り口（変更後の版の reveal.ts の chooseLanding。最小化で revealLanding の中の関数になる）を、
// チャンクの字から見つける形。引数の名前は最小化で決まるので、形から取る。
const LANDING_PATTERN =
  /function\(([\w$]+)\)\{let\{plan:[\w$]+,point:[\w$]+,avoidFirst:/;

// ---------------------------------------------------------------------------
// ブラウザの文脈

async function openContext(browser, run, base, profileRoot) {
  const options = {
    viewport: { width: run.viewport.width, height: run.viewport.height },
    hasTouch: run.input === "touch",
  };
  let context;
  if (run.viewport.big) {
    // 200% は、プロファイルの既定の文字サイズを 32px にして作る（docs/knowledge/playwright-mcp.md）。毎回新しい
    // プロファイルにして、Web フォントを読み込んでいない文脈から始める。
    const profile = fs.mkdtempSync(path.join(profileRoot, "p-"));
    fs.mkdirSync(path.join(profile, "Default"));
    fs.writeFileSync(
      path.join(profile, "Default/Preferences"),
      JSON.stringify({ webkit: { webprefs: { default_font_size: 32 } } }),
    );
    context = await chromium.launchPersistentContext(profile, {
      ...options,
      executablePath: CHROMIUM,
      args: ["--disable-smooth-scrolling"],
    });
    context.__profile = profile;
  } else {
    context = await browser.newContext(options);
  }
  return context;
}

async function closeContext(context) {
  await context.close().catch(() => {});
  if (context.__profile) {
    fs.rmSync(context.__profile, { recursive: true, force: true });
  }
}

/**
 * 1回の走査の文脈を作り、記録の受け手・開いたタブの行き先・着地の関数の記録を置く。
 * 返す state.events に、ページの記録が届いた順に、その時の押しの番号（state.press）を付けて入る。
 */
async function prepare(browser, run, options, profileRoot) {
  const context = await openContext(browser, run, options.base, profileRoot);
  const state = {
    press: -1,
    events: [],
    popups: [],
    landings: [],
    selections: {},
  };
  // localhost の外への要求を止める（GA を含む）。開いたタブの最初の遷移は frame() が投げる要求で、その URL を
  // 行き先として、その時の押しに添える（t5a-measure.md 0章「別のタブや共有の画面を開く押し」）。
  await context.route(
    (url) => !url.href.startsWith(options.base),
    (route) => {
      const request = route.request();
      if (request.isNavigationRequest()) {
        let opener = true;
        try {
          request.frame();
          opener = false;
        } catch {
          opener = true;
        }
        if (opener)
          state.popups.push({ press: state.press, url: request.url() });
      }
      return route.abort();
    },
  );
  await context.exposeBinding("__yolosMeasure", (_source, record) => {
    state.events.push({ ...record, press: state.press });
  });
  await context.addInitScript(pageProbe);
  const page = context.pages()[0] ?? (await context.newPage());
  state.page = page;
  // 開いたタブは拾ってすぐ閉じる。
  context.on("page", (opened) => {
    if (opened !== page) opened.close().catch(() => {});
  });
  const session = await context.newCDPSession(page);
  state.session = session;
  // 着地の関数の記録は、本番のコードに測りの口を足さずに取るため、CDP の Debugger の条件付きの止め所（条件が
  // 記録を console に書いて false を返すので、止まらない）で取る。基準の版のチャンクには形が無いので、置かない。
  // 比べを揃えるため、Debugger はどちらの版でも有効にする。
  await session.send("Debugger.enable");
  session.on("Debugger.scriptParsed", async (event) => {
    if (!event.url.includes("/_next/static/chunks/")) return;
    try {
      const { scriptSource } = await session.send("Debugger.getScriptSource", {
        scriptId: event.scriptId,
      });
      const match = LANDING_PATTERN.exec(scriptSource);
      if (!match) return;
      const bodyIndex = match.index + match[0].indexOf("{let") + 1;
      const before = scriptSource.slice(0, bodyIndex);
      const lineNumber = before.split("\n").length - 1;
      const columnNumber = bodyIndex - (before.lastIndexOf("\n") + 1);
      const parameter = match[1];
      await session.send("Debugger.setBreakpoint", {
        location: { scriptId: event.scriptId, lineNumber, columnNumber },
        condition: `(console.debug("__yolosLanding", JSON.stringify({ t: performance.timeOrigin + performance.now(), scrollY: window.scrollY, choice: ${parameter} })), false)`,
      });
    } catch {
      // 読めないスクリプトは飛ばす。
    }
  });
  page.on("console", (message) => {
    const value = message.text();
    if (!value.startsWith("__yolosLanding ")) return;
    state.landings.push({
      press: state.press,
      ...JSON.parse(value.slice("__yolosLanding ".length)),
    });
  });
  return { context, page, session, state };
}

// ---------------------------------------------------------------------------
// ページの操作

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** ページの今の様子。押すものの矩形は画面の座標。 */
function readScreen() {
  const text = (element) =>
    (element?.textContent ?? "").replace(/\s+/g, "").slice(0, 24);
  const hydrated = (element) =>
    !!element && Object.keys(element).some((key) => key.startsWith("__react"));
  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return {
      top: box.top,
      bottom: box.bottom,
      left: box.left,
      right: box.right,
    };
  };
  const heading = document.querySelector('h2[tabindex="-1"]');
  const list = heading?.nextElementSibling?.matches('ul[data-text-box="rows"]')
    ? heading.nextElementSibling
    : null;
  const bar = document.querySelector('[role="progressbar"]');
  const buttons = [...document.querySelectorAll("button")];
  const start = buttons.find((button) => text(button) === "はじめる");
  const next = buttons.find((button) => text(button) === "次へ");
  const retry = buttons.find((button) => text(button) === "もう一度挑戦する");
  const rows = list ? [...list.children] : [];
  return {
    phase: document.querySelector('section[tabindex="-1"]')
      ? "result"
      : heading
        ? "playing"
        : start
          ? "intro"
          : "other",
    band: bar ? Number(bar.getAttribute("aria-valuenow")) : null,
    total: bar ? Number(bar.getAttribute("aria-valuemax")) : null,
    heading: text(heading),
    choices: rows
      .map((row) => row.querySelector(":scope > button"))
      .filter((button) => button && hydrated(button))
      .map((button) => ({ name: text(button), rect: rect(button) })),
    answered: !!list && !list.querySelector("button"),
    start: start && hydrated(start) ? rect(start) : null,
    next: next && hydrated(next) ? rect(next) : null,
    retry: retry && hydrated(retry) ? rect(retry) : null,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    scrollY: window.scrollY,
    maxScrollY: document.documentElement.scrollHeight - window.innerHeight,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
  };
}

async function screen(page) {
  return page.evaluate(readScreen);
}

/** 条件が満たされるまで、上限つきで様子を読み直す。満たされなければ最後の様子と false を返す。 */
async function waitScreen(page, predicate, timeout = 10000) {
  const until = Date.now() + timeout;
  let current = await screen(page);
  while (!predicate(current)) {
    if (Date.now() > until) return { screen: current, ok: false };
    await sleep(25);
    current = await screen(page);
  }
  return { screen: current, ok: true };
}

/**
 * 来訪者の送り（ホイール）。押すものが画面に丸ごと入っていないときに、下にはみ出していれば下端を画面の下端から
 * 8px 上に、上にはみ出していれば上端を画面の上端から 8px に来るまで送る。
 */
async function visitorScroll(page, session, delta) {
  if (Math.abs(delta) < 0.5) return 0;
  const before = await page.evaluate(() => window.scrollY);
  const viewport = page.viewportSize();
  await session.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: Math.round(viewport.width / 2),
    y: Math.round(viewport.height / 2),
    deltaX: 0,
    deltaY: delta,
  });
  // 送りが止まるまで待つ。動いたあと3回続けて同じ位置か、動かないまま 300ms たったら止まったとする（ページの
  // 端で送れないとき）。
  const began = Date.now();
  let last = before;
  let stable = 0;
  while (Date.now() - began < 2000) {
    await sleep(30);
    const now = await page.evaluate(() => window.scrollY);
    stable = now === last ? stable + 1 : 0;
    last = now;
    if (stable >= 3 && (now !== before || Date.now() - began > 300)) break;
  }
  return last - before;
}

function overflowOf(rect, innerHeight) {
  if (rect.bottom > innerHeight) return rect.bottom - (innerHeight - GAP);
  if (rect.top < 0) return rect.top - GAP;
  return 0;
}

/** 押すものを画面に入れてから（入っていれば送らず）、その時の矩形を返す。 */
async function bringIntoView(page, session, pick) {
  let current = await screen(page);
  const scrolled = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const rect = pick(current);
    if (!rect) return { rect: null, screen: current, scrolled };
    const delta = overflowOf(rect, current.innerHeight);
    if (Math.abs(delta) < 0.5) return { rect, screen: current, scrolled };
    scrolled.push(Math.round(await visitorScroll(page, session, delta)));
    current = await screen(page);
  }
  return { rect: pick(current), screen: current, scrolled };
}

const center = (rect) => ({
  x: Math.round((rect.left + rect.right) / 2),
  y: Math.round((rect.top + rect.bottom) / 2),
});

/** 押しを1回送る（1打目か2打目）。返事は待たない。 */
function sendPress(session, input, point, clickCount) {
  if (input === "touch") {
    session
      .send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: point.x, y: point.y }],
      })
      .catch(() => {});
    return session
      .send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
      .catch(() => {});
  }
  session
    .send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: point.x,
      y: point.y,
    })
    .catch(() => {});
  session
    .send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: point.x,
      y: point.y,
      button: "left",
      buttons: 1,
      clickCount,
    })
    .catch(() => {});
  return session
    .send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: point.x,
      y: point.y,
      button: "left",
      buttons: 0,
      clickCount,
    })
    .catch(() => {});
}

/**
 * 同じ点（D5 では2打目だけずらした点）を2度押す。1打目を送ってから指定の間隔だけ待って2打目を送る。
 * 待ちは、1打目から waitFromFirst か、2打目から waitAfterSecond のどちらか。
 */
async function doublePress(context, run, point, waits) {
  const { session, state } = context;
  state.press++;
  const index = state.press;
  const sentAt = Date.now();
  sendPress(session, run.input, point, 1);
  await sleep(run.interval);
  const second = { x: point.x + run.offset.dx, y: point.y + run.offset.dy };
  await sendPress(session, run.input, second, 2);
  const secondAt = Date.now();
  if (waits.fromFirst !== undefined) {
    await sleep(Math.max(0, waits.fromFirst - (secondAt - sentAt)));
  } else await sleep(waits.afterSecond);
  // 語の選択の測り（マウス）: 記録の時点の選択。ページを離れたあとは読めない。
  state.selections[index] = await context.page
    .evaluate(() => String(getSelection() ?? ""))
    .catch(() => null);
  return index;
}

/** 1度だけの押し（最後の問までの進め方）。 */
async function singlePress(context, run, point) {
  const { session, state } = context;
  state.press++;
  await sendPress(session, run.input, point, 1);
  return state.press;
}

// ---------------------------------------------------------------------------
// 押しごとの記録

function summarizeLanding(landing, frames) {
  const { plan, point, avoidFirst, avoidNext, scrollable } = landing.choice;
  const span = {
    min: Math.ceil(Math.max(plan.span.min, scrollable.min)),
    max: Math.floor(Math.min(plan.span.max, scrollable.max)),
  };
  const under = (rects, scroll) =>
    !!point &&
    rects.some(
      (rect) =>
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top - scroll &&
        point.y <= rect.bottom - scroll,
    );
  let clearOfFirst = false;
  let clearOfBoth = false;
  if (point && span.min <= span.max) {
    for (let scroll = span.min; scroll <= span.max; scroll++) {
      if (under(avoidFirst, scroll)) continue;
      clearOfFirst = true;
      if (!under(avoidNext, scroll)) {
        clearOfBoth = true;
        break;
      }
    }
  }
  const frame = frames.find((candidate) => candidate.t > landing.t);
  return {
    s0: plan.base,
    span: [Math.round(plan.span.min), Math.round(plan.span.max)],
    range: [span.min, span.max],
    point: point ? [Math.round(point.x), Math.round(point.y)] : null,
    underAtS0: under(avoidFirst, plan.base)
      ? "first"
      : under(avoidNext, plan.base)
        ? "next"
        : null,
    clearOfFirst,
    clearOfBoth,
    chosen: frame ? frame.scrollY - landing.scrollY : null,
    nFirst: avoidFirst.length,
    nNext: avoidNext.length,
  };
}

function pressRecord(state, index, extra) {
  const events = state.events.filter((event) => event.press === index);
  const downs = events.filter((event) =>
    extra.input === "touch"
      ? event.ev === "touchstart"
      : event.ev === "mousedown",
  );
  const mousedowns = events.filter((event) => event.ev === "mousedown");
  const clicks = events.filter((event) => event.ev === "click");
  const frames = state.events.filter((event) => event.ev === "frame");
  const pressFrames = frames.filter((frame) => frame.press === index);
  const landings = state.landings
    .filter((landing) => landing.press === index)
    .map((landing) => summarizeLanding(landing, frames));
  const gap =
    downs.length >= 2 ? Math.round((downs[1].t - downs[0].t) * 10) / 10 : null;
  const brief = (event) =>
    event
      ? {
          el: event.el,
          at: [event.x, event.y],
          detail: event.detail,
          band: event.band,
          phase: event.phase,
          scrollY: Math.round(event.scrollY),
        }
      : null;
  return {
    i: index,
    kind: extra.kind,
    band: extra.band,
    point: [extra.point.x, extra.point.y],
    scrolled: extra.scrolled?.length ? extra.scrolled : undefined,
    gap,
    crossed: crossesShown(extra.interval, gap) || undefined,
    first: brief(clicks[0]),
    second: clicks[1] ? { ...brief(clicks[1]), path: clicks[1].path } : null,
    clicks: clicks.length,
    md2: mousedowns[1]?.detail,
    landings: landings.length ? landings : undefined,
    frames: pressFrames.map((frame) => ({
      sig: frame.sig,
      scrollY: Math.round(frame.scrollY),
      h1: frame.h1 ?? undefined,
      heading: frame.heading ?? undefined,
      name: frame.name,
      boxTop: frame.boxTop,
      start: frame.start,
      focus: frame.focus,
    })),
    selection: extra.input === "mouse" ? state.selections[index] : undefined,
    popups: state.popups
      .filter((popup) => popup.press === index)
      .map((popup) => popup.url.split("?")[0]),
  };
}

function crossesShown(interval, gap) {
  if (!BOUNDARY_INTERVALS.has(interval) || gap === null) return false;
  return interval < SHOWN_MS ? gap >= SHOWN_MS : gap < SHOWN_MS;
}

/** 2打目でページを離れたか（t5a-measure.md 0章「2打目で離れたか」）。 */
function leaveOf(record) {
  const element = record.second?.el;
  if (!element) return null;
  // 今のページの道は、2打目の click の時点のもの（リンクの遷移が済むと location は移った先になる）。
  if (
    element.g === "link" &&
    !element.blank &&
    element.path.startsWith("/") &&
    element.path !== record.second.path
  ) {
    return { by: "link", to: element.path };
  }
  if (element.g === "button" && element.name === "もう一度挑戦する") {
    return { by: "retry" };
  }
  return null;
}

/** 離れたとき、遷移が終わるのを待って移った先を読む。 */
async function followLeave(page, leave) {
  const until = Date.now() + 10000;
  while (Date.now() < until) {
    const now = await page
      .evaluate(() => ({
        path: location.pathname,
        h1: (document.querySelector("h1")?.textContent ?? "").trim(),
        start: [...document.querySelectorAll("button")].some(
          (button) => button.textContent.replace(/\s+/g, "") === "はじめる",
        ),
      }))
      .catch(() => null);
    if (now && leave.by === "link" && now.path === leave.to && now.h1) {
      return { path: now.path, h1: now.h1.slice(0, 40) };
    }
    if (now && leave.by === "retry" && now.start) {
      return { path: now.path, h1: now.h1.slice(0, 40) };
    }
    await sleep(50);
  }
  return { timeout: true };
}

// ---------------------------------------------------------------------------
// 操作

async function openQuiz(context, slug, base) {
  const { page } = context;
  await page.goto(`${base}/play/${slug}`, {
    waitUntil: "load",
    timeout: 120000,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  const { screen: opened, ok } = await waitScreen(
    page,
    (current) => !!current.start,
    60000,
  );
  if (!ok) throw new Error("start button did not hydrate");
  return opened;
}

async function startByElementClick(page) {
  await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .find((button) => button.textContent.replace(/\s+/g, "") === "はじめる")
      .click(),
  );
  const { ok, screen: first } = await waitScreen(
    page,
    (current) => current.choices.length > 0,
  );
  if (!ok) throw new Error("first question did not appear");
  return first;
}

function pickRow(current, row, plannedName) {
  if (plannedName) {
    const planned = current.choices.find(
      (choice) => choice.name === plannedName.replace(/\s+/g, "").slice(0, 24),
    );
    if (!planned) throw new Error(`choice ${plannedName} not on screen`);
    return planned.rect;
  }
  if (current.choices.length === 0) return null;
  return row === "last" ? current.choices.at(-1).rect : current.choices[0].rect;
}

/** 「はじめる」の二度押し。 */
async function measureStart(context, run, options) {
  const opened = await openQuiz(context, run.slug, options.base);
  const placed = await bringIntoView(
    context.page,
    context.session,
    (current) => current.start,
  );
  const point = center(placed.rect);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  const record = pressRecord(context.state, index, {
    kind: "start",
    band: null,
    point,
    scrolled: placed.scrolled,
    interval: run.interval,
    input: run.input,
  });
  return { rootFontSize: opened.rootFontSize, presses: [record] };
}

/** 全問を最初の行か最後の行で解き切る走査（t5a-measure.md 5-2・0章「走査の次の1打目」）。 */
async function measureAnswers(context, run, options) {
  const { page, session, state } = context;
  const opened = await openQuiz(context, run.slug, options.base);
  const { total } = await startByElementClick(page);
  const knowledge = KNOWLEDGE.has(run.slug);
  const presses = [];
  let leave = null;
  for (let guard = 0; guard < 200; guard++) {
    let current = await screen(page);
    if (current.phase === "result") break;
    if (current.phase !== "playing") {
      throw new Error(`unexpected phase ${current.phase}`);
    }
    let kind;
    if (!current.answered) kind = "answer";
    else if (knowledge) kind = "next";
    else {
      // 診断で答えを見せているあいだ: 次の問が出るか、結果のボックスが入るのを待つ。
      const band = current.band;
      const { ok } = await waitScreen(
        page,
        (now) => now.phase === "result" || (now.band !== band && !now.answered),
      );
      if (!ok) throw new Error("next question did not appear");
      continue;
    }
    const pick =
      kind === "answer"
        ? (now) => (now.answered ? null : pickRow(now, run.row))
        : (now) => now.next;
    const ready = await waitScreen(page, (now) => !!pick(now));
    if (!ready.ok) throw new Error(`no pressable ${kind}`);
    const placed = await bringIntoView(page, session, pick);
    current = placed.screen;
    const point = center(placed.rect);
    const index = await doublePress(context, run, point, {
      fromFirst: WAIT_FROM_FIRST_MS,
    });
    const record = pressRecord(state, index, {
      kind,
      band: current.band,
      point,
      scrolled: placed.scrolled,
      interval: run.interval,
      input: run.input,
    });
    record.last = current.band === current.total || undefined;
    presses.push(record);
    leave = leaveOf(record);
    if (leave) {
      leave.at = index;
      leave.dest = await followLeave(page, leave);
      break;
    }
  }
  return {
    rootFontSize: opened.rootFontSize,
    presses,
    leave: leave ?? undefined,
    total,
    check: leave ? undefined : countCheck(presses, total),
  };
}

/**
 * 1打目で答えた問の数（押せる選択肢に落ちた1打目）＋ X ＋ S が問の数と等しいかの確かめ（t5a-measure.md 5-2）。
 * X・S は、2打目の帯の番号が1打目の問より後の問で、押せる選択肢に落ちたもの。
 */
function countCheck(presses, total) {
  let firsts = 0;
  let x = 0;
  let s = 0;
  for (const press of presses) {
    if (press.first?.el.g === "choice") firsts++;
    const second = press.second;
    if (
      second?.el.g === "choice" &&
      second.band !== null &&
      press.first?.band !== null &&
      second.band > press.first.band
    ) {
      if (second.band === total) s++;
      else x++;
    }
  }
  return { firsts, x, s, ok: firsts + x + s === total };
}

/** 最後の答え・最後の「次へ」→結果（5-3 で決めた進め方）。 */
async function measureLast(context, run, options) {
  const { page, session, state } = context;
  const opened = await openQuiz(context, run.slug, options.base);
  await startByElementClick(page);
  const knowledge = KNOWLEDGE.has(run.slug);
  const choiceFor = (band) => run.plan?.choices[band - 1];
  const steps = [];
  // 最後の問の前までは、同じ入力で、決めた行を1度ずつ押して進める（来訪者が1問ずつ押す形）。
  for (let guard = 0; guard < 100; guard++) {
    let current = await screen(page);
    if (current.phase !== "playing") {
      throw new Error(`unexpected phase ${current.phase}`);
    }
    const isLast = current.band === current.total;
    if (current.answered && !knowledge) {
      const band = current.band;
      const { ok } = await waitScreen(
        page,
        (now) => now.phase === "result" || (now.band !== band && !now.answered),
      );
      if (!ok) throw new Error("next question did not appear");
      continue;
    }
    if (isLast && (!knowledge || current.answered)) break;
    const pick = current.answered
      ? (now) => now.next
      : (now) =>
          now.answered ? null : pickRow(now, "first", choiceFor(now.band));
    const placed = await bringIntoView(page, session, pick);
    if (!placed.rect) throw new Error("nothing to press before the last");
    const band = placed.screen.band;
    const answered = placed.screen.answered;
    await singlePress(context, run, center(placed.rect));
    steps.push(placed.scrolled);
    const { ok } = await waitScreen(page, (now) =>
      answered
        ? now.band !== band && !now.answered
        : knowledge
          ? now.answered
          : now.band !== band || now.answered,
    );
    if (!ok) throw new Error("press before the last did not take");
  }
  const pick = knowledge
    ? (now) => now.next
    : (now) =>
        now.answered ? null : pickRow(now, "first", choiceFor(now.band));
  const placed = await bringIntoView(page, session, pick);
  if (!placed.rect) throw new Error("last press target missing");
  const point = center(placed.rect);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  if (EXTRA_SLUGS.has(run.slug)) {
    const until = Date.now() + EXTRA_WAIT_MS;
    while (
      Date.now() < until &&
      !state.events.some((event) => event.ev === "insert")
    ) {
      await sleep(100);
    }
  }
  const record = pressRecord(state, index, {
    kind: knowledge ? "last-next" : "last-answer",
    band: placed.screen.band,
    point,
    scrolled: placed.scrolled,
    interval: run.interval,
    input: run.input,
  });
  const leave = leaveOf(record);
  if (leave?.by === "link") leave.dest = await followLeave(page, leave);
  return {
    rootFontSize: opened.rootFontSize,
    // 最後の押しの前の1度ずつの押しの数と、そのうち来訪者の送りを挟んだ押しの送りの量（押しの順の番号と量）。
    before: {
      presses: steps.length,
      scrolled: steps
        .map((scrolled, order) => [order, ...scrolled])
        .filter((entry) => entry.length > 1),
    },
    presses: [record],
    leave: leave ?? undefined,
    resultId: run.plan?.resultId,
    inserts: state.events
      .filter((event) => event.ev === "insert")
      .map((event) => ({
        sinceResult: Math.round(event.sinceResult),
        top: event.top,
        atBoxGap: event.atBoxGap,
        inView: event.top < event.innerHeight,
        tag: event.tag,
        name: event.name,
      })),
  };
}

/** 「もう一度挑戦する」の二度押し。中心を画面の上から position の高さに置いて押す。 */
async function measureRetry(context, run, options) {
  const { page, session, state } = context;
  const opened = await openQuiz(context, run.slug, options.base);
  await startByElementClick(page);
  for (let guard = 0; guard < 100; guard++) {
    const current = await screen(page);
    if (current.phase === "result") break;
    await page.evaluate(() => {
      const heading = document.querySelector('h2[tabindex="-1"]');
      const list = heading?.nextElementSibling;
      const button =
        list?.querySelector(":scope > li > button") ??
        [...document.querySelectorAll("button")].find(
          (candidate) => candidate.textContent.replace(/\s+/g, "") === "次へ",
        );
      button?.click();
    });
    await sleep(30);
    await waitScreen(
      page,
      (now) => now.phase === "result" || !!now.choices.length || !!now.next,
      5000,
    );
  }
  const { screen: atResult, ok } = await waitScreen(page, (now) => !!now.retry);
  if (!ok) throw new Error("retry button missing");
  const middle = (atResult.retry.top + atResult.retry.bottom) / 2;
  const scrolled = await visitorScroll(page, session, middle - run.position);
  const placed = await screen(page);
  const point = center(placed.retry);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  const record = pressRecord(state, index, {
    kind: "retry",
    band: null,
    point,
    scrolled: [Math.round(scrolled)],
    interval: run.interval,
    input: run.input,
  });
  record.reached = Math.abs(point.y - run.position) <= 1;
  const leave = leaveOf(record);
  if (leave?.by === "link") leave.dest = await followLeave(page, leave);
  return {
    rootFontSize: opened.rootFontSize,
    presses: [record],
    leave: leave ?? undefined,
  };
}

const MEASURES = {
  start: measureStart,
  answers: measureAnswers,
  last: measureLast,
  retry: measureRetry,
};

// ---------------------------------------------------------------------------
// 送り直し

/** 1回で終わる操作の回を送り直すか（実際の間隔が 150ms の側を越えたか、マウスの2打目の detail が 2 でないか）。 */
function needsResend(op, run, outcome) {
  if (op === "answers") return null;
  const press = outcome.presses[0];
  const reasons = [];
  if (press.crossed) reasons.push("crossed");
  if (run.input === "mouse" && press.md2 !== 2) reasons.push("detail");
  return reasons.length ? reasons : null;
}

// ---------------------------------------------------------------------------

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const fingerprint = JSON.parse(
    fs.readFileSync(path.join(options.version, "fingerprint.json"), "utf8"),
  );
  const answerPlans = new Map();
  if (options.answers) {
    for (const line of fs
      .readFileSync(options.answers, "utf8")
      .split("\n")
      .filter(Boolean)) {
      const entry = JSON.parse(line);
      answerPlans.set(entry.slug, entry.plans);
    }
  }
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    args: ["--disable-smooth-scrolling"],
  });
  const browserVersion = browser.version();
  const records = ensureVersionLine(options.out, fingerprint, browserVersion);
  const attempts = new Map();
  const finished = new Set();
  for (const record of records) {
    if (record.type !== "run") continue;
    attempts.set(record.key, (attempts.get(record.key) ?? 0) + 1);
    if (record.final) finished.add(record.key);
  }
  // 200% のプロファイルは、リポジトリの tmp/ の下に置く。
  const repository = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
  fs.mkdirSync(path.join(repository, "tmp"), { recursive: true });
  const profileRoot = fs.mkdtempSync(
    path.join(repository, "tmp", "measure-profiles-"),
  );
  const runs = enumerateRuns(options, answerPlans);
  let done = 0;
  for (const run of runs) {
    const key = runKey(options.op, run);
    if (finished.has(key)) continue;
    if (done >= options.limit) break;
    let attempt = attempts.get(key) ?? 0;
    for (;;) {
      const started = Date.now();
      const context = await prepare(browser, run, options, profileRoot);
      let outcome;
      let error;
      try {
        outcome = await MEASURES[options.op](context, run, options);
      } catch (caught) {
        error = String(caught?.message ?? caught).slice(0, 200);
      }
      await closeContext(context.context);
      const resend = outcome ? needsResend(options.op, run, outcome) : null;
      const recheck =
        options.op === "answers" && outcome?.check && !outcome.check.ok;
      const reasons = error
        ? ["error"]
        : recheck
          ? ["check"]
          : (resend ?? undefined);
      // 確かめの合わない走査は1度だけやり直す（t5a-measure.md 5-2）。ほかは3度まで送り直す。
      const limit = recheck ? 1 : MAX_RESENDS;
      const final = !reasons || attempt >= limit;
      const line = {
        type: "run",
        key,
        tree: fingerprint.tree,
        op: options.op,
        viewport: run.viewport.name,
        slug: run.slug,
        input: run.input,
        interval: run.interval,
        offset: [run.offset.dx, run.offset.dy],
        row: run.row,
        position: run.position,
        attempt,
        final,
        // 送り直した回（数えない）の理由と、送り直しの上限まで越えたまま数える回の印。
        resent: !final ? reasons : undefined,
        exhausted: final ? reasons : undefined,
        error,
        at: new Date(started).toISOString(),
        wallMs: Date.now() - started,
        ...outcome,
      };
      fs.appendFileSync(options.out, `${JSON.stringify(line)}\n`);
      attempt++;
      if (final) break;
    }
    done++;
  }
  await browser.close();
  fs.rmSync(profileRoot, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
