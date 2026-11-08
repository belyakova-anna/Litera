from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import require_login
from app.models import Book, NoteSection, ReadingDay
from app.schemas import (
    BookCreate,
    BookListItem,
    BookOut,
    BookUpdate,
    NoteSectionOut,
    NotesReplace,
)

router = APIRouter(
    prefix="/api/books",
    tags=["books"],
    dependencies=[Depends(require_login)],
)


def _reading_counts(db: Session, book_ids: list[str]) -> dict[str, int]:
    if not book_ids:
        return {}
    rows = db.execute(
        select(ReadingDay.book_id, func.count(ReadingDay.id))
        .where(ReadingDay.book_id.in_(book_ids))
        .group_by(ReadingDay.book_id)
    ).all()
    return {book_id: count for book_id, count in rows}


def _to_list_item(book: Book, count: int) -> BookListItem:
    return BookListItem(
        id=book.id,
        title=book.title,
        author=book.author,
        genre=book.genre,
        cover_url=book.cover_url,
        status=book.status,
        started_at=book.started_at,
        finished_at=book.finished_at,
        created_at=book.created_at,
        reading_day_count=count,
    )


def _to_book_out(book: Book, count: int) -> BookOut:
    return BookOut(
        id=book.id,
        title=book.title,
        author=book.author,
        genre=book.genre,
        google_books_id=book.google_books_id,
        cover_url=book.cover_url,
        description_hint=book.description_hint,
        started_at=book.started_at,
        finished_at=book.finished_at,
        status=book.status,
        created_at=book.created_at,
        updated_at=book.updated_at,
        notes=[NoteSectionOut.model_validate(n) for n in book.notes],
        reading_day_count=count,
    )


@router.get("", response_model=list[BookListItem])
def list_books(db: Session = Depends(get_db)) -> list[BookListItem]:
    books = db.scalars(select(Book).order_by(Book.updated_at.desc())).all()
    counts = _reading_counts(db, [b.id for b in books])
    return [_to_list_item(b, counts.get(b.id, 0)) for b in books]


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(body: BookCreate, db: Session = Depends(get_db)) -> BookOut:
    book = Book(**body.model_dump())
    # Default note prompt sections (empty — hints only)
    book.notes = [
        NoteSection(kind="about", title="О чём книга", markdown="", sort_order=0),
        NoteSection(kind="message", title="Главный посыл", markdown="", sort_order=1),
        NoteSection(kind="characters", title="Основные герои", markdown="", sort_order=2),
    ]
    db.add(book)
    db.commit()
    db.refresh(book)
    book = db.scalars(
        select(Book).options(selectinload(Book.notes)).where(Book.id == book.id)
    ).one()
    return _to_book_out(book, 0)


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: str, db: Session = Depends(get_db)) -> BookOut:
    book = db.scalars(
        select(Book).options(selectinload(Book.notes)).where(Book.id == book_id)
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    counts = _reading_counts(db, [book.id])
    return _to_book_out(book, counts.get(book.id, 0))


@router.patch("/{book_id}", response_model=BookOut)
def update_book(book_id: str, body: BookUpdate, db: Session = Depends(get_db)) -> BookOut:
    book = db.scalars(
        select(Book).options(selectinload(Book.notes)).where(Book.id == book_id)
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(book, key, value)
    db.commit()
    db.refresh(book)
    counts = _reading_counts(db, [book.id])
    return _to_book_out(book, counts.get(book.id, 0))


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: str, db: Session = Depends(get_db)) -> None:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    db.delete(book)
    db.commit()


@router.get("/{book_id}/notes", response_model=list[NoteSectionOut])
def get_notes(book_id: str, db: Session = Depends(get_db)) -> list[NoteSection]:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    notes = db.scalars(
        select(NoteSection).where(NoteSection.book_id == book_id).order_by(NoteSection.sort_order)
    ).all()
    return list(notes)


@router.put("/{book_id}/notes", response_model=list[NoteSectionOut])
def replace_notes(
    book_id: str, body: NotesReplace, db: Session = Depends(get_db)
) -> list[NoteSection]:
    book = db.scalars(
        select(Book).options(selectinload(Book.notes)).where(Book.id == book_id)
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    book.notes.clear()
    db.flush()
    for idx, section in enumerate(body.sections):
        book.notes.append(
            NoteSection(
                kind=section.kind,
                title=section.title,
                markdown=section.markdown,
                sort_order=section.sort_order if section.sort_order else idx,
            )
        )
    db.commit()
    notes = db.scalars(
        select(NoteSection).where(NoteSection.book_id == book_id).order_by(NoteSection.sort_order)
    ).all()
    return list(notes)
