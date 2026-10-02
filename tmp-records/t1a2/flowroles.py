import json,sys
sys.path.insert(0,'/home/user/yolo-web/tmp/t1a')
from analyze import zen
from model import covered
def roles(chars):
    z=set();b4=set();b7=set()
    for k,v in chars.items():
        r,w=k.split(':')
        if r=='M': continue
        non={c for c in v if ord(c)>=0x80}
        if r=='H':
            iz={c for c in non if covered(c,zen)}; z|=iz; non-=iz
        (b7 if w=='700' else b4).update(non)
    return {'zen':z,'biz400':b4,'biz700':b7}
out={}
for fn in ['flow-first.json','flow-1.json','flow-2.json']:
    ph=json.load(open(fn))
    intro=roles(ph[0]['chars'])
    qs={'zen':set(),'biz400':set(),'biz700':set()}
    for p in ph[1:-1]:
        r=roles(p['chars'])
        for k in qs: qs[k]|=r[k]
    res=roles(ph[-1]['chars'])
    qnew={k:qs[k]-intro[k] for k in qs}
    rnew={k:res[k]-intro[k]-qs[k] for k in qs}
    print(fn,'intro',{k:len(v) for k,v in intro.items()},'q-new',{k:len(v) for k,v in qnew.items()},'result-new',{k:len(v) for k,v in rnew.items()})
    out[fn]={'intro':{k:''.join(sorted(v)) for k,v in intro.items()},
             'intro+q':{k:''.join(sorted(intro[k]|qs[k])) for k in qs},
             'qnew':{k:''.join(sorted(v)) for k,v in qnew.items()},
             'rnew':{k:''.join(sorted(v)) for k,v in rnew.items()},
             'all':{k:''.join(sorted(intro[k]|qs[k]|res[k])) for k in qs}}
json.dump(out,open('flowroles.json','w'),ensure_ascii=False)
