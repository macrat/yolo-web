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
    seoTitle:
      "斜め上の相性診断｜心理テスト 無料 あなたと相性抜群の意外な存在を診断",
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
        href: "/play/contrarian-fortune",
      },
      {
        label: "達成困難アドバイス診断を受ける",
        href: "/play/impossible-advice",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。質問と結果はAIが創作しました。楽しみとしてお楽しみください。",
    faq: [
      {
        question: "なぜ相性の結果が人間ではなく物や自然現象なのですか？",
        answer:
          "この診断のコンセプトは「斜め上の相性診断」です。人間に当てはまることを物や自然現象に例えることで、あなたの性格をユニークな視点から描写しています。科学的な相性診断ではなく、意外な切り口からの自己発見を楽しんでもらうためのエンターテインメントです。",
      },
      {
        question: "相性の相手になる「意外な存在」は何種類ありますか？",
        answer:
          "自動販売機、古い掛け時計、街灯、公園のベンチ、風鈴、雨の日の午後、特定の形の雲、404 Not Foundの全8種類です。どれも人間以外の「意外な存在」です。",
      },
      {
        question: "もう一度やり直すと同じ結果になりますか？",
        answer:
          "同じ選択をすれば同じ結果になります。スコアに基づいて結果が決まる仕組みなので、回答を変えると結果も変わることがあります。",
      },
      {
        question: "結果はどんな根拠で決まっているのですか？",
        answer:
          "各選択肢に8種類の「意外な存在」へのポイントが割り振られており、合計ポイントが最も高い存在が相性の良い存在として判定されます。科学的な根拠はなく、エンターテインメントとしてお楽しみください。",
      },
      {
        question: "友達と比べたり、シェアしたりできますか？",
        answer:
          "結果ページからSNSへのシェアができます。友達と見せ合って、どんな「意外な存在」が出たか話し合ってみてください。",
      },
    ],
    // resultPageLabels は設定しない。
    // unexpected-compatibility は専用の UnexpectedCompatibilityContent コンポーネントで
    // レンダリングされるため、resultPageLabels を参照しない。
    // 見出しはコンポーネント内でハードコードする。
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
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "24時間、あなたの選択を静かに待っている",
        entityEssence:
          "自動販売機とは、選択の自由と即時の応答が詰まった箱だ。何も言わずそこにあり、押せば迷いなく応える。気まぐれも機嫌もない。ただ、求められたものを差し出し続ける。その潔さがなぜか愛おしい。",
        whyCompatible:
          "あなたが自動販売機と相性が良いのは、「ちゃんと応えてくれる」という確かさを人間関係に求めているから。期待を裏切らない存在のそばにいると、あなたの心は静かに落ち着く。",
        behaviors: [
          "グループLINEに誰も答えないと、気づいたら自分がまとめ役になっていた。",
          "「いつでも声かけていいよ」と言った手前、本当にいつでも来られる。でも、それが嫌ではない。",
          "自販機の前で「温かいか冷たいか」だけ決めてボタンを押す。余計なことは考えない。",
          "疲れた帰り道、光っている自販機を見るとなぜか少し元気になる。",
        ],
        lifeAdvice:
          "小さな「ちゃんと応えた」の積み重ねが、やがて信頼という光になる。",
      },
    },
    {
      id: "oldclock",
      title: "古い掛け時計",
      description:
        "あなたと最も相性が良い存在は「古い掛け時計」です。静かに、正確に、休まず動き続ける。あなたもまた、誠実さと継続を大切にする人。掛け時計が毎時ボーンと鳴るように、あなたの存在も周囲にとって「いつもそこにある安心感」です。デジタル時計にはない味わいがあなたにはあります。",
      color: "#92400e",
      icon: "\u{1F570}\u{FE0F}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "止まらず、飾らず、ただ刻み続ける",
        entityEssence:
          "古い掛け時計とは、誠実さを音で刻む存在だ。新しくはない。でも動き続けている。毎時ボーンと鳴るその声に、誰も特別な意味を見出さないのに、なぜか消えたら寂しい。静かな継続そのものが存在の理由になっている。",
        whyCompatible:
          "あなたが古い掛け時計と相性が良いのは、「続けること」を特別だと思わずに当たり前として生きているから。派手さより確かさを選ぶあなたの価値観は、この時計が刻む音とまったく同じリズムをしている。",
        behaviors: [
          "日記や手帳に今日あったことを記録する。「残す」という行為に、不思議な安心感がある。",
          "昔の写真や記録を見返したとき、「ちゃんと生きてきた」という感覚が静かに湧き上がる。",
          "信頼できる道具や習慣を長く大切に使い続けている。買い替えるより直したい派。",
          "約束の時間、締め切り、区切り目。それらをどうしても軽く扱えない自分がいる。",
        ],
        lifeAdvice:
          "続けているものに、たまでいいから名前をつけてあげて。それが誇りになる。",
      },
    },
    {
      id: "streetlight",
      title: "街灯",
      description:
        "あなたと最も相性が良い存在は「街灯」です。暗くなると自動的に灯り、誰かの帰り道をそっと照らす。主張しないけれど、いないと困る。あなたもそういう存在です。なお、街灯に集まる虫はあなたの魅力に引き寄せられた存在の暗喩です（そうでないかもしれません）。",
      color: "#ca8a04",
      icon: "\u{1F4A1}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "主張しないけれど、消えたら誰かが困る",
        entityEssence:
          "街灯とは、「いなければよかった」と思われることがない数少ない存在だ。暗くなれば灯り、誰も頼まないのに誰かの道を照らす。自分が照らされているかどうか気にしない人のために光る、静かな利他の象徴。",
        whyCompatible:
          "あなたが街灯と相性が良いのは、「誰かのために」が自然な動機になっているから。自分のためだけではなかなかエンジンがかからないあなたは、誰かが困っているときにこそ最もよく輝いている。",
        behaviors: [
          "飲み会の後、解散してからも「ちゃんと帰れたかな」と気になって一人で考えてしまう。",
          "困っている人を見ると、どうしても黙っていられない。自動的に体が動く。",
          "自分が退席したとたんに場が散漫になると、後から知ってちょっと複雑な気持ちになる。",
          "「目立ちたいわけじゃない」と思っているのに、いつの間にか自分がいる場所が明るくなっている。",
        ],
        lifeAdvice:
          "照らし続けることにも充電が必要だ。意図的に休む日を作っていい。",
      },
    },
    {
      id: "benchpark",
      title: "公園のベンチ",
      description:
        "あなたと最も相性が良い存在は「公園のベンチ」です。誰でも受け入れ、何時間座っても文句を言わず、去るときも引き止めない。あなたの包容力と適度な距離感は、まさにベンチ的美徳です。雨の日は少し寂しそうにしているところも似ています。",
      color: "#059669",
      icon: "\u{1FA91}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "来る者は拒まず、去る者は追わず",
        entityEssence:
          "公園のベンチとは、「誰のものでもない場所」として存在する稀有な物体だ。老人も子どもも恋人も、みな平等に迎える。去るときに何も言わず、来るときに何も問わない。その無条件の受容が、静かに人を支えている。",
        whyCompatible:
          "あなたが公園のベンチと相性が良いのは、「どちらの気持ちもわかる」という中立性を自然に持っているから。特定の誰かの味方になりきらず、ただそこにいることで場を支える力がある。",
        behaviors: [
          "両方の立場から話を聞いてしまい、気づいたら「それぞれに一理ある」と思っている。",
          "話しかけてきた人の話をじっくり聞いていたら、気づいたら1時間以上経っていた。",
          "人混みの中でも、なぜか知らない人から道を聞かれたり、話しかけられたりする確率が高い。",
          "去っていく人を引き止めない。またいつか来るかもと静かに思って、それで十分だと感じている。",
        ],
        lifeAdvice:
          "何も解決しなくていい。ただそこにいるだけで、あなたは誰かの居場所になっている。",
      },
    },
    {
      id: "windchime",
      title: "風鈴",
      description:
        "あなたと最も相性が良い存在は「風鈴」です。風が吹くと涼やかに鳴り、周囲に爽やかさを届ける。あなたもまた、場の空気を変える力を持っています。ただし風がないと沈黙する点も似ており、「自分から動くタイプではない」ことを風鈴は優しく教えてくれています。",
      color: "#7c3aed",
      icon: "\u{1F3D0}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "風が来るたびに、世界を変えてしまう",
        entityEssence:
          "風鈴とは、外から来る何かに応えることで初めて意味をなす存在だ。自ら動かない。しかし風が来れば、その場の空気を一瞬で塗り替える。受動的に見えて、実は場を支配している。繊細な応答の名手。",
        whyCompatible:
          "あなたが風鈴と相性が良いのは、感受性の高さが才能になっているから。微妙な空気の変化を誰より早く察知し、場を動かす。自分から仕掛けずとも、あなたがいるだけで空間の質が変わっている。",
        behaviors: [
          "誰かが最初の一声を上げると、「じゃあ自分も」と一気に動き出す。その初動の速さは本物。",
          "面白い話題を見つけると5秒後には誰かに送っている。「これ好きそう」と思った人へ。",
          "空気が合わない場所では本来の自分が出せない感覚があるが、合う場所では驚くほど自然体になれる。",
          "「あなたが来ると場が明るくなる」と言われるが、何か特別なことをしている自覚はない。",
        ],
        lifeAdvice:
          "次に「面白そう」と思ったことに、自分から一歩踏み出してみて。風を待たなくていい。",
      },
    },
    {
      id: "rainyday",
      title: "雨の日の午後",
      description:
        "あなたと最も相性が良い存在は「雨の日の午後」です。人間ではなく、時間帯です。外に出る理由がなくなり、室内で静かに過ごす口実が生まれる。あなたにとって雨は天気ではなく、自分を取り戻す許可証です。傘を持たずに出かけて雨に降られても、なぜかそれほど嫌ではないはずです。",
      color: "#1e40af",
      icon: "\u{1F327}\u{FE0F}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "外に出る理由を、優しく消してくれる",
        entityEssence:
          "雨の日の午後とは、社会が「急がなくていい」と言ってくれる数少ない時間帯だ。音が静かになり、光が柔らかくなり、世界がひとまわり小さくなる。それは怠惰ではなく、内側に向かうための正当な契機だ。",
        whyCompatible:
          "あなたが雨の日の午後と相性が良いのは、感情を深く沈めて処理するタイプだから。表面で反応せず、内側でじっくり味わう。そのためにときどき、世界との接触を減らす時間が必要なのだ。",
        behaviors: [
          "雨の音を聞きながらコーヒーを飲んでいたら、窓の外をぼーっと眺め続けて1時間経っていた。",
          "晴れていた予定が雨でなくなったとき、正直「ちょうどよかった」と思ってしまうことがある。",
          "気分が落ちているとき、誰かに話すより音楽か本か映画の方が先に手が伸びる。",
          "誰かの深い部分に触れる会話が好きで、天気の話より「本当はどう思ってる？」が気になる。",
        ],
        lifeAdvice:
          "次の雨の日に、何も予定を入れない午後を作ってみて。何もしないことがあなたの充電になる。",
      },
    },
    {
      id: "cloudspecific",
      title: "特定の形の雲",
      description:
        "あなたと最も相性が良い存在は「特定の形の雲」です。何の形に見えるかは日によって変わります。見上げるたびに違う姿で、でも空にいることだけは確か。あなたもまた、一つの枠に収まらない自由な存在です。雲の形に名前をつける趣味を始めると、毎日が少し楽しくなるかもしれません。",
      color: "#0891b2",
      icon: "\u{2601}\u{FE0F}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "見る人によって、まったく違う姿になる",
        entityEssence:
          "特定の形の雲とは、見る人の想像力によってその意味が決まる存在だ。客観的な正解はない。あなたには羊に見え、隣の人には象に見える。それでどちらも正しい。形を押しつけない自由が、ここにある。",
        whyCompatible:
          "あなたが特定の形の雲と相性が良いのは、「ひとつのカテゴリに収まりきらない」という感覚を自然に持っているから。自己紹介のたびに違う答えが出てきても、それは全部本当のあなただ。",
        behaviors: [
          "空を見上げて「あれ羊に見える」と思ったら、その雲が消えるまで目で追い続けてしまう。",
          "自己紹介で「どんな人ですか」と聞かれると毎回違う答えになる。嘘ではなく、全部本当。",
          "旅先でたまたま見つけた場所の方が、計画した観光地より印象に残ることが多い。",
          "変化していくことへの抵抗が薄い。昨日と今日で気持ちが変わっても、それは普通のことだと思う。",
        ],
        lifeAdvice:
          "今日、空を一分見上げて、形に名前をつけてみて。あなたの見え方は誰かの視野を広げる。",
      },
    },
    {
      id: "404page",
      title: "404 Not Found",
      description:
        "あなたと最も相性が良い存在は「存在しないWebページ」です。探していたものとは違うけれど、たどり着いてしまった場所。404ページに書かれた「お探しのページは見つかりませんでした」は、実は哲学的な問いです。あなたもまた、探しているものがまだ見つかっていないのかもしれません。でも探し続けること自体に価値があります。このページのように。",
      color: "#6b7280",
      icon: "\u{1F50D}",
      detailedContent: {
        variant: "unexpected-compatibility" as const,
        catchphrase: "見つからなかった場所に、意味が宿る",
        entityEssence:
          "404 Not Foundとは、「ここに何かあるはずだった」という痕跡だけが残る場所だ。目的地ではない。でも誰かが迷い込み、何かを発見する。存在しないことで、探すという行為の本質を問い返してくる。",
        whyCompatible:
          "あなたが404ページと相性が良いのは、「正解にたどり着く」より「なぜここに来たのか」が気になるタイプだから。期待が外れた場所でこそ面白いものを見つける嗅覚が、確かにあなたにはある。",
        behaviors: [
          "リンクを踏んだらエラーページだったのに、そのデザインが気になってじっくり見てしまった。",
          "何かを探していたはずなのに、途中で全然違うものを読んでいて最初の目的を忘れる。",
          "「なんでこうなってるんだろう」と思ったことを、誰かに頼まれてもいないのに一人で調べ続ける。",
          "目的地よりも、迷い込んだ場所の方が面白かった経験が確かにある。そしてそれを覚えている。",
        ],
        lifeAdvice:
          "今日迷い込んだ想定外の場所に留まってみて。見つかったものの方が面白いかもしれない。",
      },
    },
  ],
};

export default unexpectedCompatibilityQuiz;
