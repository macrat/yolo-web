/**
 * 文をクリップボードに写し、写せたかを返す。
 *
 * クリップボードの API を使い、それが無い端末や、権限を持たずに拒まれる端末（アプリの中のブラウザなど）では、
 * 画面の外に置いた textarea の中身を選んで `document.execCommand("copy")` で写す。
 *
 * `container` は、その textarea を置く要素。モーダルのダイアログが開いているあいだはその外の要素を選べないので、
 * 写す操作を置いた要素（押したボタンを囲む要素など）を渡す。省くと body に置く。
 */
export async function copyText(
  text: string,
  container?: HTMLElement | null,
): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return copyWithSelection(text, container);
    }
  }
  return copyWithSelection(text, container);
}

function copyWithSelection(
  text: string,
  container?: HTMLElement | null,
): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  // 選ぶために置くだけなので、画面に出さず、読み上げにも渡さない。iOS が選んだ欄へ画面を送らないよう固定で置く。
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  const previousFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  (container ?? document.body).appendChild(textarea);
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}
