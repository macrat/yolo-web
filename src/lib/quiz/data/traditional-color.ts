import type { QuizDefinition } from "../types";

const traditionalColorQuiz: QuizDefinition = {
  meta: {
    slug: "traditional-color",
    title: "あなたを日本の伝統色に例えると?",
    description:
      "8つの質問に答えて、あなたの性格にぴったりの日本の伝統色を見つけましょう。藍色、朱色、若草色など、美しい和の色があなたを待っています。",
    shortDescription: "性格診断であなたにぴったりの伝統色を発見",
    type: "personality",
    questionCount: 8,
    icon: "\u{1F3A8}",
    accentColor: "#165E83",
    keywords: [
      "伝統色",
      "日本の色",
      "性格診断",
      "色診断",
      "和色",
      "パーソナリティ",
    ],
    publishedAt: "2026-02-19",
    relatedLinks: [
      { label: "日本の伝統色一覧", href: "/colors" },
      { label: "伝統色辞典", href: "/dictionary" },
    ],
  },
  questions: [
    {
      id: "q1",
      text: "休日の過ごし方は?",
      choices: [
        {
          id: "q1-a",
          text: "自然を楽しむ",
          points: { wakakusa: 2, hisui: 1, sakura: 1 },
        },
        {
          id: "q1-b",
          text: "美術館巡り",
          points: { fuji: 2, ai: 1, kon: 1 },
        },
        {
          id: "q1-c",
          text: "友人と賑やかに",
          points: { yamabuki: 2, shu: 1 },
        },
        {
          id: "q1-d",
          text: "家でゆっくり",
          points: { sakura: 2, kon: 1, fuji: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "好きな季節は?",
      choices: [
        {
          id: "q2-a",
          text: "春",
          points: { sakura: 2, wakakusa: 1, fuji: 1 },
        },
        {
          id: "q2-b",
          text: "夏",
          points: { shu: 2, hisui: 1, yamabuki: 1 },
        },
        {
          id: "q2-c",
          text: "秋",
          points: { yamabuki: 2, shu: 1, ai: 1 },
        },
        {
          id: "q2-d",
          text: "冬",
          points: { kon: 2, ai: 1, fuji: 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "大切にしていることは?",
      choices: [
        {
          id: "q3-a",
          text: "調和",
          points: { sakura: 2, wakakusa: 1 },
        },
        {
          id: "q3-b",
          text: "情熱",
          points: { shu: 2, yamabuki: 1 },
        },
        {
          id: "q3-c",
          text: "知性",
          points: { ai: 2, kon: 1 },
        },
        {
          id: "q3-d",
          text: "自由",
          points: { hisui: 2, fuji: 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "友人からどう思われている?",
      choices: [
        {
          id: "q4-a",
          text: "穏やか",
          points: { sakura: 2, wakakusa: 1 },
        },
        {
          id: "q4-b",
          text: "明るい",
          points: { yamabuki: 2, shu: 1 },
        },
        {
          id: "q4-c",
          text: "頼りになる",
          points: { kon: 2, ai: 1 },
        },
        {
          id: "q4-d",
          text: "ユニーク",
          points: { hisui: 2, fuji: 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "好きな時間帯は?",
      choices: [
        {
          id: "q5-a",
          text: "朝",
          points: { wakakusa: 2, sakura: 1 },
        },
        {
          id: "q5-b",
          text: "昼",
          points: { yamabuki: 2, shu: 1 },
        },
        {
          id: "q5-c",
          text: "夕方",
          points: { shu: 1, fuji: 2, ai: 1 },
        },
        {
          id: "q5-d",
          text: "夜",
          points: { kon: 2, hisui: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "旅行するなら?",
      choices: [
        {
          id: "q6-a",
          text: "森や山",
          points: { wakakusa: 2, hisui: 1 },
        },
        {
          id: "q6-b",
          text: "海辺",
          points: { ai: 2, hisui: 1 },
        },
        {
          id: "q6-c",
          text: "歴史ある街",
          points: { kon: 1, fuji: 1, shu: 1 },
        },
        {
          id: "q6-d",
          text: "都会",
          points: { yamabuki: 1, shu: 1, kon: 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "もらって嬉しいプレゼントは?",
      choices: [
        {
          id: "q7-a",
          text: "花",
          points: { sakura: 2, wakakusa: 1 },
        },
        {
          id: "q7-b",
          text: "アクセサリー",
          points: { fuji: 2, yamabuki: 1 },
        },
        {
          id: "q7-c",
          text: "本",
          points: { ai: 2, kon: 1 },
        },
        {
          id: "q7-d",
          text: "体験チケット",
          points: { hisui: 2, shu: 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "座右の銘に近いのは?",
      choices: [
        {
          id: "q8-a",
          text: "和を以て貴しとなす",
          points: { sakura: 2, wakakusa: 1 },
        },
        {
          id: "q8-b",
          text: "一期一会",
          points: { shu: 1, yamabuki: 1, fuji: 1 },
        },
        {
          id: "q8-c",
          text: "継続は力なり",
          points: { kon: 2, ai: 1 },
        },
        {
          id: "q8-d",
          text: "自分らしく",
          points: { hisui: 2, fuji: 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "ai",
      title: "藍色(あいいろ)",
      description:
        "知的で深みのあるあなたは、藍色のように奥深い魅力を持っています。探究心が強く、物事の本質を見抜く力があります。静かな知性で周りの人を導く存在です。",
      color: "#165E83",
      icon: "\u{1F30A}",
      recommendation: "藍色の詳しい解説を見る",
      recommendationLink: "/colors/ai",
    },
    {
      id: "shu",
      title: "朱色(しゅいろ)",
      description:
        "情熱的でエネルギッシュなあなたは、朱色のように力強い輝きを放っています。行動力があり、周りの人にも元気を与える太陽のような存在です。",
      color: "#BA2636",
      icon: "\u{1F525}",
      recommendation: "朱色の詳しい解説を見る",
      recommendationLink: "/colors",
    },
    {
      id: "wakakusa",
      title: "若草色(わかくさいろ)",
      description:
        "爽やかで生命力にあふれるあなたは、若草色のようにフレッシュな魅力があります。前向きで成長し続ける姿勢が、周りの人に希望を与えます。",
      color: "#C3D825",
      icon: "\u{1F331}",
      recommendation: "日本の伝統色を探索する",
      recommendationLink: "/colors",
    },
    {
      id: "fuji",
      title: "藤色(ふじいろ)",
      description:
        "繊細で優雅なあなたは、藤色のように美しく上品な雰囲気を持っています。感受性が豊かで、芸術的なセンスに恵まれた人です。",
      color: "#BAA8CF",
      icon: "\u{1F33A}",
      recommendation: "藤色の詳しい解説を見る",
      recommendationLink: "/colors/fuji",
    },
    {
      id: "yamabuki",
      title: "山吹色(やまぶきいろ)",
      description:
        "明るく社交的なあなたは、山吹色のように温かい輝きで周りを照らします。コミュニケーション上手で、人を笑顔にする天性の才能があります。",
      color: "#F8B500",
      icon: "\u{2728}",
      recommendation: "山吹色の詳しい解説を見る",
      recommendationLink: "/colors/yamabuki",
    },
    {
      id: "kon",
      title: "紺色(こんいろ)",
      description:
        "落ち着きのあるあなたは、紺色のように深い信頼感を与えます。責任感が強く、周りの人から頼られるしっかり者です。",
      color: "#1B294B",
      icon: "\u{1F319}",
      recommendation: "紺色の詳しい解説を見る",
      recommendationLink: "/colors/kon",
    },
    {
      id: "sakura",
      title: "桜色(さくらいろ)",
      description:
        "温かく包容力のあるあなたは、桜色のように優しい安らぎを与えます。思いやりがあり、誰からも愛される人柄の持ち主です。",
      color: "#FEEEED",
      icon: "\u{1F338}",
      recommendation: "桜色の詳しい解説を見る",
      recommendationLink: "/colors/sakura",
    },
    {
      id: "hisui",
      title: "翡翠色(ひすいいろ)",
      description:
        "独創的で自由な精神の持ち主であるあなたは、翡翠色のように神秘的な魅力があります。型にはまらない発想力で、新しい道を切り拓く開拓者です。",
      color: "#38B48B",
      icon: "\u{1F48E}",
      recommendation: "日本の伝統色を探索する",
      recommendationLink: "/colors",
    },
  ],
};

export default traditionalColorQuiz;
