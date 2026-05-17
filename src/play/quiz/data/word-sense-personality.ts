import type { QuizDefinition, CompatibilityEntry } from "../types";
export type { CompatibilityEntry };

/**
 * Word Sense Personality Quiz（言葉センス診断）
 *
 * 8 personality types based on word choice style:
 *   elegant-precise  — 一字千金（いちじせんきん）: precise, refined word selection
 *   warm-empathy     — 和顔愛語（わがんあいご）:  empathetic, warm words
 *   creative-playful — 奇想天外（きそうてんがい）: creative, playful expressions
 *   logical-clear    — 理路整然（りろせいぜん）:  logical, clear communication
 *   poetic-sensory   — 花鳥風月（かちょうふうげつ）: poetic, sensory descriptions
 *   bold-impact      — 疾風迅雷（しっぷうじんらい）: bold, impactful words
 *   humor-wit        — 抱腹絶倒（ほうふくぜっとう）: humorous, witty expressions
 *   gentle-indirect  — 柔和温順（にゅうわおんじゅん）: gentle, indirect phrasing
 *
 * Primary distribution (each type primary 5 times = 8×5 = 40 = 10Q×4C):
 *   elegant-precise:  Q1A, Q3A, Q5D, Q7B, Q9C
 *   warm-empathy:     Q2A, Q3B, Q6A, Q7C, Q10C
 *   creative-playful: Q1B, Q3C, Q5A, Q8D, Q10B
 *   logical-clear:    Q2B, Q3D, Q5B, Q8A, Q10D
 *   poetic-sensory:   Q2D, Q4A, Q6C, Q8C, Q9B
 *   bold-impact:      Q2C, Q4B, Q6B, Q9A, Q7D
 *   humor-wit:        Q1C, Q4C, Q6D, Q7A, Q9D
 *   gentle-indirect:  Q1D, Q4D, Q5C, Q8B, Q10A
 */

const wordSensePersonalityQuiz: QuizDefinition = {
  meta: {
    slug: "word-sense-personality",
    title: "あなたの言葉センス診断",
    shortTitle: "言葉センス診断",
    description:
      "日常の場面で「どんな言葉を選ぶか」からあなたの言葉センスタイプを診断! 一字千金、奇想天外、花鳥風月など四字熟語で表される8タイプの中から、あなたにぴったりのタイプを見つけます。全10問、友達との相性診断もできます!",
    shortDescription: "言葉の選び方で性格がわかる! 四字熟語8タイプ診断",
    type: "personality",
    category: "personality",
    questionCount: 10,
    icon: "✍️",
    accentColor: "#e11d48",
    keywords: [
      "言葉センス",
      "言葉選び",
      "性格診断",
      "四字熟語",
      "コミュニケーション",
      "言葉の使い方",
      "表現力",
      "語彙",
      "日本語",
    ],
    publishedAt: "2026-03-30T18:00:00+09:00",
    relatedLinks: [
      { label: "四字熟語性格診断を受ける", href: "/play/yoji-personality" },
      { label: "四字熟語力診断に挑戦", href: "/play/yoji-level" },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。タイプ分類と診断結果はAIが創作したエンターテインメントです。",
    faq: [
      {
        question: "何問答えると結果が出ますか？",
        answer:
          "全10問です。日常のさまざまな場面での言葉の選び方を答えると、あなたの言葉センスタイプが判定されます。所要時間は1〜2分程度です。",
      },
      {
        question: "結果のタイプは何種類ありますか？",
        answer:
          "一字千金、和顔愛語、奇想天外、理路整然、花鳥風月、疾風迅雷、抱腹絶倒、柔和温順の全8タイプです。すべて四字熟語で表現されています。",
      },
      {
        question: "友達との言葉センス相性診断はできますか？",
        answer:
          "はい。結果ページから友達のタイプとの相性を確認できます。8タイプの組み合わせによる36通りの相性パターンが用意されています。",
      },
      {
        question: "診断結果は科学的な根拠がありますか？",
        answer:
          "この診断はエンターテインメント目的で制作されており、科学的・心理学的な根拠はありません。言葉の好みにインスパイアされたタイプ分類をお楽しみください。",
      },
    ],
  },
  questions: [
    {
      // Q1: elegant-precise(A), creative-playful(B), humor-wit(C), gentle-indirect(D)
      id: "q1",
      text: "AIに人生相談したら四字熟語だけで返事が来た! あなたなら何と返す?",
      choices: [
        {
          id: "q1-a",
          text: "「なるほど、つまり……」と要点だけを短く整理して返す",
          points: { "elegant-precise": 2, "logical-clear": 1 },
        },
        {
          id: "q1-b",
          text: "「じゃあ私も四字熟語で!」と即興で返歌を詠む",
          points: { "creative-playful": 2, "humor-wit": 1 },
        },
        {
          id: "q1-c",
          text: "「AIよ、もっと砕けた言葉を教えてくれ」とボケで返す",
          points: { "humor-wit": 2, "creative-playful": 1 },
        },
        {
          id: "q1-d",
          text: "「深い言葉をありがとう、少し考えてみます」と丁寧にお礼を言う",
          points: { "gentle-indirect": 2, "warm-empathy": 1 },
        },
      ],
    },
    {
      // Q2: warm-empathy(A), logical-clear(B), bold-impact(C), poetic-sensory(D)
      id: "q2",
      text: "友達がSNSに「今日は最悪な日だった」と投稿。あなたのリプライは?",
      choices: [
        {
          id: "q2-a",
          text: "「つらかったね、何があったの? 話聞くよ」と寄り添う",
          points: { "warm-empathy": 2, "gentle-indirect": 1 },
        },
        {
          id: "q2-b",
          text: "「原因は何? 解決策を一緒に考えよう」と整理を提案する",
          points: { "logical-clear": 2, "elegant-precise": 1 },
        },
        {
          id: "q2-c",
          text: "「明日は絶対よくなる! 今夜は全部忘れて休もう」と強く励ます",
          points: { "bold-impact": 2, "warm-empathy": 1 },
        },
        {
          id: "q2-d",
          text: "「雨の日の後には虹が出るよ」と情景を込めてそっと伝える",
          points: { "poetic-sensory": 2, "gentle-indirect": 1 },
        },
      ],
    },
    {
      // Q3: elegant-precise(A), warm-empathy(B), creative-playful(C), logical-clear(D)
      id: "q3",
      text: "プレゼン資料のタイトルを頼まれた。あなたが考えるのは?",
      choices: [
        {
          id: "q3-a",
          text: "「3分でわかる〇〇」— 短く、核心だけを突いたタイトル",
          points: { "elegant-precise": 2, "bold-impact": 1 },
        },
        {
          id: "q3-b",
          text: "「みんなで考える〇〇」— 聞く人が参加したくなるタイトル",
          points: { "warm-empathy": 2, "gentle-indirect": 1 },
        },
        {
          id: "q3-c",
          text: "「もし〇〇が宇宙に行ったら」— 誰も思いつかない奇抜な切り口",
          points: { "creative-playful": 2, "humor-wit": 1 },
        },
        {
          id: "q3-d",
          text: "「〇〇の現状と課題と解決策」— 構成がひと目でわかるタイトル",
          points: { "logical-clear": 2, "elegant-precise": 1 },
        },
      ],
    },
    {
      // Q4: poetic-sensory(A), bold-impact(B), humor-wit(C), gentle-indirect(D)
      id: "q4",
      text: "SNSで1万いいねがついた投稿の内容は? あなたの理想を選んでください。",
      choices: [
        {
          id: "q4-a",
          text: "夕焼けの写真に「今日も世界はこんなに美しかった」と一言",
          points: { "poetic-sensory": 2, "warm-empathy": 1 },
        },
        {
          id: "q4-b",
          text: "「人生で一番大事なことを30秒で言います」という宣言から始まる投稿",
          points: { "bold-impact": 2, "elegant-precise": 1 },
        },
        {
          id: "q4-c",
          text: "「猫がパソコンに乗ってきたので今日の仕事は終わり」という報告",
          points: { "humor-wit": 2, "creative-playful": 1 },
        },
        {
          id: "q4-d",
          text: "「ありがとう」とだけ書いて、日々の感謝を静かに伝える投稿",
          points: { "gentle-indirect": 2, "poetic-sensory": 1 },
        },
      ],
    },
    {
      // Q5: creative-playful(A), logical-clear(B), gentle-indirect(C), elegant-precise(D)
      id: "q5",
      text: "新しい商品の名前を考えてほしいと頼まれた。あなたのアプローチは?",
      choices: [
        {
          id: "q5-a",
          text: "言葉を組み合わせたり、造語を作ったりして遊ぶ",
          points: { "creative-playful": 2, "humor-wit": 1 },
        },
        {
          id: "q5-b",
          text: "ターゲット・特徴・競合を分析して最適な名前を導く",
          points: { "logical-clear": 2, "elegant-precise": 1 },
        },
        {
          id: "q5-c",
          text: "使う人が親しみやすく、呼びやすい名前を重視する",
          points: { "gentle-indirect": 2, "warm-empathy": 1 },
        },
        {
          id: "q5-d",
          text: "一語で本質を表す、無駄のないシンプルな名前を選ぶ",
          points: { "elegant-precise": 2, "logical-clear": 1 },
        },
      ],
    },
    {
      // Q6: warm-empathy(A), bold-impact(B), poetic-sensory(C), humor-wit(D)
      id: "q6",
      text: "チームの士気が下がっている。あなたはどう声をかける?",
      choices: [
        {
          id: "q6-a",
          text: "一人ひとりに声をかけて「どうした? 何かあった?」と聞いてまわる",
          points: { "warm-empathy": 2, "gentle-indirect": 1 },
        },
        {
          id: "q6-b",
          text: "「ここが踏ん張りどころ! 自分を信じて!」と熱く背中を押す",
          points: { "bold-impact": 2, "elegant-precise": 1 },
        },
        {
          id: "q6-c",
          text: "「桜は嵐の後に最も美しく咲く」と静かに語りかける",
          points: { "poetic-sensory": 2, "warm-empathy": 1 },
        },
        {
          id: "q6-d",
          text: "「みんな疲れてるんだから、今日はもう帰ろう!」とボケて笑わせる",
          points: { "humor-wit": 2, "creative-playful": 1 },
        },
      ],
    },
    {
      // Q7: humor-wit(A), elegant-precise(B), warm-empathy(C), bold-impact(D)
      id: "q7",
      text: "職場の飲み会でスピーチを頼まれた。何を言う?",
      choices: [
        {
          id: "q7-a",
          text: "「乾杯の前に一言……と言いつつ10分話す人の気持ちがわかりました」とつかみ",
          points: { "humor-wit": 2, "creative-playful": 1 },
        },
        {
          id: "q7-b",
          text: "「今年の成果を一言で言うと『成長』。以上です」と潔く終える",
          points: { "elegant-precise": 2, "bold-impact": 1 },
        },
        {
          id: "q7-c",
          text: "「皆さんがいてくれたから、今の自分がいます。本当にありがとう」と感謝",
          points: { "warm-empathy": 2, "gentle-indirect": 1 },
        },
        {
          id: "q7-d",
          text: "「来年は全員で最高の景色を見に行く! それだけ言いたかった!」と宣言",
          points: { "bold-impact": 2, "poetic-sensory": 1 },
        },
      ],
    },
    {
      // Q8: logical-clear(A), gentle-indirect(B), poetic-sensory(C), creative-playful(D)
      id: "q8",
      text: "旅行先で感動した景色を誰かに伝えるとき、あなたはどう言う?",
      choices: [
        {
          id: "q8-a",
          text: "「晴れてて、海が青くて、気温25度で最高のコンディションだった」と具体的に",
          points: { "logical-clear": 2, "elegant-precise": 1 },
        },
        {
          id: "q8-b",
          text: "「なんか、すごくよかった……言葉じゃ説明できない感じ」とふんわり伝える",
          points: { "gentle-indirect": 2, "poetic-sensory": 1 },
        },
        {
          id: "q8-c",
          text: "「風の匂いと波の音が体に染み込んで、時間が溶けるみたいだった」と描写",
          points: { "poetic-sensory": 2, "warm-empathy": 1 },
        },
        {
          id: "q8-d",
          text: "「例えるなら、神様がスクリーンセーバーを更新した瞬間みたいな景色」と例える",
          points: { "creative-playful": 2, "humor-wit": 1 },
        },
      ],
    },
    {
      // Q9: bold-impact(A), poetic-sensory(B), elegant-precise(C), humor-wit(D)
      id: "q9",
      text: "大切な人に「好きです」と伝えるとしたら、あなたの一言は?",
      choices: [
        {
          id: "q9-a",
          text: "「好きです。付き合ってください」とストレートに、これだけ言う",
          points: { "bold-impact": 2, "elegant-precise": 1 },
        },
        {
          id: "q9-b",
          text: "「あなたがいると、世界がもう少し明るく見える気がします」と詩的に",
          points: { "poetic-sensory": 2, "warm-empathy": 1 },
        },
        {
          id: "q9-c",
          text: "「伝えたいことは一つだけ。好きです」と言葉を絞って伝える",
          points: { "elegant-precise": 2, "gentle-indirect": 1 },
        },
        {
          id: "q9-d",
          text: "「こんな自分でよければ……もらってください」とおぼんこぼんばりに",
          points: { "humor-wit": 2, "creative-playful": 1 },
        },
      ],
    },
    {
      // Q10: gentle-indirect(A), creative-playful(B), warm-empathy(C), logical-clear(D)
      id: "q10",
      text: "「怒っているの?」と聞かれた。実は少し不満がある。あなたの答えは?",
      choices: [
        {
          id: "q10-a",
          text: "「怒ってないよ……ただちょっと、思うところはあって」とゆっくり話す",
          points: { "gentle-indirect": 2, "warm-empathy": 1 },
        },
        {
          id: "q10-b",
          text: "「怒ってないよ! ただ私の感情が独自のアップデート中なだけ」とかわす",
          points: { "creative-playful": 2, "humor-wit": 1 },
        },
        {
          id: "q10-c",
          text: "「少し悲しかった。もう少しこうしてほしかったな」と素直に気持ちを話す",
          points: { "warm-empathy": 2, "gentle-indirect": 1 },
        },
        {
          id: "q10-d",
          text: "「具体的に言うと、〇〇の件でこう感じた。改善してほしいのはここ」と整理",
          points: { "logical-clear": 2, "elegant-precise": 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "elegant-precise",
      title: "一字千金（いちじせんきん）タイプ",
      description:
        "あなたは言葉を削ぎ落とす達人です。余分な一語も使わず、少ない言葉で多くの意味を届ける精密な表現力を持っています。あなたの言葉センスの特徴は、「何を言うか」より「何を言わないか」を大切にする点にあります。一文ですべてを伝えることへのこだわりが、読む人・聞く人を引き込む力になっています。言葉を削れば削るほど輝きが増すという、独自の美学を持っています。こんな場面で力を発揮する：会議での一言や、メールの件名、キャッチコピーなど「まとめる力」が問われる場面で真価を発揮します。状況を一語で言い表す瞬発力に、周囲から一目置かれることが多いです。あるある：「三行以上のメッセージは長すぎる」と心の中で思いながら、丁寧に返信している。",
      color: "#6366f1",
      icon: "💎",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "warm-empathy",
      title: "和顔愛語（わがんあいご）タイプ",
      description:
        "あなたは言葉で人を癒す天才です。相手の感情を素早く読み取り、その人が「聞きたかった言葉」をそっと差し出せる稀有な才能を持っています。あなたの言葉センスの特徴は、「正しいこと」より「相手が安心できること」を優先する深い共感力にあります。声のトーン・語尾のニュアンス・絵文字一つまで細やかに配慮していて、受け取る人の心が自然と緩んでいきます。こんな場面で力を発揮する：困った人への一言や、気まずい空気を溶かすとき、誰かの背中をそっと押すときに最も輝きます。言葉で人の心を温めるその力こそが、あなたの最大の武器であり最高の才能です。あるある：「大丈夫?」の一言だけで相手を泣かせてしまったことが、実は一度はある。",
      color: "#ec4899",
      icon: "🌸",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "creative-playful",
      title: "奇想天外（きそうてんがい）タイプ",
      description:
        "あなたの言葉には「予想を裏切る楽しさ」があります。誰もが思いつかない比喩、ありそうでなかった造語、思わず二度見するような切り口で、言葉に命を吹き込みます。あなたの言葉センスの特徴は、「正確さ」より「面白さ」を選ぶ創造的な言語感覚にあります。脳内に言葉の遊び場を持っていて、常に新しい表現を実験し続けています。こんな場面で力を発揮する：キャッチコピー・企画書のタイトル・SNSの投稿など、ひと言で記憶に残る表現が求められる場面が得意です。独自の言語感覚が、読む人に「また読みたい」と思わせる不思議な引力を生み出しています。あるある：辞書で知らない言葉を調べ始めて、気づいたら1時間後に全然別の言葉に夢中になっている。",
      color: "#f97316",
      icon: "🎨",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "logical-clear",
      title: "理路整然（りろせいぜん）タイプ",
      description:
        "あなたの言葉は「霧を晴らす」力を持っています。複雑な状況を整理し、誰もが理解できる言葉で明快に伝えることができる、稀有なコミュニケーション能力の持ち主です。あなたの言葉センスの特徴は、曖昧な表現を嫌い、常に「何が言いたいのか」を核心から逆算して言葉を選ぶ思考にあります。説明が整理されているだけで、話す内容への信頼感が格段に上がります。こんな場面で力を発揮する：説明・報告・議論など、情報を正確に伝えることが求められる場面で圧倒的な強さを発揮します。「わかりやすい」と言われることが、あなたへの最大の褒め言葉です。あるある：「つまりどういうこと?」と誰かに聞かれる前に、すでに自分で「つまり」と整理して話し始めている。",
      color: "#0ea5e9",
      icon: "🔬",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "poetic-sensory",
      title: "花鳥風月（かちょうふうげつ）タイプ",
      description:
        "あなたの言葉には「景色が浮かぶ」力があります。五感を刺激する描写で、読む人・聞く人を瞬時にその場面へ連れていく詩的な表現力の持ち主です。あなたの言葉センスの特徴は、抽象的な感情や体験を、具体的な感覚イメージへと変換できる独特のセンスにあります。自然・音・匂い・光など、日常のあらゆる瞬間に言葉の種を見つける観察眼が鋭く、文章に書くと突然輝き出します。こんな場面で力を発揮する：旅の感想・詩・日記など、感性を言語化する場面で真骨頂を発揮します。あなたの言葉は、読んだ人の記憶の中に長く美しく残り続ける、大切な情景を生み出します。あるある：天気予報を読んで「今日の空は曇りのち感傷」と心の中で言い換えてしまう。",
      color: "#8b5cf6",
      icon: "🌙",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "bold-impact",
      title: "疾風迅雷（しっぷうじんらい）タイプ",
      description:
        "あなたの言葉は「人を動かす」力を持っています。短くても魂がこもった一言で、相手の行動や感情を瞬時に変えることができる、圧倒的な言語の瞬発力の持ち主です。あなたの言葉センスの特徴は、「何度も読まれる」より「一発で刺さる」ことを優先する直球勝負のスタイルにあります。一言の重みと熱量で場の空気を変える力を持っており、迷いのない言葉が人の背中を押します。こんな場面で力を発揮する：演説・宣言・勝負どころの一言など、インパクトが求められる場面で底力を発揮します。言葉に迷いがないから、人の心が動くのです。あるある：LINEの返信が「了解」「いいね」「最高」のどれかで終わることが多いと、自分でも薄々気づいている。",
      color: "#dc2626",
      icon: "⚡",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "humor-wit",
      title: "抱腹絶倒（ほうふくぜっとう）タイプ",
      description:
        "あなたは言葉で笑いを生み出す天才です。絶妙なタイミング、意外な角度からのひと言、ズレを狙ったボケで、周囲の空気を一瞬で和ませる力があります。あなたの言葉センスの特徴は、「笑えるか」というフィルターが常に稼働していることにあります。ユーモアは武器であり、緊張した場の空気を溶かしたり、難しいテーマへの入口を作ったりする知的な技術として使いこなしています。こんな場面で力を発揮する：初対面の場・重い空気の会議・SNSのつかみなど、笑いで橋を架けるシーンで無類の強さを発揮します。言葉で笑わせることで、人と人の距離をぐっと縮めることができます。あるある：真剣な話の中にこっそり一個だけボケを入れてしまい、笑ってほしいのに誰も気づかない。",
      color: "#eab308",
      icon: "😂",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
    {
      id: "gentle-indirect",
      title: "柔和温順（にゅうわおんじゅん）タイプ",
      description:
        "あなたの言葉は「角を立てない」芸術です。はっきり言わなくても相手に伝わる繊細な言葉選びで、誰も傷つけずに気持ちを伝えることができる高度なコミュニケーターです。あなたの言葉センスの特徴は、「伝える」より「伝わる」を大切にする間接的な表現力にあります。言葉のトゲを丸くして、相手が受け取りやすい形に変えることが自然にできます。こんな場面で力を発揮する：断る時・お願いする時・注意する時など、デリケートな場面でこそ真価が輝きます。柔らかい言葉の中に確かな気持ちを込める技術は、人間関係を豊かにする貴重な才能です。傷つけずに本音を伝えられる人は、どんな集団でも必要とされます。あるある：「ちょっとだけ……」と言い始めた時の「ちょっと」が、毎回かなりの量になっている。",
      color: "#14b8a6",
      icon: "🍵",
      recommendation: "あなたの言葉センスを活かして四字熟語力を試してみよう",
      recommendationLink: "/play/yoji-level",
    },
  ],
};

/**
 * Compatibility matrix for all 36 type pairs.
 * Keys are sorted alphabetically: [typeA, typeB].sort().join("--")
 * Each description is 50-100 characters.
 */
export const compatibilityMatrix: Record<string, CompatibilityEntry> = {
  // bold-impact pairings (8 entries)
  "bold-impact--bold-impact": {
    label: "熱量の暴走",
    description:
      "どちらも一言で決める主義で、熱量が高い。会話は短いが、気づけば互いの宣言合戦が止まらなくなっている。",
  },
  "bold-impact--creative-playful": {
    label: "宣言と実験室",
    description:
      "熱量あふれる言葉にクリエイティブな比喩が加わって、会話は一気に盛り上がる。二人の言葉は短くても存在感が抜群だ。",
  },
  "bold-impact--elegant-precise": {
    label: "熱と刃の共演",
    description:
      "力強い一言に洗練された言葉が加わり、短くて深いメッセージが生まれる。インパクトと精度を兼ね備えた理想のペアだ。",
  },
  "bold-impact--gentle-indirect": {
    label: "嵐と凪の調和",
    description:
      "直球な宣言に柔らかな着地が続いてバランスをとる。強すぎず弱すぎず、互いをうまく補い合う絶妙なペアだ。",
  },
  "bold-impact--humor-wit": {
    label: "熱血と笑いの融合",
    description:
      "熱い宣言の直後にボケが入ってズッコケる展開になる。それでも前進し続ける、笑えて元気も出る最高のコンビだ。",
  },
  "bold-impact--logical-clear": {
    label: "直感と設計図",
    description:
      "インパクト派が「やろう!」と宣言し、論理派が手順を整理してくれる。熱意と合理性が共存した最強のペアだ。",
  },
  "bold-impact--poetic-sensory": {
    label: "稲妻と星空",
    description:
      "鋭い一言に詩的な情景が添えられると、メッセージが心の奥まで届く。インパクトと美しさを兼ね備えたペアだ。",
  },
  "bold-impact--warm-empathy": {
    label: "炎と水のバランス",
    description:
      "力強い言葉で引っ張り、温かい言葉でしっかり受け止める。どちらかが熱くなりすぎても大丈夫な安心コンビだ。",
  },

  // creative-playful pairings (7 entries)
  "creative-playful--creative-playful": {
    label: "造語工場大爆発",
    description:
      "二人の会話は新しい言葉と比喩が次々生まれる創作合戦だ。第三者には解読不能なことが多い、独特なペアである。",
  },
  "creative-playful--elegant-precise": {
    label: "自由と編集者",
    description:
      "奔放なアイデアを精密な一言に凝縮してもらえる関係がある。一緒に作ると創作物の完成度が段違いに上がるペアだ。",
  },
  "creative-playful--gentle-indirect": {
    label: "花火と霧の混在",
    description:
      "派手な表現とふんわりした言葉が混在する会話をする。読む人が不思議と癒されるやりとりを生み出す独特なペアだ。",
  },
  "creative-playful--humor-wit": {
    label: "笑いの発電所",
    description:
      "奇想天外な発想に笑いのツッコミが入って会話が止まらなくなる。周りを巻き込んでいく爆笑製造機コンビだ。",
  },
  "creative-playful--logical-clear": {
    label: "夢と仕様書",
    description:
      "「もし月が喋ったら?」という発想を手順立てて整理してくれる。夢と実行力が噛み合う頼もしい最強ペアだ。",
  },
  "creative-playful--poetic-sensory": {
    label: "遊び場と詩集",
    description:
      "言葉で遊ぶ者と景色を描く者が組んでいる。二人の文章を読むとまるで旅をしている気分になる不思議なペアだ。",
  },
  "creative-playful--warm-empathy": {
    label: "虹と太陽",
    description:
      "個性的な表現を「いいね、それ!」と全力で受け止めてもらえる関係がある。創り手にとって最高に幸せなペアだ。",
  },

  // elegant-precise pairings (6 entries)
  "elegant-precise--elegant-precise": {
    label: "一語の無言決闘",
    description:
      "二人の会話は超短い。「了解」「同意」「以上」でLINEが終わることが多い、最短対話を極める独特なペアだ。",
  },
  "elegant-precise--gentle-indirect": {
    label: "簡潔と余白の詩",
    description:
      "短い言葉の後に、ふんわりした言葉が続く会話をする。二人のやりとりには詩のような間があり、美しいペアだ。",
  },
  "elegant-precise--humor-wit": {
    label: "一刀とボケの妙味",
    description:
      "鋭い一言の直後にボケが入るやりとりをする。シリアスになりすぎず、キレも失わない、絶妙な間柄を持つペアだ。",
  },
  "elegant-precise--logical-clear": {
    label: "刀と教科書",
    description:
      "どちらも余分な言葉を使わない派だ。会話は短くて正確で、他の人には少し冷たく見えることもある、独特なペアだ。",
  },
  "elegant-precise--poetic-sensory": {
    label: "点と広がる情景",
    description:
      "一語で核心をつく言葉と五感で描く言葉が交差している。短さと豊かさが美しく共存している、稀有なペアだ。",
  },
  "elegant-precise--warm-empathy": {
    label: "結論と温もり",
    description:
      "要点だけ言う側と気持ちを包む側の組み合わせがある。「で、大丈夫?」のひと言が毎回心に刺さる名コンビだ。",
  },

  // gentle-indirect pairings (5 entries)
  "gentle-indirect--gentle-indirect": {
    label: "ふんわり迷宮",
    description:
      "二人とも「察してほしい」タイプだ。互いに遠慮して「どうする?」「どうでもいい」が延々と続く、不思議なペアだ。",
  },
  "gentle-indirect--humor-wit": {
    label: "柔らかい笑い",
    description:
      "ふんわりした言葉にクスっとしたボケが続く会話をする。やわらかくてあたたかい、とても居心地のいいペアだ。",
  },
  "gentle-indirect--logical-clear": {
    label: "霧と地図の組合せ",
    description:
      "曖昧な表現を丁寧に整理してもらえる関係がある。「つまりこういうこと?」と聞かれて毎回救われるペアだ。",
  },
  "gentle-indirect--poetic-sensory": {
    label: "霞と月光の調べ",
    description:
      "どちらも直接的に言わないタイプだ。二人の会話は詩的で静かで、なんとなく通じ合っている不思議なペアだ。",
  },
  "gentle-indirect--warm-empathy": {
    label: "綿と綿の抱擁",
    description:
      "どちらも相手を傷つけたくないタイプだ。会話はやさしいが、結論がなかなか出ないまま終わることも多いペアだ。",
  },

  // humor-wit pairings (4 entries)
  "humor-wit--humor-wit": {
    label: "漫才大会開幕",
    description:
      "二人がいれば会話はずっと漫才になる。ボケとツッコミが交互に入り、周りが気づけばいつも聴衆になっていた。",
  },
  "humor-wit--logical-clear": {
    label: "ボケと丁寧な解説",
    description:
      "絶妙なボケの後に「つまりこういうことですね」と解説が入る。笑いの中に知性が光る、とても魅力的なペアだ。",
  },
  "humor-wit--poetic-sensory": {
    label: "笑いと詩の交差",
    description:
      "笑えるひと言と詩的な一言が交互に来る。読む人が「笑っていいか感動していいか」迷う、独特な組み合わせ。",
  },
  "humor-wit--warm-empathy": {
    label: "笑いと涙のセット",
    description:
      "笑わせる人と泣かせる人がいるペアだ。二人の話を聞くと最後には笑いながら泣いている自分に気づくコンビ。",
  },

  // logical-clear pairings (3 entries)
  "logical-clear--logical-clear": {
    label: "仕様書の対話",
    description:
      "会話に「つまり」と「なぜなら」が多く出てくる。感情の話になると二人とも急に静かになりがちな独特なペアだ。",
  },
  "logical-clear--poetic-sensory": {
    label: "論文と詩集の合作",
    description:
      "論理で組み立てた言葉に情景の色が添えられていく。伝える力と伝わる力が合体した、最強のペアといえる組み合わせ。",
  },
  "logical-clear--warm-empathy": {
    label: "解決と共感の二刀流",
    description:
      "「どうすれば解決する?」と「どう感じた?」の両方がある会話をする。頼もしくて温かい、理想のペアといえる。",
  },

  // poetic-sensory pairings (2 entries)
  "poetic-sensory--poetic-sensory": {
    label: "詩の連作",
    description:
      "二人の会話は詩の応酬になる。「今日の雨は何色?」「少し青みがかった白」で会話が成立する不思議なペアだ。",
  },
  "poetic-sensory--warm-empathy": {
    label: "情景と温もり",
    description:
      "心の景色を言葉にする人と、その言葉を大切に受け取る人がいる。互いの言葉が宝物になっていく素敵なペアだ。",
  },

  // warm-empathy pairings (1 entry)
  "warm-empathy--warm-empathy": {
    label: "共感の無限ループ",
    description:
      "「わかる!」「それな!」が続く心地よい会話をする。結論は出ないが、二人ともとても満足している幸せなペアだ。",
  },
};

export const WORD_SENSE_TYPE_IDS = [
  "elegant-precise",
  "warm-empathy",
  "creative-playful",
  "logical-clear",
  "poetic-sensory",
  "bold-impact",
  "humor-wit",
  "gentle-indirect",
] as const;

export type WordSenseTypeId = (typeof WORD_SENSE_TYPE_IDS)[number];

export function getCompatibility(
  typeA: string,
  typeB: string,
): CompatibilityEntry | undefined {
  const key = [typeA, typeB].sort().join("--");
  return compatibilityMatrix[key];
}

export function isValidWordSenseTypeId(id: string): id is WordSenseTypeId {
  return (WORD_SENSE_TYPE_IDS as readonly string[]).includes(id);
}

export default wordSensePersonalityQuiz;
