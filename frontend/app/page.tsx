import Link from 'next/link';
import { TopNav } from '../components/TopNav';

const features = [
  { title: 'Realistic interviews', description: 'AI behaves like an actual engineering interviewer, not a generic chatbot.' },
  { title: 'Problem library', description: 'Browse curated Python interview problems with clear descriptions and starter code.' },
  { title: 'Code execution', description: 'Run Python solutions and review visible test results instantly.' },
  { title: 'AI feedback', description: 'Finish each session with a polished interview report and actionable suggestions.' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-sky-300 shadow-lg shadow-slate-900/30">
                AI Coding Interviewer MVP
              </span>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  Practice interview coding with a polished AI-driven platform.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Choose a Python problem, write code in a professional editor, run test cases, and hold a thoughtful chat with an interviewer-like AI.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/problems" className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400">
                  Browse problems
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-base font-semibold text-slate-200 hover:bg-slate-800/80">
                  How it works
                </a>
              </div>
            </div>
            <div className="section-card border-sky-500/20 bg-slate-900/90">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-slate-300">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Live demo</p>
                    <h2 className="text-2xl font-semibold text-white">Interview flow</h2>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    AI-first
                  </span>
                </div>
                <div className="grid gap-4">
                  {features.map((feature) => (
                    <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-slate-400">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="mt-24 space-y-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">How it works</p>
              <h2 className="text-4xl font-semibold text-white">A structured practice experience.</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: 'Select a problem', content: 'Browse concise problem cards with difficulty, topics, and a start button.' },
                { title: 'Code in the editor', content: 'Use a polished Monaco editor to write Python and execute test cases instantly.' },
                { title: 'Chat with AI', content: 'Discuss your approach and finish with feedback that feels like a real interview debrief.' },
              ].map((item) => (
                <div key={item.title} className="section-card border-slate-700 p-8">
                  <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-slate-400">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-24 rounded-3xl border border-slate-800 bg-panel/90 p-10 shadow-panel">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Get started</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Build interview confidence with practice that feels real.</h2>
              </div>
              <Link href="/problems" className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400">
                View problem library
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
