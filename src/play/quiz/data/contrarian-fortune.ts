import type {
  QuizDefinition,
  ContrarianFortuneDetailedContent,
} from "../types";

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
      color: "#b45309",
      icon: "\u{1F504}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "転んだ先に四つ葉のクローバーがある人。",
        coreSentence:
          "普通の占いなら「今日は最高の一日!」と言うところですが、あなたは失敗からこそ運を拾います。",
        behaviors: [
          "電車が遅延して乗り換えを逃したとき、「今日のエピソード1話目だ」と心の中でちょっと笑っている。",
          "何かうまくいかなかった話を友人にしたら、気づいたら爆笑の鉄板ネタに昇華されていた。",
          "雨に濡れながら「もうどうせ濡れてるし」と割り切って歩き出すタイプ。スパッと早い。",
          "朝から小さなアクシデントが続くと、「今日は後半に巻き返す日だな」と前向きに解釈する。",
        ],
        persona:
          "失敗をネタに変えるのが染み付いているせいで、転んでも「あ、これ話せる」と思ってしまう体質。悲劇を喜劇に変換する速度が異様に速く、悲しみのピークより前に「どう話すか」を考え始めることも多い。本人は楽天家というより「コメディ映画の主人公として生きている」感覚に近いようで、アクシデントをむしろ人生の演出として楽しんでいる節がある。",
        thirdPartyNote:
          "このタイプの人と一緒にいると、愚痴を聞いているはずが気づいたら笑っている、という体験をします。失敗談を話す本人が一番楽しそうなので、聞く側も引きずれない。「大丈夫?」と聞こうとしたら、もう次の話に移っていた、ということもしばしば。一緒にいると不思議と場が明るくなります。",
        humorMetrics: [
          { label: "ネタ化までの速度", value: "転倒から約3秒" },
          { label: "失敗エピソードの在庫数", value: "常時5本以上" },
        ],
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "overthinker",
      title: "考えすぎ予報士",
      description:
        "一般的な占いなら「直感を信じましょう」と言うところですが、あなたの場合は逆です。考えれば考えるほど外れるという宇宙の法則が適用されています。今日のアドバイス: 3秒以上悩んだらコインを投げてください。コインの結果も無視して直感で決めるのが最善です。",
      color: "#7c3aed",
      icon: "\u{1F9E0}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "考え始めると、宇宙の果てまで思考が飛んでいく。",
        coreSentence:
          "普通の占いなら「直感を信じよう!」と言いますが、あなたには逆効果です。考えるほど迷宮に入ります。",
        behaviors: [
          "ランチのメニューを決めるのに3分かかった。でも食べ終わると「これでよかった」と納得している。",
          "LINEの返信を5回書き直してから送ったら、相手から「了解!」の1語が返ってきた。",
          "「この方向でいいか」と地図を確認してから歩き出したのに、30秒後にもう一度確認していた。",
          "寝る前に今日の会話を脳内再生して、「あのとき違う言い方をすればよかった」と修正案を作成している。",
        ],
        persona:
          "「でもこういうケースもある」「いや、それも考慮したか」という内部会議が常時開催中。直感はあるのに、その直感に根拠を求めてしまうため素直に動けない。誰かのひとことが何日後かに「あれはどういう意味だったんだろう」と突然起動することもある。ただ、考え抜いた末の選択は意外と当たる。これがこのタイプの密かな強みだ。",
        thirdPartyNote:
          "このタイプの友人に「どこか食べに行こう」と言うと、選択肢が提示されます。候補リストつきで。それぞれのメリット・デメリットも整理されている場合があります。「どこでもいいよ」のつもりで聞いたのに気づいたら本格議論になっていた、という経験をした人は多いはず。でも最終的に外れた店には行かないので、安心して任せてください。",
        humorMetrics: [
          { label: "1つの決断にかかる思考ループ回数", value: "平均7回" },
          { label: "寝る前の反省会の所要時間", value: "30分〜無制限" },
        ],
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "cosmicworrier",
      title: "宇宙規模の心配性",
      description:
        "一般的な占いなら「心配は無用です!」と言うところですが、あなたの心配のスケールは宇宙レベルなので、その助言では足りません。「明日の天気」ではなく「太陽の寿命」を心配するあなたには、50億年後にカレンダーをセットすることをお勧めします。",
      color: "#1e40af",
      icon: "\u{1F30C}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "心配のスケールが、ちょっと太陽系を超えている。",
        coreSentence:
          "一般的な占いなら「心配は無用!」と言うところですが、あなたには通じません。心配のスケールが宇宙レベルなので。",
        behaviors: [
          "ニュースを見ていたら気づいたら「地球温暖化のその先の地球」を調べていて1時間経っていた。",
          "旅行の準備中「でも飛行機が…」「でも現地で…」と心配リストが増え続ける。それでも行く。",
          "「心配しすぎだよ」と言われたが、「心配してきたから文明が続いたのでは?」と本気で思っている。",
          "何かうまくいったとき、すでに次の心配を始めている。祝う時間が極端に短い。",
        ],
        persona:
          "「最悪の場合」を想像する癖があり、その想像が気づくと太陽の寿命や宇宙の熱的死まで広がっていく。本人はいたって真剣なのだが、スケールが大きすぎて周囲はつい笑ってしまう。でも実際に問題が起きたとき、この人はすでに対策を考えていた。準備しておけば怖くないというのが根底にあるから、心配は止まらないし、止める気もない。",
        thirdPartyNote:
          "このタイプの人と旅行に行くと、準備が完璧です。緊急連絡先、保険、天気予報のバックアッププラン、現地の病院情報——「そこまで要る?」という段階まで調べてきます。おかげで何かあっても安心。ただ旅行前日に「本当に飛行機大丈夫かな」と3回聞いてくるので、「大丈夫、飛ぶよ」と3回答える準備はしておいてください。",
        humorMetrics: [
          { label: "心配の射程距離", value: "太陽系外縁部まで" },
          { label: "最悪シナリオの想定数", value: "毎日3件（控えめ見積もり）" },
        ],
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "paradoxmaster",
      title: "パラドクスの達人",
      description:
        "一般的な占いなら「今日の運勢は大吉!」と断言するところですが、あなたの運勢は量子力学的状態にあり、観測するまで確定しません。つまり、この占いを読んだ時点で運勢が確定してしまいました。読まなければ永遠に大吉の可能性があったのに。",
      color: "#047857",
      icon: "\u{267E}\u{FE0F}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "「AかBか」に、いつもCを持ち込んでくる人。",
        coreSentence:
          "普通の占いなら「答えはひとつ!」と断言しますが、あなたには量子状態の運勢が適用されています。",
        behaviors: [
          "「好きな食べ物は?」と聞かれて「そのときの気分によって変わる」と答え、相手が少し困っていた。",
          "「どっちが好き?」という二択に「状況による」と返してしまうのが標準仕様。",
          "会議で「その逆の立場から考えると?」と問いかけたら、議論が一段階深くなった。",
          "矛盾した2つのことが同時に成立すると感じることがある。本人はまったく矛盾を感じていない。",
        ],
        persona:
          "「これが正しい」と言われると、すぐに「でも正しさの基準って?」という問いが浮かぶ。天邪鬼ではなく、本気でそう思っている。物事を決めるのは遅いが、一度決めたら意外と揺るがない。じっくり迷うプロセスが丁寧なだけで、着地は確かだ。矛盾した2つのことが同時に成立すると感じることがあり、それを問題だとは思っていない。そのまま持ち歩ける懐の深さが、このタイプの静かな強みだ。",
        thirdPartyNote:
          "このタイプの人と議論すると、「そういう見方もあるか」と視野が広がります。ただ単純に「どっちがいい?」と聞いても「状況による」と返ってくるので、答えが欲しいときは条件を指定してから聞くのがコツです。一緒にいると深い話になりやすく、気づいたら2時間経っていた、という経験をした人も多いはず。",
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "accidentalprophet",
      title: "うっかり預言者",
      description:
        "一般的な占いなら占い師があなたの未来を予言しますが、実はあなた自身が占い師より正確な予言者です。ただし自覚がないため、重要な予言を「ただの独り言」として処理しています。今日ふと口にした言葉をメモしてください。3日以内に1つは当たります。",
      color: "#db2777",
      icon: "\u{1F52E}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "一番正確な預言者は、本人だということに気づいていない。",
        coreSentence:
          "一般的な占いなら占い師が予言しますが、あなたこそが一番当たる預言者です。自覚がないだけで。",
        behaviors: [
          "「なんとなく今日は傘持っていこう」と出かけたら昼から雨が降ってきた。荷物にはなったが濡れなかった。",
          "友人が「実は…」と話し始める前に、なんとなく内容を予測していた。当たっていた。",
          "独り言で「これうまくいかないかも」とつぶやいたら本当にそうなって、心の中で「言ったじゃん」と思った。",
          "「今日あの人から連絡くるかも」とふと思ったら、夕方に本当にメッセージが届いた。",
        ],
        persona:
          "「なんとなくそんな気がしてた」という場面が人より多いのに、事前に言わないから誰も知らない。直感で動いた結果がよかったとき、後から「あのときちゃんと感じていた」と気づく。予言の精度は高いが、記録をつけていないせいで証拠がない。「ちゃんと言っておけばよかった」と思いながら、また次の直感を誰にも言わずに持ち歩いている。",
        thirdPartyNote:
          "このタイプの人は、「なんか嫌な予感」「なんかうまくいきそう」という言葉を独り言でよく言います。後から「言ってたじゃん」と言われても、当人は「言った記憶がない」ことが多い。一緒にいると、その独り言を記録しておくと面白い検証になります。当たり率が意外と高いので、重要な場面では一度聞いてみる価値があります。",
        humorMetrics: [
          {
            label: "的中率（自己申告）",
            value: "「そういえば当たってた」が多め",
          },
          { label: "予言の記録件数", value: "0件（記録する前に忘れる）" },
        ],
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "calmchaos",
      title: "平穏なるカオス",
      description:
        "一般的な占いなら「波乱の一日に注意!」と言うところですが、あなたの場合、波乱はあなたの周囲で勝手に起きて勝手に収まります。台風の目のように静かなあなたは、嵐の中で紅茶をすすっていてください。お茶が入る頃には問題の半分は自然解決しています。",
      color: "#0e7490",
      icon: "\u{1F375}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "嵐の中で紅茶をすすっている人。",
        coreSentence:
          "普通の占いなら「波乱に注意!」と言うところですが、あなたの周りで起きた波乱は大抵自然に収まります。",
        behaviors: [
          "周りが「どうする、どうする」と慌てているとき、一人だけおやつを食べ始めていた。",
          "緊急事態だと判明した瞬間、なぜかまず紅茶を淹れた。お茶が入る頃には問題が半分解決していた。",
          "グループチャットが混乱しているとき「こういうことじゃない?」と一言送ったら収束した。",
          "友人に「なんでそんなに落ち着いてるの?」と言われたが、自分では特に意識していなかった。",
        ],
        persona:
          "嵐の目のように静かで、周囲が「大変だ大変だ」と盛り上がるほど、なぜかのほほんとしてしまう。本人は焦っているつもりなのだが、傍から見るとまるで気にしていないように見える。不思議なことに、その呑気さが場を落ち着かせることが多く、気づけば問題が収まっている。何もしていないのに解決した、というパターンが繰り返されている。",
        thirdPartyNote:
          "このタイプの人がいると、なぜか場が落ち着きます。グループで誰かが焦っているとき、この人は静かに「で、今できることは?」と言います。その一言で議論が前に進む、という経験を周囲はよくします。一緒にいると安心感があります。ただ「なんでそんなに平静なの」と聞いても「え、普通じゃない?」と返ってくるので、そこだけ少し不思議です。",
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "inversefortune",
      title: "逆張りの星の下に",
      description:
        "一般的な占いなら「周りに合わせると吉」と言うところですが、あなたの星は正反対を指しています。みんなが右に行くとき左に行くのがあなたの運命です。誰もいない道には渋滞がないのです。心の中で小さくガッツポーズするだけで十分です。",
      color: "#c2410c",
      icon: "\u{2B50}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "みんなが右に行くとき、左の道に獣道を見つける人。",
        coreSentence:
          "普通の占いなら「周りに合わせると吉」と言いますが、あなたの星は正反対を指しています。",
        behaviors: [
          "行列ができている店を見て「今じゃなくていいか」と判断し、空いた時間にゆっくり行く。",
          "「これ今みんなハマってるよ」と勧められたコンテンツを、流行が落ち着いてからひっそり楽しんでいた。",
          "プロジェクトで「みんなこの方向で」という流れのとき、別の角度からの懸念を一つ出した。後で役に立った。",
          "「みんなそうしてるから」という理由だけでは動けない。理由が腑に落ちないと足が重くなる。",
        ],
        persona:
          "流行しているものを勧められると、「ちょっと待って、本当に自分に合ってる?」と一度立ち止まる。多数意見より少数意見の方が気になり、見落とされている視点を拾いたくなる。人と違う選択をしたとき、内心「これでよかった」と感じることが多く、後から正解だったと証明されることもある。誰もいない道には渋滞がない、というのが身に染みているタイプだ。",
        thirdPartyNote:
          "このタイプの人に「おすすめを教えて」と聞くと、人気店や定番スポットは出てきません。みんなが行かない方向に向かって、独自の選択をしているからです。流行しているものを避けた結果として見つけた場所なので、逆張りの精度が高い。一緒にいると、定番ルートでは絶対に行き着かない発見があります。",
        humorMetrics: [
          {
            label: "混雑ピーク後に行動するまでの待機時間",
            value: "だいたい2週間",
          },
        ],
      } satisfies ContrarianFortuneDetailedContent,
    },
    {
      id: "mundaneoracle",
      title: "日常の神託者",
      description:
        "一般的な占いなら壮大なビジョンや運命の転換点を予言するところですが、あなたの神託はもっと身近です。コンビニの新商品、信号のタイミング、自販機のお釣り。この小さな発見の積み重ねが、実は最も確実な幸福への道です。今日見かけた「なんでもないもの」に3秒だけ注目してください。",
      color: "#6b7280",
      icon: "\u{1F4CE}",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "コンビニの新商品に、運命を見る人。",
        coreSentence:
          "一般的な占いなら壮大な運命を語りますが、あなたの神託はもっと身近で、もっと確実です。",
        behaviors: [
          "コンビニに入るたびに新商品コーナーを確認している。「これ知ってる?」と誰かに伝えたくなる。",
          "道を歩いていて「この木、前より大きくなった気がする」とふと気づき、少し嬉しくなった。",
          "何気なく選んだルートが「ここ通ってよかった」という発見につながったことが何度かある。",
          "信号待ちのあいだに近くの建物が変わっていたことに気づき、「いつから?」と気になってしばらく調べた。",
        ],
        persona:
          "日常の中に「あ、いいな」を見つけるのが自然にできる。特別なことがなくても充実感がある。変化に気づくのが早く、「ここ変わったね」「これ前と違う」をさりげなく拾っている。大きな目標より今日の小さな積み上げの方が信頼できると感じていて、それが着実に積み重なっていく。日常の解像度が一段高く、見えているものが他の人より少し多い。それがこのタイプの静かな豊かさだ。",
        thirdPartyNote:
          "このタイプの人と一緒に街を歩くと、「あ、ここ変わった」「この店、前からある?」という発見が増えます。同じ道を歩いているはずなのに、見えているものが違う。「なんでそんなに気づくの?」と聞くと「え、いつも見てるから」と答えます。一緒にいると、見慣れた日常がちょっとだけ新鮮になります。",
        humorMetrics: [
          {
            label: "コンビニ立ち寄り頻度",
            value: "週3〜（新商品チェック込み）",
          },
          {
            label: "「あ、ここ変わった」の発見数",
            value: "散歩1回につき平均2件",
          },
        ],
      } satisfies ContrarianFortuneDetailedContent,
    },
  ],
};

export default contrarianFortuneQuiz;
