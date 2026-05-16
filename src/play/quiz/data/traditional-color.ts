import type { QuizDefinition } from "../types";

const traditionalColorQuiz: QuizDefinition = {
  meta: {
    slug: "traditional-color",
    title: "あなたを日本の伝統色に例えると?",
    // タイトルが16文字と長いためカード表示用の短縮タイトルを設定
    shortTitle: "日本の伝統色診断",
    description:
      "8つの質問に答えて、あなたの性格にぴったりの日本の伝統色を見つけましょう。藍色、朱色、若草色など、美しい和の色があなたを待っています。",
    shortDescription: "性格診断であなたにぴったりの伝統色を発見",
    type: "personality",
    category: "personality",
    questionCount: 8,
    icon: "\u{1F3A8}",
    accentColor: "#0d5661",
    keywords: [
      "伝統色",
      "日本の色",
      "性格診断",
      "色診断",
      "和色",
      "パーソナリティ",
    ],
    publishedAt: "2026-02-19T22:21:08+09:00",
    relatedLinks: [
      { label: "日本の伝統色一覧", href: "/dictionary/colors" },
      { label: "伝統色辞典", href: "/dictionary/colors" },
    ],
    seoTitle: "日本の伝統色 心理テスト｜無料の性格診断で和の色を発見",
    faq: [
      {
        question: "何問の質問に答えますか？",
        answer:
          "8問の質問に答えると結果が表示されます。所要時間は1〜2分程度です。",
      },
      {
        question: "結果は何種類ありますか？",
        answer:
          "藍色・朱色・若草色・藤色・山吹色・紺色・桜色・翡翠色の8種類です。それぞれ異なる性格タイプに対応しています。",
      },
      {
        question: "結果の伝統色と性格の関係はどのように決まっていますか？",
        answer:
          "各回答に色ごとのポイントが割り当てられており、合計ポイントが最も高い色が診断結果として表示されます。色と性格の対応はAIが創作したものです。",
      },
      {
        question: "もう一度やり直して違う色が出ますか？",
        answer:
          "回答を変えれば異なる色が出る場合があります。診断を楽しむ目的で複数回試してみてください。",
      },
      {
        question: "結果に表示される伝統色についてもっと詳しく知れますか？",
        answer:
          "結果画面のリンクからサイト内の伝統色辞典に移動できます。各色の歴史や使われ方について詳しく解説しています。",
      },
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
      color: "#0d5661",
      icon: "\u{1F30A}",
      recommendation: "藍色の詳しい解説を見る",
      recommendationLink: "/dictionary/colors/ai",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "静かに、深く、すべてを見通す藍の青",
        colorMeaning:
          "藍色は、江戸時代に染色技術が発達した日本を代表する色。「ジャパンブルー」とも呼ばれ、武士の衣や職人の仕事着に広く用いられた。防虫・防菌効果があるとされ、実用と美を兼ね備えた知性の色として古くから愛されてきた。",
        season: "夏",
        scenery: "夏の夕暮れ、藍色の海が静かに沖合いへと広がる",
        behaviors: [
          "気になった単語を検索したらWikipediaのリンクを3つたどって、気づいたら1時間経っていた。",
          "会話の中で「それって本当に合ってる？」と頭の中で検証しながら相槌を打っている。",
          "本棚やブックマークに、絶対読まないのに「いつか役に立つかも」と保存したものがどんどん増えている。",
          "議論で自分の意見を変えるとき、感情ではなく「その論点の方が筋が通っている」という理由で変える。",
        ],
        colorAdvice:
          "深く考えすぎなくていい。私があなたの底に沈んでいる静けさを守っているから、今日は誰かに話してみて。",
      },
    },
    {
      id: "shu",
      title: "朱色(しゅいろ)",
      description:
        "情熱的でエネルギッシュなあなたは、朱色のように力強い輝きを放っています。行動力があり、周りの人にも元気を与える太陽のような存在です。",
      color: "#ab3b3a",
      icon: "\u{1F525}",
      recommendation: "朱色の詳しい解説を見る",
      recommendationLink: "/dictionary/colors",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "燃え上がる炎、迷わず前へ進む赤",
        colorMeaning:
          "朱色は、神社の鳥居や漆器に用いられてきた日本の聖なる赤。魔除けや生命力の象徴として、古来より特別な意味を持つ色だ。平安時代には高位の装束にも使われ、力強い意志と情熱を体現する色として受け継がれてきた。",
        season: "秋",
        scenery: "秋の山肌を朱に染め上げる、燃えるような紅葉",
        behaviors: [
          "「いつかやりたいリスト」にあったことを、突然今日やろうと思い立って本当に実行する。",
          "面白そうなことを見つけた瞬間、詳細を確認する前に「行く！」「やる！」と返事してしまう。",
          "疲れているはずなのに、好きなことの話になった途端に目が覚めて饒舌になる。",
          "落ち込んでいる友人の話を聞いて、最終的に自分の方が元気になって「よし、一緒に頑張ろう！」と言ってしまう。",
        ],
        colorAdvice:
          "私はためらいを知らない。あなたが動き出したくなった瞬間、その炎は私が灯している。今日、一歩踏み出してみて。",
      },
    },
    {
      id: "wakakusa",
      title: "若草色(わかくさいろ)",
      description:
        "爽やかで生命力にあふれるあなたは、若草色のようにフレッシュな魅力があります。前向きで成長し続ける姿勢が、周りの人に希望を与えます。",
      color: "#C3D825",
      icon: "\u{1F331}",
      recommendation: "日本の伝統色を探索する",
      recommendationLink: "/dictionary/colors",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "芽吹きの季節、伸び続ける若い緑",
        colorMeaning:
          "若草色は、春に芽吹いた草の柔らかな黄緑色。平安時代の重ね着「かさね」の配色にも用いられ、生命の萌芽や新しい始まりを表す色として愛されてきた。清々しい若さと無限の成長可能性を宿す、日本の春を象徴する色だ。",
        season: "春",
        scenery: "春の朝、朝露に輝く野原一面の若草が風に揺れる",
        behaviors: [
          "新しいことを始めるとき、まず道具から揃えたくなる。ノートや文房具を買う段階が一番テンションが高い。",
          "苦手な人や苦手な状況でも、「この人の良いところを探してみよう」と気づいたら考えている。",
          "朝、天気がいいと「今日はいい日になりそう」と根拠なく確信して、その気分のまま一日を過ごす。",
          "「こうすればもっとよくなるかも」と改善アイデアが浮かんで、誰に頼まれたわけでもないのにやってしまう。",
        ],
        colorAdvice:
          "私は芽吹きの色。あなたが「面白そう」と感じた瞬間、私はもう動き始めている。今週、一歩だけ近づいてみて。",
      },
    },
    {
      id: "fuji",
      title: "藤色(ふじいろ)",
      description:
        "繊細で優雅なあなたは、藤色のように美しく上品な雰囲気を持っています。感受性が豊かで、芸術的なセンスに恵まれた人です。",
      color: "#8b81c3",
      icon: "\u{1F33A}",
      recommendation: "藤色の詳しい解説を見る",
      recommendationLink: "/dictionary/colors/fuji",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "揺れる藤の花、繊細に世界を映す紫",
        colorMeaning:
          "藤色は、春に咲く藤の花から生まれた淡い青紫色。平安貴族が愛した色で、源氏物語にも藤壺という人物が登場するほど日本文化に根付いている。高貴さと優雅さを象徴しながら、どこか儚い美しさを持つ色だ。",
        season: "春",
        scenery: "風に揺れる藤棚の下、淡い花房が垂れる回廊",
        behaviors: [
          "映画を見て「すごくよかった」と思っても、どこがよかったか言葉にできなくてもどかしくなる。",
          "誰かの何気ない一言が心に刺さって、家に帰ってからもじわじわと考え続けていることがある。",
          "お気に入りの音楽を「この人にも聴かせたい」と思うが、なかなか勧められずに一人で大切にしている。",
          "旅先で見た景色や光の色合いが、数年後もくっきりと頭の中に残っている。",
        ],
        colorAdvice:
          "私は言葉にならない感情の色。今感じていることを、短くていいから書き出してみて。それが私の一番好きな姿。",
      },
    },
    {
      id: "yamabuki",
      title: "山吹色(やまぶきいろ)",
      description:
        "明るく社交的なあなたは、山吹色のように温かい輝きで周りを照らします。コミュニケーション上手で、人を笑顔にする天性の才能があります。",
      color: "#ffb11b",
      icon: "\u2728",
      recommendation: "山吹色の詳しい解説を見る",
      recommendationLink: "/dictionary/colors/yamabuki",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "太陽のような明るさで場を照らす黄",
        colorMeaning:
          "山吹色は、ヤマブキの花の鮮やかな黄橙色。小判の色に近いことから財や豊かさの象徴となり、江戸時代には「山吹色のお菓子」が小判を指す洒落言葉として生まれるほど、日本人の暮らしに深く根付いてきた色だ。",
        season: "秋",
        scenery: "銀杏並木が黄金色に輝く、青空の下の秋の午後",
        behaviors: [
          "久しぶりに会った人の近況を聞いているうちに、なぜか自分が相談に乗る側になっていた。",
          "グループLINEに誰も返信しないとき、とりあえず自分が一番に何か送って場を動かす。",
          "飲み会の席替えを自然にコントロールして、話が弾みそうな組み合わせにさりげなく誘導している。",
          "その場の空気が重いと感じた瞬間、「ちょっと話変わるけど」と言わずに話題を変えている。",
        ],
        colorAdvice:
          "私は黄金の輝き。久しぶりに連絡を取っていない誰かへ、今週ひと言メッセージを送ってみて。私が背中を押す。",
      },
    },
    {
      id: "kon",
      title: "紺色(こんいろ)",
      description:
        "落ち着きのあるあなたは、紺色のように深い信頼感を与えます。責任感が強く、周りの人から頼られるしっかり者です。",
      color: "#0f2540",
      icon: "\u{1F319}",
      recommendation: "紺色の詳しい解説を見る",
      recommendationLink: "/dictionary/colors/kon",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "深い夜の静けさ、揺るぎない信頼の青",
        colorMeaning:
          "紺色は、藍染めを深く重ねて生まれる濃い青色。「褐（かち）」とも呼ばれ「勝ち」に通じる縁起から武士に好まれた。また藍染の殺菌・止血効果から実戦でも重宝され、江戸の職人や庶民にも広く愛された堅実な色だ。",
        season: "冬",
        scenery: "冬の深夜、満天の星が瞬く静寂の山頂に立つ",
        behaviors: [
          "頼まれた仕事を期限の前日に終わらせて、「念のため確認してから出そう」と思って結局当日に出す。",
          "誰かがミスしているのに気づいても、本人のプライドを考えてさりげなく補う。指摘より行動で解決する。",
          "会議の前に「こんな展開になるかも」と複数のシナリオを頭の中で準備してから臨んでいる。",
          "「自分がやらなきゃ」という気持ちで引き受けたものが、気づくと3つ同時に動いていた、ということがある。",
        ],
        colorAdvice:
          "私は「勝ち」を宿す色。今抱えていることをひとつだけ誰かに渡してみて。それが私の知っている本当の強さ。",
      },
    },
    {
      id: "sakura",
      title: "桜色(さくらいろ)",
      description:
        "温かく包容力のあるあなたは、桜色のように優しい安らぎを与えます。思いやりがあり、誰からも愛される人柄の持ち主です。",
      color: "#fedfe1",
      icon: "\u{1F338}",
      recommendation: "桜色の詳しい解説を見る",
      recommendationLink: "/dictionary/colors/sakura",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "ふわりと包む、優しさの極み桜色",
        colorMeaning:
          "桜色は、満開の桜の花びらのような淡い紅色。日本人にとって桜は特別な花であり、その色も古来より愛されてきた。平安時代の装束にも用いられ、儚さの中に宿る温かみと包容力を象徴する、日本の心を映す色だ。",
        season: "春",
        scenery: "春風に舞う花びらが、川面をそっと流れていく",
        behaviors: [
          "友人が「大丈夫」と言っているのに、なぜか大丈夫じゃないと分かって、さりげなく連絡を続ける。",
          "グループ内で誰かが浮いていると感じると、自然にその人に話しかけている自分がいる。",
          "プレゼントを選ぶとき、相手が以前さらっと話していたことを覚えていて、そこから選ぶ。",
          "自分が傷ついたとき、相手のことを考えて「言わなくていいか」と飲み込んでしまうことがある。",
        ],
        colorAdvice:
          "私はあなたを包む桜色。「してほしいこと」をひとつだけ素直に伝えてみて。私もあなたの笑顔が見たいから。",
      },
    },
    {
      id: "hisui",
      title: "翡翠色(ひすいいろ)",
      description:
        "独創的で自由な精神の持ち主であるあなたは、翡翠色のように神秘的な魅力があります。型にはまらない発想力で、新しい道を切り拓く開拓者です。",
      color: "#38B48B",
      icon: "\u{1F48E}",
      recommendation: "日本の伝統色を探索する",
      recommendationLink: "/dictionary/colors",
      detailedContent: {
        variant: "traditional-color",
        catchphrase: "神秘の翡翠、誰も歩かない道を切り拓く",
        colorMeaning:
          "翡翠色は、カワセミの羽や宝玉・翡翠の深みある緑青色。縄文時代から日本人が翡翠を装飾品として愛してきた歴史があり、神秘・霊力・再生の象徴とされてきた。その稀少さと独特の輝きが、唯一無二の個性を宿す色として伝わっている。",
        season: "夏",
        scenery: "夏の深い渓谷、緑の岩肌を縫うように清流が流れる",
        behaviors: [
          "みんなが使っているアプリや流行りのやり方を試してみて、「自分には合わない」と結論を出してオリジナルのやり方に戻る。",
          "会議やディスカッションで「そもそもこの前提って正しいの？」という質問をして場が一瞬静まる。",
          "「なんとなく面白そう」だけで始めたことが、気づいたら誰より詳しくなっていた。",
          "旅行先で観光地より路地裏や地元の商店街の方が気になって、気づいたらそっちに時間を使っている。",
        ],
        colorAdvice:
          "私は誰にも真似できない輝き。頭の中にある「変かも」なアイデアを今日だけ試してみて。私もそれを待っている。",
      },
    },
  ],
};

export default traditionalColorQuiz;
