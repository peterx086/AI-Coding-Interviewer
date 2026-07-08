# Setup Guide

This document covers the full local setup for the AI Coding Interviewer project, including the backend, frontend, and optional Ollama integration.

## 1. Prerequisites

Make sure these are installed on your machine:

- Python 3.10+
- Node.js 18+
- npm
- Ollama (optional, but required for AI interviewer responses)

You can verify your installs with:

```bash
python3 --version
node --version
npm --version
ollama --version
```

## 2. Clone and enter the project

```bash
cd /Users/peterxie/Documents/AI-coding-interviewer
```

## 3. Create and activate the Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 4. Install backend dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

## 5. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## 6. Start the backend

From the project root:

```bash
source .venv/bin/activate
python backend/main.py
```

This starts the FastAPI backend on:

```text
http://127.0.0.1:8000
```

The API docs are available at:

```text
http://127.0.0.1:8000/docs
```

## 7. Start the frontend

In a second terminal:

```bash
cd /Users/peterxie/Documents/AI-coding-interviewer/frontend
npm run dev -- --hostname 127.0.0.1
```

Then open:

```text
http://127.0.0.1:3000
```

## 8. Optional: enable Ollama

If you want richer interviewer responses, install and run Ollama locally.

### Start Ollama server

In a separate terminal:

```bash
ollama serve
```

### Enable the backend to use Ollama

In the backend terminal, set:

```bash
export OLLAMA_ENABLED=1
export OLLAMA_MODEL="llama3.1:8b"
```

Then restart the backend:

```bash
python backend/main.py
```

### Verify Ollama works

Run:

```bash
ollama run llama3.1:8b "Hello from Ollama"
```

If that returns a response, Ollama is ready.

## 9. Troubleshooting

### Backend port already in use

If you see an address-in-use error:

```bash
lsof -i tcp:8000
```

Then stop the existing process and restart the backend.

### Frontend shows a stale runtime error

If you see a Next.js runtime or chunk error:

```bash
cd frontend
rm -rf .next
npm run dev -- --hostname 127.0.0.1
```

### Ollama cannot connect

If the backend says it cannot reach Ollama:

1. Confirm the server is running with `ollama serve`
2. Confirm the model exists with `ollama list`
3. Restart the backend after setting the environment variables

### Frontend cannot reach the backend

Make sure the backend is running on port 8000 and that the frontend is configured to use the correct API target. The default API base is set in the frontend configuration.

## 10. Useful verification commands

Backend health:

```bash
curl http://127.0.0.1:8000/docs
```

Ollama check:

```bash
ollama run llama3.1:8b "Hello from Ollama"
```

Frontend check:

```bash
curl http://127.0.0.1:3000
```
