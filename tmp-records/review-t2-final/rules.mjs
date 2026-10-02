import fs from 'fs'; import postcss from 'postcss';
const [,, file, ...sels] = process.argv;
if (!fs.existsSync(file)) { console.log(`## ${file}: FILE MISSING`); process.exit(0); }
const root = postcss.parse(fs.readFileSync(file,'utf8'));
for (const s of sels) {
  let found = false;
  root.walkRules(r => { if (r.selector.includes(s)) { found = true;
    const decls = r.nodes.filter(n=>n.type==='decl').map(d=>`${d.prop}: ${d.value}`).join('; ');
    const media = r.parent.type==='atrule' ? `@${r.parent.name} ${r.parent.params} ` : '';
    console.log(`  ${media}${r.selector} { ${decls} }`); } });
  if (!found) console.log(`  [${s}] NO RULE`);
}
