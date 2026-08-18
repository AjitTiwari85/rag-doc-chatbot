from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# ChromaDB ka data yahan disk pe save hoga
PERSIST_DIRECTORY = "chroma_db"


def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


def create_vectorstore(chunks, persist_directory: str = PERSIST_DIRECTORY):
    embeddings = get_embeddings()

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_directory,
    )
    print(f"Vectorstore created with {len(chunks)} chunks, saved at '{persist_directory}'")
    return vectorstore


def load_vectorstore(persist_directory: str = PERSIST_DIRECTORY):
    embeddings = get_embeddings()

    vectorstore = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings,
    )
    print(f"Vectorstore loaded from '{persist_directory}'")
    return vectorstore


# Test the vectorstore creation and similarity search
if __name__ == "__main__":
    from pdf_loader import load_pdf, split_documents

    docs = load_pdf("data/sample.pdf")
    chunks = split_documents(docs)

    vectorstore = create_vectorstore(chunks)

    # Test similarity search
    query = "What is this document about?"
    results = vectorstore.similarity_search(query, k=3)

    print(f"\n--- Top 3 results for query: '{query}' ---")
    for i, doc in enumerate(results, 1):
        print(f"\nResult {i}:")
        print(doc.page_content[:200])
        print(f"Metadata: {doc.metadata}")