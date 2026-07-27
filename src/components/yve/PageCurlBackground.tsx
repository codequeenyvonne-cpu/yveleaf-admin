import type { ReactNode } from 'react'

/** Cream background with page-fold curves and gold sparkles — matches mobile app. */
export function PageCurlBackground({ children }: { children: ReactNode }) {
  return (
    <div className="bg-cream relative min-h-full overflow-hidden">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M55 0 Q85 10 100 22 L100 0 Z" fill="#f3ead5" fillOpacity="0.55" />
        <path
          d="M0 86 Q35 78 70 94 Q85 100 100 97 L100 100 L0 100 Z"
          fill="#f3ead5"
          fillOpacity="0.55"
        />
        <path
          d="M0 86 Q35 78 70 94"
          fill="none"
          stroke="#e3c878"
          strokeOpacity="0.8"
          strokeWidth="0.35"
        />
        <circle cx="12" cy="16" r="1.2" fill="#c9a227" fillOpacity="0.45" />
        <circle cx="88" cy="32" r="0.9" fill="#c9a227" fillOpacity="0.45" />
        <circle cx="18" cy="62" r="0.7" fill="#c9a227" fillOpacity="0.45" />
        <circle cx="82" cy="70" r="1" fill="#c9a227" fillOpacity="0.45" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
