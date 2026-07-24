const IDEA_CARDS = [
  {
    title: 'Compare cities',
    body: 'Side-by-side temps and rain chance for 2–3 favorites.',
  },
  {
    title: '7-day details',
    body: 'Full daily page with sunrise, sunset, and wind summary.',
  },
  {
    title: 'Alerts',
    body: 'Highlight storm / heavy rain hours for saved cities.',
  },
  {
    title: 'Unit settings',
    body: 'Toggle °C/°F and km/h vs mph in one place.',
  },
  {
    title: 'Recent searches',
    body: 'Quick reopen of the last cities you looked up.',
  },
  {
    title: 'Mongo sync',
    body: 'Persist favorites & history across devices later.',
  },
]

const QUICK_CITIES = ['Lahore', 'London', 'Tokyo', 'Dubai', 'New York']

export default function DiscoverPage({ loading, onOpenCity }) {
  return (
    <section className="space-y-4 rounded-[28px] border border-white/20 bg-black/35 p-5 shadow-2xl backdrop-blur-2xl">
      <div>
        <h2 className="text-2xl font-semibold">What we can add next</h2>
        <p className="mt-1 text-sm text-white/65">
          Ideas for more screens before MongoDB. Pick any later and we’ll build
          it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {IDEA_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            <h3 className="font-semibold">{card.title}</h3>
            <p className="mt-1 text-sm text-white/65">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="text-sm text-white/70">Try a popular city quickly:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              disabled={loading}
              onClick={() => onOpenCity(city)}
              className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
