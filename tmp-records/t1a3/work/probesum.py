import json,collections,statistics as st,sys
V={'3318':'adopt2','3317':'adopt','3000':'before','3311':'swap','3312':'optional','3313':'block','3315':'ud-swap','3316':'hdr-swap'}
f=sys.argv[1] if len(sys.argv)>1 else 'probe.jsonl'
by=collections.defaultdict(list)
for l in open(f):
    d=json.loads(l); by[(d['net'],d['path'],V[d['base'][-4:]])].append(d)
agg=collections.defaultdict(list)
for k in sorted(by):
    rs=by[k]
    fcp=st.median([r['fcp'] or 0 for r in rs]); lcp=st.median([r['lcp'] for r in rs]); cls=max([r['cls'] for r in rs])
    webp=sum(1 for r in rs if 'BIZ UD' in (r['used'].get('p') or '') and '*' in (r['used'].get('p') or ''))
    webh=sum(1 for r in rs if 'Zen Antique*' in (r['used'].get('h1') or ''))
    serif=sum(1 for r in rs if 'Serif' in (r['used'].get('logo') or '') or 'Serif' in (r['used'].get('h1') or ''))
    fend=st.median([max([x[2] for x in r['fonts']] or [0]) for r in rs])
    fst=st.median([min([x[1] for x in r['fonts']] or [0]) for r in rs])
    print(f"{k[0]:8s} {k[1][-24:]:24s} {k[2]:9s} n={len(rs)} FCP {fcp:5.0f} LCP {lcp:5.0f} CLSmax {cls:.3f} fontStart {fst:5.0f} fontsDone {fend:5.0f} p=web {webp}/{len(rs)} h1=Zen {webh}/{len(rs)} serif {serif}  FCPs {[r['fcp'] for r in rs]}")
