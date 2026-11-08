from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

BookStatus = Literal["reading", "finished", "paused", "want"]
NoteKind = Literal["about", "message", "characters", "free"]


class LoginRequest(BaseModel):
    password: str


class AuthMe(BaseModel):
    authenticated: bool


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str
    favorite_genre: str
    favorite_book: str
    favorite_character: str
    bio: str
    updated_at: datetime | None = None


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    favorite_genre: str | None = None
    favorite_book: str | None = None
    favorite_character: str | None = None
    bio: str | None = None


class NoteSectionIn(BaseModel):
    id: str | None = None
    kind: NoteKind = "free"
    title: str = ""
    markdown: str = ""
    sort_order: int = 0


class NoteSectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    title: str
    markdown: str
    sort_order: int


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    author: str = ""
    genre: str = ""
    google_books_id: str | None = None
    cover_url: str | None = None
    description_hint: str | None = None
    started_at: date | None = None
    finished_at: date | None = None
    status: BookStatus = "reading"


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    author: str | None = None
    genre: str | None = None
    google_books_id: str | None = None
    cover_url: str | None = None
    description_hint: str | None = None
    started_at: date | None = None
    finished_at: date | None = None
    status: BookStatus | None = None


class BookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    author: str
    genre: str
    google_books_id: str | None
    cover_url: str | None
    description_hint: str | None
    started_at: date | None
    finished_at: date | None
    status: str
    created_at: datetime
    updated_at: datetime
    notes: list[NoteSectionOut] = []
    reading_day_count: int = 0


class BookListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    author: str
    genre: str
    cover_url: str | None
    status: str
    started_at: date | None
    finished_at: date | None
    created_at: datetime
    reading_day_count: int = 0


class NotesReplace(BaseModel):
    sections: list[NoteSectionIn]


class ReadingDayCreate(BaseModel):
    day: date | None = None
    note_optional: str | None = None


class ReadingDayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    book_id: str
    day: date
    note_optional: str | None
    book_title: str | None = None


class ActivityDay(BaseModel):
    day: date
    count: int
    books: list[BookListItem] = []


class ReadingActivityOut(BaseModel):
    year: int
    days: list[ActivityDay]


class GoogleBookSuggestion(BaseModel):
    google_books_id: str
    title: str
    author: str
    genre: str
    cover_url: str | None
    description_hint: str | None
