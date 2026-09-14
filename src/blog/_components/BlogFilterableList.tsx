"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BlogListPanel, { type BlogListData } from "./BlogListPanel";

/** キーワード検索の URL 反映を遅延させるミリ秒 */
const KEYWORD_DEBOUNCE_MS = 300;

/**
 * ブログ一覧のキーワード状態を URL（`?q=`）と同期させる Client Component。
 *
 * 描画そのものは {@link BlogListPanel} が行い、ここは状態管理だけを受け持つ:
 * - 入力は即時ローカル state に反映し、URL へは debounce して書き戻す
 * - URL 直接アクセスやブラウザバックで `?q=` が変わればローカル state を追従させる
 *
 * `useSearchParams` を呼ぶためプリレンダリング時はクライアント描画へ退避する。
 * その間に表示される静的シェルは、呼び出し元が同じ {@link BlogListPanel} を
 * fallback として描画することで用意する。
 */
export default function BlogFilterableList(props: BlogListData) {
  const { basePath } = props;
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlKeyword = searchParams.get("q") ?? "";

  // キーワードはローカル state で管理し、URL は debounce で遅延更新する
  const [keyword, setKeyword] = useState(urlKeyword);

  // URL から開かれた / ブラウザ戻るで URL が変わった場合、ローカル state も追従する
  useEffect(() => {
    setKeyword(urlKeyword);
  }, [urlKeyword]);

  // ローカル state の keyword を debounce して URL に反映
  useEffect(() => {
    if (keyword === urlKeyword) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (keyword.trim()) {
        params.set("q", keyword);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      // カテゴリページやタグページでも basePath を使って URL を構築
      router.replace(query ? `${basePath}?${query}` : basePath);
    }, KEYWORD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams の更新で再起動しない（urlKeyword で代用）
  }, [keyword, urlKeyword, router, basePath]);

  return (
    <BlogListPanel {...props} keyword={keyword} onKeywordChange={setKeyword} />
  );
}
