import { type FormEvent, useState } from 'react'
import { useTasks } from '../contexts/TasksContext'
import { todayISO } from '../lib/dateHelpers'

/** Quick-add bar: title only, defaults due_date to today. Full editing happens in the task modal. */
export default function QuickAdd() {
  const { createTask } = useTasks()
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setSubmitting(true)
    await createTask({ title: trimmed, due_date: todayISO() })
    setSubmitting(false)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task for today…"
        className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
      />
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-lg font-semibold text-white disabled:opacity-40"
        aria-label="Add task"
      >
        +
      </button>
    </form>
  )
}
