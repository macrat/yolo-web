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
   * （"playing"・"won"・"lost"）を持つ。
   */
  historyKeyPrefix: string;
  /**
   * 解き終えた回の結果の区画。入力欄を見せない値と、前に同じ日・同じ難易度・同じ画面の幅と字の大きさで描いた
   * ときの結果の区画の高さ（ReservedResultArea が覚えたもの）を書く。
   */
  resultArea?: ResultAreaNames;
}

/**
 * 推測の行を盤に積むゲームの値。回の記録が推測の判定の並び（feedbacks）を持つゲームで、3つをそろえて渡す。
 * 渡すと、推測が1つも無い回には何も書かず、送れる数に届かない「lost」の回は途中の回として扱う。渡さない
 * ゲームでは、status が "won" か "lost" の回を解き終えた回とし、結果の区画の値だけを書く。
 */
interface GuessRowsOptions {
  /** 1回に送れる推測の数。 */
  maxGuesses: number;
  /** 盤の行の数（遊んでいる回は次の推測を入れる行を含む）を書く値の名前。 */
  boardRowsProperty: string;
  /** 推測の回数で決まる値（四字キメルのヒントの帯の行の数など）。values[推測の回数] を書く。 */
  byGuessCount?: { property: string; values: readonly number[] }[];
}

/** 結果の区画の高さの記録。同じ日・同じ難易度・同じ画面の幅と字の大きさのときだけ使う。 */
interface ResultHeightRecord {
  date: string;
  difficulty: string;
  viewportWidth: number;
  fontSize: string;
  height: number;
}

/**
 * 端末に記録した今日の回から、盤の行の数などを <head> に足す <style> で <html>（:root）の値にする。
 *
 * サーバーで描いた本体では、この関数の文をそのまま本体の前のスクリプトで動かす（savedLayoutScript）。そのため、
 * この関数は外の名前を参照せず、値の名前と記録のキーは options で受け取る。
 */
export function reserveSavedLayout(options: SavedLayoutOptions): void {
  let entry: { feedbacks?: unknown[]; status?: string } | undefined;
  let today: string;
  let difficulty = "";
  let resultHeight: Partial<ResultHeightRecord> | null = null;
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
    for (const { property, values: byCount } of options.byGuessCount ?? []) {
      values.push(`${property}:${byCount[guessCount]}`);
    }
  } else {
    finished = entry?.status === "won" || entry?.status === "lost";
  }
  if (finished && options.resultArea) {
    values.push(`${options.resultArea.inputVisibilityProperty}:hidden`);
    if (
      resultHeight &&
      resultHeight.date === today &&
      resultHeight.difficulty === difficulty &&
      resultHeight.viewportWidth === window.innerWidth &&
      resultHeight.fontSize ===
        getComputedStyle(document.documentElement).fontSize &&
      typeof resultHeight.height === "number"
    ) {
      values.push(
        `${options.resultArea.heightProperty}:${resultHeight.height}px`,
      );
    }
  }
  if (values.length === 0) return;
  const style = document.createElement("style");
  style.id = options.styleId;
  style.textContent = `:root{${values.join(";")}}`;
  document.head.append(style);
}

/** サーバーの HTML で本体の前に置くスクリプトの文。 */
export function savedLayoutScript(options: SavedLayoutOptions): string {
  return `(${reserveSavedLayout.toString()})(${JSON.stringify(options)})`;
}

/** 本体の前のスクリプトが取っておいた場所を外す。 */
export function releaseSavedLayout(styleId: string): void {
  document.getElementById(styleId)?.remove();
}

/**
 * 解き終えた回の結果の区画の高さを覚えておく。開き直したとき、本体の前のスクリプトがこの高さを取っておく。
 * 高さは画面の幅と字の大きさで変わるので、その2つも一緒に覚え、同じときだけ使う。
 */
export function saveResultHeight(
  key: string,
  date: string,
  difficulty: string,
  height: number,
): void {
  const record: ResultHeightRecord = {
    date,
    difficulty,
    viewportWidth: window.innerWidth,
    fontSize: getComputedStyle(document.documentElement).fontSize,
    height: Math.ceil(height),
  };
  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // 覚えておけなくても、開き直したときに結果が出たあと下が動くだけで、遊ぶことはできる。
  }
}
