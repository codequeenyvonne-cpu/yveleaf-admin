import { useState } from 'react'
import { loadApiConfig, saveApiConfig } from '../lib/config'

export function SettingsPage() {
  const initial = loadApiConfig()
  const [appsScriptUrl, setAppsScriptUrl] = useState(initial.appsScriptUrl)
  const [googleClientId, setGoogleClientId] = useState(initial.googleClientId)
  const [saved, setSaved] = useState(false)

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    saveApiConfig({ appsScriptUrl: appsScriptUrl.trim(), googleClientId: googleClientId.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-forest/70 mt-1">Connect this portal to your Apps Script backend.</p>
      </div>

      <form onSubmit={onSave} className="border-cream-deep space-y-4 rounded-2xl border bg-surface p-5 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Apps Script Web App URL</span>
          <input
            value={appsScriptUrl}
            onChange={(e) => setAppsScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Google OAuth Client ID</span>
          <input
            value={googleClientId}
            onChange={(e) => setGoogleClientId(e.target.value)}
            placeholder="1234567890-abc.apps.googleusercontent.com"
            className="field"
          />
          <p className="text-forest/60 mt-2 text-xs">
            Create in Google Cloud Console → APIs & Services → Credentials → OAuth Web client.
            Add your GitHub Pages URL as an authorized JavaScript origin.
          </p>
        </label>
        <button
          type="submit"
          className="bg-forest text-cream rounded-full px-6 py-3 text-sm font-semibold"
        >
          Save settings
        </button>
        {saved && <p className="text-leaf text-sm">Saved. Reload the login page to use Google sign-in.</p>}
      </form>
    </div>
  )
}
