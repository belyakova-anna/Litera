export type BookStatus = 'reading' | 'finished' | 'paused' | 'want'
export type NoteKind = 'about' | 'message' | 'characters' | 'free'

export interface Profile {
  display_name: string
  favorite_genre: string
  favorite_book: string
  favorite_character: string
  bio: string
  updated_at?: string | null
}

export interface NoteSection {
  id: string
  kind: NoteKind | string
  title: string
  markdown: string
  sort_order: number
}

export interface BookListItem {
  id: string
  title: string
  author: string
  genre: string
  cover_url: string | null
  status: BookStatus | string
  started_at: string | null
  finished_at: string | null
  created_at: string
  reading_day_count: number
}

export interface Book extends BookListItem {
  google_books_id: string | null
  description_hint: string | null
  updated_at: string
  notes: NoteSection[]
}

export interface ReadingDay {
  id: string
  book_id: string
  day: string
  note_optional: string | null
  book_title?: string | null
}

export interface ActivityDay {
  day: string
  count: number
  books: BookListItem[]
}

export interface ReadingActivity {
  year: number
  days: ActivityDay[]
}

export interface GoogleBookSuggestion {
  google_books_id: string
  title: string
  author: string
  genre: string
  cover_url: string | null
  description_hint: string | null
}

export interface BookCreate {
  title: string
  author?: string
  genre?: string
  google_books_id?: string | null
  cover_url?: string | null
  description_hint?: string | null
  started_at?: string | null
  finished_at?: string | null
  status?: BookStatus
}
