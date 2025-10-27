import { NextResponse } from "next/server";

const absolutize = (base: string, maybeUrl?: string | null) => {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl, base).toString();
  } catch {
    return null;
  }
};

const META_TAG_REGEX = /<meta\s+[^>]*?(property|name)="([^"]+)"[^>]*?content="([^"]*)"[^>]*?>/gi;
const ICON_REGEX = /<link[^>]+rel="(?:shortcut icon|icon|apple-touch-icon)"[^>]+href="([^"]+)"/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json(
      { error: "Missing ?url=" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(target, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://example.com/bot)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await response.text();

    const metas = Array.from(html.matchAll(META_TAG_REGEX)).map((match) => ({
      key: match[2]?.toLowerCase() ?? "",
      content: match[3] ?? "",
    }));

    const og = (key: string) =>
      metas.find((entry) => entry.key === `og:${key}`)?.content || null;
    const tw = (key: string) =>
      metas.find((entry) => entry.key === `twitter:${key}`)?.content || null;

    const title =
      og("title") ||
      tw("title") ||
      html.match(/<title>(.*?)<\/title>/i)?.[1] ||
      null;

    const description =
      og("description") ||
      tw("description") ||
      metas.find((entry) => entry.key === "description")?.content ||
      null;

    let image = og("image") || tw("image") || null;

    if (!image) {
      const iconMatch = html.match(ICON_REGEX);
      image = iconMatch?.[1] ?? "/favicon.ico";
    }

    const absoluteImage = absolutize(response.url, image);

    return NextResponse.json(
      {
        url: response.url,
        title,
        description,
        image: absoluteImage,
      },
      {
        headers: {
          "cache-control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Failed to unfurl", error);
    return NextResponse.json(
      { error: "Failed to fetch target" },
      { status: 500 },
    );
  }
}
