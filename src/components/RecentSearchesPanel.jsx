export default function RecentSearchesPanel({
  recentSearches,
  loading,
  onOpenCity,
  onClear,
}) {
  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Recent searches</h3>
          <p className="mt-1 text-sm text-white/65">
            Quickly reopen cities you searched recently.
          </p>
        </div>
        {recentSearches.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-white/55 hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </div>

      {recentSearches.length === 0 ? (
        <p className="mt-4 text-sm text-white/55">No recent searches yet.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {recentSearches.map((item) => (
            <button
              key={`${item.city}-${item.country}-${item.searchedAt}`}
              type="button"
              disabled={loading}
              onClick={() => onOpenCity(item.city)}
              className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
