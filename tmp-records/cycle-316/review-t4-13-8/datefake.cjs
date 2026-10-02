const R = Date; const off = R.parse(process.env.FAKE_DATE) - R.now();
function D(...a) { if (!new.target) return new R(R.now() + off).toString(); return a.length ? new R(...a) : new R(R.now() + off); }
D.prototype = R.prototype; D.now = () => R.now() + off; D.parse = R.parse; D.UTC = R.UTC;
Object.defineProperty(R.prototype, "constructor", { value: D, configurable: true, writable: true });
globalThis.Date = D;
