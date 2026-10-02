import { colorDifference, calculateRoundScore } from "../../../src/play/games/irodori/_lib/engine";
import colors from "../../../src/data/traditional-colors.json";
const clamp=(v:number,max:number)=>Math.max(0,Math.min(max,v));
function stats(arr:number[]){const s=[...arr].sort((a,b)=>a-b);const mean=arr.reduce((a,b)=>a+b,0)/arr.length;return {mean:mean.toFixed(2),p90:s[Math.floor(0.9*(s.length-1))].toFixed(1),max:s[s.length-1].toFixed(1),n:arr.length};}
function run(name:string, f:(h:number,s:number,l:number,sign:number)=>[number,number,number]){
  const losses:number[]=[];const lossesRaw:number[]=[];
  for(const c of colors as any[]){const [h,s,l]=c.hsl;
    for(const sign of [1,-1]){const [h2,s2,l2]=f(h,s,l,sign);
      const d=colorDifference(h,s,l,h2,s2,l2);
      losses.push(100-calculateRoundScore(d)); lossesRaw.push(2*d);}}
  console.log(name, "rounded", JSON.stringify(stats(losses)), "raw", JSON.stringify(stats(lossesRaw)));
}
const wrap=(h:number)=>((h%360)+360)%360;
run("H1",(h,s,l,g)=>[wrap(h+g),s,l]);
run("H2",(h,s,l,g)=>[wrap(h+2*g),s,l]);
run("L1",(h,s,l,g)=>[h,s,clamp(l+g,100)]);
run("L2",(h,s,l,g)=>[h,s,clamp(l+2*g,100)]);
run("S2",(h,s,l,g)=>[h,clamp(s+2*g,100),l]);
run("H2S1L1 same sign",(h,s,l,g)=>[wrap(h+2*g),clamp(s+g,100),clamp(l+g,100)]);
// mixed signs: all 8 combos
{const losses:number[]=[];for(const c of colors as any[]){const [h,s,l]=c.hsl;for(const a of[1,-1])for(const b of[1,-1])for(const d of[1,-1]){const x=colorDifference(h,s,l,wrap(h+2*a),clamp(s+b,100),clamp(l+d,100));losses.push(100-calculateRoundScore(x));}}console.log("H2S1L1 all 8 signs", JSON.stringify(stats(losses)));}
// 97px track: 1px = H ~4.4 (360/ (97-16)) etc
const trackPx=(w:number)=>w-16;
for(const w of [188,97]){const p=trackPx(w);console.log(w,"px track: H per px",(360/p).toFixed(2),"SL per px",(100/p).toFixed(2));}
