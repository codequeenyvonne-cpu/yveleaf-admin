import { loadApiConfig } from './config'
import type { AccessLevel, Novel, NovelStatus } from './types'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  action: string,
  options: {
    method?: 'GET' | 'POST'
    token?: string
    body?: Record<string, unknown>
    query?: Record<string, string>
  } = {},
): Promise<T> {
  const { appsScriptUrl } = loadApiConfig()
  if (!appsScriptUrl) {
    throw new ApiError('Apps Script URL is not configured yet.')
  }

  const url = new URL(appsScriptUrl)
  url.searchParams.set('action', action)
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) url.searchParams.set(k, v)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  const res = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean } & T
  if (!res.ok || data.error) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status)
  }
  return data
}

export async function verifyAdmin(token: string) {
  return request<{ ok: boolean; email: string }>('admin_verify', { token })
}

export async function fetchAdminNovels(token: string) {
  const data = await request<{ novels: Novel[] }>('admin_novels', { token })
  return data.novels ?? []
}

export async function saveNovel(
  token: string,
  payload: Partial<Novel> & {
    title: string
    author: string
    access_level: AccessLevel
    status: NovelStatus
  },
) {
  return request<{ novel: Novel }>('admin_save_novel', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteNovel(token: string, novelId: string) {
  return request<{ ok: boolean }>('admin_archive_novel', {
    method: 'POST',
    token,
    body: { novel_id: novelId },
  })
}
