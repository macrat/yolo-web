"use client";

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import Accordion from "@/components/Accordion";
import { trackTocJump, trackTocOpen } from "@/lib/analytics";
import type { Heading } from "@/lib/markdown";
import TableOfContents from "./TableOfContents";
import styles from "./CollapsibleTOC.module.css";

/** 目次を画面の上端に留める画面の条件。CollapsibleTOC.module.css の留める規則と同じ。 */
const STICKY_MEDIA_QUERY = "(min-height: 500px)";

/** 目次のボックスが画面の上端に来るまで、ページを即時に送る。 */
function bringToTop(box: HTMLElement): void {
  const top = box.getBoundingClientRect().top;
  if (Math.abs(top) >= 1) window.scrollBy({ top, behavior: "instant" });
}

/**
 * 閉じた目次の下で来訪者が読んでいる所。読んでいる要素と、その要素のどこが読み始めの線に掛かっているか。要素が線の
 * 下から始まるときは線から上端までの距離（gap）、線をまたぐときは線より上に出た部分の、要素の高さに対する割合
 * （passed）で持つ。幅が変わって段落の行数が変わっても、割合で持てば、同じあたりの行を線に合わせられる。
 */
interface ReadingPlace {
  element: Element;
  gap: number;
  passed: number;
  /** 覚えたときの画面の大きさと、目次を留める条件に当たっていたか。 */
  width: number;
  height: number;
  sticky: boolean;
}

/**
 * 読み始めの線。留まった目次の下端（目次が画面の上端に留まっているとき）か、画面の上端。この線のすぐ下にあるものを、
 * 来訪者がいま読んでいる所とみなす。
 */
function readingEdge(box: HTMLElement): number {
  const rect = box.getBoundingClientRect();
  return Math.abs(rect.top) < 1 ? rect.bottom : 0;
}

/** 読み始めの線の下を、読んでいる要素を探して調べる点の、線からの距離（px）。段落のあいだのあきを越えるため。 */
const READING_PROBE_DEPTHS = [1, 16, 32, 64, 128];

/**
 * 読み始めの線のすぐ下にある本文の要素を、いまの画面の大きさとともに覚える。調べる点が段落のあいだのあきに当たると、
 * 本文全体を包む要素が返り、その要素は幅が変わると組み直されて読んでいた所を指さないので、画面の高さより低い要素が
 * 見つかるまで、線の少し下を順に調べる。目次の中のものは覚えない。
 */
function readPlace(box: HTMLElement, sticky: boolean): ReadingPlace | null {
  const edge = readingEdge(box);
  const rect = box.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  let found: Element | null = null;
  for (const depth of READING_PROBE_DEPTHS) {
    const hit = document.elementFromPoint(x, edge + depth);
    if (!hit || box.contains(hit)) continue;
    found ??= hit;
    if (hit.getBoundingClientRect().height <= window.innerHeight) {
      found = hit;
      break;
    }
  }
  if (!found) return null;
  const { top, height } = found.getBoundingClientRect();
  return {
    element: found,
    gap: Math.max(0, top - edge),
    passed: top < edge && height > 0 ? (edge - top) / height : 0,
    width: window.innerWidth,
    height: window.innerHeight,
    sticky,
  };
}

/** 覚えた要素が、読み始めの線に対して覚えたときと同じ所に来るまで、ページを即時に送る。 */
function restorePlace(box: HTMLElement, place: ReadingPlace): void {
  // 送ると目次が留まるかどうかが変わり、読み始めの線が動くことがあるので、線を測り直してもう1度合わせる。
  for (let pass = 0; pass < 2; pass++) {
    const { top, height } = place.element.getBoundingClientRect();
    const drift = top - readingEdge(box) - place.gap + place.passed * height;
    if (Math.abs(drift) >= 1) {
      window.scrollBy({ top: drift, behavior: "instant" });
    }
  }
}

interface CollapsibleTOCProps {
  headings: Heading[];
  /** 記事の slug。目次の計測の content_id に使う。 */
  contentId: string;
}

/**
 * 記事の目次（DESIGN.md §5）。記事の頭のあと・本文の前に、ボックスに入れた閉じたアコーディオンで置き、読み進める
 * あいだは画面の上端に留める。どこまで読み進めても、押して章を選べる。
 *
 * 初めの状態はどの幅でも閉じていて、開閉は来訪者の操作（開閉を押す・項目を選ぶ・Escape を押す・フォーカスを目次の
 * 外へ移す）でだけ変わり、画面の幅や読み込みでは変わらない。サーバーの HTML と水和のあとで開閉が食い違わないので、
 * 読み込みのあとに本文が動かない。フォーカスが目次の外へ出ると閉じるのは、開いた一覧が本文に重なり、フォーカスの
 * ある要素を隠さないためである。Escape で閉じたときは、フォーカスを開閉の行へ戻す。
 *
 * 開いた一覧は目次の下から画面の下端までに収まる。目次が画面の上端にないとき（留まる前の読み始めの画面や、留めない
 * 低い画面）に開くと、目次が上端に来るまでページを送り、一覧の最後の項目まで画面の中で押せるようにする。送りは
 * 即時にする（§11）。
 *
 * 目次が留まる高さの画面で開いているあいだは、ページ全体を送らない（CollapsibleTOC.module.css）。開いた一覧は本文に
 * 重なるので、そのあいだに本文が動くと、来訪者は気づかないまま読んでいた所を失う。一覧は自分の中で、ホイール・指・
 * キーで送れる。項目を選ぶと閉じるので、送りの止めが外れてから移った先へ送られる。開いたまま画面の高さが留める
 * 条件をまたいだとき（拡大・窓の大きさの変更・端末の回転）は、目次を閉じずに、開くときと同じく上端まで送る。
 * 留まらなくなった目次は記事の頭の元の位置へ戻るので、送らなければ開いた一覧が画面の外へ消える。
 *
 * 閉じたまま画面の大きさが留める条件をまたいだときは、来訪者が読んでいた所へ戻す。スマホを回すと、Chromium は回す前に
 * 画面の上の真ん中にあった要素を拠り所にして、回したあとも同じ要素が画面の上に来るようにページを送る。縦の画面では
 * それが留まった目次で、横の画面で目次が留まらなくなると、記事の頭の目次の元の位置へ送られてしまう。そこで、閉じて
 * いるあいだは、送るたびに（画面の大きさが変わる前の値で）読み始めの線のすぐ下の要素と、その要素のどこが線に掛かって
 * いるかを覚えておき、画面の大きさが変わって留める条件をまたいだら、その要素を線に対して同じ所へ戻す（線の下から
 * 始まる要素は線から同じ距離へ、線をまたぐ要素は線より上に出ていた割合が同じになる所へ）。条件をまたがない大きさの
 * 変わりでは、ブラウザの送りに任せ、覚え直すだけにする。
 *
 * 来訪者が開いたこと（toc_open）と、項目から章へ移ったこと（toc_jump）を GA に送る。
 */
export default function CollapsibleTOC({
  headings,
  contentId,
}: CollapsibleTOCProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (open || !box) return;
    const sticky = window.matchMedia(STICKY_MEDIA_QUERY);
    let place: ReadingPlace | null = null;
    let frame = 0;
    let restoring = false;
    const remember = () => {
      frame = 0;
      place = readPlace(box, sticky.matches);
    };
    // 送りの出来事は、画面の大きさが変わった直後（ブラウザが拠り所に合わせて送った直後）にも届く。その値で覚え直すと
    // 戻す先を失うので、覚えたときと画面の大きさが違うあいだは、大きさの変わりの受け手に任せる。
    const handleScroll = () => {
      if (restoring) return;
      if (
        place &&
        (place.width !== window.innerWidth ||
          place.height !== window.innerHeight)
      ) {
        return;
      }
      if (!frame) frame = requestAnimationFrame(remember);
    };
    // 大きさが変わったあとの数フレームは、本文の表を組み直す処理（Prose）とブラウザの送りの拠り所がまだ本文を動かす。
    // すぐに戻したうえで、次の2フレームでも同じ所へ戻し直し、それが済むまで覚え直さない。
    const handleResize = () => {
      if (
        !place ||
        place.sticky === sticky.matches ||
        !place.element.isConnected
      ) {
        remember();
        return;
      }
      const target = place;
      restoring = true;
      cancelAnimationFrame(frame);
      restorePlace(box, target);
      frame = requestAnimationFrame(() => {
        restorePlace(box, target);
        frame = requestAnimationFrame(() => {
          restorePlace(box, target);
          restoring = false;
          remember();
        });
      });
    };
    remember();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  useEffect(() => {
    const box = boxRef.current;
    if (!open || !box) return;
    const sticky = window.matchMedia(STICKY_MEDIA_QUERY);
    const keepInView = () => bringToTop(box);
    sticky.addEventListener("change", keepInView);
    return () => sticky.removeEventListener("change", keepInView);
  }, [open]);

  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const next = event.currentTarget.open;
    if (next === open) return;
    setOpen(next);
    if (next) trackTocOpen(contentId);
  };

  // 開く押し下げ（マウス・指・Enter と Space）は、開く前のクリックとして届く。ここで送ると、一覧が画面の下に
  // はみ出した形を1度も描かずに済む。
  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (open || !(event.target instanceof Element)) return;
    if (!event.target.closest("summary")) return;
    bringToTop(event.currentTarget);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) {
      setOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    setOpen(false);
    event.currentTarget
      .querySelector("summary")
      ?.focus({ preventScroll: true });
  };

  const handleSelect = (heading: Heading) => {
    setOpen(false);
    trackTocJump(contentId, heading.id, heading.level);
  };

  return (
    <nav
      ref={boxRef}
      className={styles.toc}
      aria-label="目次"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClickCapture={handleClickCapture}
    >
      <Accordion summary="目次" open={open} onToggle={handleToggle}>
        <div className={styles.list}>
          <TableOfContents headings={headings} onSelect={handleSelect} />
        </div>
      </Accordion>
    </nav>
  );
}
