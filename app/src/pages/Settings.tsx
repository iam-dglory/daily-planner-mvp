import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { FeatureFlag } from '../types'

const FEATURE_LABELS: Record<FeatureFlag, string> = {
  recurring: 'Recurring tasks',
  reminders: 'Reminders (browser notifications)',
  calendar: 'Calendar view',
  categories: 'Lists / categories',
}

const ALL_FEATURES: FeatureFlag[] = ['recurring', 'reminders', 'calendar', 'categories']

export default function Settings() {
  const { profile, refreshProfile, signOut } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!profile) return <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>

  const enabledFeatures = profile.settings?.enabled_features ?? ALL_FEATURES
  const weekStartDay = profile.settings?.week_start_day ?? 1

  async function persistSettings(next: NonNullable<typeof profile>['settings']) {
    if (!profile) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({ settings: next }).eq('id', profile.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function toggleFeature(feature: FeatureFlag) {
    if (!profile) return
    const has = enabledFeatures.includes(feature)
    const next = has ? enabledFeatures.filter((f) => f !== feature) : [...enabledFeatures, feature]
    persistSettings({ ...profile.settings, enabled_features: next })
  }

  function setWeekStart(day: number) {
    if (!profile) return
    persistSettings({ ...profile.settings, week_start_day: day })
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-zinc-800">Settings</h1>

      <div className="mb-5 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium text-zinc-800">{profile.display_name || profile.email}</p>
        <p className="text-xs text-zinc-400">{profile.email}</p>
      </div>

      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Enabled features</h2>
        <p className="mb-2 text-xs text-zinc-400">
          Demonstrates per-tenant configurability — the same codebase can show/hide features per customer via this
          jsonb column, without a redeploy.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-white">
          {ALL_FEATURES.map((feature, i) => (
            <label
              key={feature}
              className={`flex items-center justify-between px-4 py-3 text-sm text-zinc-700 ${
                i > 0 ? 'border-t border-zinc-100' : ''
              }`}
            >
              {FEATURE_LABELS[feature]}
              <input
                type="checkbox"
                checked={enabledFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
                className="h-4 w-4 accent-indigo-500"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Week starts on</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setWeekStart(0)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
              weekStartDay === 0 ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-zinc-200 text-zinc-500'
            }`}
          >
            Sunday
          </button>
          <button
            onClick={() => setWeekStart(1)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
              weekStartDay === 1 ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-zinc-200 text-zinc-500'
            }`}
          >
            Monday
          </button>
        </div>
      </section>

      {(saving || saved) && (
        <p className="mb-4 text-xs text-zinc-400">{saving ? 'Saving…' : 'Saved.'}</p>
      )}

      <button
        onClick={() => signOut()}
        className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-500"
      >
        Sign out
      </button>

      <p className="mt-6 text-center text-[11px] text-zinc-300">
        Reminders are delivered via the browser Notification API only while this tab is open — an MVP limitation.
        A production build would need a server-side scheduler and push service.
      </p>
    </div>
  )
}
