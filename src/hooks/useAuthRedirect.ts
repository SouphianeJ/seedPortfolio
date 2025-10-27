"use client";

import { useEffect } from "react";
import { AuthError } from "@/lib/fetcher";

interface UseAuthRedirectOptions {
  redirect?: boolean;
}

export const buildLoginUrl = (): string => {
  if (typeof window === "undefined") {
    return "/login";
  }

  const { pathname, search, origin } = window.location;
  const loginUrl = new URL("/login", origin);
  const from = `${pathname}${search}`;

  if (pathname.startsWith("/login")) {
    return loginUrl.toString();
  }

  if (from && from !== "/") {
    loginUrl.searchParams.set("from", from);
  }

  return loginUrl.toString();
};

export const useAuthRedirect = (
  error: unknown,
  options: UseAuthRedirectOptions = {},
): AuthError | null => {
  const { redirect = true } = options;
  const authError = error instanceof AuthError ? error : null;

  useEffect(() => {
    if (!redirect || !authError || typeof window === "undefined") {
      return;
    }

    window.location.replace(buildLoginUrl());
  }, [authError, redirect]);

  return authError;
};

export default useAuthRedirect;
