import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Seed Portfolio Admin",
  description: "Interface d'administration pour projets, expertises et postes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const nonce = headerList.get("x-nonce") ?? undefined;

  return (
    <html lang="fr">
      <head>
        <style nonce={nonce}>{":root { color-scheme: dark; }"}</style>
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
