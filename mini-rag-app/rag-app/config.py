from pathlib import Path

BASE_DIR = Path(__file__).parent
DOCUMENTS_DIR = BASE_DIR / "documents"
INDEXES_DIR = BASE_DIR / "indexes"

FAISS_INDEX_PATH = INDEXES_DIR / "faiss_index.bin"
METADATA_PATH = INDEXES_DIR / "metadata.json"

EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"
EMBEDDING_DIMENSION = 1536

CHUNK_SIZE = 400
CHUNK_OVERLAP = 50

DEFAULT_TOP_K = 5
RERANK_TOP_K = 3
RERANK_INITIAL_K = 10
