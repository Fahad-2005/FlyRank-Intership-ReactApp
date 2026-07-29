const STORAGE_KEY = 'weather_client_id'

export function getClientId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return `guest-${Date.now()}`
  }
}
