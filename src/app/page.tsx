import type { Metadata } from "next";
import Hero from "./components/Hero";
import HomeBackground from "./components/HomeBackground";
import SocialLinks from "./components/SocialLinks";
import Ago from "./components/Ago";
import { profile } from "./data/profile";
import { getBuild } from "./lib/github";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function Home() {
  const build = getBuild();
  return (
    <main className="relative flex-1 flex flex-col justify-center overflow-hidden pb-28 md:pb-8 min-h-screen">
      <HomeBackground quality="lite" scene />
      <div className="relative z-10 flex-1 flex items-center">
        <Hero />
      </div>
      <footer className="fixed bottom-6 inset-x-6 lg:inset-x-8 z-20 pointer-events-none">
        <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-5 text-center md:text-left">

          <div className="pointer-events-auto hidden md:flex bg-[var(--site-surface)]/20 backdrop-blur-xl border border-[var(--site-border)] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-2xl p-4 md:px-6 flex-col items-center md:items-start gap-1 transition-all duration-300 hover:bg-[var(--site-surface)]/40 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <p className="font-bold text-xs md:text-sm tracking-wide" style={{ color: 'var(--site-foreground)' }}>{profile.name}</p>
            <p className="text-[10px] uppercase font-semibold text-[var(--site-accent)] tracking-wider">© {new Date().getFullYear()} · {profile.location}</p>
            <p className="font-mono text-[10px] text-[var(--site-muted)]">
              <span className="text-[var(--site-live)]">●</span> {build.sha ? <>deployed {build.sha}</> : <>built</>} · <Ago iso={build.builtAt} />
            </p>
          </div>

          <div className="pointer-events-auto hidden md:flex bg-[var(--site-surface)]/20 backdrop-blur-xl border border-[var(--site-border)] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-2xl p-3 px-5 flex-col gap-2 items-center md:items-end transition-all duration-300 hover:bg-[var(--site-surface)]/40 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <p className="font-bold text-sm tracking-wide" style={{ color: 'var(--site-foreground)' }}>My Socials</p>
            <SocialLinks className="flex gap-4 md:gap-5 justify-center md:justify-end" />
          </div>
        </div>
      </footer>
    </main>
  );
}
