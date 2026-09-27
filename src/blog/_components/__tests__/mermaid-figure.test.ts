import { describe, test, expect } from "vitest";
import {
  chooseTickInterval,
  chooseWrap,
  cssColorToHex,
  figureStart,
  lineProblems,
  planFigure,
  wrapCandidates,
  planGantt,
  startScrollLeft,
  toHexColor,
  type GanttLayout,
  type GanttMeasure,
} from "../mermaid-figure";

describe("toHexColor", () => {
  test("8ビットの成分を2桁ずつの hex にする", () => {
    expect(toHexColor(252, 252, 252)).toBe("#fcfcfc");
    expect(toHexColor(0, 10, 255)).toBe("#000aff");
  });
});

describe("cssColorToHex", () => {
  // globals.css の UI のトークン（ライトとダーク）と、ビルドがそれを直した lab() の値。
  const tokens: [string, string, string][] = [
    ["oklch(0.99 0 0)", "lab(98.84% .0000298023 -.0000119209)", "#fcfcfc"],
    ["oklch(0.95 0 0)", "lab(94.2% 0 0)", "#eeeeee"],
    ["oklch(0.62 0 0)", "lab(55.92% -.0000298023 0)", "#868686"],
    ["oklch(0.15 0 0)", "lab(3.04863% 0 0)", "#0b0b0b"],
    ["oklch(0.18 0 0)", "lab(5.26802% 0 0)", "#121212"],
    ["oklch(0.24 0 0)", "lab(11.84% 0 0)", "#1f1f1f"],
    ["oklch(0.53 0 0)", "lab(45.48% 0 0)", "#6c6c6c"],
    ["oklch(0.97 0 0)", "lab(96.52% -.0000298023 .0000119209)", "#f5f5f5"],
  ];

  test.each(tokens)(
    "トークンの %s と、ビルドが直した %s を、同じ sRGB の hex にする",
    (oklch, lab, hex) => {
      expect(cssColorToHex(oklch)).toBe(hex);
      expect(cssColorToHex(lab)).toBe(hex);
    },
  );

  test("無彩の値は3つの成分が同じになる", () => {
    for (const l of [0, 0.1, 0.33, 0.5, 0.74, 1]) {
      for (const value of [`oklch(${l} 0 0)`, `lab(${l * 100}% 0 0)`]) {
        const hex = cssColorToHex(value) ?? "";
        expect(hex.slice(1, 3)).toBe(hex.slice(3, 5));
        expect(hex.slice(3, 5)).toBe(hex.slice(5, 7));
      }
    }
  });

  test("彩度を持つ色も sRGB に直す", () => {
    expect(cssColorToHex("oklch(0.628 0.2577 29.23)")).toBe("#ff0000");
    expect(cssColorToHex("oklab(0.628 0.2249 0.1258)")).toBe("#ff0000");
    expect(cssColorToHex("lab(54.29% 80.8 69.89)")).toBe("#ff0000");
  });

  test("hex と rgb() はそのままの色の hex にする", () => {
    expect(cssColorToHex("#ABC")).toBe("#aabbcc");
    expect(cssColorToHex("#123456ff")).toBe("#123456");
    expect(cssColorToHex(" rgb(1, 2, 3) ")).toBe("#010203");
    expect(cssColorToHex("rgb(100% 0% 50% / 0.5)")).toBe("#ff0080");
  });

  test("読めない値は null", () => {
    expect(cssColorToHex("var(--ink)")).toBeNull();
    expect(cssColorToHex("")).toBeNull();
  });
});

describe("planFigure", () => {
  test("コンテンツ幅に収まる図は元の大きさで描く", () => {
    expect(planFigure(500, 922, 16, 14)).toEqual({ scale: 1, fits: true });
  });

  test("収まらない図は、字が下限を下回らない範囲で幅に合わせて縮める", () => {
    const plan = planFigure(1000, 922, 16, 14);
    expect(plan.fits).toBe(true);
    expect(plan.scale).toBeCloseTo(0.922);
  });

  test("字が下限を下回るほど縮めないと収まらない図は、下限の大きさで横に送る", () => {
    const plan = planFigure(1000, 327, 16, 14);
    expect(plan.fits).toBe(false);
    expect(plan.scale).toBeCloseTo(14 / 16);
  });

  test("ちょうど下限の倍率で収まる図は、送らない", () => {
    expect(planFigure(1000, 875, 16, 14)).toEqual({
      scale: 0.875,
      fits: true,
    });
  });

  test("下限より小さい字を持つ図も、元の大きさより大きくしない", () => {
    expect(planFigure(300, 922, 10, 14)).toEqual({ scale: 1, fits: true });
    expect(planFigure(1000, 500, 10, 14)).toEqual({ scale: 1, fits: false });
  });
});

describe("figureStart", () => {
  test("流れ図は向きの指定の端から始まる", () => {
    expect(figureStart("flowchart TD\n  A --> B")).toBe("top");
    expect(figureStart("graph TB;\n  A --> B")).toBe("top");
    expect(figureStart("flowchart BT\n  A --> B")).toBe("bottom");
    expect(figureStart("flowchart RL\n  A --> B")).toBe("right");
    expect(figureStart("flowchart LR\n  A --> B")).toBe("left");
  });

  test("前置きの注釈の行を読み飛ばす", () => {
    expect(figureStart("%% 図の説明\n  graph td\n A --> B")).toBe("top");
  });

  test("向きを書かない流れ図は、mermaid が上から描くので上から始まる", () => {
    expect(figureStart("flowchart\n  A --> B")).toBe("top");
    expect(figureStart("graph\n  A --> B")).toBe("top");
  });

  test("流れ図でない図は左から始まる", () => {
    expect(figureStart("sequenceDiagram\n  A->>B: 送る")).toBe("left");
    expect(figureStart("gantt\n  title 題")).toBe("left");
  });
});

describe("startScrollLeft", () => {
  test("始まりを見える幅の真ん中に置く", () => {
    expect(startScrollLeft(500, 200, 1000)).toBe(400);
  });

  test("送れる範囲の外には出さない", () => {
    expect(startScrollLeft(50, 200, 1000)).toBe(0);
    expect(startScrollLeft(990, 200, 1000)).toBe(800);
  });
});

describe("chooseTickInterval", () => {
  const hour = 60 * 60 * 1000;

  test("目盛りの字が重ならない、いちばん細かい間隔を選ぶ", () => {
    // 15時間を 480px に置くと、1時間は 32px、2時間は 64px。字に 53px が要る。
    expect(chooseTickInterval(15 * hour, 480, 53)).toBe("2hour");
    expect(chooseTickInterval(15 * hour, 1000, 53)).toBe("1hour");
    expect(chooseTickInterval(15 * hour, 140, 53)).toBe("6hour");
  });

  test("どの候補でも重なるときは、いちばん粗い間隔", () => {
    expect(chooseTickInterval(1000 * 24 * hour, 10, 53)).toBe("6month");
  });
});

describe("planGantt", () => {
  const hour = 60 * 60 * 1000;
  const layout: GanttLayout = {
    useWidth: 622,
    leftPadding: 64,
    rightPadding: 64,
  };
  const ticksAt = (centers: number[], width = 44) =>
    centers.map((center) => ({
      left: center - width / 2,
      right: center + width / 2,
    }));

  test("余白を区分の名前と、軸の右の端からはみ出す字に合わせ、幅はそのまま", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 311, 558]),
      sectionRight: 106,
      labels: [{ left: 120, right: 300 }],
    };
    expect(planGantt(layout, measure, 8)).toEqual({
      useWidth: 622,
      leftPadding: 114,
      rightPadding: 26,
      tickInterval: undefined,
    });
  });

  test("余白で図の幅が埋まるときも、時間の軸を目盛りの字2つ分より細くしない", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([100, 200], 88),
      sectionRight: 202,
      labels: [],
    };
    const next = planGantt({ ...layout, useWidth: 218 }, measure, 16);
    expect(next?.leftPadding).toBe(218);
    expect(next && next.useWidth - next.leftPadding - next.rightPadding).toBe(
      2 * (88 + 16),
    );
  });

  // 余白が区分の名前と右の端の字に合っている組み方。
  const settled: GanttLayout = {
    useWidth: 622,
    leftPadding: 64,
    rightPadding: 4,
  };

  test("目盛りの字が重なるときは、まず目盛りを間引く", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 96, 128, 160]),
      sectionRight: 56,
      labels: [],
    };
    const next = planGantt(settled, measure, 8);
    expect(next?.useWidth).toBe(622);
    expect(next?.tickInterval).toBe("2hour");
  });

  test("帯の名前が区分の名前に掛かるときは、時間の軸を広げる", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 558]),
      sectionRight: 56,
      labels: [{ left: 20, right: 230 }],
    };
    const next = planGantt(settled, measure, 8);
    expect(next?.useWidth).toBeGreaterThan(622);
  });

  test("長さを持つ帯の名前が掛かるときは、その帯に名前が収まる所まで一度に広げる", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 558]),
      sectionRight: 56,
      labels: [{ left: 20, right: 231, bar: { left: 64, right: 364 } }],
    };
    // 帯が 300px なら、名前と余白の 219px は入る所まで広げても 1.25 倍に届かないので、1.25 倍にする。
    // 帯が 80px なら、219 / 80 倍に一度に広げる。
    const next = planGantt(settled, measure, 8);
    expect(next?.useWidth).toBe(64 + Math.ceil(554 * 1.25) + 4);
    const narrow = planGantt(
      settled,
      {
        ...measure,
        labels: [{ left: 20, right: 231, bar: { left: 64, right: 144 } }],
      },
      8,
    );
    expect(narrow?.useWidth).toBe(64 + Math.ceil((554 * 219) / 80) + 4);
  });

  test("目盛りをもう間引けないのに字が重なるときは、時間の軸を広げてから間隔を選び直す", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 130, 196], 80),
      sectionRight: 56,
      labels: [],
    };
    // 字の幅 80px と あき 8px なら、軸 554px で選べる間隔は 3hour で、いまの間隔と同じ。
    const next = planGantt({ ...settled, tickInterval: "3hour" }, measure, 8);
    expect(next).toEqual({
      useWidth: 64 + Math.ceil(554 * 1.25) + 4,
      leftPadding: 64,
      rightPadding: 4,
      tickInterval: "2hour",
    });
  });

  test("帯の右に置かれた名前が図の右の外に出るときは、図の幅のまま右の余白を広げて中に入れる", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 311, 596]),
      sectionRight: 56,
      labels: [{ left: 560, right: 660, bar: { left: 500, right: 555 } }],
    };
    // 軸の右の端（618px）から 42px はみ出すので、右の余白は 42 + 4。
    expect(planGantt(settled, measure, 8)).toEqual({
      useWidth: 622,
      leftPadding: 64,
      rightPadding: 46,
      tickInterval: undefined,
    });
  });

  test("組み方が変わらなければ null", () => {
    const measure: GanttMeasure = {
      spanMs: 15 * hour,
      ticks: ticksAt([64, 311, 596]),
      sectionRight: 56,
      labels: [],
    };
    expect(planGantt(settled, measure, 8)).toBeNull();
  });
});

describe("lineProblems", () => {
  test("折れの無い1行の文は数えない", () => {
    expect(lineProblems(["み"])).toEqual({
      single: 0,
      forbidden: 0,
      splitWords: 0,
    });
  });

  test("1字だけの行を数える", () => {
    expect(lineProblems(["プロンプトテンプレート読み込", "み"]).single).toBe(1);
  });

  test("行頭の長音符・小書きの仮名・閉じ括弧と、行末の開き括弧を数える", () => {
    expect(lineProblems(["修正・再レビュ", "ー"]).forbidden).toBe(1);
    expect(lineProblems(["タスクの確認をしてロ", "ックする"]).forbidden).toBe(
      1,
    );
    expect(lineProblems(["状態管理", "）"]).forbidden).toBe(1);
    expect(lineProblems(["状態管理（", "RUNNING）"]).forbidden).toBe(1);
  });

  test("英数字の語の中の折れを数える", () => {
    expect(lineProblems(["process-", "manager.ts"]).splitWords).toBe(1);
    expect(lineProblems(["/cycle-", "execution"]).splitWords).toBe(1);
    expect(lineProblems(["watcher.ts", "ファイル監視"]).splitWords).toBe(0);
  });
});

describe("chooseWrap", () => {
  test("読みにくい所の無い幅のうち、収まるいちばん広い幅にする", () => {
    expect(
      chooseWrap([
        { wrap: 200, fits: false, width: 900, flaws: 0 },
        { wrap: 168, fits: true, width: 600, flaws: 0 },
        { wrap: 144, fits: true, width: 560, flaws: 0 },
        { wrap: 120, fits: true, width: 520, flaws: 2 },
      ]).wrap,
    ).toBe(168);
  });

  test("収まる幅が無ければ、読みにくい所の無い幅のうち図がいちばん狭くなる幅にする", () => {
    expect(
      chooseWrap([
        { wrap: 200, fits: false, width: 900, flaws: 0 },
        { wrap: 168, fits: false, width: 820, flaws: 0 },
        { wrap: 120, fits: false, width: 700, flaws: 3 },
      ]).wrap,
    ).toBe(168);
  });

  test("どの幅にも読みにくい所があるときは、いちばん少ない幅の中から選ぶ", () => {
    expect(
      chooseWrap([
        { wrap: 200, fits: true, width: 600, flaws: 2 },
        { wrap: 168, fits: true, width: 560, flaws: 1 },
        { wrap: 144, fits: true, width: 520, flaws: 1 },
      ]).wrap,
    ).toBe(168);
  });

  test("同じ幅で試したものが並ぶときは、先に試したものにする", () => {
    const first = { wrap: 200, fits: true, width: 600, flaws: 0 };
    const second = { wrap: 200, fits: true, width: 600, flaws: 0 };
    expect(chooseWrap([first, second])).toBe(first);
  });
});

describe("wrapCandidates", () => {
  test("文のかたまりの幅ごとに、それを1行に残す幅を広い順に並べ、いちばん狭い幅を足す", () => {
    expect(wrapCandidates([176, 95.5, 250, 176], 120, 400)).toEqual([
      251, 177, 120,
    ]);
  });

  test("狭い幅以下と、広い幅以上の候補は持たない", () => {
    expect(wrapCandidates([80, 119, 399, 600], 120, 400)).toEqual([120]);
  });
});
