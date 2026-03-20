---
title: MCPサーバーによるAI画像生成APIのクレデンシャル隔離
date: 2026-03-20
purpose: AIエージェント（Claude Code）にImagen 4等の画像生成APIを安全に使わせるための実装方法を調査する
method: >
  Web検索（MCP credential isolation, image generation MCP servers, MCP vs CLI security,
  rate limiting patterns）、公式ドキュメント参照（Claude Code MCP docs、TypeScript SDK docs）、
  既存実装（lansespirit/image-gen-mcp、chug2k/gemini-imagen4）の調査
sources:
  - https://github.com/lansespirit/image-gen-mcp
  - https://github.com/chug2k/gemini-imagen4
  - https://github.com/modelcontextprotocol/typescript-sdk
  - https://code.claude.com/docs/en/mcp
  - https://infisical.com/blog/managing-secrets-mcp-servers
  - https://fast.io/resources/mcp-server-rate-limiting/
  - https://dev.to/mathewpregasen/mcp-vs-cli-tools-which-is-best-for-production-applications-bd8
  - https://www.flowhunt.io/blog/mcp-server-security-vulnerabilities-complete-guide/
  - https://aembit.io/blog/the-ultimate-guide-to-mcp-security-vulnerabilities/
---

# MCPサーバーによるAI画像生成APIのクレデンシャル隔離

## 調査の概要

Claude CodeなどのAIエージェントにImagen 4等の画像生成APIを安全に利用させるための方法として、MCPサーバーによるクレデンシャル隔離方式を調査した。2026年現在、MCPサーバー方式はCLIスクリプト方式に比べてセキュリティと制御性で明確な優位性を持つことが確認された。既存のOSSとして画像生成専用MCPサーバーが複数存在することも判明した。

---

## 1. MCPサーバーによるクレデンシャル隔離の仕組み

### 基本的なアーキテクチャ

MCPサーバーのstdio方式では、ホストアプリケーション（Claude Code）がMCPサーバーをサブプロセスとして起動する。APIキーは以下のフローで管理される。

1. Claude Codeの設定ファイル（`.mcp.json`）にAPIキーを環境変数として定義する
2. Claude CodeがMCPサーバープロセスを起動する際、その環境変数をプロセスに注入する
3. MCPサーバーは`process.env.API_KEY`でAPIキーにアクセスし、外部APIを呼び出す
4. Claude Code（クライアント）は、MCPサーバーが返した結果（画像パスやbase64データ）のみを受け取る

この構造により、「Claude Codeはツールの実行結果だけを受け取り、APIキー自体には触れない」という隔離が実現する。MCPのstdio実装では、サーバープロセスに注入された環境変数は同一プロセス内にのみ存在し、クライアントへは公開されない。

### Claude Codeの設定方法

プロジェクトルートの `.mcp.json` ファイルに以下のように設定する。

```json
{
  "mcpServers": {
    "image-generator": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-image-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    }
  }
}
```

`${GEMINI_API_KEY}` の記法により、実際のAPIキーはシェル環境変数から展開される。`.mcp.json` をバージョン管理に含めても、APIキー自体は含まれない。実際のAPIキーは `~/.zshrc` や `~/.bashrc` で設定するか、シークレット管理ツールで管理する。

複数のMCPサーバーがあっても、それぞれの `env` セクションは独立したプロセスにスコープされる。つまり画像生成サーバーのAPIキーが、別のMCPサーバーから参照されることはない。

### ユーザーレベルの設定

`~/.claude/settings.local.json`（ユーザースコープ）でも設定可能で、その場合はプロジェクト設定よりも高い権限を持つ。プロジェクト固有のAPIキーはプロジェクトの `.mcp.json` で、個人の共通APIキーはユーザー設定で管理するのが推奨パターンとなる。

---

## 2. 画像生成APIをMCPサーバーで提供する方法

### 既存の実装

2026年時点で、Imagen 4やGemini画像生成に対応したMCPサーバーが複数OSSとして存在する。

**lansespirit/image-gen-mcp**

- OpenAI (gpt-image-1, dall-e-3) と Google Imagen (imagen-4, imagen-3, imagen-4-ultra) の両方をサポートするPython製MCPサーバー
- FastMCPフレームワークを使用
- 提供ツール: `list_available_models`, `generate_image`, `edit_image`
- Gemini認証: Vertex AI のサービスアカウントJSONファイルパスを `PROVIDERS__GEMINI__API_KEY` に設定

**chug2k/gemini-imagen4**

- TypeScript製、Google Imagen 4.0に特化したMCPサーバー
- `generate_image_from_text` ツールを提供（プロンプト、モデル選択、アスペクト比、出力フォーマットのパラメータ対応）
- `GEMINI_API_KEY` 環境変数で認証
- 生成画像は `./generated-images/` ディレクトリにタイムスタンプ付きで保存
- Claude Desktop / Claude Code のどちらにも対応

**serkanhaslak/gemini-imagen-mcp-server**

- Gemini Imagen API に最適化されたMCPサーバー
- プロジェクト内の `imagen/` フォルダに画像を直接保存

**writingmate/imagegen-mcp**

- OpenAI GPT-Image-1、Google Imagen 4、Flux 1.1、Qwen Image など多数のプロバイダーをサポート

### 独自実装の基本構造（TypeScript/Node.js）

`@modelcontextprotocol/sdk` を使った最小構成のMCPサーバーは以下のようになる。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// APIキーはプロセス環境変数から取得（クライアントには露出しない）
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const server = new McpServer({
  name: "image-generator",
  version: "1.0.0",
});

server.registerTool(
  "generate_image",
  {
    title: "Generate Image",
    description: "Generate an image from a text prompt using Imagen 4",
    inputSchema: z.object({
      prompt: z.string().describe("Text description of the image to generate"),
      aspectRatio: z
        .enum(["1:1", "16:9", "9:16", "4:3"])
        .optional()
        .default("1:1"),
    }),
  },
  async ({ prompt, aspectRatio }) => {
    // ここでImagen 4 APIを呼び出す
    // GEMINI_API_KEY はこのクロージャ内でのみアクセス可能
    const imageUrl = await callImagenAPI(GEMINI_API_KEY, prompt, aspectRatio);
    return {
      content: [{ type: "text", text: imageUrl }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 3. MCPサーバー方式 vs CLIスクリプト方式の比較

### セキュリティ（APIキー隔離の強度）

| 観点               | MCPサーバー方式                                        | CLIスクリプト方式                                    |
| ------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| APIキーの隔離      | サブプロセスの環境変数に隔離。クライアントから参照不可 | シェル環境全体に展開。他のコマンドからもアクセス可能 |
| 入力バリデーション | JSON Schemaによるプロトコルレベルのバリデーション      | スクリプト実装依存。prompt injectionリスクが高い     |
| 権限スコープ       | ツール単位で最小権限を定義可能                         | CLIアクセス権限で実行可能な全操作が潜在的なリスク    |
| 監査ログ           | MCPゲートウェイによる一元的な操作記録が可能            | 実装依存。標準的な仕組みがない                       |

CLIスクリプト方式は「エージェントにフルのユーザーアクセスを与えるのと等価」と評価されており、MCPサーバー方式の方が構造的に安全性が高い。

ただし、OWASPのGenAIガイドはMCPサーバー固有の脆弱性（tool poisoning、rug pulls、code injection、credential leakage）も指摘しており、MCPが万能ではない点は注意が必要。

### 料金制限の実装方法

| 観点             | MCPサーバー方式                                      | CLIスクリプト方式                                              |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| カウンター管理   | ステートフルなサーバープロセスで継続的にカウント可能 | プロセスが都度起動するため状態の継続が困難（ファイルやDB必要） |
| リクエスト制限   | ミドルウェアとして一元的に実装可能                   | 各スクリプトに個別実装が必要                                   |
| コスト上限の精度 | リクエスト前にチェックして確実に遮断可能             | 実装次第だが構造上難しい                                       |

MCPサーバーはプロセスが継続動作するため、インメモリでカウンターを管理できる。ただし、サーバーを再起動すると状態が失われるため、永続化が必要な場合はJSONファイルへの書き出しを行う。

### エージェントからの呼び出しやすさ

MCPサーバー方式では、Claude Codeがツールを自動認識して「generate_image を使って画像を生成する」という自然言語の指示から直接ツールを呼び出せる。CLIスクリプト方式では、エージェントがbashコマンドを組み立てる必要があり、引数フォーマットのエラーが発生しやすい。

### 実装の複雑さ

MCPサーバー方式は初期実装にTypeScriptまたはPythonの実装が必要だが、既存のOSSを活用すれば設定のみで対応可能なケースが多い。CLIスクリプト方式は初期コストが低いが、マルチステップのワークフローや状態管理で問題が発生しやすい。

---

## 4. MCPサーバーの実装パターン詳細

### パッケージのインストール

```bash
npm install @modelcontextprotocol/sdk zod
```

### 推奨ディレクトリ構成

```
mcp-image-server/
  src/
    index.ts        # エントリーポイント（MCPサーバー定義）
    imagenClient.ts # Imagen API クライアント
    rateLimiter.ts  # 料金制限ロジック
    counter.ts      # 永続化カウンター（JSONファイル）
  dist/             # ビルド出力
  package.json
  tsconfig.json
```

### ツール定義のパターン

ツール定義では Zod スキーマで入力を厳密に定義する。これがプロトコルレベルのバリデーションとして機能し、不正な入力はMCPの層で拒絶される。

```typescript
server.registerTool(
  "generate_image",
  {
    title: "Generate Image",
    description: "...",
    inputSchema: z.object({
      prompt: z.string().max(1000), // 入力長制限もスキーマで定義
      aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
    }),
  },
  async (input) => {
    /* ハンドラー */
  },
);
```

---

## 5. MCPサーバーでの料金制限の実装

### シンプルな日次制限パターン（TypeScript）

プロセスが継続動作するMCPサーバーでは、インメモリカウンターで十分なケースが多い。ただし再起動後もカウントを引き継ぎたい場合はJSONファイルへの永続化を行う。

```typescript
import * as fs from "fs";
import * as path from "path";

interface UsageRecord {
  date: string; // YYYY-MM-DD形式
  count: number; // 当日のリクエスト数
  estimatedCost: number; // 推定コスト（USD）
}

const COUNTER_FILE = path.join(__dirname, "../data/usage.json");
const DAILY_LIMIT_COUNT = 50; // 1日あたりの最大リクエスト数
const DAILY_LIMIT_COST_USD = 5.0; // 1日あたりの最大コスト

function loadUsage(): UsageRecord {
  const today = new Date().toISOString().split("T")[0];
  try {
    const data = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf-8"));
    if (data.date === today) return data;
  } catch {
    // ファイルが存在しない場合は初期値を返す
  }
  return { date: today, count: 0, estimatedCost: 0 };
}

function saveUsage(usage: UsageRecord): void {
  fs.mkdirSync(path.dirname(COUNTER_FILE), { recursive: true });
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(usage, null, 2));
}

export function checkAndIncrementUsage(costPerRequest: number): void {
  const usage = loadUsage();

  if (usage.count >= DAILY_LIMIT_COUNT) {
    throw new Error(
      `Daily request limit reached (${DAILY_LIMIT_COUNT} requests/day)`,
    );
  }
  if (usage.estimatedCost + costPerRequest > DAILY_LIMIT_COST_USD) {
    throw new Error(`Daily cost limit reached ($${DAILY_LIMIT_COST_USD}/day)`);
  }

  usage.count += 1;
  usage.estimatedCost += costPerRequest;
  saveUsage(usage);
}
```

### ツールハンドラーへの組み込み

```typescript
async ({ prompt, aspectRatio }) => {
  // Imagen 4 の料金: $0.04/image（Vertex AI 概算）
  const COST_PER_IMAGE = 0.04;

  try {
    checkAndIncrementUsage(COST_PER_IMAGE);
  } catch (limitError) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${(limitError as Error).message}. Please try again tomorrow.`,
        },
      ],
      isError: true,
    };
  }

  // 実際の画像生成処理
  const imageData = await callImagenAPI(prompt, aspectRatio);
  return {
    content: [{ type: "text", text: imageData }],
  };
};
```

---

## 6. 総合評価と推奨実装方針

### MCPサーバー方式を選択すべき理由

このプロジェクト（yolos.net）のユースケース（Claude CodeエージェントがImagen 4で画像を生成する）においては、MCPサーバー方式が優位である。

- APIキーは設定ファイルの環境変数参照（`${GEMINI_API_KEY}`）として管理し、実際の値はシェル環境変数に設定する。Claude Codeのコンテキストにはキーが流れない
- JSON Schemaによるプロトコルレベルのバリデーションで、プロンプトインジェクションのリスクを軽減できる
- ステートフルなプロセスで日次カウンターを管理し、料金超過を構造的に防止できる
- 既存OSSの `chug2k/gemini-imagen4` や `lansespirit/image-gen-mcp` を参考にすれば、実装コストは低い

### 実装の優先順位

1. まず既存OSS（`chug2k/gemini-imagen4`）を試用してプロトタイプを確認する
2. 料金制限が不要・薄い場合は既存OSSをそのまま `.mcp.json` に設定して利用する
3. 料金制限が必要な場合は、TypeScript SDKで独自MCPサーバーを実装し、日次カウンターを組み込む
4. `.mcp.json` は `.gitignore` に含めず共有するが、APIキーは `${ENV_VAR}` 参照にとどめ、実際の値はローカル環境変数（`~/.zshrc` 等）に設定する

### 注意事項

- MCPサーバーのセキュリティリスクとして、tool poisoningやcode injectionが2026年現在も指摘されている。Claude Codeが参照するMCPサーバーは信頼できるものに限定する
- 53%のMCPサーバーが静的APIキーに依存しているという統計があり、キーローテーションの仕組みも検討に値する
- Imagen 4はVertex AI経由（サービスアカウント必要）とGoogle AI Studio経由（APIキー）で利用方法が異なる。どちらを使うかによって認証方法が変わる点に注意する

---

## 参考リンク

- [lansespirit/image-gen-mcp - GitHub](https://github.com/lansespirit/image-gen-mcp)
- [chug2k/gemini-imagen4 - GitHub](https://github.com/chug2k/gemini-imagen4)
- [modelcontextprotocol/typescript-sdk - GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [Connect Claude Code to tools via MCP - 公式ドキュメント](https://code.claude.com/docs/en/mcp)
- [Managing Secrets in MCP Servers - Infisical](https://infisical.com/blog/managing-secrets-mcp-servers)
- [MCP Server Rate Limiting: Implementation Guide - Fast.io](https://fast.io/resources/mcp-server-rate-limiting/)
- [MCP vs CLI Tools: Which is best for production applications? - DEV Community](https://dev.to/mathewpregasen/mcp-vs-cli-tools-which-is-best-for-production-applications-bd8)
- [MCP Server Security Vulnerabilities - FlowHunt](https://www.flowhunt.io/blog/mcp-server-security-vulnerabilities-complete-guide/)
- [The Ultimate Guide to MCP Security Vulnerabilities - Aembit](https://aembit.io/blog/the-ultimate-guide-to-mcp-security-vulnerabilities/)
- [MCP Authentication in Claude Code 2026 Guide - TrueFoundry](https://www.truefoundry.com/blog/mcp-authentication-in-claude-code)
