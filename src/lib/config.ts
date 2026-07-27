const STORAGE_KEY = 'yveleaf_api_config'

/** Official YveLeaf Apps Script deployment — used when Settings/env not filled in. */
export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxtTombJcU-38ulsfFHq8r7V35-DiVuw5IXa607ApcM2dRG2_z1bfv9mTF8J1AZ5iR7/exec'

export function loadApiConfig() {
  const fromEnv = {
    appsScriptUrl:
      import.meta.env.VITE_APPS_SCRIPT_URL?.trim() || DEFAULT_APPS_SCRIPT_URL,
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fromEnv
    const saved = JSON.parse(raw) as {
      appsScriptUrl?: string
      googleClientId?: string
    }
    return {
      appsScriptUrl: saved.appsScriptUrl?.trim() || fromEnv.appsScriptUrl,
      googleClientId: saved.googleClientId?.trim() || fromEnv.googleClientId,
    }
  } catch {
    return fromEnv
  }
}

export function saveApiConfig(config: { appsScriptUrl: string; googleClientId: string }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}
