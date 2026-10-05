/**
 * デイリーゲームで、遊んだ来訪者が今日の回を開き直したときに、記録を戻して盤の行や結果が出ても下のものが
 * 動かないよう、本体を描く前にその場所を取っておく仕組み。解き終えた回を、共有のボタンまで送った所で読み込み
 * 直したときや、ほかのページから戻ったときも、ブラウザが戻す送りの位置に同じ中身が来る。
 *
 * サーバーの HTML は初めての来訪者の組み（盤の空の1行と入力欄）で描かれる。記録は端末にしか無いので、本体より
 * 前に置いたスクリプト（savedLayoutScript）が、本体を読む前に記録を読み、<head> に足す <style> で <html>（:root）
 * の値を書く。盤などの CSS と結果の区画（ReservedResultArea）がこの値の高さを取っておき、場所が要らなくなったら
 * 値を外す（releaseSavedLayout）。<html> の属性でなく <head> の要素に書くのは、水和が <html> の属性をサーバーの
 * HTML と比べるからである。
 */

/**
 * 結果の区画の値の名前と、その高さを覚えておく端末の記録のキー。解き終えた回では、読み込むあいだ入力欄を
 * 見せず（そこには結果が出る）、前に同じ画面で描いた結果の区画の高さを取っておく。
 */
export interface ResultAreaNames {
  /** 結果の区画の高さを書く値の名前。 */
  heightProperty: string;
  /** 解き終えた回で、読み込むあいだ入力欄を見せないための値の名前。 */
  inputVisibilityProperty: string;
  /** 結果の区画の高さを覚えておく端末の記録のキー。 */
  storageKey: string;
}

/** ゲームの名前（slug）から、結果の区画の値の名前と記録のキーを決める。 */
export function resultAreaNames(slug: string): ResultAreaNames {
  return {
    heightProperty: `--${slug}-result-height`,
    inputVisibilityProperty: `--${slug}-input-visibility`,
    storageKey: `${slug}-result-height`,
  };
}

/** 本体の前のスクリプトに渡す設定。スクリプトの文に JSON で書き込むので、値はどれも JSON にできるものにする。 */
export type SavedLayoutOptions = SavedLayoutBaseOptions &
  (GuessRowsOptions | { [K in keyof GuessRowsOptions]?: never });

interface SavedLayoutBaseOptions {
  /** 値を書く <style> の id。 */
  styleId: string;
  /**
   * 選んだ難易度を記録したキー。難易度を選べるゲームで渡す。渡さないゲームでは、難易度を ""（空の文字列）として
   * 扱う。
   */
  difficultyKey?: string;
  /**
   * 回の記録のキー。難易度を選べるゲームでは、難易度ごとの記録のキーの頭（キーは頭と難易度をつないだもの）。
   * 難易度の無いゲームでは、記録のキーそのもの。記録は日付（"YYYY-MM-DD"）ごとの回を持ち、回は status
   * （"playing" と、解き終えた回の finishedStatuses）を持つ。
   */
  historyKeyPrefix: string;
  /** 推測の行を積まないゲームで、解き終えた回の status（既定: "won" と "lost"）。 */
  finishedStatuses?: string[];
  /**
   * 解き終えた回の結果の区画。入力欄を見せない値と、前に同じ日・同じ難易度・同じ画面の幅と字の大きさで描いた
   * ときの結果の区画の高さ（ReservedResultArea が覚えたもの）を書く。その大きさで描いたことが無ければ、同じ字の
   * 大きさでいちばん近い幅で描いた高さから見積もる。同じ字の大きさで描いたことも無ければ、画面の高さ（100vh）を
   * 書く。結果の区画（結果のボックス・共有・次の問題まで・ほかのゲームへの案内）は画面より高いので、区画の下の
   * ものは読み込みのあいだ画面の外にあり、結果が出ても見えている所は動かない。
   */
  resultArea?: ResultAreaNames;
  /**
   * 回の記録の配列（field）の要素ごとに書く値（ナカマワケの当てた組ごとに、盤の組と語の格子の語の見せ方を
   * 決めるなど）。要素ごとに、名前の頭（propertyPrefix）と要素をつないだ名前の値に value を書く。
   */
  byRecordItem?: { field: string; propertyPrefix: string; value: string }[];
  /**
   * 回の記録の配列（field）の要素の数で決まる値。values[要素の数] を書く（要素の数が values より多いときは
   * 最後の値）。
   */
  byRecordLength?: { field: string; property: string; values: string[] }[];
  /**
   * 前に同じ日・同じ難易度・同じ画面の幅と字の大きさで描いたときの高さ（saveResultHeight が storageKey に
   * 覚えたもの）を書く区画。文字を大きくしたときに行が折り返して高さが行の数で決まらない区画（四字キメルの
   * ヒントの帯など）で、描いた高さをそのまま取っておく。遊んでいる回でも解き終えた回でも書く。
   */
  rememberedHeights?: { property: string; storageKey: string }[];
}

/**
 * 推測の行を盤に積むゲームの値。回の記録が推測の判定の並び（feedbacks）を持つゲームで、3つをそろえて渡す。
 * 渡すと、推測が1つも無い回には何も書かず、送れる数に届かない「lost」の回は途中の回として扱う。渡さない
 * ゲームでは、status が finishedStatuses のどれかの回を解き終えた回とし、結果の区画の値だけを書く。
 */
interface GuessRowsOptions {
  /** 1回に送れる推測の数。 */
  maxGuesses: number;
  /** 盤の行の数（遊んでいる回は次の推測を入れる行を含む）を書く値の名前。 */
  boardRowsProperty: string;
  /**
   * 推測の回数で決まる値（四字キメルのヒントの帯の行の数など）。values[推測の回数] を書く。解き終えた回で値が
   * 違うものは、finishedValues[推測の回数] を書く。
   */
  byGuessCount?: {
    property: string;
    values: readonly number[];
    finishedValues?: readonly number[];
  }[];
}

/**
 * 描いた区画の高さの記録。同じ日・同じ難易度のときだけ使い、画面の幅と字の大きさ（"375|16px"）ごとに高さを
 * 持つ。
 */
interface ResultHeightRecord {
  date: string;
  difficulty: string;
  heights: Record<string, number>;
}

/**
 * 端末に記録した今日の回から、盤の行の数などを <head> に足す <style> で <html>（:root）の値にする。
 *
 * サーバーで描いた本体では、この関数の文をそのまま本体の前のスクリプトで動かす（savedLayoutScript）。そのため、
 * この関数は外の名前を参照せず、値の名前と記録のキーは options で受け取る。
 */
export function reserveSavedLayout(options: SavedLayoutOptions): void {
  let entry:
    | ({ feedbacks?: unknown[]; status?: string } & Record<string, unknown>)
    | undefined;
  let today: string;
  let difficulty = "";
  let resultHeight: Partial<ResultHeightRecord> | null = null;
  const remembered: {
    property: string;
    record: Partial<ResultHeightRecord> | null;
  }[] = [];
  try {
    if (options.difficultyKey !== undefined) {
      const saved = localStorage.getItem(options.difficultyKey);
      difficulty =
        saved === "beginner" || saved === "advanced" ? saved : "intermediate";
    }
    today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const history = JSON.parse(
      localStorage.getItem(options.historyKeyPrefix + difficulty) ?? "{}",
    ) as Record<string, typeof entry>;
    entry = history[today];
    if (options.resultArea) {
      resultHeight = JSON.parse(
        localStorage.getItem(options.resultArea.storageKey) ?? "null",
      ) as Partial<ResultHeightRecord> | null;
    }
    for (const { property, storageKey } of options.rememberedHeights ?? []) {
      remembered.push({
        property,
        record: JSON.parse(
          localStorage.getItem(storageKey) ?? "null",
        ) as Partial<ResultHeightRecord> | null,
      });
    }
  } catch {
    return;
  }
  const values: string[] = [];
  let finished: boolean;
  if (options.maxGuesses !== undefined) {
    const guessCount = Array.isArray(entry?.feedbacks)
      ? entry.feedbacks.length
      : 0;
    if (guessCount === 0) return;
    // 負けを記録した古い形の途中の回（送れる数に届かない「lost」）は、途中の回として戻る。
    finished =
      entry?.status === "won" ||
      (entry?.status === "lost" && guessCount >= options.maxGuesses);
    values.push(
      `${options.boardRowsProperty}:${guessCount + (finished ? 0 : 1)}`,
    );
    for (const {
      property,
      values: byCount,
      finishedValues,
    } of options.byGuessCount ?? []) {
      const byCountNow = finished && finishedValues ? finishedValues : byCount;
      values.push(`${property}:${byCountNow[guessCount]}`);
    }
  } else {
    const finishedStatuses = options.finishedStatuses ?? ["won", "lost"];
    finished = finishedStatuses.indexOf(String(entry?.status)) !== -1;
  }
  for (const { field, propertyPrefix, value } of options.byRecordItem ?? []) {
    const items = entry?.[field];
    if (!Array.isArray(items)) continue;
    for (const item of items) values.push(`${propertyPrefix}${item}:${value}`);
  }
  for (const { field, property, values: byLength } of options.byRecordLength ??
    []) {
    const items = entry?.[field];
    if (!Array.isArray(items)) continue;
    values.push(
      `${property}:${byLength[Math.min(items.length, byLength.length - 1)]}`,
    );
  }
  // 覚えた高さは、同じ日・同じ難易度のものだけを使う。同じ画面の幅と字の大きさで描いた高さがあればそれを使う。
  // 結果の区画は、無ければ同じ字の大きさでいちばん近い幅の高さを、文の組まれる幅の比で見積もって使う。
  const fontSize = getComputedStyle(document.documentElement).fontSize;
  const rootPx = parseFloat(fontSize) || 16;
  // 文の組まれる幅: コンテナの左右（画面の端からの 16px・線・内側の余白）と結果のボックスの線と内側の余白を
  // 除いた幅で、本文の幅（40rem）を超えない。
  const textWidth = (width: number): number =>
    Math.max(1, Math.min(width - (width < 45 * rootPx ? 54 : 70), 40 * rootPx));
  const heightFor = (
    record: Partial<ResultHeightRecord> | null,
    estimate: boolean,
  ): number | null => {
    if (
      !record ||
      record.date !== today ||
      record.difficulty !== difficulty ||
      !record.heights
    ) {
      return null;
    }
    const exact = record.heights[`${window.innerWidth}|${fontSize}`];
    if (typeof exact === "number") return exact;
    if (!estimate) return null;
    let nearest: { width: number; height: number } | null = null;
    for (const key of Object.keys(record.heights)) {
      const [width, font] = key.split("|");
      const height = record.heights[key];
      if (font !== fontSize || typeof height !== "number") continue;
      const w = Number(width);
      if (
        !nearest ||
        Math.abs(w - window.innerWidth) <
          Math.abs(nearest.width - window.innerWidth)
      ) {
        nearest = { width: w, height };
      }
    }
    if (!nearest) return null;
    return Math.round(
      (nearest.height * textWidth(nearest.width)) /
        textWidth(window.innerWidth),
    );
  };
  for (const { property, record } of remembered) {
    // 行の短い区画（ヒントの帯）は幅で高さが比例しないので、同じ大きさの画面で描いた高さだけを使う。
    const height = heightFor(record, false);
    if (height !== null) values.push(`${property}:${height}px`);
  }
  if (finished && options.resultArea) {
    values.push(`${options.resultArea.inputVisibilityProperty}:hidden`);
    const height = heightFor(resultHeight, true);
    values.push(
      `${options.resultArea.heightProperty}:${height === null ? "100vh" : `${height}px`}`,
    );
  }
  if (values.length === 0) return;
  const style = document.createElement("style");
  style.id = options.styleId;
  style.textContent = `:root{${values.join(";")}}`;
  document.head.append(style);
}

/** サーバーの HTML で本体の前に置くスクリプトの文。 */
export function savedLayoutScript(options: SavedLayoutOptions): string {
  // 設定の文字列に「</script>」があってもスクリプトを閉じないよう、「<」を JSON の書き方（\u003c）で書く。
  const json = JSON.stringify(options).replace(/</g, "\\u003c");
  return `(${reserveSavedLayout.toString()})(${json})`;
}

/** 本体の前のスクリプトが取っておいた場所を外す。 */
export function releaseSavedLayout(styleId: string): void {
  document.getElementById(styleId)?.remove();
}

/**
 * 描いた区画の高さを覚えておく（解き終えた回の結果の区画・rememberedHeights の区画）。開き直したとき、本体の前の
 * スクリプトがこの高さを取っておく。高さは画面の幅と字の大きさで変わるので、その組ごとに覚える。同じ日・同じ
 * 難易度のあいだは、ほかの組の高さも残す（別の大きさの画面で開いたときの見積もりに使う）。
 */
export function saveResultHeight(
  key: string,
  date: string,
  difficulty: string,
  height: number,
): void {
  const size = `${window.innerWidth}|${getComputedStyle(document.documentElement).fontSize}`;
  try {
    let heights: Record<string, number> = {};
    const saved = JSON.parse(
      window.localStorage.getItem(key) ?? "null",
    ) as Partial<ResultHeightRecord> | null;
    if (
      saved &&
      saved.date === date &&
      saved.difficulty === difficulty &&
      saved.heights
    ) {
      heights = saved.heights;
    }
    heights[size] = Math.ceil(height);
    const record: ResultHeightRecord = { date, difficulty, heights };
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // 覚えておけなくても、開き直したときに結果が出たあと下が動くだけで、遊ぶことはできる。
  }
}
