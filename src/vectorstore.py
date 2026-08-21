import os

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


PERSIST_DIRECTORY = "chroma_db"

COLLECTION_NAME = "documents"


def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


def get_vectorstore(
    persist_directory: str = PERSIST_DIRECTORY
):
    embeddings = get_embeddings()

    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=persist_directory,
        embedding_function=embeddings,
    )

    return vectorstore


def create_vectorstore(
    chunks,
    document_id: str,
    filename: str,
    persist_directory: str = PERSIST_DIRECTORY,
):
    vectorstore = get_vectorstore(persist_directory)

    # Add metadata
    for index, chunk in enumerate(chunks):

        chunk.metadata["document_id"] = document_id
        chunk.metadata["filename"] = filename
        chunk.metadata["chunk_index"] = index

        # PyMuPDF page is normally 0-based
        if "page" in chunk.metadata:
            chunk.metadata["page_number"] = (
                chunk.metadata["page"] + 1
            )

    vectorstore.add_documents(chunks)

    print(
        f"Added {len(chunks)} chunks "
        f"for document '{filename}' "
        f"(id={document_id})"
    )

    return vectorstore


def load_vectorstore(
    persist_directory: str = PERSIST_DIRECTORY
):
    return get_vectorstore(persist_directory)


def delete_document(
    document_id: str,
    persist_directory: str = PERSIST_DIRECTORY,
):
    vectorstore = get_vectorstore(persist_directory)

    collection = vectorstore._collection

    collection.delete(
        where={
            "document_id": document_id
        }
    )

    print(
        f"Deleted all chunks for document: {document_id}"
    )


if __name__ == "__main__":

    from src.pdf_loader import load_pdf, split_documents

    pdf_path = "data/sample.pdf"

    docs = load_pdf(pdf_path)

    chunks = split_documents(docs)

    vectorstore = create_vectorstore(
        chunks=chunks,
        document_id="test-document-1",
        filename="sample.pdf",
    )

    results = vectorstore.similarity_search(
        "What is this document about?",
        k=3
    )

    print(
        f"\n--- Top {len(results)} results ---"
    )

    for i, doc in enumerate(results, 1):

        print(f"\nResult {i}")

        print(
            doc.page_content[:200]
        )

        print(
            "Metadata:",
            doc.metadata
        )