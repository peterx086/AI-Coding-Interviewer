import Link from 'next/link';
import { InterviewShell } from '../../../components/InterviewShell';

async function fetchProblem(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/problems/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Problem not found');
  }
  return res.json();
}

interface ProblemPageProps {
  params: { id: string };
}

export default async function ProblemDetailPage({ params }: ProblemPageProps) {
  const problem = await fetchProblem(params.id);

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Interview problem</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{problem.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-400">{problem.description}</p>
          </div>
          <Link href="/problems" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900">
            Back to problems
          </Link>
        </div>

        <InterviewShell problem={problem} />
      </div>
    </main>
  );
}
