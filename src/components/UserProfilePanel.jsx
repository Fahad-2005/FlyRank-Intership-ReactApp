import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export default function UserProfilePanel() {
  const { displayName, setDisplayName } = useSettings()
  const [draft, setDraft] = useState(displayName)

  useEffect(() => {
    setDraft(displayName)
  }, [displayName])

  function handleSave(event) {
    event.preventDefault()
    setDisplayName(draft.trim())
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <h3 className="font-semibold">Your profile</h3>
      <p className="mt-1 text-sm text-white/65">
        Set a display name for a personal greeting. Saved on this device.
      </p>

      <form onSubmit={handleSave} className="mt-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Your name"
          className="flex-1 rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm outline-none focus:border-[#f0c35a]/50"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#f0c35a] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
        >
          Save
        </button>
      </form>

      {displayName ? (
        <p className="mt-3 text-sm text-white/70">
          Hello, <span className="font-medium text-white">{displayName}</span> 👋
        </p>
      ) : null}
    </section>
  )
}
