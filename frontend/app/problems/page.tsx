import Link from 'next/link';

async function fetchProblems() {
  const res = await fetch('http://127.0.0.1:8000/problems', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load problems');
  }
  return res.json();
}

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Problem library</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Pick a coding problem to start the interview.</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900">
            Back to home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {problems.map((problem: any) => (
            <article key={problem.id} className="section-card border-slate-700 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{problem.title}</h2>
                  <p className="mt-2 text-slate-400">{problem.topics.join(' • ')}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                  {problem.difficulty}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>Est. {problem.estimated_time} min</span>
                <span className="h-1 w-1 rounded-full bg-slate-500"></span>
                <span>{problem.topics.length} topics</span>
              </div>
              <Link href={`/problems/${problem.id}`} className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                Start Interview
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
