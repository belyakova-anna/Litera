import type { ReactNode } from 'react'
import { EngravedFrame, SunFace } from './CelestialDecor'

export function SketchPage({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <article className="page-enter mx-auto w-full max-w-5xl">
      <div className="paper-grain relative overflow-hidden rounded-[2px] shadow-[8px_12px_0_rgba(30,58,95,0.18)]">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-4 bg-[repeating-linear-gradient(180deg,#e8a0b0_0_10px,#7eb6d9_10px_20px,#c9a227_20px_30px)] opacity-80"
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-2 top-8 z-20 opacity-90" aria-hidden>
          <SunFace size={48} />
        </div>
        <EngravedFrame>
          {(title || subtitle) && (
            <header className="mb-8 border-b border-dashed border-gold/50 pb-5">
              {title && (
                <h1 className="font-display text-4xl font-semibold tracking-wide text-navy sm:text-5xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="font-hand mt-2 text-2xl text-ochre">{subtitle}</p>
              )}
            </header>
          )}
          {children}
        </EngravedFrame>
      </div>
    </article>
  )
}
