from langchain_core.documents import Document

document = Document(
    page_content="This is a text document.",
    metadata={"source": "test"}
)

print(document)
print(document.page_content)
print(document.metadata)