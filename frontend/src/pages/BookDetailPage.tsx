import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Book, BookStatus, NoteKind, NoteSection } from '../api/types'
import { SketchPage } from '../components/SketchPage'

const STATUS_LABEL: Record<string, string> = {
  reading: 'читаю',
  finished: 'прочитано',
  paused: 'на паузе',
  want: 'хочу прочитать',
}

const PROMPTS: { kind: NoteKind; title: string; hint: string }[] = [
  { kind: 'about', title: 'О чём книга', hint: 'Кратко сюжет или тема — по желанию' },
  { kind: 'message', title: 'Главный посыл', hint: 'Что хотел сказать автор — по желанию' },
  { kind: 'characters', title: 'Основные герои', hint: 'Кто запомнился — по желанию' },
]

function ensureSections(notes: NoteSection[]): NoteSection[] {
  const byKind = new Map(notes.map((n) => [n.kind, n]))
  const result: NoteSection[] = []
  PROMPTS.forEach((p, i) => {
    const existing = byKind.get(p.kind)
    result.push(
      existing ?? {
        id: `tmp-${p.kind}`,
        kind: p.kind,
        title: p.title,
        markdown: '',
        sort_order: i,
      },
    )
  })
  notes
    .filter((n) => n.kind === 'free' || !PROMPTS.some((p) => p.kind === n.kind))
    .forEach((n, i) => result.push({ ...n, sort_order: PROMPTS.length + i }))
  return result
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [sections, setSections] = useState<NoteSection[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [meta, setMeta] = useState({ title: '', author: '', genre: '', status: 'reading' as BookStatus })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .getBook(id)
      .then((b) => {
        setBook(b)
        setMeta({
          title: b.title,
          author: b.author,
          genre: b.genre,
          status: b.status as BookStatus,
        })
        const ensured = ensureSections(b.notes)
        setSections(ensured)
        setActiveId(ensured[0]?.id ?? '')
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ошибка'))
  }, [id])

  const active = sections.find((s) => s.id === activeId) ?? sections[0]

  async function saveMeta(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await api.updateBook(id, meta)
      setBook(updated)
      setMessage('Карточка обновлена')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes() {
    if (!id) return
    setSaving(true)
    setMessage(null)
    try {
      const payload = sections.map((s, i) => ({
        kind: s.kind as NoteKind,
        title: s.title,
        markdown: s.markdown,
        sort_order: i,
      }))
      const saved = await api.saveNotes(id, payload)
      const ensured = ensureSections(saved)
      setSections(ensured)
      setActiveId((prev) => ensured.find((s) => s.id === prev)?.id ?? ensured[0]?.id ?? '')
      setMessage('Заметки сохранены')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить заметки')
    } finally {
      setSaving(false)
    }
  }

  async function markToday() {
    if (!id) return
    try {
      await api.markToday(id)
      setMessage('Сегодняшний день отмечен ✦')
      const b = await api.getBook(id)
      setBook(b)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Уже отмечено или ошибка')
    }
  }

  async function removeBook() {
    if (!id || !confirm('Удалить книгу из дневника?')) return
    await api.deleteBook(id)
    navigate('/books')
  }

  function addFreeSection() {
    const next: NoteSection = {
      id: `tmp-free-${Date.now()}`,
      kind: 'free',
      title: 'Свободная заметка',
      markdown: '',
      sort_order: sections.length,
    }
    setSections([...sections, next])
    setActiveId(next.id)
  }

  if (error && !book) {
    return (
      <SketchPage title="Книга">
        <p className="text-ochre">{error}</p>
        <Link to="/books" className="text-sm font-medium text-cobalt underline">
          ← к полке
        </Link>
      </SketchPage>
    )
  }

  if (!book || !active) {
    return (
      <SketchPage title="Книга">
        <p className="text-base text-navy/60">Открываю страницу…</p>
      </SketchPage>
    )
  }

  return (
    <SketchPage
      title={book.title}
      subtitle={<p className="text-lg font-medium">{book.author || 'без автора'}</p>}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/books" className="text-sm font-medium text-cobalt underline">
          ← к полке
        </Link>
        <button
          type="button"
          onClick={markToday}
          className="border-2 border-gold bg-gold/80 px-3 py-1 text-sm font-semibold text-navy hover:bg-gold-soft"
        >
          Читаю сегодня ✦
        </button>
        <button
          type="button"
          onClick={removeBook}
          className="text-sm font-medium text-ochre underline"
        >
          удалить
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-6">
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt=""
            className="h-44 border-2 border-gold/50 object-cover shadow-[4px_6px_0_rgba(30,58,95,0.15)]"
          />
        )}
        <form onSubmit={saveMeta} className="min-w-[240px] flex-1 space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-navy">Название</span>
            <input
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy">Автор</span>
            <input
              value={meta.author}
              onChange={(e) => setMeta({ ...meta, author: e.target.value })}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy">Жанр</span>
            <input
              value={meta.genre}
              onChange={(e) => setMeta({ ...meta, genre: e.target.value })}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy">Статус</span>
            <select
              value={meta.status}
              onChange={(e) => setMeta({ ...meta, status: e.target.value as BookStatus })}
              className="mt-1 w-full border-2 border-navy/20 bg-paper px-2 py-1 outline-none focus:border-gold"
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-navy/50">Дней чтения: {book.reading_day_count}</p>
          <button
            type="submit"
            disabled={saving}
            className="border-2 border-navy bg-navy px-4 py-1.5 text-sm font-semibold text-gold-soft hover:bg-cobalt"
          >
            Сохранить карточку
          </button>
        </form>
      </div>

      <section>
        <h2 className="font-display text-3xl text-navy">Заметки</h2>
        <p className="mb-4 text-sm text-ochre">
          подсказки ниже — не обязательны, пишите как хочется
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {sections.map((s) => {
            const prompt = PROMPTS.find((p) => p.kind === s.kind)
            const label = prompt?.title || s.title || 'Свободная'
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={[
                  'border px-3 py-1 text-sm font-medium transition',
                  activeId === s.id
                    ? 'border-navy bg-navy text-gold-soft'
                    : 'border-dashed border-cobalt/50 text-cobalt hover:border-navy',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={addFreeSection}
            className="border border-dashed border-gold px-3 py-1 text-sm font-medium text-ochre"
          >
            + свободная
          </button>
        </div>

        {PROMPTS.find((p) => p.kind === active.kind) && (
          <p className="mb-2 text-sm italic text-navy/55">
            {PROMPTS.find((p) => p.kind === active.kind)?.hint}
          </p>
        )}

        <div data-color-mode="light" className="border-2 border-gold/40">
          <MDEditor
            value={active.markdown}
            height={320}
            onChange={(value) => {
              setSections((prev) =>
                prev.map((s) =>
                  s.id === active.id ? { ...s, markdown: value ?? '' } : s,
                ),
              )
            }}
            preview="edit"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveNotes}
            disabled={saving}
            className="border-2 border-navy bg-navy px-5 py-2 text-sm font-semibold text-gold-soft hover:bg-cobalt disabled:opacity-60"
          >
            {saving ? 'Сохраняю…' : 'Сохранить заметки'}
          </button>
          {(message || error) && (
            <span className={`text-sm ${error ? 'text-ochre' : 'text-cobalt'}`}>
              {error ?? message}
            </span>
          )}
        </div>
      </section>
    </SketchPage>
  )
}
