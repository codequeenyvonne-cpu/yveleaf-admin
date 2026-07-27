import type { AccessLevel, NovelStatus } from '../lib/types'

const styles: Record<AccessLevel | NovelStatus, string> = {
  offline: 'bg-leaf/15 text-leaf',
  online: 'bg-forest/10 text-forest',
  premium: 'bg-gold/25 text-forest',
  draft: 'bg-cream-deep text-ink-soft',
  published: 'bg-leaf/15 text-leaf',
  archived: 'bg-burgundy/10 text-burgundy',
}

export function Badge({
  label,
  kind,
}: {
  label: string
  kind: AccessLevel | NovelStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${styles[kind]}`}
    >
      {label}
    </span>
  )
}
