"use client";

import useSWR, { mutate } from "swr";
import { fetcher, jsonFetch } from "@/lib/fetcher";
import type {
  CreateExpertisePayload,
  ExpertiseDoc,
  UpdateExpertisePayload,
  WithStringId,
} from "@/lib/types";

const COLLECTION_KEY = "/api/expertises";

export const useExpertises = () => {
  const { data, error, isLoading } = useSWR<WithStringId<ExpertiseDoc>[]>(
    COLLECTION_KEY,
    fetcher,
  );

  return {
    expertises: data ?? [],
    error,
    isLoading,
  };
};

export const useExpertise = (id: string | null) => {
  const shouldFetch = Boolean(id);
  return useSWR<WithStringId<ExpertiseDoc>>(
    shouldFetch ? `${COLLECTION_KEY}/${id}` : null,
    fetcher,
  );
};

export const createExpertise = async (payload: CreateExpertisePayload) => {
  const document = await jsonFetch<WithStringId<ExpertiseDoc>>(COLLECTION_KEY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await mutate(COLLECTION_KEY);
  return document;
};

export const updateExpertise = async (
  id: string,
  payload: UpdateExpertisePayload,
) => {
  const document = await jsonFetch<WithStringId<ExpertiseDoc>>(
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
