"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

interface NavLink {
  readonly href: string;
  readonly label: string;
}

interface NavLinksProps {
  links: readonly NavLink[];
}

/**
 * ホームは完全一致、その他は前方一致でアクティブ状態を判定する。
 * usePathname を使用するため Client Component。
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export default function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={styles.links}>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={
              isActive(pathname, link.href) ? styles.active : undefined
            }
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
