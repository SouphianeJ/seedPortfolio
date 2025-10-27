import type { ProofType } from "@/lib/types";

export const proofTypeLabels: Record<ProofType, string> = {
  image: "Image",
  video: "Vidéo",
  texte: "Texte",
  file: "Fichier",
  "Site URL": "Site URL",
};

export const proofTypeBadgeColors: Record<
  ProofType,
  "sky" | "emerald" | "violet" | "slate" | "gold" | "pearl"
> = {
  image: "sky",
  video: "emerald",
  texte: "violet",
  file: "slate",
  "Site URL": "gold",
};
