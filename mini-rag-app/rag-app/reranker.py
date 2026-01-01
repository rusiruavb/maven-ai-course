from typing import List, Dict
from openai import OpenAI
import config

def rerank_chunks(client: OpenAI, query: str, chunks: List[Dict], top_k: int = config.RERANK_TOP_K) -> List[Dict]:
    scored_chunks = []

    for chunk in chunks:
        prompt = f"""Rate the relevance of this text chunk to the question on a scale from 0 (completely irrelevant) to 10 (perfectly relevant).

Question: {query}

Text: {chunk['text']}

Provide only a single number from 0 to 10 as your response."""

        try:
            response = client.chat.completions.create(
                model=config.LLM_MODEL,
                messages=[
                    {"role": "system", "content": "You are a relevance scoring assistant. Respond with only a number from 0 to 10."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                max_tokens=10
            )

            score_text = response.choices[0].message.content.strip()
            score = float(score_text)
            score = max(0, min(10, score))

        except Exception as e:
            print(f"Error scoring chunk: {e}")
            score = chunk.get('score', 0)

        chunk_copy = chunk.copy()
        chunk_copy['rerank_score'] = score
        chunk_copy['original_score'] = chunk['score']
        scored_chunks.append(chunk_copy)

    scored_chunks.sort(key=lambda x: x['rerank_score'], reverse=True)

    top_chunks = scored_chunks[:top_k]

    for chunk in top_chunks:
        chunk['score'] = chunk['rerank_score']

    return top_chunks
