/**
 * 語義の最初の一文。一覧の行で、開く前に語の可笑しさの芯が読める長さにする。
 * 句点が無ければ全文を返す。
 */
export function getDefinitionPreview(definition: string): string {
  const firstSentenceEnd = definition.indexOf("。");
  if (firstSentenceEnd !== -1) {
    return definition.slice(0, firstSentenceEnd + 1);
  }
  return definition;
}
