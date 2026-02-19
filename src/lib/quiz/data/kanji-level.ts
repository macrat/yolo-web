import type { QuizDefinition } from "../types";

const kanjiLevelQuiz: QuizDefinition = {
  meta: {
    slug: "kanji-level",
    title: "漢字力診断",
    description:
      "難読漢字の読みを当てるクイズです。全10問であなたの漢字力を診断します。日常では見かけにくい漢字から、知っていると自慢できる漢字まで幅広く出題!",
    shortDescription: "難読漢字10問であなたの漢字力を測定",
    type: "knowledge",
    questionCount: 10,
    icon: "漢",
    accentColor: "#2563eb",
    keywords: [
      "漢字",
      "難読漢字",
      "読み方",
      "クイズ",
      "診断",
      "漢字力",
      "テスト",
    ],
    publishedAt: "2026-02-19",
    relatedLinks: [
      { label: "漢字辞典で学ぶ", href: "/dictionary/kanji" },
      { label: "漢字カナール", href: "/games/kanji-kanaru" },
    ],
  },
  questions: [
    {
      id: "q1",
      text: "「挨拶」の読みは?",
      choices: [
        { id: "q1-a", text: "あいさつ", isCorrect: true },
        { id: "q1-b", text: "あいじょう" },
        { id: "q1-c", text: "あっとう" },
        { id: "q1-d", text: "あくび" },
      ],
      explanation:
        "「挨拶」は「あいさつ」と読みます。「挨」は押す、「拶」は迫るという意味で、禅宗の問答に由来する言葉です。",
    },
    {
      id: "q2",
      text: "「薔薇」の読みは?",
      choices: [
        { id: "q2-a", text: "しょうび" },
        { id: "q2-b", text: "ばら", isCorrect: true },
        { id: "q2-c", text: "つばき" },
        { id: "q2-d", text: "さくら" },
      ],
      explanation:
        "「薔薇」は「ばら」と読みます。漢字の画数が多く、難読漢字の代表格です。中国語の「薔薇（qiangwei）」に由来します。",
    },
    {
      id: "q3",
      text: "「所謂」の読みは?",
      choices: [
        { id: "q3-a", text: "しょい" },
        { id: "q3-b", text: "ところが" },
        { id: "q3-c", text: "いわゆる", isCorrect: true },
        { id: "q3-d", text: "そのもの" },
      ],
      explanation:
        "「所謂」は「いわゆる」と読みます。「謂う所の」が語源で、「世間で言われている」という意味です。",
    },
    {
      id: "q4",
      text: "「流石」の読みは?",
      choices: [
        { id: "q4-a", text: "さすが", isCorrect: true },
        { id: "q4-b", text: "ながれいし" },
        { id: "q4-c", text: "るせき" },
        { id: "q4-d", text: "りゅうがん" },
      ],
      explanation:
        "「流石」は「さすが」と読みます。中国の故事「漱石枕流」に由来し、負けを認めない強情さを表す言葉でした。",
    },
    {
      id: "q5",
      text: "「海月」の読みは?",
      choices: [
        { id: "q5-a", text: "うみつき" },
        { id: "q5-b", text: "くらげ", isCorrect: true },
        { id: "q5-c", text: "かいげつ" },
        { id: "q5-d", text: "いるか" },
      ],
      explanation:
        "「海月」は「くらげ」と読みます。海に浮かぶ姿が月のように見えることから名付けられました。「水母」とも書きます。",
    },
    {
      id: "q6",
      text: "「土竜」の読みは?",
      choices: [
        { id: "q6-a", text: "どりゅう" },
        { id: "q6-b", text: "つちへび" },
        { id: "q6-c", text: "もぐら", isCorrect: true },
        { id: "q6-d", text: "かめ" },
      ],
      explanation:
        "「土竜」は「もぐら」と読みます。中国語では「土竜」はミミズを指しますが、日本ではモグラの当て字として定着しました。",
    },
    {
      id: "q7",
      text: "「案山子」の読みは?",
      choices: [
        { id: "q7-a", text: "あんざんし" },
        { id: "q7-b", text: "かかし", isCorrect: true },
        { id: "q7-c", text: "やまんば" },
        { id: "q7-d", text: "はたけ" },
      ],
      explanation:
        "「案山子」は「かかし」と読みます。元々は禅宗の用語で「山の中の人形」を意味し、田畑の鳥よけ人形に転用されました。",
    },
    {
      id: "q8",
      text: "「齧歯類」の読みは?",
      choices: [
        { id: "q8-a", text: "げっしるい", isCorrect: true },
        { id: "q8-b", text: "かじはるい" },
        { id: "q8-c", text: "きばるい" },
        { id: "q8-d", text: "ちいさるい" },
      ],
      explanation:
        "「齧歯類」は「げっしるい」と読みます。「齧」はかじるという意味で、ネズミやリスなど物をかじる歯を持つ動物の分類名です。",
    },
    {
      id: "q9",
      text: "「鸚鵡」の読みは?",
      choices: [
        { id: "q9-a", text: "にわとり" },
        { id: "q9-b", text: "おうむ", isCorrect: true },
        { id: "q9-c", text: "くじゃく" },
        { id: "q9-d", text: "うぐいす" },
      ],
      explanation:
        "「鸚鵡」は「おうむ」と読みます。「鸚鵡返し」という慣用句でもおなじみ。合計で57画もある難読漢字です。",
    },
    {
      id: "q10",
      text: "「鍼灸」の読みは?",
      choices: [
        { id: "q10-a", text: "しんきゅう", isCorrect: true },
        { id: "q10-b", text: "はりきゅう" },
        { id: "q10-c", text: "ちんきゅう" },
        { id: "q10-d", text: "てんきゅう" },
      ],
      explanation:
        "「鍼灸」は「しんきゅう」と読みます。「鍼」は針治療、「灸」はお灸を意味し、東洋医学の代表的な治療法です。",
    },
  ],
  results: [
    {
      id: "beginner",
      title: "漢字ビギナー",
      description:
        "まだまだ伸びしろたっぷり! 日常の中で漢字に触れる機会を増やしてみましょう。読書や漢字ドリルがおすすめです。",
      icon: "🌱",
      minScore: 0,
      recommendation: "漢字辞典で漢字の世界を探検しよう",
      recommendationLink: "/dictionary/kanji",
    },
    {
      id: "egg",
      title: "漢字の卵",
      description:
        "基本的な難読漢字はバッチリ! もう少し難しい漢字にも挑戦してみましょう。四字熟語の学習もおすすめです。",
      icon: "🥚",
      minScore: 3,
      recommendation: "四字熟語辞典でさらにレベルアップ",
      recommendationLink: "/dictionary/yoji",
    },
    {
      id: "intermediate",
      title: "漢字中級者",
      description:
        "なかなかの漢字力です! 日常的に漢字に親しんでいることがうかがえます。さらに上を目指して学習を続けましょう。",
      icon: "📖",
      minScore: 5,
      recommendation: "漢字カナールで毎日の漢字トレーニング",
      recommendationLink: "/games/kanji-kanaru",
    },
    {
      id: "advanced",
      title: "漢字上級者",
      description:
        "かなりの漢字通! 難読漢字もスラスラ読める実力の持ち主です。漢字検定にも挑戦できるレベルでしょう。",
      icon: "🎓",
      minScore: 7,
      recommendation: "漢字カナールであなたの実力を試そう",
      recommendationLink: "/games/kanji-kanaru",
    },
    {
      id: "master",
      title: "漢字マスター",
      description:
        "素晴らしい漢字力! 難読漢字をほぼ完璧に読みこなすあなたは、まさに漢字マスターです。周りの人にも自慢できますね!",
      icon: "👑",
      minScore: 9,
      recommendation: "漢字辞典であなたの知識をさらに深めよう",
      recommendationLink: "/dictionary/kanji",
    },
  ],
};

export default kanjiLevelQuiz;
