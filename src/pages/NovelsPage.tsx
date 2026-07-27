import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { fetchAdminNovels } from '../lib/api'
import { loadSession } from '../lib/auth'
import type { Novel } from '../lib/types'
import { Badge } from '../components/Badge'

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Novels</h1>
          <p className="text-forest/70 mt-1">Publish, archive, and set access levels.</p>
        </div>
        <Link
          to="/novels/new"
          className="bg-forest text-cream inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-forest-light"
        >
          <Plus className="size-4" />
          Add novel
        </Link>
      </div>

      <div className="relative">
        <Search className="text-forest/40 absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or genre"
          className="border-cream-deep focus:border-leaf w-full rounded-2xl border bg-surface py-3 pr-4 pl-11 outline-none"
        />
      </div>

      {error && (
        <div className="border-burgundy/20 bg-burgundy/5 text-burgundy rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map((novel) => (
          <Link
            key={novel.novel_id}
            to={`/novels/${novel.novel_id}`}
            className="border-cream-deep hover:border-leaf/40 rounded-2xl border bg-surface p-5 shadow-sm transition"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{novel.title}</h2>
                <p className="text-forest/70 mt-1 text-sm">
                  {novel.author} · {novel.genre || 'No genre'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label={novel.access_level} kind={novel.access_level} />
                <Badge label={novel.status} kind={novel.status} />
                {novel.featured && (
                  <span className="bg-gold/20 text-forest rounded-full px-2.5 py-1 text-xs font-semibold">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {!filtered.length && (
          <p className="text-forest/60 text-sm">No novels match your search.</p>
        )}
      </div>
    </div>
  )
}
