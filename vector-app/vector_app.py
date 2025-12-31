#!/usr/bin/env python3

import os
import argparse
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

load_dotenv()

INDEX_NAME = "article-embeddings"
EMBEDDING_DIMENSION = 1536

SAMPLE_ARTICLES = [
    {
        "id": "article1",
        "title": "The Future of Artificial Intelligence",
        "content": "Artificial intelligence is rapidly evolving, transforming industries from healthcare to finance. Machine learning algorithms are becoming more sophisticated, enabling computers to learn from data and make predictions with remarkable accuracy.",
    },
    {
        "id": "article2",
        "title": "Climate Change and Renewable Energy",
        "content": "As global temperatures rise, the transition to renewable energy sources becomes increasingly urgent. Solar and wind power are becoming more cost-effective, offering sustainable alternatives to fossil fuels.",
    },
    {
        "id": "article3",
        "title": "The Rise of Remote Work",
        "content": "The COVID-19 pandemic accelerated the shift to remote work, fundamentally changing how companies operate. Digital collaboration tools and cloud computing have made it possible for teams to work effectively from anywhere in the world.",
    },
    {
        "id": "article4",
        "title": "Machine Learning in Healthcare",
        "content": "Machine learning is revolutionizing healthcare by enabling early disease detection and personalized treatment plans. AI algorithms can analyze medical images, predict patient outcomes, and assist doctors in making more informed decisions.",
    },
    {
        "id": "article5",
        "title": "Sustainable Living and Green Technology",
        "content": "Green technology is making sustainable living more accessible. From electric vehicles to smart home systems that optimize energy consumption, innovation is helping reduce our environmental footprint.",
    },
    {
        "id": "article6",
        "title": "The Evolution of Digital Communication",
        "content": "Digital communication has transformed from simple emails to sophisticated video conferencing and instant messaging platforms. Social media and collaborative workspaces have redefined how we connect and share information.",
    },
    {
        "id": "article7",
        "title": "Deep Learning and Neural Networks",
        "content": "Deep learning, powered by neural networks, has achieved breakthroughs in image recognition, natural language processing, and autonomous systems. These technologies mimic the human brain's ability to learn and recognize patterns.",
    },
    {
        "id": "article8",
        "title": "Electric Vehicles and Transportation",
        "content": "Electric vehicles are reshaping the automotive industry, offering cleaner alternatives to traditional combustion engines. Advances in battery technology are extending range and reducing charging times, making EVs more practical for everyday use.",
    },
]


class VectorDB:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.pc = None
        self.index = None

    def initialize_pinecone(self):
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise ValueError("PINECONE_API_KEY not found in .env file")

        self.pc = Pinecone(api_key=api_key)

    def create_index(self):
        if not self.pc:
            self.initialize_pinecone()

        existing_indexes = [index.name for index in self.pc.list_indexes()]

        if INDEX_NAME not in existing_indexes:
            print(f"Creating new index '{INDEX_NAME}'...")
            self.pc.create_index(
                name=INDEX_NAME,
                dimension=EMBEDDING_DIMENSION,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
            print(f"Index '{INDEX_NAME}' created successfully!")
        else:
            print(f"Index '{INDEX_NAME}' already exists.")

        self.index = self.pc.Index(INDEX_NAME)

    def get_embedding(self, text):
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002", input=text
        )
        return response.data[0].embedding

    def insert_articles(self, articles=None):
        if not self.index:
            self.create_index()

        if articles is None:
            articles = SAMPLE_ARTICLES

        print(f"\nInserting {len(articles)} articles into the vector database...")

        vectors = []
        for article in articles:
            text = f"{article['title']}. {article['content']}"
            embedding = self.get_embedding(text)

            vectors.append(
                {
                    "id": article["id"],
                    "values": embedding,
                    "metadata": {
                        "title": article["title"],
                        "content": article["content"],
                    },
                }
            )
            print(f"  - Embedded: {article['title']}")

        self.index.upsert(vectors=vectors)
        print(f"\nSuccessfully inserted {len(articles)} articles!")

    def query(self, query_text, top_k=3):
        if not self.index:
            self.index = self.pc.Index(INDEX_NAME)

        print(f"\nQuerying: '{query_text}'")
        print(f"Finding top {top_k} matches...\n")

        query_embedding = self.get_embedding(query_text)

        results = self.index.query(
            vector=query_embedding, top_k=top_k, include_metadata=True
        )

        print("=" * 80)
        for i, match in enumerate(results.matches, 1):
            print(f"\nMatch {i} (Score: {match.score:.4f})")
            print(f"Title: {match.metadata['title']}")
            print(f"Content: {match.metadata['content']}")
            print("-" * 80)

        return results

    def get_stats(self):
        if not self.index:
            self.index = self.pc.Index(INDEX_NAME)

        stats = self.index.describe_index_stats()
        print("\nIndex Statistics:")
        print(f"  Total vectors: {stats.total_vector_count}")
        print(f"  Dimension: {stats.dimension}")

    def delete_index(self):
        if not self.pc:
            self.initialize_pinecone()

        print(f"Deleting index '{INDEX_NAME}'...")
        self.pc.delete_index(INDEX_NAME)
        print(f"Index '{INDEX_NAME}' deleted successfully!")


def main():
    parser = argparse.ArgumentParser(
        description="Vector Database CLI with Pinecone and OpenAI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    subparsers.add_parser("init", help="Initialize Pinecone index")

    subparsers.add_parser("insert", help="Insert sample articles")

    query_parser = subparsers.add_parser("query", help="Query the vector database")
    query_parser.add_argument("text", help="Query text")
    query_parser.add_argument(
        "-k", "--top-k", type=int, default=3, help="Number of results to return"
    )

    subparsers.add_parser("stats", help="Show index statistics")

    subparsers.add_parser("demo", help="Run a demo with fun queries")

    subparsers.add_parser("delete", help="Delete the index")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    db = VectorDB()

    try:
        if args.command == "init":
            db.initialize_pinecone()
            db.create_index()

        elif args.command == "insert":
            db.initialize_pinecone()
            db.insert_articles()

        elif args.command == "query":
            db.initialize_pinecone()
            db.query(args.text, args.top_k)

        elif args.command == "stats":
            db.initialize_pinecone()
            db.get_stats()

        elif args.command == "demo":
            db.initialize_pinecone()
            db.create_index()
            db.insert_articles()

            demo_queries = [
                "How is AI being used in medicine?",
                "What are the latest developments in clean energy?",
                "Tell me about working from home",
                "What's happening with electric cars?",
            ]

            for query_text in demo_queries:
                print("\n" + "=" * 80)
                db.query(query_text, top_k=2)
                input("\nPress Enter to continue to next query...")

        elif args.command == "delete":
            db.delete_index()

    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
