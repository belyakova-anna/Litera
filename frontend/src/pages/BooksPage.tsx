import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { BookListItem } from '../api/types'
import { BookSticker } from '../components/BookSticker'
import { SketchPage } from '../components/SketchPage'

export function BooksPage() {
  const [books, setBooks] = useState<BookListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .listBooks()
      .then(setBooks)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SketchPage
      title="Полки дневника"
      subtitle={<p className="font-script text-2xl">наклейки прочитанного и читаемого</p>}
    >
      <div className="mb-6">
        <Link
          to="/books/new"
          className="inline-block border-2 border-navy bg-navy px-4 py-2 text-sm font-semibold text-gold-soft hover:bg-cobalt"
        >
          + Новая книга
        </Link>
      </div>

      {loading && <p className="text-base text-navy/60">Собираю полку…</p>}
      {error && <p className="text-ochre">{error}</p>}

      {!loading && books.length === 0 && (
        <div className="border border-dashed border-ochre/50 p-8 text-center">
          <p className="font-display text-2xl text-navy">Пока пусто</p>
          <p className="font-script mt-2 text-2xl text-ochre">
            Добавьте первую книгу — и звёзды зажгутся на трекере
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {books.map((book, i) => (
          <BookSticker key={book.id} book={book} index={i} />
        ))}
      </div>
    </SketchPage>
  )
}
