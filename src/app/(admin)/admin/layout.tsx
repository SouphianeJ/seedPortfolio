import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin/projects", label: "Projets" },
  { href: "/admin/proofs", label: "Preuves" },
  { href: "/admin/expertises", label: "Expertises" },
  { href: "/admin/jobs", label: "Postes" },
  { href: "/admin/tools", label: "Outils" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-10 sm:gap-6 sm:px-6">
        <header className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 shadow-lg sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-slate-100">Seed Portfolio Admin</h1>
              <p className="text-sm text-slate-300">
                Gérez les projets, preuves, expertises, postes et outils pour alimenter votre base MongoDB.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-200">
              <span className="hidden sm:inline">Connecté en tant que</span>
              <span className="font-medium text-sky-300">{session.identifier}</span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-rose-500 hover:text-rose-300"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
          <nav className="mt-6 flex flex-wrap gap-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-700 px-4 py-1.5 font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 shadow-lg sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
