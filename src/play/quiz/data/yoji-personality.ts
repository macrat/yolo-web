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
    shortTitle: "四字熟語で性格診断",
    description:
      "8つの質問に答えて、あなたの性格にぴったりの四字熟語を見つけましょう。努力家?自由人?リーダー?あなたの本質を四字熟語が教えてくれます。",
    shortDescription: "性格診断であなたにぴったりの四字熟語を発見",
    type: "personality",
    category: "personality",
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
    publishedAt: "2026-02-23T22:42:57+09:00",
    relatedLinks: [
      { label: "四字熟語辞典で詳しく見る", href: "/dictionary/yoji" },
      { label: "四字キメルで遊ぶ", href: "/play/yoji-kimeru" },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。質問と結果はAIが創作しました。楽しみとしてお楽しみください。",
    seoTitle: "あなたを四字熟語に例えると? 無料・心理テスト | 四字熟語性格診断",
    faq: [
      {
        question: "診断結果の四字熟語は何種類ありますか？",
        answer:
          "初志貫徹・天真爛漫・切磋琢磨・一期一会・臨機応変・明鏡止水・以心伝心・勇往邁進の8種類です。",
      },
      {
        question: "四字熟語の意味も教えてもらえますか？",
        answer:
          "結果画面には四字熟語の意味と、あなたの性格への当てはめ方が表示されます。さらに詳しい語義は四字熟語辞典のリンクからご確認いただけます。",
      },
      {
        question: "診断に科学的な根拠はありますか？",
        answer:
          "この診断はAIが創作したエンターテインメントコンテンツです。心理学的な裏付けはありません。楽しみとしてお試しください。",
      },
      {
        question: "友人と結果を比べることはできますか？",
        answer:
          "結果ページをそのままSNSで共有できます。友人の結果と見比べて楽しんでください。",
      },
    ],
    resultPageLabels: {
      traitsHeading: "この四字熟語が示す気性",
      behaviorsHeading: "この四字熟語を体現する場面",
      adviceHeading: "この四字熟語を活かすには",
    },
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
      detailedContent: {
        traits: [
          "一度「やる」と決めたら、誰に何を言われても方向転換しないタイプ。",
          "途中でやめることへの抵抗感が強く、投げ出した自分を許せない感覚がある。",
          "ゴールが遠くても、小さな積み重ねの先に必ず到達できると信じている。",
          "周りが「もういいんじゃない?」と言っても、自分の中の締め切りは自分が決める。",
        ],
        behaviors: [
          "手帳や日記に目標を書いて、定期的に見返して進捗を確認している。",
          "友達に「もうやめたら?」と言われるたびに、なぜか逆に燃えてくる自分に気づく。",
          "三日坊主で終わったことを数年後まで覚えていて、ふとしたときに悔しくなる。",
          "「継続は力なり」という言葉を、深く頷きながら読んだことがある。",
        ],
        advice:
          "あなたの粘り強さはほんとうに強い。まだ踏み出せていないことがあれば、今日一歩だけ動いてみて。その一歩が、後で振り返ったとき一番大きな転換点になるから。",
      },
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
      detailedContent: {
        traits: [
          "面白そう! という直感だけで行動していて、気づいたら楽しい場所にいる。",
          "「空気を読む」より「空気を作る」方が向いているタイプ。",
          "子どもっぽいと言われることもあるけど、それが逆に武器になっている。",
          "テンションが場を変えることを、なんとなく自覚している。",
        ],
        behaviors: [
          "初対面の人の前でも、気がついたらしゃべり続けていて「え、もうこんな時間?」となる。",
          "面白そうなイベントを見つけたら、誰かを誘う前に自分が先にノリノリになっている。",
          "真顔で「なんで?」と聞くだけで場が和む、という体験を何度もしている。",
          "会話に詰まったとき、なぜか自分がとっさに何かを言って、笑いに変えてしまう。",
        ],
        advice:
          "あなたのそのノリと笑顔、周りはちゃんと助けられてる。自分らしさを出せる場所に積極的に顔を出してみて。新しい出会いが待ってるよ。",
      },
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
      detailedContent: {
        traits: [
          "一人で頑張るよりも、誰かと並走しているほうが圧倒的に燃えるタイプ。",
          "ライバルに感謝できる。「あいつがいるから自分も伸びた」と本気で思える。",
          "自分だけが上手くなっても嬉しくなくて、仲間も一緒に成長してほしいと思っている。",
          "練習や努力の過程を誰かと共有することに、特別な充実感を感じる。",
        ],
        behaviors: [
          "友達が新しいスキルを習得したと聞いて、「自分も負けてられない」と当日中に練習を始める。",
          "グループ課題で自分のパートが終わっても、他のメンバーの進捗が気になって声をかけてしまう。",
          "尊敬できる仲間がいると、なぜか睡眠時間を削ってでもやる気が出る不思議な体質。",
          "「あのとき一緒にやって良かった」と思える経験を、人生の宝として大切にしている。",
        ],
        advice:
          "仲間と高め合えるあなたは、チームに欠かせない存在。まだ一緒に挑戦したいことがあれば、勇気を出して誰かを誘ってみて。その声がけが、みんなの転機になるかもしれない。",
      },
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
      detailedContent: {
        traits: [
          "「また今度」という言葉が、少しだけ苦手。今この瞬間を逃したくない気持ちが強い。",
          "別れ際にじんわりくる。「この時間、もう二度と戻らない」と感じる瞬間が多い。",
          "初めて会った人の名前や話した内容を、時間が経っても覚えていることが多い。",
          "人との縁に偶然はないと思っていて、出会いを大切にしたいという気持ちが強い。",
        ],
        behaviors: [
          "旅先で話しかけてきた地元の人との会話を、数年後もなんとなく覚えている。",
          "久しぶりに会えた友人との時間が終わりに近づくと、「もう少し話したかったな」と思う。",
          "SNSで偶然見つけた昔のクラスメートに、勇気を出してメッセージを送ったことがある。",
          "誕生日や記念日をきちんと覚えていて、さりげなく一言送れる人でいたいと思っている。",
        ],
        advice:
          "あなたが大切にしてきた縁は、相手にもちゃんと届いている。久しぶりに連絡を取りたい人がいれば、今日送ってみて。意外と向こうも待ってたりするから。",
      },
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
      detailedContent: {
        traits: [
          "予定が狂ったとき、むしろ「どうする?」と考えるのが楽しくなるタイプ。",
          "「想定外」という言葉にあまりビビらない。むしろ腕の見せどころと感じる。",
          "状況を見て、自分の立ち位置を瞬時に調整できる。誰も言わなくても気づく。",
          "頭の中でいつも「もし〇〇になったら?」という仮定シナリオを回している。",
        ],
        behaviors: [
          "会議中に突然の変更が入っても、3秒で代案を出して場が動き出したことがある。",
          "旅行先でお目当ての店が休みだったとき、「じゃあこっち行ってみよう」と即座に切り替えられる。",
          "友達グループの雰囲気が微妙なとき、空気を読んで話題を変えるのがいつも自分だと気づく。",
          "用意していた計画が崩れるほど、アドリブでなんとかなった記憶の方が印象に残っている。",
        ],
        advice:
          "あなたの対応力は周りにとって本当に頼もしい。その柔軟さを活かして、新しい環境や役割にも飛び込んでみて。きっとそこでも持ち前の機転が活きるはず。",
      },
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
      detailedContent: {
        traits: [
          "感情的になっている人のそばにいると、自分が自然と落ち着き役になっていることが多い。",
          "急かされても焦らない。自分のペースを乱さないことへのこだわりがある。",
          "表面的な情報よりも、背景や文脈を読み取ることに長けている。",
          "感情に流されず、後から後悔しない選択ができていることが多い。",
        ],
        behaviors: [
          "周囲が動揺しているとき、自分だけがいつものトーンで話していて「なんで落ち着いてるの?」と言われる。",
          "怒りを感じても、すぐには言葉にせず一晩置いてから伝えるかどうかを考える。",
          "悩んでいる友人の話を最後まで黙って聞いてから、一言だけ返すスタイルが染み付いている。",
          "誰かがパニックになっている場面で、まず「今何ができる?」と整理してしまう。",
        ],
        advice:
          "あなたの静けさは、周りにとって安心の灯台みたいな存在。その落ち着きを大切にしながら、自分の考えや感じていることも誰かに話してみて。意外と深く刺さるから。",
      },
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
      detailedContent: {
        traits: [
          "相手が何も言わなくても「あ、今しんどいんだな」とわかってしまう瞬間がある。",
          "言葉より声のトーンや間の取り方で、その人の本音を読み取ることが多い。",
          "「なんで気づいてくれたの?」と言われることが、じつはけっこうある。",
          "人の感情に引っ張られやすいぶん、一人の時間でリセットが必要なタイプでもある。",
        ],
        behaviors: [
          "友達がLINEの返信を遅らせているとき、「忙しいのかな、それとも疲れてるのかな」と3パターン想像してから待つ。",
          "グループの中で誰かが浮いていると感じたら、自然にその人の隣に座っていることがある。",
          "「なんかあった?」と聞いたら「なんでわかったの?」と驚かれる経験が何度もある。",
          "相手が言葉に詰まっていると、続きを先回りして言いたくなる衝動を抑えるのが大変。",
        ],
        advice:
          "あなたの共感力は、誰かにとって本当の救いになっている。その感性を活かして、まだ話せていない人に声をかけてみて。あなたの一言が、その人の1日を変えるかもしれない。",
      },
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
      detailedContent: {
        traits: [
          "「まずやってみよう」が口癖で、考えすぎる前に動き出していることが多い。",
          "リスクより「やらなかった後悔」の方が怖い、という感覚がある。",
          "チームが迷っているとき、最初に「じゃあ俺がやる」と言えるタイプ。",
          "失敗してもそこまで引きずらない。むしろ次の挑戦のネタができたと思う。",
        ],
        behaviors: [
          "「向いてないかも」と思っても、やってみてから判断するので実は経験値がすごい。",
          "友達が悩んでいるとき、背中を押す言葉を自然に言えて「ありがとう」と言われることが多い。",
          "やりたいことリストを作ると、気づいたら半分以上に実行済みのチェックが入っている。",
          "「それ難しいんじゃない?」と言われると、なぜかやる気が上がる体質。",
        ],
        advice:
          "あなたの行動力が、誰かの勇気に火をつけていることは間違いない。次にやりたいことがあれば、迷わず一歩踏み出してみて。その背中を見ている人が絶対いるから。",
      },
    },
  ],
};

export default yojiPersonalityQuiz;
