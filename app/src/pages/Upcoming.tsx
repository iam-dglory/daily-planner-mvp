import { useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { useTasks } from '../contexts/TasksContext'
import { todayISO } from '../lib/dateHelpers'
import TaskRow from '../components/TaskRow'
import TaskEditModal from '../components/TaskEditModal'
import type { Task } from '../types'

type Bucket = 'Today' | 'Tomorrow' | 'This Week' | 'Later' | 'No date'

function bucketFor(task: Task, today: string, tomorrow: string, weekEnd: string): Bucket {
  if (!task.due_date) return 'No date'
  if (task.due_date === today) return 'Today'
  if (task.due_date === tomorrow) return 'Tomorrow'
  if (task.due_date > today && task.due_date <= weekEnd) return 'This Week'
  return 'Later'
}

const BUCKET_ORDER: Bucket[] = ['Today', 'Tomorrow', 'This Week', 'Later', 'No date']

export default function Upcoming() {
  const { tasks, categories, toggleTask, loading } = useTasks()
  const [editing, setEditing] = useState<Task | null>(null)

  const today = todayISO()
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const grouped = useMemo(() => {
    const upcoming = tasks.filter((t) => !t.is_completed && (!t.due_date || t.due_date >= today))
    const map = new Map<Bucket, Task[]>()
    for (const bucket of BUCKET_ORDER) map.set(bucket, [])
    for (const task of upcoming) {
      const bucket = bucketFor(task, today, tomorrow, weekEnd)
      map.get(bucket)!.push(task)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999') || (a.due_time ?? '').localeCompare(b.due_time ?? ''))
    }
    return map
  }, [tasks, today, tomorrow, weekEnd])

  const hasAny = [...grouped.values()].some((list) => list.length > 0)

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-zinc-800">Upcoming</h1>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>
      ) : !hasAny ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 py-10 text-center text-sm text-zinc-400">
          Nothing coming up.
        </div>
      ) : (
        BUCKET_ORDER.map((bucket) => {
          const list = grouped.get(bucket) ?? []
          if (list.length === 0) return null
          return (
            <div key={bucket} className="mb-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{bucket}</h2>
              <div className="flex flex-col gap-2">
                {list.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    category={task.category_id ? categoryById.get(task.category_id) : undefined}
                    onToggle={() => toggleTask(task)}
                    onOpen={() => setEditing(task)}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}

      {editing && <TaskEditModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
