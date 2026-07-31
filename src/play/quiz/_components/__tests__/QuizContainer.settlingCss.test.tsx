/**
 * `data-settling` に**意味を与えている CSS 規則**が消えていないことの検査（B-620）。
 *
 * ## なぜこのテストが要るのか
 *
 * 画面の入れ替わり直後の短い窓で、二重タップの2打目が「入れ替わった先の座標」に
 * 落ちて来訪者を別ページへ飛ばすのを**実際に防いでいる実体**は、
 * `QuizContainer.module.css` の次の2規則だけである。
 *
 *  - `.introPhase[data-settling="true"] { pointer-events: none }`
 *    （経路4＝「もう一度挑戦する」。2打目が intro の関連リンクを叩いて他のクイズへ離脱する）
 *  - `.resultPhase[data-settling="true"] { pointer-events: none }`
 *    （経路3＝結果リビール。2打目が結果領域の操作要素を叩き、結果を見ないまま離脱する）
 *
 * JS 側が立てる `data-settling` 属性それ自体は**何も防がない**。属性は目印であって、
 * ポインタ入力を止めているのは規則のほうである。
 *
 * ところが **jsdom は CSS ファイルを評価しない**。既存テストが押さえているのは
 * 「属性が立つ／外れる」ことだけなので、**2規則を丸ごと削除しても typecheck /
 * lint / vitest はすべて緑のまま通ってしまう**（レビュアーが実際に削除して確認済み）。
 * 一方、実ブラウザの独立実測では、規則を実行時に削除した対照で **12/30 が離脱**し、
 * 規則がある処理群では **0/30** だった。つまり**規則の消失は無音の来訪者被害**になる。
 *
 * しかもこの窓は一度「守るものが無い」という誤った根拠で撤去され、Blocker として
 * 差し戻された経緯がある（そのときは白紙のレビュアーが実機で測って初めて止まった）。
 * 同じ幸運を次も仮定しない。**このファイルが、その実測の代わりに毎回鳴る鈴である。**
 *
 * ## 何を検査しているか
 *
 * 「**JS が `data-settling="true"` を立てるその要素が、ポインタ入力を通さない規則に
 * 覆われていること**」を、経路3・経路4の両方について検査する。
 *
 * クラス名を文字列で決め打ちせず、実際に描画した DOM から「属性が立った要素」を取り、
 * **その要素と同じ姿をした見本要素（プローブ）**を組み立てて、CSS ソース上の各規則の
 * セレクタに `Element.matches()` で当てる。**セレクタを自前で読み解かず、jsdom の
 * セレクタエンジンに解釈させる**のがこの照合の要である。自前の文字列処理は
 * `:is(.x, :hover)` のような書き方で静かに破れる（実際に一度破れた。カンマで割って
 * から絞り込みを探していたため、`:is(` の中のカンマで絞り込みが分離してしまった）。
 *
 * 判定は次の 2 つを**同時に**満たしたときだけ「守られている」とする。
 *
 *  1. `data-settling="true"` を持つ見本要素が、その規則のセレクタに一致する
 *  2. 属性を持たない見本要素は、そのセレクタに一致**しない**
 *
 * 2 を要求するのは、`.introPhase { pointer-events: none }` のような**常時**効く規則を
 * 「保護」と数えないため（それは保護ではなく別の不具合である）。
 *
 * 見本要素は**位置の違う 2 通り**（親の唯一の子／5 人きょうだいの 2 番目）を作り、
 * **どちらでも**一致することを求める。こうすると `:first-child` や `:nth-child(2)`
 * のような「位置による絞り込み」は片方でしか一致せず、保護と認められない。
 *
 * これにより
 *
 *  - 規則が消えれば落ちる（＝守りたいこと）
 *  - クラス名を CSS と TSX の両方で揃えて改名しただけでは落ちない（＝偽陽性を出さない）
 *  - `data-settling` が規則の無い別の要素へ移されたら落ちる
 *  - 規則は残っていても**適用先が絞り込まれた**ら落ちる
 *    （`:hover` / `:focus-within` / `::before` / 実際には付かないクラス / 位置指定。
 *    `:is()` や `:where()` の括弧の中に隠しても、エンジンが解釈するので同じく落ちる）
 *
 * となる。「セレクタ文字列の完全一致」に寄せなかったのはこのためで、
 * `.resultPhase[data-settling="true"]` という**綴り**ではなく
 * 「その要素・その条件・その宣言」という**意味**のほうを見ている。
 *
 * ## このテストが見ないもの（正直な限界）
 *
 *  - **カスケード**は評価しない。後続規則や外部 CSS で `pointer-events: auto` に
 *    上書きされていても気づけない（jsdom で CSS を評価できない以上、ここが限界）。
 *  - 規則が**実機で効いていること**そのものは実ブラウザでしか確かめられない。
 *    ここが守るのは「規則がソースから消えていないこと」である。
 *
 * どちらも「消えたら気づける」ことより優先度が低いと判断した。厳密さを追って
 * 偽陽性で鈴を止められるより、鳴り続けるほうが来訪者の利益になる。
 *
 * ## 判定が倒れる向きと、残っている穴
 *
 * **この節の「落ちる」「通る」はすべて、実際に `QuizContainer.module.css` の 2 規則を
 * その形へ書き換えてこのテストを走らせ、確かめたものである。**「たぶん捕まえられる」で
 * 書かない——かつてここに、試さずに書いた偽の断言が入った。
 *
 * ### 倒れる向きは、実例ではなく構造で決まる
 *
 * この節はかつて「捕まえる変形」「見逃す変形」を実例で数え上げていた。実例の集合は
 * 閉じないので、書けば書くほど**列挙に無い綴り**が見つかる（実際に 3 巡続けて
 * そう指摘された）。倒れる向きは `createProbe` の作りから一意に決まるのだから、
 * 数え上げるべきは実例ではなくその規則のほうである。
 *
 * **見本要素が実物と揃えているのは tagName・class・`data-settling` の 3 つだけ。**
 * それ以外は何も再現しない——他の属性も、子も、祖先も、文書への接続も、実際の状態も。
 * 見本要素は**素の・空の・切り離された**要素であり、親はクラスを持たない素の `div`、
 * 文書には繋がっておらず、hover もフォーカスもされていない。実物が必ず持つ
 * `role="region"` / `aria-label` / `tabIndex={-1}`（`QuizContainer.tsx` の intro 領域と
 * result 領域）すら、見本要素は持たない。
 *
 * ゆえに、規則に絞り込みが付いているとき——
 *
 * **その規則が保護と認められるかを決めているのは、実物ではなく「素の見本要素」である。**
 *
 *  - 素の見本要素が**満たす**絞り込み → **通る**。実物が満たすとは限らないので、
 *    実物への保護がゼロでも通る（**fail-open**）。
 *  - 素の見本要素が**満たさない**絞り込み → **落ちる**。実物が満たしていて、
 *    現に守られていても落ちる（**fail-closed**）。
 *
 * 基準は**綴りの正負ではなく「素の見本要素が満たすか」**であることに注意する。目安として
 * 否定形が前者・正方向が後者に来るが、`:empty` は正方向の綴りで**通り**、`:not(:empty)` は
 * 否定形で**落ちる**（どちらも実測）。
 *
 * この 1 つの規則で、属性・サブツリー・祖先・状態が同時に閉じる。**以下は網羅ではなく、
 * 上の規則から導けるものを実測で裏取りした例である**（新しい綴りに出会ったら、列挙を
 * 探すのではなく「素の見本要素がそれを満たすか」を考えれば足りる）。
 *
 *  | 依存先 | 素の見本要素が満たす → 通る | 素の見本要素が満たさない → 落ちる |
 *  | --- | --- | --- |
 *  | 他の属性 | `:not([role])` / `:not([tabindex])` / `:not([aria-label])` | `[role="region"]` / `[tabindex]` |
 *  | 子（サブツリー） | `:empty` / `:not(:has(a))` / `:not(:has(*))` | `:has(a)` / `:has(button)` / `:not(:empty)` |
 *  | 祖先・文書への接続 | `:not(:is(body *))` | `.wrap .introPhase[…]` / `main > …` |
 *  | 実際の状態 | `:not(:hover)` / `:not(:focus)` | `:hover` / `:focus` |
 *
 * 括弧の中に隠しても同じである（`:where(:not([role]))` は通り、`:where([role="region"])` は
 * 落ちる。実測）。セレクタ全体をエンジンに解釈させているので、綴りの工夫は効かない。
 *
 * **fail-closed 側は意図どおりである。**沈黙して見逃すより、落ちて書き方を見直させるほうが
 * 来訪者の利益になる。「どこに置かれても守られている」と言えない規則を保護と数えない、
 * という判断でもある。
 *
 * **fail-open 側は、裏を返せば「素の空要素だけが満たす条件」を要求する綴りに限られる。**
 * 表の左列がそれで、`:not([role])` は実物が必ず `role="region"` を持つので保護ゼロ、
 * `:empty` / `:not(:has(a))` は実物が子を持つ（intro 領域は関連リンクの `<a>` を含み、
 * 独立したクイズ定義 15 本すべてが `relatedLinks` を持つ）ので保護ゼロ、`:not(:hover)` は
 * タッチで hover が張り付いた実機——このテストが守っている当の来訪者——で外れる。
 *
 * `:not(:focus)` だけは、**この機能自身のコードが保護ゼロを確定させる**。窓を開ける
 * `revealSwappedScreen()`（`QuizContainer.tsx`）が、**窓の立つ当の領域そのものを
 * `focus()` する**——intro / result どちらも、`focus()` を受ける ref と
 * `data-settling` が付く要素は同じ 1 つである。したがって**窓が開いているあいだ、
 * 実物はずっと `:focus` に一致する**。`:not(:hover)` の「実機ではたぶん外れる」が
 * 推定であるのに対し、こちらはコードを読めば決まる**決定的な**ゼロである。
 *
 * どれも実物を守らない規則である。**そのうえで「現実に起こりうる後退はこの形に
 * ならない」と見込んでいる——ただしこれは実測ではなく判断であり、反証されうる。**
 * 実測で言えるのはここまで：削除・`auto` 化・条件外し（常時 `none`）・`::before`・
 * タグ限定・属性値違い・CSS 側だけの改名・`@media` 包み・
 * `:is(.neverApplied, :hover)` への隠蔽は**すべて落ちる**ことを確かめてある。
 *
 * ### きょうだい位置だけは別扱い
 *
 * 位置は「実物に揃える」のではなく、**2 通りの置き場所（親の唯一の子／5 人きょうだいの
 * 2 番目）の両方で当たることを要求する**。したがって位置に依存する絞り込みは、両方に
 * 当たるなら通り、片方にしか当たらないなら落ちる。`:nth-child(-n+2)` /
 * `:not(:nth-child(3))` は通り、`:first-child` / `:nth-child(2)` / `:nth-child(odd)` /
 * `:has(+ *)` は落ちる（すべて実測。前 2 つは下の照合ロジックのテストが機械的に押さえている）。
 *
 * ### 見本要素の姿ではなく、規則の置かれ方で落ちるもの
 *
 *  - `@media` / `@supports` / `@layer` などに包まれた規則（`depth !== 0`）。
 *    「どの環境でも守られている」とは言えないため（実測：落ちる）。
 *  - `:global()` のような、jsdom のセレクタエンジンが解釈できない記法。
 *    例外は握り潰して「一致しない」に倒す（実測：落ちる）。
 *  - **CSS ネスト（`&`）を使い、宣言のあとに入れ子ブロックを置いた規則。**
 *    `parseCssRules` は入れ子ブロックの `}` で `buffer` を捨てるので、**入れ子より前に
 *    書かれた宣言が外側の規則から失われる**（前半は入れ子の**セレクタ側**へ吸われる）。
 *
 *        .introPhase[data-settling="true"] { pointer-events: none; &:hover { … } }
 *
 *    実測では外側の規則は `depth: 0`・セレクタは jsdom が解釈可能・**にもかかわらず
 *    `declarations` が空白だけになり `blocksPointerInput` が false で落ちる**
 *    （入れ子側は `selector: "pointer-events: none; &:hover"` になる）。上の構造則は
 *    見本要素の照合の話なので、ここには届かない。同じ見出しの他の 2 つと違い、
 *    **落ちる理由が規則の見た目のどこにも表れない**のがこの形の厄介なところである
 *    （`@media` は `depth`、`:global()` はセレクタで説明が付くが、これは両方とも正常）。
 *    直さずに開示だけしているのは、向きが **fail-closed**（守れているのに鈴が鳴る側）で
 *    **来訪者へのリスクがゼロ**であり、リポジトリの `.module.css` 163 本すべてで
 *    ネストの使用が現状 **0** だからである。ネストを使いたくなったら、`parseCssRules` を直すより
 *    先に**宣言を入れ子ブロックより後ろへ回す**ほうが早い（同じ規則をその順で書くと
 *    この照合は通る。実測）。
 *
 * ### 構造則の外にある穴：カスケード
 *
 * カスケードは `createProbe` の層の話ではなく、`blocksPointerInput` が「`none` を宣言して
 * いるか」しか見ず**宣言の重なりを評価しない**ことによる別の穴である。後続規則や外部 CSS
 * による上書きだけでなく、**同じブロックの中に後から `pointer-events: auto` を並べた形**
 * （`{ pointer-events: none; pointer-events: auto; }`）も通る（どちらも実測：通る）。
 *
 * なお、`.stage[data-settling="true"]` のように**同じ要素の別のクラス**で書かれた規則を
 * 保護と数えるのは見逃しではない。class は見本要素が実物と揃えている 3 つの軸の 1 つなので、
 * その規則は実際にその要素を守る。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import QuizContainer from "../QuizContainer";
import { activationOriginOfClick } from "../../quizProgress";
import { installQuizTestClock, type QuizTestClock } from "@/test/quizTestClock";
import { makeTestQuizMeta } from "@/test/quizFixtures";
import { clickAsPointer } from "@/test/quizClicks";
import type { ActivationOrigin } from "../../quizProgress";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

// ---------------------------------------------------------------------------
// CSS ソースの読み取りと、規則の意味的な照合
// ---------------------------------------------------------------------------

const CSS_PATH = join(
  process.cwd(),
  "src/play/quiz/_components/QuizContainer.module.css",
);

interface CssRule {
  /** `{` の直前までのセレクタ（改行・連続空白は 1 個の空白に潰してある）。 */
  selector: string;
  /**
   * そのブロックが持つ宣言のうち、**最後の入れ子ブロックの `}` より後ろにあるぶんだけ**。
   *
   * 入れ子ブロックの中身が含まれないだけでなく、**入れ子より前に書かれた宣言も
   * 失われる**（走査が入れ子の `}` で `buffer` を捨てるため）。入れ子が無ければ
   * ブロックが直接持つ宣言そのものになる——この CSS はそちらなので実害は無いが、
   * ネストを書くと保護が見えなくなる。冒頭コメント「規則の置かれ方で落ちるもの」を参照。
   */
  declarations: string;
  /** 入れ子の深さ。0 なら `@media` 等に包まれていないトップレベル。 */
  depth: number;
}

/**
 * CSS を「セレクタ + 宣言」の並びへ分解する。
 *
 * 正規表現 1 本で `セレクタ { 宣言 }` を拾うと `@media` のような入れ子で崩れるので、
 * 波括弧の対応を数えながら走査する。目的は完全な CSS パーサではなく
 * 「どのセレクタがどの宣言を持つか」を取り違えないこと。
 *
 * **CSS ネスト（`&`）だけは取り違える**——`declarations` の説明のとおり、入れ子より
 * 前の宣言が落ちる。倒れる向きは fail-closed（保護が見えなくなる＝落ちる）なので
 * 直していない。理由は冒頭コメント「規則の置かれ方で落ちるもの」を参照。
 */
function parseCssRules(css: string): CssRule[] {
  // コメント本文にはセレクタや宣言に見える文字列が普通に含まれる（この CSS の
  // 長い由来コメントがまさにそう）ので、先に落としてから走査する。
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  const openSelectors: string[] = [];
  let buffer = "";
  for (const char of source) {
    if (char === "{") {
      openSelectors.push(buffer.replace(/\s+/g, " ").trim());
      buffer = "";
    } else if (char === "}") {
      const selector = openSelectors.pop();
      // 対応しない `}`（＝壊れた CSS）。ここで投げても情報が増えないので捨てる。
      if (selector === undefined) continue;
      rules.push({
        selector,
        declarations: buffer,
        depth: openSelectors.length,
      });
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return rules;
}

/** `pointer-events: none`（`!important` 付きを含む）を宣言しているか。 */
function blocksPointerInput(declarations: string): boolean {
  return declarations
    .split(";")
    .some((declaration) =>
      /^\s*pointer-events\s*:\s*none\s*(!\s*important\s*)?$/i.test(declaration),
    );
}

/** 見本要素をどこに置くか。位置による絞り込みを弾くために 2 通り用意する。 */
interface ProbePlacement {
  /** きょうだいの人数。 */
  siblingCount: number;
  /** その中で見本要素が何番目か（0 始まり）。 */
  index: number;
}

/**
 * 見本要素の置き場所。**どちらの位置でも一致する**ことを保護の条件にする。
 *
 * 片方は「唯一の子」＝ `:first-child` / `:last-child` / `:only-child` /
 * `:nth-child(1)` に当たる位置、もう片方は「5 人きょうだいの 2 番目」＝そのどれにも
 * 当たらない位置。位置で絞り込む書き方はどちらか一方でしか一致しないので落ちる。
 */
const PROBE_PLACEMENTS: readonly ProbePlacement[] = [
  { siblingCount: 1, index: 0 },
  { siblingCount: 5, index: 1 },
];

/**
 * 「その要素と同じ姿をした見本要素」を組み立てる。
 *
 * 親は**クラスを持たない素の `div`** で、文書には繋がない。祖先を要求する規則
 * （`.wrap .introPhase[...]`）が一致しなくなるが、それは「どこに置かれても守られて
 * いる」とは言えない規則なので、落ちる側へ倒す意図どおりである。
 */
function createProbe(
  tagName: string,
  classNames: readonly string[],
  isSettling: boolean,
  placement: ProbePlacement,
): HTMLElement {
  const parent = document.createElement("div");
  let probe: HTMLElement | undefined;
  for (let position = 0; position < placement.siblingCount; position += 1) {
    if (position === placement.index) {
      probe = document.createElement(tagName);
      probe.className = classNames.join(" ");
      if (isSettling) probe.setAttribute("data-settling", "true");
      parent.appendChild(probe);
    } else {
      parent.appendChild(document.createElement("div"));
    }
  }
  // placement.index < siblingCount は PROBE_PLACEMENTS が満たしている。
  if (!probe) throw new Error("見本要素の置き場所の指定が壊れています");
  return probe;
}

/**
 * 見本要素がそのセレクタに一致するか。**解釈できないセレクタは「一致しない」に倒す。**
 *
 * `:global()` のような CSS Modules 固有の記法や、`@media (...)` のような at 規則の
 * 前文がここに来る。意味を判定できない以上、保護と認めるわけにはいかない。
 */
function matchesSelector(probe: Element, selector: string): boolean {
  try {
    return probe.matches(selector);
  } catch {
    return false;
  }
}

/**
 * その規則が「`classNames` を持つ `tagName` の要素を、settling 中に限って」
 * ポインタ入力から守っているか。
 *
 * - `data-settling` を持つ見本要素は**どの置き場所でも**一致すること
 * - 属性を持たない見本要素は**どの置き場所でも**一致しないこと（＝条件付きであること）
 *
 * 値なしの `[data-settling]` も通る。JS は `"true"` を立てるか属性ごと消すかの 2 択
 * （`data-settling={... ? "true" : undefined}`）なので、値なしでも同義に守れる。
 * 逆に `[data-settling="false"]` は見本要素に一致しないので通らない。
 */
function protectsSettlingElement(
  selector: string,
  tagName: string,
  classNames: readonly string[],
): boolean {
  const matchesAsSettling = PROBE_PLACEMENTS.every((placement) =>
    matchesSelector(
      createProbe(tagName, classNames, true, placement),
      selector,
    ),
  );
  const matchesWithoutSettling = PROBE_PLACEMENTS.some((placement) =>
    matchesSelector(
      createProbe(tagName, classNames, false, placement),
      selector,
    ),
  );
  return matchesAsSettling && !matchesWithoutSettling;
}

/**
 * `classNames` の要素が settling 中にポインタ入力を通さない、と宣言している規則を返す。
 *
 * `depth === 0` に限るのは、`@media`／`@supports` の中に入った規則は**条件付きの
 * 保護**でしかなく、「どの環境でも守られている」とは言えないため。この CSS は
 * 入れ子を持たないので、包まれた瞬間に落ちて気づけるほうがよい。
 */
function rulesBlockingPointerWhileSettling(
  rules: readonly CssRule[],
  classNames: readonly string[],
  tagName = "div",
): CssRule[] {
  return rules.filter(
    (rule) =>
      rule.depth === 0 &&
      blocksPointerInput(rule.declarations) &&
      protectsSettlingElement(rule.selector, tagName, classNames),
  );
}

/**
 * 描画後のクラス名から、CSS ソース上のクラス名の組を挙げる。
 *
 * CSS Modules は `.introPhase` を `_introPhase_9ac340` のような一意名へ変換するため、
 * DOM のクラス名をそのまま CSS ソースに探しても見つからない。変換規則に依存し
 * きらないよう、**剥がした組と素の組の両方**を候補にする（混ぜて 1 つの見本要素に
 * まとわせると、`.introPhase._introPhase_9ac340` のような実在しない組み合わせまで
 * 保護と数えてしまうため、**組ごとに別の見本要素**を立てる）。どちらの組も CSS の
 * 規則に当たらなければテストは（沈黙ではなく）落ちるので、変換規則が変わった場合も
 * 見逃しではなく失敗として表に出る。
 */
function sourceClassNameSets(runtimeClassNames: readonly string[]): string[][] {
  const unscoped = runtimeClassNames.map((runtimeClassName) => {
    const scoped = runtimeClassName.match(/^_(.+)_[0-9a-z]+$/i);
    return scoped ? scoped[1] : runtimeClassName;
  });
  const sets = [unscoped];
  if (unscoped.join(" ") !== runtimeClassNames.join(" ")) {
    sets.push([...runtimeClassNames]);
  }
  return sets;
}

const cssRules = parseCssRules(readFileSync(CSS_PATH, "utf8"));

/**
 * 「`data-settling="true"` が立ったこの要素は、ポインタ入力を通さない規則に
 * 覆われている」ことを検査する。
 */
function expectSettlingElementIsProtectedByCss(
  element: HTMLElement,
  pathLabel: string,
): void {
  expect(element).toHaveAttribute("data-settling", "true");
  const runtimeClassNames = element.className.split(/\s+/).filter(Boolean);
  const classNameSets = sourceClassNameSets(runtimeClassNames);
  const protectingRules = classNameSets.flatMap((classNames) =>
    // 見本要素はタグ名まで実物に合わせる（`section.introPhase[...]` のような
    // タグ付きの規則を「守っていない」と誤読しないため）。
    rulesBlockingPointerWhileSettling(
      cssRules,
      classNames,
      element.tagName.toLowerCase(),
    ),
  );
  expect(
    protectingRules.map((rule) => rule.selector),
    [
      `${pathLabel}: data-settling="true" が立つ要素を守る CSS 規則が見つかりません。`,
      `${CSS_PATH} に「.<クラス>[data-settling="true"] { pointer-events: none }」が必要です。`,
      `要素のクラス: ${runtimeClassNames.join(" ") || "(なし)"}`,
      `CSS ソース上の候補: ${classNameSets.map((set) => set.join(" ")).join(" / ")}`,
      "（規則自体はあるのにここで落ちる場合は、`:hover` などの絞り込みが付いていないか",
      "　確認してください。タッチの2打目には当たらないので保護と認めていません。）",
      "この規則が無いと、二重タップの2打目が入れ替わった先の操作要素に着弾し、",
      "来訪者は結果を見ないまま／もう一度遊べないまま別ページへ飛ばされます",
      "（実測で規則なし 12/30 離脱・規則あり 0/30）。",
    ].join("\n"),
  ).not.toHaveLength(0);
}

// ---------------------------------------------------------------------------
// 照合ロジック自身が空振りしていないことの検査
// ---------------------------------------------------------------------------

describe("settling 規則の照合ロジック（この検査が空振りでないこと）", () => {
  // 「規則が消えたら落ちる」ことは、実際に規則を消して確かめるだけでなく、
  // 照合が**通してはいけないものを通さない**ことでも担保する。ここが常に true を
  // 返す実装に退化すると、下の DOM 検査は静かに無意味になる。
  function isProtected(
    css: string,
    classNames: readonly string[] = ["introPhase"],
  ): boolean {
    return (
      rulesBlockingPointerWhileSettling(parseCssRules(css), classNames).length >
      0
    );
  }

  test("守っている書き方は通る（属性の順序・値の引用・!important の違いを含む）", () => {
    expect(
      isProtected(
        '.introPhase[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(true);
    expect(
      isProtected(
        '[data-settling="true"].introPhase { pointer-events: none; }',
      ),
    ).toBe(true);
    expect(
      isProtected("[data-settling].introPhase { pointer-events: none; }"),
    ).toBe(true);
    expect(
      isProtected(
        ".introPhase[data-settling='true'] { pointer-events: none !important; }",
      ),
    ).toBe(true);
    expect(
      isProtected(
        '.introPhase[data-settling="true"] {\n  color: red;\n  pointer-events: none;\n}',
      ),
    ).toBe(true);
    // `:where()` / `:is()` は絞り込みではない（詳細度の調整・列挙のための正当な書き方）
    expect(
      isProtected(
        ':where(.introPhase)[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(true);
    expect(
      isProtected(
        '.introPhase:is([data-settling="true"]) { pointer-events: none; }',
      ),
    ).toBe(true);
    // 括弧の中にカンマを書いた列挙も、そのどれかが実際に当たるなら保護である
    // （セレクタをエンジンに解釈させているので、カンマで割れて意味が壊れることはない）。
    expect(
      isProtected(
        ':is(.introPhase, .resultPhase)[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(true);
    // 同じ要素の別のクラスで書かれていても、その要素を実際に守るなら保護である。
    expect(
      isProtected('.stage[data-settling="true"] { pointer-events: none; }', [
        "stage",
        "introPhase",
      ]),
    ).toBe(true);
  });

  test("守っていない書き方は通さない", () => {
    // 規則ごと無い
    expect(isProtected(".introPhase { color: red; }")).toBe(false);
    // 条件が無い（常時 pointer-events: none は保護ではなく別の不具合）
    expect(isProtected(".introPhase { pointer-events: none; }")).toBe(false);
    // 宣言が違う
    expect(
      isProtected('.introPhase[data-settling="true"] { opacity: 0.5; }'),
    ).toBe(false);
    expect(
      isProtected(
        '.introPhase[data-settling="true"] { pointer-events: auto; }',
      ),
    ).toBe(false);
    // 別のクラスが守られているだけ（カンマ区切りは別々の要素）
    expect(
      isProtected(
        '.introPhase, .other[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(false);
    // 子孫（守られるのは中の要素であって .introPhase 自身ではない）
    expect(
      isProtected(
        '.introPhase [data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(false);
    // クラス名の前方一致で誤読しない
    expect(
      isProtected(
        '.introPhaseExtra[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(false);
    // 絞り込みの擬似クラスが付いた形は保護にならない。`:hover` はタッチの2打目
    // ——このテストが守っている当の来訪者——には当たらない。
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:hover { pointer-events: none; }',
      ),
    ).toBe(false);
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:focus-within { pointer-events: none; }',
      ),
    ).toBe(false);
    // 擬似要素は要素本体を守らない
    expect(
      isProtected(
        '.introPhase[data-settling="true"]::before { pointer-events: none; }',
      ),
    ).toBe(false);
    // `:where()` / `:is()` の中に絞り込みを隠しても同じ
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:where(:hover) { pointer-events: none; }',
      ),
    ).toBe(false);
    // **括弧の中にカンマを挟んで絞り込みを隠しても同じ。**
    // ここはかつて実際に開いていた穴で、`:is(` の中のカンマでセレクタを割ってから
    // 絞り込みを探していたため、`.neverApplied` 側の断片だけが残って
    // 「クラスと属性があり絞り込みが無い」と誤読され、保護ゼロのまま通っていた。
    // いまはセレクタ全体をエンジンに解釈させるので、綴りの工夫では抜けられない。
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:is(.neverApplied, :hover) { pointer-events: none; }',
      ),
    ).toBe(false);
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:is(:hover, .neverApplied) { pointer-events: none; }',
      ),
    ).toBe(false);
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:where(.neverApplied, :focus) { pointer-events: none; }',
      ),
    ).toBe(false);
    // 擬似クラスでなくても、実際には付かないクラスで絞り込めば保護にならない
    expect(
      isProtected(
        '.introPhase.neverApplied[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(false);
    // 位置による絞り込みも保護にならない（2 通りの置き場所の片方でしか当たらない）
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:first-child { pointer-events: none; }',
      ),
    ).toBe(false);
    expect(
      isProtected(
        '.introPhase[data-settling="true"]:nth-child(2) { pointer-events: none; }',
      ),
    ).toBe(false);
    // 別のタグに限定した規則も、その要素には当たらない
    expect(
      isProtected(
        'section.introPhase[data-settling="true"] { pointer-events: none; }',
      ),
    ).toBe(false);
    // `[data-settling]` の値違いは守りにならない
    expect(
      isProtected(
        '.introPhase[data-settling="false"] { pointer-events: none; }',
      ),
    ).toBe(false);
    // 条件付き（@media の中）は「どの環境でも守られている」と言えない
    expect(
      isProtected(
        '@media (hover: hover) { .introPhase[data-settling="true"] { pointer-events: none; } }',
      ),
    ).toBe(false);
    // 由来コメントの中に規則の綴りがあっても実体ではない
    expect(
      isProtected(
        '/* かつては .introPhase[data-settling="true"] { pointer-events: none } を掛けていた */\n.introPhase { color: red; }',
      ),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 実際に描画して、属性が立つ要素と規則を突き合わせる
// ---------------------------------------------------------------------------

// analytics.ts は window.gtag を直接呼ぶのでスタブを差し込む。
const gtagSpy = vi.fn();
// QuizContainer は遷移間隔ガード（B-620）を持つため、テストからは
// 「来訪者が時間をかけて答えた」ことを時計を進めて表現する。
let clock: QuizTestClock;

// ResultCard は重量級なので軽量モック。ただし「もう一度挑戦する」だけは本物と同じ
// 結線（click の発生源を親へ渡す）で置く——経路4の窓は**ポインタ由来の retry**でしか
// 立たないため、ここを潰すと経路4を検証できなくなる。
vi.mock("../ResultCard", () => ({
  default: ({ onRetry }: { onRetry: (origin: ActivationOrigin) => void }) => (
    <div data-testid="result-card">
      <button
        type="button"
        onClick={(event) => onRetry(activationOriginOfClick(event.detail))}
      >
        もう一度挑戦する
      </button>
    </div>
  ),
}));
vi.mock("../ResultExtraLoader", () => ({ default: () => null }));
vi.mock("../ResultNextContent", () => ({ default: () => null }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

/** 最小の personality quiz（1 問で結果まで届く）。 */
function makeOneQuestionPersonalityQuiz(): QuizDefinition {
  const meta: QuizMeta = makeTestQuizMeta({
    // determineResult（汎用 personality 判定）を通る slug。
    slug: "animal-personality",
    title: "動物診断",
    type: "personality",
    category: "personality",
    questionCount: 1,
  });
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1a", text: "選択1A", points: { "type-a": 1 } },
        { id: "c1b", text: "選択1B", points: { "type-b": 1 } },
      ],
    },
  ];
  const results: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ];
  return { meta, questions, results };
}

describe("QuizContainer — settling 窓を成立させている CSS 規則（B-620）", () => {
  let originalScrollIntoView: PropertyDescriptor | undefined;

  beforeEach(() => {
    gtagSpy.mockClear();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
    clock = installQuizTestClock();
    originalScrollIntoView = Object.getOwnPropertyDescriptor(
      window.HTMLElement.prototype,
      "scrollIntoView",
    );
    // jsdom は scrollIntoView 未実装。リビールがこれを呼ぶので関数を差し込む。
    window.HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as HTMLElement["scrollIntoView"];
  });

  afterEach(() => {
    clock.restore();
    if (originalScrollIntoView) {
      Object.defineProperty(
        window.HTMLElement.prototype,
        "scrollIntoView",
        originalScrollIntoView,
      );
    } else {
      Reflect.deleteProperty(window.HTMLElement.prototype, "scrollIntoView");
    }
  });

  /** 1 問の personality を完走して result phase へ到達する（ポインタ操作）。 */
  async function playToResult(): Promise<void> {
    render(<QuizContainer quiz={makeOneQuestionPersonalityQuiz()} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "選択1A" }));
    });
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
  }

  /**
   * いま窓が立っている要素を残らず拾って、すべてが規則に覆われていることを見る。
   *
   * 名指しで領域を取るだけだと、窓が別の要素へ移ったときに「名指しした要素には
   * 属性が無い」で落ちる形になり、失敗の理由が読みにくい。**窓が立った要素はどれも
   * 守られている**という形にしておけば、要素が変わっても検査の意味は変わらない。
   */
  function expectEverySettlingElementIsProtected(pathLabel: string): void {
    const settlingElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-settling="true"]'),
    );
    // 窓自体が立たなくなったら（JS 側の後退）ここで落ちる。0 件を素通りさせない。
    expect(
      settlingElements.length,
      `${pathLabel}: data-settling="true" の要素が 1 つも無い（窓そのものが立っていない）`,
    ).toBeGreaterThan(0);
    for (const element of settlingElements) {
      expectSettlingElementIsProtectedByCss(element, pathLabel);
    }
  }

  test("経路3（結果リビール）: data-settling が立つ結果領域はポインタ入力を通さない規則に覆われている", async () => {
    await playToResult();
    // 窓が立つのは結果領域（この経路で守りたいのは「結果を見る前に離脱しないこと」）。
    expect(screen.getByRole("region", { name: "診断結果" })).toHaveAttribute(
      "data-settling",
      "true",
    );
    expectEverySettlingElementIsProtected("経路3（結果リビール）");
  });

  test("経路4（もう一度挑戦する）: data-settling が立つ intro 領域はポインタ入力を通さない規則に覆われている", async () => {
    await playToResult();
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "もう一度挑戦する" }));
    });
    // 窓が立つのは intro 領域（この経路で守りたいのは「もう一度遊べること」）。
    expect(
      screen.getByRole("region", { name: "診断のはじめ" }),
    ).toHaveAttribute("data-settling", "true");
    expectEverySettlingElementIsProtected("経路4（もう一度挑戦する）");
  });
});
