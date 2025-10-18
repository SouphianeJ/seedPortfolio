"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const triggerSeed = async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/seed", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Seeding échoué");
      }
      setStatus("success");
      setMessage("Base de données initialisée avec succès.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de lancer l'initialisation."
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Initialisation des données"
        description="Lancez le script de seeding pour peupler les collections MongoDB."
      />
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-200">
        <button
          type="button"
          onClick={triggerSeed}
          disabled={status === "loading"}
          className="rounded-md bg-sky-500 px-4 py-2 font-medium text-white transition hover:bg-sky-400 disabled:cursor-wait disabled:bg-sky-700/60"
        >
          {status === "loading" ? "Initialisation..." : "Lancer le seeding"}
        </button>
        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "error" ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
