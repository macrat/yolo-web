import q from "../../src/play/quiz/data/character-personality";
const out = q.results.map((r:any)=>({id:r.id,title:r.title,desc:r.description,catch:(r as any).detailedContent?.catchphrase}));
console.log(JSON.stringify(out));
