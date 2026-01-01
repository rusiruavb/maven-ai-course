from typing import List, Dict
import config


def load_documents() -> List[Dict[str, str]]:
    documents = []

    if not config.DOCUMENTS_DIR.exists():
        raise FileNotFoundError(
            f"Documents directory not found: {config.DOCUMENTS_DIR}"
        )

    txt_files = list(config.DOCUMENTS_DIR.glob("*.txt"))

    if not txt_files:
        raise ValueError(f"No .txt files found in {config.DOCUMENTS_DIR}")

    for file_path in txt_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                documents.append({"filename": file_path.name, "content": content})
        except Exception as e:
            print(f"Error loading {file_path.name}: {e}")
            continue

    return documents
