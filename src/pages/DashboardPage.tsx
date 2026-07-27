import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Crown, Globe, Sparkles, Users, Wifi, CalendarDays, Infinity, Clock3 } from 'lucide-react'
import {
  fetchAdminNovels,
  fetchAdminStats,
  fetchReadingInsights,
  fetchSheetHealth,
} from '../lib/api'
import { adminDisplayName, loadAdminProfile } from '../lib/adminProfile'
import { clearSession, loadSession } from '../lib/auth'
import { BRAND, IMAGES } from '../lib/brand'
import type { Novel, ReadingInsights } from '../lib/types'
import { Badge } from '../components/Badge'
import { ReadingHighlightsSection, SheetHealthBanner } from '../components/ReadingHighlights'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { YveCard, YveStatCard } from '../components/yve/YveCard'

function countBy<T extends string>(items: Novel[], pick: (n: Novel) => T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = pick(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function formatJoinedDate(iso: string) {
  if (!iso) return ''
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

const emptyInsights: ReadingInsights = {
  today: [],
  top_all_time: [],
  trend_7d: [],
  highlights: [],
  totals: {
    pages_today: 0,
    minutes_today: 0,
    pages_lifetime: 0,
    minutes_lifetime: 0,
    minutes_today_label: '0m',
    minutes_lifetime_label: '0m',
  },
  weekday_activity: [],
}

export function DashboardPage() {
  const navigate = useNavigate()
  const session = loadSession()
  const profile = loadAdminProfile()
  const [novels, setNovels] = useState<Novel[]>([])
  const [stats, setStats] = useState({ novels: 0, published: 0, users: 0 })
  const [insights, setInsights] = useState<ReadingInsights>(emptyInsights)
  const [sheetIssues, setSheetIssues] = useState<
    Array<{ name: string; missingColumns: string[]; warnings: string[] }>
  >([])
  const [error, setError] = useState('')
  const [partialWarning, setPartialWarning] = useState('')

  useEffect(() => {
    if (!session) return
    Promise.allSettled([
      fetchAdminNovels(session.idToken),
      fetchAdminStats(session.idToken),
      fetchReadingInsights(session.idToken),
      fetchSheetHealth(session.idToken),
    ]).then((results) => {
      const labels = ['novels', 'stats', 'reading insights', 'sheet health'] as const
      const failures: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failures.push(labels[index])
          if (index === 0) return
        }
      })

      const novelsResult = results[0]
      const statsResult = results[1]
      const insightsResult = results[2]
      const healthResult = results[3]

      if (novelsResult.status === 'fulfilled') setNovels(novelsResult.value)
      if (statsResult.status === 'fulfilled') setStats(statsResult.value)
      if (insightsResult.status === 'fulfilled') setInsights(insightsResult.value)
      if (healthResult.status === 'fulfilled') {
        setSheetIssues(
          (healthResult.value.sheets ?? []).filter((s) => !s.ok || s.warnings.length > 0),
        )
      }

      const hardFailure = novelsResult.status === 'rejected' ? novelsResult.reason : null
      if (hardFailure instanceof Error) {
        if (hardFailure.message.toLowerCase().includes('invalid google token')) {
          clearSession()
        }
        setError(hardFailure.message)
        return
      }

      if (failures.length) {
        setPartialWarning(
          `Some dashboard sections could not load (${failures.join(', ')}). Redeploy the latest Apps Script if reading charts or sheet health are missing.`,
        )
      }
    })
  }, [session])

  const sessionExpired = error.toLowerCase().includes('invalid google token')
  const displayName = adminDisplayName(session?.name)
  const joinedLabel = formatJoinedDate(profile.joinedDate)

  const access = countBy(novels, (n) => n.access_level)
  const featured = novels.filter((n) => n.featured).length
  const readersToday = (insights.today ?? []).reduce(
    (sum, book) => sum + Number(book.reader_count || 0),
    0,
  )
  const sessionsToday = (insights.today ?? []).reduce(
    (sum, book) => sum + Number(book.session_count || 0),
    0,
  )
  const lifetimeReaders = (insights.top_all_time ?? []).reduce(
    (sum, book) => sum + Number(book.total_readers || 0),
    0,
  )

  const cards = [
    { label: 'Total novels', value: stats.novels, icon: BookOpen },
    { label: 'Published', value: stats.published, icon: Globe },
    { label: 'Featured', value: featured, icon: Crown },
    { label: 'Readers', value: stats.users, icon: Users },
    { label: 'Offline access', value: access.offline ?? 0, icon: Wifi },
  ]

  const readingCards = [
    {
      label: 'Reading time today',
      value: insights.totals?.minutes_today_label || '0m',
      icon: Clock3,
    },
    { label: 'Readers today', value: readersToday, icon: CalendarDays },
    { label: 'Sessions today', value: sessionsToday, icon: Sparkles },
    { label: 'Lifetime book opens', value: lifetimeReaders, icon: Infinity },
  ]

  const recent = [...novels]
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <FadeSlideIn>
        <div className="from-forest via-forest to-leaf relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-7 text-cream shadow-[0_18px_40px_rgba(27,67,50,0.22)] sm:px-8">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-gold-soft flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase">
                <Sparkles className="size-3.5" />
                Welcome back
              </p>
              <h1 className="font-display mt-2 text-3xl text-white sm:text-4xl">
                {displayName}
              </h1>
              <p className="text-cream/85 mt-3 text-sm leading-relaxed">
                {profile.bio.trim() ||
                  `Manage ${BRAND.name} novels, access levels, and publishing from one calm place.`}
              </p>
              <div className="text-cream/75 mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {session?.email && <span>{session.email}</span>}
                {profile.phone.trim() && <span>{profile.phone.trim()}</span>}
                {joinedLabel && <span>Since {joinedLabel}</span>}
              </div>
              <Link
                to="/profile"
                className="text-gold-soft hover:text-cream mt-5 inline-flex text-sm font-bold underline-offset-2 hover:underline"
              >
                Edit admin profile →
              </Link>
            </div>
            <img
              src={IMAGES.welcome}
              alt=""
              className="mx-auto max-h-40 w-auto object-contain lg:mx-0 lg:max-h-48"
              aria-hidden
            />
          </div>
          <div className="pointer-events-none absolute -left-10 bottom-0 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-6 -top-8 size-36 rounded-full bg-gold/15 blur-2xl" />
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

      {partialWarning && !error && (
        <div className="border-gold/30 bg-gold/10 text-forest rounded-xl border px-4 py-3 text-sm">
          {partialWarning}
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {readingCards.map(({ label, value, icon }, i) => (
          <FadeSlideIn key={label} delay={280 + i * 70}>
            <YveStatCard icon={icon} label={label} value={value} />
          </FadeSlideIn>
        ))}
      </div>

      <ReadingHighlightsSection
        today={insights.today ?? []}
        trend7d={insights.trend_7d ?? []}
        highlights={insights.highlights ?? []}
        totals={insights.totals}
        weekdayActivity={insights.weekday_activity}
      />

      <FadeSlideIn delay={450}>
        <YveCard className="p-5">
          <h2 className="font-display text-xl">Recent novels</h2>
          <p className="text-ink-soft mt-1 text-sm">Latest updates across your catalog.</p>
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
