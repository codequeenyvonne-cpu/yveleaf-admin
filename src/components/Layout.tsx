import { BookOpen, LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, loadSession } from '../lib/auth'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/novels', label: 'Novels', icon: BookOpen },
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
    <div className="min-h-screen lg:flex">
      <aside className="border-cream-deep flex flex-col border-b bg-forest text-cream lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="border-cream/10 flex items-center gap-3 border-b px-5 py-5">
          <div className="bg-gold/20 flex size-10 items-center justify-center rounded-xl">
            <Sparkles className="text-gold size-5" />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">YveLeaf</p>
            <p className="text-cream/70 text-xs tracking-wide uppercase">Admin Portal</p>
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
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-cream text-forest shadow-sm'
                    : 'text-cream/85 hover:bg-white/10',
                ].join(' ')
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-cream/10 p-4 lg:block">
          <div className="mb-3 truncate text-sm">{session?.name ?? session?.email}</div>
          <button
            type="button"
            onClick={signOut}
            className="text-cream/80 hover:text-cream flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-cream-deep flex items-center justify-between border-b bg-surface/80 px-5 py-4 backdrop-blur lg:hidden">
          <div>
            <p className="font-display text-forest text-lg">YveLeaf Admin</p>
            <p className="text-forest/60 text-xs">{session?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-forest/70 rounded-lg p-2 hover:bg-cream-deep/50"
          >
            <LogOut className="size-5" />
          </button>
        </header>
        <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
