import json,re,collections
d=json.load(open('diffs-now.json'))
def offs(s):
  ps=s.split('|'); r=[];i=0
  for p in ps[:-1]: i+=len(p); r.append(i)
  return set(r)
K=re.compile(r'[゠-ヿー]')
def ctx(t,o):
  a=o
  while a>0 and K.match(t[a-1]): a-=1
  b=o
  while b<len(t) and K.match(t[b]): b+=1
  return t[max(a,o-8):o]+'／'+t[o:min(b,o+8)] if (a<o and b>o) else t[max(0,o-4):o]+'／'+t[o:o+4]+' [non-kata]'
add=collections.Counter(); rem=collections.Counter(); strs=set()
for x in d:
  if x['mode'] not in ('heading','countedName'): continue
  t=x['old'].replace('|','')
  strs.add(t)
  O,N=offs(x['old']),offs(x['new'])
  for o in N-O: add[(ctx(t,o))]+=1
  for o in O-N: rem[(ctx(t,o))]+=1
print('strings',len(strs))
print('ADDED'); [print(' ',k,v) for k,v in sorted(add.items())]
print('REMOVED'); [print(' ',k,v) for k,v in sorted(rem.items())]
