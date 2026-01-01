import os
import json
import numpy as np
import faiss
import tiktoken
from typing import List, Dict, Tuple, Optional
from openai import OpenAI
from dotenv import load_dotenv
import config

load_dotenv()

class RAGEngine:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=api_key)
        self.tokenizer = tiktoken.encoding_for_model("gpt-4")
        self.index = None
        self.metadata = None

    def count_tokens(self, text: str) -> int:
        return len(self.tokenizer.encode(text))

    def chunk_documents(self, documents: List[Dict[str, str]]) -> List[Dict[str, str]]:
        chunks = []
        chunk_id = 0

        for doc in documents:
            text = doc['content']
            source = doc['filename']

            tokens = self.tokenizer.encode(text)
            total_tokens = len(tokens)

            start = 0
            while start < total_tokens:
                end = min(start + config.CHUNK_SIZE, total_tokens)
                chunk_tokens = tokens[start:end]
                chunk_text = self.tokenizer.decode(chunk_tokens)

                chunks.append({
                    'text': chunk_text,
                    'source': source,
                    'chunk_id': chunk_id,
                    'token_count': len(chunk_tokens)
                })

                chunk_id += 1
                start += config.CHUNK_SIZE - config.CHUNK_OVERLAP

        return chunks

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        embeddings = []
        batch_size = 100

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            response = self.client.embeddings.create(
                model=config.EMBEDDING_MODEL,
                input=batch
            )
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)

        return np.array(embeddings, dtype=np.float32)

    def create_index(self, chunks: List[Dict[str, str]]) -> Tuple[faiss.Index, List[Dict]]:
        texts = [chunk['text'] for chunk in chunks]
        embeddings = self.generate_embeddings(texts)

        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

        index = faiss.IndexFlatIP(config.EMBEDDING_DIMENSION)
        index.add(embeddings)

        metadata = [
            {
                'text': chunk['text'],
                'source': chunk['source'],
                'chunk_id': chunk['chunk_id']
            }
            for chunk in chunks
        ]

        return index, metadata

    def save_index(self, index: faiss.Index, metadata: List[Dict]):
        config.INDEXES_DIR.mkdir(parents=True, exist_ok=True)

        faiss.write_index(index, str(config.FAISS_INDEX_PATH))

        with open(config.METADATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)

    def load_index(self) -> bool:
        if not config.FAISS_INDEX_PATH.exists() or not config.METADATA_PATH.exists():
            return False

        try:
            self.index = faiss.read_index(str(config.FAISS_INDEX_PATH))

            with open(config.METADATA_PATH, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)

            return True
        except Exception as e:
            print(f"Error loading index: {e}")
            return False

    def retrieve_chunks(self, query: str, top_k: int = config.DEFAULT_TOP_K) -> List[Dict]:
        if self.index is None or self.metadata is None:
            raise ValueError("Index not loaded. Please create or load an index first.")

        query_embedding = self.generate_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)

        scores, indices = self.index.search(query_embedding, top_k)

        results = []
        for idx, score in zip(indices[0], scores[0]):
            if idx < len(self.metadata):
                result = self.metadata[idx].copy()
                result['score'] = float(score)
                results.append(result)

        return results

    def generate_answer(self, query: str, chunks: List[Dict]) -> str:
        context = "\n\n".join([
            f"[Source: {chunk['source']}]\n{chunk['text']}"
            for chunk in chunks
        ])

        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer the question based on the provided context. If the context doesn't contain enough information to answer the question, say so."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
            }
        ]

        response = self.client.chat.completions.create(
            model=config.LLM_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content
