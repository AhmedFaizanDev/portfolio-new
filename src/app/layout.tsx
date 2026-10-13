import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import MobileNav from "./components/MobileNav";
import SearchKeywordHighlighter from "./components/SearchKeywordHighlighter";
import PageLoader from "./components/PageLoader";
import ResumeDownloadFab from "./components/ResumeDownloadFab";
import RoutePixelBackground from "./components/RoutePixelBackground";
import ThemeProvider from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import PersonalEggButton from "./components/PersonalEggButton";
import TopBar from "./components/TopBar";
import TerminalOverlay from "./components/TerminalOverlay";
import NotificationBubble from "./components/NotificationBubble";
import { getProject, profile } from "./data/profile";
import { getBuild, getCalendar, getPushes, getRepoLive } from "./lib/github";

const doto = localFont({
  src: "./assets/fonts/Doto/Doto-VariableFont_ROND,wght.ttf",
  variable: "--font-doto",
  display: "swap",
});

const description =
  "Mohammed Faizan Ahmed builds backends, database engines and AI systems, and measures them: an incremental SQL view engine ≈3,600× faster than recompute, a multi-tenant SaaS, and a learned LLM router.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${profile.site}`),
  title: {
    default: `${profile.firstName} | ${profile.role}`,
    template: `${profile.firstName} | %s`,
  },
  description,
  authors: [{ name: profile.name, url: `https://${profile.site}` }],
  keywords: ["Mohammed Faizan Ahmed", "backend engineer", "systems engineer", "AI engineer", "incremental view maintenance", "Django", "PostgreSQL", "Hyderabad"],
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: `${profile.name} · ${profile.role}`,
    description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#061329",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [pushes, ivm, calendar] = await Promise.all([
    getPushes(),
    getRepoLive(getProject("ivm")!.repoUrl!),
    getCalendar(),
  ]);
  const status = {
    pushes,
    ci: ivm?.ci ? { repo: "ivm", passing: ivm.ci.passing, at: ivm.ci.at, url: ivm.ci.url } : null,
    activity: calendar ? { last7: calendar.last7, last30: calendar.last30, weekly: calendar.weekly } : null,
    build: getBuild(),
  };
  const fetchedAt = new Date().toISOString();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`(function() {
            try {
              var t = localStorage.getItem('portfolio-theme');
              if (t === 'light' || t === 'dark') {
                document.documentElement.dataset.theme = t;
              } else {
                var isMobile = window.innerWidth < 768;
                document.documentElement.dataset.theme = isMobile ? 'dark' : 'light';
              }
            } catch(e) {
              var isMobile = window.innerWidth < 768;
              document.documentElement.dataset.theme = isMobile ? 'dark' : 'light';
            }
          })();`}
        </Script>
      </head>
      <body className={`${doto.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <RoutePixelBackground />
          <PageLoader />
          <Suspense fallback={null}>
            <SearchKeywordHighlighter />
          </Suspense>
          <ResumeDownloadFab />
          <ThemeToggle />
          <PersonalEggButton />
          <TopBar status={status} />
          <TerminalOverlay status={{ ...status, fetchedAt }} />
          <NotificationBubble />
          <div className="flex-1 w-full relative z-10 flex flex-col">
            {children}
          </div>
          <MobileNav />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
