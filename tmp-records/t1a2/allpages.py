import json,glob,statistics,sys
sys.path.insert(0,'/home/user/yolo-web/tmp/t1a')
from tiers import load_pages
HDR=300; PLEX={'plex400':10760,'plex700':10888}
pages,before=load_pages('/home/user/yolo-web/tmp/t1a/all.jsonl')
sz={}
for f in glob.glob('/home/user/yolo-web/tmp/t1a2/sizes-*.jsonl'):
    for l in open(f):
        d=json.loads(l); sz[d['url']]=d
rows=[]
for u,s in pages.items():
    d=sz[u]; c=sum(d[k]+HDR for k in ('zen','biz400','biz700') if d[k])
    c+=sum(PLEX[p]+HDR for p in PLEX if s[p])
    rows.append((c-before[u],u,before[u],c,d))
rows.sort()
dd=[r[0] for r in rows]
print('pages',len(rows),'webfont increases on',sum(1 for x in dd if x>0))
print(f'delta KiB min {dd[0]/1024:.1f} median {statistics.median(dd)/1024:.1f} max {dd[-1]/1024:.1f}')
for r in rows[-8:]: print(f'  {r[0]/1024:+.1f}KiB {r[1]} before={r[2]/1024:.1f} after={r[3]/1024:.1f} {r[4]}')
tot=sum(r[4][k] for r in rows for k in ('zen','biz400','biz700'))
nf=sum(1 for r in rows for k in ('zen','biz400','biz700') if r[4][k])
uniq=len({(k,pages[r[1]][k] if False else None) for r in rows for k in ()})
print('files',nf,'total MB',round(tot/1e6,1))
json.dump({r[1]:{'before':r[2],'after':r[3]} for r in rows},open('/home/user/yolo-web/tmp/t1a2/allpages.json','w'))
