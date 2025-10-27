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
        if (!response.ok) {
          throw new Error(response.statusText || "Impossible de charger l'aperçu");
        }
        const payload = (await response.json()) as LinkPreviewData;
        if (!cancelled) {
          setData(payload);
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
