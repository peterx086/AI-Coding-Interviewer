import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Coding Interviewer',
  description: 'Practice technical interview questions in a realistic AI-powered environment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
