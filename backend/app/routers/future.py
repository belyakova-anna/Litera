"""Reserved endpoints for search / recommendations / RAG (501 until implemented)."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import require_login

router = APIRouter(dependencies=[Depends(require_login)])


@router.get("/api/search")
def search_stub(q: str = "") -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Поиск по заметкам ещё не реализован",
    )


@router.get("/api/recommend")
def recommend_stub() -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Рекомендации ещё не реализованы",
    )


@router.post("/api/rag/ask")
def rag_stub() -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="RAG ещё не реализован",
    )
