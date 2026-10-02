import json,glob,os,statistics as st
def L(d):
  out={}
  for f in sorted(glob.glob(d+"/*.json")):
    n=os.path.basename(f).rsplit('-',1)[0]; j=json.load(open(f))
    a=j["audits"]; it=a["network-requests"]["details"]["items"]
    font=sum(r["transferSize"] for r in it if r.get("resourceType")=="Font")
    fetch=sum(r["transferSize"] for r in it if r.get("resourceType")=="Fetch")
    out.setdefault(n,[]).append((a["total-byte-weight"]["numericValue"],font,fetch,j["fetchTime"],j["requestedUrl"]))
  return out
B={}
for d in ["../t1a3/work/lh/before","lh/before-games","lh/before-keigo"]: B.update(L(d))
A=L("lh/r4g")
for n in A:
  b=B[n];a=A[n]; md=lambda X,i: st.median([x[i] for x in X])/1024
  print(f"{n:10} {md(b,0):8.1f} {md(a,0):8.1f} {md(a,0)-md(b,0):+8.1f} font {md(b,1):.1f}->{md(a,1):.1f} rng {(max(x[0] for x in b)-min(x[0] for x in b))/1024:.1f}/{(max(x[0] for x in a)-min(x[0] for x in a))/1024:.1f} {min(x[3] for x in a)[11:16]}-{max(x[3] for x in a)[11:16]} {a[0][4]}")
