import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, test } from "vitest";
import {
  analyzeSource,
  findUnphrasedNames,
  formatFinding,
  type PhrasedNameFinding,
} from "../unphrased-names";

function analyze(source: string) {
  return analyzeSource(source, "Sample.tsx");
}

function literalTexts(source: string): string[] {
  return analyze(source).literals.map((finding) => finding.source);
}

function valueFindings(
  source: string,
): Pick<PhrasedNameFinding, "position" | "source" | "reason">[] {
  return analyze(source).values.map(({ position, source, reason }) => ({
    position,
    source,
    reason,
  }));
}

describe("字で渡す2文節以上の名前と面", () => {
  test.each([
    ["<Button onClick={go}>現在時刻を使用</Button>", "`Button` の面"],
    [
      '<Field label="数えるテキスト">{() => null}</Field>',
      "`Field` の `label`",
    ],
    ['<Checkbox label="縦横比を保つ" />', "`Checkbox` の `label`"],
    ['<Radio label="改行を削除" />', "`Radio` の `label`"],
    ['<FileDropZone label="画像ファイル" />', "`FileDropZone` の `label`"],
    ['<GuessInput label="漢字を入力" />', "`GuessInput` の `label`"],
    [
      '<RadioGroup legend="変換の向き" options={[]} />',
      "`RadioGroup` の `legend`",
    ],
    [
      '<Accordion summary="くわしい遊び方">本文</Accordion>',
      "`Accordion` の `summary`",
    ],
    [
      '<ListControls searchLabel="色名で探す" />',
      "`ListControls` の `searchLabel`",
    ],
    [
      '<BrowsableList searchLabel="名前・説明で探す" sorts={[]} />',
      "`BrowsableList` の `searchLabel`",
    ],
    [
      '<CopyButton text={mail} target="メール全文" showTarget />',
      "`CopyButton` の `target`",
    ],
  ])("%s", (jsx, position) => {
    const report = analyze(`export const x = ${jsx};`);
    expect(report.literals).toHaveLength(1);
    expect(report.literals[0].position).toBe(position);
    expect(report.values).toEqual([]);
  });

  test("面に名前を出さない CopyButton の target は見ない", () => {
    expect(
      literalTexts(
        `export const x = <CopyButton text={mail} target="メール全文" />;`,
      ),
    ).toEqual([]);
  });

  test("1文節の字は返さず、見た数には数える", () => {
    const report = analyze(`
      export const x = (
        <>
          <Button>送信</Button>
          <Field label="名前">{() => null}</Field>
        </>
      );
    `);
    expect(report.literals).toEqual([]);
    expect(report.literalCount).toBe(2);
  });

  test("三項演算子・&&・||・?? の枝の字を見る", () => {
    expect(
      literalTexts(`
        export const x = (
          <>
            <Button>{done ? "コピー済み" : "結果をコピー"}</Button>
            <Checkbox label={shown && "連続する改行をまとめる"} />
            <Accordion summary={title || "くわしい遊び方"} />
            <Field label={custom ?? "エラー訂正レベル"}>{() => null}</Field>
          </>
        );
      `),
    ).toEqual([
      "結果をコピー",
      "連続する改行をまとめる",
      "くわしい遊び方",
      "エラー訂正レベル",
    ]);
  });

  test("その場の並びと同じファイルの const の選択肢と組の名前を見る", () => {
    expect(
      literalTexts(`
        const MODES = [
          { value: "a", label: "改行を削除" },
          { value: "b", label: "削除" },
        ];
        const KIND_GROUP = {
          legend: "色の系統",
          options: [{ value: "red", name: "赤の系統" }],
        };
        export function Tile() {
          return (
            <>
              <RadioGroup legend="向き" options={MODES} />
              <RadioGroup legend="向き" options={[{ value: "c", label: "全角に変換" }]} />
              <Slider items={[{ label: "明るさの度合い", value: 1 }]} />
              <BrowsableList searchLabel="探す" sorts={[{ value: "new", label: "新しい順に並べる" }]} />
              <BrowsableList searchLabel="探す" sorts={[]} kindGroup={{ legend: "記事の種類", options: [] }} />
              <ListControls
                searchLabel="探す"
                kindGroup={KIND_GROUP}
                filterGroups={[{ legend: "難しさ", options: [{ value: "x", label: "とても難しい" }] }]}
                sortGroup={{ legend: "表示する内容", options: [] }}
              />
            </>
          );
        }
      `),
    ).toEqual([
      "改行を削除",
      "色の系統",
      "赤の系統",
      "全角に変換",
      "明るさの度合い",
      "新しい順に並べる",
      "記事の種類",
      "とても難しい",
      "表示する内容",
    ]);
  });

  test("素の label・legend・button・summary の子を見る", () => {
    const report = analyze(`
      export const x = (
        <>
          <label htmlFor="a">入力テキスト</label>
          <label><input type="checkbox" />連続する改行をまとめる</label>
          <legend>通知の設定</legend>
          <button type="button">もう一度読み込む</button>
          <summary>くわしい遊び方</summary>
        </>
      );
    `);
    expect(report.literals.map((f) => [f.position, f.source])).toEqual([
      ["素の `label` の子", "入力テキスト"],
      ["素の `label` の子", "連続する改行をまとめる"],
      ["素の `legend` の子", "通知の設定"],
      ["素の `button` の子", "もう一度読み込む"],
      ["素の `summary` の子", "くわしい遊び方"],
    ]);
  });

  test("区切りの並びで渡したものは、禁則を満たせば返さず、満たさなければ返す", () => {
    const report = analyze(`
      const LEGEND = ["変換の", "向き"];
      export const x = (
        <>
          <Button phrases={["絞り込みを", "外す"]} />
          <RadioGroup legend={LEGEND} options={[{ value: "a", name: ["全角に", "変換"] }]} />
          <CopyButton text={t} targetPhrases={["メール", "全文"]} showTarget />
          <legend><PhrasedText as="span" phrases={["通知の", "設定"]} /></legend>
          <Button phrases={["もう一度読み込", "む"]} />
          <Field label={["件数（", "10）"]}>{() => null}</Field>
        </>
      );
    `);
    expect(report.literals.map((f) => [f.position, f.source])).toEqual([
      ["`Button` の面", "もう一度読み込／む"],
      ["`Field` の `label`", "件数（／10）"],
    ]);
    expect(report.values).toEqual([]);
  });

  test("行と字の位置を返す", () => {
    const report = analyze(
      `export const x = (\n  <Button>画像を保存</Button>\n);\n`,
    );
    expect(formatFinding(report.literals[0])).toBe(
      "Sample.tsx:2:11  `Button` の面  「画像を保存」  2文節以上（画像を／保存）",
    );
  });
});

describe("どちらにも出さないもの", () => {
  test("区切りを受け取らない部品の label", () => {
    const report = analyze(`
      export const x = (
        <>
          <Breadcrumb items={[{ label: "ツールの一覧を見る" }]} />
          <LinkIndex label="部首から探す" groups={[]} />
          <ItemList label="新しく追加した道具" items={[]} />
        </>
      );
    `);
    expect(report.literals).toEqual([]);
    expect(report.values).toEqual([]);
  });

  test("名前を受け取る部品の中で、受け取った名前を中の部品へ渡す所", () => {
    const report = analyze(`
      export default function RadioGroup({ legend, options }) {
        return (
          <fieldset>
            <legend>{renderPhrasedName(legend)}</legend>
            {options.map((option) => (
              <Radio key={option.value} label={option.label} />
            ))}
          </fieldset>
        );
      }
      const REQUIRED = "（必須）";
      export function Field({ label, required }) {
        return (
          <label>
            {required ? (
              <PhrasedText as="span" phrases={[...(typeof label === "string" ? [label] : label), REQUIRED]} />
            ) : (
              renderPhrasedName(label)
            )}
          </label>
        );
      }
    `);
    expect(report.literals).toEqual([]);
    expect(report.values).toEqual([]);
  });
});

describe("値で渡すもの", () => {
  test("ほかのモジュールの定数・.map・差し込み・字と式を含む要素・広げた props・サーバーで区切る文", () => {
    expect(
      valueFindings(`
        import { LABEL, SORTS, ITEMS } from "./data";
        import { splitIntoPhrases } from "@/lib/phrase-breaks";
        export function Tile({ question }) {
          const rest = useFieldProps();
          return (
            <>
              <Field label={LABEL}>{() => null}</Field>
              <BrowsableList searchLabel="探す" sorts={SORTS} />
              {ITEMS.map((item) => <Checkbox key={item.value} label={item.label} />)}
              <GuessInput label={\`\${level}の漢字を入力\`} />
              <Button onClick={more}>{count}件を表示</Button>
              <Checkbox {...rest} />
              <Accordion summary={splitIntoPhrases(question)} />
            </>
          );
        }
      `),
    ).toEqual([
      {
        position: "`Field` の `label`",
        source: "LABEL",
        reason: "ほかのモジュールの値",
      },
      {
        position: "`BrowsableList` の `sorts` の名前",
        source: "SORTS",
        reason: "ほかのモジュールの値",
      },
      {
        position: "`Checkbox` の `label`",
        source: "item.label",
        reason: "並びを .map して渡すもの",
      },
      {
        position: "`GuessInput` の `label`",
        source: "`${level}の漢字を入力`",
        reason: "値を差し込んだ文",
      },
      {
        position: "`Button` の面",
        source: "<Button onClick={more}>{count}件を表示</Button>",
        reason: "字と式を含む要素",
      },
      {
        position: "`Checkbox` の `label`",
        source: "{...rest}",
        reason: "広げて渡す props",
      },
      {
        position: "`Accordion` の `summary`",
        source: "splitIntoPhrases(question)",
        reason: "サーバーで区切る文",
      },
    ]);
  });

  test("区切りを受け取らない部品の props から作った名前は、部品の中でも値で渡すものにする", () => {
    expect(
      valueFindings(`
        export default function FaqSection({ faq }) {
          return faq.map((entry) => <Accordion summary={entry.question} />);
        }
      `),
    ).toEqual([
      {
        position: "`Accordion` の `summary`",
        source: "entry.question",
        reason: "並びを .map して渡すもの",
      },
    ]);
  });
});

describe("findUnphrasedNames", () => {
  test("ディレクトリの .tsx を数え、試験と .tsx でないファイルを除く", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "unphrased-names-"));
    try {
      const write = (file: string, source: string) => {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        fs.writeFileSync(path.join(root, file), source);
      };
      const face = "export const x = <Button>画像を保存</Button>;";
      write("src/Tile.tsx", face);
      write("src/__tests__/Tile.test.tsx", face);
      write("src/Other.test.tsx", face);
      write("src/data.ts", "export const LABEL = '画像を保存';");
      const report = findUnphrasedNames(["src"], root);
      expect(report.literals.map((finding) => finding.file)).toEqual([
        path.join("src", "Tile.tsx"),
      ]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
