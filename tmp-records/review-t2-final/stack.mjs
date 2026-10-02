import { chromium } from 'playwright';
// stack images vertically into one png: node stack.mjs out.png a.png b.png ...
const [out, ...ins] = process.argv.slice(2);
const fs = await import('fs');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
const imgs = ins.map(f => `<div style="font:12px sans-serif">${f.split('/').pop()}</div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="display:block;margin-bottom:6px">`).join('');
await p.setContent(`<body style="margin:4px;background:#888;display:inline-block">${imgs}</body>`);
await p.waitForTimeout(200);
await (await p.$('body')).screenshot({ path: out });
await b.close();
