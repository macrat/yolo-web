import opentype from "opentype.js";
import sharp from "sharp";
import fs from "node:fs";
for (const w of ["Regular","Bold"]) {
  const buf = fs.readFileSync(`src/fonts/ibm-plex-sans/IBMPlexSans-${w}.woff`);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength));
  // glyph box ~ 80% of 100 tile height
  let p = font.getPath("y",0,0,100); let bb=p.getBoundingBox();
  const h = bb.y2-bb.y1; const px = 100*80/h;
  p = font.getPath("y",0,0,px); bb=p.getBoundingBox();
  const dx=50-(bb.x1+bb.x2)/2, dy=50-(bb.y1+bb.y2)/2;
  const d=font.getPath("y",dx,dy,px).toPathData(3);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#000"/><path d="${d}" fill="#fff"/></svg>`;
  // stroke width in tile units: horizontal run at mid of left arm
  const big = await sharp(Buffer.from(svg),{density:720}).resize(1000,1000).raw().toBuffer({resolveWithObject:true});
  const W=1000; const row=Math.round(350); let runs=[],cur=0;
  for(let x=0;x<W;x++){const v=big.data[(row*W+x)*big.info.channels]; if(v>128)cur++; else if(cur){runs.push(cur);cur=0;}}
  console.log(w,"fontPx(per100)",px.toFixed(1),"white runs at y=35%(in 1/10 units):",runs.map(r=>r/10));
  const s16 = await sharp(Buffer.from(svg)).resize(16,16).raw().toBuffer({resolveWithObject:true});
  let out="";for(let y=0;y<16;y++){for(let x=0;x<16;x++){const v=s16.data[(y*16+x)*s16.info.channels];out+=v>200?"#":v>120?"+":v>50?".":" ";}out+="\n";}
  console.log(out);
}
