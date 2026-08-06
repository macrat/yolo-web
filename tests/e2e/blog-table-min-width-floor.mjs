/**
 * e2e: ブログ本文の表に敷く「床」（セルの最小幅）の出し分けを実幅で検証する
 *
 * 狭い画面で表の列が内容の最小幅（日本語は1文字）まで潰れ、セルが1文字ずつ縦に
 * 折れる不具合を、`th/td { min-width }` の床で防いでいる。床は列ごとに
 * `min(6.8em, その列が折り返さずに要る幅)`——markdown.ts が列ごとの見積もりを
 * `--table-col-N` として包みに載せ、CSS がそれと 6.8em の小さいほうを採る。
 *
 * 列の自然幅で頭打ちにするので、床の合計はその表の自然幅とほぼ同じところに収まる
 * （丸めと列ごとの遊びのぶん、280〜720px で3個・1280px で1個が最大 +21px 上回る）。
 *
 * この仕組みは CSS と生成 HTML にまたがっていて、vitest では実際の幅を見られない。
 * ここで実ブラウザの実幅から `min-width` と `scrollWidth` を直接見る。
 *
 * ケースには**両極**を入れること——全列が短い表（床が 6.8em に届かない）と、
 * 長い列を持つ表（その列が 6.8em の床を持つ）。片方だけだと、床の式を壊しても
 * すり抜ける。境界に近い3列表（判定が数pxで変わる）も1つ入れてある。
 *
 * 検証する幅には 375px（DESIGN.md §10 の実装基準）と 390px（iPhone 12〜15）を含める。
 *
 * 実行方法:
 *   npm run build && npx next start -p 3001
 *   npm run test:e2e             # または node tests/e2e/blog-table-min-width-floor.mjs
 *
 * 前提: ビルド済みアプリが起動していること。既定の宛先は http://localhost:3001 で、
 * 別のポートを使うなら `E2E_BASE_URL=http://localhost:<ポート>` を渡す。
 */

import { chromium } from "playwright";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3001";

/**
 * 期待する床の状態。床は列ごとに違うので、見るのは次の3つ。
 *
 * - `maxOverflow`     横スクロール量の上限。床のせいで表が膨らんでいないこと
 * - `everyFloorBelow` すべての列の床がこの値未満。短いセルの表が 6.8em に
 *                     引き上げられていないこと（カレンダーの週が読めるかに直結）
 * - `everyFloorAtLeast` すべての列の床がこの値以上。床にパディングと罫が
 *                     含まれていること——ここが抜けると短い列の内容領域が数pxになり、
 *                     1文字折れが戻る（見た目では床の式の誤りだと気づけない）
 * - `someFloorAtLeast` どれかの列の床がこの値以上。折り返す列が守られていること
 */
const CASES = [
  {
    name: "1月カレンダー（7列・全セル1〜2文字）",
    slug: "cron-expression-pitfalls-dom-dow-parseint",
    tableIndex: 0,
    checks: [
      // 床 = 見積もり20px + パディング16px + 罫1px = 37px。30px 下限で
      // 「パディングと罫が入っていること」を固定する
      {
        width: 320,
        everyFloorBelow: 102,
        everyFloorAtLeast: 30,
        maxOverflow: 9,
      },
      { width: 375, everyFloorBelow: 102, maxOverflow: 9 },
      { width: 390, everyFloorBelow: 102, maxOverflow: 9 },
      { width: 1280, everyFloorBelow: 102, maxOverflow: 9 },
      /*
       * 280px は自然幅237px に対し読む列232px。列ごとの床なら7列で280px（溢れ48px）
       * に収まり、週の並びはほぼ一望できる。6.8em を一律に敷くと 714px（溢れ483px）
       * になり、2.5列しか見えなくなる。
       */
      { width: 280, everyFloorBelow: 102, maxOverflow: 55 },
    ],
  },
  {
    name: "伝統色辞典の色相表（4列・記号を含む）",
    slug: "japanese-traditional-colors-dictionary",
    tableIndex: 0,
    /*
     * 4列目だけは自然幅が 6.8em を超えるので床が 102px になるが、他の列が
     * 自然幅で足りるため表全体は収まる。一律の床だと 409px に膨らみ、
     * 375px で 82px（列の床102pxの0.8個ぶん）が隠れていた。
     */
    checks: [
      { width: 375, maxOverflow: 9 },
      { width: 390, maxOverflow: 9 },
    ],
  },
  {
    name: "地の一覧（4列・説明が長い）",
    slug: "favicon-16px-readability-metrics",
    tableIndex: 0,
    checks: [
      { width: 320, someFloorAtLeast: 102 },
      { width: 375, someFloorAtLeast: 102 },
      { width: 390, someFloorAtLeast: 102 },
    ],
  },
  {
    name: "cron 互換性マトリクス（7列・説明が長い）",
    slug: "cron-parser-guide",
    tableIndex: 2,
    checks: [
      { width: 375, someFloorAtLeast: 102 },
      { width: 390, someFloorAtLeast: 102 },
      { width: 1280, someFloorAtLeast: 102 },
    ],
  },
  {
    /*
     * 3列すべてが 6.8em に張り付く表（360px で3列かつ全列の床が102pxの表は64個、
     * うち溢れ0のものが41個。3列は既存203個の表のうち最多の112個）。溢れ0の指定が 6.8em という値そのものを守る——
     * 7em にすると 3×105＋罫1 = 316px となり、読む列312px を4px 超える。
     * どれか1列でも自然幅で頭打ちになる表を選ぶと、キャップを上げる変異が
     * すり抜けるので、**全列が張り付く表**であることが要点。
     */
    name: "文字数カウントの3列表（全列が 6.8em に張り付く）",
    slug: "character-counting-guide",
    tableIndex: 6,
    checks: [
      {
        width: 360,
        someFloorAtLeast: 102,
        everyFloorAtLeast: 102,
        maxOverflow: 0,
      },
    ],
  },
];

/**
 * 8列以上の表に床が掛かることを、その場で作った表で確かめる。
 *
 * CSS の `nth-child` は7列ぶんしか無い（既存記事の最大列数）ので、8列目以降は
 * `.prose th, .prose td` の既定値に落ちる。この既定値が無いと 8列目の床が 0 になり、
 * 内容領域が全角1文字ぶんまで潰れて、直したはずの症状が静かに戻る。
 * 既存記事に8列の表が無いため、記事を測るだけでは永久に気づけない。
 */
async function checkWideTable(browser, baseUrl) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(`${baseUrl}/blog/cron-parser-guide`, {
    waitUntil: "load",
    timeout: 20000,
  });
  const floors = await page.evaluate(() => {
    const prose = document.querySelector(".prose");
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    const head = Array.from(
      { length: 9 },
      (_, i) => `<th>列${i + 1}あいうえお</th>`,
    );
    const body = Array.from({ length: 9 }, (_, i) => `<td>値${i + 1}</td>`);
    wrap.innerHTML =
      `<div class="table-scroll"><table><thead><tr>${head.join("")}</tr></thead>` +
      `<tbody><tr>${body.join("")}</tr></tbody></table></div>`;
    prose.appendChild(wrap);
    const result = [...wrap.querySelectorAll("th")].map((c) =>
      Math.round(parseFloat(getComputedStyle(c).minWidth) || 0),
    );
    wrap.remove();
    return result;
  });
  await page.close();
  const weakest = Math.min(...floors);
  const ok = weakest >= 102;
  console.log(
    `\n9列の表（その場で生成・列変数なし）\n  [${ok ? "OK" : "FAIL"}] 360px 床=[${floors}]` +
      (ok ? "" : ` — 最小の床=${weakest}px（期待: 102px 以上）`),
  );
  return ok ? 0 : 1;
}

async function measure(page, tableIndex) {
  return page.evaluate((index) => {
    const wrap = document.querySelectorAll(".table-wrap")[index];
    if (!wrap) return { error: `table-wrap[${index}] not found` };
    const scroller = wrap.querySelector(".table-scroll");
    const table = scroller.querySelector("table");
    // 床は列ごとに違うので、行の各セルから最大・最小を採る
    const headerCells = [...table.querySelector("tr").children];
    const floors = headerCells.map(
      (c) => parseFloat(getComputedStyle(c).minWidth) || 0,
    );
    const maxFloor = Math.max(...floors);
    const overflowX = getComputedStyle(scroller).overflowX;

    // 床を外したときの自然幅（この表が本当は収まるのか）
    const prevMin = table.style.minWidth;
    const prevWidth = table.style.width;
    table.style.minWidth = "0";
    table.style.width = "max-content";
    const cells = [...table.querySelectorAll("th,td")];
    cells.forEach((c) => (c.style.minWidth = "0"));
    const natural = table.getBoundingClientRect().width;
    table.style.minWidth = prevMin;
    table.style.width = prevWidth;
    cells.forEach((c) => (c.style.minWidth = ""));

    return {
      maxFloor: Math.round(maxFloor),
      overflowX,
      floors: floors.map((f) => Math.round(f)),
      overflow: Math.round(scroller.scrollWidth - scroller.clientWidth),
      natural: Math.round(natural),
      available: scroller.clientWidth,
    };
  }, tableIndex);
}

function checkResult(result, expected) {
  const problems = [];
  const { maxFloor, overflow, natural, available, overflowX } = result;

  /*
   * 逃がし先そのもの。ここが visible になると、床ではみ出した分は
   * globals.css の `body { overflow-x: clip }` に食われて到達できなくなる
   * ——元の不具合そのものに戻る。溢れ量（scrollWidth - clientWidth）は
   * auto でも visible でも同じ値になるので、指定を直接見るしかない。
   */
  if (overflowX !== "auto") {
    problems.push(`overflow-x=${overflowX}（期待: auto）`);
  }

  if (
    expected.everyFloorBelow !== undefined &&
    maxFloor >= expected.everyFloorBelow
  ) {
    problems.push(
      `最大の床=${maxFloor}px（期待: 全列 ${expected.everyFloorBelow}px 未満）`,
    );
  }
  if (expected.everyFloorAtLeast !== undefined) {
    const minFloor = Math.min(...result.floors);
    if (minFloor < expected.everyFloorAtLeast) {
      problems.push(
        `最小の床=${minFloor}px（期待: 全列 ${expected.everyFloorAtLeast}px 以上）`,
      );
    }
  }
  if (expected.someFloorAtLeast !== undefined) {
    if (maxFloor < expected.someFloorAtLeast) {
      problems.push(
        `最大の床=${maxFloor}px（期待: どれかの列が ${expected.someFloorAtLeast}px 以上）`,
      );
    }
    if (natural <= available) {
      problems.push(
        `前提崩れ: 収まる表を床ありとして測っている（自然幅 ${natural}px ≦ 読む列 ${available}px）`,
      );
    }
  }
  if (expected.maxOverflow !== undefined && overflow > expected.maxOverflow) {
    problems.push(`溢れ ${overflow}px（許容 ${expected.maxOverflow}px）`);
  }
  return problems;
}

/**
 * 印刷（紙）で列が失われないことを確かめる。
 *
 * 紙は横スクロールできないので、スクロール面に閉じ込めたままだと、はみ出した列が
 * そのまま消える（実測: 816px＝Letter 相当で2表が切れ、最大132px＝1列ぶん）。
 * `@media print` で床とスクロール面を打ち消しているが、その節を消しても画面側の
 * 検証は全て通ってしまうので、ここで見る。
 */
async function checkPrint(browser, baseUrl) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 816, height: 1056 });
  await page.goto(`${baseUrl}/blog/favicon-16px-readability-metrics`, {
    waitUntil: "load",
    timeout: 20000,
  });
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(60);
  const result = await page.evaluate(() => {
    const wrap = document.querySelector(".table-wrap");
    const scroller = wrap.querySelector(".table-scroll");
    const cell = scroller.querySelector("th, td");
    return {
      floor: Math.round(parseFloat(getComputedStyle(cell).minWidth) || 0),
      overflowX: getComputedStyle(scroller).overflowX,
      hintShown:
        getComputedStyle(wrap.querySelector(".table-scroll-hint")).display !==
        "none",
    };
  });
  await page.close();
  const problems = [];
  if (result.floor !== 0)
    problems.push(`床=${result.floor}px（紙では0にする）`);
  if (result.overflowX === "auto")
    problems.push("スクロール面が紙でも切り取る");
  if (result.hintShown) problems.push("画面用の案内が紙に出る");
  console.log(
    `\n印刷（816px 相当）\n  [${problems.length ? "FAIL" : "OK"}] 床=${result.floor}px ` +
      `overflow-x=${result.overflowX} 案内=${result.hintShown ? "出る" : "出ない"}` +
      (problems.length ? ` — ${problems.join(" / ")}` : ""),
  );
  return problems.length ? 1 : 0;
}

/**
 * 狭い画面で分割できない欧文語が列を押し広げないよう `overflow-wrap: anywhere` を
 * 効かせている。`normal` に戻すと 360px で11表が新たに溢れる（1〜139px）が、
 * 画面側の他の検証はすべて通ってしまうので、指定そのものを見る。
 */
async function checkOverflowWrap(browser, baseUrl) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(`${baseUrl}/blog/favicon-16px-readability-metrics`, {
    waitUntil: "load",
    timeout: 20000,
  });
  const result = await page.evaluate(() => {
    const cell = document.querySelector(".table-scroll th, .table-scroll td");
    const code = document.querySelector(".table-scroll code");
    return {
      cell: getComputedStyle(cell).overflowWrap,
      code: code ? getComputedStyle(code).overflowWrap : "normal",
    };
  });
  await page.close();
  const problems = [];
  if (result.cell !== "anywhere")
    problems.push(`セル=${result.cell}（期待: anywhere）`);
  // インラインコードは途中で折ると別の文字列に見えるので normal に戻してある
  if (result.code !== "normal")
    problems.push(`コード=${result.code}（期待: normal）`);
  console.log(
    `\n狭い画面の折り返し（360px）\n  [${problems.length ? "FAIL" : "OK"}] ` +
      `セル=${result.cell} コード=${result.code}` +
      (problems.length ? ` — ${problems.join(" / ")}` : ""),
  );
  return problems.length ? 1 : 0;
}

/**
 * 案内と、キーボード用の印が「溢れた表にだけ」付くことを確かめる。
 *
 * ここが無いと、案内の表示切替（`[data-scrollable] .table-scroll-hint`）を消しても、
 * `<TableScrollHint />` をページから外しても、単体テストも他の e2e も全部緑のまま通る
 * ——203表すべてで案内・tabindex・role・aria-label が消えるのに、何も落ちない。
 * DESIGN.md §4 に「切れていることは言葉で知らせる」を新設した以上、その当体が
 * 無言で消える経路を残さない。
 */
async function checkHint(browser, baseUrl) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(`${baseUrl}/blog/favicon-16px-readability-metrics`, {
    waitUntil: "load",
    timeout: 20000,
  });
  /*
   * クライアント処理（ハイドレーション後に印を付ける）を待つ。
   * 待てない＝印が一つも付いていない場合も、例外ではなく FAIL として報告する
   * （`<TableScrollHint />` をページから外した変異がここに来る）。
   */
  let marked = true;
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('.table-wrap[data-scrollable="true"]') !== null,
      { timeout: 10000 },
    );
  } catch {
    marked = false;
  }
  if (!marked) {
    await page.close();
    console.log(
      "\n案内とキーボードの印（360px）\n  [FAIL] 溢れた表に印が1つも付かない" +
        "（<TableScrollHint /> が動いていないか、印を付ける条件が壊れている）",
    );
    return 1;
  }
  const result = await page.evaluate(() => {
    const seen = { overflowing: null, fitting: null };
    for (const wrap of document.querySelectorAll(".table-wrap")) {
      const scroller = wrap.querySelector(".table-scroll");
      const hint = wrap.querySelector(".table-scroll-hint");
      const state = {
        marked: wrap.dataset.scrollable === "true",
        hintDisplay: getComputedStyle(hint).display,
        tabindex: scroller.getAttribute("tabindex"),
        role: scroller.getAttribute("role"),
        label: scroller.getAttribute("aria-label"),
      };
      const overflows = scroller.scrollWidth - scroller.clientWidth > 9;
      if (overflows && !seen.overflowing) seen.overflowing = state;
      if (!overflows && !seen.fitting) seen.fitting = state;
    }
    return seen;
  });
  await page.close();

  const problems = [];
  const over = result.overflowing;
  const fit = result.fitting;
  if (!over) problems.push("溢れた表が見つからない（前提崩れ）");
  else {
    if (!over.marked) problems.push("溢れた表に data-scrollable が付かない");
    if (over.hintDisplay === "none") problems.push("溢れた表で案内が出ない");
    if (over.tabindex !== "0")
      problems.push(`溢れた表の tabindex=${over.tabindex}`);
    if (over.role !== "region") problems.push(`溢れた表の role=${over.role}`);
    if (!over.label) problems.push("溢れた表に名前が無い");
  }
  if (!fit) problems.push("収まる表が見つからない（前提崩れ）");
  else {
    if (fit.marked) problems.push("収まる表に data-scrollable が付いている");
    if (fit.hintDisplay !== "none")
      problems.push("収まる表で案内が出る（嘘の案内）");
    if (fit.tabindex !== "-1")
      problems.push(`収まる表の tabindex=${fit.tabindex}`);
    if (fit.role) problems.push(`収まる表に role=${fit.role}`);
  }
  console.log(
    `\n案内とキーボードの印（360px）\n  [${problems.length ? "FAIL" : "OK"}] ` +
      `溢れた表: 案内=${over?.hintDisplay} tabindex=${over?.tabindex} role=${over?.role} / ` +
      `収まる表: 案内=${fit?.hintDisplay} tabindex=${fit?.tabindex}` +
      (problems.length ? ` — ${problems.join(" / ")}` : ""),
  );
  return problems.length ? 1 : 0;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  let failed = 0;
  let checked = 0;

  console.log("\n=== 表の床（セル最小幅）の出し分け ===");
  for (const testCase of CASES) {
    console.log(`\n${testCase.name} — ${testCase.slug}#${testCase.tableIndex}`);
    for (const expected of testCase.checks) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: expected.width, height: 900 });
      await page.goto(`${BASE_URL}/blog/${testCase.slug}`, {
        waitUntil: "load",
        timeout: 20000,
      });
      const result = await measure(page, testCase.tableIndex);
      await page.close();
      checked++;

      if (result.error) {
        console.log(`  [FAIL] ${expected.width}px: ${result.error}`);
        failed++;
        continue;
      }

      const problems = checkResult(result, expected);
      if (problems.length > 0) failed++;
      console.log(
        `  [${problems.length === 0 ? "OK" : "FAIL"}] ${expected.width}px ` +
          `床=[${result.floors}] ` +
          `溢れ=${result.overflow}px 自然幅=${result.natural}px 読む列=${result.available}px` +
          (problems.length ? ` — ${problems.join(" / ")}` : ""),
      );
    }
  }

  failed += await checkWideTable(browser, BASE_URL);
  checked++;
  failed += await checkPrint(browser, BASE_URL);
  checked++;
  failed += await checkOverflowWrap(browser, BASE_URL);
  checked++;
  failed += await checkHint(browser, BASE_URL);
  checked++;

  await browser.close();

  console.log("");
  if (failed === 0) {
    console.log(`PASS: ${checked} 通りすべてで床の出し分けが期待どおり`);
  } else {
    console.log(`FAIL: ${checked} 通り中 ${failed} 件が期待と違う`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
