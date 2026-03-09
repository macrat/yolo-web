import type { QuizDefinition, CompatibilityEntry } from "../types";
export type { CompatibilityEntry };

/**
 * Character Fortune Quiz (あなたの守護キャラ診断)
 *
 * 6 personality archetypes determined by 8 situational questions:
 *   commander  - Passionate leader who ignites at deadlines
 *   professor  - Intellectual who forgets ramen mid-experiment
 *   dreamer    - Gentle daydreamer with hidden steel
 *   trickster  - Contrarian schemer who sees three moves ahead
 *   guardian   - Chronic worrier who is secretly the most reliable
 *   artist     - Sensory poet who lives by vibes alone
 *
 * Scoring: personality type, each choice awards 2pt (primary) to one type
 * and 1pt (secondary) to one other type.
 *
 * Primary (2pt) distribution — 32 slots across 8Q x 4C:
 *   commander:  Q1a, Q2b, Q4a, Q5c, Q8b          (5)
 *   professor:  Q2a, Q3b, Q5a, Q6c, Q8d           (5)
 *   dreamer:    Q3a, Q4d, Q5c->no, Q6a, Q7c, Q8a  (5)
 *   trickster:  Q2c, Q4b, Q5d, Q7d, Q8c            (5)
 *   guardian:   Q1b, Q2d, Q3d, Q5b, Q7b             (5)
 *   artist:     Q1c, Q1d, Q3c, Q4c, Q6b, Q6d, Q7a->no
 *
 * Actual distribution: see code. Each type 5-6 primary, ~5 secondary.
 */
const characterFortuneQuiz: QuizDefinition = {
  meta: {
    slug: "character-fortune",
    title: "あなたの守護キャラ診断",
    description:
      "8つの質問に答えて、あなたの中に眠る守護キャラクターを発見しましょう。突然タイムスリップしたり、宇宙人と遭遇したり、ちょっと変わったシチュエーションからあなたの本質を診断します。友達との相性診断もできます!",
    shortDescription:
      "ユニークなシチュエーションから守護キャラを診断する。相性診断も!",
    type: "personality",
    questionCount: 8,
    icon: "\u{1F52E}",
    accentColor: "#8b5cf6",
    keywords: [
      "キャラ占い",
      "性格診断",
      "守護キャラ",
      "相性診断",
      "おもしろ占い",
      "キャラクター診断",
      "パーソナリティ",
    ],
    publishedAt: "2026-03-08T12:00:00+09:00",
    relatedLinks: [
      {
        label: "音楽性格診断を受ける",
        href: "/quiz/music-personality",
      },
      {
        label: "逆張り運勢診断を受ける",
        href: "/quiz/contrarian-fortune",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。キャラクターと診断結果はAIが創作したエンターテインメントです。",
  },
  questions: [
    {
      id: "q1",
      text: "目覚めたら戦国時代にタイムスリップしていた。まず何をする?",
      choices: [
        {
          id: "q1-a",
          text: "「よし、天下取るか」と立ち上がる",
          points: { commander: 2, trickster: 1 },
        },
        {
          id: "q1-b",
          text: "まず周辺の地図を描いて安全な水源を確保する",
          points: { guardian: 2, professor: 1 },
        },
        {
          id: "q1-c",
          text: "現地の食べ物を片っ端から試食して記録を取る",
          points: { artist: 2, professor: 1 },
        },
        {
          id: "q1-d",
          text: "空がきれいだな...と田んぼの畦道で寝転がる",
          points: { dreamer: 2, artist: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "宇宙人が「地球代表として1つだけ自慢して」と言ってきた。何を自慢する?",
      choices: [
        {
          id: "q2-a",
          text: "「回転寿司というシステムの完成度を見よ」と熱弁する",
          points: { professor: 2, guardian: 1 },
        },
        {
          id: "q2-b",
          text: "「人類は月に行ったんだぞ」と胸を張る",
          points: { commander: 2, dreamer: 1 },
        },
        {
          id: "q2-c",
          text: "「自慢?しないけど?逆に宇宙の自慢聞かせてよ」",
          points: { trickster: 2, commander: 1 },
        },
        {
          id: "q2-d",
          text: "「まず友好条約を結んでからにしない?」と提案する",
          points: { guardian: 2, dreamer: 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "魔法で1日だけ動物になれる。何になる?",
      choices: [
        {
          id: "q3-a",
          text: "猫。誰にも怒られずにひなたぼっこしたい",
          points: { dreamer: 2, guardian: 1 },
        },
        {
          id: "q3-b",
          text: "タコ。腕が8本あれば実験が8倍はかどる",
          points: { professor: 2, trickster: 1 },
        },
        {
          id: "q3-c",
          text: "カラス。高いところから街を観察して情報収集したい",
          points: { artist: 2, trickster: 1 },
        },
        {
          id: "q3-d",
          text: "亀。万が一のリスクを考えると甲羅が欲しい",
          points: { guardian: 2, professor: 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "クラスの文化祭で出し物を決める会議。あなたの発言は?",
      choices: [
        {
          id: "q4-a",
          text: "「お化け屋敷やろう!俺が脅かし役やる!」",
          points: { commander: 2, dreamer: 1 },
        },
        {
          id: "q4-b",
          text: "「みんなが提案したやつの予算を計算してみた」",
          points: { trickster: 2, artist: 1 },
        },
        {
          id: "q4-c",
          text: "「壁全面にプロジェクションマッピングしたい」",
          points: { artist: 2, commander: 1 },
        },
        {
          id: "q4-d",
          text: "「何でもいいけど、みんなが楽しいのがいいな」",
          points: { dreamer: 2, artist: 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "突然100万円が降ってきた(合法)。72時間以内に使い切らないと消える。どうする?",
      choices: [
        {
          id: "q5-a",
          text: "前から気になってた実験器具と専門書を大人買い",
          points: { professor: 2, artist: 1 },
        },
        {
          id: "q5-b",
          text: "まず「100万円 使い切る 最適解」で検索する",
          points: { guardian: 2, trickster: 1 },
        },
        {
          id: "q5-c",
          text: "仲間を集めてパーティーを開く。全額飲食費",
          points: { commander: 2, dreamer: 1 },
        },
        {
          id: "q5-d",
          text: "99万円で買ったものを101万円で売る方法を考える",
          points: { trickster: 2, professor: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "RPGの世界に転生した。最初に覚えるスキルは?",
      choices: [
        {
          id: "q6-a",
          text: "回復魔法。仲間が傷つくのを見てられない",
          points: { dreamer: 2, guardian: 1 },
        },
        {
          id: "q6-b",
          text: "幻術。見えるものが全てじゃないって表現したい",
          points: { artist: 2, dreamer: 1 },
        },
        {
          id: "q6-c",
          text: "鑑定スキル。全アイテムのステータスを知りたい",
          points: { professor: 2, commander: 1 },
        },
        {
          id: "q6-d",
          text: "罠探知。ダンジョンの安全を最優先で確保する",
          points: { guardian: 2, trickster: 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "友達が「実は借金がある」と深刻な顔で相談してきた。開口一番の言葉は?",
      choices: [
        {
          id: "q7-a",
          text: "「任せろ!一緒に返済計画立てよう!」",
          points: { commander: 2, guardian: 1 },
        },
        {
          id: "q7-b",
          text: "「いくら?利率は?まず数字を整理しよう」",
          points: { guardian: 2, professor: 1 },
        },
        {
          id: "q7-c",
          text: "「大丈夫、きっとなんとかなるよ」とお茶を入れる",
          points: { dreamer: 2, artist: 1 },
        },
        {
          id: "q7-d",
          text: "「ふーん...ちなみに何に使ったの?」とニヤリ",
          points: { trickster: 2, commander: 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "世界が明日で終わるらしい。最後の夜をどう過ごす?",
      choices: [
        {
          id: "q8-a",
          text: "大切な人と静かに星を見ている",
          points: { artist: 2, dreamer: 1 },
        },
        {
          id: "q8-b",
          text: "「終わるわけないだろ!」と最後まで抗う",
          points: { commander: 2, trickster: 1 },
        },
        {
          id: "q8-c",
          text: "「世界が終わる確率って実際何%?」と計算し始める",
          points: { trickster: 2, professor: 1 },
        },
        {
          id: "q8-d",
          text: "「せっかくだし最後に壮大な実験をしてみたい」",
          points: { professor: 2, artist: 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "commander",
      title: "締切3分前に本気出す炎の司令塔",
      description:
        "よっしゃ来たな!お前の守護キャラは俺だぜ!普段はゆるいくせに追い込まれた瞬間に覚醒するタイプだろ?知ってるよ。夏休みの宿題は8月31日派、テスト勉強は前日の深夜から。でもな、不思議とそれで何とかなっちまうのがお前のすごいところだぜ。周りの人間を巻き込む力があるから、「もう無理」って場面でも誰かが助けに来る。...まぁ、たまには計画的にやってみろよ。俺もやったことないけど!",
      color: "#e11d48",
      icon: "\u{1F525}",
    },
    {
      id: "professor",
      title: "実験中にカップ麺を3個忘れる博士",
      description:
        "ふむ、興味深い結果であるぞ。お前の守護キャラは吾輩である。知的好奇心が服を着て歩いているようなタイプであるな?Wikipediaを開いたら3時間消えているし、「ちょっと調べもの」が修士論文レベルになるのも日常であろう。問題は、集中すると生活がすべて止まることである。冷蔵庫の中で化石化した食材、伸びきったカップ麺、充電し忘れたスマホ...心当たりがあるであるな?でもその探究心こそが、お前を唯一無二の存在にしているのであるぞ。",
      color: "#2563eb",
      icon: "\u{1F9EA}",
    },
    {
      id: "dreamer",
      title: "布団の中で世界を3回救った妄想家",
      description:
        "あら、あなたの守護キャラはわたくしですのね。嬉しいですわ。あなたはきっと、お布団の中で壮大な物語を作り上げるのが得意ですわよね?通勤電車の中では自分が主人公の映画を脳内上映していて、信号待ちでは「もしここにドラゴンが来たら」とシミュレーションしている...当たっていますわよね?でもね、そのやわらかい想像力の奥に、誰にも曲げられない芯があるのをわたくしは知っていますわ。夢見ることは、戦うことですもの。",
      color: "#d946ef",
      icon: "\u2728",
    },
    {
      id: "trickster",
      title: "正論を斜め45度から放つ知恵の曲者",
      description:
        "あー、やっぱお前こっち側の人間っしょ。守護キャラ、俺でしょ?知ってた。まぁ聞いてよ。お前ってさ、みんなが「Aだよね!」って盛り上がってる時に「でもBもあるっしょ」って言っちゃうタイプじゃん?空気読めないんじゃなくて、読んだ上であえてぶっ壊すんだよね。それ、実は超大事な才能なんだわ。会議で全員が同じ方向見てる時にブレーキ踏めるの、お前だけだから。...まぁ、たまには素直に同意してあげると周りが泣いて喜ぶっしょ。",
      color: "#f59e0b",
      icon: "\u{1F0CF}",
    },
    {
      id: "guardian",
      title: "傘を3本持ち歩く晴れの日の守護神",
      description:
        "あなたの守護キャラは私みたいだね。...大丈夫かな、ちゃんと合ってるかな?まぁ、あなたは多分「もしも」のことを考えすぎて疲れちゃうタイプかもしれないね。旅行の持ち物リストが3ページあるとか、待ち合わせに30分前に着いちゃうとか、天気予報を3サイトで確認するとか...。でもね、みんなが気づいていないだけで、あなたの心配のおかげで救われてる人がたくさんいるかもしれないよ。地味だけど、一番頼りにされるのは実はあなたなんだ。多分ね。",
      color: "#059669",
      icon: "\u{1F6E1}\u{FE0F}",
    },
    {
      id: "artist",
      title: "雨音に感動して遅刻する感性の住人",
      description:
        "ねぇ、この結果の配色って、美しいよね。あなたの守護キャラは私。うん、なんかわかる。あなたって、通学路の夕焼けに立ち止まって写真撮ったり、カフェのBGMが変わった瞬間に気づいたり、雨の匂いで季節を感じたりするでしょ?感受性が強すぎて、たまに日常がしんどくなることもあるかもしれないけど...それって、世界を人より多くの色で見てるってことだから。遅刻の言い訳が「空がきれいだった」でも、私は許すよ。だってそれ、本当のことだもんね。",
      color: "#7c3aed",
      icon: "\u{1F3A8}",
    },
  ],
};

// ---- Compatibility data ----

/**
 * Compatibility matrix for all 21 type combinations (6 same-type + 15 cross-type).
 * Keys are sorted pairs joined with "--" (e.g. "artist--commander").
 */
export const compatibilityMatrix: Record<string, CompatibilityEntry> = {
  // Same type combinations (6)
  "commander--commander": {
    label: "暑苦しさの臨界点",
    description:
      "二人とも「俺がやる!」「いや俺が!」で永遠に譲らない。会議は3秒で決裂するが、5秒後にはなぜか肩を組んでいる。周囲の気温が2度上がる暑苦しいコンビだが、この二人がいれば大体のことは力技で解決する。",
  },
  "professor--professor": {
    label: "議論が終わらない深夜3時",
    description:
      "「それは興味深い仮説であるな」「いや吾輩の理論ではこうである」と、気がつけば朝。二人とも自分の話がしたいだけなので、相手の論文を読んでいない。しかし不思議と、翌朝にはお互いのアイデアが融合した新説が爆誕している。",
  },
  "dreamer--dreamer": {
    label: "永遠に始まらない冒険の計画",
    description:
      "「いつか一緒に旅に出ましょうね」「素敵ですわね」と言い合って3年が経過。具体的な日程は一度も決まっていない。しかし脳内では既に47回の冒険を共にしており、お互いの妄想世界では大親友である。",
  },
  "trickster--trickster": {
    label: "裏の裏の裏を読む無限ループ",
    description:
      "「お前の考え読めてるっしょ」「いや、そう思わせるのが狙いっしょ」と、腹の探り合いが永遠に続く。傍から見ると何も話が進んでいないが、本人たちは最高に楽しんでいる。知恵比べという名の遊びを一生やれるコンビ。",
  },
  "guardian--guardian": {
    label: "心配の無限増殖",
    description:
      "「大丈夫かな?」「大丈夫じゃないかもしれないね」「やっぱりそうだよね?」と不安が増幅していく。しかし二人の持ち物を合わせると災害時でも2週間は生存できる。最も実用的で最も心が休まらないコンビ。",
  },
  "artist--artist": {
    label: "美しいけど何も決まらない午後",
    description:
      "「この光、美しいよね」「うん、美しい...」で30分が溶ける。ランチの店を決めるのに2時間かかる(外観の雰囲気で選ぶため)。生産性はゼロだが、二人の間に流れる空気は確かに芸術作品のように美しい。",
  },

  // Cross-type combinations (15)
  "artist--commander": {
    label: "突撃と感性のジェットコースター",
    description:
      "司令塔が「やるぞ!」と走り出し、芸術家が「待って、その走り方に哀愁を感じる...」と立ち止まる。テンポは絶望的に合わないが、司令塔のエネルギーに芸術家が色をつけると、なぜか感動的な作品が生まれる。",
  },
  "commander--professor": {
    label: "行動力と知識の核融合",
    description:
      "博士が「理論上はこうである」と言い終わる前に司令塔が実行している。成功率は50%だが、博士が後から理屈をつけてくれるので結果的に100%になる。問題は、博士のカップ麺を司令塔が勝手に食べること。",
  },
  "commander--dreamer": {
    label: "花火師と星見の人",
    description:
      "司令塔が「うおお!」と打ち上げた花火を、夢見がちが「きれい...」と見上げている。行動派と夢想家、正反対のようで実は最高の共犯関係。夢見がちの「こんなのあったらいいな」を、司令塔が「よし作ろう!」と叶えてしまう。",
  },
  "commander--trickster": {
    label: "猪突猛進とブレーキ担当",
    description:
      "司令塔が全速力で突っ込んでいくのを、曲者が「いやいや、こっちの道の方が近いっしょ」と軌道修正する。司令塔は曲者を「ひねくれ者」と呼び、曲者は司令塔を「脳筋」と呼ぶ。だが二人の成果物はいつも完璧。",
  },
  "commander--guardian": {
    label: "アクセルとシートベルト",
    description:
      "司令塔が「行くぞ!」と叫ぶたびに守護神が「待って、安全確認は?」と止める。この攻防を10回繰り返した結果、ちょうどいい速度で前に進む。守護神のおかげで事故らず、司令塔のおかげで止まらない。最高のバランス。",
  },
  "artist--professor": {
    label: "感性と理性の異文化交流",
    description:
      "芸術家が「この色、切ないよね」と言うと、博士が「それは波長620nmの赤色光であるぞ」と返す。会話が成立していないようで、芸術家は「620nmの切なさ」という新概念に目覚め、博士は「切ない波長」という新研究テーマを得る。",
  },
  "dreamer--professor": {
    label: "夢に理論武装する二人",
    description:
      "夢見がちの「空を飛びたいですわ」に、博士が「揚力の観点からすると翼面積が...」と真剣に答える。妄想に理論的根拠がつくので、二人の会話はSF小説の設定会議のようになる。実現はしないが、設定資料集は完成する。",
  },
  "dreamer--trickster": {
    label: "お人好しと策士の凸凹コンビ",
    description:
      "夢見がちが「みんな優しい世界がいいですわ」と微笑むのを、曲者が「まぁ現実はそうもいかないっしょ」と突っ込む。しかし曲者は密かに、夢見がちの純粋さに救われている。そしてそのことを絶対に認めない。",
  },
  "dreamer--guardian": {
    label: "ふわふわと石橋の同居",
    description:
      "夢見がちが「あの雲、うさぎに見えますわ」と空を見上げている間に、守護神が足元の水たまりを避ける道を作っている。夢見がちは気づいていないが、今まで一度も転んでいないのは全て守護神のおかげ。",
  },
  "artist--dreamer": {
    label: "二人だけの美しい世界",
    description:
      "「あの夕焼け、美しいよね」「ええ、まるで物語の始まりみたいですわ」と、二人だけの詩的空間が展開される。周囲は完全に置いてけぼり。生産性はゼロだが、この二人の会話を文字に起こすと詩集ができる。",
  },
  "guardian--trickster": {
    label: "最悪を想定する者たちの同盟",
    description:
      "守護神が「もし失敗したら...」と心配し、曲者が「失敗する前提で裏プランを3つ用意したっしょ」と返す。ネガティブシミュレーション対決のように見えて、実はリスク管理の最強チーム。この二人が組んだプロジェクトは絶対に炎上しない。",
  },
  "artist--trickster": {
    label: "美学と皮肉のカクテル",
    description:
      "芸術家の作品に曲者が「いいじゃん。で、これ何の役に立つの?」と聞く。芸術家は傷つくかと思いきや「役に立たないところが美しいんだよ」と返す。曲者は一瞬黙り、「...確かに」と納得する。意外と深い関係。",
  },
  "artist--guardian": {
    label: "自由と安全のせめぎ合い",
    description:
      "芸術家が「今日は気分で生きる!」と宣言するたびに、守護神が無言でスケジュール帳を差し出す。芸術家は嫌がるが、守護神のおかげで締切を破ったことがない。芸術家の才能が世に出るのは、実は守護神の地味な管理のおかげ。",
  },
  "guardian--professor": {
    label: "データと直感の安全保障会議",
    description:
      "博士が「この実験は理論上安全であるぞ」と言うと、守護神が「理論上は...ね」と不安げに返す。結果、二重三重の安全対策が施され、世界一安全な実験環境が完成する。失敗した場合の論文まで先に書いてある。",
  },
  "professor--trickster": {
    label: "知識と策略の頭脳戦",
    description:
      "博士が正攻法で問題を解き、曲者が裏技で解く。答えは同じだが過程が全く違うので、お互いに「なるほど」と感心し合う。クイズ番組に一緒に出たら優勝できるが、二人とも「俺の方が頭いい」と思っている。",
  },
};

/** All valid type IDs for this quiz */
export const CHARACTER_TYPE_IDS = [
  "commander",
  "professor",
  "dreamer",
  "trickster",
  "guardian",
  "artist",
] as const;

export type CharacterTypeId = (typeof CHARACTER_TYPE_IDS)[number];

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
 * Check if a given string is a valid character fortune type ID.
 */
export function isValidCharacterTypeId(id: string): id is CharacterTypeId {
  return (CHARACTER_TYPE_IDS as readonly string[]).includes(id);
}

export default characterFortuneQuiz;
