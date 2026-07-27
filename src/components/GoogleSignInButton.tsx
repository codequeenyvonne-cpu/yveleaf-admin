import { useEffect, useRef } from 'react'
import { loadApiConfig } from '../lib/config'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

type GoogleJwt = { email: string; name?: string; picture?: string; sub: string }

function decodeJwt(token: string): GoogleJwt {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

export function GoogleSignInButton({
  onSuccess,
}: {
  onSuccess: (data: { credential: string; profile: GoogleJwt }) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { googleClientId } = loadApiConfig()

  useEffect(() => {
    if (!googleClientId || !ref.current) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          onSuccess({
            credential: response.credential,
            profile: decodeJwt(response.credential),
          })
        },
      })
      if (ref.current) {
        window.google?.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 320,
        })
      }
    }
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
  }, [googleClientId, onSuccess])

  if (!googleClientId) {
    return (
      <p className="text-forest/70 rounded-xl border border-dashed border-cream-deep bg-surface px-4 py-3 text-sm">
        Add your Google Client ID in Settings to enable sign-in.
      </p>
    )
  }

  return <div ref={ref} className="flex justify-center" />
}
