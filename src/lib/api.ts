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

  // Apps Script web apps reject CORS preflight (OPTIONS). Never send Authorization
  // or application/json POST from the browser — pass the token in the query string.
  if (options.token) url.searchParams.set('token', options.token)

  if (options.method === 'POST' && options.body) {
    url.searchParams.set('payload', JSON.stringify(options.body))
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new ApiError(
      'Could not reach Apps Script. Check the Web App URL in Settings and confirm the deployment is set to Execute as Me and Anyone.',
    )
  }

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
