"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import Badge from "@/components/ui/Badge";
import ExpandableText from "@/components/ui/ExpandableText";
import YearPill from "@/components/ui/YearPill";
import { useLinkPreview } from "@/hooks/useLinkPreview";
import { proofTypeBadgeColors, proofTypeLabels } from "@/lib/proofMeta";
import type { SerializedProject, SerializedProof } from "@/lib/serializers";

type ProjectProofPreview = Pick<
  SerializedProof,
  "_id" | "proofName" | "description" | "link" | "type"
>;

interface ProjectRowProps {
  project: SerializedProject;
  roleNames?: string[];
  expertiseNames?: string[];
  toolNames?: string[];
  proofs?: ProjectProofPreview[];
}

const baseCardClass =
  "rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700 hover:bg-slate-900/80";

const Section = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={["space-y-2", className].filter(Boolean).join(" ") || undefined}
  >
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
      {title}
    </p>
    <div className="mt-2 text-sm text-slate-200">{children}</div>
  </div>
);

const EmptyValue = () => (
  <span className="text-xs text-slate-400">Non renseigné</span>
);

const BadgeList = ({
  items,
  color,
}: {
  items: string[];
  color: "sky" | "emerald" | "violet" | "slate" | "gold" | "pearl";
}) => {
  if (items.length === 0) {
    return <EmptyValue />;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} color={color}>
          {item}
        </Badge>
      ))}
    </div>
  );
};

const FireFactsList = ({ facts }: { facts: string[] }) => {
  if (facts.length === 0) {
    return <EmptyValue />;
  }
  return (
    <ul className="space-y-1 text-xs text-slate-200">
      {facts.map((fact, index) => (
        <li key={`${fact}-${index}`} className="flex items-start gap-2">
          <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
          <span>{fact}</span>
        </li>
      ))}
    </ul>
  );
};

const getHostname = (value: string): string | null => {
  try {
    const url = new URL(value);
    return url.hostname;
  } catch {
    return null;
  }
};

const getYouTubeVideoId = (value: string): string | null => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./u, "");
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] ?? null;
      }
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] ?? null;
      }
    }
    if (hostname === "youtu.be") {
      return url.pathname.slice(1) || null;
    }
    return null;
  } catch {
    return null;
  }
};

const SiteUrlPreview = ({ proof }: { proof: ProjectProofPreview }) => {
  const { data, loading, error } = useLinkPreview(proof.link);
  const host = getHostname(proof.link);
  const title = data?.title ?? proof.proofName ?? host ?? proof.link;
  const description = data?.description ?? proof.description ?? null;
  const image = data?.image ?? null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative h-32 w-full overflow-hidden rounded-md border border-slate-800 bg-slate-950 sm:h-28 sm:w-44">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            {"Chargement de l\u2019aperçu..."}
          </div>
        ) : image ? (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 176px, (min-width: 640px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            Aucun visuel trouvé
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-slate-300">
        <span className="font-medium text-slate-100">{title}</span>
        {description ? (
          <ExpandableText
            text={description}
            previewSentenceCount={2}
            className="text-xs text-slate-400"
          />
        ) : null}
        {host ? (
          <span className="text-xs text-slate-500">{host}</span>
        ) : null}
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </div>
    </div>
  );
};

const ProofPreviewCard = ({ proof }: { proof: ProjectProofPreview }) => {
  const badgeColor = proofTypeBadgeColors[proof.type];
  const label = proofTypeLabels[proof.type];

  let content: ReactNode = null;

  if (proof.type === "image") {
    content = (
      <div className="relative overflow-hidden rounded-md border border-slate-800 bg-slate-950">
        <Image
          src={proof.link}
          alt={proof.proofName}
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  } else if (proof.type === "video") {
    const youtubeId = getYouTubeVideoId(proof.link);
    content = youtubeId ? (
      <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-950">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&controls=0&modestbranding=1`}
          title={proof.proofName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="aspect-video h-full w-full"
        />
      </div>
    ) : (
      <p className="text-xs text-slate-400">
        Aperçu vidéo indisponible. Ouvrez le lien pour visionner la ressource.
      </p>
    );
  } else if (proof.type === "Site URL") {
    content = <SiteUrlPreview proof={proof} />;
  } else if (proof.type === "texte") {
    content = proof.description ? (
      <ExpandableText
        text={proof.description}
        previewSentenceCount={4}
        className="text-xs text-slate-400"
      />
    ) : (
      <p className="text-xs text-slate-400">
        Consultez le lien associé pour afficher le contenu textuel.
      </p>
    );
  } else {
    content = (
      <p className="text-xs text-slate-400">
        Téléchargez ou ouvrez le fichier associé pour consulter la ressource.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={badgeColor}>{label}</Badge>
        <span className="text-sm font-semibold text-slate-100">
          {proof.proofName}
        </span>
      </div>
      {proof.description && proof.type !== "texte" && proof.type !== "Site URL" ? (
        <ExpandableText
          text={proof.description}
          previewSentenceCount={3}
          className="text-xs text-slate-400"
        />
      ) : null}
      {content}
      <div className="flex justify-end">
        <a
          href={proof.link}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs font-medium text-sky-400 transition hover:text-sky-300"
        >
          Ouvrir le lien
        </a>
      </div>
    </div>
  );
};

const ProofSummaryList = ({ proofs }: { proofs: ProjectProofPreview[] }) => {
  if (proofs.length === 0) {
    return <EmptyValue />;
  }

  return (
    <div className="flex flex-col gap-4">
      {proofs.map((proof) => (
        <ProofPreviewCard key={proof._id} proof={proof} />
      ))}
    </div>
  );
};

const ProofCompactList = ({ proofs }: { proofs: ProjectProofPreview[] }) => {
  if (proofs.length === 0) {
    return <EmptyValue />;
  }

  return (
    <div className="flex flex-col gap-2">
      {proofs.map((proof) => (
        <div key={proof._id} className="flex flex-wrap items-center gap-2">
          <Badge color={proofTypeBadgeColors[proof.type]}>
            {proofTypeLabels[proof.type]}
          </Badge>
          <a
            href={proof.link}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs text-sky-300 underline hover:text-sky-200"
          >
            {proof.proofName}
          </a>
        </div>
      ))}
    </div>
  );
};

const MobileRow = ({
  project,
  roleNames = [],
  expertiseNames = [],
  toolNames = [],
  proofs = [],
}: ProjectRowProps) => (
  <tr className="transition hover:bg-slate-800/40 md:hidden">
    <td className="px-2 py-3 sm:px-4" data-label="Nom">
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-medium text-slate-100">{project.projectName}</div>
        {project.isKeyProjet && <Badge color="gold">Projet clé</Badge>}
      </div>
      {project.shortDescription && (
        <ExpandableText
          text={project.shortDescription}
          className="mt-1 text-xs text-slate-400"
        />
      )}
    </td>
    <td className="px-2 py-3 text-slate-200 sm:px-4" data-label="Année">
      {project.year ? <YearPill value={project.year} /> : <EmptyValue />}
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Rôles">
      <BadgeList items={roleNames} color="sky" />
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Expertises">
      <BadgeList items={expertiseNames} color="violet" />
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Outils">
      <BadgeList items={toolNames} color="pearl" />
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Top Facts & Figures">
      <FireFactsList facts={project.fireFacts} />
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Preuves">
      <ProofSummaryList proofs={proofs} />
    </td>
    <td className="px-2 py-3 text-right sm:px-4" data-label="Actions" data-align="end">
      <Link
        href={`/admin/projects/${project._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </td>
  </tr>
);

const DesktopRow = ({
  project,
  roleNames = [],
  expertiseNames = [],
  toolNames = [],
  proofs = [],
}: ProjectRowProps) => (
  <tr className="hidden transition hover:bg-slate-800/40 md:table-row">
    <td className="p-0" colSpan={8}>
      <div className={baseCardClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-100">
                {project.projectName}
              </h3>
              {project.isKeyProjet && <Badge color="gold">Projet clé</Badge>}
            </div>
            {project.shortDescription && (
              <ExpandableText
                text={project.shortDescription}
                previewSentenceCount={3}
                className="text-sm text-slate-300"
              />
            )}
          </div>
          <Link
            href={`/admin/projects/${project._id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-slate-600 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
          >
            Éditer le projet
          </Link>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Section title="Année">
              {project.year ? (
                <YearPill value={project.year} />
              ) : (
                <EmptyValue />
              )}
            </Section>
            <Section title="Rôles">
              <BadgeList items={roleNames} color="sky" />
            </Section>
            <Section title="Expertises">
              <BadgeList items={expertiseNames} color="violet" />
            </Section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Section title="Outils">
              <BadgeList items={toolNames} color="pearl" />
            </Section>
            <Section title="Top Facts & Figures">
              <FireFactsList facts={project.fireFacts} />
            </Section>
            <Section title="Preuves liées (aperçu rapide)">
              <ProofCompactList proofs={proofs} />
            </Section>
          </div>

          <Section title="Preuves détaillées" className="space-y-4">
            <ProofSummaryList proofs={proofs} />
          </Section>
        </div>
      </div>
    </td>
  </tr>
);

export const ProjectRow = (props: ProjectRowProps) => (
  <>
    <MobileRow {...props} />
    <DesktopRow {...props} />
  </>
);

export default ProjectRow;
