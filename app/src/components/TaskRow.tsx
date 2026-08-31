import type { Category, Task } from '../types'
import { formatTimePretty } from '../lib/dateHelpers'

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
}

export default function TaskRow({
  task,
  category,
  onToggle,
  onOpen,
}: {
  task: Task
  category: Category | undefined
  onToggle: () => void
  onOpen: () => void
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition ${
        task.is_completed ? 'opacity-50' : ''
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.is_completed ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-zinc-300'
        }`}
        aria-label={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.is_completed && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
            title={`${task.priority} priority`}
          />
          <span className={`truncate text-sm font-medium text-zinc-800 ${task.is_completed ? 'line-through' : ''}`}>
            {task.title}
          </span>
          {task.recurrence_freq !== 'none' && (
            <span title={`Repeats ${task.recurrence_freq}`} className="shrink-0 text-xs text-zinc-400">
              🔁
            </span>
          )}
        </div>

        {task.notes && <p className="line-clamp-1 mt-0.5 text-xs text-zinc-400">{task.notes}</p>}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {category && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          {task.due_time && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
              {formatTimePretty(task.due_time)}
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
