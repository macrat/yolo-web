import type { QuizDefinition } from "../types";

const kotowazaLevelQuiz: QuizDefinition = {
  meta: {
    slug: "kotowaza-level",
    title: "ことわざ・慣用句力診断",
    description:
      "ことわざや慣用句の意味から正しい表現を当てるクイズです。全10問であなたのことわざ力を診断します。有名なことわざから意外と知らない慣用句まで幅広く出題!",
    shortDescription: "ことわざ・慣用句10問であなたの語彙力を測定",
    type: "knowledge",
    questionCount: 10,
    icon: "諺",
    accentColor: "#d97706",
    keywords: [
      "ことわざ",
      "慣用句",
      "クイズ",
      "診断",
      "語彙力",
      "テスト",
      "意味",
      "日本語",
    ],
    publishedAt: "2026-02-26",
    relatedLinks: [
      { label: "漢字力診断に挑戦", href: "/quiz/kanji-level" },
      { label: "四字熟語力診断に挑戦", href: "/quiz/yoji-level" },
    ],
    trustLevel: "curated",
    trustNote:
      "スコア計算は正確です。問題と正解はAIが辞書を参照して作成しています。解説文はAIの見解であり、誤りを含む可能性があります。",
  },
  questions: [
    {
      // ことわざ / 易 / 動物 — 正解位置: a
      id: "q1",
      text: "「上手な人でも時には失敗する」という意味のことわざは?",
      choices: [
        { id: "q1-a", text: "猿も木から落ちる", isCorrect: true },
        { id: "q1-b", text: "犬も歩けば棒に当たる" },
        { id: "q1-c", text: "馬の耳に念仏" },
        { id: "q1-d", text: "豚に真珠" },
      ],
      explanation:
        "木登りが得意な猿でも時には落ちることから、どんな達人でも失敗することがあるという教えです。「河童の川流れ」「弘法にも筆の誤り」が類義語です。",
    },
    {
      // ことわざ / 易 / 食べ物 — 正解位置: b
      id: "q2",
      text: "「思いがけない幸運が舞い込むこと」を表すことわざは?",
      choices: [
        { id: "q2-a", text: "花より団子" },
        { id: "q2-b", text: "棚からぼたもち", isCorrect: true },
        { id: "q2-c", text: "絵に描いた餅" },
        { id: "q2-d", text: "餅は餅屋" },
      ],
      explanation:
        "棚の下にいたら牡丹餅が落ちてきたという話に由来します。砂糖が貴重だった時代、甘い牡丹餅は贅沢品で、思わぬ幸運の象徴でした。「たなぼた」とも略されます。",
    },
    {
      // ことわざ / 易 / 道具・生活 — 正解位置: c
      id: "q3",
      text: "「用心の上にさらに用心を重ねること」を表すことわざは?",
      choices: [
        { id: "q3-a", text: "転ばぬ先の杖" },
        { id: "q3-b", text: "備えあれば憂いなし" },
        { id: "q3-c", text: "石橋を叩いて渡る", isCorrect: true },
        { id: "q3-d", text: "急がば回れ" },
      ],
      explanation:
        "丈夫な石の橋でさえ叩いて安全を確かめてから渡るということから、非常に慎重に物事を進めることを表します。慎重すぎる人を皮肉る場面でも使われます。",
    },
    {
      // ことわざ / 易 / 努力 — 正解位置: a
      id: "q4",
      text: "「何度失敗しても、くじけずに立ち上がること」を表すことわざは?",
      choices: [
        { id: "q4-a", text: "七転び八起き", isCorrect: true },
        { id: "q4-b", text: "石の上にも三年" },
        { id: "q4-c", text: "雨降って地固まる" },
        { id: "q4-d", text: "千里の道も一歩から" },
      ],
      explanation:
        "七回転んでも八回起き上がるということから、何度失敗してもあきらめずに奮起し続ける意味です。だるま人形が起き上がる姿にも結びつけられています。",
    },
    {
      // 慣用句 / 普通 / 体の部位 — 正解位置: b
      id: "q5",
      text: "「相手の弱みにつけこむ」という意味の慣用句は?",
      choices: [
        { id: "q5-a", text: "腕を磨く" },
        { id: "q5-b", text: "足元を見る", isCorrect: true },
        { id: "q5-c", text: "首を長くする" },
        { id: "q5-d", text: "目を丸くする" },
      ],
      explanation:
        "江戸時代の駕籠かきが旅人の足元の疲れ具合を見て法外な料金を要求したことに由来します。現代ではビジネスなどで相手の弱みにつけこむ場面で使われます。",
    },
    {
      // ことわざ / 普通 / 道具・生活 — 正解位置: d
      id: "q6",
      text: "「身近なことほど案外気づきにくい」という意味のことわざは?",
      choices: [
        { id: "q6-a", text: "木を見て森を見ず" },
        { id: "q6-b", text: "井の中の蛙大海を知らず" },
        { id: "q6-c", text: "知らぬが仏" },
        { id: "q6-d", text: "灯台下暗し", isCorrect: true },
      ],
      explanation:
        "この「灯台」は岬の灯台ではなく、昔の室内照明器具のことです。油の皿を高い台に載せて部屋を照らしましたが、台の真下は影になって暗かったことに由来します。",
    },
    {
      // ことわざ / 普通 / 道具・生活 — 正解位置: d
      id: "q7",
      text: "「やわらかいものに釘を打つように、手ごたえがないこと」のたとえは?",
      choices: [
        { id: "q7-a", text: "焼け石に水" },
        { id: "q7-b", text: "蛙の面に水" },
        { id: "q7-c", text: "馬耳東風" },
        { id: "q7-d", text: "糠に釘", isCorrect: true },
      ],
      explanation:
        "糠（ぬか）に釘を打ってもすぐ抜けて手応えがないことから、いくら働きかけても効果がないたとえです。上方いろはかるたの「ぬ」として親しまれています。",
    },
    {
      // 慣用句 / 難 / 体の部位 — 正解位置: c
      id: "q8",
      text: "「あることをきっかけに、急に物事が理解できるようになる」という意味の慣用句は?",
      choices: [
        { id: "q8-a", text: "耳が痛い" },
        { id: "q8-b", text: "腑に落ちる" },
        { id: "q8-c", text: "目から鱗が落ちる", isCorrect: true },
        { id: "q8-d", text: "舌を巻く" },
      ],
      explanation:
        "新約聖書に由来する表現です。パウロが目が見えなくなった後に信仰を得て鱗のようなものが目から落ち視力が回復した故事から来ています。「鱗が取れる」は誤用です。",
    },
    {
      // ことわざ / 難 / 動物 — 正解位置: c
      id: "q9",
      text: "「泳ぎの得意な者でも溺れることがある」という意味のことわざは?",
      choices: [
        { id: "q9-a", text: "蛙の子は蛙" },
        { id: "q9-b", text: "蛇の道は蛇" },
        { id: "q9-c", text: "河童の川流れ", isCorrect: true },
        { id: "q9-d", text: "亀の甲より年の功" },
      ],
      explanation:
        "川や池に棲むとされる河童ですら川に流されることがあるということから、その道の達人でも時には失敗するという教えです。「猿も木から落ちる」と同義です。",
    },
    {
      // ことわざ / 難 / 道具・生活 — 正解位置: a
      id: "q10",
      text: "「思うようにならず、もどかしいこと」を表すことわざは?",
      choices: [
        { id: "q10-a", text: "二階から目薬", isCorrect: true },
        { id: "q10-b", text: "帯に短し襷に長し" },
        { id: "q10-c", text: "猫に小判" },
        { id: "q10-d", text: "のれんに腕押し" },
      ],
      explanation:
        "二階から階下の人に目薬をさすという、もどかしい様子を表します。西沢一風の浮世草子『風流御前義経記』（1700年）に初出し、上方いろはかるたにも採用されました。",
    },
  ],
  results: [
    {
      id: "beginner",
      title: "ことわざビギナー",
      description:
        "まだまだ伸びしろたっぷり! ことわざや慣用句は日常会話の中にたくさん隠れています。まずは身近な表現から意識して使ってみましょう。",
      icon: "\u{1F331}",
      minScore: 0,
      recommendation: "漢字力診断にも挑戦してみよう",
      recommendationLink: "/quiz/kanji-level",
    },
    {
      id: "learner",
      title: "ことわざ見習い",
      description:
        "基本的なことわざはバッチリ! 日本語の表現力をさらに伸ばすために、本や新聞でことわざ・慣用句を探してみましょう。",
      icon: "\u{1F4DD}",
      minScore: 3,
      recommendation: "四字熟語力診断で語彙力をさらに試そう",
      recommendationLink: "/quiz/yoji-level",
    },
    {
      id: "intermediate",
      title: "ことわざ中級者",
      description:
        "なかなかのことわざ力です! 由来や語源まで知ると、ことわざの世界がもっと面白くなりますよ。",
      icon: "\u{1F4D6}",
      minScore: 5,
      recommendation: "漢字力診断であなたの漢字力も確認しよう",
      recommendationLink: "/quiz/kanji-level",
    },
    {
      id: "advanced",
      title: "ことわざ上級者",
      description:
        "かなりの語彙力の持ち主! ことわざや慣用句を自在に使いこなせる実力者です。会話や文章で的確に使えると表現に深みが出ますね。",
      icon: "\u{1F393}",
      minScore: 7,
      recommendation: "四字熟語力診断にも挑戦しよう",
      recommendationLink: "/quiz/yoji-level",
    },
    {
      id: "master",
      title: "ことわざマスター",
      description:
        "素晴らしいことわざ力! ことわざ・慣用句をほぼ完璧に理解しているあなたは、まさにことわざマスターです。",
      icon: "\u{1F451}",
      minScore: 9,
      recommendation: "漢字力診断で漢字力も確認しよう",
      recommendationLink: "/quiz/kanji-level",
    },
  ],
};

export default kotowazaLevelQuiz;
