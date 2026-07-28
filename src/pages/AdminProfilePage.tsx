import { useEffect, useState } from 'react'
import { CalendarDays, Phone, Sparkles, UserRound } from 'lucide-react'
import {
  adminDisplayName,
  defaultAdminProfile,
  loadAdminProfile,
  saveAdminProfile,
  type AdminProfile,
} from '../lib/adminProfile'
import { loadSession } from '../lib/auth'
import { IMAGES } from '../lib/brand'
import { BrandHeader } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { YvePrimaryButton } from '../components/yve/YveButton'
import { YveCard } from '../components/yve/YveCard'

export function AdminProfilePage() {
  const session = loadSession()
  const [profile, setProfile] = useState<AdminProfile>(defaultAdminProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(loadAdminProfile())
  }, [])

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    saveAdminProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const greetingName = adminDisplayName(session?.name)

  return (
    <div className="space-y-8">
      <FadeSlideIn>
        <div className="from-forest via-forest to-leaf relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-7 text-cream shadow-[0_18px_40px_rgba(27,67,50,0.22)] sm:px-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-gold-soft text-xs font-bold tracking-[0.22em] uppercase">
                Administrator
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold !text-gold sm:text-4xl">
                {greetingName}
              </h1>
              <p className="text-cream/85 mt-2 max-w-xl text-sm leading-relaxed">
                {profile.bio.trim() ||
                  'Your admin profile appears on the dashboard welcome banner and sidebar.'}
              </p>
              {session?.email && (
                <p className="text-cream/70 mt-3 text-xs">{session.email}</p>
              )}
            </div>
            <img
              src={IMAGES.portrait}
              alt=""
              className="mx-auto max-h-36 w-auto object-contain sm:mx-0 sm:max-h-44"
              aria-hidden
            />
          </div>
          <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        </div>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <BrandHeader
          compact
          title="Edit profile"
          subtitle="These details are saved in this browser and personalize your admin experience."
          showTagline={false}
        />
      </FadeSlideIn>

      <FadeSlideIn delay={200}>
        <form onSubmit={onSave} className="space-y-5">
          <YveCard className="space-y-4 p-5">
            <label className="block">
              <span className="text-ink mb-2 flex items-center gap-2 text-sm font-bold">
                <UserRound className="text-leaf size-4" />
                Display name
              </span>
              <input
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Yvonne"
                className="field"
              />
            </label>

            <label className="block">
              <span className="text-ink mb-2 flex items-center gap-2 text-sm font-bold">
                <Phone className="text-leaf size-4" />
                Phone
              </span>
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+254 …"
                className="field"
              />
            </label>

            <label className="block">
              <span className="text-ink mb-2 flex items-center gap-2 text-sm font-bold">
                <CalendarDays className="text-leaf size-4" />
                Joined date
              </span>
              <input
                type="date"
                value={profile.joinedDate}
                onChange={(e) => setProfile({ ...profile, joinedDate: e.target.value })}
                className="field"
              />
            </label>

            <label className="block">
              <span className="text-ink mb-2 flex items-center gap-2 text-sm font-bold">
                <Sparkles className="text-leaf size-4" />
                Short bio
              </span>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                placeholder="A line about your reading world…"
                className="field min-h-[96px] resize-y"
              />
            </label>
          </YveCard>

          <YvePrimaryButton type="submit" className="w-full sm:w-auto">
            Save profile
          </YvePrimaryButton>
          {saved && <p className="text-leaf text-sm font-bold">Profile saved on this device.</p>}
        </form>
      </FadeSlideIn>
    </div>
  )
}
