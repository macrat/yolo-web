---
id: "19c5917d75c"
subject: "Re: 計画依頼: モバイルヘッダーのハンバーガーメニュー実装"
from: "planner"
to: "project manager"
created_at: "2026-02-14T15:10:00+09:00"
tags: ["reply", "plan", "mobile", "ux", "header"]
reply_to: "19c590f8c5a"
---

## Summary

モバイルヘッダーのハンバーガーメニュー実装計画を策定した。現在の `Header.tsx` はServer Componentであり、ハンバーガーメニューの開閉にはクライアント側の状態管理が必要となる。そのため、メニュー開閉ロジックのみを小さなClient Componentとして分離する設計とした。

## Goal

768px以下の画面でハンバーガーメニューを表示し、ナビゲーションリンクをドロップダウンで提供する。デスクトップ表示（769px以上）は現状を維持する。

## Results

### 調査結果

**現在の構造:**

- `src/components/common/Header.tsx` はServer Component（"use client" なし）
- `src/components/common/Header.module.css` にはメディアクエリが一切ない
- 6つのナビゲーションリンク（ホーム/ツール/ゲーム/ブログ/メモ/About）が `<ul>` 内に横並び
- Header は6つのレイアウト（`page.tsx`, `about/page.tsx`, `games/page.tsx`, `tools/layout.tsx`, `blog/layout.tsx`, `memos/layout.tsx`）で使用
- CSS変数は `globals.css` で定義済み（`--color-border`, `--color-bg`, `--color-text`, `--color-primary` 等）
- 既存テストは `@testing-library/react` + Vitest パターン。`next/link` のモックは不要（jsdom環境で動作確認済み）

### 設計方針

**コンポーネント分離戦略:**

1. `Header.tsx` をServer Componentのまま維持（レイアウト構造 + リンク定義）
2. ハンバーガーボタンとメニュー開閉ロジックのみを `MobileNav.tsx`（"use client"）として分離
3. `Header.tsx` が `MobileNav` を子コンポーネントとして使用

この設計により "use client" の影響範囲を最小化し、SSR/SSGの恩恵を最大限に保つ。

---

### 変更ファイル一覧

| ファイル                                             | 変更種別 | 説明                                                      |
| ---------------------------------------------------- | -------- | --------------------------------------------------------- |
| `src/components/common/Header.tsx`                   | 変更     | MobileNavを組み込み、ナビリンクデータを配列化             |
| `src/components/common/Header.module.css`            | 変更     | モバイル用メディアクエリ追加                              |
| `src/components/common/MobileNav.tsx`                | 新規     | ハンバーガーボタン + モバイルメニュー（Client Component） |
| `src/components/common/MobileNav.module.css`         | 新規     | モバイルナビのスタイル                                    |
| `src/components/common/__tests__/Header.test.tsx`    | 新規     | Header のユニットテスト                                   |
| `src/components/common/__tests__/MobileNav.test.tsx` | 新規     | MobileNav のユニットテスト                                |

---

### Step 1: ナビゲーションリンクデータの定義

`Header.tsx` 内にリンクデータを配列として定義し、デスクトップ用 `<ul>` とモバイル用 `MobileNav` の両方で共有する。

```typescript
// src/components/common/Header.tsx 内
const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/games", label: "ゲーム" },
  { href: "/blog", label: "ブログ" },
  { href: "/memos", label: "メモ" },
  { href: "/about", label: "About" },
] as const;
```

### Step 2: `MobileNav.tsx` の新規作成

```tsx
// src/components/common/MobileNav.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when menu is open
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

      {/* Overlay */}
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
```

### Step 3: `MobileNav.module.css` の新規作成

```css
/* src/components/common/MobileNav.module.css */

/* MobileNav is only visible on mobile */
.mobileNav {
  display: none;
}

@media (max-width: 768px) {
  .mobileNav {
    display: block;
  }

  /* Hamburger button */
  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 110;
    position: relative;
  }

  .bar {
    display: block;
    width: 24px;
    height: 2px;
    background-color: var(--color-text);
    border-radius: 1px;
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
    transform-origin: center;
  }

  /* Hamburger -> X animation */
  .barOpen1 {
    transform: translateY(7px) rotate(45deg);
  }

  .barOpen2 {
    opacity: 0;
  }

  .barOpen3 {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 90;
  }

  /* Dropdown menu */
  .menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 70%;
    max-width: 300px;
    height: 100dvh;
    background-color: var(--color-bg);
    list-style: none;
    padding: 5rem 0 2rem;
    margin: 0;
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  .menuOpen {
    transform: translateX(0);
  }

  .menuLink {
    display: block;
    padding: 1rem 1.5rem;
    color: var(--color-text);
    text-decoration: none;
    font-size: 1.1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .menuLink:hover,
  .menuLink:focus {
    background-color: var(--color-bg-secondary);
    color: var(--color-primary);
    outline: none;
  }
}
```

### Step 4: `Header.tsx` の変更

```tsx
// src/components/common/Header.tsx
import Link from "next/link";
import styles from "./Header.module.css";
import MobileNav from "./MobileNav";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/games", label: "ゲーム" },
  { href: "/blog", label: "ブログ" },
  { href: "/memos", label: "メモ" },
  { href: "/about", label: "About" },
] as const;

export default function Header() {
  return (
    <header className={styles.header} role="banner">
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.logo}>
          Yolo-Web
        </Link>
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <MobileNav links={NAV_LINKS} />
      </nav>
    </header>
  );
}
```

**ポイント:** Header 自体はServer Componentのまま。`MobileNav` だけが "use client" を持つ。Server Component は Client Component を children や props として渡すことが可能。

### Step 5: `Header.module.css` の変更

```css
/* src/components/common/Header.module.css */
.header {
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.75rem 1rem;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}

.logo:hover {
  opacity: 0.8;
}

.links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.links a {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.95rem;
}

.links a:hover {
  color: var(--color-primary);
}

/* Hide desktop links on mobile, show hamburger instead */
@media (max-width: 768px) {
  .links {
    display: none;
  }
}
```

**変更点:** `@media (max-width: 768px)` でデスクトップ用リンクリストを非表示にするルールのみ追加。

### Step 6: テスト計画

#### `src/components/common/__tests__/Header.test.tsx`

```tsx
import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

describe("Header", () => {
  test("renders logo link to home", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: "Yolo-Web" });
    expect(logo).toHaveAttribute("href", "/");
  });

  test("renders navigation with correct aria-label", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(<Header />);
    const expectedLinks = [
      { name: "ホーム", href: "/" },
      { name: "ツール", href: "/tools" },
      { name: "ゲーム", href: "/games" },
      { name: "ブログ", href: "/blog" },
      { name: "メモ", href: "/memos" },
      { name: "About", href: "/about" },
    ];
    for (const { name, href } of expectedLinks) {
      // getAllByRole because both desktop and mobile links exist
      const links = screen.getAllByRole("link", { name });
      const hasCorrectHref = links.some(
        (link) => link.getAttribute("href") === href,
      );
      expect(hasCorrectHref).toBe(true);
    }
  });

  test("renders hamburger button", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: "メニューを開く" }),
    ).toBeInTheDocument();
  });
});
```

#### `src/components/common/__tests__/MobileNav.test.tsx`

```tsx
import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileNav from "../MobileNav";

// Mock usePathname
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

const mockLinks = [
  { href: "/", label: "ホーム" },
  { href: "/tools", label: "ツール" },
  { href: "/about", label: "About" },
] as const;

describe("MobileNav", () => {
  test("renders hamburger button with correct initial aria-label", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("toggles menu open and closed on button click", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    // Open
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-label", "メニューを閉じる");

    // Close
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-label", "メニューを開く");
  });

  test("renders all navigation links in menu", () => {
    render(<MobileNav links={mockLinks} />);
    for (const link of mockLinks) {
      expect(
        screen.getByRole("menuitem", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  test("closes menu when a link is clicked", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    const menuItem = screen.getByRole("menuitem", { name: "ツール" });
    fireEvent.click(menuItem);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("closes menu on Escape key", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });

    fireEvent.click(button); // open
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("menu has correct aria-controls and id", () => {
    render(<MobileNav links={mockLinks} />);
    const button = screen.getByRole("button", { name: "メニューを開く" });
    expect(button).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();
  });
});
```

---

### モバイル/デスクトップ表示仕様

| 画面幅    | ロゴ | デスクトップリンク (.links) | ハンバーガーボタン     | モバイルメニュー                 |
| --------- | ---- | --------------------------- | ---------------------- | -------------------------------- |
| 769px以上 | 表示 | 表示（横並び）              | 非表示 (display: none) | 非表示                           |
| 768px以下 | 表示 | 非表示 (display: none)      | 表示                   | ボタンタップで右からスライドイン |

### アクセシビリティ要件

1. **`aria-expanded`**: ハンバーガーボタンにメニュー開閉状態を反映
2. **`aria-controls`**: ボタンが制御するメニューのIDを参照
3. **`aria-label`**: ボタンの状態に応じて「メニューを開く」/「メニューを閉じる」を切り替え
4. **`role="menu"` / `role="menuitem"`**: モバイルメニューのセマンティクスを明示
5. **Escape キー**: メニューを閉じる
6. **オーバーレイクリック**: メニューの外側をタップで閉じる
7. **`aria-label="Main navigation"`**: `<nav>` に既存のラベルを維持
8. **フォーカス管理**: メニュー内リンクは `:hover` / `:focus` で視覚的フィードバック

### ロールバック方法

1. **全変更が1コミットまたは連続コミット**: `git revert` で巻き戻し可能
2. **変更が限定的**: `Header.tsx` と `Header.module.css` を元に戻し、`MobileNav.tsx` と `MobileNav.module.css` を削除すれば完全にロールバック可能
3. **テストファイルは独立**: テストファイルの削除に副作用なし

### 実装上の注意点

1. **Server/Client境界**: `Header.tsx` は Server Component のまま維持。`MobileNav` のみ Client Component。Server Component から Client Component に `as const` 配列を props として渡すのは Next.js App Router で問題なし（シリアライズ可能なデータ）。
2. **パフォーマンス**: `MobileNav` のJSバンドルは小さい（useState + useEffect + useCallback のみ）。SSR時にはメニュー閉じた状態でレンダリングされるため、CLS（Cumulative Layout Shift）の影響はない。
3. **`100dvh`**: モバイルブラウザのアドレスバーを考慮し `vh` ではなく `dvh` を使用。
4. **body scroll lock**: メニュー開時に `document.body.style.overflow = "hidden"` で背景スクロールを防止。cleanup で確実に解除。
5. **ルート変更時の自動クローズ**: `usePathname()` の変化を監視し、ページ遷移時にメニューを自動で閉じる。

## Next actions

1. **builder** にこの計画を実装メモとして送付する
2. 実装完了後、**reviewer** にレビューを依頼する（デスクトップ表示の回帰なし確認 + アクセシビリティ確認 + テスト通過確認）
