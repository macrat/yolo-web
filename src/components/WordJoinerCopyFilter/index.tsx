"use client";

import { useEffect } from "react";
import { WORD_JOINER } from "@/lib/phrase-dashes";

/** 描かれず、写す文にも入らない要素。この中の字には触れない。 */
const UNRENDERED_ELEMENTS = "script, style, template, noscript";

/** 語結合子を写さない要素に入れた字の節。 */
interface HiddenJoiners {
  /** 元の字の節。分けたあとは、最初の語結合子の前までの字を持つ。 */
  node: Text;
  /** 元の字の節の親。分けて作った節は、この中で元の字の節の後ろに並ぶ。 */
  parent: Node;
  original: string;
  /** 分けたあとの元の字の節の字。 */
  head: string;
  /** 元の字の中の、語結合子の位置。 */
  joinerOffsets: number[];
  /** 語結合子ごとの、その後ろの字を持つ節。 */
  tails: Text[];
  /** 分けて作った節（写さない要素と、その後ろの字の節）。 */
  created: ChildNode[];
}

/** 選択の両端。 */
interface SelectionEnds {
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
}

function selectionEnds(selection: Selection): SelectionEnds | null {
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  return anchorNode && focusNode
    ? { anchorNode, anchorOffset, focusNode, focusOffset }
    : null;
}

function sameEnds(selection: Selection, ends: SelectionEnds): boolean {
  return (
    selection.anchorNode === ends.anchorNode &&
    selection.anchorOffset === ends.anchorOffset &&
    selection.focusNode === ends.focusNode &&
    selection.focusOffset === ends.focusOffset
  );
}

function setEnds(selection: Selection, ends: SelectionEnds): void {
  selection.setBaseAndExtent(
    ends.anchorNode,
    ends.anchorOffset,
    ends.focusNode,
    ends.focusOffset,
  );
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/** 選んだ範囲にかかる、描かれる字の節のうち、語結合子を含むもの。 */
function textNodesWithJoiners(selection: Selection): Text[] {
  const found = new Set<Text>();
  const consider = (text: Text) => {
    if (
      text.data.includes(WORD_JOINER) &&
      !text.parentElement?.closest(UNRENDERED_ELEMENTS)
    ) {
      found.add(text);
    }
  };
  for (let index = 0; index < selection.rangeCount; index++) {
    const range = selection.getRangeAt(index);
    const root = range.commonAncestorContainer;
    if (root instanceof Text) {
      consider(root);
      continue;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (range.intersectsNode(node)) consider(node as Text);
    }
  }
  return [...found];
}

/**
 * 字の節の語結合子を1字ずつ `user-select: none` の span に入れる。字そのものは文書に残るので、行は変わらない。
 */
function hideJoiners(node: Text, parent: Node): HiddenJoiners {
  const original = node.data;
  const joinerOffsets: number[] = [];
  for (let index = 0; index < original.length; index++) {
    if (original[index] === WORD_JOINER) joinerOffsets.push(index);
  }
  const tails: Text[] = [];
  const created: ChildNode[] = [];
  let rest = node;
  for (
    let index = rest.data.indexOf(WORD_JOINER);
    index !== -1;
    index = rest.data.indexOf(WORD_JOINER)
  ) {
    const joiner = rest.splitText(index);
    rest = joiner.splitText(WORD_JOINER.length);
    const unselectable = document.createElement("span");
    unselectable.style.setProperty("-webkit-user-select", "none");
    unselectable.style.setProperty("user-select", "none");
    joiner.before(unselectable);
    unselectable.append(joiner);
    tails.push(rest);
    created.push(unselectable, rest);
  }
  return {
    node,
    parent,
    original,
    head: node.data,
    joinerOffsets,
    tails,
    created,
  };
}

/** 分けた節を除き、元の字の節に元の字を戻す。そのあいだに React などが字を書き換えた節は、書き換えた字のままにする。 */
function restoreJoiners({
  node,
  original,
  head,
  created,
}: HiddenJoiners): void {
  created.forEach((part) => part.remove());
  if (node.isConnected && node.data === head) {
    node.appendData(original.slice(head.length));
  }
}

/** 分ける前の選択の端（節と位置）を、分けたあとの同じ字の位置に写す。 */
function endAfterHiding(
  hidden: readonly HiddenJoiners[],
  node: Node,
  offset: number,
): [Node, number] {
  const split = hidden.find((entry) => entry.node === node);
  if (split) {
    const before = split.joinerOffsets.filter((at) => at < offset);
    if (before.length === 0) return [node, offset];
    const last = before[before.length - 1];
    return [split.tails[before.length - 1], offset - last - 1];
  }
  // 端が子の並びの位置なら、その位置より前にある分けた節の数だけ後ろにずらす
  const originalChildren = [...node.childNodes].filter(
    (child) => !hidden.some((entry) => entry.created.includes(child)),
  );
  let shifted = offset;
  for (const entry of hidden) {
    if (
      entry.parent === node &&
      originalChildren.indexOf(entry.node) < offset
    ) {
      shifted += entry.created.length;
    }
  }
  return [node, shifted];
}

/**
 * 選んだ範囲に語結合子（U+2060）があるとき、コピーする文にそれを入れない。見出しなどで折り所を組むために置いた
 * 語結合子は見えないまま写るので、来訪者が見出しのファイル名やパッケージ名を端末やエディタに貼ったとき、見えない
 * 字で失敗しないようにする。
 *
 * 写す文はブラウザに組ませる。ブラウザはコピーの出来事のあとで選んだ範囲を text/plain と text/html にし、その
 * ときにリンクを絶対の URL にし、描かれていない要素と `user-select: none` の字を除く（Chromium で確かめた。
 * WebKit は 2022年12月まで `user-select: none` の字も写していた）。そこで、出来事の中で選んだ範囲にかかる字の節の
 * 語結合子を `user-select: none` の span に入れておき、ブラウザが写し終えたあと、描く前に元の字の節に戻す。
 * 語結合子を除かずに残すので、行は変わらず、キーでもメニューからでも、写すことで layout-shift は起きない。戻すのは、
 * 次の requestAnimationFrame と setTimeout のうち先に来たほうで、どちらも写したあとの別の仕事として走る
 * （マイクロタスクは受け手のすぐあと、ブラウザが写す前に走るので使えない）。
 *
 * 行が変わらないのは、語結合子を含む字が行の中の字として組まれる（親が flex や grid の容器でない）からである。
 * いま語結合子を置く所（PhrasedText の要素と、json-formatter の誤りの文の段落）はどれもそうなる。span の境では
 * 字の組み（シェーピング）が分かれるので、戻すまでのあいだ、語結合子の隣の字の位置と幅は 1/64px ほど動き、字の
 * 幅で大きさが決まる箱（inline-block など）は最大でその分だけ広がることがある。容器の端いっぱいに縮めて組んだ箱の
 * 中に語結合子を置くと、この差で折り返しが変わりうる。
 *
 * 選択の端が分けた字の節か、その親の子の並びにあるときは、分けたあとの同じ位置に端を置き直し、戻したあとに元の
 * 端に戻す。Chromium は、子の並びの位置の端を、子が増えたあと `focusOffset` などでは増えた数で返すのに、写す範囲と
 * `toString()` では増える前の位置のまま扱うので、置き直さないと写す範囲が途中で切れる。端がそのほかの所にある
 * 選択（Ctrl+A など）は置き直さない。Ctrl+A の「全体の選択」は、同じ端で置き直してもふつうの範囲に変わり、次の
 * コピーで末尾の改行が落ちる。
 *
 * 語結合子の無い選択と、入力欄の中の選択（来訪者が自分で入れた文）は、ブラウザのコピーのままにする。
 */
export function removeWordJoinersFromCopy(event: ClipboardEvent): void {
  if (event.defaultPrevented || isEditable(event.target)) return;
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const nodes = textNodesWithJoiners(selection);
  if (nodes.length === 0) return;

  const ends = selection.rangeCount === 1 ? selectionEnds(selection) : null;
  const hidden = nodes.flatMap((node) =>
    node.parentNode ? [hideJoiners(node, node.parentNode)] : [],
  );
  const isAffected = (node: Node) =>
    hidden.some((entry) => entry.node === node || entry.parent === node);
  let hiddenEnds: SelectionEnds | null = null;
  if (ends && (isAffected(ends.anchorNode) || isAffected(ends.focusNode))) {
    const [anchorNode, anchorOffset] = endAfterHiding(
      hidden,
      ends.anchorNode,
      ends.anchorOffset,
    );
    const [focusNode, focusOffset] = endAfterHiding(
      hidden,
      ends.focusNode,
      ends.focusOffset,
    );
    hiddenEnds = { anchorNode, anchorOffset, focusNode, focusOffset };
    setEnds(selection, hiddenEnds);
  }

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    // 置き直した端のままなら（来訪者がそのあいだに選び直していなければ）、元の端に戻す。
    const keepSelection =
      ends !== null && hiddenEnds !== null && sameEnds(selection, hiddenEnds);
    hidden.forEach(restoreJoiners);
    if (
      keepSelection &&
      ends.anchorNode.isConnected &&
      ends.focusNode.isConnected
    ) {
      setEnds(selection, ends);
    }
  };
  requestAnimationFrame(restore);
  setTimeout(restore, 0);
}

/** サイトの全体でコピーを受け、語結合子を写す文に入れない（removeWordJoinersFromCopy）。ルートのレイアウトが1つ置く。 */
export default function WordJoinerCopyFilter(): null {
  useEffect(() => {
    document.addEventListener("copy", removeWordJoinersFromCopy);
    return () => {
      document.removeEventListener("copy", removeWordJoinersFromCopy);
    };
  }, []);
  return null;
}
