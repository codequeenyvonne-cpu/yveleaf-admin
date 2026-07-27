import { useEffect, useState } from 'react'
import { BookOpen, Crown, Globe, Wifi } from 'lucide-react'
import { fetchAdminNovels } from '../lib/api'
import { loadSession } from '../lib/auth'
import type { Novel } from '../lib/types'
import { Badge } from '../components/Badge'

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
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-forest/70 mt-1">Manage YveLeaf novels, access levels, and publishing.</p>
      </div>

      {error && (
        <div className="border-burgundy/20 bg-burgundy/5 text-burgundy rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border-cream-deep rounded-2xl border bg-surface p-5 shadow-sm"
          >
            <div className="bg-forest/5 text-forest mb-4 inline-flex rounded-xl p-3">
              <Icon className="size-5" />
            </div>
            <p className="text-forest/60 text-sm">{label}</p>
            <p className="font-display mt-1 text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <section className="border-cream-deep rounded-2xl border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-xl">Recent novels</h2>
        <div className="mt-4 space-y-3">
          {novels.slice(0, 5).map((novel) => (
            <div
              key={novel.novel_id}
              className="border-cream-deep/80 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
            >
              <div>
                <p className="font-medium">{novel.title}</p>
                <p className="text-forest/60 text-sm">{novel.author}</p>
              </div>
              <div className="flex gap-2">
                <Badge label={novel.access_level} kind={novel.access_level} />
                <Badge label={novel.status} kind={novel.status} />
              </div>
            </div>
          ))}
          {!novels.length && !error && (
            <p className="text-forest/60 text-sm">No novels yet. Add your first one from the Novels tab.</p>
          )}
        </div>
      </section>
    </div>
  )
}
