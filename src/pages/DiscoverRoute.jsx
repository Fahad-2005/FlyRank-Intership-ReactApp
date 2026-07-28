import { useWeatherApp } from '../context/WeatherAppContext'
import DiscoverPage from './DiscoverPage'

export default function DiscoverRoute() {
  const {
    loading,
    favorites,
    recentSearches,
    loadCity,
    handleClearRecent,
  } = useWeatherApp()

  return (
    <DiscoverPage
      loading={loading}
      favorites={favorites}
      recentSearches={recentSearches}
      onOpenCity={loadCity}
      onClearRecent={handleClearRecent}
    />
  )
}
