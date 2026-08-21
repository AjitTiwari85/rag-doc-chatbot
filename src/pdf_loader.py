from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


def load_pdf(file_path: str):
    loader = PyMuPDFLoader(file_path)

    documents = loader.load()

    print(f"Loaded {len(documents)} pages from {file_path}")

    return documents


def split_documents(
    documents,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )

    chunks = text_splitter.split_documents(documents)

    print(f"Split into {len(chunks)} chunks")

    return chunks


if __name__ == "__main__":

    pdf_path = "data/sample.pdf"

    docs = load_pdf(pdf_path)

    print("\n--- First page preview ---")
    print(docs[0].page_content[:300])

    chunks = split_documents(docs)

    print("\n--- First chunk preview ---")
    print(chunks[0].page_content)

    print("\n--- Metadata of first chunk ---")
    print(chunks[0].metadata)