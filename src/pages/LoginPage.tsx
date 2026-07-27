import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { verifyAdmin } from '../lib/api'
import { loadSession, saveSession } from '../lib/auth'
import { GoogleSignInButton } from '../components/GoogleSignInButton'

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
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="border-cream-deep w-full max-w-md rounded-3xl border bg-surface p-8 shadow-xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-forest text-cream">
          <Sparkles className="size-7" />
        </div>
        <h1 className="font-display mt-5 text-center text-3xl">YveLeaf Admin</h1>
        <p className="text-forest/70 mt-2 text-center text-sm">
          Sign in with the Google account that manages YveLeaf.
        </p>

        <div className="mt-8 space-y-4">
          <GoogleSignInButton onSuccess={handleGoogleSignIn} />
          {loading && <p className="text-forest/60 text-center text-sm">Verifying access…</p>}
          {error && (
            <p className="text-burgundy bg-burgundy/5 rounded-xl px-4 py-3 text-center text-sm">
              {error}
            </p>
          )}
        </div>

        <p className="text-forest/50 mt-8 text-center text-xs">
          Only approved admin emails can access this portal.
        </p>
      </div>
    </div>
  )
}
