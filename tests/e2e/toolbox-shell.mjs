/**
 * ToolboxShell E2E 検証スクリプト（2.2.4 完了判定用）
 *
 * 実行方法:
 *   # 1. dev server を起動（別ターミナル）
 *   npm run dev
 *
 *   # 2. このスクリプトを実行（デフォルト: http://localhost:3000）
 *   node tests/e2e/toolbox-shell.mjs
 *
 *   # 別ポートや本番環境を指定する場合
 *   E2E_BASE_URL=http://localhost:4000 node tests/e2e/toolbox-shell.mjs
 *
 * 前提条件:
 *   - PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: Chromium バイナリのパス
 *     （未設定時は playwright-core の既定値を使用）
 *   - /storybook ページに「12. ToolboxShell」セクションが存在すること
 *
 * 検証項目:
 *   1. 使用モード初期確認（data-mode="view"）
 *   2. 使用モードでのタイルクリック → count 増加
 *   3. 「編集」ボタンクリック → data-mode="edit"
 *   4. 編集モード中に body.scroll-locked クラスが付与される
 *   5. 編集モード中のタイルクリック → count 不変（early return）
 *   6. 「完了」ボタンクリック → data-mode="view" 復帰
 *   7. 完了後に body から scroll-locked クラスが除去される
 *   8. elementFromPoint 検証（AP-I08）: オーバーレイがタイルクリックを阻害しない
 *      - タイル座標での elementFromPoint が overlay ではなくタイル要素を返す
 *   9. console エラーが 0 件（dnd-kit の既知 hydration 警告は除外）
 */

import pkg from "../../node_modules/playwright-core/index.js";
const { chromium } = pkg;

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // dnd-kit が SSR/クライアントで aria-describedby の ID を異なる値で生成するため
      // DndDescribedBy の hydration mismatch は既知の問題（Tile storybook section 11 由来）。
      // ToolboxShell の fixture タイルは単純な <button> であり dnd-kit に依存しない。
      if (
        text.includes("DndDescribedBy") ||
        text.includes("hydrated but some attributes")
      ) {
        return; // 既知の dnd-kit hydration 警告はスキップ
      }
      consoleErrors.push(text);
    }
  });

  // /storybook を開いて ToolboxShell セクションへスクロール
  await page.goto(`${BASE_URL}/storybook`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const el = document.getElementById("toolbox-shell");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(300);

  // --- 1. 初期 data-mode="view" ---
  const initialMode = await page.getAttribute(
    '[data-testid="toolbox-shell"]',
    "data-mode",
  );
  assert(initialMode === "view", '1. 初期 data-mode="view"');

  // --- 2. 使用モードでタイルクリック → count 増加 ---
  const countBefore = await page.textContent('[data-testid="fixture-count"]');
  await page.click('[data-testid="fixture-tile-タイル A"]');
  const countAfterView = await page.textContent(
    '[data-testid="fixture-count"]',
  );
  assert(
    parseInt(countAfterView) === parseInt(countBefore) + 1,
    "2. 使用モードのタイルクリックで count が増加する",
  );

  // --- 3. 「編集」ボタンクリック → data-mode="edit" ---
  await page.click('button[aria-label="道具箱を編集モードにする"]');
  await page.waitForTimeout(150);
  const editMode = await page.getAttribute(
    '[data-testid="toolbox-shell"]',
    "data-mode",
  );
  assert(editMode === "edit", '3. 編集ボタン後 data-mode="edit"');

  // --- 4. 編集モード中に body.scroll-locked クラス付与 ---
  const bodyClassEdit = await page.evaluate(() => document.body.className);
  assert(
    bodyClassEdit.includes("scroll-locked"),
    "4. 編集モード中 body.scroll-locked クラスあり",
  );

  // --- 5. 編集モード中タイルクリック → count 不変（early return） ---
  const countBeforeEdit = await page.textContent(
    '[data-testid="fixture-count"]',
  );
  await page.click('[data-testid="fixture-tile-タイル A"]');
  const countAfterEdit = await page.textContent(
    '[data-testid="fixture-count"]',
  );
  assert(
    countBeforeEdit === countAfterEdit,
    "5. 編集モード中タイルクリックで count が変わらない（early return）",
  );

  // --- 6. 「完了」ボタンクリック → data-mode="view" 復帰 ---
  await page.click('button[aria-label="編集を完了して使用モードに戻る"]');
  await page.waitForTimeout(150);
  const viewMode = await page.getAttribute(
    '[data-testid="toolbox-shell"]',
    "data-mode",
  );
  assert(viewMode === "view", '6. 完了後 data-mode="view" 復帰');

  // --- 7. 完了後 scroll-locked 除去 ---
  const bodyClassView = await page.evaluate(() => document.body.className);
  assert(
    !bodyClassView.includes("scroll-locked"),
    "7. 完了後 body から scroll-locked 除去",
  );

  // --- 8. elementFromPoint 検証（AP-I08） ---
  // 再度編集モードへ
  await page.click('button[aria-label="道具箱を編集モードにする"]');
  await page.waitForTimeout(150);

  // タイル A の中心座標を取得
  const tileRect = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="fixture-tile-タイル A"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  if (tileRect) {
    const elAtPoint = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return {
        testid: el?.getAttribute("data-testid") ?? null,
        tag: el?.tagName ?? null,
      };
    }, tileRect);
    // タイル A の testid と完全一致することを確認（overlay が阻害していない）
    assert(
      elAtPoint.testid === "fixture-tile-タイル A",
      `8. elementFromPoint がオーバーレイではなくタイル要素を返す（got testid="${elAtPoint.testid}"）`,
    );
  } else {
    assert(false, "8. タイル A の getBoundingClientRect が取得できなかった");
  }

  // オーバーレイ上の点（タイル外領域）でも pointer-events が通過することを確認
  // ToolboxShell の root 左上角付近（タイルが存在しない領域）でのテスト
  const overlayAreaEl = await page.evaluate(() => {
    const shell = document.querySelector('[data-testid="toolbox-shell"]');
    if (!shell) return null;
    const r = shell.getBoundingClientRect();
    // ツールバー下・タイル上の余白領域（x: left+10, y: top+30）
    const el = document.elementFromPoint(r.left + 10, r.top + 30);
    return { tag: el?.tagName ?? null, className: el?.className ?? "" };
  });
  // overlay は pointer-events: none なので overlay 要素自体が返ることはない
  // （overlay の CSS class 名に "overlay" が含まれていないか確認）
  assert(
    !overlayAreaEl?.className?.includes("overlay"),
    "8b. オーバーレイ領域で elementFromPoint がオーバーレイ要素を返さない（pointer-events: none 確認）",
  );

  // --- 9. console エラー 0 件 ---
  assert(
    consoleErrors.length === 0,
    `9. console エラー 0 件（got ${consoleErrors.length} errors）`,
  );

  await browser.close();

  console.log(
    `\n=== ToolboxShell E2E 検証完了: ${passed} passed / ${failed} failed ===`,
  );
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
