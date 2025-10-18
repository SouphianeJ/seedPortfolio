export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(message);
  }
  return response.json();
};

export const jsonFetch = async <T>(
  url: string,
  init: RequestInit = {},
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

const safeParseError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
};
