import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WeatherAppProvider } from './context/WeatherAppContext'
import RootLayout from './layout/RootLayout'
import DiscoverRoute from './pages/DiscoverRoute'
import FavoritesRoute from './pages/FavoritesRoute'
import HealthPage from './pages/HealthPage'
import WeatherRoute from './pages/WeatherRoute'

function App() {
  return (
    <BrowserRouter>
      <WeatherAppProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<WeatherRoute />} />
            <Route path="favorites" element={<FavoritesRoute />} />
            <Route path="discover" element={<DiscoverRoute />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </WeatherAppProvider>
    </BrowserRouter>
  )
}

export default App
