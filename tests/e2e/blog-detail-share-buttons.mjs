/**
 * e2e: ブログ詳細ページの ShareButtons 物理サイズ計測
 *
 * WCAG 2.5.5 で要求される 44×44px 最小タッチターゲットを
 * Playwright の実ブラウザで物理測定する。
 * CSS Modules でのスタイル適用が正しく機能していることも保証する。
 *
 * 測定対象: X / LINE / はてブ / コピー の 4 ボタン
 * 条件: SP 390×844（タッチデバイス想定）
 *
 * 実行方法:
 *   node tests/e2e/blog-detail-share-buttons.test.mjs
 *
 * 前提: http://localhost:3001 でビルド済みアプリが起動していること
 */

import { chromium } from "/mnt/data/yolo-web/node_modules/playwright/index.mjs";

const BASE_URL = "http://localhost:3001";
// headings を持つ記事スラグ（TOC 表示でレイアウトが完全な状態）
const BLOG_SLUG = "five-failures-and-lessons-from-ai-agents";
const MIN_TOUCH_SIZE = 44; // WCAG 2.5.5

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // SP 390×844 で計測
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/blog/${BLOG_SLUG}`, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await page.waitForTimeout(300);

  const results = await page.evaluate((minSize) => {
    // ShareButtons セクション内のボタン・リンクを取得
    const shareSection = document.querySelector(
      '[aria-label="この記事をシェア"]',
    );
    if (!shareSection) return { error: "shareSection not found" };

    // ボタンとリンク（<a> を含む）を取得
    const buttons = Array.from(
      shareSection.querySelectorAll("button, a[href]"),
    );
    if (buttons.length === 0) return { error: "no share buttons found" };

    const measurements = buttons.map((btn) => {
      const r = btn.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      return {
        text:
          btn.textContent?.trim().substring(0, 20) ||
          btn.getAttribute("aria-label") ||
          "",
        width: w,
        height: h,
        widthOk: w >= minSize,
        heightOk: h >= minSize,
      };
    });

    return { measurements };
  }, MIN_TOUCH_SIZE);

  await browser.close();

  if (results.error) {
    console.error("ERROR:", results.error);
    process.exit(1);
  }

  let allPassed = true;
  console.log(`\n=== ShareButtons 物理サイズ測定 (SP 390×844) ===`);
  console.log(
    `最小タッチサイズ要件: ${MIN_TOUCH_SIZE}×${MIN_TOUCH_SIZE}px (WCAG 2.5.5)`,
  );
  console.log("");

  for (const m of results.measurements) {
    const wStatus = m.widthOk ? "OK" : "FAIL";
    const hStatus = m.heightOk ? "OK" : "FAIL";
    if (!m.widthOk || !m.heightOk) allPassed = false;
    console.log(
      `  [${hStatus}] "${m.text}": ${m.width}×${m.height}px (w:${wStatus}, h:${hStatus})`,
    );
  }

  console.log("");
  if (allPassed) {
    console.log(
      `PASS: 全 ${results.measurements.length} ボタンが ${MIN_TOUCH_SIZE}px 以上`,
    );
  } else {
    console.log(`FAIL: ${MIN_TOUCH_SIZE}px 未満のボタンが存在する`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
