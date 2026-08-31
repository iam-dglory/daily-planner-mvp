import { useState } from 'react'
import { useTasks } from '../contexts/TasksContext'
import { PRESET_COLORS, REMINDER_OPTIONS, type Priority, type RecurrenceFreq, type Task } from '../types'

export default function TaskEditModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { categories, updateTask, deleteTask, createCategory } = useTasks()

  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [dueTime, setDueTime] = useState(task.due_time ? task.due_time.slice(0, 5) : '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [categoryId, setCategoryId] = useState<string>(task.category_id ?? '')
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq>(task.recurrence_freq)
  const [recurrenceInterval, setRecurrenceInterval] = useState(task.recurrence_interval || 1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(task.recurrence_end_date ?? '')
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(task.reminder_minutes_before)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0])
  const [showNewCategory, setShowNewCategory] = useState(false)

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = await updateTask(task.id, {
      title: title.trim(),
      notes: notes.trim() || null,
      due_date: dueDate || null,
      due_time: dueTime ? `${dueTime}:00` : null,
      priority,
      category_id: categoryId || null,
      recurrence_freq: recurrenceFreq,
      recurrence_interval: recurrenceInterval,
      recurrence_end_date: recurrenceFreq !== 'none' ? recurrenceEndDate || null : null,
      // Resetting recurrence to 'none' clears any byweekday config from before.
      recurrence_byweekday: recurrenceFreq === 'weekly' ? task.recurrence_byweekday : null,
      reminder_minutes_before: reminderMinutes,
    })
    setSaving(false)
    if (error) {
      setError(error)
      return
    }
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Delete this task? This cannot be undone.')) return
    setSaving(true)
    const { error } = await deleteTask(task.id)
    setSaving(false)
    if (error) {
      setError(error)
      return
    }
    onClose()
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    const { error } = await createCategory(newCategoryName.trim(), newCategoryColor)
    if (!error) {
      setNewCategoryName('')
      setShowNewCategory(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800">Edit task</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500">Due time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${
                    priority === p
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                      : 'border-zinc-200 text-zinc-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  categoryId === '' ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-zinc-200 text-zinc-500'
                }`}
              >
                None
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    categoryId === c.id ? 'text-white' : 'border-zinc-200 text-zinc-500'
                  }`}
                  style={categoryId === c.id ? { backgroundColor: c.color, borderColor: c.color } : undefined}
                >
                  {c.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewCategory((v) => !v)}
                className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-400"
              >
                + New
              </button>
            </div>

            {showNewCategory && (
              <div className="mt-2 rounded-lg border border-zinc-200 p-3">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="mb-2 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
                />
                <div className="mb-2 flex gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategoryColor(color)}
                      className={`h-6 w-6 rounded-full ${newCategoryColor === color ? 'ring-2 ring-offset-1 ring-zinc-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Add category
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Repeat</label>
            <select
              value={recurrenceFreq}
              onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFreq)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {recurrenceFreq !== 'none' && (
              <div className="mt-2 flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Every</label>
                  <input
                    type="number"
                    min={1}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Ends (optional)</label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Remind me</label>
            <select
              value={reminderMinutes ?? ''}
              onChange={(e) => setReminderMinutes(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-zinc-400">
              Requires due date + time, and browser notification permission. Only fires while this tab is open.
            </p>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
