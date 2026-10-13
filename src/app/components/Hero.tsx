"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { profile } from "../data/profile";
import SocialLinks from "./SocialLinks";
import ProofStats from "./ProofStats";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
  download?: string;
}

function MagneticButton({ children, className, href, target, rel, download }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      download={download}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ translateX: mouseX, translateY: mouseY }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {

  return (
    <section id="hero" className="w-full relative flex items-center justify-center px-6 md:px-12 pt-28 pb-10 md:pt-14 md:py-14 min-h-[70vh] md:min-h-0 scroll-mt-28">

      {/* Floating Stats Widget - Left Side (Desktop) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="hidden lg:block absolute left-1 -bottom-10 z-20"
      >
        <motion.div
          className="bg-white/5 backdrop-blur-xl scale-85 rounded-2xl border border-white/10 p-6 shadow-[0_12px_32px_rgb(var(--site-accent-rgb)/0.12)] hover:shadow-[0_16px_40px_rgb(var(--site-accent-rgb)/0.2)] transition-all duration-200"
        >
          <ProofStats />
        </motion.div>
      </motion.div>

      <div className="max-w-7xl w-full mx-auto flex flex-col items-center justify-center text-center relative z-10 min-h-[60vh] md:min-h-0">

        {/* Massive Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h2 className="text-5xl md:text-[4.8rem] font-extrabold font-headline tracking-tighter leading-[1.05] mb-5" style={{ color: 'var(--site-foreground)' }}>
            Hi. I&apos;m {profile.firstName}<span className="font-doto text-4xl sm:text-5xl md:text-7xl font-extrabold rubber-spin-dot inline-flex items-center justify-center w-[1em] h-[1em] leading-none align-middle text-[var(--site-accent)]">+</span><br />
            <span className="text-[var(--site-accent)] md:text-[2.9rem]">{profile.role}</span>
          </h2>

          <p className="text-md md:text-xl font-body leading-relaxed mb-6 max-w-2xl mx-auto font-medium" style={{ color: 'var(--site-muted-strong)' }}>
            {profile.tagline}
          </p>

          <SocialLinks className="md:hidden flex gap-6 justify-center mb-8" iconClassName="w-6 h-6" />

          <div className="relative flex flex-col sm:flex-row justify-center gap-6 items-center">
            {/* Primary CTA */}
            <MagneticButton
              href="/work"
              className="group relative bg-[var(--site-accent-solid)] backdrop-blur-md text-white px-8 py-4 md:px-10 md:py-4 rounded-full font-headline font-bold text-base md:text-lg shadow-[0_6px_0_var(--site-accent-hover)] hover:shadow-[0_10px_0_var(--site-accent-hover)] active:shadow-none transition-all duration-200 border border-[var(--site-accent-solid)]/45 overflow-hidden"
            >
              <span className="relative z-10">Explore Work</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </MagneticButton>
          </div>

          {/* Mobile Stats Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="md:hidden mt-8"
          >
            <div className="bg-[var(--site-card-bg)]/80 backdrop-blur-xl rounded-2xl border border-[var(--site-border)] p-4 shadow-[0_8px_24px_rgb(var(--site-accent-rgb)/0.1)]">
              <ProofStats mobile />
            </div>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
