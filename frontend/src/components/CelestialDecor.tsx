import type { ReactNode } from 'react'

export function StarBurst({
  className = '',
  size = 28,
  delay = false,
}: {
  className?: string
  size?: number
  delay?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`twinkle ${delay ? 'twinkle-delay' : ''} ${className}`}
      aria-hidden
    >
      <path
        d="M32 2 L35 26 L58 18 L38 32 L58 46 L35 38 L32 62 L29 38 L6 46 L26 32 L6 18 L29 26 Z"
        fill="#c9a227"
        stroke="#1e3a5f"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="32" r="4" fill="#f7f0e4" stroke="#1e3a5f" strokeWidth="0.8" />
    </svg>
  )
}

export function Crescent({
  className = '',
  size = 34,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <path
        d="M40 8 C22 10 12 28 18 44 C22 54 32 60 44 58 C28 56 20 40 26 24 C30 16 36 10 40 8 Z"
        fill="#e0c86a"
        stroke="#1e3a5f"
        strokeWidth="1.4"
      />
      <circle cx="42" cy="28" r="1.5" fill="#1e3a5f" />
      <circle cx="46" cy="36" r="1" fill="#1e3a5f" />
      <path
        d="M38 40 Q44 44 48 40"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SunFace({
  className = '',
  size = 40,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      aria-hidden
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="40"
          y1="8"
          x2="40"
          y2="16"
          stroke="#c9a227"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      <circle cx="40" cy="40" r="18" fill="#e0c86a" stroke="#1e3a5f" strokeWidth="1.5" />
      <circle cx="33" cy="37" r="1.8" fill="#1e3a5f" />
      <circle cx="47" cy="37" r="1.8" fill="#1e3a5f" />
      <path
        d="M33 46 Q40 52 47 46"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EngravedFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            x="1.2"
            y="1.2"
            width="97.6"
            height="97.6"
            fill="none"
            stroke="#c9a227"
            strokeWidth="0.7"
            rx="0.4"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x="2.4"
            y="2.4"
            width="95.2"
            height="95.2"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="0.35"
            rx="0.3"
            opacity="0.55"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute left-3 top-3">
          <StarBurst size={22} />
        </div>
        <div className="absolute right-3 top-3">
          <Crescent size={24} />
        </div>
        <div className="absolute bottom-3 left-3">
          <Crescent size={20} className="-scale-x-100" />
        </div>
        <div className="absolute bottom-3 right-3">
          <StarBurst size={22} delay />
        </div>
      </div>
      <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-12">{children}</div>
    </div>
  )
}
