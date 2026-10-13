"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import bush1 from '../assets/glacier/bush.png';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: 'home' },
    { href: '/work', icon: 'work' },
    { href: '/about', icon: 'face' },
    { href: '/contact', icon: 'mail' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 z-[999] w-auto" style={{ transform: 'translateX(-50%)' }}>
      <Image
        src={bush1}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1 -bottom-2 -translate-x-[44%] w-23 opacity-80 -z-20 contrast-110 drop-shadow-[0_8px_14px_rgb(var(--site-accent-rgb)/0.15)]"
      />
      <Image
        src={bush1}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-1 -bottom-2 translate-x-[44%] w-23 opacity-70 -z-20 scale-x-[-1] contrast-110 drop-shadow-[0_8px_14px_rgb(var(--site-accent-rgb)/0.15)]"
      />
      {/* Nav pill */}
      <nav className="relative z-10 bg-[var(--site-surface)] backdrop-blur-2xl rounded-full flex items-center justify-center p-1 shadow-[0_12px_32px_rgba(4,15,36,0.25),0_0_0_1px_rgba(28,79,138,0.1)] border border-[var(--site-border)] gap-[2px]">
        {links.map((l) => {
          const isActive = pathname === l.href || (pathname.startsWith(l.href) && l.href !== '/');
          return (
            <Link key={l.href} href={l.href}
              className={`px-[10px] py-[4px] rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                ? 'bg-[var(--site-accent-solid)] text-white shadow-md'
                : 'text-[var(--site-muted)] hover:bg-[var(--site-surface-strong)] hover:text-[var(--site-accent)]'
                }`}
            >
              <span className="material-symbols-outlined text-[8px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {l.icon}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
