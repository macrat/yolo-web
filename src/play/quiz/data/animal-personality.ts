import type { QuizDefinition, CompatibilityEntry } from "../types";
export type { CompatibilityEntry };

/**
 * Animal Personality Quiz (日本にしかいない動物で性格診断)
 *
 * 4-axis personality model based on Japanese endemic animals:
 *   S (Social):  Group (G) vs Solo (S) -- sociability
 *   A (Action):  Active (A) vs Cautious (C) -- decision speed / risk tolerance
 *   E (Energy):  High (H) vs Low (L) -- energy direction
 *   T (Think):   Intuitive (I) vs Analytical (N) -- perception style
 *
 * 12 result types (from 16 possible axis combinations):
 *   nihon-zaru          G-A-H-N  primary in: Q1a, Q5a, Q9a        (3)
 *   hondo-tanuki        G-C-L-I  primary in: Q2a, Q7a, Q10a       (3)
 *   nihon-kitsune       S-A-H-I  primary in: Q1b, Q4b, Q6b, Q9b  (4)
 *   iriomote-yamaneko   S-A-H-N  primary in: Q3b, Q6a, Q8b        (3)
 *   amami-kuro-usagi    G-C-L-N  primary in: Q2d, Q5d, Q8d        (3)
 *   yamane              S-A-L-I  primary in: Q3c, Q4a, Q7c, Q10c  (4)
 *   nihon-momonga       G-C-H-I  primary in: Q1c, Q7b, Q9c        (3)
 *   nihon-kamoshika     S-C-L-N  primary in: Q2b, Q5b, Q8a, Q10d  (4)
 *   hondo-ten           S-A-L-N  primary in: Q3a, Q6c, Q10b       (3)
 *   musasabi            S-C-H-N  primary in: Q4d, Q8c, Q9d        (3)
 *   nihon-risu          S-C-H-I  primary in: Q3d, Q4c, Q6d, Q7d  (4)
 *   ezo-shika           G-A-L-I  primary in: Q1d, Q2c, Q5c        (3)
 *
 * Primary distribution: 8 types x 3 + 4 types x 4 = 40 (10Q x 4C)
 * Secondary distribution: each type 3-4 slots
 *
 * S-axis note: G5:S7 ratio reflects the ecological fact that many
 * Japanese endemic mammals are solitary. All S-axis assignments match
 * each animal's actual social behavior.
 *
 * Unused 4 axis patterns: G-A-H-I, G-A-L-N, G-C-H-N, S-C-L-I
 */
const animalPersonalityQuiz: QuizDefinition = {
  meta: {
    slug: "animal-personality",
    title: "日本にしかいない動物で性格診断",
    description:
      "日本にしかいない動物であなたの性格を診断! イリオモテヤマネコ、アマミノクロウサギ、ニホンモモンガなど、日本にしかいない動物12タイプの中から、あなたにぴったりの動物を見つけます。全10問の質問に答えるだけ。友達との相性診断もできます!",
    shortDescription: "日本にしかいない動物12タイプであなたの性格を診断!",
    type: "personality",
    category: "personality",
    questionCount: 10,
    icon: "\u{1F43E}",
    accentColor: "#16a34a",
    keywords: [
      "動物診断",
      "性格診断",
      "日本の動物",
      "動物性格",
      "相性診断",
      "日本固有種",
      "日本にしかいない動物",
    ],
    publishedAt: "2026-03-09T15:00:00+09:00",
    relatedLinks: [
      {
        label: "音楽性格診断を受ける",
        href: "/quiz/music-personality",
      },
      {
        label: "守護キャラ診断を受ける",
        href: "/quiz/character-fortune",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。動物タイプと診断結果はAIが創作したエンターテインメントです。動物の分類上の正確性を保証するものではありません。",
  },
  questions: [
    {
      id: "q1",
      text: "休日の朝、特に予定がない。あなたならどうする?",
      choices: [
        {
          id: "q1-a",
          text: "友達に連絡して、今日どこか行こうと誘う",
          points: { "nihon-zaru": 2, "ezo-shika": 1 },
        },
        {
          id: "q1-b",
          text: "一人でふらっと気になっていた場所へ出かける",
          points: { "nihon-kitsune": 2, "iriomote-yamaneko": 1 },
        },
        {
          id: "q1-c",
          text: "家でのんびりしつつ、SNSで友達の動向をチェック",
          points: { "nihon-momonga": 2, "hondo-tanuki": 1 },
        },
        {
          id: "q1-d",
          text: "気の向くままに散歩して、面白いものを探す",
          points: { "ezo-shika": 2, yamane: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "急に予定が変わった! あなたの最初のリアクションは?",
      choices: [
        {
          id: "q2-a",
          text: "「じゃあ代わりに何する?」とすぐ別の楽しみを考える",
          points: { "hondo-tanuki": 2, "nihon-momonga": 1 },
        },
        {
          id: "q2-b",
          text: "静かに状況を整理して、最善の行動を考える",
          points: { "nihon-kamoshika": 2, musasabi: 1 },
        },
        {
          id: "q2-c",
          text: "むしろチャンス! 予定外の展開にワクワクする",
          points: { "ezo-shika": 2, "nihon-kitsune": 1 },
        },
        {
          id: "q2-d",
          text: "念のため情報を集めてから慎重に動く",
          points: { "amami-kuro-usagi": 2, "nihon-kamoshika": 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "知らない道と慣れた道、どちらを選ぶ?",
      choices: [
        {
          id: "q3-a",
          text: "知らない道を一人で探検するのが好き",
          points: { "hondo-ten": 2, "iriomote-yamaneko": 1 },
        },
        {
          id: "q3-b",
          text: "知らない道でも、まず下調べしてから挑む",
          points: { "iriomote-yamaneko": 2, "hondo-ten": 1 },
        },
        {
          id: "q3-c",
          text: "慣れた道だけど毎回新しい発見がある",
          points: { yamane: 2, "hondo-tanuki": 1 },
        },
        {
          id: "q3-d",
          text: "慣れた道が安心。でも周りはよく観察している",
          points: { "nihon-risu": 2, "amami-kuro-usagi": 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "あなたの1日のエネルギー配分は?",
      choices: [
        {
          id: "q4-a",
          text: "少ないエネルギーを効率よく使い、大事な場面に集中する",
          points: { yamane: 2, "hondo-ten": 1 },
        },
        {
          id: "q4-b",
          text: "朝からフルパワー。動き回るのが好き",
          points: { "nihon-kitsune": 2, "nihon-zaru": 1 },
        },
        {
          id: "q4-c",
          text: "基本省エネだけど、好きなことには全力を出す",
          points: { "nihon-risu": 2, "nihon-momonga": 1 },
        },
        {
          id: "q4-d",
          text: "じっくり考えてから、計画的にエネルギーを使う",
          points: { musasabi: 2, "nihon-kamoshika": 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "買い物をするとき、決め手になるのは?",
      choices: [
        {
          id: "q5-a",
          text: "「面白そう!」というひらめきで即決する",
          points: { "nihon-zaru": 2, "nihon-kitsune": 1 },
        },
        {
          id: "q5-b",
          text: "口コミやレビューを徹底的に調べてから決める",
          points: { "nihon-kamoshika": 2, "amami-kuro-usagi": 1 },
        },
        {
          id: "q5-c",
          text: "友達のおすすめがあれば迷わず買う",
          points: { "ezo-shika": 2, "hondo-tanuki": 1 },
        },
        {
          id: "q5-d",
          text: "長期的に見てコスパが良いかをじっくり検討する",
          points: { "amami-kuro-usagi": 2, musasabi: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "困ったことが起きた! あなたがまずやることは?",
      choices: [
        {
          id: "q6-a",
          text: "すぐに自分で動いて解決策を試す",
          points: { "iriomote-yamaneko": 2, "nihon-zaru": 1 },
        },
        {
          id: "q6-b",
          text: "直感を信じて、思いついた方法で乗り切る",
          points: { "nihon-kitsune": 2, yamane: 1 },
        },
        {
          id: "q6-c",
          text: "過去の経験を振り返って、冷静に分析する",
          points: { "hondo-ten": 2, "nihon-kamoshika": 1 },
        },
        {
          id: "q6-d",
          text: "安全な方法を探して、リスクを最小限にする",
          points: { "nihon-risu": 2, "amami-kuro-usagi": 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "友達との連絡、あなたのスタイルは?",
      choices: [
        {
          id: "q7-a",
          text: "グループLINEで常にみんなとつながっていたい",
          points: { "hondo-tanuki": 2, "nihon-zaru": 1 },
        },
        {
          id: "q7-b",
          text: "仲のいい数人とこまめに連絡を取り合う",
          points: { "nihon-momonga": 2, "nihon-risu": 1 },
        },
        {
          id: "q7-c",
          text: "必要な時だけ連絡。普段は自分の世界を楽しむ",
          points: { yamane: 2, "nihon-kitsune": 1 },
        },
        {
          id: "q7-d",
          text: "返事は遅めだけど、会った時は全力で楽しむ",
          points: { "nihon-risu": 2, musasabi: 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "計画を立てるのと、流れに身を任せるの、どっちが好き?",
      choices: [
        {
          id: "q8-a",
          text: "計画はしっかり立てる。でも柔軟に修正もする",
          points: { "nihon-kamoshika": 2, "nihon-risu": 1 },
        },
        {
          id: "q8-b",
          text: "大まかな方向だけ決めて、あとは行動しながら考える",
          points: { "iriomote-yamaneko": 2, "nihon-zaru": 1 },
        },
        {
          id: "q8-c",
          text: "しっかり計画を立てて、その通りに実行する",
          points: { musasabi: 2, "nihon-risu": 1 },
        },
        {
          id: "q8-d",
          text: "流れに任せるのが好き。結果的にうまくいく",
          points: { "amami-kuro-usagi": 2, "ezo-shika": 1 },
        },
      ],
    },
    {
      id: "q9",
      text: "新しい環境（転職・引っ越しなど）に飛び込むとしたら?",
      choices: [
        {
          id: "q9-a",
          text: "仲間がいれば怖くない! 一緒に飛び込む",
          points: { "nihon-zaru": 2, "hondo-tanuki": 1 },
        },
        {
          id: "q9-b",
          text: "一人でも平気。新しい場所でこそ力を発揮する",
          points: { "nihon-kitsune": 2, yamane: 1 },
        },
        {
          id: "q9-c",
          text: "少し不安だけど、信頼できる人と一緒なら大丈夫",
          points: { "nihon-momonga": 2, "ezo-shika": 1 },
        },
        {
          id: "q9-d",
          text: "まず安全な拠点を確保してから、徐々に範囲を広げる",
          points: { musasabi: 2, "amami-kuro-usagi": 1 },
        },
      ],
    },
    {
      id: "q10",
      text: "自分の気持ちや考えを伝えるとき、どうする?",
      choices: [
        {
          id: "q10-a",
          text: "表情やリアクションで自然に伝わる。言葉はあまり使わない",
          points: { "hondo-tanuki": 2, "nihon-momonga": 1 },
        },
        {
          id: "q10-b",
          text: "必要な時にはズバッと言う。普段はあまり語らない",
          points: { "hondo-ten": 2, "iriomote-yamaneko": 1 },
        },
        {
          id: "q10-c",
          text: "行動で示す。言葉より結果で伝えたい",
          points: { yamane: 2, "iriomote-yamaneko": 1 },
        },
        {
          id: "q10-d",
          text: "じっくり考えてから、論理的に説明する",
          points: { "nihon-kamoshika": 2, "hondo-ten": 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "nihon-zaru",
      title: "ニホンザル -- 温泉を発明した革命児",
      description:
        "あなたはニホンザルタイプ。群れの中でこそ輝く社交的なリーダー気質の持ち主です。ニホンザルが温泉に入るようになったのは、実は1960年代に地獄谷で餌付けされていた子猿が偶然温泉に入ったのがきっかけ。それを見た仲間の猿たちが次々と真似をして、やがて群れ全体の文化になりました。「猿真似」という言葉がありますが、実際のニホンザルの模倣行動は高度な社会的学習能力の表れなのです。あなたにもそんな「偶然の発見を文化に変える力」がありませんか? 新しいカフェを見つけたら、いつの間にか友達全員の行きつけにしてしまうような。アドバイス: たまには温泉に一人で入ってみてください。猿も最初は一匹で飛び込んだのですから。",
      color: "#dc2626",
      icon: "\u{1F435}",
    },
    {
      id: "hondo-tanuki",
      title: "ホンドタヌキ -- 化かすどころか化かされる愛されキャラ",
      description:
        "あなたはホンドタヌキタイプ。温厚で人懐っこく、周りの空気を和ませる天性のムードメーカーです。タヌキといえば「人を化かす」イメージですが、実際のホンドタヌキはおっとりした性格で、むしろ車のライトに驚いて固まってしまうほど。その防御手段は「死んだふり」という、ある意味究極の受け身戦法です。ちなみにタヌキは実は犬の仲間で、イヌ科では珍しく冬に活動量を大幅に落とす「冬ごもり」をすることもあります。あなたも対立を避けてうまく立ち回る才能があるはず。でもそれは弱さではなく、「争わずに生き延びる」という哺乳類最古の知恵です。アドバイス: たまには化かす側に回ってみてください。サプライズパーティーの企画とか。",
      color: "#92400e",
      icon: "\u{1F43E}",
    },
    {
      id: "nihon-kitsune",
      title: "ニホンキツネ -- お稲荷さんの看板を背負う孤高のリアリスト",
      description:
        "あなたはニホンキツネタイプ。単独行動を好み、直感と素早い判断力で道を切り拓くリアリストです。キツネは全国に約3万社ある稲荷神社で神の使いとして祀られていますが、実際のニホンキツネは神秘的というより極めて実利的な動物。非常に優れた聴覚でネズミの足音を雪の下から聞き分け、計算されたジャンプで仕留めます。雪に頭から突っ込む「モグラダイブ」と呼ばれる狩りの姿は、神の使いとは思えないほどコミカルですが、その成功率は驚くほど高いのです。あなたも「なんとなく」で動いているように見えて、実は的確に状況を読んでいるタイプでは? アドバイス: 神の使いのイメージに甘えず、たまには自分の実力をちゃんとアピールしましょう。",
      color: "#ea580c",
      icon: "\u{1F98A}",
    },
    {
      id: "iriomote-yamaneko",
      title: "イリオモテヤマネコ -- 西表島だけで生き残った究極のサバイバー",
      description:
        "あなたはイリオモテヤマネコタイプ。独自の道を行く冷静な分析力と、いざという時の行動力を兼ね備えたサバイバーです。イリオモテヤマネコは数十万年にわたって西表島に生息してきたと考えられており、推定生息数はわずか100頭前後。狭い島の中で、昆虫から鳥、カエル、さらにはヘビやコウモリまで何でも食べる驚異的な適応力で生き延びてきました。あなたも限られたリソースの中で最大限の成果を出すのが得意では? 周囲が「無理だ」と思う状況でも、持ち前の分析力で活路を見出すことができるはずです。アドバイス: サバイバル能力が高すぎて「助けて」と言えないことはありませんか? 100頭でも仲間はいるのです。この動物は国の特別天然記念物であり、あなたと同じくらい貴重な存在です。",
      color: "#854d0e",
      icon: "\u{1F408}",
    },
    {
      id: "amami-kuro-usagi",
      title: "アマミノクロウサギ -- 走れないウサギの逆転戦略",
      description:
        "あなたはアマミノクロウサギタイプ。慎重派で分析力に優れ、仲間と協力しながら着実に前進する堅実家です。アマミノクロウサギは後ろ足が短いため、一般的なウサギのように素早く走ることが苦手。その代わり、巣穴を掘る能力に特化し、奄美大島と徳之島の森の中で地道に生き延びてきました。「原始的なウサギ」とも呼ばれ、他のウサギが進化の過程で失った特徴を今も持ち続ける、生きた化石のような存在です。あなたも「苦手を克服する」より「得意を伸ばす」戦略で成果を出すタイプでは? アドバイス: 走れなくても、穴を掘れれば生き残れます。自分だけの「巣穴」を大切にしてください。この動物は国の特別天然記念物です。あなたと同じくらい、かけがえのない存在です。",
      color: "#1c1917",
      icon: "\u{1F407}",
    },
    {
      id: "yamane",
      title: "ヤマネ -- 手のひらサイズの森の忍者",
      description:
        "あなたはヤマネタイプ。普段は穏やかで省エネですが、必要な時には驚くほどの集中力を発揮する実力者です。ヤマネは体長わずか8cmほどの、日本に生息する最小級の哺乳類です。冬眠期間は約半年にもなり、その間体温は外気温に合わせて大幅に低下します。まるでスイッチを切ったように心拍数も呼吸も代謝もすべてを最小限に抑えるのです。その愛らしいまん丸い体と大きな目から「森の妖精」と呼ばれることもあります。しかし目覚めている間は、木の枝を忍者のように素早く走り回り、昆虫や果実を効率よく集めます。あなたも「やる時はやる」タイプでは? アドバイス: 冬眠が長すぎると春を見逃します。目覚まし時計を2個セットしてください。",
      color: "#65a30d",
      icon: "\u{1F42D}",
    },
    {
      id: "nihon-momonga",
      title: "ニホンモモンガ -- 空飛ぶハンカチの大冒険家",
      description:
        "あなたはニホンモモンガタイプ。慎重だけど冒険心があり、仲間との絆を大切にする愛されキャラです。ニホンモモンガは体重わずか150〜200gで、前後の足の間にある飛膜を広げて最大30mほどを滑空します。その大きなまん丸の目は夜の森でわずかな光をとらえるためのもので、ぬいぐるみのような可愛さの裏に高度な適応があるのです。普段は夜行性でひっそりと暮らしていますが、冬場には複数の個体が一つの巣穴に集まって体温を分け合う習性があります。あなたも普段はマイペースに見えて、大切な人のそばにはちゃんといるタイプでは? アドバイス: 飛ぶ前に着地点を確認する慎重さは美徳です。でも時には、風に乗ってみるのも悪くない。",
      color: "#f59e0b",
      icon: "\u{1F43F}\u{FE0F}",
    },
    {
      id: "nihon-kamoshika",
      title: "ニホンカモシカ -- 山の哲学者は首をかしげる",
      description:
        "あなたはニホンカモシカタイプ。物静かで思慮深く、独自の世界観を持つ哲学者気質です。ニホンカモシカは「カモシカ」と名前がついていますが、実はウシ科の動物。険しい山岳地帯に単独で暮らし、人間と出会うと逃げずにじっとこちらを見つめることで知られています。あの「首をかしげる」仕草は威嚇ではなく、相手を観察しているのです。決まった縄張りを持ち、同じ場所を何年もかけて深く知り尽くすその生き方は、まさに「狭く深く」の体現者です。あなたも人の言葉の裏にある本当の意味を読み取ろうとするタイプでは? アドバイス: 考えすぎて動けなくなる前に、カモシカのように一歩、崖を登ってみましょう。この動物は国の特別天然記念物です。",
      color: "#374151",
      icon: "\u{1F410}",
    },
    {
      id: "hondo-ten",
      title: "ホンドテン -- 季節ごとに着替える孤高の変身ハンター",
      description:
        "あなたはホンドテンタイプ。単独行動を好む分析家で、状況に応じて柔軟に戦略を変える適応力の持ち主です。ホンドテンは夏は暗褐色、冬は美しい黄金色へと毛色が変わる、日本の森の変身名人。見た目はとても愛らしいですが、実は優れたハンターで、自分より大きなウサギも仕留めることがあります。木登りも泳ぎも得意で、地上から樹上、さらには水辺に至るまで立体的に活動する行動範囲の広さも大きな特徴です。繁殖期以外は基本的に単独で行動し、広い縄張りを持ちます。あなたも一人の時間を大切にしつつ、やるべき時には確実に結果を出す人では? アドバイス: 季節ごとに衣替えするテンを見習って、たまにはイメージチェンジを楽しんでみては。",
      color: "#ca8a04",
      icon: "\u{1F43E}",
    },
    {
      id: "musasabi",
      title: "ムササビ -- 座布団サイズで120m飛ぶ孤高の夢想家",
      description:
        "あなたはムササビタイプ。慎重に準備して大きな挑戦をする、計画派の冒険家です。ムササビは体を広げると座布団ほどの大きさになり、なんと最大120mもの距離を滑空します。日本に生息する哺乳類の中で最大の滑空距離を誇る、夜空のパイロットです。しかしモモンガとは異なり、基本的に単独で行動する動物です。滑空前には風向きや着地点を入念に確認する慎重さも持ち合わせています。この「石橋を叩いてから大胆に飛ぶ」スタイルこそ、あなたの本質ではないでしょうか。あなたも大きな決断の前にはしっかり情報を集めるタイプでは? アドバイス: 120m飛べるのに、毎日同じ木にしか降りないのはもったいない。新しい木を目指してみましょう。",
      color: "#7c3aed",
      icon: "\u{1F987}",
    },
    {
      id: "nihon-risu",
      title: "ニホンリス -- 隠し場所を忘れる慎重な貯蓄家",
      description:
        "あなたはニホンリスタイプ。慎重で観察力があり、将来に備えてコツコツ準備する堅実派です。ニホンリスは秋にクルミや木の実を地面に埋めて冬に備える「貯食」の達人。特にオニグルミを好み、非常に硬い殻を前歯で器用に割って中身を取り出して食べるその姿はまさに職人そのもの。しかし研究によると、埋めた場所の一部を忘れてしまうことがあり、それが結果的に森の植生を広げる役割を果たしています。普段は単独で行動し、縄張り意識もしっかりしています。あなたも計画的に見えて、思わぬところで周りに貢献しているタイプでは? アドバイス: 忘れた貯金が森を育てるように、あなたの「うっかり」にも価値があります。完璧を求めすぎないで。",
      color: "#b45309",
      icon: "\u{1F43F}\u{FE0F}",
    },
    {
      id: "ezo-shika",
      title: "エゾシカ -- 北の大地を群れで駆ける繊細戦士",
      description:
        "あなたはエゾシカタイプ。仲間と共に行動し、直感と行動力を兼ね備えた繊細な戦士です。エゾシカは北海道に生息する大型のシカで、オスとメスがそれぞれ別の群れを形成して集団で生活します。優雅に見える外見とは裏腹に、オスは秋の繁殖期になると巨大な角をぶつけ合う激しい戦いを繰り広げます。その立派な角は毎年春に落ちて、夏の間にまた新たに生え変わるという驚きの再生力を持っています。失敗しても何度でもやり直せるしなやかさ、それがあなたの最大の武器です。あなたも普段は穏やかだけど、大切なもののためには全力で戦えるタイプでは? アドバイス: 角は毎年生え変わります。過去の武器に執着せず、新しい自分の武器を育てましょう。",
      color: "#059669",
      icon: "\u{1F98C}",
    },
  ],
};

// ---- Compatibility data ----

/**
 * Compatibility matrix for all 78 type combinations (upper triangle + diagonal).
 * Keys are sorted pairs joined with "--" (e.g. "amami-kuro-usagi--ezo-shika").
 */
export const compatibilityMatrix: Record<string, CompatibilityEntry> = {
  // ========== Same type combinations (12) ==========
  "nihon-zaru--nihon-zaru": {
    label: "温泉の場所取り合戦",
    description:
      "リーダー気質のニホンザル同士。群れでは序列が全てなので、二人の間にも見えない序列争いが始まる。でも最終的には同じ温泉に浸かって和解する。一緒にいるとアイデアが次々湧くが、実行する前に次のアイデアに移りがち。",
  },
  "hondo-tanuki--hondo-tanuki": {
    label: "最強のほのぼのコンビ",
    description:
      "二匹のタヌキが出会うと、互いに死んだふりをして誰も動かない、という冗談のような状態が生まれる。争いゼロ、ストレスゼロ。ただし重要な決断は永遠に先送りになる。のんびりペースが心地よすぎて、約束の時間を二人とも忘れる。",
  },
  "nihon-kitsune--nihon-kitsune": {
    label: "化かし合いの達人戦",
    description:
      "二匹のキツネが出会うと、互いの本心を読み合う高度な心理戦が始まる。直感派同士だから、言葉にしなくても通じ合える部分が多い。ただし二匹とも単独行動が好きなので、一緒にいる時間は短め。だからこそ、会った時の密度が濃い。",
  },
  "iriomote-yamaneko--iriomote-yamaneko": {
    label: "島の領土交渉",
    description:
      "推定100頭の島で同じタイプ同士が出会う確率は極めて低い。もし出会えたら、それは運命。ただし二匹とも縄張り意識が強いので、適度な距離感が大切。互いのサバイバル能力を認め合う、静かだが深い信頼関係が築ける。",
  },
  "amami-kuro-usagi--amami-kuro-usagi": {
    label: "巣穴設計コンテスト",
    description:
      "慎重派同士が出会うと、計画の立て合いが始まる。「こっちのルートの方が安全」「いや、データによると...」と議論は尽きない。行動は遅いが、動いた時の確実性は抜群。二人で掘った巣穴は、要塞レベルの完成度になる。",
  },
  "yamane--yamane": {
    label: "同時冬眠の危機",
    description:
      "二匹とも省エネモードに入ると、誰も動かなくなる。冬眠期間が重なったら、春まで音信不通。しかし目覚めた時のシンクロ率は異常で、同じタイミングで同じことを考えている。体は小さくても、二人の集中力は森一番。",
  },
  "nihon-momonga--nihon-momonga": {
    label: "巣穴シェアハウスの住人",
    description:
      "冬場に巣穴に集まる習性があるモモンガ同士。物理的にも心理的にもくっつきたがる。お互いの体温で温め合う関係は、まさに理想のパートナーシップ。ただし二匹とも慎重派なので、新しいことを始めるまでに時間がかかる。",
  },
  "nihon-kamoshika--nihon-kamoshika": {
    label: "山頂の哲学者会議",
    description:
      "二匹のカモシカが山で出会うと、互いにじっと見つめ合う沈黙の時間が流れる。言葉は少ないが、その静かな時間の中で深い理解が生まれる。周囲から見ると「何してるの?」だが、二人の間では宇宙の真理が議論されている。",
  },
  "hondo-ten--hondo-ten": {
    label: "縄張りの境界線会議",
    description:
      "単独行動派の二匹が出会うのは縄張りの境界線。互いの領域を尊重しつつ、時には情報交換をする。同じ分析派だから、効率的な狩りの戦略について建設的な議論ができる。ただし会議が終わったら、さっさと自分の領域に戻る。",
  },
  "musasabi--musasabi": {
    label: "滑空距離の自慢大会",
    description:
      "「俺は120m飛んだ」「いや、私は130m」と、計画派同士の滑空記録合戦が始まる。二匹とも入念に準備してから飛ぶタイプなので、無謀な挑戦はしない。でも密かにライバル心を燃やしている。",
  },
  "nihon-risu--nihon-risu": {
    label: "木の実隠し場所の情報戦",
    description:
      "二匹とも慎重に食料を隠すが、二匹とも一部の隠し場所を忘れる。「あれ、ここに埋めたはずなのに...」と同じ場所を掘り返す姿は微笑ましい。お互いの忘れっぽさを責めないのが、この組み合わせの美点。",
  },
  "ezo-shika--ezo-shika": {
    label: "角突き合わせの儀式",
    description:
      "群れで行動するエゾシカ同士は、基本的に仲間意識が強い。ただし繁殖期のオスは激しく角をぶつけ合う。普段は穏やかなのに、大切なことになると一歩も引かない。意見がぶつかっても、終わればまた群れに戻る潔さがある。",
  },

  // ========== Cross-type combinations (66) ==========

  // nihon-zaru cross-combinations
  "hondo-tanuki--nihon-zaru": {
    label: "ボスと癒し担当",
    description:
      "ニホンザルのリーダーシップとタヌキの和ませ力。組織としては最強のバランス。ザルが突っ走りすぎた時、タヌキの「まあまあ」が場を救う。ザルはタヌキの穏やかさに密かに救われている。",
  },
  "nihon-kitsune--nihon-zaru": {
    label: "稲荷神社の社交場",
    description:
      "群れのボスと孤高の一匹狼。普段は距離があるが、互いの実力は認め合っている。ザルの「みんなで行こう!」にキツネが「一人で先に行く」と返す構図。でもゴール地点ではなぜか一緒にいる。",
  },
  "iriomote-yamaneko--nihon-zaru": {
    label: "温泉 vs ジャングル",
    description:
      "温泉でくつろぐザルと、亜熱帯の森を単独で駆けるヤマネコ。生息地も性格も真逆だが、どちらも「環境を自分のものにする」適応力がある。ザルの社交術とヤマネコの分析力が合わさると、意外と最強の問題解決チーム。",
  },
  "amami-kuro-usagi--nihon-zaru": {
    label: "突撃隊長と参謀",
    description:
      "即断即決のザルと慎重派のウサギ。ザルが「やろう!」と飛び出し、ウサギが「待って、計画を」と引き止める。噛み合わないようで、この緊張感が最良の結果を生む。ウサギの慎重さがザルの暴走を防ぐ名コンビ。",
  },
  "nihon-zaru--yamane": {
    label: "騒がしい朝と静かな夜",
    description:
      "社交的で活発なザルと、省エネで夜行性のヤマネ。生活リズムが完全にすれ違う。でもヤマネが起きている貴重な時間のザルの行動力は、ヤマネに刺激を与える。ザルもヤマネの集中力には一目置いている。",
  },
  "nihon-momonga--nihon-zaru": {
    label: "群れのムードメーカーズ",
    description:
      "どちらも仲間思いだが、アプローチが違う。ザルは大声で群れを率い、モモンガは静かに隣にいる。パーティーでザルが盛り上げ、モモンガが疲れた人を癒す。二人がいればどんな集まりも成功する。",
  },
  "nihon-kamoshika--nihon-zaru": {
    label: "山の住人の異文化交流",
    description:
      "同じ山に住みながら全く違う生き方。ザルは群れで騒がしく、カモシカは一人で静かに佇む。ザルの「温泉来なよ!」にカモシカが首をかしげる姿を想像してください。でも互いの存在が山の生態系を豊かにしている。",
  },
  "hondo-ten--nihon-zaru": {
    label: "社交界と一匹狼",
    description:
      "ザルの「みんなで」とテンの「一人で」は正反対。だがテンの冷静な分析とザルの行動力を組み合わせれば、効率的かつダイナミックな成果が出る。テンが戦略を練り、ザルが実行する。",
  },
  "musasabi--nihon-zaru": {
    label: "空と地上の異種格闘技",
    description:
      "木の上を飛ぶムササビと、地上を歩き回るザル。同じ森に住んでも交わることの少ない二種。ザルの「やってみよう」精神にムササビが「まず計画を」と返す。慎重さと大胆さのバランスが取れれば最高のチーム。",
  },
  "nihon-risu--nihon-zaru": {
    label: "宴会幹事とコツコツ準備係",
    description:
      "ザルが宴会を企画し、リスが裏で黙々と準備する。ザルの社交力とリスの堅実さは意外と相性がいい。ただしザルが「適当でいいよ!」と言うと、リスの慎重な心がざわつく。準備リストは必ずリスが作る。",
  },
  "ezo-shika--nihon-zaru": {
    label: "本州と北海道の群れリーダー",
    description:
      "どちらも群れを率いるタイプだが、スタイルが異なる。ザルは上下関係重視、シカは対等な群れ。互いのリーダーシップから学ぶことが多い。一緒にいるとエネルギーが倍増するが、方向性の調整が必要。",
  },

  // hondo-tanuki cross-combinations
  "hondo-tanuki--nihon-kitsune": {
    label: "日本昔話の共演者",
    description:
      "タヌキとキツネは日本の民話では永遠のライバル。でも実際のホンドタヌキは化かすどころか化かされる側。キツネの鋭い直感にタヌキの穏やかさが加わると、「頭が切れるのに感じの良い人」になれる。最強のコンビ。",
  },
  "hondo-tanuki--iriomote-yamaneko": {
    label: "里の平和主義者と森の孤高",
    description:
      "人里近くで穏やかに暮らすタヌキと、亜熱帯の森で単独サバイバルするヤマネコ。生き方は正反対だが、どちらも「自分のペースを守る」点では一致。タヌキの「死んだふり」とヤマネコの「何でも食べる」は、それぞれの環境に最適化されたサバイバル術。",
  },
  "amami-kuro-usagi--hondo-tanuki": {
    label: "のんびり屋の堅実同盟",
    description:
      "どちらも慎重で穏やか。二匹が一緒にいると時間がゆっくり流れる。タヌキの「まあいいか」とウサギの「もう少し調べてから」は、急がない生き方の二つの形。結論は遅いが、後悔も少ない。",
  },
  "hondo-tanuki--yamane": {
    label: "ほのぼの温度差",
    description:
      "タヌキは一年中のんびり、ヤマネは半年寝て半年全力。活動パターンは違うが、「急がない」という哲学は共通。タヌキがヤマネの冬眠中に見張り番をしてあげたら、きっと最高の信頼関係が生まれる。",
  },
  "hondo-tanuki--nihon-momonga": {
    label: "もふもふ同盟",
    description:
      "丸っこいタヌキとふわふわのモモンガ。見た目の癒し力は最強クラス。どちらも仲間思いで穏やかだから、一緒にいると安心感に包まれる。問題解決力は低めだが、「まあ何とかなるよね」で乗り切れることも意外と多い。",
  },
  "hondo-tanuki--nihon-kamoshika": {
    label: "社交家と哲学者の珍会話",
    description:
      "タヌキの「最近どう?」にカモシカが10分間沈黙してから答える。会話のテンポは噛み合わないが、タヌキの気楽さがカモシカの堅さをほぐし、カモシカの深い洞察がタヌキに新しい視点を与える。",
  },
  "hondo-tanuki--hondo-ten": {
    label: "里山の隣人",
    description:
      "同じ日本の森に暮らす二種だが、タヌキは群れで穏やかに、テンは単独で鋭く。タヌキが「みんなで食べよう」とテンが「自分の分は自分で」と返す関係。でも森の中では互いに干渉せず、いい距離感の隣人。",
  },
  "hondo-tanuki--musasabi": {
    label: "地上と空中の平和条約",
    description:
      "地面でのんびりしているタヌキと、夜空を滑空するムササビ。同じ森にいても交差しないが、出会えば互いの世界に好奇心を持つ。タヌキは「飛べるの、すごいね」と素直に感心し、ムササビは「のんびりもいいね」と微笑む。",
  },
  "hondo-tanuki--nihon-risu": {
    label: "食料管理の温度差",
    description:
      "タヌキは目の前のものを食べて満足、リスは将来に備えて貯蓄。「今を楽しむ」vs「将来に備える」の永遠の議論。ただしタヌキの気楽さがリスの不安を和らげ、リスの堅実さがタヌキのピンチを救うこともある。",
  },
  "ezo-shika--hondo-tanuki": {
    label: "北の戦士と里の平和主義者",
    description:
      "角をぶつけ合うシカと死んだふりするタヌキ。戦い方は正反対だが、どちらも「生き延びる」という点では成功者。シカの行動力にタヌキの平和主義が加わると、勢いがあるのに敵を作らない理想的なバランス。",
  },

  // nihon-kitsune cross-combinations
  "iriomote-yamaneko--nihon-kitsune": {
    label: "孤高の狩人同盟",
    description:
      "どちらも単独で行動し、高い狩猟能力を持つ。キツネの直感とヤマネコの分析力が合わされば、死角のない最強の一匹狼チーム。ただし二匹とも「チーム」に属す気はないので、共闘は短期間で終わる。",
  },
  "amami-kuro-usagi--nihon-kitsune": {
    label: "捕食者と被食者の意外な共感",
    description:
      "本来なら食物連鎖上の関係だが、性格診断の世界では対等。キツネの即断力とウサギの慎重さは対照的だが、どちらも「生き残るための知恵」を磨いてきた点では共通。互いの戦略から学ぶことが多い。",
  },
  "nihon-kitsune--yamane": {
    label: "早起きキツネと夜ふかしヤマネ",
    description:
      "キツネは薄明時に活動し、ヤマネは夜行性。すれ違いの関係に見えるが、どちらも静かな時間帯を選ぶ点で共鳴する。キツネの鋭い直感とヤマネの集中力は、短時間のコラボで最大の成果を出すタイプ。",
  },
  "nihon-kitsune--nihon-momonga": {
    label: "地上の狩人と空の冒険家",
    description:
      "単独派のキツネと仲間思いのモモンガ。キツネは「一人の方が速い」、モモンガは「仲間がいると安心」。真逆だが、キツネの自立心がモモンガに勇気を与え、モモンガの温かさがキツネの孤独を癒す。",
  },
  "nihon-kamoshika--nihon-kitsune": {
    label: "直感と分析の交差点",
    description:
      "キツネは直感で獲物を捕らえ、カモシカは分析的に地形を読む。同じ「一人で考える」タイプだが、思考のプロセスが正反対。互いの盲点を補い合える関係で、一緒に考えると見落としが激減する。",
  },
  "hondo-ten--nihon-kitsune": {
    label: "森の二大ハンター",
    description:
      "どちらも優れた狩猟能力を持つ単独行動派。テンの分析的な戦略とキツネの直感的な判断。同じ獲物を狙うライバルになる可能性もあるが、互いの狩りのスタイルには敬意を払っている。",
  },
  "musasabi--nihon-kitsune": {
    label: "稲荷神社の屋根裏住人と参道の守り神",
    description:
      "キツネが稲荷神社の参道を駆け、ムササビがその屋根裏に巣を作る。同じ場所にいても行動圏が違う。キツネの行動力とムササビの計画性、共有すれば互いの弱点を補える。意外と息の合う夜型コンビ。",
  },
  "nihon-kitsune--nihon-risu": {
    label: "狩る者と蓄える者",
    description:
      "キツネの「今すぐ獲る」とリスの「将来に備える」。時間軸が異なるが、どちらも生存戦略として合理的。キツネの素早い判断がリスの慎重さに刺激を与え、リスの堅実さがキツネに長期的視点を教える。",
  },
  "ezo-shika--nihon-kitsune": {
    label: "群れの行動派と孤高の直感派",
    description:
      "群れで走るシカと一人で走るキツネ。北海道ではエゾシカとキタキツネが同じ雪原に暮らす。シカの仲間意識とキツネの独立心は正反対だが、どちらも「走る」ことに長けた行動派。一緒にいるとスピード感がある。",
  },

  // iriomote-yamaneko cross-combinations
  "amami-kuro-usagi--iriomote-yamaneko": {
    label: "離島の特別天然記念物ペア",
    description:
      "奄美のウサギと西表のヤマネコ。どちらも日本の離島でのみ生き延びてきた国の特別天然記念物。「限られた環境で最大限に適応する」という共通の生存哲学を持つ。お互いの島の話をしたら、共感と尊敬で夜が明ける。",
  },
  "iriomote-yamaneko--yamane": {
    label: "サバイバーと忍者",
    description:
      "どちらも単独行動の達人。ヤマネコは何でも食べる適応力で、ヤマネは半年冬眠する省エネ戦略で、それぞれ独自のサバイバル術を極めている。方法は違えど、「最小限のリソースで生き延びる」美学を共有する仲間。",
  },
  "iriomote-yamaneko--nihon-momonga": {
    label: "亜熱帯の孤高と温帯の団欒",
    description:
      "暖かい西表島で単独行動するヤマネコと、本州の森で仲間と暮らすモモンガ。ヤマネコの自立心とモモンガの協調性は、互いに持っていないものを補い合える。モモンガの「一緒にいよう」がヤマネコの緊張をほぐす。",
  },
  "iriomote-yamaneko--nihon-kamoshika": {
    label: "南の森と北の山の分析派",
    description:
      "どちらも環境を注意深く観察し、分析的に判断する。ヤマネコは亜熱帯の密林で、カモシカは山岳地帯で、それぞれの地形を熟知している。出会えば互いの「環境適応の知恵」を交換できる最高の相談相手。",
  },
  "hondo-ten--iriomote-yamaneko": {
    label: "ハンターズ・サミット",
    description:
      "テンとヤマネコ、日本を代表する中型肉食獣の二強。テンの変身能力とヤマネコの何でも食べる適応力。共通点は「生き残るために手段を選ばない」こと。尊敬し合いつつも、互いの狩り場には立ち入らない。",
  },
  "iriomote-yamaneko--musasabi": {
    label: "夜の森の異種遭遇",
    description:
      "どちらも夜行性で、夜の森を自分のフィールドにしている。ヤマネコは地上を、ムササビは空中を。同じ闇の中でも全く違う世界を見ている。ヤマネコの行動力とムササビの計画性で、夜の森を完全制覇できる。",
  },
  "iriomote-yamaneko--nihon-risu": {
    label: "捕食者と逃走者のリスペクト",
    description:
      "食物連鎖では上下関係だが、性格面では意外と共通点がある。どちらも環境をよく観察し、単独で行動する。ヤマネコの大胆さとリスの慎重さは正反対だが、「生き残る知恵」を持つ者同士の静かな敬意がある。",
  },
  "ezo-shika--iriomote-yamaneko": {
    label: "日本列島の南北対決",
    description:
      "北海道のシカと沖縄のヤマネコ。日本列島の端と端に住む二種が出会ったら、互いの環境の違いに驚くはず。シカの群れの力とヤマネコの個の力、どちらも日本の自然が育んだ生存戦略。",
  },

  // amami-kuro-usagi cross-combinations
  "amami-kuro-usagi--yamane": {
    label: "小さな体の大きな戦略家",
    description:
      "どちらも体は小さいが、独自の戦略で生き延びてきた知恵者。ウサギの巣穴掘りとヤマネの冬眠、「得意を伸ばして弱点を補う」哲学を共有する。二人の計画会議は長引くが、出てくる戦略は堅実そのもの。",
  },
  "amami-kuro-usagi--nihon-momonga": {
    label: "穴の中と木の上の慎重派",
    description:
      "地面の巣穴に住むウサギと木の上に住むモモンガ。どちらも慎重で仲間思い。ウサギの分析力とモモンガの共感力は相性が良く、一緒にいると安心感が倍増する。行動は遅いが、判断ミスが少ない。",
  },
  "amami-kuro-usagi--nihon-kamoshika": {
    label: "特別天然記念物の知恵者会議",
    description:
      "どちらも国の天然記念物で、どちらも慎重な分析派。データを集め、検討し、最善策を探る。せっかちな人には退屈に見えるが、この二人の結論は間違いが少ない。会議は長いが後悔も少ない。",
  },
  "amami-kuro-usagi--hondo-ten": {
    label: "被食者と捕食者の知恵比べ",
    description:
      "自然界では追う側と追われる側だが、性格面では互いに学びがある。ウサギの堅実な防御戦略とテンの柔軟な攻撃戦略。「最善の守り」と「最善の攻め」を知る二人が協力すれば、穴のない計画が作れる。",
  },
  "amami-kuro-usagi--musasabi": {
    label: "巣穴派と樹上派の安全保障会議",
    description:
      "ウサギは地面に巣穴を掘り、ムササビは木の上に巣を作る。アプローチは違うが、「安全な拠点を確保する」という優先順位は同じ。二匹の防衛計画は鉄壁だが、攻めに転じるのは苦手。",
  },
  "amami-kuro-usagi--nihon-risu": {
    label: "コツコツ同盟",
    description:
      "ウサギの巣穴掘りとリスの食料貯蓄。どちらも地道な作業を厭わない堅実派。「急がば回れ」を体現する二匹が一緒にいると、プロジェクトの基盤は完璧。ただし締め切りには常に余裕を持ちたいタイプ。",
  },
  "amami-kuro-usagi--ezo-shika": {
    label: "離島の堅実家と大地の行動派",
    description:
      "奄美の小さな島でコツコツ生きるウサギと、北海道の大地を群れで駆けるシカ。スケールは違うが、どちらも「環境に合った生き方」を見つけた賢者。シカの行動力がウサギの慎重さを補い、ウサギの堅実さがシカの暴走を防ぐ。",
  },

  // yamane cross-combinations
  "nihon-momonga--yamane": {
    label: "小さな森の仲間たち",
    description:
      "どちらも手のひらに乗るサイズの小さな動物。ヤマネの省エネ戦略とモモンガの仲間で温め合う戦略。冬を乗り越える知恵は違うが、「小さくても生き延びる」という誇りを共有している。",
  },
  "nihon-kamoshika--yamane": {
    label: "大きな山の哲学者と小さな森の忍者",
    description:
      "体の大きさは何十倍も違うが、どちらも静かで、必要な時だけ動く。カモシカの深い思考とヤマネの鋭い集中力は、規模は違えど同じ「質重視」の生き方。互いの存在に気づかないほど静かだが、気づいたら最高の理解者。",
  },
  "hondo-ten--yamane": {
    label: "捕食者と小さな隣人",
    description:
      "テンにとってヤマネは獲物のサイズだが、性格診断の世界では対等なパートナー。テンの戦略的思考とヤマネの直感的判断は補い合える。テンの「分析してから動く」とヤマネの「感じてから動く」、正解は状況次第。",
  },
  "musasabi--yamane": {
    label: "夜の森の空と地",
    description:
      "ムササビは空を飛び、ヤマネは枝を走る。どちらも夜行性で同じ森に暮らすが、行動圏は上下に分かれる。計画派のムササビと直感派のヤマネ。互いの見ている風景を交換したら、森の見え方が変わる。",
  },
  "nihon-risu--yamane": {
    label: "樹上の小さな職人たち",
    description:
      "どちらも木の上で暮らす小さな動物。リスの貯蓄戦略とヤマネの冬眠戦略、「冬をどう乗り越えるか」の答えが真逆。リスは「蓄える」、ヤマネは「使わない」。どちらが賢いかは、春にならないとわからない。",
  },
  "ezo-shika--yamane": {
    label: "大地の群れと森の一匹",
    description:
      "北海道の大地を群れで駆けるシカと、手のひらサイズで一人静かに暮らすヤマネ。スケールが違いすぎて比較にならないが、シカの「仲間と走る楽しさ」とヤマネの「一人の充実感」は、どちらも本物の幸せ。",
  },

  // nihon-momonga cross-combinations
  "nihon-kamoshika--nihon-momonga": {
    label: "山の思索者と森の愛されっ子",
    description:
      "一人で哲学するカモシカと、仲間と寄り添うモモンガ。孤独と共感、正反対の価値観だが、カモシカの深い思考がモモンガの行動に意味を与え、モモンガの温かさがカモシカの孤独を癒す。補完的な名コンビ。",
  },
  "hondo-ten--nihon-momonga": {
    label: "ハンターとかわいい隣人",
    description:
      "鋭い狩りのテンとふわふわのモモンガ。自然界では緊張関係だが、性格面では意外とバランスが良い。テンの分析力がモモンガの慎重さを後押しし、モモンガの社交性がテンの孤独を和らげる。",
  },
  "musasabi--nihon-momonga": {
    label: "滑空する者たちの同族会議",
    description:
      "どちらも飛膜で滑空する近縁種。しかしモモンガは仲間と巣を共有し、ムササビは単独で行動する。「飛ぶ」という共通点と「暮らし方」の違い。互いの飛び方を比較して「うちの方が効率的」と主張し合う、マニアックだが楽しい関係。",
  },
  "nihon-momonga--nihon-risu": {
    label: "木の上のご近所さん",
    description:
      "どちらも木の上に暮らす小さな動物。モモンガは飛び、リスは走る。移動手段は違うが、同じ森を共有する仲間意識がある。モモンガの「みんなで」とリスの「自分で」、たまに一緒に木の実を食べると絆が深まる。",
  },
  "ezo-shika--nihon-momonga": {
    label: "大型草食獣と小型飛行獣",
    description:
      "北海道の大きなシカと手のひらサイズのモモンガ。体格差は100倍以上だが、どちらも仲間を大切にする群れ型。シカの「群れで走る力強さ」とモモンガの「巣穴で温め合う優しさ」、アプローチは違うが根っこは同じ。",
  },

  // nihon-kamoshika cross-combinations
  "hondo-ten--nihon-kamoshika": {
    label: "山岳地帯の知識人たち",
    description:
      "どちらも日本の山で暮らし、どちらも分析的な思考の持ち主。テンは行動的に情報を集め、カモシカはじっくり観察して考える。同じ結論に違うルートで辿り着く二人。学術会議のような会話が成立する稀有な組み合わせ。",
  },
  "musasabi--nihon-kamoshika": {
    label: "夜の計画家と昼の観察者",
    description:
      "夜に計画を立てて飛ぶムササビと、昼に山で世界を観察するカモシカ。どちらも慎重で分析的だが、時間帯が違う。24時間交代制で思考を続けたら、地球上の全ての問題を解決できるかもしれない。",
  },
  "nihon-kamoshika--nihon-risu": {
    label: "大きな考え事と小さな仕事",
    description:
      "カモシカが宇宙の真理を考えている間、リスはせっせとクルミを埋めている。スケールは違うが、どちらも「自分のやるべきこと」に真剣。カモシカの大局観とリスの実務力は、意外と最強のプロジェクトチーム。",
  },
  "ezo-shika--nihon-kamoshika": {
    label: "ウシ目の遠い親戚会",
    description:
      "シカ科のエゾシカとウシ科のニホンカモシカ。名前に「シカ」がつくのにカモシカはウシの仲間。群れで走るシカと一人で佇むカモシカ、行動派と思索派の対比が面白い。親戚だけど生き方は全く違う、家族の縮図のような関係。",
  },

  // hondo-ten cross-combinations
  "hondo-ten--musasabi": {
    label: "孤高の戦略家同盟",
    description:
      "どちらも単独行動派で、どちらも夜行性。テンの分析的な狩りとムササビの計画的な滑空。「一人で考え、一人で動く」スタイルが共通。出会う機会は少ないが、出会えば互いの戦略に感心し合う。静かだが熱い同盟。",
  },
  "hondo-ten--nihon-risu": {
    label: "森の攻撃と防御",
    description:
      "攻撃型のテンと防御型のリス。自然界では追う側と逃げる側だが、性格面ではテンの大胆さとリスの慎重さが絶妙なバランス。テンが「今すぐ行こう」、リスが「ちょっと待って備蓄してから」。完璧な準備をしてから大胆に動く最強パターン。",
  },
  "ezo-shika--hondo-ten": {
    label: "群れの戦士と孤独のハンター",
    description:
      "群れで行動するシカと単独で狩りをするテン。生き方は真逆だが、どちらも行動的で分析力がある。シカの仲間を率いる力とテンの一人で成果を出す力、チームと個人のどちらが強いか、永遠の議論。",
  },

  // musasabi cross-combinations
  "musasabi--nihon-risu": {
    label: "夜のパイロットと昼の貯蓄家",
    description:
      "夜に飛ぶムササビと昼に走るリス。どちらも慎重派だが、ムササビは計画してから大きく動き、リスはコツコツ小さく動く。「一発の大ジャンプ」vs「毎日の小さな積み重ね」、成功へのアプローチが対照的。",
  },
  "ezo-shika--musasabi": {
    label: "大地を駆ける者と空を飛ぶ者",
    description:
      "地上最速クラスのシカと空中滑空するムササビ。移動手段は全く違うが、どちらも「遠くへ行く」ことに長けている。シカの群れの力とムササビの個の計画力、スケールと精密さの融合。",
  },

  // nihon-risu cross-combinations
  "ezo-shika--nihon-risu": {
    label: "北の大地の大と小",
    description:
      "北海道にも本州にもいるリスと、北海道の大地を駆けるシカ。体格差は圧倒的だが、リスの「将来に備える慎重さ」がシカの「今を生きる行動力」の良いブレーキになる。シカが走り出す前にリスが「クルミ持った?」と聞く関係。",
  },
};

/** All valid type IDs for this quiz */
export const ANIMAL_TYPE_IDS = [
  "nihon-zaru",
  "hondo-tanuki",
  "nihon-kitsune",
  "iriomote-yamaneko",
  "amami-kuro-usagi",
  "yamane",
  "nihon-momonga",
  "nihon-kamoshika",
  "hondo-ten",
  "musasabi",
  "nihon-risu",
  "ezo-shika",
] as const;

export type AnimalTypeId = (typeof ANIMAL_TYPE_IDS)[number];

/**
 * Look up compatibility between two type IDs.
 * Order does not matter: getCompatibility("a","b") === getCompatibility("b","a").
 */
export function getCompatibility(
  typeA: string,
  typeB: string,
): CompatibilityEntry | undefined {
  const key = [typeA, typeB].sort().join("--");
  return compatibilityMatrix[key];
}

/**
 * Check if a given string is a valid animal personality type ID.
 */
export function isValidAnimalTypeId(id: string): id is AnimalTypeId {
  return (ANIMAL_TYPE_IDS as readonly string[]).includes(id);
}

export default animalPersonalityQuiz;
