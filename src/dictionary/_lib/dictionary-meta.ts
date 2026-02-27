import type { DictionaryMeta } from "./types";

export const KANJI_DICTIONARY_META: DictionaryMeta = {
  slug: "kanji",
  name: "漢字辞典",
  trustLevel: "curated",
  valueProposition: "小学校で習う漢字の読み・画数・用例をすぐに確認できる",
  faq: [
    {
      question: "この漢字辞典にはどんな漢字が収録されていますか？",
      answer:
        "小学校で学習する教育漢字を中心に80字を収録しています。各漢字について音読み・訓読み・画数・部首・用例を掲載しています。",
    },
    {
      question: "漢字のデータはどこから来ていますか？",
      answer:
        "AIが文部科学省の学習指導要領や漢字辞典を参照して作成したデータです。正確さを心がけていますが、誤りが含まれる可能性があります。",
    },
    {
      question: "漢字の画数や読みが間違っている場合はどうすればいいですか？",
      answer:
        "本サイトはAIが運営する実験的なサイトです。誤りを見つけた場合は、公式の漢字辞典で正確な情報をご確認ください。",
    },
  ],
};

export const YOJI_DICTIONARY_META: DictionaryMeta = {
  slug: "yoji",
  name: "四字熟語辞典",
  trustLevel: "curated",
  valueProposition: "四字熟語の読み方と意味を難易度別にすぐ調べられる",
  faq: [
    {
      question: "四字熟語の難易度はどのように決められていますか？",
      answer:
        "日常会話や文章での使用頻度をもとに、初級・中級・上級の3段階に分類しています。初級は日常的に使われるもの、上級は文語的・専門的なものです。",
    },
    {
      question: "四字熟語は全部で何語収録されていますか？",
      answer:
        "現在101語を収録しています。努力・感情・自然・社会など10のカテゴリに分類されており、カテゴリから探すこともできます。",
    },
    {
      question: "四字熟語のデータは正確ですか？",
      answer:
        "AIが国語辞典や四字熟語辞典を参照して作成したデータです。正確さを心がけていますが、誤りが含まれる可能性があります。公式の辞典と合わせてご利用ください。",
    },
  ],
};

export const COLOR_DICTIONARY_META: DictionaryMeta = {
  slug: "colors",
  name: "伝統色辞典",
  trustLevel: "curated",
  valueProposition: "日本の伝統色250色のカラーコードと色見本をすぐ確認できる",
  faq: [
    {
      question: "カラーコードはどの形式に対応していますか？",
      answer:
        "HEX・RGB・HSLの3形式を掲載しています。各カラーコードの横にあるコピーボタンでクリップボードにコピーできます。",
    },
    {
      question: "伝統色のデータはどこから来ていますか？",
      answer:
        "AIが日本の伝統色に関する文献やカラーデータベースを参照して作成したデータです。色の名前やカラーコードには諸説あり、文献によって異なる場合があります。",
    },
    {
      question: "Webデザインやイラストでこの色を使ってもいいですか？",
      answer:
        "はい、掲載しているカラーコードは自由にお使いいただけます。伝統色の名前と色の対応は参考情報としてご利用ください。",
    },
  ],
};
