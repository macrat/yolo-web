import { describe, it, expect } from "vitest";
import type {
  QuizResult,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
  AnimalPersonalityDetailedContent,
  MusicPersonalityDetailedContent,
  TraditionalColorDetailedContent,
  TraditionalColorSeason,
  YojiPersonalityDetailedContent,
  DetailedContent,
} from "../types";

/**
 * Tests for DetailedContent union type and related interfaces.
 * Verifies backward compatibility (QuizResultDetailedContent) and
 * the new ContrarianFortuneDetailedContent variant.
 */
describe("QuizResultDetailedContent", () => {
  it("accepts the existing shape without variant field", () => {
    const content: QuizResultDetailedContent = {
      traits: ["特徴1", "特徴2"],
      behaviors: ["あるある1", "あるある2"],
      advice: "アドバイスのメッセージ",
    };
    expect(content.traits).toHaveLength(2);
    expect(content.behaviors).toHaveLength(2);
    expect(content.advice).toBe("アドバイスのメッセージ");
  });

  it("variant field is undefined when not set", () => {
    const content: QuizResultDetailedContent = {
      traits: [],
      behaviors: [],
      advice: "test",
    };
    // variant は明示的に undefined として定義されている
    expect(content.variant).toBeUndefined();
  });
});

describe("ContrarianFortuneDetailedContent", () => {
  it("accepts all required fields with variant='contrarian-fortune'", () => {
    const content: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "逆張りの天才",
      coreSentence: "流行に背を向けて独自の道を行く、真のオリジナル。",
      behaviors: ["みんながAと言えばBを選ぶ", "ランキング上位は避ける"],
      persona:
        "このタイプの人は常に一歩引いた視点で物事を見ている。流行を追うことに意味を感じず、独自の美学で選択し続ける。周囲が熱狂するほど冷静になれるのが特技。ユーモアと皮肉が混ざった独特の表現で場を和ませることも多い。",
      thirdPartyNote:
        "一緒にいると常識を揺さぶられる体験ができる。意外な選択肢を示してくれる存在。",
    };
    expect(content.variant).toBe("contrarian-fortune");
    expect(content.catchphrase).toBe("逆張りの天才");
    expect(content.behaviors).toHaveLength(2);
    expect(content.humorMetrics).toBeUndefined();
  });

  it("accepts optional humorMetrics field", () => {
    const content: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "逆張り指数MAX",
      coreSentence: "逆を行くことが美学。",
      behaviors: ["定番を避ける"],
      persona: "説明文",
      thirdPartyNote: "第三者視点",
      humorMetrics: [
        { label: "逆張り指数", value: "999%" },
        { label: "流行嫌い度", value: "S級" },
      ],
    };
    expect(content.humorMetrics).toHaveLength(2);
    expect(content.humorMetrics![0].label).toBe("逆張り指数");
    expect(content.humorMetrics![0].value).toBe("999%");
  });
});

describe("DetailedContent union type", () => {
  it("can hold QuizResultDetailedContent", () => {
    const content: DetailedContent = {
      traits: ["特徴"],
      behaviors: ["あるある"],
      advice: "メッセージ",
    };
    // variant が undefined なら QuizResultDetailedContent として扱える
    expect(content.variant).toBeUndefined();
  });

  it("can hold ContrarianFortuneDetailedContent", () => {
    const content: DetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "キャッチコピー",
      coreSentence: "核心文",
      behaviors: ["あるある"],
      persona: "人物像",
      thirdPartyNote: "第三者視点",
    };
    expect(content.variant).toBe("contrarian-fortune");
  });

  it("discriminates variant correctly using type narrowing", () => {
    const contents: DetailedContent[] = [
      {
        traits: [],
        behaviors: [],
        advice: "advice",
      },
      {
        variant: "contrarian-fortune",
        catchphrase: "cp",
        coreSentence: "cs",
        behaviors: [],
        persona: "p",
        thirdPartyNote: "t",
      },
    ];

    const legacy = contents[0];
    const contrarian = contents[1];

    // 型ガードでの分岐確認
    if (legacy.variant === undefined) {
      expect(legacy.advice).toBe("advice");
    }
    if (contrarian.variant === "contrarian-fortune") {
      expect(contrarian.catchphrase).toBe("cp");
    }
  });
});

describe("CharacterFortuneDetailedContent", () => {
  it("accepts all required fields with variant='character-fortune'", () => {
    const content: CharacterFortuneDetailedContent = {
      variant: "character-fortune",
      characterIntro: "わしが司令塔じゃ！戦略なら任せろ！",
      behaviorsHeading: "司令塔タイプのあるある",
      behaviors: [
        "グループLINEで自然とまとめ役になっている",
        "旅行の計画を立てるのが好き",
        "段取りが悪い人を見るとつい口出ししてしまう",
      ],
      characterMessageHeading: "司令塔からの本音",
      characterMessage:
        "正直に言おう。わしはただ全員に最高の結果を出してほしいだけじゃ。指図したいわけじゃない。",
      thirdPartyNote:
        "司令塔タイプの守護を受けている人と一緒にいると、気づけば物事が前進している。",
      compatibilityPrompt:
        "おぬしと相性の良いキャラは誰じゃ？診断してみるがよい！",
    };
    expect(content.variant).toBe("character-fortune");
    expect(content.characterIntro).toBeDefined();
    expect(content.behaviorsHeading).toBeDefined();
    expect(content.behaviors).toHaveLength(3);
    expect(content.characterMessageHeading).toBeDefined();
    expect(content.characterMessage).toBeDefined();
    expect(content.thirdPartyNote).toBeDefined();
    expect(content.compatibilityPrompt).toBeDefined();
  });
});

describe("DetailedContent union type — character-fortune", () => {
  it("can hold CharacterFortuneDetailedContent", () => {
    const content: DetailedContent = {
      variant: "character-fortune",
      characterIntro: "キャラ自己紹介",
      behaviorsHeading: "あるある見出し",
      behaviors: ["あるある1"],
      characterMessageHeading: "本音の見出し",
      characterMessage: "本音テキスト",
      thirdPartyNote: "第三者視点テキスト",
      compatibilityPrompt: "相性診断への誘導",
    };
    expect(content.variant).toBe("character-fortune");
  });

  it("discriminates character-fortune variant via type narrowing", () => {
    const content: DetailedContent = {
      variant: "character-fortune",
      characterIntro: "キャラ自己紹介",
      behaviorsHeading: "あるある見出し",
      behaviors: ["あるある1"],
      characterMessageHeading: "本音の見出し",
      characterMessage: "本音テキスト",
      thirdPartyNote: "第三者視点テキスト",
      compatibilityPrompt: "相性診断への誘導",
    };

    if (content.variant === "character-fortune") {
      expect(content.characterIntro).toBe("キャラ自己紹介");
      expect(content.compatibilityPrompt).toBe("相性診断への誘導");
    }
  });
});

describe("AnimalPersonalityDetailedContent", () => {
  it("accepts all required fields with variant='animal-personality'", () => {
    const content: AnimalPersonalityDetailedContent = {
      variant: "animal-personality",
      catchphrase: "群れのリーダー的存在",
      strengths: ["決断力がある", "頼りがいがある", "困ったときに助けてくれる"],
      weaknesses: ["頑固なところがある", "休むのが苦手"],
      behaviors: ["集合場所を自然と決めている", "迷子になった友達を探しに行く"],
      todayAction: "今日は誰かのために一歩踏み出してみよう",
    };
    expect(content.variant).toBe("animal-personality");
    expect(content.catchphrase).toBe("群れのリーダー的存在");
    expect(content.strengths).toHaveLength(3);
    expect(content.weaknesses).toHaveLength(2);
    expect(content.behaviors).toHaveLength(2);
    expect(content.todayAction).toBe("今日は誰かのために一歩踏み出してみよう");
  });
});

describe("DetailedContent union type — animal-personality", () => {
  it("can hold AnimalPersonalityDetailedContent", () => {
    const content: DetailedContent = {
      variant: "animal-personality",
      catchphrase: "キャッチコピー",
      strengths: ["強み1"],
      weaknesses: ["弱み1"],
      behaviors: ["あるある1"],
      todayAction: "今日のアクション",
    };
    expect(content.variant).toBe("animal-personality");
  });

  it("discriminates animal-personality variant via type narrowing", () => {
    const content: DetailedContent = {
      variant: "animal-personality",
      catchphrase: "キャッチコピー",
      strengths: ["強み1", "強み2"],
      weaknesses: ["弱み1"],
      behaviors: ["あるある1", "あるある2"],
      todayAction: "今日のアクション",
    };

    if (content.variant === "animal-personality") {
      expect(content.catchphrase).toBe("キャッチコピー");
      expect(content.strengths).toHaveLength(2);
      expect(content.weaknesses).toHaveLength(1);
      expect(content.todayAction).toBe("今日のアクション");
    }
  });
});

describe("MusicPersonalityDetailedContent", () => {
  it("accepts all required fields with variant='music-personality'", () => {
    const content: MusicPersonalityDetailedContent = {
      variant: "music-personality",
      catchphrase: "感情を音に変える表現者",
      strengths: ["豊かな表現力がある", "感情のニュアンスを音で伝えられる"],
      weaknesses: ["完璧主義で自己批判しやすい", "人の評価が気になりすぎる"],
      behaviors: [
        "気分によって聴く曲ジャンルが全然違う",
        "いい曲に出会うと何十回もリピートする",
        "歌詞の意味を深読みしがち",
        "思い出の曲が流れると当時の記憶がよみがえる",
      ],
      todayAction: "今日は好きなアーティストのライブ映像を1本見てみよう",
    };
    expect(content.variant).toBe("music-personality");
    expect(content.catchphrase).toBe("感情を音に変える表現者");
    expect(content.strengths).toHaveLength(2);
    expect(content.weaknesses).toHaveLength(2);
    expect(content.behaviors).toHaveLength(4);
    expect(content.todayAction).toBe(
      "今日は好きなアーティストのライブ映像を1本見てみよう",
    );
  });
});

describe("DetailedContent union type — music-personality", () => {
  it("can hold MusicPersonalityDetailedContent", () => {
    const content: DetailedContent = {
      variant: "music-personality",
      catchphrase: "感情を音に変える表現者",
      strengths: ["強み1"],
      weaknesses: ["弱み1"],
      behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
      todayAction: "今日のアクション",
    };
    expect(content.variant).toBe("music-personality");
  });

  it("discriminates music-personality variant via type narrowing", () => {
    const content: DetailedContent = {
      variant: "music-personality",
      catchphrase: "キャッチコピー",
      strengths: ["強み1", "強み2"],
      weaknesses: ["弱み1"],
      behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
      todayAction: "今日のアクション",
    };

    if (content.variant === "music-personality") {
      expect(content.catchphrase).toBe("キャッチコピー");
      expect(content.strengths).toHaveLength(2);
      expect(content.weaknesses).toHaveLength(1);
      expect(content.behaviors).toHaveLength(4);
      expect(content.todayAction).toBe("今日のアクション");
    }
  });
});

describe("TraditionalColorSeason", () => {
  it("accepts all four season values", () => {
    const seasons: TraditionalColorSeason[] = ["春", "夏", "秋", "冬"];
    expect(seasons).toHaveLength(4);
  });
});

describe("TraditionalColorDetailedContent", () => {
  it("accepts all required fields with variant='traditional-color'", () => {
    const content: TraditionalColorDetailedContent = {
      variant: "traditional-color",
      catchphrase: "静かな水面に映る空の色",
      colorMeaning:
        "浅葱色は日本の伝統色で、浅い葱の葉のような青緑色を指す。江戸時代には新選組の羽織の色として知られ、誠実さと清廉さを象徴した。",
      season: "春",
      scenery: "早春の川沿いに並ぶ柳の若葉と水面の輝き",
      behaviors: [
        "感情を表に出すのが苦手で、内心では深く考えている",
        "約束は必ず守る誠実なタイプ",
        "流行より自分のスタイルを大切にする",
        "静かな場所で一人の時間を好む",
      ],
      colorAdvice:
        "あなたの誠実さは必ず誰かに伝わっている。静かに、でも確かに輝いていてください。",
    };
    expect(content.variant).toBe("traditional-color");
    expect(content.catchphrase).toBe("静かな水面に映る空の色");
    expect(content.colorMeaning).toBeDefined();
    expect(content.season).toBe("春");
    expect(content.scenery).toBeDefined();
    expect(content.behaviors).toHaveLength(4);
    expect(content.colorAdvice).toBeDefined();
  });

  it("accepts all four seasons", () => {
    const seasons: TraditionalColorSeason[] = ["春", "夏", "秋", "冬"];
    for (const season of seasons) {
      const content: TraditionalColorDetailedContent = {
        variant: "traditional-color",
        catchphrase: "キャッチコピー",
        colorMeaning: "色の意味",
        season,
        scenery: "風景",
        behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
        colorAdvice: "メッセージ",
      };
      expect(content.season).toBe(season);
    }
  });
});

describe("DetailedContent union type — traditional-color", () => {
  it("can hold TraditionalColorDetailedContent", () => {
    const content: DetailedContent = {
      variant: "traditional-color",
      catchphrase: "静かな水面に映る空の色",
      colorMeaning: "伝統色の意味と由来",
      season: "秋",
      scenery: "紅葉の山と澄んだ秋の空",
      behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
      colorAdvice: "色からのメッセージ",
    };
    expect(content.variant).toBe("traditional-color");
  });

  it("discriminates traditional-color variant via type narrowing", () => {
    const content: DetailedContent = {
      variant: "traditional-color",
      catchphrase: "キャッチコピー",
      colorMeaning: "色の意味",
      season: "冬",
      scenery: "雪景色",
      behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
      colorAdvice: "メッセージ",
    };

    if (content.variant === "traditional-color") {
      expect(content.catchphrase).toBe("キャッチコピー");
      expect(content.season).toBe("冬");
      expect(content.behaviors).toHaveLength(4);
    }
  });
});

describe("YojiPersonalityDetailedContent", () => {
  it("accepts all required fields with variant='yoji-personality'", () => {
    const content: YojiPersonalityDetailedContent = {
      variant: "yoji-personality",
      catchphrase: "深謀遠慮で世界を動かす策士",
      kanjiBreakdown:
        "「深」は深さ・奥深さ、「謀」は計画・はかりごと、「遠」は遠くを見渡す視野、「慮」は思慮・配慮を意味する。四文字が合わさり、遠い先まで見据えた深い思考と周到な計画性を表す。",
      origin:
        "中国の古典に由来し、深く遠くまで計画を巡らせるという意味で用いられてきた。日本では戦国時代の武将たちの戦略的思考を称える文脈で多く使われるようになった。",
      behaviors: [
        "物事を始める前に最悪のシナリオまで考えている",
        "計画表を作りすぎて計画が趣味になっている",
        "リスクを先読みして友達に「心配しすぎ」と言われる",
        "長期目標のために今の我慢を選べる",
      ],
      motto: "百年後の自分が誇れる選択をする。それが深謀遠慮の生き方。",
    };
    expect(content.variant).toBe("yoji-personality");
    expect(content.catchphrase).toBeDefined();
    expect(content.kanjiBreakdown).toBeDefined();
    expect(content.origin).toBeDefined();
    expect(content.behaviors).toHaveLength(4);
    expect(content.motto).toBeDefined();
  });
});

describe("DetailedContent union type — yoji-personality", () => {
  it("can hold YojiPersonalityDetailedContent", () => {
    const content: DetailedContent = {
      variant: "yoji-personality",
      catchphrase: "深謀遠慮で世界を動かす策士",
      kanjiBreakdown: "漢字一字ずつの意味分解",
      origin: "出典・由来の解説",
      behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
      motto: "座右の銘としてのメッセージ",
    };
    expect(content.variant).toBe("yoji-personality");
  });

  it("discriminates yoji-personality variant via type narrowing", () => {
    const content: DetailedContent = {
      variant: "yoji-personality",
      catchphrase: "キャッチコピー",
      kanjiBreakdown: "漢字解説",
      origin: "出典解説",
      behaviors: ["あるある1", "あるある2", "あるある3", "あるある4"],
      motto: "座右の銘",
    };

    if (content.variant === "yoji-personality") {
      expect(content.catchphrase).toBe("キャッチコピー");
      expect(content.kanjiBreakdown).toBe("漢字解説");
      expect(content.origin).toBe("出典解説");
      expect(content.behaviors).toHaveLength(4);
      expect(content.motto).toBe("座右の銘");
    }
  });
});

describe("QuizResult.detailedContent with DetailedContent union", () => {
  it("accepts QuizResult without detailedContent (optional)", () => {
    const result: QuizResult = {
      id: "type-a",
      title: "タイプA",
      description: "説明文",
    };
    expect(result.detailedContent).toBeUndefined();
  });

  it("accepts QuizResult with legacy QuizResultDetailedContent", () => {
    const result: QuizResult = {
      id: "type-a",
      title: "タイプA",
      description: "説明文",
      detailedContent: {
        traits: ["特徴1"],
        behaviors: ["あるある1"],
        advice: "メッセージ",
      },
    };
    expect(result.detailedContent).toBeDefined();
    expect(result.detailedContent!.variant).toBeUndefined();
  });

  it("accepts QuizResult with ContrarianFortuneDetailedContent", () => {
    const result: QuizResult = {
      id: "type-contrarian",
      title: "逆張りタイプ",
      description: "説明文",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "キャッチコピー",
        coreSentence: "核心文",
        behaviors: ["あるある"],
        persona: "人物像",
        thirdPartyNote: "第三者視点",
      },
    };
    expect(result.detailedContent).toBeDefined();
    expect(result.detailedContent!.variant).toBe("contrarian-fortune");
  });
});
