/**
 * 並べた量の帯の組みを、並びの幅と字の列の幅から決める（DESIGN.md §5 量の帯）。1行の組みで枠が並びの幅の
 * 半分以上あれば 1行の組み（data-layout="inline"）にし、届かなければ属性を外して並び全体を2行の組みにする。
 *
 * 字の列の幅は、各列のいちばん広い字の幅で、どちらの組みで描かれていても同じに測れるよう、セルの幅でなく
 * 字そのものの幅を Range で測る。1行の組みの枠は、並びの幅から字の列と列のあいだを除いた残りである。
 *
 * サーバーで描いた並びでは、この関数の文をそのまま並びの直後のスクリプトで動かし、最初の描画から組みを
 * 決める。そのため、この関数は外の名前を参照しない。
 */
export function layoutQuantityBars(list: HTMLElement | null): void {
  if (!list) return;
  const range = document.createRange();
  const widest = (selector: string): number => {
    let max = 0;
    list.querySelectorAll(selector).forEach((cell) => {
      range.selectNodeContents(cell);
      max = Math.max(max, range.getBoundingClientRect().width);
    });
    return max;
  };
  const columns = [widest("[data-bar-name]"), widest("[data-bar-value]")];
  if (list.querySelector("[data-bar-current]")) {
    columns.push(widest("[data-bar-current]"));
  }
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
  // 字の列のそれぞれと帯のあいだに、列のあいだが1つずつある。
  const text = columns.reduce((sum, width) => sum + width + gap, 0);
  const width = list.clientWidth;
  if (width - text >= width / 2) {
    list.dataset.layout = "inline";
  } else {
    delete list.dataset.layout;
  }
}
