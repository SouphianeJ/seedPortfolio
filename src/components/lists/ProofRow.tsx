"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ExpandableText from "@/components/ui/ExpandableText";
import type { SerializedProof } from "@/lib/serializers";

interface ProofRowProps {
  proof: SerializedProof;
}

const typeLabelMap: Record<SerializedProof["type"], string> = {
  image: "Image",
  video: "Vidéo",
  texte: "Texte",
};

const typeColorMap: Record<SerializedProof["type"], "sky" | "emerald" | "violet"> = {
  image: "sky",
  video: "emerald",
  texte: "violet",
};

export const ProofRow = ({ proof }: ProofRowProps) => (
  <tr className="transition hover:bg-slate-800/40">
    <td className="px-2 py-3 sm:px-4" data-label="Nom">
      <div className="font-medium text-slate-100">{proof.proofName}</div>
      {proof.description && (
        <ExpandableText
          text={proof.description}
          className="mt-1 text-xs text-slate-400"
        />
      )}
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Type">
      <Badge color={typeColorMap[proof.type]}>{typeLabelMap[proof.type]}</Badge>
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Lien">
      <a
        href={proof.link}
        target="_blank"
        rel="noreferrer noopener"
        className="break-all text-xs text-sky-300 underline hover:text-sky-200"
      >
        {proof.link}
      </a>
    </td>
    <td
      className="px-2 py-3 text-right sm:px-4"
      data-label="Actions"
      data-align="end"
    >
      <Link
        href={`/admin/proofs/${proof._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </td>
  </tr>
);

export default ProofRow;
