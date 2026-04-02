import type { QuizDefinition, CompatibilityEntry } from "../types";
export type { CompatibilityEntry };

/**
 * Music Personality Quiz
 *
 * 3-axis personality model based on music listening behavior:
 *   E (Energy):    High-drive (H) vs Relaxed (L)
 *   S (Social):    Sharing (S) vs Personal (P)
 *   X (Explore):   Adventurous (A) vs Deep-dive (D)
 *
 * 8 result types (2^3 combinations):
 *   festival-pioneer     H-S-A  primary in: Q3c, Q4a, Q6a, Q7c, Q9b
 *   playlist-evangelist  H-S-D  primary in: Q1a, Q1c, Q2a, Q5b, Q8c
 *   solo-explorer        H-P-A  primary in: Q1b, Q2b, Q3b, Q7a, Q10b
 *   repeat-warrior       H-P-D  primary in: Q6b, Q7b, Q8b, Q9a, Q9c
 *   bgm-craftsman        L-S-A  primary in: Q2c, Q4d, Q5a, Q7d, Q10c
 *   karaoke-healer       L-S-D  primary in: Q2d, Q3a, Q4c, Q6c, Q10a
 *   midnight-shuffle     L-P-A  primary in: Q1d, Q5c, Q6d, Q8a, Q9d
 *   lyrics-dweller       L-P-D  primary in: Q3d, Q4b, Q5d, Q8d, Q10d
 *
 * Each type has exactly 5 primary (2pt) slots and 5 secondary (1pt) slots.
 */
const musicPersonalityQuiz: QuizDefinition = {
  meta: {
    slug: "music-personality",
    title: "音楽性格診断",
    description:
      "音楽の聴き方、選び方、楽しみ方から、あなたの音楽性格タイプを診断します。全10問の質問に答えて、8つのタイプからあなたにぴったりの音楽性格を見つけましょう。友達との相性診断もできます!",
    shortDescription: "音楽の聴き方であなたの性格タイプを診断。友達との相性も!",
    type: "personality",
    category: "personality",
    questionCount: 10,
    icon: "\u{1F3B5}",
    accentColor: "#7c3aed",
    keywords: [
      "音楽",
      "性格診断",
      "音楽診断",
      "相性診断",
      "音楽タイプ",
      "音楽の聴き方",
      "プレイリスト",
      "フェス",
      "カラオケ",
    ],
    publishedAt: "2026-03-08T13:00:00+09:00",
    relatedLinks: [
      {
        label: "逆張り運勢診断を受ける",
        href: "/play/contrarian-fortune",
      },
      {
        label: "斜め上の相性診断を受ける",
        href: "/play/unexpected-compatibility",
      },
    ],
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。質問と結果はAIが創作したユーモア診断です。楽しみとしてお楽しみください。",
    faq: [
      {
        question: "楽器を演奏する人と聴く専門の人では、結果に違いは出ますか？",
        answer:
          "この診断は演奏スキルではなく、音楽の「聴き方・楽しみ方・人との共有のしかた」を軸にしています。楽器が弾ける人もそうでない人も、自分の音楽体験に照らして答えてみてください。演奏する人でも、聴き方の傾向によってタイプはさまざまです。",
      },
      {
        question: "音楽性格タイプは何種類ありますか？",
        answer:
          "フェス一番乗り族、プレイリスト伝道師、ひとり開拓民、リピート戦士、作業用BGM職人、カラオケ癒し枠、深夜シャッフル系、歌詞の一節で生きてる人の全8種類です。",
      },
      {
        question: "友達との相性診断もできますか？",
        answer:
          "はい。結果ページから友達との相性を診断できます。それぞれのタイプの組み合わせによって、36通りの相性パターンが用意されています。",
      },
      {
        question: "音楽の趣味（ジャンルや好きなアーティスト）は関係しますか？",
        answer:
          "この診断は好きなジャンルやアーティストではなく、音楽の「聴き方・楽しみ方・人との共有のしかた」に注目しています。どんな音楽を聴く人でも診断できます。",
      },
      {
        question: "回答を変えると結果も変わりますか？",
        answer:
          "はい、変わります。各選択肢には異なるポイントが設定されており、合計ポイントが最も高いタイプが結果として表示されます。回答を変えて試してみるのも楽しいです。",
      },
    ],
    seoTitle:
      "音楽性格診断・心理テスト | あなたの性格を音楽ジャンルで例えると？無料",
  },
  questions: [
    {
      id: "q1",
      text: "新曲がリリースされた! まず何をする?",
      choices: [
        {
          id: "q1-a",
          text: "SNSで「出た!」と叫んでからフル再生",
          points: { "playlist-evangelist": 2, "festival-pioneer": 1 },
        },
        {
          id: "q1-b",
          text: "とりあえず1人で黙って全曲通して聴く",
          points: { "solo-explorer": 2, "repeat-warrior": 1 },
        },
        {
          id: "q1-c",
          text: "友達に「これ聴いて」とURLを送る",
          points: { "playlist-evangelist": 2, "karaoke-healer": 1 },
        },
        {
          id: "q1-d",
          text: "気づいたら3日後にシャッフルで流れてくる",
          points: { "midnight-shuffle": 2, "lyrics-dweller": 1 },
        },
      ],
    },
    {
      id: "q2",
      text: "イヤホンをしている時、隣の人に「何聴いてるの?」と聞かれたら?",
      choices: [
        {
          id: "q2-a",
          text: "嬉々として布教タイムが始まる",
          points: { "playlist-evangelist": 2, "festival-pioneer": 1 },
        },
        {
          id: "q2-b",
          text: "「え、いや、その...」とモゴモゴする",
          points: { "solo-explorer": 2, "lyrics-dweller": 1 },
        },
        {
          id: "q2-c",
          text: "「作業用BGMだよ」と軽く流す",
          points: { "bgm-craftsman": 2, "midnight-shuffle": 1 },
        },
        {
          id: "q2-d",
          text: "イヤホンを外して一緒に聴かせる",
          points: { "karaoke-healer": 2, "bgm-craftsman": 1 },
        },
      ],
    },
    {
      id: "q3",
      text: "カラオケで選曲する基準は?",
      choices: [
        {
          id: "q3-a",
          text: "みんなが知ってて盛り上がる曲",
          points: { "karaoke-healer": 2, "playlist-evangelist": 1 },
        },
        {
          id: "q3-b",
          text: "誰も知らないけど自分が好きな曲",
          points: { "solo-explorer": 2, "repeat-warrior": 1 },
        },
        {
          id: "q3-c",
          text: "最近ハマってる新しい曲",
          points: { "festival-pioneer": 2, "bgm-craftsman": 1 },
        },
        {
          id: "q3-d",
          text: "カラオケには行かない（脳内で歌う派）",
          points: { "lyrics-dweller": 2, "midnight-shuffle": 1 },
        },
      ],
    },
    {
      id: "q4",
      text: "落ち込んだとき、音楽をどう使う?",
      choices: [
        {
          id: "q4-a",
          text: "テンション爆上げの曲で強制リセット",
          points: { "festival-pioneer": 2, "repeat-warrior": 1 },
        },
        {
          id: "q4-b",
          text: "今の気分にぴったりの切ない曲に浸る",
          points: { "lyrics-dweller": 2, "midnight-shuffle": 1 },
        },
        {
          id: "q4-c",
          text: "友達と一緒に歌って発散する",
          points: { "karaoke-healer": 2, "playlist-evangelist": 1 },
        },
        {
          id: "q4-d",
          text: "無音にして、音楽は元気な時の楽しみにとっておく",
          points: { "bgm-craftsman": 2, "solo-explorer": 1 },
        },
      ],
    },
    {
      id: "q5",
      text: "あなたのプレイリストの名前、どんな感じ?",
      choices: [
        {
          id: "q5-a",
          text: "「2026年3月ベスト」みたいに几帳面に管理",
          points: { "bgm-craftsman": 2, "repeat-warrior": 1 },
        },
        {
          id: "q5-b",
          text: "「布教用」「これ聴いて」など他人向け",
          points: { "playlist-evangelist": 2, "karaoke-healer": 1 },
        },
        {
          id: "q5-c",
          text: "作ったことがない。全部シャッフル",
          points: { "midnight-shuffle": 2, "festival-pioneer": 1 },
        },
        {
          id: "q5-d",
          text: "「深夜3時の気持ち」みたいにエモい名前",
          points: { "lyrics-dweller": 2, "solo-explorer": 1 },
        },
      ],
    },
    {
      id: "q6",
      text: "ライブやフェスに行くなら?",
      choices: [
        {
          id: "q6-a",
          text: "大型フェスで知らないバンドも含めて全ステージ制覇",
          points: { "festival-pioneer": 2, "solo-explorer": 1 },
        },
        {
          id: "q6-b",
          text: "好きなアーティストのワンマンに全公演参戦",
          points: { "repeat-warrior": 2, "playlist-evangelist": 1 },
        },
        {
          id: "q6-c",
          text: "友達と一緒に行って、音楽より思い出重視",
          points: { "karaoke-healer": 2, "bgm-craftsman": 1 },
        },
        {
          id: "q6-d",
          text: "配信で観る。家が最高の客席",
          points: { "midnight-shuffle": 2, "lyrics-dweller": 1 },
        },
      ],
    },
    {
      id: "q7",
      text: "「音楽の趣味が合う人」ってどういう人?",
      choices: [
        {
          id: "q7-a",
          text: "知らない曲を教えてくれる人",
          points: { "solo-explorer": 2, "midnight-shuffle": 1 },
        },
        {
          id: "q7-b",
          text: "同じ曲を同じタイミングで好きになる人",
          points: { "repeat-warrior": 2, "lyrics-dweller": 1 },
        },
        {
          id: "q7-c",
          text: "一緒にライブに行ける人",
          points: { "festival-pioneer": 2, "karaoke-healer": 1 },
        },
        {
          id: "q7-d",
          text: "自分が作ったプレイリストを喜んでくれる人",
          points: { "bgm-craftsman": 2, "playlist-evangelist": 1 },
        },
      ],
    },
    {
      id: "q8",
      text: "スマホの音楽アプリを開いたら、まず何をする?",
      choices: [
        {
          id: "q8-a",
          text: "「あなたへのおすすめ」をチェック",
          points: { "midnight-shuffle": 2, "solo-explorer": 1 },
        },
        {
          id: "q8-b",
          text: "いつものプレイリストを再生",
          points: { "repeat-warrior": 2, "bgm-craftsman": 1 },
        },
        {
          id: "q8-c",
          text: "フォローしてる人の最近の再生を見る",
          points: { "playlist-evangelist": 2, "festival-pioneer": 1 },
        },
        {
          id: "q8-d",
          text: "歌詞検索で気になるフレーズを調べる",
          points: { "lyrics-dweller": 2, "karaoke-healer": 1 },
        },
      ],
    },
    {
      id: "q9",
      text: "無人島に1曲だけ持っていけるとしたら?",
      choices: [
        {
          id: "q9-a",
          text: "何度聴いても飽きない、人生のテーマソング",
          points: { "repeat-warrior": 2, "lyrics-dweller": 1 },
        },
        {
          id: "q9-b",
          text: "テンションが上がる曲。生き延びるために",
          points: { "festival-pioneer": 2, "solo-explorer": 1 },
        },
        {
          id: "q9-c",
          text: "みんなとの思い出の曲。寂しくならないように",
          points: { "repeat-warrior": 2, "karaoke-healer": 1 },
        },
        {
          id: "q9-d",
          text: "選べない。シャッフルボタンも持っていきたい",
          points: { "midnight-shuffle": 2, "bgm-craftsman": 1 },
        },
      ],
    },
    {
      id: "q10",
      text: "この診断の結果、何を期待してる?",
      choices: [
        {
          id: "q10-a",
          text: "友達に見せて「わかる〜!」と言われたい",
          points: { "karaoke-healer": 2, "playlist-evangelist": 1 },
        },
        {
          id: "q10-b",
          text: "自分だけの独特なタイプが出てほしい",
          points: { "solo-explorer": 2, "midnight-shuffle": 1 },
        },
        {
          id: "q10-c",
          text: "面白ければなんでもいい",
          points: { "bgm-craftsman": 2, "festival-pioneer": 1 },
        },
        {
          id: "q10-d",
          text: "的確すぎて怖いやつがいい",
          points: { "lyrics-dweller": 2, "repeat-warrior": 1 },
        },
      ],
    },
  ],
  results: [
    {
      id: "festival-pioneer",
      title: "フェス一番乗り族",
      description:
        "あなたの音楽ライフは常に「次」を向いている。新譜が出れば最速で聴き、フェスの先行チケットは発売0.3秒で確保済み。Spotifyの「今年のまとめ」では、誰よりも多くの新曲を聴いた証が刻まれる。問題は1つだけ。来月にはもう今月のお気に入りを忘れていること。でも大丈夫、あなたにとって音楽は「出会い続ける」ことそのものだから。次のフェスでまた新しい「人生の1曲」を見つけるでしょう。",
      color: "#f43f5e",
      icon: "\u{1F3AA}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "新曲より先に次のフェスが決まってる",
        strengths: [
          "「最近何聴いてる?」の一言で初対面の人とすぐに仲良くなれる、音楽を武器にした天性の社交力がある。",
          "「試してみる」ことへのハードルが圧倒的に低く、誰よりも早く新しい音楽の良さを発見できる。",
        ],
        weaknesses: [
          "先月の「人生の1曲」を今月には忘れがち。聴いた曲の墓場がSpotifyにひっそり積み上がっている。",
          "刺激がないと落ち着かなくなる。インプットが止まるとそわそわして、気づいたらチケットを買っている。",
        ],
        behaviors: [
          "フェスのタイムテーブルを見ただけで「これは行くしかない」と即決して、後から都合を調整する。",
          "友達より先にアーティストを発見して、「まだ無名なんだけど」とさりげなく布教してしまう。",
          "ライブが終わった瞬間から「次どこ行く?」と考えてしまい、余韻より期待が勝る。",
          "Spotifyの年間まとめが、ほぼ全部その年の新曲で埋め尽くされている。",
        ],
        todayAction:
          "次に行きたいライブの候補を今すぐ3つ書き出してみて。あなたは計画している時間もちゃんと楽しめる人だから。",
      },
    },
    {
      id: "playlist-evangelist",
      title: "プレイリスト伝道師",
      description:
        "あなたは「この曲を聴いてほしい」という使命感で生きている。友達のLINEに突然URLが飛んできたら、十中八九あなたの仕業。プレイリストの説明文まで丁寧に書くその姿は、もはや音楽キュレーター。「聴いた?」のフォローアップも忘れない。問題は、相手が本当に聴いたかどうかを確認するまで眠れないこと。でも安心してください。あなたの布教は確実に誰かの人生のBGMを変えています。",
      color: "#f97316",
      icon: "\u{1F4E2}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "URLと「聴いた?」がセットで届く人",
        strengths: [
          "相手の好みを正確に記憶していて、「その人専用」プレイリストを作れるほど相手のことをよく見ている。",
          "好きなものを誰かと共有することがエネルギー補給になるから、布教活動が尽きることがない。",
        ],
        weaknesses: [
          "「聴いた?」の返信が来ない夜は、思いのほかダメージを引きずる。共感されないことへの耐性が意外と低い。",
          "曲を送ったあとのフォローアップを翌日まで忘れない。相手にとっては愛なのか圧なのか。",
        ],
        behaviors: [
          "友達のLINEに突然「これ絶対ハマるから聴いて」とURLを送り、翌日「聴いた?」とフォローアップする。",
          "カフェで流れた曲を即Shazamして、「これいいじゃん」と5人に転送する。",
          "好きな人の音楽プレイリストを作って、さりげなく共有フォルダに入れておく。",
          "友達から「あのプレイリスト、最近ずっとリピートしてる」と言われた瞬間、声に出さないガッツポーズをする。",
        ],
        todayAction:
          "今日あなたが「これいい」と思った曲を、まず一人だけに送ってみて。長い説明は不要、URLだけでいい。",
      },
    },
    {
      id: "solo-explorer",
      title: "ひとり開拓民",
      description:
        "あなたは音楽の未踏の地を1人で歩く探検家。Spotifyの「あなたへのおすすめ」の先にある「おすすめのおすすめ」まで掘り進む。月間リスナー3桁のアーティストを見つけた時の喜びは、トレジャーハンターが秘宝を発見した瞬間に等しい。問題は、好きなバンドがメジャーデビューすると微妙に複雑な気持ちになること。「売れる前から知ってたんだけど」と言いたいのを我慢する日々です。",
      color: "#8b5cf6",
      icon: "\u{1F3D4}\u{FE0F}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "月間リスナー3桁のアーティストに喜ぶ人",
        strengths: [
          "没入できる音楽を見つけると他のすべてを忘れて掘り下げる集中力で、ストレスを完全リセットできる。",
          "深いところまで音楽を探索する力があり、誰も気づいていない名曲を誰よりも先に発掘できる。",
        ],
        weaknesses: [
          "「みんなが知っている」という理由だけで曲への熱が冷める。ヒットしたら卒業、が染みついている。",
          "好きな曲を誰かに教えたいのに「わかってもらえないかも」という不安が先に来て、結局ひとりで聴く。",
        ],
        behaviors: [
          "「あのバンド知ってる?」と聞いて「知らない」と返ってくると、内心ちょっとガッツポーズする。",
          "おすすめ欄の「さらに似た曲」を延々クリックして、気づいたら2時間経っている。",
          "好きなアーティストのライブに行ったが、周りに誰も知り合いがいない状況に逆に安心する。",
          "自分だけ知っている曲が話題になった日、「売れる前から聴いてたんだけど」と言わないように我慢する。",
        ],
        todayAction:
          "今週見つけた「まだ誰も知らない曲」を、一人だけに教えてあげてみて。反応は予想外にいいはずだから。",
      },
    },
    {
      id: "repeat-warrior",
      title: "リピート戦士",
      description:
        "あなたの再生回数は統計的外れ値。同じアルバムを100周してもまだ新しい発見がある（と本気で思っている）。Spotifyの「今年のまとめ」では、トップ5が去年と完全に一致している。問題は、友達に「まだそれ聴いてるの?」と言われること。でもいいじゃないですか。名作映画を何度も観る人は「通」と呼ばれるのに、音楽だと「しつこい」と言われるのは不公平です。あなたは正しい。",
      color: "#ef4444",
      icon: "\u{2694}\u{FE0F}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "同じ曲を100周してもまだ飽きない人",
        strengths: [
          "同じ曲を繰り返すことで音楽を深く味わえる鑑賞力があり、気づいたら「通」と呼ばれていることがある。",
          "感情をゆっくり処理する力があるので、急いで次に進まず、今の気持ちとしっかり向き合える。",
        ],
        weaknesses: [
          "「なんとなく流す」ができない。音楽を垂れ流しにすることへの違和感が、他の人より強すぎる。",
          "旅行先や外出先で「いつもの曲」が聴けない環境だと、なんとなく落ち着かない一日になる。",
        ],
        behaviors: [
          "同じ曲を50回聴いて、「やっぱりAメロの転換が最高」という発見をメモしている。",
          "友達から新曲を勧められても、返事をしてから2週間前の曲を聴き続けている。",
          "Spotifyの年間まとめで、1位の曲が去年も1位だったことがある。",
          "同じアーティストのライブに5回目で参戦して、開演直後の1曲目で「前回と違う!」と即座に察知する。",
        ],
        todayAction:
          "今日のヘビロテ曲、最後まで歌詞を追いながら通しで聴いてみて。きっとまた新しい何かに気づくから。",
      },
    },
    {
      id: "bgm-craftsman",
      title: "作業用BGM職人",
      description:
        "あなたにとって音楽は「空気」である。最高の褒め言葉は「あ、BGM変わってたんだ。気づかなかった」。シーン別プレイリストの作り込みは異常で、「雨の日の午後3時・カフェ・やや眠い」というプレイリストが存在する。問題は、音楽の趣味を聞かれると答えに困ること。好きなのは「場面と音楽の組み合わせ」であって、特定の曲やアーティストではないから。あなたは音楽の建築家です。",
      color: "#06b6d4",
      icon: "\u{1F3A7}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "BGMで場の空気を設計する建築家",
        strengths: [
          "感情が乱れたとき、言葉より先に「今の気分に合うBGM」を選べる。音楽が感情処理のツールとして機能している。",
          "「この場にこの曲が合う」という空間設計の感覚が鋭く、場の雰囲気を音楽で完璧にコントロールできる。",
        ],
        weaknesses: [
          "カフェに入ると店のBGMを心の中で採点してしまい、評価が低いとじわじわ消耗する。職業病かもしれない。",
          "作業プレイリストの曲順を微調整するのに、作業より長い時間をかけることがある。本末転倒はわかってる。",
        ],
        behaviors: [
          "「雨の日の午後3時・カフェ・やや眠い」みたいな超限定プレイリストが実際に存在する。",
          "音楽の趣味を聞かれると「場面と曲の組み合わせが好き」と言い始めて、相手が置いてけぼりになる。",
          "友達の家に行ったとき、BGMがない部屋に違和感を感じて「何か流そうか」と言ってしまう。",
          "引っ越し先の部屋で最初にやることが、部屋の広さと光量に合うプレイリストの選定。",
        ],
        todayAction:
          "今の自分の気分に名前をつけて、そのためだけのプレイリストを一曲だけ追加してみて。それがあなたの感情整理術になる。",
      },
    },
    {
      id: "karaoke-healer",
      title: "カラオケ癒し枠",
      description:
        "あなたがいるだけでカラオケの空気が和む。選曲は「みんなが口ずさめる曲」が鉄則。マイクを独占しないし、人の歌にはちゃんとタンバリンを入れる。音楽は「一緒に楽しむもの」というあなたの哲学は、実は一番贅沢な音楽の味わい方。問題は、1人カラオケの存在意義が理解できないこと。音楽は分かち合ってこそ完成すると、あなたの全身が叫んでいます。",
      color: "#10b981",
      icon: "\u{1F3A4}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "タンバリンで全員を幸せにできる人",
        strengths: [
          "場の全員が「楽しい」と思えるよう空気を読んで動ける、カラオケを一番盛り上げられる力がある。",
          "初対面の人がマイクを受け取った瞬間、曲のタイトルを見ただけで「あ、そういう人だ」とピンとくる。人間観察力が鋭い。",
        ],
        weaknesses: [
          "本当に歌いたい曲を打ちかけて、一瞬止まって消して、みんなが知ってる曲に変えてから送信する。この作業を毎回やってる。",
          "グループが盛り上がっているとき、自分の疲れを誰にも悟らせないまま全力でタンバリンを叩き続けられる。誰も気づかない。",
        ],
        behaviors: [
          "カラオケで自分が歌う曲より、次の人が歌いやすい流れを考える時間の方が長い。",
          "友達が落ち込んでいるとき、「カラオケ行こ」と声をかけることで解決しようとする。",
          "カラオケのあとで「今日楽しかった」とLINEを送るのはいつも自分で、送られてきたことはない。",
          "初めて行くカラオケ店で、会計後に店員さんへ「楽しかったです」と言ってしまう。",
        ],
        todayAction:
          "次のカラオケでは、一曲だけ「自分が本当に歌いたい曲」を入れてみて。周りはたぶん喜ぶから。",
      },
    },
    {
      id: "midnight-shuffle",
      title: "深夜シャッフル系",
      description:
        "午前2時、暗い部屋、シャッフル再生。これがあなたの音楽儀式。自分では曲を選ばない。アルゴリズムと偶然に身を委ね、流れてきた曲に人生の意味を見出す。たまに全く聴いたことのない曲が流れてきて「これは運命だ」と確信する。問題は、翌朝その曲のタイトルを思い出せないこと。でも大丈夫。また今夜、シャッフルの神様が届けてくれます。",
      color: "#6366f1",
      icon: "\u{1F319}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "深夜2時のシャッフルに人生を委ねる人",
        strengths: [
          "「何を聴けばいいかわからない」という状態がほとんどない。任せることに慣れているから、音楽選びで迷わない。",
          "人間関係でも「縁があればまた会える」という感覚があり、執着より流れを信頼できる。手放し上手。",
        ],
        weaknesses: [
          "決断を求められる場面でストレスを感じやすい。「どれでもいい」が口癖で、周りにミステリアスな人と思われている。",
          "「今どんな気持ち?」と聞かれると答えられないのに、「この曲の感じ」と言えば一発で伝わると思ってしまう。伝わらない。",
        ],
        behaviors: [
          "深夜2時にシャッフル再生していたら、知らない曲が流れてきて「これは運命だ」と確信する。",
          "「何が聴きたい?」と聞かれると「なんでもいい」と答えて、本当にそれで満足できる。",
          "プレイリストを作ったことがほとんどなく、ライブラリ全シャッフルが基本スタイル。",
          "シャッフルで偶然同じ曲が2回続いた日、「意味があるかもしれない」と少し思う。",
        ],
        todayAction:
          "今夜のシャッフルで最初に流れた曲を、最後までちゃんと聴いてみて。飛ばさずに聴くだけで、何か変わるかもしれない。",
      },
    },
    {
      id: "lyrics-dweller",
      title: "歌詞の一節で生きてる人",
      description:
        "あなたにとって音楽は「音」ではなく「言葉」。メロディより先に歌詞が耳に入る。心に刺さった一節はスクショしてカメラロールに保存してある。通勤中にイヤホンで泣いたことが3回以上ある。問題は、人に好きな曲を説明しようとすると歌詞を朗読し始めてしまうこと。でもそれでいい。あなたが音楽から受け取っているものは、他の7タイプの誰よりも深い。たぶん。",
      color: "#a855f7",
      icon: "\u{1F4DD}",
      detailedContent: {
        variant: "music-personality",
        catchphrase: "歌詞スクショがカメラロールを占領してる人",
        strengths: [
          "悲しいことがあった日は、その感情に寄り添う歌詞を探すことで気持ちをゆっくり整理できる。言葉を羅針盤にした感情の達人。",
          "理解してくれる人に出会うと異様なほど安心できる。少数の「本当にわかり合える人」を大切にする深い人間関係を築く。",
        ],
        weaknesses: [
          "誰かに軽い気持ちで「いい曲だよね」と言われるとき、「軽く扱うな」と内心思ってしまう。ハードル高めの音楽警察。",
          "好きな曲の話をしようとすると、気づいたら歌詞を全部朗読していて、相手が引いている。熱量の出力が大きすぎる。",
        ],
        behaviors: [
          "音楽を流すとき、歌詞を画面に出さないと「ちゃんと聴いていない」気がして、すぐ歌詞検索を開く。",
          "通勤中に刺さった歌詞の一節をスクショして、投稿するかを3分悩んで、結局「これ伝わる人いる?」と投稿する。",
          "歌詞の解釈について誰かと議論したいと思いながら、分かってくれる人が少ない現実に少し孤独を感じる。",
          "カラオケで歌うより、歌詞の意味について語りたい衝動と戦いながらマイクを握っている。",
        ],
        todayAction:
          "カメラロールに眠っているスクショの歌詞、今日誰か一人に「これ好きなんだよね」と送ってあげてみて。",
      },
    },
  ],
};

// ---- Compatibility data ----

/**
 * Compatibility matrix for all 36 type combinations (upper triangle + diagonal).
 * Keys are sorted pairs joined with "--" (e.g. "bgm-craftsman--festival-pioneer").
 */
export const compatibilityMatrix: Record<string, CompatibilityEntry> = {
  // Same type combinations (8)
  "festival-pioneer--festival-pioneer": {
    label: "共鳴する疾風",
    description:
      "二人とも新しいもの好きすぎて、「先週ハマった曲」が毎週変わる。お互いの推しを交換しても翌週にはもう別の曲の話をしている。二人の会話の速度についてこれる人間は地球上にほとんどいない。",
  },
  "playlist-evangelist--playlist-evangelist": {
    label: "終わらない布教合戦",
    description:
      "「これ聴いて」「いやまずこっち聴いて」が永遠に続く。お互いのプレイリストを聴くだけで1日が終わる。布教先が布教してくるという想定外の事態に、二人とも密かに喜んでいる。",
  },
  "solo-explorer--solo-explorer": {
    label: "秘境の同志",
    description:
      "お互いが発掘してきたアーティストを見せ合う至福の時間。ただし「自分が先に見つけた」主張は譲れない。月間リスナー数が3桁のバンドを同時に発見した日には、奇跡に感謝する。",
  },
  "repeat-warrior--repeat-warrior": {
    label: "無限ループの絆",
    description:
      "同じ曲を延々と聴き続ける二人。話題は「あの曲の2番のサビの後のギターソロ」のような極めて限定的な領域に集中する。周囲には理解されないが、二人の間では全く問題ない。",
  },
  "bgm-craftsman--bgm-craftsman": {
    label: "究極の空間デザイナー",
    description:
      "二人でカフェに入ると、店のBGMの評論会が始まる。「この時間帯にボサノバは安易すぎる」といった会話を本気でやる。共同でプレイリストを作ると最高傑作が生まれるが、完成までに3ヶ月かかる。",
  },
  "karaoke-healer--karaoke-healer": {
    label: "最高のハーモニー",
    description:
      "二人がいるカラオケは全員が楽しい。お互いに歌う順番を譲り合い、全員の選曲にリアクションする。唯一の問題は、二人とも「最後に歌う人」になりたがること。",
  },
  "midnight-shuffle--midnight-shuffle": {
    label: "偶然の共鳴",
    description:
      "深夜に同時刻にシャッフル再生をして、偶然同じ曲が流れた日には運命を感じる。お互いのイヤホンを片耳ずつ交換して、違う曲が同時に流れる体験を「アート」と呼ぶ。",
  },
  "lyrics-dweller--lyrics-dweller": {
    label: "言葉の海を泳ぐ二人",
    description:
      "歌詞の解釈について3時間語れる唯一の組み合わせ。「あの一節の「空」は比喩なのか文字通りなのか」で議論が白熱する。二人の間では、歌詞カードが聖典に見えてくる。",
  },

  // Cross-type combinations (28)
  "festival-pioneer--playlist-evangelist": {
    label: "最強の拡散装置",
    description:
      "一人が新曲を見つけ、もう一人が全力で広める。音楽業界が最も恐れる口コミコンビ。二人が組めば、インディーズバンドを3日でバズらせることも不可能ではない。",
  },
  "festival-pioneer--solo-explorer": {
    label: "発見競争のライバル",
    description:
      "「知ってた?」「いや俺の方が先に」という不毛だが楽しい争いが日常。フェス派と配信派の対立は根深いが、新しい音楽への敬意では一致している。",
  },
  "festival-pioneer--repeat-warrior": {
    label: "スピードと持久力",
    description:
      "一人は次々と新曲に飛びつき、もう一人は1曲を永遠に聴く。お互いの音楽の接し方が真逆すぎて、一周回って尊敬し合っている。「量の美学」と「深さの美学」の共存。",
  },
  "bgm-craftsman--festival-pioneer": {
    label: "素材の供給者と建築家",
    description:
      "フェス族が大量に仕入れてくる新曲を、BGM職人がシーン別に整理整頓する。最高のプレイリストが生まれるが、「この曲はここじゃない」という職人のダメ出しにフェス族がたじろぐ。",
  },
  "festival-pioneer--karaoke-healer": {
    label: "お祭りムードメーカー",
    description:
      "二人がいれば、どんな飲み会も音楽フェスに変わる。フェス族が最新曲を投下し、癒し枠が「みんな知ってるバージョン」に翻訳する。場の空気を制する最強タッグ。",
  },
  "festival-pioneer--midnight-shuffle": {
    label: "正反対の音楽冒険家",
    description:
      "一人は能動的に新曲を探し、もう一人は受動的に出会いを待つ。方法は違うが「まだ知らない曲に出会いたい」という欲望では完全に一致。深夜のフェス配信を一緒に観たら最高の体験になる。",
  },
  "festival-pioneer--lyrics-dweller": {
    label: "速度と深度の交差点",
    description:
      "フェス族が「この曲いいよ」と投げた曲を、歌詞族が3日かけて解析して返してくる。テンポは合わないが、互いの視点が曲の新しい魅力を引き出す。",
  },
  "playlist-evangelist--solo-explorer": {
    label: "布教者と隠者の対話",
    description:
      "伝道師は「みんなに広めたい」、開拓民は「自分だけの秘密にしたい」。正反対のようだが、音楽への愛の深さは同レベル。開拓民が秘蔵の1曲を伝道師に渡した日、世界が少し変わる。",
  },
  "playlist-evangelist--repeat-warrior": {
    label: "情報過多 vs 情報固定",
    description:
      "伝道師が毎日5曲送ってくるが、戦士は1曲目すら聴き終わっていない。「もう聴いた?」「まだ前の聴いてる」のやり取りが永遠に続く。でも年に1回、戦士のヘビロテに伝道師の推薦曲が入る。それが二人の記念日。",
  },
  "bgm-craftsman--playlist-evangelist": {
    label: "キュレーター対決",
    description:
      "「みんなに聴かせたいプレイリスト」vs「完璧な空間演出のプレイリスト」。目的が違うだけでスキルセットは同じ。共作プレイリストは「聴かせたい」と「馴染ませたい」の緊張感で名作になる。",
  },
  "karaoke-healer--playlist-evangelist": {
    label: "ソーシャル音楽の両翼",
    description:
      "どちらも音楽は「人と共有するもの」と信じている。伝道師がURLを送り、癒し枠が「一緒に聴こう」と誘う。方法論は違うが、目的は同じ。二人がいるグループのLINEは音楽の話題が絶えない。",
  },
  "midnight-shuffle--playlist-evangelist": {
    label: "計画と偶然",
    description:
      "伝道師は「次に聴くべき曲」を完璧に設計し、シャッフル系は全てを偶然に委ねる。お互いの方法を理解できないが、「いい曲に出会えた」という結果は同じ。過程にこだわるか、結果にこだわるか。",
  },
  "lyrics-dweller--playlist-evangelist": {
    label: "広さと深さの共存",
    description:
      "伝道師が100曲を浅く広く聴かせ、歌詞族が1曲を深く深く語る。会話が噛み合わないようで、実は最高の音楽談義になる。伝道師のおかげで歌詞族の世界が広がり、歌詞族のおかげで伝道師が立ち止まる。",
  },
  "repeat-warrior--solo-explorer": {
    label: "発見者と定住者",
    description:
      "開拓民が新大陸を発見し、戦士がそこに永住する。「新しい曲見つけたよ」「まだ前の聴いてる」は日常会話。でも戦士が珍しく「新しい曲聴きたい」と言った時、開拓民は最高の1曲を差し出す。",
  },
  "bgm-craftsman--solo-explorer": {
    label: "仕入れと加工の名コンビ",
    description:
      "開拓民が掘り出してきたレア曲を、職人が適切なシーンに配置する。お互いの才能を認め合う関係。ただし「この曲はBGMにするには存在感がありすぎる」という職人の判断に、開拓民が少し傷つく。",
  },
  "karaoke-healer--solo-explorer": {
    label: "対極の音楽観",
    description:
      "「誰も知らない曲」を愛する人と「みんなが知ってる曲」を愛する人。カラオケでの選曲は永遠に交わらないが、だからこそ互いの選曲が新鮮。癒し枠に「これ歌えるよ?」と開拓民の推し曲を歌われた日、開拓民は複雑な涙を流す。",
  },
  "midnight-shuffle--solo-explorer": {
    label: "静かなる探求者同盟",
    description:
      "どちらも「まだ見ぬ曲」に惹かれる。能動と受動の違いだけ。二人でイヤホンを分け合って無言で聴く時間は、言葉が要らない最高の音楽体験。",
  },
  "lyrics-dweller--solo-explorer": {
    label: "発掘と解読の二人組",
    description:
      "開拓民が見つけてきた曲を、歌詞族が歌詞の意味を解読する。「この曲の歌詞、実はこういう意味だったんだ」と教えられた瞬間、開拓民はその曲をもっと好きになる。最高のバディ。",
  },
  "bgm-craftsman--repeat-warrior": {
    label: "こだわりの方向性が違う二人",
    description:
      "戦士は「この1曲」にこだわり、職人は「この場面」にこだわる。どちらも妥協しない完璧主義者。二人の妥協点を見つけるのは難しいが、見つかった時のプレイリストは芸術品。",
  },
  "karaoke-healer--repeat-warrior": {
    label: "安定と調和",
    description:
      "戦士の十八番と癒し枠の定番曲。カラオケでは最も安定感のあるペア。セットリストが5年前から変わっていないことを二人とも気にしていない。初見の人が「いつもこうなの?」と聞くと、二人は顔を見合わせて「これが完成形だから」と真顔で答える。伝統芸能のような安心感がそこにはある。",
  },
  "midnight-shuffle--repeat-warrior": {
    label: "固執と放流",
    description:
      "同じ曲を100回聴く人と、同じ曲を2回聴かない人。音楽の接し方は180度違うが、音楽なしでは生きられない点は完全一致。戦士のヘビロテ曲がシャッフルで流れた日、シャッフル系は「運命かも」と思う。",
  },
  "lyrics-dweller--repeat-warrior": {
    label: "反復の達人と解釈の達人",
    description:
      "戦士が100周目で気づいた音の変化を、歌詞族が歌詞の文脈から説明する。「だからこの部分でギターの音が変わるのか!」という発見は、二人でなければ辿り着けない境地。",
  },
  "bgm-craftsman--karaoke-healer": {
    label: "空間演出の名匠ペア",
    description:
      "職人がBGMで雰囲気を作り、癒し枠が人を巻き込む。パーティーの音楽担当はこの二人に任せれば間違いない。ただし職人が「この曲順には意味があるんだ」と主張し始めたら、癒し枠が「じゃあ次何歌う?」とマイクを渡して強制終了させる。結果、最高のパーティーになる。",
  },
  "bgm-craftsman--midnight-shuffle": {
    label: "設計と偶然の音楽論",
    description:
      "職人は「この場面にはこの曲」と設計し、シャッフル系は「何が来ても受け入れる」。音楽との向き合い方は正反対だが、どちらも音楽を「体験」として捉えている点で深く共感し合う。",
  },
  "bgm-craftsman--lyrics-dweller": {
    label: "音と言葉の二面性",
    description:
      "職人は音楽を「音」として聴き、歌詞族は「言葉」として聴く。同じ曲を聴いているのに全く違うものを受け取っている。お互いの視点を知ると、音楽の奥行きが倍になる。",
  },
  "karaoke-healer--midnight-shuffle": {
    label: "陽と陰の音楽体験",
    description:
      "癒し枠は大勢で歌い、シャッフル系は深夜に1人で聴く。音楽の楽しみ方が完全に反対だが、互いの世界を少しだけ体験すると人生が豊かになる。癒し枠に深夜のシャッフルを教えたら、新しい扉が開く。",
  },
  "karaoke-healer--lyrics-dweller": {
    label: "みんなの歌と私の歌",
    description:
      "癒し枠は「みんなで盛り上がれる曲」、歌詞族は「自分の心に響く曲」。違うようで、どちらも音楽に「感情」を求めている。カラオケで歌詞族が選んだ曲を癒し枠が全力でハモった時、最高の瞬間が生まれる。",
  },
  "lyrics-dweller--midnight-shuffle": {
    label: "深夜の邂逅",
    description:
      "シャッフルで偶然流れてきた曲の歌詞に心を撃ち抜かれる。これが二人の共通体験。「あの曲、偶然聴いたんだけど歌詞がすごくて...」という会話が成立する唯一の組み合わせ。深夜の偶然が言葉の発見につながる、ロマンチックな関係。",
  },
};

/** All valid type IDs for this quiz */
export const MUSIC_TYPE_IDS = [
  "festival-pioneer",
  "playlist-evangelist",
  "solo-explorer",
  "repeat-warrior",
  "bgm-craftsman",
  "karaoke-healer",
  "midnight-shuffle",
  "lyrics-dweller",
] as const;

export type MusicTypeId = (typeof MUSIC_TYPE_IDS)[number];

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
 * Check if a given string is a valid music personality type ID.
 */
export function isValidMusicTypeId(id: string): id is MusicTypeId {
  return (MUSIC_TYPE_IDS as readonly string[]).includes(id);
}

export default musicPersonalityQuiz;
