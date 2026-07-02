import sys
from pathlib import Path
import uvicorn

if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    sys.path.insert(0, str(project_root))
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)
