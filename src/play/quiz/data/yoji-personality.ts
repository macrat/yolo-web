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
          "結果画面には、漢字一字ずつの意味解説・出典と由来・あるある行動パターン4項目・座右の銘メッセージが表示されます。さらに詳しい語義は四字熟語辞典のリンクからご確認いただけます。",
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
        variant: "yoji-personality" as const,
        catchphrase: "一度決めたら、最後まで。それがあなた。",
        // 「初」はものごとの始まり、「志」はこころざし・目標、「貫」はつらぬく、「徹」は最後までやり通す意。
        kanjiBreakdown:
          "「初」はものごとの始まり、「志」はこころざし・目標、「貫」はつらぬく、「徹」は最後までやり通す——四字が組み合わさり、最初に抱いた志を最後まで貫き通すという強い意志を表す。",
        // 出典不明確（合成語型）。「初志」と「貫徹」がそれぞれ独立した表現として存在し、組み合わさって一つの四字熟語になったとされる。古典的な出典は特定されていない。
        origin:
          "「初志」と「貫徹」がそれぞれ独立した表現として古くから存在し、組み合わさって一つの四字熟語になったとされる。古典的な明確な出典は特定されておらず、日本で広まった合成語型の表現と考えられている。",
        behaviors: [
          "手帳や日記に目標を書いて、定期的に見返して進捗を確認している。",
          "友達に「もうやめたら?」と言われるたびに、なぜか逆に燃えてくる自分に気づく。",
          "三日坊主で終わったことを数年後まで覚えていて、ふとしたときに悔しくなる。",
          "「継続は力なり」という言葉を、深く頷きながら読んだことがある。",
        ],
        motto:
          "始めた志を信じ、最後まで歩き続けよう。その粘り強さが、あなたの最大の強みだ。",
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
        variant: "yoji-personality" as const,
        catchphrase: "飾らない笑顔が、その場を動かす。",
        // 「天」は天性・生まれつき、「真」はまこと・自然のまま、「爛」はあざやかに輝く、「漫」はあふれ出る。
        kanjiBreakdown:
          "「天」は天性・生まれつき、「真」はまこと・自然のまま、「爛」はあざやかに輝く、「漫」はあふれ出る——生まれ持った純粋さがまばゆく満ちあふれている様子を四字で表す。",
        // 出典不明確（諸説あり）。元の陶宗儀『南村輟耕録』や宋・蘇軾の詩句に関連する表現があるとされるが出典は確定していない。日本では「飾らない自然体の魅力」を表す言葉として広く定着。
        origin:
          "陶宗儀『南村輟耕録』や宋の蘇軾の詩句に関連するとされるが、出典は確定していない（諸説あり）。日本では「飾らない自然体の魅力」を表す言葉として広く定着し、親しまれている。",
        behaviors: [
          "初対面の人の前でも、気がついたらしゃべり続けていて「え、もうこんな時間?」となる。",
          "面白そうなイベントを見つけたら、誰かを誘う前に自分が先にノリノリになっている。",
          "真顔で「なんで?」と聞くだけで場が和む、という体験を何度もしている。",
          "会話に詰まったとき、なぜか自分がとっさに何かを言って、笑いに変えてしまう。",
        ],
        motto:
          "自分らしくいることが、あなたの最大の贈り物。その天真爛漫さを誇りに。",
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
        variant: "yoji-personality" as const,
        catchphrase: "ライバルがいるから、もっと強くなれる。",
        // 「切」は骨を切る、「磋」は象牙をとぐ、「琢」は玉をうつ、「磨」は石をみがく——素材を加工する4つの動作。
        kanjiBreakdown:
          "「切」は骨を切る、「磋」は象牙をとぐ、「琢」は玉をうつ、「磨」は石をみがく——素材を丁寧に加工する四つの動作が組み合わさり、人が互いに磨き合って成長していく姿を表す。",
        // 出典明確。『詩経』衛風・淇奥篇の「切するが如く磋するが如く、琢するが如く磨するが如く」に由来。
        // ファクトチェック済み: 『詩経』衛風・淇奥篇
        origin:
          "『詩経』衛風・淇奥篇「切するが如く磋するが如く、琢するが如く磨するが如く」に由来。もとは素材を加工する様子を詠んだ詩だが、転じて学問や人格を互いに磨き合うことを意味するようになった。",
        behaviors: [
          "友達が新しいスキルを習得したと聞いて、「自分も負けてられない」と当日中に練習を始める。",
          "グループ課題で自分のパートが終わっても、他のメンバーの進捗が気になって声をかけてしまう。",
          "尊敬できる仲間がいると、なぜか睡眠時間を削ってでもやる気が出る不思議な体質。",
          "「あのとき一緒にやって良かった」と思える経験を、人生の宝として大切にしている。",
        ],
        motto:
          "仲間と磨き合うことを、一生の誇りにしよう。あなたの成長は、周りも輝かせる。",
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
        variant: "yoji-personality" as const,
        catchphrase: "この出会いは、二度と来ない。だから全力で。",
        // 「一期」は人の一生、「一会」はただ一度の出会い——一生に一度きりの機会。
        kanjiBreakdown:
          "「一期」は人の一生涯、「一会」はただ一度きりの出会い——人生においてこの瞬間の出会いは二度と繰り返されないという茶道に根ざした深い覚悟と誠実さを四字に込めて表す。",
        // 出典明確（段階的成立）。茶道の精神に根ざす言葉で、山上宗二が千利休の教えを記した『山上宗二記』に概念の源流がある。
        // 四字熟語として確立したのは幕末の大老・井伊直弼の『茶湯一会集』による。
        // ファクトチェック済み: 『山上宗二記』（概念の源流）、『茶湯一会集』井伊直弼（四字確立）
        // 注意: 「千利休が作った言葉」は誤り。千利休の教えが源流だが、四字熟語の確立は井伊直弼。
        origin:
          "千利休の教えを記した『山上宗二記』に概念の源流がある。四字熟語として確立したのは幕末の大老・井伊直弼の『茶湯一会集』による。茶道の「一期一会」の精神が広く日本社会に根付いた。",
        behaviors: [
          "旅先で話しかけてきた地元の人との会話を、数年後もなんとなく覚えている。",
          "久しぶりに会えた友人との時間が終わりに近づくと、「もう少し話したかったな」と思う。",
          "SNSで偶然見つけた昔のクラスメートに、勇気を出してメッセージを送ったことがある。",
          "誕生日や記念日をきちんと覚えていて、さりげなく一言送れる人でいたいと思っている。",
        ],
        motto:
          "一期一会——今この出会いを、全力で大切にしよう。その積み重ねが人生になる。",
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
        variant: "yoji-personality" as const,
        catchphrase: "どんな変化も、きみの舞台になる。",
        // kanjiBreakdown: 各漢字の意味を解説（漢字解説コンテンツとして機能する）
        kanjiBreakdown:
          "「臨」は直面する・のぞむ、「機」は機会・タイミング、「応」はこたえる、「変」は変化。変化の場面に直面して、そこに応じて動く——臨機応変は変わり続ける現実への最適な返し方を表す言葉。",
        // origin: 出典・由来の解説（ファクトチェック済み）
        // 多くのサイトが「南史が出典」と断定するが、原文（『南史』梁・蕭淵明伝）は「臨機制変」であり「臨機応変」ではない。
        // 正確には「南史に由来する表現が後世に変化して定着した」と伝えるべき。
        origin:
          "出典は『南史』梁の蕭淵明伝の「臨機制変」とされるが、原文に「臨機応変」という四字は存在しない。後世に「応変」の形へと変化して定着した表現で、古典に由来しつつも日本語の中で育った熟語。",
        behaviors: [
          "会議中に突然の変更が入っても、3秒で代案を出して場が動き出したことがある。",
          "旅行先でお目当ての店が休みだったとき、「じゃあこっちに行こう」と即座に切り替えられる。",
          "友達グループの雰囲気が微妙なとき、話題を変えるのがいつも自分だと気づく。",
          "計画が崩れるほど、アドリブでなんとかなった記憶の方が鮮明に残っている。",
        ],
        motto:
          "変化は障害ではなく、機転を発揮する舞台。どんな局面でも、自分らしい一手を見つけていこう。",
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
        variant: "yoji-personality" as const,
        catchphrase: "静かに澄んだ心が、本質を映し出す。",
        // kanjiBreakdown: 各漢字の意味を解説（漢字解説コンテンツとして機能する）
        kanjiBreakdown:
          "「明鏡」はくもりのない澄んだ鏡、「止水」は静止して波立たない水。邪念がなく澄みきった心を表す。乱れのない鏡と静まり返った水面——二つの比喩が重なり、完全な静寂と清澄さを言い表す。",
        // origin: 出典・由来の解説（ファクトチェック済み）
        // 『荘子』徳充符篇（止水）と天道篇（明鏡）の二つの比喩を後世に組み合わせた合成語。
        // 「明鏡止水」という4文字は荘子の原文にセットでは存在しない。
        origin:
          "『荘子』徳充符篇に「止水」、天道篇に「明鏡」の比喩がそれぞれ登場する。この二つを後世に組み合わせて「明鏡止水」という四字熟語が成立した。原文にセットで存在するわけではない合成語。",
        behaviors: [
          "周囲が動揺しているとき、自分だけがいつものトーンで話していて「なんで落ち着いてるの?」と言われる。",
          "怒りを感じても、すぐには言葉にせず一晩置いてから伝えるかどうかを考える。",
          "悩んでいる友人の話を最後まで黙って聞いてから、一言だけ返すスタイルが染み付いている。",
          "誰かがパニックになっている場面で、まず「今何ができる?」と整理してしまう。",
        ],
        motto:
          "明鏡止水——揺れない心が、本当に大切なものを映し出す。その静けさを、誇りにしよう。",
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
        variant: "yoji-personality" as const,
        catchphrase: "言葉がなくても、心は届いている。",
        // kanjiBreakdown: 各漢字の意味を解説（漢字解説コンテンツとして機能する）
        kanjiBreakdown:
          "「以」は〜をもって、「心」はこころ、「伝」は伝える、「心」はこころ——心をもって心に伝える。言葉を介さずに気持ちや考えが相手に通じ合う、深い共鳴の状態を四字で言い表す。",
        // origin: 出典・由来の解説（ファクトチェック済み）
        // 禅宗の経典『六祖壇経』行由品「法は以心伝心なり」が最有力の出典。
        // 釈迦が弟子・迦葉に言葉を使わず教えを伝えた「拈華微笑」の故事とも関連が深い。
        origin:
          "禅宗の経典『六祖壇経』行由品の「法は以心伝心なり」が最有力の出典とされる。釈迦が弟子の迦葉に言葉を使わず悟りを伝えた「拈華微笑」の故事とも、深く結びついた言葉である。",
        behaviors: [
          "友達がLINEの返信を遅らせているとき、「忙しいのかな、疲れてるのかな」と想像してから待つ。",
          "グループの中で誰かが浮いていると感じたら、自然にその人の隣に座っていることがある。",
          "「なんかあった?」と聞いたら「なんでわかったの?」と驚かれる経験が何度もある。",
          "相手が言葉に詰まっていると、続きを先回りして言いたくなる衝動を抑えるのが大変。",
        ],
        motto:
          "以心伝心——感じる力を大切に。あなたの共感が、誰かの心に静かな灯をともしている。",
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
        variant: "yoji-personality" as const,
        catchphrase: "迷う前に動く。それがあなたの流儀。",
        // kanjiBreakdown: 各漢字の意味を解説（漢字解説コンテンツとして機能する）
        kanjiBreakdown:
          "「勇」はいさましい、「往」はゆく・進む、「邁」はまっしぐらに進む、「進」はすすむ——勇ましくひたすら前に進む姿を四字で表す。止まることなく突き進む意志と行動力を凝縮した言葉。",
        // origin: 出典・由来の解説（ファクトチェック済み）
        // 「勇往」（勇ましく進む）と「邁進」（一心に突き進む）がそれぞれ独立した表現として存在し、
        // 組み合わされて一つの四字熟語になった。特定の古典に由来する故事成語ではない。
        origin:
          "「勇往」（勇ましく進む）と「邁進」（一心に突き進む）がそれぞれ独立した表現として存在し、組み合わさって一つの四字熟語になった。特定の古典に由来する故事成語ではなく、日本語で広まった合成語型の表現。",
        behaviors: [
          "「向いてないかも」と思っても、やってみてから判断するので実は経験値がすごい。",
          "友達が悩んでいるとき、背中を押す言葉を自然に言えて「ありがとう」と言われることが多い。",
          "やりたいことリストを作ると、気づいたら半分以上に実行済みのチェックが入っている。",
          "「それ難しいんじゃない?」と言われると、なぜかやる気が上がる体質。",
        ],
        motto:
          "勇往邁進——前に進み続ける姿が、周りの勇気に火をつける。その歩みを止めないでいよう。",
      },
    },
  ],
};

export default yojiPersonalityQuiz;
