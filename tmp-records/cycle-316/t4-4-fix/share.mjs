// T4-4 の直し: 共有のボタンの見え方・名前・計測・開く URL を面ごとに記録する（tmp/t4-4-share.mjs に、
// kanji-kanaru・yoji-kimeru の結果を足したもの）。
// 使い方: node tmp/cycle-316/t4-4-fix/share.mjs <baseUrl> <outDir> [surfaces]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [, , BASE, OUT] = process.argv;
fs.mkdirSync(OUT, { recursive: true });

const SHARE_RE =
  /^(X でシェア|LINE でシェア|はてブに追加|URLをコピー|結果をコピー|この結果をシェア|シェア|画像を保存)$/;

const INIT = (webShare) => `
(() => {
  let s = 20260926;
  Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.__rec = { opened: [], copied: [], shared: [], gtag: [] };
  window.open = (u) => { window.__rec.opened.push(String(u)); return null; };
  const rec = (...a) => { window.__rec.gtag.push(JSON.parse(JSON.stringify(a))); };
  Object.defineProperty(window, "gtag", { get: () => rec, set: () => {}, configurable: false });
  const clip = { writeText: async (t) => { window.__rec.copied.push(t); } };
  Object.defineProperty(Navigator.prototype, "clipboard", { get: () => clip, configurable: true });
  ${
    webShare
      ? `Navigator.prototype.share = async function (d) { window.__rec.shared.push(d); };`
      : `delete Navigator.prototype.share;`
  }
})();`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function closeDialogs(page) {
  for (let i = 0; i < 3; i++) {
    const open = await page.evaluate(() => !!document.querySelector("dialog[open]"));
    if (!open) return;
    await page.keyboard.press("Escape");
    await wait(300);
  }
}

async function shareVisible(page) {
  return page.evaluate((re) => {
    const r = new RegExp(re);
    return [...document.querySelectorAll("button")].some(
      (b) => r.test(b.textContent.trim()) && b.offsetParent !== null,
    );
  }, SHARE_RE.source);
}

const flows = {
  async quizSolved(page) {
    await page.goto(`${BASE}/play/character-personality?ref=blazing-poet`);
    await page.getByRole("button", { name: "はじめる" }).click();
    for (let i = 0; i < 60; i++) {
      const next = page.getByRole("button", { name: "次へ" });
      if (await next.count()) await next.first().click();
      else {
        const choice = page.locator('ul[data-text-box="rows"] li button');
        if (!(await choice.count())) break;
        await choice.first().click();
      }
      await wait(150);
    }
    await wait(1500);
  },
  async resultPage(page) {
    await page.goto(`${BASE}/play/character-personality/result/blazing-poet`);
  },
  async fortuneResult(page) {
    await page.goto(`${BASE}/play/character-fortune/result/commander`);
  },
  async daily(page) {
    await page.goto(`${BASE}/play/daily`);
    await wait(1000);
  },
  async nakamawake(page) {
    await page.goto(`${BASE}/play/nakamawake`);
    await wait(1000);
    await closeDialogs(page);
    for (let round = 0; round < 8; round++) {
      if (await page.evaluate(() => !!document.querySelector("dialog[open]"))) break;
      const words = page.locator("button[aria-pressed]");
      const n = await words.count();
      if (n < 4) break;
      // 毎回ちがう4語を選ぶ（はずれを重ねてゲームを終える）
      const picks = [0, 1, 2, 3].map((k) => (k * 3 + round) % n);
      const uniq = [...new Set(picks)];
      for (let k = 0; uniq.length < 4; k++) if (!uniq.includes(k)) uniq.push(k);
      for (const k of uniq) await words.nth(k).click();
      await page.getByRole("button", { name: "チェック" }).click();
      await wait(1200);
    }
    await wait(1500);
  },
  async irodori(page) {
    await page.goto(`${BASE}/play/irodori`);
    await wait(1000);
    await closeDialogs(page);
    for (let r = 0; r < 5; r++) {
      await page.getByRole("button", { name: "決定" }).click();
      await wait(600);
      const next = page.getByRole("button", { name: "次の問題へ" });
      if (await next.count()) await next.click();
      await wait(400);
    }
    const see = page.getByRole("button", { name: "結果を見る" });
    const dialogOpen = await page.evaluate(() => !!document.querySelector("dialog[open]"));
    if (!dialogOpen && (await see.count())) await see.click();
    await wait(1500);
  },
  async kanjiGame(page) {
    await page.addInitScript(() => {
      const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      const wrong = { guess: "山", radical: "wrong", strokeCount: "wrong", grade: "close", gradeDirection: "up", onYomi: "wrong", category: "wrong", kunYomiCount: "correct" };
      const feedbacks = Array.from({ length: 6 }, () => ({ ...wrong }));
      localStorage.setItem("kanji-kanaru-first-visit", "1");
      localStorage.setItem("kanji-kanaru-difficulty", "intermediate");
      localStorage.setItem("kanji-kanaru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("山"), feedbacks, status: "lost", guessCount: 6 } }));
    });
    await page.goto(`${BASE}/play/kanji-kanaru`);
    await wait(3000);
  },
  async yojiGame(page) {
    await page.addInitScript(() => {
      const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      const feedbacks = Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] }));
      localStorage.setItem("yoji-kimeru-first-visit", "1");
      localStorage.setItem("yoji-kimeru-difficulty", "intermediate");
      localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks, status: "lost", guessCount: 6 } }));
    });
    await page.goto(`${BASE}/play/yoji-kimeru`);
    await wait(3000);
  },
  async gamePage(page) {
    await page.goto(`${BASE}/play/kanji-kanaru`);
    await wait(1000);
    await closeDialogs(page);
  },
  async blog(page) {
    await page.goto(`${BASE}/blog/personality-quiz-tie-enumeration`);
  },
  async tool(page) {
    await page.goto(`${BASE}/tools/char-count`);
  },
  async kanji(page) {
    await page.goto(`${BASE}/dictionary/kanji/%E6%B0%B4`);
  },
  async humor(page) {
    await page.goto(`${BASE}/dictionary/humor/morning`);
  },
};

// 共有のボタンの並びを探し、並びごとに印を付けて、文言と名前を返す。
async function markGroups(page) {
  return page.evaluate((re) => {
    const r = new RegExp(re);
    const groups = new Map();
    // 開いたダイアログがあれば、押せるのはその中だけ
    const scope = document.querySelector("dialog[open]") ?? document;
    for (const b of scope.querySelectorAll("button")) {
      if (!r.test(b.textContent.trim()) || b.offsetParent === null) continue;
      const g = b.parentElement;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(b);
    }
    return [...groups.entries()].map(([g, bs], i) => {
      g.setAttribute("data-t44", String(i));
      const heading = (() => {
        let el = g;
        for (let d = 0; d < 6 && el; d++, el = el.parentElement) {
          const h = el.querySelector("h2,h3");
          if (h) return h.textContent.trim();
        }
        return "";
      })();
      return {
        index: i,
        heading,
        buttons: bs.map((b) => ({
          text: b.textContent.trim(),
          name: b.getAttribute("aria-label") ?? b.textContent.trim(),
        })),
        status: g.parentElement.querySelector('[role="status"]')?.textContent ?? null,
      };
    });
  }, SHARE_RE.source);
}

async function run(surface, webShare) {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  await context.addInitScript(INIT(webShare));
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const out = { surface, webShare };
  try {
    await flows[surface](page);
    // 端末の共有シートの有無はハイドレーションのあとに決まる
    await wait(2000);
    out.shareVisible = await shareVisible(page);
    out.groups = await markGroups(page);
    out.aria = [];
    for (const g of out.groups) {
      out.aria.push(await page.locator(`[data-t44="${g.index}"]`).ariaSnapshot());
    }
    if (!webShare) {
      for (const [w, h] of [
        [375, 667],
        [1280, 800],
      ]) {
        await page.setViewportSize({ width: w, height: h });
        for (const scheme of ["light", "dark"]) {
          await page.emulateMedia({ colorScheme: scheme });
          for (const g of out.groups) {
            const loc = page.locator(`[data-t44="${g.index}"]`);
            await loc.evaluate((el) => el.scrollIntoView({ block: "center" }));
            await wait(250);
            await page.screenshot({
              path: path.join(OUT, `${surface}-g${g.index}-${w}-${scheme}.png`),
            });
          }
        }
      }
      await page.emulateMedia({ colorScheme: "light" });
    }
    // 押して、送る計測の値と開く URL を記録する
    out.clicks = [];
    for (const g of out.groups) {
      for (const b of g.buttons) {
        if (b.text === "画像を保存") continue;
        await page.evaluate(() => {
          window.__rec.opened = [];
          window.__rec.copied = [];
          window.__rec.shared = [];
          window.__rec.gtag = [];
        });
        const loc = page.locator(`[data-t44="${g.index}"] button`, { hasText: b.text }).first();
        try {
          await loc.click({ timeout: 3000 });
        } catch (e) {
          out.clickErrors = [...(out.clickErrors ?? []), `${g.index}:${b.text}`];
          continue;
        }
        await wait(400);
        const rec = await page.evaluate(() => window.__rec);
        const status = await page
          .locator(`[data-t44="${g.index}"]`)
          .evaluate((el) => el.parentElement.querySelector('[role="status"]')?.textContent ?? null);
        out.clicks.push({
          group: g.index,
          button: b.text,
          opened: rec.opened,
          copied: rec.copied,
          shared: rec.shared,
          gtag: rec.gtag.filter((a) => a[0] === "event" && a[1] === "share"),
          status,
        });
      }
    }
  } catch (e) {
    out.error = String(e);
  }
  await browser.close();
  return out;
}

const only = process.argv[4] ? process.argv[4].split(",") : Object.keys(flows);
const results = [];
for (const s of only) {
  results.push(await run(s, false));
  if (["quizSolved", "resultPage", "fortuneResult", "daily", "nakamawake", "irodori", "kanjiGame", "yojiGame"].includes(s)) {
    results.push(await run(s, true));
  }
  console.log("done", s);
}
const recordPath = path.join(OUT, "record.json");
const previous = fs.existsSync(recordPath) ? JSON.parse(fs.readFileSync(recordPath, "utf8")) : [];
const merged = [
  ...previous.filter((p) => !results.some((r) => r.surface === p.surface && r.webShare === p.webShare)),
  ...results,
];
fs.writeFileSync(recordPath, JSON.stringify(merged, null, 2));
