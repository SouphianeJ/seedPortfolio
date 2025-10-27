export class AuthError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message || (status === 401 ? "Unauthorized" : "Forbidden"));
    this.name = "AuthError";
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type HeaderSource = HeadersInit | undefined;

const isHeadersInstance = (headers: HeaderSource): headers is Headers => {
  return typeof Headers !== "undefined" && headers instanceof Headers;
};

const headersToRecord = (headers: HeaderSource): Record<string, string> => {
  if (!headers) {
    return {};
  }

  if (isHeadersInstance(headers)) {
    return Array.from(headers.entries()).reduce<Record<string, string>>(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {},
    );
  }

  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, value]) => {
      if (value != null) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
  }

  const entries = Object.entries(headers as Record<string, unknown>);
  return entries.reduce<Record<string, string>>((acc, [key, value]) => {
    if (value != null) {
      acc[key] = String(value);
    }
    return acc;
  }, {});
};

const mergeHeaders = (
  ...sources: HeaderSource[]
): Record<string, string> => {
  return sources.reduce<Record<string, string>>((acc, source) => {
    const entries = headersToRecord(source);
    return { ...acc, ...entries };
  }, {});
};

declare global {
  interface Window {
    __SEED_AUTH_HEADERS__?: Record<string, string>;
  }
}

const collectAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  const headers: Record<string, string> = { ...(window.__SEED_AUTH_HEADERS__ ?? {}) };

  if (typeof document === "undefined") {
    return headers;
  }

  const metaWithAttr = document.querySelectorAll<HTMLMetaElement>("meta[data-auth-header]");
  metaWithAttr.forEach((meta) => {
    const headerName = meta.getAttribute("data-auth-header");
    if (!headerName) {
      return;
    }
    const content = meta.getAttribute("content");
    if (content) {
      headers[headerName] = content;
    }
  });

  const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  if (csrfMeta?.content) {
    headers["X-CSRF-Token"] ??= csrfMeta.content;
  }

  const authorizationMeta = document.querySelector<HTMLMetaElement>('meta[name="authorization"]');
  if (authorizationMeta?.content) {
    headers.Authorization ??= authorizationMeta.content;
  }

  return headers;
};

export const withAuth = (init: RequestInit = {}): RequestInit => {
  const headers = mergeHeaders(collectAuthHeaders(), init.headers);

  return {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  };
};

const handleError = async (response: Response): Promise<never> => {
  const message = await safeParseError(response);
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(message, response.status);
  }
  throw new Error(message);
};

export const fetcher = async (url: string) => {
  const response = await fetch(url, withAuth());
  if (!response.ok) {
    await handleError(response);
  }
  return response.json();
};

export const jsonFetch = async <T>(
  url: string,
  init: RequestInit = {},
): Promise<T> => {
  const jsonInit: RequestInit = {
    ...init,
    headers: mergeHeaders({ "Content-Type": "application/json" }, init.headers),
  };
  const response = await fetch(url, withAuth(jsonInit));

  if (!response.ok) {
    await handleError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const safeParseError = async (response: Response): Promise<string> => {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  if (!isJson) {
    return response.statusText;
  }

  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
};
