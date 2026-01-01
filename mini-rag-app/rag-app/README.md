# Mini RAG Application

A Retrieval-Augmented Generation (RAG) application built with OpenAI, FAISS, and Streamlit. This application demonstrates how to build a semantic search and question-answering system over custom documents.

## Features

- **Document Processing**: Loads and chunks text documents into manageable pieces
- **Semantic Search**: Uses OpenAI embeddings and FAISS vector database for fast similarity search
- **AI-Powered Answers**: Generates contextual answers using GPT-4o-mini
- **Reranking**: Optional LLM-based reranking for improved relevance
- **Interactive UI**: Clean Streamlit interface for easy interaction

## Architecture

```
User Question → Streamlit UI → Document Processor → Chunker → Embedder → FAISS Index
                                                                              ↓
User Answer ← LLM Generator ← Context Builder ← Reranker (optional) ← Retriever
```

## Technology Stack

- **Vector Store**: FAISS (local, file-persisted)
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI gpt-4o-mini
- **UI**: Streamlit
- **Language**: Python 3.8+

## Setup

### Prerequisites

- Python 3.8 or higher
- OpenAI API key

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file in the parent directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

3. Run the application:
```bash
streamlit run app.py
```

## Usage

### First Time Setup

1. Launch the application
2. Click "Create Index" in the sidebar
3. Wait for the index to be created (this generates embeddings for all documents)

### Asking Questions

1. Type your question in the text input
2. Optionally adjust settings:
   - Number of chunks to retrieve (1-10)
   - Enable/disable reranking
3. Click "Search & Answer"
4. View the answer and retrieved sources

### Adding Custom Documents

1. Add `.txt` files to the `documents/` directory
2. Click "Rebuild Index" in the sidebar
3. The new documents will be included in the knowledge base

## Sample Documents

The application includes three sample documents:

1. **company_handbook.txt**: Company policies, benefits, and culture
2. **product_faq.txt**: Product features and troubleshooting
3. **tech_blog.txt**: Technical article about neural networks

## Test Questions

Try these questions to test the system:

### Expected to Work Well
- "What are the company's vacation policies?"
- "How do I reset my product password?"
- "What employee benefits are available?"
- "What are the system requirements for the product?"

### May Struggle
- "Explain how neural networks work" (requires comprehensive explanation)

### Will Fail
- "Compare the company's benefits to industry standards" (requires external knowledge)
- "What's the weather today?" (out of context)

## Configuration

Key settings in `config.py`:

- `CHUNK_SIZE`: 400 tokens (adjustable)
- `CHUNK_OVERLAP`: 50 tokens (prevents information loss at boundaries)
- `EMBEDDING_MODEL`: text-embedding-3-small
- `LLM_MODEL`: gpt-4o-mini
- `DEFAULT_TOP_K`: 5 chunks retrieved by default

## Reranking

The reranking feature improves retrieval quality:

**How it works**:
1. Retrieves top-10 chunks from FAISS
2. Sends each chunk to the LLM for relevance scoring (0-10)
3. Re-sorts chunks by LLM scores
4. Returns top-3 most relevant chunks

**Trade-offs**:
- **Pros**: Better semantic understanding, improved answer quality
- **Cons**: Slower (10 additional API calls), higher cost

**When to use**: Enable for complex questions where precision matters more than speed.

## Project Structure

```
rag-app/
├── app.py                    # Streamlit UI
├── rag_engine.py             # Core RAG logic
├── document_loader.py        # Document loading
├── reranker.py               # LLM-based reranking
├── config.py                 # Configuration
├── requirements.txt          # Dependencies
├── documents/                # Text documents
│   ├── company_handbook.txt
│   ├── product_faq.txt
│   └── tech_blog.txt
├── indexes/                  # FAISS index storage
│   ├── faiss_index.bin
│   └── metadata.json
└── test_questions.txt        # Sample questions
```

## Performance Notes

- **Index Creation**: Takes 30-60 seconds for 3 documents (~30 chunks)
- **Query Time**: 2-3 seconds without reranking, 10-15 seconds with reranking
- **Accuracy**: High for fact retrieval, moderate for synthesis tasks

## Limitations

1. **Context Window**: Limited to retrieved chunks (doesn't see full documents)
2. **No Multi-hop Reasoning**: Can't combine information across multiple documents well
3. **No Temporal Awareness**: Doesn't understand time or version changes
4. **Hallucination**: May generate plausible but incorrect information if context is insufficient

## Future Enhancements

- Support for PDF, DOCX, and other file formats
- Hybrid search (keyword + semantic)
- Conversation history and follow-up questions
- Query refinement suggestions
- Chunk visualization and highlighting
- Multiple embedding models comparison
- Custom chunking strategies

## Troubleshooting

**Index won't create**:
- Check that documents directory contains .txt files
- Verify OpenAI API key is set correctly

**Slow performance**:
- Disable reranking
- Reduce top_k value
- Check internet connection

**Poor answer quality**:
- Enable reranking
- Increase top_k to retrieve more context
- Ensure documents contain relevant information

## License

MIT

## Credits

Built with OpenAI, FAISS, and Streamlit.
