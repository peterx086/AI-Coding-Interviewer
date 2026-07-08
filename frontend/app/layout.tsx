import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Coding Interviewer',
  description: 'Practice technical interview questions in a realistic AI-powered environment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%),#020617] text-slate-100">
          {children}
        </div>
      </body>
    </html>
  );
}
