import type { QuizDefinition } from "../types";

/**
 * Q43 斜め上の相性診断
 *
 * "あなたと相性の良い存在" を診断するが、結果が人間ではなく
 * 無機物・自然現象・概念などの「斜め上」な存在。
 * 質問は真面目に性格を聞くが、結果が予想外。
 *
 * Point distribution design (8 results x 4 primary slots each = 32 total):
 *
 * Result IDs:
 *   vendingmachine  (自動販売機)       - primary in: q1-a, q2-b, q4-b, q5-b
 *   oldclock        (古い掛け時計)     - primary in: q2-a, q6-c, q7-a, q8-a
 *   streetlight     (街灯)             - primary in: q1-c, q3-b, q5-a, q6-b
 *   benchpark       (公園のベンチ)     - primary in: q2-c, q3-a, q4-c, q7-d
 *   windchime       (風鈴)             - primary in: q1-b, q4-d, q6-a, q7-c
 *   rainyday        (雨の日の午後)     - primary in: q2-d, q4-a, q5-d, q7-b
 *   cloudspecific   (特定の形の雲)     - primary in: q1-d, q3-d, q6-d, q8-c
 *   404page         (404 Not Found)    - primary in: q3-c, q5-c, q8-b, q8-d
 */
const unexpectedCompatibilityQuiz: QuizDefinition = {
  meta: {
    slug: "unexpected-compatibility",
    title: "斜め上の相性診断",
    description:
      "8つの質問に答えると、あなたと最も相性が良い「意外な存在」が判明します。人間ではない何かがあなたを待っています。",
    shortDescription: "あなたと相性抜群の意外な存在を診断",
    type: "personality",
    category: "personality",
    questionCount: 8,
    icon: "\u{1F48E}",
    accentColor: "#0891b2",
    keywords: [
      "相性診断",
      "斜め上",
      "面白い診断",
      "ユーモア",
      "占い",
      "性格診断",
      "相性",
    ],
    publishedAt: "2026-03-08T13:00:00+09:00",
    relatedLinks: [
      {
        label: "逆張り運勢診断を受ける",
        href: "/quiz/contrarian-fortune",
      },
      {
        label: "達成困難アドバイス診断を受ける",
        href: "/quiz/impossible-advice",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。質問と結果はAIが創作しました。楽しみとしてお楽しみください。",
  },
  questions: [
    {
      id: "q1",
      text: "朝のルーティンで一番大事なのは?",
      choices: [
        {
          id: "q1-a",
          text: "コーヒーまたはお茶",
          points: { vendingmachine: 2, oldclock: 1 },
        },
        {
          id: "q1-b",
          text: "ニュースチェック",
          points: { windchime: 2, "404page": 1 },
        },
        {
          id: "q1-c",
          text: "ストレッチや運動",
          points: { streetlight: 2, benchpark: 1 },
        },
        {
          id: "q1-d",
          text: "特に決まっていない",
          points: { cloudspecific: 2, vendingmachine: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "人間関係で大切にしていることは?",
      choices: [
        {
          id: "q2-a",
          text: "信頼と誠実さ",
          points: { oldclock: 2, streetlight: 1 },
        },
        {
          id: "q2-b",
          text: "楽しさとノリの良さ",
          points: { vendingmachine: 2, windchime: 1 },
        },
        {
          id: "q2-c",
          text: "適度な距離感",
          points: { benchpark: 2, cloudspecific: 1 },
        },
        {
          id: "q2-d",
          text: "深い理解と共感",
          points: { rainyday: 2, oldclock: 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "休日に一人で過ごすなら?",
      choices: [
        {
          id: "q3-a",
          text: "カフェで読書",
          points: { benchpark: 2, oldclock: 1 },
        },
        {
          id: "q3-b",
          text: "散歩",
          points: { streetlight: 2, cloudspecific: 1 },
        },
        {
          id: "q3-c",
          text: "ネットサーフィン",
          points: { "404page": 2, vendingmachine: 1 },
        },
        {
          id: "q3-d",
          text: "何もしない",
          points: { cloudspecific: 2, rainyday: 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "自分の性格を色で表すと?",
      choices: [
        {
          id: "q4-a",
          text: "青（冷静・知性）",
          points: { rainyday: 2, "404page": 1 },
        },
        {
          id: "q4-b",
          text: "赤（情熱・行動力）",
          points: { vendingmachine: 2, streetlight: 1 },
        },
        {
          id: "q4-c",
          text: "緑（穏やか・調和）",
          points: { benchpark: 2, windchime: 1 },
        },
        {
          id: "q4-d",
          text: "黄（明るい・好奇心）",
          points: { windchime: 2, cloudspecific: 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "困ったときに頼りにするのは?",
      choices: [
        {
          id: "q5-a",
          text: "自分自身",
          points: { streetlight: 2, oldclock: 1 },
        },
        {
          id: "q5-b",
          text: "友人",
          points: { vendingmachine: 2, benchpark: 1 },
        },
        {
          id: "q5-c",
          text: "インターネット",
          points: { "404page": 2, windchime: 1 },
        },
        {
          id: "q5-d",
          text: "時間が解決するのを待つ",
          points: { rainyday: 2, cloudspecific: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "好きな季節は?",
      choices: [
        {
          id: "q6-a",
          text: "春",
          points: { windchime: 2, benchpark: 1 },
        },
        {
          id: "q6-b",
          text: "夏",
          points: { streetlight: 2, vendingmachine: 1 },
        },
        {
          id: "q6-c",
          text: "秋",
          points: { oldclock: 2, rainyday: 1 },
        },
        {
          id: "q6-d",
          text: "冬",
          points: { cloudspecific: 2, "404page": 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "大切な人へのプレゼントを選ぶ基準は?",
      choices: [
        {
          id: "q7-a",
          text: "実用的なもの",
          points: { oldclock: 2, streetlight: 1 },
        },
        {
          id: "q7-b",
          text: "相手の好みに合うもの",
          points: { rainyday: 2, benchpark: 1 },
        },
        {
          id: "q7-c",
          text: "話のネタになるもの",
          points: { windchime: 2, "404page": 1 },
        },
        {
          id: "q7-d",
          text: "値段は気にしない。気持ちが伝わるもの",
          points: { benchpark: 2, vendingmachine: 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "今の自分に足りないと思うものは?",
      choices: [
        {
          id: "q8-a",
          text: "時間",
          points: { oldclock: 2, streetlight: 1 },
        },
        {
          id: "q8-b",
          text: "お金",
          points: { "404page": 2, vendingmachine: 1 },
        },
        {
          id: "q8-c",
          text: "刺激",
          points: { cloudspecific: 2, windchime: 1 },
        },
        {
          id: "q8-d",
          text: "安らぎ",
          points: { "404page": 2, rainyday: 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "vendingmachine",
      title: "自動販売機",
      description:
        "あなたと最も相性が良い存在は「自動販売機」です。あなたが求めるものを、聞かれる前に差し出す存在。24時間いつでもそこにいて、押せば応えてくれる。人間関係にこの安定感を求めるあなたは、実は自動販売機に最も癒されています。次に自販機の前を通ったら、少し長めに眺めてあげてください。きっと光って応えてくれます。",
      color: "#ea580c",
      icon: "\u{1F964}",
    },
    {
      id: "oldclock",
      title: "古い掛け時計",
      description:
        "あなたと最も相性が良い存在は「古い掛け時計」です。静かに、正確に、休まず動き続ける。あなたもまた、誠実さと継続を大切にする人。掛け時計が毎時ボーンと鳴るように、あなたの存在も周囲にとって「いつもそこにある安心感」です。デジタル時計にはない味わいがあなたにはあります。",
      color: "#92400e",
      icon: "\u{1F570}\u{FE0F}",
    },
    {
      id: "streetlight",
      title: "街灯",
      description:
        "あなたと最も相性が良い存在は「街灯」です。暗くなると自動的に灯り、誰かの帰り道をそっと照らす。主張しないけれど、いないと困る。あなたもそういう存在です。なお、街灯に集まる虫はあなたの魅力に引き寄せられた存在の暗喩です（そうでないかもしれません）。",
      color: "#ca8a04",
      icon: "\u{1F4A1}",
    },
    {
      id: "benchpark",
      title: "公園のベンチ",
      description:
        "あなたと最も相性が良い存在は「公園のベンチ」です。誰でも受け入れ、何時間座っても文句を言わず、去るときも引き止めない。あなたの包容力と適度な距離感は、まさにベンチ的美徳です。雨の日は少し寂しそうにしているところも似ています。",
      color: "#059669",
      icon: "\u{1FA91}",
    },
    {
      id: "windchime",
      title: "風鈴",
      description:
        "あなたと最も相性が良い存在は「風鈴」です。風が吹くと涼やかに鳴り、周囲に爽やかさを届ける。あなたもまた、場の空気を変える力を持っています。ただし風がないと沈黙する点も似ており、「自分から動くタイプではない」ことを風鈴は優しく教えてくれています。",
      color: "#7c3aed",
      icon: "\u{1F3D0}",
    },
    {
      id: "rainyday",
      title: "雨の日の午後",
      description:
        "あなたと最も相性が良い存在は「雨の日の午後」です。人間ではなく、時間帯です。外に出る理由がなくなり、室内で静かに過ごす口実が生まれる。あなたにとって雨は天気ではなく、自分を取り戻す許可証です。傘を持たずに出かけて雨に降られても、なぜかそれほど嫌ではないはずです。",
      color: "#1e40af",
      icon: "\u{1F327}\u{FE0F}",
    },
    {
      id: "cloudspecific",
      title: "特定の形の雲",
      description:
        "あなたと最も相性が良い存在は「特定の形の雲」です。何の形に見えるかは日によって変わります。見上げるたびに違う姿で、でも空にいることだけは確か。あなたもまた、一つの枠に収まらない自由な存在です。雲の形に名前をつける趣味を始めると、毎日が少し楽しくなるかもしれません。",
      color: "#0891b2",
      icon: "\u{2601}\u{FE0F}",
    },
    {
      id: "404page",
      title: "404 Not Found",
      description:
        "あなたと最も相性が良い存在は「存在しないWebページ」です。探していたものとは違うけれど、たどり着いてしまった場所。404ページに書かれた「お探しのページは見つかりませんでした」は、実は哲学的な問いです。あなたもまた、探しているものがまだ見つかっていないのかもしれません。でも探し続けること自体に価値があります。このページのように。",
      color: "#6b7280",
      icon: "\u{1F50D}",
    },
  ],
};

export default unexpectedCompatibilityQuiz;
