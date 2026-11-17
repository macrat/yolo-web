/**
 * 字の幅の上限の見積もり（em）。スライダーの並びは、ラベルと値の列をこの幅に固定し、1行の組みの溝の長さを
 * 「並びの幅 − 溝のほかの幅」として CSS だけで決める（Slider.module.css）。実際の字がこの幅より広いと、列が
 * 広がって溝が見積もりより短くなり、5rem に届かないまま1行で組まれうる。そこで、どの書体で描いても実際の幅を
 * 下回らない値を字の種類ごとに持つ。Web フォントを読む前（代わりの書体）と後で、列の幅も組みも変わらない。
 */

/** 数字。本文の書体（IBM Plex Sans）と、それに寸法を合わせた代わりの書体の数字は、等幅の 0.6em である。 */
const DIGIT_EM = 0.6;

/**
 * 数字でない半角の字（記号・欧字・空白）。本文の書体と代わりの書体のどちらでも、いちばん広い字（「@」は代わりの
 * 書体で 1.016em、「%」「M」「W」はそれより狭い）を下回らないよう、1.05em とする。
 */
const OTHER_NARROW_EM = 1.05;

/**
 * 和字。漢字は全角の 1em だが、和文の書体によっては仮名や長音符が 1em をわずかに超えて組まれる（「パスワードの
 * 長さ」が 8.14em）ので、その分を見込む。
 */
const WIDE_EM = 1.03;

/** 字の並びの幅の上限を em で見積もる。 */
export function textEm(text: string): number {
  let width = 0;
  for (const ch of text) {
    if (/[0-9]/.test(ch)) width += DIGIT_EM;
    else if (/[\u0000-\u024f]/.test(ch)) width += OTHER_NARROW_EM;
    else width += WIDE_EM;
  }
  return Math.round(width * 100) / 100;
}
