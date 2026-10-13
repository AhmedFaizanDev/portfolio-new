import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject, projects } from '../../data/profile';
import ProjectDetail from './ProjectDetail';
import { getRepoLive } from '../../lib/github';

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
    return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const project = getProject((await params).id);
    if (!project) return {};
    const url = `/project/${project.id}`;
    const description = `${project.short} ${project.metrics.map((m) => `${m.label}: ${m.value}`).join(", ")}.`;
    return {
        title: project.name,
        description,
        alternates: { canonical: url },
        openGraph: { url, title: `${project.name} · Mohammed Faizan Ahmed`, description },
    };
}

export default async function ProjectPage({ params }: Params) {
    const { id } = await params;
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) notFound();

    const project = projects[index];
    const next = projects[(index + 1) % projects.length];
    const live = project.repoUrl ? await getRepoLive(project.repoUrl) : null;
    return <ProjectDetail project={project} next={{ id: next.id, name: next.name }} live={live} />;
}
