const fs=require("fs");
const rd=(f)=>fs.readFileSync(f,"utf8").trim().split("\n").map(JSON.parse);
for (const m of ["natural","top"]) {
  const B=rd(`res2-before-${m}.jsonl`), A=rd(`res2-after-${m}.jsonl`);
  for (let i=0;i<B.length;i++){ const b=B[i], a=A[i];
    const key=`${m} ${b.game} ${b.w} r${b.run}`;
    const sig=(o)=>o.steps.map(s=>`${s.action}:${s.sb.join("/")}@${s.y}`).join(" ");
    const same=sig(a)===sig(b);
    const nsb=b.steps.reduce((n,s)=>n+s.sb.length,0);
    const errs=(o)=>[...new Set(o.errors.filter(e=>!/^404 \/(dictionary|blog|play\/daily|tools\/|about|privacy|memos|play\/[a-z-]+\?_rsc)|Failed to load resource: the server responded with a status of 404/.test(e)))];
    console.log(key, same?"SAME":"DIFF", "scrollBy回数",nsb, "最終y",b.steps.at(-1).y,a.steps.at(-1).y, "fatal",b.fatal||"",a.fatal||"", "errB",JSON.stringify(errs(b)),"errA",JSON.stringify(errs(a)), "copyA",a.copy?.status?.split("|").at(-1), a.copy?.copied?.map(c=>c.len+":"+c.parent).join(","), "dy",a.copy?.dy, "reopenA",a.reopen?.share, a.reopen?.y, "reopenB", b.reopen?.y);
    if(!same){console.log(" B",sig(b));console.log(" A",sig(a));}
  }
}
