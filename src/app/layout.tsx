import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seed Portfolio Admin",
  description: "Interface d'administration pour projets, expertises et postes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
