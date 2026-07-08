import Link from 'next/link';

export function TopNav() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="text-lg font-semibold text-white">
          AI Coding Interviewer
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-300">
          <Link href="/problems" className="rounded-full border border-slate-700 px-4 py-2 transition hover:bg-slate-900/80">
            Problem Library
          </Link>
          <a href="#how-it-works" className="rounded-full border border-slate-700 px-4 py-2 transition hover:bg-slate-900/80">
            How it works
          </a>
        </nav>
      </div>
    </header>
  );
}
