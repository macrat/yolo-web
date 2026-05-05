/* eslint-disable */
// Individual tool page — name + big panel + how-to.

const ToolHero = ({ tool, children }) => (
  <section style={{ marginBottom: 32 }}>
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 16,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1
          style={{
            fontSize: 18,
            margin: 0,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {tool.name}
        </h1>
        <Tag>{tool.kind}</Tag>
      </div>
      <Button kind="default" size="sm">
        道具箱に入れる
      </Button>
    </div>
    <div
      className="panel"
      style={{
        padding: 48,
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </section>
);

const HowTo = ({ steps }) => (
  <section style={{ maxWidth: 640 }}>
    <SectionHead title="使い方" />
    <ol
      style={{ listStyle: "none", padding: 0, margin: 0, counterReset: "step" }}
    >
      {steps.map((s, i) => (
        <li
          key={i}
          style={{
            counterIncrement: "step",
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
            display: "grid",
            gridTemplateColumns: "32px 1fr",
            gap: 16,
            alignItems: "baseline",
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 18,
              color: "var(--fg-softer)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.7 }}>{s}</span>
        </li>
      ))}
    </ol>
  </section>
);

const RelatedTools = ({ items }) => (
  <section style={{ marginTop: 64 }}>
    <SectionHead title="ほかの道具" meta="related" />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {items.map((t, i) => (
        <a key={i} href="#" style={{ borderBottom: 0 }}>
          <div className="panel" style={{ minHeight: 80 }}>
            <Tag>{t.kind}</Tag>
            <h3 className="panel-title" style={{ marginTop: 8, fontSize: 14 }}>
              {t.name}
            </h3>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// Live timer used in the hero panel.
const TimerPanel = () => {
  const { useState, useEffect, useRef } = React;
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="mono"
        style={{
          fontSize: 96,
          color: "var(--fg)",
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {mm}:{ss}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 32,
        }}
      >
        <Button kind="primary" onClick={() => setRunning((r) => !r)}>
          {running ? "とめる" : "はじめる"}
        </Button>
        <Button
          onClick={() => {
            setRunning(false);
            setSecs(25 * 60);
          }}
        >
          もどす
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        {[5, 15, 25, 45].map((m) => (
          <Button
            key={m}
            size="sm"
            onClick={() => {
              setRunning(false);
              setSecs(m * 60);
            }}
          >
            {m}分
          </Button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { ToolHero, HowTo, RelatedTools, TimerPanel });
