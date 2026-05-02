/**
 * cycle-175 2.2.10 視覚検証スクリプト
 *
 * /toolbox-preview と /storybook の各コンポーネントを
 * 複数の viewport × ライト/ダークモードで撮影する。
 *
 * 実行方法:
 *   node tests/e2e/toolbox-visual-screenshots.mjs
 *
 * 環境変数:
 *   E2E_BASE_URL - ベースURL（デフォルト: http://localhost:3099）
 *   SCREENSHOT_DIR - 保存先（デフォルト: tmp/cycle-175-tile-screenshots）
 */

import pkg from "../../node_modules/playwright-core/index.js";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
const { chromium } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const SCREENSHOT_DIR =
  process.env.SCREENSHOT_DIR ??
  path.join(__dirname, "../../tmp/cycle-175-tile-screenshots");

mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "w360", width: 360, height: 800 },
  { name: "w600", width: 600, height: 900 },
  { name: "w1280", width: 1280, height: 900 },
];

async function takeScreenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  Saved: ${filePath}`);
  return filePath;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });

  const screenshots = [];

  for (const vp of VIEWPORTS) {
    // --- ライトモード ---
    const ctxLight = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: "light",
    });
    const pageLight = await ctxLight.newPage();

    // /toolbox-preview: 使用モード
    await pageLight.goto(`${BASE_URL}/toolbox-preview`, {
      waitUntil: "networkidle",
    });
    await pageLight.waitForTimeout(500);
    const name1 = `${vp.name}-light-toolbox-view`;
    screenshots.push(await takeScreenshot(pageLight, name1));

    // /toolbox-preview: 編集モード
    const editBtn = pageLight.locator(
      'button[aria-label="道具箱を編集モードにする"]',
    );
    const editBtnCount = await editBtn.count();
    if (editBtnCount > 0) {
      await editBtn.click();
      await pageLight.waitForTimeout(500);
    }
    screenshots.push(
      await takeScreenshot(pageLight, `${vp.name}-light-toolbox-edit`),
    );

    // EditMode: TileMoveButtons の small タイル popover（存在する場合）
    const expandBtns = pageLight.locator('button[aria-label="移動操作を展開"]');
    const expandCount = await expandBtns.count();
    if (expandCount > 0) {
      await expandBtns.first().click();
      await pageLight.waitForTimeout(300);
      screenshots.push(
        await takeScreenshot(pageLight, `${vp.name}-light-small-popover`),
      );
      // 閉じる
      const closeBtn = pageLight.locator(
        'button[aria-label="移動操作を閉じる"]',
      );
      if ((await closeBtn.count()) > 0) {
        await closeBtn.click();
        await pageLight.waitForTimeout(200);
      }
    }

    await ctxLight.close();

    // --- ダークモード ---
    const ctxDark = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: "dark",
    });
    const pageDark = await ctxDark.newPage();

    await pageDark.goto(`${BASE_URL}/toolbox-preview`, {
      waitUntil: "networkidle",
    });
    await pageDark.waitForTimeout(500);
    screenshots.push(
      await takeScreenshot(pageDark, `${vp.name}-dark-toolbox-view`),
    );

    // 編集モード
    const editBtnDark = pageDark.locator(
      'button[aria-label="道具箱を編集モードにする"]',
    );
    if ((await editBtnDark.count()) > 0) {
      await editBtnDark.click();
      await pageDark.waitForTimeout(500);
    }
    screenshots.push(
      await takeScreenshot(pageDark, `${vp.name}-dark-toolbox-edit`),
    );

    await ctxDark.close();
  }

  // /storybook ページ全体
  const ctxStory = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
  });
  const pageStory = await ctxStory.newPage();
  await pageStory.goto(`${BASE_URL}/storybook`, { waitUntil: "networkidle" });
  await pageStory.waitForTimeout(500);
  screenshots.push(
    await takeScreenshot(pageStory, "w1280-light-storybook-top"),
  );

  // Tile セクションへスクロール
  await pageStory.evaluate(() => {
    const el = document.getElementById("tile");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await pageStory.waitForTimeout(300);
  screenshots.push(
    await takeScreenshot(pageStory, "w1280-light-storybook-tile-section"),
  );

  // TileGrid セクションへスクロール
  await pageStory.evaluate(() => {
    const el = document.getElementById("tile-grid");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await pageStory.waitForTimeout(300);
  screenshots.push(
    await takeScreenshot(pageStory, "w1280-light-storybook-tilegrid-section"),
  );

  // ToolboxShell セクションへスクロール
  await pageStory.evaluate(() => {
    const el = document.getElementById("toolbox-shell");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await pageStory.waitForTimeout(300);
  screenshots.push(
    await takeScreenshot(
      pageStory,
      "w1280-light-storybook-toolboxshell-section",
    ),
  );

  await ctxStory.close();

  await browser.close();

  console.log(
    `\n=== 視覚検証スクリーンショット完了: ${screenshots.length} 件 ===`,
  );
  console.log("保存先:", SCREENSHOT_DIR);
  for (const s of screenshots) {
    console.log(" -", s);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
