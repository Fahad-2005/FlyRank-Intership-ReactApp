import { useSettings } from '../context/SettingsContext'

export default function UnitSettingsPanel() {
  const { tempUnit, speedUnit, setTempUnit, setSpeedUnit } = useSettings()

  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <h3 className="font-semibold">Unit settings</h3>
      <p className="mt-1 text-sm text-white/65">
        Choose how temperature and wind speed are shown across the app.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-white/70">Temperature</p>
          <div className="flex overflow-hidden rounded-full border border-white/15 bg-black/25 p-1">
            {['C', 'F'].map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setTempUnit(unit)}
                className={`flex-1 rounded-full py-1.5 text-sm transition ${
                  tempUnit === unit
                    ? 'bg-[#f0c35a] font-semibold text-[#1a1a1a]'
                    : 'text-white/75 hover:bg-white/10'
                }`}
              >
                °{unit}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-white/70">Wind speed</p>
          <div className="flex overflow-hidden rounded-full border border-white/15 bg-black/25 p-1">
            {[
              { id: 'kmh', label: 'km/h' },
              { id: 'mph', label: 'mph' },
            ].map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSpeedUnit(unit.id)}
                className={`flex-1 rounded-full py-1.5 text-sm transition ${
                  speedUnit === unit.id
                    ? 'bg-[#f0c35a] font-semibold text-[#1a1a1a]'
                    : 'text-white/75 hover:bg-white/10'
                }`}
              >
                {unit.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
