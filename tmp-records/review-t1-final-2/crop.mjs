import sharp from "sharp";
const [,, file, h] = process.argv;
const img = sharp(file); const m = await img.metadata();
await sharp(file).extract({ left: 0, top: 0, width: m.width, height: Math.min(m.height, Number(h)) }).toFile(file.replace(/\.png$/, `-top${h}.png`));
console.log(m.width, m.height);
