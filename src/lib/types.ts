export type AccessLevel = 'offline' | 'online' | 'premium'
export type NovelStatus = 'draft' | 'published' | 'archived'

export interface Novel {
  novel_id: string
  title: string
  author: string
  genre: string
  description: string
  access_level: AccessLevel
  status: NovelStatus
  featured: boolean
  sort_order: number
  pdf_drive_id: string
  cover_drive_id: string
  gallery_drive_ids: string
  total_pages: number
  updated_at: string
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
