export interface EmailValidationResult {
  valid: boolean;
  localPart: string;
  domain: string;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Common typo domains
const COMMON_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmal.com": "gmail.com",
  "yaho.co.jp": "yahoo.co.jp",
  "yahooo.co.jp": "yahoo.co.jp",
  "yahoo.co.jpp": "yahoo.co.jp",
  "hotmai.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "outllook.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outook.com": "outlook.com",
};

export function parseEmailParts(
  email: string,
): { localPart: string; domain: string } | null {
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return null;
  // Use last @ to handle edge cases
  const lastAtIndex = email.lastIndexOf("@");
  return {
    localPart: email.substring(0, lastAtIndex),
    domain: email.substring(lastAtIndex + 1),
  };
}

export function validateEmail(email: string): EmailValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Empty / whitespace check
  if (!email || email.trim() === "") {
    return {
      valid: false,
      localPart: "",
      domain: "",
      errors: ["メールアドレスが入力されていません"],
      warnings,
      suggestions,
    };
  }

  const trimmed = email.trim();

  // Check for @ symbol
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) {
    return {
      valid: false,
      localPart: trimmed,
      domain: "",
      errors: ["@が含まれていません"],
      warnings,
      suggestions,
    };
  }

  if (atCount > 1) {
    errors.push("@が複数含まれています");
  }

  const parts = parseEmailParts(trimmed);
  if (!parts) {
    return {
      valid: false,
      localPart: "",
      domain: "",
      errors: ["メールアドレスの形式が不正です"],
      warnings,
      suggestions,
    };
  }

  const { localPart, domain } = parts;

  // Local part checks
  if (localPart === "") {
    errors.push("ローカルパート(@の前)が空です");
  } else {
    if (localPart.length > 64) {
      errors.push("ローカルパートが64文字を超えています");
    }
    if (localPart.startsWith(".")) {
      errors.push("ローカルパートの先頭にドットは使用できません");
    }
    if (localPart.endsWith(".")) {
      errors.push("ローカルパートの末尾にドットは使用できません");
    }
    if (localPart.includes("..")) {
      errors.push("ローカルパートに連続したドットは使用できません");
    }
    // Check for allowed characters (simplified RFC 5321)
    const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
    if (localPart !== "" && !localPartRegex.test(localPart)) {
      errors.push(
        "ローカルパートに使用できない文字が含まれています",
      );
    }
    // Warnings for uncommon but valid characters
    if (/[!#$%&'*+/=?^`{|}~]/.test(localPart)) {
      warnings.push(
        "ローカルパートに一般的でない特殊文字が含まれています",
      );
    }
  }

  // Domain checks
  if (domain === "") {
    errors.push("ドメイン(@の後)が空です");
  } else {
    if (domain.length > 253) {
      errors.push("ドメインが253文字を超えています");
    }
    const labels = domain.split(".");
    if (labels.length < 2) {
      errors.push("ドメインにTLD(トップレベルドメイン)がありません");
    }
    for (const label of labels) {
      if (label.length === 0) {
        errors.push("ドメインに空のラベルがあります");
        break;
      }
      if (label.length > 63) {
        errors.push("ドメインラベルが63文字を超えています");
        break;
      }
      if (label.startsWith("-")) {
        errors.push("ドメインラベルの先頭にハイフンは使用できません");
        break;
      }
      if (label.endsWith("-")) {
        errors.push("ドメインラベルの末尾にハイフンは使用できません");
        break;
      }
      if (!/^[a-zA-Z0-9-]+$/.test(label)) {
        errors.push("ドメインに使用できない文字が含まれています");
        break;
      }
    }
    // TLD check
    const tld = labels[labels.length - 1];
    if (tld && /^\d+$/.test(tld)) {
      warnings.push("TLDが数字のみです（IPアドレスの可能性があります）");
    }

    // Typo suggestion
    const domainLower = domain.toLowerCase();
    if (domainLower in COMMON_TYPOS) {
      suggestions.push(
        `もしかして: ${localPart}@${COMMON_TYPOS[domainLower]}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    localPart,
    domain,
    errors,
    warnings,
    suggestions,
  };
}
