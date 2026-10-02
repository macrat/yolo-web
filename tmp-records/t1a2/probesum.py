import json,collections,statistics as st
V={'http://localhost:3000':'before','http://localhost:3201':'S-optional','http://localhost:3202':'S-swap'}
by=collections.defaultdict(list)
for l in open('probe.jsonl'):
    d=json.loads(l); by[(d['net'],d['path'],V[d['base']])].append(d)
def webfont(used): return used and ('*' in used)
for k in sorted(by):
    rs=by[k]
    fcp=st.median([r['fcp'] or 0 for r in rs]); lcp=st.median([r['lcp'] for r in rs]); cls=st.median([r['cls'] for r in rs])
    h=sum(1 for r in rs if 'Zen Antique*' in (r['used'].get('h1') or '')); p=sum(1 for r in rs if 'BIZ UDPGothic*' in (r['used'].get('p') or ''))
    fend=st.median([max([f[2] for f in r['fonts']] or [0]) for r in rs])
    print(f"{k[0]:8s} {k[1][:32]:32s} {k[2]:10s} n={len(rs)} FCP {fcp:5.0f} LCP {lcp:5.0f} CLS {cls:.3f} fonts_done {fend:5.0f} h1=Zen {h}/{len(rs)} p=BIZ {p}/{len(rs)}  runsFCP {[r['fcp'] for r in rs]}")
