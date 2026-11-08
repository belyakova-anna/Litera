import { useMemo, useState } from 'react'
import type { ActivityDay, BookListItem } from '../api/types'
import { Link } from 'react-router-dom'

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function levelClass(count: number): string {
  if (count <= 0) return 'bg-cloud/60'
  if (count === 1) return 'bg-sky/70'
  if (count === 2) return 'bg-cobalt/70'
  if (count === 3) return 'bg-navy/80'
  return 'bg-gold'
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function ReadingHeatmap({
  year,
  days,
}: {
  year: number
  days: ActivityDay[]
}) {
  const byDay = useMemo(() => {
    const map = new Map<string, ActivityDay>()
    for (const d of days) map.set(d.day, d)
    return map
  }, [days])

  const [selected, setSelected] = useState<ActivityDay | null>(null)

  const { weeks, monthLabels } = useMemo(() => {
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)
    let cursor = startOfWeekMonday(yearStart)
    const end = startOfWeekMonday(yearEnd)
    end.setDate(end.getDate() + 7)

    const weeksArr: Date[][] = []
    const labels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    let weekIndex = 0

    while (cursor < end) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        const cell = new Date(cursor)
        cell.setDate(cursor.getDate() + i)
        week.push(cell)
      }
      const mid = week[3]
      if (mid.getFullYear() === year && mid.getMonth() !== lastMonth) {
        lastMonth = mid.getMonth()
        labels.push({
          weekIndex,
          label: mid.toLocaleString('ru-RU', { month: 'short' }),
        })
      }
      weeksArr.push(week)
      cursor.setDate(cursor.getDate() + 7)
      weekIndex++
    }

    return { weeks: weeksArr, monthLabels: labels }
  }, [year])

  const gridStyle = {
    gridTemplateColumns: `1.75rem repeat(${weeks.length}, minmax(0, 1fr))`,
  }

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[36rem] w-full">
          <div className="mb-1 grid gap-[3px]" style={gridStyle}>
            <div />
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi)
              return (
                <div
                  key={wi}
                  className="overflow-hidden text-[10px] leading-none text-navy/60"
                >
                  {label?.label ?? ''}
                </div>
              )
            })}
          </div>

          <div className="grid gap-[3px]" style={gridStyle}>
            {WEEKDAYS.map((day, di) => (
              <div key={day} className="contents">
                <div className="flex items-center text-[10px] leading-none text-navy/55">
                  {di % 2 === 0 ? day : ''}
                </div>
                {weeks.map((week, wi) => {
                  const cell = week[di]
                  const iso = toIso(cell)
                  const inYear = cell.getFullYear() === year
                  const activity = byDay.get(iso)
                  const count = activity?.count ?? 0
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!inYear}
                      title={inYear ? `${iso}: ${count}` : undefined}
                      onClick={() => {
                        if (activity) setSelected(activity)
                        else setSelected(null)
                      }}
                      className={[
                        'aspect-square w-full rounded-[2px] border border-navy/15',
                        inYear ? levelClass(count) : 'border-transparent bg-transparent',
                        inYear && count > 0 ? 'cursor-pointer hover:ring-1 hover:ring-gold' : '',
                      ].join(' ')}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-navy/70">
            <span>меньше</span>
            {[0, 1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`inline-block h-3 w-3 rounded-[2px] border border-navy/15 ${levelClass(n)}`}
              />
            ))}
            <span>больше</span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-5 border border-dashed border-ochre/60 bg-paper-deep/50 p-4">
          <p className="text-sm font-medium text-navy">
            {parseDay(selected.day).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' — '}
            {selected.count}{' '}
            {selected.count === 1 ? 'книга' : selected.count < 5 ? 'книги' : 'книг'}
          </p>
          <ul className="mt-2 space-y-1">
            {selected.books.map((b: BookListItem) => (
              <li key={b.id}>
                <Link
                  to={`/books/${b.id}`}
                  className="text-cobalt underline decoration-dotted underline-offset-2 hover:text-navy"
                >
                  {b.title}
                  {b.author ? ` — ${b.author}` : ''}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
