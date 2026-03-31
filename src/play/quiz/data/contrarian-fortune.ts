import type { QuizDefinition } from "../types";

/**
 * Q43 Contrarian Fortune Quiz (逆張り運勢診断)
 *
 * Concept: Where typical fortune-telling affirms, this quiz "reverses" the
 * prediction. Each result contains a "普通の占いなら○○だが、実は△△" reversal
 * frame for humorous effect.
 *
 * Point distribution design (8 results x 4 primary slots each = 32 total):
 *
 * Result IDs:
 *   reverseoptimist    (逆オプティミスト)  - primary in: q1-b, q2-a, q7-c, q8-a
 *   overthinker        (考えすぎ予報士)    - primary in: q1-a, q2-b, q5-a, q6-b
 *   cosmicworrier      (宇宙規模の心配性)  - primary in: q3-a, q3-b, q4-b, q5-d
 *   paradoxmaster      (パラドクスの達人)   - primary in: q1-c, q3-c, q5-b, q7-d
 *   accidentalprophet  (うっかり預言者)     - primary in: q3-d, q4-d, q6-a, q8-b
 *   calmchaos          (平穏なるカオス)     - primary in: q1-d, q2-c, q6-c, q8-c
 *   inversefortune     (逆張りの星の下に)   - primary in: q2-d, q4-c, q5-c, q7-a
 *   mundaneoracle      (日常の神託者)       - primary in: q4-a, q6-d, q7-b, q8-d
 */
const contrarianFortuneQuiz: QuizDefinition = {
  meta: {
    slug: "contrarian-fortune",
    title: "逆張り運勢診断",
    seoTitle: "逆張り運勢診断｜無料の面白い心理テスト・8タイプ占い",
    description:
      "一般的な占いが「こうです」と肯定するところを「でも実は逆です」と裏切る、斜め上の運勢診断。8つの質問に答えて、あなただけの逆張り運勢タイプを発見しましょう。",
    shortDescription: "占いの常識を裏切る、あなたの逆張り運勢タイプを診断",
    type: "personality",
    category: "personality",
    questionCount: 8,
    icon: "\u{1F504}",
    accentColor: "#f59e0b",
    keywords: [
      "逆張り",
      "運勢",
      "占い",
      "診断",
      "ユーモア",
      "面白い占い",
      "逆張り運勢",
    ],
    publishedAt: "2026-03-08T13:00:00+09:00",
    relatedLinks: [
      {
        label: "達成困難アドバイス診断を受ける",
        href: "/play/impossible-advice",
      },
      {
        label: "斜め上の相性診断を受ける",
        href: "/play/unexpected-compatibility",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。質問と結果はAIが創作したユーモア占いです。楽しみとしてお楽しみください。",
    faq: [
      {
        question: "「逆張り」とはどういう意味ですか？",
        answer:
          "通常の占いが「こうです」と肯定するところを、この診断では逆の視点から裏切る仕掛けになっています。期待を外す笑いを楽しむコンセプトです。",
      },
      {
        question: "運勢タイプは何種類ありますか？",
        answer:
          "逆オプティミスト・考えすぎ予報士・宇宙規模の心配性・パラドクスの達人・うっかり預言者・平穏なるカオス・逆張りの星の下に・日常の神託者の8種類です。",
      },
      {
        question: "占いとして信頼できますか？",
        answer:
          "信頼できません。これはユーモアを楽しむエンターテインメントコンテンツです。本格的な占いをお求めの方には向いていません。",
      },
      {
        question: "結果をSNSでシェアできますか？",
        answer:
          "結果ページをそのまま友人に見せたり、SNSで共有したりできます。逆張り具合を友人と比べてみてください。",
      },
    ],
    resultPageLabels: {
      traitsHeading: "この逆張りタイプの特徴",
      behaviorsHeading: "この逆張りタイプのあるある",
      adviceHeading: "この逆張りタイプへの(逆)アドバイス",
    },
  },
  questions: [
    {
      id: "q1",
      text: "朝起きて最初に目に入るものは?",
      choices: [
        {
          id: "q1-a",
          text: "スマホの通知",
          points: { overthinker: 2, cosmicworrier: 1 },
        },
        {
          id: "q1-b",
          text: "カーテンの隙間から差す光",
          points: { reverseoptimist: 2, accidentalprophet: 1 },
        },
        {
          id: "q1-c",
          text: "枕元の時計",
          points: { paradoxmaster: 2, calmchaos: 1 },
        },
        {
          id: "q1-d",
          text: "何も見えない。まだ目を開けていない",
          points: { calmchaos: 2, inversefortune: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "占いの結果が「今日は最高の一日!」だったら?",
      choices: [
        {
          id: "q2-a",
          text: "素直に喜ぶ",
          points: { reverseoptimist: 2, accidentalprophet: 1 },
        },
        {
          id: "q2-b",
          text: "何か裏があると疑う",
          points: { overthinker: 2, paradoxmaster: 1 },
        },
        {
          id: "q2-c",
          text: "占いは信じないが気分は悪くない",
          points: { calmchaos: 2, cosmicworrier: 1 },
        },
        {
          id: "q2-d",
          text: "最高の一日にするために全力で努力する",
          points: { inversefortune: 2, reverseoptimist: 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "友人から「今日ツイてるね!」と言われたら?",
      choices: [
        {
          id: "q3-a",
          text: "「そう? ありがとう!」",
          points: { cosmicworrier: 2, reverseoptimist: 1 },
        },
        {
          id: "q3-b",
          text: "「この後きっと何か起きる...」",
          points: { cosmicworrier: 2, overthinker: 1 },
        },
        {
          id: "q3-c",
          text: "「ツキって何だろうね...」と哲学する",
          points: { paradoxmaster: 2, calmchaos: 1 },
        },
        {
          id: "q3-d",
          text: "宝くじを買いに行く",
          points: { accidentalprophet: 2, inversefortune: 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "黒猫が目の前を横切った。どう思う?",
      choices: [
        {
          id: "q4-a",
          text: "かわいい",
          points: { mundaneoracle: 2, reverseoptimist: 1 },
        },
        {
          id: "q4-b",
          text: "不吉の前兆かも...",
          points: { cosmicworrier: 2, overthinker: 1 },
        },
        {
          id: "q4-c",
          text: "猫も忙しいんだな",
          points: { inversefortune: 2, calmchaos: 1 },
        },
        {
          id: "q4-d",
          text: "写真を撮ってSNSに載せる",
          points: { accidentalprophet: 2, mundaneoracle: 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "今の悩みを一言で言うと?",
      choices: [
        {
          id: "q5-a",
          text: "考えすぎて動けない",
          points: { overthinker: 2, cosmicworrier: 1 },
        },
        {
          id: "q5-b",
          text: "何を悩んでいるかわからない",
          points: { paradoxmaster: 2, calmchaos: 1 },
        },
        {
          id: "q5-c",
          text: "特に悩んでいないのが悩み",
          points: { inversefortune: 2, mundaneoracle: 1 },
        },
        {
          id: "q5-d",
          text: "悩みが多すぎて選べない",
          points: { cosmicworrier: 2, accidentalprophet: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "もし1つだけ超能力が使えるなら?",
      choices: [
        {
          id: "q6-a",
          text: "未来が見える",
          points: { accidentalprophet: 2, cosmicworrier: 1 },
        },
        {
          id: "q6-b",
          text: "他人の考えがわかる",
          points: { overthinker: 2, inversefortune: 1 },
        },
        {
          id: "q6-c",
          text: "時間を止められる",
          points: { calmchaos: 2, paradoxmaster: 1 },
        },
        {
          id: "q6-d",
          text: "天気を操れる",
          points: { mundaneoracle: 2, reverseoptimist: 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "最近一番「運がいい」と感じた瞬間は?",
      choices: [
        {
          id: "q7-a",
          text: "電車にギリギリ間に合った",
          points: { inversefortune: 2, accidentalprophet: 1 },
        },
        {
          id: "q7-b",
          text: "特に思い出せない",
          points: { mundaneoracle: 2, calmchaos: 1 },
        },
        {
          id: "q7-c",
          text: "悪いことが起きなかった",
          points: { reverseoptimist: 2, paradoxmaster: 1 },
        },
        {
          id: "q7-d",
          text: "何かあったはずだけど忘れた",
          points: { paradoxmaster: 2, overthinker: 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "この占いの結果に期待していること",
      choices: [
        {
          id: "q8-a",
          text: "面白いことが書いてあるといいな",
          points: { reverseoptimist: 2, mundaneoracle: 1 },
        },
        {
          id: "q8-b",
          text: "当たっていてほしい",
          points: { accidentalprophet: 2, overthinker: 1 },
        },
        {
          id: "q8-c",
          text: "何でもいい、楽しめれば",
          points: { calmchaos: 2, inversefortune: 1 },
        },
        {
          id: "q8-d",
          text: "当たらなくてもネタになればいい",
          points: { mundaneoracle: 2, cosmicworrier: 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "reverseoptimist",
      title: "逆オプティミスト",
      description:
        "一般的な占いなら「今日は素晴らしい一日になるでしょう!」と言うところですが、実は逆です。今日は何かうまくいかないことが起きるでしょう。そしてそれこそがあなたの幸運です。転んだ先に四つ葉のクローバーがある人生。コメディ映画の序盤だと思ってお楽しみください。",
      color: "#f59e0b",
      icon: "\u{1F504}",
      detailedContent: {
        traits: [
          "ちょっとした失敗を「まあ、こういうこともある」と数秒で切り替えられる。引きずらない。",
          "予定が崩れたとき、むしろ「これはネタになる」と思って少し楽しんでいる自分がいる。",
          "悪いニュースを聞いても、気づけば「でもこっちはよかった」という話をしている。",
          "小さなラッキーを見つけるのが得意。誰もが気にしないところに「お、いいな」を見つける。",
        ],
        behaviors: [
          "電車が遅延して乗り換えを逃したとき、「今日の出来事の1ページ目だ」とちょっと笑っている。",
          "何かうまくいかなかった話を友人にするとき、気づいたら面白エピソードとして話していた。",
          "雨に濡れながら「まあいっか、濡れたならもう濡れよう」と割り切って歩いたことがある。",
        ],
        advice:
          "今日うまくいかなかったことを、ひとつだけ誰かに話してみて。笑いに変えるのがあなたの得意技で、それは場の空気を明るくする力になっている。",
      },
    },
    {
      id: "overthinker",
      title: "考えすぎ予報士",
      description:
        "一般的な占いなら「直感を信じましょう」と言うところですが、あなたの場合は逆です。考えれば考えるほど外れるという宇宙の法則が適用されています。今日のアドバイス: 3秒以上悩んだらコインを投げてください。コインの結果も無視して直感で決めるのが最善です。",
      color: "#7c3aed",
      icon: "\u{1F9E0}",
      detailedContent: {
        traits: [
          "物事を決めるとき、頭の中で「でもこういうケースもある」「いや、それも考慮したか」という会話が延々と続く。",
          "「なんとなくこれがいい」という感覚があっても、それに根拠を求めてしまって素直に動けないことがある。",
          "誰かのひとことが頭に残って、何日後かにふと「あれはどういう意味だったんだろう」と考え始める。",
        ],
        behaviors: [
          "メニューを決めるのに3分かかった。でも食べた後は「これでよかった」と思える。",
          "返信の文面を5回書き直してから送った。相手は1秒で読んで「了解!」と返してきた。",
          "「この方向でいいか」と地図を確認してから歩き出したのに、30秒後にもう一度確認した。",
          "寝る前に今日の会話を再生して、「あのとき違う言い方をすればよかった」と修正案を考えていた。",
        ],
        advice:
          "何かひとつ、今日中に「3秒で決める」を試してみて。小さなことでいい。その結果、どんな気持ちになったかを覚えておいてほしい。",
      },
    },
    {
      id: "cosmicworrier",
      title: "宇宙規模の心配性",
      description:
        "一般的な占いなら「心配は無用です!」と言うところですが、あなたの心配のスケールは宇宙レベルなので、その助言では足りません。「明日の天気」ではなく「太陽の寿命」を心配するあなたには、50億年後にカレンダーをセットすることをお勧めします。",
      color: "#1e40af",
      icon: "\u{1F30C}",
      detailedContent: {
        traits: [
          "「最悪の場合」を想像する癖がある。そして想像がどんどん壮大な方向に広がっていく。",
          "心配の対象が自分の身近なことから、社会、地球、宇宙へと飛躍することがある。本人は真剣。",
          "何か大きなことが起きると「これ、もっと深い問題の入口では?」と思って調べ始める。",
        ],
        behaviors: [
          "ニュースを見ていたら、気づいたら「地球温暖化のその先」を調べていて1時間経っていた。",
          "旅行の準備をしながら「でも飛行機が…」「でも現地で…」と心配リストが増えていく。それでも行く。",
          "友人から「心配しすぎだよ」と言われたが、「心配しすぎる人が事前に対処してきたから文明が続いたのでは?」と思っている。",
          "何かうまくいったとき、次の心配をすでに始めている。祝う時間が短い。",
        ],
        advice:
          "今一番気になっている心配を、紙に書き出してみて。書いたら「これは今日できること?」と問いかけてみると、動けることが見えてくる。",
      },
    },
    {
      id: "paradoxmaster",
      title: "パラドクスの達人",
      description:
        "一般的な占いなら「今日の運勢は大吉!」と断言するところですが、あなたの運勢は量子力学的状態にあり、観測するまで確定しません。つまり、この占いを読んだ時点で運勢が確定してしまいました。読まなければ永遠に大吉の可能性があったのに。",
      color: "#059669",
      icon: "\u{267E}\u{FE0F}",
      detailedContent: {
        traits: [
          "「AかBか」という選択肢に「Cという見方もある」と付け加えずにはいられない。",
          "「これが正しい」と言われると「でも正しいの基準って?」という問いが浮かぶ。天邪鬼ではなく本気。",
          "物事を決めるのが遅いが、一度決めたら意外と揺るがない。迷うプロセスが丁寧なのだ。",
          "矛盾した2つのことが同時に「あり」だと感じることがある。二項対立が苦手。",
        ],
        behaviors: [
          "「好きな食べ物は?」と聞かれて「そのときの気分によって変わるんだよね」と答えた。",
          "「どっちが好き?」という二択に「うーん、状況による」と返してしまい、相手が少し困っていた。",
          "会議で「その逆の立場で考えると?」と問いかけて、議論が一段階深くなったことがある。",
        ],
        advice:
          "今日誰かと話すとき、あえて「逆の立場だとどうなる?」を一度だけ口に出してみて。あなたの問いかけが、その場の思考を広げる起点になる。",
      },
    },
    {
      id: "accidentalprophet",
      title: "うっかり預言者",
      description:
        "一般的な占いなら占い師があなたの未来を予言しますが、実はあなた自身が占い師より正確な予言者です。ただし自覚がないため、重要な予言を「ただの独り言」として処理しています。今日ふと口にした言葉をメモしてください。3日以内に1つは当たります。",
      color: "#db2777",
      icon: "\u{1F52E}",
      detailedContent: {
        traits: [
          "「なんとなくそんな気がしてた」という場面が人より多い。でも事前に言わないから誰も知らない。",
          "直感で動いた結果がよかったとき、後から「あのとき何かを感じていた」と気づく。",
          "人の話を聞きながら「これ、こういう展開になりそう」と思って、だいたいその通りになる。",
        ],
        behaviors: [
          "「なんとなく今日は傘持っていこう」と思って出かけたら、昼から雨が降ってきた。",
          "友人が「実は…」と話し始める前に、なんとなくその内容を予測していたことがある。当たっていた。",
          "独り言で「あ、これうまくいかないかも」と言ったら本当にそうなって、あとで「言ったじゃん」と思った。誰にも言っていないけど。",
          "「今日あの人から連絡くるかも」とふと思ったら、夕方に本当にメッセージが来た。",
        ],
        advice:
          "今日ふと浮かんだ「なんとなく」を、ひとつだけメモしてみて。意識するだけで直感の精度が上がっていく。",
      },
    },
    {
      id: "calmchaos",
      title: "平穏なるカオス",
      description:
        "一般的な占いなら「波乱の一日に注意!」と言うところですが、あなたの場合、波乱はあなたの周囲で勝手に起きて勝手に収まります。台風の目のように静かなあなたは、嵐の中で紅茶をすすっていてください。お茶が入る頃には問題の半分は自然解決しています。",
      color: "#0891b2",
      icon: "\u{1F375}",
      detailedContent: {
        traits: [
          "周りが騒がしくても、自分の中心は意外と落ち着いている。パニックになりにくい。",
          "「どうしよう!」という声を聞いたとき、まず状況を確認してから動く。焦らない。",
          "感情的になることが少ない分、冷静な観察眼がある。後から「あのときこうだったね」とまとめられる。",
        ],
        behaviors: [
          "周りが「どうする、どうする」と盛り上がっているとき、ひとりで静かに解決策を考えていた。",
          "グループチャットが混乱しているとき、一言「こういうことじゃない?」と送ったら収束した。",
          "友人に「なんでそんなに落ち着いてるの?」と言われたが、自分では特に意識していなかった。",
          "問題が起きたとき「まず何が事実か」を整理するのが自然にできる。感情より先に論点が見える。",
        ],
        advice:
          "今周りで起きていることのうち、ひとつ「自分が落ち着いて動ける問題」を選んでみて。あなたの静けさは、その場を整える力として活きる。",
      },
    },
    {
      id: "inversefortune",
      title: "逆張りの星の下に",
      description:
        "一般的な占いなら「周りに合わせると吉」と言うところですが、あなたの星は正反対を指しています。みんなが右に行くとき左に行くのがあなたの運命です。誰もいない道には渋滞がないのです。心の中で小さくガッツポーズするだけで十分です。",
      color: "#ea580c",
      icon: "\u{2B50}",
      detailedContent: {
        traits: [
          "流行しているものを勧められると「ちょっと待って、本当に自分に合ってる?」と一度立ち止まる。",
          "多数意見より少数意見の方が気になることがある。見落とされている視点を拾いたくなる。",
          "「みんなそうしてるから」という理由だけでは動けない。理由が腑に落ちないと足が重くなる。",
          "人と違う選択をしたとき、内心「これでよかった」と思うことが多い。",
        ],
        behaviors: [
          "行列ができている店を見て「今じゃなくていいか」と思い、空いている時間にゆっくり行く。",
          "「これ、今みんなハマってるよ」と勧められたコンテンツを、ひとりで静かに楽しんでいた。",
          "プロジェクトで「みんなこの方向で」という流れのとき、別の角度からの懸念をひとつ出した。それが後で役に立った。",
        ],
        advice:
          "今あなたが「あえて選んでいるもの」を、誰かひとりに話してみて。その選択の理由は、聞いた相手の視野を広げるかもしれない。",
      },
    },
    {
      id: "mundaneoracle",
      title: "日常の神託者",
      description:
        "一般的な占いなら壮大なビジョンや運命の転換点を予言するところですが、あなたの神託はもっと身近です。コンビニの新商品、信号のタイミング、自販機のお釣り。この小さな発見の積み重ねが、実は最も確実な幸福への道です。今日見かけた「なんでもないもの」に3秒だけ注目してください。",
      color: "#6b7280",
      icon: "\u{1F4CE}",
      detailedContent: {
        traits: [
          "日常の中に「あ、いいな」を見つけるのが自然にできる。特別なことがなくても充実感がある。",
          "変化に気づくのが早い。「あ、ここ変わったね」「これ前と違う」をさりげなく拾っている。",
          "大きな目標より、今日の小さな積み上げの方が信頼できると感じている。",
        ],
        behaviors: [
          "コンビニに入ったとき、新商品コーナーを必ずチェックする。「これ知ってる?」と誰かに伝えたくなる。",
          "道を歩いていて「この木、前より大きくなった気がする」とふと気づき、少し嬉しくなった。",
          "何気なく選んだルートが「あ、ここ通ってよかった」という発見につながったことが何度かある。",
          "人から「どこかいいところ知ってる?」と聞かれると、派手な場所より「地味だけど好きな場所」を勧めてしまう。",
        ],
        advice:
          "今日の帰り道、いつもと少しだけ違うルートを歩いてみて。あなたが見つける「なんでもない発見」が、今日のいちばんいい話になるかもしれない。",
      },
    },
  ],
};

export default contrarianFortuneQuiz;
