import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Clock3, TrendingUp } from 'lucide-react'
import type {
  ReadingHighlight,
  ReadingInsightBook,
  ReadingTotals,
  ReadingTrendPoint,
  WeekdayActivityPoint,
} from '../lib/types'
import { FadeSlideIn } from './yve/FadeSlideIn'
import { YveCard } from './yve/YveCard'

const CHART_COLORS = ['#1b4332', '#2d6a4f', '#74a892', '#c9a227', '#7d3b4c']

function shortTitle(title: string, max = 22) {
  return title.length > max ? `${title.slice(0, max)}…` : title
}

function formatDay(date: string) {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function buildTrendSeries(trend: ReadingTrendPoint[]) {
  const byDate = new Map<string, Record<string, string | number>>()
  const topNovels = [...new Set(trend.map((t) => t.novel_id))].slice(0, 3)

  for (const point of trend) {
    if (!topNovels.includes(point.novel_id)) continue
    const row = byDate.get(point.date) ?? { date: point.date, label: formatDay(point.date) }
    row[shortTitle(point.title, 16)] = point.reader_count
    byDate.set(point.date, row)
  }

  return {
    data: [...byDate.values()],
    keys: trend
      .filter((t) => topNovels.includes(t.novel_id))
      .reduce<string[]>((acc, t) => {
        const key = shortTitle(t.title, 16)
        return acc.includes(key) ? acc : [...acc, key]
      }, [])
      .slice(0, 3),
  }
}

export function ReadingHighlightsSection({
  today,
  trend7d,
  highlights,
  totals,
  weekdayActivity,
}: {
  today: ReadingInsightBook[]
  trend7d: ReadingTrendPoint[]
  highlights: ReadingHighlight[]
  totals?: ReadingTotals
  weekdayActivity?: WeekdayActivityPoint[]
}) {
  const hasActivity =
    today.length > 0 ||
    trend7d.length > 0 ||
    (totals?.minutes_lifetime ?? 0) > 0 ||
    (weekdayActivity ?? []).some((d) => d.pages_read > 0 || d.minutes_read > 0)
  const barData = today.slice(0, 5).map((b) => ({
    name: shortTitle(b.title),
    readers: b.reader_count,
  }))
  const { data: lineData, keys: lineKeys } = buildTrendSeries(trend7d)
  const weekData = (weekdayActivity ?? []).map((d) => ({
    label: d.weekday,
    minutes: d.minutes_read,
    pages: d.pages_read,
  }))

  if (!hasActivity) {
    return (
      <FadeSlideIn delay={500}>
        <YveCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="bg-forest/5 text-forest rounded-xl p-3">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl">Reading highlights</h2>
              <p className="text-ink-soft mt-2 text-sm leading-relaxed">
                No reading activity yet. Stats appear here after signed-in readers open cloud
                novels in the app and progress syncs to your sheet.
              </p>
            </div>
          </div>
        </YveCard>
      </FadeSlideIn>
    )
  }

  return (
    <div className="space-y-6">
      {totals && (
        <FadeSlideIn delay={480}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <YveCard className="border-gold/20 bg-gradient-to-br from-white/80 to-cream/60 p-4">
              <div className="text-forest mb-2 inline-flex rounded-lg bg-forest/5 p-2">
                <Clock3 className="size-4" />
              </div>
              <p className="text-ink-soft text-sm">Reading time today</p>
              <p className="font-display mt-1 text-2xl">
                {totals.minutes_today_label || '0m'}
              </p>
            </YveCard>
            <YveCard className="border-gold/20 bg-gradient-to-br from-white/80 to-cream/60 p-4">
              <p className="text-ink-soft text-sm">Pages today</p>
              <p className="font-display mt-1 text-2xl">{totals.pages_today ?? 0}</p>
            </YveCard>
            <YveCard className="border-gold/20 bg-gradient-to-br from-white/80 to-cream/60 p-4">
              <p className="text-ink-soft text-sm">Lifetime reading time</p>
              <p className="font-display mt-1 text-2xl">
                {totals.minutes_lifetime_label || '0m'}
              </p>
            </YveCard>
            <YveCard className="border-gold/20 bg-gradient-to-br from-white/80 to-cream/60 p-4">
              <p className="text-ink-soft text-sm">Lifetime pages</p>
              <p className="font-display mt-1 text-2xl">{totals.pages_lifetime ?? 0}</p>
            </YveCard>
          </div>
        </FadeSlideIn>
      )}

      {highlights.length > 0 && (
        <FadeSlideIn delay={500}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {highlights.map((h) => (
              <YveCard
                key={h.title}
                className="border-gold/20 bg-gradient-to-br from-white/80 to-cream/60 p-4"
              >
                <p className="text-ink font-bold">{h.title}</p>
                <p className="text-leaf mt-1 text-sm font-semibold">{h.label}</p>
              </YveCard>
            ))}
          </div>
        </FadeSlideIn>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <FadeSlideIn delay={540}>
          <YveCard className="p-5">
            <h2 className="font-display text-xl">Day of week</h2>
            <p className="text-ink-soft mb-4 text-sm">
              Community pages and minutes over the last 7 days
            </p>
            <div className="h-64">
              {weekData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3ead5" />
                    <XAxis dataKey="label" tick={{ fill: '#6e6a5e', fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6e6a5e', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #f3ead5',
                        background: '#fffdf7',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="minutes" name="Minutes" fill="#1b4332" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pages" name="Pages" fill="#c9a227" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-ink-soft flex h-full items-center justify-center text-sm">
                  Weekday activity appears after daily reading logs sync.
                </p>
              )}
            </div>
          </YveCard>
        </FadeSlideIn>

        <FadeSlideIn delay={560}>
          <YveCard className="p-5">
            <h2 className="font-display text-xl">Most read today</h2>
            <p className="text-ink-soft mb-4 text-sm">Unique readers per book today</p>
            <div className="h-64">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3ead5" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6e6a5e', fontSize: 11 }}
                      interval={0}
                      angle={-24}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#6e6a5e', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #f3ead5',
                        background: '#fffdf7',
                      }}
                    />
                    <Bar dataKey="readers" fill="#1b4332" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-ink-soft flex h-full items-center justify-center text-sm">
                  Book-level readers appear once novels are opened today.
                </p>
              )}
            </div>
          </YveCard>
        </FadeSlideIn>
      </div>

      <FadeSlideIn delay={620}>
        <YveCard className="p-5">
          <h2 className="font-display text-xl">7-day reader flow</h2>
          <p className="text-ink-soft mb-4 text-sm">Daily unique readers for top books</p>
          <div className="h-64">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3ead5" />
                  <XAxis dataKey="label" tick={{ fill: '#6e6a5e', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6e6a5e', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #f3ead5',
                      background: '#fffdf7',
                    }}
                  />
                  <Legend />
                  {lineKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ink-soft flex h-full items-center justify-center text-sm">
                Trend data builds up over several days of reading activity.
              </p>
            )}
          </div>
        </YveCard>
      </FadeSlideIn>
    </div>
  )
}

export function SheetHealthBanner({
  issues,
}: {
  issues: Array<{ name: string; missingColumns: string[]; warnings: string[] }>
}) {
  if (!issues.length) return null

  return (
    <div className="border-gold/30 bg-gold/10 text-ink rounded-xl border px-4 py-3 text-sm">
      <p className="font-bold">Sheet layout needs attention</p>
      <ul className="mt-2 space-y-1">
        {issues.map((sheet) => (
          <li key={sheet.name}>
            <span className="font-semibold">{sheet.name}</span>
            {sheet.missingColumns.length > 0 && (
              <span> — missing columns: {sheet.missingColumns.join(', ')}</span>
            )}
            {sheet.warnings.map((w) => (
              <span key={w} className="text-ink-soft block">
                {w}
              </span>
            ))}
          </li>
        ))}
      </ul>
      <p className="text-ink-soft mt-2">
        Keep decorative rows above the header row. Do not rename columns like{' '}
        <code className="text-forest">novel_id</code>. Run{' '}
        <strong>setupYveLeafEverything</strong> in Apps Script to repair missing columns.
      </p>
    </div>
  )
}
