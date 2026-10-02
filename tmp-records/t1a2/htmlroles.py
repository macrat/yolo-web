# Build-time role detection from server HTML only (no browser): compare with the rendered crawl sets.
import json,sys,random,urllib.request,urllib.parse
from html.parser import HTMLParser
sys.path.insert(0,'/home/user/yolo-web/tmp/t1a')
roles=json.load(open('roles.json'))
SKIP={'script','style','template','noscript','title','head'}
VOID={'br','img','input','meta','link','hr','wbr','source','area','col','embed','param','track'}
HEAD={'h1','h2','h3','h4','h5','h6'}; BOLD={'strong','b','th'}
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.st=[]; s.z=set(); s.b4=set(); s.b7=set(); s.skip=0
    def handle_starttag(s,t,a):
        a=dict(a)
        if t in ('input','textarea'):
            for k in ('placeholder','value'):
                if a.get(k): s.add(a[k], t)
        if t in VOID: return
        s.st.append(t)
    def handle_endtag(s,t):
        if t in VOID: return
        while s.st:
            x=s.st.pop()
            if x==t: break
    def add(s,txt,tag=None):
        non={c for c in txt if ord(c)>=0x80 and not c.isspace()}
        if not non: return
        if any(x in SKIP for x in s.st): return
        if any(x in HEAD for x in s.st): s.z|=non
        elif any(x in BOLD for x in s.st): s.b7|=non
        else: s.b4|=non
    def handle_data(s,d): s.add(d)
def html_sets(u):
    h=urllib.request.urlopen('http://localhost:3000'+urllib.parse.quote(u,safe='/?=&')).read().decode()
    p=P(); p.feed(h); return p
urls=["/play/character-personality","/play/character-personality/result/blazing-strategist","/tools/char-count","/dictionary/kanji/哀","/blog/sql-cheatsheet","/tools/email-validator","/tools/traditional-color-palette"]
random.seed(1); urls+=random.sample(sorted(roles),60)
miss=0; out={}
for u in urls:
    p=html_sets(u); r=roles[u]
    rend=set(r['zen'])|set(r['biz400'])|set(r['biz700']); htm=p.z|p.b4|p.b7
    m=rend-htm; miss+=bool(m)
    out[u]={'zen':''.join(sorted(p.z)),'biz400':''.join(sorted(p.b4|p.b7)),'biz700':''.join(sorted(p.b7)),'missing':''.join(sorted(m)),'extra':len(htm-rend)}
    if u in urls[:7] or m: print(u,'rendered',len(rend),'html',len(htm),'missing-from-html',len(m),''.join(sorted(m))[:40],'extra',len(htm-rend))
print('pages with chars missing from HTML:',miss,'of',len(urls))
json.dump(out,open('htmlroles.json','w'),ensure_ascii=False)
