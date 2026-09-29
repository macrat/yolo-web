/**
 * 横に送る枠（DESIGN.md §4・§5）の組み方。表の列の幅と、枠を付けて横に送るかを決める。
 *
 * サーバーで描いた表は、描く前に組むため、この組み方を文字列にしてスクリプトに入れる（記事の本文は
 * TABLE_LAYOUT_DEFINE、記事の外の表の部品は FRAME_LAYOUT_DEFINE）。規則を1か所に持つため、組み方はすべて
 * createFrameLayout の中に書き、外の名前を使わない。ビルドの変換で名前が変わっても、文字列にした関数がそのまま
 * 動く。
 */

/** 列の幅の決め方の結果。 */
export interface ColumnPlan {
  /** 4字まで細くしても収まらず、枠の中で横に送るか。 */
  scrolls: boolean;
  /** 各列の中身の幅。 */
  widths: number[];
  /** 細くした列か。細くした列でだけ、入らない文節をその中で折る。 */
  narrowed: boolean[];
}

/** 読み上げで言う名前。 */
export interface FrameLabels {
  code: string;
  table: string;
}

export interface FrameLayout {
  labels: FrameLabels;
  planColumns: (mins: number[], target: number, floor: number) => ColumnPlan;
  layoutTable: (frame: HTMLElement, contentChanged?: boolean) => void;
  markContentFrame: (frame: HTMLElement, label: string) => void;
  layoutFrames: (root: HTMLElement) => void;
}

export function createFrameLayout(): FrameLayout {
  const labels = {
    code: "コード（横にスクロールできます）",
    table: "表（横にスクロールできます）",
  };
  /** 細くする列の幅の下限（字数）。1字ずつ縦に並ぶ列を作らない。 */
  const floorChars = 4;

  /**
   * 列の幅を決める。mins は各列のいちばん長い文節の幅、target は表を置く幅から罫線と余白を除いた幅。
   * 収まれば下限のまま。収まらなければ、長い列から順に同じ幅まで floor を下限に細くする。floor まで細くしても
   * 収まらなければ、どの列も下限のまま横に送る（送れば全部読めるので、文節を割ってまで細くしない）。
   */
  function planColumns(
    mins: number[],
    target: number,
    floor: number,
  ): ColumnPlan {
    let total = 0;
    let floorTotal = 0;
    for (let i = 0; i < mins.length; i++) {
      total += mins[i];
      floorTotal += Math.min(mins[i], floor);
    }
    const untouched = mins.map(function () {
      return false;
    });
    if (total <= target) {
      return { scrolls: false, widths: mins.slice(), narrowed: untouched };
    }
    if (floorTotal > target) {
      return { scrolls: true, widths: mins.slice(), narrowed: untouched };
    }
    const sorted = mins.slice().sort(function (a, b) {
      return b - a;
    });
    let rest = total;
    let level = floor;
    for (let k = 0; k < sorted.length; k++) {
      rest -= sorted[k];
      const candidate = (target - rest) / (k + 1);
      const next = k + 1 < sorted.length ? sorted[k + 1] : 0;
      if (candidate >= next) {
        level = Math.max(candidate, floor);
        break;
      }
    }
    return {
      scrolls: false,
      widths: mins.map(function (m) {
        return Math.min(m, level);
      }),
      narrowed: mins.map(function (m) {
        return m > level;
      }),
    };
  }

  /** 横に送るものにだけ、枠の印・キーボードで送れる止まりどころ・名前を付ける。 */
  function setScrolls(frame: HTMLElement, scrolls: boolean, label: string) {
    if (scrolls) {
      frame.setAttribute("data-scrolls", "");
      frame.setAttribute("tabindex", "0");
      frame.setAttribute("role", "region");
      frame.setAttribute("aria-label", label);
    } else {
      frame.removeAttribute("data-scrolls");
      frame.removeAttribute("tabindex");
      frame.removeAttribute("role");
      frame.removeAttribute("aria-label");
    }
  }

  /** 要素の左右の余白（と線）の幅。値を持たない辺は0に数える。 */
  function horizontalExtras(element: HTMLElement, withBorders: boolean) {
    const style = getComputedStyle(element);
    const sides = withBorders
      ? [
          style.paddingLeft,
          style.paddingRight,
          style.borderLeftWidth,
          style.borderRightWidth,
        ]
      : [style.paddingLeft, style.paddingRight];
    let extras = 0;
    for (let i = 0; i < sides.length; i++) extras += parseFloat(sides[i]) || 0;
    return extras;
  }

  /**
   * 表を置いた幅。結果のボックスの中に置いた表（data-in-box）は、ボックスの中身の幅に置かれる。枠は表の幅に
   * 伸びて、はみ出す分はボックスが横に送るので、枠の幅でなくボックスの中身の幅で測る。
   */
  function placedWidth(frame: HTMLElement) {
    const box = frame.hasAttribute("data-in-box") ? frame.parentElement : null;
    if (!box) return frame.getBoundingClientRect().width;
    return box.getBoundingClientRect().width - horizontalExtras(box, true);
  }

  /**
   * 各列のいちばん長い文節の幅を測る。表の幅を0にして列を最小の幅にした組みで、最初の行のセルを測る。
   * overhead は、表の幅のうち列の中身でない分（セルの余白と罫線）。
   */
  function measureColumns(table: HTMLTableElement, head: HTMLTableRowElement) {
    table.style.width = "0";
    const outer: number[] = [];
    const mins: number[] = [];
    let contentTotal = 0;
    for (let i = 0; i < head.cells.length; i++) {
      const width = head.cells[i].getBoundingClientRect().width;
      const min = width - horizontalExtras(head.cells[i], false);
      outer.push(width);
      mins.push(min);
      contentTotal += min;
    }
    const overhead = table.getBoundingClientRect().width - contentTotal;
    const em = parseFloat(getComputedStyle(head.cells[0]).fontSize);
    table.style.width = "";
    return { outer: outer, mins: mins, overhead: overhead, em: em };
  }

  /**
   * 表を組む。はみ出すかは、枠を外した組み方の表の幅と、置かれた幅で比べる。枠を付けた表を組み直すときも
   * 同じ幅と比べるので、枠の付け外しが行ったり来たりしない。
   * 区切りを持つ表（.table-phrased）は、各列のいちばん長い文節の幅を測り、planColumns で決める。区切りを
   * 持たない表（書いた Markdown のプレビュー）は、枠だけを決める。
   * 値を写すコピーのボタンを値の横に置く表（data-copy-column）は、どの列も細くせずに収まるときだけボタンを
   * 横に置く。収まらなければ、どの行もボタンを値の次の行に送り（枠の data-copy-below）、値に行の幅を渡した
   * 組みで測り直して決める（§6）。
   * 結果のボックスの中に置いた表は、横に送るのはボックスなので、枠に送る印を付けない。
   */
  function applyTableLayout(frame: HTMLElement) {
    const table = frame.querySelector("table");
    if (!table) return;
    const cells = table.querySelectorAll<HTMLElement>("th, td");
    const ownsScroll = !frame.hasAttribute("data-in-box");
    setScrolls(frame, false, labels.table);
    frame.removeAttribute("data-copy-below");
    table.style.tableLayout = "";
    table.style.width = "";
    for (let c = 0; c < cells.length; c++) {
      cells[c].removeAttribute("data-narrowed");
      cells[c].style.width = "";
    }
    const available = placedWidth(frame);
    const head = table.rows[0];
    if (!frame.classList.contains("table-phrased") || !head) {
      setScrolls(
        frame,
        ownsScroll && table.getBoundingClientRect().width > available,
        labels.table,
      );
      return;
    }
    let columns = measureColumns(table, head);
    let plan = planColumns(
      columns.mins,
      available - columns.overhead,
      floorChars * columns.em,
    );
    if (
      frame.hasAttribute("data-copy-column") &&
      (plan.scrolls || plan.narrowed.indexOf(true) !== -1)
    ) {
      frame.setAttribute("data-copy-below", "");
      columns = measureColumns(table, head);
      plan = planColumns(
        columns.mins,
        available - columns.overhead,
        floorChars * columns.em,
      );
    }
    if (plan.scrolls) {
      setScrolls(frame, ownsScroll, labels.table);
      return;
    }
    if (plan.narrowed.indexOf(true) === -1) return;
    table.style.tableLayout = "fixed";
    table.style.width = available + "px";
    for (let j = 0; j < head.cells.length; j++) {
      head.cells[j].style.width =
        columns.outer[j] - columns.mins[j] + plan.widths[j] + "px";
    }
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      for (let n = 0; n < row.cells.length; n++) {
        if (plan.narrowed[n] && row.cells[n].colSpan === 1) {
          row.cells[n].setAttribute("data-narrowed", "");
        }
      }
    }
  }

  /**
   * 表を組む。組んだときの置かれた幅・字の大きさ・Web フォントの読み込みの状態を枠に覚えさせ、どれも同じなら
   * 組み直さない。表の直後のスクリプトが組んだ表を、水和のときにもう一度測り直さずに済む（組み直しは枠と幅を
   * 外して測るので、レイアウトを何度もやり直させる）。中身を描き替えたとき（contentChanged）は、どれも同じでも
   * 組み直す。置かれた幅を持たない枠（隠れた区画の中）は測れないので組まず、描かれたときに組む。開いた行を
   * 持つ表には、見える幅を枠の --frame-visible-width に持たせ、開いた行が無くなれば外す。
   */
  function layoutTable(frame: HTMLElement, contentChanged?: boolean) {
    const width = placedWidth(frame);
    if (width === 0) return;
    const key =
      width +
      "|" +
      getComputedStyle(frame).fontSize +
      "|" +
      (document.fonts ? document.fonts.status : "");
    if (!contentChanged && frame.getAttribute("data-layout-key") === key) {
      return;
    }
    applyTableLayout(frame);
    if (frame.querySelector("[data-detail]")) {
      frame.style.setProperty(
        "--frame-visible-width",
        visibleWidth(frame) + "px",
      );
    } else {
      frame.style.removeProperty("--frame-visible-width");
    }
    frame.setAttribute("data-layout-key", key);
  }

  /**
   * 表のうち画面に見える幅。横に送る枠では、枠の線と内側の余白の内側、結果のボックスの中の表では、ボックスの
   * 中身の幅。開いた行（data-detail）の中身は、表が横に送られてもこの幅で折って左端に留める。
   */
  function visibleWidth(frame: HTMLElement) {
    if (frame.hasAttribute("data-in-box")) return placedWidth(frame);
    return frame.getBoundingClientRect().width - horizontalExtras(frame, true);
  }

  /**
   * いつも枠を持つもの（コードのボックス・結果のボックスの中身の区画）は、中身の幅が枠の内側の幅を超えるかで
   * 決める。
   */
  function markContentFrame(frame: HTMLElement, label: string) {
    const inner =
      frame.getBoundingClientRect().width - horizontalExtras(frame, true);
    let content = 0;
    for (let i = 0; i < frame.children.length; i++) {
      content = Math.max(
        content,
        frame.children[i].getBoundingClientRect().width,
      );
    }
    setScrolls(frame, content > inner, label);
  }

  /** 本文の中の、表とコードのボックスをすべて組む。 */
  function layoutFrames(root: HTMLElement) {
    const tables = root.querySelectorAll<HTMLElement>(".table-scroll");
    for (let t = 0; t < tables.length; t++) layoutTable(tables[t]);
    const codes = root.querySelectorAll<HTMLElement>("pre");
    for (let p = 0; p < codes.length; p++) {
      markContentFrame(codes[p], labels.code);
    }
  }

  return { labels, planColumns, layoutTable, markContentFrame, layoutFrames };
}

const frameLayout = createFrameLayout();

export const SCROLL_FRAME_LABELS = frameLayout.labels;
export const markScrollFrame = frameLayout.markContentFrame;
export const layoutFrames = frameLayout.layoutFrames;
export const layoutTable = frameLayout.layoutTable;

/**
 * 記事の外の表の部品が、サーバーで描いた表の枠の前に置くスクリプトの文。組み方を作って window に置く。ページで
 * 最初に動いた文だけが作り、同じページのほかの表の文は何もしない。本文の中の最初の表より前にスクリプトが無いと、
 * ブラウザがスクリプトを動かす前の描画の機会に、組む前の表を描くことがあるので、定める文を表の前に置く。
 */
export const FRAME_LAYOUT_DEFINE = `window.yolosFrameLayout||(window.yolosFrameLayout=(${String(createFrameLayout)})())`;

/**
 * 記事の外の表の部品が、サーバーで描いた表の枠の直後に置くスクリプトの文。枠の前の文が定めた組み方で直前の枠の
 * 表を組む。部品は組むまで表を隠すので、組み方が無いか組む途中で失敗したときは、組めなかった印
 * （data-layout-failed）を付けて表を見せ、失敗はそのまま投げてエラーとして残す。
 */
export const LAYOUT_PREVIOUS_TABLE =
  '(function(f){try{window.yolosFrameLayout.layoutTable(f)}catch(e){f.setAttribute("data-layout-failed","");throw e}})(document.currentScript.previousElementSibling)';

/**
 * 記事の本文の最初の表の前に置くスクリプト。表の直後のスクリプトが呼ぶ、表を組む関数を定める。本文の HTML の中に
 * 置くので、表の無い記事には配らない。
 */
export const TABLE_LAYOUT_DEFINE = `<script>(function(){const l=(${String(createFrameLayout)})();window.yolosLayoutTable=function(s){const f=s.previousElementSibling;if(f)l.layoutTable(f)}})()</script>`;

/** 記事の表の直後に置くスクリプト。最初の表の前のスクリプトが定めた関数で、直前の表を組む。 */
export const TABLE_LAYOUT_CALL =
  "<script>window.yolosLayoutTable&&yolosLayoutTable(document.currentScript)</script>";
