import { RELEASE_ID } from "@/lib/generated/release-id";

/**
 * Google Analytics（gtag.js）の読み込み。React のページ（@/components/GoogleAnalytics）と、middleware が
 * 返す 410 の静的な HTML の両方がここから文を取り、どのページも同じ ID・同じ同意の既定・同じ config で送る。
 * middleware の束にも入るので、React や server-only に頼らない。
 */

/** GA の測定 ID。無い環境（開発・テスト）では undefined で、そのときは何も読み込まない。 */
export function gaTrackingId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_TRACKING_ID || undefined;
}

/** gtag.js を読み込む URL。 */
export function gtagLoaderSrc(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
}

/**
 * インラインの初期化の文。アナリティクス用の Cookie は既定で有効（/privacy に書いたとおり）で、
 * release は全イベントに乗る。ID と release は JSON.stringify で文字列の式にしてから埋め込む。
 */
export function gtagInitScript(id: string): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('consent','default',{analytics_storage:'granted'});gtag('config',${JSON.stringify(id)},{release:${JSON.stringify(RELEASE_ID)}});`;
}
