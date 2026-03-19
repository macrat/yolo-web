import { chromium } from "playwright";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const url = process.argv[2];
if (!url) {
  console.error("Usage: npx tsx take.ts <URL> [--selector <CSS selector>]");
  process.exit(1);
}

const selectorIndex = process.argv.indexOf("--selector");
const selector = selectorIndex !== -1 ? process.argv[selectorIndex + 1] : null;
if (selectorIndex !== -1 && !selector) {
  console.error("--selector requires a CSS selector argument");
  process.exit(1);
}

const widths = [1920, 1536, 1280, 720, 440, 360];

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function sanitizeUrl(url: string): string {
  return url
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const outDir = path.join("tmp", "screenshots");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const timestamp = getTimestamp();
  const sanitized = sanitizeUrl(url);

  for (const width of widths) {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" });
    const sanitizedSelector = selector
      ? `_sel-${selector
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")}`
      : "";
    const filename = `${timestamp}_${sanitized}${sanitizedSelector}_w${width}.jpg`;
    const filepath = path.join(outDir, filename);
    if (selector) {
      const element = page.locator(selector).first();
      await element.screenshot({ type: "jpeg", path: filepath });
    } else {
      await page.screenshot({ type: "jpeg", fullPage: true, path: filepath });
    }
    const { width: imgW, height: imgH } = await sharp(filepath).metadata();
    console.log(`Saved: ${filepath} (${imgW}x${imgH}px)`);
    await page.close();
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
