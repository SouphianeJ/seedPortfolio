import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_SESSION_MAX_AGE,
  REMEMBER_SESSION_MAX_AGE,
  SESSION_COOKIE_NAME,
  createSessionValue,
  verifySessionCookie,
} from "@/lib/auth/session";

function buildErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function ensureCredentialsConfigured() {
  const identifier = process.env.ADMIN_IDENTIFIER;
  const password = process.env.ADMIN_PASSWORD;

  if (!identifier || !password) {
    return null;
  }

  return { identifier, password };
}

export async function POST(request: NextRequest) {
  const segments = request.nextUrl.pathname.replace(/\/+$/u, "").split("/").filter(Boolean);
  const lastSegment = segments.at(-1);
  const action = lastSegment && lastSegment !== "auth" ? lastSegment : "login";

  if (action === "login") {
    const credentials = ensureCredentialsConfigured();
    if (!credentials) {
      return buildErrorResponse("Configuration d'authentification manquante.", 500);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return buildErrorResponse("Requête invalide.");
    }

    if (typeof body !== "object" || body === null) {
      return buildErrorResponse("Requête invalide.");
    }

    const { identifier, password, remember } = body as {
      identifier?: unknown;
      password?: unknown;
      remember?: unknown;
    };

    if (typeof identifier !== "string" || typeof password !== "string") {
      return buildErrorResponse("Identifiants requis.");
    }

    if (identifier !== credentials.identifier || password !== credentials.password) {
      return buildErrorResponse("Identifiant ou mot de passe incorrect.", 401);
    }

    const rememberMe = remember === true || remember === "true" || remember === "on" || remember === 1;
    const maxAge = rememberMe ? REMEMBER_SESSION_MAX_AGE : DEFAULT_SESSION_MAX_AGE;
    const sessionValue = await createSessionValue(credentials.identifier, maxAge);

    if (!sessionValue) {
      return buildErrorResponse("Configuration d'authentification manquante.", 500);
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionValue.value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    });

    return response;
  }

  if (action === "logout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;
  }

  if (action === "session") {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionCookie(cookie);

    if (!session) {
      return buildErrorResponse("Aucune session active.", 401);
    }

    return NextResponse.json({ identifier: session.identifier, expiresAt: session.expiresAt });
  }

  return buildErrorResponse("Action non prise en charge.", 404);
}
