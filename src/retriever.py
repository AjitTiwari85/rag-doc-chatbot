from src.vectorstore import load_vectorstore


def get_retriever(
    k: int = 3,
    document_id: str | None = None
):
    """
    Returns a Chroma retriever.

    If document_id is provided,
    search is restricted to that document.
    """

    vectorstore = load_vectorstore()

    search_kwargs = {
        "k": k
    }

    if document_id:
        search_kwargs["filter"] = {
            "document_id": document_id
        }

    retriever = vectorstore.as_retriever(
        search_kwargs=search_kwargs
    )

    return retriever


if __name__ == "__main__":

    retriever = get_retriever(
        k=3,
        document_id="test-document-1"
    )

    query = "What is this document about?"

    results = retriever.invoke(query)

    print(
        f"--- Retrieved {len(results)} chunks ---"
    )

    for i, doc in enumerate(results, 1):

        print(
            f"\nChunk {i}"
        )

        print(
            f"Page: {doc.metadata.get('page_number')}"
        )

        print(
            f"Document: {doc.metadata.get('filename')}"
        )

        print(
            doc.page_content[:200]
        )