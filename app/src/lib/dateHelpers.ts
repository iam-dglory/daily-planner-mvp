import { format } from 'date-fns'

/** Today's date as YYYY-MM-DD in the local timezone (matches Postgres `date` columns). */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Format a YYYY-MM-DD date string for display, e.g. "Mon, 3 Feb". */
export function formatDatePretty(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'EEE, d MMM')
}

/** Format a HH:MM:SS time string for display, e.g. "9:30 AM". */
export function formatTimePretty(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, h, m)
  return format(date, 'h:mm a')
}
