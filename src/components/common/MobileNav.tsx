"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./MobileNav.module.css";

interface NavLink {
  readonly href: string;
  readonly label: string;
}

interface MobileNavProps {
  links: readonly NavLink[];
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className={styles.mobileNav}>
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
        type="button"
      >
        <span className={`${styles.bar} ${isOpen ? styles.barOpen1 : ""}`} />
        <span className={`${styles.bar} ${isOpen ? styles.barOpen2 : ""}`} />
        <span className={`${styles.bar} ${isOpen ? styles.barOpen3 : ""}`} />
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <ul
        id="mobile-menu"
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
        role="menu"
      >
        {links.map((link) => (
          <li key={link.href} role="none">
            <Link
              href={link.href}
              className={styles.menuLink}
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
