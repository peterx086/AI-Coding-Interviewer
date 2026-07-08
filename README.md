# AI Coding Interviewer

AI Coding Interviewer is a lightweight practice app for coding interviews. It combines a problem statement, a Python editor, a run/test console, and an AI interviewer chat so you can simulate a real interview experience locally.

The app is designed for quick local use with:
- a FastAPI backend
- a Next.js frontend
- SQLite-backed problem data
- optional Ollama-powered interviewer responses

## What it does

- Presents coding interview problems with descriptions, examples, constraints, and hints
- Lets you write and run Python solutions in an in-browser editor
- Supports a chat-based interview experience with an AI interviewer
- Provides a simple finish report based on your runs and interaction history

## Quick start

For full setup instructions, see [SETUP.md](SETUP.md).

If you just want the short version:

```bash
cd /Users/peterxie/Documents/AI-coding-interviewer
source .venv/bin/activate
export OLLAMA_ENABLED=1
export OLLAMA_MODEL="llama3.1:8b"
python backend/main.py
```

In a second terminal:

```bash
cd /Users/peterxie/Documents/AI-coding-interviewer/frontend
npm run dev -- --hostname 127.0.0.1
```

Then open:

```text
http://127.0.0.1:3000
```

