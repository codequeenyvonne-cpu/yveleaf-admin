import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, LogIn, Settings2, Wifi } from 'lucide-react'
import { pingAppsScript } from '../lib/api'
import { DEFAULT_APPS_SCRIPT_URL, loadApiConfig, saveApiConfig } from '../lib/config'
import { IMAGES } from '../lib/brand'
import { BrandHeader } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { PageCurlBackground } from '../components/yve/PageCurlBackground'
import { YveFeatureCard } from '../components/yve/YveCard'
import { YvePrimaryButton } from '../components/yve/YveButton'

export function SettingsPage() {
  const navigate = useNavigate()
  const initial = loadApiConfig()
  const [appsScriptUrl, setAppsScriptUrl] = useState(initial.appsScriptUrl)
  const [googleClientId, setGoogleClientId] = useState(initial.googleClientId)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testOk, setTestOk] = useState<boolean | null>(null)
  const setupComplete = Boolean(appsScriptUrl.trim() && googleClientId.trim())

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    saveApiConfig({ appsScriptUrl: appsScriptUrl.trim(), googleClientId: googleClientId.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function onTest() {
    saveApiConfig({ appsScriptUrl: appsScriptUrl.trim(), googleClientId: googleClientId.trim() })
    setTesting(true)
    setTestMessage('')
    setTestOk(null)
    try {
      const result = await pingAppsScript()
      setTestOk(true)
      setTestMessage(
        result.ok
          ? 'Connected successfully to Apps Script.'
          : 'Reached Apps Script, but health check was not ok.',
      )
    } catch (err) {
      setTestOk(false)
      setTestMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setTesting(false)
    }
  }

  return (
    <PageCurlBackground>
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex justify-center">
        <YvePrimaryButton type="button" onClick={() => navigate('/login')}>
          ← Back to sign in
        </YvePrimaryButton>
      </div>
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
            <button
              type="button"
              className="text-leaf mt-2 text-xs font-bold underline"
              onClick={() => setAppsScriptUrl(DEFAULT_APPS_SCRIPT_URL)}
            >
              Use official YveLeaf Web App URL
            </button>
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
          <YvePrimaryButton type="submit" className="!mt-2 w-full">
            Save settings
          </YvePrimaryButton>
          <YvePrimaryButton
            type="button"
            leadingIcon={Wifi}
            className="!mt-2 w-full"
            onClick={onTest}
          >
            {testing ? 'Testing…' : 'Test connection'}
          </YvePrimaryButton>
          {saved && <p className="text-leaf text-sm font-bold">Saved successfully.</p>}
          {testMessage && (
            <p className={`text-sm font-bold ${testOk ? 'text-leaf' : 'text-burgundy'}`}>
              {testMessage}
            </p>
          )}
          {setupComplete && (
            <YvePrimaryButton
              type="button"
              leadingIcon={LogIn}
              className="!mt-2 w-full"
              onClick={() => navigate('/login')}
            >
              Go to sign in
            </YvePrimaryButton>
          )}
        </form>
      </FadeSlideIn>
    </div>
    </PageCurlBackground>
  )
}
