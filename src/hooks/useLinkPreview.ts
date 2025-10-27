"use client";

import { useEffect, useState } from "react";
import { withAuth } from "@/lib/fetcher";

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

interface LinkPreviewResult {
  data: LinkPreviewData | null;
  loading: boolean;
  error: string | null;
}

export const useLinkPreview = (url: string | null | undefined): LinkPreviewResult => {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/unfurl?url=${encodeURIComponent(url)}`,
          withAuth({ signal: controller.signal }),
        );
        let payload: unknown = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          const message =
            (payload &&
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof (payload as { error?: unknown }).error === "string"
              ? (payload as { error: string }).error
              : response.statusText) || "Impossible de charger l'aperçu";
          throw new Error(message);
        }

        const dataPayload = payload as LinkPreviewData | null;
        if (!dataPayload) {
          throw new Error("Impossible de charger l'aperçu");
        }

        if (!cancelled) {
          setData(dataPayload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de récupérer l'aperçu du lien.",
          );
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
};
