import { useEffect, useState } from 'react'
import { apiUrl } from '../api/config'
import { getHealth } from '../api/favorites'

export default function HealthPage() {
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [fetchedAt, setFetchedAt] = useState(null)

  async function loadHealth() {
    setStatus('loading')
    setError('')
    try {
      const result = await getHealth()
      setData(result)
      setFetchedAt(new Date().toISOString())
      setStatus('ok')
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : 'Health check failed')
      setFetchedAt(new Date().toISOString())
      setStatus('error')
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
      <div>
        <h2 className="text-2xl font-semibold">Health check</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Fetches live data from the API to confirm the app and backend are
          reachable (FE-04 deliverable).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            status === 'ok'
              ? 'bg-emerald-500/20 text-emerald-100'
              : status === 'error'
                ? 'bg-rose-500/20 text-rose-100'
                : 'bg-white/10 text-white/70'
          }`}
        >
          {status === 'loading' && 'Checking…'}
          {status === 'ok' && 'API healthy'}
          {status === 'error' && 'API unreachable'}
        </span>
        <button
          type="button"
          onClick={loadHealth}
          className="rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-slate-900"
        >
          Refresh
        </button>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <dt className="text-white/55">Endpoint</dt>
          <dd className="mt-1 break-all font-mono text-xs sm:text-sm">
            {apiUrl('/api/health') || '/api/health'}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <dt className="text-white/55">Fetched at</dt>
          <dd className="mt-1 font-mono text-xs sm:text-sm">
            {fetchedAt ?? '—'}
          </dd>
        </div>
      </dl>

      {error ? (
        <p className="rounded-2xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
          {error}
          <span className="mt-1 block text-rose-100/70">
            Locally: run <code className="font-mono">npm run server</code>. On
            Vercel: set <code className="font-mono">VITE_API_URL</code> to your
            API host.
          </span>
        </p>
      ) : null}

      {data ? (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="mb-2 text-sm text-white/60">Fetched response</p>
          <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 text-xs text-emerald-100 sm:text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
