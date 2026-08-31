import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TasksProvider } from './contexts/TasksContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Today from './pages/Today'
import Upcoming from './pages/Upcoming'
import CalendarPage from './pages/CalendarPage'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import AppShell from './components/AppShell'

function ProtectedArea() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">Loading…</div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <TasksProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </TasksProvider>
  )
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthGate>
                <Login />
              </AuthGate>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthGate>
                <Signup />
              </AuthGate>
            }
          />
          <Route path="/*" element={<ProtectedArea />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
