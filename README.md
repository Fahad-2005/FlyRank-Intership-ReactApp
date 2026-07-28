# Weather Discovery Dashboard

A React weather app where you can search any city, view an AccuWeather-style hourly forecast chart, and save favorite cities to **MongoDB Atlas**.

Live weather data comes from **Open-Meteo** (no API key required). Favorites are stored through a small Express API connected to MongoDB.

---

## Features

- **Weather** — city search, 7-day forecast, hourly Overview chart (temp, precipitation, wind, humidity, cloud cover)
- **Favorites** — save / remove cities; synced with MongoDB so they survive refresh
- **Discover** — profile, unit settings, recent searches, compare cities, weather alerts, quick city chips
- Weather-matched Unsplash backgrounds and glassmorphism UI

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Weather API | [Open-Meteo](https://open-meteo.com/) (Geocoding + Forecast) |
| Lint | Oxlint |

---

## Prerequisites

- Node.js 18+ and npm
- A free [MongoDB Atlas](https://cloud.mongodb.com) account

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd FlyRank-Intership-ReactApp
npm install
```

### 2. Configure MongoDB

1. Create a free **M0** cluster in [MongoDB Atlas](https://cloud.mongodb.com)
2. **Database Access** → create a database user (username + password)
3. **Network Access** → add your current IP, or Allow Access from Anywhere (`0.0.0.0/0`) for local learning
4. **Database → Connect → Drivers** → copy the connection string

Create `server/.env` (you can copy from the example):

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/weather_discovery?retryWrites=true&w=majority
PORT=5000
```

Replace `USERNAME`, `PASSWORD`, and `CLUSTER` with your Atlas values.  
If the password has special characters (`@`, `#`, `%`, …), URL-encode them.

> **Windows tip:** if you see `querySrv ECONNREFUSED`, use Atlas’s **standard** `mongodb://` connection string (with shard hosts) instead of `mongodb+srv://`.

### 3. Run the app (two terminals)

**Terminal 1 — API + MongoDB**

```bash
npm run server
```

You should see:

```text
Connected to MongoDB
API running on http://127.0.0.1:5000
```

**Terminal 2 — React frontend**

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## How to use

1. Open the **Weather** tab and search a city (e.g. Lahore, London)
2. Explore day cards, Chart / List view, and metric tabs
3. Click **Save favorite** to store the city in MongoDB
4. Open the **Favorites** tab to reopen or remove saved cities
5. Use **Discover** for settings, compare, alerts, and recent searches

---

## Project structure

```text
src/
  App.jsx                      # Shell, nav, shared state
  api/favorites.js             # Frontend calls to /api/favorites
  context/SettingsContext.jsx  # Units + profile preferences
  pages/
    HomePage.jsx               # Weather / search / chart / 7-day
    FavoritesPage.jsx          # Saved cities
    DiscoverPage.jsx           # Discover tools hub
  components/
    HourlyChart.jsx
    SevenDayForecast.jsx
    CompareCitiesPanel.jsx
    WeatherAlertsPanel.jsx
    UnitSettingsPanel.jsx
    RecentSearchesPanel.jsx
    UserProfilePanel.jsx
    WeatherIcon.jsx
  utils/
    weather.js                 # Open-Meteo helpers
    units.js                   # °C/°F, km/h/mph
    alerts.js                  # Storm / rain alerts
    recentSearches.js          # localStorage recent cities
server/
  index.js                     # Express API
  models/Favorite.js           # Mongoose schema
  .env.example                 # Env template (no secrets)
```

Vite proxies `/api` → `http://127.0.0.1:5000` during development.

---

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/favorites` | List saved cities |
| `POST` | `/api/favorites` | Save a city |
| `DELETE` | `/api/favorites/:id` | Remove a city |

---

## Discover features

The **Discover** tab includes:

- **Profile** — set a display name (saved on device)
- **Unit settings** — °C/°F and km/h/mph across the app
- **Recent searches** — quick reopen of last cities searched
- **Compare cities** — side-by-side live stats for 2–3 favorites
- **Weather alerts** — storm / heavy-rain warnings for saved cities (next 24h)
- **7-day forecast** — full daily breakdown on the Weather tab (sunrise, sunset, wind)

---

## Future ideas

- Full user login with per-account MongoDB data
- Push notifications for severe weather
- Compare more than 3 cities at once

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite frontend |
| `npm run server` | Start Express API (watches for changes) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint |

---

## Notes

- Never commit `server/.env` — it is gitignored
- Share only `server/.env.example` with placeholders
- Weather data does not need an API key (Open-Meteo)
