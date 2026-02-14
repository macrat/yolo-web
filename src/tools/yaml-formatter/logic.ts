import yaml from "js-yaml";

export interface YamlValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
}

export function formatYaml(input: string, indentWidth: number = 2): string {
  const parsed = yaml.load(input);
  return yaml.dump(parsed, { indent: indentWidth, lineWidth: -1 });
}

export function validateYaml(input: string): YamlValidationResult {
  if (!input.trim()) {
    return { valid: false, error: "入力が空です" };
  }
  try {
    yaml.load(input);
    return { valid: true };
  } catch (e) {
    if (e instanceof yaml.YAMLException) {
      return {
        valid: false,
        error: e.message,
        line: e.mark?.line !== undefined ? e.mark.line + 1 : undefined,
      };
    }
    return {
      valid: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function yamlToJson(input: string, indent: number = 2): string {
  const parsed = yaml.load(input);
  return JSON.stringify(parsed, null, indent);
}

export function jsonToYaml(input: string, indentWidth: number = 2): string {
  const parsed = JSON.parse(input);
  return yaml.dump(parsed, { indent: indentWidth, lineWidth: -1 });
}
