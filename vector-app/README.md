# Vector Database CLI Application

A simple command-line application that uses Pinecone vector database and OpenAI embeddings to store and query articles.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure your `.env` file contains:
```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

## Usage

### Initialize the Pinecone index
```bash
python vector_app.py init
```

### Insert sample articles
```bash
python vector_app.py insert
```

### Query the database
```bash
python vector_app.py query "How is AI being used in medicine?"
```

Query with custom number of results:
```bash
python vector_app.py query "clean energy solutions" -k 5
```

### View index statistics
```bash
python vector_app.py stats
```

### Run a fun demo
```bash
python vector_app.py demo
```

This will insert articles and run several interesting queries to demonstrate semantic search.

### Delete the index
```bash
python vector_app.py delete
```

## Sample Articles

The application includes 8 sample articles on topics like:
- Artificial Intelligence
- Climate Change and Renewable Energy
- Remote Work
- Machine Learning in Healthcare
- Sustainable Living
- Digital Communication
- Deep Learning
- Electric Vehicles

## How It Works

1. Articles are converted to embeddings using OpenAI's `text-embedding-ada-002` model
2. Embeddings are stored in Pinecone vector database
3. When querying, your query is also converted to an embedding
4. Pinecone finds the most similar articles using cosine similarity
5. Results are returned with similarity scores
