import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.pdf_loader import load_pdf, split_documents
from src.vectorstore import create_vectorstore, load_vectorstore
from src.rag_chain import build_rag_chain

app = FastAPI(title="RAG Document Chatbot API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)


rag_chain = None


class ChatRequest(BaseModel):
    question: str


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global rag_chain

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = os.path.join(UPLOAD_DIR, "sample.pdf")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        docs = load_pdf(file_path)
        chunks = split_documents(docs)

        if len(chunks) == 0:
            raise HTTPException(status_code=400, detail="Could not extract text from this PDF. It may be corrupted or image-based.")

        create_vectorstore(chunks)
        rag_chain = build_rag_chain(k=3)

        return {"message": "File uploaded and processed successfully", "chunks": len(chunks)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(request: ChatRequest):
    global rag_chain

    if rag_chain is None:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")

    try:
        answer = rag_chain.invoke(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"status": "RAG Chatbot API is running"}