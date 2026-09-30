import { loadDefaultJapaneseParser } from "budoux";
import { describe, expect, test } from "vitest";
import {
  boundaryScores,
  cannotEndLine,
  cannotStartLine,
  followsPhraseRules,
  isClosingBracket,
  parenDepthAfter,
  splitIntoPhrases,
} from "@/lib/phrase-breaks";
import { quizBySlug } from "@/play/quiz/registry";
import { toolsBySlug } from "@/tools/registry";

const characterPersonalityTypeNames = (
  quizBySlug.get("character-personality")?.results ?? []
).map((result) => result.title);

const allQuizHeadings = [...quizBySlug.values()].flatMap((quiz) => [
  quiz.meta.title,
  ...quiz.results.map((result) => result.title),
]);

/** 区切りの性質を、BudouX の分け方に依らず見るための見出しの文。 */
const headings = new Set([
  ...allQuizHeadings,
  "Unix タイムスタンプ変換ツール",
  "JSON 整形ツール",
  "CSS グラデーション生成ツール",
  "カテゴリから探す（10）",
  "ツールを10個から30個に拡充しました: プログラマティックSEO戦略の実践",
  "Markdownが思い通りに表示されない：改行・表・エスケープを仕組みから直す",
  "締切3分前に5手先を読む炎の策士",
  "晴れの日に傘を7本持って山に登る備えの王",
]);

const NO_LINE_START =
  /^[)\]）］」』】〕〉》、。，．,.！？!?…‥・：:ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶー]/u;
const NO_LINE_END = /[(\[（［「『【〔〈《]$/u;

function boundaries(phrases: string[]): [string, string][] {
  return phrases.slice(1).map((after, index) => [phrases[index], after]);
}

/** 並びの境目の位置（UTF-16 の位置）。 */
function boundaryOffsets(pieces: string[]): number[] {
  const offsets: number[] = [];
  let offset = 0;
  for (const piece of pieces.slice(0, -1)) {
    offset += piece.length;
    offsets.push(offset);
  }
  return offsets;
}

const budoux = loadDefaultJapaneseParser();

function parenDepth(text: string): number {
  let depth = 0;
  for (const ch of text) {
    if (/[(（]/u.test(ch)) depth += 1;
    else if (/[)）]/u.test(ch)) depth = Math.max(0, depth - 1);
  }
  return depth;
}

const segmenter = new Intl.Segmenter("ja", { granularity: "word" });

/** offset が、漢字か片仮名を含む Intl.Segmenter の語の中か。 */
function isInsideKanjiOrKatakanaWord(text: string, offset: number): boolean {
  return [...segmenter.segment(text)].some(
    ({ segment, index }) =>
      index < offset &&
      offset < index + segment.length &&
      /[\p{Script=Han}\p{Script=Katakana}]/u.test(segment),
  );
}

describe("splitIntoPhrases", () => {
  test("character-personality のタイプ名は24件ある", () => {
    expect(characterPersonalityTypeNames).toHaveLength(24);
  });

  test("区切りをつなぐと元の文と一字も違わず、空の文節を持たない", () => {
    for (const text of headings) {
      const phrases = splitIntoPhrases(text);
      expect(phrases.join(""), text).toBe(text);
      expect(
        phrases.every((phrase) => phrase.length > 0),
        text,
      ).toBe(true);
    }
  });

  test("数とそれに続く字が別の文節に分かれない", () => {
    for (const text of headings) {
      for (const [before, after] of boundaries(splitIntoPhrases(text))) {
        expect(`${before}|${after}`, text).not.toMatch(
          /(?:^|[^A-Za-z0-9０-９])[0-9０-９]+\|\S/u,
        );
      }
    }
  });

  test("行の頭に置かない字で始まる文節が無く、開き括弧で終わる文節が無い", () => {
    for (const text of headings) {
      for (const [before, after] of boundaries(splitIntoPhrases(text))) {
        expect(after, text).not.toMatch(NO_LINE_START);
        expect(before, text).not.toMatch(NO_LINE_END);
      }
    }
  });

  test("最後の文節が1字にならない", () => {
    for (const text of headings) {
      const phrases = splitIntoPhrases(text);
      if (phrases.length > 1) {
        expect([...phrases[phrases.length - 1]].length, text).toBeGreaterThan(
          1,
        );
      }
    }
  });

  test("数字と助数詞は、続く語と1つの文節に入る", () => {
    const phrases = [
      ...splitIntoPhrases(
        "「よし行くぞ！」と叫んで3秒後に空を見上げる炎の詩人",
      ),
      ...splitIntoPhrases(
        "「もう少し調べてから」と言って気づいたら10年経っていた博士",
      ),
    ];
    expect(phrases.some((phrase) => phrase.includes("3秒後"))).toBe(true);
    expect(phrases.some((phrase) => phrase.includes("10年"))).toBe(true);
  });

  test("タイプ名はどれも2つ以上の文節に分かれ、見出しに折り所を持つ", () => {
    for (const name of characterPersonalityTypeNames) {
      expect(splitIntoPhrases(name).length).toBeGreaterThan(1);
    }
  });

  test("BudouX の境目を外すのは、禁則・ダッシュの前・開き括弧・数・丸括弧の中・最後の1字・漢字か片仮名を含む語の中・中点で並べた平仮名の語の中・閉じ括弧の後ろの短い続きの所だけ", () => {
    for (const text of headings) {
      const kept = new Set(boundaryOffsets(splitIntoPhrases(text)));
      for (const offset of boundaryOffsets(budoux.parse(text))) {
        if (kept.has(offset)) continue;
        const before = text.slice(0, offset);
        const after = text.slice(offset);
        const allowed =
          NO_LINE_START.test(after) ||
          NO_LINE_END.test(before) ||
          /(?:^|[^A-Za-z0-9０-９])[0-9０-９]+$/u.test(before) ||
          parenDepth(before) > 0 ||
          [...after].length === 1 ||
          /^\s*(?:[—―─]|--)/u.test(after) ||
          isInsideKanjiOrKatakanaWord(text, offset) ||
          /\p{Script=Hiragana}$/u.test(before) ||
          /[」』）)][^」』）)]{1,2}$/u.test(before);
        expect(allowed, `${text} の ${before}|${after}`).toBe(true);
      }
    }
  });

  test("丸括弧の中では区切らない", () => {
    for (const text of headings) {
      for (const offset of boundaryOffsets(splitIntoPhrases(text))) {
        expect(parenDepth(text.slice(0, offset)), text).toBe(0);
      }
    }
    expect(splitIntoPhrases("カテゴリから探す（10）")).toEqual([
      "カテゴリから",
      "探す",
      "（10）",
    ]);
  });

  test("最初の文節は、字の種類が変わって語が始まる所でも区切る", () => {
    expect(splitIntoPhrases("チューリング型思考者")).toEqual([
      "チューリング",
      "型思考者",
    ]);
    expect(splitIntoPhrases("ことわざビギナー")).toEqual([
      "ことわざ",
      "ビギナー",
    ]);
  });

  test("中点で並べた語の後ろで区切り、中点で並べた平仮名の語の中では区切らない", () => {
    expect(splitIntoPhrases("Base64エンコード・デコード")).toEqual([
      "Base64",
      "エンコード・",
      "デコード",
    ]);
    expect(splitIntoPhrases("ひらがな・カタカナ変換")).toEqual([
      "ひらがな・",
      "カタカナ変換",
    ]);
  });

  test("英字を含む語が漢字か片仮名の語に移る所で区切り、数の後ろでは区切らない", () => {
    expect(splitIntoPhrases("画像Base64変換")).toEqual(["画像Base64", "変換"]);
    expect(splitIntoPhrases("伝統色250色")).toEqual(["伝統色250色"]);
  });

  test("閉じ括弧の後ろの2字までの続きは、次の文節の頭に移す", () => {
    const phrases = splitIntoPhrases("サイト名を「yolos.net」に変更しました");
    expect(phrases).toContain("「yolos.net」");
    expect(phrases[phrases.indexOf("「yolos.net」") + 1]).toMatch(/^に/u);
  });

  test("見出しの狭い行に収まらない幅の文節は、漢字か片仮名の語の頭と「〜する」の頭でだけ分ける", () => {
    expect(splitIntoPhrases("思考バイアスとコンテキスト")).toEqual([
      "思考",
      "バイアスと",
      "コンテキスト",
    ]);
    expect(splitIntoPhrases("リリースしました: 漢字力診断")).toEqual([
      "リリース",
      "しました: ",
      "漢字力診断",
    ]);
    expect(splitIntoPhrases("他のジャンルも試してみよう")).toEqual([
      "他の",
      "ジャンルも",
      "試してみよう",
    ]);
  });

  test("語の中（片仮名の語の中・平仮名の続きの中）には折り所を足さない", () => {
    expect(
      splitIntoPhrases(
        "デザイン移行で旧トークンを消してもビルドは教えてくれない",
      ).at(-1),
    ).toBe("教えてくれない");
    expect(splitIntoPhrases("AIが指示を守らないなら、")).toContain(
      "守らないなら、",
    );
    expect(
      splitIntoPhrases("JSON整形・フォーマッターの使い方ガイド"),
    ).toContain("フォーマッターの");
    for (const piece of splitIntoPhrases(
      "ゲームインフラのリファクタリング: レジストリパターンの導入",
    )) {
      expect(piece).not.toMatch(/^(?:ファクタ|リング|リパターン)/u);
    }
  });

  test("見出しの狭い行に収まらない幅の文節は、片仮名の語どうしと英字の語の頭でも分ける", () => {
    expect(splitIntoPhrases("AIマルチエージェントで")).toEqual([
      "AI",
      "マルチ",
      "エージェントで",
    ]);
    expect(splitIntoPhrases("プログラマティックSEO戦略の実践")).toEqual([
      "プログラマティック",
      "SEO",
      "戦略の",
      "実践",
    ]);
  });

  test("辞書に無い外来語の欠片をつないだ語と、となりの語のあいだで分ける", () => {
    expect(
      splitIntoPhrases(toolsBySlug.get("email-validator")?.meta.name ?? ""),
    ).toEqual(["メールアドレス", "バリデーター"]);
    expect(splitIntoPhrases("パスワードジェネレーター")).toEqual([
      "パスワード",
      "ジェネレーター",
    ]);
    expect(splitIntoPhrases("CSSグラデーションジェネレーター")).toEqual([
      "CSS",
      "グラデーション",
      "ジェネレーター",
    ]);
    expect(splitIntoPhrases("セキュリティバリデーターの使い方")).toEqual([
      "セキュリティ",
      "バリデーターの",
      "使い方",
    ]);
  });

  test("欠片が前後の語の頭や終わりでありうる片仮名の語の中では分けない", () => {
    for (const [text, word] of [
      ["ゲームインフラのリファクタリング", "リファクタリング"],
      ["デザイントークンの移行", "トークン"],
      ["サーバーサイドレンダリングの仕組み", "レンダリング"],
      ["プログラマティックSEO戦略の実践", "プログラマティック"],
      ["ページネーションの実装", "ページネーション"],
      ["ゲーミフィケーションの効果", "ゲーミフィケーション"],
      ["グローバルナビゲーションを直す", "ナビゲーション"],
      ["トークナイザーの選び方", "トークナイザー"],
      ["ダイアグラムタイプ", "ダイアグラム"],
      ["アマミノクロウサギタイプ", "アマミノクロウサギ"],
      ["リュウグウノツカイタイプ", "リュウグウノツカイ"],
      ["モバイルフレンドリー", "フレンドリー"],
      ["アクセストラッカー", "トラッカー"],
      ["ブラウザトラッカー", "トラッカー"],
      ["セマンティクスクローラー", "クローラー"],
      ["レガシーリファクタリング", "リファクタリング"],
      ["プロセスイレギュラー", "イレギュラー"],
      ["シングルスケーラブル", "スケーラブル"],
      ["サプライズガッコウ", "サプライズ"],
      ["メッセージングリベンジ", "メッセージング"],
      ["1,728 → 31のフィルタリングパイプライン", "フィルタリング"],
      ["フィルタリング全体の流れ", "フィルタリング"],
      ["チャンキングコンテキスト", "チャンキング"],
      ["パーティションテーブル", "パーティション"],
      ["フレンドリーバリデーター", "フレンドリー"],
      ["トレーサビリティジェネレーター", "トレーサビリティ"],
      ["ホバートランジション", "トランジション"],
      ["フロートラフィック", "トラフィック"],
      ["フォーカスリング", "フォーカスリング"],
    ]) {
      const start = text.indexOf(word);
      for (const options of [{}, { countedName: true }]) {
        for (const offset of boundaryOffsets(splitIntoPhrases(text, options))) {
          expect(
            offset <= start || offset >= start + word.length,
            `${text} ${offset}`,
          ).toBe(true);
        }
      }
    }
  });

  test("英語の語尾を写した切れ端と撥音で始まる切れ端は、前の語に付けて1つの語として分ける", () => {
    expect(
      splitIntoPhrases("1,728 → 31のフィルタリングパイプライン"),
    ).toContain("フィルタリング");
    expect(splitIntoPhrases("フィルタリング全体の流れ")[0]).toBe(
      "フィルタリング",
    );
    expect(
      splitIntoPhrases("デザイントークンの移行", { countedName: true }),
    ).toEqual(["デザイン", "トークンの", "移行"]);
  });

  test("BudouX が語の中に置く境目で区切らない", () => {
    expect(splitIntoPhrases("見た目が同じでも")).toContain("見た目が");
    expect(
      splitIntoPhrases(
        "ダークモードを手動で切り替えられるようになりました",
      ).some((piece) => piece.endsWith("切り")),
    ).toBe(false);
  });

  test("ダッシュで始まる文節を作らない", () => {
    for (const text of [
      "自律運用する -- サイクルドキュメントとレビューループの設計",
      "SNS最適化ガイド──シェアボタンとOGPの実践",
    ]) {
      for (const piece of splitIntoPhrases(text).slice(1)) {
        expect(piece, text).not.toMatch(/^\s*(?:[—―─]|--)/u);
      }
    }
    for (const piece of splitIntoPhrases(
      "Cron式 早見表 — フィールド・特殊文字・実用パターン一覧",
    ).slice(1)) {
      expect(piece).not.toMatch(/^[—―─]/u);
    }
    expect(followsPhraseRules(["消した話", "——バッジは"])).toBe(false);
  });

  test("折り所の順位に使う BudouX の度合いは、parse の境目で 0 を超え、ほかの所では 0 以下", () => {
    for (const text of headings) {
      const kept = new Set(boundaryOffsets(budoux.parse(text)));
      const scores = boundaryScores(text);
      for (let offset = 1; offset < text.length; offset += 1) {
        expect(scores[offset] > 0, `${text} の ${offset}`).toBe(
          kept.has(offset),
        );
      }
    }
  });

  test("最初の文節の語の切れ目は、前後に2字以上の同じ字の種類が続く所だけ", () => {
    for (const piece of splitIntoPhrases(
      "お稲荷さんの看板を背負う孤高のリアリスト",
    )) {
      expect(piece).not.toBe("お");
    }
    expect(splitIntoPhrases("深夜シャッフル系")).toEqual([
      "深夜",
      "シャッフル系",
    ]);
  });

  test("1つの文節しかない文は、そのまま1つで返す", () => {
    expect(splitIntoPhrases("王")).toEqual(["王"]);
  });

  test("空の文は文節を持たない", () => {
    expect(splitIntoPhrases("")).toEqual([]);
  });

  test("表のセルでは、括弧の中も文節で分け、括弧の前後の禁則は残す", () => {
    const table = { tableCell: true };
    const pieces = splitIntoPhrases("大（ページ数分のファイル作成）", table);
    expect(pieces.length).toBeGreaterThan(2);
    expect(pieces.join("")).toBe("大（ページ数分のファイル作成）");
    for (const piece of pieces.slice(1)) {
      expect(piece).not.toMatch(/^）/);
    }
    for (const piece of pieces.slice(0, -1)) {
      expect(piece).not.toMatch(/（$/);
    }
    expect(splitIntoPhrases("大（ページ数分のファイル作成）")).toEqual([
      "大（ページ数分のファイル作成）",
    ]);
  });
});

describe("splitIntoPhrases の名前に括弧で数を添えたもの（countedName）", () => {
  const counted = { countedName: true };

  test("名前の中の語の切れ目と始め括弧の前で区切る", () => {
    expect(splitIntoPhrases("オンラインツール", counted)).toEqual([
      "オンライン",
      "ツール",
    ]);
    expect(splitIntoPhrases("カテゴリから探す（10）", counted)).toEqual([
      "カテゴリから",
      "探す",
      "（10）",
    ]);
    expect(splitIntoPhrases("部首（198）", counted)).toEqual([
      "部首",
      "（198）",
    ]);
    expect(splitIntoPhrases("対立・闘い（26）", counted)).toEqual([
      "対立・",
      "闘い",
      "（26）",
    ]);
    expect(splitIntoPhrases("Web開発", counted)).toEqual(["Web", "開発"]);
  });

  test("括弧の中では区切らない", () => {
    for (const text of [
      "同じカテゴリの四字熟語（57語）",
      "メール配信（初期: 選択済み）",
      "Claude Code（3）",
    ]) {
      const pieces = splitIntoPhrases(text, counted);
      expect(pieces.join("")).toBe(text);
      expect(pieces.at(-1)).toMatch(/^（[^（]*）$/u);
      for (const piece of pieces.slice(0, -1)) {
        expect(piece).not.toMatch(/[（）]/u);
      }
    }
  });

  test("文節でなく語で区切り、助詞・送り仮名・漢字どうしの所では区切らない", () => {
    expect(splitIntoPhrases("同じカテゴリの四字熟語（57語）", counted)).toEqual(
      ["同じ", "カテゴリの", "四字熟語", "（57語）"],
    );
    expect(splitIntoPhrases("失敗と学び", counted)).toEqual(["失敗と", "学び"]);
    expect(splitIntoPhrases("中学以降", counted)).toEqual(["中学以降"]);
    expect(splitIntoPhrases("小学1年", counted)).toEqual(["小学1年"]);
  });

  test("見出しの狭い行に収まる片仮名の続きは、語の辞書が刻んでも1語として区切らない", () => {
    expect(splitIntoPhrases("ワークフロー連載", counted)).toEqual([
      "ワークフロー",
      "連載",
    ]);
    expect(splitIntoPhrases("ツールガイド", counted)).toEqual(["ツールガイド"]);
  });

  test("見出しの狭い行に収まらない片仮名の続きは、欠片をつないだ語と、となりの語のあいだで区切る", () => {
    expect(splitIntoPhrases("メールアドレスバリデーター", counted)).toEqual([
      "メールアドレス",
      "バリデーター",
    ]);
    expect(splitIntoPhrases("リファクタリング（3）", counted)).toEqual([
      "リファクタリング",
      "（3）",
    ]);
  });

  test("区切りは禁則を満たし、名前の切れ端はどれも1行を作ってよい長さを持つ", () => {
    for (const text of [
      "オンラインツール（12）",
      "AIエージェント（8）",
      "日本語・文化（5）",
      "すべてのタイプ（24）",
      "学年・画数・部首から探す",
    ]) {
      const pieces = splitIntoPhrases(text, counted);
      expect(pieces.join("")).toBe(text);
      expect(followsPhraseRules(pieces), pieces.join("|")).toBe(true);
      for (const piece of pieces.filter((p) => !p.startsWith("（"))) {
        expect(
          [...piece].filter((ch) => /[\p{L}\p{N}]/u.test(ch)).length,
          piece,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("followsPhraseRules", () => {
  test("splitIntoPhrases が作る並びは、どれも禁則を満たす", () => {
    for (const heading of allQuizHeadings) {
      expect(followsPhraseRules(splitIntoPhrases(heading))).toBe(true);
    }
  });

  test("行の頭と終わりに置けない字の所・数字の後ろ・丸括弧の中の区切りと、1字の最後の文節を見つける", () => {
    expect(followsPhraseRules(["この", "タイプの", "強み"])).toBe(true);
    expect(followsPhraseRules(["ことわざビギナ", "ー"])).toBe(false);
    expect(followsPhraseRules(["「よし", "行くぞ！」と"])).toBe(true);
    expect(followsPhraseRules(["行くぞ", "！」と"])).toBe(false);
    expect(followsPhraseRules(["叫んで「", "よし"])).toBe(false);
    expect(followsPhraseRules(["3", "秒後に"])).toBe(false);
    expect(followsPhraseRules(["藍色（あい", "いろ）"])).toBe(false);
    expect(followsPhraseRules(["座右の", "銘と", "し", "て"])).toBe(false);
    expect(followsPhraseRules(["この", ""])).toBe(false);
  });
});

describe("parenDepthAfter", () => {
  test("半角と全角の丸括弧を開いた数だけ数え、閉じると減らす", () => {
    expect(parenDepthAfter(0, "相互変換 (UTF-8")).toBe(1);
    expect(parenDepthAfter(1, " 対応)")).toBe(0);
    expect(parenDepthAfter(0, "（コンセプト（再策定記")).toBe(2);
    expect(parenDepthAfter(2, "）1/3）")).toBe(0);
  });

  test("閉じ括弧が多くても 0 より下がらない", () => {
    expect(parenDepthAfter(0, "対応)）")).toBe(0);
  });

  test("鉤括弧は数えない", () => {
    expect(parenDepthAfter(0, "「でも")).toBe(0);
  });
});

describe("行の頭と終わりの禁則", () => {
  test.each([
    "？です",
    "、と",
    "」と",
    "ーと",
    "ゃく",
    "々と",
    "：と",
    "—と",
    "--と",
    ")と",
  ])("「%s」は行の頭に置けない", (text) => {
    expect(cannotStartLine(text)).toBe(true);
  });

  test.each(["カです", "Gitと", "-と", "（と"])(
    "「%s」は行の頭に置ける",
    (text) => {
      expect(cannotStartLine(text)).toBe(false);
    },
  );

  test.each(["語「", "語（", "語("])("「%s」で行を終えられない", (text) => {
    expect(cannotEndLine(text)).toBe(true);
  });

  test.each(["語」", "語。", "語"])("「%s」で行を終えられる", (text) => {
    expect(cannotEndLine(text)).toBe(false);
  });

  test("直後で折れる閉じ括弧は、鉤括弧と丸括弧の閉じ", () => {
    expect(["」", "』", "）", ")"].every(isClosingBracket)).toBe(true);
    expect(["「", "（", "。", "]"].some(isClosingBracket)).toBe(false);
  });
});
