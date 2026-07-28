// Safely turns any RTK Query / fetch error into a display string.
// FastAPI validation errors (HTTP 422) return `detail` as an ARRAY of objects,
// so rendering it directly crashes React ("Objects are not valid as a child").
export function getErrorMessage(err: unknown, fallback = 'Что-то пошло не так'): string {
  const data = (err as { data?: unknown })?.data
  const detail = (data as { detail?: unknown })?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (d as { msg?: string })?.msg)
      .filter((m): m is string => typeof m === 'string')
    if (msgs.length) return msgs.join('; ')
  }
  if (typeof data === 'string') return data
  const message = (err as { message?: string })?.message
  if (typeof message === 'string') return message
  return fallback
}
