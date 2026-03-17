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
    },
    {
      id: "overthinker",
      title: "考えすぎ予報士",
      description:
        "一般的な占いなら「直感を信じましょう」と言うところですが、あなたの場合は逆です。考えれば考えるほど外れるという宇宙の法則が適用されています。今日のアドバイス: 3秒以上悩んだらコインを投げてください。コインの結果も無視して直感で決めるのが最善です。",
      color: "#7c3aed",
      icon: "\u{1F9E0}",
    },
    {
      id: "cosmicworrier",
      title: "宇宙規模の心配性",
      description:
        "一般的な占いなら「心配は無用です!」と言うところですが、あなたの心配のスケールは宇宙レベルなので、その助言では足りません。「明日の天気」ではなく「太陽の寿命」を心配するあなたには、50億年後にカレンダーをセットすることをお勧めします。",
      color: "#1e40af",
      icon: "\u{1F30C}",
    },
    {
      id: "paradoxmaster",
      title: "パラドクスの達人",
      description:
        "一般的な占いなら「今日の運勢は大吉!」と断言するところですが、あなたの運勢は量子力学的状態にあり、観測するまで確定しません。つまり、この占いを読んだ時点で運勢が確定してしまいました。読まなければ永遠に大吉の可能性があったのに。",
      color: "#059669",
      icon: "\u{267E}\u{FE0F}",
    },
    {
      id: "accidentalprophet",
      title: "うっかり預言者",
      description:
        "一般的な占いなら占い師があなたの未来を予言しますが、実はあなた自身が占い師より正確な予言者です。ただし自覚がないため、重要な予言を「ただの独り言」として処理しています。今日ふと口にした言葉をメモしてください。3日以内に1つは当たります。",
      color: "#db2777",
      icon: "\u{1F52E}",
    },
    {
      id: "calmchaos",
      title: "平穏なるカオス",
      description:
        "一般的な占いなら「波乱の一日に注意!」と言うところですが、あなたの場合、波乱はあなたの周囲で勝手に起きて勝手に収まります。台風の目のように静かなあなたは、嵐の中で紅茶をすすっていてください。お茶が入る頃には問題の半分は自然解決しています。",
      color: "#0891b2",
      icon: "\u{1F375}",
    },
    {
      id: "inversefortune",
      title: "逆張りの星の下に",
      description:
        "一般的な占いなら「周りに合わせると吉」と言うところですが、あなたの星は正反対を指しています。みんなが右に行くとき左に行くのがあなたの運命です。誰もいない道には渋滞がないのです。心の中で小さくガッツポーズするだけで十分です。",
      color: "#ea580c",
      icon: "\u{2B50}",
    },
    {
      id: "mundaneoracle",
      title: "日常の神託者",
      description:
        "一般的な占いなら壮大なビジョンや運命の転換点を予言するところですが、あなたの神託はもっと身近です。コンビニの新商品、信号のタイミング、自販機のお釣り。この小さな発見の積み重ねが、実は最も確実な幸福への道です。今日見かけた「なんでもないもの」に3秒だけ注目してください。",
      color: "#6b7280",
      icon: "\u{1F4CE}",
    },
  ],
};

export default contrarianFortuneQuiz;
