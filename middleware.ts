import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (value) => value.toString(16).padStart(2, "0")).join("");
}

function createContentSecurityPolicy(nonce: string, isDev: boolean): string {
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "https://*.vercel.app"];
  const styleSrc = ["'self'", `'nonce-${nonce}'`, "https://*.vercel.app"];
  const connectSrc = ["'self'", "https://*.vercel.app"];

  if (isDev) {
    scriptSrc.push("'unsafe-eval'", "'unsafe-inline'", "http://localhost:3000", "ws://localhost:3000");
    styleSrc.push("'unsafe-inline'", "http://localhost:3000");
    connectSrc.push("http://localhost:3000", "ws://localhost:3000");
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": styleSrc,
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": connectSrc,
    "frame-src": ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "media-src": ["'self'"],
    "object-src": ["'none'"],
  };

  const serialized = Object.entries(directives)
    .map(([key, value]) => `${key} ${value.join(" ")}`)
    .join("; ");

  if (isDev) {
    return serialized;
  }

  return `${serialized}; upgrade-insecure-requests`;
}

const permissionsPolicy = [
  "accelerometer=()",
  "ambient-light-sensor=()",
  'autoplay=(self "https://www.youtube.com")',
  "camera=()",
  "clipboard-read=()",
  "clipboard-write=(self)",
  "display-capture=()",
  'fullscreen=(self "https://www.youtube.com")',
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  'picture-in-picture=(self "https://www.youtube.com")',
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "sync-xhr=()",
  "usb=()",
].join(", ");

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== "production";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    "Content-Security-Policy",
    createContentSecurityPolicy(nonce, isDev),
  );

  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", permissionsPolicy);

  return response;
}

export const config = {
  matcher: "/:path*",
};
