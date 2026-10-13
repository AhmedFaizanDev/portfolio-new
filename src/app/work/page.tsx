import type { Metadata } from "next";
import ProjectGrid from "../components/ProjectGrid";

export const metadata: Metadata = {
    title: "Work",
    description: "Engines, backends and AI pipelines by Mohammed Faizan Ahmed: an incremental SQL view engine, a multi-tenant SaaS, a learned LLM router and more, each with measured results.",
    alternates: { canonical: "/work" },
    openGraph: { url: "/work", title: "Work · Mohammed Faizan Ahmed", description: "Engines, backends and AI pipelines by Mohammed Faizan Ahmed: an incremental SQL view engine, a multi-tenant SaaS, a learned LLM router and more, each with measured results." },
};

export default function WorkPage() {
    return (
        <main className="flex-1 flex flex-col pt-32 pb-40 min-h-screen">
            <ProjectGrid />
        </main>
    );
}
