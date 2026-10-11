// All dates are local calendar days as 'YYYY-MM-DD'. The client decides what "today" is.

export function toIsoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayLocal = () => toIsoDate(new Date())

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

/** Parse 'YYYY-MM-DD' as a local Date (not UTC). */
export function fromIsoDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/** "Saturday, October 11" */
export const headingDate = (iso: string) =>
  fromIsoDate(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

/** "Oct 11" — top-bar label for past days */
export const shortDate = (iso: string) =>
  fromIsoDate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** "7:42 AM" */
export const clockTime = (isoTimestamp: string) =>
  new Date(isoTimestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
