import { useEffect, useState } from 'react'
import { BookOpen, Crown, Globe, Wifi } from 'lucide-react'
import { fetchAdminNovels } from '../lib/api'
import { loadSession } from '../lib/auth'
import { BRAND, IMAGES } from '../lib/brand'
import type { Novel } from '../lib/types'
import { Badge } from '../components/Badge'
import { BrandHeader } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { YveCard, YveStatCard } from '../components/yve/YveCard'

function countBy<T extends string>(items: Novel[], pick: (n: Novel) => T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = pick(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

export function DashboardPage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const session = loadSession()
    if (!session) return
    fetchAdminNovels(session.idToken)
      .then(setNovels)
      .catch((e: Error) => setError(e.message))
  }, [])

  const published = novels.filter((n) => n.status === 'published').length
  const access = countBy(novels, (n) => n.access_level)

  const cards = [
    { label: 'Total novels', value: novels.length, icon: BookOpen },
    { label: 'Published', value: published, icon: Globe },
    { label: 'Offline access', value: access.offline ?? 0, icon: Wifi },
    { label: 'Premium', value: access.premium ?? 0, icon: Crown },
  ]

  return (
    <div className="space-y-8">
      <FadeSlideIn>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <BrandHeader
            compact
            title="Dashboard"
            subtitle={`Manage ${BRAND.name} novels, access levels, and publishing.`}
            showTagline
          />
          <img
            src={IMAGES.bookshelf}
            alt=""
            className="mx-auto max-h-32 w-auto object-contain sm:max-h-36 lg:mx-0 lg:max-h-44"
            aria-hidden
          />
        </div>
      </FadeSlideIn>

      {error && (
        <div className="border-burgundy/20 bg-burgundy/5 text-burgundy rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon }, i) => (
          <FadeSlideIn key={label} delay={100 + i * 80}>
            <YveStatCard icon={icon} label={label} value={value} />
          </FadeSlideIn>
        ))}
      </div>

      <FadeSlideIn delay={450}>
        <YveCard className="p-5">
          <h2 className="font-display text-xl">Recent novels</h2>
          <div className="mt-4 space-y-3">
            {novels.slice(0, 5).map((novel) => (
              <div
                key={novel.novel_id}
                className="border-cream-deep/80 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/50 px-4 py-3 transition hover:bg-white/80"
              >
                <div>
                  <p className="text-ink font-bold">{novel.title}</p>
                  <p className="text-ink-soft text-sm">{novel.author}</p>
                </div>
                <div className="flex gap-2">
                  <Badge label={novel.access_level} kind={novel.access_level} />
                  <Badge label={novel.status} kind={novel.status} />
                </div>
              </div>
            ))}
            {!novels.length && !error && (
              <p className="text-ink-soft text-sm">
                No novels yet. Add your first one from the Novels tab.
              </p>
            )}
          </div>
        </YveCard>
      </FadeSlideIn>
    </div>
  )
}
