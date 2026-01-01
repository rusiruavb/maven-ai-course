# LangChain & LangGraph Assessment

This project demonstrates LangChain RAG with conversation memory and LangGraph workflow with conditional summarization.

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure your `.env` file contains your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Notebook

Open `langchain-app.ipynb` in Jupyter:
```bash
jupyter notebook langchain-app.ipynb
```

Or use JupyterLab:
```bash
jupyter lab langchain-app.ipynb
```

## What's Implemented

### Part 1: LangChain RAG with Conversation Memory
- Implements a conversational RAG system using ConversationalRetrievalChain
- Uses ConversationBufferMemory to maintain conversation context
- Demonstrates answering follow-up questions with pronoun resolution

### Part 2: LangGraph Workflow with Conditional Summarizer
- Creates a state-based workflow using LangGraph
- Includes conditional logic to summarize documents when they exceed 800 characters
- Demonstrates efficient document processing with intelligent branching

### Part 3: Reflection
- Analyzes when to use LangChain vs LangGraph
- Discusses trade-offs between simplicity and control
- Provides practical guidance for choosing the right framework
