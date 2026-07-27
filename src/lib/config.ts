const STORAGE_KEY = 'yveleaf_api_config'

export function loadApiConfig() {
  const fromEnv = {
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL ?? '',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  }

  if (fromEnv.appsScriptUrl) return fromEnv

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fromEnv
    return { ...fromEnv, ...JSON.parse(raw) }
  } catch {
    return fromEnv
  }
}

export function saveApiConfig(config: { appsScriptUrl: string; googleClientId: string }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}
