import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { fetchAdminNovels } from '../lib/api'
import { loadSession } from '../lib/auth'
import { IMAGES } from '../lib/brand'
import type { Novel } from '../lib/types'
import { Badge } from '../components/Badge'
import { BrandHeader } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { YveCard } from '../components/yve/YveCard'

export function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const session = loadSession()
    if (!session) return
    fetchAdminNovels(session.idToken)
      .then(setNovels)
      .catch((e: Error) => setError(e.message))
  }, [])

  const filtered = novels.filter((n) => {
    const q = query.toLowerCase()
    return (
      n.title.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q) ||
      n.genre.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <FadeSlideIn>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={IMAGES.reading}
              alt=""
              className="max-h-36 w-auto object-contain"
              aria-hidden
            />
            <BrandHeader
              compact
              title="Novels"
              subtitle="Publish, archive, and set access levels for your library."
            />
          </div>
          <Link
            to="/novels/new"
            className="yve-pill-btn !w-full sm:!w-auto sm:min-w-[180px] no-underline"
          >
            <Plus className="text-gold-soft size-5" />
            Add novel
          </Link>
        </div>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <div className="relative">
          <Search className="text-leaf-soft absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or genre"
            className="field pl-11"
          />
        </div>
      </FadeSlideIn>

      {error && (
        <div className="border-burgundy/20 bg-burgundy/5 text-burgundy rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map((novel, i) => (
          <FadeSlideIn key={novel.novel_id} delay={80 + i * 50}>
            <Link to={`/novels/${novel.novel_id}`}>
              <YveCard className="p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(27,67,50,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl">{novel.title}</h2>
                    <p className="text-ink-soft mt-1 text-sm">
                      {novel.author} · {novel.genre || 'No genre'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge label={novel.access_level} kind={novel.access_level} />
                    <Badge label={novel.status} kind={novel.status} />
                    {novel.featured && (
                      <span className="bg-gold/25 text-forest rounded-full px-2.5 py-1 text-xs font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </YveCard>
            </Link>
          </FadeSlideIn>
        ))}
        {!filtered.length && (
          <p className="text-ink-soft text-sm">No novels match your search.</p>
        )}
      </div>
    </div>
  )
}
