import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { loadSession } from './lib/auth'
import { AdminProfilePage } from './pages/AdminProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NovelFormPage } from './pages/NovelFormPage'
import { NovelsPage } from './pages/NovelsPage'
import { SettingsPage } from './pages/SettingsPage'

function Protected({ children }: { children: React.ReactNode }) {
  const session = loadSession()
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const base = import.meta.env.BASE_URL
  return (
    <BrowserRouter basename={base.endsWith('/') ? base.slice(0, -1) : base || undefined}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="novels" element={<NovelsPage />} />
          <Route path="novels/new" element={<NovelFormPage />} />
          <Route path="novels/:novelId" element={<NovelFormPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
