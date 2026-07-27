import { loadApiConfig } from './config'
import type { AccessLevel, AdminStats, Novel, NovelStatus, ReadingInsights, SheetHealthReport } from './types'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function normalizeAppsScriptUrl(raw: string) {
  return raw.trim().replace(/\/+$/, '')
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
  const { appsScriptUrl: rawUrl } = loadApiConfig()
  const appsScriptUrl = normalizeAppsScriptUrl(rawUrl || '')
  if (!appsScriptUrl) {
    throw new ApiError(
      'Apps Script URL is not configured. Open Settings and paste your Web App URL ending in /exec',
    )
  }

  let res: Response
  try {
    if (options.method === 'POST' && options.body) {
      // text/plain JSON avoids CORS preflight AND works with existing Apps Script
      // doPost (JSON.parse of post body). Also avoids GET URL size limits on uploads.
      const payload: Record<string, unknown> = {
        ...options.body,
        action,
      }
      if (options.token) payload.token = options.token
      if (options.query) {
        for (const [k, v] of Object.entries(options.query)) payload[k] = v
      }

      res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify(payload),
      })
    } else {
      const url = new URL(appsScriptUrl)
      url.searchParams.set('action', action)
      if (options.query) {
        for (const [k, v] of Object.entries(options.query)) url.searchParams.set(k, v)
      }
      if (options.token) url.searchParams.set('token', options.token)

      res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new ApiError(
      `Could not reach Apps Script (${detail}). Open Settings, paste the Web App URL ending in /exec, then hard-refresh. Deployment must be Execute as Me + Anyone.`,
    )
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean } & T
  if (!res.ok || data.error) {
    const message = data.error ?? `Request failed (${res.status})`
    if (
      message.toLowerCase().includes('invalid google token') ||
      message.toLowerCase().includes('missing authorization token')
    ) {
      throw new ApiError(`${message} — please sign out and sign in again.`, 401)
    }
    throw new ApiError(message, res.status)
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

export async function initAdminUpload(
  token: string,
  payload: {
    filename: string
    mimeType: string
    total_parts: number
    kind: string
    novel_id?: string
  },
) {
  return request<{ upload_id: string }>('admin_upload_init', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function uploadAdminFilePart(
  token: string,
  payload: { upload_id: string; index: number; data: string },
) {
  return request<{ ok: boolean; index: number }>('admin_upload_part', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function completeAdminUpload(token: string, uploadId: string) {
  return request<{ drive_id: string; download_url: string }>('admin_upload_complete', {
    method: 'POST',
    token,
    body: { upload_id: uploadId },
  })
}

export async function fetchAdminStats(token: string) {
  return request<AdminStats>('admin_stats', { token })
}

export async function fetchSheetHealth(token: string) {
  return request<SheetHealthReport>('admin_sheet_health', { token })
}

export async function fetchReadingInsights(token: string) {
  return request<ReadingInsights>('admin_reading_insights', { token })
}

/** Lightweight connectivity check used by Settings. */
export async function pingAppsScript() {
  return request<{ ok: boolean }>('health')
}
