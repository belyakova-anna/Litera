"""Full-text / semantic search over notes.

Future: chunk NoteSection.markdown, store embeddings, hybrid BM25 + vector retrieval.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class SearchHit:
    book_id: str
    note_section_id: str
    snippet: str
    score: float


class NoteSearchService:
    """Contract for searching personal notes. Not implemented in MVP."""

    def search(self, query: str, *, limit: int = 10) -> list[SearchHit]:
        raise NotImplementedError("Поиск по заметкам появится позже (RAG / hybrid search).")
