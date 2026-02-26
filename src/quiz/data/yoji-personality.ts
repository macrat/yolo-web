import type { QuizDefinition } from "../types";

/**
 * Point distribution design (8 results x 4 primary slots each = 32 total):
 *
 * Result IDs:
 *   shoshikantetsu (初志貫徹)   - primary in: q1-a, q2-a, q5-c, q6-a
 *   tenshinranman  (天真爛漫)   - primary in: q1-b, q3-b, q4-a, q7-b
 *   sessatakuma    (切磋琢磨)   - primary in: q2-c, q3-a, q5-a, q8-a
 *   ichigoichie    (一期一会)   - primary in: q1-c, q4-b, q6-b, q7-a
 *   rinkiohen      (臨機応変)   - primary in: q1-d, q3-c, q5-b, q8-c
 *   meikyoshisui   (明鏡止水)   - primary in: q2-d, q4-d, q6-d, q7-c
 *   ishindenshin   (以心伝心)   - primary in: q3-d, q5-d, q7-d, q8-d
 *   yuoumaishin    (勇往邁進)   - primary in: q2-b, q4-c, q6-c, q8-b
 */
const yojiPersonalityQuiz: QuizDefinition = {
  meta: {
    slug: "yoji-personality",
    title: "あなたを四字熟語に例えると?",
    description:
      "8つの質問に答えて、あなたの性格にぴったりの四字熟語を見つけましょう。努力家?自由人?リーダー?あなたの本質を四字熟語が教えてくれます。",
    shortDescription: "性格診断であなたにぴったりの四字熟語を発見",
    type: "personality",
    questionCount: 8,
    icon: "\u{1F52E}",
    accentColor: "#b91c1c",
    keywords: [
      "四字熟語",
      "性格診断",
      "パーソナリティ",
      "あなたを例えると",
      "診断",
      "四字熟語診断",
    ],
    publishedAt: "2026-02-23",
    relatedLinks: [
      { label: "四字熟語辞典で詳しく見る", href: "/dictionary/yoji" },
      { label: "四字キメルで遊ぶ", href: "/games/yoji-kimeru" },
    ],
  },
  questions: [
    {
      id: "q1",
      text: "困難に直面したとき、あなたはどうする?",
      choices: [
        {
          id: "q1-a",
          text: "目標を見失わず粘り強く取り組む",
          points: { shoshikantetsu: 2, sessatakuma: 1 },
        },
        {
          id: "q1-b",
          text: "楽しいことを見つけて気持ちを切り替える",
          points: { tenshinranman: 2, ichigoichie: 1 },
        },
        {
          id: "q1-c",
          text: "周りの人に相談して一緒に乗り越える",
          points: { ichigoichie: 2, ishindenshin: 1 },
        },
        {
          id: "q1-d",
          text: "状況を冷静に分析して柔軟に対応する",
          points: { rinkiohen: 2, meikyoshisui: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "あなたが最も大切にしている価値観は?",
      choices: [
        {
          id: "q2-a",
          text: "一度決めたことは最後までやり通す信念",
          points: { shoshikantetsu: 2, yuoumaishin: 1 },
        },
        {
          id: "q2-b",
          text: "恐れずに新しい挑戦を続ける勇気",
          points: { yuoumaishin: 2, rinkiohen: 1 },
        },
        {
          id: "q2-c",
          text: "仲間と切磋琢磨して共に成長すること",
          points: { sessatakuma: 2, ishindenshin: 1 },
        },
        {
          id: "q2-d",
          text: "穏やかな心で物事を見つめる冷静さ",
          points: { meikyoshisui: 2, tenshinranman: 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "友人からどう思われていると感じる?",
      choices: [
        {
          id: "q3-a",
          text: "努力家で刺激をもらえる存在",
          points: { sessatakuma: 2, shoshikantetsu: 1 },
        },
        {
          id: "q3-b",
          text: "ムードメーカーで場を明るくする人",
          points: { tenshinranman: 2, ichigoichie: 1 },
        },
        {
          id: "q3-c",
          text: "機転が利いて頼りになる人",
          points: { rinkiohen: 2, yuoumaishin: 1 },
        },
        {
          id: "q3-d",
          text: "気持ちをわかってくれる優しい人",
          points: { ishindenshin: 2, meikyoshisui: 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "理想の休日の過ごし方は?",
      choices: [
        {
          id: "q4-a",
          text: "気の向くままにぶらり散歩や寄り道",
          points: { tenshinranman: 2, rinkiohen: 1 },
        },
        {
          id: "q4-b",
          text: "普段会えない人との食事や交流",
          points: { ichigoichie: 2, ishindenshin: 1 },
        },
        {
          id: "q4-c",
          text: "新しい場所を開拓するアクティブな外出",
          points: { yuoumaishin: 2, sessatakuma: 1 },
        },
        {
          id: "q4-d",
          text: "静かに読書や瞑想でリフレッシュ",
          points: { meikyoshisui: 2, shoshikantetsu: 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "チームで活動するとき、あなたの役割は?",
      choices: [
        {
          id: "q5-a",
          text: "メンバーを鼓舞して全体のレベルを上げる",
          points: { sessatakuma: 2, yuoumaishin: 1 },
        },
        {
          id: "q5-b",
          text: "状況に応じて役割を変えて対応する",
          points: { rinkiohen: 2, tenshinranman: 1 },
        },
        {
          id: "q5-c",
          text: "目標に向かってブレずにチームを導く",
          points: { shoshikantetsu: 2, meikyoshisui: 1 },
        },
        {
          id: "q5-d",
          text: "メンバーの気持ちに寄り添いサポートする",
          points: { ishindenshin: 2, ichigoichie: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "座右の銘に近いのは?",
      choices: [
        {
          id: "q6-a",
          text: "石の上にも三年",
          points: { shoshikantetsu: 2, sessatakuma: 1 },
        },
        {
          id: "q6-b",
          text: "一期一会",
          points: { ichigoichie: 2, tenshinranman: 1 },
        },
        {
          id: "q6-c",
          text: "為せば成る",
          points: { yuoumaishin: 2, shoshikantetsu: 1 },
        },
        {
          id: "q6-d",
          text: "明鏡止水",
          points: { meikyoshisui: 2, ishindenshin: 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "ストレスを感じたとき、どうリフレッシュする?",
      choices: [
        {
          id: "q7-a",
          text: "気の合う仲間と過ごして元気をもらう",
          points: { ichigoichie: 2, sessatakuma: 1 },
        },
        {
          id: "q7-b",
          text: "好きなことに没頭して自由に楽しむ",
          points: { tenshinranman: 2, rinkiohen: 1 },
        },
        {
          id: "q7-c",
          text: "一人の時間を作って心を落ち着ける",
          points: { meikyoshisui: 2, shoshikantetsu: 1 },
        },
        {
          id: "q7-d",
          text: "誰かの話を聞いたり相談に乗ったりする",
          points: { ishindenshin: 2, yuoumaishin: 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "10年後の自分に最も期待することは?",
      choices: [
        {
          id: "q8-a",
          text: "仲間と共に大きなことを成し遂げている",
          points: { sessatakuma: 2, ichigoichie: 1 },
        },
        {
          id: "q8-b",
          text: "誰も歩いたことのない道を切り拓いている",
          points: { yuoumaishin: 2, rinkiohen: 1 },
        },
        {
          id: "q8-c",
          text: "どんな変化にもしなやかに対応できている",
          points: { rinkiohen: 2, meikyoshisui: 1 },
        },
        {
          id: "q8-d",
          text: "周りの人と深い信頼関係を築けている",
          points: { ishindenshin: 2, tenshinranman: 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "shoshikantetsu",
      title: "初志貫徹",
      description:
        "最初の志を最後まで貫くこと。あなたは一度決めたことをぶれずにやり遂げる強い意志の持ち主です。その揺るぎない信念が、周りの人にも勇気を与えています。",
      color: "#1e40af",
      icon: "\u{1F3AF}",
      recommendation: "四字熟語辞典で「初志貫徹」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/初志貫徹",
    },
    {
      id: "tenshinranman",
      title: "天真爛漫",
      description:
        "飾り気がなく無邪気なこと。あなたは純粋で自由な心の持ち主で、周りの人を自然と笑顔にする力があります。その天真爛漫な魅力をいつまでも大切にしてください。",
      color: "#f59e0b",
      icon: "\u{2600}\u{FE0F}",
      recommendation: "四字熟語辞典で「天真爛漫」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/天真爛漫",
    },
    {
      id: "sessatakuma",
      title: "切磋琢磨",
      description:
        "互いに競い合い高め合うこと。あなたは仲間と共に成長することに喜びを感じる努力家です。その向上心とチームワークが、あなたとあなたの周りを輝かせています。",
      color: "#059669",
      icon: "\u{1F4AA}",
      recommendation: "四字熟語辞典で「切磋琢磨」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/切磋琢磨",
    },
    {
      id: "ichigoichie",
      title: "一期一会",
      description:
        "一生に一度の出会いを大切にすること。あなたは人との出会いや一瞬一瞬を大切にする繊細な感性の持ち主です。その温かいまなざしが、かけがえのない縁を結んでいます。",
      color: "#db2777",
      icon: "\u{1F338}",
      recommendation: "四字熟語辞典で「一期一会」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/一期一会",
    },
    {
      id: "rinkiohen",
      title: "臨機応変",
      description:
        "その場に応じて適切に対応すること。あなたは柔軟な発想と高い適応力を持ち、どんな状況でも最善の一手を見つけられる人です。その機転の良さが多くの人を助けています。",
      color: "#7c3aed",
      icon: "\u{1F3AD}",
      recommendation: "四字熟語辞典で「臨機応変」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/臨機応変",
    },
    {
      id: "meikyoshisui",
      title: "明鏡止水",
      description:
        "静かで澄み切った心。あなたは穏やかで冷静な心の持ち主で、周りの人に安心感を与える存在です。その澄んだ心が、物事の本質を見抜く力の源になっています。",
      color: "#0891b2",
      icon: "\u{1FAB7}",
      recommendation: "四字熟語辞典で「明鏡止水」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/明鏡止水",
    },
    {
      id: "ishindenshin",
      title: "以心伝心",
      description:
        "言葉なしに心が通じ合うこと。あなたは周囲の気持ちを敏感に察する共感力に優れた人です。その思いやりと温かさが、深い信頼関係を築く力になっています。",
      color: "#e11d48",
      icon: "\u{1F495}",
      recommendation: "四字熟語辞典で「以心伝心」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/以心伝心",
    },
    {
      id: "yuoumaishin",
      title: "勇往邁進",
      description:
        "恐れず勇ましく前に進むこと。あなたは困難を恐れず果敢に挑戦するリーダー気質の持ち主です。その行動力と勇気が、周りの人にも前に進む力を与えています。",
      color: "#ea580c",
      icon: "\u{1F525}",
      recommendation: "四字熟語辞典で「勇往邁進」の詳しい解説を見る",
      recommendationLink: "/dictionary/yoji/勇往邁進",
    },
  ],
};

export default yojiPersonalityQuiz;
