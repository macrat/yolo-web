// Shared yolos.net components — JSX
// Load AFTER React + Babel.

const Icon = ({ name, size = 18, ...rest }) => {
  const paths = {
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    search: (
      <g>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </g>
    ),
    add: <path d="M12 5v14M5 12h14" />,
    back: <path d="M15 6l-6 6 6 6" />,
    forward: <path d="M9 6l6 6-6 6" />,
    trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />,
    check: <path d="M20 6L9 17l-5-5" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    grip: (
      <g>
        <circle cx="9" cy="6" r="1" />
        <circle cx="15" cy="6" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="9" cy="18" r="1" />
        <circle cx="15" cy="18" r="1" />
      </g>
    ),
    settings: (
      <g>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.4a7 7 0 0 0-2.1 1.2l-2.4-.8-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-.8a7 7 0 0 0 2.1 1.2L10 21h4l.4-2.4a7 7 0 0 0 2.1-1.2l2.4.8 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" />
      </g>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    star: (
      <path d="M12 3l2.6 5.8 6.4.6-4.8 4.4 1.4 6.2L12 17l-5.6 3 1.4-6.2L3 9.4l6.4-.6z" />
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
    folder: <path d="M3 6h6l2 2h10v12H3z" />,
    play: <path d="M7 4l13 8-13 8z" />,
    pause: (
      <g>
        <path d="M7 4h4v16H7zM13 4h4v16h-4z" />
      </g>
    ),
    refresh: (
      <g>
        <path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l3-3" />
        <path d="M20 12a8 8 0 0 1-14 5l-2 2v-6h6l-3 3" />
      </g>
    ),
    arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
    sun: (
      <g>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </g>
    ),
  };
  const s = size;
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      width={s}
      height={s}
      aria-hidden="true"
      {...rest}
    >
      {paths[name] || null}
    </svg>
  );
};

const Logo = ({ size = 18, light = false }) => (
  <span
    style={{
      fontFamily: "var(--font-sans)",
      fontSize: size,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1,
      color: light ? "var(--bg)" : "var(--fg)",
      display: "inline-block",
      whiteSpace: "nowrap",
    }}
  >
    yolos<span style={{ color: "var(--accent)" }}>.</span>net
  </span>
);

const Header = ({ active = "tools", onNav = () => {} }) => (
  <header className="yo-header">
    <div className="brand">
      <Logo size={18} />
    </div>
    <nav>
      {[
        ["tools", "道具"],
        ["box", "道具箱"],
        ["new", "新着"],
        ["about", "しらべ"],
      ].map(([k, l]) => (
        <a
          key={k}
          className={active === k ? "active" : ""}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNav(k);
          }}
        >
          {l}
        </a>
      ))}
    </nav>
  </header>
);

const Footer = () => (
  <footer className="yo-footer">
    <span>yolos.net — 日常の傍にある道具</span>
    <span>© 2026</span>
  </footer>
);

const Chip = ({ children }) => <span className="chip">{children}</span>;

const Tag = ({ kind, dot = false, children }) => {
  const cn = ["tag", kind || ""].filter(Boolean).join(" ");
  return (
    <span className={cn}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
};

const Button = ({ kind = "default", size, children, ...rest }) => {
  const cn = [
    "btn",
    kind === "primary" ? "btn-primary" : kind === "ghost" ? "btn-ghost" : "",
    size === "sm" ? "btn-sm" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cn} {...rest}>
      {children}
    </button>
  );
};

const SectionHead = ({ title, meta }) => (
  <div className="section-head">
    <h2>{title}</h2>
    {meta && <span className="meta">{meta}</span>}
  </div>
);

Object.assign(window, {
  Icon,
  Logo,
  Header,
  Footer,
  Chip,
  Tag,
  Button,
  SectionHead,
});
