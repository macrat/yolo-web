// Common field keys shared across most templates (U-01: defined as constants)
export const COMMON_FIELD_KEYS = [
  "recipientCompany",
  "recipientName",
  "senderName",
] as const;

// Email categories
export type EmailCategory =
  | "thanks"
  | "apology"
  | "request"
  | "decline"
  | "greeting";

export type EmailCategoryInfo = {
  id: EmailCategory;
  name: string;
  description: string;
};

export type TemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date";
  required: boolean;
  placeholder: string;
  defaultValue?: string;
};

export type EmailTemplate = {
  id: string;
  category: EmailCategory;
  name: string;
  description: string;
  fields: TemplateField[];
  subjectTemplate: string;
  bodyTemplate: string;
};

export type GeneratedEmail = {
  subject: string;
  body: string;
};

// --- Category data ---

const CATEGORIES: EmailCategoryInfo[] = [
  {
    id: "thanks",
    name: "お礼",
    description: "訪問・打ち合わせなどのお礼メール",
  },
  {
    id: "apology",
    name: "お詫び",
    description: "納期遅延・ミスなどのお詫びメール",
  },
  {
    id: "request",
    name: "依頼",
    description: "見積・アポイント・資料送付の依頼メール",
  },
  { id: "decline", name: "お断り", description: "提案・見積のお断りメール" },
  {
    id: "greeting",
    name: "挨拶",
    description: "異動・年末などの挨拶メール",
  },
];

// --- Common fields (reused across templates) ---

const recipientCompanyField: TemplateField = {
  key: "recipientCompany",
  label: "相手先会社名",
  type: "text",
  required: true,
  placeholder: "株式会社〇〇",
};

const recipientNameField: TemplateField = {
  key: "recipientName",
  label: "相手先氏名",
  type: "text",
  required: true,
  placeholder: "山田太郎",
};

const senderNameField: TemplateField = {
  key: "senderName",
  label: "差出人名",
  type: "text",
  required: true,
  placeholder: "鈴木花子",
};

// --- Template data (12 templates, D-04: all use modern format starting with お世話になっております) ---

const TEMPLATES: EmailTemplate[] = [
  // === お礼 (thanks) ===
  {
    id: "thanks-visit",
    category: "thanks",
    name: "訪問のお礼",
    description: "お客様先への訪問後に送るお礼メール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "visitDate",
        label: "訪問日",
        type: "text",
        required: true,
        placeholder: "2月21日",
      },
      {
        key: "topic",
        label: "打ち合わせ内容",
        type: "textarea",
        required: true,
        placeholder: "新サービスのご提案について",
      },
      senderNameField,
    ],
    subjectTemplate: "ご訪問のお礼",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

本日はお忙しい中、貴重なお時間をいただき誠にありがとうございました。

{{topic}}について、詳しくお話をうかがうことができ、大変参考になりました。

ご質問いただいた点につきましては、改めて資料をまとめてご連絡いたします。
今後とも何卒よろしくお願いいたします。

{{senderName}}`,
  },
  {
    id: "thanks-meeting",
    category: "thanks",
    name: "打ち合わせのお礼",
    description: "打ち合わせ後に送るお礼と議事確認メール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "meetingDate",
        label: "打ち合わせ日時",
        type: "text",
        required: true,
        placeholder: "2月21日 14:00",
      },
      {
        key: "agenda",
        label: "議題",
        type: "textarea",
        required: true,
        placeholder: "プロジェクトの進捗確認",
      },
      {
        key: "nextAction",
        label: "次のアクション",
        type: "textarea",
        required: true,
        placeholder: "次回ミーティングまでに要件定義書を作成",
      },
      senderNameField,
    ],
    subjectTemplate: "お打ち合わせのお礼",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

本日はお打ち合わせのお時間をいただき、誠にありがとうございました。

{{agenda}}について、有意義な意見交換ができましたこと、感謝申し上げます。

本日の打ち合わせを踏まえ、次のアクションとして以下を進めてまいります。
{{nextAction}}

ご不明な点がございましたら、お気軽にお申し付けください。
引き続きよろしくお願いいたします。

{{senderName}}`,
  },
  {
    id: "thanks-order",
    category: "thanks",
    name: "受注のお礼",
    description: "ご注文をいただいた際のお礼メール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "productName",
        label: "商品・サービス名",
        type: "text",
        required: true,
        placeholder: "クラウドサービス プロプラン",
      },
      senderNameField,
    ],
    subjectTemplate: "ご注文のお礼",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

このたびは{{productName}}をご注文いただき、誠にありがとうございます。

ご注文内容を確認のうえ、準備が整い次第ご連絡いたします。
納期やご不明な点がございましたら、どうぞお気軽にお問い合わせください。

今後ともご愛顧のほど、よろしくお願いいたします。

{{senderName}}`,
  },

  // === お詫び (apology) ===
  {
    id: "apology-delay",
    category: "apology",
    name: "納期遅延のお詫び",
    description: "納品が遅れる際のお詫びと新納期のご連絡",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "productName",
        label: "対象の商品・サービス",
        type: "text",
        required: true,
        placeholder: "ウェブサイトリニューアル案件",
      },
      {
        key: "originalDate",
        label: "当初の納期",
        type: "text",
        required: true,
        placeholder: "3月1日",
      },
      {
        key: "newDate",
        label: "変更後の納期",
        type: "text",
        required: true,
        placeholder: "3月10日",
      },
      {
        key: "reason",
        label: "遅延の理由",
        type: "textarea",
        required: true,
        placeholder: "仕様の追加変更に伴う開発期間の延長",
      },
      senderNameField,
    ],
    subjectTemplate: "納期遅延のお詫び",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

{{productName}}の納期につきまして、ご連絡申し上げます。

当初{{originalDate}}とお伝えしておりましたが、{{reason}}のため、{{newDate}}への変更をお願いしたく存じます。

ご迷惑をおかけし、大変申し訳ございません。
今後はこのようなことがないよう、スケジュール管理を徹底してまいります。

何卒ご理解のほど、よろしくお願いいたします。

{{senderName}}`,
  },
  {
    id: "apology-mistake",
    category: "apology",
    name: "ミスのお詫び",
    description: "業務上のミスに対するお詫びと対応策のご報告",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "mistakeDetail",
        label: "ミスの内容",
        type: "textarea",
        required: true,
        placeholder: "請求書の金額に誤りがあった",
      },
      {
        key: "countermeasure",
        label: "対応策",
        type: "textarea",
        required: true,
        placeholder: "正しい金額の請求書を再発行し、本日中にお送りいたします",
      },
      senderNameField,
    ],
    subjectTemplate: "お詫びとご報告",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

このたびは{{mistakeDetail}}の件につきまして、多大なるご迷惑をおかけし、深くお詫び申し上げます。

原因を確認いたしましたところ、弊社の確認不足によるものと判明いたしました。
つきましては、以下のとおり対応いたします。

{{countermeasure}}

再発防止に向けて、チェック体制の見直しを行ってまいります。
重ねてお詫び申し上げますとともに、今後とも変わらぬお引き立てのほど、何卒よろしくお願いいたします。

{{senderName}}`,
  },

  // === 依頼 (request) ===
  {
    id: "request-quote",
    category: "request",
    name: "見積依頼",
    description: "商品・サービスのお見積りを依頼するメール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "productName",
        label: "対象の商品・サービス",
        type: "text",
        required: true,
        placeholder: "業務管理システム",
      },
      {
        key: "details",
        label: "詳細要件",
        type: "textarea",
        required: true,
        placeholder:
          "ユーザー数: 50名\n機能: 勤怠管理、経費精算\n導入時期: 4月",
      },
      {
        key: "deadline",
        label: "回答期限",
        type: "text",
        required: true,
        placeholder: "3月15日",
      },
      senderNameField,
    ],
    subjectTemplate: "お見積りのお願い",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

{{productName}}につきまして、お見積りをお願いしたくご連絡いたしました。

ご検討いただきたい要件は以下のとおりです。

{{details}}

お忙しいところ恐れ入りますが、{{deadline}}までにご回答いただけますと幸いです。

ご不明な点がございましたら、お気軽にお問い合わせください。
何卒よろしくお願いいたします。

{{senderName}}`,
  },
  {
    id: "request-appointment",
    category: "request",
    name: "アポイント依頼",
    description: "面談・打ち合わせの日程調整を依頼するメール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "purpose",
        label: "面談の目的",
        type: "text",
        required: true,
        placeholder: "新サービスのご紹介",
      },
      {
        key: "candidateDates",
        label: "候補日時",
        type: "textarea",
        required: true,
        placeholder: "3月5日(水) 10:00〜12:00\n3月6日(木) 14:00〜16:00",
      },
      {
        key: "duration",
        label: "所要時間",
        type: "text",
        required: true,
        placeholder: "1時間程度",
      },
      senderNameField,
    ],
    subjectTemplate: "ご面談のお願い",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

{{purpose}}の件で、ぜひ一度お時間をいただきたくご連絡いたしました。

つきましては、以下の日程でご都合のよい日時はございますでしょうか。

{{candidateDates}}

所要時間は{{duration}}を予定しております。
上記以外の日程でも調整可能ですので、ご希望がございましたらお知らせください。

お忙しいところ恐れ入りますが、ご検討のほどよろしくお願いいたします。

{{senderName}}`,
  },
  {
    id: "request-document",
    category: "request",
    name: "資料送付依頼",
    description: "資料やカタログの送付を依頼するメール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "documentName",
        label: "資料名",
        type: "text",
        required: true,
        placeholder: "製品カタログ",
      },
      {
        key: "purpose",
        label: "利用目的",
        type: "text",
        required: true,
        placeholder: "社内検討資料として",
      },
      {
        key: "deadline",
        label: "希望期限",
        type: "text",
        required: true,
        placeholder: "3月10日",
      },
      senderNameField,
    ],
    subjectTemplate: "資料送付のお願い",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

{{documentName}}について、{{purpose}}使用させていただきたく、送付をお願いしたくご連絡いたしました。

お忙しいところ恐縮ですが、{{deadline}}までにお送りいただけますと幸いです。

データでのご送付で問題ございません。
何卒よろしくお願いいたします。

{{senderName}}`,
  },

  // === お断り (decline) ===
  {
    id: "decline-proposal",
    category: "decline",
    name: "提案のお断り",
    description: "ご提案をお断りする際のメール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "proposalName",
        label: "提案名",
        type: "text",
        required: true,
        placeholder: "オフィス移転プラン",
      },
      {
        key: "reason",
        label: "お断りの理由",
        type: "textarea",
        required: true,
        placeholder:
          "社内で慎重に検討いたしましたが、現時点では予算の確保が難しい状況",
      },
      senderNameField,
    ],
    subjectTemplate: "ご提案について",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

先日は{{proposalName}}について、丁寧なご提案をいただき誠にありがとうございました。

社内で慎重に検討いたしましたが、{{reason}}のため、今回は見送らせていただきたく存じます。

せっかくお時間をいただいたにもかかわらず、ご期待に沿えず申し訳ございません。
また別の機会にご一緒できることを楽しみにしております。

今後とも何卒よろしくお願いいたします。

{{senderName}}`,
  },
  {
    id: "decline-quote",
    category: "decline",
    name: "見積のお断り",
    description: "いただいた見積をお断りする際のメール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "quoteName",
        label: "見積の件名",
        type: "text",
        required: true,
        placeholder: "社内システム開発の件",
      },
      {
        key: "reason",
        label: "お断りの理由",
        type: "textarea",
        required: true,
        placeholder: "予算面での折り合いがつかない",
      },
      senderNameField,
    ],
    subjectTemplate: "お見積りの件について",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

{{quoteName}}につきまして、お見積りをいただきありがとうございました。

社内にて検討を重ねましたが、{{reason}}ため、誠に残念ながら今回は見送らせていただくこととなりました。

貴重なお時間を割いてご対応いただいたにもかかわらず、このようなご連絡となり申し訳ございません。
また機会がございましたら、ぜひご相談させていただければ幸いです。

今後ともよろしくお願いいたします。

{{senderName}}`,
  },

  // === 挨拶 (greeting) ===
  {
    id: "greeting-transfer",
    category: "greeting",
    name: "異動・担当変更の挨拶",
    description: "異動や担当変更を通知する挨拶メール",
    fields: [
      recipientCompanyField,
      recipientNameField,
      {
        key: "currentRole",
        label: "現在の役職・部署",
        type: "text",
        required: true,
        placeholder: "営業部 主任",
      },
      {
        key: "newRole",
        label: "異動先",
        type: "text",
        required: true,
        placeholder: "マーケティング部",
      },
      {
        key: "transferDate",
        label: "異動日",
        type: "text",
        required: true,
        placeholder: "4月1日",
      },
      {
        key: "successorName",
        label: "後任者名",
        type: "text",
        required: true,
        placeholder: "佐藤一郎",
      },
      senderNameField,
    ],
    subjectTemplate: "担当者変更のご挨拶",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

私事ではございますが、{{transferDate}}付で{{currentRole}}から{{newRole}}へ異動することとなりました。

在任中は大変お世話になり、心より感謝申し上げます。

後任は{{successorName}}が務めさせていただきます。
改めて後任よりご挨拶させていただきますので、変わらぬご指導のほどよろしくお願いいたします。

末筆ながら、貴社の益々のご発展をお祈り申し上げます。

{{senderName}}`,
  },
  {
    id: "greeting-yearend",
    category: "greeting",
    name: "年末の挨拶",
    description: "年末にお世話になった方へ送る挨拶メール",
    fields: [recipientCompanyField, recipientNameField, senderNameField],
    subjectTemplate: "年末のご挨拶",
    bodyTemplate: `{{recipientCompany}}
{{recipientName}} 様

お世話になっております。{{senderName}}です。

早いもので年末のご挨拶をさせていただく時期となりました。

本年は格別のお引き立てを賜り、厚く御礼申し上げます。
おかげさまで、本年も無事に業務を進めることができました。

来年もお力添えいただけますよう、何卒よろしくお願いいたします。
皆様にとって素晴らしい新年となりますことをお祈りしております。

{{senderName}}`,
  },
];

// --- Exported functions ---

export function getCategories(): EmailCategoryInfo[] {
  return CATEGORIES;
}

export function getTemplatesByCategory(
  category: EmailCategory,
): EmailTemplate[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getAllTemplates(): EmailTemplate[] {
  return TEMPLATES;
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in values) {
      return values[key];
    }
    return match;
  });
}

export function generateEmail(
  template: EmailTemplate,
  values: Record<string, string>,
): GeneratedEmail {
  return {
    subject: fillTemplate(template.subjectTemplate, values),
    body: fillTemplate(template.bodyTemplate, values),
  };
}
