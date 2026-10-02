const { chromium } = require("../node_modules/playwright");
const fs = require("fs");
const path = require("path");
const os = require("os");
const EXE = "/opt/pw-browsers/chromium";

function withTimeout(p, ms, what) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout " + what)), ms))]);
}

/** big=true で既定の文字サイズを 32px にしたブラウザ。 */
async function openContext({ width, height, dark = false, big = false }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t56-"));
  if (big) {
    fs.mkdirSync(path.join(dir, "Default"), { recursive: true });
    fs.writeFileSync(path.join(dir, "Default", "Preferences"), JSON.stringify({ webkit: { webprefs: { default_font_size: 32 } } }));
  }
  const ctx = await chromium.launchPersistentContext(dir, {
    executablePath: EXE,
    headless: true,
    viewport: { width, height },
    colorScheme: dark ? "dark" : "light",
    deviceScaleFactor: 1,
  });
  const close = async () => { await ctx.close(); fs.rmSync(dir, { recursive: true, force: true }); };
  return { ctx, close };
}

async function settle(page) {
  await withTimeout(page.evaluate(async () => {
    const texts = [...document.querySelectorAll("h1,h2,h3")].map((h) => h.textContent).join("");
    await Promise.race([
      Promise.all([
        document.fonts.load('400 24px "Zen Antique"', texts),
        document.fonts.load('400 16px "IBM Plex Sans"', "0123456789()（）ABCabc"),
      ]),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 6000))]);
    return true;
  }), 20000, "fonts");
  await page.waitForTimeout(250);
}
module.exports = { openContext, settle, withTimeout };
