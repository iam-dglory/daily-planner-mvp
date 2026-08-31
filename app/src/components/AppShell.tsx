import { type ReactNode, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../contexts/TasksContext'
import { requestNotificationPermission, startReminderPolling, stopReminderPolling } from '../lib/reminders'
import type { FeatureFlag } from '../types'

interface NavItem {
  to: string
  label: string
  icon: string
  feature: FeatureFlag | null
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Today', icon: '☀️', feature: null },
  { to: '/upcoming', label: 'Upcoming', icon: '📋', feature: null },
  { to: '/calendar', label: 'Calendar', icon: '🗓️', feature: 'calendar' },
  { to: '/categories', label: 'Lists', icon: '🏷️', feature: 'categories' },
  { to: '/settings', label: 'Settings', icon: '⚙️', feature: null },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const { tasks } = useTasks()
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const enabledFeatures = profile?.settings?.enabled_features ?? ['recurring', 'reminders', 'calendar', 'categories']
  const remindersEnabled = enabledFeatures.includes('reminders')

  // Reminders: request permission + start polling once, driven by whether
  // the feature flag is on. See src/lib/reminders.ts for the MVP limitations.
  useEffect(() => {
    if (!remindersEnabled) {
      stopReminderPolling()
      return
    }
    requestNotificationPermission()
    startReminderPolling(() => tasksRef.current)
    return () => stopReminderPolling()
  }, [remindersEnabled])

  const visibleItems = NAV_ITEMS.filter((item) => !item.feature || enabledFeatures.includes(item.feature))

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-zinc-50 shadow-sm">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
              ✓
            </div>
            <span className="text-base font-semibold text-zinc-800">Daily Planner</span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
          >
            Sign out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">{children}</main>

        <nav className="sticky bottom-0 flex border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  isActive ? 'text-indigo-600' : 'text-zinc-400'
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
