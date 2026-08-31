import { useMemo, useState } from 'react'
import { useTasks } from '../contexts/TasksContext'
import { todayISO } from '../lib/dateHelpers'
import TaskRow from '../components/TaskRow'
import QuickAdd from '../components/QuickAdd'
import TaskEditModal from '../components/TaskEditModal'
import type { Task } from '../types'

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 }

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (p !== 0) return p
    if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time)
    if (a.due_time) return -1
    if (b.due_time) return 1
    return 0
  })
}

export default function Today() {
  const { tasks, categories, toggleTask, loading } = useTasks()
  const [editing, setEditing] = useState<Task | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const today = todayISO()
  const todaysTasks = useMemo(() => tasks.filter((t) => t.due_date === today), [tasks, today])
  const pending = useMemo(() => sortTasks(todaysTasks.filter((t) => !t.is_completed)), [todaysTasks])
  const completed = useMemo(() => sortTasks(todaysTasks.filter((t) => t.is_completed)), [todaysTasks])

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-zinc-800">Today</h1>
      <p className="mb-4 text-sm text-zinc-400">
        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      <QuickAdd />

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>
      ) : pending.length === 0 && completed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 py-10 text-center text-sm text-zinc-400">
          No tasks yet — add one above.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              category={task.category_id ? categoryById.get(task.category_id) : undefined}
              onToggle={() => toggleTask(task)}
              onOpen={() => setEditing(task)}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="mb-2 flex items-center gap-1 text-xs font-medium text-zinc-400"
          >
            <span>{showCompleted ? '▾' : '▸'}</span>
            Completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="flex flex-col gap-2">
              {completed.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  category={task.category_id ? categoryById.get(task.category_id) : undefined}
                  onToggle={() => toggleTask(task)}
                  onOpen={() => setEditing(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {editing && <TaskEditModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
