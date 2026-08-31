import { supabase } from './supabase'
import type { Task } from '../types'

/**
 * MVP reminders: in-tab only, via the browser Notification API.
 *
 * KNOWN LIMITATION: this only fires while the app tab is open in the
 * foreground browser — there is no service worker / push subscription and
 * no server-side scheduler. A production version of this feature would need
 * a backend job (e.g. a Supabase Edge Function on a cron schedule) that
 * queries due reminders and delivers them via Web Push, so users get
 * notified even when the tab/app is closed.
 */

let intervalHandle: ReturnType<typeof setInterval> | null = null

export function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

/** Starts a polling loop that checks for due reminders every `intervalMs`. */
export function startReminderPolling(getTasks: () => Task[], intervalMs = 30_000) {
  stopReminderPolling()
  intervalHandle = setInterval(() => checkReminders(getTasks()), intervalMs)
  // Run once immediately too, so a reminder due right at load isn't missed
  // until the first interval tick.
  checkReminders(getTasks())
}

export function stopReminderPolling() {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
}

async function checkReminders(tasks: Task[]) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  const now = new Date()

  for (const task of tasks) {
    if (task.is_completed) continue
    if (task.reminder_sent_at) continue
    if (task.reminder_minutes_before == null) continue
    if (!task.due_date || !task.due_time) continue

    const [h, m] = task.due_time.split(':').map(Number)
    const [y, mo, d] = task.due_date.split('-').map(Number)
    const dueAt = new Date(y, mo - 1, d, h, m)
    const remindAt = new Date(dueAt.getTime() - task.reminder_minutes_before * 60_000)

    if (now >= remindAt) {
      try {
        new Notification('Daily Planner', {
          body: `${task.title} — due ${task.due_time.slice(0, 5)}`,
          tag: task.id,
        })
      } catch {
        // Notification construction can throw in some contexts (e.g. no
        // permission after all); swallow it and still mark as sent below so
        // we don't loop forever trying.
      }
      // Mark as sent so this reminder doesn't fire again on the next poll.
      await supabase.from('tasks').update({ reminder_sent_at: new Date().toISOString() }).eq('id', task.id)
    }
  }
}
