import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { Crescent, StarBurst } from './CelestialDecor'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'text-base font-medium tracking-wide transition-colors',
    isActive ? 'text-gold-soft underline decoration-wavy underline-offset-4' : 'text-cloud/90 hover:text-gold-soft',
  ].join(' ')

export function Layout({ onLogout }: { onLogout: () => void }) {
  const { pathname } = useLocation()
  const onNewBook = pathname === '/books/new'

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b-2 border-gold/60 bg-navy text-paper shadow-[0_6px_0_rgba(201,162,39,0.35)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 10% 20%, #e0c86a 50%, transparent), radial-gradient(1.5px 1.5px at 30% 70%, #f7f0e4 50%, transparent), radial-gradient(1px 1px at 70% 30%, #e0c86a 50%, transparent), radial-gradient(1px 1px at 85% 60%, #f7f0e4 50%, transparent), radial-gradient(1.5px 1.5px at 50% 40%, #c9a227 50%, transparent)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <NavLink to="/" className="group flex items-center gap-2">
            <StarBurst size={26} twinkle />
            <span className="font-display text-3xl font-bold tracking-[0.08em] text-gold-soft group-hover:text-paper">
              Litera
            </span>
            <Crescent size={22} />
          </NavLink>
          <nav className="flex flex-wrap items-center gap-5">
            <NavLink to="/" end className={linkClass}>
              Профиль
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) => linkClass({ isActive: isActive && !onNewBook })}
            >
              Книги
            </NavLink>
            <NavLink to="/books/new" className={linkClass}>
              Новая запись
            </NavLink>
            <button
              type="button"
              className="text-sm font-medium text-rose/90 hover:text-rose"
              onClick={async () => {
                await api.logout()
                onLogout()
              }}
            >
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <main className="px-3 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="pb-8 text-center">
        <p className="font-script text-2xl text-navy/70">✦ бумажный скетчбук среди звёзд ✦</p>
      </footer>
    </div>
  )
}
