export type AccessLevel = 'offline' | 'online' | 'premium'
export type NovelStatus = 'draft' | 'published' | 'archived'

export interface Novel {
  novel_id: string
  title: string
  author: string
  genre: string
  description: string
  publication_year: string | number
  access_level: AccessLevel
  status: NovelStatus
  featured: boolean
  sort_order: number
  pdf_drive_id: string
  cover_drive_id: string
  gallery_drive_ids: string
  total_pages: number
  default_reading_style: number | null
  allow_offline_download: boolean
  carousel_interval_sec: number
  updated_at: string
}

export interface AdminStats {
  novels: number
  published: number
  users: number
}

export interface SheetHealthReport {
  ok: boolean
  sheets: Array<{
    name: string
    headerRow: number
    missingColumns: string[]
    warnings: string[]
    ok: boolean
  }>
}

export interface ReadingInsightBook {
  novel_id: string
  title: string
  reader_count: number
  session_count?: number
}

export interface ReadingHighlight {
  title: string
  reader_count: number
  label: string
}

export interface ReadingTrendPoint {
  date: string
  novel_id: string
  title: string
  reader_count: number
}

export interface ReadingInsights {
  today: ReadingInsightBook[]
  top_all_time: Array<{ novel_id: string; title: string; total_readers: number }>
  trend_7d: ReadingTrendPoint[]
  highlights: ReadingHighlight[]
}

export interface AdminSession {
  email: string
  idToken: string
  name?: string
  picture?: string
}

export interface ApiConfig {
  appsScriptUrl: string
  googleClientId: string
}

export const READING_STYLE_OPTIONS = [
  { value: '', label: 'Use reader preference' },
  { value: 0, label: 'Realistic Book (page turns)' },
  { value: 1, label: 'Smooth Slide' },
  { value: 2, label: 'Continuous Scroll' },
  { value: 3, label: 'Cinematic Focus' },
] as const
