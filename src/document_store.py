import json
from datetime import datetime, timezone
from pathlib import Path


STORE_PATH = Path("data/documents.json")


def _load() -> list[dict]:
    if not STORE_PATH.exists():
        return []

    try:
        return json.loads(STORE_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _save(documents: list[dict]) -> None:
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)

    STORE_PATH.write_text(
        json.dumps(documents, indent=2),
        encoding="utf-8",
    )


def add_document(
    document_id: str,
    filename: str,
    chunks: int,
) -> dict:
    documents = _load()

    document = {
        "id": document_id,
        "filename": filename,
        "chunks": chunks,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    documents.append(document)
    _save(documents)

    return document


def get_documents() -> list[dict]:
    return _load()


def get_document(document_id: str) -> dict | None:
    return next(
        (
            document
            for document in _load()
            if document["id"] == document_id
        ),
        None,
    )


def delete_document(document_id: str) -> bool:
    documents = _load()

    updated = [
        document
        for document in documents
        if document["id"] != document_id
    ]

    if len(updated) == len(documents):
        return False

    _save(updated)
    return True