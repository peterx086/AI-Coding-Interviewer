'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/api';

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

interface FinishReport {
  overall_score: number;
  categories: { label: string; score: number; description: string }[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

interface InterviewShellProps {
  problem: ProblemDetail;
}

export function InterviewShell({ problem }: InterviewShellProps) {
  const starterCodeForProblem = useMemo(() => {
    if (problem.title.toLowerCase().includes('two sum')) {
      return `from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        """\n        Parameters:\n            nums (List[int]): The input array of integers.\n            target (int): The target sum.\n\n        Example:\n            Input: nums = [2, 7, 11, 15], target = 9\n            Output: [0, 1]\n        """\n        pass\n`;
    }

    return problem.starter_code || '';
  }, [problem]);

  const [code, setCode] = useState(starterCodeForProblem);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [runResults, setRunResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ author: 'interviewer' | 'candidate'; message: string }[]>([
    { author: 'interviewer', message: 'Welcome to your interview. Please explain your approach before writing code.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [finishReport, setFinishReport] = useState<null | FinishReport>(null);
  const [showHiddenTests, setShowHiddenTests] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const hintsSummary = useMemo(() => problem.hints.join(' '), [problem.hints]);

  useEffect(() => {
    setCode(starterCodeForProblem);
    setConsoleLines([]);
    setRunResults([]);
    setShowHints(false);
    setFinishReport(null);
    setChatHistory([{ author: 'interviewer', message: 'Welcome to your interview. Please explain your approach before writing code.' }]);
    setChatInput('');
    setShowHiddenTests(false);
  }, [starterCodeForProblem, problem.id]);

  const appendChat = (author: 'interviewer' | 'candidate', message: string) => {
    setChatHistory((history) => [...history, { author, message }]);
  };

  const runCode = async () => {
    setIsRunning(true);
    setConsoleLines((lines) => [...lines, 'Running visible tests...']);
    try {
      const response = await fetch(`${API_BASE_URL}/run`, {
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
    setIsThinking(true);
    const candidateMessage = hint ? 'Please give me a hint.' : chatInput.trim();
    appendChat('candidate', candidateMessage);
    if (!hint) {
      setChatInput('');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
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
      appendChat('interviewer', `The interviewer is unavailable right now. ${String(error)}`);
    } finally {
      setIsSubmitting(false);
      setIsThinking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        sendAudio(blob);
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch (e) {}
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      appendChat('interviewer', 'Could not start audio recording: microphone permission denied or unsupported.');
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
    }
    setIsRecording(false);
  };

  const sendAudio = async (blob: Blob) => {
    setIsThinking(true);
    try {
      const fd = new FormData();
      fd.append('file', blob, 'recording.webm');
      fd.append('session_id', `problem-${problem.id}`);
      fd.append('problem_id', String(problem.id));
      const resp = await fetch(`${API_BASE_URL}/speech`, {
        method: 'POST',
        body: fd,
      });
      const data = await resp.json();
      const transcript = data.transcript || '(no transcript)';
      const reply = data.reply || 'Interviewer did not reply.';
      appendChat('candidate', transcript);
      appendChat('interviewer', reply);
      // Speak reply using browser TTS
      try {
        const utter = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    } catch (err) {
      appendChat('interviewer', `Audio upload failed: ${String(err)}`);
    } finally {
      setIsThinking(false);
    }
  };

  const finishInterview = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/finish`, {
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
        categories: data.categories,
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
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.95fr_0.95fr]">
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
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Input parameters</p>
            <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
              <p className="font-medium text-white">Example signature</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{problem.title.toLowerCase().includes('two sum') ? 'def twoSum(self, nums: List[int], target: int) -> List[int]:' : 'def solve():'} </pre>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Examples</p>
            <div className="mt-3 space-y-3">
              {problem.examples.slice(0, 2).map((example, index) => (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <p className="font-medium text-white">Example {index + 1}</p>
                  <p className="mt-2"><span className="font-semibold text-slate-200">Input:</span> {example.input}</p>
                  <p className="mt-1"><span className="font-semibold text-slate-200">Expected output:</span> {example.output}</p>
                </div>
              ))}
            </div>
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
            className="h-[840px] md:h-[900px] xl:h-[980px]"
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

      <section className="section-card flex flex-col gap-6 xl:ml-2">
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
          {isThinking ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interviewer</p>
              <div className="mt-2 flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400" />
                <span>Thinking…</span>
              </div>
            </div>
          ) : null}
        </div>

        <textarea
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder="Describe your approach or ask a question..."
          className="h-24 min-h-[96px] resize-none rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 outline-none transition focus:border-sky-500"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => { if (isRecording) stopRecording(); else startRecording(); }} className={`rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold transition ${isRecording ? 'bg-rose-600 text-white' : 'text-slate-200 hover:bg-slate-800/90'}`}>
              {isRecording ? 'Stop' : 'Record'}
            </button>
            <button onClick={() => submitChat(false)} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </div>
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
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-white">Categories</p>
                <div className="mt-3 space-y-2">
                  {finishReport.categories.map((category, index) => (
                    <div key={index} className="rounded-2xl bg-slate-950/80 p-3">
                      <p className="font-medium text-slate-100">{category.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{category.description}</p>
                      <p className="mt-2 text-sm text-slate-300">Score: <span className="font-semibold text-white">{category.score}</span></p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
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
                <div>
                  <p className="text-sm font-semibold text-white">Suggestions</p>
                  <ul className="list-disc space-y-1 pl-5 text-slate-300">
                    {finishReport.suggestions.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-4 text-slate-400">{finishReport.summary}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
