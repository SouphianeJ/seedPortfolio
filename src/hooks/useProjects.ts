"use client";

import useSWR, { mutate } from "swr";
import { fetcher, jsonFetch } from "@/lib/fetcher";
import { useAuthRedirect } from "./useAuthRedirect";
import type { CreateProjectPayload, UpdateProjectPayload } from "@/lib/types";
import type { SerializedProject } from "@/lib/serializers";

const COLLECTION_KEY = "/api/projects";

export const useProjects = () => {
  const { data, error, isLoading } = useSWR<SerializedProject[]>(
    COLLECTION_KEY,
    fetcher,
  );
  const authError = useAuthRedirect(error);

  return {
    projects: data ?? [],
    error,
    isLoading,
    authError,
  };
};

export const useProject = (id: string | null) => {
  const shouldFetch = Boolean(id);
  const response = useSWR<SerializedProject>(
    shouldFetch ? `${COLLECTION_KEY}/${id}` : null,
    fetcher,
  );
  const authError = useAuthRedirect(response.error);
  return { ...response, authError };
};

export const createProject = async (payload: CreateProjectPayload) => {
  const document = await jsonFetch<SerializedProject>(COLLECTION_KEY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await mutate(COLLECTION_KEY);
  return document;
};

export const updateProject = async (
  id: string,
  payload: UpdateProjectPayload,
) => {
  const document = await jsonFetch<SerializedProject>(
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
