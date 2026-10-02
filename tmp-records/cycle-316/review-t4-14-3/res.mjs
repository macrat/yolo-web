import { open, close, settle, URL, DIR, SEEDS } from "./lib.mjs";
const o = await open({ width: 320, height: 667, font: 32, storage: SEEDS.done }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 800);
await p.locator("table").first().evaluate((t) => t.scrollIntoView({ block: "start" }));
await p.screenshot({ path: `${DIR}/shots/reopen-table-320-32.png` });
await p.getByRole("heading", { name: "この結果を共有" }).evaluate((t) => t.scrollIntoView({ block: "start" }));
await p.screenshot({ path: `${DIR}/shots/reopen-share-320-32.png` });
await close(o);
