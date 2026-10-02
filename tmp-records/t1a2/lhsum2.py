import json,glob,os,statistics as st,collections,sys
root=sys.argv[1]
for v in sorted(os.listdir(root)):
    by=collections.defaultdict(list)
    for f in sorted(glob.glob(f"{root}/{v}/*.json")):
        n=os.path.basename(f).rsplit('-',1)[0]; a=json.load(open(f))["audits"]
        rq=a["network-requests"]["details"]["items"]
        s=lambda t: sum(r["transferSize"] for r in rq if r.get("resourceType")==t)
        by[n].append(dict(tot=a["total-byte-weight"]["numericValue"],fetch=s("Fetch"),font=s("Font"),fcp=a["first-contentful-paint"]["numericValue"],lcp=a["largest-contentful-paint"]["numericValue"],cls=a["cumulative-layout-shift"]["numericValue"]))
    print("==",v)
    for n,rs in sorted(by.items()):
        m=lambda k: st.median([r[k] for r in rs])
        t=[r["tot"] for r in rs]
        print(f"{n:10s} n={len(rs)} total {m('tot')/1024:7.1f} [{min(t)/1024:.1f}-{max(t)/1024:.1f}] excl.prefetch {st.median([r['tot']-r['fetch'] for r in rs])/1024:7.1f} fetch {m('fetch')/1024:5.1f} font {m('font')/1024:6.1f} FCP {m('fcp'):5.0f} LCP {m('lcp'):5.0f} CLS {m('cls'):.3f}")
