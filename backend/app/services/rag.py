"""RAG over the personal reading diary.

Future pipeline:
1. Ingest NoteSection + Book.description_hint into a vector store
2. Retrieve top-k chunks for a user question
3. Generate an answer grounded in those chunks
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RagAnswer:
    answer: str
    sources: list[dict]


class RagService:
    """Contract for diary Q&A. Not implemented in MVP."""

    def ask(self, question: str) -> RagAnswer:
        raise NotImplementedError("RAG-ответы появятся позже.")
