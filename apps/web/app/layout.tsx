import type { Metadata } from "next";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Shell } from "@/components/layout/Shell";
import { fontSans, fontSerif } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "CIAO",
  description: "Calm control surface for an agentic engineering organization.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="font-sans noise-bg">
        <SessionProvider>
          <Shell>{children}</Shell>
        </SessionProvider>
      </body>
    </html>
  );
}
