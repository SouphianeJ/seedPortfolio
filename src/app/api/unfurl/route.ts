import { NextResponse } from "next/server";
import { promises as dns } from "dns";
import { isIP } from "net";

const USER_AGENT =
  "Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://example.com/bot)";
const ACCEPT_HEADER = "text/html,application/xhtml+xml";
const FETCH_TIMEOUT_MS = 5000;
const MAX_CONTENT_LENGTH = 1024 * 1024; // 1 MiB

const allowList = (process.env.UNFURL_ALLOW_HOSTS ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

const denyList = (process.env.UNFURL_DENY_HOSTS ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

class UnfurlError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const HEAD_FALLBACK_STATUSES = new Set([405, 501]);

const ipv4ToInt = (ip: string) =>
  ip.split(".").reduce((acc, part) => (acc << 8) + Number.parseInt(part, 10), 0);

const IPV4_BLOCK_RANGES: Array<[number, number]> = [
  [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")],
  [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")],
  [ipv4ToInt("100.64.0.0"), ipv4ToInt("100.127.255.255")],
  [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")],
  [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")],
  [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")],
  [ipv4ToInt("192.0.0.0"), ipv4ToInt("192.0.0.255")],
  [ipv4ToInt("192.0.2.0"), ipv4ToInt("192.0.2.255")],
  [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")],
  [ipv4ToInt("198.18.0.0"), ipv4ToInt("198.19.255.255")],
  [ipv4ToInt("198.51.100.0"), ipv4ToInt("198.51.100.255")],
  [ipv4ToInt("203.0.113.0"), ipv4ToInt("203.0.113.255")],
  [ipv4ToInt("224.0.0.0"), ipv4ToInt("239.255.255.255")],
  [ipv4ToInt("240.0.0.0"), ipv4ToInt("255.255.255.255")],
];

const expandIpv6 = (address: string) => {
  const parts = address.split("::");
  if (parts.length > 2) {
    throw new UnfurlError("Adresse IPv6 invalide.", 403);
  }
  const headParts = parts[0]?.split(":").filter(Boolean) ?? [];
  const tailParts = parts[1]?.split(":").filter(Boolean) ?? [];
  const missing = 8 - (headParts.length + tailParts.length);
  const zeros = Array(Math.max(missing, 0)).fill("0");
  return [...headParts, ...zeros, ...tailParts].map((segment) =>
    segment.padStart(4, "0"),
  );
};

const ipv6ToBigInt = (address: string) => {
  const expanded = expandIpv6(address);
  return BigInt(`0x${expanded.join("")}`);
};

const extractMappedIpv4 = (address: string) => {
  const lower = address.toLowerCase();
  if (!lower.startsWith("::ffff:")) return null;
  const suffix = address.slice(7);
  if (suffix.includes(".")) {
    return suffix;
  }
  const segments = suffix.split(":").filter(Boolean);
  if (segments.length !== 2) return null;
  const high = Number.parseInt(segments[0], 16);
  const low = Number.parseInt(segments[1], 16);
  if (Number.isNaN(high) || Number.isNaN(low)) return null;
  return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
};

const IPV6_BLOCK_RANGES: Array<[bigint, bigint]> = [
  [
    BigInt("0x00000000000000000000000000000000"),
    BigInt("0x00000000000000000000000000000000"),
  ], // Unspecified
  [
    BigInt("0x00000000000000000000000000000001"),
    BigInt("0x00000000000000000000000000000001"),
  ], // Loopback
  [
    BigInt("0xfc000000000000000000000000000000"),
    BigInt("0xfdffffffffffffffffffffffffffffff"),
  ], // Unique local
  [
    BigInt("0xfe800000000000000000000000000000"),
    BigInt("0xfebfffffffffffffffffffffffffffff"),
  ], // Link-local
  [
    BigInt("0xff000000000000000000000000000000"),
    BigInt("0xffffffffffffffffffffffffffffffff"),
  ], // Multicast / reserved
];

const matchHostname = (host: string, patterns: string[]) =>
  patterns.some((pattern) => {
    if (pattern.startsWith("*")) {
      const suffix = pattern.slice(1);
      return host === suffix.replace(/^\./, "") || host.endsWith(suffix);
    }
    return host === pattern;
  });

const parseTarget = (target: string) => {
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new UnfurlError("URL invalide.");
  }

  if (!/https?:/.test(parsed.protocol)) {
    throw new UnfurlError("Seuls les schémas HTTP(S) sont autorisés.");
  }

  return parsed;
};

const isIpv4Blocked = (address: string) => {
  const int = ipv4ToInt(address);
  return IPV4_BLOCK_RANGES.some(([start, end]) => int >= start && int <= end);
};

const isIpv6Blocked = (address: string) => {
  const value = ipv6ToBigInt(address);
  return IPV6_BLOCK_RANGES.some(([start, end]) => value >= start && value <= end);
};

const resolveHostAddresses = async (host: string) => {
  if (isIP(host)) {
    return [host];
  }

  const addresses = new Set<string>();
  const lookups = await Promise.allSettled([
    dns.resolve(host),
    dns.resolve(host, "AAAA"),
  ]);

  for (const result of lookups) {
    if (result.status === "fulfilled") {
      for (const entry of result.value) {
        addresses.add(entry);
      }
    } else if (result.status === "rejected") {
      const reason = result.reason as NodeJS.ErrnoException;
      if (
        reason?.code &&
        !["ENODATA", "ENOTFOUND", "ENOTIMP", "EREFUSED"].includes(reason.code)
      ) {
        throw reason;
      }
    }
  }

  return [...addresses];
};

const ensureHostAllowed = async (url: URL) => {
  const host = url.hostname.toLowerCase();

  if (denyList.length && matchHostname(host, denyList)) {
    throw new UnfurlError("Ce domaine est bloqué.", 403);
  }

  if (allowList.length && !matchHostname(host, allowList)) {
    throw new UnfurlError("Ce domaine n'est pas autorisé.", 403);
  }

  const addresses = await resolveHostAddresses(host);
  if (!addresses.length) {
    throw new UnfurlError("Impossible de résoudre l'hôte cible.");
  }

  for (const address of addresses) {
    const ipType = isIP(address);
    if (ipType === 4 && isIpv4Blocked(address)) {
      throw new UnfurlError("Adresse IP privée ou réservée refusée.", 403);
    }
    if (ipType === 6) {
      const mapped = extractMappedIpv4(address);
      if (mapped && isIpv4Blocked(mapped)) {
        throw new UnfurlError("Adresse IP privée ou réservée refusée.", 403);
      }
      if (isIpv6Blocked(address)) {
        throw new UnfurlError("Adresse IP privée ou réservée refusée.", 403);
      }
    }
  }

  return addresses;
};

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let abortListener: (() => void) | undefined;

  if (init?.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      abortListener = () => controller.abort();
      init.signal.addEventListener("abort", abortListener, { once: true });
    }
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new UnfurlError("La récupération du lien a expiré.", 504);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    if (abortListener && init?.signal) {
      init.signal.removeEventListener("abort", abortListener);
    }
  }
};

const checkContentLength = (response: Response) => {
  const lengthHeader = response.headers.get("content-length");
  if (!lengthHeader) return;
  const length = Number.parseInt(lengthHeader, 10);
  if (Number.isFinite(length) && length > MAX_CONTENT_LENGTH) {
    throw new UnfurlError("Le contenu du lien est trop volumineux.", 413);
  }
};

const readBodyWithLimit = async (response: Response) => {
  if (!response.body) {
    return response.text();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > MAX_CONTENT_LENGTH) {
        void reader.cancel();
        throw new UnfurlError("Le contenu du lien est trop volumineux.", 413);
      }
      result += decoder.decode(value, { stream: true });
    }
  }

  result += decoder.decode();
  return result;
};

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
      { error: "Paramètre ?url manquant." },
      { status: 400 },
    );
  }

  let parsedTarget: URL | null = null;
  let resolvedAddresses: string[] = [];

  try {
    parsedTarget = parseTarget(target);

    resolvedAddresses = await ensureHostAllowed(parsedTarget);

    const commonOptions: RequestInit = {
      redirect: "follow",
      headers: {
        "user-agent": USER_AGENT,
        accept: ACCEPT_HEADER,
      },
    };

    try {
      const headResponse = await fetchWithTimeout(parsedTarget.toString(), {
        ...commonOptions,
        method: "HEAD",
      });
      if (headResponse.ok) {
        checkContentLength(headResponse);
      } else if (!HEAD_FALLBACK_STATUSES.has(headResponse.status)) {
        throw new UnfurlError("Impossible de récupérer l'aperçu du lien.", headResponse.status);
      }
    } catch (error) {
      if (error instanceof UnfurlError) {
        if (error.status === 504 || !HEAD_FALLBACK_STATUSES.has(error.status)) {
          throw error;
        }
      }
      // Continue with GET when HEAD fails unless it's a timeout
    }

    const response = await fetchWithTimeout(parsedTarget.toString(), commonOptions);

    if (!response.ok) {
      throw new UnfurlError("Impossible de récupérer l'aperçu du lien.", response.status);
    }

    checkContentLength(response);

    const html = await readBodyWithLimit(response);

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
    if (error instanceof UnfurlError) {
      console.warn("Blocked unfurl attempt", {
        url: target,
        status: error.status,
        reason: error.message,
        host: parsedTarget?.hostname,
        addresses: resolvedAddresses,
        requester: request.headers.get("user-agent") ?? undefined,
      });
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Failed to unfurl", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'aperçu du lien." },
      { status: 500 },
    );
  }
}
