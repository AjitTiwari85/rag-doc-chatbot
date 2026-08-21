import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.document_store import (
    add_document,
    get_documents,
    get_document,
    delete_document as delete_document_metadata,
)
from src.pdf_loader import load_pdf, split_documents
from src.vectorstore import (
    create_vectorstore,
    delete_document as delete_document_vectors,
)
from src.rag_chain import build_rag_chain, stream_rag_chain


app = FastAPI(title="RAG Document Chatbot API")


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Storage
# --------------------------------------------------

UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --------------------------------------------------
# Request Models
# --------------------------------------------------

class ChatRequest(BaseModel):
    question: str
    document_id: str
    history: str = ""


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "status": "RAG Chatbot API is running"
    }


# --------------------------------------------------
# Documents
# --------------------------------------------------

@app.get("/documents")
async def list_documents():
    return {
        "documents": get_documents()
    }


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    document = get_document(document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    file_path = os.path.join(
        UPLOAD_DIR,
        f"{document_id}.pdf",
    )

    try:
        # Delete Chroma chunks
        delete_document_vectors(document_id)

        # Delete PDF
        if os.path.exists(file_path):
            os.remove(file_path)

        # Delete metadata
        delete_document_metadata(document_id)

        return {
            "message": "Document deleted successfully",
            "document_id": document_id,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}",
        )


# --------------------------------------------------
# Upload PDF
# --------------------------------------------------

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    document_id = str(uuid.uuid4())

    file_path = os.path.join(
        UPLOAD_DIR,
        f"{document_id}.pdf",
    )

    try:
        # Save PDF
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        docs = load_pdf(file_path)

        # Split into chunks
        chunks = split_documents(docs)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract text from this PDF. "
                    "It may be corrupted or image-based."
                ),
            )

        # Store vectors
        create_vectorstore(
            chunks=chunks,
            document_id=document_id,
            filename=file.filename,
        )

        # Store document metadata
        document = add_document(
            document_id=document_id,
            filename=file.filename,
            chunks=len(chunks),
        )

        return {
            "message": "File uploaded and processed successfully",
            "document": document,
        }

    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}",
        )


# --------------------------------------------------
# Chat
# --------------------------------------------------

@app.post("/chat")
async def chat(request: ChatRequest):

    if not get_document(request.document_id):
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    try:
        chain = build_rag_chain(
            k=3,
            document_id=request.document_id,
        )

        answer = chain.invoke(
            {
                "question": request.question,
                "history": request.history,
            }
        )

        return {
            "answer": answer,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# --------------------------------------------------
# Streaming Chat
# --------------------------------------------------

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    if not get_document(request.document_id):
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    try:
        chain = build_rag_chain(
            k=3,
            document_id=request.document_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    def generate():
        try:
            yield from stream_rag_chain(
                chain,
                request.question,
                request.history,
            )

        except Exception as e:
            yield f"\n\n[Error: {str(e)}]"

    return StreamingResponse(
        generate(),
        media_type="text/plain",
    )