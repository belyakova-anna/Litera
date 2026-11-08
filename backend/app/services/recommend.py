"""Book recommendation based on reading history and notes.

Future: content-based (genres, note embeddings) + collaborative signals if multi-user.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Recommendation:
    title: str
    author: str
    reason: str
    google_books_id: str | None = None
    score: float = 0.0


class RecommendService:
    """Contract for next-book recommendations. Not implemented in MVP."""

    def recommend(self, *, limit: int = 5) -> list[Recommendation]:
        raise NotImplementedError("Рекомендации появятся позже.")
