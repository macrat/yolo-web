/* eslint-disable */
// Toolbox (道具箱) — dashboard view
// Lays out user-chosen panels in a flexible grid.

const TOOL_LIBRARY = [
  {
    id: "timer",
    name: "タイマー",
    kind: "時間",
    desc: "時間を入れて、はじめる。",
  },
  { id: "memo", name: "メモ", kind: "記録", desc: "書いて、残す。" },
  {
    id: "weather",
    name: "天気",
    kind: "天気",
    desc: "今いる場所の、ひと言の天気。",
  },
  { id: "uranai", name: "占い", kind: "占い", desc: "けさの一言。" },
  { id: "puzzle", name: "パズル", kind: "パズル", desc: "9つの枡を埋める。" },
  { id: "calc", name: "割り勘", kind: "計算", desc: "人数と総額を入れる。" },
  { id: "habit", name: "つみき", kind: "記録", desc: "毎日の小さな積み重ね。" },
  { id: "color", name: "色しらべ", kind: "道具", desc: "和の色名を引く。" },
];

// A panel inside the toolbox grid. size: 1 / 2 / 3 columns wide.
const ToolPanel = ({ tool, w = 1, h = 1, onOpen, onMenu }) => (
  <div
    className="panel"
    style={{
      gridColumn: `span ${w}`,
      gridRow: `span ${h}`,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    }}
    onClick={onOpen}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
      }}
    >
      <h3 className="panel-title" style={{ fontSize: 15, margin: 0 }}>
        {tool.name}
      </h3>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenu && onMenu();
        }}
        aria-label="menu"
        style={{
          background: "transparent",
          border: 0,
          padding: 4,
          cursor: "pointer",
          color: "var(--fg-softer)",
        }}
      >
        <Icon name="grip" size={14} />
      </button>
    </div>

    <ToolPreview tool={tool} size={w} />
  </div>
);

// Inline preview content for each tool — minimal, illustrative.
const ToolPreview = ({ tool, size }) => {
  const wrap = {
    marginTop: "auto",
    paddingTop: 16,
    minHeight: size >= 2 ? 120 : 60,
  };
  switch (tool.id) {
    case "timer":
      return (
        <div
          style={{
            ...wrap,
            fontFamily: "var(--font-mono)",
            fontSize: size >= 2 ? 44 : 28,
            color: "var(--fg)",
            letterSpacing: "0.04em",
          }}
        >
          25:00
        </div>
      );
    case "memo":
      return (
        <div
          style={{
            ...wrap,
            fontSize: 13,
            color: "var(--fg-soft)",
            lineHeight: 1.7,
          }}
        >
          ・ 牛乳
          <br />・ 折り紙を買う
          <br />
          {size >= 2 && (
            <>
              ・ あの本のタイトル
              <br />・ 木曜日の予定
            </>
          )}
        </div>
      );
    case "weather":
      return (
        <div
          style={{
            ...wrap,
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="mono"
            style={{ fontSize: size >= 2 ? 28 : 20, whiteSpace: "nowrap" }}
          >
            晴れ
          </span>
          <span
            className="mono"
            style={{
              fontSize: 13,
              color: "var(--fg-softer)",
              whiteSpace: "nowrap",
            }}
          >
            18°C
          </span>
        </div>
      );
    case "uranai":
      return (
        <div
          style={{ ...wrap, fontSize: 13, lineHeight: 1.6, color: "var(--fg)" }}
        >
          ふと見上げた空に。
        </div>
      );
    case "puzzle":
      return (
        <div
          style={{
            ...wrap,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            width: 90,
            height: 90,
            marginLeft: 0,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, null].map((n, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--fg)",
                background: "var(--bg-soft)",
              }}
            >
              {n || ""}
            </div>
          ))}
        </div>
      );
    case "calc":
      return (
        <div
          style={{
            ...wrap,
            fontFamily: "var(--font-mono)",
            fontSize: size >= 2 ? 32 : 18,
            color: "var(--fg)",
          }}
        >
          ¥ 2,400{" "}
          <span style={{ fontSize: 12, color: "var(--fg-softer)" }}>
            ／ 4人
          </span>
        </div>
      );
    case "habit":
      return (
        <div style={{ ...wrap, display: "flex", gap: 3, flexWrap: "wrap" }}>
          {Array.from({ length: size >= 2 ? 28 : 14 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                background: i % 4 === 0 ? "var(--border)" : "var(--fg)",
              }}
            />
          ))}
        </div>
      );
    case "color":
      return (
        <div style={{ ...wrap, display: "flex", gap: 6 }}>
          {[
            "var(--accent)",
            "var(--warning)",
            "var(--success)",
            "var(--danger)",
          ].map((c, i) => (
            <div
              key={i}
              style={{
                width: size >= 2 ? 40 : 24,
                height: size >= 2 ? 40 : 24,
                background: c,
              }}
            />
          ))}
        </div>
      );
    default:
      return <div style={wrap} />;
  }
};

const AddPanel = ({ onAdd }) => (
  <button
    onClick={onAdd}
    className="panel"
    style={{
      gridColumn: "span 1",
      border: "1px dashed var(--border)",
      background: "transparent",
      cursor: "pointer",
      minHeight: 180,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 8,
      color: "var(--fg-softer)",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
    }}
  >
    <Icon name="add" size={20} />
    道具を入れる
  </button>
);

const ToolboxTabs = ({ boxes, active, onSwitch, onAddBox }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: 0,
      borderBottom: "1px solid var(--border)",
      marginBottom: 24,
    }}
  >
    {boxes.map((b) => (
      <button
        key={b.id}
        onClick={() => onSwitch(b.id)}
        style={{
          background: "transparent",
          border: 0,
          padding: "8px 16px",
          marginBottom: -1,
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          color: active === b.id ? "var(--fg)" : "var(--fg-softer)",
          borderBottom:
            active === b.id
              ? "1.5px solid var(--fg)"
              : "1.5px solid transparent",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {b.name}
      </button>
    ))}
    <button
      onClick={onAddBox}
      aria-label="新しい道具箱"
      style={{
        background: "transparent",
        border: 0,
        padding: "8px 12px",
        color: "var(--fg-softer)",
        cursor: "pointer",
      }}
    >
      <Icon name="add" size={14} />
    </button>
  </div>
);

const AddToolModal = ({ open, onClose, onPick, current }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,26,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-soft)",
          border: "1px solid var(--border-strong)",
          width: 560,
          maxWidth: "90vw",
          padding: 28,
          boxShadow: "var(--elev-dragging)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
            道具を入れる
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              color: "var(--fg-softer)",
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {TOOL_LIBRARY.filter((t) => !current.includes(t.id)).map((t) => (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                borderRadius: "var(--r-normal)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)" }}
                >
                  {t.name}
                </div>
                <Tag>{t.kind}</Tag>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--fg-softer)",
                  marginTop: 4,
                }}
              >
                {t.desc}
              </div>
            </button>
          ))}
          {TOOL_LIBRARY.filter((t) => !current.includes(t.id)).length === 0 && (
            <div
              style={{
                gridColumn: "span 2",
                color: "var(--fg-softer)",
                fontSize: 13,
                padding: 16,
                textAlign: "center",
              }}
            >
              すべて入っています。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  TOOL_LIBRARY,
  ToolPanel,
  ToolPreview,
  AddPanel,
  ToolboxTabs,
  AddToolModal,
});
