import { useWeatherApp } from '../context/WeatherAppContext'
import HomePage from './HomePage'

export default function WeatherRoute() {
  const {
    query,
    setQuery,
    weather,
    loading,
    error,
    favorited,
    handleSearch,
    toggleFavorite,
  } = useWeatherApp()

  return (
    <HomePage
      query={query}
      setQuery={setQuery}
      weather={weather}
      loading={loading}
      error={error}
      onSearch={handleSearch}
      favorited={favorited}
      onToggleFavorite={toggleFavorite}
    />
  )
}
