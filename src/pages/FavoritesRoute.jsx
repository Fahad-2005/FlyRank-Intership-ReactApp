import { useWeatherApp } from '../context/WeatherAppContext'
import FavoritesPage from './FavoritesPage'

export default function FavoritesRoute() {
  const { favorites, loading, favoritesLoading, loadCity, removeFavorite } =
    useWeatherApp()

  return (
    <FavoritesPage
      favorites={favorites}
      loading={loading || favoritesLoading}
      onOpenCity={loadCity}
      onRemoveFavorite={removeFavorite}
    />
  )
}
