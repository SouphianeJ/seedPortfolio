import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin/projects", label: "Projets" },
  { href: "/admin/expertises", label: "Expertises" },
  { href: "/admin/jobs", label: "Postes" },
  { href: "/admin/tools", label: "Outils" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-slate-100">Seed Portfolio Admin</h1>
            <p className="text-sm text-slate-300">
              Gérez les projets, expertises, postes et outils pour alimenter votre base MongoDB.
            </p>
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
        <main className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
