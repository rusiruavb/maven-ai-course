import streamlit as st
from rag_engine import RAGEngine
from document_loader import load_documents
import config

st.set_page_config(
    page_title="Mini RAG Application",
    page_icon="🔍",
    layout="wide"
)

st.title("🔍 Mini RAG Application")
st.markdown("Ask questions about company policies, product features, or technical concepts!")

@st.cache_resource
def get_rag_engine():
    return RAGEngine()

rag = get_rag_engine()

with st.sidebar:
    st.header("⚙️ Settings")

    st.subheader("Index Management")

    if config.FAISS_INDEX_PATH.exists():
        if rag.index is None:
            if rag.load_index():
                st.success(f"✅ Index loaded ({len(rag.metadata)} chunks)")
            else:
                st.error("❌ Failed to load index")
        else:
            st.success(f"✅ Index ready ({len(rag.metadata)} chunks)")

        if st.button("🔄 Rebuild Index"):
            with st.spinner("Rebuilding index..."):
                try:
                    documents = load_documents()
                    chunks = rag.chunk_documents(documents)
                    index, metadata = rag.create_index(chunks)
                    rag.save_index(index, metadata)
                    rag.index = index
                    rag.metadata = metadata
                    st.success(f"✅ Index rebuilt! ({len(chunks)} chunks)")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error rebuilding index: {e}")
    else:
        st.warning("⚠️ No index found. Create one to get started.")
        if st.button("🚀 Create Index"):
            with st.spinner("Creating index from documents..."):
                try:
                    documents = load_documents()
                    st.info(f"Loaded {len(documents)} documents")
                    chunks = rag.chunk_documents(documents)
                    st.info(f"Created {len(chunks)} chunks")
                    index, metadata = rag.create_index(chunks)
                    st.info("Generated embeddings")
                    rag.save_index(index, metadata)
                    rag.index = index
                    rag.metadata = metadata
                    st.success(f"✅ Index created! ({len(chunks)} chunks)")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error creating index: {e}")

    st.divider()

    st.subheader("Retrieval Settings")
    top_k = st.slider("Number of chunks to retrieve", 1, 10, config.DEFAULT_TOP_K)

    use_reranking = st.checkbox("Enable Reranking (slower, better quality)", value=False)

    st.divider()

    st.subheader("Example Questions")
    st.markdown("""
    - What are the company's vacation policies?
    - How do I reset my password?
    - Explain how neural networks work
    - What employee benefits are available?
    - What are the system requirements?
    """)

if rag.index is not None:
    query = st.text_input("❓ Ask a question:", placeholder="Type your question here...")

    if st.button("🔍 Search & Answer", type="primary") and query:
        with st.spinner("Searching and generating answer..."):
            try:
                if use_reranking:
                    from reranker import rerank_chunks
                    initial_chunks = rag.retrieve_chunks(query, top_k=config.RERANK_INITIAL_K)
                    chunks = rerank_chunks(rag.client, query, initial_chunks, top_k=config.RERANK_TOP_K)
                    st.info("🎯 Reranking applied")
                else:
                    chunks = rag.retrieve_chunks(query, top_k=top_k)

                answer = rag.generate_answer(query, chunks)

                st.subheader("💡 Answer")
                st.write(answer)

                st.subheader("📚 Retrieved Sources")

                for i, chunk in enumerate(chunks, 1):
                    with st.expander(f"Source {i}: {chunk['source']} (Score: {chunk['score']:.3f})"):
                        st.text(chunk['text'])

            except Exception as e:
                st.error(f"Error: {e}")

else:
    st.info("👈 Please create an index using the sidebar to get started!")

st.divider()
st.caption("Built with OpenAI, FAISS, and Streamlit")
