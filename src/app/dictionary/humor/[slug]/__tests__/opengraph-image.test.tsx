// @vitest-environment node
import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";
import { humorShareImageContent } from "@/humor-dict/_lib/share-image-content";
import { BASE_URL } from "@/lib/constants";
import {
  renderShareImage,
  shareImageAlt,
  shareOpenGraphImage,
} from "@/lib/share-image";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "@/lib/share-image-frame";
import { generateMetadata } from "../page";
import * as route from "../opengraph-image/route";

/**
 * 語の画像の Route Handler と、語のページの `openGraph.images`。どちらも `humorShareImageContent` の同じ中身から
 * 作るので、画像に書いた字と代替テキストと URL が食い違わない。画像は書体を Google Fonts から取って描くので、この
 * テストはネットワークを使う。
 */

const SLUG = "monday";
const entry = getEntryBySlug(SLUG)!;
const content = humorShareImageContent(entry);

function paramsOf(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("語の画像の Route Handler", () => {
  test("ビルドで書き出し、無い語は描かない", () => {
    expect(route.dynamic).toBe("force-static");
    expect(route.dynamicParams).toBe(false);
    expect(route.revalidate).toBe(false);
    expect(route.generateStaticParams()).toEqual(
      getAllSlugs().map((slug) => ({ slug })),
    );
  });

  test("語の画像を 1200×630 の PNG で返す", async () => {
    const response = await route.GET(
      new Request(`${BASE_URL}/dictionary/humor/${SLUG}/opengraph-image`),
      paramsOf(SLUG),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    const png = Buffer.from(await response.arrayBuffer());
    const { width, height, format } = await sharp(png).metadata();
    expect({ width, height, format }).toEqual({
      width: SHARE_IMAGE_WIDTH,
      height: SHARE_IMAGE_HEIGHT,
      format: "png",
    });
  });

  test("無い語は 404 にする", async () => {
    await expect(
      route.GET(
        new Request(
          `${BASE_URL}/dictionary/humor/no-such-word/opengraph-image`,
        ),
        paramsOf("no-such-word"),
      ),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  test("画像の中身は、補助情報「ユーモア辞典」・見出し語・読み・定義", () => {
    expect(content).toEqual({
      aux: "ユーモア辞典",
      name: entry.word,
      reading: entry.reading,
      subtitle: entry.definition,
    });
  });

  test.each(getAllSlugs())(
    "%s: 定義を切らずに描く（代替テキストが画像の字と同じになる）",
    async (slug) => {
      const { layout } = await renderShareImage(
        humorShareImageContent(getEntryBySlug(slug)!),
      );
      expect(layout.subtitleTruncated).toBe(false);
    },
  );
});

describe("語のページの openGraph.images", () => {
  test("画像の Route Handler の URL と、画像に書いた字の代替テキストを渡す", async () => {
    const metadata = await generateMetadata(paramsOf(SLUG));
    const images = (metadata.openGraph as { images?: unknown } | undefined)
      ?.images;
    expect(images).toEqual([
      shareOpenGraphImage(`/dictionary/humor/${SLUG}`, content),
    ]);
    const [image] = images as { url: string; alt: string }[];
    expect(image.url).toMatch(
      new RegExp(
        `^${BASE_URL}/dictionary/humor/${SLUG}/opengraph-image\\?v=[0-9a-f]{16}$`,
      ),
    );
    expect(image.alt).toBe(shareImageAlt(content));
    expect(image.alt).toBe(
      `yolos.net ユーモア辞典 ${entry.word} ${entry.reading} ${entry.definition}`,
    );
  });
});
