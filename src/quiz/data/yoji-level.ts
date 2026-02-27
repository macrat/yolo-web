import type { QuizDefinition } from "../types";

const yojiLevelQuiz: QuizDefinition = {
  meta: {
    slug: "yoji-level",
    title: "四字熟語力診断",
    description:
      "四字熟語の意味から正しい熟語を当てるクイズです。全10問であなたの四字熟語力を診断します。日常で使える四字熟語から難読なものまで幅広く出題!",
    shortDescription: "四字熟語10問であなたの語彙力を測定",
    type: "knowledge",
    questionCount: 10,
    icon: "四",
    accentColor: "#7c3aed",
    keywords: [
      "四字熟語",
      "クイズ",
      "診断",
      "語彙力",
      "テスト",
      "四字熟語力",
      "意味",
    ],
    publishedAt: "2026-02-23",
    relatedLinks: [
      { label: "四字熟語辞典で学ぶ", href: "/dictionary/yoji" },
      { label: "四字キメルで遊ぶ", href: "/games/yoji-kimeru" },
    ],
    trustLevel: "curated",
    trustNote:
      "スコア計算は正確です。問題と正解はAIが辞書を参照して作成しています。解説文はAIの見解であり、誤りを含む可能性があります。",
  },
  questions: [
    {
      // life category, difficulty 1
      id: "q1",
      text: "「一生に一度の出会いを大切にすること」を表す四字熟語は?",
      choices: [
        { id: "q1-a", text: "一期一会", isCorrect: true },
        { id: "q1-b", text: "一日一善" },
        { id: "q1-c", text: "一念発起" },
        { id: "q1-d", text: "一意専心" },
      ],
      explanation:
        "「一期一会」は「いちごいちえ」と読みます。茶道の心得に由来し、二度とない出会いの一瞬を大切にするという意味です。",
    },
    {
      // effort category, difficulty 1
      id: "q2",
      text: "「互いに競い合い高め合うこと」を表す四字熟語は?",
      choices: [
        { id: "q2-a", text: "粉骨砕身" },
        { id: "q2-b", text: "切磋琢磨", isCorrect: true },
        { id: "q2-c", text: "奮闘努力" },
        { id: "q2-d", text: "勇往邁進" },
      ],
      explanation:
        "「切磋琢磨」は「せっさたくま」と読みます。玉を切り磨くように、仲間と励まし合いながら学問や人格を高めることを意味します。",
    },
    {
      // nature category, difficulty 1
      id: "q3",
      text: "「自然の美しい風景」を表す四字熟語は?",
      choices: [
        { id: "q3-a", text: "春夏秋冬" },
        { id: "q3-b", text: "森羅万象" },
        { id: "q3-c", text: "花鳥風月", isCorrect: true },
        { id: "q3-d", text: "天変地異" },
      ],
      explanation:
        "「花鳥風月」は「かちょうふうげつ」と読みます。花・鳥・風・月という自然の美しいものの総称で、風流を楽しむことも意味します。",
    },
    {
      // emotion category, difficulty 1
      id: "q4",
      text: "「疑う心があると何でも怖くなる」ことを表す四字熟語は?",
      choices: [
        { id: "q4-a", text: "半信半疑" },
        { id: "q4-b", text: "五里霧中" },
        { id: "q4-c", text: "疑心暗鬼", isCorrect: true },
        { id: "q4-d", text: "意気消沈" },
      ],
      explanation:
        "「疑心暗鬼」は「ぎしんあんき」と読みます。疑いの心を持つと暗闇に鬼が見えるように、何でもないことまで恐ろしく感じるという意味です。",
    },
    {
      // society category, difficulty 1
      id: "q5",
      text: "「言葉なしに心が通じ合うこと」を表す四字熟語は?",
      choices: [
        { id: "q5-a", text: "異口同音" },
        { id: "q5-b", text: "以心伝心", isCorrect: true },
        { id: "q5-c", text: "付和雷同" },
        { id: "q5-d", text: "十人十色" },
      ],
      explanation:
        "「以心伝心」は「いしんでんしん」と読みます。もとは禅宗の用語で、文字や言葉を使わずに師の心が弟子に伝わることを意味しました。",
    },
    {
      // knowledge category, difficulty 1
      id: "q6",
      text: "「古いことを学び新しい知識を得ること」を表す四字熟語は?",
      choices: [
        { id: "q6-a", text: "博学多才" },
        { id: "q6-b", text: "温故知新", isCorrect: true },
        { id: "q6-c", text: "古今東西" },
        { id: "q6-d", text: "学問研究" },
      ],
      explanation:
        "「温故知新」は「おんこちしん」と読みます。孔子の言葉に由来し、過去の事柄を研究して新しい知識や見解を得ることを意味します。",
    },
    {
      // conflict category, difficulty 1
      id: "q7",
      text: "「周囲が敵ばかりで孤立すること」を表す四字熟語は?",
      choices: [
        { id: "q7-a", text: "百戦錬磨" },
        { id: "q7-b", text: "一騎当千" },
        { id: "q7-c", text: "戦々恐々" },
        { id: "q7-d", text: "四面楚歌", isCorrect: true },
      ],
      explanation:
        "「四面楚歌」は「しめんそか」と読みます。楚の項羽が漢の劉邦に包囲された際、四方から楚の歌が聞こえて味方が寝返ったと悟った故事に由来します。",
    },
    {
      // change category, difficulty 2
      id: "q8",
      text: "「命令がすぐに変わること」を表す四字熟語は?",
      choices: [
        { id: "q8-a", text: "千変万化" },
        { id: "q8-b", text: "本末転倒" },
        { id: "q8-c", text: "朝令暮改", isCorrect: true },
        { id: "q8-d", text: "急転直下" },
      ],
      explanation:
        "「朝令暮改」は「ちょうれいぼかい」と読みます。朝に出した命令を夕方にはもう改めるということで、方針が一貫しないことを批判する表現です。",
    },
    {
      // virtue category, difficulty 2
      id: "q9",
      text: "「心が清く正しいこと」を表す四字熟語は?",
      choices: [
        { id: "q9-a", text: "品行方正" },
        { id: "q9-b", text: "清廉潔白", isCorrect: true },
        { id: "q9-c", text: "公明正大" },
        { id: "q9-d", text: "質実剛健" },
      ],
      explanation:
        "「清廉潔白」は「せいれんけっぱく」と読みます。私利私欲がなく、心が清らかで後ろ暗いところが全くないことを意味します。",
    },
    {
      // knowledge category, difficulty 3 (MUST FIX: replaced negative/荒唐無稽 with difficulty 3)
      id: "q10",
      text: "「広く読んでよく記憶すること」を表す四字熟語は?",
      choices: [
        { id: "q10-a", text: "博学多才" },
        { id: "q10-b", text: "読書三到" },
        { id: "q10-c", text: "理路整然" },
        { id: "q10-d", text: "博覧強記", isCorrect: true },
      ],
      explanation:
        "「博覧強記」は「はくらんきょうき」と読みます。幅広く書物を読み、その内容をしっかり記憶している博識な人を表す言葉です。",
    },
  ],
  results: [
    {
      id: "beginner",
      title: "四字熟語ビギナー",
      description:
        "まだまだ伸びしろたっぷり! まずは日常でよく使われる四字熟語から覚えてみましょう。四字熟語辞典で楽しく学べます。",
      icon: "\u{1F331}",
      minScore: 0,
      recommendation: "四字熟語辞典で学ぼう",
      recommendationLink: "/dictionary/yoji",
    },
    {
      id: "learner",
      title: "四字熟語見習い",
      description:
        "基本的な四字熟語はバッチリ! もう少し難しい四字熟語にも挑戦してみましょう。四字キメルで遊びながら覚えるのがおすすめです。",
      icon: "\u{1F4DD}",
      minScore: 3,
      recommendation: "四字キメルで遊びながら覚えよう",
      recommendationLink: "/games/yoji-kimeru",
    },
    {
      id: "intermediate",
      title: "四字熟語中級者",
      description:
        "なかなかの四字熟語力です! 日頃から言葉に親しんでいることがうかがえます。さらに上を目指して語彙力を磨きましょう。",
      icon: "\u{1F4D6}",
      minScore: 5,
      recommendation: "四字熟語辞典でさらに知識を深めよう",
      recommendationLink: "/dictionary/yoji",
    },
    {
      id: "advanced",
      title: "四字熟語上級者",
      description:
        "かなりの語彙力の持ち主! 難しい四字熟語もスラスラ答えられる実力者です。四字キメルであなたの実力を存分に発揮しましょう。",
      icon: "\u{1F393}",
      minScore: 7,
      recommendation: "四字キメルで実力を試そう",
      recommendationLink: "/games/yoji-kimeru",
    },
    {
      id: "master",
      title: "四字熟語マスター",
      description:
        "素晴らしい四字熟語力! ほぼ完璧に四字熟語を使いこなすあなたは、まさに四字熟語マスターです。その知識を周りの人にも分けてあげましょう!",
      icon: "\u{1F451}",
      minScore: 9,
      recommendation: "四字熟語辞典を制覇しよう",
      recommendationLink: "/dictionary/yoji",
    },
  ],
};

export default yojiLevelQuiz;
