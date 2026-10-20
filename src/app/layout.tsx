import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import "./globals.css";
import DraftLifecycle from "@/components/draft-lifecycle";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Cyber Campus · Cybersecurity Gaming & Research",
    template: "%s · Cyber Campus",
  },
  description:
    "A voluntary university student research study on social engineering and user privacy in Sri Lanka with interactive cybersecurity missions.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <DraftLifecycle />
          <a className="skip-link" href="#main">
            Skip to content
          </a>

          <SiteHeader />

          <main id="main">{children}</main>

          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
