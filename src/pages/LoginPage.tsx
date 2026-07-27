import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { verifyAdmin } from '../lib/api'
import { loadSession, saveSession } from '../lib/auth'
import { BRAND, IMAGES } from '../lib/brand'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { BrandHeader, BrandLogo } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { GoldDivider } from '../components/yve/GoldDivider'
import { PageCurlBackground } from '../components/yve/PageCurlBackground'

export function LoginPage() {
  const navigate = useNavigate()
  const existing = loadSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (existing) return <Navigate to="/" replace />

  async function handleGoogleSignIn(data: {
    credential: string
    profile: { email: string; name?: string; picture?: string }
  }) {
    setLoading(true)
    setError('')
    try {
      await verifyAdmin(data.credential)
      saveSession({
        email: data.profile.email,
        idToken: data.credential,
        name: data.profile.name,
        picture: data.profile.picture,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageCurlBackground>
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10 lg:flex-row lg:gap-10">
        <FadeSlideIn className="mb-6 hidden max-w-sm lg:block">
          <img
            src={IMAGES.welcome}
            alt="Welcome to YveLeaf"
            className="mx-auto max-h-[420px] w-auto object-contain drop-shadow-lg"
          />
        </FadeSlideIn>

        <FadeSlideIn delay={120} className="w-full max-w-md">
          <div className="yve-card border-gold/30 border-2 p-8 shadow-[0_16px_40px_rgba(27,67,50,0.12)]">
            <div className="mx-auto flex justify-center">
              <BrandLogo size={72} />
            </div>

            <div className="mt-5">
              <BrandHeader
                title={`${BRAND.name} Admin`}
                subtitle="Sign in with the Google account that manages your library."
                showTagline
              />
            </div>

            <div className="mt-8 space-y-4">
              <GoogleSignInButton onSuccess={handleGoogleSignIn} />
              {loading && (
                <p className="text-ink-soft text-center text-sm">Verifying access…</p>
              )}
              {error && (
                <p className="text-burgundy bg-burgundy/5 rounded-xl px-4 py-3 text-center text-sm">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-8">
              <GoldDivider />
              <p className="text-ink-soft mt-4 text-center text-xs leading-relaxed">
                Only approved administrator emails can access this portal.
              </p>
            </div>
          </div>
        </FadeSlideIn>
      </div>
    </PageCurlBackground>
  )
}
