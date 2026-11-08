import { useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { Crescent, StarBurst, SunFace } from '../components/CelestialDecor'

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.login(password)
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="page-enter paper-grain relative w-full max-w-md border-2 border-gold/70 p-8 shadow-[10px_12px_0_rgba(30,58,95,0.2)]">
        <div className="absolute -left-3 -top-3">
          <StarBurst size={36} />
        </div>
        <div className="absolute -right-2 top-6">
          <Crescent size={32} />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <SunFace size={42} />
        </div>

        <h1 className="font-display text-center text-5xl font-bold tracking-[0.12em] text-navy">
          Litera
        </h1>
        <p className="font-hand mt-2 text-center text-2xl text-ochre">
          вход в читательский дневник
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="font-hand text-xl text-navy">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border-2 border-navy/25 bg-paper-deep/40 px-3 py-2 font-body outline-none focus:border-gold"
              autoFocus
              required
            />
          </label>
          {error && <p className="text-sm text-ochre">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-navy bg-navy px-4 py-2 font-display text-xl tracking-wide text-gold-soft transition hover:bg-cobalt disabled:opacity-60"
          >
            {loading ? 'Открываю…' : 'Открыть дневник'}
          </button>
        </form>
      </div>
    </div>
  )
}
