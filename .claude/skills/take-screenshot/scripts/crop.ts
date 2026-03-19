import sharp from "sharp";
import * as path from "path";
import * as fs from "fs";

const filePath = process.argv[2];
const geometry = process.argv[3];

if (!filePath || !geometry) {
  console.error("Usage: npx tsx crop.ts <filepath> <width>x<height>+<x>+<y>");
  process.exit(1);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

const match = geometry.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
if (!match) {
  console.error("Invalid geometry format. Use: <width>x<height>+<x>+<y>");
  process.exit(1);
}

const w = Number(match[1]);
const h = Number(match[2]);
const x = Number(match[3]);
const y = Number(match[4]);

async function main() {
  const ext = path.extname(absPath);
  const base = absPath.slice(0, -ext.length);
  const outPath = `${base}_${w}x${h}+${x}+${y}.jpg`;

  await sharp(absPath)
    .extract({ left: x, top: y, width: w, height: h })
    .jpeg()
    .toFile(outPath);

  console.log(`Saved: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
