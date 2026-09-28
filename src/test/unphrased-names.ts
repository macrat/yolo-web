/**
 * 区切りの並びで渡すべき名前と面を拾う数え方（DESIGN.md §4、t5-design.md 4-g）。
 *
 * コントロールの名前とボタンの面は文節で折る。部品は文字列を区切りの無い1つの文節として組むので、2文節以上の
 * 名前と面は、書く所で区切りの並びを渡す。この関数は `.tsx` の JSX を読み、名前と面を渡す位置の値を2つに分けて返す。
 *
 * - 字で渡すもの（直すもの）: 字のうち splitIntoPhrases が2つ以上に分けるものと、手で書いた区切りの並びの
 *   うち followsPhraseRules を満たさないもの。
 * - 値で渡すもの（測るもの）: 字でも区切りの並びでもないもの。中身をここで確かめられないので、位置ごとに返す。
 *
 * 見る位置は、名前と面の props、選択肢と組の並びの要素の名前、素の `label`・`legend`・`button`・`summary` の子。
 * どれも三項演算子・`&&`・`||`・`??` の枝と、同じファイルの `const` を名前で渡したものの中まで見る。
 * 区切りを受け取らない部品の `label` と、名前を受け取る部品の中で受け取った名前をそのまま中の部品へ渡す所は
 * どちらにも出さない。
 *
 * splitIntoPhrases は server-only のモジュールにあるので、この関数は vitest の上で走らせる
 * （`npm run check:phrased-names`）。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";
import { followsPhraseRules, splitIntoPhrases } from "@/lib/phrase-breaks";

export interface PhrasedNameFinding {
  /** 数えた根からの相対のパス。 */
  file: string;
  line: number;
  column: number;
  /** 見る位置（「`Button` の面」など）。 */
  position: string;
  /** 字で渡すものは字、値で渡すものは式のソース。 */
  source: string;
  /** 拾った理由。 */
  reason: string;
}

export interface PhrasedNameReport {
  /** 字で渡すもの（直すもの）。 */
  literals: PhrasedNameFinding[];
  /** 値で渡すもの（名前が出る状態を開いて測るもの）。 */
  values: PhrasedNameFinding[];
  /** 見る位置に字で渡した名前と面の数（1文節のものを含む）。 */
  literalCount: number;
}

/** 名前の props。部品の名前ごとに、名前を受け取る props。 */
const NAME_PROPS: Record<string, readonly string[]> = {
  Field: ["label"],
  Checkbox: ["label"],
  Radio: ["label"],
  FileDropZone: ["label"],
  GuessInput: ["label"],
  RadioGroup: ["legend"],
  Accordion: ["summary"],
  ListControls: ["searchLabel"],
  BrowsableList: ["searchLabel"],
};

/** 選択肢の並び（要素の名前を見る）。 */
const CHOICE_PROPS: Record<string, readonly string[]> = {
  RadioGroup: ["options"],
  Slider: ["items"],
  BrowsableList: ["sorts"],
};

/** 組（`legend` と `options` の要素の名前を見る）。 */
const GROUP_PROPS: Record<string, readonly string[]> = {
  ListControls: ["kindGroup", "sortGroup"],
  BrowsableList: ["kindGroup"],
};

/** 組の並び。 */
const GROUP_LIST_PROPS: Record<string, readonly string[]> = {
  ListControls: ["filterGroups"],
};

/**
 * 名前と面を受け取って組む部品。使う側の位置を上の表で見るので、部品の中で受け取った名前を組む所は数えない。
 */
const NAME_RECEIVING_COMPONENTS = new Set([
  ...Object.keys(NAME_PROPS),
  ...Object.keys(CHOICE_PROPS),
  ...Object.keys(GROUP_PROPS),
  ...Object.keys(GROUP_LIST_PROPS),
  "Button",
  "CopyButton",
  "ChoiceRow",
  "PhrasedText",
]);

/** 子を名前と面として組む素の要素。 */
const RAW_ELEMENTS = new Set(["label", "legend", "button", "summary"]);

/** 選択肢の要素の名前の欄。 */
const CHOICE_NAME_KEYS = ["label", "name"];

/** 字を持たない子として読み飛ばす素の要素。 */
const CONTROL_ELEMENTS = new Set(["input", "select", "textarea", "img", "svg"]);

/** 並びを受け取って要素を返す呼び出し。コールバックの引数は並びの要素。 */
const ITERATION_METHODS = new Set(["map", "flatMap", "filter", "find"]);

/** 値を覚えておく React の hook。最初の引数の関数が返す値を渡す。 */
const MEMO_HOOKS = new Set(["useMemo", "useCallback"]);

interface FileContext {
  sourceFile: ts.SourceFile;
  file: string;
  report: PhrasedNameReport;
  seen: Set<string>;
}

function unwrap(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

/** 条件の枝をたどり、値になりうる式のそれぞれに visit を当てる。 */
function forEachBranch(
  expression: ts.Expression,
  visit: (branch: ts.Expression) => void,
): void {
  const node = unwrap(expression);
  if (ts.isConditionalExpression(node)) {
    forEachBranch(node.whenTrue, visit);
    forEachBranch(node.whenFalse, visit);
    return;
  }
  if (ts.isBinaryExpression(node)) {
    const operator = node.operatorToken.kind;
    if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
      forEachBranch(node.right, visit);
      return;
    }
    if (
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken
    ) {
      forEachBranch(node.left, visit);
      forEachBranch(node.right, visit);
      return;
    }
  }
  if (
    node.kind === ts.SyntaxKind.NullKeyword ||
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword ||
    (ts.isIdentifier(node) && node.text === "undefined")
  ) {
    return;
  }
  visit(node);
}

// ── 名前の束縛 ────────────────────────────────────────────────────────────

type Binding =
  | { kind: "parameter"; fn: ts.SignatureDeclaration }
  | { kind: "variable"; declaration: ts.VariableDeclaration; direct: boolean }
  | { kind: "import" }
  | { kind: "other" };

function bindsName(name: ts.BindingName, text: string): boolean {
  if (ts.isIdentifier(name)) return name.text === text;
  return name.elements.some(
    (element) =>
      !ts.isOmittedExpression(element) && bindsName(element.name, text),
  );
}

function bindingInStatements(
  statements: readonly ts.Statement[],
  text: string,
): Binding | undefined {
  for (const statement of statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (bindsName(declaration.name, text)) {
          return {
            kind: "variable",
            declaration,
            direct: ts.isIdentifier(declaration.name),
          };
        }
      }
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name?.text === text
    ) {
      return { kind: "other" };
    } else if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (!clause) continue;
      if (clause.name?.text === text) return { kind: "import" };
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        if (bindings.name.text === text) return { kind: "import" };
      } else if (bindings?.elements.some((e) => e.name.text === text)) {
        return { kind: "import" };
      }
    }
  }
  return undefined;
}

function resolveBinding(identifier: ts.Identifier): Binding | undefined {
  const text = identifier.text;
  let node: ts.Node | undefined = identifier.parent;
  while (node) {
    if (ts.isFunctionLike(node)) {
      if (
        node.parameters.some((parameter) => bindsName(parameter.name, text))
      ) {
        return { kind: "parameter", fn: node };
      }
    }
    if (ts.isBlock(node) || ts.isSourceFile(node) || ts.isModuleBlock(node)) {
      const binding = bindingInStatements(node.statements, text);
      if (binding) return binding;
    }
    if (
      (ts.isForOfStatement(node) || ts.isForInStatement(node)) &&
      ts.isVariableDeclarationList(node.initializer) &&
      node.initializer.declarations.some((d) => bindsName(d.name, text))
    ) {
      return { kind: "other" };
    }
    node = node.parent;
  }
  return undefined;
}

/** 関数の名前。名前の無い関数は、代入した変数の名前（`forwardRef`・`memo` に包んだものを含む）。 */
function functionName(fn: ts.SignatureDeclaration): string | undefined {
  if (ts.isFunctionDeclaration(fn)) return fn.name?.text;
  if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) return undefined;
  if (fn.name) return fn.name.text;
  let holder: ts.Node = fn.parent;
  if (ts.isCallExpression(holder)) holder = holder.parent;
  return ts.isVariableDeclaration(holder) && ts.isIdentifier(holder.name)
    ? holder.name.text
    : undefined;
}

/** 関数が、名前と面を受け取って組む部品か。 */
function isNameReceivingComponent(fn: ts.SignatureDeclaration): boolean {
  const name = functionName(fn);
  return name !== undefined && NAME_RECEIVING_COMPONENTS.has(name);
}

/** 関数が並びの呼び出し（`.map` など）のコールバックなら、その並びの式を返す。 */
function iteratedArray(fn: ts.SignatureDeclaration): ts.Expression | undefined {
  const call = fn.parent;
  if (!ts.isCallExpression(call) || !call.arguments.includes(fn as never)) {
    return undefined;
  }
  const callee = call.expression;
  if (
    ts.isPropertyAccessExpression(callee) &&
    ITERATION_METHODS.has(callee.name.text)
  ) {
    return callee.expression;
  }
  return undefined;
}

/**
 * 式が、名前と面を受け取る部品の中で、受け取った props から作ったものか（受け取った名前の受け渡し）。
 * 使う側で名前を見るので、部品の中では数えない。ほかの部品（FAQ の問いを組む部品など）の props は、使う側の
 * 位置を見ないので、値で渡すものとして数える。
 */
function fromComponentProps(expression: ts.Expression, depth = 0): boolean {
  if (depth > 20) return false;
  const node = unwrap(expression);
  if (ts.isIdentifier(node)) {
    const binding = resolveBinding(node);
    if (!binding) return false;
    if (binding.kind === "parameter") {
      if (isNameReceivingComponent(binding.fn)) return true;
      const array = iteratedArray(binding.fn);
      return array !== undefined && fromComponentProps(array, depth + 1);
    }
    if (binding.kind === "variable" && binding.declaration.initializer) {
      return fromComponentProps(binding.declaration.initializer, depth + 1);
    }
    return false;
  }
  if (
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node)
  ) {
    return fromComponentProps(node.expression, depth + 1);
  }
  if (ts.isCallExpression(node)) {
    const callee = node.expression;
    if (ts.isPropertyAccessExpression(callee)) {
      return fromComponentProps(callee.expression, depth + 1);
    }
    if (!ts.isIdentifier(callee)) return false;
    if (MEMO_HOOKS.has(callee.text)) {
      const factory = node.arguments[0];
      return (
        factory !== undefined &&
        (ts.isArrowFunction(factory) || ts.isFunctionExpression(factory)) &&
        returnedExpressions(factory).some((returned) =>
          fromComponentProps(returned, depth + 1),
        )
      );
    }
    return node.arguments.some((argument) =>
      fromComponentProps(argument, depth + 1),
    );
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.some((element) =>
      fromComponentProps(
        ts.isSpreadElement(element) ? element.expression : element,
        depth + 1,
      ),
    );
  }
  if (ts.isBinaryExpression(node) || ts.isConditionalExpression(node)) {
    let found = false;
    forEachBranch(node, (branch) => {
      if (branch !== node && fromComponentProps(branch, depth + 1)) {
        found = true;
      }
    });
    return found;
  }
  return false;
}

/** 関数が返す式。 */
function returnedExpressions(
  fn: ts.ArrowFunction | ts.FunctionExpression,
): ts.Expression[] {
  if (!ts.isBlock(fn.body)) return [fn.body];
  const returned: ts.Expression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node) && node.expression) {
      returned.push(node.expression);
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(fn.body, visit);
  return returned;
}

/**
 * 式を、同じファイルに書いた値の式まで解く（`const` の名前・そのプロパティ・並びの添字）。解けなければ
 * undefined。
 */
function resolveLocalValue(
  expression: ts.Expression,
  depth = 0,
): ts.Expression | undefined {
  if (depth > 20) return undefined;
  const node = unwrap(expression);
  if (ts.isIdentifier(node)) {
    const binding = resolveBinding(node);
    if (
      binding?.kind === "variable" &&
      binding.direct &&
      binding.declaration.initializer &&
      (binding.declaration.parent.flags & ts.NodeFlags.Const) !== 0
    ) {
      const initializer = unwrap(binding.declaration.initializer);
      return resolveLocalValue(initializer, depth + 1) ?? initializer;
    }
    return undefined;
  }
  if (ts.isPropertyAccessExpression(node)) {
    const object = resolveLocalValue(node.expression, depth + 1);
    if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
    const property = findProperty(object, node.name.text);
    if (!property) return undefined;
    return resolveLocalValue(property, depth + 1) ?? unwrap(property);
  }
  if (
    ts.isElementAccessExpression(node) &&
    ts.isNumericLiteral(node.argumentExpression)
  ) {
    const array = resolveLocalValue(node.expression, depth + 1);
    if (!array || !ts.isArrayLiteralExpression(array)) return undefined;
    const element = array.elements[Number(node.argumentExpression.text)];
    if (!element || ts.isSpreadElement(element)) return undefined;
    return resolveLocalValue(element, depth + 1) ?? unwrap(element);
  }
  return undefined;
}

function findProperty(
  object: ts.ObjectLiteralExpression,
  key: string,
): ts.Expression | undefined {
  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === key
    ) {
      return property.initializer;
    }
    if (
      ts.isShorthandPropertyAssignment(property) &&
      property.name.text === key
    ) {
      return property.name;
    }
  }
  return undefined;
}

/** 解けない値が何から来るか。 */
function valueReason(expression: ts.Expression): string {
  const node = unwrap(expression);
  if (ts.isTemplateExpression(node)) return "値を差し込んだ文";
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    return "つないだ文";
  }
  if (ts.isCallExpression(node)) {
    const callee = node.expression;
    const name = ts.isIdentifier(callee)
      ? callee.text
      : ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : "";
    if (name === "splitIntoPhrases") return "サーバーで区切る文";
    if (ITERATION_METHODS.has(name)) return "並びを .map して渡すもの";
    return "呼び出しの値";
  }
  if (
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node)
  ) {
    return "要素";
  }
  let root: ts.Expression = node;
  while (
    ts.isPropertyAccessExpression(root) ||
    ts.isElementAccessExpression(root) ||
    ts.isNonNullExpression(root)
  ) {
    root = root.expression;
  }
  if (ts.isIdentifier(root)) {
    const binding = resolveBinding(root);
    if (binding?.kind === "import") return "ほかのモジュールの値";
    if (binding?.kind === "parameter" && iteratedArray(binding.fn)) {
      return "並びを .map して渡すもの";
    }
  }
  return "値";
}

// ── 拾う ─────────────────────────────────────────────────────────────────

function record(
  context: FileContext,
  kind: "literals" | "values",
  node: ts.Node,
  position: string,
  source: string,
  reason: string,
): void {
  const key = `${kind}:${node.getStart(context.sourceFile)}:${position}`;
  if (context.seen.has(key)) return;
  context.seen.add(key);
  const { line, character } = context.sourceFile.getLineAndCharacterOfPosition(
    node.getStart(context.sourceFile),
  );
  context.report[kind].push({
    file: context.file,
    line: line + 1,
    column: character + 1,
    position,
    source,
    reason,
  });
}

function sourceText(context: FileContext, node: ts.Node): string {
  const text = node.getText(context.sourceFile).replace(/\s+/g, " ").trim();
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}

function checkText(
  context: FileContext,
  node: ts.Node,
  text: string,
  position: string,
): void {
  if (text.trim() === "") return;
  context.report.literalCount += 1;
  const phrases = splitIntoPhrases(text);
  if (phrases.length >= 2) {
    record(
      context,
      "literals",
      node,
      position,
      text,
      `2文節以上（${phrases.join("／")}）`,
    );
  }
}

/**
 * 手で書いた区切りの並び。字の要素が followsPhraseRules を満たすかを見る。部品が受け取った名前を並びに入れて
 * 渡すもの（`[...label, "（必須）"]` など）は受け渡しで、数えない。
 */
function checkPhraseArray(
  context: FileContext,
  array: ts.ArrayLiteralExpression,
  position: string,
): void {
  const phrases: string[] = [];
  let passesThrough = false;
  for (const element of array.elements) {
    const expression = ts.isSpreadElement(element)
      ? element.expression
      : element;
    if (fromComponentProps(expression)) {
      passesThrough = true;
      continue;
    }
    const node = ts.isSpreadElement(element)
      ? undefined
      : (resolveLocalValue(expression) ?? unwrap(expression));
    if (
      node &&
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ) {
      phrases.push(node.text);
      continue;
    }
    record(
      context,
      "values",
      array,
      position,
      sourceText(context, array),
      "値を含む区切りの並び",
    );
    return;
  }
  if (!passesThrough && !followsPhraseRules(phrases)) {
    record(
      context,
      "literals",
      array,
      position,
      phrases.join("／"),
      "区切りの並びが禁則を満たさない（followsPhraseRules）",
    );
  }
}

/** 名前を渡す位置の式（字か区切りの並びか要素）。 */
function checkName(
  context: FileContext,
  expression: ts.Expression,
  position: string,
): void {
  forEachBranch(expression, (branch) => {
    if (
      ts.isStringLiteral(branch) ||
      ts.isNoSubstitutionTemplateLiteral(branch)
    ) {
      checkText(context, branch, branch.text, position);
      return;
    }
    if (ts.isArrayLiteralExpression(branch)) {
      checkPhraseArray(context, branch, position);
      return;
    }
    if (
      ts.isJsxElement(branch) ||
      ts.isJsxSelfClosingElement(branch) ||
      ts.isJsxFragment(branch)
    ) {
      checkJsx(context, branch, position);
      return;
    }
    const local = resolveLocalValue(branch);
    if (local) {
      checkName(context, local, position);
      return;
    }
    if (fromComponentProps(branch)) return;
    record(
      context,
      "values",
      branch,
      position,
      sourceText(context, branch),
      valueReason(branch),
    );
  });
}

/** 選択肢の要素1つ。 */
function checkChoice(
  context: FileContext,
  expression: ts.Expression,
  position: string,
): void {
  forEachBranch(expression, (branch) => {
    const node = ts.isObjectLiteralExpression(branch)
      ? branch
      : resolveLocalValue(branch);
    if (node && ts.isObjectLiteralExpression(node)) {
      const key = CHOICE_NAME_KEYS.find((k) => findProperty(node, k));
      if (key) {
        checkName(context, findProperty(node, key)!, position);
      } else if (node.properties.some(ts.isSpreadAssignment)) {
        record(
          context,
          "values",
          node,
          position,
          sourceText(context, node),
          "広げて渡す要素",
        );
      }
      return;
    }
    if (fromComponentProps(branch)) return;
    record(
      context,
      "values",
      branch,
      position,
      sourceText(context, branch),
      valueReason(branch),
    );
  });
}

/** 並びの各要素に checkItem を当てる。並びが解けなければ値で渡すものにする。 */
function checkList(
  context: FileContext,
  expression: ts.Expression,
  position: string,
  checkItem: (element: ts.Expression) => void,
): void {
  forEachBranch(expression, (branch) => {
    const node = ts.isArrayLiteralExpression(branch)
      ? branch
      : resolveLocalValue(branch);
    if (node && ts.isArrayLiteralExpression(node)) {
      for (const element of node.elements) {
        if (ts.isSpreadElement(element)) {
          checkList(context, element.expression, position, checkItem);
        } else {
          checkItem(element);
        }
      }
      return;
    }
    if (fromComponentProps(branch)) return;
    record(
      context,
      "values",
      branch,
      position,
      sourceText(context, branch),
      valueReason(branch),
    );
  });
}

function checkGroup(
  context: FileContext,
  expression: ts.Expression,
  position: string,
): void {
  forEachBranch(expression, (branch) => {
    const node = ts.isObjectLiteralExpression(branch)
      ? branch
      : resolveLocalValue(branch);
    if (node && ts.isObjectLiteralExpression(node)) {
      const legend = findProperty(node, "legend");
      if (legend) checkName(context, legend, `${position} の \`legend\``);
      const options = findProperty(node, "options");
      if (options) {
        const optionPosition = `${position} の \`options\` の名前`;
        checkList(context, options, optionPosition, (element) =>
          checkChoice(context, element, optionPosition),
        );
      }
      return;
    }
    if (fromComponentProps(branch)) return;
    record(
      context,
      "values",
      branch,
      position,
      sourceText(context, branch),
      valueReason(branch),
    );
  });
}

/** JSX の字の子を、JSX が組む字にする（行の頭と終わりの空白を落とし、行を空白でつなぐ）。 */
function jsxTextValue(text: ts.JsxText): string {
  const lines = text.text.split(/\r?\n/);
  return lines
    .map((line, index) => {
      let value = line;
      if (index > 0) value = value.replace(/^[ \t]+/, "");
      if (index < lines.length - 1) value = value.replace(/[ \t]+$/, "");
      return value;
    })
    .filter((line) => line !== "")
    .join(" ");
}

function tagName(element: ts.JsxOpeningLikeElement): string {
  return element.tagName.getText();
}

function openingOf(
  element: ts.JsxElement | ts.JsxSelfClosingElement,
): ts.JsxOpeningLikeElement {
  return ts.isJsxElement(element) ? element.openingElement : element;
}

function attribute(
  element: ts.JsxOpeningLikeElement,
  name: string,
): ts.JsxAttribute | undefined {
  return element.attributes.properties.find(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText() === name,
  );
}

function attributeValue(attr: ts.JsxAttribute): ts.Expression | undefined {
  const initializer = attr.initializer;
  if (!initializer) return undefined;
  if (ts.isStringLiteral(initializer)) return initializer;
  if (ts.isJsxExpression(initializer)) return initializer.expression;
  return undefined;
}

/**
 * 字を持たない要素か。入力欄・画像などの素の要素と、子の無い素の要素と、子も props も無い部品（開閉の三角など）。
 */
function isTextless(
  element: ts.JsxElement | ts.JsxSelfClosingElement,
): boolean {
  const name = tagName(openingOf(element));
  if (CONTROL_ELEMENTS.has(name)) return true;
  if (!ts.isJsxSelfClosingElement(element)) return false;
  return isIntrinsic(name) || element.attributes.properties.length === 0;
}

/** 素の要素（`span` など。部品でないもの）か。 */
function isIntrinsic(name: string): boolean {
  return /^[a-z]/.test(name);
}

/** 名前と面として渡した要素。区切りを組む PhrasedText と、字を包むだけの素の要素の中を見る。 */
function checkJsx(
  context: FileContext,
  node: ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment,
  position: string,
): void {
  if (ts.isJsxFragment(node)) {
    checkContent(context, node.children, node, position);
    return;
  }
  const opening = openingOf(node);
  const name = tagName(opening);
  if (name === "PhrasedText") {
    const phrases = attribute(opening, "phrases");
    const value = phrases && attributeValue(phrases);
    if (value) checkName(context, value, position);
    return;
  }
  if (isTextless(node)) return;
  if (ts.isJsxElement(node) && isIntrinsic(name)) {
    checkContent(context, node.children, node, position);
    return;
  }
  record(context, "values", node, position, sourceText(context, node), "要素");
}

/** 式のどの枝も要素か（字を持たない枝は除く）。 */
function isJsxValued(expression: ts.Expression): boolean {
  let jsxOnly = true;
  forEachBranch(expression, (branch) => {
    if (
      !ts.isJsxElement(branch) &&
      !ts.isJsxSelfClosingElement(branch) &&
      !ts.isJsxFragment(branch)
    ) {
      jsxOnly = false;
    }
  });
  return jsxOnly;
}

/**
 * 名前と面を組む子（`Button` の子・素の要素の子・名前として渡した要素の子）。字だけなら字を、式が1つだけなら
 * その式を、素の要素だけならその中を見る。字と式、字と要素が混ざるものは値で渡すものにする。
 */
function checkContent(
  context: FileContext,
  children: ts.NodeArray<ts.JsxChild>,
  owner: ts.Node,
  position: string,
): void {
  interface TextRun {
    node: ts.Node;
    text: string;
  }
  const runs: TextRun[] = [];
  let current: TextRun | undefined;
  const expressions: ts.Expression[] = [];
  /** 要素と、どの枝も要素になる式（`{open && <span>…</span>}`）。 */
  const elements: (ts.JsxElement | ts.JsxSelfClosingElement | ts.Expression)[] =
    [];
  const closeRun = () => {
    if (current && current.text.trim() !== "") runs.push(current);
    current = undefined;
  };
  for (const child of children) {
    if (ts.isJsxText(child)) {
      if (child.containsOnlyTriviaWhiteSpaces) continue;
      const text = jsxTextValue(child);
      current = current
        ? { node: current.node, text: current.text + text }
        : { node: child, text };
      continue;
    }
    if (ts.isJsxExpression(child)) {
      if (!child.expression) continue;
      const node = unwrap(child.expression);
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node)
      ) {
        current = current
          ? { node: current.node, text: current.text + node.text }
          : { node, text: node.text };
        continue;
      }
      closeRun();
      if (isJsxValued(child.expression)) elements.push(child.expression);
      else expressions.push(child.expression);
      continue;
    }
    closeRun();
    if (ts.isJsxFragment(child) || !isTextless(child)) elements.push(child);
  }
  closeRun();

  const kinds =
    Number(runs.length > 0) +
    Number(expressions.length > 0) +
    Number(elements.length > 0);
  if (kinds === 0) return;
  if (kinds === 1) {
    for (const run of runs) {
      checkText(context, run.node, run.text.trim(), position);
    }
    for (const element of elements) checkName(context, element, position);
    if (expressions.length === 1) {
      checkName(context, expressions[0], position);
      return;
    }
    if (expressions.every((expression) => fromComponentProps(expression))) {
      return;
    }
    if (expressions.length === 0) return;
  }
  record(
    context,
    "values",
    owner,
    position,
    sourceText(context, owner),
    "字と式を含む要素",
  );
}

function hasSpread(
  element: ts.JsxOpeningLikeElement,
): ts.JsxSpreadAttribute | undefined {
  return element.attributes.properties.find(ts.isJsxSpreadAttribute);
}

function checkElement(
  context: FileContext,
  element: ts.JsxElement | ts.JsxSelfClosingElement,
): void {
  const opening = openingOf(element);
  const name = tagName(opening);
  const spread = hasSpread(opening);
  const recordSpread = (position: string) => {
    if (spread && !fromComponentProps(spread.expression)) {
      record(
        context,
        "values",
        spread,
        position,
        sourceText(context, spread),
        "広げて渡す props",
      );
    }
  };

  if (RAW_ELEMENTS.has(name)) {
    if (ts.isJsxElement(element)) {
      checkContent(context, element.children, element, `素の \`${name}\` の子`);
    }
    return;
  }

  if (name === "Button") {
    const position = "`Button` の面";
    const phrases = attribute(opening, "phrases");
    const phrasesValue = phrases && attributeValue(phrases);
    if (phrasesValue) {
      checkName(context, phrasesValue, position);
    } else if (ts.isJsxElement(element) && element.children.length > 0) {
      checkContent(context, element.children, element, position);
    } else {
      recordSpread(position);
    }
    return;
  }

  if (name === "CopyButton") {
    const showTarget = attribute(opening, "showTarget");
    const showValue = showTarget && attributeValue(showTarget);
    const shown =
      showTarget !== undefined &&
      !(showValue && showValue.kind === ts.SyntaxKind.FalseKeyword);
    const targetPhrases = attribute(opening, "targetPhrases");
    const targetPhrasesValue = targetPhrases && attributeValue(targetPhrases);
    const position = "`CopyButton` の `target`";
    if (targetPhrasesValue) {
      checkName(context, targetPhrasesValue, position);
    } else if (shown) {
      const target = attribute(opening, "target");
      const targetValue = target && attributeValue(target);
      if (targetValue) checkName(context, targetValue, position);
      else recordSpread(position);
    }
    return;
  }

  const checks: [
    Record<string, readonly string[]>,
    (value: ts.Expression, position: string) => void,
  ][] = [
    [NAME_PROPS, (value, position) => checkName(context, value, position)],
    [
      CHOICE_PROPS,
      (value, position) =>
        checkList(context, value, position, (item) =>
          checkChoice(context, item, position),
        ),
    ],
    [GROUP_PROPS, (value, position) => checkGroup(context, value, position)],
    [
      GROUP_LIST_PROPS,
      (value, position) =>
        checkList(context, value, position, (group) =>
          checkGroup(context, group, position),
        ),
    ],
  ];
  for (const [table, check] of checks) {
    for (const prop of table[name] ?? []) {
      const position =
        table === CHOICE_PROPS
          ? `\`${name}\` の \`${prop}\` の名前`
          : `\`${name}\` の \`${prop}\``;
      const attr = attribute(opening, prop);
      if (!attr) {
        if (table === NAME_PROPS) recordSpread(position);
        continue;
      }
      if (!attr.initializer) continue;
      const value = attributeValue(attr);
      if (value) check(value, position);
    }
  }
}

/** 1つのソースの字を数える。file は出力に書くパス。 */
export function analyzeSource(
  source: string,
  file: string,
  report: PhrasedNameReport = { literals: [], values: [], literalCount: 0 },
): PhrasedNameReport {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const context: FileContext = { sourceFile, file, report, seen: new Set() };
  const literalStart = report.literals.length;
  const valueStart = report.values.length;
  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      checkElement(context, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  sortFrom(report.literals, literalStart);
  sortFrom(report.values, valueStart);
  return report;
}

/** start から後ろの件を、ファイルの中の位置の順に並べる。 */
function sortFrom(findings: PhrasedNameFinding[], start: number): void {
  const sorted = findings
    .slice(start)
    .sort((a, b) => a.line - b.line || a.column - b.column);
  findings.splice(start, sorted.length, ...sorted);
}

function isTestFile(file: string): boolean {
  return (
    file.split(path.sep).includes("__tests__") ||
    /\.(test|spec)\.tsx$/.test(file)
  );
}

function collectFiles(target: string): string[] {
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith(".tsx") ? [target] : [];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const child = path.join(target, entry.name);
      if (entry.isDirectory()) {
        return entry.name === "node_modules" ? [] : collectFiles(child);
      }
      return entry.name.endsWith(".tsx") && !isTestFile(child) ? [child] : [];
    });
}

/**
 * ファイルかディレクトリのパスを受け、その中の `.tsx`（試験を除く）を数える。パスは root からの相対で出す。
 * ファイルを直に渡したときは、試験のファイルでも数える。
 */
export function findUnphrasedNames(
  targets: readonly string[],
  root: string = process.cwd(),
): PhrasedNameReport {
  const report: PhrasedNameReport = {
    literals: [],
    values: [],
    literalCount: 0,
  };
  const files = [
    ...new Set(
      targets.flatMap((target) => collectFiles(path.resolve(root, target))),
    ),
  ];
  for (const file of files) {
    analyzeSource(
      fs.readFileSync(file, "utf8"),
      path.relative(root, file),
      report,
    );
  }
  return report;
}

/** 1件を1行にする（`パス:行:字 位置 「字か式」 理由`）。 */
export function formatFinding(finding: PhrasedNameFinding): string {
  return `${finding.file}:${finding.line}:${finding.column}  ${finding.position}  「${finding.source}」  ${finding.reason}`;
}
