import type { QuizDefinition } from "../types";

/**
 * Point distribution design (7 results x 4 primary slots each = 28 total):
 *
 * Result IDs:
 *   timemagician        (時間魔術師見習い)     - primary in: Q1c, Q2a, Q3a, Q6a
 *   gravityfighter      (重力と戦う者)         - primary in: Q2d, Q3b, Q4a, Q7a
 *   digitalmonk         (デジタル修行僧)       - primary in: Q1a, Q2b, Q5b, Q7b
 *   sleeparchitect      (睡眠建築家)           - primary in: Q3d, Q5a, Q6c, Q7d
 *   conversationsamurai (会話の侍)             - primary in: Q1b, Q2c, Q3c, Q4b
 *   snackphilosopher    (おやつの哲学者)       - primary in: Q1d, Q4c, Q5d, Q6d
 *   weathercontroller   (天候操作係)           - primary in: Q4d, Q5c, Q6b, Q7c
 */
const impossibleAdviceQuiz: QuizDefinition = {
  meta: {
    slug: "impossible-advice",
    title: "達成困難アドバイス診断",
    description:
      "7つの質問であなたの悩みの種類を診断し、正しいけれど実行不可能なアドバイスをお届けします。笑って読み流してください。",
    shortDescription: "あなたに最適な達成困難アドバイスを診断",
    type: "personality",
    category: "personality",
    questionCount: 7,
    icon: "\u{1F4A1}",
    accentColor: "#7c3aed",
    keywords: [
      "達成困難",
      "アドバイス",
      "診断",
      "ユーモア",
      "おもしろ診断",
      "ネタ診断",
    ],
    publishedAt: "2026-03-08T13:00:00+09:00",
    relatedLinks: [
      {
        label: "逆張り運勢診断を受ける",
        href: "/quiz/contrarian-fortune",
      },
      {
        label: "斜め上の相性診断を受ける",
        href: "/quiz/unexpected-compatibility",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。質問と結果はAIが創作したユーモアコンテンツです。アドバイスは実行しないでください。",
  },
  questions: [
    {
      id: "q1",
      text: "友人と待ち合わせ。15分前に着いたらどう過ごす?",
      choices: [
        {
          id: "q1-a",
          text: "スマホでSNSをチェック",
          points: { digitalmonk: 2, sleeparchitect: 1 },
        },
        {
          id: "q1-b",
          text: "周囲の人間観察をする",
          points: { conversationsamurai: 2, snackphilosopher: 1 },
        },
        {
          id: "q1-c",
          text: "\u300Cもっと遅く出ればよかった\u300Dと計算し始める",
          points: { timemagician: 2, gravityfighter: 1 },
        },
        {
          id: "q1-d",
          text: "近くのコンビニでおやつを買いに行く",
          points: { snackphilosopher: 2, weathercontroller: 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "旅行の計画を立てるとき、最初にすることは?",
      choices: [
        {
          id: "q2-a",
          text: "まず日程を確保する",
          points: { timemagician: 2, digitalmonk: 1 },
        },
        {
          id: "q2-b",
          text: "行きたい場所の写真を眺める",
          points: { digitalmonk: 2, conversationsamurai: 1 },
        },
        {
          id: "q2-c",
          text: "一緒に行く人と相談する",
          points: { conversationsamurai: 2, timemagician: 1 },
        },
        {
          id: "q2-d",
          text: "体力的に可能か考える",
          points: { gravityfighter: 2, sleeparchitect: 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "突然1時間の自由時間ができた。何をする?",
      choices: [
        {
          id: "q3-a",
          text: "溜まっていたタスクを片付ける",
          points: { timemagician: 2, digitalmonk: 1 },
        },
        {
          id: "q3-b",
          text: "散歩に出かける",
          points: { gravityfighter: 2, weathercontroller: 1 },
        },
        {
          id: "q3-c",
          text: "誰かに連絡してみる",
          points: { conversationsamurai: 2, gravityfighter: 1 },
        },
        {
          id: "q3-d",
          text: "とりあえず横になる",
          points: { sleeparchitect: 2, snackphilosopher: 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "レストランでメニューを選ぶとき、決め手になるのは?",
      choices: [
        {
          id: "q4-a",
          text: "カロリーや栄養バランス",
          points: { gravityfighter: 2, sleeparchitect: 1 },
        },
        {
          id: "q4-b",
          text: "一緒にいる人のおすすめ",
          points: { conversationsamurai: 2, digitalmonk: 1 },
        },
        {
          id: "q4-c",
          text: "写真映えするかどうか",
          points: { snackphilosopher: 2, weathercontroller: 1 },
        },
        {
          id: "q4-d",
          text: "今日の気分",
          points: { weathercontroller: 2, timemagician: 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "理想の自分を動物に例えると?",
      choices: [
        {
          id: "q5-a",
          text: "猫（自由気まま）",
          points: { sleeparchitect: 2, digitalmonk: 1 },
        },
        {
          id: "q5-b",
          text: "鷲（力強く高く飛ぶ）",
          points: { digitalmonk: 2, gravityfighter: 1 },
        },
        {
          id: "q5-c",
          text: "イルカ（賢くて社交的）",
          points: { weathercontroller: 2, conversationsamurai: 1 },
        },
        {
          id: "q5-d",
          text: "クマ（食べることと寝ることが好き）",
          points: { snackphilosopher: 2, sleeparchitect: 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "日曜の夜、明日が月曜だと気づいたときの気持ちは?",
      choices: [
        {
          id: "q6-a",
          text: "まだやり残したことがある焦り",
          points: { timemagician: 2, gravityfighter: 1 },
        },
        {
          id: "q6-b",
          text: "別に何も感じない",
          points: { weathercontroller: 2, conversationsamurai: 1 },
        },
        {
          id: "q6-c",
          text: "もう少し起きていたい",
          points: { sleeparchitect: 2, snackphilosopher: 1 },
        },
        {
          id: "q6-d",
          text: "夜食でも食べて気を紛らわす",
          points: { snackphilosopher: 2, digitalmonk: 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "電車で隣の人が寝て寄りかかってきた。どうする?",
      choices: [
        {
          id: "q7-a",
          text: "そっと体をずらす",
          points: { gravityfighter: 2, timemagician: 1 },
        },
        {
          id: "q7-b",
          text: "気にせず自分もスマホを見る",
          points: { digitalmonk: 2, sleeparchitect: 1 },
        },
        {
          id: "q7-c",
          text: "起こさないようにじっとしている",
          points: { weathercontroller: 2, conversationsamurai: 1 },
        },
        {
          id: "q7-d",
          text: "自分も寝る",
          points: { sleeparchitect: 2, gravityfighter: 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "timemagician",
      title: "時間魔術師見習い",
      description:
        "あなたには時間が足りていません。正確には、時間はあるのに消えています。\n\n\u3010本日のアドバイス\u3011\n毎朝4時に起きて、最初の2時間を\u300E何もしない時間\u300Fとして確保してください。スマホを見たら失格。目を閉じるのも禁止（寝るので）。\n\nこれを1年続けると時間の使い方が劇的に変わります。主に睡眠時間が劇的に減るという形で。",
      icon: "\u23F0",
      color: "#7c3aed",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
    {
      id: "gravityfighter",
      title: "重力と戦う者",
      description:
        "あなたの体は重力に対して降伏交渉中です。まだ間に合います。\n\n\u3010本日のアドバイス\u3011\n全ての移動を1.5倍速で行ってください。歩くときは早歩き、階段は一段飛ばし、椅子に座るときはスクワット3回。エレベーターではその場で足踏み。\n\n1週間後、体力がつく前に靴底が減ります。",
      icon: "\u{1F3CB}\uFE0F",
      color: "#ea580c",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
    {
      id: "digitalmonk",
      title: "デジタル修行僧",
      description:
        "あなたの集中力は、通知音のたびに蒸発しています。\n\n\u3010本日のアドバイス\u3011\n毎週日曜を\u300Eデジタル断食の日\u300Fにしてください。スマホ、PC、電子レンジのタイマー表示まで、すべてのデジタル表示から目を背けます。時間は太陽の位置で判断。曇りの日は時間の概念を手放してください。\n\n3ヶ月後、太陽の高さから時刻を15分以内の誤差で当てられるようになります。それ以外のスキルは特に身につきません。",
      icon: "\u{1F4F5}",
      color: "#059669",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
    {
      id: "sleeparchitect",
      title: "睡眠建築家",
      description:
        "あなたの最大の課題は睡眠です。寝たいのに寝られない、起きたいのに起きられない。\n\n\u3010本日のアドバイス\u3011\n寝室の温度を18.3\u00B0Cに固定し（NASA推奨）、枕の角度を分度器で15度に調整。就寝1時間前からブルーライトカットメガネを装着し、布団に入ったら羊ではなく素数を数えてください。\n\nこれらすべてを守ると、準備に疲れてすぐ寝られます。",
      icon: "\u{1F634}",
      color: "#1e40af",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
    {
      id: "conversationsamurai",
      title: "会話の侍",
      description:
        "あなたの課題は対人関係です。言いたいことが言えない、言わなくていいことを言ってしまう。\n\n\u3010本日のアドバイス\u3011\nすべての会話を俳句（5-7-5）で行ってください。\u300E今日の会議（5）議題が多くて（7）帰りたい（5）\u300F。断り文句も俳句にすると角が立ちません。\n\n相手も俳句で返し始める頃には、職場の人間関係が文学的なものに昇華されています。",
      icon: "\u2694\uFE0F",
      color: "#db2777",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
    {
      id: "weathercontroller",
      title: "天候操作係",
      description:
        "あなたのストレスは、自分ではどうにもならないものに由来しています。\n\n\u3010本日のアドバイス\u3011\n毎朝、窓の外を見る前にその日の天気を\u300E宣言\u300Fしてください。実際の天気と一致したらあなたには天候操作の才能があります。\n\n1年続けると的中率は約30%になります。これは日本の平均晴天率とほぼ同じですが、\u300E意外と当たる人\u300Fという評判は得られます。",
      icon: "\u{1F326}\uFE0F",
      color: "#0891b2",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
    {
      id: "snackphilosopher",
      title: "おやつの哲学者",
      description:
        "あなたのストレス解消法は食にあります。ただし量ではなく、タイミングの問題です。\n\n\u3010本日のアドバイス\u3011\nすべての間食を\u300E哲学的行為\u300Fとして行ってください。チョコを食べる前に\u300Eなぜ今チョコなのか\u300Fを30秒考え、食べた後に\u300Eチョコとは何だったのか\u300Fを30秒振り返ります。\n\n1ヶ月後、おやつの回数は変わりませんが、一粒の満足度が哲学的に深まります。",
      icon: "\u{1F369}",
      color: "#f59e0b",
      recommendation:
        "\u203B このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。",
    },
  ],
};

export default impossibleAdviceQuiz;
