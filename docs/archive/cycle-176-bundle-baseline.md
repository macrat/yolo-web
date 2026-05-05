# cycle-176 B-2 First Load JS 計測記録

## 判断方針（致命的 1 対応）

cycle-176 計画書 L162-163 が指定する 2 つの方針のうち **(a) 方式を採用**:

> (a) cycle-175 計測値（共通バンドル 157.0 KB gzip 等、cycle-175.md L307-319 に記載）を
> 参照点として明記、本サイクル成果物完成時の `npm run build` 実行後に同方式で計測した
> 値と比較

cycle-175.md L307-319 に `build-manifest.json` の `rootMainFiles` + `polyfillFiles` を
`gzip -c <file> | wc -c` で個別計測した値が記録されているため、
本サイクルでも同一手順で計測した。

## 計測手順

```
node -e "
const manifest = require('./.next/build-manifest.json');
const fs = require('fs');
const { execSync } = require('child_process');
const rootFiles = manifest.rootMainFiles || [];
const polyfills = manifest.polyfillFiles || [];
const all = [...new Set([...rootFiles, ...polyfills])];
let totalRaw = 0; let totalGzip = 0;
all.forEach(f => {
  const fullPath = '.next/' + f;
  const stat = fs.statSync(fullPath);
  const rawSize = stat.size;
  const gzip = parseInt(execSync('gzip -c ' + fullPath + ' | wc -c').toString().trim());
  totalRaw += rawSize; totalGzip += gzip;
});
console.log('TOTAL raw:', (totalRaw/1024).toFixed(1) + 'KB', 'gzip:', (totalGzip/1024).toFixed(1) + 'KB');
"
```

## 計測結果

| 計測対象                                         | raw       | gzip      |
| ------------------------------------------------ | --------- | --------- |
| cycle-175 ベースライン（cycle-175.md L313 より） | 511.0 KB  | 157.0 KB  |
| cycle-176 B-2 完成時（本サイクル計測）           | 511.0 KB  | 157.0 KB  |
| **差分**                                         | **+0 KB** | **+0 KB** |

### 内訳（cycle-176 B-2 完成時）

| ファイル                      | raw          | gzip         |
| ----------------------------- | ------------ | ------------ |
| 04e43d938de29aa7.js           | 20.1 KB      | 6.5 KB       |
| 797fcb0710da3be2.js           | 32.1 KB      | 7.1 KB       |
| cc6c6e77d541b691.js           | 218.3 KB     | 68.2 KB      |
| 85803b261323eced.js           | 120.5 KB     | 32.7 KB      |
| turbopack-6aad847e1e39b0cf.js | 10.0 KB      | 4.0 KB       |
| a6dad97d9634a72d.js           | 110.0 KB     | 38.6 KB      |
| **合計**                      | **511.0 KB** | **157.0 KB** |

## 判定

- **基準**: cycle-175 ベースライン（157.0 KB gzip）より悪化していないこと
- **結果**: 157.0 KB gzip = 基準値と完全一致 → **判定 OK**

B-2 の slug ベース lazy loader 方式（tile-loader.ts + FallbackTile.tsx）は
`next/dynamic` + `ssr: false` により FallbackTile が共通バンドルに含まれず、
First Load JS への影響がゼロであることを確認した。

## 参照先

- cycle-175.md L307-319（cycle-175 ベースライン計測記録）
- cycle-176 計画書 L162-163（B-2 完了条件）
