import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signUp(email, password, displayName)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    // If email confirmation is required by the Supabase auth settings,
    // signUp succeeds but returns no active session yet.
    const { data } = await supabase.auth.getSession()
    if (!data.session) setNeedsConfirmation(true)
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-center shadow-sm">
          <div className="mb-3 text-3xl">📬</div>
          <h1 className="mb-1 text-lg font-semibold text-zinc-800">Check your email</h1>
          <p className="text-sm text-zinc-400">
            We sent a confirmation link to <span className="font-medium text-zinc-600">{email}</span>. Confirm
            your address, then log in.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-xl font-bold text-white">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-zinc-800">Create your account</h1>
          <p className="text-sm text-zinc-400">Start planning your day</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Display name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
