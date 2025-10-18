"use client";

import useSWR, { mutate } from "swr";
import { fetcher, jsonFetch } from "@/lib/fetcher";
import type {
  CreateJobPositionPayload,
  JobPositionDoc,
  UpdateJobPositionPayload,
  WithStringId,
} from "@/lib/types";

const COLLECTION_KEY = "/api/jobpositions";

export const useJobs = () => {
  const { data, error, isLoading } = useSWR<WithStringId<JobPositionDoc>[]>(
    COLLECTION_KEY,
    fetcher,
  );

  return {
    jobs: data ?? [],
    error,
    isLoading,
  };
};

export const useJob = (id: string | null) => {
  const shouldFetch = Boolean(id);
  return useSWR<WithStringId<JobPositionDoc>>(
    shouldFetch ? `${COLLECTION_KEY}/${id}` : null,
    fetcher,
  );
};

export const createJob = async (payload: CreateJobPositionPayload) => {
  const document = await jsonFetch<WithStringId<JobPositionDoc>>(COLLECTION_KEY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await mutate(COLLECTION_KEY);
  return document;
};

export const updateJob = async (id: string, payload: UpdateJobPositionPayload) => {
  const document = await jsonFetch<WithStringId<JobPositionDoc>>(
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
