'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ExampleItem {
  input: string;
  output: string;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  stdout: string;
  stderr: string;
  runtime_seconds: number;
  error?: string | null;
}

interface ProblemDetail {
  id: number;
  title: string;
  difficulty: string;
  topics: string[];
  estimated_time: number;
  description: string;
  input_description: string;
  output_description: string;
  constraints: string;
  examples: ExampleItem[];
  hints: string[];
  starter_code: string;
}

interface InterviewShellProps {
  problem: ProblemDetail;
}

export function InterviewShell({ problem }: InterviewShellProps) {
  const [code, setCode] = useState(problem.starter_code || '');
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [runResults, setRunResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ author: 'interviewer' | 'candidate'; message: string }[]>([
    { author: 'interviewer', message: 'Welcome to your interview. Please explain your approach before writing code.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [finishReport, setFinishReport] = useState<null | { overall_score: number; strengths: string[]; weaknesses: string[]; suggestions: string[]; summary: string }>(null);
  const [showHiddenTests, setShowHiddenTests] = useState(false);

  const hintsSummary = useMemo(() => problem.hints.join(' '), [problem.hints]);

  const appendChat = (author: 'interviewer' | 'candidate', message: string) => {
    setChatHistory((history) => [...history, { author, message }]);
  };

  const runCode = async () => {
    setIsRunning(true);
    setConsoleLines((lines) => [...lines, 'Running visible tests...']);
    try {
      const response = await fetch('http://127.0.0.1:8000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_id: problem.id, code, use_hidden_tests: showHiddenTests }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to run code');
      }
      setRunResults(data.results || []);
      setConsoleLines((lines) => [...lines, `Completed ${data.passed_count}/${data.total} tests.`]);
    } catch (error) {
      setConsoleLines((lines) => [...lines, `Execution error: ${String(error)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const submitChat = async (hint = false) => {
    if (!chatInput.trim() && !hint) {
      return;
    }
    setIsSubmitting(true);
    const candidateMessage = hint ? 'Please give me a hint.' : chatInput.trim();
    appendChat('candidate', candidateMessage);
    if (!hint) {
      setChatInput('');
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: `problem-${problem.id}`,
          problem_id: problem.id,
          action: 'message',
          message: candidateMessage,
          requested_hint: hint,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Chat request failed');
      }
      appendChat('interviewer', data.reply || 'I have a question for you.');
      if (hint) {
        setShowHints(true);
      }
    } catch (error) {
      appendChat('interviewer', `Error: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishInterview = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: `problem-${problem.id}`,
          problem_id: problem.id,
          code,
          run_history: runResults,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Finish request failed');
      }
      setFinishReport({
        overall_score: data.overall_score,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        suggestions: data.suggestions,
        summary: data.summary,
      });
      appendChat('interviewer', 'The interview has completed. View your report for details.');
    } catch (error) {
      appendChat('interviewer', `Error: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.8fr]">
      <section className="section-card flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Problem</p>
              <h2 className="text-3xl font-semibold text-white">{problem.title}</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {problem.difficulty}
            </span>
          </div>
          <p className="text-slate-300">{problem.description}</p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Input</p>
            <p className="mt-2 text-slate-300">{problem.input_description}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Output</p>
            <p className="mt-2 text-slate-300">{problem.output_description}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Constraints</p>
            <p className="mt-2 text-slate-300">{problem.constraints}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Topics</p>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Est. {problem.estimated_time} min</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {problem.topics.map((topic) => (
                <span key={topic} className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-card flex min-h-[720px] flex-col">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Code editor</p>
            <h3 className="text-xl font-semibold text-white">Python starter code</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCode(problem.starter_code)} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800/90">
              Reset
            </button>
            <button onClick={runCode} disabled={isRunning} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950">
          <MonacoEditor
            theme="vs-dark"
            language="python"
            value={code}
            options={{
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
            }}
            onChange={(value) => setCode(value || '')}
            className="h-[520px]"
          />
        </div>

        <div className="mt-4 rounded-3xl bg-slate-900/85 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Output console</p>
              <p className="text-slate-500">Visible results appear below after each run.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={showHiddenTests} onChange={(event) => setShowHiddenTests(event.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-400" />
              Hidden tests
            </label>
          </div>
          <div className="min-h-[120px] rounded-3xl bg-slate-950 p-4 text-sm text-slate-200">
            {runResults.length === 0 ? (
              <p className="text-slate-500">Run your code to see results here.</p>
            ) : (
              <div className="space-y-4">
                {runResults.map((result, index) => (
                  <div key={index} className={`rounded-3xl p-4 ${result.passed ? 'bg-emerald-950/30 border border-emerald-500/20' : 'bg-rose-950/30 border border-rose-500/20'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-100">Test case {index + 1}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${result.passed ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-300">
                      <p><span className="font-semibold text-slate-200">Input:</span> {result.input.replace(/\n/g, ' ')}</p>
                      <p><span className="font-semibold text-slate-200">Expected:</span> {result.expected}</p>
                      <p><span className="font-semibold text-slate-200">Actual:</span> {result.actual || '(no output)'}</p>
                      {result.stderr && <p><span className="font-semibold text-slate-200">Error:</span> {result.stderr}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-card flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">AI interviewer</p>
            <h3 className="text-xl font-semibold text-white">Interview chat</h3>
          </div>
          <button onClick={() => submitChat(true)} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800/90">
            Request hint
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-200" style={{ minHeight: 280, maxHeight: 420 }}>
          {chatHistory.map((item, index) => (
            <div key={index} className={`rounded-3xl p-4 ${item.author === 'interviewer' ? 'bg-slate-900' : 'bg-slate-800/80'}`}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.author === 'interviewer' ? 'Interviewer' : 'You'}</p>
              <p className="mt-2 whitespace-pre-line text-slate-200">{item.message}</p>
            </div>
          ))}
        </div>

        <textarea
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder="Describe your approach or ask a question..."
          className="h-24 min-h-[96px] resize-none rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 outline-none transition focus:border-sky-500"
        />
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => submitChat(false)} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? 'Sending…' : 'Send message'}
          </button>
          <button onClick={finishInterview} disabled={isSubmitting} className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800/90">
            Finish interview
          </button>
        </div>

        {showHints ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Hint</p>
            <p className="mt-2 text-slate-300">{hintsSummary}</p>
          </div>
        ) : null}

        {finishReport ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Interview report</p>
            <p className="mt-2">Overall score: <span className="font-semibold text-white">{finishReport.overall_score}</span></p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-white">Strengths</p>
                <ul className="list-disc space-y-1 pl-5 text-slate-300">
                  {finishReport.strengths.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Weaknesses</p>
                <ul className="list-disc space-y-1 pl-5 text-slate-300">
                  {finishReport.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
