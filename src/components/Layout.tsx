import { BookOpen, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminDisplayName } from '../lib/adminProfile'
import { BRAND } from '../lib/brand'
import { clearSession, loadSession } from '../lib/auth'
import { BrandLogo } from './yve/BrandHeader'
import { PageCurlBackground } from './yve/PageCurlBackground'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/novels', label: 'Novels', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Layout() {
  const navigate = useNavigate()
  const session = loadSession()

  function signOut() {
    clearSession()
    navigate('/login')
  }

  return (
    <PageCurlBackground>
      <div className="min-h-screen lg:flex">
        <aside className="border-cream-deep/80 flex flex-col border-b bg-forest text-cream shadow-lg lg:min-h-screen lg:w-[270px] lg:border-b-0 lg:border-r">
          <div className="border-cream/10 flex items-center gap-3 border-b px-5 py-5">
            <BrandLogo size={44} />
            <div>
              <p className="font-display text-cream text-xl leading-tight">{BRAND.name}</p>
              <p className="text-gold-soft text-[11px] font-bold tracking-[0.18em] uppercase">
                Admin
              </p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:flex-col">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition duration-300',
                    isActive
                      ? 'bg-cream text-forest shadow-md'
                      : 'text-cream/90 hover:bg-white/10',
                  ].join(' ')
                }
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden border-t border-cream/10 p-4 lg:block">
            <p className="text-cream/70 mb-1 truncate text-xs">{session?.email}</p>
            <p className="text-cream mb-3 truncate text-sm font-bold">
              {adminDisplayName(session?.name)}
            </p>
            <button
              type="button"
              onClick={signOut}
              className="text-cream/85 hover:text-cream flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-cream-deep flex items-center justify-between border-b bg-surface/90 px-5 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
              <BrandLogo size={36} />
              <div>
                <p className="font-display text-lg">{BRAND.name}</p>
                <p className="text-ink-soft text-xs">{BRAND.tagline}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="text-forest/70 rounded-lg p-2 hover:bg-cream-deep/50"
            >
              <LogOut className="size-5" />
            </button>
          </header>
          <div className="page-enter mx-auto max-w-6xl px-5 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </PageCurlBackground>
  )
}
