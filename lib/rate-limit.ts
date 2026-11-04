type Entry = { startedAt: number; count: number }

const windowMs = 60_000
const maxEntries = 10_000
const clients = new Map<string, Entry>()

export function checkRateLimit(key: string, isOrganization: boolean) {
  const now = Date.now()
  const limit = isOrganization ? 3 : 30
  let entry = clients.get(key)

  if (!entry || now - entry.startedAt >= windowMs) {
    if (!entry && clients.size >= maxEntries) {
      const oldest = clients.keys().next().value
      if (oldest) clients.delete(oldest)
    }
    entry = { startedAt: now, count: 0 }
    clients.set(key, entry)
  }

  entry.count += 1
  if (entry.count % 100 === 0) {
    for (const [client, value] of clients) {
      if (now - value.startedAt >= windowMs) clients.delete(client)
    }
  }

  return entry.count <= limit
    ? 0
    : Math.max(1, Math.ceil((entry.startedAt + windowMs - now) / 1000))
}
