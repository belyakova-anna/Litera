from __future__ import annotations

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class BookStatus(str, enum.Enum):
    reading = "reading"
    finished = "finished"
    paused = "paused"
    want = "want"


class NoteKind(str, enum.Enum):
    about = "about"
    message = "message"
    characters = "characters"
    free = "free"


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    display_name: Mapped[str] = mapped_column(String(120), default="Читатель")
    favorite_genre: Mapped[str] = mapped_column(String(120), default="")
    favorite_book: Mapped[str] = mapped_column(String(255), default="")
    favorite_character: Mapped[str] = mapped_column(String(255), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Book(Base):
    __tablename__ = "books"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    author: Mapped[str] = mapped_column(String(500), default="")
    genre: Mapped[str] = mapped_column(String(200), default="")
    google_books_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    description_hint: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    finished_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default=BookStatus.reading.value)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    notes: Mapped[list[NoteSection]] = relationship(
        back_populates="book", cascade="all, delete-orphan", order_by="NoteSection.sort_order"
    )
    reading_days: Mapped[list[ReadingDay]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )


class NoteSection(Base):
    __tablename__ = "note_sections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    book_id: Mapped[str] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(32), default=NoteKind.free.value)
    title: Mapped[str] = mapped_column(String(200), default="")
    markdown: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(default=0)

    book: Mapped[Book] = relationship(back_populates="notes")


class ReadingDay(Base):
    __tablename__ = "reading_days"
    __table_args__ = (UniqueConstraint("book_id", "day", name="uq_book_day"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    book_id: Mapped[str] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), index=True)
    day: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    note_optional: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    book: Mapped[Book] = relationship(back_populates="reading_days")
