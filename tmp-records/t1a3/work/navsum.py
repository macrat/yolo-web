import json,sys
for l in open('/home/user/yolo-web/tmp/t1a3/work/nav.jsonl'):
    d=json.loads(l)
    if len(sys.argv)>1 and d['label'] not in sys.argv[1:]: continue
    print(d['label'],d['net'],d['from'].split('/')[-1][:10],'->',d['to'].split('/')[-1][:12],'commit',d['commitMs'],'font',d['fontBytes'],'| s0 t',d['s0']['t'],'mix',d['s0']['mixedJP'],'fb',d['s0']['fallbackJP'],'web',d['s0']['webJP'],'| s1 mix',d['s1']['mixedJP'],'fb',d['s1']['fallbackJP'],'web',d['s1']['webJP'],'mixLat',d['s1']['mixedLatin'], (d['s0']['examples'][:1]+d['s1']['examples'][:1]))
