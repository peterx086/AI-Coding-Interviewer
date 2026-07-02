from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ExampleItem(BaseModel):
    input: str
    output: str


class TestCase(BaseModel):
    input: str
    expected: str


class ProblemSummary(BaseModel):
    id: int
    title: str
    difficulty: str
    topics: List[str]
    estimated_time: int


class ProblemDetail(ProblemSummary):
    description: str
    input_description: str
    output_description: str
    constraints: str
    examples: List[ExampleItem]
    hints: List[str]
    starter_code: str


class ChatRequest(BaseModel):
    session_id: str
    problem_id: int
    action: str = "message"
    message: str = ""
    requested_hint: bool = False
    run_summary: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
    stage: str


class RunRequest(BaseModel):
    problem_id: int
    code: str
    use_hidden_tests: bool = False


class TestResult(BaseModel):
    input: str
    expected: str
    actual: str
    passed: bool
    stdout: str
    stderr: str
    runtime_seconds: float
    error: Optional[str] = None


class RunResponse(BaseModel):
    passed: bool
    total: int
    passed_count: int
    results: List[TestResult]


class FinishRequest(BaseModel):
    session_id: str
    problem_id: int
    code: str
    run_history: List[Dict[str, Any]]


class ReportCategory(BaseModel):
    label: str
    score: int
    description: str


class FinishResponse(BaseModel):
    overall_score: int
    categories: List[ReportCategory]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    summary: str
