# DocSense — Multi-Persona RAG Document Adviser

> Upload any document. Get it explained by an AI expert in that field. Then talk it through — by text or voice — until it actually makes sense.

## Overview

DocSense is a Retrieval-Augmented Generation (RAG) agent that lets users upload a document in any format (PDF, Excel, Word, etc.) and receive a clear explanation of **what the document is** and **what it's trying to tell them** — grounded in the actual content of the file, with citations back to the source.

Instead of a single generic assistant, DocSense uses **swappable expert personas** — Lawyer, Doctor, Teacher, Engineer, and more — that change *how* a document is read and explained, while sharing one common retrieval pipeline underneath.

For long, multi-page documents, DocSense also includes a **document summarizer** that condenses the full text into a short summary of the main points, so users get the essentials without reading the whole file.

If the user doesn't understand the explanation, they can **keep chatting with the agent** — via text or voice — to get it clarified, simplified, or broken down further, turning a one-shot summary into an ongoing conversation about their document.

## Problem It Solves

People constantly receive documents they don't fully understand — contracts, medical reports, technical specs, syllabi — and don't always have quick access to a real expert to explain them. DocSense acts as an always-available first pass: it explains the document in plain language, grounded in the real text, and flags what needs attention.

**DocSense is an informational aid, not a substitute for professional advice.** Every response should encourage consulting a qualified professional for decisions with real consequences.

## Core Features

- **Multi-format ingestion** — PDF, Excel/CSV, Word, and plain text documents
- **Persona-based analysis** — user selects (or the agent suggests) a persona: Legal, Medical, Education, Engineering, or General
- **Grounded summaries** — "What is this document?" and "What is it telling me?" answered from the actual retrieved content, not general knowledge
- **Document summarizer** — condenses long, multi-page documents into a short document containing only the main points
- **Source citations** — every claim links back to the exact section/page it came from
- **Follow-up chat** — users can ask clarifying questions; the agent re-retrieves relevant context and re-explains (simpler language, examples, or more detail) rather than repeating itself
- **Voice conversation mode** — users can speak to the agent and hear it respond, using a fully free, self-hosted voice pipeline (no per-token or per-minute billing)
- **Honest uncertainty** — if a document is ambiguous, incomplete, or unclear, the agent says so instead of guessing

## Roadmap (Later)

- Risk/red-flag highlighting (unusual clauses, abnormal values, safety warnings)
- Structured output: Summary → Key Points → Risks/Concerns → Suggested Questions to Ask a Professional
- Multi-document upload and version comparison (e.g. contract draft vs. final)
- Downloadable report export (PDF)
- Action items / checklist with urgency tagging
- Auto-detection of document type and persona
- OCR support for scanned/handwritten documents
- Multi-language explanation support
- Reading-level control (explain like a professional vs. explain simply)
- Analytics dashboard (team/organization usage)

## How It Works (RAG Pipeline)

```
Document Upload
      │
      ▼
Text Extraction (PDF / Excel / DOCX / TXT)
      │
      ▼
Chunking + Embedding (Gemini embeddings)
      │
      ▼
Vector Store (MongoDB Atlas Vector Search)
      │
      ▼
Persona Layer  ──── Lawyer / Doctor / Teacher / Engineer / General
      │
      ▼
Retrieval-Augmented Generation (Gemini)
      │
      ▼
Grounded Explanation + Citations
      │
      ├──▶ Short Summary (main points only)
      │
      ▼
Follow-up Chat Loop (text or voice, re-retrieve as needed)
```

**Key architectural principle:** one shared retrieval pipeline, with a swappable *persona/prompt layer* on top — rather than building a separate agent per field.

## Tech Stack

### Application Stack — MERN

| Layer        | Technology                                       | Role                                                              |
|--------------|---------------------------------------------------|---------------------------------------------------------------------|
| Frontend     | **React**                                          | Upload UI, persona selector, chat + voice interface                 |
| Backend      | **Node.js + Express**                              | API routes: upload, parse, retrieve, analyze, summarize, chat       |
| Database     | **MongoDB (Atlas)**                                | Document metadata, extracted text, chunks, chat history             |
| File parsing | `pdf-parse`, `xlsx`, `mammoth`                     | Extract text from uploaded files                                    |

### Retrieval / Vector Search

- **MongoDB Atlas Vector Search** — keeps retrieval fully within the Mongo ecosystem (no separate vector database needed)

### LLM for Document Analysis

- **Gemini API** — used for embeddings, persona-based document analysis, summarization, and chat responses

### Voice Agent Stack — Free, Self-Hosted, No Token Limits

To keep the voice feature completely free with no usage caps, DocSense uses a self-hosted (not API-billed) voice pipeline:

| Component                     | Tool                                | Notes                                                  |
|--------------------------------|---------------------------------------|-----------------------------------------------------------|
| Speech-to-text                 | **Whisper** (OpenAI, open-source)     | Runs locally, no per-request cost                          |
| LLM for casual voice chat       | **Ollama** running an open-source model (Llama 3, Mistral, or Qwen) | Self-hosted — limited only by your own hardware |
| Text-to-speech                 | **Kokoro** or **Chatterbox** (open-source) | Free, self-hosted voice output                        |
| Orchestration                  | **Pipecat** or **LiveKit** (open-source) | Connects STT → LLM → TTS into a real-time conversation loop |

> **Trade-off to note:** "free" here means free of billing, not free of cost — this stack requires your own machine (ideally GPU-equipped) to run the models, and response quality from a free local LLM will generally be weaker than the Gemini API for nuanced document analysis. Document analysis (text-based) uses the Gemini API for accuracy, while the self-hosted stack handles the voice layer specifically.

## Project Structure

```
docsense-backend/
├── package.json
├── .env.example
└── src/
    ├── server.js                 # Express entry point, registers all routes
    ├── config/
    │   ├── db.js                 # MongoDB connection
    │   └── upload.js             # Multer file-upload config
    ├── models/
    │   ├── Document.js           # Document schema (text, chunks, persona, summary)
    │   └── ChatMessage.js        # Chat history schema
    ├── services/
    │   ├── textExtractor.js      # PDF/Excel/Word/TXT → raw text
    │   ├── embeddingService.js   # Chunking + Gemini embeddings
    │   ├── personaPrompts.js     # Persona prompt templates
    │   └── retrievalService.js   # Vector search for relevant chunks
    └── routes/
        ├── health.js             # Server status check
        ├── documents.js          # Upload + list + get document
        ├── analyze.js            # Persona-based analysis
        ├── summarize.js          # Document summarizer
        └── chat.js               # Follow-up chat
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# then fill in MONGO_URI (MongoDB Atlas connection string) and GEMINI_API_KEY

# 3. Run the server
npm run start
```

Test with Postman or curl, e.g.:

```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -F "file=@/path/to/sample.pdf" \
  -F "persona=legal"
```

## Build Status

- [x] Backend project setup (Express + MongoDB connection)
- [x] File upload + text extraction (PDF, Excel, Word, TXT)
- [ ] Chunking + embeddings (Gemini)
- [ ] Persona prompts + retrieval logic
- [ ] Analysis route (core feature)
- [ ] Summarizer route
- [ ] Chat / follow-up route
- [ ] React frontend
- [ ] Voice agent layer (Whisper + Ollama + Kokoro/Chatterbox)
- [ ] End-to-end testing + polish

## Disclaimer

DocSense provides general information based on uploaded documents and does **not** constitute professional legal, medical, financial, or technical advice. Always consult a qualified professional before making decisions based on its output.