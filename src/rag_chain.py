import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

from retriever import get_retriever

load_dotenv()


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def build_rag_chain(k: int = 3):
    retriever = get_retriever(k=k)

    llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.3)

    prompt = ChatPromptTemplate.from_template(
        """You are a helpful assistant answering questions based on the provided document context.
Use only the information in the context below to answer the question.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
{context}

Question: {question}

Answer:"""
    )

    output_parser = StrOutputParser()
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | output_parser
    )

    return rag_chain


# Test the RAG chain
if __name__ == "__main__":
    chain = build_rag_chain(k=3)

    question = "What is the refund policy timeline?"
    answer = chain.invoke(question)

    print(f"Question: {question}")
    print(f"\nAnswer: {answer}")