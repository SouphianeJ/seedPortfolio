import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "admin-session";
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 6; // 6 hours
export const REMEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type VerifiedSession = {
  identifier: string;
  expiresAt: number;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let cachedSecret: string | null = null;
let cachedKey: CryptoKey | null = null;

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? null;
}

async function getSigningKey(): Promise<CryptoKey | null> {
  const secret = getSessionSecret();
  if (!secret || typeof crypto === "undefined" || !crypto.subtle) {
    return null;
  }

  if (cachedKey && cachedSecret === secret) {
    return cachedKey;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  cachedSecret = secret;
  cachedKey = key;
  return key;
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = "";

  for (let i = 0; i < bytes.length; i += 1) {
    result += bytes[i].toString(16).padStart(2, "0");
  }

  return result;
}

function base64UrlEncode(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  const bytes = textEncoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string): string | null {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value, "base64url").toString("utf8");
    }

    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = normalized.length % 4;
    const padded = padLength ? normalized + "=".repeat(4 - padLength) : normalized;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return textDecoder.decode(bytes);
  } catch {
    return null;
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function signSession(identifier: string, expiresAt: number): Promise<string | null> {
  const key = await getSigningKey();
  if (!key) {
    return null;
  }

  const data = textEncoder.encode(`${identifier}:${expiresAt}`);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return toHex(signature);
}

async function encodeSession(identifier: string, expiresAt: number): Promise<string | null> {
  const signature = await signSession(identifier, expiresAt);
  if (!signature) {
    return null;
  }

  const payload = JSON.stringify({ identifier, expiresAt, signature });
  return base64UrlEncode(payload);
}

export async function verifySessionCookie(cookieValue: string | undefined): Promise<VerifiedSession | null> {
  if (!cookieValue) {
    return null;
  }

  const decoded = base64UrlDecode(cookieValue);
  if (!decoded) {
    return null;
  }

  try {
    const data = JSON.parse(decoded) as {
      identifier?: unknown;
      expiresAt?: unknown;
      signature?: unknown;
    };

    if (typeof data.identifier !== "string" || typeof data.expiresAt !== "number" || typeof data.signature !== "string") {
      return null;
    }

    if (data.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const expectedSignature = await signSession(data.identifier, data.expiresAt);
    if (!expectedSignature) {
      return null;
    }

    if (!constantTimeEqual(expectedSignature, data.signature)) {
      return null;
    }

    return { identifier: data.identifier, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

export async function createSessionValue(
  identifier: string,
  maxAgeSeconds: number,
): Promise<{ value: string; expiresAt: number } | null> {
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const value = await encodeSession(identifier, expiresAt);

  if (!value) {
    return null;
  }

  return { value, expiresAt };
}

export async function getAdminSession() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME);
  const verified = await verifySessionCookie(cookie?.value);

  if (!verified) {
    return null;
  }

  return verified;
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
