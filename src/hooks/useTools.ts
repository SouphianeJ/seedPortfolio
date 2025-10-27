"use client";

import useSWR, { mutate } from "swr";
import { fetcher, jsonFetch } from "@/lib/fetcher";
import { useAuthRedirect } from "./useAuthRedirect";
import type { CreateToolPayload, ToolDoc, UpdateToolPayload, WithStringId } from "@/lib/types";

const COLLECTION_KEY = "/api/tools";

export const useTools = () => {
  const { data, error, isLoading } = useSWR<WithStringId<ToolDoc>[]>(
    COLLECTION_KEY,
    fetcher,
  );
  const authError = useAuthRedirect(error);

  return {
    tools: data ?? [],
    error,
    isLoading,
    authError,
  };
};

export const useTool = (id: string | null) => {
  const shouldFetch = Boolean(id);
  const response = useSWR<WithStringId<ToolDoc>>(
    shouldFetch ? `${COLLECTION_KEY}/${id}` : null,
    fetcher,
  );
  const authError = useAuthRedirect(response.error);
  return { ...response, authError };
};

export const createTool = async (payload: CreateToolPayload) => {
  const document = await jsonFetch<WithStringId<ToolDoc>>(COLLECTION_KEY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await mutate(COLLECTION_KEY);
  return document;
};

export const updateTool = async (id: string, payload: UpdateToolPayload) => {
  const document = await jsonFetch<WithStringId<ToolDoc>>(
    `${COLLECTION_KEY}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  await Promise.all([
    mutate(COLLECTION_KEY),
    mutate(`${COLLECTION_KEY}/${id}`),
  ]);
  return document;
};
