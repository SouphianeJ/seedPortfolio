"use client";

import useSWR, { mutate } from "swr";
import { fetcher, jsonFetch } from "@/lib/fetcher";
import type {
  CreateProjectPayload,
  ProjectDoc,
  UpdateProjectPayload,
  WithStringId,
} from "@/lib/types";

const COLLECTION_KEY = "/api/projects";

export const useProjects = () => {
  const { data, error, isLoading } = useSWR<WithStringId<ProjectDoc>[]>(
    COLLECTION_KEY,
    fetcher,
  );

  return {
    projects: data ?? [],
    error,
    isLoading,
  };
};

export const useProject = (id: string | null) => {
  const shouldFetch = Boolean(id);
  return useSWR<WithStringId<ProjectDoc>>(
    shouldFetch ? `${COLLECTION_KEY}/${id}` : null,
    fetcher,
  );
};

export const createProject = async (payload: CreateProjectPayload) => {
  const document = await jsonFetch<WithStringId<ProjectDoc>>(COLLECTION_KEY, {
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
  const document = await jsonFetch<WithStringId<ProjectDoc>>(
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
