from rag_engine import RAGEngine
from document_loader import load_documents

print("Loading RAG engine...")
rag = RAGEngine()

print("Loading documents...")
documents = load_documents()
print(f"Loaded {len(documents)} documents:")
for doc in documents:
    print(f"  - {doc['filename']}: {len(doc['content'])} characters")

print("\nChunking documents...")
chunks = rag.chunk_documents(documents)
print(f"Created {len(chunks)} chunks:")
chunk_by_source = {}
for chunk in chunks:
    source = chunk['source']
    chunk_by_source[source] = chunk_by_source.get(source, 0) + 1
for source, count in chunk_by_source.items():
    print(f"  - {source}: {count} chunks")

print("\nCreating index and generating embeddings...")
index, metadata = rag.create_index(chunks)
print(f"Index created with {index.ntotal} vectors")

print("\nSaving index...")
rag.save_index(index, metadata)
print("Index saved successfully!")

print("\nVerifying saved index...")
rag.index = index
rag.metadata = metadata
test_query = "What are the vacation policies?"
results = rag.retrieve_chunks(test_query, top_k=3)
print(f"\nTest query: '{test_query}'")
print(f"Retrieved {len(results)} chunks:")
for i, result in enumerate(results, 1):
    print(f"\n{i}. Source: {result['source']} (Score: {result['score']:.4f})")
    print(f"   Text preview: {result['text'][:150]}...")
