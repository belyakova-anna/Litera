from __future__ import annotations

import httpx

from app.config import Settings
from app.schemas import GoogleBookSuggestion


def _authors(volume: dict) -> str:
    info = volume.get("volumeInfo") or {}
    authors = info.get("authors") or []
    return ", ".join(authors)


def _genre(volume: dict) -> str:
    info = volume.get("volumeInfo") or {}
    categories = info.get("categories") or []
    return categories[0] if categories else ""


def _cover(volume: dict) -> str | None:
    info = volume.get("volumeInfo") or {}
    links = info.get("imageLinks") or {}
    url = links.get("thumbnail") or links.get("smallThumbnail")
    if url and url.startswith("http://"):
        return "https://" + url[len("http://") :]
    return url


async def search_google_books(query: str, settings: Settings, *, limit: int = 8) -> list[GoogleBookSuggestion]:
    params: dict[str, str | int] = {
        "q": query,
        "maxResults": limit,
        "printType": "books",
    }
    if settings.google_books_api_key:
        params["key"] = settings.google_books_api_key

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get("https://www.googleapis.com/books/v1/volumes", params=params)
        if response.status_code == 429:
            # Without an API key Google may throttle; keep the form usable.
            return []
        response.raise_for_status()
        payload = response.json()

    suggestions: list[GoogleBookSuggestion] = []
    for item in payload.get("items") or []:
        info = item.get("volumeInfo") or {}
        suggestions.append(
            GoogleBookSuggestion(
                google_books_id=item.get("id") or "",
                title=info.get("title") or "Без названия",
                author=_authors(item),
                genre=_genre(item),
                cover_url=_cover(item),
                description_hint=info.get("description"),
            )
        )
    return suggestions
