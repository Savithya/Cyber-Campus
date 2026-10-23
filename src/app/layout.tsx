import type { Metadata, Viewport } from "next";
import "./globals.css";
import DraftLifecycle from "@/components/draft-lifecycle";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { SessionProvider } from "@/lib/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <DraftLifecycle />
            <a className="skip-link" href="#main">
              Skip to content
            </a>

            <SiteHeader />

            <main id="main">{children}</main>

            <SiteFooter />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
