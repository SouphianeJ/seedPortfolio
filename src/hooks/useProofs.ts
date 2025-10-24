"use client";

import useSWR, { mutate } from "swr";
import { fetcher, jsonFetch } from "@/lib/fetcher";
import type { CreateProofPayload, UpdateProofPayload } from "@/lib/types";
import type { SerializedProof } from "@/lib/serializers";

const COLLECTION_KEY = "/api/proofs";

export const useProofs = () => {
  const { data, error, isLoading } = useSWR<SerializedProof[]>(
    COLLECTION_KEY,
    fetcher,
  );

  return {
    proofs: data ?? [],
    error,
    isLoading,
  };
};

export const useProof = (id: string | null) => {
  const shouldFetch = Boolean(id);
  return useSWR<SerializedProof>(
    shouldFetch ? `${COLLECTION_KEY}/${id}` : null,
    fetcher,
  );
};

export const createProof = async (payload: CreateProofPayload) => {
  const document = await jsonFetch<SerializedProof>(COLLECTION_KEY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await mutate(COLLECTION_KEY);
  return document;
};

export const updateProof = async (
  id: string,
  payload: UpdateProofPayload,
) => {
  const document = await jsonFetch<SerializedProof>(`${COLLECTION_KEY}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  await Promise.all([
    mutate(COLLECTION_KEY),
    mutate(`${COLLECTION_KEY}/${id}`),
  ]);
  return document;
};
