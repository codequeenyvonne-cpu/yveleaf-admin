import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Crown, Globe, Users, Wifi } from 'lucide-react'
import {
  fetchAdminNovels,
  fetchAdminStats,
  fetchReadingInsights,
  fetchSheetHealth,
} from '../lib/api'
import { clearSession, loadSession } from '../lib/auth'
import { BRAND, IMAGES } from '../lib/brand'
import type { Novel, ReadingInsights } from '../lib/types'
import { Badge } from '../components/Badge'
import { ReadingHighlightsSection, SheetHealthBanner } from '../components/ReadingHighlights'
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

const emptyInsights: ReadingInsights = {
  today: [],
  top_all_time: [],
  trend_7d: [],
  highlights: [],
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [novels, setNovels] = useState<Novel[]>([])
  const [stats, setStats] = useState({ novels: 0, published: 0, users: 0 })
  const [insights, setInsights] = useState<ReadingInsights>(emptyInsights)
  const [sheetIssues, setSheetIssues] = useState<
    Array<{ name: string; missingColumns: string[]; warnings: string[] }>
  >([])
  const [error, setError] = useState('')

  useEffect(() => {
    const session = loadSession()
    if (!session) return
    Promise.all([
      fetchAdminNovels(session.idToken),
      fetchAdminStats(session.idToken),
      fetchReadingInsights(session.idToken),
      fetchSheetHealth(session.idToken),
    ])
      .then(([novelList, adminStats, readingInsights, sheetHealth]) => {
        setNovels(novelList)
        setStats(adminStats)
        setInsights(readingInsights)
        setSheetIssues(
          (sheetHealth.sheets ?? []).filter((s) => !s.ok || s.warnings.length > 0),
        )
      })
      .catch((e: Error) => {
        if (e.message.toLowerCase().includes('invalid google token')) {
          clearSession()
        }
        setError(e.message)
      })
  }, [])

  const sessionExpired = error.toLowerCase().includes('invalid google token')

  const access = countBy(novels, (n) => n.access_level)
  const featured = novels.filter((n) => n.featured).length

  const cards = [
    { label: 'Total novels', value: stats.novels, icon: BookOpen },
    { label: 'Published', value: stats.published, icon: Globe },
    { label: 'Featured', value: featured, icon: Crown },
    { label: 'Readers', value: stats.users, icon: Users },
    { label: 'Offline access', value: access.offline ?? 0, icon: Wifi },
  ]

  const recent = [...novels]
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
    .slice(0, 5)

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
          <p>{error}</p>
          {sessionExpired && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-forest mt-3 font-bold underline"
            >
              Sign in again
            </button>
          )}
        </div>
      )}

      {sheetIssues.length > 0 && <SheetHealthBanner issues={sheetIssues} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon }, i) => (
          <FadeSlideIn key={label} delay={100 + i * 80}>
            <YveStatCard icon={icon} label={label} value={value} />
          </FadeSlideIn>
        ))}
      </div>

      <ReadingHighlightsSection
        today={insights.today ?? []}
        trend7d={insights.trend_7d ?? []}
        highlights={insights.highlights ?? []}
      />

      <FadeSlideIn delay={450}>
        <YveCard className="p-5">
          <h2 className="font-display text-xl">Recent novels</h2>
          <div className="mt-4 space-y-3">
            {recent.map((novel) => (
              <div
                key={novel.novel_id}
                className="border-cream-deep/80 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/50 px-4 py-3 transition hover:bg-white/80"
              >
                <div>
                  <p className="text-ink font-bold">{novel.title}</p>
                  <p className="text-ink-soft text-sm">
                    {novel.author}
                    {novel.sort_order ? ` · priority ${novel.sort_order}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {novel.featured && <Badge label="featured" kind="published" />}
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
