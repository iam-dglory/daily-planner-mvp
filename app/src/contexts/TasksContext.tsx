import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Category, Task } from '../types'

interface TasksContextValue {
  tasks: Task[]
  categories: Category[]
  loading: boolean
  refresh: () => Promise<void>
  createTask: (fields: Partial<Task> & { title: string }) => Promise<{ error: string | null }>
  updateTask: (id: string, fields: Partial<Task>) => Promise<{ error: string | null }>
  deleteTask: (id: string) => Promise<{ error: string | null }>
  completeTask: (task: Task) => Promise<{ error: string | null }>
  toggleTask: (task: Task) => Promise<{ error: string | null }>
  createCategory: (name: string, color: string) => Promise<{ error: string | null }>
  updateCategory: (id: string, fields: Partial<Category>) => Promise<{ error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setTasks([])
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const [tasksRes, categoriesRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .order('due_time', { ascending: true }),
      supabase.from('categories').select('*').eq('user_id', user.id).order('sort_order', { ascending: true }),
    ])
    if (!tasksRes.error && tasksRes.data) setTasks(tasksRes.data as Task[])
    if (!categoriesRes.error && categoriesRes.data) setCategories(categoriesRes.data as Category[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createTask(fields: Partial<Task> & { title: string }) {
    if (!user) return { error: 'Not signed in' }
    const { error } = await supabase.from('tasks').insert({ ...fields, user_id: user.id })
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function updateTask(id: string, fields: Partial<Task>) {
    const { error } = await supabase.from('tasks').update(fields).eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  /**
   * Marking a recurring task complete triggers a DB-side trigger that
   * inserts the next occurrence automatically (see recurrence_freq /
   * recurring_parent_id on the tasks table). We only need to flip
   * is_completed + stamp completed_at, then refresh so the new row shows up.
   */
  async function completeTask(task: Task) {
    return updateTask(task.id, { is_completed: true, completed_at: new Date().toISOString() })
  }

  /** Toggles completion state — un-completing simply clears the flag (does not undo a generated recurrence). */
  async function toggleTask(task: Task) {
    if (task.is_completed) {
      return updateTask(task.id, { is_completed: false, completed_at: null })
    }
    return completeTask(task)
  }

  async function createCategory(name: string, color: string) {
    if (!user) return { error: 'Not signed in' }
    const { error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color, sort_order: categories.length })
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function updateCategory(id: string, fields: Partial<Category>) {
    const { error } = await supabase.from('categories').update(fields).eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  const value: TasksContextValue = {
    tasks,
    categories,
    loading,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    toggleTask,
    createCategory,
    updateCategory,
    deleteCategory,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider')
  return ctx
}
