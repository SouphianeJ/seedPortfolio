"use client";

import type { SerializedProof } from "@/lib/serializers";

interface ProjectProofEmbedsProps {
  proofs: SerializedProof[];
}

const typeDisplayMap: Record<string, { label: string; icon: string }> = {
  image: { label: "Image", icon: "🖼️" },
  video: { label: "Vidéo", icon: "🎬" },
  "site url": { label: "Site web", icon: "🌐" },
  file: { label: "Document", icon: "📄" },
  texte: { label: "Texte", icon: "📝" },
};

const normalizeType = (type: SerializedProof["type"]) => type.trim().toLowerCase();

const getDisplayMeta = (type: SerializedProof["type"]) => {
  const normalized = normalizeType(type);
  return typeDisplayMap[normalized] ?? { label: type, icon: "📁" };
};

const getHostname = (link: string) => {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch (error) {
    void error;
    return null;
  }
};

const FramePreview = ({ proof }: { proof: SerializedProof }) => {
  const normalized = normalizeType(proof.type);
  const isImage = normalized === "image";
  const frameClassName = isImage
    ? "aspect-square sm:aspect-video"
    : "aspect-video";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className={`relative w-full ${frameClassName}`}>
        {isImage ? (
          <img
            src={proof.link}
            alt={proof.proofName}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <iframe
            src={proof.link}
            title={proof.proofName}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
      <div className="border-t border-slate-800 px-3 py-2">
        <div className="text-sm font-medium text-slate-100">{proof.proofName}</div>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          <span>{getDisplayMeta(proof.type).label}</span>
          <a
            href={proof.link}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-400 transition hover:text-sky-300"
          >
            Ouvrir
          </a>
        </div>
      </div>
    </div>
  );
};

const LinkPreview = ({ proof }: { proof: SerializedProof }) => {
  const meta = getDisplayMeta(proof.type);
  const hostname = getHostname(proof.link);

  return (
    <a
      href={proof.link}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 transition hover:border-sky-500 hover:text-sky-100"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <span aria-hidden>{meta.icon}</span>
        <span className="truncate">{proof.proofName}</span>
      </div>
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {meta.label}
      </div>
      <div className="text-xs text-slate-400">
        {hostname ?? proof.link}
      </div>
    </a>
  );
};

const TextPreview = ({ proof }: { proof: SerializedProof }) => {
  const meta = getDisplayMeta(proof.type);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <span aria-hidden>{meta.icon}</span>
        <span className="truncate">{proof.proofName}</span>
      </div>
      {proof.description && (
        <p className="mt-2 text-sm text-slate-300">{proof.description}</p>
      )}
    </div>
  );
};

const ProofPreviewCard = ({ proof }: { proof: SerializedProof }) => {
  const normalized = normalizeType(proof.type);

  if (normalized === "image" || normalized === "video") {
    return <FramePreview proof={proof} />;
  }

  if (normalized === "site url" || normalized === "file") {
    return <LinkPreview proof={proof} />;
  }

  return <TextPreview proof={proof} />;
};

const ProjectProofEmbeds = ({ proofs }: ProjectProofEmbedsProps) => {
  if (proofs.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {proofs.map((proof) => (
        <ProofPreviewCard key={proof._id} proof={proof} />
      ))}
    </div>
  );
};

export default ProjectProofEmbeds;
