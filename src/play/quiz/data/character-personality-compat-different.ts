import type { CompatibilityEntry } from "../types";

/**
 * Compatibility entries for completely different archetype pairs (Batch 3).
 *
 * "Completely different" means the two characters share no archetypes —
 * neither primary nor secondary — between them.
 *
 * Total: 152 entries.
 * Keys are sorted pairs joined with "--" (e.g. "blazing-canvas--tender-dreamer").
 */
export const differentArchetypeCompatibility: Record<
  string,
  CompatibilityEntry
> = {
  // blazing-strategist (commander+professor) pairs
  "blazing-strategist--star-chaser": {
    label: "設計図と落書きの攻防",
    description:
      "策士が5手先の計画を立てている横で、妄想家が「でもこれ、普通じゃない?」と斜め上の質問を放つ。計画が崩れるかと思いきや、逆張りが盲点を突いて設計図がグレードアップする。",
  },
  "blazing-strategist--tender-dreamer": {
    label: "速攻と優しい牽制",
    description:
      "策士が「もう動くぞ」と叫ぶ前に、夢想家が「みんな、ついていけてる?」と小声で確認している。その一言が策士の足を一瞬止め、ちょうどいいテンポを生む。",
  },
  "blazing-strategist--dreaming-canvas": {
    label: "論理と映像の衝突",
    description:
      "策士の緻密なロジックを聞きながら、夢想画家が「でもそれ、夕暮れ色の映像で見えてた未来と違う」と言い出す。二人は噛み合わないが、なぜか最終成果物は美しい。",
  },
  "blazing-strategist--clever-guardian": {
    label: "攻めと守りの頭脳戦",
    description:
      "策士が突破口を探している間、安全係が「そこ穴がある」と静かに指摘する。二人とも頭の回転が速すぎて会話が追いつかないが、出来上がった計画は鉄壁だ。",
  },
  "blazing-strategist--creative-disruptor": {
    label: "正道と逆張りの軍拡競争",
    description:
      "策士が最適解を計算しながら動く横で、曲者が「その正解、捨てる理由ある?」とにやりと問う。二人の方向が逆なのに、互いの弱点を補い合って結果は最強になる。",
  },
  "blazing-strategist--gentle-fortress": {
    label: "速度と柔らかい抵抗",
    description:
      "策士が「行くぞ!」と走る後ろで、守護芸術家が「待って、誰か疲れてるかも」と引き留める。イライラするが、止まるたびにチームの結束が一段上がっていることに気づく。",
  },
  "blazing-strategist--eternal-dreamer": {
    label: "計画と永遠の構想",
    description:
      "策士が今日の行動計画を立てている間、永遠の妄想家は脳内で47回目の旅に出発している。スピードは全く噛み合わないが、妄想家の壮大なビジョンが策士の目標を押し広げる。",
  },
  "blazing-strategist--ultimate-trickster": {
    label: "論理と無限逆張りの激突",
    description:
      "策士が完璧な論理を構築するたびに、策略家が「でもそれ、裏の裏の裏はどうなの?」と返す。二人の議論は終わらないが、終わった頃には誰も突破できない論理が完成している。",
  },
  "blazing-strategist--ultimate-guardian": {
    label: "突進と七重の備え",
    description:
      "策士が「今すぐ動こう」と言うたびに、備えの王が想定リストを取り出す。策士は「長い!」と叫ぶが、リストが尽きた後に動き出す二人には一切の抜けがない。",
  },
  "blazing-strategist--ultimate-artist": {
    label: "速度と千回のやり直し",
    description:
      "策士が締切3分前に計画を仕上げると、美の追求者が「なんか違う」と言い出す。締切が来るたびに繰り返されるこの攻防が、二人の間で一種のルーティンになっている。",
  },
  "blazing-strategist--vibe-rebel": {
    label: "設計と本能の異文化",
    description:
      "策士が5手先を計算している横で、野生の芸術家が「なんかこっちの感じがいい」と直感で走り出す。計算と本能のぶつかり合いが、想定外のルートを切り開く。",
  },

  // blazing-poet (commander+dreamer) pairs
  "blazing-poet--contrarian-professor": {
    label: "炎の詩と知的逆張り",
    description:
      "詩人が「行くぞ!」と叫ぶと、逆張り博士が「その方向でいいの?逆から見ると...」と返す。詩人は一瞬止まり、新しい角度から詩を書き直す。結果は当初より深い。",
  },
  "blazing-poet--careful-scholar": {
    label: "衝動と17回の確認",
    description:
      "詩人が感性で飛び込もうとするたびに、慎重博士が「念のため確認を」と止める。詩人はうずうずするが、確認が済んだ後の一歩は想像以上に深く刺さる。",
  },
  "academic-artist--blazing-poet": {
    label: "数式の美と炎の直感",
    description:
      "詩人が「よし行くぞ!」と走り出す瞬間、データ詩人が「その動き、グラフにすると美しい曲線だね」と呟く。二人はそれぞれの美しさの言語で語り合い、なぜか作品がシンクロする。",
  },
  "blazing-poet--clever-guardian": {
    label: "詩的突進と戦略的制動",
    description:
      "詩人が情熱のまま突っ込もうとすると、安全係が「そこ、弱点があるけど」と静かに止める。詩人は「わかった!」と言いながら全速力で続きを走る。",
  },
  "blazing-poet--creative-disruptor": {
    label: "炎の王道破りと逆張り美学",
    description:
      "詩人が「みんなを巻き込んで突き進もう!」と叫ぶと、曲者が「その王道、捨てたほうが面白くない?」とにやりとする。二人の化学反応で生まれる作品は、定義不能な輝きを持つ。",
  },
  "blazing-poet--gentle-fortress": {
    label: "情熱と静かな傘",
    description:
      "詩人が嵐の中でも走り続けるとき、守護芸術家は無言で傘を差し出している。詩人は気づいていないが、一度も風邪をひいたことがないのは全てそのおかげだ。",
  },
  "blazing-poet--endless-researcher": {
    label: "3秒の直感と3年の調査",
    description:
      "詩人が「感じた!やろう!」と決める3秒後、研究者が「もう少し調べてから」と調査を始める。詩人はとっくに次の夢に進んでいるが、研究者の報告書が後から詩の深みを作る。",
  },
  "blazing-poet--ultimate-trickster": {
    label: "炎の詩と裏の裏の言葉",
    description:
      "詩人が詩的な言葉で場を動かすと、策略家が「その言葉の裏の裏を読むと...」と解析を始める。詩人は「難しく考えすぎ!」と笑うが、二人の作る空気は誰も真似できない。",
  },
  "blazing-poet--ultimate-guardian": {
    label: "詩的爆走と七つのお守り",
    description:
      "詩人が感性のまま飛び込む前に、備えの王が「お守りいる?」と七種類を差し出す。詩人は「一個でいい!」と受け取りながら走り出す。その一個のお守りが何度も詩人を救う。",
  },
  "blazing-poet--ultimate-artist": {
    label: "炎の詩と美の千回",
    description:
      "詩人が「完成した!」と叫ぶたびに、美の追求者が「うーん、なんか違う」と言い出す。締切が来るまで繰り返されるこのループが、二人にとって最高の創作セッションだ。",
  },
  "blazing-poet--data-fortress": {
    label: "夢と数値の翻訳作業",
    description:
      "詩人が「なんとなくこっちの気がする!」と言うと、論理守護者が「その直感、データで検証してみた」と返す。数値化された夢が、詩人の次の行動をより力強くする。",
  },
  "blazing-poet--vibe-rebel": {
    label: "情熱の爆走と野生の跳躍",
    description:
      "詩人が「行くぞ!」と叫んだ瞬間、野生の芸術家がすでに3歩先にいる。二人の爆発のタイミングが微妙にずれているのに、なぜか着地点はいつも同じ場所になる。",
  },

  // blazing-schemer (commander+trickster) pairs
  "blazing-schemer--dreaming-scholar": {
    label: "裏道と夢の論文",
    description:
      "策略司令塔が「絶対こっちの方が近い」と裏道に入ると、夢想学者が「理論上はそうだけど、夢の中では別の道があって...」と独自の検証を始める。迂回した先で思わぬ発見がある。",
  },
  "blazing-schemer--careful-scholar": {
    label: "裏道と17回の安全確認",
    description:
      "司令塔が裏道を発見した瞬間、慎重博士が「その道、確認した?」と安全チェックリストを取り出す。「長い!」と叫びながらも、確認を終えた後の裏道は本当に安全だった。",
  },
  "academic-artist--blazing-schemer": {
    label: "詩的分析と爆速裏技",
    description:
      "司令塔が「裏道はこっちっしょ」と走り出すと、データ詩人が「その軌跡、グラフにすると面白い形だな」と呟く。速度と美しさの合体が、予想外の突破口を開く。",
  },
  "blazing-schemer--tender-dreamer": {
    label: "策略と優しい全員確認",
    description:
      "司令塔が「全員ついてこい!」と裏道に連れ込むと、夢想家が「みんな大丈夫?」と後ろを振り返る。その一瞬の確認が、置いてきぼりを一人も出さない秘訣になる。",
  },
  "blazing-schemer--dreaming-canvas": {
    label: "裏道と夢の映像",
    description:
      "司令塔が「こっちが正解!」と突進すると、夢想画家が「この景色、夢で見た気がする...」と立ち止まる。その直感が実は正しいことに、後から二人とも気づく。",
  },
  "blazing-schemer--gentle-fortress": {
    label: "爆速と静かなセーフティネット",
    description:
      "司令塔が次々と裏技を試している間、守護芸術家が「誰かしんどそう」と静かにフォローする。速度と温度のバランスが、チームを崩壊させずに前に進める秘訣だ。",
  },
  "blazing-schemer--endless-researcher": {
    label: "裏技と永遠の検証",
    description:
      "司令塔が「これ絶対うまくいく!」と裏技を試みる横で、研究者が「でも事前検証が...」と調査を始める。司令塔はとっくに次の手を打っているが、研究者の検証が次回の成功率を上げる。",
  },
  "blazing-schemer--eternal-dreamer": {
    label: "裏道と脳内47回目の旅",
    description:
      "司令塔が抜け道を見つけて「来た!」と叫ぶ間、永遠の妄想家は脳内ですでに旅を完結させている。現実の抜け道と夢の旅が交差する瞬間、二人は奇妙にシンクロする。",
  },
  "blazing-schemer--ultimate-guardian": {
    label: "抜け穴と七重の壁",
    description:
      "司令塔が巧みに抜け穴を見つけるたびに、備えの王が「そこも対策済みだよ」と返す。抜け穴を探すものと塞ぐもの、この二人がいれば穴のない計画が自然に完成する。",
  },
  "blazing-schemer--ultimate-artist": {
    label: "裏技と美の徹底追求",
    description:
      "司令塔が「うまい手を見つけた!」と叫ぶと、美の追求者が「でも、そのやり方美しくない」と言う。二人が妥協点を見つけるまでに時間はかかるが、完成品は技あり且つ美しい。",
  },
  "blazing-schemer--data-fortress": {
    label: "直感の抜け道とデータの壁",
    description:
      "司令塔が「この抜け道いける!」と踏み込む瞬間、論理守護者が「統計的には危険域です」と遮る。直感と数値の押し問答の末に、真に安全な抜け道だけが残る。",
  },

  // blazing-warden (commander+guardian) pairs
  "blazing-warden--dreaming-scholar": {
    label: "全速力と夢の理論",
    description:
      "守護司令塔が「全員いるか、行くぞ!」と叫ぶと、夢想学者が「あ、理論上は別ルートが...」と白昼夢から帰ってくる。走りながら理論を語る、不思議なコンビが誕生する。",
  },
  "blazing-warden--contrarian-professor": {
    label: "熱い指揮と冷静な逆説",
    description:
      "守護司令塔が「みんなで突破するぞ!」と気合を入れる横で、逆張り博士が「その突破口、実は別の解釈があって」と静かに言う。気合と知性の組み合わせが予想外の正解を生む。",
  },
  "academic-artist--blazing-warden": {
    label: "情熱の指揮とデータの詩",
    description:
      "守護司令塔が全員を率いて走る姿を見ながら、データ詩人が「その走り方のリズム、グラフにしたら美しい」と感動している。熱量と美学が同じ場所を目指している。",
  },
  "blazing-warden--star-chaser": {
    label: "全員確認と独走の夢想家",
    description:
      "守護司令塔が「全員いるか!」と数えている間に、逆張り妄想家がすでに「でもこのルート、変じゃない?」と一人で別方向を考えている。それが時々、全員のルートを救う。",
  },
  "blazing-warden--dreaming-canvas": {
    label: "集団の熱と一人の映像世界",
    description:
      "守護司令塔が「全員まとまれ!」と声を張り上げる傍らで、夢想画家が「この瞬間、映画のシーンに似てる...」と静かに映像化している。集団の熱と個の感性が不思議に共存する。",
  },
  "blazing-warden--creative-disruptor": {
    label: "王道突進と逆張り遊撃",
    description:
      "守護司令塔が正面から全員を率いる横で、曲者が「その王道、斜めから崩す手もあるけど」と独自の作戦を立てる。正面と側面が同時に機能して、突破口が二倍になる。",
  },
  "blazing-warden--endless-researcher": {
    label: "行動の速度と準備の深度",
    description:
      "守護司令塔が「さあ動こう!」と叫ぶと、研究者が「もう少し調べてから」と調査を続けている。動きたい側と調べたい側、この張力がちょうどいい着手タイミングを作る。",
  },
  "blazing-warden--eternal-dreamer": {
    label: "現実の全速力と夢の無限",
    description:
      "守護司令塔が「全員、現実で前に進むぞ!」と叫ぶ横で、永遠の妄想家が脳内の47回目の旅から帰ってこない。それでも守護司令塔はこの妄想家を待って、一人も置いていかない。",
  },
  "blazing-warden--ultimate-trickster": {
    label: "仲間思いと裏の裏の安全",
    description:
      "守護司令塔が全員の安全を確認しながら走る横で、策略家が「このルートの裏の裏のリスクは...」と計算している。二人が揃うと、表も裏も守られた最強ルートが完成する。",
  },
  "blazing-warden--ultimate-artist": {
    label: "集団の熱と美の孤独",
    description:
      "守護司令塔が全員を引っ張る喧騒の中、美の追求者が「うーん、この群像劇の配色が...」と静かに立ち止まる。うるさいくらいの熱量と深い静けさが、なぜかバランスを取る。",
  },
  "blazing-warden--vibe-rebel": {
    label: "全員連れていく熱と野生の単独行",
    description:
      "守護司令塔が「全員ついてこい!」と叫ぶ間に、野生の芸術家がすでに3歩先に一人でいる。守護司令塔は「置いていくな!」と叫ぶが、野生の芸術家の道が正解だったりする。",
  },

  // blazing-canvas (commander+artist) pairs
  "blazing-canvas--dreaming-scholar": {
    label: "映画的情熱と夢の論文",
    description:
      "情熱の画家が「やるぞ、映画みたいに!」と飛び込む瞬間、夢想学者が「その場面、論文テーマになりそう」と手帳に書き始める。情熱と知的好奇心が同じ一瞬を共有する。",
  },
  "blazing-canvas--contrarian-professor": {
    label: "感性の突進と知的逆説",
    description:
      "情熱の画家が「これだ!」と感性で突き進むと、逆張り博士が「面白い。でも別の解釈だと...」と追いかける。感性に理論の骨格が加わり、作品の深みが倍増する。",
  },
  "blazing-canvas--careful-scholar": {
    label: "情熱と17回の検証",
    description:
      "情熱の画家が勢いのまま走り出すたびに、慎重博士が「安全確認を」と止める。うずうずしながら確認を待つその時間に、画家の脳内では次の映画が既に始まっている。",
  },
  "blazing-canvas--star-chaser": {
    label: "映画と逆張りの夢",
    description:
      "情熱の画家が壮大なビジョンを描くと、逆張り妄想家が「でも普通じゃない?もっと変な夢の方が面白い」と返す。二人のビジョンがぶつかって、誰も思いつかなかった絵が生まれる。",
  },
  "blazing-canvas--tender-dreamer": {
    label: "情熱の画家とやさしい夢想家",
    description:
      "情熱の画家が「失敗しても面白い!」と飛び込む横で、やさしい夢想家が「誰かが傷つかないか心配で...」とそっと確認する。熱量と温かさが、誰も傷つけない情熱を作る。",
  },
  "blazing-canvas--clever-guardian": {
    label: "感性の爆走と戦略的安全係",
    description:
      "情熱の画家が直感のまま突き進む横で、安全係が「その先、穴がある」と静かに指摘する。画家は「わかった!」と言いながら全速力で続きを走り、穴だけを避けていく。",
  },
  "blazing-canvas--endless-researcher": {
    label: "映画的衝動と検証の旅",
    description:
      "情熱の画家が「映画のように作ろう!」と決めた瞬間、研究者が「過去の事例を調べてから」と調査を開始する。画家はもう次の映画を夢見ているが、研究者の資料が傑作の土台になる。",
  },
  "blazing-canvas--eternal-dreamer": {
    label: "脳内映画と無限の夢",
    description:
      "情熱の画家の脳内映画と、永遠の妄想家の脳内旅行が同時上映される。どちらも実現しないが、二人が話し合うと世界で一番豊かな企画書ができ上がる。",
  },
  "blazing-canvas--ultimate-trickster": {
    label: "感性の爆発と裏の美学",
    description:
      "情熱の画家が「これが美しい!」と叫ぶと、策略家が「その美しさ、裏から見たら違う顔がある」と返す。表と裏を両方見た作品は、どの角度からも輝く。",
  },
  "blazing-canvas--ultimate-guardian": {
    label: "情熱の映画と七重の傘",
    description:
      "情熱の画家が嵐の中でも撮影を続けようとするとき、備えの王が七種類の傘を持って立っている。嵐の中で生まれる映画は、傘があるからこそ完成まで走り切れる。",
  },
  "blazing-canvas--data-fortress": {
    label: "感性の映画とデータの城",
    description:
      "情熱の画家が「完全に感性で行く!」と宣言すると、論理守護者が「その感性、データで検証してみた」と報告書を出す。感性と数値が合流して、再現性のある美しさが生まれる。",
  },

  // dreaming-scholar (professor+dreamer) pairs
  "clever-guardian--dreaming-scholar": {
    label: "白昼夢と戦略的弱点探し",
    description:
      "夢想学者が「これを研究したら面白いなぁ...」と夢見る横で、安全係が「その研究計画、穴がここにある」と指摘する。夢に穴のない構造が加わり、なぜか現実になりやすくなる。",
  },
  "creative-disruptor--dreaming-scholar": {
    label: "夢の理論と逆張りの実験",
    description:
      "夢想学者が精緻な理論を積み上げると、曲者が「その理論、王道すぎない?逆から崩したら?」と提案する。夢に逆張りが加わって、誰も思いつかなかった研究が生まれる。",
  },
  "dreaming-scholar--gentle-fortress": {
    label: "夢の論文と温かい一時停止",
    description:
      "夢想学者が白昼夢の中で論文を書き続けるとき、守護芸術家が「少し休んで」と静かにお茶を出す。その一瞬の休憩が、夢想学者に最高のアイデアをもたらす。",
  },
  "dreaming-scholar--ultimate-commander": {
    label: "夢の学術と覇王の号令",
    description:
      "夢想学者が理論を夢想している間に、覇王が「動け!」と叫ぶ。夢想学者は驚いて現実に戻るが、それが夢の外への第一歩になる。号令がなければ夢は夢のまま終わっていた。",
  },
  "dreaming-scholar--ultimate-trickster": {
    label: "夢の理論と裏の裏の論理",
    description:
      "夢想学者が論文の妥当性を夢の中で確認しているとき、策略家が「その理論の裏を読むと矛盾がある」と突く。夢と現実の境界で行われる論戦が、二人を高みに連れていく。",
  },
  "dreaming-scholar--ultimate-guardian": {
    label: "夢想の研究と七重の安全網",
    description:
      "夢想学者が「理論上はいけるはず...」と夢見ながら進む横で、備えの王が全ての失敗シナリオに対策を打っている。夢想と現実的守りが揃うと、失敗しない実験になる。",
  },
  "dreaming-scholar--ultimate-artist": {
    label: "夢の論文と美の永遠追求",
    description:
      "夢想学者の論文に美の追求者が「この論理の構造、美しいけど何か違う」と言い出す。論文の美的完成度を追い求める二人は、学術の世界で最も風変わりなコンビだ。",
  },
  "dreaming-scholar--vibe-rebel": {
    label: "夢の理論と感性の爆走",
    description:
      "夢想学者が「理論的には」と前置きする間に、野生の芸術家がすでに本能で正解を走り抜けている。後から理論が追いついて、本能と論文が同じ結論に着地する。",
  },
  "dreaming-scholar--guardian-charger": {
    label: "夢の研究と盾の突進",
    description:
      "夢想学者が夢の中で論文を完成させる間、守護者が「後ろが安全なら前に出る」と実際に動いている。夢と行動のギャップが埋まる瞬間、二人は最強の研究チームになる。",
  },

  // contrarian-professor (professor+trickster) pairs
  "contrarian-professor--tender-dreamer": {
    label: "知的逆張りと優しい全肯定",
    description:
      "逆張り博士が「でも違う見方をすると...」と追加説明をするたびに、やさしい夢想家が「どっちも素敵ですよね」と全肯定する。否定がないと逆張り博士は少し困惑する。",
  },
  "contrarian-professor--dreaming-canvas": {
    label: "論理の逆張りと感性の映像",
    description:
      "逆張り博士が理論を組み立てるとき、夢想画家が「でもその理論、映像にすると全然違う色をしてる」と言い出す。言語と映像の翻訳作業が、二人の対話を豊かにする。",
  },
  "contrarian-professor--gentle-fortress": {
    label: "知的いたずらと温かい安全網",
    description:
      "逆張り博士が意図的に話をこじらせると、守護芸術家が「でも誰かが傷ついてないか心配」と囁く。知的遊戯と感情的配慮の間で、場の温度がちょうどよく保たれる。",
  },
  "contrarian-professor--ultimate-commander": {
    label: "逆説の知性と覇王の突進",
    description:
      "逆張り博士が「でも逆の方向からだと...」と言い終わる前に、覇王が「考えるより動け!」と突進する。半分の理論で動いた結果が、実は博士の逆説の答えだったりする。",
  },
  "contrarian-professor--eternal-dreamer": {
    label: "知的逆張りと永遠の妄想",
    description:
      "逆張り博士が「その夢、逆から見ると...」と解析し始めると、永遠の妄想家が「あ、そのアングルの夢、まだ見てなかった」と新しい旅を始める。逆張りが夢の燃料になる。",
  },
  "contrarian-professor--ultimate-guardian": {
    label: "逆張り知性と備えの王",
    description:
      "逆張り博士が「その備え、本当に必要?逆に考えると...」と問うと、備えの王が「逆から考えても必要だった」と淡々と答える。最終的に二人の備えは完璧になる。",
  },
  "contrarian-professor--ultimate-artist": {
    label: "逆説の論理と美の追求",
    description:
      "逆張り博士が「その美しさ、逆説的に言うと...」と解析すると、美の追求者が「うーん、逆説でも違う」と言い出す。どこまでも終わらない美の定義論争が二人の間で続く。",
  },
  "contrarian-professor--guardian-charger": {
    label: "知的逆張りと盾の突進",
    description:
      "逆張り博士が「前に出るべき理由、逆から考えると...」と分析する間に、守護者がすでに前に出ている。理論と行動のタイムラグが、実は完璧なタイミングを生んでいる。",
  },

  // careful-scholar (professor+guardian) pairs
  "careful-scholar--star-chaser": {
    label: "17回の確認と逆張りの夢",
    description:
      "慎重博士が「安全確認を」と17回チェックリストを回す間に、逆張り妄想家が「でもこの安全確認自体が普通じゃない?」と疑問を投げる。問いかけが18回目の確認を生む。",
  },
  "careful-scholar--dreaming-canvas": {
    label: "慎重な論理と映像の直感",
    description:
      "慎重博士が全ての可能性を検証するとき、夢想画家が「この感じ、夢で見た景色に似てる」と直感で判断する。論理と直感のクロスチェックが、最も精度の高い答えを出す。",
  },
  "careful-scholar--creative-disruptor": {
    label: "王道の安全と逆張りの破壊",
    description:
      "慎重博士が「安全な方法で」と計画するたびに、曲者が「その安全な方法、崩したら面白くない?」と提案する。安全の破壊と再構築を繰り返して、より強い方法が生まれる。",
  },
  "careful-scholar--ultimate-commander": {
    label: "17回の確認と覇王の「動け」",
    description:
      "慎重博士が「念のため確認を」と動こうとしない横で、覇王が「考えるより動け!」と叫ぶ。8回確認したところで覇王に押し出され、結果的に動いてよかったことが大半だ。",
  },
  "careful-scholar--eternal-dreamer": {
    label: "慎重な現実と永遠の夢",
    description:
      "慎重博士が「現実的に確認してから」と言うとき、永遠の妄想家は脳内で47回目の旅に出発している。いつかの「いつか」に備えて博士は慎重に準備し続ける。",
  },
  "careful-scholar--ultimate-trickster": {
    label: "安全確認と裏の裏の穴",
    description:
      "慎重博士が確認を重ねるたびに、策略家が「そこの裏の裏に穴がある」と指摘する。追加確認が増えていくが、全ての穴を塞いだ後は本当に無敵の計画になっている。",
  },
  "careful-scholar--ultimate-artist": {
    label: "慎重な検証と美の違和感",
    description:
      "慎重博士が全ての確認を終えると、美の追求者が「うーん、なんかここが違う」と言い出す。博士はため息をつきながら再確認を始めるが、その結果はいつも完璧になる。",
  },
  "careful-scholar--vibe-rebel": {
    label: "17回の確認と本能の一発",
    description:
      "慎重博士が17回目の確認をしている間に、野生の芸術家が一発の本能で正解を出している。後から検証すると本能の方が正確で、博士は「なぜだ」と首をひねる。",
  },

  // academic-artist (professor+artist) pairs
  "academic-artist--star-chaser": {
    label: "数式の美と斜めの夢",
    description:
      "データ詩人が「この理論、詩みたいだ」と感動すると、逆張り妄想家が「でも普通じゃない?斜めから見ると別の詩がある」と返す。詩と逆張りが重なって、二重の美が生まれる。",
  },
  "academic-artist--tender-dreamer": {
    label: "論理と感性の交差点",
    description:
      "データ詩人が感性で数式を読み取るとき、やさしい夢想家が「その気持ち、みんなに伝わるといいね」と言う。理系の美しさを人の温かさで包んだ、唯一無二の作品ができる。",
  },
  "academic-artist--clever-guardian": {
    label: "数式の詩と穴を塞ぐ戦略",
    description:
      "データ詩人が美しい理論を描くと、安全係が「その美しい理論、ここに穴がある」と指摘する。美しさと堅牢性が同時に追求され、鑑賞にも耐えるが崩れない設計が完成する。",
  },
  "academic-artist--ultimate-commander": {
    label: "数式の感動と覇王の号令",
    description:
      "データ詩人が数式の美しさに感動している間に、覇王が「感動は後でいい!動け!」と叫ぶ。動きながら感動できる技術を磨いた結果、世界一速い芸術家になる。",
  },
  "academic-artist--eternal-dreamer": {
    label: "論理の美と永遠の夢",
    description:
      "データ詩人が「このグラフ、美しすぎる」と感動すると、永遠の妄想家が「その美しさ、夢の中の景色に似てる」と応える。現実の美しさと夢の美しさが重なって、二人の会話は詩になる。",
  },
  "academic-artist--ultimate-trickster": {
    label: "詩的分析と裏読みの美",
    description:
      "データ詩人が「この美しさは...」と分析すると、策略家が「その美しさの裏を読むと、また別の美しさがある」と返す。表と裏の美しさを両方見られるのは、この二人だけだ。",
  },
  "academic-artist--ultimate-guardian": {
    label: "感性の論理と七重の安全",
    description:
      "データ詩人が美しい計画を描くとき、備えの王が「万一に備えて」と七重の安全網を準備する。美しさと堅牢性が同居する、世界で一番安心できる芸術作品が生まれる。",
  },
  "academic-artist--guardian-charger": {
    label: "詩と盾の共鳴",
    description:
      "データ詩人が感性と論理で美しい図を描くとき、守護者が「これを守るために前に出る」と決める。美しいものを守る意志が、作品に特別な意味を加える。",
  },

  // star-chaser (dreamer+trickster) pairs
  "gentle-fortress--star-chaser": {
    label: "温かい安全と斜めの夢",
    description:
      "逆張り妄想家が「この夢、普通じゃない?」と問うとき、守護芸術家が「どんな夢でも、傷つかずに追えるように」と温かく守る。保護と逆張りの組み合わせが、安全な冒険を生む。",
  },
  "star-chaser--ultimate-commander": {
    label: "逆張りの夢と覇王の突進",
    description:
      "逆張り妄想家が「でもこの方向、普通すぎない?」と立ち止まる瞬間、覇王が「考えるより動け!」と背中を押す。逆張りの方向に全力で突進したら、誰も到達できない場所に着いた。",
  },
  "endless-researcher--star-chaser": {
    label: "永遠の調査と逆張りの問い",
    description:
      "研究者が「まだ調べ足りない」と言い続けるとき、逆張り妄想家が「その調査の前提自体、普通じゃない?」と問う。前提が崩れて調査が一から始まるが、新しい発見も一から始まる。",
  },
  "star-chaser--ultimate-guardian": {
    label: "夢の逆張りと備えの壁",
    description:
      "逆張り妄想家が「この夢、変な方向に追いかけてみよう」と走り出すたびに、備えの王が「その方向も対策済み」と待ち構えている。どこへ走っても安全なのは、備えの王のおかげだ。",
  },
  "star-chaser--ultimate-artist": {
    label: "逆張りの夢と美の千回",
    description:
      "逆張り妄想家が「この夢の形、変すぎない?」と疑問を持つとき、美の追求者が「うーん、変だけど違う」と別の理由でやり直しを要求する。変さの追求と美の追求が交差する。",
  },
  "data-fortress--star-chaser": {
    label: "数値の城と逆張りの夢",
    description:
      "逆張り妄想家が「この夢、普通じゃない?」と問うたびに、論理守護者が「その問いの統計的有意性は...」と検証を始める。数値が逆張りを証明したとき、二人は最高に嬉しい。",
  },
  "guardian-charger--star-chaser": {
    label: "盾の突進と夢の逆張り",
    description:
      "守護者が「後ろの安全を確保して前に出る」と動くとき、逆張り妄想家が「でも前に出る必要ある?逆から考えると...」と問う。逆の問いが守護者に新しい盾の使い方を教える。",
  },

  // tender-dreamer (dreamer+guardian) pairs
  "creative-disruptor--tender-dreamer": {
    label: "逆張りの美学とやさしい全肯定",
    description:
      "曲者が「王道は捨てる」と宣言すると、やさしい夢想家が「でもどんな方向でも、みんなが楽しければいいですよね」と全肯定する。逆張りに優しさが加わると、尖りながら人を傷つけない。",
  },
  "tender-dreamer--ultimate-commander": {
    label: "みんなの幸せと覇王の突進",
    description:
      "やさしい夢想家が「みんなが幸せかどうか心配で...」と確認している間に、覇王が「全員ついてこい!」と走り出す。走った先でみんなが笑顔になれば、それが幸せだったと気づく。",
  },
  "endless-researcher--tender-dreamer": {
    label: "永遠の調査とやさしい心配",
    description:
      "研究者が「まだ調べ足りない」と調査を続けるとき、やさしい夢想家が「でも、ずっと調べてて疲れてない?」と心配する。その一言が研究者に初めての休息をもたらす。",
  },
  "tender-dreamer--ultimate-trickster": {
    label: "やさしい心配と裏の裏の配慮",
    description:
      "やさしい夢想家がこっそり心配しているとき、策略家が「その心配、裏から見ると別の意味がある」と指摘する。心配の裏を読んだ策略家が、夢想家より先に問題を解決してしまう。",
  },
  "tender-dreamer--ultimate-artist": {
    label: "みんなへの優しさと美の孤独",
    description:
      "やさしい夢想家が「みんなが笑ってれば」と気を配るとき、美の追求者が「うーん、この全員の笑顔、なんか違う」と言い出す。美を追求する孤独に、やさしさが温もりを加える。",
  },
  "tender-dreamer--vibe-rebel": {
    label: "全員の幸せと野生の孤独",
    description:
      "やさしい夢想家が「みんな幸せ?」と確認するとき、野生の芸術家がすでに3歩先に一人でいる。「あなたは幸せ?」と問いかけると、野生の芸術家は初めて立ち止まる。",
  },

  // dreaming-canvas (dreamer+artist) pairs
  "clever-guardian--dreaming-canvas": {
    label: "映像の夢と戦略的弱点探し",
    description:
      "夢想画家が脳内映画を上映している間、安全係が「そのシーンに穴がある」と指摘する。映像に構造上の弱点がないか検証する二人の会話は、映画評論を超えた何かになる。",
  },
  "dreaming-canvas--ultimate-commander": {
    label: "脳内映画と覇王の号令",
    description:
      "夢想画家が脳内映画を上映中に、覇王が「その映画、現実にするぞ!」と叫ぶ。驚いて目を開けた画家が見た現実は、脳内映画よりも少しだけ輝いていた。",
  },
  "dreaming-canvas--endless-researcher": {
    label: "映像の直感と文献の山",
    description:
      "夢想画家が「この景色、夢で見た気がする」と直感するとき、研究者が「類似事例を調べてみた」と資料を積み上げる。直感と文献が合流したとき、唯一無二の答えが生まれる。",
  },
  "dreaming-canvas--ultimate-trickster": {
    label: "感性の映像と策略の逆再生",
    description:
      "夢想画家が映像を順方向に見るとき、策略家が「逆再生したら別の意味が現れる」と言う。映像の裏を読む遊びが、二人だけの暗号解読セッションになる。",
  },
  "dreaming-canvas--ultimate-guardian": {
    label: "映像の夢と七重の防壁",
    description:
      "夢想画家が映像の夢に没頭するとき、備えの王が「現実で守る準備ができている」と静かに立っている。夢を守る意志が、画家を現実から切り離さずにいさせる。",
  },
  "data-fortress--dreaming-canvas": {
    label: "データの城と映像の夢",
    description:
      "論理守護者が「全て数値で把握した」と報告するとき、夢想画家が「でもその数値、映像にすると全然違う色をしてる」と言う。数値と映像が翻訳し合って、新しい現実が浮かび上がる。",
  },
  "dreaming-canvas--guardian-charger": {
    label: "脳内映画と盾の守護者",
    description:
      "夢想画家が脳内映画に没頭するとき、守護者が「その映画を守るために前に出る」と決める。誰かが守ってくれているから、画家は安心して夢を見続けることができる。",
  },

  // clever-guardian (trickster+guardian) pairs
  "clever-guardian--ultimate-commander": {
    label: "穴を塞ぐ者と穴を無視する覇王",
    description:
      "安全係が「ここに穴がある」と塞ごうとする間に、覇王が「穴があっても動けばいい!」と突進する。塞ぎ終えた頃には覇王がすでに帰ってきている。それが奇跡的に機能している。",
  },
  "clever-guardian--endless-researcher": {
    label: "戦略的安全と情報の蓄積",
    description:
      "安全係が「悪用できる穴を塞いだ」と言うと、研究者が「その穴の学術的背景を調べてみた」と資料を出す。実用と理論が合流して、最強の防衛計画書ができ上がる。",
  },
  "clever-guardian--eternal-dreamer": {
    label: "穴を見つける者と夢の建築家",
    description:
      "安全係が「その夢、構造上に穴がある」と指摘すると、永遠の妄想家が「じゃあ47回目の旅でそこを修正してみよう」と夢の設計図を書き直す。夢に構造の強さが加わっていく。",
  },
  "clever-guardian--ultimate-artist": {
    label: "戦略的防衛と美の追求",
    description:
      "安全係が全ての穴を塞いだとき、美の追求者が「その塞ぎ方、なんか違う」と言い出す。機能的に正しいが美しくないと言われると、安全係は初めて美学と向き合う。",
  },

  // creative-disruptor (trickster+artist) pairs
  "creative-disruptor--ultimate-commander": {
    label: "逆張りの破壊と覇王の突進",
    description:
      "曲者が「王道は崩す」と宣言する横で、覇王が「王道で突進する!」と叫ぶ。両極端が同じ場所を目指していて、やがてどちらも王道でも逆張りでもない新しい道を作る。",
  },
  "creative-disruptor--endless-researcher": {
    label: "逆張りの実験と検証の蓄積",
    description:
      "曲者が「王道を崩す実験を始める」と言うと、研究者が「その実験の先行研究を調べてから」と資料を積む。逆張りに学術的根拠がついて、誰も反論できない破壊が完成する。",
  },
  "creative-disruptor--eternal-dreamer": {
    label: "逆張りの破壊と夢の永続",
    description:
      "曲者が「王道を崩した」と宣言すると、永遠の妄想家が「崩れた後の夢、脳内で見えてる」と言う。現実の破壊と夢の再建が同時に起きて、前より美しい形になる。",
  },
  "creative-disruptor--ultimate-guardian": {
    label: "破壊の美学と七重の守護",
    description:
      "曲者が「崩す」と動くたびに、備えの王が「崩した後の対策を立てた」と準備している。破壊と復元が同時進行で、壊れながら強くなる仕組みができ上がる。",
  },
  "creative-disruptor--data-fortress": {
    label: "逆張りの感性とデータの城壁",
    description:
      "曲者が感性で逆張りを決めると、論理守護者が「その逆張り、データで検証してみた」と報告書を出す。感性の逆張りが数値で証明されたとき、二人は最高に満足する。",
  },
  "creative-disruptor--guardian-charger": {
    label: "破壊と盾の奇妙な連携",
    description:
      "曲者が王道を崩している間、守護者が「崩した後ろを守るために前に出る」と盾を構える。破壊と守護が連動して、全員が安全に次のステージへ進む道が開かれる。",
  },

  // gentle-fortress (guardian+artist) pairs
  "gentle-fortress--ultimate-commander": {
    label: "静かな守護と覇王の熱量",
    description:
      "覇王が「行くぞ!」と叫ぶたびに、守護芸術家が「でも、誰か疲れてるかも」と囁く。覇王は一瞬止まり、疲れた一人を確認してから再び全速力で走り出す。",
  },
  "endless-researcher--gentle-fortress": {
    label: "知識の蓄積と温かい一時停止",
    description:
      "研究者が「まだ調べ足りない」と調査を続けるとき、守護芸術家が「少し休んで」とお茶を出す。その休憩中に、ずっと探していた答えがひとりでに浮かび上がる。",
  },
  "eternal-dreamer--gentle-fortress": {
    label: "永遠の夢と温かい現実の錨",
    description:
      "永遠の妄想家が脳内旅行から帰れなくなりそうなとき、守護芸術家が「ここにいるよ」と静かに手を差し伸べる。現実の温かさが、夢の旅に帰り道を作ってくれる。",
  },
  "gentle-fortress--ultimate-trickster": {
    label: "温かい安全と裏の裏の配慮",
    description:
      "守護芸術家が「誰か傷ついてないか」と気を配るとき、策略家が「その心配の裏を読むと...」と分析する。感情的な配慮と戦略的な配慮が重なって、誰も傷つかない場が作られる。",
  },

  // ultimate-commander (commander+commander) pairs
  "endless-researcher--ultimate-commander": {
    label: "覇王の号令と永遠の準備",
    description:
      "覇王が「動け!」と叫ぶたびに、研究者が「もう少し調べてから」と答える。10回のやり取りの後、研究者が動き出した瞬間が最高のタイミングだったことを覇王は認める。",
  },
  "eternal-dreamer--ultimate-commander": {
    label: "覇王の現実と夢の宇宙",
    description:
      "覇王が「現実で動け!」と叫ぶとき、永遠の妄想家は47回目の夢の旅の途中だ。覇王の号令が夢の中まで届いて、妄想家がなぜか現実に帰ってくることがある。",
  },
  "ultimate-commander--ultimate-trickster": {
    label: "覇王と策略家の宇宙規模の攻防",
    description:
      "覇王が「突進!」と叫ぶと、策略家が「裏から行く方が速いっしょ」と返す。二人が同じ目標を持ちながら全く違うルートで走り、なぜか同時にゴールする。",
  },
  "ultimate-commander--ultimate-guardian": {
    label: "覇王の突進と備えの要塞",
    description:
      "覇王が「行くぞ!」と突進するたびに、備えの王が「対策は済んでいる」と静かに答える。最も無謀な攻撃と最も堅固な守りが組み合わさって、無敵のチームが生まれる。",
  },
  "ultimate-artist--ultimate-commander": {
    label: "覇王の熱量と美の千回否定",
    description:
      "覇王が「完成した!」と叫ぶたびに、美の追求者が「うーん、なんか違う」と言い出す。締切があっても「違う」と言い続ける美の追求者に、覚王も頭を下げることがある。",
  },
  "data-fortress--ultimate-commander": {
    label: "覇王の突進とデータの城壁",
    description:
      "覚王が「動け!」と叫ぶとき、論理守護者が「統計的には3秒後が最適タイミングです」と答える。3秒待った覇王の突進が、いつもより2倍の成果を生む。",
  },
  "ultimate-commander--vibe-rebel": {
    label: "覇王の号令と野生の本能",
    description:
      "覇王が「全員ついてこい!」と叫ぶとき、野生の芸術家がすでに本能で正解の道を走っている。号令と本能が同じ方向を向いた瞬間、チームが覚醒する。",
  },

  // endless-researcher (professor+professor) pairs
  "endless-researcher--eternal-dreamer": {
    label: "永遠の調査と永遠の夢",
    description:
      "研究者が「まだ調べ足りない」と言い続け、妄想家が「いつかやる」と言い続ける。二人が出会うと、誰も行動しないが世界で一番深い会話が生まれる。",
  },
  "endless-researcher--ultimate-trickster": {
    label: "知識の蓄積と裏の裏の問い",
    description:
      "研究者が膨大な知識を積み上げるとき、策略家が「その知識の裏の裏に何がある?」と問う。問いが深くなるにつれて、研究者の調査対象がどんどん面白くなる。",
  },
  "endless-researcher--ultimate-guardian": {
    label: "情報の完全収集と七重の安全確認",
    description:
      "研究者が「情報が足りない」と言うとき、備えの王が「念のため確認をもう一度」と言う。二人の慎重さが合わさると、世界で最も安全で最も情報量の多い計画ができ上がる。",
  },
  "endless-researcher--ultimate-artist": {
    label: "完璧な知識と美の永遠否定",
    description:
      "研究者が「完璧に調べ上げた」と言うとき、美の追求者が「うーん、その調べ方が違う」と言い出す。否定を経て調査方法が磨かれ、調べ上げた内容が美しくなっていく。",
  },
  "endless-researcher--vibe-rebel": {
    label: "文献の山と本能の一発",
    description:
      "研究者が文献を読み続ける横で、野生の芸術家が一発の本能で正解を出している。調べ続けた末に研究者が出した結論と、本能の答えが一致したとき、二人は声を上げる。",
  },
  "endless-researcher--guardian-charger": {
    label: "知識の蓄積と盾の決断",
    description:
      "研究者が「もう少し調べてから」と準備するとき、守護者が「後ろが安全なら今が動くべき時」と前に出る。研究者の知識と守護者の決断力が合流して、最強の一手が生まれる。",
  },

  // eternal-dreamer (dreamer+dreamer) pairs
  "eternal-dreamer--ultimate-trickster": {
    label: "47回目の旅と裏の裏の旅程",
    description:
      "永遠の妄想家が47回目の旅に出発するとき、策略家が「その旅程の裏を読むと別のルートがある」と言う。夢の裏を読んだ旅は、本来の夢より面白くなることがある。",
  },
  "eternal-dreamer--ultimate-guardian": {
    label: "夢の旅と現実の安全網",
    description:
      "永遠の妄想家が「いつかやる」と言い続けるとき、備えの王が「いつかのための準備を今日もした」と静かに言う。夢に現実の安全網がついて、着手できる日が少し近くなる。",
  },
  "eternal-dreamer--ultimate-artist": {
    label: "永遠の夢と美の千回否定",
    description:
      "永遠の妄想家が「いつかやる」と言い、美の追求者が「うーん、なんか違う」と言う。この二人が同じ部屋にいると、何も生産されないが何か大切なものが育つ。",
  },
  "data-fortress--eternal-dreamer": {
    label: "数値の城と夢の無限",
    description:
      "論理守護者が「全てのリスクを数値化した」と報告するとき、永遠の妄想家が「でも夢の中ではそのリスクが輝いてた」と言う。数値で証明された夢は、より追いかける価値がある。",
  },
  "eternal-dreamer--vibe-rebel": {
    label: "永遠の夢と本能の現在",
    description:
      "永遠の妄想家が「いつか」と言い続けるとき、野生の芸術家はすでに本能で「今」を生きている。過去と現在が交差する瞬間、永遠の夢が初めて動き出す。",
  },
  "eternal-dreamer--guardian-charger": {
    label: "夢の無限と盾の一歩",
    description:
      "永遠の妄想家が「いつかやる」と言い続けるとき、守護者が「夢を守るために今日一歩前に出た」と言う。守護者の一歩が、妄想家のいつかを一日近づける。",
  },

  // ultimate-trickster (trickster+trickster) pairs
  "ultimate-guardian--ultimate-trickster": {
    label: "裏の裏の策と七重の壁",
    description:
      "策略家が裏の裏を読み続けるとき、備えの王が「その裏の裏の裏まで対策済みだよ」と静かに言う。どこまでも深く行っても防がれると気づいた策略家は、初めて正面突破を試みる。",
  },
  "ultimate-artist--ultimate-trickster": {
    label: "裏の裏の策と美の千回否定",
    description:
      "策略家が「裏の裏が正解」と言うとき、美の追求者が「うーん、その裏の裏が違う」と否定する。裏の裏を美的に否定し続けた結果、思いがけない正解が現れる。",
  },
  "data-fortress--ultimate-trickster": {
    label: "裏の裏の策とデータの証明",
    description:
      "策略家が裏の裏を計算するとき、論理守護者が「そのルート、統計的には確率3%だよ」と言う。3%を選び続ける策略家と、3%の記録を積み上げる守護者の奇妙な共同研究。",
  },
  "guardian-charger--ultimate-trickster": {
    label: "裏の策と盾の正面突破",
    description:
      "策略家が「裏から行く方が面白い」と計算するとき、守護者が「後ろを守るために正面に出る」と言う。裏と正面が同時に動いて、相手には対処不能な戦略になる。",
  },

  // ultimate-guardian (guardian+guardian) pairs
  "ultimate-artist--ultimate-guardian": {
    label: "七重の傘と美の永遠追求",
    description:
      "備えの王が七重の傘を準備するとき、美の追求者が「その傘の色がなんか違う」と言う。美学に基づいて傘が選び直された結果、機能的にも美しい世界一の傘が完成する。",
  },
  "ultimate-guardian--vibe-rebel": {
    label: "七重の備えと野生の本能",
    description:
      "備えの王が全てのリスクを想定して準備するとき、野生の芸術家が本能で全てを無視して走る。二人のどちらかが正解のとき、もう一人が確実にカバーしている。",
  },

  // ultimate-artist (artist+artist) pairs
  "data-fortress--ultimate-artist": {
    label: "数値の城と美の千回否定",
    description:
      "論理守護者が「全てのデータが揃った」と報告するとき、美の追求者が「うーん、そのデータの提示方法が違う」と言う。美しいデータビジュアライゼーションを求めた結果、全員が理解できるレポートになる。",
  },
  "guardian-charger--ultimate-artist": {
    label: "盾の守護と美の孤独",
    description:
      "守護者が「美しいものを守るために前に出る」と決めるとき、美の追求者が「うーん、その守り方が違う」と言う。美を守る形まで美しくしようとする二人の間で、芸術と行動が融合する。",
  },

  // data-fortress (guardian+professor) pairs
  "data-fortress--vibe-rebel": {
    label: "データの城と感性の爆走",
    description:
      "論理守護者が「全ての数値を把握した」と言うとき、野生の芸術家が感性だけで正解を出している。数値と感性が同じ答えを示したとき、二人は言葉なく目を合わせる。",
  },

  // vibe-rebel (artist+trickster) pairs
  "guardian-charger--vibe-rebel": {
    label: "盾の守護と野生の爆走",
    description:
      "野生の芸術家が本能で3歩先に行ったとき、守護者がすでにその3歩先の安全を確保してから前に出ていた。守護と本能が重なる場所で、二人は初めて言葉を交わす。",
  },
};
