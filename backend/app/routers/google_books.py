from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import Settings, get_settings
from app.deps import require_login
from app.schemas import GoogleBookSuggestion
from app.services.google_books import search_google_books

router = APIRouter(
    prefix="/api/google-books",
    tags=["google-books"],
    dependencies=[Depends(require_login)],
)


@router.get("", response_model=list[GoogleBookSuggestion])
async def google_books_search(
    q: str = Query(min_length=1, max_length=200),
    settings: Settings = Depends(get_settings),
) -> list[GoogleBookSuggestion]:
    try:
        return await search_google_books(q, settings)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Google Books недоступен: {exc}") from exc
