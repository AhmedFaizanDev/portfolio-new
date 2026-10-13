import type { Metadata } from "next";
import Contact from "../components/Contact";

export const metadata: Metadata = {
    title: "Contact",
    description: "Contact Mohammed Faizan Ahmed for backend, infrastructure and AI-systems roles. Email, phone, resumes and a working terminal.",
    alternates: { canonical: "/contact" },
    openGraph: { url: "/contact", title: "Contact · Mohammed Faizan Ahmed", description: "Contact Mohammed Faizan Ahmed for backend, infrastructure and AI-systems roles. Email, phone, resumes and a working terminal." },
};

export default function ContactPage() {
    return (
        <main id="contact" className="relative isolate flex-1 min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_22%,rgb(var(--site-accent-rgb)/0.18),transparent_38%),radial-gradient(circle_at_86%_74%,rgb(var(--site-accent-solid-rgb)/0.2),transparent_40%)]" />
            <div className="pointer-events-none absolute top-4 -left-12 -z-10 h-64 w-64 rounded-full bg-[var(--site-accent)]/16 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 right-0 -z-10 h-72 w-72 rounded-full bg-[var(--site-accent-deep)]/18 blur-3xl" />
            <Contact />
        </main>
    );
}
