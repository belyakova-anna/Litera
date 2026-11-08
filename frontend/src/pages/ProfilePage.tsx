import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import type { BookListItem, Profile, ReadingActivity } from '../api/types'
import { ReadingHeatmap } from '../components/ReadingHeatmap'
import { SketchPage } from '../components/SketchPage'
import { StarBurst } from '../components/CelestialDecor'

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [draft, setDraft] = useState<Profile | null>(null)
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

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await api.updateProfile(draft)
      setProfile(updated)
      setDraft(updated)
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

  if (!draft || !activity) {
    return (
      <SketchPage title="Профиль">
        <p className="font-hand text-2xl text-navy/60">Листаю дневник…</p>
      </SketchPage>
    )
  }

  return (
    <SketchPage
      title={draft.display_name || 'Читатель'}
      subtitle="профиль среди созвездий"
    >
      <form onSubmit={onSave} className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ['display_name', 'Имя'],
            ['favorite_genre', 'Любимый жанр'],
            ['favorite_book', 'Любимая книга'],
            ['favorite_character', 'Любимый персонаж'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="font-hand text-xl text-navy">{label}</span>
            <input
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="mt-1 w-full border-b-2 border-navy/20 bg-transparent px-1 py-1 outline-none focus:border-gold"
            />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="font-hand text-xl text-navy">О себе</span>
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            rows={3}
            className="mt-1 w-full border-2 border-dashed border-navy/20 bg-paper-deep/30 px-3 py-2 outline-none focus:border-gold"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="border-2 border-navy bg-navy px-5 py-2 font-display text-lg text-gold-soft hover:bg-cobalt disabled:opacity-60"
          >
            {saving ? 'Сохраняю…' : 'Сохранить профиль'}
          </button>
        </div>
      </form>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display flex items-center gap-2 text-3xl text-navy">
              <StarBurst size={24} /> Частота чтения
            </h2>
            <p className="font-hand text-lg text-ochre">
              как вклад в GitHub — только звёзды вместо коммитов
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="border border-navy/30 px-2 py-1 font-hand text-lg"
              onClick={() => changeYear(year - 1)}
            >
              ←
            </button>
            <span className="font-display text-xl text-navy">{year}</span>
            <button
              type="button"
              className="border border-navy/30 px-2 py-1 font-hand text-lg"
              onClick={() => changeYear(year + 1)}
            >
              →
            </button>
          </div>
        </div>

        <ReadingHeatmap year={year} days={activity.days} />

        <div className="mt-6 flex flex-wrap items-end gap-3 border border-dashed border-gold/50 bg-cloud/30 p-4">
          <label className="min-w-[200px] flex-1">
            <span className="font-hand text-xl text-navy">Читаю сегодня</span>
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
            className="border-2 border-gold bg-gold/90 px-4 py-2 font-display text-lg text-navy hover:bg-gold-soft disabled:opacity-50"
          >
            Отметить день ✦
          </button>
        </div>

        {(message || error) && (
          <p className={`mt-3 font-hand text-xl ${error ? 'text-ochre' : 'text-cobalt'}`}>
            {error ?? message}
          </p>
        )}
      </section>
    </SketchPage>
  )
}
