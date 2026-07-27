const STORAGE_KEY = 'yveleaf_api_config'

/** Official YveLeaf Apps Script deployment — used when Settings/env not filled in. */
export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxRrGtRQDSojiv1TFtdLZCZlXdq9BCceYFjhTVJ2-u9zPX2Tip7XWnefIIczAu6reOK/exec'

const RETIRED_APPS_SCRIPT_URLS = [
  'https://script.google.com/macros/s/AKfycbzE7EDRTV2jVecGa9U6Q_AJJ2ENZyD-yPzKy6exxmgqEVhpabiK_1GFXq11HgLCnM3A/exec',
  'https://script.google.com/macros/s/AKfycbxtTombJcU-38ulsfFHq8r7V35-DiVuw5IXa607ApcM2dRG2_z1bfv9mTF8J1AZ5iR7/exec',
]

function normalizeUrl(raw: string | undefined | null) {
  return (raw ?? '').trim().replace(/\/+$/, '')
}

function isRetiredUrl(url: string) {
  const normalized = normalizeUrl(url)
  return RETIRED_APPS_SCRIPT_URLS.some((retired) => normalizeUrl(retired) === normalized)
}

export function loadApiConfig() {
  const fromEnv = {
    appsScriptUrl:
      normalizeUrl(import.meta.env.VITE_APPS_SCRIPT_URL) || DEFAULT_APPS_SCRIPT_URL,
    googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim(),
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fromEnv
    const saved = JSON.parse(raw) as {
      appsScriptUrl?: string
      googleClientId?: string
    }
    const savedUrl = normalizeUrl(saved.appsScriptUrl)
    return {
      appsScriptUrl:
        !savedUrl || isRetiredUrl(savedUrl) ? fromEnv.appsScriptUrl : savedUrl,
      googleClientId: (saved.googleClientId ?? '').trim() || fromEnv.googleClientId,
    }
  } catch {
    return fromEnv
  }
}

export function saveApiConfig(config: { appsScriptUrl: string; googleClientId: string }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      appsScriptUrl: normalizeUrl(config.appsScriptUrl) || DEFAULT_APPS_SCRIPT_URL,
      googleClientId: config.googleClientId.trim(),
    }),
  )
}
