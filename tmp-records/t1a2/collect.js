const collect = () => {
  const res = {};
  const add = (role, w, t) => {
    const k = role + ":" + w;
    res[k] = (res[k] || "") + t;
  };
  const roleOf = (cs) => {
    const f = cs.fontFamily;
    if (/Noto Serif JP/.test(f)) return "H";
    if (/Zilla Slab/.test(f)) return "N";
    const first = f.split(",")[0].trim().replace(/["']/g, "");
    if (/Menlo|Consolas|monospace|Courier/i.test(first)) return "M";
    return "B";
  };
  const wOf = (cs) => (parseInt(cs.fontWeight, 10) >= 600 ? 700 : 400);
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement;
    if (!el) continue;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TITLE", "HEAD"].includes(el.tagName)) continue;
    if (el.closest("head")) continue;
    if (!el.checkVisibility()) continue;
    const t = n.data.replace(/\s+/g, "");
    if (!t) continue;
    const cs = getComputedStyle(el);
    add(roleOf(cs), wOf(cs), t);
  }
  for (const el of document.querySelectorAll("input,textarea")) {
    if (!el.checkVisibility()) continue;
    const cs = getComputedStyle(el);
    const t = ((el.value || "") + (el.placeholder || "")).replace(/\s+/g, "");
    if (t) add(roleOf(cs), wOf(cs), t);
  }
  for (const el of document.body.querySelectorAll("*")) {
    for (const ps of ["::before", "::after"]) {
      const cs = getComputedStyle(el, ps);
      const c = cs.content;
      if (c && c !== "none" && c !== "normal" && c.startsWith('"')) {
        if (!el.checkVisibility()) continue;
        const t = c.slice(1, -1).replace(/\\[0-9a-fA-F]+ ?/g, (m) => String.fromCodePoint(parseInt(m.slice(1), 16))).replace(/\s+/g, "");
        if (t) add(roleOf(cs), wOf(cs), t);
      }
    }
  }
  for (const k of Object.keys(res)) res[k] = [...new Set([...res[k]])].sort().join("");
  return res;
};
