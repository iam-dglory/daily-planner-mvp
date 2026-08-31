import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../contexts/TasksContext'
import { todayISO } from '../lib/dateHelpers'
import TaskRow from '../components/TaskRow'
import TaskEditModal from '../components/TaskEditModal'
import type { Task } from '../types'

const WEEKDAY_LABELS_MON_START = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_LABELS_SUN_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const { profile } = useAuth()
  const { tasks, categories, toggleTask } = useTasks()
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [editing, setEditing] = useState<Task | null>(null)

  const weekStartDay = profile?.settings?.week_start_day ?? 1 // 0 = Sunday, 1 = Monday
  const weekdayLabels = weekStartDay === 0 ? WEEKDAY_LABELS_SUN_START : WEEKDAY_LABELS_MON_START

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const taskCountByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tasks) {
      if (!t.due_date) continue
      map.set(t.due_date, (map.get(t.due_date) ?? 0) + 1)
    }
    return map
  }, [tasks])

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(cursor)
    const monthEnd = endOfMonth(cursor)

    // Days from the previous month needed to pad the first row to the configured week-start day.
    const firstDow = monthStart.getDay() // 0=Sun..6=Sat
    const leadingCount = weekStartDay === 0 ? firstDow : (firstDow + 6) % 7
    const gridStart = new Date(monthStart)
    gridStart.setDate(gridStart.getDate() - leadingCount)

    const days = eachDayOfInterval({ start: gridStart, end: monthEnd })
    // Pad the end to a full multiple of 7 (max 6 rows of 7 = 42 cells).
    while (days.length % 7 !== 0 || days.length < 42) {
      const next = new Date(days[days.length - 1])
      next.setDate(next.getDate() + 1)
      days.push(next)
      if (days.length >= 42) break
    }
    return days.slice(0, 42)
  }, [cursor, weekStartDay])

  const selectedTasks = useMemo(
    () => tasks.filter((t) => t.due_date === selectedDate).sort((a, b) => (a.due_time ?? '').localeCompare(b.due_time ?? '')),
    [tasks, selectedDate]
  )

  const today = todayISO()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-800">{format(cursor, 'MMMM yyyy')}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor((c) => subMonths(c, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() => {
              setCursor(new Date())
              setSelectedDate(todayISO())
            }}
            className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-500"
          >
            Today
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-zinc-400">
        {weekdayLabels.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {gridDays.map((day) => {
          const iso = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, cursor)
          const count = taskCountByDate.get(iso) ?? 0
          const isToday = iso === today
          const isSelected = iso === selectedDate
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${
                isSelected
                  ? 'bg-indigo-500 text-white'
                  : isToday
                    ? 'bg-indigo-50 text-indigo-600'
                    : inMonth
                      ? 'text-zinc-700 hover:bg-zinc-100'
                      : 'text-zinc-300'
              }`}
            >
              <span>{day.getDate()}</span>
              {count > 0 && (
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">
          {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}
        </h2>
        {selectedTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 py-8 text-center text-sm text-zinc-400">
            No tasks on this day.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedTasks.map((task) => (
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

      {editing && <TaskEditModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
