import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { BookStatus, GoogleBookSuggestion } from '../api/types'
import { SketchPage } from '../components/SketchPage'

export function BookNewPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GoogleBookSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [googleId, setGoogleId] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [status, setStatus] = useState<BookStatus>('reading')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    const handle = window.setTimeout(async () => {
      setSearching(true)
      try {
        const items = await api.googleBooks(query.trim())
        setSuggestions(items)
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => window.clearTimeout(handle)
  }, [query])

  function applySuggestion(s: GoogleBookSuggestion) {
    setTitle(s.title)
    setAuthor(s.author)
    setGenre(s.genre)
    setCoverUrl(s.cover_url)
    setGoogleId(s.google_books_id)
    setDescription(s.description_hint)
    setQuery(s.title)
    setSuggestions([])
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const book = await api.createBook({
        title,
        author,
        genre,
        cover_url: coverUrl,
        google_books_id: googleId,
        description_hint: description,
        status,
        started_at: status === 'reading' ? new Date().toISOString().slice(0, 10) : null,
      })
      navigate(`/books/${book.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось создать')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SketchPage title="Новая запись">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="relative block">
          <span className="font-hand text-xl text-navy">Поиск книги</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Начните вводить название…"
            className="mt-1 w-full border-2 border-navy/20 bg-paper-deep/40 px-3 py-2 outline-none focus:border-gold"
          />
          {searching && (
            <span className="font-hand absolute right-3 top-10 text-ochre">ищу…</span>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto border-2 border-gold/60 bg-paper shadow-lg">
              {suggestions.map((s) => (
                <li key={s.google_books_id}>
                  <button
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="flex w-full gap-3 px-3 py-2 text-left hover:bg-cloud/50"
                  >
                    {s.cover_url ? (
                      <img src={s.cover_url} alt="" className="h-14 w-10 object-cover" />
                    ) : (
                      <div className="flex h-14 w-10 items-center justify-center bg-navy/10 text-gold">
                        ✦
                      </div>
                    )}
                    <span>
                      <span className="block font-display text-lg text-navy">{s.title}</span>
                      <span className="block text-sm text-ink/60">{s.author}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="font-hand text-xl text-navy">Название</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent px-1 py-1 outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="font-hand text-xl text-navy">Автор</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent px-1 py-1 outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="font-hand text-xl text-navy">Жанр</span>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent px-1 py-1 outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="font-hand text-xl text-navy">Статус</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
              className="mt-1 w-full border-2 border-navy/20 bg-paper px-2 py-2 outline-none focus:border-gold"
            >
              <option value="reading">читаю</option>
              <option value="finished">прочитано</option>
              <option value="paused">на паузе</option>
              <option value="want">хочу прочитать</option>
            </select>
          </label>
          {coverUrl && (
            <div className="flex items-end">
              <img
                src={coverUrl}
                alt=""
                className="h-28 border border-gold/50 object-cover shadow-md"
              />
            </div>
          )}
        </div>

        {error && <p className="text-ochre">{error}</p>}

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="border-2 border-navy bg-navy px-5 py-2 font-display text-lg text-gold-soft hover:bg-cobalt disabled:opacity-60"
        >
          {saving ? 'Сохраняю…' : 'Добавить в дневник'}
        </button>
      </form>
    </SketchPage>
  )
}
