// Keigo category types
export type KeigoCategory = "basic" | "business" | "service";

export type KeigoCategoryInfo = {
  id: KeigoCategory;
  name: string;
};

// Keigo entry type
export type KeigoEntry = {
  id: string;
  casual: string;
  sonkeigo: string;
  kenjogo: string;
  teineigo: string;
  category: KeigoCategory;
  examples: {
    context: string;
    casual: string;
    sonkeigo: string;
    kenjogo: string;
  }[];
  notes?: string;
};

// Common mistake types
export type MistakeType =
  | "double-keigo"
  | "wrong-direction"
  | "baito-keigo"
  | "other";

export type CommonMistake = {
  id: string;
  wrong: string;
  correct: string;
  explanation: string;
  mistakeType: MistakeType;
};

// --- Category data ---

const KEIGO_CATEGORIES: KeigoCategoryInfo[] = [
  { id: "basic", name: "基本動詞" },
  { id: "business", name: "ビジネス" },
  { id: "service", name: "接客・サービス" },
];

// --- Keigo entries data ---
// Sources referenced: 文化庁「敬語の指針」, 各種敬語辞典
// 尊敬語 = 相手の動作を高める, 謙譲語 = 自分の動作をへりくだる

const KEIGO_ENTRIES: KeigoEntry[] = [
  // ===== 基本動詞 (basic) =====
  {
    id: "iku",
    casual: "行く",
    sonkeigo: "いらっしゃる・おいでになる",
    kenjogo: "参る・うかがう",
    teineigo: "行きます",
    category: "basic",
    examples: [
      {
        context: "移動先を伝えるとき",
        casual: "社長が東京に行く",
        sonkeigo: "社長が東京にいらっしゃる",
        kenjogo: "私が東京に参ります",
      },
    ],
    notes:
      "「うかがう」は訪問先に敬意を表す場合に使う。「参る」は丁重語としても使われる",
  },
  {
    id: "kuru",
    casual: "来る",
    sonkeigo: "いらっしゃる・おいでになる・お見えになる・お越しになる",
    kenjogo: "参る",
    teineigo: "来ます",
    category: "basic",
    examples: [
      {
        context: "来客を伝えるとき",
        casual: "お客様が来た",
        sonkeigo: "お客様がいらっしゃった",
        kenjogo: "私が参りました",
      },
    ],
  },
  {
    id: "iru",
    casual: "いる",
    sonkeigo: "いらっしゃる・おいでになる",
    kenjogo: "おる",
    teineigo: "います",
    category: "basic",
    examples: [
      {
        context: "在席を確認するとき",
        casual: "部長はいる？",
        sonkeigo: "部長はいらっしゃいますか",
        kenjogo: "私はここにおります",
      },
    ],
    notes: "「おる」は丁重語としても使われる",
  },
  {
    id: "suru",
    casual: "する",
    sonkeigo: "なさる・される",
    kenjogo: "いたす",
    teineigo: "します",
    category: "basic",
    examples: [
      {
        context: "作業について話すとき",
        casual: "部長がそうする",
        sonkeigo: "部長がそうなさる",
        kenjogo: "私がいたします",
      },
    ],
  },
  {
    id: "iu",
    casual: "言う",
    sonkeigo: "おっしゃる",
    kenjogo: "申す・申し上げる",
    teineigo: "言います",
    category: "basic",
    examples: [
      {
        context: "発言を伝えるとき",
        casual: "部長が言った",
        sonkeigo: "部長がおっしゃった",
        kenjogo: "私が申し上げた",
      },
    ],
    notes: "「申す」は丁重語としても使われる",
  },
  {
    id: "miru",
    casual: "見る",
    sonkeigo: "ご覧になる",
    kenjogo: "拝見する",
    teineigo: "見ます",
    category: "basic",
    examples: [
      {
        context: "資料を見るとき",
        casual: "この資料を見てください",
        sonkeigo: "こちらの資料をご覧ください",
        kenjogo: "資料を拝見いたします",
      },
    ],
  },
  {
    id: "kiku",
    casual: "聞く",
    sonkeigo: "お聞きになる",
    kenjogo: "うかがう・拝聴する・承る",
    teineigo: "聞きます",
    category: "basic",
    examples: [
      {
        context: "話を聞くとき",
        casual: "部長が聞いた",
        sonkeigo: "部長がお聞きになった",
        kenjogo: "私がうかがいました",
      },
    ],
    notes:
      "「承る」は注文や伝言を受ける場合に多用。「拝聴する」は講演などを聞く場合",
  },
  {
    id: "taberu",
    casual: "食べる",
    sonkeigo: "召し上がる",
    kenjogo: "いただく",
    teineigo: "食べます",
    category: "basic",
    examples: [
      {
        context: "食事のとき",
        casual: "部長が食べた",
        sonkeigo: "部長が召し上がった",
        kenjogo: "私がいただきました",
      },
    ],
  },
  {
    id: "nomu",
    casual: "飲む",
    sonkeigo: "召し上がる",
    kenjogo: "いただく",
    teineigo: "飲みます",
    category: "basic",
    examples: [
      {
        context: "飲み物をすすめるとき",
        casual: "コーヒーを飲んでください",
        sonkeigo: "コーヒーを召し上がってください",
        kenjogo: "コーヒーをいただきます",
      },
    ],
  },
  {
    id: "yomu",
    casual: "読む",
    sonkeigo: "お読みになる",
    kenjogo: "拝読する",
    teineigo: "読みます",
    category: "basic",
    examples: [
      {
        context: "メールを読むとき",
        casual: "メールを読んだ",
        sonkeigo: "メールをお読みになった",
        kenjogo: "メールを拝読しました",
      },
    ],
  },
  {
    id: "kaku",
    casual: "書く",
    sonkeigo: "お書きになる",
    kenjogo: "お書きする",
    teineigo: "書きます",
    category: "basic",
    examples: [
      {
        context: "書類を書くとき",
        casual: "先生が書いた",
        sonkeigo: "先生がお書きになった",
        kenjogo: "私がお書きします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "au",
    casual: "会う",
    sonkeigo: "お会いになる",
    kenjogo: "お目にかかる",
    teineigo: "会います",
    category: "basic",
    examples: [
      {
        context: "面会のとき",
        casual: "社長に会った",
        sonkeigo: "社長にお会いになった",
        kenjogo: "社長にお目にかかりました",
      },
    ],
  },
  {
    id: "shiru",
    casual: "知る",
    sonkeigo: "ご存じ",
    kenjogo: "存じる・存じ上げる",
    teineigo: "知っています",
    category: "basic",
    examples: [
      {
        context: "知っているか尋ねるとき",
        casual: "この件を知っている？",
        sonkeigo: "この件をご存じですか",
        kenjogo: "その件は存じております",
      },
    ],
    notes: "「ご存じ」は形容詞的な用法",
  },
  {
    id: "omou",
    casual: "思う",
    sonkeigo: "お思いになる・思われる",
    kenjogo: "存じる",
    teineigo: "思います",
    category: "basic",
    examples: [
      {
        context: "意見を述べるとき",
        casual: "部長はどう思う？",
        sonkeigo: "部長はどうお思いになりますか",
        kenjogo: "私はそのように存じます",
      },
    ],
  },
  {
    id: "kangaeru",
    casual: "考える",
    sonkeigo: "お考えになる",
    kenjogo: "検討いたす・拝察する",
    teineigo: "考えます",
    category: "basic",
    examples: [
      {
        context: "検討するとき",
        casual: "どう考える？",
        sonkeigo: "どうお考えになりますか",
        kenjogo: "検討いたします",
      },
    ],
    notes:
      "固有の謙譲語形はない。文脈に応じて「検討いたす」「拝察する」等を使い分ける",
  },
  {
    id: "neru",
    casual: "寝る",
    sonkeigo: "お休みになる",
    kenjogo: "（謙譲語なし）",
    teineigo: "寝ます",
    category: "basic",
    examples: [
      {
        context: "就寝のとき",
        casual: "もう寝た？",
        sonkeigo: "もうお休みになりましたか",
        kenjogo: "お先に失礼いたします",
      },
    ],
    notes:
      "自動詞のため固有の謙譲語形はない。尊敬語は「休む」と共通で「お休みになる」を使う。丁寧語「寝ます」で表現するのが一般的",
  },
  {
    id: "okiru",
    casual: "起きる",
    sonkeigo: "お起きになる",
    kenjogo: "（謙譲語なし）",
    teineigo: "起きます",
    category: "basic",
    examples: [
      {
        context: "起床のとき",
        casual: "何時に起きた？",
        sonkeigo: "何時にお起きになりましたか",
        kenjogo: "6時に起床いたしました",
      },
    ],
    notes:
      "自動詞のため固有の謙譲語形はない。丁重に述べる場合は「起床いたす」を使うか、丁寧語「起きます」で十分な場合が多い",
  },
  {
    id: "suwaru",
    casual: "座る",
    sonkeigo: "お掛けになる",
    kenjogo: "お掛けする",
    teineigo: "座ります",
    category: "basic",
    examples: [
      {
        context: "席をすすめるとき",
        casual: "ここに座って",
        sonkeigo: "こちらにお掛けになってください",
        kenjogo: "こちらにお掛けいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "tatsu",
    casual: "立つ",
    sonkeigo: "お立ちになる",
    kenjogo: "お立ちする",
    teineigo: "立ちます",
    category: "basic",
    examples: [
      {
        context: "席を立つとき",
        casual: "先生が立った",
        sonkeigo: "先生がお立ちになった",
        kenjogo: "私がお立ちいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "matsu",
    casual: "待つ",
    sonkeigo: "お待ちになる",
    kenjogo: "お待ちする",
    teineigo: "待ちます",
    category: "basic",
    examples: [
      {
        context: "待ってもらうとき",
        casual: "ちょっと待って",
        sonkeigo: "少々お待ちください",
        kenjogo: "こちらでお待ちしております",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "kaeru",
    casual: "帰る",
    sonkeigo: "お帰りになる",
    kenjogo: "おいとまする・失礼する",
    teineigo: "帰ります",
    category: "basic",
    examples: [
      {
        context: "退出するとき",
        casual: "お客様が帰った",
        sonkeigo: "お客様がお帰りになった",
        kenjogo: "そろそろおいとまいたします",
      },
    ],
  },
  {
    id: "morau",
    casual: "もらう",
    sonkeigo: "お受け取りになる",
    kenjogo: "いただく・頂戴する",
    teineigo: "もらいます",
    category: "basic",
    examples: [
      {
        context: "贈り物を受け取るとき",
        casual: "先生からもらった",
        sonkeigo: "先生がお受け取りになった",
        kenjogo: "先生からいただきました",
      },
    ],
  },
  {
    id: "ageru",
    casual: "あげる",
    sonkeigo: "お与えになる",
    kenjogo: "差し上げる",
    teineigo: "あげます",
    category: "basic",
    examples: [
      {
        context: "贈り物を渡すとき",
        casual: "先生にあげた",
        sonkeigo: "先生がお与えになった",
        kenjogo: "先生に差し上げた",
      },
    ],
  },
  {
    id: "kureru",
    casual: "くれる",
    sonkeigo: "くださる",
    kenjogo: "-",
    teineigo: "くれます",
    category: "basic",
    examples: [
      {
        context: "何かを頂いたとき",
        casual: "先生がくれた",
        sonkeigo: "先生がくださった",
        kenjogo: "-",
      },
    ],
    notes:
      "「くれる」は相手の動作のため謙譲語はない。自分が受け取る場合は「いただく」を使う",
  },
  {
    id: "tsukuru",
    casual: "作る",
    sonkeigo: "お作りになる",
    kenjogo: "お作りする",
    teineigo: "作ります",
    category: "basic",
    examples: [
      {
        context: "資料を作るとき",
        casual: "先生が作った",
        sonkeigo: "先生がお作りになった",
        kenjogo: "私がお作りいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "hanasu",
    casual: "話す",
    sonkeigo: "お話しになる・話される",
    kenjogo: "お話しする・申す",
    teineigo: "話します",
    category: "basic",
    examples: [
      {
        context: "会話するとき",
        casual: "先生が話した",
        sonkeigo: "先生がお話しになった",
        kenjogo: "私からお話しいたします",
      },
    ],
  },

  // ===== ビジネス頻出 (business) =====
  {
    id: "okuru",
    casual: "送る",
    sonkeigo: "お送りになる",
    kenjogo: "お送りする",
    teineigo: "送ります",
    category: "business",
    examples: [
      {
        context: "書類を送るとき",
        casual: "資料を送った",
        sonkeigo: "資料をお送りになった",
        kenjogo: "資料をお送りいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "todokeru",
    casual: "届ける",
    sonkeigo: "お届けになる",
    kenjogo: "お届けする",
    teineigo: "届けます",
    category: "business",
    examples: [
      {
        context: "荷物を届けるとき",
        casual: "荷物を届けた",
        sonkeigo: "荷物をお届けになった",
        kenjogo: "荷物をお届けいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "uketoru",
    casual: "受け取る",
    sonkeigo: "お受け取りになる",
    kenjogo: "受領する・頂戴する",
    teineigo: "受け取ります",
    category: "business",
    examples: [
      {
        context: "書類を受け取るとき",
        casual: "書類を受け取った",
        sonkeigo: "書類をお受け取りになった",
        kenjogo: "書類を頂戴いたしました",
      },
    ],
  },
  {
    id: "kakunin-suru",
    casual: "確認する",
    sonkeigo: "ご確認になる・確認される",
    kenjogo: "確認いたす",
    teineigo: "確認します",
    category: "business",
    examples: [
      {
        context: "内容を確認するとき",
        casual: "内容を確認してください",
        sonkeigo: "内容をご確認ください",
        kenjogo: "内容を確認いたします",
      },
    ],
    notes:
      "「ご確認ください」は「ご〜ください」パターンで、ビジネスメールで頻出",
  },
  {
    id: "shochi-suru",
    casual: "了解する・承知する",
    sonkeigo: "-",
    kenjogo: "承知いたす・かしこまる",
    teineigo: "了解しました・承知しました",
    category: "business",
    examples: [
      {
        context: "指示を受けるとき",
        casual: "わかった",
        sonkeigo: "-",
        kenjogo: "承知いたしました",
      },
    ],
    notes:
      "「了解しました」は目上に使うと失礼と感じる人もいる。「承知しました」「かしこまりました」が無難",
  },
  {
    id: "tsutaeru",
    casual: "伝える",
    sonkeigo: "お伝えになる",
    kenjogo: "お伝えする・申し伝える",
    teineigo: "伝えます",
    category: "business",
    examples: [
      {
        context: "伝言を頼むとき",
        casual: "部長に伝えておく",
        sonkeigo: "部長がお伝えになった",
        kenjogo: "部長に申し伝えます",
      },
    ],
  },
  {
    id: "hokoku-suru",
    casual: "報告する",
    sonkeigo: "ご報告になる",
    kenjogo: "ご報告する・ご報告申し上げる",
    teineigo: "報告します",
    category: "business",
    examples: [
      {
        context: "上司に報告するとき",
        casual: "結果を報告する",
        sonkeigo: "結果をご報告になった",
        kenjogo: "結果をご報告いたします",
      },
    ],
  },
  {
    id: "sodan-suru",
    casual: "相談する",
    sonkeigo: "ご相談になる",
    kenjogo: "ご相談する・ご相談申し上げる",
    teineigo: "相談します",
    category: "business",
    examples: [
      {
        context: "上司に相談するとき",
        casual: "相談したいことがある",
        sonkeigo: "ご相談なさりたい件がおありとのことです",
        kenjogo: "ご相談したいことがございます",
      },
    ],
  },
  {
    id: "irai-suru",
    casual: "依頼する",
    sonkeigo: "ご依頼になる",
    kenjogo: "お願いする・ご依頼申し上げる",
    teineigo: "依頼します",
    category: "business",
    examples: [
      {
        context: "仕事を頼むとき",
        casual: "翻訳を依頼する",
        sonkeigo: "翻訳をご依頼になった",
        kenjogo: "翻訳をお願いいたします",
      },
    ],
  },
  {
    id: "kotowaru",
    casual: "断る",
    sonkeigo: "お断りになる",
    kenjogo: "お断りする・辞退する",
    teineigo: "断ります",
    category: "business",
    examples: [
      {
        context: "提案を断るとき",
        casual: "今回は断る",
        sonkeigo: "今回はお断りになった",
        kenjogo: "今回はお断りいたします",
      },
    ],
  },
  {
    id: "houmon-suru",
    casual: "訪問する",
    sonkeigo: "ご訪問になる",
    kenjogo: "うかがう・お訪ねする",
    teineigo: "訪問します",
    category: "business",
    examples: [
      {
        context: "取引先を訪問するとき",
        casual: "明日訪問する",
        sonkeigo: "明日ご訪問になる",
        kenjogo: "明日うかがいます",
      },
    ],
  },
  {
    id: "annai-suru",
    casual: "案内する",
    sonkeigo: "ご案内になる",
    kenjogo: "ご案内する",
    teineigo: "案内します",
    category: "business",
    examples: [
      {
        context: "会議室に案内するとき",
        casual: "会議室に案内する",
        sonkeigo: "会議室にご案内になった",
        kenjogo: "会議室にご案内いたします",
      },
    ],
  },
  {
    id: "setsumei-suru",
    casual: "説明する",
    sonkeigo: "ご説明になる",
    kenjogo: "ご説明する・ご説明申し上げる",
    teineigo: "説明します",
    category: "business",
    examples: [
      {
        context: "内容を説明するとき",
        casual: "内容を説明する",
        sonkeigo: "内容をご説明になった",
        kenjogo: "内容をご説明いたします",
      },
    ],
  },
  {
    id: "shokai-suru",
    casual: "紹介する",
    sonkeigo: "ご紹介になる",
    kenjogo: "ご紹介する・ご紹介申し上げる",
    teineigo: "紹介します",
    category: "business",
    examples: [
      {
        context: "人を紹介するとき",
        casual: "担当者を紹介する",
        sonkeigo: "担当者をご紹介になった",
        kenjogo: "担当者をご紹介いたします",
      },
    ],
  },
  {
    id: "renraku-suru",
    casual: "連絡する",
    sonkeigo: "ご連絡になる・ご連絡くださる",
    kenjogo: "ご連絡する・ご連絡申し上げる",
    teineigo: "連絡します",
    category: "business",
    examples: [
      {
        context: "連絡するとき",
        casual: "後で連絡する",
        sonkeigo: "後ほどご連絡くださるとのことです",
        kenjogo: "後ほどご連絡いたします",
      },
    ],
  },
  {
    id: "henji-suru",
    casual: "返事する",
    sonkeigo: "ご返答になる",
    kenjogo: "お返事する・ご返答申し上げる",
    teineigo: "返事します",
    category: "business",
    examples: [
      {
        context: "返信するとき",
        casual: "明日返事する",
        sonkeigo: "明日ご返答くださるとのことです",
        kenjogo: "明日お返事いたします",
      },
    ],
  },
  {
    id: "kariru",
    casual: "借りる",
    sonkeigo: "お借りになる",
    kenjogo: "拝借する",
    teineigo: "借ります",
    category: "business",
    examples: [
      {
        context: "備品を借りるとき",
        casual: "ペンを借りた",
        sonkeigo: "ペンをお借りになった",
        kenjogo: "ペンを拝借いたします",
      },
    ],
  },
  {
    id: "kasu",
    casual: "貸す",
    sonkeigo: "お貸しになる・お貸しくださる",
    kenjogo: "お貸しする",
    teineigo: "貸します",
    category: "business",
    examples: [
      {
        context: "備品を貸すとき",
        casual: "ペンを貸した",
        sonkeigo: "ペンをお貸しくださった",
        kenjogo: "ペンをお貸しいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "miseru",
    casual: "見せる",
    sonkeigo: "お見せになる",
    kenjogo: "お見せする・お目にかける",
    teineigo: "見せます",
    category: "business",
    examples: [
      {
        context: "資料を見せるとき",
        casual: "資料を見せる",
        sonkeigo: "資料をお見せになった",
        kenjogo: "資料をお目にかけます",
      },
    ],
  },
  {
    id: "oshieru",
    casual: "教える",
    sonkeigo: "お教えになる・教えてくださる",
    kenjogo: "お教えする",
    teineigo: "教えます",
    category: "business",
    examples: [
      {
        context: "やり方を教えるとき",
        casual: "先生が教えてくれた",
        sonkeigo: "先生がお教えくださった",
        kenjogo: "私がお教えいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "tanomu",
    casual: "頼む",
    sonkeigo: "お頼みになる",
    kenjogo: "お頼みする・お願いする",
    teineigo: "頼みます",
    category: "business",
    examples: [
      {
        context: "仕事を頼むとき",
        casual: "これを頼みたい",
        sonkeigo: "これをお頼みになった",
        kenjogo: "これをお願いいたします",
      },
    ],
  },
  {
    id: "yurusu",
    casual: "許す",
    sonkeigo: "お許しになる",
    kenjogo: "お許しいただく",
    teineigo: "許します",
    category: "business",
    examples: [
      {
        context: "許可を求めるとき",
        casual: "遅刻を許してほしい",
        sonkeigo: "遅刻をお許しになった",
        kenjogo: "遅刻をお許しいただけますか",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜いただく」パターンを使う",
  },
  {
    id: "mataseru",
    casual: "待たせる",
    sonkeigo: "お待たせになる",
    kenjogo: "お待たせする",
    teineigo: "待たせます",
    category: "business",
    examples: [
      {
        context: "相手を待たせたとき",
        casual: "待たせてすまない",
        sonkeigo: "-",
        kenjogo: "お待たせして申し訳ございません",
      },
    ],
    notes:
      "「お待たせする」はビジネスで頻出。尊敬語は「お待たせになる」だが実用場面は少ない",
  },
  {
    id: "tazuneru",
    casual: "尋ねる",
    sonkeigo: "お尋ねになる",
    kenjogo: "お尋ねする・うかがう",
    teineigo: "尋ねます",
    category: "business",
    examples: [
      {
        context: "質問するとき",
        casual: "一つ尋ねたい",
        sonkeigo: "一つお尋ねになった",
        kenjogo: "一つおうかがいしたいのですが",
      },
    ],
  },

  // ===== 接客・サービス (service) =====
  {
    id: "kau",
    casual: "買う",
    sonkeigo: "お買い上げになる・お求めになる",
    kenjogo: "購入いたす",
    teineigo: "買います",
    category: "service",
    examples: [
      {
        context: "商品を購入するとき",
        casual: "この商品を買う",
        sonkeigo: "こちらの商品をお買い上げになった",
        kenjogo: "こちらの商品を購入いたします",
      },
    ],
    notes:
      "「買う」に固有の謙譲語Iはない。丁重語として「購入いたす」を使うのが一般的。接客ではお客様の動作として尊敬語「お買い上げになる」「お求めになる」が使われる",
  },
  {
    id: "erabu",
    casual: "選ぶ",
    sonkeigo: "お選びになる",
    kenjogo: "お選びする",
    teineigo: "選びます",
    category: "service",
    examples: [
      {
        context: "商品を選ぶとき",
        casual: "好きなものを選んで",
        sonkeigo: "お好きなものをお選びください",
        kenjogo: "こちらをお選びいたしました",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "tsukau",
    casual: "使う",
    sonkeigo: "お使いになる",
    kenjogo: "お使いする",
    teineigo: "使います",
    category: "service",
    examples: [
      {
        context: "備品を使うとき",
        casual: "こちらを使ってください",
        sonkeigo: "こちらをお使いください",
        kenjogo: "こちらをお使いいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "kiru",
    casual: "着る",
    sonkeigo: "お召しになる",
    kenjogo: "（謙譲語なし）",
    teineigo: "着ます",
    category: "service",
    examples: [
      {
        context: "試着をすすめるとき",
        casual: "この服を着てみて",
        sonkeigo: "こちらの服をお召しになってみてください",
        kenjogo: "試着させていただきます",
      },
    ],
    notes:
      "自分の身体への動作のため固有の謙譲語形はない。試着・借用時に限り「着させていただく」が使える。「お召しになる」は「着る」の尊敬語として古くから使われる",
  },
  {
    id: "motsu",
    casual: "持つ",
    sonkeigo: "お持ちになる",
    kenjogo: "お持ちする",
    teineigo: "持ちます",
    category: "service",
    examples: [
      {
        context: "荷物を持つとき",
        casual: "荷物を持つよ",
        sonkeigo: "お荷物をお持ちになりますか",
        kenjogo: "お荷物をお持ちいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "sawaru",
    casual: "触る",
    sonkeigo: "お触りになる",
    kenjogo: "（謙譲語なし）",
    teineigo: "触ります",
    category: "service",
    examples: [
      {
        context: "商品に触れるとき",
        casual: "触ってみて",
        sonkeigo: "お手を触れてみてください",
        kenjogo: "触らせていただきます",
      },
    ],
    notes:
      "固有の謙譲語形はない。接客では「お手を触れてください」（尊敬語）が一般的。自分の行為として述べる場合は丁寧語「触ります」で十分",
  },
  {
    id: "tamesu",
    casual: "試す",
    sonkeigo: "お試しになる",
    kenjogo: "お試しする",
    teineigo: "試します",
    category: "service",
    examples: [
      {
        context: "試食や試着をすすめるとき",
        casual: "試してみて",
        sonkeigo: "ぜひお試しになってください",
        kenjogo: "お試しいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "chumon-suru",
    casual: "注文する",
    sonkeigo: "ご注文になる",
    kenjogo: "ご注文する",
    teineigo: "注文します",
    category: "service",
    examples: [
      {
        context: "料理を注文するとき",
        casual: "ラーメンを注文した",
        sonkeigo: "ラーメンをご注文になった",
        kenjogo: "ラーメンをご注文いたします",
      },
    ],
    notes: "接客では「ご注文は以上でよろしいでしょうか」が定番",
  },
  {
    id: "shiharau",
    casual: "支払う",
    sonkeigo: "お支払いになる",
    kenjogo: "お支払いする",
    teineigo: "支払います",
    category: "service",
    examples: [
      {
        context: "会計するとき",
        casual: "カードで支払う",
        sonkeigo: "カードでお支払いになりますか",
        kenjogo: "カードでお支払いいたします",
      },
    ],
    notes: "特別な謙譲語形がないため「お〜する」パターンを使う",
  },
  {
    id: "azukeru",
    casual: "預ける",
    sonkeigo: "お預けになる",
    kenjogo: "お預けする・お預かりする",
    teineigo: "預けます",
    category: "service",
    examples: [
      {
        context: "荷物を預けるとき",
        casual: "荷物を預ける",
        sonkeigo: "お荷物をお預けになりますか",
        kenjogo: "お荷物をお預かりいたします",
      },
    ],
    notes: "接客では「お預かりいたします」が頻出",
  },
];

// --- Common mistakes data ---

const COMMON_MISTAKES: CommonMistake[] = [
  // 二重敬語
  {
    id: "double-ossharareru",
    wrong: "おっしゃられる",
    correct: "おっしゃる",
    explanation:
      "「おっしゃる」はそれ自体が尊敬語です。さらに尊敬の「〜れる」を付けると二重敬語になります。",
    mistakeType: "double-keigo",
  },
  {
    id: "double-goran-ni-narareru",
    wrong: "ご覧になられる",
    correct: "ご覧になる",
    explanation:
      "「ご覧になる」は「見る」の尊敬語です。さらに「〜れる」を付けると二重敬語になります。",
    mistakeType: "double-keigo",
  },
  {
    id: "double-omie-ni-narareru",
    wrong: "お見えになられる",
    correct: "お見えになる",
    explanation:
      "「お見えになる」は「来る」の尊敬語です。さらに「〜れる」を付けると二重敬語になります。",
    mistakeType: "double-keigo",
  },
  {
    id: "double-meshiagarareru",
    wrong: "召し上がられる",
    correct: "召し上がる",
    explanation:
      "「召し上がる」は「食べる・飲む」の尊敬語です。さらに「〜れる」を付けると二重敬語になります。",
    mistakeType: "double-keigo",
  },
  {
    id: "double-okaeri-ni-narareru",
    wrong: "お帰りになられる",
    correct: "お帰りになる",
    explanation:
      "「お帰りになる」は「帰る」の尊敬語です。さらに「〜れる」を付けると二重敬語になります。",
    mistakeType: "double-keigo",
  },

  // 尊敬語・謙譲語の混同
  {
    id: "wrong-irassharu-self",
    wrong: "（自分が）いらっしゃる",
    correct: "おる・おります",
    explanation:
      "「いらっしゃる」は尊敬語なので、自分の動作には使えません。自分については「おる」「おります」を使います。",
    mistakeType: "wrong-direction",
  },
  {
    id: "wrong-mairu-other",
    wrong: "（相手に）参る",
    correct: "いらっしゃる",
    explanation:
      "「参る」は謙譲語（丁重語）なので、相手の動作には使えません。相手については「いらっしゃる」を使います。",
    mistakeType: "wrong-direction",
  },
  {
    id: "wrong-ossharu-self",
    wrong: "（自分が）おっしゃる",
    correct: "申す・申し上げる",
    explanation:
      "「おっしゃる」は尊敬語なので、自分の動作には使えません。自分については「申す」「申し上げる」を使います。",
    mistakeType: "wrong-direction",
  },
  {
    id: "wrong-goran-self",
    wrong: "（自分が）ご覧になる",
    correct: "拝見する",
    explanation:
      "「ご覧になる」は尊敬語なので、自分の動作には使えません。自分については「拝見する」を使います。",
    mistakeType: "wrong-direction",
  },
  {
    id: "wrong-meshiagaru-self",
    wrong: "（自分が）召し上がる",
    correct: "いただく",
    explanation:
      "「召し上がる」は尊敬語なので、自分の動作には使えません。自分については「いただく」を使います。",
    mistakeType: "wrong-direction",
  },

  // バイト敬語
  {
    id: "baito-ni-narimasu",
    wrong: "〜になります",
    correct: "〜でございます",
    explanation:
      "「こちらがメニューになります」などの「〜になります」は変化を表す表現であり、ビジネスシーンでは避けるのが望ましいとされています。「〜でございます」が適切です。",
    mistakeType: "baito-keigo",
  },
  {
    id: "baito-no-hou",
    wrong: "〜のほう",
    correct: "（不要な場合が多い）",
    explanation:
      "「資料のほう」「お会計のほう」など、方向や比較の意味がないのに「〜のほう」を付けるのは、ビジネスシーンでは冗長な表現と見なされることがあります。「資料」「お会計」とそのまま言うのが望ましいです。",
    mistakeType: "baito-keigo",
  },
  {
    id: "baito-yoroshikatta",
    wrong: "よろしかったでしょうか",
    correct: "よろしいでしょうか",
    explanation:
      "現在のことを確認する場面で過去形「よろしかった」を使うことは、ビジネスシーンでは避けるのが望ましいとされています。「よろしいでしょうか」が一般的です。",
    mistakeType: "baito-keigo",
  },
  {
    id: "baito-sasete-itadaku",
    wrong: "〜させていただく（過剰使用）",
    correct: "適切な敬語表現を選ぶ",
    explanation:
      "「させていただく」は本来「相手の許可を得て行う」場合に使いますが、過剰に使われるとくどい印象を与えます。「いたします」「申し上げます」など場面に応じた敬語を選ぶのが望ましいです。",
    mistakeType: "baito-keigo",
  },
  {
    id: "baito-ryokai",
    wrong: "了解しました",
    correct: "承知しました・かしこまりました",
    explanation:
      "「了解しました」は目上の人に対して使うと失礼と感じる方もいます。ビジネスシーンでは「承知しました」「かしこまりました」を使うのが無難です。",
    mistakeType: "baito-keigo",
  },
];

// --- Exported functions ---

export function getAllEntries(): KeigoEntry[] {
  return KEIGO_ENTRIES;
}

export function getKeigoCategories(): KeigoCategoryInfo[] {
  return KEIGO_CATEGORIES;
}

export function getEntriesByCategory(category: KeigoCategory): KeigoEntry[] {
  return KEIGO_ENTRIES.filter((entry) => entry.category === category);
}

export function searchEntries(query: string): KeigoEntry[] {
  if (!query.trim()) return KEIGO_ENTRIES;
  const q = query.trim().toLowerCase();
  return KEIGO_ENTRIES.filter(
    (entry) =>
      entry.casual.toLowerCase().includes(q) ||
      entry.sonkeigo.toLowerCase().includes(q) ||
      entry.kenjogo.toLowerCase().includes(q) ||
      entry.teineigo.toLowerCase().includes(q),
  );
}

export function filterEntries(
  query: string,
  category: KeigoCategory | "all",
): KeigoEntry[] {
  let entries = KEIGO_ENTRIES;
  if (category !== "all") {
    entries = entries.filter((entry) => entry.category === category);
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    entries = entries.filter(
      (entry) =>
        entry.casual.toLowerCase().includes(q) ||
        entry.sonkeigo.toLowerCase().includes(q) ||
        entry.kenjogo.toLowerCase().includes(q) ||
        entry.teineigo.toLowerCase().includes(q),
    );
  }
  return entries;
}

export function getCommonMistakes(): CommonMistake[] {
  return COMMON_MISTAKES;
}

export function getMistakesByType(type: MistakeType): CommonMistake[] {
  return COMMON_MISTAKES.filter((m) => m.mistakeType === type);
}
