import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import type { BookListItem, Profile, ReadingActivity } from '../api/types'
import { ReadingHeatmap } from '../components/ReadingHeatmap'
import { SketchPage } from '../components/SketchPage'
import { StarBurst } from '../components/CelestialDecor'

const FIELDS = [
  ['display_name', 'Имя'],
  ['favorite_genre', 'Любимый жанр'],
  ['favorite_book', 'Любимая книга'],
  ['favorite_character', 'Любимый персонаж'],
] as const

function emptyLabel(value: string) {
  return value.trim() ? value : 'ещё не указано'
}

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [draft, setDraft] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [activity, setActivity] = useState<ReadingActivity | null>(null)
  const [books, setBooks] = useState<BookListItem[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [markBookId, setMarkBookId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load(y = year) {
    const [p, a, b] = await Promise.all([
      api.getProfile(),
      api.readingActivity(y),
      api.listBooks(),
    ])
    setProfile(p)
    setDraft(p)
    setActivity(a)
    setBooks(b)
    if (!markBookId && b.length) {
      const reading = b.find((x) => x.status === 'reading') ?? b[0]
      setMarkBookId(reading.id)
    }
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof ApiError ? err.message : 'Ошибка загрузки'),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit() {
    if (!profile) return
    setDraft(profile)
    setMessage(null)
    setError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setDraft(profile)
    setMessage(null)
    setError(null)
    setEditing(false)
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const updated = await api.updateProfile(draft)
      setProfile(updated)
      setDraft(updated)
      setEditing(false)
      setMessage('Профиль сохранён')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  async function markToday() {
    if (!markBookId) return
    setMessage(null)
    setError(null)
    try {
      await api.markToday(markBookId)
      const a = await api.readingActivity(year)
      setActivity(a)
      setMessage('День отмечен — вы сегодня читали ✦')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось отметить день')
    }
  }

  async function changeYear(next: number) {
    setYear(next)
    const a = await api.readingActivity(next)
    setActivity(a)
  }

  if (error && !profile) {
    return (
      <SketchPage title="Профиль">
        <p className="text-ochre">{error}</p>
      </SketchPage>
    )
  }

  if (!profile || !draft || !activity) {
    return (
      <SketchPage title="Профиль">
        <p className="text-base text-navy/60">Листаю дневник…</p>
      </SketchPage>
    )
  }

  const shown = editing ? draft : profile

  return (
    <SketchPage
      title={shown.display_name || 'Читатель'}
      subtitle={
        editing ? (
          <p className="text-sm font-medium">редактирование профиля</p>
        ) : (
          <p className="font-script text-2xl">профиль среди созвездий</p>
        )
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy/70">
          {editing ? 'режим правки' : 'режим просмотра'}
        </p>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="border-2 border-navy bg-navy px-4 py-1.5 text-sm font-semibold text-gold-soft hover:bg-cobalt"
          >
            Редактировать
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm font-medium text-ochre underline"
          >
            Отменить
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={onSave} className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-sm font-semibold text-navy">{label}</span>
              <input
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="mt-1 w-full border-b-2 border-navy/20 bg-transparent px-1 py-1 outline-none focus:border-gold"
              />
            </label>
          ))}
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-navy">О себе</span>
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              rows={3}
              className="mt-1 w-full border-2 border-dashed border-navy/20 bg-paper-deep/30 px-3 py-2 outline-none focus:border-gold"
            />
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="border-2 border-navy bg-navy px-5 py-2 text-sm font-semibold text-gold-soft hover:bg-cobalt disabled:opacity-60"
            >
              {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="border-2 border-navy/30 px-5 py-2 text-sm font-semibold text-navy hover:border-navy"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {FIELDS.map(([key, label]) => (
            <div key={key} className="border-b border-dashed border-gold/40 pb-3">
              <p className="text-sm font-medium text-navy/70">{label}</p>
              <p
                className={[
                  'mt-1 text-lg text-navy',
                  profile[key].trim() ? '' : 'italic text-navy/40',
                ].join(' ')}
              >
                {emptyLabel(profile[key])}
              </p>
            </div>
          ))}
          <div className="sm:col-span-2 border border-dashed border-ochre/40 bg-paper-deep/30 p-4">
            <p className="text-sm font-medium text-navy/70">О себе</p>
            <p
              className={[
                'mt-2 whitespace-pre-wrap leading-relaxed text-ink',
                profile.bio.trim() ? '' : 'italic text-navy/40',
              ].join(' ')}
            >
              {emptyLabel(profile.bio)}
            </p>
          </div>
        </div>
      )}

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display flex items-center gap-2 text-3xl text-navy">
              <StarBurst size={24} /> Частота чтения
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="border border-navy/30 px-2 py-1 text-sm"
              onClick={() => changeYear(year - 1)}
            >
              ←
            </button>
            <span className="text-lg font-semibold text-navy">{year}</span>
            <button
              type="button"
              className="border border-navy/30 px-2 py-1 text-sm"
              onClick={() => changeYear(year + 1)}
            >
              →
            </button>
          </div>
        </div>

        <ReadingHeatmap year={year} days={activity.days} />

        <div className="mt-6 flex flex-wrap items-end gap-3 border border-dashed border-gold/50 bg-cloud/30 p-4">
          <label className="min-w-[200px] flex-1">
            <span className="text-sm font-semibold text-navy">Читаю сегодня</span>
            <select
              value={markBookId}
              onChange={(e) => setMarkBookId(e.target.value)}
              className="mt-1 w-full border-2 border-navy/20 bg-paper px-2 py-2 outline-none focus:border-gold"
            >
              {books.length === 0 && <option value="">Сначала добавьте книгу</option>}
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={markToday}
            disabled={!markBookId}
            className="border-2 border-gold bg-gold/90 px-4 py-2 text-sm font-semibold text-navy hover:bg-gold-soft disabled:opacity-50"
          >
            Отметить день ✦
          </button>
        </div>

        {(message || error) && (
          <p className={`mt-3 text-sm ${error ? 'text-ochre' : 'text-cobalt'}`}>
            {error ?? message}
          </p>
        )}
      </section>
    </SketchPage>
  )
}
