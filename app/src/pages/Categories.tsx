import { useMemo, useState } from 'react'
import { useTasks } from '../contexts/TasksContext'
import { PRESET_COLORS } from '../types'
import type { Category, Task } from '../types'
import TaskRow from '../components/TaskRow'
import TaskEditModal from '../components/TaskEditModal'

export default function Categories() {
  const { categories, tasks, createCategory, updateCategory, deleteCategory, toggleTask } = useTasks()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const [editing, setEditing] = useState<Task | null>(null)

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tasks) {
      if (t.category_id) map.set(t.category_id, (map.get(t.category_id) ?? 0) + 1)
    }
    return map
  }, [tasks])

  async function handleAdd() {
    if (!newName.trim()) return
    await createCategory(newName.trim(), newColor)
    setNewName('')
  }

  async function handleRename() {
    if (!renaming || !renaming.name.trim()) return
    await updateCategory(renaming.id, { name: renaming.name.trim() })
    setRenaming(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Tasks in it will become uncategorized.')) return
    await deleteCategory(id)
    if (activeCategory?.id === id) setActiveCategory(null)
  }

  if (activeCategory) {
    const filtered = tasks.filter((t) => t.category_id === activeCategory.id)
    return (
      <div>
        <button onClick={() => setActiveCategory(null)} className="mb-3 text-sm font-medium text-indigo-500">
          ‹ All lists
        </button>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activeCategory.color }} />
          <h1 className="text-xl font-semibold text-zinc-800">{activeCategory.name}</h1>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 py-10 text-center text-sm text-zinc-400">
            No tasks in this list yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                category={activeCategory}
                onToggle={() => toggleTask(task)}
                onOpen={() => setEditing(task)}
              />
            ))}
          </div>
        )}
        {editing && <TaskEditModal task={editing} onClose={() => setEditing(null)} />}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-zinc-800">Lists</h1>

      <div className="mb-5 rounded-xl border border-zinc-200 bg-white p-3">
        <label className="mb-1 block text-xs font-medium text-zinc-500">New list</label>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Work, Personal, Errands"
          className="mb-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <div className="mb-2 flex gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setNewColor(color)}
              className={`h-6 w-6 rounded-full ${newColor === color ? 'ring-2 ring-offset-1 ring-zinc-400' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Add list
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 py-10 text-center text-sm text-zinc-400">
          No lists yet — create one above.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              {renaming?.id === cat.id ? (
                <input
                  autoFocus
                  value={renaming.name}
                  onChange={(e) => setRenaming({ id: cat.id, name: e.target.value })}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-indigo-400"
                />
              ) : (
                <button className="flex-1 text-left text-sm font-medium text-zinc-800" onClick={() => setActiveCategory(cat)}>
                  {cat.name}
                  <span className="ml-2 text-xs text-zinc-400">{countByCategory.get(cat.id) ?? 0} tasks</span>
                </button>
              )}
              <button
                onClick={() => setRenaming({ id: cat.id, name: cat.name })}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
              >
                Rename
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-xs font-medium text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
