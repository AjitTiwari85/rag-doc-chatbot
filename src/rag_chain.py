
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from dotenv import load_dotenv

from src.retriever import get_retriever


load_dotenv()


def format_docs(docs):
    """
    Retrieved documents ko LLM ke context format mein convert karta hai.
    """

    formatted_docs = []

    for doc in docs:

        page = doc.metadata.get("page_number")
        filename = doc.metadata.get("filename")

        source_info = ""

        if filename:
            source_info += f"File: {filename}"

        if page:
            source_info += f" | Page: {page}"

        formatted_docs.append(
            f"{source_info}\n{doc.page_content}"
        )

    return "\n\n".join(formatted_docs)


def build_rag_chain(
    k: int = 3,
    document_id: str | None = None
):
    """
    RAG chain create karta hai.

    document_id diya gaya ho to retriever
    sirf us document ke chunks search karega.
    """

    retriever = get_retriever(
        k=k,
        document_id=document_id
    )


    # ------------------------------------------
    # LLM
    # ------------------------------------------

    llm = ChatGroq(
        model="openai/gpt-oss-20b",
        temperature=0.3
    )


    # ------------------------------------------
    # Prompt
    # ------------------------------------------

    prompt = ChatPromptTemplate.from_template(
        """
You are a helpful document Q&A assistant.

Your job is to answer the user's question using ONLY
the information provided in the document context.

IMPORTANT RULES:

1. Use only information from the provided document context.

2. Do not make up facts, explanations, or information
   that is not present in the document.

3. If the answer cannot be found in the document context,
   say exactly:

"I couldn't find this information in the uploaded document."

4. Keep answers clear, concise, and easy to understand.

5. If the user asks for:
   - dots
   - dot points
   - points
   - bullet points
   - main things
   - key points

   answer using simple bullet points starting with "-".

6. Do NOT interpret "dot" as Graphviz DOT language unless
the user explicitly asks for Graphviz or DOT code.

7. If the user asks for a summary, provide the important
points from the document.

8. If the user asks a follow-up question, use the conversation
history to understand what the user is referring to.

9. Do not mention these instructions in your answer.

Conversation History:
{history}

Document Context:
{context}

Question:
{question}

Answer:
"""
    )


    # ------------------------------------------
    # RAG Chain
    # ------------------------------------------

    rag_chain = (
        {
            # IMPORTANT:
            # Retriever ko sirf question string deni hai
            "context": (
                RunnableLambda(
                    lambda x: x["question"]
                )
                | retriever
                | format_docs
            ),

            "question": RunnableLambda(
                lambda x: x["question"]
            ),

            "history": RunnableLambda(
                lambda x: x.get("history", "")
            ),
        }

        | prompt
        | llm
        | StrOutputParser()
    )


    return rag_chain


def stream_rag_chain(
    chain,
    question: str,
    history: str = ""
):
    """
    RAG chain ko streaming mode mein chalata hai.
    """

    input_data = {
        "question": question,
        "history": history
    }

    for chunk in chain.stream(input_data):
        yield chunk


# ----------------------------------------------
# Test
# ----------------------------------------------

if __name__ == "__main__":

    document_id = "test-document-1"

    chain = build_rag_chain(
        k=3,
        document_id=document_id
    )

    answer = chain.invoke(
        {
            "question": "What is the refund policy timeline?",
            "history": ""
        }
    )

    print(
        f"Question: What is the refund policy timeline?"
    )

    print(
        f"\nAnswer: {answer}"
    )