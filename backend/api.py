import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db import fetch_problem, fetch_problem_summaries, get_db_connection, initialize_database
from .run_code import run_code_against_tests
from .schemas import ChatRequest, ChatResponse, FinishRequest, FinishResponse, ProblemDetail, ProblemSummary, RunRequest, RunResponse, TestResult

app = FastAPI(title="AI Coding Interviewer API")

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
    if request.action == "message":
        if request.requested_hint:
            reply = "Here's a hint: think about how you can simplify the problem and avoid brute-force behavior."
        else:
            reply = (
                "Thanks for sharing your idea. Tell me how you plan to approach the problem before you write any code. "
                "I want to understand the tradeoffs you are considering."
            )
        return ChatResponse(reply=reply, stage="interview")
    raise HTTPException(status_code=400, detail="Unsupported chat action")


@app.post("/finish", response_model=FinishResponse)
def finish_interview(request: FinishRequest) -> FinishResponse:
    score = 70
    categories = [
        {"label": "Communication", "score": 15, "description": "Response clarity and interview engagement."},
        {"label": "Problem solving", "score": 18, "description": "How well the candidate understood the problem and approach."},
        {"label": "Code quality", "score": 19, "description": "Readability, style, and maintainability of the code."},
        {"label": "Optimization", "score": 10, "description": "Use of efficient data structures and algorithms."},
        {"label": "Edge case handling", "score": 8, "description": "Consideration for corner cases and input validation."},
    ]
    strengths = [
        "Clear communication of the approach.",
        "Focused problem-solving strategy.",
    ]
    weaknesses = [
        "The implementation can be improved with more robust edge case handling.",
        "There is a chance to simplify the code for readability and maintainability.",
    ]
    suggestions = [
        "Explain your chosen algorithm before writing code.",
        "Run both visible and hidden tests to verify edge cases.",
        "Document assumptions and input constraints clearly.",
    ]
    summary = (
        "The interview ended with a solid attempt. The candidate demonstrated good communication and a structured approach, "
        "but there is room for stronger code quality and more consistent edge case coverage."
    )
    return FinishResponse(
        overall_score=score,
        categories=categories,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions,
        summary=summary,
    )
