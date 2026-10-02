import { chromium } from 'playwright';
const [scheme, w, slug, tag] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: +w, height: 800 }, colorScheme: scheme });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`http://localhost:3955/play/${slug}`, { waitUntil: 'networkidle' });
const P = (n) => `tmp/review-t2-final/${tag}-${scheme}-${w}-${n}.png`;
await page.screenshot({ path: P('0start') });
// keyboard: tab to start
await page.getByRole('button', { name: /はじめる/ }).focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.screenshot({ path: P('1q1') });
let i = 0;
while (i < 40) {
  const choices = page.locator('[data-hit-area], button').filter({ hasNot: page.locator('svg') });
  const q = await page.locator('main').innerText();
  if (/結果|あなたは|タイプ/.test(q) && !(await page.getByRole('button', { name: /次へ/ }).count()) && i > 3 && (await page.locator('ol button, ul button').count()) === 0) break;
  // click first choice
  const choice = page.locator('main [data-hit-area]').first();
  if (!(await choice.count())) break;
  if (i === 1) { await choice.hover(); await page.screenshot({ path: P('2hover') }); }
  if (i === 2) { await page.keyboard.press('Tab'); }
  await choice.click();
  await page.waitForTimeout(250);
  if (i === 0) await page.screenshot({ path: P('3answered') });
  const next = page.getByRole('button', { name: /次へ|結果を見る/ });
  if (await next.count()) { if (i===0) await page.screenshot({ path: P('3b-next') }); await next.first().click(); await page.waitForTimeout(250); }
  i++;
}
await page.waitForTimeout(800);
await page.screenshot({ path: P('9result') });
FULL: await page.screenshot({ path: P('9result-full'), fullPage: true });
console.log('steps', i, 'url', page.url(), 'errors', errs);
await browser.close();
