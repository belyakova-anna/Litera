import { Link } from 'react-router-dom'
import type { BookListItem } from '../api/types'

const STATUS: Record<string, string> = {
  reading: 'читаю',
  finished: 'прочитано',
  paused: 'на паузе',
  want: 'хочу прочитать',
}

const ROTATIONS = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0']

export function BookSticker({ book, index = 0 }: { book: BookListItem; index?: number }) {
  const tilt = ROTATIONS[index % ROTATIONS.length]
  return (
    <Link
      to={`/books/${book.id}`}
      className={`sticker-tilt paper-grain block border-2 border-navy/30 p-3 shadow-[4px_5px_0_rgba(30,58,95,0.15)] ${tilt}`}
    >
      <div className="flex gap-3">
        <div className="h-28 w-20 shrink-0 overflow-hidden border border-gold/50 bg-cloud/40">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-navy/10 font-display text-2xl text-gold">
              ✦
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-semibold leading-tight text-navy">
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-ink/70">{book.author || 'Автор неизвестен'}</p>
          {book.genre && (
            <p className="mt-1 text-sm font-medium text-ochre">{book.genre}</p>
          )}
          <p className="mt-2 inline-block border border-dashed border-cobalt/40 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-cobalt">
            {STATUS[book.status] ?? book.status}
          </p>
          <p className="mt-2 text-xs text-navy/50">
            дней чтения: {book.reading_day_count}
          </p>
        </div>
      </div>
    </Link>
  )
}
