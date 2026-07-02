import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, List


def run_code_against_tests(code: str, tests: List[Dict[str, str]]) -> Dict[str, Any]:
    results: List[Dict[str, Any]] = []
    passed_count = 0

    for test_case in tests:
        temp_file = None
        try:
            temp_file = tempfile.NamedTemporaryFile(
                mode="w", suffix=".py", delete=False, encoding="utf-8"
            )
            temp_file.write(code)
            temp_file.flush()
            temp_file.close()
            start = time.monotonic()
            completed = subprocess.run(
                [sys.executable, temp_file.name],
                input=test_case["input"],
                capture_output=True,
                text=True,
                timeout=6,
            )
            elapsed = time.monotonic() - start
            actual = completed.stdout.strip()
            expected = test_case["expected"].strip()
            passed = actual == expected and completed.returncode == 0
            if passed:
                passed_count += 1
            results.append(
                {
                    "input": test_case["input"],
                    "expected": expected,
                    "actual": actual,
                    "passed": passed,
                    "stdout": completed.stdout,
                    "stderr": completed.stderr,
                    "runtime_seconds": round(elapsed, 4),
                    "error": None if completed.returncode == 0 else completed.stderr.strip() or None,
                }
            )
        except subprocess.TimeoutExpired as timeout_error:
            elapsed = time.monotonic() - start
            results.append(
                {
                    "input": test_case["input"],
                    "expected": test_case["expected"].strip(),
                    "actual": "",
                    "passed": False,
                    "stdout": "",
                    "stderr": "Execution timed out.",
                    "runtime_seconds": round(elapsed, 4),
                    "error": "timeout",
                }
            )
        except Exception as exc:
            elapsed = time.monotonic() - start
            results.append(
                {
                    "input": test_case["input"],
                    "expected": test_case["expected"].strip(),
                    "actual": "",
                    "passed": False,
                    "stdout": "",
                    "stderr": str(exc),
                    "runtime_seconds": round(elapsed, 4),
                    "error": "exception",
                }
            )
        finally:
            if temp_file is not None:
                try:
                    os.remove(temp_file.name)
                except OSError:
                    pass

    total = len(results)
    return {
        "passed": passed_count == total and total > 0,
        "total": total,
        "passed_count": passed_count,
        "results": results,
    }
