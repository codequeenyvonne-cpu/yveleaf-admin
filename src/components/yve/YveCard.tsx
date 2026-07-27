import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function YveCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`yve-card ${className}`}>{children}</div>
}

export function YveFeatureCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <YveCard className="flex items-start gap-3.5 p-3.5">
      <div className="bg-cream-deep flex size-12 shrink-0 items-center justify-center rounded-full">
        <Icon className="text-forest size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-ink text-[16.5px] font-bold">{title}</p>
        <p className="text-ink-soft mt-0.5 text-[13px] leading-relaxed">{subtitle}</p>
        {children}
      </div>
      <LeafCorner />
    </YveCard>
  )
}

function LeafCorner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="text-leaf-soft size-[18px] shrink-0 -rotate-[22deg] opacity-80"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 2C8 8 6 12 6 16c0 2.2 1.8 4 4 4 1.2 0 2.3-.5 3-1.4 1.4 1.8 3.6 2.9 6 2.9 4.4 0 8-3.6 8-8 0-6-6-12-15-14z"
      />
    </svg>
  )
}

export function YveStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number | string
}) {
  return (
    <YveCard className="p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(27,67,50,0.08)]">
      <div className="bg-forest/5 text-forest mb-4 inline-flex rounded-xl p-3">
        <Icon className="size-5" />
      </div>
      <p className="text-ink-soft text-sm">{label}</p>
      <p className="font-display mt-1 text-3xl">{value}</p>
    </YveCard>
  )
}
