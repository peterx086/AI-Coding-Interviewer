import json
import os
import random
import re
import subprocess
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .db import fetch_problem, fetch_problem_summaries, get_db_connection, initialize_database
from .run_code import run_code_against_tests
from .schemas import ChatRequest, ChatResponse, FinishRequest, FinishResponse, ProblemDetail, ProblemSummary, RunRequest, RunResponse

app = FastAPI(title="AI Coding Interviewer API")

session_store: Dict[str, Dict[str, Any]] = {}

def get_session(session_id: str) -> Dict[str, Any]:
    session = session_store.setdefault(
        session_id,
        {
            "stage": "intro",
            "messages": [],
            "hints_requested": 0,
            "clarifying_questions": 0,
        },
    )
    return session


def build_hint_response(problem: dict, session: Dict[str, Any]) -> str:
    hints = problem.get("hints") or []
    index = min(session["hints_requested"], len(hints) - 1) if hints else 0
    hint = hints[index] if hints else "Try to decompose the problem into smaller steps and test each idea."
    return f"Here’s a hint: {hint}"


def call_ollama(prompt: str, model: str) -> str:
    """Call the local Ollama CLI and return the stdout text. Raises RuntimeError on failure."""
    cmd = ["ollama", "run", model, prompt]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError:
        raise RuntimeError("ollama CLI not found")
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip() or "ollama error")
    cleaned = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", res.stdout)
    return cleaned.strip()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"] ,
)


@app.on_event("startup")
def startup_event() -> None:
    initialize_database()


@app.get("/problems", response_model=list[ProblemSummary])
def list_problems() -> list[ProblemSummary]:
    conn = get_db_connection()
    try:
        return fetch_problem_summaries(conn)
    finally:
        conn.close()


@app.get("/problems/{problem_id}", response_model=ProblemDetail)
def get_problem(problem_id: int) -> ProblemDetail:
    conn = get_db_connection()
    try:
        problem = fetch_problem(conn, problem_id)
        if problem is None:
            raise HTTPException(status_code=404, detail="Problem not found")
        return problem
    finally:
        conn.close()


@app.post("/run", response_model=RunResponse)
def run_solution(request: RunRequest) -> RunResponse:
    conn = get_db_connection()
    try:
        problem = fetch_problem(conn, request.problem_id)
        if problem is None:
            raise HTTPException(status_code=404, detail="Problem not found")
        visible_results = run_code_against_tests(request.code, problem["visible_tests"])
        hidden_results = None
        if request.use_hidden_tests:
            hidden_results = run_code_against_tests(request.code, problem["hidden_tests"])
        concatenated_results = visible_results
        if hidden_results:
            concatenated_results["results"].extend(hidden_results["results"])
            concatenated_results["total"] += hidden_results["total"]
            concatenated_results["passed_count"] += hidden_results["passed_count"]
            concatenated_results["passed"] = concatenated_results["passed_count"] == concatenated_results["total"]
        return RunResponse(**concatenated_results)
    finally:
        conn.close()


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    problem = get_problem(request.problem_id)
    session = get_session(request.session_id)
    session["messages"].append({
        "role": "candidate",
        "message": request.message,
    })

    if request.requested_hint:
        session["hints_requested"] += 1
        reply = build_hint_response(problem, session)
        stage = "hint"
    else:
        if session["stage"] == "intro":
            session["stage"] = "discussion"
            reply = (
                "Thanks for sharing your idea. I’m listening for your approach. "
                "Tell me what algorithm you would use and why it fits the problem."
            )
        elif "brute" in request.message.lower() or "slow" in request.message.lower():
            reply = (
                "You mentioned a brute-force path. That can work for smaller inputs, but can you think about whether there is a more efficient strategy? "
                "Identify the constraints and choose a plan that scales."
            )
        else:
            session["clarifying_questions"] += 1
            reply = (
                "That’s a good start. What edge cases are you considering, and how will your code behave if input is empty or maximum-sized?"
            )
        stage = "interview"
    # Optionally enrich reply via Ollama if enabled
    ollama_enabled = os.getenv("OLLAMA_ENABLED")
    ollama_model = os.getenv("OLLAMA_MODEL")
    if ollama_enabled and ollama_model:
        problem_title = problem["title"] if isinstance(problem, dict) else problem.title
        try:
            history = "\n".join([f"{m['role']}: {m['message']}" for m in session.get('messages', [])])
            prompt = (
                f"You are a helpful coding interviewer. Problem: {problem_title}.\n"
                f"Conversation history:\n{history}\nRespond to the candidate message above with a clear, concise interviewer question or hint."
            )
            llm_reply = call_ollama(prompt, ollama_model)
            if llm_reply:
                reply = llm_reply
        except RuntimeError:
            pass
        except Exception:
            pass

    session["messages"].append({
        "role": "interviewer",
        "message": reply,
    })
    return ChatResponse(reply=reply, stage=stage)


@app.post("/finish", response_model=FinishResponse)
def finish_interview(request: FinishRequest) -> FinishResponse:
    session = get_session(request.session_id)
    passed_count = sum(1 for item in request.run_history if item.get("passed"))
    total_count = len(request.run_history)
    hidden_requests = session.get("hints_requested", 0)
    clarifying_questions = session.get("clarifying_questions", 0)

    score = 60 + min(20, passed_count * 5)
    score += min(10, clarifying_questions * 2)
    score -= min(10, hidden_requests * 2)
    score = max(40, min(100, score))

    categories = [
        {"label": "Communication", "score": min(20, 10 + clarifying_questions * 2), "description": "Clarity of reasoning and responsiveness."},
        {"label": "Problem solving", "score": min(25, 15 + passed_count * 2), "description": "Understanding of requirements and approach."},
        {"label": "Code quality", "score": min(20, 12 + passed_count), "description": "Readability and maintainability of the implementation."},
        {"label": "Testing", "score": min(20, 10 + passed_count * 2), "description": "Use of visible and hidden tests to validate the solution."},
        {"label": "Professionalism", "score": min(15, 10 + max(0, clarifying_questions - hidden_requests)), "description": "How thoughtfully the candidate handled the interview conversation."},
    ]

    strengths = [
        "You showed strong engagement with the interview questions.",
        "You used test execution to validate your solution.",
    ]
    weaknesses = []
    suggestions = []

    if passed_count < total_count:
        weaknesses.append("Some test cases did not pass. Review failing cases and edge conditions.")
        suggestions.append("Rerun the code after fixing the specific failing inputs.")
    if hidden_requests > 0:
        weaknesses.append("You requested hints, which is fine, but try to solve more independently next time.")
        suggestions.append("Use hint requests sparingly and aim to develop your own solution first.")
    if clarifying_questions == 0:
        weaknesses.append("You could ask more clarifying questions before coding.")
        suggestions.append("Ask about constraints, input sizes, and edge-case behavior during the interview.")

    if not weaknesses:
        strengths.append("Your interview strategy was clear and effective.")
        suggestions.append("Continue practicing this structured approach on more problems.")

    summary = (
        f"This interview session is complete. You passed {passed_count}/{total_count} run tests, "
        f"requested {hidden_requests} hint(s), and exchanged {clarifying_questions} follow-up question(s) with the interviewer. "
        "Use the feedback above to sharpen your next coding interview practice."
    )
    # Optionally ask Ollama to provide an extra concise feedback paragraph
    ollama_enabled = os.getenv("OLLAMA_ENABLED")
    ollama_model = os.getenv("OLLAMA_MODEL")
    if ollama_enabled and ollama_model:
        try:
            run_summary = json.dumps(request.run_history or [])
            prompt = (
                f"You are an experienced interview coach. Problem: {problem.title if 'problem' in locals() else request.problem_id}.\n"
                f"Run history: {run_summary}\n"
                f"Current summary: {summary}\n"
                "Provide one short additional suggestion and one short strength note, separated by a blank line."
            )
            extra = call_ollama(prompt, ollama_model)
            if extra:
                # Append the model's output as an extra suggestion
                suggestions.append(extra)
        except Exception:
            pass

    return FinishResponse(
        overall_score=score,
        categories=categories,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions,
        summary=summary,
    )
