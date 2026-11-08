from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_login
from app.models import Book, ReadingDay
from app.schemas import ActivityDay, BookListItem, ReadingActivityOut, ReadingDayCreate, ReadingDayOut

router = APIRouter(tags=["reading"], dependencies=[Depends(require_login)])


def _day_out(rd: ReadingDay, title: str | None = None) -> ReadingDayOut:
    return ReadingDayOut(
        id=rd.id,
        book_id=rd.book_id,
        day=rd.day,
        note_optional=rd.note_optional,
        book_title=title,
    )


@router.get("/api/books/{book_id}/reading-days", response_model=list[ReadingDayOut])
def list_reading_days(book_id: str, db: Session = Depends(get_db)) -> list[ReadingDayOut]:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    days = db.scalars(
        select(ReadingDay).where(ReadingDay.book_id == book_id).order_by(ReadingDay.day.desc())
    ).all()
    return [_day_out(d, book.title) for d in days]


@router.post(
    "/api/books/{book_id}/reading-days",
    response_model=ReadingDayOut,
    status_code=status.HTTP_201_CREATED,
)
def add_reading_day(
    book_id: str, body: ReadingDayCreate, db: Session = Depends(get_db)
) -> ReadingDayOut:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    day = body.day or date.today()
    rd = ReadingDay(book_id=book_id, day=day, note_optional=body.note_optional)
    db.add(rd)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Этот день уже отмечен для этой книги",
        ) from None
    db.refresh(rd)
    return _day_out(rd, book.title)


@router.post(
    "/api/books/{book_id}/reading-days/today",
    response_model=ReadingDayOut,
    status_code=status.HTTP_201_CREATED,
)
def mark_today(book_id: str, db: Session = Depends(get_db)) -> ReadingDayOut:
    return add_reading_day(book_id, ReadingDayCreate(day=date.today()), db)


@router.delete("/api/reading-days/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reading_day(day_id: str, db: Session = Depends(get_db)) -> None:
    rd = db.get(ReadingDay, day_id)
    if not rd:
        raise HTTPException(status_code=404, detail="Отметка не найдена")
    db.delete(rd)
    db.commit()


@router.get("/api/reading-activity", response_model=ReadingActivityOut)
def reading_activity(
    year: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> ReadingActivityOut:
    target_year = year or date.today().year
    start = date(target_year, 1, 1)
    end = date(target_year, 12, 31)

    rows = db.execute(
        select(ReadingDay.day, func.count(ReadingDay.id))
        .where(ReadingDay.day >= start, ReadingDay.day <= end)
        .group_by(ReadingDay.day)
        .order_by(ReadingDay.day)
    ).all()

    day_counts = {d: c for d, c in rows}
    if not day_counts:
        return ReadingActivityOut(year=target_year, days=[])

    # Load books per day
    day_books: dict[date, list[Book]] = {d: [] for d in day_counts}
    reading_rows = db.execute(
        select(ReadingDay, Book)
        .join(Book, Book.id == ReadingDay.book_id)
        .where(ReadingDay.day >= start, ReadingDay.day <= end)
        .order_by(ReadingDay.day)
    ).all()

    counts_cache: dict[str, int] = {}
    for rd, book in reading_rows:
        day_books.setdefault(rd.day, []).append(book)

    activity: list[ActivityDay] = []
    for day, count in sorted(day_counts.items()):
        books = []
        for book in day_books.get(day, []):
            if book.id not in counts_cache:
                counts_cache[book.id] = (
                    db.scalar(
                        select(func.count(ReadingDay.id)).where(ReadingDay.book_id == book.id)
                    )
                    or 0
                )
            books.append(
                BookListItem(
                    id=book.id,
                    title=book.title,
                    author=book.author,
                    genre=book.genre,
                    cover_url=book.cover_url,
                    status=book.status,
                    started_at=book.started_at,
                    finished_at=book.finished_at,
                    created_at=book.created_at,
                    reading_day_count=counts_cache[book.id],
                )
            )
        activity.append(ActivityDay(day=day, count=count, books=books))

    return ReadingActivityOut(year=target_year, days=activity)
