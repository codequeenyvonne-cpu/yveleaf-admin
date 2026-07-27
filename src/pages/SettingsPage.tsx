import { useState } from 'react'
import { Cloud, Settings2 } from 'lucide-react'
import { loadApiConfig, saveApiConfig } from '../lib/config'
import { IMAGES } from '../lib/brand'
import { BrandHeader } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { YveFeatureCard } from '../components/yve/YveCard'
import { YvePrimaryButton } from '../components/yve/YveButton'

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
    <div className="mx-auto max-w-2xl space-y-8">
      <FadeSlideIn>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img
            src={IMAGES.portrait}
            alt=""
            className="max-h-40 w-auto object-contain"
            aria-hidden
          />
          <BrandHeader
            compact
            title="Settings"
            subtitle="Connect this portal to your Apps Script backend and Google sign-in."
            showTagline
          />
        </div>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <YveFeatureCard
          icon={Cloud}
          title="Google Drive backup"
          subtitle="Novel files live in Drive; metadata syncs through Apps Script and Sheets."
        />
      </FadeSlideIn>

      <FadeSlideIn delay={200}>
        <form onSubmit={onSave} className="yve-card space-y-4 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Settings2 className="text-leaf size-5" />
            <p className="text-ink font-bold">Backend connection</p>
          </div>
          <label className="block">
            <span className="text-ink mb-2 block text-sm font-bold">Apps Script Web App URL</span>
            <input
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/…/exec"
              className="field"
            />
          </label>
          <label className="block">
            <span className="text-ink mb-2 block text-sm font-bold">Google OAuth Client ID</span>
            <input
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="1234567890-abc.apps.googleusercontent.com"
              className="field"
            />
            <p className="text-ink-soft mt-2 text-xs leading-relaxed">
              Add your GitHub Pages URL as an authorized JavaScript origin in Google Cloud
              Console.
            </p>
          </label>
          <YvePrimaryButton type="submit" className="!mt-2">
            Save settings
          </YvePrimaryButton>
          {saved && <p className="text-leaf text-sm font-bold">Saved successfully.</p>}
        </form>
      </FadeSlideIn>
    </div>
  )
}
