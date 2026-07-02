import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "problems.db"

CREATE_PROBLEMS_TABLE = """
CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    topics TEXT NOT NULL,
    estimated_time INTEGER NOT NULL,
    description TEXT NOT NULL,
    input_description TEXT NOT NULL,
    output_description TEXT NOT NULL,
    constraints TEXT NOT NULL,
    examples TEXT NOT NULL,
    hints TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    visible_tests TEXT NOT NULL,
    hidden_tests TEXT NOT NULL
);
"""


def get_db_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables(conn: sqlite3.Connection) -> None:
    conn.execute(CREATE_PROBLEMS_TABLE)
    conn.commit()


def _serialize_problem(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "title": row["title"],
        "difficulty": row["difficulty"],
        "topics": json.loads(row["topics"]),
        "estimated_time": row["estimated_time"],
        "description": row["description"],
        "input_description": row["input_description"],
        "output_description": row["output_description"],
        "constraints": row["constraints"],
        "examples": json.loads(row["examples"]),
        "hints": json.loads(row["hints"]),
        "starter_code": row["starter_code"],
        "visible_tests": json.loads(row["visible_tests"]),
        "hidden_tests": json.loads(row["hidden_tests"]),
    }


def fetch_problem_summaries(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    cursor = conn.execute(
        "SELECT id, title, difficulty, topics, estimated_time FROM problems ORDER BY id"
    )
    problems = []
    for row in cursor.fetchall():
        problems.append(
            {
                "id": row["id"],
                "title": row["title"],
                "difficulty": row["difficulty"],
                "topics": json.loads(row["topics"]),
                "estimated_time": row["estimated_time"],
            }
        )
    return problems


def fetch_problem(conn: sqlite3.Connection, problem_id: int) -> Optional[Dict[str, Any]]:
    cursor = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,))
    row = cursor.fetchone()
    return _serialize_problem(row) if row else None


def problem_count(conn: sqlite3.Connection) -> int:
    cursor = conn.execute("SELECT COUNT(1) as count FROM problems")
    row = cursor.fetchone()
    return int(row["count"]) if row else 0


def seed_problems(conn: sqlite3.Connection, problems: List[Dict[str, Any]]) -> None:
    conn.execute("DELETE FROM problems")
    insert_sql = """
    INSERT INTO problems (
        id,
        title,
        difficulty,
        topics,
        estimated_time,
        description,
        input_description,
        output_description,
        constraints,
        examples,
        hints,
        starter_code,
        visible_tests,
        hidden_tests
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    for problem in problems:
        conn.execute(
            insert_sql,
            (
                problem["id"],
                problem["title"],
                problem["difficulty"],
                json.dumps(problem["topics"]),
                problem["estimated_time"],
                problem["description"],
                problem["input_description"],
                problem["output_description"],
                problem["constraints"],
                json.dumps(problem["examples"]),
                json.dumps(problem["hints"]),
                problem["starter_code"],
                json.dumps(problem["visible_tests"]),
                json.dumps(problem["hidden_tests"]),
            ),
        )
    conn.commit()


def initialize_database() -> None:
    conn = get_db_connection()
    try:
        create_tables(conn)
        if problem_count(conn) == 0:
            print("Seeding initial problems into SQLite database...")
            from .seed import build_problem_catalog

            problems = build_problem_catalog()
            seed_problems(conn, problems)
            print(f"Seeded {len(problems)} problems.")
    finally:
        conn.close()
