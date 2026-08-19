from vectorstore import load_vectorstore


def get_retriever(k: int = 3):
    """
    Saved vectorstore ko load karta hai aur ek retriever object return karta hai.
    k = kitne top relevant chunks retrieve karne hain
    """
    vectorstore = load_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    return retriever


# Test the retriever
if __name__ == "__main__":
    retriever = get_retriever(k=3)

    query = "What is this document about?"
    results = retriever.invoke(query)

    print(f"--- Retrieved {len(results)} chunks for query: '{query}' ---")
    for i, doc in enumerate(results, 1):
        print(f"\nChunk {i} (Page {doc.metadata.get('page')}):")
        print(doc.page_content[:200])